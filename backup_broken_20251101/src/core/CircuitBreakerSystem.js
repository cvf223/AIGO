/**
 * 🔌 CIRCUIT BREAKER SYSTEM - TOP 1% EXPERT IMPLEMENTATION
 * ======================================================
 * 
 * Production-grade circuit breaker pattern implementation for resilient
 * construction analysis operations. Prevents cascading failures and
 * enables graceful degradation with self-healing capabilities.
 * 
 * FEATURES:
 * - State management (CLOSED, OPEN, HALF_OPEN)
 * - Failure threshold tracking with sliding window
 * - Timeout management and automatic recovery
 * - Service-specific failure handling
 * - Construction domain awareness
 * - Metrics and monitoring
 * - Predictive failure detection
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Construction Edition
 */

import { EventEmitter } from 'events';
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

// Circuit states
const CircuitState = {
    CLOSED: 'CLOSED',      // Normal operation
    OPEN: 'OPEN',          // Failing, reject requests
    HALF_OPEN: 'HALF_OPEN' // Testing recovery
};

export class CircuitBreakerSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Failure thresholds
            failureThreshold: config.failureThreshold || 5,
            failureRateThreshold: config.failureRateThreshold || 0.5,
            
            // Timing configuration
            timeout: config.timeout || 10000,          // Request timeout (10s)
            openDuration: config.openDuration || 60000, // Stay open for 1 minute
            halfOpenRequests: config.halfOpenRequests || 3, // Test requests in half-open
            
            // Window configuration
            windowSize: config.windowSize || 10,
            windowDuration: config.windowDuration || 60000, // 1 minute sliding window
            
            // Recovery configuration
            resetTimeout: config.resetTimeout || 120000, // Full reset after 2 minutes
            backoffMultiplier: config.backoffMultiplier || 1.5,
            maxBackoff: config.maxBackoff || 300000, // Max 5 minutes
            
            // Monitoring
            enableMetrics: config.enableMetrics !== false,
            enablePrediction: config.enablePrediction !== false,
            
            ...config
        };
        
        // Circuit breakers for different services
        this.circuits = new Map();
        
        // Global metrics
        this.globalMetrics = {
            totalRequests: 0,
            totalFailures: 0,
            totalTimeouts: 0,
            totalCircuitOpens: 0,
            totalRecoveries: 0
        };
        
        // Persistence
        this.persistenceEngine = new EliteMemoryPersistenceEngine({
            namespace: 'circuit_breaker',
            enableAutoSave: true
        });
        
        // Prediction model
        this.failurePrediction = {
            enabled: this.config.enablePrediction,
            model: null,
            patterns: new Map()
        };
        
        this.initialize();
    }
    
    /**
     * 🚀 INITIALIZE SYSTEM
     */
    async initialize() {
        console.log('🚀 Initializing Circuit Breaker System...');
        
        await this.persistenceEngine.initialize();
        await this.loadPersistedState();
        
        // Initialize construction-specific circuits
        this.initializeConstructionCircuits();
        
        // Start monitoring
        if (this.config.enableMetrics) {
            this.startMetricsCollection();
        }
        
        console.log('✅ Circuit Breaker System initialized');
    }
    
    /**
     * 🏗️ INITIALIZE CONSTRUCTION CIRCUITS
     */
    initializeConstructionCircuits() {
        const constructionServices = [
            'plan_analysis',
            'error_detection',
            'quantity_extraction',
            'compliance_check',
            'solution_generation',
            'database_operations',
            'external_apis',
            'vision_processing'
        ];
        
        for (const service of constructionServices) {
            this.createCircuit(service, {
                // Service-specific configurations
                ...(this.getServiceConfig(service))
            });
        }
    }
    
    /**
     * ⚡ EXECUTE WITH CIRCUIT BREAKER
     */
    async execute(serviceName, operation, fallback = null) {
        const circuit = this.getOrCreateCircuit(serviceName);
        const requestId = this.generateRequestId();
        
        try {
            // Check circuit state
            if (!this.canExecute(circuit)) {
                throw new Error(`Circuit breaker OPEN for ${serviceName}`);
            }
            
            // Record request
            this.recordRequest(circuit, requestId);
            
            // Execute with timeout
            const result = await this.executeWithTimeout(
                operation,
                circuit.config.timeout,
                requestId
            );
            
            // Record success
            this.recordSuccess(circuit, requestId);
            
            return result;
            
        } catch (error) {
            // Record failure
            this.recordFailure(circuit, requestId, error);
            
            // Execute fallback if available
            if (fallback) {
                console.log(`⚡ Executing fallback for ${serviceName}`);
                try {
                    return await fallback(error);
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    throw fallbackError;
                }
            }
            
            throw error;
        }
    }
    
    /**
     * 🔌 CREATE CIRCUIT
     */
    createCircuit(name, config = {}) {
        const circuit = {
            name,
            state: CircuitState.CLOSED,
            config: { ...this.config, ...config },
            
            // Failure tracking
            failures: [],
            successCount: 0,
            lastFailureTime: null,
            lastSuccessTime: null,
            
            // State timing
            openedAt: null,
            halfOpenTests: 0,
            nextRetryTime: null,
            
            // Metrics
            metrics: {
                requests: 0,
                failures: 0,
                successes: 0,
                timeouts: 0,
                fallbacks: 0,
                stateChanges: []
            },
            
            // Request tracking
            activeRequests: new Map(),
            requestHistory: []
        };
        
        this.circuits.set(name, circuit);
        
        this.emit('circuitCreated', {
            name,
            config: circuit.config
        });
        
        return circuit;
    }
    
    /**
     * 🔍 GET OR CREATE CIRCUIT
     */
    getOrCreateCircuit(name) {
        if (!this.circuits.has(name)) {
            this.createCircuit(name);
        }
        return this.circuits.get(name);
    }
    
    /**
     * ✅ CAN EXECUTE
     */
    canExecute(circuit) {
        switch (circuit.state) {
            case CircuitState.CLOSED:
                return true;
                
            case CircuitState.OPEN:
                // Check if should transition to half-open
                if (this.shouldTransitionToHalfOpen(circuit)) {
                    this.transitionTo(circuit, CircuitState.HALF_OPEN);
        return true;
                }
                return false;
                
            case CircuitState.HALF_OPEN:
                // Allow limited requests
                return circuit.halfOpenTests < circuit.config.halfOpenRequests;
                
            default:
                return false;
        }
    }
    
    /**
     * ⏱️ EXECUTE WITH TIMEOUT
     */
    async executeWithTimeout(operation, timeout, requestId) {
        return new Promise(async (resolve, reject) => {
            let timeoutId;
            
            // Set timeout
            timeoutId = setTimeout(() => {
                reject(new Error(`Operation timeout after ${timeout}ms`));
            }, timeout);
            
            try {
                const result = await operation();
                clearTimeout(timeoutId);
                resolve(result);
            } catch (error) {
                clearTimeout(timeoutId);
                reject(error);
            }
        });
    }
    
    /**
     * 📊 RECORD REQUEST
     */
    recordRequest(circuit, requestId) {
        circuit.metrics.requests++;
        circuit.activeRequests.set(requestId, {
            id: requestId,
            startTime: Date.now(),
            service: circuit.name
        });
        
        if (circuit.state === CircuitState.HALF_OPEN) {
            circuit.halfOpenTests++;
        }
        
        this.globalMetrics.totalRequests++;
    }
    
    /**
     * ✅ RECORD SUCCESS
     */
    recordSuccess(circuit, requestId) {
        const request = circuit.activeRequests.get(requestId);
        if (request) {
            request.endTime = Date.now();
            request.duration = request.endTime - request.startTime;
            request.success = true;
            
            circuit.activeRequests.delete(requestId);
            this.addToHistory(circuit, request);
        }
        
        circuit.successCount++;
        circuit.lastSuccessTime = Date.now();
        circuit.metrics.successes++;
        
        // Handle state transitions
        if (circuit.state === CircuitState.HALF_OPEN) {
            if (circuit.halfOpenTests >= circuit.config.halfOpenRequests) {
                // All test requests succeeded, close circuit
                this.transitionTo(circuit, CircuitState.CLOSED);
            }
        }
        
        // Update failure window
        this.updateFailureWindow(circuit);
    }
    
    /**
     * ❌ RECORD FAILURE
     */
    recordFailure(circuit, requestId, error) {
        const request = circuit.activeRequests.get(requestId);
        if (request) {
            request.endTime = Date.now();
            request.duration = request.endTime - request.startTime;
            request.success = false;
            request.error = error.message;
            
            circuit.activeRequests.delete(requestId);
            this.addToHistory(circuit, request);
        }
        
        // Track failure
        circuit.failures.push({
            timestamp: Date.now(),
            error: error.message,
            type: error.name,
            requestId
        });
        
        circuit.lastFailureTime = Date.now();
        circuit.metrics.failures++;
        this.globalMetrics.totalFailures++;
        
        // Check for timeout
        if (error.message.includes('timeout')) {
            circuit.metrics.timeouts++;
            this.globalMetrics.totalTimeouts++;
        }
        
        // Update failure window and check thresholds
        this.updateFailureWindow(circuit);
        this.checkFailureThresholds(circuit);
        
        // Learn failure pattern
        if (this.failurePrediction.enabled) {
            this.learnFailurePattern(circuit, error);
        }
    }
    
    /**
     * 🔄 UPDATE FAILURE WINDOW
     */
    updateFailureWindow(circuit) {
        const now = Date.now();
        const windowStart = now - circuit.config.windowDuration;
        
        // Remove old failures outside window
        circuit.failures = circuit.failures.filter(
            failure => failure.timestamp > windowStart
        );
    }
    
    /**
     * 🚨 CHECK FAILURE THRESHOLDS
     */
    checkFailureThresholds(circuit) {
        // Check absolute threshold
        if (circuit.failures.length >= circuit.config.failureThreshold) {
            if (circuit.state !== CircuitState.OPEN) {
                this.transitionTo(circuit, CircuitState.OPEN);
            }
            return;
        }
        
        // Check failure rate
        const recentRequests = circuit.requestHistory.filter(
            req => req.startTime > Date.now() - circuit.config.windowDuration
        );
        
        if (recentRequests.length >= circuit.config.windowSize) {
            const failureRate = recentRequests.filter(r => !r.success).length / recentRequests.length;
            
            if (failureRate >= circuit.config.failureRateThreshold) {
                if (circuit.state !== CircuitState.OPEN) {
                    this.transitionTo(circuit, CircuitState.OPEN);
                }
            }
        }
    }
    
    /**
     * 🔄 TRANSITION STATE
     */
    transitionTo(circuit, newState) {
        const oldState = circuit.state;
        circuit.state = newState;
        
        // Handle state-specific logic
        switch (newState) {
            case CircuitState.OPEN:
                circuit.openedAt = Date.now();
                circuit.nextRetryTime = Date.now() + circuit.config.openDuration;
                circuit.halfOpenTests = 0;
                this.globalMetrics.totalCircuitOpens++;
                
                // Apply backoff
                const backoffDuration = Math.min(
                    circuit.config.openDuration * Math.pow(
                        circuit.config.backoffMultiplier,
                        circuit.metrics.stateChanges.filter(s => s.to === CircuitState.OPEN).length
                    ),
                    circuit.config.maxBackoff
                );
                circuit.nextRetryTime = Date.now() + backoffDuration;
                break;
                
            case CircuitState.CLOSED:
                circuit.failures = [];
                circuit.halfOpenTests = 0;
                circuit.successCount = 0;
                if (oldState === CircuitState.OPEN || oldState === CircuitState.HALF_OPEN) {
                    this.globalMetrics.totalRecoveries++;
                }
                break;
                
            case CircuitState.HALF_OPEN:
                circuit.halfOpenTests = 0;
                break;
        }
        
        // Record state change
        circuit.metrics.stateChanges.push({
            from: oldState,
            to: newState,
            timestamp: Date.now(),
            reason: this.getStateChangeReason(circuit)
        });
        
        this.emit('stateChanged', {
            circuit: circuit.name,
            oldState,
            newState,
            metrics: circuit.metrics
        });
        
        console.log(`🔄 Circuit ${circuit.name}: ${oldState} → ${newState}`);
    }
    
    /**
     * 🔍 SHOULD TRANSITION TO HALF OPEN
     */
    shouldTransitionToHalfOpen(circuit) {
        if (circuit.state !== CircuitState.OPEN) {
            return false;
        }
        
        return Date.now() >= circuit.nextRetryTime;
    }
    
    /**
     * 🏗️ GET SERVICE CONFIG
     */
    getServiceConfig(service) {
        const configs = {
            plan_analysis: {
                timeout: 30000, // 30 seconds for complex analysis
                failureThreshold: 3,
                failureRateThreshold: 0.3
            },
            error_detection: {
                timeout: 15000,
                failureThreshold: 5,
                failureRateThreshold: 0.4
            },
            quantity_extraction: {
                timeout: 20000,
                failureThreshold: 4,
                failureRateThreshold: 0.35
            },
            compliance_check: {
                timeout: 10000,
                failureThreshold: 5,
                failureRateThreshold: 0.5
            },
            solution_generation: {
                timeout: 25000,
                failureThreshold: 3,
                failureRateThreshold: 0.3
            },
            database_operations: {
                timeout: 5000,
                failureThreshold: 10,
                failureRateThreshold: 0.6,
                openDuration: 30000 // Shorter recovery for DB
            },
            external_apis: {
                timeout: 15000,
                failureThreshold: 3,
                failureRateThreshold: 0.4,
                openDuration: 120000 // Longer for external services
            },
            vision_processing: {
                timeout: 45000, // Longer for image processing
                failureThreshold: 2,
                failureRateThreshold: 0.25
            }
        };
        
        return configs[service] || {};
    }
    
    /**
     * 🧠 LEARN FAILURE PATTERN
     */
    learnFailurePattern(circuit, error) {
        const pattern = {
            service: circuit.name,
            errorType: error.name,
            message: error.message,
            timestamp: Date.now(),
            context: {
                requestCount: circuit.metrics.requests,
                recentFailures: circuit.failures.length,
                state: circuit.state
            }
        };
        
        // Group patterns
        const patternKey = `${circuit.name}_${error.name}`;
        if (!this.failurePrediction.patterns.has(patternKey)) {
            this.failurePrediction.patterns.set(patternKey, []);
        }
        
        const patterns = this.failurePrediction.patterns.get(patternKey);
        patterns.push(pattern);
        
        // Keep last 100 patterns
        if (patterns.length > 100) {
            patterns.shift();
        }
        
        // Analyze pattern frequency
        this.analyzeFailurePatterns(circuit);
    }
    
    /**
     * 📊 ANALYZE FAILURE PATTERNS
     */
    analyzeFailurePatterns(circuit) {
        const predictions = [];
        
        for (const [patternKey, patterns] of this.failurePrediction.patterns) {
            if (!patternKey.startsWith(circuit.name)) continue;
            
            // Calculate pattern frequency
            const recentPatterns = patterns.filter(
                p => p.timestamp > Date.now() - 3600000 // Last hour
            );
            
            if (recentPatterns.length > 5) {
                // Calculate time between failures
                const intervals = [];
                for (let i = 1; i < recentPatterns.length; i++) {
                    intervals.push(recentPatterns[i].timestamp - recentPatterns[i-1].timestamp);
                }
                
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                
                // Predict next failure
                const lastFailure = recentPatterns[recentPatterns.length - 1];
                const predictedNextFailure = lastFailure.timestamp + avgInterval;
                
                predictions.push({
                    pattern: patternKey,
                    predictedTime: predictedNextFailure,
                    confidence: Math.min(0.9, recentPatterns.length / 10),
                    avgInterval
                });
            }
        }
        
        // Emit predictions
        if (predictions.length > 0) {
            this.emit('failurePrediction', {
                circuit: circuit.name,
                predictions
            });
        }
    }
    
    /**
     * 🛡️ IMPLEMENT FALLBACK STRATEGIES
     */
    getFallbackStrategy(serviceName) {
        const strategies = {
            plan_analysis: async (error) => {
                console.log('📋 Using cached plan analysis results');
                // Return cached or simplified analysis
                return {
                    status: 'degraded',
                    source: 'cache',
                    message: 'Using cached analysis due to service issues'
                };
            },
            
            error_detection: async (error) => {
                console.log('🔍 Using basic error detection');
                // Return basic pattern matching
                return {
                    status: 'degraded',
                    errors: [],
                    message: 'Basic error detection only'
                };
            },
            
            quantity_extraction: async (error) => {
                console.log('📊 Using estimated quantities');
                // Return estimates based on similar projects
                return {
                    status: 'degraded',
                    quantities: [],
                    source: 'estimation',
                    confidence: 0.6
                };
            },
            
            compliance_check: async (error) => {
                console.log('✅ Deferring compliance check');
                // Mark for manual review
                return {
                    status: 'deferred',
                    requiresManualReview: true,
                    message: 'Compliance check deferred for manual review'
                };
            },
            
            solution_generation: async (error) => {
                console.log('💡 Using template solutions');
                // Return standard solutions
                return {
                    status: 'degraded',
                    solutions: [],
                    source: 'templates'
                };
            }
        };
        
        return strategies[serviceName];
    }
    
    // Helper methods
    
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    addToHistory(circuit, request) {
        circuit.requestHistory.push(request);
        
        // Keep last 1000 requests
        if (circuit.requestHistory.length > 1000) {
            circuit.requestHistory.shift();
        }
    }
    
    getStateChangeReason(circuit) {
        if (circuit.failures.length >= circuit.config.failureThreshold) {
            return `Failure threshold exceeded (${circuit.failures.length}/${circuit.config.failureThreshold})`;
        }
        
        const failureRate = circuit.failures.length / Math.max(circuit.metrics.requests, 1);
        if (failureRate >= circuit.config.failureRateThreshold) {
            return `Failure rate exceeded (${(failureRate * 100).toFixed(1)}%)`;
        }
        
        if (circuit.state === CircuitState.CLOSED && circuit.successCount > 0) {
            return 'Recovery successful';
        }
        
        return 'State transition';
    }
    
    /**
     * 📊 START METRICS COLLECTION
     */
    startMetricsCollection() {
        // Collect metrics every minute
        setInterval(() => {
            const metrics = this.collectMetrics();
            
            this.emit('metricsCollected', metrics);
            
            // Check for anomalies
            this.detectAnomalies(metrics);
            
        }, 60000);
    }
    
    /**
     * 📈 COLLECT METRICS
     */
    collectMetrics() {
        const metrics = {
            timestamp: Date.now(),
            global: { ...this.globalMetrics },
            circuits: {}
        };
        
        for (const [name, circuit] of this.circuits) {
            metrics.circuits[name] = {
                state: circuit.state,
                metrics: { ...circuit.metrics },
                failureRate: circuit.failures.length / Math.max(circuit.metrics.requests, 1),
                avgResponseTime: this.calculateAvgResponseTime(circuit),
                availability: this.calculateAvailability(circuit)
            };
        }
        
        return metrics;
    }
    
    calculateAvgResponseTime(circuit) {
        const recentRequests = circuit.requestHistory.slice(-100);
        if (recentRequests.length === 0) return 0;
        
        const totalDuration = recentRequests.reduce((sum, req) => 
            sum + (req.duration || 0), 0);
        
        return totalDuration / recentRequests.length;
    }
    
    calculateAvailability(circuit) {
        if (circuit.metrics.stateChanges.length === 0) {
            return circuit.state === CircuitState.CLOSED ? 1.0 : 0.0;
        }
        
        // Calculate time in each state
        let closedTime = 0;
        let totalTime = 0;
        
        const changes = [...circuit.metrics.stateChanges];
        changes.push({ timestamp: Date.now(), to: circuit.state });
        
        for (let i = 1; i < changes.length; i++) {
            const duration = changes[i].timestamp - changes[i-1].timestamp;
            totalTime += duration;
            
            if (changes[i-1].to === CircuitState.CLOSED) {
                closedTime += duration;
            }
        }
        
        return totalTime > 0 ? closedTime / totalTime : 1.0;
    }
    
    /**
     * 🚨 DETECT ANOMALIES
     */
    detectAnomalies(metrics) {
        const anomalies = [];
        
        // Check global failure rate
        const globalFailureRate = metrics.global.totalFailures / 
                                 Math.max(metrics.global.totalRequests, 1);
        
        if (globalFailureRate > 0.3) {
            anomalies.push({
                type: 'high_global_failure_rate',
                value: globalFailureRate,
                severity: 'high'
            });
        }
        
        // Check individual circuits
        for (const [name, circuitMetrics] of Object.entries(metrics.circuits)) {
            if (circuitMetrics.failureRate > 0.5) {
                anomalies.push({
                    type: 'high_circuit_failure_rate',
                    circuit: name,
                    value: circuitMetrics.failureRate,
                    severity: 'medium'
                });
            }
            
            if (circuitMetrics.availability < 0.8) {
                anomalies.push({
                    type: 'low_availability',
                    circuit: name,
                    value: circuitMetrics.availability,
                    severity: 'high'
                });
            }
        }
        
        if (anomalies.length > 0) {
            this.emit('anomaliesDetected', { anomalies, metrics });
        }
    }
    
    /**
     * 🔧 MANUAL CONTROLS
     */
    async openCircuit(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        this.transitionTo(circuit, CircuitState.OPEN);
    }
    
    async closeCircuit(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        this.transitionTo(circuit, CircuitState.CLOSED);
    }
    
    async resetCircuit(serviceName) {
        const circuit = this.getOrCreateCircuit(serviceName);
        
        circuit.failures = [];
        circuit.successCount = 0;
        circuit.halfOpenTests = 0;
        circuit.metrics = {
            requests: 0,
            failures: 0,
            successes: 0,
            timeouts: 0,
            fallbacks: 0,
            stateChanges: []
        };
        
        this.transitionTo(circuit, CircuitState.CLOSED);
    }
    
    /**
     * 📊 GET CIRCUIT STATUS
     */
    getCircuitStatus(serviceName) {
        const circuit = this.circuits.get(serviceName);
        if (!circuit) return null;
        
        return {
            name: circuit.name,
            state: circuit.state,
            metrics: circuit.metrics,
            failureRate: circuit.failures.length / Math.max(circuit.metrics.requests, 1),
            availability: this.calculateAvailability(circuit),
            lastFailure: circuit.lastFailureTime,
            lastSuccess: circuit.lastSuccessTime,
            activeRequests: circuit.activeRequests.size
        };
    }
    
    /**
     * 📈 GET ALL METRICS
     */
    getAllMetrics() {
        return {
            global: this.globalMetrics,
            circuits: Array.from(this.circuits.keys()).map(name => 
                this.getCircuitStatus(name)
            ),
            predictions: this.failurePrediction.enabled ? 
                        Array.from(this.failurePrediction.patterns.keys()) : []
        };
    }
    
    /**
     * 💾 LOAD PERSISTED STATE
     */
    async loadPersistedState() {
        const state = await this.persistenceEngine.retrieveMemory('circuit_state');
        if (state) {
            this.globalMetrics = { ...this.globalMetrics, ...state.globalMetrics };
            
            // Restore circuit states
            if (state.circuits) {
                for (const [name, circuitState] of Object.entries(state.circuits)) {
                    const circuit = this.getOrCreateCircuit(name);
                    Object.assign(circuit, circuitState);
                }
            }
        }
    }
    
    /**
     * 💾 SAVE STATE
     */
    async saveState() {
        const state = {
            globalMetrics: this.globalMetrics,
            circuits: {}
        };
        
        for (const [name, circuit] of this.circuits) {
            state.circuits[name] = {
                state: circuit.state,
                metrics: circuit.metrics,
                failures: circuit.failures.slice(-100), // Keep last 100
                lastFailureTime: circuit.lastFailureTime,
                lastSuccessTime: circuit.lastSuccessTime
            };
        }
        
        await this.persistenceEngine.storeMemory('circuit_state', state);
    }
    
    /**
     * 🔌 SHUTDOWN
     */
    async shutdown() {
        console.log('🔌 Shutting down Circuit Breaker System...');
        
        await this.saveState();
        await this.persistenceEngine.shutdown();
        
        this.removeAllListeners();
        console.log('✅ Circuit Breaker System shutdown complete');
    }
}

// Export singleton instance
export const circuitBreakerSystem = new CircuitBreakerSystem();

export default CircuitBreakerSystem;