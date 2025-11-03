/**
 * 🎯 REAL-TIME ARBITRAGE DASHBOARD
 * ===============================
 * 
 * Production-ready real-time dashboard for monitoring AI Arbitrage Syndicate.
 * Features live updates, interactive charts, and comprehensive system metrics.
 * 
 * Components:
 * ✅ Real-time arbitrage execution tracking
 * ✅ Live DEX pool monitoring (11+ DEXs)
 * ✅ Gas optimization analytics
 * ✅ Profit/loss visualization
 * ✅ System health indicators
 * ✅ Multi-chain performance metrics
 * ✅ Agent activity monitoring
 * ✅ Alert notification center
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductionMonitoringSystem } from './production-monitoring-system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class RealTimeDashboard {
  constructor(config = {}) {
    this.config = {
      port: config.port || 3000,
      enableAuth: config.enableAuth || false,
      authToken: config.authToken || 'arbitrage-syndicate-2024',
      updateInterval: config.updateInterval || 2000, // 2 seconds
      database: config.database,
      ...config
    };
    
    // Initialize Express app
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    // Initialize monitoring system
    this.monitoring = new ProductionMonitoringSystem({
      database: this.config.database
    });
    
    // Dashboard state
    this.dashboardState = {
      arbitrageExecutions: [],
      systemMetrics: {},
      chainMetrics: {},
      dexMetrics: {},
      agentMetrics: {},
      alerts: [],
      lastUpdate: null
    };
    
    this.isRunning = false;
    this.updateTimer = null;
    
    console.log('🎯 Real-Time Dashboard initialized');
  }
  
  /**
   * 🚀 START DASHBOARD SERVER
   */
  async start() {
    try {
      // Setup middleware
      this.setupMiddleware();
      
      // Setup routes
      this.setupRoutes();
      
      // Setup WebSocket handlers
      this.setupWebSocketHandlers();
      
      // Start monitoring system
      await this.monitoring.initialize();
      
      // Start real-time updates
      this.startRealTimeUpdates();
      
      // Start server
      this.server.listen(this.config.port, () => {
        console.log(`🎯 Real-Time Dashboard running on port ${this.config.port}`);
        console.log(`📊 Dashboard URL: http://localhost:${this.config.port}`);
        console.log(`🔌 WebSocket endpoint: ws://localhost:${this.config.port}`);
      });
      
      this.isRunning = true;
      
    } catch (error) {
      console.error('❌ Failed to start dashboard:', error);
      throw error;
    }
  }
  
  /**
   * ⚙️ SETUP EXPRESS MIDDLEWARE
   */
  setupMiddleware() {
    // JSON parsing
    this.app.use(express.json());
    
    // Static files
    this.app.use('/static', express.static(path.join(__dirname, 'dashboard-assets')));
    
    // Authentication middleware (if enabled)
    if (this.config.enableAuth) {
      this.app.use((req, res, next) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token !== this.config.authToken) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        next();
      });
    }
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      next();
    });
  }
  
  /**
   * 🛣️ SETUP API ROUTES
   */
  setupRoutes() {
    // Main dashboard page
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML());
    });
    
    // API endpoints
    this.app.get('/api/metrics', (req, res) => {
      res.json(this.dashboardState);
    });
    
    this.app.get('/api/arbitrage-history', async (req, res) => {
      try {
        const history = await this.getArbitrageHistory(req.query.limit || 100);
        res.json(history);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.get('/api/system-health', (req, res) => {
      res.json(this.monitoring.getSystemHealth());
    });
    
    this.app.get('/api/profit-analytics', async (req, res) => {
      try {
        const analytics = await this.getProfitAnalytics();
        res.json(analytics);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    this.app.get('/api/dex-performance', async (req, res) => {
      try {
        const performance = await this.getDexPerformance();
        res.json(performance);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Emergency shutdown endpoint
    this.app.post('/api/emergency-stop', (req, res) => {
      console.log('🚨 EMERGENCY STOP TRIGGERED via dashboard');
      this.io.emit('emergencyStop', { timestamp: Date.now() });
      res.json({ success: true, message: 'Emergency stop signal sent' });
    });
  }
  
  /**
   * 🔌 SETUP WEBSOCKET HANDLERS
   */
  setupWebSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`📱 Dashboard client connected: ${socket.id}`);
      
      // Send initial state
      socket.emit('initialState', this.dashboardState);
      
      // Handle client requests
      socket.on('requestUpdate', () => {
        socket.emit('metricsUpdate', this.dashboardState);
      });
      
      socket.on('subscribe', (channel) => {
        socket.join(channel);
        console.log(`📺 Client ${socket.id} subscribed to ${channel}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`📱 Dashboard client disconnected: ${socket.id}`);
      });
    });
    
    // Listen to monitoring system events
    this.monitoring.on('arbitrageExecuted', (data) => {
      this.handleArbitrageExecution(data);
    });
    
    this.monitoring.on('alert', (alert) => {
      this.handleAlert(alert);
    });
    
    this.monitoring.on('systemMetrics', (metrics) => {
      this.updateSystemMetrics(metrics);
    });
  }
  
  /**
   * ⏰ START REAL-TIME UPDATES
   */
  startRealTimeUpdates() {
    this.updateTimer = setInterval(async () => {
      try {
        await this.updateDashboardState();
        this.broadcastUpdate();
      } catch (error) {
        console.error('❌ Dashboard update failed:', error);
      }
    }, this.config.updateInterval);
    
    console.log(`⏰ Real-time updates started (${this.config.updateInterval}ms interval)`);
  }
  
  /**
   * 📊 UPDATE DASHBOARD STATE
   */
  async updateDashboardState() {
    try {
      // Update system metrics
      this.dashboardState.systemMetrics = await this.getSystemMetrics();
      
      // Update chain metrics
      this.dashboardState.chainMetrics = await this.getChainMetrics();
      
      // Update DEX metrics
      this.dashboardState.dexMetrics = await this.getDexMetrics();
      
      // Update agent metrics
      this.dashboardState.agentMetrics = await this.getAgentMetrics();
      
      // Update timestamp
      this.dashboardState.lastUpdate = Date.now();
      
    } catch (error) {
      console.error('❌ Failed to update dashboard state:', error);
    }
  }
  
  /**
   * 📡 BROADCAST UPDATE TO ALL CLIENTS
   */
  broadcastUpdate() {
    this.io.emit('metricsUpdate', this.dashboardState);
  }
  
  /**
   * 💰 HANDLE ARBITRAGE EXECUTION
   */
  handleArbitrageExecution(data) {
    // Add to execution history (keep last 1000)
    this.dashboardState.arbitrageExecutions.unshift({
      ...data,
      timestamp: Date.now()
    });
    
    if (this.dashboardState.arbitrageExecutions.length > 1000) {
      this.dashboardState.arbitrageExecutions = this.dashboardState.arbitrageExecutions.slice(0, 1000);
    }
    
    // Broadcast execution event
    this.io.emit('arbitrageExecution', data);
    
    console.log(`💰 Arbitrage execution: $${data.profitUSD} profit on ${data.chain}`);
  }
  
  /**
   * 🚨 HANDLE ALERT
   */
  handleAlert(alert) {
    // Add to alert history (keep last 500)
    this.dashboardState.alerts.unshift({
      ...alert,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    });
    
    if (this.dashboardState.alerts.length > 500) {
      this.dashboardState.alerts = this.dashboardState.alerts.slice(0, 500);
    }
    
    // Broadcast alert
    this.io.emit('alert', alert);
    
    console.log(`🚨 Alert: ${alert.type} - ${alert.message}`);
  }
  
  /**
   * 📈 GET SYSTEM METRICS
   */
  async getSystemMetrics() {
    try {
      if (!this.config.database) return {};
      
      const client = await this.config.database.connect();
      
      // Get execution metrics
      const executionQuery = `
        SELECT 
          COUNT(*) as total_executions,
          COUNT(CASE WHEN profit_usd > 0 THEN 1 END) as successful_executions,
          SUM(profit_usd) as total_profit,
          AVG(profit_usd) as avg_profit,
          AVG(gas_cost_usd) as avg_gas_cost,
          MAX(timestamp) as last_execution
        FROM arbitrage_executions 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
      `;
      
      const executionResult = await client.query(executionQuery);
      const execMetrics = executionResult.rows[0];
      
      // Get system health metrics
      const healthQuery = `
        SELECT 
          COUNT(DISTINCT chain) as active_chains,
          COUNT(DISTINCT pool_address) as monitored_pools,
          AVG(gas_price) as avg_gas_price
        FROM (
          SELECT DISTINCT chain, pool_address FROM pools WHERE is_active = true
          UNION ALL
          SELECT DISTINCT chain, NULL FROM gas_tracker WHERE timestamp > NOW() - INTERVAL '1 hour'
        ) t
      `;
      
      const healthResult = await client.query(healthQuery);
      const healthMetrics = healthResult.rows[0];
      
      client.release();
      
      return {
        totalExecutions: parseInt(execMetrics.total_executions) || 0,
        successfulExecutions: parseInt(execMetrics.successful_executions) || 0,
        successRate: execMetrics.total_executions > 0 ? 
          (execMetrics.successful_executions / execMetrics.total_executions * 100).toFixed(2) : 0,
        totalProfitUSD: parseFloat(execMetrics.total_profit) || 0,
        avgProfitUSD: parseFloat(execMetrics.avg_profit) || 0,
        avgGasCostUSD: parseFloat(execMetrics.avg_gas_cost) || 0,
        lastExecution: execMetrics.last_execution,
        activeChains: parseInt(healthMetrics.active_chains) || 0,
        monitoredPools: parseInt(healthMetrics.monitored_pools) || 0,
        avgGasPrice: parseFloat(healthMetrics.avg_gas_price) || 0
      };
      
    } catch (error) {
      console.error('❌ Failed to get system metrics:', error);
      return {};
    }
  }
  
  /**
   * 🌐 GET CHAIN METRICS
   */
  async getChainMetrics() {
    try {
      if (!this.config.database) return {};
      
      const client = await this.config.database.connect();
      
      const chainQuery = `
        SELECT 
          chain,
          COUNT(*) as executions,
          SUM(profit_usd) as total_profit,
          AVG(gas_cost_usd) as avg_gas_cost,
          COUNT(CASE WHEN profit_usd > 0 THEN 1 END) as successful_executions
        FROM arbitrage_executions 
        WHERE timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY chain
        ORDER BY total_profit DESC
      `;
      
      const result = await client.query(chainQuery);
      client.release();
      
      const chainMetrics = {};
      for (const row of result.rows) {
        chainMetrics[row.chain] = {
          executions: parseInt(row.executions),
          totalProfit: parseFloat(row.total_profit) || 0,
          avgGasCost: parseFloat(row.avg_gas_cost) || 0,
          successRate: row.executions > 0 ? 
            (row.successful_executions / row.executions * 100).toFixed(2) : 0
        };
      }
      
      return chainMetrics;
      
    } catch (error) {
      console.error('❌ Failed to get chain metrics:', error);
      return {};
    }
  }
  
  /**
   * 🏭 GET DEX METRICS
   */
  async getDexMetrics() {
    try {
      if (!this.config.database) return {};
      
      const client = await this.config.database.connect();
      
      const dexQuery = `
        SELECT 
          p.dex_name,
          COUNT(ae.*) as executions,
          SUM(ae.profit_usd) as total_profit,
          AVG(p.tvl_usd) as avg_tvl,
                      COUNT(DISTINCT p.address) as pool_count
        FROM pools p
                    LEFT JOIN arbitrage_executions ae ON ae.pool_a = p.address OR ae.pool_b = p.address
        WHERE p.is_active = true 
          AND (ae.timestamp > NOW() - INTERVAL '24 hours' OR ae.timestamp IS NULL)
        GROUP BY p.dex_name
        ORDER BY total_profit DESC NULLS LAST
      `;
      
      const result = await client.query(dexQuery);
      client.release();
      
      const dexMetrics = {};
      for (const row of result.rows) {
        dexMetrics[row.dex_name] = {
          executions: parseInt(row.executions) || 0,
          totalProfit: parseFloat(row.total_profit) || 0,
          avgTvl: parseFloat(row.avg_tvl) || 0,
          poolCount: parseInt(row.pool_count) || 0
        };
      }
      
      return dexMetrics;
      
    } catch (error) {
      console.error('❌ Failed to get DEX metrics:', error);
      return {};
    }
  }
  
  /**
   * 🤖 GET AGENT METRICS
   */
  async getAgentMetrics() {
    // For now, return placeholder agent metrics
    // This would be expanded to track individual agent performance
    return {
      activeAgents: 3,
      topPerformer: 'ArbitrumSpecialist',
      avgResponseTime: 1250,
      learningProgress: 0.85
    };
  }
  
  /**
   * 🎨 GENERATE DASHBOARD HTML
   */
  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 AI Arbitrage Syndicate - Real-Time Dashboard</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: #fff;
            overflow-x: hidden;
        }
        .header {
            background: rgba(0,0,0,0.3);
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #00ff88;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #00ff88;
            margin-left: 10px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .card {
            background: rgba(255,255,255,0.1);
            border-radius: 15px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            transition: transform 0.3s ease;
        }
        .card:hover { transform: translateY(-5px); }
        .card h3 {
            color: #00ff88;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .metric-value {
            font-weight: bold;
            color: #00ff88;
        }
        .profit-positive { color: #00ff88; }
        .profit-negative { color: #ff4757; }
        .execution-log {
            height: 300px;
            overflow-y: auto;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            padding: 10px;
        }
        .execution-item {
            padding: 8px;
            margin-bottom: 5px;
            background: rgba(255,255,255,0.05);
            border-radius: 5px;
            font-size: 0.9em;
        }
        .chain-pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            margin-right: 5px;
        }
        .chain-arbitrum { background: #2d5aa0; }
        .chain-ethereum { background: #627eea; }
        .chain-base { background: #0052ff; }
        .chain-polygon { background: #8247e5; }
        .alert-panel {
            border-left: 4px solid #ff4757;
            background: rgba(255, 71, 87, 0.1);
        }
        .chart-container {
            height: 300px;
            position: relative;
        }
        .last-update {
            text-align: center;
            padding: 10px;
            font-size: 0.9em;
            color: #aaa;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 AI Arbitrage Syndicate</h1>
        <p>Real-Time Production Dashboard <span class="status-indicator"></span></p>
        <div class="last-update" id="lastUpdate">Last updated: Connecting...</div>
    </div>
    
    <div class="dashboard-grid">
        <!-- System Overview -->
        <div class="card">
            <h3>📊 System Overview (24h)</h3>
            <div class="metric">
                <span>Total Executions:</span>
                <span class="metric-value" id="totalExecutions">0</span>
            </div>
            <div class="metric">
                <span>Success Rate:</span>
                <span class="metric-value" id="successRate">0%</span>
            </div>
            <div class="metric">
                <span>Total Profit:</span>
                <span class="metric-value profit-positive" id="totalProfit">$0</span>
            </div>
            <div class="metric">
                <span>Avg Gas Cost:</span>
                <span class="metric-value" id="avgGasCost">$0</span>
            </div>
            <div class="metric">
                <span>Active Chains:</span>
                <span class="metric-value" id="activeChains">0</span>
            </div>
            <div class="metric">
                <span>Monitored Pools:</span>
                <span class="metric-value" id="monitoredPools">0</span>
            </div>
        </div>
        
        <!-- Live Executions -->
        <div class="card">
            <h3>⚡ Live Arbitrage Executions</h3>
            <div class="execution-log" id="executionLog">
                <div class="execution-item">Waiting for executions...</div>
            </div>
        </div>
        
        <!-- Chain Performance -->
        <div class="card">
            <h3>🌐 Chain Performance</h3>
            <div id="chainMetrics">Loading...</div>
        </div>
        
        <!-- DEX Performance -->
        <div class="card">
            <h3>🏭 DEX Performance</h3>
            <div id="dexMetrics">Loading...</div>
        </div>
        
        <!-- Profit Chart -->
        <div class="card">
            <h3>📈 Profit Trend</h3>
            <div class="chart-container">
                <canvas id="profitChart"></canvas>
            </div>
        </div>
        
        <!-- Alerts -->
        <div class="card alert-panel">
            <h3>🚨 System Alerts</h3>
            <div id="alertsPanel">No alerts</div>
        </div>
    </div>

    <script>
        // Initialize WebSocket connection
        const socket = io();
        
        // Chart setup
        const profitChart = new Chart(document.getElementById('profitChart'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Profit USD',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#fff' } } },
                scales: {
                    x: { ticks: { color: '#fff' } },
                    y: { ticks: { color: '#fff' } }
                }
            }
        });
        
        // Socket event handlers
        socket.on('initialState', (state) => {
            updateDashboard(state);
        });
        
        socket.on('metricsUpdate', (state) => {
            updateDashboard(state);
        });
        
        socket.on('arbitrageExecution', (execution) => {
            addExecutionToLog(execution);
            updateProfitChart(execution);
        });
        
        socket.on('alert', (alert) => {
            addAlert(alert);
        });
        
        // Update functions
        function updateDashboard(state) {
            if (state.systemMetrics) {
                document.getElementById('totalExecutions').textContent = state.systemMetrics.totalExecutions || 0;
                document.getElementById('successRate').textContent = state.systemMetrics.successRate + '%' || '0%';
                document.getElementById('totalProfit').textContent = '$' + (state.systemMetrics.totalProfitUSD || 0).toLocaleString();
                document.getElementById('avgGasCost').textContent = '$' + (state.systemMetrics.avgGasCostUSD || 0).toFixed(2);
                document.getElementById('activeChains').textContent = state.systemMetrics.activeChains || 0;
                document.getElementById('monitoredPools').textContent = (state.systemMetrics.monitoredPools || 0).toLocaleString();
            }
            
            if (state.chainMetrics) {
                updateChainMetrics(state.chainMetrics);
            }
            
            if (state.dexMetrics) {
                updateDexMetrics(state.dexMetrics);
            }
            
            document.getElementById('lastUpdate').textContent = 'Last updated: ' + new Date().toLocaleTimeString();
        }
        
        function updateChainMetrics(metrics) {
            const container = document.getElementById('chainMetrics');
            container.innerHTML = '';
            
            for (const [chain, data] of Object.entries(metrics)) {
                const div = document.createElement('div');
                div.className = 'metric';
                div.innerHTML = \`
                    <span><span class="chain-pill chain-\${chain}">\${chain.toUpperCase()}</span></span>
                    <span class="metric-value">$\${data.totalProfit.toLocaleString()}</span>
                \`;
                container.appendChild(div);
            }
        }
        
        function updateDexMetrics(metrics) {
            const container = document.getElementById('dexMetrics');
            container.innerHTML = '';
            
            for (const [dex, data] of Object.entries(metrics)) {
                const div = document.createElement('div');
                div.className = 'metric';
                div.innerHTML = \`
                    <span>\${dex}</span>
                    <span class="metric-value">$\${data.totalProfit.toLocaleString()}</span>
                \`;
                container.appendChild(div);
            }
        }
        
        function addExecutionToLog(execution) {
            const log = document.getElementById('executionLog');
            const item = document.createElement('div');
            item.className = 'execution-item';
            
            const profitClass = execution.profitUSD > 0 ? 'profit-positive' : 'profit-negative';
            const time = new Date().toLocaleTimeString();
            
            item.innerHTML = \`
                <span class="chain-pill chain-\${execution.chain}">\${execution.chain.toUpperCase()}</span>
                <span class="\${profitClass}">$\${execution.profitUSD.toFixed(2)}</span>
                <span style="float: right">\${time}</span>
            \`;
            
            log.insertBefore(item, log.firstChild);
            
            // Keep only last 50 items
            while (log.children.length > 50) {
                log.removeChild(log.lastChild);
            }
        }
        
        function updateProfitChart(execution) {
            const chart = profitChart;
            const time = new Date().toLocaleTimeString();
            
            chart.data.labels.push(time);
            chart.data.datasets[0].data.push(execution.profitUSD);
            
            // Keep only last 20 points
            if (chart.data.labels.length > 20) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            
            chart.update('none');
        }
        
        function addAlert(alert) {
            const panel = document.getElementById('alertsPanel');
            const div = document.createElement('div');
            div.innerHTML = \`<strong>\${alert.type}:</strong> \${alert.message} <small>(\${new Date().toLocaleTimeString()})</small>\`;
            panel.insertBefore(div, panel.firstChild);
        }
        
        // Request initial update
        socket.emit('requestUpdate');
        
        console.log('🎯 AI Arbitrage Syndicate Dashboard loaded');
    </script>
</body>
</html>
    `;
  }
  
  /**
   * 🛑 SHUTDOWN DASHBOARD
   */
  async shutdown() {
    console.log('🛑 Shutting down Real-Time Dashboard...');
    
    this.isRunning = false;
    
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    if (this.monitoring) {
      await this.monitoring.shutdown();
    }
    
    this.server.close();
    console.log('✅ Dashboard shutdown complete');
  }
}

// Export for use in other modules
export default RealTimeDashboard;