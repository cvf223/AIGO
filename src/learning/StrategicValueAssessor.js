/**
 * 🏛️ Strategic Value Assessor (LTV Engine)
 * =========================================
 *
 * This service is the core of the syndicate's long-term strategic thinking. It moves
 * agents beyond chasing short-term rewards by calculating the Long-Term Value (LTV)
 * of any given action, using principles from Markov Decision Processes (MDPs).
 *
 * It helps agents answer the question: "Is it better to take this small, certain profit
 * now, or to perform this research task that could lead to much larger profits later?"
 */

import { EventEmitter } from 'events';

class StrategicValueAssessor extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            // The discount factor (gamma) from MDP. A value closer to 1 means the agent
            // is more patient and values future rewards highly.
            discountFactor: config.discountFactor || 0.95,

            // A map of base rewards for actions. These represent the intrinsic value
            // of an action before considering its direct profit.
            actionValueMap: {
                EXECUTE_ARBITRAGE: 10,
                CONTRIBUTE_VERIFIED_MEMORY: 15,
                RESEARCH_COMPETITOR: 12,
                EXPLORE_NEW_STRATEGY: 8,
                // 💡 NEWLY ADDED STRATEGIC ACTIONS
                FIND_NEW_STRATEGY: 20, // Finding a novel strategy is a huge long-term win.
                FIND_NEW_ROUTE: 5,     // Incrementally valuable.
                FIND_NEW_POOL: 5,      // Incrementally valuable.
                SOCIAL_SENTIMENT_ANALYSIS_WITH_CORRELATION: 25 // Top-tier predictive intelligence.
            },
            // Estimated number of steps (e.g., hours or opportunities) until a research action pays off.
            payoffHorizons: {
                RESEARCH_COMPETITOR: 5,
                EXPLORE_NEW_STRATEGY: 10,
                // 💡 NEWLY ADDED PAYOFF HORIZONS
                FIND_NEW_STRATEGY: 15,
                SOCIAL_SENTIMENT_ANALYSIS_WITH_CORRELATION: 8
            },
            agentProfileCache: new Map(),
            ltvCache: new Map(),
            ...config
        };

        // 💡 NEW: Inject the CapabilityRegistry
        this.capabilityRegistry = config.capabilityRegistry;
        if (!this.capabilityRegistry) {
            throw new Error("StrategicValueAssessor requires a CapabilityRegistry instance.");
        }
    }

    /**
     * Calculates the Long-Term Value (LTV) of a proposed action.
     * @param {string} actionType - The type of action (e.g., 'RESEARCH_COMPETITOR').
     * @param {number} immediateReward - The immediate reward for the action.
     * @param {number} estimatedFutureReward - The estimated reward upon payoff.
     * @returns {number} The calculated LTV score.
     */
    calculateLTV(actionType, immediateReward, estimatedFutureReward = 0) {
        const horizon = this.config.payoffHorizons[actionType];

        if (horizon && estimatedFutureReward > 0) {
            // This is a long-term task. Calculate the Net Present Value (NPV) of the future reward.
            const discountedFutureReward = estimatedFutureReward * Math.pow(this.config.discountFactor, horizon);
            return immediateReward + discountedFutureReward;
        } else {
            // This is a short-term task. The LTV is just its immediate reward.
            return immediateReward;
        }
    }

    /**
     * 💡 REFACTORED: Now checks for capability before valuing a task.
     * Compares multiple potential tasks and recommends the one with the highest LTV.
     * @param {Array<object>} tasks - An array of task objects to evaluate.
     * @param {object} syndicateState - The current state of the syndicate's resources.
     * @returns {object|null} The best task to perform, or null if no tasks are viable.
     */
    selectBestTask(tasks, syndicateState, agentId) {
        let bestTask = null;
        let maxLTV = -Infinity;

        for (const task of tasks) {
            // 💡 REFACTORED: Use the dynamic CapabilityRegistry
            const capabilityCheck = this.capabilityRegistry.checkCapability(task.capability, syndicateState);

            if (!capabilityCheck.isCapable) {
                console.log(`[LTV] Skipping task '${task.type}': ${capabilityCheck.reason}`);
                // 💡 NEW: If the task is high-value but we lack the capability, request it.
                if (task.estimatedFutureReward > 50) { // High-value threshold
                    this.capabilityRegistry.requestNewCapability(
                        task.capability,
                        `Capability needed for high-value task: ${task.type}`,
                        task.requirements,
                        agentId
                    );
                }
                continue;
            }

            const ltv = this.calculateLTV(task.type, task.immediateReward, task.estimatedFutureReward);

            if (ltv > maxLTV) {
                maxLTV = ltv;
                bestTask = task;
            }
        }

        return bestTask;
    }
}

export { StrategicValueAssessor };
