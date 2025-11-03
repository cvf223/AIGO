#!/usr/bin/env node

/**
 * Test Arbitrage Detection System
 * 
 * Quick test to verify the arbitrage detection logic works without database errors
 */

import pkg from 'pg';
const { Pool } = pkg;

class ArbitrageDetectorTest {
    constructor() {
        this.db = new Pool({
            connectionString: process.env.DATABASE_URL
        });
    }

    async testArbitrageDetection() {
        try {
            console.log('🎯 Testing Arbitrage Detection...');

            // Test the query that was causing issues
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

            console.log(`📊 Found ${recentPrices.rows.length} recent price records`);

            if (recentPrices.rows.length >= 2) {
                console.log('✅ Sufficient price data for arbitrage detection');
                
                // Test gas estimation
                const gasEstimate = this.calculateGasEstimate('ethereum', 'arbitrum', 100000);
                console.log(`⛽ Gas estimate test: $${gasEstimate.toFixed(2)}`);

                // Test arbitrage opportunity insertion
                await this.testArbitrageInsertion();
                
            } else {
                console.log('⚠️ Insufficient price data - this is expected if no price collection has run');
            }

            console.log('✅ Arbitrage detection test completed successfully');
            
        } catch (error) {
            console.error('❌ Arbitrage detection test failed:', error.message);
            throw error;
        }
    }

    async testArbitrageInsertion() {
        try {
            const testOpportunity = {
                id: `test_arb_${Date.now()}`,
                pool_a: 'test_pool_1',
                pool_b: 'test_pool_2',
                token_pair: 'WETH/USDC',
                price_a: 3500.0,
                price_b: 3518.0,
                price_delta: 0.51,
                profit_estimate: 180.0,
                gas_estimate: 45.0,
                liquidity_required: 100000.0,
                viable: true,
                cross_chain: true,
                detected_at: Math.floor(Date.now() / 1000),
                status: 'test'
            };

            await this.db.query(`
                INSERT INTO arbitrage_opportunities (
                    id, pool_a, pool_b, token_pair, price_a, price_b, 
                    price_delta, profit_estimate, gas_estimate, liquidity_required, viable, 
                    cross_chain, detected_at, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            `, [
                testOpportunity.id, testOpportunity.pool_a, testOpportunity.pool_b,
                testOpportunity.token_pair, testOpportunity.price_a, testOpportunity.price_b,
                testOpportunity.price_delta, testOpportunity.profit_estimate, testOpportunity.gas_estimate,
                testOpportunity.liquidity_required, testOpportunity.viable, testOpportunity.cross_chain,
                testOpportunity.detected_at, testOpportunity.status
            ]);

            console.log('✅ Test arbitrage opportunity inserted successfully');

            // Clean up test data
            await this.db.query('DELETE FROM arbitrage_opportunities WHERE status = $1', ['test']);
            console.log('🧹 Test data cleaned up');

        } catch (error) {
            console.error('❌ Arbitrage insertion test failed:', error.message);
            throw error;
        }
    }

    calculateGasEstimate(chainA, chainB, liquidityUsd) {
        const gasRates = {
            ethereum: { base: 15, perTx: 25 },
            arbitrum: { base: 0.5, perTx: 1.5 },
            polygon: { base: 0.01, perTx: 0.05 },
            base: { base: 0.01, perTx: 0.05 },
            optimism: { base: 0.5, perTx: 1.5 },
        };

        const isCrossChain = chainA !== chainB;
        const complexityMultiplier = isCrossChain ? 3 : 1;
        
        const chainARates = gasRates[chainA] || gasRates.ethereum;
        const chainBRates = gasRates[chainB] || gasRates.ethereum;
        
        let totalGasCost = chainARates.base + chainARates.perTx;
        
        if (isCrossChain) {
            totalGasCost += chainBRates.base + chainBRates.perTx;
            totalGasCost += 10; // Bridge costs
        }
        
        const liquidityMultiplier = Math.log10(Math.max(liquidityUsd / 1000, 1));
        
        return totalGasCost * complexityMultiplier * liquidityMultiplier;
    }

    async cleanup() {
        await this.db.end();
    }
}

// Run test
if (import.meta.url === `file://${process.argv[1]}`) {
    const test = new ArbitrageDetectorTest();
    
    test.testArbitrageDetection()
        .then(() => {
            console.log('🎉 All tests passed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Test failed:', error);
            process.exit(1);
        })
        .finally(() => {
            test.cleanup();
        });
} 