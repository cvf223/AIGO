/**
 * Basic Learning RL - Month 2 Implementation
 * 
 * 💡 WHY: Integrates reinforcement learning with the Enhanced Learning Agent
 * to optimize learning behavior through reward-based feedback.
 * 
 * ⚙️ HOW: Implements simple RL loops for knowledge prioritization, rewards
 * agents for asking good questions, and penalizes redundant learning.
 */

import { EnhancedLearningAgent, LearningGoal, KnowledgeGap, LearningMetrics } from './EnhancedLearningAgent';
import { IAgentRuntime } from '../src/types';

// RL Reward Components
interface RewardComponents {
    knowledgeAcquisition: number;    // +reward for learning new things
    accuracyImprovement: number;     // +reward for better predictions  
    practicalApplication: number;    // +reward for successful actions
    questionQuality: number;         // +reward for asking good questions
    redundancyPenalty: number;       // -penalty for redundant learning
    efficiencyBonus: number;         // +bonus for efficient learning
}

interface LearningAction {
    type: 'acquire_knowledge' | 'ask_question' | 'practice_skill' | 'assess_progress';
    target: string; // topic, agent_id, skill_name, etc.
    priority: number; // 0-1
    estimatedCost: number; // time/resources
    expectedReward: number; // predicted reward
}

interface LearningState {
    currentExpertise: Record<string, number>; // domain -> level
    knowledgeGaps: KnowledgeGap[];
    recentActions: LearningAction[];
    learningEfficiency: number;
    questionSuccessRate: number;
    practicalSuccessRate: number;
}

interface RLExperience {
    state: LearningState;
    action: LearningAction;
    reward: number;
    nextState: LearningState;
    done: boolean;
    timestamp: number;
}

export class BasicLearningRL {
    private runtime: IAgentRuntime;
    private learningAgent: EnhancedLearningAgent;
    private rewardComponents: RewardComponents;
    private experienceBuffer: RLExperience[] = [];
    private qTable: Map<string, Map<string, number>> = new Map(); // Simple Q-learning
    private learningRate: number = 0.1;
    private discountFactor: number = 0.95;
    private explorationRate: number = 0.1;
    
    constructor(runtime: IAgentRuntime, learningAgent: EnhancedLearningAgent) {
        this.runtime = runtime;
        this.learningAgent = learningAgent;
        this.rewardComponents = {
            knowledgeAcquisition: 0.3,
            accuracyImprovement: 0.4,
            practicalApplication: 0.3,
            questionQuality: 0.2,
            redundancyPenalty: -0.1,
            efficiencyBonus: 0.15
        };
    }
    
    /**
     * Main RL optimization loop for learning behavior
     */
    async optimizeLearningBehavior(): Promise<void> {
        console.log('🤖 Starting RL-optimized learning cycle...');
        
        // Get current learning state
        const currentState = await this.getCurrentLearningState();
        
        // Select optimal learning action using RL policy
        const action = await this.selectLearningAction(currentState);
        
        // Execute the action
        const executionResult = await this.executeLearningAction(action);
        
        // Calculate reward
        const reward = this.calculateReward(currentState, action, executionResult);
        
        // Get new state after action
        const nextState = await this.getCurrentLearningState();
        
        // Store experience for learning
        const experience: RLExperience = {
            state: currentState,
            action,
            reward,
            nextState,
            done: this.isLearningGoalComplete(nextState),
            timestamp: Date.now()
        };
        
        this.experienceBuffer.push(experience);
        
        // Update Q-table (simple Q-learning)
        this.updateQTable(experience);
        
        // Log results
        console.log(`🎯 Action: ${action.type} on ${action.target}`);
        console.log(`💰 Reward: ${reward.toFixed(3)}`);
        console.log(`📈 Learning efficiency: ${nextState.learningEfficiency.toFixed(3)}`);
        
        // Cleanup old experiences
        if (this.experienceBuffer.length > 1000) {
            this.experienceBuffer = this.experienceBuffer.slice(-500);
        }
    }
    
    /**
     * Get current learning state for RL decision making
     */
    private async getCurrentLearningState(): Promise<LearningState> {
        const metrics = this.learningAgent.getLearningMetrics();
        const expertiseReports = await this.learningAgent.getExpertiseReport();
        
        const currentExpertise: Record<string, number> = {};
        for (const report of expertiseReports) {
            currentExpertise[report.domain] = report.overallLevel;
        }
        
        // Get knowledge gaps (simplified)
        const knowledgeGaps: KnowledgeGap[] = [];
        for (const report of expertiseReports) {
            for (const weakness of report.weaknesses) {
                knowledgeGaps.push({
                    topic: weakness,
                    domain: report.domain,
                    gapSize: (100 - report.subdomainLevels[weakness]) / 100,
                    importance: 0.8, // Default importance
                    suggestedSources: [`${weakness}_sources`],
                    relatedTopics: [],
                    estimatedLearningTime: 10
                });
            }
        }
        
        return {
            currentExpertise,
            knowledgeGaps,
            recentActions: this.getRecentActions(),
            learningEfficiency: metrics.learningEfficiency,
            questionSuccessRate: metrics.questionQuality,
            practicalSuccessRate: metrics.applicationSuccessRate
        };
    }
    
    /**
     * Select optimal learning action using RL policy (epsilon-greedy)
     */
    private async selectLearningAction(state: LearningState): Promise<LearningAction> {
        const stateKey = this.encodeState(state);
        
        // Epsilon-greedy exploration
        if (Math.random() < this.explorationRate) {
            return this.getRandomAction(state);
        }
        
        // Get Q-values for all possible actions
        const qValues = this.qTable.get(stateKey) || new Map();
        
        // Find action with highest Q-value
        let bestAction: LearningAction | null = null;
        let bestQValue = -Infinity;
        
        const possibleActions = this.getPossibleActions(state);
        
        for (const action of possibleActions) {
            const actionKey = this.encodeAction(action);
            const qValue = qValues.get(actionKey) || 0;
            
            if (qValue > bestQValue) {
                bestQValue = qValue;
                bestAction = action;
            }
        }
        
        return bestAction || this.getRandomAction(state);
    }
    
    /**
     * Get all possible learning actions for current state
     */
    private getPossibleActions(state: LearningState): LearningAction[] {
        const actions: LearningAction[] = [];
        
        // Knowledge acquisition actions
        for (const gap of state.knowledgeGaps.slice(0, 5)) { // Top 5 gaps
            actions.push({
                type: 'acquire_knowledge',
                target: gap.topic,
                priority: gap.importance * gap.gapSize,
                estimatedCost: gap.estimatedLearningTime,
                expectedReward: this.estimateReward('acquire_knowledge', gap.importance)
            });
        }
        
        // Question asking actions (if efficiency is low)
        if (state.learningEfficiency < 0.6) {
            for (const gap of state.knowledgeGaps.slice(0, 3)) {
                actions.push({
                    type: 'ask_question',
                    target: gap.topic,
                    priority: gap.importance,
                    estimatedCost: 1, // Low cost
                    expectedReward: this.estimateReward('ask_question', gap.importance)
                });
            }
        }
        
        // Practice actions (if practical success rate is low)
        if (state.practicalSuccessRate < 0.7) {
            for (const [domain, level] of Object.entries(state.currentExpertise)) {
                if (level > 30) { // Only practice if we have some knowledge
                    actions.push({
                        type: 'practice_skill',
                        target: domain,
                        priority: level / 100,
                        estimatedCost: 5,
                        expectedReward: this.estimateReward('practice_skill', level / 100)
                    });
                }
            }
        }
        
        // Progress assessment action
        actions.push({
            type: 'assess_progress',
            target: 'all_domains',
            priority: 0.5,
            estimatedCost: 2,
            expectedReward: this.estimateReward('assess_progress', 0.5)
        });
        
        return actions;
    }
    
    /**
     * Execute the selected learning action
     */
    private async executeLearningAction(action: LearningAction): Promise<any> {
        console.log(`🎬 Executing: ${action.type} on ${action.target}`);
        
        switch (action.type) {
            case 'acquire_knowledge':
                return await this.executeKnowledgeAcquisition(action.target);
                
            case 'ask_question':
                return await this.executeQuestionAsking(action.target);
                
            case 'practice_skill':
                return await this.executePracticeSkill(action.target);
                
            case 'assess_progress':
                return await this.executeProgressAssessment();
                
            default:
                return { success: false, reason: 'Unknown action type' };
        }
    }
    
    private async executeKnowledgeAcquisition(topic: string): Promise<any> {
        // Simulate knowledge acquisition with some randomness
        const success = Math.random() > 0.2; // 80% success rate
        const knowledgeGained = success ? Math.random() * 0.1 + 0.05 : 0; // 5-15% knowledge gain
        
        return {
            success,
            knowledgeGained,
            topic,
            sources: Math.floor(Math.random() * 3) + 1
        };
    }
    
    private async executeQuestionAsking(topic: string): Promise<any> {
        // Simulate asking questions to other agents
        const questionQuality = Math.random(); // Random quality
        const responseQuality = questionQuality > 0.6 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.4;
        
        return {
            success: questionQuality > 0.4,
            questionQuality,
            responseQuality,
            topic,
            knowledgeGained: responseQuality * 0.05 // Up to 5% knowledge gain
        };
    }
    
    private async executePracticeSkill(domain: string): Promise<any> {
        // Simulate practical skill application
        const skillLevel = Math.random(); // Current skill level simulation
        const practiceSuccess = skillLevel > 0.3 ? Math.random() > 0.3 : Math.random() > 0.7;
        
        return {
            success: practiceSuccess,
            skillImprovement: practiceSuccess ? Math.random() * 0.08 + 0.02 : 0,
            domain,
            practiceType: 'simulation'
        };
    }
    
    private async executeProgressAssessment(): Promise<any> {
        // Simulate progress assessment
        const assessmentAccuracy = Math.random() * 0.3 + 0.7; // 70-100% accuracy
        
        return {
            success: true,
            assessmentAccuracy,
            insightsGained: Math.floor(Math.random() * 5) + 1,
            recommendationsGenerated: Math.floor(Math.random() * 3) + 1
        };
    }
    
    /**
     * Calculate reward for the executed action
     */
    private calculateReward(state: LearningState, action: LearningAction, result: any): number {
        let totalReward = 0;
        
        // Base reward for successful actions
        if (result.success) {
            totalReward += 0.1;
        } else {
            totalReward -= 0.05;
        }
        
        // Knowledge acquisition reward
        if (result.knowledgeGained) {
            totalReward += result.knowledgeGained * this.rewardComponents.knowledgeAcquisition;
        }
        
        // Question quality reward
        if (result.questionQuality) {
            totalReward += result.questionQuality * this.rewardComponents.questionQuality;
        }
        
        // Practical application reward
        if (result.skillImprovement) {
            totalReward += result.skillImprovement * this.rewardComponents.practicalApplication;
        }
        
        // Efficiency bonus (reward faster learning)
        const efficiencyBonus = (1 / action.estimatedCost) * this.rewardComponents.efficiencyBonus;
        totalReward += efficiencyBonus;
        
        // Redundancy penalty (check if we're learning the same thing repeatedly)
        const redundancyPenalty = this.calculateRedundancyPenalty(action);
        totalReward += redundancyPenalty;
        
        // Priority alignment reward
        totalReward += action.priority * 0.1;
        
        return totalReward;
    }
    
    private calculateRedundancyPenalty(action: LearningAction): number {
        const recentSimilarActions = this.getRecentActions().filter(recentAction => 
            recentAction.type === action.type && recentAction.target === action.target
        );
        
        // Penalty increases with number of recent similar actions
        return recentSimilarActions.length * this.rewardComponents.redundancyPenalty;
    }
    
    /**
     * Update Q-table using Q-learning algorithm
     */
    private updateQTable(experience: RLExperience): void {
        const stateKey = this.encodeState(experience.state);
        const actionKey = this.encodeAction(experience.action);
        const nextStateKey = this.encodeState(experience.nextState);
        
        // Initialize Q-values if not exists
        if (!this.qTable.has(stateKey)) {
            this.qTable.set(stateKey, new Map());
        }
        
        const stateQValues = this.qTable.get(stateKey)!;
        const currentQ = stateQValues.get(actionKey) || 0;
        
        // Find max Q-value for next state
        const nextStateQValues = this.qTable.get(nextStateKey) || new Map();
        const maxNextQ = Math.max(...Array.from(nextStateQValues.values()), 0);
        
        // Q-learning update: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
        const targetQ = experience.reward + (experience.done ? 0 : this.discountFactor * maxNextQ);
        const newQ = currentQ + this.learningRate * (targetQ - currentQ);
        
        stateQValues.set(actionKey, newQ);
    }
    
    /**
     * Encode state into string key for Q-table
     */
    private encodeState(state: LearningState): string {
        // Simplified state encoding
        const expertiseLevels = Object.values(state.currentExpertise).map(level => Math.floor(level / 10));
        const gapCount = state.knowledgeGaps.length;
        const efficiencyBucket = Math.floor(state.learningEfficiency * 10);
        
        return `exp:${expertiseLevels.join(',')}_gaps:${gapCount}_eff:${efficiencyBucket}`;
    }
    
    /**
     * Encode action into string key for Q-table
     */
    private encodeAction(action: LearningAction): string {
        const priorityBucket = Math.floor(action.priority * 10);
        return `${action.type}_${action.target}_p:${priorityBucket}`;
    }
    
    /**
     * Get random action for exploration
     */
    private getRandomAction(state: LearningState): LearningAction {
        const possibleActions = this.getPossibleActions(state);
        return possibleActions[Math.floor(Math.random() * possibleActions.length)];
    }
    
    /**
     * Estimate reward for action type and importance
     */
    private estimateReward(actionType: string, importance: number): number {
        const baseRewards = {
            'acquire_knowledge': 0.3,
            'ask_question': 0.2,
            'practice_skill': 0.25,
            'assess_progress': 0.15
        };
        
        return (baseRewards[actionType as keyof typeof baseRewards] || 0.1) * importance;
    }
    
    /**
     * Get recent actions for redundancy checking
     */
    private getRecentActions(): LearningAction[] {
        const recentExperiences = this.experienceBuffer.slice(-10); // Last 10 actions
        return recentExperiences.map(exp => exp.action);
    }
    
    /**
     * Check if learning goal is complete
     */
    private isLearningGoalComplete(state: LearningState): boolean {
        // Simple completion check - all domains above 75%
        return Object.values(state.currentExpertise).every(level => level >= 75);
    }
    
    /**
     * Get learning statistics for monitoring
     */
    getLearningStats(): any {
        const recentRewards = this.experienceBuffer.slice(-20).map(exp => exp.reward);
        const avgReward = recentRewards.length > 0 ? 
            recentRewards.reduce((sum, r) => sum + r, 0) / recentRewards.length : 0;
        
        return {
            totalExperiences: this.experienceBuffer.length,
            qTableSize: this.qTable.size,
            averageReward: avgReward,
            explorationRate: this.explorationRate,
            learningRate: this.learningRate,
            recentActions: this.getRecentActions().slice(-5)
        };
    }
    
    /**
     * Adjust RL parameters based on performance
     */
    adaptLearningParameters(): void {
        const stats = this.getLearningStats();
        
        // Decrease exploration rate over time (but keep minimum)
        this.explorationRate = Math.max(0.05, this.explorationRate * 0.995);
        
        // Adjust learning rate based on recent performance
        if (stats.averageReward > 0.2) {
            this.learningRate = Math.max(0.05, this.learningRate * 0.98); // Decrease if doing well
        } else if (stats.averageReward < 0.1) {
            this.learningRate = Math.min(0.2, this.learningRate * 1.02); // Increase if struggling
        }
        
        console.log(`🔧 RL Parameters adapted: exploration=${this.explorationRate.toFixed(3)}, learning=${this.learningRate.toFixed(3)}`);
    }
} 