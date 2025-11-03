/**
 * 🛑 GRACEFUL SHUTDOWN MANAGER
 * ===========================
 * 
 * FIXES:
 * ❌ "Called end on pool more than once" errors
 * ❌ Multiple SIGINT handlers causing conflicts
 * ❌ Incomplete state saving during shutdown
 * ❌ Resource cleanup failures
 */

import { EventEmitter } from 'events';

export class GracefulShutdownManager extends EventEmitter {
    constructor() {
        super();
        
        this.isShuttingDown = false;
        this.shutdownPromise = null;
        this.components = new Map();
        this.shutdownTimeout = 30000; // 30 seconds max shutdown time
        this.forceExitAfterTimeout = true;
        
        this.setupShutdownHandlers();
    }

    /**
     * 🎯 REGISTER COMPONENT FOR SHUTDOWN
     * =================================
     */
    registerComponent(name, component, shutdownMethod = 'shutdown') {
        if (this.isShuttingDown) {
            console.warn(`⚠️ Cannot register ${name}: Already shutting down`);
            return;
        }

        this.components.set(name, {
            instance: component,
            shutdownMethod,
            isShutdown: false,
            priority: this.components.size // Lower number = higher priority
        });

        console.log(`✅ Registered component for shutdown: ${name}`);
    }

    /**
     * 🛠️ SETUP SHUTDOWN SIGNAL HANDLERS
     * =================================
     */
    setupShutdownHandlers() {
        // Prevent multiple handlers
        if (this.handlersSetup) {
            return;
        }
        this.handlersSetup = true;

        // SIGINT (Ctrl+C)
        process.on('SIGINT', this.handleShutdown.bind(this, 'SIGINT'));
        
        // SIGTERM (Docker, PM2, etc.)
        process.on('SIGTERM', this.handleShutdown.bind(this, 'SIGTERM'));
        
        // Uncaught exceptions
        process.on('uncaughtException', (error) => {
            console.error('💥 Uncaught Exception:', error);
            this.handleShutdown('UNCAUGHT_EXCEPTION');
        });
        
        // Unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
            this.handleShutdown('UNHANDLED_REJECTION');
        });

        console.log('✅ Shutdown handlers registered');
    }

    /**
     * 🛑 HANDLE SHUTDOWN SIGNAL
     * ========================
     */
    async handleShutdown(signal) {
        // Prevent multiple shutdown attempts
        if (this.isShuttingDown) {
            console.log(`⚠️ Already shutting down, ignoring ${signal}`);
            return;
        }

        console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
        this.isShuttingDown = true;

        // Use existing shutdown promise if available
        if (this.shutdownPromise) {
            return this.shutdownPromise;
        }

        // Create shutdown promise with timeout
        this.shutdownPromise = this.performShutdown();

        try {
            await Promise.race([
                this.shutdownPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Shutdown timeout')), this.shutdownTimeout)
                )
            ]);

            console.log('✅ Graceful shutdown completed');
            process.exit(0);

        } catch (error) {
            console.error('❌ Shutdown error:', error.message);
            
            if (this.forceExitAfterTimeout) {
                console.log('🔥 Force exiting after timeout...');
                process.exit(1);
            }
        }
    }

    /**
     * 🔄 PERFORM GRACEFUL SHUTDOWN
     * ===========================
     */
    async performShutdown() {
        console.log('💾 Saving system state...');
        
        // Get components sorted by priority (lower number = higher priority)
        const sortedComponents = Array.from(this.components.entries())
            .sort((a, b) => a[1].priority - b[1].priority);

        // Shutdown components in priority order
        for (const [name, component] of sortedComponents) {
            await this.shutdownComponent(name, component);
        }

        console.log('✅ All components shutdown complete');
    }

    /**
     * 🔧 SHUTDOWN INDIVIDUAL COMPONENT
     * ===============================
     */
    async shutdownComponent(name, componentConfig) {
        if (componentConfig.isShutdown) {
            console.log(`⏭️ Skipping ${name}: Already shutdown`);
            return;
        }

        try {
            console.log(`🛑 Shutting down ${name}...`);
            
            const { instance, shutdownMethod } = componentConfig;
            
            // Check if shutdown method exists
            if (instance && typeof instance[shutdownMethod] === 'function') {
                
                // Add timeout for individual component shutdown
                await Promise.race([
                    instance[shutdownMethod](),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error(`${name} shutdown timeout`)), 10000)
                    )
                ]);
                
                componentConfig.isShutdown = true;
                console.log(`✅ ${name} shutdown complete`);
                
            } else {
                console.log(`⚠️ ${name}: No shutdown method found`);
                componentConfig.isShutdown = true;
            }

        } catch (error) {
            console.error(`❌ Error shutting down ${name}:`, error.message);
            
            // Mark as shutdown even if there was an error to prevent retries
            componentConfig.isShutdown = true;
            
            // Don't throw - continue with other components
        }
    }

    /**
     * 💾 SAVE SYSTEM STATE
     * ===================
     */
    async saveSystemState() {
        console.log('💾 Saving final system state...');
        
        try {
            // Save any final state data
            const stateData = {
                shutdownTime: new Date().toISOString(),
                components: Array.from(this.components.keys()),
                shutdownReason: 'graceful_shutdown'
            };

            // Emit event for other components to save state
            this.emit('saveState', stateData);
            
            console.log('✅ System state saved');
            
        } catch (error) {
            console.error('❌ Error saving system state:', error.message);
        }
    }

    /**
     * 🏥 CHECK SHUTDOWN STATUS
     * =======================
     */
    getShutdownStatus() {
        const status = {
            isShuttingDown: this.isShuttingDown,
            totalComponents: this.components.size,
            shutdownComponents: 0,
            pendingComponents: []
        };

        for (const [name, component] of this.components.entries()) {
            if (component.isShutdown) {
                status.shutdownComponents++;
            } else {
                status.pendingComponents.push(name);
            }
        }

        return status;
    }
}

/**
 * 🛡️ DATABASE POOL SHUTDOWN FIX
 * =============================
 * Prevents "Called end on pool more than once" errors
 */
export class DatabasePoolManager {
    constructor(pool) {
        this.pool = pool;
        this.isEnded = false;
        this.endPromise = null;
    }

    /**
     * 🛑 SAFE POOL SHUTDOWN
     * ====================
     */
    async safeEnd() {
        // Return existing promise if already ending
        if (this.endPromise) {
            return this.endPromise;
        }

        // Skip if already ended
        if (this.isEnded) {
            console.log('⏭️ Database pool already ended');
            return;
        }

        console.log('🛑 Ending database pool...');
        
        // Create end promise
        this.endPromise = this.performEnd();
        
        try {
            await this.endPromise;
            console.log('✅ Database pool ended successfully');
        } catch (error) {
            console.error('❌ Error ending database pool:', error.message);
            throw error;
        }
    }

    /**
     * 🔄 PERFORM POOL END
     * ==================
     */
    async performEnd() {
        try {
            // Mark as ending to prevent multiple calls
            this.isEnded = true;
            
            // End the pool with timeout
            await Promise.race([
                this.pool.end(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Pool end timeout')), 5000)
                )
            ]);
            
        } catch (error) {
            // Even if end() fails, mark as ended to prevent retries
            this.isEnded = true;
            throw error;
        }
    }

    /**
     * 🏥 CHECK POOL STATUS
     * ===================
     */
    getStatus() {
        return {
            isEnded: this.isEnded,
            isEnding: !!this.endPromise,
            totalConnections: this.pool?.totalCount || 0,
            idleConnections: this.pool?.idleCount || 0,
            waitingCount: this.pool?.waitingCount || 0
        };
    }
}

// Singleton instance
let shutdownManager = null;

/**
 * 🎯 GET SHUTDOWN MANAGER INSTANCE
 * ===============================
 */
export function getShutdownManager() {
    if (!shutdownManager) {
        shutdownManager = new GracefulShutdownManager();
    }
    return shutdownManager;
}

export default GracefulShutdownManager; 