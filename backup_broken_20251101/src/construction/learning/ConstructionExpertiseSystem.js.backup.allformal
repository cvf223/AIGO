/**
 * 🏗️ Construction Expertise System
 * =================================
 * CRITICAL SUPERINTELLIGENCE COMPONENT
 * Deep expertise system for construction knowledge, replacing blockchain expertise
 * Accumulates and refines construction domain knowledge through experience
 */

export class ConstructionExpertiseSystem {
    constructor(config = {}) {
        this.config = {
            enableDeepLearning: true,
            enableExpertiseAccumulation: true,
            enableKnowledgeTransfer: true,
            enableContinuousImprovement: true,
            expertiseDecayRate: 0.001,
            learningAmplification: 1.5,
            ...config
        };
        
        this.expertiseDomains = new Map();
        this.expertiseHistory = [];
        this.knowledgeGraph = new Map();
        this.skillLevels = new Map();
        this.experienceMemory = [];
        this.isInitialized = false;
    }
    
    /**
     * Initialize construction expertise system
     */
    async initialize() {
        console.log('🎓 Initializing Construction Expertise System...');
        
        try {
            // Initialize expertise domains
            await this.initializeExpertiseDomains();
            
            // Load historical knowledge
            await this.loadHistoricalKnowledge();
            
            // Initialize skill assessment
            await this.initializeSkillAssessment();
            
            // Setup continuous learning
            await this.setupContinuousLearning();
            
            // Initialize knowledge graph
            await this.initializeKnowledgeGraph();
            
            this.isInitialized = true;
            console.log('   ✅ Construction Expertise System initialized');
            
        } catch (error) {
            console.error('   ❌ Failed to initialize expertise system:', error.message);
            throw error;
        }
    }
    
    /**
     * Initialize construction expertise domains
     */
    async initializeExpertiseDomains() {
        const domains = {
            // Structural expertise
            structural: {
                level: 0.7,
                subdomains: {
                    concrete: 0.8,
                    steel: 0.75,
                    timber: 0.7,
                    foundations: 0.85,
                    seismic: 0.6
                },
                criticalKnowledge: [
                    'load_calculations',
                    'material_properties',
                    'connection_design',
                    'stability_analysis'
                ]
            },
            
            // Project management expertise
            projectManagement: {
                level: 0.75,
                subdomains: {
                    scheduling: 0.8,
                    resourceAllocation: 0.7,
                    riskManagement: 0.75,
                    costControl: 0.8,
                    qualityManagement: 0.7
                },
                criticalKnowledge: [
                    'critical_path_method',
                    'earned_value_management',
                    'risk_matrices',
                    'resource_leveling'
                ]
            },
            
            // HOAI compliance expertise
            hoaiCompliance: {
                level: 0.9,
                subdomains: {
                    phases: 0.95,
                    feeCalculation: 0.9,
                    documentation: 0.85,
                    contracts: 0.8
                },
                criticalKnowledge: [
                    'phase_requirements',
                    'fee_tables',
                    'service_scopes',
                    'legal_framework'
                ]
            },
            
            // Construction methods expertise
            methods: {
                level: 0.8,
                subdomains: {
                    traditional: 0.85,
                    prefabrication: 0.7,
                    modular: 0.65,
                    sustainable: 0.75,
                    bim: 0.7
                },
                criticalKnowledge: [
                    'construction_sequences',
                    'equipment_selection',
                    'safety_procedures',
                    'quality_control'
                ]
            },
            
            // Cost estimation expertise
            costEstimation: {
                level: 0.85,
                subdomains: {
                    quantities: 0.9,
                    unitPrices: 0.85,
                    overhead: 0.8,
                    contingencies: 0.75,
                    lifecycle: 0.7
                },
                criticalKnowledge: [
                    'quantity_takeoff',
                    'price_databases',
                    'cost_indices',
                    'value_engineering'
                ]
            },
            
            // Building physics expertise
            buildingPhysics: {
                level: 0.7,
                subdomains: {
                    thermal: 0.75,
                    acoustic: 0.65,
                    moisture: 0.7,
                    lighting: 0.6,
                    ventilation: 0.7
                },
                criticalKnowledge: [
                    'heat_transfer',
                    'sound_transmission',
                    'moisture_transport',
                    'energy_efficiency'
                ]
            }
        };
        
        for (const [name, domain] of Object.entries(domains)) {
            this.expertiseDomains.set(name, domain);
            
            // Initialize skill tracking
            this.skillLevels.set(name, {
                current: domain.level,
                potential: Math.min(1.0, domain.level + 0.2),
                growth_rate: 0.01
            });
        }
        
        console.log(`   📚 Initialized ${this.expertiseDomains.size} expertise domains`);
    }
    
    /**
     * Load historical construction knowledge
     */
    async loadHistoricalKnowledge() {
        // Simulate loading historical project data
        this.historicalProjects = {
            residential: { count: 150, successRate: 0.92 },
            commercial: { count: 80, successRate: 0.88 },
            industrial: { count: 45, successRate: 0.85 },
            infrastructure: { count: 30, successRate: 0.83 }
        };
        
        // Load common issues and solutions
        this.knownIssues = new Map([
            ['foundation_settlement', { 
                frequency: 0.05, 
                solutions: ['soil_improvement', 'pile_foundation', 'mat_foundation'],
                preventionCost: 5000,
                remediationCost: 50000
            }],
            ['concrete_cracks', { 
                frequency: 0.15, 
                solutions: ['proper_curing', 'expansion_joints', 'reinforcement'],
                preventionCost: 2000,
                remediationCost: 10000
            }],
            ['schedule_delays', { 
                frequency: 0.25, 
                solutions: ['buffer_time', 'parallel_tasks', 'resource_increase'],
                preventionCost: 10000,
                remediationCost: 100000
            }],
            ['cost_overruns', { 
                frequency: 0.20, 
                solutions: ['detailed_estimation', 'contingency', 'value_engineering'],
                preventionCost: 5000,
                remediationCost: 50000
            }]
        ]);
        
        console.log('   📖 Loaded historical knowledge base');
    }
    
    /**
     * Initialize skill assessment mechanisms
     */
    async initializeSkillAssessment() {
        this.assessmentCriteria = {
            accuracy: { weight: 0.3, threshold: 0.8 },
            speed: { weight: 0.2, threshold: 0.7 },
            innovation: { weight: 0.2, threshold: 0.6 },
            problemSolving: { weight: 0.3, threshold: 0.75 }
        };
        
        console.log('   📊 Initialized skill assessment system');
    }
    
    /**
     * Setup continuous learning mechanisms
     */
    async setupContinuousLearning() {
        this.learningMechanisms = {
            experiential: { rate: 0.02, enabled: true },
            collaborative: { rate: 0.015, enabled: true },
            theoretical: { rate: 0.01, enabled: true },
            reflective: { rate: 0.025, enabled: true }
        };
        
        // Start continuous improvement cycle
        if (this.config.enableContinuousImprovement) {
            this.startContinuousImprovement();
        }
        
        console.log('   🔄 Setup continuous learning mechanisms');
    }
    
    /**
     * Initialize knowledge graph
     */
    async initializeKnowledgeGraph() {
        // Create connections between expertise domains
        this.knowledgeGraph.set('structural→methods', { strength: 0.9, bidirectional: true });
        this.knowledgeGraph.set('methods→costEstimation', { strength: 0.85, bidirectional: true });
        this.knowledgeGraph.set('projectManagement→hoaiCompliance', { strength: 0.8, bidirectional: true });
        this.knowledgeGraph.set('buildingPhysics→structural', { strength: 0.7, bidirectional: true });
        this.knowledgeGraph.set('costEstimation→projectManagement', { strength: 0.9, bidirectional: true });
        
        console.log('   🕸️ Initialized knowledge graph with connections');
    }
    
    /**
     * Apply expertise to construction problem
     */
    async applyExpertise(problem, context = {}) {
        console.log('   🎓 Applying construction expertise...');
        
        const solution = {
            problem,
            timestamp: new Date(),
            relevantDomains: [],
            recommendations: [],
            confidence: 0,
            learnings: []
        };
        
        try {
            // Identify relevant expertise domains
            solution.relevantDomains = this.identifyRelevantDomains(problem);
            
            // Apply expertise from each domain
            for (const domain of solution.relevantDomains) {
                const domainExpertise = await this.applyDomainExpertise(domain, problem, context);
                solution.recommendations.push(...domainExpertise.recommendations);
                solution.learnings.push(...domainExpertise.learnings);
            }
            
            // Cross-domain synthesis
            const synthesis = await this.synthesizeAcrossDomains(solution.recommendations);
            solution.synthesis = synthesis;
            
            // Calculate overall confidence
            solution.confidence = this.calculateSolutionConfidence(solution);
            
            // Learn from this application
            await this.learnFromApplication(problem, solution);
            
            // Store in experience memory
            this.experienceMemory.push({
                timestamp: new Date(),
                problem,
                solution,
                outcome: 'pending'
            });
            
        } catch (error) {
            solution.error = error.message;
            console.error('   ❌ Failed to apply expertise:', error.message);
        }
        
        return solution;
    }
    
    /**
     * Identify relevant expertise domains
     */
    identifyRelevantDomains(problem) {
        const relevantDomains = [];
        const problemType = problem.type || 'general';
        
        // Map problem types to expertise domains
        const domainMapping = {
            structural_design: ['structural', 'buildingPhysics', 'methods'],
            cost_estimation: ['costEstimation', 'projectManagement', 'methods'],
            scheduling: ['projectManagement', 'methods', 'hoaiCompliance'],
            compliance: ['hoaiCompliance', 'projectManagement'],
            quality_issue: ['methods', 'structural', 'buildingPhysics'],
            optimization: ['costEstimation', 'projectManagement', 'methods']
        };
        
        const domains = domainMapping[problemType] || ['projectManagement', 'methods'];
        
        for (const domain of domains) {
            if (this.expertiseDomains.has(domain)) {
                relevantDomains.push({
                    name: domain,
                    expertise: this.expertiseDomains.get(domain),
                    relevance: this.calculateRelevance(domain, problem)
                });
            }
        }
        
        // Sort by relevance
        relevantDomains.sort((a, b) => b.relevance - a.relevance);
        
        return relevantDomains;
    }
    
    /**
     * Calculate domain relevance
     */
    calculateRelevance(domain, problem) {
        // Simplified relevance calculation
        const baseRelevance = 0.5;
        const domainData = this.expertiseDomains.get(domain);
        
        if (!domainData) return baseRelevance;
        
        // Check if problem keywords match critical knowledge
        let keywordMatches = 0;
        const problemText = JSON.stringify(problem).toLowerCase();
        
        for (const knowledge of domainData.criticalKnowledge) {
            if (problemText.includes(knowledge.replace('_', ' '))) {
                keywordMatches++;
            }
        }
        
        const keywordBonus = keywordMatches * 0.1;
        const expertiseLevel = domainData.level;
        
        return Math.min(1.0, baseRelevance + keywordBonus + expertiseLevel * 0.2);
    }
    
    /**
     * Apply domain-specific expertise
     */
    async applyDomainExpertise(domain, problem, context) {
        const expertise = {
            domain: domain.name,
            recommendations: [],
            learnings: [],
            confidence: domain.expertise.level
        };
        
        // Apply domain-specific rules and knowledge
        switch (domain.name) {
            case 'structural':
                expertise.recommendations = await this.applyStructuralExpertise(problem, context);
                break;
            
            case 'projectManagement':
                expertise.recommendations = await this.applyProjectManagementExpertise(problem, context);
                break;
            
            case 'hoaiCompliance':
                expertise.recommendations = await this.applyHOAIExpertise(problem, context);
                break;
            
            case 'costEstimation':
                expertise.recommendations = await this.applyCostExpertise(problem, context);
                break;
            
            case 'methods':
                expertise.recommendations = await this.applyMethodsExpertise(problem, context);
                break;
            
            case 'buildingPhysics':
                expertise.recommendations = await this.applyPhysicsExpertise(problem, context);
                break;
            
            default:
                expertise.recommendations = [{
                    action: 'analyze',
                    description: 'Requires further analysis',
                    confidence: 0.5
                }];
        }
        
        // Extract learnings
        expertise.learnings = this.extractLearnings(expertise.recommendations);
        
        return expertise;
    }
    
    /**
     * Apply structural expertise
     */
    async applyStructuralExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.loadRequirements) {
            recommendations.push({
                action: 'perform_load_analysis',
                description: 'Conduct detailed load path analysis',
                confidence: 0.9,
                details: {
                    dead_loads: problem.loadRequirements.dead || 'calculate',
                    live_loads: problem.loadRequirements.live || 'per_code',
                    wind_loads: problem.loadRequirements.wind || 'per_location',
                    seismic: problem.loadRequirements.seismic || 'check_zone'
                }
            });
        }
        
        if (problem.materialSelection) {
            const material = this.selectOptimalMaterial(problem.requirements);
            recommendations.push({
                action: 'material_recommendation',
                description: `Recommend ${material.type} for optimal performance`,
                confidence: material.confidence,
                details: material
            });
        }
        
        return recommendations;
    }
    
    /**
     * Select optimal material
     */
    selectOptimalMaterial(requirements) {
        const materials = {
            concrete: { cost: 0.7, strength: 0.8, durability: 0.9, speed: 0.6 },
            steel: { cost: 0.5, strength: 0.95, durability: 0.8, speed: 0.8 },
            timber: { cost: 0.8, strength: 0.6, durability: 0.6, speed: 0.9 },
            composite: { cost: 0.3, strength: 0.9, durability: 0.95, speed: 0.7 }
        };
        
        let bestMaterial = 'concrete';
        let bestScore = 0;
        
        for (const [material, properties] of Object.entries(materials)) {
            let score = 0;
            
            if (requirements.prioritizeCost) score += properties.cost * 0.4;
            if (requirements.prioritizeStrength) score += properties.strength * 0.3;
            if (requirements.prioritizeDurability) score += properties.durability * 0.2;
            if (requirements.prioritizeSpeed) score += properties.speed * 0.1;
            
            if (score > bestScore) {
                bestScore = score;
                bestMaterial = material;
            }
        }
        
        return {
            type: bestMaterial,
            confidence: bestScore,
            properties: materials[bestMaterial]
        };
    }
    
    /**
     * Apply project management expertise
     */
    async applyProjectManagementExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.scheduling) {
            recommendations.push({
                action: 'optimize_schedule',
                description: 'Apply critical path optimization',
                confidence: 0.85,
                details: {
                    method: 'CPM',
                    compression: 'fast_tracking',
                    buffer: '10%_total_duration'
                }
            });
        }
        
        if (problem.resourceAllocation) {
            recommendations.push({
                action: 'level_resources',
                description: 'Apply resource leveling algorithm',
                confidence: 0.8,
                details: {
                    priority: 'critical_activities',
                    constraint: 'resource_availability'
                }
            });
        }
        
        if (problem.riskManagement) {
            const risks = this.identifyProjectRisks(problem);
            recommendations.push({
                action: 'mitigate_risks',
                description: 'Implement risk mitigation strategies',
                confidence: 0.75,
                details: risks
            });
        }
        
        return recommendations;
    }
    
    /**
     * Identify project risks
     */
    identifyProjectRisks(problem) {
        const risks = [];
        
        // Check known issues
        for (const [issue, data] of this.knownIssues) {
            if (Math.random() < data.frequency) {
                risks.push({
                    type: issue,
                    probability: data.frequency,
                    impact: data.remediationCost,
                    mitigation: data.solutions[0],
                    cost: data.preventionCost
                });
            }
        }
        
        return risks;
    }
    
    /**
     * Apply HOAI expertise
     */
    async applyHOAIExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.phase) {
            recommendations.push({
                action: 'verify_phase_compliance',
                description: `Ensure compliance with HOAI phase ${problem.phase}`,
                confidence: 0.95,
                details: {
                    requiredDeliverables: this.getHOAIDeliverables(problem.phase),
                    feePercentage: this.getHOAIFeePercentage(problem.phase)
                }
            });
        }
        
        if (problem.feeCalculation) {
            const fee = this.calculateHOAIFee(problem.projectValue, problem.complexity);
            recommendations.push({
                action: 'calculate_fee',
                description: 'HOAI-compliant fee calculation',
                confidence: 0.9,
                details: fee
            });
        }
        
        return recommendations;
    }
    
    /**
     * Get HOAI deliverables for phase
     */
    getHOAIDeliverables(phase) {
        const deliverables = {
            'LPH1': ['basic_evaluation', 'feasibility_study'],
            'LPH2': ['preliminary_design', 'cost_estimate'],
            'LPH3': ['design_development', 'draft_planning'],
            'LPH4': ['approval_planning', 'permit_documents'],
            'LPH5': ['execution_planning', 'tender_documents']
        };
        
        return deliverables[phase] || [];
    }
    
    /**
     * Get HOAI fee percentage
     */
    getHOAIFeePercentage(phase) {
        const percentages = {
            'LPH1': 3,
            'LPH2': 7,
            'LPH3': 15,
            'LPH4': 3,
            'LPH5': 25,
            'LPH6': 10,
            'LPH7': 4,
            'LPH8': 31,
            'LPH9': 2
        };
        
        return percentages[phase] || 0;
    }
    
    /**
     * Calculate HOAI fee
     */
    calculateHOAIFee(projectValue, complexity) {
        const baseFee = projectValue * 0.08; // 8% base
        const complexityMultiplier = {
            low: 0.8,
            medium: 1.0,
            high: 1.3,
            very_high: 1.5
        };
        
        const multiplier = complexityMultiplier[complexity] || 1.0;
        
        return {
            base: baseFee,
            adjusted: baseFee * multiplier,
            complexity,
            breakdown: {
                planning: baseFee * multiplier * 0.53,
                supervision: baseFee * multiplier * 0.47
            }
        };
    }
    
    /**
     * Apply cost estimation expertise
     */
    async applyCostExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.quantities) {
            recommendations.push({
                action: 'perform_quantity_takeoff',
                description: 'Detailed quantity calculation',
                confidence: 0.9,
                method: 'BIM_based'
            });
        }
        
        if (problem.pricing) {
            const pricing = this.estimatePricing(problem);
            recommendations.push({
                action: 'price_estimation',
                description: 'Market-based price estimation',
                confidence: 0.85,
                details: pricing
            });
        }
        
        return recommendations;
    }
    
    /**
     * Estimate pricing
     */
    estimatePricing(problem) {
        return {
            materials: problem.area * 450, // EUR/m²
            labor: problem.area * 350,
            equipment: problem.area * 50,
            overhead: problem.area * 100,
            total: problem.area * 950
        };
    }
    
    /**
     * Apply construction methods expertise
     */
    async applyMethodsExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.methodSelection) {
            const method = this.selectConstructionMethod(problem);
            recommendations.push({
                action: 'method_selection',
                description: `Recommend ${method.type} construction method`,
                confidence: method.confidence,
                details: method
            });
        }
        
        return recommendations;
    }
    
    /**
     * Select construction method
     */
    selectConstructionMethod(problem) {
        if (problem.timeConstraint === 'urgent') {
            return {
                type: 'prefabrication',
                confidence: 0.85,
                timeReduction: '40%',
                costIncrease: '10%'
            };
        } else if (problem.budgetConstraint === 'tight') {
            return {
                type: 'traditional',
                confidence: 0.8,
                timeIncrease: '0%',
                costReduction: '15%'
            };
        } else {
            return {
                type: 'hybrid',
                confidence: 0.75,
                balanced: true
            };
        }
    }
    
    /**
     * Apply building physics expertise
     */
    async applyPhysicsExpertise(problem, context) {
        const recommendations = [];
        
        if (problem.energyEfficiency) {
            recommendations.push({
                action: 'optimize_envelope',
                description: 'Optimize building envelope for energy efficiency',
                confidence: 0.8,
                details: {
                    insulation: 'U-value < 0.15 W/m²K',
                    windows: 'triple_glazing',
                    airtightness: 'n50 < 0.6 h⁻¹'
                }
            });
        }
        
        return recommendations;
    }
    
    /**
     * Synthesize recommendations across domains
     */
    async synthesizeAcrossDomains(recommendations) {
        // Check for conflicts
        const conflicts = this.detectConflicts(recommendations);
        
        // Prioritize recommendations
        const prioritized = this.prioritizeRecommendations(recommendations);
        
        // Create integrated solution
        return {
            conflicts,
            priorities: prioritized,
            integrated: this.integrateRecommendations(prioritized)
        };
    }
    
    /**
     * Detect conflicts in recommendations
     */
    detectConflicts(recommendations) {
        const conflicts = [];
        
        for (let i = 0; i < recommendations.length; i++) {
            for (let j = i + 1; j < recommendations.length; j++) {
                if (this.areConflicting(recommendations[i], recommendations[j])) {
                    conflicts.push({
                        rec1: recommendations[i],
                        rec2: recommendations[j],
                        type: 'resource_conflict'
                    });
                }
            }
        }
        
        return conflicts;
    }
    
    /**
     * Check if recommendations conflict
     */
    areConflicting(rec1, rec2) {
        // Simplified conflict detection
        return rec1.action === 'accelerate' && rec2.action === 'reduce_cost';
    }
    
    /**
     * Prioritize recommendations
     */
    prioritizeRecommendations(recommendations) {
        return recommendations.sort((a, b) => b.confidence - a.confidence);
    }
    
    /**
     * Integrate recommendations
     */
    integrateRecommendations(recommendations) {
        return {
            primary: recommendations.slice(0, 3),
            secondary: recommendations.slice(3, 6),
            optional: recommendations.slice(6)
        };
    }
    
    /**
     * Calculate solution confidence
     */
    calculateSolutionConfidence(solution) {
        if (solution.recommendations.length === 0) return 0;
        
        const avgConfidence = solution.recommendations.reduce((sum, r) => 
            sum + r.confidence, 0) / solution.recommendations.length;
        
        const domainCoverage = solution.relevantDomains.length / this.expertiseDomains.size;
        
        return avgConfidence * (0.7 + 0.3 * domainCoverage);
    }
    
    /**
     * Extract learnings from recommendations
     */
    extractLearnings(recommendations) {
        return recommendations.map(r => ({
            action: r.action,
            confidence: r.confidence,
            timestamp: new Date()
        }));
    }
    
    /**
     * Learn from application
     */
    async learnFromApplication(problem, solution) {
        // Update expertise levels based on application
        for (const domain of solution.relevantDomains) {
            const skill = this.skillLevels.get(domain.name);
            if (skill) {
                // Increase skill through application
                skill.current = Math.min(
                    skill.potential,
                    skill.current + skill.growth_rate * this.config.learningAmplification
                );
            }
        }
        
        // Add to expertise history
        this.expertiseHistory.push({
            timestamp: new Date(),
            problem: problem.type,
            domains: solution.relevantDomains.map(d => d.name),
            confidence: solution.confidence
        });
        
        // Trim history if too large
        if (this.expertiseHistory.length > 1000) {
            this.expertiseHistory = this.expertiseHistory.slice(-500);
        }
    }
    
    /**
     * Start continuous improvement
     */
    startContinuousImprovement() {
        setInterval(() => {
            this.performSelfAssessment();
            this.updateExpertiseLevels();
        }, 3600000); // Every hour
    }
    
    /**
     * Perform self-assessment
     */
    performSelfAssessment() {
        for (const [domain, data] of this.expertiseDomains) {
            // Apply expertise decay
            data.level *= (1 - this.config.expertiseDecayRate);
            
            // Check recent applications
            const recentUses = this.expertiseHistory.filter(h => 
                h.domains.includes(domain) && 
                (Date.now() - h.timestamp) < 86400000
            ).length;
            
            // Boost if recently used
            if (recentUses > 0) {
                data.level = Math.min(1.0, data.level * (1 + 0.01 * recentUses));
            }
        }
    }
    
    /**
     * Update expertise levels
     */
    updateExpertiseLevels() {
        for (const [name, skill] of this.skillLevels) {
            const domain = this.expertiseDomains.get(name);
            if (domain) {
                domain.level = skill.current;
            }
        }
    }
    
    /**
     * Get expertise summary
     */
    getExpertiseSummary() {
        const summary = {
            domains: {},
            recentApplications: this.expertiseHistory.slice(-10),
            overallLevel: 0
        };
        
        let totalLevel = 0;
        
        for (const [name, data] of this.expertiseDomains) {
            summary.domains[name] = {
                level: data.level,
                subdomains: Object.keys(data.subdomains).length
            };
            totalLevel += data.level;
        }
        
        summary.overallLevel = totalLevel / this.expertiseDomains.size;
        
        return summary;
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            domains: this.expertiseDomains.size,
            experienceCount: this.experienceMemory.length,
            knowledgeConnections: this.knowledgeGraph.size,
            averageExpertise: this.getExpertiseSummary().overallLevel
        };
    }
}

// Export singleton instance
export const constructionExpertiseSystem = new ConstructionExpertiseSystem();
export default ConstructionExpertiseSystem;

