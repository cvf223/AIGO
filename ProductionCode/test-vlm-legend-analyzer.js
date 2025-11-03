#!/usr/bin/env node

/**
 * 🧪 TEST VLM SEQUENTIAL LEGEND ANALYZER
 * ======================================
 * 
 * Test the new VLM-based sequential pattern analysis system
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import VLMSequentialLegendAnalyzer from './src/construction/vision/VLMSequentialLegendAnalyzer.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🚀 RUN VLM TEST
 */
async function runVLMTest() {
    console.log('\n' + '═'.repeat(80));
    console.log('🧪 VLM SEQUENTIAL LEGEND ANALYZER TEST');
    console.log('═'.repeat(80));
    
    try {
        // Check for test image
        const testImagePath = path.join(__dirname, 'test_plan_images', 'plan_2.png');
        
        try {
            await fs.access(testImagePath);
            console.log('\n✅ Test image found:', testImagePath);
        } catch {
            console.error('\n❌ Test image not found!');
            console.log('Please ensure there is a PNG construction plan at:');
            console.log(testImagePath);
            
            // Try to find any PNG in the directory
            const imageDir = path.join(__dirname, 'test_plan_images');
            try {
                const files = await fs.readdir(imageDir);
                const pngFiles = files.filter(f => f.endsWith('.png'));
                if (pngFiles.length > 0) {
                    console.log('\nFound PNG files in directory:');
                    pngFiles.forEach(f => console.log(`  - ${f}`));
                    console.log('\nUsing first available PNG...');
                    const alternativePath = path.join(imageDir, pngFiles[0]);
                    return await testWithImage(alternativePath);
                }
            } catch {
                console.log('\nNo test_plan_images directory found.');
            }
            
            return;
        }
        
        // Run test with found image
        await testWithImage(testImagePath);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

/**
 * 🧪 TEST WITH SPECIFIC IMAGE
 */
async function testWithImage(imagePath) {
    console.log('\n' + '-'.repeat(80));
    console.log('Starting VLM Sequential Analysis...');
    console.log('-'.repeat(80));
    
    // Create analyzer
    const analyzer = new VLMSequentialLegendAnalyzer();
    
    // Add event listeners for progress
    analyzer.on('progress', (message) => {
        console.log(`📊 Progress: ${message}`);
    });
    
    analyzer.on('patternIdentified', (pattern) => {
        console.log(`🔍 Identified: ${pattern.elementType} (${pattern.category})`);
    });
    
    analyzer.on('patternAnalyzed', (result) => {
        console.log(`✅ Analyzed: ${result.element} - ${result.measurement} ${result.unit}`);
    });
    
    try {
        // Run analysis
        const result = await analyzer.analyzeConstructionPlan(imagePath, {
            debug: true,
            saveIntermediateResults: true
        });
        
        // Display results
        console.log('\n' + '═'.repeat(80));
        console.log('📊 VLM ANALYSIS COMPLETE');
        console.log('═'.repeat(80));
        
        if (result.success) {
            console.log('\n✅ Analysis successful!');
            
            // Display wall results
            console.log('\n🏗️ WALL ELEMENTS:');
            const wallResults = result.results.filter(r => r.category === 'wall');
            if (wallResults.length > 0) {
                wallResults.forEach(r => {
                    console.log(`   ${r.element}:`);
                    console.log(`      Area: ${r.measurement.toFixed(2)} ${r.unit}`);
                    console.log(`      Instances: ${r.matches}`);
                    console.log(`      Confidence: ${(r.averageConfidence * 100).toFixed(1)}%`);
                    console.log(`      DIN Code: ${r.dinCode || 'N/A'}`);
                });
            } else {
                console.log('   No wall elements detected');
            }
            
            // Display opening results
            console.log('\n🚪 OPENING ELEMENTS:');
            const openingResults = result.results.filter(r => r.category === 'opening');
            if (openingResults.length > 0) {
                openingResults.forEach(r => {
                    console.log(`   ${r.element}:`);
                    console.log(`      Count: ${r.measurement} ${r.unit}`);
                    console.log(`      Confidence: ${(r.averageConfidence * 100).toFixed(1)}%`);
                    console.log(`      DIN Code: ${r.dinCode || 'N/A'}`);
                });
            } else {
                console.log('   No opening elements detected');
            }
            
            // Display summary
            console.log('\n📊 SUMMARY:');
            console.log(`   Scale: ${result.scale.notation}`);
            console.log(`   Total wall area: ${result.summary.totalWallArea.toFixed(2)} m²`);
            console.log(`   Total openings: ${result.summary.totalOpenings}`);
            console.log(`   Total elements: ${result.summary.totalElements}`);
            console.log(`   Total matches: ${result.summary.totalMatches}`);
            console.log(`   Average confidence: ${(result.summary.averageConfidence * 100).toFixed(1)}%`);
            console.log(`   Processing time: ${(result.processingTime / 1000).toFixed(2)} seconds`);
            
            console.log('\n📁 Output files:');
            console.log(`   Annotated image: ${result.outputPath}`);
            console.log(`   JSON data: ${result.outputPath.replace('.png', '_data.json')}`);
            
            // Comparison with expected values (if known)
            console.log('\n🔬 VALIDATION:');
            validateResults(result);
            
        } else {
            console.log('\n❌ Analysis failed');
        }
        
    } catch (error) {
        console.error('\n❌ Error during analysis:', error.message);
        console.error(error.stack);
    }
}

/**
 * ✅ VALIDATE RESULTS
 */
function validateResults(result) {
    // Basic sanity checks
    const checks = [];
    
    // Check scale detection
    if (result.scale && result.scale.notation) {
        checks.push('✅ Scale detected');
    } else {
        checks.push('❌ Scale not detected');
    }
    
    // Check wall area (typical building should have 100-10000 m² of walls)
    if (result.summary.totalWallArea > 0 && result.summary.totalWallArea < 50000) {
        checks.push('✅ Wall area reasonable');
    } else {
        checks.push('⚠️ Wall area may be incorrect');
    }
    
    // Check confidence levels
    if (result.summary.averageConfidence > 0.6) {
        checks.push('✅ Good confidence level');
    } else if (result.summary.averageConfidence > 0.4) {
        checks.push('⚠️ Moderate confidence level');
    } else {
        checks.push('❌ Low confidence level');
    }
    
    // Check element diversity
    if (result.summary.totalElements > 3) {
        checks.push('✅ Multiple element types detected');
    } else {
        checks.push('⚠️ Few element types detected');
    }
    
    // Display validation results
    checks.forEach(check => console.log(`   ${check}`));
    
    // Overall assessment
    const passedChecks = checks.filter(c => c.startsWith('✅')).length;
    const totalChecks = checks.length;
    
    console.log(`\n   Overall: ${passedChecks}/${totalChecks} checks passed`);
    
    if (passedChecks === totalChecks) {
        console.log('   🎉 Excellent results!');
    } else if (passedChecks >= totalChecks * 0.75) {
        console.log('   👍 Good results with minor issues');
    } else if (passedChecks >= totalChecks * 0.5) {
        console.log('   ⚠️ Results need review');
    } else {
        console.log('   ❌ Results need significant improvement');
    }
}

/**
 * 📊 COMPARE WITH PREVIOUS RESULTS
 */
async function compareWithPreviousResults(currentResult) {
    try {
        // Try to load previous results
        const previousPath = path.join(__dirname, 'vlm_analysis_output', 'previous_results.json');
        const previousData = await fs.readFile(previousPath, 'utf-8');
        const previousResult = JSON.parse(previousData);
        
        console.log('\n📊 COMPARISON WITH PREVIOUS RUN:');
        
        // Compare wall areas
        const areaDiff = currentResult.summary.totalWallArea - previousResult.summary.totalWallArea;
        const areaDiffPercent = (areaDiff / previousResult.summary.totalWallArea * 100).toFixed(1);
        console.log(`   Wall area change: ${areaDiff > 0 ? '+' : ''}${areaDiff.toFixed(2)} m² (${areaDiffPercent}%)`);
        
        // Compare confidence
        const confDiff = currentResult.summary.averageConfidence - previousResult.summary.averageConfidence;
        const confDiffPercent = (confDiff * 100).toFixed(1);
        console.log(`   Confidence change: ${confDiff > 0 ? '+' : ''}${confDiffPercent}%`);
        
        // Compare processing time
        const timeDiff = currentResult.processingTime - previousResult.processingTime;
        console.log(`   Processing time change: ${timeDiff > 0 ? '+' : ''}${(timeDiff / 1000).toFixed(2)}s`);
        
        // Save current as previous for next run
        await fs.writeFile(
            previousPath,
            JSON.stringify(currentResult, null, 2)
        );
        
    } catch (error) {
        // No previous results to compare
        console.log('\n📊 No previous results to compare (first run)');
        
        // Save current for next time
        try {
            const outputDir = path.join(__dirname, 'vlm_analysis_output');
            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(
                path.join(outputDir, 'previous_results.json'),
                JSON.stringify(currentResult, null, 2)
            );
        } catch (e) {
            // Ignore save errors
        }
    }
}

// Run test
console.log('🚀 Starting VLM Sequential Legend Analyzer Test...');
runVLMTest().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
