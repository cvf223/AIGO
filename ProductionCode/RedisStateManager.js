/**
 * RedisStateManager.js
 * 
 * Manages tiered memory state persistence using Redis for the Legendary Arbitrage Syndicate.
 * Implements different memory tiers with varying levels of protection and autosave functionality.
 */

import Redis from 'ioredis';
import { promisify } from 'util';
import zlib from 'zlib';
import { EventEmitter } from 'events';

// Compression helpers
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Memory tier definitions
const MemoryTier = {
  CRITICAL: 'TIER_1', // Critical historical knowledge - highest protection
  IMPORTANT: 'TIER_2', // Recent discoveries - medium protection
  CURRENT: 'TIER_3'  // Current task state - lowest protection
};

class RedisStateManager extends EventEmitter {
  /**
   * Create a new RedisStateManager
   * @param {object} options - Configuration options
   * @param {object} options.redisClient - Redis client instance
   * @param {object} options.logger - Logger instance
   * @param {object} options.metrics - Metrics recording service
   * @param {object} options.config - Configuration object
   */
  constructor({
    redisClient = null,
    logger = console,
    metrics = null,
    config = {}
  } = {}) {
    super();
    
    // Store dependencies
    this.redis = redisClient;
    this.logger = logger;
    this.externalMetrics = metrics;
    
    // Configuration with defaults
    this.config = {
      keyPrefix: 'legendary-arbitrage:memory:',
      autoPromotionInterval: 600000, // 10 minutes
      criticalPromotionInterval: 3600000, // 1 hour
      connectionTimeout: 5000, // 5 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      ...config
    };
    
    // Initialize state
    this.isConnected = false;
    this.connectionError = null;
    this.promotionTimers = new Map();
    this.memoryOperationInProgress = false;
    this.memoryOperationTier = null;
    this.memoryOperationStartTime = null;
    this.onForcePreempt = null;
    this.activeMemoryOperations = new Map();
    
    // Initialize metrics
    this.metrics = {
      totalMemoryOperations: 0,
      successfulMemoryOperations: 0,
      failedMemoryOperations: 0,
      interruptedMemoryOperations: 0,
      totalMemoryOperationTime: 0,
      tier1MemoriesProtected: 0,
      tier2MemoriesProtected: 0,
      tier3MemoriesSacrificed: 0,
      promotions: {
        [MemoryTier.CURRENT]: 0,
        [MemoryTier.IMPORTANT]: 0,
        [MemoryTier.CRITICAL]: 0
      },
      autosaves: {
        [MemoryTier.CURRENT]: 0,
        [MemoryTier.IMPORTANT]: 0,
        [MemoryTier.CRITICAL]: 0
      }
    };
    
    // Bind methods
    this._handleRedisError = this._handleRedisError.bind(this);
    this._handleRedisConnect = this._handleRedisConnect.bind(this);
    this._handleRedisEnd = this._handleRedisEnd.bind(this);
    
    this.logger.log('🧠 RedisStateManager initialized');
  }
  
  /**
   * Set up Redis client event handlers
   * @private
   */
  _setupRedisHandlers() {
    this.redis.on('connect', () => {
      this.isConnected = true;
      this.logger.log('📡 Connected to Redis');
      this.emit('connected');
    });
    
    this.redis.on('error', (error) => {
      this.logger.error('❌ Redis error:', error);
      this.emit('error', error);
    });
    
    this.redis.on('close', () => {
      this.isConnected = false;
      this.logger.log('🔌 Disconnected from Redis');
      this.emit('disconnected');
    });
  }
  
  /**
   * Set up automatic memory tier promotion
   * @private
   */
  _setupAutoPromotion() {
    // Set up timer for Tier 3 -> Tier 2 promotion
    const tier3To2Timer = setInterval(async () => {
      try {
        await this._promoteMemories(MemoryTier.CURRENT, MemoryTier.IMPORTANT);
      } catch (error) {
        this.logger.error('❌ Error during Tier 3 -> Tier 2 promotion:', error);
      }
    }, this.config.autoPromotionInterval);
    
    // Set up timer for Tier 2 -> Tier 1 promotion
    const tier2To1Timer = setInterval(async () => {
      try {
        await this._promoteMemories(MemoryTier.IMPORTANT, MemoryTier.CRITICAL);
      } catch (error) {
        this.logger.error('❌ Error during Tier 2 -> Tier 1 promotion:', error);
      }
    }, this.config.criticalPromotionInterval);
    
    // Store timers for cleanup
    this.promotionTimers.set('tier3To2', tier3To2Timer);
    this.promotionTimers.set('tier2To1', tier2To1Timer);
    
    // Set up autosave timers
    this._setupAutoSave();
  }

  /**
   * Set up automatic state saving at different intervals for each tier
   * @private
   */
  _setupAutoSave() {
    // Configuration for autosave intervals (in milliseconds)
    const autosaveIntervals = {
      [MemoryTier.CURRENT]: 5000,      // Tier 3: Every 5 seconds
      [MemoryTier.IMPORTANT]: 30000,    // Tier 2: Every 30 seconds
      [MemoryTier.CRITICAL]: 300000     // Tier 1: Every 5 minutes
    };
    
    // Set up autosave timer for each tier
    for (const [tier, interval] of Object.entries(autosaveIntervals)) {
      const timerKey = `autosave_${tier}`;
      
      const timer = setInterval(async () => {
        try {
          await this._performAutoSave(tier);
        } catch (error) {
          this.logger.error(`❌ Error during autosave for tier ${tier}:`, error);
        }
      }, interval);
      
      // Store timer for cleanup
      this.promotionTimers.set(timerKey, timer);
      
      this.logger.log(`🔄 Autosave timer started for tier ${tier} (interval: ${interval}ms)`);
    }
  }

  /**
   * Perform autosave for a specific tier
   * @param {string} tier - Memory tier
   * @returns {Promise<void>}
   * @private
   */
  async _performAutoSave(tier) {
    if (!this.isConnected) return;
    
    try {
      // Emit memory operation start event
      this._emitMemoryOperationStart(tier, 'autosave');
      const startTime = Date.now();
      
      // Get the current state for this tier
      const state = await this._getCurrentStateForTier(tier);
      
      if (!state || Object.keys(state).length === 0) {
        // No state to save
        this._emitMemoryOperationEnd(tier, 'autosave', true, Date.now() - startTime);
        return;
      }
      
      // Create a key based on tier and timestamp
      const key = `autosave_${tier}_${Date.now()}`;
      
      // Save the state
      const result = await this.saveState(key, state, {
        tier,
        ttl: tier === MemoryTier.CURRENT ? 3600 : null, // 1 hour TTL for Tier 3
        metadata: {
          autosave: true,
          timestamp: Date.now()
        },
        onForcePreempt: async () => {
          // Handle force preemption for autosave
          this.logger.log(`⚠️ Autosave for tier ${tier} was force preempted`);
          
          // For tier 2, we can save partial state
          if (tier === MemoryTier.IMPORTANT) {
            const partialKey = `autosave_${tier}_partial_${Date.now()}`;
            await this.saveState(partialKey, { 
              ...state,
              partial: true,
              preemptedAt: Date.now()
            }, { tier });
          }
        }
      });
      
      // Emit memory operation end event
      this._emitMemoryOperationEnd(tier, 'autosave', result, Date.now() - startTime);
      
      // Log success
      this.logger.log(`✅ Autosave completed for tier ${tier} (${Object.keys(state).length} items)`);
      
      // Record in observability
      this._recordObservabilityEvent('autosave_complete', {
        tier,
        itemCount: Object.keys(state).length,
        durationMs: Date.now() - startTime
      });
    } catch (error) {
      this.logger.error(`❌ Error during autosave for tier ${tier}:`, error);
      
      // Emit memory operation end event with error
      this._emitMemoryOperationEnd(tier, 'autosave', false, Date.now() - startTime);
      
      // Record in observability
      this._recordObservabilityEvent('autosave_error', {
        tier,
        error: error.message
      });
    }
  }

  /**
   * Promote memories from one tier to another
   * @param {number} fromTier - Source tier
   * @param {number} toTier - Target tier
   * @returns {Promise<number>} Number of promoted memories
   * @private
   */
  async _promoteMemories(fromTier, toTier) {
    // Get all keys from the source tier
    const sourcePattern = `${this.config.keyPrefix}tier:${fromTier}:*`;
    const keys = await this.redis.keys(sourcePattern);
    
    if (keys.length === 0) {
      return 0;
    }
    
    this.logger.log(`🔄 Promoting ${keys.length} memories from Tier ${fromTier} to Tier ${toTier}`);
    
    // Record promotion start
    if (this.externalMetrics) {
      this.externalMetrics.recordMemoryPromotionStart({
        fromTier,
        toTier,
        count: keys.length
      });
    }
    
    let promotedCount = 0;
    
    // Process each key
    for (const key of keys) {
      try {
        // Extract the base key (without tier prefix)
        const baseKey = key.replace(`${this.config.keyPrefix}tier:${fromTier}:`, '');
        
        // Get the value
        const value = await this.redis.get(key);
        
        if (value) {
          // Create the new key with target tier
          const newKey = `${this.config.keyPrefix}tier:${toTier}:${baseKey}`;
          
          // Store in the target tier
          await this.redis.set(newKey, value);
          
          // Delete from source tier
          await this.redis.del(key);
          
          promotedCount++;
        }
      } catch (error) {
        this.logger.error(`❌ Error promoting key ${key}:`, error);
      }
    }
    
    // Record promotion completion
    if (this.externalMetrics) {
      this.externalMetrics.recordMemoryPromotionComplete({
        fromTier,
        toTier,
        promotedCount,
        totalCount: keys.length
      });
    }
    
    this.logger.log(`✅ Promoted ${promotedCount}/${keys.length} memories from Tier ${fromTier} to Tier ${toTier}`);
    
    // Emit promotion event
    this.emit('memoriesPromoted', {
      fromTier,
      toTier,
      promotedCount,
      totalCount: keys.length
    });
    
    return promotedCount;
  }
  
  /**
   * Save state to Redis
   * @param {string} key - State key
   * @param {any} value - State value
   * @param {object} options - Save options
   * @param {number} options.tier - Memory tier (from MemoryTier enum)
   * @param {number} options.ttl - Time to live in seconds (optional)
   * @param {boolean} options.forceCompress - Force compression regardless of size
   * @param {boolean} options.onForcePreempt - Callback for force preemption
   * @returns {Promise<boolean>} Success status
   */
  async saveState(key, value, {
    tier = MemoryTier.CURRENT,
    ttl = null,
    forceCompress = false,
    onForcePreempt = null
  } = {}) {
    try {
      // Record save start
      const saveStartTime = performance.now();
      
      // Check connection
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      // Prepare value for storage
      let serializedValue;
      let compressed = false;
      
      // Serialize the value
      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }
      
      // Check if we should compress
      const shouldCompress = this.config.enableCompression && 
        (forceCompress || serializedValue.length > this.config.compressionThreshold);
      
      // Compress if needed
      if (shouldCompress) {
        const compressStartTime = performance.now();
        
        // Compress the value
        const compressedValue = await gzip(Buffer.from(serializedValue));
        serializedValue = compressedValue.toString('base64');
        compressed = true;
        
        const compressionTime = performance.now() - compressStartTime;
        
        // Record compression metrics
        if (this.externalMetrics) {
          this.externalMetrics.recordStateCompression({
            key,
            originalSize: value.length,
            compressedSize: serializedValue.length,
            compressionRatio: value.length / serializedValue.length,
            compressionTimeMs: compressionTime
          });
        }
      }
      
      // Check size limit
      if (serializedValue.length > this.config.maxKeySize) {
        throw new Error(`Value for key ${key} exceeds maximum size limit (${serializedValue.length} > ${this.config.maxKeySize})`);
      }
      
      // Add tier prefix to key
      const tieredKey = this.config.enableTieredMemory
        ? `${this.config.keyPrefix}tier:${tier}:${key}`
        : `${this.config.keyPrefix}${key}`;
      
      // Store metadata about the value
      const metadata = {
        compressed,
        tier,
        createdAt: Date.now(),
        size: serializedValue.length
      };
      
      // Store the value
      if (ttl) {
        await this.redis.setex(tieredKey, ttl, serializedValue);
      } else {
        await this.redis.set(tieredKey, serializedValue);
      }
      
      // Store the metadata
      await this.redis.set(`${tieredKey}:meta`, JSON.stringify(metadata));
      
      // Calculate total save time
      const saveTime = performance.now() - saveStartTime;
      
      // Record save metrics
      if (this.externalMetrics) {
        this.externalMetrics.recordStateSave({
          key,
          tier,
          size: serializedValue.length,
          compressed,
          ttl,
          saveTimeMs: saveTime
        });
      }
      
      // Log success
      this.logger.log(`💾 State saved: ${key} (Tier ${tier}, ${serializedValue.length} bytes, ${compressed ? 'compressed' : 'uncompressed'}) in ${saveTime.toFixed(3)}ms`);
      
      // Emit save event
      this.emit('stateSaved', {
        key,
        tier,
        size: serializedValue.length,
        compressed,
        saveTimeMs: saveTime
      });
      
      // Set up force preempt handler if provided
      if (onForcePreempt && typeof onForcePreempt === 'function') {
        this.onForcePreempt = async () => {
          // If this is a Tier 1 (critical) memory, we should try to finish
          // If Tier 2 or 3, we can handle preemption
          if (tier === MemoryTier.CRITICAL) {
            this.logger.log(`⚠️ Force preemption requested for critical memory ${key}, attempting to complete operation`);
            return false; // Don't allow preemption for critical memories
          } else {
            this.logger.log(`⚠️ Force preemption for memory ${key} (Tier ${tier}), handling gracefully`);
            await onForcePreempt();
            return true; // Allow preemption
          }
        };
      }
      
      return true;
    } catch (error) {
      this.logger.error(`❌ Error saving state for key ${key}:`, error);
      
      // Record save error
      if (this.externalMetrics) {
        this.externalMetrics.recordStateSaveError({
          key,
          error: error.message
        });
      }
      
      // Emit save error event
      this.emit('stateSaveError', {
        key,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Load state from Redis
   * @param {string} key - State key
   * @param {object} options - Load options
   * @param {boolean} options.searchAllTiers - Whether to search all tiers for the key
   * @returns {Promise<any>} State value
   */
  async loadState(key, { searchAllTiers = true } = {}) {
    try {
      // Record load start
      const loadStartTime = performance.now();
      
      // Check connection
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      let value = null;
      let metadata = null;
      let foundTier = null;
      
      if (this.config.enableTieredMemory && searchAllTiers) {
        // Search in all tiers, starting from highest (most critical)
        for (const tier of [MemoryTier.CRITICAL, MemoryTier.IMPORTANT, MemoryTier.CURRENT]) {
          const tieredKey = `${this.config.keyPrefix}tier:${tier}:${key}`;
          const rawValue = await this.redis.get(tieredKey);
          
          if (rawValue) {
            value = rawValue;
            
            // Get metadata
            const rawMetadata = await this.redis.get(`${tieredKey}:meta`);
            if (rawMetadata) {
              metadata = JSON.parse(rawMetadata);
            }
            
            foundTier = tier;
            break;
          }
        }
      } else {
        // Use the standard key format
        const standardKey = this.config.enableTieredMemory
          ? `${this.config.keyPrefix}tier:${MemoryTier.CURRENT}:${key}`
          : `${this.config.keyPrefix}${key}`;
        
        value = await this.redis.get(standardKey);
        
        // Get metadata
        const rawMetadata = await this.redis.get(`${standardKey}:meta`);
        if (rawMetadata) {
          metadata = JSON.parse(rawMetadata);
        }
        
        foundTier = MemoryTier.CURRENT;
      }
      
      // If not found, return null
      if (!value) {
        return null;
      }
      
      // Check if value is compressed
      if (metadata && metadata.compressed) {
        // Decompress the value
        const compressStartTime = performance.now();
        
        const compressedBuffer = Buffer.from(value, 'base64');
        const decompressedBuffer = await gunzip(compressedBuffer);
        value = decompressedBuffer.toString();
        
        const decompressionTime = performance.now() - compressStartTime;
        
        // Record decompression metrics
        if (this.externalMetrics) {
          this.externalMetrics.recordStateDecompression({
            key,
            compressedSize: compressedBuffer.length,
            decompressedSize: value.length,
            decompressionTimeMs: decompressionTime
          });
        }
      }
      
      // Parse JSON if needed
      try {
        value = JSON.parse(value);
      } catch (e) {
        // Not JSON, use as is
      }
      
      // Calculate total load time
      const loadTime = performance.now() - loadStartTime;
      
      // Record load metrics
      if (this.externalMetrics) {
        this.externalMetrics.recordStateLoad({
          key,
          tier: foundTier,
          found: true,
          loadTimeMs: loadTime
        });
      }
      
      // Log success
      this.logger.log(`📂 State loaded: ${key} (Tier ${foundTier}, ${typeof value === 'string' ? value.length : JSON.stringify(value).length} bytes) in ${loadTime.toFixed(3)}ms`);
      
      // Emit load event
      this.emit('stateLoaded', {
        key,
        tier: foundTier,
        loadTimeMs: loadTime
      });
      
      return value;
    } catch (error) {
      this.logger.error(`❌ Error loading state for key ${key}:`, error);
      
      // Record load error
      if (this.externalMetrics) {
        this.externalMetrics.recordStateLoadError({
          key,
          error: error.message
        });
      }
      
      // Emit load error event
      this.emit('stateLoadError', {
        key,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Delete state from Redis
   * @param {string} key - State key
   * @param {object} options - Delete options
   * @param {boolean} options.deleteFromAllTiers - Whether to delete from all tiers
   * @returns {Promise<boolean>} Success status
   */
  async deleteState(key, { deleteFromAllTiers = true } = {}) {
    try {
      // Check connection
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      let deletedCount = 0;
      
      if (this.config.enableTieredMemory && deleteFromAllTiers) {
        // Delete from all tiers
        for (const tier of [MemoryTier.CRITICAL, MemoryTier.IMPORTANT, MemoryTier.CURRENT]) {
          const tieredKey = `${this.config.keyPrefix}tier:${tier}:${key}`;
          
          // Delete value and metadata
          const deleted = await this.redis.del(tieredKey, `${tieredKey}:meta`);
          deletedCount += deleted;
        }
      } else {
        // Delete from standard key
        const standardKey = this.config.enableTieredMemory
          ? `${this.config.keyPrefix}tier:${MemoryTier.CURRENT}:${key}`
          : `${this.config.keyPrefix}${key}`;
        
        // Delete value and metadata
        deletedCount = await this.redis.del(standardKey, `${standardKey}:meta`);
      }
      
      // Log result
      if (deletedCount > 0) {
        this.logger.log(`🗑️ State deleted: ${key} (${deletedCount} keys)`);
        
        // Record delete metrics
        if (this.externalMetrics) {
          this.externalMetrics.recordStateDelete({
            key,
            deletedCount
          });
        }
        
        // Emit delete event
        this.emit('stateDeleted', {
          key,
          deletedCount
        });
        
        return true;
      } else {
        this.logger.log(`⚠️ State not found for deletion: ${key}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`❌ Error deleting state for key ${key}:`, error);
      
      // Record delete error
      if (this.externalMetrics) {
        this.externalMetrics.recordStateDeleteError({
          key,
          error: error.message
        });
      }
      
      // Emit delete error event
      this.emit('stateDeleteError', {
        key,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * List all state keys in Redis
   * @param {object} options - List options
   * @param {number} options.tier - Specific tier to list (optional)
   * @param {string} options.pattern - Key pattern to match (optional)
   * @returns {Promise<Array<string>>} Array of keys
   */
  async listStateKeys({ tier = null, pattern = '*' } = {}) {
    try {
      // Check connection
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      let keys = [];
      
      if (this.config.enableTieredMemory && tier !== null) {
        // List keys for specific tier
        const tieredPattern = `${this.config.keyPrefix}tier:${tier}:${pattern}`;
        keys = await this.redis.keys(tieredPattern);
        
        // Remove tier prefix
        keys = keys.map(key => key.replace(`${this.config.keyPrefix}tier:${tier}:`, ''));
      } else if (this.config.enableTieredMemory) {
        // List keys for all tiers
        const allKeys = new Set();
        
        for (const t of [MemoryTier.CRITICAL, MemoryTier.IMPORTANT, MemoryTier.CURRENT]) {
          const tieredPattern = `${this.config.keyPrefix}tier:${t}:${pattern}`;
          const tierKeys = await this.redis.keys(tieredPattern);
          
          // Remove tier prefix and add to set
          tierKeys.forEach(key => {
            allKeys.add(key.replace(`${this.config.keyPrefix}tier:${t}:`, ''));
          });
        }
        
        keys = Array.from(allKeys);
      } else {
        // Standard key format
        const standardPattern = `${this.config.keyPrefix}${pattern}`;
        keys = await this.redis.keys(standardPattern);
        
        // Remove prefix
        keys = keys.map(key => key.replace(this.config.keyPrefix, ''));
      }
      
      // Filter out metadata keys
      keys = keys.filter(key => !key.endsWith(':meta'));
      
      // Log result
      this.logger.log(`📋 Listed ${keys.length} state keys`);
      
      return keys;
    } catch (error) {
      this.logger.error(`❌ Error listing state keys:`, error);
      throw error;
    }
  }
  
  /**
   * Get memory statistics
   * @returns {Promise<object>} Memory statistics
   */
  async getMemoryStats() {
    try {
      // Check connection
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      
      const stats = {
        totalKeys: 0,
        totalSize: 0,
        tierStats: {}
      };
      
      // Get stats for each tier
      if (this.config.enableTieredMemory) {
        for (const tier of [MemoryTier.CRITICAL, MemoryTier.IMPORTANT, MemoryTier.CURRENT]) {
          const tieredPattern = `${this.config.keyPrefix}tier:${tier}:*`;
          const keys = await this.redis.keys(tieredPattern);
          
          // Filter out metadata keys
          const valueKeys = keys.filter(key => !key.endsWith(':meta'));
          
          let tierSize = 0;
          
          // Calculate total size
          for (const key of valueKeys) {
            const value = await this.redis.get(key);
            if (value) {
              tierSize += value.length;
            }
          }
          
          // Add to tier stats
          stats.tierStats[tier] = {
            keys: valueKeys.length,
            size: tierSize
          };
          
          // Add to totals
          stats.totalKeys += valueKeys.length;
          stats.totalSize += tierSize;
        }
      } else {
        // Standard key format
        const standardPattern = `${this.config.keyPrefix}*`;
        const keys = await this.redis.keys(standardPattern);
        
        // Filter out metadata keys
        const valueKeys = keys.filter(key => !key.endsWith(':meta'));
        
        // Calculate total size
        for (const key of valueKeys) {
          const value = await this.redis.get(key);
          if (value) {
            stats.totalSize += value.length;
          }
        }
        
        stats.totalKeys = valueKeys.length;
      }
      
      return stats;
    } catch (error) {
      this.logger.error(`❌ Error getting memory stats:`, error);
      throw error;
    }
  }
  
  /**
   * Close the Redis connection
   */
  async close() {
    // Clear promotion timers
    for (const timer of this.promotionTimers.values()) {
      clearInterval(timer);
    }
    
    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
    }
    
    this.logger.log('🔌 Redis connection closed');
  }

  /**
   * Mock methods for getting different types of state data
   * These would be replaced with real implementations in the actual system
   * @private
   */
  async _getHistoricalArbitrageData() {
    return { 
      successfulTrades: 150,
      totalProfit: '25.75 ETH',
      bestStrategies: ['triangular', 'cross-exchange'],
      lastUpdated: Date.now()
    };
  }

  async _getStrategicInsights() {
    return {
      mostProfitableChains: ['ethereum', 'arbitrum', 'polygon'],
      mostProfitablePairs: ['ETH/USDC', 'WBTC/ETH', 'ARB/USDC'],
      timeOfDayPatterns: {
        highVolatility: [8, 14, 20], // Hours with high volatility
        highProfitability: [7, 15, 23] // Hours with high profitability
      }
    };
  }

  async _getLongTermPatterns() {
    return {
      weekdayPatterns: {
        monday: { volatility: 'high', opportunities: 'medium' },
        friday: { volatility: 'very high', opportunities: 'high' }
      },
      monthlyPatterns: {
        firstWeek: { volatility: 'medium', opportunities: 'high' },
        lastWeek: { volatility: 'high', opportunities: 'very high' }
      }
    };
  }

  async _getRecentPoolAnalysis() {
    return {
      recentlyAnalyzedPools: [
        {
          poolId: 'uniswap_v3_eth_usdc_0.3',
          volume24h: '15.2M',
          volatility: 'medium',
          arbitrageOpportunities: 8,
          lastAnalyzed: Date.now() - 3600000 // 1 hour ago
        },
        {
          poolId: 'sushiswap_eth_usdt',
          volume24h: '8.7M',
          volatility: 'high',
          arbitrageOpportunities: 12,
          lastAnalyzed: Date.now() - 7200000 // 2 hours ago
        }
      ]
    };
  }

  async _getMarketPatterns() {
    return {
      recentPatterns: [
        {
          pattern: 'flash_crash_recovery',
          detectedAt: Date.now() - 86400000, // 1 day ago
          profitability: 'very high',
          frequency: 'rare'
        },
        {
          pattern: 'liquidity_imbalance',
          detectedAt: Date.now() - 43200000, // 12 hours ago
          profitability: 'high',
          frequency: 'common'
        }
      ]
    };
  }

  async _getOpportunityHotspots() {
    return {
      currentHotspots: [
        {
          type: 'cross_exchange',
          chains: ['ethereum', 'arbitrum'],
          pairs: ['ETH/USDC'],
          averageProfit: '0.05 ETH',
          frequency: 'high'
        },
        {
          type: 'triangular',
          chains: ['polygon'],
          tokens: ['MATIC', 'USDC', 'WETH'],
          averageProfit: '0.02 ETH',
          frequency: 'medium'
        }
      ]
    };
  }

  async _getActiveTasksState() {
    return {
      activeTasks: [
        {
          id: 'pool_monitoring_1',
          progress: 0.75,
          startedAt: Date.now() - 300000, // 5 minutes ago
          lastCheckpoint: Date.now() - 60000 // 1 minute ago
        },
        {
          id: 'market_analysis_2',
          progress: 0.3,
          startedAt: Date.now() - 120000, // 2 minutes ago
          lastCheckpoint: Date.now() - 30000 // 30 seconds ago
        }
      ]
    };
  }

  async _getCurrentCalculations() {
    return {
      pendingCalculations: [
        {
          id: 'profit_estimation_1',
          target: 'eth_usdc_arbitrage',
          progress: 0.6,
          partialResults: {
            estimatedProfit: '0.03 ETH',
            confidence: 0.8
          }
        }
      ]
    };
  }

  async _getTemporaryData() {
    return {
      cachedPrices: {
        'ETH/USD': 3500.25,
        'BTC/USD': 58750.75,
        'ARB/USD': 1.25,
        lastUpdated: Date.now() - 5000 // 5 seconds ago
      },
      temporaryFlags: {
        highVolatilityMode: true,
        aggressiveExecutionMode: false
      }
    };
  }
  
  /**
   * Get current state for a specific tier
   * This would be implemented by the specific agent to collect current state
   * @param {string} tier - Memory tier
   * @returns {Promise<object>} Current state
   * @private
   */
  async _getCurrentStateForTier(tier) {
    try {
      // Get all keys for this tier
      const tierPrefix = `memory:${tier}:`;
      const keys = await this.redis.keys(`${tierPrefix}*`);
      
      if (!keys || keys.length === 0) {
        this.logger.log(`No existing memory found for tier ${tier}`);
        return this._generateInitialStateForTier(tier);
      }
      
      // Load all data for these keys
      const state = {};
      for (const key of keys) {
        try {
          const rawData = await this.redis.get(key);
          if (rawData) {
            const data = JSON.parse(rawData);
            const shortKey = key.replace(tierPrefix, '');
            state[shortKey] = data;
          }
        } catch (error) {
          this.logger.error(`Error loading data for key ${key}:`, error);
          // Continue with other keys even if one fails
        }
      }
      
      // Merge with any active memory operations
      if (this.activeMemoryOperations.has(tier)) {
        const activeOps = this.activeMemoryOperations.get(tier);
        for (const [key, data] of Object.entries(activeOps)) {
          state[key] = data;
        }
      }
      
      // Add system state data
      const systemState = await this._getSystemStateForTier(tier);
      return {
        ...state,
        ...systemState,
        _metadata: {
          tier,
          timestamp: Date.now(),
          keyCount: Object.keys(state).length
        }
      };
    } catch (error) {
      this.logger.error(`Error getting current state for tier ${tier}:`, error);
      // Return minimal state in case of error
      return {
        _error: {
          message: error.message,
          timestamp: Date.now()
        },
        _metadata: {
          tier,
          timestamp: Date.now(),
          error: true
        }
      };
    }
  }

  /**
   * Generate initial state for a tier if none exists
   * @param {string} tier - Memory tier
   * @returns {Promise<object>} Initial state
   * @private
   */
  async _generateInitialStateForTier(tier) {
    // Create appropriate initial state based on tier
    if (tier === MemoryTier.CRITICAL) {
      return {
        historicalArbitrageData: await this._getHistoricalArbitrageData(),
        strategicInsights: await this._getStrategicInsights(),
        longTermPatterns: await this._getLongTermPatterns(),
        _metadata: {
          tier,
          timestamp: Date.now(),
          isInitial: true
        }
      };
    }
    
    if (tier === MemoryTier.IMPORTANT) {
      return {
        recentPoolAnalysis: await this._getRecentPoolAnalysis(),
        marketPatterns: await this._getMarketPatterns(),
        opportunityHotspots: await this._getOpportunityHotspots(),
        _metadata: {
          tier,
          timestamp: Date.now(),
          isInitial: true
        }
      };
    }
    
    if (tier === MemoryTier.CURRENT) {
      return {
        activeTasksState: await this._getActiveTasksState(),
        currentCalculations: await this._getCurrentCalculations(),
        temporaryData: await this._getTemporaryData(),
        _metadata: {
          tier,
          timestamp: Date.now(),
          isInitial: true
        }
      };
    }
    
    return {
      _metadata: {
        tier,
        timestamp: Date.now(),
        isInitial: true,
        isEmpty: true
      }
    };
  }

  /**
   * Get system state data for a tier
   * @param {string} tier - Memory tier
   * @returns {Promise<object>} System state
   * @private
   */
  async _getSystemStateForTier(tier) {
    // Add system-level state data based on tier
    const systemState = {
      system: {
        timestamp: Date.now(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    // Add blockchain state for critical and important tiers
    if (tier === MemoryTier.CRITICAL || tier === MemoryTier.IMPORTANT) {
      systemState.blockchain = await this._getBlockchainState();
    }
    
    // Add performance metrics for all tiers
    systemState.performance = this._getPerformanceMetrics();
    
    return systemState;
  }

  /**
   * Get blockchain state from connected providers
   * @returns {Promise<object>} Blockchain state
   * @private
   */
  async _getBlockchainState() {
    try {
      // Connect to actual blockchain providers for real data
      const { RealBlockchainIntegration } = await import('./src/core/RealBlockchainIntegration.js');
      
      const blockchainIntegration = new RealBlockchainIntegration();
      await blockchainIntegration.initialize();
      
      const blockchainState = {};
      const chains = ['ethereum', 'arbitrum', 'polygon', 'base', 'optimism', 'bsc'];
      
      for (const chain of chains) {
        try {
          const provider = blockchainIntegration.getProvider(chain);
          if (provider) {
            const [blockNumber, gasPrice, feeData] = await Promise.all([
              provider.getBlockNumber(),
              provider.getGasPrice(),
              provider.getFeeData()
            ]);
            
            blockchainState[chain] = {
              blockNumber,
              gasPrice: gasPrice.toString(),
              baseFee: feeData.gasPrice?.toString() || '0',
              maxPriorityFee: feeData.maxPriorityFeePerGas?.toString() || '0',
              timestamp: Date.now(),
              isReal: true
            };
          }
        } catch (chainError) {
          this.logger.warn(`⚠️ Failed to get ${chain} state:`, chainError.message);
          blockchainState[chain] = {
            blockNumber: 0,
            gasPrice: '0',
            timestamp: Date.now(),
            error: chainError.message,
            isReal: false
          };
        }
      }
      
      return blockchainState;
    } catch (error) {
      this.logger.error('Error getting blockchain state:', error);
      
      // Fallback to basic state if blockchain integration fails
      return {
        ethereum: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message },
        arbitrum: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message },
        polygon: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message },
        base: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message },
        optimism: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message },
        bsc: { blockNumber: 0, gasPrice: '0', timestamp: Date.now(), error: error.message }
      };
    }
  }

  /**
   * Get performance metrics
   * @returns {object} Performance metrics
   * @private
   */
  _getPerformanceMetrics() {
    return {
      memoryOperations: {
        total: this.metrics.totalMemoryOperations,
        successful: this.metrics.successfulMemoryOperations,
        failed: this.metrics.failedMemoryOperations,
        interrupted: this.metrics.interruptedMemoryOperations,
        averageDuration: this.metrics.totalMemoryOperationTime / Math.max(1, this.metrics.totalMemoryOperations)
      },
      tierProtection: {
        tier1Protected: this.metrics.tier1MemoriesProtected,
        tier2Protected: this.metrics.tier2MemoriesProtected,
        tier3Sacrificed: this.metrics.tier3MemoriesSacrificed
      },
      timestamp: Date.now()
    };
  }

  /**
   * Get historical arbitrage data from database
   * @returns {Promise<object>} Historical arbitrage data
   * @private
   */
  async _getHistoricalArbitrageData() {
    try {
      // TODO: Implement actual database query to get historical arbitrage data
      this.logger.warn('⚠️ _getHistoricalArbitrageData() needs actual implementation with database connection');
      
      // This would query a database in production
      // Return structured data that matches the expected format
      return {
        successfulTrades: 0,
        totalProfit: '0 ETH',
        bestStrategies: [],
        lastUpdated: Date.now(),
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting historical arbitrage data:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get strategic insights from analytics service
   * @returns {Promise<object>} Strategic insights
   * @private
   */
  async _getStrategicInsights() {
    try {
      // TODO: Implement actual analytics service connection
      this.logger.warn('⚠️ _getStrategicInsights() needs actual implementation with analytics service');
      
      // This would connect to an analytics service in production
      return {
        mostProfitableChains: [],
        mostProfitablePairs: [],
        timeOfDayPatterns: {
          highVolatility: [],
          highProfitability: []
        },
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting strategic insights:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get long term patterns from machine learning service
   * @returns {Promise<object>} Long term patterns
   * @private
   */
  async _getLongTermPatterns() {
    try {
      // TODO: Implement actual machine learning service connection
      this.logger.warn('⚠️ _getLongTermPatterns() needs actual implementation with ML service');
      
      // This would connect to a machine learning service in production
      return {
        weekdayPatterns: {},
        monthlyPatterns: {},
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting long term patterns:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get recent pool analysis from pool monitoring service
   * @returns {Promise<object>} Recent pool analysis
   * @private
   */
  async _getRecentPoolAnalysis() {
    try {
      // TODO: Implement actual pool monitoring service connection
      this.logger.warn('⚠️ _getRecentPoolAnalysis() needs actual implementation with pool monitoring service');
      
      // This would connect to a pool monitoring service in production
      return {
        recentlyAnalyzedPools: [],
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting recent pool analysis:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get market patterns from market analysis service
   * @returns {Promise<object>} Market patterns
   * @private
   */
  async _getMarketPatterns() {
    try {
      // TODO: Implement actual market analysis service connection
      this.logger.warn('⚠️ _getMarketPatterns() needs actual implementation with market analysis service');
      
      // This would connect to a market analysis service in production
      return {
        recentPatterns: [],
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting market patterns:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get opportunity hotspots from opportunity detection service
   * @returns {Promise<object>} Opportunity hotspots
   * @private
   */
  async _getOpportunityHotspots() {
    try {
      // TODO: Implement actual opportunity detection service connection
      this.logger.warn('⚠️ _getOpportunityHotspots() needs actual implementation with opportunity detection service');
      
      // This would connect to an opportunity detection service in production
      return {
        currentHotspots: [],
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting opportunity hotspots:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get active tasks state from task manager
   * @returns {Promise<object>} Active tasks state
   * @private
   */
  async _getActiveTasksState() {
    try {
      // TODO: Implement actual task manager connection
      this.logger.warn('⚠️ _getActiveTasksState() needs actual implementation with task manager');
      
      // This would connect to a task manager in production
      return {
        activeTasks: [],
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting active tasks state:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get current calculations from calculation service
   * @returns {Promise<object>} Current calculations
   * @private
   */
  async _getCurrentCalculations() {
    try {
      // TODO: Implement actual calculation service connection
      this.logger.warn('⚠️ _getCurrentCalculations() needs actual implementation with calculation service');
      
      // This would connect to a calculation service in production
      return {
        pendingCalculations: [],
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting current calculations:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get temporary data from cache
   * @returns {Promise<object>} Temporary data
   * @private
   */
  async _getTemporaryData() {
    try {
      // TODO: Implement actual cache connection
      this.logger.warn('⚠️ _getTemporaryData() needs actual implementation with cache service');
      
      // This would connect to a cache service in production
      return {
        cachedPrices: {
          lastUpdated: Date.now()
        },
        temporaryFlags: {},
        needsImplementation: true
      };
    } catch (error) {
      this.logger.error('Error getting temporary data:', error);
      return {
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Initialize the Redis connection and setup
   */
  async initialize() {
    try {
      this.logger.info('🔗 Initializing Redis State Manager...');
      
      // Initialize Redis connection if not provided
      if (!this.redis) {
        this.redis = new Redis({
          host: this.config.redisHost || 'localhost',
          port: this.config.redisPort || 6379,
          retryDelayOnFailover: 100,
          maxRetriesPerRequest: 3,
          lazyConnect: true
        });
        
        this.redis.on('error', (error) => {
          this.logger.error('Redis connection error:', error);
          this.emit('error', error);
        });
        
        this.redis.on('connect', () => {
          this.logger.info('✅ Redis connected successfully');
          this.emit('connected');
        });
      }
      
      // Test connection
      await this.redis.ping();
      
      // Start auto-promotion timers
      this.startAutoPromotion();
      
      this.logger.info('✅ Redis State Manager initialized successfully');
      return true;
      
    } catch (error) {
      this.logger.error('❌ Failed to initialize Redis State Manager:', error);
      throw error;
    }
  }

  /**
   * Start auto-promotion timers
   */
  startAutoPromotion() {
    // Auto-promote important memories to critical
    this.autoPromotionTimer = setInterval(() => {
      this.autoPromoteMemories().catch(error => 
        this.logger.error('Auto-promotion error:', error)
      );
    }, this.config.autoPromotionInterval);
    
    // Auto-promote current memories to important
    this.criticalPromotionTimer = setInterval(() => {
      this.autoPromoteCriticalMemories().catch(error => 
        this.logger.error('Critical promotion error:', error)
      );
    }, this.config.criticalPromotionInterval);
  }

  /**
   * Auto-promote memories based on age and access patterns
   */
  async autoPromoteMemories() {
    // Implementation for automatic memory promotion
    // This would analyze memory access patterns and promote important memories
  }

  /**
   * Auto-promote critical memories
   */
  async autoPromoteCriticalMemories() {
    // Implementation for critical memory promotion
    // This would handle the most important memory upgrades
  }

  /**
   * Connect to Redis and initialize the state manager
   * @returns {Promise<boolean>} Whether the connection was successful
   */
  async connect() {
    if (this.isConnected) {
      this.logger.log('📌 RedisStateManager already connected');
      return true;
    }
    
    try {
      // Set up Redis client event handlers
      this.redis.on('error', this._handleRedisError);
      this.redis.on('connect', this._handleRedisConnect);
      this.redis.on('end', this._handleRedisEnd);
      
      // Wait for connection to be established
      this.logger.log('🔌 Connecting to Redis...');
      
      // If redis client doesn't have a connect method, assume it's already connected
      if (typeof this.redis.connect === 'function') {
        await this.redis.connect();
      }
      
      // Set up auto-promotion timers
      this._setupAutoPromotion();
      
      this.isConnected = true;
      this.connectionError = null;
      
      this.logger.log('✅ Connected to Redis successfully');
      this.emit('connected');
      
      return true;
    } catch (error) {
      this.connectionError = error;
      this.isConnected = false;
      
      this.logger.error('❌ Failed to connect to Redis:', error);
      this.emit('error', error);
      
      return false;
    }
  }

  /**
   * Disconnect from Redis and clean up resources
   * @returns {Promise<boolean>} Whether the disconnection was successful
   */
  async disconnect() {
    if (!this.isConnected) {
      this.logger.log('📌 RedisStateManager already disconnected');
      return true;
    }
    
    try {
      // Clear all timers
      for (const timer of this.promotionTimers.values()) {
        clearInterval(timer);
      }
      this.promotionTimers.clear();
      
      // Remove event listeners
      this.redis.removeListener('error', this._handleRedisError);
      this.redis.removeListener('connect', this._handleRedisConnect);
      this.redis.removeListener('end', this._handleRedisEnd);
      
      // Close Redis connection
      if (typeof this.redis.quit === 'function') {
        await this.redis.quit();
      }
      
      this.isConnected = false;
      
      this.logger.log('🔌 Redis connection closed');
      this.emit('disconnected');
      
      return true;
    } catch (error) {
      this.logger.error('❌ Error disconnecting from Redis:', error);
      this.emit('error', error);
      
      return false;
    }
  }

  /**
   * Handle Redis error events
   * @param {Error} error - The error that occurred
   * @private
   */
  _handleRedisError(error) {
    this.logger.error('❌ Redis error:', error);
    this.connectionError = error;
    this.emit('error', error);
  }

  /**
   * Handle Redis connect events
   * @private
   */
  _handleRedisConnect() {
    this.logger.log('🔌 Redis connected');
    this.isConnected = true;
    this.connectionError = null;
    this.emit('connected');
  }

  /**
   * Handle Redis end events
   * @private
   */
  _handleRedisEnd() {
    this.logger.log('🔌 Redis connection ended');
    this.isConnected = false;
    this.emit('disconnected');
  }
}

// Export the state manager and memory tier enum
export {
  RedisStateManager,
  MemoryTier
}; 