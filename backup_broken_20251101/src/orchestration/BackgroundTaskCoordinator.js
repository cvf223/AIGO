/**
 * 📋 Background Task Coordinator - Ensures tasks start only after system ready
 */

class BackgroundTaskCoordinator {
    constructor() {
        if (BackgroundTaskCoordinator.instance) {
            return BackgroundTaskCoordinator.instance;
        }
        
        this.tasks = new Map();
        this.isSystemReady = false;
        this.pendingTasks = [];
        
        BackgroundTaskCoordinator.instance = this;
    }
    
    registerTask(name, taskFunction, interval, runImmediately = false) {
        const task = {
            name,
            function: taskFunction,
            interval,
            runImmediately,
            timer: null,
            isRunning: false,
            lastRun: null,
            errorCount: 0
        };
        
        this.tasks.set(name, task);
        
        if (this.isSystemReady) {
            this.startTask(task);
        } else {
            this.pendingTasks.push(task);
            console.log(`   ⏳ Task '${name}' registered, waiting for system ready...`);
        }
    }
    
    async startTask(task) {
        console.log(`   ▶️ Starting background task: ${task.name}`);
        
        // Run immediately if requested
        if (task.runImmediately) {
            await this.runTask(task);
        }
        
        // Set up interval
        task.timer = setInterval(async () => {
            await this.runTask(task);
        }, task.interval);
    }
    
    async runTask(task) {
        if (task.isRunning) {
            return; // Skip if already running
        }
        
        task.isRunning = true;
        
        try {
            await task.function();
            task.lastRun = new Date();
            task.errorCount = 0;
        } catch (error) {
            task.errorCount++;
            console.error(`   ❌ Background task '${task.name}' error #${task.errorCount}:`, error.message);
            
            // Stop task if too many errors
            if (task.errorCount > 5) {
                console.error(`   🛑 Stopping task '${task.name}' due to repeated errors`);
                this.stopTask(task.name);
            }
        } finally {
            task.isRunning = false;
        }
    }
    
    stopTask(name) {
        const task = this.tasks.get(name);
        if (task && task.timer) {
            clearInterval(task.timer);
            task.timer = null;
            console.log(`   ⏸️ Stopped background task: ${name}`);
        }
    }
    
    setSystemReady() {
        if (this.isSystemReady) return;
        
        this.isSystemReady = true;
        console.log('\\n🚀 SYSTEM READY - Starting all background tasks...');
        console.log('===================================================');
        
        // Start all pending tasks
        for (const task of this.pendingTasks) {
            this.startTask(task);
        }
        
        this.pendingTasks = [];
        console.log(`   ✅ Started ${this.tasks.size} background tasks\\n`);
    }
    
    getStatus() {
        const status = {
            systemReady: this.isSystemReady,
            totalTasks: this.tasks.size,
            runningTasks: 0,
            pendingTasks: this.pendingTasks.length,
            tasks: []
        };
        
        for (const [name, task] of this.tasks) {
            if (task.timer) status.runningTasks++;
            
            status.tasks.push({
                name,
                isRunning: task.isRunning,
                lastRun: task.lastRun,
                errorCount: task.errorCount,
                hasTimer: !!task.timer
            });
        }
        
        return status;
    }
}

// Export singleton
export const backgroundTaskCoordinator = new BackgroundTaskCoordinator();
export default backgroundTaskCoordinator;
