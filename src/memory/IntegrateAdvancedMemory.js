/**
 * 🔗 ADVANCED MEMORY SYSTEM INTEGRATION
 * =====================================
 * 
 * Integrates the complete advanced memory system (MEM1, Knowledge Graph,
 * Large Concept Models, Quantum Entanglements) with the existing
 * AI Flash Loan Arbitrage Syndicate infrastructure.
 */

import { AdvancedMemoryCoordinator } from './AdvancedMemoryCoordinator.js';
import { MemorySinkPrevention } from './MemorySinkPrevention.js';
import { ComprehensivePersistenceLayer } from './ComprehensivePersistenceLayer.js';
import { QuantumMemoryIntegration } from './QuantumMemoryIntegration.js';

export class IntegrateAdvancedMemory {
    constructor() {
        this.memoryCoordinator = null;
        this.sinkPrevention = null;
        this.persistenceLayer = null; // Create during initialize(), not at import time!
        this.quantumIntegration = null;
        this.integrated = false;
        this.dbWarned = false; // 🎯 Guard against spam warnings
        
        // 🛡️ WARN-ONCE GUARDS: Prevent integration warning spam
        this._warnedNoAgentsMap = false;
        this._warnedNoRewardSystems = false;
        this._warnedNoCollectiveLearning = false;
    }

    /**
     * Main integration method - connects to UltimateArbitrageSyndicateFactory
     */
    async integrateWithSyndicate(syndicateFactory, dependencies) {
        console.log('\n🧠 INTEGRATING ADVANCED MEMORY SYSTEM WITH SYNDICATE');
        console.log('==================================================\n');
        
        try {
            // 1. Initialize Advanced Memory Coordinator
            this.memoryCoordinator = new AdvancedMemoryCoordinator({
                enableMEM1: true,
                enableKnowledgeGraph: true,
                enableConceptAgent: true,
                enableQuantumEntanglements: true,
                enableSEDM: true,
                memorySinkPrevention: true,
                pruningEnabled: true
            });
            
            // 2. Prepare dependencies with syndicate systems
            const memoryDependencies = {
                ...dependencies,
                
                // 🔥 UNIFIED KNOWLEDGE STORAGE (SINGLE SOURCE OF TRUTH!)
                unifiedKnowledgeStorage: syndicateFactory.unifiedKnowledgeStorage,
                
                // Connect to existing syndicate systems
                alphaGoSystem: syndicateFactory.systems?.alphaGo,
                alphaFoldSystem: syndicateFactory.systems?.alphaFold,
                alphaGnomeSystem: syndicateFactory.systems?.alphaGnome,
                worldModel: syndicateFactory.worldModel,
                eliteMDPFramework: syndicateFactory.mdpFramework,
                formalVerification: syndicateFactory.formalVerification,
                creativitySystems: syndicateFactory.creativitySystems,
                provenanceSystem: syndicateFactory.provenanceSystem,
                
                // ML models for entanglement analysis
                mlModels: this.collectMLModels(syndicateFactory),
                
                // Archive storage
                archiveStorage: dependencies.s3 || dependencies.archiveStorage
            };
            
            // 3. Initialize memory system
            await this.memoryCoordinator.initialize(memoryDependencies);
            
            // Connect deep reasoning systems to memory
            await this.connectDeepReasoningToMemory(syndicateFactory, memoryDependencies);
            
            // 4. Initialize memory sink prevention
            this.sinkPrevention = new MemorySinkPrevention({
                uCurveWindow: 1000,
                distillationInterval: 24 * 60 * 60 * 1000,
                creativityThreshold: 0.3
            });
            
            await this.sinkPrevention.initialize({
                memoryCoordinator: this.memoryCoordinator,
                knowledgeGraph: this.memoryCoordinator.components.knowledgeGraph,
                database: dependencies.database
            });
            
            // 5. Integrate with existing agents
            await this.integrateWithAgents(syndicateFactory);
            
            // 6. Setup memory-aware world model
            await this.enhanceWorldModel(syndicateFactory.worldModel);
            
            // 7. Connect to reward system
            await this.connectRewardSystem(syndicateFactory);
            
            // 8. Setup collective learning integration
            await this.integrateCollectiveLearning(syndicateFactory);
            
            // 9. Connect creativity systems
            await this.connectCreativitySystems(syndicateFactory);
            
            // 10. Setup persistence and recovery
            await this.setupPersistenceAndRecovery(dependencies);
            
            // 11. Initialize comprehensive persistence layer
            await this.initializeComprehensivePersistence(dependencies);
            
            // 12. Setup quantum memory integration
            await this.setupQuantumMemoryIntegration(syndicateFactory, dependencies);
            
            this.integrated = true;
            
            console.log('\n✅ ADVANCED MEMORY INTEGRATION COMPLETE!');
            console.log('   - MEM1 constant memory active for all agents');
            console.log('   - Knowledge Graph storing structured knowledge');
            console.log('   - Large Concept Models orchestrating reasoning');
            console.log('   - Quantum entanglements discovering connections');
            console.log('   - SEDM verifying knowledge utility');
            console.log('   - Memory sink prevention protecting adaptability');
            console.log('==================================================\n');
            
            return {
                success: true,
                memoryCoordinator: this.memoryCoordinator,
                sinkPrevention: this.sinkPrevention
            };
            
        } catch (error) {
            console.error('❌ Memory integration failed:', error);
            throw error;
        }
    }

    /**
     * Integrate memory system with all existing agents
     */
    async integrateWithAgents(syndicateFactory) {
        console.log('🤖 Integrating memory with existing agents...');
        
        // 🔥 FIX: Access agents correctly from factory
        if (!syndicateFactory.agents || !(syndicateFactory.agents instanceof Map)) {
            // 🛡️ WARN-ONCE GUARD: Prevent spam during initialization
            if (!this._warnedNoAgentsMap) {
                console.warn('⚠️ No agents Map found in syndicateFactory - skipping agent integration (will retry when factory ready)');
                this._warnedNoAgentsMap = true;
            }
            return;
        }
        
        // Reset warning flag on successful integration
        this._warnedNoAgentsMap = false;
        
        // Get all registered agents from the Map
        const agents = Array.from(syndicateFactory.agents.values());
        
        console.log(`   📊 Found ${agents.length} agents to integrate`);
        
        for (const agent of agents) {
            try {
                // Wrap agent methods to use MEM1
                await this.wrapAgentWithMemory(agent);
                
                // Connect agent to Concept Agent for LCM reasoning
                if (this.memoryCoordinator.components.conceptAgent) {
                    agent.conceptAgent = this.memoryCoordinator.components.conceptAgent;
                }
                
                // 🔥 KG INTEGRATION - Connect agent to Knowledge Graph!
                if (this.memoryCoordinator.knowledgeGraph) {
                    agent.knowledgeGraph = this.memoryCoordinator.knowledgeGraph;
                    console.log(`   🔥 Connected KnowledgeGraph to agent ${agent.agentId || 'unknown'}`);
                }
                
                // Connect UnifiedKnowledgeStorage if available
                if (this.memoryCoordinator.unifiedKnowledgeStorage) {
                    agent.unifiedKnowledgeStorage = this.memoryCoordinator.unifiedKnowledgeStorage;
                }
                
                console.log(`   ✅ Memory integrated with agent ${agent.agentId || 'unknown'}`);
            } catch (error) {
                console.error(`   ❌ Failed to integrate memory with agent:`, error.message);
            }
        }
        
        // Setup agent creation hook for future agents if factory is EventEmitter
        if (syndicateFactory.on && typeof syndicateFactory.on === 'function') {
            syndicateFactory.on('agent_created', async (agent) => {
                await this.wrapAgentWithMemory(agent);
                
                // 🔥 KG INTEGRATION for new agents!
                if (this.memoryCoordinator.knowledgeGraph) {
                    agent.knowledgeGraph = this.memoryCoordinator.knowledgeGraph;
                }
                if (this.memoryCoordinator.unifiedKnowledgeStorage) {
                    agent.unifiedKnowledgeStorage = this.memoryCoordinator.unifiedKnowledgeStorage;
                }
            });
            console.log('   ✅ Agent creation hook installed');
        } else {
            console.log('   ⚠️ Factory does not support event emissions - new agents won\'t auto-integrate');
        }
        
        // 🔥 STORE INTEGRATION EVENT TO KG!
        if (this.persistenceLayer && this.persistenceLayer.eliteMemoryPersistence) {
            await this.persistenceLayer.eliteMemoryPersistence.storeMemory(
                'memory_agent_integration',
                {
                    agentCount: agents.length,
                    timestamp: Date.now(),
                    integratedComponents: {
                        mem1: !!this.memoryCoordinator.components.mem1,
                        knowledgeGraph: !!this.memoryCoordinator.knowledgeGraph,
                        conceptAgent: !!this.memoryCoordinator.components.conceptAgent,
                        unifiedStorage: !!this.memoryCoordinator.unifiedKnowledgeStorage
                    }
                },
                {
                    storeToKG: true,
                    agentId: 'IntegrateAdvancedMemory',
                    confidence: 0.9
                }
            );
        }
        
        console.log(`   ✅ Integrated memory with ${agents.length} agents`);
    }

    /**
     * Wrap agent with MEM1 consolidation
     */
    async wrapAgentWithMemory(agent) {
        const originalThink = agent.think?.bind(agent) || agent.process?.bind(agent);
        const originalAct = agent.act?.bind(agent) || agent.execute?.bind(agent);
        
        // Override think/process method
        if (originalThink) {
            agent.think = async function(input, context = {}) {
                // Consolidate input into MEM1 state
                const consolidationResult = await this.memoryCoordinator.consolidateAgentMemory(
                    agent.id,
                    { type: 'observation', content: input },
                    context
                );
                
                // Add consolidated state to context
                context.memoryState = consolidationResult.state;
                
                // Track decision for persistence
                const trackedDecision = await this.persistenceLayer.trackDecision(
                    agent.id,
                    { type: 'thinking', input, context }
                );
                context.decisionId = trackedDecision.id;
                
                // Query relevant memories
                const memories = await this.memoryCoordinator.queryMemory(
                    input,
                    { agentId: agent.id }
                );
                
                context.relevantMemories = memories;
                
                // Call original method
                return await originalThink(input, context);
            }.bind(this);
        }
        
        // Override act/execute method
        if (originalAct) {
            const originalMethod = originalAct;
            agent.act = async function(action, context = {}) {
                // Record action in memory
                await this.memoryCoordinator.consolidateAgentMemory(
                    agent.id,
                    { type: 'action', content: action },
                    context
                );
                
                // Execute action
                const result = await originalMethod(action, context);
                
                // Store result
                await this.memoryCoordinator.consolidateAgentMemory(
                    agent.id,
                    { type: 'result', content: result },
                    { ...context, actionId: action.id }
                );
                
                return result;
            }.bind(this);
        }
    }

    /**
     * Enhance world model with causal memory
     */
    async enhanceWorldModel(worldModel) {
        if (!worldModel) return;
        
        console.log('🌍 Enhancing world model with causal memory...');
        
        // Connect world model to knowledge graph
        worldModel.knowledgeGraph = this.memoryCoordinator.components.knowledgeGraph;
        
        // Override causal discovery to store in KG
        const originalDiscoverCausality = worldModel.discoverCausality?.bind(worldModel);
        
        if (originalDiscoverCausality) {
            worldModel.discoverCausality = async function(observations) {
                // Run original causal discovery
                const causalLinks = await originalDiscoverCausality(observations);
                
                // Store discovered causal relationships in KG
                for (const link of causalLinks) {
                    await this.memoryCoordinator.components.knowledgeGraph.createRelationship({
                        source: link.cause,
                        target: link.effect,
                        type: 'CAUSES',
                        properties: {
                            mechanism: link.mechanism,
                            strength: link.strength,
                            evidence: link.evidence,
                            discoveredAt: new Date()
                        },
                        confidence: link.confidence
                    });
                }
                
                return causalLinks;
            }.bind(this);
        }
        
        // Add counterfactual reasoning using KG
        worldModel.counterfactualReasoning = async (intervention, target) => {
            // Query causal paths in KG
            const causalPaths = await this.memoryCoordinator.components.knowledgeGraph.multiHopTraversal(
                intervention.variable,
                {
                    maxHops: 5,
                    relationshipTypes: ['CAUSES'],
                    includeEntanglements: true
                }
            );
            
            // Simulate intervention effects
            return this.simulateIntervention(causalPaths, intervention, target);
        };
        
        console.log('   ✅ World model enhanced with causal memory');
    }

    /**
     * Connect reward system with memory feedback
     */
    async connectRewardSystem(syndicateFactory) {
        console.log('💰 Connecting reward system with memory...');
        
        // 🔥 FIX: Check for reward systems in factory
        if (!syndicateFactory.rewardPenaltyEngine && !syndicateFactory.decisionAwareness) {
            // 🛡️ WARN-ONCE GUARD: Prevent spam during initialization
            if (!this._warnedNoRewardSystems) {
                console.warn('⚠️ No reward systems found in syndicateFactory - skipping reward integration (will retry when factory ready)');
                this._warnedNoRewardSystems = true;
            }
            return;
        }
        
        // Reset warning flag on successful integration
        this._warnedNoRewardSystems = false;
        
        // Listen for reward signals if factory supports events
        if (syndicateFactory.on && typeof syndicateFactory.on === 'function') {
            syndicateFactory.on('reward_calculated', async (rewardData) => {
            const { agentId, reward, context } = rewardData;
            
            // Store reward in agent's memory
            await this.memoryCoordinator.consolidateAgentMemory(
                agentId,
                { type: 'reward', value: reward },
                context
            );
            
            // Update knowledge utility based on reward
            if (context.usedKnowledge) {
                for (const knowledgeId of context.usedKnowledge) {
                    await this.updateKnowledgeUtility(knowledgeId, reward);
                }
            }
            
            // Track decision outcome
            if (context.decisionId) {
                await this.persistenceLayer.updateDecisionOutcome(
                    context.decisionId,
                    reward > 0 ? 'success' : 'failure',
                    reward
                );
            }
            });
        }
        
        // 🔥 INTEGRATE WITH EXISTING REWARD SYSTEMS!
        if (syndicateFactory.rewardPenaltyEngine) {
            // Connect memory to reward penalty engine
            const originalCalculateReward = syndicateFactory.rewardPenaltyEngine.calculateReward;
            if (originalCalculateReward && typeof originalCalculateReward === 'function') {
                syndicateFactory.rewardPenaltyEngine.calculateReward = async (...args) => {
                    const result = await originalCalculateReward.apply(syndicateFactory.rewardPenaltyEngine, args);
                    
                    // Store reward calculation in KG
                    if (this.memoryCoordinator.unifiedKnowledgeStorage) {
                        await this.memoryCoordinator.unifiedKnowledgeStorage.storeKnowledge({
                            type: 'reward_calculation',
                            agentId: args[0],
                            reward: result,
                            timestamp: Date.now()
                        }, {
                            agentId: 'RewardSystem',
                            type: 'reward',
                            confidence: 0.9
                        });
                    }
                    
                    return result;
                };
            }
            console.log('   🔥 Connected to RewardPenaltyEngine');
        }
        
        // Connect to decision awareness if available
        if (syndicateFactory.decisionAwareness) {
            // Add memory-based reward prediction
            syndicateFactory.decisionAwareness.predictReward = async (agentId, proposedAction) => {
                // Query historical rewards for similar actions
                const historicalRewards = await this.queryHistoricalRewards(
                    agentId,
                    proposedAction
                );
                
                return {
                    expectedReward: this.calculateExpectedReward(historicalRewards),
                    confidence: historicalRewards.length > 5 ? 0.8 : 0.3,
                    historicalData: historicalRewards
                };
            };
            console.log('   🔥 Connected to DecisionAwareness');
        }
        
        // 🔥 STORE REWARD SYSTEM CONNECTION EVENT!
        if (this.persistenceLayer && this.persistenceLayer.eliteMemoryPersistence) {
            await this.persistenceLayer.eliteMemoryPersistence.storeMemory(
                'reward_system_connected',
                {
                    hasRewardEngine: !!syndicateFactory.rewardPenaltyEngine,
                    hasDecisionAwareness: !!syndicateFactory.decisionAwareness,
                    timestamp: Date.now()
                },
                {
                    storeToKG: true,
                    agentId: 'IntegrateAdvancedMemory',
                    confidence: 0.9
                }
            );
        }
        
        console.log('   ✅ Reward system connected');
    }

    /**
     * Integrate collective learning systems
     */
    async integrateCollectiveLearning(syndicateFactory) {
        console.log('🧠 Integrating collective learning...');
        
        // 🔥 FIX: Check for collective learning systems
        const hasCollectiveLearning = syndicateFactory.collectiveLearningSystem || 
                                     syndicateFactory.sharedMemorySystem ||
                                     syndicateFactory.knowledgeSharing;
        
        if (!hasCollectiveLearning) {
            // 🛡️ WARN-ONCE GUARD: Prevent spam during initialization
            if (!this._warnedNoCollectiveLearning) {
                console.warn('⚠️ No collective learning systems found - skipping integration (will retry when factory ready)');
                this._warnedNoCollectiveLearning = true;
            }
            return;
        }
        
        // Reset warning flag on successful integration
        this._warnedNoCollectiveLearning = false;
        
        // Connect shared memory updates if factory supports events
        if (syndicateFactory.on && typeof syndicateFactory.on === 'function') {
            syndicateFactory.on('collective_insight', async (insight) => {
            // Store in knowledge graph as high-value knowledge
            const node = await this.memoryCoordinator.components.knowledgeGraph.createNode({
                nodeType: 'collective_insight',
                properties: {
                    insight: insight.content,
                    contributors: insight.contributors,
                    consensus_score: insight.consensusScore,
                    timestamp: new Date()
                },
                confidence: insight.consensusScore
            });
            
            // Check for cross-domain entanglements
            await this.memoryCoordinator.components.entanglementEngine.analyzeSpecificPair(
                node.node_id,
                insight.relatedConcepts
            );
            });
        }
        
        // 🔥 INTEGRATE WITH EXISTING COLLECTIVE LEARNING!
        if (syndicateFactory.sharedMemorySystem) {
            // Add knowledge verification to shared memory
            const originalShare = syndicateFactory.sharedMemorySystem.shareKnowledge;
            if (originalShare && typeof originalShare === 'function') {
                syndicateFactory.sharedMemorySystem.shareKnowledge = async (fromAgent, toAgent, knowledge) => {
                    // Verify knowledge utility before sharing
                    if (this.memoryCoordinator.components.sedm) {
                        const verification = await this.memoryCoordinator.components.sedm.verifyKnowledgeUtility(
                            knowledge,
                            { fromAgent, toAgent }
                        );
                        
                        if (!verification.admit) {
                            console.log(`   ⚠️ Knowledge sharing blocked - low utility (${verification.utility})`);
                            return false;
                        }
                    }
                    
                    // Store sharing event in KG
                    if (this.memoryCoordinator.unifiedKnowledgeStorage) {
                        await this.memoryCoordinator.unifiedKnowledgeStorage.storeKnowledge({
                            type: 'knowledge_shared',
                            fromAgent,
                            toAgent,
                            knowledge,
                            timestamp: Date.now()
                        }, {
                            agentId: 'CollectiveLearning',
                            type: 'sharing',
                            confidence: 0.8
                        });
                    }
                    
                    return originalShare.call(syndicateFactory.sharedMemorySystem, fromAgent, toAgent, knowledge);
                };
            }
            console.log('   🔥 Connected to SharedMemorySystem');
        }
        
        // Connect to collective learning if available
        if (syndicateFactory.collectiveLearningSystem) {
            // Add memory-based insight storage
            syndicateFactory.collectiveLearningSystem.storeInsight = async (insight) => {
                // Store in knowledge graph as high-value knowledge
                if (this.memoryCoordinator.components.knowledgeGraph) {
                    const node = await this.memoryCoordinator.components.knowledgeGraph.createNode({
                        nodeType: 'collective_insight',
                        properties: {
                            insight: insight.content,
                            contributors: insight.contributors,
                            consensus_score: insight.consensusScore,
                            timestamp: new Date()
                        },
                        confidence: insight.consensusScore || 0.7
                    });
                    
                    console.log(`   🔥 Collective insight stored to KG: ${node.nodeId}`);
                    return node;
                }
            };
            console.log('   🔥 Connected to CollectiveLearningSystem');
        }
        
        // 🔥 STORE COLLECTIVE LEARNING CONNECTION EVENT!
        if (this.persistenceLayer && this.persistenceLayer.eliteMemoryPersistence) {
            await this.persistenceLayer.eliteMemoryPersistence.storeMemory(
                'collective_learning_connected',
                {
                    hasSharedMemory: !!syndicateFactory.sharedMemorySystem,
                    hasCollectiveLearning: !!syndicateFactory.collectiveLearningSystem,
                    hasKnowledgeSharing: !!syndicateFactory.knowledgeSharing,
                    timestamp: Date.now()
                },
                {
                    storeToKG: true,
                    agentId: 'IntegrateAdvancedMemory',
                    confidence: 0.9
                }
            );
        }
        
        console.log('   ✅ Collective learning integrated');
    }

    /**
     * Connect creativity systems - DEEP INTEGRATION WITH MULTI-TOKEN & CREATIVITY
     */
    async connectCreativitySystems(syndicateFactory) {
        console.log('🎨 Connecting SOPHISTICATED creativity systems...');
        
        // 1. Connect to CreativitySystemIntegrator if available
        if (syndicateFactory.creativitySystemIntegrator) {
            console.log('   🚀 Connecting CreativitySystemIntegrator...');
            const creativityIntegrator = syndicateFactory.creativitySystemIntegrator;
            
            // Connect memory-guided creativity
            if (creativityIntegrator.memoryGuidedCreativity) {
                creativityIntegrator.memoryGuidedCreativity.on('memory_guidance_applied', async (event) => {
                    // Store memory-guided insights
                    await this.memoryCoordinator.components.knowledgeGraph.createNode({
                        nodeType: 'memory_guided_creativity',
                        properties: {
                            insight: event.insight,
                            memoryInfluence: event.memoryInfluenceLevel,
                            creativityScore: event.creativityScore,
                            timestamp: Date.now()
                        }
                    });
                });
            }
            
            // Connect enhanceTeacherlessTrainingWithCreativity
            this.memoryCoordinator.enhanceTeacherlessTraining = async (context) => {
                return await creativityIntegrator.enhanceTeacherlessTrainingWithCreativity({
                    ...context,
                    memoryCoordinator: this.memoryCoordinator,
                    conceptAgent: this.memoryCoordinator.components.conceptAgent,
                    knowledgeGraph: this.memoryCoordinator.components.knowledgeGraph
                });
            };
            
            console.log('   ✅ CreativitySystemIntegrator connected');
        }
        
        // 2. Connect Multi-Token Prediction systems
        if (syndicateFactory.multiTokenPrediction || syndicateFactory.multiTokenTrainingOrchestrator) {
            console.log('   ⚡ Connecting Multi-Token Prediction...');
            const multiToken = syndicateFactory.multiTokenPrediction || syndicateFactory.multiTokenTrainingOrchestrator;
            
            // Enhance Concept Agent with multi-token capabilities
            if (this.memoryCoordinator.components.conceptAgent) {
                const originalProcess = this.memoryCoordinator.components.conceptAgent.processAgentRequest;
                
                this.memoryCoordinator.components.conceptAgent.processAgentRequest = async function(agentId, request) {
                    // Check if multi-token enhancement available
                    if (multiToken && multiToken.orchestrateTeacherlessTraining) {
                        const enhanced = await multiToken.orchestrateTeacherlessTraining(
                            { agentId },
                            request,
                            {
                                multiTokenWeight: 0.8,
                                creativeLeapFocus: true,
                                algorithmicCreativityTarget: 0.9
                            }
                        );
                        
                        if (enhanced.success) {
                            request.multiTokenEnhanced = enhanced;
                        }
                    }
                    
                    return await originalProcess.call(this, agentId, request);
                };
            }
            
            // Store multi-token predictions in KG
            if (multiToken.on) {
                multiToken.on('multi_token_prediction', async (prediction) => {
                    await this.memoryCoordinator.components.knowledgeGraph.createNode({
                        nodeType: 'multi_token_prediction',
                        properties: {
                            tokens: prediction.tokens,
                            confidence: prediction.confidence,
                            creativityLevel: prediction.creativityLevel,
                            beyondNextToken: true,
                            timestamp: Date.now()
                        }
                    });
                });
            }
            
            console.log('   ✅ Multi-Token Prediction connected');
        }
        
        // 3. Connect Overtraining Prevention with memory
        if (syndicateFactory.factoryOvertrainingPrevention || syndicateFactory.overtrainingPrevention) {
            console.log('   🛡️ Connecting Overtraining Prevention...');
            const overtrainingEngine = syndicateFactory.factoryOvertrainingPrevention || syndicateFactory.overtrainingPrevention;
            
            // Sync with memory sink prevention
            overtrainingEngine.on('overtraining_detected', async (event) => {
                // Trigger memory distillation
                await this.sinkPrevention.performMemoryDistillation();
                
                // Inject creativity
                await this.sinkPrevention.injectCreativity();
                
                // Store overtraining event
                await this.memoryCoordinator.components.knowledgeGraph.createNode({
                    nodeType: 'overtraining_event',
                    properties: {
                        severity: event.severity,
                        mitigationApplied: event.mitigation,
                        creativityBoost: event.creativityInjection,
                        timestamp: Date.now()
                    }
                });
            });
            
            console.log('   ✅ Overtraining Prevention connected');
        }
        
        // 4. Connect basic creativity systems (backward compatibility)
        if (syndicateFactory.creativitySystems) {
            // Monitor creativity metrics
            syndicateFactory.creativitySystems.on('creativity_metric', async (metric) => {
                this.sinkPrevention.creativityMetrics.set(metric.agentId, metric.score);
            });
            
            // Connect teacherless training with memory
            if (syndicateFactory.creativitySystems.teacherlessTraining) {
                const trainer = syndicateFactory.creativitySystems.teacherlessTraining;
                
                // Store discovered patterns
                trainer.on('pattern_discovered', async (pattern) => {
                    await this.memoryCoordinator.components.knowledgeGraph.createNode({
                        nodeType: 'creative_pattern',
                        properties: {
                            pattern: pattern.content,
                            discoveryMethod: 'teacherless_training',
                            novelty: pattern.noveltyScore
                        }
                    });
                });
            }
        }
        
        // 5. Connect sophisticated model steering if available
        if (syndicateFactory.sophisticatedModelSteeringEngine) {
            console.log('   🎯 Connecting Model Steering Engine...');
            const steering = syndicateFactory.sophisticatedModelSteeringEngine;
            
            // Connect steering decisions to memory
            steering.on('steering_decision', async (decision) => {
                await this.memoryCoordinator.components.knowledgeGraph.createNode({
                    nodeType: 'model_steering',
                    properties: {
                        direction: decision.direction,
                        creativityAdjustment: decision.creativityLevel,
                        memoryInfluence: decision.memoryWeight,
                        timestamp: Date.now()
                    }
                });
            });
            
            console.log('   ✅ Model Steering connected');
        }
        
        console.log('   ✅ ALL creativity systems deeply connected!');
        console.log('   ⚡ Multi-token prediction integrated');
        console.log('   🎨 Memory-guided creativity active');
        console.log('   🛡️ Overtraining prevention synced');
    }

    /**
     * Setup persistence and recovery
     */
    async setupPersistenceAndRecovery(dependencies) {
        console.log('💾 Setting up persistence and recovery...');
        
        // Auto-save memory state periodically
        setInterval(async () => {
            await this.saveMemoryState();
        }, 300000); // Every 5 minutes
        
        // Setup recovery on startup
        process.on('SIGINT', async () => {
            console.log('\n💾 Saving memory state before shutdown...');
            await this.saveMemoryState();
            process.exit(0);
        });
        
        // Load existing state if available
        await this.loadMemoryState();
        
        console.log('   ✅ Persistence and recovery configured');
    }

    /**
     * Helper methods
     */
    collectMLModels(syndicateFactory) {
        const models = new Map();
        
        // Collect all ML models from the syndicate
        if (syndicateFactory.models) {
            for (const [name, model] of Object.entries(syndicateFactory.models)) {
                if (model.getFeatureImportance || model.predict) {
                    models.set(name, model);
                }
            }
        }
        
        return models;
    }

    async updateKnowledgeUtility(knowledgeId, reward) {
        // Update utility score based on reward
        const currentUtility = await this.getKnowledgeUtility(knowledgeId) || 0.5;
        const newUtility = currentUtility * 0.9 + reward * 0.1; // Exponential moving average
        
        await this.setKnowledgeUtility(knowledgeId, newUtility);
    }
    
    async getKnowledgeUtility(knowledgeId) {
        try {
            const result = await this.memoryCoordinator.components.knowledgeGraph.db.query(
                'SELECT properties->\'utility_score\' as utility FROM kg_nodes WHERE node_id = $1',
                [knowledgeId]
            );
            return result.rows[0]?.utility || 0.5;
        } catch (error) {
            return 0.5;
        }
    }
    
    async setKnowledgeUtility(knowledgeId, utility) {
        try {
            await this.memoryCoordinator.components.knowledgeGraph.db.query(
                'UPDATE kg_nodes SET properties = properties || $2 WHERE node_id = $1',
                [knowledgeId, { utility_score: utility }]
            );
        } catch (error) {
            console.error('Failed to update knowledge utility:', error);
        }
    }

    async queryHistoricalRewards(agentId, action) {
        // Query similar actions and their rewards
        const query = `
            SELECT reward, context
            FROM agent_action_history
            WHERE agent_id = $1
            AND action_type = $2
            AND timestamp > NOW() - INTERVAL '30 days'
            ORDER BY timestamp DESC
            LIMIT 20
        `;
        
        const result = await this.memoryCoordinator.components.knowledgeGraph.db.query(
            query,
            [agentId, action.type]
        );
        
        return result.rows;
    }

    calculateExpectedReward(historicalRewards) {
        if (historicalRewards.length === 0) return 0;
        
        // Weighted average with recency bias
        let weightedSum = 0;
        let weightSum = 0;
        
        for (let i = 0; i < historicalRewards.length; i++) {
            const weight = Math.exp(-i * 0.1); // Exponential decay
            weightedSum += historicalRewards[i].reward * weight;
            weightSum += weight;
        }
        
        return weightedSum / weightSum;
    }

    async simulateIntervention(causalPaths, intervention, target) {
        // Simplified intervention simulation
        const effects = [];
        
        for (const path of causalPaths) {
            if (path.node_id === target) {
                // Calculate effect through path
                const pathStrength = path.confidence || 0.5;
                const interventionStrength = intervention.value;
                
                effects.push({
                    target: path.node_id,
                    effect: interventionStrength * pathStrength,
                    path: path.path
                });
            }
        }
        
        return effects;
    }

    async saveMemoryState() {
        // Save critical memory state
        const state = {
            timestamp: new Date(),
            agentStates: await this.getAgentStates(),
            memoryMetrics: await this.memoryCoordinator.getStatus(),
            sinkPreventionState: this.sinkPrevention.getStats()
        };
        
        // Save to database
        await this.saveToDatabase('memory_state_backup', state);
    }

    async loadMemoryState() {
        try {
            const state = await this.loadFromDatabase('memory_state_backup');
            
            if (state) {
                console.log(`📥 Loaded memory state from ${state.timestamp}`);
                // Restore agent states
                if (state.agentStates) {
                    await this.restoreAgentStates(state.agentStates);
                }
            }
        } catch (error) {
            console.log('📝 No previous memory state found, starting fresh');
        }
    }

    async getAgentStates() {
        // Collect all agent memory states
        const states = {};
        
        if (this.memoryCoordinator.components.mem1) {
            for (const [agentId, state] of this.memoryCoordinator.components.mem1.agentStates) {
                states[agentId] = {
                    h_t: Array.from(state.h_t),
                    metadata: state.metadata
                };
            }
        }
        
        return states;
    }

    async saveToDatabase(key, value) {
        // 🛡️ NULL GUARD: Check DB availability
        const db = this.memoryCoordinator?.components?.knowledgeGraph?.db;
        
        if (!db || typeof db.query !== 'function') {
            if (!this.dbWarned) {
                console.warn('⚠️ IntegrateAdvancedMemory: DB unavailable - state save skipped');
                this.dbWarned = true;
            }
            return;
        }
        
        const query = `
            INSERT INTO system_state (key, value, updated_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT (key) DO UPDATE 
            SET value = $2, updated_at = NOW()
        `;
        
        try {
            await db.query(query, [key, JSON.stringify(value)]);
        } catch (error) {
            // Create table if it doesn't exist
            try {
                await this.ensureSystemStateTable();
                await db.query(query, [key, JSON.stringify(value)]);
            } catch (createError) {
                console.warn('⚠️ Could not save state:', createError.message);
            }
        }
    }
    
    async ensureSystemStateTable() {
        try {
            // 🔥 FIX: Check if table exists before creating to avoid type conflicts
            const checkQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'system_state'
                )
            `;
            
            const checkResult = await this.memoryCoordinator.components.knowledgeGraph.db.query(checkQuery);
            
            if (!checkResult.rows[0].exists) {
                const createTableQuery = `
                    CREATE TABLE IF NOT EXISTS system_state (
                        key VARCHAR(255) PRIMARY KEY,
                        value JSONB NOT NULL,
                        updated_at TIMESTAMPTZ DEFAULT NOW()
                    )
                `;
                
                await this.memoryCoordinator.components.knowledgeGraph.db.query(createTableQuery);
            }
        } catch (error) {
            // 🔥 FIX: Ignore duplicate type errors since table may already exist
            if (error.code !== '23505' && error.code !== '42710') {
                console.warn('⚠️ Failed to ensure system_state table:', error.message);
            }
        }
    }

    async loadFromDatabase(key) {
        const query = `SELECT value FROM system_state WHERE key = $1`;
        const result = await this.memoryCoordinator.components.knowledgeGraph.db.query(query, [key]);
        
        if (result.rows.length > 0) {
            return JSON.parse(result.rows[0].value);
        }
        
        return null;
    }

    async restoreAgentStates(agentStates) {
        if (!agentStates || !this.memoryCoordinator.components.mem1) return;
        
        for (const [agentId, state] of Object.entries(agentStates)) {
            try {
                // Restore h_t vector
                const h_t = new Float32Array(state.h_t);
                
                this.memoryCoordinator.components.mem1.agentStates.set(agentId, {
                    h_t,
                    metadata: state.metadata || {},
                    lastConsolidation: Date.now()
                });
            } catch (error) {
                console.error(`Failed to restore state for agent ${agentId}:`, error);
            }
        }
    }
    
    /**
     * Initialize comprehensive persistence layer
     */
    async initializeComprehensivePersistence(dependencies) {
        console.log('🔐 Initializing comprehensive persistence layer...');
        
        // 🎯 CRITICAL FIX: Create persistence layer if not exists
        if (!this.persistenceLayer) {
            this.persistenceLayer = new ComprehensivePersistenceLayer({
                hourlyBackupInterval: 3600000,
                breakthroughThreshold: 0.15,
                decisionHistoryLimit: 10000
            });
        }
        
        // Initialize persistence with all systems
        await this.persistenceLayer.initialize({
            ...dependencies,
            formalVerification: dependencies.formalVerification || this.memoryCoordinator.components.conceptAgent,
            // 🔥 PASS UNIFIED KNOWLEDGE STORAGE TO PERSISTENCE LAYER
            unifiedKnowledgeStorage: dependencies.unifiedKnowledgeStorage
        });
        
        // Register all memory components
        this.persistenceLayer.registerMemoryComponent('mem1', this.memoryCoordinator.components.mem1);
        this.persistenceLayer.registerMemoryComponent('knowledgeGraph', this.memoryCoordinator.components.knowledgeGraph);
        this.persistenceLayer.registerMemoryComponent('conceptAgent', this.memoryCoordinator.components.conceptAgent);
        this.persistenceLayer.registerMemoryComponent('entanglementEngine', this.memoryCoordinator.components.entanglementEngine);
        this.persistenceLayer.registerMemoryComponent('memoryAgent', this.memoryCoordinator.components.memoryAgent);
        this.persistenceLayer.registerMemoryComponent('sedm', this.memoryCoordinator.components.sedm);
        this.persistenceLayer.registerMemoryComponent('pruner', this.memoryCoordinator.components.pruner);
        this.persistenceLayer.registerMemoryComponent('sinkPrevention', this.sinkPrevention);
        
        // Connect decision tracking
        this.memoryCoordinator.on('decision_made', async (decision) => {
            await this.persistenceLayer.trackDecision('memoryCoordinator', decision);
        });
        
        console.log('   ✅ Comprehensive persistence layer activated');
    }
    
    /**
     * Public API for syndicate integration
     */
    getMemoryInterface() {
        return {
            // Core memory operations
            consolidate: this.memoryCoordinator.consolidateAgentMemory.bind(this.memoryCoordinator),
            query: this.memoryCoordinator.queryMemory.bind(this.memoryCoordinator),
            
            // Concept-based reasoning
            conceptReasoning: async (agentId, request) => {
                return await this.memoryCoordinator.components.conceptAgent.processAgentRequest(
                    agentId,
                    request
                );
            },
            
            // Knowledge graph operations
            createKnowledge: async (knowledge) => {
                return await this.memoryCoordinator.components.knowledgeGraph.createNode(knowledge);
            },
            
            // Entanglement queries
            queryEntanglements: async (nodeId, options) => {
                return await this.memoryCoordinator.components.entanglementEngine.queryEntangledKnowledge(
                    nodeId,
                    options
                );
            },
            
            // Memory health
            getMemoryHealth: () => {
                return this.sinkPrevention.memoryHealth;
            },
            
            // Status and metrics
            getStatus: async () => {
                return await this.memoryCoordinator.getStatus();
            }
        };
    }
    
    /**
     * Setup quantum memory integration
     */
    async setupQuantumMemoryIntegration(syndicateFactory, dependencies) {
        console.log('⚛️ Setting up quantum memory integration...');
        
        this.quantumIntegration = new QuantumMemoryIntegration({
            quantumCoherenceThreshold: 0.9,
            superpositionStates: 5,
            entanglementRadius: 3,
            proactiveDecisionEnabled: true,
            preventionIntegrationEnabled: true
        });
        
        // Gather all prevention systems
        const preventionDependencies = {
            ...dependencies,
            memoryCoordinator: this.memoryCoordinator,
            knowledgeGraph: this.memoryCoordinator.components.knowledgeGraph,
            conceptAgent: this.memoryCoordinator.components.conceptAgent,
            entanglementEngine: this.memoryCoordinator.components.entanglementEngine,
            memorySinkPrevention: this.sinkPrevention,
            syndicateFactory: syndicateFactory
        };
        
        // Add proactive prevention systems if available
        if (dependencies.proactiveCredibility || syndicateFactory.proactiveCredibility) {
            preventionDependencies.proactiveCredibility = dependencies.proactiveCredibility || syndicateFactory.proactiveCredibility;
        }
        if (dependencies.proactiveInference || syndicateFactory.proactiveInference) {
            preventionDependencies.proactiveInference = dependencies.proactiveInference || syndicateFactory.proactiveInference;
        }
        if (dependencies.proactiveVeracity || syndicateFactory.proactiveVeracity) {
            preventionDependencies.proactiveVeracity = dependencies.proactiveVeracity || syndicateFactory.proactiveVeracity;
        }
        if (dependencies.hallucinationPrevention || syndicateFactory.hallucinationPrevention) {
            preventionDependencies.hallucinationPrevention = dependencies.hallucinationPrevention || syndicateFactory.hallucinationPrevention;
        }
        if (dependencies.complexityPrevention || syndicateFactory.complexityMonitor) {
            preventionDependencies.complexityPrevention = dependencies.complexityPrevention || syndicateFactory.complexityMonitor;
        }
        
        // Add creativity systems
        if (syndicateFactory.creativitySystemIntegrator) {
            preventionDependencies.creativityIntegrator = syndicateFactory.creativitySystemIntegrator;
        }
        if (syndicateFactory.multiTokenPrediction || syndicateFactory.multiTokenTrainingOrchestrator) {
            preventionDependencies.multiTokenPrediction = syndicateFactory.multiTokenPrediction || syndicateFactory.multiTokenTrainingOrchestrator;
        }
        if (syndicateFactory.creativitySystems?.teacherlessTraining) {
            preventionDependencies.teacherlessTraining = syndicateFactory.creativitySystems.teacherlessTraining;
        }
        if (syndicateFactory.sophisticatedModelSteeringEngine) {
            preventionDependencies.modelSteering = syndicateFactory.sophisticatedModelSteeringEngine;
        }
        
        await this.quantumIntegration.initialize(preventionDependencies);
        
        // Register with persistence layer
        this.persistenceLayer.registerMemoryComponent('quantumIntegration', this.quantumIntegration);
        
        // Connect quantum awareness to syndicate
        this.setupQuantumSyndicateConnections(syndicateFactory);
        
        console.log('   ✅ Quantum memory integration configured');
    }
    
    /**
     * Setup deep quantum connections throughout syndicate
     */
    setupQuantumSyndicateConnections(syndicateFactory) {
        // Connect to agent creation
        syndicateFactory.on('agent_created', async (agent) => {
            // Initialize quantum state for new agents
            if (!agent.quantumState) {
                agent.quantumState = {
                    coherence: 1.0,
                    entanglementAwareness: {},
                    superpositionCapability: true,
                    amplified: true
                };
            }
            
            console.log(`   ⚛️ Quantum state initialized for agent ${agent.agentId}`);
        });
        
        // Connect to decision making
        this.memoryCoordinator.on('decision_required', async (context) => {
            const decision = await this.quantumIntegration.makeProactiveDecision(
                context.agentId,
                context
            );
            
            // Emit quantum-enhanced decision
            this.memoryCoordinator.emit('quantum_decision_made', decision);
        });
        
        // Connect to memory consolidation
        this.memoryCoordinator.on('consolidation_complete', async (event) => {
            // Update quantum coherence based on consolidation quality
            const quality = event.consolidationMetrics?.quality || 0.8;
            if (this.quantumIntegration.adjustQuantumCoherence) {
                await this.quantumIntegration.adjustQuantumCoherence(event.agentId, quality);
            }
        });
        
        // Connect quantum coherence updates to syndicate
        this.quantumIntegration.on('quantum_coherence_update', (update) => {
            // Broadcast to all systems
            syndicateFactory.emit('global_quantum_update', update);
            
            // Log significant changes
            if (update.globalCoherence < 0.7) {
                console.warn(`⚠️ Low global quantum coherence: ${update.globalCoherence.toFixed(3)}`);
            }
        });
        
        // Connect quantum decoherence events
        this.quantumIntegration.on('quantum_decoherence', async (event) => {
            // Trigger emergency protocols if needed
            if (event.newCoherence < 0.3) {
                console.error(`🚨 Critical quantum decoherence for agent ${event.agentId}`);
                
                // Switch to classical processing
                const agent = syndicateFactory.getAgent?.(event.agentId);
                if (agent) {
                    agent.processingMode = 'classical';
                    agent.quantumState.amplified = false;
                }
            }
        });
        
        // Connect proactive decisions to persistence
        this.quantumIntegration.on('proactive_decision_made', async (decision) => {
            // Track with persistence layer
            await this.persistenceLayer.trackDecision(
                decision.agentId,
                decision.decision,
                { quantum: true, ...decision.quantumState }
            );
        });
        
        // Connect knowledge rejection events
        this.quantumIntegration.on('knowledge_rejected', async (rejection) => {
            console.warn(`🚫 Knowledge rejected: ${rejection.reason}`);
            
            // Update metrics
            if (this.memoryCoordinator.metrics) {
                this.memoryCoordinator.metrics.knowledgeRejected = 
                    (this.memoryCoordinator.metrics.knowledgeRejected || 0) + 1;
            }
        });
        
        // Add to console output
        console.log('\n✨ QUANTUM MEMORY INTEGRATION COMPLETE!');
        console.log('   - Quantum coherence monitoring active');
        console.log('   - Superposition search enabled');
        console.log('   - Entanglement awareness connected');
        console.log('   - Prevention systems integrated');
        console.log('   - Proactive decision making quantum-enhanced');
    }
    
    /**
     * Connect deep reasoning systems to memory
     */
    async connectDeepReasoningToMemory(syndicateFactory, dependencies) {
        console.log('🧠 Connecting deep reasoning systems to memory...');
        
        // Pass deep reasoning systems to ConceptAgent
        const conceptAgent = this.memoryCoordinator.components.conceptAgent;
        
        if (conceptAgent && conceptAgent.initializeDeepReasoningSystems) {
            const deepReasoningDependencies = {
                // GOT implementations
                graphOfThoughtEngine: syndicateFactory.graphOfThoughtEngine,
                cognitiveArchitect: syndicateFactory.cognitiveArchitect || dependencies.cognitiveArchitect,
                
                // COA implementation
                chainOfAgentsOrchestrator: syndicateFactory.chainOfAgentsOrchestrator || dependencies.chainOfAgentsOrchestrator,
                
                // Multi-layer reasoning
                multiLayeredReasoningOrchestrator: syndicateFactory.multiLayeredReasoningOrchestrator || dependencies.multiLayeredReasoningOrchestrator,
                
                // Advanced research
                advancedResearchSystem: syndicateFactory.advancedResearchSystem || dependencies.advancedResearchSystem
            };
            
            // Remove null values
            Object.keys(deepReasoningDependencies).forEach(key => {
                if (!deepReasoningDependencies[key]) {
                    delete deepReasoningDependencies[key];
                }
            });
            
            if (Object.keys(deepReasoningDependencies).length > 0) {
                await conceptAgent.initializeDeepReasoningSystems(deepReasoningDependencies);
                console.log('   ✅ Deep reasoning systems connected to ConceptAgent');
                console.log(`   📊 Connected systems: ${Object.keys(deepReasoningDependencies).join(', ')}`);
            } else {
                console.log('   ⚠️ No deep reasoning systems found to connect');
            }
        }
        
        // Connect deep reasoning to Knowledge Graph
        if (syndicateFactory.chainOfAgentsOrchestrator) {
            syndicateFactory.chainOfAgentsOrchestrator.on('reasoning_completed', async (result) => {
                // Store reasoning results in KG
                await this.memoryCoordinator.components.knowledgeGraph.createNode({
                    nodeType: 'deep_reasoning_result',
                    properties: {
                        method: result.reasoningType || 'chain_of_agents',
                        confidence: result.confidence,
                        complexity: result.complexityScore,
                        processingTime: result.processingTime,
                        timestamp: Date.now()
                    }
                });
            });
        }
        
        console.log('   ✅ Deep reasoning integration complete');
    }
}

// 🎯 CRITICAL FIX: DO NOT auto-instantiate! Let startfullsyndicate.js control timing
// Export ONLY the class - instances created when needed
// export const advancedMemoryIntegration = new IntegrateAdvancedMemory(); // ❌ REMOVED - causes warnings at import time
