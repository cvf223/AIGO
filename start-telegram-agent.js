#!/usr/bin/env node

/**
 * 🚀 SIMPLE TELEGRAM LAUNCHER - WORKING VERSION
 * Minimal setup to get Telegram bot running without errors
 */

import { readFileSync, existsSync } from 'fs';
import { spawn } from 'child_process';

console.log('🚀 STARTING ARBITRUM FLASH SPECIALIST WITH TELEGRAM');
console.log('═══════════════════════════════════════════════════════════════');

// Check if character file exists
const characterFile = './characters/arbitrum-flash-specialist.character.json';
if (!existsSync(characterFile)) {
    console.error('❌ Character file not found:', characterFile);
    process.exit(1);
}

// Read character configuration
let character;
try {
    character = JSON.parse(readFileSync(characterFile, 'utf8'));
    console.log(`✅ Loaded character: ${character.name}`);
} catch (error) {
    console.error('❌ Failed to load character:', error.message);
    process.exit(1);
}

// Check if pool management action exists
const hasPoolAction = character.actions?.some(action => action.name === 'MANAGE_POOL_CANDIDATES');
console.log(`📋 Pool Management Action: ${hasPoolAction ? '✅ Available' : '❌ Missing'}`);

// Check Telegram configuration
const telegramToken = character.settings?.secrets?.TELEGRAM_BOT_TOKEN;
console.log(`📱 Telegram Token: ${telegramToken ? '✅ Configured' : '❌ Missing'}`);

if (!telegramToken) {
    console.error('❌ TELEGRAM_BOT_TOKEN not found in character settings');
    process.exit(1);
}

console.log('\n🎯 TELEGRAM POOL MANAGEMENT COMMANDS:');
console.log('• "show pools" - View current pool list');
console.log('• "show candidates" - View discovered candidates');
console.log('• "add candidates" - Add candidates to pool list');
console.log('• "pool stats" - Show comprehensive statistics');

console.log('\n💡 EXAMPLE TELEGRAM MESSAGES:');
console.log('• "show me the current pools"');
console.log('• "what new pool candidates do we have?"');
console.log('• "add the new candidates to my pool list"');
console.log('• "give me pool statistics"');

console.log('\n🚀 Starting Telegram bot...');
console.log('═══════════════════════════════════════════════════════════════');

// Use the working direct agent approach but with Telegram
const args = [
    'run-arbitrum-agent-direct.js'
];

// Set environment variable for Telegram mode
process.env.USE_TELEGRAM = 'true';
process.env.TELEGRAM_BOT_TOKEN = telegramToken;

const child = spawn('node', args, {
    stdio: 'inherit',
    env: { ...process.env }
});

child.on('error', (error) => {
    console.error('❌ Failed to start agent:', error.message);
    process.exit(1);
});

child.on('exit', (code) => {
    if (code === 0) {
        console.log('✅ Agent stopped successfully');
    } else {
        console.error(`❌ Agent stopped with code: ${code}`);
    }
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Telegram agent...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down Telegram agent...');
    child.kill('SIGTERM');
}); 