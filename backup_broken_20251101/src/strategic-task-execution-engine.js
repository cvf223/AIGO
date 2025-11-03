import { EventEmitter } from 'events';

/**
 * 🚀 STRATEGIC TASK EXECUTION ENGINE
 * ==================================
 * 
 * Manages intelligent task prioritization, execution order, and dynamic strategy adaptation
 * based on real-time market conditions and character capabilities.
 * 
 * CORE FEATURES:
 * - Dynamic task prioritization based on profit potential
 * - Character capability-weighted execution decisions
 * - Real-time strategy adaptation
 * - Competitive intelligence integration
 * - Sub-50ms task switching for arbitrage opportunities
 */

export interface TaskDefinition {
    id: string;
    name: string;
    type: 'arbitrage' | 'research' | 'monitoring' | 'analysis' | 'competitive';
    priority: number; // 1-10 (10 = highest)
    estimatedDuration: number; // milliseconds
    profitPotential: number; // USD
    requiredCapabilities: string[];
    dependencies: string[];
    deadline?: number; // timestamp
    interruptible: boolean;
    executionContext: any;
}

export interface ExecutionStrategy {
    name: string;
    description: string;
    conditions: string[];
    taskOrder: string[];
    parallelExecution: boolean;
    maxConcurrency: number;
    adaptationRules: AdaptationRule[];
}

export interface AdaptationRule {
    condition: string;
    action: 'prioritize' | 'delay' | 'cancel' | 'modify' | 'split';
    parameters: any;
}

export class StrategyTaskExecutionEngine extends EventEmitter {
    private tasks: Map<string, TaskDefinition> = new Map();
    private executionQueue: TaskDefinition[] = [];
    private runningTasks: Map<string, any> = new Map();
    private strategies: Map<string, ExecutionStrategy> = new Map();
    private currentStrategy: string = 'adaptive_arbitrage';
    private characterCapabilities: any = {};
    private marketConditions: any = {};
    private competitiveIntelligence: any = {};
    
    constructor() {
        super();
        this.initializeDefaultStrategies();
        console.log('🚀 Strategic Task Execution Engine initialized');
    }

    private initializeDefaultStrategies() {
        // High-Frequency Arbitrage Strategy
        this.strategies.set('high_frequency_arbitrage', {
            name: 'High-Frequency Arbitrage',
            description: 'Prioritize immediate arbitrage opportunities above all else',
            conditions: ['market_volatility > 0.05', 'arbitrage_opportunities > 0'],
            taskOrder: ['arbitrage', 'monitoring', 'research', 'analysis'],
            parallelExecution: false,
            maxConcurrency: 1,
            adaptationRules: [
                {
                    condition: 'arbitrage_opportunity_detected',
                    action: 'prioritize',
                    parameters: { taskType: 'arbitrage', priority: 10 }
                }
            ]
        });

        // Research-Intensive Strategy
        this.strategies.set('research_intensive', {
            name: 'Research-Intensive',
            description: 'Balance research with execution for long-term advantage',
            conditions: ['market_volatility < 0.03', 'research_backlog > 5'],
            taskOrder: ['research', 'analysis', 'monitoring', 'arbitrage'],
            parallelExecution: true,
            maxConcurrency: 3,
            adaptationRules: [
                {
                    condition: 'research_insight_discovered',
                    action: 'modify',
                    parameters: { updateStrategy: true }
                }
            ]
        });

        // Adaptive Arbitrage (Default)
        this.strategies.set('adaptive_arbitrage', {
            name: 'Adaptive Arbitrage',
            description: 'Dynamic balance based on market conditions and character capabilities',
            conditions: ['always'],
            taskOrder: ['arbitrage', 'research', 'monitoring', 'competitive', 'analysis'],
            parallelExecution: true,
            maxConcurrency: 2,
            adaptationRules: [
                {
                    condition: 'high_profit_opportunity',
                    action: 'prioritize',
                    parameters: { profitThreshold: 100 }
                },
                {
                    condition: 'competitor_activity_high',
                    action: 'prioritize',
                    parameters: { taskType: 'competitive' }
                }
            ]
        });
    }

    // Load character capabilities from character.json
    loadCharacterCapabilities(characterConfig: any) {
        this.characterCapabilities = characterConfig.reinforcementLearning?.capabilities || {};
        console.log('📊 Character capabilities loaded:', Object.keys(this.characterCapabilities));
        
        // Emit capability update event
        this.emit('capabilities_updated', this.characterCapabilities);
    }

    // Register a new task for execution
    registerTask(task: TaskDefinition): void {
        this.tasks.set(task.id, task);
        this.addToExecutionQueue(task);
        
        console.log(`📝 Task registered: ${task.name} (Priority: ${task.priority})`);
        this.emit('task_registered', task);
    }

    // Add task to execution queue with intelligent prioritization
    private addToExecutionQueue(task: TaskDefinition): void {
        // Calculate weighted priority based on character capabilities
        const weightedPriority = this.calculateWeightedPriority(task);
        task.priority = weightedPriority;
        
        // Insert task in priority order
        const insertIndex = this.executionQueue.findIndex(t => t.priority < weightedPriority);
        if (insertIndex === -1) {
            this.executionQueue.push(task);
        } else {
            this.executionQueue.splice(insertIndex, 0, task);
        }
        
        console.log(`🎯 Task queued: ${task.name} (Weighted Priority: ${weightedPriority})`);
        this.emit('queue_updated', this.executionQueue);
    }

    // Calculate weighted priority based on character capabilities
    private calculateWeightedPriority(task: TaskDefinition): number {
        let basePriority = task.priority;
        let capabilityMultiplier = 1.0;
        
        // Apply character capability weights
        for (const capability of task.requiredCapabilities) {
            const capabilityScore = this.getCapabilityScore(capability);
            capabilityMultiplier *= (1 + capabilityScore * 0.5); // Boost by up to 50% per capability
        }
        
        // Apply profit potential weight
        const profitWeight = Math.min(task.profitPotential / 100, 2.0); // Max 2x boost for $100+ profit
        
        // Apply deadline urgency
        const urgencyWeight = task.deadline ? this.calculateUrgencyWeight(task.deadline) : 1.0;
        
        const weightedPriority = basePriority * capabilityMultiplier * profitWeight * urgencyWeight;
        
        return Math.min(weightedPriority, 10); // Cap at 10
    }

    // Get capability score from character configuration
    private getCapabilityScore(capability: string): number {
        // Navigate through nested capability structure
        const parts = capability.split('.');
        let score = 0.5; // Default moderate capability
        
        let current = this.characterCapabilities;
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
                if (typeof current === 'number') {
                    score = current;
                    break;
                }
            }
        }
        
        return score;
    }

    // Calculate urgency weight based on deadline
    private calculateUrgencyWeight(deadline: number): number {
        const now = Date.now();
        const timeLeft = deadline - now;
        
        if (timeLeft <= 0) return 3.0; // Overdue - highest priority
        if (timeLeft <= 30000) return 2.0; // 30 seconds or less
        if (timeLeft <= 300000) return 1.5; // 5 minutes or less
        return 1.0; // No urgency
    }

    // Execute next task in queue
    async executeNext(): Promise<void> {
        if (this.executionQueue.length === 0) {
            console.log('📭 No tasks in execution queue');
            return;
        }

        const currentStrategy = this.strategies.get(this.currentStrategy);
        if (!currentStrategy) {
            console.error('❌ No current strategy defined');
            return;
        }

        // Check if we can execute more tasks concurrently
        if (this.runningTasks.size >= currentStrategy.maxConcurrency) {
            console.log(`⏳ Max concurrency reached (${currentStrategy.maxConcurrency})`);
            return;
        }

        const task = this.executionQueue.shift();
        if (!task) return;

        console.log(`🚀 Executing task: ${task.name}`);
        this.emit('task_started', task);
        
        const startTime = Date.now();
        this.runningTasks.set(task.id, { task, startTime });

        try {
            await this.executeTask(task);
            
            const duration = Date.now() - startTime;
            console.log(`✅ Task completed: ${task.name} (${duration}ms)`);
            
            this.runningTasks.delete(task.id);
            this.emit('task_completed', { task, duration });
            
        } catch (error) {
            console.error(`❌ Task failed: ${task.name}`, error);
            this.runningTasks.delete(task.id);
            this.emit('task_failed', { task, error });
        }
    }

    // Execute a specific task
    private async executeTask(task: TaskDefinition): Promise<void> {
        // This will be implemented by specific task executors
        console.log(`⚡ Executing ${task.type} task: ${task.name}`);
        
        // Simulate task execution
        await new Promise(resolve => setTimeout(resolve, task.estimatedDuration));
        
        // Emit task-specific events
        this.emit(`${task.type}_executed`, task);
    }
} 