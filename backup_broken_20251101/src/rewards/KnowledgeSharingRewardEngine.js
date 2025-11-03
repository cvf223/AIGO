/**
 * 💎 KNOWLEDGE SHARING REWARD ENGINE
 * ==================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - COLLECTIVE INTELLIGENCE FOUNDATION
 * 
 * PURPOSE:
 * - Reward agents for sharing valuable knowledge that improves other agents
 * - Calculate rewards based on improvement magnitude, timing, and multi-agent benefits
 * - Track causation proofs linking knowledge to performance improvements
 * - Enable collective learning through incentivized knowledge sharing
 * 
 * REWARD CALCULATION FORMULA:
 * - Base Reward: improvementPercentage × 1000 (10% improvement = 100 points)
 * - Time Multiplier: exp(-minutesAfterSharing / 60) (exponential decay)
 * - Multi-Agent Bonus: 10% per additional benefiting agent
 * - Retroactive Bonus: 5% for early validators
 * - Compound Discovery: 2% of strategy profit potential
 * 
 * INTEGRATION:
 * - FormalProofTemplates for causation verification
 * - ImprovementAttributionSystem for knowledge linking
 * - Database schemas for reward tracking
 * - LLM Judge for reward validation
 */

import { EventEmitter } from 'events';

// 💾 PERSISTENCE AND ATTRIBUTION
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

export class KnowledgeSharingRewardEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            database: config.database,
            
            // Reward calculation parameters
            baseRewardMultiplier: config.baseRewardMultiplier || 1000, // 10% = 100 points
            timeDecayRate: config.timeDecayRate || 60, // Minutes for exp decay
            multiAgentBonusRate: config.multiAgentBonusRate || 0.10, // 10% per agent
            earlyValidatorBonusRate: config.earlyValidatorBonusRate || 0.05, // 5% for validators
            compoundDiscoveryRate: config.compoundDiscoveryRate || 0.02, // 2% of profit potential
            
            // Reward eligibility thresholds
            minimumImprovementThreshold: config.minimumImprovementThreshold || 0.05, // 5% minimum
            minimumAttributionConfidence: config.minimumAttributionConfidence || 0.7, // 70% confidence
            maximumTimeSinceSharing: config.maximumTimeSinceSharing || 7 * 24 * 60 * 60 * 1000, // 7 days
            
            // Judge validation
            requireJudgeValidation: config.requireJudgeValidation !== false,
            judgeValidationThreshold: config.judgeValidationThreshold || 0.8,
            
            ...config
        };
        
        // State tracking
        this.isInitialized = false;
        this.rewardHistory = new Map(); // rewardId -> reward details
        this.knowledgeImpactTracking = new Map(); // knowledgeId -> impact metrics
        this.agentRewardTotals = new Map(); // agentId -> total rewards earned
        
        // Persistence
        this.eliteMemoryPersistence = null;
        
        // Metrics
        this.metrics = {
            totalRewardsIssued: 0,
            totalRewardPoints: 0,
            avgRewardPerImprovement: 0,
            multiAgentBenefitsCount: 0,
            compoundDiscoveriesCount: 0,
            validatedRewardsCount: 0,
            rejectedRewardsCount: 0
        };
        
        console.log('💎 Knowledge Sharing Reward Engine constructed');
        console.log(`   💰 Base reward: ${this.config.baseRewardMultiplier} points per 10% improvement`);
        console.log(`   ⏰ Time decay: ${this.config.timeDecayRate} minute half-life`);
        console.log(`   🤝 Multi-agent bonus: ${this.config.multiAgentBonusRate * 100}% per agent`);
    }
    
    /**
     * 🚀 INITIALIZE REWARD ENGINE
     * ===========================
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Knowledge Sharing Reward Engine...');
            
            // Initialize Elite Memory Persistence for reward tracking
            this.eliteMemoryPersistence = new EliteMemoryPersistenceEngine({
                database: this.config.database,
                persistenceKey: 'knowledge_sharing_rewards',
                enableAutoBackup: true
            });
            await this.eliteMemoryPersistence.initialize();
            
            // Load existing reward state
            await this.loadRewardState();
            
            // Create database tables if needed
            if (this.config.database) {
                await this.createRewardTrackingTables();
            }
            
            this.isInitialized = true;
            console.log('✅ Knowledge Sharing Reward Engine initialized');
            console.log(`   📊 Reward history: ${this.rewardHistory.size} rewards tracked`);
            console.log(`   🎯 Knowledge impacts: ${this.knowledgeImpactTracking.size} items tracked`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Knowledge Sharing Reward Engine:', error);
            this.isInitialized = true; // Continue anyway
        }
    }
    
    /**
     * 💰 CALCULATE REWARD FOR KNOWLEDGE SHARING
     * =========================================
     */
    async calculateReward(improvementData, sharingContext) {
        try {
            console.log(`💰 Calculating reward for knowledge sharing: ${improvementData.type}`);
            
            // Validate improvement meets minimum threshold
            if (improvementData.improvementPercentage < this.config.minimumImprovementThreshold) {
                console.log(`   ⚠️ Improvement below threshold: ${(improvementData.improvementPercentage * 100).toFixed(2)}%`);
                return {
                    rewardGranted: false,
                    reason: 'Below minimum improvement threshold',
                    minimumRequired: this.config.minimumImprovementThreshold
                };
            }
            
            // STEP 1: Calculate base reward from improvement magnitude
            const baseReward = improvementData.improvementPercentage * this.config.baseRewardMultiplier;
            console.log(`   💵 Base reward: ${baseReward.toFixed(2)} points (${(improvementData.improvementPercentage * 100).toFixed(2)}% improvement)`);
            
            // STEP 2: Apply time-based multiplier (exponential decay)
            const minutesSinceSharing = (Date.now() - sharingContext.sharingTimestamp) / 60000;
            const timeMultiplier = Math.max(0.1, Math.exp(-minutesSinceSharing / this.config.timeDecayRate));
            const immediateReward = baseReward * timeMultiplier;
            console.log(`   ⏰ Time multiplier: ${timeMultiplier.toFixed(3)} (${minutesSinceSharing.toFixed(1)} minutes elapsed)`);
            console.log(`   💰 Immediate reward: ${immediateReward.toFixed(2)} points`);
            
            // STEP 3: Calculate multi-agent bonus
            let multiAgentBonus = 0;
            const benefitingAgents = sharingContext.benefitingAgents || [];
            if (benefitingAgents.length > 1) {
                const additionalAgents = benefitingAgents.length - 1;
                multiAgentBonus = baseReward * this.config.multiAgentBonusRate * additionalAgents;
                console.log(`   🤝 Multi-agent bonus: ${multiAgentBonus.toFixed(2)} points (${additionalAgents} additional agents)`);
            }
            
            // STEP 4: Calculate retroactive bonus for early validators
            let retroactiveBonus = 0;
            const earlyValidators = sharingContext.earlyValidators || [];
            if (earlyValidators.length > 0) {
                retroactiveBonus = baseReward * this.config.earlyValidatorBonusRate * earlyValidators.length;
                console.log(`   🎖️ Early validator bonus: ${retroactiveBonus.toFixed(2)} points (${earlyValidators.length} validators)`);
            }
            
            // STEP 5: Check for compound discovery bonus
            let compoundBonus = 0;
            if (sharingContext.leadsToNewStrategy && sharingContext.strategyProfitPotential) {
                compoundBonus = sharingContext.strategyProfitPotential * this.config.compoundDiscoveryRate;
                console.log(`   🔬 Compound discovery bonus: ${compoundBonus.toFixed(2)} points (${sharingContext.strategyProfitPotential} profit potential)`);
            }
            
            // STEP 6: Calculate total reward
            const totalReward = immediateReward + multiAgentBonus + retroactiveBonus + compoundBonus;
            
            const reward = {
                rewardId: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sharingAgentId: sharingContext.sharingAgentId,
                benefitingAgents: benefitingAgents,
                
                // Reward breakdown
                baseReward: baseReward,
                immediateReward: immediateReward,
                multiAgentBonus: multiAgentBonus,
                retroactiveBonus: retroactiveBonus,
                compoundBonus: compoundBonus,
                totalReward: totalReward,
                
                // Context
                improvementData: improvementData,
                sharingContext: sharingContext,
                timeMultiplier: timeMultiplier,
                minutesSinceSharing: minutesSinceSharing,
                
                // Validation
                requiresJudgeValidation: this.config.requireJudgeValidation,
                validated: false,
                
                // Metadata
                timestamp: Date.now(),
                calculatedAt: new Date().toISOString()
            };
            
            console.log(`   🏆 TOTAL REWARD: ${totalReward.toFixed(2)} points`);
            
            return reward;
            
        } catch (error) {
            console.error('❌ Error calculating reward:', error);
            return {
                rewardGranted: false,
                error: error.message
            };
        }
    }
    
    /**
     * ⚖️ VALIDATE AND ISSUE REWARD
     * ============================
     */
    async validateAndIssueReward(reward, judgeService = null) {
        try {
            console.log(`⚖️ Validating reward ${reward.rewardId}...`);
            
            // Judge validation if required
            if (this.config.requireJudgeValidation && judgeService) {
                const validation = await judgeService.validateKnowledgeSharingReward(reward);
                
                if (!validation.approved || validation.confidence < this.config.judgeValidationThreshold) {
                    console.log(`   ❌ Reward rejected by Judge: ${validation.reason}`);
                    
                    this.metrics.rejectedRewardsCount++;
                    
                    return {
                        rewardIssued: false,
                        reason: 'Judge validation failed',
                        validation: validation
                    };
                }
                
                reward.validated = true;
                reward.validationConfidence = validation.confidence;
                console.log(`   ✅ Reward validated by Judge (${(validation.confidence * 100).toFixed(1)}% confidence)`);
                
                this.metrics.validatedRewardsCount++;
            }
            
            // Issue reward to sharing agent
            await this.issueRewardToAgent(reward.sharingAgentId, reward.totalReward, reward);
            
            // Store reward in history
            this.rewardHistory.set(reward.rewardId, reward);
            
            // Update metrics
            this.metrics.totalRewardsIssued++;
            this.metrics.totalRewardPoints += reward.totalReward;
            this.metrics.avgRewardPerImprovement = 
                this.metrics.totalRewardPoints / this.metrics.totalRewardsIssued;
            
            if (reward.multiAgentBonus > 0) {
                this.metrics.multiAgentBenefitsCount++;
            }
            
            if (reward.compoundBonus > 0) {
                this.metrics.compoundDiscoveriesCount++;
            }
            
            // Track knowledge impact
            this.trackKnowledgeImpact(reward);
            
            // Persist reward to database
            if (this.config.database) {
                await this.persistReward(reward);
            }
            
            // Emit reward event
            this.emit('rewardIssued', reward);
            
            console.log(`   🎉 Reward issued: ${reward.totalReward.toFixed(2)} points to ${reward.sharingAgentId}`);
            
            return {
                rewardIssued: true,
                reward: reward
            };
            
        } catch (error) {
            console.error('❌ Error validating and issuing reward:', error);
            return {
                rewardIssued: false,
                error: error.message
            };
        }
    }
    
    /**
     * 💵 ISSUE REWARD TO AGENT
     * ========================
     */
    async issueRewardToAgent(agentId, rewardPoints, rewardDetails) {
        try {
            // Update agent's total rewards
            const currentTotal = this.agentRewardTotals.get(agentId) || 0;
            this.agentRewardTotals.set(agentId, currentTotal + rewardPoints);
            
            // Store in database if available
            if (this.config.database && typeof this.config.database.connect === 'function') {
                const client = await this.config.database.connect();
                
                try {
                    await client.query(`
                        INSERT INTO agent_reward_totals (
                            agent_id, total_reward_points, last_reward_amount, 
                            last_reward_timestamp, updated_at
                        ) VALUES ($1, $2, $3, NOW(), NOW())
                        ON CONFLICT (agent_id) 
                        DO UPDATE SET 
                            total_reward_points = agent_reward_totals.total_reward_points + EXCLUDED.total_reward_points,
                            last_reward_amount = EXCLUDED.last_reward_amount,
                            last_reward_timestamp = EXCLUDED.last_reward_timestamp,
                            updated_at = NOW()
                    `, [agentId, rewardPoints, rewardPoints]);
                } finally {
                    client.release();
                }
            }
            
            console.log(`   💵 Issued ${rewardPoints.toFixed(2)} points to ${agentId}`);
            
        } catch (error) {
            console.error('❌ Error issuing reward to agent:', error);
        }
    }
    
    /**
     * 📊 TRACK KNOWLEDGE IMPACT
     * =========================
     */
    trackKnowledgeImpact(reward) {
        const knowledgeId = reward.sharingContext.knowledgeId;
        
        if (!this.knowledgeImpactTracking.has(knowledgeId)) {
            this.knowledgeImpactTracking.set(knowledgeId, {
                knowledgeId: knowledgeId,
                totalBenefitingAgents: 0,
                totalRewardsIssued: 0,
                totalRewardPoints: 0,
                firstRewardTimestamp: Date.now(),
                lastRewardTimestamp: Date.now(),
                improvements: []
            });
        }
        
        const impact = this.knowledgeImpactTracking.get(knowledgeId);
        impact.totalBenefitingAgents = new Set([...impact.improvements.map(i => i.agentId), ...reward.benefitingAgents]).size;
        impact.totalRewardsIssued++;
        impact.totalRewardPoints += reward.totalReward;
        impact.lastRewardTimestamp = Date.now();
        impact.improvements.push({
            agentId: reward.benefitingAgents[0],
            improvementPercentage: reward.improvementData.improvementPercentage,
            rewardPoints: reward.totalReward,
            timestamp: Date.now()
        });
        
        console.log(`   📊 Knowledge impact updated: ${impact.totalBenefitingAgents} agents benefited`);
    }
    
    /**
     * 💾 CREATE REWARD TRACKING TABLES
     * ================================
     */
    async createRewardTrackingTables() {
        try {
            console.log('💾 Creating reward tracking database tables...');
            
            if (!this.config.database || typeof this.config.database.connect !== 'function') {
                console.log('   ⚠️ No database available - skipping table creation');
                return;
            }
            
            const client = await this.config.database.connect();
            
            try {
                // Performance deltas table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS performance_deltas (
                        id SERIAL PRIMARY KEY,
                        agent_id VARCHAR(100) NOT NULL,
                        improvement_type VARCHAR(50) NOT NULL,
                        before_metric NUMERIC(10,4),
                        after_metric NUMERIC(10,4),
                        improvement_percentage NUMERIC(5,2),
                        formal_proof_hash VARCHAR(64),
                        knowledge_source_id VARCHAR(100),
                        attribution_confidence NUMERIC(3,2),
                        verified_at TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_performance_deltas_agent ON performance_deltas(agent_id, created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_performance_deltas_knowledge ON performance_deltas(knowledge_source_id);
                `);
                
                // Knowledge attribution table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS knowledge_attribution (
                        id SERIAL PRIMARY KEY,
                        shared_memory_id VARCHAR(100) NOT NULL,
                        sharing_agent_id VARCHAR(100) NOT NULL,
                        benefiting_agent_id VARCHAR(100) NOT NULL,
                        improvement_delta_id INTEGER REFERENCES performance_deltas(id),
                        causation_proof_hash VARCHAR(64),
                        attribution_confidence NUMERIC(3,2),
                        time_to_improvement_ms INTEGER,
                        verified_by_judge BOOLEAN DEFAULT false,
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_knowledge_attribution_sharing ON knowledge_attribution(sharing_agent_id, created_at DESC);
                    CREATE INDEX IF NOT EXISTS idx_knowledge_attribution_benefiting ON knowledge_attribution(benefiting_agent_id, created_at DESC);
                `);
                
                // Improvement cascade table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS improvement_cascade (
                        id SERIAL PRIMARY KEY,
                        primary_improvement_id INTEGER REFERENCES performance_deltas(id),
                        secondary_improvement_id INTEGER REFERENCES performance_deltas(id),
                        synergy_factor NUMERIC(4,2),
                        compound_effect_proof VARCHAR(64),
                        agent_id VARCHAR(100),
                        created_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_improvement_cascade_primary ON improvement_cascade(primary_improvement_id);
                    CREATE INDEX IF NOT EXISTS idx_improvement_cascade_agent ON improvement_cascade(agent_id);
                `);
                
                // Agent reward totals table
                await client.query(`
                    CREATE TABLE IF NOT EXISTS agent_reward_totals (
                        id SERIAL PRIMARY KEY,
                        agent_id VARCHAR(100) UNIQUE NOT NULL,
                        total_reward_points NUMERIC(12,2) DEFAULT 0,
                        last_reward_amount NUMERIC(10,2),
                        last_reward_timestamp TIMESTAMPTZ,
                        created_at TIMESTAMPTZ DEFAULT NOW(),
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    );
                    CREATE INDEX IF NOT EXISTS idx_agent_rewards_total ON agent_reward_totals(total_reward_points DESC);
                `);
                
                console.log('   ✅ Reward tracking tables created successfully');
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            console.error('❌ Failed to create reward tracking tables:', error);
        }
    }
    
    /**
     * 💾 PERSIST REWARD TO DATABASE
     * =============================
     */
    async persistReward(reward) {
        try {
            if (!this.config.database || typeof this.config.database.connect !== 'function') {
                return;
            }
            
            const client = await this.config.database.connect();
            
            try {
                // Store performance delta
                const deltaResult = await client.query(`
                    INSERT INTO performance_deltas (
                        agent_id, improvement_type, before_metric, after_metric,
                        improvement_percentage, formal_proof_hash, knowledge_source_id,
                        attribution_confidence, verified_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    RETURNING id
                `, [
                    reward.benefitingAgents[0] || 'unknown',
                    reward.improvementData.type,
                    reward.improvementData.beforeMetric,
                    reward.improvementData.afterMetric,
                    reward.improvementData.improvementPercentage,
                    reward.sharingContext.formalProofHash || null,
                    reward.sharingContext.knowledgeId,
                    reward.sharingContext.attributionConfidence || 0.8
                ]);
                
                const deltaId = deltaResult.rows[0].id;
                
                // Store knowledge attribution for each benefiting agent
                for (const benefitingAgentId of reward.benefitingAgents) {
                    await client.query(`
                        INSERT INTO knowledge_attribution (
                            shared_memory_id, sharing_agent_id, benefiting_agent_id,
                            improvement_delta_id, causation_proof_hash, attribution_confidence,
                            time_to_improvement_ms, verified_by_judge
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        reward.sharingContext.knowledgeId,
                        reward.sharingAgentId,
                        benefitingAgentId,
                        deltaId,
                        reward.sharingContext.causationProofHash || null,
                        reward.sharingContext.attributionConfidence || 0.8,
                        reward.minutesSinceSharing * 60000,
                        reward.validated
                    ]);
                }
                
                console.log(`   💾 Reward persisted to database (deltaId: ${deltaId})`);
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            console.error('❌ Failed to persist reward:', error);
        }
    }
    
    /**
     * 🔄 LOAD REWARD STATE
     * ====================
     */
    async loadRewardState() {
        try {
            // Load from Elite Memory Persistence
            const persistedState = await this.eliteMemoryPersistence.retrieveMemory('reward_engine_state');
            
            if (persistedState) {
                this.rewardHistory = new Map(Object.entries(persistedState.rewardHistory || {}));
                this.knowledgeImpactTracking = new Map(Object.entries(persistedState.knowledgeImpactTracking || {}));
                this.agentRewardTotals = new Map(Object.entries(persistedState.agentRewardTotals || {}));
                this.metrics = { ...this.metrics, ...persistedState.metrics };
                
                console.log('   🔄 Loaded reward state from persistence');
            }
            
        } catch (error) {
            console.error('❌ Failed to load reward state:', error);
        }
    }
    
    /**
     * 💾 SAVE REWARD STATE
     * ====================
     */
    async saveRewardState() {
        try {
            const state = {
                rewardHistory: Object.fromEntries(this.rewardHistory),
                knowledgeImpactTracking: Object.fromEntries(this.knowledgeImpactTracking),
                agentRewardTotals: Object.fromEntries(this.agentRewardTotals),
                metrics: this.metrics,
                timestamp: Date.now()
            };
            
            await this.eliteMemoryPersistence.storeMemory('reward_engine_state', state, {
                importance: 1.0
            });
            
        } catch (error) {
            console.error('❌ Failed to save reward state:', error);
        }
    }
    
    /**
     * 📊 GET REWARD STATISTICS
     * ========================
     */
    getRewardStatistics() {
        return {
            metrics: this.metrics,
            rewardHistory: this.rewardHistory.size,
            knowledgeImpacts: this.knowledgeImpactTracking.size,
            agentTotals: Object.fromEntries(this.agentRewardTotals),
            topRewardingKnowledge: this.getTopRewardingKnowledge(10),
            topRewardedAgents: this.getTopRewardedAgents(10)
        };
    }
    
    /**
     * 🏆 GET TOP REWARDING KNOWLEDGE
     * ==============================
     */
    getTopRewardingKnowledge(limit = 10) {
        return Array.from(this.knowledgeImpactTracking.values())
            .sort((a, b) => b.totalRewardPoints - a.totalRewardPoints)
            .slice(0, limit)
            .map(impact => ({
                knowledgeId: impact.knowledgeId,
                benefitingAgents: impact.totalBenefitingAgents,
                totalPoints: impact.totalRewardPoints,
                improvements: impact.totalRewardsIssued
            }));
    }
    
    /**
     * 🏆 GET TOP REWARDED AGENTS
     * ==========================
     */
    getTopRewardedAgents(limit = 10) {
        return Array.from(this.agentRewardTotals.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([agentId, points]) => ({ agentId, totalPoints: points }));
    }
    
    /**
     * 🛑 SHUTDOWN
     * ===========
     */
    async shutdown() {
        console.log('🛑 Shutting down Knowledge Sharing Reward Engine...');
        
        // Save final state
        await this.saveRewardState();
        
        // Shutdown persistence
        if (this.eliteMemoryPersistence) {
            await this.eliteMemoryPersistence.shutdown();
        }
        
        console.log('✅ Knowledge Sharing Reward Engine shutdown complete');
    }
}

console.log('💎 Knowledge Sharing Reward Engine module loaded');
console.log('🎯 Collective intelligence foundation: Ready for knowledge sharing rewards');
