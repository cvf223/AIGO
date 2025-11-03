#!/usr/bin/env node

/**
 * Add Test Pool Data for Arbitrage System Testing
 * 
 * This script adds some basic pool data to test the arbitrage system
 */

import pkg from 'pg';
const { Pool } = pkg;

const db = new Pool({
    connectionString: process.env.DATABASE_URL
});

const testPools = [
    // ETHEREUM POOLS
    {
        address: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        dex: 'uniswap-v3',
        chain: 'ethereum',
        chain_id: 1,
        token0_address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        token0_symbol: 'WETH',
        token0_decimals: 18,
        token1_address: '0xA0b86a33E6441b01c7e4e35B0f4C6B36f2A73b5a',
        token1_symbol: 'USDC',
        token1_decimals: 6,
        fee: 500,
        reserve0: 1000.0,
        reserve1: 3500000.0,
        liquidity_usd: 7000000.0,
        volume_24h: 50000000.0,
        is_active: true,
        data_quality_score: 95.0
    },
    
    // ARBITRUM POOLS
    {
        address: '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443',
        dex: 'uniswap-v3',
        chain: 'arbitrum',
        chain_id: 42161,
        token0_address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        token0_symbol: 'WETH',
        token0_decimals: 18,
        token1_address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
        token1_symbol: 'USDC',
        token1_decimals: 6,
        fee: 500,
        reserve0: 800.0,
        reserve1: 2800000.0,
        liquidity_usd: 5600000.0,
        volume_24h: 30000000.0,
        is_active: true,
        data_quality_score: 90.0
    },
    
    // POLYGON POOLS
    {
        address: '0x45dDa9cb7c25131DF268515131f647d726f50608',
        dex: 'uniswap-v3',
        chain: 'polygon',
        chain_id: 137,
        token0_address: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        token0_symbol: 'WETH',
        token0_decimals: 18,
        token1_address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        token1_symbol: 'USDC',
        token1_decimals: 6,
        fee: 500,
        reserve0: 600.0,
        reserve1: 2100000.0,
        liquidity_usd: 4200000.0,
        volume_24h: 20000000.0,
        is_active: true,
        data_quality_score: 85.0
    },
    
    // 🟦 BASE NETWORK POOLS (Coinbase's L2)
    {
        address: '0xd0b53D9277642d899DF5C87A3966A349A798F224',
        dex: 'uniswap-v3',
        chain: 'base',
        chain_id: 8453,
        token0_address: '0x4200000000000000000000000000000000000006', // WETH on Base
        token0_symbol: 'WETH',
        token0_decimals: 18,
        token1_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        token1_symbol: 'USDC',
        token1_decimals: 6,
        fee: 500,
        reserve0: 450.0,
        reserve1: 1575000.0,
        liquidity_usd: 3150000.0,
        volume_24h: 15000000.0,
        is_active: true,
        data_quality_score: 88.0
    },
    
    // BASE - Additional pool for arbitrage opportunities
    {
        address: '0x4C36388bE6F416A29C8d8Eee81C771cE6bE14B18',
        dex: 'aerodrome',
        chain: 'base',
        chain_id: 8453,
        token0_address: '0x4200000000000000000000000000000000000006', // WETH on Base
        token0_symbol: 'WETH',
        token0_decimals: 18,
        token1_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        token1_symbol: 'USDC',
        token1_decimals: 6,
        fee: 300,
        reserve0: 420.0,
        reserve1: 1470000.0,
        liquidity_usd: 2940000.0,
        volume_24h: 12000000.0,
        is_active: true,
        data_quality_score: 82.0
    }
];

async function addTestPools() {
    try {
        console.log('🏊‍♂️ Adding test pools for arbitrage system...');

        for (const pool of testPools) {
            await db.query(`
                INSERT INTO pools (
                    pool_address, dex, chain, chain_id, token0_address, token0_symbol, token0_decimals,
                    token1_address, token1_symbol, token1_decimals, fee, reserve0, reserve1,
                    liquidity_usd, volume_24h, is_active, data_quality_score, last_updated, address
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $1
                ) ON CONFLICT (pool_address) DO UPDATE SET
                    reserve0 = EXCLUDED.reserve0,
                    reserve1 = EXCLUDED.reserve1,
                    liquidity_usd = EXCLUDED.liquidity_usd,
                    volume_24h = EXCLUDED.volume_24h,
                    last_updated = EXCLUDED.last_updated,
                    address = EXCLUDED.address
            `, [
                pool.address, pool.dex, pool.chain, pool.chain_id,
                pool.token0_address, pool.token0_symbol, pool.token0_decimals,
                pool.token1_address, pool.token1_symbol, pool.token1_decimals,
                pool.fee, pool.reserve0, pool.reserve1, pool.liquidity_usd,
                pool.volume_24h, pool.is_active, pool.data_quality_score,
                Math.floor(Date.now() / 1000)
            ]);

            console.log(`✅ Added ${pool.chain} ${pool.token0_symbol}/${pool.token1_symbol} pool`);
        }

        // Verify pools were added
        const result = await db.query('SELECT COUNT(*) as count FROM pools');
        console.log(`\n📊 Total pools in database: ${result.rows[0].count}`);

        console.log('\n🎉 Test pools added successfully!');
        console.log('💡 You can now run the arbitrage system with test data');

    } catch (error) {
        console.error('❌ Failed to add test pools:', error.message);
        process.exit(1);
    } finally {
        await db.end();
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    addTestPools();
}

export default addTestPools; 