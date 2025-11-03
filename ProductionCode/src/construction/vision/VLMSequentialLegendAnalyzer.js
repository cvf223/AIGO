/**
 * 🤖 VLM SEQUENTIAL LEGEND ANALYZER
 * =================================
 * 
 * Uses VLM (llava:34b) to identify legend patterns sequentially,
 * analyzing the entire plan for each pattern one at a time
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import ollama from 'ollama';

import LegendElementCatalog from '../models/LegendElementCatalog.js';
import PatternTextureAnalyzer from './PatternTextureAnalyzer.js';
import TextAnnotationParser from './TextAnnotationParser.js';

export default class VLMSequentialLegendAnalyzer extends EventEmitter {
    constructor() {
        super();
        
        this.catalog = new LegendElementCatalog();
        this.textureAnalyzer = new PatternTextureAnalyzer();
        this.textParser = new TextAnnotationParser();
        
        this.config = {
            // VLM configuration
            vlm: {
                model: 'llava:34b',
                temperature: 0.1,  // Low temperature for consistent results
                maxTokens: 500
            },
            
            // Legend extraction
            legend: {
                location: 'bottom-right',
                widthRatio: 0.3,   // 30% of image width
                heightRatio: 0.25,  // 25% of image height
                margin: 50          // pixels from edge
            },
            
            // Pattern detection
            patterns: {
                minSize: 15,        // Minimum pattern size in pixels
                maxSize: 150,       // Maximum pattern size
                sampleSize: 80,     // Size to extract for analysis
                gridSpacing: 40     // Spacing between pattern samples
            },
            
            // Sequential scanning
            scanning: {
                tileSize: 500,      // Scan in tiles for efficiency
                overlap: 50,        // Tile overlap
                minConfidence: 0.7, // Minimum confidence for match
                batchSize: 10       // Process tiles in batches
            }
        };
        
        // Results storage
        this.legendPatterns = [];
        this.analysisResults = [];
        this.scale = null;
    }

    /**
     * 🎯 MAIN ENTRY - ANALYZE CONSTRUCTION PLAN
     */
    async analyzeConstructionPlan(planPath, options = {}) {
        console.log('\n🤖 VLM SEQUENTIAL LEGEND ANALYZER');
        console.log('==================================');
        console.log('Sequential pattern-by-pattern analysis with VLM');
        console.log(`Plan: ${path.basename(planPath)}`);
        
        const startTime = Date.now();
        
        try {
            // Load plan image
            console.log('\n📋 Step 1: Loading construction plan...');
            const planImage = await loadImage(planPath);
            const canvas = createCanvas(planImage.width, planImage.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(planImage, 0, 0);
            console.log(`   ✅ Plan loaded: ${planImage.width}×${planImage.height} pixels`);
            
            // Extract scale from text
            console.log('\n📏 Step 2: Detecting scale...');
            this.scale = await this.textParser.extractScale(canvas);
            console.log(`   ✅ Scale detected: ${this.scale.notation}`);
            
            // Extract legend area
            console.log('\n📊 Step 3: Extracting legend area...');
            const legendData = await this.extractLegendArea(canvas);
            console.log(`   ✅ Legend extracted from ${legendData.location}`);
            
            // Extract individual patterns from legend
            console.log('\n🔍 Step 4: Extracting patterns from legend...');
            const patterns = await this.extractLegendPatterns(legendData.canvas);
            console.log(`   ✅ Found ${patterns.length} patterns in legend`);
            
            // Use VLM to identify each pattern
            console.log('\n🤖 Step 5: Identifying patterns with VLM...');
            this.legendPatterns = await this.identifyPatternsWithVLM(patterns);
            console.log(`   ✅ Identified ${this.legendPatterns.length} element types`);
            
            // Print identified patterns
            console.log('\n📋 Identified Legend Elements:');
            for (const pattern of this.legendPatterns) {
                console.log(`   • ${pattern.elementType} (${pattern.category}) - ${pattern.measurementType}`);
            }
            
            // SEQUENTIAL ANALYSIS - One pattern at a time
            console.log('\n🔄 Step 6: Sequential pattern analysis...');
            console.log('=' .repeat(50));
            
            const results = [];
            
            for (let i = 0; i < this.legendPatterns.length; i++) {
                const legendItem = this.legendPatterns[i];
                
                console.log(`\n[${i + 1}/${this.legendPatterns.length}] Analyzing: ${legendItem.elementType}`);
                console.log('-'.repeat(40));
                
                // Extract texture features for this pattern
                const patternFeatures = this.textureAnalyzer.extractTextureFeatures(
                    legendItem.patternImage
                );
                
                // Search ENTIRE plan for THIS pattern only
                console.log(`   🔍 Searching entire plan for ${legendItem.elementType}...`);
                const matches = await this.findPatternInPlan(
                    canvas,
                    legendItem,
                    patternFeatures
                );
                
                console.log(`   ✅ Found ${matches.length} instances`);
                
                // Calculate measurement based on type
                let measurement;
                let unit;
                
                if (legendItem.measurementType === 'area') {
                    measurement = this.calculateTotalArea(matches, this.scale);
                    unit = 'm²';
                    console.log(`   📐 Total area: ${measurement.toFixed(2)} ${unit}`);
                } else if (legendItem.measurementType === 'count') {
                    measurement = matches.length;
                    unit = 'Stück';
                    console.log(`   📊 Count: ${measurement} ${unit}`);
                } else {
                    measurement = 0;
                    unit = 'N/A';
                    console.log(`   ℹ️ Reference element - not measured`);
                }
                
                // Store results
                const result = {
                    element: legendItem.elementType,
                    category: legendItem.category,
                    measurement: measurement,
                    unit: unit,
                    matches: matches.length,
                    locations: matches.map(m => ({ x: m.x, y: m.y, confidence: m.confidence })),
                    averageConfidence: matches.length > 0 
                        ? matches.reduce((sum, m) => sum + m.confidence, 0) / matches.length
                        : 0,
                    dinCode: this.catalog.getDinCode(legendItem.elementType)
                };
                
                results.push(result);
                
                // Progress update
                const progress = ((i + 1) / this.legendPatterns.length * 100).toFixed(0);
                console.log(`   ⏳ Overall progress: ${progress}%`);
            }
            
            console.log('\n' + '='.repeat(50));
            
            // Generate summary
            const summary = this.generateSummary(results);
            
            // Generate annotated output
            console.log('\n🎨 Step 7: Generating annotated output...');
            const outputPath = await this.generateAnnotatedOutput(
                canvas,
                results,
                path.basename(planPath, path.extname(planPath))
            );
            
            const endTime = Date.now();
            
            // Print results
            console.log('\n' + '═'.repeat(70));
            console.log('📊 VLM SEQUENTIAL ANALYSIS RESULTS');
            console.log('═'.repeat(70));
            
            // Wall elements
            console.log('\n🏗️ WALL ELEMENTS (m²):');
            for (const result of results.filter(r => r.category === 'wall')) {
                console.log(`   ${result.element}: ${result.measurement.toFixed(2)} ${result.unit} (${result.matches} instances)`);
            }
            
            // Openings
            console.log('\n🚪 OPENING ELEMENTS (count):');
            for (const result of results.filter(r => r.category === 'opening')) {
                console.log(`   ${result.element}: ${result.measurement} ${result.unit}`);
            }
            
            // Summary
            console.log('\n📊 SUMMARY:');
            console.log(`   Total wall area: ${summary.totalWallArea.toFixed(2)} m²`);
            console.log(`   Total openings: ${summary.totalOpenings}`);
            console.log(`   Patterns analyzed: ${this.legendPatterns.length}`);
            console.log(`   Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
            console.log(`   Average confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`);
            
            console.log('\n' + '═'.repeat(70));
            console.log(`📁 Output saved: ${outputPath}`);
            
            return {
                success: true,
                results: results,
                summary: summary,
                scale: this.scale,
                outputPath: outputPath,
                processingTime: endTime - startTime
            };
            
        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            throw error;
        }
    }

    /**
     * 📊 EXTRACT LEGEND AREA
     */
    async extractLegendArea(canvas) {
        const config = this.config.legend;
        
        // Calculate legend position based on configuration
        let x, y;
        const width = Math.floor(canvas.width * config.widthRatio);
        const height = Math.floor(canvas.height * config.heightRatio);
        
        if (config.location === 'bottom-right') {
            x = canvas.width - width - config.margin;
            y = canvas.height - height - config.margin;
        } else if (config.location === 'bottom-left') {
            x = config.margin;
            y = canvas.height - height - config.margin;
        } else if (config.location === 'top-right') {
            x = canvas.width - width - config.margin;
            y = config.margin;
        } else {
            x = config.margin;
            y = config.margin;
        }
        
        // Extract legend region
        const legendCanvas = createCanvas(width, height);
        const legendCtx = legendCanvas.getContext('2d');
        
        legendCtx.drawImage(
            canvas,
            x, y, width, height,  // Source
            0, 0, width, height   // Destination
        );
        
        return {
            canvas: legendCanvas,
            location: config.location,
            bounds: { x, y, width, height }
        };
    }

    /**
     * 🔍 EXTRACT PATTERNS FROM LEGEND
     */
    async extractLegendPatterns(legendCanvas) {
        const patterns = [];
        const config = this.config.patterns;
        const ctx = legendCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, legendCanvas.width, legendCanvas.height);
        const pixels = imageData.data;
        
        // Grid-based pattern extraction
        for (let y = config.gridSpacing; y < legendCanvas.height - config.sampleSize; y += config.gridSpacing) {
            for (let x = config.gridSpacing; x < legendCanvas.width / 2; x += config.gridSpacing) {
                // Check if this location contains a pattern
                if (this.hasPattern(pixels, x, y, legendCanvas.width)) {
                    // Extract pattern sample
                    const patternCanvas = createCanvas(config.sampleSize, config.sampleSize);
                    const patternCtx = patternCanvas.getContext('2d');
                    
                    patternCtx.drawImage(
                        legendCanvas,
                        x, y, config.sampleSize, config.sampleSize,
                        0, 0, config.sampleSize, config.sampleSize
                    );
                    
                    patterns.push({
                        canvas: patternCanvas,
                        location: { x, y },
                        id: `pattern_${patterns.length + 1}`
                    });
                    
                    // Skip ahead to avoid duplicates
                    x += config.sampleSize;
                }
            }
        }
        
        return patterns;
    }

    /**
     * 🤖 IDENTIFY PATTERNS WITH VLM
     */
    async identifyPatternsWithVLM(patterns) {
        const identified = [];
        const prompt = this.catalog.generateVLMPrompt();
        
        for (const pattern of patterns) {
            try {
                console.log(`   🤖 Identifying pattern ${pattern.id}...`);
                
                // Convert canvas to base64
                const imageBase64 = pattern.canvas.toBuffer('image/png').toString('base64');
                
                // Call VLM
                const response = await ollama.generate({
                    model: this.config.vlm.model,
                    prompt: prompt,
                    images: [imageBase64],
                    options: {
                        temperature: this.config.vlm.temperature,
                        max_tokens: this.config.vlm.maxTokens
                    }
                });
                
                // Parse VLM response
                const identification = this.parseVLMResponse(response.response);
                
                if (identification) {
                    identified.push({
                        ...identification,
                        patternImage: pattern.canvas,
                        patternId: pattern.id,
                        location: pattern.location
                    });
                }
                
            } catch (error) {
                console.warn(`   ⚠️ Failed to identify ${pattern.id}:`, error.message);
            }
        }
        
        // Remove duplicates
        return this.deduplicatePatterns(identified);
    }

    /**
     * 📝 PARSE VLM RESPONSE
     */
    parseVLMResponse(response) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    elementType: parsed.elementType || 'unknown',
                    category: parsed.category || 'unknown',
                    measurementType: parsed.measurementType || 'none',
                    confidence: parsed.confidence || 0.5
                };
            }
            
            // Fallback parsing
            return this.parseVLMResponseFallback(response);
            
        } catch (error) {
            console.warn('Failed to parse VLM response:', error.message);
            return null;
        }
    }

    /**
     * 📝 PARSE VLM RESPONSE FALLBACK
     */
    parseVLMResponseFallback(response) {
        const lower = response.toLowerCase();
        
        // Try to identify category
        let category = 'unknown';
        if (lower.includes('wall') || lower.includes('wand') || lower.includes('beton')) {
            category = 'wall';
        } else if (lower.includes('opening') || lower.includes('durchbruch') || lower.includes('door') || lower.includes('window')) {
            category = 'opening';
        } else if (lower.includes('reference') || lower.includes('level') || lower.includes('ok') || lower.includes('uk')) {
            category = 'reference';
        }
        
        // Try to identify measurement type
        let measurementType = 'none';
        if (lower.includes('area') || lower.includes('m²') || category === 'wall') {
            measurementType = 'area';
        } else if (lower.includes('count') || lower.includes('number') || category === 'opening') {
            measurementType = 'count';
        }
        
        // Try to extract element type
        let elementType = 'unknown';
        const catalog = new LegendElementCatalog();
        for (const element of catalog.getWallElements()) {
            if (lower.includes(element.name.toLowerCase())) {
                elementType = element.name;
                break;
            }
        }
        
        return {
            elementType: elementType,
            category: category,
            measurementType: measurementType,
            confidence: 0.6
        };
    }

    /**
     * 🔍 FIND PATTERN IN PLAN
     */
    async findPatternInPlan(planCanvas, legendItem, patternFeatures) {
        const matches = [];
        const config = this.config.scanning;
        
        // Process in tiles for efficiency
        const tilesX = Math.ceil(planCanvas.width / config.tileSize);
        const tilesY = Math.ceil(planCanvas.height / config.tileSize);
        const totalTiles = tilesX * tilesY;
        
        let tilesProcessed = 0;
        
        for (let ty = 0; ty < tilesY; ty++) {
            for (let tx = 0; tx < tilesX; tx++) {
                // Extract tile
                const tileX = tx * (config.tileSize - config.overlap);
                const tileY = ty * (config.tileSize - config.overlap);
                const tileWidth = Math.min(config.tileSize, planCanvas.width - tileX);
                const tileHeight = Math.min(config.tileSize, planCanvas.height - tileY);
                
                const tileCanvas = createCanvas(tileWidth, tileHeight);
                const tileCtx = tileCanvas.getContext('2d');
                
                tileCtx.drawImage(
                    planCanvas,
                    tileX, tileY, tileWidth, tileHeight,
                    0, 0, tileWidth, tileHeight
                );
                
                // Search for pattern in tile
                const tileMatches = await this.searchPatternInTile(
                    tileCanvas,
                    legendItem,
                    patternFeatures,
                    tileX,
                    tileY
                );
                
                matches.push(...tileMatches);
                
                // Progress update
                tilesProcessed++;
                if (tilesProcessed % 10 === 0 || tilesProcessed === totalTiles) {
                    const progress = (tilesProcessed / totalTiles * 100).toFixed(0);
                    process.stdout.write(`\r      Scanning: ${progress}%`);
                }
            }
        }
        
        process.stdout.write('\r      Scanning: 100%\n');
        
        // Remove duplicate matches
        return this.removeDuplicateMatches(matches);
    }

    /**
     * 🔍 SEARCH PATTERN IN TILE
     */
    async searchPatternInTile(tileCanvas, legendItem, patternFeatures, offsetX, offsetY) {
        const matches = [];
        const sampleSize = this.config.patterns.sampleSize;
        const step = Math.floor(sampleSize / 2); // 50% overlap
        
        for (let y = 0; y < tileCanvas.height - sampleSize; y += step) {
            for (let x = 0; x < tileCanvas.width - sampleSize; x += step) {
                // Extract sample
                const sampleCanvas = createCanvas(sampleSize, sampleSize);
                const sampleCtx = sampleCanvas.getContext('2d');
                
                sampleCtx.drawImage(
                    tileCanvas,
                    x, y, sampleSize, sampleSize,
                    0, 0, sampleSize, sampleSize
                );
                
                // Extract features
                const sampleFeatures = this.textureAnalyzer.extractTextureFeatures(sampleCanvas);
                
                // Compare patterns
                const similarity = this.textureAnalyzer.comparePatterns(
                    patternFeatures,
                    sampleFeatures
                );
                
                // Check if match
                if (similarity.overall >= this.config.scanning.minConfidence) {
                    // Validate context
                    const isValid = this.textureAnalyzer.validateMatchContext(
                        { x: x + offsetX, y: y + offsetY, width: sampleSize, height: sampleSize },
                        legendItem.category,
                        tileCanvas
                    );
                    
                    if (isValid) {
                        matches.push({
                            x: x + offsetX,
                            y: y + offsetY,
                            width: sampleSize,
                            height: sampleSize,
                            confidence: similarity.overall,
                            elementType: legendItem.elementType
                        });
                    }
                }
            }
        }
        
        return matches;
    }

    /**
     * 📐 CALCULATE TOTAL AREA
     */
    calculateTotalArea(matches, scale) {
        const pixelsPerSquareMeter = scale.pixelsPerMeter * scale.pixelsPerMeter;
        let totalPixels = 0;
        
        for (const match of matches) {
            totalPixels += match.width * match.height;
        }
        
        return totalPixels / pixelsPerSquareMeter;
    }

    /**
     * 🔄 REMOVE DUPLICATE MATCHES
     */
    removeDuplicateMatches(matches, overlapThreshold = 0.5) {
        const unique = [];
        
        for (const match of matches) {
            let isDuplicate = false;
            
            for (const existing of unique) {
                const overlap = this.calculateOverlap(match, existing);
                if (overlap > overlapThreshold) {
                    // Keep the one with higher confidence
                    if (match.confidence > existing.confidence) {
                        const index = unique.indexOf(existing);
                        unique[index] = match;
                    }
                    isDuplicate = true;
                    break;
                }
            }
            
            if (!isDuplicate) {
                unique.push(match);
            }
        }
        
        return unique;
    }

    /**
     * 📊 CALCULATE OVERLAP
     */
    calculateOverlap(rect1, rect2) {
        const x1 = Math.max(rect1.x, rect2.x);
        const y1 = Math.max(rect1.y, rect2.y);
        const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
        const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
        
        if (x2 <= x1 || y2 <= y1) return 0;
        
        const intersectionArea = (x2 - x1) * (y2 - y1);
        const area1 = rect1.width * rect1.height;
        const area2 = rect2.width * rect2.height;
        
        return intersectionArea / Math.min(area1, area2);
    }

    /**
     * 🔄 DEDUPLICATE PATTERNS
     */
    deduplicatePatterns(patterns) {
        const unique = [];
        const seen = new Set();
        
        for (const pattern of patterns) {
            const key = `${pattern.elementType}_${pattern.category}`;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(pattern);
            }
        }
        
        return unique;
    }

    /**
     * 📊 GENERATE SUMMARY
     */
    generateSummary(results) {
        const wallResults = results.filter(r => r.category === 'wall');
        const openingResults = results.filter(r => r.category === 'opening');
        
        const totalWallArea = wallResults.reduce((sum, r) => sum + (r.measurement || 0), 0);
        const totalOpenings = openingResults.reduce((sum, r) => sum + (r.measurement || 0), 0);
        
        const allMatches = results.reduce((sum, r) => sum + r.matches, 0);
        const totalConfidence = results.reduce((sum, r) => sum + r.averageConfidence * r.matches, 0);
        const averageConfidence = allMatches > 0 ? totalConfidence / allMatches : 0;
        
        return {
            totalWallArea: totalWallArea,
            totalOpenings: totalOpenings,
            wallTypes: wallResults.length,
            openingTypes: openingResults.length,
            totalElements: results.length,
            totalMatches: allMatches,
            averageConfidence: averageConfidence
        };
    }

    /**
     * 🎨 GENERATE ANNOTATED OUTPUT
     */
    async generateAnnotatedOutput(planCanvas, results, baseName) {
        // Create output canvas
        const canvas = createCanvas(planCanvas.width, planCanvas.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original plan
        ctx.drawImage(planCanvas, 0, 0);
        
        // Color map for different element types
        const colors = {
            'Stahlbeton': '#FF0000',
            'MW KS': '#00FF00',
            'Dämmung': '#0000FF',
            'Trockenbau': '#FF00FF',
            'Holz': '#8B4513',
            'Metall': '#808080',
            'WD': '#FFD700',
            'DD': '#FFA500',
            'BD': '#FF6347'
        };
        
        // Draw matches
        ctx.globalAlpha = 0.3;
        
        for (const result of results) {
            // Find color for this element type
            let color = '#FFFF00'; // Default yellow
            for (const [key, col] of Object.entries(colors)) {
                if (result.element.includes(key)) {
                    color = col;
                    break;
                }
            }
            
            ctx.fillStyle = color;
            
            // Draw all matches for this element
            for (const location of result.locations) {
                ctx.fillRect(location.x, location.y, 50, 50); // Simplified visualization
            }
        }
        
        ctx.globalAlpha = 1.0;
        
        // Add legend
        this.drawLegend(ctx, results, colors);
        
        // Add statistics
        this.drawStatistics(ctx, results);
        
        // Save output
        const outputDir = path.join(process.cwd(), 'vlm_analysis_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputPath = path.join(outputDir, `${baseName}_vlm_analysis.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        // Save JSON data
        const dataPath = path.join(outputDir, `${baseName}_vlm_data.json`);
        await fs.writeFile(dataPath, JSON.stringify({
            scale: this.scale,
            results: results.map(r => ({
                element: r.element,
                category: r.category,
                measurement: r.measurement,
                unit: r.unit,
                matches: r.matches,
                confidence: r.averageConfidence,
                dinCode: r.dinCode
            })),
            summary: this.generateSummary(results),
            timestamp: new Date().toISOString()
        }, null, 2));
        
        return outputPath;
    }

    /**
     * 🎨 DRAW LEGEND
     */
    drawLegend(ctx, results, colors) {
        const x = ctx.canvas.width - 400;
        const y = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - 10, y - 10, 380, 300);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('DETECTED ELEMENTS', x, y + 10);
        
        // Elements
        ctx.font = '14px Arial';
        let yPos = y + 40;
        
        for (const result of results.slice(0, 10)) { // Show top 10
            // Color box
            let color = '#FFFF00';
            for (const [key, col] of Object.entries(colors)) {
                if (result.element.includes(key)) {
                    color = col;
                    break;
                }
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(x, yPos - 12, 20, 15);
            
            // Text
            ctx.fillStyle = 'black';
            const text = `${result.element}: ${result.measurement.toFixed(2)} ${result.unit}`;
            ctx.fillText(text, x + 30, yPos);
            
            yPos += 20;
        }
    }

    /**
     * 📊 DRAW STATISTICS
     */
    drawStatistics(ctx, results) {
        const x = 50;
        const y = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x - 10, y - 10, 400, 200);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('VLM ANALYSIS RESULTS', x, y + 15);
        
        // Scale
        ctx.font = '14px Arial';
        ctx.fillText(`Scale: ${this.scale.notation}`, x, y + 40);
        
        // Summary
        const summary = this.generateSummary(results);
        ctx.fillText(`Total wall area: ${summary.totalWallArea.toFixed(2)} m²`, x, y + 65);
        ctx.fillText(`Total openings: ${summary.totalOpenings}`, x, y + 85);
        ctx.fillText(`Elements analyzed: ${summary.totalElements}`, x, y + 105);
        ctx.fillText(`Total matches: ${summary.totalMatches}`, x, y + 125);
        ctx.fillText(`Average confidence: ${(summary.averageConfidence * 100).toFixed(1)}%`, x, y + 145);
    }

    /**
     * 🔍 CHECK IF LOCATION HAS PATTERN
     */
    hasPattern(pixels, x, y, width) {
        // Simple check if there's non-white content
        let nonWhiteCount = 0;
        const sampleSize = 20;
        
        for (let dy = 0; dy < sampleSize; dy++) {
            for (let dx = 0; dx < sampleSize; dx++) {
                const idx = ((y + dy) * width + (x + dx)) * 4;
                if (idx < pixels.length) {
                    const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
                    if (gray < 240) nonWhiteCount++;
                }
            }
        }
        
        // Return true if more than 10% is non-white
        return nonWhiteCount > (sampleSize * sampleSize * 0.1);
    }
}

export { VLMSequentialLegendAnalyzer };
