#!/usr/bin/env node

/**
 * 🏗️ SIMPLE WORKING ANALYZER - ACTUAL DETECTION
 * =============================================
 * 
 * Simplified version that actually detects walls and openings
 * using basic but effective pattern recognition
 * 
 * @author Elite Construction AI Syndicate
 * @version 7.0.0 - Actually Working
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🎯 SIMPLE BUT EFFECTIVE ANALYSIS
 */
async function analyzeSimple(imagePath) {
    console.log('\n🏗️ SIMPLE WORKING ANALYZER');
    console.log('===========================');
    
    // Load image with sharp
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Get raw pixel data
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    console.log(`📐 Image size: ${width}×${height}`);
    
    // Define building area (center 60% to avoid margins)
    const buildingArea = {
        x: Math.floor(width * 0.2),
        y: Math.floor(height * 0.2),
        width: Math.floor(width * 0.6),
        height: Math.floor(height * 0.6)
    };
    
    console.log(`🏢 Analyzing building area: ${buildingArea.width}×${buildingArea.height}`);
    
    // Scan for walls (dark continuous areas)
    const wallElements = [];
    const openingElements = [];
    
    // Use 100px blocks for human-scale detection
    const blockSize = 100;
    const stepSize = 50; // 50% overlap
    const channels = info.channels;
    
    let blocksAnalyzed = 0;
    const totalBlocks = Math.ceil(buildingArea.width / stepSize) * 
                       Math.ceil(buildingArea.height / stepSize);
    
    for (let y = buildingArea.y; y < buildingArea.y + buildingArea.height - blockSize; y += stepSize) {
        for (let x = buildingArea.x; x < buildingArea.x + buildingArea.width - blockSize; x += stepSize) {
            
            // Extract block data from raw buffer
            const blockData = extractBlock(data, x, y, blockSize, blockSize, width, channels);
            const classification = classifyBlock(blockData);
            
            if (classification.type !== 'empty') {
                const element = {
                    type: classification.type,
                    subtype: classification.subtype,
                    x: x,
                    y: y,
                    width: blockSize,
                    height: blockSize,
                    confidence: classification.confidence
                };
                
                if (classification.type === 'wall') {
                    wallElements.push(element);
                } else if (classification.type === 'opening') {
                    openingElements.push(element);
                }
            }
            
            blocksAnalyzed++;
            if (blocksAnalyzed % 100 === 0) {
                const progress = (blocksAnalyzed / totalBlocks * 100).toFixed(1);
                process.stdout.write(`\r   Analyzing: ${progress}%`);
            }
        }
    }
    
    console.log('\r   Analyzing: 100%   ');
    
    // Group nearby elements
    const groupedWalls = groupNearbyElements(wallElements, blockSize);
    const groupedOpenings = groupNearbyElements(openingElements, blockSize);
    
    console.log(`\n✅ Found ${groupedWalls.length} wall groups`);
    console.log(`✅ Found ${groupedOpenings.length} opening groups`);
    
    return {
        walls: groupedWalls,
        openings: groupedOpenings,
        buildingArea: buildingArea,
        scale: 50
    };
}

/**
 * 📦 EXTRACT BLOCK FROM RAW BUFFER
 */
function extractBlock(buffer, x, y, blockWidth, blockHeight, imageWidth, channels) {
    const blockData = [];
    
    for (let dy = 0; dy < blockHeight; dy++) {
        for (let dx = 0; dx < blockWidth; dx++) {
            const pixelIndex = ((y + dy) * imageWidth + (x + dx)) * channels;
            for (let c = 0; c < channels; c++) {
                blockData.push(buffer[pixelIndex + c]);
            }
        }
    }
    
    return { data: Buffer.from(blockData), channels };
}

/**
 * 🔍 CLASSIFY BLOCK
 */
function classifyBlock(blockData) {
    const data = blockData.data;
    const channels = blockData.channels || 3;
    const totalPixels = data.length / channels;
    
    let darkPixels = 0;
    let veryDarkPixels = 0;
    let whitePixels = 0;
    let colorVariance = 0;
    
    // Analyze pixels
    for (let i = 0; i < data.length; i += channels) {
        const r = data[i];
        const g = data[i + 1] || data[i]; // Handle grayscale
        const b = data[i + 2] || data[i]; // Handle grayscale
        const gray = (r + g + b) / 3;
        
        if (gray > 240) {
            whitePixels++;
        } else if (gray < 100) {
            veryDarkPixels++;
            if (gray < 180) darkPixels++;
        } else if (gray < 180) {
            darkPixels++;
        }
        
        // Check color variance (colored elements vs grayscale)
        const variance = Math.abs(r - gray) + Math.abs(g - gray) + Math.abs(b - gray);
        colorVariance += variance;
    }
    
    const darkRatio = darkPixels / totalPixels;
    const veryDarkRatio = veryDarkPixels / totalPixels;
    const whiteRatio = whitePixels / totalPixels;
    const avgColorVariance = colorVariance / totalPixels;
    
    // Classification logic
    if (whiteRatio > 0.95) {
        return { type: 'empty', confidence: 1.0 };
    }
    
    // Walls: continuous dark areas
    if (darkRatio > 0.3 && darkRatio < 0.8) {
        let subtype = 'generic';
        let confidence = 0.7;
        
        if (veryDarkRatio > 0.2) {
            subtype = 'Stahlbeton'; // Concrete (darker)
            confidence = 0.8;
        } else if (darkRatio > 0.4 && darkRatio < 0.6) {
            subtype = 'MW KS'; // Masonry (medium)
            confidence = 0.75;
        } else if (avgColorVariance > 10) {
            subtype = 'Dämmung'; // Insulation (pattern)
            confidence = 0.65;
        }
        
        return { 
            type: 'wall', 
            subtype: subtype,
            confidence: confidence 
        };
    }
    
    // Openings: very sparse dark pixels (outlines)
    if (darkRatio > 0.05 && darkRatio < 0.3 && whiteRatio > 0.5) {
        return { 
            type: 'opening', 
            subtype: darkRatio < 0.15 ? 'Window' : 'Door',
            confidence: 0.6 
        };
    }
    
    return { type: 'empty', confidence: 0.5 };
}

/**
 * 👥 GROUP NEARBY ELEMENTS
 */
function groupNearbyElements(elements, blockSize) {
    if (elements.length === 0) return [];
    
    const groups = [];
    const used = new Set();
    const maxDistance = blockSize * 1.5;
    
    for (let i = 0; i < elements.length; i++) {
        if (used.has(i)) continue;
        
        const group = {
            type: elements[i].subtype || elements[i].type,
            elements: [elements[i]],
            bounds: { ...elements[i] },
            totalConfidence: elements[i].confidence
        };
        
        used.add(i);
        
        // Find nearby elements
        for (let j = i + 1; j < elements.length; j++) {
            if (used.has(j)) continue;
            if (elements[j].subtype !== elements[i].subtype) continue;
            
            const distance = Math.sqrt(
                Math.pow(elements[i].x - elements[j].x, 2) +
                Math.pow(elements[i].y - elements[j].y, 2)
            );
            
            if (distance < maxDistance) {
                group.elements.push(elements[j]);
                group.totalConfidence += elements[j].confidence;
                used.add(j);
                
                // Update bounds
                group.bounds.x = Math.min(group.bounds.x, elements[j].x);
                group.bounds.y = Math.min(group.bounds.y, elements[j].y);
                const maxX = Math.max(group.bounds.x + group.bounds.width, 
                                     elements[j].x + elements[j].width);
                const maxY = Math.max(group.bounds.y + group.bounds.height,
                                     elements[j].y + elements[j].height);
                group.bounds.width = maxX - group.bounds.x;
                group.bounds.height = maxY - group.bounds.y;
            }
        }
        
        group.confidence = group.totalConfidence / group.elements.length;
        groups.push(group);
    }
    
    return groups;
}

/**
 * 🎨 CREATE SIMPLE VISUALIZATION
 */
async function createSimpleVisualization(imagePath, analysis, outputPath) {
    console.log('\n🎨 Creating visualization...');
    
    // Create overlays for visualization
    const overlays = [];
    
    // Building area outline (blue dashed)
    overlays.push({
        input: {
            create: {
                width: analysis.buildingArea.width,
                height: analysis.buildingArea.height,
                channels: 4,
                background: { r: 0, g: 0, b: 255, alpha: 0.3 }
            }
        },
        left: analysis.buildingArea.x,
        top: analysis.buildingArea.y
    });
    
    // Wall overlays
    for (const wall of analysis.walls) {
        const color = wall.type.includes('Stahlbeton') ? { r: 139, g: 69, b: 19, alpha: 0.6 } :
                     wall.type.includes('MW') ? { r: 255, g: 165, b: 0, alpha: 0.6 } :
                     wall.type.includes('Dämmung') ? { r: 255, g: 192, b: 203, alpha: 0.5 } :
                     { r: 128, g: 128, b: 128, alpha: 0.5 };
        
        overlays.push({
            input: {
                create: {
                    width: wall.bounds.width,
                    height: wall.bounds.height,
                    channels: 4,
                    background: color
                }
            },
            left: wall.bounds.x,
            top: wall.bounds.y
        });
    }
    
    // Opening overlays (blue outlines)
    for (const opening of analysis.openings) {
        overlays.push({
            input: {
                create: {
                    width: opening.bounds.width,
                    height: opening.bounds.height,
                    channels: 4,
                    background: { r: 0, g: 0, b: 255, alpha: 0.2 }
                }
            },
            left: opening.bounds.x,
            top: opening.bounds.y
        });
    }
    
    // Create composite image
    await sharp(imagePath)
        .composite(overlays)
        .toFile(outputPath);
    
    console.log(`   ✅ Saved to: ${outputPath}`);
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('🏗️ SIMPLE WORKING ANALYZER - ACTUAL DETECTION');
    console.log('═'.repeat(60));
    
    const planPath = process.argv[2];
    if (!planPath) {
        console.error('❌ Please provide a plan image path');
        process.exit(1);
    }
    
    try {
        // Analyze
        const results = await analyzeSimple(planPath);
        
        // Calculate areas
        const scale = results.scale;
        const pixelsPerMeter = 150 / scale * 39.37 / 12; // 150 DPI conversion
        const squareMetersPerPixel = 1 / (pixelsPerMeter * pixelsPerMeter);
        
        let totalWallArea = 0;
        const wallSummary = {};
        
        for (const wall of results.walls) {
            const pixelArea = wall.bounds.width * wall.bounds.height;
            const areaM2 = pixelArea * squareMetersPerPixel;
            totalWallArea += areaM2;
            
            if (!wallSummary[wall.type]) {
                wallSummary[wall.type] = { count: 0, area: 0 };
            }
            wallSummary[wall.type].count++;
            wallSummary[wall.type].area += areaM2;
        }
        
        // Display results
        console.log('\n' + '═'.repeat(60));
        console.log('📊 ANALYSIS RESULTS');
        console.log('═'.repeat(60));
        
        console.log('\n🏗️ WALLS DETECTED:');
        for (const [type, stats] of Object.entries(wallSummary)) {
            console.log(`   ${type}: ${stats.count} groups, ${stats.area.toFixed(2)} m²`);
        }
        console.log(`   TOTAL: ${totalWallArea.toFixed(2)} m²`);
        
        console.log('\n🚪 OPENINGS DETECTED:');
        const windowCount = results.openings.filter(o => o.type.includes('Window')).length;
        const doorCount = results.openings.filter(o => o.type.includes('Door')).length;
        console.log(`   Windows: ${windowCount}`);
        console.log(`   Doors: ${doorCount}`);
        
        // Create visualization
        const outputPath = path.join(
            path.dirname(planPath),
            path.basename(planPath, path.extname(planPath)) + '_simple_analysis.png'
        );
        await createSimpleVisualization(planPath, results, outputPath);
        
        console.log('\n' + '═'.repeat(60));
        console.log('✅ ANALYSIS COMPLETE - ACTUAL RESULTS!');
        console.log('═'.repeat(60));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
