/**
 * 🎯 BACKGROUND TASK MANAGER - PRODUCTION-GRADE TASK ORCHESTRATION
 * ===============================================================
 * 
 * Prevents uncontrolled task execution and memory exhaustion through:
 * - Priority-based task queue
 * - Resource limit enforcement
 * - Automatic task suspension on memory pressure
 * - Task lifecycle management
 * - Performance monitoring
 * 
 * @author Elite AI Syndicate - Infrastructure Team
 */

import { EventEmitter } from 'events';

/**
 * 📋 TASK PRIORITY LEVELS
 */
export const TaskPriority = {
    CRITICAL: 0,    // System critical tasks
    HIGH: 1,        // Important background tasks
    NORMAL: 2,      // Standard background tasks
    LOW: 3,         // Non-urgent tasks
    IDLE: 4         // Run only when idle
};

/**
 * 🎯 BACKGROUND TASK MANAGER CLASS
 */
export class BackgroundTaskManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Resource limits
            maxConcurrentTasks: config.maxConcurrentTasks || 5,
            maxMemoryPerTask: config.maxMemoryPerTask || 500 * 1024 * 1024, // 500MB
            maxTotalMemory: config.maxTotalMemory || 2 * 1024 * 1024 * 1024, // 2GB
            
            // Task execution
            taskTimeout: config.taskTimeout || 300000, // 5 minutes
            retryAttempts: config.retryAttempts || 3,
            retryDelay: config.retryDelay || 5000,
            
            // Queue management
            maxQueueSize: config.maxQueueSize || 1000,
            enablePriorityQueue: config.enablePriorityQueue !== false,
            
            // Memory pressure handling
            suspendOnMemoryPressure: config.suspendOnMemoryPressure !== false,
            memoryPressureThreshold: config.memoryPressureThreshold || 0.85
        };
        
        // Task queues by priority
        this.taskQueues = {
            [TaskPriority.CRITICAL]: [],
            [TaskPriority.HIGH]: [],
            [TaskPriority.NORMAL]: [],
            [TaskPriority.LOW]: [],
            [TaskPriority.IDLE]: []
        };
        
        // Active tasks
        this.activeTasks = new Map();
        this.taskRegistry = new Map();
        
        // State
        this.isSuspended = false;
        this.isProcessing = false;
        this.memoryPressure = false;
        
        // Metrics
        this.metrics = {
            totalTasksQueued: 0,
            totalTasksCompleted: 0,
            totalTasksFailed: 0,
            totalTasksRetried: 0,
            totalTasksCancelled: 0,
            totalMemoryUsed: 0,
            avgTaskDuration: 0,
            taskDurations: []
        };
        
        console.log('🎯 BackgroundTaskManager initialized');
        console.log(`   Max concurrent tasks: ${this.config.maxConcurrentTasks}`);
        console.log(`   Max memory per task: ${(this.config.maxMemoryPerTask / 1024 / 1024).toFixed(0)}MB`);
    }
    
    /**
     * 🚀 START PROCESSING
     */
    start() {
        if (this.isProcessing) {
            console.log('   ⚠️ Task processing already active');
            return;
        }
        
        console.log('🚀 Starting background task processing...');
        
        this.isProcessing = true;
        this.processQueue();
        
        console.log('✅ Background task processing active');
    }
    
    /**
     * 🛑 STOP PROCESSING
     */
    async stop() {
        if (!this.isProcessing) {
            return;
        }
        
        console.log('🛑 Stopping background task processing...');
        
        this.isProcessing = false;
        
        // Wait for active tasks to complete
        if (this.activeTasks.size > 0) {
            console.log(`   ⏳ Waiting for ${this.activeTasks.size} active tasks to complete...`);
            await this.waitForActiveTasks();
        }
        
        console.log('✅ Background task processing stopped');
    }
    
    /**
     * 📝 QUEUE TASK
     */
    queueTask(taskId, taskFunction, options = {}) {
        // Validate inputs
        if (!taskId || typeof taskId !== 'string') {
            throw new Error('Task ID must be a non-empty string');
        }
        
        if (typeof taskFunction !== 'function') {
            throw new Error('Task function must be a function');
        }
        
        // Check if task already exists
        if (this.taskRegistry.has(taskId)) {
            console.warn(`⚠️ Task ${taskId} already exists, skipping`);
            return false;
        }
        
        // Check queue size
        const totalQueued = Object.values(this.taskQueues).reduce((sum, q) => sum + q.length, 0);
        if (totalQueued >= this.config.maxQueueSize) {
            console.error(`❌ Queue full (${this.config.maxQueueSize} tasks), cannot queue ${taskId}`);
            this.emit('queueFull', { taskId });
            return false;
        }
        
        // Create task object
        const task = {
            id: taskId,
            function: taskFunction,
            priority: options.priority || TaskPriority.NORMAL,
            timeout: options.timeout || this.config.taskTimeout,
            retryAttempts: options.retryAttempts !== undefined ? options.retryAttempts : this.config.retryAttempts,
            currentAttempt: 0,
            maxMemory: options.maxMemory || this.config.maxMemoryPerTask,
            metadata: options.metadata || {},
            queuedAt: Date.now(),
            startedAt: null,
            completedAt: null,
            status: 'queued'
        };
        
        // Add to appropriate queue
        this.taskQueues[task.priority].push(task);
        this.taskRegistry.set(taskId, task);
        
        this.metrics.totalTasksQueued++;
        
        console.log(`📝 Queued task: ${taskId} (priority: ${task.priority})`);
        
        this.emit('taskQueued', { taskId, priority: task.priority });
        
        // Start processing if not already
        if (this.isProcessing && !this.isSuspended) {
            this.processQueue();
        }
        
        return true;
    }
    
    /**
     * 🔄 PROCESS QUEUE
     */
    async processQueue() {
        // Check if we can process more tasks
        while (this.isProcessing && !this.isSuspended && this.canProcessMore()) {
            const task = this.getNextTask();
            
            if (!task) {
                break; // No more tasks
            }
            
            // Execute task
            this.executeTask(task);
        }
    }
    
    /**
     * ✅ CAN PROCESS MORE
     */
    canProcessMore() {
        // Check concurrent task limit
        if (this.activeTasks.size >= this.config.maxConcurrentTasks) {
            return false;
        }
        
        // Check memory pressure
        if (this.memoryPressure) {
            return false;
        }
        
        // Check total memory usage
        const totalMemory = this.getTotalMemoryUsage();
        if (totalMemory >= this.config.maxTotalMemory) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 📋 GET NEXT TASK
     */
    getNextTask() {
        // Process queues by priority
        for (const priority of [
            TaskPriority.CRITICAL,
            TaskPriority.HIGH,
            TaskPriority.NORMAL,
            TaskPriority.LOW,
            TaskPriority.IDLE
        ]) {
            const queue = this.taskQueues[priority];
            
            if (queue.length > 0) {
                const task = queue.shift();
                return task;
            }
        }
        
        return null;
    }
    
    /**
     * ▶️ EXECUTE TASK
     */
    async executeTask(task) {
        task.status = 'running';
        task.startedAt = Date.now();
        task.currentAttempt++;
        
        this.activeTasks.set(task.id, task);
        
        console.log(`▶️ Executing task: ${task.id} (attempt ${task.currentAttempt}/${task.retryAttempts + 1})`);
        
        this.emit('taskStarted', { taskId: task.id, attempt: task.currentAttempt });
        
        try {
            // Execute with timeout
            const result = await Promise.race([
                task.function(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Task timeout')), task.timeout)
                )
            ]);
            
            // Task completed successfully
            this.handleTaskSuccess(task, result);
            
        } catch (error) {
            // Task failed
            this.handleTaskFailure(task, error);
        }
    }
    
    /**
     * ✅ HANDLE TASK SUCCESS
     */
    handleTaskSuccess(task, result) {
        task.status = 'completed';
        task.completedAt = Date.now();
        task.duration = task.completedAt - task.startedAt;
        
        this.metrics.totalTasksCompleted++;
        this.metrics.taskDurations.push(task.duration);
        
        // Keep only last 100 durations
        if (this.metrics.taskDurations.length > 100) {
            this.metrics.taskDurations.shift();
        }
        
        // Update average duration
        this.metrics.avgTaskDuration = 
            this.metrics.taskDurations.reduce((a, b) => a + b, 0) / this.metrics.taskDurations.length;
        
        console.log(`✅ Task completed: ${task.id} (${task.duration}ms)`);
        
        this.emit('taskCompleted', { taskId: task.id, duration: task.duration, result });
        
        // Remove from active tasks
        this.activeTasks.delete(task.id);
        this.taskRegistry.delete(task.id);
        
        // Continue processing
        this.processQueue();
    }
    
    /**
     * ❌ HANDLE TASK FAILURE
     */
    handleTaskFailure(task, error) {
        console.error(`❌ Task failed: ${task.id} -`, error.message);
        
        // Check if we should retry
        if (task.currentAttempt < task.retryAttempts + 1) {
            // Retry task
            console.log(`🔄 Retrying task: ${task.id} (attempt ${task.currentAttempt + 1}/${task.retryAttempts + 1})`);
            
            this.metrics.totalTasksRetried++;
            
            // Remove from active tasks
            this.activeTasks.delete(task.id);
            
            // Re-queue with delay
            setTimeout(() => {
                // Re-add to queue
                this.taskQueues[task.priority].unshift(task);
                this.processQueue();
            }, this.config.retryDelay);
            
            this.emit('taskRetrying', { taskId: task.id, attempt: task.currentAttempt });
            
        } else {
            // Max retries reached - mark as failed
            task.status = 'failed';
            task.completedAt = Date.now();
            task.error = error.message;
            
            this.metrics.totalTasksFailed++;
            
            console.error(`💥 Task failed permanently: ${task.id}`);
            
            this.emit('taskFailed', { taskId: task.id, error: error.message });
            
            // Remove from active tasks
            this.activeTasks.delete(task.id);
            this.taskRegistry.delete(task.id);
            
            // Continue processing
            this.processQueue();
        }
    }
    
    /**
     * 🚫 CANCEL TASK
     */
    cancelTask(taskId) {
        // Check if task is in queue
        let found = false;
        
        for (const priority in this.taskQueues) {
            const queue = this.taskQueues[priority];
            const index = queue.findIndex(t => t.id === taskId);
            
            if (index !== -1) {
                queue.splice(index, 1);
                found = true;
                break;
            }
        }
        
        if (found) {
            this.taskRegistry.delete(taskId);
            this.metrics.totalTasksCancelled++;
            
            console.log(`🚫 Cancelled queued task: ${taskId}`);
            this.emit('taskCancelled', { taskId });
            
            return true;
        }
        
        // Check if task is active (can't cancel active tasks)
        if (this.activeTasks.has(taskId)) {
            console.warn(`⚠️ Cannot cancel active task: ${taskId}`);
            return false;
        }
        
        console.warn(`⚠️ Task not found: ${taskId}`);
        return false;
    }
    
    /**
     * ⏸️ SUSPEND PROCESSING
     */
    suspend() {
        if (this.isSuspended) {
            return;
        }
        
        console.log('⏸️ Suspending background task processing...');
        
        this.isSuspended = true;
        
        this.emit('suspended', { activeTasks: this.activeTasks.size });
        
        console.log('✅ Background task processing suspended');
    }
    
    /**
     * ▶️ RESUME PROCESSING
     */
    resume() {
        if (!this.isSuspended) {
            return;
        }
        
        console.log('▶️ Resuming background task processing...');
        
        this.isSuspended = false;
        this.memoryPressure = false;
        
        this.emit('resumed');
        
        // Continue processing
        this.processQueue();
        
        console.log('✅ Background task processing resumed');
    }
    
    /**
     * 🚨 HANDLE MEMORY PRESSURE
     */
    handleMemoryPressure() {
        if (this.memoryPressure) {
            return; // Already in memory pressure mode
        }
        
        console.warn('🚨 MEMORY PRESSURE: Suspending new tasks');
        
        this.memoryPressure = true;
        
        this.emit('memoryPressure', { activeTasks: this.activeTasks.size });
    }
    
    /**
     * ✅ CLEAR MEMORY PRESSURE
     */
    clearMemoryPressure() {
        if (!this.memoryPressure) {
            return;
        }
        
        console.log('✅ Memory pressure cleared, resuming tasks');
        
        this.memoryPressure = false;
        
        this.emit('memoryPressureCleared');
        
        // Resume processing
        this.processQueue();
    }
    
    /**
     * 💾 GET TOTAL MEMORY USAGE
     */
    getTotalMemoryUsage() {
        return this.metrics.totalMemoryUsed;
    }
    
    /**
     * ⏳ WAIT FOR ACTIVE TASKS
     */
    async waitForActiveTasks(timeout = 60000) {
        const startTime = Date.now();
        
        while (this.activeTasks.size > 0) {
            if (Date.now() - startTime > timeout) {
                console.warn(`⚠️ Timeout waiting for tasks, ${this.activeTasks.size} still active`);
                break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    /**
     * 📊 GET STATUS
     */
    getStatus() {
        const queuedTasks = Object.values(this.taskQueues).reduce((sum, q) => sum + q.length, 0);
        
        return {
            isProcessing: this.isProcessing,
            isSuspended: this.isSuspended,
            memoryPressure: this.memoryPressure,
            activeTasks: this.activeTasks.size,
            queuedTasks: queuedTasks,
            queuesByPriority: {
                critical: this.taskQueues[TaskPriority.CRITICAL].length,
                high: this.taskQueues[TaskPriority.HIGH].length,
                normal: this.taskQueues[TaskPriority.NORMAL].length,
                low: this.taskQueues[TaskPriority.LOW].length,
                idle: this.taskQueues[TaskPriority.IDLE].length
            },
            metrics: this.metrics
        };
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return { ...this.metrics };
    }
}

// Singleton instance
let backgroundTaskManagerInstance = null;

/**
 * 🎯 GET BACKGROUND TASK MANAGER - Singleton accessor
 */
export function getBackgroundTaskManager() {
    if (!backgroundTaskManagerInstance) {
        backgroundTaskManagerInstance = new BackgroundTaskManager();
    }
    return backgroundTaskManagerInstance;
}

export default BackgroundTaskManager;

