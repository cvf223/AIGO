/**
 * 🧠 EXAMPLE: INTEGRATING CONCEPT ORCHESTRATOR INTO SYNDICATE
 * ==========================================================
 * 
 * Shows how to properly integrate the ConceptOrchestratorAgent
 * as a full ElizaOS agent in your syndicate.
 */

import { UltimateArbitrageSyndicateFactory } from '../../UltimateArbitrageSyndicateFactory.js';
import ConceptOrchestratorAgent from '../agents/ConceptOrchestratorAgent.js';
import { IntegrateAdvancedMemory } from './IntegrateAdvancedMemory.js';

/**
 * Add Concept Orchestrator to your syndicate
 */
export async function addConceptOrchestratorToSyndicate(syndicateFactory) {
    console.log('\n🧠 ADDING CONCEPT ORCHESTRATOR TO SYNDICATE');
    console.log('==========================================\n');
    
    try {
        // 1. First ensure advanced memory is integrated
        const memoryIntegration = new IntegrateAdvancedMemory();
        await memoryIntegration.integrateWithSyndicate(syndicateFactory, {
            database: syndicateFactory.dbPool,
            cache: syndicateFactory.cache,
            eventBus: syndicateFactory.eventBus
        });
        
        // 2. Create the Concept Orchestrator Agent
        const conceptOrchestrator = new ConceptOrchestratorAgent({
            persistenceEnabled: true,
            learningEnabled: true,
            collaborationEnabled: true
        });
        
        // 3. Prepare dependencies
        const dependencies = {
            // Core memory components
            knowledgeGraph: memoryIntegration.memoryCoordinator.components.knowledgeGraph,
            memoryAgent: memoryIntegration.memoryCoordinator.components.memoryAgent,
            conceptAgent: memoryIntegration.memoryCoordinator.components.conceptAgent,
            
            // LLM services
            llmService: syndicateFactory.llmAgent?.llmService || syndicateFactory.ollamaService,
            embeddingService: syndicateFactory.embeddingService,
            
            // Deep reasoning systems
            graphOfThoughtEngine: syndicateFactory.graphOfThoughtEngine,
            cognitiveArchitect: syndicateFactory.cognitiveArchitect,
            chainOfAgentsOrchestrator: syndicateFactory.chainOfAgentsOrchestrator,
            multiLayeredReasoningOrchestrator: syndicateFactory.multiLayeredReasoningOrchestrator,
            advancedResearchSystem: syndicateFactory.advancedResearchSystem,
            
            // Syndicate infrastructure
            sharedMemory: syndicateFactory.sharedMemory,
            eventBus: syndicateFactory.eventBus,
            coordinationLayer: syndicateFactory.coordinationLayer,
            syndicateRegistry: syndicateFactory
        };
        
        // 4. Initialize the agent
        await conceptOrchestrator.initialize(dependencies);
        
        // 5. Register with syndicate factory
        syndicateFactory.conceptOrchestratorAgent = conceptOrchestrator;
        
        // 6. Add to agent registry
        if (!syndicateFactory.agents) {
            syndicateFactory.agents = new Map();
        }
        syndicateFactory.agents.set('concept_orchestrator', conceptOrchestrator);
        
        // 7. Setup syndicate-wide event routing
        setupConceptualRouting(syndicateFactory, conceptOrchestrator);
        
        // 8. Create agent wrapper for ElizaOS compatibility
        const elizaWrapper = createElizaAgentWrapper(conceptOrchestrator);
        syndicateFactory.registerElizaAgent(elizaWrapper);
        
        console.log('\n✅ CONCEPT ORCHESTRATOR INTEGRATION COMPLETE!');
        console.log('   📊 Agent ID: concept_orchestrator_001');
        console.log('   🧠 Reasoning systems: GOT, COA, TOT active');
        console.log('   🔗 Syndicate routing: ENABLED');
        console.log('   💾 Persistence: ACTIVE');
        console.log('   📚 Learning: ENABLED');
        console.log('   🤝 Collaboration: READY\n');
        
        return conceptOrchestrator;
        
    } catch (error) {
        console.error('❌ Failed to add Concept Orchestrator:', error);
        throw error;
    }
}

/**
 * Setup conceptual routing for all agents
 */
function setupConceptualRouting(syndicateFactory, conceptOrchestrator) {
    console.log('🔗 Setting up conceptual routing...');
    
    // Route all agent reasoning through concept layer
    syndicateFactory.on('agent_reasoning_request', async (event) => {
        const enhanced = await conceptOrchestrator.handleAgentConceptRequest({
            agentId: event.agentId,
            request: event.request,
            context: event.context
        });
        
        // Return enhanced result
        event.callback?.(enhanced);
    });
    
    // Route learning events
    syndicateFactory.on('agent_learned', async (event) => {
        await conceptOrchestrator.handleLearningEvent(event);
    });
    
    // Route research requests
    syndicateFactory.on('research_needed', async (event) => {
        const research = await conceptOrchestrator.handleResearchRequest(event);
        event.callback?.(research);
    });
    
    // Route decision requests
    syndicateFactory.on('decision_needed', async (event) => {
        const framework = await conceptOrchestrator.handleDecisionRequest(event);
        event.callback?.(framework);
    });
    
    console.log('   ✅ Conceptual routing configured');
}

/**
 * Create ElizaOS-compatible agent wrapper
 */
function createElizaAgentWrapper(conceptOrchestrator) {
    return {
        id: conceptOrchestrator.agentId,
        name: conceptOrchestrator.character.name,
        username: conceptOrchestrator.character.username,
        character: conceptOrchestrator.character,
        
        // ElizaOS methods
        async processMessage(message, userId, roomId, context) {
            return await conceptOrchestrator.processMessage(message, {
                senderId: userId,
                roomId: roomId,
                ...context
            });
        },
        
        async handleCommand(command, args, userId, roomId, context) {
            return await conceptOrchestrator.handleCommand(command, args, {
                senderId: userId,
                roomId: roomId,
                ...context
            });
        },
        
        // State methods
        async saveState() {
            return await conceptOrchestrator.saveState();
        },
        
        async loadState(state) {
            return await conceptOrchestrator.loadState(state);
        },
        
        // Capabilities
        getCapabilities() {
            return conceptOrchestrator.getCapabilities();
        }
    };
}

/**
 * Example: Using the Concept Orchestrator
 */
export async function demonstrateConceptOrchestrator(syndicateFactory) {
    console.log('\n🎭 DEMONSTRATING CONCEPT ORCHESTRATOR\n');
    
    const orchestrator = syndicateFactory.conceptOrchestratorAgent;
    if (!orchestrator) {
        console.error('❌ Concept Orchestrator not found in syndicate');
        return;
    }
    
    // 1. Simple conceptual analysis
    console.log('1️⃣ Simple Analysis:');
    const simple = await orchestrator.processMessage(
        "What is flash loan arbitrage?",
        { senderId: 'demo_user' }
    );
    console.log(`   Response: ${simple.text}`);
    console.log(`   Method: ${simple.method}, Confidence: ${simple.confidence}\n`);
    
    // 2. Complex multi-domain analysis
    console.log('2️⃣ Complex Multi-Domain Analysis:');
    const complex = await orchestrator.processMessage(
        "Compare DeFi yield optimization strategies with protein folding algorithms",
        { senderId: 'demo_user' }
    );
    console.log(`   Response: ${complex.text}`);
    console.log(`   Method: ${complex.method}, Concepts: ${complex.concepts.length}\n`);
    
    // 3. Agent collaboration request
    console.log('3️⃣ Agent Collaboration:');
    syndicateFactory.eventBus.emit('agent_request_concepts', {
        agentId: 'arbitrage_detector',
        request: {
            goal: "Identify profitable arbitrage paths",
            input: { markets: ['Uniswap', 'SushiSwap', 'Curve'] },
            constraints: ["slippage < 2%", "gas < 100 gwei"]
        },
        requestId: 'demo_123'
    });
    
    // 4. Research orchestration
    console.log('4️⃣ Research Orchestration:');
    syndicateFactory.eventBus.emit('research_request', {
        query: "Latest MEV protection strategies",
        depth: 3,
        requester: 'security_analyzer'
    });
    
    // 5. Decision support
    console.log('5️⃣ Decision Support:');
    syndicateFactory.eventBus.emit('decision_request', {
        decision: {
            type: 'execute_trade',
            description: 'High-value arbitrage opportunity detected',
            options: ['execute_now', 'wait_for_better_gas', 'split_trade'],
            constraints: ['max_risk: $10000', 'time_window: 5_blocks']
        },
        context: { 
            market: 'volatile',
            gasPrice: 'high',
            confidence: 0.85
        },
        agentId: 'trader_001'
    });
    
    console.log('\n✅ Demonstration complete!');
}

/**
 * Full integration example
 */
export async function fullConceptOrchestratorIntegration() {
    // Initialize syndicate
    const syndicateFactory = new UltimateArbitrageSyndicateFactory({
        // Your config
    });
    
    await syndicateFactory.initialize();
    
    // Add Concept Orchestrator
    await addConceptOrchestratorToSyndicate(syndicateFactory);
    
    // Run demonstration
    await demonstrateConceptOrchestrator(syndicateFactory);
    
    // The syndicate now has a cognitive backbone!
    return syndicateFactory;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fullConceptOrchestratorIntegration().catch(console.error);
}
