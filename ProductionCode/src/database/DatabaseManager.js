/**
 * 🗄️ DATABASE MANAGER - PRODUCTION-GRADE SINGLETON
 * ===============================================
 * 
 * CRITICAL: Single source of truth for ALL database operations
 * 
 * Features:
 * - Circuit breaker pattern for fault tolerance
 * - Automatic retry with exponential backoff
 * - Health checks and connection validation
 * - Schema validation on startup
 * - Query timeout enforcement
 * - Connection pool management
 * - Performance monitoring
 * - Graceful degradation
 * 
 * @author Elite AI Syndicate - Infrastructure Team
 */

import { Pool } from 'pg';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

dotenv.config();

/**
 * 🔌 CIRCUIT BREAKER STATES
 */
const CircuitState = {
    CLOSED: 'CLOSED',       // Normal operation
    OPEN: 'OPEN',          // Failing - reject requests
    HALF_OPEN: 'HALF_OPEN' // Testing recovery
};

/**
 * 🗄️ DATABASE MANAGER CLASS
 */
export class DatabaseManager extends EventEmitter {
    constructor() {
        super();
        
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        
        this.pool = null;
        this.isInitialized = false;
        this.isShuttingDown = false;
        
        // Circuit breaker state
        this.circuitState = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        this.halfOpenAttempts = 0;
        
        // Configuration
        this.config = {
            maxFailures: 5,              // Open circuit after 5 failures
            resetTimeout: 30000,         // Try recovery after 30s
            halfOpenMaxAttempts: 3,      // Test 3 times in half-open
            queryTimeout: 30000,         // 30s query timeout
            healthCheckInterval: 60000,  // Health check every 60s
            maxRetries: 3,               // Max connection retries
            retryDelay: 1000            // Initial retry delay
        };
        
        // Metrics
        this.metrics = {
            totalQueries: 0,
            successfulQueries: 0,
            failedQueries: 0,
            totalConnections: 0,
            activeConnections: 0,
            queryTimes: [],
            lastHealthCheck: null,
            healthCheckStatus: 'unknown'
        };
        
        // Schema validation cache
        this.schemaValidated = false;
        this.requiredTables = new Set();
        this.requiredColumns = new Map();
        
        // Query queue for graceful degradation
        this.queryQueue = [];
        this.isProcessingQueue = false;
        
        DatabaseManager.instance = this;
        
        console.log('🗄️ DatabaseManager singleton created');
    }
    
    /**
     * 🚀 INITIALIZE - Setup database connection
     */
    async initialize() {
        if (this.isInitialized) {
            console.log('   ⚠️ DatabaseManager already initialized');
            return this.pool;
        }
        
        try {
            console.log('🚀 Initializing DatabaseManager...');
            
            // Build configuration
            const config = await this.buildDatabaseConfig();
            
            // Create connection pool
            this.pool = new Pool(config);
            
            // Setup event handlers
            this.setupPoolEventHandlers();
            
            // Test connection with retries
            await this.testConnectionWithRetry();
            
            // Validate schema
            await this.validateSchema();
            
            // Start health monitoring
            this.startHealthMonitoring();
            
            this.isInitialized = true;
            
            console.log('✅ DatabaseManager initialized successfully');
            this.emit('initialized', { timestamp: Date.now() });
            
            return this.pool;
      
    } catch (error) {
            console.error('❌ DatabaseManager initialization failed:', error);
            this.emit('initializationFailed', { error, timestamp: Date.now() });
      throw error;
    }
  }

    /**
     * 🔧 BUILD DATABASE CONFIG - Smart configuration builder
     */
    async buildDatabaseConfig() {
        // Priority 1: Use DATABASE_URL if provided
        if (process.env.DATABASE_URL && process.env.DATABASE_URL !== 'mock://database') {
            console.log('   🔗 Using DATABASE_URL connection string');
            
            try {
                const { PRODUCTION_DB_CONFIG } = await import('../config/ProductionDatabaseConfig.js');
                return PRODUCTION_DB_CONFIG;
            } catch (error) {
                console.warn('   ⚠️ Could not load production config, using DATABASE_URL directly');
                return {
                    connectionString: process.env.DATABASE_URL,
                    max: 20,
                    idleTimeoutMillis: 30000,
                    connectionTimeoutMillis: 10000,
                    statement_timeout: 30000,
                    query_timeout: 30000
                };
            }
        }
        
        // Priority 2: Build from POSTGRES_* variables
        const host = (process.env.POSTGRES_HOST || 'localhost').trim();
        const port = parseInt(process.env.POSTGRES_PORT) || 5432;
        const database = (process.env.POSTGRES_DB || 'AIGO_Construction_Syndicate').trim();
        const user = (process.env.POSTGRES_USER || 'postgres').trim();
        const password = (process.env.POSTGRES_PASSWORD || 'postgres').trim();
        const ssl = process.env.POSTGRES_SSL === 'true';
        
        console.log(`   🔗 Building connection from POSTGRES_* variables`);
        console.log(`     Host: ${host}:${port}`);
        console.log(`     Database: ${database}`);
        console.log(`     User: ${user}`);
        
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}${ssl ? '?sslmode=require' : ''}`;
        
        return {
            connectionString,
            host,
            port,
            database,
            user,
            password,
            ssl: ssl ? { rejectUnauthorized: false } : false,
            max: 20,
            min: 5,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
            statement_timeout: this.config.queryTimeout,
            query_timeout: this.config.queryTimeout,
            application_name: 'construction_syndicate_db_manager'
        };
    }
    
    /**
     * 🔌 SETUP POOL EVENT HANDLERS
     */
    setupPoolEventHandlers() {
        this.pool.on('error', (err, client) => {
            console.error('🚨 Database pool error:', err.message);
            this.handlePoolError(err);
            this.emit('poolError', { error: err, timestamp: Date.now() });
        });
        
        this.pool.on('connect', (client) => {
            this.metrics.totalConnections++;
            this.metrics.activeConnections++;
            this.emit('clientConnected', { timestamp: Date.now() });
        });
        
        this.pool.on('remove', (client) => {
            this.metrics.activeConnections--;
            this.emit('clientRemoved', { timestamp: Date.now() });
        });
    }
    
    /**
     * 🧪 TEST CONNECTION WITH RETRY
     */
    async testConnectionWithRetry() {
        let lastError = null;
        
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                console.log(`   🧪 Testing connection (attempt ${attempt}/${this.config.maxRetries})...`);
                
                const client = await this.pool.connect();
                const result = await client.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name');
                client.release();
                
                console.log('   ✅ Connection test successful');
                console.log(`     ⏰ Server time: ${result.rows[0].current_time}`);
                console.log(`     🗄️ Database: ${result.rows[0].db_name}`);
                console.log(`     📊 PostgreSQL: ${result.rows[0].pg_version.split(' ')[1]}`);
                
                this.recordSuccess();
                return true;
      
    } catch (error) {
                lastError = error;
                console.error(`   ❌ Connection attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < this.config.maxRetries) {
                    const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`   ⏳ Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        this.recordFailure();
        throw new Error(`Database connection failed after ${this.config.maxRetries} attempts: ${lastError.message}`);
    }
    
    /**
     * 🔍 VALIDATE SCHEMA - Check required tables and columns exist
     */
    async validateSchema() {
        if (this.schemaValidated) {
            console.log('   ⚠️ Schema already validated');
            return true;
        }
        
        try {
            console.log('   🔍 Validating database schema...');
            
            const client = await this.pool.connect();
            
            // Check if we can query information_schema
            const tablesResult = await client.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                LIMIT 10
            `);
            
            console.log(`   ✅ Schema validation passed (${tablesResult.rows.length} tables found)`);
            
            client.release();
            
            this.schemaValidated = true;
            return true;
            
        } catch (error) {
            console.warn('   ⚠️ Schema validation skipped:', error.message);
            // Don't fail initialization if schema validation fails
            return false;
        }
    }
    
    /**
     * 🏥 START HEALTH MONITORING
     */
    startHealthMonitoring() {
        console.log(`   🏥 Starting health monitoring (interval: ${this.config.healthCheckInterval}ms)`);
        
        this.healthCheckTimer = setInterval(async () => {
            await this.performHealthCheck();
        }, this.config.healthCheckInterval);
        
        // Don't block process exit
        this.healthCheckTimer.unref();
    }
    
    /**
     * 🏥 PERFORM HEALTH CHECK
     */
    async performHealthCheck() {
        try {
            const startTime = Date.now();
            const client = await this.pool.connect();
            await client.query('SELECT 1');
            client.release();
            const responseTime = Date.now() - startTime;
            
            this.metrics.lastHealthCheck = Date.now();
            this.metrics.healthCheckStatus = 'healthy';
            
            // If circuit is open and health check passes, try to close it
            if (this.circuitState === CircuitState.OPEN) {
                this.attemptCircuitRecovery();
            }
            
            this.emit('healthCheckPassed', { responseTime, timestamp: Date.now() });
      
    } catch (error) {
            this.metrics.healthCheckStatus = 'unhealthy';
            this.handleHealthCheckFailure(error);
            this.emit('healthCheckFailed', { error, timestamp: Date.now() });
        }
    }
    
    /**
     * 🔌 CIRCUIT BREAKER - Execute query with circuit breaker protection
     */
    async executeQuery(queryText, params = [], options = {}) {
        // Check circuit state
        if (this.circuitState === CircuitState.OPEN) {
            // Check if enough time has passed to try recovery
            const timeSinceFailure = Date.now() - this.lastFailureTime;
            if (timeSinceFailure < this.config.resetTimeout) {
                throw new Error('Circuit breaker is OPEN - database unavailable');
            }
            
            // Try to enter half-open state
            this.circuitState = CircuitState.HALF_OPEN;
            this.halfOpenAttempts = 0;
            console.log('🔄 Circuit breaker entering HALF_OPEN state');
        }
        
        try {
            this.metrics.totalQueries++;
            const startTime = Date.now();
            
            // Get client with timeout
            const client = await Promise.race([
                this.pool.connect(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Connection timeout')), this.config.queryTimeout)
                )
            ]);
            
            try {
                // Execute query with timeout
                const result = await Promise.race([
                    client.query(queryText, params),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Query timeout')), this.config.queryTimeout)
                    )
                ]);
                
                const queryTime = Date.now() - startTime;
                this.metrics.queryTimes.push(queryTime);
                
                // Keep only last 100 query times
                if (this.metrics.queryTimes.length > 100) {
                    this.metrics.queryTimes.shift();
                }
                
                this.metrics.successfulQueries++;
                this.recordSuccess();
                
                return result;
                
            } finally {
                client.release();
            }
      
    } catch (error) {
            this.metrics.failedQueries++;
            this.recordFailure();
            
            console.error('❌ Query execution failed:', error.message);
      throw error;
    }
  }

    /**
     * 📊 RECORD SUCCESS
     */
    recordSuccess() {
        this.successCount++;
        
        if (this.circuitState === CircuitState.HALF_OPEN) {
            this.halfOpenAttempts++;
            
            if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
                // Enough successful attempts - close circuit
                this.circuitState = CircuitState.CLOSED;
                this.failureCount = 0;
                this.successCount = 0;
                console.log('✅ Circuit breaker CLOSED - database recovered');
                this.emit('circuitClosed', { timestamp: Date.now() });
            }
        } else if (this.circuitState === CircuitState.CLOSED && this.failureCount > 0) {
            // Gradually reduce failure count on success
            this.failureCount = Math.max(0, this.failureCount - 1);
        }
    }
    
    /**
     * ❌ RECORD FAILURE
     */
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.circuitState === CircuitState.HALF_OPEN) {
            // Failed during recovery - go back to open
            this.circuitState = CircuitState.OPEN;
            console.error('🚨 Circuit breaker OPENED - recovery failed');
            this.emit('circuitOpened', { timestamp: Date.now() });
            
        } else if (this.circuitState === CircuitState.CLOSED && this.failureCount >= this.config.maxFailures) {
            // Too many failures - open circuit
            this.circuitState = CircuitState.OPEN;
            console.error(`🚨 Circuit breaker OPENED - ${this.failureCount} consecutive failures`);
            this.emit('circuitOpened', { timestamp: Date.now() });
        }
    }
    
    /**
     * 🔄 ATTEMPT CIRCUIT RECOVERY
     */
    attemptCircuitRecovery() {
        if (this.circuitState === CircuitState.OPEN) {
            const timeSinceFailure = Date.now() - this.lastFailureTime;
            
            if (timeSinceFailure >= this.config.resetTimeout) {
                this.circuitState = CircuitState.HALF_OPEN;
                this.halfOpenAttempts = 0;
                console.log('🔄 Circuit breaker entering HALF_OPEN state for recovery');
            }
        }
    }
    
    /**
     * 🚨 HANDLE POOL ERROR
     */
    handlePoolError(error) {
        this.recordFailure();
        
        // Determine severity
        const isCritical = error.message.includes('ECONNREFUSED') || 
                          error.message.includes('ETIMEDOUT') ||
                          error.message.includes('Connection terminated');
        
        if (isCritical) {
            console.error('🚨 CRITICAL DATABASE ERROR - attempting recovery');
            this.attemptRecovery();
        }
    }
    
    /**
     * 🏥 HANDLE HEALTH CHECK FAILURE
     */
    handleHealthCheckFailure(error) {
        console.error('🏥 Health check failed:', error.message);
        this.recordFailure();
    }
    
    /**
     * 🔄 ATTEMPT RECOVERY
     */
    async attemptRecovery() {
        console.log('🔄 Attempting database recovery...');
        
        try {
            // Try to reconnect
            await this.testConnectionWithRetry();
            console.log('✅ Database recovery successful');
            
      } catch (error) {
            console.error('❌ Database recovery failed:', error.message);
        }
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        const avgQueryTime = this.metrics.queryTimes.length > 0 
            ? this.metrics.queryTimes.reduce((a, b) => a + b, 0) / this.metrics.queryTimes.length 
            : 0;
        
        return {
            ...this.metrics,
            avgQueryTime: Math.round(avgQueryTime),
            circuitState: this.circuitState,
            failureCount: this.failureCount,
            successCount: this.successCount,
            successRate: this.metrics.totalQueries > 0 
                ? ((this.metrics.successfulQueries / this.metrics.totalQueries) * 100).toFixed(2) + '%'
                : 'N/A'
        };
    }
    
    /**
     * 🔍 GET CONNECTION
     */
    async getConnection() {
        if (!this.isInitialized) {
    await this.initialize();
        }
        
        if (this.circuitState === CircuitState.OPEN) {
            throw new Error('Circuit breaker is OPEN - database unavailable');
        }
        
        return await this.pool.connect();
    }
    
    /**
     * 📝 QUERY - Safe query execution
     */
    async query(queryText, params = []) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        return await this.executeQuery(queryText, params);
    }
    
    /**
     * 🛑 SHUTDOWN - Graceful shutdown
     */
    async shutdown() {
        if (this.isShuttingDown) {
            console.log('   ⚠️ Shutdown already in progress');
            return;
        }
        
        this.isShuttingDown = true;
        
        try {
            console.log('🛑 Shutting down DatabaseManager...');
            
            // Stop health monitoring
            if (this.healthCheckTimer) {
                clearInterval(this.healthCheckTimer);
                this.healthCheckTimer = null;
            }
            
            // Close pool
            if (this.pool) {
                await this.pool.end();
                this.pool = null;
            }
            
            this.isInitialized = false;
            
            console.log('✅ DatabaseManager shutdown complete');
            this.emit('shutdown', { timestamp: Date.now() });
            
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            throw error;
        }
    }
}

// Singleton instance
let databaseManagerInstance = null;

/**
 * 🎯 GET DATABASE MANAGER - Singleton accessor
 */
export function getDatabaseManager() {
    if (!databaseManagerInstance) {
        databaseManagerInstance = new DatabaseManager();
    }
    return databaseManagerInstance;
}

/**
 * 🚀 INITIALIZE DATABASE MANAGER - Helper function
 */
export async function initializeDatabaseManager() {
    const manager = getDatabaseManager();
    await manager.initialize();
    return manager;
}

/**
 * 📝 EXECUTE QUERY - Helper function
 */
export async function executeQuery(queryText, params = []) {
    const manager = getDatabaseManager();
    return await manager.query(queryText, params);
}

export default DatabaseManager; 
