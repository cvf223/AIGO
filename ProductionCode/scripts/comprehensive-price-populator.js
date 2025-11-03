// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🎯 COMPREHENSIVE PRICE POPULATOR FOR ARBITRUM FLASH SPECIALIST
 * Populates price data for every token in every pool across Arbitrum, Polygon, and Base
 * Features: PostgreSQL integration, RPC rotation, rate limiting protection, multiple fallbacks
 * Compatible with current agent database schema
 */

import { ethers } from 'ethers';
import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuration - matches current agent setup
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/arbitrage_db';
const BATCH_SIZE = 30; // Reduced for rate limiting
const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 seconds between retries
const PRICE_CACHE_HOURS = 1;
const RPC_ROTATION_DELAY = 1000; // 1 second between RPC calls
const API_CALL_DELAY = 1500; // 1.5 seconds between API calls
const CONCURRENT_REQUESTS = 2; // Max concurrent requests per provider

// Multiple RPC endpoints for each chain (matching agent configuration)
const CHAIN_CONFIGS = {
    arbitrum: {
        rpcs: [
            'https://arb-mainnet.g.alchemy.com/v2/REbCC-FAc8AJD0WniRPH4R5aRtTCC9up',
            'https://arb-mainnet.g.alchemy.com/v2/pWrUXluNGmortiWN5TrXac8LObkpvMU2',
            'https://arbitrum-mainnet.infura.io/v3/11bceda966e2492b825fecdfc5189ee4',
            'https://arbitrum-mainnet.infura.io/v3/64b3954137524d29940ada2e176a3141',
            'https://arbitrum-mainnet.infura.io/v3/2ff3ba4c109b449d862a0d9b374aa8a6',
            'https://arbitrum-mainnet.infura.io/v3/afd49e2ee70e4cfbb4edaf4bb15e514c',
            'https://virulent-indulgent-yard.arbitrum-mainnet.quiknode.pro/c61b57427482cdc4cdb4d14b5c7a8c682905d5b3',
            'https://lively-clean-firefly.arbitrum-mainnet.quiknode.pro/c9f445677e8d1a7c109e5905e2520ea60b09a0c3',
            'https://arb1.arbitrum.io/rpc',
            'https://arbitrum.drpc.org',
            'https://rpc.ankr.com/arbitrum'
        ],
        weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        usdc: '0xA0b86a33E6441b8435b662303c0f479c6e8c385c',
        chainId: 42161,
        currentRpcIndex: 0,
        lastUsed: 0,
        requestCount: 0
    },
    polygon: {
        rpcs: [
            'https://polygon-rpc.com',
            'https://polygon.blockpi.network/v1/rpc/public',
            'https://polygon-bor.publicnode.com',
            'https://1rpc.io/matic',
            'https://rpc.ankr.com/polygon'
        ],
        weth: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        chainId: 137,
        currentRpcIndex: 0,
        lastUsed: 0,
        requestCount: 0
    },
    base: {
        rpcs: [
            'https://mainnet.base.org',
            'https://base.blockpi.network/v1/rpc/public',
            'https://base.publicnode.com',
            'https://1rpc.io/base',
            'https://base-mainnet.public.blastapi.io'
        ],
        weth: '0x4200000000000000000000000000000000000006',
        usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chainId: 8453,
        currentRpcIndex: 0,
        lastUsed: 0,
        requestCount: 0
    }
};

// Price API endpoints with rotation
const PRICE_APIS = [
    {
        name: 'coingecko',
        url: 'https://api.coingecko.com/api/v3/simple/price',
        rateLimit: 10, // requests per minute
        lastUsed: 0,
        requestCount: 0
    }
];

// Uniswap V2 Pair ABI (minimal)
const PAIR_ABI = [
    'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    'function token0() external view returns (address)',
    'function token1() external view returns (address)',
    'function totalSupply() external view returns (uint256)'
];

// ERC20 ABI (minimal)
const ERC20_ABI = [
    'function decimals() external view returns (uint8)',
    'function symbol() external view returns (string)',
    'function name() external view returns (string)',
    'function balanceOf(address) external view returns (uint256)'
];

// Global state
let db;
let providers = {};
let stats = {
    totalTokens: 0,
    pricesUpdated: 0,
    errors: 0,
    startTime: Date.now(),
    rpcCalls: 0,
    apiCalls: 0
};

/**
 * Initialize database connection using PostgreSQL
 */
async function initDatabase() {
    try {
        console.log('🐘 Connecting to PostgreSQL database...');
        db = new Client({
            connectionString: DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        await db.connect();
        console.log('✅ PostgreSQL database connected');

        // Create prices table if it doesn't exist (matching current schema)
        await db.query(`
            CREATE TABLE IF NOT EXISTS token_prices (
                id SERIAL PRIMARY KEY,
                chain_id INTEGER NOT NULL,
                token_address VARCHAR(42) NOT NULL,
                token_symbol VARCHAR(20),
                token_name VARCHAR(100),
                token_decimals INTEGER,
                price_usd DECIMAL(20, 8),
                price_eth DECIMAL(20, 8),
                liquidity_usd DECIMAL(20, 2),
                volume_24h DECIMAL(20, 2),
                market_cap DECIMAL(20, 2),
                pool_address VARCHAR(42),
                dex_name VARCHAR(50),
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_source VARCHAR(50),
                confidence_score DECIMAL(3, 2) DEFAULT 1.0,
                UNIQUE(chain_id, token_address, pool_address)
            )
        `);

        // Create index for faster queries
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_token_prices_chain_token 
            ON token_prices(chain_id, token_address)
        `);
        
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_token_prices_updated 
            ON token_prices(last_updated)
        `);

        console.log('✅ Token prices table initialized');
        return true;
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        return false;
    }
}

/**
 * Initialize RPC providers with rotation
 */
function initProviders() {
    console.log('🔗 Initializing RPC providers...');
    
    for (const [chainName, config] of Object.entries(CHAIN_CONFIGS)) {
        providers[chainName] = [];
        
        for (let i = 0; i < config.rpcs.length; i++) {
            try {
                const provider = new ethers.JsonRpcProvider(config.rpcs[i]);
                providers[chainName].push({
                    provider,
                    url: config.rpcs[i],
                    healthy: true,
                    requestCount: 0,
                    errorCount: 0,
                    lastUsed: 0
                });
            } catch (error) {
                console.warn(`⚠️  Failed to initialize provider ${config.rpcs[i]}: ${error.message}`);
            }
        }
        
        console.log(`✅ ${chainName}: ${providers[chainName].length} providers initialized`);
    }
}

/**
 * Get next available RPC provider with rotation and health checking
 */
function getProvider(chainName) {
    const chainProviders = providers[chainName];
    if (!chainProviders || chainProviders.length === 0) {
        throw new Error(`No providers available for ${chainName}`);
    }

    // Find healthy provider with lowest usage
    const healthyProviders = chainProviders.filter(p => p.healthy);
    if (healthyProviders.length === 0) {
        // Reset all providers if none are healthy
        chainProviders.forEach(p => p.healthy = true);
        console.log(`🔄 Reset all providers for ${chainName}`);
    }

    // Sort by request count (load balancing)
    const sortedProviders = healthyProviders.sort((a, b) => a.requestCount - b.requestCount);
    const selectedProvider = sortedProviders[0];
    
    selectedProvider.requestCount++;
    selectedProvider.lastUsed = Date.now();
    stats.rpcCalls++;

    return selectedProvider.provider;
}

/**
 * Mark provider as unhealthy after errors
 */
function markProviderUnhealthy(chainName, providerUrl) {
    const chainProviders = providers[chainName];
    const provider = chainProviders.find(p => p.url === providerUrl);
    if (provider) {
        provider.healthy = false;
        provider.errorCount++;
        console.warn(`⚠️  Marked provider unhealthy: ${providerUrl}`);
    }
}

/**
 * Sleep utility
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry(fn, maxRetries = MAX_RETRIES, baseDelay = RETRY_DELAY) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt - 1);
            console.warn(`⚠️  Attempt ${attempt} failed, retrying in ${delay}ms: ${error.message}`);
            await sleep(delay);
        }
    }
}

/**
 * Get all pools from database (matching current schema)
 */
async function getAllPools() {
    try {
        // Try different possible table names that might exist
        const possibleQueries = [
            `SELECT pool_address, token0_address, token1_address, chain_id, dex_name, dex, chain 
             FROM pools 
             WHERE (chain IN ('arbitrum', 'polygon', 'base') OR chain_id IN (42161, 137, 8453))
               AND token0_address IS NOT NULL 
               AND token1_address IS NOT NULL
             ORDER BY liquidity_usd DESC NULLS LAST 
             LIMIT 50`,
            `SELECT pool_address, token0_address, token1_address, chain_id, dex_name, dex, chain 
             FROM pools 
             WHERE token0_address IS NOT NULL 
               AND token1_address IS NOT NULL
             ORDER BY id LIMIT 50`,
            'SELECT * FROM pools WHERE is_active = true ORDER BY liquidity_usd DESC LIMIT 50',
            'SELECT * FROM pools ORDER BY id LIMIT 50'
        ];

        for (const query of possibleQueries) {
            try {
                const result = await db.query(query);
                if (result.rows.length > 0) {
                    console.log(`✅ Found ${result.rows.length} pools in database`);
                    return result.rows;
                }
            } catch (error) {
                // Try next query if this one fails
                continue;
            }
        }

        // If no pools table exists, create a basic one and populate with known pools
        console.log('📊 No pools found, creating sample pool data...');
        await createSamplePools();
        
        const result = await db.query('SELECT * FROM pools ORDER BY id');
        return result.rows;
        
    } catch (error) {
        console.error('❌ Failed to get pools:', error.message);
        return [];
    }
}

/**
 * Create sample pools if none exist
 */
async function createSamplePools() {
    try {
        // Create pools table (if it doesn't exist - it should already exist)
        await db.query(`
            CREATE TABLE IF NOT EXISTS pools (
                id SERIAL PRIMARY KEY,
                pool_address VARCHAR(42) NOT NULL UNIQUE,
                token0_address VARCHAR(42),
                token1_address VARCHAR(42),
                chain_id INTEGER NOT NULL,
                dex_name VARCHAR(50),
                fee INTEGER DEFAULT 3000,
                is_active BOOLEAN DEFAULT true,
                liquidity_usd NUMERIC DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert major Arbitrum pools
        const majorPools = [
            // Uniswap V3 WETH/USDC
            ['0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0xA0b86a33E6441b8435b662303c0f479c6e8c385c', 42161, 'Uniswap V3', 500],
            // Uniswap V3 WETH/ARB
            ['0xC6962004f452bE9203591991D15f6b388e09E8D0', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0x912CE59144191C1204E64559FE8253a0e49E6548', 42161, 'Uniswap V3', 3000],
            // SushiSwap WETH/USDC
            ['0x905dfCD5649343956C564A899FaFd79b8bE33F8A', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0xA0b86a33E6441b8435b662303c0f479c6e8c385c', 42161, 'SushiSwap', 3000],
            // Camelot WETH/USDC
            ['0x84652bb2539513BAf36e225c930Fdd8eaa63CE27', '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', '0xA0b86a33E6441b8435b662303c0f479c6e8c385c', 42161, 'Camelot', 3000]
        ];

        for (const [poolAddress, token0, token1, chainId, dexName, feeTier] of majorPools) {
            try {
                await db.query(`
                    INSERT INTO pools (pool_address, token0_address, token1_address, chain_id, dex_name, fee)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (pool_address) DO NOTHING
                `, [poolAddress, token0, token1, chainId, dexName, feeTier]);
            } catch (error) {
                console.warn(`⚠️  Failed to insert pool ${poolAddress}: ${error.message}`);
            }
        }

        console.log('✅ Sample pools created');
    } catch (error) {
        console.error('❌ Failed to create sample pools:', error.message);
    }
}

/**
 * Get token information from contract
 */
async function getTokenInfo(tokenAddress, chainName) {
    try {
        const provider = getProvider(chainName);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        
        const [symbol, name, decimals] = await Promise.all([
            tokenContract.symbol().catch(() => 'UNKNOWN'),
            tokenContract.name().catch(() => 'Unknown Token'),
            tokenContract.decimals().catch(() => 18)
        ]);

        return { symbol, name, decimals: Number(decimals) };
    } catch (error) {
        console.warn(`⚠️  Failed to get token info for ${tokenAddress}: ${error.message}`);
        return { symbol: 'UNKNOWN', name: 'Unknown Token', decimals: 18 };
    }
}

/**
 * Get price from DEX pool reserves
 */
async function getPriceFromPool(poolAddress, token0, token1, chainName) {
    try {
        const provider = getProvider(chainName);
        const pairContract = new ethers.Contract(poolAddress, PAIR_ABI, provider);
        
        const [reserves, totalSupply] = await Promise.all([
            pairContract.getReserves(),
            pairContract.totalSupply().catch(() => ethers.parseEther('0'))
        ]);

        const reserve0 = Number(ethers.formatEther(reserves.reserve0));
        const reserve1 = Number(ethers.formatEther(reserves.reserve1));
        
        if (reserve0 === 0 || reserve1 === 0) {
            return null;
        }

        // Calculate price ratios
        const price0in1 = reserve1 / reserve0; // Price of token0 in token1
        const price1in0 = reserve0 / reserve1; // Price of token1 in token0
        
        // Calculate liquidity (simplified)
        const liquidityUSD = (reserve0 + reserve1) * 2000; // Rough estimate assuming ETH = $2000

        return {
            reserve0,
            reserve1,
            price0in1,
            price1in0,
            liquidityUSD,
            totalSupply: Number(ethers.formatEther(totalSupply))
        };
    } catch (error) {
        console.warn(`⚠️  Failed to get pool data for ${poolAddress}: ${error.message}`);
        return null;
    }
}

/**
 * Get ETH price from external API
 */
async function getETHPrice() {
    try {
        const api = PRICE_APIS[0]; // Use CoinGecko
        
        // Rate limiting
        const now = Date.now();
        if (now - api.lastUsed < 60000 / api.rateLimit) {
            await sleep(60000 / api.rateLimit - (now - api.lastUsed));
        }
        
        const response = await fetch(`${api.url}?ids=ethereum&vs_currencies=usd`);
        const data = await response.json();
        
        api.lastUsed = Date.now();
        api.requestCount++;
        stats.apiCalls++;
        
        return data.ethereum?.usd || 2000; // Fallback to $2000
    } catch (error) {
        console.warn('⚠️  Failed to get ETH price, using fallback: $2000');
        return 2000;
    }
}

/**
 * Save token price to database
 */
async function saveTokenPrice(tokenData) {
    try {
        await db.query(`
            INSERT INTO token_prices (
                chain_id, token_address, token_symbol, token_name, token_decimals,
                price_usd, price_eth, liquidity_usd, pool_address, dex_name,
                data_source, confidence_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (chain_id, token_address, pool_address) 
            DO UPDATE SET
                token_symbol = EXCLUDED.token_symbol,
                token_name = EXCLUDED.token_name,
                token_decimals = EXCLUDED.token_decimals,
                price_usd = EXCLUDED.price_usd,
                price_eth = EXCLUDED.price_eth,
                liquidity_usd = EXCLUDED.liquidity_usd,
                data_source = EXCLUDED.data_source,
                confidence_score = EXCLUDED.confidence_score,
                last_updated = CURRENT_TIMESTAMP
        `, [
            tokenData.chainId,
            tokenData.address,
            tokenData.symbol,
            tokenData.name,
            tokenData.decimals,
            tokenData.priceUSD,
            tokenData.priceETH,
            tokenData.liquidityUSD,
            tokenData.poolAddress,
            tokenData.dexName,
            tokenData.dataSource,
            tokenData.confidenceScore
        ]);
        
        stats.pricesUpdated++;
    } catch (error) {
        console.error(`❌ Failed to save price for ${tokenData.symbol}: ${error.message}`);
        stats.errors++;
    }
}

/**
 * Process a single pool and extract token prices
 */
async function processPool(pool, ethPrice) {
    // Handle both chain_id and chain name mapping
    let chainName;
    
    if (pool.chain_id) {
        chainName = Object.keys(CHAIN_CONFIGS).find(
            name => CHAIN_CONFIGS[name].chainId === pool.chain_id
        );
    } else if (pool.chain) {
        // Map chain names to our config
        const chainMapping = {
            'arbitrum': 'arbitrum',
            'polygon': 'polygon', 
            'base': 'base',
            'ethereum': null, // Skip ethereum for now
            'bsc': null, // Skip BSC for now
            'avalanche': null, // Skip avalanche for now
            'optimism': null // Skip optimism for now
        };
        chainName = chainMapping[pool.chain.toLowerCase()];
    }
    
    if (!chainName) {
        // Skip unsupported chains silently
        return;
    }

    try {
        console.log(`🔍 Processing pool: ${pool.pool_address} on ${chainName}`);
        
        // Get token addresses (handle different column names)
        const token0Address = pool.token0_address || pool.token0;
        const token1Address = pool.token1_address || pool.token1;
        
        if (!token0Address || !token1Address) {
            console.warn(`⚠️  Missing token addresses for pool ${pool.pool_address}`);
            return;
        }

        // Get token information
        const [token0Info, token1Info] = await Promise.all([
            getTokenInfo(token0Address, chainName),
            getTokenInfo(token1Address, chainName)
        ]);

        // Get pool data
        const poolData = await getPriceFromPool(
            pool.pool_address, 
            token0Address, 
            token1Address, 
            chainName
        );

        if (!poolData) {
            console.warn(`⚠️  No pool data for ${pool.pool_address}`);
            return;
        }

        // Determine which token is ETH/WETH and calculate USD prices
        const config = CHAIN_CONFIGS[chainName];
        const isToken0ETH = token0Address.toLowerCase() === config.weth.toLowerCase();
        const isToken1ETH = token1Address.toLowerCase() === config.weth.toLowerCase();
        const isToken0USDC = token0Address.toLowerCase() === config.usdc.toLowerCase();
        const isToken1USDC = token1Address.toLowerCase() === config.usdc.toLowerCase();

        let token0PriceUSD = 0;
        let token1PriceUSD = 0;
        let token0PriceETH = 0;
        let token1PriceETH = 0;
        let confidenceScore = 0.8;

        // Calculate prices based on pool composition
        if (isToken0ETH && isToken1USDC) {
            // ETH/USDC pool - direct prices
            token0PriceUSD = ethPrice;
            token1PriceUSD = 1; // USDC = $1
            token0PriceETH = 1;
            token1PriceETH = 1 / ethPrice;
            confidenceScore = 0.95;
        } else if (isToken1ETH && isToken0USDC) {
            // USDC/ETH pool
            token0PriceUSD = 1; // USDC = $1
            token1PriceUSD = ethPrice;
            token0PriceETH = 1 / ethPrice;
            token1PriceETH = 1;
            confidenceScore = 0.95;
        } else if (isToken0ETH) {
            // Token0 is ETH
            token0PriceUSD = ethPrice;
            token1PriceUSD = ethPrice / poolData.price0in1;
            token0PriceETH = 1;
            token1PriceETH = 1 / poolData.price0in1;
            confidenceScore = 0.85;
        } else if (isToken1ETH) {
            // Token1 is ETH
            token0PriceUSD = ethPrice / poolData.price1in0;
            token1PriceUSD = ethPrice;
            token0PriceETH = 1 / poolData.price1in0;
            token1PriceETH = 1;
            confidenceScore = 0.85;
        } else if (isToken0USDC) {
            // Token0 is USDC
            token0PriceUSD = 1;
            token1PriceUSD = poolData.price0in1;
            token0PriceETH = 1 / ethPrice;
            token1PriceETH = poolData.price0in1 / ethPrice;
            confidenceScore = 0.8;
        } else if (isToken1USDC) {
            // Token1 is USDC
            token0PriceUSD = poolData.price1in0;
            token1PriceUSD = 1;
            token0PriceETH = poolData.price1in0 / ethPrice;
            token1PriceETH = 1 / ethPrice;
            confidenceScore = 0.8;
        } else {
            // Neither token is ETH or USDC - use reserves ratio
            const avgReserveValue = (poolData.reserve0 + poolData.reserve1) / 2;
            token0PriceUSD = avgReserveValue * ethPrice / poolData.reserve0;
            token1PriceUSD = avgReserveValue * ethPrice / poolData.reserve1;
            token0PriceETH = avgReserveValue / poolData.reserve0;
            token1PriceETH = avgReserveValue / poolData.reserve1;
            confidenceScore = 0.6;
        }

        // Get actual chain ID for database storage
        const actualChainId = pool.chain_id || CHAIN_CONFIGS[chainName].chainId;

        // Save token0 price
        await saveTokenPrice({
            chainId: actualChainId,
            address: token0Address,
            symbol: token0Info.symbol,
            name: token0Info.name,
            decimals: token0Info.decimals,
            priceUSD: token0PriceUSD,
            priceETH: token0PriceETH,
            liquidityUSD: poolData.liquidityUSD,
            poolAddress: pool.pool_address,
            dexName: pool.dex_name || pool.dex || 'Unknown',
            dataSource: 'on-chain',
            confidenceScore
        });

        // Save token1 price
        await saveTokenPrice({
            chainId: actualChainId,
            address: token1Address,
            symbol: token1Info.symbol,
            name: token1Info.name,
            decimals: token1Info.decimals,
            priceUSD: token1PriceUSD,
            priceETH: token1PriceETH,
            liquidityUSD: poolData.liquidityUSD,
            poolAddress: pool.pool_address,
            dexName: pool.dex_name || pool.dex || 'Unknown',
            dataSource: 'on-chain',
            confidenceScore
        });

        console.log(`✅ ${token0Info.symbol}: $${token0PriceUSD.toFixed(4)} | ${token1Info.symbol}: $${token1PriceUSD.toFixed(4)}`);
        
        // Rate limiting
        await sleep(RPC_ROTATION_DELAY);
        
    } catch (error) {
        console.error(`❌ Failed to process pool ${pool.pool_address}: ${error.message}`);
        stats.errors++;
    }
}

/**
 * Process pools in batches
 */
async function processPools(pools, ethPrice) {
    console.log(`🚀 Processing ${pools.length} pools in batches of ${BATCH_SIZE}`);
    
    for (let i = 0; i < pools.length; i += BATCH_SIZE) {
        const batch = pools.slice(i, i + BATCH_SIZE);
        console.log(`📊 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(pools.length / BATCH_SIZE)}`);
        
        // Process batch with limited concurrency
        const batchPromises = batch.map(pool => 
            withRetry(() => processPool(pool, ethPrice))
        );
        
        await Promise.allSettled(batchPromises);
        
        // Progress update
        const processed = Math.min(i + BATCH_SIZE, pools.length);
        const percentage = ((processed / pools.length) * 100).toFixed(1);
        console.log(`📈 Progress: ${processed}/${pools.length} (${percentage}%)`);
        
        // Batch delay to avoid overwhelming RPC endpoints
        if (i + BATCH_SIZE < pools.length) {
            await sleep(API_CALL_DELAY);
        }
    }
}

/**
 * Print final statistics
 */
function printStats() {
    const duration = (Date.now() - stats.startTime) / 1000;
    const rpcRate = (stats.rpcCalls / duration).toFixed(2);
    
    console.log('\n🎉 PRICE POPULATION COMPLETE!');
    console.log('═'.repeat(50));
    console.log(`⏱️  Duration: ${duration.toFixed(1)}s`);
    console.log(`📊 Total Tokens: ${stats.totalTokens}`);
    console.log(`✅ Prices Updated: ${stats.pricesUpdated}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log(`🔗 RPC Calls: ${stats.rpcCalls} (${rpcRate}/s)`);
    console.log(`🌐 API Calls: ${stats.apiCalls}`);
    console.log(`📈 Success Rate: ${((stats.pricesUpdated / (stats.pricesUpdated + stats.errors)) * 100).toFixed(1)}%`);
    console.log('═'.repeat(50));
    
    // Provider statistics
    console.log('\n📊 PROVIDER STATISTICS:');
    for (const [chainName, chainProviders] of Object.entries(providers)) {
        console.log(`\n${chainName.toUpperCase()}:`);
        chainProviders.forEach((provider, index) => {
            const healthStatus = provider.healthy ? '✅' : '❌';
            console.log(`  ${healthStatus} Provider ${index + 1}: ${provider.requestCount} requests, ${provider.errorCount} errors`);
        });
    }
}

/**
 * Main execution function
 */
async function main() {
    console.log('🎯 COMPREHENSIVE PRICE POPULATOR STARTING...');
    console.log('═'.repeat(60));
    
    try {
        // Initialize systems
        const dbConnected = await initDatabase();
        if (!dbConnected) {
            throw new Error('Database connection failed');
        }
        
        initProviders();
        
        // Get ETH price
        console.log('💰 Fetching ETH price...');
        const ethPrice = await getETHPrice();
        console.log(`✅ ETH Price: $${ethPrice}`);
        
        // Get all pools
        console.log('🏊 Loading pools from database...');
        const pools = await getAllPools();
        
        if (pools.length === 0) {
            throw new Error('No pools found in database');
        }
        
        stats.totalTokens = pools.length * 2; // Each pool has 2 tokens
        console.log(`✅ Found ${pools.length} pools (${stats.totalTokens} tokens)`);
        
        // Process all pools
        await processPools(pools, ethPrice);
        
        // Print final statistics
        printStats();
        
    } catch (error) {
        console.error('❌ FATAL ERROR:', error.message);
        process.exit(1);
    } finally {
        // Clean up database connection
        if (db) {
            await db.end();
            console.log('✅ Database connection closed');
        }
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (db) {
        await db.end();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    if (db) {
        await db.end();
    }
    process.exit(0);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { main, processPool, getAllPools, initDatabase }; 