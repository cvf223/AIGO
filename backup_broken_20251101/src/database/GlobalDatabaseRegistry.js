/**
 * 🗄️ GLOBAL DATABASE REGISTRY - REFACTORED WITHOUT GLOBAL STATE
 * =============================================================
 * 
 * Provides centralized database access WITHOUT global state mutations
 * Uses ServiceRegistry for proper dependency injection
 * 
 * FEATURES:
 * - No global state mutations
 * - Integration with ServiceRegistry
 * - Lazy initialization
 * - Connection pooling
 * - Error handling and recovery
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { serviceRegistry } from '../core/ServiceRegistry.js';

class GlobalDatabaseRegistry extends EventEmitter {
    constructor() {
        super();
        
        this.isInitialized = false;
        this.initializationPromise = null;
        this.dbPool = null;
        
        console.log('🗄️ GlobalDatabaseRegistry created (no global state)');
    }
    
    /**
     * 🚀 Initialize database registry using ServiceRegistry
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        if (this.initializationPromise) {
            return await this.initializationPromise;
        }
        
        this.initializationPromise = this._performInitialization();
        
        try {
            await this.initializationPromise;
            this.isInitialized = true;
            return true;
        } catch (error) {
            this.initializationPromise = null;
            throw error;
        }
    }
    
    /**
     * 🔧 Perform actual initialization
     */
    async _performInitialization() {
        console.log('🗄️ Initializing GlobalDatabaseRegistry...');
        
        try {
            // Try to get database from service registry first
            this.dbPool = await serviceRegistry.get('dbPool', { optional: true });
            
            if (!this.dbPool) {
                // If not in registry, try to get from DatabasePoolManager
                const { DatabasePoolManager } = await import('./DatabasePoolManager.js');
                const dbManager = DatabasePoolManager.getInstance();
                
                if (!dbManager.isInitialized()) {
                    await dbManager.initialize();
                }
                
                this.dbPool = dbManager.getPool();
                
                // Register in service registry for other components
                if (this.dbPool) {
                    serviceRegistry.register('dbPool', this.dbPool, { lazy: false });
                }
            }
            
            if (!this.dbPool) {
                throw new Error('Failed to obtain database pool');
            }
            
            // Test connection
            const client = await this.dbPool.connect();
            await client.query('SELECT 1');
            client.release();
            
            console.log('✅ GlobalDatabaseRegistry initialized successfully');
            this.emit('initialized', { hasPool: true });
            
            return true;
            
        } catch (error) {
            console.error('❌ GlobalDatabaseRegistry initialization failed:', error);
            this.emit('initializationFailed', { error });
            throw error;
        }
    }
    
    /**
     * 🎯 Get database pool (no global access)
     */
    async getDatabase() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        if (!this.dbPool) {
            throw new Error('Database pool not available');
        }
        
        return this.dbPool;
    }
    
    /**
     * 🔍 Check if database is available
     */
    isAvailable() {
        return this.isInitialized && this.dbPool !== null;
    }
    
    /**
     * 📊 Get connection statistics
     */
    getStats() {
        if (!this.dbPool) {
            return { available: false };
        }
        
        return {
            available: true,
            totalCount: this.dbPool.totalCount,
            idleCount: this.dbPool.idleCount,
            waitingCount: this.dbPool.waitingCount
        };
    }
    
    /**
     * 🛑 Shutdown registry
     */
    async shutdown() {
        console.log('🛑 Shutting down GlobalDatabaseRegistry...');
        
        if (this.dbPool) {
            try {
                await this.dbPool.end();
                console.log('✅ Database pool closed');
            } catch (error) {
                console.error('❌ Error closing database pool:', error);
            }
        }
        
        this.dbPool = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        
        this.emit('shutdown');
    }
    
    /**
     * 🏥 Health check
     */
    async healthCheck() {
        if (!this.isInitialized || !this.dbPool) {
            return { healthy: false, reason: 'Not initialized' };
        }
        
        try {
            const client = await this.dbPool.connect();
            const result = await client.query('SELECT NOW() as time');
            client.release();
            
            return {
                healthy: true,
                serverTime: result.rows[0].time,
                poolStats: this.getStats()
            };
        } catch (error) {
            return {
                healthy: false,
                reason: error.message,
                poolStats: this.getStats()
            };
        }
    }
}

// Create singleton instance
export const globalDatabaseRegistry = new GlobalDatabaseRegistry();

// Export convenience function that doesn't use global state
export async function getGlobalDatabase() {
    return await globalDatabaseRegistry.getDatabase();
}

// Register health check with service registry
if (serviceRegistry) {
    serviceRegistry.register('globalDatabaseRegistry', globalDatabaseRegistry, {
        lazy: false,
        singleton: true,
        healthCheck: async (service) => await service.healthCheck()
    });
}