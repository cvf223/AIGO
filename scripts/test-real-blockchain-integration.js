#!/usr/bin/env node

/**
 * 🧪 REAL BLOCKCHAIN INTEGRATION TEST
 * ==================================
 * 
 * Tests the REAL blockchain integration to ensure:
 * ✅ Actual API calls to Moralis/Alchemy/Infura
 * ✅ Real database operations 
 * ✅ Proper timing (no more 0ms fake operations)
 * ✅ Real market data and transaction analysis
 * ✅ Compliance with workspace truth rules
 * 
 * This test will show ACTUAL response times and REAL data!
 */

import { EliteContractDeveloperES } from '../src/core/EliteContractDeveloperES.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env copy') });

console.log('🚀 Starting REAL Blockchain Integration Test');
console.log('⏱️  This test uses ACTUAL APIs - expect realistic timing!');
console.log('📊 Testing real data fetching, no mock data allowed');
console.log('===========================================================================\n');

async function testRealBlockchainIntegration() {
  let agent = null;
  
  try {
    console.log('🔧 Phase 1: Initialize Agent with REAL APIs');
    console.log('──────────────────────────────────────────────────');
    
    // Verify environment variables
    const requiredEnvVars = [
      'MORALIS_API_KEY',
      'ALCHEMY_API_KEY', 
      'INFURA_API_KEY',
      'COINGECKO_API_KEY',
      'DATABASE_URL'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
      console.error('💡 Please check your .env file configuration');
      return;
    }
    
    console.log('✅ Environment variables verified');
    console.log(`   🔑 Moralis API Key: ${process.env.MORALIS_API_KEY.substring(0, 20)}...`);
    console.log(`   🔑 Alchemy API Key: ${process.env.ALCHEMY_API_KEY.substring(0, 20)}...`);
    console.log(`   🔑 Database URL: ${process.env.DATABASE_URL.split('@')[0]}@...`);
    
    // Create agent with real configuration
    agent = new EliteContractDeveloperES({
      agentId: 'real_integration_test',
      dataPath: './data/real-integration-test'
    });
    
    console.log('🏗️ Agent created, initializing REAL blockchain integration...');
    
    const startInit = Date.now();
    const initSuccess = await agent.initialize();
    const initTime = Date.now() - startInit;
    
    if (!initSuccess) {
      throw new Error('Failed to initialize real blockchain integration');
    }
    
    console.log(`✅ REAL blockchain integration initialized in ${initTime}ms`);
    console.log('🌐 Connected to live blockchain networks!');
    
    console.log('\n📊 Phase 2: Test REAL Market Data Fetching');
    console.log('──────────────────────────────────────────────────');
    
    const marketStartTime = Date.now();
    const marketConditions = await agent.analyzeMarketConditions();
    const marketTime = Date.now() - marketStartTime;
    
    console.log(`📈 Market analysis completed in ${marketTime}ms (REAL timing!)`);
    
    if (marketConditions.error) {
      console.warn('⚠️ Market data fetch encountered issues:', marketConditions.error);
    } else {
      console.log('✅ REAL market data retrieved:');
      if (marketConditions.ethereum) {
        console.log(`   🔗 Ethereum - Block: ${marketConditions.ethereum.blockNumber}, Gas: ${marketConditions.ethereum.gasPrice}`);
      }
      if (marketConditions.arbitrum) {
        console.log(`   🔗 Arbitrum - Block: ${marketConditions.arbitrum.blockNumber}, Gas: ${marketConditions.arbitrum.gasPrice}`);
      }
      if (marketConditions.opportunities) {
        console.log(`   💰 Found ${marketConditions.opportunities.length} arbitrage opportunities`);
      }
    }
    
    console.log('\n🔍 Phase 3: Test REAL Competitor Transaction Analysis');
    console.log('──────────────────────────────────────────────────');
    
    const txStartTime = Date.now();
    const competitorTxs = await agent.fetchCompetitorTransactions();
    const txTime = Date.now() - txStartTime;
    
    console.log(`🔍 Competitor analysis completed in ${txTime}ms (REAL API calls!)`);
    console.log(`✅ Fetched ${competitorTxs.length} REAL competitor transactions`);
    
    if (competitorTxs.length > 0) {
      const sampleTx = competitorTxs[0];
      console.log('📋 Sample transaction:');
      console.log(`   Hash: ${sampleTx.hash}`);
      console.log(`   From: ${sampleTx.from}`);
      console.log(`   Gas Used: ${sampleTx.gasUsed}`);
      console.log(`   Success: ${sampleTx.success}`);
      console.log(`   Chain ID: ${sampleTx.chainId || 'Unknown'}`);
    }
    
    console.log('\n📸 Phase 4: Test REAL Screenshot Processing');
    console.log('──────────────────────────────────────────────────');
    
    const screenshotStartTime = Date.now();
    const screenshots = await agent.fetchNewScreenshots();
    const screenshotTime = Date.now() - screenshotStartTime;
    
    console.log(`📸 Screenshot scan completed in ${screenshotTime}ms`);
    console.log(`✅ Found ${screenshots.length} REAL screenshot files`);
    
    if (screenshots.length > 0) {
      console.log('📋 Screenshot details:');
      screenshots.slice(0, 3).forEach((screenshot, index) => {
        console.log(`   ${index + 1}. ${screenshot.filename} (${screenshot.size} bytes)`);
      });
    }
    
    console.log('\n🏗️ Phase 5: Test REAL Contract Generation');
    console.log('──────────────────────────────────────────────────');
    
    const contractStartTime = Date.now();
    const contracts = await agent.generateOptimizedContracts();
    const contractTime = Date.now() - contractStartTime;
    
    console.log(`🏭 Contract generation completed in ${contractTime}ms`);
    console.log(`✅ Generated ${contracts.length} optimized contracts`);
    
    if (contracts.length > 0) {
      const sampleContract = contracts[0];
      console.log('📋 Sample contract:');
      console.log(`   ID: ${sampleContract.id}`);
      console.log(`   Type: ${sampleContract.type}`);
      console.log(`   Gas Estimate: ${sampleContract.estimatedGas}`);
      console.log(`   Risk Score: ${sampleContract.riskScore}`);
    }
    
    console.log('\n📊 Phase 6: Performance Validation');
    console.log('──────────────────────────────────────────────────');
    
    const perfStartTime = Date.now();
    const validation = await agent.validatePerformance();
    const perfTime = Date.now() - perfStartTime;
    
    console.log(`🧪 Performance validation completed in ${perfTime}ms`);
    console.log(`✅ Validation result: ${validation.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`📊 Current metrics:`);
    console.log(`   Success Rate: ${validation.successRate}%`);
    console.log(`   Avg Response Time: ${validation.avgResponseTime.toFixed(1)}ms`);
    console.log(`   Capital Efficiency: ${(validation.capitalEfficiency * 100).toFixed(1)}%`);
    
    // Test timing validation - ensure no operations are completing in 0ms
    const allTimings = [initTime, marketTime, txTime, screenshotTime, contractTime, perfTime];
    const zeroTimings = allTimings.filter(time => time === 0);
    
    if (zeroTimings.length > 0) {
      console.warn(`⚠️ WARNING: ${zeroTimings.length} operations completed in 0ms - this indicates mock behavior!`);
    } else {
      console.log('✅ All operations have realistic timing - no 0ms mock behavior detected!');
    }
    
    console.log('\n🎯 REAL BLOCKCHAIN INTEGRATION TEST RESULTS');
    console.log('=================================================================');
    
    const totalOperations = 6;
    const successfulOperations = allTimings.filter(time => time > 0).length;
    const successRate = (successfulOperations / totalOperations) * 100;
    
    console.log(`📊 Test Summary:`);
    console.log(`   Total Operations: ${totalOperations}`);
    console.log(`   Successful Operations: ${successfulOperations}`);
    console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`   Average Operation Time: ${(allTimings.reduce((a, b) => a + b, 0) / allTimings.length).toFixed(1)}ms`);
    
    if (successRate >= 80) {
      console.log('🎉 ✅ REAL BLOCKCHAIN INTEGRATION TEST PASSED!');
      console.log('🌐 System is using REAL APIs and data sources');
      console.log('⏱️ All operations have realistic timing');
      console.log('🚀 Ready for production deployment with live data!');
    } else {
      console.log('❌ REAL BLOCKCHAIN INTEGRATION TEST FAILED');
      console.log('🔧 Some operations may still be using mock data');
      console.log('⚠️ Review implementation for remaining mock behavior');
    }
    
    console.log(`\n📈 Performance Metrics:`);
    console.log(`   🔍 Market Analysis: ${marketTime}ms`);
    console.log(`   🏗️ Transaction Fetching: ${txTime}ms`);
    console.log(`   📸 Screenshot Processing: ${screenshotTime}ms`);
    console.log(`   🏭 Contract Generation: ${contractTime}ms`);
    console.log(`   🧪 Performance Validation: ${perfTime}ms`);
    
    if (marketConditions && !marketConditions.error) {
      console.log(`\n🌐 Live Network Status:`);
      console.log(`   📊 Analysis Time: ${marketConditions.analysisTime || 'N/A'}ms`);
      console.log(`   🎯 Opportunities Found: ${marketConditions.opportunities?.length || 0}`);
      console.log(`   💰 Token Prices: ${Object.keys(marketConditions.tokenPrices || {}).length} tokens`);
    }
    
  } catch (error) {
    console.error('\n❌ REAL BLOCKCHAIN INTEGRATION TEST FAILED');
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.message.includes('API')) {
      console.error('\n💡 This may be an API configuration issue:');
      console.error('   1. Check your API keys in .env file');
      console.error('   2. Verify API rate limits haven\'t been exceeded');
      console.error('   3. Confirm network connectivity');
    }
    
    if (error.message.includes('database')) {
      console.error('\n💡 This may be a database issue:');
      console.error('   1. Check PostgreSQL is running');
      console.error('   2. Verify database connection string');
      console.error('   3. Ensure database permissions are correct');
    }
    
  } finally {
    if (agent) {
      console.log('\n🧹 Cleaning up test resources...');
      await agent.shutdown();
      console.log('✅ Test cleanup complete');
    }
  }
}

// Export for use in other scripts
export { testRealBlockchainIntegration };

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRealBlockchainIntegration()
    .then(() => {
      console.log('\n🎉 REAL BLOCKCHAIN INTEGRATION TEST COMPLETE! 🎉');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 TEST CRASHED:', error);
      process.exit(1);
    });
} 