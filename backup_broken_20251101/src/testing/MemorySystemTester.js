/**
 * 💾🧮 MEMORY SYSTEM TESTER - RIGOROUS MEMORY & PERFORMANCE SYSTEM TESTING
 * ========================================================================
 * 
 * **BRUTAL TRUTH TESTING FOR MEMORY PERFORMANCE & DESTILLATION SYSTEMS**
 * 
 * CRITICAL PURPOSE:
 * - Test EVERY method in memory performance and destillation systems
 * - Validate memory performance testing actually identifies valuable memories
 * - Test memory destillation preserves creativity while removing outdated content
 * - Reveal integration flaws between memory and performance tracking systems
 * - Identify edge cases in memory valuation and destillation logic
 * 
 * SYSTEMS UNDER RIGOROUS TESTING:
 * 1. MemoryDestillationOvertrainingEngine - Memory quality optimization
 * 2. MemoryPerformanceValueTestingEngine - Evidence-based memory valuation
 * 3. SophisticatedPerformanceTrackingSystem - Multi-dimensional performance measurement
 */

import { MemoryDestillationOvertrainingEngine } from '../creativity/MemoryDestillationOvertrainingEngine.js';
import { MemoryPerformanceValueTestingEngine } from '../memory/MemoryPerformanceValueTestingEngine.js';
import { SophisticatedPerformanceTrackingSystem } from '../performance/SophisticatedPerformanceTrackingSystem.js';

export class MemorySystemTester {
    constructor() {
        this.testResults = {
            memoryDestillation: [],
            memoryPerformanceTesting: [],
            sophisticatedPerformanceTracking: [],
            integrationTests: [],
            edgeCaseTests: [],
            performanceTests: []
        };
        
        this.criticalFlaws = [];
        this.performanceBottlenecks = [];
        this.memoryIntegrityIssues = [];
        
        console.log(`💾🧮 MemorySystemTester initialized`);
    }

    /**
     * 🔬 RUN ALL MEMORY SYSTEM TESTS
     * =============================
     */
    async runAllMemorySystemTests() {
        console.log(`🔬 Running comprehensive memory system tests...`);
        console.log('⚡ BRUTAL TRUTH MODE: Testing every memory method for flaws...');
        
        const testSummary = {
            startTime: Date.now(),
            testsRun: 0,
            failures: 0,
            warnings: 0,
            successes: 0,
            criticalIssues: []
        };
        
        try {
            // Test 1: MemoryDestillationOvertrainingEngine - CRITICAL SYSTEM
            console.log(`\n🗑️ TESTING MEMORY DESTILLATION OVERTRAINING ENGINE...`);
            await this.testMemoryDestillationEngineRigorous(testSummary);
            
            // Test 2: MemoryPerformanceValueTestingEngine - CRITICAL VALIDATION
            console.log(`\n📊 TESTING MEMORY PERFORMANCE VALUE TESTING ENGINE...`);
            await this.testMemoryPerformanceTestingEngineRigorous(testSummary);
            
            // Test 3: SophisticatedPerformanceTrackingSystem - MEASUREMENT SYSTEM
            console.log(`\n📈 TESTING SOPHISTICATED PERFORMANCE TRACKING SYSTEM...`);
            await this.testSophisticatedPerformanceTrackingRigorous(testSummary);
            
            // Test 4: Memory System Integration Testing
            console.log(`\n🔗 TESTING MEMORY SYSTEM INTEGRATION...`);
            await this.testMemorySystemIntegration(testSummary);
            
            // Test 5: Edge Cases and Error Conditions
            console.log(`\n🧪 TESTING MEMORY SYSTEM EDGE CASES...`);
            await this.testMemorySystemEdgeCases(testSummary);
            
            // Test 6: Performance and Memory Leak Testing
            console.log(`\n⚡ TESTING MEMORY SYSTEM PERFORMANCE...`);
            await this.testMemorySystemPerformance(testSummary);
            
            testSummary.endTime = Date.now();
            testSummary.duration = testSummary.endTime - testSummary.startTime;
            
            console.log(`\n✅ MEMORY SYSTEMS TESTING COMPLETE!`);
            console.log(`📊 Tests Run: ${testSummary.testsRun}`);
            console.log(`❌ Failures: ${testSummary.failures}`);
            console.log(`⚠️ Warnings: ${testSummary.warnings}`);
            console.log(`✅ Successes: ${testSummary.successes}`);
            
            return {
                success: true,
                testSummary: testSummary,
                criticalFlaws: this.criticalFlaws,
                performanceBottlenecks: this.performanceBottlenecks,
                memoryIntegrityIssues: this.memoryIntegrityIssues,
                testResults: this.testResults
            };
            
        } catch (error) {
            console.error(`❌ Memory systems testing failed: ${error.message}`);
            return {
                success: false,
                error: error.message,
                partialResults: this.testResults,
                criticalFlaws: this.criticalFlaws
            };
        }
    }

    /**
     * 🗑️ TEST MEMORY DESTILLATION ENGINE RIGOROUS
     * ===========================================
     */
    async testMemoryDestillationEngineRigorous(testSummary) {
        console.log(`🗑️ Testing MemoryDestillationOvertrainingEngine rigorously...`);
        
        try {
            const memoryDestillationEngine = new MemoryDestillationOvertrainingEngine('rigorous_test');
            
            // Test 1: Initialization
            console.log(`🔬 Testing initialization...`);
            try {
                await memoryDestillationEngine.initialize();
                this.recordTestResult('memoryDestillation', 'initialization', 'success', 'Initialization successful');
                testSummary.successes++;
            } catch (error) {
                this.recordTestResult('memoryDestillation', 'initialization', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('MemoryDestillationOvertrainingEngine initialization broken');
                return;
            }
            testSummary.testsRun++;
            
            // Test 2: Memory analysis for destillation - CORE FUNCTIONALITY
            console.log(`🔬 Testing memory analysis for destillation...`);
            try {
                const testMemories = [
                    {
                        id: 'mem_high_value',
                        content: 'Revolutionary arbitrage strategy with 95% success rate',
                        importance: 0.95,
                        lastUsed: Date.now() - 3600000, // 1 hour ago
                        usageCount: 25,
                        performanceContribution: 0.85,
                        creativityContribution: 0.9,
                        agentId: 'elite-developer-specialist'
                    },
                    {
                        id: 'mem_outdated',
                        content: 'Gas price information from 2023 (outdated)',
                        importance: 0.2,
                        lastUsed: Date.now() - 86400000 * 60, // 60 days ago
                        usageCount: 2,
                        performanceContribution: -0.15, // Negative contribution
                        creativityContribution: 0.1,
                        agentId: 'arbitrum-flash-specialist'
                    },
                    {
                        id: 'mem_negative_performance',
                        content: 'Incorrect MEV strategy that causes losses',
                        importance: 0.4,
                        lastUsed: Date.now() - 86400000 * 7, // 7 days ago
                        usageCount: 8,
                        performanceContribution: -0.3, // Strong negative contribution
                        creativityContribution: 0.2,
                        agentId: 'polygon-micro-king'
                    },
                    {
                        id: 'mem_high_creativity',
                        content: 'Creative breakthrough in cross-chain coordination',
                        importance: 0.7,
                        lastUsed: Date.now() - 86400000 * 2, // 2 days ago
                        usageCount: 5,
                        performanceContribution: 0.4,
                        creativityContribution: 0.95, // High creativity
                        agentId: 'ai-prediction-intelligence'
                    }
                ];
                
                const analysisResult = await memoryDestillationEngine.analyzeMemoryForDestillation(testMemories);
                
                if (!analysisResult || !analysisResult.recommendations) {
                    throw new Error('analyzeMemoryForDestillation returned invalid result');
                }
                
                // Validate destillation logic
                const destillRecommendations = analysisResult.recommendations.filter(r => r.action === 'destill');
                const preserveRecommendations = analysisResult.recommendations.filter(r => r.action === 'preserve');
                
                // Check if high-value and high-creativity memories are preserved
                const highValuePreserved = preserveRecommendations.some(r => r.memoryId === 'mem_high_value');
                const highCreativityPreserved = preserveRecommendations.some(r => r.memoryId === 'mem_high_creativity');
                
                if (!highValuePreserved) {
                    this.recordTestResult('memoryDestillation', 'analyzeMemoryForDestillation', 'failure', 'High-value memory not preserved - destillation logic broken', 'critical');
                    testSummary.failures++;
                    testSummary.criticalIssues.push('Memory destillation destroying high-value memories');
                } else if (!highCreativityPreserved) {
                    this.recordTestResult('memoryDestillation', 'analyzeMemoryForDestillation', 'failure', 'High-creativity memory not preserved - creativity preservation broken', 'critical');
                    testSummary.failures++;
                    testSummary.criticalIssues.push('Memory destillation destroying creative memories');
                } else {
                    // Check if negative performance memories are destilled
                    const negativeDestilled = destillRecommendations.some(r => r.memoryId === 'mem_negative_performance');
                    const outdatedDestilled = destillRecommendations.some(r => r.memoryId === 'mem_outdated');
                    
                    if (!negativeDestilled || !outdatedDestilled) {
                        this.recordTestResult('memoryDestillation', 'analyzeMemoryForDestillation', 'warning', 'Not destilling negative/outdated memories as expected');
                        testSummary.warnings++;
                    } else {
                        this.recordTestResult('memoryDestillation', 'analyzeMemoryForDestillation', 'success', 'Memory destillation logic working correctly');
                        testSummary.successes++;
                    }
                }
                
            } catch (error) {
                this.recordTestResult('memoryDestillation', 'analyzeMemoryForDestillation', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('Memory analysis for destillation completely broken');
            }
            testSummary.testsRun++;
            
            // Test 3: Proactive memory guidance generation
            console.log(`🔬 Testing proactive memory guidance generation...`);
            try {
                const guidanceResult = await memoryDestillationEngine.generateProactiveMemoryGuidance('elite-developer-specialist');
                
                if (!guidanceResult || !guidanceResult.guidance) {
                    throw new Error('generateProactiveMemoryGuidance returned invalid result');
                }
                
                // Validate guidance contains actionable recommendations
                if (!guidanceResult.guidance.recommendedActions || guidanceResult.guidance.recommendedActions.length === 0) {
                    this.recordTestResult('memoryDestillation', 'generateProactiveMemoryGuidance', 'warning', 'No actionable recommendations generated');
                    testSummary.warnings++;
                } else {
                    this.recordTestResult('memoryDestillation', 'generateProactiveMemoryGuidance', 'success', `Generated ${guidanceResult.guidance.recommendedActions.length} actionable recommendations`);
                    testSummary.successes++;
                }
                
            } catch (error) {
                this.recordTestResult('memoryDestillation', 'generateProactiveMemoryGuidance', 'failure', error.message, 'high');
                testSummary.failures++;
            }
            testSummary.testsRun++;
            
            // Test 4: Integration with sophisticated performance tracking
            console.log(`🔬 Testing integration with performance tracking...`);
            await this.testMemoryDestillationPerformanceIntegration(memoryDestillationEngine, testSummary);
            
        } catch (error) {
            this.recordTestResult('memoryDestillation', 'overall', 'failure', error.message, 'critical');
            testSummary.failures++;
            testSummary.criticalIssues.push('MemoryDestillationOvertrainingEngine completely broken');
        }
    }

    /**
     * 📊 TEST MEMORY PERFORMANCE TESTING ENGINE RIGOROUS
     * =================================================
     */
    async testMemoryPerformanceTestingEngineRigorous(testSummary) {
        console.log(`📊 Testing MemoryPerformanceValueTestingEngine rigorously...`);
        
        try {
            const memoryPerformanceEngine = new MemoryPerformanceValueTestingEngine('rigorous_test');
            
            // Test 1: Initialization
            console.log(`🔬 Testing initialization...`);
            try {
                await memoryPerformanceEngine.initialize();
                this.recordTestResult('memoryPerformanceTesting', 'initialization', 'success', 'Initialization successful');
                testSummary.successes++;
            } catch (error) {
                this.recordTestResult('memoryPerformanceTesting', 'initialization', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('MemoryPerformanceValueTestingEngine initialization broken');
                return;
            }
            testSummary.testsRun++;
            
            // Test 2: Memory performance value testing - CORE FUNCTIONALITY
            console.log(`🔬 Testing memory performance value testing...`);
            try {
                const testMemory = {
                    id: 'test_memory_001',
                    content: 'Flash loan arbitrage strategy for ETH-USDC pairs',
                    agentId: 'arbitrum-flash-specialist',
                    memoryType: 'strategy',
                    lastUsed: Date.now() - 3600000,
                    usageCount: 15,
                    importance: 0.8
                };
                
                const performanceTestResult = await memoryPerformanceEngine.testMemoryPerformanceValue(
                    testMemory,
                    {
                        testScenarios: 'arbitrage_execution',
                        baselineRounds: 50,
                        memoryIntegratedRounds: 50,
                        significanceThreshold: 0.05
                    }
                );
                
                if (!performanceTestResult || performanceTestResult.performanceContribution === undefined) {
                    throw new Error('testMemoryPerformanceValue returned invalid result');
                }
                
                // Validate statistical analysis
                if (!performanceTestResult.statisticalAnalysis || !performanceTestResult.statisticalAnalysis.pValue) {
                    throw new Error('Memory performance testing missing statistical analysis');
                }
                
                this.recordTestResult('memoryPerformanceTesting', 'testMemoryPerformanceValue', 'success', `Performance contribution: ${(performanceTestResult.performanceContribution * 100).toFixed(2)}%`);
                testSummary.successes++;
                
            } catch (error) {
                this.recordTestResult('memoryPerformanceTesting', 'testMemoryPerformanceValue', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('Cannot test memory performance value - core functionality broken');
            }
            testSummary.testsRun++;
            
            // Test 3: Creativity impact assessment
            console.log(`🔬 Testing creativity impact assessment...`);
            try {
                const creativityMemory = {
                    id: 'creativity_memory_001',
                    content: 'Novel cross-chain arbitrage coordination technique',
                    agentId: 'ai-prediction-intelligence',
                    memoryType: 'creative_insight',
                    creativityScore: 0.92,
                    originalityScore: 0.88,
                    innovationPotential: 0.85
                };
                
                const creativityAssessment = await memoryPerformanceEngine.assessCreativityImpact(creativityMemory);
                
                if (!creativityAssessment || creativityAssessment.creativityContribution === undefined) {
                    throw new Error('assessCreativityImpact returned invalid result');
                }
                
                // High creativity memories should have high contribution scores
                if (creativityAssessment.creativityContribution < 0.7) {
                    this.recordTestResult('memoryPerformanceTesting', 'assessCreativityImpact', 'warning', `High creativity memory got low contribution score: ${creativityAssessment.creativityContribution.toFixed(3)}`);
                    testSummary.warnings++;
                } else {
                    this.recordTestResult('memoryPerformanceTesting', 'assessCreativityImpact', 'success', `Creativity assessment working correctly`);
                    testSummary.successes++;
                }
                
            } catch (error) {
                this.recordTestResult('memoryPerformanceTesting', 'assessCreativityImpact', 'failure', error.message, 'high');
                testSummary.failures++;
            }
            testSummary.testsRun++;
            
            // Test 4: Overtraining risk assessment
            console.log(`🔬 Testing overtraining risk assessment...`);
            try {
                const overtrainingTestMemories = [
                    {
                        id: 'brittle_memory',
                        content: 'Overly specific strategy that only works in exact conditions',
                        specificityScore: 0.95,
                        generalizationScore: 0.2,
                        adaptabilityImpact: -0.3
                    },
                    {
                        id: 'flexible_memory',
                        content: 'Adaptable strategy that works across market conditions',
                        specificityScore: 0.4,
                        generalizationScore: 0.85,
                        adaptabilityImpact: 0.4
                    }
                ];
                
                for (const memory of overtrainingTestMemories) {
                    const overtrainingAssessment = await memoryPerformanceEngine.assessOvertrainingRisk(memory);
                    
                    if (!overtrainingAssessment || overtrainingAssessment.overtrainingRisk === undefined) {
                        throw new Error('assessOvertrainingRisk returned invalid result');
                    }
                    
                    // Validate risk assessment makes sense
                    if (memory.id === 'brittle_memory' && overtrainingAssessment.overtrainingRisk < 0.6) {
                        this.recordTestResult('memoryPerformanceTesting', `assessOvertrainingRisk_${memory.id}`, 'warning', `Brittle memory not identified as high overtraining risk`);
                        testSummary.warnings++;
                    } else if (memory.id === 'flexible_memory' && overtrainingAssessment.overtrainingRisk > 0.4) {
                        this.recordTestResult('memoryPerformanceTesting', `assessOvertrainingRisk_${memory.id}`, 'warning', `Flexible memory incorrectly identified as high overtraining risk`);
                        testSummary.warnings++;
                    } else {
                        this.recordTestResult('memoryPerformanceTesting', `assessOvertrainingRisk_${memory.id}`, 'success', `Overtraining risk correctly assessed: ${overtrainingAssessment.overtrainingRisk.toFixed(3)}`);
                        testSummary.successes++;
                    }
                }
                
            } catch (error) {
                this.recordTestResult('memoryPerformanceTesting', 'assessOvertrainingRisk', 'failure', error.message, 'high');
                testSummary.failures++;
            }
            testSummary.testsRun += 2; // Tested 2 memories
            
            // Test 5: Evidence-based destillation decisions
            console.log(`🔬 Testing evidence-based destillation decisions...`);
            await this.testEvidenceBasedDestillationDecisions(memoryPerformanceEngine, testSummary);
            
        } catch (error) {
            this.recordTestResult('memoryPerformanceTesting', 'overall', 'failure', error.message, 'critical');
            testSummary.failures++;
            testSummary.criticalIssues.push('MemoryPerformanceValueTestingEngine completely broken');
        }
    }

    /**
     * 📈 TEST SOPHISTICATED PERFORMANCE TRACKING RIGOROUS
     * ==================================================
     */
    async testSophisticatedPerformanceTrackingRigorous(testSummary) {
        console.log(`📈 Testing SophisticatedPerformanceTrackingSystem rigorously...`);
        
        try {
            const performanceTracking = new SophisticatedPerformanceTrackingSystem('rigorous_test');
            
            // Test 1: Initialization
            console.log(`🔬 Testing initialization...`);
            try {
                await performanceTracking.initialize();
                this.recordTestResult('sophisticatedPerformanceTracking', 'initialization', 'success', 'Initialization successful');
                testSummary.successes++;
            } catch (error) {
                this.recordTestResult('sophisticatedPerformanceTracking', 'initialization', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('SophisticatedPerformanceTrackingSystem initialization broken');
                return;
            }
            testSummary.testsRun++;
            
            // Test 2: Multi-dimensional performance tracking for execution agents
            console.log(`🔬 Testing execution agent performance tracking...`);
            try {
                const executionMetrics = {
                    agentId: 'arbitrum-flash-specialist',
                    agentType: 'execution',
                    performance: {
                        flashLoanSuccessRate: 0.87,
                        mevCaptureEfficiency: 0.74,
                        gasOptimizationScore: 0.91,
                        profitMarginMaintenance: 0.83,
                        executionSpeed: 2.3, // seconds
                        crossChainCoordination: 0.79
                    }
                };
                
                const trackingResult = await performanceTracking.trackExecutionAgentPerformance(executionMetrics);
                
                if (!trackingResult || !trackingResult.overallScore) {
                    throw new Error('trackExecutionAgentPerformance returned invalid result');
                }
                
                // Validate multi-dimensional scoring
                if (trackingResult.overallScore < 0 || trackingResult.overallScore > 1) {
                    throw new Error('Overall score out of valid range [0,1]');
                }
                
                this.recordTestResult('sophisticatedPerformanceTracking', 'trackExecutionAgentPerformance', 'success', `Overall score: ${trackingResult.overallScore.toFixed(3)}`);
                testSummary.successes++;
                
            } catch (error) {
                this.recordTestResult('sophisticatedPerformanceTracking', 'trackExecutionAgentPerformance', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('Cannot track execution agent performance');
            }
            testSummary.testsRun++;
            
            // Test 3: Development agent performance tracking
            console.log(`🔬 Testing development agent performance tracking...`);
            try {
                const developmentMetrics = {
                    agentId: 'elite-developer-specialist',
                    agentType: 'development',
                    performance: {
                        codeQualityScore: 0.92,
                        securityAuditResults: 0.88,
                        gasOptimizationAchievement: 0.85,
                        deploymentSuccessRate: 0.96,
                        humanApprovalRate: 0.91,
                        innovationScore: 0.87,
                        performanceBenchmarks: 0.89
                    }
                };
                
                const devTrackingResult = await performanceTracking.trackDevelopmentAgentPerformance(developmentMetrics);
                
                if (!devTrackingResult || !devTrackingResult.overallScore) {
                    throw new Error('trackDevelopmentAgentPerformance returned invalid result');
                }
                
                this.recordTestResult('sophisticatedPerformanceTracking', 'trackDevelopmentAgentPerformance', 'success', `Development tracking working`);
                testSummary.successes++;
                
            } catch (error) {
                this.recordTestResult('sophisticatedPerformanceTracking', 'trackDevelopmentAgentPerformance', 'failure', error.message, 'critical');
                testSummary.failures++;
                testSummary.criticalIssues.push('Cannot track development agent performance');
            }
            testSummary.testsRun++;
            
            // Test 4: Analysis agent performance tracking
            console.log(`🔬 Testing analysis agent performance tracking...`);
            await this.testAnalysisAgentPerformanceTracking(performanceTracking, testSummary);
            
            // Test 5: Learning system performance tracking
            console.log(`🔬 Testing learning system performance tracking...`);
            await this.testLearningSystemPerformanceTracking(performanceTracking, testSummary);
            
            // Test 6: Quantum system performance tracking
            console.log(`🔬 Testing quantum system performance tracking...`);
            await this.testQuantumSystemPerformanceTracking(performanceTracking, testSummary);
            
        } catch (error) {
            this.recordTestResult('sophisticatedPerformanceTracking', 'overall', 'failure', error.message, 'critical');
            testSummary.failures++;
            testSummary.criticalIssues.push('SophisticatedPerformanceTrackingSystem completely broken');
        }
    }

    /**
     * 🔗 TEST MEMORY SYSTEM INTEGRATION
     * ================================
     */
    async testMemorySystemIntegration(testSummary) {
        console.log(`🔗 Testing memory system integration...`);
        
        try {
            // Test integration between memory destillation and performance testing
            console.log(`🧪 Testing MemoryDestillation ↔ PerformanceTesting integration...`);
            
            const memoryDestillation = new MemoryDestillationOvertrainingEngine('integration_test');
            const memoryPerformance = new MemoryPerformanceValueTestingEngine('integration_test');
            const performanceTracking = new SophisticatedPerformanceTrackingSystem('integration_test');
            
            // Initialize all systems
            await memoryDestillation.initialize();
            await memoryPerformance.initialize();
            await performanceTracking.initialize();
            
            // Test full pipeline: Performance testing → Destillation decision → Tracking
            const testMemory = {
                id: 'integration_test_memory',
                content: 'Test arbitrage strategy for integration validation',
                agentId: 'integration-test-agent'
            };
            
            // Step 1: Test memory performance
            const performanceResult = await memoryPerformance.testMemoryPerformanceValue(testMemory);
            
            // Step 2: Use performance result in destillation analysis
            const destillationAnalysis = await memoryDestillation.analyzeMemoryForDestillation([{
                ...testMemory,
                performanceContribution: performanceResult.performanceContribution
            }]);
            
            // Step 3: Track the destillation performance
            const trackingResult = await performanceTracking.trackMemorySystemPerformance({
                memoryCount: 1,
                destillationRecommendations: destillationAnalysis.recommendations.length,
                performanceValidation: performanceResult.statisticallySignificant
            });
            
            this.recordTestResult('integrationTests', 'memory_system_integration', 'success', 'Memory system integration pipeline working');
            testSummary.successes++;
            
        } catch (error) {
            this.recordTestResult('integrationTests', 'memory_system_integration', 'failure', error.message, 'critical');
            testSummary.failures++;
            testSummary.criticalIssues.push('Memory system integration broken');
        }
        testSummary.testsRun++;
    }

    /**
     * 🧪 TEST MEMORY SYSTEM EDGE CASES
     * ===============================
     */
    async testMemorySystemEdgeCases(testSummary) {
        console.log(`🧪 Testing memory system edge cases...`);
        
        const edgeCases = [
            // Empty/null memory inputs
            { memory: null, expectedError: 'Null memory input' },
            { memory: {}, expectedError: 'Empty memory object' },
            { memory: { id: '', content: '' }, expectedError: 'Empty memory content' },
            
            // Invalid memory data
            { memory: { id: 'test', content: 'valid', performanceContribution: -2 }, expectedError: 'Performance contribution out of range' },
            { memory: { id: 'test', content: 'valid', importance: 1.5 }, expectedError: 'Importance out of range' },
            { memory: { id: 'test', content: 'valid', usageCount: -1 }, expectedError: 'Negative usage count' },
            
            // Very large memory collections (stress test)
            { memoryCount: 10000, expectedError: null }, // Should handle large collections
            
            // Corrupted memory data
            { memory: { id: 'test', content: null }, expectedError: 'Null content' },
            { memory: { id: 'test', content: 'A'.repeat(1000000) }, expectedError: 'Content too large' }
        ];
        
        for (let i = 0; i < edgeCases.length; i++) {
            const testCase = edgeCases[i];
            console.log(`🧪 Edge Case ${i + 1}: ${testCase.expectedError || 'Stress test'}`);
            
            try {
                const memoryPerformance = new MemoryPerformanceValueTestingEngine('edge_case_test');
                await memoryPerformance.initialize();
                
                if (testCase.memoryCount) {
                    // Stress test with large memory collection
                    const largeMemoryCollection = Array.from({ length: testCase.memoryCount }, (_, idx) => ({
                        id: `stress_memory_${idx}`,
                        content: `Test memory content ${idx}`,
                        agentId: 'stress-test-agent'
                    }));
                    
                    const startTime = Date.now();
                    await memoryPerformance.testMultipleMemoryPerformance(largeMemoryCollection);
                    const duration = Date.now() - startTime;
                    
                    if (duration > 30000) { // 30 second limit
                        this.performanceBottlenecks.push({
                            system: 'memoryPerformanceTesting',
                            method: 'testMultipleMemoryPerformance',
                            issue: `Large memory collection took ${duration}ms`,
                            impact: 'May timeout in production'
                        });
                        testSummary.warnings++;
                    } else {
                        this.recordTestResult('edgeCaseTests', `stress_test_${testCase.memoryCount}_memories`, 'success', `Handled ${testCase.memoryCount} memories in ${duration}ms`);
                        testSummary.successes++;
                    }
                    
                } else {
                    // Test invalid memory input
                    await memoryPerformance.testMemoryPerformanceValue(testCase.memory);
                    
                    // If we get here without error, validation is insufficient
                    if (testCase.expectedError) {
                        this.recordTestResult('edgeCaseTests', `memory_edge_case_${i + 1}`, 'warning', `Expected error '${testCase.expectedError}' but processing succeeded`);
                        testSummary.warnings++;
                    } else {
                        this.recordTestResult('edgeCaseTests', `memory_edge_case_${i + 1}`, 'success', 'Valid input processed correctly');
                        testSummary.successes++;
                    }
                }
                
            } catch (error) {
                if (testCase.expectedError) {
                    // Expected error - good validation
                    this.recordTestResult('edgeCaseTests', `memory_edge_case_${i + 1}`, 'success', `Appropriately rejected: ${error.message}`);
                    testSummary.successes++;
                } else {
                    // Unexpected error - potential bug
                    this.recordTestResult('edgeCaseTests', `memory_edge_case_${i + 1}`, 'failure', error.message, 'medium');
                    testSummary.failures++;
                }
            }
            testSummary.testsRun++;
        }
    }

    // ... [Additional testing methods for specific functionality]

    /**
     * 📊 RECORD TEST RESULTS
     * =====================
     */
    
    recordTestResult(system, method, status, result, severity = null) {
        const testRecord = {
            method: method,
            status: status,
            timestamp: Date.now()
        };
        
        switch (status) {
            case 'success':
                testRecord.result = result;
                break;
            case 'failure':
                testRecord.error = result;
                testRecord.severity = severity;
                if (severity === 'critical') {
                    this.criticalFlaws.push({
                        system: system,
                        method: method,
                        error: result,
                        severity: severity
                    });
                }
                break;
            case 'warning':
                testRecord.warning = result;
                break;
        }
        
        if (!this.testResults[system]) {
            this.testResults[system] = [];
        }
        this.testResults[system].push(testRecord);
    }

    /**
     * 📈 GET MEMORY TESTING SUMMARY
     * ============================
     */
    getMemoryTestingSummary() {
        let totalTests = 0;
        let totalFailures = 0;
        let totalWarnings = 0;
        let totalSuccesses = 0;
        
        for (const [system, tests] of Object.entries(this.testResults)) {
            totalTests += tests.length;
            totalFailures += tests.filter(t => t.status === 'failure').length;
            totalWarnings += tests.filter(t => t.status === 'warning').length;
            totalSuccesses += tests.filter(t => t.status === 'success').length;
        }
        
        return {
            totalTests: totalTests,
            totalFailures: totalFailures,
            totalWarnings: totalWarnings,
            totalSuccesses: totalSuccesses,
            successRate: totalTests > 0 ? (totalSuccesses / totalTests) * 100 : 0,
            failureRate: totalTests > 0 ? (totalFailures / totalTests) * 100 : 0,
            criticalFlaws: this.criticalFlaws.length,
            performanceBottlenecks: this.performanceBottlenecks.length,
            memoryIntegrityIssues: this.memoryIntegrityIssues.length,
            systemsWithCriticalFlaws: [...new Set(this.criticalFlaws.map(f => f.system))]
        };
    }
}

