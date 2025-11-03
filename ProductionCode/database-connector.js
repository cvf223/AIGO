/**
 * 🗃️ DATABASE CONNECTOR
 * ===================
 * 
 * High-performance database connector for the arbitrage system
 * 
 * ✅ Connection pooling
 * ✅ Batch operations
 * ✅ Automatic reconnection
 * ✅ Query optimization
 * ✅ Error handling
 */

const { MongoClient } = require('mongodb');
const { EventEmitter } = require('events');

// Load environment variables
require('dotenv').config();

// Default configuration
const DEFAULT_CONFIG = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'arbitrage_system',
  poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
  connectTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
  maxIdleTimeMS: 120000,
  reconnectInterval: 1000,
  maxReconnectAttempts: 10
};

// Singleton instance
let _instance = null;

class DatabaseConnector extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Singleton pattern
    if (_instance) {
      return _instance;
    }
    
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.collections = new Map();
    
    _instance = this;
    
    console.log('🗃️ Database Connector initialized');
  }
  
  /**
   * Connect to database
   */
  async connect() {
    try {
      console.log('Connecting to database...');
      
      // Create client
      this.client = new MongoClient(this.config.uri, {
        maxPoolSize: this.config.poolSize,
        connectTimeoutMS: this.config.connectTimeoutMS,
        socketTimeoutMS: this.config.socketTimeoutMS,
        retryWrites: this.config.retryWrites,
        retryReads: this.config.retryReads,
        maxIdleTimeMS: this.config.maxIdleTimeMS
      });
      
      // Connect to database
      await this.client.connect();
      
      // Get database
      this.db = this.client.db(this.config.dbName);
      
      // Reset reconnect attempts
      this.reconnectAttempts = 0;
      
      // Set connected flag
      this.isConnected = true;
      
      // Setup event handlers
      this._setupEventHandlers();
      
      console.log(`✅ Connected to database: ${this.config.dbName}`);
      
      // Emit connected event
      this.emit('connected');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      
      // Try to reconnect
      this._reconnect();
      
      return false;
    }
  }
  
  /**
   * Setup event handlers
   */
  _setupEventHandlers() {
    if (!this.client) return;
    
    // Handle topology changes
    this.client.on('topologyDescriptionChanged', (event) => {
      const previousState = event.previousDescription.type;
      const newState = event.newDescription.type;
      
      if (newState === 'ReplicaSetWithPrimary' && previousState !== 'ReplicaSetWithPrimary') {
        console.log('✅ Database connection restored');
        this.isConnected = true;
        this.emit('reconnected');
      } else if (newState !== 'ReplicaSetWithPrimary' && previousState === 'ReplicaSetWithPrimary') {
        console.warn('⚠️ Database connection lost');
        this.isConnected = false;
        this.emit('disconnected');
      }
    });
  }
  
  /**
   * Reconnect to database
   */
  async _reconnect() {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(`❌ Failed to reconnect after ${this.reconnectAttempts} attempts`);
      this.emit('reconnectFailed');
      return false;
    }
    
    this.reconnectAttempts++;
    
    console.log(`Reconnecting to database (attempt ${this.reconnectAttempts})...`);
    
    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, this.config.reconnectInterval));
    
    // Try to connect
    return this.connect();
  }
  
  /**
   * Get collection
   * @param {string} name - Collection name
   * @returns {Collection} MongoDB collection
   */
  getCollection(name) {
    if (!this.isConnected) {
      throw new Error('Not connected to database');
    }
    
    // Check if collection is cached
    if (!this.collections.has(name)) {
      // Get collection
      const collection = this.db.collection(name);
      
      // Cache collection
      this.collections.set(name, collection);
    }
    
    return this.collections.get(name);
  }
  
  /**
   * Insert document
   * @param {string} collection - Collection name
   * @param {object} document - Document to insert
   * @returns {object} Insert result
   */
  async insertOne(collection, document) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).insertOne(document);
      return result;
    } catch (error) {
      console.error(`❌ Failed to insert document into ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Insert multiple documents
   * @param {string} collection - Collection name
   * @param {object[]} documents - Documents to insert
   * @returns {object} Insert result
   */
  async insertMany(collection, documents) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).insertMany(documents);
      return result;
    } catch (error) {
      console.error(`❌ Failed to insert documents into ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Update document
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @param {object} update - Update
   * @param {object} options - Options
   * @returns {object} Update result
   */
  async updateOne(collection, filter, update, options = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).updateOne(filter, update, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update document in ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Update multiple documents
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @param {object} update - Update
   * @param {object} options - Options
   * @returns {object} Update result
   */
  async updateMany(collection, filter, update, options = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).updateMany(filter, update, options);
      return result;
    } catch (error) {
      console.error(`❌ Failed to update documents in ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Batch update documents
   * @param {string} collection - Collection name
   * @param {object[]} updates - Array of documents to update
   * @returns {object} Update result
   */
  async batchUpdate(collection, updates) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Use bulkWrite for better performance
      const operations = updates.map(doc => {
        // Ensure _id or other unique identifier exists
        const filter = doc._id ? { _id: doc._id } : { token: doc.token };
        
        return {
          updateOne: {
            filter,
            update: { $set: doc },
            upsert: true
          }
        };
      });
      
      const result = await this.getCollection(collection).bulkWrite(operations);
      
      return {
        success: true,
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      };
    } catch (error) {
      console.error(`❌ Failed to batch update documents in ${collection}:`, error);
      
      // Return error result
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Find documents
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @param {object} options - Options
   * @returns {object[]} Documents
   */
  async find(collection, filter, options = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const cursor = this.getCollection(collection).find(filter, options);
      return await cursor.toArray();
    } catch (error) {
      console.error(`❌ Failed to find documents in ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Find one document
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @param {object} options - Options
   * @returns {object} Document
   */
  async findOne(collection, filter, options = {}) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      return await this.getCollection(collection).findOne(filter, options);
    } catch (error) {
      console.error(`❌ Failed to find document in ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete document
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @returns {object} Delete result
   */
  async deleteOne(collection, filter) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).deleteOne(filter);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete document from ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete multiple documents
   * @param {string} collection - Collection name
   * @param {object} filter - Filter
   * @returns {object} Delete result
   */
  async deleteMany(collection, filter) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.getCollection(collection).deleteMany(filter);
      return result;
    } catch (error) {
      console.error(`❌ Failed to delete documents from ${collection}:`, error);
      throw error;
    }
  }
  
  /**
   * Get latest prices for tokens
   * @param {string[]} tokens - Token addresses or symbols
   * @returns {object[]} Price data
   */
  async getLatestPrices(tokens) {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Get prices collection
      const collection = this.getCollection('prices');
      
      // Find latest prices
      const prices = await collection.find({
        token: { $in: tokens }
      }).toArray();
      
      // Map results
      return tokens.map(token => {
        const priceData = prices.find(p => p.token === token);
        return {
          token,
          price: priceData ? priceData.price : null,
          timestamp: priceData ? priceData.timestamp : null
        };
      });
    } catch (error) {
      console.error('❌ Failed to get latest prices:', error);
      
      // Return empty prices on error
      return tokens.map(token => ({
        token,
        price: null,
        timestamp: null
      }));
    }
  }
  
  /**
   * Close connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        this.client = null;
        this.db = null;
        this.collections.clear();
        console.log('✅ Database connection closed');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to close database connection:', error);
      return false;
    }
  }
}

module.exports = new DatabaseConnector(); 