#!/usr/bin/env node

/**
 * PostgreSQL Database Setup for Arbitrage System
 * 
 * This script:
 * 1. Creates the arbitrage_db database (if it doesn't exist)
 * 2. Sets up all necessary tables and indexes
 * 3. Provides database management utilities
 */

import pkg from 'pg';
const { Pool, Client } = pkg;
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseSetup {
    constructor() {
        // Extract database components from URL
        const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arbitrage_db';
        const urlParts = new URL(dbUrl);
        
        this.dbConfig = {
            host: urlParts.hostname,
            port: parseInt(urlParts.port) || 5432,
            username: urlParts.username,
            password: urlParts.password,
            database: urlParts.pathname.slice(1) // Remove leading slash
        };

        console.log(`🔧 Database Config:
   Host: ${this.dbConfig.host}:${this.dbConfig.port}
   User: ${this.dbConfig.username}
   Database: ${this.dbConfig.database}`);
    }

    async createDatabase() {
        // Connect without specifying database to create it
        const adminClient = new Client({
            host: this.dbConfig.host,
            port: this.dbConfig.port,
            user: this.dbConfig.username,
            password: this.dbConfig.password,
            database: 'postgres' // Connect to default postgres database
        });

        try {
            await adminClient.connect();
            console.log('🔗 Connected to PostgreSQL server');

            // Check if database exists
            const dbCheckResult = await adminClient.query(
                "SELECT 1 FROM pg_database WHERE datname = $1",
                [this.dbConfig.database]
            );

            if (dbCheckResult.rows.length === 0) {
                console.log(`📁 Creating database: ${this.dbConfig.database}`);
                await adminClient.query(`CREATE DATABASE "${this.dbConfig.database}"`);
                console.log('✅ Database created successfully');
            } else {
                console.log('✅ Database already exists');
            }

        } catch (error) {
            console.error('❌ Error creating database:', error.message);
            throw error;
        } finally {
            await adminClient.end();
        }
    }

    async setupTables() {
        // Connect to the arbitrage database
        const db = new Pool({
            host: this.dbConfig.host,
            port: this.dbConfig.port,
            user: this.dbConfig.username,
            password: this.dbConfig.password,
            database: this.dbConfig.database
        });

        try {
            console.log('🗄️ Setting up database tables...');

            // 1. Tokens table - Core token metadata
            await db.query(`
                CREATE TABLE IF NOT EXISTS tokens (
                    address TEXT PRIMARY KEY,
                    symbol TEXT NOT NULL,
                    name TEXT,
                    decimals INTEGER NOT NULL DEFAULT 18,
                    chain TEXT NOT NULL,
                    chain_id INTEGER NOT NULL,
                    market_cap DECIMAL,
                    price_usd DECIMAL,
                    logo_url TEXT,
                    is_verified BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created tokens table');

            // 2. Pools table - DEX pool information
            await db.query(`
                CREATE TABLE IF NOT EXISTS pools (
                    id TEXT PRIMARY KEY,
                    address TEXT NOT NULL,
                    dex TEXT NOT NULL,
                    chain TEXT NOT NULL,
                    chain_id INTEGER NOT NULL,
                    token0_address TEXT NOT NULL,
                    token0_symbol TEXT NOT NULL,
                    token0_decimals INTEGER NOT NULL,
                    token1_address TEXT NOT NULL,
                    token1_symbol TEXT NOT NULL,
                    token1_decimals INTEGER NOT NULL,
                    fee INTEGER NOT NULL DEFAULT 3000,
                    tick_spacing INTEGER,
                    reserve0 DECIMAL NOT NULL DEFAULT 0,
                    reserve1 DECIMAL NOT NULL DEFAULT 0,
                    total_supply DECIMAL NOT NULL DEFAULT 0,
                    liquidity_usd DECIMAL NOT NULL DEFAULT 0,
                    volume_24h DECIMAL NOT NULL DEFAULT 0,
                    volume_7d DECIMAL NOT NULL DEFAULT 0,
                    fees_earned_24h DECIMAL NOT NULL DEFAULT 0,
                    apr DECIMAL NOT NULL DEFAULT 0,
                    price_token0 DECIMAL,
                    price_token1 DECIMAL,
                    is_active BOOLEAN NOT NULL DEFAULT true,
                    data_quality_score DECIMAL NOT NULL DEFAULT 0,
                    last_updated BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created pools table');

            // 3. Price history table - Track price movements
            await db.query(`
                CREATE TABLE IF NOT EXISTS price_history (
                    id TEXT PRIMARY KEY,
                    pool_id TEXT NOT NULL,
                    price DECIMAL NOT NULL,
                    reserve0 DECIMAL NOT NULL,
                    reserve1 DECIMAL NOT NULL,
                    block_number BIGINT NOT NULL,
                    timestamp BIGINT NOT NULL,
                    gas_price DECIMAL NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created price_history table');

            // 4. Gas tracker table - Monitor gas costs
            await db.query(`
                CREATE TABLE IF NOT EXISTS gas_tracker (
                    id TEXT PRIMARY KEY,
                    chain TEXT NOT NULL,
                    block_number BIGINT NOT NULL,
                    base_fee DECIMAL NOT NULL,
                    priority_fee DECIMAL NOT NULL DEFAULT 0,
                    total_gas DECIMAL NOT NULL,
                    timestamp BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created gas_tracker table');

            // 5. Arbitrage opportunities table
            await db.query(`
                CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
                    id TEXT PRIMARY KEY,
                    pool_a TEXT NOT NULL,
                    pool_b TEXT NOT NULL,
                    token_pair TEXT NOT NULL,
                    price_a DECIMAL NOT NULL,
                    price_b DECIMAL NOT NULL,
                    price_delta DECIMAL NOT NULL,
                    profit_estimate DECIMAL NOT NULL,
                    gas_estimate DECIMAL NOT NULL,
                    liquidity_required DECIMAL NOT NULL,
                    viable BOOLEAN NOT NULL,
                    cross_chain BOOLEAN NOT NULL DEFAULT false,
                    detected_at BIGINT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'detected',
                    executed_at BIGINT,
                    profit_realized DECIMAL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created arbitrage_opportunities table');

            // 6. System metrics table - Track system performance
            await db.query(`
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id SERIAL PRIMARY KEY,
                    metric_name TEXT NOT NULL,
                    metric_value DECIMAL NOT NULL,
                    chain TEXT,
                    timestamp BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created system_metrics table');

            // 7. Alert logs table - Track important events
            await db.query(`
                CREATE TABLE IF NOT EXISTS alert_logs (
                    id SERIAL PRIMARY KEY,
                    alert_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    metadata JSONB,
                    resolved BOOLEAN DEFAULT false,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('✅ Created alert_logs table');

            await this.createIndexes(db);
            await this.createFunctions(db);

            console.log('🎉 All tables created successfully!');

        } catch (error) {
            console.error('❌ Error setting up tables:', error);
            throw error;
        } finally {
            await db.end();
        }
    }

    async createIndexes(db) {
        console.log('📊 Creating database indexes...');

        const indexes = [
            // Tokens table indexes
            'CREATE INDEX IF NOT EXISTS idx_tokens_chain ON tokens (chain)',
            'CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens (symbol)',
            'CREATE INDEX IF NOT EXISTS idx_tokens_market_cap ON tokens (market_cap DESC NULLS LAST)',
            'CREATE INDEX IF NOT EXISTS idx_tokens_verified ON tokens (is_verified)',
            
            // Pools table indexes
            'CREATE INDEX IF NOT EXISTS idx_pools_chain ON pools (chain)',
            'CREATE INDEX IF NOT EXISTS idx_pools_dex ON pools (dex)',
            'CREATE INDEX IF NOT EXISTS idx_pools_liquidity ON pools (liquidity_usd DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_volume ON pools (volume_24h DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_quality ON pools (data_quality_score DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_token_pair ON pools (token0_symbol, token1_symbol)',
            'CREATE INDEX IF NOT EXISTS idx_pools_active ON pools (is_active, liquidity_usd DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_last_updated ON pools (last_updated)',
            'CREATE INDEX IF NOT EXISTS idx_pools_chain_active ON pools (chain, is_active)',
            
            // Price history indexes
            'CREATE INDEX IF NOT EXISTS idx_price_history_pool ON price_history (pool_id)',
            'CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history (timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_price_history_pool_timestamp ON price_history (pool_id, timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_price_history_recent ON price_history (timestamp DESC) WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 86400',
            
            // Gas tracker indexes
            'CREATE INDEX IF NOT EXISTS idx_gas_tracker_chain ON gas_tracker (chain)',
            'CREATE INDEX IF NOT EXISTS idx_gas_tracker_timestamp ON gas_tracker (timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_gas_tracker_chain_timestamp ON gas_tracker (chain, timestamp DESC)',
            
            // Arbitrage opportunities indexes
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_viable ON arbitrage_opportunities (viable, profit_estimate DESC)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_detected ON arbitrage_opportunities (detected_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_status ON arbitrage_opportunities (status)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_token_pair ON arbitrage_opportunities (token_pair)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_cross_chain ON arbitrage_opportunities (cross_chain)',
            'CREATE INDEX IF NOT EXISTS idx_arbitrage_recent ON arbitrage_opportunities (detected_at DESC) WHERE detected_at > EXTRACT(EPOCH FROM NOW()) - 86400',
            
            // System metrics indexes
            'CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics (metric_name)',
            'CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics (timestamp DESC)',
            'CREATE INDEX IF NOT EXISTS idx_system_metrics_name_timestamp ON system_metrics (metric_name, timestamp DESC)',
            
            // Alert logs indexes
            'CREATE INDEX IF NOT EXISTS idx_alert_logs_type ON alert_logs (alert_type)',
            'CREATE INDEX IF NOT EXISTS idx_alert_logs_severity ON alert_logs (severity)',
            'CREATE INDEX IF NOT EXISTS idx_alert_logs_resolved ON alert_logs (resolved)',
            'CREATE INDEX IF NOT EXISTS idx_alert_logs_created ON alert_logs (created_at DESC)'
        ];

        for (const index of indexes) {
            try {
                await db.query(index);
            } catch (error) {
                console.warn(`⚠️ Index creation warning: ${error.message}`);
            }
        }

        console.log('✅ Database indexes created');
    }

    async createFunctions(db) {
        console.log('⚙️ Creating database functions...');

        // Function to update timestamp
        await db.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);

        // Trigger for tokens table
        await db.query(`
            DROP TRIGGER IF EXISTS update_tokens_updated_at ON tokens;
            CREATE TRIGGER update_tokens_updated_at 
                BEFORE UPDATE ON tokens 
                FOR EACH ROW 
                EXECUTE FUNCTION update_updated_at_column();
        `);

        // Function to clean old data
        await db.query(`
            CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 7)
            RETURNS INTEGER AS $$
            DECLARE
                deleted_count INTEGER := 0;
                cutoff_timestamp BIGINT;
            BEGIN
                cutoff_timestamp := EXTRACT(EPOCH FROM NOW()) - (days_to_keep * 86400);
                
                -- Clean old price history
                DELETE FROM price_history WHERE timestamp < cutoff_timestamp;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
                -- Clean old gas tracker data
                DELETE FROM gas_tracker WHERE timestamp < cutoff_timestamp;
                
                -- Clean resolved alerts older than 30 days
                DELETE FROM alert_logs 
                WHERE resolved = true 
                AND created_at < NOW() - INTERVAL '30 days';
                
                RETURN deleted_count;
            END;
            $$ LANGUAGE plpgsql;
        `);

        console.log('✅ Database functions created');
    }

    async showStatus() {
        const db = new Pool({
            host: this.dbConfig.host,
            port: this.dbConfig.port,
            user: this.dbConfig.username,
            password: this.dbConfig.password,
            database: this.dbConfig.database
        });

        try {
            console.log('\n📊 Database Status Report:');
            console.log('════════════════════════════');

            // Check tables
            const tables = await db.query(`
                SELECT tablename, schemaname 
                FROM pg_tables 
                WHERE schemaname = 'public' 
                ORDER BY tablename
            `);

            console.log(`\n📋 Tables (${tables.rows.length}):`);
            tables.rows.forEach(table => {
                console.log(`   ✅ ${table.tablename}`);
            });

            // Check data counts
            const dataCounts = await Promise.all([
                db.query('SELECT COUNT(*) as count FROM tokens'),
                db.query('SELECT COUNT(*) as count FROM pools'),
                db.query('SELECT COUNT(*) as count FROM price_history'),
                db.query('SELECT COUNT(*) as count FROM gas_tracker'),
                db.query('SELECT COUNT(*) as count FROM arbitrage_opportunities')
            ]);

            console.log('\n📊 Data Counts:');
            console.log(`   Tokens: ${dataCounts[0].rows[0].count}`);
            console.log(`   Pools: ${dataCounts[1].rows[0].count}`);
            console.log(`   Price History: ${dataCounts[2].rows[0].count}`);
            console.log(`   Gas Tracker: ${dataCounts[3].rows[0].count}`);
            console.log(`   Arbitrage Opportunities: ${dataCounts[4].rows[0].count}`);

            // Check recent activity
            const recentActivity = await db.query(`
                SELECT 
                    COUNT(*) as recent_prices,
                    MAX(timestamp) as last_price_update
                FROM price_history 
                WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 3600
            `);

            if (recentActivity.rows[0].recent_prices > 0) {
                const lastUpdate = new Date(recentActivity.rows[0].last_price_update * 1000);
                console.log(`\n🕒 Recent Activity:`);
                console.log(`   Price updates (last hour): ${recentActivity.rows[0].recent_prices}`);
                console.log(`   Last update: ${lastUpdate.toLocaleString()}`);
            }

            // Database size
            const dbSize = await db.query(`
                SELECT pg_size_pretty(pg_database_size(current_database())) as size
            `);
            console.log(`\n💾 Database size: ${dbSize.rows[0].size}`);

        } catch (error) {
            console.error('❌ Error checking status:', error.message);
        } finally {
            await db.end();
        }
    }

    async run() {
        console.log('🚀 Setting up PostgreSQL database for Arbitrage System...\n');

        try {
            // Step 1: Create database
            await this.createDatabase();

            // Step 2: Setup tables and schema
            await this.setupTables();

            // Step 3: Show status
            await this.showStatus();

            console.log('\n🎉 Database setup completed successfully!');
            console.log('\n🏃‍♂️ Ready to run:');
            console.log('   node scripts/bootstrap-free-data.js');
            console.log('   node scripts/start-free-collector.js');
            console.log('   node scripts/data-collection-dashboard.js');

        } catch (error) {
            console.error('\n💥 Database setup failed:', error);
            process.exit(1);
        }
    }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const setup = new DatabaseSetup();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            await setup.showStatus();
            break;
        case 'create-db':
            await setup.createDatabase();
            break;
        case 'setup-tables':
            await setup.setupTables();
            break;
        default:
            await setup.run();
    }
} 