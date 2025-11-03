#!/usr/bin/env node

/**
 * 🚀 DIRECT PNG TEST - WORKING VERSION
 * ====================================
 */

import SimplifiedPixelAnalyzer from './src/construction/vision/SimplifiedPixelAnalyzer.js';

console.log('🚀 DIRECT PNG TEST');
console.log('==================');

async function testPNG() {
    try {
        const analyzer = new SimplifiedPixelAnalyzer();
        
        // Use the converted PNG directly
        const imagePath = '/root/ProductionCode/converted_plans/FB_AUS A_GR01_C_231011/temp_1761173471469-1.png';
        
        console.log(`\n📄 Testing with: ${imagePath}`);
        console.log('🔬 Starting analysis...\n');
        
        const results = await analyzer.analyzeConstructionPlan(imagePath);
        
        console.log('\n✅ SUCCESS! Analysis completed without hanging!');
        console.log('=========================================');
        console.log(`📐 Processed ${results.dimensions.totalPixels.toLocaleString()} pixels`);
        console.log(`🎨 Found ${results.analysis.elements} elements`);
        console.log(`⏱️ Time: ${(results.processing.time / 1000).toFixed(2)}s`);
        console.log(`📁 Output: ${results.output}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testPNG().catch(console.error);
