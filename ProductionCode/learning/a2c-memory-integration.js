/**
 * 🔗 A2C MEMORY INTEGRATION SYSTEM
 * =================================
 * 
 * Advanced integration layer that connects Bounded A2C + DDP with
 * Intelligent Memory Distillation to prevent Apple's complexity collapse
 * while enabling sophisticated reinforcement learning.
 * 
 * Key Innovation: Real-time monitoring and distillation of RL experiences
 * and policy networks to maintain optimal complexity while preserving
 * learning effectiveness.
 */

import { EventEmitter } from 'events';
import { BoundedA2CDDPSystem } from './bounded-a2c-ddp-system.js';
import { IntelligentMemoryDistillationSystem } from './intelligent-memory-distillation-system.js';
import { PolicyDistillationEngine } from './policy-distillation-engine.js';

/**
 * Enhanced Experience Buffer with prioritized replay and intelligent compression
 * Now extends EventEmitter for proper event handling
 */
class EnhancedExperienceBuffer extends EventEmitter {
    constructor(config = {}) {
        super(); // Call EventEmitter constructor
        this.config = {
            max_size: 50000,                    // Maximum experiences to store
            batch_size: 256,                    // Training batch size
            priority_sampling: true,            // Use prioritized experience replay
            compression_threshold: 0.8,         // Trigger compression at 80% capacity
            value_analysis_interval: 1000,     // Analyze experience value every N additions
            temporal_weighting: true,           // Weight recent experiences higher
            ...config
        };
        
        // Experience storage
        this.experiences = [];
        this.priorities = [];               // For prioritized replay
        this.experience_values = [];       // Experience value scores
        
        // Buffer statistics
        this.stats = {
            total_added: 0,
            total_sampled: 0,
            compression_events: 0,
            average_value: 0
        };
        
        // Value analysis
        this.valueAnalyzer = null; // Will be set from memory distillation system
    }

    /**
     * Add experience to buffer
     */
    addExperience(experience) {
        // Calculate initial priority
        const priority = this.calculateInitialPriority(experience);
        
        // Add to buffer
        if (this.experiences.length >= this.config.max_size) {
            // Remove oldest/lowest value experience
            this.removeLowestValueExperience();
        }
        
        this.experiences.push(experience);
        this.priorities.push(priority);
        this.experience_values.push(0); // Will be updated by value analysis
        
        this.stats.total_added++;
        
        // Trigger compression if needed
        if (this.shouldCompress()) {
            this.requestCompression();
        }
        
        // Periodic value analysis
        if (this.stats.total_added % this.config.value_analysis_interval === 0) {
            this.analyzeExperienceValues();
        }
    }

    /**
     * Calculate initial priority for new experience
     */
    calculateInitialPriority(experience) {
        // Higher priority for:
        // - Higher absolute reward
        // - Larger state changes
        // - Novel states
        
        const rewardPriority = Math.abs(experience.reward || 0);
        const noveltyPriority = this.calculateNovelty(experience.state);
        const changePriority = this.calculateStateChange(experience);
        
        return (rewardPriority * 0.5) + (noveltyPriority * 0.3) + (changePriority * 0.2);
    }

    /**
     * Calculate novelty of state
     */
    calculateNovelty(state) {
        if (this.experiences.length === 0) return 1.0;
        
        // Find most similar state in recent experiences
        const recentExperiences = this.experiences.slice(-1000); // Last 1000 experiences
        let minDistance = Infinity;
        
        for (const exp of recentExperiences) {
            const distance = this.calculateStateDistance(state, exp.state);
            minDistance = Math.min(minDistance, distance);
        }
        
        // Novelty is inverse of similarity
        return Math.min(minDistance, 1.0);
    }

    /**
     * Calculate distance between two states
     */
    calculateStateDistance(state1, state2) {
        if (!state1 || !state2 || state1.length !== state2.length) return 1.0;
        
        let sumSquaredDiff = 0;
        for (let i = 0; i < state1.length; i++) {
            const diff = state1[i] - state2[i];
            sumSquaredDiff += diff * diff;
        }
        
        return Math.sqrt(sumSquaredDiff / state1.length);
    }

    /**
     * Calculate magnitude of state change
     */
    calculateStateChange(experience) {
        if (!experience.next_state || !experience.state) return 0;
        
        return this.calculateStateDistance(experience.state, experience.next_state);
    }

    /**
     * Remove lowest value experience
     */
    removeLowestValueExperience() {
        if (this.experience_values.length === 0) {
            // Fallback to oldest experience
            this.experiences.shift();
            this.priorities.shift();
            this.experience_values.shift();
            return;
        }
        
        // Find index of lowest value experience
        let minValue = this.experience_values[0];
        let minIndex = 0;
        
        for (let i = 1; i < this.experience_values.length; i++) {
            if (this.experience_values[i] < minValue) {
                minValue = this.experience_values[i];
                minIndex = i;
            }
        }
        
        // Remove lowest value experience
        this.experiences.splice(minIndex, 1);
        this.priorities.splice(minIndex, 1);
        this.experience_values.splice(minIndex, 1);
    }

    /**
     * Sample batch of experiences for training
     */
    sampleBatch(batchSize = this.config.batch_size) {
        if (this.experiences.length === 0) return [];
        
        const actualBatchSize = Math.min(batchSize, this.experiences.length);
        
        let indices;
        if (this.config.priority_sampling && this.priorities.length > 0) {
            indices = this.prioritizedSample(actualBatchSize);
        } else {
            indices = this.uniformSample(actualBatchSize);
        }
        
        this.stats.total_sampled += actualBatchSize;
        
        // Return sampled experiences with indices for priority updates
        return indices.map(idx => ({
            experience: this.experiences[idx],
            index: idx,
            priority: this.priorities[idx]
        }));
    }

    /**
     * Prioritized experience sampling
     */
    prioritizedSample(batchSize) {
        const indices = [];
        const totalPriority = this.priorities.reduce((sum, p) => sum + p, 0);
        
        if (totalPriority === 0) {
            return this.uniformSample(batchSize);
        }
        
        for (let i = 0; i < batchSize; i++) {
            const random = Math.random() * totalPriority;
            let cumulativePriority = 0;
            
            for (let j = 0; j < this.priorities.length; j++) {
                cumulativePriority += this.priorities[j];
                if (random <= cumulativePriority) {
                    indices.push(j);
                    break;
                }
            }
        }
        
        return indices;
    }

    /**
     * Uniform random sampling
     */
    uniformSample(batchSize) {
        const indices = [];
        const availableIndices = Array.from({length: this.experiences.length}, (_, i) => i);
        
        for (let i = 0; i < batchSize; i++) {
            const randomIdx = Math.floor(Math.random() * availableIndices.length);
            indices.push(availableIndices.splice(randomIdx, 1)[0]);
        }
        
        return indices;
    }

    /**
     * Update priority for experience
     */
    updatePriority(index, newPriority) {
        if (index >= 0 && index < this.priorities.length) {
            this.priorities[index] = newPriority;
        }
    }

    /**
     * Check if compression should be triggered
     */
    shouldCompress() {
        const capacityRatio = this.experiences.length / this.config.max_size;
        return capacityRatio >= this.config.compression_threshold;
    }

    /**
     * Request experience compression
     */
    requestCompression() {
        // This will be handled by the integration system
        this.emit('compression_requested', {
            buffer_size: this.experiences.length,
            compression_threshold: this.config.compression_threshold
        });
    }

    /**
     * Analyze experience values using memory distillation
     */
    analyzeExperienceValues() {
        if (!this.valueAnalyzer) return;
        
        console.log('🔍 Analyzing experience values...');
        
        for (let i = 0; i < this.experiences.length; i++) {
            const experience = this.experiences[i];
            const analysis = this.valueAnalyzer.analyzeExperience(experience);
            this.experience_values[i] = analysis.score;
        }
        
        // Update statistics
        const totalValue = this.experience_values.reduce((sum, v) => sum + v, 0);
        this.stats.average_value = totalValue / this.experience_values.length;
    }

    /**
     * Set value analyzer from memory distillation system
     */
    setValueAnalyzer(valueAnalyzer) {
        this.valueAnalyzer = valueAnalyzer;
    }

    /**
     * Compress experiences using memory distillation
     */
    async compressExperiences(compressionEngine) {
        console.log('🗜️ Compressing experience buffer...');
        
        const beforeSize = this.experiences.length;
        
        // Group similar experiences for compression
        const experienceGroups = this.groupSimilarExperiences();
        
        // Compress each group
        const compressedExperiences = [];
        for (const group of experienceGroups) {
            if (group.length > 1) {
                // Compress group into representative experience
                const compressed = this.compressExperienceGroup(group);
                compressedExperiences.push(compressed);
            } else {
                // Keep single experiences as-is
                compressedExperiences.push(group[0]);
            }
        }
        
        // Replace buffer contents
        this.experiences = compressedExperiences.map(item => item.experience || item);
        this.priorities = compressedExperiences.map((_, idx) => 1.0); // Reset priorities
        this.experience_values = compressedExperiences.map(item => item.value || 0.5);
        
        this.stats.compression_events++;
        
        const afterSize = this.experiences.length;
        const compressionRatio = afterSize / beforeSize;
        
        console.log(`✅ Experience compression: ${beforeSize} → ${afterSize} (${(compressionRatio * 100).toFixed(1)}%)`);
        
        return {
            before_size: beforeSize,
            after_size: afterSize,
            compression_ratio: compressionRatio,
            space_saved: beforeSize - afterSize
        };
    }

    /**
     * Group similar experiences for compression
     */
    groupSimilarExperiences() {
        const groups = [];
        const used = new Set();
        
        for (let i = 0; i < this.experiences.length; i++) {
            if (used.has(i)) continue;
            
            const group = [this.experiences[i]];
            used.add(i);
            
            // Find similar experiences
            for (let j = i + 1; j < this.experiences.length; j++) {
                if (used.has(j)) continue;
                
                if (this.areExperiencesSimilar(this.experiences[i], this.experiences[j])) {
                    group.push(this.experiences[j]);
                    used.add(j);
                }
            }
            
            groups.push(group);
        }
        
        return groups;
    }

    /**
     * Check if two experiences are similar
     */
    areExperiencesSimilar(exp1, exp2) {
        // Similar if:
        // - States are close
        // - Actions are same
        // - Rewards have same sign
        
        const stateDistance = this.calculateStateDistance(exp1.state, exp2.state);
        const sameAction = exp1.action === exp2.action;
        const sameRewardSign = Math.sign(exp1.reward || 0) === Math.sign(exp2.reward || 0);
        
        return stateDistance < 0.1 && sameAction && sameRewardSign;
    }

    /**
     * Compress group of similar experiences
     */
    compressExperienceGroup(group) {
        // Create representative experience from group
        const representative = {
            state: this.averageStates(group.map(exp => exp.state)),
            action: group[0].action, // Same for all in group
            reward: group.reduce((sum, exp) => sum + (exp.reward || 0), 0) / group.length,
            next_state: this.averageStates(group.map(exp => exp.next_state).filter(s => s)),
            done: group.some(exp => exp.done),
            timestamp: Math.max(...group.map(exp => exp.timestamp || Date.now())),
            group_size: group.length,
            compressed: true
        };
        
        return representative;
    }

    /**
     * Average multiple states
     */
    averageStates(states) {
        if (states.length === 0) return null;
        if (states.length === 1) return states[0];
        
        const avgState = new Array(states[0].length).fill(0);
        
        for (const state of states) {
            for (let i = 0; i < state.length; i++) {
                avgState[i] += state[i];
            }
        }
        
        return avgState.map(sum => sum / states.length);
    }

    /**
     * Get buffer statistics
     */
    getStats() {
        return {
            ...this.stats,
            current_size: this.experiences.length,
            capacity_usage: this.experiences.length / this.config.max_size,
            priority_range: this.priorities.length > 0 ? {
                min: Math.min(...this.priorities),
                max: Math.max(...this.priorities),
                avg: this.priorities.reduce((sum, p) => sum + p, 0) / this.priorities.length
            } : null
        };
    }
}

/**
 * A2C Performance Monitor with real-time tracking and alerting
 */
class A2CPerformanceMonitor extends EventEmitter {
    constructor(config = {}) {
        super(); // Call EventEmitter constructor
        this.config = {
            monitoring_window: 1000,        // Monitor last N training steps
            complexity_alert_threshold: 0.8, // Alert when complexity exceeds threshold
            performance_degradation_threshold: 0.2, // Alert when performance drops
            ...config
        };
        
        // Performance tracking
        this.trainingHistory = [];
        this.complexityHistory = [];
        this.performanceHistory = [];
        
        // Alert system
        this.alerts = [];
        this.lastAlert = 0;
    }

    /**
     * Record training step
     */
    recordTrainingStep(trainingResult) {
        const record = {
            timestamp: Date.now(),
            actor_loss: trainingResult.actor_loss,
            critic_loss: trainingResult.critic_loss,
            entropy: trainingResult.entropy,
            complexity: trainingResult.complexity || 0,
            episode_reward: trainingResult.episode_reward || 0
        };
        
        this.trainingHistory.push(record);
        this.complexityHistory.push(record.complexity);
        this.performanceHistory.push(record.episode_reward);
        
        // Keep within monitoring window
        if (this.trainingHistory.length > this.config.monitoring_window) {
            this.trainingHistory.shift();
            this.complexityHistory.shift();
            this.performanceHistory.shift();
        }
        
        // Check for alerts
        this.checkForAlerts(record);
    }

    /**
     * Check for performance alerts
     */
    checkForAlerts(currentRecord) {
        const now = Date.now();
        
        // Rate limit alerts (max one per minute)
        if (now - this.lastAlert < 60000) return;
        
        // Complexity alert
        if (currentRecord.complexity > this.config.complexity_alert_threshold) {
            this.triggerAlert('HIGH_COMPLEXITY', {
                complexity: currentRecord.complexity,
                threshold: this.config.complexity_alert_threshold,
                message: 'Model complexity exceeds threshold'
            });
        }
        
        // Performance degradation alert
        if (this.performanceHistory.length >= 100) {
            const recentPerformance = this.performanceHistory.slice(-50);
            const olderPerformance = this.performanceHistory.slice(-100, -50);
            
            const recentAvg = recentPerformance.reduce((sum, p) => sum + p, 0) / recentPerformance.length;
            const olderAvg = olderPerformance.reduce((sum, p) => sum + p, 0) / olderPerformance.length;
            
            const degradation = (olderAvg - recentAvg) / Math.abs(olderAvg);
            
            if (degradation > this.config.performance_degradation_threshold) {
                this.triggerAlert('PERFORMANCE_DEGRADATION', {
                    degradation: degradation,
                    recent_avg: recentAvg,
                    older_avg: olderAvg,
                    message: 'Significant performance degradation detected'
                });
            }
        }
    }

    /**
     * Trigger performance alert
     */
    triggerAlert(alertType, details) {
        const alert = {
            type: alertType,
            timestamp: Date.now(),
            details
        };
        
        this.alerts.push(alert);
        this.lastAlert = Date.now();
        
        // Keep only recent alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }
        
        // Emit alert event
        this.emit('performance_alert', alert);
        
        console.log(`🚨 A2C Performance Alert: ${alertType}`);
        console.log(`📊 Details:`, details);
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        if (this.trainingHistory.length === 0) {
            return {
                training_steps: 0,
                avg_complexity: 0,
                avg_performance: 0,
                recent_alerts: []
            };
        }
        
        const avgComplexity = this.complexityHistory.reduce((sum, c) => sum + c, 0) / this.complexityHistory.length;
        const avgPerformance = this.performanceHistory.reduce((sum, p) => sum + p, 0) / this.performanceHistory.length;
        
        // Recent performance trend
        const recentSteps = Math.min(100, this.performanceHistory.length);
        const recentPerformance = this.performanceHistory.slice(-recentSteps);
        const performanceTrend = this.calculateTrend(recentPerformance);
        
        return {
            training_steps: this.trainingHistory.length,
            avg_complexity: avgComplexity,
            avg_performance: avgPerformance,
            performance_trend: performanceTrend,
            recent_alerts: this.alerts.slice(-10), // Last 10 alerts
            complexity_distribution: this.calculateComplexityDistribution()
        };
    }

    /**
     * Calculate performance trend
     */
    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        // Simple linear regression slope
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, y) => sum + y, 0);
        const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
        const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    /**
     * Calculate complexity distribution
     */
    calculateComplexityDistribution() {
        if (this.complexityHistory.length === 0) return {};
        
        const bins = {
            low: 0,     // 0-0.3
            medium: 0,  // 0.3-0.6
            high: 0,    // 0.6-0.8
            critical: 0 // 0.8+
        };
        
        for (const complexity of this.complexityHistory) {
            if (complexity < 0.3) bins.low++;
            else if (complexity < 0.6) bins.medium++;
            else if (complexity < 0.8) bins.high++;
            else bins.critical++;
        }
        
        return bins;
    }
}

/**
 * Main A2C Memory Integration System
 */
export class A2CMemoryIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Integration settings
            distillation_interval: 1000,       // Steps between distillations
            policy_distillation_interval: 5000, // Steps between policy distillations
            experience_compression_interval: 2000, // Steps between experience compression
            
            // Performance monitoring
            performance_monitoring: true,
            complexity_monitoring: true,
            
            // Experience management
            experience_buffer_size: 50000,
            priority_experience_replay: true,
            
            // Distillation thresholds
            experience_distillation_threshold: 0.8,
            policy_distillation_threshold: 0.8,
            emergency_cleanup_threshold: 0.9,
            
            ...config
        };
        
        // Core systems (will be injected)
        this.a2cSystem = null;
        this.memoryDistillationSystem = null;
        this.policyDistillationEngine = null;
        
        // Integration components
        this.experienceBuffer = new EnhancedExperienceBuffer({
            max_size: this.config.experience_buffer_size,
            priority_sampling: this.config.priority_experience_replay
        });
        
        this.performanceMonitor = new A2CPerformanceMonitor();
        
        // System state
        this.integrationState = {
            initialized: false,
            running: false,
            training_steps: 0,
            distillation_cycles: 0,
            policy_distillations: 0,
            experience_compressions: 0,
            last_distillation: 0,
            last_policy_distillation: 0,
            last_experience_compression: 0
        };
        
        // Performance tracking
        this.integrationMetrics = {
            distillation_performance: [],
            compression_efficiency: [],
            learning_effectiveness: [],
            complexity_management: []
        };
        
        // Interval handlers
        this.intervalHandlers = {
            distillation: null,
            policy_distillation: null,
            experience_compression: null,
            performance_monitoring: null
        };
    }

    /**
     * Initialize the integration system
     */
    async initialize(a2cSystem, memoryDistillationSystem, policyDistillationEngine = null) {
        console.log('🔗 Initializing A2C Memory Integration...');
        
        try {
            // Store system references
            this.a2cSystem = a2cSystem;
            this.memoryDistillationSystem = memoryDistillationSystem;
            this.policyDistillationEngine = policyDistillationEngine;
            
            // Set up experience buffer with memory distillation
            if (memoryDistillationSystem && memoryDistillationSystem.valueAnalyzer) {
                this.experienceBuffer.setValueAnalyzer(memoryDistillationSystem.valueAnalyzer);
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start monitoring intervals
            this.startMonitoringIntervals();
            
            this.integrationState.initialized = true;
            this.integrationState.running = true;
            
            console.log('✅ A2C Memory Integration initialized successfully');
            
            this.emit('integration_initialized', {
                a2c_connected: !!this.a2cSystem,
                memory_distillation_connected: !!this.memoryDistillationSystem,
                policy_distillation_connected: !!this.policyDistillationEngine
            });
            
        } catch (error) {
            console.error('❌ Failed to initialize A2C Memory Integration:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // A2C system events
        if (this.a2cSystem) {
            this.a2cSystem.on('training_completed', (data) => {
                this.handleTrainingCompleted(data);
            });
            
            this.a2cSystem.on('complexity_distillation_completed', (data) => {
                this.handleComplexityDistillation(data);
            });
        }
        
        // Memory distillation events
        if (this.memoryDistillationSystem) {
            this.memoryDistillationSystem.on('distillation_completed', (data) => {
                this.handleMemoryDistillation(data);
            });
        }
        
        // Policy distillation events
        if (this.policyDistillationEngine) {
            this.policyDistillationEngine.on('policy_distilled', (data) => {
                this.handlePolicyDistillation(data);
            });
        }
        
        // Experience buffer events
        this.experienceBuffer.on('compression_requested', (data) => {
            this.handleExperienceCompressionRequest(data);
        });
        
        // Performance monitor events
        this.performanceMonitor.on('performance_alert', (alert) => {
            this.handlePerformanceAlert(alert);
        });
    }

    /**
     * Handle A2C training completion
     */
    async handleTrainingCompleted(data) {
        this.integrationState.training_steps++;
        
        // Record performance
        this.performanceMonitor.recordTrainingStep(data.results);
        
        // Check if any distillation is needed
        await this.checkDistillationNeeds(data);
        
        this.emit('training_step_processed', {
            step: this.integrationState.training_steps,
            results: data.results
        });
    }

    /**
     * Check if distillation is needed
     */
    async checkDistillationNeeds(trainingData) {
        const complexity = trainingData.results?.complexity || 0;
        
        // Emergency cleanup
        if (complexity > this.config.emergency_cleanup_threshold) {
            console.log('🚨 Emergency complexity cleanup triggered!');
            await this.performEmergencyCleanup();
            return;
        }
        
        // Regular distillation checks
        const stepsSinceDistillation = this.integrationState.training_steps - 
            (this.integrationState.last_distillation || 0);
        
        const stepsSincePolicyDistillation = this.integrationState.training_steps - 
            (this.integrationState.last_policy_distillation || 0);
        
        const stepsSinceExperienceCompression = this.integrationState.training_steps - 
            (this.integrationState.last_experience_compression || 0);
        
        // Memory distillation
        if (stepsSinceDistillation >= this.config.distillation_interval ||
            complexity > this.config.experience_distillation_threshold) {
            await this.performMemoryDistillation();
        }
        
        // Policy distillation
        if (this.policyDistillationEngine &&
            (stepsSincePolicyDistillation >= this.config.policy_distillation_interval ||
             complexity > this.config.policy_distillation_threshold)) {
            await this.performPolicyDistillation();
        }
        
        // Experience compression
        if (stepsSinceExperienceCompression >= this.config.experience_compression_interval ||
            this.experienceBuffer.shouldCompress()) {
            await this.performExperienceCompression();
        }
    }

    /**
     * Perform emergency cleanup
     */
    async performEmergencyCleanup() {
        console.log('🚑 Performing emergency complexity cleanup...');
        
        const startTime = Date.now();
        
        try {
            // Emergency experience compression
            if (this.experienceBuffer.experiences.length > 1000) {
                await this.experienceBuffer.compressExperiences();
            }
            
            // Emergency policy distillation
            if (this.policyDistillationEngine && this.a2cSystem.actorCritic) {
                await this.policyDistillationEngine.distillPolicy(
                    this.a2cSystem.actorCritic.actor,
                    'emergency_actor'
                );
                
                await this.policyDistillationEngine.distillPolicy(
                    this.a2cSystem.actorCritic.critic,
                    'emergency_critic'
                );
            }
            
            // Emergency memory distillation
            if (this.memoryDistillationSystem) {
                const emergencyExperiences = this.experienceBuffer.experiences.slice(-1000);
                await this.memoryDistillationSystem.distillAgentMemory(
                    'emergency_agent',
                    emergencyExperiences,
                    { emergency: true, complexity_level: 'critical' }
                );
            }
            
            const cleanupTime = Date.now() - startTime;
            
            console.log(`✅ Emergency cleanup completed in ${cleanupTime}ms`);
            
            this.emit('emergency_cleanup_completed', {
                cleanup_time: cleanupTime,
                trigger: 'complexity_overload'
            });
            
        } catch (error) {
            console.error('❌ Emergency cleanup failed:', error);
        }
    }

    /**
     * Perform memory distillation
     */
    async performMemoryDistillation() {
        if (!this.memoryDistillationSystem) return;
        
        console.log('🧠 Performing memory distillation...');
        
        try {
            const experiences = this.experienceBuffer.experiences.slice(-5000); // Recent experiences
            const context = this.buildDistillationContext();
            
            const result = await this.memoryDistillationSystem.distillAgentMemory(
                'a2c_agent',
                experiences,
                context
            );
            
            this.integrationState.distillation_cycles++;
            this.integrationState.last_distillation = this.integrationState.training_steps;
            
            this.recordDistillationMetrics('memory', result);
            
            console.log('✅ Memory distillation completed');
            
        } catch (error) {
            console.error('❌ Memory distillation failed:', error);
        }
    }

    /**
     * Perform policy distillation
     */
    async performPolicyDistillation() {
        if (!this.policyDistillationEngine || !this.a2cSystem.actorCritic) return;
        
        console.log('🎭 Performing policy distillation...');
        
        try {
            // Distill actor network
            const actorResult = await this.policyDistillationEngine.distillPolicy(
                this.a2cSystem.actorCritic.actor,
                'actor'
            );
            
            // Distill critic network
            const criticResult = await this.policyDistillationEngine.distillPolicy(
                this.a2cSystem.actorCritic.critic,
                'critic'
            );
            
            this.integrationState.policy_distillations++;
            this.integrationState.last_policy_distillation = this.integrationState.training_steps;
            
            this.recordDistillationMetrics('policy', { actorResult, criticResult });
            
            console.log('✅ Policy distillation completed');
            
        } catch (error) {
            console.error('❌ Policy distillation failed:', error);
        }
    }

    /**
     * Perform experience compression
     */
    async performExperienceCompression() {
        console.log('🗜️ Performing experience compression...');
        
        try {
            const result = await this.experienceBuffer.compressExperiences();
            
            this.integrationState.experience_compressions++;
            this.integrationState.last_experience_compression = this.integrationState.training_steps;
            
            this.recordDistillationMetrics('experience', result);
            
            console.log('✅ Experience compression completed');
            
        } catch (error) {
            console.error('❌ Experience compression failed:', error);
        }
    }

    /**
     * Build context for distillation
     */
    buildDistillationContext() {
        const performanceStats = this.performanceMonitor.getPerformanceStats();
        const bufferStats = this.experienceBuffer.getStats();
        
        return {
            training_steps: this.integrationState.training_steps,
            performance_trend: performanceStats.performance_trend,
            avg_complexity: performanceStats.avg_complexity,
            buffer_utilization: bufferStats.capacity_usage,
            recent_alerts: performanceStats.recent_alerts,
            integration_state: this.integrationState
        };
    }

    /**
     * Handle memory distillation completion
     */
    handleMemoryDistillation(data) {
        console.log('📊 Memory distillation completed:', data.compression_ratio);
        
        // Update experience values based on distillation results
        if (data.experience_analysis) {
            this.updateExperienceValuesFromDistillation(data.experience_analysis);
        }
    }

    /**
     * Handle policy distillation completion
     */
    handlePolicyDistillation(data) {
        console.log('🎭 Policy distillation completed:', data.compression_metrics);
        
        // Could update A2C system with distilled policies if needed
        this.emit('policy_optimization_completed', data);
    }

    /**
     * Handle complexity distillation from A2C system
     */
    handleComplexityDistillation(data) {
        console.log('🔧 A2C complexity distillation completed');
        
        // Record the complexity reduction
        this.recordComplexityReduction(data);
    }

    /**
     * Handle experience compression request
     */
    async handleExperienceCompressionRequest(data) {
        console.log('📨 Experience compression requested');
        await this.performExperienceCompression();
    }

    /**
     * Handle performance alerts
     */
    async handlePerformanceAlert(alert) {
        console.log(`🚨 Performance alert: ${alert.type}`);
        
        // Take action based on alert type
        switch (alert.type) {
            case 'HIGH_COMPLEXITY':
                await this.performMemoryDistillation();
                break;
            case 'PERFORMANCE_DEGRADATION':
                await this.performPolicyDistillation();
                break;
        }
        
        this.emit('performance_intervention', alert);
    }

    /**
     * Update experience values from distillation results
     */
    updateExperienceValuesFromDistillation(experienceAnalysis) {
        // Update experience buffer priorities based on distillation analysis
        const valueMapping = new Map();
        
        // Build mapping from distillation results
        for (const analysis of experienceAnalysis.high_value_experiences || []) {
            valueMapping.set(analysis.experience.id, analysis.value.score);
        }
        
        for (const analysis of experienceAnalysis.compression_candidates || []) {
            valueMapping.set(analysis.experience.id, analysis.value.score);
        }
        
        // Update buffer values
        for (let i = 0; i < this.experienceBuffer.experiences.length; i++) {
            const experience = this.experienceBuffer.experiences[i];
            const newValue = valueMapping.get(experience.id);
            
            if (newValue !== undefined) {
                this.experienceBuffer.experience_values[i] = newValue;
                this.experienceBuffer.priorities[i] = newValue;
            }
        }
    }

    /**
     * Record distillation metrics
     */
    recordDistillationMetrics(type, result) {
        const metric = {
            type,
            timestamp: Date.now(),
            training_step: this.integrationState.training_steps,
            result
        };
        
        switch (type) {
            case 'memory':
                this.integrationMetrics.distillation_performance.push(metric);
                break;
            case 'policy':
                this.integrationMetrics.compression_efficiency.push(metric);
                break;
            case 'experience':
                this.integrationMetrics.learning_effectiveness.push(metric);
                break;
        }
        
        // Keep metrics within reasonable bounds
        Object.keys(this.integrationMetrics).forEach(key => {
            if (this.integrationMetrics[key].length > 1000) {
                this.integrationMetrics[key] = this.integrationMetrics[key].slice(-1000);
            }
        });
    }

    /**
     * Record complexity reduction
     */
    recordComplexityReduction(data) {
        this.integrationMetrics.complexity_management.push({
            timestamp: Date.now(),
            training_step: this.integrationState.training_steps,
            complexity_reduction: data.new_complexity,
            type: 'a2c_internal'
        });
    }

    /**
     * Start monitoring intervals
     */
    startMonitoringIntervals() {
        // Periodic checks (every 30 seconds)
        this.intervalHandlers.distillation = setInterval(() => {
            this.performPeriodicChecks();
        }, 30000);
        
        console.log('🔍 A2C Memory Integration monitoring started');
    }

    /**
     * Perform periodic checks
     */
    async performPeriodicChecks() {
        if (!this.integrationState.running) return;
        
        try {
            // Check system health
            const health = this.checkSystemHealth();
            
            if (!health.healthy) {
                console.log('⚠️ System health issues detected:', health.issues);
                await this.performMaintenanceActions(health.issues);
            }
            
            // Periodic cleanup
            await this.performPeriodicCleanup();
            
        } catch (error) {
            console.error('❌ Periodic check failed:', error);
        }
    }

    /**
     * Check system health
     */
    checkSystemHealth() {
        const health = {
            healthy: true,
            issues: []
        };
        
        // Check experience buffer health
        const bufferStats = this.experienceBuffer.getStats();
        if (bufferStats.capacity_usage > 0.95) {
            health.healthy = false;
            health.issues.push('experience_buffer_full');
        }
        
        // Check performance trends
        const perfStats = this.performanceMonitor.getPerformanceStats();
        if (perfStats.performance_trend < -0.1) {
            health.healthy = false;
            health.issues.push('performance_degrading');
        }
        
        // Check complexity distribution
        if (perfStats.complexity_distribution?.critical > 10) {
            health.healthy = false;
            health.issues.push('high_complexity_episodes');
        }
        
        return health;
    }

    /**
     * Perform maintenance actions
     */
    async performMaintenanceActions(issues) {
        for (const issue of issues) {
            switch (issue) {
                case 'experience_buffer_full':
                    await this.performExperienceCompression();
                    break;
                case 'performance_degrading':
                    await this.performPolicyDistillation();
                    break;
                case 'high_complexity_episodes':
                    await this.performMemoryDistillation();
                    break;
            }
        }
    }

    /**
     * Perform periodic cleanup
     */
    async performPeriodicCleanup() {
        // Clean old metrics
        const oneHourAgo = Date.now() - 3600000;
        
        Object.keys(this.integrationMetrics).forEach(key => {
            this.integrationMetrics[key] = this.integrationMetrics[key].filter(
                metric => metric.timestamp > oneHourAgo
            );
        });
        
        // Prune policy rules if available
        if (this.policyDistillationEngine) {
            await this.policyDistillationEngine.pruneRules();
        }
    }

    /**
     * Add experience to training buffer
     */
    addExperience(experience) {
        this.experienceBuffer.addExperience(experience);
    }

    /**
     * Get training batch
     */
    getTrainingBatch(batchSize) {
        return this.experienceBuffer.sampleBatch(batchSize);
    }

    /**
     * Update experience priority
     */
    updateExperiencePriority(index, priority) {
        this.experienceBuffer.updatePriority(index, priority);
    }

    /**
     * Get integration statistics
     */
    getIntegrationStats() {
        return {
            integration_state: this.integrationState,
            experience_buffer_stats: this.experienceBuffer.getStats(),
            performance_stats: this.performanceMonitor.getPerformanceStats(),
            integration_metrics: this.calculateIntegrationMetrics()
        };
    }

    /**
     * Calculate integration metrics
     */
    calculateIntegrationMetrics() {
        const metrics = {};
        
        Object.keys(this.integrationMetrics).forEach(key => {
            const values = this.integrationMetrics[key];
            if (values.length > 0) {
                metrics[key] = {
                    count: values.length,
                    latest: values[values.length - 1],
                    frequency: values.length / ((Date.now() - values[0].timestamp) / 3600000) // per hour
                };
            }
        });
        
        return metrics;
    }

    /**
     * Shutdown integration system
     */
    async shutdown() {
        console.log('🛑 Shutting down A2C Memory Integration...');
        
        this.integrationState.running = false;
        
        // Clear intervals
        Object.values(this.intervalHandlers).forEach(handler => {
            if (handler) clearInterval(handler);
        });
        
        // Save current state if needed
        // Could implement state persistence here
        
        console.log('✅ A2C Memory Integration shutdown complete');
    }
}

export { EnhancedExperienceBuffer, A2CPerformanceMonitor };
export default A2CMemoryIntegration; 