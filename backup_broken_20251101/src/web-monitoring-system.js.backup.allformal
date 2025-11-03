#!/usr/bin/env node

/**
 * 🖥️ WEB MONITORING SYSTEM
 * ========================
 * 
 * Extensive web monitoring and agent control interface
 * - Real-time agent status monitoring
 * - Opportunity tracking and visualization
 * - Performance metrics and analytics
 * - Agent control and configuration
 */

import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

// Load environment variables
dotenv.config();

// Create event emitter for monitoring events
export const monitoringEvents = new EventEmitter();

// Constants
const DEFAULT_PORT = parseInt(process.env.MONITOR_PORT || '3000');
const DATA_UPDATE_INTERVAL = parseInt(process.env.DATA_UPDATE_INTERVAL || '5000');
const PERFORMANCE_METRICS_INTERVAL = parseInt(process.env.PERFORMANCE_METRICS_INTERVAL || '60000');
const MAX_HISTORY_ITEMS = parseInt(process.env.MAX_HISTORY_ITEMS || '100');
const DATA_DIR = path.join(process.cwd(), 'data', 'monitoring');

/**
 * 🖥️ Web Monitoring System
 */
export class WebMonitoringSystem {
  constructor(config = {}) {
    this.config = {
      port: DEFAULT_PORT,
      dataUpdateInterval: DATA_UPDATE_INTERVAL,
      performanceMetricsInterval: PERFORMANCE_METRICS_INTERVAL,
      maxHistoryItems: MAX_HISTORY_ITEMS,
      dataDir: DATA_DIR,
      enableSocketIO: true,
      enableRESTAPI: true,
      enableFileLogging: true,
      ...config
    };

    // Initialize state
    this.app = null;
    this.server = null;
    this.io = null;
    this.isInitialized = false;
    this.agentFactory = null;
    this.telegramSystem = null;
    this.opportunityAlerts = null;

    // Data storage
    this.agentStatus = new Map();
    this.opportunities = [];
    this.performanceMetrics = {
      system: {},
      agents: new Map(),
      opportunities: {
        detected: 0,
        executed: 0,
        failed: 0,
        expired: 0,
        totalProfitUsd: 0,
        avgProfitUsd: 0,
        successRate: 0
      },
      history: []
    };

    // Intervals
    this.dataUpdateInterval = null;
    this.performanceMetricsInterval = null;
  }

  /**
   * 🚀 Initialize the monitoring system
   */
  async initialize(agentFactory, telegramSystem, opportunityAlerts) {
    console.log('🖥️ Initializing Web Monitoring System...');
    
    try {
      // Store references to other systems
      this.agentFactory = agentFactory;
      this.telegramSystem = telegramSystem;
      this.opportunityAlerts = opportunityAlerts;
      
      // Create data directory if it doesn't exist
      await fs.mkdir(this.config.dataDir, { recursive: true });
      
      // Initialize Express app
      this.app = express();
      this.server = http.createServer(this.app);
      
      // Set up middleware
      this.setupMiddleware();
      
      // Set up routes
      this.setupRoutes();
      
      // Initialize Socket.IO if enabled
      if (this.config.enableSocketIO) {
        this.io = new SocketIOServer(this.server);
        this.setupSocketIO();
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start the server
      await this.startServer();
      
      // Start data update interval
      this.startDataUpdateInterval();
      
      // Start performance metrics interval
      this.startPerformanceMetricsInterval();
      
      this.isInitialized = true;
      console.log('✅ Web Monitoring System initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Web Monitoring System:', error);
      return false;
    }
  }

  /**
   * 🔄 Set up middleware
   */
  setupMiddleware() {
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Serve static files
    this.app.use(express.static(path.join(process.cwd(), 'public')));
    
    // CORS middleware
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * 🔄 Set up routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });
    
    // System status endpoint
    this.app.get('/api/status', (req, res) => {
      res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: Date.now(),
        agents: Array.from(this.agentStatus.values())
      });
    });
    
    // Agent status endpoint
    this.app.get('/api/agents', (req, res) => {
      res.status(200).json({
        agents: Array.from(this.agentStatus.values())
      });
    });
    
    // Individual agent status endpoint
    this.app.get('/api/agents/:agentId', (req, res) => {
      const { agentId } = req.params;
      const agentStatus = this.agentStatus.get(agentId);
      
      if (!agentStatus) {
        return res.status(404).json({ error: 'Agent not found' });
      }
      
      res.status(200).json(agentStatus);
    });
    
    // Opportunities endpoint
    this.app.get('/api/opportunities', (req, res) => {
      res.status(200).json({
        opportunities: this.opportunities
      });
    });
    
    // Performance metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      res.status(200).json(this.performanceMetrics);
    });
    
    // Agent control endpoints
    this.app.post('/api/agents/:agentId/start', async (req, res) => {
      const { agentId } = req.params;
      try {
        const result = await this.startAgent(agentId);
        res.status(200).json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.post('/api/agents/:agentId/stop', async (req, res) => {
      const { agentId } = req.params;
      try {
        const result = await this.stopAgent(agentId);
        res.status(200).json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Opportunity control endpoints
    this.app.post('/api/opportunities/:opportunityId/execute', async (req, res) => {
      const { opportunityId } = req.params;
      try {
        const result = await this.executeOpportunity(opportunityId);
        res.status(200).json({ success: true, result });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Serve the main dashboard
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
    });
  }

  /**
   * 🔄 Set up Socket.IO
   */
  setupSocketIO() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);
      
      // Send initial data
      socket.emit('init', {
        agents: Array.from(this.agentStatus.values()),
        opportunities: this.opportunities,
        metrics: this.performanceMetrics
      });
      
      // Handle agent control commands
      socket.on('startAgent', async (agentId) => {
        try {
          const result = await this.startAgent(agentId);
          socket.emit('agentStarted', { agentId, success: true, result });
        } catch (error) {
          socket.emit('agentStarted', { agentId, success: false, error: error.message });
        }
      });
      
      socket.on('stopAgent', async (agentId) => {
        try {
          const result = await this.stopAgent(agentId);
          socket.emit('agentStopped', { agentId, success: true, result });
        } catch (error) {
          socket.emit('agentStopped', { agentId, success: false, error: error.message });
        }
      });
      
      // Handle opportunity control commands
      socket.on('executeOpportunity', async (opportunityId) => {
        try {
          const result = await this.executeOpportunity(opportunityId);
          socket.emit('opportunityExecuted', { opportunityId, success: true, result });
        } catch (error) {
          socket.emit('opportunityExecuted', { opportunityId, success: false, error: error.message });
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });
  }

  /**
   * 🔄 Set up event listeners
   */
  setupEventListeners() {
    // Listen for agent factory events
    if (this.agentFactory) {
      this.agentFactory.on('agentCreated', (data) => {
        this.updateAgentStatus(data.agent.id, {
          id: data.agent.id,
          name: data.agent.name || data.agent.id,
          status: 'created',
          createdAt: Date.now(),
          characterFile: data.character_file,
          learningConfig: data.learning_config
        });
      });
      
      this.agentFactory.on('agentStarted', (data) => {
        this.updateAgentStatus(data.agentId, {
          status: 'running',
          startedAt: Date.now()
        });
      });
      
      this.agentFactory.on('agentStopped', (data) => {
        this.updateAgentStatus(data.agentId, {
          status: 'stopped',
          stoppedAt: Date.now()
        });
      });
    }
    
    // Listen for opportunity alert events
    if (this.opportunityAlerts) {
      monitoringEvents.on('opportunityDetected', (opportunity) => {
        this.addOpportunity(opportunity);
      });
      
      monitoringEvents.on('opportunityExecuted', (result) => {
        this.updateOpportunity(result.opportunityId, {
          status: result.success ? 'executed' : 'failed',
          executedAt: Date.now(),
          executionResult: result
        });
        
        // Update metrics
        this.updateOpportunityMetrics(result);
      });
      
      monitoringEvents.on('opportunityExpired', (opportunityId) => {
        this.updateOpportunity(opportunityId, {
          status: 'expired',
          expiredAt: Date.now()
        });
        
        // Update metrics
        this.performanceMetrics.opportunities.expired++;
        this.emitMetricsUpdate();
      });
    }
  }

  /**
   * 🚀 Start the server
   */
  async startServer() {
    return new Promise((resolve, reject) => {
      try {
        this.server.listen(this.config.port, () => {
          console.log(`🚀 Web Monitoring System server listening on port ${this.config.port}`);
          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 🔄 Start data update interval
   */
  startDataUpdateInterval() {
    this.dataUpdateInterval = setInterval(() => {
      this.updateAgentStatuses();
      this.emitDataUpdate();
    }, this.config.dataUpdateInterval);
  }

  /**
   * 🔄 Start performance metrics interval
   */
  startPerformanceMetricsInterval() {
    this.performanceMetricsInterval = setInterval(() => {
      this.updatePerformanceMetrics();
      this.emitMetricsUpdate();
      
      // Save metrics to file if enabled
      if (this.config.enableFileLogging) {
        this.saveMetricsToFile();
      }
    }, this.config.performanceMetricsInterval);
  }

  /**
   * 🔄 Update agent statuses
   */
  updateAgentStatuses() {
    if (!this.agentFactory) return;
    
    // Get current agents from factory
    const agents = this.agentFactory.agents;
    
    for (const [agentId, agent] of agents.entries()) {
      // Get agent status
      const status = agent.getStatus ? agent.getStatus() : { status: 'unknown' };
      
      // Update agent status
      this.updateAgentStatus(agentId, {
        ...status,
        lastUpdated: Date.now()
      });
    }
  }

  /**
   * 🔄 Update agent status
   */
  updateAgentStatus(agentId, status) {
    // Get existing status or create new one
    const existingStatus = this.agentStatus.get(agentId) || {
      id: agentId,
      name: agentId,
      status: 'unknown',
      createdAt: Date.now()
    };
    
    // Update status
    this.agentStatus.set(agentId, {
      ...existingStatus,
      ...status,
      lastUpdated: Date.now()
    });
    
    // Emit update event
    this.emitAgentStatusUpdate(agentId);
  }

  /**
   * 🔄 Add opportunity
   */
  addOpportunity(opportunity) {
    // Add opportunity to list
    this.opportunities.unshift({
      ...opportunity,
      detectedAt: Date.now()
    });
    
    // Limit list size
    if (this.opportunities.length > this.config.maxHistoryItems) {
      this.opportunities = this.opportunities.slice(0, this.config.maxHistoryItems);
    }
    
    // Update metrics
    this.performanceMetrics.opportunities.detected++;
    
    // Emit update event
    this.emitOpportunitiesUpdate();
  }

  /**
   * 🔄 Update opportunity
   */
  updateOpportunity(opportunityId, update) {
    // Find opportunity
    const index = this.opportunities.findIndex(opp => opp.id === opportunityId);
    if (index === -1) return;
    
    // Update opportunity
    this.opportunities[index] = {
      ...this.opportunities[index],
      ...update
    };
    
    // Emit update event
    this.emitOpportunitiesUpdate();
  }

  /**
   * 🔄 Update opportunity metrics
   */
  updateOpportunityMetrics(result) {
    if (result.success) {
      this.performanceMetrics.opportunities.executed++;
      this.performanceMetrics.opportunities.totalProfitUsd += result.netProfitUsd || 0;
    } else {
      this.performanceMetrics.opportunities.failed++;
    }
    
    // Calculate success rate
    const total = this.performanceMetrics.opportunities.executed + this.performanceMetrics.opportunities.failed;
    this.performanceMetrics.opportunities.successRate = total > 0 ? 
      this.performanceMetrics.opportunities.executed / total : 0;
    
    // Calculate average profit
    this.performanceMetrics.opportunities.avgProfitUsd = this.performanceMetrics.opportunities.executed > 0 ?
      this.performanceMetrics.opportunities.totalProfitUsd / this.performanceMetrics.opportunities.executed : 0;
  }

  /**
   * 🔄 Update performance metrics
   */
  updatePerformanceMetrics() {
    if (!this.agentFactory) return;
    
    // Get system status from agent factory
    const factoryStatus = this.agentFactory.getStatus ? this.agentFactory.getStatus() : {};
    
    // Update system metrics
    this.performanceMetrics.system = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      agents: this.agentStatus.size,
      agentsActive: Array.from(this.agentStatus.values()).filter(a => a.status === 'running').length,
      ...factoryStatus
    };
    
    // Add to history
    this.performanceMetrics.history.unshift({
      timestamp: Date.now(),
      system: { ...this.performanceMetrics.system },
      opportunities: { ...this.performanceMetrics.opportunities }
    });
    
    // Limit history size
    if (this.performanceMetrics.history.length > this.config.maxHistoryItems) {
      this.performanceMetrics.history = this.performanceMetrics.history.slice(0, this.config.maxHistoryItems);
    }
  }

  /**
   * 🔄 Emit data update
   */
  emitDataUpdate() {
    if (!this.io) return;
    
    this.io.emit('dataUpdate', {
      timestamp: Date.now(),
      agents: Array.from(this.agentStatus.values()),
      opportunities: this.opportunities
    });
  }

  /**
   * 🔄 Emit agent status update
   */
  emitAgentStatusUpdate(agentId) {
    if (!this.io) return;
    
    const status = this.agentStatus.get(agentId);
    if (!status) return;
    
    this.io.emit('agentStatusUpdate', status);
  }

  /**
   * 🔄 Emit opportunities update
   */
  emitOpportunitiesUpdate() {
    if (!this.io) return;
    
    this.io.emit('opportunitiesUpdate', this.opportunities);
  }

  /**
   * 🔄 Emit metrics update
   */
  emitMetricsUpdate() {
    if (!this.io) return;
    
    this.io.emit('metricsUpdate', this.performanceMetrics);
  }

  /**
   * 💾 Save metrics to file
   */
  async saveMetricsToFile() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filePath = path.join(this.config.dataDir, `metrics-${timestamp}.json`);
      
      await fs.writeFile(filePath, JSON.stringify(this.performanceMetrics, null, 2));
    } catch (error) {
      console.error('❌ Failed to save metrics to file:', error);
    }
  }

  /**
   * 🚀 Start agent
   */
  async startAgent(agentId) {
    if (!this.agentFactory) {
      throw new Error('Agent factory not available');
    }
    
    const agent = this.agentFactory.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    if (!agent.start) {
      throw new Error(`Agent ${agentId} does not support start operation`);
    }
    
    await agent.start();
    
    this.updateAgentStatus(agentId, {
      status: 'running',
      startedAt: Date.now()
    });
    
    return { success: true };
  }

  /**
   * 🛑 Stop agent
   */
  async stopAgent(agentId) {
    if (!this.agentFactory) {
      throw new Error('Agent factory not available');
    }
    
    const agent = this.agentFactory.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    
    if (!agent.stop) {
      throw new Error(`Agent ${agentId} does not support stop operation`);
    }
    
    await agent.stop();
    
    this.updateAgentStatus(agentId, {
      status: 'stopped',
      stoppedAt: Date.now()
    });
    
    return { success: true };
  }

  /**
   * ▶️ Execute opportunity
   */
  async executeOpportunity(opportunityId) {
    // Find opportunity
    const opportunity = this.opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) {
      throw new Error(`Opportunity not found: ${opportunityId}`);
    }
    
    // Check if opportunity is already executed or expired
    if (opportunity.status === 'executed' || opportunity.status === 'failed') {
      throw new Error(`Opportunity ${opportunityId} already executed`);
    }
    
    if (opportunity.status === 'expired') {
      throw new Error(`Opportunity ${opportunityId} expired`);
    }
    
    // Execute opportunity
    // In a real implementation, this would call the appropriate agent or system
    // For now, we'll simulate execution
    
    const success = Math.random() > 0.2; // 80% success rate
    const executionResult = success ? {
      opportunityId,
      success: true,
      actualProfitUsd: opportunity.profitUsd * (0.8 + Math.random() * 0.4), // 80-120% of estimated
      actualProfitPercent: opportunity.profitPercent * (0.8 + Math.random() * 0.4),
      gasUsedUsd: opportunity.profitUsd * 0.05, // 5% gas cost
      netProfitUsd: opportunity.profitUsd * 0.9, // 90% of estimated after gas
      executionTimeMs: 1000 + Math.random() * 4000,
      transactionUrl: `https://arbiscan.io/tx/0x${Math.random().toString(16).substring(2)}`
    } : {
      opportunityId,
      success: false,
      failureReason: 'Execution failed due to market conditions',
      gasUsedUsd: opportunity.profitUsd * 0.02, // 2% gas cost on failure
      lossUsd: opportunity.profitUsd * 0.02,
      executionTimeMs: 500 + Math.random() * 2000
    };
    
    // Update opportunity
    this.updateOpportunity(opportunityId, {
      status: success ? 'executed' : 'failed',
      executedAt: Date.now(),
      executionResult
    });
    
    // Update metrics
    this.updateOpportunityMetrics(executionResult);
    
    // Emit event
    monitoringEvents.emit('opportunityExecuted', executionResult);
    
    return executionResult;
  }

  /**
   * 🧹 Clean up resources
   */
  async shutdown() {
    console.log('🧹 Shutting down Web Monitoring System...');
    
    // Clear intervals
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }
    
    if (this.performanceMetricsInterval) {
      clearInterval(this.performanceMetricsInterval);
    }
    
    // Close server
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }
    
    console.log('✅ Web Monitoring System shut down');
    return true;
  }
}

/**
 * 🚀 Create and initialize a web monitoring system
 */
export async function createWebMonitoringSystem(agentFactory, telegramSystem, opportunityAlerts, config = {}) {
  const system = new WebMonitoringSystem(config);
  await system.initialize(agentFactory, telegramSystem, opportunityAlerts);
  return system;
}

// Run as standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log('🚀 Starting Web Monitoring System in standalone mode...');
      
      const system = new WebMonitoringSystem();
      await system.initialize();
      
      // Add some test data
      for (let i = 0; i < 5; i++) {
        system.updateAgentStatus(`agent-${i}`, {
          id: `agent-${i}`,
          name: `Test Agent ${i}`,
          status: i % 2 === 0 ? 'running' : 'stopped',
          createdAt: Date.now() - 3600000,
          characterFile: `character-${i}.json`,
          learningConfig: {
            type: 'ADVANCED',
            systems: ['bounded-a2c', 'policy-distillation']
          }
        });
        
        system.addOpportunity({
          id: `opp-${i}`,
          chain: 'Arbitrum',
          dexes: ['Uniswap V3', 'SushiSwap'],
          path: ['WETH', 'USDC', 'WETH'],
          profitUsd: 100 + Math.random() * 500,
          profitPercent: 0.01 + Math.random() * 0.05,
          confidence: 0.7 + Math.random() * 0.3,
          status: 'pending'
        });
      }
      
      // Keep process alive
      console.log('🔄 Press Ctrl+C to exit...');
      
      // Handle shutdown
      process.on('SIGINT', async () => {
        console.log('Received SIGINT, shutting down...');
        await system.shutdown();
        process.exit(0);
      });
      
    } catch (error) {
      console.error('❌ Error in standalone mode:', error);
      process.exit(1);
    }
  })();
} 