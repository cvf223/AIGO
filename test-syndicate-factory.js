#!/usr/bin/env node

/**
 * 🧪 TEST SCRIPT: initializeSyndicateFactory() ONLY
 * ==================================================
 * 
 * This script ONLY runs initializeSyndicateFactory() to isolate the error.
 * It sets up minimal dependencies and then calls the method.
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import required classes
import { ConstructionSyndicateFactory } from './src/construction/factories/ConstructionSyndicateFactory.js';
import { DatabasePoolManager } from './src/database/DatabasePoolManager.js';
import databaseManager from './src/database/EnhancedDatabaseManager.js';

console.log('🧪 ========================================');
console.log('🧪 TEST: initializeSyndicateFactory() ONLY');
console.log('🧪 ========================================');
console.log('');

async function testInitializeSyndicateFactory() {
    try {
        // STEP 1: Initialize Database
        console.log('🧪 [TEST STEP 1] Initializing Database...');
        
        await databaseManager.initialize();
        const dbStatus = databaseManager.getStatus();
        console.log('   ✅ Database initialized:', dbStatus.poolStats);
        
        const dbPool = await databaseManager.getPool();
        console.log('   ✅ Database pool obtained');
        
        // STEP 1.5: Initialize DatabasePoolManager singleton (CRITICAL!)
        console.log('🧪 [TEST STEP 1.5] Initializing DatabasePoolManager singleton...');
        const dbManager = DatabasePoolManager.getInstance();
        await dbManager.initialize();
        console.log('   ✅ DatabasePoolManager singleton initialized');
        
        // STEP 2: Create minimal config
        console.log('\n🧪 [TEST STEP 2] Creating minimal config...');
        
        const config = (typeof { === "object" ? { : {})
            mode: 'construction',
            projectType: 'hoai_lp6_7',
            database: {
                connectionString: process.env.DATABASE_URL,
                pool: dbPool,
                connect: async () => await dbPool.connect()
            }
        };
        console.log('   ✅ Config created');
        
        // STEP 3: Create minimal orchestrator instance (mock)
        console.log('\n🧪 [TEST STEP 3] Creating minimal orchestrator mock...');
        
        const orchestrator = {
            config: config,
            dbPool: dbPool,
            centralNervousSystem: null, // Not needed for factory init
            worldModel: null,            // Not needed for factory init
            contextEngine: null,         // Not needed for factory init
            alphaGnome: null,
            quantumEvolution: null,
            ultraFastTransformer: null,
            alphaFold: null,
            boundedA2C: null,
            adaptiveMeta: null,
            quantumMDP: null,
            eliteMDP: null,
            collectiveMDP: null,
            neuralOptimizer: null,
            advancedMemoryIntegration: null
        };
        
        // STEP 4: Call initializeSyndicateFactory (from startfullsyndicate.js)
        console.log('\n🧪 [TEST STEP 4] Calling initializeSyndicateFactory()...');
        console.log('🧪 [TEST STEP 4] This is where the error should occur...\n');
        
        // Copy the method logic directly (from startfullsyndicate.js)
        await initializeSyndicateFactory.call(orchestrator);
        
        console.log('\n🧪 ========================================');
        console.log('🧪 TEST COMPLETED SUCCESSFULLY!');
        console.log('🧪 ========================================\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n🧪 ========================================');
        console.error('🧪 TEST FAILED WITH ERROR!');
        console.error('🧪 ========================================');
        console.error(`🧪 Error Message: ${error.message}`);
        console.error(`🧪 Error Type: ${error.constructor.name}`);
        console.error(`🧪 Error Stack:`);
        console.error(error.stack);
        console.error('🧪 ========================================\n');
        
        process.exit(1);
    }
}

/**
 * Copy of initializeSyndicateFactory from startfullsyndicate.js
 */
async function initializeSyndicateFactory() {
    console.log('\n🔧 DEBUG: ========================================');
    console.log('🔧 DEBUG: initializeSyndicateFactory() STARTED');
    console.log('🔧 DEBUG: ========================================');
    console.log('   🏭 Creating Syndicate Factory...');
    
    try {
        // CONSTRUCTION MODE CHECK - Ensure no arbitrage code runs
        console.log('🔧 DEBUG: [Step 6.1] Checking construction mode...');
        const isConstructionMode = this.config.mode === 'construction';
        console.log(`🔧 DEBUG: [Step 6.1] isConstructionMode = ${isConstructionMode}`);
        if (!isConstructionMode) {
            console.warn('⚠️ System configured for construction mode only');
            this.config.mode = 'construction';
        }
        
        // DEBUG: Check dependencies
        console.log('🔧 DEBUG: [Step 6.2] Validating dependencies...');
        console.log(`🔧 DEBUG: [Step 6.2] this.config.database = ${this.config.database ? 'EXISTS' : 'NULL/UNDEFINED'}`);
        console.log(`🔧 DEBUG: [Step 6.2] this.dbPool = ${this.dbPool ? 'EXISTS' : 'NULL/UNDEFINED'}`);
        console.log(`🔧 DEBUG: [Step 6.2] this.centralNervousSystem = ${this.centralNervousSystem ? 'EXISTS' : 'NULL/UNDEFINED'}`);
        console.log(`🔧 DEBUG: [Step 6.2] this.worldModel = ${this.worldModel ? 'EXISTS' : 'NULL/UNDEFINED'}`);
        console.log(`🔧 DEBUG: [Step 6.2] this.contextEngine = ${this.contextEngine ? 'EXISTS' : 'NULL/UNDEFINED'}`);
        
        if (!this.config.database) {
            console.error('❌ DEBUG: this.config.database is NULL/UNDEFINED - this will cause factory initialization to fail!');
        }
        if (!this.dbPool) {
            console.error('❌ DEBUG: this.dbPool is NULL/UNDEFINED - factory may not have database access!');
        }
        
        console.log('🔧 DEBUG: [Step 6.3] Creating ConstructionSyndicateFactory instance...');
        console.log('🔧 DEBUG: [Step 6.3] Factory config object:', {
            hasDatabase: !!this.config.database,
            hasDbPool: !!this.dbPool,
            hasCNS: !!this.centralNervousSystem,
            hasWorldModel: !!this.worldModel,
            hasContextEngine: !!this.contextEngine
        });
        
        this.syndicateFactory = new ConstructionSyndicateFactory({
            database: this.config.database,
            sharedDatabasePool: this.dbPool,
            centralNervousSystem: this.centralNervousSystem,
            worldModel: this.worldModel,
            contextEngine: this.contextEngine
        });
        
        console.log('🔧 DEBUG: [Step 6.4] Factory instance created successfully');
        console.log(`🔧 DEBUG: [Step 6.4] Factory type: ${typeof this.syndicateFactory}`);
        console.log(`🔧 DEBUG: [Step 6.4] Factory has initialize method: ${typeof this.syndicateFactory.initialize === 'function'}`);
        
        // Connect all learning systems
        console.log('🔧 DEBUG: [Step 6.5] Connecting learning systems...');
        console.log(`🔧 DEBUG: [Step 6.5] alphaGnome = ${this.alphaGnome ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] quantumEvolution = ${this.quantumEvolution ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] ultraFastTransformer = ${this.ultraFastTransformer ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] alphaFold = ${this.alphaFold ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] boundedA2C = ${this.boundedA2C ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] adaptiveMeta = ${this.adaptiveMeta ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] quantumMDP = ${this.quantumMDP ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] eliteMDP = ${this.eliteMDP ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] collectiveMDP = ${this.collectiveMDP ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.5] neuralOptimizer = ${this.neuralOptimizer ? 'EXISTS' : 'NULL'}`);
        
        this.syndicateFactory.alphaGnome = this.alphaGnome;
        this.syndicateFactory.quantumEvolution = this.quantumEvolution;
        this.syndicateFactory.ultraFastTransformer = this.ultraFastTransformer;
        this.syndicateFactory.alphaFold = this.alphaFold;
        this.syndicateFactory.boundedA2C = this.boundedA2C;
        this.syndicateFactory.adaptiveMeta = this.adaptiveMeta;
        this.syndicateFactory.quantumMDP = this.quantumMDP;
        this.syndicateFactory.eliteMDP = this.eliteMDP;
        this.syndicateFactory.collectiveMDP = this.collectiveMDP;
        this.syndicateFactory.neuralOptimizer = this.neuralOptimizer;
        
        console.log('🔧 DEBUG: [Step 6.6] All learning systems connected to factory');
        
        console.log('🔧 DEBUG: [Step 6.7] Calling factory.initialize()...');
        console.log('🔧 DEBUG: [Step 6.7] This may take some time...');
        const factoryInitStart = Date.now();
        
        await this.syndicateFactory.initialize();
        
        const factoryInitDuration = Date.now() - factoryInitStart;
        console.log(`🔧 DEBUG: [Step 6.7] factory.initialize() completed in ${factoryInitDuration}ms`);
        console.log('   ✅ Syndicate Factory operational');
        
        // 🎯 CRITICAL: INTEGRATE Advanced Memory with now-initialized Factory
        console.log('🔧 DEBUG: [Step 6.8] Checking for advanced memory integration...');
        console.log(`🔧 DEBUG: [Step 6.8] this.advancedMemoryIntegration = ${this.advancedMemoryIntegration ? 'EXISTS' : 'NULL'}`);
        console.log(`🔧 DEBUG: [Step 6.8] this.syndicateFactory = ${this.syndicateFactory ? 'EXISTS' : 'NULL'}`);
        
        if (this.advancedMemoryIntegration && this.syndicateFactory) {
            console.log('   🔗 Integrating Advanced Memory with initialized Factory...');
            console.log('🔧 DEBUG: [Step 6.8] Calling integrateWithSyndicate...');
            const memoryIntegrationStart = Date.now();
            
            try {
                // First-time integration with syndicate (now that factory exists!)
                await this.advancedMemoryIntegration.integrateWithSyndicate(this, {
                    database: this.dbPool,
                    eventBus: this
                });
                
                const memoryIntegrationDuration = Date.now() - memoryIntegrationStart;
                console.log(`🔧 DEBUG: [Step 6.8] Memory integration completed in ${memoryIntegrationDuration}ms`);
                console.log('   ✅ Advanced Memory integration complete!');
            } catch (error) {
                console.error(`🔧 DEBUG: [Step 6.8] Memory integration ERROR:`, error);
                console.error(`🔧 DEBUG: [Step 6.8] Error stack:`, error.stack);
                console.warn(`   ⚠️ Memory integration partial: ${error.message}`);
            }
        } else {
            console.log('🔧 DEBUG: [Step 6.8] Skipping memory integration (conditions not met)');
        }
        
        console.log('🔧 DEBUG: ========================================');
        console.log('🔧 DEBUG: initializeSyndicateFactory() COMPLETED');
        console.log('🔧 DEBUG: ========================================\n');
        
    } catch (error) {
        console.error('\n🔧 DEBUG: ========================================');
        console.error('🔧 DEBUG: initializeSyndicateFactory() ERROR!');
        console.error('🔧 DEBUG: ========================================');
        console.error(`🔧 DEBUG: Error message: ${error.message}`);
        console.error(`🔧 DEBUG: Error type: ${error.constructor.name}`);
        console.error(`🔧 DEBUG: Error stack:`, error.stack);
        console.error('🔧 DEBUG: Current state:');
        console.error(`🔧 DEBUG:   - this.syndicateFactory: ${this.syndicateFactory ? 'EXISTS' : 'NULL'}`);
        console.error(`🔧 DEBUG:   - this.dbPool: ${this.dbPool ? 'EXISTS' : 'NULL'}`);
        console.error(`🔧 DEBUG:   - this.config.database: ${this.config.database ? 'EXISTS' : 'NULL'}`);
        console.error('🔧 DEBUG: ========================================\n');
        throw error; // Re-throw to see full error in main flow
    }
}

// Run the test
testInitializeSyndicateFactory().catch(error => {
    console.error('💥 FATAL ERROR:', error);
    process.exit(1);
});

