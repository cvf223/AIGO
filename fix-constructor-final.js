#!/usr/bin/env node

/**
 * 🏆 FINAL CONSTRUCTOR FIX - PRODUCTION SERVER
 * ===========================================
 * 
 * Simple, direct fix for the constructor syntax
 */

import fs from 'fs';

console.log('🏆 APPLYING FINAL CONSTRUCTOR FIX');
console.log('================================');

const filePath = '/root/LocalBackup/startfullsyndicate.js';

try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    console.log('📖 Read startfullsyndicate.js file');
    
    // Replace the problematic constructor line directly
    content = content.replace(
        /constructor\(config = \(typeof config === "object" && config !== null \? config : \{\}\)\)/g,
        'constructor(config = {})'
    );
    
    console.log('✅ Applied simple constructor fix');
    
    // Write the file back
    fs.writeFileSync(filePath, content);
    console.log('💾 Saved updated startfullsyndicate.js');
    
    console.log('🎉 FINAL CONSTRUCTOR FIX APPLIED!');
    
} catch (error) {
    console.error('❌ FINAL CONSTRUCTOR FIX FAILED:', error.message);
    process.exit(1);
}
