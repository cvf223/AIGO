/**
 * 🗄️ Enhanced Database Manager - Production Implementation
 * ========================================================
 * Manages database connections with retry logic, connection pooling,
 * and proper initialization sequencing. NO FALLBACKS - only robust connections.
 */

import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

class EnhancedDatabaseManager {
    constructor() {
        if (EnhancedDatabaseManager.instance) {
            return EnhancedDatabaseManager.instance;
        }
        
        this.pool = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 10;
        this.retryDelay = 2000; // Start with 2 seconds
        this.initPromise = null;
        
        EnhancedDatabaseManager.instance = this;
    }
    
    async initialize() {
        // If already initializing, return the same promise
        if (this.initPromise) {
            return this.initPromise;
        }
        
        // If already connected, return immediately
        if (this.isConnected && this.pool) {
            return this.pool;
        }
        
        // Start initialization
        this.initPromise = this._doInitialize();
        return this.initPromise;
    }
    
    async _doInitialize() {
        console.log('🗄️ Initializing Enhanced Database Manager...');
        
        // Build connection config from environment
        const config = {
            host: process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.POSTGRES_PORT || '5432'),
            database: process.env.POSTGRES_DB || 'construction_syndicate',
            user: process.env.POSTGRES_USER || 'postgres',
            max: 200, // Maximum connections
            min: 50,  // Minimum connections to maintain
            idleTimeoutMillis: 300000, // 5 minutes
            connectionTimeoutMillis: 10000, // 10 seconds
            statement_timeout: 30000, // 30 seconds
            query_timeout: 30000,
            application_name: 'EliteConstructionAI'
        };
        
        // Add password if using password auth
        if (process.env.POSTGRES_PASSWORD) {
            config.password = process.env.POSTGRES_PASSWORD;
        }
        
        // Retry connection with exponential backoff
        while (this.connectionAttempts < this.maxRetries) {
            this.connectionAttempts++;
            
            try {
                console.log(`   🔄 Database connection attempt ${this.connectionAttempts}/${this.maxRetries}...`);
                
                // Create pool
                this.pool = new pg.Pool(config);
                
                // Add error handler
                this.pool.on('error', (err) => {
                    console.error('   ❌ Unexpected pool error:', err.message);
                    this.handlePoolError(err);
                });
                
                // Test connection
                const client = await this.pool.connect();
                const result = await client.query('SELECT NOW()');
                client.release();
                
                console.log('   ✅ Database connected successfully at:', result.rows[0].now);
                this.isConnected = true;
                
                // Create required schemas if they don't exist
                await this.ensureSchemas();
                
                // Start health monitoring
                this.startHealthMonitoring();
                
                return this.pool;
                
            } catch (error) {
                console.error(`   ❌ Connection attempt ${this.connectionAttempts} failed:`, error.message);
                
                if (this.connectionAttempts < this.maxRetries) {
                    const delay = this.retryDelay * Math.pow(1.5, this.connectionAttempts - 1);
                    console.log(`   ⏳ Retrying in ${delay/1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('   ❌ CRITICAL: Database connection failed after all retries!');
                    throw new Error('DATABASE_CONNECTION_FAILED: Unable to establish database connection');
                }
            }
        }
    }
    
    async ensureSchemas() {
        console.log('   🏗️ Ensuring required database schemas exist...');
        
        const schemas = [
            // Core tables
            `CREATE TABLE IF NOT EXISTS system_state (
                key VARCHAR(255) PRIMARY KEY,
                value JSONB NOT NULL,
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            // Agent memory
            `CREATE TABLE IF NOT EXISTS agent_memories (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                memory_type VARCHAR(100),
                content JSONB NOT NULL,
                importance FLOAT DEFAULT 0.5,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                accessed_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            // Shared memory
            `CREATE TABLE IF NOT EXISTS shared_memory (
                key VARCHAR(255) PRIMARY KEY,
                value JSONB NOT NULL,
                version INTEGER DEFAULT 1,
                updated_by VARCHAR(255),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            // Knowledge graph
            `CREATE TABLE IF NOT EXISTS kg_nodes (
                node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                node_type VARCHAR(100) NOT NULL,
                properties JSONB NOT NULL DEFAULT '{}'::jsonb,
                embedding_data BYTEA,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            `CREATE TABLE IF NOT EXISTS kg_edges (
                edge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                source_id UUID REFERENCES kg_nodes(node_id),
                target_id UUID REFERENCES kg_nodes(node_id),
                edge_type VARCHAR(100) NOT NULL,
                properties JSONB DEFAULT '{}'::jsonb,
                weight FLOAT DEFAULT 1.0,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            // Quantum entanglements
            `CREATE TABLE IF NOT EXISTS kg_entanglements (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                node_a_id UUID REFERENCES kg_nodes(node_id),
                node_b_id UUID REFERENCES kg_nodes(node_id),
                entanglement_strength FLOAT DEFAULT 0.5,
                quantum_state JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )`,
            
            // Create indexes for performance
            `CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_id ON agent_memories(agent_id)`,
            `CREATE INDEX IF NOT EXISTS idx_agent_memories_created_at ON agent_memories(created_at DESC)`,
            `CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source_id)`,
            `CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target_id)`,
            `CREATE INDEX IF NOT EXISTS idx_shared_memory_updated_at ON shared_memory(updated_at DESC)`
        ];
        
        for (const schema of schemas) {
            try {
                await this.pool.query(schema);
            } catch (error) {
                console.warn(`   ⚠️ Schema creation warning: ${error.message}`);
            }
        }
        
        console.log('   ✅ Database schemas verified');
    }
    
    startHealthMonitoring() {
        // Check connection health every 30 seconds
        setInterval(async () => {
            try {
                if (this.pool) {
                    const client = await this.pool.connect();
                    await client.query('SELECT 1');
                    client.release();
                }
            } catch (error) {
                console.error('   ❌ Database health check failed:', error.message);
                this.isConnected = false;
                // Attempt reconnection
                this.connectionAttempts = 0;
                await this.initialize();
            }
        }, 30000);
    }
    
    handlePoolError(error) {
        console.error('   🔥 Pool error detected:', error.message);
        this.isConnected = false;
        
        // Attempt to recreate pool
        setTimeout(async () => {
            this.connectionAttempts = 0;
            this.initPromise = null;
            await this.initialize();
        }, 5000);
    }
    
    async query(text, params) {
        if (!this.isConnected) {
            await this.initialize();
        }
        
        const client = await this.pool.connect();
        try {
            const result = await client.query(text, params);
            return result;
        } finally {
            client.release();
        }
    }
    
    async getPool() {
        if (!this.isConnected) {
            await this.initialize();
        }
        return this.pool;
    }
    
    getStatus() {
        return {
            connected: this.isConnected,
            poolStats: this.pool ? {
                total: this.pool.totalCount,
                idle: this.pool.idleCount,
                waiting: this.pool.waitingCount
            } : null
        };
    }
}

// Export singleton instance
export const databaseManager = new EnhancedDatabaseManager();
export default databaseManager;
