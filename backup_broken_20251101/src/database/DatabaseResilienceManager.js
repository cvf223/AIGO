/**
 * 🛡️ DATABASE RESILIENCE MANAGER
 * ==============================
 * 
 * Provides robust database connection handling with fallbacks,
 * retry mechanisms, and in-memory alternatives when database
 * connections fail.
 */

import { EventEmitter } from 'events';

export class DatabaseResilienceManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelayMs: config.retryDelayMs || 1000,
      connectionTimeoutMs: config.connectionTimeoutMs || 5000,
      enableInMemoryFallback: config.enableInMemoryFallback !== false,
      poolSize: config.poolSize || 5,
      healthCheckIntervalMs: config.healthCheckIntervalMs || 30000,
      ...config
    };
    
    // Core state
    this.dbPool = null;
    this.dbConnected = false;
    this.connectionRetries = 0;
    this.lastConnectionAttempt = null;
    
    // In-memory database fallback
    this.inMemoryStore = new Map();
    this.inMemoryTables = new Map();
    
    // Connection health state
    this.healthCheckInterval = null;
    this.connectionErrors = [];
    
    this._initializeInMemoryTables();
  }
  
  /**
   * Initialize the database connection with retry capability
   */
  async initialize(databaseManager) {
    if (!databaseManager) {
      console.warn('⚠️ No database manager provided - operating in memory-only mode');
      return false;
    }
    
    try {
      this.dbManager = databaseManager;
      await this._initializeConnection();
      
      // Start health checks if connection succeeded
      if (this.dbConnected) {
        this._startHealthChecks();
      }
      
      return this.dbConnected;
    } catch (error) {
      console.error(`❌ Database initialization failed: ${error.message}`);
      this._fallbackToInMemory();
      return false;
    }
  }
  
  /**
   * Safe database query with fallback to in-memory when needed
   */
  async query(sql, params = [], options = {}) {
    // Try database first if connected
    if (this.dbConnected && this.dbPool) {
      try {
        const startTime = Date.now();
        const result = await this._executeQueryWithRetry(sql, params, options);
        const duration = Date.now() - startTime;
        
        // Performance tracking
        if (duration > 1000) {
          console.warn(`⚠️ Slow database query detected (${duration}ms): ${sql.substring(0, 100)}...`);
        }
        
        return result;
      } catch (error) {
        // Log error and switch to fallback
        console.error(`❌ Database query failed: ${error.message}`);
        console.log(`💡 Attempting in-memory fallback for query...`);
        
        // Check if we should fallback or rethrow
        if (!this.config.enableInMemoryFallback) {
          throw error;
        }
        
        // Track error for health monitoring
        this._trackConnectionError(error);
      }
    }
    
    // Fallback to in-memory store if DB unavailable or query failed
    return this._executeInMemoryQuery(sql, params, options);
  }
  
  /**
   * Execute a query with retry logic
   */
  async _executeQueryWithRetry(sql, params = [], options = {}) {
    const maxRetries = options.maxRetries || this.config.maxRetries;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await this.dbPool.query(sql, params);
      } catch (error) {
        attempt++;
        
        // Check if we should retry
        if (this._isRetryableError(error) && attempt < maxRetries) {
          console.warn(`⚠️ Database error, retrying (${attempt}/${maxRetries}): ${error.message}`);
          await this._sleep(this.config.retryDelayMs * attempt);
        } else {
          throw error;
        }
      }
    }
  }
  
  /**
   * Execute in-memory version of the query
   */
  async _executeInMemoryQuery(sql, params = [], options = {}) {
    console.log(`📝 Using in-memory database fallback for query: ${sql.substring(0, 100)}...`);
    
    // Simple SQL parser to determine operation type
    const operation = this._parseSqlOperation(sql);
    
    // Handle different operation types
    switch (operation.type) {
      case 'SELECT':
        return this._handleInMemorySelect(operation, params);
      case 'INSERT':
        return this._handleInMemoryInsert(operation, params);
      case 'UPDATE':
        return this._handleInMemoryUpdate(operation, params);
      case 'DELETE':
        return this._handleInMemoryDelete(operation, params);
      case 'WITH':
      case 'COMPLEX':
      default:
        // Return empty result set for complex queries
        console.warn(`⚠️ Complex query not supported in memory fallback: ${operation.type}`);
        return {
          rows: [],
          rowCount: 0,
          command: operation.type,
          oid: null
        };
    }
  }
  
  /**
   * Initialize internal connection
   */
  async _initializeConnection() {
    if (!this.dbManager) {
      console.warn('⚠️ No database manager available');
      this._fallbackToInMemory();
      return false;
    }
    
    try {
      this.lastConnectionAttempt = Date.now();
      
      // Get connection from manager
      this.dbPool = await this.dbManager.getPool();
      
      // Test connection with simple query
      await this.dbPool.query('SELECT 1 AS connection_test');
      
      this.dbConnected = true;
      this.connectionRetries = 0;
      console.log('✅ Database connection established successfully');
      
      // Emit connected event
      this.emit('connected', { timestamp: Date.now() });
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed: ${error.message}`);
      
      // Increment retry counter
      this.connectionRetries++;
      
      // Fall back to in-memory mode
      this._fallbackToInMemory();
      
      // Emit error event
      this.emit('connection_error', { error, retries: this.connectionRetries });
      
      return false;
    }
  }
  
  /**
   * Initialize in-memory fallback tables
   */
  _initializeInMemoryTables() {
    // Define common table structures
    const tables = [
      {
        name: 'kg_nodes',
        columns: ['node_id', 'node_type', 'properties', 'created_at', 'updated_at']
      },
      {
        name: 'kg_relationships',
        columns: ['relationship_id', 'source_node_id', 'target_node_id', 'relationship_type', 'confidence_score']
      },
      {
        name: 'kg_entanglements',
        columns: ['entanglement_id', 'node_a_id', 'node_b_id', 'entanglement_strength', 'calculation_method']
      },
      {
        name: 'trajectory_nodes',
        columns: ['trajectory_id', 'node_id', 'position', 'metadata']
      },
      {
        name: 'agent_action_history',
        columns: ['agent_id', 'action_id', 'trajectory_id', 'action_type', 'action_data', 'timestamp', 'reward']
      }
    ];
    
    // Initialize empty tables
    tables.forEach(table => {
      this.inMemoryTables.set(table.name, {
        schema: table.columns,
        data: []
      });
    });
    
    console.log(`📦 Initialized in-memory tables (${tables.length} tables)`);
  }
  
  /**
   * Fallback to in-memory operation mode
   */
  _fallbackToInMemory() {
    if (this.config.enableInMemoryFallback) {
      console.warn('⚠️ Database unavailable - using in-memory storage fallback');
      this.dbConnected = false;
      this.emit('fallback_activated', { timestamp: Date.now() });
    } else {
      console.error('❌ Database unavailable and in-memory fallback disabled');
      this.emit('database_unavailable', { timestamp: Date.now() });
    }
  }
  
  /**
   * Start periodic health checks
   */
  _startHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      this._performHealthCheck();
    }, this.config.healthCheckIntervalMs);
    
    console.log(`🩺 Database health checks activated (interval: ${this.config.healthCheckIntervalMs}ms)`);
  }
  
  /**
   * Perform database health check
   */
  async _performHealthCheck() {
    if (!this.dbPool) return;
    
    try {
      const startTime = Date.now();
      const result = await this.dbPool.query('SELECT 1 AS health_check');
      const duration = Date.now() - startTime;
      
      // Check response time
      if (duration > 1000) {
        console.warn(`⚠️ Database health check slow response: ${duration}ms`);
        this.emit('slow_response', { duration });
      }
      
      this.emit('health_check_success', { duration });
      
      // If we were in fallback mode but DB is now responding, switch back
      if (!this.dbConnected) {
        console.log('✅ Database connection restored - switching from fallback mode');
        this.dbConnected = true;
        this.emit('connection_restored', { timestamp: Date.now() });
      }
    } catch (error) {
      console.error(`❌ Database health check failed: ${error.message}`);
      
      if (this.dbConnected) {
        console.warn('⚠️ Database connection lost - activating fallback mode');
        this.dbConnected = false;
        this._fallbackToInMemory();
      }
      
      this.emit('health_check_failed', { error });
      
      // Try to re-establish connection
      this._initializeConnection();
    }
  }
  
  /**
   * Track connection errors for health monitoring
   */
  _trackConnectionError(error) {
    const errorInfo = {
      message: error.message,
      code: error.code,
      timestamp: Date.now()
    };
    
    this.connectionErrors.push(errorInfo);
    
    // Keep only recent errors
    if (this.connectionErrors.length > 100) {
      this.connectionErrors.shift();
    }
    
    // Check error frequency
    const recentErrors = this.connectionErrors.filter(
      err => (Date.now() - err.timestamp) < 60000
    );
    
    if (recentErrors.length > 5) {
      console.warn(`⚠️ High database error rate detected: ${recentErrors.length} errors in last minute`);
      this.emit('high_error_rate', { count: recentErrors.length });
    }
  }
  
  /**
   * Check if an error is retryable
   */
  _isRetryableError(error) {
    // Connection-related errors are usually retryable
    const retryableCodes = [
      'ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT',
      '08006', '08001', '08004', '57P01' // PostgreSQL error codes
    ];
    
    return retryableCodes.includes(error.code) || 
           error.message.includes('connection') ||
           error.message.includes('timeout');
  }
  
  /**
   * Helper to parse SQL operation type
   */
  _parseSqlOperation(sql) {
    const trimmedSql = sql.trim().toUpperCase();
    
    if (trimmedSql.startsWith('SELECT')) {
      return { type: 'SELECT', table: this._extractTableName(sql) };
    } else if (trimmedSql.startsWith('INSERT')) {
      return { type: 'INSERT', table: this._extractTableName(sql) };
    } else if (trimmedSql.startsWith('UPDATE')) {
      return { type: 'UPDATE', table: this._extractTableName(sql) };
    } else if (trimmedSql.startsWith('DELETE')) {
      return { type: 'DELETE', table: this._extractTableName(sql) };
    } else if (trimmedSql.startsWith('WITH')) {
      return { type: 'WITH', table: null };
    } else {
      return { type: 'COMPLEX', table: null };
    }
  }
  
  /**
   * Extract table name from SQL
   */
  _extractTableName(sql) {
    // Very basic extraction - this would need to be more sophisticated in a real implementation
    const fromMatch = sql.match(/FROM\s+([^\s,;]+)/i);
    const intoMatch = sql.match(/INTO\s+([^\s,;(]+)/i);
    const updateMatch = sql.match(/UPDATE\s+([^\s,;]+)/i);
    
    if (fromMatch) return fromMatch[1];
    if (intoMatch) return intoMatch[1];
    if (updateMatch) return updateMatch[1];
    
    return null;
  }
  
  /**
   * Handle in-memory SELECT query
   */
  _handleInMemorySelect(operation, params) {
    const tableName = operation.table;
    const table = this.inMemoryTables.get(tableName);
    
    if (!table) {
      return { rows: [], rowCount: 0 };
    }
    
    // Very simplified implementation - in reality you'd need actual SQL parsing
    return {
      rows: table.data,
      rowCount: table.data.length,
      command: 'SELECT',
      oid: null
    };
  }
  
  /**
   * Handle in-memory INSERT operation
   */
  _handleInMemoryInsert(operation, params) {
    const tableName = operation.table;
    const table = this.inMemoryTables.get(tableName);
    
    if (!table) {
      this.inMemoryTables.set(tableName, { 
        schema: [], 
        data: [params.reduce((obj, val, idx) => ({ ...obj, [`param${idx}`]: val }), {})]
      });
      return { rowCount: 1, command: 'INSERT', oid: null };
    }
    
    // Add new row using params (simplified)
    const newRow = params.reduce((obj, val, idx) => ({ ...obj, [`param${idx}`]: val }), {});
    table.data.push(newRow);
    
    return { rowCount: 1, command: 'INSERT', oid: null };
  }
  
  /**
   * Handle in-memory UPDATE operation
   */
  _handleInMemoryUpdate(operation, params) {
    // Simplified implementation
    return { rowCount: 1, command: 'UPDATE', oid: null };
  }
  
  /**
   * Handle in-memory DELETE operation
   */
  _handleInMemoryDelete(operation, params) {
    // Simplified implementation
    return { rowCount: 0, command: 'DELETE', oid: null };
  }
  
  /**
   * Helper sleep function
   */
  async _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get database stats
   */
  getStats() {
    return {
      connected: this.dbConnected,
      connectionRetries: this.connectionRetries,
      lastConnectionAttempt: this.lastConnectionAttempt,
      inMemoryTableCount: this.inMemoryTables.size,
      inMemoryRowCount: Array.from(this.inMemoryTables.values())
        .reduce((sum, table) => sum + (table.data ? table.data.length : 0), 0),
      errorRate: this.connectionErrors.filter(err => Date.now() - err.timestamp < 60000).length
    };
  }
}

// Export singleton instance for global use
export const databaseResilienceManager = new DatabaseResilienceManager();
