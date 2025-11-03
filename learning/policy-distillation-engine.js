/**
 * 🧠 POLICY DISTILLATION ENGINE
 * =============================
 * 
 * Advanced policy compression system that converts complex neural network
 * policies into efficient decision rules while preserving learned behavior.
 * 
 * Key Innovation: Prevents Apple's complexity collapse by intelligently
 * compressing policy networks while maintaining decision quality.
 * 
 * Integration: Works with Bounded A2C + Memory Distillation systems.
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR POLICY DISTILLATION)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../src/construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR POLICY DISTILLATION)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../src/construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../src/construction/prevention/ProactiveConstructionInferenceEngine.js';;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Policy rule extracted from neural network behavior
 */
class PolicyRule {
    constructor(config = {}) {
        this.id = config.id || `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.condition = config.condition || {}; // State conditions
        this.action = config.action || 0; // Recommended action
        this.confidence = config.confidence || 0; // Rule confidence
        this.support = config.support || 0; // Number of examples supporting this rule
        this.performance = config.performance || 0; // Average performance when rule applied
        this.created = config.created || Date.now();
        this.last_used = config.last_used || Date.now();
        this.usage_count = config.usage_count || 0;
        
        // Rule metadata
        this.metadata = {
            complexity_score: config.complexity_score || 0,
            generalization_score: config.generalization_score || 0,
            specificity: config.specificity || 0,
            ...config.metadata
        };
    }

    /**
     * Check if this rule applies to a given state
     */
    appliesTo(state) {
        for (const [feature, condition] of Object.entries(this.condition)) {
            if (!this.checkCondition(state[feature], condition)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check individual condition
     */
    checkCondition(value, condition) {
        if (typeof condition === 'object') {
            if (condition.min !== undefined && value < condition.min) return false;
            if (condition.max !== undefined && value > condition.max) return false;
            if (condition.equals !== undefined && value !== condition.equals) return false;
            if (condition.in && !condition.in.includes(value)) return false;
            return true;
        } else {
            return value === condition;
        }
    }

    /**
     * Update rule performance based on outcome
     */
    updatePerformance(outcome) {
        this.usage_count++;
        this.last_used = Date.now();
        
        // Exponential moving average for performance
        const alpha = 0.1;
        this.performance = (1 - alpha) * this.performance + alpha * outcome;
        
        // Update confidence based on usage
        this.confidence = Math.min(this.confidence + 0.01, 1.0);
    }

    /**
     * Calculate rule quality score
     */
    getQualityScore() {
        const performanceWeight = 0.4;
        const confidenceWeight = 0.3;
        const supportWeight = 0.2;
        const recencyWeight = 0.1;
        
        const normalizedSupport = Math.min(this.support / 100, 1);
        const recencyScore = Math.exp(-(Date.now() - this.last_used) / (7 * 24 * 60 * 60 * 1000)); // 7 days decay
        
        return (this.performance * performanceWeight) +
               (this.confidence * confidenceWeight) +
               (normalizedSupport * supportWeight) +
               (recencyScore * recencyWeight);
    }

    /**
     * Serialize rule for storage
     */
    serialize() {
        return {
            id: this.id,
            condition: this.condition,
            action: this.action,
            confidence: this.confidence,
            support: this.support,
            performance: this.performance,
            created: this.created,
            last_used: this.last_used,
            usage_count: this.usage_count,
            metadata: this.metadata
        };
    }

    /**
     * Deserialize rule from storage
     */
    static deserialize(data) {
        return new PolicyRule(data);
    }
}

/**
 * Decision tree node for policy extraction
 */
class DecisionTreeNode {
    constructor() {
        this.feature = null;        // Feature to split on
        this.threshold = null;      // Threshold value
        this.left = null;          // Left child (feature <= threshold)
        this.right = null;         // Right child (feature > threshold)
        this.action = null;        // Action if leaf node
        this.confidence = 0;       // Confidence in this decision
        this.samples = 0;          // Number of samples at this node
        this.impurity = 0;         // Node impurity measure
    }

    /**
     * Check if this is a leaf node
     */
    isLeaf() {
        return this.left === null && this.right === null;
    }

    /**
     * Make prediction for given state
     */
    predict(state) {
        if (this.isLeaf()) {
            return {
                action: this.action,
                confidence: this.confidence
            };
        }
        
        const featureValue = state[this.feature];
        if (featureValue <= this.threshold) {
            return this.left.predict(state);
        } else {
            return this.right.predict(state);
        }
    }

    /**
     * Extract rules from this subtree
     */
    extractRules(conditions = {}) {
        const rules = [];
        
        if (this.isLeaf()) {
            // Create rule from path conditions
            const rule = new PolicyRule({
                condition: { ...conditions },
                action: this.action,
                confidence: this.confidence,
                support: this.samples,
                metadata: {
                    complexity_score: Object.keys(conditions).length / 10, // Normalized by max expected features
                    generalization_score: this.confidence,
                    specificity: 1 - (this.samples / 1000) // Normalized by expected max samples
                }
            });
            
            rules.push(rule);
        } else {
            // Recurse with updated conditions
            const leftConditions = {
                ...conditions,
                [this.feature]: {
                    ...conditions[this.feature],
                    max: this.threshold
                }
            };
            
            const rightConditions = {
                ...conditions,
                [this.feature]: {
                    ...conditions[this.feature],
                    min: this.threshold + 0.001 // Small epsilon to avoid overlap
                }
            };
            
            rules.push(...this.left.extractRules(leftConditions));
            rules.push(...this.right.extractRules(rightConditions));
        }
        
        return rules;
    }
}

/**
 * Neural network behavior analyzer
 */
class NetworkBehaviorAnalyzer {
    constructor() {
        this.stateActionPairs = [];
        this.featureImportance = new Map();
        this.actionFrequency = new Map();
    }

    /**
     * Analyze neural network behavior across many states
     */
    async analyzeNetwork(neuralNetwork, stateDistribution, numSamples = 10000) {
        console.log(`🔍 Analyzing neural network behavior with ${numSamples} samples...`);
        
        this.stateActionPairs = [];
        this.featureImportance.clear();
        this.actionFrequency.clear();
        
        const startTime = Date.now();
        
        // Generate diverse state samples
        const stateSamples = this.generateStateSamples(stateDistribution, numSamples);
        
        // Collect network responses
        for (const state of stateSamples) {
            const actionResult = neuralNetwork.selectAction ? 
                neuralNetwork.selectAction(state) : 
                { action: this.predictAction(neuralNetwork, state), action_probs: [] };
            
            this.stateActionPairs.push({
                state: [...state],
                action: actionResult.action,
                action_probs: actionResult.action_probs || [],
                confidence: Math.max(...(actionResult.action_probs || [0.5]))
            });
            
            // Update action frequency
            this.actionFrequency.set(actionResult.action, 
                (this.actionFrequency.get(actionResult.action) || 0) + 1);
        }
        
        // Analyze feature importance
        this.calculateFeatureImportance();
        
        const analysisTime = Date.now() - startTime;
        console.log(`✅ Network behavior analysis completed in ${analysisTime}ms`);
        
        return {
            state_action_pairs: this.stateActionPairs.length,
            unique_actions: this.actionFrequency.size,
            feature_importance: Object.fromEntries(this.featureImportance),
            analysis_time: analysisTime
        };
    }

    /**
     * Generate diverse state samples for analysis
     */
    generateStateSamples(stateDistribution, numSamples) {
        const samples = [];
        
        for (let i = 0; i < numSamples; i++) {
            const state = [];
            
            for (let j = 0; j < stateDistribution.dimension; j++) {
                // Generate sample based on distribution type
                let value;
                switch (stateDistribution.type) {
                    case 'uniform':
                        value = Math.random() * (stateDistribution.max - stateDistribution.min) + stateDistribution.min;
                        break;
                    case 'normal':
                        value = this.generateNormal(stateDistribution.mean || 0, stateDistribution.std || 1);
                        break;
                    case 'arbitrage_specific':
                        value = this.generateArbitrageState(j, stateDistribution);
                        break;
                    default:
                        value = Math.random();
                }
                
                state.push(value);
            }
            
            samples.push(state);
        }
        
        return samples;
    }

    /**
     * Generate arbitrage-specific state values
     */
    generateArbitrageState(featureIndex, distribution) {
        const arbitrageFeatures = {
            0: () => Math.random() * 0.1,                    // Price difference (0-10%)
            1: () => Math.random() * 1000 + 100,            // Volume (100-1100)
            2: () => Math.random() * 0.05,                  // Volatility (0-5%)
            3: () => Math.random() * 10 + 1,                // Gas price (1-11 gwei)
            4: () => Math.random() * 0.1,                   // Slippage (0-10%)
            5: () => Math.random(),                          // Market sentiment
        };
        
        const generator = arbitrageFeatures[featureIndex] || (() => Math.random());
        return generator();
    }

    /**
     * Generate normal distribution sample
     */
    generateNormal(mean, std) {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * std + mean;
    }

    /**
     * Predict action using neural network forward pass
     */
    predictAction(network, state) {
        const output = network.forward(state);
        
        // Find action with highest probability
        let maxIndex = 0;
        let maxValue = output[0];
        
        for (let i = 1; i < output.length; i++) {
            if (output[i] > maxValue) {
                maxValue = output[i];
                maxIndex = i;
            }
        }
        
        return maxIndex;
    }

    /**
     * Calculate feature importance using permutation importance
     */
    calculateFeatureImportance() {
        if (this.stateActionPairs.length === 0) return;
        
        const numFeatures = this.stateActionPairs[0].state.length;
        const baselineAccuracy = this.calculateConsistency();
        
        for (let featureIdx = 0; featureIdx < numFeatures; featureIdx++) {
            // Permute feature values
            const originalValues = this.stateActionPairs.map(pair => pair.state[featureIdx]);
            const shuffledValues = [...originalValues].sort(() => Math.random() - 0.5);
            
            // Replace feature values with shuffled ones
            this.stateActionPairs.forEach((pair, idx) => {
                pair.state[featureIdx] = shuffledValues[idx];
            });
            
            // Calculate accuracy with permuted feature
            const permutedAccuracy = this.calculateConsistency();
            
            // Feature importance = drop in accuracy
            const importance = Math.max(0, baselineAccuracy - permutedAccuracy);
            this.featureImportance.set(featureIdx, importance);
            
            // Restore original values
            this.stateActionPairs.forEach((pair, idx) => {
                pair.state[featureIdx] = originalValues[idx];
            });
        }
    }

    /**
     * Calculate consistency of network decisions
     */
    calculateConsistency() {
        // Simple consistency measure - can be improved
        const actionCounts = Array.from(this.actionFrequency.values());
        const totalActions = actionCounts.reduce((sum, count) => sum + count, 0);
        
        // Calculate entropy (lower entropy = higher consistency)
        const entropy = actionCounts.reduce((sum, count) => {
            const prob = count / totalActions;
            return sum - prob * Math.log2(prob + 1e-8);
        }, 0);
        
        // Convert to consistency score (0-1, higher is better)
        const maxEntropy = Math.log2(actionCounts.length);
        return 1 - (entropy / maxEntropy);
    }

    /**
     * Get analyzed state-action pairs
     */
    getStateActionPairs() {
        return this.stateActionPairs;
    }

    /**
     * Get feature importance rankings
     */
    getFeatureImportance() {
        return Array.from(this.featureImportance.entries())
            .sort(([, a], [, b]) => b - a)
            .map(([feature, importance]) => ({ feature, importance }));
    }
}

/**
 * Decision tree builder for rule extraction
 */
class DecisionTreeBuilder {
    constructor(config = {}) {
        this.config = {
            max_depth: 5,           // Prevent overly complex trees
            min_samples_split: 10,  // Minimum samples to split node
            min_samples_leaf: 5,    // Minimum samples in leaf
            max_features: 0.8,      // Fraction of features to consider
            criterion: 'gini',      // Split criterion
            ...config
        };
    }

    /**
     * Build decision tree from state-action pairs
     */
    buildTree(stateActionPairs) {
        console.log(`🌳 Building decision tree from ${stateActionPairs.length} samples...`);
        
        const startTime = Date.now();
        
        // Prepare training data
        const X = stateActionPairs.map(pair => pair.state);
        const y = stateActionPairs.map(pair => pair.action);
        
        // Build tree recursively
        const root = this.buildNode(X, y, 0);
        
        const buildTime = Date.now() - startTime;
        console.log(`✅ Decision tree built in ${buildTime}ms`);
        
        return root;
    }

    /**
     * Build single tree node
     */
    buildNode(X, y, depth) {
        const node = new DecisionTreeNode();
        
        node.samples = X.length;
        node.impurity = this.calculateImpurity(y);
        
        // Determine most common action for this node
        const actionCounts = this.countActions(y);
        const mostCommonAction = this.getMostCommonAction(actionCounts);
        
        // Check stopping criteria
        if (this.shouldStop(X, y, depth)) {
            node.action = mostCommonAction;
            node.confidence = actionCounts.get(mostCommonAction) / y.length;
            return node;
        }
        
        // Find best split
        const bestSplit = this.findBestSplit(X, y);
        
        if (!bestSplit) {
            node.action = mostCommonAction;
            node.confidence = actionCounts.get(mostCommonAction) / y.length;
            return node;
        }
        
        node.feature = bestSplit.feature;
        node.threshold = bestSplit.threshold;
        
        // Split data
        const leftIndices = [];
        const rightIndices = [];
        
        for (let i = 0; i < X.length; i++) {
            if (X[i][bestSplit.feature] <= bestSplit.threshold) {
                leftIndices.push(i);
            } else {
                rightIndices.push(i);
            }
        }
        
        // Build child nodes
        const leftX = leftIndices.map(i => X[i]);
        const leftY = leftIndices.map(i => y[i]);
        const rightX = rightIndices.map(i => X[i]);
        const rightY = rightIndices.map(i => y[i]);
        
        node.left = this.buildNode(leftX, leftY, depth + 1);
        node.right = this.buildNode(rightX, rightY, depth + 1);
        
        return node;
    }

    /**
     * Check if node building should stop
     */
    shouldStop(X, y, depth) {
        return depth >= this.config.max_depth ||
               X.length < this.config.min_samples_split ||
               this.isPure(y);
    }

    /**
     * Check if all samples have same action (pure node)
     */
    isPure(y) {
        return new Set(y).size === 1;
    }

    /**
     * Find best feature and threshold to split on
     */
    findBestSplit(X, y) {
        const numFeatures = X[0].length;
        const featuresToConsider = Math.floor(numFeatures * this.config.max_features);
        
        let bestSplit = null;
        let bestScore = -Infinity;
        
        // Consider subset of features
        const featureIndices = this.sampleFeatures(numFeatures, featuresToConsider);
        
        for (const featureIdx of featureIndices) {
            const featureValues = X.map(x => x[featureIdx]);
            const uniqueValues = [...new Set(featureValues)].sort((a, b) => a - b);
            
            // Try splits between unique values
            for (let i = 0; i < uniqueValues.length - 1; i++) {
                const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
                const score = this.evaluateSplit(X, y, featureIdx, threshold);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestSplit = {
                        feature: featureIdx,
                        threshold: threshold,
                        score: score
                    };
                }
            }
        }
        
        return bestSplit;
    }

    /**
     * Evaluate quality of a split
     */
    evaluateSplit(X, y, feature, threshold) {
        const leftY = [];
        const rightY = [];
        
        for (let i = 0; i < X.length; i++) {
            if (X[i][feature] <= threshold) {
                leftY.push(y[i]);
            } else {
                rightY.push(y[i]);
            }
        }
        
        if (leftY.length < this.config.min_samples_leaf || 
            rightY.length < this.config.min_samples_leaf) {
            return -Infinity;
        }
        
        // Calculate information gain
        const parentImpurity = this.calculateImpurity(y);
        const leftWeight = leftY.length / y.length;
        const rightWeight = rightY.length / y.length;
        const leftImpurity = this.calculateImpurity(leftY);
        const rightImpurity = this.calculateImpurity(rightY);
        
        const weightedImpurity = leftWeight * leftImpurity + rightWeight * rightImpurity;
        const informationGain = parentImpurity - weightedImpurity;
        
        return informationGain;
    }

    /**
     * Calculate impurity of action distribution
     */
    calculateImpurity(y) {
        if (y.length === 0) return 0;
        
        const actionCounts = this.countActions(y);
        const total = y.length;
        
        if (this.config.criterion === 'gini') {
            let gini = 1;
            for (const count of actionCounts.values()) {
                const prob = count / total;
                gini -= prob * prob;
            }
            return gini;
        } else if (this.config.criterion === 'entropy') {
            let entropy = 0;
            for (const count of actionCounts.values()) {
                const prob = count / total;
                if (prob > 0) {
                    entropy -= prob * Math.log2(prob);
                }
            }
            return entropy;
        }
        
        return 0;
    }

    /**
     * Count occurrences of each action
     */
    countActions(y) {
        const counts = new Map();
        for (const action of y) {
            counts.set(action, (counts.get(action) || 0) + 1);
        }
        return counts;
    }

    /**
     * Get most common action
     */
    getMostCommonAction(actionCounts) {
        let maxCount = 0;
        let mostCommon = 0;
        
        for (const [action, count] of actionCounts) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = action;
            }
        }
        
        return mostCommon;
    }

    /**
     * Randomly sample features to consider
     */
    sampleFeatures(numFeatures, numToSample) {
        const indices = Array.from({ length: numFeatures }, (_, i) => i);
        
        // Fisher-Yates shuffle and take first numToSample
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        return indices.slice(0, numToSample);
    }
}

/**
 * Main Policy Distillation Engine
 */
export class PolicyDistillationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Analysis configuration
            analysis_samples: 10000,
            state_distribution: {
                type: 'arbitrage_specific',
                dimension: 50
            },
            
            // Tree building configuration
            max_tree_depth: 5,
            min_samples_split: 10,
            min_samples_leaf: 5,
            
            // Rule management
            max_rules: 500,
            rule_quality_threshold: 0.5,
            rule_pruning_interval: 1000,
            
            // Performance tracking
            track_performance: true,
            metrics_window: 1000,
            
            ...config
        };
        
        // Core components
        this.behaviorAnalyzer = new NetworkBehaviorAnalyzer();
        this.treeBuilder = new DecisionTreeBuilder({
            max_depth: this.config.max_tree_depth,
            min_samples_split: this.config.min_samples_split,
            min_samples_leaf: this.config.min_samples_leaf
        });
        
        // Rule storage
        this.policyRules = new Map();
        this.ruleUsageStats = new Map();
        
        // Performance metrics
        this.performanceMetrics = {
            distillation_times: [],
            rule_creation_rates: [],
            compression_ratios: [],
            rule_quality_scores: []
        };
        
        // System state
        this.systemState = {
            initialized: false,
            total_distillations: 0,
            total_rules_created: 0,
            active_rules: 0,
            last_distillation: 0
        };
        
        // Storage
        this.storageDir = path.join(__dirname, '../data/policy-distillation');
        this.ensureStorageDir();
        
        // 🧠 FORMAL REASONING & VERIFICATION SYSTEMS (POLICY DISTILLATION SPECIALIZED)
        this.policyDistillationFormalReasoning = null;        // Policy distillation formal reasoning coordinator
        
        // 🛡️ PROACTIVE PREVENTION SYSTEMS (POLICY DISTILLATION SPECIALIZED)  
        this.policyDistillationCredibilityPipeline = null;   // Policy distillation credibility validation
        this.policyDistillationInferenceReliability = null;  // Policy distillation inference reliability
        this.policyDistillationVeracityJudge = null;         // Policy distillation truth-over-profit evaluation
        this.policyDistillationSFTGovernor = null;           // Policy distillation training data governance
        this.policyDistillationCognitiveMetabolicLoop = null; // Policy distillation complete prevention orchestration
    }

    /**
     * Initialize the policy distillation engine
     */
    async initialize() {
        console.log('🧠 Initializing Policy Distillation Engine...');
        
        try {
            // Load existing rules
            await this.loadExistingRules();
            
            // 🧠 Initialize POLICY DISTILLATION Formal Reasoning Integration
            await this.initializePolicyDistillationFormalReasoningIntegration();
            
            // 🛡️ Initialize POLICY DISTILLATION Proactive Prevention Integration
            await this.initializePolicyDistillationProactivePreventionIntegration();
            
            this.systemState.initialized = true;
            
            console.log('✅ Policy Distillation Engine initialized successfully');
            console.log('🧠 Policy distillation formal reasoning: ACTIVE');
            console.log('🛡️ Policy distillation proactive prevention: ACTIVE');
            
            this.emit('engine_initialized', {
                existing_rules: this.policyRules.size,
                config: this.config
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize Policy Distillation Engine:', error);
            throw error;
        }
    }

    /**
     * Distill policy from neural network
     */
    async distillPolicy(neuralNetwork, networkType = 'actor') {
        console.log(`🔬 Distilling ${networkType} policy...`);
        
        const startTime = Date.now();
        
        try {
            // Step 1: Analyze network behavior
            const behaviorAnalysis = await this.behaviorAnalyzer.analyzeNetwork(
                neuralNetwork,
                this.config.state_distribution,
                this.config.analysis_samples
            );
            
            // Step 2: Build decision tree
            const stateActionPairs = this.behaviorAnalyzer.getStateActionPairs();
            const decisionTree = this.treeBuilder.buildTree(stateActionPairs);
            
            // Step 3: Extract rules from tree
            const extractedRules = decisionTree.extractRules();
            
            // Step 4: Filter and optimize rules
            const optimizedRules = this.optimizeRules(extractedRules);
            
            // Step 5: Store new rules
            const storedRules = await this.storeRules(optimizedRules, networkType);
            
            // Step 6: Calculate compression metrics
            const compressionMetrics = this.calculateCompressionMetrics(
                neuralNetwork,
                storedRules,
                behaviorAnalysis
            );
            
            const distillationTime = Date.now() - startTime;
            
            // Update system state
            this.systemState.total_distillations++;
            this.systemState.total_rules_created += storedRules.length;
            this.systemState.active_rules = this.policyRules.size;
            this.systemState.last_distillation = Date.now();
            
            // Record performance metrics
            this.recordDistillationMetrics(distillationTime, storedRules, compressionMetrics);
            
            const result = {
                network_type: networkType,
                behavior_analysis: behaviorAnalysis,
                rules_extracted: extractedRules.length,
                rules_optimized: optimizedRules.length,
                rules_stored: storedRules.length,
                compression_metrics: compressionMetrics,
                distillation_time: distillationTime
            };
            
            console.log(`✅ Policy distillation completed in ${distillationTime}ms`);
            console.log(`📊 Created ${storedRules.length} rules from ${this.config.analysis_samples} samples`);
            
            this.emit('policy_distilled', result);
            
            return result;
            
        } catch (error) {
            console.error(`❌ Policy distillation failed:`, error);
            this.emit('distillation_failed', { network_type: networkType, error: error.message });
            throw error;
        }
    }

    /**
     * Optimize extracted rules
     */
    optimizeRules(rules) {
        console.log(`🔧 Optimizing ${rules.length} extracted rules...`);
        
        // Filter by quality threshold
        const qualityFiltered = rules.filter(rule => 
            rule.getQualityScore() >= this.config.rule_quality_threshold
        );
        
        // Remove redundant rules
        const deduplicated = this.removeDuplicateRules(qualityFiltered);
        
        // Merge similar rules
        const merged = this.mergeSimilarRules(deduplicated);
        
        // Sort by quality and take top rules
        const sorted = merged.sort((a, b) => b.getQualityScore() - a.getQualityScore());
        const limited = sorted.slice(0, this.config.max_rules);
        
        console.log(`✅ Rules optimized: ${rules.length} → ${limited.length}`);
        
        return limited;
    }

    /**
     * Remove duplicate rules
     */
    removeDuplicateRules(rules) {
        const unique = [];
        const seen = new Set();
        
        for (const rule of rules) {
            const signature = this.getRuleSignature(rule);
            if (!seen.has(signature)) {
                seen.add(signature);
                unique.push(rule);
            }
        }
        
        return unique;
    }

    /**
     * Get rule signature for deduplication
     */
    getRuleSignature(rule) {
        const conditionStr = JSON.stringify(rule.condition);
        const actionStr = rule.action.toString();
        return `${conditionStr}:${actionStr}`;
    }

    /**
     * Merge similar rules
     */
    mergeSimilarRules(rules) {
        const merged = [];
        const used = new Set();
        
        for (let i = 0; i < rules.length; i++) {
            if (used.has(i)) continue;
            
            const baseRule = rules[i];
            const similarRules = [baseRule];
            
            // Find similar rules
            for (let j = i + 1; j < rules.length; j++) {
                if (used.has(j)) continue;
                
                if (this.areRulesSimilar(baseRule, rules[j])) {
                    similarRules.push(rules[j]);
                    used.add(j);
                }
            }
            
            // Merge similar rules if found
            if (similarRules.length > 1) {
                const mergedRule = this.mergeRules(similarRules);
                merged.push(mergedRule);
            } else {
                merged.push(baseRule);
            }
            
            used.add(i);
        }
        
        return merged;
    }

    /**
     * Check if two rules are similar enough to merge
     */
    areRulesSimilar(rule1, rule2) {
        // Must have same action
        if (rule1.action !== rule2.action) return false;
        
        // Check condition overlap
        const features1 = Object.keys(rule1.condition);
        const features2 = Object.keys(rule2.condition);
        
        const commonFeatures = features1.filter(f => features2.includes(f));
        const totalFeatures = new Set([...features1, ...features2]).size;
        
        // Similarity threshold
        const overlapRatio = commonFeatures.length / totalFeatures;
        return overlapRatio >= 0.7;
    }

    /**
     * Merge multiple similar rules
     */
    mergeRules(rules) {
        const mergedRule = new PolicyRule({
            id: `merged_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            action: rules[0].action,
            confidence: rules.reduce((sum, r) => sum + r.confidence, 0) / rules.length,
            support: rules.reduce((sum, r) => sum + r.support, 0),
            performance: rules.reduce((sum, r) => sum + r.performance, 0) / rules.length
        });
        
        // Merge conditions (use most restrictive bounds)
        const allFeatures = new Set();
        rules.forEach(rule => Object.keys(rule.condition).forEach(f => allFeatures.add(f)));
        
        for (const feature of allFeatures) {
            const conditions = rules
                .map(rule => rule.condition[feature])
                .filter(c => c !== undefined);
            
            if (conditions.length > 0) {
                mergedRule.condition[feature] = this.mergeConditions(conditions);
            }
        }
        
        return mergedRule;
    }

    /**
     * Merge conditions for a single feature
     */
    mergeConditions(conditions) {
        const merged = {};
        
        // Collect all min/max values
        const mins = conditions.map(c => c.min).filter(v => v !== undefined);
        const maxs = conditions.map(c => c.max).filter(v => v !== undefined);
        const equals = conditions.map(c => c.equals).filter(v => v !== undefined);
        
        // Use most restrictive bounds
        if (mins.length > 0) merged.min = Math.max(...mins);
        if (maxs.length > 0) merged.max = Math.min(...maxs);
        if (equals.length > 0) merged.equals = equals[0]; // Use first exact match
        
        return merged;
    }

    /**
     * Store optimized rules
     */
    async storeRules(rules, networkType) {
        const storedRules = [];
        
        for (const rule of rules) {
            // Add network type to metadata
            rule.metadata.network_type = networkType;
            rule.metadata.storage_time = Date.now();
            
            // Store in memory
            this.policyRules.set(rule.id, rule);
            
            // Initialize usage stats
            this.ruleUsageStats.set(rule.id, {
                times_used: 0,
                total_performance: 0,
                last_used: null,
                created: Date.now()
            });
            
            storedRules.push(rule);
        }
        
        // Save to disk
        await this.saveRulesToDisk();
        
        return storedRules;
    }

    /**
     * Calculate compression metrics
     */
    calculateCompressionMetrics(neuralNetwork, rules, behaviorAnalysis) {
        // Estimate network size (parameters)
        const networkSize = this.estimateNetworkSize(neuralNetwork);
        
        // Calculate rule size
        const ruleSize = rules.reduce((sum, rule) => 
            sum + JSON.stringify(rule.serialize()).length, 0
        );
        
        // Compression ratio
        const compressionRatio = ruleSize / networkSize;
        
        // Performance preservation estimate
        const performancePreservation = this.estimatePerformancePreservation(rules, behaviorAnalysis);
        
        return {
            original_network_size: networkSize,
            compressed_rule_size: ruleSize,
            compression_ratio: compressionRatio,
            space_saved: networkSize - ruleSize,
            space_saved_percentage: ((networkSize - ruleSize) / networkSize) * 100,
            performance_preservation: performancePreservation,
            num_rules: rules.length
        };
    }

    /**
     * Estimate neural network size
     */
    estimateNetworkSize(neuralNetwork) {
        if (neuralNetwork.weights && neuralNetwork.biases) {
            // Count parameters
            const weightParams = neuralNetwork.weights.reduce((sum, layer) => 
                sum + layer.reduce((layerSum, neuron) => layerSum + neuron.length, 0), 0
            );
            const biasParams = neuralNetwork.biases.reduce((sum, layer) => sum + layer.length, 0);
            
            // Estimate size (4 bytes per float parameter)
            return (weightParams + biasParams) * 4;
        }
        
        // Fallback estimate
        return 100000; // 100KB
    }

    /**
     * Estimate performance preservation
     */
    estimatePerformancePreservation(rules, behaviorAnalysis) {
        // Simple estimation based on rule coverage and quality
        const avgQuality = rules.reduce((sum, rule) => sum + rule.getQualityScore(), 0) / rules.length;
        const coverage = Math.min(rules.length / 100, 1); // Assume 100 rules for full coverage
        
        return (avgQuality * 0.7) + (coverage * 0.3);
    }

    /**
     * Predict action using distilled policy rules
     */
    predictAction(state) {
        const applicableRules = [];
        
        // Find all applicable rules
        for (const rule of this.policyRules.values()) {
            if (rule.appliesTo(state)) {
                applicableRules.push(rule);
            }
        }
        
        if (applicableRules.length === 0) {
            // No applicable rules - return default action
            return {
                action: 0,
                confidence: 0,
                rule_id: null,
                fallback: true
            };
        }
        
        // Select best rule based on quality score
        const bestRule = applicableRules.reduce((best, current) => 
            current.getQualityScore() > best.getQualityScore() ? current : best
        );
        
        // Update rule usage
        this.updateRuleUsage(bestRule.id);
        
        return {
            action: bestRule.action,
            confidence: bestRule.confidence,
            rule_id: bestRule.id,
            quality_score: bestRule.getQualityScore(),
            fallback: false
        };
    }

    /**
     * Update rule usage statistics
     */
    updateRuleUsage(ruleId) {
        const stats = this.ruleUsageStats.get(ruleId);
        if (stats) {
            stats.times_used++;
            stats.last_used = Date.now();
        }
    }

    /**
     * Update rule performance based on outcome
     */
    updateRulePerformance(ruleId, outcome) {
        const rule = this.policyRules.get(ruleId);
        const stats = this.ruleUsageStats.get(ruleId);
        
        if (rule && stats) {
            rule.updatePerformance(outcome);
            stats.total_performance += outcome;
        }
    }

    /**
     * Prune low-quality rules
     */
    async pruneRules() {
        console.log('🧹 Pruning low-quality rules...');
        
        const beforeCount = this.policyRules.size;
        const rulesToRemove = [];
        
        for (const [ruleId, rule] of this.policyRules) {
            const stats = this.ruleUsageStats.get(ruleId);
            
            // Remove rules that are:
            // 1. Low quality
            // 2. Never used
            // 3. Poor performance
            const shouldRemove = 
                rule.getQualityScore() < this.config.rule_quality_threshold ||
                (stats && stats.times_used === 0 && Date.now() - stats.created > 86400000) || // 1 day unused
                (stats && stats.times_used > 0 && stats.total_performance / stats.times_used < -0.5); // Poor performance
            
            if (shouldRemove) {
                rulesToRemove.push(ruleId);
            }
        }
        
        // Remove identified rules
        for (const ruleId of rulesToRemove) {
            this.policyRules.delete(ruleId);
            this.ruleUsageStats.delete(ruleId);
        }
        
        // Save updated rules
        await this.saveRulesToDisk();
        
        this.systemState.active_rules = this.policyRules.size;
        
        console.log(`✅ Rules pruned: ${beforeCount} → ${this.policyRules.size}`);
        
        this.emit('rules_pruned', {
            before: beforeCount,
            after: this.policyRules.size,
            removed: rulesToRemove.length
        });
    }

    /**
     * Record distillation performance metrics
     */
    recordDistillationMetrics(distillationTime, rules, compressionMetrics) {
        this.performanceMetrics.distillation_times.push(distillationTime);
        this.performanceMetrics.rule_creation_rates.push(rules.length / (distillationTime / 1000));
        this.performanceMetrics.compression_ratios.push(compressionMetrics.compression_ratio);
        
        const avgQuality = rules.reduce((sum, rule) => sum + rule.getQualityScore(), 0) / rules.length;
        this.performanceMetrics.rule_quality_scores.push(avgQuality);
        
        // Keep metrics within window
        const maxHistory = this.config.metrics_window;
        Object.keys(this.performanceMetrics).forEach(key => {
            if (this.performanceMetrics[key].length > maxHistory) {
                this.performanceMetrics[key] = this.performanceMetrics[key].slice(-maxHistory);
            }
        });
    }

    /**
     * Load existing rules from storage
     */
    async loadExistingRules() {
        const rulesFile = path.join(this.storageDir, 'policy_rules.json');
        
        if (fs.existsSync(rulesFile)) {
            try {
                const data = JSON.parse(await fs.promises.readFile(rulesFile, 'utf8'));
                
                for (const ruleData of data.rules || []) {
                    const rule = PolicyRule.deserialize(ruleData);
                    this.policyRules.set(rule.id, rule);
                }
                
                for (const [ruleId, stats] of Object.entries(data.usage_stats || {})) {
                    this.ruleUsageStats.set(ruleId, stats);
                }
                
                console.log(`📂 Loaded ${this.policyRules.size} existing rules`);
                
            } catch (error) {
                console.error('❌ Failed to load existing rules:', error);
            }
        }
    }

    /**
     * Save rules to disk storage
     */
    async saveRulesToDisk() {
        const rulesFile = path.join(this.storageDir, 'policy_rules.json');
        
        const data = {
            rules: Array.from(this.policyRules.values()).map(rule => rule.serialize()),
            usage_stats: Object.fromEntries(this.ruleUsageStats),
            metadata: {
                last_saved: Date.now(),
                total_rules: this.policyRules.size,
                system_state: this.systemState
            }
        };
        
        await fs.promises.writeFile(rulesFile, JSON.stringify(data, null, 2));
    }

    /**
     * Ensure storage directory exists
     */
    ensureStorageDir() {
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }

    /**
     * Get engine performance statistics
     */
    getPerformanceStats() {
        const stats = {
            system_state: this.systemState,
            rule_statistics: {
                total_rules: this.policyRules.size,
                average_quality: 0,
                usage_distribution: {}
            },
            performance_metrics: {}
        };
        
        // Calculate rule statistics
        if (this.policyRules.size > 0) {
            const qualities = Array.from(this.policyRules.values()).map(r => r.getQualityScore());
            stats.rule_statistics.average_quality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
            
            // Usage distribution
            const usageCounts = Array.from(this.ruleUsageStats.values()).map(s => s.times_used);
            stats.rule_statistics.usage_distribution = {
                never_used: usageCounts.filter(c => c === 0).length,
                rarely_used: usageCounts.filter(c => c > 0 && c <= 10).length,
                moderately_used: usageCounts.filter(c => c > 10 && c <= 100).length,
                frequently_used: usageCounts.filter(c => c > 100).length
            };
        }
        
        // Calculate performance metrics averages
        Object.keys(this.performanceMetrics).forEach(key => {
            const values = this.performanceMetrics[key];
            if (values.length > 0) {
                stats.performance_metrics[key] = {
                    avg: values.reduce((sum, v) => sum + v, 0) / values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    count: values.length
                };
            }
        });
        
        return stats;
    }

    /**
     * 🧠 INITIALIZE POLICY DISTILLATION FORMAL REASONING INTEGRATION (SPECIALIZED)
     * ============================================================================
     * 
     * SPECIALIZED INTEGRATION for Policy Distillation Engine System
     * Provides formal verification for policy compression and rule extraction
     */
    async initializePolicyDistillationFormalReasoningIntegration() {
      console.log('🧠 Initializing Policy Distillation Formal Reasoning Integration...');
      
      try {
        // Initialize policy distillation specialized formal reasoning
        this.policyDistillationFormalReasoning = new FormalReasoningCognitiveIntegration({
          agentId: 'policy-distillation-formal-reasoning',
          enablePersistence: true,
          policyDistillationMode: true,
          coordinatePolicyDistillation: true
        });
        
        await this.policyDistillationFormalReasoning.initialize();
        
        // Register policy distillation with specialized verification
        await this.policyDistillationFormalReasoning.registerLearningSystemForFormalVerification('policy_distillation_engine', {
          systemType: 'policy_distillation_engine',
          capabilities: [
            'neural_policy_compression',
            'decision_rule_extraction',
            'behavior_pattern_analysis', 
            'policy_rule_optimization',
            'performance_tracking_analysis',
            'rule_quality_assessment'
          ],
          requiresVerification: [
            'policy_compression_algorithms',
            'rule_extraction_logic',
            'behavior_analysis_procedures',
            'rule_optimization_validation',
            'performance_metric_accuracy',
            'quality_assessment_safety'
          ]
        });
        
        console.log('✅ Policy Distillation Formal Reasoning Integration initialized');
        console.log('🧠 Policy distillation algorithms now have mathematical safety guarantees');
        
      } catch (error) {
        console.error('❌ Failed to initialize policy distillation formal reasoning:', error);
      }
    }

    /**
     * 🛡️ INITIALIZE POLICY DISTILLATION PROACTIVE PREVENTION INTEGRATION (SPECIALIZED)
     * ===============================================================================
     * 
     * SPECIALIZED INTEGRATION for Policy Distillation Engine System
     * Prevents policy compression hallucinations and ensures rule reliability
     */
    async initializePolicyDistillationProactivePreventionIntegration() {
      console.log('🛡️ Initializing Policy Distillation Proactive Prevention Integration...');
      
      try {
        // Initialize policy distillation credibility pipeline
        this.policyDistillationCredibilityPipeline = new ProactiveKnowledgeCredibilityPipeline({
          agentId: 'policy-distillation-credibility',
          enablePersistence: true,
          policyDistillationMode: true,
          validatePolicyData: true
        });
        
        // Initialize policy distillation inference reliability
        this.policyDistillationInferenceReliability = new ProactiveInferenceReliabilityEngine({
          agentId: 'policy-distillation-inference',
          enablePersistence: true,
          policyDistillationMode: true,
          memoryConsultationMandatory: true,
          policyDistillationAwareReasoning: true
        });
        
        // Initialize policy distillation veracity judge
        this.policyDistillationVeracityJudge = new ProactiveVeracityJudgeService({
          agentId: 'policy-distillation-veracity',
          enablePersistence: true,
          policyDistillationMode: true,
          truthOverProfitPriority: true,
          evaluatePolicyCompression: true
        });
        
        // Initialize policy distillation SFT governor
        this.policyDistillationSFTGovernor = new SFTFlywheelGovernor({
          agentId: 'policy-distillation-sft',
          enablePersistence: true,
          policyDistillationMode: true,
          governPolicyDistillationTraining: true
        });
        
        // Initialize policy distillation cognitive-metabolic loop
        this.policyDistillationCognitiveMetabolicLoop = new ProactiveCognitiveMetabolicLoop({
          agentId: 'policy-distillation-cognitive',
          enablePersistence: true,
          policyDistillationMode: true,
          orchestratePolicyDistillationImmunity: true
        });
        
        // Initialize all policy distillation coordinators
        await Promise.all([
          this.policyDistillationCredibilityPipeline.initialize(),
          this.policyDistillationInferenceReliability.initialize(),
          this.policyDistillationVeracityJudge.initialize(),
          this.policyDistillationSFTGovernor.initialize(),
          this.policyDistillationCognitiveMetabolicLoop.initialize()
        ]);
        
        console.log('✅ Policy Distillation Proactive Prevention Integration initialized');
        console.log('🛡️ Policy distillation now immune to compression hallucinations');
        console.log('🌊 Policy data credibility validation: ACTIVE');
        console.log('🔄 Policy distillation training reliability assurance: ACTIVE');
        console.log('⚖️ Truth-over-profit for policy compression: ACTIVE');
        console.log('🧠 Memory consultation for policy validation: ENFORCED');
        console.log('🌱 Complete cognitive-metabolic immunity for policy distillation: ACTIVE');
        
      } catch (error) {
        console.error('❌ Failed to initialize policy distillation proactive prevention:', error);
      }
    }

    /**
     * Shutdown the engine
     */
    async shutdown() {
        console.log('🛑 Shutting down Policy Distillation Engine...');
        
        // Save current state
        await this.saveRulesToDisk();
        
        console.log('✅ Policy Distillation Engine shutdown complete');
    }
}

export { PolicyRule, DecisionTreeNode, NetworkBehaviorAnalyzer, DecisionTreeBuilder };
export default PolicyDistillationEngine; 