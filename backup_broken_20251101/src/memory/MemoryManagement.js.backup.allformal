/**
 * 💾 PRODUCTION MEMORY MANAGEMENT SYSTEM
 * ======================================
 * 
 * Prevents memory leaks and heap exhaustion
 * - Automatic heap monitoring
 * - Memory leak detection
 * - Resource cleanup
 * - Garbage collection hints
 */

import { EventEmitter } from 'events';
import v8 from 'v8';

export class MemoryManagement extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            heapThresholdMB: config.heapThresholdMB || 60000, // 60GB for 896GB server
            warningThresholdMB: config.warningThresholdMB || 55000, // 55GB warning
            checkIntervalMs: config.checkIntervalMs || 30000, // 30s
            enableAutomaticGC: config.enableAutomaticGC !== false,
            snapshotOnThreshold: config.snapshotOnThreshold !== false
        };
        
        this.heapSnapshots = [];
        this.maxSnapshots = 5;
        this.isMonitoring = false;
        this.checkInterval = null;
        
        // Weak collections for auto-cleanup
        this.weakRefs = new WeakMap();
        this.cleanupCallbacks = new Set();
        
        console.log('💾 MemoryManagement initialized');
        console.log(`   🎯 Heap threshold: ${this.config.heapThresholdMB}MB`);
        console.log(`   ⚠️ Warning threshold: ${this.config.warningThresholdMB}MB`);
    }
    
    /**
     * Start monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        this.checkInterval = setInterval(() => {
            this.checkMemoryUsage();
        }, this.config.checkIntervalMs);
        
        console.log('📊 Memory monitoring started');
    }
    
    /**
     * Check current memory usage
     */
    checkMemoryUsage() {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const externalMB = Math.round(usage.external / 1024 / 1024);
        
        // Check thresholds
        if (heapUsedMB > this.config.heapThresholdMB) {
            console.error(`🚨 MEMORY THRESHOLD EXCEEDED: ${heapUsedMB}MB / ${this.config.heapThresholdMB}MB`);
            this.handleMemoryPressure('critical');
        } else if (heapUsedMB > this.config.warningThresholdMB) {
            console.warn(`⚠️ Memory warning: ${heapUsedMB}MB / ${this.config.heapThresholdMB}MB`);
            this.handleMemoryPressure('warning');
        }
        
        this.emit('memoryCheck', {
            heapUsedMB,
            heapTotalMB,
            externalMB,
            rss: Math.round(usage.rss / 1024 / 1024)
        });
    }
    
    /**
     * Handle memory pressure
     */
    async handleMemoryPressure(level) {
        console.log(`🔧 Handling ${level} memory pressure...`);
        
        if (level === 'warning') {
            // Trigger cleanup callbacks
            await this.runCleanupCallbacks();
            
            // Hint to GC
            if (this.config.enableAutomaticGC && global.gc) {
                global.gc();
                console.log('   🗑️ Garbage collection triggered');
            }
        }
        
        if (level === 'critical') {
            // Aggressive cleanup
            await this.runCleanupCallbacks();
            
            // Take heap snapshot
            if (this.config.snapshotOnThreshold) {
                this.takeHeapSnapshot();
            }
            
            // Force GC
            if (global.gc) {
                global.gc();
                global.gc(); // Run twice for old generation
                console.log('   🗑️ Forced garbage collection');
            }
            
            // Emit critical event
            this.emit('memoryPressureCritical');
        }
    }
    
    /**
     * Register cleanup callback
     */
    registerCleanupCallback(callback) {
        this.cleanupCallbacks.add(callback);
    }
    
    /**
     * Run all cleanup callbacks
     */
    async runCleanupCallbacks() {
        console.log(`   🧹 Running ${this.cleanupCallbacks.size} cleanup callbacks...`);
        
        for (const callback of this.cleanupCallbacks) {
            try {
                await callback();
            } catch (error) {
                console.error('   ❌ Cleanup callback failed:', error.message);
            }
        }
    }
    
    /**
     * Take heap snapshot
     */
    takeHeapSnapshot() {
        try {
            const snapshot = v8.writeHeapSnapshot();
            this.heapSnapshots.push({
                file: snapshot,
                timestamp: Date.now(),
                heapUsed: process.memoryUsage().heapUsed
            });
            
            // Keep only recent snapshots
            if (this.heapSnapshots.length > this.maxSnapshots) {
                this.heapSnapshots.shift();
            }
            
            console.log(`   📸 Heap snapshot saved: ${snapshot}`);
            
        } catch (error) {
            console.error('   ❌ Failed to take heap snapshot:', error.message);
        }
    }
    
    /**
     * Detect memory leaks
     */
    detectMemoryLeaks() {
        if (this.heapSnapshots.length < 2) {
            return { leakDetected: false };
        }
        
        const recent = this.heapSnapshots.slice(-3);
        const growthRate = [];
        
        for (let i = 1; i < recent.length; i++) {
            const growth = recent[i].heapUsed - recent[i-1].heapUsed;
            const timeDiff = recent[i].timestamp - recent[i-1].timestamp;
            growthRate.push(growth / timeDiff); // MB per ms
        }
        
        // Average growth rate
        const avgGrowth = growthRate.reduce((a, b) => a + b, 0) / growthRate.length;
        
        // If consistently growing, potential leak
        const isLeaking = growthRate.every(rate => rate > 0) && avgGrowth > 0.01;
        
        return {
            leakDetected: isLeaking,
            avgGrowthRate: avgGrowth,
            snapshots: recent.length
        };
    }
    
    /**
     * Get memory statistics
     */
    getMemoryStats() {
        const usage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        
        return {
            heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
            externalMB: Math.round(usage.external / 1024 / 1024),
            rssMB: Math.round(usage.rss / 1024 / 1024),
            heapLimit: Math.round(heapStats.heap_size_limit / 1024 / 1024),
            usagePercent: (usage.heapUsed / heapStats.heap_size_limit * 100).toFixed(1)
        };
    }
    
    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        this.isMonitoring = false;
        console.log('📊 Memory monitoring stopped');
    }
}

// Singleton
const memoryManager = new MemoryManagement();

export default memoryManager;
export { memoryManager };
