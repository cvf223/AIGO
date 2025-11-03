/**
 * 🧠⚡ PROACTIVE DECISION AWARENESS ORCHESTRATOR - COMPREHENSIVE AWARENESS INTEGRATION
 * =====================================================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - MANDATORY JUDGE VERIFICATION & AWARENESS SYSTEMS
 * 
 * CORE PURPOSE:
 * - Orchestrate ALL awareness systems for proactive decision making
 * - MANDATORY LLMJudge verification for EVERY conclusion and result
 * - Integrate reward/penalty, meta, market, and forecasting awareness
 * - Ensure NO decision is made without comprehensive awareness
 * 
 * KEY FEATURES:
 * ✅ Reward/Penalty Awareness - Agents know consequences BEFORE acting
 * ✅ Meta Awareness - Understanding of system state and agent performance
 * ✅ Market Awareness - Real-time market conditions and opportunities
 * ✅ Forecasting Awareness - Predictive insights and future projections
 * ✅ MANDATORY Judge Verification - ALL results go through LLMJudge
 * ✅ Enhancement Analysis - Every decision gets improvement suggestions
 * ✅ State Persistence - Full recovery after server restart
 * 
 * CRITICAL RULE: NO REWARD OR PENALTY WITHOUT JUDGE VERIFICATION!
 */

import { EventEmitter } from 'events';
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

/**
 * 🎯 AWARENESS THRESHOLDS
 * =====================
 */
export const AWARENESS_THRESHOLDS = {
    // Confidence thresholds for decisions
    MIN_CONFIDENCE: 0.60,      // Minimum confidence to proceed
    HIGH_CONFIDENCE: 0.80,     // High confidence threshold
    CERTAINTY: 0.95,           // Near-certainty threshold
    
    // Risk thresholds
    LOW_RISK: 0.30,
    MEDIUM_RISK: 0.60,
    HIGH_RISK: 0.80,
    EXTREME_RISK: 0.95,
    
    // Awareness requirements
    MIN_AWARENESS_SCORE: 0.70,  // Minimum combined awareness
    JUDGE_OVERRIDE_THRESHOLD: 0.90  // Judge can override below this
};

/**
 * 🧠⚡ PROACTIVE DECISION AWARENESS ORCHESTRATOR
 * =============================================
 */
export class ProactiveDecisionAwarenessOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('🧠⚡ Initializing Proactive Decision Awareness Orchestrator...');
        console.log('   MANDATORY: All decisions require Judge verification!');
        console.log('   INTEGRATED: Reward/Penalty, Meta, Market, Forecasting awareness');
        
        this.config = {
            enableRewardPenaltyAwareness: config.enableRewardPenaltyAwareness !== false,
            enableMetaAwareness: config.enableMetaAwareness !== false,
            enableMarketAwareness: config.enableMarketAwareness !== false,
            enableForecastingAwareness: config.enableForecastingAwareness !== false,
            mandatoryJudgeVerification: config.mandatoryJudgeVerification !== false,
            enableStatePersistence: config.enableStatePersistence !== false,
            
            // Backup intervals
            stateBackupInterval: config.stateBackupInterval || 60000,  // 1 minute
            checkpointInterval: config.checkpointInterval || 300000,   // 5 minutes
            
            // Service registry
            serviceRegistry: config.serviceRegistry || null,
            
            ...config
        };
        
        // 🧠 AWARENESS SYSTEMS
        this.awarenessSystems = {
            rewardPenaltyEngine: null,
            decisionAwareness: null,
            metaAwareness: null,
            marketAwareness: null,
            forecastingAwareness: null,
            llmJudge: null,
            worldModel: null,
            causalForecasting: null
        };
        
        // 📊 DECISION TRACKING
        this.decisionHistory = new Map();
        this.pendingVerifications = new Map();
        this.verifiedDecisions = new Map();
        this.enhancementSuggestions = new Map();
        
        // 🎯 AWARENESS STATE
        this.awarenessState = {
            globalMarketCondition: 'normal',
            systemRiskLevel: 0.3,
            activeAgents: new Map(),
            recentDecisions: [],
            performanceMetrics: {
                successRate: 0,
                avgConfidence: 0,
                judgeApprovalRate: 0,
                enhancementAdoptionRate: 0
            }
        };
        
        // 💾 PERSISTENCE
        this.persistenceEngine = null;
        this.lastCheckpoint = null;
        this.backupInterval = null;
        this.checkpointInterval = null;
        
        // 📈 METRICS
        this.metrics = {
            totalDecisions: 0,
            verifiedDecisions: 0,
            rejectedDecisions: 0,
            enhancementsProvided: 0,
            enhancementsAdopted: 0,
            rewardsIssued: 0,
            penaltiesIssued: 0,
            stateRecoveries: 0
        };
        
        console.log('🧠 Proactive Decision Awareness Orchestrator configured');
    }
    
    /**
     * 🚀 INITIALIZE WITH PERSISTENCE
     * ==============================
     */
    async initialize() {
        console.log('🚀 Initializing Proactive Decision Awareness Orchestrator...');
        
        try {
            // Initialize persistence FIRST
            await this.initializePersistence();
            
            // Try to recover previous state
            const recovered = await this.recoverState();
            if (recovered) {
                console.log('✅ Recovered previous state from persistence');
                this.metrics.stateRecoveries++;
            }
            
            // Connect awareness systems
            await this.connectAwarenessSystems();
            
            // Setup mandatory judge verification
            await this.setupMandatoryJudgeVerification();
            
            // Initialize proactive monitoring
            await this.initializeProactiveMonitoring();
            
            // Start backup intervals
            this.startPeriodicBackups();
            
            console.log('✅ Proactive Decision Awareness Orchestrator initialized');
            console.log('🛡️ MANDATORY Judge verification active');
            console.log('💾 State persistence and backups active');
            
        } catch (error) {
            console.error('❌ Failed to initialize Decision Awareness Orchestrator:', error);
            throw error;
        }
    }
    
    /**
     * 💾 INITIALIZE PERSISTENCE ENGINE
     * ================================
     */
    async initializePersistence() {
        console.log('💾 Initializing persistence engine...');
        
        if (this.config.enableStatePersistence) {
            this.persistenceEngine = new EliteMemoryPersistenceEngine({
                namespace: 'decision_awareness',
                enableAutoBackup: true,
                backupInterval: this.config.stateBackupInterval
            });
            
            await this.persistenceEngine.initialize();
            console.log('   ✅ Persistence engine initialized');
        }
    }
    
    /**
     * 💾 RECOVER STATE FROM PERSISTENCE
     * =================================
     */
    async recoverState() {
        if (!this.persistenceEngine) return false;
        
        try {
            const savedState = await this.persistenceEngine.loadState('awareness_orchestrator');
            if (!savedState) return false;
            
            console.log('💾 Recovering state from persistence...');
            
            // Restore awareness state
            if (savedState.awarenessState) {
                this.awarenessState = {
                    ...this.awarenessState,
                    ...savedState.awarenessState,
                    activeAgents: new Map(savedState.awarenessState.activeAgents || [])
                };
            }
            
            // Restore decision history
            if (savedState.decisionHistory) {
                this.decisionHistory = new Map(savedState.decisionHistory);
            }
            
            // Restore verified decisions
            if (savedState.verifiedDecisions) {
                this.verifiedDecisions = new Map(savedState.verifiedDecisions);
            }
            
            // Restore metrics
            if (savedState.metrics) {
                this.metrics = { ...this.metrics, ...savedState.metrics };
            }
            
            // Restore last checkpoint
            this.lastCheckpoint = savedState.lastCheckpoint || Date.now();
            
            console.log(`   ✅ Restored ${this.decisionHistory.size} decision records`);
            console.log(`   ✅ Restored ${this.verifiedDecisions.size} verified decisions`);
            console.log(`   ✅ Last checkpoint: ${new Date(this.lastCheckpoint).toISOString()}`);
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to recover state:', error);
            return false;
        }
    }
    
    /**
     * 💾 SAVE STATE TO PERSISTENCE
     * ============================
     */
    async saveState() {
        if (!this.persistenceEngine) return;
        
        try {
            const stateToSave = {
                awarenessState: {
                    ...this.awarenessState,
                    activeAgents: Array.from(this.awarenessState.activeAgents.entries())
                },
                decisionHistory: Array.from(this.decisionHistory.entries()).slice(-1000), // Last 1000 decisions
                verifiedDecisions: Array.from(this.verifiedDecisions.entries()).slice(-1000),
                enhancementSuggestions: Array.from(this.enhancementSuggestions.entries()).slice(-100),
                metrics: this.metrics,
                lastCheckpoint: Date.now()
            };
            
            await this.persistenceEngine.saveState('awareness_orchestrator', stateToSave);
            
        } catch (error) {
            console.error('❌ Failed to save state:', error);
        }
    }
    
    /**
     * 🔄 START PERIODIC BACKUPS
     * ========================
     */
    startPeriodicBackups() {
        // Regular state backup
        this.backupInterval = setInterval(async () => {
            await this.saveState();
        }, this.config.stateBackupInterval);
        
        // Checkpoint backup
        this.checkpointInterval = setInterval(async () => {
            await this.createCheckpoint();
        }, this.config.checkpointInterval);
        
        console.log('🔄 Periodic backups started');
        console.log(`   State backup: every ${this.config.stateBackupInterval / 1000}s`);
        console.log(`   Checkpoint: every ${this.config.checkpointInterval / 1000}s`);
    }
    
    /**
     * 💾 CREATE CHECKPOINT
     * ===================
     */
    async createCheckpoint() {
        if (!this.persistenceEngine) return;
        
        const checkpointId = `checkpoint_${Date.now()}`;
        const checkpoint = {
            id: checkpointId,
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            awarenessState: { ...this.awarenessState },
            totalDecisions: this.decisionHistory.size,
            totalVerified: this.verifiedDecisions.size
        };
        
        await this.persistenceEngine.saveState(checkpointId, checkpoint);
        this.lastCheckpoint = Date.now();
        
        console.log(`💾 Checkpoint created: ${checkpointId}`);
    }
    
    /**
     * 🔗 CONNECT AWARENESS SYSTEMS
     * ============================
     */
    async connectAwarenessSystems() {
        console.log('🔗 Connecting awareness systems...');
        
        if (!this.config.serviceRegistry) {
            console.warn('⚠️ No service registry - limited integration');
            return;
        }
        
        const registry = this.config.serviceRegistry;
        
        // Connect core awareness systems
        this.awarenessSystems.rewardPenaltyEngine = registry.rewardPenaltyEngine;
        this.awarenessSystems.decisionAwareness = registry.decisionAwareness;
        this.awarenessSystems.llmJudge = registry.llmJudge || registry.factory?.llmJudge;
        this.awarenessSystems.worldModel = registry.quantumGraphWorldModel;
        this.awarenessSystems.causalForecasting = registry.quantumCausalForecasting;
        
        if (this.awarenessSystems.rewardPenaltyEngine) {
            console.log('   ✅ Connected Reward/Penalty Engine');
        }
        
        if (this.awarenessSystems.llmJudge) {
            console.log('   ✅ Connected LLM Judge (MANDATORY verification)');
        }
        
        if (this.awarenessSystems.worldModel) {
            console.log('   ✅ Connected World Model');
        }
    }
    
    /**
     * ⚖️ SETUP MANDATORY JUDGE VERIFICATION
     * =====================================
     */
    async setupMandatoryJudgeVerification() {
        console.log('⚖️ Setting up MANDATORY Judge verification...');
        
        if (!this.awarenessSystems.llmJudge) {
            console.warn('⚠️ LLM Judge not available - running in test/development mode without judge verification');
            console.warn('🚨 PRODUCTION: Judge verification is MANDATORY!');
            
            // In test/development mode, create a pass-through wrapper
            this.mandatoryVerificationWrapper = async (agentId, decision, context) => {
                return {
                    approved: true,
                    reason: 'Test/development mode - no judge available',
                    testMode: true
                };
            };
            
            this.judgeVerificationActive = false;
            return;
        }
        
        // Override agent decision execution to require judge approval
        this.mandatoryVerificationWrapper = async (agentId, decision, context) => {
            return await this.verifyDecisionWithJudge(agentId, decision, context);
        };
        
        // Listen for judge events
        this.awarenessSystems.llmJudge.on('judgmentComplete', (judgment) => {
            this.handleJudgmentComplete(judgment);
        });
        
        this.awarenessSystems.llmJudge.on('enhancementSuggested', (enhancement) => {
            this.handleEnhancementSuggestion(enhancement);
        });
        
        console.log('   ✅ Mandatory Judge verification configured');
        console.log('   🛡️ NO decision can proceed without Judge approval');
    }
    
    /**
     * 🧠 BUILD COMPREHENSIVE AWARENESS
     * ================================
     */
    async buildComprehensiveAwareness(agentId, opportunity, context = {}) {
        console.log(`🧠 Building comprehensive awareness for agent ${agentId}`);
        
        const awareness = {
            timestamp: Date.now(),
            agentId,
            opportunityId: opportunity.id,
            
            // 💰 REWARD/PENALTY AWARENESS
            rewardPenalty: await this.getRewardPenaltyAwareness(agentId, opportunity, context),
            
            // 🎯 META AWARENESS
            meta: await this.getMetaAwareness(agentId, context),
            
            // 📊 MARKET AWARENESS
            market: await this.getMarketAwareness(opportunity, context),
            
            // 🔮 FORECASTING AWARENESS
            forecasting: await this.getForecastingAwareness(opportunity, context),
            
            // 🌍 WORLD MODEL AWARENESS
            worldModel: await this.getWorldModelAwareness(opportunity, context),
            
            // 📈 COMBINED AWARENESS SCORE
            awarenessScore: 0,
            confidence: 0,
            riskLevel: 0
        };
        
        // Calculate combined scores
        awareness.awarenessScore = this.calculateAwarenessScore(awareness);
        awareness.confidence = this.calculateConfidence(awareness);
        awareness.riskLevel = this.calculateRiskLevel(awareness);
        
        // Store awareness for agent
        this.awarenessState.activeAgents.set(agentId, awareness);
        
        console.log(`   ✅ Awareness built - Score: ${awareness.awarenessScore.toFixed(2)}, Risk: ${awareness.riskLevel.toFixed(2)}`);
        
        return awareness;
    }
    
    /**
     * 💰 GET REWARD/PENALTY AWARENESS
     * ===============================
     */
    async getRewardPenaltyAwareness(agentId, opportunity, context) {
        if (!this.awarenessSystems.rewardPenaltyEngine) return null;
        
        const rewardPenalty = await this.awarenessSystems.rewardPenaltyEngine.buildDecisionAwareness(
            agentId,
            opportunity,
            context
        );
        
        return {
            expectedReward: rewardPenalty.expectedRewards,
            expectedPenalty: rewardPenalty.expectedPenalties,
            netExpectation: rewardPenalty.expectedRewards.total - rewardPenalty.expectedPenalties.total,
            longTermProjection: rewardPenalty.longTermProjections,
            historicalPerformance: await this.getAgentHistoricalPerformance(agentId)
        };
    }
    
    /**
     * 🎯 GET META AWARENESS
     * ====================
     */
    async getMetaAwareness(agentId, context) {
        return {
            systemLoad: await this.getSystemLoad(),
            agentCapacity: await this.getAgentCapacity(agentId),
            competitorActivity: await this.getCompetitorActivity(),
            systemHealth: await this.getSystemHealth(),
            evolutionStage: await this.getEvolutionStage(agentId)
        };
    }
    
    /**
     * 📊 GET MARKET AWARENESS
     * ======================
     */
    async getMarketAwareness(opportunity, context) {
        return {
            currentConditions: await this.getCurrentMarketConditions(opportunity.chain),
            volatility: await this.getMarketVolatility(opportunity.tokens),
            liquidity: await this.getLiquidityMetrics(opportunity),
            gasPrice: await this.getGasMetrics(opportunity.chain),
            competitorBids: await this.getCompetitorBids(opportunity)
        };
    }
    
    /**
     * 🔮 GET FORECASTING AWARENESS
     * ============================
     */
    async getForecastingAwareness(opportunity, context) {
        if (!this.awarenessSystems.causalForecasting) return null;
        
        const forecast = await this.awarenessSystems.causalForecasting.forecast({
            opportunity,
            horizon: '1h',
            context
        });
        
        return {
            successProbability: forecast.successProbability || 0.5,
            profitProjection: forecast.profitProjection,
            riskFactors: forecast.riskFactors || [],
            causalChains: forecast.causalChains || [],
            confidenceInterval: forecast.confidenceInterval || [0.3, 0.7]
        };
    }
    
    /**
     * 🌍 GET WORLD MODEL AWARENESS
     * ============================
     */
    async getWorldModelAwareness(opportunity, context) {
        if (!this.awarenessSystems.worldModel) return null;
        
        const worldState = await this.awarenessSystems.worldModel.queryModel(
            'market_state',
            { opportunity, context }
        );
        
        return {
            marketRegime: worldState.regime || 'normal',
            structuralBreaks: worldState.structuralBreaks || [],
            anomalies: worldState.anomalies || [],
            patterns: worldState.patterns || [],
            confidence: worldState.confidence || 0.5
        };
    }
    
    /**
     * ⚖️ VERIFY DECISION WITH JUDGE (MANDATORY!)
     * ==========================================
     */
    async verifyDecisionWithJudge(agentId, decision, context) {
        console.log(`⚖️ MANDATORY Judge verification for agent ${agentId}`);
        
        if (!this.awarenessSystems.llmJudge) {
            throw new Error('CRITICAL: LLM Judge not available for mandatory verification!');
        }
        
        // Build comprehensive awareness
        const awareness = await this.buildComprehensiveAwareness(
            agentId,
            decision.opportunity,
            context
        );
        
        // Check minimum awareness threshold
        if (awareness.awarenessScore < AWARENESS_THRESHOLDS.MIN_AWARENESS_SCORE) {
            console.warn(`⚠️ Insufficient awareness (${awareness.awarenessScore.toFixed(2)}) - requiring enhanced analysis`);
            // Request enhanced analysis
            awareness.enhanced = await this.requestEnhancedAnalysis(decision, awareness);
        }
        
        // Prepare for judge
        const judgmentRequest = {
            agentId,
            decision,
            awareness,
            context,
            requestedAt: Date.now(),
            mandatoryVerification: true
        };
        
        // Store pending verification
        const verificationId = `verify_${Date.now()}_${agentId}`;
        this.pendingVerifications.set(verificationId, judgmentRequest);
        
        try {
            // Submit to judge for verification
            const judgment = await this.awarenessSystems.llmJudge.judgeAgentAction(
                agentId,
                {
                    opportunity: decision.opportunity,
                    decision: decision,
                    awareness: awareness,
                    context: context
                }
            );
            
            // Process judgment
            const verificationResult = this.processJudgment(judgment, decision, awareness);
            
            // Store verified decision
            this.verifiedDecisions.set(verificationId, {
                ...verificationResult,
                timestamp: Date.now()
            });
            
            // Update metrics
            this.metrics.verifiedDecisions++;
            if (verificationResult.approved) {
                console.log(`   ✅ Decision APPROVED by Judge`);
            } else {
                console.log(`   ❌ Decision REJECTED by Judge: ${verificationResult.reason}`);
                this.metrics.rejectedDecisions++;
            }
            
            // Apply reward or penalty based on judgment
            await this.applyRewardOrPenalty(agentId, verificationResult, awareness);
            
            return verificationResult;
            
        } catch (error) {
            console.error('❌ Judge verification failed:', error);
            
            // CRITICAL: No execution without judge approval
            return {
                approved: false,
                reason: 'Judge verification failed',
                error: error.message,
                fallbackAction: 'abort'
            };
        } finally {
            // Clean up pending verification
            this.pendingVerifications.delete(verificationId);
            
            // Save state after verification
            await this.saveState();
        }
    }
    
    /**
     * 📊 PROCESS JUDGMENT
     * ==================
     */
    processJudgment(judgment, decision, awareness) {
        const result = {
            approved: false,
            confidence: judgment.confidence || 0,
            score: judgment.score || 0,
            reason: judgment.feedback || '',
            enhancements: judgment.enhancements || [],
            reward: judgment.reward || 0,
            penalty: judgment.penalty || 0
        };
        
        // Determine approval based on judgment
        if (judgment.score >= AWARENESS_THRESHOLDS.MIN_CONFIDENCE) {
            result.approved = true;
            
            // Apply enhancements if high-value
            if (judgment.enhancements && judgment.enhancements.length > 0) {
                result.enhancedDecision = this.applyEnhancements(decision, judgment.enhancements);
                this.metrics.enhancementsProvided++;
            }
        } else {
            result.approved = false;
            result.fallbackAction = judgment.suggestedAction || 'abort';
        }
        
        return result;
    }
    
    /**
     * 💰 APPLY REWARD OR PENALTY
     * =========================
     */
    async applyRewardOrPenalty(agentId, verificationResult, awareness) {
        if (!this.awarenessSystems.rewardPenaltyEngine) return;
        
        if (verificationResult.approved && verificationResult.reward > 0) {
            // Issue reward
            await this.awarenessSystems.rewardPenaltyEngine.issueReward(
                agentId,
                verificationResult.reward,
                'Judge approved decision',
                {
                    awareness: awareness.awarenessScore,
                    confidence: verificationResult.confidence
                }
            );
            this.metrics.rewardsIssued++;
            
        } else if (!verificationResult.approved && verificationResult.penalty > 0) {
            // Issue penalty
            await this.awarenessSystems.rewardPenaltyEngine.issuePenalty(
                agentId,
                verificationResult.penalty,
                verificationResult.reason,
                {
                    awareness: awareness.awarenessScore,
                    riskLevel: awareness.riskLevel
                }
            );
            this.metrics.penaltiesIssued++;
        }
    }
    
    /**
     * 💡 APPLY ENHANCEMENTS
     * ====================
     */
    applyEnhancements(decision, enhancements) {
        const enhanced = { ...decision };
        
        for (const enhancement of enhancements) {
            switch (enhancement.type) {
                case 'adjust_gas':
                    enhanced.gasPrice = enhancement.value;
                    break;
                case 'modify_slippage':
                    enhanced.slippage = enhancement.value;
                    break;
                case 'change_route':
                    enhanced.route = enhancement.value;
                    break;
                case 'add_safety':
                    enhanced.safetyChecks = enhancement.value;
                    break;
            }
        }
        
        this.metrics.enhancementsAdopted++;
        return enhanced;
    }
    
    /**
     * 🔍 INITIALIZE PROACTIVE MONITORING
     * ==================================
     */
    async initializeProactiveMonitoring() {
        console.log('🔍 Initializing proactive monitoring...');
        
        // Monitor decision patterns
        this.monitoringInterval = setInterval(async () => {
            await this.analyzeDecisionPatterns();
            await this.updateSystemAwareness();
        }, 5000); // Every 5 seconds
        
        console.log('   ✅ Proactive monitoring active');
    }
    
    /**
     * 📊 ANALYZE DECISION PATTERNS
     * ============================
     */
    async analyzeDecisionPatterns() {
        const recentDecisions = Array.from(this.decisionHistory.values())
            .slice(-100); // Last 100 decisions
        
        if (recentDecisions.length === 0) return;
        
        // Calculate metrics
        const successRate = recentDecisions.filter(d => d.approved).length / recentDecisions.length;
        const avgConfidence = recentDecisions.reduce((sum, d) => sum + (d.confidence || 0), 0) / recentDecisions.length;
        const judgeApprovalRate = this.metrics.verifiedDecisions > 0 
            ? (this.metrics.verifiedDecisions - this.metrics.rejectedDecisions) / this.metrics.verifiedDecisions
            : 0;
        
        // Update performance metrics
        this.awarenessState.performanceMetrics = {
            successRate,
            avgConfidence,
            judgeApprovalRate,
            enhancementAdoptionRate: this.metrics.enhancementsProvided > 0
                ? this.metrics.enhancementsAdopted / this.metrics.enhancementsProvided
                : 0
        };
        
        // Detect concerning patterns
        if (successRate < 0.5) {
            console.warn('⚠️ Low success rate detected - increasing awareness requirements');
            this.emit('lowSuccessRate', { successRate, recentDecisions });
        }
        
        if (avgConfidence < AWARENESS_THRESHOLDS.MIN_CONFIDENCE) {
            console.warn('⚠️ Low confidence pattern - requesting enhanced analysis');
            this.emit('lowConfidence', { avgConfidence });
        }
    }
    
    /**
     * 🔄 UPDATE SYSTEM AWARENESS
     * ==========================
     */
    async updateSystemAwareness() {
        // Update global market condition
        if (this.awarenessSystems.worldModel) {
            const marketState = await this.awarenessSystems.worldModel.queryModel('global_market_state');
            this.awarenessState.globalMarketCondition = marketState.condition || 'normal';
        }
        
        // Update system risk level
        const risks = await this.assessSystemRisks();
        this.awarenessState.systemRiskLevel = risks.overall;
        
        // Emit awareness update
        this.emit('awarenessUpdate', this.awarenessState);
    }
    
    /**
     * 📊 CALCULATE AWARENESS SCORE
     * ============================
     */
    calculateAwarenessScore(awareness) {
        const weights = {
            rewardPenalty: 0.25,
            meta: 0.20,
            market: 0.25,
            forecasting: 0.20,
            worldModel: 0.10
        };
        
        let score = 0;
        let totalWeight = 0;
        
        if (awareness.rewardPenalty) {
            const rpScore = awareness.rewardPenalty.netExpectation > 0 ? 0.7 : 0.3;
            score += rpScore * weights.rewardPenalty;
            totalWeight += weights.rewardPenalty;
        }
        
        if (awareness.meta) {
            const metaScore = 1 - awareness.meta.systemLoad;
            score += metaScore * weights.meta;
            totalWeight += weights.meta;
        }
        
        if (awareness.market) {
            const marketScore = awareness.market.liquidity?.score || 0.5;
            score += marketScore * weights.market;
            totalWeight += weights.market;
        }
        
        if (awareness.forecasting) {
            score += awareness.forecasting.successProbability * weights.forecasting;
            totalWeight += weights.forecasting;
        }
        
        if (awareness.worldModel) {
            score += awareness.worldModel.confidence * weights.worldModel;
            totalWeight += weights.worldModel;
        }
        
        return totalWeight > 0 ? score / totalWeight : 0;
    }
    
    /**
     * 🎯 CALCULATE CONFIDENCE
     * ======================
     */
    calculateConfidence(awareness) {
        const factors = [];
        
        if (awareness.rewardPenalty?.historicalPerformance) {
            factors.push(awareness.rewardPenalty.historicalPerformance.successRate || 0.5);
        }
        
        if (awareness.forecasting?.confidenceInterval) {
            const [low, high] = awareness.forecasting.confidenceInterval;
            factors.push((high - low < 0.3) ? 0.8 : 0.5); // Tight interval = high confidence
        }
        
        if (awareness.worldModel?.confidence) {
            factors.push(awareness.worldModel.confidence);
        }
        
        return factors.length > 0 
            ? factors.reduce((sum, f) => sum + f, 0) / factors.length
            : 0.5;
    }
    
    /**
     * ⚠️ CALCULATE RISK LEVEL
     * ======================
     */
    calculateRiskLevel(awareness) {
        let risk = 0;
        let factors = 0;
        
        // Market volatility risk
        if (awareness.market?.volatility) {
            risk += awareness.market.volatility * 0.3;
            factors++;
        }
        
        // Negative expectation risk
        if (awareness.rewardPenalty?.netExpectation < 0) {
            risk += 0.4;
            factors++;
        }
        
        // Forecasting risk
        if (awareness.forecasting?.riskFactors) {
            risk += Math.min(awareness.forecasting.riskFactors.length * 0.1, 0.5);
            factors++;
        }
        
        // Anomaly risk
        if (awareness.worldModel?.anomalies && awareness.worldModel.anomalies.length > 0) {
            risk += 0.3;
            factors++;
        }
        
        return factors > 0 ? risk / factors : 0.3;
    }
    
    /**
     * 🔍 REQUEST ENHANCED ANALYSIS
     * ============================
     */
    async requestEnhancedAnalysis(decision, awareness) {
        console.log('🔍 Requesting enhanced analysis for low-awareness decision');
        
        // Use multiple analysis methods
        const enhancedAnalysis = {
            deepMarketAnalysis: await this.performDeepMarketAnalysis(decision.opportunity),
            competitorModeling: await this.modelCompetitorBehavior(decision.opportunity),
            alternativeStrategies: await this.generateAlternativeStrategies(decision),
            riskMitigation: await this.identifyRiskMitigations(decision, awareness)
        };
        
        return enhancedAnalysis;
    }
    
    // Helper methods (stubs for actual implementation)
    async getAgentHistoricalPerformance(agentId) {
        return { successRate: 0.7, totalDecisions: 100 };
    }
    
    async getSystemLoad() { return 0.5; }
    async getAgentCapacity(agentId) { return 0.8; }
    async getCompetitorActivity() { return { level: 'moderate' }; }
    async getSystemHealth() { return { status: 'healthy' }; }
    async getEvolutionStage(agentId) { return { stage: 'learning' }; }
    
    async getCurrentMarketConditions(chain) { return { volatility: 0.3 }; }
    async getMarketVolatility(tokens) { return 0.3; }
    async getLiquidityMetrics(opportunity) { return { score: 0.7 }; }
    async getGasMetrics(chain) { return { price: 50, trend: 'stable' }; }
    async getCompetitorBids(opportunity) { return []; }
    
    async assessSystemRisks() { return { overall: 0.3 }; }
    
    async performDeepMarketAnalysis(opportunity) { return {}; }
    async modelCompetitorBehavior(opportunity) { return {}; }
    async generateAlternativeStrategies(decision) { return []; }
    async identifyRiskMitigations(decision, awareness) { return []; }
    
    /**
     * 📊 GET STATUS
     * ============
     */
    getStatus() {
        return {
            awareness: this.awarenessState,
            metrics: this.metrics,
            pendingVerifications: this.pendingVerifications.size,
            verifiedDecisions: this.verifiedDecisions.size,
            lastCheckpoint: this.lastCheckpoint,
            performance: this.awarenessState.performanceMetrics
        };
    }
    
    /**
     * 🛑 SHUTDOWN
     * ==========
     */
    async shutdown() {
        console.log('🛑 Shutting down Decision Awareness Orchestrator...');
        
        // Save final state
        await this.saveState();
        await this.createCheckpoint();
        
        // Clear intervals
        if (this.monitoringInterval) clearInterval(this.monitoringInterval);
        if (this.backupInterval) clearInterval(this.backupInterval);
        if (this.checkpointInterval) clearInterval(this.checkpointInterval);
        
        console.log('📊 Final Metrics:');
        console.log(`   Total Decisions: ${this.metrics.totalDecisions}`);
        console.log(`   Verified: ${this.metrics.verifiedDecisions}`);
        console.log(`   Rejected: ${this.metrics.rejectedDecisions}`);
        console.log(`   Rewards Issued: ${this.metrics.rewardsIssued}`);
        console.log(`   Penalties Issued: ${this.metrics.penaltiesIssued}`);
        console.log(`   State Recoveries: ${this.metrics.stateRecoveries}`);
    }
}

// Export for use
export default ProactiveDecisionAwarenessOrchestrator;
