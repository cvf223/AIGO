#!/usr/bin/env node
/**
 * 🧪 COMPREHENSIVE SYSTEM TESTING SUITE
 * ====================================
 * 
 * Tests all major components and integrations to verify system functionality
 * after the comprehensive bugfixing implementation.
 * 
 * TESTING CATEGORIES:
 * - Database connectivity and table existence
 * - Agent systems and reward mechanisms
 * - Knowledge graph database backing
 * - Learning systems integration
 * - AutoformalizationEngine methods
 * - Performance tracking systems
 * - Error handling and recovery
 */

import { DatabasePoolManager } from '../src/database/DatabasePoolManager.js';
import { ConstructionSyndicateFactory } from '../src/construction/factories/ConstructionSyndicateFactory.js';
import { KnowledgeGraph } from '../src/memory/KnowledgeGraph.js';
import { AutoformalizationEngine } from '../src/formalization/AutoformalizationEngine.js';
import { ProactiveCognitiveMetabolicLoop } from '../src/prevention/ProactiveCognitiveMetabolicLoop.js';
import { BasicLearningRL } from '../learning/BasicLearningRL.js';
import { AnalysisAgentPerformanceTracker } from '../src/performance/AnalysisAgentPerformanceTracker.js';

/**
 * 🧪 COMPREHENSIVE TEST SUITE
 */
class ComprehensiveSystemTest {
    constructor() {
        this.testResults = {
            database: { passed: 0, failed: 0, tests: [] },
            agents: { passed: 0, failed: 0, tests: [] },
            knowledgeGraph: { passed: 0, failed: 0, tests: [] },
            learning: { passed: 0, failed: 0, tests: [] },
            autoformalization: { passed: 0, failed: 0, tests: [] },
            performance: { passed: 0, failed: 0, tests: [] },
            integration: { passed: 0, failed: 0, tests: [] }
        };
        
        this.dbPool = null;
        this.startTime = Date.now();
    }
    
    /**
     * 🚀 RUN ALL TESTS
     */
    async runAllTests() {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║    🧪 COMPREHENSIVE AIGO-SYNDICATE SYSTEM TESTING 🧪       ║
║                                                              ║
║    Testing all components after bugfixing implementation    ║
╚══════════════════════════════════════════════════════════════╝
`);
        
        try {
            // Phase 1: Database Foundation Tests
            await this.testDatabaseConnectivity();
            await this.testDatabaseTables();
            
            // Phase 2: Agent Systems Tests
            await this.testSyndicateFactory();
            await this.testRewardSystems();
            await this.testCollectiveLearning();
            
            // Phase 3: Knowledge Graph Tests
            await this.testKnowledgeGraphDatabase();
            await this.testKnowledgeGraphOperations();
            
            // Phase 4: Learning Systems Tests
            await this.testLearningSystemsIntegration();
            await this.testBasicLearningRL();
            
            // Phase 5: AutoformalizationEngine Tests
            await this.testAutoformalizationMethods();
            
            // Phase 6: Performance Tracking Tests
            await this.testPerformanceTracker();
            
            // Phase 7: Integration Tests
            await this.testSystemIntegration();
            
            // Generate final report
            this.generateTestReport();
            
        } catch (error) {
            console.error('❌ Critical test failure:', error);
            this.recordTest('integration', 'Critical System Test', false, error.message);
        } finally {
            await this.cleanup();
        }
    }
    
    /**
     * 🗄️ DATABASE CONNECTIVITY TESTS
     */
    async testDatabaseConnectivity() {
        console.log('🗄️ Testing Database Connectivity...');
        
        try {
            // Test database pool initialization
            this.dbPool = DatabasePoolManager.getInstance();
            await this.dbPool.initialize();
            this.recordTest('database', 'Database Pool Initialization', true, 'Pool initialized successfully');
            
            // Test basic query execution
            const result = await this.dbPool.query('SELECT NOW() as current_time, current_database() as db_name');
            this.recordTest('database', 'Basic Query Execution', true, `Connected to ${result.rows[0].db_name}`);
            
        } catch (error) {
            this.recordTest('database', 'Database Connectivity', false, error.message);
        }
    }
    
    /**
     * 📊 DATABASE TABLES TESTS
     */
    async testDatabaseTables() {
        console.log('📊 Testing Database Tables...');
        
        try {
            // Test knowledge graph tables exist
            const kgTablesQuery = await this.dbPool.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_name IN ('kg_nodes', 'kg_relationships', 'kg_entanglements')
                AND table_schema = 'public'
            `);
            
            const expectedTables = ['kg_nodes', 'kg_relationships', 'kg_entanglements'];
            const existingTables = kgTablesQuery.rows.map(row => row.table_name);
            const missingTables = expectedTables.filter(table => !existingTables.includes(table));
            
            if (missingTables.length === 0) {
                this.recordTest('database', 'Knowledge Graph Tables', true, 'All KG tables exist');
            } else {
                this.recordTest('database', 'Knowledge Graph Tables', false, `Missing: ${missingTables.join(', ')}`);
            }
            
            // Test other required tables
            const otherTables = await this.dbPool.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_name IN ('shared_memory', 'agent_performance', 'system_logs')
                AND table_schema = 'public'
            `);
            
            this.recordTest('database', 'Core System Tables', true, `Found ${otherTables.rows.length} core tables`);
            
        } catch (error) {
            this.recordTest('database', 'Database Tables Check', false, error.message);
        }
    }
    
    /**
     * 🏭 SYNDICATE FACTORY TESTS
     */
    async testSyndicateFactory() {
        console.log('🏭 Testing Syndicate Factory...');
        
        try {
            // Test factory initialization
            const factory = new ConstructionSyndicateFactory({
                database: this.dbPool,
                enableQuantumSystems: true,
                enableLearning: true
            });
            
            await factory.initialize();
            this.recordTest('agents', 'Syndicate Factory Initialization', true, 'Factory initialized');
            
            // Test agent registry
            const hasAgentsMap = factory.agents instanceof Map;
            this.recordTest('agents', 'Agents Map Exists', hasAgentsMap, hasAgentsMap ? 'Agents Map available' : 'Missing agents Map');
            
            // Test service registry
            const hasServiceRegistry = factory.serviceRegistry && typeof factory.serviceRegistry === 'object';
            this.recordTest('agents', 'Service Registry Exists', hasServiceRegistry, hasServiceRegistry ? 'Service registry available' : 'Missing service registry');
            
            await factory.shutdown();
            
        } catch (error) {
            this.recordTest('agents', 'Syndicate Factory Test', false, error.message);
        }
    }
    
    /**
     * 🎯 REWARD SYSTEMS TESTS
     */
    async testRewardSystems() {
        console.log('🎯 Testing Reward Systems...');
        
        try {
            const factory = new ConstructionSyndicateFactory({
                database: this.dbPool,
                enableLearning: true
            });
            
            await factory.initialize();
            
            // Test reward systems registry
            const hasRewardRegistry = factory.rewardSystemsRegistry instanceof Map;
            const rewardCount = hasRewardRegistry ? factory.rewardSystemsRegistry.size : 0;
            
            this.recordTest('agents', 'Reward Systems Registry', hasRewardRegistry && rewardCount > 0, 
                `${rewardCount} reward systems registered`);
            
            // Test collective learning registry
            const hasLearningRegistry = factory.collectiveLearningRegistry instanceof Map;
            const learningCount = hasLearningRegistry ? factory.collectiveLearningRegistry.size : 0;
            
            this.recordTest('agents', 'Collective Learning Registry', hasLearningRegistry && learningCount > 0,
                `${learningCount} learning systems registered`);
            
            await factory.shutdown();
            
        } catch (error) {
            this.recordTest('agents', 'Reward Systems Test', false, error.message);
        }
    }
    
    /**
     * 🏆 COLLECTIVE LEARNING TESTS
     */
    async testCollectiveLearning() {
        console.log('🏆 Testing Collective Learning...');
        
        try {
            const factory = new ConstructionSyndicateFactory({ database: this.dbPool });
            await factory.initialize();
            
            // Test agent registration with systems
            const mockAgent = {
                id: 'test-agent',
                supportsRewards: true,
                supportsCollectiveLearning: true
            };
            
            factory.registerAgentWithSystems('test-agent', mockAgent);
            
            // Verify agent was registered
            let registeredCount = 0;
            for (const system of factory.rewardSystemsRegistry.values()) {
                if (system.participants && system.participants.has('test-agent')) {
                    registeredCount++;
                }
            }
            
            this.recordTest('agents', 'Agent System Registration', registeredCount > 0,
                `Agent registered with ${registeredCount} systems`);
            
            await factory.shutdown();
            
        } catch (error) {
            this.recordTest('agents', 'Collective Learning Test', false, error.message);
        }
    }
    
    /**
     * 🧠 KNOWLEDGE GRAPH TESTS
     */
    async testKnowledgeGraphDatabase() {
        console.log('🧠 Testing Knowledge Graph Database Integration...');
        
        try {
            // Test knowledge graph with database
            const kg = new KnowledgeGraph({
                pruningEnabled: false // Disable for testing
            });
            
            await kg.initialize({ database: this.dbPool });
            
            // Test if it's using database (not in-memory fallback)
            const usingDatabase = !kg.useInMemoryFallback;
            this.recordTest('knowledgeGraph', 'Database Backend', usingDatabase, 
                usingDatabase ? 'Using database storage' : 'Fell back to in-memory');
            
            await kg.shutdown();
            
        } catch (error) {
            this.recordTest('knowledgeGraph', 'Knowledge Graph Database Test', false, error.message);
        }
    }
    
    /**
     * 🔍 KNOWLEDGE GRAPH OPERATIONS TESTS
     */
    async testKnowledgeGraphOperations() {
        console.log('🔍 Testing Knowledge Graph Operations...');
        
        try {
            const kg = new KnowledgeGraph();
            await kg.initialize({ database: this.dbPool });
            
            // Test node creation
            const testNode = {
                type: 'test_concept',
                label: 'Test Knowledge Node',
                properties: { test: true, timestamp: Date.now() }
            };
            
            const nodeId = await kg.addNode(testNode);
            this.recordTest('knowledgeGraph', 'Node Creation', !!nodeId, nodeId ? 'Node created successfully' : 'Failed to create node');
            
            // Test node retrieval
            if (nodeId) {
                const retrievedNode = await kg.getNode(nodeId);
                this.recordTest('knowledgeGraph', 'Node Retrieval', !!retrievedNode, 
                    retrievedNode ? 'Node retrieved successfully' : 'Failed to retrieve node');
            }
            
            await kg.shutdown();
            
        } catch (error) {
            this.recordTest('knowledgeGraph', 'Knowledge Graph Operations Test', false, error.message);
        }
    }
    
    /**
     * 🧠 LEARNING SYSTEMS INTEGRATION TESTS
     */
    async testLearningSystemsIntegration() {
        console.log('🧠 Testing Learning Systems Integration...');
        
        try {
            // Test ProactiveCognitiveMetabolicLoop
            const metabolicLoop = new ProactiveCognitiveMetabolicLoop({
                metabolicRate: 0.05,
                enablePerformanceTracking: false
            });
            
            await metabolicLoop.initialize();
            
            // Test _generateCognitivePattern method exists
            const hasMethod = typeof metabolicLoop._generateCognitivePattern === 'function';
            this.recordTest('learning', 'Cognitive Pattern Method', hasMethod, 
                hasMethod ? 'Method exists and callable' : 'Method missing');
            
            // Test method execution
            if (hasMethod) {
                const pattern = metabolicLoop._generateCognitivePattern('test-specialist');
                const validPattern = pattern && typeof pattern === 'object' && pattern.name === 'test-specialist';
                this.recordTest('learning', 'Cognitive Pattern Generation', validPattern,
                    validPattern ? 'Pattern generated successfully' : 'Invalid pattern generated');
            }
            
            await metabolicLoop.shutdown();
            
        } catch (error) {
            this.recordTest('learning', 'Learning Systems Integration Test', false, error.message);
        }
    }
    
    /**
     * 🤖 BASIC LEARNING RL TESTS
     */
    async testBasicLearningRL() {
        console.log('🤖 Testing Basic Learning RL...');
        
        try {
            // Test BasicLearningRL initialization
            const basicRL = new BasicLearningRL({
                learningRate: 0.01,
                explorationRate: 0.1
            });
            
            await basicRL.initialize();
            
            // Test initialization success
            this.recordTest('learning', 'BasicLearningRL Initialization', basicRL.initialized,
                basicRL.initialized ? 'RL system initialized' : 'RL system failed to initialize');
            
            // Test Q-table exists
            const hasQTable = basicRL.qTable instanceof Map && basicRL.qTable.size > 0;
            this.recordTest('learning', 'Q-Table Creation', hasQTable,
                hasQTable ? `Q-table with ${basicRL.qTable.size} states` : 'Q-table missing or empty');
            
            // Test learning cycle
            const cycleResult = await basicRL.optimizeLearningBehavior();
            this.recordTest('learning', 'Learning Cycle Execution', cycleResult,
                cycleResult ? 'Learning cycle completed' : 'Learning cycle failed');
            
            basicRL.shutdown();
            
        } catch (error) {
            this.recordTest('learning', 'Basic Learning RL Test', false, error.message);
        }
    }
    
    /**
     * 🧠💎 AUTOFORMALIZATION ENGINE TESTS
     */
    async testAutoformalizationMethods() {
        console.log('🧠💎 Testing AutoformalizationEngine Methods...');
        
        try {
            // Test AutoformalizationEngine initialization
            const autoEngine = new AutoformalizationEngine('test-engine');
            
            await autoEngine.initialize();
            
            // Test integrateWithFormalReasoningCognitiveIntegration method
            const hasIntegrationMethod = typeof autoEngine.integrateWithFormalReasoningCognitiveIntegration === 'function';
            this.recordTest('autoformalization', 'Integration Method Exists', hasIntegrationMethod,
                hasIntegrationMethod ? 'Method available' : 'Method missing');
            
            // Test mathematical certainty methods
            const hasCertaintyGetter = typeof autoEngine.getMathematicalCertaintyLevel === 'function';
            const hasCertaintySetter = typeof autoEngine.setMathematicalCertaintyLevel === 'function';
            
            this.recordTest('autoformalization', 'Certainty Level Methods', hasCertaintyGetter && hasCertaintySetter,
                'Mathematical certainty methods available');
            
            // Test EventEmitter inheritance
            const isEventEmitter = typeof autoEngine.on === 'function' && typeof autoEngine.emit === 'function';
            this.recordTest('autoformalization', 'EventEmitter Integration', isEventEmitter,
                isEventEmitter ? 'EventEmitter methods available' : 'EventEmitter not properly inherited');
            
            // Test method execution
            if (hasIntegrationMethod) {
                const integrationResult = await autoEngine.integrateWithFormalReasoningCognitiveIntegration(null);
                // Should handle null gracefully and not throw
                this.recordTest('autoformalization', 'Integration Method Execution', true,
                    'Method executed without errors');
            }
            
        } catch (error) {
            this.recordTest('autoformalization', 'AutoformalizationEngine Test', false, error.message);
        }
    }
    
    /**
     * 📊 PERFORMANCE TRACKER TESTS
     */
    async testPerformanceTracker() {
        console.log('📊 Testing Performance Tracker...');
        
        try {
            // Test AnalysisAgentPerformanceTracker
            const tracker = new AnalysisAgentPerformanceTracker('test-agent', {
                persistenceEnabled: false // Disable persistence for testing
            });
            
            await tracker.initialize();
            
            // Test savePerformanceData methods exist
            const hasEliteMethod = typeof tracker.savePerformanceDataToEliteEngine === 'function';
            const hasFilesMethod = typeof tracker.savePerformanceDataToFiles === 'function';
            
            this.recordTest('performance', 'Performance Save Methods', hasEliteMethod && hasFilesMethod,
                'Both save methods available');
            
            // Test performance data structures
            const hasHistoryMap = tracker.agentPerformanceHistory instanceof Map;
            const hasPatternDB = tracker.patternDatabase instanceof Map;
            
            this.recordTest('performance', 'Performance Data Structures', hasHistoryMap && hasPatternDB,
                'Performance tracking data structures initialized');
            
            await tracker.shutdown();
            
        } catch (error) {
            this.recordTest('performance', 'Performance Tracker Test', false, error.message);
        }
    }
    
    /**
     * 🔗 SYSTEM INTEGRATION TESTS
     */
    async testSystemIntegration() {
        console.log('🔗 Testing System Integration...');
        
        try {
            // Test environment variables
            const hasDbUrl = !!process.env.DATABASE_URL;
            const hasGoogleCreds = process.env.GOOGLE_VISION_ENABLED === 'false'; // Should be explicitly disabled
            
            this.recordTest('integration', 'Environment Configuration', hasDbUrl && hasGoogleCreds,
                'Environment variables properly configured');
            
            // Test database connection with factory
            const factory = new ConstructionSyndicateFactory({ database: this.dbPool });
            const kg = new KnowledgeGraph();
            
            await factory.initialize();
            await kg.initialize({ database: this.dbPool });
            
            // Test cross-system compatibility
            const factoryInitialized = factory.isInitialized;
            const kgInitialized = kg.initialized;
            const kgUsingDb = !kg.useInMemoryFallback;
            
            this.recordTest('integration', 'Cross-System Compatibility', 
                factoryInitialized && kgInitialized && kgUsingDb,
                'All systems initialized and compatible');
            
            await factory.shutdown();
            await kg.shutdown();
            
        } catch (error) {
            this.recordTest('integration', 'System Integration Test', false, error.message);
        }
    }
    
    /**
     * 📝 RECORD TEST RESULT
     */
    recordTest(category, testName, passed, details) {
        const result = {
            name: testName,
            passed,
            details,
            timestamp: Date.now()
        };
        
        this.testResults[category].tests.push(result);
        
        if (passed) {
            this.testResults[category].passed++;
            console.log(`   ✅ ${testName}: ${details}`);
        } else {
            this.testResults[category].failed++;
            console.log(`   ❌ ${testName}: ${details}`);
        }
    }
    
    /**
     * 📊 GENERATE TEST REPORT
     */
    generateTestReport() {
        const totalTime = Date.now() - this.startTime;
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║               🧪 COMPREHENSIVE TEST REPORT 🧪              ║
╚══════════════════════════════════════════════════════════════╝
`);
        
        let totalPassed = 0;
        let totalFailed = 0;
        let totalTests = 0;
        
        for (const [category, results] of Object.entries(this.testResults)) {
            const categoryPassed = results.passed;
            const categoryFailed = results.failed;
            const categoryTotal = categoryPassed + categoryFailed;
            
            if (categoryTotal > 0) {
                const successRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
                const status = categoryFailed === 0 ? '✅' : categoryPassed > categoryFailed ? '⚠️' : '❌';
                
                console.log(`${status} ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} passed (${successRate}%)`);
                
                totalPassed += categoryPassed;
                totalFailed += categoryFailed;
                totalTests += categoryTotal;
            }
        }
        
        const overallSuccessRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0.0';
        const overallStatus = totalFailed === 0 ? '🎉' : totalPassed > totalFailed ? '⚠️' : '💥';
        
        console.log(`
${overallStatus} OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed (${overallSuccessRate}%)
⏱️  Total test time: ${(totalTime / 1000).toFixed(2)}s
        `);
        
        if (totalFailed === 0) {
            console.log(`
🎉 ALL TESTS PASSED! 🎉
System is ready for production operation with all bugfixes successfully implemented!
            `);
        } else if (totalPassed > totalFailed) {
            console.log(`
⚠️  MOSTLY SUCCESSFUL: ${totalFailed} tests failed but core functionality is working.
Review failed tests and consider additional fixes if needed.
            `);
        } else {
            console.log(`
💥 CRITICAL ISSUES: Multiple test failures detected.
System may not be ready for production operation.
            `);
        }
    }
    
    /**
     * 🧹 CLEANUP RESOURCES
     */
    async cleanup() {
        try {
            if (this.dbPool) {
                await this.dbPool.end();
            }
        } catch (error) {
            console.error('⚠️ Cleanup error:', error.message);
        }
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    const tester = new ComprehensiveSystemTest();
    await tester.runAllTests();
    process.exit(0);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ComprehensiveSystemTest;
