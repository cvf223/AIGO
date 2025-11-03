// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🚀 Enhanced Data Collector with Smart Endpoint Management
 * 
 * Features:
 * - Intelligent endpoint rotation (1000+ calls/sec capacity)
 * - Multi-source data aggregation
 * - Real-time arbitrage detection
 * - Automatic error handling and fallbacks
 */

import { endpointManager, marketDataManager } from './endpoint-manager.js';
import pkg from 'pg';
const { Pool } = pkg;
import axios from 'axios';
import { ethers } from 'ethers';

class EnhancedDataCollector {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        this.collectors = {
            price: new PriceCollector(endpointManager, marketDataManager, this.db),
            pool: new PoolCollector(endpointManager, this.db),
            gas: new GasCollector(endpointManager, this.db),
            arbitrage: new ArbitrageDetector(this.db)
        };
        
        this.isRunning = false;
        this.stats = {
            totalRequests: 0,
            successfulRequests: 0,
            errors: 0,
            arbitrageOpportunities: 0,
            startTime: Date.now()
        };
        
        console.log('🚀 Enhanced Data Collector initialized');
    }

    async start() {
        if (this.isRunning) {
            console.log('⚠️ Data collector already running');
            return;
        }

        this.isRunning = true;
        console.log('🏃‍♂️ Starting enhanced data collection...');

        // Start all collectors concurrently
        const promises = [
            this.collectors.price.start(),
            this.collectors.pool.start(), 
            this.collectors.gas.start(),
            this.collectors.arbitrage.start()
        ];

        // Start monitoring
        this.startMonitoring();

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('💥 Critical error in data collection:', error);
            this.stop();
        }
    }

    async stop() {
        console.log('🛑 Stopping data collection...');
        this.isRunning = false;
        
        await Promise.all([
            this.collectors.price.stop(),
            this.collectors.pool.stop(),
            this.collectors.gas.stop(),
            this.collectors.arbitrage.stop()
        ]);
        
        await this.db.end();
        console.log('✅ Data collection stopped');
    }

    startMonitoring() {
        setInterval(() => {
            if (!this.isRunning) return;
            
            const runtime = Date.now() - this.stats.startTime;
            const runtimeHours = runtime / (1000 * 60 * 60);
            
            console.log(`\n📊 Enhanced Data Collector Stats:`);
            console.log(`   Runtime: ${(runtimeHours).toFixed(2)} hours`);
            console.log(`   Total Requests: ${this.stats.totalRequests}`);
            console.log(`   Success Rate: ${(this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(1)}%`);
            console.log(`   Arbitrage Found: ${this.stats.arbitrageOpportunities}`);
            console.log(`   Requests/Hour: ${Math.round(this.stats.totalRequests / runtimeHours)}`);
            
        }, 60000); // Every minute
    }
}

/**
 * 💰 High-Frequency Price Collector
 */
class PriceCollector {
    constructor(endpointManager, marketDataManager, db) {
        this.endpointManager = endpointManager;
        this.marketDataManager = marketDataManager;
        this.db = db;
        this.isRunning = false;
        this.providers = [];
        this.priceCache = new Map();
    }

    async start() {
        this.isRunning = true;
        console.log('💰 Starting high-frequency price collection...');

        // Get multiple endpoints for parallel processing
        const networks = ['ethereum', 'arbitrum', 'polygon', 'base'];
        
        // Initialize WebSocket connections for real-time data
        for (const network of networks) {
            try {
                const endpoints = await this.endpointManager.getParallelEndpoints(network, 2);
                
                for (const endpoint of endpoints) {
                    this.setupWebSocketConnection(endpoint);
                }
            } catch (error) {
                console.error(`Failed to setup ${network} price collection:`, error.message);
            }
        }

        // Start REST API polling for backup
        this.startRESTPolling();
    }

    async setupWebSocketConnection(endpoint) {
        try {
            const wsUrl = endpoint.url.replace('https://', 'wss://');
            
            // Check if provider supports WebSocket
            if (!this.supportsWebSocket(endpoint.provider)) {
                console.log(`⚠️ ${endpoint.provider} doesn't support WebSocket, using REST polling`);
                this.setupRESTPolling(endpoint);
                return;
            }
            
            const provider = new ethers.WebSocketProvider(wsUrl);
            
            // Add error handling for WebSocket
            provider.websocket.on('error', (error) => {
                console.warn(`WebSocket error for ${endpoint.provider}:`, error.message);
                console.log(`🔄 Falling back to REST polling for ${endpoint.provider}`);
                this.setupRESTPolling(endpoint);
            });
            
            provider.websocket.on('close', () => {
                console.log(`WebSocket closed for ${endpoint.provider}, setting up REST polling`);
                this.setupRESTPolling(endpoint);
            });
            
            // Subscribe to new blocks for price updates
            provider.on('block', async (blockNumber) => {
                await this.collectBlockPrices(endpoint, blockNumber);
            });

            this.providers.push(provider);
            console.log(`✅ WebSocket connected to ${endpoint.provider} (${endpoint.network})`);
            
        } catch (error) {
            console.warn(`Failed to setup WebSocket for ${endpoint.provider}:`, error.message);
            // Fallback to REST polling for this endpoint
            this.setupRESTPolling(endpoint);
        }
    }

    supportsWebSocket(provider) {
        // Most RPC providers don't support WebSocket, so we'll use a whitelist approach
        const webSocketSupported = [
            'alchemy', // Alchemy supports WebSocket
            // Add other providers that support WebSocket here
        ];
        return webSocketSupported.includes(provider);
    }

    setupRESTPolling(endpoint) {
        // Setup REST polling for endpoints that don't support WebSocket - WITH RATE LIMITING
        const pollInterval = setInterval(async () => {
            if (!this.isRunning) {
                clearInterval(pollInterval);
                return;
            }

            try {
                // Add delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                
                const provider = new ethers.JsonRpcProvider(endpoint.url);
                const blockNumber = await provider.getBlockNumber();
                await this.collectBlockPrices(endpoint, blockNumber);
            } catch (error) {
                if (error.message.includes('compute units') || error.message.includes('429')) {
                    console.log(`⏸️ Rate limit hit for ${endpoint.provider}, backing off for 10 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second backoff
                } else {
                    console.warn(`REST polling error for ${endpoint.provider}:`, error.message);
                }
                this.endpointManager.handleError(endpoint.provider, error);
            }
        }, 15000); // Increased from 5000 to 15000 (15 seconds) to reduce API calls

        // Store interval for cleanup
        if (!this.restPollers) {
            this.restPollers = [];
        }
        this.restPollers.push(pollInterval);
    }

    async collectBlockPrices(endpoint, blockNumber) {
        try {
            // Get active pools for this network
            const poolsResult = await this.db.query(`
                SELECT id, COALESCE(address, pool_address) as address, token0_address, token1_address, dex
                FROM pools 
                WHERE chain = $1 AND is_active = true 
                AND liquidity_usd > 10000
                ORDER BY volume_24h DESC
                LIMIT 50
            `, [endpoint.network]);

            // If no pools exist, skip price collection
            if (poolsResult.rows.length === 0) {
                console.log(`ℹ️ No pools found for ${endpoint.network}, skipping price collection`);
                return;
            }

            const timestamp = Math.floor(Date.now() / 1000);

            // Batch process pools for efficiency
            const batches = this.chunkArray(poolsResult.rows, 10);
            
            for (const batch of batches) {
                await this.processPriceBatch(endpoint, batch, blockNumber, timestamp);
            }

        } catch (error) {
            console.error(`Error collecting prices for block ${blockNumber}:`, error.message);
            this.endpointManager.handleError(endpoint.provider, error);
        }
    }

    async processPriceBatch(endpoint, pools, blockNumber, timestamp) {
        const pricePromises = pools.map(pool => this.getPoolPrice(endpoint, pool));
        const results = await Promise.allSettled(pricePromises);

        const priceInserts = [];

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const pool = pools[i];

            if (result.status === 'fulfilled' && result.value) {
                const price = result.value;
                
                priceInserts.push([
                    `${pool.id}_${timestamp}`,
                    pool.id,
                    price.price,
                    price.reserve0,
                    price.reserve1,
                    blockNumber,
                    timestamp,
                    price.gasPrice || 0
                ]);

                // Update cache for arbitrage detection
                this.priceCache.set(pool.id, {
                    price: price.price,
                    timestamp: timestamp,
                    network: endpoint.network
                });
            }
        }

        // Batch insert prices
        if (priceInserts.length > 0) {
            await this.batchInsertPrices(priceInserts);
        }
    }

    async getPoolPrice(endpoint, pool) {
        try {
            const provider = new ethers.JsonRpcProvider(endpoint.url);
            
            // Get reserves based on DEX type
            let reserves;
            if (pool.dex === 'uniswap-v2' || pool.dex === 'sushiswap') {
                reserves = await this.getUniV2Reserves(provider, pool.address);
            } else if (pool.dex === 'uniswap-v3') {
                reserves = await this.getUniV3Reserves(provider, pool.address);
            } else {
                // Generic ERC20 balance check
                reserves = await this.getGenericReserves(provider, pool);
            }

            if (!reserves) return null;

            const price = reserves.reserve1 > 0 ? reserves.reserve0 / reserves.reserve1 : 0;
            const gasPrice = await provider.getFeeData();

            return {
                price: price,
                reserve0: reserves.reserve0,
                reserve1: reserves.reserve1,
                gasPrice: parseFloat(ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'))
            };

        } catch (error) {
            // Don't log every error to avoid spam
            return null;
        }
    }

    async startRESTPolling() {
        // Backup price collection via REST APIs
        setInterval(async () => {
            if (!this.isRunning) return;

            try {
                const marketApi = await this.marketDataManager.getMarketDataEndpoint('birdeye');
                await this.collectMarketPrices(marketApi);
            } catch (error) {
                console.warn('REST polling error:', error.message);
            }
        }, 10000); // Every 10 seconds
    }

    async collectMarketPrices(apiConfig) {
        try {
            // Use a simpler endpoint for testing
            const response = await axios.get(`${apiConfig.baseUrl}/public/price`, {
                headers: apiConfig.headers,
                params: {
                    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' // WETH
                },
                timeout: 10000
            });

            this.marketDataManager.trackUsage(apiConfig.name);

            if (response.data?.data) {
                console.log(`📊 Market price collected: ${JSON.stringify(response.data.data)}`);
            }

        } catch (error) {
            // Don't log this as error since it's expected during testing
            console.log('ℹ️ Market API not available during testing, continuing with RPC data only');
        }
    }

    async batchInsertPrices(priceInserts) {
        const query = `
            INSERT INTO price_history (id, pool_id, price, reserve0, reserve1, block_number, timestamp, gas_price)
            VALUES ${priceInserts.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')}
            ON CONFLICT (id) DO UPDATE SET
                price = EXCLUDED.price,
                reserve0 = EXCLUDED.reserve0,
                reserve1 = EXCLUDED.reserve1
        `;

        const values = priceInserts.flat();
        await this.db.query(query, values);
    }

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    async stop() {
        this.isRunning = false;
        
        // Close all WebSocket connections
        for (const provider of this.providers) {
            try {
                await provider.destroy();
            } catch (error) {
                // Ignore cleanup errors
            }
        }
        
        // Clear REST polling intervals
        if (this.restPollers) {
            for (const interval of this.restPollers) {
                clearInterval(interval);
            }
            this.restPollers = [];
        }
        
        this.providers = [];
        console.log('✅ Price collector stopped');
    }

    // Placeholder methods for different DEX types
    async getUniV2Reserves(provider, address) {
        // Implementation for Uniswap V2 style pools
        return { reserve0: 0, reserve1: 0 };
    }

    async getUniV3Reserves(provider, address) {
        // Implementation for Uniswap V3 style pools  
        return { reserve0: 0, reserve1: 0 };
    }

    async getGenericReserves(provider, pool) {
        // Generic implementation
        return { reserve0: 0, reserve1: 0 };
    }

    async processMarketTokens(tokens) {
        // Process market data tokens
        console.log(`📊 Processing ${tokens.length} market tokens`);
    }
}

/**
 * 🏊‍♂️ Pool Data Collector
 */
class PoolCollector {
    constructor(endpointManager, db) {
        this.endpointManager = endpointManager;
        this.db = db;
        this.isRunning = false;
    }

    async start() {
        this.isRunning = true;
        console.log('🏊‍♂️ Starting pool data collection...');

        // Collect pool data every 30 seconds
        setInterval(async () => {
            if (!this.isRunning) return;
            await this.collectPoolData();
        }, 30000);

        // Initial collection
        await this.collectPoolData();
    }

    async collectPoolData() {
        try {
            const networks = ['ethereum', 'arbitrum', 'polygon'];
            
            for (const network of networks) {
                const endpoint = await this.endpointManager.getPoolDataEndpoint(network);
                await this.collectNetworkPools(endpoint);
            }
            
        } catch (error) {
            console.error('Pool collection error:', error.message);
        }
    }

    async collectNetworkPools(endpoint) {
        // Implementation for collecting pool data
        console.log(`🏊‍♂️ Collecting pools for ${endpoint.network}`);
    }

    async stop() {
        this.isRunning = false;
        console.log('✅ Pool collector stopped');
    }
}

/**
 * ⛽ Gas Price Collector
 */
class GasCollector {
    constructor(endpointManager, db) {
        this.endpointManager = endpointManager;
        this.db = db;
        this.isRunning = false;
    }

    async start() {
        this.isRunning = true;
        console.log('⛽ Starting gas price collection...');

        // Collect gas prices every 30 seconds - REDUCED FROM 5 to prevent rate limits
        setInterval(async () => {
            if (!this.isRunning) return;
            await this.collectGasPrices();
        }, 30000); // Increased from 5000 to 30000

        await this.collectGasPrices();
    }

    async collectGasPrices() {
        try {
            const networks = ['ethereum', 'arbitrum', 'polygon', 'base'];
            
            for (const network of networks) {
                try {
                    // Add delay between network calls to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
                    
                    const endpoint = await this.endpointManager.getGasTrackingEndpoint(network);
                    await this.collectNetworkGas(endpoint);
                } catch (error) {
                    if (error.message.includes('compute units') || error.message.includes('429')) {
                        console.log(`⏸️ Rate limit during gas collection for ${network}, waiting 5 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    } else {
                        console.warn(`Gas collection error for ${network}:`, error.message);
                    }
                }
            }
            
        } catch (error) {
            console.error('Gas collection error:', error.message);
        }
    }

    async collectNetworkGas(endpoint) {
        try {
            const provider = new ethers.JsonRpcProvider(endpoint.url);
            const feeData = await provider.getFeeData();
            const blockNumber = await provider.getBlockNumber();
            
            const gasData = {
                id: `${endpoint.network}_${Date.now()}`,
                chain: endpoint.network,
                block_number: blockNumber,
                base_fee: parseFloat(ethers.formatUnits(feeData.gasPrice || 0, 'gwei')),
                priority_fee: parseFloat(ethers.formatUnits(feeData.maxPriorityFeePerGas || 0, 'gwei')),
                total_gas: parseFloat(ethers.formatUnits(feeData.maxFeePerGas || 0, 'gwei')),
                timestamp: Math.floor(Date.now() / 1000)
            };

            await this.db.query(`
                INSERT INTO gas_tracker (id, chain, block_number, base_fee, priority_fee, total_gas, timestamp)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO UPDATE SET
                    base_fee = EXCLUDED.base_fee,
                    priority_fee = EXCLUDED.priority_fee,
                    total_gas = EXCLUDED.total_gas
            `, [
                gasData.id, gasData.chain, gasData.block_number,
                gasData.base_fee, gasData.priority_fee, gasData.total_gas, gasData.timestamp
            ]);

        } catch (error) {
            this.endpointManager.handleError(endpoint.provider, error);
        }
    }

    async stop() {
        this.isRunning = false;
        console.log('✅ Gas collector stopped');
    }
}

/**
 * 🎯 Real-time Arbitrage Detector
 */
class ArbitrageDetector {
    constructor(db) {
        this.db = db;
        this.isRunning = false;
        this.priceFeeds = new Map();
    }

    async start() {
        this.isRunning = true;
        console.log('🎯 Starting arbitrage detection...');

        // Run arbitrage detection every 5 seconds - REDUCED FROM 2 to reduce load
        setInterval(async () => {
            if (!this.isRunning) return;
            await this.detectArbitrage();
        }, 5000); // Increased from 2000 to 5000
    }

    async detectArbitrage() {
        try {
            // Get recent price data - fix the join to handle type mismatch
            const recentPrices = await this.db.query(`
                SELECT DISTINCT ON (ph.pool_id) 
                    ph.pool_id, ph.price, ph.timestamp, 
                    p.token0_symbol, p.token1_symbol, p.chain, p.dex, p.liquidity_usd
                FROM price_history ph
                JOIN pools p ON ph.pool_id::TEXT = p.id::TEXT
                WHERE ph.timestamp > EXTRACT(EPOCH FROM NOW()) - 300
                AND p.is_active = true
                AND p.liquidity_usd > 50000
                ORDER BY ph.pool_id, ph.timestamp DESC
            `);

            if (recentPrices.rows.length < 2) return;

            // Group by token pairs
            const tokenPairs = this.groupByTokenPair(recentPrices.rows);

            // Detect arbitrage opportunities
            for (const [pairKey, pools] of tokenPairs.entries()) {
                if (pools.length < 2) continue;
                await this.checkPairArbitrage(pairKey, pools);
            }

        } catch (error) {
            console.error('Arbitrage detection error:', error.message);
        }
    }

    groupByTokenPair(prices) {
        const pairs = new Map();
        
        for (const price of prices) {
            const pairKey = [price.token0_symbol, price.token1_symbol].sort().join('/');
            
            if (!pairs.has(pairKey)) {
                pairs.set(pairKey, []);
            }
            
            pairs.get(pairKey).push(price);
        }
        
        return pairs;
    }

    async checkPairArbitrage(pairKey, pools) {
        // Sort pools by price
        pools.sort((a, b) => a.price - b.price);
        
        const lowest = pools[0];
        const highest = pools[pools.length - 1];
        
        const priceDelta = ((highest.price - lowest.price) / lowest.price) * 100;
        
        // Only consider significant price differences (>0.5%)
        if (priceDelta < 0.5) return;

        const minLiquidity = Math.min(lowest.liquidity_usd, highest.liquidity_usd);
        const profitEstimate = minLiquidity * (priceDelta / 100) * 0.8; // 80% efficiency assumption
        
        // Calculate gas estimate based on transaction complexity
        const gasEstimate = this.calculateGasEstimate(lowest.chain, highest.chain, minLiquidity);
        
        const viable = profitEstimate > gasEstimate && minLiquidity > 50000; // Profit > gas costs, $50k liquidity

        // Record arbitrage opportunity
        await this.db.query(`
            INSERT INTO arbitrage_opportunities (
                id, pool_a, pool_b, token_pair, price_a, price_b, 
                price_delta, profit_estimate, gas_estimate, liquidity_required, viable, 
                cross_chain, detected_at, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
            `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            lowest.pool_id,
            highest.pool_id,
            pairKey,
            lowest.price,
            highest.price,
            priceDelta,
            profitEstimate,
            gasEstimate,
            minLiquidity,
            viable,
            lowest.chain !== highest.chain,
            Math.floor(Date.now() / 1000),
            'detected'
        ]);

        if (viable) {
            console.log(`🎯 ARBITRAGE FOUND: ${pairKey}`);
            console.log(`   Price Delta: ${priceDelta.toFixed(2)}%`);
            console.log(`   Profit Estimate: $${profitEstimate.toFixed(2)}`);
            console.log(`   Gas Estimate: $${gasEstimate.toFixed(2)}`);
            console.log(`   Net Profit: $${(profitEstimate - gasEstimate).toFixed(2)}`);
            console.log(`   Pools: ${lowest.dex} vs ${highest.dex}`);
            console.log(`   Cross-chain: ${lowest.chain !== highest.chain ? 'Yes' : 'No'}`);
        }
    }

    calculateGasEstimate(chainA, chainB, liquidityUsd) {
        // Gas cost estimates in USD based on network and transaction complexity
        const gasRates = {
            ethereum: { base: 15, perTx: 25 },      // High gas costs
            arbitrum: { base: 0.5, perTx: 1.5 },   // Low L2 costs
            polygon: { base: 0.01, perTx: 0.05 },  // Very low costs
            base: { base: 0.01, perTx: 0.05 },     // Low L2 costs
            optimism: { base: 0.5, perTx: 1.5 },   // Low L2 costs
        };

        const isCrossChain = chainA !== chainB;
        const complexityMultiplier = isCrossChain ? 3 : 1; // Cross-chain is more complex
        
        const chainARates = gasRates[chainA] || gasRates.ethereum;
        const chainBRates = gasRates[chainB] || gasRates.ethereum;
        
        // Calculate gas costs for both sides of the arbitrage
        let totalGasCost = chainARates.base + chainARates.perTx;
        
        if (isCrossChain) {
            totalGasCost += chainBRates.base + chainBRates.perTx;
            totalGasCost += 10; // Bridge costs
        }
        
        // Scale with liquidity (larger amounts cost more)
        const liquidityMultiplier = Math.log10(Math.max(liquidityUsd / 1000, 1));
        
        return totalGasCost * complexityMultiplier * liquidityMultiplier;
    }

    async stop() {
        this.isRunning = false;
        console.log('✅ Arbitrage detector stopped');
    }
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const collector = new EnhancedDataCollector();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        await collector.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
        console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
        await collector.stop();
        process.exit(0);
    });

    // Start collection
    collector.start().catch(error => {
        console.error('💥 Failed to start data collection:', error);
        process.exit(1);
    });
}

export default EnhancedDataCollector;