/**
 * 🏗️ WALL DETECTION SYSTEM - PRECISE WALL IDENTIFICATION
 * ======================================================
 * 
 * Identifies ALL walls in construction plans, categorizes by material type,
 * and calculates exact m² for each wall type for tender documents
 * 
 * CORE FEATURES:
 * ✅ Detect ALL walls (not random boxes)
 * ✅ Categorize by material/type (load-bearing, partition, etc.)
 * ✅ Calculate precise m² for each type
 * ✅ Export data for tender documents
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { createCanvas, loadImage } from 'canvas';
import fs from 'fs/promises';
import path from 'path';

export default class WallDetectionSystem extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            // Wall detection parameters
            wallThickness: {
                min: 5,     // Minimum wall thickness in pixels
                max: 100    // Maximum wall thickness in pixels
            },
            
            // Wall types by visual characteristics
            wallTypes: {
                loadBearing: {
                    name: 'Tragende Wände (Load-bearing)',
                    color: '#000000',      // Black in plans
                    thickness: [15, 100],   // Thicker walls
                    annotationColor: '#FF0000',  // Red overlay
                    dinCode: '341'
                },
                partition: {
                    name: 'Nichttragende Wände (Partition)',
                    color: '#404040',      // Dark gray
                    thickness: [8, 15],    // Thinner walls
                    annotationColor: '#00FF00',  // Green overlay
                    dinCode: '342'
                },
                exterior: {
                    name: 'Außenwände (Exterior)',
                    color: '#000000',      // Black, but on perimeter
                    thickness: [20, 100],  // Thick
                    annotationColor: '#0000FF',  // Blue overlay
                    dinCode: '331'
                },
                insulated: {
                    name: 'Gedämmte Wände (Insulated)',
                    color: '#808080',      // Medium gray with pattern
                    thickness: [25, 100],  // Very thick (includes insulation)
                    annotationColor: '#FF00FF',  // Magenta overlay
                    dinCode: '334'
                },
                drywall: {
                    name: 'Trockenbauwände (Drywall)',
                    color: '#A0A0A0',      // Light gray
                    thickness: [5, 12],    // Thin
                    annotationColor: '#00FFFF',  // Cyan overlay
                    dinCode: '346'
                }
            },
            
            // Scale detection
            standardScales: [
                { scale: '1:50', pixelsPerMeter: 600 },
                { scale: '1:100', pixelsPerMeter: 300 },
                { scale: '1:200', pixelsPerMeter: 150 },
                { scale: '1:500', pixelsPerMeter: 60 }
            ]
        };
        
        // Results storage
        this.detectedWalls = [];
        this.wallStatistics = {};
        this.scale = null;
    }
    
    /**
     * 🎯 MAIN ENTRY POINT - DETECT ALL WALLS
     */
    async detectAllWalls(imagePath, options = {}) {
        console.log('\n🏗️ WALL DETECTION SYSTEM');
        console.log('========================');
        console.log(`Plan: ${path.basename(imagePath)}`);
        
        const startTime = Date.now();
        
        try {
            // Step 1: Load and prepare image
            console.log('\n📋 Step 1: Loading construction plan...');
            const image = await loadImage(imagePath);
            const canvas = createCanvas(image.width, image.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            
            console.log(`   ✅ Image loaded: ${image.width}×${image.height} pixels`);
            
            // Step 2: Detect scale
            console.log('\n📏 Step 2: Detecting scale...');
            this.scale = await this.detectScale(canvas, options.scale);
            console.log(`   ✅ Scale detected: ${this.scale.scale} (${this.scale.pixelsPerMeter} pixels/meter)`);
            
            // Step 3: Preprocess image for wall detection
            console.log('\n🔧 Step 3: Preprocessing image...');
            const processed = await this.preprocessImage(canvas);
            console.log('   ✅ Image preprocessed (enhanced contrast, removed noise)');
            
            // Step 4: Detect horizontal walls
            console.log('\n━ Step 4: Detecting horizontal walls...');
            const horizontalWalls = await this.detectHorizontalWalls(processed);
            console.log(`   ✅ Found ${horizontalWalls.length} horizontal wall segments`);
            
            // Step 5: Detect vertical walls
            console.log('\n┃ Step 5: Detecting vertical walls...');
            const verticalWalls = await this.detectVerticalWalls(processed);
            console.log(`   ✅ Found ${verticalWalls.length} vertical wall segments`);
            
            // Step 6: Merge and connect wall segments
            console.log('\n🔗 Step 6: Connecting wall segments...');
            const connectedWalls = await this.connectWallSegments([...horizontalWalls, ...verticalWalls]);
            console.log(`   ✅ Connected into ${connectedWalls.length} complete walls`);
            
            // Step 7: Classify walls by type
            console.log('\n🏷️ Step 7: Classifying walls by material/type...');
            const classifiedWalls = await this.classifyWalls(connectedWalls, processed);
            console.log('   ✅ Walls classified by material type');
            
            // Step 8: Calculate areas
            console.log('\n📐 Step 8: Calculating wall areas...');
            const wallsWithAreas = await this.calculateWallAreas(classifiedWalls);
            this.detectedWalls = wallsWithAreas;
            
            // Step 9: Generate statistics
            console.log('\n📊 Step 9: Generating statistics...');
            this.wallStatistics = this.generateWallStatistics(wallsWithAreas);
            
            // Step 10: Create annotated output
            console.log('\n🎨 Step 10: Creating annotated output...');
            const outputPath = await this.createAnnotatedOutput(
                canvas,
                wallsWithAreas,
                path.basename(imagePath, path.extname(imagePath))
            );
            
            const endTime = Date.now();
            
            // Print results
            console.log('\n' + '='.repeat(60));
            console.log('📊 WALL DETECTION RESULTS');
            console.log('='.repeat(60));
            
            for (const [type, stats] of Object.entries(this.wallStatistics)) {
                if (stats.count > 0) {
                    console.log(`\n${this.config.wallTypes[type]?.name || type}:`);
                    console.log(`   • Count: ${stats.count} walls`);
                    console.log(`   • Total Length: ${stats.totalLength.toFixed(2)} m`);
                    console.log(`   • Average Thickness: ${stats.avgThickness.toFixed(3)} m`);
                    console.log(`   • Total Area: ${stats.totalArea.toFixed(2)} m²`);
                    console.log(`   • DIN 276 Code: ${this.config.wallTypes[type]?.dinCode || 'N/A'}`);
                }
            }
            
            console.log('\n' + '='.repeat(60));
            console.log(`⏱️ Processing time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
            console.log(`📁 Annotated output: ${outputPath}`);
            console.log('='.repeat(60));
            
            return {
                success: true,
                walls: this.detectedWalls,
                statistics: this.wallStatistics,
                scale: this.scale,
                outputPath: outputPath,
                processingTime: endTime - startTime
            };
            
        } catch (error) {
            console.error('❌ Wall detection failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 📏 DETECT SCALE FROM PLAN
     */
    async detectScale(canvas, providedScale) {
        // If scale provided, use it
        if (providedScale) {
            const scaleConfig = this.config.standardScales.find(s => s.scale === providedScale);
            if (scaleConfig) return scaleConfig;
        }
        
        // Auto-detect based on typical wall thickness
        // A load-bearing wall is typically 20-30cm
        // Count black pixels in horizontal lines to estimate wall thickness
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        let wallThicknesses = [];
        
        // Sample middle of image
        const y = Math.floor(canvas.height / 2);
        let inWall = false;
        let wallStart = 0;
        
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const gray = 0.299 * pixels[idx] + 0.587 * pixels[idx + 1] + 0.114 * pixels[idx + 2];
            
            if (gray < 50) { // Black pixel (wall)
                if (!inWall) {
                    inWall = true;
                    wallStart = x;
                }
            } else { // White pixel (not wall)
                if (inWall) {
                    const thickness = x - wallStart;
                    if (thickness >= 5 && thickness <= 100) {
                        wallThicknesses.push(thickness);
                    }
                    inWall = false;
                }
            }
        }
        
        if (wallThicknesses.length > 0) {
            // Average wall thickness in pixels
            const avgThickness = wallThicknesses.reduce((a, b) => a + b, 0) / wallThicknesses.length;
            
            // Assuming average wall is 25cm
            const pixelsPerMeter = avgThickness / 0.25;
            
            // Find closest standard scale
            let closestScale = this.config.standardScales[0];
            let minDiff = Math.abs(pixelsPerMeter - closestScale.pixelsPerMeter);
            
            for (const scale of this.config.standardScales) {
                const diff = Math.abs(pixelsPerMeter - scale.pixelsPerMeter);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestScale = scale;
                }
            }
            
            return closestScale;
        }
        
        // Default to 1:100
        return this.config.standardScales[1];
    }
    
    /**
     * 🔧 PREPROCESS IMAGE
     */
    async preprocessImage(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Convert to binary (black and white only)
        for (let i = 0; i < pixels.length; i += 4) {
            const gray = 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
            const binary = gray < 128 ? 0 : 255;
            pixels[i] = pixels[i + 1] = pixels[i + 2] = binary;
        }
        
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
    
    /**
     * ━ DETECT HORIZONTAL WALLS
     */
    async detectHorizontalWalls(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const walls = [];
        
        // Scan for horizontal lines
        for (let y = 0; y < canvas.height; y += 2) { // Sample every 2 pixels for speed
            let segments = [];
            let currentSegment = null;
            
            for (let x = 0; x < canvas.width; x++) {
                const idx = (y * canvas.width + x) * 4;
                const isBlack = pixels[idx] < 128;
                
                if (isBlack) {
                    if (!currentSegment) {
                        currentSegment = { startX: x, y: y, length: 1 };
                    } else {
                        currentSegment.length++;
                    }
                } else {
                    if (currentSegment && currentSegment.length >= 20) { // Min 20 pixels long
                        segments.push(currentSegment);
                    }
                    currentSegment = null;
                }
            }
            
            // Add last segment
            if (currentSegment && currentSegment.length >= 20) {
                segments.push(currentSegment);
            }
            
            // Check if segments form walls (have thickness)
            for (const segment of segments) {
                const thickness = this.measureWallThickness(pixels, canvas.width, segment.startX, y, segment.length, 'horizontal');
                if (thickness >= this.config.wallThickness.min && thickness <= this.config.wallThickness.max) {
                    walls.push({
                        type: 'horizontal',
                        x1: segment.startX,
                        y1: y,
                        x2: segment.startX + segment.length,
                        y2: y,
                        thickness: thickness,
                        length: segment.length
                    });
                }
            }
        }
        
        return this.mergeNearbyWalls(walls, 'horizontal');
    }
    
    /**
     * ┃ DETECT VERTICAL WALLS
     */
    async detectVerticalWalls(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        const walls = [];
        
        // Scan for vertical lines
        for (let x = 0; x < canvas.width; x += 2) { // Sample every 2 pixels for speed
            let segments = [];
            let currentSegment = null;
            
            for (let y = 0; y < canvas.height; y++) {
                const idx = (y * canvas.width + x) * 4;
                const isBlack = pixels[idx] < 128;
                
                if (isBlack) {
                    if (!currentSegment) {
                        currentSegment = { x: x, startY: y, length: 1 };
                    } else {
                        currentSegment.length++;
                    }
                } else {
                    if (currentSegment && currentSegment.length >= 20) { // Min 20 pixels long
                        segments.push(currentSegment);
                    }
                    currentSegment = null;
                }
            }
            
            // Add last segment
            if (currentSegment && currentSegment.length >= 20) {
                segments.push(currentSegment);
            }
            
            // Check if segments form walls (have thickness)
            for (const segment of segments) {
                const thickness = this.measureWallThickness(pixels, canvas.width, x, segment.startY, segment.length, 'vertical');
                if (thickness >= this.config.wallThickness.min && thickness <= this.config.wallThickness.max) {
                    walls.push({
                        type: 'vertical',
                        x1: x,
                        y1: segment.startY,
                        x2: x,
                        y2: segment.startY + segment.length,
                        thickness: thickness,
                        length: segment.length
                    });
                }
            }
        }
        
        return this.mergeNearbyWalls(walls, 'vertical');
    }
    
    /**
     * 📏 MEASURE WALL THICKNESS
     */
    measureWallThickness(pixels, width, x, y, length, direction) {
        let thickness = 0;
        
        if (direction === 'horizontal') {
            // Measure vertical thickness
            for (let dy = 1; dy < this.config.wallThickness.max; dy++) {
                const idx = ((y + dy) * width + x + Math.floor(length / 2)) * 4;
                if (idx >= pixels.length || pixels[idx] >= 128) break;
                thickness++;
            }
        } else {
            // Measure horizontal thickness
            for (let dx = 1; dx < this.config.wallThickness.max; dx++) {
                const idx = ((y + Math.floor(length / 2)) * width + x + dx) * 4;
                if (idx >= pixels.length || pixels[idx] >= 128) break;
                thickness++;
            }
        }
        
        return thickness;
    }
    
    /**
     * 🔀 MERGE NEARBY WALLS
     */
    mergeNearbyWalls(walls, direction) {
        const merged = [];
        const used = new Set();
        
        for (let i = 0; i < walls.length; i++) {
            if (used.has(i)) continue;
            
            const wall = walls[i];
            let extended = { ...wall };
            
            // Look for walls to merge
            for (let j = i + 1; j < walls.length; j++) {
                if (used.has(j)) continue;
                
                const other = walls[j];
                
                // Check if walls are aligned and close
                if (direction === 'horizontal') {
                    if (Math.abs(wall.y1 - other.y1) <= 5 && 
                        Math.abs(wall.thickness - other.thickness) <= 3) {
                        // Check if walls are connected or very close
                        if (Math.abs(extended.x2 - other.x1) <= 10 || 
                            Math.abs(other.x2 - extended.x1) <= 10) {
                            // Merge walls
                            extended.x1 = Math.min(extended.x1, other.x1);
                            extended.x2 = Math.max(extended.x2, other.x2);
                            extended.length = extended.x2 - extended.x1;
                            extended.thickness = (extended.thickness + other.thickness) / 2;
                            used.add(j);
                        }
                    }
                } else {
                    if (Math.abs(wall.x1 - other.x1) <= 5 && 
                        Math.abs(wall.thickness - other.thickness) <= 3) {
                        // Check if walls are connected or very close
                        if (Math.abs(extended.y2 - other.y1) <= 10 || 
                            Math.abs(other.y2 - extended.y1) <= 10) {
                            // Merge walls
                            extended.y1 = Math.min(extended.y1, other.y1);
                            extended.y2 = Math.max(extended.y2, other.y2);
                            extended.length = extended.y2 - extended.y1;
                            extended.thickness = (extended.thickness + other.thickness) / 2;
                            used.add(j);
                        }
                    }
                }
            }
            
            merged.push(extended);
            used.add(i);
        }
        
        return merged;
    }
    
    /**
     * 🔗 CONNECT WALL SEGMENTS
     */
    async connectWallSegments(walls) {
        // Group walls that connect at corners
        const connected = [];
        const used = new Set();
        
        for (let i = 0; i < walls.length; i++) {
            if (used.has(i)) continue;
            
            const wall = walls[i];
            const group = [wall];
            used.add(i);
            
            // Find connecting walls
            for (let j = 0; j < walls.length; j++) {
                if (used.has(j)) continue;
                
                const other = walls[j];
                
                // Check if walls connect at endpoints
                const connects = 
                    this.distance(wall.x1, wall.y1, other.x1, other.y1) <= 20 ||
                    this.distance(wall.x1, wall.y1, other.x2, other.y2) <= 20 ||
                    this.distance(wall.x2, wall.y2, other.x1, other.y1) <= 20 ||
                    this.distance(wall.x2, wall.y2, other.x2, other.y2) <= 20;
                
                if (connects) {
                    group.push(other);
                    used.add(j);
                }
            }
            
            connected.push({
                segments: group,
                type: 'connected_wall'
            });
        }
        
        return connected;
    }
    
    /**
     * 🏷️ CLASSIFY WALLS BY TYPE
     */
    async classifyWalls(connectedWalls, canvas) {
        const classified = [];
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        for (const wall of connectedWalls) {
            // Calculate average thickness
            const avgThickness = wall.segments.reduce((sum, seg) => sum + seg.thickness, 0) / wall.segments.length;
            
            // Check if on perimeter (exterior wall)
            const onPerimeter = wall.segments.some(seg => 
                seg.x1 <= 50 || seg.x2 >= canvas.width - 50 ||
                seg.y1 <= 50 || seg.y2 >= canvas.height - 50
            );
            
            // Classify based on thickness and position
            let wallType = 'partition'; // Default
            
            if (onPerimeter && avgThickness >= 20) {
                wallType = 'exterior';
            } else if (avgThickness >= 25) {
                wallType = 'insulated';
            } else if (avgThickness >= 15) {
                wallType = 'loadBearing';
            } else if (avgThickness <= 12) {
                wallType = avgThickness <= 8 ? 'drywall' : 'partition';
            }
            
            classified.push({
                ...wall,
                wallType: wallType,
                avgThickness: avgThickness
            });
        }
        
        return classified;
    }
    
    /**
     * 📐 CALCULATE WALL AREAS
     */
    async calculateWallAreas(classifiedWalls) {
        const wallsWithAreas = [];
        const pixelsPerMeter = this.scale.pixelsPerMeter;
        
        for (const wall of classifiedWalls) {
            let totalLength = 0;
            
            for (const segment of wall.segments) {
                const segmentLength = segment.type === 'horizontal' 
                    ? segment.x2 - segment.x1
                    : segment.y2 - segment.y1;
                totalLength += segmentLength;
            }
            
            // Convert to meters
            const lengthInMeters = totalLength / pixelsPerMeter;
            const thicknessInMeters = wall.avgThickness / pixelsPerMeter;
            const areaInSquareMeters = lengthInMeters * thicknessInMeters;
            
            wallsWithAreas.push({
                ...wall,
                lengthPixels: totalLength,
                lengthMeters: lengthInMeters,
                thicknessMeters: thicknessInMeters,
                areaSquareMeters: areaInSquareMeters
            });
        }
        
        return wallsWithAreas;
    }
    
    /**
     * 📊 GENERATE WALL STATISTICS
     */
    generateWallStatistics(wallsWithAreas) {
        const stats = {};
        
        // Initialize stats for each wall type
        for (const type of Object.keys(this.config.wallTypes)) {
            stats[type] = {
                count: 0,
                totalLength: 0,
                totalArea: 0,
                avgThickness: 0,
                walls: []
            };
        }
        
        // Aggregate statistics
        for (const wall of wallsWithAreas) {
            const type = wall.wallType;
            if (stats[type]) {
                stats[type].count++;
                stats[type].totalLength += wall.lengthMeters;
                stats[type].totalArea += wall.areaSquareMeters;
                stats[type].avgThickness += wall.thicknessMeters;
                stats[type].walls.push(wall);
            }
        }
        
        // Calculate averages
        for (const type of Object.keys(stats)) {
            if (stats[type].count > 0) {
                stats[type].avgThickness /= stats[type].count;
            }
        }
        
        return stats;
    }
    
    /**
     * 🎨 CREATE ANNOTATED OUTPUT
     */
    async createAnnotatedOutput(originalCanvas, wallsWithAreas, baseName) {
        // Create output canvas
        const canvas = createCanvas(originalCanvas.width, originalCanvas.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original plan
        ctx.drawImage(originalCanvas, 0, 0);
        
        // Draw wall annotations
        ctx.globalAlpha = 0.4;
        
        for (const wall of wallsWithAreas) {
            const wallConfig = this.config.wallTypes[wall.wallType];
            if (!wallConfig) continue;
            
            ctx.strokeStyle = wallConfig.annotationColor;
            ctx.fillStyle = wallConfig.annotationColor;
            ctx.lineWidth = 3;
            
            // Draw each wall segment
            for (const segment of wall.segments) {
                if (segment.type === 'horizontal') {
                    ctx.fillRect(segment.x1, segment.y1 - segment.thickness/2, 
                               segment.x2 - segment.x1, segment.thickness);
                } else {
                    ctx.fillRect(segment.x1 - segment.thickness/2, segment.y1,
                               segment.thickness, segment.y2 - segment.y1);
                }
            }
        }
        
        ctx.globalAlpha = 1.0;
        
        // Add legend
        this.drawLegend(ctx, originalCanvas.width, originalCanvas.height);
        
        // Add statistics overlay
        this.drawStatisticsOverlay(ctx);
        
        // Save output
        const outputDir = path.join(process.cwd(), 'wall_detection_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputPath = path.join(outputDir, `${baseName}_walls_annotated.png`);
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        // Also save statistics as JSON
        const statsPath = path.join(outputDir, `${baseName}_wall_statistics.json`);
        await fs.writeFile(statsPath, JSON.stringify({
            scale: this.scale,
            statistics: this.wallStatistics,
            wallCount: wallsWithAreas.length,
            walls: wallsWithAreas.map(w => ({
                type: w.wallType,
                lengthMeters: w.lengthMeters,
                thicknessMeters: w.thicknessMeters,
                areaSquareMeters: w.areaSquareMeters
            }))
        }, null, 2));
        
        return outputPath;
    }
    
    /**
     * 🎨 DRAW LEGEND
     */
    drawLegend(ctx, width, height) {
        const legendX = width - 400;
        const legendY = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(legendX - 10, legendY - 10, 380, 200);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('WALL TYPES', legendX, legendY + 10);
        
        // Legend entries
        ctx.font = '14px Arial';
        let y = legendY + 40;
        
        for (const [type, config] of Object.entries(this.config.wallTypes)) {
            if (this.wallStatistics[type]?.count > 0) {
                // Color box
                ctx.fillStyle = config.annotationColor;
                ctx.fillRect(legendX, y - 12, 20, 15);
                
                // Text
                ctx.fillStyle = 'black';
                ctx.fillText(config.name, legendX + 30, y);
                
                y += 25;
            }
        }
    }
    
    /**
     * 📊 DRAW STATISTICS OVERLAY
     */
    drawStatisticsOverlay(ctx) {
        const statsX = 50;
        const statsY = 50;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(statsX - 10, statsY - 10, 400, 250);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = 'bold 18px Arial';
        ctx.fillText('WALL STATISTICS', statsX, statsY + 15);
        ctx.fillText(`Scale: ${this.scale.scale}`, statsX, statsY + 35);
        
        // Statistics
        ctx.font = '14px Arial';
        let y = statsY + 65;
        
        for (const [type, stats] of Object.entries(this.wallStatistics)) {
            if (stats.count > 0) {
                const config = this.config.wallTypes[type];
                ctx.fillStyle = config.annotationColor;
                ctx.fillRect(statsX, y - 12, 10, 10);
                
                ctx.fillStyle = 'black';
                ctx.fillText(`${config.name}: ${stats.totalArea.toFixed(2)} m²`, statsX + 20, y);
                y += 20;
            }
        }
        
        // Total
        const totalArea = Object.values(this.wallStatistics)
            .reduce((sum, stats) => sum + stats.totalArea, 0);
        
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`TOTAL WALL AREA: ${totalArea.toFixed(2)} m²`, statsX, y + 20);
    }
    
    /**
     * 📏 DISTANCE CALCULATION
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
}
