/**
 * 🔭 SYSTEM OBSERVATION CONTROLLER
 * =================================
 * 
 * Centralized controller to manage ALL system states and enforce true idle mode.
 * This controller ensures the system remains in observation mode until explicitly
 * instructed by the user, preventing all autonomous operations and spam.
 * 
 * @module SystemObservationController
 */

import { EventEmitter } from 'events';

export class SystemObservationController extends EventEmitter {
    constructor() {
        super();
        this.name = 'SystemObservationController';
        
        // Track all registered systems
        this.registeredSystems = new Map();
        
        // Track all active intervals and timeouts
        this.activeIntervals = new Set();
        this.activeTimeouts = new Set();
        
        // Global observation state
        this.globalObservationMode = true; // Start in observation mode by default
        this.enforcedMode = false; // When true, prevents any exit from observation
        
        // Metrics
        this.metrics = {
            systemsRegistered: 0,
            systemsInObservation: 0,
            intervalsCleared: 0,
            timeoutsCleared: 0,
            activationsBlocked: 0,
            lastEnterObservation: null,
            lastExitObservation: null
        };
        
        // Log suppression
        this.logSuppression = {
            enabled: true,
            threshold: 5, // Max logs per minute in observation mode
            currentCount: 0,
            resetInterval: null
        };
        
        // Initialize log suppression counter reset
        this.initializeLogSuppression();
        
        // Set global flags immediately
        this.setGlobalFlags();
        
        console.log('🔭 SystemObservationController: Initialized');
    }
    
    /**
     * Set global flags for observation mode
     */
    setGlobalFlags() {
        global.OBSERVATION_MODE_GLOBAL = this.globalObservationMode;
        global.DISABLE_DEBUG_LOGGING = this.globalObservationMode;
        global.SKIP_AUTONOMOUS_SYSTEMS = this.globalObservationMode;
        global.OBSERVATION_MODE_ENFORCED = this.enforcedMode;
    }
    
    /**
     * Initialize log suppression mechanism
     */
    initializeLogSuppression() {
        // Reset log count every minute
        this.logSuppression.resetInterval = setInterval(() => {
            if (this.logSuppression.currentCount > this.logSuppression.threshold) {
                console.log(`⚠️ Log suppression: ${this.logSuppression.currentCount} logs in last minute (threshold: ${this.logSuppression.threshold})`);
            }
            this.logSuppression.currentCount = 0;
        }, 60000);
    }
    
    /**
     * Register a system with the controller
     */
    registerSystem(name, system) {
        if (this.registeredSystems.has(name)) {
            return false; // Already registered
        }
        
        this.registeredSystems.set(name, {
            name,
            system,
            inObservation: this.globalObservationMode,
            registeredAt: new Date()
        });
        
        this.metrics.systemsRegistered++;
        
        // Immediately put system in observation mode if global mode is active
        if (this.globalObservationMode) {
            this.putSystemInObservation(name);
        }
        
        return true;
    }
    
    /**
     * Put a specific system in observation mode
     */
    putSystemInObservation(name) {
        const registration = this.registeredSystems.get(name);
        if (!registration) return false;
        
        const { system } = registration;
        
        // Call observation mode methods if they exist
        if (typeof system.enterObservationMode === 'function') {
            system.enterObservationMode();
        }
        
        if (typeof system.stopAllMonitoring === 'function') {
            system.stopAllMonitoring();
        }
        
        if (typeof system.stopContinuousProcesses === 'function') {
            system.stopContinuousProcesses();
        }
        
        if (typeof system.stopEvolution === 'function') {
            system.stopEvolution();
        }
        
        if (typeof system.stopBackgroundTasks === 'function') {
            system.stopBackgroundTasks();
        }
        
        registration.inObservation = true;
        this.metrics.systemsInObservation++;
        
        return true;
    }
    
    /**
     * Enter full observation mode for ALL systems
     */
    async enterFullObservationMode(enforced = false) {
        console.log('\n' + '='.repeat(60));
        console.log('🔭 ENTERING FULL OBSERVATION MODE');
        console.log('='.repeat(60));
        
        this.globalObservationMode = true;
        this.enforcedMode = enforced;
        this.setGlobalFlags();
        
        console.log('📊 Forcing all systems into observation mode...');
        
        // Put all registered systems in observation
        for (const [name, registration] of this.registeredSystems) {
            console.log(`   🛑 Stopping: ${name}`);
            this.putSystemInObservation(name);
        }
        
        console.log('\n🧹 Clearing all intervals and timeouts...');
        this.clearAllIntervalsAndTimeouts();
        
        console.log('\n🔒 Blocking all autonomous operations...');
        this.blockAutonomousOperations();
        
        this.metrics.lastEnterObservation = new Date();
        this.metrics.systemsInObservation = this.registeredSystems.size;
        
        console.log('\n✅ OBSERVATION MODE ACTIVE');
        console.log('   📊 Systems in observation:', this.metrics.systemsInObservation);
        console.log('   🔇 Log suppression: ENABLED');
        console.log('   🚫 Autonomous operations: BLOCKED');
        console.log('   ⏸️  System state: IDLE');
        console.log('   👂 Waiting for user instructions...');
        console.log('='.repeat(60) + '\n');
    }
    
    /**
     * Clear all intervals and timeouts globally
     */
    clearAllIntervalsAndTimeouts() {
        let clearedIntervals = 0;
        let clearedTimeouts = 0;
        
        // Clear known intervals
        const intervalsToClear = [
            'evolutionInterval',
            'learningInterval',
            'quantumEvolutionInterval',
            'continuousLearningInterval',
            'performanceMonitoringInterval',
            'backgroundTasksInterval',
            'coherenceMonitoringInterval',
            'safetyMonitoringInterval',
            'memoryMonitoringInterval'
        ];
        
        for (const intervalName of intervalsToClear) {
            if (global[intervalName]) {
                clearInterval(global[intervalName]);
                delete global[intervalName];
                clearedIntervals++;
            }
        }
        
        // Aggressive cleanup - clear all intervals in a range
        // Node.js interval IDs are typically sequential integers
        for (let i = 1; i < 10000; i++) {
            try {
                clearInterval(i);
                clearTimeout(i);
            } catch (e) {
                // Ignore errors for non-existent IDs
            }
        }
        
        this.metrics.intervalsCleared += clearedIntervals;
        console.log(`   ✅ Cleared ${clearedIntervals} known intervals`);
        console.log('   ✅ Performed aggressive interval/timeout cleanup');
    }
    
    /**
     * Block all autonomous operations
     */
    blockAutonomousOperations() {
        // Override common autonomous operation triggers
        const blockedFunctions = [
            'startEvolution',
            'startContinuousEvolution',
            'startQuantumEvolution',
            'startLearning',
            'startBackgroundTasks',
            'startMonitoring',
            'startTraining',
            'runSimulation'
        ];
        
        for (const [name, registration] of this.registeredSystems) {
            const { system } = registration;
            
            for (const fnName of blockedFunctions) {
                if (typeof system[fnName] === 'function') {
                    const originalFn = system[fnName];
                    system[fnName] = (...args) => {
                        if (this.globalObservationMode && this.enforcedMode) {
                            this.metrics.activationsBlocked++;
                            // Silently block - no logging to reduce spam
                            return false;
                        }
                        return originalFn.apply(system, args);
                    };
                }
            }
        }
    }
    
    /**
     * Exit observation mode (only if not enforced)
     */
    async exitObservationMode() {
        if (this.enforcedMode) {
            console.log('⚠️ Cannot exit observation mode - it is enforced');
            return false;
        }
        
        console.log('🔄 Exiting observation mode...');
        this.globalObservationMode = false;
        this.setGlobalFlags();
        
        for (const [name, registration] of this.registeredSystems) {
            const { system } = registration;
            if (typeof system.exitObservationMode === 'function') {
                system.exitObservationMode();
            }
            registration.inObservation = false;
        }
        
        this.metrics.lastExitObservation = new Date();
        this.metrics.systemsInObservation = 0;
        
        console.log('✅ Observation mode deactivated');
        return true;
    }
    
    /**
     * Handle user request - temporarily exit observation for specific systems
     */
    async handleUserRequest(request, requiredSystems = []) {
        console.log('\n📨 User request received');
        console.log('   Required systems:', requiredSystems.join(', ') || 'None specified');
        
        const activatedSystems = [];
        
        try {
            // Temporarily activate required systems
            for (const systemName of requiredSystems) {
                const registration = this.registeredSystems.get(systemName);
                if (registration && registration.inObservation) {
                    const { system } = registration;
                    
                    if (typeof system.exitObservationMode === 'function') {
                        system.exitObservationMode();
                    }
                    
                    registration.inObservation = false;
                    activatedSystems.push(systemName);
                    console.log(`   ✅ Activated: ${systemName}`);
                }
            }
            
            // Process the request
            console.log('   ⚙️ Processing request...');
            const result = await request();
            
            // Return systems to observation
            console.log('   🔄 Returning to observation mode...');
            for (const systemName of activatedSystems) {
                this.putSystemInObservation(systemName);
            }
            
            console.log('   ✅ Request completed\n');
            return result;
            
        } catch (error) {
            console.error('   ❌ Request failed:', error.message);
            
            // Ensure systems return to observation even on error
            for (const systemName of activatedSystems) {
                this.putSystemInObservation(systemName);
            }
            
            throw error;
        }
    }
    
    /**
     * Get controller status
     */
    getStatus() {
        const systemStatuses = [];
        for (const [name, registration] of this.registeredSystems) {
            systemStatuses.push({
                name,
                inObservation: registration.inObservation,
                registeredAt: registration.registeredAt
            });
        }
        
        return {
            globalObservationMode: this.globalObservationMode,
            enforcedMode: this.enforcedMode,
            metrics: this.metrics,
            registeredSystems: systemStatuses,
            logSuppression: {
                enabled: this.logSuppression.enabled,
                threshold: this.logSuppression.threshold,
                currentCount: this.logSuppression.currentCount
            }
        };
    }
    
    /**
     * Should log be suppressed?
     */
    shouldSuppressLog(level = 'info') {
        if (!this.globalObservationMode) {
            return false; // No suppression when not in observation mode
        }
        
        if (level === 'error' || level === 'critical') {
            return false; // Never suppress errors
        }
        
        this.logSuppression.currentCount++;
        
        if (this.logSuppression.currentCount > this.logSuppression.threshold) {
            return true; // Suppress log
        }
        
        return false;
    }
    
    /**
     * Shutdown the controller
     */
    async shutdown() {
        console.log('🛑 Shutting down SystemObservationController...');
        
        // Clear log suppression interval
        if (this.logSuppression.resetInterval) {
            clearInterval(this.logSuppression.resetInterval);
        }
        
        // Clear all intervals and timeouts one last time
        this.clearAllIntervalsAndTimeouts();
        
        // Clear registered systems
        this.registeredSystems.clear();
        
        // Remove all listeners
        this.removeAllListeners();
        
        console.log('✅ SystemObservationController shutdown complete');
    }
}

// Export singleton instance
export const systemObservationController = new SystemObservationController();

// Also export class for testing
export default SystemObservationController;
