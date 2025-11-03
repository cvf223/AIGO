/**
 * 🗄️ DATABASE CONNECTOR
 * ===================
 * 
 * Provides database connectivity for the arbitrage system
 * 
 * ✅ Multiple database support (PostgreSQL, MongoDB)
 * ✅ Connection pooling and optimization
 * ✅ Caching layer
 * ✅ Query optimization
 * ✅ Error handling and retry logic
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import pkg from 'pg';
const { Pool } = pkg;
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';
import { EventEmitter } from 'events';

// Database configuration
const config = {
  postgres: {
    enabled: true,
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'construction_syndicate',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.POSTGRES_SSL === 'true',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
    maxUses: 7500 // Close and replace a connection after it has been used this many times
  },
  mongodb: {
    enabled: true,
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DB || 'arbitrage_system',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 50,
      minPoolSize: 5,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    }
  },
  redis: {
    enabled: process.env.CACHE_STORE === 'redis',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'arb:',
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true
  },
  cache: {
    defaultTTL: parseInt(process.env.CACHE_TTL_SECONDS || '300'),
    longTTL: parseInt(process.env.CACHE_TTL_LONG_SECONDS || '3600'),
    aggressiveCaching: process.env.ENABLE_AGGRESSIVE_CACHING === 'true'
  }
};

class DatabaseConnector extends EventEmitter {
  constructor() {
    super();
    
    // Initialize connection pools
    this.pgPool = null;
    this.mongoClient = null;
    this.mongoDb = null;
    this.redisClient = null;
    
    // Initialize cache
    this.cache = new Map();
    
    // Initialize stats
    this.stats = {
      postgres: {
        queries: 0,
        errors: 0,
        lastError: null,
        lastQuery: null,
        avgQueryTime: 0
      },
      mongodb: {
        queries: 0,
        errors: 0,
        lastError: null,
        lastQuery: null,
        avgQueryTime: 0
      },
      redis: {
        operations: 0,
        hits: 0,
        misses: 0,
        errors: 0,
        lastError: null
      },
      memoryCache: {
        hits: 0,
        misses: 0,
        size: 0
      }
    };
    
    console.log('🗄️ Database Connector initialized');
  }
  
  /**
   * Initialize database connections
   */
  async initialize() {
    try {
      console.log('Initializing database connections...');
      
      // Initialize PostgreSQL connection pool
      if (config.postgres.enabled) {
        await this._initializePostgres();
      }
      
      // Initialize MongoDB connection
      if (config.mongodb.enabled) {
        await this._initializeMongoDB();
      }
      
      // Initialize Redis connection
      if (config.redis.enabled) {
        await this._initializeRedis();
      }
      
      console.log('✅ Database connections initialized');
      
      // Start health check interval
      this._startHealthChecks();
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize database connections:', error);
      return false;
    }
  }
  
  /**
   * Initialize PostgreSQL connection pool
   */
  async _initializePostgres() {
    try {
      console.log('Initializing PostgreSQL connection pool...');
      
      // Create connection pool
      this.pgPool = new Pool({
        host: config.postgres.host,
        port: config.postgres.port,
        database: config.postgres.database,
        user: config.postgres.user,
        password: config.postgres.password,
        ssl: config.postgres.ssl ? { rejectUnauthorized: false } : false,
        max: config.postgres.max,
        idleTimeoutMillis: config.postgres.idleTimeoutMillis,
        connectionTimeoutMillis: config.postgres.connectionTimeoutMillis
      });
      
      // Test connection
      const client = await this.pgPool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      
      console.log(`✅ PostgreSQL connected: ${config.postgres.host}:${config.postgres.port}/${config.postgres.database} (${result.rows[0].now})`);
      
      // Set up error handler
      this.pgPool.on('error', (err) => {
        console.error('❌ PostgreSQL pool error:', err);
        this.stats.postgres.errors++;
        this.stats.postgres.lastError = {
          message: err.message,
          timestamp: Date.now()
        };
        
        // Emit error event
        this.emit('postgresError', err);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL connection:', error);
      this.stats.postgres.errors++;
      this.stats.postgres.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
      
      // Emit error event
      this.emit('postgresError', error);
      
      return false;
    }
  }
  
  /**
   * Initialize MongoDB connection
   */
  async _initializeMongoDB() {
    try {
      console.log('Initializing MongoDB connection...');
      
      // Create MongoDB client
      this.mongoClient = new MongoClient(config.mongodb.uri, config.mongodb.options);
      
      // Connect to MongoDB
      await this.mongoClient.connect();
      
      // Get database
      this.mongoDb = this.mongoClient.db(config.mongodb.database);
      
      // Test connection
      const result = await this.mongoDb.command({ ping: 1 });
      
      console.log(`✅ MongoDB connected: ${config.mongodb.uri}/${config.mongodb.database}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize MongoDB connection:', error);
      this.stats.mongodb.errors++;
      this.stats.mongodb.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
      
      // Emit error event
      this.emit('mongodbError', error);
      
      return false;
    }
  }
  
  /**
   * Initialize Redis connection
   */
  async _initializeRedis() {
    try {
      console.log('Initializing Redis connection...');
      
      // Create Redis client
      this.redisClient = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password || undefined,
        db: config.redis.db,
        keyPrefix: config.redis.keyPrefix,
        maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        enableReadyCheck: config.redis.enableReadyCheck,
        enableOfflineQueue: config.redis.enableOfflineQueue
      });
      
      // Test connection
      await this.redisClient.ping();
      
      console.log(`✅ Redis connected: ${config.redis.host}:${config.redis.port}`);
      
      // Set up error handler
      this.redisClient.on('error', (err) => {
        console.error('❌ Redis error:', err);
        this.stats.redis.errors++;
        this.stats.redis.lastError = {
          message: err.message,
          timestamp: Date.now()
        };
        
        // Emit error event
        this.emit('redisError', err);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Redis connection:', error);
      this.stats.redis.errors++;
      this.stats.redis.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
      
      // Emit error event
      this.emit('redisError', error);
      
      return false;
    }
  }
  
  /**
   * Start health checks
   */
  _startHealthChecks() {
    // Check database health every 5 minutes
    setInterval(async () => {
      try {
        // Check PostgreSQL health
        if (this.pgPool) {
          try {
            const client = await this.pgPool.connect();
            await client.query('SELECT 1');
            client.release();
          } catch (error) {
            console.error('❌ PostgreSQL health check failed:', error);
            
            // Try to reconnect
            await this._initializePostgres();
          }
        }
        
        // Check MongoDB health
        if (this.mongoClient) {
          try {
            await this.mongoDb.command({ ping: 1 });
          } catch (error) {
            console.error('❌ MongoDB health check failed:', error);
            
            // Try to reconnect
            await this._initializeMongoDB();
          }
        }
        
        // Check Redis health
        if (this.redisClient) {
          try {
            await this.redisClient.ping();
          } catch (error) {
            console.error('❌ Redis health check failed:', error);
            
            // Try to reconnect
            await this._initializeRedis();
          }
        }
      } catch (error) {
        console.error('❌ Health check error:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  /**
   * Execute PostgreSQL query
   * @param {string} text - SQL query text
   * @param {Array} params - Query parameters
   * @param {object} options - Query options
   * @returns {Promise<object>} Query result
   */
  async query(text, params = [], options = {}) {
    // Track query start time
    const startTime = Date.now();
    
    // Update stats
    this.stats.postgres.queries++;
    this.stats.postgres.lastQuery = {
      text,
      timestamp: startTime
    };
    
    try {
      // Check cache if enabled
      if (options.useCache) {
        const cacheKey = `pg:${text}:${JSON.stringify(params)}`;
        const cachedResult = await this._getFromCache(cacheKey);
        
        if (cachedResult) {
          return cachedResult;
        }
      }
      
      // Execute query
      const result = await this.pgPool.query(text, params);
      
      // Update query time stats
      const queryTime = Date.now() - startTime;
      this.stats.postgres.avgQueryTime = (this.stats.postgres.avgQueryTime * (this.stats.postgres.queries - 1) + queryTime) / this.stats.postgres.queries;
      
      // Cache result if enabled
      if (options.useCache) {
        const cacheKey = `pg:${text}:${JSON.stringify(params)}`;
        const ttl = options.cacheTTL || config.cache.defaultTTL;
        await this._setCache(cacheKey, result, ttl);
      }
      
      return result;
    } catch (error) {
      // Update error stats
      this.stats.postgres.errors++;
      this.stats.postgres.lastError = {
        message: error.message,
        query: text,
        timestamp: Date.now()
      };
      
      // Log error
      console.error('❌ PostgreSQL query error:', error);
      
      // Emit error event
      this.emit('queryError', {
        error,
        query: text,
        params
      });
      
      throw error;
    }
  }
  
  /**
   * Execute PostgreSQL transaction
   * @param {Function} callback - Transaction callback
   * @returns {Promise<any>} Transaction result
   */
  async transaction(callback) {
    const client = await this.pgPool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Execute callback
      const result = await callback(client);
      
      // Commit transaction
      await client.query('COMMIT');
      
      return result;
    } catch (error) {
      // Rollback transaction
      await client.query('ROLLBACK');
      
      // Update error stats
      this.stats.postgres.errors++;
      this.stats.postgres.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
      
      // Log error
      console.error('❌ PostgreSQL transaction error:', error);
      
      // Emit error event
      this.emit('transactionError', error);
      
      throw error;
    } finally {
      // Release client
      client.release();
    }
  }
  
  /**
   * Get MongoDB collection
   * @param {string} collectionName - Collection name
   * @returns {object} MongoDB collection
   */
  getCollection(collectionName) {
    return this.mongoDb.collection(collectionName);
  }
  
  /**
   * Execute MongoDB operation
   * @param {string} collectionName - Collection name
   * @param {string} operation - Operation name
   * @param {object} query - Query object
   * @param {object} options - Operation options
   * @returns {Promise<any>} Operation result
   */
  async mongoOperation(collectionName, operation, query, options = {}) {
    // Track operation start time
    const startTime = Date.now();
    
    // Update stats
    this.stats.mongodb.queries++;
    this.stats.mongodb.lastQuery = {
      collection: collectionName,
      operation,
      timestamp: startTime
    };
    
    try {
      // Check cache if enabled
      if (options.useCache) {
        const cacheKey = `mongo:${collectionName}:${operation}:${JSON.stringify(query)}`;
        const cachedResult = await this._getFromCache(cacheKey);
        
        if (cachedResult) {
          return cachedResult;
        }
      }
      
      // Get collection
      const collection = this.getCollection(collectionName);
      
      // Execute operation
      let result;
      
      switch (operation) {
        case 'find':
          result = await collection.find(query, options.findOptions || {}).toArray();
          break;
        case 'findOne':
          result = await collection.findOne(query, options.findOptions || {});
          break;
        case 'insertOne':
          result = await collection.insertOne(query);
          break;
        case 'insertMany':
          result = await collection.insertMany(query);
          break;
        case 'updateOne':
          result = await collection.updateOne(query.filter, query.update, options.updateOptions || {});
          break;
        case 'updateMany':
          result = await collection.updateMany(query.filter, query.update, options.updateOptions || {});
          break;
        case 'deleteOne':
          result = await collection.deleteOne(query);
          break;
        case 'deleteMany':
          result = await collection.deleteMany(query);
          break;
        case 'aggregate':
          result = await collection.aggregate(query).toArray();
          break;
        case 'count':
          result = await collection.countDocuments(query);
          break;
        default:
          throw new Error(`Unsupported MongoDB operation: ${operation}`);
      }
      
      // Update query time stats
      const queryTime = Date.now() - startTime;
      this.stats.mongodb.avgQueryTime = (this.stats.mongodb.avgQueryTime * (this.stats.mongodb.queries - 1) + queryTime) / this.stats.mongodb.queries;
      
      // Cache result if enabled and operation is read-only
      if (options.useCache && ['find', 'findOne', 'aggregate', 'count'].includes(operation)) {
        const cacheKey = `mongo:${collectionName}:${operation}:${JSON.stringify(query)}`;
        const ttl = options.cacheTTL || config.cache.defaultTTL;
        await this._setCache(cacheKey, result, ttl);
      }
      
      return result;
    } catch (error) {
      // Update error stats
      this.stats.mongodb.errors++;
      this.stats.mongodb.lastError = {
        message: error.message,
        collection: collectionName,
        operation,
        timestamp: Date.now()
      };
      
      // Log error
      console.error('❌ MongoDB operation error:', error);
      
      // Emit error event
      this.emit('mongodbOperationError', {
        error,
        collection: collectionName,
        operation,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Execute MongoDB transaction
   * @param {Function} callback - Transaction callback
   * @returns {Promise<any>} Transaction result
   */
  async mongoTransaction(callback) {
    const session = this.mongoClient.startSession();
    
    try {
      // Start transaction
      session.startTransaction();
      
      // Execute callback
      const result = await callback(session);
      
      // Commit transaction
      await session.commitTransaction();
      
      return result;
    } catch (error) {
      // Abort transaction
      await session.abortTransaction();
      
      // Update error stats
      this.stats.mongodb.errors++;
      this.stats.mongodb.lastError = {
        message: error.message,
        timestamp: Date.now()
      };
      
      // Log error
      console.error('❌ MongoDB transaction error:', error);
      
      // Emit error event
      this.emit('mongodbTransactionError', error);
      
      throw error;
    } finally {
      // End session
      session.endSession();
    }
  }
  
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value or null
   */
  async _getFromCache(key) {
    try {
      // Try Redis cache first
      if (this.redisClient) {
        this.stats.redis.operations++;
        
        const cachedValue = await this.redisClient.get(key);
        
        if (cachedValue) {
          // Update stats
          this.stats.redis.hits++;
          
          // Parse JSON value
          return JSON.parse(cachedValue);
        }
        
        // Update stats
        this.stats.redis.misses++;
      }
      
      // Try memory cache
      if (this.cache.has(key)) {
        const cachedItem = this.cache.get(key);
        
        // Check if cached item is expired
        if (cachedItem.expiresAt > Date.now()) {
          // Update stats
          this.stats.memoryCache.hits++;
          
          return cachedItem.value;
        }
        
        // Remove expired item
        this.cache.delete(key);
      }
      
      // Update stats
      this.stats.memoryCache.misses++;
      
      return null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      
      // Update error stats
      if (this.redisClient) {
        this.stats.redis.errors++;
        this.stats.redis.lastError = {
          message: error.message,
          timestamp: Date.now()
        };
      }
      
      // Emit error event
      this.emit('cacheError', error);
      
      // Return null on cache error
      return null;
    }
  }
  
  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success
   */
  async _setCache(key, value, ttl = config.cache.defaultTTL) {
    try {
      // Set in Redis cache
      if (this.redisClient) {
        this.stats.redis.operations++;
        
        await this.redisClient.set(
          key,
          JSON.stringify(value),
          'EX',
          ttl
        );
      }
      
      // Set in memory cache
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + (ttl * 1000)
      });
      
      // Update stats
      this.stats.memoryCache.size = this.cache.size;
      
      return true;
    } catch (error) {
      console.error('❌ Cache set error:', error);
      
      // Update error stats
      if (this.redisClient) {
        this.stats.redis.errors++;
        this.stats.redis.lastError = {
          message: error.message,
          timestamp: Date.now()
        };
      }
      
      // Emit error event
      this.emit('cacheError', error);
      
      return false;
    }
  }
  
  /**
   * Clear cache
   * @param {string} pattern - Key pattern to clear
   * @returns {Promise<boolean>} Success
   */
  async clearCache(pattern = '*') {
    try {
      // Clear Redis cache
      if (this.redisClient) {
        this.stats.redis.operations++;
        
        if (pattern === '*') {
          await this.redisClient.flushdb();
        } else {
          const keys = await this.redisClient.keys(pattern);
          
          if (keys.length > 0) {
            await this.redisClient.del(...keys);
          }
        }
      }
      
      // Clear memory cache
      if (pattern === '*') {
        this.cache.clear();
      } else {
        // Convert pattern to regex
        const regexPattern = new RegExp(pattern.replace(/\*/g, '.*'));
        
        // Delete matching keys
        for (const key of this.cache.keys()) {
          if (regexPattern.test(key)) {
            this.cache.delete(key);
          }
        }
      }
      
      // Update stats
      this.stats.memoryCache.size = this.cache.size;
      
      return true;
    } catch (error) {
      console.error('❌ Cache clear error:', error);
      
      // Update error stats
      if (this.redisClient) {
        this.stats.redis.errors++;
        this.stats.redis.lastError = {
          message: error.message,
          timestamp: Date.now()
        };
      }
      
      // Emit error event
      this.emit('cacheError', error);
      
      return false;
    }
  }
  
  /**
   * Get database stats
   * @returns {object} Database stats
   */
  getStats() {
    return {
      postgres: this.stats.postgres,
      mongodb: this.stats.mongodb,
      redis: this.stats.redis,
      memoryCache: this.stats.memoryCache,
      timestamp: Date.now()
    };
  }
  
  /**
   * Close database connections
   */
  async close() {
    try {
      console.log('Closing database connections...');
      
      // Close PostgreSQL connection pool
      if (this.pgPool) {
        await this.pgPool.end();
        console.log('✅ PostgreSQL connection pool closed');
      }
      
      // Close MongoDB connection
      if (this.mongoClient) {
        await this.mongoClient.close();
        console.log('✅ MongoDB connection closed');
      }
      
      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
        console.log('✅ Redis connection closed');
      }
      
      console.log('✅ All database connections closed');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to close database connections:', error);
      return false;
    }
  }
}

// Singleton instance
const databaseConnector = new DatabaseConnector();

export { DatabaseConnector, databaseConnector };
export default databaseConnector; 