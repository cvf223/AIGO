#!/usr/bin/env node

/**
 * 🚀 SIMPLIFIED AIGO-SYNDICATE LAUNCHER
 * =====================================
 * 
 * Starts the core system without complex monitoring
 * All runs on production server (896GB RAM)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║      🚀 STARTING AIGO-SYNDICATE (SIMPLIFIED) 🚀             ║');
console.log('║                                                              ║');
console.log('║      Running on 896GB Production Server                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

// Start the main construction backend
const mainProcess = spawn('node', [
    path.join(__dirname, 'src', 'web', 'construction-gui-server.js')
], {
    stdio: 'inherit',
    env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: '3001',
        HOST: '0.0.0.0',
        NODE_OPTIONS: '--max-old-space-size=716800'  // 700GB for Node.js
    }
});

mainProcess.on('error', (err) => {
    console.error('❌ Failed to start:', err);
    process.exit(1);
});

mainProcess.on('exit', (code) => {
    console.log(`Process exited with code ${code}`);
    process.exit(code);
});

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n📛 Shutting down gracefully...');
    mainProcess.kill('SIGINT');
    setTimeout(() => process.exit(0), 5000);
});

process.on('SIGTERM', () => {
    console.log('\n📛 Terminating...');
    mainProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 5000);
});

console.log('✅ System launched successfully!');
console.log('');
console.log('🌐 Access points:');
console.log(`   Web GUI: http://162.55.83.33:3001`);
console.log('');
console.log('Press Ctrl+C to stop');
console.log('');
