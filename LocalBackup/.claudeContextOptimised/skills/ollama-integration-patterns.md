# Ollama Integration Patterns Implementation

## Overview

This skill provides production-ready Ollama integration patterns for the AIGO-Syndicate construction intelligence system. It includes model management, prompt engineering, streaming responses, load balancing across models, and comprehensive error handling with fallback strategies.

## Core Implementation

### Ollama Service Manager

```javascript
// ollama-service-manager.js
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import pTimeout from 'p-timeout';
import pRetry from 'p-retry';
import { RateLimiter } from 'limiter';

export class OllamaServiceManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Ollama configuration
            baseUrl: config.baseUrl || 'http://localhost:11434',
            models: config.models || {
                primary: 'qwen2.5:72b-instruct-fp16',
                fast: 'mistral:7b-instruct-fp16',
                vision: 'llava:34b',
                mathematical: 'phi3:14b',
                backup: 'llama3.3:70b'
            },
            
            // Timeouts and retries
            defaultTimeout: config.defaultTimeout || 30000,
            streamTimeout: config.streamTimeout || 120000,
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
            
            // Load balancing
            loadBalancingStrategy: config.loadBalancingStrategy || 'adaptive',
            maxConcurrentRequests: config.maxConcurrentRequests || 10,
            modelWeights: config.modelWeights || {
                primary: 1.0,
                fast: 0.7,
                vision: 0.8,
                mathematical: 0.6,
                backup: 0.5
            },
            
            // Performance
            enableCaching: config.enableCaching !== false,
            cacheSize: config.cacheSize || 1000,
            cacheTTL: config.cacheTTL || 3600000, // 1 hour
            
            // Health monitoring
            healthCheckInterval: config.healthCheckInterval || 30000,
            modelWarmupEnabled: config.modelWarmupEnabled !== false,
            
            ...config
        };
        
        this.dbPool = null;
        this.modelStats = new Map();
        this.requestQueue = [];
        this.activeRequests = new Map();
        this.responseCache = new Map();
        this.modelHealth = new Map();
        this.rateLimiters = new Map();
        
        // Metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            timeouts: 0,
            cacheHits: 0,
            averageLatency: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Check Ollama service
            await this.checkOllamaService();
            
            // Initialize models
            await this.initializeModels();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            // Warm up models if enabled
            if (this.config.modelWarmupEnabled) {
                await this.warmupModels();
            }
            
            this.emit('initialized');
            console.log('Ollama Service Manager initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
            application_name: 'ollama_service'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Prompt templates
            await client.query(`
                CREATE TABLE IF NOT EXISTS ollama_prompts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(200) UNIQUE NOT NULL,
                    template TEXT NOT NULL,
                    model_type VARCHAR(50),
                    parameters JSONB DEFAULT '{}'::jsonb,
                    success_rate FLOAT DEFAULT 0,
                    average_quality FLOAT DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_prompts_name 
                ON ollama_prompts(name);
            `);
            
            // Model performance history
            await client.query(`
                CREATE TABLE IF NOT EXISTS ollama_performance (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    model_name VARCHAR(100) NOT NULL,
                    request_type VARCHAR(50) NOT NULL,
                    latency_ms INTEGER NOT NULL,
                    tokens_generated INTEGER,
                    success BOOLEAN NOT NULL,
                    error_type VARCHAR(100),
                    prompt_hash VARCHAR(64),
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_performance_model 
                ON ollama_performance(model_name, created_at DESC);
            `);
            
            // Response cache (for expensive queries)
            await client.query(`
                CREATE TABLE IF NOT EXISTS ollama_cache (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    prompt_hash VARCHAR(64) UNIQUE NOT NULL,
                    model_name VARCHAR(100) NOT NULL,
                    response TEXT NOT NULL,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    expires_at TIMESTAMPTZ NOT NULL
                );
                
                CREATE INDEX IF NOT EXISTS idx_cache_hash 
                ON ollama_cache(prompt_hash);
                
                CREATE INDEX IF NOT EXISTS idx_cache_expires 
                ON ollama_cache(expires_at);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Service Management
    
    async checkOllamaService() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/version`);
            const version = await response.json();
            console.log('Ollama version:', version);
            return true;
        } catch (error) {
            console.error('Ollama service not available:', error.message);
            
            // Try to start Ollama
            if (this.config.autoStart) {
                return this.startOllamaService();
            }
            
            throw new Error('Ollama service not available');
        }
    }
    
    async startOllamaService() {
        console.log('Starting Ollama service...');
        
        return new Promise((resolve, reject) => {
            const ollama = spawn('ollama', ['serve'], {
                detached: true,
                stdio: 'ignore'
            });
            
            ollama.on('error', reject);
            
            // Wait for service to be ready
            setTimeout(async () => {
                try {
                    await this.checkOllamaService();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            }, 5000);
        });
    }
    
    // Model Management
    
    async initializeModels() {
        const availableModels = await this.listModels();
        
        for (const [role, modelName] of Object.entries(this.config.models)) {
            if (!availableModels.includes(modelName)) {
                console.warn(`Model ${modelName} for role ${role} not available`);
                
                // Try to pull model
                if (this.config.autoPull) {
                    await this.pullModel(modelName);
                }
            }
            
            // Initialize model stats
            this.modelStats.set(modelName, {
                requests: 0,
                successes: 0,
                failures: 0,
                totalLatency: 0,
                averageLatency: 0,
                lastUsed: null
            });
            
            // Initialize rate limiter
            const rateLimit = this.config.modelRateLimits?.[role] || 100;
            this.rateLimiters.set(modelName, new RateLimiter(rateLimit, 'minute'));
        }
    }
    
    async listModels() {
        try {
            const response = await fetch(`${this.config.baseUrl}/api/tags`);
            const data = await response.json();
            return data.models.map(m => m.name);
        } catch (error) {
            this.handleError('list_models', error);
            return [];
        }
    }
    
    async pullModel(modelName) {
        console.log(`Pulling model: ${modelName}`);
        
        try {
            const response = await fetch(`${this.config.baseUrl}/api/pull`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: modelName })
            });
            
            // Stream progress
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(l => l.trim());
                
                for (const line of lines) {
                    try {
                        const progress = JSON.parse(line);
                        this.emit('model_pull_progress', {
                            model: modelName,
                            ...progress
                        });
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
            
            console.log(`Model ${modelName} pulled successfully`);
            
        } catch (error) {
            this.handleError('pull_model', error);
            throw error;
        }
    }
    
    // Prompt Engineering
    
    async loadPromptTemplate(name) {
        // Check cache first
        const cacheKey = `prompt:${name}`;
        if (this.responseCache.has(cacheKey)) {
            return this.responseCache.get(cacheKey);
        }
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM ollama_prompts
                WHERE name = $1
            `, [name]);
            
            if (result.rows.length === 0) {
                throw new Error(`Prompt template '${name}' not found`);
            }
            
            const template = result.rows[0];
            
            // Cache template
            this.responseCache.set(cacheKey, template);
            
            return template;
            
        } finally {
            client.release();
        }
    }
    
    async savePromptTemplate(name, template, modelType = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO ollama_prompts (name, template, model_type, parameters)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (name) DO UPDATE SET
                    template = EXCLUDED.template,
                    model_type = EXCLUDED.model_type,
                    parameters = EXCLUDED.parameters,
                    updated_at = NOW()
            `, [name, template.template, modelType, JSON.stringify(template.parameters || {})]);
            
            // Clear cache
            this.responseCache.delete(`prompt:${name}`);
            
        } finally {
            client.release();
        }
    }
    
    formatPrompt(template, variables) {
        let formatted = template;
        
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            formatted = formatted.replace(regex, value);
        }
        
        return formatted;
    }
    
    // Request Handling
    
    async generate(prompt, options = {}) {
        const requestId = uuidv4();
        const startTime = Date.now();
        
        this.metrics.totalRequests++;
        
        try {
            // Check cache if enabled
            if (this.config.enableCaching && !options.noCache) {
                const cached = await this.checkCache(prompt, options.model);
                if (cached) {
                    this.metrics.cacheHits++;
                    return cached;
                }
            }
            
            // Select model
            const model = await this.selectModel(options);
            
            // Rate limiting
            await this.checkRateLimit(model);
            
            // Add to active requests
            this.activeRequests.set(requestId, {
                model,
                startTime,
                prompt
            });
            
            // Prepare request
            const requestBody = {
                model,
                prompt,
                stream: options.stream || false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.topP || 0.9,
                    top_k: options.topK || 40,
                    repeat_penalty: options.repeatPenalty || 1.1,
                    seed: options.seed,
                    num_predict: options.maxTokens || 2048,
                    ...options.modelOptions
                }
            };
            
            // Make request with timeout and retry
            const response = await pRetry(
                () => pTimeout(
                    this.makeRequest(requestBody, options),
                    options.timeout || this.config.defaultTimeout
                ),
                {
                    retries: options.retries || this.config.maxRetries,
                    onFailedAttempt: error => {
                        console.warn(`Attempt ${error.attemptNumber} failed:`, error.message);
                        this.emit('retry_attempt', {
                            requestId,
                            attempt: error.attemptNumber,
                            error: error.message
                        });
                    }
                }
            );
            
            // Update metrics
            const latency = Date.now() - startTime;
            this.updateModelStats(model, true, latency);
            this.metrics.successfulRequests++;
            
            // Cache response if applicable
            if (this.config.enableCaching && !options.noCache && !options.stream) {
                await this.cacheResponse(prompt, model, response);
            }
            
            // Record performance
            await this.recordPerformance(model, 'generate', latency, true);
            
            return response;
            
        } catch (error) {
            const latency = Date.now() - startTime;
            const model = this.activeRequests.get(requestId)?.model;
            
            if (model) {
                this.updateModelStats(model, false, latency);
            }
            
            this.metrics.failedRequests++;
            
            if (error.name === 'TimeoutError') {
                this.metrics.timeouts++;
            }
            
            await this.recordPerformance(
                model || 'unknown',
                'generate',
                latency,
                false,
                error.name
            );
            
            // Try fallback
            if (options.fallback && !options._isFallback) {
                console.log('Trying fallback model...');
                return this.generate(prompt, {
                    ...options,
                    model: this.config.models.backup,
                    _isFallback: true
                });
            }
            
            throw error;
            
        } finally {
            this.activeRequests.delete(requestId);
        }
    }
    
    async makeRequest(requestBody, options) {
        const endpoint = options.stream ? '/api/generate' : '/api/generate';
        
        const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Ollama error: ${error}`);
        }
        
        if (options.stream) {
            return this.handleStreamResponse(response, options);
        } else {
            const data = await response.json();
            return data.response;
        }
    }
    
    async *handleStreamResponse(response, options) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                    if (!line.trim()) continue;
                    
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.response) {
                            yield data.response;
                        }
                        
                        if (data.done) {
                            // Final statistics
                            this.emit('stream_complete', {
                                model: data.model,
                                totalDuration: data.total_duration,
                                loadDuration: data.load_duration,
                                evalCount: data.eval_count
                            });
                        }
                    } catch (e) {
                        console.error('Stream parse error:', e);
                    }
                }
                
                // Progress callback
                if (options.onProgress) {
                    options.onProgress({ streaming: true });
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
    
    // Model Selection and Load Balancing
    
    async selectModel(options) {
        if (options.model) {
            // Specific model requested
            return options.model;
        }
        
        // Determine model based on task type
        if (options.vision) {
            return this.config.models.vision;
        }
        
        if (options.mathematical || options.reasoning === 'mathematical') {
            return this.config.models.mathematical;
        }
        
        if (options.fast || options.maxTokens < 500) {
            return this.config.models.fast;
        }
        
        // Load balancing
        return this.selectModelByLoad();
    }
    
    selectModelByLoad() {
        const candidates = [
            this.config.models.primary,
            this.config.models.fast,
            this.config.models.backup
        ];
        
        if (this.config.loadBalancingStrategy === 'round-robin') {
            return this.roundRobinSelection(candidates);
        }
        
        if (this.config.loadBalancingStrategy === 'least-loaded') {
            return this.leastLoadedSelection(candidates);
        }
        
        // Adaptive selection based on performance
        return this.adaptiveSelection(candidates);
    }
    
    roundRobinSelection(candidates) {
        if (!this.lastSelectedIndex) {
            this.lastSelectedIndex = 0;
        }
        
        const selected = candidates[this.lastSelectedIndex];
        this.lastSelectedIndex = (this.lastSelectedIndex + 1) % candidates.length;
        
        return selected;
    }
    
    leastLoadedSelection(candidates) {
        let minLoad = Infinity;
        let selected = candidates[0];
        
        for (const model of candidates) {
            const activeCount = Array.from(this.activeRequests.values())
                .filter(r => r.model === model).length;
            
            if (activeCount < minLoad) {
                minLoad = activeCount;
                selected = model;
            }
        }
        
        return selected;
    }
    
    adaptiveSelection(candidates) {
        let bestScore = -Infinity;
        let selected = candidates[0];
        
        for (const model of candidates) {
            const stats = this.modelStats.get(model);
            if (!stats || stats.requests === 0) {
                // Give new models a chance
                return model;
            }
            
            const successRate = stats.successes / stats.requests;
            const avgLatency = stats.averageLatency;
            const activeCount = Array.from(this.activeRequests.values())
                .filter(r => r.model === model).length;
            
            // Score based on success rate, latency, and current load
            const score = successRate * 1000 - avgLatency - activeCount * 100;
            
            if (score > bestScore) {
                bestScore = score;
                selected = model;
            }
        }
        
        return selected;
    }
    
    // Rate Limiting
    
    async checkRateLimit(model) {
        const limiter = this.rateLimiters.get(model);
        if (!limiter) return;
        
        const allowed = await new Promise((resolve) => 
            limiter.removeTokens(1, (err, remaining) => 
                resolve(!err && remaining >= 0)
            )
        );
        
        if (!allowed) {
            throw new Error(`Rate limit exceeded for model ${model}`);
        }
    }
    
    // Caching
    
    async checkCache(prompt, model) {
        if (!this.config.enableCaching) return null;
        
        const hash = this.hashPrompt(prompt);
        
        // Check memory cache
        const cacheKey = `${model}:${hash}`;
        if (this.responseCache.has(cacheKey)) {
            const cached = this.responseCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheTTL) {
                return cached.response;
            }
            this.responseCache.delete(cacheKey);
        }
        
        // Check database cache
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT response FROM ollama_cache
                WHERE prompt_hash = $1 
                  AND model_name = $2
                  AND expires_at > NOW()
            `, [hash, model]);
            
            if (result.rows.length > 0) {
                const response = result.rows[0].response;
                
                // Add to memory cache
                this.responseCache.set(cacheKey, {
                    response,
                    timestamp: Date.now()
                });
                
                return response;
            }
            
            return null;
            
        } finally {
            client.release();
        }
    }
    
    async cacheResponse(prompt, model, response) {
        const hash = this.hashPrompt(prompt);
        const cacheKey = `${model}:${hash}`;
        
        // Memory cache
        this.responseCache.set(cacheKey, {
            response,
            timestamp: Date.now()
        });
        
        // Limit cache size
        if (this.responseCache.size > this.config.cacheSize) {
            const oldest = Array.from(this.responseCache.entries())
                .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
            this.responseCache.delete(oldest[0]);
        }
        
        // Database cache
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO ollama_cache (prompt_hash, model_name, response, expires_at)
                VALUES ($1, $2, $3, NOW() + INTERVAL '${this.config.cacheTTL / 1000} seconds')
                ON CONFLICT (prompt_hash) DO UPDATE SET
                    response = EXCLUDED.response,
                    expires_at = EXCLUDED.expires_at
            `, [hash, model, response]);
        } finally {
            client.release();
        }
    }
    
    hashPrompt(prompt) {
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(prompt).digest('hex');
    }
    
    // Health Monitoring
    
    startHealthMonitoring() {
        setInterval(async () => {
            await this.checkModelHealth();
        }, this.config.healthCheckInterval);
        
        // Clean expired cache
        setInterval(async () => {
            await this.cleanExpiredCache();
        }, 3600000); // Every hour
    }
    
    async checkModelHealth() {
        for (const [role, model] of Object.entries(this.config.models)) {
            try {
                const startTime = Date.now();
                
                // Simple health check prompt
                await pTimeout(
                    this.generate('Hello', { 
                        model, 
                        maxTokens: 10,
                        noCache: true,
                        fallback: false
                    }),
                    10000 // 10 second timeout for health check
                );
                
                const latency = Date.now() - startTime;
                
                this.modelHealth.set(model, {
                    healthy: true,
                    latency,
                    lastCheck: Date.now()
                });
                
            } catch (error) {
                this.modelHealth.set(model, {
                    healthy: false,
                    error: error.message,
                    lastCheck: Date.now()
                });
                
                console.error(`Model ${model} health check failed:`, error.message);
            }
        }
        
        this.emit('health_check_complete', Object.fromEntries(this.modelHealth));
    }
    
    async warmupModels() {
        console.log('Warming up models...');
        
        const warmupPrompts = [
            'Hello, how are you?',
            'What is 2+2?',
            'Describe a construction project.'
        ];
        
        for (const [role, model] of Object.entries(this.config.models)) {
            try {
                for (const prompt of warmupPrompts) {
                    await this.generate(prompt, {
                        model,
                        maxTokens: 50,
                        noCache: true
                    });
                }
                console.log(`Model ${model} warmed up`);
            } catch (error) {
                console.error(`Failed to warm up model ${model}:`, error.message);
            }
        }
    }
    
    // Performance Tracking
    
    updateModelStats(model, success, latency) {
        const stats = this.modelStats.get(model);
        if (!stats) return;
        
        stats.requests++;
        if (success) {
            stats.successes++;
        } else {
            stats.failures++;
        }
        
        stats.totalLatency += latency;
        stats.averageLatency = stats.totalLatency / stats.requests;
        stats.lastUsed = Date.now();
        
        // Update global average
        const allLatencies = Array.from(this.modelStats.values())
            .filter(s => s.requests > 0)
            .map(s => s.averageLatency);
        
        this.metrics.averageLatency = allLatencies.length > 0
            ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
            : 0;
    }
    
    async recordPerformance(model, requestType, latency, success, errorType = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO ollama_performance
                (model_name, request_type, latency_ms, success, error_type)
                VALUES ($1, $2, $3, $4, $5)
            `, [model, requestType, latency, success, errorType]);
        } finally {
            client.release();
        }
    }
    
    // Utility Methods
    
    async cleanExpiredCache() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                DELETE FROM ollama_cache
                WHERE expires_at < NOW()
            `);
            
            if (result.rowCount > 0) {
                console.log(`Cleaned ${result.rowCount} expired cache entries`);
            }
        } finally {
            client.release();
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            modelStats: Object.fromEntries(this.modelStats),
            activeRequests: this.activeRequests.size,
            cacheSize: this.responseCache.size,
            modelHealth: Object.fromEntries(this.modelHealth)
        };
    }
    
    async shutdown() {
        console.log('Shutting down Ollama Service Manager');
        
        // Wait for active requests to complete
        const timeout = 30000; // 30 seconds
        const startTime = Date.now();
        
        while (this.activeRequests.size > 0 && Date.now() - startTime < timeout) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        if (this.activeRequests.size > 0) {
            console.warn(`Shutting down with ${this.activeRequests.size} active requests`);
        }
        
        // Close database
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Ollama Service Manager shut down');
    }
    
    handleError(context, error) {
        console.error(`Ollama Service error in ${context}:`, error);
        this.emit('error', { context, error });
    }
}

// Specialized Ollama Clients

export class OllamaReasoningClient extends OllamaServiceManager {
    constructor(config) {
        super(config);
        
        this.reasoningChains = new Map();
    }
    
    async reason(query, options = {}) {
        const chainId = uuidv4();
        const steps = [];
        
        // Step 1: Problem decomposition
        const decomposition = await this.generate(
            `Break down this problem into logical steps:\n${query}`,
            { ...options, fast: true }
        );
        steps.push({ type: 'decomposition', content: decomposition });
        
        // Step 2: Execute each step
        const subProblems = this.parseSteps(decomposition);
        
        for (const subProblem of subProblems) {
            const solution = await this.generate(
                `Solve this step:\n${subProblem}`,
                options
            );
            steps.push({ type: 'step', problem: subProblem, solution });
        }
        
        // Step 3: Synthesize solution
        const synthesis = await this.generate(
            `Given these solutions:\n${JSON.stringify(steps, null, 2)}\n\nProvide a complete answer to: ${query}`,
            options
        );
        
        steps.push({ type: 'synthesis', content: synthesis });
        
        // Store chain
        this.reasoningChains.set(chainId, {
            query,
            steps,
            timestamp: Date.now()
        });
        
        return {
            answer: synthesis,
            chainId,
            steps
        };
    }
    
    parseSteps(decomposition) {
        // Simple step parsing
        const lines = decomposition.split('\n');
        const steps = [];
        
        for (const line of lines) {
            if (line.match(/^\d+\.|^-|^•/)) {
                steps.push(line.replace(/^\d+\.|^-|^•/, '').trim());
            }
        }
        
        return steps.filter(s => s.length > 0);
    }
}

export class OllamaConstructionClient extends OllamaServiceManager {
    constructor(config) {
        super({
            ...config,
            prompts: {
                hoaiAnalysis: 'hoai_analysis_template',
                safetyCheck: 'safety_check_template',
                quantitySurvey: 'quantity_survey_template'
            }
        });
    }
    
    async analyzeHOAI(projectData, phase) {
        const template = await this.loadPromptTemplate(this.config.prompts.hoaiAnalysis);
        
        const prompt = this.formatPrompt(template.template, {
            projectType: projectData.type,
            phase: phase,
            budget: projectData.budget,
            area: projectData.area
        });
        
        return this.generate(prompt, {
            model: this.config.models.primary,
            temperature: 0.3, // Lower temperature for compliance analysis
            maxTokens: 4096
        });
    }
    
    async performSafetyCheck(siteData) {
        const template = await this.loadPromptTemplate(this.config.prompts.safetyCheck);
        
        const prompt = this.formatPrompt(template.template, {
            conditions: JSON.stringify(siteData.conditions),
            workers: siteData.workerCount,
            equipment: siteData.equipment.join(', '),
            hazards: siteData.identifiedHazards?.join(', ') || 'None identified'
        });
        
        const response = await this.generate(prompt, {
            model: this.config.models.primary,
            temperature: 0.2 // Very low for safety
        });
        
        // Parse safety recommendations
        return this.parseSafetyResponse(response);
    }
    
    parseSafetyResponse(response) {
        // Extract structured safety data
        const risks = [];
        const measures = [];
        
        const lines = response.split('\n');
        let currentSection = null;
        
        for (const line of lines) {
            if (line.includes('RISKS:') || line.includes('HAZARDS:')) {
                currentSection = 'risks';
            } else if (line.includes('MEASURES:') || line.includes('RECOMMENDATIONS:')) {
                currentSection = 'measures';
            } else if (line.trim() && currentSection) {
                if (currentSection === 'risks') {
                    risks.push(line.trim());
                } else if (currentSection === 'measures') {
                    measures.push(line.trim());
                }
            }
        }
        
        return { risks, measures, fullResponse: response };
    }
}

// Export factory functions
export function createOllamaService(config) {
    return new OllamaServiceManager(config);
}

export function createReasoningClient(config) {
    return new OllamaReasoningClient(config);
}

export function createConstructionClient(config) {
    return new OllamaConstructionClient(config);
}
```

### Usage Example

```javascript
// ollama-usage.js
import { 
    createOllamaService, 
    createReasoningClient,
    createConstructionClient 
} from './ollama-service-manager.js';

async function main() {
    // Basic service
    const ollama = createOllamaService({
        models: {
            primary: 'qwen2.5:72b-instruct-fp16',
            fast: 'mistral:7b-instruct-fp16',
            vision: 'llava:34b',
            mathematical: 'phi3:14b',
            backup: 'llama3.3:70b'
        }
    });
    
    await ollama.initialize();
    
    // Basic generation
    const response = await ollama.generate(
        'Explain the HOAI phases in construction',
        { maxTokens: 1000 }
    );
    
    console.log('Response:', response);
    
    // Streaming response
    const stream = ollama.generate(
        'List construction safety measures',
        { stream: true }
    );
    
    for await (const chunk of stream) {
        process.stdout.write(chunk);
    }
    
    // Reasoning client
    const reasoner = createReasoningClient({});
    await reasoner.initialize();
    
    const reasoning = await reasoner.reason(
        'How can we optimize the concrete pouring schedule for a 10-story building?'
    );
    
    console.log('Reasoning result:', reasoning);
    
    // Construction-specific client
    const construction = createConstructionClient({});
    await construction.initialize();
    
    const safetyAnalysis = await construction.performSafetyCheck({
        conditions: { weather: 'rainy', temperature: 15 },
        workerCount: 25,
        equipment: ['crane', 'scaffolding', 'concrete mixer'],
        identifiedHazards: ['wet surfaces', 'height work']
    });
    
    console.log('Safety analysis:', safetyAnalysis);
    
    // Get metrics
    console.log('Service metrics:', ollama.getMetrics());
}

main();
```

### Construction Integration

```javascript
// construction-ollama-integration.js
import { createOllamaService, createConstructionClient } from './ollama-service-manager.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionOllamaService {
    constructor() {
        this.ollama = null;
        this.construction = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        // Initialize base service
        this.ollama = createOllamaService({
            enableCaching: true,
            modelWarmupEnabled: true
        });
        
        await this.ollama.initialize();
        
        // Initialize construction client
        this.construction = createConstructionClient({});
        await this.construction.initialize();
        
        // Load construction-specific prompts
        await this.loadConstructionPrompts();
    }
    
    async loadConstructionPrompts() {
        const prompts = [
            {
                name: 'hoai_analysis_template',
                template: `Analyze the following construction project for HOAI Phase {{phase}} compliance:
                
Project Type: {{projectType}}
Budget: {{budget}} EUR
Area: {{area}} m²

Provide detailed analysis including:
1. Required deliverables for this phase
2. Fee calculation based on HOAI tables
3. Timeline recommendations
4. Compliance checkpoints
5. Potential risks or issues`,
                parameters: { temperature: 0.3 }
            },
            {
                name: 'safety_check_template',
                template: `Perform safety analysis for construction site:

Conditions: {{conditions}}
Workers on site: {{workers}}
Equipment in use: {{equipment}}
Known hazards: {{hazards}}

Identify:
RISKS:
- List all potential safety risks

MEASURES:
- Provide specific safety measures for each risk
- Include PPE requirements
- Emergency procedures`,
                parameters: { temperature: 0.2 }
            },
            {
                name: 'quantity_survey_template',
                template: `Calculate material quantities for:

Project specifications: {{specifications}}

Provide:
1. Detailed material list with quantities
2. Waste allowances
3. Cost estimates
4. Delivery schedule recommendations`,
                parameters: { temperature: 0.4 }
            }
        ];
        
        for (const prompt of prompts) {
            await this.ollama.savePromptTemplate(
                prompt.name,
                prompt,
                'construction'
            );
        }
    }
    
    async analyzeProjectDocument(documentPath, analysisType) {
        // Extract text from document
        const documentText = await this.extractDocumentText(documentPath);
        
        const prompts = {
            compliance: `Analyze this construction document for regulatory compliance:\n\n${documentText}`,
            cost: `Extract and analyze cost information from this document:\n\n${documentText}`,
            schedule: `Extract timeline and scheduling information:\n\n${documentText}`,
            risk: `Identify risks and issues mentioned in this document:\n\n${documentText}`
        };
        
        const prompt = prompts[analysisType] || prompts.compliance;
        
        const analysis = await this.ollama.generate(prompt, {
            model: this.ollama.config.models.primary,
            temperature: 0.3,
            maxTokens: 4096
        });
        
        // Store analysis
        await this.storeAnalysis(documentPath, analysisType, analysis);
        
        return analysis;
    }
    
    async generateConstructionReport(projectId, reportType) {
        // Load project data
        const projectData = await this.loadProjectData(projectId);
        
        const templates = {
            progress: await this.generateProgressReport(projectData),
            safety: await this.generateSafetyReport(projectData),
            financial: await this.generateFinancialReport(projectData),
            quality: await this.generateQualityReport(projectData)
        };
        
        const report = templates[reportType];
        
        if (!report) {
            throw new Error(`Unknown report type: ${reportType}`);
        }
        
        // Generate formatted report
        const formattedReport = await this.ollama.generate(
            `Format this construction report professionally:\n\n${report}`,
            {
                model: this.ollama.config.models.primary,
                temperature: 0.5
            }
        );
        
        return formattedReport;
    }
    
    async processConstructionQuery(query, context = {}) {
        // Determine query type
        const queryType = await this.classifyQuery(query);
        
        // Add context
        const enrichedPrompt = this.enrichQueryWithContext(query, context, queryType);
        
        // Select appropriate model
        const model = this.selectModelForQuery(queryType);
        
        // Process with appropriate parameters
        const response = await this.ollama.generate(enrichedPrompt, {
            model,
            temperature: this.getTemperatureForQuery(queryType),
            maxTokens: 4096,
            fallback: true
        });
        
        // Post-process response
        return this.postProcessResponse(response, queryType);
    }
    
    async classifyQuery(query) {
        const classification = await this.ollama.generate(
            `Classify this construction query into one of: technical, safety, compliance, financial, schedule, general
            
Query: ${query}
            
Classification:`,
            {
                model: this.ollama.config.models.fast,
                temperature: 0.1,
                maxTokens: 10
            }
        );
        
        return classification.trim().toLowerCase();
    }
    
    enrichQueryWithContext(query, context, queryType) {
        const contextParts = [];
        
        if (context.projectId) {
            contextParts.push(`Project ID: ${context.projectId}`);
        }
        
        if (context.phase) {
            contextParts.push(`HOAI Phase: ${context.phase}`);
        }
        
        if (context.regulations) {
            contextParts.push(`Applicable regulations: ${context.regulations.join(', ')}`);
        }
        
        const contextString = contextParts.length > 0 
            ? `Context:\n${contextParts.join('\n')}\n\n`
            : '';
        
        return `${contextString}${query}`;
    }
    
    selectModelForQuery(queryType) {
        const modelMap = {
            technical: this.ollama.config.models.primary,
            safety: this.ollama.config.models.primary,
            compliance: this.ollama.config.models.primary,
            financial: this.ollama.config.models.mathematical,
            schedule: this.ollama.config.models.mathematical,
            general: this.ollama.config.models.fast
        };
        
        return modelMap[queryType] || this.ollama.config.models.primary;
    }
    
    getTemperatureForQuery(queryType) {
        const temperatureMap = {
            technical: 0.3,
            safety: 0.2,
            compliance: 0.2,
            financial: 0.3,
            schedule: 0.4,
            general: 0.7
        };
        
        return temperatureMap[queryType] || 0.5;
    }
    
    postProcessResponse(response, queryType) {
        // Add metadata
        const processed = {
            response,
            queryType,
            timestamp: new Date(),
            confidence: this.assessConfidence(response, queryType)
        };
        
        // Extract structured data if applicable
        if (queryType === 'financial') {
            processed.numbers = this.extractNumbers(response);
        }
        
        if (queryType === 'schedule') {
            processed.dates = this.extractDates(response);
        }
        
        return processed;
    }
    
    assessConfidence(response, queryType) {
        // Simple confidence assessment based on response characteristics
        let confidence = 0.5;
        
        // Check for uncertainty markers
        const uncertainMarkers = ['might', 'could', 'possibly', 'approximately', 'unclear'];
        const certainMarkers = ['definitely', 'certainly', 'must', 'required', 'mandatory'];
        
        for (const marker of uncertainMarkers) {
            if (response.toLowerCase().includes(marker)) {
                confidence -= 0.1;
            }
        }
        
        for (const marker of certainMarkers) {
            if (response.toLowerCase().includes(marker)) {
                confidence += 0.1;
            }
        }
        
        // Query type adjustments
        if (queryType === 'compliance' || queryType === 'safety') {
            confidence *= 0.9; // Be more conservative
        }
        
        return Math.max(0, Math.min(1, confidence));
    }
    
    extractNumbers(text) {
        const numbers = [];
        const regex = /(\d+(?:,\d{3})*(?:\.\d+)?)\s*(EUR|€|m²|m³|kg|t|h|days?|weeks?|months?)?/gi;
        
        let match;
        while ((match = regex.exec(text)) !== null) {
            numbers.push({
                value: parseFloat(match[1].replace(/,/g, '')),
                unit: match[2] || 'unit',
                context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20)
            });
        }
        
        return numbers;
    }
    
    extractDates(text) {
        const dates = [];
        const patterns = [
            /(\d{1,2})\.(\d{1,2})\.(\d{4})/g,
            /(\d{4})-(\d{1,2})-(\d{1,2})/g,
            /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/gi
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                dates.push({
                    text: match[0],
                    context: text.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30)
                });
            }
        }
        
        return dates;
    }
}
```

## Testing

```javascript
// ollama-integration.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { createOllamaService, createReasoningClient } from './ollama-service-manager.js';

describe('OllamaServiceManager', () => {
    let ollama;
    
    beforeEach(async () => {
        ollama = createOllamaService({
            defaultTimeout: 5000,
            enableCaching: true
        });
        await ollama.initialize();
    });
    
    test('should generate response', async () => {
        const response = await ollama.generate('Hello', {
            maxTokens: 10
        });
        
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
    });
    
    test('should handle streaming', async () => {
        const chunks = [];
        const stream = ollama.generate('Count to 5', {
            stream: true,
            maxTokens: 50
        });
        
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        
        expect(chunks.length).toBeGreaterThan(0);
    });
    
    test('should cache responses', async () => {
        const prompt = 'What is 2+2?';
        
        // First call
        const response1 = await ollama.generate(prompt, { maxTokens: 10 });
        
        // Second call (should hit cache)
        const startTime = Date.now();
        const response2 = await ollama.generate(prompt, { maxTokens: 10 });
        const duration = Date.now() - startTime;
        
        expect(response1).toBe(response2);
        expect(duration).toBeLessThan(10); // Cache hit should be fast
        expect(ollama.metrics.cacheHits).toBe(1);
    });
    
    test('should handle model fallback', async () => {
        const response = await ollama.generate('Test prompt', {
            model: 'non-existent-model',
            fallback: true,
            maxTokens: 10
        });
        
        expect(response).toBeDefined();
    });
});

describe('OllamaReasoningClient', () => {
    let reasoner;
    
    beforeEach(async () => {
        reasoner = createReasoningClient({
            defaultTimeout: 10000
        });
        await reasoner.initialize();
    });
    
    test('should perform multi-step reasoning', async () => {
        const result = await reasoner.reason(
            'How many windows are in a 5-story building with 4 windows per floor?'
        );
        
        expect(result.answer).toBeDefined();
        expect(result.steps).toBeInstanceOf(Array);
        expect(result.steps.length).toBeGreaterThan(2);
        expect(result.chainId).toBeDefined();
    });
});
```

This implementation provides comprehensive Ollama integration with model management, prompt engineering, streaming, caching, load balancing, and specialized clients for construction use cases.
