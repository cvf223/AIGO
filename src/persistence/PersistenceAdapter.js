/**
 * 🔄 PERSISTENCE ADAPTER - PRODUCTION INTERFACE
 * =============================================
 * 
 * Adapts EliteMemoryPersistenceEngine to provide standard persistence interface
 * for all incentive and game theory systems
 */

import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';
import { createPersistenceConfig } from '../config/DatabaseConfig.js';

export class PersistenceAdapter {
    constructor(config = {}) {
        this.config = config;
        this.engine = null;
        this.systemName = config.systemName || 'DefaultSystem';
    }
    
    /**
     * Initialize the persistence engine with database
     */
    async initialize() {
        // Create config with database connection
        const persistenceConfig = createPersistenceConfig(this.config);
        
        // Initialize the elite memory engine
        this.engine = new EliteMemoryPersistenceEngine(persistenceConfig);
        await this.engine.initialize();
        
        return true;
    }
    
    /**
     * Save state using quantum memory storage
     * @param {string} key - State key
     * @param {Object} state - State to save
     */
    async saveState(key, state) {
        if (!this.engine) {
            throw new Error('Persistence engine not initialized');
        }
        
        // Store as quantum memory
        const memoryId = await this.engine.storeQuantumMemory(
            this.systemName,  // agentId
            'state',          // memoryType
            {
                key,
                state,
                timestamp: Date.now(),
                version: this.config.version || '1.0.0'
            },
            {
                priority: 'high',
                compression: true,
                encryption: false
            }
        );
        
        // Store the memory ID for retrieval
        this.lastMemoryId = memoryId;
        
        return memoryId;
    }
    
    /**
     * Load state from quantum memory
     * @param {string} key - State key
     */
    async loadState(key) {
        if (!this.engine) {
            throw new Error('Persistence engine not initialized');
        }
        
        try {
            // Try to retrieve by constructing the expected memory ID
            const memoryId = `${this.systemName}_state_${key}`;
            
            const memoryData = await this.engine.retrieveQuantumMemory(
                memoryId,
                { bypassCache: false }
            );
            
            if (memoryData && memoryData.state) {
                return memoryData.state;
            }
            
            // If not found, try the last saved memory ID
            if (this.lastMemoryId) {
                const lastMemory = await this.engine.retrieveQuantumMemory(
                    this.lastMemoryId,
                    { bypassCache: false }
                );
                
                if (lastMemory && lastMemory.state && lastMemory.key === key) {
                    return lastMemory.state;
                }
            }
            
            return null;
        } catch (error) {
            console.warn(`⚠️ Could not load state for ${key}:`, error.message);
            return null;
        }
    }
    
    /**
     * Create a checkpoint
     * @param {string} checkpointName - Name for the checkpoint
     */
    async createCheckpoint(checkpointName) {
        if (!this.engine) {
            throw new Error('Persistence engine not initialized');
        }
        
        // Create checkpoint using quantum memory with special marker
        const checkpointId = await this.engine.storeQuantumMemory(
            this.systemName,
            'checkpoint',
            {
                checkpointName,
                timestamp: Date.now(),
                lastMemoryId: this.lastMemoryId,
                metrics: this.engine.performanceMetrics
            },
            {
                priority: 'critical',
                compression: true,
                encryption: true
            }
        );
        
        console.log(`📸 Checkpoint created: ${checkpointId}`);
        return checkpointId;
    }
    
    /**
     * Evolve memory using quantum evolution
     * @param {string} key - State key to evolve
     */
    async evolveState(key) {
        if (!this.engine && this.lastMemoryId) {
            throw new Error('Persistence engine not initialized');
        }
        
        try {
            const evolvedId = await this.engine.evolveMemory(
                this.lastMemoryId,
                'adaptive_mutation',
                { learningRate: 0.1 }
            );
            
            return evolvedId;
        } catch (error) {
            console.warn(`⚠️ Could not evolve state:`, error.message);
            return null;
        }
    }
}

/**
 * Create a persistence adapter instance
 * @param {Object} config - Configuration
 */
export function createPersistenceAdapter(config) {
    return new PersistenceAdapter(config);
}

export default PersistenceAdapter;

