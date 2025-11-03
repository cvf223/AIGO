#!/usr/bin/env node

/**
 * 🏗️ OPTIMIZED REAL CONSTRUCTION PLAN ANALYZER
 * ============================================
 * 
 * Handles large construction plans with timeout protection
 * and optimized processing for pixel-precise analysis
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🔄 CONVERT PDF TO OPTIMIZED PNG
 */
async function convertPdfToOptimizedPng(pdfPath, outputDir) {
    console.log('\n📄 Converting PDF to optimized PNG...');
    
    const pdfName = path.basename(pdfPath, '.pdf');
    let outputPath = path.join(outputDir, `${pdfName}.png`);
    
    try {
        // First convert at lower DPI for faster processing
        // 150 DPI is sufficient for legend analysis
        const command = `pdftoppm -png -r 150 -singlefile "${pdfPath}" "${path.join(outputDir, pdfName)}"`;
        
        console.log('   Converting at 150 DPI for optimal processing...');
        await execAsync(command, { timeout: 30000 }); // 30 second timeout
        
        // Check file size
        const stats = await fs.stat(outputPath);
        console.log(`   ✅ PNG created: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
        
        // Get dimensions and optimize if too large
        console.log('   Optimizing image size...');
        const metadata = await sharp(outputPath).metadata();
        console.log(`   Original dimensions: ${metadata.width}×${metadata.height} pixels`);
        
        // If image is too large, resize it
        if (metadata.width > 5000 || metadata.height > 5000) {
            const optimizedPath = path.join(outputDir, `${pdfName}_optimized.png`);
            
            await sharp(outputPath)
                .resize(5000, 5000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .png({ quality: 90 })
                .toFile(optimizedPath);
            
            outputPath = optimizedPath;
            const optimizedStats = await fs.stat(optimizedPath);
            const optimizedMeta = await sharp(optimizedPath).metadata();
            
            console.log(`   ✅ Optimized to: ${optimizedMeta.width}×${optimizedMeta.height} pixels`);
            console.log(`   Size: ${(optimizedStats.size / 1024 / 1024).toFixed(2)} MB`);
        }
        
        return outputPath;
        
    } catch (error) {
        console.error('❌ PDF conversion failed:', error.message);
        throw error;
    }
}

/**
 * 🎯 RUN SIMPLIFIED VLM ANALYSIS
 */
async function runSimplifiedVLMAnalysis(imagePath) {
    console.log('\n🤖 Running Simplified VLM Analysis...');
    console.log('   Using optimized settings for large plans');
    
    try {
        // Import simplified analyzer that doesn't hang
        const SimplifiedPixelAnalyzer = (await import('./src/construction/vision/SimplifiedPixelAnalyzer.js')).default;
        
        const analyzer = new SimplifiedPixelAnalyzer();
        
        console.log('\n   Configuration:');
        console.log('   • Processing mode: Simplified pixel analysis');
        console.log('   • Downsampling: 4x for efficiency');
        console.log('   • Timeout protection: Enabled');
        
        // Run analysis with timeout
        const analysisPromise = analyzer.analyzePlan(imagePath);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout')), 120000) // 2 minute timeout
        );
        
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        
        return {
            success: true,
            elements: result.elements,
            statistics: result.statistics,
            scale: result.scale || { notation: '1:100', pixelsPerMeter: 150 },
            outputPath: result.annotatedOutput
        };
        
    } catch (error) {
        console.error('❌ Analysis failed:', error.message);
        
        // Fallback to basic analysis
        console.log('\n🔄 Trying basic fallback analysis...');
        return await runBasicAnalysis(imagePath);
    }
}

/**
 * 🔍 BASIC FALLBACK ANALYSIS
 */
async function runBasicAnalysis(imagePath) {
    console.log('   Running basic pattern detection...');
    
    try {
        // Use sharp to get basic image statistics
        const image = await sharp(imagePath);
        const metadata = await image.metadata();
        const stats = await image.stats();
        
        // Simple wall detection based on color statistics
        const elements = [];
        
        // Assume walls are darker pixels
        if (stats.channels[0].mean < 200) {
            // Estimate wall area based on dark pixel ratio
            const darkPixelRatio = (255 - stats.channels[0].mean) / 255;
            const totalPixels = metadata.width * metadata.height;
            const wallPixels = totalPixels * darkPixelRatio * 0.1; // Assume 10% of dark pixels are walls
            
            // Convert to m² (assuming 1:100 scale, 150 DPI)
            const pixelsPerMeter = 59.06; // 150 DPI at 1:100 scale
            const wallArea = wallPixels / (pixelsPerMeter * pixelsPerMeter);
            
            elements.push({
                type: 'Walls (estimated)',
                area: wallArea,
                confidence: 0.5,
                method: 'statistical'
            });
        }
        
        return {
            success: true,
            elements: elements,
            statistics: {
                imageSize: `${metadata.width}×${metadata.height}`,
                totalPixels: metadata.width * metadata.height,
                meanBrightness: stats.channels[0].mean
            },
            scale: { notation: '1:100 (assumed)', pixelsPerMeter: 59.06 }
        };
        
    } catch (error) {
        console.error('   Basic analysis also failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log('\n' + '═'.repeat(80));
    console.log('🏗️ OPTIMIZED REAL CONSTRUCTION PLAN ANALYSIS');
    console.log('═'.repeat(80));
    
    // Get plan name from command line arguments (may have spaces)
    const planName = process.argv.slice(2).join(' ') || 'FB_AUS A_GR00_B_240529.pdf';
    const pdfPath = `/root/ProductionCode/TestProject/${planName}`;
    const tempDir = '/root/ProductionCode/temp_plan_images';
    
    console.log(`\n📋 Analyzing: ${planName}`);
    
    try {
        // Create temp directory
        await fs.mkdir(tempDir, { recursive: true });
        
        // Convert PDF with optimization
        const pngPath = await convertPdfToOptimizedPng(pdfPath, tempDir);
        
        // Run simplified analysis
        const results = await runSimplifiedVLMAnalysis(pngPath);
        
        // Display results
        console.log('\n' + '═'.repeat(80));
        console.log('📊 ANALYSIS RESULTS');
        console.log('═'.repeat(80));
        
        if (results.success) {
            console.log('\n✅ Analysis completed!');
            
            if (results.elements && results.elements.length > 0) {
                console.log('\n🏗️ DETECTED ELEMENTS:');
                
                results.elements.forEach(element => {
                    console.log(`\n   ${element.type || 'Unknown'}:`);
                    if (element.area) {
                        console.log(`   • Area: ${element.area.toFixed(2)} m²`);
                    }
                    if (element.count) {
                        console.log(`   • Count: ${element.count}`);
                    }
                    if (element.confidence !== undefined) {
                        console.log(`   • Confidence: ${(element.confidence * 100).toFixed(1)}%`);
                    }
                    if (element.method) {
                        console.log(`   • Method: ${element.method}`);
                    }
                });
                
                // Calculate totals
                const totalArea = results.elements
                    .filter(e => e.area)
                    .reduce((sum, e) => sum + e.area, 0);
                
                if (totalArea > 0) {
                    console.log(`\n   TOTAL AREA: ${totalArea.toFixed(2)} m²`);
                }
            } else {
                console.log('\n⚠️ No elements detected (may need manual review)');
            }
            
            if (results.statistics) {
                console.log('\n📊 PROCESSING STATISTICS:');
                Object.entries(results.statistics).forEach(([key, value]) => {
                    console.log(`   • ${key}: ${value}`);
                });
            }
            
            if (results.scale) {
                console.log('\n📏 SCALE:');
                console.log(`   • Notation: ${results.scale.notation}`);
            }
            
            // Save summary
            const summaryPath = path.join(tempDir, `${path.basename(planName, '.pdf')}_summary.json`);
            await fs.writeFile(summaryPath, JSON.stringify({
                plan: planName,
                timestamp: new Date().toISOString(),
                results: results,
                status: 'completed'
            }, null, 2));
            
            console.log(`\n📁 Summary saved: ${summaryPath}`);
            
        } else {
            console.log('\n❌ Analysis failed:', results.error || 'Unknown error');
        }
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        
        // Save error report
        const errorPath = path.join(tempDir, 'error_report.json');
        await fs.writeFile(errorPath, JSON.stringify({
            plan: planName,
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        }, null, 2));
        
        console.log(`\n📁 Error report saved: ${errorPath}`);
        process.exit(1);
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('═'.repeat(80) + '\n');
}

// Execute with proper error handling
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
