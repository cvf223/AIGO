/**
 * 🚫 SERVICE BLACKLIST SYSTEM
 * ===========================
 * Prevents specific services from loading based on system mode
 * Ensures true minimal mode operation
 */

// Service blacklists for different modes
const SERVICE_BLACKLIST = {
    // OBSERVATION MODE: Only essential services allowed
    observation: new Set([
        'alphaGnome',
        'quantumEvolution', 
        'ultraFastTransformer',
        'overtrainingPrevention',
        'memorySinkPrevention',
        'quantumEntanglement',
        'evolutionCollaboration',
        'creativitySystemIntegrator',
        'memoryDestillationEngine',
        'quantumEnhancedQuantization',
        'backgroundTaskManager',
        'autonomousIntelligence',
        'complexityMonitor',
        'constructionSyndicate',
        'llmJudge',
        'centralNervousSystem',
        'worldModel',
        'contextEngine',
        'sharedMemory'
    ]),
    
    // FULL MODE: Allow all services
    full: new Set([]),
    
    // DEBUG MODE: Skip heavy background systems
    debug: new Set([
        'backgroundTaskManager',
        'autonomousIntelligence',
        'continuousMonitoring',
        'hourlyBackups'
    ])
};

// Services that are ALWAYS allowed (essential for any mode)
const ALWAYS_ALLOWED = new Set([
    'database',
    'dbPool',
    'systemHealthReporter',
    'onDemandActivator',
    'observationModeEnforcer',
    'serviceRegistry',
    'globalDatabaseRegistry'
]);

class ServiceBlacklist {
    constructor() {
        this.currentMode = this.detectMode();
        this.blacklist = SERVICE_BLACKLIST[this.currentMode] || new Set();
        
        console.log(`🚫 ServiceBlacklist initialized for ${this.currentMode.toUpperCase()} mode`);
        console.log(`   Blacklisted services: ${this.blacklist.size}`);
    }
    
    /**
     * Detect current system mode
     */
    detectMode() {
        if (global.MINIMAL_MODE || global.OBSERVATION_MODE_ENFORCED) {
            return 'observation';
        }
        
        if (process.env.SYNDICATE_MODE) {
            return process.env.SYNDICATE_MODE.toLowerCase();
        }
        
        if (process.env.NODE_ENV === 'development') {
            return 'debug';
        }
        
        return 'full'; // Default
    }
    
    /**
     * Check if a service is blacklisted
     */
    isBlacklisted(serviceName) {
        // Always allow essential services
        if (ALWAYS_ALLOWED.has(serviceName)) {
            return false;
        }
        
        // Check blacklist for current mode
        return this.blacklist.has(serviceName);
    }
    
    /**
     * Get allowed services for current mode
     */
    getAllowedServices() {
        const allServices = [
            ...Array.from(ALWAYS_ALLOWED),
            ...Array.from(SERVICE_BLACKLIST.full).filter(s => !this.blacklist.has(s))
        ];
        
        return allServices.filter(s => !this.isBlacklisted(s));
    }
    
    /**
     * Create a stub service for blacklisted items
     */
    createStubService(serviceName, reason = 'blacklisted') {
        return {
            disabled: true,
            name: serviceName,
            reason,
            mode: this.currentMode,
            
            // Stub methods that might be called
            initialize: () => Promise.resolve(),
            start: () => Promise.resolve(),
            stop: () => Promise.resolve(),
            enterObservationMode: () => Promise.resolve(),
            exitObservationMode: () => Promise.resolve(),
            
            // Stub getters
            get isInitialized() { return true; },
            get isRunning() { return false; }
        };
    }
    
    /**
     * Log blacklist enforcement
     */
    logEnforcement(serviceName, action) {
        if (this.isBlacklisted(serviceName)) {
            console.log(`🚫 ServiceBlacklist: ${action} '${serviceName}' (mode: ${this.currentMode})`);
            return true;
        }
        return false;
    }
    
    /**
     * Get blacklist statistics
     */
    getStats() {
        return {
            mode: this.currentMode,
            blacklistedCount: this.blacklist.size,
            allowedCount: this.getAllowedServices().length,
            blacklisted: Array.from(this.blacklist),
            allowed: this.getAllowedServices()
        };
    }
}

// Export singleton
export const serviceBlacklist = new ServiceBlacklist();
export default ServiceBlacklist;
