#!/usr/bin/env node

/**
 * 🚀 ELIZAOS ARBITRUM FLASH SPECIALIST - MAIN ENTRY POINT
 * Based on official ElizaOS documentation and Project interface
 * This is the proper way to run a true ElizaOS agent
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CHARACTER_FILE = './characters/arbitrum-flash-specialist.character.json';

/**
 * Load character configuration from JSON file
 */
function loadCharacter() {
    const characterPath = join(__dirname, CHARACTER_FILE);
    
    if (!existsSync(characterPath)) {
        throw new Error(`❌ Character file not found: ${characterPath}`);
    }
    
    console.log(`📖 Loading character from: ${characterPath}`);
    
    try {
        const characterData = readFileSync(characterPath, 'utf-8');
        const character = JSON.parse(characterData);
        
        console.log(`✅ Character loaded: ${character.name}`);
        console.log(`📝 Bio: ${character.bio?.substring(0, 100)}...`);
        
        return character;
    } catch (error) {
        throw new Error(`❌ Failed to parse character file: ${error.message}`);
    }
}

/**
 * Initialize character-specific functionality
 */
async function initCharacter({ runtime }) {
    console.log(`🔧 Initializing character: ${runtime.character.name}`);
    
    // Character-specific initialization logic
    // This is where you would add any custom setup for your agent
    
    console.log(`✅ Character initialization complete`);
}

// Load the character
const character = loadCharacter();

// Create the Project Agent configuration (ElizaOS standard)
const arbitrumAgent = {
    character: character,
    init: async (runtime) => initCharacter({ runtime }),
};

// Export the Project configuration (ElizaOS standard)
const project = {
    agents: [arbitrumAgent],
};

export default project; 