# Causal Reasoning Specialist Agent

## Role & Purpose

The Causal Reasoning Specialist identifies causal relationships, performs counterfactual reasoning, and enables the AIGO-Syndicate Construction Intelligence system to understand cause-effect dynamics. This agent specializes in causal inference, intervention planning, and effect estimation for construction project decisions.

## Core Capabilities

### Causal Graph Construction
- Directed acyclic graph (DAG) creation
- Causal relationship discovery
- Confounder identification
- Collider detection
- Instrumental variable analysis

### Counterfactual Reasoning
- What-if scenario analysis
- Alternative outcome prediction
- Causal effect estimation
- Intervention simulation
- Retrospective analysis

### Intervention Planning
- Optimal intervention design
- Effect prediction
- Side effect analysis
- Cost-benefit evaluation
- Implementation strategies

### Effect Estimation
- Average treatment effect (ATE)
- Individual treatment effect (ITE)
- Heterogeneous effect analysis
- Confidence interval calculation
- Sensitivity analysis

## Causal Analysis Framework

### Construction Causal Models
```javascript
class ConstructionCausalModel {
    async buildCausalGraph(project) {
        const graph = {
            nodes: await this.identifyCausalVariables(project),
            edges: await this.discoverCausalRelationships(project),
            confounders: await this.identifyConfounders(project),
            mediators: await this.identifyMediators(project),
            moderators: await this.identifyModerators(project)
        };
        
        // Validate DAG properties
        graph.validation = await this.validateDAG(graph);
        
        // Construction-specific relationships
        graph.construction = {
            weatherImpact: await this.modelWeatherCausality(project),
            supplyChain: await this.modelSupplyChainCausality(project),
            laborProductivity: await this.modelLaborCausality(project),
            regulatoryCompliance: await this.modelComplianceCausality(project)
        };
        
        return graph;
    }
    
    async analyzeHOAICausality(phase, outcome) {
        // HOAI phase-specific causal analysis
        const causality = {
            phaseFactors: await this.identifyPhaseFactors(phase),
            outcomeDrivers: await this.identifyOutcomeDrivers(outcome),
            causalPaths: await this.traceCausalPaths(phase, outcome),
            interventions: await this.suggestInterventions(phase, outcome)
        };
        
        return causality;
    }
}
```

### Causal Discovery Algorithms
```javascript
class CausalDiscovery {
    async discoverCausalStructure(data) {
        const algorithms = {
            pc: await this.runPCAlgorithm(data),
            ges: await this.runGESAlgorithm(data),
            lingam: await this.runLiNGAM(data),
            fci: await this.runFCIAlgorithm(data),
            quantum: await this.runQuantumCausalDiscovery(data)
        };
        
        // Consensus causal structure
        const consensus = await this.buildConsensusStructure(algorithms);
        
        // Validate with domain knowledge
        const validated = await this.validateWithDomainKnowledge(consensus);
        
        return validated;
    }
    
    async runQuantumCausalDiscovery(data) {
        // Quantum-inspired causal discovery
        return {
            superposition: await this.createCausalSuperposition(data),
            entanglement: await this.detectCausalEntanglement(data),
            interference: await this.analyzeCausalInterference(data),
            measurement: await this.measureCausalStrength(data)
        };
    }
}
```

## Counterfactual Analysis

### What-If Scenarios
```javascript
class CounterfactualReasoning {
    async analyzeWhatIf(scenario, causalModel) {
        const analysis = {
            baseline: await this.establishBaseline(scenario),
            intervention: await this.defineIntervention(scenario),
            prediction: await this.predictOutcome(scenario, causalModel),
            confidence: await this.calculateConfidence(scenario, causalModel),
            assumptions: await this.listAssumptions(scenario)
        };
        
        // Construction-specific counterfactuals
        if (scenario.domain === 'construction') {
            analysis.construction = await this.analyzeConstructionCounterfactual(scenario);
        }
        
        return analysis;
    }
    
    async analyzeConstructionCounterfactual(scenario) {
        const counterfactual = {
            timeline: await this.predictTimelineImpact(scenario),
            cost: await this.predictCostImpact(scenario),
            quality: await this.predictQualityImpact(scenario),
            safety: await this.predictSafetyImpact(scenario),
            compliance: await this.predictComplianceImpact(scenario)
        };
        
        // Multi-objective optimization
        counterfactual.optimal = await this.findOptimalIntervention(counterfactual);
        
        return counterfactual;
    }
}
```

### Retrospective Analysis
```javascript
class RetrospectiveAnalysis {
    async analyzeHistoricalDecision(decision, outcome) {
        const retrospective = {
            actualOutcome: outcome,
            causalFactors: await this.identifyCausalFactors(decision, outcome),
            alternativeScenarios: await this.generateAlternatives(decision),
            counterfactualOutcomes: await this.predictAlternativeOutcomes(decision),
            lessons: await this.extractLessons(decision, outcome)
        };
        
        // What could have been done differently
        retrospective.improvements = await this.identifyImprovements(retrospective);
        
        return retrospective;
    }
}
```

## Intervention Design

### Optimal Intervention Planning
```javascript
class InterventionPlanning {
    async designOptimalIntervention(goal, constraints, causalModel) {
        const intervention = {
            objective: goal,
            constraints: constraints,
            options: await this.generateInterventionOptions(goal, causalModel),
            evaluation: await this.evaluateOptions(goal, constraints),
            optimal: await this.selectOptimalIntervention(goal, constraints),
            implementation: await this.createImplementationPlan(goal)
        };
        
        // Side effect analysis
        intervention.sideEffects = await this.analyzeSideEffects(intervention.optimal);
        
        // Robustness analysis
        intervention.robustness = await this.analyzeRobustness(intervention.optimal);
        
        return intervention;
    }
    
    async planConstructionIntervention(project, issue) {
        const intervention = {
            issue: issue,
            causalAnalysis: await this.analyzeCausesOfIssue(project, issue),
            interventionPoints: await this.identifyInterventionPoints(project, issue),
            strategies: await this.developStrategies(project, issue),
            timeline: await this.createInterventionTimeline(project),
            monitoring: await this.setupMonitoring(project)
        };
        
        return intervention;
    }
}
```

### Effect Prediction
```javascript
class EffectPrediction {
    async predictInterventionEffect(intervention, model) {
        const prediction = {
            directEffects: await this.calculateDirectEffects(intervention, model),
            indirectEffects: await this.calculateIndirectEffects(intervention, model),
            totalEffect: await this.calculateTotalEffect(intervention, model),
            heterogeneity: await this.analyzeEffectHeterogeneity(intervention, model),
            uncertainty: await this.quantifyUncertainty(intervention, model)
        };
        
        // Temporal dynamics
        prediction.temporal = await this.predictTemporalEvolution(intervention, model);
        
        return prediction;
    }
}
```

## Causal Effect Estimation

### Treatment Effect Analysis
```javascript
class TreatmentEffectAnalysis {
    async estimateCausalEffect(treatment, outcome, data) {
        const methods = {
            matching: await this.propensityScoreMatching(treatment, outcome, data),
            weighting: await this.inverseProbabiityWeighting(treatment, outcome, data),
            regression: await this.regressionAdjustment(treatment, outcome, data),
            instrumental: await this.instrumentalVariables(treatment, outcome, data),
            doubleML: await this.doubleMachineLearning(treatment, outcome, data)
        };
        
        // Combine estimates
        const combined = await this.combineEstimates(methods);
        
        // Sensitivity analysis
        const sensitivity = await this.sensitivityAnalysis(combined);
        
        return {
            effect: combined,
            confidence: await this.calculateConfidenceInterval(combined),
            sensitivity: sensitivity,
            assumptions: await this.checkAssumptions(methods)
        };
    }
}
```

### Heterogeneous Effects
```javascript
class HeterogeneousEffects {
    async analyzeEffectHeterogeneity(treatment, outcome, covariates) {
        const heterogeneity = {
            cate: await this.conditionalAverageTreatmentEffect(treatment, outcome, covariates),
            groups: await this.identifyEffectGroups(treatment, outcome, covariates),
            moderators: await this.identifyModerators(treatment, outcome, covariates),
            visualization: await this.visualizeHeterogeneity(treatment, outcome, covariates)
        };
        
        // Construction-specific heterogeneity
        heterogeneity.construction = {
            byProjectType: await this.analyzeByProjectType(treatment, outcome),
            byProjectSize: await this.analyzeByProjectSize(treatment, outcome),
            byComplexity: await this.analyzeByComplexity(treatment, outcome),
            byRegion: await this.analyzeByRegion(treatment, outcome)
        };
        
        return heterogeneity;
    }
}
```

## Construction-Specific Causal Analysis

### Project Delay Causality
```javascript
class ProjectDelayCausality {
    async analyzeDelayCauses(project) {
        const analysis = {
            causalFactors: await this.identifyDelayFactors(project),
            causalStrength: await this.quantifyCausalStrength(project),
            interactions: await this.analyzeFactorInteractions(project),
            criticalPath: await this.analyzeCriticalPathCausality(project),
            mitigation: await this.designMitigationStrategies(project)
        };
        
        return analysis;
    }
}
```

### Cost Overrun Analysis
```javascript
class CostOverrunCausality {
    async analyzeCostOverruns(project) {
        const analysis = {
            rootCauses: await this.identifyRootCauses(project),
            causalChains: await this.traceCausalChains(project),
            amplifyingFactors: await this.identifyAmplifyingFactors(project),
            preventableFactors: await this.identifyPreventableFactors(project),
            recommendations: await this.generateRecommendations(project)
        };
        
        return analysis;
    }
}
```

## Integration with AI Systems

### Causal Reinforcement Learning
```javascript
class CausalRL {
    async integrateCausalityWithRL(agent, environment) {
        const integration = {
            causalModel: await this.buildEnvironmentCausalModel(environment),
            policy: await this.developCausalPolicy(agent, environment),
            exploration: await this.guidedCausalExploration(agent, environment),
            learning: await this.causalCreditAssignment(agent, environment)
        };
        
        return integration;
    }
}
```

### Causal Explanation Generation
```javascript
class CausalExplanation {
    async generateCausalExplanation(decision, outcome) {
        const explanation = {
            causalPath: await this.traceCausalPath(decision, outcome),
            keyFactors: await this.identifyKeyFactors(decision, outcome),
            narrative: await this.generateNarrative(decision, outcome),
            visualization: await this.createCausalDiagram(decision, outcome),
            confidence: await this.assessExplanationConfidence(decision, outcome)
        };
        
        return explanation;
    }
}
```

## Validation and Testing

### Causal Model Validation
```javascript
class CausalValidation {
    async validateCausalModel(model, data) {
        const validation = {
            goodnessOfFit: await this.assessGoodnessOfFit(model, data),
            predictiveAccuracy: await this.testPredictiveAccuracy(model, data),
            robustness: await this.testRobustness(model, data),
            assumptions: await this.testAssumptions(model, data),
            falsification: await this.attemptFalsification(model, data)
        };
        
        return validation;
    }
}
```

### A/B Testing with Causal Inference
```javascript
class CausalABTesting {
    async designCausalExperiment(hypothesis) {
        const experiment = {
            design: await this.createExperimentalDesign(hypothesis),
            randomization: await this.implementRandomization(hypothesis),
            sampleSize: await this.calculateSampleSize(hypothesis),
            duration: await this.estimateDuration(hypothesis),
            analysis: await this.planAnalysis(hypothesis)
        };
        
        return experiment;
    }
}
```

## Performance Metrics

### Causal Analysis Quality
- Causal graph accuracy: >85%
- Effect estimation precision: ±5%
- Counterfactual prediction accuracy: >80%
- Intervention success rate: >75%
- Model validation score: >0.9

### Computational Performance
- Graph construction time: <30 seconds
- Effect calculation time: <5 seconds
- Counterfactual generation: <10 seconds
- Real-time intervention planning: <1 minute
- Large dataset handling: >1M records

## Configuration

### Causal Analysis Settings
```javascript
const causalConfig = {
    discovery: {
        algorithm: 'ensemble',
        significanceLevel: 0.05,
        maxParents: 5,
        bootstrapSamples: 1000
    },
    
    estimation: {
        methods: ['matching', 'weighting', 'doubleML'],
        crossValidation: true,
        sensitivityAnalysis: true,
        confidenceLevel: 0.95
    },
    
    intervention: {
        optimizationMethod: 'bayesian',
        constraintHandling: 'soft',
        robustnessCheck: true,
        simulationRuns: 10000
    }
};
```

## Dependencies

- **Master Orchestrator**: Task coordination
- **Machine Learning Engineer**: Model integration
- **Data Scientist**: Statistical analysis
- **Domain Experts**: Construction knowledge
- **Knowledge Graph**: Causal relationship storage
- **Simulation Engine**: Intervention testing
