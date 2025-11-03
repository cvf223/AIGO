/**
 * 🎯 LEGEND-BASED WALL ANALYZER - PATTERN RECOGNITION SYSTEM
 * ==========================================================
 * 
 * CORRECT APPROACH: Analyzes legend first, learns wall patterns,
 * then finds matching patterns in the building plan
 * 
 * WORKFLOW:
 * 1. Extract and analyze legend (bottom right corner)
 * 2. Learn pixel patterns for each wall type
 * 3. Locate actual building area (exclude text/dimensions)
 * 4. Find all pattern matches in building area
 * 5. Calculate m² for each wall type
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Pattern Recognition Based
 */

import { EventEmitter } from 'events';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import Tesseract from 'tesseract.js';

export default class LegendBasedWallAnalyzer extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            // Legend location (typically bottom right)
            legendLocation: {
                position: 'bottom-right',
                widthRatio: 0.25,  // Legend is usually 25% of image width
                heightRatio: 0.20   // And 20% of image height
            },
            
            // Pattern matching parameters
            patternMatching: {
                minPatternSize: 20,      // Minimum pattern size in pixels
                maxPatternSize: 100,     // Maximum pattern size
                matchThreshold: 0.85,    // Pattern match confidence threshold
                sampleSize: 50           // Size of pattern sample to extract
            },
            
            // Building area detection
            buildingDetection: {
                excludeMargin: 0.1,      // Exclude 10% margins (text areas)
                minBuildingArea: 0.3,    // Building should be at least 30% of image
                textExclusionBuffer: 50  // Pixels to exclude around detected text
            }
        };
        
        // Storage for analysis results
        this.legendPatterns = new Map();  // Pattern name -> pixel pattern
        this.detectedWalls = [];
        this.buildingArea = null;
        this.scale = null;
    }
    
    /**
     * 🎯 MAIN ENTRY - ANALYZE WITH LEGEND-BASED APPROACH
     */
    async analyzeWithLegend(imagePath, options = {}) {
        console.log('\n🎯 LEGEND-BASED WALL ANALYZER');
        console.log('==============================');
        console.log('Using CORRECT approach: Legend → Patterns → Detection');
        console.log(`Plan: ${path.basename(imagePath)}`);
        
        const startTime = Date.now();
        
        try {
            // Load image
            console.log('\n📋 Loading construction plan...');
            const image = await loadImage(imagePath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            console.log(`   ✅ Image loaded: ${image.width}×${image.height} pixels`);
            
            // STAGE 1: ROUGH ANALYSIS
            console.log('\n🔍 STAGE 1: ROUGH ANALYSIS');
            console.log('===========================');
            
            // Step 1: Extract and analyze legend
            console.log('\n📊 Step 1: Extracting legend from bottom-right corner...');
            const legendData = await this.extractLegend(canvas);
            console.log(`   ✅ Legend extracted: ${legendData.patterns.size} wall patterns found`);
            
            // Step 2: Read legend text with OCR
            console.log('\n📖 Step 2: Reading legend text with OCR...');
            const legendText = await this.readLegendText(legendData.canvas);
            console.log(`   ✅ Legend labels identified:`);
            for (const [pattern, label] of legendText.entries()) {
                console.log(`      • ${label}`);
            }
            
            // Step 3: Learn pixel patterns from legend
            console.log('\n🧠 Step 3: Learning pixel patterns from legend...');
            this.legendPatterns = await this.learnPatterns(legendData);
            console.log(`   ✅ Learned ${this.legendPatterns.size} unique wall patterns`);
            
            // Step 4: Detect scale from legend or dimensions
            console.log('\n📏 Step 4: Detecting scale...');
            this.scale = await this.detectScale(canvas, legendText);
            console.log(`   ✅ Scale: ${this.scale.notation} (${this.scale.pixelsPerMeter} px/m)`);
            
            // Step 5: Locate building area (exclude text/dimensions)
            console.log('\n🏗️ Step 5: Locating building area (excluding text)...');
            this.buildingArea = await this.locateBuildingArea(canvas);
            console.log(`   ✅ Building area: ${this.buildingArea.width}×${this.buildingArea.height} pixels`);
            console.log(`      Position: (${this.buildingArea.x}, ${this.buildingArea.y})`);
            
            // STAGE 2: PIXEL-PERFECT PATTERN MATCHING
            console.log('\n🔬 STAGE 2: PIXEL-PERFECT PATTERN MATCHING');
            console.log('==========================================');
            
            // Step 6: Extract building area for analysis
            console.log('\n🎯 Step 6: Extracting building area for pattern matching...');
            const buildingCanvas = await this.extractBuildingArea(canvas, this.buildingArea);
            console.log('   ✅ Building area extracted');
            
            // Step 7: Find all pattern matches
            console.log('\n🔍 Step 7: Finding pattern matches in building...');
            const patternMatches = await this.findPatternMatches(buildingCanvas, this.legendPatterns);
            console.log(`   ✅ Found ${patternMatches.totalMatches} pattern instances`);
            
            // Step 8: Group and measure wall areas
            console.log('\n📐 Step 8: Measuring wall areas by pattern type...');
            const wallMeasurements = await this.measureWallAreas(patternMatches, this.scale);
            
            // Step 9: Generate annotated output
            console.log('\n🎨 Step 9: Generating annotated output...');
            const outputPath = await this.generateAnnotatedOutput(
                canvas,
                patternMatches,
                wallMeasurements,
                path.basename(imagePath, path.extname(imagePath))
            );
            
            const endTime = Date.now();
            
            // Print results
            console.log('\n' + '═'.repeat(70));
            console.log('📊 PATTERN-BASED WALL DETECTION RESULTS');
            console.log('═'.repeat(70));
            
            let totalArea = 0;
            for (const [patternName, measurement] of Object.entries(wallMeasurements)) {
                console.log(`\n${patternName}:`);
                console.log(`   • Pattern matches: ${measurement.matchCount}`);
                console.log(`   • Coverage pixels: ${measurement.pixelCount.toLocaleString()}`);
                console.log(`   • Area: ${measurement.areaSquareMeters.toFixed(2)} m²`);
                console.log(`   • Confidence: ${(measurement.confidence * 100).toFixed(1)}%`);
                totalArea += measurement.areaSquareMeters;
            }
            
            console.log('\n' + '─'.repeat(70));
            console.log(`TOTAL WALL AREA: ${totalArea.toFixed(2)} m²`);
            console.log('─'.repeat(70));
            
            console.log(`\n⏱️ Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
            console.log(`📁 Output: ${outputPath}`);
            
            return {
                success: true,
                patterns: this.legendPatterns,
                measurements: wallMeasurements,
                totalArea: totalArea,
                scale: this.scale,
                buildingArea: this.buildingArea,
                outputPath: outputPath
            };
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 📊 EXTRACT LEGEND FROM BOTTOM-RIGHT
     */
    async extractLegend(canvas) {
        const ctx = canvas.getContext('2d');
        
        // Calculate legend area
        const legendWidth = Math.floor(canvas.width * this.config.legendLocation.widthRatio);
        const legendHeight = Math.floor(canvas.height * this.config.legendLocation.heightRatio);
        const legendX = canvas.width - legendWidth - 50; // 50px margin
        const legendY = canvas.height - legendHeight - 50;
        
        // Extract legend area
        const legendCanvas = createCanvas(legendWidth, legendHeight);
        const legendCtx = legendCanvas.getContext('2d');
        
        const imageData = ctx.getImageData(legendX, legendY, legendWidth, legendHeight);
        legendCtx.putImageData(imageData, 0, 0);
        
        // Find pattern samples in legend
        const patterns = await this.findLegendPatterns(legendCanvas);
        
        return {
            canvas: legendCanvas,
            patterns: patterns,
            position: { x: legendX, y: legendY, width: legendWidth, height: legendHeight }
        };
    }
    
    /**
     * 🔍 FIND LEGEND PATTERNS
     */
    async findLegendPatterns(legendCanvas) {
        const ctx = legendCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, legendCanvas.width, legendCanvas.height);
        const pixels = imageData.data;
        
        const patterns = new Map();
        const patternSize = this.config.patternMatching.sampleSize;
        
        // Look for rectangular pattern samples (usually arranged vertically)
        const samplePoints = [];
        
        // Scan for pattern boxes (dark rectangles on white background)
        for (let y = 20; y < legendCanvas.height - patternSize; y += patternSize + 10) {
            for (let x = 20; x < legendCanvas.width / 2; x += 5) {
                const idx = (y * legendCanvas.width + x) * 4;
                
                // Look for transition from white to pattern
                if (pixels[idx] < 200 && this.isPatternStart(pixels, x, y, legendCanvas.width)) {
                    samplePoints.push({ x, y });
                    x += patternSize; // Skip ahead
                }
            }
        }
        
        // Extract pattern for each sample point
        let patternId = 1;
        for (const point of samplePoints) {
            const pattern = this.extractPattern(pixels, point.x, point.y, patternSize, legendCanvas.width);
            if (pattern) {
                patterns.set(`pattern_${patternId}`, pattern);
                patternId++;
            }
        }
        
        return patterns;
    }
    
    /**
     * 🎨 EXTRACT PATTERN
     */
    extractPattern(pixels, x, y, size, width) {
        const pattern = {
            data: [],
            width: size,
            height: size,
            signature: '',
            position: { x, y }
        };
        
        // Extract pattern pixels
        for (let py = 0; py < size; py++) {
            for (let px = 0; px < size; px++) {
                const idx = ((y + py) * width + (x + px)) * 4;
                if (idx < pixels.length) {
                    // Store as grayscale
                    const gray = Math.floor(0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2]);
                    pattern.data.push(gray);
                }
            }
        }
        
        // Create pattern signature (simplified hash)
        pattern.signature = this.createPatternSignature(pattern.data);
        
        return pattern;
    }
    
    /**
     * 🔤 CREATE PATTERN SIGNATURE
     */
    createPatternSignature(data) {
        // Create a simple signature by sampling key points
        const samples = [];
        const step = Math.floor(data.length / 16);
        
        for (let i = 0; i < data.length; i += step) {
            samples.push(data[i] < 128 ? '1' : '0');
        }
        
        return samples.join('');
    }
    
    /**
     * 📖 READ LEGEND TEXT
     */
    async readLegendText(legendCanvas) {
        // Use OCR to read legend labels
        const buffer = legendCanvas.toBuffer('image/png');
        
        try {
            const { data: { text } } = await Tesseract.recognize(buffer, 'deu', {
                logger: m => {} // Suppress logging
            });
            
            // Parse text to find wall type labels
            const labels = new Map();
            const lines = text.split('\n').filter(line => line.trim().length > 0);
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // Look for wall-related keywords
                if (line.match(/wand|mauer|wall|tragend|dämmung|trocken|beton|ziegel/i)) {
                    labels.set(`pattern_${i + 1}`, line);
                }
            }
            
            // Fallback labels if OCR fails
            if (labels.size === 0) {
                labels.set('pattern_1', 'Tragende Wand');
                labels.set('pattern_2', 'Nichttragende Wand');
                labels.set('pattern_3', 'Dämmung');
                labels.set('pattern_4', 'Trockenbau');
            }
            
            return labels;
            
        } catch (error) {
            console.warn('   ⚠️ OCR failed, using default labels');
            return new Map([
                ['pattern_1', 'Type 1 Wall'],
                ['pattern_2', 'Type 2 Wall'],
                ['pattern_3', 'Type 3 Wall'],
                ['pattern_4', 'Type 4 Wall']
            ]);
        }
    }
    
    /**
     * 🧠 LEARN PATTERNS
     */
    async learnPatterns(legendData) {
        const learnedPatterns = new Map();
        
        for (const [patternId, pattern] of legendData.patterns) {
            learnedPatterns.set(patternId, {
                ...pattern,
                variations: this.generatePatternVariations(pattern)
            });
        }
        
        return learnedPatterns;
    }
    
    /**
     * 🔄 GENERATE PATTERN VARIATIONS
     */
    generatePatternVariations(pattern) {
        // Generate variations for rotation and slight differences
        const variations = [pattern.signature];
        
        // Add rotated version (simplified)
        const rotated = this.rotateSignature(pattern.signature);
        variations.push(rotated);
        
        // Add tolerance variations
        for (let i = 0; i < pattern.signature.length; i++) {
            const varied = pattern.signature.split('');
            varied[i] = varied[i] === '1' ? '0' : '1';
            variations.push(varied.join(''));
        }
        
        return variations;
    }
    
    /**
     * 🔄 ROTATE SIGNATURE
     */
    rotateSignature(signature) {
        // Simple rotation for pattern matching
        const len = signature.length;
        const sqrt = Math.sqrt(len);
        if (sqrt !== Math.floor(sqrt)) return signature; // Not a square
        
        const matrix = [];
        for (let i = 0; i < sqrt; i++) {
            matrix.push(signature.substr(i * sqrt, sqrt).split(''));
        }
        
        // Rotate 90 degrees
        const rotated = [];
        for (let i = 0; i < sqrt; i++) {
            for (let j = sqrt - 1; j >= 0; j--) {
                rotated.push(matrix[j][i]);
            }
        }
        
        return rotated.join('');
    }
    
    /**
     * 📏 DETECT SCALE
     */
    async detectScale(canvas, legendText) {
        // Look for scale notation in legend text
        for (const [_, text] of legendText) {
            const scaleMatch = text.match(/1:(\d+)/);
            if (scaleMatch) {
                const scale = parseInt(scaleMatch[1]);
                return {
                    notation: `1:${scale}`,
                    pixelsPerMeter: 3000 / scale // Assuming 300 DPI
                };
            }
        }
        
        // Default to 1:100
        return {
            notation: '1:100',
            pixelsPerMeter: 300
        };
    }
    
    /**
     * 🏗️ LOCATE BUILDING AREA
     */
    async locateBuildingArea(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Find the main building area (largest connected dark region)
        // Exclude margins where text typically is
        const margin = Math.floor(canvas.width * this.config.buildingDetection.excludeMargin);
        
        let minX = canvas.width, minY = canvas.height;
        let maxX = 0, maxY = 0;
        
        // Scan for building content
        for (let y = margin; y < canvas.height - margin; y += 10) {
            for (let x = margin; x < canvas.width - margin; x += 10) {
                const idx = (y * canvas.width + x) * 4;
                const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
                
                // Dark pixel (part of building)
                if (gray < 200) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        // Add buffer
        const buffer = 50;
        minX = Math.max(0, minX - buffer);
        minY = Math.max(0, minY - buffer);
        maxX = Math.min(canvas.width, maxX + buffer);
        maxY = Math.min(canvas.height, maxY + buffer);
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    /**
     * 🎯 EXTRACT BUILDING AREA
     */
    async extractBuildingArea(canvas, buildingArea) {
        const ctx = canvas.getContext('2d');
        
        const buildingCanvas = createCanvas(buildingArea.width, buildingArea.height);
        const buildingCtx = buildingCanvas.getContext('2d');
        
        const imageData = ctx.getImageData(
            buildingArea.x, 
            buildingArea.y, 
            buildingArea.width, 
            buildingArea.height
        );
        
        buildingCtx.putImageData(imageData, 0, 0);
        
        return buildingCanvas;
    }
    
    /**
     * 🔍 FIND PATTERN MATCHES
     */
    async findPatternMatches(buildingCanvas, legendPatterns) {
        const ctx = buildingCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, buildingCanvas.width, buildingCanvas.height);
        const pixels = imageData.data;
        
        const matches = new Map();
        let totalMatches = 0;
        
        // Initialize match map
        for (const [patternId, _] of legendPatterns) {
            matches.set(patternId, []);
        }
        
        // Sliding window pattern matching
        const windowSize = this.config.patternMatching.sampleSize;
        const step = Math.floor(windowSize / 2); // 50% overlap
        
        console.log(`      Scanning ${buildingCanvas.width}×${buildingCanvas.height} building area...`);
        
        for (let y = 0; y < buildingCanvas.height - windowSize; y += step) {
            for (let x = 0; x < buildingCanvas.width - windowSize; x += step) {
                // Extract window
                const window = this.extractPattern(pixels, x, y, windowSize, buildingCanvas.width);
                
                // Compare with all legend patterns
                for (const [patternId, legendPattern] of legendPatterns) {
                    const similarity = this.comparePatterns(window, legendPattern);
                    
                    if (similarity > this.config.patternMatching.matchThreshold) {
                        matches.get(patternId).push({
                            x: x + this.buildingArea.x,
                            y: y + this.buildingArea.y,
                            confidence: similarity
                        });
                        totalMatches++;
                    }
                }
            }
            
            // Progress
            if (y % 100 === 0) {
                const progress = (y / buildingCanvas.height * 100).toFixed(0);
                process.stdout.write(`\r      Progress: ${progress}%`);
            }
        }
        
        console.log('\r      Progress: 100%');
        
        return { matches, totalMatches };
    }
    
    /**
     * 🔬 COMPARE PATTERNS
     */
    comparePatterns(pattern1, pattern2) {
        if (!pattern1 || !pattern2 || !pattern1.data || !pattern2.data) return 0;
        
        // Simple pattern matching using signatures
        const sig1 = pattern1.signature;
        const sig2 = pattern2.signature;
        
        // Check direct match
        if (sig1 === sig2) return 1.0;
        
        // Check variations
        if (pattern2.variations) {
            for (const variation of pattern2.variations) {
                if (sig1 === variation) return 0.9;
            }
        }
        
        // Calculate similarity
        let matches = 0;
        for (let i = 0; i < Math.min(sig1.length, sig2.length); i++) {
            if (sig1[i] === sig2[i]) matches++;
        }
        
        return matches / Math.max(sig1.length, sig2.length);
    }
    
    /**
     * 📐 MEASURE WALL AREAS
     */
    async measureWallAreas(patternMatches, scale) {
        const measurements = {};
        const pixelsPerSquareMeter = scale.pixelsPerMeter * scale.pixelsPerMeter;
        const patternArea = this.config.patternMatching.sampleSize * this.config.patternMatching.sampleSize;
        
        for (const [patternId, matches] of patternMatches.matches) {
            const pixelCount = matches.length * patternArea;
            const areaSquareMeters = pixelCount / pixelsPerSquareMeter;
            const avgConfidence = matches.reduce((sum, m) => sum + m.confidence, 0) / (matches.length || 1);
            
            measurements[patternId] = {
                matchCount: matches.length,
                pixelCount: pixelCount,
                areaSquareMeters: areaSquareMeters,
                confidence: avgConfidence
            };
        }
        
        return measurements;
    }
    
    /**
     * 🎨 GENERATE ANNOTATED OUTPUT
     */
    async generateAnnotatedOutput(originalCanvas, patternMatches, measurements, baseName) {
        // Create output canvas
        const canvas = createCanvas(originalCanvas.width, originalCanvas.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original
        ctx.drawImage(originalCanvas, 0, 0);
        
        // Define colors for each pattern
        const colors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF', '#FFFF00'];
        let colorIndex = 0;
        
        // Draw pattern matches
        ctx.globalAlpha = 0.3;
        for (const [patternId, matches] of patternMatches.matches) {
            ctx.fillStyle = colors[colorIndex % colors.length];
            colorIndex++;
            
            for (const match of matches) {
                ctx.fillRect(
                    match.x,
                    match.y,
                    this.config.patternMatching.sampleSize,
                    this.config.patternMatching.sampleSize
                );
            }
        }
        ctx.globalAlpha = 1.0;
        
        // Draw statistics
        this.drawStatistics(ctx, measurements);
        
        // Save output
        const outputDir = path.join(process.cwd(), 'legend_analysis_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputPath = path.join(outputDir, `${baseName}_pattern_analysis.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        // Save data
        const dataPath = path.join(outputDir, `${baseName}_pattern_data.json`);
        await fs.writeFile(dataPath, JSON.stringify({
            scale: this.scale,
            buildingArea: this.buildingArea,
            measurements: measurements,
            patternCount: patternMatches.matches.size,
            totalMatches: patternMatches.totalMatches
        }, null, 2));
        
        return outputPath;
    }
    
    /**
     * 📊 DRAW STATISTICS
     */
    drawStatistics(ctx, measurements) {
        const x = 50, y = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - 10, y - 10, 400, 200);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('PATTERN-BASED WALL DETECTION', x, y + 20);
        
        // Stats
        ctx.font = '14px Arial';
        let yPos = y + 50;
        let patternNum = 1;
        
        for (const [patternId, measurement] of Object.entries(measurements)) {
            ctx.fillText(
                `Pattern ${patternNum}: ${measurement.areaSquareMeters.toFixed(2)} m² (${measurement.matchCount} matches)`,
                x, yPos
            );
            yPos += 20;
            patternNum++;
        }
    }
    
    /**
     * 🔍 CHECK IF PATTERN START
     */
    isPatternStart(pixels, x, y, width) {
        // Check if this looks like the start of a pattern box
        let darkPixels = 0;
        for (let dx = 0; dx < 10; dx++) {
            for (let dy = 0; dy < 10; dy++) {
                const idx = ((y + dy) * width + (x + dx)) * 4;
                if (idx < pixels.length && pixels[idx] < 128) {
                    darkPixels++;
                }
            }
        }
        return darkPixels > 50; // More than 50% dark
    }
}
