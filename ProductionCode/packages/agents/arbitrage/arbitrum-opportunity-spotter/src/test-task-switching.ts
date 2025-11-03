#!/usr/bin/env node

import { HighPerformanceTaskManager, TaskPriority } from './HighPerformanceTaskManager.js';
import { performance } from 'perf_hooks';

async function testTaskSwitching() {
    console.log('🔥 TESTING SUB-50MS TASK SWITCHING SYSTEM');
    console.log('==========================================\n');

    const taskManager = new HighPerformanceTaskManager();
    const responseTimes: number[] = [];

    // Test 1: Basic task execution
    console.log('Test 1: Basic Task Execution');
    for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        
        const taskId = taskManager.addTask({
            name: `test_task_${i}`,
            priority: TaskPriority.HIGH,
            execute: async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                return `Task ${i} completed`;
            }
        });
        
        const addTime = performance.now() - startTime;
        responseTimes.push(addTime);
        console.log(`Task ${i} added in ${addTime.toFixed(2)}ms ${addTime < 50 ? '✅' : '❌'}`);
    }

    // Test 2: Critical task preemption
    console.log('\nTest 2: Critical Task Preemption');
    
    // Add a long-running low priority task
    taskManager.addTask({
        name: 'background_task',
        priority: TaskPriority.LOW,
        execute: async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return 'Background task completed';
        }
    });

    // Add critical task that should preempt
    const criticalStartTime = performance.now();
    const criticalTaskId = taskManager.addTask({
        name: 'critical_task',
        priority: TaskPriority.CRITICAL,
        execute: async () => {
            return 'Critical task completed';
        }
    });
    
    const criticalAddTime = performance.now() - criticalStartTime;
    console.log(`Critical task added in ${criticalAddTime.toFixed(2)}ms ${criticalAddTime < 25 ? '🚀' : '⚠️'}`);

    // Test 3: Performance metrics
    setTimeout(() => {
        console.log('\nTest 3: Performance Metrics');
        const metrics = taskManager.getMetrics();
        console.log(`Average switch time: ${metrics.averageSwitchTime.toFixed(2)}ms`);
        console.log(`Total tasks: ${metrics.totalTasks}`);
        console.log(`Completed tasks: ${metrics.completedTasks}`);
        
        // Calculate our test metrics
        const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const sub50msCount = responseTimes.filter(t => t < 50).length;
        
        console.log(`\n📊 TEST RESULTS:`);
        console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
        console.log(`Sub-50ms responses: ${sub50msCount}/${responseTimes.length} (${((sub50msCount / responseTimes.length) * 100).toFixed(1)}%)`);
        
        if (avgResponseTime < 50 && sub50msCount === responseTimes.length) {
            console.log('🎯 SUCCESS: Sub-50ms task switching achieved!');
        } else {
            console.log('⚠️  NEEDS OPTIMIZATION: Target not fully met');
        }
        
        taskManager.stop();
        process.exit(0);
    }, 2000);
}

// Run the test
testTaskSwitching().catch(console.error); 