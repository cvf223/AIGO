#!/usr/bin/env node

/**
 * 🎯 TEST LEGEND-BASED ANALYZER
 * =============================
 * 
 * Tests the CORRECT approach: Legend → Pattern → Detection
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import LegendBasedWallAnalyzer from './src/construction/vision/LegendBasedWallAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎯 LEGEND-BASED PATTERN ANALYZER TEST');
console.log('=====================================');
console.log('');
console.log('CORRECT APPROACH:');
console.log('  1️⃣ Extract legend from bottom-right corner');
console.log('  2️⃣ Learn pixel patterns for each wall type');
console.log('  3️⃣ Find building area (exclude text/dimensions)');
console.log('  4️⃣ Match patterns in building area');
console.log('  5️⃣ Calculate m² for each pattern type');
console.log('');

async function testLegendAnalyzer() {
    try {
        // Check for test image
        let imagePath = '/root/ProductionCode/converted_plans/FB_AUS A_GR01_C_231011/temp_1761173471469-1.png';
        
        // Check if on server
        try {
            await fs.access(imagePath);
            console.log('📄 Using construction plan from server');
        } catch {
            console.error('❌ No test image available on server');
            console.log('   Please ensure converted plan exists');
            return;
        }
        
        console.log(`   File: ${path.basename(imagePath)}`);
        console.log('');
        console.log('─'.repeat(70));
        
        // Initialize analyzer
        console.log('\n📋 Initializing Legend-Based Analyzer...');
        const analyzer = new LegendBasedWallAnalyzer();
        console.log('   ✅ Analyzer ready');
        
        // Run analysis
        console.log('\n🔬 Starting pattern-based analysis...');
        console.log('   This will:');
        console.log('   • Extract and analyze legend');
        console.log('   • Learn wall patterns');
        console.log('   • Find all pattern matches');
        console.log('   • Calculate real m² areas');
        console.log('');
        
        const results = await analyzer.analyzeWithLegend(imagePath);
        
        if (results.success) {
            console.log('\n' + '═'.repeat(70));
            console.log('✅ PATTERN ANALYSIS SUCCESSFUL!');
            console.log('═'.repeat(70));
            
            // Export tender data
            console.log('\n📋 TENDER DOCUMENT DATA:');
            console.log('─'.repeat(40));
            
            const tenderPositions = [];
            let positionCode = 331;
            
            for (const [patternId, measurement] of Object.entries(results.measurements)) {
                if (measurement.areaSquareMeters > 0) {
                    tenderPositions.push({
                        position: positionCode++,
                        patternId: patternId,
                        description: `Wall Type ${patternId}`,
                        quantity: measurement.areaSquareMeters,
                        unit: 'm²',
                        matches: measurement.matchCount,
                        confidence: measurement.confidence
                    });
                    
                    console.log(`\nPosition ${positionCode - 1}: ${patternId}`);
                    console.log(`  Quantity: ${measurement.areaSquareMeters.toFixed(2)} m²`);
                    console.log(`  Pattern matches: ${measurement.matchCount}`);
                    console.log(`  Confidence: ${(measurement.confidence * 100).toFixed(1)}%`);
                }
            }
            
            console.log('\n' + '─'.repeat(40));
            console.log(`TOTAL AREA: ${results.totalArea.toFixed(2)} m²`);
            console.log('─'.repeat(40));
            
            // Save tender data
            const outputDir = path.join(process.cwd(), 'legend_analysis_output');
            await fs.mkdir(outputDir, { recursive: true });
            
            const tenderPath = path.join(outputDir, 'pattern_tender_data.json');
            await fs.writeFile(tenderPath, JSON.stringify({
                project: path.basename(imagePath),
                scale: results.scale,
                buildingArea: results.buildingArea,
                totalArea: results.totalArea,
                positions: tenderPositions,
                patternCount: results.patterns.size,
                timestamp: new Date().toISOString()
            }, null, 2));
            
            console.log(`\n📁 Tender data: ${tenderPath}`);
            console.log(`📁 Annotated plan: ${results.outputPath}`);
            
            // Key insights
            console.log('\n🔍 KEY INSIGHTS:');
            console.log(`   • Legend patterns found: ${results.patterns.size}`);
            console.log(`   • Building area: ${results.buildingArea.width}×${results.buildingArea.height} px`);
            console.log(`   • Scale: ${results.scale.notation}`);
            
        } else {
            console.error('❌ Pattern analysis failed');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

console.log('─'.repeat(70));
testLegendAnalyzer().catch(console.error);
