/**
 * 🔧 CENTRAL NERVOUS SYSTEM MEMORY FIX - PRODUCTION PATCH
 * ======================================================
 * 
 * Fixes memory leaks in LLMJudgeCentralNervousSystem for 896GB RAM server
 * Implements bounded collections and automatic cleanup
 */

import { LRUCache } from 'lru-cache';

/**
 * 🧠 APPLY MEMORY FIXES TO CENTRAL NERVOUS SYSTEM
 * 
 * @param {LLMJudgeCentralNervousSystem} centralNervousSystem - Instance to patch
 */
export function applyCentralNervousSystemMemoryFix(centralNervousSystem) {
    console.log('🔧 Applying memory fixes to Central Nervous System...');
    
    // 🔧 FIX 1: Set max event listeners for 200+ agents
    centralNervousSystem.setMaxListeners(1000);
    console.log('   ✅ Max listeners set to 1000 (was 10)');
    
    // 🔧 FIX 2: Replace unbounded Map with LRU Cache
    const oldPatterns = centralNervousSystem.contextualIntelligence.contextualPatterns;
    
    centralNervousSystem.contextualIntelligence.contextualPatterns = new LRUCache({
        max: 10000,                    // Maximum 10k patterns
        ttl: 1000 * 60 * 60,          // 1 hour TTL
        updateAgeOnGet: true,          // Refresh TTL on access
        allowStale: false,
        
        // Size calculation for memory management
        sizeCalculation: (value) => {
            // Estimate memory usage of pattern object
            return JSON.stringify(value).length;
        },
        
        // Maximum memory usage: 100MB for patterns
        maxSize: 100 * 1024 * 1024,
        
        // Disposal function for cleanup
        dispose: (key, value) => {
            console.log(`   🗑️ Evicting old pattern: ${key}`);
        }
    });
    
    // Migrate existing patterns if any
    if (oldPatterns instanceof Map && oldPatterns.size > 0) {
        console.log(`   📦 Migrating ${oldPatterns.size} existing patterns...`);
        for (const [key, value] of oldPatterns) {
            centralNervousSystem.contextualIntelligence.contextualPatterns.set(key, value);
        }
    }
    
    console.log('   ✅ Contextual patterns Map replaced with bounded LRU Cache');
    
    // 🔧 FIX 3: Add bounded opportunity predictions array
    const maxPredictions = 1000;
    const originalPush = Array.prototype.push;
    
    // Override push to maintain bounded size
    Object.defineProperty(centralNervousSystem.contextualIntelligence.opportunityPredictions, 'push', {
        value: function(...items) {
            const result = originalPush.apply(this, items);
            
            // Keep only the most recent predictions
            if (this.length > maxPredictions) {
                const toRemove = this.length - maxPredictions;
                this.splice(0, toRemove);
                console.log(`   🗑️ Removed ${toRemove} old predictions (keeping ${maxPredictions})`);
            }
            
            return result;
        }
    });
    
    console.log('   ✅ Opportunity predictions array bounded to 1000 entries');
    
    // 🔧 FIX 4: Add memory monitoring
    const memoryMonitor = setInterval(() => {
        const usage = process.memoryUsage();
        const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const rssMB = Math.round(usage.rss / 1024 / 1024);
        
        // Log if memory usage is high (>50GB)
        if (heapUsedMB > 50000) {
            console.warn(`⚠️ High memory usage detected in CNS:`);
            console.warn(`   Heap: ${heapUsedMB}MB / ${heapTotalMB}MB`);
            console.warn(`   RSS: ${rssMB}MB`);
            console.warn(`   Patterns cached: ${centralNervousSystem.contextualIntelligence.contextualPatterns.size}`);
            console.warn(`   Predictions: ${centralNervousSystem.contextualIntelligence.opportunityPredictions.length}`);
            
            // Force garbage collection if available
            if (global.gc) {
                console.log('   🗑️ Forcing garbage collection...');
                global.gc();
            }
        }
    }, 60000); // Check every minute
    
    // Store interval ID for cleanup
    centralNervousSystem._memoryMonitorInterval = memoryMonitor;
    
    console.log('   ✅ Memory monitoring enabled (60s interval)');
    
    // 🔧 FIX 5: Add cleanup method
    const originalShutdown = centralNervousSystem.shutdown?.bind(centralNervousSystem);
    
    centralNervousSystem.shutdown = async function() {
        console.log('🛑 Shutting down CNS with memory cleanup...');
        
        // Clear memory monitor
        if (this._memoryMonitorInterval) {
            clearInterval(this._memoryMonitorInterval);
            console.log('   ✅ Memory monitor stopped');
        }
        
        // Clear caches
        this.contextualIntelligence.contextualPatterns.clear();
        this.contextualIntelligence.opportunityPredictions.length = 0;
        console.log('   ✅ Caches cleared');
        
        // Call original shutdown if exists
        if (originalShutdown) {
            await originalShutdown();
        }
        
        console.log('✅ CNS shutdown with memory cleanup complete');
    };
    
    console.log('✅ Central Nervous System memory fixes applied successfully');
    
    return {
        success: true,
        fixes: [
            'Max event listeners increased to 1000',
            'Contextual patterns Map replaced with bounded LRU Cache (10k max, 1hr TTL)',
            'Opportunity predictions array bounded to 1000 entries',
            'Memory monitoring enabled (logs warnings >50GB)',
            'Cleanup method enhanced for proper shutdown'
        ]
    };
}

/**
 * 🔧 CREATE MEMORY-OPTIMIZED CNS CONFIG
 * 
 * Configuration optimized for 896GB RAM server
 */
export function getOptimizedCNSConfig() {
    return {
        // LRU Cache configurations
        contextualPatternsCache: {
            max: 10000,
            ttl: 1000 * 60 * 60,      // 1 hour
            maxSize: 100 * 1024 * 1024 // 100MB
        },
        
        // Array bounds
        maxOpportunityPredictions: 1000,
        maxJudgmentHistory: 5000,
        maxLearningEvents: 10000,
        
        // Memory thresholds
        memoryWarningThresholdGB: 50,
        memoryErrorThresholdGB: 100,
        
        // Garbage collection
        forceGCIntervalMinutes: 30,
        
        // Event emitter
        maxEventListeners: 1000
    };
}

export default applyCentralNervousSystemMemoryFix;
