#!/usr/bin/env node
/**
 * 🎯 TARGETED COMPONENT TESTING
 * ============================
 * 
 * Memory-efficient testing focused on the specific components we fixed
 * Tests each component in isolation to avoid memory exhaustion.
 */

import { DatabasePoolManager } from '../src/database/DatabasePoolManager.js';

console.log(`
╔══════════════════════════════════════════════════════════════╗
║            🎯 TARGETED COMPONENT TESTING 🎯                 ║
║                                                              ║
║        Testing fixed components without full system load     ║
╚══════════════════════════════════════════════════════════════╝
`);

let testResults = { passed: 0, failed: 0, tests: [] };

function recordTest(testName, passed, details) {
    const result = { name: testName, passed, details, timestamp: Date.now() };
    testResults.tests.push(result);
    
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}: ${details}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName}: ${details}`);
    }
}

async function testDatabaseConnection() {
    console.log('🗄️ Testing Database Connection...');
    
    try {
        const dbPool = DatabasePoolManager.getInstance();
        await dbPool.initialize();
        
        // Test basic connection
        const result = await dbPool.query('SELECT NOW() as time, current_database() as db');
        const dbName = result.rows[0].db;
        
        recordTest('Database Connection', true, `Connected to ${dbName}`);
        
        // Test knowledge graph tables exist
        const kgTables = await dbPool.query(`
            SELECT COUNT(*) as count FROM information_schema.tables 
            WHERE table_name IN ('kg_nodes', 'kg_relationships', 'kg_entanglements')
        `);
        
        const tableCount = parseInt(kgTables.rows[0].count);
        recordTest('Knowledge Graph Tables', tableCount === 3, 
            `${tableCount}/3 KG tables found`);
        
        await dbPool.end();
        
    } catch (error) {
        recordTest('Database Connection', false, error.message);
    }
}

async function testProactiveCognitiveLoop() {
    console.log('🧠 Testing Proactive Cognitive Loop...');
    
    try {
        const { ProactiveCognitiveMetabolicLoop } = await import('../src/prevention/ProactiveCognitiveMetabolicLoop.js');
        
        const loop = new ProactiveCognitiveMetabolicLoop({
            metabolicRate: 0.1,
            enablePerformanceTracking: false
        });
        
        // Test _generateCognitivePattern method exists
        const hasMethod = typeof loop._generateCognitivePattern === 'function';
        recordTest('Cognitive Pattern Method Exists', hasMethod, 
            hasMethod ? 'Method available' : 'Method missing');
        
        if (hasMethod) {
            // Test method execution
            const pattern = loop._generateCognitivePattern('test-specialist');
            const validPattern = pattern && pattern.name === 'test-specialist';
            recordTest('Cognitive Pattern Generation', validPattern,
                validPattern ? 'Pattern generated correctly' : 'Invalid pattern');
        }
        
        await loop.shutdown();
        
    } catch (error) {
        recordTest('Proactive Cognitive Loop', false, error.message);
    }
}

async function testAutoformalizationEngine() {
    console.log('🧠💎 Testing AutoformalizationEngine...');
    
    try {
        const { AutoformalizationEngine } = await import('../src/formalization/AutoformalizationEngine.js');
        
        const engine = new AutoformalizationEngine('test-engine');
        
        // Test integrateWithFormalReasoningCognitiveIntegration method
        const hasIntegrationMethod = typeof engine.integrateWithFormalReasoningCognitiveIntegration === 'function';
        recordTest('Integration Method Exists', hasIntegrationMethod,
            hasIntegrationMethod ? 'Method available' : 'Method missing');
        
        // Test EventEmitter inheritance
        const isEventEmitter = typeof engine.on === 'function' && typeof engine.emit === 'function';
        recordTest('EventEmitter Integration', isEventEmitter,
            isEventEmitter ? 'EventEmitter methods available' : 'Missing EventEmitter');
        
        // Test mathematical certainty methods
        const hasCertaintyMethods = 
            typeof engine.getMathematicalCertaintyLevel === 'function' &&
            typeof engine.setMathematicalCertaintyLevel === 'function';
        recordTest('Certainty Level Methods', hasCertaintyMethods,
            hasCertaintyMethods ? 'Certainty methods available' : 'Certainty methods missing');
        
        // Test method execution (should not throw)
        if (hasIntegrationMethod) {
            await engine.integrateWithFormalReasoningCognitiveIntegration(null);
            recordTest('Integration Method Execution', true, 'Method executed without errors');
        }
        
    } catch (error) {
        recordTest('AutoformalizationEngine Test', false, error.message);
    }
}

async function testBasicLearningRL() {
    console.log('🤖 Testing Basic Learning RL...');
    
    try {
        const { BasicLearningRL } = await import('../learning/BasicLearningRL.js');
        
        const basicRL = new BasicLearningRL({
            learningRate: 0.01,
            explorationRate: 0.1,
            enablePersistence: false // Disable for testing
        });
        
        // Test initialization
        await basicRL.initialize();
        recordTest('BasicLearningRL Initialization', basicRL.initialized,
            basicRL.initialized ? 'RL system initialized' : 'RL initialization failed');
        
        // Test Q-table exists
        const hasQTable = basicRL.qTable instanceof Map;
        recordTest('Q-Table Creation', hasQTable,
            hasQTable ? `Q-table created with ${basicRL.qTable.size} states` : 'Q-table missing');
        
        basicRL.shutdown();
        
    } catch (error) {
        recordTest('Basic Learning RL Test', false, error.message);
    }
}

async function testConstructionSyndicateFactory() {
    console.log('🏭 Testing Construction Syndicate Factory...');
    
    try {
        const { ConstructionSyndicateFactory } = await import('../src/construction/factories/ConstructionSyndicateFactory.js');
        
        const factory = new ConstructionSyndicateFactory({
            enableQuantumSystems: false, // Disable to reduce complexity
            enableLearning: true,
            database: null // No database for simple test
        });
        
        // Test agents Map exists
        const hasAgentsMap = factory.agents instanceof Map;
        recordTest('Agents Map Exists', hasAgentsMap, 
            hasAgentsMap ? 'Agents Map available' : 'Missing agents Map');
        
        // Test reward systems registry exists
        const hasRewardRegistry = factory.rewardSystemsRegistry instanceof Map;
        recordTest('Reward Systems Registry', hasRewardRegistry,
            hasRewardRegistry ? 'Reward registry available' : 'Missing reward registry');
        
        // Test collective learning registry exists
        const hasLearningRegistry = factory.collectiveLearningRegistry instanceof Map;
        recordTest('Collective Learning Registry', hasLearningRegistry,
            hasLearningRegistry ? 'Learning registry available' : 'Missing learning registry');
        
        // Test service registry exists
        const hasServiceRegistry = factory.serviceRegistry && typeof factory.serviceRegistry === 'object';
        recordTest('Service Registry Exists', hasServiceRegistry,
            hasServiceRegistry ? 'Service registry available' : 'Missing service registry');
        
    } catch (error) {
        recordTest('Construction Syndicate Factory Test', false, error.message);
    }
}

async function testEnvironmentConfiguration() {
    console.log('🌍 Testing Environment Configuration...');
    
    try {
        // Test DATABASE_URL
        const hasDbUrl = !!process.env.DATABASE_URL;
        recordTest('DATABASE_URL Set', hasDbUrl, 
            hasDbUrl ? 'Database URL configured' : 'Missing DATABASE_URL');
        
        // Test Google credentials (should be disabled)
        const googleDisabled = process.env.GOOGLE_VISION_ENABLED === 'false';
        recordTest('Google Vision Disabled', googleDisabled,
            googleDisabled ? 'Google Vision properly disabled' : 'Google Vision misconfigured');
        
        // Test Node environment
        const isProduction = process.env.NODE_ENV === 'production';
        recordTest('Production Environment', isProduction,
            isProduction ? 'Production mode active' : 'Development mode active');
        
    } catch (error) {
        recordTest('Environment Configuration Test', false, error.message);
    }
}

async function generateTestReport() {
    const totalTests = testResults.passed + testResults.failed;
    const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : '0.0';
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                🎯 TARGETED TEST REPORT 🎯                   ║
╚══════════════════════════════════════════════════════════════╝

📊 RESULTS: ${testResults.passed}/${totalTests} tests passed (${successRate}%)
`);
    
    if (testResults.failed === 0) {
        console.log(`🎉 ALL TARGETED TESTS PASSED! 🎉
Core fixed components are working correctly.`);
        return true;
    } else {
        console.log(`⚠️ ${testResults.failed} test(s) failed. Review the failures above.`);
        return false;
    }
}

async function runTargetedTests() {
    try {
        // Run tests in sequence to avoid memory issues
        await testDatabaseConnection();
        await testProactiveCognitiveLoop();
        await testAutoformalizationEngine();
        await testBasicLearningRL();
        await testConstructionSyndicateFactory();
        await testEnvironmentConfiguration();
        
        const allPassed = await generateTestReport();
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        console.error('💥 Critical test failure:', error);
        process.exit(1);
    }
}

runTargetedTests();
