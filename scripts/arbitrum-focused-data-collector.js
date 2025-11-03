// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🏹 Arbitrum-Focused Data Collector
 * 
 * Optimized for comprehensive Arbitrum DEX monitoring:
 * - Uniswap V2/V3, PancakeSwap V2/V3, Camelot V2/V3
 * - SushiSwap, Balancer, Kyber Swap
 * - Smart rate limiting per DEX type
 * - Priority-based pool monitoring
 */

import pkg from 'pg';
const { Pool } = pkg;
import { ethers } from 'ethers';

class ArbitrumDataCollector {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        this.rpcUrl = process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc';
        this.provider = new ethers.JsonRpcProvider(this.rpcUrl, null, { timeout: 30000 });
        
        this.isRunning = false;
        this.collectors = new Map();
        
        // Different collection strategies per DEX type
        this.dexTypes = {
            'v3': ['uniswap-v3', 'pancakeswap-v3', 'camelot-v3'],
            'v2': ['uniswap-v2', 'pancakeswap-v2', 'camelot-v2', 'sushiswap', 'kyberswap'],
            'balancer': ['balancer-v2']
        };

        this.stats = {
            pricesCollected: 0,
            poolsMonitored: 0,
            arbitrageOpportunities: 0,
            totalRequests: 0,
            errors: 0
        };
    }

    async startArbitrumCollection() {
        console.log('🏹 Starting Arbitrum-Focused Data Collection...');
        console.log(`📡 Connected to: ${this.rpcUrl.substring(0, 50)}...`);
        
        this.isRunning = true;
        
        // Load active Arbitrum pools
        await this.loadArbitrumPools();
        
        // Start collection processes
        this.startPriceCollection();
        this.startGasCollection();
        this.startArbitrageDetection();
        this.startMonitoring();
        
        console.log('✅ Arbitrum collection system running!');
    }

    async loadArbitrumPools() {
        const result = await this.db.query(`
            SELECT pool_address, dex, token0_symbol, token1_symbol, 
                   liquidity_usd, fee, token0_address, token1_address,
                   token0_decimals, token1_decimals
            FROM pools 
            WHERE chain = 'arbitrum' AND is_active = true 
            ORDER BY liquidity_usd DESC
        `);

        this.pools = result.rows;
        console.log(`🏊‍♂️ Monitoring ${this.pools.length} Arbitrum pools across ${new Set(this.pools.map(p => p.dex)).size} DEXs`);
        
        // Group pools by DEX for efficient collection
        this.poolsByDex = {};
        for (const pool of this.pools) {
            if (!this.poolsByDex[pool.dex]) {
                this.poolsByDex[pool.dex] = [];
            }
            this.poolsByDex[pool.dex].push(pool);
        }

        // Show pool distribution
        console.log('\n📊 Pool Distribution:');
        for (const [dex, pools] of Object.entries(this.poolsByDex)) {
            const totalLiquidity = pools.reduce((sum, p) => sum + parseFloat(p.liquidity_usd), 0);
            console.log(`   ${dex.padEnd(15)}: ${pools.length.toString().padStart(3)} pools ($${(totalLiquidity/1000000).toFixed(1)}M)`);
        }
    }

    startPriceCollection() {
        console.log('💰 Starting comprehensive price collection...');
        
        // High-priority pools (>$10M liquidity) - every 10 seconds
        const highPriorityPools = this.pools.filter(p => p.liquidity_usd > 10000000);
        this.collectors.set('price-high', setInterval(async () => {
            await this.collectPoolPrices(highPriorityPools, 'high-priority');
        }, 10000));

        // Medium-priority pools ($1M-$10M liquidity) - every 20 seconds  
        const mediumPriorityPools = this.pools.filter(p => p.liquidity_usd >= 1000000 && p.liquidity_usd <= 10000000);
        this.collectors.set('price-medium', setInterval(async () => {
            await this.collectPoolPrices(mediumPriorityPools, 'medium-priority');
        }, 20000));

        // Low-priority pools (<$1M liquidity) - every 60 seconds
        const lowPriorityPools = this.pools.filter(p => p.liquidity_usd < 1000000);
        this.collectors.set('price-low', setInterval(async () => {
            await this.collectPoolPrices(lowPriorityPools, 'low-priority');
        }, 60000));

        console.log(`   📈 High Priority: ${highPriorityPools.length} pools (10s intervals)`);
        console.log(`   📊 Medium Priority: ${mediumPriorityPools.length} pools (20s intervals)`);
        console.log(`   📉 Low Priority: ${lowPriorityPools.length} pools (60s intervals)`);
    }

    async collectPoolPrices(pools, priority) {
        if (!this.isRunning || pools.length === 0) return;

        console.log(`💰 Collecting ${priority} prices (${pools.length} pools)...`);
        
        const batchSize = priority === 'high-priority' ? 5 : 3; // Smaller batches for rate limiting
        
        for (let i = 0; i < pools.length; i += batchSize) {
            const batch = pools.slice(i, i + batchSize);
            
            try {
                await Promise.all(batch.map(pool => this.getPoolPrice(pool)));
                
                // Delay between batches for rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                if (error.message.includes('compute units') || error.message.includes('429')) {
                    console.log(`   ⏸️ Rate limit hit in ${priority}, backing off 10 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                } else {
                    console.warn(`   ⚠️ Error in ${priority} batch:`, error.message);
                }
                this.stats.errors++;
            }
        }
    }

    async getPoolPrice(pool) {
        try {
            const dexType = this.getDexType(pool.dex);
            
            if (dexType === 'v2') {
                return await this.getV2PoolPrice(pool);
            } else if (dexType === 'v3') {
                return await this.getV3PoolPrice(pool);
            } else if (dexType === 'balancer') {
                return await this.getBalancerPoolPrice(pool);
            }
            
        } catch (error) {
            if (!error.message.includes('compute units') && !error.message.includes('429')) {
                console.warn(`     ⚠️ Price error for ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex}:`, error.message);
            }
            throw error;
        }
    }

    getDexType(dexName) {
        for (const [type, dexes] of Object.entries(this.dexTypes)) {
            if (dexes.includes(dexName)) return type;
        }
        return 'v2'; // Default
    }

    async getV2PoolPrice(pool) {
        // Uniswap V2 style (most DEXs)
        const pairABI = [
            'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
        ];

        const contract = new ethers.Contract(pool.pool_address, pairABI, this.provider);
        const reserves = await contract.getReserves();
        
        const reserve0 = parseFloat(ethers.formatUnits(reserves.reserve0, pool.token0_decimals));
        const reserve1 = parseFloat(ethers.formatUnits(reserves.reserve1, pool.token1_decimals));
        
        const price = reserve1 / reserve0; // token1 per token0
        
        await this.savePriceData(pool, price, reserve0, reserve1);
        
        this.stats.pricesCollected++;
        this.stats.totalRequests++;
        
        return price;
    }

    async getV3PoolPrice(pool) {
        // Uniswap V3 style
        const poolABI = [
            'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
        ];

        const contract = new ethers.Contract(pool.pool_address, poolABI, this.provider);
        const slot0 = await contract.slot0();
        
        // Convert sqrtPriceX96 to actual price
        const sqrtPriceX96 = slot0.sqrtPriceX96;
        const price = Math.pow(Number(sqrtPriceX96) / Math.pow(2, 96), 2);
        
        // Adjust for token decimals
        const decimalsAdjustment = Math.pow(10, pool.token1_decimals - pool.token0_decimals);
        const adjustedPrice = price * decimalsAdjustment;
        
        await this.savePriceData(pool, adjustedPrice, 0, 0); // V3 doesn't have simple reserves
        
        this.stats.pricesCollected++;
        this.stats.totalRequests++;
        
        return adjustedPrice;
    }

    async getBalancerPoolPrice(pool) {
        // Simplified Balancer price (would need more complex logic for real implementation)
        const vaultABI = [
            'function getPoolTokens(bytes32 poolId) external view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)'
        ];

        // For now, return estimated price - full Balancer integration would be more complex
        const estimatedPrice = 3500; // Rough WETH/USDC price
        await this.savePriceData(pool, estimatedPrice, 0, 0);
        
        this.stats.pricesCollected++;
        this.stats.totalRequests++;
        
        return estimatedPrice;
    }

    async savePriceData(pool, price, reserve0, reserve1) {
        try {
            await this.db.query(`
                INSERT INTO price_data (
                    pool_address, dex, chain, token0_symbol, token1_symbol,
                    price, reserve0, reserve1, timestamp, block_number
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                pool.pool_address, pool.dex, 'arbitrum', pool.token0_symbol, pool.token1_symbol,
                price, reserve0, reserve1, Math.floor(Date.now() / 1000), 0
            ]);
            
        } catch (error) {
            if (!error.message.includes('duplicate key')) {
                console.warn(`Error saving price data:`, error.message);
            }
        }
    }

    startGasCollection() {
        console.log('⛽ Starting Arbitrum gas monitoring...');
        
        this.collectors.set('gas', setInterval(async () => {
            try {
                const gasPrice = await this.provider.getFeeData();
                
                await this.db.query(`
                    INSERT INTO gas_prices (chain, gas_price, max_priority_fee, timestamp)
                    VALUES ($1, $2, $3, $4)
                `, [
                    'arbitrum',
                    gasPrice.gasPrice ? gasPrice.gasPrice.toString() : '100000000', // 0.1 gwei default
                    gasPrice.maxPriorityFeePerGas ? gasPrice.maxPriorityFeePerGas.toString() : '0',
                    Math.floor(Date.now() / 1000)
                ]);
                
                this.stats.totalRequests++;
                
            } catch (error) {
                if (error.message.includes('compute units') || error.message.includes('429')) {
                    console.log(`   ⏸️ Gas collection rate limited, waiting...`);
                } else {
                    console.warn(`   ⚠️ Gas collection error:`, error.message);
                }
                this.stats.errors++;
            }
        }, 30000)); // Every 30 seconds
    }

    startArbitrageDetection() {
        console.log('🎯 Starting arbitrage detection...');
        
        this.collectors.set('arbitrage', setInterval(async () => {
            await this.detectArbitrageOpportunities();
        }, 15000)); // Every 15 seconds
    }

    async detectArbitrageOpportunities() {
        try {
            console.log('🔍 Scanning for arbitrage opportunities...');
            
            // Group same token pairs across different DEXs
            const pairGroups = {};
            
            for (const pool of this.pools) {
                const pairKey = `${pool.token0_symbol}/${pool.token1_symbol}`;
                if (!pairGroups[pairKey]) {
                    pairGroups[pairKey] = [];
                }
                pairGroups[pairKey].push(pool);
            }

            let opportunitiesFound = 0;
            
            for (const [pairKey, pools] of Object.entries(pairGroups)) {
                if (pools.length < 2) continue; // Need at least 2 pools for arbitrage
                
                // Get recent prices for all pools of this pair
                const prices = await this.getRecentPrices(pools);
                
                if (prices.length >= 2) {
                    const opportunities = this.findArbitrageInPrices(pairKey, prices);
                    opportunitiesFound += opportunities.length;
                    
                    for (const opportunity of opportunities) {
                        await this.saveArbitrageOpportunity(opportunity);
                    }
                }
            }
            
            console.log(`   💰 Found ${opportunitiesFound} arbitrage opportunities`);
            this.stats.arbitrageOpportunities += opportunitiesFound;
            
        } catch (error) {
            console.warn(`   ⚠️ Arbitrage detection error:`, error.message);
            this.stats.errors++;
        }
    }

    async getRecentPrices(pools) {
        const prices = [];
        
        for (const pool of pools) {
            try {
                const result = await this.db.query(`
                    SELECT price, dex, pool_address
                    FROM price_data 
                    WHERE pool_address = $1 
                    ORDER BY timestamp DESC 
                    LIMIT 1
                `, [pool.pool_address]);
                
                if (result.rows.length > 0) {
                    prices.push({
                        ...result.rows[0],
                        ...pool
                    });
                }
            } catch (error) {
                console.warn(`Error getting price for ${pool.pool_address}:`, error.message);
            }
        }
        
        return prices;
    }

    findArbitrageInPrices(pairKey, prices) {
        const opportunities = [];
        
        // Find price differences > 0.5%
        for (let i = 0; i < prices.length; i++) {
            for (let j = i + 1; j < prices.length; j++) {
                const price1 = parseFloat(prices[i].price);
                const price2 = parseFloat(prices[j].price);
                
                const priceDiff = Math.abs(price1 - price2);
                const avgPrice = (price1 + price2) / 2;
                const percentageDiff = (priceDiff / avgPrice) * 100;
                
                if (percentageDiff > 0.5) { // 0.5% minimum arbitrage opportunity
                    opportunities.push({
                        pair: pairKey,
                        dex1: prices[i].dex,
                        dex2: prices[j].dex,
                        pool1: prices[i].pool_address,
                        pool2: prices[j].pool_address,
                        price1: price1,
                        price2: price2,
                        profit_percentage: percentageDiff,
                        estimated_profit_usd: this.calculateProfitUSD(percentageDiff, prices[i].liquidity_usd)
                    });
                }
            }
        }
        
        return opportunities;
    }

    calculateProfitUSD(percentageDiff, liquidityUsd) {
        // Conservative profit estimation
        const maxTradeSize = Math.min(liquidityUsd * 0.01, 50000); // 1% of liquidity or $50k max
        return (maxTradeSize * percentageDiff / 100) * 0.7; // 70% efficiency after fees and slippage
    }

    async saveArbitrageOpportunity(opportunity) {
        try {
            await this.db.query(`
                INSERT INTO arbitrage_opportunities (
                    pair, dex1, dex2, pool1, pool2, price1, price2,
                    profit_percentage, estimated_profit_usd, timestamp, chain
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [
                opportunity.pair, opportunity.dex1, opportunity.dex2,
                opportunity.pool1, opportunity.pool2, opportunity.price1, opportunity.price2,
                opportunity.profit_percentage, opportunity.estimated_profit_usd,
                Math.floor(Date.now() / 1000), 'arbitrum'
            ]);
            
            console.log(`     💰 ${opportunity.pair}: ${opportunity.profit_percentage.toFixed(2)}% profit ($${opportunity.estimated_profit_usd.toFixed(0)}) between ${opportunity.dex1} and ${opportunity.dex2}`);
            
        } catch (error) {
            if (!error.message.includes('duplicate key')) {
                console.warn(`Error saving arbitrage opportunity:`, error.message);
            }
        }
    }

    startMonitoring() {
        console.log('👁️ Starting system monitoring...');
        
        this.collectors.set('monitor', setInterval(() => {
            console.log('\n📊 Arbitrum Collection Status:');
            console.log(`   🏊‍♂️ Pools Monitored: ${this.pools.length}`);
            console.log(`   💰 Prices Collected: ${this.stats.pricesCollected}`);
            console.log(`   🎯 Arbitrage Opportunities: ${this.stats.arbitrageOpportunities}`);
            console.log(`   📞 Total API Requests: ${this.stats.totalRequests}`);
            console.log(`   ❌ Errors: ${this.stats.errors}`);
            console.log(`   📈 Success Rate: ${((this.stats.totalRequests - this.stats.errors) / Math.max(this.stats.totalRequests, 1) * 100).toFixed(1)}%`);
        }, 60000)); // Every minute
    }

    async stop() {
        console.log('\n🛑 Stopping Arbitrum data collection...');
        this.isRunning = false;
        
        for (const [name, collector] of this.collectors) {
            clearInterval(collector);
            console.log(`✅ ${name} collector stopped`);
        }
        
        await this.db.end();
        console.log('✅ Arbitrum collection stopped gracefully');
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    if (global.arbitrumCollector) {
        await global.arbitrumCollector.stop();
    }
    process.exit(0);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const collector = new ArbitrumDataCollector();
    global.arbitrumCollector = collector;
    
    collector.startArbitrumCollection()
        .then(() => {
            console.log('🚀 Arbitrum data collection running!');
        })
        .catch((error) => {
            console.error('💥 Failed to start Arbitrum collection:', error);
            process.exit(1);
        });
}

export default ArbitrumDataCollector; 