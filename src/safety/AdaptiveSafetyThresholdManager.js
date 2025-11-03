/**
 * 🛡️ ADAPTIVE SAFETY THRESHOLD MANAGER
 * ==================================
 * 
 * Advanced safety threshold management with feedback loops
 * Dynamically adjusts thresholds based on system behavior and performance
 * 
 * FEATURES:
 * - Adaptive threshold adjustment based on system performance
 * - Feedback loops for self-improvement
 * - Integration with error detection and reporting
 * - Threshold persistence and history tracking
 * - Multi-dimensional safety metrics
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

export class AdaptiveSafetyThresholdManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('🛡️ Initializing ADAPTIVE SAFETY THRESHOLD MANAGER...');
        
        this.config = {
            // Base thresholds
            baseThresholds: config.baseThresholds || {
                quantum: 0.85,
                memory: 0.80,
                reasoning: 0.90,
                creativity: 0.75,
                arbitrage: 0.95,
                construction: 0.85
            },
            
            // Adaptation configuration
            adaptationRate: config.adaptationRate || 0.05,
            minThreshold: config.minThreshold || 0.60,
            maxThreshold: config.maxThreshold || 0.98,
            adaptationWindow: config.adaptationWindow || 50, // Number of events to consider
            
            // Feedback configuration
            enableFeedbackLoop: config.enableFeedbackLoop !== false,
            feedbackInterval: config.feedbackInterval || 60000, // 1 minute
            
            // Persistence configuration
            persistThresholds: config.persistThresholds !== false,
            thresholdHistorySize: config.thresholdHistorySize || 100,
            
            ...config
        };
        
        // System state
        this.thresholds = { ...this.config.baseThresholds };
        this.activeThresholds = { ...this.thresholds };
        this.violationCounts = Object.keys(this.thresholds).reduce((acc, key) => {
            acc[key] = 0;
            return acc;
        }, {});
        this.successCounts = { ...this.violationCounts };
        
        // History tracking
        this.thresholdHistory = Object.keys(this.thresholds).reduce((acc, key) => {
            acc[key] = [{ value: this.thresholds[key], timestamp: Date.now() }];
            return acc;
        }, {});
        
        this.violations = [];
        this.adaptations = [];
        
        // CRITICAL FIX: Add observation mode support
        this.observationMode = false;
        this.feedbackInterval = null; // Store interval ID for cleanup
        
        this.initialized = false;
    }
    
    /**
     * Initialize the threshold manager
     */
    async initialize(dependencies = {}) {
        try {
            // Connect dependencies
            this.errorDetectionService = dependencies.errorDetectionService;
            this.memoryPersistence = dependencies.memoryPersistence;
            this.db = dependencies.db;
            
            // Load persisted thresholds if available
            if (this.config.persistThresholds && this.memoryPersistence) {
                await this._loadPersistedThresholds();
            }
            
            // Start feedback loop if enabled
            if (this.config.enableFeedbackLoop) {
                this._startFeedbackLoop();
            }
            
            // Connect to error detection service if available
            if (this.errorDetectionService) {
                this._setupErrorDetectionListeners();
            }
            
            this.initialized = true;
            console.log('✅ Safety threshold manager initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize safety threshold manager:', error);
            return false;
        }
    }
    
    /**
     * Check if a value violates a safety threshold
     * 
     * @param {string} domain - The domain to check (e.g., 'quantum', 'memory')
     * @param {number} value - The value to check against the threshold
     * @param {object} context - Additional context about the check
     * @returns {object} Result with violation status and details
     */
    checkThreshold(domain, value, context = {}) {
        // Get the appropriate threshold for this domain
        const threshold = this.activeThresholds[domain] || 
                        this.activeThresholds.default || 
                        this.config.minThreshold;
        
        // Check if the value violates the threshold
        const isViolation = value > threshold;
        
        // Create result object
        const result = {
            domain,
            value,
            threshold,
            isViolation,
            distance: value - threshold,
            severity: this._calculateViolationSeverity(value, threshold),
            timestamp: Date.now(),
            context
        };
        
        // Track the result
        if (isViolation) {
            this._recordViolation(result);
        } else {
            this._recordSuccess(domain);
        }
        
        // Emit events
        if (isViolation) {
            this.emit('threshold_violation', result);
            
            // Emit severity-specific events
            if (result.severity === 'HIGH') {
                this.emit('high_severity_violation', result);
            } else if (result.severity === 'CRITICAL') {
                this.emit('critical_violation', result);
            }
        }
        
        return result;
    }
    
    /**
     * Update a threshold based on system performance
     * 
     * @param {string} domain - The domain to update
     * @param {number} adjustment - The adjustment amount (-1 to 1)
     * @param {string} reason - The reason for the adjustment
     */
    updateThreshold(domain, adjustment, reason = 'manual') {
        if (!this.thresholds[domain]) {
            console.warn(`⚠️ Unknown domain: ${domain}`);
            return false;
        }
        
        const oldThreshold = this.thresholds[domain];
        
        // Calculate new threshold
        let newThreshold = oldThreshold + (adjustment * this.config.adaptationRate);
        
        // Ensure threshold is within bounds
        newThreshold = Math.max(this.config.minThreshold, 
                           Math.min(this.config.maxThreshold, newThreshold));
        
        // Update threshold
        this.thresholds[domain] = newThreshold;
        this.activeThresholds[domain] = newThreshold;
        
        // Record the adaptation
        const adaptation = {
            domain,
            oldThreshold,
            newThreshold,
            adjustment,
            reason,
            timestamp: Date.now()
        };
        
        this.adaptations.push(adaptation);
        if (this.adaptations.length > this.config.thresholdHistorySize) {
            this.adaptations.shift();
        }
        
        // Add to history
        this.thresholdHistory[domain].push({
            value: newThreshold,
            timestamp: Date.now(),
            reason
        });
        
        if (this.thresholdHistory[domain].length > this.config.thresholdHistorySize) {
            this.thresholdHistory[domain].shift();
        }
        
        // Emit event
        this.emit('threshold_updated', adaptation);
        
        // Persist thresholds
        if (this.config.persistThresholds) {
            this._persistThresholds().catch(err => 
                console.warn('Failed to persist thresholds:', err.message));
        }
        
        console.log(`🛡️ Updated ${domain} threshold: ${oldThreshold.toFixed(3)} → ${newThreshold.toFixed(3)} (${reason})`);
        
        return true;
    }
    
    /**
     * Reset a threshold to its base value
     * 
     * @param {string} domain - The domain to reset
     */
    resetThreshold(domain) {
        if (!this.thresholds[domain]) {
            console.warn(`⚠️ Unknown domain: ${domain}`);
            return false;
        }
        
        const oldThreshold = this.thresholds[domain];
        const baseThreshold = this.config.baseThresholds[domain];
        
        this.thresholds[domain] = baseThreshold;
        this.activeThresholds[domain] = baseThreshold;
        
        // Record the reset
        const adaptation = {
            domain,
            oldThreshold,
            newThreshold: baseThreshold,
            adjustment: 0,
            reason: 'reset',
            timestamp: Date.now()
        };
        
        this.adaptations.push(adaptation);
        
        // Add to history
        this.thresholdHistory[domain].push({
            value: baseThreshold,
            timestamp: Date.now(),
            reason: 'reset'
        });
        
        // Emit event
        this.emit('threshold_reset', adaptation);
        
        // Persist thresholds
        if (this.config.persistThresholds) {
            this._persistThresholds().catch(err => 
                console.warn('Failed to persist thresholds:', err.message));
        }
        
        console.log(`🛡️ Reset ${domain} threshold to base value: ${baseThreshold.toFixed(3)}`);
        
        return true;
    }
    
    /**
     * Get all current thresholds
     */
    getThresholds() {
        return { ...this.activeThresholds };
    }
    
    /**
     * Get threshold history for a domain
     * 
     * @param {string} domain - The domain to get history for
     */
    getThresholdHistory(domain) {
        return this.thresholdHistory[domain] || [];
    }
    
    /**
     * Get recent violations
     * 
     * @param {number} limit - Maximum number of violations to return
     */
    getRecentViolations(limit = 10) {
        return this.violations.slice(-limit);
    }
    
    /**
     * Calculate violation severity based on distance from threshold
     * 
     * @param {number} value - The value that violated the threshold
     * @param {number} threshold - The threshold that was violated
     */
    _calculateViolationSeverity(value, threshold) {
        const distance = value - threshold;
        
        if (distance > 0.1) {
            return 'CRITICAL';
        } else if (distance > 0.05) {
            return 'HIGH';
        } else if (distance > 0.02) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }
    
    /**
     * Record a threshold violation
     * 
     * @param {object} violation - The violation details
     */
    _recordViolation(violation) {
        // Add to violations list
        this.violations.push(violation);
        
        // Trim list if it gets too large
        if (this.violations.length > this.config.thresholdHistorySize * 2) {
            this.violations = this.violations.slice(-this.config.thresholdHistorySize);
        }
        
        // Update violation count
        this.violationCounts[violation.domain] = 
            (this.violationCounts[violation.domain] || 0) + 1;
        
        // Consider threshold adjustment if we have too many violations
        if (this.config.enableFeedbackLoop) {
            const violationCount = this.violationCounts[violation.domain];
            const successCount = this.successCounts[violation.domain] || 0;
            
            // If we have a high violation rate, adjust threshold
            if (violationCount > 5 && violationCount > successCount * 0.2) {
                // Increase threshold to reduce violations
                this.updateThreshold(violation.domain, 0.5, 'high_violation_rate');
            }
        }
    }
    
    /**
     * Record a successful threshold check
     * 
     * @param {string} domain - The domain that passed the check
     */
    _recordSuccess(domain) {
        this.successCounts[domain] = (this.successCounts[domain] || 0) + 1;
        
        // Consider threshold adjustment if we have too many successes
        if (this.config.enableFeedbackLoop) {
            const violationCount = this.violationCounts[domain] || 0;
            const successCount = this.successCounts[domain];
            
            // If we have a very low violation rate, consider relaxing threshold
            if (successCount > 50 && violationCount === 0) {
                // Decrease threshold slightly to balance strictness
                this.updateThreshold(domain, -0.1, 'zero_violations');
            }
        }
    }
    
    /**
     * Start the feedback loop for adaptive thresholds
     */
    _startFeedbackLoop() {
        // Clear any existing interval
        if (this.feedbackInterval) {
            clearInterval(this.feedbackInterval);
        }
        
        // Start new interval
        this.feedbackInterval = setInterval(() => {
            this._runFeedbackCycle();
        }, this.config.feedbackInterval);
        
        console.log(`🔄 Started safety threshold feedback loop (interval: ${this.config.feedbackInterval}ms)`);
    }
    
    /**
     * Run a feedback cycle to adapt thresholds
     */
    async _runFeedbackCycle() {
        // CRITICAL FIX: Skip feedback cycles in observation mode
        if (this.observationMode) {
            return;
        }
        console.log('🔄 Running safety threshold feedback cycle...');
        
        for (const domain of Object.keys(this.thresholds)) {
            // Skip if no events for this domain
            const totalEvents = (this.violationCounts[domain] || 0) + 
                               (this.successCounts[domain] || 0);
                               
            if (totalEvents < 10) continue;
            
            // Calculate violation rate
            const violationRate = this.violationCounts[domain] / totalEvents;
            
            // Determine adjustment based on violation rate
            let adjustment = 0;
            let reason = '';
            
            if (violationRate > 0.2) {
                // Too many violations, increase threshold
                adjustment = 0.3;
                reason = 'high_violation_rate';
            } else if (violationRate > 0.1) {
                // Moderate violations, slightly increase threshold
                adjustment = 0.1;
                reason = 'moderate_violation_rate';
            } else if (violationRate < 0.01 && totalEvents > 30) {
                // Very few violations, slightly decrease threshold
                adjustment = -0.05;
                reason = 'low_violation_rate';
            }
            
            // Apply adjustment if needed
            if (adjustment !== 0) {
                this.updateThreshold(domain, adjustment, reason);
            }
            
            // Reset counters for next cycle
            this.violationCounts[domain] = 0;
            this.successCounts[domain] = 0;
        }
        
        // Emit cycle completed event
        this.emit('feedback_cycle_completed', {
            timestamp: Date.now(),
            thresholds: { ...this.thresholds }
        });
    }
    
    /**
     * Set up listeners for the error detection service
     */
    _setupErrorDetectionListeners() {
        // Listen for errors
        this.errorDetectionService.on('error_detected', (error) => {
            // Check if this error is related to a threshold domain
            let domain = null;
            
            if (error.source && error.source.includes('quantum')) {
                domain = 'quantum';
            } else if (error.source && error.source.includes('memory')) {
                domain = 'memory';
            } else if (error.source && error.source.includes('reasoning')) {
                domain = 'reasoning';
            } else if (error.source && error.source.includes('creativity')) {
                domain = 'creativity';
            } else if (error.source && error.source.includes('arbitrage')) {
                domain = 'arbitrage';
            } else if (error.source && error.source.includes('construction')) {
                domain = 'construction';
            }
            
            if (domain) {
                // Consider increasing threshold for this domain
                if (error.severity === 'HIGH' || error.severity === 'CRITICAL') {
                    this.updateThreshold(domain, 0.2, 'error_detected');
                }
            }
        });
    }
    
    /**
     * Load persisted thresholds from storage
     */
    async _loadPersistedThresholds() {
        try {
            if (this.memoryPersistence) {
                // Try to load from memory persistence
                const persistedData = await this.memoryPersistence.loadMemory(
                    'safety_thresholds',
                    { type: 'system_thresholds' }
                );
                
                if (persistedData && persistedData.thresholds) {
                    console.log('📥 Loading persisted safety thresholds');
                    
                    // Update thresholds with persisted values
                    for (const [domain, value] of Object.entries(persistedData.thresholds)) {
                        if (this.thresholds[domain] !== undefined) {
                            this.thresholds[domain] = value;
                            this.activeThresholds[domain] = value;
                        }
                    }
                    
                    // Also load history if available
                    if (persistedData.history) {
                        for (const [domain, history] of Object.entries(persistedData.history)) {
                            if (this.thresholdHistory[domain] !== undefined) {
                                this.thresholdHistory[domain] = [...history];
                            }
                        }
                    }
                }
            } else if (this.db) {
                // Try to load from database
                const result = await this.db.query(
                    'SELECT thresholds, history FROM system_thresholds WHERE type = $1',
                    ['safety_thresholds']
                );
                
                if (result && result.rows && result.rows.length > 0) {
                    const row = result.rows[0];
                    
                    if (row.thresholds) {
                        console.log('📥 Loading persisted safety thresholds from database');
                        
                        // Update thresholds with persisted values
                        for (const [domain, value] of Object.entries(row.thresholds)) {
                            if (this.thresholds[domain] !== undefined) {
                                this.thresholds[domain] = value;
                                this.activeThresholds[domain] = value;
                            }
                        }
                        
                        // Also load history if available
                        if (row.history) {
                            for (const [domain, history] of Object.entries(row.history)) {
                                if (this.thresholdHistory[domain] !== undefined) {
                                    this.thresholdHistory[domain] = [...history];
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ Failed to load persisted thresholds:', error.message);
            // Continue with default thresholds
        }
    }
    
    /**
     * Persist current thresholds to storage
     */
    async _persistThresholds() {
        // Create data object to persist
        const dataToStore = {
            thresholds: { ...this.thresholds },
            history: { ...this.thresholdHistory },
            lastUpdated: Date.now()
        };
        
        try {
            if (this.memoryPersistence) {
                // Store in memory persistence
                await this.memoryPersistence.storeMemory(
                    'safety_thresholds',
                    dataToStore,
                    { type: 'system_thresholds', priority: 'HIGH' }
                );
            } else if (this.db) {
                // Store in database
                await this.db.query(
                    `INSERT INTO system_thresholds (type, thresholds, history, updated_at)
                     VALUES ($1, $2, $3, NOW())
                     ON CONFLICT (type) DO UPDATE SET
                        thresholds = $2,
                        history = $3,
                        updated_at = NOW()`,
                    ['safety_thresholds', dataToStore.thresholds, dataToStore.history]
                );
            }
        } catch (error) {
            console.warn('⚠️ Failed to persist thresholds:', error.message);
            // Continue without persistence
        }
    }
    
    /**
     * 🔭 ENTER OBSERVATION MODE
     * Stop all monitoring intervals to achieve true idle state
     */
    enterObservationMode() {
        console.log('🔭 AdaptiveSafetyThresholdManager: Entering observation mode...');
        this.observationMode = true;
        
        // Stop feedback loop
        this.stopFeedbackLoop();
    }
    
    /**
     * 🔄 EXIT OBSERVATION MODE
     * Resume monitoring intervals
     */
    exitObservationMode() {
        console.log('🔄 AdaptiveSafetyThresholdManager: Exiting observation mode...');
        this.observationMode = false;
        
        // Restart feedback loop if enabled
        if (this.config.enableFeedbackLoop) {
            this._startFeedbackLoop();
        }
    }
    
    /**
     * 🛑 STOP FEEDBACK LOOP
     */
    stopFeedbackLoop() {
        console.log('🛑 Stopping safety threshold feedback loop...');
        
        if (this.feedbackInterval) {
            clearInterval(this.feedbackInterval);
            this.feedbackInterval = null;
            console.log('   ✅ Safety threshold feedback loop stopped');
        }
    }
}

// Export singleton instance for global use
export const adaptiveSafetyThresholdManager = new AdaptiveSafetyThresholdManager();
