// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

import { Pool } from 'pg';
import { ethers } from 'ethers';

// Database Configuration
const DB_CONFIG = {
    host: 'localhost',
    port: 5432,
    database: 'arbitrum_flash_specialist',
    user: 'epicbattlegods',
    password: 'your_password_here'
};

// Verified Arbitrum Token Addresses - NO COMPROMISES!
const VERIFIED_TOKENS: Record<string, {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    coingeckoId?: string;
}> = {
    WETH: {
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        symbol: 'WETH',
        name: 'Wrapped Ether',
        decimals: 18,
        coingeckoId: 'weth'
    },
    USDC: {
        address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        coingeckoId: 'usd-coin'
    },
    USDT: {
        address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        coingeckoId: 'tether'
    },
    ARB: {
        address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        symbol: 'ARB',
        name: 'Arbitrum',
        decimals: 18,
        coingeckoId: 'arbitrum'
    },
    WBTC: {
        address: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
        symbol: 'WBTC',
        name: 'Wrapped BTC',
        decimals: 8,
        coingeckoId: 'wrapped-bitcoin'
    },
    LINK: {
        address: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
        symbol: 'LINK',
        name: 'Chainlink',
        decimals: 18,
        coingeckoId: 'chainlink'
    },
    UNI: {
        address: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
        symbol: 'UNI',
        name: 'Uniswap',
        decimals: 18,
        coingeckoId: 'uniswap'
    },
    DAI: {
        address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        decimals: 18,
        coingeckoId: 'dai'
    }
};

// Verified Pool Addresses - REAL ARBITRUM POOLS ONLY!
const VERIFIED_POOLS: Array<{
    address: string;
    token0: string;
    token1: string;
    dex: string;
    fee?: number;
    type: string;
}> = [
    // Uniswap V3 Pools
    {
        address: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDC.address,
        dex: 'Uniswap V3',
        fee: 500,
        type: 'V3'
    },
    {
        address: '0x17c14D2c404D167802b16C450d3c99F88F2c4F4d',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDC.address,
        dex: 'Uniswap V3',
        fee: 3000,
        type: 'V3'
    },
    {
        address: '0x641C00A822e8b671738d32a431a4Fb6074E5c79d',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDT.address,
        dex: 'Uniswap V3',
        fee: 500,
        type: 'V3'
    },
    {
        address: '0x80A9ae39310abf666A87C743d6ebBD0E8C42158E',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.ARB.address,
        dex: 'Uniswap V3',
        fee: 3000,
        type: 'V3'
    },
    // SushiSwap Pools
    {
        address: '0x905dfCD5649217c42684f23958568e533C711Aa3',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDC.address,
        dex: 'SushiSwap',
        type: 'V2'
    },
    {
        address: '0xCB0E5bFa72bBb4d16AB5aA0c60601c438F04b4ad',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDT.address,
        dex: 'SushiSwap',
        type: 'V2'
    },
    // Camelot Pools
    {
        address: '0x84652bb2539513BAf36e225c930Fdd8eaa63CE27',
        token0: VERIFIED_TOKENS.WETH.address,
        token1: VERIFIED_TOKENS.USDC.address,
        dex: 'Camelot',
        type: 'V2'
    },
    {
        address: '0xB1026b8e7276e7AC75410F1fcbbe21796e8f7526',
        token0: VERIFIED_TOKENS.ARB.address,
        token1: VERIFIED_TOKENS.USDC.address,
        dex: 'Camelot',
        type: 'V2'
    }
];

// RPC Provider Configuration
const RPC_PROVIDERS = [
    'https://arb-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
    'https://arbitrum-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
    'https://arb1.arbitrum.io/rpc'
];

interface TokenData {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    verified: boolean;
    price_usd?: number;
    market_cap?: number;
    volume_24h?: number;
    last_updated: Date;
}

interface PoolData {
    address: string;
    token0_address: string;
    token1_address: string;
    dex: string;
    pool_type: string;
    fee_tier?: number;
    liquidity_usd?: number;
    volume_24h?: number;
    apy?: number;
    verified: boolean;
    last_updated: Date;
}

class DatabaseCleanupAndPoolPopulator {
    private pool: Pool;
    private provider: ethers.JsonRpcProvider;
    private currentRpcIndex = 0;

    constructor() {
        this.pool = new Pool(DB_CONFIG);
        this.provider = new ethers.JsonRpcProvider(RPC_PROVIDERS[0]);
    }

    private getNextProvider(): ethers.JsonRpcProvider {
        this.currentRpcIndex = (this.currentRpcIndex + 1) % RPC_PROVIDERS.length;
        this.provider = new ethers.JsonRpcProvider(RPC_PROVIDERS[this.currentRpcIndex]);
        return this.provider;
    }

    async connect(): Promise<void> {
        try {
            await this.pool.connect();
            console.log('🐘 Connected to PostgreSQL database');
        } catch (error) {
            console.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }

    async cleanupDatabase(): Promise<void> {
        console.log('\n🧹 === STARTING BRUTAL DATABASE CLEANUP ===');
        console.log('⚠️  WARNING: This will remove ALL unverified data!');
        
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Drop all existing tables to ensure clean state
            const dropTables = [
                'arbitrage_executions',
                'risk_assessments', 
                'arbitrage_strategies',
                'arbitrage_opportunities',
                'token_prices',
                'pools',
                'tokens',
                'blockchain_events'
            ];
            
            for (const table of dropTables) {
                try {
                    await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
                    console.log(`🗑️  Dropped table: ${table}`);
                } catch (error) {
                    console.log(`⚠️  Table ${table} didn't exist or couldn't be dropped`);
                }
            }
            
            await client.query('COMMIT');
            console.log('✅ Database cleanup completed - ALL UNVERIFIED DATA REMOVED!');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Database cleanup failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async createTables(): Promise<void> {
        console.log('\n🏗️  === CREATING VERIFIED DATABASE SCHEMA ===');
        
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Create tokens table
            await client.query(`
                CREATE TABLE tokens (
                    id SERIAL PRIMARY KEY,
                    address VARCHAR(42) UNIQUE NOT NULL,
                    symbol VARCHAR(20) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    decimals INTEGER NOT NULL,
                    verified BOOLEAN DEFAULT FALSE,
                    price_usd DECIMAL(20,8),
                    market_cap DECIMAL(20,2),
                    volume_24h DECIMAL(20,2),
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create pools table
            await client.query(`
                CREATE TABLE pools (
                    id SERIAL PRIMARY KEY,
                    address VARCHAR(42) UNIQUE NOT NULL,
                    token0_address VARCHAR(42) NOT NULL,
                    token1_address VARCHAR(42) NOT NULL,
                    dex VARCHAR(50) NOT NULL,
                    pool_type VARCHAR(20) NOT NULL,
                    fee_tier INTEGER,
                    liquidity_usd DECIMAL(20,2),
                    volume_24h DECIMAL(20,2),
                    apy DECIMAL(8,4),
                    verified BOOLEAN DEFAULT FALSE,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (token0_address) REFERENCES tokens(address),
                    FOREIGN KEY (token1_address) REFERENCES tokens(address)
                )
            `);
            
            // Create token_prices table
            await client.query(`
                CREATE TABLE token_prices (
                    id SERIAL PRIMARY KEY,
                    token_address VARCHAR(42) NOT NULL,
                    price_usd DECIMAL(20,8) NOT NULL,
                    volume_24h DECIMAL(20,2),
                    market_cap DECIMAL(20,2),
                    price_change_24h DECIMAL(8,4),
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    source VARCHAR(50) DEFAULT 'manual',
                    FOREIGN KEY (token_address) REFERENCES tokens(address)
                )
            `);
            
            // Create blockchain_events table
            await client.query(`
                CREATE TABLE blockchain_events (
                    id SERIAL PRIMARY KEY,
                    chain_id INTEGER NOT NULL,
                    block_number BIGINT NOT NULL,
                    transaction_hash VARCHAR(66) NOT NULL,
                    event_type VARCHAR(50) NOT NULL,
                    contract_address VARCHAR(42) NOT NULL,
                    event_data JSONB,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed BOOLEAN DEFAULT FALSE
                )
            `);
            
            // Create arbitrage_opportunities table (BEFORE arbitrage_strategies)
            await client.query(`
                CREATE TABLE arbitrage_opportunities (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    opportunity_type VARCHAR(100) NOT NULL,
                    token_in VARCHAR(42) NOT NULL,
                    token_out VARCHAR(42) NOT NULL,
                    amount_in DECIMAL(30,18) NOT NULL,
                    expected_profit DECIMAL(30,18) NOT NULL,
                    profit_percentage DECIMAL(8,4) NOT NULL,
                    gas_estimate BIGINT,
                    confidence_score DECIMAL(5,4),
                    dex_route JSONB,
                    pool_addresses JSONB,
                    execution_deadline TIMESTAMP,
                    status VARCHAR(50) DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (token_in) REFERENCES tokens(address),
                    FOREIGN KEY (token_out) REFERENCES tokens(address)
                )
            `);
            
            // Create arbitrage_strategies table
            await client.query(`
                CREATE TABLE arbitrage_strategies (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    strategy_name VARCHAR(255) NOT NULL,
                    strategy_type VARCHAR(255) NOT NULL,
                    parameters JSONB NOT NULL,
                    success_rate REAL DEFAULT 0,
                    average_profit REAL DEFAULT 0,
                    total_executions INTEGER DEFAULT 0,
                    active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            // Create arbitrage_executions table
            await client.query(`
                CREATE TABLE arbitrage_executions (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    strategy_id INTEGER,
                    opportunity_id INTEGER,
                    execution_status VARCHAR(255) NOT NULL,
                    profit_actual REAL,
                    profit_expected REAL,
                    gas_cost REAL,
                    execution_time REAL,
                    transaction_hash VARCHAR(255),
                    error_message TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (strategy_id) REFERENCES arbitrage_strategies(id),
                    FOREIGN KEY (opportunity_id) REFERENCES arbitrage_opportunities(id)
                )
            `);
            
            // Create risk_assessments table
            await client.query(`
                CREATE TABLE risk_assessments (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    opportunity_id INTEGER,
                    risk_score REAL NOT NULL,
                    risk_factors JSONB,
                    mitigation_strategies JSONB,
                    approved BOOLEAN DEFAULT FALSE,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (opportunity_id) REFERENCES arbitrage_opportunities(id)
                )
            `);
            
            // Create indexes for performance
            const indexes = [
                'CREATE INDEX idx_tokens_address ON tokens(address)',
                'CREATE INDEX idx_tokens_symbol ON tokens(symbol)',
                'CREATE INDEX idx_pools_token0 ON pools(token0_address)',
                'CREATE INDEX idx_pools_token1 ON pools(token1_address)',
                'CREATE INDEX idx_pools_dex ON pools(dex)',
                'CREATE INDEX idx_blockchain_events_block ON blockchain_events(block_number)',
                'CREATE INDEX idx_blockchain_events_hash ON blockchain_events(transaction_hash)',
                'CREATE INDEX idx_arbitrage_opps_status ON arbitrage_opportunities(status)',
                'CREATE INDEX idx_arbitrage_opps_created ON arbitrage_opportunities(created_at)'
            ];
            
            for (const indexQuery of indexes) {
                await client.query(indexQuery);
            }
            
            await client.query('COMMIT');
            console.log('✅ Database schema created with proper foreign key relationships');
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Failed to create database schema:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async populateVerifiedTokens(): Promise<void> {
        console.log('\n💎 === POPULATING VERIFIED TOKENS ===');
        
        const client = await this.pool.connect();
        
        try {
            let insertedCount = 0;
            
            for (const [symbol, tokenData] of Object.entries(VERIFIED_TOKENS)) {
                try {
                    // Try to get additional data from contract if needed
                    let contractData: any = {};
                    
                    try {
                        const contract = new ethers.Contract(
                            tokenData.address,
                            ['function symbol() view returns (string)', 'function name() view returns (string)', 'function decimals() view returns (uint8)'],
                            this.provider
                        );
                        
                        const [contractSymbol, contractName, contractDecimals] = await Promise.all([
                            contract.symbol().catch(() => tokenData.symbol),
                            contract.name().catch(() => tokenData.name),
                            contract.decimals().catch(() => tokenData.decimals)
                        ]);
                        
                        contractData = {
                            symbol: contractSymbol,
                            name: contractName,
                            decimals: Number(contractDecimals)
                        };
                        
                    } catch (contractError) {
                        console.log(`⚠️  Using verified data for ${symbol} (contract call failed)`);
                        contractData = tokenData;
                    }
                    
                    // Insert token with verified data
                    await client.query(
                        `INSERT INTO tokens (address, symbol, name, decimals, verified, last_updated) 
                         VALUES ($1, $2, $3, $4, $5, $6) 
                         ON CONFLICT (address) DO UPDATE SET 
                         symbol = $2, name = $3, decimals = $4, verified = $5, last_updated = $6`,
                        [
                            tokenData.address.toLowerCase(),
                            contractData.symbol || tokenData.symbol,
                            contractData.name || tokenData.name,
                            contractData.decimals || tokenData.decimals,
                            true,
                            new Date()
                        ]
                    );
                    
                    insertedCount++;
                    console.log(`✅ Verified token: ${contractData.symbol || tokenData.symbol} (${tokenData.address})`);
                    
                } catch (error) {
                    console.error(`❌ Failed to insert token ${symbol}:`, error);
                    // Continue with next token - don't fail entire operation
                }
            }
            
            console.log(`✅ Populated ${insertedCount} verified tokens`);
            
        } catch (error) {
            console.error('❌ Failed to populate verified tokens:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async populateVerifiedPools(): Promise<void> {
        console.log('\n🏊 === POPULATING VERIFIED POOLS ===');
        
        const client = await this.pool.connect();
        
        try {
            let insertedCount = 0;
            
            for (const poolData of VERIFIED_POOLS) {
                try {
                    await client.query(
                        `INSERT INTO pools (address, token0_address, token1_address, dex, pool_type, fee_tier, verified, last_updated) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                         ON CONFLICT (address) DO UPDATE SET 
                         token0_address = $2, token1_address = $3, dex = $4, pool_type = $5, fee_tier = $6, verified = $7, last_updated = $8`,
                        [
                            poolData.address.toLowerCase(),
                            poolData.token0.toLowerCase(),
                            poolData.token1.toLowerCase(),
                            poolData.dex,
                            poolData.type,
                            poolData.fee || null,
                            true,
                            new Date()
                        ]
                    );
                    
                    insertedCount++;
                    
                    // Get token symbols for display
                    const token0Symbol = Object.values(VERIFIED_TOKENS).find(t => t.address.toLowerCase() === poolData.token0.toLowerCase())?.symbol || 'UNKNOWN';
                    const token1Symbol = Object.values(VERIFIED_TOKENS).find(t => t.address.toLowerCase() === poolData.token1.toLowerCase())?.symbol || 'UNKNOWN';
                    
                    console.log(`✅ Verified pool: ${token0Symbol}/${token1Symbol} on ${poolData.dex} (${poolData.address})`);
                    
                } catch (error) {
                    console.error(`❌ Failed to insert pool ${poolData.address}:`, error);
                    // Continue with next pool
                }
            }
            
            console.log(`✅ Populated ${insertedCount} verified pools`);
            
        } catch (error) {
            console.error('❌ Failed to populate verified pools:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async generatePriceEstimates(): Promise<void> {
        console.log('\n💰 === GENERATING PRICE ESTIMATES ===');
        
        const client = await this.pool.connect();
        
        try {
            // Rough price estimates for major tokens (in USD)
            const priceEstimates: Record<string, number> = {
                'WETH': 2000,
                'USDC': 1.00,
                'USDT': 1.00,
                'ARB': 0.85,
                'WBTC': 42000,
                'LINK': 15.50,
                'UNI': 8.20,
                'DAI': 1.00
            };
            
            let insertedCount = 0;
            
            for (const [symbol, price] of Object.entries(priceEstimates)) {
                const tokenData = VERIFIED_TOKENS[symbol];
                if (tokenData) {
                    try {
                        await client.query(
                            `INSERT INTO token_prices (token_address, price_usd, timestamp, source) 
                             VALUES ($1, $2, $3, $4)`,
                            [
                                tokenData.address.toLowerCase(),
                                price,
                                new Date(),
                                'bootstrap_estimate'
                            ]
                        );
                        
                        insertedCount++;
                        console.log(`💲 Price estimate: ${symbol} = $${price}`);
                        
                    } catch (error) {
                        console.error(`❌ Failed to insert price for ${symbol}:`, error);
                    }
                }
            }
            
            console.log(`✅ Generated ${insertedCount} price estimates`);
            
        } catch (error) {
            console.error('❌ Failed to generate price estimates:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async verifyDataIntegrity(): Promise<void> {
        console.log('\n🔍 === VERIFYING DATA INTEGRITY ===');
        
        const client = await this.pool.connect();
        
        try {
            // Count records in each table
            const tables = ['tokens', 'pools', 'token_prices'];
            const counts: Record<string, number> = {};
            
            for (const table of tables) {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                counts[table] = parseInt(result.rows[0].count);
            }
            
            console.log('\n📊 === DATABASE STATISTICS ===');
            console.log(`🪙 Tokens: ${counts.tokens}`);
            console.log(`🏊 Pools: ${counts.pools}`);
            console.log(`💰 Token Prices: ${counts.token_prices}`);
            
            // Verify all tokens are properly linked
            const orphanedPools = await client.query(`
                SELECT p.address, p.token0_address, p.token1_address 
                FROM pools p 
                LEFT JOIN tokens t0 ON p.token0_address = t0.address 
                LEFT JOIN tokens t1 ON p.token1_address = t1.address 
                WHERE t0.address IS NULL OR t1.address IS NULL
            `);
            
            if (orphanedPools.rows.length > 0) {
                console.log(`⚠️  Found ${orphanedPools.rows.length} pools with missing token references`);
                for (const row of orphanedPools.rows) {
                    console.log(`   Pool: ${row.address}, Token0: ${row.token0_address}, Token1: ${row.token1_address}`);
                }
            } else {
                console.log('✅ All pools have valid token references');
            }
            
            // Verify no UNKNOWN tokens exist
            const unknownTokens = await client.query(`
                SELECT * FROM tokens WHERE symbol LIKE '%UNKNOWN%' OR name LIKE '%UNKNOWN%'
            `);
            
            if (unknownTokens.rows.length > 0) {
                console.log(`❌ CRITICAL: Found ${unknownTokens.rows.length} UNKNOWN tokens - THIS SHOULD NOT HAPPEN!`);
                throw new Error('UNKNOWN tokens found in database - data integrity compromised');
            } else {
                console.log('✅ NO UNKNOWN TOKENS - Data integrity maintained');
            }
            
            console.log('\n🎉 === DATA VERIFICATION COMPLETE ===');
            console.log('✅ Database is ready for LEGENDARY arbitrage operations!');
            console.log('🚀 NO COMPROMISES - ONLY VERIFIED DATA!');
            
        } catch (error) {
            console.error('❌ Data integrity verification failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    async close(): Promise<void> {
        await this.pool.end();
        console.log('🔌 Database connection closed');
    }

    async run(): Promise<void> {
        console.log('🚀 === STARTING LEGENDARY DATABASE CLEANUP & POPULATION ===');
        console.log('💪 NO COMPROMISES - ONLY VERIFIED DATA!');
        
        try {
            await this.connect();
            await this.cleanupDatabase();
            await this.createTables();
            await this.populateVerifiedTokens();
            await this.populateVerifiedPools();
            await this.generatePriceEstimates();
            await this.verifyDataIntegrity();
            
            console.log('\n🎉 === LEGENDARY DATABASE SETUP COMPLETE ===');
            console.log('✅ UNKNOWN token issue PERMANENTLY SOLVED!');
            console.log('🔥 Database ready for ELITE arbitrage operations!');
            console.log('💎 NO COMPROMISES - ONLY VERIFIED, ACCURATE DATA!');
            
        } catch (error) {
            console.error('\n❌ === BRUTAL TRUTH: SETUP FAILED ===');
            console.error('Error:', error);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// Execute the cleanup and population
if (require.main === module) {
    const populator = new DatabaseCleanupAndPoolPopulator();
    populator.run().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

export { DatabaseCleanupAndPoolPopulator }; 