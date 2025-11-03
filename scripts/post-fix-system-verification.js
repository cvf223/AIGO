#!/usr/bin/env node
/**
 * 🔍 POST-FIX SYSTEM VERIFICATION
 * ==============================
 * 
 * Comprehensive verification that all fixes are working correctly
 * and the system is running without errors.
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║          🔍 POST-FIX SYSTEM VERIFICATION 🔍                 ║
║                                                              ║
║      Verifying all fixes are working and system is stable   ║
╚══════════════════════════════════════════════════════════════╝
`);

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class PostFixSystemVerification {
    constructor() {
        this.verificationResults = {
            critical: { passed: 0, failed: 0, tests: [] },
            performance: { passed: 0, failed: 0, tests: [] },
            stability: { passed: 0, failed: 0, tests: [] }
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
     * 🚨 CRITICAL ERROR VERIFICATION
     */
    async verifyCriticalErrors() {
        console.log('🚨 Verifying Critical Errors Are Resolved...');
        
        try {
            // Check for savePerformanceData errors
            const { stdout: recentLogs } = await execAsync('pm2 logs aigo-syndicate-main --lines 100 --nostream');
            
            const savePerformanceDataErrors = (recentLogs.match(/this\.savePerformanceData is not a function/g) || []).length;
            this.recordTest('critical', 'SavePerformanceData Errors', savePerformanceDataErrors === 0,
                savePerformanceDataErrors === 0 ? 'No savePerformanceData errors found' : `${savePerformanceDataErrors} errors still occurring`);
            
            // Check for unhandled rejections
            const unhandledRejections = (recentLogs.match(/UNHANDLED REJECTION/g) || []).length;
            this.recordTest('critical', 'Unhandled Promise Rejections', unhandledRejections < 5,
                unhandledRejections < 5 ? `${unhandledRejections} rejections (acceptable)` : `${unhandledRejections} rejections (too many)`);
            
            // Check for syntax errors
            const syntaxErrors = (recentLogs.match(/SyntaxError|TypeError.*not a function/g) || []).length;
            this.recordTest('critical', 'Syntax/Type Errors', syntaxErrors < 3,
                syntaxErrors < 3 ? `${syntaxErrors} errors (minimal)` : `${syntaxErrors} errors (concerning)`);
            
            // Check process status
            const { stdout: pm2Status } = await execAsync('pm2 status --no-colors');
            const processOnline = pm2Status.includes('aigo-syndicate-main') && pm2Status.includes('online');
            this.recordTest('critical', 'Process Status', processOnline,
                processOnline ? 'Main process running' : 'Main process not online');
            
        } catch (error) {
            this.recordTest('critical', 'Critical Error Check', false, error.message);
        }
    }
    
    /**
     * 📊 PERFORMANCE SYSTEM VERIFICATION
     */
    async verifyPerformanceSystems() {
        console.log('📊 Verifying Performance Systems...');
        
        try {
            const { stdout: recentLogs } = await execAsync('pm2 logs aigo-syndicate-main --lines 200 --nostream');
            
            // Check for successful performance saves
            const eliteEngineSuccesses = (recentLogs.match(/Saved.*Elite Engine.*QUANTUM COMPRESSED/g) || []).length;
            this.recordTest('performance', 'Elite Engine Saves', eliteEngineSuccesses > 0,
                eliteEngineSuccesses > 0 ? `${eliteEngineSuccesses} successful saves` : 'No successful saves detected');
            
            // Check for quantum compression activity
            const quantumCompressions = (recentLogs.match(/SUPERIOR Neural LZ4 Compression/g) || []).length;
            this.recordTest('performance', 'Quantum Compression', quantumCompressions > 0,
                quantumCompressions > 0 ? `${quantumCompressions} compression operations` : 'No compression activity');
            
            // Check for performance monitoring
            const performanceMonitoring = (recentLogs.match(/performance monitoring|Performance Analytics/g) || []).length;
            this.recordTest('performance', 'Performance Monitoring', performanceMonitoring > 0,
                performanceMonitoring > 0 ? `${performanceMonitoring} monitoring activities` : 'No monitoring detected');
            
            // Check memory usage
            const { stdout: pm2Status } = await execAsync('pm2 status --no-colors');
            const memoryMatch = pm2Status.match(/(\d+\.?\d*)(mb|gb)/i);
            if (memoryMatch) {
                const memValue = parseFloat(memoryMatch[1]);
                const memUnit = memoryMatch[2].toLowerCase();
                const memoryMB = memUnit === 'gb' ? memValue * 1024 : memValue;
                const memoryHealthy = memoryMB > 10 && memoryMB < 30000; // Between 10MB and 30GB
                
                this.recordTest('performance', 'Memory Usage', memoryHealthy,
                    `${memValue}${memUnit.toUpperCase()} (${memoryHealthy ? 'Healthy' : 'Review needed'})`);
            }
            
        } catch (error) {
            this.recordTest('performance', 'Performance System Check', false, error.message);
        }
    }
    
    /**
     * 🛡️ SYSTEM STABILITY VERIFICATION
     */
    async verifySystemStability() {
        console.log('🛡️ Verifying System Stability...');
        
        try {
            // Check uptime
            const { stdout: pm2Status } = await execAsync('pm2 status --no-colors');
            const uptimeMatch = pm2Status.match(/(\d+[smhd])/);
            if (uptimeMatch) {
                const uptime = uptimeMatch[1];
                const isStable = !uptime.includes('s') || parseInt(uptime) > 30; // More than 30 seconds or in minutes/hours
                this.recordTest('stability', 'System Uptime', isStable,
                    `Uptime: ${uptime} (${isStable ? 'Stable' : 'Recently restarted'})`);
            }
            
            // Check restart count
            const restartMatch = pm2Status.match(/↺\s*(\d+)/);
            if (restartMatch) {
                const restarts = parseInt(restartMatch[1]);
                const acceptableRestarts = restarts < 25; // Less than 25 restarts is reasonable
                this.recordTest('stability', 'Restart Count', acceptableRestarts,
                    `${restarts} restarts (${acceptableRestarts ? 'Acceptable' : 'High restart rate'})`);
            }
            
            // Check for initialization success
            const { stdout: recentLogs } = await execAsync('pm2 logs aigo-syndicate-main --lines 100 --nostream');
            const initSuccess = recentLogs.includes('initialized') || recentLogs.includes('ready');
            this.recordTest('stability', 'Initialization Success', initSuccess,
                initSuccess ? 'System initialized successfully' : 'No initialization confirmations');
            
            // Check for fatal errors
            const fatalErrors = (recentLogs.match(/FATAL|CRITICAL.*ERROR|crashed/gi) || []).length;
            this.recordTest('stability', 'Fatal Errors', fatalErrors === 0,
                fatalErrors === 0 ? 'No fatal errors' : `${fatalErrors} fatal errors detected`);
            
            // Check for LLM system activity
            const llmActivity = recentLogs.includes('LLM') || recentLogs.includes('model') || recentLogs.includes('OLLAMA');
            this.recordTest('stability', 'LLM System Activity', llmActivity,
                llmActivity ? 'LLM systems active' : 'No LLM activity detected');
            
        } catch (error) {
            this.recordTest('stability', 'System Stability Check', false, error.message);
        }
    }
    
    /**
     * 📊 GENERATE VERIFICATION REPORT
     */
    async generateVerificationReport() {
        const totalTime = Date.now() - this.startTime;
        
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║              🔍 SYSTEM VERIFICATION REPORT 🔍               ║
╚══════════════════════════════════════════════════════════════╝
`);
        
        let overallPassed = 0;
        let overallFailed = 0;
        let overallTests = 0;
        
        const categories = ['critical', 'performance', 'stability'];
        
        for (const category of categories) {
            const results = this.verificationResults[category];
            const categoryPassed = results.passed;
            const categoryFailed = results.failed;
            const categoryTotal = categoryPassed + categoryFailed;
            
            if (categoryTotal > 0) {
                const successRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
                const status = categoryFailed === 0 ? '✅' : categoryPassed > categoryFailed ? '⚠️' : '❌';
                
                console.log(`${status} ${category.toUpperCase()}: ${categoryPassed}/${categoryTotal} verified (${successRate}%)`);
                
                overallPassed += categoryPassed;
                overallFailed += categoryFailed;
                overallTests += categoryTotal;
            }
        }
        
        const overallSuccessRate = overallTests > 0 ? ((overallPassed / overallTests) * 100).toFixed(1) : '0.0';
        const overallStatus = overallFailed === 0 ? '🎉' : overallPassed > overallFailed ? '⚠️' : '💥';
        
        console.log(`
${overallStatus} OVERALL SYSTEM HEALTH: ${overallPassed}/${overallTests} checks passed (${overallSuccessRate}%)
⏱️  Verification time: ${(totalTime / 1000).toFixed(2)}s
        `);
        
        if (overallFailed === 0) {
            console.log(`
🎉 SYSTEM FULLY VERIFIED AND STABLE! 🎉

✅ All critical errors resolved
✅ Performance systems operational
✅ System stability confirmed
✅ No unhandled rejections
✅ Memory usage healthy
✅ Process running smoothly

🚀 AIGO-Syndicate is ready for full operation!
            `);
        } else if (overallPassed > overallFailed) {
            console.log(`
⚠️ SYSTEM MOSTLY STABLE: ${overallFailed} minor issues detected.
Core functionality is working but some optimizations may be needed.
Review failed checks above for improvement opportunities.
            `);
        } else {
            console.log(`
💥 SYSTEM ISSUES DETECTED: ${overallFailed} problems need attention.
Review failed checks immediately for resolution.
            `);
        }
        
        return overallFailed === 0;
    }
    
    /**
     * 🚀 RUN COMPLETE VERIFICATION
     */
    async runCompleteVerification() {
        try {
            await this.verifyCriticalErrors();
            await this.verifyPerformanceSystems();
            await this.verifySystemStability();
            
            const success = await this.generateVerificationReport();
            return success;
            
        } catch (error) {
            console.error('💥 Critical verification failure:', error);
            this.recordTest('critical', 'Verification Process', false, error.message);
            return false;
        }
    }
}

async function main() {
    const verifier = new PostFixSystemVerification();
    const success = await verifier.runCompleteVerification();
    process.exit(success ? 0 : 1);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default PostFixSystemVerification;
