/**
 * 🧪 TEST SUPERINTELLIGENCE INTEGRATION
 * =====================================
 * Verifies that all systems are actually being used
 */

import { ConstructionSyndicateOrchestrator } from './src/construction/ConstructionSyndicateOrchestrator.js';

async function testSuperintelligence() {
    console.log('🧪 TESTING SUPERINTELLIGENCE INTEGRATION...\n');
    
    try {
        // Initialize orchestrator
        const orchestrator = new ConstructionSyndicateOrchestrator();
        await orchestrator.initialize();
        
        // Check if superintelligence was integrated
        if (orchestrator.integrateFullSuperintelligence) {
            await orchestrator.integrateFullSuperintelligence();
        }
        
        // Test task processing
        console.log('\n📋 Testing task processing with superintelligence...');
        const testTask = {
            type: 'construction',
            description: 'Build a 10-story office building',
            budget: 10000000,
            timeline: 365,
            requirements: ['structural_integrity', 'energy_efficiency', 'HOAI_compliance']
        };
        
        const result = await orchestrator.processConstructionTaskWithSuperintelligence(testTask);
        
        // Verify superintelligence was used
        console.log('\n📊 RESULTS:');
        console.log('  Superintelligence used:', result.superintelligenceUsed ? '✅' : '❌');
        console.log('  Quantum planning:', result.enhancements?.plan ? '✅' : '❌');
        console.log('  Mathematical proofs:', result.enhancements?.proofs ? '✅' : '❌');
        console.log('  GOT reasoning:', result.enhancements?.reasoning ? '✅' : '❌');
        console.log('  Multi-agent consensus:', result.enhancements?.consensus ? '✅' : '❌');
        
        // Check integration status
        if (orchestrator.superintelligenceIntegration) {
            const status = orchestrator.superintelligenceIntegration.getStatus();
            console.log('\n📈 INTEGRATION STATUS:');
            console.log('  Systems integrated:', status.systems.length);
            console.log('  Integration points:', status.integrationPoints);
            console.log('  Total usage calls:', status.usageStats.total);
        }
        
        console.log('\n✅ TEST COMPLETE!');
        
    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
    }
}

// Run test
testSuperintelligence();
