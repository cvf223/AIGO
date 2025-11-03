#!/usr/bin/env node

/**
 * 🚀 DATABASE INITIALIZATION SCRIPT
 * ================================
 * One-command database setup for the AI Flash Loan Arbitrage Syndicate
 * 
 * Usage: node initialize-database.js [options]
 * 
 * Options:
 *   --force    Drop existing database and recreate
 *   --seed     Load sample data after initialization
 *   --verify   Run verification after setup
 */

import { execSync } from 'child_process';
import pg from 'pg';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import { DatabaseMigrationSystem } from './migrations/migration-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
    force: args.includes('--force'),
    seed: args.includes('--seed'),
    verify: args.includes('--verify')
};

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres' // Connect to default database first
};

const syndicateDbName = process.env.DB_NAME || 'arbitrage_syndicate';
const syndicateUser = process.env.DB_SYNDICATE_USER || 'syndicate_user';
const syndicatePassword = process.env.DB_SYNDICATE_PASSWORD || 'syndicate_secure_pass_2024';

class DatabaseInitializer {
    constructor() {
        this.adminPool = new pg.Pool(dbConfig);
    }

    /**
     * Check if database exists
     */
    async databaseExists(dbName) {
        const result = await this.adminPool.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );
        return result.rows.length > 0;
    }

    /**
     * Create database and user
     */
    async createDatabase() {
        console.log('🗄️  Creating database and user...');

        const client = await this.adminPool.connect();
        
        try {
            // Check if database exists
            const exists = await this.databaseExists(syndicateDbName);
            
            if (exists && !options.force) {
                console.log(`⚠️  Database '${syndicateDbName}' already exists. Use --force to recreate.`);
                return false;
            }
            
            if (exists && options.force) {
                console.log(`🔄 Dropping existing database '${syndicateDbName}'...`);
                
                // Terminate existing connections
                await client.query(`
                    SELECT pg_terminate_backend(pid)
                    FROM pg_stat_activity
                    WHERE datname = $1 AND pid <> pg_backend_pid()
                `, [syndicateDbName]);
                
                await client.query(`DROP DATABASE IF EXISTS ${syndicateDbName}`);
            }
            
            // Create user if not exists
            const userResult = await client.query(
                `SELECT 1 FROM pg_user WHERE usename = $1`,
                [syndicateUser]
            );
            
            if (userResult.rows.length === 0) {
                console.log(`👤 Creating user '${syndicateUser}'...`);
                await client.query(
                    `CREATE USER ${syndicateUser} WITH PASSWORD '${syndicatePassword}'`
                );
            }
            
            // Create database
            console.log(`📦 Creating database '${syndicateDbName}'...`);
            await client.query(`CREATE DATABASE ${syndicateDbName} OWNER ${syndicateUser}`);
            
            // Grant privileges
            await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${syndicateDbName} TO ${syndicateUser}`);
            
            console.log('✅ Database and user created successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Error creating database:', error.message);
    throw error;
  } finally {
            client.release();
  }
}

/**
     * Run migrations
     */
    async runMigrations() {
        console.log('\n📦 Running database migrations...');
        
        const migrationConfig = {
            connectionString: `postgresql://${syndicateUser}:${syndicatePassword}@${dbConfig.host}:${dbConfig.port}/${syndicateDbName}`,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000
        };
        
        const migrator = new DatabaseMigrationSystem(migrationConfig);
        
        try {
            await migrator.initialize();
            await migrator.migrate();
            await migrator.close();
            
            console.log('✅ Migrations completed successfully');
            return true;
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            await migrator.close();
            throw error;
  }
}

/**
     * Load seed data
     */
    async loadSeedData() {
        console.log('\n🌱 Loading seed data...');
        
        const pool = new pg.Pool({
            connectionString: `postgresql://${syndicateUser}:${syndicatePassword}@${dbConfig.host}:${dbConfig.port}/${syndicateDbName}`
        });
        
        const client = await pool.connect();
        
        try {
            // Insert sample agents
            const agents = [
                {
                    id: 'agent-alpha-001',
                    name: 'Alpha Arbitrage Hunter',
                    type: 'ARBITRAGE_SPECIALIST',
                    specialization: 'CROSS_DEX_ARBITRAGE',
                    chain: 'ethereum'
                },
                {
                    id: 'agent-beta-002',
                    name: 'Beta Flash Loan Master',
                    type: 'FLASH_LOAN_SPECIALIST',
                    specialization: 'FLASH_LOAN_ARBITRAGE',
                    chain: 'ethereum'
                },
                {
                    id: 'agent-gamma-003',
                    name: 'Gamma MEV Protector',
                    type: 'MEV_SPECIALIST',
                    specialization: 'MEV_PROTECTION',
                    chain: 'ethereum'
                }
            ];
            
            for (const agent of agents) {
                await client.query(`
                    INSERT INTO syndicate_agents (
                        agent_id, agent_name, agent_type, specialization,
                        chain_assignment, orchestrator_id, is_active
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    ON CONFLICT (agent_id) DO NOTHING
                `, [
                    agent.id,
                    agent.name,
                    agent.type,
                    agent.specialization,
                    agent.chain,
                    'master-orchestrator',
                    true
                ]);
            }
            
            // Insert sample pool prices
            const pools = [
                {
                    address: '0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852',
                    chain: 'ethereum',
                    dex: 'uniswap_v2',
                    token0: 'WETH',
                    token1: 'USDT',
                    liquidity: 50000000
                },
                {
                    address: '0x397ff1542f962076d0bfe58ea045ffa2d347aca0',
                    chain: 'ethereum',
                    dex: 'sushiswap',
                    token0: 'WETH',
                    token1: 'USDC',
                    liquidity: 30000000
                }
            ];
            
            for (const pool of pools) {
                await client.query(`
                    INSERT INTO pool_prices (
                        pool_address, chain, dex, token0_symbol, token1_symbol,
                        price0, price1, liquidity_usd, last_update
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    ON CONFLICT (pool_address, chain) DO NOTHING
                `, [
                    pool.address,
                    pool.chain,
                    pool.dex,
                    pool.token0,
                    pool.token1,
                    2500.00, // ETH price
                    0.0004,  // 1/ETH price
                    pool.liquidity
                ]);
            }
            
            console.log('✅ Seed data loaded successfully');
    
  } catch (error) {
            console.error('❌ Error loading seed data:', error.message);
    throw error;
        } finally {
            client.release();
            await pool.end();
  }
}

/**
     * Verify database setup
     */
    async verifySetup() {
        console.log('\n🔍 Verifying database setup...');
        
        const pool = new pg.Pool({
            connectionString: `postgresql://${syndicateUser}:${syndicatePassword}@${dbConfig.host}:${dbConfig.port}/${syndicateDbName}`
        });
        
        const client = await pool.connect();
        
        try {
            // Check critical tables
            const tables = [
                'syndicate_agents',
                'arbitrage_opportunities',
                'arbitrage_executions',
                'agent_memory',
                'pool_prices',
                'world_model_predictions',
                // Memory system tables
                'kg_nodes',
                'kg_relationships',
                'kg_entanglements',
                'kg_qualifiers',
                'memory_system_state',
                'sedm_verifications'
            ];
            
            console.log('📊 Checking tables...');
            for (const table of tables) {
                const result = await client.query(`
                    SELECT COUNT(*) as count 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = $1
                `, [table]);
                
                if (result.rows[0].count > 0) {
                    // Get row count
                    const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
                    console.log(`   ✅ ${table} (${countResult.rows[0].count} rows)`);
                } else {
                    console.log(`   ❌ ${table} - MISSING`);
                }
            }
            
            // Check extensions
            console.log('\n📊 Checking extensions...');
            const extensions = ['uuid-ossp', 'pgcrypto', 'pg_trgm', 'btree_gin'];
            
            for (const ext of extensions) {
                const result = await client.query(`
                    SELECT COUNT(*) as count 
                    FROM pg_extension 
                    WHERE extname = $1
                `, [ext]);
                
                if (result.rows[0].count > 0) {
                    console.log(`   ✅ ${ext}`);
                } else {
                    console.log(`   ❌ ${ext} - MISSING`);
                }
            }
            
            // Test a complex query
            console.log('\n📊 Testing complex queries...');
            const testResult = await client.query(`
                SELECT 
                    COUNT(DISTINCT sa.agent_id) as agent_count,
                    COUNT(DISTINCT pp.pool_address) as pool_count
                FROM syndicate_agents sa
                CROSS JOIN pool_prices pp
                WHERE sa.is_active = true
            `);
            
            console.log(`   ✅ Complex query test passed`);
            console.log(`      Active agents: ${testResult.rows[0].agent_count}`);
            console.log(`      Pool prices: ${testResult.rows[0].pool_count}`);
            
            console.log('\n✅ Database verification complete!');
            
        } catch (error) {
            console.error('❌ Verification failed:', error.message);
            throw error;
        } finally {
            client.release();
            await pool.end();
        }
    }

    /**
     * Generate connection string
     */
    generateConnectionInfo() {
        const connectionString = `postgresql://${syndicateUser}:${syndicatePassword}@${dbConfig.host}:${dbConfig.port}/${syndicateDbName}`;
        
        console.log('\n🔗 Database Connection Information:');
        console.log('=====================================');
        console.log(`Database Name: ${syndicateDbName}`);
        console.log(`Username: ${syndicateUser}`);
        console.log(`Password: ${syndicatePassword}`);
        console.log(`Host: ${dbConfig.host}`);
        console.log(`Port: ${dbConfig.port}`);
        console.log('\n📋 Connection String:');
        console.log(connectionString);
        console.log('\n🔧 Add to your .env file:');
        console.log(`DATABASE_URL="${connectionString}"`);
        console.log('=====================================\n');
    }

    /**
     * Main initialization process
     */
    async initialize() {
        console.log('🚀 AI Flash Loan Arbitrage Syndicate - Database Initialization');
        console.log('=============================================================\n');
        
        try {
            // Step 1: Create database
            const created = await this.createDatabase();
            if (!created && !options.force) {
                console.log('\n⚠️  Skipping initialization. Database already exists.');
                return;
            }
            
            // Step 2: Run migrations
            await this.runMigrations();
            
            // Step 3: Load seed data (if requested)
            if (options.seed) {
                await this.loadSeedData();
            }
            
            // Step 4: Verify setup (if requested)
            if (options.verify) {
                await this.verifySetup();
            }
            
            // Step 5: Show connection info
            this.generateConnectionInfo();
            
            console.log('🎉 Database initialization completed successfully!');
            console.log('\n📚 Next steps:');
            console.log('   1. Copy the DATABASE_URL to your .env file');
            console.log('   2. Run the syndicate with: npm start');
            console.log('   3. Monitor database with: psql -d arbitrage_syndicate');
    
  } catch (error) {
            console.error('\n❌ Initialization failed:', error);
    process.exit(1);
        } finally {
            await this.adminPool.end();
        }
    }
}

// Run initialization
const initializer = new DatabaseInitializer();
initializer.initialize().catch(console.error);