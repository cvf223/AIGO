/**
 * 🏥 HEALTH MONITORING SYSTEM
 * ===========================
 */

import { EventEmitter } from 'events';

export class HealthMonitor extends EventEmitter {
    constructor() {
        super();
        this.checks = new Map();
        this.checkInterval = null;
        this.history = [];
    }
    
    registerCheck(name, checkFn) {
        this.checks.set(name, {
            fn: checkFn,
            lastResult: null,
            consecutiveFailures: 0
        });
    }
    
    async runChecks() {
        const results = {};
        
        for (const [name, check] of this.checks) {
            try {
                const result = await check.fn();
                results[name] = { healthy: result, error: null };
                check.lastResult = result;
                check.consecutiveFailures = 0;
            } catch (error) {
                results[name] = { healthy: false, error: error.message };
                check.consecutiveFailures++;
                
                if (check.consecutiveFailures >= 3) {
                    this.emit('healthCheckFailed', { name, error });
                }
            }
        }
        
        const overallHealth = Object.values(results).every(r => r.healthy);
        
        this.history.push({
            timestamp: Date.now(),
            results,
            healthy: overallHealth
        });
        
        if (this.history.length > 100) this.history.shift();
        
        return { healthy: overallHealth, checks: results };
    }
    
    startMonitoring(intervalMs = 60000) {
        this.checkInterval = setInterval(() => {
            this.runChecks();
        }, intervalMs);
    }
    
    stopMonitoring() {
        if (this.checkInterval) clearInterval(this.checkInterval);
    }
}

const healthMonitor = new HealthMonitor();
export default healthMonitor;

