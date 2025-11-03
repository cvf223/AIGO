/**
 * 🗄️ DATABASE CONNECTION MANAGER - SINGLE SOURCE OF TRUTH
 * ========================================================
 * 
 * TOP 1% EXPERT SOLUTION: Centralized database connection management
 * - Prevents duplicate pool creation
 * - Ensures all systems use same connection
 * - Graceful degradation if DB unavailable
 * - Automatic reconnection on failure
 */

import { getUnifiedDatabase } from './UnifiedDatabaseConfig.js';

class DatabaseConnectionManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 5;
        this.retryDelay = 2000; // 2 seconds
        this.connectedSystems = new Set();
        
        console.log('🗄️ DatabaseConnectionManager created - Single source of truth');
    }
    
    /**
     * Get database pool (creates if needed)
     */
    async getPool() {
        if (this.pool && this.isConnected) {
            return this.pool;
        }
        
        if (this.connectionAttempts >= this.maxRetries) {
            console.error(`❌ Max connection retries (${this.maxRetries}) exceeded`);
            return null;
        }
        
        try {
            this.connectionAttempts++;
            console.log(`🔗 Getting database pool (attempt ${this.connectionAttempts}/${this.maxRetries})...`);
            
            this.pool = await getUnifiedDatabase();
            
            // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            
            this.isConnected = true;
            this.connectionAttempts = 0; // Reset on success
            
            console.log('✅ Database connection established');
            return this.pool;
            
        } catch (error) {
            console.error(`❌ Database connection failed (attempt ${this.connectionAttempts}):`, error.message);
            
            if (this.connectionAttempts < this.maxRetries) {
                console.log(`   🔄 Retrying in ${this.retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
                return this.getPool(); // Recursive retry
            }
            
            this.isConnected = false;
            return null;
        }
    }
    
    /**
     * Register system using this connection
     */
    registerSystem(systemName) {
        this.connectedSystems.add(systemName);
        console.log(`   📊 System registered: ${systemName} (${this.connectedSystems.size} total)`);
    }
    
    /**
     * Execute query with fallback
     */
    async query(sql, params) {
        const pool = await this.getPool();
        
        if (!pool) {
            console.warn('⚠️ No database connection - query skipped');
            return { rows: [], rowCount: 0 };
        }
        
        try {
            return await pool.query(sql, params);
        } catch (error) {
            console.error('❌ Query failed:', error.message);
            this.isConnected = false; // Mark as disconnected
            return { rows: [], rowCount: 0 };
        }
    }
    
    /**
     * Check if connected
     */
    async isHealthy() {
        try {
            const pool = await this.getPool();
            if (!pool) return false;
            
            const client = await pool.connect();
            await client.query('SELECT 1');
            client.release();
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Get connection status
     */
    getStatus() {
        return {
            isConnected: this.isConnected,
            hasPool: !!this.pool,
            registeredSystems: this.connectedSystems.size,
            connectionAttempts: this.connectionAttempts
        };
    }
}

// Singleton instance
const dbConnectionManager = new DatabaseConnectionManager();

export default dbConnectionManager;
export { dbConnectionManager };

