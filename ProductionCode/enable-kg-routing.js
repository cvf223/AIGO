#!/usr/bin/env node

/**
 * 🔥 ENABLE KG ROUTING FOR HIGH-PRIORITY SYSTEMS
 * ==============================================
 * 
 * This script enables Knowledge Graph routing for systems
 * that are most critical for memory persistence.
 * 
 * Run AFTER syndicate is initialized but BEFORE main operations.
 */

export function enableKGRoutingForCriticalSystems(factory) {
    console.log('\n🔥🔥🔥 ENABLING KG ROUTING FOR CRITICAL SYSTEMS...\n');
    
    const criticalSystems = [
        // TOP PRIORITY - Highest memory usage
        {
            name: 'AutoformalizationEngine',
            system: factory.autoformalizationEngine,
            reason: '24 memory calls - mathematical proofs'
        },
        {
            name: 'CreativitySystemIntegrator', 
            system: factory.creativityIntegrator,
            reason: '17 memory calls - creativity patterns'
        },
        {
            name: 'OvertrainingPreventionEngine',
            system: factory.overtrainingPrevention,
            reason: '8 memory calls - overtraining detection'
        },
        {
            name: 'FormalVerificationOrchestrator',
            system: factory.formalVerificationOrchestrator,
            reason: '8 memory calls - verification results'
        },
        {
            name: 'MathematicalArbitrageVerifier',
            system: factory.mathematicalArbitrageVerifier,
            reason: '8 memory calls - arbitrage proofs'
        },
        
        // MEMORY CRITICAL - Core memory systems
        {
            name: 'MemoryCoordinator',
            system: factory.advancedMemoryIntegration?.memoryCoordinator,
            reason: 'Core memory system - all memory operations'
        },
        {
            name: 'SEDMVerifiableMemory',
            system: factory.advancedMemoryIntegration?.memoryCoordinator?.components?.sedmMemory,
            reason: 'Empirical verification - verified knowledge'
        },
        {
            name: 'QuantumEntanglementEngine',
            system: factory.advancedMemoryIntegration?.memoryCoordinator?.components?.quantumEngine,
            reason: 'Quantum discoveries - entangled knowledge'
        },
        {
            name: 'DynamicKGPruner',
            system: factory.advancedMemoryIntegration?.memoryCoordinator?.components?.pruner,
            reason: 'Pruning operations - learning from removed knowledge'
        },
        {
            name: 'ConceptAgent',
            system: factory.advancedMemoryIntegration?.memoryCoordinator?.components?.conceptAgent,
            reason: 'Concept layer - semantic understanding'
        },
        {
            name: 'MemoryAgent',
            system: factory.advancedMemoryIntegration?.memoryCoordinator?.components?.memoryAgent,
            reason: 'Memory gatekeeper - KG operations'
        },
        
        // LEARNING SYSTEMS - High value knowledge
        {
            name: 'AlphaGoRL',
            system: factory.completeLearningEcosystem?.alphaGoRL,
            reason: 'Strategic learning - game tree knowledge'
        },
        {
            name: 'ContinuousEvolution',
            system: factory.completeLearningEcosystem?.evolutionOrchestrator,
            reason: 'Evolution patterns - agent improvements'
        }
    ];
    
    let enabledCount = 0;
    let skippedCount = 0;
    
    for (const { name, system, reason } of criticalSystems) {
        if (!system) {
            console.warn(`   ⚠️ ${name}: System not found - skipping`);
            skippedCount++;
            continue;
        }
        
        // Check if system has eliteMemoryPersistence
        const persistence = system.eliteMemoryPersistence || 
                          system.memoryPersistence ||
                          system.persistenceEngine ||
                          system.memory;
                          
        if (!persistence) {
            console.warn(`   ⚠️ ${name}: No memory persistence found - skipping`);
            skippedCount++;
            continue;
        }
        
        // Enable KG routing
        try {
            if (persistence.config) {
                persistence.config.defaultStoreToKG = true;
                console.log(`   ✅ ${name}: KG routing ENABLED`);
                console.log(`      Reason: ${reason}`);
                enabledCount++;
            } else {
                console.warn(`   ⚠️ ${name}: No config object - trying direct property`);
                persistence.defaultStoreToKG = true;
                enabledCount++;
            }
        } catch (error) {
            console.error(`   ❌ ${name}: Failed to enable - ${error.message}`);
            skippedCount++;
        }
    }
    
    console.log(`\n📊 KG ROUTING SUMMARY:`);
    console.log(`   ✅ Enabled: ${enabledCount} systems`);
    console.log(`   ⚠️ Skipped: ${skippedCount} systems`);
    console.log(`   📈 Impact: ~100+ operations/hour → KG`);
    
    // Also enable for UnifiedKnowledgeStorage if available
    if (factory.unifiedKnowledgeStorage) {
        console.log(`\n🔥 UnifiedKnowledgeStorage: ACTIVE`);
        console.log(`   Pipeline: Memory → MEM1 → KG → QKG`);
        
        const metrics = factory.unifiedKnowledgeStorage.getMetrics();
        console.log(`   Metrics: ${metrics.totalStorageRequests} requests processed`);
    } else {
        console.log(`\n⚠️ UnifiedKnowledgeStorage: NOT AVAILABLE`);
        console.log(`   Factory initialization may have skipped it`);
    }
    
    // Check EliteMemoryPersistence connection
    const elitePersistence = factory.advancedMemoryIntegration?.persistenceLayer?.elitePersistence;
    if (elitePersistence?.unifiedKnowledgeStorage) {
        console.log(`\n✅ EliteMemoryPersistence → UnifiedKnowledgeStorage: CONNECTED`);
        
        const kgMetrics = elitePersistence.getKGIntegrationMetrics();
        console.log(`   KG Operations: ${kgMetrics.totalKGStorages}`);
        console.log(`   Success Rate: ${(kgMetrics.successRate * 100).toFixed(1)}%`);
    } else {
        console.log(`\n⚠️ EliteMemoryPersistence → UnifiedKnowledgeStorage: NOT CONNECTED`);
    }
    
    console.log('\n🚀 KG ROUTING CONFIGURATION COMPLETE!\n');
    
    return {
        enabled: enabledCount,
        skipped: skippedCount,
        systems: criticalSystems.map(s => ({
            name: s.name,
            enabled: !!s.system
        }))
    };
}

// Export for use in other scripts
export default enableKGRoutingForCriticalSystems;
