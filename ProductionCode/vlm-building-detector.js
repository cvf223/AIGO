#!/usr/bin/env node

/**
 * 🤖 VLM BUILDING BOUNDARY DETECTOR
 * ==================================
 * 
 * Uses llava:34b to INTELLIGENTLY detect building boundaries
 * - AI understands what is building vs text/legend
 * - Identifies precise bounding box
 * - Crops out ONLY the building
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - AI-Powered Detection
 */

import sharp from 'sharp';
import ollama from 'ollama';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 🤖 VLM BUILDING DETECTION
 */
export async function detectBuildingWithVLM(imagePath) {
    console.log('\n🤖 VLM BUILDING BOUNDARY DETECTION');
    console.log('Using llava:34b for intelligent building detection');
    console.log('═'.repeat(60));
    
    console.log(`\n📐 Input: ${path.basename(imagePath)}`);
    
    // Load image
    const image = await sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    console.log(`   Size: ${width}×${height}px`);
    
    // Convert image to base64 for VLM
    console.log('\n🖼️ Preparing image for VLM...');
    const imageBuffer = await fs.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Ask VLM to identify building boundaries
    console.log('🤖 Asking llava:34b to identify building boundaries...');
    
    const prompt = `ANALYZE THIS CONSTRUCTION FLOOR PLAN IMAGE.

I can see the image shows a floor plan with walls, rooms, and patterns.

YOUR TASK: Identify where the MAIN BUILDING is located in this image.

Look for:
- Thick black lines forming rooms
- Diagonal lines, crosshatch, or other fill patterns
- The actual building structure

EXCLUDE:
- Text and numbers
- Legend (bottom-right)
- Title blocks (bottom)
- Dimension arrows and lines

RESPOND WITH ONLY THIS JSON (no other text):
{
  "minX_percent": <number from 0.0 to 1.0>,
  "maxX_percent": <number from 0.0 to 1.0>,
  "minY_percent": <number from 0.0 to 1.0>,
  "maxY_percent": <number from 0.0 to 1.0>,
  "confidence": <number from 0.0 to 1.0>
}

Example: If building spans from 20% to 80% horizontally and 10% to 90% vertically:
{"minX_percent":0.2,"maxX_percent":0.8,"minY_percent":0.1,"maxY_percent":0.9,"confidence":0.95}

NOW ANALYZE THE IMAGE AND RESPOND WITH JSON ONLY.`;

    try {
        const response = await ollama.generate({
            model: 'llava:34b',
            prompt: prompt,
            images: [base64Image],
            options: {
                temperature: 0.1, // Low temperature for consistent results
                num_predict: 200
            }
        });
        
        console.log('   ✅ VLM response received');
        
        // Parse the response
        const boundaries = parseVLMResponse(response.response, width, height);
        
        if (boundaries) {
            console.log('\n📊 VLM DETECTED BOUNDARIES:');
            console.log(`   X: ${boundaries.minX} to ${boundaries.maxX} (${boundaries.width}px)`);
            console.log(`   Y: ${boundaries.minY} to ${boundaries.maxY} (${boundaries.height}px)`);
            console.log(`   Confidence: ${(boundaries.confidence * 100).toFixed(1)}%`);
            
            // Crop the building
            console.log('\n✂️ Cropping building...');
            const croppedPath = await cropBuilding(imagePath, boundaries);
            
            console.log(`   ✅ Building cropped: ${path.basename(croppedPath)}`);
            
            // Verify the crop
            console.log('\n🔍 Verifying cropped image...');
            const verification = await verifyBuilding(croppedPath);
            
            console.log(`   Walls: ${verification.wallRatio.toFixed(1)}%`);
            console.log(`   Patterns: ${verification.patternRatio.toFixed(1)}%`);
            console.log(`   White space: ${verification.whiteRatio.toFixed(1)}%`);
            
            if (verification.wallRatio > 1 && verification.patternRatio > 5) {
                console.log('   ✅ VERIFIED: Contains building!\n');
            } else {
                console.log('   ⚠️ WARNING: May not be complete\n');
            }
            
            return {
                boundaries,
                croppedPath,
                verification
            };
            
        } else {
            console.log('   ❌ Could not parse VLM response');
            console.log(`   Response: ${response.response.substring(0, 200)}...`);
            return null;
        }
        
    } catch (error) {
        console.error('❌ VLM Error:', error.message);
        
        // Fallback to simple detection
        console.log('\n⚠️ Falling back to simple center extraction...');
        return await fallbackDetection(imagePath, width, height);
    }
}

/**
 * 📝 PARSE VLM RESPONSE
 */
function parseVLMResponse(text, imageWidth, imageHeight) {
    try {
        // Try to extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*?\}/);
        
        if (jsonMatch) {
            const json = JSON.parse(jsonMatch[0]);
            
            return {
                minX: Math.floor(json.minX_percent * imageWidth),
                maxX: Math.floor(json.maxX_percent * imageWidth),
                minY: Math.floor(json.minY_percent * imageHeight),
                maxY: Math.floor(json.maxY_percent * imageHeight),
                width: Math.floor((json.maxX_percent - json.minX_percent) * imageWidth),
                height: Math.floor((json.maxY_percent - json.minY_percent) * imageHeight),
                confidence: json.confidence || 0.5
            };
        }
        
        // Try to extract percentages from text
        const minXMatch = text.match(/minX[_\s]*(?:percent)?[:\s]+([\d.]+)/i);
        const maxXMatch = text.match(/maxX[_\s]*(?:percent)?[:\s]+([\d.]+)/i);
        const minYMatch = text.match(/minY[_\s]*(?:percent)?[:\s]+([\d.]+)/i);
        const maxYMatch = text.match(/maxY[_\s]*(?:percent)?[:\s]+([\d.]+)/i);
        
        if (minXMatch && maxXMatch && minYMatch && maxYMatch) {
            const minXPercent = parseFloat(minXMatch[1]);
            const maxXPercent = parseFloat(maxXMatch[1]);
            const minYPercent = parseFloat(minYMatch[1]);
            const maxYPercent = parseFloat(maxYMatch[1]);
            
            return {
                minX: Math.floor(minXPercent * imageWidth),
                maxX: Math.floor(maxXPercent * imageWidth),
                minY: Math.floor(minYPercent * imageHeight),
                maxY: Math.floor(maxYPercent * imageHeight),
                width: Math.floor((maxXPercent - minXPercent) * imageWidth),
                height: Math.floor((maxYPercent - minYPercent) * imageHeight),
                confidence: 0.7
            };
        }
        
    } catch (error) {
        console.log('   ⚠️ Parse error:', error.message);
    }
    
    return null;
}

/**
 * ✂️ CROP BUILDING
 */
async function cropBuilding(imagePath, boundaries) {
    const outputPath = imagePath.replace('.png', '_VLM_BUILDING.png');
    
    await sharp(imagePath)
        .extract({
            left: boundaries.minX,
            top: boundaries.minY,
            width: boundaries.width,
            height: boundaries.height
        })
        .toFile(outputPath);
    
    return outputPath;
}

/**
 * 🔄 FALLBACK DETECTION
 */
async function fallbackDetection(imagePath, width, height) {
    console.log('   Using 60% center extraction as fallback');
    
    const boundaries = {
        minX: Math.floor(width * 0.2),
        maxX: Math.floor(width * 0.8),
        minY: Math.floor(height * 0.2),
        maxY: Math.floor(height * 0.8),
        width: Math.floor(width * 0.6),
        height: Math.floor(height * 0.6),
        confidence: 0.5
    };
    
    const croppedPath = await cropBuilding(imagePath, boundaries);
    const verification = await verifyBuilding(croppedPath);
    
    return {
        boundaries,
        croppedPath,
        verification,
        fallback: true
    };
}

/**
 * ✅ VERIFY BUILDING
 */
async function verifyBuilding(imagePath) {
    const img = sharp(imagePath);
    const buffer = await img.raw().toBuffer();
    
    let white = 0, dark = 0, pattern = 0;
    
    for (let i = 0; i < buffer.length; i += 3) {
        const gray = (buffer[i] + buffer[i + 1] + buffer[i + 2]) / 3;
        if (gray > 240) white++;
        else if (gray < 50) dark++;
        else pattern++;
    }
    
    const total = buffer.length / 3;
    
    return {
        whiteRatio: white / total * 100,
        wallRatio: dark / total * 100,
        patternRatio: pattern / total * 100
    };
}

/**
 * 🚀 MAIN
 */
async function main() {
    const planPath = process.argv[2];
    
    if (!planPath) {
        console.error('Usage: node vlm-building-detector.js <image-path>');
        process.exit(1);
    }
    
    try {
        const result = await detectBuildingWithVLM(planPath);
        
        if (result) {
            console.log('═'.repeat(60));
            console.log('✅ VLM BUILDING DETECTION COMPLETE');
            console.log('═'.repeat(60));
            console.log(`\n📁 Cropped building: ${result.croppedPath}`);
            console.log(`\n🎯 Use this file for pattern analysis!\n`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main();
}
