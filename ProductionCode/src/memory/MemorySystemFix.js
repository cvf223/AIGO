/**
 * 🧠 Memory System Fix - Ensures proper database initialization
 */

import databaseManager from '../database/EnhancedDatabaseManager.js';

export class MemorySystemBase {
    constructor(config = {}) {
        this.config = config;
        this.dbPool = null;
        this.isInitialized = false;
        this.memoryCache = new Map(); // Local cache for performance
    }
    
    async initialize() {
        console.log(`   🧠 Initializing ${this.constructor.name}...`);
        
        // Get database pool from enhanced manager
        try {
            this.dbPool = await databaseManager.getPool();
            
            if (!this.dbPool) {
                throw new Error('Database pool not available');
            }
            
            // Verify connection
            const result = await this.dbPool.query('SELECT 1');
            console.log(`   ✅ ${this.constructor.name} database connection verified`);
            
            // Load existing memories from database
            await this.loadMemoriesFromDatabase();
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error(`   ❌ ${this.constructor.name} initialization failed:`, error.message);
            throw new Error(`MEMORY_INIT_FAILED: ${this.constructor.name} requires database connection`);
        }
    }
    
    async loadMemoriesFromDatabase() {
        try {
            const result = await this.dbPool.query(
                'SELECT * FROM agent_memories WHERE agent_id = $1 ORDER BY created_at DESC LIMIT 1000',
                [this.config.agentId || 'default']
            );
            
            for (const row of result.rows) {
                this.memoryCache.set(row.id, row);
            }
            
            console.log(`   📚 Loaded ${result.rows.length} memories from database`);
        } catch (error) {
            console.error('   ⚠️ Failed to load memories:', error.message);
            // Create table if it doesn't exist
            await this.createMemoryTable();
        }
    }
    
    async createMemoryTable() {
        const query = `
            CREATE TABLE IF NOT EXISTS agent_memories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                memory_type VARCHAR(100),
                content JSONB NOT NULL,
                importance FLOAT DEFAULT 0.5,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                accessed_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        
        try {
            await this.dbPool.query(query);
            console.log('   ✅ Memory table created');
        } catch (error) {
            console.error('   ❌ Failed to create memory table:', error.message);
        }
    }
    
    async storeMemory(memory) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const query = `
            INSERT INTO agent_memories (agent_id, memory_type, content, importance)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        
        const result = await this.dbPool.query(query, [
            this.config.agentId || 'default',
            memory.type || 'general',
            JSON.stringify(memory.content),
            memory.importance || 0.5
        ]);
        
        const storedMemory = { ...memory, id: result.rows[0].id };
        this.memoryCache.set(result.rows[0].id, storedMemory);
        
        return storedMemory;
    }
    
    async retrieveMemories(query, limit = 10) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        // First check cache
        const cachedResults = Array.from(this.memoryCache.values())
            .filter(m => this.matchesQuery(m, query))
            .slice(0, limit);
        
        if (cachedResults.length >= limit) {
            return cachedResults;
        }
        
        // Then query database
        const dbQuery = `
            SELECT * FROM agent_memories 
            WHERE agent_id = $1 
            AND content::text ILIKE $2
            ORDER BY importance DESC, created_at DESC
            LIMIT $3
        `;
        
        const result = await this.dbPool.query(dbQuery, [
            this.config.agentId || 'default',
            `%${query}%`,
            limit
        ]);
        
        return result.rows;
    }
    
    matchesQuery(memory, query) {
        const content = JSON.stringify(memory.content).toLowerCase();
        return content.includes(query.toLowerCase());
    }
}

export default MemorySystemBase;
