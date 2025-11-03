/**
 * 📊 SYSTEM MONITORING COLLECTOR
 * ===============================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Elite System Metrics Collection
 * 
 * CAPABILITIES:
 * - Extract metrics from 60+ systems with adaptive detail levels
 * - Intelligent status detection (operational, warning, error)
 * - Performance statistics aggregation
 * - Configuration introspection
 * - Real-time state monitoring
 * 
 * ADAPTIVE DETAIL LEVELS:
 * - Summary: Status + 4-6 key metrics (lightweight)
 * - Detailed: Full metrics + config + performance graphs (medium)
 * - Deep: Complete internal state + database queries (heavy)
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Implementation
 */

import { EventEmitter } from 'events';

/**
 * 📊 SYSTEM MONITORING COLLECTOR
 */
export class SystemMonitoringCollector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableCaching: config.enableCaching !== false,
            cacheTimeout: config.cacheTimeout || 5000, // 5 seconds
            enableHistoricalTracking: config.enableHistoricalTracking !== false,
            database: config.database || null,
            ...config
        };
        
        // System cache
        this.systemCache = new Map();
        
        // System categorization
        this.systemCategories = {
            'Core Orchestration': [
                'centralNervousSystem',
                'syndicateFactory',
                'constructionOrchestrator',
                'statePersistence'
            ],
            'LLM Services': [
                'ollamaService',
                'llmService',
                'llmAgent'
            ],
            'Memory Systems': [
                'sharedMemory',
                'worldModel',
                'contextEngine',
                'advancedMemoryIntegration',
                'conceptOrchestratorAgent',
                'threePillars'
            ],
            'Learning Systems': [
                'alphaGnome',
                'quantumEvolution',
                'ultraFastTransformer',
                'alphaFold',
                'boundedA2C',
                'adaptiveMeta',
                'quantumMDP',
                'quantumInspired',
                'eliteMDP',
                'collectiveMDP',
                'neuralOptimizer'
            ],
            'Quantum Engines': [
                'quantumSuperpositionEngine',
                'quantumNodeEngine',
                'quantumCoherenceEngine',
                'quantumEntanglementEngine',
                'quantumSystemOrchestrator'
            ],
            'Formal Reasoning & Verification': [
                'formalReasoningMaster',
                'autoformalizationEngine',
                'formalVerificationOrchestrator'
            ],
            'Proactive Prevention': [
                'proactiveCredibilityMaster',
                'proactiveInferenceReliabilityMaster',
                'proactiveVeracityJudgeMaster',
                'orchestratorCreativityIntegrator',
                'orchestratorOvertrainingPrevention'
            ],
            'Construction Services': [
                'visionEngine',
                'hoaiCompliance',
                'quantityTakeoff',
                'errorDetection',
                'bidEvaluation',
                'boqGenerator',
                'tenderGenerator',
                'planValidator'
            ],
            'Enhancement Systems': [
                'comprehensiveEnhancements',
                'orchestratorQuantumQuantization'
            ]
        };
        
        console.log('📊 System Monitoring Collector initialized');
    }
    
    /**
     * 🚀 INITIALIZE
     */
    async initialize() {
        console.log('🚀 Initializing System Monitoring Collector...');
        
        // Initialize cache
        this.systemCache.clear();
        
        console.log('✅ System Monitoring Collector ready');
        return true;
    }
    
    /**
     * 📋 GET ALL SYSTEMS
     */
    async getAllSystems(orchestrator) {
        if (!orchestrator) {
            return [];
        }
        
        const systems = [];
        
        // Recursively extract all systems from orchestrator
        for (const [key, value] of Object.entries(orchestrator)) {
            if (this.isSystem(value)) {
                const category = this.categorizeSystem(key);
                const status = this.getStatus(value);
                
                systems.push({
                    id: key,
                    name: value.constructor?.name || key,
                    category,
                    status,
                    isInitialized: value.isInitialized !== false,
                    isOperational: value.isOperational !== false
                });
            }
        }
        
        return systems;
    }
    
    /**
     * 🔍 IS SYSTEM
     */
    isSystem(value) {
        return value && 
               typeof value === 'object' && 
               value.constructor && 
               value.constructor.name !== 'Object' &&
               value.constructor.name !== 'Map' &&
               value.constructor.name !== 'Array';
    }
    
    /**
     * 🏷️ CATEGORIZE SYSTEM
     */
    categorizeSystem(systemKey) {
        for (const [category, systems] of Object.entries(this.systemCategories)) {
            if (systems.includes(systemKey)) {
                return category;
            }
        }
        return 'Other Systems';
    }
    
    /**
     * 📊 GET SYSTEM STATUS
     */
    async getSystemStatus(orchestrator, systemId) {
        const system = this.getSystemById(orchestrator, systemId);
        if (!system) {
            return { status: 'not_found' };
        }
        
        return {
            status: this.getStatus(system),
            isInitialized: system.isInitialized !== false,
            isOperational: system.isOperational !== false,
            isRunning: system.isRunning !== false,
            name: system.constructor?.name || systemId,
            timestamp: Date.now()
        };
    }
    
    /**
     * 🎯 GET STATUS
     */
    getStatus(system) {
        if (!system) return 'unknown';
        
        // Check for error state
        if (system.hasErrors || system.errorCount > 0) {
            return 'error';
        }
        
        // Check for warning state
        if (system.warnings?.length > 0 || system.systemHealth < 0.8) {
            return 'warning';
        }
        
        // Check operational status
        if (system.isOperational === false || system.isInitialized === false) {
            return 'offline';
        }
        
        if (system.isRunning === true || system.isOperational === true) {
            return 'operational';
        }
        
        return 'idle';
    }
    
    /**
     * 📊 GET SYSTEM METRICS
     */
    async getSystemMetrics(orchestrator, systemId) {
        const system = this.getSystemById(orchestrator, systemId);
        if (!system) {
            return {};
        }
        
        // Try multiple ways to extract metrics
        const metrics = {
            // Direct metrics property
            ...(system.metrics || {}),
            
            // Performance metrics
            ...(system.performanceMetrics || {}),
            
            // System metrics
            ...(system.systemMetrics || {}),
            
            // Try getMetrics method
            ...(typeof system.getMetrics === 'function' ? await system.getMetrics() : {}),
            
            // Try getPerformanceStats method
            ...(typeof system.getPerformanceStats === 'function' ? await system.getPerformanceStats() : {})
        };
        
        return metrics;
    }
    
    /**
     * 📊 EXTRACT SYSTEM DATA (Adaptive Detail Level)
     */
    async extractSystemData(orchestrator, systemId, detailLevel = 'summary') {
        const system = this.getSystemById(orchestrator, systemId);
        if (!system) {
            return null;
        }
        
        // Check cache for summary level
        if (detailLevel === 'summary' && this.config.enableCaching) {
            const cached = this.getCachedData(systemId);
            if (cached) return cached;
        }
        
        let data;
        
        switch (detailLevel) {
            case 'summary':
                data = await this.extractSummaryData(system, systemId);
                break;
                
            case 'detailed':
                data = await this.extractDetailedData(system, systemId);
                break;
                
            case 'deep':
                data = await this.extractDeepData(system, systemId, orchestrator);
                break;
                
            default:
                data = await this.extractSummaryData(system, systemId);
        }
        
        // Cache summary data
        if (detailLevel === 'summary' && this.config.enableCaching) {
            this.cacheData(systemId, data);
        }
        
        return data;
    }
    
    /**
     * 📄 EXTRACT SUMMARY DATA (Level 1)
     */
    async extractSummaryData(system, systemId) {
        const status = this.getStatus(system);
        const keyMetrics = this.extractKeyMetrics(system);
        const recentActivity = this.extractRecentActivity(system);
        
        return {
            systemId,
            name: system.constructor?.name || systemId,
            status,
            keyMetrics,
            recentActivity,
            timestamp: Date.now()
        };
    }
    
    /**
     * 📊 EXTRACT DETAILED DATA (Level 2)
     */
    async extractDetailedData(system, systemId) {
        const summaryData = await this.extractSummaryData(system, systemId);
        
        const fullMetrics = await this.getSystemMetrics({ [systemId]: system }, systemId);
        const config = system.config || {};
        const performance = system.performanceMetrics || {};
        const connections = this.extractConnections(system);
        
        return {
            ...summaryData,
            fullMetrics,
            config,
            performance,
            connections,
            eventLog: this.extractEventLog(system, 100)
        };
    }
    
    /**
     * 🔬 EXTRACT DEEP DATA (Level 3)
     */
    async extractDeepData(system, systemId, orchestrator) {
        const detailedData = await this.extractDetailedData(system, systemId);
        
        // Get recoverable state if available
        const recoverableState = typeof system.getRecoverableState === 'function' 
            ? await system.getRecoverableState()
            : null;
        
        // Full configuration dump
        const fullConfig = this.deepClone(system.config || {});
        
        // Internal state inspection
        const internalState = this.extractInternalState(system);
        
        // Database queries for this system
        const databaseData = await this.querySystemDatabaseData(systemId);
        
        return {
            ...detailedData,
            recoverableState,
            fullConfig,
            internalState,
            databaseData,
            debugInfo: {
                constructorName: system.constructor?.name,
                properties: Object.keys(system),
                methods: this.extractMethods(system)
            }
        };
    }
    
    /**
     * 🔑 EXTRACT KEY METRICS (4-6 most important)
     */
    extractKeyMetrics(system) {
        const metrics = {};
        
        // Try to extract 4-6 most important metrics
        if (system.metrics) {
            const allMetrics = system.metrics;
            const keys = Object.keys(allMetrics).slice(0, 6);
            keys.forEach(key => {
                metrics[key] = allMetrics[key];
            });
        }
        
        // Common important metrics
        if (system.systemHealth !== undefined) metrics.systemHealth = system.systemHealth;
        if (system.successRate !== undefined) metrics.successRate = system.successRate;
        if (system.totalProcessed !== undefined) metrics.totalProcessed = system.totalProcessed;
        if (system.errorCount !== undefined) metrics.errorCount = system.errorCount;
        if (system.uptime !== undefined) metrics.uptime = system.uptime;
        if (system.lastActivity !== undefined) metrics.lastActivity = system.lastActivity;
        
        return metrics;
    }
    
    /**
     * 📝 EXTRACT RECENT ACTIVITY
     */
    extractRecentActivity(system) {
        const activity = [];
        
        // Check for activity logs
        if (system.activityLog && Array.isArray(system.activityLog)) {
            return system.activityLog.slice(-10);
        }
        
        // Check for event history
        if (system.eventHistory && Array.isArray(system.eventHistory)) {
            return system.eventHistory.slice(-10);
        }
        
        // Check for recent events
        if (system.recentEvents && Array.isArray(system.recentEvents)) {
            return system.recentEvents.slice(-10);
        }
        
        return activity;
    }
    
    /**
     * 🔗 EXTRACT CONNECTIONS
     */
    extractConnections(system) {
        const connections = [];
        
        // Look for common connection properties
        const connectionKeys = [
            'sharedMemory', 'worldModel', 'contextEngine', 'database',
            'alphaGnome', 'quantumEvolution', 'centralNervousSystem',
            'learningEcosystem', 'quantumSystems', 'preventionSystems'
        ];
        
        for (const key of connectionKeys) {
            if (system[key]) {
                connections.push({
                    name: key,
                    type: system[key].constructor?.name || 'unknown',
                    connected: true
                });
            }
        }
        
        return connections;
    }
    
    /**
     * 📜 EXTRACT EVENT LOG
     */
    extractEventLog(system, limit = 100) {
        if (system.eventLog && Array.isArray(system.eventLog)) {
            return system.eventLog.slice(-limit);
        }
        
        if (system.logs && Array.isArray(system.logs)) {
            return system.logs.slice(-limit);
        }
        
        return [];
    }
    
    /**
     * 🔍 EXTRACT INTERNAL STATE
     */
    extractInternalState(system) {
        const state = {};
        
        // Extract all enumerable properties
        for (const [key, value] of Object.entries(system)) {
            // Skip functions and large objects
            if (typeof value === 'function') continue;
            if (value instanceof Map) {
                state[key] = `Map(${value.size} entries)`;
                continue;
            }
            if (Array.isArray(value) && value.length > 100) {
                state[key] = `Array(${value.length} items)`;
                continue;
            }
            
            state[key] = value;
        }
        
        return state;
    }
    
    /**
     * 🔧 EXTRACT METHODS
     */
    extractMethods(system) {
        const methods = [];
        
        const proto = Object.getPrototypeOf(system);
        const methodNames = Object.getOwnPropertyNames(proto);
        
        for (const name of methodNames) {
            if (name !== 'constructor' && typeof system[name] === 'function') {
                methods.push(name);
            }
        }
        
        return methods;
    }
    
    /**
     * 🗄️ QUERY SYSTEM DATABASE DATA
     */
    async querySystemDatabaseData(systemId) {
        if (!this.config.database) {
            return null;
        }
        
        try {
            const client = await this.config.database.connect();
            
            // Query for system-specific data
            const queries = {
                logs: await client.query(`
                    SELECT * FROM system_logs
                    WHERE system_id = $1
                    ORDER BY timestamp DESC
                    LIMIT 100
                `, [systemId]),
                
                metrics: await client.query(`
                    SELECT * FROM system_metrics
                    WHERE system_id = $1
                    ORDER BY timestamp DESC
                    LIMIT 50
                `, [systemId])
            };
            
            client.release();
            
            return {
                logs: queries.logs.rows,
                metrics: queries.metrics.rows
            };
            
        } catch (error) {
            console.warn(`⚠️ Database query failed for ${systemId}:`, error.message);
            return null;
        }
    }
    
    /**
     * 🔍 GET SYSTEM BY ID
     */
    getSystemById(orchestrator, systemId) {
        if (!orchestrator) return null;
        
        // Direct property access
        if (orchestrator[systemId]) {
            return orchestrator[systemId];
        }
        
        // Check in nested objects
        if (orchestrator.constructionOrchestrator?.[systemId]) {
            return orchestrator.constructionOrchestrator[systemId];
        }
        
        if (orchestrator.syndicateFactory?.[systemId]) {
            return orchestrator.syndicateFactory[systemId];
        }
        
        // Check in service registry
        if (orchestrator.syndicateFactory?.serviceRegistry?.[systemId]) {
            return orchestrator.syndicateFactory.serviceRegistry[systemId];
        }
        
        // Check in construction services
        if (orchestrator.syndicateFactory?.serviceRegistry?.constructionServices?.[systemId]) {
            return orchestrator.syndicateFactory.serviceRegistry.constructionServices[systemId];
        }
        
        return null;
    }
    
    /**
     * 📋 GET SYSTEM LIST
     */
    getSystemList() {
        const systems = [];
        
        for (const [category, systemIds] of Object.entries(this.systemCategories)) {
            for (const systemId of systemIds) {
                systems.push({
                    id: systemId,
                    category
                });
            }
        }
        
        return systems;
    }
    
    /**
     * 💾 CACHE DATA
     */
    cacheData(systemId, data) {
        this.systemCache.set(systemId, {
            data,
            timestamp: Date.now()
        });
    }
    
    /**
     * 📥 GET CACHED DATA
     */
    getCachedData(systemId) {
        const cached = this.systemCache.get(systemId);
        
        if (!cached) return null;
        
        // Check if cache is still valid
        const age = Date.now() - cached.timestamp;
        if (age > this.config.cacheTimeout) {
            this.systemCache.delete(systemId);
            return null;
        }
        
        return cached.data;
    }
    
    /**
     * 🔄 DEEP CLONE
     */
    deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            return obj;
        }
    }
}

export default SystemMonitoringCollector;

