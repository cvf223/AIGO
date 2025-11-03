#!/usr/bin/env node

/**
 * 🚀 SIMPLE TELEGRAM AGENT - BYPASS COMPLEXITY
 * Just get the damn thing working!
 */

import { readFileSync, existsSync } from 'fs';

console.log('🚀 TELEGRAM AGENT - SIMPLE APPROACH');
console.log('═══════════════════════════════════════════════════════════════');

// Check character file
const characterFile = './characters/arbitrum-flash-specialist.character.json';
if (!existsSync(characterFile)) {
    console.error('❌ Character file not found');
    process.exit(1);
}

const character = JSON.parse(readFileSync(characterFile, 'utf8'));
console.log(`✅ Character: ${character.name}`);

// Check pool action
const hasPoolAction = character.actions?.some(action => action.name === 'MANAGE_POOL_CANDIDATES');
console.log(`📋 Pool Action: ${hasPoolAction ? '✅' : '❌'}`);

// Check token
const telegramToken = character.settings?.secrets?.TELEGRAM_BOT_TOKEN;
console.log(`📱 Token: ${telegramToken ? '✅' : '❌'}`);

if (!telegramToken) {
    console.error('❌ No Telegram token found');
    process.exit(1);
}

console.log('\n🎯 POOL COMMANDS:');
console.log('• "show pools"');
console.log('• "show candidates"');
console.log('• "add candidates"');
console.log('• "pool stats"');

console.log('\n🚀 Starting bot...');

// Use the built-in npm script approach
import { spawn } from 'child_process';

const child = spawn('npx', ['eliza', '--character', characterFile, '--client', 'telegram'], {
    stdio: 'inherit',
    env: { 
        ...process.env,
        TELEGRAM_BOT_TOKEN: telegramToken
    }
});

child.on('error', (error) => {
    console.error('❌ Error:', error.message);
    
    // Fallback: try direct node execution
    console.log('🔄 Trying direct approach...');
    
    const fallback = spawn('node', ['run-arbitrum-agent-direct.js'], {
        stdio: 'inherit',
        env: { 
            ...process.env,
            USE_TELEGRAM: 'true',
            TELEGRAM_BOT_TOKEN: telegramToken
        }
    });
    
    fallback.on('error', (err) => {
        console.error('❌ Fallback failed:', err.message);
        process.exit(1);
    });
});

child.on('exit', (code) => {
    console.log(`Agent exited with code: ${code}`);
    process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down...');
    child.kill('SIGTERM');
}); 