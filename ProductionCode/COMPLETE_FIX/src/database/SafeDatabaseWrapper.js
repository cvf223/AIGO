/**
 * 🛡️ SAFE DATABASE WRAPPER - GRACEFUL DEGRADATION
 * =================================================
 * 
 * Wraps ALL database operations with null checks and error handling
 * Prevents cascade failures when DB unavailable
 */

export function createSafeDatabaseWrapper(dbPool) {
    return {
        // Original pool reference
        _pool: dbPool,
        
        // Safe query method
        query: async function(sql, params) {
            if (!this._pool || typeof this._pool.query !== 'function') {
                console.warn('⚠️ DB query skipped - pool unavailable');
                return { rows: [], rowCount: 0 };
            }
            
            try {
                return await this._pool.query(sql, params);
            } catch (error) {
                console.error(`❌ DB query failed: ${error.message}`);
                return { rows: [], rowCount: 0 };
            }
        },
        
        // Safe connect method
        connect: async function() {
            if (!this._pool || typeof this._pool.connect !== 'function') {
                console.warn('⚠️ DB connect skipped - pool unavailable');
                return null;
            }
            
            try {
                return await this._pool.connect();
            } catch (error) {
                console.error(`❌ DB connect failed: ${error.message}`);
                return null;
            }
        },
        
        // Check if pool is healthy
        isHealthy: function() {
            return !!(this._pool && typeof this._pool.query === 'function');
        }
    };
}

// Utility to wrap existing pools
export function wrapDatabasePool(pool) {
    if (!pool) {
        return createSafeDatabaseWrapper(null);
    }
    
    // If already wrapped, return as-is
    if (pool.isHealthy) {
        return pool;
    }
    
    return createSafeDatabaseWrapper(pool);
}

