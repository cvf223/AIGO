#!/usr/bin/env node

/**
 * 🚀 ARBITRUM FLASH SPECIALIST - SIMPLE RUNNER
 * Uses installed npm packages to run the agent directly
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { createAgent } from '@elizaos/core';
import { DirectClient } from '@elizaos/client-direct';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CHARACTER_FILE = './characters/arbitrum-flash-specialist.character.json';

async function loadCharacter() {
    const characterPath = join(__dirname, CHARACTER_FILE);
    
    if (!existsSync(characterPath)) {
        throw new Error(`❌ Character file not found: ${characterPath}`);
    }
    
    console.log(`📖 Loading character from: ${characterPath}`);
    const characterData = readFileSync(characterPath, 'utf8');
    const character = JSON.parse(characterData);
    
    // Validate required fields
    if (!character.name) {
        throw new Error('❌ Character must have a name');
    }
    
    console.log(`✅ Character loaded: ${character.name}`);
    return character;
}

function getTokenForProvider(modelProvider, character) {
    const secrets = character.settings?.secrets || {};
    
    switch (modelProvider) {
        case 'openai':
            return process.env.OPENAI_API_KEY || secrets.OPENAI_API_KEY;
        case 'anthropic':
            return process.env.ANTHROPIC_API_KEY || secrets.ANTHROPIC_API_KEY;
        case 'claude':
            return process.env.CLAUDE_API_KEY || secrets.CLAUDE_API_KEY;
        default:
            throw new Error(`❌ Unsupported model provider: ${modelProvider}`);
    }
}

async function main() {
    try {
        console.log('🚀 STARTING ARBITRUM FLASH SPECIALIST AGENT');
        console.log('==========================================');
        
        // Load character configuration
        const character = await loadCharacter();
        
        // Get API token for the model provider
        const token = getTokenForProvider(character.modelProvider, character);
        if (!token) {
            throw new Error(`❌ No API token found for ${character.modelProvider}. Check your .env file.`);
        }
        console.log(`🔑 API token configured for ${character.modelProvider}`);
        
        // Create agent runtime using the installed package
        console.log(`🤖 Creating agent runtime for ${character.name}...`);
        const runtime = await createAgent(character, token);
        
        // Initialize the runtime
        await runtime.initialize();
        console.log('✅ Agent runtime initialized');
        
        // Start direct client
        console.log('🌐 Starting Direct Client...');
        const directClient = new DirectClient();
        directClient.registerAgent(runtime);
        
        // Start the client
        await directClient.start();
        
        console.log('==========================================');
        console.log('🎉 ARBITRUM FLASH SPECIALIST IS LIVE!');
        console.log(`📊 Agent ID: ${runtime.agentId}`);
        console.log(`🌐 Endpoint: http://localhost:3000/${runtime.agentId}/message`);
        console.log('==========================================');
        
        // Keep the process running
        process.on('SIGINT', async () => {
            console.log('\n🛑 Shutting down agent...');
            await directClient.stop();
            process.exit(0);
        });
        
    } catch (error) {
        console.error('❌ Failed to start agent:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the agent
main().catch(console.error); 