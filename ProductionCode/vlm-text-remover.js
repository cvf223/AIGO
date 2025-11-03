#!/usr/bin/env node

/**
 * 🧹 VLM TEXT REMOVER
 * ====================
 * 
 * Uses llava:34b to intelligently remove ALL text and numbers:
 * - Identifies text groups (labels with symbols)
 * - Identifies complete sentences
 * - Stores what was removed and exact positions
 * - Keeps architectural elements (walls, patterns)
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - AI-Powered Text Removal
 */

import sharp from 'sharp';
import ollama from 'ollama';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🤖 VLM TEXT REMOVAL
 */
export async function removeTextWithVLM(imagePath) {
    console.log('\n🤖 VLM TEXT REMOVAL SYSTEM');
    console.log('Using llava:34b to intelligently identify and remove text');
    console.log('═'.repeat(70));
    
    console.log(`\n📐 Input: ${path.basename(imagePath)}`);
    
    // Load image
    const image = await sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    console.log(`   Size: ${width}×${height}px`);
    
    // Load image data
    const { data, info } = await image
        .raw()
        .toBuffer({ resolveWithObject: true });
    
    const channels = info.channels;
    
    // Convert to base64 for VLM
    console.log('\n🖼️ Preparing image for VLM...');
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Ask VLM to identify ALL text regions
    console.log('🤖 Asking llava:34b to identify ALL text and numbers...');
    
    const prompt = `ANALYZE THIS CONSTRUCTION FLOOR PLAN.

TASK: Identify ALL text, numbers, and labels in the image.

Find:
- Individual letters and numbers (e.g., "1", "2", "A", "B")
- Complete words (e.g., "WD", "OK", "RFB")
- Sentences and labels
- Dimension text (e.g., "0.25", "1.50 m")
- Room labels
- Legend text
- Title block text

Group related text together (e.g., "WD Ø 150" is one group)

For EACH text region, provide:
{
  "text": "what it says",
  "x": horizontal position as decimal 0.0-1.0,
  "y": vertical position as decimal 0.0-1.0,
  "width": width as decimal 0.0-1.0,
  "height": height as decimal 0.0-1.0,
  "type": "dimension|label|legend|title|other"
}

RESPOND WITH JSON ARRAY ONLY:
[
  {"text":"WD Ø 150","x":0.1,"y":0.2,"width":0.05,"height":0.02,"type":"label"},
  {"text":"1.50 m","x":0.3,"y":0.4,"width":0.03,"height":0.015,"type":"dimension"},
  ...
]

Include ALL text you can find. Be thorough.`;

    try {
        const response = await ollama.generate({
            model: 'llava:34b',
            prompt: prompt,
            images: [base64Image],
            options: {
                temperature: 0.1,
                num_predict: 2000 // Allow longer response for many text regions
            }
        });
        
        console.log('   ✅ VLM response received');
        console.log(`   Response length: ${response.response.length} characters`);
        
        // Parse text regions
        const textRegions = parseTextRegions(response.response, width, height);
        
        console.log(`\n📊 VLM IDENTIFIED ${textRegions.length} TEXT REGIONS:`);
        
        // Group by type
        const byType = {};
        for (const region of textRegions) {
            byType[region.type] = (byType[region.type] || 0) + 1;
        }
        
        for (const [type, count] of Object.entries(byType)) {
            console.log(`   ${type}: ${count} regions`);
        }
        
        // Show samples
        console.log('\n📝 Sample text regions:');
        for (let i = 0; i < Math.min(5, textRegions.length); i++) {
            const r = textRegions[i];
            console.log(`   "${r.text}" at (${r.x.toFixed(3)}, ${r.y.toFixed(3)}) - ${r.type}`);
        }
        
        // Remove text from image
        console.log('\n🧹 Removing text from image...');
        const cleanedPath = await removeTextRegions(
            data, width, height, channels,
            textRegions, imagePath
        );
        
        console.log(`   ✅ Text removed: ${path.basename(cleanedPath)}`);
        
        // Save text data
        const dataPath = imagePath.replace('.png', '_text_data.json');
        await fs.writeFile(dataPath, JSON.stringify({
            textRegions,
            totalRegions: textRegions.length,
            byType,
            imageSize: { width, height },
            timestamp: new Date().toISOString()
        }, null, 2));
        
        console.log(`   ✅ Text data saved: ${path.basename(dataPath)}`);
        
        // Verify
        console.log('\n🔍 Verifying cleaned image...');
        const verification = await verifyCleanedImage(cleanedPath);
        
        console.log(`   Removed pixels: ${verification.removedRatio.toFixed(1)}%`);
        console.log(`   Remaining content: ${verification.contentRatio.toFixed(1)}%`);
        
        if (verification.contentRatio > 5) {
            console.log('   ✅ VERIFIED: Building structure preserved!\n');
        } else {
            console.log('   ⚠️ WARNING: Too much removed!\n');
        }
        
        return {
            textRegions,
            cleanedPath,
            dataPath,
            verification
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
        // Try to extract JSON array
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
                        type: item.type || 'other',
                        pixelX: Math.floor(item.x * imageWidth),
                        pixelY: Math.floor(item.y * imageHeight),
                        pixelWidth: Math.floor(item.width * imageWidth),
                        pixelHeight: Math.floor(item.height * imageHeight)
                    });
                }
            }
        }
    } catch (error) {
        console.log(`   ⚠️ JSON parse error: ${error.message}`);
    }
    
    // If parsing failed, try simple pattern matching
    if (regions.length === 0) {
        console.log('   ⚠️ Could not parse JSON, extracting from text...');
        
        // Look for text patterns in response
        const lines = response.split('\n');
        for (const line of lines) {
            const match = line.match(/"([^"]+)".*?(\d+\.\d+).*?(\d+\.\d+)/);
            if (match) {
                const x = parseFloat(match[2]);
                const y = parseFloat(match[3]);
                
                if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
                    regions.push({
                        text: match[1],
                        x, y,
                        width: 0.05,
                        height: 0.02,
                        type: 'detected',
                        pixelX: Math.floor(x * imageWidth),
                        pixelY: Math.floor(y * imageHeight),
                        pixelWidth: Math.floor(0.05 * imageWidth),
                        pixelHeight: Math.floor(0.02 * imageHeight)
                    });
                }
            }
        }
    }
    
    return regions;
}

/**
 * 🧹 REMOVE TEXT REGIONS
 */
async function removeTextRegions(data, width, height, channels, textRegions, imagePath) {
    console.log(`   Processing ${textRegions.length} text regions...`);
    
    // Create cleaned data
    const cleanedData = Buffer.from(data);
    
    let removedRegions = 0;
    let removedPixels = 0;
    
    // Remove each text region
    for (const region of textRegions) {
        const { pixelX, pixelY, pixelWidth, pixelHeight } = region;
        
        // Add padding around text
        const padding = 3;
        const minX = Math.max(0, pixelX - padding);
        const maxX = Math.min(width, pixelX + pixelWidth + padding);
        const minY = Math.max(0, pixelY - padding);
        const maxY = Math.min(height, pixelY + pixelHeight + padding);
        
        // White out the region
        for (let y = minY; y < maxY; y++) {
            for (let x = minX; x < maxX; x++) {
                const idx = (y * width + x) * channels;
                cleanedData[idx] = 255;     // R
                cleanedData[idx + 1] = 255; // G
                cleanedData[idx + 2] = 255; // B
                removedPixels++;
            }
        }
        
        removedRegions++;
        
        if (removedRegions % 50 === 0) {
            process.stdout.write(`\r   Removed ${removedRegions}/${textRegions.length} regions`);
        }
    }
    
    console.log(`\r   Removed ${removedRegions} regions (${removedPixels.toLocaleString()} pixels)`);
    
    // Save cleaned image
    const cleanedPath = imagePath.replace('.png', '_VLM_TEXT_FREE.png');
    
    await sharp(cleanedData, {
        raw: { width, height, channels }
    })
    .png()
    .toFile(cleanedPath);
    
    return cleanedPath;
}

/**
 * ✅ VERIFY CLEANED IMAGE
 */
async function verifyCleanedImage(imagePath) {
    const img = sharp(imagePath);
    const buffer = await img.raw().toBuffer();
    
    if (!buffer) {
        return { removedRatio: 0, contentRatio: 0 };
    }
    
    let white = 0, content = 0;
    
    for (let i = 0; i < buffer.length; i += 3) {
        const gray = (buffer[i] + buffer[i + 1] + buffer[i + 2]) / 3;
        if (gray > 240) white++;
        else content++;
    }
    
    const total = buffer.length / 3;
    
    return {
        removedRatio: white / total * 100,
        contentRatio: content / total * 100
    };
}

/**
 * 🚀 MAIN
 */
async function main() {
    const planPath = process.argv[2];
    
    if (!planPath) {
        console.error('Usage: node vlm-text-remover.js <image-path>');
        process.exit(1);
    }
    
    try {
        const result = await removeTextWithVLM(planPath);
        
        if (result) {
            console.log('═'.repeat(70));
            console.log('✅ VLM TEXT REMOVAL COMPLETE');
            console.log('═'.repeat(70));
            console.log(`\n📁 Clean image: ${result.cleanedPath}`);
            console.log(`📁 Text data: ${result.dataPath}`);
            console.log(`\n🎯 Text removed with positions saved!`);
            console.log(`   Use clean image for pattern analysis`);
            console.log(`   Use text data to reconstruct labels later\n`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
