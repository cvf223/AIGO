#!/usr/bin/env node

/**
 * 🔧 FIX AUTO-INITIALIZATION - REMOVE ALL AUTO-EXECUTING SINGLETONS
 * ==================================================================
 * 
 * This script identifies and documents all files that auto-execute on import.
 * These MUST be fixed to use the GlobalSingletonRegistry pattern.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 ========================================');
console.log('🔧 FIX AUTO-INITIALIZATION');
console.log('🔧 ========================================\n');

// Files we already know have auto-executing singletons
const knownAutoExecutingSingletons = [
    {
        file: 'src/memory/IntegrateAdvancedMemory.js',
        problem: 'export const advancedMemoryIntegration = new IntegrateAdvancedMemory();',
        fix: 'Remove this line, export only the class, initialize in startfullsyndicate.js'
    },
    {
        file: 'src/memory/ComprehensivePersistenceLayer.js',
        problem: 'export const comprehensivePersistence = new ComprehensivePersistenceLayer();',
        fix: 'Remove this line, export only the class, initialize in startfullsyndicate.js'
    },
    {
        file: 'src/construction/prevention/ProactiveConstructionKnowledgePipeline.js',
        problem: 'export const proactiveConstructionKnowledge = new ProactiveConstructionKnowledgePipeline();',
        fix: 'Remove this line, export only the class'
    },
    {
        file: 'src/construction/prevention/ProactiveConstructionInferenceEngine.js',
        problem: 'export const proactiveConstructionInference = new ProactiveConstructionInferenceEngine();',
        fix: 'Remove this line, export only the class'
    },
    {
        file: 'src/construction/prevention/ProactiveConstructionVeracityJudge.js',
        problem: 'export const constructionVeracityJudge = new ProactiveConstructionVeracityJudge();',
        fix: 'Remove this line, export only the class'
    }
];

console.log('📋 KNOWN AUTO-EXECUTING SINGLETONS:\n');
knownAutoExecutingSingletons.forEach((item, index) => {
    console.log(`${index + 1}. ${item.file}`);
    console.log(`   ❌ Problem: ${item.problem}`);
    console.log(`   ✅ Fix: ${item.fix}\n`);
});

console.log('\n🔧 ARCHITECTURAL FIX REQUIRED:\n');
console.log('1. Add initialization guard to EVERY component:');
console.log('   ```javascript');
console.log('   async initialize() {');
console.log('       // Check singleton registry first');
console.log('       const existing = globalSingletonRegistry.get(\'SystemName\');');
console.log('       if (existing) return existing;');
console.log('       ');
console.log('       // Prevent circular initialization');
console.log('       if (!globalSingletonRegistry.markInitializing(\'SystemName\')) {');
console.log('           throw new Error(\'Circular initialization detected\');');
console.log('       }');
console.log('       ');
console.log('       try {');
console.log('           // ... actual initialization ...');
console.log('           ');
console.log('           // Register after successful initialization');
console.log('           globalSingletonRegistry.register(\'SystemName\', this);');
console.log('           globalSingletonRegistry.markInitialized(\'SystemName\');');
console.log('           ');
console.log('           return this;');
console.log('       } catch (error) {');
console.log('           globalSingletonRegistry.markInitialized(\'SystemName\');');
console.log('           throw error;');
console.log('       }');
console.log('   }');
console.log('   ```\n');

console.log('2. Remove ALL auto-executing exports:');
console.log('   ❌ BAD:  export const mySystem = new MySystem();');
console.log('   ✅ GOOD: export { MySystem };\n');

console.log('3. Initialize singletons EXPLICITLY in startfullsyndicate.js:');
console.log('   ```javascript');
console.log('   // Initialize each system once');
console.log('   const mySystem = new MySystem();');
console.log('   await mySystem.initialize();');
console.log('   ```\n');

console.log('🔧 ========================================');
console.log('🔧 END OF REPORT');
console.log('🔧 ========================================\n');

// Check if files exist
console.log('📂 Verifying files exist:\n');
let filesChecked = 0;
let filesFound = 0;

for (const item of knownAutoExecutingSingletons) {
    filesChecked++;
    const fullPath = path.join(__dirname, item.file);
    
    if (fs.existsSync(fullPath)) {
        filesFound++;
        console.log(`✅ Found: ${item.file}`);
    } else {
        console.log(`❌ Missing: ${item.file}`);
    }
}

console.log(`\n📊 Summary: ${filesFound}/${filesChecked} files found\n`);

process.exit(0);

