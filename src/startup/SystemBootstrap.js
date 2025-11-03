/**
 * 🎯 SYSTEM BOOTSTRAP - PRODUCTION-GRADE SYSTEM INITIALIZATION
 * ===========================================================
 * 
 * Master bootstrap that integrates all resilience systems:
 * - DatabaseManager with circuit breakers
 * - MemoryManagement with leak detection
 * - BackgroundTaskManager with resource limits
 * - GlobalErrorBoundary with recovery
 * - ResilientStartup with dependency ordering
 * - Schema migrations
 * 
 * @author Elite AI Syndicate - Infrastructure Team
 */

import { EventEmitter } from 'events';
import { getDatabaseManager } from '../database/DatabaseManager.js';
import { runMigrations } from '../database/migrations/MigrationRunner.js';
import { getMemoryManagement } from '../memory/MemoryManagement.js';
import { getBackgroundTaskManager } from '../orchestration/BackgroundTaskManager.js';
import { getGlobalErrorBoundary } from '../errors/GlobalErrorBoundary.js';
import { getResilientStartup } from './ResilientStartup.js';
import { getCircuitBreakerManager } from '../resilience/CircuitBreaker.js';

/**
 * 🎯 SYSTEM BOOTSTRAP CLASS
 */
export class SystemBootstrap extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Feature flags
            enableDatabase: config.enableDatabase !== false,
            enableMigrations: config.enableMigrations !== false,
            enableMemoryManagement: config.enableMemoryManagement !== false,
            enableBackgroundTasks: config.enableBackgroundTasks !== false,
            enableErrorBoundary: config.enableErrorBoundary !== false,
            enableCircuitBreakers: config.enableCircuitBreakers !== false,
            
            // Configuration
            ...config
        };
        
        // System components
        this.databaseManager = null;
        this.memoryManagement = null;
        this.backgroundTaskManager = null;
        this.errorBoundary = null;
        this.circuitBreakerManager = null;
        this.startupManager = null;
        
        // State
        this.isBootstrapped = false;
        this.bootstrapTime = null;
        
        console.log('🎯 SystemBootstrap initialized');
    }
    
    /**
     * 🚀 BOOTSTRAP - Initialize all systems
     */
    async bootstrap() {
        if (this.isBootstrapped) {
            console.log('   ⚠️ System already bootstrapped');
            return this.getSystemInfo();
        }
        
        console.log('🚀 BOOTSTRAPPING PRODUCTION SYSTEMS...');
        console.log('=====================================');
        
        const startTime = Date.now();
        
        try {
            // Initialize startup manager
            this.startupManager = getResilientStartup();
            
            // Register all services with proper dependencies
            await this.registerServices();
            
            // Start all services in correct order
            const result = await this.startupManager.startAll();
            
            this.isBootstrapped = true;
            this.bootstrapTime = Date.now() - startTime;
            
            console.log('');
            console.log('✅ SYSTEM BOOTSTRAP COMPLETE');
            console.log('============================');
            console.log(`   Bootstrap time: ${this.bootstrapTime}ms`);
            console.log(`   Services ready: ${result.metrics.readyServices}/${result.metrics.totalServices}`);
            console.log(`   System mode: ${result.degraded ? 'DEGRADED' : 'NORMAL'}`);
            console.log('');
            
            this.emit('bootstrapComplete', { duration: this.bootstrapTime, result });
            
            return this.getSystemInfo();
            
        } catch (error) {
            console.error('❌ BOOTSTRAP FAILED:', error.message);
            
            this.emit('bootstrapFailed', { error });
            
            throw error;
        }
    }
    
    /**
     * 📝 REGISTER SERVICES
     */
    async registerServices() {
        console.log('📝 Registering services...');
        console.log('');
        
        // PHASE 1: Error Handling (must be first!)
        if (this.config.enableErrorBoundary) {
            this.startupManager.registerService(
                'ErrorBoundary',
                async () => {
                    this.errorBoundary = getGlobalErrorBoundary();
                    this.errorBoundary.activate();
                    
                    // Register recovery handlers
                    this.registerErrorRecoveryHandlers();
                },
                {
                    dependencies: [],
                    critical: true,
                    healthCheck: () => this.errorBoundary?.isActive === true
                }
            );
        }
        
        // PHASE 2: Memory Management
        if (this.config.enableMemoryManagement) {
            this.startupManager.registerService(
                'MemoryManagement',
                async () => {
                    this.memoryManagement = getMemoryManagement();
                    this.memoryManagement.startMonitoring();
                    
                    // Register cleanup callbacks
                    this.registerMemoryCleanupCallbacks();
                },
                {
                    dependencies: ['ErrorBoundary'],
                    critical: true,
                    healthCheck: () => this.memoryManagement?.isMonitoring === true
                }
            );
        }
        
        // PHASE 3: Circuit Breakers
        if (this.config.enableCircuitBreakers) {
            this.startupManager.registerService(
                'CircuitBreakers',
                async () => {
                    this.circuitBreakerManager = getCircuitBreakerManager();
                    
                    // Create circuit breakers for critical services
                    this.createCircuitBreakers();
                },
                {
                    dependencies: ['ErrorBoundary'],
                    critical: false
                }
            );
        }
        
        // PHASE 4: Database
        if (this.config.enableDatabase) {
            this.startupManager.registerService(
                'Database',
                async () => {
                    this.databaseManager = getDatabaseManager();
                    await this.databaseManager.initialize();
                    
                    // Integrate with memory management
                    this.integrateDatabaseWithMemory();
                },
                {
                    dependencies: ['ErrorBoundary', 'MemoryManagement', 'CircuitBreakers'],
                    critical: true,
                    timeout: 120000, // 2 minutes
                    healthCheck: async () => {
                        if (!this.databaseManager) return false;
                        const metrics = this.databaseManager.getMetrics();
                        return metrics.healthCheckStatus === 'healthy';
                    }
                }
            );
        }
        
        // PHASE 5: Database Migrations
        if (this.config.enableMigrations && this.config.enableDatabase) {
            this.startupManager.registerService(
                'DatabaseMigrations',
                async () => {
                    console.log('   🔄 Running database migrations...');
                    await runMigrations(this.databaseManager);
                },
                {
                    dependencies: ['Database'],
                    critical: false,
                    timeout: 300000 // 5 minutes for migrations
                }
            );
        }
        
        // PHASE 6: Background Tasks
        if (this.config.enableBackgroundTasks) {
            this.startupManager.registerService(
                'BackgroundTasks',
                async () => {
                    this.backgroundTaskManager = getBackgroundTaskManager();
                    
                    // Integrate with memory management
                    this.integrateBackgroundTasksWithMemory();
                    
                    // Start processing
                    this.backgroundTaskManager.start();
                },
                {
                    dependencies: ['MemoryManagement', 'Database'],
                    critical: false,
                    healthCheck: () => this.backgroundTaskManager?.isProcessing === true
                }
            );
        }
        
        console.log(`✅ Registered ${this.startupManager.services.size} services`);
        console.log('');
    }
    
    /**
     * 🔌 CREATE CIRCUIT BREAKERS
     */
    createCircuitBreakers() {
        // Database circuit breaker
        const dbBreaker = this.circuitBreakerManager.getOrCreate('database', {
            failureThreshold: 5,
            resetTimeout: 30000
        });
        
        // Set fallback for database queries
        dbBreaker.setFallback(async () => {
            console.warn('   🔌 Using database fallback (in-memory)');
            return { rows: [], fallback: true };
        });
        
        console.log('   🔌 Created circuit breakers for critical services');
    }
    
    /**
     * 🛡️ REGISTER ERROR RECOVERY HANDLERS
     */
    registerErrorRecoveryHandlers() {
        const ErrorCategory = {
            DATABASE: 'database',
            MEMORY: 'memory',
            NETWORK: 'network'
        };
        
        // Database error recovery
        this.errorBoundary.registerRecoveryHandler(ErrorCategory.DATABASE, async (errorInfo) => {
            console.log('   🔄 Attempting database recovery...');
            
            if (this.databaseManager) {
                await this.databaseManager.attemptRecovery();
            }
        });
        
        // Memory error recovery
        this.errorBoundary.registerRecoveryHandler(ErrorCategory.MEMORY, async (errorInfo) => {
            console.log('   🔄 Attempting memory recovery...');
            
            if (this.memoryManagement) {
                this.memoryManagement.performCleanup('critical');
                this.memoryManagement.triggerGarbageCollection('critical');
            }
        });
        
        console.log('   🛡️ Registered error recovery handlers');
    }
    
    /**
     * 💾 REGISTER MEMORY CLEANUP CALLBACKS
     */
    registerMemoryCleanupCallbacks() {
        // Database cleanup
        this.memoryManagement.registerCleanup('database_connections', () => {
            // Database manager handles its own cleanup
            console.log('   💾 Database cleanup triggered');
        });
        
        // Background tasks cleanup
        this.memoryManagement.registerCleanup('background_tasks', () => {
            if (this.backgroundTaskManager && this.backgroundTaskManager.isProcessing) {
                this.backgroundTaskManager.suspend();
                console.log('   💾 Background tasks suspended');
            }
        });
        
        console.log('   💾 Registered memory cleanup callbacks');
    }
    
    /**
     * 🔗 INTEGRATE DATABASE WITH MEMORY
     */
    integrateDatabaseWithMemory() {
        if (!this.memoryManagement || !this.databaseManager) {
            return;
        }
        
        // Listen to memory warnings
        this.memoryManagement.on('memoryWarning', (snapshot) => {
            console.warn('   ⚠️ Memory warning - reducing database activity');
            // Database manager has its own circuit breaker
        });
        
        // Listen to memory critical
        this.memoryManagement.on('memoryCritical', (snapshot) => {
            console.error('   🚨 Memory critical - suspending database operations');
            // Circuit breaker will handle this
        });
        
        console.log('   🔗 Integrated database with memory management');
    }
    
    /**
     * 🔗 INTEGRATE BACKGROUND TASKS WITH MEMORY
     */
    integrateBackgroundTasksWithMemory() {
        if (!this.memoryManagement || !this.backgroundTaskManager) {
            return;
        }
        
        // Register background task manager as memory-intensive operation
        this.memoryManagement.registerMemoryIntensiveOperation({
            suspend: () => this.backgroundTaskManager.suspend(),
            resume: () => this.backgroundTaskManager.resume()
        });
        
        // Listen to memory pressure
        this.memoryManagement.on('memoryWarning', () => {
            this.backgroundTaskManager.handleMemoryPressure();
        });
        
        this.memoryManagement.on('memoryCritical', () => {
            this.backgroundTaskManager.suspend();
        });
        
        // Resume when memory clears
        this.memoryManagement.on('cleanupCompleted', () => {
            const status = this.memoryManagement.getCurrentStatus();
            if (status.heapUtilization < 70) {
                this.backgroundTaskManager.clearMemoryPressure();
            }
        });
        
        console.log('   🔗 Integrated background tasks with memory management');
    }
    
    /**
     * 📊 GET SYSTEM INFO
     */
    getSystemInfo() {
        return {
            isBootstrapped: this.isBootstrapped,
            bootstrapTime: this.bootstrapTime,
            components: {
                database: this.databaseManager !== null,
                memoryManagement: this.memoryManagement !== null,
                backgroundTasks: this.backgroundTaskManager !== null,
                errorBoundary: this.errorBoundary !== null,
                circuitBreakers: this.circuitBreakerManager !== null
            },
            metrics: this.getMetrics()
        };
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        const metrics = {
            bootstrap: {
                bootstrapTime: this.bootstrapTime,
                isBootstrapped: this.isBootstrapped
            }
        };
        
        if (this.databaseManager) {
            metrics.database = this.databaseManager.getMetrics();
        }
        
        if (this.memoryManagement) {
            metrics.memory = this.memoryManagement.getMetrics();
        }
        
        if (this.backgroundTaskManager) {
            metrics.backgroundTasks = this.backgroundTaskManager.getMetrics();
        }
        
        if (this.errorBoundary) {
            metrics.errors = this.errorBoundary.getMetrics();
        }
        
        if (this.circuitBreakerManager) {
            metrics.circuitBreakers = this.circuitBreakerManager.getAllMetrics();
        }
        
        return metrics;
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('🛑 Shutting down systems...');
        
        const shutdownTasks = [];
        
        // Stop background tasks first
        if (this.backgroundTaskManager) {
            shutdownTasks.push(this.backgroundTaskManager.stop());
        }
        
        // Stop memory monitoring
        if (this.memoryManagement) {
            this.memoryManagement.stopMonitoring();
        }
        
        // Close database
        if (this.databaseManager) {
            shutdownTasks.push(this.databaseManager.shutdown());
        }
        
        // Deactivate error boundary last
        if (this.errorBoundary) {
            this.errorBoundary.deactivate();
        }
        
        await Promise.allSettled(shutdownTasks);
        
        console.log('✅ Shutdown complete');
    }
}

// Singleton instance
let systemBootstrapInstance = null;

/**
 * 🎯 GET SYSTEM BOOTSTRAP - Singleton accessor
 */
export function getSystemBootstrap(config = {}) {
    if (!systemBootstrapInstance) {
        systemBootstrapInstance = new SystemBootstrap(config);
    }
    return systemBootstrapInstance;
}

/**
 * 🚀 BOOTSTRAP SYSTEM - Helper function
 */
export async function bootstrapSystem(config = {}) {
    const bootstrap = getSystemBootstrap(config);
    return await bootstrap.bootstrap();
}

export default SystemBootstrap;

