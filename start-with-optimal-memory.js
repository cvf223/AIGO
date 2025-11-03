#!/usr/bin/env node

/**
 * 🚀 ELITE MEMORY-OPTIMIZED STARTUP SCRIPT
 * ========================================= 
 * 
 * Top 1% Expert Solution for 896GB Server Memory Utilization
 * - Configures Node.js for massive memory allocation
 * - Implements proper garbage collection tuning
 * - Provides production-grade memory management
 * - Optimized for construction AI workloads
 */

import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🧠 ELITE MEMORY CONFIGURATION (896GB SERVER OPTIMIZED)
const MEMORY_CONFIG = {
    // Primary heap: 400GB (conservative for stability)
    maxOldSpaceSize: 409600, // 400GB in MB
    
    // Semi-space: 8GB (for new object allocation)
    maxSemiSpaceSize: 8192,   // 8GB in MB
    
    // Enable huge memory mode for systems >16GB
    hugeMaxOldGenerationSize: true,
    
    // Garbage collection optimization
    exposeGC: true,
    useIdleNotification: false,
    maxConcurrentGC: 8,
    
    // Performance optimizations
    traceOptimization: false,
    traceDeoptimization: false,
    useStrictArguments: true
};

// 🔧 BUILD OPTIMAL NODE.JS FLAGS
function buildNodeFlags() {
    const flags = [
        `--max-old-space-size=${MEMORY_CONFIG.maxOldSpaceSize}`,
        `--max-semi-space-size=${MEMORY_CONFIG.maxSemiSpaceSize}`,
        '--expose-gc',
        '--huge-max-old-generation-size',
        '--enable-source-maps',
        '--trace-warnings',
        '--unhandled-rejections=strict',
        '--max-http-header-size=32768'
    ];
    
    return flags;
}

// 🚀 ADVANCED STARTUP FUNCTION
async function startConstructionSyndicate() {
    console.log('🚀 ELITE CONSTRUCTION AI SYNDICATE STARTUP');
    console.log('==========================================');
    
    // Memory diagnostics
    console.log('💾 MEMORY CONFIGURATION:');
    console.log(`   🎯 Target Heap: ${MEMORY_CONFIG.maxOldSpaceSize / 1024}GB`);
    console.log(`   🎯 Semi-space: ${MEMORY_CONFIG.maxSemiSpaceSize / 1024}GB`);
    console.log(`   🎯 Huge memory mode: ENABLED`);
    
    // System memory check
    try {
        const memInfo = execSync('free -g', { encoding: 'utf8' });
        console.log('🖥️ SYSTEM MEMORY:');
        console.log(memInfo);
    } catch (error) {
        console.warn('⚠️ Could not check system memory');
    }
    
    // Build command
    const nodeFlags = buildNodeFlags();
    const scriptPath = join(__dirname, 'startfullsyndicate.js');
    
    console.log('🔧 NODE.JS FLAGS:');
    nodeFlags.forEach(flag => console.log(`   ${flag}`));
    
    console.log('\n🚀 STARTING CONSTRUCTION SYNDICATE...\n');
    
    // Set environment variables
    process.env.NODE_OPTIONS = nodeFlags.join(' ');
    process.env.UV_THREADPOOL_SIZE = '128'; // Increase thread pool for concurrent operations
    process.env.MEMORY_OPTIMIZED = 'true';
    
    // CRITICAL FIX: Use process.execPath to ensure proper flag inheritance
    // The issue was that spawn doesn't properly inherit memory flags
    const child = spawn(process.execPath, [...nodeFlags, scriptPath], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_OPTIONS: nodeFlags.join(' '),
            UV_THREADPOOL_SIZE: '128',
            MEMORY_OPTIMIZED: 'true'
        },
        cwd: __dirname,
        // CRITICAL: Force shell to ensure flags are properly parsed
        shell: false,
        // CRITICAL: Increase max memory for the spawned process
        maxBuffer: 1024 * 1024 * 1024 // 1GB buffer
    });
    
    // Handle process events
    child.on('error', (error) => {
        console.error('❌ STARTUP ERROR:', error);
        process.exit(1);
    });
    
    child.on('exit', (code, signal) => {
        if (code !== 0) {
            console.error(`❌ Process exited with code ${code} and signal ${signal}`);
            process.exit(1);
        }
        console.log('✅ Construction Syndicate shutdown gracefully');
    });
    
    // Handle shutdown signals
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        child.kill('SIGTERM');
    });
}

// 🎯 EXECUTE STARTUP
if (import.meta.url === `file://${process.argv[1]}`) {
    startConstructionSyndicate().catch(error => {
        console.error('❌ FATAL STARTUP ERROR:', error);
        process.exit(1);
    });
}

export { buildNodeFlags, MEMORY_CONFIG };
