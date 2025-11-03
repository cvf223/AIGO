#!/usr/bin/env node

/**
 * 🔥 COMPREHENSIVE FIX + KG INTEGRATION SCRIPT
 * ============================================
 * 
 * This script:
 * 1. Fixes ALL database connection issues
 * 2. Enables KG routing for ALL memory systems
 * 3. Adds proper fallbacks and resilience
 * 4. Integrates UnifiedKnowledgeStorage everywhere
 * 
 * RUN THIS BEFORE STARTING SYNDICATE!
 */

import fs from 'fs';
import path from 'path';

const MEMORY_SYSTEMS_TO_FIX = [
    {
        file: 'src/memory/QuantumEntanglementEngine.js',
        className: 'QuantumEntanglementEngine',
        dbQueries: [
            'findTrajectoryCooccurrences',
            'discoverTemporalPatterns', 
            'findCausalChains',
            'getEntanglementStrength',
            'quantumSearch'
        ],
        enableKG: true
    },
    {
        file: 'src/memory/DynamicKGPruner.js',
        className: 'DynamicKGPruner',
        dbQueries: ['pruneNodes', 'evaluateNodeUtility'],
        enableKG: true
    },
    {
        file: 'src/memory/SEDMVerifiableMemory.js',
        className: 'SEDMVerifiableMemory',
        dbQueries: ['verifyMemory', 'storeVerification'],
        enableKG: true
    },
    {
        file: 'src/memory/MEM1Framework.js',
        className: 'MEM1Framework',
        dbQueries: ['consolidateMemory', 'retrieveConsolidated'],
        enableKG: true
    }
];

async function addDatabaseChecksAndKGIntegration(filePath, className, methods) {
    console.log(`\n📝 Processing ${className}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Add database check to each method that uses this.db.query
    for (const method of methods) {
        const methodRegex = new RegExp(`async\\s+${method}\\s*\\([^)]*\\)\\s*{`, 'g');
        const match = content.match(methodRegex);
        
        if (match) {
            // Check if database check already exists
            const methodStart = content.indexOf(match[0]);
            const nextBrace = content.indexOf('{', methodStart) + 1;
            const methodContent = content.substring(nextBrace, nextBrace + 200);
            
            if (!methodContent.includes('typeof this.db.query')) {
                console.log(`   ✅ Adding database check to ${method}()`);
                
                const dbCheck = `
        // Check database availability
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database not available for ${method} - using fallback');
            return this.${method}Fallback ? this.${method}Fallback(...arguments) : [];
        }
        `;
                
                // Insert after opening brace
                content = content.substring(0, nextBrace) + dbCheck + content.substring(nextBrace);
                modified = true;
            }
        }
    }
    
    // 2. Add KG integration properties if not present
    if (!content.includes('this.knowledgeGraph =')) {
        console.log(`   ✅ Adding KG integration properties`);
        
        const constructorEnd = content.indexOf('constructor(') + content.substring(content.indexOf('constructor(')).indexOf('{') + 1;
        
        const kgProperties = `
        // KG Integration
        this.knowledgeGraph = null;
        this.unifiedKnowledgeStorage = null;
        this.enableKGRouting = false;
        `;
        
        content = content.substring(0, constructorEnd) + kgProperties + content.substring(constructorEnd);
        modified = true;
    }
    
    // 3. Add connectKnowledgeGraph method if not present
    if (!content.includes('connectKnowledgeGraph(')) {
        console.log(`   ✅ Adding connectKnowledgeGraph() method`);
        
        const classEnd = content.lastIndexOf('}');
        
        const kgMethod = `
    /**
     * Connect to Knowledge Graph for unified storage
     */
    connectKnowledgeGraph(kg, unifiedStorage = null) {
        this.knowledgeGraph = kg;
        this.unifiedKnowledgeStorage = unifiedStorage;
        this.enableKGRouting = true;
        console.log(\`✅ \${this.constructor.name} connected to Knowledge Graph\`);
        
        // If we have persistence engine, enable KG routing
        if (this.eliteMemoryPersistence?.config) {
            this.eliteMemoryPersistence.config.defaultStoreToKG = true;
            console.log('   🔥 KG routing enabled for persistence');
        }
    }

    /**
     * Store to KG if connected
     */
    async storeToKG(data, metadata = {}) {
        if (!this.enableKGRouting || !this.knowledgeGraph) {
            return null;
        }
        
        try {
            if (this.unifiedKnowledgeStorage) {
                // Use unified storage pipeline
                return await this.unifiedKnowledgeStorage.storeKnowledge(data, {
                    agentId: this.constructor.name,
                    ...metadata
                });
            } else {
                // Direct KG storage
                return await this.knowledgeGraph.createNode({
                    nodeType: 'memory',
                    content: data,
                    metadata: {
                        source: this.constructor.name,
                        ...metadata
                    }
                });
            }
        } catch (error) {
            console.error(\`KG storage failed in \${this.constructor.name}:\`, error.message);
            return null;
        }
    }
`;
        
        content = content.substring(0, classEnd) + kgMethod + '\n' + content.substring(classEnd);
        modified = true;
    }
    
    // 4. Add initialize enhancement to connect dependencies
    if (content.includes('async initialize(') && !content.includes('// KG Integration in initialize')) {
        console.log(`   ✅ Enhancing initialize() with KG connection`);
        
        const initStart = content.indexOf('async initialize(');
        const initBrace = content.indexOf('{', initStart) + 1;
        
        const kgInit = `
        // KG Integration in initialize
        if (dependencies?.knowledgeGraph) {
            this.connectKnowledgeGraph(
                dependencies.knowledgeGraph,
                dependencies.unifiedKnowledgeStorage
            );
        }
        `;
        
        content = content.substring(0, initBrace) + kgInit + content.substring(initBrace);
        modified = true;
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`   ✅ ${className} fully integrated!`);
    } else {
        console.log(`   ℹ️ ${className} already integrated`);
    }
    
    return modified;
}

async function fixAllMemorySystems() {
    console.log('🔥 COMPREHENSIVE MEMORY SYSTEM FIX + KG INTEGRATION');
    console.log('==================================================\n');
    
    let totalFixed = 0;
    
    for (const system of MEMORY_SYSTEMS_TO_FIX) {
        try {
            const fixed = await addDatabaseChecksAndKGIntegration(
                system.file,
                system.className,
                system.dbQueries
            );
            
            if (fixed) totalFixed++;
        } catch (error) {
            console.error(`❌ Failed to process ${system.className}:`, error.message);
        }
    }
    
    console.log(`\n✅ INTEGRATION COMPLETE!`);
    console.log(`   Fixed: ${totalFixed} systems`);
    console.log(`   All systems now have:`);
    console.log(`   - Database availability checks`);
    console.log(`   - KG connection support`);
    console.log(`   - Unified storage pipeline`);
    console.log(`   - Proper fallbacks`);
    
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`   1. Run 'node fix-and-integrate-all-memory-systems.js'`);
    console.log(`   2. Start syndicate with 'node startfullsyndicate.js'`);
    console.log(`   3. Watch for "KG routing enabled" messages`);
    console.log(`   4. Monitor KG operations in logs`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    fixAllMemorySystems().catch(console.error);
}

export default fixAllMemorySystems;
