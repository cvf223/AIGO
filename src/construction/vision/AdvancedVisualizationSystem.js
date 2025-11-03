/**
 * 🎨 ADVANCED VISUALIZATION SYSTEM
 * ================================
 * 
 * Top 1% expert implementation for stunning construction plan visualization
 * with pixel-precise overlays and professional rendering
 * 
 * @author Elite Construction AI Syndicate
 * @version 3.0.0 - Production Excellence
 */

import { createCanvas, loadImage } from 'canvas';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export default class AdvancedVisualizationSystem {
    constructor() {
        // Professional color palette for construction elements
        this.colorPalette = {
            // Walls - Solid fills with transparency
            'Stahlbeton': { color: 'rgba(139, 69, 19, 0.6)', pattern: 'solid', name: 'Reinforced Concrete' },
            'MW KS 2.0': { color: 'rgba(255, 165, 0, 0.6)', pattern: 'solid', name: 'Masonry KS 2.0' },
            'MW KS 2.2': { color: 'rgba(255, 140, 0, 0.6)', pattern: 'solid', name: 'Masonry KS 2.2' },
            'Trockenbau': { color: 'rgba(144, 238, 144, 0.5)', pattern: 'solid', name: 'Drywall' },
            'Trockenbau imprägniert': { color: 'rgba(0, 128, 0, 0.5)', pattern: 'solid', name: 'Waterproof Drywall' },
            'Holz': { color: 'rgba(160, 82, 45, 0.6)', pattern: 'solid', name: 'Wood' },
            'Metall': { color: 'rgba(105, 105, 105, 0.6)', pattern: 'solid', name: 'Metal' },
            'Dämmung hart': { color: 'rgba(255, 192, 203, 0.5)', pattern: 'hatched', name: 'Hard Insulation' },
            'Dämmung weich': { color: 'rgba(255, 182, 193, 0.5)', pattern: 'dotted', name: 'Soft Insulation' },
            'Erdreich': { color: 'rgba(139, 90, 43, 0.6)', pattern: 'solid', name: 'Earth/Ground' },
            'Bestand': { color: 'rgba(128, 128, 128, 0.4)', pattern: 'solid', name: 'Existing' },
            'Abbruch': { color: 'rgba(255, 0, 0, 0.5)', pattern: 'dashed', name: 'Demolition' },
            
            // Openings - Bounding boxes with distinct shapes
            'WD': { color: 'rgba(0, 0, 255, 0.8)', pattern: 'box', shape: 'square', name: 'Wall Opening' },
            'BD': { color: 'rgba(0, 128, 255, 0.8)', pattern: 'box', shape: 'square', name: 'Floor Opening' },
            'DD': { color: 'rgba(0, 255, 255, 0.8)', pattern: 'box', shape: 'square', name: 'Ceiling Opening' },
            'Window': { color: 'rgba(135, 206, 235, 0.8)', pattern: 'box', shape: 'circle', name: 'Window' },
            'Door': { color: 'rgba(75, 0, 130, 0.8)', pattern: 'box', shape: 'square', name: 'Door' },
            'WS': { color: 'rgba(255, 140, 0, 0.7)', pattern: 'line', name: 'Wall Slot' },
            'BS': { color: 'rgba(255, 165, 0, 0.7)', pattern: 'line', name: 'Floor Slot' },
            'DSZ': { color: 'rgba(255, 215, 0, 0.7)', pattern: 'line', name: 'Ceiling Slot' },
            
            // Special elements
            'Fluchtweg': { color: 'rgba(0, 255, 0, 0.8)', pattern: 'arrow', name: 'Escape Route' },
            'Außenluftdurchlass': { color: 'rgba(173, 216, 230, 0.6)', pattern: 'circle', name: 'Air Vent' },
            
            // Default for unknown elements
            'default': { color: 'rgba(128, 128, 128, 0.3)', pattern: 'solid', name: 'Unknown' }
        };
        
        this.config = {
            visualization: {
                lineWidth: 2,
                boxPadding: 5,
                cornerRadius: 8,
                shadowBlur: 4,
                glowEffect: true,
                antialiasing: true
            },
            output: {
                quality: 95,
                format: 'png',
                htmlTemplate: true
            }
        };
    }

    /**
     * 🎨 CREATE STUNNING VISUALIZATION
     */
    async createVisualization(planImagePath, analysisResults, options = {}) {
        console.log('\n🎨 CREATING ADVANCED VISUALIZATION');
        console.log('==================================');
        
        const startTime = Date.now();
        
        try {
            // Load base plan image
            const baseImage = await loadImage(planImagePath);
            const width = baseImage.width;
            const height = baseImage.height;
            
            console.log(`📐 Plan dimensions: ${width}×${height} pixels`);
            
            // Create multiple overlay layers
            const layers = await this.createOverlayLayers(
                baseImage,
                analysisResults,
                options
            );
            
            // Generate composite images
            const compositeImages = await this.generateComposites(
                baseImage,
                layers,
                options
            );
            
            // Create interactive HTML viewer
            const htmlPath = await this.createInteractiveHTML(
                planImagePath,
                compositeImages,
                analysisResults,
                options
            );
            
            const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\n✅ Visualization complete in ${processingTime}s`);
            
            return {
                success: true,
                htmlViewer: htmlPath,
                layers: compositeImages,
                statistics: {
                    elementsVisualized: analysisResults.length,
                    processingTime: processingTime,
                    dimensions: `${width}×${height}`,
                    layersCreated: Object.keys(layers).length
                }
            };
            
        } catch (error) {
            console.error('❌ Visualization failed:', error.message);
            throw error;
        }
    }

    /**
     * 🎭 CREATE OVERLAY LAYERS
     */
    async createOverlayLayers(baseImage, analysisResults, options) {
        const width = baseImage.width;
        const height = baseImage.height;
        const layers = {};
        
        console.log(`\n🎭 Creating ${analysisResults.length} overlay layers...`);
        
        for (const result of analysisResults) {
            const elementType = result.elementType || result.element;
            const style = this.colorPalette[elementType] || this.colorPalette.default;
            
            // Create canvas for this element type
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            
            // Enable high-quality rendering
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Apply visualization based on pattern type
            if (style.pattern === 'solid' || style.pattern === 'hatched' || style.pattern === 'dotted') {
                await this.drawAreaOverlay(ctx, result, style);
            } else if (style.pattern === 'box') {
                await this.drawBoundingBoxes(ctx, result, style);
            } else if (style.pattern === 'line') {
                await this.drawLineOverlay(ctx, result, style);
            } else if (style.pattern === 'arrow') {
                await this.drawArrowOverlay(ctx, result, style);
            } else if (style.pattern === 'circle') {
                await this.drawCircleOverlay(ctx, result, style);
            }
            
            // Add labels if requested
            if (options.showLabels) {
                this.addLabels(ctx, result, style);
            }
            
            layers[elementType] = {
                canvas: canvas,
                style: style,
                elementCount: result.matches || result.locations?.length || 0
            };
            
            console.log(`   ✅ ${elementType}: ${layers[elementType].elementCount} elements`);
        }
        
        return layers;
    }

    /**
     * 🎨 DRAW AREA OVERLAY (for walls)
     */
    async drawAreaOverlay(ctx, result, style) {
        ctx.fillStyle = style.color;
        ctx.strokeStyle = style.color.replace('0.6', '1.0'); // Full opacity for borders
        ctx.lineWidth = this.config.visualization.lineWidth;
        
        // Apply glow effect if enabled
        if (this.config.visualization.glowEffect) {
            ctx.shadowColor = style.color.replace('0.6', '0.8');
            ctx.shadowBlur = this.config.visualization.shadowBlur;
        }
        
        // Draw each detected area
        if (result.locations && result.locations.length > 0) {
            for (const location of result.locations) {
                if (style.pattern === 'solid') {
                    // Solid fill
                    ctx.fillRect(location.x, location.y, location.width || 50, location.height || 50);
                } else if (style.pattern === 'hatched') {
                    // Hatched pattern
                    this.drawHatchedArea(ctx, location.x, location.y, location.width || 50, location.height || 50);
                } else if (style.pattern === 'dotted') {
                    // Dotted pattern
                    this.drawDottedArea(ctx, location.x, location.y, location.width || 50, location.height || 50);
                }
                
                // Add border
                ctx.strokeRect(location.x, location.y, location.width || 50, location.height || 50);
            }
        }
    }

    /**
     * 📦 DRAW BOUNDING BOXES (for doors/windows)
     */
    async drawBoundingBoxes(ctx, result, style) {
        ctx.strokeStyle = style.color;
        ctx.lineWidth = this.config.visualization.lineWidth * 1.5;
        ctx.setLineDash([]);
        
        // Enhanced shadow for boxes
        ctx.shadowColor = style.color.replace(/[\d.]+\)$/, '0.8)');
        ctx.shadowBlur = this.config.visualization.shadowBlur * 2;
        
        if (result.locations && result.locations.length > 0) {
            for (const location of result.locations) {
                const x = location.x - this.config.visualization.boxPadding;
                const y = location.y - this.config.visualization.boxPadding;
                const width = (location.width || 50) + this.config.visualization.boxPadding * 2;
                const height = (location.height || 50) + this.config.visualization.boxPadding * 2;
                
                if (style.shape === 'circle') {
                    // Circle for windows
                    const centerX = x + width / 2;
                    const centerY = y + height / 2;
                    const radius = Math.min(width, height) / 2;
                    
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    
                    // Inner circle for emphasis
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius - 4, 0, Math.PI * 2);
                    ctx.stroke();
                } else {
                    // Rounded rectangle for doors
                    this.drawRoundedRect(ctx, x, y, width, height, this.config.visualization.cornerRadius);
                    ctx.stroke();
                    
                    // Inner rectangle for emphasis
                    this.drawRoundedRect(ctx, x + 4, y + 4, width - 8, height - 8, this.config.visualization.cornerRadius - 2);
                    ctx.stroke();
                }
            }
        }
    }

    /**
     * 🎯 DRAW ROUNDED RECTANGLE
     */
    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * 🔲 DRAW HATCHED AREA
     */
    drawHatchedArea(ctx, x, y, width, height) {
        const spacing = 10;
        ctx.save();
        ctx.clip();
        
        for (let i = 0; i < width + height; i += spacing) {
            ctx.beginPath();
            ctx.moveTo(x + i, y);
            ctx.lineTo(x + i - height, y + height);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    /**
     * 🔵 DRAW DOTTED AREA
     */
    drawDottedArea(ctx, x, y, width, height) {
        const spacing = 15;
        for (let dx = 0; dx < width; dx += spacing) {
            for (let dy = 0; dy < height; dy += spacing) {
                ctx.beginPath();
                ctx.arc(x + dx + spacing/2, y + dy + spacing/2, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    /**
     * ➡️ DRAW ARROW OVERLAY
     */
    async drawArrowOverlay(ctx, result, style) {
        ctx.strokeStyle = style.color;
        ctx.fillStyle = style.color;
        ctx.lineWidth = this.config.visualization.lineWidth * 2;
        
        if (result.locations && result.locations.length > 0) {
            for (const location of result.locations) {
                const x = location.x;
                const y = location.y;
                const width = location.width || 100;
                const height = location.height || 30;
                
                // Draw arrow shape
                ctx.beginPath();
                ctx.moveTo(x, y + height/2);
                ctx.lineTo(x + width * 0.7, y + height/2);
                ctx.lineTo(x + width * 0.7, y);
                ctx.lineTo(x + width, y + height/2);
                ctx.lineTo(x + width * 0.7, y + height);
                ctx.lineTo(x + width * 0.7, y + height/2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    /**
     * ⭕ DRAW CIRCLE OVERLAY
     */
    async drawCircleOverlay(ctx, result, style) {
        ctx.strokeStyle = style.color;
        ctx.fillStyle = style.color.replace('0.6', '0.3');
        ctx.lineWidth = this.config.visualization.lineWidth;
        
        if (result.locations && result.locations.length > 0) {
            for (const location of result.locations) {
                const centerX = location.x + (location.width || 50) / 2;
                const centerY = location.y + (location.height || 50) / 2;
                const radius = Math.min(location.width || 50, location.height || 50) / 2;
                
                // Draw filled circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    /**
     * 📏 DRAW LINE OVERLAY
     */
    async drawLineOverlay(ctx, result, style) {
        ctx.strokeStyle = style.color;
        ctx.lineWidth = this.config.visualization.lineWidth * 1.5;
        ctx.setLineDash([10, 5]);
        
        if (result.locations && result.locations.length > 0) {
            for (const location of result.locations) {
                const x = location.x;
                const y = location.y;
                const width = location.width || 80;
                const height = location.height || 4;
                
                // Draw line
                ctx.beginPath();
                if (width > height) {
                    // Horizontal line
                    ctx.moveTo(x, y + height/2);
                    ctx.lineTo(x + width, y + height/2);
                } else {
                    // Vertical line
                    ctx.moveTo(x + width/2, y);
                    ctx.lineTo(x + width/2, y + height);
                }
                ctx.stroke();
            }
        }
        
        ctx.setLineDash([]);
    }

    /**
     * 📝 ADD LABELS
     */
    addLabels(ctx, result, style) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        
        if (result.locations && result.locations.length > 0) {
            // Only label first few instances to avoid clutter
            const maxLabels = Math.min(5, result.locations.length);
            
            for (let i = 0; i < maxLabels; i++) {
                const location = result.locations[i];
                const text = style.name;
                
                // White outline for readability
                ctx.strokeText(text, location.x + 5, location.y - 5);
                ctx.fillText(text, location.x + 5, location.y - 5);
            }
        }
    }

    /**
     * 🖼️ GENERATE COMPOSITE IMAGES
     */
    async generateComposites(baseImage, layers, options) {
        console.log('\n🖼️ Generating composite images...');
        
        const composites = {
            base: null,
            combined: null,
            layers: {}
        };
        
        // Save base image
        const baseCanvas = createCanvas(baseImage.width, baseImage.height);
        const baseCtx = baseCanvas.getContext('2d');
        baseCtx.drawImage(baseImage, 0, 0);
        composites.base = baseCanvas.toBuffer('image/png');
        
        // Create combined overlay with all layers
        const combinedCanvas = createCanvas(baseImage.width, baseImage.height);
        const combinedCtx = combinedCanvas.getContext('2d');
        combinedCtx.drawImage(baseImage, 0, 0);
        
        // Apply each layer
        for (const [elementType, layer] of Object.entries(layers)) {
            combinedCtx.globalAlpha = 0.8;
            combinedCtx.drawImage(layer.canvas, 0, 0);
            
            // Save individual layer composite
            const layerCanvas = createCanvas(baseImage.width, baseImage.height);
            const layerCtx = layerCanvas.getContext('2d');
            layerCtx.drawImage(baseImage, 0, 0);
            layerCtx.globalAlpha = 0.8;
            layerCtx.drawImage(layer.canvas, 0, 0);
            
            composites.layers[elementType] = layerCanvas.toBuffer('image/png');
        }
        
        composites.combined = combinedCanvas.toBuffer('image/png');
        
        console.log(`   ✅ Generated ${Object.keys(composites.layers).length + 2} composite images`);
        
        return composites;
    }

    /**
     * 🌐 CREATE INTERACTIVE HTML VIEWER
     */
    async createInteractiveHTML(planImagePath, compositeImages, analysisResults, options) {
        console.log('\n🌐 Creating interactive HTML viewer...');
        
        const planName = path.basename(planImagePath, path.extname(planImagePath));
        const outputDir = path.dirname(planImagePath);
        const htmlPath = path.join(outputDir, `${planName}_visualization.html`);
        
        // Save images as base64 or files
        const imageData = {};
        
        // Convert images to base64 for embedding
        imageData.base = compositeImages.base.toString('base64');
        imageData.combined = compositeImages.combined.toString('base64');
        imageData.layers = {};
        
        for (const [elementType, buffer] of Object.entries(compositeImages.layers)) {
            imageData.layers[elementType] = buffer.toString('base64');
        }
        
        // Generate HTML content
        const html = this.generateHTMLTemplate(planName, imageData, analysisResults);
        
        // Write HTML file
        await fs.writeFile(htmlPath, html);
        
        console.log(`   ✅ HTML viewer created: ${htmlPath}`);
        
        return htmlPath;
    }

    /**
     * 📄 GENERATE HTML TEMPLATE
     */
    generateHTMLTemplate(planName, imageData, analysisResults) {
        // Calculate statistics
        const totalElements = analysisResults.reduce((sum, r) => sum + (r.matches || 0), 0);
        const totalArea = analysisResults
            .filter(r => r.measurement && r.unit === 'm²')
            .reduce((sum, r) => sum + r.measurement, 0);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${planName} - Advanced Visualization</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .header h1 {
            color: #2d3748;
            font-size: 28px;
            margin-bottom: 10px;
        }
        
        .statistics {
            display: flex;
            gap: 30px;
            color: #718096;
            font-size: 14px;
        }
        
        .stat {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .stat-value {
            font-weight: bold;
            color: #4a5568;
        }
        
        .controls {
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }
        
        .control-group {
            margin-bottom: 20px;
        }
        
        .control-label {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
            display: block;
        }
        
        .layer-toggles {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .layer-toggle {
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .layer-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .layer-toggle.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }
        
        .layer-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        .view-modes {
            display: flex;
            gap: 10px;
        }
        
        .view-mode {
            padding: 10px 20px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .view-mode:hover {
            background: #f7fafc;
        }
        
        .view-mode.active {
            background: #4a5568;
            color: white;
            border-color: #4a5568;
        }
        
        .viewer {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            position: relative;
            overflow: auto;
        }
        
        .canvas-container {
            position: relative;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            overflow: hidden;
            max-width: 95%;
            max-height: 95%;
        }
        
        .canvas-stack {
            position: relative;
            display: block;
        }
        
        .canvas-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: auto;
            transition: opacity 0.3s ease;
        }
        
        .canvas-layer.hidden {
            opacity: 0;
            pointer-events: none;
        }
        
        .base-image {
            position: relative;
            width: 100%;
            height: auto;
            display: block;
        }
        
        .zoom-controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .zoom-btn {
            width: 40px;
            height: 40px;
            border: none;
            background: #4a5568;
            color: white;
            border-radius: 8px;
            cursor: pointer;
            font-size: 20px;
            transition: all 0.3s ease;
        }
        
        .zoom-btn:hover {
            background: #2d3748;
            transform: scale(1.1);
        }
        
        .legend {
            position: absolute;
            top: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 250px;
        }
        
        .legend-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;
            color: #4a5568;
        }
        
        .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 3px;
            border: 1px solid rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
            .layer-toggles {
                flex-direction: column;
            }
            
            .legend {
                position: static;
                margin-bottom: 20px;
                max-width: 100%;
            }
            
            .zoom-controls {
                top: 10px;
                right: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏗️ ${planName} - Construction Plan Analysis</h1>
        <div class="statistics">
            <div class="stat">
                <span>📊 Total Elements:</span>
                <span class="stat-value">${totalElements}</span>
            </div>
            <div class="stat">
                <span>📐 Total Area:</span>
                <span class="stat-value">${totalArea.toFixed(2)} m²</span>
            </div>
            <div class="stat">
                <span>🎨 Layers:</span>
                <span class="stat-value">${Object.keys(imageData.layers).length}</span>
            </div>
        </div>
    </div>
    
    <div class="viewer">
        <div class="canvas-container" id="canvasContainer">
            <div class="canvas-stack">
                <img src="data:image/png;base64,${imageData.base}" class="base-image" id="baseImage">
                ${Object.entries(imageData.layers).map(([elementType, data]) => `
                    <img src="data:image/png;base64,${data}" 
                         class="canvas-layer hidden" 
                         id="layer-${elementType.replace(/\s+/g, '-')}"
                         data-element="${elementType}">
                `).join('')}
            </div>
        </div>
        
        <div class="legend" id="legend">
            <div class="legend-title">Element Legend</div>
            ${analysisResults.map(result => {
                const elementType = result.elementType || result.element;
                const style = this.colorPalette[elementType] || this.colorPalette.default;
                return `
                    <div class="legend-item">
                        <div class="legend-color" style="background: ${style.color}"></div>
                        <span>${style.name} (${result.matches || 0})</span>
                    </div>
                `;
            }).join('')}
        </div>
        
        <div class="zoom-controls">
            <button class="zoom-btn" onclick="zoomIn()">+</button>
            <button class="zoom-btn" onclick="zoomOut()">-</button>
            <button class="zoom-btn" onclick="resetZoom()">⟲</button>
        </div>
    </div>
    
    <div class="controls">
        <div class="control-group">
            <label class="control-label">View Mode</label>
            <div class="view-modes">
                <button class="view-mode active" onclick="setViewMode('base')">Base Plan</button>
                <button class="view-mode" onclick="setViewMode('overlay')">With Overlays</button>
                <button class="view-mode" onclick="setViewMode('custom')">Custom Layers</button>
            </div>
        </div>
        
        <div class="control-group" id="layerControls">
            <label class="control-label">Toggle Layers</label>
            <div class="layer-toggles">
                ${Object.entries(imageData.layers).map(([elementType, data]) => {
                    const style = this.colorPalette[elementType] || this.colorPalette.default;
                    return `
                        <button class="layer-toggle" 
                                onclick="toggleLayer('${elementType}')"
                                data-layer="${elementType}">
                            <div class="layer-color" style="background: ${style.color}"></div>
                            <span>${style.name}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        </div>
    </div>
    
    <script>
        let currentZoom = 1;
        let currentMode = 'base';
        let activeLayers = new Set();
        
        function setViewMode(mode) {
            currentMode = mode;
            
            // Update button states
            document.querySelectorAll('.view-mode').forEach(btn => {
                btn.classList.toggle('active', btn.textContent.toLowerCase().includes(mode));
            });
            
            // Update layer visibility
            const layers = document.querySelectorAll('.canvas-layer');
            const layerControls = document.getElementById('layerControls');
            
            if (mode === 'base') {
                layers.forEach(layer => layer.classList.add('hidden'));
                layerControls.style.display = 'none';
            } else if (mode === 'overlay') {
                layers.forEach(layer => layer.classList.remove('hidden'));
                layerControls.style.display = 'none';
            } else if (mode === 'custom') {
                layers.forEach(layer => {
                    const elementType = layer.dataset.element;
                    layer.classList.toggle('hidden', !activeLayers.has(elementType));
                });
                layerControls.style.display = 'block';
            }
        }
        
        function toggleLayer(elementType) {
            if (currentMode !== 'custom') {
                setViewMode('custom');
            }
            
            const layer = document.getElementById('layer-' + elementType.replace(/\s+/g, '-'));
            const button = document.querySelector(\`[data-layer="\${elementType}"]\`);
            
            if (activeLayers.has(elementType)) {
                activeLayers.delete(elementType);
                layer.classList.add('hidden');
                button.classList.remove('active');
            } else {
                activeLayers.add(elementType);
                layer.classList.remove('hidden');
                button.classList.add('active');
            }
        }
        
        function zoomIn() {
            currentZoom = Math.min(currentZoom * 1.2, 5);
            applyZoom();
        }
        
        function zoomOut() {
            currentZoom = Math.max(currentZoom / 1.2, 0.5);
            applyZoom();
        }
        
        function resetZoom() {
            currentZoom = 1;
            applyZoom();
        }
        
        function applyZoom() {
            const container = document.getElementById('canvasContainer');
            container.style.transform = \`scale(\${currentZoom})\`;
        }
        
        // Initialize
        setViewMode('base');
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '1') setViewMode('base');
            else if (e.key === '2') setViewMode('overlay');
            else if (e.key === '3') setViewMode('custom');
            else if (e.key === '+' || e.key === '=') zoomIn();
            else if (e.key === '-') zoomOut();
            else if (e.key === '0') resetZoom();
        });
    </script>
</body>
</html>`;
    }
}

export { AdvancedVisualizationSystem };
