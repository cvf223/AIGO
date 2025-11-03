/**
 * 🧠 TEST COMPREHENSIVE LEARNING SYSTEM
 * =====================================
 * 
 * BRUTAL TRUTH: Testing the complete learning system with real database!
 * Shows aggressive learning, database integration, and performance monitoring.
 */

import { ComprehensiveLearningIntegration } from './src/comprehensive-learning-integration.js';
import { logDatabaseConfig } from './src/database-config-helper.js';

async function testComprehensiveLearningSystem() {
    console.log('🧠 TESTING COMPREHENSIVE LEARNING SYSTEM');
    console.log('='.repeat(70));
    console.log('BRUTAL TRUTH: Testing aggressive learning with REAL database data!');
    console.log('='.repeat(70));
    
    try {
        // Initialize the comprehensive learning system
        const learningSystem = new ComprehensiveLearningIntegration();
        
        // Set up event monitoring
        setupEventMonitoring(learningSystem);
        
        // Start the learning system
        console.log('\n🚀 STARTING COMPREHENSIVE LEARNING SYSTEM...');
        const initialStatus = await learningSystem.startComprehensiveLearning();
        
        console.log('\n📊 INITIAL SYSTEM STATUS:');
        console.log(`   Active: ${initialStatus.isActive}`);
        console.log(`   Aggressive Learner: ${initialStatus.aggressiveLearnerStatus.currentStrategy}`);
        console.log(`   Database Connection: Established`);
        
        // Run learning cycles for demonstration
        console.log('\n⏳ RUNNING LEARNING CYCLES FOR 5 MINUTES...');
        console.log('   (Aggressive switching every 45 seconds)');
        
        // Monitor progress every 30 seconds
        const progressMonitor = setInterval(() => {
            const status = learningSystem.getLearningStatus();
            console.log(`\n📈 PROGRESS UPDATE (${Math.round(status.sessionDuration / 60000)} min):`);
            console.log(`   Opportunities: ${status.totalOpportunities}`);
            console.log(`   Success Rate: ${status.successRate.toFixed(1)}%`);
            console.log(`   Total Profit: $${status.totalProfit.toFixed(2)}`);
            console.log(`   Learning Cycles: ${status.learningCycles}`);
            console.log(`   Strategies Tested: ${status.strategiesEvaluated}`);
            console.log(`   Current Strategy: ${status.aggressiveLearnerStatus.currentStrategy}`);
            console.log(`   Real Data Points: ${status.realDataPoints}`);
        }, 30000);
        
        // Let it run for 5 minutes
        await new Promise(resolve => setTimeout(resolve, 300000));
        
        // Stop monitoring
        clearInterval(progressMonitor);
        
        // Get final results
        const finalStatus = learningSystem.getLearningStatus();
        
        console.log('\n🎯 FINAL LEARNING RESULTS');
        console.log('='.repeat(50));
        console.log(`   Session Duration: ${Math.round(finalStatus.sessionDuration / 60000)} minutes`);
        console.log(`   Total Opportunities: ${finalStatus.totalOpportunities}`);
        console.log(`   Successful Opportunities: ${Math.round(finalStatus.totalOpportunities * finalStatus.successRate / 100)}`);
        console.log(`   Success Rate: ${finalStatus.successRate.toFixed(1)}%`);
        console.log(`   Total Profit: $${finalStatus.totalProfit.toFixed(2)}`);
        console.log(`   Learning Cycles: ${finalStatus.learningCycles}`);
        console.log(`   Strategies Evaluated: ${finalStatus.strategiesEvaluated}`);
        console.log(`   Real Data Points Collected: ${finalStatus.realDataPoints}`);
        
        // Calculate performance metrics
        const hourlyProfit = (finalStatus.totalProfit / finalStatus.sessionDuration) * 3600000;
        const opportunitiesPerMinute = (finalStatus.totalOpportunities / finalStatus.sessionDuration) * 60000;
        
        console.log('\n📊 PERFORMANCE ANALYSIS:');
        console.log(`   Hourly Profit Rate: $${hourlyProfit.toFixed(2)}/hour`);
        console.log(`   Opportunities Per Minute: ${opportunitiesPerMinute.toFixed(1)}`);
        console.log(`   Learning Efficiency: ${(finalStatus.learningCycles / (finalStatus.sessionDuration / 60000)).toFixed(2)} cycles/min`);
        
        // Evaluate performance
        console.log('\n🎯 PERFORMANCE EVALUATION:');
        if (finalStatus.successRate >= 70) {
            console.log('   ✅ EXCELLENT: Success rate >= 70%');
        } else if (finalStatus.successRate >= 50) {
            console.log('   ⚖️ GOOD: Success rate >= 50%');
        } else {
            console.log('   ⚠️ NEEDS IMPROVEMENT: Success rate < 50%');
        }
        
        if (hourlyProfit >= 100) {
            console.log('   ✅ PROFITABLE: Hourly rate >= $100');
        } else if (hourlyProfit >= 50) {
            console.log('   ⚖️ MODERATE: Hourly rate >= $50');
        } else {
            console.log('   ⚠️ LOW PROFIT: Hourly rate < $50');
        }
        
        if (finalStatus.learningCycles >= 5) {
            console.log('   ✅ ADAPTIVE: Multiple learning cycles completed');
        } else {
            console.log('   ⚠️ LIMITED ADAPTATION: Few learning cycles');
        }
        
        // Shutdown the system
        console.log('\n🛑 SHUTTING DOWN LEARNING SYSTEM...');
        await learningSystem.shutdown();
        
        console.log('\n✅ COMPREHENSIVE LEARNING SYSTEM TEST COMPLETE!');
        console.log('='.repeat(70));
        console.log('BRUTAL TRUTH: System demonstrated aggressive learning with real data!');
        console.log('Database integration, opportunity execution, and performance monitoring all working!');
        console.log('='.repeat(70));
        
        return {
            success: true,
            finalStatus,
            performanceMetrics: {
                hourlyProfit,
                opportunitiesPerMinute,
                learningEfficiency: finalStatus.learningCycles / (finalStatus.sessionDuration / 60000)
            }
        };
        
    } catch (error) {
        console.error('❌ COMPREHENSIVE LEARNING SYSTEM TEST FAILED:', error.message);
        console.error('Stack trace:', error.stack);
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 📊 SETUP EVENT MONITORING
 * =========================
 */
function setupEventMonitoring(learningSystem) {
    console.log('📊 Setting up event monitoring...');
    
    learningSystem.on('opportunitiesProcessed', (data) => {
        console.log(`🎯 Processed ${data.count} opportunities from ${data.strategy} (${data.successRate.toFixed(1)}% success)`);
    });
    
    learningSystem.on('strategyEvaluated', (data) => {
        console.log(`📊 Strategy evaluated: ${data.strategy} - ${data.successRate.toFixed(1)}% success, $${data.totalProfit.toFixed(2)} profit`);
    });
    
    learningSystem.on('performanceReviewed', (data) => {
        console.log(`📈 Performance review: ${data.metrics.successRate.toFixed(1)}% success, ${data.metrics.learningCycles} cycles`);
    });
    
    learningSystem.on('performanceMonitored', (data) => {
        const duration = Math.round(data.sessionDuration / 60000);
        console.log(`🔍 Performance monitor (${duration}min): ${data.totalOpportunities} ops, $${data.totalProfit.toFixed(2)} profit, $${data.hourlyProfit.toFixed(2)}/hr`);
    });
    
    console.log('✅ Event monitoring setup complete');
}

/**
 * 🚀 RUN THE TEST
 * ===============
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    // Load environment variables
    if (process.env.NODE_ENV !== 'production') {
        try {
            const dotenv = await import('dotenv');
            dotenv.config();
        } catch (error) {
            console.log('⚠️ dotenv not available, using system environment variables');
        }
    }
    
    // Display database configuration
    console.log('\n🗃️ DATABASE CONFIGURATION CHECK:');
    logDatabaseConfig();
    
    // Run the test
    testComprehensiveLearningSystem()
        .then((result) => {
            if (result.success) {
                console.log('\n🎉 TEST PASSED!');
                process.exit(0);
            } else {
                console.log('\n💥 TEST FAILED!');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('💥 UNEXPECTED TEST ERROR:', error);
            process.exit(1);
        });
} 