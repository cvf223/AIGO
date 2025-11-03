#!/usr/bin/env node

/**
 * 🚀 START CONSTRUCTION SYNDICATE WITH ERROR TOLERANCE
 * ==================================================
 * 
 * This script starts the syndicate with enhanced error handling
 * to allow it to continue running despite non-critical errors
 */

import { spawn } from 'child_process';
import fs from 'fs';

console.log('🚀 STARTING CONSTRUCTION SYNDICATE WITH ERROR TOLERANCE');
console.log('====================================================');

// Create startup script on server
const startupScript = `#!/usr/bin/env node

// Enhanced error handling
process.on('uncaughtException', (error) => {
    console.error('⚠️ Uncaught Exception (handled):', error.message);
    console.error(error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Unhandled Rejection (handled) at:', promise, 'reason:', reason);
});

// Set environment for maximum tolerance
process.env.NODE_ENV = 'production';
process.env.SKIP_OLLAMA = 'true'; // Skip if Ollama has issues
process.env.CONTINUE_ON_ERROR = 'true';

// Import and start
import('./startfullsyndicate.js').then(async (module) => {
    console.log('✅ Module loaded successfully');
    
    // If there's a main function, call it
    if (module.main) {
        await module.main();
    }
}).catch(error => {
    console.error('❌ Failed to load main module:', error.message);
    console.error(error.stack);
});

// Keep process alive
setInterval(() => {
    console.log('💓 Construction Syndicate heartbeat -', new Date().toISOString());
}, 60000); // Every minute
`;

// Write the script
fs.writeFileSync('/tmp/start-tolerant.js', startupScript);

// Deploy to server
console.log('📦 Deploying error-tolerant startup script...');
const deploy = spawn('scp', ['/tmp/start-tolerant.js', 'root@162.55.83.33:/root/LocalBackup/']);

deploy.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Script deployed successfully');
        
        // Run the script
        console.log('🚀 Starting Construction Syndicate...');
        const ssh = spawn('ssh', ['root@162.55.83.33', 'cd /root/LocalBackup && node start-tolerant.js']);
        
        ssh.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        ssh.stderr.on('data', (data) => {
            process.stderr.write(data);
        });
        
        ssh.on('close', (code) => {
            console.log(`Process exited with code ${code}`);
        });
        
        // Handle CTRL+C
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping Construction Syndicate...');
            ssh.kill();
            process.exit();
        });
        
    } else {
        console.error('❌ Failed to deploy script');
    }
});
