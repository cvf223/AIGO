/**
 * 🔒 OBSERVATION MODE ENFORCER
 * ============================
 * Central service for enforcing true observation/idle mode across all systems
 * Ensures NO background processes run when system should be idle
 */

import { EventEmitter } from 'events';

class ObservationModeEnforcer extends EventEmitter {
    constructor() {
        super();
        this.name = 'ObservationModeEnforcer';
        
        // Track all registered intervals and timeouts
        this.registeredIntervals = new Map();
        this.registeredTimeouts = new Map();
        this.registeredListeners = new Map();
        this.registeredProcesses = new Set();
        
        // State
        this.observationMode = false;
        this.enforcementActive = false;
        
        // Override global functions to track all intervals/timeouts
        this.overrideGlobalFunctions();
        
        // Statistics
        this.stats = {
            intervalsKilled: 0,
            timeoutsKilled: 0,
            listenersRemoved: 0,
            processesStoppeed: 0,
            enforcementCycles: 0
        };
    }
    
    /**
     * Override global setInterval and setTimeout to track all timers
     */
    overrideGlobalFunctions() {
        const originalSetInterval = global.setInterval;
        const originalSetTimeout = global.setTimeout;
        const originalClearInterval = global.clearInterval;
        const originalClearTimeout = global.clearTimeout;
        
        // Track all intervals
        global.setInterval = (callback, delay, ...args) => {
            // Don't allow new intervals in observation mode
            if (this.observationMode) {
                console.log(`🚫 Blocking new interval creation in observation mode`);
                return null;
            }
            
            const intervalId = originalSetInterval(callback, delay, ...args);
            
            // Track this interval
            this.registeredIntervals.set(intervalId, {
                callback: callback.toString().substring(0, 100),
                delay,
                createdAt: Date.now(),
                stack: new Error().stack
            });
            
            return intervalId;
        };
        
        // Track all timeouts
        global.setTimeout = (callback, delay, ...args) => {
            // Allow short timeouts even in observation mode (for cleanup)
            if (this.observationMode && delay > 5000) {
                console.log(`🚫 Blocking new long timeout (${delay}ms) in observation mode`);
                return null;
            }
            
            const timeoutId = originalSetTimeout(callback, delay, ...args);
            
            // Track this timeout
            this.registeredTimeouts.set(timeoutId, {
                callback: callback.toString().substring(0, 100),
                delay,
                createdAt: Date.now(),
                stack: new Error().stack
            });
            
            return timeoutId;
        };
        
        // Track clearing of intervals
        global.clearInterval = (intervalId) => {
            this.registeredIntervals.delete(intervalId);
            return originalClearInterval(intervalId);
        };
        
        // Track clearing of timeouts
        global.clearTimeout = (timeoutId) => {
            this.registeredTimeouts.delete(timeoutId);
            return originalClearTimeout(timeoutId);
        };
    }
    
    /**
     * Register a component that needs observation mode control
     */
    registerComponent(component, name) {
        if (component && typeof component.enterObservationMode === 'function') {
            this.registeredProcesses.add({
                component,
                name,
                hasObservationSupport: true
            });
            console.log(`📝 Registered component for observation control: ${name}`);
        }
    }
    
    /**
     * Enforce observation mode across all systems
     */
    async enforceObservationMode() {
        console.log('\n' + '='.repeat(60));
        console.log('🔒 ENFORCING OBSERVATION MODE');
        console.log('='.repeat(60));
        
        this.observationMode = true;
        this.enforcementActive = true;
        this.stats.enforcementCycles++;
        
        // Set global flags
        global.OBSERVATION_MODE_ENFORCED = true;
        global.OBSERVATION_MODE_GLOBAL = true;
        
        // Step 1: Stop all registered components
        console.log('🛑 Step 1: Stopping registered components...');
        for (const process of this.registeredProcesses) {
            try {
                if (process.hasObservationSupport) {
                    await process.component.enterObservationMode();
                    console.log(`   ✅ Stopped: ${process.name}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to stop ${process.name}:`, error.message);
            }
        }
        
        // Step 2: Clear all intervals
        console.log('🛑 Step 2: Clearing all intervals...');
        const intervalCount = this.registeredIntervals.size;
        for (const [intervalId, info] of this.registeredIntervals) {
            try {
                clearInterval(intervalId);
                this.stats.intervalsKilled++;
            } catch (error) {
                // Ignore errors for already cleared intervals
            }
        }
        console.log(`   ✅ Cleared ${intervalCount} intervals`);
        
        // Step 3: Clear long-running timeouts
        console.log('🛑 Step 3: Clearing long timeouts...');
        const now = Date.now();
        let timeoutCount = 0;
        for (const [timeoutId, info] of this.registeredTimeouts) {
            // Only clear timeouts that would run for more than 5 seconds
            if (info.delay > 5000 || (now - info.createdAt) < info.delay - 5000) {
                try {
                    clearTimeout(timeoutId);
                    this.stats.timeoutsKilled++;
                    timeoutCount++;
                } catch (error) {
                    // Ignore errors
                }
            }
        }
        console.log(`   ✅ Cleared ${timeoutCount} long timeouts`);
        
        // Step 4: Remove heavy event listeners
        console.log('🛑 Step 4: Removing event listeners...');
        let listenerCount = 0;
        for (const [emitter, listeners] of this.registeredListeners) {
            for (const { event, handler } of listeners) {
                try {
                    emitter.removeListener(event, handler);
                    this.stats.listenersRemoved++;
                    listenerCount++;
                } catch (error) {
                    // Ignore errors
                }
            }
        }
        console.log(`   ✅ Removed ${listenerCount} event listeners`);
        
        // Step 5: Force garbage collection if available
        if (global.gc) {
            console.log('🛑 Step 5: Forcing garbage collection...');
            global.gc();
            console.log('   ✅ Garbage collection complete');
        }
        
        // Step 6: Monitor for any new activity
        this.startEnforcementMonitor();
        
        console.log('\n📊 Enforcement Statistics:');
        console.log(`   Intervals killed: ${this.stats.intervalsKilled}`);
        console.log(`   Timeouts killed: ${this.stats.timeoutsKilled}`);
        console.log(`   Listeners removed: ${this.stats.listenersRemoved}`);
        console.log(`   Components stopped: ${this.registeredProcesses.size}`);
        
        console.log('\n✅ OBSERVATION MODE ENFORCED');
        console.log('🔭 System is now in TRUE IDLE state');
        console.log('='.repeat(60) + '\n');
        
        this.emit('observation_mode_enforced', this.stats);
    }
    
    /**
     * Monitor for violations of observation mode
     */
    startEnforcementMonitor() {
        // Check every 10 seconds for new intervals/timeouts
        const monitorInterval = setInterval(() => {
            if (!this.observationMode) {
                clearInterval(monitorInterval);
                return;
            }
            
            // Check for new intervals (should be none)
            if (this.registeredIntervals.size > 1) { // Allow the monitor itself
                console.warn(`⚠️ VIOLATION: ${this.registeredIntervals.size - 1} intervals detected in observation mode!`);
                
                // Kill them
                for (const [id, info] of this.registeredIntervals) {
                    if (id !== monitorInterval) {
                        clearInterval(id);
                        console.log(`   🔨 Killed interval: ${info.callback.substring(0, 50)}...`);
                    }
                }
            }
            
            // Check for long timeouts
            const longTimeouts = Array.from(this.registeredTimeouts.values())
                .filter(t => t.delay > 5000).length;
            
            if (longTimeouts > 0) {
                console.warn(`⚠️ VIOLATION: ${longTimeouts} long timeouts detected in observation mode!`);
            }
        }, 10000); // Check every 10 seconds
        
        // Track this interval but don't kill it
        this.monitorInterval = monitorInterval;
    }
    
    /**
     * Exit observation mode
     */
    async exitObservationMode() {
        console.log('\n🔓 Exiting observation mode...');
        
        this.observationMode = false;
        this.enforcementActive = false;
        
        // Clear global flags
        global.OBSERVATION_MODE_ENFORCED = false;
        global.OBSERVATION_MODE_GLOBAL = false;
        
        // Stop monitor
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        // Notify components they can resume
        for (const process of this.registeredProcesses) {
            try {
                if (process.component.exitObservationMode) {
                    await process.component.exitObservationMode();
                    console.log(`   ✅ Resumed: ${process.name}`);
                }
            } catch (error) {
                console.error(`   ❌ Failed to resume ${process.name}:`, error.message);
            }
        }
        
        console.log('✅ Observation mode exited - normal operation resumed');
        
        this.emit('observation_mode_exited');
    }
    
    /**
     * Get current enforcement status
     */
    getStatus() {
        return {
            observationMode: this.observationMode,
            enforcementActive: this.enforcementActive,
            activeIntervals: this.registeredIntervals.size,
            activeTimeouts: this.registeredTimeouts.size,
            registeredComponents: this.registeredProcesses.size,
            stats: { ...this.stats }
        };
    }
    
    /**
     * Emergency kill all
     */
    emergencyKillAll() {
        console.log('🚨 EMERGENCY KILL ALL PROCESSES');
        
        // Force clear everything
        for (const [id] of this.registeredIntervals) {
            try { clearInterval(id); } catch(e) {}
        }
        
        for (const [id] of this.registeredTimeouts) {
            try { clearTimeout(id); } catch(e) {}
        }
        
        this.registeredIntervals.clear();
        this.registeredTimeouts.clear();
        this.registeredListeners.clear();
        
        // Force GC
        if (global.gc) {
            global.gc();
        }
        
        console.log('✅ Emergency kill complete');
    }
}

// Export singleton
export const observationModeEnforcer = new ObservationModeEnforcer();
export default ObservationModeEnforcer;
