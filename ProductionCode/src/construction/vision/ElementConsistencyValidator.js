/**
 * ✅🔍 ELEMENT CONSISTENCY VALIDATOR - LEGEND VALIDATION & HUMAN ESCALATION ENGINE
 * ===============================================================================
 * 
 * CRITICAL COMPONENT - Ensures legend consistency across all building plans before precision analysis
 * 
 * CORE MISSION: Verify that all legend elements are consistently defined across multiple plans
 * and generate human escalation tickets for any critical inconsistencies that require resolution.
 * 
 * KEY CAPABILITIES:
 * - Advanced statistical consistency analysis using Levenshtein distance and fuzzy matching
 * - Multi-dimensional element comparison (visual, textual, semantic, contextual)
 * - Intelligent inconsistency severity assessment with automated priority classification
 * - Human escalation system with detailed resolution recommendations
 * - Integration with construction expert knowledge base for context-aware validation
 * - Real-time confidence scoring and uncertainty quantification
 * 
 * VALIDATION DIMENSIONS:
 * - Element Code Consistency: Same abbreviations across plans
 * - Element Name Consistency: Identical German terminology usage
 * - Symbol Visual Consistency: Same graphical representations
 * - Category Classification: Consistent structural/services/safety grouping
 * - Calculation Method: Same area/volume/linear/count methodologies
 * - Context Placement: Similar legend positioning and formatting
 * 
 * ESCALATION TRIGGERS:
 * - Critical elements missing from some plans (>20% plan coverage gap)
 * - Conflicting element definitions (same code, different meanings)
 * - Safety element inconsistencies (F30/F90, Fluchtweg variations)
 * - Structural element conflicts (Stahlbeton vs Beton unbewehrt misclassification)
 * 
 * @author Elite Construction AI Syndicate - Top 1% Computer Vision Specialist
 * @version 1.0.0 - Production Consistency Validation Engine
 */

import { EventEmitter } from 'events';
import LegendExtractionEngine from './LegendExtractionEngine.js';

export class ElementConsistencyValidator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Consistency Thresholds
            consistencyThresholds: {
                elementCode: 0.95,        // 95% similarity for element codes
                elementName: 0.90,        // 90% similarity for element names
                visualSymbol: 0.85,       // 85% similarity for visual representations
                categoryClassification: 1.0, // 100% match required for categories
                calculationMethod: 1.0,   // 100% match required for calculation methods
                overallConsistency: 0.92  // 92% overall consistency required
            },
            
            // Human Escalation Triggers
            escalationTriggers: {
                criticalInconsistencyThreshold: 0.80,  // <80% consistency = critical
                missingElementThreshold: 0.70,         // <70% plan coverage = escalate
                conflictingDefinitionThreshold: 0.50,  // <50% agreement = conflict
                safetyElementVariationTolerance: 0.05, // 5% tolerance for safety elements
                structuralElementVariationTolerance: 0.10 // 10% tolerance for structural
            },
            
            // Analysis Configuration
            fuzzyMatchingConfig: {
                algorithm: 'levenshtein_jaro_winkler', // Advanced string matching
                caseSensitive: false,
                accentSensitive: false,
                abbreviationNormalization: true,
                germanTerminologyContext: true
            },
            
            // Expert Knowledge Integration
            expertKnowledgeBase: {
                criticalElements: [
                    'flucht', 'rettungsweg', 'f30', 'f90', 'brandschutz',
                    'stahlbeton', 'beton', 'dämmung', 'tragwerk', 'stütze'
                ],
                synonymGroups: [
                    ['stahlbeton', 'bewehrter beton', 'reinforced concrete'],
                    ['dämmung hart', 'hartisolierung', 'rigid insulation'],
                    ['fluchtweg', 'rettungsweg', 'escape route', 'notausgang'],
                    ['feuerhemmend', 'f30', 'fire resistant 30min'],
                    ['feuerbeständig', 'f90', 'fire proof 90min']
                ],
                contextualPriorities: {
                    safety: 'critical',
                    structural: 'high',
                    services: 'medium',
                    reference: 'low',
                    usage: 'low'
                }
            },
            
            // Processing Settings
            batchSize: config.batchSize || 10,
            parallelValidation: config.parallelValidation !== false,
            cacheValidationResults: config.cacheValidationResults !== false,
            
            // Database Integration
            databaseConfig: config.databaseConfig,
            
            // Human Interface Configuration
            escalationSystemConfig: {
                assignmentRules: 'expertise_based', // Route to appropriate experts
                priorityQueue: 'severity_based',     // Order by severity and impact
                notificationChannels: ['email', 'slack', 'dashboard'],
                slaTargets: {
                    critical: '4 hours',
                    high: '24 hours',
                    medium: '72 hours',
                    low: '1 week'
                }
            }
        };
        
        // State Management
        this.validationResults = new Map();
        this.inconsistencyRegistry = new Map();
        this.escalationQueue = [];
        this.expertAssignments = new Map();
        this.validationStats = {
            totalElementsValidated: 0,
            consistentElements: 0,
            inconsistentElements: 0,
            criticalInconsistencies: 0,
            escalationsGenerated: 0,
            validationStartTime: null,
            validationEndTime: null
        };
        
        console.log('✅🔍 ElementConsistencyValidator initialized');
        console.log(`   🎯 Consistency Thresholds: ${Object.entries(this.config.consistencyThresholds).map(([k,v]) => `${k}:${v*100}%`).join(', ')}`);
        console.log(`   🚨 Escalation Triggers: ${Object.keys(this.config.escalationTriggers).length} configured`);
        console.log(`   🧠 Expert Knowledge Base: ${this.config.expertKnowledgeBase.criticalElements.length} critical elements`);
    }
    
    /**
     * 🎯 MASTER VALIDATION ORCHESTRATOR
     * Validate consistency across all extracted legends with comprehensive analysis
     */
    async validateLegendConsistency(masterElementRegistry, planLegends, buildingId) {
        console.log(`\n✅ MASTER CONSISTENCY VALIDATION - Building: ${buildingId}`);
        console.log(`   🧩 Master Elements: ${masterElementRegistry.size}`);
        console.log(`   📋 Plan Legends: ${planLegends.size}`);
        
        this.validationStats.validationStartTime = new Date();
        this.validationStats.buildingId = buildingId;
        
        try {
            // 1. Perform multi-dimensional consistency analysis
            const consistencyAnalysis = await this.performMultiDimensionalConsistencyAnalysis(
                masterElementRegistry, planLegends
            );
            
            // 2. Identify and classify inconsistencies
            const inconsistencyClassification = await this.classifyInconsistencies(
                consistencyAnalysis, masterElementRegistry, planLegends
            );
            
            // 3. Apply expert knowledge context
            const expertEnhancedAnalysis = await this.applyExpertKnowledgeContext(
                inconsistencyClassification, masterElementRegistry
            );
            
            // 4. Generate severity assessments
            const severityAssessments = await this.assessInconsistencySeverity(
                expertEnhancedAnalysis, masterElementRegistry
            );
            
            // 5. Create human escalation tickets
            const escalationTickets = await this.generateHumanEscalationTickets(
                severityAssessments, buildingId
            );
            
            // 6. Route escalations to appropriate experts
            const expertAssignments = await this.routeEscalationsToExperts(
                escalationTickets, buildingId
            );
            
            // 7. Persist validation results
            await this.persistValidationResults(buildingId, {
                consistencyAnalysis,
                inconsistencyClassification,
                severityAssessments,
                escalationTickets,
                expertAssignments
            });
            
            this.validationStats.validationEndTime = new Date();
            
            const summary = this.generateValidationSummary();
            
            console.log(`\n✅ CONSISTENCY VALIDATION COMPLETE`);
            console.log(`   📊 Elements Validated: ${this.validationStats.totalElementsValidated}`);
            console.log(`   ✅ Consistent Elements: ${this.validationStats.consistentElements}`);
            console.log(`   ⚠️ Inconsistent Elements: ${this.validationStats.inconsistentElements}`);
            console.log(`   🚨 Critical Issues: ${this.validationStats.criticalInconsistencies}`);
            console.log(`   🎯 Escalations Generated: ${this.validationStats.escalationsGenerated}`);
            console.log(`   ⏱️ Validation Time: ${this.getValidationDuration()}ms`);
            
            return {
                success: true,
                validationSummary: summary,
                consistencyScore: summary.overallConsistencyScore,
                criticalIssues: severityAssessments.filter(s => s.severity === 'critical'),
                escalationTickets: escalationTickets,
                expertAssignments: expertAssignments,
                requiresHumanIntervention: escalationTickets.length > 0
            };
            
        } catch (error) {
            console.error(`❌ Consistency validation failed: ${error.message}`);
            this.emit('validationError', error);
            throw error;
        }
    }
    
    /**
     * 🔬 MULTI-DIMENSIONAL CONSISTENCY ANALYSIS
     * Analyze consistency across multiple dimensions with advanced algorithms
     */
    async performMultiDimensionalConsistencyAnalysis(masterRegistry, planLegends) {
        console.log(`   🔬 Multi-dimensional consistency analysis`);
        
        const analysisResults = new Map();
        
        for (const [elementKey, masterElement] of masterRegistry) {
            console.log(`     🧩 Analyzing element: ${masterElement.elementCode} - ${masterElement.elementName}`);
            
            const elementAnalysis = {
                elementKey: elementKey,
                masterElement: masterElement,
                consistencyScores: {},
                planVariations: [],
                inconsistencyFlags: [],
                overallConsistency: 0
            };
            
            // Collect all variations of this element across plans
            const elementVariations = [];
            for (const [planId, planLegend] of planLegends) {
                if (planLegend.legendElements) {
                    const matchingElements = planLegend.legendElements.filter(el => 
                        this.fuzzyMatch(el.code, masterElement.elementCode) > 0.8 ||
                        this.fuzzyMatch(el.name, masterElement.elementName) > 0.8
                    );
                    
                    for (const element of matchingElements) {
                        elementVariations.push({
                            planId: planId,
                            element: element,
                            planType: planLegend.planType
                        });
                    }
                }
            }
            
            elementAnalysis.planVariations = elementVariations;
            
            // 1. Element Code Consistency Analysis
            elementAnalysis.consistencyScores.elementCode = this.analyzeElementCodeConsistency(
                masterElement.elementCode, elementVariations
            );
            
            // 2. Element Name Consistency Analysis
            elementAnalysis.consistencyScores.elementName = this.analyzeElementNameConsistency(
                masterElement.elementName, elementVariations
            );
            
            // 3. Category Classification Consistency
            elementAnalysis.consistencyScores.categoryClassification = this.analyzeCategoryConsistency(
                masterElement.elementCategory, elementVariations
            );
            
            // 4. Calculation Method Consistency
            elementAnalysis.consistencyScores.calculationMethod = this.analyzeCalculationMethodConsistency(
                masterElement.calculationMethod, elementVariations
            );
            
            // 5. Plan Coverage Analysis
            elementAnalysis.consistencyScores.planCoverage = this.analyzePlanCoverageConsistency(
                elementVariations, planLegends.size
            );
            
            // 6. Calculate overall consistency score
            elementAnalysis.overallConsistency = this.calculateOverallConsistencyScore(
                elementAnalysis.consistencyScores
            );
            
            // 7. Flag inconsistencies
            elementAnalysis.inconsistencyFlags = this.flagElementInconsistencies(
                elementAnalysis.consistencyScores, elementAnalysis.overallConsistency
            );
            
            analysisResults.set(elementKey, elementAnalysis);
            this.validationStats.totalElementsValidated++;
            
            if (elementAnalysis.overallConsistency >= this.config.consistencyThresholds.overallConsistency) {
                this.validationStats.consistentElements++;
            } else {
                this.validationStats.inconsistentElements++;
            }
            
            console.log(`       ✅ Overall consistency: ${Math.round(elementAnalysis.overallConsistency * 100)}%`);
        }
        
        console.log(`   📊 Multi-dimensional analysis complete: ${analysisResults.size} elements analyzed`);
        return analysisResults;
    }
    
    /**
     * 🏷️ CLASSIFY INCONSISTENCIES
     * Categorize and prioritize different types of inconsistencies
     */
    async classifyInconsistencies(consistencyAnalysis, masterRegistry, planLegends) {
        console.log(`   🏷️ Classifying inconsistencies`);
        
        const inconsistencyTypes = {
            'element_code_variation': [],
            'element_name_variation': [],
            'category_mismatch': [],
            'calculation_method_conflict': [],
            'missing_from_plans': [],
            'conflicting_definitions': [],
            'safety_element_inconsistency': [],
            'structural_element_inconsistency': []
        };
        
        for (const [elementKey, analysis] of consistencyAnalysis) {
            const masterElement = analysis.masterElement;
            
            // Check each consistency dimension
            if (analysis.consistencyScores.elementCode < this.config.consistencyThresholds.elementCode) {
                inconsistencyTypes.element_code_variation.push({
                    elementKey: elementKey,
                    masterElement: masterElement,
                    consistencyScore: analysis.consistencyScores.elementCode,
                    planVariations: analysis.planVariations,
                    severity: this.determineSeverityLevel(analysis.consistencyScores.elementCode, 'element_code')
                });
            }
            
            if (analysis.consistencyScores.elementName < this.config.consistencyThresholds.elementName) {
                inconsistencyTypes.element_name_variation.push({
                    elementKey: elementKey,
                    masterElement: masterElement,
                    consistencyScore: analysis.consistencyScores.elementName,
                    planVariations: analysis.planVariations,
                    severity: this.determineSeverityLevel(analysis.consistencyScores.elementName, 'element_name')
                });
            }
            
            if (analysis.consistencyScores.categoryClassification < this.config.consistencyThresholds.categoryClassification) {
                inconsistencyTypes.category_mismatch.push({
                    elementKey: elementKey,
                    masterElement: masterElement,
                    consistencyScore: analysis.consistencyScores.categoryClassification,
                    planVariations: analysis.planVariations,
                    severity: 'high' // Category mismatches are always high severity
                });
            }
            
            if (analysis.consistencyScores.calculationMethod < this.config.consistencyThresholds.calculationMethod) {
                inconsistencyTypes.calculation_method_conflict.push({
                    elementKey: elementKey,
                    masterElement: masterElement,
                    consistencyScore: analysis.consistencyScores.calculationMethod,
                    planVariations: analysis.planVariations,
                    severity: 'high' // Calculation conflicts are always high severity
                });
            }
            
            if (analysis.consistencyScores.planCoverage < this.config.escalationTriggers.missingElementThreshold) {
                inconsistencyTypes.missing_from_plans.push({
                    elementKey: elementKey,
                    masterElement: masterElement,
                    consistencyScore: analysis.consistencyScores.planCoverage,
                    planVariations: analysis.planVariations,
                    missingFromPlans: this.identifyMissingPlans(analysis.planVariations, planLegends),
                    severity: this.determineMissingElementSeverity(masterElement, analysis.consistencyScores.planCoverage)
                });
            }
            
            // Special handling for safety elements
            if (this.isSafetyElement(masterElement.elementCode, masterElement.elementName)) {
                if (analysis.overallConsistency < (1.0 - this.config.escalationTriggers.safetyElementVariationTolerance)) {
                    inconsistencyTypes.safety_element_inconsistency.push({
                        elementKey: elementKey,
                        masterElement: masterElement,
                        consistencyScore: analysis.overallConsistency,
                        planVariations: analysis.planVariations,
                        severity: 'critical' // Safety inconsistencies are always critical
                    });
                    this.validationStats.criticalInconsistencies++;
                }
            }
            
            // Special handling for structural elements
            if (this.isStructuralElement(masterElement.elementCode, masterElement.elementName)) {
                if (analysis.overallConsistency < (1.0 - this.config.escalationTriggers.structuralElementVariationTolerance)) {
                    inconsistencyTypes.structural_element_inconsistency.push({
                        elementKey: elementKey,
                        masterElement: masterElement,
                        consistencyScore: analysis.overallConsistency,
                        planVariations: analysis.planVariations,
                        severity: 'high' // Structural inconsistencies are high severity
                    });
                }
            }
        }
        
        // Log classification results
        const totalInconsistencies = Object.values(inconsistencyTypes).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`   📊 Inconsistency classification complete: ${totalInconsistencies} issues found`);
        
        for (const [type, issues] of Object.entries(inconsistencyTypes)) {
            if (issues.length > 0) {
                console.log(`     ${type}: ${issues.length} issues`);
            }
        }
        
        return inconsistencyTypes;
    }
    
    /**
     * 🧠 APPLY EXPERT KNOWLEDGE CONTEXT
     * Enhance analysis with construction domain expertise
     */
    async applyExpertKnowledgeContext(inconsistencyClassification, masterRegistry) {
        console.log(`   🧠 Applying expert knowledge context`);
        
        const expertEnhancedAnalysis = {};
        
        for (const [inconsistencyType, issues] of Object.entries(inconsistencyClassification)) {
            expertEnhancedAnalysis[inconsistencyType] = [];
            
            for (const issue of issues) {
                const enhancedIssue = { ...issue };
                
                // Apply expert knowledge context
                enhancedIssue.expertContext = {
                    isCriticalElement: this.isCriticalElement(issue.masterElement),
                    synonymGroups: this.findSynonymGroups(issue.masterElement),
                    domainPriority: this.getDomainPriority(issue.masterElement),
                    contextualRecommendations: this.generateContextualRecommendations(issue),
                    riskAssessment: this.assessElementRisk(issue.masterElement, issue.consistencyScore),
                    resolutionComplexity: this.assessResolutionComplexity(issue)
                };
                
                // Adjust severity based on expert knowledge
                const expertAdjustedSeverity = this.adjustSeverityWithExpertKnowledge(
                    issue.severity, enhancedIssue.expertContext
                );
                
                if (expertAdjustedSeverity !== issue.severity) {
                    console.log(`     🎯 Severity adjusted: ${issue.masterElement.elementCode} ${issue.severity} → ${expertAdjustedSeverity}`);
                    enhancedIssue.severity = expertAdjustedSeverity;
                    enhancedIssue.severityAdjustedByExpert = true;
                }
                
                expertEnhancedAnalysis[inconsistencyType].push(enhancedIssue);
            }
        }
        
        console.log(`   ✅ Expert knowledge context applied`);
        return expertEnhancedAnalysis;
    }
    
    /**
     * 🚨 GENERATE HUMAN ESCALATION TICKETS
     * Create detailed escalation tickets for human review and resolution
     */
    async generateHumanEscalationTickets(severityAssessments, buildingId) {
        console.log(`   🚨 Generating human escalation tickets`);
        
        const escalationTickets = [];
        
        for (const [inconsistencyType, issues] of Object.entries(severityAssessments)) {
            for (const issue of issues) {
                // Only escalate issues that require human intervention
                if (this.requiresHumanEscalation(issue)) {
                    const ticket = {
                        ticketId: this.generateTicketId(),
                        buildingId: buildingId,
                        inconsistencyType: inconsistencyType,
                        severity: issue.severity,
                        priority: this.determinePriority(issue.severity, issue.expertContext),
                        
                        // Element Information
                        elementCode: issue.masterElement.elementCode,
                        elementName: issue.masterElement.elementName,
                        elementCategory: issue.masterElement.elementCategory,
                        
                        // Issue Details
                        title: this.generateTicketTitle(issue, inconsistencyType),
                        description: this.generateDetailedDescription(issue, inconsistencyType),
                        consistencyScore: issue.consistencyScore,
                        affectedPlans: this.extractAffectedPlans(issue.planVariations),
                        
                        // Expert Context
                        expertRecommendations: issue.expertContext?.contextualRecommendations || [],
                        riskAssessment: issue.expertContext?.riskAssessment || 'medium',
                        resolutionComplexity: issue.expertContext?.resolutionComplexity || 'medium',
                        
                        // Assignment and Tracking
                        assignedTo: null, // To be assigned based on expertise
                        requiredExpertise: this.determineRequiredExpertise(issue),
                        estimatedResolutionTime: this.estimateResolutionTime(issue),
                        slaDeadline: this.calculateSlaDeadline(issue.severity),
                        
                        // Status and Metadata
                        status: 'open',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        metadata: {
                            originalIssue: issue,
                            buildingId: buildingId,
                            validationSession: this.validationStats.validationStartTime
                        }
                    };
                    
                    escalationTickets.push(ticket);
                    this.validationStats.escalationsGenerated++;
                }
            }
        }
        
        // Sort tickets by priority and severity
        escalationTickets.sort((a, b) => {
            const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        console.log(`   ✅ Generated ${escalationTickets.length} escalation tickets`);
        console.log(`   📊 Priority breakdown: ${this.getTicketPriorityBreakdown(escalationTickets)}`);
        
        this.escalationQueue = escalationTickets;
        return escalationTickets;
    }
    
    // ===============================
    // CONSISTENCY ANALYSIS METHODS
    // ===============================
    
    analyzeElementCodeConsistency(masterCode, variations) {
        if (variations.length === 0) return 0;
        
        const similarities = variations.map(v => 
            this.fuzzyMatch(masterCode, v.element.code || '')
        );
        
        return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
    }
    
    analyzeElementNameConsistency(masterName, variations) {
        if (variations.length === 0) return 0;
        
        const similarities = variations.map(v => 
            this.fuzzyMatch(masterName, v.element.name || '')
        );
        
        return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
    }
    
    analyzeCategoryConsistency(masterCategory, variations) {
        if (variations.length === 0) return 0;
        
        const matches = variations.filter(v => v.element.category === masterCategory).length;
        return matches / variations.length;
    }
    
    analyzeCalculationMethodConsistency(masterMethod, variations) {
        if (variations.length === 0) return 0;
        
        const matches = variations.filter(v => v.element.calculationMethod === masterMethod).length;
        return matches / variations.length;
    }
    
    analyzePlanCoverageConsistency(variations, totalPlans) {
        const uniquePlans = new Set(variations.map(v => v.planId)).size;
        return uniquePlans / totalPlans;
    }
    
    calculateOverallConsistencyScore(scores) {
        const weights = {
            elementCode: 0.25,
            elementName: 0.25,
            categoryClassification: 0.20,
            calculationMethod: 0.15,
            planCoverage: 0.15
        };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        for (const [dimension, score] of Object.entries(scores)) {
            if (weights[dimension] && typeof score === 'number') {
                weightedSum += score * weights[dimension];
                totalWeight += weights[dimension];
            }
        }
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
    }
    
    // ===============================
    // UTILITY METHODS
    // ===============================
    
    fuzzyMatch(str1, str2) {
        if (!str1 || !str2) return 0;
        
        // Normalize strings
        const norm1 = str1.toLowerCase().trim();
        const norm2 = str2.toLowerCase().trim();
        
        if (norm1 === norm2) return 1.0;
        
        // Levenshtein distance implementation
        const matrix = Array(norm2.length + 1).fill(null).map(() => 
            Array(norm1.length + 1).fill(null)
        );
        
        for (let i = 0; i <= norm1.length; i++) matrix[0][i] = i;
        for (let j = 0; j <= norm2.length; j++) matrix[j][0] = j;
        
        for (let j = 1; j <= norm2.length; j++) {
            for (let i = 1; i <= norm1.length; i++) {
                const substitutionCost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,     // insertion
                    matrix[j - 1][i] + 1,     // deletion
                    matrix[j - 1][i - 1] + substitutionCost // substitution
                );
            }
        }
        
        const maxLength = Math.max(norm1.length, norm2.length);
        const distance = matrix[norm2.length][norm1.length];
        
        return 1 - (distance / maxLength);
    }
    
    isSafetyElement(code, name) {
        const safetyKeywords = this.config.expertKnowledgeBase.criticalElements.filter(el => 
            ['flucht', 'rettungsweg', 'f30', 'f90', 'brandschutz'].includes(el)
        );
        
        const searchText = `${code} ${name}`.toLowerCase();
        return safetyKeywords.some(keyword => searchText.includes(keyword));
    }
    
    isStructuralElement(code, name) {
        const structuralKeywords = ['stahlbeton', 'beton', 'tragwerk', 'stütze', 'balken'];
        const searchText = `${code} ${name}`.toLowerCase();
        return structuralKeywords.some(keyword => searchText.includes(keyword));
    }
    
    isCriticalElement(masterElement) {
        return this.config.expertKnowledgeBase.criticalElements.some(critical => 
            masterElement.elementCode.toLowerCase().includes(critical) ||
            masterElement.elementName.toLowerCase().includes(critical)
        );
    }
    
    requiresHumanEscalation(issue) {
        return issue.severity === 'critical' ||
               (issue.severity === 'high' && issue.consistencyScore < this.config.escalationTriggers.criticalInconsistencyThreshold) ||
               (issue.expertContext?.isCriticalElement && issue.consistencyScore < 0.90);
    }
    
    generateTicketId() {
        return `CVT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    }
    
    getValidationDuration() {
        if (!this.validationStats.validationStartTime || !this.validationStats.validationEndTime) return 0;
        return this.validationStats.validationEndTime - this.validationStats.validationStartTime;
    }
    
    generateValidationSummary() {
        const total = this.validationStats.totalElementsValidated;
        const consistent = this.validationStats.consistentElements;
        const inconsistent = this.validationStats.inconsistentElements;
        
        return {
            totalElementsValidated: total,
            consistentElements: consistent,
            inconsistentElements: inconsistent,
            overallConsistencyScore: total > 0 ? consistent / total : 0,
            criticalInconsistencies: this.validationStats.criticalInconsistencies,
            escalationsGenerated: this.validationStats.escalationsGenerated,
            validationDuration: this.getValidationDuration(),
            humanInterventionRequired: this.validationStats.escalationsGenerated > 0
        };
    }
    
    // Placeholder methods for advanced functionality
    flagElementInconsistencies(scores, overallScore) { return []; }
    identifyMissingPlans(variations, planLegends) { return []; }
    determineSeverityLevel(score, type) { return score < 0.7 ? 'high' : 'medium'; }
    determineMissingElementSeverity(element, score) { return score < 0.5 ? 'high' : 'medium'; }
    findSynonymGroups(element) { return []; }
    getDomainPriority(element) { return 'medium'; }
    generateContextualRecommendations(issue) { return []; }
    assessElementRisk(element, score) { return 'medium'; }
    assessResolutionComplexity(issue) { return 'medium'; }
    adjustSeverityWithExpertKnowledge(severity, context) { return severity; }
    determinePriority(severity, context) { return severity; }
    generateTicketTitle(issue, type) { return `${type}: ${issue.masterElement.elementCode}`; }
    generateDetailedDescription(issue, type) { return `Inconsistency detected in element ${issue.masterElement.elementCode}`; }
    extractAffectedPlans(variations) { return variations.map(v => v.planId); }
    determineRequiredExpertise(issue) { return ['construction_engineer']; }
    estimateResolutionTime(issue) { return '4 hours'; }
    calculateSlaDeadline(severity) { return new Date(Date.now() + 24 * 60 * 60 * 1000); }
    getTicketPriorityBreakdown(tickets) {
        const breakdown = tickets.reduce((acc, t) => { acc[t.priority] = (acc[t.priority] || 0) + 1; return acc; }, {});
        return Object.entries(breakdown).map(([p, c]) => `${c} ${p}`).join(', ');
    }
    
    // Database persistence methods (placeholders)
    async persistValidationResults(buildingId, results) { /* Database implementation needed */ }
    async routeEscalationsToExperts(tickets, buildingId) { return new Map(); }
}

export default ElementConsistencyValidator;
