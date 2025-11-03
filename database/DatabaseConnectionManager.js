/**
 * 📊 DATABASE CONNECTION MANAGER (STUB)
 * =====================================
 * 
 * Stub module to prevent import errors during initialization.
 * Redirects to DatabasePoolManager for actual database operations.
 */

import { DatabasePoolManager } from '../src/database/DatabasePoolManager.js';

// Export a singleton instance that redirects to DatabasePoolManager
export const databaseConnectionManager = {
    async getPool() {
        console.log('⚠️ DatabaseConnectionManager: Redirecting to DatabasePoolManager');
        return DatabasePoolManager.getSharedPool();
    },
    
    async initialize() {
        console.log('📊 DatabaseConnectionManager: Using DatabasePoolManager for initialization');
        return DatabasePoolManager.getInstance();
    },
    
    async shutdown() {
        const pool = await DatabasePoolManager.getSharedPool();
        if (pool && pool.end) {
            await pool.end();
        }
    }
};

export class DatabaseConnectionManager {
    constructor() {
        console.log('⚠️ DatabaseConnectionManager: Using stub implementation');
        return databaseConnectionManager;
    }
    
    static getInstance() {
        return databaseConnectionManager;
    }
}

export default DatabaseConnectionManager;
