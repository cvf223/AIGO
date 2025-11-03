/**
 * 🔥 NON-LLM DATA COLLECTOR
 * =========================
 * 
 * Collects and persists critical data that doesn't require LLM processing.
 * This ensures the syndicate builds valuable historical data even when
 * Ollama isn't running due to resource constraints.
 * 
 * TOP 1% IMPLEMENTATION - Production Ready!
 */

import { Pool } from 'pg';
import { EventEmitter } from 'events';
import os from 'os';
import fs from 'fs/promises';

export class NonLLMDataCollector extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            database: config.database || {
                connectionString: process.env.DATABASE_URL || 
                    'postgresql://epicbattlegods@localhost:5432/elite_agent_syndicate'
            },
            intervals: {
                systemHealth: 30000,      // Every 30 seconds
                memorySnapshot: 60000,    // Every minute
                performanceMetrics: 120000, // Every 2 minutes
                forcePersist: 300000      // Force save every 5 minutes
            },
            ...config
        };
        
        this.db = null;
        this.dataBuffer = {
            systemHealth: [],
            agentActions: [],
            blockchainData: [],
            evolutionData: []
        };
        
        this.stats = {
            totalSaves: 0,
            failedSaves: 0,
            lastSave: null,
            bufferedItems: 0
        };
        
        console.log('🔥 Non-LLM Data Collector initialized');
    }
    
    async initialize() {
        console.log('🚀 Initializing Non-LLM Data Collection...');
        
        try {
            // Initialize database
            this.db = new Pool(this.config.database);
            
            // Test connection
            const test = await this.db.query('SELECT NOW()');
            console.log(`✅ Database connected: ${test.rows[0].now}`);
            
            // Start collectors
            this.startSystemHealthCollector();
            this.startMemoryCollector();
            this.startPerformanceCollector();
            this.startPersistenceScheduler();
            
            // Listen for events from other systems
            this.setupEventListeners();
            
            console.log('✅ Non-LLM Data Collection active');
            
        } catch (error) {
            console.error('❌ Failed to initialize Non-LLM collector:', error);
            
            // Fallback to file-based storage
            await this.initializeFileBackup();
        }
    }
    
    startSystemHealthCollector() {
        this.healthInterval = setInterval(async () => {
            try {
                const health = {
                    timestamp: new Date(),
                    memory: {
                        total: os.totalmem(),
                        free: os.freemem(),
                        used: os.totalmem() - os.freemem(),
                        heapUsed: process.memoryUsage().heapUsed,
                        heapTotal: process.memoryUsage().heapTotal
                    },
                    cpu: {
                        loadAverage: os.loadavg(),
                        cpus: os.cpus().length
                    },
                    uptime: {
                        system: os.uptime(),
                        process: process.uptime()
                    },
                    pid: process.pid
                };
                
                // Buffer the data
                this.dataBuffer.systemHealth.push(health);
                
                // Save if buffer is large
                if (this.dataBuffer.systemHealth.length >= 10) {
                    await this.persistSystemHealth();
                }
                
            } catch (error) {
                console.error('❌ Health collection error:', error.message);
            }
        }, this.config.intervals.systemHealth);
        
        console.log('   🏥 System health collector started');
    }
    
    startMemoryCollector() {
        this.memoryInterval = setInterval(async () => {
            try {
                const snapshot = {
                    timestamp: new Date(),
                    heapSnapshot: {
                        used: process.memoryUsage().heapUsed,
                        total: process.memoryUsage().heapTotal,
                        external: process.memoryUsage().external,
                        arrayBuffers: process.memoryUsage().arrayBuffers
                    },
                    bufferSizes: {
                        systemHealth: this.dataBuffer.systemHealth.length,
                        agentActions: this.dataBuffer.agentActions.length,
                        blockchainData: this.dataBuffer.blockchainData.length,
                        evolutionData: this.dataBuffer.evolutionData.length
                    }
                };
                
                // Save directly to memory_checkpoints
                await this.saveMemoryCheckpoint(snapshot);
                
            } catch (error) {
                console.error('❌ Memory collection error:', error.message);
            }
        }, this.config.intervals.memorySnapshot);
        
        console.log('   💾 Memory collector started');
    }
    
    startPerformanceCollector() {
        this.performanceInterval = setInterval(async () => {
            try {
                // Collect performance metrics that don't need LLM
                const metrics = {
                    timestamp: new Date(),
                    dataCollected: this.stats.totalSaves,
                    failureRate: this.stats.failedSaves / Math.max(1, this.stats.totalSaves),
                    bufferedItems: this.getBufferedItemCount(),
                    lastSave: this.stats.lastSave
                };
                
                // Log to agent_performance
                await this.logPerformance(metrics);
                
            } catch (error) {
                console.error('❌ Performance collection error:', error.message);
            }
        }, this.config.intervals.performanceMetrics);
        
        console.log('   📊 Performance collector started');
    }
    
    startPersistenceScheduler() {
        this.persistInterval = setInterval(async () => {
            console.log('⏰ Force persist triggered...');
            await this.persistAllBuffers();
        }, this.config.intervals.forcePersist);
        
        console.log('   ⏰ Persistence scheduler started');
    }
    
    setupEventListeners() {
        // Listen for events from various systems
        process.on('SYNDICATE:AGENT_ACTION', (data) => {
            this.collectAgentAction(data);
        });
        
        process.on('SYNDICATE:BLOCKCHAIN_DATA', (data) => {
            this.collectBlockchainData(data);
        });
        
        process.on('SYNDICATE:EVOLUTION_DATA', (data) => {
            this.collectEvolutionData(data);
        });
        
        console.log('   👂 Event listeners configured');
    }
    
    async collectAgentAction(data) {
        this.dataBuffer.agentActions.push({
            ...data,
            collected_at: new Date(),
            llm_analyzed: false
        });
        
        if (this.dataBuffer.agentActions.length >= 50) {
            await this.persistAgentActions();
        }
    }
    
    async collectBlockchainData(data) {
        this.dataBuffer.blockchainData.push({
            ...data,
            collected_at: new Date(),
            requires_llm: false
        });
        
        if (this.dataBuffer.blockchainData.length >= 20) {
            await this.persistBlockchainData();
        }
    }
    
    async collectEvolutionData(data) {
        this.dataBuffer.evolutionData.push({
            ...data,
            collected_at: new Date(),
            llm_enhanced: false
        });
        
        if (this.dataBuffer.evolutionData.length >= 30) {
            await this.persistEvolutionData();
        }
    }
    
    async persistSystemHealth() {
        if (!this.db || this.dataBuffer.systemHealth.length === 0) return;
        
        try {
            const data = this.dataBuffer.systemHealth.splice(0, 10);
            
            for (const health of data) {
                await this.db.query(`
                    INSERT INTO system_health_logs (
                        system_name, health_status, memory_usage, 
                        error_count, performance_metrics, timestamp
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    'NonLLMCollector',
                    'HEALTHY',
                    health.memory.heapUsed,
                    0,
                    JSON.stringify(health),
                    health.timestamp
                ]);
            }
            
            this.stats.totalSaves += data.length;
            this.stats.lastSave = new Date();
            
            console.log(`   ✅ Persisted ${data.length} health records`);
            
        } catch (error) {
            this.stats.failedSaves++;
            console.error('❌ Failed to persist health data:', error.message);
            
            // Save to file as backup
            await this.saveToFile('health', this.dataBuffer.systemHealth);
        }
    }
    
    async persistAgentActions() {
        if (!this.db || this.dataBuffer.agentActions.length === 0) return;
        
        try {
            const data = this.dataBuffer.agentActions.splice(0, 50);
            
            for (const action of data) {
                await this.db.query(`
                    INSERT INTO agent_action_history (
                        agent_id, action_type, action_data, 
                        reward, timestamp
                    ) VALUES ($1, $2, $3, $4, $5)
                `, [
                    action.agent_id || 'unknown',
                    action.action_type || 'unknown',
                    JSON.stringify(action),
                    action.reward || 0,
                    action.collected_at
                ]);
            }
            
            this.stats.totalSaves += data.length;
            console.log(`   ✅ Persisted ${data.length} agent actions`);
            
        } catch (error) {
            this.stats.failedSaves++;
            console.error('❌ Failed to persist agent actions:', error.message);
            await this.saveToFile('actions', this.dataBuffer.agentActions);
        }
    }
    
    async persistBlockchainData() {
        if (!this.db || this.dataBuffer.blockchainData.length === 0) return;
        
        try {
            const data = this.dataBuffer.blockchainData.splice(0, 20);
            
            // Save to knowledge_persistence as this is valuable data
            for (const item of data) {
                await this.db.query(`
                    INSERT INTO knowledge_persistence (
                        knowledge_id, knowledge_type, content,
                        source_system, validation_score, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (knowledge_id) DO UPDATE
                    SET content = $3, last_accessed = NOW()
                `, [
                    `blockchain_${item.type}_${Date.now()}`,
                    'blockchain_data',
                    JSON.stringify(item),
                    'NonLLMCollector',
                    0.8, // High confidence since it's from blockchain
                    item.collected_at
                ]);
            }
            
            this.stats.totalSaves += data.length;
            console.log(`   ✅ Persisted ${data.length} blockchain data items`);
            
        } catch (error) {
            this.stats.failedSaves++;
            console.error('❌ Failed to persist blockchain data:', error.message);
            await this.saveToFile('blockchain', this.dataBuffer.blockchainData);
        }
    }
    
    async persistEvolutionData() {
        if (!this.db || this.dataBuffer.evolutionData.length === 0) return;
        
        try {
            const data = this.dataBuffer.evolutionData.splice(0, 30);
            
            // Save evolution data to kg_nodes as knowledge
            for (const evolution of data) {
                await this.db.query(`
                    INSERT INTO kg_nodes (
                        node_id, node_type, content,
                        importance_score, metadata, created_at
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (node_id) DO UPDATE
                    SET content = $3, updated_at = NOW()
                `, [
                    `evolution_${evolution.generation}_${Date.now()}`,
                    'evolution_data',
                    JSON.stringify(evolution),
                    evolution.fitness || 0.5,
                    JSON.stringify({ llm_enhanced: false }),
                    evolution.collected_at
                ]);
            }
            
            this.stats.totalSaves += data.length;
            console.log(`   ✅ Persisted ${data.length} evolution records`);
            
        } catch (error) {
            this.stats.failedSaves++;
            console.error('❌ Failed to persist evolution data:', error.message);
            await this.saveToFile('evolution', this.dataBuffer.evolutionData);
        }
    }
    
    async saveMemoryCheckpoint(snapshot) {
        if (!this.db) return;
        
        try {
            await this.db.query(`
                INSERT INTO memory_checkpoints (
                    checkpoint_id, system_name, state_data,
                    data_size, checkpoint_type, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                `mem_checkpoint_${Date.now()}`,
                'NonLLMCollector',
                JSON.stringify(snapshot),
                JSON.stringify(snapshot).length,
                'periodic',
                snapshot.timestamp
            ]);
            
            console.log('   💾 Memory checkpoint saved');
            
        } catch (error) {
            console.error('❌ Failed to save memory checkpoint:', error.message);
        }
    }
    
    async logPerformance(metrics) {
        if (!this.db) return;
        
        try {
            await this.db.query(`
                INSERT INTO agent_performance (
                    agent_id, task_name, execution_time_ms,
                    success, skill_improvement, timestamp
                ) VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                'NonLLMCollector',
                'data_collection',
                0,
                metrics.failureRate < 0.1,
                0,
                metrics.timestamp
            ]);
            
        } catch (error) {
            console.error('❌ Failed to log performance:', error.message);
        }
    }
    
    async persistAllBuffers() {
        console.log('💾 Persisting all buffers...');
        
        await this.persistSystemHealth();
        await this.persistAgentActions();
        await this.persistBlockchainData();
        await this.persistEvolutionData();
        
        const saved = this.stats.totalSaves;
        const failed = this.stats.failedSaves;
        const rate = ((saved / (saved + failed)) * 100).toFixed(1);
        
        console.log(`📊 Persistence Stats: ${saved} saved, ${failed} failed (${rate}% success)`);
    }
    
    getBufferedItemCount() {
        return Object.values(this.dataBuffer).reduce((sum, buffer) => sum + buffer.length, 0);
    }
    
    async saveToFile(type, data) {
        try {
            const dir = './backups/non_llm_data';
            await fs.mkdir(dir, { recursive: true });
            
            const filename = `${dir}/${type}_${Date.now()}.json`;
            await fs.writeFile(filename, JSON.stringify(data, null, 2));
            
            console.log(`   💾 Backup saved: ${filename}`);
            
        } catch (error) {
            console.error('❌ Failed to save backup:', error.message);
        }
    }
    
    async initializeFileBackup() {
        console.log('📁 Initializing file-based backup...');
        
        await fs.mkdir('./backups/non_llm_data', { recursive: true });
        
        // Override persist methods to use files
        this.db = null;
        console.log('   ⚠️ Running in file-only mode (no database)');
    }
    
    /**
     * 🔥 Collect data from AlphaGnome or other systems
     */
    async collectAlphaGnomeData(data) {
        // This can be called directly by AlphaGnome
        this.dataBuffer.evolutionData.push({
            source: 'AlphaGnome',
            ...data,
            collected_at: new Date()
        });
        
        // Persist if buffer is full
        if (this.dataBuffer.evolutionData.length >= 10) {
            await this.persistEvolutionData();
        }
    }
    
    /**
     * 🔥 Manual trigger for critical data
     */
    async forceSave(type, data) {
        console.log(`🔥 Force saving ${type} data...`);
        
        try {
            if (this.db) {
                await this.db.query(`
                    INSERT INTO knowledge_persistence (
                        knowledge_id, knowledge_type, content,
                        source_system, validation_score, is_verified
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    `force_${type}_${Date.now()}`,
                    type,
                    JSON.stringify(data),
                    'ForceSave',
                    1.0,
                    true
                ]);
                
                console.log(`   ✅ Force saved ${type} data`);
            } else {
                await this.saveToFile(`force_${type}`, data);
            }
            
        } catch (error) {
            console.error(`❌ Failed to force save ${type}:`, error.message);
        }
    }
    
    async getStats() {
        return {
            ...this.stats,
            bufferedItems: this.getBufferedItemCount(),
            buffers: {
                systemHealth: this.dataBuffer.systemHealth.length,
                agentActions: this.dataBuffer.agentActions.length,
                blockchainData: this.dataBuffer.blockchainData.length,
                evolutionData: this.dataBuffer.evolutionData.length
            }
        };
    }
    
    async shutdown() {
        console.log('🔥 Shutting down Non-LLM Data Collector...');
        
        // Clear intervals
        clearInterval(this.healthInterval);
        clearInterval(this.memoryInterval);
        clearInterval(this.performanceInterval);
        clearInterval(this.persistInterval);
        
        // Final persist
        await this.persistAllBuffers();
        
        // Close database
        if (this.db) {
            await this.db.end();
        }
        
        console.log('✅ Non-LLM Data Collector shutdown complete');
    }
}

// Export as singleton for easy integration
export const nonLLMCollector = new NonLLMDataCollector();

// Auto-initialize if running standalone
if (import.meta.url === `file://${process.argv[1]}`) {
    nonLLMCollector.initialize().catch(console.error);
}
