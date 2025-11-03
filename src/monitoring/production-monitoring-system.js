/**
 * 🔍 PRODUCTION MONITORING & ALERTING SYSTEM
 * ==========================================
 * 
 * Real-time monitoring for the AI Arbitrage Syndicate with:
 * - Performance metrics tracking
 * - Error rate monitoring  
 * - Profitability analytics
 * - System health checks
 * - Real-time alerts via multiple channels
 */

import EventEmitter from 'events';
import fetch from 'node-fetch';

export class ProductionMonitoringSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.config = {
      // Alert thresholds
      maxErrorRate: config.maxErrorRate || 0.05, // 5%
      minProfitMargin: config.minProfitMargin || 0.10, // 10%
      maxResponseTime: config.maxResponseTime || 5000, // 5s
      maxGasCostUSD: config.maxGasCostUSD || 100,
      
      // Notification channels
      webhookUrls: config.webhookUrls || [],
      emailConfig: config.emailConfig || null,
      telegramConfig: config.telegramConfig || null,
      
      // Monitoring intervals
      healthCheckInterval: config.healthCheckInterval || 30000, // 30s
      metricsInterval: config.metricsInterval || 60000, // 1min
      
      // Database connection
      database: config.database || null
    };
    
    // Metrics storage
    this.metrics = {
      arbitrageExecutions: {
        total: 0,
        successful: 0,
        failed: 0,
        totalProfitUSD: 0,
        avgProfitMargin: 0,
        lastExecution: null
      },
      systemHealth: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: 0,
        databaseConnected: false,
        rpcConnections: {},
        lastHealthCheck: Date.now()
      },
      performance: {
        avgResponseTime: 0,
        maxResponseTime: 0,
        requestCount: 0,
        errorRate: 0,
        responseTimeHistory: []
      },
      alerts: {
        total: 0,
        last24h: 0,
        severity: {
          critical: 0,
          warning: 0,
          info: 0
        }
      }
    };
    
    // Alert history
    this.alertHistory = [];
    
    // Start monitoring
    this.startMonitoring();
  }

  /**
   * 🚀 START MONITORING SYSTEM
   */
  startMonitoring() {
    console.log('🔍 Production Monitoring System starting...');
    
    // Health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
    
    // Metrics collection
    this.metricsTimer = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('✅ Monitoring system active');
  }

  /**
   * 🩺 PERFORM COMPREHENSIVE HEALTH CHECK
   */
  async performHealthCheck() {
    const healthCheck = {
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      rpcConnections: {},
      database: false,
      overallStatus: 'healthy'
    };

    try {
      // Check RPC connections
      const rpcUrls = {
        arbitrum: process.env.ARBITRUM_RPC_URL,
        base: process.env.BASE_RPC_URL,
        polygon: process.env.POLYGON_RPC_URL,
        optimism: process.env.OPTIMISM_RPC_URL,
        bsc: process.env.BSC_RPC_URL
      };

      for (const [chain, url] of Object.entries(rpcUrls)) {
        if (url) {
          healthCheck.rpcConnections[chain] = await this.checkRPCHealth(url);
        }
      }

      // Check database connection
      if (this.config.database) {
        healthCheck.database = await this.checkDatabaseHealth();
      }

      // Update metrics
      this.metrics.systemHealth = healthCheck;

      // Check for issues
      const issues = this.analyzeHealthCheck(healthCheck);
      if (issues.length > 0) {
        await this.sendAlert('warning', 'Health Check Issues', {
          issues,
          healthCheck
        });
      }

    } catch (error) {
      console.error('❌ Health check failed:', error);
      healthCheck.overallStatus = 'unhealthy';
      
      await this.sendAlert('critical', 'Health Check Failed', {
        error: error.message,
        healthCheck
      });
    }
  }

  /**
   * 🌐 CHECK RPC HEALTH
   */
  async checkRPCHealth(rpcUrl) {
    try {
      const startTime = Date.now();
      
      const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }),
        timeout: 5000
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      return {
        status: response.ok && data.result ? 'healthy' : 'unhealthy',
        responseTime,
        blockNumber: data.result,
        lastCheck: Date.now()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        lastCheck: Date.now()
      };
    }
  }

  /**
   * 🗄️ CHECK DATABASE HEALTH
   */
  async checkDatabaseHealth() {
    try {
      if (!this.config.database) return false;
      
      const result = await this.config.database.query('SELECT 1 as test');
      return result && result.rows && result.rows.length > 0;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * 📊 COLLECT PERFORMANCE METRICS
   */
  collectMetrics() {
    // Update system metrics
    this.metrics.systemHealth.uptime = process.uptime();
    this.metrics.systemHealth.memoryUsage = process.memoryUsage();
    this.metrics.systemHealth.lastHealthCheck = Date.now();
    
    // Calculate CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.metrics.systemHealth.cpuUsage = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to milliseconds
    
    // Clean old response time history (keep last 100)
    if (this.metrics.performance.responseTimeHistory.length > 100) {
      this.metrics.performance.responseTimeHistory = 
        this.metrics.performance.responseTimeHistory.slice(-100);
    }
    
    // Check for alerts
    this.checkMetricThresholds();
  }

  /**
   * 📈 TRACK ARBITRAGE EXECUTION
   */
  trackArbitrageExecution(execution) {
    this.metrics.arbitrageExecutions.total++;
    
    if (execution.success) {
      this.metrics.arbitrageExecutions.successful++;
      this.metrics.arbitrageExecutions.totalProfitUSD += execution.profitUSD || 0;
      
      // Calculate average profit margin
      const totalSuccessful = this.metrics.arbitrageExecutions.successful;
      this.metrics.arbitrageExecutions.avgProfitMargin = 
        (this.metrics.arbitrageExecutions.avgProfitMargin * (totalSuccessful - 1) + 
         (execution.profitMargin || 0)) / totalSuccessful;
    } else {
      this.metrics.arbitrageExecutions.failed++;
      
      // Alert on failures
      this.sendAlert('warning', 'Arbitrage Execution Failed', {
        execution,
        errorRate: this.getErrorRate()
      });
    }
    
    this.metrics.arbitrageExecutions.lastExecution = {
      timestamp: Date.now(),
      success: execution.success,
      profitUSD: execution.profitUSD,
      gasCostUSD: execution.gasCostUSD,
      chain: execution.chain
    };
    
    // Emit event for other systems
    this.emit('arbitrageExecution', execution);
  }

  /**
   * ⏱️ TRACK RESPONSE TIME
   */
  trackResponseTime(operation, responseTime) {
    this.metrics.performance.requestCount++;
    
    // Update average response time
    const count = this.metrics.performance.requestCount;
    this.metrics.performance.avgResponseTime = 
      (this.metrics.performance.avgResponseTime * (count - 1) + responseTime) / count;
    
    // Update max response time
    if (responseTime > this.metrics.performance.maxResponseTime) {
      this.metrics.performance.maxResponseTime = responseTime;
    }
    
    // Add to history
    this.metrics.performance.responseTimeHistory.push({
      timestamp: Date.now(),
      operation,
      responseTime
    });
    
    // Alert if response time is too high
    if (responseTime > this.config.maxResponseTime) {
      this.sendAlert('warning', 'High Response Time', {
        operation,
        responseTime,
        threshold: this.config.maxResponseTime
      });
    }
  }

  /**
   * 🚨 SEND ALERT
   */
  async sendAlert(severity, title, data = {}) {
    const alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      title,
      data,
      timestamp: Date.now(),
      formatted: this.formatAlert(severity, title, data)
    };
    
    // Store alert
    this.alertHistory.push(alert);
    this.metrics.alerts.total++;
    this.metrics.alerts.severity[severity]++;
    
    // Keep only last 1000 alerts
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }
    
    console.log(`🚨 ALERT [${severity.toUpperCase()}]: ${title}`);
    
    try {
      // Send to webhooks
      await this.sendWebhookAlerts(alert);
      
      // Send to Telegram
      await this.sendTelegramAlert(alert);
      
      // Send email
      await this.sendEmailAlert(alert);
      
    } catch (error) {
      console.error('Failed to send alert:', error);
    }
    
    // Emit event
    this.emit('alert', alert);
  }

  /**
   * 🔗 SEND WEBHOOK ALERTS
   */
  async sendWebhookAlerts(alert) {
    if (!this.config.webhookUrls.length) return;
    
    const payload = {
      text: alert.formatted,
      alert,
      timestamp: new Date().toISOString(),
      system: 'AI Arbitrage Syndicate'
    };
    
    const promises = this.config.webhookUrls.map(async (url) => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          timeout: 10000
        });
      } catch (error) {
        console.error(`Webhook failed for ${url}:`, error);
      }
    });
    
    await Promise.allSettled(promises);
  }

  /**
   * 📱 SEND TELEGRAM ALERT
   */
  async sendTelegramAlert(alert) {
    if (!this.config.telegramConfig) return;
    
    const { botToken, chatId } = this.config.telegramConfig;
    if (!botToken || !chatId) return;
    
    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: alert.formatted,
          parse_mode: 'Markdown'
        })
      });
    } catch (error) {
      console.error('Telegram alert failed:', error);
    }
  }

  /**
   * 📧 SEND EMAIL ALERT
   */
  async sendEmailAlert(alert) {
    if (!this.config.emailConfig) return;
    
    // Email implementation would go here
    // Could use nodemailer or other email service
    console.log(`📧 Email alert: ${alert.title} (email config needed)`);
  }

  /**
   * 🎨 FORMAT ALERT MESSAGE
   */
  formatAlert(severity, title, data) {
    const emoji = {
      critical: '🔴',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    const timestamp = new Date().toISOString();
    
    let message = `${emoji[severity]} **${title}**\n`;
    message += `📅 Time: ${timestamp}\n`;
    message += `🔧 System: AI Arbitrage Syndicate\n\n`;
    
    if (data.execution) {
      message += `**Execution Details:**\n`;
      message += `- Chain: ${data.execution.chain}\n`;
      message += `- Success: ${data.execution.success}\n`;
      message += `- Profit: $${data.execution.profitUSD || 0}\n`;
      message += `- Gas Cost: $${data.execution.gasCostUSD || 0}\n`;
    }
    
    if (data.responseTime) {
      message += `**Performance:**\n`;
      message += `- Operation: ${data.operation}\n`;
      message += `- Response Time: ${data.responseTime}ms\n`;
      message += `- Threshold: ${data.threshold}ms\n`;
    }
    
    if (data.issues) {
      message += `**Issues Found:**\n`;
      data.issues.forEach(issue => {
        message += `- ${issue}\n`;
      });
    }
    
    return message;
  }

  /**
   * 🔍 ANALYZE HEALTH CHECK RESULTS
   */
  analyzeHealthCheck(healthCheck) {
    const issues = [];
    
    // 🔧 TOP 1% FIX: Skip health check analysis during initialization (first 60 seconds)
    const uptimeSeconds = (Date.now() - this.metrics.startTime) / 1000;
    if (uptimeSeconds < 60) {
      return []; // No issues during initialization period
    }
    
    // Check memory usage (alert if > 80% of heap limit)
    const memUsage = healthCheck.memory.heapUsed / healthCheck.memory.heapTotal;
    if (memUsage > 0.8) {
      issues.push(`High memory usage: ${(memUsage * 100).toFixed(1)}%`);
    }
    
    // Check RPC connections (only if they've had time to initialize)
    Object.entries(healthCheck.rpcConnections).forEach(([chain, status]) => {
      if (status.status !== 'healthy') {
        issues.push(`${chain} RPC unhealthy: ${status.error || 'Unknown error'}`);
      } else if (status.responseTime > 3000) {
        issues.push(`${chain} RPC slow: ${status.responseTime}ms`);
      }
    });
    
    // Check database (only if configured and system is running)
    if (!healthCheck.database && this.config.database) {
      issues.push('Database connection failed');
    }
    
    return issues;
  }

  /**
   * 📊 CHECK METRIC THRESHOLDS
   */
  checkMetricThresholds() {
    const errorRate = this.getErrorRate();
    
    // Check error rate
    if (errorRate > this.config.maxErrorRate) {
      this.sendAlert('critical', 'High Error Rate', {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        threshold: (this.config.maxErrorRate * 100).toFixed(2) + '%',
        failed: this.metrics.arbitrageExecutions.failed,
        total: this.metrics.arbitrageExecutions.total
      });
    }
    
    // 🔧 TOP 1% FIX: Only check profit margin if we have actual executions!
    if (this.metrics.arbitrageExecutions.total > 10) {
      if (this.metrics.arbitrageExecutions.avgProfitMargin < this.config.minProfitMargin) {
        this.sendAlert('warning', 'Low Profit Margin', {
          avgProfitMargin: (this.metrics.arbitrageExecutions.avgProfitMargin * 100).toFixed(2) + '%',
          threshold: (this.config.minProfitMargin * 100).toFixed(2) + '%',
          executionsSampled: this.metrics.arbitrageExecutions.total
        });
      }
    }
  }

  /**
   * 📈 GET ERROR RATE
   */
  getErrorRate() {
    const total = this.metrics.arbitrageExecutions.total;
    const failed = this.metrics.arbitrageExecutions.failed;
    
    return total > 0 ? failed / total : 0;
  }

  /**
   * 📊 GET CURRENT METRICS
   */
  getMetrics() {
    return {
      ...this.metrics,
      errorRate: this.getErrorRate(),
      timestamp: Date.now()
    };
  }

  /**
   * 📋 GET RECENT ALERTS
   */
  getRecentAlerts(hours = 24) {
    const since = Date.now() - (hours * 60 * 60 * 1000);
    return this.alertHistory.filter(alert => alert.timestamp >= since);
  }

  /**
   * 🛑 STOP MONITORING
   */
  stopMonitoring() {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }
    
    console.log('🛑 Monitoring system stopped');
  }

  /**
   * 🎧 SETUP EVENT LISTENERS
   */
  setupEventListeners() {
    // Listen for uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.sendAlert('critical', 'Uncaught Exception', {
        error: error.message,
        stack: error.stack
      });
    });
    
    // Listen for unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.sendAlert('critical', 'Unhandled Promise Rejection', {
        reason: reason?.toString(),
        promise: promise?.toString()
      });
    });
  }
}

export default ProductionMonitoringSystem;