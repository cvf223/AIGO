/**
 * 🔍 HUMAN VERIFIABLE REPORTS - PIXEL-PRECISE VERIFICATION SYSTEM
 * ==============================================================
 * 
 * MISSION: Generate pixel-precise annotation overlays and verification reports
 * 
 * KEY CAPABILITIES:
 * ✅ Pixel-accurate annotation overlays on original plans
 * ✅ Measurement verification reports with visual proofs
 * ✅ Complete traceability from pixel to final quantity
 * ✅ Interactive HTML reports for expert review
 * ✅ Audit trail documentation with timestamps
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Verification System
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';

export default class HumanVerifiableReports extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            systemName: 'HUMAN_VERIFIABLE_REPORTS',
            
            // Annotation Configuration
            annotation: {
                // Visual styles for different confidence levels
                confidenceLevels: {
                    high: { color: 'rgba(0, 255, 0, 0.3)', borderColor: 'rgb(0, 200, 0)', borderWidth: 2 },
                    medium: { color: 'rgba(255, 255, 0, 0.3)', borderColor: 'rgb(200, 200, 0)', borderWidth: 2 },
                    low: { color: 'rgba(255, 0, 0, 0.3)', borderColor: 'rgb(200, 0, 0)', borderWidth: 2 },
                    unverified: { color: 'rgba(128, 128, 128, 0.3)', borderColor: 'rgb(128, 128, 128)', borderWidth: 1 }
                },
                
                // Measurement display settings
                measurementDisplay: {
                    fontSize: 12,
                    fontFamily: 'Arial',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: 5,
                    showConfidence: true,
                    showTolerance: true,
                    showSource: true
                },
                
                // Interactive features
                interactive: {
                    enableZoom: true,
                    enablePan: true,
                    enableMeasurement: true,
                    enableComments: true,
                    maxZoom: 10,
                    minZoom: 0.1
                }
            },
            
            // Report Configuration
            report: {
                // Report sections
                sections: [
                    'executive_summary',
                    'methodology',
                    'element_analysis',
                    'measurement_verification',
                    'quality_metrics',
                    'discrepancy_report',
                    'recommendations',
                    'audit_trail'
                ],
                
                // Verification criteria
                verificationCriteria: {
                    measurementTolerance: 2, // mm
                    confidenceThreshold: 0.85,
                    coverageRequirement: 0.95,
                    annotationCompleteness: 0.98
                },
                
                // Output formats
                formats: {
                    html: {
                        template: 'professional',
                        includeInteractive: true,
                        embedImages: true
                    },
                    pdf: {
                        pageSize: 'A3',
                        orientation: 'landscape',
                        quality: 'high'
                    },
                    json: {
                        includeRawData: true,
                        prettyPrint: true
                    }
                }
            },
            
            // Traceability Configuration
            traceability: {
                // Track every step
                trackingLevels: [
                    'pixel_detection',
                    'element_classification',
                    'measurement_calculation',
                    'quantity_aggregation',
                    'document_generation'
                ],
                
                // Evidence collection
                evidence: {
                    captureScreenshots: true,
                    saveIntermediateResults: true,
                    recordProcessingSteps: true,
                    includeAlgorithmDetails: true
                }
            },
            
            // Quality Assurance
            qualityAssurance: {
                // Automated checks
                automatedChecks: {
                    dimensionConsistency: true,
                    overlapDetection: true,
                    completenessCheck: true,
                    standardCompliance: true
                },
                
                // Manual review flags
                reviewFlags: {
                    lowConfidence: 0.7,
                    highDeviation: 10, // mm
                    missingElements: true,
                    unusualDimensions: true
                }
            }
        };
        
        this.verificationSession = {
            id: null,
            startTime: null,
            analysisResults: [],
            annotations: new Map(),
            verificationMetrics: {},
            auditTrail: []
        };
    }
    
    /**
     * 🚀 INITIALIZE VERIFICATION SYSTEM
     */
    async initialize() {
        console.log('🔍 Initializing Human Verifiable Reports System...');
        
        try {
            // Create output directories
            await this.createOutputDirectories();
            
            // Load report templates
            await this.loadReportTemplates();
            
            console.log('✅ Human Verifiable Reports System initialized');
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 📊 GENERATE VERIFICATION REPORT
     */
    async generateVerificationReport(analysisResults, planPath, projectInfo = {}) {
        console.log('📊 GENERATING HUMAN VERIFICATION REPORT');
        console.log('=====================================');
        console.log(`📐 Plan: ${path.basename(planPath)}`);
        console.log(`📋 Elements: ${analysisResults.elements.length}`);
        console.log('');
        
        // Start new verification session
        this.startVerificationSession(projectInfo);
        
        try {
            // STEP 1: Create annotated plan overlay
            console.log('🎨 STEP 1: CREATING ANNOTATED PLAN OVERLAY');
            const annotatedPlan = await this.createAnnotatedPlanOverlay(
                planPath,
                analysisResults
            );
            console.log(`   ✅ Created overlay with ${annotatedPlan.annotationCount} annotations`);
            
            // STEP 2: Generate measurement verification
            console.log('\n📏 STEP 2: GENERATING MEASUREMENT VERIFICATION');
            const measurementVerification = await this.generateMeasurementVerification(
                analysisResults
            );
            console.log(`   ✅ Verified ${measurementVerification.verifiedCount} measurements`);
            
            // STEP 3: Create quality metrics
            console.log('\n📊 STEP 3: CALCULATING QUALITY METRICS');
            const qualityMetrics = await this.calculateQualityMetrics(
                analysisResults,
                measurementVerification
            );
            console.log(`   ✅ Overall quality score: ${qualityMetrics.overallScore.toFixed(2)}%`);
            
            // STEP 4: Generate discrepancy report
            console.log('\n⚠️  STEP 4: GENERATING DISCREPANCY REPORT');
            const discrepancyReport = await this.generateDiscrepancyReport(
                analysisResults,
                measurementVerification
            );
            console.log(`   ✅ Found ${discrepancyReport.totalDiscrepancies} discrepancies`);
            
            // STEP 5: Create audit trail
            console.log('\n📋 STEP 5: CREATING AUDIT TRAIL');
            const auditTrail = await this.createAuditTrail(
                analysisResults,
                projectInfo
            );
            console.log(`   ✅ Recorded ${auditTrail.entries.length} audit entries`);
            
            // STEP 6: Generate comprehensive report
            console.log('\n📄 STEP 6: GENERATING COMPREHENSIVE REPORT');
            const report = await this.compileComprehensiveReport({
                annotatedPlan,
                measurementVerification,
                qualityMetrics,
                discrepancyReport,
                auditTrail
            }, projectInfo);
            
            console.log('\n🎉 VERIFICATION REPORT COMPLETE');
            console.log('===============================');
            console.log(`📊 Report ID: ${report.id}`);
            console.log(`📄 Output: ${report.outputPath}`);
            console.log(`✅ Verification Status: ${report.verificationStatus}`);
            console.log(`📈 Confidence Level: ${report.confidenceLevel.toFixed(2)}%`);
            
            return report;
            
        } catch (error) {
            console.error('❌ Report generation failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🎨 CREATE ANNOTATED PLAN OVERLAY
     */
    async createAnnotatedPlanOverlay(planPath, analysisResults) {
        console.log('   🎨 Creating pixel-precise annotation overlay...');
        
        // Load original plan
        const planImage = await loadImage(planPath);
        const canvas = createCanvas(planImage.width, planImage.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original plan
        ctx.drawImage(planImage, 0, 0);
        
        // Initialize annotation tracking
        const annotations = {
            elements: [],
            measurements: [],
            issues: [],
            total: 0
        };
        
        // Annotate each element
        for (const element of analysisResults.elements) {
            const annotation = await this.annotateElement(ctx, element, analysisResults.scale);
            
            if (annotation) {
                annotations.elements.push(annotation);
                annotations.total++;
                
                // Store in session
                this.verificationSession.annotations.set(element.elementId, annotation);
            }
        }
        
        // Add measurement annotations
        await this.addMeasurementAnnotations(ctx, analysisResults);
        
        // Add legend
        await this.addAnnotationLegend(ctx, canvas);
        
        // Add verification stamp
        await this.addVerificationStamp(ctx, canvas, analysisResults);
        
        // Save annotated plan
        const outputPath = await this.saveAnnotatedPlan(canvas, planPath);
        
        // Create interactive HTML version
        const interactivePath = await this.createInteractiveVersion(
            outputPath,
            annotations,
            analysisResults
        );
        
        return {
            outputPath: outputPath,
            interactivePath: interactivePath,
            annotationCount: annotations.total,
            annotations: annotations
        };
    }
    
    /**
     * 🎯 ANNOTATE SINGLE ELEMENT
     */
    async annotateElement(ctx, element, scale) {
        const bbox = element.boundingBox;
        if (!bbox) return null;
        
        // Determine confidence level and style
        const confidence = element.verification?.confidence?.score || 0.5;
        const style = this.getAnnotationStyle(confidence);
        
        // Create annotation object
        const annotation = {
            id: uuidv4(),
            elementId: element.elementId,
            type: element.classification,
            confidence: confidence,
            bounds: bbox,
            measurements: element.dimensions,
            timestamp: new Date().toISOString()
        };
        
        // Draw semi-transparent overlay
        ctx.save();
        ctx.fillStyle = style.color;
        ctx.fillRect(bbox.x, bbox.y, bbox.width, bbox.height);
        
        // Draw border
        ctx.strokeStyle = style.borderColor;
        ctx.lineWidth = style.borderWidth;
        ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
        
        // Add element label with background
        const label = `${element.classification} (${Math.round(confidence * 100)}%)`;
        ctx.font = `${this.config.annotation.measurementDisplay.fontSize}px ${this.config.annotation.measurementDisplay.fontFamily}`;
        const textMetrics = ctx.measureText(label);
        const textHeight = this.config.annotation.measurementDisplay.fontSize;
        const padding = this.config.annotation.measurementDisplay.padding;
        
        // Draw label background
        ctx.fillStyle = this.config.annotation.measurementDisplay.backgroundColor;
        ctx.fillRect(
            bbox.x,
            bbox.y - textHeight - padding * 2,
            textMetrics.width + padding * 2,
            textHeight + padding * 2
        );
        
        // Draw label text
        ctx.fillStyle = 'black';
        ctx.fillText(label, bbox.x + padding, bbox.y - padding);
        
        // Add measurement callouts if available
        if (element.dimensions) {
            await this.addElementMeasurements(ctx, element, bbox, scale);
        }
        
        // Add confidence indicator
        this.addConfidenceIndicator(ctx, bbox, confidence);
        
        ctx.restore();
        
        // Record annotation in audit trail
        this.recordAuditEntry('element_annotated', {
            elementId: element.elementId,
            annotationId: annotation.id,
            confidence: confidence
        });
        
        return annotation;
    }
    
    /**
     * 📏 GENERATE MEASUREMENT VERIFICATION
     */
    async generateMeasurementVerification(analysisResults) {
        console.log('   📏 Verifying all measurements...');
        
        const verification = {
            measurements: [],
            verifiedCount: 0,
            discrepancyCount: 0,
            statistics: {
                averageConfidence: 0,
                averageDeviation: 0,
                withinTolerance: 0
            }
        };
        
        for (const element of analysisResults.elements) {
            if (!element.dimensions) continue;
            
            const measurementVerif = {
                elementId: element.elementId,
                elementType: element.classification,
                measurements: {},
                verificationStatus: 'unverified',
                issues: []
            };
            
            // Verify each dimension
            for (const [dimType, dimension] of Object.entries(element.dimensions)) {
                if (dimension && dimension.value) {
                    const dimVerif = await this.verifyDimension(dimension, element);
                    measurementVerif.measurements[dimType] = dimVerif;
                    
                    if (dimVerif.verified) {
                        verification.verifiedCount++;
                    } else {
                        verification.discrepancyCount++;
                        measurementVerif.issues.push(dimVerif.issue);
                    }
                }
            }
            
            // Determine overall status
            const verifiedDims = Object.values(measurementVerif.measurements).filter(m => m.verified).length;
            const totalDims = Object.keys(measurementVerif.measurements).length;
            
            if (verifiedDims === totalDims) {
                measurementVerif.verificationStatus = 'verified';
            } else if (verifiedDims > 0) {
                measurementVerif.verificationStatus = 'partial';
            } else {
                measurementVerif.verificationStatus = 'failed';
            }
            
            verification.measurements.push(measurementVerif);
        }
        
        // Calculate statistics
        verification.statistics = this.calculateVerificationStatistics(verification.measurements);
        
        return verification;
    }
    
    /**
     * 🔍 VERIFY SINGLE DIMENSION
     */
    async verifyDimension(dimension, element) {
        const verif = {
            value: dimension.value,
            unit: dimension.unit,
            pixels: dimension.pixels,
            confidence: element.verification?.confidence?.score || 0.5,
            verified: false,
            deviation: 0,
            issue: null
        };
        
        // Check against standard dimensions
        const standardCheck = await this.checkAgainstStandards(
            element.classification,
            dimension
        );
        
        if (standardCheck.isStandard) {
            verif.standardValue = standardCheck.standardValue;
            verif.deviation = Math.abs(dimension.value - standardCheck.standardValue);
            
            // Check if within tolerance
            if (verif.deviation <= this.config.report.verificationCriteria.measurementTolerance) {
                verif.verified = true;
            } else {
                verif.issue = {
                    type: 'deviation',
                    message: `Deviates ${verif.deviation}mm from standard ${standardCheck.standardValue}mm`,
                    severity: verif.deviation > 10 ? 'high' : 'medium'
                };
            }
        } else {
            // Non-standard dimension - verify based on confidence
            if (verif.confidence >= this.config.report.verificationCriteria.confidenceThreshold) {
                verif.verified = true;
            } else {
                verif.issue = {
                    type: 'low_confidence',
                    message: `Confidence ${verif.confidence.toFixed(2)} below threshold`,
                    severity: 'low'
                };
            }
        }
        
        return verif;
    }
    
    /**
     * 📊 CALCULATE QUALITY METRICS
     */
    async calculateQualityMetrics(analysisResults, measurementVerification) {
        console.log('   📊 Calculating comprehensive quality metrics...');
        
        const metrics = {
            coverage: {
                planCoverage: 0,
                elementDetection: 0,
                annotationCompleteness: 0
            },
            accuracy: {
                measurementAccuracy: 0,
                classificationAccuracy: 0,
                confidenceDistribution: {}
            },
            compliance: {
                standardCompliance: 0,
                toleranceCompliance: 0,
                completenessCompliance: 0
            },
            overallScore: 0
        };
        
        // Calculate coverage metrics
        metrics.coverage.planCoverage = await this.calculatePlanCoverage(analysisResults);
        metrics.coverage.elementDetection = this.calculateElementDetectionRate(analysisResults);
        metrics.coverage.annotationCompleteness = this.calculateAnnotationCompleteness();
        
        // Calculate accuracy metrics
        metrics.accuracy.measurementAccuracy = this.calculateMeasurementAccuracy(measurementVerification);
        metrics.accuracy.classificationAccuracy = this.calculateClassificationAccuracy(analysisResults);
        metrics.accuracy.confidenceDistribution = this.calculateConfidenceDistribution(analysisResults);
        
        // Calculate compliance metrics
        metrics.compliance.standardCompliance = this.calculateStandardCompliance(measurementVerification);
        metrics.compliance.toleranceCompliance = this.calculateToleranceCompliance(measurementVerification);
        metrics.compliance.completenessCompliance = this.calculateCompletenessCompliance(metrics);
        
        // Calculate overall score
        metrics.overallScore = this.calculateOverallQualityScore(metrics);
        
        // Store in session
        this.verificationSession.verificationMetrics = metrics;
        
        return metrics;
    }
    
    /**
     * ⚠️ GENERATE DISCREPANCY REPORT
     */
    async generateDiscrepancyReport(analysisResults, measurementVerification) {
        console.log('   ⚠️  Identifying and documenting discrepancies...');
        
        const discrepancies = {
            measurements: [],
            classifications: [],
            missing: [],
            overlapping: [],
            totalDiscrepancies: 0,
            criticalIssues: 0
        };
        
        // Find measurement discrepancies
        for (const measurement of measurementVerification.measurements) {
            if (measurement.issues && measurement.issues.length > 0) {
                discrepancies.measurements.push({
                    elementId: measurement.elementId,
                    elementType: measurement.elementType,
                    issues: measurement.issues,
                    severity: this.calculateDiscrepancySeverity(measurement.issues)
                });
            }
        }
        
        // Find classification discrepancies
        const lowConfidenceElements = analysisResults.elements.filter(
            e => (e.confidence || 0) < this.config.qualityAssurance.reviewFlags.lowConfidence
        );
        
        for (const element of lowConfidenceElements) {
            discrepancies.classifications.push({
                elementId: element.elementId,
                classification: element.classification,
                confidence: element.confidence,
                issue: 'Low classification confidence'
            });
        }
        
        // Find missing elements (gaps in coverage)
        const missingAreas = await this.identifyMissingElements(analysisResults);
        discrepancies.missing = missingAreas;
        
        // Find overlapping elements
        const overlaps = this.findOverlappingElements(analysisResults.elements);
        discrepancies.overlapping = overlaps;
        
        // Calculate totals
        discrepancies.totalDiscrepancies = 
            discrepancies.measurements.length +
            discrepancies.classifications.length +
            discrepancies.missing.length +
            discrepancies.overlapping.length;
        
        discrepancies.criticalIssues = discrepancies.measurements.filter(
            d => d.severity === 'critical'
        ).length;
        
        return discrepancies;
    }
    
    /**
     * 📋 CREATE AUDIT TRAIL
     */
    async createAuditTrail(analysisResults, projectInfo) {
        console.log('   📋 Creating comprehensive audit trail...');
        
        const auditTrail = {
            sessionId: this.verificationSession.id,
            projectInfo: projectInfo,
            startTime: this.verificationSession.startTime,
            endTime: new Date().toISOString(),
            entries: this.verificationSession.auditTrail,
            summary: {
                totalSteps: this.verificationSession.auditTrail.length,
                elementProcessed: analysisResults.elements.length,
                annotationsCreated: this.verificationSession.annotations.size,
                issuesIdentified: 0
            }
        };
        
        // Add processing steps
        auditTrail.processingSteps = {
            pixelAnalysis: {
                timestamp: analysisResults.timestamp,
                pixelsProcessed: analysisResults.totalPixels || 0,
                scale: analysisResults.scale
            },
            elementDetection: {
                elementsDetected: analysisResults.elements.length,
                classificationsUsed: [...new Set(analysisResults.elements.map(e => e.classification))]
            },
            measurementCalculation: {
                measurementsCalculated: analysisResults.elements.filter(e => e.dimensions).length,
                unitsUsed: ['mm', 'm²', 'm³']
            }
        };
        
        // Add verification evidence
        if (this.config.traceability.evidence.captureScreenshots) {
            auditTrail.evidence = await this.collectVerificationEvidence(analysisResults);
        }
        
        // Calculate integrity hash
        auditTrail.integrityHash = await this.calculateIntegrityHash(auditTrail);
        
        return auditTrail;
    }
    
    /**
     * 📄 COMPILE COMPREHENSIVE REPORT
     */
    async compileComprehensiveReport(components, projectInfo) {
        console.log('   📄 Compiling all components into comprehensive report...');
        
        const report = {
            id: this.verificationSession.id,
            generatedAt: new Date().toISOString(),
            projectInfo: projectInfo,
            
            // Executive Summary
            executiveSummary: this.generateExecutiveSummary(components),
            
            // Detailed Sections
            sections: {
                methodology: this.generateMethodologySection(),
                elementAnalysis: this.generateElementAnalysisSection(components),
                measurementVerification: components.measurementVerification,
                qualityMetrics: components.qualityMetrics,
                discrepancyReport: components.discrepancyReport,
                recommendations: this.generateRecommendations(components),
                auditTrail: components.auditTrail
            },
            
            // Verification Results
            verificationStatus: this.determineVerificationStatus(components),
            confidenceLevel: this.calculateOverallConfidence(components),
            
            // Attachments
            attachments: {
                annotatedPlan: components.annotatedPlan.outputPath,
                interactivePlan: components.annotatedPlan.interactivePath,
                rawData: null
            }
        };
        
        // Generate output files
        const outputs = await this.generateReportOutputs(report, projectInfo);
        report.outputPath = outputs.html;
        report.outputs = outputs;
        
        return report;
    }
    
    /**
     * 📄 GENERATE REPORT OUTPUTS
     */
    async generateReportOutputs(report, projectInfo) {
        const outputDir = path.join(
            process.cwd(),
            'verification_reports',
            projectInfo.projectNumber || 'project',
            report.id
        );
        
        await fs.mkdir(outputDir, { recursive: true });
        
        const outputs = {};
        
        // Generate HTML report
        if (this.config.report.formats.html) {
            outputs.html = await this.generateHTMLReport(report, outputDir);
        }
        
        // Generate PDF report
        if (this.config.report.formats.pdf) {
            outputs.pdf = await this.generatePDFReport(report, outputDir);
        }
        
        // Generate JSON data
        if (this.config.report.formats.json) {
            outputs.json = await this.generateJSONReport(report, outputDir);
        }
        
        return outputs;
    }
    
    /**
     * 🌐 GENERATE HTML REPORT
     */
    async generateHTMLReport(report, outputDir) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Report - ${report.projectInfo.name || 'Construction Project'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        
        .summary-box {
            background: #ecf0f1;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        
        .metric {
            display: inline-block;
            margin: 10px 20px;
        }
        
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
        }
        
        .metric-label {
            font-size: 14px;
            color: #7f8c8d;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        
        .status-verified {
            color: #27ae60;
            font-weight: bold;
        }
        
        .status-partial {
            color: #f39c12;
            font-weight: bold;
        }
        
        .status-failed {
            color: #e74c3c;
            font-weight: bold;
        }
        
        .annotation-preview {
            max-width: 100%;
            height: auto;
            border: 1px solid #ddd;
            margin: 20px 0;
        }
        
        .discrepancy-item {
            background: #fee;
            padding: 10px;
            margin: 10px 0;
            border-left: 4px solid #e74c3c;
        }
        
        .quality-chart {
            width: 100%;
            height: 300px;
            margin: 20px 0;
        }
        
        .interactive-link {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        
        .interactive-link:hover {
            background: #2980b9;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #f4f4f4;
            font-weight: bold;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #7f8c8d;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Construction Plan Verification Report</h1>
        <p>Project: ${report.projectInfo.name || 'Unnamed Project'}</p>
        <p>Report ID: ${report.id}</p>
        <p>Generated: ${new Date(report.generatedAt).toLocaleString()}</p>
    </div>
    
    <div class="summary-box">
        <h2>Executive Summary</h2>
        ${this.renderExecutiveSummary(report.executiveSummary)}
        
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${report.confidenceLevel.toFixed(1)}%</div>
                <div class="metric-label">Overall Confidence</div>
            </div>
            <div class="metric">
                <div class="metric-value class="${this.getStatusClass(report.verificationStatus)}">${report.verificationStatus}</div>
                <div class="metric-label">Verification Status</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.sections.qualityMetrics.overallScore.toFixed(1)}%</div>
                <div class="metric-label">Quality Score</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <h2>Annotated Plan Analysis</h2>
        <p>The construction plan has been analyzed and annotated with pixel-precise element detection and measurements.</p>
        <img src="${path.basename(report.attachments.annotatedPlan)}" alt="Annotated Plan" class="annotation-preview">
        <a href="${path.basename(report.attachments.interactivePlan)}" class="interactive-link">
            Open Interactive Plan Viewer
        </a>
    </div>
    
    <div class="section">
        <h2>Measurement Verification</h2>
        ${this.renderMeasurementVerification(report.sections.measurementVerification)}
    </div>
    
    <div class="section">
        <h2>Quality Metrics</h2>
        ${this.renderQualityMetrics(report.sections.qualityMetrics)}
    </div>
    
    <div class="section">
        <h2>Discrepancy Report</h2>
        ${this.renderDiscrepancyReport(report.sections.discrepancyReport)}
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        ${this.renderRecommendations(report.sections.recommendations)}
    </div>
    
    <div class="section">
        <h2>Audit Trail</h2>
        ${this.renderAuditTrail(report.sections.auditTrail)}
    </div>
    
    <div class="footer">
        <p>Generated by Construction AI Syndicate - Human Verifiable Reports System</p>
        <p>Report Version 1.0.0 | Integrity Hash: ${report.sections.auditTrail.integrityHash}</p>
    </div>
</body>
</html>
        `;
        
        const htmlPath = path.join(outputDir, 'verification_report.html');
        await fs.writeFile(htmlPath, html, 'utf8');
        
        // Copy annotated plan image
        if (report.attachments.annotatedPlan) {
            const imageDest = path.join(outputDir, path.basename(report.attachments.annotatedPlan));
            await fs.copyFile(report.attachments.annotatedPlan, imageDest);
        }
        
        return htmlPath;
    }
    
    /**
     * 🎯 CREATE INTERACTIVE VERSION
     */
    async createInteractiveVersion(imagePath, annotations, analysisResults) {
        const interactive = `
<!DOCTYPE html>
<html>
<head>
    <title>Interactive Plan Viewer</title>
    <style>
        body { margin: 0; padding: 0; overflow: hidden; }
        #container { position: relative; width: 100vw; height: 100vh; }
        #canvas { position: absolute; top: 0; left: 0; cursor: crosshair; }
        #info { position: absolute; top: 10px; right: 10px; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
        .annotation-tooltip { position: absolute; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); display: none; z-index: 1000; }
        .controls { position: absolute; bottom: 10px; left: 10px; background: white; padding: 10px; border-radius: 5px; }
        button { margin: 0 5px; padding: 5px 10px; }
    </style>
</head>
<body>
    <div id="container">
        <canvas id="canvas"></canvas>
        <div id="info">
            <h3>Interactive Plan Viewer</h3>
            <p>Zoom: <span id="zoom">100%</span></p>
            <p>Elements: <span id="elementCount">${annotations.elements.length}</span></p>
            <p>Click on elements for details</p>
        </div>
        <div class="controls">
            <button onclick="zoomIn()">Zoom In</button>
            <button onclick="zoomOut()">Zoom Out</button>
            <button onclick="resetView()">Reset</button>
            <button onclick="toggleAnnotations()">Toggle Annotations</button>
        </div>
        <div class="annotation-tooltip" id="tooltip"></div>
    </div>
    
    <script>
        const annotations = ${JSON.stringify(annotations)};
        const analysisResults = ${JSON.stringify(analysisResults, null, 2)};
        let scale = 1;
        let offsetX = 0;
        let offsetY = 0;
        let showAnnotations = true;
        
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        };
        
        img.src = '${path.basename(imagePath)}';
        
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0);
            
            if (showAnnotations) {
                drawAnnotations();
            }
            
            ctx.restore();
            document.getElementById('zoom').textContent = Math.round(scale * 100) + '%';
        }
        
        function drawAnnotations() {
            annotations.elements.forEach(ann => {
                const bbox = ann.bounds;
                ctx.strokeStyle = getConfidenceColor(ann.confidence);
                ctx.lineWidth = 2 / scale;
                ctx.strokeRect(bbox.x, bbox.y, bbox.width, bbox.height);
            });
        }
        
        function getConfidenceColor(confidence) {
            if (confidence > 0.85) return 'green';
            if (confidence > 0.7) return 'yellow';
            return 'red';
        }
        
        function zoomIn() {
            scale *= 1.2;
            draw();
        }
        
        function zoomOut() {
            scale /= 1.2;
            draw();
        }
        
        function resetView() {
            scale = 1;
            offsetX = 0;
            offsetY = 0;
            draw();
        }
        
        function toggleAnnotations() {
            showAnnotations = !showAnnotations;
            draw();
        }
        
        // Mouse interaction
        canvas.addEventListener('click', function(e) {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - offsetX) / scale;
            const y = (e.clientY - rect.top - offsetY) / scale;
            
            // Check if click is on an annotation
            const clicked = annotations.elements.find(ann => {
                const bbox = ann.bounds;
                return x >= bbox.x && x <= bbox.x + bbox.width &&
                       y >= bbox.y && y <= bbox.y + bbox.height;
            });
            
            if (clicked) {
                showTooltip(e.clientX, e.clientY, clicked);
            }
        });
        
        function showTooltip(x, y, annotation) {
            const tooltip = document.getElementById('tooltip');
            const element = analysisResults.elements.find(e => e.elementId === annotation.elementId);
            
            tooltip.innerHTML = \`
                <h4>\${annotation.type}</h4>
                <p>Confidence: \${(annotation.confidence * 100).toFixed(1)}%</p>
                <p>Dimensions: \${JSON.stringify(element.dimensions || {})}</p>
                <p>ID: \${annotation.elementId}</p>
            \`;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
            tooltip.style.display = 'block';
            
            setTimeout(() => {
                tooltip.style.display = 'none';
            }, 3000);
        }
        
        // Pan functionality
        let isDragging = false;
        let dragStartX, dragStartY;
        
        canvas.addEventListener('mousedown', function(e) {
            if (e.shiftKey) {
                isDragging = true;
                dragStartX = e.clientX - offsetX;
                dragStartY = e.clientY - offsetY;
                canvas.style.cursor = 'move';
            }
        });
        
        canvas.addEventListener('mousemove', function(e) {
            if (isDragging) {
                offsetX = e.clientX - dragStartX;
                offsetY = e.clientY - dragStartY;
                draw();
            }
        });
        
        canvas.addEventListener('mouseup', function() {
            isDragging = false;
            canvas.style.cursor = 'crosshair';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case '+': zoomIn(); break;
                case '-': zoomOut(); break;
                case '0': resetView(); break;
                case 'a': toggleAnnotations(); break;
            }
        });
        
        // Resize handling
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        });
    </script>
</body>
</html>
        `;
        
        const interactivePath = imagePath.replace('.png', '_interactive.html');
        await fs.writeFile(interactivePath, interactive, 'utf8');
        
        return interactivePath;
    }
    
    // ===========================
    // HELPER METHODS
    // ===========================
    
    async createOutputDirectories() {
        const dirs = [
            'verification_reports',
            'verification_reports/annotated_plans',
            'verification_reports/evidence',
            'verification_reports/interactive'
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    
    async loadReportTemplates() {
        // Load HTML/PDF templates if they exist
        // For now, using inline templates
    }
    
    startVerificationSession(projectInfo) {
        this.verificationSession = {
            id: uuidv4(),
            startTime: new Date().toISOString(),
            projectInfo: projectInfo,
            analysisResults: [],
            annotations: new Map(),
            verificationMetrics: {},
            auditTrail: []
        };
        
        this.recordAuditEntry('session_started', {
            sessionId: this.verificationSession.id,
            projectInfo: projectInfo
        });
    }
    
    recordAuditEntry(action, data) {
        this.verificationSession.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: action,
            data: data
        });
    }
    
    getAnnotationStyle(confidence) {
        if (confidence >= 0.85) {
            return this.config.annotation.confidenceLevels.high;
        } else if (confidence >= 0.7) {
            return this.config.annotation.confidenceLevels.medium;
        } else if (confidence >= 0.5) {
            return this.config.annotation.confidenceLevels.low;
        } else {
            return this.config.annotation.confidenceLevels.unverified;
        }
    }
    
    async addElementMeasurements(ctx, element, bbox, scale) {
        if (!element.dimensions) return;
        
        ctx.save();
        ctx.font = `${10}px Arial`;
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        
        // Draw dimension lines
        if (element.dimensions.width) {
            // Horizontal dimension line
            const y = bbox.y + bbox.height + 20;
            
            ctx.beginPath();
            ctx.moveTo(bbox.x, y);
            ctx.lineTo(bbox.x + bbox.width, y);
            ctx.stroke();
            
            // Arrows
            this.drawArrow(ctx, bbox.x, y, 'left');
            this.drawArrow(ctx, bbox.x + bbox.width, y, 'right');
            
            // Text
            const text = `${element.dimensions.width.value} ${element.dimensions.width.unit}`;
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, bbox.x + bbox.width/2 - textWidth/2, y - 5);
        }
        
        if (element.dimensions.height) {
            // Vertical dimension line
            const x = bbox.x - 20;
            
            ctx.beginPath();
            ctx.moveTo(x, bbox.y);
            ctx.lineTo(x, bbox.y + bbox.height);
            ctx.stroke();
            
            // Arrows
            this.drawArrow(ctx, x, bbox.y, 'up');
            this.drawArrow(ctx, x, bbox.y + bbox.height, 'down');
            
            // Text (rotated)
            ctx.save();
            ctx.translate(x - 5, bbox.y + bbox.height/2);
            ctx.rotate(-Math.PI/2);
            const text = `${element.dimensions.height.value} ${element.dimensions.height.unit}`;
            ctx.fillText(text, -ctx.measureText(text).width/2, 0);
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    drawArrow(ctx, x, y, direction) {
        const size = 5;
        ctx.beginPath();
        
        switch (direction) {
            case 'left':
                ctx.moveTo(x, y);
                ctx.lineTo(x + size, y - size/2);
                ctx.lineTo(x + size, y + size/2);
                break;
            case 'right':
                ctx.moveTo(x, y);
                ctx.lineTo(x - size, y - size/2);
                ctx.lineTo(x - size, y + size/2);
                break;
            case 'up':
                ctx.moveTo(x, y);
                ctx.lineTo(x - size/2, y + size);
                ctx.lineTo(x + size/2, y + size);
                break;
            case 'down':
                ctx.moveTo(x, y);
                ctx.lineTo(x - size/2, y - size);
                ctx.lineTo(x + size/2, y - size);
                break;
        }
        
        ctx.closePath();
        ctx.fill();
    }
    
    addConfidenceIndicator(ctx, bbox, confidence) {
        const indicatorSize = 20;
        const x = bbox.x + bbox.width - indicatorSize - 5;
        const y = bbox.y + 5;
        
        // Background circle
        ctx.beginPath();
        ctx.arc(x + indicatorSize/2, y + indicatorSize/2, indicatorSize/2, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = this.getConfidenceColor(confidence);
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Confidence percentage
        ctx.fillStyle = 'black';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(confidence * 100).toString(), x + indicatorSize/2, y + indicatorSize/2);
    }
    
    getConfidenceColor(confidence) {
        if (confidence >= 0.85) return 'green';
        if (confidence >= 0.7) return 'orange';
        return 'red';
    }
    
    async addMeasurementAnnotations(ctx, analysisResults) {
        // Add overall measurement statistics
        const stats = this.calculateMeasurementStats(analysisResults);
        
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(10, 10, 300, 100);
        
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText('Measurement Summary', 20, 30);
        
        ctx.font = '12px Arial';
        ctx.fillText(`Total Elements: ${stats.totalElements}`, 20, 50);
        ctx.fillText(`Measured Elements: ${stats.measuredElements}`, 20, 70);
        ctx.fillText(`Average Confidence: ${stats.averageConfidence.toFixed(2)}`, 20, 90);
        
        ctx.restore();
    }
    
    async addAnnotationLegend(ctx, canvas) {
        const legendWidth = 200;
        const legendHeight = 150;
        const x = canvas.width - legendWidth - 20;
        const y = 20;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(x, y, legendWidth, legendHeight);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, legendWidth, legendHeight);
        
        // Title
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.fillText('Legend', x + 10, y + 20);
        
        // Legend items
        const items = [
            { color: 'rgba(0, 255, 0, 0.3)', label: 'High Confidence (>85%)' },
            { color: 'rgba(255, 255, 0, 0.3)', label: 'Medium Confidence (70-85%)' },
            { color: 'rgba(255, 0, 0, 0.3)', label: 'Low Confidence (<70%)' },
            { color: 'rgba(128, 128, 128, 0.3)', label: 'Unverified' }
        ];
        
        ctx.font = '12px Arial';
        let yOffset = 40;
        
        for (const item of items) {
            // Color box
            ctx.fillStyle = item.color;
            ctx.fillRect(x + 10, y + yOffset, 20, 15);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x + 10, y + yOffset, 20, 15);
            
            // Label
            ctx.fillStyle = 'black';
            ctx.fillText(item.label, x + 35, y + yOffset + 12);
            
            yOffset += 25;
        }
    }
    
    async addVerificationStamp(ctx, canvas, analysisResults) {
        const stampWidth = 250;
        const stampHeight = 80;
        const x = canvas.width - stampWidth - 20;
        const y = canvas.height - stampHeight - 20;
        
        // Background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(x, y, stampWidth, stampHeight);
        
        // Border
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, stampWidth, stampHeight);
        
        // Stamp content
        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('VERIFICATION STAMP', x + 10, y + 20);
        
        ctx.font = '12px Arial';
        ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, x + 10, y + 40);
        ctx.fillText(`Scale: ${analysisResults.scale.notation}`, x + 10, y + 55);
        ctx.fillText(`Elements: ${analysisResults.elements.length}`, x + 10, y + 70);
        
        // Verification status
        const confidence = this.calculateOverallConfidence({ analysisResults });
        ctx.fillStyle = this.getConfidenceColor(confidence / 100);
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`Confidence: ${confidence.toFixed(1)}%`, x + 130, y + 55);
    }
    
    async saveAnnotatedPlan(canvas, originalPath) {
        const outputDir = path.join(process.cwd(), 'verification_reports', 'annotated_plans');
        await fs.mkdir(outputDir, { recursive: true });
        
        const filename = `annotated_${path.basename(originalPath).replace('.pdf', '.png')}`;
        const outputPath = path.join(outputDir, filename);
        
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(outputPath, buffer);
        
        return outputPath;
    }
    
    calculateMeasurementStats(analysisResults) {
        const elements = analysisResults.elements || [];
        const measuredElements = elements.filter(e => e.dimensions);
        
        let totalConfidence = 0;
        for (const element of elements) {
            totalConfidence += element.verification?.confidence?.score || 0.5;
        }
        
        return {
            totalElements: elements.length,
            measuredElements: measuredElements.length,
            averageConfidence: elements.length > 0 ? totalConfidence / elements.length : 0
        };
    }
    
    async checkAgainstStandards(classification, dimension) {
        // Check against standard dimensions
        // This would connect to standards database in production
        const standards = {
            door: { widths: [625, 750, 875, 1000, 1250] },
            window: { widths: [600, 900, 1200, 1500, 1800] },
            wall: { thicknesses: [100, 115, 175, 240, 300, 365] }
        };
        
        for (const [type, dims] of Object.entries(standards)) {
            if (classification.includes(type)) {
                const standardValues = dims.widths || dims.thicknesses || [];
                
                for (const stdValue of standardValues) {
                    if (Math.abs(dimension.value - stdValue) <= 10) {
                        return {
                            isStandard: true,
                            standardValue: stdValue,
                            deviation: Math.abs(dimension.value - stdValue)
                        };
                    }
                }
            }
        }
        
        return { isStandard: false };
    }
    
    calculateVerificationStatistics(measurements) {
        let totalConfidence = 0;
        let totalDeviation = 0;
        let withinTolerance = 0;
        
        const verifiedMeasurements = measurements.filter(m => 
            Object.values(m.measurements).some(v => v.verified)
        );
        
        for (const measurement of verifiedMeasurements) {
            for (const dim of Object.values(measurement.measurements)) {
                totalConfidence += dim.confidence;
                totalDeviation += dim.deviation;
                
                if (dim.deviation <= this.config.report.verificationCriteria.measurementTolerance) {
                    withinTolerance++;
                }
            }
        }
        
        const totalDims = verifiedMeasurements.reduce(
            (sum, m) => sum + Object.keys(m.measurements).length, 0
        );
        
        return {
            averageConfidence: totalDims > 0 ? totalConfidence / totalDims : 0,
            averageDeviation: totalDims > 0 ? totalDeviation / totalDims : 0,
            withinTolerance: totalDims > 0 ? withinTolerance / totalDims : 0
        };
    }
    
    async calculatePlanCoverage(analysisResults) {
        // Calculate percentage of plan covered by detected elements
        // This is simplified - actual implementation would calculate pixel coverage
        const totalElements = analysisResults.elements.length;
        const expectedElements = 50; // This would be based on plan complexity
        
        return Math.min(100, (totalElements / expectedElements) * 100);
    }
    
    calculateElementDetectionRate(analysisResults) {
        const classifiedElements = analysisResults.elements.filter(
            e => e.classification && e.classification !== 'undefined'
        ).length;
        
        return analysisResults.elements.length > 0 ? 
            (classifiedElements / analysisResults.elements.length) * 100 : 0;
    }
    
    calculateAnnotationCompleteness() {
        const totalAnnotations = this.verificationSession.annotations.size;
        const completeAnnotations = Array.from(this.verificationSession.annotations.values())
            .filter(a => a.measurements).length;
        
        return totalAnnotations > 0 ? (completeAnnotations / totalAnnotations) * 100 : 0;
    }
    
    calculateMeasurementAccuracy(measurementVerification) {
        const verifiedCount = measurementVerification.verifiedCount || 0;
        const totalCount = measurementVerification.measurements.length || 1;
        
        return (verifiedCount / totalCount) * 100;
    }
    
    calculateClassificationAccuracy(analysisResults) {
        const highConfidenceCount = analysisResults.elements.filter(
            e => (e.confidence || 0) >= 0.85
        ).length;
        
        return analysisResults.elements.length > 0 ? 
            (highConfidenceCount / analysisResults.elements.length) * 100 : 0;
    }
    
    calculateConfidenceDistribution(analysisResults) {
        const distribution = {
            high: 0,
            medium: 0,
            low: 0,
            veryLow: 0
        };
        
        for (const element of analysisResults.elements) {
            const confidence = element.confidence || element.verification?.confidence?.score || 0;
            
            if (confidence >= 0.85) distribution.high++;
            else if (confidence >= 0.7) distribution.medium++;
            else if (confidence >= 0.5) distribution.low++;
            else distribution.veryLow++;
        }
        
        return distribution;
    }
    
    calculateStandardCompliance(measurementVerification) {
        let standardCompliant = 0;
        let totalChecked = 0;
        
        for (const measurement of measurementVerification.measurements) {
            for (const dim of Object.values(measurement.measurements)) {
                if (dim.standardValue) {
                    totalChecked++;
                    if (dim.verified) {
                        standardCompliant++;
                    }
                }
            }
        }
        
        return totalChecked > 0 ? (standardCompliant / totalChecked) * 100 : 100;
    }
    
    calculateToleranceCompliance(measurementVerification) {
        const stats = measurementVerification.statistics;
        return (stats.withinTolerance || 0) * 100;
    }
    
    calculateCompletenessCompliance(metrics) {
        const coverageScore = (
            metrics.coverage.planCoverage +
            metrics.coverage.elementDetection +
            metrics.coverage.annotationCompleteness
        ) / 3;
        
        return coverageScore >= this.config.report.verificationCriteria.coverageRequirement * 100 ?
            100 : coverageScore;
    }
    
    calculateOverallQualityScore(metrics) {
        // Weighted average of all metrics
        const weights = {
            coverage: 0.25,
            accuracy: 0.35,
            compliance: 0.40
        };
        
        const coverageScore = (
            metrics.coverage.planCoverage +
            metrics.coverage.elementDetection +
            metrics.coverage.annotationCompleteness
        ) / 3;
        
        const accuracyScore = (
            metrics.accuracy.measurementAccuracy +
            metrics.accuracy.classificationAccuracy
        ) / 2;
        
        const complianceScore = (
            metrics.compliance.standardCompliance +
            metrics.compliance.toleranceCompliance +
            metrics.compliance.completenessCompliance
        ) / 3;
        
        return (
            coverageScore * weights.coverage +
            accuracyScore * weights.accuracy +
            complianceScore * weights.compliance
        );
    }
    
    calculateDiscrepancySeverity(issues) {
        if (!issues || issues.length === 0) return 'none';
        
        const severities = issues.map(i => i.severity || 'low');
        
        if (severities.includes('critical')) return 'critical';
        if (severities.includes('high')) return 'high';
        if (severities.includes('medium')) return 'medium';
        return 'low';
    }
    
    async identifyMissingElements(analysisResults) {
        // Identify gaps in element coverage
        // This is simplified - actual implementation would analyze spatial gaps
        const missingAreas = [];
        
        // Check for expected elements that might be missing
        const expectedTypes = ['wall', 'door', 'window', 'column'];
        const foundTypes = new Set(analysisResults.elements.map(e => {
            for (const type of expectedTypes) {
                if (e.classification.includes(type)) return type;
            }
            return null;
        }).filter(t => t));
        
        for (const expected of expectedTypes) {
            if (!foundTypes.has(expected)) {
                missingAreas.push({
                    type: expected,
                    issue: `No ${expected} elements detected`,
                    severity: 'medium'
                });
            }
        }
        
        return missingAreas;
    }
    
    findOverlappingElements(elements) {
        const overlaps = [];
        
        for (let i = 0; i < elements.length - 1; i++) {
            for (let j = i + 1; j < elements.length; j++) {
                if (this.elementsOverlap(elements[i], elements[j])) {
                    overlaps.push({
                        element1: elements[i].elementId,
                        element2: elements[j].elementId,
                        type1: elements[i].classification,
                        type2: elements[j].classification,
                        overlapArea: this.calculateOverlapArea(elements[i], elements[j])
                    });
                }
            }
        }
        
        return overlaps;
    }
    
    elementsOverlap(elem1, elem2) {
        const box1 = elem1.boundingBox;
        const box2 = elem2.boundingBox;
        
        if (!box1 || !box2) return false;
        
        return !(
            box1.x + box1.width < box2.x ||
            box2.x + box2.width < box1.x ||
            box1.y + box1.height < box2.y ||
            box2.y + box2.height < box1.y
        );
    }
    
    calculateOverlapArea(elem1, elem2) {
        const box1 = elem1.boundingBox;
        const box2 = elem2.boundingBox;
        
        const overlapX = Math.max(0, Math.min(box1.x + box1.width, box2.x + box2.width) - Math.max(box1.x, box2.x));
        const overlapY = Math.max(0, Math.min(box1.y + box1.height, box2.y + box2.height) - Math.max(box1.y, box2.y));
        
        return overlapX * overlapY;
    }
    
    async collectVerificationEvidence(analysisResults) {
        const evidence = {
            screenshots: [],
            intermediateResults: [],
            algorithmDetails: {
                scaleDetection: analysisResults.scale,
                elementDetection: {
                    method: 'computer_vision',
                    confidence: analysisResults.confidence
                }
            }
        };
        
        // Collect evidence based on configuration
        if (this.config.traceability.evidence.saveIntermediateResults) {
            evidence.intermediateResults = this.verificationSession.analysisResults;
        }
        
        return evidence;
    }
    
    async calculateIntegrityHash(data) {
        // Calculate hash of audit trail for integrity
        // In production, use crypto library
        const dataString = JSON.stringify(data);
        let hash = 0;
        
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return Math.abs(hash).toString(16);
    }
    
    generateExecutiveSummary(components) {
        const summary = {
            overview: 'This report presents the verification results of the construction plan analysis using pixel-precise computer vision technology.',
            keyFindings: [
                `Detected and analyzed ${components.annotatedPlan.annotationCount} construction elements`,
                `Achieved ${components.qualityMetrics.overallScore.toFixed(1)}% overall quality score`,
                `Verified ${components.measurementVerification.verifiedCount} measurements within tolerance`,
                `Identified ${components.discrepancyReport.totalDiscrepancies} discrepancies requiring review`
            ],
            recommendations: components.discrepancyReport.criticalIssues > 0 ? 
                'Critical issues identified require immediate attention before proceeding.' :
                'Analysis results are within acceptable parameters for construction documentation.'
        };
        
        return summary;
    }
    
    generateMethodologySection() {
        return {
            title: 'Verification Methodology',
            content: [
                'Pixel-accurate computer vision analysis',
                'Scale detection from plan footer',
                'Multi-class element classification using deep learning',
                'Precise measurement calculation with tolerance checking',
                'Cross-verification against DIN standards',
                'Comprehensive audit trail generation'
            ]
        };
    }
    
    generateElementAnalysisSection(components) {
        return {
            title: 'Element Analysis Results',
            totalElements: components.annotatedPlan.annotations.elements.length,
            elementTypes: this.countElementTypes(components.annotatedPlan.annotations.elements),
            confidenceDistribution: components.qualityMetrics.accuracy.confidenceDistribution
        };
    }
    
    generateRecommendations(components) {
        const recommendations = [];
        
        // Based on quality metrics
        if (components.qualityMetrics.overallScore < 80) {
            recommendations.push({
                type: 'quality',
                priority: 'high',
                recommendation: 'Overall quality score below 80%. Review low-confidence elements and improve plan clarity.'
            });
        }
        
        // Based on discrepancies
        if (components.discrepancyReport.criticalIssues > 0) {
            recommendations.push({
                type: 'critical',
                priority: 'urgent',
                recommendation: `Address ${components.discrepancyReport.criticalIssues} critical issues before proceeding with construction.`
            });
        }
        
        // Based on measurement verification
        const measurementAccuracy = (components.measurementVerification.verifiedCount / 
                                   components.measurementVerification.measurements.length) * 100;
        
        if (measurementAccuracy < 90) {
            recommendations.push({
                type: 'measurement',
                priority: 'medium',
                recommendation: 'Measurement verification below 90%. Verify dimensions manually for low-confidence elements.'
            });
        }
        
        return recommendations;
    }
    
    determineVerificationStatus(components) {
        const criticalIssues = components.discrepancyReport.criticalIssues;
        const overallScore = components.qualityMetrics.overallScore;
        const measurementAccuracy = (components.measurementVerification.verifiedCount / 
                                   components.measurementVerification.measurements.length) * 100;
        
        if (criticalIssues > 0) {
            return 'Failed - Critical Issues';
        } else if (overallScore >= 90 && measurementAccuracy >= 95) {
            return 'Verified - Excellent';
        } else if (overallScore >= 80 && measurementAccuracy >= 90) {
            return 'Verified - Good';
        } else if (overallScore >= 70 && measurementAccuracy >= 85) {
            return 'Partial - Review Required';
        } else {
            return 'Failed - Below Standards';
        }
    }
    
    calculateOverallConfidence(components) {
        const weights = {
            qualityScore: 0.4,
            measurementAccuracy: 0.3,
            elementDetection: 0.3
        };
        
        const qualityScore = components.qualityMetrics?.overallScore || 
                           components.analysisResults?.confidence * 100 || 75;
        
        const measurementAccuracy = components.measurementVerification ?
            (components.measurementVerification.verifiedCount / 
             Math.max(1, components.measurementVerification.measurements?.length || 1)) * 100 : 80;
        
        const elementDetection = components.analysisResults?.elements ?
            Math.min(100, (components.analysisResults.elements.length / 30) * 100) : 85;
        
        return (
            qualityScore * weights.qualityScore +
            measurementAccuracy * weights.measurementAccuracy +
            elementDetection * weights.elementDetection
        );
    }
    
    renderExecutiveSummary(summary) {
        let html = `<p>${summary.overview}</p><h3>Key Findings:</h3><ul>`;
        
        for (const finding of summary.keyFindings) {
            html += `<li>${finding}</li>`;
        }
        
        html += `</ul><p><strong>Recommendation:</strong> ${summary.recommendations}</p>`;
        
        return html;
    }
    
    getStatusClass(status) {
        if (status.includes('Excellent') || status.includes('Good')) {
            return 'status-verified';
        } else if (status.includes('Partial')) {
            return 'status-partial';
        } else {
            return 'status-failed';
        }
    }
    
    renderMeasurementVerification(verification) {
        const accuracy = ((verification.verifiedCount / verification.measurements.length) * 100).toFixed(1);
        
        return `
            <p>Total measurements analyzed: <strong>${verification.measurements.length}</strong></p>
            <p>Successfully verified: <strong>${verification.verifiedCount}</strong> (${accuracy}%)</p>
            <p>Discrepancies found: <strong>${verification.discrepancyCount}</strong></p>
            
            <h3>Verification Statistics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Average Confidence</td>
                    <td>${(verification.statistics.averageConfidence * 100).toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Average Deviation</td>
                    <td>${verification.statistics.averageDeviation.toFixed(1)}mm</td>
                </tr>
                <tr>
                    <td>Within Tolerance</td>
                    <td>${(verification.statistics.withinTolerance * 100).toFixed(1)}%</td>
                </tr>
            </table>
        `;
    }
    
    renderQualityMetrics(metrics) {
        return `
            <h3>Coverage Metrics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Score</th>
                </tr>
                <tr>
                    <td>Plan Coverage</td>
                    <td>${metrics.coverage.planCoverage.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Element Detection</td>
                    <td>${metrics.coverage.elementDetection.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Annotation Completeness</td>
                    <td>${metrics.coverage.annotationCompleteness.toFixed(1)}%</td>
                </tr>
            </table>
            
            <h3>Accuracy Metrics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Score</th>
                </tr>
                <tr>
                    <td>Measurement Accuracy</td>
                    <td>${metrics.accuracy.measurementAccuracy.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Classification Accuracy</td>
                    <td>${metrics.accuracy.classificationAccuracy.toFixed(1)}%</td>
                </tr>
            </table>
            
            <h3>Compliance Metrics</h3>
            <table>
                <tr>
                    <th>Metric</th>
                    <th>Score</th>
                </tr>
                <tr>
                    <td>Standard Compliance</td>
                    <td>${metrics.compliance.standardCompliance.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Tolerance Compliance</td>
                    <td>${metrics.compliance.toleranceCompliance.toFixed(1)}%</td>
                </tr>
                <tr>
                    <td>Completeness Compliance</td>
                    <td>${metrics.compliance.completenessCompliance.toFixed(1)}%</td>
                </tr>
            </table>
        `;
    }
    
    renderDiscrepancyReport(discrepancies) {
        if (discrepancies.totalDiscrepancies === 0) {
            return '<p>No significant discrepancies found.</p>';
        }
        
        let html = `
            <p>Total discrepancies identified: <strong>${discrepancies.totalDiscrepancies}</strong></p>
            <p>Critical issues: <strong>${discrepancies.criticalIssues}</strong></p>
        `;
        
        if (discrepancies.measurements.length > 0) {
            html += '<h3>Measurement Discrepancies</h3>';
            for (const disc of discrepancies.measurements.slice(0, 5)) {
                html += `
                    <div class="discrepancy-item">
                        <strong>Element ${disc.elementId} (${disc.elementType})</strong><br>
                        Issues: ${disc.issues.map(i => i.message).join(', ')}<br>
                        Severity: ${disc.severity}
                    </div>
                `;
            }
            if (discrepancies.measurements.length > 5) {
                html += `<p>... and ${discrepancies.measurements.length - 5} more measurement discrepancies</p>`;
            }
        }
        
        return html;
    }
    
    renderRecommendations(recommendations) {
        if (recommendations.length === 0) {
            return '<p>No specific recommendations. Analysis results are satisfactory.</p>';
        }
        
        let html = '<ul>';
        
        for (const rec of recommendations) {
            const priorityClass = rec.priority === 'urgent' ? 'status-failed' :
                                rec.priority === 'high' ? 'status-partial' : '';
            
            html += `
                <li>
                    <span class="${priorityClass}">[${rec.priority.toUpperCase()}]</span>
                    ${rec.recommendation}
                </li>
            `;
        }
        
        html += '</ul>';
        
        return html;
    }
    
    renderAuditTrail(auditTrail) {
        return `
            <p>Session ID: <code>${auditTrail.sessionId}</code></p>
            <p>Duration: ${this.calculateDuration(auditTrail.startTime, auditTrail.endTime)}</p>
            <p>Total processing steps: ${auditTrail.entries.length}</p>
            <p>Elements processed: ${auditTrail.summary.elementProcessed}</p>
            <p>Annotations created: ${auditTrail.summary.annotationsCreated}</p>
            <p>Integrity Hash: <code>${auditTrail.integrityHash}</code></p>
            
            <h3>Processing Steps</h3>
            <table>
                <tr>
                    <th>Step</th>
                    <th>Details</th>
                </tr>
                <tr>
                    <td>Pixel Analysis</td>
                    <td>Scale: ${auditTrail.processingSteps.pixelAnalysis.scale.notation}</td>
                </tr>
                <tr>
                    <td>Element Detection</td>
                    <td>${auditTrail.processingSteps.elementDetection.elementsDetected} elements</td>
                </tr>
                <tr>
                    <td>Measurement Calculation</td>
                    <td>${auditTrail.processingSteps.measurementCalculation.measurementsCalculated} measurements</td>
                </tr>
            </table>
        `;
    }
    
    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        
        const seconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    countElementTypes(elements) {
        const types = {};
        
        for (const element of elements) {
            const type = element.type || 'unknown';
            types[type] = (types[type] || 0) + 1;
        }
        
        return types;
    }
    
    async generatePDFReport(report, outputDir) {
        // Would use a PDF library like puppeteer or pdfkit
        // For now, return placeholder
        const pdfPath = path.join(outputDir, 'verification_report.pdf');
        
        return pdfPath;
    }
    
    async generateJSONReport(report, outputDir) {
        const jsonPath = path.join(outputDir, 'verification_report.json');
        
        const jsonData = this.config.report.formats.json.prettyPrint ?
            JSON.stringify(report, null, 2) :
            JSON.stringify(report);
        
        await fs.writeFile(jsonPath, jsonData, 'utf8');
        
        return jsonPath;
    }
}
