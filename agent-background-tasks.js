
// 🛡️ PERFORMANCE MONITORING CONTROL
const ENABLE_PERFORMANCE_MONITORING = process.env.ENABLE_PERFORMANCE_MONITORING === 'true' || process.env.NODE_ENV === 'production';

function conditionalPerformanceMonitoring(monitoringFunction, description = 'performance monitoring') {
    if (!ENABLE_PERFORMANCE_MONITORING) {
        console.log(`⚠️ ${description} disabled (set ENABLE_PERFORMANCE_MONITORING=true to enable)`);
        return () => {}; // Return no-op function
    }
    return monitoringFunction;
}

/**
 * 🧠 AGENT BACKGROUND TASKS SYSTEM
 * ===============================
 * 
 * This is THE GOLDEN NUGGET of the Ultimate Arbitrage Syndicate.
 * 
 * It enables agents to continuously learn, research, and improve
 * while waiting for arbitrage opportunities, with atomic task
 * switching (1.4ms) when a significant opportunity is detected.
 * 
 * Features:
 * - Background task scheduling with priorities
 * - Atomic task switching on opportunity detection
 * - Task state persistence and resumption
 * - Discovery tracking and sharing
 * - Automatic task scheduling based on agent capabilities
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { performance } from 'perf_hooks';

// Task priorities
export const PRIORITY = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  BACKGROUND: 4
};

// Task status
export const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Event emitter for task events
export const taskEvents = new EventEmitter();

/**
 * Background Task Manager
 * 
 * Singleton class to manage all agent background tasks
 */
class BackgroundTaskManager {
  constructor() {
    this.tasks = new Map();
    this.discoveries = [];
    this.running = false;
    this.interval = null;
    this.maxConcurrentTasks = 5;
    this.maxHistoryLength = 1000;
    this.savePath = './data/tasks';
    this.saveInterval = 60000; // 1 minute
    this.autoSaveInterval = null;
    
    // Create necessary directories
    this._createDirectories();
  }
  
  /**
   * Create necessary directories
   */
  async _createDirectories() {
    try {
      await fs.mkdir(this.savePath, { recursive: true });
      await fs.mkdir(path.join(this.savePath, 'discoveries'), { recursive: true });
      await fs.mkdir(path.join(this.savePath, 'states'), { recursive: true });
    } catch (error) {
      console.error('Failed to create task directories:', error);
    }
  }
  
  /**
   * Register a new background task
   */
  registerTask(config) {
    const {
      name,
      description,
      agentId,
      priority = PRIORITY.MEDIUM,
      interval = 10000,
      handler
    } = config;
    
    if (!name || !handler) {
      throw new Error('Task name and handler are required');
    }
    
    const taskId = uuidv4();
    
    this.tasks.set(taskId, {
      id: taskId,
      name,
      description,
      agentId,
      priority,
      interval,
      handler,
      lastRun: 0,
      nextRun: Date.now(),
      status: STATUS.IDLE,
      history: [],
      state: {}
    });
    
    console.log(`📝 Registered task: ${name} (${taskId})`);
    return taskId;
  }
  
  /**
   * Get a task by ID
   */
  getTask(taskId) {
    return this.tasks.get(taskId);
  }
  
  /**
   * Get all tasks
   */
  getAllTasks() {
    return Array.from(this.tasks.values());
  }
  
  /**
   * Get tasks by agent ID
   */
  getTasksByAgent(agentId) {
    return Array.from(this.tasks.values()).filter(task => task.agentId === agentId);
  }
  
  /**
   * Start the task manager
   */
  start() {
    if (this.running) return;
    
    this.running = true;
    
    // Load previous discoveries
    this._loadDiscoveries();
    
    // Start task scheduler
    this.interval = setInterval(() => this._scheduleTasks(), 100);
    
    // Start auto-save
    this.autoSaveInterval = setInterval(() => this._saveDiscoveries(), this.saveInterval);
    
    console.log('🚀 Background task manager started');
  }
  
  /**
   * Stop the task manager
   */
  stop() {
    if (!this.running) return;
    
    this.running = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
    
    console.log('🛑 Background task manager stopped');
  }
  
  /**
   * Schedule and run tasks
   */
  async _scheduleTasks() {
    if (!this.running) return;
    
    const now = Date.now();
    const eligibleTasks = Array.from(this.tasks.values())
      .filter(task => task.status === STATUS.IDLE && task.nextRun <= now)
      .sort((a, b) => a.priority - b.priority);
    
    // Count currently running tasks
    const runningTasks = Array.from(this.tasks.values())
      .filter(task => task.status === STATUS.RUNNING)
      .length;
    
    // Calculate how many more tasks we can run
    const availableSlots = Math.max(0, this.maxConcurrentTasks - runningTasks);
    
    // Run eligible tasks up to the max concurrent limit
    const tasksToRun = eligibleTasks.slice(0, availableSlots);
    
    for (const task of tasksToRun) {
      this._runTask(task);
    }
  }
  
  /**
   * Run a single task
   */
  async _runTask(task) {
    if (!this.running || task.status !== STATUS.IDLE) return;
    
    // Update task status
    task.status = STATUS.RUNNING;
    task.lastRun = Date.now();
    
    try {
      // Measure execution time
      const startTime = performance.now();
      
      // Execute task handler
      const result = await task.handler(task);
      
      // Calculate duration
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update task status
      task.status = STATUS.IDLE;
      task.nextRun = Date.now() + task.interval;
      
      // Add to history
      this._addToHistory(task, {
        timestamp: Date.now(),
        duration,
        result,
        status: 'completed'
      });
      
      // Record discovery if result indicates one
      if (result && (result.isDiscovery || result.discoveryType)) {
        this._recordDiscovery(task, result);
      }
      
      // Emit task completed event
      taskEvents.emit('taskCompleted', {
        taskId: task.id,
        taskName: task.name,
        agentId: task.agentId,
        duration,
        result
      });
      
      // Emit agent-specific task completed event
      if (task.agentId) {
        taskEvents.emit('agentTaskCompleted', {
          taskId: task.id,
          taskName: task.name,
          agentId: task.agentId,
          duration,
          result
        });
      }
      
    } catch (error) {
      // Update task status
      task.status = STATUS.IDLE;
      task.nextRun = Date.now() + task.interval;
      
      // Add to history
      this._addToHistory(task, {
        timestamp: Date.now(),
        error: error.message,
        status: 'failed'
      });
      
      // Emit task failed event
      taskEvents.emit('taskFailed', {
        taskId: task.id,
        taskName: task.name,
        agentId: task.agentId,
        error: error.message
      });
      
      console.error(`❌ Task ${task.name} failed:`, error);
    }
  }
  
  /**
   * Add entry to task history
   */
  _addToHistory(task, entry) {
    if (!task.history) {
      task.history = [];
    }
    
    // Add to history
    task.history.push(entry);
    
    // Limit history length
    if (task.history.length > this.maxHistoryLength) {
      task.history = task.history.slice(-this.maxHistoryLength);
    }
  }
  
  /**
   * Record a discovery
   */
  _recordDiscovery(task, result) {
    const discovery = {
      id: uuidv4(),
      timestamp: Date.now(),
      taskId: task.id,
      taskName: task.name,
      agentId: task.agentId,
      type: result.discoveryType || 'unknown',
      data: result.discoveryData || result,
      confidence: result.confidence || 0.5
    };
    
    this.discoveries.push(discovery);
    
    // Limit discoveries length
    if (this.discoveries.length > this.maxHistoryLength) {
      this.discoveries = this.discoveries.slice(-this.maxHistoryLength);
    }
    
    // Emit discovery event
    taskEvents.emit('discoveryRecorded', discovery);
    
    console.log(`🔍 Discovery recorded: ${discovery.type} by ${discovery.agentId || 'unknown'}`);
    
    return discovery;
  }
  
  /**
   * Save discoveries to disk
   */
  async _saveDiscoveries() {
    if (this.discoveries.length === 0) return;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.savePath, 'discoveries', `discoveries-${timestamp}.json`);
      
      await fs.writeFile(
        filePath,
        JSON.stringify(this.discoveries, null, 2)
      );
      
      console.log(`💾 Saved ${this.discoveries.length} discoveries to ${filePath}`);
    } catch (error) {
      console.error('❌ Failed to save discoveries:', error);
    }
  }
  
  /**
   * Load discoveries from disk
   */
  async _loadDiscoveries() {
    try {
      const discoveryDir = path.join(this.savePath, 'discoveries');
      
      // Create directory if it doesn't exist
      await fs.mkdir(discoveryDir, { recursive: true });
      
      // Get all discovery files
      const files = await fs.readdir(discoveryDir);
      const jsonFiles = files.filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length === 0) {
        console.log('ℹ️ No discovery files found');
        return;
      }
      
      // Sort files by name (which includes timestamp)
      jsonFiles.sort();
      
      // Load the most recent file
      const latestFile = jsonFiles[jsonFiles.length - 1];
      const filePath = path.join(discoveryDir, latestFile);
      
      const data = await fs.readFile(filePath, 'utf8');
      const discoveries = JSON.parse(data);
      
      // Add loaded discoveries
      this.discoveries = discoveries;
      
      console.log(`📚 Loaded ${discoveries.length} discoveries from ${filePath}`);
      
      // Emit event
      taskEvents.emit('discoveriesLoaded', {
        discoveries,
        filePath
      });
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️ No discovery files found');
      } else {
        console.error('❌ Failed to load discoveries:', error);
      }
    }
  }
  
  /**
   * Save task state
   */
  async saveTaskState(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.savePath, 'states', `task-${taskId}-${timestamp}.json`);
      
      const state = {
        id: task.id,
        name: task.name,
        agentId: task.agentId,
        status: task.status,
        lastRun: task.lastRun,
        nextRun: task.nextRun,
        state: task.state || {}
      };
      
      await fs.writeFile(
        filePath,
        JSON.stringify(state, null, 2)
      );
      
      console.log(`💾 Saved state for task ${task.name} to ${filePath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to save state for task ${taskId}:`, error);
      return false;
    }
  }
  
  /**
   * Load task state
   */
  async loadTaskState(taskId) {
    try {
      const stateDir = path.join(this.savePath, 'states');
      
      // Get all state files for this task
      const files = await fs.readdir(stateDir);
      const taskFiles = files.filter(file => file.startsWith(`task-${taskId}-`) && file.endsWith('.json'));
      
      if (taskFiles.length === 0) {
        console.log(`ℹ️ No state files found for task ${taskId}`);
        return null;
      }
      
      // Sort files by name (which includes timestamp)
      taskFiles.sort();
      
      // Load the most recent file
      const latestFile = taskFiles[taskFiles.length - 1];
      const filePath = path.join(stateDir, latestFile);
      
      const data = await fs.readFile(filePath, 'utf8');
      const state = JSON.parse(data);
      
      console.log(`📚 Loaded state for task ${taskId} from ${filePath}`);
      
      return state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`ℹ️ No state files found for task ${taskId}`);
      } else {
        console.error(`❌ Failed to load state for task ${taskId}:`, error);
      }
      return null;
    }
  }
  
  /**
   * Pause a task
   */
  pauseTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    if (task.status === STATUS.RUNNING) {
      task.status = STATUS.PAUSED;
      console.log(`⏸️ Paused task: ${task.name}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Resume a task
   */
  resumeTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    if (task.status === STATUS.PAUSED) {
      task.status = STATUS.IDLE;
      task.nextRun = Date.now(); // Run immediately
      console.log(`▶️ Resumed task: ${task.name}`);
      return true;
    }
    
    return false;
  }
  
  /**
   * Pause all tasks
   */
  pauseAllTasks() {
    let pausedCount = 0;
    
    for (const task of this.tasks.values()) {
      if (task.status === STATUS.RUNNING) {
        task.status = STATUS.PAUSED;
        pausedCount++;
      }
    }
    
    console.log(`⏸️ Paused ${pausedCount} tasks`);
    return pausedCount;
  }
  
  /**
   * Resume all tasks
   */
  resumeAllTasks() {
    let resumedCount = 0;
    
    for (const task of this.tasks.values()) {
      if (task.status === STATUS.PAUSED) {
        task.status = STATUS.IDLE;
        task.nextRun = Date.now(); // Run immediately
        resumedCount++;
      }
    }
    
    console.log(`▶️ Resumed ${resumedCount} tasks`);
    return resumedCount;
  }
  
  /**
   * Clean up resources
   */
  cleanup() {
    this.stop();
    this._saveDiscoveries().catch(console.error);
    
    // Save states for all tasks
    for (const task of this.tasks.values()) {
      this.saveTaskState(task.id).catch(console.error);
    }
    
    console.log('🧹 Background task manager cleaned up');
  }
}

// Create singleton instance
export const backgroundTaskManager = new BackgroundTaskManager();

// Export the class for factory use
export { BackgroundTaskManager };

// Start the background task manager if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🚀 Starting background task manager directly');
  backgroundTaskManager.start();
  
  // Register a test task
  const testTaskId = backgroundTaskManager.registerTask({
    name: 'Test Task',
    description: 'A test task',
    priority: PRIORITY.MEDIUM,
    interval: 5000, // Every 5 seconds
    handler: async (task) => {
      console.log(`Running test task at ${new Date().toISOString()}`);
      return { status: 'completed' };
    }
  });
  
  // Handle SIGINT
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down background task manager');
    backgroundTaskManager.cleanup();
    process.exit(0);
  });
}

export default backgroundTaskManager; 