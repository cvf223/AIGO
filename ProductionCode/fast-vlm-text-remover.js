#!/usr/bin/env node

/**
 * ⚡ FAST VLM TEXT REMOVER
 * =========================
 * 
 * OPTIMIZED VERSION:
 * - Downsamples image to 1024px for VLM (way faster!)
 * - Scales text positions back to original size
 * - Removes text from full resolution image
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Fast & Working
 */

import sharp from 'sharp';
import ollama from 'ollama';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * ⚡ FAST TEXT REMOVAL
 */
export async function fastRemoveText(imagePath) {
    console.log('\n⚡ FAST VLM TEXT REMOVAL');
    console.log('Optimized for speed with image downsampling');
    console.log('═'.repeat(70));
    
    const startTime = Date.now();
    
    // Load original image
    const originalImage = await sharp(imagePath);
    const originalMeta = await originalImage.metadata();
    const { width, height } = originalMeta;
    
    console.log(`\n📐 Original: ${width}×${height}px`);
    
    // Downsample for VLM (max 1024px)
    const maxDimension = 1024;
    const scale = maxDimension / Math.max(width, height);
    const smallWidth = Math.round(width * scale);
    const smallHeight = Math.round(height * scale);
    
    console.log(`📉 Downsampling to: ${smallWidth}×${smallHeight}px for VLM`);
    
    const smallImagePath = imagePath.replace('.png', '_SMALL.png');
    await sharp(imagePath)
        .resize(smallWidth, smallHeight, {
            fit: 'inside'
        })
        .toFile(smallImagePath);
    
    // Convert to base64
    const imageBuffer = await fs.readFile(smallImagePath);
    const base64Image = imageBuffer.toString('base64');
    
    console.log('\n🤖 Asking llava:34b for text regions...');
    
    const prompt = `Analyze this construction floor plan. Identify ALL text and numbers.

Respond with JSON array only:
[{"text":"content","x":0.0-1.0,"y":0.0-1.0,"width":0.05,"height":0.02}]

Be brief - just return the JSON.`;

    try {
        const response = await ollama.generate({
            model: 'llava:34b',
            prompt: prompt,
            images: [base64Image],
            options: {
                temperature: 0.1,
                num_predict: 500 // Shorter response = faster
            }
        });
        
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`   ✅ VLM responded in ${elapsed}s`);
        
        // Parse regions
        const textRegions = parseTextRegions(response.response, width, height);
        console.log(`   Found ${textRegions.length} text regions`);
        
        // Clean original image
        console.log('\n🧹 Removing text from original resolution...');
        const cleanedPath = await removeTextFromOriginal(
            imagePath, textRegions
        );
        
        // Save text data
        const dataPath = imagePath.replace('.png', '_text_data.json');
        await fs.writeFile(dataPath, JSON.stringify({
            textRegions,
            count: textRegions.length,
            originalSize: { width, height },
            vlmSize: { width: smallWidth, height: smallHeight },
            scaleUsed: scale,
            processingTime: elapsed
        }, null, 2));
        
        console.log(`   ✅ Clean image: ${path.basename(cleanedPath)}`);
        console.log(`   ✅ Text data: ${path.basename(dataPath)}`);
        
        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log('\n' + '═'.repeat(70));
        console.log('✅ TEXT REMOVAL COMPLETE');
        console.log('═'.repeat(70));
        console.log(`\n⏱️ Total time: ${totalTime}s`);
        console.log(`📊 Removed ${textRegions.length} text regions`);
        console.log(`📁 Clean image ready for analysis!\n`);
        
        return {
            cleanedPath,
            dataPath,
            textRegions
        };
        
    } catch (error) {
        console.error('❌ VLM Error:', error.message);
        return null;
    }
}

/**
 * 📝 PARSE TEXT REGIONS
 */
function parseTextRegions(response, imageWidth, imageHeight) {
    const regions = [];
    
    try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const json = JSON.parse(jsonMatch[0]);
            
            for (const item of json) {
                if (item.x !== undefined && item.y !== undefined) {
                    regions.push({
                        text: item.text || '',
                        x: item.x,
                        y: item.y,
                        width: item.width || 0.05,
                        height: item.height || 0.02,
                        pixelX: Math.floor(item.x * imageWidth),
                        pixelY: Math.floor(item.y * imageHeight),
                        pixelWidth: Math.floor((item.width || 0.05) * imageWidth),
                        pixelHeight: Math.floor((item.height || 0.02) * imageHeight)
                    });
                }
            }
        }
    } catch (error) {
        console.log(`   ⚠️ Parse error: ${error.message}`);
    }
    
    return regions;
}

/**
 * 🧹 REMOVE TEXT FROM ORIGINAL
 */
async function removeTextFromOriginal(imagePath, textRegions) {
    const image = await sharp(imagePath);
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    const { width, height, channels } = info;
    const cleanedData = Buffer.from(data);
    
    // Remove each text region
    for (const region of textRegions) {
        const padding = 5;
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
    
    // Save
    const cleanedPath = imagePath.replace('.png', '_FAST_VLM_CLEAN.png');
    
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
        console.error('Usage: node fast-vlm-text-remover.js <image-path>');
        process.exit(1);
    }
    
    const result = await fastRemoveText(planPath);
    
    if (result) {
        console.log('🎉 SUCCESS! Text removed with positions saved.');
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
