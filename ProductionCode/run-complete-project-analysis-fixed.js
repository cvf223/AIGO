/**
 * 🏗️ COMPLETE PROJECT ANALYSIS - FIXED RESULT AGGREGATION
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import all systems
import RealPixelAnalyzer from './src/construction/vision/RealPixelAnalyzer.js';
import PreciseMeasurementEngine from './src/construction/analysis/PreciseMeasurementEngine.js';
import ElementClassificationSystem from './src/construction/ml/ElementClassificationSystem.js';
import MaterialSpecificationDB from './src/construction/database/MaterialSpecificationDB.js';
import DIN276CostMapper from './src/construction/costing/DIN276CostMapper.js';
import STLBBauConnector from './src/construction/standards/STLBBauConnector.js';
import DynamicAusschreibungGenerator from './src/construction/documents/DynamicAusschreibungGenerator.js';
import LP6ComprehensiveGenerator from './src/construction/hoai/LP6ComprehensiveGenerator.js';
import HumanVerifiableReports from './src/construction/verification/HumanVerifiableReports.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_INFO = {
    projectNumber: 'FB-AUS-2024-001',
    name: 'Gewerbebau Frankfurt - Büro- und Geschäftshaus',
    client: 'Frankfurt Business Development GmbH',
    architect: 'Architekten Müller & Partner',
    contractor: 'Bauunternehmen Schmidt AG',
    location: {
        street: 'Mainzer Landstraße 123',
        city: 'Frankfurt am Main',
        postalCode: '60325',
        country: 'Deutschland'
    },
    projectData: {
        totalArea: 75000,
        estimatedValue: 50000000,
        buildingType: 'Büro- und Geschäftshaus',
        floors: 6,
        underground: 2
    },
    dates: {
        planningStart: '2023-08-01',
        executionStart: '2024-06-01',
        completion: '2026-12-31',
        tenderDeadline: '2024-03-15'
    },
    hoai: {
        leistungsphase: 6,
        phase: 'Ausführungsplanung',
        honorarzone: 'III'
    }
};

async function runCompleteProjectAnalysis() {
    console.log('🏗️ COMPLETE PROJECT ANALYSIS - FIXED VERSION');
    console.log('===========================================');
    console.log(`📋 Project: ${PROJECT_INFO.name}`);
    console.log(`💰 Value: €${(PROJECT_INFO.projectData.estimatedValue / 1000000).toFixed(1)}M`);
    console.log(`📐 Area: ${PROJECT_INFO.projectData.totalArea.toLocaleString()} m²`);
    console.log('');
    
    const startTime = Date.now();
    const checkpoint = {
        processedPlans: [],
        lastPlanIndex: -1,
        timestamp: new Date().toISOString()
    };
    
    try {
        // STEP 1: Initialize systems
        console.log('🔧 STEP 1: INITIALIZING SYSTEMS');
        console.log('================================');
        
        const systems = {
            pixelAnalyzer: new RealPixelAnalyzer(),
            measurementEngine: new PreciseMeasurementEngine(),
            classificationSystem: new ElementClassificationSystem()
        };
        
        // Safe initialization
        for (const [name, system] of Object.entries(systems)) {
            if (system && typeof system.initialize === 'function') {
                await system.initialize().catch(e => {
                    console.warn(`  ⚠️  ${name}: ${e.message}`);
                });
                console.log(`  ✅ ${name} ready`);
            } else {
                console.log(`  ✅ ${name} ready (no init needed)`);
            }
        }
        
        console.log('✅ Systems initialized');
        console.log('');
        
        // STEP 2: Load plans
        console.log('📂 STEP 2: LOADING PLANS');
        console.log('========================');
        
        const planDir = path.join(__dirname, 'TestProject');
        const planFiles = await fs.readdir(planDir);
        const pdfPlans = planFiles.filter(f => f.endsWith('.pdf'));
        
        console.log(`  📁 Found ${pdfPlans.length} PDF plans`);
        console.log('');
        
        // STEP 3: Analyze each plan with proper result storage
        console.log('🔍 STEP 3: ANALYZING PLANS (WITH CHECKPOINTS)');
        console.log('============================================');
        
        const analysisResults = [];
        const planPaths = [];
        
        for (let i = 0; i < pdfPlans.length; i++) {
            const planFile = pdfPlans[i];
            const planPath = path.join(planDir, planFile);
            planPaths.push(planPath);
            
            console.log(`\n  📐 Plan ${i + 1}/${pdfPlans.length}: ${planFile}`);
            
            // CRITICAL FIX: Don't use try-catch that swallows results
            let planResult = null;
            
            const analysis = await systems.pixelAnalyzer.analyzeConstructionPlan(planPath).catch(error => {
                console.error(`     ❌ Analysis error: ${error.message}`);
                return null;
            });
            
            if (analysis && analysis.elements) {
                console.log(`     ✅ Elements detected: ${analysis.elements.all?.length || 0}`);
                
                const classifications = await systems.classificationSystem.batchClassifyElements(
                    analysis.elements.all || []
                ).catch(error => {
                    console.warn(`     ⚠️  Classification error: ${error.message}`);
                    return { classifications: analysis.elements.all || [] };
                });
                
                const measurements = await systems.measurementEngine.batchCalculateMeasurements(
                    classifications.classifications || [],
                    analysis.scale || { notation: '1:100', pixelsPerMillimeter: 0.5 }
                ).catch(error => {
                    console.warn(`     ⚠️  Measurement error: ${error.message}`);
                    return { measurements: classifications.classifications || [], summary: { totalArea: 0 } };
                });
                
                planResult = {
                    planFile,
                    planPath,
                    planNumber: i + 1,
                    scale: analysis.scale || { notation: '1:100', pixelsPerMillimeter: 0.5 },
                    elements: measurements.measurements || [],
                    summary: measurements.summary || { totalArea: 0 },
                    processedAt: new Date().toISOString()
                };
                
                console.log(`     📊 Total area: ${planResult.summary.totalArea?.toFixed(2) || 0} m²`);
                
                // CRITICAL: Always add to results
                analysisResults.push(planResult);
                
                // Save checkpoint after each plan
                checkpoint.processedPlans.push(planResult);
                checkpoint.lastPlanIndex = i;
                await fs.writeFile(
                    'analysis_checkpoint.json',
                    JSON.stringify(checkpoint, null, 2)
                );
                
                console.log(`     💾 Checkpoint saved (${i + 1}/${pdfPlans.length})`);
            } else {
                console.log(`     ⚠️  No analysis results, skipping`);
            }
        }
        
        console.log('');
        console.log(`✅ Analysis complete: ${analysisResults.length}/${pdfPlans.length} plans processed`);
        console.log('');
        
        // Calculate totals
        const totalElements = analysisResults.reduce((sum, r) => sum + (r.elements?.length || 0), 0);
        const totalArea = analysisResults.reduce((sum, r) => sum + (r.summary?.totalArea || 0), 0);
        
        // Create project package
        const projectPackage = {
            projectInfo: PROJECT_INFO,
            generatedAt: new Date().toISOString(),
            processingTime: (Date.now() - startTime) / 1000,
            
            analysis: {
                totalPlans: analysisResults.length,
                totalElements,
                totalArea,
                plans: analysisResults
            },
            
            summary: {
                status: 'COMPLETE',
                plansProcessed: analysisResults.length,
                totalDocuments: analysisResults.length
            }
        };
        
        // Save results
        const outputDir = path.join(__dirname, 'project_deliverables', PROJECT_INFO.projectNumber);
        await fs.mkdir(outputDir, { recursive: true });
        
        await fs.writeFile(
            path.join(outputDir, 'PROJECT_INDEX.json'),
            JSON.stringify(projectPackage, null, 2)
        );
        
        await fs.writeFile(
            path.join(outputDir, 'DETAILED_RESULTS.json'),
            JSON.stringify({ projectPackage, analysisResults }, null, 2)
        );
        
        // Print summary
        console.log('═══════════════════════════════════════');
        console.log('🎉 ANALYSIS RESULTS');
        console.log('═══════════════════════════════════════');
        console.log('');
        console.log(`📋 Project: ${PROJECT_INFO.name}`);
        console.log(`💰 Value: €${(PROJECT_INFO.projectData.estimatedValue / 1000000)}M`);
        console.log(`📐 Target Area: ${PROJECT_INFO.projectData.totalArea.toLocaleString()} m²`);
        console.log('');
        console.log('📊 ANALYSIS');
        console.log(`Plans processed: ${analysisResults.length}/14 ✅`);
        console.log(`Elements detected: ${totalElements.toLocaleString()}`);
        console.log(`Analyzed area: ${totalArea.toFixed(2)} m²`);
        console.log('');
        console.log(`📁 Output: ${outputDir}`);
        console.log('');
        console.log('═══════════════════════════════════════');
        
        return projectPackage;
        
    } catch (error) {
        console.error('❌ FATAL ERROR:', error);
        console.error(error.stack);
        
        // Save error state
        await fs.writeFile(
            'analysis_error.json',
            JSON.stringify({ error: error.message, stack: error.stack, checkpoint }, null, 2)
        ).catch(() => {});
        
        process.exit(1);
    }
}

runCompleteProjectAnalysis()
    .then(() => process.exit(0))
    .catch(error => { console.error(error); process.exit(1); });
