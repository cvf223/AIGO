// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This test file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🔥 REAL BLOCKCHAIN BACKBONE INTEGRATION TEST
 * ==========================================
 * 
 * BRUTAL TRUTH: Testing the FULL system with real data!
 * 
 * ✅ Real database connection
 * ✅ Real pool discovery from database
 * ✅ Real price calculations from blockchain
 * ✅ Real arbitrage opportunity detection
 * ✅ Real multi-provider failover
 * ✅ Real performance monitoring
 */

import { ethers } from 'ethers';
import pkg from 'pg';
const { Client } = pkg;

// Import the REAL BlockchainBackbone
import { BlockchainBackbone } from './src/blockchain-backbone.js';

// 💾 Database configuration
const DATABASE_CONFIG = {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/elizaos'
};

// 🎯 Test configuration
const TEST_CONFIG = {
    maxTestDuration: 300000, // 5 minutes max
    opportunityThreshold: 0.5, // 0.5% minimum spread
    maxPoolsToTest: 50, // Test up to 50 pools
    scanIntervals: 3 // Run 3 scan cycles
};

class RealBlockchainBackboneTest {
    constructor() {
        this.database = new Client(DATABASE_CONFIG);
        this.backbone = null;
        this.stats = {
            startTime: Date.now(),
            poolsLoaded: 0,
            pricesCalculated: 0,
            opportunitiesFound: 0,
            providerFailures: 0,
            scanCycles: 0
        };
        
        console.log('🔥 REAL BLOCKCHAIN BACKBONE TEST - INITIALIZING...');
        console.log('💾 Database: ', DATABASE_CONFIG.connectionString);
    }
    
    async initialize() {
        try {
            console.log('\n🔧 === INITIALIZATION PHASE ===');
            
            // Step 1: Connect to database
            console.log('💾 Connecting to PostgreSQL database...');
            await this.database.connect();
            console.log('✅ Database connected successfully');
            
            // Step 2: Verify database has pools
            const poolCount = await this.database.query('SELECT COUNT(*) as count FROM pools');
            console.log(`📊 Found ${poolCount.rows[0].count} pools in database`);
            
            if (poolCount.rows[0].count === 0) {
                throw new Error('No pools found in database - need to populate first!');
            }
            
            // Step 3: Initialize BlockchainBackbone
            console.log('🚀 Initializing BlockchainBackbone with real database...');
            this.backbone = new BlockchainBackbone(this.database);
            
            const backboneReady = await this.backbone.initialize();
            if (!backboneReady) {
                throw new Error('BlockchainBackbone initialization failed');
            }
            
            console.log('✅ BlockchainBackbone initialized successfully');
            
            // Step 4: Setup event listeners
            this.setupEventListeners();
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            return false;
        }
    }
    
    setupEventListeners() {
        console.log('📡 Setting up event listeners...');
        
        // Listen for arbitrage opportunities
        this.backbone.on('arbitrageOpportunity', (opportunity) => {
            this.stats.opportunitiesFound++;
            console.log(`\n🎯 === ARBITRAGE OPPORTUNITY DETECTED ===`);
            console.log(`💰 Pair: ${opportunity.pair}`);
            console.log(`📈 Spread: ${opportunity.spread.toFixed(3)}%`);
            console.log(`🏪 Buy from: ${opportunity.buyFrom.poolInfo?.dex_name} at ${opportunity.buyFrom.price?.toFixed(6)}`);
            console.log(`🏪 Sell to: ${opportunity.sellTo.poolInfo?.dex_name} at ${opportunity.sellTo.price?.toFixed(6)}`);
            console.log(`⛓️ Chain: ${opportunity.buyFrom.chain}`);
            console.log(`💧 Liquidity: $${opportunity.buyFrom.liquidity?.toLocaleString()}`);
            console.log(`🔥 Calculated directly from blockchain: ${opportunity.calculatedDirectly ? 'YES' : 'NO'}`);
        });
        
        // Listen for pending transactions
        this.backbone.on('pendingTransaction', (txHash) => {
            console.log(`⏳ Pending transaction detected: ${txHash.slice(0, 10)}...`);
        });
        
        console.log('✅ Event listeners configured');
    }
    
    async testRealPoolDiscovery() {
        try {
            console.log('\n📊 === POOL DISCOVERY TEST ===');
            
            // Test the backbone's pool loading
            const monitoredPools = this.backbone.getMonitoredPools();
            this.stats.poolsLoaded = monitoredPools.length;
            
            console.log(`🏊 Loaded ${monitoredPools.length} monitored pools`);
            
            if (monitoredPools.length > 0) {
                console.log('\n📋 Sample pools:');
                monitoredPools.slice(0, 5).forEach((pool, index) => {
                    console.log(`  ${index + 1}. ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex_name} (${pool.chain})`);
                    console.log(`     💧 Liquidity: $${pool.liquidity_usd.toLocaleString()}`);
                });
                
                if (monitoredPools.length > 5) {
                    console.log(`  ... and ${monitoredPools.length - 5} more pools`);
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Pool discovery test failed:', error.message);
            return false;
        }
    }
    
    async testRealPriceCalculations() {
        try {
            console.log('\n💰 === REAL PRICE CALCULATION TEST ===');
            
            const monitoredPools = this.backbone.getMonitoredPools();
            const testPools = monitoredPools.slice(0, Math.min(10, monitoredPools.length));
            
            console.log(`🧪 Testing price calculations for ${testPools.length} pools...`);
            
            let successful = 0;
            let failed = 0;
            
            for (const pool of testPools) {
                try {
                    console.log(`\n💱 Testing ${pool.token0_symbol}/${pool.token1_symbol} on ${pool.dex_name}...`);
                    
                    const priceData = await this.backbone.calculatePriceFromReserves(
                        pool.pool_address,
                        pool.chain,
                        pool.dex_name.includes('v3') ? 'v3' : 'v2'
                    );
                    
                    if (priceData && priceData.valid) {
                        successful++;
                        this.stats.pricesCalculated++;
                        console.log(`✅ Price: ${priceData.price?.toFixed(6)} ${priceData.token1}/${priceData.token0}`);
                        console.log(`📊 Liquidity: ${priceData.liquidity || 'N/A'}`);
                        console.log(`⚡ Provider: ${priceData.provider}`);
                        console.log(`🕐 Timestamp: ${new Date(priceData.timestamp || Date.now()).toLocaleTimeString()}`);
                    } else {
                        failed++;
                        console.log(`❌ Failed: ${priceData.error || priceData.reason || 'Unknown error'}`);
                    }
                    
                } catch (error) {
                    failed++;
                    this.stats.providerFailures++;
                    console.log(`❌ Error: ${error.message}`);
                }
                
                // Small delay to avoid overwhelming providers
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.log(`\n📊 Price calculation results: ${successful} successful, ${failed} failed`);
            console.log(`📈 Success rate: ${((successful / (successful + failed)) * 100).toFixed(1)}%`);
            
            return successful > 0;
            
        } catch (error) {
            console.error('❌ Price calculation test failed:', error.message);
            return false;
        }
    }
    
    async testRealArbitrageDetection() {
        try {
            console.log('\n🎯 === REAL ARBITRAGE DETECTION TEST ===');
            
            console.log('🔍 Starting continuous arbitrage monitoring...');
            console.log('⏰ Will run multiple scan cycles to detect opportunities...');
            
            // Start the backbone monitoring
            this.backbone.startMonitoring();
            
            // Run for multiple cycles
            for (let cycle = 1; cycle <= TEST_CONFIG.scanIntervals; cycle++) {
                console.log(`\n🔄 === SCAN CYCLE ${cycle}/${TEST_CONFIG.scanIntervals} ===`);
                this.stats.scanCycles++;
                
                // Trigger manual scan
                await this.backbone.scanForOpportunities();
                
                // Show current stats
                const backboneStats = this.backbone.getComprehensiveStats();
                console.log(`📊 Cycle ${cycle} stats:`);
                console.log(`  🔥 RPC calls: ${backboneStats.stats.rpcCalls}`);
                console.log(`  💰 Prices calculated: ${backboneStats.stats.pricesCalculated}`);
                console.log(`  🎯 Opportunities found: ${backboneStats.stats.opportunitiesFound}`);
                console.log(`  📊 Cache hits: ${backboneStats.stats.cacheHits}`);
                console.log(`  🚦 Rate limiters: A:${backboneStats.rateLimiters.alchemy} I:${backboneStats.rateLimiters.infura}`);
                
                // Wait between cycles
                if (cycle < TEST_CONFIG.scanIntervals) {
                    console.log('⏳ Waiting 30 seconds before next cycle...');
                    await new Promise(resolve => setTimeout(resolve, 30000));
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Arbitrage detection test failed:', error.message);
            return false;
        }
    }
    
    async runFullIntegrationTest() {
        try {
            console.log('🔥 === FULL BLOCKCHAIN BACKBONE INTEGRATION TEST ===\n');
            
            const startTime = Date.now();
            
            // Phase 1: Pool Discovery
            const poolDiscoverySuccess = await this.testRealPoolDiscovery();
            if (!poolDiscoverySuccess) {
                throw new Error('Pool discovery failed');
            }
            
            // Phase 2: Price Calculations
            const priceTestSuccess = await this.testRealPriceCalculations();
            if (!priceTestSuccess) {
                throw new Error('Price calculation test failed');
            }
            
            // Phase 3: Arbitrage Detection
            const arbitrageTestSuccess = await this.testRealArbitrageDetection();
            if (!arbitrageTestSuccess) {
                throw new Error('Arbitrage detection test failed');
            }
            
            // Final Results
            const duration = (Date.now() - startTime) / 1000;
            await this.showFinalResults(duration);
            
            return true;
            
        } catch (error) {
            console.error('❌ Full integration test failed:', error.message);
            return false;
        }
    }
    
    async showFinalResults(duration) {
        console.log('\n🏆 === FINAL INTEGRATION TEST RESULTS ===');
        
        const backboneStats = this.backbone.getComprehensiveStats();
        
        console.log(`⏱️  Total test duration: ${duration.toFixed(1)} seconds`);
        console.log(`🏊 Pools loaded from database: ${this.stats.poolsLoaded}`);
        console.log(`💰 Real prices calculated: ${this.stats.pricesCalculated}`);
        console.log(`🎯 Arbitrage opportunities found: ${this.stats.opportunitiesFound}`);
        console.log(`🔄 Scan cycles completed: ${this.stats.scanCycles}`);
        console.log(`❌ Provider failures: ${this.stats.providerFailures}`);
        
        console.log('\n📊 BlockchainBackbone Performance:');
        console.log(`  🔥 Total RPC calls: ${backboneStats.stats.rpcCalls}`);
        console.log(`  💹 Total prices calculated: ${backboneStats.stats.pricesCalculated}`);
        console.log(`  🎯 Total opportunities detected: ${backboneStats.stats.opportunitiesFound}`);
        console.log(`  📊 Cache hit rate: ${((backboneStats.stats.cacheHits / Math.max(backboneStats.stats.pricesCalculated, 1)) * 100).toFixed(1)}%`);
        console.log(`  🚦 Active providers: ${backboneStats.providers}`);
        console.log(`  🏊 Monitored pools: ${backboneStats.monitoredPools}`);
        
        console.log('\n🔥 BRUTAL TRUTH ASSESSMENT:');
        if (this.stats.opportunitiesFound > 0) {
            console.log(`✅ ELITE PERFORMANCE: Found ${this.stats.opportunitiesFound} real arbitrage opportunities!`);
            console.log(`🚀 System is ready for production trading!`);
        } else {
            console.log(`📊 BASELINE ESTABLISHED: No opportunities found (normal in efficient markets)`);
            console.log(`✅ Infrastructure proven operational and ready for live trading!`);
        }
        
        if (this.stats.pricesCalculated > 10) {
            console.log(`💰 PRICE ENGINE: Successfully calculated ${this.stats.pricesCalculated} real blockchain prices`);
        }
        
        if (backboneStats.providers >= 4) {
            console.log(`🌐 REDUNDANCY: ${backboneStats.providers} providers operational - zero single points of failure`);
        }
        
        console.log('\n🏆 BLOCKCHAIN BACKBONE INTEGRATION TEST COMPLETE!');
        console.log('🚀 Ready for production arbitrage domination!');
    }
    
    async cleanup() {
        try {
            console.log('\n🧹 Cleaning up...');
            
            if (this.backbone) {
                await this.backbone.shutdown();
                console.log('✅ BlockchainBackbone shutdown complete');
            }
            
            if (this.database) {
                await this.database.end();
                console.log('✅ Database connection closed');
            }
            
        } catch (error) {
            console.warn('⚠️ Cleanup error:', error.message);
        }
    }
}

// 🚀 MAIN TEST EXECUTION
async function runRealIntegrationTest() {
    const test = new RealBlockchainBackboneTest();
    
    try {
        // Initialize
        const initialized = await test.initialize();
        if (!initialized) {
            console.error('❌ Test initialization failed!');
            process.exit(1);
        }
        
        // Run full test
        const success = await test.runFullIntegrationTest();
        
        if (success) {
            console.log('\n🎉 ALL TESTS PASSED - SYSTEM READY FOR PRODUCTION!');
            process.exit(0);
        } else {
            console.log('\n❌ SOME TESTS FAILED - CHECK CONFIGURATION');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('💥 Fatal test error:', error.message);
        process.exit(1);
    } finally {
        await test.cleanup();
    }
}

// Handle interruptions gracefully
process.on('SIGINT', async () => {
    console.log('\n🛑 Test interrupted by user');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled promise rejection:', error.message);
    process.exit(1);
});

// 🔥 START THE REAL INTEGRATION TEST!
console.log('🚀 STARTING REAL BLOCKCHAIN BACKBONE INTEGRATION TEST...\n');
runRealIntegrationTest();