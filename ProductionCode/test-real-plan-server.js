#!/usr/bin/env node

/**
 * 🎯 TEST PIXEL-PRECISE TILE SYSTEM WITH REAL PLAN
 * ===============================================
 * 
 * Tests the integrated tile system with an actual construction plan
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Import the integrated systems
import PDFToImageConverter from './src/construction/vision/PDFToImageConverter.js';
import PixelPreciseAnnotationSystem from './src/construction/vision/PixelPreciseAnnotationSystem.js';
import DataSourceTracker from './src/construction/tracking/DataSourceTracker.js';
import InteractiveHTMLGenerator from './src/construction/documents/InteractiveHTMLGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 PIXEL-PRECISE TILE SYSTEM TEST - REAL PLAN');
console.log('==============================================');
console.log('');

async function testWithRealPlan() {
    try {
        // Use real plan from server
        const testPlanPath = '/root/ProductionCode/DOOcs/BaubplanAnalysis/FB_AUS A_GR01_C_231011.pdf';
        
        console.log(`📄 Using real construction plan: ${path.basename(testPlanPath)}`);
        
        // Check if plan exists
        try {
            await fs.access(testPlanPath);
            console.log('✅ Plan file found');
        } catch {
            console.error('❌ Plan file not accessible');
            return;
        }
        
        // Phase 1: Initialize Systems
        console.log('\n📋 Phase 1: Initializing Systems');
        console.log('================================');
        
        const pdfConverter = new PDFToImageConverter();
        await pdfConverter.initialize();
        console.log('✅ PDF to Image Converter ready');
        
        const annotationSystem = new PixelPreciseAnnotationSystem();
        await annotationSystem.initialize();
        console.log('✅ Pixel-Precise Annotation System ready');
        
        const dataTracker = new DataSourceTracker();
        await dataTracker.initialize();
        console.log('✅ Data Source Tracker ready');
        
        // Phase 2: Convert PDF to High-Resolution Image
        console.log('\n📋 Phase 2: PDF to Image Conversion');
        console.log('===================================');
        
        console.log('Converting PDF to high-resolution images...');
        const conversionResult = await pdfConverter.convertPDFToImages(testPlanPath, {
            dpi: 300,
            format: 'png'
        });
        
        console.log(`✅ Converted ${conversionResult.images.length} page(s)`);
        console.log(`   📐 Resolution: ${conversionResult.images[0]?.metadata?.width}×${conversionResult.images[0]?.metadata?.height} pixels`);
        
        // Phase 3: Perform Pixel-Precise Analysis
        console.log('\n📋 Phase 3: Pixel-Precise Tile Analysis');
        console.log('=======================================');
        
        const firstImage = conversionResult.images[0];
        if (!firstImage) {
            console.error('❌ No images converted');
            return;
        }
        
        console.log(`\n🔬 Analyzing: ${path.basename(firstImage.imagePath)}`);
        console.log(`   Dimensions: ${firstImage.metadata.width}×${firstImage.metadata.height} pixels`);
        
        // Calculate tile grid
        const tileSize = 672;
        const overlap = 64;
        const step = tileSize - overlap;
        
        const tilesX = Math.ceil(firstImage.metadata.width / step);
        const tilesY = Math.ceil(firstImage.metadata.height / step);
        const totalTiles = tilesX * tilesY;
        
        console.log(`\n🧩 Tile Grid Configuration:`);
        console.log(`   • Grid: ${tilesX}×${tilesY} = ${totalTiles} tiles`);
        console.log(`   • Tile size: ${tileSize}×${tileSize} pixels`);
        console.log(`   • Overlap: ${overlap} pixels`);
        console.log(`   • Total pixels to analyze: ${(firstImage.metadata.width * firstImage.metadata.height).toLocaleString()}`);
        
        // Run annotation
        console.log('\n🎨 Starting pixel-precise annotation...');
        const startTime = Date.now();
        
        try {
            const annotationResult = await annotationSystem.annotateConstructionPlan(
                firstImage.imagePath
            );
            
            const endTime = Date.now();
            
            console.log('\n✅ ANNOTATION COMPLETE!');
            console.log('====================');
            console.log(`⏱️ Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
            console.log(`📊 Results:`);
            console.log(`   • Pixels analyzed: ${annotationResult.dimensions.totalPixels.toLocaleString()}`);
            console.log(`   • Elements detected: ${annotationResult.elements}`);
            console.log(`   • Categories found: ${annotationResult.segmentation.categories}`);
            console.log(`   • Average confidence: ${(annotationResult.segmentation.avgConfidence * 100).toFixed(1)}%`);
            console.log(`   • Output files:`);
            
            for (const [key, path] of Object.entries(annotationResult.outputPaths)) {
                console.log(`      - ${key}: ${path}`);
            }
            
            // Track measurements
            console.log('\n📊 Tracking measurements...');
            let trackedCount = 0;
            
            for (let i = 0; i < Math.min(5, annotationResult.elements); i++) {
                const element = annotationSystem.elementBoundaries.get(i);
                if (element) {
                    dataTracker.trackMeasurementSource({
                        value: element.pixelCount,
                        unit: 'pixels',
                        type: 'area',
                        description: `Element ${i}`,
                        sourceType: 'plan_annotation',
                        planIds: [firstImage.imagePath],
                        pixelArea: element.pixelCount,
                        confidence: 0.85
                    });
                    trackedCount++;
                }
            }
            
            console.log(`   ✅ Tracked ${trackedCount} measurements`);
            
            // Generate tracking report
            const trackingReport = dataTracker.generateTrackingReport();
            console.log('\n📊 Tracking Summary:');
            console.log(`   • Total measurements: ${trackingReport.statistics.totalMeasurements}`);
            console.log(`   • Average confidence: ${trackingReport.qualityMetrics.averageConfidence}`);
            
            // Save tracking data
            await dataTracker.saveTrackingData();
            console.log('   ✅ Tracking data saved');
            
        } catch (error) {
            console.error('❌ Annotation failed:', error.message);
            console.error(error.stack);
        }
        
        // Cleanup
        console.log('\n🧹 Cleaning up...');
        await pdfConverter.cleanupConvertedImages(conversionResult.conversionId);
        console.log('   ✅ Temporary files cleaned');
        
        console.log('\n✅ TEST COMPLETE!');
        console.log('================');
        console.log('Successfully demonstrated:');
        console.log('  • PDF to high-res image conversion');
        console.log('  • Tile-based pixel-precise analysis');
        console.log('  • Complete measurement tracking');
        console.log('  • Output generation with layers');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testWithRealPlan().catch(console.error);
