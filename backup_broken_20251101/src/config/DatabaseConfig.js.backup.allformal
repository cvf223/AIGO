/**
 * 🗄️ DATABASE CONFIGURATION - PRODUCTION READY
 * ============================================
 * 
 * Centralized database configuration for all persistence systems
 * Ensures all new incentive and game theory systems have proper DB access
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Singleton pattern for database pool
let dbPoolInstance = null;

/**
 * Get or create database pool
 * @returns {Pool} PostgreSQL connection pool
 */
export function getDatabasePool() {
    if (!dbPoolInstance) {
        dbPoolInstance = new Pool({
            host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
            port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
            database: process.env.DB_NAME || process.env.POSTGRES_DB || 'construction_syndicate',
            user: process.env.DB_USER || process.env.POSTGRES_USER || 'postgres',
            password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'postgres',
            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        
        // Handle pool errors
        dbPoolInstance.on('error', (err, client) => {
            console.error('Unexpected database pool error:', err);
        });
        
        // Test connection
        dbPoolInstance.query('SELECT NOW()', (err, res) => {
            if (err) {
                console.error('❌ Database connection failed:', err);
            } else {
                console.log('✅ Database connection established:', res.rows[0].now);
            }
        });
    }
    
    return dbPoolInstance;
}

/**
 * Create persistence config with database
 * @param {Object} additionalConfig - Additional configuration
 * @returns {Object} Configuration object with database
 */
export function createPersistenceConfig(additionalConfig = {}) {
    return {
        database: getDatabasePool(),
        systemName: additionalConfig.systemName || 'DefaultSystem',
        backupInterval: additionalConfig.backupInterval || 3600000, // 1 hour
        checkpointInterval: additionalConfig.checkpointInterval || 21600000, // 6 hours
        ...additionalConfig
    };
}

/**
 * Close database pool (for cleanup)
 */
export async function closeDatabasePool() {
    if (dbPoolInstance) {
        await dbPoolInstance.end();
        dbPoolInstance = null;
        console.log('🔒 Database pool closed');
    }
}

export default {
    getDatabasePool,
    createPersistenceConfig,
    closeDatabasePool
};

