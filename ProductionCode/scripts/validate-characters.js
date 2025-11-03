#!/usr/bin/env node

/**
 * 🔍 CHARACTER VALIDATION SCRIPT
 * Validates all 7 elite arbitrage character files before deployment
 * Ensures no hardcoded values and proper AlphaGo RL configuration
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REQUIRED_CHARACTERS = [
    'ai-prediction-intelligence-specialist.character.json',
    'arbitrum-flash-specialist.character.json',
    'base-speed-demon.character.json',
    'polygon-micro-king.character.json',
    'arbitrum-quality-analyst.character.json',
    'base-efficiency-analyst.character.json',
    'polygon-precision-analyst.character.json'
];

const REQUIRED_FIELDS = [
    'name',
    'username', 
    'plugins',
    'modelProvider',
    'system',
    'bio',
    'strategicWeights',
    'alphaGoRL'
];

const HARDCODED_PATTERNS = [
    /\$\d+k/g,           // $127k, $50k, etc.
    /\d+ms/g,            // 89ms, 127ms, etc.
    /\d+\.\d+%/g,        // 97.6%, 88.5%, etc.
    /\d+\/\d+/g,         // 23/24, 127/150, etc.
    /\d+,\d+/g,          // 2,456, 3,847, etc.
    /\d+ executions/g,   // 127 executions, etc.
    /\d+ opportunities/g // 23 opportunities, etc.
];

async function validateCharacters() {
    console.log('🔍 VALIDATING ELITE ARBITRAGE CHARACTER FILES');
    console.log('==============================================');
    console.log('🎯 Checking for hardcoded values and memory variable usage');
    console.log('🧠 Validating AlphaGo RL learning system configuration');
    console.log('');
    
    const charactersDir = path.join(__dirname, '..', 'characters');
    let allValid = true;
    let totalHardcodedIssues = 0;
    
    for (const characterFile of REQUIRED_CHARACTERS) {
        const filePath = path.join(charactersDir, characterFile);
        
        console.log(`📋 Validating: ${characterFile}`);
        console.log('─'.repeat(50));
        
        // Check file exists
        if (!existsSync(filePath)) {
            console.log(`❌ File not found: ${characterFile}`);
            allValid = false;
            continue;
        }
        
        try {
            // Parse JSON
            const characterData = JSON.parse(readFileSync(filePath, 'utf8'));
            
            // Check required fields
            const missingFields = [];
            for (const field of REQUIRED_FIELDS) {
                if (!characterData[field]) {
                    missingFields.push(field);
                }
            }
            
            if (missingFields.length > 0) {
                console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
                allValid = false;
                continue;
            }
            
            // Validate AlphaGo RL configuration
            if (!characterData.alphaGoRL || !characterData.alphaGoRL.enabled) {
                console.log(`❌ AlphaGo RL not enabled or missing`);
                allValid = false;
            } else {
                const rlConfig = characterData.alphaGoRL;
                console.log(`✅ AlphaGo RL: Enabled`);
                console.log(`   📊 Reward types: ${Object.keys(rlConfig.rewardSystem || {}).length}`);
                console.log(`   🧠 Memory tracking: ${Object.keys(rlConfig.memoryTracking || {}).length} fields`);
                console.log(`   ⚙️  Learning rate: ${rlConfig.learningRate || 'not set'}`);
                console.log(`   🎯 Exploration rate: ${rlConfig.explorationRate || 'not set'}`);
            }
            
            // Check for hardcoded values in message examples
            let hardcodedIssues = 0;
            if (characterData.messageExamples) {
                const exampleText = JSON.stringify(characterData.messageExamples);
                
                for (const pattern of HARDCODED_PATTERNS) {
                    const matches = exampleText.match(pattern);
                    if (matches) {
                        hardcodedIssues += matches.length;
                        console.log(`⚠️  Found ${matches.length} hardcoded values matching pattern: ${pattern.source}`);
                        console.log(`   Examples: ${matches.slice(0, 3).join(', ')}${matches.length > 3 ? '...' : ''}`);
                    }
                }
                
                // Check for memory variable usage
                const memoryVariableCount = (exampleText.match(/\{\{memory\./g) || []).length;
                if (memoryVariableCount > 0) {
                    console.log(`✅ Memory variables: ${memoryVariableCount} found`);
                } else {
                    console.log(`❌ No memory variables found - using hardcoded values!`);
                    allValid = false;
                }
            }
            
            totalHardcodedIssues += hardcodedIssues;
            
            // Validate strategic weights
            if (characterData.strategicWeights) {
                const weights = Object.values(characterData.strategicWeights);
                const validWeights = weights.every(w => w >= 0 && w <= 1);
                if (validWeights) {
                    console.log(`✅ Strategic weights: ${Object.keys(characterData.strategicWeights).length} factors (0-1 range)`);
                } else {
                    console.log(`❌ Invalid strategic weights (must be 0-1)`);
                    allValid = false;
                }
            }
            
            // Check system prompt for memory instructions
            if (characterData.system && characterData.system.includes('memory')) {
                console.log(`✅ System prompt includes memory instructions`);
            } else {
                console.log(`⚠️  System prompt should include memory usage instructions`);
            }
            
            if (hardcodedIssues === 0) {
                console.log(`🎉 ${characterData.name}: PERFECT - No hardcoded values!`);
            } else {
                console.log(`⚠️  ${characterData.name}: ${hardcodedIssues} hardcoded values need fixing`);
            }
            
        } catch (error) {
            console.log(`❌ JSON parsing error: ${error.message}`);
            allValid = false;
        }
        
        console.log('');
    }
    
    console.log('==============================================');
    console.log('📊 VALIDATION SUMMARY:');
    console.log(`📁 Characters checked: ${REQUIRED_CHARACTERS.length}`);
    console.log(`⚠️  Total hardcoded issues: ${totalHardcodedIssues}`);
    
    if (allValid && totalHardcodedIssues === 0) {
        console.log('🎉 ALL CHARACTER FILES VALIDATED SUCCESSFULLY!');
        console.log('✅ No hardcoded values found');
        console.log('✅ All using memory variables');
        console.log('✅ AlphaGo RL properly configured');
        console.log('🚀 Ready to deploy elite arbitrage team');
        process.exit(0);
    } else {
        console.log('❌ CHARACTER VALIDATION FAILED');
        if (totalHardcodedIssues > 0) {
            console.log(`🔧 Fix ${totalHardcodedIssues} hardcoded values - replace with {{memory.variable_name}}`);
        }
        if (!allValid) {
            console.log('🔧 Fix missing fields and configuration issues above');
        }
        console.log('');
        console.log('💡 MEMORY VARIABLE EXAMPLES:');
        console.log('   Replace: "$127k profit" → "${{memory.current_opportunity.profit}}k profit"');
        console.log('   Replace: "89ms execution" → "{{memory.performance.avg_execution_time}}ms execution"');
        console.log('   Replace: "97.6% success" → "{{memory.performance.success_rate}}% success"');
        console.log('   Replace: "23 executions" → "{{memory.stats.total_executions}} executions"');
        process.exit(1);
    }
}

validateCharacters().catch(error => {
    console.error('❌ Validation script error:', error);
    process.exit(1);
}); 