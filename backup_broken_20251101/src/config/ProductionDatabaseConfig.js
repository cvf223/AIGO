/**
 * 🚀 PRODUCTION DATABASE CONFIGURATION - 896GB RAM OPTIMIZED
 * ========================================================
 * 
 * Optimized for AMD EPYC 7502P server with 896GB RAM
 * Supports 500+ concurrent connections for maximum throughput
 * 
 * CRITICAL: Set all environment variables before deployment!
 */

import pkg from 'pg';
const { Pool } = pkg;

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'NODE_ENV'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ CRITICAL: Missing required environment variable: ${envVar}`);
        console.error(`   Set it in your .env file or system environment`);
    }
}

/**
 * 🗄️ PRODUCTION DATABASE CONFIGURATION FOR 896GB RAM
 * 
 * Optimized settings for massive concurrent operations
 */
export const PRODUCTION_DB_CONFIG = {
    // Connection string from environment (NEVER hardcode!)
    connectionString: process.env.DATABASE_URL,
    
    // 🚀 CONNECTION POOL OPTIMIZATION FOR 896GB RAM
    // Adjusted for actual usage (construction analysis, not high-frequency trading)
    max: 200,                          // Maximum pool size (realistic for construction workload)
    min: 20,                           // Minimum pool size
    idleTimeoutMillis: 300000,         // 5 minutes idle timeout
    connectionTimeoutMillis: 10000,    // 10 second connection timeout
    
    // 📊 STATEMENT TIMEOUTS (construction analysis can take longer)
    statement_timeout: 300000,         // 5 minute statement timeout (plan analysis)
    query_timeout: 300000,             // 5 minute query timeout
    idle_in_transaction_session_timeout: 600000, // 10 minute idle transaction timeout
    
    // 🔄 CONNECTION RECYCLING
    maxUses: 10000,                    // Recycle connection after 10k queries
    
    // 🔐 SECURITY
    ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
    
    // 📝 IDENTIFICATION
    application_name: 'construction_syndicate_prod_896gb',
    
    // 🧠 POSTGRESQL SESSION-LEVEL PARAMETERS
    // NOTE: shared_buffers/effective_cache_size MUST be in postgresql.conf!
    // These are per-session/per-query parameters only
    options: process.env.NODE_ENV === 'production' 
        ? '-c statement_timeout=300000 -c lock_timeout=30000 -c idle_in_transaction_session_timeout=600000'
        : '-c statement_timeout=60000' // Dev settings
};

/**
 * 🏗️ CREATE OPTIMIZED DATABASE POOL
 * 
 * Factory function to create properly configured pool
 */
export function createOptimizedPool(customConfig = {}) {
    const config = {
        ...PRODUCTION_DB_CONFIG,
        ...customConfig
    };
    
    console.log('🗄️ Creating optimized database pool:');
    console.log(`   📊 Max connections: ${config.max}`);
    console.log(`   💾 Shared buffers: ${config.options.includes('200GB') ? '200GB' : '256MB'}`);
    console.log(`   🔄 Connection recycling: Every ${config.maxUses} queries`);
    console.log(`   ⏱️ Statement timeout: ${config.statement_timeout}ms`);
    
    const pool = new Pool(config);
    
    // 🔍 POOL EVENT MONITORING
    pool.on('error', (err, client) => {
        console.error('🚨 Unexpected database pool error:', err);
    });
    
    pool.on('connect', (client) => {
        // Set runtime parameters for each new connection
        client.query(`
            SET statement_timeout = ${config.statement_timeout};
            SET lock_timeout = 30000;
            SET idle_in_transaction_session_timeout = ${config.idle_in_transaction_session_timeout};
        `).catch(err => {
            console.error('⚠️ Failed to set connection parameters:', err);
        });
    });
    
    return pool;
}

/**
 * 🧮 NUMA-AWARE CONFIGURATION FOR AMD EPYC
 * 
 * Optimize for 4 NUMA nodes on EPYC 7502P
 */
export const NUMA_DB_CONFIG = {
    // Split connections across NUMA nodes
    numaNodes: 4,
    connectionsPerNode: 125, // 500 total / 4 nodes
    
    // CPU affinity for database operations
    cpuAffinity: {
        node0: [0, 1, 2, 3, 4, 5, 6, 7],
        node1: [8, 9, 10, 11, 12, 13, 14, 15],
        node2: [16, 17, 18, 19, 20, 21, 22, 23],
        node3: [24, 25, 26, 27, 28, 29, 30, 31]
    }
};

/**
 * 🚀 POSTGRESQL CONFIGURATION RECOMMENDATIONS
 * 
 * Add these to postgresql.conf for optimal performance:
 * 
 * # MEMORY (for 896GB RAM)
 * shared_buffers = 200GB              # 22% of RAM
 * effective_cache_size = 600GB        # 67% of RAM  
 * work_mem = 1GB                      # Per operation
 * maintenance_work_mem = 4GB          # For VACUUM, etc
 * 
 * # CONNECTIONS
 * max_connections = 600               # Support all pool connections
 * 
 * # PARALLELISM (for 32 cores)
 * max_worker_processes = 32
 * max_parallel_workers_per_gather = 16
 * max_parallel_maintenance_workers = 8
 * max_parallel_workers = 32
 * 
 * # CHECKPOINTS
 * checkpoint_completion_target = 0.9
 * checkpoint_timeout = 30min
 * max_wal_size = 32GB
 * min_wal_size = 2GB
 * 
 * # STATISTICS
 * default_statistics_target = 500
 * random_page_cost = 1.1              # For SSD
 * 
 * # LOGGING
 * log_min_duration_statement = 1000   # Log slow queries
 * log_checkpoints = on
 * log_connections = on
 * log_disconnections = on
 * log_lock_waits = on
 * log_temp_files = 0
 * 
 * # AUTOVACUUM
 * autovacuum_max_workers = 8
 * autovacuum_naptime = 10s
 */

export default PRODUCTION_DB_CONFIG;
