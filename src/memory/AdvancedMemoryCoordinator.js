/**
 * 🧠 ADVANCED MEMORY COORDINATOR
 * ==============================
 * 
 * Master orchestrator that integrates MEM1, Knowledge Graph, Large Concept Models,
 * and Quantum Entanglements with the existing AI Syndicate systems.
 * 
 * Provides:
 * - Unified memory interface for all agents
 * - Deep system integration
 * - Memory sink prevention
 * - Performance optimization
 */

import { EventEmitter } from 'events';
import { MEM1Framework } from './MEM1Framework.js';
import { MemoryAgent } from './MemoryAgent.js';
import { KnowledgeGraph } from './KnowledgeGraph.js';
import { ConceptAgent } from './ConceptAgent.js';
import { QuantumEntanglementEngine } from './QuantumEntanglementEngine.js';
import { DynamicKGPruner } from './DynamicKGPruner.js';
import { SEDMVerifiableMemory } from './SEDMVerifiableMemory.js';

export class AdvancedMemoryCoordinator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableMEM1: config.enableMEM1 ?? true,
            enableKnowledgeGraph: config.enableKnowledgeGraph ?? true,
            enableConceptAgent: config.enableConceptAgent ?? true,
            enableQuantumEntanglements: config.enableQuantumEntanglements ?? true,
            enableSEDM: config.enableSEDM ?? true,
            memorySinkPrevention: config.memorySinkPrevention ?? true,
            pruningEnabled: config.pruningEnabled ?? true,
            maxMemoryPerAgent: config.maxMemoryPerAgent || 1024 * 1024, // 1MB
            ...config
        };
        
        // Core components
        this.components = {
            mem1: null,
            memoryAgent: null,
            knowledgeGraph: null,
            conceptAgent: null,
            entanglementEngine: null,
            pruner: null,
            sedm: null
        };
        
        // Connected systems
        this.connectedSystems = new Map();
        
        // 🔥 KG INTEGRATION - FULL SUPPORT!
        this.knowledgeGraph = null;  // Direct reference for easy access
        this.unifiedKnowledgeStorage = null;
        this.eliteMemoryPersistence = null;
        
        // Metrics
        this.metrics = {
            totalMemoryUsed: 0,
            agentCount: 0,
            conceptsProcessed: 0,
            entanglementsDiscovered: 0,
            pruningOperations: 0,
            hallucinationsPrevented: 0
        };
        
        this.initialized = false;
    }

    /**
     * Initialize the complete advanced memory system
     */
    async initialize(dependencies) {
        console.log('🧠 Initializing Advanced Memory Coordinator...');
        console.log('=====================================');
        
        try {
            // 1. Initialize MEM1 Framework
            if (this.config.enableMEM1) {
                await this.initializeMEM1(dependencies);
            }
            
            // 2. Initialize Knowledge Graph
            if (this.config.enableKnowledgeGraph) {
                await this.initializeKnowledgeGraph(dependencies);
            }
            
            // 3. Initialize Memory Agent (requires KG)
            if (this.config.enableKnowledgeGraph) {
                await this.initializeMemoryAgent(dependencies);
            }
            
            // 4. Initialize Concept Agent (LCM)
            if (this.config.enableConceptAgent) {
                await this.initializeConceptAgent(dependencies);
            }
            
            // 5. Initialize Quantum Entanglement Engine
            if (this.config.enableQuantumEntanglements) {
                await this.initializeQuantumEntanglements(dependencies);
            }
            
            // 6. Initialize SEDM if enabled
            if (this.config.enableSEDM) {
                await this.initializeSEDM(dependencies);
            }
            
            // 7. Initialize Pruning System
            if (this.config.pruningEnabled) {
                await this.initializePruner(dependencies);
            }
            
            // 8. Connect to existing systems
            await this.connectExistingSystems(dependencies);
            
            // 9. Setup cross-component communication
            await this.setupCrossComponentCommunication();
            
            // 10. Start monitoring
            this.startMemoryMonitoring();
            
            this.initialized = true;
            console.log('✅ Advanced Memory Coordinator fully initialized!');
            console.log('   - MEM1: Constant memory consolidation active');
            console.log('   - Knowledge Graph: Structured persistence ready');
            console.log('   - Concept Agent: LCM orchestration online');
            console.log('   - Quantum Entanglements: Non-local correlations enabled');
            console.log('   - Memory Sink Prevention: Active');
            console.log('=====================================\n');
            
            // Emit initialization complete
            this.emit('memory_system_ready', {
                components: Object.keys(this.components).filter(k => this.components[k] !== null),
                connectedSystems: Array.from(this.connectedSystems.keys())
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Memory initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize MEM1 Framework
     */
    async initializeMEM1(dependencies) {
        console.log('📦 Initializing MEM1 Framework...');
        
        this.components.mem1 = new MEM1Framework({
            stateSize: 512,
            consolidationThreshold: 0.7,
            maxMemorySize: this.config.maxMemoryPerAgent
        });
        
        await this.components.mem1.initialize({
            memoryAgent: this.components.memoryAgent,
            embeddingModel: dependencies.embeddingService,
            database: dependencies.database
        });
        
        // Setup MEM1 event handlers
        this.components.mem1.on('ready_for_extraction', async (extractionPackage) => {
            if (this.components.memoryAgent) {
                await this.components.memoryAgent.processConsolidatedStates([extractionPackage]);
            }
        });
        
        this.components.mem1.on('information_discarded', (data) => {
            this.emit('mem1_discard', data);
        });
    }

    /**
     * Initialize Knowledge Graph
     */
    async initializeKnowledgeGraph(dependencies) {
        console.log('📊 Initializing Knowledge Graph...');
        
        // 🔥 FIX: Pass database in constructor for proper persistence!
        this.components.knowledgeGraph = new KnowledgeGraph({
            pruningEnabled: this.config.pruningEnabled,
            kSafetyValue: 10000,
            entanglementThreshold: 0.7,
            db: dependencies.database,  // CRITICAL: Pass DB in constructor!
            database: dependencies.database  // Some components use 'database' key
        });
        
        await this.components.knowledgeGraph.initialize({
            database: dependencies.database,
            embeddingService: dependencies.embeddingService,
            unifiedKnowledgeStorage: dependencies.unifiedKnowledgeStorage,
            eliteMemoryPersistence: dependencies.eliteMemoryPersistence
        });
        
        // 🔥 SET DIRECT REFERENCES FOR KG INTEGRATION!
        this.knowledgeGraph = this.components.knowledgeGraph;
        this.unifiedKnowledgeStorage = dependencies.unifiedKnowledgeStorage;
        this.eliteMemoryPersistence = dependencies.eliteMemoryPersistence;
        
        // Setup KG event handlers
        this.components.knowledgeGraph.on('pruning_feedback', async (feedback) => {
            if (this.components.mem1) {
                await this.components.mem1.updatePolicyFromFeedback(feedback);
            }
        });
    }

    /**
     * Initialize Memory Agent
     */
    async initializeMemoryAgent(dependencies) {
        console.log('🧠 Initializing Memory Agent...');
        
        this.components.memoryAgent = new MemoryAgent({
            microBatchSize: 5,
            validationEnabled: true,
            extractionModel: dependencies.config?.llmModel || 'gpt-4'
        });
        
        await this.components.memoryAgent.initialize({
            database: dependencies.database,
            llmService: dependencies.llmService,
            embeddingService: dependencies.embeddingService,
            ragService: dependencies.ragService,
            knowledgeGraph: this.components.knowledgeGraph
        });
    }

    /**
     * Initialize Concept Agent (LCM)
     */
    async initializeConceptAgent(dependencies) {
        console.log('🎯 Initializing Concept Agent (LCM)...');
        
        this.components.conceptAgent = new ConceptAgent({
            embeddingDim: 768,
            architecture: 'diffusion',
            hierarchicalReasoning: true,
            explainabilityEnabled: true
        });
        
        await this.components.conceptAgent.initialize({
            knowledgeGraph: this.components.knowledgeGraph,
            memoryAgent: this.components.memoryAgent,
            llmService: dependencies.llmService,
            embeddingService: dependencies.embeddingService
        });
        
        // Setup concept processing
        this.components.conceptAgent.on('request_processed', (response) => {
            this.metrics.conceptsProcessed++;
            this.emit('concept_processed', response);
        });
    }

    /**
     * Initialize Quantum Entanglement Engine
     */
    async initializeQuantumEntanglements(dependencies) {
        console.log('🌌 Initializing Quantum Entanglement Engine...');
        
        this.components.entanglementEngine = new QuantumEntanglementEngine({
            entanglementThreshold: 0.7,
            scanInterval: 300000, // 5 minutes
            correlationMethods: [
                'trajectory_cooccurrence',
                'predictive_features',
                'agent_activation',
                'temporal_correlation',
                'causal_chain'
            ]
        });
        
        await this.components.entanglementEngine.initialize({
            knowledgeGraph: this.components.knowledgeGraph,
            provenanceSystem: dependencies.provenanceSystem,
            mlModels: dependencies.mlModels,
            database: dependencies.database,
            unifiedKnowledgeStorage: this.unifiedKnowledgeStorage,
            eliteMemoryPersistence: this.eliteMemoryPersistence
        });
        
        this.components.entanglementEngine.on('entanglement_created', (data) => {
            this.metrics.entanglementsDiscovered++;
            this.emit('quantum_entanglement', data);
        });
    }

    /**
     * Initialize SEDM Verifiable Memory
     */
    async initializeSEDM(dependencies) {
        console.log('✅ Initializing SEDM Verifiable Memory...');
        
        this.components.sedm = new SEDMVerifiableMemory({
            utilityThreshold: 0.3,
            verificationEnabled: true
        });
        
        await this.components.sedm.initialize({
            knowledgeGraph: this.components.knowledgeGraph,
            simulationEngine: dependencies.worldModel,
            database: dependencies.database,
            unifiedKnowledgeStorage: this.unifiedKnowledgeStorage,
            eliteMemoryPersistence: this.eliteMemoryPersistence
        });
    }

    /**
     * Initialize Dynamic Pruner
     */
    async initializePruner(dependencies) {
        console.log('🧹 Initializing Dynamic KG Pruner...');
        
        this.components.pruner = new DynamicKGPruner({
            knowledgeSafetyK: 10000,
            pruningStrategies: ['LOW_DEGREE', 'TEMPORAL_DECAY', 'CONFIDENCE_BASED', 'K_GUARANTEE']
        });
        
        await this.components.pruner.initialize({
            knowledgeGraph: this.components.knowledgeGraph,
            database: dependencies.database,
            s3: dependencies.archiveStorage,
            unifiedKnowledgeStorage: this.unifiedKnowledgeStorage,
            eliteMemoryPersistence: this.eliteMemoryPersistence
        });
    }

    /**
     * Connect to existing syndicate systems
     */
    async connectExistingSystems(dependencies) {
        console.log('🔗 Connecting to existing systems...');
        
        // Connect AlphaGo System
        if (dependencies.alphaGoSystem) {
            await this.connectAlphaGo(dependencies.alphaGoSystem);
        }
        
        // Connect AlphaFold System
        if (dependencies.alphaFoldSystem) {
            await this.connectAlphaFold(dependencies.alphaFoldSystem);
        }
        
        // Connect AlphaGnome System
        if (dependencies.alphaGnomeSystem) {
            await this.connectAlphaGnome(dependencies.alphaGnomeSystem);
        }
        
        // Connect World Model
        if (dependencies.worldModel) {
            await this.connectWorldModel(dependencies.worldModel);
        }
        
        // Connect RL/MDP Systems
        if (dependencies.eliteMDPFramework) {
            await this.connectRLSystems(dependencies.eliteMDPFramework);
        }
        
        // Connect Formal Verification
        if (dependencies.formalVerification) {
            await this.connectFormalVerification(dependencies.formalVerification);
        }
        
        // Connect Creativity Systems
        if (dependencies.creativitySystems) {
            await this.connectCreativitySystems(dependencies.creativitySystems);
        }
        
        console.log(`✅ Connected to ${this.connectedSystems.size} existing systems`);
    }

    /**
     * Connect AlphaGo strategic reasoning
     */
    async connectAlphaGo(alphaGoSystem) {
        this.connectedSystems.set('alphago', alphaGoSystem);
        
        // Map strategic concepts to memory
        alphaGoSystem.on('strategy_evaluated', async (strategy) => {
            // Store in concept space
            if (this.components.conceptAgent) {
                await this.components.conceptAgent.processAgentRequest('alphago', {
                    input: {
                        strategy: {
                            type: strategy.type,
                            value: strategy.valueFunction,
                            context: strategy.gameState
                        }
                    },
                    goal: 'store_strategic_concept'
                });
            }
            
            // Create KG node for strategy
            if (this.components.knowledgeGraph) {
                const node = await this.components.knowledgeGraph.createNode({
                    nodeType: 'strategic_concept',
                    properties: {
                        strategyType: strategy.type,
                        valueScore: strategy.valueFunction,
                        gamePhase: strategy.gamePhase,
                        source: 'alphago'
                    }
                });
                
                // Store node reference for entanglement analysis
                strategy.kgNodeId = node.node_id;
            }
        });
        
        console.log('   ✅ AlphaGo connected - Strategic concepts mapped');
    }

    /**
     * Connect AlphaFold protein knowledge
     */
    async connectAlphaFold(alphaFoldSystem) {
        this.connectedSystems.set('alphafold', alphaFoldSystem);
        
        alphaFoldSystem.on('structure_completed', async (result) => {
            // Only store high-confidence structures
            if (result.confidence.pTM < 0.7) return;
            
            // Create protein node in KG
            if (this.components.knowledgeGraph) {
                const proteinNode = await this.components.knowledgeGraph.createNode({
                    nodeType: 'protein',
                    properties: {
                        proteinId: result.proteinId,
                        name: result.name,
                        pTM_score: result.confidence.pTM,
                        ipTM_score: result.confidence.ipTM,
                        source: 'alphafold'
                    },
                    confidence: result.confidence.pTM
                });
                
                // Create interaction relationships
                for (const interaction of result.interactions || []) {
                    if (interaction.confidence > 0.8) {
                        await this.components.knowledgeGraph.createRelationship({
                            source: proteinNode.node_id,
                            target: interaction.partnerId,
                            type: 'INTERACTS_WITH',
                            properties: {
                                interactionType: interaction.type,
                                confidence: interaction.confidence
                            }
                        });
                    }
                }
            }
        });
        
        console.log('   ✅ AlphaFold connected - Protein structures integrated');
    }

    /**
     * Connect AlphaGnome genomic insights
     */
    async connectAlphaGnome(alphaGnomeSystem) {
        this.connectedSystems.set('alphagnome', alphaGnomeSystem);
        
        alphaGnomeSystem.on('variant_analyzed', async (analysis) => {
            if (this.components.knowledgeGraph) {
                // Create variant node
                const variantNode = await this.components.knowledgeGraph.createNode({
                    nodeType: 'genomic_variant',
                    properties: {
                        variantId: analysis.variantId,
                        chromosome: analysis.location.chromosome,
                        position: analysis.location.position,
                        effectScore: analysis.effectScore,
                        source: 'alphagnome'
                    }
                });
                
                // Link to affected genes
                for (const gene of analysis.affectedGenes || []) {
                    await this.components.knowledgeGraph.createRelationship({
                        source: variantNode.node_id,
                        target: gene.geneId,
                        type: 'AFFECTS',
                        properties: {
                            effect: gene.effect,
                            score: gene.effectScore
                        }
                    });
                }
            }
        });
        
        console.log('   ✅ AlphaGnome connected - Genomic insights integrated');
    }

    /**
     * Connect World Model for causal understanding
     */
    async connectWorldModel(worldModel) {
        // 🔥 WORLDMODEL CHECK - GRACEFUL HANDLING!
        if (!worldModel) {
            console.warn('⚠️ No worldModel provided to AdvancedMemoryCoordinator');
            return;
        }
        
        this.connectedSystems.set('worldModel', worldModel);
        
        // 🔥 KG INTEGRATION - CONNECT IF AVAILABLE!
        if (this.knowledgeGraph && !worldModel.knowledgeGraph) {
            worldModel.knowledgeGraph = this.knowledgeGraph;
            console.log('   🔥 Connected KnowledgeGraph to WorldModel');
        }
        
        // Enable KG routing if available
        if (this.unifiedKnowledgeStorage && worldModel.setUnifiedStorage) {
            worldModel.setUnifiedStorage(this.unifiedKnowledgeStorage);
            console.log('   🔥 Connected UnifiedKnowledgeStorage to WorldModel');
        }
        
        // Integrate causal discoveries if worldModel is EventEmitter
        if (worldModel.on && typeof worldModel.on === 'function') {
            worldModel.on('causal_link_discovered', async (link) => {
                if (this.components.knowledgeGraph) {
                    await this.components.knowledgeGraph.createRelationship({
                        source: link.cause,
                        target: link.effect,
                        type: 'CAUSES',
                        properties: {
                            mechanism: link.mechanism,
                            strength: link.strength,
                            evidence: link.evidence,
                            discoveredBy: 'world_model'
                        },
                        confidence: link.confidence
                    });
                }
                
                // 🔥 STORE CAUSAL DISCOVERY TO KG!
                if (this.unifiedKnowledgeStorage) {
                    await this.unifiedKnowledgeStorage.storeKnowledge({
                        type: 'causal_discovery',
                        cause: link.cause,
                        effect: link.effect,
                        mechanism: link.mechanism,
                        evidence: link.evidence
                    }, {
                        agentId: 'WorldModel',
                        type: 'causal_link',
                        confidence: link.confidence || 0.7
                    });
                }
            });
            console.log('   ✅ World Model event handlers connected');
        } else {
            console.log('   ⚠️ World Model does not support event emissions');
        }
        
        // Use for SEDM verification
        if (this.components.sedm && this.components.sedm.setSimulationEngine) {
            this.components.sedm.setSimulationEngine(worldModel);
        } else if (this.components.sedm) {
            console.log('   ⚠️ SEDM does not have setSimulationEngine method (legacy version?)');
        }
        
        // 🔥 STORE WORLDMODEL CONNECTION EVENT
        if (this.eliteMemoryPersistence) {
            await this.eliteMemoryPersistence.storeMemory(
                'worldmodel_connected',
                {
                    worldModelType: worldModel.constructor?.name || 'Unknown',
                    hasEventEmitter: !!(worldModel.on && typeof worldModel.on === 'function'),
                    timestamp: Date.now()
                },
                {
                    storeToKG: true,
                    agentId: 'MemoryCoordinator',
                    confidence: 0.9
                }
            );
        }
        
        console.log('   ✅ World Model connected - Causal reasoning integrated');
    }

    /**
     * Connect RL/MDP systems
     */
    async connectRLSystems(mdpFramework) {
        this.connectedSystems.set('mdp', mdpFramework);
        
        // Store learned policies
        mdpFramework.on('policy_updated', async (policyData) => {
            if (this.components.knowledgeGraph) {
                const policyNode = await this.components.knowledgeGraph.createNode({
                    nodeType: 'rl_policy',
                    properties: {
                        policyId: policyData.id,
                        algorithm: policyData.algorithm,
                        performance: policyData.performance,
                        version: policyData.version
                    }
                });
                
                // Link to relevant states
                for (const state of policyData.keyStates || []) {
                    await this.components.knowledgeGraph.createRelationship({
                        source: policyNode.node_id,
                        target: state.stateId,
                        type: 'OPTIMIZES_FOR',
                        properties: {
                            value: state.value,
                            visits: state.visitCount
                        }
                    });
                }
            }
        });
        
        console.log('   ✅ RL/MDP connected - Policies and trajectories tracked');
    }

    /**
     * Setup cross-component communication
     */
    async setupCrossComponentCommunication() {
        // MEM1 → Memory Agent flow
        if (this.components.mem1 && this.components.memoryAgent) {
            this.components.mem1.memoryAgent = this.components.memoryAgent;
        }
        
        // Knowledge Graph → Entanglement Engine
        if (this.components.knowledgeGraph && this.components.entanglementEngine) {
            this.components.knowledgeGraph.on('relationship_created', (rel) => {
                this.components.entanglementEngine.emit('potential_correlation', rel);
            });
        }
        
        // Concept Agent → All systems
        if (this.components.conceptAgent) {
            // Connect to existing systems
            this.components.conceptAgent.alphaGoSystem = this.connectedSystems.get('alphago');
            this.components.conceptAgent.alphaFoldSystem = this.connectedSystems.get('alphafold');
            this.components.conceptAgent.worldModel = this.connectedSystems.get('worldModel');
        }
        
        // Pruning feedback loop
        if (this.components.pruner && this.components.mem1) {
            this.components.pruner.on('knowledge_pruned', async (prunedData) => {
                await this.components.mem1.updatePolicyFromFeedback({
                    prunedKnowledge: prunedData,
                    reason: 'low_utility',
                    utilityScore: 0.1
                });
            });
        }
    }

    /**
     * Unified interface for agent memory operations
     */
    async consolidateAgentMemory(agentId, observation, context = {}) {
        if (!this.components.mem1) {
            throw new Error('MEM1 not initialized');
        }
        
        // Perform MEM1 consolidation
        const result = await this.components.mem1.consolidate(agentId, observation, context);
        
        // Track metrics
        this.updateMemoryMetrics(agentId);
        
        return result;
    }

    /**
     * Query integrated memory system
     */
    async queryMemory(query, options = {}) {
        const results = {
            concepts: null,
            knowledge: null,
            entanglements: null
        };
        
        // Query through Concept Agent for semantic understanding
        if (this.components.conceptAgent && options.includeConceptual !== false) {
            results.concepts = await this.components.conceptAgent.processAgentRequest(
                'query',
                {
                    input: { text: query },
                    goal: 'information_retrieval'
                }
            );
        }
        
        // Query Knowledge Graph for structured facts
        if (this.components.knowledgeGraph && options.includeStructured !== false) {
            const embedding = await this.getQueryEmbedding(query);
            results.knowledge = await this.components.knowledgeGraph.searchByEmbedding(
                embedding,
                { threshold: 0.6, limit: 20 }
            );
        }
        
        // Query entanglements for cross-domain insights
        if (this.components.entanglementEngine && options.includeEntanglements !== false) {
            const startNode = results.knowledge?.[0]?.node_id;
            if (startNode) {
                results.entanglements = await this.components.entanglementEngine.queryEntangledKnowledge(
                    startNode,
                    { crossDomainOnly: true }
                );
            }
        }
        
        return results;
    }

    /**
     * Prevent memory sinks and overtraining
     */
    startMemoryMonitoring() {
        setInterval(async () => {
            // Check total memory usage
            const stats = this.calculateMemoryStats();
            
            if (stats.totalMemoryUsed > this.config.maxTotalMemory) {
                console.warn('⚠️ Memory threshold exceeded, triggering emergency pruning');
                await this.emergencyPruning();
            }
            
            // Check for memory sinks (agents with excessive memory)
            for (const [agentId, usage] of stats.agentMemoryUsage) {
                if (usage > this.config.maxMemoryPerAgent * 1.5) {
                    console.warn(`⚠️ Agent ${agentId} exceeding memory limits`);
                    await this.compactAgentMemory(agentId);
                }
            }
            
            // Update metrics
            this.metrics.totalMemoryUsed = stats.totalMemoryUsed;
            this.metrics.agentCount = stats.agentCount;
            
            this.emit('memory_stats', stats);
            
        }, 60000); // Every minute
    }

    /**
     * Calculate current memory statistics
     */
    calculateMemoryStats() {
        const stats = {
            totalMemoryUsed: 0,
            agentCount: 0,
            agentMemoryUsage: new Map(),
            componentStats: {}
        };
        
        // MEM1 memory usage
        if (this.components.mem1) {
            const mem1Stats = this.components.mem1.getMemoryStats();
            stats.componentStats.mem1 = mem1Stats;
            stats.totalMemoryUsed += mem1Stats.totalMemoryUsed;
            stats.agentCount = mem1Stats.totalAgents;
        }
        
        // Knowledge Graph size
        if (this.components.knowledgeGraph) {
            const kgStats = this.components.knowledgeGraph.metrics;
            stats.componentStats.knowledgeGraph = kgStats;
            // Estimate memory: nodes * 1KB + relationships * 0.5KB
            stats.totalMemoryUsed += (kgStats.nodeCount * 1024) + (kgStats.relationshipCount * 512);
        }
        
        return stats;
    }

    /**
     * Emergency pruning when memory limits exceeded
     */
    async emergencyPruning() {
        if (this.components.pruner) {
            await this.components.pruner.executePruning({ emergency: true });
        }
        
        // Force MEM1 consolidation for all agents
        if (this.components.mem1) {
            for (const [agentId, state] of this.components.mem1.agentStates) {
                await this.components.mem1.consolidate(agentId, {}, { forceConsolidation: true });
            }
        }
        
        this.metrics.pruningOperations++;
    }

    /**
     * Compact specific agent's memory
     */
    async compactAgentMemory(agentId) {
        // Force aggressive consolidation
        if (this.components.mem1) {
            const state = await this.components.mem1.getAgentState(agentId);
            
            // Reset to more compact representation
            state.h_t = new Float32Array(256); // Reduce size
            state.metadata.relevanceScores.clear();
            
            console.log(`🧹 Compacted memory for agent ${agentId}`);
        }
    }

    /**
     * Helper methods
     */
    async getQueryEmbedding(query) {
        if (this.connectedSystems.has('embeddingService')) {
            return await this.connectedSystems.get('embeddingService').embed(query);
        }
        
        // Fallback to simple embedding
        const hash = require('crypto').createHash('sha256').update(query).digest();
        const embedding = new Float32Array(768);
        for (let i = 0; i < 768; i++) {
            embedding[i] = (hash[i % hash.length] - 128) / 128;
        }
        return embedding;
    }

    updateMemoryMetrics(agentId) {
        // Track per-agent metrics
        if (!this.agentMetrics) {
            this.agentMetrics = new Map();
        }
        
        if (!this.agentMetrics.has(agentId)) {
            this.agentMetrics.set(agentId, {
                consolidations: 0,
                extractions: 0,
                lastActivity: Date.now()
            });
        }
        
        const metrics = this.agentMetrics.get(agentId);
        metrics.consolidations++;
        metrics.lastActivity = Date.now();
    }

    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            initialized: this.initialized,
            components: {},
            metrics: this.metrics,
            agentMetrics: {}
        };
        
        // Collect component states
        for (const [name, component] of Object.entries(this.components)) {
            if (component && typeof component.getState === 'function') {
                try {
                    state.components[name] = await component.getState();
                } catch (error) {
                    console.error(`Failed to get state for ${name}:`, error);
                }
            }
        }
        
        // Collect agent metrics
        for (const [agentId, metrics] of this.agentMetrics) {
            state.agentMetrics[agentId] = {
                ...metrics
            };
        }
        
        return state;
    }
    
    /**
     * Restore state from persistence
     */
    async setState(state) {
        if (!state) return;
        
        // Restore metrics
        if (state.metrics) {
            this.metrics = { ...this.metrics, ...state.metrics };
        }
        
        // Restore agent metrics
        if (state.agentMetrics) {
            for (const [agentId, metrics] of Object.entries(state.agentMetrics)) {
                this.agentMetrics.set(agentId, metrics);
            }
        }
        
        // Restore component states
        for (const [name, componentState] of Object.entries(state.components || {})) {
            const component = this.components[name];
            if (component && typeof component.setState === 'function') {
                try {
                    await component.setState(componentState);
                } catch (error) {
                    console.error(`Failed to set state for ${name}:`, error);
                }
            }
        }
    }
    
    /**
     * Save state for persistence
     */
    async saveState() {
        return await this.getState();
    }
    
    /**
     * Load state from persistence
     */
    async loadState(state) {
        return await this.setState(state);
    }
    
    /**
     * Get comprehensive memory system status
     */
    async getStatus() {
        const status = {
            initialized: this.initialized,
            components: {},
            metrics: this.metrics,
            memoryStats: this.calculateMemoryStats(),
            connectedSystems: Array.from(this.connectedSystems.keys())
        };
        
        // Component statuses
        for (const [name, component] of Object.entries(this.components)) {
            if (component && component.getStats) {
                status.components[name] = await component.getStats();
            } else {
                status.components[name] = { initialized: component !== null };
            }
        }
        
        return status;
    }

    /**
     * Graceful shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down Advanced Memory System...');
        
        // Stop monitoring
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        // Shutdown components in reverse order
        const components = [
            'pruner',
            'sedm',
            'entanglementEngine',
            'conceptAgent',
            'memoryAgent',
            'knowledgeGraph',
            'mem1'
        ];
        
        for (const componentName of components) {
            if (this.components[componentName] && this.components[componentName].shutdown) {
                await this.components[componentName].shutdown();
            }
        }
        
        console.log('✅ Memory system shutdown complete');
    }
}
