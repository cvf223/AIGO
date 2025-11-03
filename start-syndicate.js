#!/usr/bin/env node

/**
 * 🎯 MASTER CONSTRUCTION SYNDICATE CONTROL
 * ========================================
 * Single entry point that automatically selects the best startup mode
 * Prevents confusion and ensures the right approach is used
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import v8 from 'v8';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Available startup modes
const STARTUP_MODES = {
    observation: {
        script: './start-minimal-clean.sh',
        description: 'TRUE idle mode - minimal services, 400GB heap, <2 logs/min',
        heap: '400GB',
        services: '3 only',
        background: '1 process only',
        purpose: 'Idle monitoring and on-demand activation'
    },
    
    full: {
        script: './start-full-system.sh',
        description: 'Complete construction work - all systems active',
        heap: '400GB',
        services: 'All systems',
        background: 'Many processes',
        purpose: 'Full construction project management'
    },
    
    debug: {
        script: './start-debug-mode.js', 
        description: 'Development testing - selected systems only',
        heap: 'Flexible',
        services: 'Selected only',
        background: 'Limited processes',
        purpose: 'Development and troubleshooting'
    }
};

/**
 * Show usage information
 */
function showUsage() {
    console.log('🎯 CONSTRUCTION SYNDICATE MASTER CONTROL');
    console.log('='.repeat(60));
    console.log('\nUsage: node start-syndicate.js [mode] [options]');
    console.log('\nAVAILABLE MODES:');
    
    Object.entries(STARTUP_MODES).forEach(([mode, config]) => {
        console.log(`\n📋 ${mode.toUpperCase()} MODE:`);
        console.log(`   ${config.description}`);
        console.log(`   Script: ${config.script}`);
        console.log(`   Heap: ${config.heap}`);
        console.log(`   Services: ${config.services}`);
        console.log(`   Background: ${config.background}`);
        console.log(`   Purpose: ${config.purpose}`);
    });
    
    console.log('\nEXAMPLES:');
    console.log('   node start-syndicate.js observation  # Default idle mode');
    console.log('   node start-syndicate.js full         # Full construction work');
    console.log('   node start-syndicate.js debug        # Development testing');
    console.log('\nFor emergency control: node emergency-control.js');
    console.log('='.repeat(60));
}

/**
 * Validate system requirements
 */
async function validateSystemRequirements(mode) {
    console.log('\n🔍 VALIDATING SYSTEM REQUIREMENTS');
    console.log('='.repeat(40));
    
    const totalMemoryGB = os.totalmem() / (1024 * 1024 * 1024);
    const currentHeapGB = v8.getHeapStatistics().heap_size_limit / (1024 * 1024 * 1024);
    
    console.log(`📊 System RAM: ${totalMemoryGB.toFixed(0)}GB`);
    console.log(`📊 Current Heap: ${currentHeapGB.toFixed(2)}GB`);
    console.log(`📊 Target Mode: ${mode.toUpperCase()}`);
    
    // Check requirements based on mode
    if (mode === 'observation' || mode === 'full') {
        if (totalMemoryGB < 350) {
            console.error('❌ ERROR: Insufficient RAM for 400GB heap allocation');
            console.error(`   Required: 450GB+, Available: ${totalMemoryGB.toFixed(0)}GB`);
            return false;
        }
    }
    
    // Check if scripts exist
    const modeConfig = STARTUP_MODES[mode];
    const scriptPath = join(__dirname, modeConfig.script);
    
    try {
        // Use dynamic import properly
        const fs = await import('fs');
        fs.statSync(scriptPath);
        console.log(`✅ Script exists: ${modeConfig.script}`);
    } catch (error) {
        console.error(`❌ ERROR: Script not found: ${modeConfig.script}`);
        return false;
    }
    
    console.log('✅ System requirements validated');
    return true;
}

/**
 * Start the syndicate in the specified mode
 */
async function startSyndicate(mode, options = {}) {
    console.log('\n🚀 STARTING CONSTRUCTION SYNDICATE');
    console.log('='.repeat(60));
    
    const modeConfig = STARTUP_MODES[mode];
    console.log(`📋 Mode: ${mode.toUpperCase()}`);
    console.log(`📋 Description: ${modeConfig.description}`);
    console.log(`📋 Script: ${modeConfig.script}`);
    
    // Validate requirements
    if (!await validateSystemRequirements(mode)) {
        console.error('❌ System requirements not met');
        process.exit(1);
    }
    
    // Set environment based on mode
    const env = {
        ...process.env,
        SYNDICATE_MODE: mode.toUpperCase(),
        STARTUP_MODE: mode
    };
    
    if (mode === 'observation') {
        env.OBSERVATION_MODE_ENFORCED = 'true';
        env.SKIP_ALL_SERVICES = 'true';
        env.MINIMAL_MODE = 'true';
    }
    
    // Start the appropriate script
    console.log(`\n🎯 Executing: ${modeConfig.script}`);
    console.log('='.repeat(60));
    
    const scriptPath = modeConfig.script.startsWith('./') 
        ? join(__dirname, modeConfig.script.substring(2))
        : modeConfig.script;
    
    const child = spawn('bash', [scriptPath], {
        stdio: 'inherit',
        env
    });
    
    // Handle process events
    child.on('error', (error) => {
        console.error('❌ Failed to start syndicate:', error);
        process.exit(1);
    });
    
    child.on('exit', (code, signal) => {
        if (code !== 0) {
            console.error(`❌ Syndicate exited with code ${code}, signal ${signal}`);
            process.exit(code || 1);
        }
        console.log('✅ Syndicate exited normally');
        process.exit(0);
    });
    
    // Handle termination signals
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down...');
        child.kill('SIGTERM');
        setTimeout(() => {
            child.kill('SIGKILL');
            process.exit(0);
        }, 5000);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, shutting down...');
        child.kill('SIGTERM');
        process.exit(0);
    });
}

/**
 * Main execution
 */
async function main() {
    const mode = process.argv[2];
    const options = process.argv.slice(3);
    
    // Show usage if no mode specified or help requested
    if (!mode || mode === 'help' || mode === '--help' || mode === '-h') {
        showUsage();
        process.exit(0);
    }
    
    // Validate mode
    if (!STARTUP_MODES[mode]) {
        console.error(`❌ ERROR: Unknown mode '${mode}'`);
        console.error(`Available modes: ${Object.keys(STARTUP_MODES).join(', ')}`);
        process.exit(1);
    }
    
    // Start syndicate
    await startSyndicate(mode, options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

export { startSyndicate, STARTUP_MODES };
export default main;