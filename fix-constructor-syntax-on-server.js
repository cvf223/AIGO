#!/usr/bin/env node

/**
 * 🏆 ELITE CONSTRUCTOR SYNTAX FIX - PRODUCTION SERVER
 * ==================================================
 * 
 * Fix malformed constructor syntax in startfullsyndicate.js
 */

import fs from 'fs';

console.log('🏆 FIXING CONSTRUCTOR SYNTAX ERROR');
console.log('=================================');

const filePath = '/root/LocalBackup/startfullsyndicate.js';

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('📖 Read startfullsyndicate.js file');
    
    // Show the problematic line
    const lines = content.split('\n');
    const line71 = lines[70]; // Line 71 (0-based index)
    console.log(`🔍 Line 71: ${line71}`);
    
    // Fix the malformed constructor
    if (line71.includes('config = (typeof { === "object" ? { : {})')) {
        content = content.replace(
            /config = \(typeof \{ === "object" \? \{ : \{\}\)\)/g,
            'config = {}'
        );
        console.log('✅ Fixed malformed constructor syntax');
    } else {
        // More generic fix for similar patterns
        content = content.replace(
            /constructor\([^)]*config[^)]*= \(typeof \{ === "object" \? \{ : \{\}\)\)/g,
            'constructor(config = {})'
        );
        console.log('✅ Fixed constructor pattern');
    }
    
    // Also fix any other similar malformed patterns
    content = content.replace(
        /typeof \{ === "object" \? \{ : \{\}/g,
        'typeof config === "object" && config !== null ? config : {}'
    );
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    console.log('💾 Saved updated startfullsyndicate.js');
    
    console.log('🎉 CONSTRUCTOR SYNTAX FIX APPLIED SUCCESSFULLY!');
    
} catch (error) {
    console.error('❌ CONSTRUCTOR FIX FAILED:', error.message);
    process.exit(1);
}
