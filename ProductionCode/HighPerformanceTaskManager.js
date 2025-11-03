/**
 * HighPerformanceTaskManager.js
 * 
 * Manages high-performance task switching for the Legendary Arbitrage Syndicate.
 * Implements different preemption strategies based on task priority and opportunity impact.
 */

import { EventEmitter } from 'events';
import {
  IMPACT_THRESHOLDS,
  calculateImpact,
  calculateImpactLevel,
  shouldPreemptMemoryOperation
} from './opportunity-impact-config.js';// Task priority levels
const TaskPriority = {
  CRITICAL: 'CRITICAL',   // Cannot be interrupted
  HIGH: 'HIGH',           // Can be interrupted only for high-impact opportunities
  MEDIUM: 'MEDIUM',       // Can be interrupted for medium-impact opportunities
  LOW: 'LOW',             // Can be interrupted for any opportunity
  BACKGROUND: 'BACKGROUND' // Always interruptible
};

// Preemption strategies
const PreemptionStrategy = {
  NONE: 'NONE',               // Do not preempt, wait for completion
  CHECKPOINT: 'CHECKPOINT',   // Wait for next checkpoint
  SAVE_STATE: 'SAVE_STATE',   // Save state and preempt
  FORCE: 'FORCE',             // Force immediate preemption
  PARTIAL: 'PARTIAL'          // Save partial state and preempt
};

class HighPerformanceTaskManager extends EventEmitter {
  /**
   * Create a new HighPerformanceTaskManager
   * @param {object} options - Configuration options
   */
  constructor({
    metrics = null,
    logger = console,
    config = {}
  } = {}) {
    super();
    
    // Store dependencies
    this.metrics = metrics;
    this.logger = logger;
    
    // Configuration with defaults
    this.config = {
      maxConcurrentTasks: 4,
      taskQueueSize: 100,
      checkpointIntervalMs: 50, // 50ms between checkpoints
      forcePreemptTimeoutMs: 5000, // 5s max wait for force preempt
      ...config
    };
    
    // Initialize state
    this.activeTasks = new Map();
    this.taskQueue = [];
    this.memoryOperations = new Map();
    this.preemptionCallbacks = new Map();
    
    // Initialize metrics
    this.taskMetrics = {
      totalTasks: 0,
      completedTasks: 0,
      preemptedTasks: 0,
      failedTasks: 0,
      totalTaskTimeMs: 0,
      averageTaskTimeMs: 0
    };
    
    this.logger.log('🚀 HighPerformanceTaskManager initialized with impact thresholds:', {
      negligible: IMPACT_THRESHOLDS.NEGLIGIBLE,
      low: IMPACT_THRESHOLDS.LOW,
      medium: IMPACT_THRESHOLDS.MEDIUM,
      high: IMPACT_THRESHOLDS.HIGH,
      critical: IMPACT_THRESHOLDS.CRITICAL
    });
  }
  
  /**
   * Generate a unique task ID
   * @returns {string} Unique task ID
   * @private
   */
  _generateTaskId() {
    return `task_${Date.now()}_${this.taskIdCounter++}`;
  }
  
  /**
   * Add a new task to the system
   * @param {object} taskConfig - Task configuration
   * @param {string} taskConfig.name - Task name
   * @param {string} taskConfig.description - Task description
   * @param {number} taskConfig.priority - Task priority (from TaskPriority enum)
   * @param {Function} taskConfig.execute - Task execution function
   * @param {Function} taskConfig.onPause - Function called when task is paused (optional)
   * @param {Function} taskConfig.onResume - Function called when task is resumed (optional)
   * @param {Function} taskConfig.onCancel - Function called when task is cancelled (optional)
   * @param {Function} taskConfig.onForcePreempt - Function called when task is force preempted (optional)
   * @param {boolean} taskConfig.uninterruptible - Whether the task cannot be interrupted
   * @param {object} taskConfig.metadata - Additional task metadata
   * @returns {string} Task ID
   */
  addTask({
    name,
    description = '',
    priority = TaskPriority.NORMAL,
    execute,
    onPause = null,
    onResume = null,
    onCancel = null,
    onForcePreempt = null,
    uninterruptible = false,
    metadata = {}
  }) {
    // Generate a unique ID for this task
    const taskId = this._generateTaskId();
    
    // Create task object
    const task = {
      id: taskId,
      name,
      description,
      priority,
      execute,
      onPause,
      onResume,
      onCancel,
      onForcePreempt,
      uninterruptible,
      metadata,
      status: 'pending',
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      result: null,
      error: null
    };
    
    // Store the task
    this.tasks.set(taskId, task);
    
    // Add to queue based on priority
    this._addToQueue(task);
    
    // Log task creation
    this.logger.log(`📋 Task created: ${name} (${taskId}) with priority ${priority}`);
    
    // Record metrics
    if (this.metrics) {
      this.metrics.recordTaskCreation({
        taskId,
        taskName: name,
        priority
      });
    }
    
    // Emit task added event
    this.emit('taskAdded', { taskId, taskName: name, priority });
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this._processNextTask();
    }
    
    return taskId;
  }
  
  /**
   * Add task to queue based on priority
   * @param {object} task - Task object
   * @private
   */
  _addToQueue(task) {
    // Find position based on priority (higher priority first)
    let insertIndex = this.taskQueue.length;
    
    for (let i = 0; i < this.taskQueue.length; i++) {
      const queuedTaskId = this.taskQueue[i];
      const queuedTask = this.tasks.get(queuedTaskId);
      
      if (task.priority > queuedTask.priority) {
        insertIndex = i;
        break;
      }
    }
    
    // Insert at the determined position
    this.taskQueue.splice(insertIndex, 0, task.id);
    
    // Log queue position
    this.logger.log(`📊 Task ${task.id} added to queue at position ${insertIndex + 1}/${this.taskQueue.length}`);
  }
  
  /**
   * Process the next task in the queue
   * @private
   */
  async _processNextTask() {
    // Skip if already processing or queue is empty
    if (this.isProcessing || this.taskQueue.length === 0) {
      return;
    }
    
    // Mark as processing
    this.isProcessing = true;
    
    try {
      // Get the next task ID from queue
      const taskId = this.taskQueue.shift();
      const task = this.tasks.get(taskId);
      
      if (!task) {
        this.logger.error(`❌ Task ${taskId} not found in task map`);
        this.isProcessing = false;
        return;
      }
      
      // Update task status
      task.status = 'running';
      task.startedAt = Date.now();
      
      // Set as current task
      this.currentTask = task;
      
      // Log task start
      this.logger.log(`▶️ Starting task: ${task.name} (${taskId})`);
      
      // Record metrics
      if (this.metrics) {
        this.metrics.recordTaskStart({
          taskId,
          taskName: task.name
        });
      }
      
      // Emit task started event
      this.emit('taskStarted', { taskId, taskName: task.name });
      
      try {
        // Execute the task with timeout
        const result = await this._executeWithTimeout(task);
        
        // Update task with result
        task.status = 'completed';
        task.completedAt = Date.now();
        task.result = result;
        
        // Log task completion
        this.logger.log(`✅ Task completed: ${task.name} (${taskId})`);
        
        // Record metrics
        if (this.metrics) {
          this.metrics.recordTaskCompletion({
            taskId,
            taskName: task.name,
            durationMs: task.completedAt - task.startedAt
          });
        }
        
        // Emit task completed event
        this.emit('taskCompleted', {
          taskId,
          taskName: task.name,
          durationMs: task.completedAt - task.startedAt,
          result
        });
      } catch (error) {
        // Update task with error
        task.status = 'failed';
        task.completedAt = Date.now();
        task.error = error.message;
        
        // Log task failure
        this.logger.error(`❌ Task failed: ${task.name} (${taskId})`, error);
        
        // Record metrics
        if (this.metrics) {
          this.metrics.recordTaskFailure({
            taskId,
            taskName: task.name,
            error: error.message,
            durationMs: task.completedAt - task.startedAt
          });
        }
        
        // Emit task failed event
        this.emit('taskFailed', {
          taskId,
          taskName: task.name,
          error: error.message,
          durationMs: task.completedAt - task.startedAt
        });
      } finally {
        // Clear current task if it's still this one
        if (this.currentTask && this.currentTask.id === taskId) {
          this.currentTask = null;
        }
      }
    } finally {
      // Mark as not processing
      this.isProcessing = false;
      
      // Process next task if queue not empty
      if (this.taskQueue.length > 0) {
        setImmediate(() => this._processNextTask());
      }
    }
  }
  
  /**
   * Execute a task with timeout
   * @param {object} task - Task object
   * @returns {Promise<any>} Task result
   * @private
   */
  _executeWithTimeout(task) {
    return new Promise((resolve, reject) => {
      // Create timeout if configured
      const timeoutId = this.config.taskTimeoutMs > 0
        ? setTimeout(() => {
            reject(new Error(`Task ${task.id} timed out after ${this.config.taskTimeoutMs}ms`));
          }, this.config.taskTimeoutMs)
        : null;
      
      // Execute the task
      Promise.resolve(task.execute())
        .then(result => {
          // Clear timeout if set
          if (timeoutId) clearTimeout(timeoutId);
          
          // Resolve with result
          resolve(result);
        })
        .catch(error => {
          // Clear timeout if set
          if (timeoutId) clearTimeout(timeoutId);
          
          // Reject with error
          reject(error);
        });
    });
  }
  
  /**
   * Stop a task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>} Whether the task was stopped
   * @private
   */
  async _stopTask(taskId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      this.logger.error(`❌ Task ${taskId} not found for stopping`);
      return false;
    }
    
    // Update task status
    task.status = 'stopped';
    task.completedAt = Date.now();
    
    // Call onCancel if available
    if (typeof task.onCancel === 'function') {
      try {
        await task.onCancel();
      } catch (error) {
        this.logger.error(`Error in onCancel for task ${taskId}:`, error);
      }
    }
    
    // Log task stop
    this.logger.log(`⏹️ Task stopped: ${task.name} (${taskId})`);
    
    // Record metrics
    if (this.metrics) {
      this.metrics.recordTaskStopped({
        taskId,
        taskName: task.name,
        durationMs: task.completedAt - task.startedAt
      });
    }
    
    // Emit task stopped event
    this.emit('taskStopped', {
      taskId,
      taskName: task.name,
      durationMs: task.completedAt - task.startedAt
    });
    
    return true;
  }
  
  /**
   * Force stop a task by ID (more aggressive than _stopTask)
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>} Whether the task was force stopped
   * @private
   */
  async _forceStopTask(taskId) {
    const task = this.tasks.get(taskId);
    
    if (!task) {
      this.logger.error(`❌ Task ${taskId} not found for force stopping`);
      return false;
    }
    
    // Update task status
    task.status = 'force_stopped';
    task.completedAt = Date.now();
    
    // Log task force stop
    this.logger.log(`🛑 Task force stopped: ${task.name} (${taskId})`);
    
    // Record metrics
    if (this.metrics) {
      this.metrics.recordTaskForceStopped({
        taskId,
        taskName: task.name,
        durationMs: task.completedAt - task.startedAt
      });
    }
    
    // Emit task force stopped event
    this.emit('taskForceStopped', {
      taskId,
      taskName: task.name,
      durationMs: task.completedAt - task.startedAt
    });
    
    return true;
  }
  
  /**
   * Wait for a task to complete
   * @param {string} taskId - Task ID
   * @returns {Promise<any>} Task result
   * @private
   */
  _waitForTaskCompletion(taskId) {
    return new Promise((resolve, reject) => {
      const task = this.tasks.get(taskId);
      
      if (!task) {
        return reject(new Error(`Task ${taskId} not found`));
      }
      
      // If task already completed, return result or error
      if (task.status === 'completed') {
        return resolve(task.result);
      } else if (task.status === 'failed') {
        return reject(new Error(task.error));
      }
      
      // Otherwise wait for completion
      const onComplete = ({ taskId: completedTaskId, result }) => {
        if (completedTaskId === taskId) {
          this.removeListener('taskCompleted', onComplete);
          this.removeListener('taskFailed', onFail);
          resolve(result);
        }
      };
      
      const onFail = ({ taskId: failedTaskId, error }) => {
        if (failedTaskId === taskId) {
          this.removeListener('taskCompleted', onComplete);
          this.removeListener('taskFailed', onFail);
          reject(new Error(error));
        }
      };
      
      // Listen for task completion or failure
      this.on('taskCompleted', onComplete);
      this.on('taskFailed', onFail);
    });
  }
  
  /**
   * Get the current task state
   * @returns {object|null} Current task state or null if no task running
   */
  getCurrentTaskState() {
    if (!this.currentTask) {
      return null;
    }
    
    return {
      id: this.currentTask.id,
      name: this.currentTask.name,
      status: this.currentTask.status,
      startedAt: this.currentTask.startedAt,
      type: this.currentTask.metadata?.type || 'unknown',
      category: this.currentTask.metadata?.category || 'unknown',
      metadata: this.currentTask.metadata
    };
  }
  
  /**
   * Preempt the current task with a new high-priority task
   * @param {object} options - Preemption options
   * @param {string} options.newTaskType - Type of the new task
   * @param {object} options.newTaskData - Data for the new task
   * @param {string} options.strategy - Preemption strategy: 'standard', 'preempt', 'force_preempt', 'wait_completion'
   * @param {object} options.metadata - Additional metadata
   * @returns {Promise<object>} Preemption result
   */
  async preemptCurrentTask({
    newTaskType,
    newTaskData,
    strategy = 'standard',
    metadata = {}
  }) {
    // Record preemption start time
    const preemptionStartTime = performance.now();
    
    // Get current task
    const currentTask = this.currentTask;
    
    // If no current task, nothing to preempt
    if (!currentTask) {
      this.logger.log('No current task to preempt');
      return { preempted: false, reason: 'no_current_task' };
    }
    
    // Log preemption
    this.logger.log(`🔄 Preempting task ${currentTask.id} (${currentTask.name}) with strategy: ${strategy}`);
    
    // Save current task state
    this.preemptedTask = {
      ...currentTask,
      preemptedAt: Date.now(),
      preemptionStrategy: strategy,
      resumeData: {
        // Any data needed for resumption
      }
    };
    
    // Handle different preemption strategies
    switch (strategy) {
      case 'wait_completion':
        // For critical operations (Tier 1 memory), wait for completion
        this.logger.log(`⏳ Waiting for critical operation to complete before switching...`);
        await this._waitForTaskCompletion(currentTask.id);
        break;
        
      case 'force_preempt':
        // For Tier 2 memory operations that can be interrupted but should be handled carefully
        this.logger.log(`⚠️ Force preempting task ${currentTask.id} (important but not critical)`);
        
        // Signal task to save partial state if possible
        if (typeof currentTask.onForcePreempt === 'function') {
          try {
            await currentTask.onForcePreempt();
          } catch (error) {
            this.logger.error(`Error during force preemption callback:`, error);
          }
        }
        
        // Force stop the task
        await this._forceStopTask(currentTask.id);
        break;
        
      case 'preempt':
        // Standard preemption for Tier 3 or non-memory tasks
        this.logger.log(`🛑 Standard preemption of task ${currentTask.id}`);
        
        // Pause the current task if it supports pausing
        if (typeof currentTask.onPause === 'function') {
          try {
            await currentTask.onPause();
          } catch (error) {
            this.logger.error(`Error pausing task:`, error);
          }
        }
        
        // Stop the current task
        await this._stopTask(currentTask.id);
        break;
        
      case 'standard':
      default:
        // Default behavior - determine strategy based on task properties
        if (currentTask.uninterruptible) {
          this.logger.log(`⏳ Waiting for uninterruptible task to complete...`);
          await this._waitForTaskCompletion(currentTask.id);
        } else {
          this.logger.log(`🛑 Preempting interruptible task ${currentTask.id}`);
          
          // Pause the current task if it supports pausing
          if (typeof currentTask.onPause === 'function') {
            try {
              await currentTask.onPause();
            } catch (error) {
              this.logger.error(`Error pausing task:`, error);
            }
          }
          
          // Stop the current task
          await this._stopTask(currentTask.id);
        }
        break;
    }
    
    // Clear current task
    this.currentTask = null;
    
    // Calculate preemption time
    const preemptionTime = performance.now() - preemptionStartTime;
    
    // Log preemption time
    this.logger.log(`⚡ Task preemption completed in ${preemptionTime.toFixed(3)}ms`);
    
    // Record metrics
    if (this.metrics) {
      this.metrics.recordTaskPreemption({
        taskId: currentTask.id,
        taskName: currentTask.name,
        preemptionTimeMs: preemptionTime,
        strategy,
        newTaskType,
        metadata
      });
    }
    
    // Emit preemption event
    this.emit('taskPreempted', {
      taskId: currentTask.id,
      taskName: currentTask.name,
      preemptionTimeMs: preemptionTime,
      strategy,
      newTaskType,
      metadata
    });
    
    // Return preemption result
    return {
      preempted: true,
      preemptedTaskId: currentTask.id,
      preemptionTimeMs: preemptionTime,
      strategy
    };
  }
  
  /**
   * Resume a previously preempted task
   * @returns {Promise<object>} Resume result
   */
  async resumePreemptedTask() {
    // Check if there's a preempted task
    if (!this.preemptedTask) {
      this.logger.log('No preempted task to resume');
      return { resumed: false, reason: 'no_preempted_task' };
    }
    
    // Get the preempted task
    const preemptedTask = this.preemptedTask;
    
    // Clear the preempted task reference
    this.preemptedTask = null;
    
    // Log resumption
    this.logger.log(`▶️ Resuming preempted task ${preemptedTask.id} (${preemptedTask.name})`);
    
    // Get the original task
    const task = this.tasks.get(preemptedTask.id);
    
    if (!task) {
      this.logger.error(`❌ Preempted task ${preemptedTask.id} not found for resumption`);
      return { resumed: false, reason: 'task_not_found' };
    }
    
    // Update task status
    task.status = 'pending';
    
    // Add back to queue with high priority
    this._addToQueue({
      ...task,
      priority: Math.max(task.priority, TaskPriority.HIGH) // Ensure at least HIGH priority
    });
    
    // Call onResume if available
    if (typeof task.onResume === 'function') {
      try {
        await task.onResume(preemptedTask.resumeData);
      } catch (error) {
        this.logger.error(`Error in onResume for task ${task.id}:`, error);
      }
    }
    
    // Record metrics
    if (this.metrics) {
      this.metrics.recordTaskResumed({
        taskId: task.id,
        taskName: task.name,
        preemptionDurationMs: Date.now() - preemptedTask.preemptedAt
      });
    }
    
    // Emit task resumed event
    this.emit('taskResumed', {
      taskId: task.id,
      taskName: task.name,
      preemptionDurationMs: Date.now() - preemptedTask.preemptedAt
    });
    
    // Start processing if not already processing
    if (!this.isProcessing) {
      this._processNextTask();
    }
    
    // Return resume result
    return {
      resumed: true,
      taskId: task.id,
      preemptionDurationMs: Date.now() - preemptedTask.preemptedAt
    };
  }
  
  /**
   * Cancel a task by ID
   * @param {string} taskId - Task ID
   * @returns {Promise<boolean>} Whether the task was cancelled
   */
  async cancelTask(taskId) {
    // Check if task is in queue
    const queueIndex = this.taskQueue.indexOf(taskId);
    
    if (queueIndex >= 0) {
      // Remove from queue
      this.taskQueue.splice(queueIndex, 1);
      
      // Get task
      const task = this.tasks.get(taskId);
      
      if (task) {
        // Update task status
        task.status = 'cancelled';
        task.completedAt = Date.now();
        
        // Log cancellation
        this.logger.log(`❌ Task cancelled: ${task.name} (${taskId})`);
        
        // Record metrics
        if (this.metrics) {
          this.metrics.recordTaskCancelled({
            taskId,
            taskName: task.name
          });
        }
        
        // Emit task cancelled event
        this.emit('taskCancelled', {
          taskId,
          taskName: task.name
        });
        
        return true;
      }
    } else if (this.currentTask && this.currentTask.id === taskId) {
      // Current task - stop it
      return this._stopTask(taskId);
    }
    
    return false;
  }
  
  /**
   * Get task by ID
   * @param {string} taskId - Task ID
   * @returns {object|null} Task object or null if not found
   */
  getTask(taskId) {
    return this.tasks.get(taskId) || null;
  }
  
  /**
   * Get all tasks
   * @returns {Array<object>} Array of task objects
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get task queue
   * @returns {Array<string>} Array of task IDs in queue
   */
  getTaskQueue() {
    return [...this.taskQueue];
  }
  
  /**
   * Clear all tasks and reset state
   */
  reset() {
    // Cancel current task if any
    if (this.currentTask) {
      this._stopTask(this.currentTask.id);
    }
    
    // Clear all state
    this.tasks.clear();
    this.taskQueue = [];
    this.currentTask = null;
    this.preemptedTask = null;
    this.isProcessing = false;
    
    // Log reset
    this.logger.log('🔄 Task manager reset');
    
    // Emit reset event
    this.emit('reset');
  }

  /**
   * Determine the appropriate preemption strategy based on task priority and opportunity impact
   * @param {string} taskPriority - Task priority level
   * @param {object} opportunityData - Opportunity data
   * @param {boolean} isMemoryOperation - Whether this is a memory operation
   * @param {string} memoryTier - Memory tier (if applicable)
   * @returns {string} Preemption strategy
   */
  determinePreemptionStrategy(taskPriority, opportunityData, isMemoryOperation = false, memoryTier = null) {
    // Calculate opportunity impact
    const impact = calculateImpact(opportunityData);
    const impactLevel = calculateImpactLevel(opportunityData);
    
    // Log the decision inputs
    this.logger.log(`🧠 Determining preemption strategy:`, {
      taskPriority,
      opportunityImpact: impact.toFixed(4),
      impactLevel,
      isMemoryOperation,
      memoryTier
    });
    
    // For memory operations, use memory tier-based logic
    if (isMemoryOperation && memoryTier) {
      return this._determineMemoryOperationStrategy(memoryTier, impact, impactLevel);
    }
    
    // For regular tasks, use task priority-based logic
    switch (taskPriority) {
      case TaskPriority.CRITICAL:
        // Critical tasks can only be preempted by critical opportunities
        if (impact >= IMPACT_THRESHOLDS.CRITICAL) {
          return PreemptionStrategy.SAVE_STATE;
        }
        return PreemptionStrategy.NONE;
        
      case TaskPriority.HIGH:
        // High priority tasks can be preempted by high impact opportunities
        if (impact >= IMPACT_THRESHOLDS.HIGH) {
          return PreemptionStrategy.SAVE_STATE;
        } else if (impact >= IMPACT_THRESHOLDS.MEDIUM) {
          return PreemptionStrategy.CHECKPOINT;
        }
        return PreemptionStrategy.NONE;
        
      case TaskPriority.MEDIUM:
        // Medium priority tasks can be preempted by medium impact opportunities
        if (impact >= IMPACT_THRESHOLDS.MEDIUM) {
          return PreemptionStrategy.SAVE_STATE;
        } else if (impact >= IMPACT_THRESHOLDS.LOW) {
          return PreemptionStrategy.CHECKPOINT;
        }
        return PreemptionStrategy.NONE;
        
      case TaskPriority.LOW:
        // Low priority tasks can be preempted by any non-negligible opportunity
        if (impact >= IMPACT_THRESHOLDS.LOW) {
          return PreemptionStrategy.SAVE_STATE;
        } else if (impact >= IMPACT_THRESHOLDS.NEGLIGIBLE) {
          return PreemptionStrategy.CHECKPOINT;
        }
        return PreemptionStrategy.NONE;
        
      case TaskPriority.BACKGROUND:
      default:
        // Background tasks can always be preempted
        if (impact >= IMPACT_THRESHOLDS.MEDIUM) {
          return PreemptionStrategy.FORCE;
        } else if (impact >= IMPACT_THRESHOLDS.LOW) {
          return PreemptionStrategy.SAVE_STATE;
        }
        return PreemptionStrategy.CHECKPOINT;
    }
  }
  
  /**
   * Determine preemption strategy for memory operations
   * @param {string} memoryTier - Memory tier
   * @param {number} impact - Opportunity impact
   * @param {string} impactLevel - Opportunity impact level
   * @returns {string} Preemption strategy
   * @private
   */
  _determineMemoryOperationStrategy(memoryTier, impact, impactLevel) {
    // For Tier 1 (Critical Historical Knowledge)
    if (memoryTier === 'TIER_1') {
      // Only extreme opportunities can interrupt Tier 1
      if (impact >= IMPACT_THRESHOLDS.CRITICAL) {
        this.logger.log(`⚠️ CRITICAL impact (${impact.toFixed(4)}) opportunity will interrupt Tier 1 memory operation`);
        return PreemptionStrategy.PARTIAL;
      }
      this.logger.log(`🛡️ Protecting Tier 1 memory operation from ${impactLevel} impact opportunity`);
      return PreemptionStrategy.NONE;
    }
    
    // For Tier 2 (Recent Discoveries)
    if (memoryTier === 'TIER_2') {
      if (impact >= IMPACT_THRESHOLDS.HIGH) {
        this.logger.log(`⚠️ HIGH impact (${impact.toFixed(4)}) opportunity will force preempt Tier 2 memory operation`);
        return PreemptionStrategy.FORCE;
      } else if (impact >= IMPACT_THRESHOLDS.MEDIUM) {
        this.logger.log(`⚠️ MEDIUM impact (${impact.toFixed(4)}) opportunity will interrupt Tier 2 memory operation with partial save`);
        return PreemptionStrategy.PARTIAL;
      }
      this.logger.log(`🛡️ Protecting Tier 2 memory operation from ${impactLevel} impact opportunity`);
      return PreemptionStrategy.NONE;
    }
    
    // For Tier 3 (Current Task State)
    if (memoryTier === 'TIER_3') {
      if (impact >= IMPACT_THRESHOLDS.MEDIUM) {
        this.logger.log(`⚠️ ${impactLevel} impact (${impact.toFixed(4)}) opportunity will force preempt Tier 3 memory operation`);
        return PreemptionStrategy.FORCE;
      } else if (impact >= IMPACT_THRESHOLDS.LOW) {
        this.logger.log(`⚠️ ${impactLevel} impact (${impact.toFixed(4)}) opportunity will interrupt Tier 3 memory operation`);
        return PreemptionStrategy.SAVE_STATE;
      }
      return PreemptionStrategy.CHECKPOINT;
    }
    
    // Default strategy for unknown memory tier
    return PreemptionStrategy.CHECKPOINT;
  }
  
  /**
   * Execute a preemption based on the determined strategy
   * @param {string} taskId - Task ID to preempt
   * @param {string} strategy - Preemption strategy
   * @param {object} opportunityData - Opportunity data
   * @returns {Promise<boolean>} Whether preemption was successful
   */
  async executePreemption(taskId, strategy, opportunityData) {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      this.logger.warn(`⚠️ Cannot preempt task ${taskId}: task not found`);
      return false;
    }
    
    this.logger.log(`🔄 Executing ${strategy} preemption for task ${taskId}`);
    
    switch (strategy) {
      case PreemptionStrategy.NONE:
        // No preemption, wait for task to complete
        this.logger.log(`⏱️ Waiting for task ${taskId} to complete naturally`);
        return false;
        
      case PreemptionStrategy.CHECKPOINT:
        // Wait for the next checkpoint
        if (task.onCheckpoint) {
          this.logger.log(`⏱️ Waiting for next checkpoint in task ${taskId}`);
          return new Promise(resolve => {
            const checkpointListener = () => {
              this.logger.log(`✅ Checkpoint reached for task ${taskId}, preempting`);
              task.removeListener('checkpoint', checkpointListener);
              resolve(true);
            };
            
            task.once('checkpoint', checkpointListener);
            
            // Set a timeout in case checkpoint never comes
            setTimeout(() => {
              task.removeListener('checkpoint', checkpointListener);
              this.logger.warn(`⚠️ Checkpoint timeout for task ${taskId}, forcing preemption`);
              this.executePreemption(taskId, PreemptionStrategy.FORCE, opportunityData)
                .then(resolve);
            }, this.config.forcePreemptTimeoutMs);
          });
        } else {
          // No checkpoint handler, fall back to SAVE_STATE
          this.logger.log(`⚠️ No checkpoint handler for task ${taskId}, falling back to SAVE_STATE`);
          return this.executePreemption(taskId, PreemptionStrategy.SAVE_STATE, opportunityData);
        }
        
      case PreemptionStrategy.SAVE_STATE:
        // Save state and preempt
        if (task.onSaveState) {
          this.logger.log(`💾 Saving state for task ${taskId} before preemption`);
          try {
            await task.onSaveState();
            this.logger.log(`✅ State saved for task ${taskId}, preempting`);
            return true;
          } catch (error) {
            this.logger.error(`❌ Error saving state for task ${taskId}:`, error);
            // Fall back to force preemption
            return this.executePreemption(taskId, PreemptionStrategy.FORCE, opportunityData);
          }
        } else {
          // No save state handler, fall back to FORCE
          this.logger.log(`⚠️ No save state handler for task ${taskId}, falling back to FORCE`);
          return this.executePreemption(taskId, PreemptionStrategy.FORCE, opportunityData);
        }
        
      case PreemptionStrategy.PARTIAL:
        // Save partial state and preempt
        if (task.onPartialSave) {
          this.logger.log(`💾 Saving partial state for task ${taskId} before preemption`);
          try {
            await task.onPartialSave();
            this.logger.log(`✅ Partial state saved for task ${taskId}, preempting`);
            return true;
          } catch (error) {
            this.logger.error(`❌ Error saving partial state for task ${taskId}:`, error);
            // Fall back to force preemption
            return this.executePreemption(taskId, PreemptionStrategy.FORCE, opportunityData);
          }
        } else {
          // No partial save handler, fall back to SAVE_STATE
          this.logger.log(`⚠️ No partial save handler for task ${taskId}, falling back to SAVE_STATE`);
          return this.executePreemption(taskId, PreemptionStrategy.SAVE_STATE, opportunityData);
        }
        
      case PreemptionStrategy.FORCE:
      default:
        // Force immediate preemption
        this.logger.log(`⚡ Forcing immediate preemption for task ${taskId}`);
        
        // Update metrics
        this.taskMetrics.preemptedTasks++;
        
        // Emit preemption event
        this.emit('taskPreempted', {
          taskId,
          strategy: PreemptionStrategy.FORCE,
          opportunity: opportunityData
        });
        
        return true;
    }
  }
}

export {
  HighPerformanceTaskManager,
  TaskPriority,
  PreemptionStrategy
}; 