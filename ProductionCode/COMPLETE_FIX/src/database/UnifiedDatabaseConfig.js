/**
 * 🗄️ UNIFIED DATABASE CONFIGURATION - PRODUCTION IMPLEMENTATION
 * =============================================================
 * 
 * SINGLE SOURCE OF TRUTH for all database connections
 * 
 * Handles multiple environment variable patterns:
 * - DATABASE_URL (connection string)
 * - POSTGRES_* (individual variables)
 * 
 * Provides consistent interface for:
 * - dbPool (standard pattern)
 * - database (alternative pattern)
 * - db (legacy pattern)
 * 
 * @author Elite AI Syndicate - Infrastructure Team
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🗄️ UNIFIED DATABASE CONFIGURATION
 * ================================
 */
export class UnifiedDatabaseConfig {
    constructor() {
        this.pool = null;
        this.isInitialized = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        
        console.log('🗄️ Unified Database Config created');
    }
    
    /**
     * 🔗 GET DATABASE CONFIG - PRODUCTION IMPLEMENTATION
     * ================================================
     * Builds database configuration from environment variables
     */
    async getDatabaseConfig() {
        // Priority 1: Use DATABASE_URL if provided
        if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'mock://database') {
            console.log('   🔗 Using DATABASE_URL connection string');
            
            // 🔍 DEBUG: Log connection details (mask password)
            const urlForLog = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':****@');
            console.log(`   🔍 DEBUG: Connection URL: ${urlForLog}`);
            
            // Import optimized config for 896GB RAM server
            const { PRODUCTION_DB_CONFIG } = await import('../config/ProductionDatabaseConfig.js');
            
            // 🔍 DEBUG: Verify config has connectionString
            console.log(`   🔍 DEBUG: Config connectionString exists: ${!!PRODUCTION_DB_CONFIG.connectionString}`);
            
            return PRODUCTION_DB_CONFIG;
        }
        
        // Priority 2: Build from individual POSTGRES_* variables
        const host = (process.env.POSTGRES_HOST || 'localhost').trim();
        const port = parseInt(process.env.POSTGRES_PORT) || 5432;
        const database = (process.env.POSTGRES_DB || 'AIGO_Construction_Syndicate').trim();
        const user = (process.env.POSTGRES_USER || 'postgres').trim();
        const password = (process.env.POSTGRES_PASSWORD || 'postgres').trim();
        const ssl = process.env.POSTGRES_SSL === 'true';
        
        console.log(`   🔗 Building connection from POSTGRES_* variables`);
        console.log(`     Host: ${host}`);
        console.log(`     Port: ${port}`);
        console.log(`     Database: ${database}`);
        console.log(`     User: ${user}`);
        console.log(`     SSL: ${ssl}`);
        
        // Build connection string
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}${ssl ? '?sslmode=require' : ''}`;
        
        // Build base config with connection details
        const baseConfig = {
            connectionString,
            host,
            port,
            database,
            user,
            password,
            ssl: ssl ? { rejectUnauthorized: false } : false
        };
        
        // Import and merge with optimized production settings
        try {
            const { PRODUCTION_DB_CONFIG } = await import('../config/ProductionDatabaseConfig.js');
            return {
                ...PRODUCTION_DB_CONFIG,
                ...baseConfig // Override connection details but keep optimization settings
            };
        } catch (error) {
            console.warn('   ⚠️ Could not load optimized config, using defaults');
            return {
                ...baseConfig,
                max: 20,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000
            };
        }
    }
    
    /**
     * 🚀 CREATE POOL - PRODUCTION IMPLEMENTATION
     * ========================================
     */
    async createPool() {
        try {
            if (this.pool) {
                console.log('   ⚠️ Pool already exists, returning existing');
                return this.pool;
            }
            
            console.log('🚀 Creating unified database pool...');
            
            const config = await this.getDatabaseConfig();
            
            // 🔍 DEBUG: Log config being used (mask password in connectionString)
            const debugConfig = { ...config };
            if (debugConfig.connectionString) {
                debugConfig.connectionString = debugConfig.connectionString.replace(/:([^:@]+)@/, ':****@');
            }
            console.log('   🔍 DEBUG: Pool config:', JSON.stringify(debugConfig, null, 2));
            
            this.pool = new Pool(config);
            
            // Test connection with retry logic
            const testStart = Date.now();
            let connected = false;
            let lastError = null;
            
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const client = await this.pool.connect();
                    await client.query('SELECT NOW()');
                    client.release();
                    connected = true;
                    break;
                } catch (error) {
                    lastError = error;
                    console.log(`   ⚠️ Connection attempt ${attempt}/3 failed: ${error.message}`);
                    if (attempt < 3) {
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
                    }
                }
            }
            
            if (!connected) {
                throw lastError;
            }
            
            const testTime = Date.now() - testStart;
            
            this.isInitialized = true;
            
            console.log(`✅ Database pool created successfully in ${testTime}ms`);
            console.log(`   📊 Max connections: ${config.max}`);
            console.log(`   🔗 Database: ${config.database || 'from_url'}`);
            
            return this.pool;
            
        } catch (error) {
            console.error('❌ Database pool creation failed:', error);
            
            this.connectionAttempts++;
            
            if (this.connectionAttempts < this.maxRetries) {
                console.log(`   🔄 Retrying (${this.connectionAttempts}/${this.maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
                return await this.createPool();
            }
            
            console.error('❌ Max retries reached - database unavailable');
            throw error;
        }
    }
    
    /**
     * 🔍 TEST CONNECTION - PRODUCTION IMPLEMENTATION
     * ============================================
     */
    async testConnection() {
        try {
            if (!this.pool) {
                return { success: false, reason: 'pool_not_created' };
            }
            
            const testStart = Date.now();
            const client = await this.pool.connect();
            
            const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
            client.release();
            
            const testTime = Date.now() - testStart;
            
            return {
                success: true,
                testTime,
                currentTime: result.rows[0].current_time,
                pgVersion: result.rows[0].pg_version
            };
            
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * 🔧 GET POOL - PRODUCTION IMPLEMENTATION
     * =====================================
     * Returns the pool, creating it if needed
     */
    async getPool() {
        if (!this.pool) {
            await this.createPool();
        }
        
        return this.pool;
    }
    
    /**
     * 🛑 CLOSE POOL - PRODUCTION IMPLEMENTATION
     * =======================================
     */
    async closePool() {
        if (this.pool) {
            console.log('🛑 Closing database pool...');
            await this.pool.end();
            this.pool = null;
            this.isInitialized = false;
            console.log('✅ Database pool closed');
        }
    }
}

// Singleton instance
let unifiedDatabaseInstance = null;

/**
 * 🎯 GET UNIFIED DATABASE - PRODUCTION IMPLEMENTATION
 * =================================================
 * Returns singleton instance of unified database config
 */
export async function getUnifiedDatabase() {
    if (!unifiedDatabaseInstance) {
        unifiedDatabaseInstance = new UnifiedDatabaseConfig();
    }
    
    if (!unifiedDatabaseInstance.pool) {
        await unifiedDatabaseInstance.createPool();
    }
    
    return unifiedDatabaseInstance.pool;
}

/**
 * 🧪 GET DATABASE CONFIG ONLY - PRODUCTION IMPLEMENTATION
 * =====================================================
 * Returns config without creating pool (for display/logging)
 */
export function getDatabaseConfigOnly() {
    const instance = new UnifiedDatabaseConfig();
    return instance.getDatabaseConfig();
}

export default UnifiedDatabaseConfig;

