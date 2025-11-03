/**
 * 🌉 REAL-TIME INTEGRATION BRIDGE
 * ============================
 * 
 * Provides real-time event routing and integration between all system components
 * 
 * ✅ Event routing
 * ✅ Component integration
 * ✅ Message queuing
 * ✅ Error handling
 * ✅ Performance monitoring
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Import dependencies
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

// Import local modules
import { databaseConnector } from './database-connector.js';
import { eliteAgentFactory } from './elite-agent-factory.js';

// Bridge configuration
const config = {
  websocket: {
    enabled: true,
    port: parseInt(process.env.BRIDGE_WS_PORT || '8080'),
    path: process.env.BRIDGE_WS_PATH || '/bridge',
    heartbeatInterval: parseInt(process.env.BRIDGE_WS_HEARTBEAT_INTERVAL || '30000')
  },
  redis: {
    enabled: process.env.REDIS_URL ? true : false,
    url: process.env.REDIS_URL || '',
    channel: process.env.REDIS_CHANNEL || 'arbitrage-events',
    nodes: process.env.REDIS_NODES ? process.env.REDIS_NODES.split(',') : []
  },
  queues: {
    opportunities: 'arbitrage-opportunities',
    transactions: 'arbitrage-transactions',
    alerts: 'arbitrage-alerts',
    logs: 'arbitrage-logs'
  },
  performance: {
    metricsInterval: parseInt(process.env.METRICS_INTERVAL || '60000'),
    eventThrottleMs: parseInt(process.env.EVENT_THROTTLE_MS || '100')
  }
};

/**
 * Real-Time Integration Bridge class
 */
class RealTimeIntegrationBridge extends EventEmitter {
  constructor() {
    super();
    
    // Set maximum number of listeners
    this.setMaxListeners(100);
    
    // Initialize components
    this.components = new Map();
    this.eventListeners = new Map();
    this.eventCounts = new Map();
    
    // Initialize connections
    this.wsServer = null;
    this.wsClients = new Map();
    this.redisPublisher = null;
    this.redisSubscriber = null;
    
    // Initialize metrics
    this.metrics = {
      events: {
        received: 0,
        processed: 0,
        dropped: 0,
        errors: 0
      },
      websocket: {
        connections: 0,
        messages: 0,
        errors: 0
      },
      redis: {
        published: 0,
        received: 0,
        errors: 0
      },
      performance: {
        avgProcessingTime: 0,
        peakProcessingTime: 0,
        lastProcessingTime: 0
      }
    };
    
    // Initialize throttling
    this.eventThrottles = new Map();
    
    console.log('🌉 Real-Time Integration Bridge initialized');
  }
  
  /**
   * Initialize bridge
   */
  async initialize() {
    try {
      console.log('Initializing Real-Time Integration Bridge...');
      
      // Initialize database connection
      await databaseConnector.initialize();
      
      // Initialize WebSocket server
      if (config.websocket.enabled) {
        await this._initializeWebSocketServer();
      }
      
      // Initialize Redis connections
      if (config.redis.enabled) {
        await this._initializeRedisConnections();
      }
      
      // Register core components
      this.registerComponent('database', databaseConnector);
      this.registerComponent('agentFactory', eliteAgentFactory);
      
      // Start metrics collection
      this._startMetricsCollection();
      
      console.log('✅ Real-Time Integration Bridge initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time Integration Bridge:', error);
      return false;
    }
  }
  
  /**
   * Initialize WebSocket server
   */
  async _initializeWebSocketServer() {
    try {
      console.log('Initializing WebSocket server...');
      
      // Create WebSocket server
      this.wsServer = new WebSocket.Server({
        port: config.websocket.port,
        path: config.websocket.path
      });
      
      // Handle connection
      this.wsServer.on('connection', (ws, req) => {
        // Generate client ID
        const clientId = uuidv4();
        
        // Add client to map
        this.wsClients.set(clientId, {
          ws,
          ip: req.socket.remoteAddress,
          connectedAt: Date.now(),
          lastActive: Date.now(),
          messages: 0
        });
        
        // Update metrics
        this.metrics.websocket.connections++;
        
        console.log(`✅ WebSocket client connected: ${clientId} (${req.socket.remoteAddress})`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          clientId,
          timestamp: Date.now()
        }));
        
        // Handle messages
        ws.on('message', (message) => {
          try {
            // Update metrics
            this.metrics.websocket.messages++;
            this.wsClients.get(clientId).messages++;
            this.wsClients.get(clientId).lastActive = Date.now();
            
            // Parse message
            const data = JSON.parse(message);
            
            // Process message
            this._processWebSocketMessage(clientId, data);
          } catch (error) {
            console.error(`❌ Failed to process WebSocket message from ${clientId}:`, error);
            
            // Update metrics
            this.metrics.websocket.errors++;
          }
        });
        
        // Handle close
        ws.on('close', () => {
          console.log(`WebSocket client disconnected: ${clientId}`);
          
          // Remove client from map
          this.wsClients.delete(clientId);
          
          // Update metrics
          this.metrics.websocket.connections--;
        });
        
        // Handle error
        ws.on('error', (error) => {
          console.error(`❌ WebSocket error for client ${clientId}:`, error);
          
          // Update metrics
          this.metrics.websocket.errors++;
        });
      });
      
      // Handle server error
      this.wsServer.on('error', (error) => {
        console.error('❌ WebSocket server error:', error);
        
        // Update metrics
        this.metrics.websocket.errors++;
      });
      
      // Start heartbeat interval
      setInterval(() => {
        this._sendHeartbeat();
      }, config.websocket.heartbeatInterval);
      
      console.log(`✅ WebSocket server initialized on port ${config.websocket.port}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket server:', error);
      return false;
    }
  }
  
  /**
   * Initialize Redis connections
   */
  async _initializeRedisConnections() {
    try {
      console.log('Initializing Redis connections...');
      
      // Create Redis publisher
      if (config.redis.nodes.length > 0) {
        // Cluster mode
        this.redisPublisher = new Redis.Cluster(config.redis.nodes);
        this.redisSubscriber = new Redis.Cluster(config.redis.nodes);
      } else {
        // Single node mode
        this.redisPublisher = new Redis(config.redis.url);
        this.redisSubscriber = new Redis(config.redis.url);
      }
      
      // Subscribe to channel
      await this.redisSubscriber.subscribe(config.redis.channel);
      
      // Handle messages
      this.redisSubscriber.on('message', (channel, message) => {
        try {
          // Update metrics
          this.metrics.redis.received++;
          
          // Parse message
          const data = JSON.parse(message);
          
          // Process message
          this._processRedisMessage(channel, data);
        } catch (error) {
          console.error(`❌ Failed to process Redis message from ${channel}:`, error);
          
          // Update metrics
          this.metrics.redis.errors++;
        }
      });
      
      // Handle errors
      this.redisPublisher.on('error', (error) => {
        console.error('❌ Redis publisher error:', error);
        
        // Update metrics
        this.metrics.redis.errors++;
      });
      
      this.redisSubscriber.on('error', (error) => {
        console.error('❌ Redis subscriber error:', error);
        
        // Update metrics
        this.metrics.redis.errors++;
      });
      
      console.log('✅ Redis connections initialized');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Redis connections:', error);
      return false;
    }
  }
  
  /**
   * Send heartbeat to all WebSocket clients
   */
  _sendHeartbeat() {
    try {
      // Create heartbeat message
      const heartbeat = {
        type: 'heartbeat',
        timestamp: Date.now()
      };
      
      // Send to all clients
      for (const [clientId, client] of this.wsClients.entries()) {
        try {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(heartbeat));
          }
        } catch (error) {
          console.error(`❌ Failed to send heartbeat to client ${clientId}:`, error);
          
          // Update metrics
          this.metrics.websocket.errors++;
        }
      }
    } catch (error) {
      console.error('❌ Failed to send heartbeat:', error);
    }
  }
  
  /**
   * Process WebSocket message
   * @param {string} clientId - Client ID
   * @param {object} message - Message object
   */
  _processWebSocketMessage(clientId, message) {
    try {
      // Check message type
      if (!message.type) {
        console.warn(`⚠️ WebSocket message from ${clientId} has no type`);
        return;
      }
      
      // Process message based on type
      switch (message.type) {
        case 'event':
          // Process event
          if (message.event && message.data) {
            this.emit(message.event, message.data);
          }
          break;
        
        case 'subscribe':
          // Subscribe to events
          if (message.events && Array.isArray(message.events)) {
            for (const event of message.events) {
              this._subscribeClientToEvent(clientId, event);
            }
          }
          break;
        
        case 'unsubscribe':
          // Unsubscribe from events
          if (message.events && Array.isArray(message.events)) {
            for (const event of message.events) {
              this._unsubscribeClientFromEvent(clientId, event);
            }
          }
          break;
        
        case 'ping':
          // Respond with pong
          const client = this.wsClients.get(clientId);
          
          if (client && client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify({
              type: 'pong',
              timestamp: Date.now(),
              echo: message.timestamp
            }));
          }
          break;
        
        default:
          console.warn(`⚠️ Unknown WebSocket message type from ${clientId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process WebSocket message from ${clientId}:`, error);
      
      // Update metrics
      this.metrics.websocket.errors++;
    }
  }
  
  /**
   * Process Redis message
   * @param {string} channel - Channel name
   * @param {object} message - Message object
   */
  _processRedisMessage(channel, message) {
    try {
      // Check message type
      if (!message.type) {
        console.warn(`⚠️ Redis message from ${channel} has no type`);
        return;
      }
      
      // Process message based on type
      switch (message.type) {
        case 'event':
          // Process event
          if (message.event && message.data) {
            this.emit(message.event, message.data);
          }
          break;
        
        default:
          console.warn(`⚠️ Unknown Redis message type from ${channel}: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ Failed to process Redis message from ${channel}:`, error);
      
      // Update metrics
      this.metrics.redis.errors++;
    }
  }
  
  /**
   * Subscribe client to event
   * @param {string} clientId - Client ID
   * @param {string} event - Event name
   */
  _subscribeClientToEvent(clientId, event) {
    try {
      // Get client
      const client = this.wsClients.get(clientId);
      
      if (!client) {
        console.warn(`⚠️ Client not found: ${clientId}`);
        return;
      }
      
      // Get event listeners
      let listeners = this.eventListeners.get(event);
      
      if (!listeners) {
        listeners = new Set();
        this.eventListeners.set(event, listeners);
        
        // Add bridge listener
        this.on(event, (data) => {
          this._broadcastEvent(event, data);
        });
      }
      
      // Add client to listeners
      listeners.add(clientId);
      
      console.log(`✅ Client ${clientId} subscribed to event: ${event}`);
      
      // Send confirmation
      client.ws.send(JSON.stringify({
        type: 'subscribed',
        event,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`❌ Failed to subscribe client ${clientId} to event ${event}:`, error);
    }
  }
  
  /**
   * Unsubscribe client from event
   * @param {string} clientId - Client ID
   * @param {string} event - Event name
   */
  _unsubscribeClientFromEvent(clientId, event) {
    try {
      // Get client
      const client = this.wsClients.get(clientId);
      
      if (!client) {
        console.warn(`⚠️ Client not found: ${clientId}`);
        return;
      }
      
      // Get event listeners
      const listeners = this.eventListeners.get(event);
      
      if (!listeners) {
        return;
      }
      
      // Remove client from listeners
      listeners.delete(clientId);
      
      console.log(`✅ Client ${clientId} unsubscribed from event: ${event}`);
      
      // Send confirmation
      client.ws.send(JSON.stringify({
        type: 'unsubscribed',
        event,
        timestamp: Date.now()
      }));
      
      // Remove event listener if no clients are subscribed
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
        this.removeAllListeners(event);
      }
    } catch (error) {
      console.error(`❌ Failed to unsubscribe client ${clientId} from event ${event}:`, error);
    }
  }
  
  /**
   * Broadcast event to subscribed clients
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  _broadcastEvent(event, data) {
    try {
      // Get event listeners
      const listeners = this.eventListeners.get(event);
      
      if (!listeners || listeners.size === 0) {
        return;
      }
      
      // Create event message
      const message = JSON.stringify({
        type: 'event',
        event,
        data,
        timestamp: Date.now()
      });
      
      // Send to all subscribed clients
      for (const clientId of listeners) {
        const client = this.wsClients.get(clientId);
        
        if (client && client.ws.readyState === WebSocket.OPEN) {
          client.ws.send(message);
        }
      }
    } catch (error) {
      console.error(`❌ Failed to broadcast event ${event}:`, error);
      
      // Update metrics
      this.metrics.events.errors++;
    }
  }
  
  /**
   * Start metrics collection
   */
  _startMetricsCollection() {
    // Collect metrics every minute
    setInterval(() => {
      try {
        // Store metrics in database
        databaseConnector.mongoOperation('metrics', 'insertOne', {
          type: 'bridge',
          metrics: this.metrics,
          timestamp: Date.now()
        });
        
        // Reset peak processing time
        this.metrics.performance.peakProcessingTime = 0;
      } catch (error) {
        console.error('❌ Failed to collect metrics:', error);
      }
    }, config.performance.metricsInterval);
  }
  
  /**
   * Register component
   * @param {string} name - Component name
   * @param {object} component - Component instance
   */
  registerComponent(name, component) {
    try {
      console.log(`Registering component: ${name}`);
      
      // Add to components map
      this.components.set(name, component);
      
      // Register event handlers
      if (component instanceof EventEmitter) {
        // Get all event names
        const eventNames = component.eventNames();
        
        for (const eventName of eventNames) {
          // Create bridge event name
          const bridgeEventName = `${name}:${eventName}`;
          
          // Add listener
          component.on(eventName, (data) => {
            this.emit(bridgeEventName, data);
          });
          
          console.log(`✅ Registered event handler: ${bridgeEventName}`);
        }
      }
      
      console.log(`✅ Component registered: ${name}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to register component: ${name}`, error);
      return false;
    }
  }
  
  /**
   * Unregister component
   * @param {string} name - Component name
   */
  unregisterComponent(name) {
    try {
      console.log(`Unregistering component: ${name}`);
      
      // Get component
      const component = this.components.get(name);
      
      if (!component) {
        console.warn(`⚠️ Component not found: ${name}`);
        return false;
      }
      
      // Remove from components map
      this.components.delete(name);
      
      console.log(`✅ Component unregistered: ${name}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to unregister component: ${name}`, error);
      return false;
    }
  }
  
  /**
   * Get component
   * @param {string} name - Component name
   * @returns {object} Component instance
   */
  getComponent(name) {
    return this.components.get(name);
  }
  
  /**
   * Get all components
   * @returns {Map} Components map
   */
  getAllComponents() {
    return this.components;
  }
  
  /**
   * Emit event
   * @param {string} event - Event name
   * @param {any} data - Event data
   * @returns {boolean} Success
   */
  emit(event, data) {
    try {
      // Track start time
      const startTime = Date.now();
      
      // Update event counts
      const count = (this.eventCounts.get(event) || 0) + 1;
      this.eventCounts.set(event, count);
      
      // Check throttling
      if (this._shouldThrottleEvent(event)) {
        // Update metrics
        this.metrics.events.dropped++;
        
        return false;
      }
      
      // Update metrics
      this.metrics.events.received++;
      
      // Publish to Redis if enabled
      if (this.redisPublisher) {
        try {
          this.redisPublisher.publish(config.redis.channel, JSON.stringify({
            type: 'event',
            event,
            data,
            timestamp: Date.now()
          }));
          
          // Update metrics
          this.metrics.redis.published++;
        } catch (error) {
          console.error(`❌ Failed to publish event ${event} to Redis:`, error);
          
          // Update metrics
          this.metrics.redis.errors++;
        }
      }
      
      // Call super.emit
      const result = super.emit(event, data);
      
      // Update metrics
      this.metrics.events.processed++;
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Update performance metrics
      this.metrics.performance.lastProcessingTime = processingTime;
      this.metrics.performance.avgProcessingTime = (this.metrics.performance.avgProcessingTime * (this.metrics.events.processed - 1) + processingTime) / this.metrics.events.processed;
      
      if (processingTime > this.metrics.performance.peakProcessingTime) {
        this.metrics.performance.peakProcessingTime = processingTime;
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Failed to emit event ${event}:`, error);
      
      // Update metrics
      this.metrics.events.errors++;
      
      return false;
    }
  }
  
  /**
   * Check if event should be throttled
   * @param {string} event - Event name
   * @returns {boolean} Whether to throttle event
   */
  _shouldThrottleEvent(event) {
    // Get current time
    const now = Date.now();
    
    // Get last event time
    const lastTime = this.eventThrottles.get(event) || 0;
    
    // Check if event should be throttled
    if (now - lastTime < config.performance.eventThrottleMs) {
      return true;
    }
    
    // Update last event time
    this.eventThrottles.set(event, now);
    
    return false;
  }
  
  /**
   * Get bridge metrics
   * @returns {object} Bridge metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      components: this.components.size,
      eventListeners: this.eventListeners.size,
      eventCounts: Object.fromEntries(this.eventCounts),
      timestamp: Date.now()
    };
  }
  
  /**
   * Close bridge
   */
  async close() {
    try {
      console.log('Closing Real-Time Integration Bridge...');
      
      // Close WebSocket server
      if (this.wsServer) {
        for (const [clientId, client] of this.wsClients.entries()) {
          try {
            client.ws.close();
          } catch (error) {
            console.error(`❌ Failed to close WebSocket client ${clientId}:`, error);
          }
        }
        
        this.wsServer.close();
      }
      
      // Close Redis connections
      if (this.redisPublisher) {
        await this.redisPublisher.quit();
      }
      
      if (this.redisSubscriber) {
        await this.redisSubscriber.quit();
      }
      
      // Close database connection
      await databaseConnector.close();
      
      console.log('✅ Real-Time Integration Bridge closed');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to close Real-Time Integration Bridge:', error);
      return false;
    }
  }
}

// Create singleton instance
const realTimeIntegrationBridge = new RealTimeIntegrationBridge();

export { RealTimeIntegrationBridge, realTimeIntegrationBridge };
export default realTimeIntegrationBridge; 