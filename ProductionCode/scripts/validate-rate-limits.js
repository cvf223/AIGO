// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🧪 Rate Limit Validation - Test System with Optimized Settings
 * 
 * This script validates that the system works properly with rate limiting
 */

import pkg from 'pg';
const { Pool } = pkg;
import { ethers } from 'ethers';

class RateLimitValidator {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
        
        this.testCount = 0;
        this.successCount = 0;
        this.errorCount = 0;
    }

    async validateSystem() {
        console.log('🧪 Validating Rate Limited System...');
        
        try {
            await this.testDatabaseConnection();
            await this.testSlowRPCCalls();
            await this.testPoolQueries();
            await this.showResults();
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
            throw error;
        }
    }

    async testDatabaseConnection() {
        console.log('\n📊 Testing database performance...');
        
        // Test pool count
        const poolResult = await this.db.query('SELECT COUNT(*) as count FROM pools WHERE is_active = true');
        console.log(`✅ Active pools: ${poolResult.rows[0].count}`);
        
        // Test recent price history
        const priceResult = await this.db.query(`
            SELECT COUNT(*) as count, MAX(timestamp) as latest
            FROM price_history 
            WHERE timestamp > EXTRACT(EPOCH FROM NOW()) - 3600
        `);
        console.log(`✅ Recent prices: ${priceResult.rows[0].count} (latest: ${new Date(priceResult.rows[0].latest * 1000).toLocaleTimeString()})`);
        
        this.successCount++;
    }

    async testSlowRPCCalls() {
        console.log('\n🌐 Testing slow RPC calls (respecting rate limits)...');
        
        const endpoints = [
            { name: 'Alchemy Arbitrum', url: process.env.ARBITRUM_RPC },
            { name: 'Infura Ethereum', url: process.env.ETHEREUM_RPC },
            { name: 'Infura Polygon', url: process.env.POLYGON_RPC }
        ];

        for (const endpoint of endpoints) {
            if (!endpoint.url) continue;
            
            try {
                this.testCount++;
                console.log(`   🔄 Testing ${endpoint.name}...`);
                
                // Add deliberate delay to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const provider = new ethers.JsonRpcProvider(endpoint.url);
                const blockNumber = await provider.getBlockNumber();
                
                console.log(`   ✅ ${endpoint.name}: Block ${blockNumber}`);
                this.successCount++;
                
            } catch (error) {
                this.errorCount++;
                if (error.message.includes('compute units') || error.message.includes('429')) {
                    console.log(`   ⚠️ ${endpoint.name}: Rate limited (expected with free tier)`);
                } else {
                    console.log(`   ❌ ${endpoint.name}: ${error.message}`);
                }
            }
        }
    }

    async testPoolQueries() {
        console.log('\n🏊‍♂️ Testing optimized pool queries...');
        
        try {
            // Test the main pool selection query used by the system
            const result = await this.db.query(`
                SELECT chain, COUNT(*) as count, AVG(liquidity_usd) as avg_liquidity
                FROM pools 
                WHERE is_active = true AND liquidity_usd > 10000
                GROUP BY chain
                ORDER BY avg_liquidity DESC
            `);

            console.log('   📊 Pool distribution:');
            for (const row of result.rows) {
                console.log(`      ${row.chain}: ${row.count} pools ($${(row.avg_liquidity/1000000).toFixed(1)}M avg)`);
            }
            
            this.successCount++;
            
        } catch (error) {
            console.error('   ❌ Pool query failed:', error.message);
            this.errorCount++;
        }
    }

    async showResults() {
        console.log('\n🎯 Validation Results:');
        console.log('=' .repeat(40));
        console.log(`✅ Successful tests: ${this.successCount}`);
        console.log(`❌ Failed tests: ${this.errorCount}`);
        console.log(`📊 Success rate: ${((this.successCount / (this.successCount + this.errorCount)) * 100).toFixed(1)}%`);
        
        if (this.errorCount === 0) {
            console.log('\n🎉 All tests passed! System is ready for rate-limited operation.');
        } else if (this.successCount > this.errorCount) {
            console.log('\n⚠️ Some tests failed, but system appears functional. Rate limiting working.');
        } else {
            console.log('\n❌ Multiple failures detected. Check API keys and network connectivity.');
        }
        
        console.log('\n🚀 Next steps:');
        console.log('   1. Run: node scripts/start-arbitrage-system.js');
        console.log('   2. Monitor for "Rate limit hit" messages (these are expected)');
        console.log('   3. System should run without crashes');
    }

    async cleanup() {
        await this.db.end();
    }
}

// Run validation
if (import.meta.url === `file://${process.argv[1]}`) {
    const validator = new RateLimitValidator();
    
    validator.validateSystem()
        .then(() => {
            console.log('\n✅ Validation complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Validation failed:', error);
            process.exit(1);
        })
        .finally(() => {
            validator.cleanup();
        });
}

export default RateLimitValidator; 