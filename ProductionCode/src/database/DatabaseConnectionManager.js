/**
 * 🗄️ ELITE DATABASE CONNECTION MANAGER - Single Source of Truth
 * ===============================================================
 * 
 * Centralized database connection management for the entire Construction Syndicate.
 * All systems MUST use this manager for database access.
 * 
 * Features:
 * - Single connection pool shared across all systems
 * - Connection retry with exponential backoff
 * - Circuit breaker for database failures
 * - Connection state monitoring
 * - Graceful degradation if DB unavailable
 * - Query timeout enforcement
 * - Automatic reconnection
 */

import pg from 'pg';
const { Pool } = pg;
import { EventEmitter } from 'events';

class DatabaseConnectionManager extends EventEmitter {
    constructor() {
        super();
        this.pool = null;
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 1000; // Start with 1 second
        this.maxRetryDelay = 30000; // Max 30 seconds
        this.circuitBreakerThreshold = 5;
        this.failureCount = 0;
        this.circuitOpen = false;
        this.lastConnectionAttempt = null;
        this.config = null;
        this.systems = new Set(); // Track registered systems
    }

    /**
     * 🚀 Initialize database connection with retry logic
     */
    async initialize(config = null) {
        console.log('🗄️ Initializing Database Connection Manager...');
        
        // Use provided config or get from environment
        if (!config) {
            const UnifiedDatabaseConfig = (await import('./UnifiedDatabaseConfig.js')).default;
            const dbConfig = new UnifiedDatabaseConfig();
            this.config = await dbConfig.getDatabaseConfig();
        } else {
            this.config = config;
        }

        // Add connection settings for production
        this.config = {
            ...this.config,
            max: 50,                    // Max connections
            idleTimeoutMillis: 30000,   // 30 seconds idle timeout
            connectionTimeoutMillis: 5000, // 5 seconds connection timeout
            query_timeout: 30000,        // 30 seconds query timeout
            statement_timeout: 30000,    // 30 seconds statement timeout
            keepAlive: true,
            keepAliveInitialDelayMillis: 10000
        };

        // Attempt connection with retry
        return await this.connectWithRetry();
    }

    /**
     * 🔄 Connect with exponential backoff retry
     */
    async connectWithRetry() {
        while (this.connectionAttempts < this.maxRetries) {
            try {
                this.connectionAttempts++;
                this.lastConnectionAttempt = new Date();
                
                console.log(`   🔄 Connection attempt ${this.connectionAttempts}/${this.maxRetries}...`);
                
                // Check circuit breaker
                if (this.circuitOpen) {
                    console.warn('   ⚡ Circuit breaker is OPEN - skipping connection attempt');
                    return null;
                }

                // Create new pool
                this.pool = new Pool(this.config);
                
                // Test connection
            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();
            
                // Success!
                this.isConnected = true;
                this.connectionAttempts = 0;
                this.failureCount = 0;
                this.circuitOpen = false;
                
                console.log('   ✅ Database connection established successfully!');
                this.emit('connected');
                
                // Setup error handlers
                this.setupPoolHandlers();
                
                return this.pool;
            
        } catch (error) {
                console.error(`   ❌ Connection attempt ${this.connectionAttempts} failed:`, error.message);
                
                // Increment failure count
                this.failureCount++;
                
                // Check if we should open circuit breaker
                if (this.failureCount >= this.circuitBreakerThreshold) {
                    this.openCircuitBreaker();
                }
                
                // If not last attempt, wait before retry
                if (this.connectionAttempts < this.maxRetries) {
                    const delay = Math.min(this.retryDelay * Math.pow(2, this.connectionAttempts - 1), this.maxRetryDelay);
                    console.log(`   ⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('   ❌ All connection attempts failed - using fallback mode');
                    this.emit('connectionFailed');
                    return null;
                }
            }
        }
        
        return null;
    }

    /**
     * ⚡ Open circuit breaker
     */
    openCircuitBreaker() {
        console.warn('   ⚡ CIRCUIT BREAKER OPENED - Database deemed unavailable');
        this.circuitOpen = true;
        
        // Schedule circuit breaker reset
        setTimeout(() => {
            console.log('   ⚡ Circuit breaker HALF-OPEN - allowing test connection');
            this.circuitOpen = false;
            this.failureCount = 0;
            this.attemptReconnection();
        }, 60000); // Try again after 1 minute
    }

    /**
     * 🔄 Attempt reconnection
     */
    async attemptReconnection() {
        if (this.isConnected) return;
        
        console.log('   🔄 Attempting database reconnection...');
        this.connectionAttempts = 0;
        await this.connectWithRetry();
    }

    /**
     * 📡 Setup pool event handlers
     */
    setupPoolHandlers() {
        if (!this.pool) return;
        
        this.pool.on('error', (err, client) => {
            console.error('   ❌ Database pool error:', err.message);
            this.emit('poolError', err);
            
            // Check if we lost connection
            if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
                this.isConnected = false;
                this.attemptReconnection();
            }
        });

        this.pool.on('connect', (client) => {
            console.log('   📡 New database client connected');
        });

        this.pool.on('acquire', (client) => {
            // Track active connections
        });

        this.pool.on('remove', (client) => {
            console.log('   📡 Database client removed from pool');
        });
    }

    /**
     * 📊 Get connection pool (with state check)
     */
    async getPool() {
        // If not initialized, try to initialize
        if (!this.pool && !this.circuitOpen) {
            await this.initialize();
        }
        
        // Return pool or null if unavailable
        return this.isConnected ? this.pool : null;
    }

    /**
     * 🔍 Check if database is available
     */
    isAvailable() {
        return this.isConnected && !this.circuitOpen;
    }

    /**
     * 📝 Register system using this manager
     */
    registerSystem(systemName) {
        this.systems.add(systemName);
        console.log(`   📝 System registered: ${systemName} (Total: ${this.systems.size})`);
    }

    /**
     * 📊 Get connection statistics
     */
    getStats() {
        if (!this.pool) {
            return {
                connected: false,
                circuitOpen: this.circuitOpen,
                failureCount: this.failureCount,
                registeredSystems: this.systems.size
            };
        }

            return {
            connected: this.isConnected,
            circuitOpen: this.circuitOpen,
            totalConnections: this.pool.totalCount,
            idleConnections: this.pool.idleCount,
            waitingClients: this.pool.waitingCount,
            failureCount: this.failureCount,
            registeredSystems: this.systems.size,
            lastAttempt: this.lastConnectionAttempt
        };
    }

    /**
     * 🛑 Graceful shutdown
     */
    async shutdown() {
        console.log('   🛑 Shutting down database connections...');
        
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
            this.isConnected = false;
        }
        
        this.emit('shutdown');
    }
}

// Export singleton instance
const dbConnectionManager = new DatabaseConnectionManager();
export default dbConnectionManager;
export { dbConnectionManager };