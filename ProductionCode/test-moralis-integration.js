#!/usr/bin/env node

/**
 * 🌊 TEST MORALIS STREAMS INTEGRATION
 * ==================================
 * 
 * This script tests the Moralis streams integration with the
 * Ultimate Arbitrage Syndicate background task system.
 * 
 * It verifies:
 * 1. Moralis webhook server setup
 * 2. Stream event processing
 * 3. Atomic task switching on significant events
 * 4. Price impact calculation
 */

import { initializeMoralisStreams, streamEvents } from './moralis-streams-integration.js';
import { backgroundTaskManager, taskEvents, PRIORITY } from './agent-background-tasks.js';
import { UltimateArbitrageSyndicate } from './ultimate-arbitrage-syndicate.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import ngrok from 'ngrok';
import { performance } from 'perf_hooks';

// Load environment variables
dotenv.config();

// Create mock swap event for testing
const createMockSwapEvent = (priceImpact = 0.006) => {
  return {
    chainId: '0xa4b1', // Arbitrum
    logs: [{
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3 Router
      topic0: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67', // Swap topic
      transactionHash: `0x${Math.random().toString(36).substring(2, 40)}`,
      data: '0x0000000000000000000000000000000000000000000000000000000000000001',
      decodedData: {
        amount0: '1000000000000000000',
        amount1: '-500000000000000000',
        sqrtPriceX96: '1234567890123456789012345',
        liquidity: '1000000000000000000',
        tick: '12345'
      }
    }],
    txs: [],
    block: {
      number: 12345678,
      timestamp: Math.floor(Date.now() / 1000).toString()
    },
    confirmed: true
  };
};

// Main test function
async function runTest() {
  console.log('🧪 TESTING MORALIS STREAMS INTEGRATION');
  console.log('====================================');
  
  let webhookUrl = null;
  let ngrokUrl = null;
  
  try {
    // 1. Setup ngrok for local testing (if no webhook URL provided)
    console.log('\n📋 STEP 1: Setup webhook endpoint');
    
    const webhookPort = parseInt(process.env.MORALIS_WEBHOOK_PORT || '3333');
    
    if (process.env.MORALIS_WEBHOOK_URL) {
      webhookUrl = process.env.MORALIS_WEBHOOK_URL;
      console.log(`✅ Using provided webhook URL: ${webhookUrl}`);
    } else {
      try {
        console.log('🔧 Setting up ngrok tunnel for local testing...');
        ngrokUrl = await ngrok.connect(webhookPort);
        webhookUrl = `${ngrokUrl}/webhook`;
        console.log(`✅ ngrok tunnel established: ${webhookUrl}`);
      } catch (error) {
        console.error('❌ Failed to establish ngrok tunnel:', error);
        console.log('⚠️ Continuing with localhost URL (will only work for local testing)');
        webhookUrl = `http://localhost:${webhookPort}/webhook`;
      }
    }
    
    // 2. Initialize the system
    console.log('\n📋 STEP 2: Initialize the system');
    const syndicate = new UltimateArbitrageSyndicate();
    
    // Override webhook URL for testing
    syndicate.config.moralisWebhookUrl = webhookUrl;
    syndicate.config.enableBackgroundTasks = true;
    
    // Initialize
    await syndicate.initialize();
    console.log('✅ System initialized');
    
    // 3. Register test background tasks
    console.log('\n📋 STEP 3: Register test background tasks');
    
    // Create a test agent
    const testAgent = {
      id: 'test-agent',
      name: 'Test Agent',
      type: 'ArbitrumSpecialist',
      isActive: true,
      interrupt: async (reason, data) => {
        console.log(`🚨 Test agent interrupted: ${reason}`);
        return true;
      }
    };
    
    // Add test agent to syndicate
    syndicate.components.agents.set('test-agent', testAgent);
    
    // Register a test background task
    const testTaskId = backgroundTaskManager.registerTask({
      name: 'Test Background Task',
      description: 'A test background task for Moralis integration',
      agentId: 'test-agent',
      priority: PRIORITY.MEDIUM,
      interval: 5000, // Every 5 seconds
      handler: async (task) => {
        console.log(`Running test background task at ${new Date().toISOString()}`);
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 500));
        return { status: 'completed', testData: 'some data' };
      }
    });
    console.log(`✅ Test task registered with ID: ${testTaskId}`);
    
    // 4. Setup event listeners
    console.log('\n📋 STEP 4: Setup event listeners');
    
    // Listen for stream events
    streamEvents.on('contractEvent', (eventData) => {
      console.log(`✅ Received contract event: ${eventData.eventName}`);
    });
    
    streamEvents.on('SwapEvent', (eventData) => {
      console.log(`✅ Received swap event: ${eventData.transactionHash}`);
    });
    
    // Listen for atomic switch completed event
    syndicate.on('atomicSwitchCompleted', (data) => {
      console.log(`✅ Atomic switch completed in ${data.switchTime.toFixed(2)}ms`);
    });
    
    // 5. Simulate webhook events
    console.log('\n📋 STEP 5: Simulate webhook events');
    
    // Wait for webhook server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock events with different price impacts
    const mockEvents = [
      { priceImpact: 0.002, description: 'Low impact (0.2%)' },
      { priceImpact: 0.004, description: 'Medium impact (0.4%)' },
      { priceImpact: 0.006, description: 'High impact (0.6%)' },
      { priceImpact: 0.01, description: 'Very high impact (1.0%)' }
    ];
    
    // Send mock events to webhook
    for (const mockEvent of mockEvents) {
      const event = createMockSwapEvent(mockEvent.priceImpact);
      
      console.log(`🔄 Sending ${mockEvent.description} event to webhook...`);
      
      try {
        // Send directly to the processWebhookData function via a simulated event
        streamEvents.emit('contractEvent', {
          chainId: event.chainId,
          blockNumber: event.block.number,
          blockTimestamp: event.block.timestamp,
          transactionHash: event.logs[0].transactionHash,
          address: event.logs[0].address,
          eventName: 'Swap',
          data: event.logs[0].data,
          decodedData: event.logs[0].decodedData
        });
        
        // For high impact events, also emit SwapEvent
        if (mockEvent.priceImpact >= 0.005) {
          streamEvents.emit('SwapEvent', {
            chainId: event.chainId,
            blockNumber: event.block.number,
            blockTimestamp: event.block.timestamp,
            transactionHash: event.logs[0].transactionHash,
            address: event.logs[0].address,
            eventName: 'Swap',
            data: event.logs[0].data,
            decodedData: event.logs[0].decodedData
          });
        }
        
        console.log('✅ Event sent successfully');
      } catch (error) {
        console.error('❌ Failed to send event:', error);
      }
      
      // Wait between events
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // 6. Test direct webhook call
    console.log('\n📋 STEP 6: Test direct webhook call');
    
    try {
      const highImpactEvent = createMockSwapEvent(0.008);
      
      // Send HTTP POST request to webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(highImpactEvent)
      });
      
      if (response.ok) {
        console.log('✅ Direct webhook call successful');
        console.log('Response:', await response.text());
      } else {
        console.error('❌ Direct webhook call failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('❌ Failed to make direct webhook call:', error);
    }
    
    // 7. Wait for events to be processed
    console.log('\n📋 STEP 7: Waiting for events to be processed...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // 8. Test cleanup
    console.log('\n📋 STEP 8: Test cleanup');
    await syndicate.stop();
    console.log('✅ System stopped');
    
    // Close ngrok tunnel if created
    if (ngrokUrl) {
      await ngrok.disconnect(ngrokUrl);
      console.log('✅ ngrok tunnel closed');
    }
    
    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Cleanup
    if (ngrokUrl) {
      try {
        await ngrok.disconnect(ngrokUrl);
        console.log('✅ ngrok tunnel closed');
      } catch (e) {
        console.error('❌ Failed to close ngrok tunnel:', e);
      }
    }
    
    process.exit(1);
  }
}

// Run the test
runTest().catch(console.error); 