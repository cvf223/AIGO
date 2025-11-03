/**
 * 🎯 BACKGROUND TASK MANAGER - Production-Grade Task Management
 * =============================================================
 * 
 * Centralized manager for all background tasks with:
 * - Delayed startup until system ready
 * - Error isolation and recovery
 * - Memory monitoring
 * - Task lifecycle management
 * - Graceful shutdown
 */

import { EventEmitter } from 'events';

class BackgroundTaskManager extends EventEmitter {
    constructor() {
        super();
        this.tasks = new Map();
        this.intervals = new Map();
        this.timeouts = new Map();
        this.isSystemReady = false;
        this.pendingTasks = [];
        this.maxTaskMemory = 2 * 1024 * 1024 * 1024; // 2GB per task
        this.errorCounts = new Map();
        this.maxErrors = 5;
    }

    /**
     * 🚀 Mark system as ready and start pending tasks
     */
    setSystemReady() {
        console.log('🎯 Background Task Manager: System ready, starting tasks...');
        this.isSystemReady = true;
        
        // Start all pending tasks
        for (const task of this.pendingTasks) {
            this._startTask(task);
        }
        
        this.pendingTasks = [];
        this.emit('systemReady');
    }

    /**
     * 📝 Register a background task
     */
    registerTask(name, config) {
        const task = {
            name,
            interval: config.interval || 60000, // Default 1 minute
            handler: config.handler,
            immediate: config.immediate || false,
            errorHandler: config.errorHandler || this._defaultErrorHandler.bind(this),
            enabled: config.enabled !== false,
            requiresDB: config.requiresDB || false,
            maxMemory: config.maxMemory || this.maxTaskMemory
        };
        
        this.tasks.set(name, task);
        
        if (this.isSystemReady && task.enabled) {
            this._startTask(task);
        } else if (task.enabled) {
            this.pendingTasks.push(task);
        }
        
        console.log(`   📝 Task registered: ${name} (interval: ${task.interval}ms)`);
    }

    /**
     * 🏃 Start a task with error handling
     */
    _startTask(task) {
        if (!task.enabled) return;
        
        // Create wrapped handler with error isolation
        const wrappedHandler = async () => {
            const startTime = Date.now();
            const startMemory = process.memoryUsage().heapUsed;
            
            try {
                // Check if task requires DB and if it's available
                if (task.requiresDB && !this._isDatabaseAvailable()) {
                    console.warn(`   ⚠️ Task ${task.name} skipped - database unavailable`);
                    return;
                }
                
                // Execute task
                await task.handler();
                
                // Check memory usage
                const memoryUsed = process.memoryUsage().heapUsed - startMemory;
                if (memoryUsed > task.maxMemory) {
                    console.warn(`   ⚠️ Task ${task.name} exceeded memory limit: ${Math.round(memoryUsed / 1024 / 1024)}MB`);
                }
                
                // Reset error count on success
                this.errorCounts.delete(task.name);
                
                // Log execution time
                const duration = Date.now() - startTime;
                if (duration > 5000) {
                    console.warn(`   ⏱️ Slow task detected: ${task.name} took ${duration}ms`);
                }
                
            } catch (error) {
                this._handleTaskError(task, error);
            }
        };
        
        // Run immediately if requested
        if (task.immediate) {
            wrappedHandler();
        }
        
        // Set up interval
        const intervalId = setInterval(wrappedHandler, task.interval);
        this.intervals.set(task.name, intervalId);
        
        console.log(`   ▶️ Task started: ${task.name}`);
    }

    /**
     * ❌ Handle task errors with circuit breaker
     */
    _handleTaskError(task, error) {
        const errorCount = (this.errorCounts.get(task.name) || 0) + 1;
        this.errorCounts.set(task.name, errorCount);
        
        console.error(`   ❌ Task error [${task.name}]:`, error.message);
        
        // Call custom error handler
        task.errorHandler(error);
        
        // Check if we should disable task (circuit breaker)
        if (errorCount >= this.maxErrors) {
            console.error(`   ⚡ Task ${task.name} disabled after ${errorCount} errors`);
            this.stopTask(task.name);
            
            // Schedule retry after cooldown
            setTimeout(() => {
                console.log(`   🔄 Attempting to restart task: ${task.name}`);
                this.errorCounts.delete(task.name);
                if (this.tasks.has(task.name)) {
                    this._startTask(this.tasks.get(task.name));
                }
            }, 300000); // 5 minutes cooldown
        }
        
        this.emit('taskError', { task: task.name, error, count: errorCount });
    }

    /**
     * 🛑 Stop a specific task
     */
    stopTask(name) {
        const intervalId = this.intervals.get(name);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(name);
            console.log(`   ⏹️ Task stopped: ${name}`);
        }
        
        const timeoutId = this.timeouts.get(name);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeouts.delete(name);
        }
    }

    /**
     * 📊 Get task statistics
     */
    getStats() {
        const stats = {
            totalTasks: this.tasks.size,
            runningTasks: this.intervals.size,
            pendingTasks: this.pendingTasks.length,
            errorTasks: this.errorCounts.size,
            systemReady: this.isSystemReady
        };
        
        // Add individual task errors
        stats.errors = {};
        for (const [task, count] of this.errorCounts) {
            stats.errors[task] = count;
        }
        
        return stats;
    }

    /**
     * 🗄️ Check if database is available
     */
    _isDatabaseAvailable() {
        // Check global database connection manager if available
        if (global.dbConnectionManager) {
            return global.dbConnectionManager.isAvailable();
        }
        return false;
    }

    /**
     * 🔧 Default error handler
     */
    _defaultErrorHandler(error) {
        // Default handling - just log
        console.error('   Background task error:', error.message);
        
        // Don't crash the process
        if (error.code === 'ECONNREFUSED' || error.code === '28P01') {
            console.warn('   Database connection issue - task will retry');
        }
    }

    /**
     * 🧹 Run garbage collection if available
     */
    runGarbageCollection() {
        if (global.gc) {
            const before = process.memoryUsage().heapUsed;
            global.gc();
            const after = process.memoryUsage().heapUsed;
            const freed = before - after;
            if (freed > 0) {
                console.log(`   🧹 GC freed ${Math.round(freed / 1024 / 1024)}MB`);
            }
        }
    }

    /**
     * 💾 Monitor memory usage
     */
    startMemoryMonitoring() {
        this.registerTask('memoryMonitor', {
            interval: 30000, // Every 30 seconds
            handler: async () => {
                const usage = process.memoryUsage();
                const heapUsed = Math.round(usage.heapUsed / 1024 / 1024);
                const heapTotal = Math.round(usage.heapTotal / 1024 / 1024);
                const external = Math.round(usage.external / 1024 / 1024);
                const rss = Math.round(usage.rss / 1024 / 1024);
                
                // Log if heap usage is high
                const heapPercent = (usage.heapUsed / usage.heapTotal) * 100;
                if (heapPercent > 80) {
                    console.warn(`   ⚠️ High heap usage: ${heapPercent.toFixed(1)}% (${heapUsed}MB / ${heapTotal}MB)`);
                    this.runGarbageCollection();
                }
                
                // Emit memory stats
                this.emit('memoryStats', {
                    heapUsed,
                    heapTotal,
                    external,
                    rss,
                    heapPercent
                });
            }
        });
    }

    /**
     * 🛑 Shutdown all tasks gracefully
     */
    async shutdown() {
        console.log('🛑 Shutting down background tasks...');
        
        // Stop all intervals
        for (const [name, intervalId] of this.intervals) {
            clearInterval(intervalId);
            console.log(`   ⏹️ Stopped: ${name}`);
        }
        
        // Clear all timeouts
        for (const [name, timeoutId] of this.timeouts) {
            clearTimeout(timeoutId);
        }
        
        // Clear collections
        this.intervals.clear();
        this.timeouts.clear();
        this.tasks.clear();
        this.pendingTasks = [];
        
        this.emit('shutdown');
        console.log('   ✅ All background tasks stopped');
    }
}

// Export singleton instance
const backgroundTaskManager = new BackgroundTaskManager();

// Start memory monitoring by default
backgroundTaskManager.startMemoryMonitoring();

// Register with service registry instead of global
import { serviceRegistry } from '../core/ServiceRegistry.js';
if (serviceRegistry) {
    serviceRegistry.register('backgroundTaskManager', backgroundTaskManager, {
        lazy: false,
        singleton: true,
        critical: false
    });
}

export default backgroundTaskManager;
export { backgroundTaskManager };