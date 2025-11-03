/**
 * 🧪 CONSTRUCTION TEST RUNNER - Master Test Execution
 * ===================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Execute all 250+ tests
 * 
 * CAPABILITIES:
 * - Run HOAI compliance tests (200+ cases)
 * - Run integration tests (50+ workflows)
 * - Support synthetic and real test data
 * - Generate comprehensive test reports
 * - Store results in database
 * - Compare synthetic vs real performance
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { HOAIComplianceTestSuite } from './HOAIComplianceTestSuite.js';
import { IntegrationTestSuite } from './IntegrationTestSuite.js';
import { PDFPlanLoader } from './PDFPlanLoader.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ConstructionTestRunner extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = config;
        
        // Test suites
        this.hoaiTests = new HOAIComplianceTestSuite(config);
        this.integrationTests = new IntegrationTestSuite(config);
        
        // Data providers
        this.pdfLoader = new PDFPlanLoader();
        
        // Results
        this.allResults = {
            synthetic: null,
            real: null,
            comparison: null
        };
        
        console.log('🧪 Construction Test Runner initialized');
    }
    
    /**
     * 🚀 RUN ALL TESTS
     */
    async runAllTests(options = {}) {
        console.log('🧪 CONSTRUCTION SYNDICATE - TEST EXECUTION');
        console.log('═══════════════════════════════════════════════════');
        
        const mode = options.mode || 'synthetic';
        const startTime = Date.now();
        
        try {
            // Load test data based on mode
            console.log(`\n📊 Loading test data (mode: ${mode})...`);
            const testData = await this.loadTestData(mode);
            console.log(`   ✅ Loaded ${testData.documents.length} test documents`);
            
            // Initialize test suites
            await this.hoaiTests.initialize();
            await this.integrationTests.initialize();
            
            // Run HOAI compliance tests
            console.log(`\n✅ Running HOAI Compliance Tests...`);
            const hoaiResults = await this.hoaiTests.runAllTests(testData.documents);
            
            // Run integration tests (if services available)
            console.log(`\n🔗 Running Integration Tests...`);
            const integrationResults = await this.integrationTests.runAllTests(
                testData.services || {},
                testData
            );
            
            const duration = Date.now() - startTime;
            
            // Combine results
            const combinedResults = {
                mode,
                hoai: hoaiResults,
                integration: integrationResults,
                summary: {
                    totalTests: hoaiResults.results.total + integrationResults.results.total,
                    totalPassed: hoaiResults.results.passed + integrationResults.results.passed,
                    totalFailed: hoaiResults.results.failed + integrationResults.results.failed,
                    duration,
                    successRate: ((hoaiResults.results.passed + integrationResults.results.passed) / 
                                 (hoaiResults.results.total + integrationResults.results.total) * 100).toFixed(1)
                },
                executedAt: new Date().toISOString()
            };
            
            this.allResults[mode] = combinedResults;
            
            console.log('\n═══════════════════════════════════════════════════');
            console.log('✅ TEST EXECUTION COMPLETE');
            console.log('═══════════════════════════════════════════════════');
            console.log(`   Mode: ${mode}`);
            console.log(`   Total tests: ${combinedResults.summary.totalTests}`);
            console.log(`   Passed: ${combinedResults.summary.totalPassed} (${combinedResults.summary.successRate}%)`);
            console.log(`   Failed: ${combinedResults.summary.totalFailed}`);
            console.log(`   Duration: ${(duration / 1000).toFixed(1)}s`);
            console.log('');
            
            this.emit('testsComplete', combinedResults);
            
            return combinedResults;
            
        } catch (error) {
            console.error('❌ Test execution failed:', error);
            throw error;
        }
    }
    
    /**
     * 📊 LOAD TEST DATA
     */
    async loadTestData(mode) {
        if (mode === 'synthetic') {
            return await this.loadSyntheticData();
        } else if (mode === 'real') {
            return await this.loadRealPlanData();
        } else if (mode === 'mixed') {
            return await this.loadMixedData();
        }
        
        throw new Error(`Invalid test mode: ${mode}`);
    }
    
    /**
     * 🧪 LOAD SYNTHETIC DATA
     */
    async loadSyntheticData() {
        console.log('   📁 Loading synthetic test data...');
        
        const dataDir = path.join(__dirname, 'data/synthetic');
        const files = await fs.readdir(dataDir);
        
        const documents = [];
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const content = await fs.readFile(path.join(dataDir, file), 'utf8');
                const data = JSON.parse(content);
                documents.push(data);
            }
        }
        
        console.log(`      ✅ Loaded ${documents.length} synthetic documents`);
        
        return {
            mode: 'synthetic',
            documents,
            services: null // Services not needed for synthetic tests
        };
    }
    
    /**
     * 🏗️ LOAD REAL PLAN DATA
     */
    async loadRealPlanData() {
        console.log('   📁 Loading REAL plan data...');
        
        await this.pdfLoader.initialize();
        
        // Load all 28 real plans
        const allPlans = await this.pdfLoader.loadAllPlans();
        
        // Convert to test document format
        const documents = allPlans.projects.map(project => ({
            projectMetadata: {
                id: project.projectId,
                name: project.projectName,
                buildingType: project.buildingType
            },
            plans: project.plans.map(p => ({
                id: p.id,
                filename: p.filename,
                path: p.path,
                type: p.type,
                floor: p.floor,
                metadata: p.metadata
            })),
            quantities: {}, // Will be filled by analysis
            hoaiRequirements: {},
            errors: []
        }));
        
        console.log(`      ✅ Loaded ${allPlans.totalPlans} real plans from ${documents.length} projects`);
        
        return {
            mode: 'real',
            documents,
            services: null
        };
    }
    
    /**
     * 🔀 LOAD MIXED DATA
     */
    async loadMixedData() {
        console.log('   📁 Loading mixed test data...');
        
        const synthetic = await this.loadSyntheticData();
        const real = await this.loadRealPlanData();
        
        return {
            mode: 'mixed',
            documents: [...synthetic.documents, ...real.documents],
            services: null
        };
    }
    
    /**
     * 📊 COMPARE RESULTS
     */
    async compareResults(syntheticResults, realResults) {
        console.log('\n📊 Comparing synthetic vs real test results...');
        
        const comparison = {
            synthetic: {
                total: syntheticResults.summary.totalTests,
                passed: syntheticResults.summary.totalPassed,
                successRate: syntheticResults.summary.successRate
            },
            real: {
                total: realResults.summary.totalTests,
                passed: realResults.summary.totalPassed,
                successRate: realResults.summary.successRate
            },
            differences: {
                testCountDelta: realResults.summary.totalTests - syntheticResults.summary.totalTests,
                successRateDelta: parseFloat(realResults.summary.successRate) - parseFloat(syntheticResults.summary.successRate),
                durationDelta: realResults.summary.duration - syntheticResults.summary.duration
            },
            comparedAt: new Date().toISOString()
        };
        
        this.allResults.comparison = comparison;
        
        console.log('   ✅ Comparison complete');
        console.log(`      Success rate delta: ${comparison.differences.successRateDelta.toFixed(1)}%`);
        
        return comparison;
    }
    
    /**
     * 💾 SAVE REPORT
     */
    async saveReport(filename) {
        await fs.writeFile(filename, JSON.stringify(this.allResults, null, 2));
        console.log(`💾 Test report saved to: ${filename}`);
    }
}

export default ConstructionTestRunner;

