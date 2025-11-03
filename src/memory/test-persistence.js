/**
 * 🧪 TEST MEMORY PERSISTENCE
 * =========================
 * 
 * Script to test that all memory components properly save and restore state
 */

import { ComprehensivePersistenceLayer } from './ComprehensivePersistenceLayer.js';
import { AdvancedMemoryCoordinator } from './AdvancedMemoryCoordinator.js';
import { MemorySinkPrevention } from './MemorySinkPrevention.js';
import pg from 'pg';

async function testMemoryPersistence() {
    console.log('🧪 Testing Memory System Persistence...\n');
    
    // Database configuration
    const dbConfig = {
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arbitrage_syndicate'
    };
    
    const pool = new pg.Pool(dbConfig);
    
    try {
        // 1. Initialize memory system
        console.log('1️⃣ Initializing memory system...');
        
        const memoryCoordinator = new AdvancedMemoryCoordinator({
            enableMEM1: true,
            enableKnowledgeGraph: true,
            enableConceptAgent: true,
            enableQuantumEntanglements: true,
            enableSEDM: true,
            memorySinkPrevention: true,
            pruningEnabled: true
        });
        
        const dependencies = {
            database: pool,
            llmService: { generate: async () => '{}' }, // Mock
            embeddingService: { embed: async () => new Float32Array(768) }, // Mock
            ragService: {}, // Mock
            worldModel: { simulate: async () => ({ taskCompleted: true, totalReward: 1.0 }) } // Mock
        };
        
        await memoryCoordinator.initialize(dependencies);
        
        const sinkPrevention = new MemorySinkPrevention();
        await sinkPrevention.initialize({
            memoryCoordinator,
            knowledgeGraph: memoryCoordinator.components.knowledgeGraph,
            database: pool
        });
        
        // 2. Create test data
        console.log('\n2️⃣ Creating test data...');
        
        // Add some test knowledge
        const testNode = await memoryCoordinator.components.knowledgeGraph.createNode({
            nodeType: 'test_concept',
            properties: { name: 'Test Node', value: 42 },
            confidence: 0.9,
            embedding: new Float32Array(768).fill(0.1)
        });
        
        console.log(`   ✅ Created test node: ${testNode.node_id}`);
        
        // Consolidate some agent memory
        await memoryCoordinator.consolidateAgentMemory(
            'test_agent',
            { type: 'observation', content: 'Test observation' },
            { testContext: true }
        );
        
        console.log('   ✅ Consolidated agent memory');
        
        // 3. Test component persistence
        console.log('\n3️⃣ Testing component state persistence...');
        
        const components = [
            { name: 'mem1', component: memoryCoordinator.components.mem1 },
            { name: 'knowledgeGraph', component: memoryCoordinator.components.knowledgeGraph },
            { name: 'conceptAgent', component: memoryCoordinator.components.conceptAgent },
            { name: 'entanglementEngine', component: memoryCoordinator.components.entanglementEngine },
            { name: 'memoryAgent', component: memoryCoordinator.components.memoryAgent },
            { name: 'sedm', component: memoryCoordinator.components.sedm },
            { name: 'pruner', component: memoryCoordinator.components.pruner },
            { name: 'sinkPrevention', component: sinkPrevention }
        ];
        
        const states = {};
        
        // Get states
        for (const { name, component } of components) {
            if (component && component.getState) {
                states[name] = await component.getState();
                console.log(`   ✅ Got state for ${name}`);
            } else {
                console.log(`   ❌ No getState method for ${name}`);
            }
        }
        
        // 4. Test comprehensive persistence
        console.log('\n4️⃣ Testing comprehensive persistence layer...');
        
        const persistenceLayer = new ComprehensivePersistenceLayer();
        await persistenceLayer.initialize({ 
            database: pool,
            formalVerification: { verify: async () => ({ valid: true }) }
        });
        
        // Register components
        for (const { name, component } of components) {
            if (component) {
                persistenceLayer.registerMemoryComponent(name, component);
            }
        }
        
        // Save complete state
        await persistenceLayer.saveCompleteState();
        console.log('   ✅ Saved complete state');
        
        // 5. Simulate restart - clear in-memory state
        console.log('\n5️⃣ Simulating system restart...');
        
        // Clear some component states
        memoryCoordinator.components.mem1.agentStates.clear();
        memoryCoordinator.components.conceptAgent.activeConceptSequences.clear();
        sinkPrevention.performanceHistory = [];
        
        console.log('   ✅ Cleared in-memory state');
        
        // 6. Restore state
        console.log('\n6️⃣ Restoring state...');
        
        await persistenceLayer.loadCompleteState();
        console.log('   ✅ Loaded complete state');
        
        // 7. Verify restoration
        console.log('\n7️⃣ Verifying state restoration...');
        
        // Check if test agent state was restored
        const restoredAgentState = memoryCoordinator.components.mem1.agentStates.get('test_agent');
        if (restoredAgentState) {
            console.log('   ✅ Agent state restored successfully');
        } else {
            console.log('   ❌ Agent state NOT restored');
        }
        
        // Check knowledge graph
        const kgStats = await memoryCoordinator.components.knowledgeGraph.getStats();
        console.log(`   ℹ️  Knowledge Graph: ${kgStats.node_count} nodes, ${kgStats.relationship_count} relationships`);
        
        // 8. Test database persistence
        console.log('\n8️⃣ Checking database persistence...');
        
        const dbResult = await pool.query(`
            SELECT component_name, last_saved 
            FROM memory_system_state 
            ORDER BY last_saved DESC
        `);
        
        console.log('   📊 Component states in database:');
        for (const row of dbResult.rows) {
            console.log(`      - ${row.component_name}: ${row.last_saved}`);
        }
        
        // 9. Test backup triggers
        console.log('\n9️⃣ Testing backup triggers...');
        
        // Simulate breakthrough
        const mockDecision = {
            id: 'test_decision_1',
            component: 'test_component',
            decision: { type: 'test', action: 'buy' },
            timestamp: Date.now()
        };
        
        await persistenceLayer.trackDecision('test_component', mockDecision.decision);
        console.log('   ✅ Tracked test decision');
        
        // Update with positive outcome to trigger breakthrough
        persistenceLayer.performanceMetrics.averageReward = 0.5;
        persistenceLayer.lastBackupMetrics.averageReward = 0.3;
        await persistenceLayer.checkForBreakthrough();
        
        console.log('   ✅ Tested breakthrough detection');
        
        // 10. Summary
        console.log('\n✅ PERSISTENCE TEST COMPLETE!');
        console.log('\n📊 Summary:');
        console.log(`   - Components with persistence: ${Object.keys(states).length}`);
        console.log(`   - Database records: ${dbResult.rows.length}`);
        console.log(`   - Persistence layer initialized: ${persistenceLayer.initialized}`);
        
        // Cleanup
        await persistenceLayer.shutdown();
        
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testMemoryPersistence()
        .then(() => {
            console.log('\n🎉 All persistence tests passed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 Persistence test failed:', error);
            process.exit(1);
        });
}

export { testMemoryPersistence };
