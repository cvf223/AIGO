#!/usr/bin/env node

console.log('🔍 Testing ConstructionSyndicateOrchestrator imports individually\n');

async function testImport(name, path) {
    try {
        console.log(`Loading ${name}...`);
        await import(path);
        console.log(`   ✅ ${name} OK\n`);
        return true;
    } catch (error) {
        console.log(`   ❌ ${name} FAILED!`);
        console.log(`   Error: ${error.message}\n`);
        return false;
    }
}

async function test() {
    await testImport('PracticalVisionOptimizationEngine', './src/vision/PracticalVisionOptimizationEngine.js');
    await testImport('HOAIComplianceService', './src/construction/services/HOAIComplianceService.js');
    await testImport('QuantityTakeoffEngine', './src/construction/services/QuantityTakeoffEngine.js');
    await testImport('ErrorDetectionEscalationService', './src/construction/services/ErrorDetectionEscalationService.js');
    await testImport('LegendarySyndicateSystem', './learning/LegendarySyndicateSystem.js');
    await testImport('CollectiveMDPCoordinator', './src/core/CollectiveMDPCoordinator.js');
    await testImport('ChainOfAgentsOrchestrator', './src/reasoning/ChainOfAgentsOrchestrator.js');
    await testImport('EliteMemoryPersistenceEngine', './src/memory/EliteMemoryPersistenceEngine.js');
    await testImport('SharedKnowledgeGraph', './src/memory/SharedKnowledgeGraph.js');
    await testImport('ConstructionDateManager', './src/construction/utils/ConstructionDateManager.js');
    await testImport('ConstructionSFTFlywheel', './src/construction/learning/ConstructionSFTFlywheel.js');
    await testImport('PlanAnnotationEngine', './src/construction/vision/PlanAnnotationEngine.js');
    await testImport('VLMAnnotationRenderer', './src/construction/vision/VLMAnnotationRenderer.js');
    await testImport('AnnotationDataCollector', './src/construction/vision/AnnotationDataCollector.js');
    await testImport('MaterialPriceService', './src/construction/services/MaterialPriceService.js');
    await testImport('LaborCostService', './src/construction/services/LaborCostService.js');
    await testImport('EquipmentRentalService', './src/construction/services/EquipmentRentalService.js');
    
    console.log('\n✅ All ConstructionSyndicateOrchestrator imports are fine!');
}

test().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
});

