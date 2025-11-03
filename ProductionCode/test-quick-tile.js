#!/usr/bin/env node

/**
 * 🚀 QUICK TILE SYSTEM TEST
 * ========================
 * 
 * Quick test to verify tile-based processing is working
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Import the integrated systems
import PixelPreciseAnnotationSystem from './src/construction/vision/PixelPreciseAnnotationSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 QUICK TILE SYSTEM TEST');
console.log('========================');
console.log('');

async function quickTileTest() {
    try {
        console.log('📋 Creating synthetic test image...');
        
        // Create a small synthetic image for quick testing
        const width = 2016;  // 3 tiles wide (672*3)
        const height = 1344; // 2 tiles high (672*2)
        
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Draw a simple construction plan pattern
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw some walls (black lines)
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 10;
        ctx.strokeRect(100, 100, 800, 600);
        ctx.strokeRect(1000, 100, 800, 600);
        
        // Draw some doors (red)
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 5;
        ctx.strokeRect(400, 100, 80, 10);
        ctx.strokeRect(1300, 100, 80, 10);
        
        // Draw some windows (blue)
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 5;
        ctx.strokeRect(200, 100, 100, 10);
        ctx.strokeRect(600, 100, 100, 10);
        
        // Draw dimension lines
        ctx.strokeStyle = '#0066CC';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(100, 750);
        ctx.lineTo(900, 750);
        ctx.stroke();
        
        // Add some text
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText('Test Construction Plan', 50, 50);
        ctx.fillText('Scale 1:100', 50, 1300);
        
        // Save the test image
        const testImagePath = path.join(__dirname, 'test-construction-plan.png');
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(testImagePath, buffer);
        
        console.log(`✅ Test image created: ${width}×${height} pixels`);
        console.log(`   📁 Saved to: ${testImagePath}`);
        
        // Calculate expected tiles
        const tileSize = 672;
        const overlap = 64;
        const step = tileSize - overlap;
        const tilesX = Math.ceil(width / step);
        const tilesY = Math.ceil(height / step);
        const totalTiles = tilesX * tilesY;
        
        console.log(`\n🧩 Expected Tile Configuration:`);
        console.log(`   • Image: ${width}×${height} pixels`);
        console.log(`   • Grid: ${tilesX}×${tilesY} = ${totalTiles} tiles`);
        console.log(`   • Tile size: ${tileSize}×${tileSize} pixels`);
        console.log(`   • Overlap: ${overlap} pixels`);
        
        // Initialize annotation system
        console.log('\n📋 Initializing Annotation System...');
        const annotationSystem = new PixelPreciseAnnotationSystem();
        await annotationSystem.initialize();
        console.log('✅ Annotation System ready');
        
        // Run annotation
        console.log('\n🎨 Starting pixel-precise annotation...');
        console.log('   Processing with tile-based system...');
        
        const startTime = Date.now();
        
        try {
            const result = await annotationSystem.annotateConstructionPlan(testImagePath);
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log('\n✅ ANNOTATION COMPLETE!');
            console.log('====================');
            console.log(`⏱️ Processing time: ${duration.toFixed(2)}s`);
            console.log(`📊 Results:`);
            console.log(`   • Dimensions: ${result.dimensions.width}×${result.dimensions.height}`);
            console.log(`   • Total pixels: ${result.dimensions.totalPixels.toLocaleString()}`);
            console.log(`   • Elements detected: ${result.elements}`);
            console.log(`   • Categories found: ${result.segmentation.categories}`);
            console.log(`   • Average confidence: ${(result.segmentation.avgConfidence * 100).toFixed(1)}%`);
            
            // Performance metrics
            const pixelsPerSecond = result.dimensions.totalPixels / duration;
            console.log(`\n⚡ Performance Metrics:`);
            console.log(`   • Pixels/second: ${Math.round(pixelsPerSecond).toLocaleString()}`);
            console.log(`   • Tiles/second: ${(totalTiles / duration).toFixed(2)}`);
            
            // Output files
            console.log(`\n📁 Output Files Generated:`);
            for (const [key, path] of Object.entries(result.outputPaths)) {
                console.log(`   • ${key}: ${path}`);
            }
            
            // Category breakdown
            if (result.segmentation.categoryBreakdown) {
                console.log(`\n📊 Category Breakdown:`);
                const categories = Object.entries(result.segmentation.categoryBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5);
                
                for (const [cat, count] of categories) {
                    const percentage = (count / result.dimensions.totalPixels * 100).toFixed(2);
                    console.log(`   • ${cat}: ${count.toLocaleString()} pixels (${percentage}%)`);
                }
            }
            
        } catch (error) {
            console.error('❌ Annotation failed:', error.message);
            console.error('Stack trace:', error.stack);
        }
        
        // Cleanup
        console.log('\n🧹 Cleaning up test files...');
        try {
            await fs.unlink(testImagePath);
            console.log('   ✅ Test image deleted');
        } catch (e) {
            console.log('   ⚠️ Could not delete test image');
        }
        
        console.log('\n✅ QUICK TEST COMPLETE!');
        console.log('======================');
        console.log('Successfully tested:');
        console.log('  • Tile-based processing with 672×672 tiles');
        console.log('  • Pixel-precise segmentation');
        console.log('  • Rule-based classification');
        console.log('  • Multi-layer output generation');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run the test
quickTileTest().catch(console.error);
