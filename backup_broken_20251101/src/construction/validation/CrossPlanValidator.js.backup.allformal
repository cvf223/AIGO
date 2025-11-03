/**
 * 🔗 CROSS-PLAN VALIDATOR - Multi-Plan Consistency Verification
 * =============================================================
 * 
 * TODO 11: Create cross-plan validation and expert feedback integration pipeline
 * Validates consistency across all 14 plans
 * Integrates expert corrections into learning pipeline
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Cross-Plan Validation
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

export default class CrossPlanValidator extends EventEmitter {
    constructor(goldenDatasetManager) {
        super();
        
        this.goldenDatasetManager = goldenDatasetManager;
        
        this.config = {
            validatorName: 'CROSS_PLAN_VALIDATOR',
            
            // Validation rules
            consistency: {
                scaleTolerancePercent: 5,
                elementCountVariancePercent: 30,
                areaTolerancePercent: 10,
                materialConsistency: true
            },
            
            // Expert feedback integration
            expertFeedback: {
                enabled: true,
                confidenceBoost: 0.15,
                learningTriggerThreshold: 10, // feedback items
                feedbackStoragePath: './expert_feedback'
            }
        };
        
        this.validationResults = {
            crossPlanIssues: [],
            inconsistencies: [],
            expertCorrections: [],
            learningOpportunities: []
        };
    }
    
    /**
     * 🔍 VALIDATE ACROSS ALL PLANS
     */
    async validateMultiplePlans(analysisResults) {
        console.log('🔗 Cross-plan validation starting...');
        console.log(`   Analyzing ${analysisResults.analysis.totalPlans} plans`);
        
        const validation = {
            scaleConsistency: await this.validateScaleConsistency(analysisResults),
            elementDistribution: await this.validateElementDistribution(analysisResults),
            areaConsistency: await this.validateAreaConsistency(analysisResults),
            materialConsistency: await this.validateMaterialConsistency(analysisResults),
            overallScore: 0
        };
        
        // Calculate overall validation score
        validation.overallScore = this.calculateOverallScore(validation);
        
        console.log(`   ✅ Validation complete: ${validation.overallScore.toFixed(1)}% consistent`);
        
        return validation;
    }
    
    /**
     * 📏 VALIDATE SCALE CONSISTENCY
     */
    async validateScaleConsistency(analysisResults) {
        const scales = analysisResults.analysis.plans.map(p => ({
            plan: p.planFile,
            scale: p.scale?.notation || 'unknown',
            ratio: p.scale?.ratio || 0
        }));
        
        // Group by scale
        const scaleGroups = {};
        for (const s of scales) {
            scaleGroups[s.scale] = (scaleGroups[s.scale] || 0) + 1;
        }
        
        // Find most common scale
        const dominantScale = Object.entries(scaleGroups)
            .sort((a, b) => b[1] - a[1])[0];
        
        const dominantPercent = (dominantScale[1] / scales.length) * 100;
        
        const result = {
            dominantScale: dominantScale[0],
            dominantCount: dominantScale[1],
            consistencyPercent: dominantPercent,
            inconsistentPlans: scales.filter(s => s.scale !== dominantScale[0]),
            passed: dominantPercent >= (100 - this.config.consistency.scaleTolerancePercent)
        };
        
        if (!result.passed) {
            this.validationResults.crossPlanIssues.push({
                type: 'scale_inconsistency',
                severity: 'medium',
                message: `${result.inconsistentPlans.length} plans have different scales`,
                recommendation: 'Verify scale detection or standardize plan scales'
            });
        }
        
        return result;
    }
    
    /**
     * 🏗️ VALIDATE ELEMENT DISTRIBUTION
     */
    async validateElementDistribution(analysisResults) {
        const plans = analysisResults.analysis.plans;
        
        // Calculate element counts per plan
        const elementCounts = plans.map(p => ({
            plan: p.planFile,
            count: p.elements?.length || 0
        }));
        
        const avgCount = elementCounts.reduce((sum, p) => sum + p.count, 0) / elementCounts.length;
        const stdDev = Math.sqrt(
            elementCounts.reduce((sum, p) => sum + Math.pow(p.count - avgCount, 2), 0) / elementCounts.length
        );
        
        const variance = (stdDev / avgCount) * 100;
        
        const result = {
            averageElements: avgCount,
            standardDeviation: stdDev,
            variancePercent: variance,
            outliers: elementCounts.filter(p => 
                Math.abs(p.count - avgCount) > 2 * stdDev
            ),
            passed: variance <= this.config.consistency.elementCountVariancePercent
        };
        
        if (!result.passed) {
            this.validationResults.crossPlanIssues.push({
                type: 'element_distribution_variance',
                severity: 'low',
                message: `High variance in element counts across plans (${variance.toFixed(1)}%)`,
                recommendation: 'Review plans with outlier element counts for detection accuracy'
            });
        }
        
        return result;
    }
    
    /**
     * 📐 VALIDATE AREA CONSISTENCY
     */
    async validateAreaConsistency(analysisResults) {
        const totalAnalyzedArea = analysisResults.analysis.totalArea || 0;
        const targetArea = analysisResults.projectInfo.projectData?.totalArea || 75000;
        
        const difference = Math.abs(totalAnalyzedArea - targetArea);
        const differencePercent = (difference / targetArea) * 100;
        
        const result = {
            analyzedArea: totalAnalyzedArea,
            targetArea: targetArea,
            difference: difference,
            differencePercent: differencePercent,
            passed: differencePercent <= this.config.consistency.areaTolerancePercent
        };
        
        if (!result.passed) {
            this.validationResults.crossPlanIssues.push({
                type: 'area_mismatch',
                severity: 'high',
                message: `Analyzed area differs from target by ${differencePercent.toFixed(1)}%`,
                recommendation: 'Review measurement calculations or target area specification'
            });
        }
        
        return result;
    }
    
    /**
     * 🧱 VALIDATE MATERIAL CONSISTENCY
     */
    async validateMaterialConsistency(analysisResults) {
        const materialUsage = {};
        
        for (const plan of analysisResults.analysis.plans) {
            for (const element of (plan.elements || [])) {
                const material = element.properties?.material || 'undefined';
                const type = element.classification;
                
                const key = `${type}_${material}`;
                materialUsage[key] = (materialUsage[key] || 0) + 1;
            }
        }
        
        // Check for inconsistent material assignments
        const inconsistencies = [];
        const materialsByType = {};
        
        for (const [key, count] of Object.entries(materialUsage)) {
            const [type, material] = key.split('_');
            if (!materialsByType[type]) materialsByType[type] = {};
            materialsByType[type][material] = count;
        }
        
        // Flag if same element type has multiple materials
        for (const [type, materials] of Object.entries(materialsByType)) {
            if (Object.keys(materials).length > 1) {
                inconsistencies.push({
                    elementType: type,
                    materials: materials,
                    recommendation: `Verify if ${type} should use multiple materials`
                });
            }
        }
        
        const result = {
            materialUsage,
            inconsistencies,
            passed: inconsistencies.length === 0
        };
        
        return result;
    }
    
    /**
     * 📊 CALCULATE OVERALL SCORE
     */
    calculateOverallScore(validation) {
        const weights = {
            scale: 0.25,
            elements: 0.25,
            area: 0.35,
            materials: 0.15
        };
        
        const scores = {
            scale: validation.scaleConsistency.consistencyPercent,
            elements: validation.elementDistribution.passed ? 100 : 70,
            area: validation.areaConsistency.passed ? 100 : 60,
            materials: validation.materialConsistency.passed ? 100 : 80
        };
        
        return Object.entries(weights).reduce((total, [key, weight]) => {
            return total + (scores[key] * weight);
        }, 0);
    }
    
    /**
     * 👨‍🏫 INTEGRATE EXPERT FEEDBACK
     */
    async integrateExpertFeedback(feedbackData) {
        console.log('👨‍🏫 Integrating expert feedback...');
        
        const feedback = {
            id: `feedback_${Date.now()}`,
            timestamp: new Date().toISOString(),
            expert: feedbackData.expertId || 'anonymous',
            corrections: [],
            learningItems: []
        };
        
        // Process each correction
        for (const correction of feedbackData.corrections) {
            feedback.corrections.push({
                elementId: correction.elementId,
                originalClassification: correction.original,
                correctedClassification: correction.corrected,
                expertReasoning: correction.reasoning,
                confidence: 1.0 // Expert feedback is highest confidence
            });
            
            // Add to golden dataset for retraining
            if (this.goldenDatasetManager && correction.imageData) {
                await this.goldenDatasetManager.addSample(
                    {
                        image: correction.imageData,
                        features: correction.features,
                        expertLabeled: true
                    },
                    correction.corrected,
                    correction.subcategory
                );
                
                feedback.learningItems.push({
                    type: 'golden_dataset_addition',
                    classification: correction.corrected,
                    impact: 'Improves model accuracy for this element type'
                });
            }
        }
        
        // Save feedback
        await this.saveFeedback(feedback);
        
        // Trigger retraining if threshold reached
        if (feedback.corrections.length >= this.config.expertFeedback.learningTriggerThreshold) {
            console.log('   🎓 Triggering model retraining with expert corrections');
            this.emit('retrain_triggered', {
                reason: 'expert_feedback_threshold',
                corrections: feedback.corrections.length
            });
        }
        
        console.log(`   ✅ Integrated ${feedback.corrections.length} expert corrections`);
        
        return feedback;
    }
    
    /**
     * 💾 SAVE FEEDBACK
     */
    async saveFeedback(feedback) {
        const feedbackDir = this.config.expertFeedback.feedbackStoragePath;
        await fs.mkdir(feedbackDir, { recursive: true });
        
        const feedbackPath = path.join(feedbackDir, `${feedback.id}.json`);
        await fs.writeFile(feedbackPath, JSON.stringify(feedback, null, 2));
        
        this.validationResults.expertCorrections.push(feedback);
    }
    
    /**
     * 📊 GENERATE VALIDATION REPORT
     */
    generateValidationReport() {
        return {
            timestamp: new Date().toISOString(),
            crossPlanIssues: this.validationResults.crossPlanIssues,
            totalIssues: this.validationResults.crossPlanIssues.length,
            expertCorrections: this.validationResults.expertCorrections.length,
            status: this.validationResults.crossPlanIssues.length === 0 ? 'PASSED' : 'REVIEW_REQUIRED'
        };
    }
}
