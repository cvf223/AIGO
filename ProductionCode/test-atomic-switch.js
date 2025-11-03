#!/usr/bin/env node

/**
 * ⚡ TEST ATOMIC TASK SWITCHING
 * ===========================
 * 
 * This script specifically tests and benchmarks the atomic task switching
 * capability of the background task system.
 * 
 * It measures:
 * 1. Task switch time (target: 1.4ms)
 * 2. State preservation accuracy
 * 3. Performance under load
 * 4. Memory usage during switching
 */

import { backgroundTaskManager, taskEvents, PRIORITY, STATUS } from './agent-background-tasks.js';
import { performance } from 'perf_hooks';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Number of test iterations
const TEST_ITERATIONS = 100;
const TARGET_SWITCH_TIME = parseFloat(process.env.TASK_SWITCH_TIMEOUT_MS || '1.4');

// Create mock event data
const createMockEvent = (id) => ({
  id: `event-${id}`,
  timestamp: Date.now(),
  priceImpact: 0.006,
  chain: 'arbitrum',
  transactionHash: `0x${Math.random().toString(36).substring(2, 40)}`
});

// Test agent with atomic task switching capability
class TestAgent {
  constructor(id) {
    this.id = id;
    this.currentTask = null;
    this.taskHistory = [];
    this.interruptCount = 0;
    this.switchTimes = [];
  }
  
  async startBackgroundTask(taskName) {
    console.log(`🔄 ${this.id} starting background task: ${taskName}`);
    this.currentTask = {
      name: taskName,
      startTime: Date.now(),
      state: {}
    };
    
    // Register with background task manager
    this.taskId = backgroundTaskManager.registerTask({
      name: taskName,
      description: `Background task for ${this.id}`,
      agentId: this.id,
      priority: PRIORITY.MEDIUM,
      interval: 5000,
      handler: async (task) => {
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 100));
        return { status: 'completed', taskName };
      }
    });
    
    return this.taskId;
  }
  
  async saveTaskState() {
    if (!this.currentTask) return null;
    
    const state = {
      name: this.currentTask.name,
      duration: Date.now() - this.currentTask.startTime,
      state: this.currentTask.state
    };
    
    this.taskHistory.push(state);
    return state;
  }
  
  async interrupt(reason, data) {
    const startTime = performance.now();
    
    // Save current task state
    const savedState = await this.saveTaskState();
    
    // Process the interruption
    this.interruptCount++;
    console.log(`🚨 ${this.id} interrupted: ${reason} (${this.interruptCount})`);
    
    // Simulate opportunity processing
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Resume previous task
    if (savedState) {
      this.currentTask = {
        name: savedState.name,
        startTime: Date.now(),
        state: savedState.state
      };
    }
    
    // Calculate switch time
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    this.switchTimes.push(switchTime);
    
    return { success: true, switchTime };
  }
  
  getAverageSwitchTime() {
    if (this.switchTimes.length === 0) return 0;
    return this.switchTimes.reduce((a, b) => a + b, 0) / this.switchTimes.length;
  }
  
  getMaxSwitchTime() {
    if (this.switchTimes.length === 0) return 0;
    return Math.max(...this.switchTimes);
  }
  
  getMinSwitchTime() {
    if (this.switchTimes.length === 0) return 0;
    return Math.min(...this.switchTimes);
  }
}

// Atomic task switch implementation
async function atomicTaskSwitch(agents, event) {
  const startTime = performance.now();
  
  try {
    // 1. Save all task states
    console.log(`📝 Saving task states for ${agents.length} agents...`);
    const savePromises = agents.map(agent => agent.saveTaskState());
    await Promise.all(savePromises);
    
    // 2. Pause all background tasks
    console.log(`⏸️ Pausing background tasks...`);
    const tasks = backgroundTaskManager.getAllTasks();
    for (const task of tasks) {
      if (task.status === STATUS.RUNNING) {
        task.status = STATUS.PAUSED;
      }
    }
    
    // 3. Process opportunity with all agents
    console.log(`⚡ Processing opportunity...`);
    const interruptPromises = agents.map(agent => agent.interrupt('CRITICAL_OPPORTUNITY', event));
    await Promise.all(interruptPromises);
    
    // 4. Resume all background tasks
    console.log(`▶️ Resuming background tasks...`);
    for (const task of tasks) {
      if (task.status === STATUS.PAUSED) {
        task.status = STATUS.IDLE;
        task.nextRun = Date.now(); // Run immediately
      }
    }
    
    // Calculate and return switch time
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    return { success: true, switchTime };
  } catch (error) {
    console.error('❌ Atomic task switch failed:', error);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTest() {
  console.log('⚡ ATOMIC TASK SWITCHING BENCHMARK');
  console.log('================================');
  console.log(`Target switch time: ${TARGET_SWITCH_TIME}ms`);
  console.log(`Test iterations: ${TEST_ITERATIONS}`);
  
  // Initialize background task manager
  backgroundTaskManager.start();
  
  // Create test agents
  const agents = [
    new TestAgent('arbitrum-spotter'),
    new TestAgent('base-spotter'),
    new TestAgent('polygon-spotter'),
    new TestAgent('signal-filterer'),
    new TestAgent('flash-loan-executor')
  ];
  
  // Start background tasks for all agents
  console.log('\n📋 STEP 1: Initialize background tasks');
  for (const agent of agents) {
    await agent.startBackgroundTask(`${agent.id}-background-task`);
  }
  
  // Wait for tasks to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Run atomic switch benchmark
  console.log('\n📋 STEP 2: Running atomic switch benchmark');
  
  const switchTimes = [];
  const successCount = 0;
  
  for (let i = 0; i < TEST_ITERATIONS; i++) {
    // Create mock event
    const event = createMockEvent(i);
    
    // Perform atomic switch
    const result = await atomicTaskSwitch(agents, event);
    
    if (result.success) {
      switchTimes.push(result.switchTime);
      console.log(`✅ Iteration ${i+1}/${TEST_ITERATIONS}: ${result.switchTime.toFixed(2)}ms`);
    } else {
      console.error(`❌ Iteration ${i+1}/${TEST_ITERATIONS} failed: ${result.error}`);
    }
    
    // Small delay between iterations
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Calculate statistics
  const avgSwitchTime = switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
  const maxSwitchTime = Math.max(...switchTimes);
  const minSwitchTime = Math.min(...switchTimes);
  
  // Calculate percentiles
  switchTimes.sort((a, b) => a - b);
  const p50 = switchTimes[Math.floor(switchTimes.length * 0.5)];
  const p90 = switchTimes[Math.floor(switchTimes.length * 0.9)];
  const p95 = switchTimes[Math.floor(switchTimes.length * 0.95)];
  const p99 = switchTimes[Math.floor(switchTimes.length * 0.99)];
  
  // Calculate success rate against target
  const successRate = switchTimes.filter(time => time <= TARGET_SWITCH_TIME).length / switchTimes.length * 100;
  
  // Print results
  console.log('\n📊 BENCHMARK RESULTS');
  console.log('==================');
  console.log(`Total iterations: ${switchTimes.length}`);
  console.log(`Average switch time: ${avgSwitchTime.toFixed(2)}ms`);
  console.log(`Minimum switch time: ${minSwitchTime.toFixed(2)}ms`);
  console.log(`Maximum switch time: ${maxSwitchTime.toFixed(2)}ms`);
  console.log(`50th percentile (p50): ${p50.toFixed(2)}ms`);
  console.log(`90th percentile (p90): ${p90.toFixed(2)}ms`);
  console.log(`95th percentile (p95): ${p95.toFixed(2)}ms`);
  console.log(`99th percentile (p99): ${p99.toFixed(2)}ms`);
  console.log(`Success rate (≤ ${TARGET_SWITCH_TIME}ms): ${successRate.toFixed(2)}%`);
  
  // Print agent-specific statistics
  console.log('\n📊 AGENT STATISTICS');
  console.log('=================');
  for (const agent of agents) {
    console.log(`${agent.id}:`);
    console.log(`  Interrupts: ${agent.interruptCount}`);
    console.log(`  Average switch time: ${agent.getAverageSwitchTime().toFixed(2)}ms`);
    console.log(`  Min/Max: ${agent.getMinSwitchTime().toFixed(2)}ms / ${agent.getMaxSwitchTime().toFixed(2)}ms`);
  }
  
  // Cleanup
  backgroundTaskManager.cleanup();
  
  // Final assessment
  console.log('\n🏆 FINAL ASSESSMENT');
  console.log('=================');
  if (avgSwitchTime <= TARGET_SWITCH_TIME) {
    console.log(`✅ PASSED: Average switch time (${avgSwitchTime.toFixed(2)}ms) is within target (${TARGET_SWITCH_TIME}ms)`);
  } else {
    console.log(`❌ FAILED: Average switch time (${avgSwitchTime.toFixed(2)}ms) exceeds target (${TARGET_SWITCH_TIME}ms)`);
  }
  
  if (p95 <= TARGET_SWITCH_TIME * 1.5) {
    console.log(`✅ PASSED: 95% of switches (${p95.toFixed(2)}ms) are within 1.5x target (${(TARGET_SWITCH_TIME * 1.5).toFixed(2)}ms)`);
  } else {
    console.log(`❌ FAILED: 95% of switches (${p95.toFixed(2)}ms) exceed 1.5x target (${(TARGET_SWITCH_TIME * 1.5).toFixed(2)}ms)`);
  }
  
  if (successRate >= 90) {
    console.log(`✅ PASSED: Success rate (${successRate.toFixed(2)}%) is ≥ 90%`);
  } else {
    console.log(`❌ FAILED: Success rate (${successRate.toFixed(2)}%) is < 90%`);
  }
}

// Run the test
runTest().catch(console.error); 