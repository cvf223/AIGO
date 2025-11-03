#!/usr/bin/env node

/**
 * 🛡️ FIX LEGENDARY SYNDICATE ↔ AUTOFORMALIZATION CIRCULAR LOOP
 * =============================================================
 */

import fs from 'fs';

console.log('🛡️ Fixing LegendarySyndicateSystem and AutoformalizationEngine circular loop...\n');

const files = [
    {
        path: 'learning/LegendarySyndicateSystem.js',
        name: 'LegendarySyndicateSystem',
        importPath: '../src/core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/formalization/AutoformalizationEngine.js',
        name: 'AutoformalizationEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    }
];

for (const file of files) {
    try {
        console.log(`🔧 Processing: ${file.path}`);
        
        if (!fs.existsSync(file.path)) {
            console.warn(`   ⚠️ File not found - skipping\n`);
            continue;
        }
        
        let content = fs.readFileSync(file.path, 'utf8');
        
        // Skip if already has guard
        if (content.includes(`globalSingletonRegistry.get('${file.name}')`)) {
            console.log(`   ✅ Already has guard - skipping\n`);
            continue;
        }
        
        // Backup
        fs.writeFileSync(file.path + '.backup.legendaryfix', content);
        
        // Add import if not present
        if (!content.includes('globalSingletonRegistry')) {
            const importStatement = `import { globalSingletonRegistry } from '${file.importPath}';\n`;
            
            // Handle shebang
            if (content.startsWith('#!')) {
                const firstNewline = content.indexOf('\n');
                content = content.slice(0, firstNewline + 1) + importStatement + content.slice(firstNewline + 1);
                console.log(`   ✅ Added import after shebang`);
            } else {
                content = importStatement + content;
                console.log(`   ✅ Added import at top`);
            }
        }
        
        // Find "async initialize() {" and add guard
        const initRegex = /(async\s+initialize\s*\([^)]*\)\s*\{\s*\n)/;
        const match = content.match(initRegex);
        
        if (match) {
            const guardCode = `        // 🛡️ SINGLETON GUARD - Critical to prevent infinite circular initialization!
        const existing = globalSingletonRegistry.get('${file.name}');
        if (existing) {
            console.log('✅ ${file.name} already initialized - reusing');
            return existing;
        }
        if (!globalSingletonRegistry.markInitializing('${file.name}')) {
            console.warn('⚠️ ${file.name} circular init - skipping to prevent endless loop');
            return null;
        }
        console.log('🚀 ${file.name}: First initialization...');
        
`;
            
            content = content.replace(initRegex, match[1] + guardCode);
            console.log(`   ✅ Added guard`);
            
            fs.writeFileSync(file.path, content);
            console.log(`   ✅ Fixed!\n`);
        } else {
            console.warn(`   ⚠️ No initialize() method found\n`);
        }
        
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}\n`);
    }
}

console.log('✅ Legendary-Autoformalization circular loop protection added!\n');

