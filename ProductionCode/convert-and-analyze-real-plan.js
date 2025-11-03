#!/usr/bin/env node

/**
 * 🏗️ CONVERT AND ANALYZE REAL CONSTRUCTION PLAN
 * =============================================
 * 
 * Converts PDF construction plan to high-resolution PNG
 * and runs VLM Sequential Legend Analyzer with pixel-precise tiling
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔄 CONVERT PDF TO HIGH-RESOLUTION PNG
 */
async function convertPdfToPng(pdfPath, outputDir) {
    console.log('\n📄 Converting PDF to high-resolution PNG...');
    
    const pdfName = path.basename(pdfPath, '.pdf');
    const outputPath = path.join(outputDir, `${pdfName}.png`);
    
    try {
        // Using pdftoppm for high-quality conversion at 300 DPI
        // This preserves all details for pixel-precise analysis
        const command = `pdftoppm -png -r 300 -singlefile "${pdfPath}" "${path.join(outputDir, pdfName)}"`;
        
        console.log('   Running conversion command...');
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr && !stderr.includes('Warning')) {
            console.warn('   Conversion warnings:', stderr);
        }
        
        // Check if output file exists
        try {
            const stats = await fs.stat(outputPath);
            console.log(`   ✅ PNG created: ${outputPath}`);
            console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Get image dimensions using ImageMagick identify
            try {
                const { stdout: dimensions } = await execAsync(`identify -format "%wx%h" "${outputPath}"`);
                console.log(`   Dimensions: ${dimensions.trim()} pixels`);
            } catch (e) {
                // Dimensions check failed, but file exists
            }
            
            return outputPath;
        } catch (error) {
            throw new Error(`PNG file not created: ${outputPath}`);
        }
        
    } catch (error) {
        console.error('❌ PDF conversion failed:', error.message);
        
        // Try alternative method with Ghostscript
        console.log('   Trying alternative conversion with Ghostscript...');
        
        try {
            const gsCommand = `gs -dNOPAUSE -dBATCH -sDEVICE=png16m -r300 -sOutputFile="${outputPath}" "${pdfPath}"`;
            await execAsync(gsCommand);
            
            const stats = await fs.stat(outputPath);
            console.log(`   ✅ PNG created with Ghostscript: ${outputPath}`);
            console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            
            return outputPath;
        } catch (gsError) {
            throw new Error(`Both conversion methods failed: ${gsError.message}`);
        }
    }
}

/**
 * 🎯 RUN VLM SEQUENTIAL ANALYSIS
 */
async function runVLMAnalysis(imagePath) {
    console.log('\n🤖 Running VLM Sequential Legend Analyzer...');
    console.log('   Using pixel-precise tile-based processing');
    
    // Import and run the analyzer
    const VLMSequentialLegendAnalyzer = (await import('./src/construction/vision/VLMSequentialLegendAnalyzer.js')).default;
    
    const analyzer = new VLMSequentialLegendAnalyzer();
    
    // Configure for pixel-precise tiling
    analyzer.config.scanning.tileSize = 672;  // Optimal for llava:34b
    analyzer.config.scanning.overlap = 100;   // More overlap for precision
    analyzer.config.scanning.minConfidence = 0.65; // Lower threshold for real plans
    
    console.log('\n   Configuration:');
    console.log(`   • Tile size: ${analyzer.config.scanning.tileSize}px`);
    console.log(`   • Overlap: ${analyzer.config.scanning.overlap}px`);
    console.log(`   • Min confidence: ${analyzer.config.scanning.minConfidence}`);
    
    try {
        const results = await analyzer.analyzeConstructionPlan(imagePath, {
            debug: true,
            saveIntermediateResults: true,
            pixelPrecise: true
        });
        
        return results;
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        throw error;
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log('\n' + '═'.repeat(80));
    console.log('🏗️ REAL CONSTRUCTION PLAN ANALYSIS - PIXEL-PRECISE TILES');
    console.log('═'.repeat(80));
    
    // Define paths
    const pdfPath = '/root/ProductionCode/TestProject/FB_AUS A_GR00_B_240529.pdf';
    const tempDir = '/root/ProductionCode/temp_plan_images';
    
    try {
        // Create temp directory if it doesn't exist
        console.log('\n📁 Setting up directories...');
        await fs.mkdir(tempDir, { recursive: true });
        console.log(`   ✅ Output directory ready: ${tempDir}`);
        
        // Convert PDF to PNG
        const pngPath = await convertPdfToPng(pdfPath, tempDir);
        
        // Run VLM analysis
        const results = await runVLMAnalysis(pngPath);
        
        // Display results
        console.log('\n' + '═'.repeat(80));
        console.log('📊 ANALYSIS RESULTS');
        console.log('═'.repeat(80));
        
        if (results.success) {
            console.log('\n✅ Analysis successful!');
            
            // Wall elements
            console.log('\n🏗️ DETECTED WALL ELEMENTS:');
            const walls = results.results.filter(r => r.category === 'wall');
            
            if (walls.length > 0) {
                let totalWallArea = 0;
                
                walls.forEach(wall => {
                    console.log(`\n   ${wall.element}:`);
                    console.log(`   • Area: ${wall.measurement.toFixed(2)} ${wall.unit}`);
                    console.log(`   • Instances: ${wall.matches}`);
                    console.log(`   • Confidence: ${(wall.confidence * 100).toFixed(1)}%`);
                    console.log(`   • DIN Code: ${wall.dinCode || 'N/A'}`);
                    totalWallArea += wall.measurement;
                });
                
                console.log(`\n   TOTAL WALL AREA: ${totalWallArea.toFixed(2)} m²`);
            } else {
                console.log('   No wall elements detected');
            }
            
            // Opening elements
            console.log('\n🚪 DETECTED OPENINGS:');
            const openings = results.results.filter(r => r.category === 'opening');
            
            if (openings.length > 0) {
                openings.forEach(opening => {
                    console.log(`\n   ${opening.element}:`);
                    console.log(`   • Count: ${opening.measurement} ${opening.unit}`);
                    console.log(`   • Confidence: ${(opening.confidence * 100).toFixed(1)}%`);
                    console.log(`   • DIN Code: ${opening.dinCode || 'N/A'}`);
                });
            } else {
                console.log('   No opening elements detected');
            }
            
            // Summary
            console.log('\n📊 PROCESSING SUMMARY:');
            console.log(`   • Scale: ${results.scale.notation}`);
            console.log(`   • Total elements detected: ${results.summary.totalElements}`);
            console.log(`   • Total matches: ${results.summary.totalMatches}`);
            console.log(`   • Average confidence: ${(results.summary.averageConfidence * 100).toFixed(1)}%`);
            console.log(`   • Processing time: ${(results.processingTime / 1000).toFixed(1)} seconds`);
            
            // Pixel-precise metrics
            console.log('\n🎯 PIXEL-PRECISE METRICS:');
            console.log(`   • Pixels analyzed: ${results.scale.pixelsPerMeter ? 'Yes' : 'No'}`);
            console.log(`   • Pixels per meter: ${results.scale.pixelsPerMeter?.toFixed(2) || 'N/A'}`);
            console.log(`   • Tile processing: Sequential pattern-by-pattern`);
            
            // Output files
            console.log('\n📁 OUTPUT FILES:');
            console.log(`   • Annotated plan: ${results.outputPath}`);
            console.log(`   • JSON data: ${results.outputPath.replace('.png', '_data.json')}`);
            
            // Save summary
            const summaryPath = path.join(tempDir, 'analysis_summary.json');
            await fs.writeFile(summaryPath, JSON.stringify({
                planName: path.basename(pdfPath),
                timestamp: new Date().toISOString(),
                scale: results.scale,
                summary: results.summary,
                walls: walls.map(w => ({
                    type: w.element,
                    area: w.measurement,
                    instances: w.matches,
                    confidence: w.confidence
                })),
                openings: openings.map(o => ({
                    type: o.element,
                    count: o.measurement,
                    confidence: o.confidence
                }))
            }, null, 2));
            
            console.log(`   • Summary: ${summaryPath}`);
            
        } else {
            console.log('\n❌ Analysis failed');
        }
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('✅ COMPLETE - Real plan analyzed with pixel-precise tiles!');
    console.log('═'.repeat(80) + '\n');
}

// Run on server
if (process.argv.includes('--server')) {
    console.log('Running on server...');
}

// Execute
main().catch(console.error);
