/**
 * 🧬 QUANTUM EVOLUTION SYSTEM - COMPREHENSIVE TEST SUITE
 * =====================================================
 * 
 * Tests all quantum evolution components for proper imports, initialization,
 * and basic functionality before deployment to production arbitrage.
 */

import { QuantumEvolutionStrategiesSystem } from './quantum-evolution-strategies-system.js';
import { AgentSpecificEvolutionConfig } from './agent-specific-evolution-config.js';
import { CompetitiveIntelligenceEvolution } from './competitive-intelligence-evolution.js';
import { TemporalEvolutionSystem } from './temporal-evolution-system.js';
import { QuantumEvolutionMasterSystem } from './quantum-evolution-master-system.js';

// Test configuration
const TEST_CONFIG = {
    verbose: true,
    skipSlowTests: false,
    maxTestDuration: 30000, // 30 seconds
};

class QuantumEvolutionSystemTester {
    constructor() {
        this.results = [];
        this.startTime = 0;
        
        console.log('🧬 QUANTUM EVOLUTION SYSTEM - COMPREHENSIVE TEST SUITE');
        console.log('======================================================');
    }

    async runTest(testName, testFn) {
        const startTime = Date.now();
        console.log(`\n🔬 Testing: ${testName}`);
        
        try {
            const result = await testFn();
            const duration = Date.now() - startTime;
            
            this.results.push({
                testName,
                passed: true,
                duration,
                details: result
            });
            
            console.log(`✅ PASSED: ${testName} (${duration}ms)`);
            if (TEST_CONFIG.verbose && result) {
                console.log(`   Details:`, result);
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            
            this.results.push({
                testName,
                passed: false,
                error: error instanceof Error ? error.message : String(error),
                duration
            });
            
            console.log(`❌ FAILED: ${testName} (${duration}ms)`);
            console.log(`   Error:`, error);
        }
    }

    async testImports() {
        await this.runTest('Import Validation', async () => {
            // Test if all imports are valid
            const imports = {
                QuantumEvolutionStrategiesSystem: !!QuantumEvolutionStrategiesSystem,
                AgentSpecificEvolutionConfig: !!AgentSpecificEvolutionConfig,
                CompetitiveIntelligenceEvolution: !!CompetitiveIntelligenceEvolution,
                TemporalEvolutionSystem: !!TemporalEvolutionSystem,
                QuantumEvolutionMasterSystem: !!QuantumEvolutionMasterSystem
            };

            const failedImports = Object.entries(imports)
                .filter(([_, success]) => !success)
                .map(([name]) => name);

            if (failedImports.length > 0) {
                throw new Error(`Failed imports: ${failedImports.join(', ')}`);
            }

            return { importedModules: Object.keys(imports).length, status: 'all_imports_successful' };
        });
    }

    async testQuantumEvolutionSystem() {
        await this.runTest('Quantum Evolution System Initialization', async () => {
            const system = new QuantumEvolutionStrategiesSystem();
            
            // Test basic properties
            const hasRequiredMethods = [
                'evolveAgentPopulation',
                'getPopulationMetrics',
                'optimizeStrategy'
            ].every(method => typeof system[method] === 'function');

            if (!hasRequiredMethods) {
                throw new Error('Missing required methods in QuantumEvolutionStrategiesSystem');
            }

            return { 
                initialized: true, 
                hasRequiredMethods,
                systemType: 'QuantumEvolutionStrategiesSystem'
            };
        });
    }

    async testAgentSpecificConfig() {
        await this.runTest('Agent Specific Evolution Config', async () => {
            const config = new AgentSpecificEvolutionConfig();
            
            // Test configuration retrieval
            const spotterConfig = config.getSpotterEvolutionConfig();
            const analystConfig = config.getAnalystCoordinatorConfig();
            const intelligenceConfig = config.getIntelligenceSpecialistConfig();

            if (!spotterConfig || !analystConfig || !intelligenceConfig) {
                throw new Error('Failed to retrieve agent evolution configurations');
            }

            return {
                spotterAgents: spotterConfig.agents?.length || 0,
                analystAgents: analystConfig.agents?.length || 0,
                intelligenceAgents: intelligenceConfig.agents?.length || 0,
                totalConfigurations: 3
            };
        });
    }

    async testCompetitiveIntelligence() {
        await this.runTest('Competitive Intelligence Evolution', async () => {
            const intelligence = new CompetitiveIntelligenceEvolution();
            
            // Test competitive factor analysis
            const mockMarketData = {
                blockTime: 2000,
                gasPrice: 20000000000,
                competition: 0.7,
                profitability: 0.85
            };

            const analysis = intelligence.analyzeCompetitiveFactors(mockMarketData);
            
            if (!analysis || !analysis.competitive_advantages?.speedOptimization || !analysis.competitive_advantages?.profitValidation) {
                throw new Error('Invalid competitive intelligence analysis');
            }

            return {
                analysisComplete: true,
                speedOptimization: analysis.competitive_advantages.speedOptimization,
                profitValidation: analysis.competitive_advantages.profitValidation,
                competitiveAdvantage: analysis.overallAdvantage
            };
        });
    }

    async testTemporalEvolution() {
        await this.runTest('Temporal Evolution System', async () => {
            const temporal = new TemporalEvolutionSystem();
            
            // Test time-based evolution cycles
            const currentCycle = temporal.getCurrentEvolutionCycle();
            const nextMajorEvolution = temporal.getNextMajorEvolutionTime();
            
            if (!currentCycle || !nextMajorEvolution) {
                throw new Error('Temporal evolution system not properly configured');
            }

            return {
                currentCycle: currentCycle.type,
                cycleDuration: currentCycle.duration,
                nextEvolution: nextMajorEvolution,
                systemActive: true
            };
        });
    }

    async testMasterSystemIntegration() {
        await this.runTest('Master System Integration', async () => {
            const masterSystem = new QuantumEvolutionMasterSystem();
            
            // Test initialization of all subsystems
            const initResult = await masterSystem.initializeAllSystems();
            
            if (!initResult.success) {
                throw new Error(`Master system initialization failed: ${initResult.errors?.join(', ') || 'unknown error'}`);
            }

            return {
                systemsInitialized: initResult.systemsInitialized,
                integrationStatus: 'successful',
                readyForEvolution: true
            };
        });
    }

    async testEvolutionSimulation() {
        await this.runTest('Evolution Simulation (Basic)', async () => {
            const masterSystem = new QuantumEvolutionMasterSystem();
            await masterSystem.initializeAllSystems();
            
            // Run a basic evolution cycle
            const mockAgentMetrics = {
                polygonMicroKing: { profits: 1000, successRate: 0.95, speed: 100 },
                baseSpeedDemon: { profits: 800, successRate: 0.90, speed: 150 },
                arbitrumProfitMaximizer: { profits: 5000, successRate: 0.85, speed: 80 }
            };

            const evolutionResult = await masterSystem.runEvolutionCycle(mockAgentMetrics);
            
            if (!evolutionResult.success) {
                throw new Error(`Evolution simulation failed: ${evolutionResult.error || 'unknown error'}`);
            }

            return {
                evolutionSuccessful: true,
                agentsEvolved: evolutionResult.agentsEvolved,
                performanceImprovement: evolutionResult.avgImprovement,
                newStrategies: evolutionResult.newStrategiesGenerated
            };
        });
    }

    async testSystemStress() {
        if (TEST_CONFIG.skipSlowTests) {
            console.log('⏭️  Skipping stress test (skipSlowTests enabled)');
            return;
        }

        await this.runTest('System Stress Test', async () => {
            const masterSystem = new QuantumEvolutionMasterSystem();
            await masterSystem.initializeAllSystems();
            
            // Run multiple evolution cycles rapidly
            const stressResults = [];
            const stressStartTime = Date.now();
            
            for (let i = 0; i < 5; i++) {
                const mockMetrics = {
                    polygonMicroKing: { 
                        profits: Math.random() * 2000, 
                        successRate: 0.8 + Math.random() * 0.2, 
                        speed: 80 + Math.random() * 40 
                    },
                    baseSpeedDemon: { 
                        profits: Math.random() * 1500, 
                        successRate: 0.85 + Math.random() * 0.15, 
                        speed: 120 + Math.random() * 60 
                    },
                    arbitrumProfitMaximizer: { 
                        profits: Math.random() * 8000, 
                        successRate: 0.75 + Math.random() * 0.25, 
                        speed: 60 + Math.random() * 40 
                    }
                };

                const result = await masterSystem.runEvolutionCycle(mockMetrics);
                stressResults.push(result.success);
                
                if (Date.now() - stressStartTime > TEST_CONFIG.maxTestDuration) {
                    break;
                }
            }

            const successRate = stressResults.filter(r => r).length / stressResults.length;
            
            if (successRate < 0.8) {
                throw new Error(`Stress test failed: ${successRate * 100}% success rate`);
            }

            return {
                cyclesCompleted: stressResults.length,
                successRate,
                avgCycleTime: (Date.now() - stressStartTime) / stressResults.length,
                stressTestPassed: true
            };
        });
    }

    async runAllTests() {
        this.startTime = Date.now();
        
        console.log('\n🚀 Starting Quantum Evolution System Tests...\n');
        
        // Run all tests in sequence
        await this.testImports();
        await this.testQuantumEvolutionSystem();
        await this.testAgentSpecificConfig();
        await this.testCompetitiveIntelligence();
        await this.testTemporalEvolution();
        await this.testMasterSystemIntegration();
        await this.testEvolutionSimulation();
        await this.testSystemStress();
        
        this.printSummary();
    }

    printSummary() {
        const totalDuration = Date.now() - this.startTime;
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        
        console.log('\n' + '='.repeat(60));
        console.log('🧬 QUANTUM EVOLUTION SYSTEM - TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${this.results.length}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⏱️  Total Duration: ${totalDuration}ms`);
        console.log(`🎯 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
        
        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results
                .filter(r => !r.passed)
                .forEach(r => {
                    console.log(`   • ${r.testName}: ${r.error}`);
                });
        }
        
        if (passed === this.results.length) {
            console.log('\n🎉 ALL TESTS PASSED! Quantum Evolution System is ready for deployment!');
            console.log('🚀 System is GO for production arbitrage operations!');
        } else {
            console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
        }
        
        console.log('='.repeat(60));
    }
}

// Export for external use
export { QuantumEvolutionSystemTester, TEST_CONFIG };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tester = new QuantumEvolutionSystemTester();
    tester.runAllTests().catch(console.error);
} 