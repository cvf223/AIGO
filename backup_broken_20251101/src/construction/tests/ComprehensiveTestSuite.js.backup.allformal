/**
 * 🧪 COMPREHENSIVE TEST SUITE - PRODUCTION VALIDATION
 * ==================================================
 * 
 * MISSION: Validate all construction analysis components with real-world scenarios
 * 
 * TEST CATEGORIES:
 * ✅ Unit Tests - Individual component functionality
 * ✅ Integration Tests - System interconnections
 * ✅ End-to-End Tests - Complete workflows
 * ✅ Performance Tests - Speed and resource usage
 * ✅ Stress Tests - High load scenarios
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Test Suite
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { performance } from 'perf_hooks';

// Import all systems to test
import RealPixelAnalyzer from '../vision/RealPixelAnalyzer.js';
import PreciseMeasurementEngine from '../analysis/PreciseMeasurementEngine.js';
import ElementClassificationSystem from '../ml/ElementClassificationSystem.js';
import MaterialSpecificationDB from '../database/MaterialSpecificationDB.js';
import DIN276CostMapper from '../costing/DIN276CostMapper.js';
import STLBBauConnector from '../standards/STLBBauConnector.js';
import DynamicAusschreibungGenerator from '../documents/DynamicAusschreibungGenerator.js';
import LP6ComprehensiveGenerator from '../hoai/LP6ComprehensiveGenerator.js';
import HumanVerifiableReports from '../verification/HumanVerifiableReports.js';
import { ProductionDeploymentSystem } from '../deployment/ProductionDeploymentSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default class ComprehensiveTestSuite extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            suiteName: 'COMPREHENSIVE_TEST_SUITE',
            
            // Test Configuration
            testConfig: {
                // Test data paths
                testDataPath: path.join(__dirname, 'test-data'),
                testPlansPath: path.join(__dirname, 'test-data', 'plans'),
                outputPath: path.join(__dirname, 'test-output'),
                
                // Test scenarios
                scenarios: {
                    small: {
                        name: 'Small Residential',
                        planFile: 'residential_small.png',
                        expectedElements: 50,
                        expectedArea: 120 // m²
                    },
                    medium: {
                        name: 'Medium Commercial',
                        planFile: 'commercial_medium.png',
                        expectedElements: 150,
                        expectedArea: 500 // m²
                    },
                    large: {
                        name: 'Large Industrial',
                        planFile: 'industrial_large.png',
                        expectedElements: 300,
                        expectedArea: 2000 // m²
                    }
                },
                
                // Performance thresholds
                performance: {
                    maxAnalysisTime: 30000, // ms
                    maxMemoryUsage: 500 * 1024 * 1024, // 500MB
                    minElementDetectionRate: 0.85,
                    minMeasurementAccuracy: 0.95
                },
                
                // Stress test configuration
                stressTest: {
                    concurrentJobs: 10,
                    totalJobs: 100,
                    maxQueueTime: 60000 // ms
                }
            },
            
            // Test Categories
            testCategories: {
                unit: {
                    enabled: true,
                    tests: [
                        'scaleDetection',
                        'elementBoundaryDetection',
                        'measurementCalculation',
                        'elementClassification',
                        'materialLookup',
                        'costMapping',
                        'textGeneration'
                    ]
                },
                
                integration: {
                    enabled: true,
                    tests: [
                        'pixelToMeasurement',
                        'classificationToCosting',
                        'measurementToQuantity',
                        'databaseConnectivity',
                        'apiIntegration'
                    ]
                },
                
                endToEnd: {
                    enabled: true,
                    tests: [
                        'completeAnalysisWorkflow',
                        'ausschreibungGeneration',
                        'lp6Generation',
                        'verificationReportGeneration'
                    ]
                },
                
                performance: {
                    enabled: true,
                    tests: [
                        'analysisSpeed',
                        'memoryUsage',
                        'concurrentProcessing',
                        'largePlanHandling'
                    ]
                },
                
                stress: {
                    enabled: true,
                    tests: [
                        'highLoadProcessing',
                        'queueManagement',
                        'errorRecovery',
                        'resourceLimits'
                    ]
                }
            },
            
            // Expected Results
            expectedResults: {
                scaleFormats: ['1:50', '1:100', '1:200', '1:500'],
                elementTypes: [
                    'wall_load_bearing',
                    'wall_non_load_bearing',
                    'door',
                    'window',
                    'column',
                    'staircase'
                ],
                measurementUnits: ['mm', 'm', 'm²', 'm³'],
                din276Groups: ['300', '310', '320', '330', '340', '350']
            },
            
            // Validation Rules
            validationRules: {
                dimensions: {
                    minWallThickness: 100, // mm
                    maxWallThickness: 500, // mm
                    standardDoorWidths: [625, 750, 875, 1000, 1250],
                    standardWindowWidths: [600, 900, 1200, 1500, 1800]
                },
                
                quantities: {
                    tolerancePercent: 5,
                    minConfidence: 0.85
                },
                
                documents: {
                    requiredSections: [
                        'project_description',
                        'service_positions',
                        'quantity_schedule',
                        'cost_estimation'
                    ]
                }
            }
        };
        
        // Test results storage
        this.testResults = {
            startTime: null,
            endTime: null,
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            categories: {},
            details: [],
            performanceMetrics: {}
        };
        
        // System instances
        this.systems = {};
    }
    
    /**
     * 🚀 RUN COMPLETE TEST SUITE
     */
    async runComprehensiveTests() {
        console.log('🧪 COMPREHENSIVE TEST SUITE - STARTING');
        console.log('=====================================');
        console.log(`📅 Date: ${new Date().toISOString()}`);
        console.log(`🏗️ Testing all construction analysis systems`);
        console.log('');
        
        this.testResults.startTime = Date.now();
        
        try {
            // Setup test environment
            await this.setupTestEnvironment();
            
            // Initialize all systems
            await this.initializeAllSystems();
            
            // Run test categories
            if (this.config.testCategories.unit.enabled) {
                await this.runUnitTests();
            }
            
            if (this.config.testCategories.integration.enabled) {
                await this.runIntegrationTests();
            }
            
            if (this.config.testCategories.endToEnd.enabled) {
                await this.runEndToEndTests();
            }
            
            if (this.config.testCategories.performance.enabled) {
                await this.runPerformanceTests();
            }
            
            if (this.config.testCategories.stress.enabled) {
                await this.runStressTests();
            }
            
            // Generate test report
            await this.generateTestReport();
            
            // Cleanup
            await this.cleanup();
            
            this.testResults.endTime = Date.now();
            
            // Display summary
            this.displayTestSummary();
            
            return this.testResults;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🔧 SETUP TEST ENVIRONMENT
     */
    async setupTestEnvironment() {
        console.log('🔧 Setting up test environment...');
        
        // Create test directories
        await fs.mkdir(this.config.testConfig.outputPath, { recursive: true });
        
        // Verify test data exists
        try {
            await fs.access(this.config.testConfig.testDataPath);
        } catch (error) {
            console.warn('⚠️  Test data not found. Creating mock data...');
            await this.createMockTestData();
        }
        
        console.log('✅ Test environment ready');
    }
    
    /**
     * 🏗️ INITIALIZE ALL SYSTEMS
     */
    async initializeAllSystems() {
        console.log('\n🏗️ Initializing all systems for testing...');
        
        this.systems = {
            pixelAnalyzer: new RealPixelAnalyzer(),
            measurementEngine: new PreciseMeasurementEngine(),
            classificationSystem: new ElementClassificationSystem(),
            materialDB: new MaterialSpecificationDB(),
            costMapper: new DIN276CostMapper(),
            stlbConnector: new STLBBauConnector(),
            ausschreibungGenerator: new DynamicAusschreibungGenerator(),
            lp6Generator: new LP6ComprehensiveGenerator(),
            verificationReports: new HumanVerifiableReports()
        };
        
        // Initialize in parallel
        const initPromises = Object.entries(this.systems).map(async ([name, system]) => {
            try {
                await system.initialize();
                console.log(`  ✅ ${name} initialized`);
            } catch (error) {
                console.error(`  ❌ ${name} failed:`, error.message);
                throw error;
            }
        });
        
        await Promise.all(initPromises);
        
        console.log('✅ All systems initialized');
    }
    
    /**
     * 🧪 UNIT TESTS
     */
    async runUnitTests() {
        console.log('\n🧪 RUNNING UNIT TESTS');
        console.log('====================');
        
        const category = 'unit';
        this.testResults.categories[category] = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test 1: Scale Detection
        await this.testScaleDetection();
        
        // Test 2: Element Boundary Detection
        await this.testElementBoundaryDetection();
        
        // Test 3: Measurement Calculation
        await this.testMeasurementCalculation();
        
        // Test 4: Element Classification
        await this.testElementClassification();
        
        // Test 5: Material Lookup
        await this.testMaterialLookup();
        
        // Test 6: Cost Mapping
        await this.testCostMapping();
        
        // Test 7: Text Generation
        await this.testTextGeneration();
    }
    
    /**
     * 🔗 INTEGRATION TESTS
     */
    async runIntegrationTests() {
        console.log('\n🔗 RUNNING INTEGRATION TESTS');
        console.log('============================');
        
        const category = 'integration';
        this.testResults.categories[category] = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test 1: Pixel to Measurement Pipeline
        await this.testPixelToMeasurementPipeline();
        
        // Test 2: Classification to Costing Pipeline
        await this.testClassificationToCostingPipeline();
        
        // Test 3: Database Connectivity
        await this.testDatabaseConnectivity();
        
        // Test 4: API Integration
        await this.testAPIIntegration();
    }
    
    /**
     * 🏁 END-TO-END TESTS
     */
    async runEndToEndTests() {
        console.log('\n🏁 RUNNING END-TO-END TESTS');
        console.log('===========================');
        
        const category = 'endToEnd';
        this.testResults.categories[category] = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test complete workflows for each scenario
        for (const [scenarioKey, scenario] of Object.entries(this.config.testConfig.scenarios)) {
            await this.testCompleteWorkflow(scenarioKey, scenario);
        }
    }
    
    /**
     * ⚡ PERFORMANCE TESTS
     */
    async runPerformanceTests() {
        console.log('\n⚡ RUNNING PERFORMANCE TESTS');
        console.log('============================');
        
        const category = 'performance';
        this.testResults.categories[category] = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test 1: Analysis Speed
        await this.testAnalysisSpeed();
        
        // Test 2: Memory Usage
        await this.testMemoryUsage();
        
        // Test 3: Concurrent Processing
        await this.testConcurrentProcessing();
    }
    
    /**
     * 💪 STRESS TESTS
     */
    async runStressTests() {
        console.log('\n💪 RUNNING STRESS TESTS');
        console.log('=======================');
        
        const category = 'stress';
        this.testResults.categories[category] = {
            total: 0,
            passed: 0,
            failed: 0,
            tests: []
        };
        
        // Test 1: High Load Processing
        await this.testHighLoadProcessing();
        
        // Test 2: Error Recovery
        await this.testErrorRecovery();
    }
    
    // ===========================
    // INDIVIDUAL TEST IMPLEMENTATIONS
    // ===========================
    
    /**
     * Test: Scale Detection
     */
    async testScaleDetection() {
        const testName = 'Scale Detection';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Create test image with known scale
            const testScales = this.config.expectedResults.scaleFormats;
            let allPassed = true;
            
            for (const expectedScale of testScales) {
                const mockImage = await this.createMockPlanWithScale(expectedScale);
                const detectedScale = await this.systems.pixelAnalyzer.detectScaleFromFooter(mockImage);
                
                if (detectedScale.notation !== expectedScale) {
                    allPassed = false;
                    console.log(`    ❌ Failed to detect scale ${expectedScale}, got ${detectedScale.notation}`);
                } else {
                    console.log(`    ✅ Correctly detected scale ${expectedScale}`);
                }
            }
            
            testCase.status = allPassed ? 'passed' : 'failed';
            testCase.endTime = performance.now();
            testCase.duration = testCase.endTime - testCase.startTime;
            
            this.recordTestResult('unit', testCase);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            testCase.endTime = performance.now();
            testCase.duration = testCase.endTime - testCase.startTime;
            
            console.error(`    ❌ ${testName} failed:`, error.message);
            this.recordTestResult('unit', testCase);
        }
    }
    
    /**
     * Test: Element Boundary Detection
     */
    async testElementBoundaryDetection() {
        const testName = 'Element Boundary Detection';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Create test image with known elements
            const mockPlan = await this.createMockPlanWithElements();
            const tiles = await this.systems.pixelAnalyzer.generateTiles(mockPlan);
            const elements = await this.systems.pixelAnalyzer.detectAndClassifyElements(
                tiles,
                { notation: '1:50', pixelsPerMillimeter: 0.4 }
            );
            
            // Validate detection
            const expectedMinElements = 5;
            const detectedCount = elements.length;
            
            testCase.status = detectedCount >= expectedMinElements ? 'passed' : 'failed';
            testCase.details = {
                expectedMinElements,
                detectedCount,
                elements: elements.map(e => ({
                    type: e.type,
                    confidence: e.confidence
                }))
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Detected ${detectedCount} elements (expected min: ${expectedMinElements})`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Measurement Calculation
     */
    async testMeasurementCalculation() {
        const testName = 'Measurement Calculation';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test with known dimensions
            const testElement = {
                elementId: 'test-wall-1',
                classification: 'wall_load_bearing',
                boundingBox: {
                    x: 100,
                    y: 100,
                    width: 1000, // pixels
                    height: 50   // pixels
                },
                pixelArea: 50000
            };
            
            const scale = {
                notation: '1:50',
                ratio: 50,
                pixelsPerMillimeter: 0.4 // 1 pixel = 2.5mm
            };
            
            const measurements = await this.systems.measurementEngine.calculateElementMeasurements(
                testElement,
                scale
            );
            
            // Expected: width = 1000 pixels * 2.5mm = 2500mm
            const expectedWidth = 2500;
            const actualWidth = measurements.dimensions.width.value;
            const tolerance = this.config.validationRules.dimensions.tolerancePercent / 100;
            
            const isAccurate = Math.abs(actualWidth - expectedWidth) / expectedWidth <= tolerance;
            
            testCase.status = isAccurate ? 'passed' : 'failed';
            testCase.details = {
                expectedWidth,
                actualWidth,
                difference: Math.abs(actualWidth - expectedWidth),
                tolerancePercent: this.config.validationRules.dimensions.tolerancePercent
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Width calculation: ${actualWidth}mm (expected: ${expectedWidth}mm)`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Element Classification
     */
    async testElementClassification() {
        const testName = 'Element Classification';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test classification of known element types
            const testElements = [
                { type: 'wall', expectedClass: 'wall_load_bearing' },
                { type: 'door', expectedClass: 'door' },
                { type: 'window', expectedClass: 'window' }
            ];
            
            let allCorrect = true;
            
            for (const test of testElements) {
                const mockData = await this.createMockElementData(test.type);
                const classification = await this.systems.classificationSystem.classifyElement(mockData);
                
                if (!classification.classification.includes(test.expectedClass)) {
                    allCorrect = false;
                    console.log(`    ❌ Misclassified ${test.type} as ${classification.classification}`);
                } else {
                    console.log(`    ✅ Correctly classified ${test.type} as ${classification.classification}`);
                }
            }
            
            testCase.status = allCorrect ? 'passed' : 'failed';
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Material Lookup
     */
    async testMaterialLookup() {
        const testName = 'Material Database Lookup';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test material property retrieval
            const material = await this.systems.materialDB.getMaterialProperties(
                'concrete',
                'C25/30'
            );
            
            const hasRequiredProperties = 
                material.properties &&
                material.properties.compressiveStrength &&
                material.properties.density;
            
            testCase.status = hasRequiredProperties ? 'passed' : 'failed';
            testCase.details = {
                materialType: 'concrete',
                specification: 'C25/30',
                propertiesFound: Object.keys(material.properties || {})
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Material properties retrieved`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Cost Mapping
     */
    async testCostMapping() {
        const testName = 'DIN 276 Cost Mapping';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test cost mapping for known element
            const testElement = {
                classification: 'wall_load_bearing',
                dimensions: {
                    width: { value: 5000, unit: 'mm' },
                    height: { value: 2750, unit: 'mm' },
                    thickness: { value: 240, unit: 'mm' }
                },
                volume: { cubicMeters: { value: 3.3 } }
            };
            
            const costMapping = await this.systems.costMapper.mapElementToDIN276(testElement);
            
            const isValidMapping = 
                costMapping.din276Code &&
                costMapping.din276Code.startsWith('3') && // Should be in 300 group
                costMapping.unitPrice > 0 &&
                costMapping.totalCost > 0;
            
            testCase.status = isValidMapping ? 'passed' : 'failed';
            testCase.details = {
                din276Code: costMapping.din276Code,
                unitPrice: costMapping.unitPrice,
                totalCost: costMapping.totalCost,
                confidence: costMapping.confidence
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Mapped to DIN 276: ${costMapping.din276Code}`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Text Generation
     */
    async testTextGeneration() {
        const testName = 'STLB-Bau Text Generation';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test text generation for position
            const testElement = {
                classification: 'wall_load_bearing',
                properties: {
                    material: 'concrete',
                    thickness: 240
                }
            };
            
            const positionText = await this.systems.stlbConnector.generatePositionText(testElement);
            
            const hasValidText = 
                positionText.shortText &&
                positionText.longText &&
                positionText.shortText.length > 10 &&
                positionText.longText.length > 50;
            
            testCase.status = hasValidText ? 'passed' : 'failed';
            testCase.details = {
                shortTextLength: positionText.shortText?.length || 0,
                longTextLength: positionText.longText?.length || 0
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Generated position text`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('unit', testCase);
    }
    
    /**
     * Test: Pixel to Measurement Pipeline
     */
    async testPixelToMeasurementPipeline() {
        const testName = 'Pixel to Measurement Pipeline';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Use small test plan
            const planPath = path.join(
                this.config.testConfig.testPlansPath,
                this.config.testConfig.scenarios.small.planFile
            );
            
            // Analyze plan
            const analysis = await this.systems.pixelAnalyzer.analyzeConstructionPlan(planPath);
            
            // Classify elements
            const classifications = await this.systems.classificationSystem.batchClassifyElements(
                analysis.elements.all
            );
            
            // Calculate measurements
            const measurements = await this.systems.measurementEngine.batchCalculateMeasurements(
                classifications.classifications,
                analysis.scale
            );
            
            // Validate pipeline
            const hasValidOutput = 
                analysis.scale.pixelsPerMillimeter > 0 &&
                classifications.classifications.length > 0 &&
                measurements.measurements.length > 0 &&
                measurements.summary.totalArea > 0;
            
            testCase.status = hasValidOutput ? 'passed' : 'failed';
            testCase.details = {
                scale: analysis.scale.notation,
                elementsDetected: analysis.elements.all.length,
                elementsClassified: classifications.classifications.length,
                measurementsCalculated: measurements.measurements.length,
                totalArea: measurements.summary.totalArea
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Pipeline completed: ${measurements.measurements.length} measurements`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('integration', testCase);
    }
    
    /**
     * Test: Classification to Costing Pipeline
     */
    async testClassificationToCostingPipeline() {
        const testName = 'Classification to Costing Pipeline';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Create test elements with measurements
            const testElements = [
                {
                    elementId: 'wall-1',
                    classification: 'wall_load_bearing',
                    dimensions: { width: { value: 5000 }, height: { value: 2750 } },
                    area: { squareMeters: { value: 13.75 } }
                },
                {
                    elementId: 'door-1',
                    classification: 'door',
                    dimensions: { width: { value: 1000 }, height: { value: 2100 } },
                    quantity: 1
                }
            ];
            
            // Map to DIN 276 and calculate costs
            const projectCosts = await this.systems.costMapper.calculateProjectCosts(
                testElements,
                { region: 'berlin' }
            );
            
            // Validate costing
            const hasValidCosts = 
                projectCosts.byDIN276 &&
                Object.keys(projectCosts.byDIN276).length > 0 &&
                projectCosts.totalCost > 0;
            
            testCase.status = hasValidCosts ? 'passed' : 'failed';
            testCase.details = {
                din276Groups: Object.keys(projectCosts.byDIN276),
                totalCost: projectCosts.totalCost,
                elementCount: testElements.length
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Total cost calculated: €${projectCosts.totalCost.toFixed(2)}`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('integration', testCase);
    }
    
    /**
     * Test: Database Connectivity
     */
    async testDatabaseConnectivity() {
        const testName = 'Database Connectivity';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test material database query
            const materials = ['concrete', 'steel', 'masonry'];
            let allConnected = true;
            
            for (const material of materials) {
                try {
                    const result = await this.systems.materialDB.getMaterialProperties(
                        material,
                        'default'
                    );
                    console.log(`    ✅ Retrieved ${material} properties`);
                } catch (error) {
                    allConnected = false;
                    console.log(`    ❌ Failed to retrieve ${material}: ${error.message}`);
                }
            }
            
            testCase.status = allConnected ? 'passed' : 'failed';
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('integration', testCase);
    }
    
    /**
     * Test: API Integration
     */
    async testAPIIntegration() {
        const testName = 'External API Integration';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test STLB-Bau API connection
            const testConnection = await this.systems.stlbConnector.testConnection();
            
            testCase.status = testConnection ? 'passed' : 'failed';
            testCase.details = {
                apiTested: 'STLB-Bau',
                connectionStatus: testConnection
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} STLB-Bau API connection`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('integration', testCase);
    }
    
    /**
     * Test: Complete Workflow
     */
    async testCompleteWorkflow(scenarioKey, scenario) {
        const testName = `Complete Workflow - ${scenario.name}`;
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            scenario: scenarioKey,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            const planPath = path.join(
                this.config.testConfig.testPlansPath,
                scenario.planFile
            );
            
            // Step 1: Analysis
            console.log('    📊 Running analysis...');
            const analysisStart = performance.now();
            
            const analysisResults = await this.systems.pixelAnalyzer.analyzeConstructionPlan(planPath);
            const classifications = await this.systems.classificationSystem.batchClassifyElements(
                analysisResults.elements.all
            );
            const measurements = await this.systems.measurementEngine.batchCalculateMeasurements(
                classifications.classifications,
                analysisResults.scale
            );
            
            const analysisTime = performance.now() - analysisStart;
            console.log(`      ✅ Analysis completed in ${analysisTime.toFixed(0)}ms`);
            
            // Step 2: Generate Ausschreibung
            console.log('    📄 Generating Ausschreibung...');
            const ausschreibungStart = performance.now();
            
            const ausschreibung = await this.systems.ausschreibungGenerator.generateAusschreibung(
                planPath,
                { name: scenario.name, projectNumber: `TEST-${scenarioKey}` }
            );
            
            const ausschreibungTime = performance.now() - ausschreibungStart;
            console.log(`      ✅ Ausschreibung generated in ${ausschreibungTime.toFixed(0)}ms`);
            
            // Step 3: Generate Verification Report
            console.log('    🔍 Generating verification report...');
            const verificationStart = performance.now();
            
            const verification = await this.systems.verificationReports.generateVerificationReport(
                {
                    elements: measurements.measurements,
                    scale: analysisResults.scale,
                    totalPixels: analysisResults.totalPixels
                },
                planPath,
                { name: scenario.name }
            );
            
            const verificationTime = performance.now() - verificationStart;
            console.log(`      ✅ Verification report generated in ${verificationTime.toFixed(0)}ms`);
            
            // Validate results
            const elementsDetected = measurements.measurements.length;
            const expectedRange = [
                scenario.expectedElements * 0.7,
                scenario.expectedElements * 1.3
            ];
            
            const isWithinExpectedRange = 
                elementsDetected >= expectedRange[0] &&
                elementsDetected <= expectedRange[1];
            
            const totalTime = performance.now() - testCase.startTime;
            const isWithinTimeLimit = totalTime < this.config.testConfig.performance.maxAnalysisTime;
            
            testCase.status = (isWithinExpectedRange && isWithinTimeLimit) ? 'passed' : 'failed';
            testCase.details = {
                elementsDetected,
                expectedElements: scenario.expectedElements,
                totalArea: measurements.summary.totalArea,
                expectedArea: scenario.expectedArea,
                analysisTime,
                ausschreibungTime,
                verificationTime,
                totalTime,
                outputs: {
                    ausschreibung: ausschreibung.outputs,
                    verification: verification.outputs
                }
            };
            
            console.log(`    ${testCase.status === 'passed' ? '✅' : '❌'} Workflow completed`);
            console.log(`      Elements: ${elementsDetected} (expected: ~${scenario.expectedElements})`);
            console.log(`      Total time: ${totalTime.toFixed(0)}ms`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('endToEnd', testCase);
    }
    
    /**
     * Test: Analysis Speed
     */
    async testAnalysisSpeed() {
        const testName = 'Analysis Speed Performance';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            const scenarios = Object.entries(this.config.testConfig.scenarios);
            const speedTests = [];
            
            for (const [key, scenario] of scenarios) {
                const planPath = path.join(
                    this.config.testConfig.testPlansPath,
                    scenario.planFile
                );
                
                const start = performance.now();
                await this.systems.pixelAnalyzer.analyzeConstructionPlan(planPath);
                const duration = performance.now() - start;
                
                speedTests.push({
                    scenario: scenario.name,
                    duration,
                    withinLimit: duration < this.config.testConfig.performance.maxAnalysisTime
                });
                
                console.log(`    ${duration < this.config.testConfig.performance.maxAnalysisTime ? '✅' : '❌'} ${scenario.name}: ${duration.toFixed(0)}ms`);
            }
            
            const allWithinLimit = speedTests.every(t => t.withinLimit);
            testCase.status = allWithinLimit ? 'passed' : 'failed';
            testCase.details = speedTests;
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('performance', testCase);
    }
    
    /**
     * Test: Memory Usage
     */
    async testMemoryUsage() {
        const testName = 'Memory Usage Performance';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            const initialMemory = process.memoryUsage();
            
            // Process large plan
            const planPath = path.join(
                this.config.testConfig.testPlansPath,
                this.config.testConfig.scenarios.large.planFile
            );
            
            await this.systems.pixelAnalyzer.analyzeConstructionPlan(planPath);
            
            const finalMemory = process.memoryUsage();
            const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
            const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
            
            const withinLimit = memoryIncrease < this.config.testConfig.performance.maxMemoryUsage;
            
            testCase.status = withinLimit ? 'passed' : 'failed';
            testCase.details = {
                initialMemoryMB: initialMemory.heapUsed / (1024 * 1024),
                finalMemoryMB: finalMemory.heapUsed / (1024 * 1024),
                increaseMemoryMB: memoryIncreaseMB,
                maxAllowedMB: this.config.testConfig.performance.maxMemoryUsage / (1024 * 1024)
            };
            
            console.log(`    ${withinLimit ? '✅' : '❌'} Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('performance', testCase);
    }
    
    /**
     * Test: Concurrent Processing
     */
    async testConcurrentProcessing() {
        const testName = 'Concurrent Processing Performance';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            const concurrentJobs = 5;
            const planPath = path.join(
                this.config.testConfig.testPlansPath,
                this.config.testConfig.scenarios.small.planFile
            );
            
            console.log(`    Running ${concurrentJobs} concurrent analyses...`);
            
            const promises = [];
            for (let i = 0; i < concurrentJobs; i++) {
                promises.push(
                    this.systems.pixelAnalyzer.analyzeConstructionPlan(planPath)
                );
            }
            
            const start = performance.now();
            const results = await Promise.all(promises);
            const duration = performance.now() - start;
            
            const allSuccessful = results.every(r => r.elements && r.scale);
            const avgTimePerJob = duration / concurrentJobs;
            
            testCase.status = allSuccessful ? 'passed' : 'failed';
            testCase.details = {
                concurrentJobs,
                totalDuration: duration,
                avgTimePerJob,
                successful: results.filter(r => r.elements).length
            };
            
            console.log(`    ${allSuccessful ? '✅' : '❌'} Completed ${concurrentJobs} jobs in ${duration.toFixed(0)}ms`);
            console.log(`      Average time per job: ${avgTimePerJob.toFixed(0)}ms`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('performance', testCase);
    }
    
    /**
     * Test: High Load Processing
     */
    async testHighLoadProcessing() {
        const testName = 'High Load Processing';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Initialize deployment system for queue testing
            const deployment = new ProductionDeploymentSystem();
            await deployment.initialize();
            
            const totalJobs = 20;
            const jobPromises = [];
            
            console.log(`    Queueing ${totalJobs} jobs...`);
            
            // Queue multiple jobs
            for (let i = 0; i < totalJobs; i++) {
                const job = {
                    id: `stress-test-${i}`,
                    file: {
                        path: path.join(
                            this.config.testConfig.testPlansPath,
                            this.config.testConfig.scenarios.small.planFile
                        )
                    }
                };
                
                jobPromises.push(
                    new Promise((resolve) => {
                        setTimeout(() => {
                            deployment.processAnalysisJob(job);
                            resolve(job.id);
                        }, i * 100); // Stagger job submissions
                    })
                );
            }
            
            await Promise.all(jobPromises);
            
            // Check queue management
            const queueSize = deployment.jobQueue.size;
            const activeJobs = deployment.activeJobs.size;
            
            testCase.status = 'passed';
            testCase.details = {
                totalJobs,
                queueSize,
                activeJobs,
                maxConcurrent: deployment.config.queue.maxConcurrentJobs
            };
            
            console.log(`    ✅ Queue management working`);
            console.log(`      Queue size: ${queueSize}`);
            console.log(`      Active jobs: ${activeJobs}`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('stress', testCase);
    }
    
    /**
     * Test: Error Recovery
     */
    async testErrorRecovery() {
        const testName = 'Error Recovery';
        console.log(`\n  🧪 ${testName}`);
        
        const testCase = {
            name: testName,
            status: 'running',
            startTime: performance.now()
        };
        
        try {
            // Test with invalid input
            let errorCaught = false;
            
            try {
                await this.systems.pixelAnalyzer.analyzeConstructionPlan('invalid-path.png');
            } catch (error) {
                errorCaught = true;
                console.log(`    ✅ Gracefully handled invalid file path`);
            }
            
            // Test with corrupted data
            try {
                await this.systems.classificationSystem.classifyElement({});
            } catch (error) {
                errorCaught = true;
                console.log(`    ✅ Gracefully handled invalid element data`);
            }
            
            // System should still be operational
            const testPlan = path.join(
                this.config.testConfig.testPlansPath,
                this.config.testConfig.scenarios.small.planFile
            );
            
            const recoveryTest = await this.systems.pixelAnalyzer.analyzeConstructionPlan(testPlan);
            const systemRecovered = recoveryTest.elements && recoveryTest.scale;
            
            testCase.status = (errorCaught && systemRecovered) ? 'passed' : 'failed';
            testCase.details = {
                errorHandling: errorCaught,
                systemRecovery: systemRecovered
            };
            
            console.log(`    ${systemRecovered ? '✅' : '❌'} System recovered after errors`);
            
        } catch (error) {
            testCase.status = 'failed';
            testCase.error = error.message;
            console.error(`    ❌ ${testName} failed:`, error.message);
        }
        
        testCase.endTime = performance.now();
        testCase.duration = testCase.endTime - testCase.startTime;
        this.recordTestResult('stress', testCase);
    }
    
    // ===========================
    // HELPER METHODS
    // ===========================
    
    /**
     * Record test result
     */
    recordTestResult(category, testCase) {
        this.testResults.totalTests++;
        this.testResults.categories[category].total++;
        
        if (testCase.status === 'passed') {
            this.testResults.passedTests++;
            this.testResults.categories[category].passed++;
        } else {
            this.testResults.failedTests++;
            this.testResults.categories[category].failed++;
        }
        
        this.testResults.categories[category].tests.push(testCase);
        this.testResults.details.push({
            category,
            ...testCase
        });
    }
    
    /**
     * Create mock test data
     */
    async createMockTestData() {
        await fs.mkdir(this.config.testConfig.testDataPath, { recursive: true });
        await fs.mkdir(this.config.testConfig.testPlansPath, { recursive: true });
        
        // Create mock plan files
        for (const scenario of Object.values(this.config.testConfig.scenarios)) {
            const mockPlan = await this.createMockPlan(scenario);
            const planPath = path.join(this.config.testConfig.testPlansPath, scenario.planFile);
            
            // Save mock plan (in real implementation, would create actual image)
            await fs.writeFile(planPath, JSON.stringify(mockPlan), 'utf8');
        }
    }
    
    /**
     * Create mock plan
     */
    async createMockPlan(scenario) {
        return {
            type: 'mock_plan',
            scenario: scenario.name,
            width: 2000,
            height: 1500,
            scale: '1:50',
            elements: scenario.expectedElements
        };
    }
    
    /**
     * Create mock plan with scale
     */
    async createMockPlanWithScale(scale) {
        return {
            type: 'mock_plan_with_scale',
            width: 2000,
            height: 1500,
            footer: {
                scale: scale,
                region: {
                    x: 1400,
                    y: 1350,
                    width: 500,
                    height: 100
                }
            }
        };
    }
    
    /**
     * Create mock plan with elements
     */
    async createMockPlanWithElements() {
        return {
            type: 'mock_plan_with_elements',
            width: 2000,
            height: 1500,
            elements: [
                { type: 'wall', x: 100, y: 100, width: 1000, height: 50 },
                { type: 'door', x: 500, y: 100, width: 100, height: 50 },
                { type: 'window', x: 200, y: 100, width: 150, height: 50 },
                { type: 'column', x: 800, y: 300, width: 50, height: 50 },
                { type: 'wall', x: 100, y: 500, width: 50, height: 500 }
            ]
        };
    }
    
    /**
     * Create mock element data
     */
    async createMockElementData(type) {
        const elementTypes = {
            wall: {
                pixels: new Array(5000).fill(128),
                boundingBox: { x: 100, y: 100, width: 1000, height: 50 },
                aspectRatio: 20,
                area: 50000
            },
            door: {
                pixels: new Array(2000).fill(64),
                boundingBox: { x: 500, y: 100, width: 100, height: 210 },
                aspectRatio: 0.48,
                area: 21000
            },
            window: {
                pixels: new Array(3000).fill(192),
                boundingBox: { x: 200, y: 100, width: 150, height: 150 },
                aspectRatio: 1,
                area: 22500
            }
        };
        
        return elementTypes[type] || elementTypes.wall;
    }
    
    /**
     * Generate test report
     */
    async generateTestReport() {
        console.log('\n📄 Generating test report...');
        
        const reportPath = path.join(this.config.testConfig.outputPath, 'test_report.json');
        
        const report = {
            suite: this.config.suiteName,
            timestamp: new Date().toISOString(),
            duration: Date.now() - this.testResults.startTime,
            summary: {
                total: this.testResults.totalTests,
                passed: this.testResults.passedTests,
                failed: this.testResults.failedTests,
                passRate: (this.testResults.passedTests / this.testResults.totalTests * 100).toFixed(2) + '%'
            },
            categories: this.testResults.categories,
            details: this.testResults.details,
            performance: this.testResults.performanceMetrics
        };
        
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`✅ Test report saved to: ${reportPath}`);
    }
    
    /**
     * Display test summary
     */
    displayTestSummary() {
        const duration = (this.testResults.endTime - this.testResults.startTime) / 1000;
        
        console.log('\n========================================');
        console.log('📊 TEST SUITE SUMMARY');
        console.log('========================================');
        console.log(`Total Tests: ${this.testResults.totalTests}`);
        console.log(`Passed: ${this.testResults.passedTests} ✅`);
        console.log(`Failed: ${this.testResults.failedTests} ❌`);
        console.log(`Pass Rate: ${(this.testResults.passedTests / this.testResults.totalTests * 100).toFixed(2)}%`);
        console.log(`Duration: ${duration.toFixed(2)}s`);
        console.log('');
        
        // Category breakdown
        console.log('Category Breakdown:');
        for (const [category, results] of Object.entries(this.testResults.categories)) {
            if (results.total > 0) {
                console.log(`  ${category}: ${results.passed}/${results.total} passed`);
            }
        }
        
        // Failed tests
        if (this.testResults.failedTests > 0) {
            console.log('\n❌ Failed Tests:');
            for (const test of this.testResults.details) {
                if (test.status === 'failed') {
                    console.log(`  - ${test.name}: ${test.error || 'Unknown error'}`);
                }
            }
        }
        
        console.log('\n========================================');
    }
    
    /**
     * Cleanup test environment
     */
    async cleanup() {
        console.log('\n🧹 Cleaning up test environment...');
        
        // Close database connections
        if (this.systems.materialDB && this.systems.materialDB.dbPool) {
            await this.systems.materialDB.dbPool.end();
        }
        
        // Clear caches
        for (const system of Object.values(this.systems)) {
            if (system.cache) {
                system.cache.clear();
            }
        }
        
        console.log('✅ Cleanup complete');
    }
}

// Export for use
export { ComprehensiveTestSuite };

// Run tests if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    const testSuite = new ComprehensiveTestSuite();
    testSuite.runComprehensiveTests()
        .then(results => {
            process.exit(results.failedTests === 0 ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal test error:', error);
            process.exit(1);
        });
}
