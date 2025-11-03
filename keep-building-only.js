#!/usr/bin/env node

/**
 * 🏗️ KEEP BUILDING ONLY (INVERTED LOGIC)
 * ========================================
 * 
 * EXPLICIT LOGIC THAT CAN'T BE BACKWARDS:
 * 1. Start with WHITE canvas
 * 2. COPY ONLY building pixels (walls, patterns)
 * 3. Everything else stays white (text disappears)
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Cannot Get This Backwards
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🏗️ KEEP BUILDING PIXELS ONLY
 */
async function keepBuildingOnly(imagePath) {
    console.log('\n🏗️ KEEP BUILDING ONLY');
    console.log('Explicit: WHITE canvas + COPY building pixels');
    console.log('═'.repeat(60));
    
    const startTime = Date.now();
    
    // Load image
    const image = await sharp(imagePath);
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    console.log(`\n📐 Input: ${width}×${height}px`);
    
    // Create WHITE output buffer
    console.log('\n🎨 Creating white canvas...');
    const output = Buffer.alloc(width * height * channels);
    for (let i = 0; i < output.length; i++) {
        output[i] = 255; // ALL WHITE
    }
    
    // COPY ONLY BUILDING PIXELS
    console.log('🏗️ Copying ONLY building pixels...');
    console.log('   Building = walls (dark) + patterns (gray)');
    
    let buildingPixels = 0;
    let textPixels = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * channels;
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            
            // BUILDING PIXELS:
            // - Walls: very dark (< 50)
            // - Patterns: gray with texture (50-200)
            
            const isWall = gray < 50;
            const isPattern = gray >= 50 && gray < 200 && hasTexture(data, width, height, channels, x, y);
            
            if (isWall || isPattern) {
                // This is BUILDING - COPY IT
                output[idx] = data[idx];
                output[idx + 1] = data[idx + 1];
                output[idx + 2] = data[idx + 2];
                buildingPixels++;
            } else {
                // NOT building (text, white space) - stays WHITE
                textPixels++;
            }
        }
        
        if (y % 500 === 0) {
            process.stdout.write(`\r   Processing: ${((y/height)*100).toFixed(0)}%`);
        }
    }
    
    console.log('\r   Processing: 100%    ');
    
    console.log(`\n📊 Results:`);
    console.log(`   Building pixels copied: ${buildingPixels.toLocaleString()}`);
    console.log(`   Non-building (removed): ${textPixels.toLocaleString()}`);
    console.log(`   Building ratio: ${(buildingPixels/(width*height)*100).toFixed(1)}%`);
    
    // Save
    const outputPath = imagePath.replace('.png', '_KEEP_BUILDING.png');
    
    await sharp(output, {
        raw: { width, height, channels }
    })
    .png()
    .toFile(outputPath);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '═'.repeat(60));
    console.log('✅ KEEP BUILDING COMPLETE');
    console.log('═'.repeat(60));
    console.log(`\n⏱️ Time: ${duration}s`);
    console.log(`📁 Output: ${path.basename(outputPath)}`);
    console.log(`\n🎯 This file should show:`);
    console.log(`   ✅ Building floor plan (walls, rooms, patterns)`);
    console.log(`   ✅ White background`);
    console.log(`   ❌ NO text/numbers (removed)\n`);
    
    return outputPath;
}

/**
 * 🔍 HAS TEXTURE
 */
function hasTexture(data, width, height, channels, x, y) {
    // Check if pixel has pattern texture around it
    let variationCount = 0;
    
    const checkRadius = 3;
    
    for (let dy = -checkRadius; dy <= checkRadius; dy++) {
        for (let dx = -checkRadius; dx <= checkRadius; dx++) {
            if (dx === 0 && dy === 0) continue;
            
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (y * width + x) * channels;
                const nIdx = (ny * width + nx) * channels;
                
                const centerGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const neighborGray = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
                
                // Pattern has variations
                if (Math.abs(centerGray - neighborGray) > 30) {
                    variationCount++;
                }
            }
        }
    }
    
    // Has texture if multiple variations in neighborhood
    return variationCount > 5;
}

/**
 * 🚀 MAIN
 */
async function main() {
    const planPath = process.argv[2] || 'production_results/FB_AUS A_GR00_B_240529.png';
    
    try {
        const result = await keepBuildingOnly(planPath);
        
        console.log('🎉 EXPLICIT LOGIC COMPLETE!');
        console.log('   Started with white canvas');
        console.log('   Copied ONLY building pixels');
        console.log('   Text automatically disappeared\n');
        
        console.log('📋 NEXT STEP:');
        console.log('   Visually verify the output shows the building');
        console.log('   If it STILL shows text instead, the pixel');
        console.log('   classification logic is fundamentally broken.\n');
        
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
