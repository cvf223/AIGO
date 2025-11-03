/**
 * 🏗️ Construction MDP Task Selection System
 * ==========================================
 * CRITICAL SUPERINTELLIGENCE COMPONENT
 * Markov Decision Process for optimal construction task selection and scheduling
 * Maximizes project efficiency while minimizing risks and costs
 */

export class ConstructionMDPTaskSelector {
    constructor(config = {}) {
        this.config = {
            discountFactor: 0.95,
            explorationRate: 0.1,
            learningRate: 0.01,
            maxHorizon: 100,
            enableValueIteration: true,
            enablePolicyIteration: true,
            enableMonteCarlo: true,
            ...config
        };
        
        this.states = new Map();
        this.actions = new Map();
        this.transitions = new Map();
        this.rewards = new Map();
        this.policy = new Map();
        this.valueFunction = new Map();
        this.qFunction = new Map();
        
        this.episodeHistory = [];
        this.isInitialized = false;
    }
    
    /**
     * Initialize MDP task selector
     */
    async initialize() {
        console.log('📋 Initializing Construction MDP Task Selector...');
        
        try {
            // Define state space
            await this.defineStateSpace();
            
            // Define action space
            await this.defineActionSpace();
            
            // Initialize transition model
            await this.initializeTransitionModel();
            
            // Initialize reward function
            await this.initializeRewardFunction();
            
            // Initialize value functions
            await this.initializeValueFunctions();
            
            // Compute initial policy
            await this.computeOptimalPolicy();
            
            this.isInitialized = true;
            console.log('   ✅ MDP Task Selector initialized');
            
        } catch (error) {
            console.error('   ❌ Failed to initialize MDP:', error.message);
            throw error;
        }
    }
    
    /**
     * Define construction project state space
     */
    async defineStateSpace() {
        // Construction project states
        const stateTypes = [
            // Project phases
            { type: 'phase', values: ['planning', 'foundation', 'structure', 'envelope', 'interior', 'finishing'] },
            
            // Resource availability
            { type: 'resources', values: ['abundant', 'adequate', 'constrained', 'critical'] },
            
            // Weather conditions
            { type: 'weather', values: ['excellent', 'good', 'fair', 'poor'] },
            
            // Schedule status
            { type: 'schedule', values: ['ahead', 'on_time', 'slight_delay', 'major_delay'] },
            
            // Budget status
            { type: 'budget', values: ['under', 'on_budget', 'slight_over', 'major_over'] },
            
            // Quality status
            { type: 'quality', values: ['excellent', 'good', 'acceptable', 'issues'] }
        ];
        
        // Generate state combinations
        this.generateStates(stateTypes);
        console.log(`   📊 Defined ${this.states.size} states`);
    }
    
    /**
     * Generate state combinations
     */
    generateStates(stateTypes) {
        // Simplified - generate key states rather than full Cartesian product
        const keyStates = [
            { phase: 'planning', resources: 'adequate', weather: 'good', schedule: 'on_time', budget: 'on_budget', quality: 'good' },
            { phase: 'foundation', resources: 'adequate', weather: 'good', schedule: 'on_time', budget: 'on_budget', quality: 'good' },
            { phase: 'structure', resources: 'adequate', weather: 'fair', schedule: 'on_time', budget: 'on_budget', quality: 'good' },
            { phase: 'envelope', resources: 'constrained', weather: 'poor', schedule: 'slight_delay', budget: 'slight_over', quality: 'acceptable' },
            { phase: 'interior', resources: 'adequate', weather: 'good', schedule: 'on_time', budget: 'on_budget', quality: 'excellent' },
            { phase: 'finishing', resources: 'abundant', weather: 'excellent', schedule: 'ahead', budget: 'under', quality: 'excellent' }
        ];
        
        keyStates.forEach((state, i) => {
            this.states.set(`state_${i}`, state);
        });
    }
    
    /**
     * Define action space for construction tasks
     */
    async defineActionSpace() {
        const constructionActions = [
            // Resource management
            { id: 'hire_workers', type: 'resource', cost: 'medium', duration: 'short' },
            { id: 'order_materials', type: 'resource', cost: 'high', duration: 'medium' },
            { id: 'rent_equipment', type: 'resource', cost: 'medium', duration: 'variable' },
            
            // Quality control
            { id: 'quality_inspection', type: 'quality', cost: 'low', duration: 'short' },
            { id: 'rework', type: 'quality', cost: 'high', duration: 'medium' },
            { id: 'preventive_measures', type: 'quality', cost: 'medium', duration: 'short' },
            
            // Schedule management
            { id: 'overtime', type: 'schedule', cost: 'high', duration: 'immediate' },
            { id: 'parallel_tasks', type: 'schedule', cost: 'medium', duration: 'medium' },
            { id: 'fast_track', type: 'schedule', cost: 'very_high', duration: 'long' },
            
            // Risk mitigation
            { id: 'weather_protection', type: 'risk', cost: 'medium', duration: 'short' },
            { id: 'safety_training', type: 'risk', cost: 'low', duration: 'short' },
            { id: 'contingency_planning', type: 'risk', cost: 'low', duration: 'medium' },
            
            // Progress actions
            { id: 'continue_normal', type: 'progress', cost: 'normal', duration: 'standard' },
            { id: 'accelerate', type: 'progress', cost: 'high', duration: 'reduced' },
            { id: 'slow_down', type: 'progress', cost: 'low', duration: 'extended' }
        ];
        
        constructionActions.forEach(action => {
            this.actions.set(action.id, action);
        });
        
        console.log(`   🎯 Defined ${this.actions.size} actions`);
    }
    
    /**
     * Initialize transition model
     */
    async initializeTransitionModel() {
        // Define how actions affect state transitions
        for (const [stateId, state] of this.states) {
            for (const [actionId, action] of this.actions) {
                const transitions = this.computeTransitions(state, action);
                const key = `${stateId}_${actionId}`;
                this.transitions.set(key, transitions);
            }
        }
        
        console.log(`   🔄 Initialized ${this.transitions.size} transitions`);
    }
    
    /**
     * Compute state transitions
     */
    computeTransitions(state, action) {
        const transitions = [];
        
        // Simplified transition model
        if (action.type === 'resource' && state.resources === 'constrained') {
            // Resource actions improve resource state
            transitions.push({
                nextState: { ...state, resources: 'adequate' },
                probability: 0.7
            });
            transitions.push({
                nextState: { ...state, resources: 'abundant' },
                probability: 0.2
            });
            transitions.push({
                nextState: state, // No change
                probability: 0.1
            });
        } else if (action.type === 'schedule' && state.schedule === 'slight_delay') {
            // Schedule actions can recover time
            transitions.push({
                nextState: { ...state, schedule: 'on_time' },
                probability: 0.6
            });
            transitions.push({
                nextState: { ...state, schedule: 'ahead' },
                probability: 0.1
            });
            transitions.push({
                nextState: state, // No improvement
                probability: 0.3
            });
        } else if (action.type === 'quality' && state.quality === 'issues') {
            // Quality actions improve quality
            transitions.push({
                nextState: { ...state, quality: 'acceptable' },
                probability: 0.5
            });
            transitions.push({
                nextState: { ...state, quality: 'good' },
                probability: 0.3
            });
            transitions.push({
                nextState: state, // Issues persist
                probability: 0.2
            });
        } else if (action.id === 'continue_normal') {
            // Normal progress transitions
            transitions.push({
                nextState: this.progressToNextPhase(state),
                probability: 0.8
            });
            transitions.push({
                nextState: state, // Stay in current state
                probability: 0.2
            });
        } else {
            // Default: stay in same state
            transitions.push({
                nextState: state,
                probability: 1.0
            });
        }
        
        return transitions;
    }
    
    /**
     * Progress to next construction phase
     */
    progressToNextPhase(state) {
        const phaseOrder = ['planning', 'foundation', 'structure', 'envelope', 'interior', 'finishing'];
        const currentIndex = phaseOrder.indexOf(state.phase);
        
        if (currentIndex < phaseOrder.length - 1) {
            return { ...state, phase: phaseOrder[currentIndex + 1] };
        }
        
        return { ...state, phase: 'completed' };
    }
    
    /**
     * Initialize reward function
     */
    async initializeRewardFunction() {
        // Define rewards for state-action pairs
        for (const [stateId, state] of this.states) {
            for (const [actionId, action] of this.actions) {
                const reward = this.computeReward(state, action);
                const key = `${stateId}_${actionId}`;
                this.rewards.set(key, reward);
            }
        }
        
        console.log(`   💰 Initialized ${this.rewards.size} rewards`);
    }
    
    /**
     * Compute reward for state-action pair
     */
    computeReward(state, action) {
        let reward = 0;
        
        // Phase completion rewards
        if (state.phase === 'finishing' && action.id === 'continue_normal') {
            reward += 100; // Project completion bonus
        }
        
        // Schedule rewards/penalties
        if (state.schedule === 'ahead') {
            reward += 10;
        } else if (state.schedule === 'major_delay') {
            reward -= 20;
        }
        
        // Budget rewards/penalties
        if (state.budget === 'under') {
            reward += 15;
        } else if (state.budget === 'major_over') {
            reward -= 25;
        }
        
        // Quality rewards/penalties
        if (state.quality === 'excellent') {
            reward += 20;
        } else if (state.quality === 'issues') {
            reward -= 30;
        }
        
        // Action costs
        const costMap = {
            'low': -2,
            'medium': -5,
            'high': -10,
            'very_high': -20,
            'normal': -3
        };
        
        reward += costMap[action.cost] || 0;
        
        // Resource state bonus
        if (state.resources === 'abundant') {
            reward += 5;
        } else if (state.resources === 'critical') {
            reward -= 15;
        }
        
        return reward;
    }
    
    /**
     * Initialize value functions
     */
    async initializeValueFunctions() {
        // Initialize V(s) and Q(s,a) to zero
        for (const [stateId, state] of this.states) {
            this.valueFunction.set(stateId, 0);
            
            for (const [actionId, action] of this.actions) {
                const key = `${stateId}_${actionId}`;
                this.qFunction.set(key, 0);
            }
        }
        
        console.log('   📈 Initialized value functions');
    }
    
    /**
     * Compute optimal policy
     */
    async computeOptimalPolicy() {
        if (this.config.enableValueIteration) {
            await this.valueIteration();
        } else if (this.config.enablePolicyIteration) {
            await this.policyIteration();
        } else {
            await this.monteCarloPolicyEvaluation();
        }
        
        // Extract policy from Q-function
        this.extractPolicy();
    }
    
    /**
     * Value iteration algorithm
     */
    async valueIteration() {
        console.log('   🔄 Running value iteration...');
        const theta = 0.01; // Convergence threshold
        let delta = Infinity;
        let iterations = 0;
        
        while (delta > theta && iterations < 1000) {
            delta = 0;
            
            for (const [stateId, state] of this.states) {
                const v = this.valueFunction.get(stateId);
                
                // Find best action value
                let maxQ = -Infinity;
                
                for (const [actionId, action] of this.actions) {
                    const q = this.computeQValue(stateId, actionId);
                    maxQ = Math.max(maxQ, q);
                    
                    // Update Q-function
                    const key = `${stateId}_${actionId}`;
                    this.qFunction.set(key, q);
                }
                
                // Update value function
                this.valueFunction.set(stateId, maxQ);
                delta = Math.max(delta, Math.abs(v - maxQ));
            }
            
            iterations++;
        }
        
        console.log(`   ✅ Value iteration converged in ${iterations} iterations`);
    }
    
    /**
     * Compute Q-value for state-action pair
     */
    computeQValue(stateId, actionId) {
        const key = `${stateId}_${actionId}`;
        const reward = this.rewards.get(key) || 0;
        const transitions = this.transitions.get(key) || [];
        
        let expectedFutureValue = 0;
        
        for (const transition of transitions) {
            // Find the state ID for next state
            const nextStateId = this.findStateId(transition.nextState);
            if (nextStateId) {
                const nextValue = this.valueFunction.get(nextStateId) || 0;
                expectedFutureValue += transition.probability * nextValue;
            }
        }
        
        return reward + this.config.discountFactor * expectedFutureValue;
    }
    
    /**
     * Find state ID by state properties
     */
    findStateId(targetState) {
        for (const [stateId, state] of this.states) {
            if (this.statesEqual(state, targetState)) {
                return stateId;
            }
        }
        return null;
    }
    
    /**
     * Check if states are equal
     */
    statesEqual(state1, state2) {
        return JSON.stringify(state1) === JSON.stringify(state2);
    }
    
    /**
     * Policy iteration algorithm
     */
    async policyIteration() {
        console.log('   🔄 Running policy iteration...');
        
        // Initialize random policy
        this.initializeRandomPolicy();
        
        let policyStable = false;
        let iterations = 0;
        
        while (!policyStable && iterations < 100) {
            // Policy evaluation
            await this.policyEvaluation();
            
            // Policy improvement
            policyStable = await this.policyImprovement();
            
            iterations++;
        }
        
        console.log(`   ✅ Policy iteration converged in ${iterations} iterations`);
    }
    
    /**
     * Initialize random policy
     */
    initializeRandomPolicy() {
        for (const [stateId, state] of this.states) {
            const actionIds = Array.from(this.actions.keys());
            const randomAction = actionIds[Math.floor(Math.random() * actionIds.length)];
            this.policy.set(stateId, randomAction);
        }
    }
    
    /**
     * Policy evaluation
     */
    async policyEvaluation() {
        const theta = 0.01;
        let delta = Infinity;
        
        while (delta > theta) {
            delta = 0;
            
            for (const [stateId, state] of this.states) {
                const v = this.valueFunction.get(stateId);
                const actionId = this.policy.get(stateId);
                
                if (actionId) {
                    const newValue = this.computeQValue(stateId, actionId);
                    this.valueFunction.set(stateId, newValue);
                    delta = Math.max(delta, Math.abs(v - newValue));
                }
            }
        }
    }
    
    /**
     * Policy improvement
     */
    async policyImprovement() {
        let policyStable = true;
        
        for (const [stateId, state] of this.states) {
            const oldAction = this.policy.get(stateId);
            
            // Find best action
            let bestAction = null;
            let bestValue = -Infinity;
            
            for (const [actionId, action] of this.actions) {
                const q = this.computeQValue(stateId, actionId);
                if (q > bestValue) {
                    bestValue = q;
                    bestAction = actionId;
                }
            }
            
            if (bestAction !== oldAction) {
                this.policy.set(stateId, bestAction);
                policyStable = false;
            }
        }
        
        return policyStable;
    }
    
    /**
     * Monte Carlo policy evaluation
     */
    async monteCarloPolicyEvaluation() {
        console.log('   🎲 Running Monte Carlo evaluation...');
        
        const numEpisodes = 100;
        const returns = new Map(); // G(s,a) returns
        const counts = new Map(); // N(s,a) counts
        
        for (let episode = 0; episode < numEpisodes; episode++) {
            const trajectory = await this.generateEpisode();
            const G = this.calculateReturns(trajectory);
            
            // Update value estimates
            for (let t = 0; t < trajectory.length; t++) {
                const { state, action } = trajectory[t];
                const key = `${state}_${action}`;
                
                const currentReturn = returns.get(key) || 0;
                const currentCount = counts.get(key) || 0;
                
                returns.set(key, currentReturn + G[t]);
                counts.set(key, currentCount + 1);
                
                // Update Q-function
                this.qFunction.set(key, (currentReturn + G[t]) / (currentCount + 1));
            }
        }
        
        console.log(`   ✅ Monte Carlo evaluation complete`);
    }
    
    /**
     * Generate episode
     */
    async generateEpisode() {
        const trajectory = [];
        const maxSteps = 100;
        
        // Start from random state
        const stateIds = Array.from(this.states.keys());
        let currentStateId = stateIds[Math.floor(Math.random() * stateIds.length)];
        
        for (let step = 0; step < maxSteps; step++) {
            // Choose action (epsilon-greedy)
            const actionId = this.chooseAction(currentStateId);
            
            // Get reward
            const key = `${currentStateId}_${actionId}`;
            const reward = this.rewards.get(key) || 0;
            
            trajectory.push({
                state: currentStateId,
                action: actionId,
                reward
            });
            
            // Transition to next state
            const transitions = this.transitions.get(key) || [];
            if (transitions.length > 0) {
                const nextState = this.sampleTransition(transitions);
                currentStateId = this.findStateId(nextState) || currentStateId;
            }
            
            // Check for terminal state
            if (this.isTerminal(currentStateId)) {
                break;
            }
        }
        
        return trajectory;
    }
    
    /**
     * Choose action using epsilon-greedy
     */
    chooseAction(stateId) {
        if (Math.random() < this.config.explorationRate) {
            // Explore: random action
            const actionIds = Array.from(this.actions.keys());
            return actionIds[Math.floor(Math.random() * actionIds.length)];
        } else {
            // Exploit: best action
            return this.policy.get(stateId) || this.getBestAction(stateId);
        }
    }
    
    /**
     * Get best action for state
     */
    getBestAction(stateId) {
        let bestAction = null;
        let bestValue = -Infinity;
        
        for (const [actionId, action] of this.actions) {
            const key = `${stateId}_${actionId}`;
            const q = this.qFunction.get(key) || 0;
            
            if (q > bestValue) {
                bestValue = q;
                bestAction = actionId;
            }
        }
        
        return bestAction;
    }
    
    /**
     * Sample transition
     */
    sampleTransition(transitions) {
        const rand = Math.random();
        let cumulative = 0;
        
        for (const transition of transitions) {
            cumulative += transition.probability;
            if (rand < cumulative) {
                return transition.nextState;
            }
        }
        
        return transitions[transitions.length - 1].nextState;
    }
    
    /**
     * Check if state is terminal
     */
    isTerminal(stateId) {
        const state = this.states.get(stateId);
        return state && state.phase === 'completed';
    }
    
    /**
     * Calculate returns for trajectory
     */
    calculateReturns(trajectory) {
        const G = new Array(trajectory.length);
        G[trajectory.length - 1] = trajectory[trajectory.length - 1].reward;
        
        for (let t = trajectory.length - 2; t >= 0; t--) {
            G[t] = trajectory[t].reward + this.config.discountFactor * G[t + 1];
        }
        
        return G;
    }
    
    /**
     * Extract policy from Q-function
     */
    extractPolicy() {
        for (const [stateId, state] of this.states) {
            const bestAction = this.getBestAction(stateId);
            this.policy.set(stateId, bestAction);
        }
        
        console.log(`   ✅ Policy extracted for ${this.policy.size} states`);
    }
    
    /**
     * Select next task given current project state
     */
    async selectTask(currentState) {
        // Find closest matching state
        const stateId = this.findClosestState(currentState);
        
        if (!stateId) {
            console.warn('   ⚠️ No matching state found, using default action');
            return { action: 'continue_normal', confidence: 0.5 };
        }
        
        // Get recommended action from policy
        const actionId = this.policy.get(stateId);
        const action = this.actions.get(actionId);
        
        // Get Q-value for confidence
        const key = `${stateId}_${actionId}`;
        const qValue = this.qFunction.get(key) || 0;
        const maxQ = Math.max(...Array.from(this.qFunction.values()));
        const confidence = maxQ > 0 ? qValue / maxQ : 0.5;
        
        return {
            action: actionId,
            details: action,
            confidence,
            expectedValue: qValue,
            state: stateId
        };
    }
    
    /**
     * Find closest matching state
     */
    findClosestState(targetState) {
        // Find exact match first
        for (const [stateId, state] of this.states) {
            if (this.statesSimilar(state, targetState, 1.0)) {
                return stateId;
            }
        }
        
        // Find approximate match
        for (const [stateId, state] of this.states) {
            if (this.statesSimilar(state, targetState, 0.7)) {
                return stateId;
            }
        }
        
        // Return first state as fallback
        return this.states.keys().next().value;
    }
    
    /**
     * Check if states are similar
     */
    statesSimilar(state1, state2, threshold) {
        const features = ['phase', 'resources', 'schedule', 'budget', 'quality'];
        let matches = 0;
        
        for (const feature of features) {
            if (state1[feature] === state2[feature]) {
                matches++;
            }
        }
        
        return (matches / features.length) >= threshold;
    }
    
    /**
     * Update model with experience
     */
    async updateWithExperience(state, action, reward, nextState) {
        // Update transition model
        const key = `${state}_${action}`;
        const transitions = this.transitions.get(key) || [];
        
        // Simple count-based update
        const existingTransition = transitions.find(t => 
            this.statesEqual(t.nextState, nextState)
        );
        
        if (existingTransition) {
            // Increase probability
            existingTransition.probability = Math.min(1.0, existingTransition.probability * 1.1);
        } else {
            // Add new transition
            transitions.push({
                nextState,
                probability: 0.1
            });
        }
        
        // Normalize probabilities
        const total = transitions.reduce((sum, t) => sum + t.probability, 0);
        transitions.forEach(t => t.probability /= total);
        
        this.transitions.set(key, transitions);
        
        // Update reward estimate (running average)
        const currentReward = this.rewards.get(key) || 0;
        const updatedReward = currentReward * 0.9 + reward * 0.1;
        this.rewards.set(key, updatedReward);
        
        // Update Q-value
        const alpha = this.config.learningRate;
        const currentQ = this.qFunction.get(key) || 0;
        const nextStateId = this.findStateId(nextState);
        const nextMaxQ = nextStateId ? 
            Math.max(...Array.from(this.actions.keys()).map(a => 
                this.qFunction.get(`${nextStateId}_${a}`) || 0
            )) : 0;
        
        const newQ = currentQ + alpha * (reward + this.config.discountFactor * nextMaxQ - currentQ);
        this.qFunction.set(key, newQ);
        
        // Update policy for this state
        const bestAction = this.getBestAction(state);
        this.policy.set(state, bestAction);
    }
    
    /**
     * Get policy summary
     */
    getPolicySummary() {
        const summary = {
            states: this.states.size,
            actions: this.actions.size,
            policyEntries: this.policy.size,
            recommendations: []
        };
        
        // Get top recommendations
        for (const [stateId, actionId] of this.policy) {
            const state = this.states.get(stateId);
            const action = this.actions.get(actionId);
            const key = `${stateId}_${actionId}`;
            const value = this.qFunction.get(key) || 0;
            
            summary.recommendations.push({
                state: state.phase,
                action: actionId,
                value
            });
        }
        
        // Sort by value
        summary.recommendations.sort((a, b) => b.value - a.value);
        summary.recommendations = summary.recommendations.slice(0, 5);
        
        return summary;
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            states: this.states.size,
            actions: this.actions.size,
            transitions: this.transitions.size,
            policySize: this.policy.size
        };
    }
}

// Export singleton instance
export const constructionMDPTaskSelector = new ConstructionMDPTaskSelector();
export default ConstructionMDPTaskSelector;

