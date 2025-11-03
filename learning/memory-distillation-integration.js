/**
 * 🔗 MEMORY DISTILLATION INTEGRATION SYSTEM
 * ==========================================
 * 
 * Integration layer that connects the Intelligent Memory Distillation System
 * with the existing Quantum Evolution System to prevent Apple's complexity
 * collapse while enabling continuous learning.
 */

import { EventEmitter } from 'events';
import { IntelligentMemoryDistillationSystem } from './intelligent-memory-distillation-system.js';
import { QuantumEvolutionMasterSystem } from './quantum-evolution-master-system.js';
import { EnhancedMemorySystem } from './enhanced-memory-system.js';

/**
 * Integration system that coordinates memory distillation with quantum evolution
 */
export class MemoryDistillationIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            integration_interval: 30000,        // 30 seconds
            complexity_check_interval: 5000,   // 5 seconds
            emergency_threshold: 0.9,           // 90% complexity triggers emergency
            performance_tracking: true,         // Track performance impact
            auto_optimization: true,            // Auto-optimize based on performance
            ...config
        };
        
        // Core systems
        this.distillationSystem = new IntelligentMemoryDistillationSystem();
        this.quantumEvolution = null;
        this.memorySystem = new EnhancedMemorySystem();
        
        // Integration state
        this.integrationState = {
            initialized: false,
            running: false,
            last_distillation: 0,
            emergency_cleanups: 0,
            performance_improvements: 0,
            agent_complexity_levels: new Map()
        };
        
        // Performance tracking
        this.performanceMetrics = {
            before_distillation: [],
            after_distillation: [],
            complexity_reductions: [],
            learning_rate_improvements: []
        };
        
        this.intervalHandlers = {
            integration: null,
            complexity_check: null
        };
    }

    /**
     * Initialize the integration system
     */
    async initialize(quantumEvolutionSystem) {
        console.log('🔗 Initializing Memory Distillation Integration...');
        
        try {
            // Store quantum evolution system reference
            this.quantumEvolution = quantumEvolutionSystem;
            
            // Initialize distillation system
            await this.distillationSystem.initialize();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Start monitoring intervals
            this.startIntegrationMonitoring();
            
            this.integrationState.initialized = true;
            this.integrationState.running = true;
            
            console.log('✅ Memory distillation integration initialized successfully');
            
            this.emit('integration_initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize memory distillation integration:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners for integration
     */
    setupEventListeners() {
        // Listen for quantum evolution events
        if (this.quantumEvolution) {
            this.quantumEvolution.on('agent_evolution_completed', (data) => {
                this.handleAgentEvolution(data);
            });
            
            this.quantumEvolution.on('performance_degradation', (data) => {
                this.handlePerformanceDegradation(data);
            });
        }
        
        // Listen for distillation system events
        this.distillationSystem.on('distillation_completed', (data) => {
            this.handleDistillationCompleted(data);
        });
        
        this.distillationSystem.on('distillation_failed', (data) => {
            this.handleDistillationFailed(data);
        });
        
        this.distillationSystem.on('automatic_distillation_trigger', () => {
            this.handleAutomaticDistillation();
        });
        
        // Listen for memory system events
        this.memorySystem.on('memory_updated', (data) => {
            this.handleMemoryUpdate(data);
        });
    }

    /**
     * Handle agent evolution completion
     */
    async handleAgentEvolution(data) {
        const { agent_id, evolution_result, context } = data;
        
        console.log(`🔄 Handling evolution completion for agent: ${agent_id}`);
        
        try {
            // Get agent experiences from memory system
            const experiences = await this.getAgentExperiences(agent_id);
            
            // Check if distillation is needed
            const needsDistillation = await this.checkDistillationNeeded(agent_id, experiences, context);
            
            if (needsDistillation.required) {
                console.log(`🧠 Triggering distillation for ${agent_id}: ${needsDistillation.reason}`);
                
                // Perform distillation
                const distillationResult = await this.distillationSystem.distillAgentMemory(
                    agent_id, 
                    experiences, 
                    context
                );
                
                // Update quantum evolution system with distilled context
                await this.updateQuantumEvolutionContext(agent_id, distillationResult);
                
                // Record performance impact
                this.recordPerformanceImpact(agent_id, distillationResult);
            }
            
        } catch (error) {
            console.error(`❌ Error handling agent evolution for ${agent_id}:`, error);
        }
    }

    /**
     * Handle performance degradation
     */
    async handlePerformanceDegradation(data) {
        const { agent_id, degradation_type, metrics } = data;
        
        console.log(`🚨 Performance degradation detected for ${agent_id}: ${degradation_type}`);
        
        // If degradation is due to complexity, trigger emergency distillation
        if (degradation_type === 'complexity_overload' || degradation_type === 'context_bloat') {
            try {
                // Get current context and experiences
                const experiences = await this.getAgentExperiences(agent_id);
                const context = await this.getAgentContext(agent_id);
                
                // Trigger emergency distillation
                const distillationResult = await this.distillationSystem.distillAgentMemory(
                    agent_id, 
                    experiences, 
                    {
                        ...context,
                        emergency: true,
                        degradation_type,
                        metrics
                    }
                );
                
                // Update quantum evolution system immediately
                await this.updateQuantumEvolutionContext(agent_id, distillationResult);
                
                this.integrationState.emergency_cleanups++;
                
                console.log(`🚑 Emergency distillation completed for ${agent_id}`);
                
            } catch (error) {
                console.error(`❌ Emergency distillation failed for ${agent_id}:`, error);
            }
        }
    }

    /**
     * Handle distillation completion
     */
    async handleDistillationCompleted(data) {
        const { agent_id, distillation_result, complexity_analysis } = data;
        
        console.log(`✅ Distillation completed for ${agent_id}`);
        
        // Update agent complexity tracking
        this.integrationState.agent_complexity_levels.set(agent_id, {
            level: complexity_analysis.level,
            score: complexity_analysis.complexity,
            timestamp: Date.now(),
            intervention: complexity_analysis.intervention
        });
        
        // Check if performance improved
        if (distillation_result.compression_ratio < 0.8) {
            this.integrationState.performance_improvements++;
            
            // Notify quantum evolution system of improvement
            if (this.quantumEvolution) {
                this.quantumEvolution.emit('agent_context_optimized', {
                    agent_id,
                    optimization_type: 'memory_distillation',
                    improvement_metrics: {
                        compression_ratio: distillation_result.compression_ratio,
                        context_reduction: distillation_result.context_size_reduction,
                        rules_created: distillation_result.rules_created
                    }
                });
            }
        }
        
        // Update performance metrics
        this.performanceMetrics.after_distillation.push({
            agent_id,
            timestamp: Date.now(),
            compression_ratio: distillation_result.compression_ratio,
            context_reduction: distillation_result.context_size_reduction
        });
        
        this.integrationState.last_distillation = Date.now();
    }

    /**
     * Handle distillation failure
     */
    async handleDistillationFailed(data) {
        const { agent_id, error } = data;
        
        console.error(`❌ Distillation failed for ${agent_id}: ${error}`);
        
        // Try fallback cleanup
        try {
            await this.performFallbackCleanup(agent_id);
        } catch (fallbackError) {
            console.error(`❌ Fallback cleanup also failed for ${agent_id}:`, fallbackError);
        }
    }

    /**
     * Handle automatic distillation trigger
     */
    async handleAutomaticDistillation() {
        console.log('🔄 Automatic distillation triggered');
        
        // Check all agents for distillation needs
        const agents = await this.getActiveAgents();
        
        for (const agent_id of agents) {
            try {
                const experiences = await this.getAgentExperiences(agent_id);
                const context = await this.getAgentContext(agent_id);
                
                const needsDistillation = await this.checkDistillationNeeded(agent_id, experiences, context);
                
                if (needsDistillation.required) {
                    console.log(`🧠 Auto-distillation for ${agent_id}: ${needsDistillation.reason}`);
                    
                    // Perform distillation
                    await this.distillationSystem.distillAgentMemory(agent_id, experiences, context);
                }
                
            } catch (error) {
                console.error(`❌ Auto-distillation failed for ${agent_id}:`, error);
            }
        }
    }

    /**
     * Handle memory system updates
     */
    async handleMemoryUpdate(data) {
        const { agent_id, update_type, size_change } = data;
        
        // If memory size increased significantly, check for distillation need
        if (size_change > 10000) { // 10KB increase
            const experiences = await this.getAgentExperiences(agent_id);
            const context = await this.getAgentContext(agent_id);
            
            const needsDistillation = await this.checkDistillationNeeded(agent_id, experiences, context);
            
            if (needsDistillation.required) {
                console.log(`🧠 Memory growth triggered distillation for ${agent_id}`);
                
                // Perform distillation
                await this.distillationSystem.distillAgentMemory(agent_id, experiences, context);
            }
        }
    }

    /**
     * Check if distillation is needed for an agent
     */
    async checkDistillationNeeded(agent_id, experiences, context) {
        const checks = {
            experience_count: experiences.length > 1000,
            context_size: JSON.stringify(context).length > 50000,
            complexity_high: false,
            time_since_last: false
        };
        
        // Check complexity
        const complexityAnalysis = this.distillationSystem.complexityMonitor.monitorComplexity(agent_id, context);
        checks.complexity_high = complexityAnalysis.complexity > 0.7;
        
        // Check time since last distillation
        const lastDistillation = this.integrationState.agent_complexity_levels.get(agent_id);
        if (lastDistillation) {
            const timeSince = Date.now() - lastDistillation.timestamp;
            checks.time_since_last = timeSince > 300000; // 5 minutes
        } else {
            checks.time_since_last = true; // Never distilled
        }
        
        // Determine if distillation is needed
        const required = Object.values(checks).some(Boolean);
        
        let reason = '';
        if (checks.experience_count) reason += 'too many experiences, ';
        if (checks.context_size) reason += 'context too large, ';
        if (checks.complexity_high) reason += 'complexity high, ';
        if (checks.time_since_last) reason += 'time since last distillation, ';
        
        return {
            required,
            reason: reason.slice(0, -2), // Remove trailing comma
            checks,
            complexity_analysis: complexityAnalysis
        };
    }

    /**
     * Start integration monitoring
     */
    startIntegrationMonitoring() {
        // Main integration interval
        this.intervalHandlers.integration = setInterval(() => {
            this.performIntegrationMaintenance();
        }, this.config.integration_interval);
        
        // Complexity check interval
        this.intervalHandlers.complexity_check = setInterval(() => {
            this.performComplexityCheck();
        }, this.config.complexity_check_interval);
        
        console.log('🔍 Integration monitoring started');
    }

    /**
     * Perform integration maintenance
     */
    async performIntegrationMaintenance() {
        try {
            // Check system health
            const systemHealth = await this.checkSystemHealth();
            
            if (!systemHealth.healthy) {
                console.log('⚠️ System health issues detected, performing maintenance...');
                
                // Perform maintenance actions
                await this.performSystemMaintenance(systemHealth);
            }
            
            // Update performance metrics
            this.updatePerformanceMetrics();
            
        } catch (error) {
            console.error('❌ Integration maintenance failed:', error);
        }
    }

    /**
     * Perform complexity check on all agents
     */
    async performComplexityCheck() {
        try {
            const agents = await this.getActiveAgents();
            
            for (const agent_id of agents) {
                const context = await this.getAgentContext(agent_id);
                const complexityAnalysis = this.distillationSystem.complexityMonitor.monitorComplexity(agent_id, context);
                
                // Emergency intervention if complexity is critical
                if (complexityAnalysis.complexity >= this.config.emergency_threshold) {
                    console.log(`🚨 Critical complexity for ${agent_id}: ${complexityAnalysis.complexity}`);
                    
                    // Trigger emergency distillation
                    const experiences = await this.getAgentExperiences(agent_id);
                    await this.distillationSystem.distillAgentMemory(agent_id, experiences, {
                        ...context,
                        emergency: true,
                        complexity_critical: true
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Complexity check failed:', error);
        }
    }

    /**
     * Update quantum evolution context after distillation
     */
    async updateQuantumEvolutionContext(agent_id, distillationResult) {
        if (!this.quantumEvolution) return;
        
        try {
            // Create optimized context
            const optimizedContext = {
                agent_id,
                distillation_summary: {
                    compression_ratio: distillationResult.compression_ratio,
                    rules_created: distillationResult.rules_created,
                    experiences_retained: distillationResult.experiences_kept,
                    context_size_reduction: distillationResult.context_size_reduction
                },
                optimization_timestamp: Date.now()
            };
            
            // Update quantum evolution system
            await this.quantumEvolution.updateAgentContext(agent_id, optimizedContext);
            
        } catch (error) {
            console.error(`❌ Failed to update quantum evolution context for ${agent_id}:`, error);
        }
    }

    /**
     * Record performance impact of distillation
     */
    recordPerformanceImpact(agent_id, distillationResult) {
        this.performanceMetrics.compression_efficiency.push({
            agent_id,
            timestamp: Date.now(),
            compression_ratio: distillationResult.compression_ratio,
            context_reduction: distillationResult.context_size_reduction,
            rules_created: distillationResult.rules_created
        });
        
        // Keep only last 100 records
        if (this.performanceMetrics.compression_efficiency.length > 100) {
            this.performanceMetrics.compression_efficiency = 
                this.performanceMetrics.compression_efficiency.slice(-100);
        }
    }

    /**
     * Perform fallback cleanup
     */
    async performFallbackCleanup(agent_id) {
        console.log(`🔄 Performing fallback cleanup for ${agent_id}`);
        
        try {
            // Use basic memory cleanup
            await this.memorySystem.cleanup();
            
            // Reset agent complexity tracking
            this.integrationState.agent_complexity_levels.delete(agent_id);
            
            console.log(`✅ Fallback cleanup completed for ${agent_id}`);
            
        } catch (error) {
            console.error(`❌ Fallback cleanup failed for ${agent_id}:`, error);
            throw error;
        }
    }

    /**
     * Get agent experiences from memory system
     */
    async getAgentExperiences(agent_id) {
        try {
            const memories = await this.memorySystem.getMemories(agent_id);
            
            // Convert memories to experiences format
            const experiences = memories.map(memory => ({
                id: memory.id,
                timestamp: memory.createdAt,
                context: memory.content?.context || {},
                actions: memory.content?.actions || [],
                outcome: memory.content?.outcome || {},
                metadata: memory.content?.metadata || {}
            }));
            
            return experiences;
            
        } catch (error) {
            console.error(`❌ Failed to get experiences for ${agent_id}:`, error);
            return [];
        }
    }

    /**
     * Get agent context
     */
    async getAgentContext(agent_id) {
        try {
            // Get context from quantum evolution system
            if (this.quantumEvolution) {
                const context = await this.quantumEvolution.getAgentContext(agent_id);
                return context || {};
            }
            
            return {};
            
        } catch (error) {
            console.error(`❌ Failed to get context for ${agent_id}:`, error);
            return {};
        }
    }

    /**
     * Get active agents
     */
    async getActiveAgents() {
        try {
            // Get agents from quantum evolution system
            if (this.quantumEvolution) {
                return await this.quantumEvolution.getActiveAgents();
            }
            
            return [];
            
        } catch (error) {
            console.error('❌ Failed to get active agents:', error);
            return [];
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        const health = {
            healthy: true,
            issues: [],
            metrics: {}
        };
        
        try {
            // Check distillation system health
            const distillationStatus = this.distillationSystem.getSystemStatus();
            health.metrics.distillation = distillationStatus;
            
            if (!distillationStatus.system_state.running) {
                health.healthy = false;
                health.issues.push('distillation_system_not_running');
            }
            
            // Check memory system health
            const memoryHealthy = await this.memorySystem.healthCheck();
            health.metrics.memory_system = memoryHealthy;
            
            if (!memoryHealthy) {
                health.healthy = false;
                health.issues.push('memory_system_unhealthy');
            }
            
            // Check quantum evolution system health
            if (this.quantumEvolution && this.quantumEvolution.systemState) {
                health.metrics.quantum_evolution = this.quantumEvolution.systemState;
                
                if (!this.quantumEvolution.systemState.running) {
                    health.healthy = false;
                    health.issues.push('quantum_evolution_not_running');
                }
            }
            
            return health;
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
            return {
                healthy: false,
                issues: ['health_check_failed'],
                error: error.message
            };
        }
    }

    /**
     * Perform system maintenance
     */
    async performSystemMaintenance(systemHealth) {
        console.log('🔧 Performing system maintenance...');
        
        for (const issue of systemHealth.issues) {
            try {
                switch (issue) {
                    case 'distillation_system_not_running':
                        await this.distillationSystem.initialize();
                        break;
                    case 'memory_system_unhealthy':
                        await this.memorySystem.cleanup();
                        break;
                    case 'quantum_evolution_not_running':
                        // Restart quantum evolution if possible
                        if (this.quantumEvolution && this.quantumEvolution.initialize) {
                            await this.quantumEvolution.initialize();
                        }
                        break;
                }
                
                console.log(`✅ Fixed issue: ${issue}`);
                
            } catch (error) {
                console.error(`❌ Failed to fix issue ${issue}:`, error);
            }
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        // Calculate average compression ratio
        const compressionRatios = this.performanceMetrics.compression_efficiency.map(m => m.compression_ratio);
        const avgCompression = compressionRatios.length > 0 ? 
            compressionRatios.reduce((sum, r) => sum + r, 0) / compressionRatios.length : 0;
        
        // Calculate context reduction efficiency
        const contextReductions = this.performanceMetrics.compression_efficiency.map(m => m.context_reduction);
        const totalReduction = contextReductions.reduce((sum, r) => sum + r, 0);
        
        // Update integration state
        this.integrationState.performance_metrics = {
            average_compression_ratio: avgCompression,
            total_context_reduction: totalReduction,
            active_agents: this.integrationState.agent_complexity_levels.size,
            last_updated: Date.now()
        };
    }

    /**
     * Get integration status
     */
    getIntegrationStatus() {
        return {
            integration_state: this.integrationState,
            performance_metrics: this.performanceMetrics,
            system_health: this.checkSystemHealth(),
            distillation_system_status: this.distillationSystem.getSystemStatus()
        };
    }

    /**
     * Shutdown integration system
     */
    async shutdown() {
        console.log('🛑 Shutting down memory distillation integration...');
        
        // Clear intervals
        Object.values(this.intervalHandlers).forEach(handler => {
            if (handler) clearInterval(handler);
        });
        
        // Shutdown distillation system
        await this.distillationSystem.shutdown();
        
        this.integrationState.running = false;
        
        console.log('✅ Memory distillation integration shut down');
    }
}

export default MemoryDistillationIntegration; 