import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

class DatabaseConnection {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.connectionConfig = {
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost', 
            database: process.env.DB_NAME || 'AIGO_Construction_Syndicate',
            password: process.env.DB_PASSWORD || 'postgres',
            port: process.env.DB_PORT || 5432,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        };
        
        console.log('🔗 DATABASE CONNECTION: Initializing connection pool...');
        this.initializeConnection();
    }

    async initializeConnection() {
        try {
            this.pool = new Pool(this.connectionConfig);
            
            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
            this.isConnected = true;
            console.log('✅ DATABASE CONNECTION: Successfully connected to PostgreSQL');
            
            // Initialize database schema
            await this.initializeSchema();
            
        } catch (error) {
            console.error('❌ DATABASE CONNECTION: Failed to connect:', error.message);
            this.isConnected = false;
            
            // Try to create database if it doesn't exist
            await this.createDatabaseIfNeeded();
        }
    }

    async createDatabaseIfNeeded() {
        try {
            console.log('🔧 DATABASE CONNECTION: Attempting to create database...');
            
            const tempConfig = { ...this.connectionConfig };
            tempConfig.database = 'postgres'; // Connect to default database
            
            const tempPool = new Pool(tempConfig);
            const client = await tempPool.connect();
            
            // Check if database exists
            const result = await client.query(
                `SELECT 1 FROM pg_database WHERE datname = $1`,
                [this.connectionConfig.database]
            );
            
            if (result.rows.length === 0) {
                await client.query(`CREATE DATABASE ${this.connectionConfig.database}`);
                console.log(`✅ DATABASE CONNECTION: Created database '${this.connectionConfig.database}'`);
            }
            
            client.release();
            await tempPool.end();
            
            // Now try to connect to the actual database
            await this.initializeConnection();
            
        } catch (error) {
            console.error('❌ DATABASE CONNECTION: Failed to create database:', error.message);
        }
    }

    async initializeSchema() {
        const client = await this.pool.connect();
        try {
            console.log('🔧 DATABASE CONNECTION: Initializing database schema...');
            
            // Create agents table
            await client.query(`
                CREATE TABLE IF NOT EXISTS agents (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    character_data JSONB NOT NULL,
                    memory_data JSONB DEFAULT '{}',
                    performance_metrics JSONB DEFAULT '{}',
                    learning_state JSONB DEFAULT '{}',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW(),
                    is_active BOOLEAN DEFAULT true
                )
            `);

            // Create arbitrage_opportunities table
            await client.query(`
                CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
                    id SERIAL PRIMARY KEY,
                    token_pair VARCHAR(100) NOT NULL,
                    profit_potential DECIMAL(10,6) NOT NULL,
                    gas_cost DECIMAL(10,6) NOT NULL,
                    net_profit DECIMAL(10,6) NOT NULL,
                    confidence_score DECIMAL(3,2) NOT NULL,
                    execution_status VARCHAR(50) DEFAULT 'pending',
                    pool_data JSONB NOT NULL,
                    agent_id INTEGER REFERENCES agents(id),
                    created_at TIMESTAMP DEFAULT NOW(),
                    executed_at TIMESTAMP,
                    transaction_hash VARCHAR(66)
                )
            `);

            // Create pools table
            await client.query(`
                CREATE TABLE IF NOT EXISTS pools (
                    id SERIAL PRIMARY KEY,
                    pool_address VARCHAR(42) UNIQUE NOT NULL,
                    dex_name VARCHAR(100) NOT NULL,
                    token0_address VARCHAR(42) NOT NULL,
                    token1_address VARCHAR(42) NOT NULL,
                    token0_symbol VARCHAR(20) NOT NULL,
                    token1_symbol VARCHAR(20) NOT NULL,
                    fee DECIMAL(5,4) NOT NULL,
                    reserves JSONB NOT NULL,
                    price_data JSONB NOT NULL,
                    last_updated TIMESTAMP DEFAULT NOW(),
                    is_active BOOLEAN DEFAULT true
                )
            `);

            // Create performance_metrics table
            await client.query(`
                CREATE TABLE IF NOT EXISTS performance_metrics (
                    id SERIAL PRIMARY KEY,
                    agent_id INTEGER REFERENCES agents(id),
                    metric_type VARCHAR(100) NOT NULL,
                    metric_value DECIMAL(15,8) NOT NULL,
                    metadata JSONB DEFAULT '{}',
                    recorded_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create learning_history table
            await client.query(`
                CREATE TABLE IF NOT EXISTS learning_history (
                    id SERIAL PRIMARY KEY,
                    agent_id INTEGER REFERENCES agents(id),
                    learning_type VARCHAR(100) NOT NULL,
                    input_data JSONB NOT NULL,
                    output_data JSONB NOT NULL,
                    reward DECIMAL(10,6),
                    confidence DECIMAL(3,2),
                    learned_at TIMESTAMP DEFAULT NOW()
                )
            `);

            console.log('✅ DATABASE CONNECTION: Schema initialized successfully');
            
        } catch (error) {
            console.error('❌ DATABASE CONNECTION: Schema initialization failed:', error.message);
        } finally {
            client.release();
        }
    }

    async query(text, params = []) {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`📊 DATABASE QUERY: Executed in ${duration}ms: ${text.substring(0, 100)}...`);
            return result;
        } catch (error) {
            console.error('❌ DATABASE QUERY ERROR:', error.message);
            throw error;
        }
    }

    async getClient() {
        if (!this.isConnected) {
            throw new Error('Database not connected');
        }
        return await this.pool.connect();
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('🔒 DATABASE CONNECTION: Pool closed');
        }
    }

    // Agent-specific methods
    async saveAgent(agentData) {
        const { name, characterData, memoryData = {}, performanceMetrics = {}, learningState = {} } = agentData;
        
        const result = await this.query(`
            INSERT INTO agents (name, character_data, memory_data, performance_metrics, learning_state)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (name) 
            DO UPDATE SET 
                character_data = $2,
                memory_data = $3,
                performance_metrics = $4,
                learning_state = $5,
                updated_at = NOW()
            RETURNING *
        `, [name, characterData, memoryData, performanceMetrics, learningState]);
        
        console.log(`💾 DATABASE: Saved agent '${name}' to database`);
        return result.rows[0];
    }

    async getAgent(name) {
        const result = await this.query('SELECT * FROM agents WHERE name = $1', [name]);
        return result.rows[0] || null;
    }

    async getAllAgents() {
        const result = await this.query('SELECT * FROM agents WHERE is_active = true');
        return result.rows;
    }

    async saveArbitrageOpportunity(opportunity) {
        const result = await this.query(`
            INSERT INTO arbitrage_opportunities 
            (token_pair, profit_potential, gas_cost, net_profit, confidence_score, pool_data, agent_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            opportunity.tokenPair,
            opportunity.profitPotential,
            opportunity.gasCost,
            opportunity.netProfit,
            opportunity.confidenceScore,
            opportunity.poolData,
            opportunity.agentId
        ]);
        
        console.log(`💰 DATABASE: Saved arbitrage opportunity: ${opportunity.tokenPair} - Profit: ${opportunity.netProfit} ETH`);
        return result.rows[0];
    }

    async getArbitrageOpportunities(limit = 100) {
        const result = await this.query(`
            SELECT * FROM arbitrage_opportunities 
            ORDER BY created_at DESC 
            LIMIT $1
        `, [limit]);
        return result.rows;
    }

    async savePerformanceMetric(agentId, metricType, metricValue, metadata = {}) {
        const result = await this.query(`
            INSERT INTO performance_metrics (agent_id, metric_type, metric_value, metadata)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [agentId, metricType, metricValue, metadata]);
        
        console.log(`📈 DATABASE: Saved performance metric for agent ${agentId}: ${metricType} = ${metricValue}`);
        return result.rows[0];
    }

    async saveLearningRecord(agentId, learningType, inputData, outputData, reward = null, confidence = null) {
        const result = await this.query(`
            INSERT INTO learning_history (agent_id, learning_type, input_data, output_data, reward, confidence)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [agentId, learningType, inputData, outputData, reward, confidence]);
        
        console.log(`🧠 DATABASE: Saved learning record for agent ${agentId}: ${learningType}`);
        return result.rows[0];
    }

    // Pool management methods
    async savePool(poolData) {
        const result = await this.query(`
            INSERT INTO pools 
            (pool_address, dex_name, token0_address, token1_address, token0_symbol, token1_symbol, fee, reserves, price_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (pool_address)
            DO UPDATE SET
                reserves = $8,
                price_data = $9,
                last_updated = NOW()
            RETURNING *
        `, [
            poolData.poolAddress,
            poolData.dexName,
            poolData.token0Address,
            poolData.token1Address,
            poolData.token0Symbol,
            poolData.token1Symbol,
            poolData.fee,
            poolData.reserves,
            poolData.priceData
        ]);
        
        return result.rows[0];
    }

    async getAllPools() {
        const result = await this.query('SELECT * FROM pools WHERE is_active = true');
        return result.rows;
    }

    async updatePoolPrices(poolAddress, priceData, reserves) {
        const result = await this.query(`
            UPDATE pools 
            SET price_data = $2, reserves = $3, last_updated = NOW()
            WHERE pool_address = $1
            RETURNING *
        `, [poolAddress, priceData, reserves]);
        
        return result.rows[0];
    }
}

// Create singleton instance
const dbConnection = new DatabaseConnection();

export default dbConnection;
export { DatabaseConnection }; 