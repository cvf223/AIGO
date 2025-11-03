import { EventEmitter } from 'events';
import { elizaLogger } from '@elizaos/core';

export interface PerformanceMetric {
  agentId: string;
  metricType: 'response-time' | 'memory-usage' | 'error-rate' | 'success-rate' | 'knowledge-gain';
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AgentHealth {
  agentId: string;
  status: 'healthy' | 'degraded' | 'critical';
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  lastActive: number;
  issues: string[];
}

export interface SystemHealth {
  overallStatus: 'healthy' | 'degraded' | 'critical';
  activeAgents: number;
  totalMemoryUsage: number;
  averageResponseTime: number;
  errorRate: number;
  agentHealth: Map<string, AgentHealth>;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetric[] = [];
  private agentHealth: Map<string, AgentHealth> = new Map();
  private metricsRetentionHours = 24;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  // Thresholds
  private readonly RESPONSE_TIME_WARNING = 500; // ms
  private readonly RESPONSE_TIME_CRITICAL = 1000; // ms
  private readonly ERROR_RATE_WARNING = 0.05; // 5%
  private readonly ERROR_RATE_CRITICAL = 0.1; // 10%
  private readonly MEMORY_WARNING = 500 * 1024 * 1024; // 500MB
  private readonly MEMORY_CRITICAL = 1024 * 1024 * 1024; // 1GB
  
  constructor() {
    super();
    this.startHealthMonitoring();
  }
  
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.updateAgentHealth(metric);
    
    // Emit real-time updates
    this.emit('metric', metric);
    
    // Clean old metrics
    this.cleanOldMetrics();
  }
  
  recordResponseTime(agentId: string, duration: number, operation: string): void {
    this.recordMetric({
      agentId,
      metricType: 'response-time',
      value: duration,
      timestamp: Date.now(),
      metadata: { operation }
    });
  }
  
  recordError(agentId: string, error: Error, context: string): void {
    this.recordMetric({
      agentId,
      metricType: 'error-rate',
      value: 1,
      timestamp: Date.now(),
      metadata: { error: error.message, context }
    });
    
    elizaLogger.error(`Agent ${agentId} error in ${context}:`, error);
  }
  
  recordSuccess(agentId: string, operation: string): void {
    this.recordMetric({
      agentId,
      metricType: 'success-rate',
      value: 1,
      timestamp: Date.now(),
      metadata: { operation }
    });
  }
  
  getAgentMetrics(agentId: string, metricType?: PerformanceMetric['metricType'], hoursBack = 1): PerformanceMetric[] {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    
    return this.metrics.filter(m => 
      m.agentId === agentId &&
      m.timestamp > cutoff &&
      (!metricType || m.metricType === metricType)
    );
  }
  
  getSystemHealth(): SystemHealth {
    const agents = Array.from(this.agentHealth.values());
    const healthyAgents = agents.filter(a => a.status === 'healthy').length;
    const totalAgents = agents.length;
    
    let overallStatus: SystemHealth['overallStatus'] = 'healthy';
    
    if (healthyAgents < totalAgents * 0.8) {
      overallStatus = 'degraded';
    }
    if (healthyAgents < totalAgents * 0.5) {
      overallStatus = 'critical';
    }
    
    const totalMemory = agents.reduce((sum, a) => sum + a.memoryUsage, 0);
    const avgResponseTime = agents.reduce((sum, a) => sum + a.responseTime, 0) / (agents.length || 1);
    const avgErrorRate = agents.reduce((sum, a) => sum + a.errorRate, 0) / (agents.length || 1);
    
    return {
      overallStatus,
      activeAgents: agents.filter(a => Date.now() - a.lastActive < 60000).length,
      totalMemoryUsage: totalMemory,
      averageResponseTime: avgResponseTime,
      errorRate: avgErrorRate,
      agentHealth: this.agentHealth
    };
  }
  
  getAgentHealth(agentId: string): AgentHealth | undefined {
    return this.agentHealth.get(agentId);
  }
  
  generateReport(hoursBack = 24): string {
    const systemHealth = this.getSystemHealth();
    const agents = Array.from(this.agentHealth.values());
    
    let report = '# Performance Report\n\n';
    report += `## System Overview\n`;
    report += `- Status: ${systemHealth.overallStatus.toUpperCase()}\n`;
    report += `- Active Agents: ${systemHealth.activeAgents}/${agents.length}\n`;
    report += `- Avg Response Time: ${systemHealth.averageResponseTime.toFixed(2)}ms\n`;
    report += `- Error Rate: ${(systemHealth.errorRate * 100).toFixed(2)}%\n`;
    report += `- Memory Usage: ${(systemHealth.totalMemoryUsage / 1024 / 1024).toFixed(2)}MB\n\n`;
    
    report += `## Agent Details\n`;
    for (const agent of agents) {
      report += `\n### ${agent.agentId}\n`;
      report += `- Status: ${agent.status}\n`;
      report += `- Response Time: ${agent.responseTime.toFixed(2)}ms\n`;
      report += `- Error Rate: ${(agent.errorRate * 100).toFixed(2)}%\n`;
      report += `- Memory: ${(agent.memoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
      
      if (agent.issues.length > 0) {
        report += `- Issues: ${agent.issues.join(', ')}\n`;
      }
    }
    
    return report;
  }
  
  private updateAgentHealth(metric: PerformanceMetric): void {
    const health = this.agentHealth.get(metric.agentId) || {
      agentId: metric.agentId,
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      lastActive: Date.now(),
      issues: []
    };
    
    health.lastActive = Date.now();
    
    // Update metrics based on type
    if (metric.metricType === 'response-time') {
      // Calculate rolling average
      const recentMetrics = this.getAgentMetrics(metric.agentId, 'response-time', 0.1);
      health.responseTime = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
    }
    
    if (metric.metricType === 'error-rate' || metric.metricType === 'success-rate') {
      // Calculate error rate
      const errors = this.getAgentMetrics(metric.agentId, 'error-rate', 1).length;
      const successes = this.getAgentMetrics(metric.agentId, 'success-rate', 1).length;
      const total = errors + successes;
      health.errorRate = total > 0 ? errors / total : 0;
    }
    
    if (metric.metricType === 'memory-usage') {
      health.memoryUsage = metric.value;
    }
    
    // Determine health status
    health.issues = [];
    health.status = 'healthy';
    
    if (health.responseTime > this.RESPONSE_TIME_WARNING) {
      health.issues.push('High response time');
      health.status = 'degraded';
    }
    if (health.responseTime > this.RESPONSE_TIME_CRITICAL) {
      health.status = 'critical';
    }
    
    if (health.errorRate > this.ERROR_RATE_WARNING) {
      health.issues.push('High error rate');
      health.status = 'degraded';
    }
    if (health.errorRate > this.ERROR_RATE_CRITICAL) {
      health.status = 'critical';
    }
    
    if (health.memoryUsage > this.MEMORY_WARNING) {
      health.issues.push('High memory usage');
      if (health.status === 'healthy') health.status = 'degraded';
    }
    if (health.memoryUsage > this.MEMORY_CRITICAL) {
      health.status = 'critical';
    }
    
    // Check if agent is unresponsive
    if (Date.now() - health.lastActive > 5 * 60 * 1000) {
      health.issues.push('Unresponsive');
      health.status = 'critical';
    }
    
    this.agentHealth.set(metric.agentId, health);
    
    // Emit health change events
    if (health.status !== 'healthy') {
      this.emit('health-warning', health);
    }
  }
  
  private cleanOldMetrics(): void {
    const cutoff = Date.now() - (this.metricsRetentionHours * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }
  
  private startHealthMonitoring(): void {
    // Check system health every minute
    this.healthCheckInterval = setInterval(() => {
      const systemHealth = this.getSystemHealth();
      
      if (systemHealth.overallStatus !== 'healthy') {
        this.emit('system-health-warning', systemHealth);
        elizaLogger.warn(`System health: ${systemHealth.overallStatus}`, {
          activeAgents: systemHealth.activeAgents,
          errorRate: systemHealth.errorRate,
          avgResponseTime: systemHealth.averageResponseTime
        });
      }
      
      // Auto-generate reports every hour
      if (new Date().getMinutes() === 0) {
        const report = this.generateReport();
        this.emit('hourly-report', report);
      }
    }, 60 * 1000);
  }
  
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
} 