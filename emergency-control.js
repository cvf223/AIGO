#!/usr/bin/env node

/**
 * 🚨 EMERGENCY CONSTRUCTION SYNDICATE CONTROL
 * ===========================================
 * Immediate system control for critical situations
 */

import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Emergency commands
const EMERGENCY_COMMANDS = {
    'kill-and-observe': {
        description: 'Kill all processes and start observation mode',
        action: killAndObserve
    },
    
    'switch-to-full': {
        description: 'Switch to full construction mode',
        action: switchToFull
    },
    
    'emergency-stop': {
        description: 'Emergency shutdown of all processes',
        action: emergencyStop
    },
    
    'force-observation': {
        description: 'Force observation mode (local or remote)',
        action: forceObservation
    },
    
    'check-status': {
        description: 'Check current system status',
        action: checkStatus
    },
    
    'validate-heap': {
        description: 'Validate heap memory allocation',
        action: validateHeap
    }
};

/**
 * Kill all processes and start observation mode
 */
async function killAndObserve() {
    console.log('🚨 EMERGENCY: Kill all and start observation mode');
    console.log('='.repeat(50));
    
    // Kill all node processes
    try {
        execSync("pkill -9 -f 'node.*start' 2>/dev/null || true", { stdio: 'inherit' });
        execSync("pkill -9 -f 'bash.*start' 2>/dev/null || true", { stdio: 'inherit' });
        console.log('✅ All existing processes killed');
    } catch (error) {
        console.warn('⚠️ Process killing completed (some may not have existed)');
    }
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Start observation mode
    console.log('\n🔭 Starting observation mode...');
    const child = spawn('node', ['start-syndicate.js', 'observation'], {
        stdio: 'inherit',
        detached: true
    });
    
    child.unref(); // Allow parent to exit
    console.log('✅ Observation mode started');
}

/**
 * Switch to full construction mode
 */
async function switchToFull() {
    console.log('🚀 SWITCHING TO FULL CONSTRUCTION MODE');
    console.log('='.repeat(50));
    
    // Kill current processes
    try {
        execSync("pkill -f 'node.*start' 2>/dev/null || true", { stdio: 'inherit' });
        console.log('✅ Existing processes stopped');
    } catch (error) {
        console.warn('⚠️ Process stopping completed');
    }
    
    // Wait
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start full mode
    console.log('\n🏗️ Starting full construction mode...');
    const child = spawn('node', ['start-syndicate.js', 'full'], {
        stdio: 'inherit',
        detached: true
    });
    
    child.unref();
    console.log('✅ Full construction mode started');
}

/**
 * Emergency shutdown of all processes
 */
async function emergencyStop() {
    console.log('🛑 EMERGENCY SHUTDOWN');
    console.log('='.repeat(30));
    
    try {
        // Kill all syndicate processes
        execSync("pkill -9 -f 'node.*syndicate' 2>/dev/null || true", { stdio: 'inherit' });
        execSync("pkill -9 -f 'node.*start' 2>/dev/null || true", { stdio: 'inherit' });
        execSync("pkill -9 -f 'bash.*start' 2>/dev/null || true", { stdio: 'inherit' });
        
        console.log('✅ Emergency shutdown complete');
        console.log('💀 All syndicate processes terminated');
    } catch (error) {
        console.error('❌ Emergency shutdown error:', error.message);
    }
}

/**
 * Force observation mode
 */
async function forceObservation() {
    console.log('🔭 FORCING OBSERVATION MODE');
    console.log('='.repeat(35));
    
    // Check if we're running on the server
    const isServer = process.argv.includes('--server');
    
    if (isServer) {
        // Remote server command
        console.log('🌐 Executing on remote server...');
        
        const serverCommand = `
            cd ~/LocalBackup && 
            pkill -9 -f 'node.*start' 2>/dev/null || true && 
            sleep 2 && 
            nohup bash start-minimal-clean.sh > logs/emergency-observation-$(date +%Y%m%d_%H%M).log 2>&1 &
        `;
        
        execSync(`ssh root@162.55.83.33 "${serverCommand}"`, { stdio: 'inherit' });
        console.log('✅ Observation mode forced on server');
        
    } else {
        // Local command
        await killAndObserve();
    }
}

/**
 * Check current system status
 */
async function checkStatus() {
    console.log('📊 SYSTEM STATUS CHECK');
    console.log('='.repeat(30));
    
    try {
        // Check for running processes
        const nodeProcesses = execSync("ps aux | grep -E 'node.*start' | grep -v grep || echo 'No Node.js processes'").toString();
        const bashProcesses = execSync("ps aux | grep -E 'bash.*start' | grep -v grep || echo 'No Bash processes'").toString();
        
        console.log('🔍 Running Processes:');
        console.log(nodeProcesses);
        console.log(bashProcesses);
        
        // Check memory usage
        const memoryInfo = execSync('free -h').toString();
        console.log('\n💾 Memory Status:');
        console.log(memoryInfo);
        
    } catch (error) {
        console.error('❌ Status check error:', error.message);
    }
}

/**
 * Validate heap memory allocation
 */
async function validateHeap() {
    console.log('🧠 HEAP MEMORY VALIDATION');
    console.log('='.repeat(35));
    
    // This is limited validation from the control script
    const testScript = `
        import v8 from 'v8';
        const heap = v8.getHeapStatistics();
        const heapGB = heap.heap_size_limit / (1024 * 1024 * 1024);
        console.log('Heap Limit:', heapGB.toFixed(2) + 'GB');
        console.log('Target: 400GB');
        console.log('Status:', heapGB >= 350 ? 'GOOD' : 'FAILED');
    `;
    
    try {
        const child = spawn('node', ['-e', testScript], { stdio: 'inherit' });
        await new Promise((resolve) => {
            child.on('exit', resolve);
        });
    } catch (error) {
        console.error('❌ Heap validation error:', error.message);
    }
}

/**
 * Show usage
 */
function showUsage() {
    console.log('🚨 EMERGENCY CONSTRUCTION SYNDICATE CONTROL');
    console.log('='.repeat(60));
    console.log('\nUsage: node emergency-control.js <command> [options]');
    console.log('\nAVAILABLE COMMANDS:');
    
    Object.entries(EMERGENCY_COMMANDS).forEach(([cmd, config]) => {
        console.log(`\n   ${cmd.padEnd(20)} - ${config.description}`);
    });
    
    console.log('\nEXAMPLES:');
    console.log('   node emergency-control.js kill-and-observe    # Emergency idle mode');
    console.log('   node emergency-control.js emergency-stop      # Shutdown everything');
    console.log('   node emergency-control.js force-observation --server  # Force on server');
    console.log('   node emergency-control.js check-status        # Check what\'s running');
    console.log('\nFor normal startup: node start-syndicate.js [mode]');
    console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
    const command = process.argv[2];
    
    if (!command || command === 'help' || command === '--help') {
        showUsage();
        process.exit(0);
    }
    
    const emergencyCommand = EMERGENCY_COMMANDS[command];
    
    if (!emergencyCommand) {
        console.error(`❌ Unknown command: ${command}`);
        console.error(`Available: ${Object.keys(EMERGENCY_COMMANDS).join(', ')}`);
        process.exit(1);
    }
    
    try {
        console.log(`🚨 Executing: ${command}`);
        await emergencyCommand.action();
        console.log('✅ Emergency command completed');
    } catch (error) {
        console.error('❌ Emergency command failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}

export { EMERGENCY_COMMANDS };
export default main;
