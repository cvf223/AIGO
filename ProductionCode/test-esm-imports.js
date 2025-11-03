#!/usr/bin/env node

/**
 * QUICK ESM IMPORT TEST
 * Test if all learning modules can be imported properly
 */

console.log('🧪 Testing ESM imports...');

async function testImports() {
    try {
        console.log('📦 Testing source-validation-system.js...');
        const sourceValidation = await import('./learning/source-validation-system.js');
        console.log('✅ source-validation-system.js imported successfully');
        
        console.log('📦 Testing temporal-reward-optimization.js...');
        const temporalReward = await import('./learning/temporal-reward-optimization.js');
        console.log('✅ temporal-reward-optimization.js imported successfully');
        
        console.log('📦 Testing character-specific-memory-system.js...');
        const characterMemory = await import('./learning/character-specific-memory-system.js');
        console.log('✅ character-specific-memory-system.js imported successfully');
        
        console.log('📦 Testing modular-orchestrator-integration.js...');
        const orchestrator = await import('./learning/modular-orchestrator-integration.js');
        console.log('✅ modular-orchestrator-integration.js imported successfully');
        
        console.log('📦 Testing ultimate-elite-agent-factory-enhanced.js...');
        const factory = await import('./ultimate-elite-agent-factory-enhanced.js');
        console.log('✅ ultimate-elite-agent-factory-enhanced.js imported successfully');
        
        console.log('\n🎉 All imports successful! ESM conversion worked.');
        
    } catch (error) {
        console.error('❌ Import failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

testImports(); 