/**
 * 📊 DATA SOURCE TRACKER - MEASUREMENT TRACEABILITY SYSTEM
 * ========================================================
 * 
 * CRITICAL COMPONENT: Maintains complete traceability between tender document
 * values and their source annotations on construction plans
 * 
 * KEY CAPABILITIES:
 * ✅ Links every measurement to source plan annotations
 * ✅ Tracks pixel-to-real-world calculation history
 * ✅ Maintains confidence scores for each measurement
 * ✅ Enables instant source verification for humans
 * ✅ Supports multi-plan aggregation tracking
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Traceability System
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class DataSourceTracker extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            trackerName: 'DATA_SOURCE_TRACKER',
            
            // Tracking Configuration
            tracking: {
                enableFullHistory: true,
                includeIntermediateSteps: true,
                preservePixelData: true,
                includeConfidenceScores: true,
                trackAggregations: true
            },
            
            // Data Structure
            dataStructure: {
                measurementTypes: [
                    'linear',     // Lengths in meters
                    'area',       // Areas in m²
                    'volume',     // Volumes in m³
                    'count',      // Piece counts
                    'weight',     // Weight in kg
                    'percentage'  // Percentages
                ],
                
                sourceTypes: [
                    'plan_annotation',      // Direct from plan
                    'calculation',         // Calculated value
                    'aggregation',        // Sum from multiple sources
                    'estimation',         // AI estimated
                    'manual_override'     // Human corrected
                ]
            },
            
            // Confidence Levels
            confidence: {
                levels: {
                    verified: 0.95,      // Human verified
                    high: 0.85,         // Clear detection
                    medium: 0.70,       // Standard confidence
                    low: 0.50,          // Uncertain
                    estimation: 0.30    // Estimated only
                },
                
                colorCoding: {
                    verified: '#00C853',   // Green
                    high: '#4CAF50',      // Light green
                    medium: '#FFC107',    // Amber
                    low: '#FF9800',       // Orange
                    estimation: '#F44336'// Red
                }
            },
            
            // Storage Configuration
            storage: {
                database: true,
                fileBackup: true,
                compressionEnabled: true,
                retentionDays: 365
            }
        };
        
        // Tracking Maps
        this.measurementTracking = new Map();  // measurementId -> source data
        this.planAnnotations = new Map();      // planId -> annotations
        this.aggregationTracking = new Map();  // aggregationId -> source measurements
        this.calculationHistory = new Map();   // calculationId -> steps
        
        // Statistics
        this.statistics = {
            totalMeasurements: 0,
            verifiedMeasurements: 0,
            aggregations: 0,
            manualCorrections: 0
        };
    }
    
    /**
     * 🚀 INITIALIZE TRACKER
     */
    async initialize() {
        console.log('📊 Initializing Data Source Tracker...');
        
        try {
            // Create storage directory
            const storageDir = path.join(process.cwd(), 'tracking_data');
            await fs.mkdir(storageDir, { recursive: true });
            
            // Load existing tracking data if available
            await this.loadExistingData();
            
            console.log('✅ Data Source Tracker initialized');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize tracker:', error.message);
            throw error;
        }
    }
    
    /**
     * 📝 TRACK MEASUREMENT SOURCE
     */
    trackMeasurementSource(measurement) {
        const trackingId = uuidv4();
        
        const trackingData = {
            id: trackingId,
            timestamp: new Date().toISOString(),
            
            // Measurement details
            measurement: {
                value: measurement.value,
                unit: measurement.unit,
                type: measurement.type,
                description: measurement.description
            },
            
            // Source information
            source: {
                type: measurement.sourceType || 'plan_annotation',
                planIds: measurement.planIds || [],
                annotationIds: measurement.annotationIds || [],
                elementIds: measurement.elementIds || []
            },
            
            // Calculation details
            calculation: {
                method: measurement.calculationMethod,
                pixelArea: measurement.pixelArea,
                pixelsPerMillimeter: measurement.pixelsPerMillimeter,
                scaleFactor: measurement.scaleFactor,
                steps: measurement.calculationSteps || []
            },
            
            // Confidence and validation
            validation: {
                confidence: measurement.confidence || 0.7,
                confidenceLevel: this.getConfidenceLevel(measurement.confidence),
                verified: measurement.verified || false,
                verifiedBy: measurement.verifiedBy || null,
                verificationDate: measurement.verificationDate || null
            },
            
            // Visual references
            visualReferences: {
                planImages: measurement.planImages || [],
                annotationOverlays: measurement.annotationOverlays || [],
                highlightRegions: measurement.highlightRegions || []
            }
        };
        
        // Store in tracking map
        this.measurementTracking.set(trackingId, trackingData);
        
        // Update statistics
        this.statistics.totalMeasurements++;
        if (trackingData.validation.verified) {
            this.statistics.verifiedMeasurements++;
        }
        
        // Emit event for real-time updates
        this.emit('measurementTracked', trackingData);
        
        return trackingId;
    }
    
    /**
     * 🔗 TRACK AGGREGATION
     */
    trackAggregation(aggregationData) {
        const aggregationId = uuidv4();
        
        const tracking = {
            id: aggregationId,
            timestamp: new Date().toISOString(),
            
            // Aggregation details
            result: {
                value: aggregationData.totalValue,
                unit: aggregationData.unit,
                operation: aggregationData.operation || 'sum'
            },
            
            // Source measurements
            sources: aggregationData.sourceMeasurements.map(source => ({
                measurementId: source.id,
                value: source.value,
                planId: source.planId,
                weight: source.weight || 1.0
            })),
            
            // Calculation breakdown
            breakdown: {
                formula: aggregationData.formula,
                steps: aggregationData.steps || [],
                adjustments: aggregationData.adjustments || []
            },
            
            // Confidence calculation
            confidence: this.calculateAggregationConfidence(aggregationData.sourceMeasurements)
        };
        
        // Store aggregation
        this.aggregationTracking.set(aggregationId, tracking);
        this.statistics.aggregations++;
        
        return aggregationId;
    }
    
    /**
     * 📍 LINK ANNOTATION TO MEASUREMENT
     */
    linkAnnotationToMeasurement(measurementId, annotationData) {
        const measurement = this.measurementTracking.get(measurementId);
        
        if (!measurement) {
            throw new Error(`Measurement ${measurementId} not found`);
        }
        
        // Add annotation link
        const annotationLink = {
            annotationId: annotationData.id,
            planId: annotationData.planId,
            planPage: annotationData.page,
            
            // Visual location
            location: {
                x: annotationData.x,
                y: annotationData.y,
                width: annotationData.width,
                height: annotationData.height,
                pixelCoordinates: annotationData.pixelCoordinates
            },
            
            // Annotation details
            details: {
                type: annotationData.type,
                label: annotationData.label,
                color: annotationData.color,
                confidence: annotationData.confidence
            },
            
            // Original plan section
            planSection: {
                imageData: annotationData.imageData,
                scale: annotationData.scale,
                timestamp: annotationData.timestamp
            }
        };
        
        // Update measurement with annotation
        if (!measurement.source.annotations) {
            measurement.source.annotations = [];
        }
        measurement.source.annotations.push(annotationLink);
        
        // Update annotation map
        if (!this.planAnnotations.has(annotationData.planId)) {
            this.planAnnotations.set(annotationData.planId, []);
        }
        this.planAnnotations.get(annotationData.planId).push({
            measurementId,
            annotation: annotationLink
        });
    }
    
    /**
     * 🔍 GET MEASUREMENT SOURCE
     */
    getMeasurementSource(measurementId) {
        const tracking = this.measurementTracking.get(measurementId);
        
        if (!tracking) {
            return null;
        }
        
        return {
            ...tracking,
            // Include aggregation if this measurement is part of one
            aggregations: this.findAggregationsContaining(measurementId),
            // Include related measurements from same plan
            relatedMeasurements: this.findRelatedMeasurements(tracking)
        };
    }
    
    /**
     * 📸 GET VISUAL PROOF
     */
    async getVisualProof(measurementId) {
        const tracking = this.measurementTracking.get(measurementId);
        
        if (!tracking) {
            throw new Error(`Measurement ${measurementId} not found`);
        }
        
        const visualProof = {
            measurementId,
            value: tracking.measurement.value,
            unit: tracking.measurement.unit,
            
            // Source plans with highlighted regions
            sourcePlans: await this.loadPlanImages(tracking.source.planIds),
            
            // Annotated overlays
            annotations: tracking.visualReferences.annotationOverlays,
            
            // Calculation visualization
            calculationSteps: this.visualizeCalculation(tracking.calculation),
            
            // Confidence indicator
            confidence: {
                score: tracking.validation.confidence,
                level: tracking.validation.confidenceLevel,
                color: this.config.confidence.colorCoding[tracking.validation.confidenceLevel]
            }
        };
        
        return visualProof;
    }
    
    /**
     * ✅ MARK AS VERIFIED
     */
    markAsVerified(measurementId, verifierInfo) {
        const tracking = this.measurementTracking.get(measurementId);
        
        if (!tracking) {
            throw new Error(`Measurement ${measurementId} not found`);
        }
        
        // Update verification status
        tracking.validation.verified = true;
        tracking.validation.verifiedBy = verifierInfo.name;
        tracking.validation.verificationDate = new Date().toISOString();
        tracking.validation.confidence = this.config.confidence.levels.verified;
        tracking.validation.confidenceLevel = 'verified';
        
        // Add verification note
        if (verifierInfo.note) {
            tracking.validation.verificationNote = verifierInfo.note;
        }
        
        // Update statistics
        this.statistics.verifiedMeasurements++;
        
        // Emit verification event
        this.emit('measurementVerified', {
            measurementId,
            verifier: verifierInfo,
            timestamp: tracking.validation.verificationDate
        });
    }
    
    /**
     * 🔄 TRACK MANUAL CORRECTION
     */
    trackManualCorrection(measurementId, correction) {
        const tracking = this.measurementTracking.get(measurementId);
        
        if (!tracking) {
            throw new Error(`Measurement ${measurementId} not found`);
        }
        
        // Store original value
        if (!tracking.corrections) {
            tracking.corrections = [];
        }
        
        tracking.corrections.push({
            timestamp: new Date().toISOString(),
            originalValue: tracking.measurement.value,
            newValue: correction.newValue,
            reason: correction.reason,
            correctedBy: correction.correctedBy,
            documentation: correction.documentation
        });
        
        // Update measurement value
        tracking.measurement.value = correction.newValue;
        tracking.source.type = 'manual_override';
        
        // Update statistics
        this.statistics.manualCorrections++;
    }
    
    /**
     * 📊 GENERATE TRACKING REPORT
     */
    generateTrackingReport() {
        const report = {
            timestamp: new Date().toISOString(),
            statistics: this.statistics,
            
            // Confidence distribution
            confidenceDistribution: this.calculateConfidenceDistribution(),
            
            // Source type breakdown
            sourceBreakdown: this.calculateSourceBreakdown(),
            
            // Verification status
            verificationStatus: {
                verified: this.statistics.verifiedMeasurements,
                unverified: this.statistics.totalMeasurements - this.statistics.verifiedMeasurements,
                percentage: (this.statistics.verifiedMeasurements / this.statistics.totalMeasurements * 100).toFixed(1)
            },
            
            // Plan coverage
            planCoverage: this.calculatePlanCoverage(),
            
            // Quality metrics
            qualityMetrics: {
                averageConfidence: this.calculateAverageConfidence(),
                highConfidenceMeasurements: this.countHighConfidence(),
                manualCorrectionRate: (this.statistics.manualCorrections / this.statistics.totalMeasurements * 100).toFixed(1)
            }
        };
        
        return report;
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    getConfidenceLevel(confidence) {
        if (confidence >= this.config.confidence.levels.verified) return 'verified';
        if (confidence >= this.config.confidence.levels.high) return 'high';
        if (confidence >= this.config.confidence.levels.medium) return 'medium';
        if (confidence >= this.config.confidence.levels.low) return 'low';
        return 'estimation';
    }
    
    calculateAggregationConfidence(sources) {
        if (!sources || sources.length === 0) return 0;
        
        const weights = sources.map(s => s.weight || 1.0);
        const confidences = sources.map(s => s.confidence || 0.7);
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (let i = 0; i < sources.length; i++) {
            weightedSum += confidences[i] * weights[i];
            totalWeight += weights[i];
        }
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    findAggregationsContaining(measurementId) {
        const aggregations = [];
        
        for (const [aggId, aggData] of this.aggregationTracking) {
            const contains = aggData.sources.some(s => s.measurementId === measurementId);
            if (contains) {
                aggregations.push({
                    aggregationId: aggId,
                    ...aggData
                });
            }
        }
        
        return aggregations;
    }
    
    findRelatedMeasurements(tracking) {
        const related = [];
        
        if (!tracking.source.planIds || tracking.source.planIds.length === 0) {
            return related;
        }
        
        // Find measurements from same plans
        for (const [measId, measData] of this.measurementTracking) {
            if (measId === tracking.id) continue;
            
            const samePlan = measData.source.planIds?.some(planId => 
                tracking.source.planIds.includes(planId)
            );
            
            if (samePlan) {
                related.push({
                    measurementId: measId,
                    value: measData.measurement.value,
                    unit: measData.measurement.unit,
                    type: measData.measurement.type
                });
            }
        }
        
        return related;
    }
    
    async loadPlanImages(planIds) {
        const images = [];
        
        for (const planId of planIds) {
            try {
                // Load plan image (implementation depends on storage system)
                const imagePath = path.join(process.cwd(), 'plans', `${planId}.png`);
                const imageExists = await fs.access(imagePath).then(() => true).catch(() => false);
                
                if (imageExists) {
                    const imageData = await fs.readFile(imagePath, 'base64');
                    images.push({
                        planId,
                        imageData: `data:image/png;base64,${imageData}`
                    });
                }
            } catch (error) {
                console.warn(`Could not load plan image ${planId}:`, error.message);
            }
        }
        
        return images;
    }
    
    visualizeCalculation(calculation) {
        const steps = [];
        
        if (!calculation || !calculation.steps) {
            return steps;
        }
        
        for (const step of calculation.steps) {
            steps.push({
                description: step.description,
                formula: step.formula,
                input: step.input,
                output: step.output,
                unit: step.unit
            });
        }
        
        return steps;
    }
    
    calculateConfidenceDistribution() {
        const distribution = {
            verified: 0,
            high: 0,
            medium: 0,
            low: 0,
            estimation: 0
        };
        
        for (const tracking of this.measurementTracking.values()) {
            const level = tracking.validation.confidenceLevel;
            if (distribution[level] !== undefined) {
                distribution[level]++;
            }
        }
        
        return distribution;
    }
    
    calculateSourceBreakdown() {
        const breakdown = {
            plan_annotation: 0,
            calculation: 0,
            aggregation: 0,
            estimation: 0,
            manual_override: 0
        };
        
        for (const tracking of this.measurementTracking.values()) {
            const type = tracking.source.type;
            if (breakdown[type] !== undefined) {
                breakdown[type]++;
            }
        }
        
        return breakdown;
    }
    
    calculatePlanCoverage() {
        const planSet = new Set();
        
        for (const tracking of this.measurementTracking.values()) {
            if (tracking.source.planIds) {
                tracking.source.planIds.forEach(id => planSet.add(id));
            }
        }
        
        return {
            totalPlans: planSet.size,
            plans: Array.from(planSet)
        };
    }
    
    calculateAverageConfidence() {
        if (this.measurementTracking.size === 0) return 0;
        
        let sum = 0;
        for (const tracking of this.measurementTracking.values()) {
            sum += tracking.validation.confidence;
        }
        
        return (sum / this.measurementTracking.size).toFixed(3);
    }
    
    countHighConfidence() {
        let count = 0;
        
        for (const tracking of this.measurementTracking.values()) {
            if (tracking.validation.confidence >= this.config.confidence.levels.high) {
                count++;
            }
        }
        
        return count;
    }
    
    /**
     * 💾 SAVE/LOAD METHODS
     */
    
    async saveTrackingData() {
        try {
            const data = {
                timestamp: new Date().toISOString(),
                measurements: Array.from(this.measurementTracking.entries()),
                annotations: Array.from(this.planAnnotations.entries()),
                aggregations: Array.from(this.aggregationTracking.entries()),
                statistics: this.statistics
            };
            
            const filePath = path.join(process.cwd(), 'tracking_data', `tracking_${Date.now()}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            
            console.log(`✅ Tracking data saved to ${filePath}`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to save tracking data:', error.message);
            return false;
        }
    }
    
    async loadExistingData() {
        try {
            const trackingDir = path.join(process.cwd(), 'tracking_data');
            const files = await fs.readdir(trackingDir);
            
            // Find most recent tracking file
            const trackingFiles = files.filter(f => f.startsWith('tracking_') && f.endsWith('.json'));
            
            if (trackingFiles.length === 0) {
                console.log('📊 No existing tracking data found');
                return false;
            }
            
            trackingFiles.sort((a, b) => b.localeCompare(a));
            const latestFile = trackingFiles[0];
            
            const filePath = path.join(trackingDir, latestFile);
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            // Restore maps
            this.measurementTracking = new Map(data.measurements);
            this.planAnnotations = new Map(data.annotations);
            this.aggregationTracking = new Map(data.aggregations);
            this.statistics = data.statistics;
            
            console.log(`✅ Loaded tracking data from ${latestFile}`);
            console.log(`   📊 ${this.measurementTracking.size} measurements tracked`);
            
            return true;
            
        } catch (error) {
            console.warn('⚠️ Could not load existing tracking data:', error.message);
            return false;
        }
    }
}

