#!/usr/bin/env node

/**
 * 🛡️ ADD INITIALIZATION GUARD TO FormalReasoningConstructionIntegration
 * ======================================================================
 * 
 * This component initializes 10+ times causing endless loops!
 * Add GlobalSingletonRegistry guard to ensure it only initializes ONCE.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/construction/cognitive/FormalReasoningConstructionIntegration.js');

console.log('🛡️ ========================================');
console.log('🛡️ ADDING INITIALIZATION GUARD');
console.log('🛡️ ========================================');
console.log(`📁 File: ${filePath}\n`);

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Check if already has the guard
if (content.includes('globalSingletonRegistry')) {
    console.log('✅ File already has GlobalSingletonRegistry guard - skipping');
    process.exit(0);
}

// Backup first
fs.writeFileSync(filePath + '.backup', content);
console.log('📦 Backup created\n');

// Add import at the top (after existing imports)
let modified = content;

// Find the last import statement
const lastImportIndex = content.lastIndexOf('import ');
const lastImportEnd = content.indexOf('\n', lastImportIndex);

if (lastImportIndex !== -1) {
    const before = content.slice(0, lastImportEnd + 1);
    const after = content.slice(lastImportEnd + 1);
    
    modified = before + 
`import { globalSingletonRegistry } from '../core/GlobalSingletonRegistry.js';
` + after;
    
    console.log('✅ Added GlobalSingletonRegistry import');
} else {
    console.warn('⚠️ Could not find import section - adding at top');
    modified = `import { globalSingletonRegistry } from '../core/GlobalSingletonRegistry.js';\n\n` + content;
}

// Find the initialize() method
const initializeMethodRegex = /async\s+initialize\s*\(\s*\)\s*\{/;
const match = modified.match(initializeMethodRegex);

if (match) {
    const matchEnd = match.index + match[0].length;
    const before = modified.slice(0, matchEnd);
    const after = modified.slice(matchEnd);
    
    // Add the guard code right after the opening brace
    const guardCode = `
        // 🛡️ INITIALIZATION GUARD - Prevent circular/duplicate initialization
        const existing = globalSingletonRegistry.get('FormalReasoningConstructionIntegration');
        if (existing) {
            console.log('✅ FormalReasoningConstructionIntegration already initialized - returning existing instance');
            return existing;
        }
        
        // Mark as initializing to detect circular dependencies
        if (!globalSingletonRegistry.markInitializing('FormalReasoningConstructionIntegration')) {
            throw new Error('Circular initialization detected for FormalReasoningConstructionIntegration');
        }
        
        try {
            console.log('🚀 Initializing FormalReasoningConstructionIntegration for the first time...');
`;
    
    modified = before + guardCode + after;
    
    // Now find the end of initialize() method to add the registration code
    // Look for the closing brace of the method
    // This is tricky - we'll add it before the last return statement in the method
    
    // Find "return this;" or similar at the end of initialize
    const returnMatch = modified.match(/(\s+)(return\s+this;?\s*\n\s*})/);
    
    if (returnMatch) {
        const registrationCode = `
            // Register this instance in the global registry
            globalSingletonRegistry.register('FormalReasoningConstructionIntegration', this);
            globalSingletonRegistry.markInitialized('FormalReasoningConstructionIntegration');
            console.log('✅ FormalReasoningConstructionIntegration registered in global registry');
            
`;
        
        modified = modified.replace(returnMatch[0], returnMatch[1] + registrationCode + returnMatch[2]);
        console.log('✅ Added registration code before return statement');
    }
    
    // Also wrap in try-catch if not already wrapped
    // Add a catch block before the final closing brace
    const methodEndMatch = modified.match(/(}\s*$)/);
    if (methodEndMatch) {
        const catchCode = `
        } catch (error) {
            globalSingletonRegistry.markInitialized('FormalReasoningConstructionIntegration');
            console.error('❌ FormalReasoningConstructionIntegration initialization failed:', error);
            throw error;
        }
`;
        // Insert before the last }
        const insertPos = methodEndMatch.index;
        modified = modified.slice(0, insertPos) + catchCode + modified.slice(insertPos);
        console.log('✅ Added error handling with registry cleanup');
    }
    
    console.log('✅ Added initialization guard to initialize() method');
} else {
    console.error('❌ Could not find initialize() method!');
    process.exit(1);
}

// Write the modified file
fs.writeFileSync(filePath, modified);

console.log('\n🛡️ ========================================');
console.log('✅ INITIALIZATION GUARD ADDED SUCCESSFULLY!');
console.log('🛡️ ========================================\n');
console.log('📋 What was added:');
console.log('   1. GlobalSingletonRegistry import');
console.log('   2. Early return if already initialized');
console.log('   3. Circular dependency detection');
console.log('   4. Instance registration after successful init');
console.log('   5. Error handling with cleanup\n');
console.log('📦 Backup saved at: ' + filePath + '.backup\n');

process.exit(0);

