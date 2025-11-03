/**
 * BTC-Based Reward System for Enhanced Learning
 * 
 * 💡 WHY: Implements a Bitcoin-based reward structure that incentivizes
 * domain mastery and goal completion with real economic value.
 * 
 * ⚙️ HOW: Uses hierarchical goals (MainGoal -> Subgoal -> Task -> Subtask)
 * with BTC rewards only unlocked after domain mastery is achieved.
 */

import { LearningMetrics, ExpertiseAssessment } from './EnhancedLearningAgent';
import { IAgentRuntime } from '../types';

// Goal Hierarchy Interfaces
export interface MainGoal {
    id: string;
    description: string;
    targetBTC: number; // e.g., 5 BTC
    currentBTC: number;
    deadline: number; // timestamp
    status: 'active' | 'completed' | 'failed';
    requiredDomainMastery: string[]; // domains that must be mastered
    subgoals: Subgoal[];
}

export interface Subgoal {
    id: string;
    teamLeader: string; // which team leader owns this subgoal
    description: string;
    btcReward: number; // 0.5 BTC
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    requiredDomainLevel: number; // minimum expertise level required
    tasks: Task[];
    completionCriteria: string[];
}

export interface Task {
    id: string;
    description: string;
    btcReward: number; // 0.3 BTC
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    estimatedTime: number; // hours
    subtasks: Subtask[];
    dependencies: string[]; // other task IDs that must be completed first
}

export interface Subtask {
    id: string;
    description: string;
    btcReward: number; // 0.2 BTC
    status: 'locked' | 'available' | 'in_progress' | 'completed';
    estimatedTime: number; // hours
    completionCriteria: string[];
}

// Domain Mastery Requirements
export interface DomainMasteryRequirement {
    domain: string;
    minimumLevel: number; // e.g., 80% expertise
    requiredSkills: string[];
    practicalDemonstration: string[];
}

// BTC Reward Components (replacing the old reward system)
export interface BTCRewardComponents {
    mainGoalReward: number;        // 1.0 BTC per main goal
    subgoalReward: number;         // 0.5 BTC per subgoal
    taskReward: number;            // 0.3 BTC per task
    subtaskReward: number;         // 0.2 BTC per subtask
    incrementBonus: number;        // 0.2 BTC for incremental progress
    masteryBonus: number;          // Additional BTC for domain mastery
    efficiencyMultiplier: number;  // Multiplier for fast completion
    qualityMultiplier: number;     // Multiplier for high-quality work
}

export class BTCRewardSystem {
    private runtime: IAgentRuntime;
    private rewardComponents: BTCRewardComponents;
    private mainGoal: MainGoal;
    private domainMasteryRequirements: Map<string, DomainMasteryRequirement>;
    private masteredDomains: Set<string> = new Set();
    private totalBTCEarned: number = 0;
    
    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;
        this.rewardComponents = {
            mainGoalReward: 1.0,
            subgoalReward: 0.5,
            taskReward: 0.3,
            subtaskReward: 0.2,
            incrementBonus: 0.2,
            masteryBonus: 1.0,
            efficiencyMultiplier: 1.5,
            qualityMultiplier: 1.3
        };
        
        // Initialize domain requirements first
        this.domainMasteryRequirements = new Map();
        this.initializeDomainRequirements();
        
        // Initialize main goal (depends on domain requirements)
        this.mainGoal = {
            id: 'bullmarket_btc_collection',
            description: 'Collect 5 BTC before Bull Market ends',
            targetBTC: 5.0,
            currentBTC: 0.0,
            deadline: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
            status: 'active',
            requiredDomainMastery: ['defi', 'trading', 'blockchain', 'infrastructure'],
            subgoals: []
        };
        this.initializeMainGoal();
    }
    
    private initializeDomainRequirements() {
        this.domainMasteryRequirements = new Map([
            ['defi', {
                domain: 'defi',
                minimumLevel: 80,
                requiredSkills: [
                    'yield_optimization',
                    'liquidity_provision',
                    'risk_assessment',
                    'mev_strategies'
                ],
                practicalDemonstration: [
                    'Execute profitable arbitrage',
                    'Design yield strategy',
                    'Assess protocol risks'
                ]
            }],
            ['trading', {
                domain: 'trading',
                minimumLevel: 80,
                requiredSkills: [
                    'algorithmic_trading',
                    'risk_management',
                    'market_analysis',
                    'execution_optimization'
                ],
                practicalDemonstration: [
                    'Build profitable trading algorithm',
                    'Manage portfolio risk',
                    'Execute complex strategies'
                ]
            }],
            ['blockchain', {
                domain: 'blockchain',
                minimumLevel: 80,
                requiredSkills: [
                    'onchain_analysis',
                    'security_assessment',
                    'protocol_evaluation',
                    'data_interpretation'
                ],
                practicalDemonstration: [
                    'Analyze protocol metrics',
                    'Detect security vulnerabilities',
                    'Predict market trends from data'
                ]
            }],
            ['infrastructure', {
                domain: 'infrastructure',
                minimumLevel: 80,
                requiredSkills: [
                    'system_architecture',
                    'performance_optimization',
                    'scalability_design',
                    'monitoring_implementation'
                ],
                practicalDemonstration: [
                    'Design scalable system',
                    'Optimize performance',
                    'Implement monitoring'
                ]
            }]
        ]);
    }
    
    private initializeMainGoal() {
        this.mainGoal = {
            id: 'bullmarket_btc_collection',
            description: 'Collect 5 BTC before Bull Market ends',
            targetBTC: 5.0,
            currentBTC: 0.0,
            deadline: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
            status: 'active',
            requiredDomainMastery: ['defi', 'trading', 'blockchain', 'infrastructure'],
            subgoals: this.createSubgoals()
        };
    }
    
    private createSubgoals(): Subgoal[] {
        return [
            {
                id: 'defi_mastery_subgoal',
                teamLeader: 'defi-specialist',
                description: 'Master DeFi protocols and yield optimization',
                btcReward: 0.5,
                status: 'available',
                requiredDomainLevel: 80,
                tasks: this.createDefiTasks(),
                completionCriteria: [
                    'Achieve 80%+ DeFi expertise',
                    'Complete all DeFi tasks',
                    'Demonstrate practical skills'
                ]
            },
            {
                id: 'trading_mastery_subgoal',
                teamLeader: 'trading-specialist',
                description: 'Master algorithmic trading and market analysis',
                btcReward: 0.5,
                status: 'available',
                requiredDomainLevel: 80,
                tasks: this.createTradingTasks(),
                completionCriteria: [
                    'Achieve 80%+ Trading expertise',
                    'Complete all Trading tasks',
                    'Build profitable algorithms'
                ]
            },
            {
                id: 'blockchain_mastery_subgoal',
                teamLeader: 'blockchain-analyst',
                description: 'Master on-chain analysis and protocol evaluation',
                btcReward: 0.5,
                status: 'available',
                requiredDomainLevel: 80,
                tasks: this.createBlockchainTasks(),
                completionCriteria: [
                    'Achieve 80%+ Blockchain expertise',
                    'Complete all Blockchain tasks',
                    'Analyze complex protocols'
                ]
            },
            {
                id: 'infrastructure_mastery_subgoal',
                teamLeader: 'infrastructure-specialist',
                description: 'Master system architecture and optimization',
                btcReward: 0.5,
                status: 'available',
                requiredDomainLevel: 80,
                tasks: this.createInfrastructureTasks(),
                completionCriteria: [
                    'Achieve 80%+ Infrastructure expertise',
                    'Complete all Infrastructure tasks',
                    'Design scalable systems'
                ]
            }
        ];
    }
    
    private createDefiTasks(): Task[] {
        return [
            {
                id: 'yield_optimization_task',
                description: 'Develop advanced yield optimization strategies',
                btcReward: 0.3,
                status: 'available',
                estimatedTime: 40,
                dependencies: [],
                subtasks: [
                    {
                        id: 'analyze_protocols',
                        description: 'Analyze top 20 DeFi protocols',
                        btcReward: 0.2,
                        status: 'available',
                        estimatedTime: 15,
                        completionCriteria: ['Complete protocol analysis', 'Identify yield opportunities']
                    }
                ]
            },
            {
                id: 'mev_strategies_task',
                description: 'Master MEV detection and execution',
                btcReward: 0.3,
                status: 'locked', // Unlocked after yield_optimization_task
                estimatedTime: 50,
                dependencies: ['yield_optimization_task'],
                subtasks: [
                    {
                        id: 'build_mev_detector',
                        description: 'Build MEV opportunity detection system',
                        btcReward: 0.2,
                        status: 'locked',
                        estimatedTime: 25,
                        completionCriteria: ['Build detection system', 'Test on historical data']
                    }
                ]
            }
        ];
    }
    
    private createTradingTasks(): Task[] {
        return [
            {
                id: 'algorithmic_trading_task',
                description: 'Build profitable trading algorithms',
                btcReward: 0.3,
                status: 'available',
                estimatedTime: 45,
                dependencies: [],
                subtasks: [
                    {
                        id: 'backtest_strategies',
                        description: 'Backtest trading strategies on historical data',
                        btcReward: 0.2,
                        status: 'available',
                        estimatedTime: 20,
                        completionCriteria: ['Complete backtesting', 'Achieve positive returns']
                    }
                ]
            }
        ];
    }
    
    private createBlockchainTasks(): Task[] {
        return [
            {
                id: 'onchain_analysis_task',
                description: 'Master comprehensive on-chain data analysis',
                btcReward: 0.3,
                status: 'available',
                estimatedTime: 35,
                dependencies: [],
                subtasks: [
                    {
                        id: 'whale_tracking',
                        description: 'Implement whale movement tracking system',
                        btcReward: 0.2,
                        status: 'available',
                        estimatedTime: 15,
                        completionCriteria: ['Build tracking system', 'Identify market patterns']
                    }
                ]
            }
        ];
    }
    
    private createInfrastructureTasks(): Task[] {
        return [
            {
                id: 'system_architecture_task',
                description: 'Design high-performance trading infrastructure',
                btcReward: 0.3,
                status: 'available',
                estimatedTime: 30,
                dependencies: [],
                subtasks: [
                    {
                        id: 'optimize_latency',
                        description: 'Optimize system latency for trading',
                        btcReward: 0.2,
                        status: 'available',
                        estimatedTime: 12,
                        completionCriteria: ['Achieve sub-millisecond latency', 'Handle high throughput']
                    }
                ]
            }
        ];
    }
    
    /**
     * Check if agent has mastered a domain (unlocks BTC earning ability)
     */
    async checkDomainMastery(domain: string, assessment: ExpertiseAssessment): Promise<boolean> {
        const requirement = this.domainMasteryRequirements.get(domain);
        if (!requirement) return false;
        
        // Check expertise level
        if (assessment.overallLevel < requirement.minimumLevel) {
            console.log(`❌ Domain ${domain}: ${assessment.overallLevel}% < ${requirement.minimumLevel}% required`);
            return false;
        }
        
        // Check required skills
        const hasAllSkills = requirement.requiredSkills.every(skill => 
            assessment.subdomainLevels[skill] >= requirement.minimumLevel
        );
        
        if (!hasAllSkills) {
            console.log(`❌ Domain ${domain}: Missing required skills`);
            return false;
        }
        
        // Mark as mastered
        this.masteredDomains.add(domain);
        console.log(`🎓 DOMAIN MASTERED: ${domain} - BTC earning unlocked!`);
        
        // Award mastery bonus
        const masteryReward = this.rewardComponents.masteryBonus;
        this.totalBTCEarned += masteryReward;
        
        console.log(`💰 Mastery Bonus: +${masteryReward} BTC (Total: ${this.totalBTCEarned} BTC)`);
        
        return true;
    }
    
    /**
     * Calculate BTC reward for completing a learning action
     * ONLY if domain is mastered!
     */
    calculateBTCReward(
        action: any,
        result: any,
        currentDomain: string,
        completedGoalType?: 'subtask' | 'task' | 'subgoal' | 'maingoal'
    ): number {
        // NO BTC REWARDS UNTIL DOMAIN IS MASTERED!
        if (!this.masteredDomains.has(currentDomain)) {
            console.log(`🔒 BTC rewards locked - ${currentDomain} not mastered yet`);
            return 0;
        }
        
        let btcReward = 0;
        
        // Base rewards for goal completion
        if (completedGoalType) {
            switch (completedGoalType) {
                case 'subtask':
                    btcReward += this.rewardComponents.subtaskReward;
                    console.log(`✅ Subtask completed: +${this.rewardComponents.subtaskReward} BTC`);
                    break;
                case 'task':
                    btcReward += this.rewardComponents.taskReward;
                    console.log(`✅ Task completed: +${this.rewardComponents.taskReward} BTC`);
                    break;
                case 'subgoal':
                    btcReward += this.rewardComponents.subgoalReward;
                    console.log(`🎯 Subgoal completed: +${this.rewardComponents.subgoalReward} BTC`);
                    break;
                case 'maingoal':
                    btcReward += this.rewardComponents.mainGoalReward;
                    console.log(`🏆 MAIN GOAL COMPLETED: +${this.rewardComponents.mainGoalReward} BTC`);
                    break;
            }
        }
        
        // Incremental progress bonus
        if (result.knowledgeGained && result.knowledgeGained > 0.05) {
            const incrementBonus = this.rewardComponents.incrementBonus * result.knowledgeGained;
            btcReward += incrementBonus;
            console.log(`📈 Increment bonus: +${incrementBonus.toFixed(4)} BTC`);
        }
        
        // Efficiency multiplier (for fast completion)
        if (action.estimatedCost && action.estimatedCost < 5) { // Fast actions
            btcReward *= this.rewardComponents.efficiencyMultiplier;
            console.log(`⚡ Efficiency multiplier: x${this.rewardComponents.efficiencyMultiplier}`);
        }
        
        // Quality multiplier (for high-quality results)
        if (result.questionQuality && result.questionQuality > 0.8) {
            btcReward *= this.rewardComponents.qualityMultiplier;
            console.log(`💎 Quality multiplier: x${this.rewardComponents.qualityMultiplier}`);
        }
        
        // Update total
        this.totalBTCEarned += btcReward;
        
        if (btcReward > 0) {
            console.log(`💰 BTC Earned: +${btcReward.toFixed(4)} BTC (Total: ${this.totalBTCEarned.toFixed(4)} BTC)`);
            console.log(`🎯 Progress to Main Goal: ${(this.totalBTCEarned / this.mainGoal.targetBTC * 100).toFixed(1)}%`);
        }
        
        return btcReward;
    }
    
    /**
     * Get current BTC earning status
     */
    getBTCStatus(): any {
        return {
            totalEarned: this.totalBTCEarned,
            targetBTC: this.mainGoal.targetBTC,
            progressPercentage: (this.totalBTCEarned / this.mainGoal.targetBTC) * 100,
            masteredDomains: Array.from(this.masteredDomains),
            availableSubgoals: this.mainGoal.subgoals.filter(sg => sg.status === 'available'),
            completedSubgoals: this.mainGoal.subgoals.filter(sg => sg.status === 'completed'),
            timeRemaining: this.mainGoal.deadline - Date.now(),
            bullMarketStatus: this.mainGoal.deadline > Date.now() ? 'active' : 'ended'
        };
    }
    
    /**
     * Check if main goal is achievable
     */
    isMainGoalAchievable(): boolean {
        const status = this.getBTCStatus();
        return status.bullMarketStatus === 'active' && 
               status.masteredDomains.length >= this.mainGoal.requiredDomainMastery.length;
    }
    
    /**
     * Get next recommended action for BTC earning
     */
    getNextBTCAction(currentDomain: string): string {
        if (!this.masteredDomains.has(currentDomain)) {
            return `Focus on mastering ${currentDomain} domain to unlock BTC rewards`;
        }
        
        const subgoal = this.mainGoal.subgoals.find(sg => 
            sg.teamLeader.includes(currentDomain) && sg.status === 'available'
        );
        
        if (subgoal) {
            const availableTask = subgoal.tasks.find(t => t.status === 'available');
            if (availableTask) {
                const availableSubtask = availableTask.subtasks.find(st => st.status === 'available');
                if (availableSubtask) {
                    return `Complete subtask: ${availableSubtask.description} (${availableSubtask.btcReward} BTC)`;
                }
                return `Complete task: ${availableTask.description} (${availableTask.btcReward} BTC)`;
            }
            return `Work on subgoal: ${subgoal.description} (${subgoal.btcReward} BTC)`;
        }
        
        return 'All available BTC opportunities completed in this domain';
    }
} 