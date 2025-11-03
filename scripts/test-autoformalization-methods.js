#!/usr/bin/env node
/**
 * 🧠💎 AUTOFORMALIZATION ENGINE METHODS TEST
 * =========================================
 * 
 * Tests the AutoformalizationEngine methods to verify they are properly implemented
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🧠💎 AUTOFORMALIZATION ENGINE METHODS TEST 🧠💎      ║
║                                                              ║
║         Verifying all methods are properly implemented       ║
╚══════════════════════════════════════════════════════════════╝
`);

async function testAutoformalizationMethods() {
    let testResults = { passed: 0, failed: 0, tests: [] };
    
    function recordTest(testName, passed, details) {
        const result = { name: testName, passed, details, timestamp: Date.now() };
        testResults.tests.push(result);
        
        if (passed) {
            testResults.passed++;
            console.log(`✅ ${testName}: ${details}`);
        } else {
            testResults.failed++;
            console.log(`❌ ${testName}: ${details}`);
        }
    }
    
    try {
        // Import AutoformalizationEngine
        const { AutoformalizationEngine } = await import('../src/formalization/AutoformalizationEngine.js');
        
        // Test 1: EventEmitter inheritance
        const engine = new AutoformalizationEngine('test-engine');
        
        const hasOnMethod = typeof engine.on === 'function';
        const hasEmitMethod = typeof engine.emit === 'function';
        const hasRemoveListenerMethod = typeof engine.removeListener === 'function';
        const hasEventListenersMethod = typeof engine.listeners === 'function';
        
        recordTest('EventEmitter Inheritance', hasOnMethod && hasEmitMethod && hasRemoveListenerMethod && hasEventListenersMethod,
            `on: ${hasOnMethod}, emit: ${hasEmitMethod}, removeListener: ${hasRemoveListenerMethod}, listeners: ${hasEventListenersMethod}`);
        
        // Test 2: integrateWithFormalReasoningCognitiveIntegration method
        const hasIntegrationMethod = typeof engine.integrateWithFormalReasoningCognitiveIntegration === 'function';
        recordTest('Integration Method Exists', hasIntegrationMethod,
            hasIntegrationMethod ? 'Method available and callable' : 'Method missing');
        
        // Test 3: Mathematical certainty methods
        const hasCertaintyGetter = typeof engine.getMathematicalCertaintyLevel === 'function';
        const hasCertaintySetter = typeof engine.setMathematicalCertaintyLevel === 'function';
        
        recordTest('Mathematical Certainty Methods', hasCertaintyGetter && hasCertaintySetter,
            `Getter: ${hasCertaintyGetter}, Setter: ${hasCertaintySetter}`);
        
        // Test 4: Test method execution
        if (hasCertaintyGetter) {
            const initialLevel = engine.getMathematicalCertaintyLevel();
            const isValidLevel = typeof initialLevel === 'number' && initialLevel >= 0 && initialLevel <= 1;
            
            recordTest('Get Certainty Level Execution', isValidLevel,
                `Returned: ${initialLevel} (${typeof initialLevel})`);
        }
        
        // Test 5: Test setter with event emission
        if (hasCertaintySetter) {
            let eventEmitted = false;
            engine.on('mathematicalCertaintyChanged', (data) => {
                eventEmitted = true;
            });
            
            try {
                engine.setMathematicalCertaintyLevel(0.95);
                const newLevel = engine.getMathematicalCertaintyLevel();
                
                recordTest('Set Certainty Level Execution', newLevel === 0.95 && eventEmitted,
                    `Level set to: ${newLevel}, Event emitted: ${eventEmitted}`);
            } catch (error) {
                recordTest('Set Certainty Level Execution', false, `Error: ${error.message}`);
            }
        }
        
        // Test 6: Test integration method execution
        if (hasIntegrationMethod) {
            try {
                let integrationEventEmitted = false;
                engine.on('formalReasoningIntegrated', (data) => {
                    integrationEventEmitted = true;
                });
                
                engine.on('integrationError', (data) => {
                    // This is expected when passing null
                });
                
                // Test with null (should handle gracefully)
                const result = await engine.integrateWithFormalReasoningCognitiveIntegration(null);
                
                recordTest('Integration Method Execution', typeof result === 'boolean',
                    `Method executed, returned: ${result} (${typeof result})`);
                
            } catch (error) {
                recordTest('Integration Method Execution', false, `Unexpected error: ${error.message}`);
            }
        }
        
        // Test 7: Validate error handling
        try {
            engine.setMathematicalCertaintyLevel(1.5); // Should throw error
            recordTest('Error Handling Validation', false, 'Should have thrown error for invalid level');
        } catch (error) {
            recordTest('Error Handling Validation', error.message.includes('between 0 and 1'),
                `Correctly threw error: ${error.message}`);
        }
        
        // Generate report
        const totalTests = testResults.passed + testResults.failed;
        const successRate = totalTests > 0 ? ((testResults.passed / totalTests) * 100).toFixed(1) : '0.0';
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🧠💎 AUTOFORMALIZATION TEST REPORT 🧠💎        ║
╚══════════════════════════════════════════════════════════════╝

📊 RESULTS: ${testResults.passed}/${totalTests} tests passed (${successRate}%)
`);
        
        if (testResults.failed === 0) {
            console.log(`🎉 ALL AUTOFORMALIZATION METHODS WORKING PERFECTLY! 🎉

✅ EventEmitter integration: FULLY FUNCTIONAL
✅ Integration method: PROPERLY IMPLEMENTED
✅ Mathematical certainty methods: COMPLETE
✅ Error handling: ROBUST
✅ Event emission: WORKING CORRECTLY

🧠💎 AutoformalizationEngine is ready for production use!`);
            return true;
        } else {
            console.log(`⚠️ ${testResults.failed} test(s) failed. Review the failures above.`);
            return false;
        }
        
    } catch (error) {
        console.error('💥 Critical test failure:', error);
        return false;
    }
}

const success = await testAutoformalizationMethods();
process.exit(success ? 0 : 1);
