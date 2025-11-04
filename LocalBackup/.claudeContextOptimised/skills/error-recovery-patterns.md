# Error Recovery Patterns Implementation

## Overview

This skill provides production-ready error handling and recovery patterns for the AIGO-Syndicate construction intelligence. It includes circuit breakers, retry mechanisms with exponential backoff, fallback strategies, error categorization, recovery procedures, post-mortem automation, and error budget tracking.

## Core Implementation

### Error Recovery Framework

```javascript
// error-recovery-framework.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import pRetry from 'p-retry';
import CircuitBreaker from 'opossum';
import { performance } from 'perf_hooks';

export class ErrorRecoveryFramework extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Circuit breaker settings
            circuitBreaker: {
                timeout: config.circuitBreaker?.timeout || 3000,
                errorThresholdPercentage: config.circuitBreaker?.errorThresholdPercentage || 50,
                resetTimeout: config.circuitBreaker?.resetTimeout || 30000,
                rollingCountTimeout: config.circuitBreaker?.rollingCountTimeout || 10000,
                rollingCountBuckets: config.circuitBreaker?.rollingCountBuckets || 10,
                volumeThreshold: config.circuitBreaker?.volumeThreshold || 10
            },
            
            // Retry settings
            retry: {
                retries: config.retry?.retries || 3,
                minTimeout: config.retry?.minTimeout || 1000,
                maxTimeout: config.retry?.maxTimeout || 30000,
                factor: config.retry?.factor || 2,
                randomize: config.retry?.randomize !== false,
                onFailedAttempt: config.retry?.onFailedAttempt
            },
            
            // Error categorization
            errorCategories: config.errorCategories || {
                'TRANSIENT': ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'NetworkError'],
                'RESOURCE': ['ENOMEM', 'ENOSPC', 'EMFILE'],
                'VALIDATION': ['ValidationError', 'TypeError', 'RangeError'],
                'BUSINESS': ['BusinessRuleViolation', 'InsufficientPermissions'],
                'CRITICAL': ['DatabaseConnectionError', 'SystemFailure']
            },
            
            // Recovery strategies
            recoveryStrategies: config.recoveryStrategies || {
                'TRANSIENT': 'retry',
                'RESOURCE': 'backpressure',
                'VALIDATION': 'reject',
                'BUSINESS': 'fallback',
                'CRITICAL': 'escalate'
            },
            
            // Error budget
            errorBudget: {
                window: config.errorBudget?.window || 86400000, // 24 hours
                threshold: config.errorBudget?.threshold || 0.001, // 0.1% error rate
                actions: config.errorBudget?.actions || ['alert', 'throttle']
            },
            
            // Monitoring
            metricsInterval: config.metricsInterval || 60000, // 1 minute
            
            ...config
        };
        
        this.dbPool = null;
        this.circuitBreakers = new Map();
        this.errorBudgets = new Map();
        this.recoveryHandlers = new Map();
        
        // Metrics
        this.metrics = {
            totalErrors: 0,
            errorsByCategory: {},
            recoveryAttempts: 0,
            successfulRecoveries: 0,
            circuitBreakerTrips: 0
        };
        
        this.initializeDefaultHandlers();
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load recovery procedures
            await this.loadRecoveryProcedures();
            
            // Start monitoring
            this.startMonitoring();
            
            this.emit('initialized');
            console.log('Error Recovery Framework initialized');
            
        } catch (error) {
            console.error('Failed to initialize Error Recovery Framework:', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'error_recovery'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Error logs table
            await client.query(`
                CREATE TABLE IF NOT EXISTS error_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    error_id VARCHAR(100) UNIQUE NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    error_type VARCHAR(100) NOT NULL,
                    message TEXT NOT NULL,
                    stack_trace TEXT,
                    context JSONB DEFAULT '{}'::jsonb,
                    service_name VARCHAR(100),
                    environment VARCHAR(50),
                    severity VARCHAR(20) DEFAULT 'error',
                    occurred_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_errors_time 
                ON error_logs(occurred_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_errors_category 
                ON error_logs(category, error_type);
                
                CREATE INDEX IF NOT EXISTS idx_errors_service 
                ON error_logs(service_name, occurred_at DESC);
            `);
            
            // Recovery attempts table
            await client.query(`
                CREATE TABLE IF NOT EXISTS recovery_attempts (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    error_id VARCHAR(100) REFERENCES error_logs(error_id),
                    strategy VARCHAR(50) NOT NULL,
                    attempt_number INTEGER NOT NULL,
                    success BOOLEAN NOT NULL,
                    duration_ms INTEGER,
                    result JSONB,
                    attempted_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_recovery_error 
                ON recovery_attempts(error_id, attempted_at);
            `);
            
            // Circuit breaker states
            await client.query(`
                CREATE TABLE IF NOT EXISTS circuit_breaker_states (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    service_name VARCHAR(100) NOT NULL,
                    endpoint VARCHAR(200) NOT NULL,
                    state VARCHAR(20) NOT NULL,
                    failure_count INTEGER DEFAULT 0,
                    last_failure_time TIMESTAMPTZ,
                    opened_at TIMESTAMPTZ,
                    half_opened_at TIMESTAMPTZ,
                    closed_at TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_circuit_breaker 
                    UNIQUE(service_name, endpoint)
                );
                
                CREATE INDEX IF NOT EXISTS idx_cb_state 
                ON circuit_breaker_states(state, service_name);
            `);
            
            // Error budgets
            await client.query(`
                CREATE TABLE IF NOT EXISTS error_budgets (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    service_name VARCHAR(100) NOT NULL,
                    time_window TIMESTAMPTZ NOT NULL,
                    total_requests INTEGER DEFAULT 0,
                    failed_requests INTEGER DEFAULT 0,
                    error_rate FLOAT DEFAULT 0,
                    budget_remaining FLOAT DEFAULT 1,
                    is_exhausted BOOLEAN DEFAULT false,
                    actions_taken JSONB DEFAULT '[]'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_budget_service_time 
                ON error_budgets(service_name, time_window DESC);
                
                CREATE INDEX IF NOT EXISTS idx_budget_exhausted 
                ON error_budgets(is_exhausted, service_name)
                WHERE is_exhausted = true;
            `);
            
            // Recovery procedures
            await client.query(`
                CREATE TABLE IF NOT EXISTS recovery_procedures (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    error_pattern VARCHAR(200) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    procedure_name VARCHAR(100) NOT NULL,
                    steps JSONB NOT NULL,
                    automation_script TEXT,
                    success_criteria JSONB,
                    priority INTEGER DEFAULT 5,
                    active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_procedures_pattern 
                ON recovery_procedures(error_pattern, category)
                WHERE active = true;
            `);
            
            // Post-mortem records
            await client.query(`
                CREATE TABLE IF NOT EXISTS post_mortems (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    incident_id VARCHAR(100) NOT NULL,
                    error_ids TEXT[],
                    title VARCHAR(500) NOT NULL,
                    summary TEXT,
                    root_cause TEXT,
                    impact JSONB,
                    timeline JSONB,
                    action_items JSONB,
                    lessons_learned TEXT[],
                    severity VARCHAR(20),
                    duration_minutes INTEGER,
                    services_affected TEXT[],
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    completed_at TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_postmortem_incident 
                ON post_mortems(incident_id);
                
                CREATE INDEX IF NOT EXISTS idx_postmortem_severity 
                ON post_mortems(severity, created_at DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Error Handling Core
    
    async handleError(error, context = {}) {
        const errorId = uuidv4();
        const startTime = performance.now();
        
        try {
            // Categorize error
            const category = this.categorizeError(error);
            
            // Log error
            await this.logError({
                errorId,
                error,
                category,
                context
            });
            
            // Update metrics
            this.updateErrorMetrics(category);
            
            // Check error budget
            const budgetCheck = await this.checkErrorBudget(context.service);
            if (budgetCheck.exhausted) {
                await this.handleBudgetExhaustion(context.service);
            }
            
            // Determine recovery strategy
            const strategy = this.getRecoveryStrategy(category);
            
            // Execute recovery
            const recoveryResult = await this.executeRecovery({
                errorId,
                error,
                category,
                strategy,
                context
            });
            
            // Record recovery attempt
            await this.recordRecoveryAttempt({
                errorId,
                strategy,
                success: recoveryResult.success,
                duration: performance.now() - startTime,
                result: recoveryResult
            });
            
            return recoveryResult;
            
        } catch (recoveryError) {
            console.error('Error in error handling:', recoveryError);
            // Last resort fallback
            return this.lastResortFallback(error, context);
        }
    }
    
    categorizeError(error) {
        const errorString = error.toString();
        const errorCode = error.code || error.name || 'UnknownError';
        
        for (const [category, patterns] of Object.entries(this.config.errorCategories)) {
            if (patterns.some(pattern => 
                errorString.includes(pattern) || errorCode === pattern
            )) {
                return category;
            }
        }
        
        return 'UNKNOWN';
    }
    
    getRecoveryStrategy(category) {
        return this.config.recoveryStrategies[category] || 'fallback';
    }
    
    async executeRecovery({ errorId, error, category, strategy, context }) {
        this.metrics.recoveryAttempts++;
        
        try {
            switch (strategy) {
                case 'retry':
                    return await this.executeRetry(error, context);
                    
                case 'backpressure':
                    return await this.executeBackpressure(error, context);
                    
                case 'fallback':
                    return await this.executeFallback(error, context);
                    
                case 'escalate':
                    return await this.executeEscalation(error, context);
                    
                case 'reject':
                    return this.executeRejection(error, context);
                    
                default:
                    return this.executeFallback(error, context);
            }
        } catch (recoveryError) {
            console.error(`Recovery strategy ${strategy} failed:`, recoveryError);
            return {
                success: false,
                strategy,
                error: recoveryError.message
            };
        }
    }
    
    // Circuit Breaker Implementation
    
    createCircuitBreaker(name, fn, options = {}) {
        const breakerOptions = {
            ...this.config.circuitBreaker,
            ...options,
            name
        };
        
        const breaker = new CircuitBreaker(fn, breakerOptions);
        
        // Event handlers
        breaker.on('open', () => {
            this.metrics.circuitBreakerTrips++;
            this.handleCircuitBreakerOpen(name);
        });
        
        breaker.on('halfOpen', () => {
            this.handleCircuitBreakerHalfOpen(name);
        });
        
        breaker.on('close', () => {
            this.handleCircuitBreakerClose(name);
        });
        
        breaker.on('failure', (error) => {
            this.handleCircuitBreakerFailure(name, error);
        });
        
        this.circuitBreakers.set(name, breaker);
        
        return breaker;
    }
    
    async handleCircuitBreakerOpen(name) {
        console.log(`Circuit breaker ${name} opened`);
        
        await this.updateCircuitBreakerState(name, 'open');
        
        // Notify monitoring
        this.emit('circuit_breaker_opened', {
            name,
            timestamp: new Date()
        });
        
        // Check if we need to trigger failover
        const serviceInfo = this.parseCircuitBreakerName(name);
        if (serviceInfo.critical) {
            await this.triggerFailover(serviceInfo.service);
        }
    }
    
    async handleCircuitBreakerHalfOpen(name) {
        console.log(`Circuit breaker ${name} half-open`);
        await this.updateCircuitBreakerState(name, 'half-open');
    }
    
    async handleCircuitBreakerClose(name) {
        console.log(`Circuit breaker ${name} closed`);
        await this.updateCircuitBreakerState(name, 'closed');
        
        this.emit('circuit_breaker_closed', {
            name,
            timestamp: new Date()
        });
    }
    
    async handleCircuitBreakerFailure(name, error) {
        await this.incrementCircuitBreakerFailures(name);
        await this.handleError(error, {
            circuitBreaker: name,
            service: this.parseCircuitBreakerName(name).service
        });
    }
    
    parseCircuitBreakerName(name) {
        // Parse format: service:endpoint:critical
        const parts = name.split(':');
        return {
            service: parts[0],
            endpoint: parts[1],
            critical: parts[2] === 'critical'
        };
    }
    
    async updateCircuitBreakerState(name, state) {
        const { service, endpoint } = this.parseCircuitBreakerName(name);
        
        const client = await this.dbPool.connect();
        try {
            const stateTimestamp = `${state.replace('-', '_')}_at`;
            
            await client.query(`
                INSERT INTO circuit_breaker_states
                (service_name, endpoint, state, ${stateTimestamp})
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (service_name, endpoint)
                DO UPDATE SET
                    state = EXCLUDED.state,
                    ${stateTimestamp} = NOW(),
                    updated_at = NOW()
            `, [service, endpoint, state]);
            
        } finally {
            client.release();
        }
    }
    
    async incrementCircuitBreakerFailures(name) {
        const { service, endpoint } = this.parseCircuitBreakerName(name);
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO circuit_breaker_states
                (service_name, endpoint, state, failure_count, last_failure_time)
                VALUES ($1, $2, 'closed', 1, NOW())
                ON CONFLICT (service_name, endpoint)
                DO UPDATE SET
                    failure_count = circuit_breaker_states.failure_count + 1,
                    last_failure_time = NOW(),
                    updated_at = NOW()
            `, [service, endpoint]);
            
        } finally {
            client.release();
        }
    }
    
    // Retry Mechanism
    
    async executeRetry(error, context) {
        const operation = context.operation || (() => Promise.reject(error));
        
        try {
            const result = await pRetry(operation, {
                ...this.config.retry,
                onFailedAttempt: (error) => {
                    console.log(`Retry attempt ${error.attemptNumber} failed: ${error.message}`);
                    
                    if (this.config.retry.onFailedAttempt) {
                        this.config.retry.onFailedAttempt(error);
                    }
                    
                    // Record retry attempt
                    this.recordRetryAttempt(context, error);
                }
            });
            
            this.metrics.successfulRecoveries++;
            
            return {
                success: true,
                strategy: 'retry',
                result
            };
            
        } catch (retryError) {
            return {
                success: false,
                strategy: 'retry',
                error: retryError.message,
                attempts: retryError.attemptNumber
            };
        }
    }
    
    async recordRetryAttempt(context, attemptError) {
        // Store retry metrics for analysis
        const key = `${context.service}:${context.operation}`;
        const attempts = this.retryAttempts.get(key) || [];
        
        attempts.push({
            timestamp: new Date(),
            attemptNumber: attemptError.attemptNumber,
            error: attemptError.message
        });
        
        this.retryAttempts.set(key, attempts);
    }
    
    // Backpressure Implementation
    
    async executeBackpressure(error, context) {
        console.log('Applying backpressure strategy');
        
        try {
            // Reduce load
            await this.reduceLoad(context.service);
            
            // Wait for resources to recover
            const recoveryTime = await this.waitForResourceRecovery(context);
            
            // Gradually restore load
            await this.restoreLoad(context.service);
            
            this.metrics.successfulRecoveries++;
            
            return {
                success: true,
                strategy: 'backpressure',
                recoveryTime
            };
            
        } catch (backpressureError) {
            return {
                success: false,
                strategy: 'backpressure',
                error: backpressureError.message
            };
        }
    }
    
    async reduceLoad(service) {
        // Implement rate limiting
        const currentRate = this.serviceRates.get(service) || 100;
        const reducedRate = Math.max(10, currentRate * 0.5); // Reduce by 50%
        
        this.serviceRates.set(service, reducedRate);
        
        // Notify load balancer
        this.emit('load_reduced', {
            service,
            previousRate: currentRate,
            newRate: reducedRate
        });
    }
    
    async waitForResourceRecovery(context) {
        const startTime = Date.now();
        const maxWait = 60000; // 1 minute
        const checkInterval = 5000; // 5 seconds
        
        while (Date.now() - startTime < maxWait) {
            const resourcesOk = await this.checkResourceAvailability(context);
            
            if (resourcesOk) {
                return Date.now() - startTime;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        throw new Error('Resources did not recover within timeout');
    }
    
    async checkResourceAvailability(context) {
        // Check various resources
        const checks = await Promise.all([
            this.checkMemoryAvailability(),
            this.checkDatabaseConnections(),
            this.checkCPUUsage()
        ]);
        
        return checks.every(check => check);
    }
    
    async checkMemoryAvailability() {
        const memUsage = process.memoryUsage();
        const heapUsedPercent = memUsage.heapUsed / memUsage.heapTotal;
        return heapUsedPercent < 0.8; // Less than 80% heap used
    }
    
    async checkDatabaseConnections() {
        try {
            const result = await this.dbPool.query('SELECT 1');
            return true;
        } catch (error) {
            return false;
        }
    }
    
    async checkCPUUsage() {
        // Simplified CPU check
        const loadAvg = require('os').loadavg()[0];
        const cpuCount = require('os').cpus().length;
        return loadAvg / cpuCount < 0.8;
    }
    
    async restoreLoad(service) {
        const currentRate = this.serviceRates.get(service);
        const targetRate = 100; // Original rate
        const steps = 5;
        const stepDelay = 10000; // 10 seconds
        
        for (let i = 1; i <= steps; i++) {
            const newRate = currentRate + ((targetRate - currentRate) * i / steps);
            this.serviceRates.set(service, newRate);
            
            this.emit('load_restored', {
                service,
                rate: newRate,
                step: i,
                totalSteps: steps
            });
            
            await new Promise(resolve => setTimeout(resolve, stepDelay));
        }
    }
    
    // Fallback Strategies
    
    async executeFallback(error, context) {
        console.log('Executing fallback strategy');
        
        // Try different fallback options in order
        const fallbackOptions = [
            () => this.tryCache(context),
            () => this.tryDefaultValue(context),
            () => this.tryAlternateService(context),
            () => this.tryDegradedMode(context)
        ];
        
        for (const fallback of fallbackOptions) {
            try {
                const result = await fallback();
                if (result.success) {
                    this.metrics.successfulRecoveries++;
                    return {
                        success: true,
                        strategy: 'fallback',
                        method: result.method,
                        result: result.data
                    };
                }
            } catch (fallbackError) {
                console.warn('Fallback option failed:', fallbackError.message);
            }
        }
        
        return {
            success: false,
            strategy: 'fallback',
            error: 'All fallback options exhausted'
        };
    }
    
    async tryCache(context) {
        if (!context.cacheKey) {
            return { success: false };
        }
        
        const cachedData = await this.getCache(context.cacheKey);
        
        if (cachedData) {
            return {
                success: true,
                method: 'cache',
                data: cachedData
            };
        }
        
        return { success: false };
    }
    
    async tryDefaultValue(context) {
        if (context.defaultValue !== undefined) {
            return {
                success: true,
                method: 'default',
                data: context.defaultValue
            };
        }
        
        return { success: false };
    }
    
    async tryAlternateService(context) {
        if (!context.alternateService) {
            return { success: false };
        }
        
        try {
            const result = await this.callAlternateService(
                context.alternateService,
                context
            );
            
            return {
                success: true,
                method: 'alternate_service',
                data: result
            };
        } catch (error) {
            return { success: false };
        }
    }
    
    async tryDegradedMode(context) {
        if (!context.allowDegraded) {
            return { success: false };
        }
        
        return {
            success: true,
            method: 'degraded',
            data: {
                degraded: true,
                message: 'Service operating in degraded mode',
                limitations: context.degradedLimitations || []
            }
        };
    }
    
    // Escalation
    
    async executeEscalation(error, context) {
        console.log('Executing escalation strategy');
        
        try {
            // Create incident
            const incident = await this.createIncident(error, context);
            
            // Notify on-call
            await this.notifyOnCall(incident);
            
            // Execute emergency procedures
            await this.executeEmergencyProcedures(incident);
            
            // Start post-mortem process
            await this.initializePostMortem(incident);
            
            return {
                success: true,
                strategy: 'escalation',
                incidentId: incident.id,
                actions: incident.actions
            };
            
        } catch (escalationError) {
            return {
                success: false,
                strategy: 'escalation',
                error: escalationError.message
            };
        }
    }
    
    async createIncident(error, context) {
        const incident = {
            id: uuidv4(),
            error: error.message,
            context,
            severity: this.calculateSeverity(error, context),
            timestamp: new Date(),
            actions: []
        };
        
        // Store incident
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO incidents
                (id, error_message, context, severity, created_at)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                incident.id,
                incident.error,
                JSON.stringify(incident.context),
                incident.severity,
                incident.timestamp
            ]);
        } finally {
            client.release();
        }
        
        return incident;
    }
    
    calculateSeverity(error, context) {
        // Critical if affects critical services
        if (context.service && this.criticalServices.has(context.service)) {
            return 'critical';
        }
        
        // High if database or auth related
        if (error.message.includes('Database') || error.message.includes('Auth')) {
            return 'high';
        }
        
        // Medium by default
        return 'medium';
    }
    
    async notifyOnCall(incident) {
        // In production, integrate with PagerDuty, OpsGenie, etc.
        console.log(`ALERT: Incident ${incident.id} - Severity: ${incident.severity}`);
        
        this.emit('incident_created', incident);
    }
    
    async executeEmergencyProcedures(incident) {
        const procedures = await this.getEmergencyProcedures(incident.severity);
        
        for (const procedure of procedures) {
            try {
                await this.executeProcedure(procedure, incident);
                incident.actions.push({
                    procedure: procedure.name,
                    success: true
                });
            } catch (error) {
                incident.actions.push({
                    procedure: procedure.name,
                    success: false,
                    error: error.message
                });
            }
        }
    }
    
    async getEmergencyProcedures(severity) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM recovery_procedures
                WHERE category = 'EMERGENCY'
                  AND priority >= $1
                  AND active = true
                ORDER BY priority DESC
            `, [this.severityToPriority(severity)]);
            
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    severityToPriority(severity) {
        const mapping = {
            'critical': 9,
            'high': 7,
            'medium': 5,
            'low': 3
        };
        return mapping[severity] || 5;
    }
    
    // Error Budget Management
    
    async checkErrorBudget(service) {
        if (!service) return { exhausted: false };
        
        const window = Date.now() - this.config.errorBudget.window;
        
        const client = await this.dbPool.connect();
        try {
            // Get current budget
            const result = await client.query(`
                SELECT * FROM error_budgets
                WHERE service_name = $1
                  AND time_window > $2
                ORDER BY time_window DESC
                LIMIT 1
            `, [service, new Date(window)]);
            
            let budget;
            if (result.rows.length === 0) {
                // Create new budget window
                budget = await this.createErrorBudget(service);
            } else {
                budget = result.rows[0];
            }
            
            // Update with current error
            await client.query(`
                UPDATE error_budgets
                SET failed_requests = failed_requests + 1,
                    total_requests = total_requests + 1,
                    error_rate = (failed_requests + 1)::float / (total_requests + 1)::float,
                    budget_remaining = GREATEST(0, 1 - ((failed_requests + 1)::float / (total_requests + 1)::float / $3))
                WHERE id = $1
                RETURNING *
            `, [budget.id, service, this.config.errorBudget.threshold]);
            
            const updated = result.rows[0];
            const exhausted = updated.budget_remaining <= 0;
            
            if (exhausted && !budget.is_exhausted) {
                await client.query(`
                    UPDATE error_budgets
                    SET is_exhausted = true
                    WHERE id = $1
                `, [budget.id]);
            }
            
            return {
                exhausted,
                errorRate: updated.error_rate,
                budgetRemaining: updated.budget_remaining
            };
            
        } finally {
            client.release();
        }
    }
    
    async createErrorBudget(service) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO error_budgets
                (service_name, time_window, total_requests, failed_requests)
                VALUES ($1, NOW(), 1, 0)
                RETURNING *
            `, [service]);
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }
    
    async handleBudgetExhaustion(service) {
        console.log(`Error budget exhausted for service: ${service}`);
        
        for (const action of this.config.errorBudget.actions) {
            switch (action) {
                case 'alert':
                    await this.sendBudgetAlert(service);
                    break;
                    
                case 'throttle':
                    await this.throttleService(service);
                    break;
                    
                case 'circuit_break':
                    await this.openAllCircuitBreakers(service);
                    break;
            }
        }
    }
    
    async sendBudgetAlert(service) {
        this.emit('error_budget_exhausted', {
            service,
            timestamp: new Date()
        });
    }
    
    async throttleService(service) {
        const currentRate = this.serviceRates.get(service) || 100;
        const throttledRate = Math.max(1, currentRate * 0.1); // 90% reduction
        
        this.serviceRates.set(service, throttledRate);
        
        console.log(`Service ${service} throttled to ${throttledRate} requests/sec`);
    }
    
    async openAllCircuitBreakers(service) {
        for (const [name, breaker] of this.circuitBreakers) {
            if (name.startsWith(`${service}:`)) {
                breaker.open();
            }
        }
    }
    
    // Post-Mortem Automation
    
    async initializePostMortem(incident) {
        const postMortem = {
            id: uuidv4(),
            incidentId: incident.id,
            title: `Incident ${incident.id}: ${incident.error}`,
            timeline: [{
                timestamp: incident.timestamp,
                event: 'Incident detected',
                details: incident
            }],
            metadata: {
                autoGenerated: true,
                templateVersion: '1.0'
            }
        };
        
        // Start collecting data
        this.activePostMortems.set(incident.id, postMortem);
        
        // Schedule automatic analysis
        setTimeout(() => {
            this.finalizePostMortem(incident.id);
        }, 3600000); // 1 hour after incident
    }
    
    async finalizePostMortem(incidentId) {
        const postMortem = this.activePostMortems.get(incidentId);
        if (!postMortem) return;
        
        try {
            // Analyze error patterns
            const analysis = await this.analyzeIncident(incidentId);
            
            postMortem.summary = analysis.summary;
            postMortem.rootCause = analysis.rootCause;
            postMortem.impact = analysis.impact;
            postMortem.actionItems = analysis.actionItems;
            postMortem.lessonsLearned = analysis.lessonsLearned;
            
            // Store post-mortem
            await this.storePostMortem(postMortem);
            
            // Notify team
            this.emit('post_mortem_completed', postMortem);
            
            this.activePostMortems.delete(incidentId);
            
        } catch (error) {
            console.error('Failed to finalize post-mortem:', error);
        }
    }
    
    async analyzeIncident(incidentId) {
        // Collect all related errors
        const errors = await this.getRelatedErrors(incidentId);
        
        // Analyze patterns
        const patterns = this.analyzeErrorPatterns(errors);
        
        // Generate insights
        return {
            summary: this.generateIncidentSummary(errors, patterns),
            rootCause: this.identifyRootCause(patterns),
            impact: await this.assessImpact(incidentId, errors),
            actionItems: this.generateActionItems(patterns),
            lessonsLearned: this.extractLessons(patterns)
        };
    }
    
    async getRelatedErrors(incidentId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM error_logs
                WHERE occurred_at BETWEEN 
                    (SELECT created_at - INTERVAL '1 hour' FROM incidents WHERE id = $1)
                    AND 
                    (SELECT created_at + INTERVAL '1 hour' FROM incidents WHERE id = $1)
                ORDER BY occurred_at
            `, [incidentId]);
            
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    analyzeErrorPatterns(errors) {
        const patterns = {
            errorTypes: {},
            services: {},
            timeline: [],
            commonalities: []
        };
        
        for (const error of errors) {
            // Count by type
            patterns.errorTypes[error.error_type] = 
                (patterns.errorTypes[error.error_type] || 0) + 1;
            
            // Count by service
            patterns.services[error.service_name] = 
                (patterns.services[error.service_name] || 0) + 1;
            
            // Build timeline
            patterns.timeline.push({
                timestamp: error.occurred_at,
                type: error.error_type,
                service: error.service_name
            });
        }
        
        // Find commonalities
        if (errors.length > 0) {
            const firstError = errors[0];
            patterns.commonalities = this.findCommonalities(errors, firstError);
        }
        
        return patterns;
    }
    
    generateIncidentSummary(errors, patterns) {
        const duration = errors.length > 0 ? 
            new Date(errors[errors.length - 1].occurred_at) - new Date(errors[0].occurred_at) : 0;
        
        return `Incident involved ${errors.length} errors across ${
            Object.keys(patterns.services).length
        } services over ${Math.round(duration / 60000)} minutes. ` +
        `Most common error type: ${this.getMostCommon(patterns.errorTypes)}.`;
    }
    
    identifyRootCause(patterns) {
        // Simple heuristic - most common error type in first 10% of timeline
        const earlyErrors = patterns.timeline.slice(0, Math.ceil(patterns.timeline.length * 0.1));
        const earlyTypes = {};
        
        for (const event of earlyErrors) {
            earlyTypes[event.type] = (earlyTypes[event.type] || 0) + 1;
        }
        
        return `Likely root cause: ${this.getMostCommon(earlyTypes)} errors in ${
            earlyErrors[0]?.service || 'unknown service'
        }`;
    }
    
    async assessImpact(incidentId, errors) {
        const client = await this.dbPool.connect();
        try {
            // Get request counts during incident
            const result = await client.query(`
                SELECT COUNT(DISTINCT user_id) as users_affected,
                       COUNT(*) as requests_failed
                FROM request_logs
                WHERE timestamp BETWEEN $1 AND $2
                  AND status >= 500
            `, [
                errors[0]?.occurred_at || new Date(),
                errors[errors.length - 1]?.occurred_at || new Date()
            ]);
            
            return {
                usersAffected: result.rows[0]?.users_affected || 0,
                requestsFailed: result.rows[0]?.requests_failed || errors.length,
                servicesAffected: Object.keys(patterns.services)
            };
        } finally {
            client.release();
        }
    }
    
    generateActionItems(patterns) {
        const actions = [];
        
        // Add monitoring for common error types
        for (const [errorType, count] of Object.entries(patterns.errorTypes)) {
            if (count > 5) {
                actions.push({
                    action: 'Add alerting',
                    details: `Create alert for ${errorType} errors when count > 3 in 5 minutes`,
                    priority: 'high'
                });
            }
        }
        
        // Add circuit breakers for affected services
        for (const service of Object.keys(patterns.services)) {
            actions.push({
                action: 'Add circuit breaker',
                details: `Implement circuit breaker for ${service} service`,
                priority: 'medium'
            });
        }
        
        return actions;
    }
    
    extractLessons(patterns) {
        const lessons = [];
        
        if (patterns.timeline.length > 50) {
            lessons.push('Cascade failure detected - need better isolation between services');
        }
        
        if (Object.keys(patterns.services).length > 3) {
            lessons.push('Multiple services affected - consider implementing bulkheads');
        }
        
        if (patterns.commonalities.includes('timeout')) {
            lessons.push('Timeout-related failures - review timeout configurations');
        }
        
        return lessons;
    }
    
    findCommonalities(errors, reference) {
        const commonalities = [];
        
        // Check for common error messages
        const commonWords = reference.message.split(' ')
            .filter(word => word.length > 4)
            .filter(word => 
                errors.every(e => e.message.includes(word))
            );
        
        if (commonWords.length > 0) {
            commonalities.push(...commonWords);
        }
        
        return commonalities;
    }
    
    getMostCommon(countMap) {
        let maxCount = 0;
        let mostCommon = 'unknown';
        
        for (const [item, count] of Object.entries(countMap)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = item;
            }
        }
        
        return mostCommon;
    }
    
    async storePostMortem(postMortem) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO post_mortems
                (id, incident_id, title, summary, root_cause,
                 impact, timeline, action_items, lessons_learned,
                 severity, duration_minutes, services_affected,
                 metadata, completed_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
            `, [
                postMortem.id,
                postMortem.incidentId,
                postMortem.title,
                postMortem.summary,
                postMortem.rootCause,
                JSON.stringify(postMortem.impact),
                JSON.stringify(postMortem.timeline),
                JSON.stringify(postMortem.actionItems),
                postMortem.lessonsLearned,
                'medium', // Default severity
                Math.round((postMortem.timeline[postMortem.timeline.length - 1].timestamp - 
                           postMortem.timeline[0].timestamp) / 60000),
                postMortem.impact.servicesAffected,
                JSON.stringify(postMortem.metadata)
            ]);
        } finally {
            client.release();
        }
    }
    
    // Recovery Procedures
    
    async loadRecoveryProcedures() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM recovery_procedures
                WHERE active = true
                ORDER BY priority DESC
            `);
            
            for (const procedure of result.rows) {
                this.recoveryHandlers.set(
                    procedure.error_pattern,
                    procedure
                );
            }
            
            console.log(`Loaded ${result.rows.length} recovery procedures`);
            
        } finally {
            client.release();
        }
    }
    
    async executeProcedure(procedure, context) {
        console.log(`Executing procedure: ${procedure.procedure_name}`);
        
        const results = [];
        
        for (const step of procedure.steps) {
            try {
                const result = await this.executeStep(step, context);
                results.push({
                    step: step.name,
                    success: true,
                    result
                });
                
                // Check if we should continue
                if (step.stopOnSuccess && result.success) {
                    break;
                }
            } catch (error) {
                results.push({
                    step: step.name,
                    success: false,
                    error: error.message
                });
                
                if (step.required) {
                    throw new Error(`Required step ${step.name} failed`);
                }
            }
        }
        
        return results;
    }
    
    async executeStep(step, context) {
        switch (step.type) {
            case 'restart_service':
                return await this.restartService(step.service || context.service);
                
            case 'clear_cache':
                return await this.clearCache(step.cache || context.cache);
                
            case 'reset_connections':
                return await this.resetConnections(step.pool || 'default');
                
            case 'run_script':
                return await this.runScript(step.script, context);
                
            case 'notify':
                return await this.sendNotification(step.recipient, step.message);
                
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }
    
    // Helper Methods
    
    initializeDefaultHandlers() {
        // Set up default recovery handlers
        this.serviceRates = new Map();
        this.retryAttempts = new Map();
        this.activePostMortems = new Map();
        this.criticalServices = new Set(['auth', 'database', 'payment']);
    }
    
    async logError(errorData) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO error_logs
                (error_id, category, error_type, message,
                 stack_trace, context, service_name,
                 environment, severity)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                errorData.errorId,
                errorData.category,
                errorData.error.name || 'Error',
                errorData.error.message,
                errorData.error.stack,
                JSON.stringify(errorData.context),
                errorData.context.service || 'unknown',
                process.env.NODE_ENV || 'production',
                errorData.context.severity || 'error'
            ]);
        } finally {
            client.release();
        }
    }
    
    async recordRecoveryAttempt(attempt) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO recovery_attempts
                (error_id, strategy, attempt_number,
                 success, duration_ms, result)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                attempt.errorId,
                attempt.strategy,
                1, // Simplified - would track actual attempts
                attempt.success,
                Math.round(attempt.duration),
                JSON.stringify(attempt.result)
            ]);
        } finally {
            client.release();
        }
    }
    
    updateErrorMetrics(category) {
        this.metrics.totalErrors++;
        this.metrics.errorsByCategory[category] = 
            (this.metrics.errorsByCategory[category] || 0) + 1;
    }
    
    executeRejection(error, context) {
        return {
            success: false,
            strategy: 'reject',
            error: error.message,
            rejected: true
        };
    }
    
    lastResortFallback(error, context) {
        console.error('Last resort fallback activated');
        return {
            success: false,
            strategy: 'last_resort',
            error: error.message,
            context
        };
    }
    
    async getCache(key) {
        // Simplified cache lookup
        return null;
    }
    
    async callAlternateService(service, context) {
        // Simplified alternate service call
        throw new Error('Alternate service not configured');
    }
    
    async restartService(service) {
        console.log(`Restarting service: ${service}`);
        // In production, would integrate with orchestration platform
        return { success: true };
    }
    
    async clearCache(cache) {
        console.log(`Clearing cache: ${cache}`);
        // In production, would clear actual cache
        return { success: true };
    }
    
    async resetConnections(pool) {
        console.log(`Resetting connection pool: ${pool}`);
        // In production, would reset actual connections
        return { success: true };
    }
    
    async runScript(script, context) {
        console.log(`Running recovery script: ${script}`);
        // In production, would execute actual script
        return { success: true };
    }
    
    async sendNotification(recipient, message) {
        console.log(`Sending notification to ${recipient}: ${message}`);
        // In production, would send actual notification
        return { success: true };
    }
    
    async triggerFailover(service) {
        console.log(`Triggering failover for service: ${service}`);
        this.emit('failover_triggered', { service });
    }
    
    // Monitoring
    
    startMonitoring() {
        // Periodic metrics reporting
        setInterval(() => {
            this.reportMetrics();
        }, this.config.metricsInterval);
        
        // Error budget window cleanup
        setInterval(() => {
            this.cleanupOldBudgets();
        }, 3600000); // Hourly
        
        // Circuit breaker state sync
        setInterval(() => {
            this.syncCircuitBreakerStates();
        }, 30000); // 30 seconds
    }
    
    reportMetrics() {
        this.emit('metrics', {
            ...this.metrics,
            circuitBreakers: this.getCircuitBreakerStats(),
            errorBudgets: this.getErrorBudgetStats(),
            timestamp: new Date()
        });
    }
    
    getCircuitBreakerStats() {
        const stats = {};
        
        for (const [name, breaker] of this.circuitBreakers) {
            stats[name] = {
                state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
                stats: breaker.stats
            };
        }
        
        return stats;
    }
    
    async getErrorBudgetStats() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT service_name,
                       AVG(error_rate) as avg_error_rate,
                       MIN(budget_remaining) as min_budget,
                       COUNT(CASE WHEN is_exhausted THEN 1 END) as exhausted_count
                FROM error_budgets
                WHERE time_window > NOW() - INTERVAL '24 hours'
                GROUP BY service_name
            `);
            
            const stats = {};
            for (const row of result.rows) {
                stats[row.service_name] = {
                    errorRate: row.avg_error_rate,
                    budgetRemaining: row.min_budget,
                    exhaustedWindows: row.exhausted_count
                };
            }
            
            return stats;
            
        } finally {
            client.release();
        }
    }
    
    async cleanupOldBudgets() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                DELETE FROM error_budgets
                WHERE time_window < NOW() - INTERVAL '7 days'
            `);
        } finally {
            client.release();
        }
    }
    
    async syncCircuitBreakerStates() {
        for (const [name, breaker] of this.circuitBreakers) {
            const state = breaker.opened ? 'open' : 
                         breaker.halfOpen ? 'half-open' : 'closed';
            
            await this.updateCircuitBreakerState(name, state);
        }
    }
    
    // Graceful Shutdown
    
    async shutdown() {
        console.log('Shutting down Error Recovery Framework');
        
        // Close circuit breakers gracefully
        for (const [name, breaker] of this.circuitBreakers) {
            breaker.shutdown();
        }
        
        // Finalize any active post-mortems
        for (const [incidentId, postMortem] of this.activePostMortems) {
            await this.finalizePostMortem(incidentId);
        }
        
        // Close database pool
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Error Recovery Framework shut down');
    }
}

// Wrapper for easy circuit breaker creation
export function withCircuitBreaker(fn, options = {}) {
    const framework = new ErrorRecoveryFramework();
    const name = options.name || fn.name || 'anonymous';
    
    const breaker = framework.createCircuitBreaker(name, fn, options);
    
    return (...args) => breaker.fire(...args);
}

// Wrapper for retry logic
export function withRetry(fn, options = {}) {
    const framework = new ErrorRecoveryFramework();
    
    return async (...args) => {
        try {
            const result = await fn(...args);
            return result;
        } catch (error) {
            const recovery = await framework.handleError(error, {
                operation: () => fn(...args),
                ...options
            });
            
            if (recovery.success) {
                return recovery.result;
            }
            
            throw new Error(recovery.error || error.message);
        }
    };
}

// Export factory function
export function createErrorRecoveryFramework(config) {
    return new ErrorRecoveryFramework(config);
}
```

### Usage Example

```javascript
// error-recovery-usage.js
import { 
    createErrorRecoveryFramework, 
    withCircuitBreaker, 
    withRetry 
} from './error-recovery-framework.js';

async function main() {
    const recovery = createErrorRecoveryFramework({
        circuitBreaker: {
            timeout: 5000,
            errorThresholdPercentage: 50
        },
        errorBudget: {
            threshold: 0.001 // 0.1% error rate
        }
    });
    
    await recovery.initialize();
    
    // Example 1: Circuit breaker for external service
    const fetchUserData = withCircuitBreaker(
        async (userId) => {
            const response = await fetch(`https://api.example.com/users/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        },
        {
            name: 'user-api:fetch:critical',
            timeout: 3000,
            errorThresholdPercentage: 30
        }
    );
    
    // Example 2: Retry logic for database operation
    const saveToDatabase = withRetry(
        async (data) => {
            return await db.collection('data').insert(data);
        },
        {
            service: 'database',
            retries: 3,
            minTimeout: 1000
        }
    );
    
    // Example 3: Complex error handling
    try {
        const result = await recovery.handleError(
            new Error('Database connection lost'),
            {
                service: 'construction-api',
                operation: async () => {
                    // Retry the operation
                    return await reconnectDatabase();
                },
                fallbackValue: { status: 'degraded' },
                allowDegraded: true,
                cacheKey: 'last-known-state'
            }
        );
        
        console.log('Recovery result:', result);
        
    } catch (error) {
        console.error('Recovery failed:', error);
    }
    
    // Example 4: Manual incident creation
    const incident = await recovery.executeEscalation(
        new Error('Critical system failure'),
        {
            service: 'payment-processor',
            severity: 'critical'
        }
    );
    
    console.log('Incident created:', incident);
    
    // Get metrics
    console.log('Recovery metrics:', recovery.metrics);
}

main();
```

### Integration with Construction Systems

```javascript
// construction-error-integration.js
import { createErrorRecoveryFramework } from './error-recovery-framework.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionErrorHandler {
    constructor() {
        this.recovery = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.recovery = createErrorRecoveryFramework({
            errorCategories: {
                'TRANSIENT': ['ECONNREFUSED', 'ETIMEDOUT', 'NetworkError'],
                'HOAI': ['HOAIViolation', 'ComplianceError', 'FeeCalculationError'],
                'SAFETY': ['SafetyViolation', 'RiskThresholdExceeded'],
                'MATERIAL': ['MaterialShortage', 'CompatibilityError'],
                'SCHEDULING': ['ScheduleConflict', 'ResourceUnavailable']
            },
            recoveryStrategies: {
                'HOAI': 'escalate',
                'SAFETY': 'escalate',
                'MATERIAL': 'fallback',
                'SCHEDULING': 'retry'
            }
        });
        
        await this.recovery.initialize();
        
        // Set up construction-specific handlers
        this.setupConstructionHandlers();
        
        // Create circuit breakers for critical services
        this.setupCircuitBreakers();
    }
    
    setupConstructionHandlers() {
        // HOAI compliance handler
        this.recovery.on('error_logged', async (error) => {
            if (error.category === 'HOAI') {
                await this.handleHOAIError(error);
            }
        });
        
        // Safety violation handler
        this.recovery.on('error_logged', async (error) => {
            if (error.category === 'SAFETY') {
                await this.handleSafetyError(error);
            }
        });
        
        // Error budget exhaustion handler
        this.recovery.on('error_budget_exhausted', async (data) => {
            await this.handleBudgetExhaustion(data);
        });
        
        // Circuit breaker trip handler
        this.recovery.on('circuit_breaker_opened', async (data) => {
            await this.handleCircuitBreakerTrip(data);
        });
    }
    
    setupCircuitBreakers() {
        // BIM service circuit breaker
        this.bimService = this.recovery.createCircuitBreaker(
            'bim:api:critical',
            async (modelId) => {
                return await this.fetchBIMModel(modelId);
            },
            {
                timeout: 10000,
                errorThresholdPercentage: 20
            }
        );
        
        // Material database circuit breaker
        this.materialService = this.recovery.createCircuitBreaker(
            'material:database:critical',
            async (query) => {
                return await this.queryMaterialDatabase(query);
            },
            {
                timeout: 5000,
                errorThresholdPercentage: 30
            }
        );
        
        // Quantity calculation circuit breaker
        this.quantityService = this.recovery.createCircuitBreaker(
            'quantity:calculation:standard',
            async (projectId) => {
                return await this.calculateQuantities(projectId);
            },
            {
                timeout: 30000,
                errorThresholdPercentage: 40
            }
        );
    }
    
    async handleConstructionError(error, context) {
        try {
            // Add construction-specific context
            const enrichedContext = {
                ...context,
                projectId: context.projectId || this.getCurrentProjectId(),
                phase: context.phase || this.getCurrentHOAIPhase(),
                timestamp: new Date()
            };
            
            // Let the framework handle it
            const result = await this.recovery.handleError(error, enrichedContext);
            
            // Log to construction audit trail
            await this.logToAuditTrail(error, enrichedContext, result);
            
            return result;
            
        } catch (recoveryError) {
            console.error('Construction error handling failed:', recoveryError);
            throw recoveryError;
        }
    }
    
    async handleHOAIError(error) {
        console.log('Handling HOAI compliance error:', error.message);
        
        try {
            // Check if it affects fee calculations
            if (error.message.includes('fee')) {
                await this.recalculateFees(error.context.projectId);
            }
            
            // Notify compliance officer
            await this.notifyCompliance({
                type: 'HOAI_VIOLATION',
                error: error.message,
                projectId: error.context.projectId,
                phase: error.context.phase
            });
            
            // Create compliance report
            await this.createComplianceReport(error);
            
        } catch (handlingError) {
            console.error('Failed to handle HOAI error:', handlingError);
        }
    }
    
    async handleSafetyError(error) {
        console.log('Handling safety violation:', error.message);
        
        try {
            // Immediate safety measures
            if (error.context.severity === 'critical') {
                await this.triggerSafetyProtocol(error.context.projectId);
            }
            
            // Log safety incident
            await this.logSafetyIncident({
                projectId: error.context.projectId,
                description: error.message,
                location: error.context.location,
                severity: error.context.severity
            });
            
            // Notify safety officer
            await this.notifySafetyOfficer(error);
            
        } catch (handlingError) {
            console.error('Failed to handle safety error:', handlingError);
        }
    }
    
    async handleBudgetExhaustion(data) {
        console.log(`Error budget exhausted for ${data.service}`);
        
        // Service-specific actions
        switch (data.service) {
            case 'quantity-calculation':
                // Switch to simplified calculations
                await this.enableSimplifiedMode('quantity');
                break;
                
            case 'material-database':
                // Use cached data only
                await this.enableCacheOnlyMode('material');
                break;
                
            case 'bim-service':
                // Disable real-time updates
                await this.disableRealtimeUpdates('bim');
                break;
        }
    }
    
    async handleCircuitBreakerTrip(data) {
        const { service } = this.recovery.parseCircuitBreakerName(data.name);
        
        console.log(`Circuit breaker tripped for ${service}`);
        
        // Implement fallback strategies
        switch (service) {
            case 'bim':
                await this.switchToOfflineBIM();
                break;
                
            case 'material':
                await this.useLocalMaterialCache();
                break;
                
            case 'quantity':
                await this.useHistoricalQuantities();
                break;
        }
    }
    
    async recalculateFees(projectId) {
        console.log(`Recalculating fees for project ${projectId}`);
        
        await this.dbPool.query(`
            UPDATE project_fees
            SET status = 'recalculation_required',
                updated_at = NOW()
            WHERE project_id = $1
        `, [projectId]);
    }
    
    async notifyCompliance(notification) {
        // In production, would send actual notification
        console.log('Compliance notification:', notification);
    }
    
    async createComplianceReport(error) {
        await this.dbPool.query(`
            INSERT INTO compliance_reports
            (project_id, error_type, description, created_at)
            VALUES ($1, $2, $3, NOW())
        `, [
            error.context.projectId,
            'HOAI_ERROR',
            error.message
        ]);
    }
    
    async triggerSafetyProtocol(projectId) {
        console.log(`EMERGENCY: Safety protocol triggered for project ${projectId}`);
        
        // In production, would trigger actual safety measures
        await this.dbPool.query(`
            INSERT INTO safety_protocols_triggered
            (project_id, trigger_reason, triggered_at)
            VALUES ($1, $2, NOW())
        `, [projectId, 'Critical safety error']);
    }
    
    async logSafetyIncident(incident) {
        await this.dbPool.query(`
            INSERT INTO safety_incidents
            (project_id, description, location, severity, reported_at)
            VALUES ($1, $2, $3, $4, NOW())
        `, [
            incident.projectId,
            incident.description,
            JSON.stringify(incident.location),
            incident.severity
        ]);
    }
    
    async notifySafetyOfficer(error) {
        // In production, would send actual notification
        console.log('Safety officer notification:', error.message);
    }
    
    async enableSimplifiedMode(service) {
        console.log(`Enabling simplified mode for ${service}`);
        this.simplifiedModes.set(service, true);
    }
    
    async enableCacheOnlyMode(service) {
        console.log(`Enabling cache-only mode for ${service}`);
        this.cacheOnlyModes.set(service, true);
    }
    
    async disableRealtimeUpdates(service) {
        console.log(`Disabling real-time updates for ${service}`);
        this.realtimeDisabled.set(service, true);
    }
    
    async switchToOfflineBIM() {
        console.log('Switching to offline BIM mode');
        this.offlineMode.bim = true;
    }
    
    async useLocalMaterialCache() {
        console.log('Using local material cache');
        this.localCacheMode.material = true;
    }
    
    async useHistoricalQuantities() {
        console.log('Using historical quantities');
        this.historicalMode.quantity = true;
    }
    
    async logToAuditTrail(error, context, result) {
        await this.dbPool.query(`
            INSERT INTO error_audit_trail
            (error_id, error_message, context, recovery_result,
             recovery_success, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [
            context.errorId || uuidv4(),
            error.message,
            JSON.stringify(context),
            JSON.stringify(result),
            result.success
        ]);
    }
    
    getCurrentProjectId() {
        // Would get from context or session
        return 'current-project-id';
    }
    
    getCurrentHOAIPhase() {
        // Would get from project state
        return 'LP3';
    }
    
    async fetchBIMModel(modelId) {
        // Actual BIM fetch implementation
        throw new Error('BIM service temporarily unavailable');
    }
    
    async queryMaterialDatabase(query) {
        // Actual material database query
        return await this.dbPool.query(query);
    }
    
    async calculateQuantities(projectId) {
        // Actual quantity calculation
        return { projectId, quantities: [] };
    }
    
    // Initialization helpers
    constructor() {
        this.simplifiedModes = new Map();
        this.cacheOnlyModes = new Map();
        this.realtimeDisabled = new Map();
        this.offlineMode = {};
        this.localCacheMode = {};
        this.historicalMode = {};
    }
}

// Export wrapped functions for common operations
export const safeHOAICalculation = withRetry(
    async (projectId, phase) => {
        // HOAI calculation logic
        return { fee: 0 };
    },
    {
        service: 'hoai-calculation',
        retries: 3,
        category: 'HOAI'
    }
);

export const safeMaterialQuery = withCircuitBreaker(
    async (materialCode) => {
        // Material query logic
        return { material: {} };
    },
    {
        name: 'material:query:standard',
        timeout: 5000
    }
);
```

## Testing

```javascript
// error-recovery.test.js
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createErrorRecoveryFramework } from './error-recovery-framework.js';

describe('ErrorRecoveryFramework', () => {
    let recovery;
    
    beforeEach(async () => {
        recovery = createErrorRecoveryFramework({
            retry: { retries: 2, minTimeout: 100 }
        });
        await recovery.initialize();
    });
    
    test('should categorize errors correctly', () => {
        const transientError = new Error('ECONNREFUSED');
        expect(recovery.categorizeError(transientError)).toBe('TRANSIENT');
        
        const validationError = new TypeError('Invalid input');
        expect(recovery.categorizeError(validationError)).toBe('VALIDATION');
    });
    
    test('should retry transient errors', async () => {
        let attempts = 0;
        const operation = jest.fn(() => {
            attempts++;
            if (attempts < 3) {
                throw new Error('ECONNREFUSED');
            }
            return { success: true };
        });
        
        const result = await recovery.handleError(
            new Error('ECONNREFUSED'),
            { operation }
        );
        
        expect(result.success).toBe(true);
        expect(result.strategy).toBe('retry');
        expect(attempts).toBe(3);
    });
    
    test('should use fallback for business errors', async () => {
        const error = new Error('BusinessRuleViolation');
        
        const result = await recovery.handleError(error, {
            defaultValue: { fallback: true }
        });
        
        expect(result.success).toBe(true);
        expect(result.strategy).toBe('fallback');
        expect(result.method).toBe('default');
    });
    
    test('should track error budget', async () => {
        const service = 'test-service';
        
        // Generate errors
        for (let i = 0; i < 10; i++) {
            await recovery.handleError(
                new Error('Test error'),
                { service }
            );
        }
        
        const budget = await recovery.checkErrorBudget(service);
        expect(budget.errorRate).toBeGreaterThan(0);
    });
    
    test('should handle circuit breaker', async () => {
        const failingFunction = jest.fn(() => {
            throw new Error('Service unavailable');
        });
        
        const breaker = recovery.createCircuitBreaker(
            'test:service:standard',
            failingFunction,
            {
                errorThresholdPercentage: 50,
                volumeThreshold: 2
            }
        );
        
        // Trigger failures
        for (let i = 0; i < 3; i++) {
            try {
                await breaker.fire();
            } catch (e) {
                // Expected
            }
        }
        
        expect(breaker.opened).toBe(true);
    });
});
```

This implementation provides a comprehensive error recovery framework with circuit breakers, retry mechanisms, fallback strategies, error categorization, budget tracking, and post-mortem automation for the construction syndicate system.
