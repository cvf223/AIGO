#!/usr/bin/env node

/**
 * 🔍⚡ PROACTIVE PREVENTION TEST SETUP VALIDATOR - TOP 1% EXPERT IMPLEMENTATION
 * ==========================================================================
 * 
 * VALIDATION SCRIPT FOR PROACTIVE HALLUCINATION & MODEL COLLAPSE PREVENTION TEST SUITE
 * 
 * VALIDATION SCOPE:
 * - Verifies all 5 proactive prevention system files exist and are properly structured
 * - Validates test suite infrastructure and dependencies
 * - Ensures state persistence and achievement tracking systems are operational
 * - Confirms integration points with existing syndicate architecture
 * 
 * PHILOSOPHY: VALIDATE BEFORE TESTING - ENSURE BULLETPROOF TEST ENVIRONMENT
 * 
 * This validator ensures the proactive prevention test suite can execute with
 * mathematical certainty and production-level reliability.
 */

import { access, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 🎯 MAIN VALIDATION EXECUTION
 */
async function validateProactiveTestSetup() {
    console.log('🔍⚡ PROACTIVE PREVENTION TEST SETUP VALIDATOR');
    console.log('='.repeat(80));
    console.log('🎯 Validating all 5 proactive prevention systems for testing readiness');
    console.log('🛡️ Ensuring bulletproof test environment configuration');
    console.log('='.repeat(80));

    const validationResults = {
        totalValidations: 0,
        passedValidations: 0,
        failedValidations: 0,
        systemValidations: {},
        testInfrastructure: {},
        criticalIssues: []
    };

    try {
        // VALIDATION 1: Proactive prevention system files
        console.log('\n🛡️ VALIDATING PROACTIVE PREVENTION SYSTEM FILES...');
        await validateProactiveSystemFiles(validationResults);

        // VALIDATION 2: Test suite infrastructure  
        console.log('\n🧪 VALIDATING TEST SUITE INFRASTRUCTURE...');
        await validateTestSuiteFiles(validationResults);

        // VALIDATION 3: State persistence implementation
        console.log('\n💾 VALIDATING STATE PERSISTENCE IMPLEMENTATION...');
        await validateStatePersistenceImplementation(validationResults);

        // VALIDATION 4: Integration points validation
        console.log('\n🔗 VALIDATING INTEGRATION POINTS...');
        await validateIntegrationPoints(validationResults);

        // VALIDATION 5: Test dependencies and environment
        console.log('\n📦 VALIDATING TEST DEPENDENCIES...');
        await validateTestDependencies(validationResults);

        // Generate comprehensive validation report
        generateValidationReport(validationResults);

        return validationResults;

    } catch (error) {
        console.error('\n💥 CRITICAL VALIDATION ERROR:', error);
        validationResults.criticalIssues.push(`Critical validation error: ${error.message}`);
        return validationResults;
    }
}

/**
 * 🛡️ VALIDATE PROACTIVE PREVENTION SYSTEM FILES
 */
async function validateProactiveSystemFiles(results) {
    const requiredSystems = [
        {
            name: 'ProactiveKnowledgeCredibilityPipeline',
            path: 'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveKnowledgeCredibilityPipeline.js',
            requiredMethods: [
                'validateKnowledgeCredibility',
                'persistState',
                'restoreState',
                'checkAndSaveMajorAchievements',
                'getCredibilityMetrics'
            ]
        },
        {
            name: 'ProactiveInferenceReliabilityEngine',
            path: 'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveInferenceReliabilityEngine.js',
            requiredMethods: [
                'generateReliableInference',
                'persistState',
                'restoreState',
                'checkAndSaveMajorAchievements'
            ]
        },
        {
            name: 'ProactiveVeracityJudgeService',
            path: 'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveVeracityJudgeService.js',
            requiredMethods: [
                'evaluateAgentVeracity',
                'calculateCompositeReward',
                'persistState',
                'restoreState',
                'checkAndSaveMajorAchievements'
            ]
        },
        {
            name: 'SFTFlywheelGovernor',
            path: 'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/SFTFlywheelGovernor.js',
            requiredMethods: [
                'validateSyntheticDataQuality',
                'preventAutophagicDegeneration',
                'persistState',
                'restoreState',
                'checkAndSaveMajorAchievements'
            ]
        },
        {
            name: 'ProactiveCognitiveMetabolicLoop',
            path: 'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveCognitiveMetabolicLoop.js',
            requiredMethods: [
                'orchestrateCompleteProactiveImmunity',
                'maintainHomeostaticIntelligence',
                'persistState',
                'restoreState',
                'checkAndSaveMajorAchievements'
            ]
        }
    ];

    for (const system of requiredSystems) {
        results.totalValidations++;
        
        try {
            // Check if file exists
            const filePath = join(__dirname, system.path);
            await access(filePath);
            
            // Read file content for method validation
            const fileContent = await readFile(filePath, 'utf-8');
            
            // Validate required methods exist
            const missingMethods = [];
            for (const method of system.requiredMethods) {
                if (!fileContent.includes(`async ${method}(`) && !fileContent.includes(`${method}(`)) {
                    missingMethods.push(method);
                }
            }
            
            // Validate state persistence implementation
            const hasStatePersistence = fileContent.includes('statePersistence') && 
                                       fileContent.includes('majorAchievementThresholds') &&
                                       fileContent.includes('achievementBackupCount');
            
            if (missingMethods.length === 0 && hasStatePersistence) {
                console.log(`   ✅ ${system.name}: All methods present, state persistence implemented`);
                results.passedValidations++;
                results.systemValidations[system.name] = 'PASSED';
            } else {
                console.log(`   ❌ ${system.name}: Missing methods: ${missingMethods.join(', ')}`);
                if (!hasStatePersistence) {
                    console.log(`   ❌ ${system.name}: State persistence not properly implemented`);
                }
                results.failedValidations++;
                results.systemValidations[system.name] = 'FAILED';
                results.criticalIssues.push(`${system.name}: Missing methods or state persistence`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${system.name}: File not found or inaccessible`);
            results.failedValidations++;
            results.systemValidations[system.name] = 'FILE_NOT_FOUND';
            results.criticalIssues.push(`${system.name}: File missing - ${system.path}`);
        }
    }
    
    console.log(`📊 Proactive system validation: ${results.passedValidations}/${requiredSystems.length} systems validated`);
}

/**
 * 🧪 VALIDATE TEST SUITE FILES
 */
async function validateTestSuiteFiles(results) {
    const testFiles = [
        {
            name: 'Main Test Suite',
            path: 'test/ComprehensiveProactivePreventionTestSuite.js',
            requiredContent: [
                'ProactiveKnowledgeCredibilityPipeline',
                'ProactiveInferenceReliabilityEngine', 
                'ProactiveVeracityJudgeService',
                'SFTFlywheelGovernor',
                'ProactiveCognitiveMetabolicLoop'
            ]
        },
        {
            name: 'Test Runner Script',
            path: 'run_proactive_prevention_tests.js',
            requiredContent: [
                'runProactivePreventionTests',
                'validateTestEnvironment',
                'runJestTests'
            ]
        }
    ];

    for (const testFile of testFiles) {
        results.totalValidations++;
        
        try {
            const filePath = join(__dirname, testFile.path);
            await access(filePath);
            
            const content = await readFile(filePath, 'utf-8');
            const missingContent = testFile.requiredContent.filter(
                required => !content.includes(required)
            );
            
            if (missingContent.length === 0) {
                console.log(`   ✅ ${testFile.name}: All required content present`);
                results.passedValidations++;
                results.testInfrastructure[testFile.name] = 'PASSED';
            } else {
                console.log(`   ❌ ${testFile.name}: Missing content: ${missingContent.join(', ')}`);
                results.failedValidations++;
                results.testInfrastructure[testFile.name] = 'MISSING_CONTENT';
            }
            
        } catch (error) {
            console.log(`   ❌ ${testFile.name}: File not accessible`);
            results.failedValidations++;
            results.testInfrastructure[testFile.name] = 'FILE_ERROR';
        }
    }
}

/**
 * 💾 VALIDATE STATE PERSISTENCE IMPLEMENTATION
 */
async function validateStatePersistenceImplementation(results) {
    const persistenceChecks = [
        {
            name: 'PostgreSQL Database Operations',
            validate: async () => {
                const systems = [
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveKnowledgeCredibilityPipeline.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveInferenceReliabilityEngine.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveVeracityJudgeService.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/SFTFlywheelGovernor.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveCognitiveMetabolicLoop.js'
                ];
                
                let validImplementations = 0;
                for (const systemPath of systems) {
                    try {
                        const content = await readFile(join(__dirname, systemPath), 'utf-8');
                        const hasDbOperations = 
                            content.includes('this.statePersistence.dbPool.connect()') &&
                            content.includes('client.query(') &&
                            content.includes('client.release()') &&
                            content.includes('INSERT INTO') &&
                            content.includes('ON CONFLICT');
                        
                        if (hasDbOperations) {
                            validImplementations++;
                        }
                    } catch (error) {
                        // File not accessible
                    }
                }
                
                return `${validImplementations}/${systems.length}`;
            }
        },
        {
            name: 'Major Achievement Implementation',
            validate: async () => {
                const systems = [
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveKnowledgeCredibilityPipeline.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveInferenceReliabilityEngine.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveVeracityJudgeService.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/SFTFlywheelGovernor.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveCognitiveMetabolicLoop.js'
                ];
                
                let validAchievements = 0;
                for (const systemPath of systems) {
                    try {
                        const content = await readFile(join(__dirname, systemPath), 'utf-8');
                        const hasAchievements = 
                            content.includes('🏆 MAJOR ACHIEVEMENT DETECTED') &&
                            content.includes('achievementBackupCount++') &&
                            content.includes('lastMajorAchievement');
                        
                        if (hasAchievements) {
                            validAchievements++;
                        }
                    } catch (error) {
                        // File not accessible
                    }
                }
                
                return `${validAchievements}/${systems.length}`;
            }
        }
    ];

    for (const check of persistenceChecks) {
        results.totalValidations++;
        
        try {
            const result = await check.validate();
            const passed = result === '5/5';
            
            console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${result} (expected: 5/5)`);
            
            if (passed) {
                results.passedValidations++;
            } else {
                results.failedValidations++;
                results.criticalIssues.push(`${check.name}: ${result} (expected: 5/5)`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${check.name}: Validation error - ${error.message}`);
            results.failedValidations++;
            results.criticalIssues.push(`${check.name}: Validation error`);
        }
    }
}

/**
 * 🔗 VALIDATE INTEGRATION POINTS
 */
async function validateIntegrationPoints(results) {
    const integrationChecks = [
        {
            name: 'MasterPretrainingDevelopmentImplementationPlan Integration',
            check: async () => {
                try {
                    const masterPlanPath = join(__dirname, 'MasterPretrainingDevelopmentImplementationPlan.md');
                    const content = await readFile(masterPlanPath, 'utf-8');
                    
                    return content.includes('ProactiveKnowledgeCredibilityPipeline') &&
                           content.includes('ProactiveInferenceReliabilityEngine') &&
                           content.includes('ProactiveVeracityJudgeService') &&
                           content.includes('SFTFlywheelGovernor') &&
                           content.includes('ProactiveCognitiveMetabolicLoop');
                } catch {
                    return false;
                }
            }
        },
        {
            name: 'ServiceRegistry Integration Points',
            check: async () => {
                try {
                    const masterPlanPath = join(__dirname, 'MasterPretrainingDevelopmentImplementationPlan.md');
                    const content = await readFile(masterPlanPath, 'utf-8');
                    
                    return content.includes('serviceRegistry.proactiveKnowledgeCredibilityPipeline') &&
                           content.includes('serviceRegistry.proactiveInferenceReliabilityEngine') &&
                           content.includes('serviceRegistry.proactiveVeracityJudgeService');
                } catch {
                    return false;
                }
            }
        }
    ];

    for (const check of integrationChecks) {
        results.totalValidations++;
        
        try {
            const passed = await check.check();
            
            console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'INTEGRATED' : 'NOT_INTEGRATED'}`);
            
            if (passed) {
                results.passedValidations++;
            } else {
                results.failedValidations++;
                results.criticalIssues.push(`${check.name}: Integration missing`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${check.name}: Validation error`);
            results.failedValidations++;
        }
    }
}

/**
 * 📦 VALIDATE TEST DEPENDENCIES
 */
async function validateTestDependencies(results) {
    const dependencyChecks = [
        {
            name: 'Node.js Version',
            check: () => {
                const version = process.version;
                const majorVersion = parseInt(version.substring(1));
                return majorVersion >= 18;
            },
            expected: 'v18+',
            actual: () => process.version
        },
        {
            name: 'ESM Module Support',
            check: async () => {
                try {
                    const packagePath = join(__dirname, 'package.json');
                    const content = await readFile(packagePath, 'utf-8');
                    const packageJson = JSON.parse(content);
                    
                    return packageJson.type === 'module';
                } catch {
                    return false;
                }
            },
            expected: 'module',
            actual: () => 'ESM'
        }
    ];

    for (const check of dependencyChecks) {
        results.totalValidations++;
        
        try {
            const passed = await check.check();
            const actualValue = check.actual ? check.actual() : (passed ? check.expected : 'MISSING');
            
            console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${actualValue} (expected: ${check.expected})`);
            
            if (passed) {
                results.passedValidations++;
            } else {
                results.failedValidations++;
                results.criticalIssues.push(`${check.name}: Dependency issue`);
            }
            
        } catch (error) {
            console.log(`   ❌ ${check.name}: Validation error`);
            results.failedValidations++;
        }
    }
}

/**
 * 📊 GENERATE VALIDATION REPORT
 */
function generateValidationReport(results) {
    console.log('\n📊 PROACTIVE PREVENTION TEST SETUP VALIDATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 OVERALL VALIDATION RESULTS:`);
    console.log(`   Total Validations: ${results.totalValidations}`);
    console.log(`   Passed: ${results.passedValidations}`);
    console.log(`   Failed: ${results.failedValidations}`);
    console.log(`   Success Rate: ${((results.passedValidations / results.totalValidations) * 100).toFixed(2)}%`);
    
    console.log(`\n🛡️ PROACTIVE SYSTEM VALIDATION RESULTS:`);
    for (const [system, result] of Object.entries(results.systemValidations)) {
        console.log(`   ${system}: ${result}`);
    }
    
    if (results.criticalIssues.length > 0) {
        console.log(`\n🚨 CRITICAL ISSUES DETECTED:`);
        results.criticalIssues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue}`);
        });
        
        console.log('\n❌ TEST SETUP VALIDATION FAILED');
        console.log('🔧 Resolve critical issues before running test suite');
        
    } else {
        console.log('\n🎉 TEST SETUP VALIDATION SUCCESSFUL!');
        console.log('✅ All proactive prevention systems ready for testing');
        console.log('\n🚀 READY TO RUN COMPREHENSIVE PROACTIVE PREVENTION TEST SUITE');
        console.log('   Execute: npm run test:proactive-comprehensive-direct');
    }
    
    console.log('\n🧠🛡️⚡ PROACTIVE PREVENTION TEST SETUP VALIDATION COMPLETE');
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    try {
        const validationResults = await validateProactiveTestSetup();
        
        // Exit with appropriate code
        const success = validationResults.criticalIssues.length === 0;
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        console.error('💥 CRITICAL VALIDATION ERROR:', error);
        process.exit(1);
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { validateProactiveTestSetup };
