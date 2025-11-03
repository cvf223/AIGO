/**
 * 📊 LOG MONITORING DEMONSTRATION
 * ==============================
 * 
 * Demonstrates the real-time logging system with WebSocket streaming.
 * Shows exactly the kind of logs you saw in the terminal during our tests.
 * 
 * Usage:
 * 1. Run this script: node examples/log-monitoring-demo.js
 * 2. Open browser to: http://localhost:3001
 * 3. Watch logs stream in real-time!
 */

import { logger } from '../src/services/LoggingService.js';
import { logStreamingServer } from '../src/services/LogStreamingServer.js';
import { logMonitoringServer } from '../src/web/log-monitoring-server.js';
import { HumanInTheLoopSystem } from '../src/core/HumanInTheLoopSystem.js';

// For simulating real system activities
import { setTimeout as setTimeoutPromise } from 'timers/promises';

async function startLogMonitoringDemo() {
    console.log('📊 Starting Log Monitoring Demonstration...\n');

    try {
        // 1. Start the web server
        console.log('🌐 Starting web server...');
        await logMonitoringServer.start();

        // 2. Start the WebSocket streaming server  
        console.log('📡 Starting WebSocket streaming server...');
        logStreamingServer.start();

        console.log('\n✅ Log monitoring system ready!');
        console.log('🌐 Web Interface: http://localhost:3001');
        console.log('📡 WebSocket: ws://localhost:8081');
        console.log('\n🎯 The browser will show real-time logs as this demo runs...\n');

        // Wait a moment for servers to fully start
        await setTimeoutPromise(2000);

        // 3. Start the demonstration
        await runDemonstration();

    } catch (error) {
        console.error('❌ Error starting demo:', error);
        process.exit(1);
    }
}

async function runDemonstration() {
    console.log('🎬 Starting live demonstration of the Elite Arbitrage Syndicate...\n');

    // Simulate the exact sequence from our test
    await simulateSystemInitialization();
    await setTimeoutPromise(1000);
    
    await simulateAgentOperations();
    await setTimeoutPromise(1000);
    
    await simulateBlockchainInteractions();
    await setTimeoutPromise(1000);
    
    await simulateHumanEscalations();
    await setTimeoutPromise(1000);
    
    await simulateErrorConditions();
    await setTimeoutPromise(1000);
    
    await simulatePerformanceMonitoring();

    console.log('\n🎉 Demo completed! Check the web interface for all logged activities.');
    console.log('💡 The WebSocket will continue streaming any new logs in real-time.');
    console.log('🔄 Press Ctrl+C to stop the demo servers.\n');
}

/**
 * 🚀 SIMULATE SYSTEM INITIALIZATION
 */
async function simulateSystemInitialization() {
    logger.info('DATABASE', 'PostgreSQL connection established successfully', {
        component: 'DatabaseConnection',
        host: 'localhost:5432',
        database: 'construction_syndicate',
        user: 'postgres',
        version: '14.17'
    });

    logger.success('HUMAN-LOOP', 'System initialized - LLM recommendations enabled', {
        component: 'HumanInTheLoopSystem',
        llmEnabled: true,
        telegramEnabled: true,
        performanceMonitoring: true
    });

    logger.info('TELEGRAM', 'Client initialized for notifications', {
        component: 'HumanInTheLoopSystem',
        telegramEnabled: true,
        botToken: 'configured'
    });

    logger.success('RISK-MGMT', 'Risk Management System initialized', {
        component: 'RiskManagementSystem',
        tablesCreated: true,
        historicalDataLoaded: true
    });
}

/**
 * 🤖 SIMULATE AGENT OPERATIONS
 */
async function simulateAgentOperations() {
    logger.logAgentOperation('arbitrage-agent-001', 'opportunity_analysis', 'Analyzing arbitrage opportunity on Arbitrum', {
        chain: 'arbitrum',
        tokenPair: 'USDC/WETH',
        potentialProfit: 2847,
        gasEstimate: 284567
    });

    await setTimeoutPromise(500);

    logger.logAgentOperation('risk-management-system', 'position_sizing', 'Calculating optimal position size using Kelly Criterion', {
        chain: 'arbitrum',
        opportunity: 'OPP-2025-156847',
        kellyFraction: 0.15,
        recommendedSize: 50000
    });

    await setTimeoutPromise(300);

    logger.logAgentOperation('mev-protection-agent', 'strategy_selection', 'Selected Timeboost auction for MEV protection', {
        chain: 'arbitrum',
        strategy: 'timeboost_auction',
        bidAmount: 1138,
        expectedSavings: 847
    });
}

/**
 * ⛓️ SIMULATE BLOCKCHAIN INTERACTIONS
 */
async function simulateBlockchainInteractions() {
    logger.logBlockchainInteraction('arbitrum', 'gas_price_fetch', 'Retrieved real-time gas prices from Alchemy API', {
        chain: 'arbitrum',
        gasPrice: 0.1,
        apiDuration: 245,
        source: 'alchemy',
        fallbackUsed: false
    });

    await setTimeoutPromise(400);

    logger.logBlockchainInteraction('arbitrum', 'flash_loan_selection', 'Selected Balancer (free provider) - reward applied', {
        chain: 'arbitrum',
        provider: 'Balancer',
        feePercentage: 0,
        capacity: 50000000,
        agentReward: 250,
        isFreeProvider: true
    });

    await setTimeoutPromise(600);

    logger.logBlockchainInteraction('arbitrum', 'mev_protection', 'Submitted transaction via Timeboost auction', {
        chain: 'arbitrum',
        strategy: 'timeboost_auction',
        txHash: '0x742d35Cc6aF892b9c6...',
        gasUsed: 284567,
        executionTime: 1200,
        netProfit: 1709
    });
}

/**
 * 🆘 SIMULATE HUMAN ESCALATIONS
 */
async function simulateHumanEscalations() {
    const escalationId = 'ESC-' + Date.now() + '-demo123';
    
    logger.warn('BLOCKTIME', 'WARNING: arbitrum: 300ms > 125ms (140.0% overage)', {
        component: 'HumanInTheLoopSystem',
        chain: 'arbitrum',
        executionTime: 300,
        halfBlockTime: 125,
        overagePercentage: 140.0,
        operation: 'opportunity_calculation',
        agentId: 'risk-management-system'
    });

    await setTimeoutPromise(200);

    logger.logHumanEscalation(escalationId, 'Human assistance requested: HIGH priority', {
        component: 'HumanInTheLoopSystem',
        escalationId: escalationId,
        urgency: 'HIGH',
        type: 'blocktime_performance_degradation',
        chain: 'arbitrum',
        agentId: 'risk-management-system',
        financialImpact: 0,
        performanceImpact: 1.4
    });

    await setTimeoutPromise(300);

    logger.logCommunication('frontend', `Notification sent for ${escalationId}`, {
        component: 'HumanInTheLoopSystem',
        escalationId: escalationId,
        priority: 'HIGH',
        type: 'HUMAN_ESCALATION'
    });

    await setTimeoutPromise(100);

    logger.logCommunication('telegram', `Notification sent for ${escalationId}`, {
        component: 'HumanInTheLoopSystem',
        escalationId: escalationId,
        priority: 'HIGH',
        groupId: '-1002537429306'
    });
}

/**
 * 🔴 SIMULATE ERROR CONDITIONS
 */
async function simulateErrorConditions() {
    // Simulate the LLM errors you saw when OLLAMA wasn't running
    logger.error('CAPABILITY', 'ERROR: Cannot read properties of undefined (reading \'match\')', {
        component: 'CapabilityCreationSystem',
        operation: 'extractAssessmentScore',
        file: 'CapabilityCreationSystem.js',
        line: 610,
        agentId: 'arbitrage-agent-001',
        error: new Error('Cannot read properties of undefined (reading \'match\')')
    });

    await setTimeoutPromise(300);

    logger.error('LLM', 'OLLAMA connection failed - using fallback recommendations', {
        component: 'LLMIntelligenceAugmentation',
        operation: 'requestLLMAssistance',
        ollamaUrl: 'http://localhost:11434',
        model: 'llama3.1:70b-instruct-q4_0',
        fallbackUsed: true
    });

    await setTimeoutPromise(200);

    logger.warn('LLM', 'LLM unavailable - operating with cached context', {
        component: 'ContextEngine',
        operation: 'buildContext',
        taskClass: 'CAPABILITY_ENHANCEMENT',
        marketDataAvailable: false
    });
}

/**
 * ⏱️ SIMULATE PERFORMANCE MONITORING
 */
async function simulatePerformanceMonitoring() {
    logger.logPerformance('gas_price_timing', 'Gas price API call completed in 245ms', {
        component: 'RiskManagementSystem',
        operation: 'getRealTimeGasPrice',
        chain: 'arbitrum',
        duration: 245,
        threshold: 500,
        status: 'within_threshold'
    });

    await setTimeoutPromise(400);

    logger.logPerformance('execution_timing', 'Opportunity calculation took 1.2s', {
        component: 'MainnetForkExecutionEngine',
        operation: 'calculateArbitrageOpportunity',
        chain: 'arbitrum',
        duration: 1200,
        blockTime: 250,
        halfBlockTime: 125,
        status: 'exceeded_threshold'
    });

    await setTimeoutPromise(300);

    logger.success('MEV-PROTECT', 'Competitor count: 3 (speed wins strategy active)', {
        component: 'L2MEVProtectionSystem',
        chain: 'arbitrum',
        competitorCount: 3,
        strategy: 'speed_wins',
        protectionLevel: 'moderate'
    });
}

/**
 * 🎯 CONTINUOUS SIMULATION
 */
async function startContinuousSimulation() {
    console.log('🔄 Starting continuous simulation (every 10 seconds)...\n');
    
    setInterval(async () => {
        // Randomly simulate different types of activities
        const activities = [
            () => simulateAgentOperations(),
            () => simulateBlockchainInteractions(),
            () => simulatePerformanceMonitoring()
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        await randomActivity();
        
        // Occasionally simulate an error or escalation
        if (Math.random() < 0.3) {
            if (Math.random() < 0.5) {
                await simulateErrorConditions();
            } else {
                await simulateHumanEscalations();
            }
        }
        
    }, 10000); // Every 10 seconds
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down log monitoring demo...');
    
    await logMonitoringServer.stop();
    logStreamingServer.stop();
    
    console.log('✅ Demo servers stopped. Goodbye!');
    process.exit(0);
});

// Start the demonstration
startLogMonitoringDemo().then(() => {
    // Start continuous simulation after initial demo
    setTimeout(() => {
        startContinuousSimulation();
    }, 5000);
});
