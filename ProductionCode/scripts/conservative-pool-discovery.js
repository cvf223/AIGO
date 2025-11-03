// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🐌 Conservative Pool Discovery - Slow But Steady Pool Discovery
 * 
 * This script discovers pools gradually while respecting API rate limits
 * Perfect for free tier RPC endpoints
 */

import pkg from 'pg';
const { Pool } = pkg;
import { ethers } from 'ethers';

class ConservativePoolDiscovery {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        this.stats = {
            attempted: 0,
            found: 0,
            added: 0,
            skipped: 0,
            errors: 0
        };

        // Use environment variables or fallbacks
        this.rpcEndpoints = {
            ethereum: process.env.ETHEREUM_RPC || 'https://eth.public-rpc.com',
            arbitrum: process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
            polygon: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
            base: process.env.BASE_RPC || 'https://mainnet.base.org'
        };
    }

    async discoverPoolsSlowly() {
        console.log('🐌 Starting Conservative Pool Discovery...');
        console.log('📡 Working within API rate limits...');
        
        // Start with most popular pairs on each network
        const priorityPairs = this.getPriorityTokenPairs();
        
        for (const [networkName, pairs] of Object.entries(priorityPairs)) {
            console.log(`\n🌐 Discovering ${networkName.toUpperCase()} pools...`);
            
            try {
                await this.discoverNetworkPools(networkName, pairs);
                
                // Cool down between networks
                console.log(`   ⏸️ Network complete. Cooling down 15 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 15000));
                
            } catch (error) {
                console.error(`❌ ${networkName} discovery failed:`, error.message);
            }
        }

        await this.showResults();
    }

    getPriorityTokenPairs() {
        // Focus on the most liquid and popular pairs first
        return {
            ethereum: [
                { name: 'WETH/USDC', token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', token1: '0xA0b86a33E6441b01c7e4e35B0f4C6B36f2A73b5a' },
                { name: 'WETH/USDT', token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
                { name: 'WETH/DAI', token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', token1: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
                { name: 'WBTC/WETH', token0: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
                { name: 'USDC/USDT', token0: '0xA0b86a33E6441b01c7e4e35B0f4C6B36f2A73b5a', token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
                { name: 'UNI/WETH', token0: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
                { name: 'LINK/WETH', token0: '0x514910771AF9Ca656af840dff83E8264EcF986CA', token1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }
            ],
            arbitrum: [
                { name: 'WETH/USDC', token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', token1: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' },
                { name: 'WETH/USDT', token0: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', token1: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' },
                { name: 'WBTC/WETH', token0: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', token1: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
                { name: 'ARB/WETH', token0: '0x912CE59144191C1204E64559FE8253a0e49E6548', token1: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1' },
                { name: 'USDC/USDT', token0: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', token1: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' }
            ],
            polygon: [
                { name: 'WETH/USDC', token0: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', token1: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
                { name: 'WETH/USDT', token0: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
                { name: 'WMATIC/USDC', token0: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', token1: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
                { name: 'WBTC/WETH', token0: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', token1: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619' },
                { name: 'USDC/USDT', token0: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', token1: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' }
            ],
            base: [
                { name: 'WETH/USDC', token0: '0x4200000000000000000000000000000000000006', token1: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
                { name: 'WETH/DAI', token0: '0x4200000000000000000000000000000000000006', token1: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb' },
                { name: 'USDC/USDbC', token0: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', token1: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA' },
                { name: 'CBETH/WETH', token0: '0x2Ae3F1Ec7F1F5012CFEab0185bfc7aa3cf0DEc22', token1: '0x4200000000000000000000000000000000000006' }
            ]
        };
    }

    async discoverNetworkPools(networkName, tokenPairs) {
        const rpcUrl = this.rpcEndpoints[networkName];
        if (!rpcUrl) {
            console.log(`   ⚠️ No RPC URL for ${networkName}, skipping...`);
            return;
        }

        console.log(`   🔗 Using RPC: ${rpcUrl.substring(0, 50)}...`);
        
        // Conservative provider with timeout
        const provider = new ethers.JsonRpcProvider(rpcUrl, null, { timeout: 30000 });
        
        // Uniswap V3 Factory addresses
        const factoryAddresses = {
            ethereum: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
            arbitrum: '0x1F98431c8aD98523631AE4a59f267346ea31F984', 
            polygon: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
            base: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD'
        };

        const factoryAddress = factoryAddresses[networkName];
        const factoryABI = ['function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'];
        
        try {
            const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
            
            for (const pair of tokenPairs) {
                console.log(`   🔍 Checking ${pair.name}...`);
                
                await this.findPoolsForPair(factory, pair, networkName, provider);
                
                // Mandatory delay between pairs
                console.log(`      ⏸️ Cooling down 5 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                this.stats.attempted++;
            }
            
        } catch (error) {
            if (error.message.includes('compute units') || error.message.includes('429')) {
                console.log(`   ⏸️ Rate limit hit for ${networkName}, waiting 30 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 30000));
            } else {
                console.error(`   ❌ ${networkName} error:`, error.message);
                this.stats.errors++;
            }
        }
    }

    async findPoolsForPair(factory, pair, networkName, provider) {
        const feeTiers = [500, 3000, 10000]; // 0.05%, 0.3%, 1%
        
        for (const fee of feeTiers) {
            try {
                console.log(`      📊 Checking ${fee/10000}% fee tier...`);
                
                // Add delay before each API call
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const poolAddress = await factory.getPool(pair.token0, pair.token1, fee);
                
                if (poolAddress !== ethers.ZeroAddress) {
                    console.log(`         ✅ Found pool: ${poolAddress}`);
                    this.stats.found++;
                    
                    const poolData = await this.createPoolRecord(poolAddress, pair, fee, networkName, provider);
                    if (poolData) {
                        await this.savePool(poolData);
                    }
                }
                
            } catch (error) {
                if (error.message.includes('compute units') || error.message.includes('429')) {
                    console.log(`         ⏸️ Rate limit, backing off 10 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                } else {
                    // Pool doesn't exist, continue silently
                }
            }
        }
    }

    async createPoolRecord(poolAddress, pair, fee, networkName, provider) {
        try {
            // Get basic pool info with minimal API calls
            const [token0Symbol, token1Symbol] = pair.name.split('/');
            
            return {
                pool_address: poolAddress,
                dex: 'uniswap-v3',
                chain: networkName,
                chain_id: this.getChainId(networkName),
                token0_address: pair.token0,
                token0_symbol: token0Symbol,
                token0_decimals: 18, // Default to 18, will be updated later
                token1_address: pair.token1,
                token1_symbol: token1Symbol,
                token1_decimals: token1Symbol === 'USDC' || token1Symbol === 'USDT' ? 6 : 18,
                fee: fee,
                reserve0: 0, // Will be populated by price collector
                reserve1: 0,
                liquidity_usd: this.estimateLiquidity(token0Symbol, token1Symbol), // Rough estimate
                volume_24h: 0, // Will be updated later
                is_active: true,
                data_quality_score: 75.0 // Lower since it's estimated data
            };
            
        } catch (error) {
            console.warn(`         ⚠️ Error creating pool record:`, error.message);
            return null;
        }
    }

    getChainId(networkName) {
        const chainIds = { ethereum: 1, arbitrum: 42161, polygon: 137, base: 8453 };
        return chainIds[networkName] || 1;
    }

    estimateLiquidity(symbol0, symbol1) {
        // Rough liquidity estimates based on popularity
        const popularPairs = {
            'WETH/USDC': 50000000,
            'WETH/USDT': 30000000,
            'WBTC/WETH': 20000000,
            'USDC/USDT': 15000000
        };
        
        const pairKey = `${symbol0}/${symbol1}`;
        return popularPairs[pairKey] || popularPairs[`${symbol1}/${symbol0}`] || 5000000;
    }

    async savePool(poolData) {
        try {
            await this.db.query(`
                INSERT INTO pools (
                    pool_address, dex, chain, chain_id, token0_address, token0_symbol, token0_decimals,
                    token1_address, token1_symbol, token1_decimals, fee, reserve0, reserve1,
                    liquidity_usd, volume_24h, is_active, data_quality_score, last_updated, address
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $1
                ) ON CONFLICT (pool_address) DO UPDATE SET
                    liquidity_usd = EXCLUDED.liquidity_usd,
                    last_updated = EXCLUDED.last_updated
            `, [
                poolData.pool_address, poolData.dex, poolData.chain, poolData.chain_id,
                poolData.token0_address, poolData.token0_symbol, poolData.token0_decimals,
                poolData.token1_address, poolData.token1_symbol, poolData.token1_decimals,
                poolData.fee, poolData.reserve0, poolData.reserve1, poolData.liquidity_usd,
                poolData.volume_24h, poolData.is_active, poolData.data_quality_score,
                Math.floor(Date.now() / 1000)
            ]);

            console.log(`         💾 Saved ${poolData.token0_symbol}/${poolData.token1_symbol} ($${(poolData.liquidity_usd/1000000).toFixed(1)}M)`);
            this.stats.added++;
            
        } catch (error) {
            if (error.message.includes('duplicate key')) {
                console.log(`         ⏭️ Pool already exists, skipped`);
                this.stats.skipped++;
            } else {
                console.error(`         ❌ Failed to save pool:`, error.message);
                this.stats.errors++;
            }
        }
    }

    async showResults() {
        console.log('\n🎉 Conservative Pool Discovery Complete!');
        console.log('=' .repeat(50));
        console.log(`📊 Discovery Statistics:`);
        console.log(`   Pairs Attempted: ${this.stats.attempted}`);
        console.log(`   Pools Found: ${this.stats.found}`);
        console.log(`   Pools Added: ${this.stats.added}`);
        console.log(`   Pools Skipped: ${this.stats.skipped} (duplicates)`);
        console.log(`   Errors: ${this.stats.errors}`);
        
        // Show current pool count
        const result = await this.db.query(`
            SELECT chain, COUNT(*) as count, SUM(liquidity_usd) as total_liquidity
            FROM pools 
            WHERE is_active = true
            GROUP BY chain
            ORDER BY total_liquidity DESC
        `);

        console.log('\n📊 Updated Pool Coverage:');
        let totalPools = 0;
        let totalLiquidity = 0;
        
        for (const row of result.rows) {
            console.log(`   ${row.chain.padEnd(10)}: ${row.count.toString().padStart(3)} pools ($${(row.total_liquidity/1000000).toFixed(1)}M)`);
            totalPools += parseInt(row.count);
            totalLiquidity += parseFloat(row.total_liquidity);
        }
        
        console.log(`\n🎯 TOTAL: ${totalPools} pools monitoring $${(totalLiquidity/1000000).toFixed(1)}M liquidity`);
        console.log(`\n🚀 Ready for enhanced arbitrage detection!`);
    }

    async cleanup() {
        await this.db.end();
    }
}

// Run discovery
if (import.meta.url === `file://${process.argv[1]}`) {
    const discovery = new ConservativePoolDiscovery();
    
    discovery.discoverPoolsSlowly()
        .then(() => {
            console.log('\n✅ Pool discovery completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Pool discovery failed:', error);
            process.exit(1);
        })
        .finally(() => {
            discovery.cleanup();
        });
}

export default ConservativePoolDiscovery; 