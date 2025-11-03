#!/usr/bin/env node

/**
 * 🛡️ ADD INITIALIZATION GUARD - SIMPLE VERSION
 * =============================================
 * 
 * Adds GlobalSingletonRegistry guard WITHOUT breaking existing code structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'src/construction/cognitive/FormalReasoningConstructionIntegration.js');

console.log('🛡️ Adding initialization guard (simple version)...\n');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Backup first
fs.writeFileSync(filePath + '.backup2', content);
console.log('📦 Backup created\n');

// Step 1: Add import at the top (if not already there)
if (!content.includes('globalSingletonRegistry')) {
    // Find the last import statement
    const importRegex = /^import\s+.*?;$/gm;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPos = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertPos) + 
            '\nimport { globalSingletonRegistry } from \'../core/GlobalSingletonRegistry.js\';' +
            content.slice(insertPos);
        
        console.log('✅ Added GlobalSingletonRegistry import');
    }
}

// Step 2: Find the initialize() method and add guard right after opening brace
const initializeRegex = /(async\s+initialize\s*\([^)]*\)\s*\{)/;
const match = content.match(initializeRegex);

if (match) {
    const guardCode = `
        // 🛡️ SINGLETON GUARD - Initialize only once
        const existingInstance = globalSingletonRegistry.get('FormalReasoningConstructionIntegration');
        if (existingInstance) {
            console.log('✅ FormalReasoningConstructionIntegration already initialized - reusing instance');
            return existingInstance;
        }
        
        // Mark as initializing
        if (!globalSingletonRegistry.markInitializing('FormalReasoningConstructionIntegration')) {
            console.error('🔴 Circular initialization detected for FormalReasoningConstructionIntegration');
            throw new Error('Circular initialization detected');
        }
        
        console.log('🚀 FormalReasoningConstructionIntegration: First-time initialization starting...');
`;
    
    // Replace the opening with opening + guard
    content = content.replace(initializeRegex, match[1] + guardCode);
    console.log('✅ Added initialization guard at method start');
}

// Step 3: Add registration before the method ends
// Find "return this;" near the end of the initialize method
// We'll add the registration just before it

// Look for pattern like: "return this;" or "return this" at the end
const returnPattern = /(\s+)(return\s+this;?\s*)(\s*})/g;
let matches = [];
let match2;

while ((match2 = returnPattern.exec(content)) !== null) {
    matches.push({
        full: match2[0],
        index: match2.index,
        before: match2[1],
        returnStatement: match2[2],
        after: match2[3]
    });
}

// Use the LAST match (most likely to be at the end of initialize method)
if (matches.length > 0) {
    const lastMatch = matches[matches.length - 1];
    
    const registrationCode = `
        
        // Register in global singleton registry
        globalSingletonRegistry.register('FormalReasoningConstructionIntegration', this);
        globalSingletonRegistry.markInitialized('FormalReasoningConstructionIntegration');
        console.log('✅ FormalReasoningConstructionIntegration registered in singleton registry');
`;
    
    const replacement = lastMatch.before + registrationCode + lastMatch.returnStatement + lastMatch.after;
    
    // Replace only the last occurrence
    const beforeLast = content.slice(0, lastMatch.index);
    const afterLast = content.slice(lastMatch.index + lastMatch.full.length);
    content = beforeLast + replacement + afterLast;
    
    console.log('✅ Added registration before return statement');
}

// Write the modified content
fs.writeFileSync(filePath, content);

console.log('\n✅ Initialization guard added successfully!');
console.log('📦 Backup at: ' + filePath + '.backup2\n');

process.exit(0);

