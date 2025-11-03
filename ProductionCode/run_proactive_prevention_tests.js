#!/usr/bin/env node

/**
 * 🧪⚡ PROACTIVE PREVENTION TEST RUNNER - TOP 1% EXPERT IMPLEMENTATION
 * ================================================================
 * 
 * REVOLUTIONARY TEST RUNNER FOR PROACTIVE HALLUCINATION & MODEL COLLAPSE PREVENTION
 * 
 * EXECUTION:
 * - Runs comprehensive test suite for all 5 proactive prevention systems
 * - Validates every single functionality with production-level assertions
 * - Tests state persistence, major achievement saves, and integration scenarios
 * - Provides detailed test reporting with success/failure analysis
 * 
 * PHILOSOPHY: BULLETPROOF TESTING - VALIDATE EVERY ASPECT OF PROACTIVE IMMUNITY
 * 
 * This test runner ensures the world's first proactive hallucination prevention
 * framework operates with mathematical certainty and production reliability.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 🚀 MAIN TEST EXECUTION
 */
async function runProactivePreventionTests() {
    console.log('🧪🛡️⚡ STARTING COMPREHENSIVE PROACTIVE PREVENTION TEST SUITE');
    console.log('='.repeat(80));
    console.log('🎯 Testing ALL functionality of 5 proactive prevention systems');
    console.log('🔍 Validating state persistence, major achievements, and integration');
    console.log('🌊 Ensuring proactive immunity operates with mathematical certainty');
    console.log('='.repeat(80));
    
    const startTime = Date.now();
    
    try {
        // Try Jest first
        console.log('🧪 Attempting Jest test execution...');
        let testResult;
        
        try {
            testResult = await runJestTests();
        } catch (jestError) {
            console.log('⚠️ Jest execution failed - falling back to direct test runner');
            console.log(`Jest error: ${jestError.message}`);
            
            // Fallback to direct test runner
            testResult = await runDirectTests();
        }
        
        const endTime = Date.now();
        const executionTime = endTime - startTime;
        
        console.log('\\n📊 TEST EXECUTION COMPLETE');
        console.log('='.repeat(50));
        console.log(`⏱️ Total execution time: ${(executionTime / 1000).toFixed(2)} seconds`);
        console.log(`🎯 Test result: ${testResult.success ? 'SUCCESS' : 'FAILURE'}`);
        
        if (testResult.success) {
            console.log('\\n🎉 PROACTIVE PREVENTION FRAMEWORK VALIDATED!');
            console.log('🛡️ All hallucination prevention systems operational');
            console.log('🧠 Memory consultation and uncertainty quantification working');
            console.log('⚖️ Truth-over-profit evaluation system functioning');
            console.log('🔄 Model collapse prevention active');
            console.log('🌊 Complete proactive immunity achieved');
            console.log('💾 State persistence and major achievement saves validated');
            
            console.log('\\n🚀 READY FOR PRODUCTION DEPLOYMENT');
            console.log('The Elite AI Arbitrage Syndicate now has bulletproof proactive immunity!');
            
        } else {
            console.log('\\n❌ TEST FAILURES DETECTED');
            console.log('🔧 Investigation and fixes required before production deployment');
            console.log('📋 Review test output above for specific failure details');
        }
        
        return testResult;
        
    } catch (error) {
        console.error('\\n💥 CRITICAL TEST EXECUTION ERROR:', error);
        console.log('🚨 Test suite execution failed - requires immediate investigation');
        
        return {
            success: false,
            error: error.message,
            executionTime: Date.now() - startTime
        };
    }
}

/**
 * 🧪 Run Jest tests with comprehensive configuration
 */
function runJestTests() {
    return new Promise((resolve, reject) => {
        console.log('🧪 Launching Jest test runner with comprehensive configuration...');
        
        const jestArgs = [
            '--config=jest.config.proactive.js',
            '--testPathPattern=ComprehensiveProactivePreventionTestSuite.js',
            '--verbose',
            '--colors',
            '--detectOpenHandles',
            '--forceExit',
            '--maxWorkers=1', // Single worker for sequential testing
            '--testTimeout=30000' // 30 second timeout for complex tests
        ];
        
        const jestProcess = spawn('npx', ['jest', ...jestArgs], {
            cwd: __dirname,
            stdio: 'inherit',
            env: {
                ...process.env,
                NODE_ENV: 'test',
                JEST_SILENT: 'false'
            }
        });
        
        jestProcess.on('close', (code) => {
            if (code === 0) {
                console.log('\\n✅ Jest test execution completed successfully');
                resolve({ success: true, exitCode: code });
            } else {
                console.log(`\\n❌ Jest test execution failed with exit code: ${code}`);
                resolve({ success: false, exitCode: code });
            }
        });
        
        jestProcess.on('error', (error) => {
            console.error('\\n💥 Jest process error:', error);
            reject(error);
        });
        
        // Timeout protection
        setTimeout(() => {
            jestProcess.kill('SIGTERM');
            reject(new Error('Test execution timeout after 5 minutes'));
        }, 300000); // 5 minute timeout
    });
}

/**
 * 🚀 RUN DIRECT TESTS (FALLBACK FOR JEST FAILURES)
 */
async function runDirectTests() {
    console.log('🧪 Running direct test execution (Jest fallback)...');
    
    try {
        // Import and run direct test runner
        const { DirectTestRunner } = await import('./test/DirectProactivePreventionTestRunner.js');
        
        const testRunner = new DirectTestRunner();
        const success = await testRunner.executeAllTests();
        
        return { 
            success: success, 
            runner: 'direct',
            message: 'Direct test runner executed successfully'
        };
        
    } catch (error) {
        console.error('❌ Direct test runner also failed:', error);
        return { 
            success: false, 
            runner: 'direct',
            error: error.message 
        };
    }
}

/**
 * 🎯 VALIDATE TEST ENVIRONMENT
 */
async function validateTestEnvironment() {
    console.log('🔍 Validating test environment...');
    
    const validations = [
        {
            name: 'Node.js version',
            check: () => process.version,
            expected: 'v18+',
            validate: (version) => {
                const majorVersion = parseInt(version.substring(1));
                return majorVersion >= 18;
            }
        },
        {
            name: 'Test files exist',
            check: async () => {
                const { access } = await import('fs/promises');
                try {
                    await access(join(__dirname, 'test', 'ComprehensiveProactivePreventionTestSuite.js'));
                    return 'exists';
                } catch {
                    return 'missing';
                }
            },
            expected: 'exists',
            validate: (result) => result === 'exists'
        },
        {
            name: 'Proactive systems files',
            check: async () => {
                const { access } = await import('fs/promises');
                const systemFiles = [
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveKnowledgeCredibilityPipeline.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveInferenceReliabilityEngine.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveVeracityJudgeService.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/SFTFlywheelGovernor.js',
                    'legendary-arbitrage-syndicate/packages/@syndicate/core/src/prevention/ProactiveCognitiveMetabolicLoop.js'
                ];
                
                let existingFiles = 0;
                for (const file of systemFiles) {
                    try {
                        await access(join(__dirname, file));
                        existingFiles++;
                    } catch {
                        console.log(`   ❌ Missing: ${file}`);
                    }
                }
                
                return `${existingFiles}/${systemFiles.length}`;
            },
            expected: '5/5',
            validate: (result) => result === '5/5'
        }
    ];
    
    let allValidationsPassed = true;
    
    for (const validation of validations) {
        const result = await validation.check();
        const passed = validation.validate(result);
        
        console.log(`   ${passed ? '✅' : '❌'} ${validation.name}: ${result} (expected: ${validation.expected})`);
        
        if (!passed) {
            allValidationsPassed = false;
        }
    }
    
    if (allValidationsPassed) {
        console.log('✅ Test environment validation successful');
        return true;
    } else {
        console.log('❌ Test environment validation failed');
        return false;
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    try {
        console.log('🧠🛡️⚡ PROACTIVE PREVENTION TEST RUNNER STARTING...');
        
        // Validate test environment
        const environmentValid = await validateTestEnvironment();
        if (!environmentValid) {
            console.log('🚨 Environment validation failed - aborting test execution');
            process.exit(1);
        }
        
        // Run comprehensive test suite
        const testResult = await runProactivePreventionTests();
        
        // Exit with appropriate code
        process.exit(testResult.success ? 0 : 1);
        
    } catch (error) {
        console.error('💥 CRITICAL ERROR in test runner:', error);
        process.exit(1);
    }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { runProactivePreventionTests, validateTestEnvironment };
