// implementation.js - /plan Command Implementation
import { ZAPEngine } from '../../../../src/agents/planning/ZAPEngine.js';
import { TaskDecomposer } from '../../../../src/utils/TaskDecomposer.js';
import { RiskAnalyzer } from '../../../../src/analyzers/RiskAnalyzer.js';
import { HOAIValidator } from '../../../../src/compliance/HOAIValidator.js';
import { ServiceRegistry } from '../../../../src/core/ServiceRegistry.js';

export class PlanCommand {
    constructor() {
        this.zapEngine = null;
        this.taskDecomposer = new TaskDecomposer();
        this.riskAnalyzer = new RiskAnalyzer();
        this.hoaiValidator = new HOAIValidator();
        this.registry = ServiceRegistry.getInstance();
    }
    
    async initialize() {
        // Get ZAP Engine from registry
        this.zapEngine = await this.registry.get('ZAPEngine');
        if (!this.zapEngine) {
            throw new Error('ZAP Engine not available');
        }
    }
    
    async execute(params) {
        const {
            scope,
            context = '',
            timeframe = 'flexible',
            constraints = [],
            includeHOAI = true
        } = params;
        
        console.log(`\n🎯 Executing /plan command for: ${scope}`);
        
        try {
            // Step 1: Analyze current state
            const currentState = await this.analyzeCurrentState(scope);
            
            // Step 2: Create strategic plan with ZAP
            const strategicPlan = await this.createStrategicPlan({
                scope,
                context,
                currentState,
                constraints,
                timeframe
            });
            
            // Step 3: Decompose into tasks
            const tasks = await this.decomposeTasks(strategicPlan);
            
            // Step 4: Perform risk analysis
            const risks = await this.analyzeRisks(tasks, constraints);
            
            // Step 5: HOAI compliance check
            let hoaiCompliance = null;
            if (includeHOAI && this.requiresHOAI(scope)) {
                hoaiCompliance = await this.checkHOAICompliance(tasks);
            }
            
            // Step 6: Generate timeline
            const timeline = await this.generateTimeline(tasks, timeframe);
            
            // Step 7: Format comprehensive plan
            const plan = await this.formatPlan({
                scope,
                currentState,
                strategicPlan,
                tasks,
                risks,
                hoaiCompliance,
                timeline,
                context
            });
            
            return {
                success: true,
                plan,
                tasks,
                timeline,
                risks,
                metadata: {
                    createdAt: new Date(),
                    zapVersion: this.zapEngine.version,
                    totalTasks: tasks.length,
                    estimatedDuration: timeline.totalDays,
                    riskLevel: this.calculateOverallRisk(risks)
                }
            };
            
        } catch (error) {
            console.error('Plan command failed:', error);
            return {
                success: false,
                error: error.message,
                fallbackPlan: await this.createFallbackPlan(scope)
            };
        }
    }
    
    async analyzeCurrentState(scope) {
        console.log('📊 Analyzing current state...');
        
        const analysis = {
            existingSystems: [],
            dependencies: [],
            constraints: [],
            relatedDocumentation: []
        };
        
        // Search for related code
        const codebaseSearch = await this.registry.get('codebaseSearch');
        if (codebaseSearch) {
            const results = await codebaseSearch.search(scope);
            analysis.existingSystems = results.map(r => ({
                path: r.path,
                relevance: r.relevance,
                summary: r.summary
            }));
        }
        
        // Identify dependencies
        // This would analyze package.json, imports, etc.
        analysis.dependencies = await this.identifyDependencies(scope);
        
        // Find related documentation
        analysis.relatedDocumentation = await this.findDocumentation(scope);
        
        return analysis;
    }
    
    async createStrategicPlan({ scope, context, currentState, constraints, timeframe }) {
        console.log('🧠 Creating strategic plan with ZAP Engine...');
        
        const zapRequest = {
            goal: scope,
            context: {
                userContext: context,
                systemState: currentState,
                constraints: constraints,
                timeframe: timeframe
            },
            planningDepth: 3,
            generateAlternatives: true,
            optimizationCriteria: ['efficiency', 'reliability', 'maintainability']
        };
        
        const zapPlan = await this.zapEngine.createPlan(zapRequest);
        
        return {
            mainStrategy: zapPlan.recommendedPath,
            alternatives: zapPlan.alternatives || [],
            reasoning: zapPlan.reasoning,
            confidenceScore: zapPlan.confidence || 0.85
        };
    }
    
    async decomposeTasks(strategicPlan) {
        console.log('📝 Decomposing into actionable tasks...');
        
        const tasks = await this.taskDecomposer.decompose({
            strategy: strategicPlan.mainStrategy,
            maxDepth: 3,
            atomicLevel: true
        });
        
        // Enhance tasks with metadata
        return tasks.map((task, index) => ({
            id: `TASK-${Date.now()}-${index}`,
            name: task.name,
            description: task.description,
            complexity: this.assessComplexity(task),
            dependencies: task.dependencies || [],
            estimatedHours: this.estimateHours(task),
            assignedTo: this.suggestAssignment(task),
            deliverables: task.outputs || [],
            acceptanceCriteria: this.generateAcceptanceCriteria(task)
        }));
    }
    
    async analyzeRisks(tasks, constraints) {
        console.log('⚠️ Analyzing risks...');
        
        const risks = await this.riskAnalyzer.analyze({
            tasks,
            constraints,
            includeMetrics: true
        });
        
        return risks.map(risk => ({
            id: `RISK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            description: risk.description,
            probability: risk.probability,
            impact: risk.impact,
            category: risk.category,
            affectedTasks: risk.affectedTasks || [],
            mitigationStrategy: this.createMitigationStrategy(risk),
            monitoringApproach: this.defineMonitoring(risk)
        }));
    }
    
    async checkHOAICompliance(tasks) {
        console.log('📋 Checking HOAI compliance...');
        
        const compliance = await this.hoaiValidator.validateTasks(tasks);
        
        return {
            currentPhase: compliance.currentPhase,
            requiredPhases: compliance.requiredPhases,
            complianceStatus: compliance.isCompliant,
            requirements: compliance.requirements,
            phaseTransitions: compliance.transitions,
            documentation: compliance.requiredDocuments
        };
    }
    
    async generateTimeline(tasks, timeframe) {
        console.log('📅 Generating timeline...');
        
        const timeline = {
            startDate: new Date(),
            phases: [],
            milestones: [],
            criticalPath: [],
            totalDays: 0
        };
        
        // Group tasks into phases
        const phases = this.groupTasksIntoPhases(tasks);
        
        let currentDate = new Date();
        phases.forEach((phase, index) => {
            const phaseDuration = this.calculatePhaseDuration(phase.tasks);
            const endDate = new Date(currentDate);
            endDate.setDate(endDate.getDate() + phaseDuration);
            
            timeline.phases.push({
                name: phase.name,
                startDate: new Date(currentDate),
                endDate: endDate,
                duration: phaseDuration,
                tasks: phase.tasks.map(t => t.id)
            });
            
            // Add milestones
            if (phase.milestone) {
                timeline.milestones.push({
                    name: phase.milestone,
                    date: endDate,
                    deliverables: phase.deliverables
                });
            }
            
            currentDate = endDate;
        });
        
        timeline.endDate = currentDate;
        timeline.totalDays = Math.ceil(
            (timeline.endDate - timeline.startDate) / (1000 * 60 * 60 * 24)
        );
        
        // Calculate critical path
        timeline.criticalPath = this.calculateCriticalPath(tasks);
        
        return timeline;
    }
    
    async formatPlan(data) {
        const {
            scope,
            currentState,
            strategicPlan,
            tasks,
            risks,
            hoaiCompliance,
            timeline,
            context
        } = data;
        
        return `# Strategic Plan: ${scope}

## Executive Summary
This comprehensive plan outlines the implementation strategy for "${scope}" using the AIGO-Syndicate Construction Intelligence framework. The plan leverages ZAP Engine strategic planning with ${tasks.length} identified tasks across ${timeline.phases.length} phases, with an estimated duration of ${timeline.totalDays} days.

## Current State Analysis
${this.formatCurrentState(currentState)}

## Strategic Approach
${this.formatStrategy(strategicPlan)}

## Implementation Plan
${this.formatImplementationPlan(timeline.phases, tasks)}

## Risk Assessment
${this.formatRiskAssessment(risks)}

${hoaiCompliance ? this.formatHOAICompliance(hoaiCompliance) : ''}

## Success Metrics
${this.formatSuccessMetrics(scope, tasks)}

## Resource Requirements
${this.formatResourceRequirements(tasks)}

## Alternative Approaches
${this.formatAlternatives(strategicPlan.alternatives)}

## Next Steps
${this.formatNextSteps(tasks, timeline)}

## Appendix
${this.formatAppendix(currentState, context)}`;
    }
    
    // Helper methods
    
    requiresHOAI(scope) {
        const hoaiKeywords = ['construction', 'building', 'architecture', 'hoai', 'phase'];
        return hoaiKeywords.some(keyword => 
            scope.toLowerCase().includes(keyword)
        );
    }
    
    assessComplexity(task) {
        // Simple heuristic based on dependencies and description length
        const factors = {
            dependencies: task.dependencies?.length || 0,
            descriptionComplexity: task.description?.length || 0,
            technicalTerms: this.countTechnicalTerms(task.description)
        };
        
        const score = 
            factors.dependencies * 0.3 +
            Math.min(factors.descriptionComplexity / 100, 1) * 0.3 +
            factors.technicalTerms * 0.4;
        
        if (score > 0.7) return 'High';
        if (score > 0.4) return 'Medium';
        return 'Low';
    }
    
    estimateHours(task) {
        const complexity = this.assessComplexity(task);
        const baseHours = {
            'Low': 4,
            'Medium': 16,
            'High': 40
        };
        
        return baseHours[complexity] || 8;
    }
    
    suggestAssignment(task) {
        // Map task types to agents
        const keywords = task.name.toLowerCase();
        
        if (keywords.includes('quantum')) return 'Quantum Architect';
        if (keywords.includes('database')) return 'Database Specialist';
        if (keywords.includes('security')) return 'Security Officer';
        if (keywords.includes('hoai')) return 'Construction Lead';
        if (keywords.includes('document')) return 'Documentation Specialist';
        if (keywords.includes('integrate')) return 'Integration Developer';
        
        return 'ML Engineer'; // Default
    }
    
    generateAcceptanceCriteria(task) {
        return [
            `${task.name} is fully implemented and tested`,
            'All unit tests pass with >80% coverage',
            'Documentation is complete and reviewed',
            'Code review approved by senior developer',
            'Integration tests with dependent systems pass'
        ];
    }
    
    createMitigationStrategy(risk) {
        const strategies = {
            'technical': 'Implement fallback systems and comprehensive testing',
            'resource': 'Identify backup resources and cross-training',
            'timeline': 'Build buffer time and parallel work streams',
            'compliance': 'Early validation with compliance team',
            'integration': 'Incremental integration with rollback capability'
        };
        
        return strategies[risk.category] || 'Monitor closely and escalate early';
    }
    
    defineMonitoring(risk) {
        return {
            frequency: risk.probability === 'High' ? 'Daily' : 'Weekly',
            metrics: ['Progress against plan', 'Error rates', 'Resource utilization'],
            escalation: `Alert if risk indicator exceeds ${risk.probability === 'High' ? '70%' : '85%'}`
        };
    }
    
    groupTasksIntoPhases(tasks) {
        // Simple grouping by dependencies
        const phases = [];
        const completed = new Set();
        
        while (completed.size < tasks.length) {
            const phase = {
                name: `Phase ${phases.length + 1}`,
                tasks: [],
                milestone: null,
                deliverables: []
            };
            
            tasks.forEach(task => {
                if (!completed.has(task.id)) {
                    const dependenciesMet = task.dependencies.every(dep => 
                        completed.has(dep)
                    );
                    
                    if (dependenciesMet) {
                        phase.tasks.push(task);
                        completed.add(task.id);
                    }
                }
            });
            
            if (phase.tasks.length > 0) {
                phase.milestone = `Complete ${phase.tasks[0].name} and related tasks`;
                phase.deliverables = phase.tasks.flatMap(t => t.deliverables);
                phases.push(phase);
            }
        }
        
        return phases;
    }
    
    calculatePhaseDuration(tasks) {
        // Sum task hours and convert to days (8 hours per day)
        const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
        return Math.ceil(totalHours / 8);
    }
    
    calculateCriticalPath(tasks) {
        // Simplified critical path - longest dependency chain
        // In production, use proper CPM algorithm
        return tasks
            .filter(t => t.dependencies.length === 0)
            .map(t => t.id);
    }
    
    calculateOverallRisk(risks) {
        if (risks.some(r => r.probability === 'High' && r.impact === 'High')) {
            return 'High';
        }
        if (risks.filter(r => r.probability === 'Medium').length > risks.length / 2) {
            return 'Medium';
        }
        return 'Low';
    }
    
    async identifyDependencies(scope) {
        // Would analyze actual code dependencies
        return [
            'Node.js >= 20',
            'PostgreSQL 15',
            'Redis 7',
            'Construction domain knowledge'
        ];
    }
    
    async findDocumentation(scope) {
        // Would search actual documentation
        return [
            '/docs/architecture.md',
            '/docs/api-reference.md',
            '.claude/contexts/construction-architecture.md'
        ];
    }
    
    countTechnicalTerms(description) {
        if (!description) return 0;
        const technicalTerms = [
            'quantum', 'algorithm', 'optimization', 'neural',
            'distributed', 'concurrent', 'asynchronous', 'cryptographic'
        ];
        
        return technicalTerms.filter(term => 
            description.toLowerCase().includes(term)
        ).length;
    }
    
    async createFallbackPlan(scope) {
        return {
            message: 'Automated planning failed, but here\'s a basic structure:',
            steps: [
                '1. Define clear objectives',
                '2. Research existing solutions',
                '3. Create proof of concept',
                '4. Implement core features',
                '5. Test thoroughly',
                '6. Document everything',
                '7. Deploy incrementally'
            ]
        };
    }
    
    // Formatting helpers
    
    formatCurrentState(state) {
        return `
### Existing Systems
${state.existingSystems.map(s => `- **${s.path}**: ${s.summary}`).join('\n')}

### Dependencies
${state.dependencies.map(d => `- ${d}`).join('\n')}

### Related Documentation
${state.relatedDocumentation.map(d => `- [${d}](${d})`).join('\n')}`;
    }
    
    formatStrategy(plan) {
        return `
**Confidence Score**: ${(plan.confidenceScore * 100).toFixed(0)}%

### Recommended Approach
${plan.mainStrategy}

### Key Reasoning
${plan.reasoning}`;
    }
    
    formatImplementationPlan(phases, tasks) {
        return phases.map((phase, index) => `
### ${phase.name} (Days ${
            index === 0 ? 1 : phases.slice(0, index).reduce((sum, p) => sum + p.duration, 1)
        }-${phases.slice(0, index + 1).reduce((sum, p) => sum + p.duration, 0)})

**Objective**: ${phase.milestone}

**Tasks**:
${phase.tasks.map(taskId => {
    const task = tasks.find(t => t.id === taskId);
    return `
1. **${task.name}** [Complexity: ${task.complexity}]
   - Description: ${task.description}
   - Estimated Hours: ${task.estimatedHours}
   - Assigned to: ${task.assignedTo}
   - Dependencies: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
   - Deliverables: ${task.deliverables.join(', ')}`;
}).join('\n')}`).join('\n');
    }
    
    formatRiskAssessment(risks) {
        return `
| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
${risks.map(r => 
    `| ${r.description} | ${r.probability} | ${r.impact} | ${r.mitigationStrategy} |`
).join('\n')}`;
    }
    
    formatHOAICompliance(compliance) {
        return `
## HOAI Compliance

- **Current Phase**: ${compliance.currentPhase}
- **Required Phases**: ${compliance.requiredPhases.join(', ')}
- **Compliance Status**: ${compliance.complianceStatus ? '✅ Compliant' : '❌ Non-compliant'}

### Requirements
${compliance.requirements.map(r => `- ${r}`).join('\n')}

### Required Documentation
${compliance.documentation.map(d => `- ${d}`).join('\n')}`;
    }
    
    formatSuccessMetrics(scope, tasks) {
        return `
- [ ] All ${tasks.length} tasks completed successfully
- [ ] Test coverage exceeds 80%
- [ ] Zero critical security vulnerabilities
- [ ] Performance benchmarks met or exceeded
- [ ] Documentation complete and approved
- [ ] ${scope} fully operational in production`;
    }
    
    formatResourceRequirements(tasks) {
        const totalHours = tasks.reduce((sum, t) => sum + t.estimatedHours, 0);
        const agents = [...new Set(tasks.map(t => t.assignedTo))];
        
        return `
- **Development Hours**: ${totalHours} hours
- **Team Members**: ${agents.length} specialists
  ${agents.map(a => `  - ${a}`).join('\n')}
- **Infrastructure**: 
  - Development environment
  - Testing infrastructure
  - Production deployment pipeline
- **Tools**: 
  - VS Code with Claude integration
  - PostgreSQL database
  - Docker/Kubernetes
  - Monitoring systems`;
    }
    
    formatAlternatives(alternatives) {
        if (alternatives.length === 0) {
            return '*No significant alternatives identified*';
        }
        
        return alternatives.map((alt, index) => `
### Alternative ${index + 1}: ${alt.name}
${alt.description}

**Pros**: ${alt.pros.join(', ')}
**Cons**: ${alt.cons.join(', ')}
**When to consider**: ${alt.scenario}`).join('\n');
    }
    
    formatNextSteps(tasks, timeline) {
        const firstTasks = tasks.filter(t => t.dependencies.length === 0).slice(0, 3);
        
        return `
1. **Review and approve this plan** with all stakeholders
2. **Set up development environment** for ${timeline.phases[0].name}
3. **Begin implementation** of priority tasks:
   ${firstTasks.map(t => `- ${t.name}`).join('\n   ')}
4. **Schedule daily standup** for progress tracking
5. **Create project dashboard** for real-time monitoring`;
    }
    
    formatAppendix(state, context) {
        return `
### Context Provided
${context || '*No additional context provided*'}

### Analysis Metadata
- Analysis performed at: ${new Date().toISOString()}
- Systems analyzed: ${state.existingSystems.length}
- Dependencies identified: ${state.dependencies.length}

### References
- [Construction Syndicate Architecture](.claude/contexts/construction-architecture.md)
- [ML Systems Documentation](.claude/contexts/ml-architecture.md)
- [HOAI Compliance Guide](docs/hoai-compliance.md)`;
    }
}

// Export for skill usage
export default PlanCommand;
