/**
 * 🚨 COMPREHENSIVE PERSISTENCE LAYER
 * ==================================
 * 
 * CRITICAL: Integrates all memory components with the existing
 * EliteMemoryPersistenceEngine to ensure proper state persistence,
 * hourly backups, breakthrough detection, and recovery.
 * 
 * INCLUDES:
 * - State persistence for all memory components
 * - Hourly + breakthrough backups
 * - Decision storage and performance review loops
 * - Formal judge verification
 * - Constitutional verification
 * - Self-learning and evolution mechanisms
 */

import { EventEmitter } from 'events';
import { EliteMemoryPersistenceEngine } from './EliteMemoryPersistenceEngine.js';

export class ComprehensivePersistenceLayer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            hourlyBackupInterval: config.hourlyBackupInterval || 3600000, // 1 hour
            breakthroughThreshold: config.breakthroughThreshold || 0.15, // 15% improvement
            decisionHistoryLimit: config.decisionHistoryLimit || 10000,
            performanceReviewInterval: config.performanceReviewInterval || 1800000, // 30 minutes
            constitutionalCheckInterval: config.constitutionalCheckInterval || 600000, // 10 minutes
            formalVerificationEnabled: config.formalVerificationEnabled ?? true,
            ...config
        };
        
        // Core persistence engine
        this.elitePersistence = null;
        
        // Memory components to persist
        this.memoryComponents = new Map();
        
        // Decision tracking
        this.decisionHistory = [];
        this.performanceMetrics = {
            totalDecisions: 0,
            successfulDecisions: 0,
            failedDecisions: 0,
            averageReward: 0,
            learningRate: 0.1
        };
        
        // Verification systems
        this.formalJudge = null;
        this.constitutionalVerifier = null;
        
        // Backup state
        this.lastBackupTime = Date.now();
        this.lastBackupMetrics = { ...this.performanceMetrics };
        
        this.initialized = false;
    }

    /**
     * Initialize comprehensive persistence layer
     */
    async initialize(dependencies) {
        console.log('🚨 Initializing CRITICAL Comprehensive Persistence Layer...');
        
        // Initialize elite persistence engine
        this.elitePersistence = new EliteMemoryPersistenceEngine({
            database: dependencies.database,
            persistenceKey: 'advanced_memory_system',
            enableAutoBackup: true,
            hourlyBackupInterval: this.config.hourlyBackupInterval,
            breakthroughThreshold: this.config.breakthroughThreshold
        });
        
        await this.elitePersistence.initialize();
        
        // 🔥 CONNECT UNIFIED KNOWLEDGE STORAGE TO ELITE PERSISTENCE
        if (dependencies.unifiedKnowledgeStorage) {
            console.log('🔗 Connecting UnifiedKnowledgeStorage to EliteMemoryPersistence...');
            this.elitePersistence.connectUnifiedKnowledgeStorage(dependencies.unifiedKnowledgeStorage);
            this.unifiedKnowledgeStorage = dependencies.unifiedKnowledgeStorage;
            console.log('   ✅ KG/QKG backend connected: Memory can route to Knowledge Graph!');
        }
        
        // Initialize verification systems
        await this.initializeVerificationSystems(dependencies);
        
        // Start all persistence loops
        this.startHourlyBackupCycle();
        this.startPerformanceReviewLoop();
        this.startConstitutionalCheckLoop();
        this.startDecisionTrackingLoop();
        
        // Load existing state
        await this.loadCompleteState();
        
        this.initialized = true;
        console.log('✅ Comprehensive Persistence Layer initialized with ALL systems active!');
        
        return true;
    }

    /**
     * Register a memory component for persistence
     */
    registerMemoryComponent(name, component) {
        console.log(`📝 Registering ${name} for persistence...`);
        
        this.memoryComponents.set(name, component);
        
        // Add persistence methods if not present
        if (!component.saveState) {
            component.saveState = async () => {
                return await this.saveComponentState(name, component);
            };
        }
        
        if (!component.loadState) {
            component.loadState = async () => {
                return await this.loadComponentState(name, component);
            };
        }
        
        // Setup breakthrough detection
        if (component.getMetrics) {
            component.on('significant_improvement', async (improvement) => {
                await this.handleBreakthrough(name, improvement);
            });
        }
    }

    /**
     * Initialize verification systems
     */
    async initializeVerificationSystems(dependencies) {
        console.log('⚖️ Initializing verification systems...');
        
        // Formal Judge Verification
        if (dependencies.formalVerification) {
            this.formalJudge = dependencies.formalVerification;
        } else {
            // Create basic formal verification
            this.formalJudge = {
                verify: async (decision) => {
                    // Formal verification logic
                    const verification = {
                        valid: true,
                        proofs: [],
                        confidence: 0.9
                    };
                    
                    // Check decision structure
                    if (!decision.action || !decision.context) {
                        verification.valid = false;
                        verification.reason = 'Invalid decision structure';
                    }
                    
                    // Check mathematical constraints
                    if (decision.value && (decision.value < 0 || decision.value > 1)) {
                        verification.valid = false;
                        verification.reason = 'Value out of bounds';
                    }
                    
                    return verification;
                }
            };
        }
        
        // Constitutional Verification
        this.constitutionalVerifier = {
            checkCompliance: async (action) => {
                const compliance = {
                    compliant: true,
                    violations: [],
                    recommendations: []
                };
                
                // Core constitutional principles
                const principles = [
                    'transparency',
                    'safety',
                    'fairness',
                    'accountability',
                    'sustainability'
                ];
                
                // Check against each principle
                for (const principle of principles) {
                    const check = await this.checkPrinciple(action, principle);
                    if (!check.compliant) {
                        compliance.compliant = false;
                        compliance.violations.push({
                            principle,
                            reason: check.reason
                        });
                    }
                }
                
                return compliance;
            }
        };
        
        console.log('✅ Verification systems initialized');
    }

    /**
     * Start hourly backup cycle
     */
    startHourlyBackupCycle() {
        console.log('⏰ Starting hourly backup cycle...');
        
        // Initial backup
        this.performBackup('initial');
        
        // Hourly backups
        this.hourlyBackupTimer = setInterval(async () => {
            await this.performBackup('hourly');
        }, this.config.hourlyBackupInterval);
        
        // Breakthrough detection
        this.breakthroughTimer = setInterval(async () => {
            await this.checkForBreakthrough();
        }, 60000); // Check every minute
    }

    /**
     * Perform comprehensive backup
     */
    async performBackup(reason = 'scheduled') {
        console.log(`💾 Performing ${reason} backup...`);
        const startTime = Date.now();
        
        try {
            const backupData = {
                timestamp: new Date(),
                reason,
                components: {},
                decisions: this.decisionHistory.slice(-1000), // Last 1000 decisions
                metrics: this.performanceMetrics,
                verificationStats: await this.getVerificationStats()
            };
            
            // Save all component states
            for (const [name, component] of this.memoryComponents) {
                try {
                    if (component.getState) {
                        backupData.components[name] = await component.getState();
                    } else if (component.getStats) {
                        backupData.components[name] = await component.getStats();
                    }
                } catch (error) {
                    console.error(`❌ Failed to backup ${name}:`, error);
                }
            }
            
            // Use elite persistence to save
            // 🔥 FIX: Use storeMemory instead of saveState
            await this.elitePersistence.storeMemory('system_backup', backupData, {
                importance: 1.0,
                agentId: 'ComprehensivePersistenceLayer',
                storeToKG: true
            });
            
            // Update backup metrics
            this.lastBackupTime = Date.now();
            this.lastBackupMetrics = { ...this.performanceMetrics };
            
            const duration = Date.now() - startTime;
            console.log(`✅ Backup complete in ${duration}ms`);
            
            this.emit('backup_complete', {
                reason,
                duration,
                componentsBackedUp: Object.keys(backupData.components).length
            });
            
        } catch (error) {
            console.error('❌ Backup failed:', error);
            this.emit('backup_failed', { reason, error });
        }
    }

    /**
     * Check for breakthrough improvements
     */
    async checkForBreakthrough() {
        const currentMetrics = this.performanceMetrics;
        const previousMetrics = this.lastBackupMetrics;
        
        // Calculate improvement
        const rewardImprovement = previousMetrics.averageReward > 0 ?
            (currentMetrics.averageReward - previousMetrics.averageReward) / previousMetrics.averageReward : 0;
        
        const successRateImprovement = previousMetrics.successfulDecisions > 0 ?
            (currentMetrics.successfulDecisions / currentMetrics.totalDecisions) -
            (previousMetrics.successfulDecisions / previousMetrics.totalDecisions) : 0;
        
        // Check if breakthrough threshold met
        if (rewardImprovement > this.config.breakthroughThreshold ||
            successRateImprovement > this.config.breakthroughThreshold) {
            
            console.log(`🎯 BREAKTHROUGH DETECTED! Reward: ${(rewardImprovement * 100).toFixed(2)}%, Success: ${(successRateImprovement * 100).toFixed(2)}%`);
            
            await this.performBackup('breakthrough');
            
            this.emit('breakthrough_detected', {
                rewardImprovement,
                successRateImprovement,
                metrics: currentMetrics
            });
        }
    }

    /**
     * Start performance review loop
     */
    startPerformanceReviewLoop() {
        console.log('📊 Starting performance review loop...');
        
        this.performanceReviewTimer = setInterval(async () => {
            await this.reviewPerformance();
        }, this.config.performanceReviewInterval);
    }

    /**
     * Review and learn from performance
     */
    async reviewPerformance() {
        console.log('🔍 Reviewing performance and learning...');
        
        // Analyze recent decisions
        const recentDecisions = this.decisionHistory.slice(-100);
        const analysis = {
            patterns: this.identifyPatterns(recentDecisions),
            mistakes: this.identifyMistakes(recentDecisions),
            successes: this.identifySuccesses(recentDecisions),
            recommendations: []
        };
        
        // Learn from mistakes
        for (const mistake of analysis.mistakes) {
            const learning = await this.learnFromMistake(mistake);
            if (learning) {
                // Update decision-making strategy
                await this.updateStrategy(learning);
            }
        }
        
        // Reinforce successes
        for (const success of analysis.successes) {
            await this.reinforceSuccess(success);
        }
        
        // Generate recommendations
        analysis.recommendations = await this.generateRecommendations(analysis);
        
        // Store review results
        await this.storeReviewResults(analysis);
        
        this.emit('performance_reviewed', analysis);
    }

    /**
     * Start constitutional compliance checking
     */
    startConstitutionalCheckLoop() {
        console.log('📜 Starting constitutional compliance loop...');
        
        this.constitutionalTimer = setInterval(async () => {
            await this.checkConstitutionalCompliance();
        }, this.config.constitutionalCheckInterval);
    }

    /**
     * Check constitutional compliance
     */
    async checkConstitutionalCompliance() {
        const recentActions = this.decisionHistory.slice(-50);
        const violations = [];
        
        for (const decision of recentActions) {
            const compliance = await this.constitutionalVerifier.checkCompliance(decision);
            
            if (!compliance.compliant) {
                violations.push({
                    decision,
                    violations: compliance.violations,
                    timestamp: Date.now()
                });
            }
        }
        
        if (violations.length > 0) {
            console.warn(`⚠️ Constitutional violations detected: ${violations.length}`);
            
            // Take corrective action
            await this.handleConstitutionalViolations(violations);
        }
        
        return violations;
    }

    /**
     * Start decision tracking loop
     */
    startDecisionTrackingLoop() {
        console.log('📝 Starting decision tracking loop...');
        
        // Listen for decisions from all components
        for (const [name, component] of this.memoryComponents) {
            if (component.on) {
                component.on('decision_made', async (decision) => {
                    await this.trackDecision(name, decision);
                });
            }
        }
    }

    /**
     * Track a decision
     */
    async trackDecision(componentName, decision) {
        // Formal verification
        const formalVerification = await this.formalJudge.verify(decision);
        
        if (!formalVerification.valid) {
            console.warn(`⚠️ Decision failed formal verification: ${formalVerification.reason}`);
            decision.rejected = true;
            decision.rejectionReason = formalVerification.reason;
        }
        
        // Constitutional check
        const constitutionalCheck = await this.constitutionalVerifier.checkCompliance(decision);
        
        if (!constitutionalCheck.compliant) {
            console.warn(`⚠️ Decision violates constitutional principles`);
            decision.rejected = true;
            decision.violations = constitutionalCheck.violations;
        }
        
        // Store decision
        const trackedDecision = {
            id: `${componentName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            component: componentName,
            timestamp: Date.now(),
            decision,
            verification: {
                formal: formalVerification,
                constitutional: constitutionalCheck
            },
            outcome: null, // Will be updated later
            reward: null
        };
        
        this.decisionHistory.push(trackedDecision);
        
        // Limit history size
        if (this.decisionHistory.length > this.config.decisionHistoryLimit) {
            this.decisionHistory.shift();
        }
        
        // Update metrics
        this.performanceMetrics.totalDecisions++;
        
        // Store in database
        await this.storeDecision(trackedDecision);
        
        return trackedDecision;
    }

    /**
     * Store decision in database
     */
    async storeDecision(decision) {
        try {
            await this.elitePersistence.storeDecision(decision);
        } catch (error) {
            console.error('Failed to store decision:', error);
        }
    }

    /**
     * Update decision outcome
     */
    async updateDecisionOutcome(decisionId, outcome, reward) {
        const decision = this.decisionHistory.find(d => d.id === decisionId);
        
        if (decision) {
            decision.outcome = outcome;
            decision.reward = reward;
            
            // Update metrics
            if (outcome === 'success') {
                this.performanceMetrics.successfulDecisions++;
            } else {
                this.performanceMetrics.failedDecisions++;
            }
            
            // Update average reward
            const totalReward = this.decisionHistory
                .filter(d => d.reward !== null)
                .reduce((sum, d) => sum + d.reward, 0);
            
            const rewardCount = this.decisionHistory.filter(d => d.reward !== null).length;
            this.performanceMetrics.averageReward = rewardCount > 0 ? totalReward / rewardCount : 0;
            
            // Learn from outcome
            await this.learnFromOutcome(decision);
        }
    }

    /**
     * Learn from decision outcome
     */
    async learnFromOutcome(decision) {
        // Adjust learning based on outcome
        if (decision.outcome === 'success' && decision.reward > 0) {
            await this.reinforceSuccess(decision);
        } else if (decision.outcome === 'failure') {
            await this.learnFromMistake(decision);
        }
        
        // Update component that made the decision
        const component = this.memoryComponents.get(decision.component);
        if (component && component.updateFromFeedback) {
            await component.updateFromFeedback({
                decision: decision.decision,
                outcome: decision.outcome,
                reward: decision.reward
            });
        }
    }

    /**
     * Save complete state
     */
    async saveCompleteState() {
        console.log('💾 Saving complete system state...');
        
        const state = {
            timestamp: new Date(),
            performanceMetrics: this.performanceMetrics,
            decisionHistory: this.decisionHistory,
            componentStates: {},
            verificationStats: await this.getVerificationStats()
        };
        
        // Save all component states
        for (const [name, component] of this.memoryComponents) {
            if (component.saveState) {
                state.componentStates[name] = await component.saveState();
            }
        }
        
        // Save to elite persistence
        // 🔥 FIX: Use storeMemory instead of saveState
        await this.elitePersistence.storeMemory('system_state', state, {
            importance: 1.0,
            agentId: 'ComprehensivePersistenceLayer',
            storeToKG: true
        });
        
        // Also save individual component states to database
        await this.saveComponentStatesToDB();
        
        console.log('✅ Complete state saved');
    }
    
    /**
     * Save component states to database
     */
    async saveComponentStatesToDB() {
        // 🔥 FIX: Check if database is available
        if (!this.elitePersistence.dbPool) {
            console.log('📝 No database available, skipping DB save');
            return;
        }
        
        const client = await this.elitePersistence.dbPool.connect();
        
        try {
            await client.query('BEGIN');
            
            for (const [name, component] of this.memoryComponents) {
                if (component.getState) {
                    const state = await component.getState();
                    
                    await client.query(`
                        INSERT INTO memory_system_state (component_name, state_data, version)
                        VALUES ($1, $2, $3)
                        ON CONFLICT (component_name) DO UPDATE
                        SET state_data = $2, version = memory_system_state.version + 1, updated_at = NOW()
                    `, [name, JSON.stringify(state), 1]);
                }
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Load complete state
     */
    async loadCompleteState() {
        console.log('📥 Loading previous system state...');
        
        try {
            // 🔥 FIX: Use retrieveMemory instead of loadState
            const state = await this.elitePersistence.retrieveMemory('system_state');
            
            if (state) {
                // Restore metrics
                this.performanceMetrics = state.performanceMetrics || this.performanceMetrics;
                this.decisionHistory = state.decisionHistory || [];
                
                // Restore component states
                for (const [name, componentState] of Object.entries(state.componentStates || {})) {
                    const component = this.memoryComponents.get(name);
                    if (component && component.loadState) {
                        await component.loadState(componentState);
                    }
                }
                
                console.log(`✅ Loaded state from ${state.timestamp}`);
            } else {
                // Try loading from database
                await this.loadComponentStatesFromDB();
            }
        } catch (error) {
            console.error('❌ Failed to load state:', error);
            // Try loading from database as fallback
            await this.loadComponentStatesFromDB();
        }
    }
    
    /**
     * Load component states from database
     */
    async loadComponentStatesFromDB() {
        console.log('📥 Loading component states from database...');
        
        try {
            // 🔥 FIX: Check if database is available
            if (!this.elitePersistence.dbPool) {
                console.log('📝 No database available, skipping DB load');
                return;
            }
            
            const result = await this.elitePersistence.dbPool.query(`
                SELECT component_name, state_data, last_saved
                FROM memory_system_state
                ORDER BY component_name
            `);
            
            for (const row of result.rows) {
                const component = this.memoryComponents.get(row.component_name);
                if (component && component.setState) {
                    await component.setState(row.state_data);
                    console.log(`   ✅ Loaded ${row.component_name} state from ${row.last_saved}`);
                }
            }
            
            if (result.rows.length === 0) {
                console.log('📝 No previous component states found');
            }
        } catch (error) {
            console.error('❌ Failed to load component states from DB:', error);
        }
    }

    /**
     * Helper methods
     */
    async saveComponentState(name, component) {
        const state = {
            name,
            timestamp: Date.now(),
            data: {}
        };
        
        // Extract state based on available methods
        if (component.getState) {
            state.data = await component.getState();
        } else if (component.serialize) {
            state.data = await component.serialize();
        } else if (component.toJSON) {
            state.data = component.toJSON();
        } else {
            // Extract public properties
            for (const key of Object.keys(component)) {
                if (!key.startsWith('_') && typeof component[key] !== 'function') {
                    state.data[key] = component[key];
                }
            }
        }
        
        return state;
    }

    async loadComponentState(name, component) {
        try {
            const state = await this.elitePersistence.loadComponentState(name);
            
            if (state && state.data) {
                if (component.setState) {
                    await component.setState(state.data);
                } else if (component.deserialize) {
                    await component.deserialize(state.data);
                } else {
                    // Set properties directly
                    Object.assign(component, state.data);
                }
                
                return true;
            }
        } catch (error) {
            console.error(`Failed to load state for ${name}:`, error);
        }
        
        return false;
    }

    identifyPatterns(decisions) {
        const patterns = [];
        
        // Look for repeated decision types
        const decisionTypes = {};
        for (const decision of decisions) {
            const type = decision.decision?.type || 'unknown';
            decisionTypes[type] = (decisionTypes[type] || 0) + 1;
        }
        
        // Identify dominant patterns
        for (const [type, count] of Object.entries(decisionTypes)) {
            if (count > decisions.length * 0.2) { // More than 20%
                patterns.push({
                    type: 'frequent_decision',
                    decisionType: type,
                    frequency: count / decisions.length
                });
            }
        }
        
        return patterns;
    }

    identifyMistakes(decisions) {
        return decisions.filter(d => 
            d.outcome === 'failure' || 
            d.reward < 0 ||
            d.rejected
        );
    }

    identifySuccesses(decisions) {
        return decisions.filter(d => 
            d.outcome === 'success' && 
            d.reward > 0 &&
            !d.rejected
        );
    }

    async learnFromMistake(mistake) {
        return {
            type: 'avoid',
            pattern: mistake.decision,
            reason: mistake.rejectionReason || mistake.violations || 'negative_reward'
        };
    }

    async reinforceSuccess(success) {
        // Increase confidence in successful patterns
        const pattern = {
            type: 'reinforce',
            pattern: success.decision,
            reward: success.reward
        };
        
        // Store successful pattern
        await this.elitePersistence.storeSuccessfulPattern(pattern);
    }

    async updateStrategy(learning) {
        // Broadcast learning to all components
        for (const [name, component] of this.memoryComponents) {
            if (component.updateStrategy) {
                await component.updateStrategy(learning);
            }
        }
    }

    async generateRecommendations(analysis) {
        const recommendations = [];
        
        // Based on patterns
        for (const pattern of analysis.patterns) {
            if (pattern.type === 'frequent_decision') {
                recommendations.push({
                    type: 'optimize',
                    target: pattern.decisionType,
                    reason: `High frequency (${(pattern.frequency * 100).toFixed(1)}%)`
                });
            }
        }
        
        // Based on mistakes
        if (analysis.mistakes.length > analysis.successes.length) {
            recommendations.push({
                type: 'review_strategy',
                reason: 'High failure rate',
                failureRate: analysis.mistakes.length / (analysis.mistakes.length + analysis.successes.length)
            });
        }
        
        return recommendations;
    }

    async storeReviewResults(analysis) {
        await this.elitePersistence.storePerformanceReview({
            timestamp: Date.now(),
            analysis,
            metrics: this.performanceMetrics
        });
    }

    async checkPrinciple(action, principle) {
        const checks = {
            transparency: () => action.reasoning && action.explanation,
            safety: () => action.riskAssessment && action.riskScore < 0.7,
            fairness: () => !action.discriminatory && action.equalOpportunity,
            accountability: () => action.responsible && action.traceable,
            sustainability: () => action.longTermViable && !action.harmful
        };
        
        const checkFn = checks[principle];
        const compliant = checkFn ? checkFn() : true;
        
        return {
            compliant,
            reason: compliant ? null : `Failed ${principle} check`
        };
    }

    async handleBreakthrough(componentName, improvement) {
        console.log(`🎯 Component ${componentName} achieved breakthrough: ${improvement}`);
        
        await this.performBackup(`breakthrough_${componentName}`);
        
        this.emit('component_breakthrough', {
            component: componentName,
            improvement,
            timestamp: Date.now()
        });
    }

    async handleConstitutionalViolations(violations) {
        // Log violations
        for (const violation of violations) {
            console.error('Constitutional violation:', violation);
        }
        
        // Take corrective action
        for (const violation of violations) {
            const component = this.memoryComponents.get(violation.decision.component);
            
            if (component && component.correctViolation) {
                await component.correctViolation(violation);
            }
        }
        
        // Store violations for learning
        await this.elitePersistence.storeViolations(violations);
    }

    async getVerificationStats() {
        const totalDecisions = this.decisionHistory.length;
        const formallyVerified = this.decisionHistory.filter(d => 
            d.verification?.formal?.valid
        ).length;
        const constitutionallyCompliant = this.decisionHistory.filter(d =>
            d.verification?.constitutional?.compliant
        ).length;
        
        return {
            totalDecisions,
            formalVerificationRate: totalDecisions > 0 ? formallyVerified / totalDecisions : 0,
            constitutionalComplianceRate: totalDecisions > 0 ? constitutionallyCompliant / totalDecisions : 0
        };
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down persistence layer...');
        
        // Final backup
        await this.performBackup('shutdown');
        
        // Clear timers
        if (this.hourlyBackupTimer) clearInterval(this.hourlyBackupTimer);
        if (this.breakthroughTimer) clearInterval(this.breakthroughTimer);
        if (this.performanceReviewTimer) clearInterval(this.performanceReviewTimer);
        if (this.constitutionalTimer) clearInterval(this.constitutionalTimer);
        
        // Shutdown elite persistence
        if (this.elitePersistence) {
            await this.elitePersistence.shutdown();
        }
        
        console.log('✅ Persistence layer shutdown complete');
    }

    /**
     * Get persistence statistics
     */
    getStats() {
        return {
            performanceMetrics: this.performanceMetrics,
            decisionCount: this.decisionHistory.length,
            componentCount: this.memoryComponents.size,
            lastBackup: new Date(this.lastBackupTime),
            timeSinceBackup: Date.now() - this.lastBackupTime,
            verificationStats: this.getVerificationStats()
        };
    }
}

// Export singleton instance
export const comprehensivePersistence = new ComprehensivePersistenceLayer();
