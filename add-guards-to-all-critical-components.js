#!/usr/bin/env node

/**
 * 🛡️ ADD GUARDS TO ALL CRITICAL COMPONENTS
 * =========================================
 * 
 * Adds initialization guards to components that initialize thousands of times
 */

import fs from 'fs';

console.log('🛡️ Adding guards to critical components...\n');

const files = [
    {
        path: 'src/memory/EliteMemoryPersistenceEngine.js',
        name: 'EliteMemoryPersistenceEngine',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/construction/prevention/ProactiveConstructionKnowledgePipeline.js',
        name: 'ProactiveConstructionKnowledgePipeline',
        importPath: '../../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/construction/prevention/ProactiveConstructionInferenceEngine.js',
        name: 'ProactiveConstructionInferenceEngine',
        importPath: '../../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/quantum/QuantumGraphNeuralNetwork.js',
        name: 'QuantumGraphNeuralNetwork',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/agents/ReasoningEventEmitter.js',
        name: 'ReasoningEventEmitter',
        importPath: '../core/GlobalSingletonRegistry.js'
    },
    {
        path: 'src/agents/AgentEnhancementManager.js',
        name: 'AgentEnhancementManager',
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
        fs.writeFileSync(file.path + '.backup.guard2', content);
        
        // Add import if not present
        if (!content.includes('globalSingletonRegistry')) {
            const importStatement = `import { globalSingletonRegistry } from '${file.importPath}';\n`;
            
            // Check for shebang and add AFTER it
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
            const guardCode = `        // 🛡️ SINGLETON GUARD - Initialize only once
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

console.log('✅ All critical components protected!\n');

