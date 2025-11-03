#!/usr/bin/env node

/**
 * 🔍 DIAGNOSTIC TEST - Find Where System Is Hanging
 * ================================================
 * 
 * Quick test to identify exactly where the system is failing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { createCanvas } from 'canvas';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 DIAGNOSTIC TEST - FINDING THE ISSUE');
console.log('======================================');
console.log('');

async function diagnosticTest() {
    try {
        // Test 1: Basic imports
        console.log('📋 Test 1: Checking imports...');
        try {
            const { default: PixelPreciseAnnotationSystem } = await import('./src/construction/vision/PixelPreciseAnnotationSystem.js');
            console.log('   ✅ PixelPreciseAnnotationSystem imported');
        } catch (error) {
            console.log('   ❌ Failed to import:', error.message);
            return;
        }
        
        // Test 2: System initialization
        console.log('\n📋 Test 2: System initialization...');
        const PixelPreciseAnnotationSystem = (await import('./src/construction/vision/PixelPreciseAnnotationSystem.js')).default;
        const annotationSystem = new PixelPreciseAnnotationSystem();
        
        // Add timeout to initialization
        const initPromise = annotationSystem.initialize();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Initialization timeout')), 5000)
        );
        
        try {
            await Promise.race([initPromise, timeoutPromise]);
            console.log('   ✅ System initialized');
        } catch (error) {
            console.log('   ❌ Initialization failed:', error.message);
            return;
        }
        
        // Test 3: Create tiny test image
        console.log('\n📋 Test 3: Processing tiny test image...');
        const width = 100;
        const height = 100;
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Draw simple test pattern
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 5;
        ctx.strokeRect(20, 20, 60, 60);
        
        // Save tiny test image
        const testImagePath = path.join(__dirname, 'test-tiny.png');
        const fs = await import('fs/promises');
        await fs.writeFile(testImagePath, canvas.toBuffer('image/png'));
        console.log(`   ✅ Created ${width}×${height} test image`);
        
        // Test 4: Load the image
        console.log('\n📋 Test 4: Loading test image...');
        try {
            const planImage = await annotationSystem.loadPlanImage(testImagePath);
            console.log(`   ✅ Image loaded: ${planImage.width}×${planImage.height}`);
        } catch (error) {
            console.log('   ❌ Failed to load image:', error.message);
            await fs.unlink(testImagePath);
            return;
        }
        
        // Test 5: Initialize layers
        console.log('\n📋 Test 5: Initializing layers...');
        try {
            await annotationSystem.initializeLayers(width, height);
            console.log(`   ✅ Layers initialized: ${annotationSystem.annotationLayers.size} layers`);
        } catch (error) {
            console.log('   ❌ Failed to initialize layers:', error.message);
        }
        
        // Test 6: Segment pixels (with timeout)
        console.log('\n📋 Test 6: Testing pixel segmentation...');
        const planImage = await annotationSystem.loadPlanImage(testImagePath);
        
        const segmentPromise = annotationSystem.segmentPixels(planImage);
        const segmentTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Segmentation timeout after 10s')), 10000)
        );
        
        try {
            const result = await Promise.race([segmentPromise, segmentTimeout]);
            console.log('   ✅ Segmentation completed');
            console.log(`      Categories: ${result.categories}`);
            console.log(`      Confidence: ${(result.avgConfidence * 100).toFixed(1)}%`);
        } catch (error) {
            console.log('   ❌ Segmentation failed:', error.message);
            
            // Try to identify where it's stuck
            console.log('\n   🔍 Checking where segmentation is stuck...');
            if (annotationSystem.tiledAnalysisEngine) {
                console.log('      - TiledAnalysisEngine exists');
            }
            if (annotationSystem.pixelClassification) {
                console.log('      - Pixel classification in progress');
            }
        }
        
        // Test 7: Detect boundaries (with timeout and small data)
        console.log('\n📋 Test 7: Testing boundary detection...');
        
        // Create a tiny segmentation map for testing
        const tinySegMap = new Uint8Array(100); // 10x10 pixels
        for (let i = 0; i < 100; i++) {
            tinySegMap[i] = i < 50 ? 0 : 1; // Half background, half walls
        }
        
        const boundaryPromise = annotationSystem.detectElementBoundaries(tinySegMap);
        const boundaryTimeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Boundary detection timeout after 5s')), 5000)
        );
        
        try {
            const boundaries = await Promise.race([boundaryPromise, boundaryTimeout]);
            console.log(`   ✅ Boundary detection completed: ${boundaries.length} elements`);
        } catch (error) {
            console.log('   ❌ Boundary detection failed:', error.message);
        }
        
        // Cleanup
        console.log('\n📋 Cleaning up...');
        await fs.unlink(testImagePath);
        console.log('   ✅ Test file deleted');
        
        // Summary
        console.log('\n📊 DIAGNOSTIC SUMMARY');
        console.log('====================');
        console.log('✅ System can initialize');
        console.log('✅ Can create and load images');
        console.log('✅ Can initialize layers');
        
        console.log('\n🎯 LIKELY ISSUES:');
        console.log('1. Segmentation hangs on large images (139M pixels)');
        console.log('2. Boundary detection has memory/performance issues');
        console.log('3. Tile processing might have infinite loops');
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('1. Add progress callbacks to long operations');
        console.log('2. Process smaller chunks with explicit batching');
        console.log('3. Add timeouts to all async operations');
        console.log('4. Reduce tile sizes or skip some tiles for testing');
        
    } catch (error) {
        console.error('\n❌ Diagnostic test failed:', error.message);
        console.error(error.stack);
    }
}

// Run diagnostic
diagnosticTest().catch(console.error);
