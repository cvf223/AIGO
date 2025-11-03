/**
 * 🎯 COMPLEXITY-BASED REASONING DECIDER
 * =====================================
 * 
 * Unified decision system for GOT/COA activation based on actual complexity
 * 
 * DECISION MATRIX:
 * - < 30% complexity: Standard reasoning (no GOT/COA)
 * - 30-45% complexity: Prepare for decomposition
 * - 45-50% complexity: Activate GOT only
 * - 50-65% complexity: Activate both GOT and COA
 * - 65-80% complexity: Force symbolic mode + GOT/COA
 * - > 80% complexity: Emergency halt and full decomposition
 */

import { EventEmitter } from 'events';
import { UniversalPersistenceEnhancer } from '../persistence/UniversalPersistenceEnhancer.js';
import { StepwiseComplexityTracker } from './StepwiseComplexityTracker.js';

export const REASONING_COMPLEXITY_THRESHOLDS = {
    SIMPLE: 0.30,           // Standard reasoning sufficient
    MODERATE: 0.45,         // GOT activation threshold
    COMPLEX: 0.50,          // COA activation threshold  
    HIGHLY_COMPLEX: 0.65,   // Human guidance recommended (NO simplification!)
    CRITICAL: 0.80,         // Emergency measures
    CLIFF: 0.85             // System protection mode
};

export class ComplexityBasedReasoningDecider extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            gotThreshold: config.gotThreshold || REASONING_COMPLEXITY_THRESHOLDS.MODERATE,
            coaThreshold: config.coaThreshold || REASONING_COMPLEXITY_THRESHOLDS.COMPLEX,
            humanGuidanceThreshold: config.humanGuidanceThreshold || REASONING_COMPLEXITY_THRESHOLDS.HIGHLY_COMPLEX,
            emergencyThreshold: config.emergencyThreshold || REASONING_COMPLEXITY_THRESHOLDS.CRITICAL,
            ...config
        };
        
        this.metrics = {
            decisionsMade: 0,
            gotActivations: 0,
            coaActivations: 0,
            emergencyInterventions: 0
        };
        
        this.isInitialized = false;
        this.learningProgress = 0;
        this.evolutionStage = 0;
        
        // Stepwise complexity tracker for detailed collapse analysis
        this.stepwiseTracker = new StepwiseComplexityTracker();
        
        // Initialize persistence on creation
        this.initializeWithPersistence();
    }
    
    /**
     * 🚀 INITIALIZE WITH PERSISTENCE
     * ==============================
     */
    async initializeWithPersistence() {
        console.log('🚀 Initializing ComplexityBasedReasoningDecider with persistence...');
        
        // Enhance with universal persistence
        await UniversalPersistenceEnhancer.enhanceSystem(this, {
            systemName: 'ComplexityBasedReasoningDecider',
            enableBreakthroughBackup: true,
            breakthroughThreshold: 0.15 // 15% improvement in decision accuracy
        });
        
        // Initialize persistence
        await this.initializePersistence();
        
        // Recover previous state
        const recovered = await this.recoverState();
        if (recovered) {
            console.log(`✅ Recovered decision history: ${this.metrics.decisionsMade} decisions made`);
        }
        
        // Start automatic backups
        this.startAutomaticBackups();
        
        this.isInitialized = true;
        console.log('✅ ComplexityBasedReasoningDecider initialized with hourly persistence');
    }
    
    /**
     * 🧮 CALCULATE ACTUAL REASONING COMPLEXITY
     * ========================================
     * Much more sophisticated than thoughts.length / 20
     */
    calculateReasoningComplexity(context) {
        let complexity = 0;
        let factors = [];
        
        // 1. THOUGHT GRAPH COMPLEXITY (0-0.25)
        if (context.thoughts) {
            const thoughtComplexity = this.calculateThoughtComplexity(context.thoughts);
            complexity += thoughtComplexity * 0.25;
            factors.push({ factor: 'thoughts', value: thoughtComplexity });
        }
        
        // 2. CAUSAL CHAIN COMPLEXITY (0-0.20)
        if (context.causalChains) {
            const causalComplexity = this.calculateCausalComplexity(context.causalChains);
            complexity += causalComplexity * 0.20;
            factors.push({ factor: 'causal', value: causalComplexity });
        }
        
        // 3. DECISION TREE DEPTH (0-0.15)
        if (context.decisionDepth) {
            const depthComplexity = Math.min(1, context.decisionDepth / 10);
            complexity += depthComplexity * 0.15;
            factors.push({ factor: 'depth', value: depthComplexity });
        }
        
        // 4. UNCERTAINTY LEVEL (0-0.15)
        if (context.uncertainty) {
            complexity += context.uncertainty * 0.15;
            factors.push({ factor: 'uncertainty', value: context.uncertainty });
        }
        
        // 5. CROSS-DOMAIN COMPLEXITY (0-0.10)
        if (context.domainCount) {
            const domainComplexity = Math.min(1, (context.domainCount - 1) / 5);
            complexity += domainComplexity * 0.10;
            factors.push({ factor: 'domains', value: domainComplexity });
        }
        
        // 6. TIME PRESSURE (0-0.10)
        if (context.timePressure) {
            complexity += context.timePressure * 0.10;
            factors.push({ factor: 'time', value: context.timePressure });
        }
        
        // 7. CONFLICT/CONTRADICTION PRESENCE (0-0.05)
        if (context.hasConflicts) {
            complexity += 0.05;
            factors.push({ factor: 'conflicts', value: 1 });
        }
        
        return {
            totalComplexity: Math.min(1, complexity),
            factors,
            timestamp: Date.now()
        };
    }
    
    /**
     * 🧠 CALCULATE THOUGHT COMPLEXITY
     * ================================
     */
    calculateThoughtComplexity(thoughts) {
        if (!thoughts || thoughts.length === 0) return 0;
        
        // Consider: number of thoughts, interconnections, confidence variance
        const count = Math.min(1, thoughts.length / 20);
        
        // Check for interconnections (if thoughts reference each other)
        const hasInterconnections = thoughts.some(t => 
            t.references || t.parentIds?.length > 0
        );
        
        // Check confidence variance
        const confidences = thoughts.map(t => t.confidence || 0.5);
        const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
        const variance = confidences.reduce((sum, c) => 
            sum + Math.pow(c - avgConfidence, 2), 0
        ) / confidences.length;
        
        return count * 0.5 + 
               (hasInterconnections ? 0.3 : 0) + 
               (variance > 0.1 ? 0.2 : 0);
    }
    
    /**
     * 🔗 CALCULATE CAUSAL COMPLEXITY
     * ==============================
     */
    calculateCausalComplexity(causalChains) {
        if (!causalChains || causalChains.length === 0) return 0;
        
        // Consider: number of chains, average length, max depth
        const chainCount = Math.min(1, causalChains.length / 5);
        const avgLength = causalChains.reduce((sum, chain) => 
            sum + (chain.nodes?.length || chain.length || 0), 0
        ) / causalChains.length;
        const lengthComplexity = Math.min(1, avgLength / 7);
        
        return chainCount * 0.5 + lengthComplexity * 0.5;
    }
    
    /**
     * 🎯 DECIDE REASONING APPROACH
     * ============================
     * The MAIN decision method
     */
    async decideReasoningApproach(context) {
        // Calculate actual complexity
        const complexityResult = this.calculateReasoningComplexity(context);
        const complexity = complexityResult.totalComplexity;
        
        console.log(`🧮 Calculated reasoning complexity: ${(complexity * 100).toFixed(1)}%`);
        console.log(`   Factors:`, complexityResult.factors);
        
        const decision = {
            complexity,
            complexityFactors: complexityResult.factors,
            useGOT: false,
            useCOA: false,
            useStandardReasoning: false,
            maintainFullComplexity: true,  // ALWAYS maintain full complexity!
            emergencyMode: false,
            approach: '',
            reasoning: '',
            skipLayers: []
        };
        
        // DECISION LOGIC
        
        // 🔴 EMERGENCY MODE (>80%) - HUMAN IN THE LOOP REQUIRED!
        if (complexity >= this.config.emergencyThreshold) {
            decision.emergencyMode = true;
            decision.useGOT = true;
            decision.useCOA = true;
            decision.maintainFullComplexity = true;  // NO simplification even in emergency!
            decision.approach = 'emergency_full_decomposition';
            decision.reasoning = 'Complexity critically high - FULL decomposition with human guidance';
            decision.requiresHumanIntervention = true;
            this.metrics.emergencyInterventions++;
            
            // 🚨 TRIGGER HUMAN-IN-THE-LOOP
            console.error('🚨🚨🚨 EMERGENCY COMPLEXITY DETECTED 🚨🚨🚨');
            console.error(`   Complexity: ${(complexity * 100).toFixed(1)}%`);
            console.error('   HUMAN INTERVENTION REQUIRED!');
            
            // Emit emergency event for human notification
            this.emit('emergencyHumanInterventionRequired', {
                complexity,
                factors: complexityResult.factors,
                timestamp: Date.now(),
                message: 'System complexity exceeded safe thresholds - human guidance needed!'
            });
            
            // Request human help
            await this.requestHumanIntervention(complexity, complexityResult);
        }
        
        // 🟠 CRITICAL COMPLEXITY (65-80%) - HUMAN GUIDANCE RECOMMENDED
        else if (complexity >= this.config.humanGuidanceThreshold) {
            decision.maintainFullComplexity = true;  // NO simplification!
            decision.useGOT = true;
            decision.useCOA = true;
            decision.humanGuidanceRecommended = true;
            decision.approach = 'full_complexity_with_guidance';
            decision.reasoning = 'High complexity - maintaining FULL context with GOT+COA, human guidance recommended';
            
            // Recommend human guidance but don't halt
            console.warn('⚠️ CRITICAL COMPLEXITY: Human guidance recommended');
            console.warn(`   Complexity: ${(complexity * 100).toFixed(1)}%`);
            console.warn('   System maintaining FULL complexity - no simplification!');
        }
        
        // 🟡 BOTH GOT AND COA (50-65%)
        else if (complexity >= this.config.coaThreshold) {
            decision.useGOT = true;
            decision.useCOA = true;
            decision.approach = 'got_and_coa';
            decision.reasoning = 'Moderate-high complexity - using both GOT and COA';
            this.metrics.gotActivations++;
            this.metrics.coaActivations++;
        }
        
        // 🟢 GOT ONLY (45-50%)
        else if (complexity >= this.config.gotThreshold) {
            decision.useGOT = true;
            decision.useCOA = false;
            decision.approach = 'got_only';
            decision.reasoning = 'Moderate complexity - GOT sufficient, COA not needed';
            decision.skipLayers = [4]; // Skip COA layer
            this.metrics.gotActivations++;
        }
        
        // ✅ STANDARD REASONING (<45%)
        else {
            decision.useStandardReasoning = true;
            decision.approach = 'standard';
            decision.reasoning = 'Low complexity - standard reasoning sufficient';
            decision.skipLayers = [3, 4]; // Skip both GOT and COA
        }
        
        // Update metrics
        this.metrics.decisionsMade++;
        
        // Check for breakthrough in decision accuracy
        if (decision.emergencyMode && this.metrics.emergencyInterventions > 0) {
            // Successfully handled emergency - breakthrough!
            await this.triggerBreakthroughBackup?.(
                'Emergency complexity handled successfully',
                0.25
            );
        }
        
        // Track learning progress
        this.learningProgress = this.metrics.decisionsMade;
        
        // Emit decision event
        this.emit('decisionMade', decision);
        
        console.log(`🎯 Decision: ${decision.approach}`);
        console.log(`   GOT: ${decision.useGOT ? '✅' : '❌'}`);
        console.log(`   COA: ${decision.useCOA ? '✅' : '❌'}`);
        console.log(`   Reasoning: ${decision.reasoning}`);
        
        return decision;
    }
    
    /**
     * 🔄 UPDATE DECISION BASED ON RUNTIME FEEDBACK
     * ============================================
     */
    async updateDecision(originalDecision, runtimeContext) {
        // Check if complexity has changed during execution
        if (runtimeContext.newComplexity) {
            const newComplexity = runtimeContext.newComplexity;
            
            // If complexity increased significantly, upgrade approach
            if (newComplexity > originalDecision.complexity + 0.15) {
                console.log(`⚠️ Complexity increased from ${(originalDecision.complexity * 100).toFixed(1)}% to ${(newComplexity * 100).toFixed(1)}%`);
                
                // Re-decide with new complexity
                return await this.decideReasoningApproach({
                    ...runtimeContext,
                    complexity: newComplexity
                });
            }
        }
        
        return originalDecision;
    }
    
    /**
     * 🚨 REQUEST HUMAN INTERVENTION WITH DETAILED COLLAPSE ANALYSIS
     * =============================================================
     * Provides EXACT information about WHERE and WHY complexity collapsed
     */
    async requestHumanIntervention(complexity, complexityResult) {
        // Record the collapse point
        this.stepwiseTracker.recordCollapse(
            'Emergency complexity threshold exceeded',
            complexity
        );
        
        // Generate detailed collapse report
        const collapseReport = this.stepwiseTracker.generateCollapseReport();
        
        // Display the detailed report
        console.error(collapseReport);
        
        // Suggest recovery strategy
        const recovery = this.stepwiseTracker.suggestRecovery();
        console.log('\n🔄 SUGGESTED RECOVERY STRATEGY:');
        console.log(`   Strategy: ${recovery.strategy}`);
        console.log(`   Reason: ${recovery.reason}\n`);
        
        // Store human intervention request
        if (this.persistenceEngine) {
            await this.persistenceEngine.saveState('human_intervention_request', {
                timestamp: Date.now(),
                complexity,
                factors: complexityResult.factors,
                status: 'awaiting_human_response'
            });
        }
        
        // Trigger breakthrough backup for emergency handling
        await this.triggerBreakthroughBackup?.(
            'Emergency complexity - human intervention requested',
            complexity
        );
        
        return {
            interventionRequested: true,
            complexity,
            timestamp: Date.now()
        };
    }
    
    /**
     * 📊 GET DECISION METRICS
     * =======================
     */
    getMetrics() {
        return {
            ...this.metrics,
            gotActivationRate: this.metrics.decisionsMade > 0 ? 
                this.metrics.gotActivations / this.metrics.decisionsMade : 0,
            coaActivationRate: this.metrics.decisionsMade > 0 ? 
                this.metrics.coaActivations / this.metrics.decisionsMade : 0,
            emergencyRate: this.metrics.decisionsMade > 0 ? 
                this.metrics.emergencyInterventions / this.metrics.decisionsMade : 0
        };
    }
}

export default ComplexityBasedReasoningDecider;
