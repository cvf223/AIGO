#!/usr/bin/env node

/**
 * 🔍 INCREMENTAL MODULE LOADER - FIND THE CULPRIT
 * ================================================
 * 
 * Loads modules ONE BY ONE to identify which causes ERR_INTERNAL_ASSERTION
 * Once we find it, we can remove/fix ONLY that module
 */

import { EventEmitter } from 'events';
import dotenv from 'dotenv';

console.log('🔍 INCREMENTAL MODULE LOADING TEST');
console.log('====================================\n');

dotenv.config();

let moduleCount = 0;

async function testModule(name, importPath) {
    try {
        moduleCount++;
        console.log(`${moduleCount}. Loading ${name}...`);
        await import(importPath);
        console.log(`   ✅ ${name} loaded successfully\n`);
        return true;
    } catch (error) {
        console.log(`   ❌ ${name} FAILED!`);
        console.log(`   Error: ${error.message}\n`);
        console.log(`🚨 CULPRIT FOUND: ${name}`);
        console.log(`   Path: ${importPath}`);
        console.log(`   This is the module causing the crash!`);
        process.exit(1);
    }
}

async function loadModulesIncrementally() {
    console.log('PHASE 1: Core Utilities');
    console.log('=======================\n');
    
    await testModule('Null Guards', './src/patches/ApplyNullGuards.js');
    await testModule('Delayed Tasks Patch', './src/patches/DelayedBackgroundTasksPatch.js');
    
    console.log('PHASE 2: Database & Memory');
    console.log('===========================\n');
    
    await testModule('Database Manager', './src/database/EnhancedDatabaseManager.js');
    await testModule('SharedMemorySystem', './src/memory/SharedMemorySystem.js');
    
    console.log('PHASE 3: Construction Core');
    console.log('===========================\n');
    
    await testModule('ConstructionSyndicateOrchestrator', './src/construction/ConstructionSyndicateOrchestrator.js');
    await testModule('ConstructionWorldModel', './src/learning/ConstructionWorldModel.js');
    await testModule('ConstructionSyndicateFactory', './src/construction/factories/ConstructionSyndicateFactory.js');
    
    console.log('PHASE 4: LLM & Context');
    console.log('=======================\n');
    
    await testModule('ContextEngine', './src/services/ContextEngine.js');
    await testModule('LLMJudgeCentralNervousSystem', './src/core/LLMJudgeCentralNervousSystem.js');
    
    console.log('PHASE 5: Formal Reasoning');
    console.log('==========================\n');
    
    await testModule('FormalReasoningConstructionIntegration', './src/construction/cognitive/FormalReasoningConstructionIntegration.js');
    await testModule('ProactiveConstructionKnowledgePipeline', './src/construction/prevention/ProactiveConstructionKnowledgePipeline.js');
    await testModule('ProactiveConstructionInferenceEngine', './src/construction/prevention/ProactiveConstructionInferenceEngine.js');
    
    console.log('PHASE 6: Learning Systems');
    console.log('==========================\n');
    
    await testModule('AlphaGnomeEvolutionarySystem', './learning/AlphaGnomeEvolutionarySystem.js');
    await testModule('QuantumEvolutionMasterSystem', './learning/quantum-evolution-master-system.js');
    await testModule('ConstructionExpertiseSystem', './src/construction/learning/ConstructionExpertiseSystem.js');
    await testModule('BoundedA2CDDPSystem', './learning/bounded-a2c-ddp-system.js');
    await testModule('AdaptiveMetaLearningEngine', './learning/adaptive-meta-learning-engine.js');
    
    console.log('PHASE 7: Quantum Systems');
    console.log('=========================\n');
    
    await testModule('QuantumEnhancedMDPIntegration', './learning/quantum-enhanced-mdp-integration.js');
    await testModule('QuantumInspiredLearningEngine', './learning/quantum-inspired-learning-engine.js');
    await testModule('QuantumLearningIntegration', './src/learning/QuantumLearningIntegration.js');
    await testModule('QuantumEnhancedLearningService', './src/services/QuantumEnhancedLearningService.js');
    
    console.log('PHASE 8: Advanced Quantum');
    console.log('==========================\n');
    
    await testModule('QuantumEnhancedQuantizationEngine', './src/llm/QuantumEnhancedQuantizationEngine.js');
    await testModule('QuantumSuperpositionEngine', './src/quantum/QuantumSuperpositionEngine.js');
    await testModule('QuantumNodeEngine', './src/quantum/QuantumNodeEngine.js');
    await testModule('QuantumCoherenceEngine', './src/quantum/QuantumCoherenceEngine.js');
    await testModule('QuantumEntanglementEngine', './src/quantum/QuantumEntanglementEngine.js');
    
    console.log('PHASE 9: MDP Systems');
    console.log('====================\n');
    
    await testModule('EliteMDPFramework', './src/core/EliteMDPFramework.js');
    await testModule('CollectiveMDPCoordinator', './src/core/CollectiveMDPCoordinator.js');
    await testModule('MDPBackgroundTaskIntegrator', './src/core/MDPBackgroundTaskIntegrator.js');
    await testModule('ConstructionMDPTaskSelector', './src/construction/tasks/ConstructionMDPTaskSelector.js');
    
    console.log('PHASE 10: Optimization');
    console.log('======================\n');
    
    await testModule('NeuralOptimizationEngine', './learning/neural-optimization-engine.js');
    await testModule('UltraFastTransformerDecisionEngine', './learning/UltraFastTransformerDecisionEngine.js');
    
    console.log('PHASE 11: Creativity Systems');
    console.log('=============================\n');
    
    await testModule('CreativitySystemIntegrator', './src/creativity/CreativitySystemIntegrator.js');
    await testModule('OvertrainingPreventionEngine', './src/creativity/OvertrainingPreventionEngine.js');
    await testModule('MemorizationSinksArchitecture', './src/creativity/MemorizationSinksArchitecture.js');
    await testModule('SophisticatedModelSteeringEngine', './src/creativity/SophisticatedModelSteeringEngine.js');
    
    console.log('PHASE 12: Integration Systems');
    console.log('==============================\n');
    
    await testModule('IntegrateAdvancedMemory', './src/memory/IntegrateAdvancedMemory.js');
    await testModule('ThreePillarsIntegration', './src/memory/IntegrateThreePillars.js');
    await testModule('ComprehensiveEnhancementIntegrator', './src/integration/ComprehensiveEnhancementIntegrator.js');
    
    console.log('PHASE 13: Persistence');
    console.log('======================\n');
    
    await testModule('SystemStatePersistence', './src/core/SystemStatePersistence.js');
    await testModule('NonLLMDataCollector', './src/persistence/NonLLMDataCollector.js');
    await testModule('DataCollectionBridge', './src/persistence/DataCollectionBridge.js');
    
    console.log('');
    console.log('🎉 ALL MODULES LOADED SUCCESSFULLY!');
    console.log('====================================');
    console.log('');
    console.log(`Total modules loaded: ${moduleCount}`);
    console.log('No CJS/ESM conflicts found!');
    console.log('');
    console.log('✅ The construction system is clean!');
}

// Run the test
loadModulesIncrementally().then(() => {
    console.log('\n✅ Test complete - all modules are compatible!');
    process.exit(0);
}).catch(error => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
});

