#!/usr/bin/env node

/**
 * 🔍 Check Arbitrum Pool Discovery Progress
 * 
 * Shows current progress of long-running discovery scans
 * Displays which blocks have been processed and how many pools found
 */

import pkg from 'pg';
const { Pool } = pkg;

class ProgressChecker {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async checkProgress() {
        console.log('🔍 Checking Pool Discovery Progress...\n');

        // Get scan progress
        const progressResult = await this.db.query(`
            SELECT dex_name, current_block, end_block, total_events, 
                   pools_found, pools_added, updated_at,
                   CAST(CAST(current_block AS NUMERIC) / CAST(end_block AS NUMERIC) * 100 AS DECIMAL(5,2)) as completion_percent
            FROM scan_progress 
            WHERE chain = 'arbitrum'
            ORDER BY updated_at DESC
        `);

        if (progressResult.rows.length === 0) {
            console.log('❌ No scan progress found. Discovery not started yet?');
            return;
        }

        console.log('📊 DEX Scanning Progress:');
        console.log('=' .repeat(80));
        
        let totalEvents = 0;
        let totalPoolsAdded = 0;
        
        for (const row of progressResult.rows) {
            const lastUpdate = new Date(row.updated_at).toLocaleString();
            console.log(`🏭 ${row.dex_name.toUpperCase().padEnd(15)} | ${row.completion_percent.toString().padStart(6)}% | Block ${row.current_block.toLocaleString().padStart(10)} | ${row.pools_added.toString().padStart(3)} pools | ${lastUpdate}`);
            totalEvents += parseInt(row.total_events);
            totalPoolsAdded += parseInt(row.pools_added);
        }

        console.log('=' .repeat(80));
        console.log(`📈 TOTALS: ${totalEvents.toLocaleString()} events scanned | ${totalPoolsAdded} new pools added`);

        // Get overall pool stats
        const poolsResult = await this.db.query(`
            SELECT dex, COUNT(*) as count, 
                   CAST(AVG(liquidity_usd) AS DECIMAL(15,0)) as avg_liquidity,
                   SUM(liquidity_usd) as total_liquidity
            FROM pools 
            WHERE chain = 'arbitrum' AND is_active = true
            GROUP BY dex
            ORDER BY total_liquidity DESC
        `);

        console.log('\n💰 Current Pool Coverage:');
        console.log('=' .repeat(60));
        
        let totalPools = 0;
        let totalLiquidity = 0;
        
        for (const row of poolsResult.rows) {
            console.log(`${row.dex.padEnd(15)}: ${row.count.toString().padStart(3)} pools | $${(row.total_liquidity/1000000).toFixed(1).padStart(6)}M liquidity`);
            totalPools += parseInt(row.count);
            totalLiquidity += parseFloat(row.total_liquidity);
        }
        
        console.log('=' .repeat(60));
        console.log(`🎯 TOTAL: ${totalPools} pools monitoring $${(totalLiquidity/1000000).toFixed(1)}M liquidity`);

        // Show recent discoveries
        const recentResult = await this.db.query(`
            SELECT pool_address, dex, token0_symbol, token1_symbol, 
                   liquidity_usd, last_updated
            FROM pools 
            WHERE chain = 'arbitrum' 
            ORDER BY last_updated DESC 
            LIMIT 10
        `);

        if (recentResult.rows.length > 0) {
            console.log('\n🆕 Recent Pool Discoveries:');
            console.log('=' .repeat(80));
            for (const row of recentResult.rows) {
                const time = new Date(row.last_updated * 1000).toLocaleString();
                const liquidity = parseFloat(row.liquidity_usd) || 0;
                console.log(`${row.dex.padEnd(12)} | ${row.token0_symbol}/${row.token1_symbol} | $${liquidity.toFixed(0).padStart(8)} | ${time}`);
            }
        }
    }

    async cleanup() {
        await this.db.end();
    }
}

// Run progress check
if (import.meta.url === `file://${process.argv[1]}`) {
    const checker = new ProgressChecker();
    
    checker.checkProgress()
        .then(() => {
            console.log('\n✅ Progress check complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Progress check failed:', error);
            process.exit(1);
        })
        .finally(() => {
            checker.cleanup();
        });
}

export default ProgressChecker; 