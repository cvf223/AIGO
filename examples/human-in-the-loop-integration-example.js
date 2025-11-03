/**
 * 🤝 HUMAN-IN-THE-LOOP INTEGRATION EXAMPLE
 * ==========================================
 * 
 * Shows how the new generalized Human-in-the-Loop system works
 * with LLM-powered recommendations and real Telegram notifications
 */

import { HumanInTheLoopSystem } from '../src/core/HumanInTheLoopSystem.js';
import { RiskManagementSystem } from '../src/core/RiskManagementSystem.js';
import { CapabilityCreationSystem } from '../src/core/CapabilityCreationSystem.js';
import { initializeDatabase } from '../database/contract-advancement-database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set essential test environment variables if not already set
if (!process.env.TELEGRAM_BOT_TOKEN) {
    process.env.TELEGRAM_BOT_TOKEN = '8051510601:AAE_JRuF8IepPS6cnWKEDqgqgb0YVjTE4CQ';
}
if (!process.env.TELEGRAM_GROUP_ID) {
    process.env.TELEGRAM_GROUP_ID = '-1002537429306';
}
if (!process.env.GMAIL_USER_EMAIL) {
    process.env.GMAIL_USER_EMAIL = 'cvf223@me.com';
}
if (!process.env.HUMAN_IN_THE_LOOP_ENABLED) {
    process.env.HUMAN_IN_THE_LOOP_ENABLED = 'true';
}
if (!process.env.OPENAI_API_KEY) {
    process.env.OPENAI_API_KEY = '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';
}

async function demonstrateHumanInTheLoopIntegration() {
    console.log('🚀 Testing Human-in-the-Loop Integration...\n');

    // Initialize database connection first
    console.log('🗄️ Initializing database connection...');
    try {
        await initializeDatabase();
        console.log('✅ Database connection established\n');
    } catch (error) {
        console.log('⚠️ Database connection failed, running in simulation mode\n');
        console.log('   (This is normal for demo without full database setup)\n');
        
        // Run demo without database operations
        await demonstrateSystemsWithoutDatabase();
        return;
    }

    // Initialize the systems
    const riskManagement = new RiskManagementSystem();
    await riskManagement.initialize();

    // Example 1: Gas Price Fallback Issue (would trigger human assistance)
    console.log('📋 EXAMPLE 1: Gas Price API Fallback Issue');
    console.log('============================================');
    
    const gasIssueContext = {
        type: 'gas_price_fallback',
        description: 'Multiple Arbitrum gas price APIs failing, using fallback prices',
        chain: 'arbitrum',
        agentId: 'arbitrage-agent-001',
        financialImpact: 2500, // $2.5k potential impact
        performanceImpact: 0.15, // 15% performance degradation
        fallbackPrice: '0.25 gwei',
        reason: 'Primary and secondary gas APIs unreachable for 15 minutes'
    };

    // This will trigger the sophisticated analysis system
    const result1 = await riskManagement.humanInTheLoop.requestHumanAssistance(gasIssueContext);
    console.log('🆘 Escalation Result:', result1);
    console.log('');

    // Example 2: Blocktime Performance Warning (automated detection)
    console.log('📋 EXAMPLE 2: Blocktime Performance Warning');
    console.log('==========================================');
    
    const performanceContext = {
        chain: 'arbitrum',
        executionTime: 300, // 300ms - exceeds Arbitrum half-blocktime (125ms)
        operation: 'opportunity_calculation',
        agentId: 'risk-management-system',
        opportunityId: 'ARB_USDC_WETH_12345'
    };

    // This will automatically detect blocktime violations and potentially escalate
    const performanceWarning = await riskManagement.humanInTheLoop.checkBlocktimePerformance(performanceContext);
    console.log('⏱️ Performance Warning:', performanceWarning);
    console.log('');

    // Example 3: Calculation Accuracy Issue (pattern detection)
    console.log('📋 EXAMPLE 3: Calculation Accuracy Pattern');
    console.log('=========================================');
    
    const accuracyContext = {
        type: 'calculation_accuracy_compromised',
        description: 'Profit difference exceeded 3% threshold in 8 recent opportunities',
        chain: 'polygon',
        agentId: 'profit-calculator-agent',
        financialImpact: 15000, // $15k cumulative impact
        impact: 'High accuracy deviation detected in profit calculations',
        reason: 'Expected vs actual profit variance indicates calculation drift'
    };

    const result3 = await riskManagement.humanInTheLoop.requestHumanAssistance(accuracyContext);
    console.log('🧠 LLM-Powered Analysis Result:', result3);
    console.log('');

    // Example 4: Show Escalation Metrics
    console.log('📋 EXAMPLE 4: Escalation Metrics Dashboard');
    console.log('=========================================');
    
    const metrics = await riskManagement.humanInTheLoop.getEscalationMetrics();
    console.log('📊 24h Escalation Metrics:');
    metrics.forEach(metric => {
        console.log(`   ${metric.urgency}: ${metric.total} total, ${metric.resolved_count} resolved`);
        if (metric.avg_resolution_time) {
            console.log(`      Avg Resolution: ${Math.round(metric.avg_resolution_time / 60)} minutes`);
        }
    });
    console.log('');

    // Example 5: Capability Creation with Human Approval
    console.log('📋 EXAMPLE 5: LLM-Powered Capability Creation');
    console.log('==============================================');
    
    const capabilitySystem = new CapabilityCreationSystem({
        enabled: true,
        llmDeveloperEnabled: true,
        requireHumanApproval: true
    });

    const capabilityRequest = await capabilitySystem.requestNewCapability(
        'arbitrage-agent-001',
        'Advanced MEV Bundle Protection for High-Value Transactions',
        {
            functionality: 'Implement commit-reveal scheme for transactions above $10k threshold',
            inputFormat: { transaction: 'object', threshold: 'number' },
            outputFormat: { bundleId: 'string', protectionLevel: 'string', estimatedCost: 'number' },
            integrationPoints: ['TransactionEngine', 'MEVProtectionSystem'],
            securityRequirements: ['Input validation', 'Rate limiting', 'Audit logging']
        },
        {
            urgency: 'high',
            expectedBenefit: 'Reduce MEV exposure by 80% for large transactions',
            marketContext: 'Recent MEV attacks on similar protocols'
        }
    );

    console.log('🧠 Capability Creation Result:', JSON.stringify(capabilityRequest, null, 2));
    console.log('');

    console.log('✅ Human-in-the-Loop Integration Complete!');
    console.log('');
    console.log('🎯 KEY FEATURES DEMONSTRATED:');
    console.log('   🤝 General-purpose human assistance (not hardcoded)');
    console.log('   🧠 LLM-powered intelligent recommendations');
    console.log('   📱 Real Telegram notifications with provided token');
    console.log('   📧 Gmail notifications to cvf223@me.com');
    console.log('   ⏱️ Automated blocktime performance monitoring');
    console.log('   📊 Pattern detection and escalation prioritization');
    console.log('   🔍 Dynamic urgency analysis based on multiple factors');
    console.log('   📈 Metrics tracking for continuous improvement');
    console.log('   🛠️ LLM-powered capability creation with human approval');
    console.log('   🎯 Context Engine instead of hardcoded prompts');
    console.log('   🔄 Complete workflow from request to implementation');
}

// Telegram Integration Test
async function testTelegramIntegration() {
    console.log('\n📱 TELEGRAM INTEGRATION TEST');
    console.log('============================');
    
    console.log('✅ Bot Token Configuration:');
    console.log(`   Token: ${process.env.TELEGRAM_BOT_TOKEN ? '***configured***' : '❌ MISSING'}`);
    console.log(`   Group ID: ${process.env.TELEGRAM_GROUP_ID || '❌ MISSING'}`);
    console.log(`   Enabled: ${process.env.TELEGRAM_NOTIFICATIONS_ENABLED || 'true'}`);
    
    if (process.env.TELEGRAM_BOT_TOKEN) {
        console.log('📨 Ready for real Telegram notifications!');
        console.log('   HIGH/CRITICAL escalations will be sent to Telegram');
        console.log('   Group: -1002537429306 (configured)');
    } else {
        console.log('⚠️  Telegram token not found in environment');
    }
}

// Environment Configuration Check
function checkEnvironmentConfig() {
    console.log('\n🔧 ENVIRONMENT CONFIGURATION CHECK');
    console.log('===================================');
    
    const requiredConfigs = [
        'TELEGRAM_BOT_TOKEN',
        'OPENAI_API_KEY',
        'POSTGRES_HOST',
        'HUMAN_IN_THE_LOOP_ENABLED'
    ];
    
    requiredConfigs.forEach(config = (typeof > { === "object" ? > { : {})
        const value = process.env[config];
        const status = value ? '✅ SET' : '❌ MISSING';
        console.log(`   ${config}: ${status}`);
    });
    
    console.log('\n🎛️ Human-in-the-Loop Settings:');
    console.log(`   Enabled: ${process.env.HUMAN_IN_THE_LOOP_ENABLED || 'true'}`);
    console.log(`   LLM Assistance: ${process.env.LLM_ASSISTANCE_ENABLED || 'true'}`);
    console.log(`   Telegram Notifications: ${process.env.TELEGRAM_NOTIFICATIONS_ENABLED || 'true'}`);
    console.log(`   Blocktime Monitoring: ${process.env.BLOCKTIME_MONITORING_ENABLED || 'true'}`);
}

// Run the integration test
if (import.meta.url === `file://${process.argv[1]}`) {
    try {
        await demonstrateHumanInTheLoopIntegration();
        await testTelegramIntegration();
        checkEnvironmentConfig();
    } catch (error) {
        console.error('❌ Integration test failed:', error);
        process.exit(1);
    }
}

// Demo without database (for testing purposes)
async function demonstrateSystemsWithoutDatabase() {
    console.log('📋 SIMULATION MODE: Human-in-the-Loop Systems Demo');
    console.log('==================================================\n');

    // Initialize systems in standalone mode
    const humanInTheLoop = new HumanInTheLoopSystem({
        enabled: true,
        llmAssistanceEnabled: true,
        telegramEnabled: true
    });

    const capabilitySystem = new CapabilityCreationSystem({
        enabled: true,
        llmDeveloperEnabled: true,
        requireHumanApproval: true
    });

    console.log('✅ Systems initialized in simulation mode\n');

    // Test urgency analysis (without database)
    console.log('📋 DEMO: Urgency Analysis System');
    console.log('================================');
    
    const testContext = {
        type: 'gas_price_fallback',
        chain: 'arbitrum',
        agentId: 'test-agent',
        financialImpact: 5000,
        performanceImpact: 0.25
    };

    const urgencyResult = await humanInTheLoop.analyzeUrgency(testContext);
    console.log('🎯 Urgency Analysis Result:');
    console.log(`   Priority: ${urgencyResult.urgency}`);
    console.log(`   Score: ${urgencyResult.score}/100`);
    console.log(`   Factors: ${urgencyResult.factors.join(', ')}`);
    console.log('');

    // Test blocktime performance monitoring
    console.log('📋 DEMO: Blocktime Performance Monitoring');
    console.log('=========================================');
    
    const performanceContext = {
        chain: 'arbitrum',
        executionTime: 300, // 300ms - exceeds half-blocktime
        operation: 'demo_calculation',
        agentId: 'demo-agent'
    };

    const performanceWarning = await humanInTheLoop.checkBlocktimePerformance(performanceContext);
    if (performanceWarning) {
        console.log('⚠️ Performance Warning Detected:');
        console.log(`   Chain: ${performanceWarning.chain}`);
        console.log(`   Execution Time: ${performanceWarning.executionTime}ms`);
        console.log(`   Half-Blocktime Threshold: ${performanceWarning.halfBlockTime}ms`);
        console.log(`   Overage: ${performanceWarning.overagePercentage.toFixed(1)}%`);
    } else {
        console.log('✅ Performance within acceptable limits');
    }
    console.log('');

    // Test capability validation
    console.log('📋 DEMO: Capability Request Validation');
    console.log('======================================');
    
    const capabilityValidation = await capabilitySystem.validateCapabilityRequest(
        'demo-agent',
        'Advanced MEV Protection System',
        {
            functionality: 'Implement commit-reveal scheme for high-value transactions',
            inputFormat: { transaction: 'object', threshold: 'number' },
            outputFormat: { bundleId: 'string', protectionLevel: 'string' }
        },
        { urgency: 'high' }
    );

    console.log('🔍 Validation Result:');
    console.log(`   Valid: ${capabilityValidation.valid}`);
    console.log(`   Reason: ${capabilityValidation.reason}`);
    console.log('');

    console.log('✅ SIMULATION DEMO COMPLETE!');
    console.log('');
    console.log('🎯 DEMONSTRATED FEATURES:');
    console.log('   🤝 Dynamic urgency analysis');
    console.log('   ⏱️ Blocktime performance monitoring');
    console.log('   🔍 Capability request validation');
    console.log('   🧠 LLM-powered intelligent systems');
    console.log('   📱 Ready for Telegram & Gmail notifications');
    console.log('   🎯 Context Engine integration');
    console.log('');
    console.log('💡 To run with full database integration:');
    console.log('   1. Set up PostgreSQL database');
    console.log('   2. Run database initialization scripts');
    console.log('   3. Configure environment variables');
}

export { 
    demonstrateHumanInTheLoopIntegration, 
    demonstrateSystemsWithoutDatabase,
    testTelegramIntegration, 
    checkEnvironmentConfig 
};
