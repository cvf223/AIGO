/**
 * 🧠 AUTONOMOUS BACKGROUND TASK SELECTION SYSTEM
 * ===============================================
 * 
 * REVOLUTIONARY MDP-DRIVEN BACKGROUND TASK SELECTION!
 * 
 * Agents autonomously choose their background tasks using:
 * ✅ Reward/Penalty Engine calculations
 * ✅ Decision Awareness System pre-decision analysis  
 * ✅ Agent-specific genetic traits and personality
 * ✅ Quantum-enhanced MDP integration
 * ✅ Competitive intelligence evolution
 * ✅ Real-time learning adaptation
 * 
 * NO MORE HARDCODED TASKS! Agents make their own intelligent choices!
 */

import { EventEmitter } from 'events';

export class AutonomousBackgroundTaskSelector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            baseSelectionInterval: config.baseSelectionInterval || 3 * 60 * 1000, // 3 minutes
            minTaskInterval: config.minTaskInterval || 15 * 60 * 1000, // 15 minutes
            maxDecisionHistory: config.maxDecisionHistory || 100,
            ...config
        };
        
        // Learning systems integration
        this.rewardPenaltyEngine = null;
        this.decisionAwarenessSystem = null;
        this.quantumMDPIntegration = null;
        this.adaptiveLearningEngine = null;
        
        // Agent management
        this.agentSelectors = new Map(); // agentId -> selector state
        this.taskRegistry = new Map(); // taskType -> task metadata
        
        console.log('🧠 Autonomous Background Task Selector initialized');
    }
    
    /**
     * 🚀 INITIALIZE LEARNING SYSTEMS INTEGRATION WITH NEW QUANTUM SYSTEMS
     */
    async initializeLearningIntegration(systems = {}) {
        try {
            // Initialize RewardPenaltyEngine
            if (systems.rewardPenaltyEngine) {
                this.rewardPenaltyEngine = systems.rewardPenaltyEngine;
            } else {
                const { RewardPenaltyEngine } = await import('./learning/RewardPenaltyEngine.js');
                this.rewardPenaltyEngine = new RewardPenaltyEngine(this.config);
            }
            
            // 🆕 INITIALIZE NEW QUANTUM SYSTEMS FOR ELITE TASK SELECTION
            await this.initializeNewQuantumSystemsIntegration(systems);
            
            // Initialize DecisionAwareness
            if (systems.decisionAwarenessSystem) {
                this.decisionAwarenessSystem = systems.decisionAwarenessSystem;
            } else {
                const { DecisionAwareness } = await import('./learning/DecisionAwareness.js');
                this.decisionAwarenessSystem = new DecisionAwareness({
                    interfaces: { rewardEngine: this.rewardPenaltyEngine }
                });
            }
            
            // Initialize QuantumMDP if available
            if (systems.quantumMDPIntegration) {
                this.quantumMDPIntegration = systems.quantumMDPIntegration;
            } else {
                try {
                    const { QuantumEnhancedMDPIntegration } = await import('./learning/quantum-enhanced-mdp-integration.js');
                    this.quantumMDPIntegration = new QuantumEnhancedMDPIntegration();
                    await this.quantumMDPIntegration.initialize();
                } catch (error) {
                    console.warn('⚠️ QuantumMDP not available, using fallback MDP logic');
                }
            }
            
            // Initialize AdaptiveLearningEngine
            if (systems.adaptiveLearningEngine) {
                this.adaptiveLearningEngine = systems.adaptiveLearningEngine;
            } else {
                try {
                    const { AdaptiveLearningEngine } = await import('./learning/adaptive-learning-engine.js');
                    this.adaptiveLearningEngine = new AdaptiveLearningEngine();
                } catch (error) {
                    console.warn('⚠️ AdaptiveLearningEngine not available');
                }
            }
            
            console.log('✅ Learning systems integration completed');
            
        } catch (error) {
            console.error('❌ Failed to initialize learning integration:', error);
            throw error;
        }
    }
    
    /**
     * 🎯 REGISTER AGENT FOR AUTONOMOUS TASK SELECTION
     */
    async registerAgent(agent) {
        const agentId = agent.id;
        console.log(`🎯 Registering agent ${agentId} for autonomous background task selection`);
        
        try {
            // Initialize agent's decision systems
            await this.initializeAgentDecisionSystems(agent);
            
            // Create selector state for this agent
            const selectorState = {
                agentId,
                agent,
                isActive: false,
                selectionLoop: null,
                decisionHistory: [],
                taskHistory: new Map(),
                lastDecisionTime: 0,
                personalityProfile: this.extractPersonalityProfile(agent),
                selectionInterval: this.calculateAgentSelectionInterval(agent)
            };
            
            this.agentSelectors.set(agentId, selectorState);
            
            // Start autonomous selection loop
            await this.startAgentSelectionLoop(selectorState);
            
            console.log(`✅ Agent ${agentId} registered for autonomous task selection`);
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to register agent ${agentId}:`, error);
            return false;
        }
    }
    
    /**
     * 🔧 INITIALIZE AGENT DECISION SYSTEMS
     */
    async initializeAgentDecisionSystems(agent) {
        // Initialize agent-specific reward engine
        if (!agent.rewardEngine) {
            agent.rewardEngine = this.rewardPenaltyEngine;
        }
        
        // Initialize agent-specific decision awareness
        if (!agent.decisionAwareness) {
            agent.decisionAwareness = this.decisionAwarenessSystem;
        }
        
        // Connect to quantum MDP if available
        if (!agent.quantumMDP && this.quantumMDPIntegration) {
            agent.quantumMDP = this.quantumMDPIntegration;
        }
        
        // Initialize decision history
        if (!agent.decisionHistory) {
            agent.decisionHistory = [];
        }
        
        // Initialize task performance tracking
        if (!agent.taskPerformance) {
            agent.taskPerformance = new Map();
        }
    }
    
    /**
     * 🧬 EXTRACT PERSONALITY PROFILE FROM AGENT
     */
    extractPersonalityProfile(agent) {
        const characterConfig = agent.characterConfig || {};
        
        return {
            riskProfile: characterConfig.decisionMaking?.riskProfile || 'CALCULATED_AGGRESSIVE',
            timeHorizon: characterConfig.decisionMaking?.timeHorizon || 'IMMEDIATE_EXECUTION',
            strategicWeights: characterConfig.strategicWeights || {},
            learningStyle: characterConfig.decisionMaking?.learningStyle || 'TECHNICAL_OPTIMIZATION',
            competitionApproach: characterConfig.decisionMaking?.competitionApproach || 'DIRECT_DOMINANCE',
            name: characterConfig.profile?.name || agent.id
        };
    }
    
    /**
     * ⏱️ CALCULATE AGENT-SPECIFIC SELECTION INTERVAL
     */
    calculateAgentSelectionInterval(agent) {
        let interval = this.config.baseSelectionInterval;
        
        const profile = this.extractPersonalityProfile(agent);
        
        // Speed-oriented agents (like baseSpeedDemon) check more frequently
        if (profile.name.includes('SpeedDemon') || profile.timeHorizon === 'IMMEDIATE_EXECUTION') {
            interval *= 0.5; // Check every 1.5 minutes
        }
        // Analytical agents check less frequently but more thoroughly
        else if (profile.name.includes('Analyst') || profile.learningStyle === 'PATTERN_CORRELATION_ANALYSIS') {
            interval *= 1.5; // Check every 4.5 minutes
        }
        // Conservative agents are more deliberate
        else if (profile.riskProfile === 'CONSERVATIVE') {
            interval *= 1.3; // Check every ~4 minutes
        }
        
        return interval;
    }
    
    /**
     * 🔄 START AGENT SELECTION LOOP
     */
    async startAgentSelectionLoop(selectorState) {
        if (selectorState.isActive) return;
        
        selectorState.isActive = true;
        
        const selectionLoop = setInterval(async () => {
            try {
                await this.performAutonomousTaskSelection(selectorState);
            } catch (error) {
                console.error(`❌ Task selection failed for agent ${selectorState.agentId}:`, error);
            }
        }, selectorState.selectionInterval);
        
        selectorState.selectionLoop = selectionLoop;
        
        console.log(`🔄 Started autonomous selection loop for ${selectorState.agentId} (${selectorState.selectionInterval/1000}s interval)`);
    }
    
    /**
     * 🎯 PERFORM AUTONOMOUS TASK SELECTION
     */
    async performAutonomousTaskSelection(selectorState) {
        const { agentId, agent } = selectorState;
        
        console.log(`🎯 Agent ${agentId} performing autonomous task selection...`);
        
        try {
            // 1. Get available background tasks
            const availableTasks = await this.getAvailableBackgroundTasks();
            
            if (availableTasks.length === 0) {
                console.log(`📭 No background tasks available for agent ${agentId}`);
                return;
            }
            
            // 2. Build decision context
            const decisionContext = await this.buildDecisionContext(selectorState);
            
            // 3. Evaluate tasks using MDP logic
            const mdpEvaluations = await this.evaluateTasksWithMDP(selectorState, availableTasks, decisionContext);
            
            // 4. Apply agent personality and genetic traits
            const personalizedEvaluations = this.applyPersonalityToEvaluations(selectorState, mdpEvaluations);
            
            // 5. Calculate reward projections
            const rewardProjections = await this.calculateRewardProjections(selectorState, personalizedEvaluations);
            
            // 6. Apply decision awareness
            const awareDecisions = await this.applyDecisionAwareness(selectorState, rewardProjections);
            
            // 7. Make final autonomous decision
            const selectedTask = this.makeTaskDecision(selectorState, awareDecisions);
            
            // 8. Execute selected task or record no-action decision
            if (selectedTask) {
                await this.executeSelectedTask(selectorState, selectedTask);
            } else {
                this.recordNoActionDecision(selectorState, awareDecisions);
            }
            
            // Update decision time
            selectorState.lastDecisionTime = Date.now();
            
        } catch (error) {
            console.error(`❌ Autonomous task selection failed for agent ${agentId}:`, error);
        }
    }
    
    /**
     * 📋 GET AVAILABLE BACKGROUND TASKS
     */
    async getAvailableBackgroundTasks() {
        const taskTypes = [
            {
                type: 'learn_from_others',
                module: './src/tasks/LearnFromOthersBackgroundTask.js',
                class: 'LearnFromOthersBackgroundTask',
                category: 'learning-intelligence',
                defaultPriority: 'high',
                estimatedDuration: '10-20 minutes',
                riskLevel: 'low'
            },
            {
                type: 'mev_competitor_analysis',
                module: './src/tasks/MEVCompetitorAnalysisBackgroundTask.js',
                class: 'MEVCompetitorAnalysisBackgroundTask',
                category: 'competition-analysis',
                defaultPriority: 'high',
                estimatedDuration: '15-25 minutes',
                riskLevel: 'medium'
            },
            {
                type: 'enhanced_mev_competitor_intelligence',
                module: './src/tasks/EnhancedMEVCompetitorIntelligenceTask.js',
                class: 'EnhancedMEVCompetitorIntelligenceTask',
                category: 'competition-analysis',
                defaultPriority: 'critical',
                estimatedDuration: '20-30 minutes',
                riskLevel: 'high'
            },
            {
                type: 'newsletter_analysis',
                module: './src/tasks/NewsletterAnalysisBackgroundTask.js',
                class: 'NewsletterAnalysisBackgroundTask',
                category: 'market-intelligence',
                defaultPriority: 'medium',
                estimatedDuration: '5-15 minutes',
                riskLevel: 'low'
            },
            {
                type: 'enhanced_priority_fee_analysis',
                module: './src/tasks/EnhancedPriorityFeeAnalysis.js',
                class: 'EnhancedPriorityFeeAnalysis',
                category: 'performance-optimization',
                defaultPriority: 'high',
                estimatedDuration: '10-20 minutes',
                riskLevel: 'low'
            },
            {
                type: 'enhanced_twitter_crypto_analysis',
                module: './src/tasks/EnhancedTwitterCryptoAnalysisTask.js',
                class: 'EnhancedTwitterCryptoAnalysisTask',
                category: 'market-intelligence',
                defaultPriority: 'medium',
                estimatedDuration: '15-25 minutes',
                riskLevel: 'medium'
            }
        ];
        
        // Get detailed metadata for each task
        const tasksWithMetadata = [];
        
        for (const taskType of taskTypes) {
            try {
                // Try to load task class and get its metadata
                const { [taskType.class]: TaskClass } = await import(taskType.module);
                
                let metadata;
                try {
                    const tempTask = new TaskClass(null, {});
                    metadata = tempTask.getTaskMetadata?.() || this.createDefaultMetadata(taskType);
                } catch (err) {
                    metadata = this.createDefaultMetadata(taskType);
                }
                
                tasksWithMetadata.push({
                    ...taskType,
                    metadata: {
                        ...metadata,
                        category: taskType.category,
                        riskLevel: taskType.riskLevel
                    }
                });
                
            } catch (error) {
                console.warn(`⚠️ Could not load task ${taskType.type}:`, error.message);
            }
        }
        
        return tasksWithMetadata;
    }
    
    /**
     * 🏗️ BUILD DECISION CONTEXT
     */
    async buildDecisionContext(selectorState) {
        const { agent } = selectorState;
        
        return {
            agentId: agent.id,
            timestamp: Date.now(),
            personalityProfile: selectorState.personalityProfile,
            recentPerformance: this.getRecentPerformance(selectorState),
            taskHistory: this.getTaskHistory(selectorState),
            memoryState: await this.getAgentMemoryState(agent),
            learningGoals: await this.getAgentLearningGoals(agent),
            competitivePosition: await this.getCompetitivePosition(agent),
            marketConditions: await this.getCurrentMarketConditions(),
            resourceAvailability: this.getResourceAvailability(agent)
        };
    }
    
    /**
     * 🧮 EVALUATE TASKS WITH MDP LOGIC
     */
    async evaluateTasksWithMDP(selectorState, tasks, context) {
        const evaluations = [];
        
        for (const task of tasks) {
            try {
                let mdpScore = 0.5; // Default neutral
                
                // Use quantum MDP if available
                if (selectorState.agent.quantumMDP) {
                    mdpScore = await this.calculateQuantumMDPScore(selectorState, task, context);
                } else {
                    // Fallback to heuristic MDP
                    mdpScore = this.calculateHeuristicMDPScore(task, context, selectorState);
                }
                
                evaluations.push({
                    ...task,
                    mdpScore,
                    evaluationReason: this.getMDPEvaluationReason(mdpScore, task, context)
                });
                
            } catch (error) {
                console.warn(`⚠️ MDP evaluation failed for ${task.type}:`, error.message);
                evaluations.push({
                    ...task,
                    mdpScore: 0.2, // Low score for evaluation failure
                    evaluationReason: `Failed MDP evaluation: ${error.message}`
                });
            }
        }
        
        return evaluations;
    }
    
    /**
     * 🧬 APPLY PERSONALITY TO EVALUATIONS
     */
    applyPersonalityToEvaluations(selectorState, evaluations) {
        const personality = selectorState.personalityProfile;
        
        return evaluations.map(task => {
            let personalityMultiplier = 1.0;
            let personalityReasons = [];
            
            // Apply strategic weights based on task category
            const weights = personality.strategicWeights;
            
            switch (task.category) {
                case 'learning-intelligence':
                    personalityMultiplier *= (weights.intelligence || 1.0);
                    if (weights.intelligence > 1.0) personalityReasons.push('High intelligence weight');
                    break;
                    
                case 'competition-analysis':
                    personalityMultiplier *= (weights.competitive_advantage || 1.0) * (weights.competition_beating || 1.0);
                    if (weights.competitive_advantage > 1.0) personalityReasons.push('Competitive advantage focus');
                    break;
                    
                case 'performance-optimization':
                    personalityMultiplier *= (weights.execution_speed || 1.0) * (weights.gas_optimization || 1.0);
                    if (weights.execution_speed > 1.0) personalityReasons.push('Speed optimization priority');
                    break;
                    
                case 'market-intelligence':
                    personalityMultiplier *= (weights.pattern_recognition || 1.0) * (weights.opportunity_size || 1.0);
                    if (weights.pattern_recognition > 1.0) personalityReasons.push('Pattern recognition focus');
                    break;
            }
            
            // Apply risk tolerance
            const riskLevel = task.riskLevel || task.metadata.riskLevel || 'medium';
            
            if (personality.riskProfile === 'CONSERVATIVE') {
                if (riskLevel === 'high') {
                    personalityMultiplier *= 0.3;
                    personalityReasons.push('Conservative profile avoids high risk');
                } else if (riskLevel === 'low') {
                    personalityMultiplier *= 1.2;
                    personalityReasons.push('Conservative profile prefers low risk');
                }
            } else if (personality.riskProfile === 'HIGH_REWARD_AGGRESSIVE') {
                if (riskLevel === 'high') {
                    personalityMultiplier *= 1.8;
                    personalityReasons.push('Aggressive profile seeks high risk/reward');
                } else if (riskLevel === 'low') {
                    personalityMultiplier *= 0.7;
                    personalityReasons.push('Aggressive profile finds low risk boring');
                }
            }
            
            // Apply time horizon preferences
            if (personality.timeHorizon === 'IMMEDIATE_EXECUTION') {
                if (task.estimatedDuration?.includes('30') || task.estimatedDuration?.includes('long')) {
                    personalityMultiplier *= 0.4;
                    personalityReasons.push('Immediate execution preference avoids long tasks');
                }
            }
            
            // Apply learning style
            if (personality.learningStyle === 'TECHNICAL_OPTIMIZATION' && task.category === 'performance-optimization') {
                personalityMultiplier *= 1.3;
                personalityReasons.push('Technical optimization learning style match');
            }
            
            return {
                ...task,
                personalityScore: task.mdpScore * personalityMultiplier,
                personalityMultiplier,
                personalityReasons
            };
        });
    }
    
    /**
     * 💰 CALCULATE REWARD PROJECTIONS
     */
    async calculateRewardProjections(selectorState, evaluations) {
        const projectionsWithRewards = [];
        
        for (const task of evaluations) {
            try {
                let rewardProjection = task.personalityScore;
                let rewardBreakdown = { base: task.personalityScore };
                
                // Use RewardPenaltyEngine if available
                if (this.rewardPenaltyEngine) {
                    const rewardCalc = await this.rewardPenaltyEngine.calculateTaskRewardProjection(
                        selectorState.agentId,
                        task.metadata,
                        { taskType: task.type, category: task.category }
                    );
                    
                    rewardProjection = rewardCalc.expectedReward || rewardProjection;
                    rewardBreakdown = rewardCalc.breakdown || rewardBreakdown;
                }
                
                // Apply historical performance bonus/penalty
                const historicalPerformance = this.getTaskHistoricalPerformance(selectorState, task.type);
                if (historicalPerformance.avgSuccess > 0.8) {
                    rewardProjection *= 1.2; // Bonus for consistently successful tasks
                    rewardBreakdown.historicalBonus = 0.2;
                } else if (historicalPerformance.avgSuccess < 0.4) {
                    rewardProjection *= 0.7; // Penalty for consistently failing tasks
                    rewardBreakdown.historicalPenalty = -0.3;
                }
                
                projectionsWithRewards.push({
                    ...task,
                    rewardProjection,
                    rewardBreakdown,
                    historicalPerformance
                });
                
            } catch (error) {
                console.warn(`⚠️ Reward projection failed for ${task.type}:`, error.message);
                projectionsWithRewards.push({
                    ...task,
                    rewardProjection: task.personalityScore * 0.5, // Penalty for calculation failure
                    rewardBreakdown: { error: error.message }
                });
            }
        }
        
        return projectionsWithRewards;
    }
    
    /**
     * 🧠 APPLY DECISION AWARENESS
     */
    async applyDecisionAwareness(selectorState, rewardProjections) {
        const awareDecisions = [];
        
        for (const task of rewardProjections) {
            try {
                // Build comprehensive awareness for this task choice
                let awareness = { recommendation: 'PROCEED', confidence: 0.7 };
                
                if (this.decisionAwarenessSystem) {
                    awareness = await this.decisionAwarenessSystem.buildDecisionAwareness(
                        selectorState.agentId,
                        { taskSelection: task },
                        { decisionType: 'background_task_selection' }
                    );
                }
                
                // Calculate final decision score
                const awarenessMultiplier = awareness.recommendation === 'PROCEED' ? 
                    (awareness.confidence || 0.7) : 
                    (awareness.confidence || 0.3) * 0.5;
                
                awareDecisions.push({
                    ...task,
                    awareness,
                    finalScore: task.rewardProjection * awarenessMultiplier,
                    decisionConfidence: awareness.confidence || 0.7
                });
                
            } catch (error) {
                console.warn(`⚠️ Decision awareness failed for ${task.type}:`, error.message);
                awareDecisions.push({
                    ...task,
                    finalScore: task.rewardProjection * 0.8, // Small penalty for awareness failure
                    decisionConfidence: 0.5
                });
            }
        }
        
        return awareDecisions;
    }
    
    /**
     * 🎯 MAKE TASK DECISION
     */
    makeTaskDecision(selectorState, awareDecisions) {
        // Sort by final score
        const sortedTasks = awareDecisions.sort((a, b) => b.finalScore - a.finalScore);
        
        const bestTask = sortedTasks[0];
        if (!bestTask) return null;
        
        // Dynamic threshold based on agent personality
        let threshold = 0.4; // Base threshold
        
        const personality = selectorState.personalityProfile;
        
        if (personality.riskProfile === 'CONSERVATIVE') {
            threshold = 0.6; // Higher threshold for conservative agents
        } else if (personality.riskProfile === 'HIGH_REWARD_AGGRESSIVE') {
            threshold = 0.25; // Lower threshold for aggressive agents
        }
        
        // Check if task meets threshold
        if (bestTask.finalScore < threshold) {
            console.log(`🚫 Agent ${selectorState.agentId} rejected best task ${bestTask.type} (score: ${bestTask.finalScore.toFixed(3)} < threshold: ${threshold})`);
            return null;
        }
        
        // Check time since last run of this task type
        const timeSinceLastRun = this.getTimeSinceLastTaskRun(selectorState, bestTask.type);
        const minimumInterval = this.getMinimumTaskInterval(bestTask.type);
        
        if (timeSinceLastRun < minimumInterval) {
            console.log(`⏱️ Agent ${selectorState.agentId} skipping ${bestTask.type} - too recent (${timeSinceLastRun/1000}s ago, min: ${minimumInterval/1000}s)`);
            return null;
        }
        
        console.log(`🎯 Agent ${selectorState.agentId} selected task: ${bestTask.type} (score: ${bestTask.finalScore.toFixed(3)})`);
        return bestTask;
    }
    
    /**
     * ⚡ EXECUTE SELECTED TASK
     */
    async executeSelectedTask(selectorState, selectedTask) {
        const { agentId, agent } = selectorState;
        
        try {
            console.log(`⚡ Agent ${agentId} executing: ${selectedTask.type}`);
            
            const executionStart = Date.now();
            
            // Import and instantiate task
            const { [selectedTask.class]: TaskClass } = await import(selectedTask.module);
            const taskInstance = new TaskClass(agent, selectedTask.metadata);
            
            // Execute the task
            const results = await taskInstance.start();
            
            const executionTime = Date.now() - executionStart;
            
            // Calculate actual performance
            const actualPerformance = this.calculateActualPerformance(results);
            
            // Record task execution
            this.recordTaskExecution(selectorState, selectedTask, results, executionTime, actualPerformance);
            
            // Update learning systems
            await this.updateLearningFromTaskExecution(selectorState, selectedTask, results, actualPerformance);
            
            console.log(`✅ Agent ${agentId} completed ${selectedTask.type} in ${executionTime/1000}s (performance: ${actualPerformance.toFixed(3)})`);
            
            this.emit('taskCompleted', {
                agentId,
                taskType: selectedTask.type,
                results,
                executionTime,
                actualPerformance
            });
            
        } catch (error) {
            console.error(`❌ Task execution failed for agent ${agentId}:`, error);
            
            // Record failure
            this.recordTaskFailure(selectorState, selectedTask, error);
            
            this.emit('taskFailed', {
                agentId,
                taskType: selectedTask.type,
                error: error.message
            });
        }
    }
    
    /**
     * 🚫 RECORD NO-ACTION DECISION
     */
    recordNoActionDecision(selectorState, awareDecisions) {
        const decision = {
            timestamp: Date.now(),
            agentId: selectorState.agentId,
            decision: 'NO_ACTION',
            availableTasks: awareDecisions.length,
            bestTaskScore: awareDecisions[0]?.finalScore || 0,
            reason: 'No tasks met selection criteria'
        };
        
        selectorState.decisionHistory.push(decision);
        this.trimDecisionHistory(selectorState);
        
        console.log(`🤔 Agent ${selectorState.agentId} chose no action (best score: ${decision.bestTaskScore.toFixed(3)})`);
    }
    
    // === HELPER METHODS ===
    
    createDefaultMetadata(taskType) {
        return {
            id: taskType.type,
            name: taskType.type.replace(/_/g, ' ').toUpperCase(),
            type: taskType.type,
            priority: taskType.defaultPriority || 'medium',
            estimatedDuration: taskType.estimatedDuration || '10-15 minutes',
            valueScore: 0.5,
            riskLevel: taskType.riskLevel || 'medium'
        };
    }
    
    calculateHeuristicMDPScore(task, context, selectorState) {
        let score = 0.5; // Base score
        
        // Priority influence
        const priorityScores = { critical: 0.4, high: 0.3, medium: 0.2, low: 0.1 };
        score += priorityScores[task.metadata.priority] || 0.2;
        
        // Value score influence
        score += (task.metadata.valueScore || 0.5) * 0.2;
        
        // Historical success rate influence
        const historical = this.getTaskHistoricalPerformance(selectorState, task.type);
        score += (historical.avgSuccess - 0.5) * 0.3;
        
        // Time-based factors
        const timeSinceLastRun = this.getTimeSinceLastTaskRun(selectorState, task.type);
        if (timeSinceLastRun < 30 * 60 * 1000) { // Less than 30 minutes
            score -= 0.4; // Significant penalty for recent execution
        }
        
        return Math.max(0.1, Math.min(1.0, score));
    }
    
    async calculateQuantumMDPScore(selectorState, task, context) {
        try {
            if (selectorState.agent.quantumMDP) {
                return await selectorState.agent.quantumMDP.evaluateTaskValue(task.metadata, context);
            }
        } catch (error) {
            console.warn(`⚠️ Quantum MDP evaluation failed:`, error.message);
        }
        
        // Fallback to heuristic
        return this.calculateHeuristicMDPScore(task, context, selectorState);
    }
    
    getMDPEvaluationReason(score, task, context) {
        if (score > 0.8) return 'High value opportunity detected';
        if (score > 0.6) return 'Good opportunity with reasonable risk';
        if (score > 0.4) return 'Moderate opportunity worth considering';
        if (score > 0.2) return 'Low value opportunity, questionable benefit';
        return 'Poor opportunity, likely not worthwhile';
    }
    
    getTaskHistoricalPerformance(selectorState, taskType) {
        const history = selectorState.taskHistory.get(taskType) || {
            executions: 0,
            successes: 0,
            avgPerformance: 0.5,
            lastExecution: 0
        };
        
        return {
            executions: history.executions,
            avgSuccess: history.executions > 0 ? history.successes / history.executions : 0.5,
            avgPerformance: history.avgPerformance,
            lastExecution: history.lastExecution
        };
    }
    
    getTimeSinceLastTaskRun(selectorState, taskType) {
        const history = selectorState.taskHistory.get(taskType);
        if (!history || !history.lastExecution) return Infinity;
        
        return Date.now() - history.lastExecution;
    }
    
    getMinimumTaskInterval(taskType) {
        const intervals = {
            'learn_from_others': 20 * 60 * 1000, // 20 minutes
            'mev_competitor_analysis': 15 * 60 * 1000, // 15 minutes
            'enhanced_mev_competitor_intelligence': 30 * 60 * 1000, // 30 minutes
            'newsletter_analysis': 60 * 60 * 1000, // 1 hour
            'enhanced_priority_fee_analysis': 25 * 60 * 1000, // 25 minutes
            'enhanced_twitter_crypto_analysis': 30 * 60 * 1000 // 30 minutes
        };
        
        return intervals[taskType] || 15 * 60 * 1000; // Default 15 minutes
    }
    
    calculateActualPerformance(results) {
        if (!results) return 0.1;
        
        let performance = 0.5; // Base
        
        if (results.success) performance += 0.2;
        if (results.insights?.length > 0) performance += Math.min(0.3, results.insights.length * 0.1);
        if (results.value) performance += results.value * 0.2;
        if (results.learningMetrics) performance += 0.1;
        
        return Math.max(0.1, Math.min(1.0, performance));
    }
    
    recordTaskExecution(selectorState, task, results, executionTime, actualPerformance) {
        // Update task history
        const taskType = task.type;
        if (!selectorState.taskHistory.has(taskType)) {
            selectorState.taskHistory.set(taskType, {
                executions: 0,
                successes: 0,
                totalPerformance: 0,
                avgPerformance: 0.5,
                lastExecution: 0
            });
        }
        
        const history = selectorState.taskHistory.get(taskType);
        history.executions++;
        history.lastExecution = Date.now();
        history.totalPerformance += actualPerformance;
        history.avgPerformance = history.totalPerformance / history.executions;
        
        if (results.success !== false) {
            history.successes++;
        }
        
        // Record decision outcome
        const decision = {
            timestamp: Date.now(),
            agentId: selectorState.agentId,
            decision: 'EXECUTE_TASK',
            taskType,
            projectedScore: task.finalScore,
            actualPerformance,
            performanceDelta: actualPerformance - task.rewardProjection,
            executionTime,
            success: results.success !== false
        };
        
        selectorState.decisionHistory.push(decision);
        this.trimDecisionHistory(selectorState);
    }
    
    recordTaskFailure(selectorState, task, error) {
        const decision = {
            timestamp: Date.now(),
            agentId: selectorState.agentId,
            decision: 'TASK_FAILED',
            taskType: task.type,
            projectedScore: task.finalScore,
            actualPerformance: 0.1,
            performanceDelta: 0.1 - task.rewardProjection,
            error: error.message,
            success: false
        };
        
        selectorState.decisionHistory.push(decision);
        this.trimDecisionHistory(selectorState);
    }
    
    async updateLearningFromTaskExecution(selectorState, task, results, actualPerformance) {
        try {
            // Update agent's learning systems
            if (this.adaptiveLearningEngine && results.learningMetrics) {
                await this.adaptiveLearningEngine.updateAgentMetrics(selectorState.agentId, results.learningMetrics);
            }
            
            // Update reward/penalty engine
            if (selectorState.agent.rewardEngine) {
                await selectorState.agent.rewardEngine.recordTaskOutcome(selectorState.agentId, {
                    taskType: task.type,
                    success: results.success !== false,
                    value: actualPerformance,
                    insights: results.insights?.length || 0
                });
            }
            
            // Update quantum MDP if available
            if (selectorState.agent.quantumMDP) {
                const decisionOutcome = {
                    state: task.evaluationContext,
                    action: task.type,
                    reward: actualPerformance,
                    nextState: 'task_completed'
                };
                
                await selectorState.agent.quantumMDP.updateFromDecisionOutcome(decisionOutcome);
            }
            
        } catch (error) {
            console.error(`❌ Failed to update learning systems:`, error);
        }
    }
    
    trimDecisionHistory(selectorState) {
        if (selectorState.decisionHistory.length > this.config.maxDecisionHistory) {
            selectorState.decisionHistory = selectorState.decisionHistory.slice(-this.config.maxDecisionHistory);
        }
    }
    
    // Context helper methods (simplified for now)
    getRecentPerformance(selectorState) { return { overall: 0.7 }; }
    getTaskHistory(selectorState) { return Array.from(selectorState.taskHistory.entries()); }
    async getAgentMemoryState(agent) { return { memoryEntries: 0 }; }
    async getAgentLearningGoals(agent) { return []; }
    async getCompetitivePosition(agent) { return { ranking: 'unknown' }; }
    async getCurrentMarketConditions() { return { volatility: 'medium', competition: 'high' }; }
    getResourceAvailability(agent) { return { cpu: 'available', memory: 'available' }; }
    
    /**
     * 🛑 STOP AGENT SELECTION
     */
    stopAgentSelection(agentId) {
        const selectorState = this.agentSelectors.get(agentId);
        if (selectorState && selectorState.selectionLoop) {
            clearInterval(selectorState.selectionLoop);
            selectorState.isActive = false;
            console.log(`🛑 Stopped autonomous task selection for agent ${agentId}`);
        }
    }
    
    /**
     * 📊 GET SELECTOR STATUS
     */
    getSelectorStatus() {
        const activeSelectors = Array.from(this.agentSelectors.values()).filter(s => s.isActive);
        
        return {
            totalAgents: this.agentSelectors.size,
            activeSelectors: activeSelectors.length,
            learningSystemsConnected: {
                rewardPenaltyEngine: !!this.rewardPenaltyEngine,
                decisionAwarenessSystem: !!this.decisionAwarenessSystem,
                quantumMDPIntegration: !!this.quantumMDPIntegration,
                adaptiveLearningEngine: !!this.adaptiveLearningEngine
            }
        };
    }
}
