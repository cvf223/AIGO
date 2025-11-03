#!/usr/bin/env node

/**
 * 🔲 TILED VLM TEXT REMOVER
 * ==========================
 * 
 * Uses existing tile system (672×672px) for llava:34b
 * - Splits image into manageable tiles
 * - Analyzes each tile for text
 * - Keeps full resolution detail
 * - Fast processing (parallel tiles possible)
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Tile-Based Text Removal
 */

import sharp from 'sharp';
import ollama from 'ollama';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optimal tile size for llava:34b
const TILE_SIZE = 672;
const TILE_OVERLAP = 64;

/**
 * 🔲 TILED TEXT REMOVAL
 */
export async function tiledTextRemoval(imagePath) {
    console.log('\n🔲 TILED VLM TEXT REMOVAL');
    console.log('Using 672×672px tiles optimized for llava:34b');
    console.log('═'.repeat(70));
    
    const startTime = Date.now();
    
    // Load image
    const image = await sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    console.log(`\n📐 Image: ${width}×${height}px`);
    
    // Calculate tile grid
    const tilesX = Math.ceil(width / (TILE_SIZE - TILE_OVERLAP));
    const tilesY = Math.ceil(height / (TILE_SIZE - TILE_OVERLAP));
    const totalTiles = tilesX * tilesY;
    
    console.log(`🔲 Tile grid: ${tilesX}×${tilesY} = ${totalTiles} tiles`);
    console.log(`   Tile size: ${TILE_SIZE}×${TILE_SIZE}px`);
    console.log(`   Overlap: ${TILE_OVERLAP}px\n`);
    
    // Process tiles
    console.log('🤖 Processing tiles with llava:34b...');
    
    const allTextRegions = [];
    let processedTiles = 0;
    
    for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
            const tileX = tx * (TILE_SIZE - TILE_OVERLAP);
            const tileY = ty * (TILE_SIZE - TILE_OVERLAP);
            const tileWidth = Math.min(TILE_SIZE, width - tileX);
            const tileHeight = Math.min(TILE_SIZE, height - tileY);
            
            processedTiles++;
            
            console.log(`\n   📍 Tile ${processedTiles}/${totalTiles} at position (${tileX}, ${tileY})`);
            console.log(`      Size: ${tileWidth}×${tileHeight}px`);
            
            // Extract tile
            const tileBuffer = await sharp(imagePath)
                .extract({
                    left: tileX,
                    top: tileY,
                    width: tileWidth,
                    height: tileHeight
                })
                .toBuffer();
            
            console.log('      🤖 Analyzing with llava:34b...');
            
            // Analyze tile with VLM
            const tileTextRegions = await analyzetileForText(
                tileBuffer, tileX, tileY, tileWidth, tileHeight, width, height
            );
            
            console.log(`      ✅ Found ${tileTextRegions.length} text regions in this tile`);
            
            allTextRegions.push(...tileTextRegions);
            
            console.log(`      ✓ Moving to next tile...`);
        }
    }
    
    console.log(`\n   ✅ Found ${allTextRegions.length} text regions across all tiles`);
    
    // Remove duplicates (from overlapping tiles)
    const uniqueRegions = removeDuplicates(allTextRegions);
    console.log(`   ✅ After deduplication: ${uniqueRegions.length} unique regions`);
    
    // Remove text from original image
    console.log('\n🧹 Removing text from image...');
    const cleanedPath = await removeTextRegions(
        imagePath, uniqueRegions
    );
    
    // Save text data
    const dataPath = imagePath.replace('.png', '_tiled_text_data.json');
    await fs.writeFile(dataPath, JSON.stringify({
        textRegions: uniqueRegions,
        totalRegions: uniqueRegions.length,
        imageSize: { width, height },
        tileSize: TILE_SIZE,
        tilesProcessed: totalTiles,
        processingTime: ((Date.now() - startTime) / 1000).toFixed(1)
    }, null, 2));
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ TILED TEXT REMOVAL COMPLETE');
    console.log('═'.repeat(70));
    console.log(`\n⏱️ Total time: ${totalTime}s`);
    console.log(`📊 Removed ${uniqueRegions.length} text regions`);
    console.log(`📁 Clean image: ${path.basename(cleanedPath)}`);
    console.log(`📁 Text data: ${path.basename(dataPath)}\n`);
    
    return {
        cleanedPath,
        dataPath,
        textRegions: uniqueRegions
    };
}

/**
 * 🔍 ANALYZE TILE FOR TEXT
 */
async function analyzetileForText(tileBuffer, offsetX, offsetY, tileWidth, tileHeight, imageWidth, imageHeight) {
    const base64Tile = tileBuffer.toString('base64');
    
    const prompt = `This is a ${tileWidth}×${tileHeight}px tile from a construction plan.

Find ALL text/numbers. Return JSON array:
[{"text":"content","x":0.0-1.0,"y":0.0-1.0,"w":0.05,"h":0.02}]

x,y,w,h are RELATIVE to this tile (0.0-1.0).
Just return JSON, nothing else.`;

    try {
        const response = await ollama.generate({
            model: 'llava:34b',
            prompt: prompt,
            images: [base64Tile],
            options: {
                temperature: 0.1,
                num_predict: 300
            }
        });
        
        // Parse and convert to absolute image coordinates
        const tileRegions = parseTextRegions(response.response);
        const absoluteRegions = [];
        
        for (const region of tileRegions) {
            absoluteRegions.push({
                text: region.text,
                x: region.x,
                y: region.y,
                width: region.w || region.width || 0.05,
                height: region.h || region.height || 0.02,
                pixelX: offsetX + Math.floor(region.x * tileWidth),
                pixelY: offsetY + Math.floor(region.y * tileHeight),
                pixelWidth: Math.floor((region.w || region.width || 0.05) * tileWidth),
                pixelHeight: Math.floor((region.h || region.height || 0.02) * tileHeight)
            });
        }
        
        return absoluteRegions;
        
    } catch (error) {
        console.error(`\n   ⚠️ Tile analysis error: ${error.message}`);
        return [];
    }
}

/**
 * 📝 PARSE TEXT REGIONS
 */
function parseTextRegions(response) {
    try {
        const jsonMatch = response.match(/\[[\s\S]*?\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
    } catch (error) {
        // Parse failed
    }
    
    return [];
}

/**
 * 🔗 REMOVE DUPLICATES
 */
function removeDuplicates(regions) {
    const unique = [];
    const tolerance = 10; // 10 pixel tolerance
    
    for (const region of regions) {
        let isDuplicate = false;
        
        for (const existing of unique) {
            const dx = Math.abs(region.pixelX - existing.pixelX);
            const dy = Math.abs(region.pixelY - existing.pixelY);
            
            if (dx < tolerance && dy < tolerance) {
                isDuplicate = true;
                break;
            }
        }
        
        if (!isDuplicate) {
            unique.push(region);
        }
    }
    
    return unique;
}

/**
 * 🧹 REMOVE TEXT REGIONS
 */
async function removeTextRegions(imagePath, textRegions) {
    const image = await sharp(imagePath);
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    const cleanedData = Buffer.from(data);
    
    for (const region of textRegions) {
        const padding = 3;
        const minX = Math.max(0, region.pixelX - padding);
        const maxX = Math.min(width, region.pixelX + region.pixelWidth + padding);
        const minY = Math.max(0, region.pixelY - padding);
        const maxY = Math.min(height, region.pixelY + region.pixelHeight + padding);
        
        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                const idx = (y * width + x) * channels;
                cleanedData[idx] = 255;
                cleanedData[idx + 1] = 255;
                cleanedData[idx + 2] = 255;
            }
        }
    }
    
    const cleanedPath = imagePath.replace('.png', '_TILED_VLM_CLEAN.png');
    
    await sharp(cleanedData, {
        raw: { width, height, channels }
    })
    .png()
    .toFile(cleanedPath);
    
    return cleanedPath;
}

/**
 * 🚀 MAIN
 */
async function main() {
    const planPath = process.argv[2];
    
    if (!planPath) {
        console.error('Usage: node tiled-vlm-text-remover.js <image-path>');
        process.exit(1);
    }
    
    const result = await tiledTextRemoval(planPath);
    
    if (result) {
        console.log('🎉 Tile-based text removal complete!');
        console.log('   Full resolution preserved');
        console.log('   Text positions saved for later annotation\n');
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
