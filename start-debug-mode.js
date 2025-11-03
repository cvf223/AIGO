#!/usr/bin/env node

/**
 * 🔍 DEBUG MODE STARTUP
 * =====================
 * Development and testing mode with selective service loading
 * and enhanced debugging capabilities
 */

// Set debug mode flags BEFORE any imports
global.OBSERVATION_MODE_ENFORCED = false;
global.SKIP_ALL_SERVICES = false;
global.MINIMAL_MODE = false;
global.FULL_SYSTEM_MODE = false;
global.DEBUG_MODE = true;

// Enhanced debugging
global.ENABLE_VERBOSE_LOGGING = true;
global.ENABLE_DEBUG_TRACES = true;

import v8 from 'v8';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 DEBUG MODE STARTUP');
console.log('='.repeat(40));

// System info
const heapStats = v8.getHeapStatistics();
const heapLimitGB = heapStats.heap_size_limit / (1024 * 1024 * 1024);
const totalSystemGB = os.totalmem() / (1024 * 1024 * 1024);

console.log('📊 DEBUG SYSTEM INFO:');
console.log(`   System RAM: ${totalSystemGB.toFixed(0)}GB`);
console.log(`   Heap Limit: ${heapLimitGB.toFixed(2)}GB`);
console.log(`   Node Version: ${process.version}`);
console.log(`   Platform: ${process.platform}`);

// Debug-specific configuration
console.log('\n🔧 DEBUG CONFIGURATION:');
console.log('   ✅ Verbose logging enabled');
console.log('   ✅ Debug traces enabled');
console.log('   ✅ Selected services only');
console.log('   ✅ Enhanced error reporting');

// Services to load in debug mode (selective)
const DEBUG_SERVICES = [
    'database',
    'systemHealthReporter', 
    'onDemandActivator',
    'serviceRegistry',
    'observationModeEnforcer'
];

console.log('\n📋 DEBUG SERVICES TO LOAD:');
DEBUG_SERVICES.forEach(service => {
    console.log(`   • ${service}`);
});

try {
    console.log('\n🚀 Starting debug mode initialization...');
    
    // Load only essential systems for debugging
    console.log('   Loading database connection...');
    const { Pool } = await import('pg');
    const dbPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'construction_syndicate',
        user: 'postgres',
        max: 3, // Small pool for debug
        idleTimeoutMillis: 30000
    });
    
    console.log('   ✅ Debug database connection ready');
    
    // Load health reporter for monitoring
    console.log('   Loading health reporter...');
    const { systemHealthReporter } = await import('./src/core/SystemHealthReporter.js');
    systemHealthReporter.registerService('database', dbPool);
    systemHealthReporter.config.reportInterval = 60000; // 1 minute for debug
    systemHealthReporter.startReporting();
    console.log('   ✅ Debug health reporter active (1-minute intervals)');
    
    // Load on-demand activator
    console.log('   Loading on-demand activator...');
    const { onDemandActivator } = await import('./src/core/OnDemandActivator.js');
    console.log('   ✅ Debug on-demand activator ready');
    
    // Load observation enforcer for control
    console.log('   Loading observation enforcer...');
    const { observationModeEnforcer } = await import('./src/core/ObservationModeEnforcer.js');
    console.log('   ✅ Debug observation enforcer ready');
    
    // Test database connectivity
    console.log('\n🧪 TESTING DATABASE CONNECTIVITY...');
    try {
        const testResult = await dbPool.query('SELECT NOW() as current_time');
        console.log(`   ✅ Database test successful: ${testResult.rows[0].current_time}`);
    } catch (dbError) {
        console.error('   ❌ Database test failed:', dbError.message);
    }
    
    // Test heap allocation behavior
    console.log('\n🧠 TESTING HEAP BEHAVIOR...');
    const initialUsed = v8.getHeapStatistics().used_heap_size;
    
    // Allocate some memory to test behavior
    const testArray = new Array(100000).fill('test string for heap testing');
    const afterAlloc = v8.getHeapStatistics().used_heap_size;
    
    console.log(`   Initial heap: ${(initialUsed / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   After allocation: ${(afterAlloc / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Difference: ${((afterAlloc - initialUsed) / 1024 / 1024).toFixed(2)}MB`);
    
    // Clean up test allocation
    testArray.length = 0;
    if (global.gc) {
        global.gc();
        const afterGC = v8.getHeapStatistics().used_heap_size;
        console.log(`   After GC: ${(afterGC / 1024 / 1024).toFixed(2)}MB`);
    }
    
} catch (error) {
    console.error('❌ Debug mode startup failed:', error);
    
    console.error('\n🔍 DEBUG ERROR ANALYSIS:');
    console.error(`   Type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Stack: ${error.stack?.split('\n').slice(0, 5).join('\n')}`);
    
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 DEBUG MODE READY');
console.log('='.repeat(60));
console.log('✅ Selected services loaded and tested');
console.log('🔍 Enhanced debugging active'); 
console.log('📊 Health reports every 1 minute');
console.log('🧪 Ready for development and testing');
console.log('='.repeat(60));

// Keep alive for debugging
console.log('\n⏳ Debug mode running - Press Ctrl+C to exit');

// Enhanced error handling for debug mode
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 DEBUG: Unhandled Promise Rejection');
    console.error('   Reason:', reason);
    console.error('   Promise:', promise);
    console.error('   Stack:', reason?.stack);
});

process.on('uncaughtException', (error) => {
    console.error('\n💥 DEBUG: Uncaught Exception');
    console.error('   Error:', error);
    console.error('   Stack:', error.stack);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Debug mode shutdown initiated...');
    try {
        const { systemHealthReporter } = await import('./src/core/SystemHealthReporter.js');
        systemHealthReporter.stopReporting();
        console.log('✅ Debug mode shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Debug shutdown error:', error);
        process.exit(1);
    }
});

// Periodic debug status
setInterval(() => {
    const heap = v8.getHeapStatistics();
    const heapMB = heap.used_heap_size / (1024 * 1024);
    console.log(`🔍 DEBUG STATUS: Heap ${heapMB.toFixed(2)}MB, Uptime ${Math.floor(process.uptime())}s`);
}, 60000); // Every minute
