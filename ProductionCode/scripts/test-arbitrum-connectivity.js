// ⚠️ DEPRECATED - BLOCKCHAIN FUNCTIONALITY REMOVED
// This file is not used in the Construction Syndicate

#!/usr/bin/env node

/**
 * 🧪 Test Arbitrum Connectivity
 * Quick test to verify RPC connectivity before pool discovery
 */

import { ethers } from 'ethers';

async function testArbitrumConnectivity() {
    console.log('🧪 Testing Arbitrum RPC Connectivity...');
    
    const rpcUrls = [
        process.env.ARBITRUM_RPC || 'https://arb1.arbitrum.io/rpc',
        'https://arb1.arbitrum.io/rpc',
        'https://arbitrum-one.public.blastapi.io',
        'https://endpoints.omniatech.io/v1/arbitrum/one/public'
    ];

    for (const rpcUrl of rpcUrls) {
        try {
            console.log(`\n📡 Testing: ${rpcUrl.substring(0, 50)}...`);
            
            const provider = new ethers.JsonRpcProvider(rpcUrl, null, { timeout: 10000 });
            
            // Test basic connectivity
            const blockNumber = await provider.getBlockNumber();
            console.log(`   ✅ Connected! Current block: ${blockNumber}`);
            
            // Test a simple contract call
            const uniV3Factory = '0x1F98431c8aD98523631AE4a59f267346ea31F984';
            const factoryABI = ['function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)'];
            const factory = new ethers.Contract(uniV3Factory, factoryABI, provider);
            
            // WETH/USDC pool on Arbitrum
            const poolAddress = await factory.getPool(
                '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WETH
                '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
                3000 // 0.3% fee
            );
            
            console.log(`   ✅ Contract call works! WETH/USDC pool: ${poolAddress}`);
            console.log(`   🎯 This RPC endpoint is ready for pool discovery!`);
            return rpcUrl;
            
        } catch (error) {
            console.log(`   ❌ Failed: ${error.message}`);
            if (error.message.includes('compute units') || error.message.includes('429')) {
                console.log(`      Rate limited - this endpoint might work with delays`);
            }
        }
    }
    
    console.log('\n💥 No working RPC endpoints found!');
    return null;
}

// Run the test
testArbitrumConnectivity()
    .then((workingRpc) => {
        if (workingRpc) {
            console.log(`\n🚀 Ready for pool discovery with: ${workingRpc}`);
            console.log('💡 Run: node scripts/arbitrum-pool-discovery.js');
        } else {
            console.log('\n⚠️ Need to fix RPC connectivity before pool discovery');
        }
    })
    .catch((error) => {
        console.error('💥 Connectivity test failed:', error);
    }); 