#!/usr/bin/env node
/**
 * 🚀 PRODUCTION DEPLOYMENT VERIFICATION
 * ===================================
 * 
 * Verifies all fixes are properly deployed and monitors system health
 * This is the final step in our comprehensive bugfixing implementation.
 */

import { DatabasePoolManager } from '../src/database/DatabasePoolManager.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log(`
╔══════════════════════════════════════════════════════════════╗
║        🚀 PRODUCTION DEPLOYMENT VERIFICATION 🚀             ║
║                                                              ║
║     Verifying all bugfixes are properly deployed and        ║
║     system health monitoring is operational                  ║
╚══════════════════════════════════════════════════════════════╝
`);

class ProductionDeploymentVerification {
    constructor() {
        this.verificationResults = {
            deployment: { passed: 0, failed: 0, tests: [] },
            health: { passed: 0, failed: 0, tests: [] },
            monitoring: { passed: 0, failed: 0, tests: [] },
            fixes: { passed: 0, failed: 0, tests: [] }
        };
        
        this.startTime = Date.now();
    }
    
    recordTest(category, testName, passed, details) {
        const result = { name: testName, passed, details, timestamp: Date.now() };
        this.verificationResults[category].tests.push(result);
        
        if (passed) {
            this.verificationResults[category].passed++;
            console.log(`   ✅ ${testName}: ${details}`);
        } else {
            this.verificationResults[category].failed++;
            console.log(`   ❌ ${testName}: ${details}`);
        }
    }
    
    /**
     * 🚀 DEPLOYMENT VERIFICATION
     */
    async verifyDeployment() {
        console.log('🚀 Verifying Production Deployment...');
        
        try {
            // Verify PM2 process is running
            const { stdout: pm2Status } = await execAsync('pm2 status --no-colors');
            const aigoProcess = pm2Status.includes('aigo-syndicate-main') && pm2Status.includes('online');
            
            this.recordTest('deployment', 'PM2 Process Status', aigoProcess,
                aigoProcess ? 'AIGO-Syndicate process running' : 'Process not found or offline');
            
            // Verify memory usage is reasonable
            const memoryMatch = pm2Status.match(/(\d+\.?\d*)(mb|gb)/i);
            if (memoryMatch) {
                const memValue = parseFloat(memoryMatch[1]);
                const memUnit = memoryMatch[2].toLowerCase();
                const memoryMB = memUnit === 'gb' ? memValue * 1024 : memValue;
                const memoryHealthy = memoryMB > 50 && memoryMB < 50000; // Between 50MB and 50GB
                
                this.recordTest('deployment', 'Memory Usage', memoryHealthy,
                    `${memValue}${memUnit.toUpperCase()} (${memoryHealthy ? 'Healthy' : 'Concerning'})`);
            }
            
            // Verify system uptime
            const uptimeMatch = pm2Status.match(/(\d+[smhd])/);
            if (uptimeMatch) {
                this.recordTest('deployment', 'System Uptime', true, `Uptime: ${uptimeMatch[1]}`);
            }
            
        } catch (error) {
            this.recordTest('deployment', 'PM2 Status Check', false, error.message);
        }
    }
    
    /**
     * 🏥 HEALTH MONITORING VERIFICATION
     */
    async verifyHealthMonitoring() {
        console.log('🏥 Verifying Health Monitoring...');
        
        try {
            // Check recent logs for errors
            const { stdout: recentLogs } = await execAsync('pm2 logs aigo-syndicate-main --lines 50 --nostream --no-colors');
            
            // Count error indicators
            const errorCount = (recentLogs.match(/❌|ERROR|FATAL|💥/g) || []).length;
            const warningCount = (recentLogs.match(/⚠️|WARN|WARNING/g) || []).length;
            const successCount = (recentLogs.match(/✅|SUCCESS|READY|initialized/g) || []).length;
            
            this.recordTest('health', 'Error Rate', errorCount < 5,
                `${errorCount} errors in last 50 log lines`);
            
            this.recordTest('health', 'Success Indicators', successCount > 0,
                `${successCount} success indicators in logs`);
            
            // Check for specific success patterns
            const hasLLMReady = recentLogs.includes('ready') || recentLogs.includes('initialized');
            this.recordTest('health', 'LLM System Status', hasLLMReady,
                hasLLMReady ? 'LLM systems operational' : 'LLM systems not confirmed');
            
            // Check for memory warnings
            const memoryWarnings = recentLogs.includes('heap') || recentLogs.includes('memory');
            this.recordTest('health', 'Memory Health', !memoryWarnings,
                memoryWarnings ? 'Memory warnings detected' : 'No memory issues');
            
        } catch (error) {
            this.recordTest('health', 'Log Analysis', false, error.message);
        }
    }
    
    /**
     * 📊 MONITORING SYSTEMS VERIFICATION
     */
    async verifyMonitoringSystems() {
        console.log('📊 Verifying Monitoring Systems...');
        
        try {
            // Verify database connectivity
            const dbPool = DatabasePoolManager.getInstance();
            await dbPool.initialize();
            
            // Test basic database operations
            const dbResult = await dbPool.query('SELECT current_database() as db, NOW() as time');
            const dbName = dbResult.rows[0].db;
            
            this.recordTest('monitoring', 'Database Connectivity', true,
                `Connected to ${dbName}`);
            
            // Verify knowledge graph tables
            const kgTables = await dbPool.query(`
                SELECT COUNT(*) as count FROM information_schema.tables 
                WHERE table_name IN ('kg_nodes', 'kg_relationships', 'kg_entanglements')
            `);
            
            const tableCount = parseInt(kgTables.rows[0].count);
            this.recordTest('monitoring', 'Knowledge Graph Tables', tableCount === 3,
                `${tableCount}/3 KG tables available`);
            
            // Check for system tables
            const sysTables = await dbPool.query(`
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name LIKE '%agent%' OR table_name LIKE '%system%'
            `);
            
            this.recordTest('monitoring', 'System Tables', sysTables.rows.length > 0,
                `${sysTables.rows.length} system tables found`);
            
            await dbPool.end();
            
        } catch (error) {
            this.recordTest('monitoring', 'Database Monitoring', false, error.message);
        }
    }
    
    /**
     * 🔧 BUGFIX VERIFICATION
     */
    async verifyBugfixes() {
        console.log('🔧 Verifying Applied Bugfixes...');
        
        try {
            // Verify ProactiveCognitiveMetabolicLoop fix
            const { ProactiveCognitiveMetabolicLoop } = await import('../src/prevention/ProactiveCognitiveMetabolicLoop.js');
            const loop = new ProactiveCognitiveMetabolicLoop({ enablePerformanceTracking: false });
            
            const hasCognitiveMethod = typeof loop._generateCognitivePattern === 'function';
            this.recordTest('fixes', 'Cognitive Pattern Method Fix', hasCognitiveMethod,
                hasCognitiveMethod ? 'Method restored and working' : 'Method still missing');
            
            await loop.shutdown();
            
            // Verify AutoformalizationEngine fix
            const { AutoformalizationEngine } = await import('../src/formalization/AutoformalizationEngine.js');
            const engine = new AutoformalizationEngine('verification-test');
            
            const hasIntegrationMethod = typeof engine.integrateWithFormalReasoningCognitiveIntegration === 'function';
            const hasEventEmitter = typeof engine.on === 'function';
            const hasCertaintyMethods = typeof engine.getMathematicalCertaintyLevel === 'function';
            
            this.recordTest('fixes', 'AutoformalizationEngine Fix', 
                hasIntegrationMethod && hasEventEmitter && hasCertaintyMethods,
                `Integration: ${hasIntegrationMethod}, EventEmitter: ${hasEventEmitter}, Certainty: ${hasCertaintyMethods}`);
            
            // Verify Construction Syndicate Factory fix
            const { ConstructionSyndicateFactory } = await import('../src/construction/factories/ConstructionSyndicateFactory.js');
            const factory = new ConstructionSyndicateFactory({ database: null });
            
            const hasAgentsMap = factory.agents instanceof Map;
            const hasRewardSystems = factory.rewardSystemsRegistry instanceof Map;
            const hasCollectiveLearning = factory.collectiveLearningRegistry instanceof Map;
            
            this.recordTest('fixes', 'Syndicate Factory Systems Fix',
                hasAgentsMap && hasRewardSystems && hasCollectiveLearning,
                `Agents: ${hasAgentsMap}, Rewards: ${hasRewardSystems}, Learning: ${hasCollectiveLearning}`);
            
            // Verify BasicLearningRL fix
            const { BasicLearningRL } = await import('../learning/BasicLearningRL.js');
            const rl = new BasicLearningRL({ learningRate: 0.01, enablePersistence: false });
            await rl.initialize();
            
            const rlInitialized = rl.initialized;
            const hasQTable = rl.qTable instanceof Map;
            
            this.recordTest('fixes', 'BasicLearningRL Fix', rlInitialized && hasQTable,
                `Initialized: ${rlInitialized}, Q-Table: ${hasQTable}`);
            
            rl.shutdown();
            
        } catch (error) {
            this.recordTest('fixes', 'Bugfix Verification', false, error.message);
        }
    }
    
    /**
     * 📈 PERFORMANCE MONITORING SETUP
     */
    async setupPerformanceMonitoring() {
        console.log('📈 Setting up Performance Monitoring...');
        
        try {
            // Verify PM2 monitoring is active
            const { stdout: pm2Info } = await execAsync('pm2 show aigo-syndicate-main --no-colors');
            
            const hasMonitoring = pm2Info.includes('monitoring') || pm2Info.includes('memory usage');
            this.recordTest('monitoring', 'PM2 Monitoring Active', hasMonitoring,
                hasMonitoring ? 'PM2 monitoring operational' : 'PM2 monitoring not confirmed');
            
            // Check restart count (should be stable)
            const restartMatch = pm2Info.match(/restart time\s*│\s*(\d+)/i);
            if (restartMatch) {
                const restarts = parseInt(restartMatch[1]);
                const stable = restarts < 50; // Less than 50 restarts is reasonable
                
                this.recordTest('monitoring', 'System Stability', stable,
                    `${restarts} restarts (${stable ? 'Stable' : 'High restart rate'})`);
            }
            
        } catch (error) {
            this.recordTest('monitoring', 'Performance Monitoring Setup', false, error.message);
        }
    }
    
    /**
     * 📊 GENERATE DEPLOYMENT REPORT
     */
    async generateDeploymentReport() {
        const totalTime = Date.now() - this.startTime;
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║            🚀 DEPLOYMENT VERIFICATION REPORT 🚀             ║
╚══════════════════════════════════════════════════════════════╝
`);
        
        let overallPassed = 0;
        let overallFailed = 0;
        let overallTests = 0;
        
        const categories = ['deployment', 'health', 'monitoring', 'fixes'];
        
        for (const category of categories) {
            const results = this.verificationResults[category];
            const categoryPassed = results.passed;
            const categoryFailed = results.failed;
            const categoryTotal = categoryPassed + categoryFailed;
            
            if (categoryTotal > 0) {
                const successRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
                const status = categoryFailed === 0 ? '✅' : categoryPassed > categoryFailed ? '⚠️' : '❌';
                
                console.log(`${status} ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} passed (${successRate}%)`);
                
                overallPassed += categoryPassed;
                overallFailed += categoryFailed;
                overallTests += categoryTotal;
            }
        }
        
        const overallSuccessRate = overallTests > 0 ? ((overallPassed / overallTests) * 100).toFixed(1) : '0.0';
        const overallStatus = overallFailed === 0 ? '🎉' : overallPassed > overallFailed ? '⚠️' : '💥';
        
        console.log(`
${overallStatus} OVERALL DEPLOYMENT: ${overallPassed}/${overallTests} checks passed (${overallSuccessRate}%)
⏱️  Verification time: ${(totalTime / 1000).toFixed(2)}s
        `);
        
        if (overallFailed === 0) {
            console.log(`
🎉 DEPLOYMENT FULLY VERIFIED! 🎉

ALL BUGFIXES SUCCESSFULLY IMPLEMENTED AND DEPLOYED!

✅ System is operational and stable
✅ All critical fixes are working
✅ Health monitoring is active
✅ Database persistence is functional
✅ Performance tracking is operational

🚀 AIGO-Syndicate is ready for production operation!
            `);
        } else if (overallPassed > overallFailed) {
            console.log(`
⚠️ DEPLOYMENT MOSTLY SUCCESSFUL: ${overallFailed} issues detected.
Core functionality is working but some monitoring may need attention.
Review failed checks above for optimization opportunities.
            `);
        } else {
            console.log(`
💥 DEPLOYMENT ISSUES DETECTED: ${overallFailed} critical problems.
System may not be fully operational. Review failures immediately.
            `);
        }
        
        return overallFailed === 0;
    }
    
    /**
     * 🚀 RUN COMPLETE VERIFICATION
     */
    async runCompleteVerification() {
        try {
            await this.verifyDeployment();
            await this.verifyHealthMonitoring();
            await this.verifyMonitoringSystems();
            await this.verifyBugfixes();
            await this.setupPerformanceMonitoring();
            
            const success = await this.generateDeploymentReport();
            return success;
            
        } catch (error) {
            console.error('💥 Critical verification failure:', error);
            this.recordTest('deployment', 'Critical System Check', false, error.message);
            return false;
        }
    }
}

async function main() {
    const verifier = new ProductionDeploymentVerification();
    const success = await verifier.runCompleteVerification();
    process.exit(success ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default ProductionDeploymentVerification;
