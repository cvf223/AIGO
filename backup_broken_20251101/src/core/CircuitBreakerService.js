/**
 * 🔌 CIRCUIT BREAKER SERVICE - PRODUCTION STABILITY
 * ================================================
 * 
 * Prevents cascade failures by breaking connections to failing services
 * Essential for 896GB RAM server to prevent resource exhaustion
 * 
 * States: CLOSED (normal) -> OPEN (failing) -> HALF_OPEN (testing)
 */

import CircuitBreaker from 'opossum';
import { EventEmitter } from 'events';

export class CircuitBreakerService extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Default circuit breaker settings
            timeout: config.timeout || 30000,              // 30 second timeout
            errorThresholdPercentage: config.errorThresholdPercentage || 50,
            resetTimeout: config.resetTimeout || 30000,    // Try again after 30s
            rollingCountTimeout: config.rollingCountTimeout || 60000, // 1 minute window
            rollingCountBuckets: config.rollingCountBuckets || 10,
            volumeThreshold: config.volumeThreshold || 10, // Min requests before opening
            
            // Custom settings for high-memory environment
            allowWarmUp: config.allowWarmUp !== false,     // Gradual traffic increase
            capacity: config.capacity || 1000,             // Max concurrent requests
            
            ...config
        };
        
        // 🔌 Circuit breakers for different services
        this.breakers = new Map();
        
        // 📊 Metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            circuitOpens: 0,
            fallbackExecutions: 0
        };
        
        console.log('🔌 Circuit Breaker Service initialized');
        console.log(`   ⏱️ Timeout: ${this.config.timeout}ms`);
        console.log(`   🚨 Error threshold: ${this.config.errorThresholdPercentage}%`);
        console.log(`   🔄 Reset after: ${this.config.resetTimeout}ms`);
    }
    
    /**
     * 🔌 CREATE CIRCUIT BREAKER FOR SERVICE
     * 
     * @param {string} serviceName - Name of the service
     * @param {Function} serviceFunction - Function to wrap
     * @param {Object} customConfig - Override default config
     * @returns {CircuitBreaker} Configured circuit breaker
     */
    createBreaker(serviceName, serviceFunction, customConfig = {}) {
        if (this.breakers.has(serviceName)) {
            console.log(`   ♻️ Reusing existing breaker for ${serviceName}`);
            return this.breakers.get(serviceName);
        }
        
        const config = {
            ...this.config,
            ...customConfig,
            name: serviceName
        };
        
        console.log(`🔌 Creating circuit breaker for ${serviceName}`);
        
        const breaker = new CircuitBreaker(serviceFunction, config);
        
        // 📊 BREAKER EVENT MONITORING
        breaker.on('open', () => {
            this.metrics.circuitOpens++;
            console.error(`🚨 Circuit OPENED for ${serviceName} - Too many failures!`);
            this.emit('circuit-open', { service: serviceName, timestamp: Date.now() });
        });
        
        breaker.on('halfOpen', () => {
            console.warn(`⚡ Circuit HALF-OPEN for ${serviceName} - Testing...`);
            this.emit('circuit-half-open', { service: serviceName, timestamp: Date.now() });
        });
        
        breaker.on('close', () => {
            console.log(`✅ Circuit CLOSED for ${serviceName} - Service recovered`);
            this.emit('circuit-close', { service: serviceName, timestamp: Date.now() });
        });
        
        breaker.on('success', (result) => {
            this.metrics.successfulRequests++;
            this.metrics.totalRequests++;
        });
        
        breaker.on('failure', (error) => {
            this.metrics.failedRequests++;
            this.metrics.totalRequests++;
            console.error(`❌ ${serviceName} request failed:`, error.message);
        });
        
        breaker.on('timeout', () => {
            console.error(`⏱️ ${serviceName} request timed out after ${config.timeout}ms`);
        });
        
        breaker.on('reject', () => {
            console.warn(`🚫 ${serviceName} request rejected - Circuit is OPEN`);
        });
        
        breaker.on('fallback', (result) => {
            this.metrics.fallbackExecutions++;
            console.warn(`🔄 ${serviceName} fallback executed`);
        });
        
        // 🧮 FALLBACK FUNCTION
        breaker.fallback((error) => {
            console.log(`🔄 Executing fallback for ${serviceName}`);
            
            // Service-specific fallbacks
            switch (serviceName) {
                case 'llm-service':
                    return {
                        judgment: { approve: false, confidence: 0 },
                        reason: 'LLM service unavailable - conservative fallback',
                        fallback: true
                    };
                    
                case 'database':
                    // Return cached data if available
                    return {
                        cached: true,
                        data: null,
                        error: 'Database unavailable - no cache available'
                    };
                    
                case 'ollama':
                    return {
                        response: 'Service temporarily unavailable',
                        model: 'fallback',
                        fallback: true
                    };
                    
                default:
                    return {
                        error: `${serviceName} unavailable`,
                        fallback: true,
                        timestamp: Date.now()
                    };
            }
        });
        
        this.breakers.set(serviceName, breaker);
        return breaker;
    }
    
    /**
     * 🏗️ CREATE BREAKERS FOR CONSTRUCTION SYNDICATE
     * 
     * Pre-configured breakers for all critical services
     */
    createConstructionBreakers() {
        const breakers = {};
        
        // 🧠 LLM Service Breaker (Critical - shorter timeout)
        breakers.llm = this.createBreaker('llm-service', null, {
            timeout: 60000,     // 60 seconds for LLM
            errorThresholdPercentage: 30, // More sensitive
            resetTimeout: 60000 // 1 minute reset
        });
        
        // 🗄️ Database Breaker (Critical - fast timeout)
        breakers.database = this.createBreaker('database', null, {
            timeout: 5000,      // 5 seconds for DB
            errorThresholdPercentage: 20, // Very sensitive
            resetTimeout: 10000 // 10 second reset
        });
        
        // 🤖 Ollama Service Breaker
        breakers.ollama = this.createBreaker('ollama', null, {
            timeout: 120000,    // 2 minutes for Ollama
            errorThresholdPercentage: 40,
            resetTimeout: 30000
        });
        
        // 🌐 External API Breaker
        breakers.externalApi = this.createBreaker('external-api', null, {
            timeout: 10000,     // 10 seconds
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        });
        
        // 📊 Vision Processing Breaker
        breakers.vision = this.createBreaker('vision-processing', null, {
            timeout: 300000,    // 5 minutes for vision
            errorThresholdPercentage: 60,
            resetTimeout: 60000
        });
        
        // 💾 State Persistence Breaker
        breakers.statePersistence = this.createBreaker('state-persistence', null, {
            timeout: 30000,     // 30 seconds
            errorThresholdPercentage: 40,
            resetTimeout: 20000
        });
        
        console.log('✅ Construction syndicate breakers created:');
        console.log(`   🧠 LLM: ${breakers.llm.name}`);
        console.log(`   🗄️ Database: ${breakers.database.name}`);
        console.log(`   🤖 Ollama: ${breakers.ollama.name}`);
        console.log(`   🌐 External API: ${breakers.externalApi.name}`);
        console.log(`   📊 Vision: ${breakers.vision.name}`);
        console.log(`   💾 State: ${breakers.statePersistence.name}`);
        
        return breakers;
    }
    
    /**
     * 🔍 GET CIRCUIT BREAKER STATS
     * 
     * @param {string} serviceName - Optional specific service
     * @returns {Object} Circuit breaker statistics
     */
    getStats(serviceName = null) {
        if (serviceName) {
            const breaker = this.breakers.get(serviceName);
            if (!breaker) return null;
            
            return {
                name: serviceName,
                state: breaker.opened ? 'OPEN' : (breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED'),
                stats: breaker.stats,
                enabled: breaker.enabled,
                volumeThreshold: breaker.volumeThreshold,
                errorThreshold: breaker.options.errorThresholdPercentage
            };
        }
        
        // Return stats for all breakers
        const allStats = {};
        for (const [name, breaker] of this.breakers) {
            allStats[name] = {
                state: breaker.opened ? 'OPEN' : (breaker.halfOpen ? 'HALF_OPEN' : 'CLOSED'),
                stats: breaker.stats,
                enabled: breaker.enabled
            };
        }
        
        return {
            breakers: allStats,
            metrics: this.metrics
        };
    }
    
    /**
     * 🔧 HEALTH CHECK
     * 
     * @returns {Object} Health status of all breakers
     */
    healthCheck() {
        const health = {
            healthy: true,
            openCircuits: [],
            halfOpenCircuits: [],
            metrics: this.metrics
        };
        
        for (const [name, breaker] of this.breakers) {
            if (breaker.opened) {
                health.healthy = false;
                health.openCircuits.push(name);
            } else if (breaker.halfOpen) {
                health.halfOpenCircuits.push(name);
            }
        }
        
        return health;
    }
    
    /**
     * 🛑 SHUTDOWN
     * 
     * Close all circuit breakers
     */
    async shutdown() {
        console.log('🛑 Shutting down Circuit Breaker Service...');
        
        for (const [name, breaker] of this.breakers) {
            breaker.shutdown();
            console.log(`   ✅ ${name} breaker closed`);
        }
        
        this.breakers.clear();
        console.log('✅ Circuit Breaker Service shutdown complete');
    }
}

// 🏗️ SINGLETON INSTANCE
let instance = null;

export function getCircuitBreakerService(config = {}) {
    if (!instance) {
        instance = new CircuitBreakerService(config);
    }
    return instance;
}

export default CircuitBreakerService;
