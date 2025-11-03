/**
 * 🔄 BACKGROUND TASK MANAGER - SAFE DELAYED EXECUTION
 * ====================================================
 * 
 * Prevents background tasks from starting before dependencies ready
 * Wraps all intervals/timeouts in error handlers
 */

export class BackgroundTaskManager {
    constructor() {
        this.tasks = new Map();
        this.isSystemReady = false;
        this.pendingTasks = [];
        
        console.log('🔄 BackgroundTaskManager initialized');
    }
    
    /**
     * Mark system as fully initialized
     */
    setSystemReady() {
        this.isSystemReady = true;
        console.log(`🚀 System ready - starting ${this.pendingTasks.length} pending background tasks`);
        
        // Start all pending tasks
        for (const task of this.pendingTasks) {
            this.startTask(task);
        }
        
        this.pendingTasks = [];
    }
    
    /**
     * Register a background task (delayed start)
     */
    registerTask(taskConfig) {
        const task = {
            id: taskConfig.id || `task_${Date.now()}`,
            name: taskConfig.name || 'unnamed_task',
            handler: taskConfig.handler,
            interval: taskConfig.interval || 60000,
            intervalId: null,
            errorCount: 0,
            maxErrors: 10
        };
        
        this.tasks.set(task.id, task);
        
        if (this.isSystemReady) {
            this.startTask(task);
        } else {
            console.log(`   ⏸️ Task queued (waiting for system ready): ${task.name}`);
            this.pendingTasks.push(task);
        }
        
        return task.id;
    }
    
    /**
     * Start a background task with error handling
     */
    startTask(task) {
        if (task.intervalId) {
            console.warn(`   ⚠️ Task already running: ${task.name}`);
            return;
        }
        
        console.log(`   ▶️ Starting background task: ${task.name} (${task.interval}ms interval)`);
        
        task.intervalId = setInterval(async () => {
            try {
                await task.handler();
                task.errorCount = 0; // Reset on success
            } catch (error) {
                task.errorCount++;
                console.error(`❌ Background task error [${task.name}]: ${error.message}`);
                
                if (task.errorCount >= task.maxErrors) {
                    console.error(`   🛑 Task disabled after ${task.maxErrors} consecutive errors: ${task.name}`);
                    this.stopTask(task.id);
                }
            }
        }, task.interval);
    }
    
    /**
     * Stop a background task
     */
    stopTask(taskId) {
        const task = this.tasks.get(taskId);
        
        if (task && task.intervalId) {
            clearInterval(task.intervalId);
            task.intervalId = null;
            console.log(`   ⏹️ Stopped background task: ${task.name}`);
        }
    }
    
    /**
     * Stop all background tasks
     */
    stopAll() {
        console.log('🛑 Stopping all background tasks...');
        
        for (const [taskId, task] of this.tasks) {
            this.stopTask(taskId);
        }
        
        console.log(`   ✅ Stopped ${this.tasks.size} background tasks`);
    }
}

// Singleton
const backgroundTaskManager = new BackgroundTaskManager();

export default backgroundTaskManager;
export { backgroundTaskManager };

