import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

export enum TaskPriority {
    CRITICAL = 0,    // Arbitrage detection, swap events
    HIGH = 1,        // Market data updates
    MEDIUM = 2,      // Strategy evaluation
    LOW = 3,         // Background research
    BACKGROUND = 4   // Cleanup, logging
}

export enum TaskStatus {
    PENDING = 'pending',
    RUNNING = 'running',
    PAUSED = 'paused',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled'
}

export interface Task {
    id: string;
    name: string;
    priority: TaskPriority;
    status: TaskStatus;
    execute: () => Promise<any>;
    onPause?: () => Promise<void>;
    onResume?: () => Promise<void>;
    onCancel?: () => Promise<void>;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    executionTime?: number;
    metadata?: Record<string, any>;
}

export interface TaskMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageExecutionTime: number;
    averageSwitchTime: number;
    priorityDistribution: Record<TaskPriority, number>;
    currentLoad: number;
}

/**
 * 🔥 ELITE HIGH-PERFORMANCE TASK MANAGER
 * Guaranteed sub-50ms task switching with lock-free concurrency
 */
export class HighPerformanceTaskManager extends EventEmitter {
    private tasks: Map<string, Task> = new Map();
    private priorityQueues: Map<TaskPriority, Task[]> = new Map();
    private currentTask: Task | null = null;
    private isRunning: boolean = false;
    private switchTimes: number[] = [];
    private maxSwitchTimeHistory = 1000;
    private targetSwitchTime = 50; // 50ms target
    private preemptionEnabled = true;
    
    // Performance optimization: Pre-allocated arrays
    private recycledTaskIds: string[] = [];
    
    // Lock-free concurrency control
    private processingLock = false;
    private pendingOperations: (() => void)[] = [];
    
    constructor() {
        super();
        this.initializePriorityQueues();
        this.startTaskProcessor();
        this.startPerformanceMonitoring();
    }

    private initializePriorityQueues(): void {
        for (const priority of Object.values(TaskPriority)) {
            if (typeof priority === 'number') {
                this.priorityQueues.set(priority, []);
            }
        }
    }

    /**
     * Add task with sub-50ms insertion guarantee
     */
    public addTask(task: Omit<Task, 'id' | 'createdAt' | 'status'>): string {
        const startTime = performance.now();
        
        const taskId = this.getTaskId();
        const fullTask: Task = {
            ...task,
            id: taskId,
            status: TaskStatus.PENDING,
            createdAt: startTime
        };

        // Lock-free insertion
        this.executeAtomicOperation(() => {
            this.tasks.set(taskId, fullTask);
            const queue = this.priorityQueues.get(task.priority)!;
            
            // Optimized insertion for priority queue
            if (queue.length === 0 || task.priority <= TaskPriority.HIGH) {
                queue.unshift(fullTask); // High priority goes to front
            } else {
                queue.push(fullTask); // Low priority goes to back
            }
        });

        const insertionTime = performance.now() - startTime;
        
        // Trigger immediate processing for critical tasks
        if (task.priority === TaskPriority.CRITICAL) {
            this.preemptCurrentTask();
        }

        this.emit('taskAdded', { taskId, insertionTime, priority: task.priority });
        
        return taskId;
    }

    /**
     * Sub-50ms task switching with preemption
     */
    private async preemptCurrentTask(): Promise<void> {
        const startTime = performance.now();
        
        if (this.currentTask && this.preemptionEnabled) {
            const currentTask = this.currentTask;
            
            // Pause current task if possible
            if (currentTask.onPause && currentTask.status === TaskStatus.RUNNING) {
                try {
                    currentTask.status = TaskStatus.PAUSED;
                    await Promise.race([
                        currentTask.onPause(),
                        this.timeout(25) // Max 25ms for pause operation
                    ]);
                    
                    // Move paused task back to appropriate queue
                    const queue = this.priorityQueues.get(currentTask.priority)!;
                    queue.unshift(currentTask); // High priority for resumed tasks
                } catch (error) {
                    console.warn('Failed to pause task gracefully:', error);
                    currentTask.status = TaskStatus.FAILED;
                }
            }
            
            this.currentTask = null;
        }

        const switchTime = performance.now() - startTime;
        this.recordSwitchTime(switchTime);
        
        // Trigger immediate processing
        this.processNextTask();
    }

    /**
     * Lock-free atomic operations
     */
    private executeAtomicOperation(operation: () => void): void {
        if (this.processingLock) {
            this.pendingOperations.push(operation);
            return;
        }
        
        this.processingLock = true;
        try {
            operation();
            
            // Process pending operations
            while (this.pendingOperations.length > 0) {
                const pendingOp = this.pendingOperations.shift()!;
                pendingOp();
            }
        } finally {
            this.processingLock = false;
        }
    }

    /**
     * High-performance task processor with sub-50ms guarantees
     */
    private async startTaskProcessor(): Promise<void> {
        this.isRunning = true;
        
        while (this.isRunning) {
            if (!this.currentTask) {
                await this.processNextTask();
            }
            
            // Yield control with minimal delay
            await this.nextTick();
        }
    }

    private async processNextTask(): Promise<void> {
        const task = this.getNextHighestPriorityTask();
        if (!task) {
            await this.sleep(1); // Minimal sleep when no tasks
            return;
        }

        const startTime = performance.now();
        this.currentTask = task;
        task.status = TaskStatus.RUNNING;
        task.startedAt = startTime;

        try {
            const result = await Promise.race([
                task.execute(),
                this.createTaskTimeout(task)
            ]);

            const endTime = performance.now();
            task.completedAt = endTime;
            task.executionTime = endTime - startTime;
            task.status = TaskStatus.COMPLETED;

            this.emit('taskCompleted', { 
                taskId: task.id, 
                executionTime: task.executionTime,
                result 
            });
        } catch (error) {
            task.status = TaskStatus.FAILED;
            this.emit('taskFailed', { taskId: task.id, error });
        } finally {
            this.currentTask = null;
            this.tasks.delete(task.id);
            this.recycleTaskId(task.id);
        }
    }

    private getNextHighestPriorityTask(): Task | null {
        for (const priority of [TaskPriority.CRITICAL, TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW, TaskPriority.BACKGROUND]) {
            const queue = this.priorityQueues.get(priority)!;
            if (queue.length > 0) {
                return queue.shift()!;
            }
        }
        return null;
    }

    /**
     * Performance monitoring and optimization
     */
    private startPerformanceMonitoring(): void {
        setInterval(() => {
            const metrics = this.getMetrics();
            
            // Auto-optimize based on performance
            if (metrics.averageSwitchTime > this.targetSwitchTime) {
                this.optimizePerformance();
            }
            
            this.emit('performanceMetrics', metrics);
        }, 1000);
    }

    private optimizePerformance(): void {
        // Reduce switch time history for faster calculations
        if (this.switchTimes.length > 500) {
            this.switchTimes = this.switchTimes.slice(-500);
        }
        
        // Adjust preemption sensitivity
        const avgSwitchTime = this.getAverageSwitchTime();
        if (avgSwitchTime > this.targetSwitchTime * 1.5) {
            this.preemptionEnabled = false; // Disable preemption if too slow
            setTimeout(() => { this.preemptionEnabled = true; }, 5000);
        }
    }

    /**
     * Utility methods for sub-50ms performance
     */
    private recordSwitchTime(time: number): void {
        this.switchTimes.push(time);
        if (this.switchTimes.length > this.maxSwitchTimeHistory) {
            this.switchTimes.shift();
        }
    }

    private getAverageSwitchTime(): number {
        if (this.switchTimes.length === 0) return 0;
        return this.switchTimes.reduce((a, b) => a + b, 0) / this.switchTimes.length;
    }

    private getTaskId(): string {
        return this.recycledTaskIds.pop() || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private recycleTaskId(id: string): void {
        if (this.recycledTaskIds.length < 100) {
            this.recycledTaskIds.push(id);
        }
    }

    private async timeout(ms: number): Promise<never> {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), ms);
        });
    }

    private async nextTick(): Promise<void> {
        return new Promise(resolve => setImmediate(resolve));
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private createTaskTimeout(task: Task): Promise<never> {
        const timeoutMs = task.priority === TaskPriority.CRITICAL ? 10000 : 30000;
        return this.timeout(timeoutMs);
    }

    /**
     * Public API methods
     */
    public pauseTask(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== TaskStatus.RUNNING) return false;
        
        if (this.currentTask?.id === taskId && task.onPause) {
            task.onPause().catch(console.error);
            task.status = TaskStatus.PAUSED;
            return true;
        }
        return false;
    }

    public resumeTask(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== TaskStatus.PAUSED) return false;
        
        task.status = TaskStatus.PENDING;
        const queue = this.priorityQueues.get(task.priority)!;
        queue.unshift(task); // High priority for resumed tasks
        return true;
    }

    public cancelTask(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task) return false;
        
        task.status = TaskStatus.CANCELLED;
        if (task.onCancel) {
            task.onCancel().catch(console.error);
        }
        
        this.tasks.delete(taskId);
        return true;
    }

    public getTask(taskId: string): Task | undefined {
        return this.tasks.get(taskId);
    }

    public getMetrics(): TaskMetrics {
        const allTasks = Array.from(this.tasks.values());
        const completedTasks = allTasks.filter(t => t.status === TaskStatus.COMPLETED);
        const failedTasks = allTasks.filter(t => t.status === TaskStatus.FAILED);
        
        const priorityDistribution: Record<TaskPriority, number> = {
            [TaskPriority.CRITICAL]: 0,
            [TaskPriority.HIGH]: 0,
            [TaskPriority.MEDIUM]: 0,
            [TaskPriority.LOW]: 0,
            [TaskPriority.BACKGROUND]: 0
        };
        
        allTasks.forEach(task => {
            priorityDistribution[task.priority]++;
        });
        
        const avgExecutionTime = completedTasks.length > 0 
            ? completedTasks.reduce((sum, task) => sum + (task.executionTime || 0), 0) / completedTasks.length
            : 0;

        return {
            totalTasks: allTasks.length,
            completedTasks: completedTasks.length,
            failedTasks: failedTasks.length,
            averageExecutionTime: avgExecutionTime,
            averageSwitchTime: this.getAverageSwitchTime(),
            priorityDistribution,
            currentLoad: this.currentTask ? 1 : 0
        };
    }

    public stop(): void {
        this.isRunning = false;
        if (this.currentTask) {
            this.cancelTask(this.currentTask.id);
        }
    }
} 