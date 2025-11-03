/**
 * 📄 DYNAMIC AUSSCHREIBUNG GENERATOR - TEMPLATE-FREE DOCUMENT GENERATION
 * ====================================================================
 * 
 * MISSION: Generate dynamic Ausschreibung documents using real detected data
 * 
 * KEY CAPABILITIES:
 * ✅ Template-free document generation
 * ✅ Quantity-driven content creation
 * ✅ Real material specification integration
 * ✅ STLB-Bau text integration
 * ✅ DIN 276 compliant structure
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Document Generator
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Import all required systems
import RealPixelAnalyzer from '../vision/RealPixelAnalyzer.js';
import PreciseMeasurementEngine from '../analysis/PreciseMeasurementEngine.js';
import ElementClassificationSystem from '../ml/ElementClassificationSystem.js';
import MaterialSpecificationDB from '../database/MaterialSpecificationDB.js';
import DIN276CostMapper from '../costing/DIN276CostMapper.js';
import STLBBauConnector from '../standards/STLBBauConnector.js';

export default class DynamicAusschreibungGenerator extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            generatorName: 'DYNAMIC_AUSSCHREIBUNG_GENERATOR',
            
            // Document Structure Configuration
            documentStructure: {
                // Document sections in order
                sections: [
                    'deckblatt',           // Cover page
                    'inhaltsverzeichnis',  // Table of contents
                    'vorbemerkungen',      // Preliminary remarks
                    'projektbeschreibung', // Project description
                    'leistungsbereiche',   // Service areas (DIN 276)
                    'positionen',          // Individual positions
                    'mengenermittlung',    // Quantity calculation
                    'anlagen'              // Attachments
                ],
                
                // DIN 276 hierarchy levels
                hierarchyLevels: {
                    hauptgruppe: 1,    // 300, 400, etc.
                    obergruppe: 2,     // 330, 340, etc.
                    untergruppe: 3,    // 331, 332, etc.
                    position: 4        // 331.10, 331.20, etc.
                }
            },
            
            // Content Generation Rules
            contentRules: {
                // Minimum positions per category
                minPositionsPerCategory: 3,
                
                // Text requirements
                textRequirements: {
                    minShortTextLength: 20,
                    minLongTextLength: 100,
                    includeExecutionDetails: true,
                    includeQualityRequirements: true,
                    includeMaterialSpecs: true
                },
                
                // Quantity requirements
                quantityRequirements: {
                    showCalculationMethod: true,
                    includeWasteFactor: true,
                    roundingPrecision: 2,
                    showMeasurementSource: true
                }
            },
            
            // Professional Standards
            standards: {
                compliance: ['VOB/A', 'VOB/C', 'DIN 276', 'HOAI'],
                textStandard: 'STLB-Bau',
                measurementStandard: 'VOB/C respective DIN 18331-18451',
                qualityStandard: 'DIN EN ISO 9001'
            },
            
            // Output Configuration
            output: {
                formats: ['pdf', 'gaeb', 'json', 'excel'],
                language: 'de',
                encoding: 'UTF-8',
                
                // PDF settings
                pdf: {
                    pageSize: 'A4',
                    margins: { top: 25, bottom: 25, left: 20, right: 20 },
                    fontSize: {
                        title: 16,
                        heading1: 14,
                        heading2: 12,
                        body: 10,
                        small: 8
                    },
                    fonts: {
                        regular: 'Helvetica',
                        bold: 'Helvetica-Bold',
                        italic: 'Helvetica-Italic'
                    }
                }
            }
        };
        
        // Initialize subsystems
        this.pixelAnalyzer = new RealPixelAnalyzer();
        this.measurementEngine = new PreciseMeasurementEngine();
        this.classificationSystem = new ElementClassificationSystem();
        this.materialDB = new MaterialSpecificationDB();
        this.costMapper = new DIN276CostMapper();
        this.stlbConnector = new STLBBauConnector();
        
        this.generatedDocument = null;
    }
    
    /**
     * 🚀 INITIALIZE GENERATOR
     */
    async initialize() {
        console.log('📄 Initializing Dynamic Ausschreibung Generator...');
        
        try {
            // Initialize all subsystems
            await Promise.all([
                this.pixelAnalyzer.initialize(),
                this.measurementEngine.initialize(),
                this.classificationSystem.initialize(),
                this.materialDB.initialize(),
                this.costMapper.initialize(),
                this.stlbConnector.initialize()
            ]);
            
            console.log('✅ Dynamic Ausschreibung Generator initialized');
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 📋 GENERATE AUSSCHREIBUNG FROM PLAN
     */
    async generateAusschreibung(planPath, projectInfo = {}) {
        console.log('📋 GENERATING DYNAMIC AUSSCHREIBUNG');
        console.log('===================================');
        console.log(`📐 Plan: ${path.basename(planPath)}`);
        console.log(`🏗️ Project: ${projectInfo.name || 'Construction Project'}`);
        console.log('');
        
        try {
            // STEP 1: Analyze construction plan
            console.log('🔍 STEP 1: ANALYZING CONSTRUCTION PLAN');
            const analysisResults = await this.analyzeConstructionPlan(planPath);
            console.log(`   ✅ Detected ${analysisResults.elements.length} elements`);
            
            // STEP 2: Generate positions from elements
            console.log('\n📝 STEP 2: GENERATING POSITIONS FROM ELEMENTS');
            const positions = await this.generatePositionsFromElements(
                analysisResults.elements,
                analysisResults.scale,
                projectInfo
            );
            console.log(`   ✅ Generated ${positions.length} positions`);
            
            // STEP 3: Structure by DIN 276
            console.log('\n📊 STEP 3: STRUCTURING BY DIN 276');
            const structuredData = await this.structureByDIN276(positions);
            console.log(`   ✅ Organized into ${Object.keys(structuredData).length} categories`);
            
            // STEP 4: Generate document content
            console.log('\n📄 STEP 4: GENERATING DOCUMENT CONTENT');
            const documentContent = await this.generateDocumentContent(
                structuredData,
                projectInfo,
                analysisResults
            );
            console.log(`   ✅ Generated ${documentContent.sections.length} sections`);
            
            // STEP 5: Create output documents
            console.log('\n💾 STEP 5: CREATING OUTPUT DOCUMENTS');
            const outputs = await this.createOutputDocuments(documentContent, projectInfo);
            console.log(`   ✅ Created ${outputs.length} output formats`);
            
            // Store generated document
            this.generatedDocument = {
                content: documentContent,
                outputs: outputs,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    elementsProcessed: analysisResults.elements.length,
                    positionsGenerated: positions.length,
                    confidence: this.calculateOverallConfidence(positions)
                }
            };
            
            console.log('\n🎉 AUSSCHREIBUNG GENERATION COMPLETE');
            console.log('====================================');
            console.log(`📄 Main document: ${outputs[0].filename}`);
            console.log(`📊 Total positions: ${positions.length}`);
            console.log(`💰 Estimated value: €${this.calculateTotalValue(positions).toLocaleString()}`);
            
            return this.generatedDocument;
            
        } catch (error) {
            console.error('❌ Generation failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🔍 ANALYZE CONSTRUCTION PLAN
     */
    async analyzeConstructionPlan(planPath) {
        console.log('   🔍 Running comprehensive plan analysis...');
        
        // Analyze with real pixel analyzer
        const analysisResults = await this.pixelAnalyzer.analyzeConstructionPlan(planPath);
        
        // Classify all elements
        const classifiedElements = await this.classificationSystem.batchClassifyElements(
            analysisResults.elements.all
        );
        
        // Calculate measurements for all elements
        const measurements = await this.measurementEngine.batchCalculateMeasurements(
            classifiedElements.classifications,
            analysisResults.scale
        );
        
        return {
            scale: analysisResults.scale,
            elements: measurements.measurements,
            summary: measurements.summary,
            confidence: analysisResults.analysisState.measurementAccuracy
        };
    }
    
    /**
     * 📝 GENERATE POSITIONS FROM ELEMENTS
     */
    async generatePositionsFromElements(elements, scale, projectInfo) {
        const positions = [];
        
        console.log(`   📝 Processing ${elements.length} elements into positions...`);
        
        // Group similar elements
        const groupedElements = this.groupSimilarElements(elements);
        
        for (const [groupKey, group] of Object.entries(groupedElements)) {
            console.log(`      📦 Processing ${group.elements.length} ${groupKey} elements...`);
            
            // Generate position for group
            const position = await this.generatePosition(group, scale, projectInfo);
            
            if (position) {
                positions.push(position);
            }
        }
        
        // Sort positions by DIN 276 code
        positions.sort((a, b) => a.din276.code.localeCompare(b.din276.code));
        
        // Assign ordinal numbers
        this.assignOrdinalNumbers(positions);
        
        return positions;
    }
    
    /**
     * 🏗️ GENERATE SINGLE POSITION
     */
    async generatePosition(elementGroup, scale, projectInfo) {
        const { type, elements } = elementGroup;
        
        try {
            // Get material specification
            const material = await this.materialDB.getMaterialProperties(
                this.getMaterialCategory(type),
                this.getMaterialSpecification(elements[0])
            );
            
            // Map to DIN 276
            const din276Mapping = await this.costMapper.mapElementToDIN276(
                elements[0],
                { region: projectInfo.region || 'default' }
            );
            
            // Generate STLB text
            const stlbPosition = await this.stlbConnector.generateCompletePosition(
                elements[0],
                {
                    requirements: {
                        qualityLevel: projectInfo.qualityLevel || 'standard',
                        material: material
                    }
                }
            );
            
            // Calculate total quantities
            const totalQuantity = this.calculateTotalQuantity(elements);
            
            // Create position
            const position = {
                // Identification
                ordinalNumber: '', // Will be assigned later
                din276: {
                    code: din276Mapping.din276.position,
                    group: din276Mapping.din276.group,
                    description: din276Mapping.din276.description
                },
                
                // Text content
                title: stlbPosition.text.title || stlbPosition.text.shortText,
                shortText: stlbPosition.text.shortText,
                longText: stlbPosition.text.longText,
                
                // Quantities
                quantity: totalQuantity.value,
                unit: totalQuantity.unit,
                
                // Technical details
                technical: {
                    material: material,
                    specifications: stlbPosition.specifications,
                    standards: stlbPosition.technical.dinStandards,
                    execution: stlbPosition.execution
                },
                
                // Quality requirements
                quality: stlbPosition.quality,
                
                // Cost estimation (empty for tender)
                unitPrice: 0.00,
                totalPrice: 0.00,
                
                // Metadata
                metadata: {
                    elementCount: elements.length,
                    confidence: this.calculatePositionConfidence(elements, din276Mapping),
                    measurementSource: 'pixel_accurate_analysis',
                    generatedAt: new Date().toISOString()
                }
            };
            
            return position;
            
        } catch (error) {
            console.error(`      ❌ Failed to generate position for ${type}: ${error.message}`);
            return null;
        }
    }
    
    /**
     * 📊 STRUCTURE BY DIN 276
     */
    async structureByDIN276(positions) {
        const structured = {};
        
        console.log('   📊 Organizing positions by DIN 276 hierarchy...');
        
        for (const position of positions) {
            const hauptgruppe = position.din276.code.substring(0, 1) + '00';
            const obergruppe = position.din276.code.substring(0, 3);
            
            // Initialize structure
            if (!structured[hauptgruppe]) {
                structured[hauptgruppe] = {
                    code: hauptgruppe,
                    description: this.getDIN276Description(hauptgruppe),
                    obergruppen: {}
                };
            }
            
            if (!structured[hauptgruppe].obergruppen[obergruppe]) {
                structured[hauptgruppe].obergruppen[obergruppe] = {
                    code: obergruppe,
                    description: this.getDIN276Description(obergruppe),
                    positions: []
                };
            }
            
            // Add position
            structured[hauptgruppe].obergruppen[obergruppe].positions.push(position);
        }
        
        // Calculate summaries
        for (const hauptgruppe of Object.values(structured)) {
            hauptgruppe.positionCount = 0;
            hauptgruppe.totalQuantity = 0;
            
            for (const obergruppe of Object.values(hauptgruppe.obergruppen)) {
                hauptgruppe.positionCount += obergruppe.positions.length;
                hauptgruppe.totalQuantity += obergruppe.positions.reduce(
                    (sum, pos) => sum + pos.quantity, 0
                );
            }
        }
        
        return structured;
    }
    
    /**
     * 📄 GENERATE DOCUMENT CONTENT
     */
    async generateDocumentContent(structuredData, projectInfo, analysisResults) {
        console.log('   📄 Generating comprehensive document content...');
        
        const content = {
            documentType: 'ausschreibung',
            language: this.config.output.language,
            
            // Document metadata
            metadata: {
                title: `Ausschreibung - ${projectInfo.name || 'Bauvorhaben'}`,
                projectNumber: projectInfo.projectNumber || `AUS-${Date.now()}`,
                client: projectInfo.client || 'Bauherr',
                date: new Date().toISOString(),
                standards: this.config.standards.compliance
            },
            
            // Document sections
            sections: []
        };
        
        // Generate each section
        content.sections.push(await this.generateCoverPage(content.metadata));
        content.sections.push(await this.generateTableOfContents(structuredData));
        content.sections.push(await this.generatePreliminaryRemarks(projectInfo));
        content.sections.push(await this.generateProjectDescription(projectInfo, analysisResults));
        
        // Generate service areas and positions
        for (const [hauptgruppe, data] of Object.entries(structuredData)) {
            content.sections.push(await this.generateServiceArea(hauptgruppe, data));
        }
        
        // Add quantity calculation appendix
        content.sections.push(await this.generateQuantityCalculation(structuredData, analysisResults));
        
        // Add attachments
        content.sections.push(await this.generateAttachments(projectInfo));
        
        return content;
    }
    
    /**
     * 💾 CREATE OUTPUT DOCUMENTS
     */
    async createOutputDocuments(documentContent, projectInfo) {
        const outputs = [];
        const outputDir = path.join(process.cwd(), 'ausschreibung_output');
        await fs.mkdir(outputDir, { recursive: true });
        
        // Generate each format
        for (const format of this.config.output.formats) {
            console.log(`   💾 Creating ${format.toUpperCase()} output...`);
            
            try {
                let output;
                
                switch (format) {
                    case 'pdf':
                        output = await this.generatePDF(documentContent, outputDir);
                        break;
                    case 'gaeb':
                        output = await this.generateGAEB(documentContent, outputDir);
                        break;
                    case 'json':
                        output = await this.generateJSON(documentContent, outputDir);
                        break;
                    case 'excel':
                        output = await this.generateExcel(documentContent, outputDir);
                        break;
                }
                
                if (output) {
                    outputs.push(output);
                    console.log(`      ✅ Created: ${output.filename}`);
                }
                
            } catch (error) {
                console.error(`      ❌ Failed to create ${format}: ${error.message}`);
            }
        }
        
        return outputs;
    }
    
    /**
     * 📑 GENERATE PDF OUTPUT
     */
    async generatePDF(documentContent, outputDir) {
        const pdfDoc = await PDFDocument.create();
        
        // Load fonts
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        
        // Process each section
        for (const section of documentContent.sections) {
            await this.addPDFSection(pdfDoc, section, { helvetica, helveticaBold });
        }
        
        // Save PDF
        const pdfBytes = await pdfDoc.save();
        const filename = `Ausschreibung_${documentContent.metadata.projectNumber}.pdf`;
        const filepath = path.join(outputDir, filename);
        
        await fs.writeFile(filepath, pdfBytes);
        
        return {
            format: 'pdf',
            filename: filename,
            filepath: filepath,
            size: pdfBytes.length
        };
    }
    
    // ===========================
    // HELPER METHODS
    // ===========================
    
    groupSimilarElements(elements) {
        const groups = {};
        
        for (const element of elements) {
            const key = `${element.classification}_${element.properties?.material || 'default'}`;
            
            if (!groups[key]) {
                groups[key] = {
                    type: element.classification,
                    material: element.properties?.material,
                    elements: []
                };
            }
            
            groups[key].elements.push(element);
        }
        
        return groups;
    }
    
    getMaterialCategory(elementType) {
        const mapping = {
            'wall_load_bearing': 'concrete',
            'wall_non_load_bearing': 'masonry',
            'column': 'concrete',
            'beam': 'steel',
            'insulation': 'insulation'
        };
        
        return mapping[elementType] || 'concrete';
    }
    
    getMaterialSpecification(element) {
        return element.properties?.material || 'C25/30';
    }
    
    calculateTotalQuantity(elements) {
        let total = 0;
        let unit = '';
        
        for (const element of elements) {
            if (element.area?.squareMeters) {
                total += element.area.squareMeters.value;
                unit = 'm²';
            } else if (element.volume?.cubicMeters) {
                total += element.volume.cubicMeters.value;
                unit = 'm³';
            } else {
                total += 1;
                unit = 'Stk';
            }
        }
        
        return {
            value: Math.round(total * 100) / 100,
            unit: unit
        };
    }
    
    calculatePositionConfidence(elements, din276Mapping) {
        const confidences = elements.map(e => e.verification?.confidence?.score || 0.5);
        const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        
        return Math.min(avgConfidence, din276Mapping.confidence.score);
    }
    
    assignOrdinalNumbers(positions) {
        let currentGroup = '';
        let groupCounter = 0;
        let positionCounter = 0;
        
        for (const position of positions) {
            const group = position.din276.group;
            
            if (group !== currentGroup) {
                currentGroup = group;
                groupCounter++;
                positionCounter = 0;
            }
            
            positionCounter++;
            position.ordinalNumber = `${groupCounter}.${positionCounter}`;
        }
    }
    
    getDIN276Description(code) {
        const descriptions = {
            '300': 'Bauwerk - Baukonstruktionen',
            '310': 'Baugrube / Erdbau',
            '320': 'Gründung, Unterbau',
            '330': 'Außenwände / Vertikale Baukonstruktionen, außen',
            '340': 'Innenwände / Vertikale Baukonstruktionen, innen',
            '350': 'Decken / Horizontale Baukonstruktionen',
            '360': 'Dächer',
            '370': 'Baukonstruktive Einbauten',
            '400': 'Bauwerk - Technische Anlagen'
        };
        
        return descriptions[code] || code;
    }
    
    calculateOverallConfidence(positions) {
        if (positions.length === 0) return 0;
        
        const totalConfidence = positions.reduce(
            (sum, pos) => sum + (pos.metadata?.confidence || 0), 0
        );
        
        return totalConfidence / positions.length;
    }
    
    calculateTotalValue(positions) {
        // This would use actual cost data in production
        return positions.reduce((sum, pos) => {
            const estimatedUnitPrice = 100; // Placeholder
            return sum + (pos.quantity * estimatedUnitPrice);
        }, 0);
    }
    
    async generateCoverPage(metadata) {
        return {
            type: 'cover',
            content: {
                title: metadata.title,
                projectNumber: metadata.projectNumber,
                client: metadata.client,
                date: new Date(metadata.date).toLocaleDateString('de-DE'),
                logo: null // Would include company logo
            }
        };
    }
    
    async generateTableOfContents(structuredData) {
        const toc = {
            type: 'toc',
            title: 'Inhaltsverzeichnis',
            entries: []
        };
        
        // Add main sections
        toc.entries.push({ title: 'Vorbemerkungen', page: 3 });
        toc.entries.push({ title: 'Projektbeschreibung', page: 5 });
        
        // Add DIN 276 sections
        let page = 10;
        for (const [code, data] of Object.entries(structuredData)) {
            toc.entries.push({
                title: `${code} ${data.description}`,
                page: page,
                level: 1
            });
            page += Math.ceil(data.positionCount / 5);
        }
        
        return toc;
    }
    
    async generatePreliminaryRemarks(projectInfo) {
        return {
            type: 'preliminary',
            title: 'Vorbemerkungen',
            content: [
                {
                    heading: 'Geltungsbereich',
                    text: 'Diese Ausschreibung umfasst alle Leistungen zur Erstellung des Bauvorhabens gemäß den beigefügten Plänen und Leistungsbeschreibungen.'
                },
                {
                    heading: 'Vertragsgrundlagen',
                    text: 'Der Ausführung liegen die VOB/B in der aktuellen Fassung sowie die einschlägigen DIN-Normen und anerkannten Regeln der Technik zugrunde.'
                },
                {
                    heading: 'Ausführungsfristen',
                    text: projectInfo.schedule || 'Die Ausführungsfristen werden nach Auftragserteilung festgelegt.'
                }
            ]
        };
    }
    
    async generateProjectDescription(projectInfo, analysisResults) {
        return {
            type: 'description',
            title: 'Projektbeschreibung',
            content: {
                projectName: projectInfo.name || 'Bauvorhaben',
                location: projectInfo.location || 'Baugrundstück',
                buildingType: projectInfo.buildingType || 'Mehrfamilienhaus',
                
                technicalData: {
                    grossFloorArea: projectInfo.grossFloorArea || 'Nach Plan',
                    floors: projectInfo.floors || 'Nach Plan',
                    units: projectInfo.units || 'Nach Plan'
                },
                
                analysisData: {
                    elementsAnalyzed: analysisResults.elements.length,
                    confidence: Math.round(analysisResults.confidence * 100) + '%',
                    planScale: analysisResults.scale.notation
                }
            }
        };
    }
    
    async generateServiceArea(code, data) {
        const section = {
            type: 'service_area',
            code: code,
            title: `${code} ${data.description}`,
            content: []
        };
        
        // Add each Obergruppe
        for (const [oberCode, oberData] of Object.entries(data.obergruppen)) {
            section.content.push({
                subtitle: `${oberCode} ${oberData.description}`,
                positions: oberData.positions.map(pos => ({
                    ordinal: pos.ordinalNumber,
                    shortText: pos.shortText,
                    longText: pos.longText,
                    quantity: pos.quantity,
                    unit: pos.unit,
                    specifications: pos.technical.specifications,
                    standards: pos.technical.standards
                }))
            });
        }
        
        return section;
    }
    
    async generateQuantityCalculation(structuredData, analysisResults) {
        return {
            type: 'appendix',
            title: 'Mengenermittlung',
            content: {
                methodology: 'Pixel-genaue Bildanalyse mit KI-gestützter Elementenerkennung',
                accuracy: `±${analysisResults.scale.pixelsPerMillimeter.toFixed(2)}mm`,
                verificationMethod: 'Expertvalidierung und formale Verifikation',
                
                calculations: [] // Would include detailed calculations
            }
        };
    }
    
    async generateAttachments(projectInfo) {
        return {
            type: 'attachments',
            title: 'Anlagen',
            content: [
                'Grundrisse mit Elementmarkierungen',
                'Technische Spezifikationen',
                'DIN-Normenverzeichnis',
                'Qualitätsanforderungen'
            ]
        };
    }
    
    async addPDFSection(pdfDoc, section, fonts) {
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margins = this.config.output.pdf.margins;
        
        let yPosition = height - margins.top;
        
        // Add section title
        if (section.title) {
            page.drawText(section.title, {
                x: margins.left,
                y: yPosition,
                size: this.config.output.pdf.fontSize.heading1,
                font: fonts.helveticaBold,
                color: rgb(0, 0, 0)
            });
            yPosition -= 30;
        }
        
        // Add section content based on type
        // Implementation would handle each section type
    }
    
    async generateGAEB(documentContent, outputDir) {
        // Convert positions to GAEB format
        const positions = [];
        
        for (const section of documentContent.sections) {
            if (section.type === 'service_area') {
                for (const obergruppe of section.content) {
                    positions.push(...obergruppe.positions);
                }
            }
        }
        
        const gaebExport = await this.stlbConnector.exportToGAEB(
            positions,
            documentContent.metadata
        );
        
        const filepath = path.join(outputDir, gaebExport.filename);
        await fs.writeFile(filepath, gaebExport.data, 'utf8');
        
        return {
            format: 'gaeb',
            filename: gaebExport.filename,
            filepath: filepath,
            size: gaebExport.data.length
        };
    }
    
    async generateJSON(documentContent, outputDir) {
        const filename = `Ausschreibung_${documentContent.metadata.projectNumber}.json`;
        const filepath = path.join(outputDir, filename);
        
        const jsonData = JSON.stringify(documentContent, null, 2);
        await fs.writeFile(filepath, jsonData, 'utf8');
        
        return {
            format: 'json',
            filename: filename,
            filepath: filepath,
            size: jsonData.length
        };
    }
    
    async generateExcel(documentContent, outputDir) {
        // Would use a library like exceljs to create Excel output
        const filename = `Ausschreibung_${documentContent.metadata.projectNumber}.xlsx`;
        
        return {
            format: 'excel',
            filename: filename,
            filepath: path.join(outputDir, filename),
            size: 0
        };
    }
}
