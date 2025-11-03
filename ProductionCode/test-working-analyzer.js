#!/usr/bin/env node

/**
 * 🚀 WORKING ANALYZER TEST
 * ========================
 * 
 * Test with the simplified analyzer that actually works
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import SimplifiedPixelAnalyzer from './src/construction/vision/SimplifiedPixelAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 WORKING ANALYZER TEST');
console.log('========================');
console.log('');

async function testWorkingAnalyzer() {
    try {
        // Use real plan if on server
        let testPlanPath = '/root/ProductionCode/DOOcs/BaubplanAnalysis/FB_AUS A_GR01_C_231011.pdf';
        
        // Check if we're on the server or local
        try {
            await fs.access(testPlanPath);
            console.log('📄 Using real construction plan from server');
        } catch {
            // Try local path
            testPlanPath = path.join(__dirname, 'ServerData/TestProject/01 FB_Rohbau LV_211104.pdf');
            
            try {
                await fs.access(testPlanPath);
                console.log('📄 Using local test plan');
            } catch {
                console.error('❌ No test plan available');
                console.log('   Please provide a construction plan PDF');
                return;
            }
        }
        
        console.log(`   File: ${path.basename(testPlanPath)}`);
        
        // Check if we need to convert PDF to image first
        const pngPath = testPlanPath.replace('.pdf', '.png');
        let imagePath = testPlanPath;
        
        if (testPlanPath.endsWith('.pdf')) {
            console.log('\n📄 Converting PDF to image...');
            
            // Try to use existing converted image
            try {
                await fs.access(pngPath);
                imagePath = pngPath;
                console.log('   ✅ Using existing converted image');
            } catch {
                // If we're on the server, use the converted plans
                if (testPlanPath.includes('/root/ProductionCode')) {
                    const convertedPath = '/root/ProductionCode/converted_plans/FB_AUS A_GR01_C_231011/FB_AUS A_GR01_C_231011_page1_300dpi.png';
                    try {
                        await fs.access(convertedPath);
                        imagePath = convertedPath;
                        console.log('   ✅ Using pre-converted image from server');
                    } catch {
                        console.error('   ❌ No converted image found');
                        console.log('   Run PDF converter first or provide PNG image');
                        return;
                    }
                } else {
                    console.error('   ❌ PDF conversion needed');
                    console.log('   Please provide a PNG image or run PDF converter');
                    return;
                }
            }
        }
        
        // Initialize analyzer
        console.log('\n📋 Initializing SimplifiedPixelAnalyzer...');
        const analyzer = new SimplifiedPixelAnalyzer();
        console.log('   ✅ Analyzer ready');
        
        // Run analysis
        console.log('\n🔬 Starting analysis...');
        console.log('   This will downsample large images for speed');
        console.log('   Processing...\n');
        
        const startTime = Date.now();
        
        try {
            const results = await analyzer.analyzeConstructionPlan(imagePath);
            
            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;
            
            console.log('\n📊 ANALYSIS RESULTS');
            console.log('==================');
            console.log(`✅ SUCCESS!`);
            console.log(`\n📐 Image Dimensions:`);
            console.log(`   • Original: ${results.dimensions.width}×${results.dimensions.height}`);
            console.log(`   • Total pixels: ${results.dimensions.totalPixels.toLocaleString()}`);
            console.log(`   • Processed at: ${results.processing.processedWidth}×${results.processing.processedHeight}`);
            console.log(`   • Scale factor: ${results.processing.scale.toFixed(2)}`);
            
            console.log(`\n🎨 Analysis Results:`);
            console.log(`   • Color categories: ${results.analysis.categories}`);
            console.log(`   • Elements detected: ${results.analysis.elements}`);
            
            console.log(`\n⏱️ Performance:`);
            console.log(`   • Processing time: ${duration.toFixed(2)}s`);
            console.log(`   • Pixels/second: ${Math.round(results.dimensions.totalPixels / duration).toLocaleString()}`);
            
            console.log(`\n📁 Output:`);
            console.log(`   • Annotated image: ${results.output}`);
            
            console.log('\n✅ TEST COMPLETE - SYSTEM WORKING!');
            console.log('==================================');
            console.log('The simplified analyzer successfully:');
            console.log('  • Loaded the image');
            console.log('  • Analyzed pixels without hanging');
            console.log('  • Detected elements');
            console.log('  • Generated annotated output');
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            console.error('Stack:', error.stack);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run test
testWorkingAnalyzer().catch(console.error);
