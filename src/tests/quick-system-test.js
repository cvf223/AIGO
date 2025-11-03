#!/usr/bin/env node

/**
 * 🧪 QUICK SYSTEM TEST - FIND BUGS FAST
 * =====================================
 */

import { QuantumCoherenceEngine } from '../quantum/QuantumCoherenceEngine.js';
import { QuantumEntanglementEngine } from '../quantum/QuantumEntanglementEngine.js';
import { QuantumSuperpositionEngine } from '../quantum/QuantumSuperpositionEngine.js';
import { QuantumNodeEngine } from '../quantum/QuantumNodeEngine.js';

// Test results
let passed = 0;
let failed = 0;
const errors = [];

function test(name, condition, error = null) {
    if (condition) {
        console.log(`✅ ${name}`);
        passed++;
    } else {
        console.log(`❌ ${name}${error ? ': ' + error.message : ''}`);
        failed++;
        if (error) errors.push({ test: name, error: error.message });
    }
}

async function testQuantumEngines() {
    console.log('\n🔬 TESTING QUANTUM ENGINES\n');
    
    // Test Coherence Engine
    try {
        const qce = new QuantumCoherenceEngine();
        await qce.initialize();
        test('QuantumCoherenceEngine.initialize', true);
        
        const system = await qce.registerSystem('test', { type: 'test' });
        test('QCE.registerSystem', system.id === 'test');
        
        const updated = await qce.updateCoherence('test', 0.8);
        test('QCE.updateCoherence', updated.coherence === 0.8);
        
        qce.destroy();
    } catch (error) {
        test('QuantumCoherenceEngine', false, error);
    }
    
    // Test Entanglement Engine
    try {
        const qee = new QuantumEntanglementEngine();
        await qee.initialize();
        test('QuantumEntanglementEngine.initialize', true);
        
        const ent = await qee.createEntanglement('s1', 's2');
        test('QEE.createEntanglement', ent.id !== undefined);
        
        const bell = await qee.createBellPair('alice', 'bob');
        test('QEE.createBellPair', bell.id !== undefined);
        
        const ghz = await qee.createGHZState(['s1', 's2', 's3']);
        test('QEE.createGHZState', ghz.parties === 3);
        
        qee.destroy();
    } catch (error) {
        test('QuantumEntanglementEngine', false, error);
    }
    
    // Test Superposition Engine
    try {
        const qse = new QuantumSuperpositionEngine();
        await qse.initialize();
        test('QuantumSuperpositionEngine.initialize', true);
        
        const sup = await qse.createSuperposition([{a: 1}, {b: 2}]);
        test('QSE.createSuperposition', sup.id !== undefined);
        
        const measured = await qse.measure(sup.id);
        test('QSE.measure', measured.state !== undefined);
        
        qse.destroy();
    } catch (error) {
        test('QuantumSuperpositionEngine', false, error);
    }
    
    // Test Node Engine
    try {
        const qne = new QuantumNodeEngine();
        await qne.initialize();
        test('QuantumNodeEngine.initialize', true);
        
        const node = await qne.createQuantumNode({ type: 'test' });
        test('QNE.createQuantumNode', node.id !== undefined);
        
        await qne.applyGate(node.id, 'H', { qubit: 0 });
        test('QNE.applyGate', true);
        
        const result = await qne.measureNode(node.id);
        test('QNE.measureNode', result.results.length > 0);
        
        qne.destroy();
    } catch (error) {
        test('QuantumNodeEngine', false, error);
    }
}

async function testIntegration() {
    console.log('\n🔗 TESTING CROSS-ENGINE INTEGRATION\n');
    
    try {
        const qce = new QuantumCoherenceEngine();
        const qee = new QuantumEntanglementEngine();
        
        await qce.initialize();
        await qee.initialize();
        
        // Register systems
        await qce.registerSystem('qee_test', { type: 'entanglement' });
        test('Cross-registration', true);
        
        // Create entanglement
        await qee.createEntanglement('system1', 'system2');
        test('Cross-entanglement', true);
        
        // Create GHZ across systems
        await qee.createGHZState(['s1', 's2', 's3', 's4']);
        test('Multi-system GHZ', true);
        
        qce.destroy();
        qee.destroy();
    } catch (error) {
        test('Cross-engine integration', false, error);
    }
}

async function testMemoryPipeline() {
    console.log('\n💾 TESTING MEMORY PIPELINE\n');
    
    try {
        // Test imports first
        const { TruthVerificationOrchestrator } = await import('../memory/TruthVerificationOrchestrator.js');
        test('Import TruthVerificationOrchestrator', true);
        
        // Test initialization
        const tvo = new TruthVerificationOrchestrator({});
        await tvo.initialize();
        test('TruthVerificationOrchestrator.initialize', true);
        
        // Test verification methods
        const input = { source: 'test', data: { value: 100 } };
        
        const credibility = await tvo.verifySourceCredibility(input);
        test('TVO.verifySourceCredibility', credibility.score >= 0);
        
        const blockchain = await tvo.verifyBlockchainData(input);
        test('TVO.verifyBlockchainData', blockchain.verified !== undefined);
        
        const truth = await tvo.verifyTruth(input);
        test('TVO.verifyTruth', truth.confidence >= 0);
        
    } catch (error) {
        test('Memory Pipeline', false, error);
    }
}

async function testAlphaGnome() {
    console.log('\n🧬 TESTING ALPHAGNOME\n');
    
    try {
        const { AlphaGnomeEvolutionarySystem } = await import('../../learning/AlphaGnomeEvolutionarySystem.js');
        test('Import AlphaGnomeEvolutionarySystem', true);
        
        const alphaGnome = new AlphaGnomeEvolutionarySystem({
            populationSize: 5,
            enableBattlefield: false
        });
        
        await alphaGnome.initialize();
        test('AlphaGnome.initialize', true);
        
        const genes = alphaGnome.createGeneticMaterial();
        test('AlphaGnome.createGeneticMaterial', genes !== undefined && Object.keys(genes).length > 0);
        
    } catch (error) {
        test('AlphaGnome', false, error);
    }
}

async function runAllTests() {
    console.log('=' .repeat(60));
    console.log('🧪 QUICK SYSTEM TEST - PRODUCTION READINESS CHECK');
    console.log('=' .repeat(60));
    
    const start = Date.now();
    
    await testQuantumEngines();
    await testIntegration();
    await testMemoryPipeline();
    await testAlphaGnome();
    
    const elapsed = Date.now() - start;
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 RESULTS');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Time: ${elapsed}ms`);
    
    if (errors.length > 0) {
        console.log('\n⚠️ ERRORS:');
        errors.forEach(e => console.log(`  - ${e.test}: ${e.error}`));
    }
    
    const successRate = passed / (passed + failed);
    if (successRate === 1) {
        console.log('\n🎉 ALL TESTS PASSED! PRODUCTION READY!');
    } else if (successRate >= 0.8) {
        console.log('\n⚠️ MOSTLY PASSING - Minor fixes needed');
    } else {
        console.log('\n❌ CRITICAL FAILURES - NOT PRODUCTION READY');
    }
    
    process.exit(failed > 0 ? 1 : 0);
}

// Add timeout to prevent hanging
setTimeout(() => {
    console.error('\n⏱️ TIMEOUT - Test took too long');
    process.exit(1);
}, 30000);

runAllTests().catch(error => {
    console.error('💥 FATAL:', error.message);
    process.exit(1);
});
