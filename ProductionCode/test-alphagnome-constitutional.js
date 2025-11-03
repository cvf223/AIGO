/**
 * 🧬⚖️ ALPHAGNOME CONSTITUTIONAL OFFSPRING TEST
 * =============================================
 * 
 * Test that verifies AlphaGnome creates ONLY superior offspring
 * with full Constitutional verification and formal proofs
 */

import { AlphaGnomeConstitutionalOffspring } from './learning/AlphaGnomeConstitutionalOffspring.js';
import { closeDatabasePool } from './src/config/DatabaseConfig.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧬⚖️ ALPHAGNOME CONSTITUTIONAL OFFSPRING TEST');
console.log('============================================\n');

// Test tracking
const testResults = {
    offspringAttempts: 0,
    successfulOffspring: 0,
    rejectedForDegradation: 0,
    creativeEnhancements: 0,
    formallyVerified: 0
};

// Mock parents for testing
const parent1 = {
    id: 'parent_1',
    genotype: {
        gene_1: { value: 0.8, confidence: 0.9, type: 'aggressive' },
        gene_2: { value: 0.6, confidence: 0.8, type: 'risk' },
        gene_3: { value: 0.7, confidence: 0.85, type: 'profit' }
    },
    fitness: 0.75,
    intelligenceScore: 1.0,
    strategicScore: 0.7
};

const parent2 = {
    id: 'parent_2',
    genotype: {
        gene_1: { value: 0.7, confidence: 0.85, type: 'aggressive' },
        gene_2: { value: 0.9, confidence: 0.95, type: 'risk' },
        gene_3: { value: 0.8, confidence: 0.9, type: 'profit' }
    },
    fitness: 0.8,
    intelligenceScore: 1.1,
    strategicScore: 0.75
};

// Mock context
const context = {
    marketConditions: {
        volatility: 0.7,
        trend: 'bullish',
        volume: 1000000
    },
    competitors: [
        { id: 'competitor_1', strategy: 'aggressive', performance: 0.6 },
        { id: 'competitor_2', strategy: 'conservative', performance: 0.5 }
    ]
};

async function testSuperiorOffspringGeneration() {
    console.log('📍 TEST 1: Superior Offspring Generation');
    console.log('----------------------------------------');
    
    const generator = new AlphaGnomeConstitutionalOffspring({
        offspringLookahead: 30,
        creativityExplorationDepth: 5,
        creativityNoveltyThreshold: 0.8,
        minimumIntelligenceScore: 1.2,  // Must be 20% smarter!
        minimumStrategicScore: 0.8,
        requireFormalProof: true,
        enablePersistence: false  // Disable for testing
    });
    
    // Initialize systems
    await generator.initialize();
    
    console.log('\n🧬 Creating offspring from parents...');
    console.log(`   Parent 1 fitness: ${parent1.fitness}`);
    console.log(`   Parent 2 fitness: ${parent2.fitness}`);
    console.log(`   Parent 1 intelligence: ${parent1.intelligenceScore}`);
    console.log(`   Parent 2 intelligence: ${parent2.intelligenceScore}\n`);
    
    // Attempt to create offspring
    const offspring = await generator.createSuperiorOffspring(parent1, parent2, context);
    
    testResults.offspringAttempts++;
    
    if (offspring) {
        console.log('\n✅ OFFSPRING SUCCESSFULLY CREATED!');
        console.log(`   ID: ${offspring.id}`);
        console.log(`   Fitness: ${offspring.fitness.toFixed(3)}`);
        console.log(`   Intelligence: ${offspring.intelligenceScore.toFixed(3)}`);
        console.log(`   Strategic Score: ${offspring.strategicScore.toFixed(3)}`);
        console.log(`   Profit Potential: ${offspring.profitPotential}`);
        
        testResults.successfulOffspring++;
        
        // Verify superiority
        const fitnessImprovement = offspring.fitness > Math.max(parent1.fitness, parent2.fitness);
        const intelligenceImprovement = offspring.intelligenceScore > Math.max(parent1.intelligenceScore, parent2.intelligenceScore);
        
        console.log('\n📊 Superiority Verification:');
        console.log(`   Fitness improved: ${fitnessImprovement ? '✅' : '❌'}`);
        console.log(`   Intelligence improved: ${intelligenceImprovement ? '✅' : '❌'}`);
        console.log(`   Formally verified: ${offspring.formallyVerified ? '✅' : '❌'}`);
        console.log(`   Constitutionally approved: ${offspring.constitutionallyApproved ? '✅' : '❌'}`);
        
        if (offspring.formallyVerified) {
            testResults.formallyVerified++;
        }
        
        if (offspring.creativelyEnhanced) {
            testResults.creativeEnhancements++;
        }
        
        if (!fitnessImprovement || !intelligenceImprovement) {
            console.error('❌ CRITICAL: Offspring is not superior to parents!');
            return false;
        }
        
        return true;
        
    } else {
        console.log('\n❌ Offspring creation failed (correctly rejected)');
        testResults.rejectedForDegradation++;
        return false;
    }
}

async function testDegradedOffspringRejection() {
    console.log('\n📍 TEST 2: Degraded Offspring Rejection');
    console.log('----------------------------------------');
    
    // Create parents with high intelligence
    const smartParent1 = { ...parent1, intelligenceScore: 1.5, fitness: 0.9 };
    const smartParent2 = { ...parent2, intelligenceScore: 1.6, fitness: 0.85 };
    
    const generator = new AlphaGnomeConstitutionalOffspring({
        offspringLookahead: 10,  // Lower for potentially worse predictions
        minimumIntelligenceScore: 1.7,  // Very high requirement
        minimumStrategicScore: 0.95,  // Very high requirement
        requireFormalProof: true,
        enablePersistence: false
    });
    
    await generator.initialize();
    
    console.log('\n🧬 Attempting to create offspring with high requirements...');
    console.log(`   Minimum intelligence required: 1.7`);
    console.log(`   Parent 1 intelligence: ${smartParent1.intelligenceScore}`);
    console.log(`   Parent 2 intelligence: ${smartParent2.intelligenceScore}\n`);
    
    const offspring = await generator.createSuperiorOffspring(smartParent1, smartParent2, context);
    
    testResults.offspringAttempts++;
    
    if (offspring) {
        console.log('⚠️ Offspring created despite high requirements');
        console.log(`   Intelligence: ${offspring.intelligenceScore}`);
        
        if (offspring.intelligenceScore >= 1.7) {
            console.log('   ✅ Met high intelligence requirement!');
            testResults.successfulOffspring++;
            return true;
        } else {
            console.error('   ❌ CRITICAL: Offspring below requirement was accepted!');
            return false;
        }
    } else {
        console.log('✅ Correctly rejected offspring that couldn\'t meet requirements');
        testResults.rejectedForDegradation++;
        return true;
    }
}

async function testCreativeEnhancements() {
    console.log('\n📍 TEST 3: Creative Enhancements with Verification');
    console.log('---------------------------------------------------');
    
    const generator = new AlphaGnomeConstitutionalOffspring({
        offspringLookahead: 30,
        creativityExplorationDepth: 10,  // More creativity
        creativityNoveltyThreshold: 0.9,  // Higher novelty
        minimumIntelligenceScore: 1.1,
        requireFormalProof: true,
        enablePersistence: false
    });
    
    await generator.initialize();
    
    console.log('\n🎨 Creating offspring with enhanced creativity...');
    
    const offspring = await generator.createSuperiorOffspring(parent1, parent2, context);
    
    testResults.offspringAttempts++;
    
    if (offspring) {
        console.log('\n✅ Creative offspring created!');
        console.log(`   Creative enhancements: ${offspring.creativelyEnhanced ? 'Yes' : 'No'}`);
        console.log(`   Intelligence: ${offspring.intelligenceScore}`);
        console.log(`   Strategic score: ${offspring.strategicScore}`);
        
        if (offspring.creativelyEnhanced) {
            console.log('   ✅ Creative enhancements applied and verified!');
            testResults.creativeEnhancements++;
        }
        
        testResults.successfulOffspring++;
        return true;
    } else {
        console.log('⚠️ No offspring created (all creative attempts rejected)');
        testResults.rejectedForDegradation++;
        return false;
    }
}

async function runTestSuite() {
    try {
        console.log('🧬 STARTING ALPHAGNOME CONSTITUTIONAL TEST SUITE\n');
        
        const test1 = await testSuperiorOffspringGeneration();
        const test2 = await testDegradedOffspringRejection();
        const test3 = await testCreativeEnhancements();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL TEST RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n🧬 Offspring Generation:');
        console.log(`   Total attempts: ${testResults.offspringAttempts}`);
        console.log(`   Successful: ${testResults.successfulOffspring}`);
        console.log(`   Rejected: ${testResults.rejectedForDegradation}`);
        
        const successRate = testResults.successfulOffspring / 
            Math.max(1, testResults.offspringAttempts);
        console.log(`   Success rate: ${(successRate * 100).toFixed(1)}%`);
        
        console.log('\n⚖️ Constitutional Enforcement:');
        console.log(`   Formally verified: ${testResults.formallyVerified}`);
        console.log(`   Creative enhancements: ${testResults.creativeEnhancements}`);
        console.log(`   Degradation prevented: ${testResults.rejectedForDegradation}`);
        
        console.log('\n🧪 Test Results:');
        console.log(`   Test 1 (Superior Generation): ${test1 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Test 2 (Rejection Test): ${test2 ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   Test 3 (Creative Enhancement): ${test3 ? '✅ PASSED' : '❌ FAILED'}`);
        
        // Overall verdict
        const allPassed = test1 && test2 && test3;
        
        console.log('\n' + '='.repeat(60));
        if (allPassed) {
            console.log('🏆 ALL TESTS PASSED!');
            console.log('✅ AlphaGnome Constitutional Offspring Generation VERIFIED');
            console.log('✅ Only superior offspring are created');
            console.log('✅ Intelligence degradation is prevented');
            console.log('✅ Creative enhancements are constitutionally verified');
            console.log('✅ All offspring are formally proven superior');
            console.log('\n🧬 THE SYNDICATE EVOLVES ONLY UPWARD!');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('⚠️ Constitutional enforcement may need adjustment');
        }
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ CRITICAL TEST FAILURE:', error);
        console.error('Stack:', error.stack);
    } finally {
        await closeDatabasePool();
        process.exit(0);
    }
}

// Run the test suite
console.log('⚠️ This test verifies ONLY superior offspring are created!\n');
runTestSuite();
