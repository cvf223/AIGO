/**
 * 🧠 REWARD PENALTY ENGINE - CENTRALIZED REWARD SYSTEM
 * =================================================
 * 
 * Centralized engine for managing rewards and penalties across all learning systems
 * Provides pre-decision awareness to agents about potential rewards and penalties
 * Integrates with all major learning systems (AlphaGo, A2C, MDP, Transformers)
 * 
 * This is the single source of truth for all reward/penalty logic in the system.
 */

// Core imports
import { EventEmitter } from 'events';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../src/construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../src/construction/prevention/ProactiveConstructionKnowledgePipeline.js';;

/**
 * Unified reward/penalty interface for all learning systems
 * WITH FORMAL REASONING & PROACTIVE PREVENTION INTEGRATION
 * 
 * ENHANCED with mathematical safety guarantees and truth-over-profit evaluation
 */
export class RewardPenaltyEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Default configuration with overrides
        this.config = {
            // Reward component weights
            rewardWeights: {
                profitability: 0.40,      // 40% weight on profit factors
                executionSuccess: 0.20,   // 20% weight on execution success
                competitiveWin: 0.15,     // 15% weight on beating competitors
                gasEfficiency: 0.10,      // 10% weight on gas optimization
                smartDecisions: 0.10,     // 10% weight on decision quality
                learningProgress: 0.05,   // 5% weight on learning/improvement
                ...config.rewardWeights
            },
            
            // Penalty component weights
            penaltyWeights: {
                executionFailure: 0.30,   // 30% weight on execution failures
                missedOpportunity: 0.25,  // 25% weight on missing good opportunities
                lostToCompetitor: 0.20,   // 20% weight on losing to competitors
                gasWaste: 0.15,           // 15% weight on gas inefficiency
                poorDecision: 0.10,       // 10% weight on poor decision quality
                ...config.penaltyWeights
            },
            
            // Long-term vs. short-term balance
            temporalBalance: {
                immediateRewardMultiplier: 1.0,
                mediumTermRewardMultiplier: 0.8,
                longTermRewardMultiplier: 1.2,
                ...config.temporalBalance
            },
            
            // Learning system integration configuration
            learningIntegration: {
                alphaGoEnabled: true,
                a2cEnabled: true,
                mdpEnabled: true,
                transformerEnabled: true,
                ...config.learningIntegration
            },
            
            // Database for reward/penalty persistence
            dbPool: config.dbPool || null,
            
            // Debug level
            debug: config.debug || false
        };
        
        // Internal state
        this.rewardHistory = new Map(); // agentId -> reward history array
        this.penaltyHistory = new Map(); // agentId -> penalty history array
        this.agentAwareness = new Map(); // agentId -> awareness objects
        this.rewardComponents = new Map(); // agentId -> reward component breakdown
        
        // System interfaces
        this.learningInterfaces = {
            alphaGo: null,
            a2c: null, 
            mdp: null,
            transformer: null
        };
        
        // Set default reward/penalty functions
        this.defaultRewardFunctions = this._createDefaultRewardFunctions();
        this.defaultPenaltyFunctions = this._createDefaultPenaltyFunctions();

        this.rewardTypes = {
            'PROVABLE_STRATEGY_DISCOVERY': { base: 25.0, temporalDecay: 1.0, description: 'Highest-tier reward for discovering a new, formally verifiable market mechanic or strategy.' },
            'COLLABORATION_REWARD': { base: 5.0, temporalDecay: 0.98, description: 'Reward for successful collaboration between agents to enhance syndicate capabilities.' },
            'INTELLIGENCE_CONTRIBUTION': { base: 2.0, temporalDecay: 0.9, description: 'Reward for creating a new, high-value, verified memory.' },
            'CORROBORATION_CONTRIBUTION': { base: 1.0, temporalDecay: 0.9, description: 'Reward for adding a new, verifying source to an existing high-value memory.' },
            'PRUDENCE_REWARD': { base: 1.0, temporalDecay: 0.95, description: 'Reward for avoiding a high-risk opportunity.' }
        };
        
        // Initialize system
        this._initialize();
    }
    
    /**
     * Initialize the reward/penalty engine
     * WITH FORMAL REASONING & PROACTIVE PREVENTION INTEGRATION
     */
    async _initialize() {
        console.log('🧠 Initializing Reward Penalty Engine...');
        
        if (this.config.dbPool) {
            await this._initializeDatabase();
        }
        
        // 🧠 INITIALIZE FORMAL REASONING INTEGRATION
        await this._initializeFormalReasoningIntegration();
        
        // 🛡️ INITIALIZE PROACTIVE PREVENTION INTEGRATION
        await this._initializeProactivePreventionIntegration();
        
        console.log('✅ Reward Penalty Engine initialized with formal reasoning and proactive prevention');
    }
    
    /**
     * Initialize database tables for reward/penalty tracking
     */
    async _initializeDatabase() {
        const client = await this.config.dbPool.connect();
        
        try {
            // Create reward/penalty tables if they don't exist
            await client.query(`
                CREATE TABLE IF NOT EXISTS agent_rewards (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    reward_type VARCHAR(50) NOT NULL,
                    amount DECIMAL(18,8) NOT NULL,
                    context JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS agent_penalties (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    penalty_type VARCHAR(50) NOT NULL,
                    amount DECIMAL(18,8) NOT NULL,
                    context JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS agent_awareness (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    opportunity_id VARCHAR(255),
                    expected_rewards JSONB NOT NULL,
                    expected_penalties JSONB NOT NULL,
                    guidance TEXT,
                    context JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            // Create indexes
            await client.query('CREATE INDEX IF NOT EXISTS idx_agent_rewards_agent_id ON agent_rewards(agent_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_agent_penalties_agent_id ON agent_penalties(agent_id)');
            await client.query('CREATE INDEX IF NOT EXISTS idx_agent_awareness_agent_id ON agent_awareness(agent_id)');
            
            console.log('✅ Reward/Penalty database tables initialized');
        } finally {
            client.release();
        }
    }
    
    /**
     * Register learning system interfaces to integrate with rewards/penalties
     */
    registerLearningInterfaces(interfaces = {}) {
        if (interfaces.alphaGo) this.learningInterfaces.alphaGo = interfaces.alphaGo;
        if (interfaces.a2c) this.learningInterfaces.a2c = interfaces.a2c;
        if (interfaces.mdp) this.learningInterfaces.mdp = interfaces.mdp;
        if (interfaces.transformer) this.learningInterfaces.transformer = interfaces.transformer;
        
        console.log(`🔌 Registered ${Object.values(interfaces).filter(Boolean).length} learning interfaces`);
    }
    
    /**
     * Build decision awareness for an agent before taking action
     */
    buildDecisionAwareness(agentId, opportunity, context = {}) {
        if (!agentId) throw new Error('Agent ID is required');
        if (!opportunity) throw new Error('Opportunity is required');
        
        const awareness = {
            agentId,
            opportunityId: opportunity.id || null,
            expectedRewards: this._calculateExpectedRewards(agentId, opportunity, context),
            expectedPenalties: this._calculateExpectedPenalties(agentId, opportunity, context),
            longTermProjections: this._buildLongTermProjections(agentId, opportunity, context),
            environment: this._analyzeEnvironment(opportunity, context),
            bidding: this._calculateBiddingStrategy(opportunity, context),
            guidance: this._generateGuidance(opportunity, context),
            timestamp: Date.now()
        };
        
        // Store awareness for the agent
        this.agentAwareness.set(agentId, awareness);
        
        // Persist to database if available
        this._persistAwareness(agentId, awareness);
        
        return awareness;
    }
    
    /**
     * 💡 NEW: Issues a reward for strategically avoiding a high-risk, low-reward opportunity.
     * This teaches agents to be prudent risk managers, not just naive profit chasers.
     * @param {string} agentId - The ID of the agent being rewarded.
     * @param {object} opportunity - The opportunity that was avoided.
     * @param {object} awareness - The decision awareness context that led to the abort.
     * @returns {Promise<object>} The issued reward event.
     */
    async issuePrudenceReward(agentId, opportunity, awareness) {
        // Prudence is only rewarded if the risk was genuinely high.
        const riskFactor = awareness.potentialPenalty / awareness.expectedReward;
        if (riskFactor < 1.5) { // e.g., penalty must be >150% of reward
            return null; // Not a sufficiently risky situation to reward prudence.
        }

        // The reward is a small fraction of the *avoided penalty*.
        const rewardAmount = (awareness.potentialPenalty * 0.1).toFixed(4); // 10% of the avoided loss
        
        const reward = {
            agentId,
            type: 'PRUDENCE_REWARD',
            amount: rewardAmount,
            reason: `Strategically aborted a high-risk opportunity. Avoided potential penalty of ${aware.potentialPenalty.toFixed(2)} USD.`,
            opportunityId: opportunity.id,
            timestamp: Date.now(),
            proof: {
                type: 'decision_context',
                awareness,
            }
        };

        await this.applyReward(agentId, reward);
        return reward;
    }

    /**
     * Issues a reward for discovering a formally verifiable strategy.
     * This is the highest reward an agent can receive, promoting deep learning.
     * @param {string} agentId - The ID of the agent who executed the trade.
     * @param {object} proof - The proof artifact from the FormalProofService.
     * @param {string} theorem - The formalized theorem that was proven.
     * @returns {Promise<object>} The issued reward event.
     */
    async issueProvableStrategyReward(agentId, proof, theorem) {
        const amount = this.rewardTypes.PROVABLE_STRATEGY_DISCOVERY.base;

        const reward = {
            agentId,
            type: 'PROVABLE_STRATEGY_DISCOVERY',
            amount: amount.toFixed(4),
            reason: `Discovered and contributed to the formal proof of a new market mechanic: ${theorem}`,
            timestamp: Date.now(),
            proof: {
                type: 'formal_proof',
                verificationMethod: 'formal_verification',
                proofArtifact: proof,
                theorem: theorem,
            }
        };

        await this.applyReward(agentId, reward);
        return reward;
    }

    /**
     * Issues a reward for contributing a high-value piece of intelligence.
     * @param {string} agentId - The ID of the agent being rewarded.
     * @param {object} memory - The high-value memory object.
     * @returns {Promise<object>} The issued reward event.
     */
    async issueIntelligenceReward(agentId, memory) {
        // The reward amount scales with the memory's final credibility score.
        const amount = this.rewardTypes.INTELLIGENCE_CONTRIBUTION.base * memory.credibility_score;
        
        const reward = {
            agentId,
            type: 'INTELLIGENCE_CONTRIBUTION',
            amount: amount.toFixed(4),
            reason: `Contributed a high-credibility memory (Score: ${memory.credibility_score.toFixed(2)}) from source: ${memory.source}.`,
            memoryId: memory.id,
            timestamp: Date.now(),
            proof: {
                type: 'knowledge_distillation_proof',
                verification: memory.verification,
                credibility: memory.credibility_score
            }
        };

        await this.applyReward(agentId, reward);
        return reward;
    }

    /**
     * Issues a reward for corroborating and strengthening an existing piece of intelligence.
     * @param {string} agentId - The ID of the agent providing corroboration.
     * @param {object} memory - The original memory that was strengthened.
     * @param {string} newSource - The new source that confirmed the information.
     * @returns {Promise<object>} The issued reward event.
     */
    async issueCorroborationReward(agentId, memory, newSource) {
        // The corroboration reward is a fixed base, as the act of verification is the key contribution.
        const amount = this.rewardTypes.CORROBORATION_CONTRIBUTION.base;
        
        const reward = {
            agentId,
            type: 'CORROBORATION_CONTRIBUTION',
            amount: amount.toFixed(4),
            reason: `Strengthened memory [${memory.id}] by adding corroborating source: ${newSource}. New Credibility: ${memory.credibility_score.toFixed(2)}.`,
            memoryId: memory.id,
            timestamp: Date.now(),
            proof: {
                type: 'corroboration_proof',
                original_memory_id: memory.id,
                new_source: newSource,
            }
        };

        await this.applyReward(agentId, reward);
        return reward;
    }

    /**
     * Issues a reward for a successful collaboration that results in a new capability.
     * @param {string} requestingAgentId - The agent who identified the need.
     * @param {string} fulfillingAgentId - The agent who built the solution (e.g., the developer).
     * @param {string} capabilityKey - The new capability that was unlocked.
     * @returns {Promise<void>}
     */
    async issueCollaborationReward(requestingAgentId, fulfillingAgentId, capabilityKey) {
        const baseReward = this.rewardTypes.COLLABORATION_REWARD.base;

        // The requester gets a smaller, "finder's fee" reward.
        const requesterReward = {
            agentId: requestingAgentId,
            type: 'COLLABORATION_REWARD',
            amount: (baseReward * 0.3).toFixed(4), // 30% of the reward
            reason: `Successfully requested the development of new capability: ${capabilityKey}`,
            proof: { type: 'capability_enhancement', capability: capabilityKey, role: 'requester' }
        };
        await this.applyReward(requestingAgentId, requesterReward);

        // The fulfiller gets the larger reward for doing the work.
        const fulfillerReward = {
            agentId: fulfillingAgentId,
            type: 'COLLABORATION_REWARD',
            amount: (baseReward * 0.7).toFixed(4), // 70% of the reward
            reason: `Successfully developed and activated new capability: ${capabilityKey}`,
            proof: { type: 'capability_enhancement', capability: capabilityKey, role: 'fulfiller' }
        };
        await this.applyReward(fulfillingAgentId, fulfillerReward);
    }

    /**
     * <strong>REFACTORED</strong>: To handle various reward types.
     * Applies a reward to an agent, updating their performance metrics.
     * @param {string} agentId - The agent's ID.
     * @param {object} reward - The reward object.
     */
    async applyReward(agentId, reward) {
        if (!agentId) throw new Error('Agent ID is required');
        if (!reward.type) throw new Error('Reward type is required');
        
        // CRITICAL: Validate blockchain proof requirement
        if (!this._validateBlockchainProof(reward.proof)) {
            console.error(`❌ Reward rejected: Missing blockchain proof for agent ${agentId}`);
            return null;
        }
        
        // Calculate final reward with temporal adjustments
        const finalAmount = this._adjustRewardForTemporal(reward.amount, reward.type);
        
        // Store reward in history
        if (!this.rewardHistory.has(agentId)) {
            this.rewardHistory.set(agentId, []);
        }
        
        const rewardToStore = {
            type: reward.type,
            amount: finalAmount,
            context: reward.proof, // Store the proof as context
            timestamp: Date.now(),
            blockchainProof: {
                txHash: reward.proof.txHash,
                blockNumber: reward.proof.blockNumber,
                addressHash: reward.proof.addressHash,
                valueImprovement: reward.proof.valueImprovement,
                verificationMethod: reward.proof.verificationMethod || 'txHash',
                verified: true
            }
        };
        
        this.rewardHistory.get(agentId).push(rewardToStore);
        
        // Apply to learning systems
        this._propagateRewardToLearningSystems(agentId, rewardToStore);
        
        // Persist to database
        this._persistReward(agentId, rewardToStore);
        
        // Emit event for subscribers
        this.emit('reward', { 
            agentId, 
            reward: rewardToStore, 
            blockchainProof: rewardToStore.blockchainProof 
        });
        
        if (this.config.debug) {
            console.log(`✅ REWARD issued to ${agentId}: ${rewardToStore.amount} for ${rewardToStore.type}. Reason: ${reward.reason}`);
        }
        
        return finalAmount;
    }
    
    /**
     * Validate blockchain proof for rewards
     * 
     * This is a critical security function that validates all proof requirements
     * before any rewards can be issued. It has multiple validation pathways:
     * 
     * 1. Transaction-based proof: Valid txHash + blockNumber
     * 2. Value improvement proof: Valid addressHash + positive valueImprovement
     * 3. Learning improvement proof: For training-based rewards that don't have direct transactions
     * 4. Collaboration proof: For capability enhancement rewards
     */
    _validateBlockchainProof(context) {
        if (!context) {
            console.error('❌ Proof validation failed: No context provided');
            return false;
        }
        
        // Get the verification method - defaults to 'txHash'
        const verificationMethod = context.verificationMethod || 'txHash';
        
        // 1. Transaction-based verification (standard execution rewards)
        if (verificationMethod === 'txHash') {
            const hasTxHash = Boolean(context.txHash);
            const hasBlockNumber = Boolean(context.blockNumber);
            
            if (!hasTxHash || !hasBlockNumber) {
                console.error(`❌ Transaction-based proof validation failed: Missing txHash or blockNumber`);
                return false;
            }
            
            // Validate transaction hash format
            if (typeof context.txHash === 'string') {
                const validTxHashFormat = /^0x[a-fA-F0-9]{64}$/.test(context.txHash);
                if (!validTxHashFormat) {
                    console.warn(`⚠️ Invalid transaction hash format: ${context.txHash}`);
                    return false;
                }
            } else {
                console.error(`❌ Transaction hash must be a string`);
                return false;
            }
            
            // Validate block number
            if (typeof context.blockNumber !== 'number' && typeof context.blockNumber !== 'string') {
                console.error(`❌ Block number must be a number or string`);
                return false;
            }
            
            return true;
        }
        
        // 2. Value improvement verification (portfolio performance)
        else if (verificationMethod === 'value_improvement') {
            const hasAddressHash = Boolean(context.addressHash);
            const hasValueImprovement = Boolean(context.valueImprovement !== undefined);
            const isPositiveValue = typeof context.valueImprovement === 'number' && context.valueImprovement > 0;
            
            if (!hasAddressHash || !hasValueImprovement) {
                console.error(`❌ Value improvement proof validation failed: Missing addressHash or valueImprovement`);
                return false;
            }
            
            if (!isPositiveValue) {
                console.error(`❌ Value improvement must be positive: ${context.valueImprovement}`);
                return false;
            }
            
            // Validate address format
            if (typeof context.addressHash === 'string') {
                const validAddressFormat = /^0x[a-fA-F0-9]{40}$/.test(context.addressHash);
                if (!validAddressFormat) {
                    console.warn(`⚠️ Invalid address format: ${context.addressHash}`);
                    return false;
                }
            } else {
                console.error(`❌ Address hash must be a string`);
                return false;
            }
            
            return true;
        }
        
        // 3. Learning improvement verification (training rewards)
        else if (verificationMethod === 'learning_improvement') {
            // For sparring sessions and evolution, we need a transaction reference
            // but we're more flexible on value requirements
            const hasTxReference = Boolean(context.txHash);
            const hasValueMetric = Boolean(context.valueImprovement !== undefined);
            
            if (!hasTxReference || !hasValueMetric) {
                console.error(`❌ Learning improvement proof validation failed: Missing txHash or valueImprovement`);
                return false;
            }
            
            // Learning improvements must include training metadata
            if (!context.blockNumber) {
                console.warn(`⚠️ Learning improvement should include blockNumber reference`);
            }
            
            return true;
        }
        
        // 4. Collaboration verification (capability enhancements)
        else if (verificationMethod === 'capability_enhancement') {
            // Capability enhancements require capability key and type
            if (!context.capability || !context.role) {
                console.error(`❌ Capability enhancement proof validation failed: Missing capability details`);
                return false;
            }
            
            return true;
        }
        
        // 5. Intelligence contribution (verified memories)
        else if (verificationMethod === 'knowledge_distillation_proof') {
            if (!context.verification || !context.credibility) {
                console.error(`❌ Intelligence contribution proof validation failed: Missing verification details`);
                return false;
            }
            
            // Credibility must be positive and reasonable
            if (typeof context.credibility !== 'number' || context.credibility <= 0 || context.credibility > 1) {
                console.error(`❌ Credibility score must be between 0-1: ${context.credibility}`);
                return false;
            }
            
            return true;
        }
        
        // 6. Formal proof verification
        else if (verificationMethod === 'formal_verification') {
            if (!context.proofArtifact || !context.theorem) {
                console.error(`❌ Formal proof validation failed: Missing proof artifact or theorem.`);
                return false;
            }
            return true;
        }
        
        // Reject unknown verification methods
        console.error(`❌ Unknown verification method: ${verificationMethod}`);
        return false;
    }
    
    /**
     * Apply penalty to agent for negative outcomes
     */
    applyPenalty(agentId, penaltyType, amount, context = {}) {
        if (!agentId) throw new Error('Agent ID is required');
        if (!penaltyType) throw new Error('Penalty type is required');
        
        // Ensure penalties are negative
        const finalAmount = -Math.abs(amount);
        
        // Store penalty in history
        if (!this.penaltyHistory.has(agentId)) {
            this.penaltyHistory.set(agentId, []);
        }
        
        const penalty = {
            type: penaltyType,
            amount: finalAmount,
            context,
            timestamp: Date.now()
        };
        
        this.penaltyHistory.get(agentId).push(penalty);
        
        // Apply to learning systems
        this._propagatePenaltyToLearningSystems(agentId, penalty);
        
        // Persist to database
        this._persistPenalty(agentId, penalty);
        
        // Emit event for subscribers
        this.emit('penalty', { agentId, penalty });
        
        return finalAmount;
    }
    
    /**
     * Get agent's cumulative reward
     */
    getAgentCumulativeReward(agentId) {
        if (!this.rewardHistory.has(agentId)) return 0;
        
        return this.rewardHistory.get(agentId)
            .reduce((sum, reward) => sum + reward.amount, 0);
    }
    
    /**
     * Get agent's current penalty factor (for decision-making)
     */
    getAgentPenaltyFactor(agentId) {
        if (!this.penaltyHistory.has(agentId)) return 0;
        
        const recentPenalties = this.penaltyHistory.get(agentId)
            .filter(p => Date.now() - p.timestamp < 3600000); // Last hour
        
        if (recentPenalties.length === 0) return 0;
        
        // Calculate weighted penalty factor (recent penalties matter more)
        let penaltyFactor = 0;
        let weightSum = 0;
        
        recentPenalties.forEach((penalty, index) => {
            const recencyWeight = (recentPenalties.length - index) / recentPenalties.length;
            penaltyFactor += Math.abs(penalty.amount) * recencyWeight;
            weightSum += recencyWeight;
        });
        
        return weightSum > 0 ? penaltyFactor / weightSum : 0;
    }
    
    /**
     * Get agent confidence level based on history
     */
    getAgentConfidence(agentId) {
        const rewardSum = this.getAgentCumulativeReward(agentId);
        const penaltyFactor = this.getAgentPenaltyFactor(agentId);
        
        // Base confidence starts at 0.5
        let confidence = 0.5;
        
        // Add reward component (up to 0.4 more)
        confidence += Math.min(0.4, rewardSum / 1000);
        
        // Subtract penalty factor (up to 0.3 less)
        confidence -= Math.min(0.3, penaltyFactor / 100);
        
        // Ensure confidence is between 0.1 and 0.95
        return Math.max(0.1, Math.min(0.95, confidence));
    }
    
    /**
     * Get agent's last awareness object
     */
    getLastAwareness(agentId) {
        return this.agentAwareness.get(agentId);
    }
    
    /**
     * Get agent reward and penalty history
     */
    getAgentHistory(agentId) {
        return {
            rewards: this.rewardHistory.get(agentId) || [],
            penalties: this.penaltyHistory.get(agentId) || []
        };
    }
    
    /**
     * Clear agent history (useful for testing)
     */
    clearAgentHistory(agentId) {
        this.rewardHistory.delete(agentId);
        this.penaltyHistory.delete(agentId);
        this.agentAwareness.delete(agentId);
    }
    
    /**
     * Generate a reward/penalty dashboard for the agent
     */
    generateRewardDashboard(agentId) {
        const rewards = this.rewardHistory.get(agentId) || [];
        const penalties = this.penaltyHistory.get(agentId) || [];
        const awareness = this.agentAwareness.get(agentId);
        
        // Group rewards and penalties by type
        const rewardsByType = this._groupByType(rewards);
        const penaltiesByType = this._groupByType(penalties);
        
        return {
            agentId,
            totalReward: rewards.reduce((sum, r) => sum + r.amount, 0),
            totalPenalty: penalties.reduce((sum, p) => sum + p.amount, 0),
            netResult: rewards.reduce((sum, r) => sum + r.amount, 0) + 
                       penalties.reduce((sum, p) => sum + p.amount, 0),
            rewardBreakdown: rewardsByType,
            penaltyBreakdown: penaltiesByType,
            currentAwareness: awareness,
            confidence: this.getAgentConfidence(agentId),
            penaltyFactor: this.getAgentPenaltyFactor(agentId)
        };
    }
    
    /**
     * Calculate expected rewards for an opportunity
     */
    _calculateExpectedRewards(agentId, opportunity, context) {
        const rewardFuncs = this.defaultRewardFunctions;
        
        return {
            profitability: rewardFuncs.profitability(opportunity),
            executionSuccess: rewardFuncs.executionSuccess(),
            competitiveWin: rewardFuncs.competitiveWin(opportunity, context),
            gasEfficiency: rewardFuncs.gasEfficiency(opportunity),
            smartDecision: rewardFuncs.smartDecision(opportunity, context),
            total: this._calculateTotalExpectedReward(opportunity, context)
        };
    }
    
    /**
     * Calculate expected penalties for an opportunity
     */
    _calculateExpectedPenalties(agentId, opportunity, context) {
        const penaltyFuncs = this.defaultPenaltyFunctions;
        
        return {
            executionFailure: penaltyFuncs.executionFailure(opportunity),
            lostToCompetitor: penaltyFuncs.lostToCompetitor(opportunity, context),
            gasWaste: penaltyFuncs.gasWaste(opportunity),
            poorDecision: penaltyFuncs.poorDecision(opportunity, context),
            total: this._calculateTotalExpectedPenalty(opportunity, context)
        };
    }
    
    /**
     * Build long-term projections for decision making
     */
    _buildLongTermProjections(agentId, opportunity, context) {
        return {
            expectedReturnRate: this._calculateExpectedReturnRate(opportunity),
            confidenceInterval: this._calculateConfidenceInterval(opportunity),
            opportunityCost: this._calculateOpportunityCost(opportunity, context),
            learningValue: this._calculateLearningValue(agentId, opportunity)
        };
    }
    
    /**
     * Analyze current environment (market conditions)
     */
    _analyzeEnvironment(opportunity, context) {
        return {
            marketVolatility: context.marketVolatility || 'moderate',
            gasPrice: context.gasPrice || 'unknown',
            competitionLevel: this._estimateCompetitionLevel(opportunity, context),
            networkCongestion: context.networkCongestion || 'moderate'
        };
    }
    
    /**
     * Calculate bidding strategy for opportunity
     */
    _calculateBiddingStrategy(opportunity, context) {
        const expectedProfit = opportunity.estimatedProfitUSD || 0;
        
        return {
            maxTipPctOfProfit: this._calculateMaxTipPercentage(expectedProfit, context),
            reserveProfitUSD: this._calculateReserveProfit(expectedProfit),
            confidence: this._calculateBiddingConfidence(opportunity, context),
            penaltyFactor: context.penaltyFactor || 0,
            effectiveTipPct: this._calculateEffectiveTipPercentage(expectedProfit, context)
        };
    }
    
    /**
     * Generate guidance string for agent
     */
    _generateGuidance(opportunity, context) {
        const profitUSD = opportunity.estimatedProfitUSD || 0;
        const competitionLevel = this._estimateCompetitionLevel(opportunity, context);
        
        if (profitUSD > 10000) {
            if (competitionLevel === 'high') {
                return "High-value opportunity with strong competition - use aggressive bidding strategy";
            } else {
                return "High-value opportunity with moderate competition - prioritize execution speed";
            }
        } else if (profitUSD > 5000) {
            if (competitionLevel === 'high') {
                return "Medium-value opportunity with strong competition - balance gas costs with bid price";
            } else {
                return "Medium-value opportunity - standard execution approach recommended";
            }
        } else {
            return "Lower-value opportunity - only execute if gas costs are favorable";
        }
    }
    
    /**
     * Create default reward functions
     */
    _createDefaultRewardFunctions() {
        return {
            profitability: (opportunity) => {
                const profit = opportunity.estimatedProfitUSD || 0;
                
                if (profit >= 50000) return 40; // $50k+ trades
                if (profit >= 20000) return 25; // $20k-50k trades
                if (profit >= 10000) return 15; // $10k-20k trades
                if (profit >= 5000) return 8;   // $5k-10k trades
                if (profit >= 1000) return 4;   // $1k-5k trades
                return 2;                       // <$1k trades
            },
            
            executionSuccess: () => {
                return 20; // Base reward for successful execution
            },
            
            competitiveWin: (opportunity, context) => {
                const competitors = (opportunity.competitionAnalysis?.expectedCompetitors || 1);
                
                if (competitors >= 10) return 25; // Highly competitive
                if (competitors >= 5) return 20;  // Moderately competitive
                if (competitors >= 2) return 15;  // Low competition
                return 10;                        // No competition
            },
            
            gasEfficiency: (opportunity) => {
                const gasUsage = opportunity.gasEstimate || 300000;
                
                if (gasUsage <= 150000) return 15;   // Ultra efficient
                if (gasUsage <= 200000) return 12;   // Very efficient
                if (gasUsage <= 250000) return 10;   // Efficient
                if (gasUsage <= 300000) return 7;    // Average
                if (gasUsage <= 350000) return 5;    // Below average
                if (gasUsage <= 400000) return 3;    // Inefficient
                return 1;                            // Very inefficient
            },
            
            smartDecision: (opportunity, context) => {
                const expectedProfit = opportunity.estimatedProfitUSD || 0;
                const gasCost = (opportunity.gasCostUSD || 50);
                const profitRatio = expectedProfit / gasCost;
                
                if (profitRatio >= 100) return 15;  // Excellent ratio
                if (profitRatio >= 50) return 12;   // Great ratio
                if (profitRatio >= 20) return 10;   // Good ratio
                if (profitRatio >= 10) return 7;    // Decent ratio
                if (profitRatio >= 5) return 5;     // Acceptable ratio
                return 3;                           // Poor ratio
            }
        };
    }
    
    /**
     * Create default penalty functions
     */
    _createDefaultPenaltyFunctions() {
        return {
            executionFailure: (opportunity) => {
                const profit = opportunity.estimatedProfitUSD || 0;
                
                if (profit >= 50000) return -40; // High-value failure
                if (profit >= 20000) return -30; // Major failure
                if (profit >= 10000) return -20; // Significant failure
                if (profit >= 5000) return -15;  // Moderate failure
                if (profit >= 1000) return -10;  // Minor failure
                return -5;                       // Minimal failure
            },
            
            lostToCompetitor: (opportunity, context) => {
                const profit = opportunity.estimatedProfitUSD || 0;
                
                if (profit >= 50000) return -30; // High-value loss
                if (profit >= 20000) return -25; // Major loss
                if (profit >= 10000) return -15; // Significant loss
                if (profit >= 5000) return -10;  // Moderate loss
                if (profit >= 1000) return -5;   // Minor loss
                return -2;                       // Minimal loss
            },
            
            gasWaste: (opportunity) => {
                const gasUsage = opportunity.gasEstimate || 300000;
                
                if (gasUsage >= 500000) return -20;  // Extreme waste
                if (gasUsage >= 400000) return -15;  // High waste
                if (gasUsage >= 350000) return -10;  // Significant waste
                if (gasUsage >= 300000) return -5;   // Moderate waste
                if (gasUsage >= 250000) return -3;   // Minor waste
                return -1;                           // Minimal waste
            },
            
            poorDecision: (opportunity, context) => {
                const expectedProfit = opportunity.estimatedProfitUSD || 0;
                const gasCost = (opportunity.gasCostUSD || 50);
                const profitRatio = expectedProfit / gasCost;
                
                if (profitRatio <= 2) return -15;  // Terrible ratio
                if (profitRatio <= 4) return -10;  // Poor ratio
                if (profitRatio <= 6) return -5;   // Questionable ratio
                if (profitRatio <= 8) return -3;   // Borderline ratio
                return -1;                         // Acceptable ratio
            }
        };
    }
    
    /**
     * Calculate total expected reward for opportunity
     */
    _calculateTotalExpectedReward(opportunity, context) {
        const rewardFuncs = this.defaultRewardFunctions;
        const weights = this.config.rewardWeights;
        
        return (
            rewardFuncs.profitability(opportunity) * weights.profitability +
            rewardFuncs.executionSuccess() * weights.executionSuccess +
            rewardFuncs.competitiveWin(opportunity, context) * weights.competitiveWin +
            rewardFuncs.gasEfficiency(opportunity) * weights.gasEfficiency +
            rewardFuncs.smartDecision(opportunity, context) * weights.smartDecisions
        );
    }
    
    /**
     * Calculate total expected penalty for opportunity
     */
    _calculateTotalExpectedPenalty(opportunity, context) {
        const penaltyFuncs = this.defaultPenaltyFunctions;
        const weights = this.config.penaltyWeights;
        
        return (
            penaltyFuncs.executionFailure(opportunity) * weights.executionFailure +
            penaltyFuncs.lostToCompetitor(opportunity, context) * weights.lostToCompetitor +
            penaltyFuncs.gasWaste(opportunity) * weights.gasWaste +
            penaltyFuncs.poorDecision(opportunity, context) * weights.poorDecision
        );
    }
    
    /**
     * Estimate competition level for opportunity
     */
    _estimateCompetitionLevel(opportunity, context) {
        const competitors = opportunity.competitionAnalysis?.expectedCompetitors || 0;
        
        if (competitors >= 10) return 'extreme';
        if (competitors >= 7) return 'high';
        if (competitors >= 4) return 'moderate';
        if (competitors >= 2) return 'low';
        return 'minimal';
    }
    
    /**
     * Calculate maximum tip percentage based on profit
     */
    _calculateMaxTipPercentage(profit, context) {
        // Higher profits can afford higher tips
        if (profit >= 50000) return 0.20; // Up to 20% for high-value trades
        if (profit >= 20000) return 0.15; // Up to 15% for major trades
        if (profit >= 10000) return 0.12; // Up to 12% for significant trades
        if (profit >= 5000) return 0.10;  // Up to 10% for moderate trades
        if (profit >= 1000) return 0.08;  // Up to 8% for minor trades
        return 0.05;                      // Up to 5% for minimal trades
    }
    
    /**
     * Calculate reserve profit (minimum acceptable)
     */
    _calculateReserveProfit(profit) {
        // Always keep some minimum profit
        if (profit >= 50000) return 10000;    // $10k reserve for high-value
        if (profit >= 20000) return 5000;     // $5k reserve for major
        if (profit >= 10000) return 2000;     // $2k reserve for significant
        if (profit >= 5000) return 1000;      // $1k reserve for moderate
        if (profit >= 1000) return 500;       // $500 reserve for minor
        return Math.max(100, profit * 0.20);  // 20% reserve for minimal
    }
    
    /**
     * Calculate bidding confidence
     */
    _calculateBiddingConfidence(opportunity, context) {
        // Base confidence on opportunity clarity and agent history
        let confidence = 0.7; // Base confidence
        
        // Adjust based on opportunity quality
        if (opportunity.confidence) {
            confidence = opportunity.confidence;
        }
        
        // Adjust based on penalty factor if available
        if (context.penaltyFactor) {
            // More penalties = less confidence
            confidence -= Math.min(0.3, context.penaltyFactor / 100);
        }
        
        return Math.max(0.4, Math.min(0.95, confidence));
    }
    
    /**
     * Calculate effective tip percentage
     */
    _calculateEffectiveTipPercentage(profit, context) {
        const maxTip = this._calculateMaxTipPercentage(profit, context);
        const confidence = this._calculateBiddingConfidence(opportunity, context);
        const penaltyFactor = context.penaltyFactor || 0;
        
        // Less confidence and more penalties mean lower effective tip
        return maxTip * confidence * (1 - Math.min(0.5, penaltyFactor / 100));
    }
    
    /**
     * Calculate expected return rate for long-term projections
     */
    _calculateExpectedReturnRate(opportunity) {
        const profit = opportunity.estimatedProfitUSD || 0;
        const executionTime = (opportunity.expectedExecutionTimeMs || 500) / 1000; // Convert to seconds
        
        // Return rate per hour
        return (profit / executionTime) * 3600;
    }
    
    /**
     * Calculate confidence interval for opportunity
     */
    _calculateConfidenceInterval(opportunity) {
        const baseConfidence = opportunity.confidence || 0.7;
        const margin = 0.2 * (1 - baseConfidence); // Less confident = wider margin
        
        return {
            low: Math.max(0, opportunity.estimatedProfitUSD * (1 - margin)),
            high: opportunity.estimatedProfitUSD * (1 + margin)
        };
    }
    
    /**
     * Calculate opportunity cost
     */
    _calculateOpportunityCost(opportunity, context) {
        // Estimate what we give up by taking this opportunity - using precise time measurements
        const executionTimeMs = opportunity.expectedExecutionTimeMs || 500; // In milliseconds
        const executionTimeNs = opportunity.expectedExecutionTimeNs; // In nanoseconds if available
        
        // Convert to nanoseconds for highest precision
        const executionTimeInNs = executionTimeNs || (executionTimeMs * 1000000);
        
        // Use nanosecond-level profit metrics when available
        const avgProfitPerNs = context.averageProfitPerNs || 
                              (context.averageProfitPerMs ? context.averageProfitPerMs / 1000000 : 
                              (context.averageProfitPerSecond || 10) / 1000000000);
        
        return executionTimeInNs * avgProfitPerNs;
    }
    
    /**
     * Calculate learning value
     */
    _calculateLearningValue(agentId, opportunity) {
        // How much this opportunity teaches the agent
        const noveltyFactor = this._calculateNoveltyFactor(agentId, opportunity);
        
        return noveltyFactor * 5; // Base learning value of 0-5 points
    }
    
    /**
     * Calculate novelty factor for an opportunity
     */
    _calculateNoveltyFactor(agentId, opportunity) {
        // If no history, everything is novel
        if (!this.rewardHistory.has(agentId)) {
            return 1.0;
        }
        
        const history = this.rewardHistory.get(agentId);
        const tokenPair = opportunity.tokenPair || '';
        
        // Count similar opportunities in history
        const similarOpps = history.filter(h => 
            h.context && h.context.opportunity && 
            h.context.opportunity.tokenPair === tokenPair
        ).length;
        
        // More similar opportunities = less novelty
        return Math.max(0.1, 1.0 - (similarOpps * 0.05));
    }
    
    /**
     * Adjust reward based on temporal balance
     */
    _adjustRewardForTemporal(amount, rewardType) {
        const temporal = this.config.temporalBalance;
        
        // Apply temporal multipliers based on reward type
        if (rewardType === 'profitability' || rewardType === 'executionSuccess') {
            return amount * temporal.immediateRewardMultiplier;
        } else if (rewardType === 'competitiveWin' || rewardType === 'gasEfficiency') {
            return amount * temporal.mediumTermRewardMultiplier;
        } else {
            return amount * temporal.longTermRewardMultiplier;
        }
    }
    
    /**
     * Propagate reward to all learning systems
     */
    _propagateRewardToLearningSystems(agentId, reward) {
        // Apply to AlphaGo if available
        if (this.config.learningIntegration.alphaGoEnabled && 
            this.learningInterfaces.alphaGo) {
            try {
                this.learningInterfaces.alphaGo.applyReward(agentId, reward.amount, reward.context);
                if (this.config.debug) {
                    console.log(`✅ Applied reward to AlphaGo for ${agentId}: ${reward.amount}`);
                }
            } catch (error) {
                console.error('Failed to apply reward to AlphaGo:', error);
            }
        }
        
        // Apply to A2C if available
        if (this.config.learningIntegration.a2cEnabled && 
            this.learningInterfaces.a2c) {
            try {
                this.learningInterfaces.a2c.applyReward(agentId, reward.amount, reward.context);
                if (this.config.debug) {
                    console.log(`✅ Applied reward to A2C for ${agentId}: ${reward.amount}`);
                }
            } catch (error) {
                console.error('Failed to apply reward to A2C:', error);
            }
        }
        
        // Apply to MDP if available
        if (this.config.learningIntegration.mdpEnabled && 
            this.learningInterfaces.mdp) {
            try {
                this.learningInterfaces.mdp.updateMDPReward(agentId, reward.amount, reward.context);
                if (this.config.debug) {
                    console.log(`✅ Applied reward to MDP for ${agentId}: ${reward.amount}`);
                }
            } catch (error) {
                console.error('Failed to apply reward to MDP:', error);
            }
        }
        
        // Apply to Transformer if available
        if (this.config.learningIntegration.transformerEnabled && 
            this.learningInterfaces.transformer) {
            try {
                this.learningInterfaces.transformer.updateRewardSignal(agentId, reward.amount, reward.context);
                if (this.config.debug) {
                    console.log(`✅ Applied reward to Transformer for ${agentId}: ${reward.amount}`);
                }
            } catch (error) {
                console.error('Failed to apply reward to Transformer:', error);
            }
        }
    }

    /**
     * 🧠 INITIALIZE FORMAL REASONING INTEGRATION
     */
    async _initializeFormalReasoningIntegration() {
        console.log('🧠 Initializing Formal Reasoning Integration for Reward/Penalty Engine...');
        
        try {
            this.formalReasoningIntegration = new FormalReasoningCognitiveIntegration({
                agentId: `reward-penalty-${this.config.agentId || 'default'}`,
                enablePersistence: true,
                rewardSystemIntegration: true
            });
            
            await this.formalReasoningIntegration.initialize();
            
            // Register Reward/Penalty Engine with formal reasoning
            await this.formalReasoningIntegration.registerLearningSystemForFormalVerification('reward_penalty_engine', {
                systemType: 'reward_penalty_system',
                capabilities: ['reward_calculation', 'penalty_assessment', 'learning_feedback'],
                requiresVerification: ['reward_functions', 'penalty_thresholds', 'learning_loops']
            });
            
            console.log('✅ Formal reasoning integration initialized for Reward/Penalty Engine');
            
        } catch (error) {
            console.error('❌ Failed to initialize formal reasoning integration:', error);
        }
    }

    /**
     * 🛡️ INITIALIZE PROACTIVE PREVENTION INTEGRATION
     */
    async _initializeProactivePreventionIntegration() {
        console.log('🛡️ Initializing Proactive Prevention Integration for Reward/Penalty Engine...');
        
        try {
            // Initialize credibility pipeline for reward data validation
            this.proactiveCredibilityPipeline = new ProactiveKnowledgeCredibilityPipeline({
                agentId: `reward-credibility-${this.config.agentId || 'default'}`,
                enablePersistence: true
            });
            
            // ProactiveVeracityJudgeService removed - blockchain only
            this.proactiveVeracityJudge = null;
            
            // Initialize construction-compatible prevention systems only
            await this.proactiveCredibilityPipeline.initialize();
            
            console.log('✅ Proactive prevention integration initialized for Reward/Penalty Engine');
            console.log('🛡️ Rewards now validated for truth and credibility before distribution');
            
        } catch (error) {
            console.error('❌ Failed to initialize proactive prevention integration:', error);
        }
    }

    /**
     * 💰 ENHANCED REWARD CALCULATION WITH PROACTIVE PREVENTION
     * Wraps reward calculation with credibility validation and truth-over-profit evaluation
     */
    async calculateRewardWithProactivePrevention(agent, action, result, context = {}) {
        console.log('💰 CALCULATING REWARD WITH PROACTIVE PREVENTION...');
        
        try {
            // STEP 1: Validate result data credibility
            if (this.proactiveCredibilityPipeline) {
                const credibilityResult = await this.proactiveCredibilityPipeline.validateKnowledgeCredibility(
                    JSON.stringify(result),
                    context.dataSource || 'reward_calculation',
                    { sourceType: 'performance_data', requiresOnChainGrounding: context.requireGrounding }
                );
                
                if (!credibilityResult.credible) {
                    console.log('🛡️ Reward data rejected by credibility pipeline - preventing false rewards');
                    return {
                        reward: 0,
                        penalty: 0,
                        netReward: 0,
                        reason: 'data_credibility_rejected',
                        preventedHallucinatedReward: true
                    };
                }
                
                result = credibilityResult.validatedData || result;
            }
            
            // STEP 2: Calculate base reward (existing logic)
            const baseRewardResult = await this.calculateReward(agent, action, result);
            
            // STEP 3: Apply truth-over-profit evaluation
            if (this.proactiveVeracityJudge) {
                const veracityEvaluation = await this.proactiveVeracityJudge.evaluateAgentVeracity(
                    agent.id || 'reward-agent',
                    {
                        profitProjection: baseRewardResult.reward,
                        groundingEvidence: result.credibilityScore || 7.0,
                        uncertaintyAcknowledgment: result.uncertaintyBounds ? 8.0 : 3.0
                    },
                    { prioritizeTruthOverProfit: true }
                );
                
                // Apply truth-focused reward adjustment
                const truthAdjustedReward = baseRewardResult.reward * (veracityEvaluation.finalScore / 10.0);
                
                console.log(`⚖️ Truth-over-profit adjustment: ${baseRewardResult.reward} → ${truthAdjustedReward.toFixed(2)}`);
                
                return {
                    ...baseRewardResult,
                    truthAdjustedReward: truthAdjustedReward,
                    veracityScore: veracityEvaluation.finalScore,
                    truthPrioritized: veracityEvaluation.truthPrioritized,
                    proactivePreventionApplied: true
                };
            }
            
            return baseRewardResult;
            
        } catch (error) {
            console.error('❌ Enhanced reward calculation error:', error);
            // Fallback to basic reward calculation
            return await this.calculateReward(agent, action, result);
        }
    }
}