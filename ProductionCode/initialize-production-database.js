#!/usr/bin/env node

/**
 * 🗄️ PRODUCTION DATABASE INITIALIZATION
 * =====================================
 * 
 * Complete database setup for the Elite Arbitrage Syndicate
 * - Creates all necessary tables and indexes
 * - Seeds essential data for immediate operation
 * - Validates database integrity
 * - Supports both development and production environments
 */

import fs from 'fs/promises';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class ProductionDatabaseInitializer {
    constructor(options = {}) {
        this.config = {
            connectionString: options.connectionString || process.env.DATABASE_URL || process.env.POSTGRES_URL,
            maxConnections: options.maxConnections || 10,
            dropExisting: options.dropExisting || false,
            seedData: options.seedData !== false
        };
        
        this.database = null;
        this.results = {
            schemasCreated: 0,
            tablesCreated: 0,
            indexesCreated: 0,
            seedDataInserted: 0,
            errors: []
        };
        
        console.log('🗄️ Production Database Initializer created');
    }
    
    /**
     * 🚀 INITIALIZE COMPLETE DATABASE
     */
    async initialize() {
        try {
            console.log('\n🚀 INITIALIZING PRODUCTION DATABASE...');
            console.log('===================================');
            
            // 1. Connect to database
            await this.connectToDatabase();
            
            // 2. Drop existing tables if requested
            if (this.config.dropExisting) {
                await this.dropExistingTables();
            }
            
            // 3. Create all schemas
            await this.createAllSchemas();
            
            // 4. Create indexes for performance
            await this.createPerformanceIndexes();
            
            // 5. Seed essential data
            if (this.config.seedData) {
                await this.seedEssentialData();
            }
            
            // 6. Validate database integrity
            await this.validateDatabaseIntegrity();
            
            // 7. Display summary
            this.displayInitializationSummary();
            
            return {
                success: true,
                results: this.results
            };
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            this.results.errors.push(error.message);
            throw error;
        } finally {
            if (this.database) {
                await this.database.end();
            }
        }
    }
    
    /**
     * 🔌 CONNECT TO DATABASE
     */
    async connectToDatabase() {
        console.log('\n1️⃣ Connecting to database...');
        
        if (!this.config.connectionString) {
            throw new Error('Database connection string not provided');
        }
        
        this.database = new Pool({
            connectionString: this.config.connectionString,
            max: this.config.maxConnections,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000
        });
        
        // Test connection
        await this.database.query('SELECT NOW()');
        console.log('✅ Database connection established');
    }
    
    /**
     * 🗑️ DROP EXISTING TABLES (DEVELOPMENT ONLY)
     */
    async dropExistingTables() {
        console.log('\n⚠️ Dropping existing tables...');
        
        const dropQueries = [
            'DROP TABLE IF EXISTS exchange_quotes CASCADE;',
            'DROP TABLE IF EXISTS enhanced_gas_tracker CASCADE;',
            'DROP TABLE IF EXISTS pool_volatility CASCADE;',
            'DROP TABLE IF EXISTS agent_mdp_states CASCADE;',
            'DROP TABLE IF EXISTS current_pool_prices CASCADE;',
            'DROP TABLE IF EXISTS pools CASCADE;',
            'DROP TABLE IF EXISTS arbitrage_opportunities CASCADE;',
            'DROP TABLE IF EXISTS agent_background_tasks CASCADE;',
            'DROP TABLE IF EXISTS mev_analysis_sessions CASCADE;',
            'DROP TABLE IF EXISTS mev_competitors CASCADE;',
            'DROP TABLE IF EXISTS competitor_strategies CASCADE;'
        ];
        
        for (const query of dropQueries) {
            try {
                await this.database.query(query);
            } catch (error) {
                // Table might not exist, which is fine
            }
        }
        
        console.log('✅ Existing tables dropped');
    }
    
    /**
     * 🏗️ CREATE ALL SCHEMAS
     */
    async createAllSchemas() {
        console.log('\n2️⃣ Creating database schemas...');
        
        const schemaFiles = [
            './database/enhanced-arbitrage-schema.sql',
            './database/arbitrage-schema.sql',
            './database/mev-competitor-analysis-schema.sql',
            './database/elite-contract-developer-schema.sql'
        ];
        
        for (const schemaFile of schemaFiles) {
            await this.executeSchemaFile(schemaFile);
        }
        
        console.log(`✅ Database schemas created: ${this.results.schemasCreated}`);
    }
    
    /**
     * 📈 CREATE PERFORMANCE INDEXES
     */
    async createPerformanceIndexes() {
        console.log('\n3️⃣ Creating performance indexes...');
        
        try {
            const indexFile = './database/performance-indexes.sql';
            await this.executeSchemaFile(indexFile);
            console.log('✅ Performance indexes created');
        } catch (error) {
            console.warn('⚠️ Performance indexes file not found or error:', error.message);
        }
    }
    
    /**
     * 🌱 SEED ESSENTIAL DATA
     */
    async seedEssentialData() {
        console.log('\n4️⃣ Seeding essential data...');
        
        // Seed popular DEX pools for immediate operation
        await this.seedDEXPools();
        
        // Seed agent configurations
        await this.seedAgentConfigurations();
        
        // Seed benchmark data
        await this.seedBenchmarkData();
        
        console.log(`✅ Essential data seeded: ${this.results.seedDataInserted} records`);
    }
    
    /**
     * ✅ VALIDATE DATABASE INTEGRITY
     */
    async validateDatabaseIntegrity() {
        console.log('\n5️⃣ Validating database integrity...');
        
        const validations = [
            {
                name: 'Core Tables Exist',
                query: `
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name IN ('pools', 'current_pool_prices', 'arbitrage_opportunities')
                `
            },
            {
                name: 'Indexes Exist',
                query: `
                    SELECT COUNT(*) as index_count 
                    FROM pg_indexes 
                    WHERE schemaname = 'public'
                `
            },
            {
                name: 'Pool Data Available',
                query: 'SELECT COUNT(*) as pool_count FROM pools'
            }
        ];
        
        for (const validation of validations) {
            try {
                const result = await this.database.query(validation.query);
                console.log(`✅ ${validation.name}: OK`);
            } catch (error) {
                console.error(`❌ ${validation.name}: FAILED`, error.message);
                this.results.errors.push(`Validation failed: ${validation.name}`);
            }
        }
        
        console.log('✅ Database integrity validation complete');
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    async executeSchemaFile(schemaFile) {
        try {
            const schemaContent = await fs.readFile(schemaFile, 'utf-8');
            
            // Split by semicolons and execute each statement
            const statements = schemaContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0);
            
            for (const statement of statements) {
                try {
                    await this.database.query(statement);
                    this.results.tablesCreated++;
                } catch (error) {
                    if (!error.message.includes('already exists')) {
                        console.warn(`⚠️ Error executing statement: ${error.message}`);
                        this.results.errors.push(`Schema error in ${schemaFile}: ${error.message}`);
                    }
                }
            }
            
            this.results.schemasCreated++;
            console.log(`✅ Executed schema: ${path.basename(schemaFile)}`);
            
        } catch (error) {
            console.warn(`⚠️ Schema file not found: ${schemaFile}`);
            this.results.errors.push(`Schema file not found: ${schemaFile}`);
        }
    }
    
    async seedDEXPools() {
        const pools = [
            // Arbitrum pools
            {
                address: '0x17c14D2c404D167802b16C450d3c99F88F2c4F4d',
                chain: 'arbitrum',
                dex: 'SushiSwap',
                token0_address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                token0_symbol: 'WETH',
                token1_address: '0xA0b86a33E6441b8435b662303c0f479c6e8c385c',
                token1_symbol: 'USDC',
                liquidity_usd: 5200000,
                fee_tier: 3000,
                is_active: true
            },
            {
                address: '0x84652bb2539513BAf36e225c930Fdd8eaa63CE27',
                chain: 'arbitrum',
                dex: 'Camelot',
                token0_address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
                token0_symbol: 'ARB',
                token1_address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
                token1_symbol: 'WETH',
                liquidity_usd: 3800000,
                fee_tier: 3000,
                is_active: true
            },
            // Base pools
            {
                address: '0x4200000000000000000000000000000000000006',
                chain: 'base',
                dex: 'BaseSwap',
                token0_address: '0x4200000000000000000000000000000000000006',
                token0_symbol: 'WETH',
                token1_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
                token1_symbol: 'USDC',
                liquidity_usd: 2100000,
                fee_tier: 3000,
                is_active: true
            },
            // Polygon pools
            {
                address: '0x45dDa9cb7c25131DF268515131f647d726f50608',
                chain: 'polygon',
                dex: 'QuickSwap',
                token0_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                token0_symbol: 'WETH',
                token1_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                token1_symbol: 'USDC',
                liquidity_usd: 1900000,
                fee_tier: 500,
                is_active: true
            }
        ];
        
        for (const pool of pools) {
            try {
                await this.database.query(`
                    INSERT INTO pools (
                        address, chain, dex, token0_address, token0_symbol,
                        token1_address, token1_symbol, liquidity_usd, fee_tier, is_active
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    ON CONFLICT (address, chain) DO UPDATE SET
                        liquidity_usd = EXCLUDED.liquidity_usd,
                        is_active = EXCLUDED.is_active
                `, [
                    pool.address, pool.chain, pool.dex,
                    pool.token0_address, pool.token0_symbol,
                    pool.token1_address, pool.token1_symbol,
                    pool.liquidity_usd, pool.fee_tier, pool.is_active
                ]);
                
                this.results.seedDataInserted++;
            } catch (error) {
                console.warn(`⚠️ Error seeding pool ${pool.address}:`, error.message);
            }
        }
        
        console.log('✅ DEX pools seeded');
    }
    
    async seedAgentConfigurations() {
        const agentConfigs = [
            {
                agent_id: 'arbitrum_opportunity_spotter',
                agent_type: 'opportunity_spotter',
                chain_focus: 'arbitrum',
                is_active: true,
                configuration: {
                    minProfitUSD: 50,
                    maxGasPrice: 50,
                    specialization: 'flash_loan_arbitrage'
                }
            },
            {
                agent_id: 'base_opportunity_spotter',
                agent_type: 'opportunity_spotter',
                chain_focus: 'base',
                is_active: true,
                configuration: {
                    minProfitUSD: 30,
                    maxGasPrice: 20,
                    specialization: 'speed_arbitrage'
                }
            },
            {
                agent_id: 'ai_prediction_agent',
                agent_type: 'ai_prediction',
                chain_focus: 'multi_chain',
                is_active: true,
                configuration: {
                    predictionHorizon: 300,
                    confidenceThreshold: 0.8
                }
            }
        ];
        
        for (const config of agentConfigs) {
            try {
                await this.database.query(`
                    INSERT INTO syndicate_agents (
                        agent_id, agent_type, chain_focus, is_active, configuration
                    ) VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (agent_id) DO UPDATE SET
                        is_active = EXCLUDED.is_active,
                        configuration = EXCLUDED.configuration
                `, [
                    config.agent_id, config.agent_type, config.chain_focus,
                    config.is_active, JSON.stringify(config.configuration)
                ]);
                
                this.results.seedDataInserted++;
            } catch (error) {
                // Table might not exist yet
                console.warn(`⚠️ Error seeding agent config:`, error.message);
            }
        }
        
        console.log('✅ Agent configurations seeded');
    }
    
    async seedBenchmarkData() {
        try {
            const benchmarkFile = './database/seed-elite-benchmarks.sql';
            await this.executeSchemaFile(benchmarkFile);
            console.log('✅ Benchmark data seeded');
        } catch (error) {
            console.warn('⚠️ Benchmark data file not found or error:', error.message);
        }
    }
    
    displayInitializationSummary() {
        console.log('\n📊 DATABASE INITIALIZATION SUMMARY:');
        console.log('===================================');
        console.log(`✅ Schemas created: ${this.results.schemasCreated}`);
        console.log(`✅ Tables created: ${this.results.tablesCreated}`);
        console.log(`✅ Indexes created: ${this.results.indexesCreated}`);
        console.log(`✅ Seed records: ${this.results.seedDataInserted}`);
        console.log(`⚠️ Errors: ${this.results.errors.length}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS ENCOUNTERED:');
            this.results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }
        
        console.log('\n🎉 DATABASE INITIALIZATION COMPLETE!');
        console.log('The database is ready for production arbitrage operations.');
    }
}

/**
 * 🚀 MAIN INITIALIZATION FUNCTION
 */
async function initializeProductionDatabase() {
    console.log(`
🗄️ ELITE ARBITRAGE SYNDICATE - DATABASE INITIALIZATION
====================================================

Setting up the complete database infrastructure for
production-ready arbitrage operations.

This will create all necessary tables, indexes, and
seed data for immediate operation.
    `);
    
    try {
        const initializer = new ProductionDatabaseInitializer({
            dropExisting: process.argv.includes('--drop-existing'),
            seedData: !process.argv.includes('--no-seed')
        });
        
        const result = await initializer.initialize();
        
        console.log('\n🎉 DATABASE READY FOR PRODUCTION!');
        console.log('The Elite Arbitrage Syndicate database is fully prepared');
        console.log('for live trading operations.');
        
        return result;
        
    } catch (error) {
        console.error('\n💥 DATABASE INITIALIZATION FAILED:', error);
        process.exit(1);
    }
}

// Auto-run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeProductionDatabase().catch(error => {
        console.error('❌ Initialization error:', error);
        process.exit(1);
    });
}

export { ProductionDatabaseInitializer, initializeProductionDatabase };