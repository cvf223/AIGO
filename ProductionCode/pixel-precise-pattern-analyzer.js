#!/usr/bin/env node

/**
 * 🎯 PIXEL-PRECISE PATTERN ANALYZER
 * =================================
 * 
 * Detects and colors ONLY the actual pattern pixels,
 * not bounding boxes. Filters out simple lines.
 * 
 * @author Elite Construction AI Syndicate
 * @version 8.0.0 - Pixel-Precise Pattern Detection
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🎯 PIXEL-PRECISE ANALYSIS
 */
async function analyzePrecise(imagePath) {
    console.log('\n🎯 PIXEL-PRECISE PATTERN ANALYZER');
    console.log('==================================');
    
    // Load image
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;
    
    // Get raw pixel data
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    console.log(`📐 Image size: ${width}×${height}`);
    
    // Define building area (avoid margins with text/dimensions)
    const buildingArea = {
        x: Math.floor(width * 0.22),
        y: Math.floor(height * 0.15),
        width: Math.floor(width * 0.56),
        height: Math.floor(height * 0.65)
    };
    
    console.log(`🏢 Building area: ${buildingArea.width}×${buildingArea.height}`);
    
    // Create pixel classification map
    const pixelMap = new Uint8Array(width * height);
    const EMPTY = 0, WALL_CONCRETE = 1, WALL_MASONRY = 2, WALL_INSULATION = 3, 
          OPENING = 4, LINE = 5, TEXT = 6;
    
    // Analyze each pixel in building area
    console.log('\n🔍 Analyzing pixels...');
    let analyzedPixels = 0;
    const totalPixels = buildingArea.width * buildingArea.height;
    const channels = info.channels;
    
    for (let y = buildingArea.y; y < buildingArea.y + buildingArea.height; y++) {
        for (let x = buildingArea.x; x < buildingArea.x + buildingArea.width; x++) {
            const pixelIndex = y * width + x;
            const dataIndex = pixelIndex * channels;
            
            const r = data[dataIndex];
            const g = data[dataIndex + 1] || r;
            const b = data[dataIndex + 2] || r;
            
            // Classify pixel
            const classification = classifyPixel(r, g, b, x, y, data, width, height, channels);
            pixelMap[pixelIndex] = classification;
            
            analyzedPixels++;
            if (analyzedPixels % 100000 === 0) {
                const progress = (analyzedPixels / totalPixels * 100).toFixed(1);
                process.stdout.write(`\r   Progress: ${progress}%`);
            }
        }
    }
    
    console.log('\r   Progress: 100%    ');
    
    // Filter out thin lines (not walls)
    console.log('\n🚫 Filtering out thin lines...');
    filterThinLines(pixelMap, width, height, buildingArea);
    
    // Group connected pixels into elements
    console.log('👥 Grouping connected patterns...');
    const elements = findConnectedElements(pixelMap, width, height, buildingArea);
    
    // Calculate areas
    const scale = 50; // 1:50
    const pixelsPerMeter = 150 / scale * 39.37 / 12;
    const squareMetersPerPixel = 1 / (pixelsPerMeter * pixelsPerMeter);
    
    // Summarize results
    const summary = {};
    for (const element of elements) {
        if (!summary[element.type]) {
            summary[element.type] = { count: 0, pixels: 0, area: 0 };
        }
        summary[element.type].count++;
        summary[element.type].pixels += element.pixels.length;
        summary[element.type].area += element.pixels.length * squareMetersPerPixel;
    }
    
    return {
        pixelMap,
        elements,
        summary,
        buildingArea,
        width,
        height,
        scale
    };
}

/**
 * 🔍 CLASSIFY INDIVIDUAL PIXEL
 */
function classifyPixel(r, g, b, x, y, data, width, height, channels) {
    const gray = (r + g + b) / 3;
    
    // White/empty
    if (gray > 245) return 0; // EMPTY
    
    // Check neighborhood context
    const neighbors = getNeighborStats(x, y, data, width, height, channels);
    
    // Text (isolated dark pixels)
    if (neighbors.darkCount < 3 && gray < 100) return 6; // TEXT
    
    // Thin line (dark but narrow)
    if (neighbors.continuity < 0.3 && gray < 150) return 5; // LINE
    
    // Wall patterns based on darkness and texture
    if (gray < 80 && neighbors.darkCount > 6) {
        // Very dark, continuous = concrete
        return 1; // WALL_CONCRETE
    } else if (gray >= 80 && gray < 140 && neighbors.darkCount > 5) {
        // Medium dark = masonry
        return 2; // WALL_MASONRY
    } else if (gray >= 140 && gray < 200 && neighbors.pattern > 0.3) {
        // Light with pattern = insulation
        return 3; // WALL_INSULATION
    } else if (gray < 200 && neighbors.darkCount >= 2 && neighbors.darkCount <= 4) {
        // Sparse dark = opening
        return 4; // OPENING
    }
    
    return 0; // EMPTY
}

/**
 * 📊 GET NEIGHBOR STATISTICS
 */
function getNeighborStats(x, y, data, width, height, channels) {
    let darkCount = 0;
    let totalCount = 0;
    let variance = 0;
    let prevGray = -1;
    
    // Check 3x3 neighborhood
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * channels;
                const gray = (data[idx] + (data[idx + 1] || data[idx]) + 
                             (data[idx + 2] || data[idx])) / 3;
                
                if (gray < 180) darkCount++;
                totalCount++;
                
                if (prevGray >= 0) {
                    variance += Math.abs(gray - prevGray);
                }
                prevGray = gray;
            }
        }
    }
    
    return {
        darkCount,
        continuity: darkCount / Math.max(totalCount, 1),
        pattern: variance / Math.max(totalCount - 1, 1) / 255
    };
}

/**
 * 🚫 FILTER OUT THIN LINES
 */
function filterThinLines(pixelMap, width, height, buildingArea) {
    const MIN_THICKNESS = 8; // Minimum pixels thick to be a wall
    
    for (let y = buildingArea.y; y < buildingArea.y + buildingArea.height; y++) {
        for (let x = buildingArea.x; x < buildingArea.x + buildingArea.width; x++) {
            const idx = y * width + x;
            
            // Check if this is classified as a wall
            if (pixelMap[idx] >= 1 && pixelMap[idx] <= 3) {
                // Check thickness in both directions
                let hThickness = 1, vThickness = 1;
                
                // Horizontal thickness
                for (let dx = 1; dx < MIN_THICKNESS && x + dx < width; dx++) {
                    if (pixelMap[y * width + x + dx] === pixelMap[idx]) hThickness++;
                    else break;
                }
                for (let dx = 1; dx < MIN_THICKNESS && x - dx >= 0; dx++) {
                    if (pixelMap[y * width + x - dx] === pixelMap[idx]) hThickness++;
                    else break;
                }
                
                // Vertical thickness
                for (let dy = 1; dy < MIN_THICKNESS && y + dy < height; dy++) {
                    if (pixelMap[(y + dy) * width + x] === pixelMap[idx]) vThickness++;
                    else break;
                }
                for (let dy = 1; dy < MIN_THICKNESS && y - dy >= 0; dy++) {
                    if (pixelMap[(y - dy) * width + x] === pixelMap[idx]) vThickness++;
                    else break;
                }
                
                // If too thin in both directions, it's a line not a wall
                if (hThickness < MIN_THICKNESS && vThickness < MIN_THICKNESS) {
                    pixelMap[idx] = 5; // Reclassify as LINE
                }
            }
        }
    }
}

/**
 * 🔗 FIND CONNECTED ELEMENTS
 */
function findConnectedElements(pixelMap, width, height, buildingArea) {
    const visited = new Uint8Array(width * height);
    const elements = [];
    const typeNames = ['empty', 'Stahlbeton', 'MW KS', 'Dämmung', 'Opening', 'Line', 'Text'];
    
    for (let y = buildingArea.y; y < buildingArea.y + buildingArea.height; y++) {
        for (let x = buildingArea.x; x < buildingArea.x + buildingArea.width; x++) {
            const idx = y * width + x;
            
            // Skip if already visited or empty/line/text
            if (visited[idx] || pixelMap[idx] === 0 || pixelMap[idx] >= 5) continue;
            
            // Flood fill to find connected component
            const pixels = [];
            const stack = [{ x, y }];
            const type = pixelMap[idx];
            
            while (stack.length > 0) {
                const pos = stack.pop();
                const pidx = pos.y * width + pos.x;
                
                if (visited[pidx] || pixelMap[pidx] !== type) continue;
                
                visited[pidx] = 1;
                pixels.push({ x: pos.x, y: pos.y });
                
                // Add neighbors
                if (pos.x > 0) stack.push({ x: pos.x - 1, y: pos.y });
                if (pos.x < width - 1) stack.push({ x: pos.x + 1, y: pos.y });
                if (pos.y > 0) stack.push({ x: pos.x, y: pos.y - 1 });
                if (pos.y < height - 1) stack.push({ x: pos.x, y: pos.y + 1 });
                
                // Limit to prevent memory issues
                if (pixels.length > 100000) break;
            }
            
            // Only keep significant elements (min 100 pixels)
            if (pixels.length >= 100) {
                elements.push({
                    type: typeNames[type],
                    category: type <= 3 ? 'wall' : 'opening',
                    pixels: pixels,
                    bounds: calculateBounds(pixels)
                });
            }
        }
    }
    
    return elements;
}

/**
 * 📐 CALCULATE BOUNDS
 */
function calculateBounds(pixels) {
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const p of pixels) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    }
    
    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1
    };
}

/**
 * 🎨 CREATE PIXEL-PRECISE VISUALIZATION
 */
async function createPreciseVisualization(imagePath, analysis, outputPath) {
    console.log('\n🎨 Creating pixel-precise visualization...');
    
    const { pixelMap, elements, buildingArea, width, height } = analysis;
    
    // Load original image
    const originalBuffer = await sharp(imagePath).raw().toBuffer();
    
    // Create RGBA buffer for output
    const outputBuffer = Buffer.alloc(width * height * 4);
    
    // Copy original image with transparency
    for (let i = 0; i < width * height; i++) {
        const srcIdx = i * 3;
        const dstIdx = i * 4;
        
        // Copy RGB from original
        outputBuffer[dstIdx] = originalBuffer[srcIdx];
        outputBuffer[dstIdx + 1] = originalBuffer[srcIdx + 1] || originalBuffer[srcIdx];
        outputBuffer[dstIdx + 2] = originalBuffer[srcIdx + 2] || originalBuffer[srcIdx];
        outputBuffer[dstIdx + 3] = 255; // Full opacity
    }
    
    // Define colors for each pattern type
    const colors = {
        'Stahlbeton': { r: 139, g: 69, b: 19, a: 180 },    // Brown for concrete
        'MW KS': { r: 255, g: 165, b: 0, a: 180 },         // Orange for masonry
        'Dämmung': { r: 255, g: 105, b: 180, a: 150 },     // Pink for insulation
        'Opening': { r: 0, g: 100, b: 255, a: 120 }        // Blue for openings
    };
    
    // Apply colors ONLY to actual pattern pixels
    for (const element of elements) {
        const color = colors[element.type];
        if (!color) continue;
        
        // Color each pixel of this element
        for (const pixel of element.pixels) {
            const idx = (pixel.y * width + pixel.x) * 4;
            
            // Blend with original using alpha
            const alpha = color.a / 255;
            outputBuffer[idx] = Math.round(outputBuffer[idx] * (1 - alpha) + color.r * alpha);
            outputBuffer[idx + 1] = Math.round(outputBuffer[idx + 1] * (1 - alpha) + color.g * alpha);
            outputBuffer[idx + 2] = Math.round(outputBuffer[idx + 2] * (1 - alpha) + color.b * alpha);
        }
    }
    
    // Draw building area outline
    const outlineColor = { r: 0, g: 0, b: 255, a: 100 };
    for (let x = buildingArea.x; x < buildingArea.x + buildingArea.width; x++) {
        // Top edge
        let idx = (buildingArea.y * width + x) * 4;
        outputBuffer[idx] = outlineColor.r;
        outputBuffer[idx + 1] = outlineColor.g;
        outputBuffer[idx + 2] = outlineColor.b;
        
        // Bottom edge
        idx = ((buildingArea.y + buildingArea.height - 1) * width + x) * 4;
        outputBuffer[idx] = outlineColor.r;
        outputBuffer[idx + 1] = outlineColor.g;
        outputBuffer[idx + 2] = outlineColor.b;
    }
    for (let y = buildingArea.y; y < buildingArea.y + buildingArea.height; y++) {
        // Left edge
        let idx = (y * width + buildingArea.x) * 4;
        outputBuffer[idx] = outlineColor.r;
        outputBuffer[idx + 1] = outlineColor.g;
        outputBuffer[idx + 2] = outlineColor.b;
        
        // Right edge
        idx = (y * width + (buildingArea.x + buildingArea.width - 1)) * 4;
        outputBuffer[idx] = outlineColor.r;
        outputBuffer[idx + 1] = outlineColor.g;
        outputBuffer[idx + 2] = outlineColor.b;
    }
    
    // Save visualization
    await sharp(outputBuffer, {
        raw: {
            width: width,
            height: height,
            channels: 4
        }
    })
    .png()
    .toFile(outputPath);
    
    console.log(`   ✅ Saved to: ${outputPath}`);
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('🎯 PIXEL-PRECISE PATTERN ANALYZER');
    console.log('═'.repeat(60));
    console.log('No bounding boxes - only actual pattern pixels!');
    
    const planPath = process.argv[2];
    if (!planPath) {
        console.error('❌ Please provide a plan image path');
        process.exit(1);
    }
    
    try {
        // Analyze
        const results = await analyzePrecise(planPath);
        
        // Display results
        console.log('\n' + '═'.repeat(60));
        console.log('📊 PIXEL-PRECISE RESULTS');
        console.log('═'.repeat(60));
        
        console.log('\n🏗️ WALLS DETECTED (pixel-precise):');
        if (results.summary['Stahlbeton']) {
            console.log(`   Stahlbeton: ${results.summary['Stahlbeton'].count} groups, ${results.summary['Stahlbeton'].area.toFixed(2)} m²`);
        }
        if (results.summary['MW KS']) {
            console.log(`   MW KS: ${results.summary['MW KS'].count} groups, ${results.summary['MW KS'].area.toFixed(2)} m²`);
        }
        if (results.summary['Dämmung']) {
            console.log(`   Dämmung: ${results.summary['Dämmung'].count} groups, ${results.summary['Dämmung'].area.toFixed(2)} m²`);
        }
        
        const totalWallArea = ['Stahlbeton', 'MW KS', 'Dämmung']
            .reduce((sum, type) => sum + (results.summary[type]?.area || 0), 0);
        console.log(`   TOTAL: ${totalWallArea.toFixed(2)} m²`);
        
        if (results.summary['Opening']) {
            console.log(`\n🚪 OPENINGS: ${results.summary['Opening'].count} detected`);
        }
        
        console.log('\n✨ Key Features:');
        console.log('   • NO bounding boxes - pixel-precise coloring');
        console.log('   • Lines filtered out (min 8px thickness)');
        console.log('   • Each wall layer colored separately');
        console.log('   • Only actual pattern pixels highlighted');
        
        // Create visualization
        const outputPath = path.join(
            path.dirname(planPath),
            path.basename(planPath, path.extname(planPath)) + '_pixel_precise.png'
        );
        await createPreciseVisualization(planPath, results, outputPath);
        
        console.log('\n' + '═'.repeat(60));
        console.log('✅ PIXEL-PRECISE ANALYSIS COMPLETE!');
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
