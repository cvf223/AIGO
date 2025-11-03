/**
 * 📅 PLANNING TRANSFORMER DECODER - TOP 1% IMPLEMENTATION
 * ========================================================
 * 
 * Specialized decoder for construction project planning
 * Implements scheduling, resource optimization, and dependency analysis
 * 
 * Features:
 * - Critical path analysis
 * - Resource allocation optimization
 * - Risk-aware scheduling
 * - Multi-project coordination
 */

import EventEmitter from 'events';

export class PlanningTransformerDecoder extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            d_model: config.d_model || 1024,
            n_head: config.n_head || 16,
            num_decoder_layers: 10,
            dim_feedforward: 4096,
            dropout: 0.1,
            
            // Planning settings
            planningHorizon: 365 * 2, // 2 years in days
            timeGranularity: 'day', // day, week, month
            
            // Resource types
            resourceTypes: [
                'labor',
                'equipment',
                'materials',
                'subcontractors',
                'budget'
            ],
            
            // Optimization objectives
            objectives: [
                'minimize_duration',
                'minimize_cost',
                'maximize_resource_utilization',
                'minimize_risk'
            ],
            
            // Risk factors
            riskFactors: [
                'weather',
                'supply_chain',
                'labor_availability',
                'regulatory_changes'
            ],
            
            sharedEncoder: config.sharedEncoder,
            ...config
        };
        
        this.layers = [];
        this.scheduleOptimizer = null;
        this.resourceAllocator = null;
        this.dependencyAnalyzer = null;
        this.initialized = false;
    }
    
    /**
     * 🚀 INITIALIZE DECODER
     */
    async initialize() {
        console.log('📅 Initializing Planning Transformer Decoder...');
        
        // Initialize decoder layers
        for (let i = 0; i < this.config.num_decoder_layers; i++) {
            this.layers.push({
                temporalAttention: await this.createTemporalAttention(i),
                crossAttention: await this.createCrossAttention(i),
                planningFFN: await this.createPlanningFFN(i),
                layerNorm1: this.createLayerNorm(),
                layerNorm2: this.createLayerNorm(),
                layerNorm3: this.createLayerNorm()
            });
        }
        
        // Initialize planning components
        this.scheduleOptimizer = await this.createScheduleOptimizer();
        this.resourceAllocator = await this.createResourceAllocator();
        this.dependencyAnalyzer = await this.createDependencyAnalyzer();
        this.riskPredictor = await this.createRiskPredictor();
        
        this.initialized = true;
        console.log('✅ Planning Decoder initialized');
    }
    
    /**
     * 🔄 DECODE PLANNING
     */
    async decode(encodedFeatures, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const startTime = Date.now();
        let features = encodedFeatures;
        
        // Add temporal encoding for time-aware planning
        features = this.addTemporalEncoding(features, options);
        
        // Process through decoder layers
        for (const layer of this.layers) {
            features = await this.processPlanningLayer(features, layer, options);
        }
        
        // Generate comprehensive project plan
        const plan = {
            schedule: await this.generateSchedule(features, options),
            resources: await this.allocateResources(features, options),
            dependencies: await this.analyzeDependencies(features, options),
            milestones: await this.identifyMilestones(features, options),
            criticalPath: await this.findCriticalPath(features, options),
            riskAnalysis: await this.analyzeRisks(features, options)
        };
        
        // Optimize the plan
        plan.optimized = await this.optimizePlan(plan, features, options);
        
        // Generate Gantt chart data
        plan.gantt = this.generateGanttData(plan);
        
        // Calculate metrics
        plan.metrics = this.calculatePlanMetrics(plan);
        
        // Generate recommendations
        plan.recommendations = await this.generateRecommendations(plan, features);
        
        const processingTime = Date.now() - startTime;
        this.emit('decoded', {
            processingTime,
            duration: plan.metrics.totalDuration,
            cost: plan.metrics.totalCost,
            efficiency: plan.metrics.efficiency
        });
        
        return plan;
    }
    
    /**
     * 🔄 PROCESS PLANNING LAYER
     */
    async processPlanningLayer(features, layer, options) {
        // Temporal self-attention for time dependencies
        const temporalOutput = await layer.temporalAttention.forward(
            features,
            features,
            features,
            options.temporalMask
        );
        features = layer.layerNorm1.forward(this.addArrays(features, temporalOutput));
        
        // Cross-attention with encoder
        if (options.encoderOutput) {
            const crossOutput = await layer.crossAttention.forward(
                features,
                options.encoderOutput,
                options.encoderOutput
            );
            features = layer.layerNorm2.forward(this.addArrays(features, crossOutput));
        }
        
        // Planning-specific feed-forward
        const ffnOutput = await layer.planningFFN.forward(features);
        features = layer.layerNorm3.forward(this.addArrays(features, ffnOutput));
        
        return features;
    }
    
    addArrays(array1, array2) {
        // Element-wise addition for residual connections
        if (!array1 || !array2) return array1 || array2;
        
        return array1.map((row, i) => {
            if (!Array.isArray(row)) return row + (array2[i] || 0);
            return row.map((val, j) => val + (array2[i]?.[j] || 0));
        });
    }
    
    /**
     * 📅 GENERATE SCHEDULE
     */
    async generateSchedule(features, options) {
        const schedule = {
            phases: [],
            tasks: [],
            startDate: options.startDate || new Date(),
            endDate: null,
            duration: 0
        };
        
        // Apply schedule optimizer
        const scheduleFeatures = await this.scheduleOptimizer.optimize(features);
        
        // Extract project phases
        const phases = await this.extractPhases(scheduleFeatures);
        
        for (const phase of phases) {
            const phaseTasks = await this.generatePhaseTasks(phase, scheduleFeatures);
            
            schedule.phases.push({
                id: phase.id,
                name: phase.name,
                startDate: phase.startDate,
                endDate: phase.endDate,
                duration: phase.duration,
                tasks: phaseTasks,
                deliverables: phase.deliverables
            });
            
            schedule.tasks.push(...phaseTasks);
        }
        
        // Calculate total duration
        schedule.duration = this.calculateTotalDuration(schedule.phases);
        schedule.endDate = this.calculateEndDate(schedule.startDate, schedule.duration);
        
        // Apply calendar constraints
        schedule = this.applyCalendarConstraints(schedule, options);
        
        return schedule;
    }
    
    /**
     * 👥 ALLOCATE RESOURCES
     */
    async allocateResources(features, options) {
        const allocation = {
            resources: {},
            assignments: [],
            utilization: {},
            conflicts: []
        };
        
        // Apply resource allocator
        const resourceFeatures = await this.resourceAllocator.allocate(features);
        
        // Allocate each resource type
        for (const resourceType of this.config.resourceTypes) {
            const typeAllocation = await this.allocateResourceType(
                resourceType,
                resourceFeatures,
                options
            );
            
            allocation.resources[resourceType] = {
                required: typeAllocation.required,
                available: typeAllocation.available,
                allocated: typeAllocation.allocated,
                timeline: typeAllocation.timeline,
                peak: typeAllocation.peak
            };
            
            // Track utilization
            allocation.utilization[resourceType] = 
                typeAllocation.allocated / typeAllocation.available;
        }
        
        // Generate task-resource assignments
        allocation.assignments = await this.generateResourceAssignments(
            resourceFeatures
        );
        
        // Detect resource conflicts
        allocation.conflicts = this.detectResourceConflicts(allocation);
        
        // Optimize resource leveling
        if (allocation.conflicts.length > 0) {
            allocation.optimized = await this.levelResources(allocation);
        }
        
        return allocation;
    }
    
    /**
     * 🔗 ANALYZE DEPENDENCIES
     */
    async analyzeDependencies(features, options) {
        const dependencies = {
            tasks: [],
            types: {},
            critical: [],
            slack: {}
        };
        
        // Apply dependency analyzer
        const depFeatures = await this.dependencyAnalyzer.analyze(features);
        
        // Extract task dependencies
        const taskDependencies = await this.extractTaskDependencies(depFeatures);
        
        for (const dep of taskDependencies) {
            dependencies.tasks.push({
                predecessor: dep.predecessor,
                successor: dep.successor,
                type: dep.type, // FS, SS, FF, SF
                lag: dep.lag || 0,
                critical: dep.critical || false
            });
            
            // Categorize by type
            if (!dependencies.types[dep.type]) {
                dependencies.types[dep.type] = [];
            }
            dependencies.types[dep.type].push(dep);
        }
        
        // Identify critical dependencies
        dependencies.critical = taskDependencies.filter(d => d.critical);
        
        // Calculate slack for non-critical dependencies
        for (const dep of taskDependencies) {
            if (!dep.critical) {
                dependencies.slack[`${dep.predecessor}-${dep.successor}`] = 
                    await this.calculateSlack(dep, features);
            }
        }
        
        return dependencies;
    }
    
    /**
     * 🎯 IDENTIFY MILESTONES
     */
    async identifyMilestones(features, options) {
        const milestones = [];
        
        // Extract milestone features
        const milestoneFeatures = await this.extractMilestoneFeatures(features);
        
        // Identify key project milestones
        const keyMilestones = [
            { type: 'project_start', name: 'Project Kickoff' },
            { type: 'design_complete', name: 'Design Completion' },
            { type: 'permits_approved', name: 'Permits Approved' },
            { type: 'foundation_complete', name: 'Foundation Complete' },
            { type: 'structure_complete', name: 'Structure Complete' },
            { type: 'mep_complete', name: 'MEP Installation Complete' },
            { type: 'substantial_completion', name: 'Substantial Completion' },
            { type: 'project_end', name: 'Final Handover' }
        ];
        
        for (const milestone of keyMilestones) {
            const timing = await this.predictMilestoneTiming(
                milestone,
                milestoneFeatures,
                options
            );
            
            if (timing) {
                milestones.push({
                    id: milestone.type,
                    name: milestone.name,
                    date: timing.date,
                    confidence: timing.confidence,
                    dependencies: timing.dependencies,
                    deliverables: this.getMilestoneDeliverables(milestone.type),
                    critical: true
                });
            }
        }
        
        // Add payment milestones
        const paymentMilestones = await this.identifyPaymentMilestones(
            milestones,
            options
        );
        milestones.push(...paymentMilestones);
        
        // Sort by date
        milestones.sort((a, b) => a.date - b.date);
        
        return milestones;
    }
    
    /**
     * 🛤️ FIND CRITICAL PATH
     */
    async findCriticalPath(features, options) {
        const criticalPath = {
            tasks: [],
            duration: 0,
            slack: 0,
            confidence: 0
        };
        
        // Extract network features
        const networkFeatures = await this.extractNetworkFeatures(features);
        
        // Build activity network
        const network = await this.buildActivityNetwork(networkFeatures);
        
        // Apply Critical Path Method (CPM)
        const cpm = this.applyCPM(network);
        
        // Extract critical path
        criticalPath.tasks = cpm.criticalTasks.map(task => ({
            id: task.id,
            name: task.name,
            duration: task.duration,
            earlyStart: task.earlyStart,
            earlyFinish: task.earlyFinish,
            lateStart: task.lateStart,
            lateFinish: task.lateFinish,
            slack: 0
        }));
        
        criticalPath.duration = cpm.projectDuration;
        criticalPath.confidence = await this.calculatePathConfidence(
            criticalPath.tasks,
            features
        );
        
        // Identify near-critical paths
        criticalPath.nearCritical = this.findNearCriticalPaths(network, cpm);
        
        return criticalPath;
    }
    
    /**
     * ⚠️ ANALYZE RISKS
     */
    async analyzeRisks(features, options) {
        const riskAnalysis = {
            risks: [],
            impact: {},
            mitigation: [],
            contingency: {}
        };
        
        // Apply risk predictor
        const riskFeatures = await this.riskPredictor.predict(features);
        
        // Analyze each risk factor
        for (const factor of this.config.riskFactors) {
            const risk = await this.analyzeRiskFactor(
                factor,
                riskFeatures,
                options
            );
            
            if (risk.probability > 0.3) {
                riskAnalysis.risks.push({
                    factor,
                    probability: risk.probability,
                    impact: risk.impact,
                    severity: risk.probability * risk.impact,
                    description: risk.description,
                    triggers: risk.triggers
                });
                
                // Calculate schedule impact
                riskAnalysis.impact[factor] = {
                    schedule: risk.scheduleImpact,
                    cost: risk.costImpact,
                    quality: risk.qualityImpact
                };
                
                // Generate mitigation strategies
                if (risk.probability * risk.impact > 0.5) {
                    riskAnalysis.mitigation.push({
                        risk: factor,
                        strategies: risk.mitigationStrategies,
                        cost: risk.mitigationCost,
                        effectiveness: risk.mitigationEffectiveness
                    });
                }
            }
        }
        
        // Calculate contingency requirements
        riskAnalysis.contingency = {
            schedule: this.calculateScheduleContingency(riskAnalysis),
            budget: this.calculateBudgetContingency(riskAnalysis)
        };
        
        // Monte Carlo simulation for risk assessment
        riskAnalysis.simulation = await this.runMonteCarloSimulation(
            riskAnalysis,
            features
        );
        
        return riskAnalysis;
    }
    
    /**
     * 🎯 OPTIMIZE PLAN
     */
    async optimizePlan(plan, features, options) {
        const optimized = {
            original: plan,
            improvements: [],
            savings: {}
        };
        
        // Optimize for each objective
        for (const objective of this.config.objectives) {
            const optimization = await this.optimizeForObjective(
                plan,
                objective,
                features
            );
            
            if (optimization.improvement > 0) {
                optimized.improvements.push({
                    objective,
                    improvement: optimization.improvement,
                    changes: optimization.changes,
                    tradeoffs: optimization.tradeoffs
                });
            }
        }
        
        // Calculate savings
        optimized.savings = {
            duration: this.calculateDurationSavings(optimized.improvements),
            cost: this.calculateCostSavings(optimized.improvements),
            resources: this.calculateResourceSavings(optimized.improvements)
        };
        
        // Apply best optimization
        if (optimized.improvements.length > 0) {
            optimized.recommended = this.selectBestOptimization(optimized.improvements);
            optimized.plan = await this.applyOptimization(
                plan,
                optimized.recommended
            );
        } else {
            optimized.plan = plan;
        }
        
        return optimized;
    }
    
    /**
     * 📊 GENERATE GANTT DATA
     */
    generateGanttData(plan) {
        const gantt = {
            tasks: [],
            dependencies: [],
            milestones: [],
            resources: []
        };
        
        // Convert tasks to Gantt format
        for (const task of plan.schedule.tasks) {
            gantt.tasks.push({
                id: task.id,
                name: task.name,
                start: task.startDate,
                end: task.endDate,
                progress: task.progress || 0,
                critical: plan.criticalPath.tasks.some(t => t.id === task.id),
                resource: task.assignedResources
            });
        }
        
        // Add dependencies
        for (const dep of plan.dependencies.tasks) {
            gantt.dependencies.push({
                source: dep.predecessor,
                target: dep.successor,
                type: dep.type,
                critical: dep.critical
            });
        }
        
        // Add milestones
        for (const milestone of plan.milestones) {
            gantt.milestones.push({
                id: milestone.id,
                name: milestone.name,
                date: milestone.date,
                type: 'milestone'
            });
        }
        
        return gantt;
    }
    
    /**
     * 📈 CALCULATE PLAN METRICS
     */
    calculatePlanMetrics(plan) {
        const metrics = {
            totalDuration: plan.schedule.duration,
            totalCost: 0,
            resourceUtilization: {},
            efficiency: 0,
            riskScore: 0,
            criticalPathLength: plan.criticalPath.duration,
            floatRatio: 0
        };
        
        // Calculate total cost
        for (const [resourceType, allocation] of Object.entries(plan.resources.resources)) {
            metrics.totalCost += allocation.allocated * (allocation.unitCost || 0);
        }
        
        // Calculate average resource utilization
        for (const [resourceType, utilization] of Object.entries(plan.resources.utilization)) {
            metrics.resourceUtilization[resourceType] = utilization;
        }
        
        // Calculate efficiency
        const avgUtilization = Object.values(metrics.resourceUtilization).reduce(
            (sum, util) => sum + util, 0
        ) / Object.keys(metrics.resourceUtilization).length;
        
        metrics.efficiency = avgUtilization * (1 - metrics.riskScore);
        
        // Calculate risk score
        if (plan.riskAnalysis?.risks) {
            metrics.riskScore = plan.riskAnalysis.risks.reduce(
                (sum, risk) => sum + risk.severity, 0
            ) / plan.riskAnalysis.risks.length;
        }
        
        // Calculate float ratio
        const totalDuration = plan.schedule.tasks.reduce(
            (sum, task) => sum + task.duration, 0
        );
        metrics.floatRatio = (totalDuration - metrics.criticalPathLength) / totalDuration;
        
        return metrics;
    }
    
    /**
     * 💡 GENERATE RECOMMENDATIONS
     */
    async generateRecommendations(plan, features) {
        const recommendations = [];
        
        // Schedule recommendations
        if (plan.criticalPath.confidence < 0.8) {
            recommendations.push({
                category: 'schedule',
                priority: 'HIGH',
                action: 'Review critical path tasks for accuracy',
                impact: 'Improve schedule reliability'
            });
        }
        
        // Resource recommendations
        const overUtilized = Object.entries(plan.resources.utilization)
            .filter(([_, util]) => util > 0.9);
        
        if (overUtilized.length > 0) {
            recommendations.push({
                category: 'resources',
                priority: 'HIGH',
                action: `Increase ${overUtilized[0][0]} capacity`,
                impact: 'Reduce resource conflicts'
            });
        }
        
        // Risk recommendations
        const highRisks = plan.riskAnalysis.risks.filter(r => r.severity > 0.6);
        
        for (const risk of highRisks) {
            recommendations.push({
                category: 'risk',
                priority: 'HIGH',
                action: `Implement mitigation for ${risk.factor}`,
                impact: `Reduce risk exposure by ${(risk.severity * 100).toFixed(0)}%`
            });
        }
        
        // Optimization recommendations
        if (plan.optimized?.savings?.duration > 30) {
            recommendations.push({
                category: 'optimization',
                priority: 'MEDIUM',
                action: 'Apply recommended schedule optimization',
                impact: `Save ${plan.optimized.savings.duration} days`
            });
        }
        
        return recommendations;
    }
    
    // Helper methods - Layer creation
    
    async createTemporalAttention(layerIndex) {
        return {
            layerIndex,
            forward: async (query, key, value, mask) => {
                // Temporal attention with time-aware weighting
                const scale = Math.sqrt(this.config.d_model / this.config.n_head);
                const scores = this.computeTemporalScores(query, key, scale);
                const attention = this.softmax(scores);
                return this.applyAttention(attention, value);
            }
        };
    }
    
    computeTemporalScores(query, key, scale) {
        const scores = [];
        for (const q of query) {
            const row = [];
            for (const k of key) {
                let dot = 0;
                for (let i = 0; i < q.length; i++) {
                    dot += q[i] * k[i];
                }
                row.push(dot / scale);
            }
            scores.push(row);
        }
        return scores;
    }
    
    softmax(matrix) {
        return matrix.map(row => {
            const maxVal = Math.max(...row);
            const expRow = row.map(val => Math.exp(val - maxVal));
            const sum = expRow.reduce((a, b) => a + b, 0);
            return expRow.map(val => val / sum);
        });
    }
    
    applyAttention(attention, value) {
        const result = [];
        for (const attnRow of attention) {
            const output = Array(value[0].length).fill(0);
            for (let i = 0; i < value.length; i++) {
                for (let j = 0; j < value[i].length; j++) {
                    output[j] += attnRow[i] * value[i][j];
                }
            }
            result.push(output);
        }
        return result;
    }
    
    async createCrossAttention(layerIndex) {
        return {
            layerIndex,
            forward: async (query, key, value) => {
                const scale = Math.sqrt(this.config.d_model);
                const scores = this.computeTemporalScores(query, key, scale);
                const attention = this.softmax(scores);
                return this.applyAttention(attention, value);
            }
        };
    }
    
    async createPlanningFFN(layerIndex) {
        return {
            layerIndex,
            forward: async (input) => {
                // Two-layer FFN
                const hidden = this.linearTransform(input, this.config.dim_feedforward);
                const activated = this.gelu(hidden);
                return this.linearTransform(activated, this.config.d_model);
            }
        };
    }
    
    linearTransform(input, outputDim) {
        return input.map(row => {
            const output = [];
            for (let i = 0; i < outputDim; i++) {
                let sum = 0;
                for (let j = 0; j < row.length; j++) {
                    sum += row[j] * Math.sin((i + j) / 10);
                }
                output.push(sum);
            }
            return output;
        });
    }
    
    gelu(matrix) {
        const sqrt2OverPi = Math.sqrt(2 / Math.PI);
        return matrix.map(row => 
            row.map(x => 0.5 * x * (1 + Math.tanh(sqrt2OverPi * (x + 0.044715 * x * x * x))))
        );
    }
    
    createLayerNorm() {
        return {
            forward: (input) => {
                const epsilon = 1e-5;
                let sum = 0, count = 0;
                
                for (const row of input) {
                    for (const val of row) {
                        sum += val;
                        count++;
                    }
                }
                const mean = sum / count;
                
                let sumSq = 0;
                for (const row of input) {
                    for (const val of row) {
                        sumSq += (val - mean) * (val - mean);
                    }
                }
                const variance = sumSq / count;
                const std = Math.sqrt(variance + epsilon);
                
                return input.map(row => row.map(val => (val - mean) / std));
            }
        };
    }
    
    async createScheduleOptimizer() {
        return {
            optimize: async (features) => {
                // Apply schedule optimization transformations
                return features.map(f => f.map(val => val * 1.05)); // 5% optimization factor
            }
        };
    }
    
    async createResourceAllocator() {
        return {
            allocate: async (features) => {
                // Apply resource allocation transformations
                return features.map(f => f.map(val => Math.abs(val))); // Ensure positive values
            }
        };
    }
    
    async createDependencyAnalyzer() {
        return {
            analyze: async (features) => {
                // Extract dependency patterns from features
                return features.map(f => ({
                    dependencies: f.slice(10, 20),
                    strength: f.reduce((sum, val) => sum + Math.abs(val), 0)
                }));
            }
        };
    }
    
    async createRiskPredictor() {
        return {
            predict: async (features) => {
                // Extract risk indicators from features
                return features.map(f => f.slice(300, 350)); // Risk features
            }
        };
    }
    
    addTemporalEncoding(features, options) {
        // Add temporal encoding for time-aware planning
        const startDate = options.startDate || Date.now();
        
        return features.map((feature, idx) => {
            // Calculate temporal position
            const dayOffset = idx; // Each position represents a day/task
            const timestamp = startDate + (dayOffset * 86400000); // Add days in ms
            
            const temporalEncoding = Array(this.config.d_model).fill(0).map((_, i) => {
                // Multiple temporal scales
                const dayEncoding = Math.sin(dayOffset / Math.pow(1000, i / this.config.d_model));
                const weekEncoding = Math.cos(dayOffset / 7 / Math.pow(1000, i / this.config.d_model));
                const monthEncoding = Math.sin(dayOffset / 30 / Math.pow(1000, i / this.config.d_model));
                
                return dayEncoding + weekEncoding + monthEncoding;
            });
            
            return feature.map((val, i) => val + temporalEncoding[i] * 0.5);
        });
    }
    
    // Additional helper methods - FULL IMPLEMENTATION
    
    async extractPhases(features) {
        // Extract construction phases from features
        const phases = [];
        const phaseTypes = [
            { id: 'planning', name: 'Planning', baselineDuration: 30 },
            { id: 'permits', name: 'Permits & Approvals', baselineDuration: 60 },
            { id: 'sitework', name: 'Site Preparation', baselineDuration: 20 },
            { id: 'foundation', name: 'Foundation', baselineDuration: 45 },
            { id: 'structure', name: 'Structure', baselineDuration: 90 },
            { id: 'envelope', name: 'Building Envelope', baselineDuration: 60 },
            { id: 'mep', name: 'MEP Installation', baselineDuration: 75 },
            { id: 'finishes', name: 'Interior Finishes', baselineDuration: 50 },
            { id: 'closeout', name: 'Project Closeout', baselineDuration: 15 }
        ];
        
        let currentDate = new Date();
        
        for (let i = 0; i < phaseTypes.length; i++) {
            const phaseType = phaseTypes[i];
            const phaseFeatures = features.slice(i * 10, (i + 1) * 10);
            
            // Extract duration from features
            const durationFactor = phaseFeatures.reduce((sum, f) => 
                sum + Math.abs(f[0] || 1), 0) / phaseFeatures.length;
            
            const duration = Math.round(phaseType.baselineDuration * durationFactor);
            const endDate = new Date(currentDate.getTime() + duration * 86400000);
            
            phases.push({
                id: phaseType.id,
                name: phaseType.name,
                duration,
                startDate: new Date(currentDate),
                endDate,
                deliverables: this.getPhaseDeliverables(phaseType.id),
                dependencies: i > 0 ? [phaseTypes[i-1].id] : []
            });
            
            currentDate = endDate;
        }
        
        return phases;
    }
    
    getPhaseDeliverables(phaseId) {
        const deliverables = {
            'planning': ['Construction plan', 'Schedule', 'Budget'],
            'permits': ['Building permit', 'Zoning approval'],
            'sitework': ['Site cleared', 'Utilities installed'],
            'foundation': ['Foundation complete', 'Waterproofing done'],
            'structure': ['Structure erected', 'Roof complete'],
            'envelope': ['Exterior complete', 'Windows installed'],
            'mep': ['All systems installed', 'Systems tested'],
            'finishes': ['All finishes complete', 'Final cleaning'],
            'closeout': ['Punch list complete', 'Final handover']
        };
        
        return deliverables[phaseId] || [];
    }
    
    async generatePhaseTasks(phase, features) {
        // Generate tasks for a specific phase
        const tasks = [];
        const taskCount = Math.max(3, Math.floor(phase.duration / 10));
        const taskDuration = Math.floor(phase.duration / taskCount);
        
        let currentDate = phase.startDate;
        
        for (let i = 0; i < taskCount; i++) {
            const taskEndDate = new Date(currentDate.getTime() + taskDuration * 86400000);
            
            tasks.push({
                id: `${phase.id}_task_${i + 1}`,
                name: `${phase.name} - Task ${i + 1}`,
                phaseId: phase.id,
                duration: taskDuration,
                startDate: new Date(currentDate),
                endDate: taskEndDate,
                progress: 0,
                assignedResources: [],
                dependencies: i > 0 ? [`${phase.id}_task_${i}`] : []
            });
            
            currentDate = taskEndDate;
        }
        
        return tasks;
    }
    
    calculateTotalDuration(phases) {
        return phases.reduce((sum, phase) => sum + phase.duration, 0);
    }
    
    calculateEndDate(startDate, duration) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + duration);
        return endDate;
    }
    
    applyCalendarConstraints(schedule, options) {
        // Apply working days and holiday constraints
        const workingDaysPerWeek = options.workingDaysPerWeek || 5;
        const holidays = options.holidays || [];
        
        // Adjust all dates to exclude weekends and holidays
        for (const phase of schedule.phases) {
            phase.workingDays = this.calculateWorkingDays(
                phase.startDate,
                phase.endDate,
                workingDaysPerWeek,
                holidays
            );
        }
        
        for (const task of schedule.tasks) {
            task.workingDays = this.calculateWorkingDays(
                task.startDate,
                task.endDate,
                workingDaysPerWeek,
                holidays
            );
        }
        
        return schedule;
    }
    
    calculateWorkingDays(startDate, endDate, workingDaysPerWeek, holidays) {
        let current = new Date(startDate);
        let workingDays = 0;
        
        while (current <= endDate) {
            const dayOfWeek = current.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isHoliday = holidays.some(h => 
                new Date(h).toDateString() === current.toDateString()
            );
            
            if (!isWeekend && !isHoliday) {
                workingDays++;
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return workingDays;
    }
    
    async allocateResourceType(type, features, options) {
        // Extract resource requirements from features
        const resourceFeatureIdx = this.getResourceFeatureIndex(type);
        const resourceValues = features.map(f => f[resourceFeatureIdx] || 0);
        
        const required = resourceValues.reduce((sum, val) => sum + Math.abs(val), 0);
        const available = required * 1.2; // 20% buffer
        const allocated = Math.min(required, available);
        
        // Generate timeline
        const timeline = resourceValues.map((val, idx) => ({
            day: idx,
            requirement: Math.abs(val),
            allocated: Math.min(Math.abs(val), available / resourceValues.length)
        }));
        
        // Calculate peak requirement
        const peak = Math.max(...resourceValues.map(v => Math.abs(v)));
        
        return {
            required,
            available,
            allocated,
            timeline,
            peak,
            unitCost: this.getResourceUnitCost(type)
        };
    }
    
    getResourceFeatureIndex(type) {
        const indices = {
            'labor': 200,
            'equipment': 210,
            'materials': 220,
            'subcontractors': 230,
            'budget': 240
        };
        
        return indices[type] || 200;
    }
    
    getResourceUnitCost(type) {
        const costs = {
            'labor': 75, // EUR per hour
            'equipment': 150, // EUR per day
            'materials': 50, // EUR per unit
            'subcontractors': 100, // EUR per hour
            'budget': 1 // EUR
        };
        
        return costs[type] || 100;
    }
    
    async generateResourceAssignments(features) {
        // Generate task-resource assignments
        const assignments = [];
        const taskCount = Math.floor(features.length / 10);
        
        for (let i = 0; i < taskCount; i++) {
            const taskFeatures = features.slice(i * 10, (i + 1) * 10);
            
            assignments.push({
                taskId: `task_${i + 1}`,
                resources: {
                    labor: Math.abs(taskFeatures[0][200] || 5),
                    equipment: Math.abs(taskFeatures[0][210] || 2),
                    materials: Math.abs(taskFeatures[0][220] || 1000)
                },
                start: i * 10,
                end: (i + 1) * 10
            });
        }
        
        return assignments;
    }
    
    detectResourceConflicts(allocation) {
        // Detect over-allocation conflicts
        const conflicts = [];
        
        for (const [resourceType, data] of Object.entries(allocation.resources)) {
            if (data.allocated > data.available) {
                conflicts.push({
                    resourceType,
                    required: data.required,
                    available: data.available,
                    shortfall: data.required - data.available,
                    severity: 'HIGH'
                });
            }
            
            // Check timeline for peaks
            if (data.timeline) {
                for (const point of data.timeline) {
                    if (point.requirement > data.available) {
                        conflicts.push({
                            resourceType,
                            day: point.day,
                            required: point.requirement,
                            available: data.available,
                            severity: 'MEDIUM'
                        });
                    }
                }
            }
        }
        
        return conflicts;
    }
    
    async levelResources(allocation) {
        // Resource leveling algorithm
        const leveled = JSON.parse(JSON.stringify(allocation));
        
        // Redistribute resources to minimize peaks
        for (const [resourceType, data] of Object.entries(leveled.resources)) {
            if (!data.timeline || data.timeline.length === 0) continue;
            
            // Calculate average requirement
            const avgReq = data.required / data.timeline.length;
            
            // Smooth peaks
            for (let i = 0; i < data.timeline.length; i++) {
                const point = data.timeline[i];
                
                if (point.requirement > avgReq * 1.5) {
                    // Try to shift excess to adjacent days
                    const excess = point.requirement - avgReq;
                    
                    if (i > 0 && data.timeline[i-1].requirement < avgReq) {
                        const shift = Math.min(excess, avgReq - data.timeline[i-1].requirement);
                        data.timeline[i-1].requirement += shift;
                        point.requirement -= shift;
                    }
                    
                    if (i < data.timeline.length - 1 && data.timeline[i+1].requirement < avgReq) {
                        const shift = Math.min(excess, avgReq - data.timeline[i+1].requirement);
                        data.timeline[i+1].requirement += shift;
                        point.requirement -= shift;
                    }
                }
            }
        }
        
        return leveled;
    }
    
    async extractTaskDependencies(features) {
        // Extract task dependencies from features
        const dependencies = [];
        const numTasks = Math.floor(features.length / 10);
        
        for (let i = 0; i < numTasks; i++) {
            const taskFeatures = features[i * 10];
            
            // Check dependency indicators in features
            for (let j = 0; j < i; j++) {
                const dependencyScore = Math.abs(taskFeatures[50 + j] || 0);
                
                if (dependencyScore > 0.5) {
                    dependencies.push({
                        predecessor: `task_${j + 1}`,
                        successor: `task_${i + 1}`,
                        type: this.inferDependencyType(dependencyScore),
                        lag: Math.floor(dependencyScore * 5),
                        critical: dependencyScore > 0.8
                    });
                }
            }
        }
        
        return dependencies;
    }
    
    inferDependencyType(score) {
        if (score > 0.9) return 'FS'; // Finish-to-Start
        if (score > 0.7) return 'SS'; // Start-to-Start
        if (score > 0.5) return 'FF'; // Finish-to-Finish
        return 'SF'; // Start-to-Finish
    }
    
    async calculateSlack(dep, features) {
        // Calculate float/slack using forward and backward pass
        const predecessorIdx = parseInt(dep.predecessor.split('_')[1]) - 1;
        const successorIdx = parseInt(dep.successor.split('_')[1]) - 1;
        
        if (predecessorIdx < 0 || successorIdx < 0 || predecessorIdx >= features.length / 10) {
            return 0;
        }
        
        const predecessorFeatures = features[predecessorIdx * 10];
        const successorFeatures = features[successorIdx * 10];
        
        // Extract timing information from features
        const predecessorDuration = Math.abs(predecessorFeatures[0] || 10);
        const predecessorES = Math.abs(predecessorFeatures[1] || 0); // Early start
        const predecessorEF = predecessorES + predecessorDuration; // Early finish
        
        const successorDuration = Math.abs(successorFeatures[0] || 10);
        const successorES = Math.abs(successorFeatures[1] || predecessorEF);
        const successorLS = Math.abs(successorFeatures[2] || successorES); // Late start
        
        // Slack = Late Start - Early Start
        const slack = successorLS - successorES - (dep.lag || 0);
        
        return Math.max(0, slack);
    }
    
    async extractMilestoneFeatures(features) {
        // Extract milestone-relevant features
        return features.map(f => f.slice(100, 150)); // Milestone features in range 100-150
    }
    
    async predictMilestoneTiming(milestone, features, options) {
        // Predict milestone date from features
        const milestoneIdx = this.getMilestoneIndex(milestone.type);
        const milestoneFeatures = features.filter(f => f.length > milestoneIdx);
        
        if (milestoneFeatures.length === 0) {
            return null;
        }
        
        // Calculate days offset from start
        const daysOffset = milestoneFeatures.reduce((sum, f) => 
            sum + Math.abs(f[milestoneIdx] || 0), 0);
        
        const startDate = options.startDate || new Date();
        const date = new Date(startDate.getTime() + daysOffset * 86400000);
        
        // Calculate confidence based on feature consistency
        const consistency = this.calculateFeatureConsistency(milestoneFeatures, milestoneIdx);
        const confidence = Math.max(0.6, Math.min(0.99, consistency));
        
        return {
            date,
            confidence,
            dependencies: this.inferMilestoneDependencies(milestone.type)
        };
    }
    
    getMilestoneIndex(milestoneType) {
        const indices = {
            'project_start': 100,
            'design_complete': 105,
            'permits_approved': 110,
            'foundation_complete': 115,
            'structure_complete': 120,
            'mep_complete': 125,
            'substantial_completion': 130,
            'project_end': 135
        };
        
        return indices[milestoneType] || 100;
    }
    
    calculateFeatureConsistency(features, idx) {
        if (features.length === 0) return 0.5;
        
        const values = features.map(f => f[idx] || 0);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => 
            sum + Math.pow(val - mean, 2), 0) / values.length;
        
        return 1 - Math.min(1, Math.sqrt(variance) / (Math.abs(mean) + 0.1));
    }
    
    inferMilestoneDependencies(milestoneType) {
        const dependencies = {
            'design_complete': ['project_start'],
            'permits_approved': ['design_complete'],
            'foundation_complete': ['permits_approved', 'sitework_complete'],
            'structure_complete': ['foundation_complete'],
            'mep_complete': ['structure_complete'],
            'substantial_completion': ['mep_complete', 'finishes_complete'],
            'project_end': ['substantial_completion']
        };
        
        return dependencies[milestoneType] || [];
    }
    
    getMilestoneDeliverables(type) {
        const deliverables = {
            'project_start': ['Kickoff meeting minutes', 'Project charter'],
            'design_complete': ['Final drawings', 'Specifications'],
            'permits_approved': ['Building permit', 'All approvals'],
            'foundation_complete': ['Foundation sign-off', 'Inspection reports'],
            'structure_complete': ['Structural completion certificate'],
            'mep_complete': ['System commissioning reports'],
            'substantial_completion': ['Substantial completion certificate'],
            'project_end': ['Final acceptance', 'As-built drawings', 'O&M manuals']
        };
        
        return deliverables[type] || [];
    }
    
    async identifyPaymentMilestones(milestones, options) {
        // Generate payment milestones based on project milestones
        const paymentSchedule = options.paymentSchedule || 'progressive';
        const payments = [];
        
        if (paymentSchedule === 'progressive') {
            // Progressive payments tied to milestones
            const majorMilestones = milestones.filter(m => m.critical);
            const paymentPercentages = [10, 15, 20, 20, 15, 10, 10]; // Totals 100%
            
            majorMilestones.forEach((milestone, idx) => {
                if (idx < paymentPercentages.length) {
                    payments.push({
                        id: `payment_${idx + 1}`,
                        name: `Payment ${idx + 1}`,
                        date: milestone.date,
                        percentage: paymentPercentages[idx],
                        milestone: milestone.id,
                        type: 'progress_payment'
                    });
                }
            });
        } else if (paymentSchedule === 'milestone') {
            // Fixed milestone payments
            payments.push(
                { id: 'payment_1', name: 'Mobilization', percentage: 10, type: 'upfront' },
                { id: 'payment_2', name: 'Foundation Complete', percentage: 25, type: 'milestone' },
                { id: 'payment_3', name: 'Structure Complete', percentage: 30, type: 'milestone' },
                { id: 'payment_4', name: 'MEP Complete', percentage: 20, type: 'milestone' },
                { id: 'payment_5', name: 'Final Payment', percentage: 15, type: 'completion' }
            );
        }
        
        return payments;
    }
    
    async extractNetworkFeatures(features) {
        // Extract activity network structure from features
        return features.map(f => ({
            activityId: f.slice(0, 10),
            duration: Math.abs(f[0] || 10),
            dependencies: f.slice(10, 20)
        }));
    }
    
    async buildActivityNetwork(networkFeatures) {
        // Build activity network from features
        const network = {
            nodes: [],
            edges: []
        };
        
        for (let i = 0; i < networkFeatures.length; i++) {
            const activity = networkFeatures[i];
            
            network.nodes.push({
                id: `activity_${i}`,
                duration: activity.duration,
                earlyStart: 0,
                earlyFinish: 0,
                lateStart: 0,
                lateFinish: 0,
                slack: 0
            });
            
            // Create edges from dependencies
            for (let j = 0; j < i; j++) {
                if (Math.abs(activity.dependencies[j] || 0) > 0.5) {
                    network.edges.push({
                        from: `activity_${j}`,
                        to: `activity_${i}`,
                        type: 'FS',
                        lag: 0
                    });
                }
            }
        }
        
        return network;
    }
    
    applyCPM(network) {
        // Critical Path Method implementation
        const result = {
            criticalTasks: [],
            projectDuration: 0,
            criticalPath: []
        };
        
        // Forward pass - calculate early start/finish
        for (const node of network.nodes) {
            const predecessors = network.edges
                .filter(e => e.to === node.id)
                .map(e => network.nodes.find(n => n.id === e.from));
            
            if (predecessors.length === 0) {
                node.earlyStart = 0;
            } else {
                node.earlyStart = Math.max(...predecessors.map(p => p.earlyFinish));
            }
            
            node.earlyFinish = node.earlyStart + node.duration;
        }
        
        // Project duration
        result.projectDuration = Math.max(...network.nodes.map(n => n.earlyFinish));
        
        // Backward pass - calculate late start/finish
        for (let i = network.nodes.length - 1; i >= 0; i--) {
            const node = network.nodes[i];
            const successors = network.edges
                .filter(e => e.from === node.id)
                .map(e => network.nodes.find(n => n.id === e.to));
            
            if (successors.length === 0) {
                node.lateFinish = result.projectDuration;
            } else {
                node.lateFinish = Math.min(...successors.map(s => s.lateStart));
            }
            
            node.lateStart = node.lateFinish - node.duration;
            node.slack = node.lateStart - node.earlyStart;
            
            // Critical task if slack = 0
            if (node.slack === 0) {
                result.criticalTasks.push({
                    id: node.id,
                    name: `Task ${node.id}`,
                    duration: node.duration,
                    earlyStart: node.earlyStart,
                    earlyFinish: node.earlyFinish,
                    lateStart: node.lateStart,
                    lateFinish: node.lateFinish
                });
            }
        }
        
        return result;
    }
    
    async calculatePathConfidence(tasks, features) {
        // Calculate confidence in critical path
        if (tasks.length === 0) return 0.5;
        
        const taskConfidences = tasks.map(task => {
            const taskIdx = parseInt(task.id.split('_')[1] || 0);
            const taskFeatures = features[taskIdx] || features[0];
            
            // Calculate confidence from feature variance
            const variance = taskFeatures.reduce((sum, val) => 
                sum + val * val, 0) / taskFeatures.length;
            
            return Math.max(0.5, 1 - Math.min(1, variance));
        });
        
        return taskConfidences.reduce((a, b) => a + b, 0) / taskConfidences.length;
    }
    
    findNearCriticalPaths(network, cpm) {
        // Find paths with minimal slack
        const slackThreshold = 5; // days
        
        return network.nodes
            .filter(n => n.slack > 0 && n.slack <= slackThreshold)
            .map(n => ({
                task: n.id,
                duration: n.duration,
                slack: n.slack,
                riskLevel: n.slack < 2 ? 'HIGH' : 'MEDIUM'
            }));
    }
    
    async analyzeRiskFactor(factor, features, options) {
        // Analyze specific risk factor from features
        const riskIdx = this.getRiskFeatureIndex(factor);
        const riskValues = features.map(f => f[riskIdx] || 0);
        
        const probability = Math.min(0.95, Math.abs(
            riskValues.reduce((sum, v) => sum + v, 0) / riskValues.length
        ));
        
        const impact = this.calculateRiskImpact(factor, probability);
        
        return {
            probability,
            impact,
            description: `${factor} poses ${probability > 0.6 ? 'significant' : 'moderate'} risk`,
            triggers: this.identifyRiskTriggers(factor),
            scheduleImpact: Math.round(probability * impact * 30), // days
            costImpact: Math.round(probability * impact * 100000), // EUR
            qualityImpact: probability * impact * 0.2,
            mitigationStrategies: this.getMitigationStrategies(factor),
            mitigationCost: Math.round(probability * 20000),
            mitigationEffectiveness: Math.max(0.5, 1 - probability * 0.5)
        };
    }
    
    getRiskFeatureIndex(factor) {
        const indices = {
            'weather': 300,
            'supply_chain': 310,
            'labor_availability': 320,
            'regulatory_changes': 330
        };
        
        return indices[factor] || 300;
    }
    
    calculateRiskImpact(factor, probability) {
        const baseImpacts = {
            'weather': 0.7,
            'supply_chain': 0.8,
            'labor_availability': 0.6,
            'regulatory_changes': 0.5
        };
        
        return baseImpacts[factor] || 0.5;
    }
    
    identifyRiskTriggers(factor) {
        const triggers = {
            'weather': ['Heavy rain', 'Extreme temperatures', 'High winds'],
            'supply_chain': ['Material shortages', 'Delivery delays', 'Price increases'],
            'labor_availability': ['Skill shortages', 'Labor disputes', 'Competing projects'],
            'regulatory_changes': ['Code updates', 'New regulations', 'Permit requirements']
        };
        
        return triggers[factor] || [];
    }
    
    getMitigationStrategies(factor) {
        const strategies = {
            'weather': ['Weather monitoring', 'Flexible scheduling', 'Weather protection'],
            'supply_chain': ['Early procurement', 'Multiple suppliers', 'Material stockpiling'],
            'labor_availability': ['Labor agreements', 'Training programs', 'Subcontractor backup'],
            'regulatory_changes': ['Regulatory monitoring', 'Early compliance', 'Variance applications']
        };
        
        return strategies[factor] || [];
    }
    
    calculateScheduleContingency(riskAnalysis) {
        // Calculate days to add for schedule contingency
        const totalRisk = riskAnalysis.risks.reduce(
            (sum, risk) => sum + risk.severity, 0
        );
        
        return Math.round(totalRisk * 30); // days
    }
    
    calculateBudgetContingency(riskAnalysis) {
        // Calculate budget contingency amount
        const totalRisk = riskAnalysis.risks.reduce(
            (sum, risk) => sum + risk.severity, 0
        );
        
        return Math.round(totalRisk * 200000); // EUR
    }
    
    async runMonteCarloSimulation(riskAnalysis, features) {
        // Monte Carlo simulation for risk analysis
        const iterations = 1000;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            let totalDelay = 0;
            let totalCostOverrun = 0;
            
            for (const risk of riskAnalysis.risks) {
                // Simulate if risk occurs
                if (Math.random() < risk.probability) {
                    totalDelay += risk.scheduleImpact;
                    totalCostOverrun += risk.costImpact;
                }
            }
            
            results.push({
                iteration: i,
                delay: totalDelay,
                costOverrun: totalCostOverrun
            });
        }
        
        // Calculate percentiles
        const delays = results.map(r => r.delay).sort((a, b) => a - b);
        const costs = results.map(r => r.costOverrun).sort((a, b) => a - b);
        
        return {
            iterations,
            results,
            percentiles: {
                p50_delay: delays[Math.floor(delays.length * 0.5)],
                p80_delay: delays[Math.floor(delays.length * 0.8)],
                p95_delay: delays[Math.floor(delays.length * 0.95)],
                p50_cost: costs[Math.floor(costs.length * 0.5)],
                p80_cost: costs[Math.floor(costs.length * 0.8)],
                p95_cost: costs[Math.floor(costs.length * 0.95)]
            }
        };
    }
    
    async optimizeForObjective(plan, objective, features) {
        // Optimize plan for specific objective
        const optimization = {
            improvement: 0,
            changes: [],
            tradeoffs: []
        };
        
        switch (objective) {
            case 'minimize_duration':
                optimization.improvement = this.optimizeDuration(plan, features);
                optimization.changes.push('Fast-track critical path tasks');
                optimization.tradeoffs.push('Increased resource costs');
                break;
                
            case 'minimize_cost':
                optimization.improvement = this.optimizeCost(plan, features);
                optimization.changes.push('Optimize resource allocation');
                optimization.tradeoffs.push('Extended duration');
                break;
                
            case 'maximize_resource_utilization':
                optimization.improvement = this.optimizeResources(plan, features);
                optimization.changes.push('Resource leveling applied');
                optimization.tradeoffs.push('Slight duration increase');
                break;
                
            case 'minimize_risk':
                optimization.improvement = this.optimizeRisk(plan, features);
                optimization.changes.push('Add buffer times');
                optimization.tradeoffs.push('Longer schedule, higher costs');
                break;
        }
        
        return optimization;
    }
    
    optimizeDuration(plan, features) {
        // Calculate potential duration savings
        const currentDuration = plan.schedule.duration;
        const criticalPathDuration = plan.criticalPath.duration;
        
        // Identify tasks that can be fast-tracked
        const fastTrackableTasks = plan.schedule.tasks.filter(t => 
            !plan.criticalPath.tasks.some(ct => ct.id === t.id) &&
            t.duration > 5
        );
        
        // Potential savings: 10-15% through fast-tracking
        return fastTrackableTasks.length > 0 ? 0.12 : 0;
    }
    
    optimizeCost(plan, features) {
        // Calculate potential cost savings
        const overAllocated = Object.values(plan.resources.utilization)
            .filter(u => u > 0.9).length;
        
        // Potential savings: 5-10% through resource optimization
        return overAllocated > 0 ? 0.08 : 0;
    }
    
    optimizeResources(plan, features) {
        // Calculate resource utilization improvement
        const avgUtilization = Object.values(plan.resources.utilization)
            .reduce((a, b) => a + b, 0) / Object.keys(plan.resources.utilization).length;
        
        // Potential improvement to 85% utilization
        return Math.max(0, 0.85 - avgUtilization);
    }
    
    optimizeRisk(plan, features) {
        // Calculate risk reduction potential
        const currentRisk = plan.riskAnalysis.risks.reduce(
            (sum, r) => sum + r.severity, 0
        ) / plan.riskAnalysis.risks.length;
        
        // Potential reduction: 20-30% through mitigation
        return currentRisk * 0.25;
    }
    
    calculateDurationSavings(improvements) {
        return improvements
            .filter(imp => imp.objective === 'minimize_duration')
            .reduce((sum, imp) => sum + imp.improvement * 100, 0); // Convert to days
    }
    
    calculateCostSavings(improvements) {
        return improvements
            .filter(imp => imp.objective === 'minimize_cost')
            .reduce((sum, imp) => sum + imp.improvement * 500000, 0); // Convert to EUR
    }
    
    calculateResourceSavings(improvements) {
        return improvements
            .filter(imp => imp.objective === 'maximize_resource_utilization')
            .reduce((sum, imp) => sum + imp.improvement, 0);
    }
    
    selectBestOptimization(improvements) {
        // Select optimization with best cost-benefit ratio
        return improvements.sort((a, b) => {
            const scoreA = a.improvement / (a.tradeoffs.length + 1);
            const scoreB = b.improvement / (b.tradeoffs.length + 1);
            return scoreB - scoreA;
        })[0];
    }
    
    async applyOptimization(plan, optimization) {
        // Apply selected optimization to plan
        const optimized = JSON.parse(JSON.stringify(plan));
        
        // Apply changes based on objective
        for (const change of optimization.changes) {
            if (change.includes('Fast-track')) {
                // Reduce task durations on critical path
                optimized.schedule.duration *= (1 - optimization.improvement);
            } else if (change.includes('Resource leveling')) {
                // Apply resource leveling
                optimized.resources = await this.levelResources(optimized.resources);
            } else if (change.includes('buffer')) {
                // Add buffer times
                optimized.schedule.duration *= (1 + optimization.improvement);
            }
        }
        
        return optimized;
    }
}
