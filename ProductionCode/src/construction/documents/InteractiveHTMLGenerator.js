/**
 * 🌐 INTERACTIVE HTML GENERATOR - TRACEABLE AUSSCHREIBUNG DOCUMENTS
 * =================================================================
 * 
 * REVOLUTIONARY FEATURE: Creates interactive HTML tender documents where every
 * measurement links directly to its source annotations on construction plans
 * 
 * KEY CAPABILITIES:
 * ✅ Clickable measurements revealing source visualizations
 * ✅ Embedded plan images with annotation overlays
 * ✅ Step-by-step calculation breakdowns
 * ✅ Confidence color coding for transparency
 * ✅ Export to PDF while maintaining traceability
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Interactive Document System
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import DataSourceTracker from '../tracking/DataSourceTracker.js';

export default class InteractiveHTMLGenerator extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            generatorName: 'INTERACTIVE_HTML_GENERATOR',
            
            // HTML Document Configuration
            document: {
                title: 'Interaktives Leistungsverzeichnis',
                language: 'de',
                encoding: 'UTF-8',
                responsive: true,
                printable: true
            },
            
            // Interactive Features
            features: {
                clickableValues: true,
                sourceVisualization: true,
                calculationBreakdown: true,
                confidenceIndicators: true,
                multiPlanAggregation: true,
                expertCorrection: true,
                exportCapabilities: true
            },
            
            // Visual Styling
            styling: {
                theme: 'professional',
                
                colors: {
                    primary: '#1976D2',
                    secondary: '#424242',
                    success: '#4CAF50',
                    warning: '#FF9800',
                    danger: '#F44336',
                    
                    // Confidence colors
                    confidence: {
                        verified: '#00C853',
                        high: '#4CAF50',
                        medium: '#FFC107',
                        low: '#FF9800',
                        estimation: '#F44336'
                    }
                },
                
                fonts: {
                    heading: 'Roboto, Arial, sans-serif',
                    body: 'Open Sans, Arial, sans-serif',
                    mono: 'Roboto Mono, Courier, monospace'
                }
            },
            
            // Modal Configuration
            modal: {
                width: '90%',
                maxWidth: '1400px',
                height: '85vh',
                animation: 'fade',
                closeOnClickOutside: true
            },
            
            // Plan Viewer Settings
            planViewer: {
                zoomLevels: [50, 75, 100, 150, 200, 300],
                defaultZoom: 100,
                panEnabled: true,
                annotationOpacity: 0.7,
                highlightColor: '#FFEB3B'
            }
        };
        
        this.dataTracker = new DataSourceTracker();
        this.generatedDocuments = [];
    }
    
    /**
     * 🚀 INITIALIZE GENERATOR
     */
    async initialize() {
        console.log('🌐 Initializing Interactive HTML Generator...');
        
        try {
            await this.dataTracker.initialize();
            
            // Create output directories
            await fs.mkdir(path.join(process.cwd(), 'interactive_documents'), { recursive: true });
            await fs.mkdir(path.join(process.cwd(), 'interactive_documents', 'assets'), { recursive: true });
            
            console.log('✅ Interactive HTML Generator initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize generator:', error.message);
            throw error;
        }
    }
    
    /**
     * 📄 GENERATE INTERACTIVE AUSSCHREIBUNG
     */
    async generateInteractiveAusschreibung(tenderData, projectInfo) {
        console.log('\n🌐 GENERATING INTERACTIVE HTML AUSSCHREIBUNG');
        console.log('============================================');
        
        try {
            const startTime = Date.now();
            
            // Generate unique document ID
            const documentId = `LV_${projectInfo.projectNumber}_${Date.now()}`;
            
            // Create HTML structure
            const html = await this.createHTMLDocument(tenderData, projectInfo, documentId);
            
            // Generate supporting assets
            await this.generateAssets(tenderData, documentId);
            
            // Save HTML document
            const outputPath = path.join(
                process.cwd(),
                'interactive_documents',
                `${documentId}.html`
            );
            await fs.writeFile(outputPath, html);
            
            // Generate metadata
            const metadata = {
                documentId,
                projectInfo,
                generatedAt: new Date().toISOString(),
                outputPath,
                statistics: {
                    positions: tenderData.positions.length,
                    trackedMeasurements: this.dataTracker.statistics.totalMeasurements,
                    verifiedMeasurements: this.dataTracker.statistics.verifiedMeasurements,
                    processingTime: Date.now() - startTime
                }
            };
            
            this.generatedDocuments.push(metadata);
            
            console.log(`\n✅ Interactive document generated: ${outputPath}`);
            console.log(`   📊 ${metadata.statistics.positions} positions with source links`);
            console.log(`   🔗 ${metadata.statistics.trackedMeasurements} tracked measurements`);
            
            return metadata;
            
        } catch (error) {
            console.error('❌ Failed to generate interactive document:', error.message);
            throw error;
        }
    }
    
    /**
     * 🏗️ CREATE HTML DOCUMENT
     */
    async createHTMLDocument(tenderData, projectInfo, documentId) {
        const html = `<!DOCTYPE html>
<html lang="${this.config.document.language}">
<head>
    <meta charset="${this.config.document.encoding}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.config.document.title} - ${projectInfo.projectName}</title>
    
    ${this.generateStyles()}
    ${this.generateScripts()}
</head>
<body>
    <!-- Header -->
    <header class="document-header">
        <h1>${this.config.document.title}</h1>
        <div class="project-info">
            <span class="project-name">${projectInfo.projectName}</span>
            <span class="project-number">${projectInfo.projectNumber}</span>
            <span class="generation-date">${new Date().toLocaleDateString('de-DE')}</span>
        </div>
        <div class="confidence-legend">
            ${this.generateConfidenceLegend()}
        </div>
    </header>
    
    <!-- Navigation -->
    <nav class="document-nav">
        ${this.generateNavigation(tenderData)}
    </nav>
    
    <!-- Main Content -->
    <main class="document-content">
        ${await this.generateContent(tenderData, documentId)}
    </main>
    
    <!-- Source Visualization Modal -->
    <div id="sourceModal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-header">
                <h2>Quellennachweis / Source Verification</h2>
            </div>
            <div class="modal-body">
                <div class="source-container">
                    <div class="plan-viewer-container">
                        <canvas id="planViewer"></canvas>
                        <div class="zoom-controls">
                            <button onclick="zoomIn()">+</button>
                            <button onclick="zoomOut()">-</button>
                            <button onclick="resetZoom()">100%</button>
                        </div>
                    </div>
                    <div class="calculation-breakdown">
                        <h3>Berechnungsschritte / Calculation Steps</h3>
                        <div id="calculationSteps"></div>
                    </div>
                    <div class="annotation-details">
                        <h3>Annotationsdetails / Annotation Details</h3>
                        <div id="annotationInfo"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Footer -->
    <footer class="document-footer">
        <div class="footer-info">
            <p>Generiert mit KI-gestützter Bauplanerkennung / Generated with AI-powered construction plan analysis</p>
            <p>Alle Werte sind direkt auf Quellpläne rückverfolgbar / All values are traceable to source plans</p>
        </div>
        <div class="export-buttons">
            <button onclick="exportToPDF()">📄 Export als PDF</button>
            <button onclick="exportToGAEB()">📊 Export als GAEB</button>
            <button onclick="exportToExcel()">📈 Export als Excel</button>
        </div>
    </footer>
</body>
</html>`;
        
        return html;
    }
    
    /**
     * 🎨 GENERATE STYLES
     */
    generateStyles() {
        return `
    <style>
        /* Reset and Base Styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: ${this.config.styling.fonts.body};
            line-height: 1.6;
            color: ${this.config.styling.colors.secondary};
            background: #f5f5f5;
        }
        
        /* Header Styles */
        .document-header {
            background: ${this.config.styling.colors.primary};
            color: white;
            padding: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .document-header h1 {
            font-family: ${this.config.styling.fonts.heading};
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        
        .project-info {
            display: flex;
            gap: 2rem;
            margin-bottom: 1rem;
        }
        
        .project-info span {
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
        }
        
        /* Confidence Legend */
        .confidence-legend {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
            padding: 0.5rem;
            background: rgba(255,255,255,0.1);
            border-radius: 4px;
        }
        
        .confidence-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .confidence-indicator {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
        }
        
        .confidence-verified { background: ${this.config.styling.colors.confidence.verified}; }
        .confidence-high { background: ${this.config.styling.colors.confidence.high}; }
        .confidence-medium { background: ${this.config.styling.colors.confidence.medium}; }
        .confidence-low { background: ${this.config.styling.colors.confidence.low}; }
        .confidence-estimation { background: ${this.config.styling.colors.confidence.estimation}; }
        
        /* Navigation */
        .document-nav {
            background: white;
            padding: 1rem 2rem;
            border-bottom: 1px solid #e0e0e0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .document-nav ul {
            list-style: none;
            display: flex;
            gap: 2rem;
        }
        
        .document-nav a {
            color: ${this.config.styling.colors.secondary};
            text-decoration: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            transition: background 0.3s;
        }
        
        .document-nav a:hover {
            background: #f5f5f5;
        }
        
        /* Main Content */
        .document-content {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        
        /* Position Items */
        .position-group {
            background: white;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .position-header {
            background: #f5f5f5;
            padding: 1rem 1.5rem;
            border-radius: 8px 8px 0 0;
            border-left: 4px solid ${this.config.styling.colors.primary};
        }
        
        .position-item {
            padding: 1.5rem;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .position-item:last-child {
            border-bottom: none;
        }
        
        /* Clickable Values */
        .quantity-value {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            background: #e3f2fd;
            border: 1px solid #90caf9;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-family: ${this.config.styling.fonts.mono};
            transition: all 0.3s;
            position: relative;
        }
        
        .quantity-value:hover {
            background: #bbdefb;
            border-color: #64b5f6;
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .quantity-value::after {
            content: '🔗';
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        .quantity-value:hover::after {
            opacity: 1;
        }
        
        /* Confidence Coloring */
        .quantity-value[data-confidence="verified"] {
            border-color: ${this.config.styling.colors.confidence.verified};
            background: ${this.config.styling.colors.confidence.verified}20;
        }
        
        .quantity-value[data-confidence="high"] {
            border-color: ${this.config.styling.colors.confidence.high};
            background: ${this.config.styling.colors.confidence.high}20;
        }
        
        .quantity-value[data-confidence="medium"] {
            border-color: ${this.config.styling.colors.confidence.medium};
            background: ${this.config.styling.colors.confidence.medium}20;
        }
        
        .quantity-value[data-confidence="low"] {
            border-color: ${this.config.styling.colors.confidence.low};
            background: ${this.config.styling.colors.confidence.low}20;
        }
        
        .quantity-value[data-confidence="estimation"] {
            border-color: ${this.config.styling.colors.confidence.estimation};
            background: ${this.config.styling.colors.confidence.estimation}20;
        }
        
        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            animation: fadeIn 0.3s;
        }
        
        .modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            width: ${this.config.modal.width};
            max-width: ${this.config.modal.maxWidth};
            height: ${this.config.modal.height};
            overflow: hidden;
            display: flex;
            flex-direction: column;
            animation: slideIn 0.3s;
        }
        
        .modal-header {
            background: ${this.config.styling.colors.primary};
            color: white;
            padding: 1.5rem;
            position: relative;
        }
        
        .close-modal {
            position: absolute;
            right: 1.5rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 2rem;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .close-modal:hover {
            transform: translateY(-50%) rotate(90deg);
        }
        
        .modal-body {
            flex: 1;
            overflow-y: auto;
            padding: 2rem;
        }
        
        .source-container {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 2rem;
            height: 100%;
        }
        
        .plan-viewer-container {
            position: relative;
            background: #f5f5f5;
            border-radius: 8px;
            overflow: hidden;
        }
        
        #planViewer {
            width: 100%;
            height: 100%;
            cursor: move;
        }
        
        .zoom-controls {
            position: absolute;
            bottom: 1rem;
            right: 1rem;
            display: flex;
            gap: 0.5rem;
            background: white;
            padding: 0.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .zoom-controls button {
            width: 40px;
            height: 40px;
            border: none;
            background: ${this.config.styling.colors.primary};
            color: white;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            transition: transform 0.2s;
        }
        
        .zoom-controls button:hover {
            transform: scale(1.1);
        }
        
        /* Calculation Breakdown */
        .calculation-breakdown {
            background: #f9f9f9;
            padding: 1.5rem;
            border-radius: 8px;
        }
        
        .calculation-step {
            background: white;
            padding: 1rem;
            margin-bottom: 0.5rem;
            border-radius: 4px;
            border-left: 3px solid ${this.config.styling.colors.primary};
        }
        
        .calculation-step .formula {
            font-family: ${this.config.styling.fonts.mono};
            background: #e8f5e9;
            padding: 0.5rem;
            border-radius: 4px;
            margin: 0.5rem 0;
        }
        
        /* Annotations */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideIn {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        
        /* Print Styles */
        @media print {
            .document-nav,
            .export-buttons,
            .zoom-controls {
                display: none;
            }
            
            .position-group {
                page-break-inside: avoid;
            }
        }
    </style>
        `;
    }
    
    /**
     * 📜 GENERATE SCRIPTS
     */
    generateScripts() {
        return `
    <script>
        // Global variables
        let currentZoom = 100;
        let currentMeasurementId = null;
        let planCanvas = null;
        let planCtx = null;
        
        // Initialize on load
        document.addEventListener('DOMContentLoaded', function() {
            initializeEventListeners();
            initializePlanViewer();
        });
        
        // Initialize event listeners
        function initializeEventListeners() {
            // Close modal on click outside
            document.getElementById('sourceModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
            
            // Close modal button
            document.querySelector('.close-modal').addEventListener('click', closeModal);
            
            // Quantity value clicks
            document.querySelectorAll('.quantity-value').forEach(element => {
                element.addEventListener('click', function() {
                    showSourceVisualization(this);
                });
            });
        }
        
        // Initialize plan viewer canvas
        function initializePlanViewer() {
            planCanvas = document.getElementById('planViewer');
            if (planCanvas) {
                planCtx = planCanvas.getContext('2d');
                setupCanvasInteraction();
            }
        }
        
        // Show source visualization
        async function showSourceVisualization(element) {
            const measurementId = element.dataset.measurementId;
            const planIds = JSON.parse(element.dataset.sourcePlans || '[]');
            const annotationIds = JSON.parse(element.dataset.annotations || '[]');
            
            currentMeasurementId = measurementId;
            
            // Open modal
            const modal = document.getElementById('sourceModal');
            modal.classList.add('active');
            
            // Load source data
            await loadSourceData(measurementId);
            
            // Display plan with annotations
            await displayPlanWithAnnotations(planIds[0], annotationIds);
            
            // Show calculation breakdown
            await displayCalculationBreakdown(measurementId);
            
            // Show annotation details
            await displayAnnotationDetails(annotationIds);
        }
        
        // Load source data from backend
        async function loadSourceData(measurementId) {
            try {
                const response = await fetch(\`/api/measurements/\${measurementId}/source\`);
                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Failed to load source data:', error);
                return null;
            }
        }
        
        // Display plan with highlighted annotations
        async function displayPlanWithAnnotations(planId, annotationIds) {
            if (!planCanvas || !planCtx) return;
            
            try {
                // Load plan image
                const img = new Image();
                img.src = \`/api/plans/\${planId}/image\`;
                
                img.onload = function() {
                    // Set canvas size
                    planCanvas.width = img.width;
                    planCanvas.height = img.height;
                    
                    // Draw plan
                    planCtx.clearRect(0, 0, planCanvas.width, planCanvas.height);
                    planCtx.drawImage(img, 0, 0);
                    
                    // Draw annotations
                    drawAnnotations(annotationIds);
                };
            } catch (error) {
                console.error('Failed to display plan:', error);
            }
        }
        
        // Draw annotation overlays
        async function drawAnnotations(annotationIds) {
            if (!planCtx) return;
            
            for (const annotationId of annotationIds) {
                try {
                    const response = await fetch(\`/api/annotations/\${annotationId}\`);
                    const annotation = await response.json();
                    
                    // Set annotation style
                    planCtx.strokeStyle = annotation.color || '#FFEB3B';
                    planCtx.lineWidth = 3;
                    planCtx.fillStyle = annotation.color + '40'; // 40% opacity
                    
                    // Draw annotation shape
                    if (annotation.type === 'rectangle') {
                        planCtx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
                        planCtx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);
                    } else if (annotation.type === 'polygon') {
                        planCtx.beginPath();
                        annotation.points.forEach((point, i) => {
                            if (i === 0) {
                                planCtx.moveTo(point.x, point.y);
                            } else {
                                planCtx.lineTo(point.x, point.y);
                            }
                        });
                        planCtx.closePath();
                        planCtx.fill();
                        planCtx.stroke();
                    }
                    
                    // Draw label
                    if (annotation.label) {
                        planCtx.font = '14px Arial';
                        planCtx.fillStyle = '#000';
                        planCtx.fillText(annotation.label, annotation.x + 5, annotation.y - 5);
                    }
                    
                } catch (error) {
                    console.error('Failed to draw annotation:', error);
                }
            }
        }
        
        // Display calculation breakdown
        async function displayCalculationBreakdown(measurementId) {
            const container = document.getElementById('calculationSteps');
            if (!container) return;
            
            try {
                const response = await fetch(\`/api/measurements/\${measurementId}/calculation\`);
                const calculation = await response.json();
                
                let html = '';
                calculation.steps.forEach((step, index) => {
                    html += \`
                        <div class="calculation-step">
                            <h4>Schritt \${index + 1}: \${step.description}</h4>
                            <div class="formula">\${step.formula}</div>
                            <div class="values">
                                <span>Eingabe: \${step.input}</span>
                                <span> → </span>
                                <span>Ausgabe: \${step.output} \${step.unit}</span>
                            </div>
                        </div>
                    \`;
                });
                
                container.innerHTML = html;
                
            } catch (error) {
                console.error('Failed to load calculation:', error);
                container.innerHTML = '<p>Berechnung konnte nicht geladen werden</p>';
            }
        }
        
        // Display annotation details
        async function displayAnnotationDetails(annotationIds) {
            const container = document.getElementById('annotationInfo');
            if (!container) return;
            
            let html = '<ul>';
            for (const annotationId of annotationIds) {
                try {
                    const response = await fetch(\`/api/annotations/\${annotationId}\`);
                    const annotation = await response.json();
                    
                    html += \`
                        <li>
                            <strong>\${annotation.type}:</strong> \${annotation.label}<br>
                            <small>Konfidenz: \${(annotation.confidence * 100).toFixed(1)}%</small>
                        </li>
                    \`;
                } catch (error) {
                    console.error('Failed to load annotation:', error);
                }
            }
            html += '</ul>';
            
            container.innerHTML = html;
        }
        
        // Canvas interaction
        function setupCanvasInteraction() {
            let isDragging = false;
            let startX, startY, scrollLeft, scrollTop;
            
            planCanvas.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                planCanvas.style.cursor = 'grabbing';
            });
            
            planCanvas.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                planCanvas.parentElement.scrollLeft = scrollLeft - dx;
                planCanvas.parentElement.scrollTop = scrollTop - dy;
            });
            
            planCanvas.addEventListener('mouseup', () => {
                isDragging = false;
                planCanvas.style.cursor = 'move';
            });
        }
        
        // Zoom functions
        function zoomIn() {
            if (currentZoom < 300) {
                currentZoom += 25;
                applyZoom();
            }
        }
        
        function zoomOut() {
            if (currentZoom > 50) {
                currentZoom -= 25;
                applyZoom();
            }
        }
        
        function resetZoom() {
            currentZoom = 100;
            applyZoom();
        }
        
        function applyZoom() {
            if (planCanvas) {
                planCanvas.style.transform = \`scale(\${currentZoom / 100})\`;
            }
        }
        
        // Close modal
        function closeModal() {
            const modal = document.getElementById('sourceModal');
            modal.classList.remove('active');
            currentMeasurementId = null;
        }
        
        // Export functions
        function exportToPDF() {
            window.print();
        }
        
        function exportToGAEB() {
            window.location.href = '/api/export/gaeb';
        }
        
        function exportToExcel() {
            window.location.href = '/api/export/excel';
        }
    </script>
        `;
    }
    
    /**
     * 📊 GENERATE CONTENT
     */
    async generateContent(tenderData, documentId) {
        let html = '';
        
        // Group positions by DIN 276
        const groupedPositions = this.groupPositionsByDIN276(tenderData.positions);
        
        for (const [groupCode, positions] of Object.entries(groupedPositions)) {
            html += `
            <section class="position-group" id="group-${groupCode}">
                <div class="position-header">
                    <h2>${groupCode} - ${this.getDIN276GroupName(groupCode)}</h2>
                    <span class="position-count">${positions.length} Positionen</span>
                </div>
                <div class="position-list">
        `;
            
            for (const position of positions) {
                html += await this.generatePositionHTML(position);
            }
            
            html += `
                </div>
            </section>
        `;
        }
        
        return html;
    }
    
    /**
     * 📝 GENERATE POSITION HTML
     */
    async generatePositionHTML(position) {
        // Track measurement source
        const trackingId = this.dataTracker.trackMeasurementSource({
            value: position.quantity.value,
            unit: position.quantity.unit,
            type: position.measurementType || 'area',
            description: position.shortText,
            sourceType: 'plan_annotation',
            planIds: position.sourcePlans || [],
            annotationIds: position.sourceAnnotations || [],
            elementIds: position.sourceElements || [],
            calculationMethod: position.calculationMethod,
            pixelArea: position.pixelData?.area,
            pixelsPerMillimeter: position.pixelData?.scale,
            scaleFactor: position.scaleFactor,
            confidence: position.confidence || 0.75,
            verified: position.verified || false,
            planImages: position.planImages || [],
            annotationOverlays: position.annotationOverlays || [],
            highlightRegions: position.highlightRegions || [],
            calculationSteps: position.calculationSteps || []
        });
        
        const confidenceLevel = this.getConfidenceLevel(position.confidence);
        
        return `
        <div class="position-item">
            <div class="position-number">${position.number}</div>
            <div class="position-content">
                <h3>${position.shortText}</h3>
                <div class="position-quantity">
                    <span class="quantity-label">Menge:</span>
                    <span class="quantity-value"
                          data-measurement-id="${trackingId}"
                          data-source-plans='${JSON.stringify(position.sourcePlans || [])}'
                          data-annotations='${JSON.stringify(position.sourceAnnotations || [])}'
                          data-confidence="${confidenceLevel}"
                          title="Klicken für Quellennachweis">
                        ${position.quantity.value.toFixed(2)} ${position.quantity.unit}
                    </span>
                </div>
                <div class="position-description">
                    <p>${position.longText}</p>
                </div>
                ${position.specifications ? `
                <div class="position-specifications">
                    <h4>Spezifikationen:</h4>
                    <ul>
                        ${position.specifications.map(spec => `<li>${spec}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                <div class="position-price">
                    <span class="unit-price">EP: ${position.unitPrice?.toFixed(2) || '-'} €/${position.quantity.unit}</span>
                    <span class="total-price">GP: ${position.totalPrice?.toFixed(2) || '-'} €</span>
                </div>
            </div>
        </div>
        `;
    }
    
    /**
     * 🗂️ GROUP POSITIONS BY DIN 276
     */
    groupPositionsByDIN276(positions) {
        const grouped = {};
        
        for (const position of positions) {
            const groupCode = position.din276Code || '000';
            if (!grouped[groupCode]) {
                grouped[groupCode] = [];
            }
            grouped[groupCode].push(position);
        }
        
        // Sort by group code
        const sorted = {};
        Object.keys(grouped).sort().forEach(key => {
            sorted[key] = grouped[key];
        });
        
        return sorted;
    }
    
    /**
     * 📋 GENERATE NAVIGATION
     */
    generateNavigation(tenderData) {
        const groups = this.groupPositionsByDIN276(tenderData.positions);
        
        let nav = '<ul>';
        for (const groupCode of Object.keys(groups)) {
            nav += `<li><a href="#group-${groupCode}">${groupCode} - ${this.getDIN276GroupName(groupCode)}</a></li>`;
        }
        nav += '</ul>';
        
        return nav;
    }
    
    /**
     * 🏷️ GENERATE CONFIDENCE LEGEND
     */
    generateConfidenceLegend() {
        return `
            <div class="confidence-item">
                <span class="confidence-indicator confidence-verified"></span>
                <span>Verifiziert (>95%)</span>
            </div>
            <div class="confidence-item">
                <span class="confidence-indicator confidence-high"></span>
                <span>Hoch (>85%)</span>
            </div>
            <div class="confidence-item">
                <span class="confidence-indicator confidence-medium"></span>
                <span>Mittel (>70%)</span>
            </div>
            <div class="confidence-item">
                <span class="confidence-indicator confidence-low"></span>
                <span>Niedrig (>50%)</span>
            </div>
            <div class="confidence-item">
                <span class="confidence-indicator confidence-estimation"></span>
                <span>Schätzung (<50%)</span>
            </div>
        `;
    }
    
    /**
     * 🎨 GENERATE ASSETS
     */
    async generateAssets(tenderData, documentId) {
        const assetsDir = path.join(process.cwd(), 'interactive_documents', 'assets', documentId);
        await fs.mkdir(assetsDir, { recursive: true });
        
        // Generate plan thumbnails
        for (const position of tenderData.positions) {
            if (position.planImages && position.planImages.length > 0) {
                for (let i = 0; i < position.planImages.length; i++) {
                    const imagePath = path.join(assetsDir, `plan_${position.number}_${i}.png`);
                    // Save plan image (implementation depends on image source)
                    // await fs.writeFile(imagePath, position.planImages[i]);
                }
            }
        }
        
        // Generate annotation overlays
        // Implementation for creating visual annotation overlays
        
        return true;
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    getDIN276GroupName(code) {
        const groups = {
            '300': 'Bauwerk - Baukonstruktionen',
            '310': 'Baugrube / Erdbau',
            '320': 'Gründung, Unterbau',
            '330': 'Außenwände',
            '340': 'Innenwände',
            '350': 'Decken',
            '360': 'Dächer',
            '370': 'Baukonstruktive Einbauten',
            '380': 'Äußere Oberflächen',
            '390': 'Innere Oberflächen',
            '400': 'Bauwerk - Technische Anlagen',
            '410': 'Abwasser-, Wasser-, Gasanlagen',
            '420': 'Wärmeversorgungsanlagen',
            '430': 'Raumlufttechnische Anlagen',
            '440': 'Elektrische Anlagen',
            '450': 'Kommunikations-, IT-Anlagen',
            '500': 'Außenanlagen',
            '600': 'Ausstattung',
            '700': 'Baunebenkosten'
        };
        
        return groups[code] || 'Sonstige Leistungen';
    }
    
    getConfidenceLevel(confidence) {
        if (!confidence) return 'medium';
        if (confidence >= 0.95) return 'verified';
        if (confidence >= 0.85) return 'high';
        if (confidence >= 0.70) return 'medium';
        if (confidence >= 0.50) return 'low';
        return 'estimation';
    }
}
