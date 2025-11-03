/**
 * 🏗️ LP6 COMPREHENSIVE GENERATOR - EXECUTION PLANNING DOCUMENTATION
 * ================================================================
 * 
 * MISSION: Generate complete LP6 (Leistungsphase 6) execution planning deliverables
 * 
 * KEY CAPABILITIES:
 * ✅ Execution drawings with precise annotations
 * ✅ Detailed material lists with specifications
 * ✅ Construction sequence documentation
 * ✅ Interface coordination plans
 * ✅ Detail drawings for critical connections
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production LP6 Generator
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Import required systems
import RealPixelAnalyzer from '../vision/RealPixelAnalyzer.js';
import PreciseMeasurementEngine from '../analysis/PreciseMeasurementEngine.js';
import ElementClassificationSystem from '../ml/ElementClassificationSystem.js';
import MaterialSpecificationDB from '../database/MaterialSpecificationDB.js';
import DIN276CostMapper from '../costing/DIN276CostMapper.js';
import VisualPlanAnnotator from '../visual/VisualPlanAnnotator.js';

export default class LP6ComprehensiveGenerator extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            generatorName: 'LP6_COMPREHENSIVE_GENERATOR',
            
            // HOAI LP6 Requirements
            hoaiRequirements: {
                deliverables: [
                    'ausführungszeichnungen',    // Execution drawings
                    'detailzeichnungen',         // Detail drawings
                    'konstruktionszeichnungen',  // Construction drawings
                    'werkstattzeichnungen',      // Shop drawings
                    'montagepläne',             // Assembly plans
                    'materiallisten',           // Material lists
                    'stücklisten',              // Parts lists
                    'terminpläne'               // Schedule plans
                ],
                
                drawingScales: {
                    overview: '1:100',
                    standard: '1:50',
                    detail: '1:20',
                    connectionDetail: '1:10',
                    criticalDetail: '1:5'
                },
                
                annotationRequirements: {
                    dimensions: true,
                    materials: true,
                    references: true,
                    gridLines: true,
                    elevations: true,
                    sections: true
                }
            },
            
            // Drawing Generation Configuration
            drawingGeneration: {
                // Canvas settings for high-resolution output
                resolution: 300, // DPI
                lineWeights: {
                    outline: 0.5,      // mm
                    dimension: 0.25,   // mm
                    annotation: 0.18,  // mm
                    hidden: 0.18,      // mm (dashed)
                    centerline: 0.25   // mm (dash-dot)
                },
                
                colors: {
                    existing: rgb(0.7, 0.7, 0.7),  // Gray
                    new: rgb(0, 0, 0),             // Black
                    demolition: rgb(1, 0, 0),      // Red
                    dimension: rgb(0, 0, 1),       // Blue
                    annotation: rgb(0, 0, 0),      // Black
                    material: {
                        concrete: rgb(0.8, 0.8, 0.8),
                        steel: rgb(0.4, 0.4, 0.4),
                        masonry: rgb(0.9, 0.7, 0.5),
                        insulation: rgb(1, 1, 0.7),
                        wood: rgb(0.8, 0.6, 0.4)
                    }
                }
            },
            
            // Material List Configuration
            materialList: {
                grouping: {
                    byElement: true,
                    byMaterial: true,
                    bySupplier: true,
                    byPhase: true
                },
                
                specifications: {
                    includeStandards: true,
                    includeCertificates: true,
                    includeProperties: true,
                    includeHandling: true
                },
                
                format: {
                    columns: [
                        'position',
                        'description',
                        'material',
                        'dimensions',
                        'quantity',
                        'unit',
                        'weight',
                        'supplier',
                        'articleNumber',
                        'standard'
                    ]
                }
            },
            
            // Construction Sequence
            sequenceDocumentation: {
                phases: [
                    'site_preparation',
                    'foundation',
                    'structure',
                    'envelope',
                    'mep_rough',
                    'interior',
                    'mep_finish',
                    'finishes',
                    'commissioning'
                ],
                
                ganttChart: {
                    enabled: true,
                    showDependencies: true,
                    showCriticalPath: true,
                    showResources: true
                }
            },
            
            // Interface Coordination
            interfaceCoordination: {
                disciplines: [
                    'architectural',
                    'structural',
                    'mechanical',
                    'electrical',
                    'plumbing',
                    'fire_protection'
                ],
                
                clashDetection: {
                    enabled: true,
                    tolerance: 25, // mm
                    reportFormat: 'matrix'
                }
            },
            
            // Output Configuration
            output: {
                formats: ['pdf', 'dwg', 'ifc', 'xlsx'],
                fileNaming: {
                    pattern: '{project}_{discipline}_{type}_{scale}_{date}',
                    dateFormat: 'YYYYMMDD'
                },
                
                pdfSettings: {
                    pageSize: 'A1',
                    orientation: 'landscape',
                    margins: { top: 20, bottom: 20, left: 30, right: 20 }
                }
            }
        };
        
        // Initialize subsystems
        this.pixelAnalyzer = new RealPixelAnalyzer();
        this.measurementEngine = new PreciseMeasurementEngine();
        this.classificationSystem = new ElementClassificationSystem();
        this.materialDB = new MaterialSpecificationDB();
        this.costMapper = new DIN276CostMapper();
        this.planAnnotator = new VisualPlanAnnotator();
        
        this.generatedDeliverables = [];
    }
    
    /**
     * 🚀 INITIALIZE GENERATOR
     */
    async initialize() {
        console.log('🏗️ Initializing LP6 Comprehensive Generator...');
        
        try {
            // Initialize all subsystems
            // Safe initialization - only call if method exists
            const initPromises = [];
            if (this.pixelAnalyzer && typeof this.pixelAnalyzer.initialize === 'function') {
                initPromises.push(this.pixelAnalyzer.initialize());
            }
            if (this.measurementEngine && typeof this.measurementEngine.initialize === 'function') {
                initPromises.push(this.measurementEngine.initialize());
            }
            if (this.classificationSystem && typeof this.classificationSystem.initialize === 'function') {
                initPromises.push(this.classificationSystem.initialize());
            }
            if (this.materialDB && typeof this.materialDB.initialize === 'function') {
                initPromises.push(this.materialDB.initialize());
            }
            if (this.costMapper && typeof this.costMapper.initialize === 'function') {
                initPromises.push(this.costMapper.initialize());
            }
            if (this.stlbConnector && typeof this.stlbConnector.initialize === 'function') {
                initPromises.push(this.stlbConnector.initialize());
            }
            if (this.lp6Generator && typeof this.lp6Generator.initialize === 'function') {
                initPromises.push(this.lp6Generator.initialize());
            }
            if (this.verificationReports && typeof this.verificationReports.initialize === 'function') {
                initPromises.push(this.verificationReports.initialize());
            }
            await Promise.all(initPromises);
            
            console.log('✅ LP6 Generator initialized');
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 📐 GENERATE LP6 DELIVERABLES
     */
    async generateLP6Deliverables(planPaths, projectInfo = {}) {
        console.log('📐 GENERATING LP6 EXECUTION PLANNING DELIVERABLES');
        console.log('==============================================');
        console.log(`📁 Plans: ${planPaths.length} files`);
        console.log(`🏗️ Project: ${projectInfo.name || 'Construction Project'}`);
        console.log('');
        
        try {
            // STEP 1: Analyze all plans
            console.log('🔍 STEP 1: ANALYZING ALL CONSTRUCTION PLANS');
            const analysisResults = await this.analyzeAllPlans(planPaths);
            console.log(`   ✅ Analyzed ${analysisResults.totalElements} elements across ${planPaths.length} plans`);
            
            // STEP 2: Generate execution drawings
            console.log('\n📐 STEP 2: GENERATING EXECUTION DRAWINGS');
            const executionDrawings = await this.generateExecutionDrawings(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Generated ${executionDrawings.length} execution drawings`);
            
            // STEP 3: Generate detail drawings
            console.log('\n🔍 STEP 3: GENERATING DETAIL DRAWINGS');
            const detailDrawings = await this.generateDetailDrawings(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Generated ${detailDrawings.length} detail drawings`);
            
            // STEP 4: Generate material lists
            console.log('\n📋 STEP 4: GENERATING MATERIAL LISTS');
            const materialLists = await this.generateMaterialLists(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Generated ${materialLists.length} material lists`);
            
            // STEP 5: Generate construction sequence
            console.log('\n📅 STEP 5: GENERATING CONSTRUCTION SEQUENCE');
            const sequenceDocuments = await this.generateConstructionSequence(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Generated construction sequence with ${sequenceDocuments.phases.length} phases`);
            
            // STEP 6: Generate interface coordination
            console.log('\n🔗 STEP 6: GENERATING INTERFACE COORDINATION');
            const interfaceDocuments = await this.generateInterfaceCoordination(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Generated interface coordination for ${interfaceDocuments.disciplines.length} disciplines`);
            
            // STEP 7: Create comprehensive package
            console.log('\n📦 STEP 7: CREATING COMPREHENSIVE LP6 PACKAGE');
            const deliverablePackage = await this.createDeliverablePackage({
                executionDrawings,
                detailDrawings,
                materialLists,
                sequenceDocuments,
                interfaceDocuments
            }, projectInfo);
            
            console.log('\n🎉 LP6 DELIVERABLE GENERATION COMPLETE');
            console.log('======================================');
            console.log(`📐 Execution drawings: ${executionDrawings.length}`);
            console.log(`🔍 Detail drawings: ${detailDrawings.length}`);
            console.log(`📋 Material lists: ${materialLists.length}`);
            console.log(`📅 Construction phases: ${sequenceDocuments.phases.length}`);
            console.log(`🔗 Interface matrices: ${interfaceDocuments.matrices.length}`);
            console.log(`📦 Total deliverables: ${deliverablePackage.files.length}`);
            
            return deliverablePackage;
            
        } catch (error) {
            console.error('❌ LP6 generation failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🔍 ANALYZE ALL PLANS
     */
    async analyzeAllPlans(planPaths) {
        const allResults = {
            plans: [],
            totalElements: 0,
            elementsByType: new Map(),
            criticalConnections: [],
            coordinationPoints: []
        };
        
        for (const planPath of planPaths) {
            console.log(`   🔍 Analyzing ${path.basename(planPath)}...`);
            
            const analysis = await this.pixelAnalyzer.analyzeConstructionPlan(planPath);
            const classifications = await this.classificationSystem.batchClassifyElements(
                analysis.elements.all
            );
            const measurements = await this.measurementEngine.batchCalculateMeasurements(
                classifications.classifications,
                analysis.scale
            );
            
            allResults.plans.push({
                path: planPath,
                name: path.basename(planPath),
                scale: analysis.scale,
                elements: measurements.measurements,
                summary: measurements.summary
            });
            
            allResults.totalElements += measurements.measurements.length;
            
            // Group elements by type
            for (const element of measurements.measurements) {
                if (!allResults.elementsByType.has(element.classification)) {
                    allResults.elementsByType.set(element.classification, []);
                }
                allResults.elementsByType.get(element.classification).push(element);
            }
            
            // Identify critical connections
            this.identifyCriticalConnections(measurements.measurements, allResults.criticalConnections);
            
            // Identify coordination points
            this.identifyCoordinationPoints(measurements.measurements, allResults.coordinationPoints);
        }
        
        return allResults;
    }
    
    /**
     * 📐 GENERATE EXECUTION DRAWINGS
     */
    async generateExecutionDrawings(analysisResults, projectInfo) {
        const drawings = [];
        
        console.log('   📐 Creating annotated execution drawings...');
        
        for (const plan of analysisResults.plans) {
            // Load original plan
            const planImage = await loadImage(plan.path);
            
            // Create canvas for annotated drawing
            const canvas = createCanvas(planImage.width, planImage.height);
            const ctx = canvas.getContext('2d');
            
            // Draw original plan
            ctx.drawImage(planImage, 0, 0);
            
            // Configure drawing style
            this.configureDrawingStyle(ctx, plan.scale);
            
            // Add grid lines
            await this.addGridLines(ctx, canvas.width, canvas.height, plan.scale);
            
            // Add element annotations
            for (const element of plan.elements) {
                await this.annotateElement(ctx, element, plan.scale);
            }
            
            // Add dimensions
            await this.addDimensions(ctx, plan.elements, plan.scale);
            
            // Add material callouts
            await this.addMaterialCallouts(ctx, plan.elements, plan.scale);
            
            // Add title block
            await this.addTitleBlock(ctx, canvas, {
                projectName: projectInfo.name,
                drawingTitle: `Execution Plan - ${plan.name}`,
                scale: plan.scale.notation,
                date: new Date().toISOString().split('T')[0],
                drawingNumber: `EP-${drawings.length + 1}`
            });
            
            // Save drawing
            const drawingBuffer = canvas.toBuffer('image/png');
            const drawingPath = await this.saveDrawing(drawingBuffer, 'execution', plan.name, projectInfo);
            
            drawings.push({
                type: 'execution',
                name: plan.name,
                path: drawingPath,
                scale: plan.scale.notation,
                elementCount: plan.elements.length
            });
        }
        
        return drawings;
    }
    
    /**
     * 🔍 GENERATE DETAIL DRAWINGS
     */
    async generateDetailDrawings(analysisResults, projectInfo) {
        const detailDrawings = [];
        
        console.log('   🔍 Creating detail drawings for critical connections...');
        
        // Generate details for each critical connection
        for (const connection of analysisResults.criticalConnections) {
            const detailCanvas = await this.createDetailDrawing(connection, projectInfo);
            
            if (detailCanvas) {
                const drawingBuffer = detailCanvas.toBuffer('image/png');
                const drawingPath = await this.saveDrawing(
                    drawingBuffer, 
                    'detail', 
                    `connection_${connection.id}`,
                    projectInfo
                );
                
                detailDrawings.push({
                    type: 'detail',
                    connectionId: connection.id,
                    description: connection.description,
                    path: drawingPath,
                    scale: this.config.hoaiRequirements.drawingScales.detail
                });
            }
        }
        
        // Generate typical details
        const typicalDetails = await this.generateTypicalDetails(analysisResults.elementsByType);
        detailDrawings.push(...typicalDetails);
        
        return detailDrawings;
    }
    
    /**
     * 📋 GENERATE MATERIAL LISTS
     */
    async generateMaterialLists(analysisResults, projectInfo) {
        const materialLists = [];
        
        console.log('   📋 Creating comprehensive material lists...');
        
        // Group materials by element type
        const materialsByElement = await this.groupMaterialsByElement(analysisResults);
        
        // Group materials by supplier
        const materialsBySupplier = await this.groupMaterialsBySupplier(materialsByElement);
        
        // Group materials by construction phase
        const materialsByPhase = await this.groupMaterialsByPhase(materialsByElement);
        
        // Create master material list
        const masterList = await this.createMasterMaterialList(materialsByElement, projectInfo);
        materialLists.push(masterList);
        
        // Create supplier-specific lists
        for (const [supplier, materials] of materialsBySupplier.entries()) {
            const supplierList = await this.createSupplierMaterialList(supplier, materials, projectInfo);
            materialLists.push(supplierList);
        }
        
        // Create phase-specific lists
        for (const [phase, materials] of materialsByPhase.entries()) {
            const phaseList = await this.createPhaseMaterialList(phase, materials, projectInfo);
            materialLists.push(phaseList);
        }
        
        return materialLists;
    }
    
    /**
     * 📅 GENERATE CONSTRUCTION SEQUENCE
     */
    async generateConstructionSequence(analysisResults, projectInfo) {
        console.log('   📅 Creating construction sequence documentation...');
        
        const sequence = {
            projectInfo: projectInfo,
            phases: [],
            ganttChart: null,
            criticalPath: [],
            resourceAllocation: []
        };
        
        // Define construction phases based on elements
        for (const phaseName of this.config.sequenceDocumentation.phases) {
            const phase = await this.defineConstructionPhase(phaseName, analysisResults);
            if (phase.activities.length > 0) {
                sequence.phases.push(phase);
            }
        }
        
        // Calculate dependencies
        this.calculatePhaseDependencies(sequence.phases);
        
        // Generate Gantt chart
        if (this.config.sequenceDocumentation.ganttChart.enabled) {
            sequence.ganttChart = await this.generateGanttChart(sequence.phases, projectInfo);
        }
        
        // Calculate critical path
        sequence.criticalPath = this.calculateCriticalPath(sequence.phases);
        
        // Plan resource allocation
        sequence.resourceAllocation = await this.planResourceAllocation(sequence.phases);
        
        return sequence;
    }
    
    /**
     * 🔗 GENERATE INTERFACE COORDINATION
     */
    async generateInterfaceCoordination(analysisResults, projectInfo) {
        console.log('   🔗 Creating interface coordination documents...');
        
        const coordination = {
            disciplines: [],
            matrices: [],
            clashReports: [],
            coordinationDrawings: []
        };
        
        // Identify discipline-specific elements
        for (const discipline of this.config.interfaceCoordination.disciplines) {
            const disciplineElements = this.filterElementsByDiscipline(
                analysisResults.elementsByType,
                discipline
            );
            
            coordination.disciplines.push({
                name: discipline,
                elementCount: disciplineElements.length,
                elements: disciplineElements
            });
        }
        
        // Create coordination matrices
        coordination.matrices = await this.createCoordinationMatrices(
            coordination.disciplines,
            analysisResults.coordinationPoints
        );
        
        // Perform clash detection
        if (this.config.interfaceCoordination.clashDetection.enabled) {
            coordination.clashReports = await this.performClashDetection(
                coordination.disciplines,
                this.config.interfaceCoordination.clashDetection.tolerance
            );
        }
        
        // Generate coordination drawings
        coordination.coordinationDrawings = await this.generateCoordinationDrawings(
            analysisResults,
            coordination.clashReports,
            projectInfo
        );
        
        return coordination;
    }
    
    /**
     * 📦 CREATE DELIVERABLE PACKAGE
     */
    async createDeliverablePackage(deliverables, projectInfo) {
        const outputDir = path.join(process.cwd(), 'lp6_deliverables', projectInfo.projectNumber || 'project');
        await fs.mkdir(outputDir, { recursive: true });
        
        const package_ = {
            projectInfo: projectInfo,
            generatedAt: new Date().toISOString(),
            deliverables: deliverables,
            files: [],
            index: null
        };
        
        // Copy all generated files to package directory
        console.log('   📦 Packaging all deliverables...');
        
        // Package execution drawings
        for (const drawing of deliverables.executionDrawings) {
            const destPath = path.join(outputDir, 'execution_drawings', path.basename(drawing.path));
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(drawing.path, destPath);
            package_.files.push({
                type: 'execution_drawing',
                name: drawing.name,
                path: destPath
            });
        }
        
        // Package detail drawings
        for (const drawing of deliverables.detailDrawings) {
            const destPath = path.join(outputDir, 'detail_drawings', path.basename(drawing.path));
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.copyFile(drawing.path, destPath);
            package_.files.push({
                type: 'detail_drawing',
                description: drawing.description,
                path: destPath
            });
        }
        
        // Create comprehensive index
        package_.index = await this.createPackageIndex(package_, outputDir);
        
        console.log(`   ✅ Package created at: ${outputDir}`);
        
        return package_;
    }
    
    // ===========================
    // HELPER METHODS
    // ===========================
    
    configureDrawingStyle(ctx, scale) {
        // Set up drawing context for technical drawings
        const pixelsPerMm = scale.pixelsPerMillimeter;
        
        // Configure line weights
        ctx.lineWidth = this.config.drawingGeneration.lineWeights.outline * pixelsPerMm;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';
        
        // Set font for annotations
        ctx.font = `${12 * pixelsPerMm}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
    }
    
    async addGridLines(ctx, width, height, scale) {
        const gridSpacing = 1000 * scale.pixelsPerMillimeter; // 1m grid
        
        ctx.save();
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = this.config.drawingGeneration.lineWeights.annotation * scale.pixelsPerMillimeter;
        ctx.setLineDash([5, 5]);
        
        // Vertical grid lines
        for (let x = 0; x < width; x += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y < height; y += gridSpacing) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    async annotateElement(ctx, element, scale) {
        const bbox = element.boundingBox;
        
        // Draw element outline
        ctx.save();
        ctx.strokeStyle = this.getElementColor(element.classification);
        ctx.lineWidth = this.config.drawingGeneration.lineWeights.outline * scale.pixelsPerMillimeter;
        
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        
        // Add element label
        ctx.fillStyle = 'black';
        ctx.font = `${10 * scale.pixelsPerMillimeter}px Arial`;
        ctx.fillText(
            element.classification,
            bbox.x + 5,
            bbox.y - 15 * scale.pixelsPerMillimeter
        );
        
        ctx.restore();
    }
    
    async addDimensions(ctx, elements, scale) {
        ctx.save();
        ctx.strokeStyle = 'blue';
        ctx.fillStyle = 'blue';
        ctx.lineWidth = this.config.drawingGeneration.lineWeights.dimension * scale.pixelsPerMillimeter;
        ctx.font = `${8 * scale.pixelsPerMillimeter}px Arial`;
        
        // Add dimensions for major elements
        for (const element of elements) {
            if (element.dimensions) {
                // Horizontal dimension
                if (element.dimensions.width) {
                    await this.drawDimension(
                        ctx,
                        element.boundingBox.x,
                        element.boundingBox.y - 20 * scale.pixelsPerMillimeter,
                        element.boundingBox.x + element.boundingBox.width,
                        element.boundingBox.y - 20 * scale.pixelsPerMillimeter,
                        element.dimensions.width.value,
                        element.dimensions.width.unit,
                        scale
                    );
                }
                
                // Vertical dimension
                if (element.dimensions.height) {
                    await this.drawDimension(
                        ctx,
                        element.boundingBox.x - 20 * scale.pixelsPerMillimeter,
                        element.boundingBox.y,
                        element.boundingBox.x - 20 * scale.pixelsPerMillimeter,
                        element.boundingBox.y + element.boundingBox.height,
                        element.dimensions.height.value,
                        element.dimensions.height.unit,
                        scale
                    );
                }
            }
        }
        
        ctx.restore();
    }
    
    async drawDimension(ctx, x1, y1, x2, y2, value, unit, scale) {
        // Draw dimension line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw arrows
        const arrowSize = 5 * scale.pixelsPerMillimeter;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Start arrow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 + arrowSize * Math.cos(angle + Math.PI / 6),
            y1 + arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.moveTo(x1, y1);
        ctx.lineTo(
            x1 + arrowSize * Math.cos(angle - Math.PI / 6),
            y1 + arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.stroke();
        
        // End arrow
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - arrowSize * Math.cos(angle + Math.PI / 6),
            y2 - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - arrowSize * Math.cos(angle - Math.PI / 6),
            y2 - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.stroke();
        
        // Add dimension text
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const text = `${value} ${unit}`;
        
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.fillText(text, 0, -5 * scale.pixelsPerMillimeter);
        ctx.restore();
    }
    
    async addMaterialCallouts(ctx, elements, scale) {
        const materialGroups = new Map();
        
        // Group elements by material
        for (const element of elements) {
            const material = element.properties?.material || 'unknown';
            if (!materialGroups.has(material)) {
                materialGroups.set(material, []);
            }
            materialGroups.get(material).push(element);
        }
        
        // Add callouts for each material group
        let calloutY = 50 * scale.pixelsPerMillimeter;
        
        ctx.save();
        ctx.font = `${10 * scale.pixelsPerMillimeter}px Arial`;
        
        for (const [material, groupElements] of materialGroups.entries()) {
            // Draw callout
            ctx.fillStyle = 'black';
            ctx.fillText(`${material}: ${groupElements.length} elements`, 10, calloutY);
            
            // Draw sample pattern
            const patternX = 300 * scale.pixelsPerMillimeter;
            ctx.fillStyle = this.getMaterialColor(material);
            ctx.fillRect(patternX, calloutY - 10 * scale.pixelsPerMillimeter, 50 * scale.pixelsPerMillimeter, 15 * scale.pixelsPerMillimeter);
            
            calloutY += 25 * scale.pixelsPerMillimeter;
        }
        
        ctx.restore();
    }
    
    async addTitleBlock(ctx, canvas, info) {
        const blockHeight = 100;
        const blockY = canvas.height - blockHeight;
        
        // Draw title block background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, blockY, canvas.width, blockHeight);
        
        // Draw border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, blockY, canvas.width, blockHeight);
        
        // Add text
        ctx.fillStyle = 'black';
        ctx.font = '24px Arial';
        ctx.fillText(info.projectName, 20, blockY + 30);
        
        ctx.font = '18px Arial';
        ctx.fillText(info.drawingTitle, 20, blockY + 60);
        
        ctx.font = '14px Arial';
        ctx.fillText(`Scale: ${info.scale}`, canvas.width - 200, blockY + 30);
        ctx.fillText(`Date: ${info.date}`, canvas.width - 200, blockY + 50);
        ctx.fillText(`Drawing: ${info.drawingNumber}`, canvas.width - 200, blockY + 70);
    }
    
    async saveDrawing(buffer, type, name, projectInfo) {
        const outputDir = path.join(
            process.cwd(),
            'lp6_output',
            projectInfo.projectNumber || 'project',
            type
        );
        
        await fs.mkdir(outputDir, { recursive: true });
        
        const filename = `${projectInfo.projectNumber || 'PRJ'}_${type}_${name}_${Date.now()}.png`;
        const filepath = path.join(outputDir, filename);
        
        await fs.writeFile(filepath, buffer);
        
        return filepath;
    }
    
    identifyCriticalConnections(elements, connections) {
        // Identify connections that need detail drawings
        const connectionTypes = [
            { type1: 'wall', type2: 'slab', description: 'Wall-Slab Connection' },
            { type1: 'column', type2: 'beam', description: 'Column-Beam Connection' },
            { type1: 'wall', type2: 'foundation', description: 'Wall-Foundation Connection' }
        ];
        
        for (const connType of connectionTypes) {
            const type1Elements = elements.filter(e => e.classification.includes(connType.type1));
            const type2Elements = elements.filter(e => e.classification.includes(connType.type2));
            
            // Find intersecting elements
            for (const elem1 of type1Elements) {
                for (const elem2 of type2Elements) {
                    if (this.elementsIntersect(elem1, elem2)) {
                        connections.push({
                            id: `conn_${connections.length + 1}`,
                            element1: elem1,
                            element2: elem2,
                            description: connType.description,
                            location: this.getIntersectionPoint(elem1, elem2)
                        });
                    }
                }
            }
        }
    }
    
    identifyCoordinationPoints(elements, coordinationPoints) {
        // Identify points where multiple disciplines intersect
        const mepElements = elements.filter(e => 
            e.classification.includes('pipe') || 
            e.classification.includes('duct') || 
            e.classification.includes('conduit')
        );
        
        const structuralElements = elements.filter(e => 
            e.classification.includes('wall') || 
            e.classification.includes('slab') || 
            e.classification.includes('beam')
        );
        
        // Find MEP/Structural intersections
        for (const mep of mepElements) {
            for (const structural of structuralElements) {
                if (this.elementsIntersect(mep, structural)) {
                    coordinationPoints.push({
                        id: `coord_${coordinationPoints.length + 1}`,
                        mepElement: mep,
                        structuralElement: structural,
                        type: 'penetration',
                        location: this.getIntersectionPoint(mep, structural)
                    });
                }
            }
        }
    }
    
    elementsIntersect(elem1, elem2) {
        const box1 = elem1.boundingBox;
        const box2 = elem2.boundingBox;
        
        return !(
            box1.x + box1.width < box2.x ||
            box2.x + box2.width < box1.x ||
            box1.y + box1.height < box2.y ||
            box2.y + box2.height < box1.y
        );
    }
    
    getIntersectionPoint(elem1, elem2) {
        const box1 = elem1.boundingBox;
        const box2 = elem2.boundingBox;
        
        return {
            x: Math.max(box1.x, box2.x),
            y: Math.max(box1.y, box2.y)
        };
    }
    
    async createDetailDrawing(connection, projectInfo) {
        const canvas = createCanvas(1000, 1000);
        const ctx = canvas.getContext('2d');
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 1000, 1000);
        
        // Draw connection detail at larger scale
        const scale = { pixelsPerMillimeter: 20 }; // 1:5 scale
        
        ctx.save();
        ctx.translate(500, 500); // Center the drawing
        
        // Draw elements
        this.drawDetailElement(ctx, connection.element1, scale);
        this.drawDetailElement(ctx, connection.element2, scale);
        
        // Add dimensions and annotations
        this.addDetailAnnotations(ctx, connection, scale);
        
        ctx.restore();
        
        // Add title
        ctx.font = '20px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(connection.description, 50, 50);
        ctx.fillText(`Scale 1:5`, 50, 80);
        
        return canvas;
    }
    
    drawDetailElement(ctx, element, scale) {
        // Simplified element drawing for details
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        const width = (element.dimensions?.width?.value || 100) * scale.pixelsPerMillimeter;
        const height = (element.dimensions?.height?.value || 100) * scale.pixelsPerMillimeter;
        
        ctx.strokeRect(-width/2, -height/2, width, height);
        
        // Add material hatching
        this.addMaterialHatching(ctx, -width/2, -height/2, width, height, element.properties?.material);
    }
    
    addMaterialHatching(ctx, x, y, width, height, material) {
        ctx.save();
        ctx.clip();
        
        switch (material) {
            case 'concrete':
                // Dots for concrete
                for (let i = x; i < x + width; i += 10) {
                    for (let j = y; j < y + height; j += 10) {
                        ctx.beginPath();
                        ctx.arc(i, j, 1, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
                break;
            case 'masonry':
                // Horizontal lines for masonry
                for (let i = y; i < y + height; i += 20) {
                    ctx.beginPath();
                    ctx.moveTo(x, i);
                    ctx.lineTo(x + width, i);
                    ctx.stroke();
                }
                break;
            case 'insulation':
                // Wavy lines for insulation
                for (let i = x; i < x + width; i += 15) {
                    ctx.beginPath();
                    ctx.moveTo(i, y);
                    for (let j = y; j < y + height; j += 10) {
                        ctx.lineTo(i + 5 * Math.sin(j / 10), j);
                    }
                    ctx.stroke();
                }
                break;
        }
        
        ctx.restore();
    }
    
    addDetailAnnotations(ctx, connection, scale) {
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        
        // Add connection-specific annotations
        ctx.fillText('See structural details', -200, 200);
        ctx.fillText('Verify dimensions on site', -200, 220);
    }
    
    async generateTypicalDetails(elementsByType) {
        const typicalDetails = [];
        
        // Generate typical details for common element types
        const detailTypes = [
            { type: 'window', description: 'Typical Window Installation' },
            { type: 'door', description: 'Typical Door Installation' },
            { type: 'insulation', description: 'Typical Insulation Detail' }
        ];
        
        for (const detailType of detailTypes) {
            if (elementsByType.has(detailType.type)) {
                // Create typical detail drawing
                // Implementation would create standardized detail drawings
                typicalDetails.push({
                    type: 'typical_detail',
                    elementType: detailType.type,
                    description: detailType.description,
                    scale: '1:10'
                });
            }
        }
        
        return typicalDetails;
    }
    
    async groupMaterialsByElement(analysisResults) {
        const materials = new Map();
        
        for (const plan of analysisResults.plans) {
            for (const element of plan.elements) {
                const material = await this.materialDB.getMaterialProperties(
                    this.getMaterialCategory(element.classification),
                    element.properties?.material || 'default'
                );
                
                if (!materials.has(element.classification)) {
                    materials.set(element.classification, []);
                }
                
                materials.get(element.classification).push({
                    element: element,
                    material: material,
                    quantity: element.area?.squareMeters?.value || element.volume?.cubicMeters?.value || 1,
                    unit: element.area ? 'm²' : element.volume ? 'm³' : 'Stk'
                });
            }
        }
        
        return materials;
    }
    
    async groupMaterialsBySupplier(materialsByElement) {
        const bySupplier = new Map();
        
        for (const [elementType, materials] of materialsByElement.entries()) {
            for (const mat of materials) {
                // Check availability and get suppliers
                const availability = await this.materialDB.checkAvailability(
                    mat.material,
                    'default'
                );
                
                if (availability.suppliers && availability.suppliers.length > 0) {
                    const supplier = availability.suppliers[0].name;
                    
                    if (!bySupplier.has(supplier)) {
                        bySupplier.set(supplier, []);
                    }
                    
                    bySupplier.get(supplier).push(mat);
                }
            }
        }
        
        return bySupplier;
    }
    
    async groupMaterialsByPhase(materialsByElement) {
        const byPhase = new Map();
        
        // Map element types to construction phases
        const phaseMapping = {
            'foundation': 'foundation',
            'wall_load_bearing': 'structure',
            'column': 'structure',
            'beam': 'structure',
            'slab': 'structure',
            'wall_non_load_bearing': 'interior',
            'insulation': 'envelope',
            'window': 'envelope',
            'door': 'interior',
            'flooring': 'finishes'
        };
        
        for (const [elementType, materials] of materialsByElement.entries()) {
            const phase = phaseMapping[elementType] || 'general';
            
            if (!byPhase.has(phase)) {
                byPhase.set(phase, []);
            }
            
            byPhase.get(phase).push(...materials);
        }
        
        return byPhase;
    }
    
    async createMasterMaterialList(materialsByElement, projectInfo) {
        const list = {
            type: 'master_material_list',
            projectInfo: projectInfo,
            generatedAt: new Date().toISOString(),
            materials: []
        };
        
        let position = 1;
        
        for (const [elementType, materials] of materialsByElement.entries()) {
            for (const mat of materials) {
                list.materials.push({
                    position: position++,
                    elementType: elementType,
                    description: mat.material.name,
                    specification: mat.material.specification,
                    quantity: mat.quantity,
                    unit: mat.unit,
                    properties: mat.material.properties,
                    compliance: mat.material.compliance
                });
            }
        }
        
        return list;
    }
    
    async createSupplierMaterialList(supplier, materials, projectInfo) {
        return {
            type: 'supplier_material_list',
            supplier: supplier,
            projectInfo: projectInfo,
            materials: materials.map((mat, index) => ({
                position: index + 1,
                description: mat.material.name,
                quantity: mat.quantity,
                unit: mat.unit,
                articleNumber: mat.material.supplierArticleNumber || 'TBD'
            }))
        };
    }
    
    async createPhaseMaterialList(phase, materials, projectInfo) {
        return {
            type: 'phase_material_list',
            phase: phase,
            projectInfo: projectInfo,
            materials: materials.map((mat, index) => ({
                position: index + 1,
                elementType: mat.element.classification,
                description: mat.material.name,
                quantity: mat.quantity,
                unit: mat.unit,
                deliveryDate: this.calculateDeliveryDate(phase)
            }))
        };
    }
    
    async defineConstructionPhase(phaseName, analysisResults) {
        const phase = {
            name: phaseName,
            activities: [],
            duration: 0,
            predecessors: [],
            resources: []
        };
        
        // Map elements to activities based on phase
        const phaseElements = this.getElementsForPhase(phaseName, analysisResults.elementsByType);
        
        for (const [elementType, elements] of phaseElements) {
            phase.activities.push({
                name: `Install ${elementType}`,
                elementCount: elements.length,
                duration: this.estimateActivityDuration(elementType, elements.length),
                resources: this.estimateResources(elementType, elements.length)
            });
        }
        
        phase.duration = Math.max(...phase.activities.map(a => a.duration));
        
        return phase;
    }
    
    getElementsForPhase(phaseName, elementsByType) {
        const phaseElements = new Map();
        
        const phaseMapping = {
            'foundation': ['foundation'],
            'structure': ['column', 'beam', 'wall_load_bearing', 'slab'],
            'envelope': ['wall_exterior', 'window', 'door_exterior', 'roof', 'insulation'],
            'interior': ['wall_non_load_bearing', 'door_interior'],
            'finishes': ['flooring', 'ceiling_finish', 'wall_finish']
        };
        
        const elementTypes = phaseMapping[phaseName] || [];
        
        for (const type of elementTypes) {
            if (elementsByType.has(type)) {
                phaseElements.set(type, elementsByType.get(type));
            }
        }
        
        return phaseElements;
    }
    
    calculatePhaseDependencies(phases) {
        // Define standard dependencies
        const dependencies = {
            'site_preparation': [],
            'foundation': ['site_preparation'],
            'structure': ['foundation'],
            'envelope': ['structure'],
            'mep_rough': ['structure'],
            'interior': ['envelope', 'mep_rough'],
            'mep_finish': ['interior'],
            'finishes': ['mep_finish'],
            'commissioning': ['finishes']
        };
        
        for (const phase of phases) {
            phase.predecessors = dependencies[phase.name] || [];
        }
    }
    
    async generateGanttChart(phases, projectInfo) {
        // Would use a library like node-gantt or similar
        // For now, return structure
        return {
            projectName: projectInfo.name,
            startDate: new Date(),
            phases: phases.map(phase => ({
                name: phase.name,
                start: this.calculatePhaseStart(phase, phases),
                duration: phase.duration,
                dependencies: phase.predecessors
            }))
        };
    }
    
    calculateCriticalPath(phases) {
        // Implement critical path method (CPM)
        // For now, return longest path
        return phases.map(p => p.name);
    }
    
    async planResourceAllocation(phases) {
        const allocation = [];
        
        for (const phase of phases) {
            const phaseAllocation = {
                phase: phase.name,
                resources: new Map()
            };
            
            for (const activity of phase.activities) {
                for (const [resource, quantity] of Object.entries(activity.resources)) {
                    if (!phaseAllocation.resources.has(resource)) {
                        phaseAllocation.resources.set(resource, 0);
                    }
                    phaseAllocation.resources.set(
                        resource,
                        phaseAllocation.resources.get(resource) + quantity
                    );
                }
            }
            
            allocation.push(phaseAllocation);
        }
        
        return allocation;
    }
    
    filterElementsByDiscipline(elementsByType, discipline) {
        const disciplineMapping = {
            'structural': ['column', 'beam', 'wall_load_bearing', 'slab', 'foundation'],
            'architectural': ['wall_non_load_bearing', 'door', 'window', 'flooring', 'ceiling'],
            'mechanical': ['hvac_duct', 'pipe_heating', 'pipe_cooling'],
            'electrical': ['conduit', 'cable_tray', 'junction_box'],
            'plumbing': ['pipe_water', 'pipe_waste', 'fixture']
        };
        
        const elementTypes = disciplineMapping[discipline] || [];
        const elements = [];
        
        for (const type of elementTypes) {
            if (elementsByType.has(type)) {
                elements.push(...elementsByType.get(type));
            }
        }
        
        return elements;
    }
    
    async createCoordinationMatrices(disciplines, coordinationPoints) {
        const matrices = [];
        
        // Create discipline interaction matrix
        const interactionMatrix = {
            type: 'discipline_interaction',
            disciplines: disciplines.map(d => d.name),
            matrix: []
        };
        
        for (let i = 0; i < disciplines.length; i++) {
            interactionMatrix.matrix[i] = [];
            for (let j = 0; j < disciplines.length; j++) {
                if (i === j) {
                    interactionMatrix.matrix[i][j] = '-';
                } else {
                    // Count coordination points between disciplines
                    const points = this.countCoordinationPoints(
                        disciplines[i],
                        disciplines[j],
                        coordinationPoints
                    );
                    interactionMatrix.matrix[i][j] = points;
                }
            }
        }
        
        matrices.push(interactionMatrix);
        
        return matrices;
    }
    
    async performClashDetection(disciplines, tolerance) {
        const clashes = [];
        
        // Simple clash detection between disciplines
        for (let i = 0; i < disciplines.length - 1; i++) {
            for (let j = i + 1; j < disciplines.length; j++) {
                const disciplineClashes = this.detectClashesBetweenDisciplines(
                    disciplines[i],
                    disciplines[j],
                    tolerance
                );
                
                clashes.push(...disciplineClashes);
            }
        }
        
        return clashes;
    }
    
    async generateCoordinationDrawings(analysisResults, clashReports, projectInfo) {
        const drawings = [];
        
        // Generate overlay drawings showing multiple disciplines
        // Implementation would create drawings with different disciplines in different colors
        
        return drawings;
    }
    
    async createPackageIndex(package_, outputDir) {
        const index = {
            projectInfo: package_.projectInfo,
            generatedAt: package_.generatedAt,
            contents: {
                executionDrawings: package_.files.filter(f => f.type === 'execution_drawing').length,
                detailDrawings: package_.files.filter(f => f.type === 'detail_drawing').length,
                materialLists: package_.deliverables.materialLists.length,
                sequenceDocuments: 1,
                coordinationDocuments: package_.deliverables.interfaceDocuments.matrices.length
            },
            files: package_.files
        };
        
        const indexPath = path.join(outputDir, 'index.json');
        await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
        
        return indexPath;
    }
    
    // Utility methods
    
    getElementColor(classification) {
        const colors = {
            'wall': 'black',
            'door': 'blue',
            'window': 'green',
            'column': 'red',
            'beam': 'purple'
        };
        
        for (const [key, color] of Object.entries(colors)) {
            if (classification.includes(key)) {
                return color;
            }
        }
        
        return 'gray';
    }
    
    getMaterialColor(material) {
        const colors = {
            'concrete': 'rgb(200, 200, 200)',
            'steel': 'rgb(100, 100, 100)',
            'masonry': 'rgb(230, 180, 140)',
            'insulation': 'rgb(255, 255, 200)',
            'wood': 'rgb(200, 150, 100)'
        };
        
        return colors[material] || 'rgb(128, 128, 128)';
    }
    
    getMaterialCategory(elementType) {
        if (elementType.includes('wall') || elementType.includes('column')) {
            return 'concrete';
        }
        if (elementType.includes('beam')) {
            return 'steel';
        }
        if (elementType.includes('insulation')) {
            return 'insulation';
        }
        return 'concrete';
    }
    
    estimateActivityDuration(elementType, count) {
        // Rough estimates in days
        const rates = {
            'wall': 0.5,      // 2 walls per day
            'column': 0.25,   // 4 columns per day
            'beam': 0.5,      // 2 beams per day
            'slab': 2,        // 0.5 slabs per day
            'door': 0.2,      // 5 doors per day
            'window': 0.3     // 3-4 windows per day
        };
        
        const rate = rates[elementType] || 1;
        return Math.ceil(count * rate);
    }
    
    estimateResources(elementType, count) {
        // Rough resource estimates
        const resources = {
            'wall': { workers: 4, crane: 0 },
            'column': { workers: 3, crane: 1 },
            'beam': { workers: 4, crane: 1 },
            'slab': { workers: 6, crane: 1 },
            'door': { workers: 2, crane: 0 },
            'window': { workers: 2, crane: 0 }
        };
        
        return resources[elementType] || { workers: 2, crane: 0 };
    }
    
    calculatePhaseStart(phase, allPhases) {
        // Calculate start date based on dependencies
        let maxPredecessorEnd = new Date();
        
        for (const predName of phase.predecessors) {
            const pred = allPhases.find(p => p.name === predName);
            if (pred && pred.endDate) {
                if (pred.endDate > maxPredecessorEnd) {
                    maxPredecessorEnd = pred.endDate;
                }
            }
        }
        
        return maxPredecessorEnd;
    }
    
    calculateDeliveryDate(phase) {
        // Calculate material delivery date based on phase
        const leadTimes = {
            'foundation': -7,  // 7 days before phase start
            'structure': -14,  // 14 days before
            'envelope': -10,
            'interior': -7,
            'finishes': -5
        };
        
        const leadTime = leadTimes[phase] || -7;
        const date = new Date();
        date.setDate(date.getDate() + leadTime);
        
        return date.toISOString().split('T')[0];
    }
    
    countCoordinationPoints(discipline1, discipline2, coordinationPoints) {
        // Count coordination points between two disciplines
        return coordinationPoints.filter(point => {
            const elem1Discipline = this.getElementDiscipline(point.mepElement);
            const elem2Discipline = this.getElementDiscipline(point.structuralElement);
            
            return (
                (elem1Discipline === discipline1.name && elem2Discipline === discipline2.name) ||
                (elem1Discipline === discipline2.name && elem2Discipline === discipline1.name)
            );
        }).length;
    }
    
    getElementDiscipline(element) {
        // Map element to discipline
        if (element.classification.includes('wall') || 
            element.classification.includes('column') ||
            element.classification.includes('beam')) {
            return 'structural';
        }
        if (element.classification.includes('pipe')) {
            return element.classification.includes('heating') ? 'mechanical' : 'plumbing';
        }
        if (element.classification.includes('conduit')) {
            return 'electrical';
        }
        return 'architectural';
    }
    
    detectClashesBetweenDisciplines(discipline1, discipline2, tolerance) {
        const clashes = [];
        
        // Check for spatial conflicts between elements
        for (const elem1 of discipline1.elements) {
            for (const elem2 of discipline2.elements) {
                const distance = this.calculateElementDistance(elem1, elem2);
                
                if (distance < tolerance) {
                    clashes.push({
                        id: `clash_${clashes.length + 1}`,
                        discipline1: discipline1.name,
                        discipline2: discipline2.name,
                        element1: elem1,
                        element2: elem2,
                        distance: distance,
                        severity: distance === 0 ? 'hard' : 'soft'
                    });
                }
            }
        }
        
        return clashes;
    }
    
    calculateElementDistance(elem1, elem2) {
        // Calculate minimum distance between elements
        const box1 = elem1.boundingBox;
        const box2 = elem2.boundingBox;
        
        // Simple box distance calculation
        const xDist = Math.max(0, Math.max(box1.x - (box2.x + box2.width), box2.x - (box1.x + box1.width)));
        const yDist = Math.max(0, Math.max(box1.y - (box2.y + box2.height), box2.y - (box1.y + box1.height)));
        
        return Math.sqrt(xDist * xDist + yDist * yDist);
    }
}
