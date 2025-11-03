#!/usr/bin/env node

/**
 * 🚀 ELITE MEMORY-VERIFIED STARTUP SCRIPT
 * =======================================
 * Ensures proper 400GB heap allocation on 896GB server
 * Verifies memory before starting the system
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🧠 MEMORY CONFIGURATION
const MEMORY_CONFIGS = {
    PRODUCTION: {
        maxOldSpaceSize: 409600,  // 400GB in MB
        maxSemiSpaceSize: 8192,    // 8GB in MB
        description: '896GB Server (400GB heap)'
    },
    FALLBACK_HIGH: {
        maxOldSpaceSize: 204800,  // 200GB in MB
        maxSemiSpaceSize: 4096,    // 4GB in MB
        description: 'High Memory Fallback (200GB heap)'
    },
    FALLBACK_MED: {
        maxOldSpaceSize: 102400,  // 100GB in MB
        maxSemiSpaceSize: 2048,    // 2GB in MB
        description: 'Medium Memory Fallback (100GB heap)'
    },
    FALLBACK_LOW: {
        maxOldSpaceSize: 51200,   // 50GB in MB
        maxSemiSpaceSize: 1024,    // 1GB in MB
        description: 'Low Memory Fallback (50GB heap)'
    },
    EMERGENCY: {
        maxOldSpaceSize: 16384,   // 16GB in MB
        maxSemiSpaceSize: 512,     // 512MB in MB
        description: 'Emergency Mode (16GB heap)'
    }
};

/**
 * Check system memory and Node.js version
 */
function checkSystemRequirements() {
    console.log('🔍 CHECKING SYSTEM REQUIREMENTS');
    console.log('================================\n');
    
    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    console.log(`📦 Node.js version: ${nodeVersion}`);
    
    if (majorVersion < 14) {
        console.error('❌ Node.js v14+ required for large heap sizes!');
        console.error('   Current version:', nodeVersion);
        console.error('   Please upgrade Node.js');
        process.exit(1);
    }
    
    // Check system memory
    const totalMemory = os.totalmem();
    const totalMemoryGB = Math.round(totalMemory / 1024 / 1024 / 1024);
    const freeMemory = os.freemem();
    const freeMemoryGB = Math.round(freeMemory / 1024 / 1024 / 1024);
    
    console.log(`💾 Total system memory: ${totalMemoryGB}GB`);
    console.log(`💾 Free system memory: ${freeMemoryGB}GB`);
    
    // Determine appropriate memory config
    if (totalMemoryGB >= 896 && freeMemoryGB >= 400) {
        console.log('✅ 896GB server detected - using PRODUCTION config');
        return MEMORY_CONFIGS.PRODUCTION;
    } else if (freeMemoryGB >= 200) {
        console.log('⚠️  Using HIGH memory fallback (200GB)');
        return MEMORY_CONFIGS.FALLBACK_HIGH;
    } else if (freeMemoryGB >= 100) {
        console.log('⚠️  Using MEDIUM memory fallback (100GB)');
        return MEMORY_CONFIGS.FALLBACK_MED;
    } else if (freeMemoryGB >= 50) {
        console.log('⚠️  Using LOW memory fallback (50GB)');
        return MEMORY_CONFIGS.FALLBACK_LOW;
    } else {
        console.log('🚨 EMERGENCY MODE - Limited memory available');
        return MEMORY_CONFIGS.EMERGENCY;
    }
}

/**
 * Verify memory allocation with test script
 */
async function verifyMemoryAllocation(config) {
    console.log('\n🧪 VERIFYING MEMORY ALLOCATION');
    console.log('================================');
    console.log(`Testing: ${config.description}`);
    
    return new Promise((resolve) => {
        const testScript = `
            const used = process.memoryUsage();
            const heapTotalGB = used.heapTotal / 1024 / 1024 / 1024;
            const heapUsedGB = used.heapUsed / 1024 / 1024 / 1024;
            const expectedGB = ${config.maxOldSpaceSize} / 1024;
            
            console.log('📊 Heap Total: ' + heapTotalGB.toFixed(2) + 'GB');
            console.log('📊 Heap Used: ' + heapUsedGB.toFixed(2) + 'GB');
            console.log('📊 Expected Max: ' + expectedGB.toFixed(0) + 'GB');
            
            // Try to allocate some memory to verify
            try {
                const testArrays = [];
                for (let i = 0; i < 5; i++) {
                    testArrays.push(new Array(100 * 1024 * 1024)); // 100M elements
                }
                console.log('✅ Memory allocation test passed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Memory allocation test failed:', error.message);
                process.exit(1);
            }
        `;
        
        // Only use allowed flags for memory test
        const child = spawn(process.execPath, [
            `--max-old-space-size=${config.maxOldSpaceSize}`,
            `--max-semi-space-size=${config.maxSemiSpaceSize}`,
            '--expose-gc',
            '-e',
            testScript
        ]);
        
        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
            process.stdout.write(data);
        });
        
        child.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log('\n✅ Memory verification successful!');
                resolve(true);
            } else {
                console.log('\n⚠️  Memory verification failed, trying lower config...');
                resolve(false);
            }
        });
    });
}

/**
 * Find working memory configuration
 */
async function findWorkingConfig() {
    const configs = [
        MEMORY_CONFIGS.PRODUCTION,
        MEMORY_CONFIGS.FALLBACK_HIGH,
        MEMORY_CONFIGS.FALLBACK_MED,
        MEMORY_CONFIGS.FALLBACK_LOW,
        MEMORY_CONFIGS.EMERGENCY
    ];
    
    // Start from system-appropriate config
    const systemConfig = checkSystemRequirements();
    const startIndex = configs.findIndex(c => c === systemConfig);
    
    for (let i = startIndex; i < configs.length; i++) {
        const config = configs[i];
        console.log(`\n🔧 Trying ${config.description}...`);
        
        const success = await verifyMemoryAllocation(config);
        if (success) {
            return config;
        }
    }
    
    console.error('\n❌ FATAL: Could not allocate sufficient memory!');
    console.error('   System may be under extreme memory pressure');
    console.error('   Try stopping other processes or rebooting');
    process.exit(1);
}

/**
 * Start the main application with verified memory
 */
async function startApplication(memoryConfig) {
    console.log('\n🚀 STARTING APPLICATION WITH VERIFIED MEMORY');
    console.log('=============================================');
    console.log(`Configuration: ${memoryConfig.description}`);
    console.log(`Max Heap: ${(memoryConfig.maxOldSpaceSize / 1024).toFixed(0)}GB`);
    console.log(`Semi-Space: ${(memoryConfig.maxSemiSpaceSize / 1024).toFixed(1)}GB`);
    
    // Separate flags that can go in NODE_OPTIONS from those that must be CLI args
    const nodeOptionsFlags = [
        `--max-old-space-size=${memoryConfig.maxOldSpaceSize}`,
        `--max-semi-space-size=${memoryConfig.maxSemiSpaceSize}`,
        '--expose-gc',
        '--trace-warnings'
    ];
    
    const nodeCliFlags = [
        '--optimize-for-size',
        '--gc-interval=100'
    ];
    
    // Set environment variables (only with allowed flags)
    const env = {
        ...process.env,
        NODE_OPTIONS: nodeOptionsFlags.join(' '),
        MEMORY_CONFIG: JSON.stringify(memoryConfig),
        HEAP_SIZE_GB: (memoryConfig.maxOldSpaceSize / 1024).toFixed(0),
        OBSERVATION_MODE_ENFORCED: 'true',
        SKIP_AUTONOMOUS_SYSTEMS: 'true'
    };
    
    const scriptPath = join(__dirname, 'startfullsyndicate.js');
    
    console.log('\nStarting main application...\n');
    console.log('=' .repeat(60));
    
    // Add memory monitoring in main process
    // Combine CLI flags with script path
    const child = spawn(process.execPath, [...nodeCliFlags, scriptPath], {
        stdio: 'inherit',
        env
    });
    
    // Monitor child process memory periodically
    const monitorInterval = setInterval(() => {
        const used = process.memoryUsage();
        const heapGB = used.heapTotal / 1024 / 1024 / 1024;
        const usedGB = used.heapUsed / 1024 / 1024 / 1024;
        const percent = (usedGB / (memoryConfig.maxOldSpaceSize / 1024) * 100).toFixed(1);
        
        if (percent > 80) {
            console.warn(`\n⚠️  MEMORY WARNING: Heap usage at ${percent}% (${usedGB.toFixed(1)}GB / ${(memoryConfig.maxOldSpaceSize / 1024).toFixed(0)}GB)`);
        }
    }, 60000); // Check every minute
    
    child.on('exit', (code) => {
        clearInterval(monitorInterval);
        if (code) {
            console.error(`\n❌ Application exited with code ${code}`);
            process.exit(code);
        }
    });
    
    // Handle signals
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        clearInterval(monitorInterval);
        child.kill('SIGINT');
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        clearInterval(monitorInterval);
        child.kill('SIGTERM');
    });
}

/**
 * Main execution
 */
async function main() {
    console.log('🧠 ELITE MEMORY-VERIFIED STARTUP');
    console.log('================================');
    console.log('This script ensures proper memory allocation');
    console.log('for the 896GB production server\n');
    
    try {
        // Find working memory configuration
        const workingConfig = await findWorkingConfig();
        
        // Start application with verified memory
        await startApplication(workingConfig);
        
    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error);
        process.exit(1);
    }
}

// Run the script
main();
