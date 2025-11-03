/**
 * Verification utility for FactoryRewardPenaltyIntegration
 * 
 * This utility verifies that the FactoryRewardPenaltyIntegration is properly
 * integrated with each agent and learning system.
 */

/**
 * Verify reward/penalty integration with factory and all agents
 */
export async function verifyRewardPenaltyIntegration(factory) {
    console.log('🔍 Verifying Reward/Penalty Integration...');
    
    const results = {
        factory: verifyFactoryIntegration(factory),
        agents: {},
        learningInterfaces: verifyLearningInterfaces(factory),
        databaseTables: await verifyDatabaseTables(factory),
        overall: true
    };
    
    // Verify integration with each agent
    const agents = factory.agents || [];
    for (const agent of agents) {
        if (agent && agent.id) {
            results.agents[agent.id] = verifyAgentIntegration(agent, factory);
            
            // Update overall status
            if (!results.agents[agent.id].integrated) {
                results.overall = false;
            }
        }
    }
    
    // Update overall status
    if (!results.factory.integrated) {
        results.overall = false;
    }
    
    if (!results.databaseTables.tablesExist) {
        results.overall = false;
    }
    
    // Print summary
    console.log('📊 Reward/Penalty Integration Verification Summary:');
    console.log(`Factory integration: ${results.factory.integrated ? '✅' : '❌'}`);
    console.log(`Database tables: ${results.databaseTables.tablesExist ? '✅' : '❌'}`);
    console.log(`Learning interfaces: ${results.learningInterfaces.count} connected`);
    
    const agentCount = Object.keys(results.agents).length;
    const integratedAgentCount = Object.values(results.agents)
        .filter(result => result.integrated)
        .length;
    
    console.log(`Agents: ${integratedAgentCount}/${agentCount} integrated`);
    
    if (results.overall) {
        console.log('✅ Reward/Penalty Integration is fully operational');
    } else {
        console.log('⚠️ Reward/Penalty Integration has issues that need to be addressed');
    }
    
    return results;
}

/**
 * Verify factory integration
 */
function verifyFactoryIntegration(factory) {
    const result = {
        integrated: false,
        components: {
            rewardPenaltyEngine: Boolean(factory.rewardPenaltyEngine),
            decisionAwareness: Boolean(factory.decisionAwareness),
            rewardPenaltyBehavior: Boolean(factory.rewardPenaltyBehavior)
        },
        methods: {
            applyReward: typeof factory.applyReward === 'function',
            applyPenalty: typeof factory.applyPenalty === 'function',
            buildDecisionAwareness: typeof factory.buildDecisionAwareness === 'function',
            makeDecisionWithAwareness: typeof factory.makeDecisionWithAwareness === 'function',
            getAgentBehaviorReport: typeof factory.getAgentBehaviorReport === 'function'
        }
    };
    
    // Check if all components are present
    result.integrated = Object.values(result.components).every(Boolean) &&
                        Object.values(result.methods).every(Boolean);
    
    return result;
}

/**
 * Verify agent integration
 */
function verifyAgentIntegration(agent, factory) {
    // Check if agent has necessary methods and properties
    const result = {
        integrated: false,
        components: {
            rewardPenaltyEngine: Boolean(agent.rewardPenaltyEngine),
            decisionAwareness: Boolean(agent.decisionAwareness),
            behaviorProfile: Boolean(agent.behaviorProfile)
        },
        methods: {
            makeDecisionWithAwareness: typeof agent.makeDecisionWithAwareness === 'function',
            applyReward: typeof agent.applyReward === 'function',
            applyPenalty: typeof agent.applyPenalty === 'function'
        }
    };
    
    // If agent doesn't have direct integration, check if it can access through factory
    if (!result.components.rewardPenaltyEngine && factory.rewardPenaltyEngine) {
        result.components.rewardPenaltyEngine = true;
    }
    
    if (!result.components.decisionAwareness && factory.decisionAwareness) {
        result.components.decisionAwareness = true;
    }
    
    if (!result.methods.makeDecisionWithAwareness && factory.makeDecisionWithAwareness) {
        result.methods.makeDecisionWithAwareness = true;
    }
    
    if (!result.methods.applyReward && factory.applyReward) {
        result.methods.applyReward = true;
    }
    
    if (!result.methods.applyPenalty && factory.applyPenalty) {
        result.methods.applyPenalty = true;
    }
    
    // Check if agent has access to all required components and methods
    result.integrated = Object.values(result.components).every(Boolean) &&
                        Object.values(result.methods).every(Boolean);
    
    return result;
}

/**
 * Verify learning interfaces
 */
function verifyLearningInterfaces(factory) {
    const interfaces = {
        alphaGo: factory.completeLearningEcosystem?.alphaGoRL,
        a2c: factory.completeLearningEcosystem?.boundedA2C,
        mdp: factory.completeLearningEcosystem?.quantumMDP,
        transformer: factory.completeLearningEcosystem?.ultraFastTransformer,
        alphaFold: factory.alphaFoldPredictor,
        alphaGnome: factory.alphaGnomeSystem
    };
    
    // Count connected interfaces
    const connectedInterfaces = Object.values(interfaces).filter(Boolean);
    
    return {
        interfaces,
        count: connectedInterfaces.length,
        details: Object.entries(interfaces).map(([name, instance]) => ({
            name,
            connected: Boolean(instance),
            hasRewardPenaltyEngine: instance && Boolean(instance.rewardPenaltyEngine),
            hasDecisionAwareness: instance && Boolean(instance.decisionAwareness)
        }))
    };
}

/**
 * Verify database tables
 */
async function verifyDatabaseTables(factory) {
    if (!factory.dbPool) {
        return {
            tablesExist: false,
            reason: 'No database pool available'
        };
    }
    
    try {
        // Check if required tables exist
        const requiredTables = [
            'rewards',
            'penalties',
            'agent_decisions',
            'agent_behavior',
            'agent_behavior_memories'
        ];
        
        const existingTables = [];
        
        // Query database to check if tables exist
        for (const table of requiredTables) {
            try {
                const result = await factory.dbPool.query(`
                    SELECT 1 FROM ${table} LIMIT 1
                `);
                
                existingTables.push(table);
            } catch (error) {
                // Table doesn't exist or can't be accessed
                console.log(`⚠️ Table ${table} not found or inaccessible`);
            }
        }
        
        return {
            tablesExist: existingTables.length === requiredTables.length,
            requiredTables,
            existingTables,
            missingTables: requiredTables.filter(table => !existingTables.includes(table))
        };
    } catch (error) {
        console.error('Error verifying database tables:', error);
        
        return {
            tablesExist: false,
            error: error.message
        };
    }
}

export default verifyRewardPenaltyIntegration;
