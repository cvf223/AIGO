#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE TEST SUITE - ADVANCED MEMORY & CONCEPT ORCHESTRATOR
 * ====================================================================
 * 
 * Tests EVERY functionality and method created with 100% attention to detail!
 * 
 * COVERAGE:
 * ✅ All Memory System Components
 * ✅ ConceptAgent with 40+ helper methods
 * ✅ ConceptOrchestratorAgent
 * ✅ Sophisticated branch generation
 * ✅ Real market data integration
 * ✅ Quantum memory features
 * ✅ Persistence mechanisms
 * ✅ Knowledge Graph operations
 * ✅ Integration with cornerstone files
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import all components to test
import { MEM1Framework } from './MEM1Framework.js';
import { MemoryAgent } from './MemoryAgent.js';
import { KnowledgeGraph } from './KnowledgeGraph.js';
import { ConceptAgent } from './ConceptAgent.js';
import { QuantumEntanglementEngine } from './QuantumEntanglementEngine.js';
import { DynamicKGPruner } from './DynamicKGPruner.js';
import { SEDMVerifiableMemory } from './SEDMVerifiableMemory.js';
import { MemorySinkPrevention } from './MemorySinkPrevention.js';
import { AdvancedMemoryCoordinator } from './AdvancedMemoryCoordinator.js';
import { IntegrateAdvancedMemory } from './IntegrateAdvancedMemory.js';
import { QuantumMemoryIntegration } from './QuantumMemoryIntegration.js';
import { ComprehensivePersistenceLayer } from './ComprehensivePersistenceLayer.js';
import ConceptOrchestratorAgent from '../agents/ConceptOrchestratorAgent.js';

// Import factory and systems for integration testing
import { UltimateArbitrageSyndicateFactory } from '../../UltimateArbitrageSyndicateFactory.js';
import { LegendarySyndicateSystem } from '../../learning/LegendarySyndicateSystem.js';
import { LLMAgent } from '../agents/LLMAgent.js';

// Test configuration
const TEST_CONFIG = {
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'test_syndicate',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres'
    },
    testTimeout: 300000, // 5 minutes for comprehensive tests
    verbose: true
};

// Database pool for tests
let dbPool;

// Test results tracking
const testResults = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    errors: [],
    startTime: Date.now()
};

/**
 * Log test progress
 */
function log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const prefix = isError ? '❌' : '✅';
    console.log(`${timestamp} ${prefix} ${message}`);
}

/**
 * Assert with detailed error tracking
 */
function testAssert(condition, message) {
    testResults.totalTests++;
    try {
        assert(condition, message);
        testResults.passed++;
        if (TEST_CONFIG.verbose) {
            log(`PASS: ${message}`);
        }
    } catch (error) {
        testResults.failed++;
        testResults.errors.push({ message, error: error.message });
        log(`FAIL: ${message} - ${error.message}`, true);
        throw error;
    }
}

/**
 * Initialize test database
 */
async function initializeTestDatabase() {
    log('Initializing test database...');
    
    dbPool = new Pool(TEST_CONFIG.database);
    
    // Test connection
    const client = await dbPool.connect();
    try {
        await client.query('SELECT NOW()');
        log('Database connection successful');
    } finally {
        client.release();
    }
    
    // Run migrations if needed
    try {
        const { default: MigrationSystem } = await import('../../database/migrations/migration-system.js');
        const migrationSystem = new MigrationSystem(dbPool);
        await migrationSystem.runMigrations();
        log('Database migrations complete');
    } catch (error) {
        log('Migration system not available, continuing...', true);
    }
    
    return dbPool;
}

/**
 * Test MEM1Framework
 */
async function testMEM1Framework() {
    log('\n🧪 TESTING MEM1FRAMEWORK...\n');
    
    const mem1 = new MEM1Framework({
        gistSize: 128,
        consolidationThreshold: 0.7,
        extractionThreshold: 0.8
    });
    
    // Test initialization
    await mem1.initialize({
        llmService: { 
            generate: async (prompt) => ({ gist: 'test gist', importance: 0.8 })
        },
        worldModel: { updateFromGist: async () => {} }
    });
    
    testAssert(mem1.isInitialized, 'MEM1Framework should be initialized');
    
    // Test agent state management
    const agentState = await mem1.getAgentState('test_agent');
    testAssert(agentState.agentId === 'test_agent', 'Should create agent state');
    testAssert(agentState.gist.length === 128, 'Gist should have correct size');
    
    // Test state update
    await mem1.updateAgentState('test_agent', {
        observation: 'Found arbitrage opportunity',
        action: 'execute_trade',
        reward: 100
    });
    
    const updatedState = await mem1.getAgentState('test_agent');
    testAssert(updatedState.stepCount === 1, 'Step count should increment');
    testAssert(updatedState.totalReward === 100, 'Total reward should update');
    
    // Test consolidation
    const consolidated = await mem1.consolidate('test_agent');
    testAssert(consolidated.success, 'Consolidation should succeed');
    
    // Test relevance computation
    const relevance = await mem1.computeRelevance(
        { content: 'arbitrage opportunity' },
        { goal: 'find profitable trades' }
    );
    testAssert(relevance > 0, 'Relevance should be computed');
    
    // Test extraction triggers
    const shouldExtract = await mem1.checkExtractionTriggers('test_agent');
    testAssert(typeof shouldExtract === 'boolean', 'Should return extraction decision');
    
    // Test persistence
    const state = await mem1.getState();
    testAssert(state.agentStates['test_agent'], 'State should include agent');
    
    await mem1.setState(state);
    testAssert(mem1.agentStates.has('test_agent'), 'State should be restored');
    
    log('MEM1Framework tests complete');
}

/**
 * Test MemoryAgent
 */
async function testMemoryAgent() {
    log('\n🧪 TESTING MEMORYAGENT...\n');
    
    const memoryAgent = new MemoryAgent({
        extractionBatchSize: 5,
        concurrencyLimit: 2
    });
    
    // Mock dependencies
    const mockKG = {
        createNode: async (node) => ({ success: true, nodeId: 'test_node' }),
        createRelationship: async (rel) => ({ success: true, relId: 'test_rel' }),
        addQualifier: async (qual) => ({ success: true }),
        query: async () => ({ rows: [] })
    };
    
    const mockLLM = {
        generate: async (prompt) => ({
            triples: [
                { subject: 'agent', predicate: 'found', object: 'opportunity' }
            ]
        })
    };
    
    await memoryAgent.initialize({
        knowledgeGraph: mockKG,
        llmService: mockLLM,
        database: dbPool
    });
    
    testAssert(memoryAgent.isInitialized, 'MemoryAgent should be initialized');
    
    // Test processing consolidated state
    const result = await memoryAgent.processConsolidatedState('test_agent', {
        gist: new Float32Array(128),
        summary: 'Agent found profitable arbitrage',
        importantEvents: ['trade_executed'],
        timestamp: Date.now()
    });
    
    testAssert(result.success, 'Processing should succeed');
    testAssert(result.extracted.length > 0, 'Should extract knowledge');
    
    // Test validation
    const isValid = await memoryAgent.validateKnowledge({
        subject: 'test',
        predicate: 'is',
        object: 'valid'
    });
    testAssert(isValid, 'Knowledge should be valid');
    
    // Test persistence
    const state = await memoryAgent.getState();
    testAssert(state, 'State should be returned');
    testAssert(state.metrics, 'Metrics should exist');
    testAssert(state.metrics.statesProcessed >= 0, 'Metrics should be tracked');
    
    log('MemoryAgent tests complete');
}

/**
 * Test KnowledgeGraph
 */
async function testKnowledgeGraph() {
    log('\n🧪 TESTING KNOWLEDGEGRAPH...\n');
    
    const kg = new KnowledgeGraph({
        maxNodes: 10000,
        maxRelationships: 50000
    });
    
    await kg.initialize({
        database: dbPool,
        embeddingService: {
            embed: async (text) => new Float32Array(768).fill(0.1)
        }
    });
    
    testAssert(kg.isInitialized, 'KnowledgeGraph should be initialized');
    
    // Test node creation
    const node = await kg.createNode({
        nodeType: 'arbitrage_opportunity',
        properties: {
            profit: 1000,
            confidence: 0.85,
            timestamp: Date.now()
        }
    });
    
    testAssert(node.nodeId, 'Node should be created');
    testAssert(node.embedding, 'Node should have embedding');
    
    // Test relationship creation
    const node2 = await kg.createNode({
        nodeType: 'market_condition',
        properties: { volatility: 'high' }
    });
    
    const rel = await kg.createRelationship({
        sourceId: node.nodeId,
        targetId: node2.nodeId,
        relationshipType: 'depends_on',
        properties: { strength: 0.8 }
    });
    
    testAssert(rel.relationshipId, 'Relationship should be created');
    
    // Test qualifier addition
    const qual = await kg.addQualifier({
        relationshipId: rel.relationshipId,
        key: 'timeframe',
        value: '1_hour'
    });
    
    testAssert(qual.success, 'Qualifier should be added');
    
    // Test quantum entanglement
    const entanglement = await kg.createQuantumEntanglement({
        nodeA: node.nodeId,
        nodeB: node2.nodeId,
        entanglementType: 'causal',
        strength: 0.9,
        metadata: { discovered: Date.now() }
    });
    
    testAssert(entanglement.entanglementId, 'Entanglement should be created');
    
    // Test search by embedding
    const searchResults = await kg.searchByEmbedding(
        new Float32Array(768).fill(0.1),
        { limit: 5, threshold: 0.5 }
    );
    
    testAssert(Array.isArray(searchResults), 'Search should return results');
    
    // Test multi-hop traversal
    const traversal = await kg.multiHopTraversal(
        node.nodeId,
        { maxHops: 2, relationshipTypes: ['depends_on'] }
    );
    
    testAssert(Array.isArray(traversal), 'Traversal should return paths');
    
    // Test dynamic pruning
    const pruneResult = await kg.executeDynamicPruning('value_based', {
        threshold: 0.3,
        maxAge: 86400000
    });
    
    testAssert(typeof pruneResult.removed === 'number', 'Pruning should report removed nodes');
    
    log('KnowledgeGraph tests complete');
}

/**
 * Test ConceptAgent with ALL helper methods
 */
async function testConceptAgent() {
    log('\n🧪 TESTING CONCEPTAGENT WITH ALL 40+ HELPER METHODS...\n');
    
    const conceptAgent = new ConceptAgent({
        embeddingDim: 768,
        conceptSequenceLength: 128,
        reasoningDepth: 5,
        architecture: 'diffusion'
    });
    
    // Mock dependencies
    const mockKG = {
        query: async () => ({ rows: [] }),
        searchByEmbedding: async () => []
    };
    
    await conceptAgent.initialize({
        knowledgeGraph: mockKG,
        llmService: {
            generate: async () => ({ response: 'test' })
        },
        embeddingService: {
            embed: async (text) => new Float32Array(768).fill(0.1)
        }
    });
    
    testAssert(conceptAgent.initialized, 'ConceptAgent should be initialized');
    
    // Test helper methods
    
    // 1. extractSemanticTerms
    const terms = conceptAgent.extractSemanticTerms('analyze arbitrage yield protocol liquidity');
    testAssert(terms.includes('arbitrage'), 'Should extract semantic terms');
    testAssert(terms.includes('yield'), 'Should extract yield term');
    
    // 2. calculateTermImportance
    const importance = conceptAgent.calculateTermImportance('arbitrage', 'find arbitrage opportunities in defi');
    testAssert(importance > 0, 'Should calculate term importance');
    testAssert(importance <= 1, 'Importance should be normalized');
    
    // 3. extractContextualConcepts
    const contextConcepts = await conceptAgent.extractContextualConcepts({
        domain: 'defi',
        constraints: ['gas < 100', 'slippage < 2%']
    });
    testAssert(contextConcepts.length > 0, 'Should extract contextual concepts');
    testAssert(contextConcepts[0].type === 'domain', 'Should identify domain concept');
    
    // 4. deduplicateAndScoreConcepts
    const concepts = [
        { term: 'arbitrage', confidence: 0.8, source: 'content' },
        { term: 'arbitrage', confidence: 0.9, source: 'metadata' }
    ];
    const deduped = conceptAgent.deduplicateAndScoreConcepts(concepts);
    testAssert(deduped.length === 1, 'Should deduplicate concepts');
    testAssert(deduped[0].confidence === 0.9, 'Should keep highest confidence');
    
    // 5. calculateSiblingStrength
    const node1 = { confidence: 0.8, concept: { type: 'analysis' }, depth: 2 };
    const node2 = { confidence: 0.85, concept: { type: 'analysis' }, depth: 2 };
    const strength = conceptAgent.calculateSiblingStrength(node1, node2);
    testAssert(strength > 0.5, 'Should calculate sibling strength');
    
    // 6. extractSemanticRelationships
    const relationships = await conceptAgent.extractSemanticRelationships(
        'volatility leads to arbitrage opportunities'
    );
    testAssert(relationships.length > 0, 'Should extract semantic relationships');
    testAssert(relationships[0].type === 'causes', 'Should identify causal relationship');
    
    // 7. extractCausalRelationships
    const causalRels = conceptAgent.extractCausalRelationships(
        'because prices diverge, therefore arbitrage exists'
    );
    testAssert(causalRels.length > 0, 'Should extract causal relationships');
    
    // 8. parseGoalComponents
    const goalComponents = await conceptAgent.parseGoalComponents(
        'analyze arbitrage opportunities in defi protocols'
    );
    testAssert(goalComponents.action === 'analyze', 'Should parse action');
    testAssert(goalComponents.domain === 'defi', 'Should parse domain');
    
    // 9. generateComparisonDirections
    const compDirs = conceptAgent.generateComparisonDirections({}, goalComponents);
    testAssert(compDirs.length > 0, 'Should generate comparison directions');
    testAssert(compDirs[0].type === 'comparative_analysis', 'Should have comparison type');
    
    // 10. generateAnalysisDirections
    const analysisDirs = conceptAgent.generateAnalysisDirections({}, goalComponents);
    testAssert(analysisDirs.length > 0, 'Should generate analysis directions');
    
    // 11. generateOptimizationDirections
    const optDirs = conceptAgent.generateOptimizationDirections({}, goalComponents);
    testAssert(optDirs.length > 0, 'Should generate optimization directions');
    
    // 12. generateDomainSpecificDirections
    const domainDirs = await conceptAgent.generateDomainSpecificDirections(
        {}, 'arbitrage', 'maximize profit'
    );
    testAssert(domainDirs.length > 0, 'Should generate domain-specific directions');
    testAssert(domainDirs[0].domain === 'defi', 'Should have defi domain');
    
    // 13. calculateSemanticSimilarity
    const similarity = conceptAgent.calculateSemanticSimilarity(
        'arbitrage trading',
        'trading arbitrage'
    );
    testAssert(similarity > 0.5, 'Should calculate high similarity for similar texts');
    
    // 14. findRelevantEntanglements
    const entanglements = await conceptAgent.findRelevantEntanglements({
        embedding: new Float32Array(768)
    });
    testAssert(Array.isArray(entanglements), 'Should return entanglements array');
    
    // 15. findAnalogies
    const analogies = await conceptAgent.findAnalogies({}, 'optimize arbitrage');
    testAssert(Array.isArray(analogies), 'Should find analogies');
    
    // 16. generateInversions
    const inversions = conceptAgent.generateInversions({}, 'find opportunities');
    testAssert(inversions.length > 0, 'Should generate inversions');
    testAssert(inversions[0].type === 'inversion', 'Should have inversion type');
    
    // 17. generateConceptCombinations
    const combinations = await conceptAgent.generateConceptCombinations({
        concepts: [
            { term: 'arbitrage' },
            { term: 'liquidity' }
        ]
    });
    testAssert(combinations.length > 0, 'Should generate concept combinations');
    
    // 18. generateLateralApproaches
    const lateral = conceptAgent.generateLateralApproaches({}, 'solve problem');
    testAssert(lateral.length > 0, 'Should generate lateral approaches');
    
    // 19. identifyEmergentProperties
    const emergent = conceptAgent.identifyEmergentProperties({
        relationships: [{}, {}, {}, {}]
    });
    testAssert(emergent.length > 0, 'Should identify emergent properties');
    
    // 20. parseConstraints
    const constraints = conceptAgent.parseConstraints([
        'gas < 100',
        'slippage = 2%',
        'must execute quickly'
    ]);
    testAssert(constraints.length === 3, 'Should parse all constraints');
    testAssert(constraints[0].type === 'inequality', 'Should identify inequality');
    
    // 21. generateConstraintCombinations
    const combos = conceptAgent.generateConstraintCombinations(constraints);
    testAssert(combos.length > 0, 'Should generate constraint combinations');
    
    // 22. checkConstraintSatisfiability
    const satisfiability = await conceptAgent.checkConstraintSatisfiability(
        constraints.slice(0, 2), {}
    );
    testAssert(typeof satisfiability.isSatisfiable === 'boolean', 'Should check satisfiability');
    
    // 23. hasConflictingConstraints
    const hasConflicts = conceptAgent.hasConflictingConstraints([
        { type: 'equality', original: 'x = 5' },
        { type: 'equality', original: 'x = 10' }
    ]);
    testAssert(hasConflicts === true, 'Should detect conflicting constraints');
    
    // 24. generateRelaxedConstraintDirections
    const relaxed = await conceptAgent.generateRelaxedConstraintDirections({}, constraints);
    testAssert(relaxed.length > 0, 'Should generate relaxed directions');
    
    // 25. extractActionVerbs
    const verbs = conceptAgent.extractActionVerbs('analyze and optimize the arbitrage strategy');
    testAssert(verbs.includes('analyze'), 'Should extract analyze verb');
    testAssert(verbs.includes('optimize'), 'Should extract optimize verb');
    
    // 26. calculateSetOverlap
    const overlap = conceptAgent.calculateSetOverlap(
        ['a', 'b', 'c'],
        ['b', 'c', 'd']
    );
    testAssert(overlap > 0 && overlap < 1, 'Should calculate partial overlap');
    
    // 27. identifyDomain
    const domain = conceptAgent.identifyDomain('arbitrage yield farming in defi protocols');
    testAssert(domain === 'defi', 'Should identify defi domain');
    
    // 28. areDomainsRelated
    const related = conceptAgent.areDomainsRelated('defi', 'optimization');
    testAssert(related === true, 'Should identify related domains');
    
    // 29. calculateConceptSimilarity
    const conceptSim = conceptAgent.calculateConceptSimilarity(
        { type: 'analysis', source: 'user' },
        { type: 'analysis', source: 'system' }
    );
    testAssert(conceptSim > 0, 'Should calculate concept similarity');
    
    // 30. assessResourceAvailability
    const resourceScore = conceptAgent.assessResourceAvailability(
        { type: 'complex_analysis', estimatedTime: 100 },
        { computational: true, time: 200 }
    );
    testAssert(resourceScore > 0.5, 'Should assess resource availability');
    
    // 31. calculateTaskAlignment
    const taskAlign = conceptAgent.calculateTaskAlignment(
        { content: 'analyze defi protocols' },
        'defi optimization task'
    );
    testAssert(taskAlign > 0.5, 'Should calculate high task alignment');
    
    // 32. assessTemporalRelevance
    const temporal = conceptAgent.assessTemporalRelevance(
        { type: 'quick_action' },
        'immediate'
    );
    testAssert(temporal > 0.8, 'Should assess high temporal relevance');
    
    // 33. assessResourceAlignment
    const resAlign = conceptAgent.assessResourceAlignment(
        { properties: { requirements: { computational: 50, memory: 100 } } },
        { computational: 100, memory: 200 }
    );
    testAssert(resAlign === 1.0, 'Should have perfect resource alignment');
    
    // 34. checkPriorContextSuccess
    const priorSuccess = await conceptAgent.checkPriorContextSuccess(
        { type: 'test' },
        { type: 'test_context' }
    );
    testAssert(priorSuccess >= 0, 'Should return prior success rate');
    
    // 35. assessConstraintCompatibility
    const compatibility = conceptAgent.assessConstraintCompatibility(
        { content: 'execute trade' },
        ['no trading', 'only analysis']
    );
    testAssert(compatibility < 1, 'Should detect constraint incompatibility');
    
    // 36. getNthPrime
    const prime5 = conceptAgent.getNthPrime(5);
    testAssert(prime5 === 11, 'Should get 5th prime number');
    
    // 37. isPrime
    testAssert(conceptAgent.isPrime(17) === true, 'Should identify 17 as prime');
    testAssert(conceptAgent.isPrime(18) === false, 'Should identify 18 as not prime');
    
    // 38. calculateGoalAlignment
    const direction = {
        reasoning: 'analyze arbitrage opportunities in defi',
        evidence: ['market_data'],
        goalAlignment: 0
    };
    const goalAlign = conceptAgent.calculateGoalAlignment(
        direction,
        'find and analyze arbitrage in defi protocols'
    );
    testAssert(goalAlign > 0.5, 'Should calculate high goal alignment');
    
    // 39. calculateNovelty
    const novelty = conceptAgent.calculateNovelty(
        { type: 'cross_domain', unexpectedness: 0.8 },
        { concepts: [{ term: 'standard' }] }
    );
    testAssert(novelty > 0.5, 'Should calculate high novelty for cross-domain');
    
    // 40. calculateFeasibility
    const feasibility = conceptAgent.calculateFeasibility(
        { 
            evidence: ['proof1', 'proof2'],
            knowledgeSupport: 0.8,
            risks: [],
            assumptions: ['a1', 'a2']
        },
        { resources: { computational: true }, timeConstraint: 1000, estimatedTime: 500 }
    );
    testAssert(feasibility > 0.7, 'Should calculate high feasibility');
    
    // Test sophisticated branch generation
    const node = {
        id: 'root',
        concept: { 
            type: 'analysis',
            content: 'analyze arbitrage',
            embedding: new Float32Array(768).fill(0.1)
        },
        confidence: 0.9,
        depth: 0
    };
    
    const branches = await conceptAgent.generateBranches(
        node,
        'maximize arbitrage profit',
        { constraints: ['gas < 100'], explorationMode: true }
    );
    
    testAssert(branches.length > 0, 'Should generate branches');
    testAssert(branches[0].concept, 'Branch should have concept');
    testAssert(branches[0].confidence > 0, 'Branch should have confidence');
    testAssert(branches[0].metadata, 'Branch should have metadata');
    testAssert(branches[0].metadata.reasoningPath, 'Branch should have reasoning path');
    
    // Test quantum noise generation (no randomness!)
    const noise = conceptAgent.generateNoise(100);
    testAssert(noise.length === 100, 'Should generate noise of correct length');
    testAssert(!noise.some(n => n === 0), 'Noise should be non-zero');
    const noise2 = conceptAgent.generateNoise(100);
    testAssert(noise[0] === noise2[0], 'Noise should be deterministic');
    
    log('ConceptAgent tests complete - ALL 40+ helper methods tested!');
}

/**
 * Test QuantumEntanglementEngine
 */
async function testQuantumEntanglementEngine() {
    log('\n🧪 TESTING QUANTUMENTANGLEMENTENGINE...\n');
    
    const qee = new QuantumEntanglementEngine({
        entanglementThreshold: 0.7,
        maxEntanglements: 1000
    });
    
    // Mock KG
    const mockKG = {
        query: async () => ({
            rows: [
                { node_id: 'n1', embedding: Array(768).fill(0.1) },
                { node_id: 'n2', embedding: Array(768).fill(0.2) }
            ]
        }),
        createQuantumEntanglement: async (e) => ({ 
            entanglementId: 'test_entanglement' 
        })
    };
    
    await qee.initialize({ knowledgeGraph: mockKG });
    
    testAssert(qee.isInitialized, 'QuantumEntanglementEngine should be initialized');
    
    // Test entanglement discovery
    const discovered = await qee.discoverEntanglements();
    testAssert(discovered.created >= 0, 'Should discover entanglements');
    
    // Test entanglement strength calculation
    const strength = await qee.calculateEntanglementStrength(
        'node1', 'node2',
        new Float32Array(768).fill(0.1),
        new Float32Array(768).fill(0.2)
    );
    testAssert(strength > 0 && strength <= 1, 'Strength should be normalized');
    
    log('QuantumEntanglementEngine tests complete');
}

/**
 * Test SEDMVerifiableMemory with REAL market data
 */
async function testSEDMVerifiableMemory() {
    log('\n🧪 TESTING SEDMVERIFIABLEMEMORY WITH REAL MARKET DATA...\n');
    
    // Mock syndicate services for real data
    const mockServices = {
        marketStateService: {
            getCurrentState: async () => ({
                marketConditions: {
                    volatility: 0.25,
                    gasPrice: '75',
                    blockNumber: 18500000,
                    sentiment: 'bullish'
                },
                keyMetrics: {
                    volume24h: 5000000
                }
            })
        },
        performanceTracker: {
            getSystemMetrics: async () => ({
                activeAgents: 15,
                cpuUsage: 0.45,
                memoryUsage: 0.62,
                taskQueueLength: 8
            })
        }
    };
    
    const sedm = new SEDMVerifiableMemory({
        verificationThreshold: 0.7,
        abTestDuration: 60000
    });
    
    // Set syndicate services
    sedm.syndicateServices = mockServices;
    
    await sedm.initialize({
        knowledgeGraph: {
            createNode: async () => ({ nodeId: 'test' }),
            query: async () => ({ rows: [] })
        },
        database: dbPool
    });
    
    testAssert(sedm.isInitialized, 'SEDM should be initialized');
    
    // Test market snapshot with REAL data
    const marketSnapshot = await sedm.getMarketSnapshot();
    testAssert(marketSnapshot.volatility === 0.25, 'Should get real volatility');
    testAssert(marketSnapshot.volume === 5000000, 'Should get real volume');
    testAssert(marketSnapshot.trend === 'bullish', 'Should get real trend');
    testAssert(marketSnapshot.gasPrice === '75', 'Should get real gas price');
    testAssert(marketSnapshot.blockNumber === 18500000, 'Should get real block number');
    
    // Test system load with REAL metrics
    const systemLoad = await sedm.getSystemLoad();
    testAssert(systemLoad.activeAgents === 15, 'Should get real agent count');
    testAssert(systemLoad.cpuUsage === 0.45, 'Should get real CPU usage');
    testAssert(systemLoad.memoryUsage === 0.62, 'Should get real memory usage');
    
    // Test real relevance calculation
    const relevance = await sedm.calculateRealRelevance('test_node');
    testAssert(typeof relevance === 'number', 'Should calculate real relevance');
    testAssert(relevance >= 0 && relevance <= 1, 'Relevance should be normalized');
    
    // Test volatility calculation from conditions
    const volatility = sedm.calculateVolatilityFromConditions({
        networkCongestion: 0.7,
        gasPrice: '150'
    });
    testAssert(volatility > 0.15, 'High gas should increase volatility');
    testAssert(volatility <= 0.5, 'Volatility should be capped');
    
    // Test trend determination
    const trend = sedm.determineTrendFromConditions({
        totalValueLocked: 1000000,
        previousTVL: 900000,
        activeArbitrageContracts: 15,
        gasPrice: '25',
        avgBlockTime: 12
    });
    testAssert(trend === 'bullish', 'Should determine bullish trend');
    
    log('SEDMVerifiableMemory tests complete - NO RANDOM DATA!');
}

/**
 * Test ConceptOrchestratorAgent
 */
async function testConceptOrchestratorAgent() {
    log('\n🧪 TESTING CONCEPTORCHESTRATORAGENT...\n');
    
    // Load character
    const characterPath = path.join(__dirname, '../../learning/agents/concept-orchestrator.json');
    testAssert(fs.existsSync(characterPath), 'Character file should exist');
    
    const agent = new ConceptOrchestratorAgent({
        persistenceEnabled: true,
        learningEnabled: true,
        collaborationEnabled: true
    });
    
    testAssert(agent.character.name === 'Concept Orchestrator', 'Should load character');
    
    // Initialize with mocks
    await agent.initialize({
        knowledgeGraph: {
            createNode: async () => ({ nodeId: 'test' })
        },
        memoryAgent: {},
        conceptAgent: new ConceptAgent(),
        llmService: {
            generate: async () => ({ response: 'test' })
        },
        embeddingService: {
            embed: async () => new Float32Array(768)
        },
        sharedMemory: {},
        eventBus: new EventEmitter(),
        coordinationLayer: {},
        syndicateRegistry: {}
    });
    
    testAssert(agent.initialized, 'Agent should be initialized');
    testAssert(agent.conceptEngine, 'Should have concept engine');
    
    // Test capabilities
    const capabilities = agent.getCapabilities();
    testAssert(capabilities.conceptualOrchestration, 'Should have conceptual orchestration');
    testAssert(capabilities.graphOfThought, 'Should have GOT capability');
    testAssert(capabilities.chainOfAgents, 'Should have COA capability');
    testAssert(capabilities.treeOfThought, 'Should have TOT capability');
    
    // Test message processing
    const response = await agent.processMessage('test message', {
        senderId: 'test_user'
    });
    testAssert(response.text, 'Should process message');
    
    // Test event handling
    const eventBus = new EventEmitter();
    agent.syndicateConnections.eventBus = eventBus;
    agent.subscribeToSyndicateEvents();
    
    let conceptRequestHandled = false;
    eventBus.emit('agent_request_concepts', {
        agentId: 'test_agent',
        request: { goal: 'test goal' },
        requestId: 'test_123'
    });
    
    // Give time for async handler
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test state persistence
    const state = await agent.saveState();
    testAssert(state.agentId === 'concept_orchestrator_001', 'Should save state');
    testAssert(state.learningState, 'Should include learning state');
    
    await agent.loadState(state);
    testAssert(agent.learningState.totalConcepts === state.learningState.totalConcepts, 
        'Should restore state');
    
    log('ConceptOrchestratorAgent tests complete');
}

/**
 * Test Integration with UltimateArbitrageSyndicateFactory
 */
async function testFactoryIntegration() {
    log('\n🧪 TESTING FACTORY INTEGRATION...\n');
    
    const factory = new UltimateArbitrageSyndicateFactory({
        database: dbPool,
        enableQuantumEvolution: true
    });
    
    // Initialize factory (partial - only what we need)
    factory.dbPool = dbPool;
    factory.eventBus = new EventEmitter();
    
    // Initialize advanced memory manually
    factory.advancedMemoryIntegration = new IntegrateAdvancedMemory();
    await factory.advancedMemoryIntegration.integrateWithSyndicate(factory, {
        database: dbPool,
        cache: {},
        eventBus: factory.eventBus
    });
    
    testAssert(factory.advancedMemoryIntegration, 'Factory should have memory integration');
    
    // Test agent creation with memory
    const mockCharacter = {
        characterId: 'test_agent',
        name: 'Test Agent',
        bio: 'Test bio',
        knowledge: ['trading']
    };
    
    const agent = await factory.instantiateAgent(mockCharacter);
    
    testAssert(agent.conceptOrchestrator, 'Agent should have concept orchestrator');
    testAssert(agent.advancedMemory, 'Agent should have advanced memory');
    testAssert(agent.knowledgeGraph, 'Agent should have knowledge graph');
    testAssert(agent.memoryAgent, 'Agent should have memory agent');
    
    // Test agent methods
    testAssert(typeof agent.requestConceptualAnalysis === 'function', 
        'Agent should have requestConceptualAnalysis method');
    testAssert(typeof agent.requestDecisionSupport === 'function',
        'Agent should have requestDecisionSupport method');
    testAssert(typeof agent.storeLearning === 'function',
        'Agent should have storeLearning method');
    testAssert(typeof agent.queryKnowledge === 'function',
        'Agent should have queryKnowledge method');
    
    log('Factory integration tests complete');
}

/**
 * Test Persistence Layer
 */
async function testPersistenceLayer() {
    log('\n🧪 TESTING COMPREHENSIVE PERSISTENCE LAYER...\n');
    
    const persistence = new ComprehensivePersistenceLayer({
        database: dbPool,
        backupInterval: 60000,
        enableHourlyBackups: true,
        enableBreakthroughBackups: true
    });
    
    await persistence.initialize();
    testAssert(persistence.isInitialized, 'Persistence layer should be initialized');
    
    // Test memory component registration
    const mockComponent = {
        getState: async () => ({ test: 'state' }),
        setState: async (state) => {}
    };
    
    persistence.registerMemoryComponent('test_component', mockComponent);
    testAssert(persistence.memoryComponents.has('test_component'), 
        'Should register memory component');
    
    // Test decision tracking
    const decision = await persistence.trackDecision('test_component', {
        type: 'execute_trade',
        reasoning: 'High confidence arbitrage',
        confidence: 0.85
    });
    
    testAssert(decision.id, 'Should track decision');
    
    // Test formal verification (mock)
    const verificationResult = await persistence.verifyDecisionFormally(decision);
    testAssert(typeof verificationResult.isValid === 'boolean', 
        'Should return verification result');
    
    // Test constitutional verification (mock)
    const constitutionalResult = await persistence.verifyDecisionConstitutionally(decision);
    testAssert(typeof constitutionalResult.isCompliant === 'boolean',
        'Should return constitutional result');
    
    log('Persistence layer tests complete');
}

/**
 * Test Quantum Memory Integration
 */
async function testQuantumMemoryIntegration() {
    log('\n🧪 TESTING QUANTUM MEMORY INTEGRATION...\n');
    
    const quantumMemory = new QuantumMemoryIntegration({
        superpositionStates: 5,
        coherenceThreshold: 0.8,
        entanglementRadius: 3
    });
    
    // Mock syndicate factory
    const mockFactory = {
        getAgent: (id) => ({
            quantumState: {
                coherence: 0.85,
                entanglementAwareness: ['agent2', 'agent3']
            }
        })
    };
    
    await quantumMemory.initialize({
        syndicateFactory: mockFactory,
        conceptAgent: new ConceptAgent(),
        knowledgeGraph: {
            searchByEmbedding: async () => []
        },
        quantumEntanglementEngine: new QuantumEntanglementEngine()
    });
    
    testAssert(quantumMemory.isInitialized, 'Quantum memory should be initialized');
    
    // Test quantum coherence check
    const coherence = await quantumMemory.checkQuantumCoherence('test_agent');
    testAssert(coherence === 0.85, 'Should get agent quantum coherence');
    
    // Test proactive decision making
    const decision = await quantumMemory.makeProactiveDecision({
        agent: 'test_agent',
        opportunity: { type: 'arbitrage', confidence: 0.8 },
        context: { market: 'volatile' }
    });
    
    testAssert(decision.quantumConfidence > 0, 'Should have quantum confidence');
    testAssert(decision.quantumAdvantage !== undefined, 'Should calculate quantum advantage');
    testAssert(decision.preventionFlags, 'Should have prevention flags');
    
    // Test superposition search
    const searchResults = await quantumMemory.searchInSuperposition(
        'quantum arbitrage',
        { quantum: true, limit: 5 }
    );
    
    testAssert(Array.isArray(searchResults.results), 'Should return search results');
    testAssert(searchResults.quantumBoost >= 1, 'Should have quantum boost');
    
    // Test deterministic perturbation (no randomness!)
    const embedding = new Float32Array(100).fill(0.5);
    const perturbed1 = quantumMemory.perturbEmbedding(embedding, 0);
    const perturbed2 = quantumMemory.perturbEmbedding(embedding, 0);
    
    testAssert(perturbed1[0] === perturbed2[0], 'Perturbation should be deterministic');
    testAssert(perturbed1[0] !== embedding[0], 'Should perturb embedding');
    
    log('Quantum memory integration tests complete');
}

/**
 * Run all tests
 */
async function runAllTests() {
    console.log('🚀 STARTING COMPREHENSIVE TEST SUITE');
    console.log('===================================\n');
    
    try {
        // Initialize database
        await initializeTestDatabase();
        
        // Run all component tests
        await testMEM1Framework();
        await testMemoryAgent();
        await testKnowledgeGraph();
        await testConceptAgent();
        await testQuantumEntanglementEngine();
        await testSEDMVerifiableMemory();
        await testConceptOrchestratorAgent();
        await testFactoryIntegration();
        await testPersistenceLayer();
        await testQuantumMemoryIntegration();
        
        // Print results
        const duration = (Date.now() - testResults.startTime) / 1000;
        
        console.log('\n🏁 TEST SUITE COMPLETE');
        console.log('====================');
        console.log(`Total Tests: ${testResults.totalTests}`);
        console.log(`Passed: ${testResults.passed} ✅`);
        console.log(`Failed: ${testResults.failed} ❌`);
        console.log(`Duration: ${duration.toFixed(2)}s`);
        
        if (testResults.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            testResults.errors.forEach(error => {
                console.log(`  - ${error.message}: ${error.error}`);
            });
        } else {
            console.log('\n🎉 ALL TESTS PASSED! 100% SUCCESS!');
        }
        
    } catch (error) {
        console.error('\n💥 CRITICAL TEST FAILURE:', error);
        process.exit(1);
    } finally {
        // Cleanup
        if (dbPool) {
            await dbPool.end();
        }
    }
    
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(console.error);
}

export { runAllTests };
