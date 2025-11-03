/**
 * 🔍 STATE CHANGE DETECTOR UTILITY
 * ================================
 * 
 * Advanced utility for detecting significant state changes to prevent spam logging
 * Only logs when values change by more than specified threshold (default 5%)
 * 
 * FEATURES:
 * - Percentage-based change detection
 * - Multiple metric tracking
 * - Customizable thresholds per metric
 * - Memory efficient with automatic cleanup
 * - Support for nested object comparison
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

export class StateChangeDetector {
    constructor(config = {}) {
        this.config = {
            // Default change threshold (5%)
            defaultThreshold: config.defaultThreshold || 0.05,
            
            // Custom thresholds per metric name
            customThresholds: config.customThresholds || {},
            
            // Memory management
            maxHistorySize: config.maxHistorySize || 1000,
            cleanupInterval: config.cleanupInterval || 3600000, // 1 hour
            
            // Logging configuration
            logPrefix: config.logPrefix || '📊',
            enableDebugLogging: config.enableDebugLogging === true,
            
            ...config
        };
        
        // State storage
        this.previousStates = new Map(); // metricName -> value
        this.changeHistory = new Map(); // metricName -> [timestamps]
        this.thresholds = new Map(); // metricName -> threshold
        
        // Metrics
        this.metrics = {
            totalChecks: 0,
            changesDetected: 0,
            changesIgnored: 0,
            averageChangePercent: 0
        };
        
        // Start cleanup interval
        this.setupCleanupInterval();
        
        if (this.config.enableDebugLogging) {
            console.log('🔍 StateChangeDetector initialized');
            console.log(`   🎯 Default threshold: ${this.config.defaultThreshold * 100}%`);
        }
    }
    
    /**
     * 🔍 CHECK FOR SIGNIFICANT CHANGE
     * Check if a metric has changed significantly enough to warrant logging
     * 
     * @param {string} metricName - Name of the metric
     * @param {number|object} currentValue - Current value to check
     * @param {number} customThreshold - Optional custom threshold for this check
     * @returns {boolean} True if change is significant enough to log
     */
    hasSignificantChange(metricName, currentValue, customThreshold = null) {
        this.metrics.totalChecks++;
        
        // Get threshold for this metric
        const threshold = customThreshold || 
                         this.customThresholds[metricName] || 
                         this.config.defaultThreshold;
        
        // Check if we have previous value
        if (!this.previousStates.has(metricName)) {
            // First time seeing this metric - always significant
            this.previousStates.set(metricName, currentValue);
            this.recordChange(metricName);
            return true;
        }
        
        const previousValue = this.previousStates.get(metricName);
        
        // Handle different data types
        let changePercent = 0;
        
        if (typeof currentValue === 'number' && typeof previousValue === 'number') {
            // Numeric comparison
            if (previousValue === 0) {
                changePercent = currentValue === 0 ? 0 : 1; // 100% change if going from 0
            } else {
                changePercent = Math.abs((currentValue - previousValue) / previousValue);
            }
        } else if (typeof currentValue === 'object' && typeof previousValue === 'object') {
            // Object comparison (basic)
            changePercent = this.compareObjects(currentValue, previousValue);
        } else if (currentValue !== previousValue) {
            // Different types or non-numeric - consider 100% change
            changePercent = 1.0;
        }
        
        // Check if change is significant
        if (changePercent >= threshold) {
            this.previousStates.set(metricName, currentValue);
            this.recordChange(metricName, changePercent);
            return true;
        } else {
            this.metrics.changesIgnored++;
            if (this.config.enableDebugLogging) {
                console.log(`🔍 ${metricName}: Change ${(changePercent * 100).toFixed(2)}% < threshold ${(threshold * 100).toFixed(2)}% - skipping log`);
            }
            return false;
        }
    }
    
    /**
     * 🔄 COMPARE OBJECTS
     * Basic object comparison for change detection
     */
    compareObjects(current, previous) {
        if (!current || !previous) return 1.0;
        
        const currentKeys = Object.keys(current);
        const previousKeys = Object.keys(previous);
        
        // Key count change
        if (currentKeys.length !== previousKeys.length) {
            return 0.5; // 50% change for structure change
        }
        
        let totalDifferences = 0;
        let comparableKeys = 0;
        
        for (const key of currentKeys) {
            if (typeof current[key] === 'number' && typeof previous[key] === 'number') {
                if (previous[key] !== 0) {
                    totalDifferences += Math.abs((current[key] - previous[key]) / previous[key]);
                }
                comparableKeys++;
            } else if (current[key] !== previous[key]) {
                totalDifferences += 1.0; // Full change for non-numeric
                comparableKeys++;
            }
        }
        
        return comparableKeys > 0 ? totalDifferences / comparableKeys : 0;
    }
    
    /**
     * 📊 RECORD CHANGE
     * Record that a change was detected for metrics
     */
    recordChange(metricName, changePercent = 0) {
        this.metrics.changesDetected++;
        
        // Update average change percent
        const totalChangePercent = this.metrics.averageChangePercent * (this.metrics.changesDetected - 1) + changePercent;
        this.metrics.averageChangePercent = totalChangePercent / this.metrics.changesDetected;
        
        // Record change history
        if (!this.changeHistory.has(metricName)) {
            this.changeHistory.set(metricName, []);
        }
        this.changeHistory.get(metricName).push(Date.now());
        
        if (this.config.enableDebugLogging) {
            console.log(`🔍 ${metricName}: Significant change detected (${(changePercent * 100).toFixed(2)}%)`);
        }
    }
    
    /**
     * 🎯 SET CUSTOM THRESHOLD
     * Set a custom threshold for a specific metric
     */
    setCustomThreshold(metricName, threshold) {
        this.thresholds.set(metricName, threshold);
        if (this.config.enableDebugLogging) {
            console.log(`🎯 Custom threshold set for ${metricName}: ${threshold * 100}%`);
        }
    }
    
    /**
     * 📊 GET METRICS
     * Get detection metrics and statistics
     */
    getMetrics() {
        return {
            ...this.metrics,
            metricsTracked: this.previousStates.size,
            changeDetectionRate: this.metrics.totalChecks > 0 ? 
                (this.metrics.changesDetected / this.metrics.totalChecks) : 0
        };
    }
    
    /**
     * 🧹 SETUP CLEANUP INTERVAL
     */
    setupCleanupInterval() {
        this.cleanupInterval = setInterval(() => {
            this.performCleanup();
        }, this.config.cleanupInterval);
    }
    
    /**
     * 🧹 PERFORM CLEANUP
     * Clean up old history data to prevent memory leaks
     */
    performCleanup() {
        const now = Date.now();
        const cleanupAge = 24 * 60 * 60 * 1000; // 24 hours
        let cleanedEntries = 0;
        
        for (const [metricName, timestamps] of this.changeHistory) {
            const filteredTimestamps = timestamps.filter(t => (now - t) < cleanupAge);
            if (filteredTimestamps.length < timestamps.length) {
                this.changeHistory.set(metricName, filteredTimestamps);
                cleanedEntries += timestamps.length - filteredTimestamps.length;
            }
        }
        
        if (this.config.enableDebugLogging && cleanedEntries > 0) {
            console.log(`🧹 StateChangeDetector cleanup: ${cleanedEntries} old entries removed`);
        }
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    shutdown() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        if (this.config.enableDebugLogging) {
            console.log('🛑 StateChangeDetector shutdown complete');
        }
    }
}

export default StateChangeDetector;
