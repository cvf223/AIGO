/**
 * 🔋 UNIVERSAL PERSISTENCE ENHANCER - CONTINUOUS EVOLUTION ENABLER
 * =================================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - ENSURES CONTINUOUS LEARNING SURVIVES RESTARTS
 * 
 * CORE FEATURES:
 * - Hourly automatic backups (not 1-minute!)
 * - Breakthrough-triggered backups
 * - State recovery on initialization
 * - Performance metric persistence
 * - Evolution tracking across restarts
 * 
 * STANDARD CONFIGURATION:
 * - Hourly backups: 3600000ms (1 hour)
 * - Checkpoints: 21600000ms (6 hours)
 * - Breakthrough threshold: 20% improvement
 */

import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

export const UNIVERSAL_PERSISTENCE_CONFIG = {
    // HOURLY BACKUPS FOR EFFICIENCY
    HOURLY_BACKUP_INTERVAL: 3600000,        // 1 hour (not 1 minute!)
    CHECKPOINT_INTERVAL: 21600000,          // 6 hours
    
    // BREAKTHROUGH TRIGGERS
    BREAKTHROUGH_THRESHOLD: 0.20,           // 20% improvement triggers backup
    LEARNING_MILESTONE_THRESHOLD: 100,      // Every 100 learnings
    EVOLUTION_GENERATION_THRESHOLD: 10,     // Every 10 generations
    
    // RECOVERY CONFIG
    MAX_STATE_AGE: 7 * 24 * 3600000,       // 7 days max age
    RECOVERY_RETRY_ATTEMPTS: 3,
    RECOVERY_RETRY_DELAY: 5000,            // 5 seconds
    
    // PERFORMANCE TRACKING
    TRACK_PERFORMANCE_METRICS: true,
    TRACK_LEARNING_PROGRESS: true,
    TRACK_EVOLUTION_STAGES: true
};

/**
 * 🔋 UNIVERSAL PERSISTENCE ENHANCER
 * ================================
 */
export class UniversalPersistenceEnhancer {
    /**
     * 🚀 ENHANCE SYSTEM WITH PROPER PERSISTENCE
     * =========================================
     * Adds complete persistence capabilities to any system
     */
    static async enhanceSystem(system, config = {}) {
        const enhancedConfig = {
            systemName: config.systemName || system.constructor.name,
            enablePersistence: config.enablePersistence !== false,
            
            // USE HOURLY BACKUPS, NOT 1-MINUTE!
            backupInterval: config.backupInterval || UNIVERSAL_PERSISTENCE_CONFIG.HOURLY_BACKUP_INTERVAL,
            checkpointInterval: config.checkpointInterval || UNIVERSAL_PERSISTENCE_CONFIG.CHECKPOINT_INTERVAL,
            
            // Breakthrough configuration
            enableBreakthroughBackup: config.enableBreakthroughBackup !== false,
            breakthroughThreshold: config.breakthroughThreshold || UNIVERSAL_PERSISTENCE_CONFIG.BREAKTHROUGH_THRESHOLD,
            
            ...config
        };
        
        // Add persistence properties
        system.persistenceEngine = null;
        system.lastBackup = null;
        system.backupIntervalHandle = null;
        system.checkpointIntervalHandle = null;
        system.performanceBaseline = null;
        system.breakthroughCount = 0;
        system.stateRecoveries = 0;
        
        // Add persistence methods
        system.initializePersistence = async function() {
            console.log(`💾 Initializing persistence for ${enhancedConfig.systemName}...`);
            
            this.persistenceEngine = new EliteMemoryPersistenceEngine({
                namespace: enhancedConfig.systemName,
                enableAutoBackup: true,
                backupInterval: enhancedConfig.backupInterval
            });
            
            await this.persistenceEngine.initialize();
            
            console.log(`   ✅ Persistence initialized`);
            console.log(`   ⏰ Hourly backups: every ${enhancedConfig.backupInterval / 3600000} hours`);
            console.log(`   📸 Checkpoints: every ${enhancedConfig.checkpointInterval / 3600000} hours`);
            console.log(`   🚀 Breakthrough backups: ${enhancedConfig.enableBreakthroughBackup ? 'ENABLED' : 'DISABLED'}`);
        };
        
        // CRITICAL: Recover state on initialization
        system.recoverState = async function() {
            if (!this.persistenceEngine) return false;
            
            console.log(`🔄 Attempting to recover ${enhancedConfig.systemName} state...`);
            
            for (let attempt = 1; attempt <= UNIVERSAL_PERSISTENCE_CONFIG.RECOVERY_RETRY_ATTEMPTS; attempt++) {
                try {
                    const savedState = await this.persistenceEngine.loadState(`${enhancedConfig.systemName}_state`);
                    
                    if (!savedState) {
                        console.log(`   ℹ️ No previous state found - starting fresh`);
                        return false;
                    }
                    
                    // Check state age
                    const stateAge = Date.now() - (savedState.timestamp || 0);
                    if (stateAge > UNIVERSAL_PERSISTENCE_CONFIG.MAX_STATE_AGE) {
                        console.log(`   ⚠️ State too old (${Math.floor(stateAge / 86400000)} days) - starting fresh`);
                        return false;
                    }
                    
                    // Restore core properties
                    if (savedState.metrics) this.metrics = { ...this.metrics, ...savedState.metrics };
                    if (savedState.learningProgress) this.learningProgress = savedState.learningProgress;
                    if (savedState.evolutionStage) this.evolutionStage = savedState.evolutionStage;
                    if (savedState.performanceBaseline) this.performanceBaseline = savedState.performanceBaseline;
                    if (savedState.breakthroughCount) this.breakthroughCount = savedState.breakthroughCount;
                    
                    // Custom restoration (if system has it)
                    if (typeof this.restoreCustomState === 'function') {
                        await this.restoreCustomState(savedState);
                    }
                    
                    this.stateRecoveries++;
                    this.lastBackup = savedState.timestamp;
                    
                    console.log(`   ✅ State recovered from ${new Date(savedState.timestamp).toISOString()}`);
                    console.log(`   📊 Metrics restored: ${Object.keys(savedState.metrics || {}).length} metrics`);
                    console.log(`   🧠 Learning progress: ${savedState.learningProgress || 0}`);
                    console.log(`   🚀 Breakthroughs: ${this.breakthroughCount}`);
                    
                    return true;
                    
                } catch (error) {
                    console.error(`   ❌ Recovery attempt ${attempt} failed:`, error.message);
                    if (attempt < UNIVERSAL_PERSISTENCE_CONFIG.RECOVERY_RETRY_ATTEMPTS) {
                        await new Promise(resolve => setTimeout(resolve, UNIVERSAL_PERSISTENCE_CONFIG.RECOVERY_RETRY_DELAY));
                    }
                }
            }
            
            console.log(`   ⚠️ State recovery failed after ${UNIVERSAL_PERSISTENCE_CONFIG.RECOVERY_RETRY_ATTEMPTS} attempts`);
            return false;
        };
        
        // Save state with comprehensive data
        system.saveState = async function() {
            if (!this.persistenceEngine) return;
            
            const stateToSave = {
                timestamp: Date.now(),
                systemName: enhancedConfig.systemName,
                metrics: this.metrics || {},
                learningProgress: this.learningProgress || 0,
                evolutionStage: this.evolutionStage || 0,
                performanceBaseline: this.performanceBaseline,
                breakthroughCount: this.breakthroughCount,
                stateRecoveries: this.stateRecoveries,
                
                // Custom state (if system provides it)
                ...(typeof this.getCustomState === 'function' ? await this.getCustomState() : {})
            };
            
            await this.persistenceEngine.saveState(`${enhancedConfig.systemName}_state`, stateToSave);
            this.lastBackup = Date.now();
        };
        
        // Create checkpoint
        system.createCheckpoint = async function() {
            if (!this.persistenceEngine) return;
            
            await this.saveState();
            await this.persistenceEngine.createCheckpoint(`${enhancedConfig.systemName}_checkpoint`);
            console.log(`📸 Checkpoint created for ${enhancedConfig.systemName}`);
        };
        
        // BREAKTHROUGH BACKUP TRIGGER
        system.triggerBreakthroughBackup = async function(reason, improvement) {
            if (!enhancedConfig.enableBreakthroughBackup) return;
            
            console.log(`🚀 BREAKTHROUGH DETECTED in ${enhancedConfig.systemName}!`);
            console.log(`   Reason: ${reason}`);
            console.log(`   Improvement: ${(improvement * 100).toFixed(1)}%`);
            
            this.breakthroughCount++;
            
            // Immediate backup
            await this.saveState();
            
            // Create special breakthrough checkpoint
            await this.persistenceEngine.createCheckpoint(`${enhancedConfig.systemName}_breakthrough_${Date.now()}`);
            
            console.log(`   ✅ Breakthrough backup completed (Total breakthroughs: ${this.breakthroughCount})`);
        };
        
        // Check for breakthroughs in performance
        system.checkPerformanceBreakthrough = async function(currentPerformance) {
            if (!enhancedConfig.enableBreakthroughBackup) return;
            if (!this.performanceBaseline) {
                this.performanceBaseline = currentPerformance;
                return;
            }
            
            const improvement = (currentPerformance - this.performanceBaseline) / this.performanceBaseline;
            
            if (improvement >= enhancedConfig.breakthroughThreshold) {
                await this.triggerBreakthroughBackup('Performance breakthrough', improvement);
                
                // Update baseline
                this.performanceBaseline = currentPerformance;
            }
        };
        
        // Start automatic backups
        system.startAutomaticBackups = function() {
            // HOURLY backups
            this.backupIntervalHandle = setInterval(async () => {
                await this.saveState();
                const now = new Date().toISOString();
                console.log(`💾 [${enhancedConfig.systemName}] Hourly backup completed at ${now}`);
            }, enhancedConfig.backupInterval);
            
            // 6-hour checkpoints
            this.checkpointIntervalHandle = setInterval(async () => {
                await this.createCheckpoint();
            }, enhancedConfig.checkpointInterval);
            
            console.log(`🔄 Automatic backups started for ${enhancedConfig.systemName}`);
        };
        
        // Stop backups (for shutdown)
        system.stopAutomaticBackups = function() {
            if (this.backupIntervalHandle) {
                clearInterval(this.backupIntervalHandle);
                this.backupIntervalHandle = null;
            }
            if (this.checkpointIntervalHandle) {
                clearInterval(this.checkpointIntervalHandle);
                this.checkpointIntervalHandle = null;
            }
        };
        
        // Enhanced shutdown with final save
        const originalShutdown = system.shutdown;
        system.shutdown = async function() {
            console.log(`🛑 Shutting down ${enhancedConfig.systemName} with final save...`);
            
            this.stopAutomaticBackups();
            await this.saveState();
            await this.createCheckpoint();
            
            console.log(`   📊 Final metrics saved`);
            console.log(`   🚀 Total breakthroughs: ${this.breakthroughCount}`);
            console.log(`   🔄 Total recoveries: ${this.stateRecoveries}`);
            
            // Call original shutdown if exists
            if (typeof originalShutdown === 'function') {
                await originalShutdown.call(this);
            }
        };
        
        // AUTO-INITIALIZE AND RECOVER if system is already initialized
        if (system.isInitialized) {
            console.log(`🔧 Retrofitting persistence to already-initialized ${enhancedConfig.systemName}`);
            await system.initializePersistence();
            await system.recoverState();
            system.startAutomaticBackups();
        }
        
        return system;
    }
    
    /**
     * 🔄 RETROFIT EXISTING SYSTEM
     * ===========================
     * For systems that are already running
     */
    static async retrofitSystem(system, config = {}) {
        config.retrofit = true;
        return await this.enhanceSystem(system, config);
    }
}

export default UniversalPersistenceEnhancer;

