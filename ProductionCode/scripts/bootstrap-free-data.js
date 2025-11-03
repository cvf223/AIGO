// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * Bootstrap Free Data Collection
 * 
 * Phase 1: Collect essential pool data from free sources
 * - Top tokens from CoinGecko (free tier)
 * - Factory contracts for major DEXs
 * - Pool data from subgraphs
 * - Smart rate limiting and caching
 */

import { ethers } from 'ethers';
import axios from 'axios';
import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FreeDataBootstrap {
    constructor() {
        // PostgreSQL connection
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/arbitrage_db',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        // Free RPC endpoints with rotation
        this.rpcEndpoints = {
            ethereum: [
                'https://eth.llamarpc.com',
                'https://rpc.ankr.com/eth',
                'https://ethereum.publicnode.com'
            ],
            arbitrum: [
                'https://arb1.arbitrum.io/rpc',
                'https://rpc.ankr.com/arbitrum',
                'https://arbitrum.llamarpc.com'
            ],
            base: [
                'https://mainnet.base.org',
                'https://base.llamarpc.com',
                'https://base.meowrpc.com'
            ],
            polygon: [
                'https://polygon-rpc.com',
                'https://rpc.ankr.com/polygon',
                'https://polygon-rpc.com'
            ]
        };

        // Rate limiters
        this.rateLimiters = new Map();
        this.initializeRateLimiters();

        // Providers
        this.providers = new Map();
        this.currentRpcIndex = new Map();

        // Cache
        this.tokenCache = new Map();
        this.poolCache = new Map();

        this.stats = {
            tokensCollected: 0,
            poolsCollected: 0,
            chainsProcessed: 0,
            errorsEncountered: 0,
            startTime: Date.now()
        };
    }

    initializeRateLimiters() {
        this.rateLimiters.set('coingecko', {
            requests: [],
            limit: 50,
            window: 60000 // 1 minute
        });

        this.rateLimiters.set('subgraph', {
            requests: [],
            limit: 1000,
            window: 3600000 // 1 hour
        });

        this.rateLimiters.set('rpc', {
            requests: [],
            limit: 120,
            window: 60000 // 1 minute per endpoint
        });
    }

    async checkRateLimit(service) {
        const limiter = this.rateLimiters.get(service);
        if (!limiter) return true;

        const now = Date.now();
        limiter.requests = limiter.requests.filter(time => now - time < limiter.window);

        if (limiter.requests.length >= limiter.limit) {
            const oldestRequest = Math.min(...limiter.requests);
            const waitTime = limiter.window - (now - oldestRequest);
            console.log(`⏳ Rate limit hit for ${service}, waiting ${Math.ceil(waitTime/1000)}s`);
            await this.sleep(waitTime);
            return this.checkRateLimit(service);
        }

        limiter.requests.push(now);
        return true;
    }

    async initializeDatabase() {
        try {
            // Test connection
            await this.db.query('SELECT NOW()');
            console.log('🗄️ Connected to PostgreSQL database');
            
            await this.createTables();
            console.log('🗄️ Database tables initialized');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            console.log('💡 Make sure PostgreSQL is running and DATABASE_URL is set correctly');
            console.log('💡 Example: DATABASE_URL=postgresql://username:password@localhost:5432/arbitrage_db');
            throw error;
        }
    }

    async createTables() {
        // Tokens table
        await this.db.query(`
            CREATE TABLE IF NOT EXISTS tokens (
                address TEXT PRIMARY KEY,
                symbol TEXT NOT NULL,
                name TEXT,
                decimals INTEGER NOT NULL,
                chain TEXT NOT NULL,
                chain_id INTEGER NOT NULL,
                market_cap DECIMAL,
                price_usd DECIMAL,
                logo_url TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        // Pools table (enhanced)
        await this.db.query(`
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
                fee INTEGER NOT NULL,
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
                created_at TIMESTAMP DEFAULT NOW(),
                FOREIGN KEY (token0_address) REFERENCES tokens (address),
                FOREIGN KEY (token1_address) REFERENCES tokens (address)
            )
        `);

        // Create indexes for performance
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_tokens_chain ON tokens (chain)',
            'CREATE INDEX IF NOT EXISTS idx_tokens_symbol ON tokens (symbol)',
            'CREATE INDEX IF NOT EXISTS idx_tokens_market_cap ON tokens (market_cap DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_chain ON pools (chain)',
            'CREATE INDEX IF NOT EXISTS idx_pools_dex ON pools (dex)',
            'CREATE INDEX IF NOT EXISTS idx_pools_liquidity ON pools (liquidity_usd DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_volume ON pools (volume_24h DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_quality ON pools (data_quality_score DESC)',
            'CREATE INDEX IF NOT EXISTS idx_pools_token_pair ON pools (token0_symbol, token1_symbol)',
            'CREATE INDEX IF NOT EXISTS idx_pools_active ON pools (is_active, liquidity_usd DESC)'
        ];

        for (const index of indexes) {
            try {
                await this.db.query(index);
            } catch (error) {
                // Index might already exist, continue
            }
        }
    }

    async getProvider(chain) {
        if (!this.providers.has(chain)) {
            const endpoints = this.rpcEndpoints[chain];
            if (!endpoints) return null;

            // Try each endpoint until one works
            for (let i = 0; i < endpoints.length; i++) {
                try {
                    const provider = new ethers.JsonRpcProvider(endpoints[i]);
                    await provider.getBlockNumber(); // Test connection
                    this.providers.set(chain, provider);
                    this.currentRpcIndex.set(chain, i);
                    console.log(`🌐 Connected to ${chain} via ${endpoints[i]}`);
                    return provider;
                } catch (error) {
                    console.warn(`⚠️ Failed to connect to ${endpoints[i]}: ${error.message}`);
                }
            }
            
            console.error(`❌ Failed to connect to any ${chain} RPC endpoint`);
            return null;
        }
        
        return this.providers.get(chain);
    }

    async bootstrap() {
        console.log('🚀 Starting Free Data Bootstrap...\n');

        try {
            await this.initializeDatabase();

            // Phase 1: Collect top tokens
            console.log('💰 Phase 1: Collecting top tokens...');
            await this.collectTopTokens();

            // Phase 2: Collect pool data from subgraphs
            console.log('🏊 Phase 2: Collecting pool data...');
            await this.collectPoolData();

            // Phase 3: Enhance with on-chain data
            console.log('⛓️ Phase 3: Enhancing with on-chain data...');
            await this.enhanceWithOnChainData();

            // Phase 4: Data quality scoring
            console.log('🎯 Phase 4: Calculating data quality scores...');
            await this.calculateQualityScores();

            await this.printSummary();
            console.log('🎉 Bootstrap completed successfully!');

        } catch (error) {
            console.error('❌ Bootstrap failed:', error);
            throw error;
        } finally {
            await this.db.end();
        }
    }

    async collectTopTokens() {
        await this.checkRateLimit('coingecko');

        try {
            const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
                params: {
                    vs_currency: 'usd',
                    order: 'market_cap_desc',
                    per_page: 250, // Free tier limit
                    page: 1,
                    sparkline: false
                },
                timeout: 10000
            });

            const tokens = response.data;
            console.log(`📥 Fetched ${tokens.length} tokens from CoinGecko`);

            // Process tokens in batches
            const batchSize = 50;
            for (let i = 0; i < tokens.length; i += batchSize) {
                const batch = tokens.slice(i, i + batchSize);
                await this.processTokenBatch(batch);
            }

            this.stats.tokensCollected = tokens.length;

        } catch (error) {
            console.error('❌ Error collecting tokens:', error.message);
            this.stats.errorsEncountered++;
        }
    }

    async processTokenBatch(tokens) {
        const promises = tokens.map(async (token) => {
            try {
                // Extract contract addresses for different chains
                const platforms = token.platforms || {};
                
                for (const [platform, address] of Object.entries(platforms)) {
                    if (!address) continue;
                    
                    const chain = this.mapPlatformToChain(platform);
                    if (!chain) continue;

                    const chainId = this.getChainId(chain);

                    await this.db.query(`
                        INSERT INTO tokens (
                            address, symbol, name, decimals, chain, chain_id,
                            market_cap, price_usd, logo_url
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                        ON CONFLICT (address) DO UPDATE SET
                            symbol = EXCLUDED.symbol,
                            name = EXCLUDED.name,
                            market_cap = EXCLUDED.market_cap,
                            price_usd = EXCLUDED.price_usd,
                            logo_url = EXCLUDED.logo_url
                    `, [
                        address.toLowerCase(),
                        token.symbol.toUpperCase(),
                        token.name,
                        18, // Will be updated with on-chain data
                        chain,
                        chainId,
                        token.market_cap,
                        token.current_price,
                        token.image
                    ]);
                }
            } catch (error) {
                console.error(`❌ Error processing token ${token.symbol}:`, error.message);
            }
        });

        await Promise.all(promises);
    }

    mapPlatformToChain(platform) {
        const mapping = {
            'ethereum': 'ethereum',
            'arbitrum-one': 'arbitrum',
            'polygon-pos': 'polygon',
            'base': 'base',
            'optimistic-ethereum': 'optimism'
        };
        return mapping[platform];
    }

    getChainId(chain) {
        const chainIds = {
            ethereum: 1,
            arbitrum: 42161,
            polygon: 137,
            base: 8453,
            optimism: 10
        };
        return chainIds[chain];
    }

    async collectPoolData() {
        const subgraphs = [
            {
                name: 'uniswap-v3-arbitrum',
                url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum',
                chain: 'arbitrum',
                dex: 'uniswap-v3'
            },
            {
                name: 'uniswap-v3-base',
                url: 'https://api.thegraph.com/subgraphs/name/messari/uniswap-v3-base',
                chain: 'base',
                dex: 'uniswap-v3'
            },
            {
                name: 'uniswap-v3-polygon',
                url: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-polygon',
                chain: 'polygon',
                dex: 'uniswap-v3'
            },
            {
                name: 'sushiswap-arbitrum',
                url: 'https://api.thegraph.com/subgraphs/name/sushi-v2/sushiswap-arbitrum',
                chain: 'arbitrum',
                dex: 'sushiswap'
            }
        ];

        for (const subgraph of subgraphs) {
            try {
                console.log(`📊 Collecting from ${subgraph.name}...`);
                await this.collectFromSubgraph(subgraph);
                this.stats.chainsProcessed++;
            } catch (error) {
                console.error(`❌ Error with ${subgraph.name}:`, error.message);
                this.stats.errorsEncountered++;
            }
        }
    }

    async collectFromSubgraph(subgraph) {
        await this.checkRateLimit('subgraph');

        const query = `
            query {
                pools(
                    first: 500
                    orderBy: totalValueLockedUSD
                    orderDirection: desc
                    where: { totalValueLockedUSD_gt: "10000" }
                ) {
                    id
                    token0 {
                        id
                        symbol
                        name
                        decimals
                    }
                    token1 {
                        id
                        symbol
                        name
                        decimals
                    }
                    feeTier
                    totalValueLockedUSD
                    volumeUSD
                    feesUSD
                    liquidity
                    token0Price
                    token1Price
                    tick
                }
            }
        `;

        try {
            const response = await axios.post(subgraph.url, 
                { query },
                { 
                    timeout: 15000,
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.data.errors) {
                throw new Error(`Subgraph errors: ${JSON.stringify(response.data.errors)}`);
            }

            const pools = response.data.data.pools;
            console.log(`📥 Fetched ${pools.length} pools from ${subgraph.name}`);

            // Process pools in batches
            const batchSize = 25;
            for (let i = 0; i < pools.length; i += batchSize) {
                const batch = pools.slice(i, i + batchSize);
                await this.processPoolBatch(batch, subgraph);
            }

            this.stats.poolsCollected += pools.length;

        } catch (error) {
            throw new Error(`Subgraph request failed: ${error.message}`);
        }
    }

    async processPoolBatch(pools, subgraph) {
        const promises = pools.map(async (pool) => {
            try {
                // Validate pool data
                if (!pool.token0 || !pool.token1 || !pool.id) {
                    return;
                }

                const poolId = `${subgraph.chain}-${subgraph.dex}-${pool.id.toLowerCase()}`;
                const liquidityUSD = parseFloat(pool.totalValueLockedUSD) || 0;
                const volume24h = parseFloat(pool.volumeUSD) || 0;
                const fees24h = parseFloat(pool.feesUSD) || 0;

                // Calculate APR
                const apr = liquidityUSD > 0 ? (fees24h * 365 / liquidityUSD) * 100 : 0;

                // Insert pool data
                await this.db.query(`
                    INSERT INTO pools (
                        id, address, dex, chain, chain_id,
                        token0_address, token0_symbol, token0_decimals,
                        token1_address, token1_symbol, token1_decimals,
                        fee, liquidity_usd, volume_24h, fees_earned_24h, apr,
                        price_token0, price_token1, is_active, last_updated
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                    ON CONFLICT (id) DO UPDATE SET
                        liquidity_usd = EXCLUDED.liquidity_usd,
                        volume_24h = EXCLUDED.volume_24h,
                        fees_earned_24h = EXCLUDED.fees_earned_24h,
                        apr = EXCLUDED.apr,
                        price_token0 = EXCLUDED.price_token0,
                        price_token1 = EXCLUDED.price_token1,
                        is_active = EXCLUDED.is_active,
                        last_updated = EXCLUDED.last_updated
                `, [
                    poolId,
                    pool.id.toLowerCase(),
                    subgraph.dex,
                    subgraph.chain,
                    this.getChainId(subgraph.chain),
                    pool.token0.id.toLowerCase(),
                    pool.token0.symbol.toUpperCase(),
                    parseInt(pool.token0.decimals) || 18,
                    pool.token1.id.toLowerCase(),
                    pool.token1.symbol.toUpperCase(),
                    parseInt(pool.token1.decimals) || 18,
                    parseInt(pool.feeTier) || 3000,
                    liquidityUSD,
                    volume24h,
                    fees24h,
                    Math.min(apr, 10000), // Cap APR at 10000%
                    parseFloat(pool.token0Price) || 0,
                    parseFloat(pool.token1Price) || 0,
                    liquidityUSD > 1000 && volume24h > 0,
                    Math.floor(Date.now() / 1000)
                ]);

                // Cache token data for later use
                this.tokenCache.set(pool.token0.id.toLowerCase(), pool.token0);
                this.tokenCache.set(pool.token1.id.toLowerCase(), pool.token1);

            } catch (error) {
                console.error(`❌ Error processing pool ${pool.id}:`, error.message);
            }
        });

        await Promise.all(promises);
    }

    async enhanceWithOnChainData() {
        // Get top 100 pools for on-chain enhancement
        const result = await this.db.query(`
            SELECT * FROM pools 
            WHERE is_active = true 
            ORDER BY liquidity_usd DESC 
            LIMIT 100
        `);
        const pools = result.rows;

        console.log(`🔗 Enhancing ${pools.length} top pools with on-chain data...`);

        const chainGroups = new Map();
        for (const pool of pools) {
            if (!chainGroups.has(pool.chain)) {
                chainGroups.set(pool.chain, []);
            }
            chainGroups.get(pool.chain).push(pool);
        }

        for (const [chain, chainPools] of chainGroups) {
            try {
                await this.enhanceChainPools(chain, chainPools);
            } catch (error) {
                console.error(`❌ Error enhancing ${chain} pools:`, error.message);
            }
        }
    }

    async enhanceChainPools(chain, pools) {
        const provider = await this.getProvider(chain);
        if (!provider) {
            console.warn(`⚠️ No provider available for ${chain}`);
            return;
        }

        console.log(`🔗 Enhancing ${pools.length} pools on ${chain}...`);

        // Process in smaller batches to avoid rate limits
        const batchSize = 10;
        for (let i = 0; i < pools.length; i += batchSize) {
            const batch = pools.slice(i, i + batchSize);
            
            await this.checkRateLimit('rpc');
            
            const promises = batch.map(pool => this.enhancePoolOnChain(pool, provider));
            await Promise.allSettled(promises);
            
            // Small delay between batches
            await this.sleep(1000);
        }
    }

    async enhancePoolOnChain(pool, provider) {
        try {
            // Get current block number for timestamp
            const blockNumber = await provider.getBlockNumber();
            
            // Basic ERC20 ABI for getting decimals and total supply
            const erc20Abi = [
                'function decimals() view returns (uint8)',
                'function totalSupply() view returns (uint256)',
                'function balanceOf(address) view returns (uint256)'
            ];

            // Create contract instances
            const token0Contract = new ethers.Contract(pool.token0_address, erc20Abi, provider);
            const token1Contract = new ethers.Contract(pool.token1_address, erc20Abi, provider);

            // Get token details
            const [decimals0, decimals1] = await Promise.all([
                token0Contract.decimals(),
                token1Contract.decimals()
            ]);

            // Update pool with accurate decimals
            await this.db.query(`
                UPDATE pools 
                SET token0_decimals = $1, token1_decimals = $2, last_updated = $3
                WHERE id = $4
            `, [Number(decimals0), Number(decimals1), Math.floor(Date.now() / 1000), pool.id]);

        } catch (error) {
            console.warn(`⚠️ Could not enhance pool ${pool.id}: ${error.message}`);
        }
    }

    async calculateQualityScores() {
        console.log('🎯 Calculating data quality scores...');

        await this.db.query(`
            UPDATE pools
            SET data_quality_score = (
                CASE 
                    WHEN liquidity_usd > 1000000 THEN 10
                    WHEN liquidity_usd > 100000 THEN 8
                    WHEN liquidity_usd > 10000 THEN 6
                    WHEN liquidity_usd > 1000 THEN 4
                    ELSE 2
                END +
                CASE 
                    WHEN volume_24h > 100000 THEN 5
                    WHEN volume_24h > 10000 THEN 3
                    WHEN volume_24h > 1000 THEN 1
                    ELSE 0
                END +
                CASE 
                    WHEN apr > 0 AND apr < 1000 THEN 3
                    WHEN apr > 0 THEN 1
                    ELSE 0
                END +
                CASE 
                    WHEN price_token0 > 0 AND price_token1 > 0 THEN 2
                    ELSE 0
                END
            ) / 20.0 * 100
        `);

        console.log('✅ Quality scores calculated');
    }

    async printSummary() {
        const endTime = Date.now();
        const duration = Math.round((endTime - this.stats.startTime) / 1000);

        console.log('\n📋 Bootstrap Summary:');
        console.log('═══════════════════════');
        console.log(`⏱️ Duration: ${duration} seconds`);
        console.log(`💰 Tokens collected: ${this.stats.tokensCollected}`);
        console.log(`🏊 Pools collected: ${this.stats.poolsCollected}`);
        console.log(`🌐 Chains processed: ${this.stats.chainsProcessed}`);
        console.log(`❌ Errors encountered: ${this.stats.errorsEncountered}`);

        // Database statistics
        const statsResult = await this.db.query(`
            SELECT 
                COUNT(*) as total_pools,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_pools,
                SUM(liquidity_usd) as total_liquidity,
                AVG(data_quality_score) as avg_quality
            FROM pools
        `);
        const stats = statsResult.rows[0];

        console.log(`\n📊 Database Statistics:`);
        console.log(`Total pools: ${stats.total_pools}`);
        console.log(`Active pools: ${stats.active_pools}`);
        console.log(`Total liquidity: $${(parseFloat(stats.total_liquidity) || 0).toLocaleString()}`);
        console.log(`Average quality score: ${(parseFloat(stats.avg_quality) || 0).toFixed(1)}/100`);

        // Top pools by quality
        const topPoolsResult = await this.db.query(`
            SELECT token0_symbol, token1_symbol, chain, dex, 
                   liquidity_usd, data_quality_score
            FROM pools 
            WHERE is_active = true 
            ORDER BY data_quality_score DESC, liquidity_usd DESC 
            LIMIT 10
        `);
        const topPools = topPoolsResult.rows;

        console.log(`\n🏆 Top 10 Pools by Quality:`);
        topPools.forEach((pool, i) => {
            console.log(`${i + 1}. ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.chain}-${pool.dex}`);
            console.log(`   Liquidity: $${parseFloat(pool.liquidity_usd).toLocaleString()} | Quality: ${parseFloat(pool.data_quality_score).toFixed(1)}`);
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const bootstrap = new FreeDataBootstrap();
    
    bootstrap.bootstrap()
        .then(() => {
            console.log('\n🎉 Bootstrap completed successfully!');
            console.log('💡 Ready to start real-time data collection.');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Bootstrap failed:', error);
            process.exit(1);
        });
}

export { FreeDataBootstrap }; 