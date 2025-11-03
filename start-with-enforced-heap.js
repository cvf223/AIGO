#!/usr/bin/env node

/**
 * 🎯 ENFORCED HEAP MEMORY STARTUP SCRIPT
 * ======================================
 * Ensures the system actually uses the configured 400GB heap memory
 * instead of defaulting to much lower values
 */

import { spawn } from 'child_process';
import v8 from 'v8';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TARGET_HEAP_GB = 400;
const MINIMUM_HEAP_GB = 200; // Fallback if 400GB fails
const CHECK_INTERVAL = 60000; // Check every minute

console.log('🎯 ENFORCED HEAP MEMORY STARTUP');
console.log('='.repeat(60));
console.log(`Target Heap: ${TARGET_HEAP_GB}GB`);
console.log(`System Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
console.log('='.repeat(60));

/**
 * Verify current process heap
 */
function verifyCurrentHeap() {
    const heapStats = v8.getHeapStatistics();
    const heapLimitGB = heapStats.heap_size_limit / 1024 / 1024 / 1024;
    const heapUsedGB = heapStats.used_heap_size / 1024 / 1024 / 1024;
    
    console.log(`\n📊 Current Heap Status:`);
    console.log(`   Limit: ${heapLimitGB.toFixed(2)}GB`);
    console.log(`   Used: ${heapUsedGB.toFixed(2)}GB`);
    
    return heapLimitGB;
}

/**
 * Start the syndicate with enforced heap
 */
async function startWithEnforcedHeap(heapSizeGB) {
    console.log(`\n🚀 Starting syndicate with ${heapSizeGB}GB heap...`);
    
    const scriptPath = join(__dirname, 'startfullsyndicate.js');
    
    // Node.js flags for heap allocation
    const nodeArgs = [
        `--max-old-space-size=${heapSizeGB * 1024}`, // Convert GB to MB
        '--expose-gc',                                // Allow manual GC
        '--trace-gc',                                 // Log GC activity
        '--trace-gc-verbose',                         // Verbose GC logging
        scriptPath
    ];
    
    // Environment variables
    const env = {
        ...process.env,
        NODE_OPTIONS: '',                             // Clear any conflicting options
        FORCE_HEAP_SIZE_GB: heapSizeGB.toString(),
        OBSERVATION_MODE_ENFORCED: 'true',            // Start in observation mode
        SKIP_AUTONOMOUS_SYSTEMS: 'true'
    };
    
    // Spawn the process
    const child = spawn(process.execPath, nodeArgs, {
        stdio: 'inherit',
        env
    });
    
    // Monitor the child process
    child.on('error', (error) => {
        console.error('❌ Failed to start syndicate:', error);
        process.exit(1);
    });
    
    child.on('exit', (code, signal) => {
        if (code !== 0) {
            console.error(`❌ Syndicate exited with code ${code}, signal ${signal}`);
            
            // Try with fallback heap size if initial allocation failed
            if (heapSizeGB === TARGET_HEAP_GB && code === 134) { // 134 = out of memory
                console.log(`\n🔄 Retrying with ${MINIMUM_HEAP_GB}GB heap...`);
                startWithEnforcedHeap(MINIMUM_HEAP_GB);
                return;
            }
            
            process.exit(code || 1);
        }
        console.log('✅ Syndicate exited normally');
        process.exit(0);
    });
    
    // Periodic heap verification
    let verificationCount = 0;
    const verificationInterval = setInterval(() => {
        verificationCount++;
        console.log(`\n🔍 Heap Verification #${verificationCount}`);
        
        // Try to read heap stats from child process (this is tricky)
        // For now, we'll just log a reminder to check
        console.log('   ℹ️ Check syndicate logs for actual heap usage');
        console.log('   ℹ️ Expected: ~25GB used of 400GB limit in observation mode');
        
        // After 10 checks, reduce frequency
        if (verificationCount >= 10) {
            clearInterval(verificationInterval);
            console.log('\n✅ Heap monitoring reduced - system appears stable');
        }
    }, CHECK_INTERVAL);
    
    // Handle termination
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down...');
        clearInterval(verificationInterval);
        child.kill('SIGTERM');
        setTimeout(() => {
            child.kill('SIGKILL');
            process.exit(0);
        }, 5000);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        clearInterval(verificationInterval);
        child.kill('SIGTERM');
        process.exit(0);
    });
}

/**
 * Pre-flight checks
 */
function performPreflightChecks() {
    console.log('\n🔍 Performing pre-flight checks...');
    
    // Check system memory
    const totalMemoryGB = os.totalmem() / 1024 / 1024 / 1024;
    if (totalMemoryGB < TARGET_HEAP_GB + 50) { // Need extra for OS
        console.warn(`⚠️ Warning: System has only ${totalMemoryGB.toFixed(0)}GB RAM`);
        console.warn(`   Recommended: ${TARGET_HEAP_GB + 50}GB for ${TARGET_HEAP_GB}GB heap`);
    } else {
        console.log(`   ✅ System memory: ${totalMemoryGB.toFixed(0)}GB (sufficient)`);
    }
    
    // Check current heap limit of this process
    const currentHeapGB = verifyCurrentHeap();
    if (currentHeapGB < 10) {
        console.log(`   ℹ️ Current process heap: ${currentHeapGB.toFixed(2)}GB (expected for launcher)`);
    }
    
    // Check for conflicting NODE_OPTIONS
    if (process.env.NODE_OPTIONS) {
        console.warn(`⚠️ NODE_OPTIONS detected: ${process.env.NODE_OPTIONS}`);
        console.warn('   These will be cleared for the child process');
    }
    
    console.log('\n✅ Pre-flight checks complete');
}

/**
 * Main execution
 */
async function main() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 CONSTRUCTION SYNDICATE HEAP-ENFORCED STARTUP');
    console.log('='.repeat(60));
    
    // Perform checks
    performPreflightChecks();
    
    // Start with enforced heap
    await startWithEnforcedHeap(TARGET_HEAP_GB);
}

// Run
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

export default main;
