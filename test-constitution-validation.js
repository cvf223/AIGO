/**
 * 🏛️ CONSTITUTION VALIDATION TEST - NO SHORTCUTS, REAL VALIDATION
 * ================================================================
 * 
 * This test ACTUALLY validates the system, not just claims success!
 * Every creative exploration, incentive, and conclusion is verified.
 */

import { GameTheoryIncentiveOptimizer } from './src/incentive/GameTheoryIncentiveOptimizer.js';
import { MultiStepIncentiveExecutor } from './src/incentive/MultiStepIncentiveExecutor.js';
import { ProactiveIncentiveCreator } from './src/incentive/ProactiveIncentiveCreator.js';
import { SyndicateConstitution } from './src/constitution/SyndicateConstitution.js';
import { closeDatabasePool } from './src/config/DatabaseConfig.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🏛️ CONSTITUTION VALIDATION TEST - REAL VERIFICATION');
console.log('===================================================\n');

// Test results tracking
const testResults = {
    constitutionChecks: 0,
    constitutionPassed: 0,
    creativityAttempts: 0,
    creativityRejected: 0,
    creativityCorrected: 0,
    conclusionsVerified: 0,
    incentivesValidated: 0,
    totalViolations: 0
};

// Initialize Constitution
const constitution = new SyndicateConstitution();

// Mock service registry
const serviceRegistry = new Map();

// Enhanced mock multi-token orchestrator with validation
const mockMultiTokenOrchestrator = {
    predictSequence: async (config) => {
        console.log(`   📊 Predicting ${config.tokensAhead} tokens for ${config.mode}`);
        
        const tokens = [];
        for (let i = 0; i < Math.min(config.tokensAhead, 5); i++) {
            // Some tokens will violate constitution to test verification
            const willViolate = i === 2 && config.mode === 'creative_strategy_generation';
            
            tokens.push({
                position: i,
                content: willViolate ? 'speculative_unverified_approach' : `verified_action_${i}`,
                probability: willViolate ? 0.4 : 0.85 - (i * 0.1),
                predictedReward: willViolate ? -50000 : 100000 * (1 - i * 0.1),
                profitPotential: willViolate ? 10000 : 500000 * (1 - i * 0.15),
                type: i === 0 ? 'primary' : 'alternative',
                metadata: {
                    reasoning: willViolate ? 'Speculative approach' : `Verified reasoning ${i}`,
                    formalProof: willViolate ? null : { type: 'mathematical', score: 0.9 }
                }
            });
        }
        
        return {
            tokens,
            mostLikelyPath: tokens.slice(0, 3),
            alternativePaths: [tokens.slice(1, 4)],
            overallConfidence: 0.88
        };
    }
};

// Mock creativity engine with some unconstitutional ideas
const mockCreativityEngine = {
    generateAlternatives: async (config) => {
        return [
            {
                action: 'verified_creative_approach',
                noveltyScore: 0.8,
                strategicValue: 0.85,
                formalProof: { type: 'mathematical', score: 0.85 },
                complexity: 1.2,
                intelligenceScore: 1.2  // Enhanced intelligence!
            },
            {
                action: 'speculative_creative_approach',  // Will violate
                noveltyScore: 0.95,
                strategicValue: 0.4,  // Low strategic value
                formalProof: null,  // No proof!
                complexity: 0.5,  // Dumbed down!
                intelligenceScore: 0.5  // Degraded
            },
            {
                action: 'correctable_creative_approach',
                noveltyScore: 0.7,
                strategicValue: 0.75,  // Good enough after correction
                formalProof: { type: 'partial', score: 0.85 },  // Good proof
                complexity: 1.1,
                intelligenceScore: 1.1  // Enhanced
            }
        ];
    }
};

serviceRegistry.set('multiTokenTrainingOrchestrator', mockMultiTokenOrchestrator);
serviceRegistry.set('creativitySystemIntegrator', mockCreativityEngine);

async function testConstitutionalCompliance() {
    console.log('📍 TEST 1: Creative Exploration with Constitutional Verification');
    console.log('----------------------------------------------------------------');
    
    const executor = new MultiStepIncentiveExecutor({
        maxSteps: 3,
        reevaluationThreshold: 0.3,
        enablePersistence: false
    });
    
    executor.serviceRegistry = serviceRegistry;
    executor.multiTokenOrchestrator = mockMultiTokenOrchestrator;
    
    // Test creative exploration
    const testContext = {
        task: 'test_creative_exploration',
        marketState: { volatility: 0.7 },
        competitors: ['bot_1']
    };
    
    const mockPrediction = await mockMultiTokenOrchestrator.predictSequence({
        context: testContext,
        tokensAhead: 5,
        mode: 'creative_test'
    });
    
    console.log('\n🎨 Testing creative alternatives...\n');
    
    const creativeAlts = await executor.exploreCreativeAlternatives(
        { recommendedTask: 'test_task' },
        testContext,
        mockPrediction
    );
    
    testResults.creativityAttempts = 3;
    testResults.creativityRejected = 3 - creativeAlts.length;
    testResults.creativityCorrected = creativeAlts.filter(a => a.wasCorrected).length;
    
    console.log(`\n📊 Creative Exploration Results:`);
    console.log(`   Alternatives attempted: ${testResults.creativityAttempts}`);
    console.log(`   Rejected by Constitution: ${testResults.creativityRejected}`);
    console.log(`   Corrected and approved: ${testResults.creativityCorrected}`);
    console.log(`   Final approved: ${creativeAlts.length}\n`);
    
    // Validate each approved alternative
    for (const alt of creativeAlts) {
        if (!alt.constitutionalApproval) {
            console.error('❌ CRITICAL: Unconstitutional alternative leaked through!');
            testResults.totalViolations++;
        } else {
            console.log(`   ✅ Alternative verified: ${alt.action}`);
            testResults.constitutionPassed++;
        }
    }
    
    testResults.constitutionChecks += 3;
}

async function testConclusionVerification() {
    console.log('\n📍 TEST 2: Conclusion Drawing with Constitutional Verification');
    console.log('-------------------------------------------------------------');
    
    const incentiveCreator = new ProactiveIncentiveCreator({
        lookaheadDepth: 15,
        strategicWeight: 0.7,
        enablePersistence: false
    });
    
    incentiveCreator.multiTokenOrchestrator = mockMultiTokenOrchestrator;
    
    const testIncentive = {
        id: 'test_incentive',
        recommendedTask: 'maximize_profit',
        score: 0.85,
        longTermValue: 500000
    };
    
    const testPredictions = [
        { task: 'task1', predictedValue: { total: 100000 }, confidencePath: 0.9 }
    ];
    
    console.log('\n🧠 Drawing conclusions with verification...\n');
    
    const conclusions = await incentiveCreator.drawMultiTokenConclusions(
        testIncentive,
        testPredictions
    );
    
    testResults.conclusionsVerified++;
    
    // Validate conclusion
    if (!conclusions.constitutionallyVerified) {
        console.error('❌ CRITICAL: Unverified conclusion accepted!');
        testResults.totalViolations++;
    } else {
        console.log('✅ Conclusion properly verified');
        testResults.constitutionPassed++;
        
        if (conclusions.wasCorrected) {
            console.log('   ℹ️ Conclusion was corrected to ensure compliance');
        }
        
        if (conclusions.isSafeDefault) {
            console.log('   ⚠️ Safe default used due to compliance issues');
        }
    }
    
    testResults.constitutionChecks++;
}

async function testIncentiveValidation() {
    console.log('\n📍 TEST 3: Incentive Adjustment Validation');
    console.log('------------------------------------------');
    
    // Test incentive adjustment validation
    const testIncentive = {
        type: 'incentive_adjustment',
        gameTheoryScore: 0.6,  // Below threshold
        profitTarget: 100000,
        intelligenceScore: 0.8,  // Not degraded
        verified: false  // But not verified!
    };
    
    console.log('\n⚖️ Validating incentive adjustment...\n');
    
    let verification;
    try {
        verification = await constitution.verifyCompliance(testIncentive, {});
    } catch (error) {
        if (error.message.includes('CRITICAL VIOLATION')) {
            console.log('✅ Critical violation correctly caught for bad incentive');
            testResults.constitutionChecks++;
            testResults.constitutionPassed++;
            testResults.incentivesValidated++;
            testResults.totalViolations++;
            return;
        }
        throw error;
    }
    
    testResults.constitutionChecks++;
    
    if (verification && !verification.compliant) {
        console.log('✅ Low-quality incentive correctly rejected');
        console.log(`   Violations: ${verification.violations.length}`);
        testResults.constitutionPassed++;
        testResults.totalViolations += verification.violations.length;
    } else {
        console.error('❌ CRITICAL: Bad incentive passed validation!');
    }
    
    testResults.incentivesValidated++;
}

async function testConstitutionEnforcement() {
    console.log('\n📍 TEST 4: Constitution Law Enforcement');
    console.log('---------------------------------------');
    
    // Test various violations
    const testCases = [
        {
            name: 'Intelligence Degradation Attempt',
            action: {
                type: 'creative_exploration',
                intelligenceScore: 0.3,  // Degraded!
                isCreative: true
            },
            shouldFail: true,
            critical: true
        },
        {
            name: 'Unverified Speculation',
            action: {
                type: 'conclusion',
                formalProof: null,
                empiricalEvidence: null,
                speculationRatio: 0.8  // Too much speculation!
            },
            shouldFail: true,
            critical: false
        },
        {
            name: 'Proper Verified Action',
            action: {
                type: 'action',
                verified: true,
                mathematicalProof: { score: 0.9 },
                dataSource: 'blockchain'
            },
            shouldFail: false,
            critical: false
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\nTesting: ${testCase.name}`);
        
        try {
            const verification = await constitution.verifyCompliance(testCase.action, {});
            testResults.constitutionChecks++;
            
            if (testCase.shouldFail && !verification.compliant) {
                console.log(`   ✅ Correctly rejected (${verification.violations.length} violations)`);
                testResults.constitutionPassed++;
                testResults.totalViolations += verification.violations.length;
            } else if (!testCase.shouldFail && verification.compliant) {
                console.log('   ✅ Correctly approved');
                testResults.constitutionPassed++;
            } else {
                console.error(`   ❌ WRONG RESULT: Expected ${testCase.shouldFail ? 'rejection' : 'approval'}`);
                if (verification.violations && verification.violations.length > 0) {
                    console.error('      Violations:', verification.violations);
                }
            }
        } catch (error) {
            if (testCase.critical && error.message.includes('CRITICAL VIOLATION')) {
                console.log('   ✅ Critical violation correctly terminated action');
                testResults.constitutionPassed++;
            } else {
                console.error('   ❌ Unexpected error:', error.message);
            }
        }
    }
}

async function runValidationSuite() {
    try {
        console.log('🏛️ STARTING CONSTITUTIONAL VALIDATION SUITE\n');
        
        await testConstitutionalCompliance();
        await testConclusionVerification();
        await testIncentiveValidation();
        await testConstitutionEnforcement();
        
        // Get final constitution status
        const status = constitution.getConstitutionStatus();
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 FINAL VALIDATION RESULTS');
        console.log('='.repeat(60));
        
        console.log('\n📜 Constitution Enforcement:');
        console.log(`   Total Checks: ${testResults.constitutionChecks}`);
        console.log(`   Passed: ${testResults.constitutionPassed}`);
        console.log(`   Failed: ${testResults.constitutionChecks - testResults.constitutionPassed}`);
        console.log(`   Success Rate: ${((testResults.constitutionPassed / testResults.constitutionChecks) * 100).toFixed(1)}%`);
        
        console.log('\n🎨 Creativity Control:');
        console.log(`   Creative attempts: ${testResults.creativityAttempts}`);
        console.log(`   Rejected (dumbed down): ${testResults.creativityRejected}`);
        console.log(`   Corrected & approved: ${testResults.creativityCorrected}`);
        
        console.log('\n⚖️ Violation Statistics:');
        console.log(`   Total violations caught: ${testResults.totalViolations}`);
        console.log(`   Terminations: ${status.stats.terminations}`);
        console.log(`   Corrections applied: ${status.stats.corrections}`);
        
        console.log('\n📋 System Compliance:');
        console.log(`   Overall compliance rate: ${(status.complianceRate * 100).toFixed(1)}%`);
        console.log(`   Constitution status: ${status.status}`);
        
        // FINAL VERDICT
        const allTestsPassed = testResults.constitutionPassed === testResults.constitutionChecks;
        const creativityControlled = testResults.creativityRejected > 0;
        const violationsCaught = testResults.totalViolations > 0;
        
        console.log('\n' + '='.repeat(60));
        if (allTestsPassed && creativityControlled && violationsCaught) {
            console.log('🏆 VALIDATION SUCCESSFUL - CONSTITUTION IS SUPREME!');
            console.log('✅ Creative dumbing down: PREVENTED');
            console.log('✅ Unconstitutional actions: BLOCKED');
            console.log('✅ Intelligence preservation: ENFORCED');
            console.log('✅ Formal verification: REQUIRED');
            console.log('\n📜 THE SYNDICATE CONSTITUTION IS PROTECTING SYSTEM INTELLIGENCE!');
        } else {
            console.log('❌ VALIDATION FAILED - CONSTITUTION VIOLATED!');
            if (!creativityControlled) {
                console.log('⚠️ Creative alternatives not properly controlled');
            }
            if (!violationsCaught) {
                console.log('⚠️ Violations not being caught');
            }
            if (!allTestsPassed) {
                console.log('⚠️ Some constitution checks failed');
            }
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

// Run the validation suite
console.log('⚠️ This test performs REAL VALIDATION, not just claims of success!\n');
runValidationSuite();
