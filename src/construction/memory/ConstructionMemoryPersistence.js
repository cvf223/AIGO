/**
 * 💾🏗️ CONSTRUCTION MEMORY PERSISTENCE - TOP 1% EXPERT IMPLEMENTATION
 * ==================================================================
 * 
 * Extended memory persistence system specifically designed for construction
 * syndicate data with intelligent caching, compression, and retrieval.
 * 
 * CAPABILITIES:
 * - Project-scoped memory organization
 * - Plan analysis result caching
 * - Error pattern memorization
 * - Quantity calculation history
 * - Compliance decision memory
 * - Human feedback integration
 * - Cross-agent knowledge sharing
 * - Temporal memory with decay
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Memory System
 */

import { EventEmitter } from 'events';
import { EliteMemoryPersistenceEngine } from '../../memory/EliteMemoryPersistenceEngine.js';
import { QuantumMemoryEntanglementEngine } from '../../quantum/QuantumMemoryEntanglementEngine.js';
import { ConstructionDatabaseSchemas } from '../database/ConstructionDatabaseSchemas.js';

/**
 * 💾🏗️ CONSTRUCTION MEMORY PERSISTENCE
 */
export class ConstructionMemoryPersistence extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('💾🏗️ Initializing Construction Memory Persistence...');
        
        this.config = {
            // Memory configuration
            enableQuantumMemory: config.enableQuantumMemory !== false,
            enableTemporalDecay: config.enableTemporalDecay !== false,
            memoryRetentionDays: config.memoryRetentionDays || 365,
            
            // Caching configuration
            enableCaching: config.enableCaching !== false,
            cacheSize: config.cacheSize || 10000,
            cacheTTL: config.cacheTTL || 3600000, // 1 hour
            
            // Compression
            enableCompression: config.enableCompression !== false,
            compressionLevel: config.compressionLevel || 6,
            
            // Database
            database: config.database,
            enableDatabasePersistence: config.enableDatabasePersistence !== false,
            
            // Performance
            batchSize: config.batchSize || 100,
            autoSaveInterval: config.autoSaveInterval || 300000, // 5 minutes
            
            ...config
        };
        
        // 💾 CORE MEMORY SYSTEMS
        this.eliteMemory = null;
        this.quantumMemory = null;
        
        // 🗄️ DATABASE CONNECTION
        this.db = this.config.database;
        
        // 🧠 MEMORY STORES
        this.memoryStores = {
            // Project memories
            projects: new Map(),
            projectContext: new Map(),
            
            // Plan analysis memories
            planAnalysis: new Map(),
            visualFeatures: new Map(),
            crossReferences: new Map(),
            
            // Error memories
            errorPatterns: new Map(),
            errorSolutions: new Map(),
            escalationHistory: new Map(),
            
            // Quantity memories
            quantityCalculations: new Map(),
            materialPrices: new Map(),
            measurementRules: new Map(),
            
            // Compliance memories
            complianceDecisions: new Map(),
            regulatoryInterpretations: new Map(),
            auditTrails: new Map(),
            
            // Human interaction memories
            humanFeedback: new Map(),
            expertPreferences: new Map(),
            resolutionPatterns: new Map(),
            
            // Agent memories
            agentExperiences: new Map(),
            collaborationPatterns: new Map(),
            performanceHistory: new Map(),
            
            // Learning memories
            learnedPatterns: new Map(),
            successfulStrategies: new Map(),
            failureAnalysis: new Map()
        };
        
        // 📊 MEMORY INDICES
        this.memoryIndices = {
            byProject: new Map(),
            byAgent: new Map(),
            byTimestamp: new Map(),
            byType: new Map(),
            byImportance: new Map()
        };
        
        // 🎯 CACHE
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        
        // ⏰ AUTO-SAVE
        this.autoSaveInterval = null;
        this.pendingWrites = new Map();
        
        // 📈 METRICS
        this.metrics = {
            totalMemories: 0,
            memoriesByType: {},
            averageRetrievalTime: 0,
            compressionRatio: 0,
            quantumEntanglements: 0
        };
        
        this.isInitialized = false;
    }
    
    /**
     * 🚀 INITIALIZE
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Construction Memory Persistence...');
            
            // Initialize core memory engine
            this.eliteMemory = new EliteMemoryPersistenceEngine({
                namespace: 'construction',
                enableCompression: this.config.enableCompression,
                compressionLevel: this.config.compressionLevel
            });
            await this.eliteMemory.initialize();
            
            // Initialize quantum memory if enabled
            if (this.config.enableQuantumMemory) {
                this.quantumMemory = new QuantumMemoryEntanglementEngine({
                    domain: 'construction',
                    maxEntanglementRadius: 50
                });
                await this.quantumMemory.initialize();
            }
            
            // Create database schemas if needed
            if (this.db && this.config.enableDatabasePersistence) {
                await this.initializeDatabaseSchemas();
            }
            
            // Load existing memories
            await this.loadPersistedMemories();
            
            // Setup indices
            await this.buildMemoryIndices();
            
            // Start auto-save
            if (this.config.autoSaveInterval > 0) {
                this.startAutoSave();
            }
            
            this.isInitialized = true;
            console.log('✅ Construction Memory Persistence initialized');
            console.log(`   💾 Total memories loaded: ${this.metrics.totalMemories}`);
            console.log(`   🧠 Memory stores: ${Object.keys(this.memoryStores).length}`);
            console.log(`   🌌 Quantum memory: ${this.config.enableQuantumMemory ? 'Enabled' : 'Disabled'}`);
            console.log(`   🗄️ Database persistence: ${this.config.enableDatabasePersistence ? 'Enabled' : 'Disabled'}`);
            
            this.emit('initialized', {
                memories: this.metrics.totalMemories,
                stores: Object.keys(this.memoryStores).length
            });
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Failed to initialize Construction Memory Persistence:', error);
            throw error;
        }
    }
    
    /**
     * 💾 STORE PROJECT MEMORY
     */
    async storeProjectMemory(projectId, memoryType, data) {
        const memoryId = `project_${projectId}_${memoryType}_${Date.now()}`;
        
        const memory = {
            id: memoryId,
            projectId,
            type: memoryType,
            data,
            timestamp: Date.now(),
            importance: this.calculateImportance(memoryType, data),
            ttl: this.calculateTTL(memoryType),
            metadata: {
                source: data.source || 'unknown',
                confidence: data.confidence || 1.0,
                tags: data.tags || []
            }
        };
        
        // Store in appropriate memory store
        const store = this.getMemoryStore(memoryType);
        store.set(memoryId, memory);
        
        // Update indices
        this.updateIndices(memory);
        
        // Cache if enabled
        if (this.config.enableCaching) {
            this.updateCache(memoryId, memory);
        }
        
        // Quantum entangle if enabled
        if (this.config.enableQuantumMemory && data.relatedMemories) {
            await this.createQuantumEntanglement(memoryId, data.relatedMemories);
        }
        
        // Queue for persistence
        this.pendingWrites.set(memoryId, memory);
        
        this.metrics.totalMemories++;
        this.updateMetrics(memoryType);
        
        this.emit('memory_stored', {
            memoryId,
            projectId,
            type: memoryType
        });
        
        return memoryId;
    }
    
    /**
     * 🔍 RETRIEVE PROJECT MEMORIES
     */
    async retrieveProjectMemories(projectId, memoryType = null, options = {}) {
        const startTime = Date.now();
        
        // Check cache first
        const cacheKey = `project_${projectId}_${memoryType || 'all'}`;
        if (this.config.enableCaching && this.cache.has(cacheKey)) {
            this.cacheStats.hits++;
            return this.cache.get(cacheKey).data;
        }
        
        this.cacheStats.misses++;
        
        // Get from indices
        const projectMemories = this.memoryIndices.byProject.get(projectId) || new Set();
        
        let memories = [];
        for (const memoryId of projectMemories) {
            const memory = await this.getMemory(memoryId);
            if (memory && (!memoryType || memory.type === memoryType)) {
                memories.push(memory);
            }
        }
        
        // Apply filters
        if (options.startTime) {
            memories = memories.filter(m => m.timestamp >= options.startTime);
        }
        if (options.endTime) {
            memories = memories.filter(m => m.timestamp <= options.endTime);
        }
        if (options.minImportance) {
            memories = memories.filter(m => m.importance >= options.minImportance);
        }
        if (options.tags?.length > 0) {
            memories = memories.filter(m => 
                options.tags.some(tag => m.metadata.tags.includes(tag))
            );
        }
        
        // Sort
        if (options.sortBy === 'timestamp') {
            memories.sort((a, b) => b.timestamp - a.timestamp);
        } else if (options.sortBy === 'importance') {
            memories.sort((a, b) => b.importance - a.importance);
        }
        
        // Limit
        if (options.limit) {
            memories = memories.slice(0, options.limit);
        }
        
        // Cache result
        if (this.config.enableCaching) {
            this.updateCache(cacheKey, { data: memories });
        }
        
        const retrievalTime = Date.now() - startTime;
        this.updateAverageRetrievalTime(retrievalTime);
        
        return memories;
    }
    
    /**
     * 🧠 STORE PLAN ANALYSIS
     */
    async storePlanAnalysis(planId, analysis) {
        const memoryId = await this.storeProjectMemory(
            analysis.projectId,
            'plan_analysis',
            {
                planId,
                analysis,
                elements: analysis.elements || [],
                errors: analysis.errors || [],
                quantities: analysis.quantities || [],
                confidence: analysis.confidence || 0.9
            }
        );
        
        // Store visual features separately for quick access
        if (analysis.visualFeatures) {
            this.memoryStores.visualFeatures.set(planId, {
                features: analysis.visualFeatures,
                extractedAt: Date.now()
            });
        }
        
        // Create quantum entanglement with related plans
        if (this.config.enableQuantumMemory && analysis.relatedPlans) {
            const relatedMemories = analysis.relatedPlans.map(p => `plan_${p}`);
            await this.createQuantumEntanglement(memoryId, relatedMemories);
        }
        
        return memoryId;
    }
    
    /**
     * 🚨 STORE ERROR PATTERN
     */
    async storeErrorPattern(error, solutions = []) {
        const patternId = `pattern_${error.type}_${Date.now()}`;
        
        const pattern = {
            id: patternId,
            errorType: error.type,
            signature: this.extractErrorSignature(error),
            occurrences: [error],
            solutions: solutions,
            successRate: 0,
            lastSeen: Date.now(),
            metadata: {
                severity: error.severity,
                contexts: [error.context],
                tags: error.tags || []
            }
        };
        
        // Check if similar pattern exists
        const existingPattern = await this.findSimilarErrorPattern(pattern.signature);
        if (existingPattern) {
            // Update existing pattern
            existingPattern.occurrences.push(error);
            existingPattern.lastSeen = Date.now();
            if (solutions.length > 0) {
                existingPattern.solutions.push(...solutions);
            }
            this.memoryStores.errorPatterns.set(existingPattern.id, existingPattern);
            return existingPattern.id;
        }
        
        // Store new pattern
        this.memoryStores.errorPatterns.set(patternId, pattern);
        
        // Create quantum entanglement for pattern matching
        if (this.config.enableQuantumMemory) {
            await this.quantumMemory.storeEntangledMemory({
                type: 'error_pattern',
                pattern: pattern.signature,
                solutions: solutions.map(s => s.id)
            });
        }
        
        return patternId;
    }
    
    /**
     * 📊 STORE QUANTITY CALCULATION
     */
    async storeQuantityCalculation(calculation) {
        const calcId = `calc_${calculation.elementType}_${Date.now()}`;
        
        const memory = {
            id: calcId,
            projectId: calculation.projectId,
            elementType: calculation.elementType,
            material: calculation.material,
            quantity: calculation.quantity,
            unit: calculation.unit,
            formula: calculation.formula,
            inputs: calculation.inputs,
            confidence: calculation.confidence,
            timestamp: Date.now(),
            verificationStatus: calculation.verified ? 'verified' : 'pending'
        };
        
        this.memoryStores.quantityCalculations.set(calcId, memory);
        
        // Update material price memory if available
        if (calculation.unitPrice) {
            this.updateMaterialPrice(calculation.material, calculation.unitPrice);
        }
        
        // Store in database for audit trail
        if (this.db && this.config.enableDatabasePersistence) {
            await this.persistQuantityToDatabase(memory);
        }
        
        return calcId;
    }
    
    /**
     * ✅ STORE COMPLIANCE DECISION
     */
    async storeComplianceDecision(decision) {
        const decisionId = `compliance_${decision.phase}_${Date.now()}`;
        
        const memory = {
            id: decisionId,
            projectId: decision.projectId,
            phase: decision.phase,
            requirement: decision.requirement,
            decision: decision.result,
            reasoning: decision.reasoning,
            evidence: decision.evidence,
            confidence: decision.confidence,
            timestamp: Date.now(),
            reviewer: decision.reviewer || 'ai_system'
        };
        
        this.memoryStores.complianceDecisions.set(decisionId, memory);
        
        // Create audit trail
        this.memoryStores.auditTrails.set(`audit_${decisionId}`, {
            decisionId,
            trail: decision.auditTrail || [],
            regulations: decision.applicableRegulations,
            timestamp: Date.now()
        });
        
        return decisionId;
    }
    
    /**
     * 👤 STORE HUMAN FEEDBACK
     */
    async storeHumanFeedback(feedback) {
        const feedbackId = `feedback_${Date.now()}`;
        
        const memory = {
            id: feedbackId,
            escalationId: feedback.escalationId,
            errorType: feedback.errorType,
            selectedSolution: feedback.selectedSolution,
            effectiveness: feedback.effectiveness,
            humanNotes: feedback.notes,
            preferences: feedback.preferences || {},
            timestamp: Date.now()
        };
        
        this.memoryStores.humanFeedback.set(feedbackId, memory);
        
        // Update expert preferences
        await this.updateExpertPreferences(feedback);
        
        // Learn from feedback
        if (feedback.selectedSolution) {
            await this.learnFromHumanDecision(feedback);
        }
        
        return feedbackId;
    }
    
    /**
     * 🤝 STORE AGENT COLLABORATION
     */
    async storeAgentCollaboration(collaboration) {
        const collabId = `collab_${Date.now()}`;
        
        const memory = {
            id: collabId,
            agents: collaboration.agents,
            task: collaboration.task,
            projectId: collaboration.projectId,
            outcome: collaboration.outcome,
            efficiency: collaboration.efficiency,
            knowledgeShared: collaboration.knowledgeShared || [],
            timestamp: Date.now()
        };
        
        this.memoryStores.collaborationPatterns.set(collabId, memory);
        
        // Update agent experiences
        for (const agentId of collaboration.agents) {
            await this.updateAgentExperience(agentId, collaboration);
        }
        
        return collabId;
    }
    
    /**
     * 🌌 CREATE QUANTUM ENTANGLEMENT
     */
    async createQuantumEntanglement(memoryId, relatedMemoryIds) {
        if (!this.quantumMemory) return;
        
        try {
            const memories = [
                await this.getMemory(memoryId),
                ...await Promise.all(relatedMemoryIds.map(id => this.getMemory(id)))
            ].filter(m => m !== null);
            
            if (memories.length > 1) {
                await this.quantumMemory.entangleMemories(memories);
                this.metrics.quantumEntanglements++;
            }
        } catch (error) {
            console.error('❌ Failed to create quantum entanglement:', error);
        }
    }
    
    /**
     * 🔍 SEARCH MEMORIES
     */
    async searchMemories(query) {
        console.log(`🔍 Searching memories for: ${query.text || query.type}`);
        
        let results = [];
        
        // Type-based search
        if (query.type) {
            const typeMemories = this.memoryIndices.byType.get(query.type) || new Set();
            for (const memoryId of typeMemories) {
                const memory = await this.getMemory(memoryId);
                if (memory) results.push(memory);
            }
        }
        
        // Text search using PostgreSQL full-text search
        if (query.text) {
            for (const [storeType, store] of Object.entries(this.memoryStores)) {
                for (const [id, memory] of store) {
                    if (this.memoryMatchesText(memory, query.text)) {
                        results.push(memory);
                    }
                }
            }
        }
        
        // Quantum search if enabled
        if (this.config.enableQuantumMemory && query.quantum) {
            const quantumResults = await this.quantumMemory.quantumCrossReference(query);
            results.push(...quantumResults);
        }
        
        // Apply filters
        if (query.projectId) {
            results = results.filter(m => m.projectId === query.projectId);
        }
        if (query.timeRange) {
            results = results.filter(m => 
                m.timestamp >= query.timeRange.start && 
                m.timestamp <= query.timeRange.end
            );
        }
        
        // Rank results
        results = this.rankSearchResults(results, query);
        
        // Limit
        if (query.limit) {
            results = results.slice(0, query.limit);
        }
        
        return results;
    }
    
    /**
     * 🧹 MEMORY CLEANUP
     */
    async cleanupOldMemories() {
        console.log('🧹 Cleaning up old memories...');
        
        const cutoffTime = Date.now() - (this.config.memoryRetentionDays * 24 * 60 * 60 * 1000);
        let cleanedCount = 0;
        
        for (const [storeType, store] of Object.entries(this.memoryStores)) {
            const toDelete = [];
            
            for (const [id, memory] of store) {
                if (memory.timestamp < cutoffTime && memory.importance < 0.8) {
                    toDelete.push(id);
                }
            }
            
            for (const id of toDelete) {
                store.delete(id);
                this.removeFromIndices(id);
                cleanedCount++;
            }
        }
        
        console.log(`✅ Cleaned up ${cleanedCount} old memories`);
        
        // Persist cleanup to database
        if (this.db && this.config.enableDatabasePersistence) {
            await this.persistCleanupToDatabase(cutoffTime);
        }
        
        return cleanedCount;
    }
    
    // Helper methods
    
    getMemoryStore(type) {
        const storeMap = {
            'plan_analysis': this.memoryStores.planAnalysis,
            'error_pattern': this.memoryStores.errorPatterns,
            'quantity': this.memoryStores.quantityCalculations,
            'compliance': this.memoryStores.complianceDecisions,
            'feedback': this.memoryStores.humanFeedback,
            'collaboration': this.memoryStores.collaborationPatterns,
            'project': this.memoryStores.projects
        };
        
        return storeMap[type] || this.memoryStores.projects;
    }
    
    calculateImportance(type, data) {
        let importance = 0.5; // Base importance
        
        // Type-based importance
        const typeImportance = {
            'error_pattern': 0.8,
            'compliance': 0.9,
            'human_feedback': 0.95,
            'quantity': 0.7,
            'plan_analysis': 0.6
        };
        
        importance = typeImportance[type] || importance;
        
        // Adjust based on data properties
        if (data.severity === 'critical') importance += 0.2;
        if (data.confidence && data.confidence < 0.8) importance += 0.1;
        if (data.humanVerified) importance += 0.15;
        
        return Math.min(1, importance);
    }
    
    calculateTTL(type) {
        const baseTTL = this.config.memoryRetentionDays * 24 * 60 * 60 * 1000;
        
        const ttlMultipliers = {
            'error_pattern': 2.0,    // Keep error patterns longer
            'compliance': 3.0,       // Keep compliance decisions longer
            'human_feedback': 2.5,   // Keep human feedback longer
            'quantity': 1.0,
            'plan_analysis': 0.5     // Plan analysis can expire sooner
        };
        
        return baseTTL * (ttlMultipliers[type] || 1.0);
    }
    
    updateIndices(memory) {
        // By project
        if (memory.projectId) {
            if (!this.memoryIndices.byProject.has(memory.projectId)) {
                this.memoryIndices.byProject.set(memory.projectId, new Set());
            }
            this.memoryIndices.byProject.get(memory.projectId).add(memory.id);
        }
        
        // By type
        if (!this.memoryIndices.byType.has(memory.type)) {
            this.memoryIndices.byType.set(memory.type, new Set());
        }
        this.memoryIndices.byType.get(memory.type).add(memory.id);
        
        // By timestamp
        const timeKey = Math.floor(memory.timestamp / 3600000); // Hour buckets
        if (!this.memoryIndices.byTimestamp.has(timeKey)) {
            this.memoryIndices.byTimestamp.set(timeKey, new Set());
        }
        this.memoryIndices.byTimestamp.get(timeKey).add(memory.id);
        
        // By importance
        const importanceKey = Math.floor(memory.importance * 10) / 10; // 0.1 buckets
        if (!this.memoryIndices.byImportance.has(importanceKey)) {
            this.memoryIndices.byImportance.set(importanceKey, new Set());
        }
        this.memoryIndices.byImportance.get(importanceKey).add(memory.id);
    }
    
    removeFromIndices(memoryId) {
        // Remove from all indices
        for (const index of Object.values(this.memoryIndices)) {
            for (const [key, set] of index) {
                set.delete(memoryId);
            }
        }
    }
    
    updateCache(key, value) {
        // LRU cache implementation
        if (this.cache.size >= this.config.cacheSize) {
            // Evict oldest
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.cacheStats.evictions++;
        }
        
        this.cache.set(key, {
            data: value,
            timestamp: Date.now()
        });
    }
    
    async getMemory(memoryId) {
        // Check all stores
        for (const store of Object.values(this.memoryStores)) {
            if (store.has(memoryId)) {
                return store.get(memoryId);
            }
        }
        
        // Try database if not in memory
        if (this.db && this.config.enableDatabasePersistence) {
            return await this.getMemoryFromDatabase(memoryId);
        }
        
        return null;
    }
    
    extractErrorSignature(error) {
        return {
            type: error.type,
            location: error.location?.type || 'unknown',
            elements: error.relatedElements?.map(e => e.type) || [],
            context: error.context?.phase || 'unknown'
        };
    }
    
    async findSimilarErrorPattern(signature) {
        for (const [id, pattern] of this.memoryStores.errorPatterns) {
            if (this.signaturesMatch(pattern.signature, signature)) {
                return pattern;
            }
        }
        return null;
    }
    
    signaturesMatch(sig1, sig2) {
        return sig1.type === sig2.type &&
               sig1.location === sig2.location &&
               JSON.stringify(sig1.elements.sort()) === JSON.stringify(sig2.elements.sort());
    }
    
    updateMaterialPrice(material, price) {
        const priceHistory = this.memoryStores.materialPrices.get(material) || {
            material,
            prices: []
        };
        
        priceHistory.prices.push({
            price,
            timestamp: Date.now()
        });
        
        // Keep only last 100 prices
        if (priceHistory.prices.length > 100) {
            priceHistory.prices = priceHistory.prices.slice(-100);
        }
        
        this.memoryStores.materialPrices.set(material, priceHistory);
    }
    
    async updateExpertPreferences(feedback) {
        const expertId = feedback.providedBy || 'default';
        const prefs = this.memoryStores.expertPreferences.get(expertId) || {
            preferredSolutionTypes: {},
            avoidSolutionTypes: {},
            responsePatterns: []
        };
        
        // Update solution type preferences
        if (feedback.selectedSolution?.type) {
            prefs.preferredSolutionTypes[feedback.selectedSolution.type] = 
                (prefs.preferredSolutionTypes[feedback.selectedSolution.type] || 0) + 1;
        }
        
        // Update response patterns
        prefs.responsePatterns.push({
            errorType: feedback.errorType,
            solutionType: feedback.selectedSolution?.type,
            effectiveness: feedback.effectiveness,
            timestamp: Date.now()
        });
        
        this.memoryStores.expertPreferences.set(expertId, prefs);
    }
    
    async updateAgentExperience(agentId, collaboration) {
        const experience = this.memoryStores.agentExperiences.get(agentId) || {
            agentId,
            totalTasks: 0,
            successfulTasks: 0,
            collaborations: [],
            specializations: {}
        };
        
        experience.totalTasks++;
        if (collaboration.outcome === 'success') {
            experience.successfulTasks++;
        }
        
        experience.collaborations.push({
            taskType: collaboration.task.type,
            partners: collaboration.agents.filter(a => a !== agentId),
            efficiency: collaboration.efficiency,
            timestamp: Date.now()
        });
        
        // Update specialization scores
        const taskType = collaboration.task.type;
        experience.specializations[taskType] = 
            (experience.specializations[taskType] || 0) + collaboration.efficiency;
        
        this.memoryStores.agentExperiences.set(agentId, experience);
    }
    
    async learnFromHumanDecision(feedback) {
        const pattern = {
            errorType: feedback.errorType,
            solutionType: feedback.selectedSolution.type,
            effectiveness: feedback.effectiveness,
            context: feedback.context || {},
            timestamp: Date.now()
        };
        
        const patternId = `learned_${Date.now()}`;
        this.memoryStores.learnedPatterns.set(patternId, pattern);
        
        // Update successful strategies if effective
        if (feedback.effectiveness === 'very_effective' || feedback.effectiveness === 'effective') {
            const strategyKey = `${feedback.errorType}_${feedback.selectedSolution.type}`;
            this.memoryStores.successfulStrategies.set(strategyKey, {
                ...pattern,
                usageCount: (this.memoryStores.successfulStrategies.get(strategyKey)?.usageCount || 0) + 1
            });
        }
    }
    
    memoryMatchesText(memory, searchText) {
        const searchLower = searchText.toLowerCase();
        const dataStr = JSON.stringify(memory.data).toLowerCase();
        return dataStr.includes(searchLower);
    }
    
    rankSearchResults(results, query) {
        return results.sort((a, b) => {
            // Prioritize by importance
            if (a.importance !== b.importance) {
                return b.importance - a.importance;
            }
            
            // Then by recency
            return b.timestamp - a.timestamp;
        });
    }
    
    updateAverageRetrievalTime(time) {
        const currentAvg = this.metrics.averageRetrievalTime;
        const totalRetrievals = this.cacheStats.hits + this.cacheStats.misses;
        this.metrics.averageRetrievalTime = 
            (currentAvg * (totalRetrievals - 1) + time) / totalRetrievals;
    }
    
    updateMetrics(type) {
        this.metrics.memoriesByType[type] = (this.metrics.memoriesByType[type] || 0) + 1;
    }
    
    /**
     * 🗄️ DATABASE OPERATIONS
     */
    async initializeDatabaseSchemas() {
        if (!this.db) return;
        
        console.log('🗄️ Initializing construction memory database schemas...');
        
        // Create memory-specific tables
        const schemas = [
            `CREATE TABLE IF NOT EXISTS construction_memories (
                id VARCHAR(100) PRIMARY KEY,
                project_id VARCHAR(100),
                memory_type VARCHAR(100),
                data JSONB,
                importance DECIMAL(3,2),
                ttl BIGINT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                expires_at TIMESTAMPTZ
            );`,
            
            `CREATE TABLE IF NOT EXISTS memory_entanglements (
                id SERIAL PRIMARY KEY,
                memory_id VARCHAR(100) REFERENCES construction_memories(id) ON DELETE CASCADE,
                entangled_with VARCHAR(100) REFERENCES construction_memories(id) ON DELETE CASCADE,
                strength DECIMAL(3,2),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(memory_id, entangled_with)
            );`,
            
            `CREATE INDEX IF NOT EXISTS idx_memories_project ON construction_memories(project_id);`,
            `CREATE INDEX IF NOT EXISTS idx_memories_type ON construction_memories(memory_type);`,
            `CREATE INDEX IF NOT EXISTS idx_memories_importance ON construction_memories(importance DESC);`,
            `CREATE INDEX IF NOT EXISTS idx_memories_expires ON construction_memories(expires_at);`
        ];
        
        for (const schema of schemas) {
            await this.db.query(schema);
        }
        
        console.log('✅ Memory database schemas initialized');
    }
    
    async persistQuantityToDatabase(memory) {
        if (!this.db) return;
        
        try {
            await this.db.query(`
                INSERT INTO construction_quantities (
                    quantity_id, project_id, element_type, material,
                    quantity, unit, confidence_score, extracted_by,
                    extracted_at, metadata
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (quantity_id) DO UPDATE SET
                    quantity = $5,
                    confidence_score = $7,
                    metadata = $10
            `, [
                memory.id,
                memory.projectId,
                memory.elementType,
                memory.material,
                memory.quantity,
                memory.unit,
                memory.confidence,
                'memory_system',
                new Date(memory.timestamp),
                JSON.stringify(memory)
            ]);
        } catch (error) {
            console.error('❌ Failed to persist quantity to database:', error);
        }
    }
    
    async getMemoryFromDatabase(memoryId) {
        if (!this.db) return null;
        
        try {
            const result = await this.db.query(
                'SELECT * FROM construction_memories WHERE id = $1',
                [memoryId]
            );
            
            if (result.rows.length > 0) {
                const row = result.rows[0];
                return {
                    id: row.id,
                    projectId: row.project_id,
                    type: row.memory_type,
                    data: row.data,
                    importance: parseFloat(row.importance),
                    timestamp: new Date(row.created_at).getTime()
                };
            }
        } catch (error) {
            console.error('❌ Failed to get memory from database:', error);
        }
        
        return null;
    }
    
    async persistCleanupToDatabase(cutoffTime) {
        if (!this.db) return;
        
        try {
            await this.db.query(
                'DELETE FROM construction_memories WHERE created_at < $1 AND importance < $2',
                [new Date(cutoffTime), 0.8]
            );
        } catch (error) {
            console.error('❌ Failed to cleanup database memories:', error);
        }
    }
    
    /**
     * 💾 PERSISTENCE OPERATIONS
     */
    async loadPersistedMemories() {
        console.log('📥 Loading persisted memories...');
        
        // Load from elite memory engine
        const savedMemories = await this.eliteMemory.retrieveMemory('all_memories');
        if (savedMemories?.data) {
            for (const [storeType, memories] of Object.entries(savedMemories.data)) {
                if (this.memoryStores[storeType]) {
                    this.memoryStores[storeType] = new Map(memories);
                }
            }
        }
        
        // Load from database if available
        if (this.db && this.config.enableDatabasePersistence) {
            await this.loadMemoriesFromDatabase();
        }
        
        // Count total memories
        this.metrics.totalMemories = 0;
        for (const store of Object.values(this.memoryStores)) {
            this.metrics.totalMemories += store.size;
        }
        
        console.log(`✅ Loaded ${this.metrics.totalMemories} memories`);
    }
    
    async loadMemoriesFromDatabase() {
        if (!this.db) return;
        
        try {
            const result = await this.db.query(
                'SELECT * FROM construction_memories WHERE expires_at > NOW() OR expires_at IS NULL'
            );
            
            for (const row of result.rows) {
                const memory = {
                    id: row.id,
                    projectId: row.project_id,
                    type: row.memory_type,
                    data: row.data,
                    importance: parseFloat(row.importance),
                    timestamp: new Date(row.created_at).getTime()
                };
                
                const store = this.getMemoryStore(memory.type);
                store.set(memory.id, memory);
                this.updateIndices(memory);
            }
        } catch (error) {
            console.error('❌ Failed to load memories from database:', error);
        }
    }
    
    async buildMemoryIndices() {
        console.log('🔧 Building memory indices...');
        
        for (const store of Object.values(this.memoryStores)) {
            for (const [id, memory] of store) {
                this.updateIndices(memory);
            }
        }
        
        console.log('✅ Memory indices built');
    }
    
    startAutoSave() {
        this.autoSaveInterval = setInterval(async () => {
            await this.saveMemories();
        }, this.config.autoSaveInterval);
        
        console.log(`⏰ Auto-save started (every ${this.config.autoSaveInterval / 60000} minutes)`);
    }
    
    async saveMemories() {
        if (this.pendingWrites.size === 0) return;
        
        console.log(`💾 Saving ${this.pendingWrites.size} memories...`);
        
        // Save to elite memory engine
        const memoriesToSave = {};
        for (const [storeType, store] of Object.entries(this.memoryStores)) {
            memoriesToSave[storeType] = Array.from(store.entries());
        }
        
        await this.eliteMemory.storeMemory('all_memories', memoriesToSave);
        
        // Save to database
        if (this.db && this.config.enableDatabasePersistence) {
            await this.saveMemoriesToDatabase();
        }
        
        this.pendingWrites.clear();
        console.log('✅ Memories saved');
    }
    
    async saveMemoriesToDatabase() {
        if (!this.db || this.pendingWrites.size === 0) return;
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const [id, memory] of this.pendingWrites) {
                await client.query(`
                    INSERT INTO construction_memories (
                        id, project_id, memory_type, data,
                        importance, ttl, expires_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (id) DO UPDATE SET
                        data = $4,
                        importance = $5
                `, [
                    memory.id,
                    memory.projectId,
                    memory.type,
                    JSON.stringify(memory.data),
                    memory.importance,
                    memory.ttl,
                    memory.ttl ? new Date(memory.timestamp + memory.ttl) : null
                ]);
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Failed to save memories to database:', error);
        } finally {
            client.release();
        }
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        const cacheHitRate = this.cacheStats.hits / 
            Math.max(1, this.cacheStats.hits + this.cacheStats.misses);
        
        return {
            ...this.metrics,
            cacheStats: {
                ...this.cacheStats,
                hitRate: cacheHitRate
            },
            storesSizes: Object.entries(this.memoryStores).reduce((acc, [key, store]) => {
                acc[key] = store.size;
                return acc;
            }, {}),
            indicesSizes: Object.entries(this.memoryIndices).reduce((acc, [key, index]) => {
                acc[key] = index.size;
                return acc;
            }, {})
        };
    }
    
    /**
     * 🔍 SEARCH SIMILAR PROJECTS
     */
    async searchSimilarProjects(searchCriteria, options = {}) {
        const limit = options.limit || 10;
        const similarityThreshold = options.similarityThreshold || 0.7;
        
        try {
            // Search in database
            if (this.database) {
                const query = `
                    SELECT 
                        cp.*,
                        cm.analysis_data,
                        cm.error_patterns,
                        cm.quantity_data
                    FROM construction_projects cp
                    LEFT JOIN construction_memory cm ON cp.project_id = cm.project_id
                    WHERE cp.project_type = $1
                    ORDER BY 
                        CASE 
                            WHEN cp.scale = $2 THEN 1
                            ELSE 2
                        END,
                        cp.created_at DESC
                    LIMIT $3
                `;
                
                const result = await this.database.query(query, [
                    searchCriteria.projectType,
                    searchCriteria.scale,
                    limit
                ]);
                
                // Filter by similarity
                const similarProjects = [];
                
                for (const project of result.rows) {
                    const similarity = this.calculateProjectSimilarity(
                        searchCriteria,
                        project
                    );
                    
                    if (similarity >= similarityThreshold) {
                        similarProjects.push({
                            ...project,
                            similarity,
                            errorPatterns: project.error_patterns || [],
                            quantityData: project.quantity_data || {}
                        });
                    }
                }
                
                // Sort by similarity
                similarProjects.sort((a, b) => b.similarity - a.similarity);
                
                return similarProjects.slice(0, limit);
            }
            
            // Fallback: Search in memory if no database
            const projects = Array.from(this.planMemory.values())
                .filter(mem => mem.projectType === searchCriteria.projectType)
                .map(mem => ({
                    ...mem,
                    similarity: this.calculateProjectSimilarity(searchCriteria, mem)
                }))
                .filter(proj => proj.similarity >= similarityThreshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit);
            
            return projects;
            
        } catch (error) {
            console.error('Failed to search similar projects:', error);
            return [];
        }
    }
    
    /**
     * 📊 CALCULATE PROJECT SIMILARITY
     */
    calculateProjectSimilarity(criteria, project) {
        let similarity = 0;
        let factors = 0;
        
        // Project type match (highest weight)
        if (criteria.projectType === project.project_type || criteria.projectType === project.projectType) {
            similarity += 0.4;
        }
        factors++;
        
        // Scale match
        if (criteria.scale === project.scale) {
            similarity += 0.2;
        }
        factors++;
        
        // Complexity match
        if (criteria.complexity === project.complexity) {
            similarity += 0.15;
        }
        factors++;
        
        // Phase match
        if (criteria.phase === project.phase) {
            similarity += 0.15;
        }
        factors++;
        
        // Error type overlap
        if (criteria.errorTypes && project.error_patterns) {
            const errorPatterns = Array.isArray(project.error_patterns) ? 
                project.error_patterns : 
                (project.error_patterns.patterns || []);
            
            const errorTypeSet = new Set(criteria.errorTypes);
            const patternTypeSet = new Set(
                errorPatterns.map(e => e.type || e.errorType)
            );
            
            const intersection = new Set(
                [...errorTypeSet].filter(x => patternTypeSet.has(x))
            );
            
            const union = new Set([...errorTypeSet, ...patternTypeSet]);
            
            const jaccardSimilarity = union.size > 0 ? 
                intersection.size / union.size : 0;
            
            similarity += jaccardSimilarity * 0.1;
        }
        factors++;
        
        return similarity;
    }
    
    /**
     * 🔌 SHUTDOWN
     */
    async shutdown() {
        console.log('🔌 Shutting down Construction Memory Persistence...');
        
        // Stop auto-save
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // Save all pending memories
        await this.saveMemories();
        
        // Shutdown subsystems
        if (this.eliteMemory) {
            await this.eliteMemory.shutdown();
        }
        if (this.quantumMemory) {
            await this.quantumMemory.shutdown();
        }
        
        console.log('✅ Construction Memory Persistence shutdown complete');
        this.emit('shutdown');
    }
}

// Export
export default ConstructionMemoryPersistence;
