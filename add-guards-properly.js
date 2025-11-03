#!/usr/bin/env node

/**
 * 🛡️ ADD INITIALIZATION GUARDS PROPERLY
 * ======================================
 * 
 * Uses proper JavaScript string manipulation to add guards
 * without breaking syntax with sed
 */

import fs from 'fs';

console.log('🛡️ Adding initialization guards to Quantum components...\n');

// Files to fix
const files = [
    {
        path: 'src/quantum/QuantumCoherenceEngine.js',
        name: 'QuantumCoherenceEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/quantum/QuantumSuperpositionEngine.js',
        name: 'QuantumSuperpositionEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/quantum/QuantumNodeEngine.js',
        name: 'QuantumNodeEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/quantum/QuantumEntanglementEngine.js',
        name: 'QuantumEntanglementEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    }
];

for (const file of files) {
    try {
        console.log(`🔧 Processing: ${file.path}`);
        
        // Read file
        let content = fs.readFileSync(file.path, 'utf8');
        
        // Backup
        fs.writeFileSync(file.path + '.backup.propguard', content);
        
        // Add import if not present
        if (!content.includes('globalSingletonRegistry')) {
            const importStatement = `import { globalSingletonRegistry } from '${file.importPath}';\n`;
            content = importStatement + content;
            console.log(`   ✅ Added import`);
        }
        
        // Find "async initialize() {" and add guard right after it
        const initRegex = /(async\s+initialize\s*\([^)]*\)\s*\{\s*\n)/;
        const match = content.match(initRegex);
        
        if (match) {
            const guardCode = `        // 🛡️ SINGLETON GUARD
        const existing = globalSingletonRegistry.get('${file.name}');
        if (existing) {
            console.log('✅ ${file.name} already initialized - reusing');
            return existing;
        }
        if (!globalSingletonRegistry.markInitializing('${file.name}')) {
            console.warn('⚠️ ${file.name} circular init - skipping');
            return null;
        }
        console.log('🚀 ${file.name}: First initialization...');
        
`;
            
            content = content.replace(initRegex, match[1] + guardCode);
            console.log(`   ✅ Added initialization guard`);
            
            // Write back
            fs.writeFileSync(file.path, content);
            console.log(`   ✅ ${file.path} fixed!\n`);
        } else {
            console.warn(`   ⚠️ Could not find initialize() method in ${file.path}\n`);
        }
        
    } catch (error) {
        console.error(`   ❌ Error processing ${file.path}:`, error.message, '\n');
    }
}

console.log('✅ All quantum components protected with initialization guards!\n');

