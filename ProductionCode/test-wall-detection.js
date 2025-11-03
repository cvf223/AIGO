#!/usr/bin/env node

/**
 * 🏗️ WALL DETECTION TEST
 * ======================
 * 
 * Test the Wall Detection System that identifies ALL walls,
 * categorizes by material, and calculates m² for tender documents
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import WallDetectionSystem from './src/construction/vision/WallDetectionSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏗️ WALL DETECTION TEST');
console.log('======================');
console.log('');
console.log('This system will:');
console.log('  ✅ Identify ALL walls in the plan');
console.log('  ✅ Categorize by material type');
console.log('  ✅ Calculate m² for each wall type');
console.log('  ✅ Export data for tender documents');
console.log('');

async function testWallDetection() {
    try {
        // Check for test image
        let imagePath = '/root/ProductionCode/converted_plans/FB_AUS A_GR01_C_231011/temp_1761173471469-1.png';
        
        // Check if on server
        try {
            await fs.access(imagePath);
            console.log('📄 Using converted plan from server');
        } catch {
            // Try local test image
            imagePath = path.join(__dirname, 'test-construction-plan.png');
            try {
                await fs.access(imagePath);
                console.log('📄 Using local test image');
            } catch {
                console.error('❌ No test image available');
                console.log('   Please provide a construction plan PNG');
                return;
            }
        }
        
        console.log(`   File: ${path.basename(imagePath)}`);
        
        // Initialize Wall Detection System
        console.log('\n📋 Initializing Wall Detection System...');
        const wallDetector = new WallDetectionSystem();
        console.log('   ✅ System ready');
        
        // Run wall detection
        console.log('\n🔬 Starting wall detection...');
        console.log('   This will identify and measure all walls');
        console.log('');
        
        const results = await wallDetector.detectAllWalls(imagePath, {
            scale: '1:100'  // Specify scale if known
        });
        
        if (results.success) {
            console.log('\n' + '='.repeat(60));
            console.log('✅ WALL DETECTION SUCCESSFUL!');
            console.log('='.repeat(60));
            
            // Export results for tender document
            console.log('\n📋 TENDER DOCUMENT DATA:');
            console.log('------------------------');
            
            let totalWallArea = 0;
            const tenderData = [];
            
            for (const [type, stats] of Object.entries(results.statistics)) {
                if (stats.count > 0) {
                    const wallConfig = wallDetector.config.wallTypes[type];
                    
                    tenderData.push({
                        position: wallConfig.dinCode,
                        description: wallConfig.name,
                        quantity: stats.totalArea,
                        unit: 'm²',
                        details: {
                            count: stats.count,
                            totalLength: stats.totalLength,
                            avgThickness: stats.avgThickness
                        }
                    });
                    
                    totalWallArea += stats.totalArea;
                    
                    console.log(`\nPosition ${wallConfig.dinCode}: ${wallConfig.name}`);
                    console.log(`  Quantity: ${stats.totalArea.toFixed(2)} m²`);
                    console.log(`  Count: ${stats.count} walls`);
                    console.log(`  Total Length: ${stats.totalLength.toFixed(2)} m`);
                    console.log(`  Avg Thickness: ${(stats.avgThickness * 100).toFixed(1)} cm`);
                }
            }
            
            console.log('\n' + '─'.repeat(40));
            console.log(`TOTAL WALL AREA: ${totalWallArea.toFixed(2)} m²`);
            console.log('─'.repeat(40));
            
            // Save tender data
            const outputDir = path.join(process.cwd(), 'wall_detection_output');
            await fs.mkdir(outputDir, { recursive: true });
            
            const tenderPath = path.join(outputDir, 'tender_wall_data.json');
            await fs.writeFile(tenderPath, JSON.stringify({
                project: path.basename(imagePath),
                scale: results.scale,
                totalWallArea: totalWallArea,
                positions: tenderData,
                timestamp: new Date().toISOString()
            }, null, 2));
            
            console.log(`\n📁 Tender data saved: ${tenderPath}`);
            console.log(`📁 Annotated plan: ${results.outputPath}`);
            
            // Performance metrics
            console.log('\n⚡ Performance:');
            console.log(`   • Processing time: ${(results.processingTime / 1000).toFixed(2)}s`);
            console.log(`   • Walls detected: ${results.walls.length}`);
            
        } else {
            console.error('❌ Wall detection failed');
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
    }
}

// Run test
console.log('─'.repeat(60));
testWallDetection().catch(console.error);
