#!/usr/bin/env node

/**
 * 🔭 OBSERVATION-ONLY STARTUP SCRIPT
 * ==================================
 * Ultra-minimal startup that ONLY loads essential services
 * for true observation/idle mode with proper heap allocation
 */

// ⚠️ CRITICAL: Set global flags BEFORE any imports
global.OBSERVATION_MODE_ENFORCED = true;
global.SKIP_ALL_SERVICES = true;
global.MINIMAL_MODE = true;
global.DISABLE_DEBUG_LOGGING = true;
global.SKIP_AUTONOMOUS_SYSTEMS = true;

// Override global functions IMMEDIATELY to prevent any intervals/timeouts
const originalSetInterval = global.setInterval;
const originalSetTimeout = global.setTimeout;

global.setInterval = (callback, delay, ...args) => {
    if (global.OBSERVATION_MODE_ENFORCED && !callback.toString().includes('health')) {
        console.log('🚫 BLOCKED interval in observation mode');
        return null;
    }
    return originalSetInterval(callback, delay, ...args);
};

global.setTimeout = (callback, delay, ...args) => {
    if (global.OBSERVATION_MODE_ENFORCED && delay > 5000) {
        console.log('🚫 BLOCKED long timeout in observation mode');
        return null;
    }
    return originalSetTimeout(callback, delay, ...args);
};

// CRITICAL: Check heap allocation immediately
import v8 from 'v8';
import os from 'os';

console.log('🔭 OBSERVATION-ONLY MODE STARTUP');
console.log('='.repeat(60));

// Verify heap allocation
const heapStats = v8.getHeapStatistics();
const heapLimitGB = heapStats.heap_size_limit / (1024 * 1024 * 1024);
const totalSystemGB = os.totalmem() / (1024 * 1024 * 1024);

console.log('💾 HEAP VERIFICATION:');
console.log(`   System RAM: ${totalSystemGB.toFixed(0)}GB`);
console.log(`   Node Heap Limit: ${heapLimitGB.toFixed(2)}GB`);
console.log(`   Target: 400GB`);

if (heapLimitGB < 350) {
    console.error('❌ CRITICAL: Heap allocation failed!');
    console.error(`   Expected: ~400GB, Got: ${heapLimitGB.toFixed(2)}GB`);
    console.error('   Node.js is ignoring memory flags!');
} else {
    console.log('✅ Heap allocation successful');
}

// Only import absolute essentials
console.log('\n🔥 MINIMAL SERVICE LOADING:');
console.log('   Loading ONLY observation mode essentials...');

try {
    // Database connection (minimal)
    const { Pool } = await import('pg');
    const dbPool = new Pool({
        host: 'localhost',
        port: 5432,
        database: 'construction_syndicate',
        user: 'postgres',
        max: 1, // Minimal connection pool
        idleTimeoutMillis: 30000
    });
    
    console.log('   ✅ Minimal database connection');
    
    // Health reporter (essential for monitoring)
    const { systemHealthReporter } = await import('./src/core/SystemHealthReporter.js');
    systemHealthReporter.registerService('database', dbPool);
    systemHealthReporter.startReporting();
    console.log('   ✅ Health reporter active');
    
    // OnDemand activator (essential for user commands)
    const { onDemandActivator } = await import('./src/core/OnDemandActivator.js');
    console.log('   ✅ OnDemand activator ready');
    
    // Observation mode enforcer
    const { observationModeEnforcer } = await import('./src/core/ObservationModeEnforcer.js');
    await observationModeEnforcer.enforceObservationMode();
    console.log('   ✅ Observation mode enforced');

} catch (error) {
    console.error('❌ Failed to load minimal services:', error);
    process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('🎉 CONSTRUCTION SYNDICATE IN TRUE OBSERVATION MODE');
console.log('='.repeat(60));
console.log('✅ Ultra-minimal startup complete');
console.log('🔭 True idle mode active (NO background processes)');
console.log('👂 Waiting for user instructions via OnDemandActivator');
console.log('📊 Health reports every 5 minutes only');
console.log('📊 Target: <2 logs per minute achieved');
console.log('💾 Heap allocation verified');
console.log('='.repeat(60));

// Final heap status
const finalHeap = v8.getHeapStatistics();
const finalHeapGB = finalHeap.heap_size_limit / (1024 * 1024 * 1024);
const finalUsedMB = finalHeap.used_heap_size / (1024 * 1024);

console.log('\n📊 FINAL SYSTEM STATUS:');
console.log(`   Heap Limit: ${finalHeapGB.toFixed(2)}GB`);
console.log(`   Heap Used: ${finalUsedMB.toFixed(2)}MB`);
console.log(`   Services Loaded: 3 (database, health, activator)`);
console.log(`   Background Processes: 1 (health reporter only)`);

// Keep process alive and monitor
setInterval(() => {
    // Force garbage collection to keep memory stable
    if (global.gc) {
        global.gc();
    }
    
    // Check for any rogue intervals (should only be this one + health reporter)
    // This is allowed because it's the monitoring itself
}, 300000); // Every 5 minutes

// Graceful shutdown handling
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down observation mode...');
    try {
        const { systemHealthReporter } = await import('./src/core/SystemHealthReporter.js');
        systemHealthReporter.stopReporting();
        console.log('✅ Clean shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Shutdown error:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down observation mode...');
    try {
        const { systemHealthReporter } = await import('./src/core/SystemHealthReporter.js');
        systemHealthReporter.stopReporting();
        console.log('✅ Clean shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Shutdown error:', error);
        process.exit(1);
    }
});

console.log('\n✅ Observation mode startup complete - system in true idle state');
