/**
 * 🔗 DECISION CROSS-REFERENCER - Link Construction ↔ AI Decisions
 * ===============================================================
 * 
 * Creates bidirectional links between construction elements and AI decision chains
 * Enables clicking an element to see all AI reasoning, and vice versa
 * 
 * @author Elite Construction AI Syndicate  
 * @version 1.0.0 - Production Cross-Reference System
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export default class DecisionCrossReferencer extends EventEmitter {
    constructor(totTracker, metaTracker) {
        super();
        
        this.totTracker = totTracker;
        this.metaTracker = metaTracker;
        
        this.config = {
            systemName: 'DECISION_CROSS_REFERENCER'
        };
        
        // Cross-reference maps
        this.elementToDecisions = new Map(); // elementId → [decisionIds]
        this.decisionToElements = new Map(); // decisionId → [elementIds]
        this.causalChains = [];
        this.impactAnalysis = new Map();
    }
    
    /**
     * 🔗 LINK ELEMENT TO DECISION
     */
    linkElementToDecision(elementId, decisionId, relationship = 'created_by') {
        // Element → Decisions
        if (!this.elementToDecisions.has(elementId)) {
            this.elementToDecisions.set(elementId, []);
        }
        this.elementToDecisions.get(elementId).push({
            decisionId,
            relationship,
            timestamp: new Date().toISOString()
        });
        
        // Decision → Elements
        if (!this.decisionToElements.has(decisionId)) {
            this.decisionToElements.set(decisionId, []);
        }
        this.decisionToElements.get(decisionId).push({
            elementId,
            relationship,
            timestamp: new Date().toISOString()
        });
        
        this.emit('link_created', { elementId, decisionId, relationship });
    }
    
    /**
     * 🎯 BUILD COMPLETE DECISION CHAIN FOR ELEMENT
     */
    getElementDecisionChain(elementId) {
        const decisions = this.elementToDecisions.get(elementId) || [];
        
        const chain = {
            elementId,
            totalDecisions: decisions.length,
            decisions: [],
            aiMetaDecisions: [],
            causalLinks: []
        };
        
        // Get all construction decisions for this element
        for (const { decisionId } of decisions) {
            const decision = this.totTracker.decisionTree.nodes.get(decisionId);
            if (decision) {
                chain.decisions.push({
                    id: decision.id,
                    type: decision.type,
                    chosen: decision.chosen,
                    confidence: decision.confidence,
                    reasoning: decision.chosenReasoning,
                    alternatives: decision.branches,
                    factors: decision.factors
                });
                
                // Find related AI meta-decisions
                const metaDecisions = this.findRelatedMetaDecisions(decision);
                chain.aiMetaDecisions.push(...metaDecisions);
            }
        }
        
        // Build causal links
        chain.causalLinks = this.traceCausalLinks(chain.decisions);
        
        return chain;
    }
    
    /**
     * 🔍 FIND RELATED META-DECISIONS
     */
    findRelatedMetaDecisions(constructionDecision) {
        const related = [];
        
        // Find algorithm selection for this decision type
        const algorithmChoice = this.metaTracker.algorithmChoices.get(constructionDecision.type);
        if (algorithmChoice) {
            related.push({
                type: 'algorithm_selection',
                algorithm: algorithmChoice.chosen.algorithm,
                reasoning: algorithmChoice.chosen.reasoning
            });
        }
        
        // Find model selection if classification decision
        if (constructionDecision.type === 'element_classification') {
            const modelDecisions = this.metaTracker.metaDecisions.filter(
                md => md.type === 'model_selection'
            );
            related.push(...modelDecisions);
        }
        
        // Find confidence threshold decisions
        const thresholdDecisions = this.metaTracker.metaDecisions.filter(
            md => md.type === 'confidence_threshold' && 
                  md.context.relatedTo === constructionDecision.type
        );
        related.push(...thresholdDecisions);
        
        return related;
    }
    
    /**
     * ⛓️ TRACE CAUSAL LINKS
     */
    traceCausalLinks(decisions) {
        const links = [];
        
        // Decision A influences Decision B
        for (let i = 0; i < decisions.length - 1; i++) {
            const current = decisions[i];
            const next = decisions[i + 1];
            
            // Check if current decision influenced next
            if (this.doesInfluence(current, next)) {
                links.push({
                    from: current.id,
                    to: next.id,
                    type: 'influences',
                    mechanism: this.explainInfluence(current, next),
                    confidencePropagation: this.calculateConfidencePropagation(current, next)
                });
            }
        }
        
        return links;
    }
    
    /**
     * 🔍 CHECK IF DECISION INFLUENCES ANOTHER
     */
    doesInfluence(decisionA, decisionB) {
        // Scale detection influences measurement
        if (decisionA.type === 'scale_detection' && decisionB.type === 'measurement_validation') {
            return true;
        }
        
        // Classification influences material selection
        if (decisionA.type === 'element_classification' && decisionB.type === 'material_selection') {
            return true;
        }
        
        // Measurement influences cost assignment
        if (decisionB.type === 'cost_assignment' && 
            (decisionA.type === 'measurement_validation' || decisionA.type === 'element_classification')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 📝 EXPLAIN HOW ONE DECISION INFLUENCES ANOTHER
     */
    explainInfluence(from, to) {
        if (from.type === 'scale_detection' && to.type === 'measurement_validation') {
            return `Scale ratio ${from.chosen} determines pixel-to-mm conversion factor, directly affecting all measurements`;
        }
        
        if (from.type === 'element_classification' && to.type === 'material_selection') {
            return `Element classified as "${from.chosen}" determines applicable materials (e.g., walls use concrete, doors use wood)`;
        }
        
        if (from.type === 'measurement_validation' && to.type === 'cost_assignment') {
            return `Measured quantity (${to.context?.quantity}) × unit price = total cost`;
        }
        
        return 'Generic influence relationship';
    }
    
    /**
     * 📊 CALCULATE CONFIDENCE PROPAGATION
     */
    calculateConfidencePropagation(from, to) {
        // Confidence propagates multiplicatively through chain
        const propagated = from.confidence * to.confidence;
        const degradation = from.confidence - propagated;
        
        return {
            original: to.confidence,
            propagated,
            degradation,
            compoundConfidence: propagated
        };
    }
    
    /**
     * 🎯 GENERATE DECISION IMPACT ANALYSIS
     */
    analyzeDecisionImpact(decisionId) {
        const decision = this.totTracker.decisionTree.nodes.get(decisionId);
        if (!decision) return null;
        
        const impact = {
            decisionId,
            type: decision.type,
            chosen: decision.chosen,
            
            // Direct impact
            directImpact: {
                elementsAffected: this.decisionToElements.get(decisionId)?.length || 0,
                downstreamDecisions: this.findDownstreamDecisions(decisionId).length
            },
            
            // Alternative path analysis
            alternativePaths: decision.branches.filter(b => b.option !== decision.chosen).map(alt => ({
                option: alt.option,
                confidence: alt.confidence,
                whatIfOutcome: this.simulateAlternative(decision, alt)
            })),
            
            // Counterfactual analysis
            counterfactual: {
                ifChosenDifferently: this.generateCounterfactual(decision),
                impactOnFinalOutput: this.estimateOutputImpact(decision)
            },
            
            // Optimization opportunities
            optimizationOpportunities: this.identifyOptimizations(decision)
        };
        
        this.impactAnalysis.set(decisionId, impact);
        
        return impact;
    }
    
    /**
     * 🔽 FIND DOWNSTREAM DECISIONS
     */
    findDownstreamDecisions(decisionId) {
        const downstream = [];
        const edges = this.totTracker.decisionTree.edges.get(decisionId) || [];
        
        for (const edge of edges) {
            downstream.push(edge.childId);
            // Recursively find children
            downstream.push(...this.findDownstreamDecisions(edge.childId));
        }
        
        return downstream;
    }
    
    /**
     * 🎲 SIMULATE ALTERNATIVE PATH
     */
    simulateAlternative(decision, alternative) {
        return {
            alternative: alternative.option,
            projectedConfidence: alternative.confidence,
            likelyOutcome: `If chosen "${alternative.option}" instead of "${decision.chosen}"`,
            estimatedImpact: 'Would affect downstream measurements and cost calculations'
        };
    }
    
    /**
     * 🔄 GENERATE COUNTERFACTUAL
     */
    generateCounterfactual(decision) {
        const bestAlternative = decision.branches
            .filter(b => b.option !== decision.chosen)
            .sort((a, b) => b.confidence - a.confidence)[0];
        
        if (!bestAlternative) return 'No alternatives available';
        
        return {
            alternative: bestAlternative.option,
            confidenceDifference: decision.confidence - bestAlternative.confidence,
            reasoning: `Alternative "${bestAlternative.option}" had ${(bestAlternative.confidence * 100).toFixed(1)}% confidence vs chosen "${decision.chosen}" at ${(decision.confidence * 100).toFixed(1)}%`
        };
    }
    
    /**
     * 📈 ESTIMATE OUTPUT IMPACT
     */
    estimateOutputImpact(decision) {
        const affected = this.decisionToElements.get(decision.id)?.length || 0;
        
        return {
            elementsDirectlyAffected: affected,
            cascadeEffect: affected * 2, // Rough estimate
            criticalityLevel: decision.confidence < 0.7 ? 'high' : 'medium'
        };
    }
    
    /**
     * 🎯 IDENTIFY OPTIMIZATION OPPORTUNITIES
     */
    identifyOptimizations(decision) {
        const opportunities = [];
        
        // Low confidence decisions
        if (decision.confidence < 0.7) {
            opportunities.push({
                type: 'improve_confidence',
                suggestion: 'Collect more training data for this decision type',
                expectedImprovement: '+15% confidence'
            });
        }
        
        // Multiple similar-confidence alternatives
        const similarAlternatives = decision.branches.filter(
            b => Math.abs(b.confidence - decision.confidence) < 0.1
        );
        
        if (similarAlternatives.length > 1) {
            opportunities.push({
                type: 'disambiguate_alternatives',
                suggestion: 'Add discriminative features to better distinguish options',
                expectedImprovement: 'Clearer decision boundaries'
            });
        }
        
        return opportunities;
    }
    
    /**
     * 📤 EXPORT COMPLETE CROSS-REFERENCE DATA
     */
    exportCrossReferences() {
        return {
            elementToDecisions: Array.from(this.elementToDecisions.entries()).map(([elemId, decisions]) => ({
                elementId: elemId,
                decisions: decisions.map(d => d.decisionId),
                decisionCount: decisions.length
            })),
            
            decisionToElements: Array.from(this.decisionToElements.entries()).map(([decId, elements]) => ({
                decisionId: decId,
                elements: elements.map(e => e.elementId),
                elementCount: elements.length
            })),
            
            causalChains: this.causalChains,
            
            impactAnalyses: Array.from(this.impactAnalysis.values())
        };
    }
}

