/**
 * 🏭 FACTORY REWARD PENALTY INTEGRATION
 * ====================================
 * 
 * Integration code to connect the UltimateConstructionSyndicateFactory with 
 * the RewardPenaltyEngine and DecisionAwareness systems.
 * 
 * This allows agents to be aware of rewards, penalties, and consequences
 * before taking actions, making their decisions more informed and effective.
 */

import { RewardPenaltyEngine } from './RewardPenaltyEngine.js';
import { DecisionAwareness } from './DecisionAwareness.js';
import { RewardPenaltyDrivenBehavior } from './RewardPenaltyDrivenBehavior.js';

/**
 * Integrate reward/penalty and decision awareness systems with factory
 */
export async function integrateRewardPenaltySystem(factory) {
    console.log('🔌 Integrating Reward/Penalty and Decision Awareness systems with factory...');
    
    // Create core reward/penalty engine
    const rewardPenaltyEngine = new RewardPenaltyEngine({
        dbPool: factory.dbPool,
        debug: factory.debug
    });
    
    // Create decision awareness system
    const decisionAwareness = new DecisionAwareness({
        dbPool: factory.dbPool,
        debug: factory.debug
    });
    
    // Create reward-penalty driven behavior system
    const rewardPenaltyBehavior = new RewardPenaltyDrivenBehavior({
        dbPool: factory.dbPool,
        debug: factory.debug
    });
    
    // Add to factory
    factory.rewardPenaltyEngine = rewardPenaltyEngine;
    factory.decisionAwareness = decisionAwareness;
    factory.rewardPenaltyBehavior = rewardPenaltyBehavior;
    
    // Register learning system interfaces
    await registerLearningInterfaces(factory);
    
    // Register reward-penalty behavior system
    rewardPenaltyBehavior.registerRewardPenaltySystem(rewardPenaltyEngine, decisionAwareness);
    
    // Extend factory methods
    extendFactoryMethods(factory);
    
    console.log('✅ Reward/Penalty and Decision Awareness systems integrated with factory');
}

/**
 * Register learning system interfaces with the reward/penalty engine
 */
async function registerLearningInterfaces(factory) {
    // Access learning systems from the factory
    const learningInterfaces = {
        alphaGo: factory.completeLearningEcosystem?.alphaGoRL,
        a2c: factory.completeLearningEcosystem?.boundedA2C,
        mdp: factory.completeLearningEcosystem?.quantumMDP,
        transformer: factory.completeLearningEcosystem?.ultraFastTransformer,
        quantumEvolution: factory.completeLearningEcosystem?.quantumEvolution,
        adaptiveMetaLearning: factory.completeLearningEcosystem?.adaptiveMetaLearning,
        policyDistillation: factory.completeLearningEcosystem?.policyDistillation,
        evolutionOrchestrator: factory.completeLearningEcosystem?.evolutionOrchestrator,
        alphaFold: factory.alphaFoldPredictor,
        alphaGnome: factory.alphaGnomeSystem
    };
    
    // Register with reward engine
    factory.rewardPenaltyEngine.registerLearningInterfaces(learningInterfaces);
    
    // Register with decision awareness
    factory.decisionAwareness.config.interfaces = learningInterfaces;
    
    // Register the reward/penalty engine with each learning system
    await registerWithAlphaGoRL(factory);
    await registerWithA2C(factory);
    await registerWithMDP(factory);
    await registerWithTransformer(factory);
    await registerWithAlphaFold(factory);
    await registerWithAlphaGnome(factory);
    
    console.log(`🔌 Registered ${Object.values(learningInterfaces).filter(Boolean).length} learning interfaces`);
}

/**
 * Register with AlphaGo RL system
 */
async function registerWithAlphaGoRL(factory) {
    const alphaGoRL = factory.completeLearningEcosystem?.alphaGoRL;
    
    if (alphaGoRL && typeof alphaGoRL.registerRewardPenaltyEngine === 'function') {
        alphaGoRL.registerRewardPenaltyEngine(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with AlphaGo RL');
    }
}

/**
 * Register with Bounded A2C system
 */
async function registerWithA2C(factory) {
    const a2c = factory.completeLearningEcosystem?.boundedA2C;
    
    if (a2c && typeof a2c.registerRewardPenaltySystem === 'function') {
        a2c.registerRewardPenaltySystem(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with Bounded A2C');
    }
}

/**
 * Register with Quantum MDP system
 */
async function registerWithMDP(factory) {
    const mdp = factory.completeLearningEcosystem?.quantumMDP;
    
    if (mdp && typeof mdp.registerRewardPenaltySystem === 'function') {
        mdp.registerRewardPenaltySystem(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with Quantum MDP');
    }
}

/**
 * Register with Transformer system
 */
async function registerWithTransformer(factory) {
    const transformer = factory.completeLearningEcosystem?.ultraFastTransformer;
    
    if (transformer && typeof transformer.registerRewardPenaltySystem === 'function') {
        transformer.registerRewardPenaltySystem(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with UltraFast Transformer');
    }
}

/**
 * Register with AlphaFold Market Structure Predictor
 */
async function registerWithAlphaFold(factory) {
    const alphaFold = factory.alphaFoldPredictor;
    
    if (alphaFold && typeof alphaFold.registerRewardPenaltySystem === 'function') {
        alphaFold.registerRewardPenaltySystem(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with AlphaFold Market Structure Predictor');
    }
}

/**
 * Register with AlphaGnome Evolutionary System
 */
async function registerWithAlphaGnome(factory) {
    const alphaGnome = factory.alphaGnomeSystem;
    
    if (alphaGnome && typeof alphaGnome.registerRewardPenaltySystem === 'function') {
        alphaGnome.registerRewardPenaltySystem(
            factory.rewardPenaltyEngine, 
            factory.decisionAwareness
        );
        console.log('✅ Registered reward/penalty system with AlphaGnome Evolutionary System');
    }
}

/**
 * Extend factory methods with reward/penalty and decision awareness integration
 */
function extendFactoryMethods(factory) {
    // Original method references
    const originalHandleAgentOpportunity = factory.handleAgentOpportunity;
    const originalExecuteOpportunity = factory.executeOpportunity;
    const originalInstantiateAgent = factory.instantiateAgent;
    
    // Extend handleAgentOpportunity to include decision awareness
    factory.handleAgentOpportunity = async function(agent, opportunity) {
        try {
            // Create context with network conditions
            const context = {
                networkConditions: this.networkConditionsMonitor ? 
                    await this.networkConditionsMonitor.getNetworkStatus(opportunity.chain) : 
                    null,
                timestamp: Date.now(),
                agentType: agent.character?.type || 'unknown',
                estimatedGasUsed: opportunity.gasEstimate || 300000,
                estimatedProfitUSD: opportunity.estimatedProfitUSD || 0
            };
            
            // Add penalty factor from recent failures
            context.penaltyFactor = this.rewardPenaltyEngine.getAgentPenaltyFactor(agent.character?.characterId);
            
            // Resolve evolved context overrides
            const agentContext = await this.resolveEvolvedContextOverrides(agent.character?.characterId, opportunity.chain);
            
            // Build decision awareness for agent
            const awareness = this.decisionAwareness.buildDecisionAwareness(
                agent.character?.characterId, 
                opportunity, 
                context
            );
            
            // Add decision awareness to agent context
            agentContext.awareness = awareness;
            
            // Continue with original handling, passing awareness in context
            return await originalHandleAgentOpportunity.call(this, agent, opportunity, agentContext);
        } catch (error) {
            console.error('❌ Enhanced handleAgentOpportunity failed:', error);
            return { success: false, error: error.message };
        }
    };
    
    // Extend executeOpportunity with outcome handling
    factory.executeOpportunity = async function(agent, opportunity, calculation) {
        try {
            // Execute opportunity with original method
            const execResult = await originalExecuteOpportunity.call(this, agent, opportunity, calculation);
            
            // Record decision outcome for learning
            if (agent.character?.characterId) {
                this.decisionAwareness.recordOutcome(
                    agent.character.characterId,
                    opportunity.id,
                    execResult,
                    { calculation }
                );
            }
            
            return execResult;
        } catch (error) {
            console.error('❌ Enhanced executeOpportunity failed:', error);
            return { success: false, error: error.message };
        }
    };
    
    // Extend instantiateAgent to add reward/penalty awareness
    factory.instantiateAgent = async function(character) {
        // Create agent with original method
        const agent = await originalInstantiateAgent.call(this, character);
        
        // Add reward/penalty awareness to agent
        if (agent && character?.characterId) {
            agent.getRewardDashboard = function() {
                return factory.rewardPenaltyEngine.generateRewardDashboard(character.characterId);
            };
            
            agent.getDecisionAwareness = function() {
                return factory.decisionAwareness.getAwareness(character.characterId);
            };
        }
        
        return agent;
    };
    
    // Add new method to build decision awareness for opportunity
    factory.buildDecisionAwareness = function(agentId, opportunity, context = {}) {
        return this.decisionAwareness.buildDecisionAwareness(agentId, opportunity, context);
    };
    
    // Add new method to get reward dashboard
    factory.getAgentRewardDashboard = function(agentId) {
        return this.rewardPenaltyEngine.generateRewardDashboard(agentId);
    };
    
    // Add new method to get awareness report
    factory.getAgentAwarenessReport = function(agentId) {
        return this.decisionAwareness.generateAwarenessReport(agentId);
    };
    
    // Add new method to get behavior report
    factory.getAgentBehaviorReport = function(agentId) {
        return this.rewardPenaltyBehavior.generateBehaviorReport(agentId);
    };
    
    // Add new method to make a decision with awareness and reward-driven behavior
    factory.makeDecisionWithAwareness = async function(agentId, opportunity, context = {}) {
        // Build awareness
        const awareness = this.decisionAwareness.buildDecisionAwareness(
            agentId, 
            opportunity, 
            context
        );
        
        // Get behavior-driven evaluation
        const behaviorEvaluation = this.rewardPenaltyBehavior.evaluateDecision(
            agentId,
            awareness.recommendedAction || 'reject',
            {
                expectedReward: awareness.expectedRewards?.total || 0,
                expectedPenalty: awareness.expectedPenalties?.total || 0,
                opportunity,
                context
            }
        );
        
        // Combine awareness and behavior-driven decision
        const decision = {
            // Primary decision comes from behavior evaluation
            action: behaviorEvaluation.recommendation === 'pursue' ? 
                    awareness.recommendedAction : 'reject',
            
            // Combine confidence scores
            confidence: (awareness.confidence * 0.4) + (behaviorEvaluation.confidence * 0.6),
            
            // Combined reasoning
            reasoning: [
                ...(awareness.reasoning || []),
                ...behaviorEvaluation.reasoning
            ].join('; '),
            
            // Include full data
            awareness: awareness,
            behaviorEvaluation: behaviorEvaluation
        };
        
        // Log the decision process
        if (this.debug) {
            console.log(`🧠 Agent ${agentId} decision process:`, {
                awarenessRecommendation: awareness.recommendedAction,
                behaviorRecommendation: behaviorEvaluation.recommendation,
                finalDecision: decision.action,
                confidence: decision.confidence
            });
        }
        
        return decision;
    };
    
    console.log('🔧 Enhanced factory methods with reward/penalty and decision awareness integration');
}

/**
 * Add database tables required for reward/penalty and decision awareness systems
 */
export async function addRewardPenaltyDatabaseTables(dbPool) {
    console.log('🗄️ Adding reward/penalty database tables...');
    
    const client = await dbPool.connect();
    
    try {
        // Agent rewards table
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
        
        // Agent penalties table
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
        
        // Agent awareness table
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
        
        // Agent decisions table
        await client.query(`
            CREATE TABLE IF NOT EXISTS agent_decisions (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(255) NOT NULL,
                opportunity_id VARCHAR(255) NOT NULL,
                decision_data JSONB NOT NULL,
                awareness_data JSONB NOT NULL,
                context JSONB,
                outcome_data JSONB,
                outcome_context JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                outcome_time TIMESTAMP
            )
        `);
        
        // Agent behavior table
        await client.query(`
            CREATE TABLE IF NOT EXISTS agent_behavior (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(255) NOT NULL,
                reward_seeking DECIMAL(5,4) NOT NULL,
                penalty_avoidance DECIMAL(5,4) NOT NULL,
                risk_tolerance DECIMAL(5,4) NOT NULL,
                exploration_drive DECIMAL(5,4) NOT NULL,
                behavior_profile JSONB,
                context JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Agent behavior memories table
        await client.query(`
            CREATE TABLE IF NOT EXISTS agent_behavior_memories (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(255) NOT NULL,
                memory_type VARCHAR(50) NOT NULL,
                action VARCHAR(255) NOT NULL,
                amount DECIMAL(18,8) NOT NULL,
                strength DECIMAL(5,4) NOT NULL,
                context JSONB,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);
        
        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_rewards_agent_id ON agent_rewards(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_penalties_agent_id ON agent_penalties(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_awareness_agent_id ON agent_awareness(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_decisions_agent_id ON agent_decisions(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_decisions_opportunity_id ON agent_decisions(opportunity_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_behavior_agent_id ON agent_behavior(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_behavior_memories_agent_id ON agent_behavior_memories(agent_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_agent_behavior_memories_action ON agent_behavior_memories(action)');
        
        console.log('✅ Reward/penalty database tables created successfully');
    } finally {
        client.release();
    }
}

export default {
    integrateRewardPenaltySystem,
    addRewardPenaltyDatabaseTables
};
