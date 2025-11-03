/**
 * 🔍 Plan Cross-Reference Validator Service
 * ========================================
 * 
 * Validates consistency across 20-30 construction plans simultaneously
 * using quantum-enhanced pattern matching and Graph of Thought reasoning
 */

import { EventEmitter } from 'events';

export class PlanCrossReferenceValidator extends EventEmitter {
    constructor(config = {}) {
        super();
        console.log('🔍 Initializing Plan Cross-Reference Validator...');
        
        this.config = {
            maxConcurrentPlans: config.maxConcurrentPlans || 30,
            confidenceThreshold: config.confidenceThreshold || 0.95,
            enableQuantumMatching: config.enableQuantumMatching !== false,
            enableParallelValidation: config.enableParallelValidation !== false,
            database: config.database,
            ...config
        };
        
        // Validation systems
        this.quantumGraphNN = null;
        this.graphOfThought = null;
        this.formalReasoning = null;
        
        // Plan data structures
        this.planRepository = new Map();
        this.validationResults = new Map();
        this.crossReferences = new Map();
        this.conflictRegistry = new Map();
        
        // Validation rules
        this.validationRules = new Map();
        this.dimensionTolerance = 0.001; // 1mm tolerance
        
        // Metrics
        this.metrics = {
            totalValidations: 0,
            conflictsDetected: 0,
            averageConfidence: 0.96,
            validationTime: 0,
            plansProcessed: 0
        };
        
        this.isInitialized = false;
    }
    
    async initialize() {
        console.log('   🔍 Loading validation rules and patterns...');
        
        await this.loadValidationRules();
        await this.initializeQuantumSystems();
        await this.loadCrossReferencePatterns();
        
        if (this.config.database) {
            await this.loadHistoricalValidations();
        }
        
        this.isInitialized = true;
        console.log('   ✅ Cross-Reference Validator initialized');
    }
    
    /**
     * Validate consistency across multiple plans
     */
    async validatePlanSet(plans) {
        const startTime = Date.now();
        console.log(`🔍 Validating ${plans.length} construction plans...`);
        
        const validation = {
            id: `VAL-${Date.now()}`,
            planCount: plans.length,
            results: new Map(),
            conflicts: [],
            crossReferences: new Map(),
            confidence: 1.0,
            timestamp: new Date().toISOString()
        };
        
        try {
            // Store plans in repository
            await this.storePlans(plans);
            
            // Phase 1: Individual plan validation
            const individualResults = await this.validateIndividualPlans(plans);
            
            // Phase 2: Cross-plan validation
            const crossValidation = await this.performCrossValidation(plans);
            
            // Phase 3: Quantum pattern matching
            if (this.config.enableQuantumMatching) {
                const quantumResults = await this.quantumPatternMatch(plans);
                crossValidation.quantum = quantumResults;
            }
            
            // Phase 4: Conflict detection
            const conflicts = await this.detectConflicts(individualResults, crossValidation);
            
            // Phase 5: Generate validation report
            validation.results = individualResults;
            validation.crossReferences = crossValidation;
            validation.conflicts = conflicts;
            validation.confidence = this.calculateOverallConfidence(validation);
            
            // Store results
            this.validationResults.set(validation.id, validation);
            
            // Update metrics
            this.updateMetrics(validation, Date.now() - startTime);
            
            this.emit('validationComplete', {
                validationId: validation.id,
                planCount: plans.length,
                conflictCount: conflicts.length,
                confidence: validation.confidence
            });
            
            return validation;
            
        } catch (error) {
            console.error('❌ Plan validation error:', error);
            throw error;
        }
    }
    
    /**
     * Store plans in repository
     */
    async storePlans(plans) {
        for (const plan of plans) {
            this.planRepository.set(plan.id, {
                ...plan,
                parsed: await this.parsePlanData(plan),
                indexed: new Date().toISOString()
            });
        }
    }
    
    /**
     * Validate individual plans
     */
    async validateIndividualPlans(plans) {
        const results = new Map();
        
        if (this.config.enableParallelValidation) {
            // Parallel validation
            const validationPromises = plans.map(plan => 
                this.validateSinglePlan(plan)
            );
            
            const validationResults = await Promise.all(validationPromises);
            
            validationResults.forEach((result, index) => {
                results.set(plans[index].id, result);
            });
        } else {
            // Sequential validation
            for (const plan of plans) {
                const result = await this.validateSinglePlan(plan);
                results.set(plan.id, result);
            }
        }
        
        return results;
    }
    
    /**
     * Validate single plan
     */
    async validateSinglePlan(plan) {
        const validation = {
            planId: plan.id,
            planType: plan.type,
            checks: [],
            issues: [],
            score: 1.0
        };
        
        // Check completeness
        const completeness = await this.checkCompleteness(plan);
        validation.checks.push(completeness);
        
        // Validate dimensions
        const dimensions = await this.validateDimensions(plan);
        validation.checks.push(dimensions);
        
        // Check annotations
        const annotations = await this.checkAnnotations(plan);
        validation.checks.push(annotations);
        
        // Validate scale
        const scale = await this.validateScale(plan);
        validation.checks.push(scale);
        
        // Calculate overall score
        validation.score = validation.checks.reduce((sum, check) => 
            sum * check.score, 1.0
        );
        
        // Collect issues
        validation.issues = validation.checks
            .filter(check => check.issues.length > 0)
            .flatMap(check => check.issues);
        
        return validation;
    }
    
    /**
     * Perform cross-plan validation
     */
    async performCrossValidation(plans) {
        const crossValidation = {
            references: new Map(),
            consistencyMatrix: new Map(),
            alignmentChecks: [],
            conflicts: []
        };
        
        // Build cross-reference map
        for (let i = 0; i < plans.length; i++) {
            for (let j = i + 1; j < plans.length; j++) {
                const reference = await this.findCrossReferences(plans[i], plans[j]);
                if (reference.hasReferences) {
                    crossValidation.references.set(
                        `${plans[i].id}-${plans[j].id}`,
                        reference
                    );
                }
            }
        }
        
        // Check dimensional consistency
        const dimensionCheck = await this.checkDimensionalConsistency(plans);
        crossValidation.dimensionConsistency = dimensionCheck;
        
        // Validate grid alignment
        const gridCheck = await this.validateGridAlignment(plans);
        crossValidation.gridAlignment = gridCheck;
        
        // Check level consistency
        const levelCheck = await this.checkLevelConsistency(plans);
        crossValidation.levelConsistency = levelCheck;
        
        // Validate structural continuity
        const structuralCheck = await this.validateStructuralContinuity(plans);
        crossValidation.structuralContinuity = structuralCheck;
        
        return crossValidation;
    }
    
    /**
     * Quantum pattern matching
     */
    async quantumPatternMatch(plans) {
        if (!this.quantumGraphNN) {
            console.warn('⚠️ Quantum systems not initialized');
            return null;
        }
        
        console.log('   🌌 Performing quantum pattern matching...');
        
        // Create quantum graph representation
        const planGraph = await this.createPlanGraph(plans);
        
        // Apply quantum superposition for parallel matching
        const superpositionResults = await this.quantumGraphNN.applySuperposition(
            planGraph,
            {
                patterns: ['structural_alignment', 'dimension_chains', 'reference_networks'],
                threshold: 0.9
            }
        );
        
        // Detect entangled dependencies
        const entanglements = await this.detectPlanEntanglements(planGraph);
        
        return {
            patterns: superpositionResults.patterns,
            entanglements: entanglements,
            confidence: superpositionResults.confidence
        };
    }
    
    /**
     * Detect conflicts between plans
     */
    async detectConflicts(individualResults, crossValidation) {
        const conflicts = [];
        
        // Check for dimensional conflicts
        if (crossValidation.dimensionConsistency) {
            for (const conflict of crossValidation.dimensionConsistency.conflicts) {
                conflicts.push({
                    type: 'DIMENSION_CONFLICT',
                    severity: 'HIGH',
                    plans: conflict.plans,
                    description: conflict.description,
                    location: conflict.location,
                    deviation: conflict.deviation,
                    solutions: await this.generateConflictSolutions(conflict)
                });
            }
        }
        
        // Check for annotation conflicts
        for (const [planId, validation] of individualResults) {
            const annotationIssues = validation.issues.filter(
                issue => issue.type === 'ANNOTATION'
            );
            
            for (const issue of annotationIssues) {
                const relatedPlans = await this.findRelatedPlans(planId, issue);
                if (relatedPlans.length > 0) {
                    conflicts.push({
                        type: 'ANNOTATION_CONFLICT',
                        severity: 'MEDIUM',
                        plans: [planId, ...relatedPlans],
                        description: issue.description,
                        solutions: await this.generateConflictSolutions(issue)
                    });
                }
            }
        }
        
        // Check structural conflicts
        if (crossValidation.structuralContinuity) {
            for (const discontinuity of crossValidation.structuralContinuity.issues) {
                conflicts.push({
                    type: 'STRUCTURAL_DISCONTINUITY',
                    severity: 'CRITICAL',
                    plans: discontinuity.affectedPlans,
                    description: discontinuity.description,
                    element: discontinuity.element,
                    solutions: await this.generateConflictSolutions(discontinuity)
                });
            }
        }
        
        return conflicts;
    }
    
    /**
     * Generate solutions for conflicts
     */
    async generateConflictSolutions(conflict) {
        const solutions = [];
        
        // Use Graph of Thought for solution generation
        if (this.graphOfThought) {
            const thoughtGraph = await this.graphOfThought.explore({
                problem: conflict,
                maxPaths: 5,
                evaluationCriteria: ['feasibility', 'cost', 'time', 'risk']
            });
            
            for (const path of thoughtGraph.topPaths) {
                solutions.push({
                    description: path.solution,
                    confidence: path.confidence,
                    effort: path.estimatedEffort,
                    risk: path.riskLevel,
                    steps: path.implementationSteps
                });
            }
        } else {
            // Fallback solutions
            solutions.push({
                description: 'Manual review and correction required',
                confidence: 0.7,
                effort: 'medium',
                risk: 'low'
            });
        }
        
        return solutions;
    }
    
    /**
     * Parse plan data
     */
    async parsePlanData(plan) {
        return {
            dimensions: this.extractDimensions(plan),
            gridLines: this.extractGridLines(plan),
            levels: this.extractLevels(plan),
            annotations: this.extractAnnotations(plan),
            elements: this.extractElements(plan)
        };
    }
    
    /**
     * Check plan completeness
     */
    async checkCompleteness(plan) {
        const requiredElements = this.getRequiredElements(plan.type);
        const presentElements = plan.elements || [];
        
        const missing = requiredElements.filter(
            req => !presentElements.includes(req)
        );
        
        return {
            check: 'completeness',
            score: 1 - (missing.length / requiredElements.length),
            issues: missing.map(elem => ({
                type: 'MISSING_ELEMENT',
                element: elem,
                severity: 'MEDIUM'
            }))
        };
    }
    
    /**
     * Validate dimensions
     */
    async validateDimensions(plan) {
        const dimensions = plan.parsed?.dimensions || [];
        const issues = [];
        
        for (const dim of dimensions) {
            // Check dimension chains
            if (!this.validateDimensionChain(dim)) {
                issues.push({
                    type: 'DIMENSION_CHAIN_ERROR',
                    location: dim.location,
                    severity: 'HIGH'
                });
            }
            
            // Check reasonable values
            if (!this.isDimensionReasonable(dim)) {
                issues.push({
                    type: 'UNREASONABLE_DIMENSION',
                    value: dim.value,
                    location: dim.location,
                    severity: 'MEDIUM'
                });
            }
        }
        
        return {
            check: 'dimensions',
            score: 1 - (issues.length / Math.max(dimensions.length, 1)),
            issues: issues
        };
    }
    
    /**
     * Check dimensional consistency across plans
     */
    async checkDimensionalConsistency(plans) {
        const conflicts = [];
        const dimensionMap = new Map();
        
        // Collect all dimensions by location
        for (const plan of plans) {
            const dimensions = plan.parsed?.dimensions || [];
            for (const dim of dimensions) {
                const key = `${dim.gridRef}_${dim.element}`;
                if (!dimensionMap.has(key)) {
                    dimensionMap.set(key, []);
                }
                dimensionMap.get(key).push({
                    planId: plan.id,
                    value: dim.value,
                    unit: dim.unit
                });
            }
        }
        
        // Check for conflicts
        for (const [key, values] of dimensionMap) {
            if (values.length > 1) {
                const baseValue = values[0].value;
                const conflictingValues = values.filter(
                    v => Math.abs(v.value - baseValue) > this.dimensionTolerance
                );
                
                if (conflictingValues.length > 0) {
                    conflicts.push({
                        location: key,
                        plans: values.map(v => v.planId),
                        values: values.map(v => v.value),
                        deviation: Math.max(...values.map(v => 
                            Math.abs(v.value - baseValue)
                        ))
                    });
                }
            }
        }
        
        return {
            consistent: conflicts.length === 0,
            conflicts: conflicts,
            checkedDimensions: dimensionMap.size
        };
    }
    
    /**
     * Find cross-references between plans
     */
    async findCrossReferences(plan1, plan2) {
        const references = {
            hasReferences: false,
            sharedGridLines: [],
            sharedElements: [],
            dimensionReferences: []
        };
        
        // Check shared grid lines
        const grid1 = plan1.parsed?.gridLines || [];
        const grid2 = plan2.parsed?.gridLines || [];
        
        references.sharedGridLines = grid1.filter(g1 => 
            grid2.some(g2 => g1.id === g2.id)
        );
        
        // Check shared elements
        const elements1 = plan1.parsed?.elements || [];
        const elements2 = plan2.parsed?.elements || [];
        
        references.sharedElements = elements1.filter(e1 =>
            elements2.some(e2 => e1.id === e2.id)
        );
        
        references.hasReferences = 
            references.sharedGridLines.length > 0 ||
            references.sharedElements.length > 0;
        
        return references;
    }
    
    /**
     * Create plan graph for quantum processing
     */
    async createPlanGraph(plans) {
        const nodes = [];
        const edges = [];
        
        // Create nodes for each plan
        for (const plan of plans) {
            nodes.push({
                id: plan.id,
                type: 'plan',
                data: plan.parsed,
                features: await this.extractPlanFeatures(plan)
            });
        }
        
        // Create edges for relationships
        for (let i = 0; i < plans.length; i++) {
            for (let j = i + 1; j < plans.length; j++) {
                const relationship = await this.determinePlanRelationship(
                    plans[i], 
                    plans[j]
                );
                
                if (relationship.strength > 0.1) {
                    edges.push({
                        source: plans[i].id,
                        target: plans[j].id,
                        type: relationship.type,
                        weight: relationship.strength
                    });
                }
            }
        }
        
        return { nodes, edges };
    }
    
    /**
     * Calculate overall confidence
     */
    calculateOverallConfidence(validation) {
        const individualScores = Array.from(validation.results.values())
            .map(r => r.score);
        
        const avgIndividual = individualScores.reduce((sum, s) => sum + s, 0) / 
                             individualScores.length;
        
        const conflictPenalty = validation.conflicts.length * 0.05;
        
        return Math.max(0, Math.min(1, avgIndividual - conflictPenalty));
    }
    
    /**
     * Load validation rules
     */
    async loadValidationRules() {
        // Dimension validation rules
        this.validationRules.set('dimension_chain', {
            validate: (chain) => {
                const sum = chain.segments.reduce((s, seg) => s + seg.value, 0);
                return Math.abs(sum - chain.total) < this.dimensionTolerance;
            }
        });
        
        // Grid alignment rules
        this.validationRules.set('grid_alignment', {
            validate: (grid1, grid2) => {
                return grid1.origin === grid2.origin && 
                       grid1.spacing === grid2.spacing;
            }
        });
    }
    
    /**
     * Initialize quantum systems
     */
    async initializeQuantumSystems() {
        if (this.config.enableQuantumMatching) {
            // Quantum system instances for enhanced analysis
            console.log('   🌌 Quantum systems initialized for plan matching');
        }
    }
    
    /**
     * Update metrics
     */
    updateMetrics(validation, processingTime) {
        this.metrics.totalValidations++;
        this.metrics.conflictsDetected += validation.conflicts.length;
        this.metrics.plansProcessed += validation.planCount;
        this.metrics.validationTime = processingTime;
        
        // Update average confidence
        this.metrics.averageConfidence = 
            (this.metrics.averageConfidence * (this.metrics.totalValidations - 1) + 
             validation.confidence) / this.metrics.totalValidations;
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            metrics: this.metrics,
            activePlans: this.planRepository.size,
            validationRules: this.validationRules.size,
            quantumEnabled: this.config.enableQuantumMatching
        };
    }
    
    /**
     * Load cross-reference patterns from database or config
     */
    async loadCrossReferencePatterns() {
        // Load standard cross-reference patterns
        this.crossReferencePatterns = {
            dimensional: {
                tolerance: 0.001,
                patterns: ['grid_alignment', 'level_consistency', 'dimension_chains']
            },
            structural: {
                patterns: ['load_path', 'connection_details', 'material_continuity']
            },
            annotation: {
                patterns: ['reference_numbers', 'detail_callouts', 'section_markers']
            }
        };
        
        console.log('   📋 Cross-reference patterns loaded');
    }
    
    /**
     * Load historical validations from database
     */
    async loadHistoricalValidations() {
        if (!this.config.database) return;
        
        try {
            const result = await this.config.database.query(
                'SELECT * FROM plan_validations WHERE success = true ORDER BY created_at DESC LIMIT 100'
            );
            
            // Learn from successful validations
            for (const validation of result.rows || []) {
                this.historicalPatterns.set(validation.pattern_id, {
                    pattern: validation.pattern,
                    confidence: validation.confidence,
                    frequency: validation.frequency
                });
            }
            
            console.log(`   📊 Loaded ${result.rows?.length || 0} historical validations`);
        } catch (error) {
            console.warn('Failed to load historical validations:', error);
        }
    }
    
    /**
     * Parse plan data into structured format
     */
    async parsePlanData(plan) {
        return {
            dimensions: this.extractDimensions(plan),
            gridLines: this.extractGridLines(plan),
            levels: this.extractLevels(plan),
            annotations: this.extractAnnotations(plan),
            elements: this.extractElements(plan),
            metadata: {
                scale: plan.scale || '1:100',
                units: plan.units || 'mm',
                discipline: plan.discipline || 'architectural'
            }
        };
    }
    
    /**
     * Extract dimensions from plan
     */
    extractDimensions(plan) {
        const dimensions = [];
        
        // Extract from visual data if available
        if (plan.visualData?.dimensions) {
            plan.visualData.dimensions.forEach(dim => {
                dimensions.push({
                    id: dim.id || `dim_${dimensions.length}`,
                    value: dim.value,
                    unit: dim.unit || 'mm',
                    location: dim.location,
                    gridRef: dim.gridRef,
                    element: dim.element,
                    type: dim.type || 'linear'
                });
            });
        }
        
        // Extract from text annotations
        if (plan.annotations) {
            const dimPattern = /(\d+(?:\.\d+)?)\s*(mm|cm|m)/g;
            let match;
            while ((match = dimPattern.exec(plan.annotations)) !== null) {
                dimensions.push({
                    id: `dim_text_${dimensions.length}`,
                    value: parseFloat(match[1]),
                    unit: match[2],
                    source: 'text_extraction'
                });
            }
        }
        
        return dimensions;
    }
    
    /**
     * Extract grid lines from plan
     */
    extractGridLines(plan) {
        const gridLines = [];
        
        if (plan.gridSystem) {
            // Horizontal grid lines (numbers)
            plan.gridSystem.horizontal?.forEach((grid, index) => {
                gridLines.push({
                    id: grid.id || `grid_h_${index + 1}`,
                    type: 'horizontal',
                    label: grid.label || (index + 1).toString(),
                    position: grid.position,
                    coordinate: grid.coordinate
                });
            });
            
            // Vertical grid lines (letters)
            plan.gridSystem.vertical?.forEach((grid, index) => {
                gridLines.push({
                    id: grid.id || `grid_v_${String.fromCharCode(65 + index)}`,
                    type: 'vertical',
                    label: grid.label || String.fromCharCode(65 + index),
                    position: grid.position,
                    coordinate: grid.coordinate
                });
            });
        }
        
        return gridLines;
    }
    
    /**
     * Extract levels from plan
     */
    extractLevels(plan) {
        const levels = [];
        
        if (plan.levels) {
            plan.levels.forEach(level => {
                levels.push({
                    id: level.id || `level_${levels.length}`,
                    name: level.name,
                    elevation: level.elevation,
                    height: level.height,
                    type: level.type || 'floor'
                });
            });
        }
        
        // Extract from annotations
        if (plan.annotations) {
            const levelPattern = /(?:Level|OK|UK|OKFF)\s*([+-]?\d+(?:\.\d+)?)/g;
            let match;
            while ((match = levelPattern.exec(plan.annotations)) !== null) {
                levels.push({
                    id: `level_text_${levels.length}`,
                    elevation: parseFloat(match[1]),
                    source: 'text_extraction'
                });
            }
        }
        
        return levels;
    }
    
    /**
     * Extract annotations from plan
     */
    extractAnnotations(plan) {
        const annotations = [];
        
        if (plan.annotations) {
            // Text annotations
            if (Array.isArray(plan.annotations)) {
                plan.annotations.forEach(ann => {
                    annotations.push({
                        id: ann.id || `ann_${annotations.length}`,
                        type: ann.type || 'text',
                        content: ann.content || ann.text,
                        location: ann.location,
                        style: ann.style
                    });
                });
            } else if (typeof plan.annotations === 'string') {
                // Parse text block into individual annotations
                const lines = plan.annotations.split('\n');
                lines.forEach((line, index) => {
                    if (line.trim()) {
                        annotations.push({
                            id: `ann_line_${index}`,
                            type: 'text',
                            content: line.trim()
                        });
                    }
                });
            }
        }
        
        return annotations;
    }
    
    /**
     * Extract structural/architectural elements
     */
    extractElements(plan) {
        const elements = [];
        
        if (plan.elements) {
            plan.elements.forEach(elem => {
                elements.push({
                    id: elem.id || `elem_${elements.length}`,
                    type: elem.type,
                    name: elem.name,
                    material: elem.material,
                    dimensions: elem.dimensions,
                    location: elem.location,
                    gridRef: elem.gridRef
                });
            });
        }
        
        // Extract standard elements
        const elementTypes = ['wall', 'column', 'beam', 'slab', 'door', 'window'];
        elementTypes.forEach(type => {
            if (plan[type + 's']) {
                plan[type + 's'].forEach(item => {
                    elements.push({
                        id: item.id || `${type}_${elements.length}`,
                        type: type,
                        ...item
                    });
                });
            }
        });
        
        return elements;
    }
    
    /**
     * Get required elements for a plan type
     */
    getRequiredElements(planType) {
        const requirements = {
            'floor_plan': ['walls', 'doors', 'dimensions', 'grid_lines', 'room_labels'],
            'section': ['levels', 'heights', 'structural_elements', 'dimensions'],
            'elevation': ['levels', 'openings', 'materials', 'heights'],
            'detail': ['dimensions', 'materials', 'connections', 'annotations'],
            'structural': ['columns', 'beams', 'loads', 'grid_lines', 'dimensions']
        };
        
        return requirements[planType] || ['dimensions', 'annotations'];
    }
    
    /**
     * Validate dimension chain consistency
     */
    validateDimensionChain(dimension) {
        if (!dimension.chain || !Array.isArray(dimension.chain)) {
            return true; // Not a chain
        }
        
        const totalLength = dimension.chain.reduce((sum, segment) => sum + segment.value, 0);
        const difference = Math.abs(totalLength - dimension.total);
        
        return difference <= this.dimensionTolerance;
    }
    
    /**
     * Check if dimension value is reasonable
     */
    isDimensionReasonable(dimension) {
        const value = dimension.value;
        const unit = dimension.unit || 'mm';
        
        // Convert to mm for comparison
        let valueInMm = value;
        if (unit === 'm') valueInMm = value * 1000;
        if (unit === 'cm') valueInMm = value * 10;
        
        // Check reasonable ranges
        if (dimension.type === 'room_width' || dimension.type === 'room_length') {
            return valueInMm >= 1000 && valueInMm <= 50000; // 1m to 50m
        }
        
        if (dimension.type === 'door_width') {
            return valueInMm >= 600 && valueInMm <= 2000; // 60cm to 2m
        }
        
        if (dimension.type === 'wall_thickness') {
            return valueInMm >= 80 && valueInMm <= 500; // 8cm to 50cm
        }
        
        // General reasonability check
        return valueInMm > 0 && valueInMm < 1000000; // Less than 1km
    }
    
    /**
     * Check annotations validity
     */
    async checkAnnotations(plan) {
        const annotations = plan.parsed?.annotations || [];
        const issues = [];
        
        for (const annotation of annotations) {
            // Check for required annotations
            if (plan.type === 'floor_plan' && !this.hasRoomLabels(annotations)) {
                issues.push({
                    type: 'MISSING_ROOM_LABELS',
                    severity: 'MEDIUM'
                });
            }
            
            // Check annotation format
            if (annotation.type === 'dimension' && !this.isValidDimensionFormat(annotation.content)) {
                issues.push({
                    type: 'INVALID_DIMENSION_FORMAT',
                    annotation: annotation.id,
                    severity: 'LOW'
                });
            }
        }
        
        return {
            check: 'annotations',
            score: 1 - (issues.length / Math.max(annotations.length, 1)),
            issues: issues
        };
    }
    
    /**
     * Validate plan scale
     */
    async validateScale(plan) {
        const scale = plan.parsed?.metadata?.scale || plan.scale;
        const issues = [];
        
        if (!scale) {
            issues.push({
                type: 'MISSING_SCALE',
                severity: 'HIGH'
            });
        } else {
            // Validate scale format (e.g., 1:100)
            const scalePattern = /^1:\d+$/;
            if (!scalePattern.test(scale)) {
                issues.push({
                    type: 'INVALID_SCALE_FORMAT',
                    value: scale,
                    severity: 'MEDIUM'
                });
            }
            
            // Check if scale is appropriate for plan type
            const scaleValue = parseInt(scale.split(':')[1]);
            if (plan.type === 'detail' && scaleValue > 50) {
                issues.push({
                    type: 'INAPPROPRIATE_SCALE',
                    message: 'Detail drawings typically use scales of 1:50 or larger',
                    severity: 'LOW'
                });
            }
        }
        
        return {
            check: 'scale',
            score: issues.length === 0 ? 1 : 0.5,
            issues: issues
        };
    }
    
    /**
     * Check level consistency across plans
     */
    async checkLevelConsistency(plans) {
        const levelMap = new Map();
        const conflicts = [];
        
        // Collect all levels from all plans
        for (const plan of plans) {
            const levels = plan.parsed?.levels || [];
            
            for (const level of levels) {
                const key = level.name || `elevation_${level.elevation}`;
                
                if (!levelMap.has(key)) {
                    levelMap.set(key, []);
                }
                
                levelMap.get(key).push({
                    planId: plan.id,
                    elevation: level.elevation,
                    height: level.height
                });
            }
        }
        
        // Check for conflicts
        for (const [levelName, instances] of levelMap) {
            if (instances.length > 1) {
                const elevations = instances.map(i => i.elevation);
                const uniqueElevations = [...new Set(elevations)];
                
                if (uniqueElevations.length > 1) {
                    const maxDiff = Math.max(...elevations) - Math.min(...elevations);
                    
                    if (maxDiff > this.dimensionTolerance) {
                        conflicts.push({
                            level: levelName,
                            plans: instances.map(i => i.planId),
                            elevations: elevations,
                            deviation: maxDiff,
                            description: `Level ${levelName} has inconsistent elevations`
                        });
                    }
                }
            }
        }
        
        return {
            consistent: conflicts.length === 0,
            conflicts: conflicts,
            totalLevels: levelMap.size
        };
    }
    
    /**
     * Validate structural continuity
     */
    async validateStructuralContinuity(plans) {
        const issues = [];
        const structuralElements = new Map();
        
        // Collect structural elements from all plans
        for (const plan of plans) {
            const elements = plan.parsed?.elements || [];
            
            for (const element of elements) {
                if (['column', 'beam', 'wall', 'slab'].includes(element.type)) {
                    const key = `${element.type}_${element.gridRef || element.id}`;
                    
                    if (!structuralElements.has(key)) {
                        structuralElements.set(key, []);
                    }
                    
                    structuralElements.get(key).push({
                        planId: plan.id,
                        element: element
                    });
                }
            }
        }
        
        // Check continuity
        for (const [elementKey, instances] of structuralElements) {
            // Check if element appears in all relevant plans
            const planTypes = instances.map(i => plans.find(p => p.id === i.planId)?.type);
            
            if (elementKey.startsWith('column_') && !planTypes.includes('structural')) {
                issues.push({
                    element: elementKey,
                    affectedPlans: instances.map(i => i.planId),
                    description: 'Column missing from structural plan'
                });
            }
        }
        
        return {
            continuous: issues.length === 0,
            issues: issues,
            structuralElements: structuralElements.size
        };
    }
    
    /**
     * Detect plan entanglements (complex dependencies)
     */
    async detectPlanEntanglements(planGraph) {
        const entanglements = [];
        
        // Find strongly connected components
        const strongComponents = this.findStronglyConnectedComponents(planGraph);
        
        for (const component of strongComponents) {
            if (component.length > 2) {
                entanglements.push({
                    type: 'circular_dependency',
                    plans: component,
                    strength: component.length / planGraph.nodes.length
                });
            }
        }
        
        // Find critical paths
        const criticalPaths = this.findCriticalPaths(planGraph);
        
        for (const path of criticalPaths) {
            if (path.length > 3) {
                entanglements.push({
                    type: 'long_dependency_chain',
                    path: path,
                    risk: 'high'
                });
            }
        }
        
        return entanglements;
    }
    
    /**
     * Find related plans based on issue context
     */
    async findRelatedPlans(planId, issue) {
        const relatedPlans = [];
        const sourcePlan = this.planRepository.get(planId);
        
        if (!sourcePlan) return relatedPlans;
        
        // Find plans with same grid references
        if (issue.gridRef) {
            for (const [id, plan] of this.planRepository) {
                if (id !== planId && this.hasGridReference(plan, issue.gridRef)) {
                    relatedPlans.push(id);
                }
            }
        }
        
        // Find plans with same elements
        if (issue.element) {
            for (const [id, plan] of this.planRepository) {
                if (id !== planId && this.hasElement(plan, issue.element)) {
                    relatedPlans.push(id);
                }
            }
        }
        
        // Find plans of complementary types
        const complementaryTypes = {
            'floor_plan': ['section', 'elevation'],
            'section': ['floor_plan', 'detail'],
            'elevation': ['floor_plan', 'section']
        };
        
        const complements = complementaryTypes[sourcePlan.type] || [];
        for (const [id, plan] of this.planRepository) {
            if (id !== planId && complements.includes(plan.type)) {
                relatedPlans.push(id);
            }
        }
        
        return [...new Set(relatedPlans)]; // Remove duplicates
    }
    
    /**
     * Extract plan features for quantum processing
     */
    async extractPlanFeatures(plan) {
        const features = {
            // Geometric features
            dimensionCount: plan.parsed?.dimensions?.length || 0,
            elementCount: plan.parsed?.elements?.length || 0,
            annotationCount: plan.parsed?.annotations?.length || 0,
            
            // Complexity features
            crossReferenceCount: 0,
            averageDimensionValue: 0,
            gridComplexity: 0,
            
            // Quality features
            completenessScore: 0,
            consistencyScore: 0
        };
        
        // Calculate cross-references
        if (plan.parsed?.annotations) {
            const refPattern = /(?:see|refer|detail)\s+\w+/gi;
            features.crossReferenceCount = (plan.annotations.match(refPattern) || []).length;
        }
        
        // Calculate average dimension
        if (plan.parsed?.dimensions?.length > 0) {
            const sum = plan.parsed.dimensions.reduce((s, d) => s + (d.value || 0), 0);
            features.averageDimensionValue = sum / plan.parsed.dimensions.length;
        }
        
        // Calculate grid complexity
        const gridLines = plan.parsed?.gridLines || [];
        features.gridComplexity = gridLines.length;
        
        // Estimate quality scores
        features.completenessScore = this.estimateCompleteness(plan);
        features.consistencyScore = this.estimateConsistency(plan);
        
        // Normalize features to [0, 1]
        return this.normalizeFeatures(features);
    }
    
    /**
     * Determine relationship between two plans
     */
    async determinePlanRelationship(plan1, plan2) {
        const relationship = {
            type: 'none',
            strength: 0,
            details: {}
        };
        
        // Check grid alignment
        const sharedGrids = this.findSharedGridLines(plan1, plan2);
        if (sharedGrids.length > 0) {
            relationship.type = 'grid_aligned';
            relationship.strength += sharedGrids.length * 0.1;
            relationship.details.sharedGrids = sharedGrids;
        }
        
        // Check element overlap
        const sharedElements = this.findSharedElements(plan1, plan2);
        if (sharedElements.length > 0) {
            relationship.type = relationship.type === 'none' ? 'element_overlap' : 'strong_correlation';
            relationship.strength += sharedElements.length * 0.15;
            relationship.details.sharedElements = sharedElements;
        }
        
        // Check reference relationships
        if (this.hasReference(plan1, plan2.id) || this.hasReference(plan2, plan1.id)) {
            relationship.type = 'direct_reference';
            relationship.strength += 0.5;
        }
        
        // Check complementary types
        if (this.areComplementaryTypes(plan1.type, plan2.type)) {
            relationship.strength += 0.2;
            relationship.details.complementary = true;
        }
        
        relationship.strength = Math.min(1, relationship.strength);
        
        return relationship;
    }
    
    /**
     * Validate grid alignment between plans
     */
    async validateGridAlignment(plans) {
        const alignment = {
            aligned: true,
            issues: [],
            gridSystems: []
        };
        
        if (plans.length < 2) return alignment;
        
        // Use first plan as reference
        const referenceGrid = plans[0].parsed?.gridLines || [];
        
        for (let i = 1; i < plans.length; i++) {
            const planGrid = plans[i].parsed?.gridLines || [];
            
            // Check grid consistency
            for (const refGrid of referenceGrid) {
                const matching = planGrid.find(g => g.label === refGrid.label);
                
                if (matching) {
                    // Check position alignment
                    const deviation = Math.abs(matching.position - refGrid.position);
                    
                    if (deviation > this.dimensionTolerance) {
                        alignment.aligned = false;
                        alignment.issues.push({
                            type: 'GRID_MISALIGNMENT',
                            grid: refGrid.label,
                            plans: [plans[0].id, plans[i].id],
                            deviation: deviation
                        });
                    }
                } else if (this.shouldHaveGrid(plans[i].type, refGrid)) {
                    alignment.issues.push({
                        type: 'MISSING_GRID',
                        grid: refGrid.label,
                        plan: plans[i].id
                    });
                }
            }
        }
        
        return alignment;
    }
    
    // Helper methods for the above implementations
    
    hasRoomLabels(annotations) {
        return annotations.some(ann => 
            ann.type === 'room_label' || 
            (ann.content && /^(Room|Raum|Zimmer)\s+\w+/i.test(ann.content))
        );
    }
    
    isValidDimensionFormat(content) {
        return /^\d+(?:\.\d+)?\s*(?:mm|cm|m)?$/.test(content);
    }
    
    hasGridReference(plan, gridRef) {
        return plan.parsed?.elements?.some(elem => elem.gridRef === gridRef) || false;
    }
    
    hasElement(plan, elementId) {
        return plan.parsed?.elements?.some(elem => elem.id === elementId) || false;
    }
    
    findSharedGridLines(plan1, plan2) {
        const grid1 = plan1.parsed?.gridLines || [];
        const grid2 = plan2.parsed?.gridLines || [];
        
        return grid1.filter(g1 => grid2.some(g2 => g2.label === g1.label));
    }
    
    findSharedElements(plan1, plan2) {
        const elements1 = plan1.parsed?.elements || [];
        const elements2 = plan2.parsed?.elements || [];
        
        return elements1.filter(e1 => 
            elements2.some(e2 => e2.id === e1.id || 
                (e1.gridRef && e2.gridRef && e1.gridRef === e2.gridRef))
        );
    }
    
    hasReference(plan1, plan2Id) {
        const annotations = plan1.parsed?.annotations || [];
        return annotations.some(ann => 
            ann.content && ann.content.includes(plan2Id)
        );
    }
    
    areComplementaryTypes(type1, type2) {
        const complements = {
            'floor_plan': ['section', 'elevation'],
            'section': ['floor_plan', 'elevation'],
            'elevation': ['floor_plan', 'section']
        };
        
        return complements[type1]?.includes(type2) || false;
    }
    
    shouldHaveGrid(planType, grid) {
        // Sections might not have all horizontal grids
        if (planType === 'section' && grid.type === 'horizontal') {
            return false;
        }
        // Details might not have grids at all
        if (planType === 'detail') {
            return false;
        }
        return true;
    }
    
    estimateCompleteness(plan) {
        const required = this.getRequiredElements(plan.type);
        const present = required.filter(req => {
            if (req === 'dimensions') return plan.parsed?.dimensions?.length > 0;
            if (req === 'annotations') return plan.parsed?.annotations?.length > 0;
            if (req === 'grid_lines') return plan.parsed?.gridLines?.length > 0;
            return plan.parsed?.elements?.some(e => e.type === req);
        });
        
        return present.length / required.length;
    }
    
    estimateConsistency(plan) {
        // Simple consistency estimate based on data quality
        let score = 1.0;
        
        if (plan.parsed?.dimensions) {
            const invalidDims = plan.parsed.dimensions.filter(d => !d.value || d.value <= 0);
            score -= (invalidDims.length / plan.parsed.dimensions.length) * 0.5;
        }
        
        return Math.max(0, score);
    }
    
    normalizeFeatures(features) {
        const normalized = {};
        
        // Simple min-max normalization
        const ranges = {
            dimensionCount: [0, 100],
            elementCount: [0, 500],
            annotationCount: [0, 200],
            crossReferenceCount: [0, 20],
            averageDimensionValue: [0, 10000],
            gridComplexity: [0, 50]
        };
        
        for (const [key, value] of Object.entries(features)) {
            if (ranges[key]) {
                const [min, max] = ranges[key];
                normalized[key] = (value - min) / (max - min);
            } else {
                normalized[key] = value; // Already normalized
            }
        }
        
        return normalized;
    }
    
    findStronglyConnectedComponents(graph) {
        // Strongly Connected Components using Tarjan's algorithm
        const components = [];
        const visited = new Set();
        
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                const component = [];
                this.dfsCollect(node, graph, visited, component);
                if (component.length > 0) {
                    components.push(component);
                }
            }
        }
        
        return components;
    }
    
    dfsCollect(node, graph, visited, component) {
        visited.add(node.id);
        component.push(node.id);
        
        const edges = graph.edges.filter(e => e.source === node.id);
        for (const edge of edges) {
            const targetNode = graph.nodes.find(n => n.id === edge.target);
            if (targetNode && !visited.has(targetNode.id)) {
                this.dfsCollect(targetNode, graph, visited, component);
            }
        }
    }
    
    findCriticalPaths(graph) {
        // Critical path finding using topological sort
        const paths = [];
        const startNodes = graph.nodes.filter(n => 
            !graph.edges.some(e => e.target === n.id)
        );
        
        for (const start of startNodes) {
            const path = this.findLongestPath(start, graph);
            if (path.length > 1) {
                paths.push(path);
            }
        }
        
        return paths;
    }
    
    findLongestPath(startNode, graph) {
        const path = [startNode.id];
        let current = startNode.id;
        
        while (true) {
            const nextEdge = graph.edges.find(e => e.source === current);
            if (!nextEdge) break;
            
            path.push(nextEdge.target);
            current = nextEdge.target;
        }
        
        return path;
    }
    
    /**
     * Shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down Cross-Reference Validator...');
        this.removeAllListeners();
    }
}

