/**
 * 🌉 REAL-TIME INTEGRATION BRIDGE
 * ==============================
 * 
 * Connects all components with proper event routing for the AI-powered arbitrage system
 * 
 * ✅ High-performance event routing
 * ✅ Component synchronization
 * ✅ Real-time data flow
 * ✅ Error handling and recovery
 * ✅ Metrics collection
 * ✅ System health monitoring
 * 
 * This bridge ensures seamless communication between:
 * - BlockchainConnector
 * - AwarenessSystem
 * - LearningSystem
 * - ReinforcementLearning
 * - ArbitrageSystem
 */

import { EventEmitter } from 'events';
import { BlockchainConnector } from './blockchain-connector.js';
import { AwarenessSystem } from './awareness-system.js';
import { LearningSystemCore } from './learning-system-core.js';
import { ReinforcementLearning } from './reinforcement-learning.js';
import { ArbitrageSystem } from './arbitrage-system.js';

// Singleton instance
let _instance = null;

class RealTimeIntegrationBridge extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Singleton pattern
    if (_instance) {
      console.log('🌉 Returning existing RealTimeIntegrationBridge instance');
      return _instance;
    }
    
    this.config = {
      eventBufferSize: 1000,
      eventProcessingInterval: 10, // 10ms for near real-time processing
      metricsInterval: 30000, // 30 seconds
      healthCheckInterval: 60000, // 1 minute
      componentTimeout: 5000, // 5 seconds
      ...config
    };
    
    // System components
    this.components = new Map();
    
    // Event buffer for high-throughput scenarios
    this.eventBuffer = [];
    
    // Component health status
    this.componentHealth = new Map();
    
    // Metrics
    this.metrics = {
      eventsProcessed: 0,
      eventsByType: new Map(),
      componentCalls: new Map(),
      averageLatency: new Map(),
      errorCounts: new Map(),
      lastMetricsUpdate: Date.now()
    };
    
    // Processing state
    this.isProcessing = false;
    this.processingInterval = null;
    this.metricsInterval = null;
    this.healthCheckInterval = null;
    
    _instance = this;
    
    console.log('🌉 Real-Time Integration Bridge initialized');
  }
  
  /**
   * Initialize the bridge
   */
  async initialize() {
    try {
      console.log('🌉 Initializing Real-Time Integration Bridge...');
      
      // Start event processing
      this._startEventProcessing();
      
      // Start metrics collection
      this._startMetricsCollection();
      
      // Start health checks
      this._startHealthChecks();
      
      console.log('✅ Real-Time Integration Bridge initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time Integration Bridge:', error);
      return false;
    }
  }
  
  /**
   * Register a component with the bridge
   * @param {string} name - Component name
   * @param {object} component - Component instance
   * @param {string[]} events - Events to listen for
   */
  registerComponent(name, component, events = []) {
    if (!component) {
      throw new Error(`Cannot register null component: ${name}`);
    }
    
    console.log(`🔌 Registering component: ${name}`);
    
    // Store component
    this.components.set(name, component);
    
    // Initialize health status
    this.componentHealth.set(name, {
      status: 'healthy',
      lastCheck: Date.now(),
      errorCount: 0,
      lastError: null
    });
    
    // Initialize metrics
    this.metrics.componentCalls.set(name, 0);
    this.metrics.averageLatency.set(name, 0);
    this.metrics.errorCounts.set(name, 0);
    
    // Register event listeners
    if (component instanceof EventEmitter && events.length > 0) {
      events.forEach(event => {
        component.on(event, (data) => {
          this._handleComponentEvent(name, event, data);
        });
      });
      
      console.log(`✅ Registered ${events.length} events for component: ${name}`);
    }
    
    return true;
  }
  
  /**
   * Register all core components
   * @param {object} components - Object containing all components
   */
  registerCoreComponents(components) {
    const {
      blockchainConnector,
      awarenessSystem,
      learningSystem,
      reinforcementLearning,
      arbitrageSystem
    } = components;
    
    // Register blockchain connector
    if (blockchainConnector) {
      this.registerComponent('blockchainConnector', blockchainConnector, [
        'priceUpdate',
        'opportunityDetected',
        'blockUpdate',
        'error'
      ]);
    }
    
    // Register awareness system
    if (awarenessSystem) {
      this.registerComponent('awarenessSystem', awarenessSystem, [
        'awarenessUpdate',
        'environmentUpdate',
        'competitiveUpdate',
        'error'
      ]);
    }
    
    // Register learning system
    if (learningSystem) {
      this.registerComponent('learningSystem', learningSystem, [
        'learningUpdate',
        'modelUpdate',
        'experienceAdded',
        'error'
      ]);
    }
    
    // Register reinforcement learning
    if (reinforcementLearning) {
      this.registerComponent('reinforcementLearning', reinforcementLearning, [
        'trainingUpdate',
        'actionSelected',
        'rewardCalculated',
        'error'
      ]);
    }
    
    // Register arbitrage system
    if (arbitrageSystem) {
      this.registerComponent('arbitrageSystem', arbitrageSystem, [
        'opportunityProcessed',
        'opportunityExecuted',
        'statusUpdate',
        'error'
      ]);
    }
    
    console.log('✅ Core components registered successfully');
    return true;
  }
  
  /**
   * Send an event to a specific component
   * @param {string} targetComponent - Target component name
   * @param {string} eventType - Event type
   * @param {object} data - Event data
   */
  sendEvent(targetComponent, eventType, data) {
    const component = this.components.get(targetComponent);
    
    if (!component) {
      console.error(`❌ Component not found: ${targetComponent}`);
      return false;
    }
    
    // Add to event buffer for processing
    this.eventBuffer.push({
      targetComponent,
      eventType,
      data,
      timestamp: Date.now()
    });
    
    // Ensure buffer doesn't grow too large
    if (this.eventBuffer.length > this.config.eventBufferSize) {
      this.eventBuffer.shift();
    }
    
    return true;
  }
  
  /**
   * Broadcast an event to all components
   * @param {string} eventType - Event type
   * @param {object} data - Event data
   * @param {string[]} excludeComponents - Components to exclude
   */
  broadcastEvent(eventType, data, excludeComponents = []) {
    for (const [name, component] of this.components.entries()) {
      if (excludeComponents.includes(name)) continue;
      
      // Add to event buffer for processing
      this.eventBuffer.push({
        targetComponent: name,
        eventType,
        data,
        timestamp: Date.now(),
        isBroadcast: true
      });
    }
    
    // Ensure buffer doesn't grow too large
    while (this.eventBuffer.length > this.config.eventBufferSize) {
      this.eventBuffer.shift();
    }
    
    return true;
  }
  
  /**
   * Handle an event from a component
   * @param {string} componentName - Component name
   * @param {string} eventType - Event type
   * @param {object} data - Event data
   */
  _handleComponentEvent(componentName, eventType, data) {
    // Update metrics
    this._updateEventMetrics(componentName, eventType);
    
    // Route event to appropriate handlers
    switch (eventType) {
      case 'priceUpdate':
        this._handlePriceUpdate(componentName, data);
        break;
      case 'opportunityDetected':
        this._handleOpportunityDetected(componentName, data);
        break;
      case 'awarenessUpdate':
        this._handleAwarenessUpdate(componentName, data);
        break;
      case 'learningUpdate':
        this._handleLearningUpdate(componentName, data);
        break;
      case 'trainingUpdate':
        this._handleTrainingUpdate(componentName, data);
        break;
      case 'opportunityExecuted':
        this._handleOpportunityExecuted(componentName, data);
        break;
      case 'error':
        this._handleComponentError(componentName, data);
        break;
      default:
        // For other events, just emit them
        this.emit(`${componentName}:${eventType}`, data);
        break;
    }
  }
  
  /**
   * Start event processing
   */
  _startEventProcessing() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Process events at regular intervals
    this.processingInterval = setInterval(() => {
      this._processEventBuffer();
    }, this.config.eventProcessingInterval);
    
    console.log('✅ Event processing started');
  }
  
  /**
   * Stop event processing
   */
  _stopEventProcessing() {
    if (!this.isProcessing) return;
    
    this.isProcessing = false;
    
    // Clear interval
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    console.log('✅ Event processing stopped');
  }
  
  /**
   * Process event buffer
   */
  _processEventBuffer() {
    // Process up to 100 events at a time
    const batchSize = Math.min(100, this.eventBuffer.length);
    
    if (batchSize === 0) return;
    
    const events = this.eventBuffer.splice(0, batchSize);
    
    for (const event of events) {
      const { targetComponent, eventType, data, timestamp } = event;
      
      try {
        const component = this.components.get(targetComponent);
        
        if (!component) {
          console.warn(`⚠️ Component not found: ${targetComponent}`);
          continue;
        }
        
        // Call appropriate method on component
        if (component.handleEvent) {
          component.handleEvent(eventType, data);
        } else if (component.emit) {
          component.emit(eventType, data);
        }
        
        // Update metrics
        this.metrics.componentCalls.set(
          targetComponent,
          (this.metrics.componentCalls.get(targetComponent) || 0) + 1
        );
        
        // Calculate latency
        const latency = Date.now() - timestamp;
        const avgLatency = this.metrics.averageLatency.get(targetComponent) || 0;
        const newAvgLatency = avgLatency * 0.9 + latency * 0.1; // Exponential moving average
        this.metrics.averageLatency.set(targetComponent, newAvgLatency);
        
        // Increment events processed
        this.metrics.eventsProcessed++;
      } catch (error) {
        console.error(`❌ Error processing event for ${targetComponent}:`, error);
        
        // Update error metrics
        this.metrics.errorCounts.set(
          targetComponent,
          (this.metrics.errorCounts.get(targetComponent) || 0) + 1
        );
        
        // Update component health
        const health = this.componentHealth.get(targetComponent);
        if (health) {
          health.errorCount++;
          health.lastError = error.message;
          
          if (health.errorCount > 5) {
            health.status = 'degraded';
          }
          
          if (health.errorCount > 20) {
            health.status = 'critical';
          }
        }
      }
    }
  }
  
  /**
   * Start metrics collection
   */
  _startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this._collectMetrics();
    }, this.config.metricsInterval);
    
    console.log('✅ Metrics collection started');
  }
  
  /**
   * Start health checks
   */
  _startHealthChecks() {
    this.healthCheckInterval = setInterval(() => {
      this._checkComponentHealth();
    }, this.config.healthCheckInterval);
    
    console.log('✅ Health checks started');
  }
  
  /**
   * Collect metrics
   */
  _collectMetrics() {
    const now = Date.now();
    const elapsed = (now - this.metrics.lastMetricsUpdate) / 1000;
    
    // Calculate events per second
    const eventsPerSecond = this.metrics.eventsProcessed / elapsed;
    
    // Reset counter
    this.metrics.eventsProcessed = 0;
    this.metrics.lastMetricsUpdate = now;
    
    // Emit metrics event
    this.emit('metrics', {
      eventsPerSecond,
      eventsByType: Object.fromEntries(this.metrics.eventsByType),
      componentCalls: Object.fromEntries(this.metrics.componentCalls),
      averageLatency: Object.fromEntries(this.metrics.averageLatency),
      errorCounts: Object.fromEntries(this.metrics.errorCounts),
      timestamp: now
    });
    
    // Log metrics
    console.log(`📊 Events/sec: ${eventsPerSecond.toFixed(2)}, Components: ${this.components.size}, Buffer: ${this.eventBuffer.length}`);
  }
  
  /**
   * Check component health
   */
  _checkComponentHealth() {
    for (const [name, component] of this.components.entries()) {
      try {
        // Check if component has a getStatus method
        if (component.getStatus) {
          const status = component.getStatus();
          
          // Update health status
          const health = this.componentHealth.get(name);
          if (health) {
            health.lastCheck = Date.now();
            
            // Reset error count if component is healthy
            if (status.isActive !== false) {
              health.errorCount = Math.max(0, health.errorCount - 1);
              
              if (health.errorCount < 3) {
                health.status = 'healthy';
              }
            }
          }
        }
      } catch (error) {
        console.error(`❌ Health check failed for ${name}:`, error);
        
        // Update health status
        const health = this.componentHealth.get(name);
        if (health) {
          health.errorCount++;
          health.lastError = error.message;
          health.status = 'degraded';
        }
      }
    }
    
    // Emit health event
    this.emit('health', {
      componentHealth: Object.fromEntries([...this.componentHealth.entries()].map(([name, health]) => [name, health.status])),
      timestamp: Date.now()
    });
  }
  
  /**
   * Update event metrics
   * @param {string} componentName - Component name
   * @param {string} eventType - Event type
   */
  _updateEventMetrics(componentName, eventType) {
    const eventKey = `${componentName}:${eventType}`;
    this.metrics.eventsByType.set(
      eventKey,
      (this.metrics.eventsByType.get(eventKey) || 0) + 1
    );
  }
  
  /**
   * Handle price update event
   * @param {string} componentName - Component name
   * @param {object} data - Price update data
   */
  _handlePriceUpdate(componentName, data) {
    // Forward to awareness system
    const awarenessSystem = this.components.get('awarenessSystem');
    if (awarenessSystem && awarenessSystem.updateMarketState) {
      awarenessSystem.updateMarketState({ priceUpdates: [data] });
    }
    
    // Forward to arbitrage system
    const arbitrageSystem = this.components.get('arbitrageSystem');
    if (arbitrageSystem && arbitrageSystem.handlePriceUpdate) {
      arbitrageSystem.handlePriceUpdate(data);
    }
    
    // Emit event
    this.emit('priceUpdate', data);
  }
  
  /**
   * Handle opportunity detected event
   * @param {string} componentName - Component name
   * @param {object} data - Opportunity data
   */
  _handleOpportunityDetected(componentName, data) {
    // Forward to arbitrage system
    const arbitrageSystem = this.components.get('arbitrageSystem');
    if (arbitrageSystem && arbitrageSystem.processOpportunity) {
      arbitrageSystem.processOpportunity(data);
    }
    
    // Emit event
    this.emit('opportunityDetected', data);
  }
  
  /**
   * Handle awareness update event
   * @param {string} componentName - Component name
   * @param {object} data - Awareness update data
   */
  _handleAwarenessUpdate(componentName, data) {
    // Forward to arbitrage system
    const arbitrageSystem = this.components.get('arbitrageSystem');
    if (arbitrageSystem && arbitrageSystem.handleAwarenessUpdate) {
      arbitrageSystem.handleAwarenessUpdate(data);
    }
    
    // Emit event
    this.emit('awarenessUpdate', data);
  }
  
  /**
   * Handle learning update event
   * @param {string} componentName - Component name
   * @param {object} data - Learning update data
   */
  _handleLearningUpdate(componentName, data) {
    // Forward to arbitrage system
    const arbitrageSystem = this.components.get('arbitrageSystem');
    if (arbitrageSystem && arbitrageSystem.handleLearningUpdate) {
      arbitrageSystem.handleLearningUpdate(data);
    }
    
    // Emit event
    this.emit('learningUpdate', data);
  }
  
  /**
   * Handle training update event
   * @param {string} componentName - Component name
   * @param {object} data - Training update data
   */
  _handleTrainingUpdate(componentName, data) {
    // Forward to learning system
    const learningSystem = this.components.get('learningSystem');
    if (learningSystem && learningSystem.handleTrainingUpdate) {
      learningSystem.handleTrainingUpdate(data);
    }
    
    // Emit event
    this.emit('trainingUpdate', data);
  }
  
  /**
   * Handle opportunity executed event
   * @param {string} componentName - Component name
   * @param {object} data - Execution data
   */
  _handleOpportunityExecuted(componentName, data) {
    // Forward to learning system
    const learningSystem = this.components.get('learningSystem');
    if (learningSystem && learningSystem.learnFromExecution) {
      learningSystem.learnFromExecution(data.opportunity, data.strategy, data.result);
    }
    
    // Forward to reinforcement learning
    const reinforcementLearning = this.components.get('reinforcementLearning');
    if (reinforcementLearning && reinforcementLearning.addExperience) {
      const state = this._convertOpportunityToState(data.opportunity);
      const action = data.strategy.action;
      const reward = data.result.success ? data.result.actualProfit / 10000 : -0.1;
      reinforcementLearning.addExperience(state, action, reward, null);
    }
    
    // Emit event
    this.emit('opportunityExecuted', data);
  }
  
  /**
   * Handle component error event
   * @param {string} componentName - Component name
   * @param {object} data - Error data
   */
  _handleComponentError(componentName, data) {
    console.error(`❌ Error in component ${componentName}:`, data.message || data);
    
    // Update component health
    const health = this.componentHealth.get(componentName);
    if (health) {
      health.errorCount++;
      health.lastError = data.message || JSON.stringify(data);
      
      if (health.errorCount > 5) {
        health.status = 'degraded';
      }
      
      if (health.errorCount > 20) {
        health.status = 'critical';
      }
    }
    
    // Update error metrics
    this.metrics.errorCounts.set(
      componentName,
      (this.metrics.errorCounts.get(componentName) || 0) + 1
    );
    
    // Emit event
    this.emit('componentError', {
      componentName,
      error: data
    });
  }
  
  /**
   * Convert opportunity to state for reinforcement learning
   * @param {object} opportunity - Opportunity data
   * @returns {object} State object
   */
  _convertOpportunityToState(opportunity) {
    return {
      profit: opportunity.estimatedProfit / 100000, // Normalize to 0-1
      risk: 0.5, // Default risk
      opportunity: opportunity.spread
    };
  }
  
  /**
   * Get bridge status
   * @returns {object} Bridge status
   */
  getStatus() {
    return {
      isActive: this.isProcessing,
      componentCount: this.components.size,
      componentHealth: Object.fromEntries([...this.componentHealth.entries()].map(([name, health]) => [name, health.status])),
      eventBufferSize: this.eventBuffer.length,
      metrics: {
        eventsProcessed: this.metrics.eventsProcessed,
        componentCalls: Object.fromEntries(this.metrics.componentCalls),
        averageLatency: Object.fromEntries(this.metrics.averageLatency),
        errorCounts: Object.fromEntries(this.metrics.errorCounts)
      }
    };
  }
  
  /**
   * Shutdown the bridge
   */
  async shutdown() {
    console.log('🛑 Shutting down Real-Time Integration Bridge...');
    
    // Stop event processing
    this._stopEventProcessing();
    
    // Clear intervals
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    // Process remaining events
    await this._processEventBuffer();
    
    console.log('✅ Real-Time Integration Bridge shut down successfully');
    return true;
  }
}

export { RealTimeIntegrationBridge }; 