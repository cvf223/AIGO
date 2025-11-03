import { LegendaryMemoryPromotionSystem } from './LegendaryMemoryPromotionSystem.js';

/**
 * 🔗 MEMORY PROMOTION INTEGRATION LAYER
 * ====================================
 * 
 * Connects memory promotion to:
 * - MDP (Markov Decision Process) reward calculation
 * - A2C (Actor-Critic) policy updates
 * - DDP (Distributed Data Parallel) learning
 * - Agent decision making and task selection
 */
export class MemoryPromotionIntegration {
    constructor(agents, learningModules, blockchainConnector) {
        this.agents = agents;
        this.learning = learningModules;
        this.blockchain = blockchainConnector;
        
        // Initialize promotion system
        this.promotionSystem = new LegendaryMemoryPromotionSystem(
            this.learning.redisClient,
            blockchainConnector,
            this.learning.rewardSystem
        );
        
        this.setupIntegrationEvents();
        this.taskRewardMultipliers = new Map();
        this.economicTracker = new Map(); // memoryId → profit tracking
    }

    /**
     * 🎯 SETUP INTEGRATION EVENT HANDLERS
     * Connects promotion events to learning systems
     */
    setupIntegrationEvents() {
        // Task Started → Update MDP State
        this.promotionSystem.on('taskStarted', (data) => {
            this.updateMDPForTaskStart(data);
        });

        // Conclusion Saved → A2C Immediate Reward
        this.promotionSystem.on('conclusionSaved', (data) => {
            this.distributeA2CReward(data);
        });

        // Claim Validated → Source Validation Bonus
        this.promotionSystem.on('claimValidated', (data) => {
            this.applySourceValidationBonus(data);
        });

        // Blockchain Proof → On-Chain Verification Bonus
        this.promotionSystem.on('blockchainProofVerified', (data) => {
            this.applyBlockchainProofBonus(data);
        });

        // Memory Promoted → Major Reward Update
        this.promotionSystem.on('memoryPromoted', (data) => {
            this.handleMemoryPromotion(data);
        });

        // Agent conclusion requests
        this.promotionSystem.on('requestConclusion', (request, callback) => {
            this.requestAgentConclusion(request, callback);
        });
    }

    /**
     * 🎯 START TASK WITH INTEGRATED TRACKING
     * Agent chooses task → Memory promotion begins
     */
    async startTaskWithMemoryTracking(agentId, taskType, taskDescription, expectedDuration) {
        const taskId = `task_${agentId}_${Date.now()}`;
        
        // Start memory promotion tracking
        await this.promotionSystem.startTaskMemoryTracking(
            agentId, 
            taskId, 
            taskType, 
            taskDescription
        );
        
        // Update agent's MDP state for task selection
        await this.updateAgentMDPState(agentId, {
            currentTask: taskId,
            taskType,
            expectedDuration,
            memoryPotential: this.calculateMemoryPotential(taskType),
            rewardPotential: this.calculateRewardPotential(taskType, expectedDuration)
        });
        
        console.log(`🎯 Started integrated task tracking: ${taskId} (${taskType})`);
        
        return taskId;
    }

    /**
     * 💰 MDP REWARD CALCULATION WITH MEMORY PROMOTION
     * Integrates memory quality into MDP rewards
     */
    updateMDPForTaskStart({ agentId, taskId, taskType, expectedRewardPotential }) {
        const agent = this.agents.get(agentId);
        if (!agent || !this.learning.mdp) return;

        // Calculate enhanced reward potential
        const memoryMultiplier = this.getMemoryRewardMultiplier(taskType);
        const enhancedReward = expectedRewardPotential * memoryMultiplier;
        
        // Update MDP state
        this.learning.mdp.updateState(agentId, {
            taskType,
            memoryPotential: memoryMultiplier,
            baseReward: expectedRewardPotential,
            enhancedReward,
            timestamp: Date.now()
        });
        
        // Store for later calculation
        this.taskRewardMultipliers.set(taskId, memoryMultiplier);
        
        console.log(`📊 MDP updated for ${taskId}: ${enhancedReward.toFixed(2)} potential reward`);
    }

    /**
     * 🧠 A2C IMMEDIATE REWARD DISTRIBUTION
     * Distributes rewards based on conclusion quality
     */
    async distributeA2CReward({ memory, effortLevel, potentialReward }) {
        const agent = this.agents.get(memory.agentId);
        if (!agent || !this.learning.a2c) return;

        // Calculate A2C reward based on effort and confidence
        const effortBonus = effortLevel * 0.5; // Stage 3 = 1.5x
        const confidenceBonus = memory.confidence * 2;
        const totalReward = (potentialReward + effortBonus + confidenceBonus);
        
        // Distribute to A2C learning
        await this.learning.a2c.distributeReward(memory.agentId, {
            baseReward: potentialReward,
            effortBonus,
            confidenceBonus,
            totalReward,
            memoryId: memory.id,
            stage: effortLevel,
            taskId: memory.taskId
        });
        
        console.log(`🧠 A2C reward distributed: ${totalReward.toFixed(2)} for stage ${effortLevel} conclusion`);
    }

    /**
     * 🔍 SOURCE VALIDATION BONUS SYSTEM
     * Rewards multi-source validation
     */
    async applySourceValidationBonus({ agentId, taskId, validation, rewardBonus }) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Progressive bonus for multiple sources
        const sourceCount = validation.sources.length;
        const progressiveBonus = Math.pow(sourceCount, 1.5) * 10; // Exponential growth
        const validationReward = rewardBonus + progressiveBonus;
        
        // Update agent's learning systems
        if (this.learning.a2c) {
            await this.learning.a2c.distributeReward(agentId, {
                validationReward,
                sourceCount,
                validationScore: validation.validationScore,
                type: 'source_validation'
            });
        }
        
        // Update agent's awareness of source quality
        if (agent.awareness) {
            agent.awareness.updateSourceTrust(validation.sources);
        }
        
        console.log(`🔍 Source validation bonus: ${validationReward.toFixed(2)} for ${sourceCount} sources`);
    }

    /**
     * 🔗 BLOCKCHAIN PROOF BONUS SYSTEM
     * Rewards on-chain verification
     */
    async applyBlockchainProofBonus({ agentId, taskId, verification, rewardBonus }) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Calculate proof quality bonus
        const proofCount = verification.proofs.length;
        const profitProofs = verification.proofs.filter(p => p.profitAmount > 0).length;
        const profitBonus = profitProofs * 50; // $50 bonus per profitable proof
        const totalBonus = rewardBonus + profitBonus;
        
        // Distribute blockchain verification reward
        if (this.learning.a2c) {
            await this.learning.a2c.distributeReward(agentId, {
                blockchainBonus: totalBonus,
                proofCount,
                profitProofs,
                proofScore: verification.proofScore,
                type: 'blockchain_verification'
            });
        }
        
        // Track profitable strategies
        for (const proof of verification.proofs) {
            if (proof.profitAmount > 0) {
                this.trackProfitableStrategy(agentId, taskId, proof);
            }
        }
        
        console.log(`🔗 Blockchain proof bonus: ${totalBonus.toFixed(2)} for ${proofCount} proofs`);
    }

    /**
     * ⭐ HANDLE MEMORY PROMOTION EVENTS
     * Major rewards for valuable/legendary promotions
     */
    async handleMemoryPromotion({ level, memory, rewardMultiplier, economicImpact }) {
        const agentId = memory.agentId || memory.sourceMemories?.[0]?.agentId;
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Calculate promotion reward
        const baseReward = 100; // Base promotion reward
        const levelMultiplier = rewardMultiplier;
        const economicBonus = economicImpact ? economicImpact * 5 : 0; // $5 bonus per $1 profit
        const totalReward = baseReward * levelMultiplier + economicBonus;
        
        // Major A2C reward distribution
        if (this.learning.a2c) {
            await this.learning.a2c.distributeReward(agentId, {
                promotionReward: totalReward,
                promotionLevel: level,
                economicImpact,
                memoryId: memory.id,
                type: 'memory_promotion'
            });
        }
        
        // Update MDP for strategic importance
        if (this.learning.mdp) {
            this.learning.mdp.updateState(agentId, {
                memoryPromotions: (agent.memoryPromotions || 0) + 1,
                legendaryMemories: level === 'legendary' ? (agent.legendaryMemories || 0) + 1 : agent.legendaryMemories || 0,
                totalEconomicImpact: (agent.totalEconomicImpact || 0) + (economicImpact || 0)
            });
        }
        
        // DDP: Share promotion insights across agents
        if (this.learning.ddp && level === 'legendary') {
            await this.learning.ddp.sharePromotionInsights(memory, economicImpact);
        }
        
        console.log(`⭐ MEMORY PROMOTION REWARD: ${totalReward.toFixed(2)} for ${level} promotion`);
        
        // Track for 14k/week goal
        if (economicImpact) {
            this.trackEconomicContribution(agentId, memory.id, economicImpact);
        }
    }

    /**
     * 💭 REQUEST AGENT CONCLUSION
     * Gets conclusions from agents at specific stages
     */
    async requestAgentConclusion({ agentId, taskId, stage }, callback) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            callback({ text: 'Agent not found', confidence: 0 });
            return;
        }

        try {
            // Request conclusion based on current task
            const conclusion = await agent.generateTaskConclusion(taskId, stage);
            callback(conclusion);
        } catch (error) {
            console.warn(`⚠️ Failed to get conclusion from ${agentId}:`, error.message);
            callback({ text: 'Failed to generate conclusion', confidence: 0 });
        }
    }

    /**
     * 🎯 CALCULATE MEMORY POTENTIAL
     * Estimates memory value potential for task types
     */
    calculateMemoryPotential(taskType) {
        const potentials = {
            'competitor_analysis': 2.5,      // High research value
            'newsletter_analysis': 2.0,      // Good discovery potential
            'pool_discovery': 3.0,          // High profit potential
            'strategy_validation': 2.8,      // High proof value
            'arbitrage_execution': 1.5,      // Lower memory value
            'social_sentiment': 1.8,         // Medium discovery value
            'youtube_analysis': 2.2,         // Good influencer insights
            'defi_research': 2.6            // High strategy value
        };
        
        return potentials[taskType] || 1.0;
    }

    /**
     * 💰 CALCULATE REWARD POTENTIAL
     * Estimates total reward based on task type and duration
     */
    calculateRewardPotential(taskType, expectedDuration) {
        const basePotential = this.calculateMemoryPotential(taskType);
        const durationBonus = Math.log10(expectedDuration / 60000 + 1); // Log scale for duration
        
        return basePotential * 50 * (1 + durationBonus); // Base 50 points
    }

    /**
     * 🏆 TRACK ECONOMIC CONTRIBUTION
     * Monitors progress toward 14k/week goal
     */
    trackEconomicContribution(agentId, memoryId, dailyProfit) {
        const weeklyContribution = dailyProfit * 7;
        const goalProgress = weeklyContribution / 14000; // 14k/week goal
        
        this.economicTracker.set(memoryId, {
            agentId,
            dailyProfit,
            weeklyContribution,
            goalProgress,
            timestamp: Date.now()
        });
        
        // Check if we should promote to legendary
        if (dailyProfit >= 100) {
            this.promotionSystem.promoteToLegendary(memoryId, dailyProfit);
        }
        
        console.log(`🏆 Economic tracking: $${dailyProfit}/day (${(goalProgress * 100).toFixed(2)}% of goal)`);
    }

    /**
     * 📊 GET INTEGRATION ANALYTICS
     */
    async getIntegrationAnalytics() {
        const promotionAnalytics = await this.promotionSystem.getPromotionAnalytics();
        
        const economicSummary = {
            totalDailyProfit: 0,
            totalWeeklyContribution: 0,
            goalProgress: 0,
            legendaryMemories: 0
        };
        
        for (const [_, data] of this.economicTracker) {
            economicSummary.totalDailyProfit += data.dailyProfit;
            economicSummary.totalWeeklyContribution += data.weeklyContribution;
            if (data.dailyProfit >= 100) economicSummary.legendaryMemories++;
        }
        
        economicSummary.goalProgress = economicSummary.totalWeeklyContribution / 14000;
        
        return {
            ...promotionAnalytics,
            economicSummary,
            activeAgents: this.agents.size,
            taskRewardMultipliers: this.taskRewardMultipliers.size
        };
    }

    // Helper methods
    getMemoryRewardMultiplier(taskType) {
        return this.calculateMemoryPotential(taskType);
    }

    async updateAgentMDPState(agentId, stateUpdate) {
        if (this.learning.mdp) {
            this.learning.mdp.updateState(agentId, stateUpdate);
        }
    }

    trackProfitableStrategy(agentId, taskId, proof) {
        // Track profitable strategies for future reference
        console.log(`💰 Profitable strategy tracked: ${proof.profitAmount} from ${proof.txHash}`);
    }
}

export default MemoryPromotionIntegration; 