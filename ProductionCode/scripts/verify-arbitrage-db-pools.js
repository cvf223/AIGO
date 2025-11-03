#!/usr/bin/env node

import pkg from 'pg';
const { Pool } = pkg;

async function verifyPools() {
    console.log('🔍 ===== VERIFYING ARBITRAGE_DB POOLS =====');
    
    // Use the exact same connection as migration
    const db = new Pool({
        connectionString: 'postgres://postgres:postgres@localhost:5432/arbitrage_db'
    });
    
    try {
        console.log('📊 Connecting to arbitrage_db...');
        
        const totalCount = await db.query('SELECT COUNT(*) FROM pools');
        console.log(`📊 Total pools: ${totalCount.rows[0].count}`);
        
        if (parseInt(totalCount.rows[0].count) > 0) {
            // Show breakdown by chain
            const chainBreakdown = await db.query(`
                SELECT chain, COUNT(*) as count, 
                       ROUND(SUM(liquidity_usd)::numeric, 0) as total_liquidity
                FROM pools 
                GROUP BY chain 
                ORDER BY count DESC
            `);
            
            console.log('\\n🔗 Pools by chain:');
            chainBreakdown.rows.forEach(row => {
                console.log(`   • ${row.chain}: ${row.count} pools | $${row.total_liquidity} liquidity`);
            });
            
            // Check Arbitrum specifically
            const arbitrumCount = await db.query(`
                SELECT COUNT(*) FROM pools 
                WHERE chain = 'arbitrum' AND is_active = true AND liquidity_usd > 10000
            `);
            console.log(`\\n🎯 Active Arbitrum pools >$10k: ${arbitrumCount.rows[0].count}`);
            
            // Show sample Arbitrum pools
            const samplePools = await db.query(`
                SELECT address, dex, token0_symbol, token1_symbol, 
                       ROUND(liquidity_usd::numeric, 0) as liquidity
                FROM pools 
                WHERE chain = 'arbitrum' AND is_active = true
                ORDER BY liquidity_usd DESC
                LIMIT 5
            `);
            
            console.log('\\n📋 Top 5 Arbitrum pools:');
            samplePools.rows.forEach(pool => {
                console.log(`   • ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex}`);
                console.log(`     💧 Liquidity: $${pool.liquidity.toLocaleString()}`);
                console.log(`     📍 ${pool.address.slice(0, 12)}...`);
            });
            
            console.log('\\n✅ POOLS ARE ACCESSIBLE! Your MEV system should work now.');
        } else {
            console.log('❌ No pools found!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await db.end();
    }
}

verifyPools(); 