#!/usr/bin/env node

/**
 * 🏗️ FULL CONSTRUCTION SYSTEM STARTUP
 * ===================================
 * Complete construction syndicate with all systems active
 * Includes proper error handling and bulletproof initialization
 */

// Set full system mode flags BEFORE any imports
global.OBSERVATION_MODE_ENFORCED = false;
global.SKIP_ALL_SERVICES = false;
global.MINIMAL_MODE = false;
global.FULL_SYSTEM_MODE = true;

import v8 from 'v8';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🏗️ FULL CONSTRUCTION SYSTEM STARTUP');
console.log('='.repeat(60));

// Verify heap allocation
const heapStats = v8.getHeapStatistics();
const heapLimitGB = heapStats.heap_size_limit / (1024 * 1024 * 1024);
const totalSystemGB = os.totalmem() / (1024 * 1024 * 1024);

console.log('💾 SYSTEM VERIFICATION:');
console.log(`   System RAM: ${totalSystemGB.toFixed(0)}GB`);
console.log(`   Node Heap Limit: ${heapLimitGB.toFixed(2)}GB`);
console.log(`   Mode: FULL SYSTEM`);

if (heapLimitGB < 100) {
    console.warn('⚠️ WARNING: Heap may be too small for full system');
    console.warn(`   Current: ${heapLimitGB.toFixed(2)}GB`);
    console.warn('   Consider using start-syndicate.js with heap enforcement');
}

// Import and start the main system
try {
    console.log('\n🚀 Loading main startup system...');
    
    // Import the main startup but with full system flags set
    const { default: mainStartup } = await import('./startfullsyndicate.js');
    
    console.log('✅ Full system startup initiated');
    
    // The main startup will handle everything from here
    // It will see that FULL_SYSTEM_MODE is true and load all services
    
} catch (error) {
    console.error('❌ Failed to start full system:', error);
    
    // Enhanced error reporting for debugging
    console.error('\n🔍 ERROR ANALYSIS:');
    console.error(`   Error type: ${error.constructor.name}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.stack) {
        const relevantStack = error.stack
            .split('\n')
            .slice(0, 10)
            .join('\n');
        console.error(`   Stack: ${relevantStack}`);
    }
    
    console.error('\n💡 SUGGESTED ACTIONS:');
    console.error('   1. Try: node start-syndicate.js observation  # Start in safe mode');
    console.error('   2. Try: node emergency-control.js check-status  # Check system');
    console.error('   3. Check logs for more details');
    console.error('   4. Ensure database is running');
    
    process.exit(1);
}

// Handle termination gracefully
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT - shutting down full system...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM - shutting down full system...');
    process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 UNHANDLED REJECTION in full system:', reason);
    console.error('   Promise:', promise);
    console.error('   Consider switching to observation mode for stability');
});

process.on('uncaughtException', (error) => {
    console.error('💥 UNCAUGHT EXCEPTION in full system:', error);
    console.error('   Consider switching to observation mode for stability');
    process.exit(1);
});

console.log('\n✅ Full system startup script loaded');
console.log('📋 All services will be initialized');
console.log('🏗️ Ready for complete construction work');
