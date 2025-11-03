/**
 * 🎯 SIMPLIFIED PIXEL ANALYZER - WORKING VERSION
 * =============================================
 * 
 * A simplified, working version of pixel analysis that doesn't hang
 * Processes images efficiently without blocking the event loop
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

export default class SimplifiedPixelAnalyzer extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            // Use smaller tiles for faster processing
            tileSize: 200,  // Much smaller tiles
            maxTiles: 50,   // Limit number of tiles to process
            sampleRate: 10, // Sample every 10th pixel for speed
            
            // Element detection thresholds
            minElementPixels: 100,
            maxElementsToDetect: 100
        };
    }
    
    /**
     * 🎨 ANALYZE CONSTRUCTION PLAN - SIMPLIFIED
     */
    async analyzeConstructionPlan(imagePath, options = {}) {
        console.log('\n🎯 SIMPLIFIED PIXEL ANALYZER');
        console.log('============================');
        console.log(`Plan: ${path.basename(imagePath)}`);
        
        const startTime = Date.now();
        
        try {
            // Load image
            console.log('\n📋 Loading image...');
            const image = await loadImage(imagePath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            
            console.log(`   ✅ Image loaded: ${image.width}×${image.height} pixels`);
            console.log(`   📊 Total pixels: ${(image.width * image.height).toLocaleString()}`);
            
            // For very large images, use a downsampled version
            let processCanvas = canvas;
            let scale = 1;
            
            if (image.width * image.height > 10000000) { // > 10M pixels
                console.log('\n📐 Downsampling for efficiency...');
                const maxDimension = 2000;
                scale = Math.min(maxDimension / image.width, maxDimension / image.height);
                
                const scaledWidth = Math.floor(image.width * scale);
                const scaledHeight = Math.floor(image.height * scale);
                
                processCanvas = createCanvas(scaledWidth, scaledHeight);
                const processCtx = processCanvas.getContext('2d');
                processCtx.drawImage(image, 0, 0, scaledWidth, scaledHeight);
                
                console.log(`   ✅ Downsampled to: ${scaledWidth}×${scaledHeight} (scale: ${scale.toFixed(2)})`);
            }
            
            // Get image data
            const processCtx = processCanvas.getContext('2d');
            const imageData = processCtx.getImageData(0, 0, processCanvas.width, processCanvas.height);
            const pixels = imageData.data;
            
            // Analyze pixels with sampling
            console.log('\n🔬 Analyzing pixels...');
            const analysis = this.analyzePixelsSampled(pixels, processCanvas.width, processCanvas.height);
            console.log(`   ✅ Found ${analysis.categories.size} color categories`);
            
            // Detect elements using simple algorithm
            console.log('\n📐 Detecting elements...');
            const elements = this.detectElementsSimple(pixels, processCanvas.width, processCanvas.height);
            console.log(`   ✅ Detected ${elements.length} elements`);
            
            // Generate output
            console.log('\n🎨 Generating annotated output...');
            const outputPath = await this.generateAnnotatedOutput(
                canvas, 
                elements, 
                scale,
                path.basename(imagePath, path.extname(imagePath))
            );
            
            const endTime = Date.now();
            
            // Results
            const results = {
                success: true,
                dimensions: {
                    width: image.width,
                    height: image.height,
                    totalPixels: image.width * image.height
                },
                processing: {
                    scale: scale,
                    processedWidth: processCanvas.width,
                    processedHeight: processCanvas.height,
                    time: endTime - startTime
                },
                analysis: {
                    categories: analysis.categories.size,
                    dominantColors: analysis.dominantColors,
                    elements: elements.length
                },
                output: outputPath
            };
            
            console.log('\n✅ ANALYSIS COMPLETE!');
            console.log('====================');
            console.log(`⏱️ Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
            console.log(`📊 Elements detected: ${elements.length}`);
            console.log(`📁 Output saved: ${outputPath}`);
            
            return results;
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🔬 ANALYZE PIXELS WITH SAMPLING
     */
    analyzePixelsSampled(pixels, width, height) {
        const categories = new Map();
        const colorCounts = new Map();
        const sampleRate = this.config.sampleRate;
        
        // Sample pixels for speed
        for (let y = 0; y < height; y += sampleRate) {
            for (let x = 0; x < width; x += sampleRate) {
                const idx = (y * width + x) * 4;
                
                const r = pixels[idx];
                const g = pixels[idx + 1];
                const b = pixels[idx + 2];
                
                // Categorize color
                const category = this.categorizeColor(r, g, b);
                const colorKey = `${category}`;
                
                if (!categories.has(category)) {
                    categories.set(category, { count: 0, samples: [] });
                }
                
                const cat = categories.get(category);
                cat.count++;
                if (cat.samples.length < 10) {
                    cat.samples.push({ x, y, r, g, b });
                }
                
                colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
            }
        }
        
        // Find dominant colors
        const dominantColors = Array.from(colorCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([color, count]) => ({ color, count }));
        
        return { categories, dominantColors };
    }
    
    /**
     * 🎨 CATEGORIZE COLOR
     */
    categorizeColor(r, g, b) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        if (gray > 250) return 'background';
        if (gray < 30) return 'wall';
        if (gray < 100) return 'structure';
        if (gray < 180) return 'fill';
        if (r > g && r > b && r > 150) return 'annotation';
        if (b > r && b > g && b > 150) return 'dimension';
        if (g > r && g > b && g > 150) return 'special';
        
        return 'other';
    }
    
    /**
     * 📐 DETECT ELEMENTS SIMPLE
     */
    detectElementsSimple(pixels, width, height) {
        const elements = [];
        const visited = new Uint8Array(width * height);
        const sampleStep = 50; // Sample grid
        
        let elementsFound = 0;
        
        // Simple grid-based detection
        for (let y = 0; y < height && elementsFound < this.config.maxElementsToDetect; y += sampleStep) {
            for (let x = 0; x < width && elementsFound < this.config.maxElementsToDetect; x += sampleStep) {
                const idx = y * width + x;
                
                if (visited[idx]) continue;
                
                const pixelIdx = idx * 4;
                const gray = 0.299 * pixels[pixelIdx] + 0.587 * pixels[pixelIdx + 1] + 0.114 * pixels[pixelIdx + 2];
                
                // Skip background
                if (gray > 240) {
                    visited[idx] = 1;
                    continue;
                }
                
                // Found a non-background pixel, create element
                const element = {
                    id: elementsFound++,
                    x: x,
                    y: y,
                    width: sampleStep,
                    height: sampleStep,
                    category: this.categorizeColor(pixels[pixelIdx], pixels[pixelIdx + 1], pixels[pixelIdx + 2]),
                    color: `rgb(${pixels[pixelIdx]},${pixels[pixelIdx + 1]},${pixels[pixelIdx + 2]})`
                };
                
                elements.push(element);
                visited[idx] = 1;
            }
        }
        
        return elements;
    }
    
    /**
     * 🎨 GENERATE ANNOTATED OUTPUT
     */
    async generateAnnotatedOutput(originalCanvas, elements, scale, baseName) {
        // Create output canvas
        const canvas = createCanvas(originalCanvas.width, originalCanvas.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original
        ctx.drawImage(originalCanvas, 0, 0);
        
        // Draw element annotations
        ctx.globalAlpha = 0.3;
        
        for (const element of elements) {
            // Scale coordinates back to original size
            const x = element.x / scale;
            const y = element.y / scale;
            const width = element.width / scale;
            const height = element.height / scale;
            
            // Choose color based on category
            const colors = {
                wall: '#000000',
                structure: '#404040',
                fill: '#808080',
                annotation: '#FF0000',
                dimension: '#0000FF',
                special: '#00FF00',
                other: '#FF00FF',
                background: '#FFFFFF'
            };
            
            ctx.fillStyle = colors[element.category] || '#FFFF00';
            ctx.fillRect(x, y, width, height);
        }
        
        ctx.globalAlpha = 1.0;
        
        // Add text overlay
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(`Elements: ${elements.length}`, 20, 40);
        ctx.fillText(`Scale: ${(1/scale).toFixed(2)}x`, 20, 70);
        
        // Save output
        const outputDir = path.join(process.cwd(), 'annotation_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputPath = path.join(outputDir, `${baseName}_annotated.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        return outputPath;
    }
}

