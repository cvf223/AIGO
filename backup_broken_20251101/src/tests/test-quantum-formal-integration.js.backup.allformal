#!/usr/bin/env node

/**
 * 🧪 TEST QUANTUM FORMAL INTEGRATION
 * ==================================
 * Verify that formal systems are properly quantum-enhanced
 */

import { QuantumKnowledgeGraph } from '../memory/QuantumKnowledgeGraph.js';
import { QuantumSystemEntanglementOrchestrator } from '../quantum/QuantumSystemEntanglementOrchestrator.js';

async function testQuantumFormalIntegration() {
    console.log('🧪 Testing Quantum Formal Integration...\n');
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Quantum System Orchestrator includes formal systems
    try {
        const orchestrator = new QuantumSystemEntanglementOrchestrator({
            formalReasoning: { name: 'mock_formal' },
            autoformalizationEngine: { name: 'mock_auto' },
            eliteJudgeGatekeeper: { name: 'mock_judge' },
            constitutionalAI: { name: 'mock_constitutional' }
        });
        
        const hasFormalSystems = orchestrator.systems.formalReasoning !== undefined;
        
        if (hasFormalSystems) {
            console.log('✅ Quantum Orchestrator includes formal systems');
            passed++;
        } else {
            console.log('❌ Quantum Orchestrator missing formal systems');
            failed++;
        }
    } catch (error) {
        console.log('❌ Orchestrator test failed:', error.message);
        failed++;
    }
    
    // Test 2: Quantum Knowledge Graph has formal verification
    try {
        const qkg = new QuantumKnowledgeGraph({
            autoformalizationEngine: {
                formalizeStatement: async (text) => ({ formal: text, success: true })
            },
            constitutionalAI: {
                checkCompliance: async () => ({ isAligned: true })
            }
        });
        
        // Check if formal systems are registered
        const hasFormalMethods = typeof qkg.quantumFormalVerification === 'function';
        
        if (hasFormalMethods) {
            console.log('✅ Quantum KG has formal verification methods');
            passed++;
        } else {
            console.log('❌ Quantum KG missing formal verification methods');
            failed++;
        }
        
        // Test formal verification
        if (hasFormalMethods) {
            try {
                // Initialize nodes map if not present
                if (!qkg.nodes) {
                    qkg.nodes = new Map();
                }
                
                // Create a test node
                const node = { id: 'test_node', content: 'Test knowledge', metadata: {} };
                qkg.nodes.set(node.id, node);
                
                const verification = await qkg.quantumFormalVerification(node.id);
                
                if (verification && verification.verified) {
                    console.log('✅ Quantum formal verification successful');
                    console.log(`   Mathematical certainty: ${verification.mathematicalCertainty}`);
                    console.log(`   Constitutional alignment: ${verification.constitutionallyAligned}`);
                    passed++;
                } else {
                    console.log('❌ Quantum formal verification failed');
                    failed++;
                }
            } catch (error) {
                console.log('❌ Formal verification test error:', error.message);
                failed++;
            }
        }
    } catch (error) {
        console.log('❌ QKG test failed:', error.message);
        failed++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 QUANTUM FORMAL INTEGRATION TEST RESULTS');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Quantum Formal Integration is working!');
    } else {
        console.log('\n⚠️ Some tests failed. Check implementation.');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

// Run tests
testQuantumFormalIntegration().catch(error => {
    console.error('💥 FATAL:', error);
    process.exit(1);
});
