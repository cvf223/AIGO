/**
 * 🎭 CHARACTER CONFIGURATION INTEGRATION SYSTEM
 * =============================================
 * 
 * BRUTAL TRUTH: Single source of truth for ALL agent capabilities!
 * Loads real character.json files and applies their settings system-wide.
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

class CharacterIntegrationSystem extends EventEmitter {
    constructor() {
        super();
        this.loadedCharacters = new Map();
        this.characterConfigs = new Map();
        this.capabilityMappings = new Map();
        this.isInitialized = false;
    }

    /**
     * 🚀 INITIALIZE CHARACTER SYSTEM
     * ==============================
     */
    async initialize() {
        console.log('🎭 INITIALIZING CHARACTER CONFIGURATION SYSTEM');
        console.log('='.repeat(60));
        
        // Discover all character files
        await this.discoverCharacterFiles();
        
        // Load character configurations
        await this.loadCharacterConfigurations();
        
        // Map capabilities to system functions
        await this.mapCapabilitiesToSystem();
        
        console.log('✅ Character integration system initialized');
        this.isInitialized = true;
        
        return this.getSystemSummary();
    }

    /**
     * 🔍 DISCOVER CHARACTER FILES
     * ===========================
     */
    async discoverCharacterFiles() {
        const characterDirs = [
            './characters',
            './characters/team-leaders'
        ];

        console.log('🔍 DISCOVERING CHARACTER FILES');
        console.log('-'.repeat(40));

        let totalFound = 0;

        for (const dir of characterDirs) {
            if (fs.existsSync(dir)) {
                const files = fs.readdirSync(dir)
                    .filter(file => file.endsWith('.character.json'))
                    .map(file => path.join(dir, file));

                console.log(`📁 ${dir}: ${files.length} character files`);
                
                for (const file of files) {
                    const characterName = path.basename(file, '.character.json');
                    this.characterConfigs.set(characterName, file);
                    totalFound++;
                }
            }
        }

        console.log(`✅ Total character files discovered: ${totalFound}`);
    }

    /**
     * 📋 LOAD CHARACTER CONFIGURATIONS
     * ================================
     */
    async loadCharacterConfigurations() {
        console.log('\n📋 LOADING CHARACTER CONFIGURATIONS');
        console.log('-'.repeat(40));

        for (const [characterName, filePath] of this.characterConfigs) {
            try {
                const characterData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                
                // Process and validate character data
                const processedCharacter = this.processCharacterData(characterData, characterName);
                
                this.loadedCharacters.set(characterName, processedCharacter);
                
                console.log(`✅ Loaded: ${processedCharacter.name}`);
                console.log(`   Capabilities: ${Object.keys(processedCharacter.capabilities).length}`);
                
            } catch (error) {
                console.log(`❌ Failed to load ${characterName}: ${error.message}`);
            }
        }

        console.log(`\n✅ Successfully loaded ${this.loadedCharacters.size} characters`);
    }

    /**
     * 🔧 PROCESS CHARACTER DATA
     * =========================
     */
    processCharacterData(characterData, characterName) {
        // Extract capabilities from various possible locations
        const capabilities = this.extractCapabilities(characterData);
        
        return {
            id: characterName,
            name: characterData.name || characterName,
            capabilities,
            reinforcementLearning: characterData.reinforcementLearning || {},
            awarenessConfiguration: characterData.awarenessConfiguration || {},
            settings: characterData.settings || {},
            originalData: characterData
        };
    }

    /**
     * 🎯 EXTRACT CAPABILITIES
     * =======================
     */
    extractCapabilities(characterData) {
        const capabilities = {};
        
        // Extract nested capabilities (like in RL config)
        if (characterData.reinforcementLearning?.capabilities) {
            const rlCapabilities = characterData.reinforcementLearning.capabilities;
            for (const [category, skills] of Object.entries(rlCapabilities)) {
                if (typeof skills === 'object') {
                    for (const [skill, value] of Object.entries(skills)) {
                        capabilities[`${category}_${skill}`] = parseFloat(value) || 0;
                    }
                }
            }
        }

        // Normalize capability values to 0-100 scale
        for (const [key, value] of Object.entries(capabilities)) {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                // Convert 0-1 scale to 0-100 scale
                capabilities[key] = numValue <= 1 ? numValue * 100 : numValue;
            }
        }

        return capabilities;
    }

    /**
     * 🗺️ MAP CAPABILITIES TO SYSTEM
     * =============================
     */
    async mapCapabilitiesToSystem() {
        console.log('\n🗺️ MAPPING CAPABILITIES TO SYSTEM FUNCTIONS');
        console.log('-'.repeat(40));

        // Define capability mappings for different system functions
        const systemMappings = {
            arbitrage: ['flashLoans', 'spotArbitrage', 'crossDex', 'gasMaster'],
            blockchain: ['smartContracts', 'rpcOptimization', 'arbitrum', 'ethereum'],
            trading: ['priceDiscovery', 'riskManagement', 'executionSpeed', 'positionSizing'],
            intelligence: ['patternRecognition', 'competitiveAnalysis', 'marketPrediction', 'strategicThinking'],
            social: ['teamwork', 'communication', 'leadership', 'coordination'],
            learning: ['adaptability', 'transferLearning', 'metaLearning', 'innovationRate']
        };

        // Map each character's capabilities to system functions
        for (const [characterName, character] of this.loadedCharacters) {
            const mappedCapabilities = {};
            
            for (const [systemFunction, capabilityNames] of Object.entries(systemMappings)) {
                let bestValue = 0;
                let matchedCapability = null;
                
                // Find the best matching capability for this system function
                for (const capName of capabilityNames) {
                    const fullCapName = `${systemFunction}_${capName}`;
                    const value = character.capabilities[fullCapName];
                    if (value !== undefined && value > bestValue) {
                        bestValue = value;
                        matchedCapability = fullCapName;
                    }
                }
                
                if (matchedCapability) {
                    mappedCapabilities[systemFunction] = {
                        value: bestValue,
                        sourceCapability: matchedCapability
                    };
                }
            }
            
            this.capabilityMappings.set(characterName, mappedCapabilities);
            
            console.log(`📊 ${character.name}:`);
            for (const [func, mapping] of Object.entries(mappedCapabilities)) {
                console.log(`   ${func}: ${mapping.value.toFixed(1)}% (${mapping.sourceCapability})`);
            }
        }
    }

    /**
     * 🎯 GET CHARACTER BY NAME
     * ========================
     */
    getCharacter(characterName) {
        return this.loadedCharacters.get(characterName);
    }

    /**
     * 🎯 GET CHARACTER CAPABILITIES
     * ============================
     */
    getCharacterCapabilities(characterName) {
        const character = this.loadedCharacters.get(characterName);
        return character ? character.capabilities : {};
    }

    /**
     * 🗺️ GET SYSTEM CAPABILITY MAPPING
     * ================================
     */
    getSystemCapabilityMapping(characterName) {
        return this.capabilityMappings.get(characterName) || {};
    }

    /**
     * 🔄 UPDATE CHARACTER CAPABILITY
     * ==============================
     */
    updateCharacterCapability(characterName, capabilityName, newValue) {
        const character = this.loadedCharacters.get(characterName);
        if (!character) {
            throw new Error(`Character ${characterName} not found`);
        }

        const oldValue = character.capabilities[capabilityName] || 0;
        character.capabilities[capabilityName] = newValue;

        // Update system mappings if necessary
        this.updateSystemMappings(characterName);

        // Emit capability change event
        this.emit('capabilityChanged', {
            characterName,
            capabilityName,
            oldValue,
            newValue,
            timestamp: new Date()
        });

        console.log(`🔄 ${characterName}: ${capabilityName} ${oldValue.toFixed(1)} → ${newValue.toFixed(1)}`);
    }

    /**
     * 🔄 UPDATE SYSTEM MAPPINGS
     * =========================
     */
    updateSystemMappings(characterName) {
        // Re-map capabilities for this character
        const character = this.loadedCharacters.get(characterName);
        if (!character) return;

        // This would re-run the mapping logic for the specific character
        // For now, we'll trigger a full re-mapping
        this.mapCapabilitiesToSystem();
    }

    /**
     * 💾 SAVE CHARACTER CONFIGURATION
     * ===============================
     */
    async saveCharacterConfiguration(characterName) {
        const character = this.loadedCharacters.get(characterName);
        const filePath = this.characterConfigs.get(characterName);
        
        if (!character || !filePath) {
            throw new Error(`Cannot save ${characterName}: character or file path not found`);
        }

        try {
            // Update the original data with current capabilities
            const updatedData = {
                ...character.originalData,
                reinforcementLearning: {
                    ...character.originalData.reinforcementLearning,
                    capabilities: this.restructureCapabilitiesForSave(character.capabilities)
                }
            };

            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
            
            console.log(`💾 Saved character configuration: ${characterName}`);
            
            // Emit save event
            this.emit('characterSaved', {
                characterName,
                filePath,
                timestamp: new Date()
            });

        } catch (error) {
            console.log(`❌ Failed to save ${characterName}: ${error.message}`);
            throw error;
        }
    }

    /**
     * 🏗️ RESTRUCTURE CAPABILITIES FOR SAVE
     * ====================================
     */
    restructureCapabilitiesForSave(capabilities) {
        const structured = {
            arbitrage: {},
            blockchain: {},
            trading: {},
            intelligence: {},
            social: {},
            learning: {}
        };

        // Map flat capabilities back to structured format
        for (const [key, value] of Object.entries(capabilities)) {
            if (key.includes('arbitrage_')) {
                const subKey = key.replace('arbitrage_', '');
                structured.arbitrage[subKey] = value / 100; // Convert back to 0-1 scale
            } else if (key.includes('blockchain_')) {
                const subKey = key.replace('blockchain_', '');
                structured.blockchain[subKey] = value / 100;
            } else if (key.includes('trading_')) {
                const subKey = key.replace('trading_', '');
                structured.trading[subKey] = value / 100;
            } else if (key.includes('intelligence_')) {
                const subKey = key.replace('intelligence_', '');
                structured.intelligence[subKey] = value / 100;
            } else if (key.includes('social_')) {
                const subKey = key.replace('social_', '');
                structured.social[subKey] = value / 100;
            } else if (key.includes('learning_')) {
                const subKey = key.replace('learning_', '');
                structured.learning[subKey] = value / 100;
            }
        }

        return structured;
    }

    /**
     * 📊 GET SYSTEM SUMMARY
     * ====================
     */
    getSystemSummary() {
        const summary = {
            totalCharacters: this.loadedCharacters.size,
            characters: [],
            systemCapabilities: new Set(),
            averageCapabilities: {}
        };

        for (const [name, character] of this.loadedCharacters) {
            const characterSummary = {
                name: character.name,
                id: name,
                capabilityCount: Object.keys(character.capabilities).length,
                topCapabilities: this.getTopCapabilities(character.capabilities, 5),
                hasRL: !!character.reinforcementLearning?.enabled,
                hasAwareness: !!character.awarenessConfiguration?.enabled
            };

            summary.characters.push(characterSummary);

            // Collect all capability names
            Object.keys(character.capabilities).forEach(cap => 
                summary.systemCapabilities.add(cap)
            );
        }

        // Calculate average capabilities across all characters
        for (const capability of summary.systemCapabilities) {
            const values = Array.from(this.loadedCharacters.values())
                .map(char => char.capabilities[capability] || 0)
                .filter(val => val > 0);
            
            if (values.length > 0) {
                summary.averageCapabilities[capability] = 
                    values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        }

        return summary;
    }

    /**
     * 🔝 GET TOP CAPABILITIES
     * =======================
     */
    getTopCapabilities(capabilities, count = 5) {
        return Object.entries(capabilities)
            .sort(([,a], [,b]) => b - a)
            .slice(0, count)
            .map(([name, value]) => ({ name, value: value.toFixed(1) }));
    }

    /**
     * 🎭 GET ALL CHARACTERS
     * ====================
     */
    getAllCharacters() {
        return Array.from(this.loadedCharacters.values());
    }

    /**
     * 🔍 FIND BEST CHARACTER FOR TASK
     * ===============================
     */
    findBestCharacterForTask(requiredCapabilities) {
        let bestCharacter = null;
        let bestScore = 0;

        for (const [name, character] of this.loadedCharacters) {
            let score = 0;
            let matchCount = 0;

            for (const [capability, weight] of Object.entries(requiredCapabilities)) {
                const characterValue = character.capabilities[capability] || 0;
                score += characterValue * weight;
                if (characterValue > 0) matchCount++;
            }

            // Bonus for having more matching capabilities
            score += matchCount * 10;

            if (score > bestScore) {
                bestScore = score;
                bestCharacter = { name, character, score };
            }
        }

        return bestCharacter;
    }
}

// Export singleton instance
export const characterIntegrationSystem = new CharacterIntegrationSystem(); 