/**
 * 🌳 TOT DECISION TRACKER - Revolutionary AI Decision Transparency
 * =================================================================
 * 
 * Captures EVERY decision made during construction analysis with complete reasoning chains
 * Enables human review of AI logic and builds trust through transparency
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Decision Tracking
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class TOTDecisionTracker extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            trackerName: 'TOT_DECISION_TRACKER',
            
            // Decision types to track
            decisionTypes: {
                scaleDetection: 'scale_detection',
                elementClassification: 'element_classification',
                measurementValidation: 'measurement_validation',
                materialSelection: 'material_selection',
                costAssignment: 'cost_assignment',
                qualityAssessment: 'quality_assessment',
                documentGeneration: 'document_generation'
            },
            
            // Reasoning factors to capture
            reasoningFactors: {
                geometric: 'geometric_features',
                textural: 'textural_analysis',
                contextual: 'contextual_information',
                historical: 'historical_patterns',
                statistical: 'statistical_analysis'
            },
            
            // Confidence thresholds for decision quality
            confidenceThresholds: {
                excellent: 0.95,
                good: 0.85,
                acceptable: 0.70,
                review: 0.50
            },
            
            // Storage configuration
            storage: {
                saveEveryN: 10, // Save every 10 decisions
                maxMemoryDecisions: 10000,
                outputPath: './decision_trees'
            }
        };
        
        // Decision tree storage
        this.decisionTree = {
            rootId: null,
            nodes: new Map(),
            edges: new Map(),
            currentPath: [],
            statistics: {
                totalDecisions: 0,
                byType: {},
                averageConfidence: 0,
                criticalDecisions: []
            }
        };
        
        // Active session
        this.session = {
            id: null,
            projectId: null,
            startTime: null,
            decisions: [],
            metadata: {}
        };
    }
    
    /**
     * 🚀 START DECISION TRACKING SESSION
     */
    startSession(projectId, metadata = {}) {
        this.session = {
            id: uuidv4(),
            projectId,
            startTime: new Date().toISOString(),
            decisions: [],
            metadata
        };
        
        console.log(`🌳 Decision tracking started for project: ${projectId}`);
        console.log(`   Session ID: ${this.session.id}`);
        
        return this.session.id;
    }
    
    /**
     * 📝 RECORD DECISION
     */
    recordDecision(decisionData) {
        const decision = {
            id: uuidv4(),
            sessionId: this.session.id,
            timestamp: new Date().toISOString(),
            type: decisionData.type,
            
            // Context information
            context: {
                element: decisionData.element || null,
                imageRegion: decisionData.imageRegion || null,
                features: decisionData.features || {},
                previousDecisions: [...this.session.decisions.slice(-5).map(d => d.id)]
            },
            
            // All possible branches/options considered
            branches: decisionData.branches || [],
            
            // The chosen option
            chosen: decisionData.chosen,
            chosenReasoning: decisionData.reasoning || [],
            
            // Factor weights that influenced the decision
            factors: decisionData.factors || {
                geometric: 0,
                textural: 0,
                contextual: 0,
                historical: 0,
                statistical: 0
            },
            
            // Confidence in the decision
            confidence: decisionData.confidence || 0.5,
            
            // Metadata
            metadata: {
                processingTime: decisionData.processingTime || 0,
                alternativesConsidered: decisionData.branches?.length || 0,
                criticalDecision: decisionData.confidence < this.config.confidenceThresholds.review,
                ...decisionData.metadata
            }
        };
        
        // Add to session
        this.session.decisions.push(decision);
        
        // Add to decision tree
        this.decisionTree.nodes.set(decision.id, decision);
        
        // Update statistics
        this.decisionTree.statistics.totalDecisions++;
        this.decisionTree.statistics.byType[decision.type] = 
            (this.decisionTree.statistics.byType[decision.type] || 0) + 1;
        
        // Track critical decisions
        if (decision.metadata.criticalDecision) {
            this.decisionTree.statistics.criticalDecisions.push(decision.id);
        }
        
        // Save periodically
        if (this.session.decisions.length % this.config.storage.saveEveryN === 0) {
            this.saveDecisions().catch(err => console.error('Failed to save decisions:', err));
        }
        
        // Emit event
        this.emit('decision_recorded', decision);
        
        return decision.id;
    }
    
    /**
     * 🔗 LINK DECISIONS (Parent-Child Relationship)
     */
    linkDecisions(parentId, childId, relationship = 'influences') {
        if (!this.decisionTree.edges.has(parentId)) {
            this.decisionTree.edges.set(parentId, []);
        }
        
        this.decisionTree.edges.get(parentId).push({
            childId,
            relationship,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * 🎯 RECORD SCALE DETECTION DECISION
     */
    recordScaleDetection(ocrResult, scaleChosen, alternatives) {
        return this.recordDecision({
            type: this.config.decisionTypes.scaleDetection,
            context: {
                ocrText: ocrResult.text,
                ocrConfidence: ocrResult.confidence,
                footerRegion: ocrResult.region
            },
            branches: alternatives.map(alt => ({
                option: alt.scale,
                confidence: alt.confidence,
                reasoning: alt.reasoning
            })),
            chosen: scaleChosen.notation,
            reasoning: scaleChosen.reasoning,
            factors: {
                textural: 0.6, // OCR text analysis
                contextual: 0.3, // Drawing context
                statistical: 0.1 // Common scale patterns
            },
            confidence: scaleChosen.confidence
        });
    }
    
    /**
     * 🏗️ RECORD ELEMENT CLASSIFICATION DECISION
     */
    recordElementClassification(element, features, alternatives, chosen) {
        return this.recordDecision({
            type: this.config.decisionTypes.elementClassification,
            element: {
                id: element.elementId,
                boundingBox: element.boundingBox
            },
            imageRegion: element.imageRegion,
            features: {
                geometric: features.geometric || {},
                textural: features.textural || {},
                contextual: features.contextual || {}
            },
            branches: alternatives.map(alt => ({
                option: alt.classification,
                confidence: alt.confidence,
                reasoning: alt.reasoning,
                evidence: alt.evidence
            })),
            chosen: chosen.classification,
            reasoning: chosen.reasoning,
            factors: chosen.factors || {
                geometric: 0.4,
                textural: 0.3,
                contextual: 0.3
            },
            confidence: chosen.confidence
        });
    }
    
    /**
     * 📏 RECORD MEASUREMENT VALIDATION DECISION
     */
    recordMeasurementValidation(measurement, validation) {
        return this.recordDecision({
            type: this.config.decisionTypes.measurementValidation,
            element: {
                id: measurement.elementId,
                classification: measurement.classification
            },
            context: {
                pixelMeasurement: measurement.pixels,
                calculatedValue: measurement.value,
                unit: measurement.unit,
                scale: validation.scale
            },
            branches: [
                {
                    option: 'accept',
                    confidence: validation.confidence,
                    reasoning: validation.acceptReasoning
                },
                {
                    option: 'reject',
                    confidence: 1 - validation.confidence,
                    reasoning: validation.rejectReasoning
                }
            ],
            chosen: validation.accepted ? 'accept' : 'reject',
            reasoning: validation.reasoning,
            factors: {
                geometric: 0.3,
                statistical: 0.4,
                contextual: 0.3
            },
            confidence: validation.confidence
        });
    }
    
    /**
     * 💾 SAVE DECISIONS TO DISK
     */
    async saveDecisions() {
        const outputDir = path.join(
            this.config.storage.outputPath,
            this.session.projectId || 'unknown'
        );
        
        await fs.mkdir(outputDir, { recursive: true });
        
        // Save decision tree
        const treePath = path.join(outputDir, `decision_tree_${this.session.id}.json`);
        await fs.writeFile(treePath, JSON.stringify({
            session: this.session,
            tree: {
                nodes: Array.from(this.decisionTree.nodes.entries()),
                edges: Array.from(this.decisionTree.edges.entries()),
                statistics: this.decisionTree.statistics
            }
        }, null, 2));
        
        return treePath;
    }
    
    /**
     * 📊 GET DECISION STATISTICS
     */
    getStatistics() {
        const decisions = this.session.decisions;
        
        return {
            total: decisions.length,
            byType: this.decisionTree.statistics.byType,
            averageConfidence: decisions.reduce((sum, d) => sum + d.confidence, 0) / decisions.length,
            criticalCount: this.decisionTree.statistics.criticalDecisions.length,
            lowConfidenceDecisions: decisions.filter(d => d.confidence < this.config.confidenceThresholds.acceptable).length
        };
    }
    
    /**
     * 🔍 GET DECISION PATH
     */
    getDecisionPath(decisionId) {
        const path = [];
        let currentId = decisionId;
        
        while (currentId) {
            const decision = this.decisionTree.nodes.get(currentId);
            if (decision) {
                path.unshift(decision);
                // Find parent
                currentId = this.findParentDecision(currentId);
            } else {
                break;
            }
        }
        
        return path;
    }
    
    /**
     * 🔎 FIND PARENT DECISION
     */
    findParentDecision(childId) {
        for (const [parentId, children] of this.decisionTree.edges.entries()) {
            if (children.some(child => child.childId === childId)) {
                return parentId;
            }
        }
        return null;
    }
    
    /**
     * 📤 EXPORT DECISION TREE FOR VISUALIZATION
     */
    exportForVisualization() {
        const nodes = Array.from(this.decisionTree.nodes.values()).map(decision => ({
            id: decision.id,
            type: decision.type,
            chosen: decision.chosen,
            confidence: decision.confidence,
            timestamp: decision.timestamp,
            branches: decision.branches.length,
            critical: decision.metadata.criticalDecision
        }));
        
        const links = [];
        for (const [parentId, children] of this.decisionTree.edges.entries()) {
            for (const child of children) {
                links.push({
                    source: parentId,
                    target: child.childId,
                    relationship: child.relationship
                });
            }
        }
        
        return {
            nodes,
            links,
            statistics: this.getStatistics()
        };
    }
    
    /**
     * 🎯 END SESSION AND SAVE
     */
    async endSession() {
        const treePath = await this.saveDecisions();
        
        console.log(`🌳 Decision tracking session ended`);
        console.log(`   Total decisions: ${this.session.decisions.length}`);
        console.log(`   Saved to: ${treePath}`);
        
        return {
            sessionId: this.session.id,
            totalDecisions: this.session.decisions.length,
            statistics: this.getStatistics(),
            outputPath: treePath
        };
    }
}

