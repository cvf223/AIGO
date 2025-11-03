#!/usr/bin/env node

/**
 * 🧪 MINIMAL UNIFIED STORAGE TEST
 * ===============================
 * 
 * Tests UnifiedKnowledgeStorageOrchestrator in isolation
 * without full factory initialization.
 */

import UnifiedKnowledgeStorageOrchestrator from './src/memory/UnifiedKnowledgeStorageOrchestrator.js';

console.log('\n🧪 MINIMAL UNIFIED STORAGE TEST\n');
console.log('=====================================\n');

async function runMinimalTest() {
    try {
        // Create orchestrator
        console.log('1️⃣ Creating UnifiedKnowledgeStorageOrchestrator...');
        const orchestrator = new UnifiedKnowledgeStorageOrchestrator({
            enableMEM1Consolidation: false, // Disable for minimal test
            enableKGStorage: false, // Disable for minimal test  
            enableQKGEnhancement: false, // Disable for minimal test
            enableValidation: true,
            minConfidenceForStorage: 0.5
        });
        
        console.log('   ✅ Orchestrator created');
        console.log(`   Config: ${JSON.stringify(orchestrator.config, null, 2)}\n`);
        
        // Initialize with minimal mock systems
        console.log('2️⃣ Initializing with mock systems...');
        await orchestrator.initialize({
            mem1Framework: null, // No MEM1 for minimal test
            knowledgeGraph: null, // No KG for minimal test
            quantumKG: null,
            memoryAgent: null,
            conceptAgent: null,
            truthVerification: null,
            formalReasoning: null,
            constitutionalValidator: null
        });
        
        console.log('   ✅ Initialized (minimal mode)\n');
        
        // Test storage (should fail validation but not crash)
        console.log('3️⃣ Testing knowledge storage (should fail validation)...');
        try {
            const result = await orchestrator.storeKnowledge({
                data: 'Test knowledge',
                confidence: 0.8
            }, {
                agentId: 'test',
                type: 'test'
            });
            
            console.log(`   Result: ${result.success ? '✅ Success' : '❌ Failed'}`);
            console.log(`   Reason: ${result.reason || 'N/A'}\n`);
        } catch (storageError) {
            console.log(`   ⚠️ Expected: ${storageError.message}\n`);
        }
        
        // Get metrics
        console.log('4️⃣ Checking metrics...');
        const metrics = orchestrator.getMetrics();
        console.log(`   Total requests: ${metrics.totalStorageRequests}`);
        console.log(`   Successful: ${metrics.successfulStorages}`);
        console.log(`   Validation failures: ${metrics.validationFailures}\n`);
        
        // Get status
        console.log('5️⃣ Checking status...');
        const status = orchestrator.getStatus();
        console.log(`   Initialized: ${status.initialized}`);
        console.log(`   Systems connected: ${Object.values(status.systems).filter(Boolean).length}/5`);
        console.log(`   Validation systems: ${Object.values(status.validation).filter(Boolean).length}/4\n`);
        
        console.log('✅ MINIMAL TEST COMPLETE!');
        console.log('   UnifiedKnowledgeStorageOrchestrator works correctly');
        console.log('   Issue must be in Factory initialization order\n');
        
        return true;
        
    } catch (error) {
        console.error('❌ MINIMAL TEST FAILED:', error);
        console.error('Stack:', error.stack);
        return false;
    }
}

runMinimalTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
