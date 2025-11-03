/**
 * @file pretraining-system-test.js
 * @description Integration tests for the ArbitragePretrainingSystem
 */

import { ArbitragePretrainingSystem } from '../../src/training/ArbitragePretrainingSystem.js';
import { SyntheticDataGenerator } from '../../src/training/SyntheticDataGenerator.js';
import { BlockReplaySystem } from '../../src/training/BlockReplaySystem.js';
import { CurriculumManager } from '../../src/training/CurriculumManager.js';
import { QuantumEnhancedLearningService } from '../../src/services/QuantumEnhancedLearningService.js';
import { MultiRPCProviderManager } from '../../src/services/MultiRPCProviderManager.js';
import { createPool } from '../../src/database/db.js';
import dotenv from 'dotenv';
import assert from 'assert';

// Load environment variables
dotenv.config();

// Test configuration
const TEST_CONFIG = {
  chains: ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'bsc'],
  blockCount: 10,
  syntheticOpportunityCount: 50,
  curriculumLevels: 5,
  testTimeout: 300000, // 5 minutes
  dbConfig: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'construction_syndicate',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },
  rpcConfig: {
    ethereum: process.env.ETH_RPC_URL,
    arbitrum: process.env.ARB_RPC_URL,
    optimism: process.env.OPT_RPC_URL,
    base: process.env.BASE_RPC_URL,
    polygon: process.env.POLYGON_RPC_URL,
  }
};

// Main test function
async function runIntegrationTests() {
  console.log('Starting ArbitragePretrainingSystem integration tests...');
  let db = null;
  let pretrainingSystem = null;
  
  try {
    // Initialize database connection
    console.log('Connecting to database...');
    db = createPool(TEST_CONFIG.dbConfig);
    await testDatabaseConnection(db);
    
    // Initialize and test components individually
    console.log('Testing individual components...');
    await testSyntheticDataGenerator();
    await testBlockReplaySystem();
    await testCurriculumManager();
    await testQuantumEnhancedLearningService(db);
    
    // Initialize and test the full pretraining system
    console.log('Initializing full pretraining system...');
    pretrainingSystem = new ArbitragePretrainingSystem({
      chains: TEST_CONFIG.chains,
      rpcUrls: TEST_CONFIG.rpcConfig,
      db: db
    });
    
    await testPretrainingSystemInitialization(pretrainingSystem);
    await testSyntheticDataGeneration(pretrainingSystem);
    await testCurriculumCreation(pretrainingSystem);
    await testTrainingStage(pretrainingSystem);
    await testSystemPersistence(pretrainingSystem, db);
    
    console.log('All integration tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Integration test failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (pretrainingSystem) {
      await pretrainingSystem.shutdown();
    }
    if (db) {
      await db.end();
    }
  }
}

// Test database connection
async function testDatabaseConnection(db) {
  try {
    const result = await db.query('SELECT NOW()');
    assert(result.rows.length > 0, 'Database query should return at least one row');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
}

// Test SyntheticDataGenerator
async function testSyntheticDataGenerator() {
  try {
    const generator = new SyntheticDataGenerator({
      chains: TEST_CONFIG.chains
    });
    
    // Generate test opportunities
    const opportunities = await generator.generateOpportunities(10);
    
    // Validate opportunities
    assert(Array.isArray(opportunities), 'Generated opportunities should be an array');
    assert(opportunities.length === 10, 'Should generate 10 opportunities');
    
    // Validate opportunity structure
    const opportunity = opportunities[0];
    assert(opportunity.hasOwnProperty('chain'), 'Opportunity should have chain property');
    assert(opportunity.hasOwnProperty('type'), 'Opportunity should have type property');
    assert(opportunity.hasOwnProperty('route'), 'Opportunity should have route property');
    assert(Array.isArray(opportunity.route), 'Route should be an array');
    
    console.log('✅ SyntheticDataGenerator tests passed');
  } catch (error) {
    console.error('SyntheticDataGenerator test failed:', error);
    throw error;
  }
}

// Test BlockReplaySystem
async function testBlockReplaySystem() {
  try {
    const rpcManager = new MultiRPCProviderManager(TEST_CONFIG.rpcConfig);
    await rpcManager.initialize();
    
    const blockReplay = new BlockReplaySystem({
      rpcProviderManager: rpcManager
    });
    
    // Test fetching historical blocks
    const blocks = await blockReplay.fetchHistoricalBlocks('ethereum', 5, 'latest');
    
    // Validate blocks
    assert(Array.isArray(blocks), 'Fetched blocks should be an array');
    assert(blocks.length === 5, 'Should fetch 5 blocks');
    
    // Validate block structure
    const block = blocks[0];
    assert(block.hasOwnProperty('number'), 'Block should have number property');
    assert(block.hasOwnProperty('hash'), 'Block should have hash property');
    assert(block.hasOwnProperty('transactions'), 'Block should have transactions property');
    
    console.log('✅ BlockReplaySystem tests passed');
  } catch (error) {
    console.error('BlockReplaySystem test failed:', error);
    throw error;
  }
}

// Test CurriculumManager
async function testCurriculumManager() {
  try {
    const curriculumManager = new CurriculumManager({
      levels: TEST_CONFIG.curriculumLevels
    });
    
    // Generate test opportunities
    const generator = new SyntheticDataGenerator({
      chains: TEST_CONFIG.chains
    });
    const opportunities = await generator.generateOpportunities(20);
    
    // Create curriculum
    const curriculum = await curriculumManager.createCurriculum(opportunities);
    
    // Validate curriculum
    assert(curriculum.hasOwnProperty('levels'), 'Curriculum should have levels property');
    assert(Object.keys(curriculum.levels).length === TEST_CONFIG.curriculumLevels, 
      `Curriculum should have ${TEST_CONFIG.curriculumLevels} levels`);
    
    // Check that all opportunities are assigned to a level
    let totalOpportunities = 0;
    for (const level in curriculum.levels) {
      totalOpportunities += curriculum.levels[level].length;
    }
    assert(totalOpportunities === 20, 'All opportunities should be assigned to a level');
    
    console.log('✅ CurriculumManager tests passed');
  } catch (error) {
    console.error('CurriculumManager test failed:', error);
    throw error;
  }
}

// Test QuantumEnhancedLearningService
async function testQuantumEnhancedLearningService(db) {
  try {
    // Create mock config
    const config = {
      populationSize: 20,
      genomeSize: 10,
      memoryPersistenceInterval: 5000,
      predictionHorizon: 10
    };
    
    // Initialize service
    const learningService = new QuantumEnhancedLearningService(config, db);
    await learningService.initialize();
    
    // Generate test opportunity
    const generator = new SyntheticDataGenerator({
      chains: ['ethereum']
    });
    const opportunities = await generator.generateOpportunities(1);
    const opportunity = opportunities[0];
    
    // Test opportunity evaluation
    const evaluation = await learningService.evaluateOpportunity(opportunity);
    
    // Validate evaluation
    assert(evaluation.hasOwnProperty('confidenceScore'), 'Evaluation should have confidenceScore property');
    assert(evaluation.hasOwnProperty('shouldExecute'), 'Evaluation should have shouldExecute property');
    assert(evaluation.hasOwnProperty('executionParams'), 'Evaluation should have executionParams property');
    
    // Test opportunity processing
    const processingResult = await learningService.processOpportunity(opportunity, true, '0x1234567890abcdef');
    
    // Validate processing result
    assert(processingResult.hasOwnProperty('rewardResult'), 'Processing result should have rewardResult property');
    assert(processingResult.hasOwnProperty('evolutionResult'), 'Processing result should have evolutionResult property');
    
    // Clean up
    await learningService.shutdown();
    
    console.log('✅ QuantumEnhancedLearningService tests passed');
  } catch (error) {
    console.error('QuantumEnhancedLearningService test failed:', error);
    throw error;
  }
}

// Test pretraining system initialization
async function testPretrainingSystemInitialization(pretrainingSystem) {
  try {
    await pretrainingSystem.initialize();
    assert(pretrainingSystem.isInitialized, 'Pretraining system should be initialized');
    
    // Check that all components are initialized
    assert(pretrainingSystem.blockReplaySystem, 'BlockReplaySystem should be initialized');
    assert(pretrainingSystem.syntheticDataGenerator, 'SyntheticDataGenerator should be initialized');
    assert(pretrainingSystem.curriculumManager, 'CurriculumManager should be initialized');
    assert(pretrainingSystem.learningService, 'QuantumEnhancedLearningService should be initialized');
    
    console.log('✅ PretrainingSystem initialization test passed');
  } catch (error) {
    console.error('PretrainingSystem initialization test failed:', error);
    throw error;
  }
}

// Test synthetic data generation in pretraining system
async function testSyntheticDataGeneration(pretrainingSystem) {
  try {
    const opportunities = await pretrainingSystem.generateSyntheticOpportunities(
      TEST_CONFIG.syntheticOpportunityCount
    );
    
    assert(Array.isArray(opportunities), 'Generated opportunities should be an array');
    assert(opportunities.length === TEST_CONFIG.syntheticOpportunityCount, 
      `Should generate ${TEST_CONFIG.syntheticOpportunityCount} opportunities`);
    
    console.log('✅ PretrainingSystem synthetic data generation test passed');
  } catch (error) {
    console.error('PretrainingSystem synthetic data generation test failed:', error);
    throw error;
  }
}

// Test curriculum creation in pretraining system
async function testCurriculumCreation(pretrainingSystem) {
  try {
    const opportunities = await pretrainingSystem.generateSyntheticOpportunities(20);
    const curriculum = await pretrainingSystem.createCurriculum(opportunities);
    
    assert(curriculum.hasOwnProperty('levels'), 'Curriculum should have levels property');
    assert(Object.keys(curriculum.levels).length > 0, 'Curriculum should have at least one level');
    
    console.log('✅ PretrainingSystem curriculum creation test passed');
  } catch (error) {
    console.error('PretrainingSystem curriculum creation test failed:', error);
    throw error;
  }
}

// Test training stage in pretraining system
async function testTrainingStage(pretrainingSystem) {
  try {
    // Generate opportunities and create curriculum
    const opportunities = await pretrainingSystem.generateSyntheticOpportunities(30);
    const curriculum = await pretrainingSystem.createCurriculum(opportunities);
    
    // Run training stage for level 1
    const trainingResult = await pretrainingSystem.runTrainingStage(curriculum.levels[1], 1);
    
    assert(trainingResult.hasOwnProperty('completedOpportunities'), 
      'Training result should have completedOpportunities property');
    assert(trainingResult.hasOwnProperty('learningMetrics'), 
      'Training result should have learningMetrics property');
    
    console.log('✅ PretrainingSystem training stage test passed');
  } catch (error) {
    console.error('PretrainingSystem training stage test failed:', error);
    throw error;
  }
}

// Test system persistence
async function testSystemPersistence(pretrainingSystem, db) {
  try {
    // Save state
    await pretrainingSystem.saveState();
    
    // Check that state was saved to database
    const result = await db.query('SELECT * FROM pretraining_state ORDER BY timestamp DESC LIMIT 1');
    assert(result.rows.length === 1, 'Should have one state record in database');
    
    // Load state
    await pretrainingSystem.loadState();
    
    console.log('✅ PretrainingSystem persistence test passed');
  } catch (error) {
    console.error('PretrainingSystem persistence test failed:', error);
    throw error;
  }
}

// Run the tests
runIntegrationTests().catch(error => {
  console.error('Fatal error in integration tests:', error);
  process.exit(1);
});
