#!/usr/bin/env node

/**
 * 🚀 QUANTUM EVOLUTION + MEMORY DISTILLATION LAUNCHER
 * ===================================================
 * 
 * Advanced launcher that integrates:
 * - Quantum Evolution System (continuous learning)
 * - Intelligent Memory Distillation (prevents Apple's complexity collapse)
 * - Performance monitoring and optimization
 * 
 * This system ensures agents get "smarter" without hitting reasoning walls.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { QuantumEvolutionMasterSystem } from './learning/quantum-evolution-master-system.js';
import { IntelligentMemoryDistillationSystem } from './learning/intelligent-memory-distillation-system.js';
import { MemoryDistillationIntegration } from './learning/memory-distillation-integration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Advanced launcher with intelligent memory management
 */
class QuantumEvolutionWithDistillationLauncher {
    constructor() {
        this.config = {
            // Agent configuration
            agent_count: 7,
            agent_types: [
                'polygon_micro_king',
                'base_speed_demon', 
                'arbitrum_profit_maximizer',
                'analyst_alpha',
                'analyst_beta', 
                'analyst_gamma',
                'coordinator',
                'developer',
                'ai_prediction_specialist'
            ],
            
            // Quantum evolution settings
            quantum_evolution: {
                populationSize: 50,
                maxGenerations: 1000,
                quantumNoiseLevel: 0.05,
                explorationRate: 0.5,
                exploitationRate: 0.5
            },
            
            // Memory distillation settings
            memory_distillation: {
                distillation_interval: 60000,         // 1 minute
                emergency_threshold: 0.9,             // 90% complexity
                compression_batch_size: 100,
                max_retention_days: 30,
                performance_tracking: true
            },
            
            // Integration settings
            integration: {
                complexity_check_interval: 5000,      // 5 seconds
                performance_monitoring: true,
                auto_optimization: true,
                emergency_intervention: true
            },
            
            // Performance settings
            performance: {
                monitoring_enabled: true,
                metrics_collection: true,
                real_time_analysis: true,
                optimization_triggers: true
            }
        };
        
        // System components
        this.quantumEvolution = null;
        this.memoryDistillation = null;
        this.integration = null;
        
        // System state
        this.systemState = {
            initialized: false,
            running: false,
            start_time: 0,
            uptime: 0,
            agents_active: 0,
            performance_metrics: {},
            health_status: 'unknown'
        };
        
        // Performance tracking
        this.performanceTracker = {
            evolution_cycles: 0,
            distillation_cycles: 0,
            emergency_cleanups: 0,
            performance_improvements: 0,
            avg_complexity_reduction: 0
        };
        
        // Shutdown handlers
        this.shutdownHandlers = [];
        this.setupShutdownHandlers();
    }

    /**
     * Initialize all systems
     */
    async initialize() {
        console.log('🚀 Starting Quantum Evolution + Memory Distillation System...');
        console.log('🧠 Preventing Apple\'s "Illusion of Thinking" complexity collapse...');
        
        const initStart = Date.now();
        
        try {
            // Step 1: Initialize Quantum Evolution System
            console.log('\n🌌 Initializing Quantum Evolution Master System...');
            this.quantumEvolution = new QuantumEvolutionMasterSystem(this.config.quantum_evolution);
            await this.quantumEvolution.initializeAllSystems();
            
            // Step 2: Initialize Memory Distillation System
            console.log('\n🧠 Initializing Intelligent Memory Distillation System...');
            this.memoryDistillation = new IntelligentMemoryDistillationSystem(this.config.memory_distillation);
            await this.memoryDistillation.initialize();
            
            // Step 3: Initialize Integration System
            console.log('\n🔗 Initializing Memory Distillation Integration...');
            this.integration = new MemoryDistillationIntegration(this.config.integration);
            await this.integration.initialize(this.quantumEvolution);
            
            // Step 4: Set up monitoring
            this.setupPerformanceMonitoring();
            
            // Step 5: Start agent systems
            await this.startAgentSystems();
            
            // Update system state
            this.systemState.initialized = true;
            this.systemState.running = true;
            this.systemState.start_time = Date.now();
            
            const initTime = Date.now() - initStart;
            console.log(`\n✅ System initialized successfully in ${initTime}ms`);
            
            // Display system status
            this.displaySystemStatus();
            
            // Start main loop
            this.startMainLoop();
            
        } catch (error) {
            console.error('❌ System initialization failed:', error);
            await this.shutdown();
            throw error;
        }
    }

    /**
     * Set up performance monitoring
     */
    setupPerformanceMonitoring() {
        if (!this.config.performance.monitoring_enabled) return;
        
        console.log('📊 Setting up performance monitoring...');
        
        // Monitor quantum evolution performance
        this.quantumEvolution.on('evolution_cycle_completed', (data) => {
            this.handleEvolutionCycle(data);
        });
        
        this.quantumEvolution.on('performance_improvement', (data) => {
            this.handlePerformanceImprovement(data);
        });
        
        // Monitor memory distillation performance
        this.memoryDistillation.on('distillation_completed', (data) => {
            this.handleDistillationCompleted(data);
        });
        
        // Monitor integration performance
        this.integration.on('integration_optimization', (data) => {
            this.handleIntegrationOptimization(data);
        });
        
        // Start performance analysis
        this.startPerformanceAnalysis();
    }

    /**
     * Start agent systems
     */
    async startAgentSystems() {
        console.log('🤖 Starting agent systems...');
        
        const agentPromises = this.config.agent_types.map(async (agentType, index) => {
            try {
                const agentId = `${agentType}_${index}`;
                
                // Initialize agent in quantum evolution system
                await this.quantumEvolution.initializeAgent(agentId, {
                    type: agentType,
                    specialized_config: this.getAgentSpecificConfig(agentType)
                });
                
                // Set up memory distillation for agent
                await this.integration.setupAgentDistillation(agentId);
                
                console.log(`✅ Agent initialized: ${agentId}`);
                
                return agentId;
                
            } catch (error) {
                console.error(`❌ Failed to initialize agent ${agentType}:`, error);
                throw error;
            }
        });
        
        const initializedAgents = await Promise.all(agentPromises);
        this.systemState.agents_active = initializedAgents.length;
        
        console.log(`✅ ${initializedAgents.length} agents initialized successfully`);
    }

    /**
     * Get agent-specific configuration
     */
    getAgentSpecificConfig(agentType) {
        const baseConfig = {
            learning_rate: 0.1,
            memory_capacity: 1000,
            complexity_threshold: 0.8
        };
        
        const specificConfigs = {
            polygon_micro_king: {
                ...baseConfig,
                execution_focus: 0.95,
                profit_threshold: 0.01,
                speed_optimization: 0.8
            },
            base_speed_demon: {
                ...baseConfig,
                speed_optimization: 0.99,
                latency_target: 1, // 1ms
                execution_focus: 0.9
            },
            arbitrum_profit_maximizer: {
                ...baseConfig,
                profit_optimization: 0.95,
                risk_tolerance: 0.3,
                trade_volume_target: 100000
            },
            analyst_alpha: {
                ...baseConfig,
                analysis_precision: 0.98,
                feedback_delivery: 0.9,
                supervision_level: 0.8
            },
            analyst_beta: {
                ...baseConfig,
                analysis_precision: 0.98,
                pattern_recognition: 0.9,
                market_analysis: 0.85
            },
            analyst_gamma: {
                ...baseConfig,
                analysis_precision: 0.98,
                risk_assessment: 0.9,
                competitive_intelligence: 0.85
            },
            coordinator: {
                ...baseConfig,
                teaching_focus: 0.95,
                collaboration: 0.9,
                performance_optimization: 0.85
            },
            developer: {
                ...baseConfig,
                safety_focus: 0.98,
                reliability: 0.95,
                conservative_innovation: 0.9
            },
            ai_prediction_specialist: {
                ...baseConfig,
                precision_obsession: 0.98,
                confidence_threshold: 0.95,
                prediction_accuracy: 0.9
            }
        };
        
        return specificConfigs[agentType] || baseConfig;
    }

    /**
     * Start main system loop
     */
    startMainLoop() {
        console.log('🔄 Starting main system loop...');
        
        // Main loop interval (every 10 seconds)
        const mainLoopInterval = setInterval(() => {
            this.runMainLoop();
        }, 10000);
        
        this.shutdownHandlers.push(() => clearInterval(mainLoopInterval));
        
        // Health check interval (every 30 seconds)
        const healthCheckInterval = setInterval(() => {
            this.performHealthCheck();
        }, 30000);
        
        this.shutdownHandlers.push(() => clearInterval(healthCheckInterval));
        
        // Performance analysis interval (every 60 seconds)
        const performanceInterval = setInterval(() => {
            this.analyzeSystemPerformance();
        }, 60000);
        
        this.shutdownHandlers.push(() => clearInterval(performanceInterval));
    }

    /**
     * Run main system loop
     */
    async runMainLoop() {
        try {
            // Update system uptime
            this.systemState.uptime = Date.now() - this.systemState.start_time;
            
            // Check system health
            const healthStatus = await this.checkSystemHealth();
            this.systemState.health_status = healthStatus.status;
            
            // Perform optimizations if needed
            if (this.config.performance.optimization_triggers) {
                await this.performOptimizations();
            }
            
            // Update performance metrics
            this.updatePerformanceMetrics();
            
            // Log system status periodically
            if (this.performanceTracker.evolution_cycles % 10 === 0) {
                this.logSystemStatus();
            }
            
        } catch (error) {
            console.error('❌ Main loop error:', error);
        }
    }

    /**
     * Handle evolution cycle completion
     */
    handleEvolutionCycle(data) {
        this.performanceTracker.evolution_cycles++;
        
        console.log(`🧬 Evolution cycle ${this.performanceTracker.evolution_cycles} completed`);
        
        // Check if complexity is approaching danger zone
        if (data.complexity_metrics && data.complexity_metrics.average > 0.7) {
            console.log('⚠️ Complexity approaching danger zone, preparing distillation...');
            
            // Trigger preemptive distillation
            this.integration.emit('preemptive_distillation_needed', {
                reason: 'high_complexity_detected',
                metrics: data.complexity_metrics
            });
        }
    }

    /**
     * Handle performance improvement
     */
    handlePerformanceImprovement(data) {
        this.performanceTracker.performance_improvements++;
        
        console.log(`📈 Performance improvement detected: ${data.improvement_type}`);
        
        // Record improvement metrics
        this.systemState.performance_metrics.improvements = 
            this.systemState.performance_metrics.improvements || [];
        
        this.systemState.performance_metrics.improvements.push({
            type: data.improvement_type,
            value: data.improvement_value,
            timestamp: Date.now()
        });
    }

    /**
     * Handle distillation completion
     */
    handleDistillationCompleted(data) {
        this.performanceTracker.distillation_cycles++;
        
        console.log(`🧠 Distillation cycle ${this.performanceTracker.distillation_cycles} completed`);
        
        // Update complexity reduction tracking
        if (data.distillation_result.context_size_reduction > 0) {
            const reductions = this.systemState.performance_metrics.complexity_reductions || [];
            reductions.push(data.distillation_result.context_size_reduction);
            
            // Keep only last 100 measurements
            this.systemState.performance_metrics.complexity_reductions = reductions.slice(-100);
            
            // Calculate average reduction
            this.performanceTracker.avg_complexity_reduction = 
                reductions.reduce((sum, r) => sum + r, 0) / reductions.length;
        }
    }

    /**
     * Handle integration optimization
     */
    handleIntegrationOptimization(data) {
        console.log(`🔗 Integration optimization: ${data.optimization_type}`);
        
        // Apply optimization if beneficial
        if (data.expected_improvement > 0.1) {
            console.log(`✅ Applying optimization: ${data.optimization_type}`);
            
            // Record optimization
            this.systemState.performance_metrics.optimizations = 
                this.systemState.performance_metrics.optimizations || [];
            
            this.systemState.performance_metrics.optimizations.push({
                type: data.optimization_type,
                improvement: data.expected_improvement,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Start performance analysis
     */
    startPerformanceAnalysis() {
        console.log('📊 Starting performance analysis...');
        
        // Real-time performance monitoring
        setInterval(() => {
            this.analyzeRealTimePerformance();
        }, 5000);
        
        // Deep performance analysis
        setInterval(() => {
            this.analyzeDeepPerformance();
        }, 60000);
    }

    /**
     * Analyze real-time performance
     */
    analyzeRealTimePerformance() {
        if (!this.config.performance.real_time_analysis) return;
        
        const performance = {
            timestamp: Date.now(),
            evolution_rate: this.performanceTracker.evolution_cycles / (this.systemState.uptime / 1000),
            distillation_rate: this.performanceTracker.distillation_cycles / (this.systemState.uptime / 1000),
            complexity_reduction: this.performanceTracker.avg_complexity_reduction,
            active_agents: this.systemState.agents_active
        };
        
        // Store performance data
        this.systemState.performance_metrics.real_time = performance;
        
        // Check for performance issues
        if (performance.evolution_rate < 0.1) {
            console.log('⚠️ Low evolution rate detected');
        }
        
        if (performance.distillation_rate > 2) {
            console.log('⚠️ High distillation rate - possible complexity issues');
        }
    }

    /**
     * Analyze deep performance
     */
    analyzeDeepPerformance() {
        console.log('🔍 Performing deep performance analysis...');
        
        const analysis = {
            system_efficiency: this.calculateSystemEfficiency(),
            memory_optimization: this.calculateMemoryOptimization(),
            learning_effectiveness: this.calculateLearningEffectiveness(),
            complexity_management: this.calculateComplexityManagement()
        };
        
        console.log('📊 Deep Performance Analysis:');
        console.log(`  System Efficiency: ${(analysis.system_efficiency * 100).toFixed(1)}%`);
        console.log(`  Memory Optimization: ${(analysis.memory_optimization * 100).toFixed(1)}%`);
        console.log(`  Learning Effectiveness: ${(analysis.learning_effectiveness * 100).toFixed(1)}%`);
        console.log(`  Complexity Management: ${(analysis.complexity_management * 100).toFixed(1)}%`);
        
        // Store analysis
        this.systemState.performance_metrics.deep_analysis = analysis;
        
        // Trigger optimizations if needed
        if (analysis.system_efficiency < 0.7) {
            console.log('🔧 System efficiency below threshold, triggering optimizations...');
            this.triggerSystemOptimizations();
        }
    }

    /**
     * Calculate system efficiency
     */
    calculateSystemEfficiency() {
        const evolutionEfficiency = Math.min(this.performanceTracker.evolution_cycles / 100, 1);
        const distillationEfficiency = 1 - Math.min(this.performanceTracker.distillation_cycles / 50, 1);
        const improvementRate = Math.min(this.performanceTracker.performance_improvements / 10, 1);
        
        return (evolutionEfficiency * 0.4) + (distillationEfficiency * 0.3) + (improvementRate * 0.3);
    }

    /**
     * Calculate memory optimization
     */
    calculateMemoryOptimization() {
        const complexityReduction = Math.min(this.performanceTracker.avg_complexity_reduction / 10000, 1);
        const distillationSuccess = Math.min(this.performanceTracker.distillation_cycles / 20, 1);
        const emergencyRate = 1 - Math.min(this.performanceTracker.emergency_cleanups / 5, 1);
        
        return (complexityReduction * 0.4) + (distillationSuccess * 0.3) + (emergencyRate * 0.3);
    }

    /**
     * Calculate learning effectiveness
     */
    calculateLearningEffectiveness() {
        const improvementRate = Math.min(this.performanceTracker.performance_improvements / 20, 1);
        const evolutionRate = Math.min(this.performanceTracker.evolution_cycles / 100, 1);
        const agentActivity = Math.min(this.systemState.agents_active / this.config.agent_count, 1);
        
        return (improvementRate * 0.4) + (evolutionRate * 0.3) + (agentActivity * 0.3);
    }

    /**
     * Calculate complexity management
     */
    calculateComplexityManagement() {
        const complexityReduction = Math.min(this.performanceTracker.avg_complexity_reduction / 5000, 1);
        const emergencyRate = 1 - Math.min(this.performanceTracker.emergency_cleanups / 3, 1);
        const preventionRate = Math.min(this.performanceTracker.distillation_cycles / 30, 1);
        
        return (complexityReduction * 0.4) + (emergencyRate * 0.3) + (preventionRate * 0.3);
    }

    /**
     * Perform system optimizations
     */
    async performOptimizations() {
        // Check if optimizations are needed
        const needsOptimization = await this.checkOptimizationNeeds();
        
        if (needsOptimization.memory_cleanup) {
            console.log('🧹 Performing memory cleanup optimization...');
            await this.memoryDistillation.performOptimization('memory_cleanup');
        }
        
        if (needsOptimization.evolution_tuning) {
            console.log('🔧 Performing evolution tuning optimization...');
            await this.quantumEvolution.performOptimization('evolution_tuning');
        }
        
        if (needsOptimization.integration_sync) {
            console.log('🔗 Performing integration synchronization...');
            await this.integration.performOptimization('integration_sync');
        }
    }

    /**
     * Check optimization needs
     */
    async checkOptimizationNeeds() {
        const systemStatus = await this.checkSystemHealth();
        
        return {
            memory_cleanup: systemStatus.memory_usage > 0.8,
            evolution_tuning: systemStatus.evolution_efficiency < 0.7,
            integration_sync: systemStatus.integration_latency > 1000
        };
    }

    /**
     * Trigger system optimizations
     */
    async triggerSystemOptimizations() {
        console.log('🚀 Triggering system optimizations...');
        
        try {
            // Optimize quantum evolution parameters
            await this.quantumEvolution.optimizeParameters();
            
            // Optimize memory distillation thresholds
            await this.memoryDistillation.optimizeThresholds();
            
            // Optimize integration performance
            await this.integration.optimizePerformance();
            
            console.log('✅ System optimizations completed');
            
        } catch (error) {
            console.error('❌ System optimizations failed:', error);
        }
    }

    /**
     * Perform health check
     */
    async performHealthCheck() {
        try {
            const health = await this.checkSystemHealth();
            
            if (health.status === 'unhealthy') {
                console.log('🚨 System health issues detected!');
                console.log('Issues:', health.issues);
                
                // Attempt to fix issues
                await this.fixHealthIssues(health.issues);
            }
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
        }
    }

    /**
     * Check system health
     */
    async checkSystemHealth() {
        const health = {
            status: 'healthy',
            issues: [],
            metrics: {}
        };
        
        try {
            // Check quantum evolution health
            if (this.quantumEvolution && this.quantumEvolution.systemState) {
                const qeHealth = this.quantumEvolution.systemState.running;
                health.metrics.quantum_evolution = qeHealth;
                
                if (!qeHealth) {
                    health.status = 'unhealthy';
                    health.issues.push('quantum_evolution_not_running');
                }
            }
            
            // Check memory distillation health
            if (this.memoryDistillation) {
                const mdStatus = this.memoryDistillation.getSystemStatus();
                health.metrics.memory_distillation = mdStatus.system_state.running;
                
                if (!mdStatus.system_state.running) {
                    health.status = 'unhealthy';
                    health.issues.push('memory_distillation_not_running');
                }
            }
            
            // Check integration health
            if (this.integration) {
                const intStatus = this.integration.getIntegrationStatus();
                health.metrics.integration = intStatus.integration_state.running;
                
                if (!intStatus.integration_state.running) {
                    health.status = 'unhealthy';
                    health.issues.push('integration_not_running');
                }
            }
            
            return health;
            
        } catch (error) {
            return {
                status: 'error',
                issues: ['health_check_failed'],
                error: error.message
            };
        }
    }

    /**
     * Fix health issues
     */
    async fixHealthIssues(issues) {
        console.log('🔧 Attempting to fix health issues...');
        
        for (const issue of issues) {
            try {
                switch (issue) {
                    case 'quantum_evolution_not_running':
                        await this.quantumEvolution.initializeAllSystems();
                        break;
                    case 'memory_distillation_not_running':
                        await this.memoryDistillation.initialize();
                        break;
                    case 'integration_not_running':
                        await this.integration.initialize(this.quantumEvolution);
                        break;
                }
                
                console.log(`✅ Fixed: ${issue}`);
                
            } catch (error) {
                console.error(`❌ Failed to fix ${issue}:`, error);
            }
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        this.systemState.performance_metrics.last_updated = Date.now();
        this.systemState.performance_metrics.uptime = this.systemState.uptime;
        this.systemState.performance_metrics.evolution_cycles = this.performanceTracker.evolution_cycles;
        this.systemState.performance_metrics.distillation_cycles = this.performanceTracker.distillation_cycles;
        this.systemState.performance_metrics.performance_improvements = this.performanceTracker.performance_improvements;
        this.systemState.performance_metrics.avg_complexity_reduction = this.performanceTracker.avg_complexity_reduction;
    }

    /**
     * Log system status
     */
    logSystemStatus() {
        console.log('\n📊 SYSTEM STATUS REPORT');
        console.log('========================');
        console.log(`Uptime: ${Math.floor(this.systemState.uptime / 1000)}s`);
        console.log(`Active Agents: ${this.systemState.agents_active}`);
        console.log(`Evolution Cycles: ${this.performanceTracker.evolution_cycles}`);
        console.log(`Distillation Cycles: ${this.performanceTracker.distillation_cycles}`);
        console.log(`Performance Improvements: ${this.performanceTracker.performance_improvements}`);
        console.log(`Avg Complexity Reduction: ${this.performanceTracker.avg_complexity_reduction.toFixed(0)} bytes`);
        console.log(`Health Status: ${this.systemState.health_status}`);
        console.log('========================\n');
    }

    /**
     * Display system status
     */
    displaySystemStatus() {
        console.log('\n🎯 QUANTUM EVOLUTION + MEMORY DISTILLATION SYSTEM');
        console.log('==================================================');
        console.log(`🌌 Quantum Evolution: ${this.quantumEvolution ? '✅ ACTIVE' : '❌ INACTIVE'}`);
        console.log(`🧠 Memory Distillation: ${this.memoryDistillation ? '✅ ACTIVE' : '❌ INACTIVE'}`);
        console.log(`🔗 Integration: ${this.integration ? '✅ ACTIVE' : '❌ INACTIVE'}`);
        console.log(`🤖 Active Agents: ${this.systemState.agents_active}`);
        console.log(`📊 Performance Monitoring: ${this.config.performance.monitoring_enabled ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log(`🚨 Emergency Intervention: ${this.config.integration.emergency_intervention ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log('==================================================');
        console.log('🚀 System is running and preventing complexity collapse!');
        console.log('💡 Agents will continuously learn without hitting Apple\'s reasoning walls.');
        console.log('==================================================\n');
    }

    /**
     * Analyze system performance
     */
    analyzeSystemPerformance() {
        const analysis = {
            timestamp: Date.now(),
            uptime: this.systemState.uptime,
            evolution_rate: this.performanceTracker.evolution_cycles / (this.systemState.uptime / 1000),
            distillation_rate: this.performanceTracker.distillation_cycles / (this.systemState.uptime / 1000),
            improvement_rate: this.performanceTracker.performance_improvements / (this.systemState.uptime / 1000),
            complexity_reduction_rate: this.performanceTracker.avg_complexity_reduction / (this.systemState.uptime / 1000)
        };
        
        console.log('\n🔍 PERFORMANCE ANALYSIS');
        console.log('======================');
        console.log(`Evolution Rate: ${analysis.evolution_rate.toFixed(3)} cycles/sec`);
        console.log(`Distillation Rate: ${analysis.distillation_rate.toFixed(3)} cycles/sec`);
        console.log(`Improvement Rate: ${analysis.improvement_rate.toFixed(3)} improvements/sec`);
        console.log(`Complexity Reduction: ${analysis.complexity_reduction_rate.toFixed(1)} bytes/sec`);
        console.log('======================\n');
        
        // Store analysis
        this.systemState.performance_metrics.analysis = analysis;
    }

    /**
     * Set up shutdown handlers
     */
    setupShutdownHandlers() {
        const shutdown = async () => {
            console.log('\n🛑 Shutting down system...');
            await this.shutdown();
            process.exit(0);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
        process.on('SIGQUIT', shutdown);
    }

    /**
     * Shutdown system
     */
    async shutdown() {
        console.log('🛑 Initiating system shutdown...');
        
        try {
            // Stop all intervals
            this.shutdownHandlers.forEach(handler => {
                try {
                    handler();
                } catch (error) {
                    console.error('❌ Error stopping handler:', error);
                }
            });
            
            // Shutdown integration
            if (this.integration) {
                await this.integration.shutdown();
            }
            
            // Shutdown memory distillation
            if (this.memoryDistillation) {
                await this.memoryDistillation.shutdown();
            }
            
            // Shutdown quantum evolution
            if (this.quantumEvolution) {
                // Assuming quantum evolution has shutdown method
                if (this.quantumEvolution.shutdown) {
                    await this.quantumEvolution.shutdown();
                }
            }
            
            this.systemState.running = false;
            
            console.log('✅ System shutdown completed');
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
        }
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            system_state: this.systemState,
            performance_tracker: this.performanceTracker,
            quantum_evolution_status: this.quantumEvolution?.systemState,
            memory_distillation_status: this.memoryDistillation?.getSystemStatus(),
            integration_status: this.integration?.getIntegrationStatus()
        };
    }
}

/**
 * Main execution
 */
async function main() {
    try {
        const launcher = new QuantumEvolutionWithDistillationLauncher();
        await launcher.initialize();
        
        // Keep the process running
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
        });
        
    } catch (error) {
        console.error('❌ Failed to start system:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { QuantumEvolutionWithDistillationLauncher };
export default QuantumEvolutionWithDistillationLauncher; 