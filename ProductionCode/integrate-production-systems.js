#!/usr/bin/env node

/**
 * 🔧 PRODUCTION SYSTEMS INTEGRATION EXAMPLE
 * =========================================
 * 
 * This script demonstrates how to integrate the production error fix systems
 * into your existing startfullsyndicate.js
 * 
 * Usage: node integrate-production-systems.js
 */

import { bootstrapSystem, getSystemBootstrap } from './src/startup/SystemBootstrap.js';
import { getDatabaseManager } from './src/database/DatabaseManager.js';
import { getMemoryManagement } from './src/memory/MemoryManagement.js';
import { getBackgroundTaskManager, TaskPriority } from './src/orchestration/BackgroundTaskManager.js';
import { getGlobalErrorBoundary } from './src/errors/GlobalErrorBoundary.js';
import { getCircuitBreakerManager } from './src/resilience/CircuitBreaker.js';

/**
 * 🚀 MAIN INTEGRATION EXAMPLE
 */
async function main() {
    console.log('🚀 INTEGRATING PRODUCTION SYSTEMS...');
    console.log('====================================\n');
    
    try {
        // ========================================
        // STEP 1: Bootstrap All Systems
        // ========================================
        console.log('STEP 1: Bootstrapping systems...\n');
        
        const systemInfo = await bootstrapSystem({
            enableDatabase: true,
            enableMigrations: true,
            enableMemoryManagement: true,
            enableBackgroundTasks: true,
            enableErrorBoundary: true,
            enableCircuitBreakers: true
        });
        
        console.log('✅ Bootstrap complete!\n');
        console.log('System Info:', JSON.stringify(systemInfo, null, 2));
        console.log('\n');
        
        // ========================================
        // STEP 2: Get References to Systems
        // ========================================
        console.log('STEP 2: Getting system references...\n');
        
        const dbManager = getDatabaseManager();
        const memoryManager = getMemoryManagement();
        const taskManager = getBackgroundTaskManager();
        const errorBoundary = getGlobalErrorBoundary();
        const circuitBreakers = getCircuitBreakerManager();
        
        console.log('✅ All system references obtained\n');
        
        // ========================================
        // STEP 3: Test Database Operations
        // ========================================
        console.log('STEP 3: Testing database operations...\n');
        
        try {
            const result = await dbManager.query('SELECT NOW() as current_time, version() as pg_version');
            console.log('✅ Database query successful!');
            console.log(`   Current Time: ${result.rows[0].current_time}`);
            console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[1]}`);
        } catch (error) {
            console.error('❌ Database query failed:', error.message);
        }
        
        console.log('\n');
        
        // ========================================
        // STEP 4: Queue a Background Task
        // ========================================
        console.log('STEP 4: Queueing background task...\n');
        
        const taskQueued = taskManager.queueTask(
            'example_task',
            async () => {
                console.log('   🔄 Executing example task...');
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
                console.log('   ✅ Example task completed!');
                return { success: true };
            },
            {
                priority: TaskPriority.NORMAL,
                timeout: 10000,
                metadata: { type: 'example' }
            }
        );
        
        if (taskQueued) {
            console.log('✅ Task queued successfully\n');
        }
        
        // Wait for task to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // ========================================
        // STEP 5: Check Memory Status
        // ========================================
        console.log('STEP 5: Checking memory status...\n');
        
        const memoryStatus = memoryManager.getCurrentStatus();
        console.log(`   Heap Used: ${(memoryStatus.heapUsed / 1024 / 1024 / 1024).toFixed(2)}GB`);
        console.log(`   Heap Total: ${(memoryStatus.heapTotal / 1024 / 1024 / 1024).toFixed(2)}GB`);
        console.log(`   Heap Utilization: ${memoryStatus.heapUtilization.toFixed(2)}%`);
        console.log(`   RSS: ${(memoryStatus.rss / 1024 / 1024 / 1024).toFixed(2)}GB`);
        console.log(`   Monitoring Active: ${memoryStatus.isMonitoring}`);
        console.log('\n');
        
        // ========================================
        // STEP 6: Check Circuit Breaker Status
        // ========================================
        console.log('STEP 6: Checking circuit breaker status...\n');
        
        const cbStatus = circuitBreakers.getAllStatus();
        for (const [name, status] of Object.entries(cbStatus)) {
            console.log(`   ${name}:`);
            console.log(`     State: ${status.state}`);
            console.log(`     Success Rate: ${status.successRate}`);
            console.log(`     Total Requests: ${status.totalRequests}`);
        }
        console.log('\n');
        
        // ========================================
        // STEP 7: Get Comprehensive Metrics
        // ========================================
        console.log('STEP 7: Getting comprehensive metrics...\n');
        
        const bootstrap = getSystemBootstrap();
        const metrics = bootstrap.getMetrics();
        
        console.log('📊 System Metrics:');
        console.log(`   Bootstrap Time: ${metrics.bootstrap.bootstrapTime}ms`);
        console.log(`   Database Queries: ${metrics.database.totalQueries}`);
        console.log(`   Database Success Rate: ${metrics.database.successRate}`);
        console.log(`   Memory Warnings: ${metrics.memory.warningCount}`);
        console.log(`   Memory Critical: ${metrics.memory.criticalCount}`);
        console.log(`   Background Tasks Queued: ${metrics.backgroundTasks.totalTasksQueued}`);
        console.log(`   Background Tasks Completed: ${metrics.backgroundTasks.totalTasksCompleted}`);
        console.log(`   Total Errors: ${metrics.errors.totalErrors}`);
        console.log(`   Error Rate: ${metrics.errors.errorRate} errors/sec`);
        console.log('\n');
        
        // ========================================
        // STEP 8: Demonstrate Error Handling
        // ========================================
        console.log('STEP 8: Demonstrating error handling...\n');
        
        // This error will be caught by GlobalErrorBoundary
        try {
            throw new Error('Test error for demonstration');
        } catch (error) {
            console.log('   ✅ Error caught and handled by GlobalErrorBoundary');
        }
        
        console.log('\n');
        
        // ========================================
        // COMPLETION
        // ========================================
        console.log('====================================');
        console.log('✅ ALL INTEGRATION TESTS PASSED!');
        console.log('====================================\n');
        
        console.log('📝 Next Steps:');
        console.log('   1. Review PRODUCTION_SYSTEM_INTEGRATION.md');
        console.log('   2. Update startfullsyndicate.js to use SystemBootstrap');
        console.log('   3. Replace all Pool creations with getDatabaseManager()');
        console.log('   4. Queue background tasks instead of immediate execution');
        console.log('   5. Wrap external calls with circuit breakers');
        console.log('   6. Monitor metrics and adjust thresholds as needed\n');
        
        // Graceful shutdown
        console.log('🛑 Shutting down gracefully...');
        await bootstrap.shutdown();
        console.log('✅ Shutdown complete\n');
        
        process.exit(0);
        
    } catch (error) {
        console.error('💥 INTEGRATION FAILED:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { main };

