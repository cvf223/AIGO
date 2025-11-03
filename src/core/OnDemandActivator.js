/**
 * 🎯 ON-DEMAND ACTIVATOR
 * ======================
 * 
 * Handles user requests and activates only required systems temporarily.
 * Ensures efficient resource usage by keeping systems idle until needed.
 * 
 * @module OnDemandActivator
 */

import { EventEmitter } from 'events';
import { serviceRegistry } from '../core/ServiceRegistry.js';
import { systemObservationController } from './SystemObservationController.js';

export class OnDemandActivator extends EventEmitter {
    constructor() {
        super();
        this.name = 'OnDemandActivator';
        
        // Track active requests
        this.activeRequests = new Map();
        this.requestCounter = 0;
        
        // System dependency map - which systems are needed for different request types
        this.systemDependencies = {
            // LLM operations
            'llm_prompt': ['ollamaService', 'centralNervousSystem', 'sharedMemory'],
            'llm_chat': ['ollamaService', 'contextEngine', 'sharedMemory'],
            'llm_analysis': ['ollamaService', 'centralNervousSystem', 'worldModel', 'contextEngine'],
            
            // Construction operations
            'construction_analysis': ['constructionOrchestrator', 'syndicateFactory', 'worldModel'],
            'hoai_compliance': ['constructionOrchestrator', 'database'],
            'quantity_surveying': ['constructionOrchestrator', 'database', 'ultraFastTransformer'],
            
            // Learning operations
            'training': ['alphaGnome', 'quantumEvolution', 'sharedMemory'],
            'evolution': ['quantumEvolution', 'syndicateFactory'],
            'optimization': ['ultraFastTransformer', 'quantumEvolution'],
            
            // Memory operations
            'memory_store': ['sharedMemory', 'database', 'statePersistence'],
            'memory_recall': ['sharedMemory', 'contextEngine'],
            
            // System operations
            'health_check': [], // No dependencies, just status
            'system_status': ['database'],
            'backup': ['statePersistence', 'database']
        };
        
        // Metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            systemActivations: new Map()
        };
        
        console.log('🎯 OnDemandActivator: Initialized');
    }
    
    /**
     * Handle user request with minimal system activation
     */
    async handleUserRequest(requestType, requestData = {}, options = {}) {
        const requestId = `req_${++this.requestCounter}_${Date.now()}`;
        const startTime = Date.now();
        
        console.log('\n' + '─'.repeat(50));
        console.log(`🎯 PROCESSING USER REQUEST`);
        console.log(`   ID: ${requestId}`);
        console.log(`   Type: ${requestType}`);
        console.log('─'.repeat(50));
        
        // Track active request
        this.activeRequests.set(requestId, {
            type: requestType,
            startTime,
            status: 'processing'
        });
        
        try {
            // Determine required systems
            const requiredSystems = this.determineRequiredSystems(requestType, options);
            console.log('   📊 Required systems:', requiredSystems.join(', ') || 'None');
            
            // Exit observation mode for required systems only
            const activatedSystems = await this.activateSystems(requiredSystems);
            console.log('   ✅ Systems activated:', activatedSystems.length);
            
            // Process the request
            console.log('   ⚙️ Processing request...');
            const result = await this.processRequest(requestType, requestData, activatedSystems);
            
            // Return systems to observation mode
            console.log('   🔄 Returning to idle state...');
            await this.deactivateSystems(activatedSystems);
            
            // Update metrics
            const responseTime = Date.now() - startTime;
            this.updateMetrics(requestType, true, responseTime);
            
            // Mark request as complete
            this.activeRequests.get(requestId).status = 'completed';
            this.activeRequests.get(requestId).responseTime = responseTime;
            
            console.log(`   ✅ Request completed in ${responseTime}ms`);
            console.log('─'.repeat(50) + '\n');
            
            return {
                success: true,
                requestId,
                responseTime,
                result
            };
            
        } catch (error) {
            // Handle error
            console.error('   ❌ Request failed:', error.message);
            
            // Update metrics
            const responseTime = Date.now() - startTime;
            this.updateMetrics(requestType, false, responseTime);
            
            // Mark request as failed
            this.activeRequests.get(requestId).status = 'failed';
            this.activeRequests.get(requestId).error = error.message;
            
            console.log('─'.repeat(50) + '\n');
            
            return {
                success: false,
                requestId,
                responseTime,
                error: error.message
            };
        }
    }
    
    /**
     * Determine which systems are required for a request type
     */
    determineRequiredSystems(requestType, options = {}) {
        // Get base dependencies
        let requiredSystems = this.systemDependencies[requestType] || [];
        
        // Add additional systems based on options
        if (options.additionalSystems) {
            requiredSystems = [...requiredSystems, ...options.additionalSystems];
        }
        
        // Remove duplicates
        return [...new Set(requiredSystems)];
    }
    
    /**
     * Activate required systems temporarily
     */
    async activateSystems(systemNames) {
        const activated = [];
        
        for (const systemName of systemNames) {
            try {
                // Get system from registry
                const system = await serviceRegistry.get(systemName, { optional: true });
                
                if (system) {
                    // Exit observation mode for this system
                    if (typeof system.exitObservationMode === 'function') {
                        system.exitObservationMode();
                    }
                    
                    // Track activation
                    activated.push(systemName);
                    this.metrics.systemActivations.set(
                        systemName,
                        (this.metrics.systemActivations.get(systemName) || 0) + 1
                    );
                }
            } catch (error) {
                console.warn(`   ⚠️ Could not activate ${systemName}:`, error.message);
            }
        }
        
        return activated;
    }
    
    /**
     * Deactivate systems and return to observation mode
     */
    async deactivateSystems(systemNames) {
        for (const systemName of systemNames) {
            try {
                const system = await serviceRegistry.get(systemName, { optional: true });
                
                if (system && typeof system.enterObservationMode === 'function') {
                    system.enterObservationMode();
                }
            } catch (error) {
                console.warn(`   ⚠️ Could not deactivate ${systemName}:`, error.message);
            }
        }
    }
    
    /**
     * Process the actual request based on type
     */
    async processRequest(requestType, requestData, activatedSystems) {
        switch (requestType) {
            case 'llm_prompt':
                return await this.processLLMPrompt(requestData);
                
            case 'llm_chat':
                return await this.processLLMChat(requestData);
                
            case 'llm_analysis':
                return await this.processLLMAnalysis(requestData);
                
            case 'construction_analysis':
                return await this.processConstructionAnalysis(requestData);
                
            case 'hoai_compliance':
                return await this.processHOAICompliance(requestData);
                
            case 'quantity_surveying':
                return await this.processQuantitySurveying(requestData);
                
            case 'memory_store':
                return await this.processMemoryStore(requestData);
                
            case 'memory_recall':
                return await this.processMemoryRecall(requestData);
                
            case 'health_check':
                return await this.processHealthCheck();
                
            case 'system_status':
                return await this.processSystemStatus();
                
            default:
                // Generic processing
                return await this.processGeneric(requestType, requestData, activatedSystems);
        }
    }
    
    /**
     * Process LLM prompt request
     */
    async processLLMPrompt(data) {
        const ollamaService = await serviceRegistry.get('ollamaService', { optional: true });
        
        if (!ollamaService) {
            throw new Error('Ollama service not available');
        }
        
        const response = await ollamaService.generateResponse(
            data.prompt,
            data.model || 'primary',
            data.context || {}
        );
        
        return response;
    }
    
    /**
     * Process LLM chat request
     */
    async processLLMChat(data) {
        const ollamaService = await serviceRegistry.get('ollamaService', { optional: true });
        const contextEngine = await serviceRegistry.get('contextEngine', { optional: true });
        
        if (!ollamaService) {
            throw new Error('Ollama service not available');
        }
        
        // Get context if available
        let context = {};
        if (contextEngine) {
            context = await contextEngine.getContext(data.conversationId);
        }
        
        const response = await ollamaService.chat(
            data.message,
            data.history || [],
            data.model || 'primary',
            context
        );
        
        return response;
    }
    
    /**
     * Process LLM analysis request
     */
    async processLLMAnalysis(data) {
        const ollamaService = await serviceRegistry.get('ollamaService', { optional: true });
        const worldModel = await serviceRegistry.get('worldModel', { optional: true });
        
        if (!ollamaService) {
            throw new Error('Ollama service not available');
        }
        
        // Get world model context if available
        let worldContext = {};
        if (worldModel) {
            worldContext = await worldModel.getRelevantContext(data.topic);
        }
        
        const response = await ollamaService.analyze(
            data.content,
            data.analysisType,
            worldContext
        );
        
        return response;
    }
    
    /**
     * Process construction analysis request
     */
    async processConstructionAnalysis(data) {
        const orchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
        
        if (!orchestrator) {
            throw new Error('Construction orchestrator not available');
        }
        
        return await orchestrator.analyzeProject(data);
    }
    
    /**
     * Process HOAI compliance check
     */
    async processHOAICompliance(data) {
        const orchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
        
        if (!orchestrator) {
            throw new Error('Construction orchestrator not available');
        }
        
        return await orchestrator.checkHOAICompliance(data);
    }
    
    /**
     * Process quantity surveying request
     */
    async processQuantitySurveying(data) {
        const orchestrator = await serviceRegistry.get('constructionOrchestrator', { optional: true });
        
        if (!orchestrator) {
            throw new Error('Construction orchestrator not available');
        }
        
        return await orchestrator.performQuantitySurveying(data);
    }
    
    /**
     * Process memory store request
     */
    async processMemoryStore(data) {
        const sharedMemory = await serviceRegistry.get('sharedMemory', { optional: true });
        
        if (!sharedMemory) {
            throw new Error('Shared memory not available');
        }
        
        return await sharedMemory.store(data.key, data.value, data.metadata);
    }
    
    /**
     * Process memory recall request
     */
    async processMemoryRecall(data) {
        const sharedMemory = await serviceRegistry.get('sharedMemory', { optional: true });
        
        if (!sharedMemory) {
            throw new Error('Shared memory not available');
        }
        
        return await sharedMemory.recall(data.key, data.options);
    }
    
    /**
     * Process health check
     */
    async processHealthCheck() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            activeRequests: this.activeRequests.size,
            metrics: this.getMetrics()
        };
    }
    
    /**
     * Process system status request
     */
    async processSystemStatus() {
        const status = {
            observationMode: systemObservationController.getStatus(),
            activeRequests: Array.from(this.activeRequests.values()),
            metrics: this.getMetrics()
        };
        
        return status;
    }
    
    /**
     * Process generic request
     */
    async processGeneric(requestType, requestData, activatedSystems) {
        // Generic processing logic
        return {
            requestType,
            processedAt: new Date().toISOString(),
            activatedSystems,
            data: requestData
        };
    }
    
    /**
     * Update metrics
     */
    updateMetrics(requestType, success, responseTime) {
        this.metrics.totalRequests++;
        
        if (success) {
            this.metrics.successfulRequests++;
        } else {
            this.metrics.failedRequests++;
        }
        
        // Update average response time
        const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime;
        this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests;
    }
    
    /**
     * Get activator metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalRequests > 0 ? 
                (this.metrics.successfulRequests / this.metrics.totalRequests) : 0,
            activeRequests: this.activeRequests.size,
            topActivatedSystems: Array.from(this.metrics.systemActivations.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
        };
    }
    
    /**
     * Clean up completed requests
     */
    cleanupCompletedRequests() {
        const cutoffTime = Date.now() - 3600000; // 1 hour
        
        for (const [requestId, request] of this.activeRequests) {
            if (request.status !== 'processing' && request.startTime < cutoffTime) {
                this.activeRequests.delete(requestId);
            }
        }
    }
    
    /**
     * Shutdown the activator
     */
    async shutdown() {
        console.log('🛑 Shutting down OnDemandActivator...');
        
        // Wait for active requests to complete
        if (this.activeRequests.size > 0) {
            console.log(`   Waiting for ${this.activeRequests.size} active requests...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Clear all listeners
        this.removeAllListeners();
        
        console.log('✅ OnDemandActivator shutdown complete');
    }
}

// Export singleton instance
export const onDemandActivator = new OnDemandActivator();

// Also export class for testing
export default OnDemandActivator;
