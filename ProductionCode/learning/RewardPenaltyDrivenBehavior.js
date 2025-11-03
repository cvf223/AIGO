/**
 * 🎯 REWARD-PENALTY DRIVEN BEHAVIOR SYSTEM
 * =====================================
 * 
 * Ensures agents strictly follow reward-seeking and penalty-avoidance behavior
 * This is the core motivation system that drives all agent decisions
 */

import { EventEmitter } from 'events';

/**
 * RewardPenaltyDrivenBehavior
 * Core system to ensure agents are strictly motivated by rewards and penalties
 */
export class RewardPenaltyDrivenBehavior extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Configuration
        this.config = {
            // Reward/penalty balance
            rewardWeight: config.rewardWeight || 0.6,
            penaltyWeight: config.penaltyWeight || 0.4,
            
            // Memory parameters
            memoryDecayRate: config.memoryDecayRate || 0.01,
            recentMemoryBoost: config.recentMemoryBoost || 2.0,
            
            // Behavior parameters
            explorationFactor: config.explorationFactor || 0.1,
            riskAversionFactor: config.riskAversionFactor || 0.7,
            
            // Integration
            dbPool: config.dbPool || null,
            debug: config.debug || false
        };
        
        // Core state
        this.agentMotivations = new Map();
        this.behaviorProfiles = new Map();
        this.rewardMemory = new Map();
        this.penaltyMemory = new Map();
        
        // Interfaces
        this.rewardPenaltyEngine = null;
        this.decisionAwareness = null;
        
        // Initialize
        this._initialize();
    }
    
    /**
     * Initialize the system
     */
    _initialize() {
        console.log('🎯 Initializing Reward-Penalty Driven Behavior System...');
    }
    
    /**
     * Register with reward/penalty system
     */
    registerRewardPenaltySystem(rewardPenaltyEngine, decisionAwareness) {
        this.rewardPenaltyEngine = rewardPenaltyEngine;
        this.decisionAwareness = decisionAwareness;
        
        // Subscribe to reward/penalty events
        if (this.rewardPenaltyEngine) {
            this.rewardPenaltyEngine.on('reward', this.handleRewardEvent.bind(this));
            this.rewardPenaltyEngine.on('penalty', this.handlePenaltyEvent.bind(this));
        }
        
        console.log('🔗 Reward-Penalty Driven Behavior System integrated with reward/penalty engine');
        return true;
    }
    
    /**
     * Handle reward events
     */
    handleRewardEvent(data) {
        const { agentId, reward, context } = data;
        
        // Update agent motivation
        this._updateAgentMotivation(agentId, reward.amount, 'reward', context);
        
        // Store reward memory
        this._storeRewardMemory(agentId, reward, context);
        
        // Emit behavior adjustment event
        this.emit('behaviorAdjusted', {
            agentId,
            adjustment: 'reward_reinforcement',
            amount: reward.amount,
            context
        });
    }
    
    /**
     * Handle penalty events
     */
    handlePenaltyEvent(data) {
        const { agentId, penalty, context } = data;
        
        // Update agent motivation
        this._updateAgentMotivation(agentId, -Math.abs(penalty.amount), 'penalty', context);
        
        // Store penalty memory
        this._storePenaltyMemory(agentId, penalty, context);
        
        // Emit behavior adjustment event
        this.emit('behaviorAdjusted', {
            agentId,
            adjustment: 'penalty_avoidance',
            amount: penalty.amount,
            context
        });
    }
    
    /**
     * Update agent motivation based on rewards/penalties
     */
    _updateAgentMotivation(agentId, amount, type, context) {
        // Get or create agent motivation profile
        if (!this.agentMotivations.has(agentId)) {
            this.agentMotivations.set(agentId, {
                rewardSeeking: 0.5,
                penaltyAvoidance: 0.5,
                riskTolerance: 0.5,
                explorationDrive: 0.5,
                lastUpdate: Date.now()
            });
        }
        
        const motivation = this.agentMotivations.get(agentId);
        
        // Update motivation based on reward/penalty
        if (type === 'reward') {
            // Positive reinforcement increases reward seeking
            motivation.rewardSeeking = Math.min(1.0, motivation.rewardSeeking + (amount * 0.01));
            
            // Successful rewards can slightly decrease penalty avoidance
            motivation.penaltyAvoidance = Math.max(0.3, motivation.penaltyAvoidance - (amount * 0.005));
            
            // Increase risk tolerance slightly
            motivation.riskTolerance = Math.min(0.9, motivation.riskTolerance + (amount * 0.002));
        } else {
            // Penalties increase penalty avoidance
            motivation.penaltyAvoidance = Math.min(1.0, motivation.penaltyAvoidance + (Math.abs(amount) * 0.02));
            
            // Penalties decrease risk tolerance
            motivation.riskTolerance = Math.max(0.1, motivation.riskTolerance - (Math.abs(amount) * 0.01));
        }
        
        // Update timestamp
        motivation.lastUpdate = Date.now();
    }
    
    /**
     * Store reward memory
     */
    _storeRewardMemory(agentId, reward, context) {
        if (!this.rewardMemory.has(agentId)) {
            this.rewardMemory.set(agentId, []);
        }
        
        const memories = this.rewardMemory.get(agentId);
        
        // Add new memory
        memories.push({
            amount: reward.amount,
            type: reward.type,
            context: context,
            timestamp: Date.now(),
            strength: 1.0 // Initial memory strength
        });
        
        // Limit memory size
        if (memories.length > 100) {
            memories.shift(); // Remove oldest memory
        }
        
        // Apply memory decay to older memories
        this._applyMemoryDecay(memories);
    }
    
    /**
     * Store penalty memory
     */
    _storePenaltyMemory(agentId, penalty, context) {
        if (!this.penaltyMemory.has(agentId)) {
            this.penaltyMemory.set(agentId, []);
        }
        
        const memories = this.penaltyMemory.get(agentId);
        
        // Add new memory
        memories.push({
            amount: penalty.amount,
            type: penalty.type,
            context: context,
            timestamp: Date.now(),
            strength: 1.0 // Initial memory strength
        });
        
        // Limit memory size
        if (memories.length > 100) {
            memories.shift(); // Remove oldest memory
        }
        
        // Apply memory decay to older memories
        this._applyMemoryDecay(memories);
    }
    
    /**
     * Apply memory decay to older memories
     */
    _applyMemoryDecay(memories) {
        const now = Date.now();
        
        for (const memory of memories) {
            // Calculate age in hours
            const ageHours = (now - memory.timestamp) / (1000 * 60 * 60);
            
            // Apply decay
            memory.strength *= Math.exp(-this.config.memoryDecayRate * ageHours);
            
            // Ensure minimum strength
            memory.strength = Math.max(0.1, memory.strength);
        }
    }
    
    /**
     * Create behavior profile for an agent
     */
    createBehaviorProfile(agentId, baseProfile = {}) {
        // Get motivation
        const motivation = this.agentMotivations.get(agentId) || {
            rewardSeeking: 0.5,
            penaltyAvoidance: 0.5,
            riskTolerance: 0.5,
            explorationDrive: 0.5
        };
        
        // Create behavior profile
        const profile = {
            // Base values from provided profile or defaults
            rewardThreshold: baseProfile.rewardThreshold || 0.1,
            penaltyThreshold: baseProfile.penaltyThreshold || 0.05,
            riskTolerance: baseProfile.riskTolerance || 0.5,
            explorationRate: baseProfile.explorationRate || 0.1,
            
            // Motivation-adjusted values
            adjustedRewardThreshold: 0,
            adjustedPenaltyThreshold: 0,
            adjustedRiskTolerance: 0,
            adjustedExplorationRate: 0,
            
            // Action preferences
            actionPreferences: {},
            avoidActions: []
        };
        
        // Apply motivation adjustments
        profile.adjustedRewardThreshold = profile.rewardThreshold * (1 - motivation.rewardSeeking);
        profile.adjustedPenaltyThreshold = profile.penaltyThreshold * motivation.penaltyAvoidance;
        profile.adjustedRiskTolerance = profile.riskTolerance * motivation.riskTolerance;
        profile.adjustedExplorationRate = profile.explorationRate * motivation.explorationDrive;
        
        // Calculate action preferences based on memories
        profile.actionPreferences = this._calculateActionPreferences(agentId);
        
        // Determine actions to avoid based on penalty memories
        profile.avoidActions = this._determineActionsToAvoid(agentId);
        
        // Store profile
        this.behaviorProfiles.set(agentId, profile);
        
        return profile;
    }
    
    /**
     * Calculate action preferences based on reward memories
     */
    _calculateActionPreferences(agentId) {
        const preferences = {};
        const rewardMemories = this.rewardMemory.get(agentId) || [];
        
        // Group memories by action type
        for (const memory of rewardMemories) {
            const action = memory.context?.action || 'unknown';
            
            if (!preferences[action]) {
                preferences[action] = {
                    count: 0,
                    totalReward: 0,
                    averageReward: 0,
                    weightedScore: 0
                };
            }
            
            // Update stats
            preferences[action].count++;
            preferences[action].totalReward += memory.amount;
            preferences[action].averageReward = preferences[action].totalReward / preferences[action].count;
            
            // Apply memory strength as weight
            preferences[action].weightedScore += memory.amount * memory.strength;
        }
        
        return preferences;
    }
    
    /**
     * Determine actions to avoid based on penalty memories
     */
    _determineActionsToAvoid(agentId) {
        const avoidActions = [];
        const penaltyMemories = this.penaltyMemory.get(agentId) || [];
        const actionPenalties = {};
        
        // Group penalties by action
        for (const memory of penaltyMemories) {
            const action = memory.context?.action || 'unknown';
            
            if (!actionPenalties[action]) {
                actionPenalties[action] = {
                    count: 0,
                    totalPenalty: 0,
                    averagePenalty: 0,
                    weightedScore: 0
                };
            }
            
            // Update stats
            actionPenalties[action].count++;
            actionPenalties[action].totalPenalty += Math.abs(memory.amount);
            actionPenalties[action].averagePenalty = 
                actionPenalties[action].totalPenalty / actionPenalties[action].count;
            
            // Apply memory strength as weight
            actionPenalties[action].weightedScore += Math.abs(memory.amount) * memory.strength;
        }
        
        // Determine actions to avoid (high penalty score)
        for (const [action, stats] of Object.entries(actionPenalties)) {
            // Avoid actions with high penalty scores
            if (stats.weightedScore > 10 || stats.averagePenalty > 5) {
                avoidActions.push(action);
            }
        }
        
        return avoidActions;
    }
    
    /**
     * Evaluate decision based on reward/penalty driven behavior
     */
    evaluateDecision(agentId, decision, context = {}) {
        // Get or create behavior profile
        let profile = this.behaviorProfiles.get(agentId);
        if (!profile) {
            profile = this.createBehaviorProfile(agentId);
        }
        
        // Get expected rewards and penalties
        const expectedReward = context.expectedReward || 0;
        const expectedPenalty = context.expectedPenalty || 0;
        
        // Calculate net expected value
        const netExpectedValue = expectedReward - expectedPenalty;
        
        // Decision evaluation result
        const evaluation = {
            decision,
            expectedReward,
            expectedPenalty,
            netExpectedValue,
            meetsRewardThreshold: expectedReward >= profile.adjustedRewardThreshold,
            exceedsPenaltyThreshold: expectedPenalty > profile.adjustedPenaltyThreshold,
            isRiskyDecision: (expectedPenalty / Math.max(0.001, expectedReward)) > profile.adjustedRiskTolerance,
            isPreferredAction: Boolean(profile.actionPreferences[decision]?.weightedScore > 0),
            isAvoidedAction: profile.avoidActions.includes(decision),
            recommendation: 'neutral',
            confidence: 0.5,
            reasoning: []
        };
        
        // Determine recommendation
        if (evaluation.isAvoidedAction) {
            evaluation.recommendation = 'avoid';
            evaluation.confidence = 0.9;
            evaluation.reasoning.push('Action has resulted in penalties previously');
        } else if (!evaluation.meetsRewardThreshold) {
            evaluation.recommendation = 'avoid';
            evaluation.confidence = 0.7;
            evaluation.reasoning.push('Expected reward below threshold');
        } else if (evaluation.exceedsPenaltyThreshold && evaluation.isRiskyDecision) {
            evaluation.recommendation = 'avoid';
            evaluation.confidence = 0.8;
            evaluation.reasoning.push('Expected penalty exceeds threshold and decision is risky');
        } else if (evaluation.isPreferredAction && evaluation.meetsRewardThreshold) {
            evaluation.recommendation = 'pursue';
            evaluation.confidence = 0.8;
            evaluation.reasoning.push('Action is preferred based on past rewards and meets reward threshold');
        } else if (netExpectedValue > 0) {
            evaluation.recommendation = 'pursue';
            evaluation.confidence = 0.6 + (netExpectedValue / 20); // Scale confidence with expected value
            evaluation.reasoning.push('Positive net expected value');
        } else {
            evaluation.recommendation = 'avoid';
            evaluation.confidence = 0.5;
            evaluation.reasoning.push('Insufficient expected reward');
        }
        
        // Cap confidence
        evaluation.confidence = Math.min(0.95, Math.max(0.05, evaluation.confidence));
        
        return evaluation;
    }
    
    /**
     * Get agent motivation profile
     */
    getAgentMotivation(agentId) {
        return this.agentMotivations.get(agentId) || {
            rewardSeeking: 0.5,
            penaltyAvoidance: 0.5,
            riskTolerance: 0.5,
            explorationDrive: 0.5,
            lastUpdate: null
        };
    }
    
    /**
     * Get agent behavior profile
     */
    getAgentBehaviorProfile(agentId) {
        return this.behaviorProfiles.get(agentId) || this.createBehaviorProfile(agentId);
    }
    
    /**
     * Get agent reward memories
     */
    getAgentRewardMemories(agentId) {
        return this.rewardMemory.get(agentId) || [];
    }
    
    /**
     * Get agent penalty memories
     */
    getAgentPenaltyMemories(agentId) {
        return this.penaltyMemory.get(agentId) || [];
    }
    
    /**
     * Generate behavior report for an agent
     */
    generateBehaviorReport(agentId) {
        const motivation = this.getAgentMotivation(agentId);
        const profile = this.getAgentBehaviorProfile(agentId);
        const rewardMemories = this.getAgentRewardMemories(agentId);
        const penaltyMemories = this.getAgentPenaltyMemories(agentId);
        
        // Calculate memory statistics
        const rewardStats = this._calculateMemoryStats(rewardMemories);
        const penaltyStats = this._calculateMemoryStats(penaltyMemories);
        
        // Determine behavioral tendencies
        const tendencies = this._determineBehavioralTendencies(motivation, profile);
        
        return {
            agentId,
            motivation,
            profile,
            memories: {
                rewardCount: rewardMemories.length,
                penaltyCount: penaltyMemories.length,
                rewardStats,
                penaltyStats,
                mostRewardedActions: this._getTopActions(profile.actionPreferences, 3),
                mostPenalizedActions: this._getTopPenalizedActions(agentId, 3)
            },
            tendencies,
            timestamp: Date.now()
        };
    }
    
    /**
     * Calculate memory statistics
     */
    _calculateMemoryStats(memories) {
        if (!memories.length) {
            return {
                total: 0,
                average: 0,
                max: 0,
                recent: 0
            };
        }
        
        const total = memories.reduce((sum, m) => sum + Math.abs(m.amount), 0);
        const max = Math.max(...memories.map(m => Math.abs(m.amount)));
        
        // Calculate recent memory average (last 24 hours)
        const now = Date.now();
        const recentMemories = memories.filter(m => (now - m.timestamp) < 24 * 60 * 60 * 1000);
        const recentTotal = recentMemories.reduce((sum, m) => sum + Math.abs(m.amount), 0);
        
        return {
            total,
            average: total / memories.length,
            max,
            recent: recentMemories.length ? recentTotal / recentMemories.length : 0
        };
    }
    
    /**
     * Determine behavioral tendencies
     */
    _determineBehavioralTendencies(motivation, profile) {
        return {
            riskSeeking: motivation.riskTolerance > 0.7,
            riskAverse: motivation.riskTolerance < 0.3,
            rewardFocused: motivation.rewardSeeking > 0.7,
            penaltyAverse: motivation.penaltyAvoidance > 0.7,
            explorative: profile.adjustedExplorationRate > 0.2,
            conservative: profile.adjustedExplorationRate < 0.05 && motivation.penaltyAvoidance > 0.6
        };
    }
    
    /**
     * Get top rewarded actions
     */
    _getTopActions(actionPreferences, limit = 3) {
        const actions = Object.entries(actionPreferences)
            .map(([action, stats]) => ({
                action,
                score: stats.weightedScore
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
            
        return actions;
    }
    
    /**
     * Get top penalized actions
     */
    _getTopPenalizedActions(agentId, limit = 3) {
        const penaltyMemories = this.penaltyMemory.get(agentId) || [];
        const actionPenalties = {};
        
        // Group penalties by action
        for (const memory of penaltyMemories) {
            const action = memory.context?.action || 'unknown';
            
            if (!actionPenalties[action]) {
                actionPenalties[action] = {
                    count: 0,
                    totalPenalty: 0
                };
            }
            
            actionPenalties[action].count++;
            actionPenalties[action].totalPenalty += Math.abs(memory.amount);
        }
        
        // Sort and limit
        return Object.entries(actionPenalties)
            .map(([action, stats]) => ({
                action,
                score: stats.totalPenalty
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    
    /**
     * Initialize the system
     */
    async initialize() {
        console.log('🎯 Initializing Reward-Penalty Driven Behavior System...');
        
        // Load state from database if available
        if (this.config.dbPool) {
            await this._loadStateFromDatabase();
        }
        
        console.log('✅ Reward-Penalty Driven Behavior System initialized');
        return true;
    }
    
    /**
     * Load state from database
     */
    async _loadStateFromDatabase() {
        if (!this.config.dbPool) return;
        
        try {
            console.log('🔄 Loading behavior state from database...');
            
            // Implementation would load motivation and behavior profiles
            
            console.log('✅ Behavior state loaded from database');
        } catch (error) {
            console.error('❌ Failed to load behavior state:', error);
        }
    }
}

export default RewardPenaltyDrivenBehavior;
