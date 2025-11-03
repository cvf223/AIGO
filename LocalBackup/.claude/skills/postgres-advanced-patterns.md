# PostgreSQL Advanced Patterns Implementation

## Overview

This skill provides production-ready PostgreSQL optimization patterns for the AIGO-Syndicate construction intelligence system. It includes connection pooling, query optimization, partitioning strategies, and comprehensive monitoring.

## Core Implementation

### Database Pool Manager

```javascript
// postgres-advanced-patterns.js
import pg from 'pg';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import crypto from 'crypto';

export class PostgresAdvancedManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Connection pool settings
            max: config.max || 200,
            min: config.min || 20,
            idleTimeoutMillis: config.idleTimeoutMillis || 300000,
            connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
            
            // Query optimization
            statementTimeout: config.statementTimeout || 60000,
            queryTimeout: config.queryTimeout || 30000,
            preparedStatements: config.preparedStatements !== false,
            
            // Monitoring
            enableMetrics: config.enableMetrics !== false,
            slowQueryThreshold: config.slowQueryThreshold || 1000,
            
            // Partitioning
            partitionStrategy: config.partitionStrategy || 'monthly',
            retentionPeriod: config.retentionPeriod || 365, // days
            
            ...config
        };
        
        this.pools = new Map(); // Multiple pools for read/write splitting
        this.queryCache = new Map();
        this.preparedStatements = new Map();
        this.metrics = {
            queries: new Map(),
            connections: { active: 0, idle: 0, total: 0 },
            errors: []
        };
    }
    
    async initialize() {
        try {
            // Create primary pool
            await this.createPrimaryPool();
            
            // Create read replica pools
            await this.createReplicaPools();
            
            // Set up monitoring
            this.startMonitoring();
            
            // Initialize partitioning
            await this.initializePartitioning();
            
            // Create indexes
            await this.optimizeIndexes();
            
            this.emit('initialized');
            console.log('PostgreSQL Advanced Manager initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async createPrimaryPool() {
        const poolConfig = {
            connectionString: process.env.DATABASE_URL,
            max: this.config.max * 0.6, // 60% for writes
            min: this.config.min,
            idleTimeoutMillis: this.config.idleTimeoutMillis,
            connectionTimeoutMillis: this.config.connectionTimeoutMillis,
            statement_timeout: this.config.statementTimeout,
            application_name: 'aigo_syndicate_primary'
        };
        
        const pool = new pg.Pool(poolConfig);
        
        // Set up event handlers
        pool.on('error', (err) => this.handlePoolError('primary', err));
        pool.on('connect', () => this.updateConnectionMetrics());
        pool.on('remove', () => this.updateConnectionMetrics());
        
        // Test connection
        const client = await pool.connect();
        try {
            await client.query('SELECT 1');
            
            // Set optimal configurations
            await this.optimizeConnection(client);
            
        } finally {
            client.release();
        }
        
        this.pools.set('primary', pool);
    }
    
    async createReplicaPools() {
        const replicaUrls = process.env.DATABASE_REPLICA_URLS?.split(',') || [];
        
        for (let i = 0; i < replicaUrls.length; i++) {
            const pool = new pg.Pool({
                connectionString: replicaUrls[i],
                max: this.config.max * 0.4 / replicaUrls.length,
                min: Math.floor(this.config.min / 2),
                idleTimeoutMillis: this.config.idleTimeoutMillis,
                application_name: `aigo_syndicate_replica_${i}`
            });
            
            pool.on('error', (err) => this.handlePoolError(`replica_${i}`, err));
            
            this.pools.set(`replica_${i}`, pool);
        }
    }
    
    async optimizeConnection(client) {
        // Set performance parameters
        await client.query(`
            SET work_mem = '256MB';
            SET maintenance_work_mem = '1GB';
            SET effective_cache_size = '4GB';
            SET random_page_cost = 1.1;
            SET effective_io_concurrency = 200;
            SET max_parallel_workers_per_gather = 4;
        `);
    }
    
    // Query Optimization
    
    async query(text, params, options = {}) {
        const startTime = performance.now();
        const queryId = this.generateQueryId(text, params);
        
        try {
            // Check cache for read queries
            if (options.cache && this.isReadQuery(text)) {
                const cached = this.queryCache.get(queryId);
                if (cached && Date.now() - cached.timestamp < options.cacheTTL) {
                    this.recordMetric(queryId, 0, true);
                    return cached.result;
                }
            }
            
            // Choose appropriate pool
            const pool = this.selectPool(text, options);
            
            // Use prepared statement if enabled
            let result;
            if (this.config.preparedStatements && !options.skipPrepare) {
                result = await this.executePrepared(pool, text, params);
            } else {
                result = await pool.query(text, params);
            }
            
            // Cache if applicable
            if (options.cache && this.isReadQuery(text)) {
                this.queryCache.set(queryId, {
                    result,
                    timestamp: Date.now()
                });
            }
            
            const duration = performance.now() - startTime;
            this.recordMetric(queryId, duration, false);
            
            // Log slow queries
            if (duration > this.config.slowQueryThreshold) {
                this.logSlowQuery(text, params, duration);
            }
            
            return result;
            
        } catch (error) {
            this.handleQueryError(text, params, error);
            throw error;
        }
    }
    
    async executePrepared(pool, text, params) {
        const name = this.getPreparedStatementName(text);
        
        if (!this.preparedStatements.has(name)) {
            // Create prepared statement
            const client = await pool.connect();
            try {
                await client.query({
                    text: `PREPARE ${name} AS ${text}`,
                    values: []
                });
                this.preparedStatements.set(name, text);
            } finally {
                client.release();
            }
        }
        
        // Execute prepared statement
        return pool.query(`EXECUTE ${name}(${params.map((_, i) => `$${i + 1}`).join(', ')})`, params);
    }
    
    selectPool(query, options) {
        // Force primary for writes or if specified
        if (options.primary || !this.isReadQuery(query)) {
            return this.pools.get('primary');
        }
        
        // Load balance across replicas
        const replicas = Array.from(this.pools.entries())
            .filter(([name]) => name.startsWith('replica_'));
            
        if (replicas.length === 0) {
            return this.pools.get('primary');
        }
        
        // Random selection (can be enhanced with health checks)
        const [, pool] = replicas[Math.floor(Math.random() * replicas.length)];
        return pool;
    }
    
    isReadQuery(query) {
        const trimmed = query.trim().toLowerCase();
        return trimmed.startsWith('select') || 
               trimmed.startsWith('with');
    }
    
    // Index Optimization
    
    async optimizeIndexes() {
        const client = await this.pools.get('primary').connect();
        try {
            // Analyze missing indexes
            const missingIndexes = await this.findMissingIndexes(client);
            
            // Create beneficial indexes
            for (const index of missingIndexes) {
                if (index.benefit > 1000) { // Significant benefit threshold
                    await this.createIndex(client, index);
                }
            }
            
            // Remove unused indexes
            await this.removeUnusedIndexes(client);
            
            // Update statistics
            await client.query('ANALYZE');
            
        } finally {
            client.release();
        }
    }
    
    async findMissingIndexes(client) {
        const result = await client.query(`
            SELECT 
                schemaname,
                tablename,
                attname,
                n_distinct,
                most_common_vals,
                correlation
            FROM pg_stats
            WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
            AND n_distinct > 100
            AND correlation < 0.1
            ORDER BY n_distinct DESC
        `);
        
        const indexes = [];
        
        for (const row of result.rows) {
            // Calculate potential benefit
            const benefit = this.calculateIndexBenefit(row);
            
            if (benefit > 0) {
                indexes.push({
                    schema: row.schemaname,
                    table: row.tablename,
                    column: row.attname,
                    benefit
                });
            }
        }
        
        return indexes;
    }
    
    calculateIndexBenefit(stats) {
        // Simplified benefit calculation
        const selectivity = 1 / (stats.n_distinct || 1);
        const correlation = Math.abs(stats.correlation || 0);
        
        return (1 - selectivity) * (1 - correlation) * 10000;
    }
    
    async createIndex(client, indexInfo) {
        const indexName = `idx_${indexInfo.table}_${indexInfo.column}`;
        
        console.log(`Creating index: ${indexName}`);
        
        await client.query(`
            CREATE INDEX CONCURRENTLY IF NOT EXISTS ${indexName}
            ON ${indexInfo.schema}.${indexInfo.table} (${indexInfo.column})
        `);
    }
    
    async removeUnusedIndexes(client) {
        const result = await client.query(`
            SELECT 
                schemaname,
                tablename,
                indexname,
                idx_scan,
                idx_tup_read,
                idx_tup_fetch,
                pg_size_pretty(pg_relation_size(indexrelid)) as size
            FROM pg_stat_user_indexes
            WHERE idx_scan = 0
            AND indexrelname NOT LIKE 'pg_%'
            AND pg_relation_size(indexrelid) > 1048576 -- 1MB
            AND NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conindid = indexrelid
            )
        `);
        
        for (const index of result.rows) {
            console.log(`Removing unused index: ${index.indexname}`);
            
            await client.query(`
                DROP INDEX CONCURRENTLY IF EXISTS 
                ${index.schemaname}.${index.indexname}
            `);
        }
    }
    
    // Partitioning
    
    async initializePartitioning() {
        const tables = [
            'construction_metrics',
            'agent_activations',
            'quantum_measurements',
            'task_distributions'
        ];
        
        for (const table of tables) {
            await this.setupTablePartitioning(table);
        }
        
        // Schedule partition maintenance
        this.schedulePartitionMaintenance();
    }
    
    async setupTablePartitioning(tableName) {
        const client = await this.pools.get('primary').connect();
        try {
            // Check if table exists
            const exists = await this.tableExists(client, tableName);
            if (!exists) return;
            
            // Convert to partitioned table if not already
            const isPartitioned = await this.isTablePartitioned(client, tableName);
            
            if (!isPartitioned) {
                await this.convertToPartitioned(client, tableName);
            }
            
            // Create future partitions
            await this.createFuturePartitions(client, tableName);
            
            // Drop old partitions
            await this.dropOldPartitions(client, tableName);
            
        } finally {
            client.release();
        }
    }
    
    async convertToPartitioned(client, tableName) {
        console.log(`Converting ${tableName} to partitioned table`);
        
        // This is complex and should be done carefully
        // Simplified example for monthly partitioning by created_at
        
        await client.query('BEGIN');
        try {
            // Rename original table
            await client.query(`
                ALTER TABLE ${tableName} RENAME TO ${tableName}_old
            `);
            
            // Create new partitioned table
            await client.query(`
                CREATE TABLE ${tableName} (LIKE ${tableName}_old INCLUDING ALL)
                PARTITION BY RANGE (created_at)
            `);
            
            // Create initial partitions
            const startDate = new Date();
            startDate.setMonth(startDate.getMonth() - 6);
            
            for (let i = 0; i < 12; i++) {
                const partitionStart = new Date(startDate);
                partitionStart.setMonth(partitionStart.getMonth() + i);
                
                const partitionEnd = new Date(partitionStart);
                partitionEnd.setMonth(partitionEnd.getMonth() + 1);
                
                await this.createPartition(
                    client,
                    tableName,
                    partitionStart,
                    partitionEnd
                );
            }
            
            // Copy data
            await client.query(`
                INSERT INTO ${tableName} SELECT * FROM ${tableName}_old
            `);
            
            // Drop old table
            await client.query(`DROP TABLE ${tableName}_old`);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }
    
    async createPartition(client, tableName, startDate, endDate) {
        const partitionName = `${tableName}_${startDate.toISOString().slice(0, 7).replace('-', '_')}`;
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS ${partitionName}
            PARTITION OF ${tableName}
            FOR VALUES FROM ('${startDate.toISOString()}') 
            TO ('${endDate.toISOString()}')
        `);
        
        // Create indexes on partition
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_${partitionName}_created_at
            ON ${partitionName} (created_at)
        `);
    }
    
    async createFuturePartitions(client, tableName) {
        const currentDate = new Date();
        
        for (let i = 0; i < 3; i++) {
            const partitionStart = new Date(currentDate);
            partitionStart.setMonth(partitionStart.getMonth() + i);
            partitionStart.setDate(1);
            partitionStart.setHours(0, 0, 0, 0);
            
            const partitionEnd = new Date(partitionStart);
            partitionEnd.setMonth(partitionEnd.getMonth() + 1);
            
            await this.createPartition(client, tableName, partitionStart, partitionEnd);
        }
    }
    
    async dropOldPartitions(client, tableName) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);
        
        const result = await client.query(`
            SELECT 
                schemaname,
                tablename
            FROM pg_tables
            WHERE tablename LIKE $1
            AND tablename < $2
        `, [
            `${tableName}_%`,
            `${tableName}_${cutoffDate.toISOString().slice(0, 7).replace('-', '_')}`
        ]);
        
        for (const partition of result.rows) {
            console.log(`Dropping old partition: ${partition.tablename}`);
            await client.query(`
                DROP TABLE IF EXISTS ${partition.schemaname}.${partition.tablename}
            `);
        }
    }
    
    schedulePartitionMaintenance() {
        // Run daily
        setInterval(async () => {
            try {
                await this.initializePartitioning();
            } catch (error) {
                this.handleError('partition_maintenance', error);
            }
        }, 24 * 60 * 60 * 1000);
    }
    
    // Connection Pool Management
    
    async transaction(callback, options = {}) {
        const client = await this.pools.get('primary').connect();
        
        try {
            await client.query('BEGIN');
            
            if (options.isolationLevel) {
                await client.query(
                    `SET TRANSACTION ISOLATION LEVEL ${options.isolationLevel}`
                );
            }
            
            const result = await callback(client);
            
            await client.query('COMMIT');
            return result;
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async withConnection(callback, options = {}) {
        const pool = this.selectPool('SELECT 1', options);
        const client = await pool.connect();
        
        try {
            return await callback(client);
        } finally {
            client.release();
        }
    }
    
    // Backup and Recovery
    
    async createBackup(tables = null) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}`;
        
        console.log(`Creating backup: ${backupName}`);
        
        const client = await this.pools.get('primary').connect();
        try {
            // Get tables to backup
            const tablesToBackup = tables || await this.getAllTables(client);
            
            for (const table of tablesToBackup) {
                await client.query(`
                    CREATE TABLE ${table}_${backupName} AS 
                    SELECT * FROM ${table}
                `);
            }
            
            return {
                backupName,
                tables: tablesToBackup,
                timestamp
            };
            
        } finally {
            client.release();
        }
    }
    
    async restoreBackup(backupName, tables = null) {
        console.log(`Restoring backup: ${backupName}`);
        
        const client = await this.pools.get('primary').connect();
        try {
            await client.query('BEGIN');
            
            const tablesToRestore = tables || await this.getBackupTables(client, backupName);
            
            for (const table of tablesToRestore) {
                // Truncate current table
                await client.query(`TRUNCATE TABLE ${table} CASCADE`);
                
                // Restore from backup
                await client.query(`
                    INSERT INTO ${table} 
                    SELECT * FROM ${table}_${backupName}
                `);
            }
            
            await client.query('COMMIT');
            
            return {
                restored: tablesToRestore,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Monitoring
    
    startMonitoring() {
        // Monitor connection pool health
        setInterval(() => {
            this.updateConnectionMetrics();
            this.checkPoolHealth();
        }, 5000);
        
        // Monitor query performance
        setInterval(() => {
            this.analyzeQueryPerformance();
        }, 60000);
        
        // Clear old cache entries
        setInterval(() => {
            this.cleanupCache();
        }, 300000);
    }
    
    updateConnectionMetrics() {
        let totalActive = 0;
        let totalIdle = 0;
        
        for (const [name, pool] of this.pools) {
            totalActive += pool.totalCount - pool.idleCount;
            totalIdle += pool.idleCount;
        }
        
        this.metrics.connections = {
            active: totalActive,
            idle: totalIdle,
            total: totalActive + totalIdle
        };
        
        this.emit('metrics', {
            type: 'connections',
            data: this.metrics.connections
        });
    }
    
    async checkPoolHealth() {
        for (const [name, pool] of this.pools) {
            try {
                const client = await pool.connect();
                await client.query('SELECT 1');
                client.release();
            } catch (error) {
                console.error(`Pool ${name} health check failed:`, error);
                this.emit('pool_unhealthy', { pool: name, error });
            }
        }
    }
    
    async analyzeQueryPerformance() {
        const client = await this.pools.get('primary').connect();
        try {
            // Get slow queries
            const slowQueries = await client.query(`
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    stddev_time,
                    rows
                FROM pg_stat_statements
                WHERE mean_time > $1
                ORDER BY mean_time DESC
                LIMIT 20
            `, [this.config.slowQueryThreshold]);
            
            for (const query of slowQueries.rows) {
                this.emit('slow_query_detected', {
                    query: query.query,
                    meanTime: query.mean_time,
                    calls: query.calls
                });
            }
            
        } catch (error) {
            // pg_stat_statements might not be available
            console.log('Query performance analysis not available');
        } finally {
            client.release();
        }
    }
    
    // Utility Methods
    
    generateQueryId(text, params) {
        const hash = crypto.createHash('sha256');
        hash.update(text);
        hash.update(JSON.stringify(params || []));
        return hash.digest('hex').substring(0, 16);
    }
    
    getPreparedStatementName(text) {
        return 'ps_' + this.generateQueryId(text, []);
    }
    
    async tableExists(client, tableName) {
        const result = await client.query(`
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_name = $1
            )
        `, [tableName]);
        
        return result.rows[0].exists;
    }
    
    async isTablePartitioned(client, tableName) {
        const result = await client.query(`
            SELECT COUNT(*) > 0 as is_partitioned
            FROM pg_partitioned_table
            WHERE partrelid = $1::regclass
        `, [tableName]);
        
        return result.rows[0].is_partitioned;
    }
    
    async getAllTables(client) {
        const result = await client.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
            AND tablename NOT LIKE '%_backup_%'
        `);
        
        return result.rows.map(row => row.tablename);
    }
    
    cleanupCache() {
        const now = Date.now();
        const maxAge = 300000; // 5 minutes
        
        for (const [key, value] of this.queryCache.entries()) {
            if (now - value.timestamp > maxAge) {
                this.queryCache.delete(key);
            }
        }
    }
    
    recordMetric(queryId, duration, cacheHit) {
        if (!this.config.enableMetrics) return;
        
        if (!this.metrics.queries.has(queryId)) {
            this.metrics.queries.set(queryId, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                cacheHits: 0
            });
        }
        
        const metric = this.metrics.queries.get(queryId);
        metric.count++;
        metric.totalTime += duration;
        metric.avgTime = metric.totalTime / metric.count;
        
        if (cacheHit) {
            metric.cacheHits++;
        }
    }
    
    logSlowQuery(text, params, duration) {
        const logEntry = {
            query: text,
            params,
            duration,
            timestamp: new Date().toISOString()
        };
        
        console.warn('Slow query detected:', logEntry);
        this.emit('slow_query', logEntry);
    }
    
    handleError(context, error) {
        console.error(`PostgreSQL error in ${context}:`, error);
        
        this.metrics.errors.push({
            context,
            error: error.message,
            timestamp: new Date().toISOString()
        });
        
        // Keep only recent errors
        if (this.metrics.errors.length > 100) {
            this.metrics.errors.shift();
        }
        
        this.emit('error', { context, error });
    }
    
    handlePoolError(poolName, error) {
        console.error(`Pool ${poolName} error:`, error);
        this.emit('pool_error', { pool: poolName, error });
    }
    
    handleQueryError(query, params, error) {
        const errorInfo = {
            query,
            params,
            error: error.message,
            code: error.code,
            timestamp: new Date().toISOString()
        };
        
        console.error('Query error:', errorInfo);
        this.emit('query_error', errorInfo);
    }
    
    async shutdown() {
        console.log('Shutting down PostgreSQL manager');
        
        // Close all pools
        for (const [name, pool] of this.pools) {
            await pool.end();
        }
        
        // Clear caches
        this.queryCache.clear();
        this.preparedStatements.clear();
        
        this.emit('shutdown');
    }
}

// Export singleton instance
let instance;

export function getPostgresManager(config) {
    if (!instance) {
        instance = new PostgresAdvancedManager(config);
    }
    return instance;
}

// Migration utilities
export class PostgresMigration {
    constructor(manager) {
        this.manager = manager;
    }
    
    async runMigrations() {
        const client = await this.manager.pools.get('primary').connect();
        try {
            // Create migrations table
            await this.createMigrationsTable(client);
            
            // Get pending migrations
            const pending = await this.getPendingMigrations(client);
            
            // Run each migration
            for (const migration of pending) {
                await this.runMigration(client, migration);
            }
            
        } finally {
            client.release();
        }
    }
    
    async createMigrationsTable(client) {
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                version VARCHAR(255) PRIMARY KEY,
                executed_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
    }
    
    async getPendingMigrations(client) {
        // This would load migration files from disk
        // and check against executed migrations
        return [];
    }
    
    async runMigration(client, migration) {
        await client.query('BEGIN');
        try {
            await migration.up(client);
            
            await client.query(`
                INSERT INTO schema_migrations (version) VALUES ($1)
            `, [migration.version]);
            
            await client.query('COMMIT');
            console.log(`Migration ${migration.version} completed`);
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
    }
}
```

### Usage Example

```javascript
// postgres-usage.js
import { getPostgresManager } from './postgres-advanced-patterns.js';

async function main() {
    const db = getPostgresManager({
        max: 200,
        min: 20,
        slowQueryThreshold: 1000
    });
    
    try {
        await db.initialize();
        
        // Simple query with caching
        const result = await db.query(
            'SELECT * FROM projects WHERE status = $1',
            ['active'],
            { cache: true, cacheTTL: 60000 }
        );
        
        // Transaction example
        await db.transaction(async (client) => {
            await client.query('INSERT INTO tasks (name) VALUES ($1)', ['Task 1']);
            await client.query('INSERT INTO tasks (name) VALUES ($1)', ['Task 2']);
        });
        
        // Monitoring
        db.on('slow_query', (data) => {
            console.log('Slow query detected:', data);
        });
        
        db.on('metrics', (data) => {
            console.log('Database metrics:', data);
        });
        
    } catch (error) {
        console.error('Database error:', error);
    }
}

main();
```

### Construction Integration

```javascript
// construction-postgres-integration.js
import { getPostgresManager } from './postgres-advanced-patterns.js';

export class ConstructionDatabaseService {
    constructor() {
        this.db = getPostgresManager({
            max: 200,
            slowQueryThreshold: 500,
            partitionStrategy: 'monthly'
        });
    }
    
    async initialize() {
        await this.db.initialize();
        await this.createConstructionSchema();
        await this.optimizeConstructionQueries();
    }
    
    async createConstructionSchema() {
        await this.db.transaction(async (client) => {
            // Projects table with optimal structure
            await client.query(`
                CREATE TABLE IF NOT EXISTS projects (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_number VARCHAR(50) UNIQUE NOT NULL,
                    name VARCHAR(200) NOT NULL,
                    client_id UUID NOT NULL,
                    construction_cost DECIMAL(15,2),
                    status VARCHAR(50) NOT NULL,
                    hoai_zone INTEGER CHECK (hoai_zone BETWEEN 1 AND 5),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                ) PARTITION BY RANGE (created_at);
                
                CREATE INDEX idx_projects_status ON projects (status);
                CREATE INDEX idx_projects_client ON projects (client_id);
                CREATE INDEX idx_projects_metadata ON projects USING GIN(metadata);
            `);
            
            // Construction metrics with time-series optimization
            await client.query(`
                CREATE TABLE IF NOT EXISTS construction_metrics (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    project_id UUID NOT NULL,
                    metric_type VARCHAR(50) NOT NULL,
                    value DECIMAL(15,2) NOT NULL,
                    unit VARCHAR(20),
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                ) PARTITION BY RANGE (timestamp);
                
                CREATE INDEX idx_metrics_project_time 
                ON construction_metrics (project_id, timestamp DESC);
            `);
        });
    }
    
    async optimizeConstructionQueries() {
        // Create materialized view for dashboards
        await this.db.query(`
            CREATE MATERIALIZED VIEW IF NOT EXISTS project_dashboard AS
            SELECT 
                p.id,
                p.name,
                p.status,
                COUNT(DISTINCT m.metric_type) as metric_count,
                MAX(m.timestamp) as last_update,
                jsonb_build_object(
                    'cost_variance', 
                    COALESCE(AVG(CASE WHEN m.metric_type = 'cost_variance' 
                                     THEN m.value END), 0),
                    'schedule_variance',
                    COALESCE(AVG(CASE WHEN m.metric_type = 'schedule_variance' 
                                     THEN m.value END), 0)
                ) as kpis
            FROM projects p
            LEFT JOIN construction_metrics m ON p.id = m.project_id
            WHERE p.status = 'active'
            GROUP BY p.id, p.name, p.status;
            
            CREATE INDEX idx_dashboard_project ON project_dashboard (id);
        `);
        
        // Refresh materialized view periodically
        setInterval(async () => {
            await this.db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY project_dashboard');
        }, 300000); // Every 5 minutes
    }
    
    async getProjectMetrics(projectId, timeRange = '7 days') {
        return this.db.query(`
            WITH time_buckets AS (
                SELECT 
                    time_bucket('1 hour', timestamp) as bucket,
                    metric_type,
                    AVG(value) as avg_value,
                    MAX(value) as max_value,
                    MIN(value) as min_value
                FROM construction_metrics
                WHERE project_id = $1
                AND timestamp > NOW() - INTERVAL $2
                GROUP BY bucket, metric_type
            )
            SELECT * FROM time_buckets
            ORDER BY bucket DESC
        `, [projectId, timeRange], { cache: true, cacheTTL: 60000 });
    }
}
```

## Testing

```javascript
// postgres-patterns.test.js
import { describe, test, expect, beforeAll } from '@jest/globals';
import { getPostgresManager } from './postgres-advanced-patterns.js';

describe('PostgresAdvancedManager', () => {
    let db;
    
    beforeAll(async () => {
        db = getPostgresManager({ enableMetrics: true });
        await db.initialize();
    });
    
    test('should execute queries with caching', async () => {
        const query = 'SELECT 1 as value';
        
        // First query - not cached
        const result1 = await db.query(query, [], { cache: true });
        expect(result1.rows[0].value).toBe(1);
        
        // Second query - should be cached
        const result2 = await db.query(query, [], { cache: true });
        expect(result2).toBe(result1); // Same object reference
    });
    
    test('should handle transactions', async () => {
        await expect(
            db.transaction(async (client) => {
                await client.query('SELECT 1');
                throw new Error('Test error');
            })
        ).rejects.toThrow('Test error');
    });
    
    test('should use read replicas for SELECT queries', async () => {
        const spy = jest.spyOn(db, 'selectPool');
        
        await db.query('SELECT * FROM test', []);
        expect(spy).toHaveBeenCalledWith(expect.stringContaining('SELECT'), {});
        
        await db.query('INSERT INTO test VALUES (1)', []);
        expect(spy).toHaveReturnedWith(db.pools.get('primary'));
    });
});
```

This implementation provides comprehensive PostgreSQL optimization patterns including connection pooling, query optimization, partitioning, monitoring, and backup strategies for the construction syndicate system.
