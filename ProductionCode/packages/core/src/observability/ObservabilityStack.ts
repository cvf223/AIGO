import type { UUID, IAgentRuntime } from '../types';
import MemorySpine from '../memory/MemorySpine';
import PluginMesh from '../plugins/PluginMesh';

export interface Metric {
    name: string;
    value: number;
    timestamp: number;
    tags: Record<string, string>;
    type: 'counter' | 'gauge' | 'histogram' | 'summary';
    unit?: string;
    metadata?: Record<string, any>;
}

export interface Alert {
    id: string;
    name: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: number;
    source: string;
    tags: Record<string, string>;
    status: 'active' | 'resolved' | 'acknowledged';
    conditions: {
        threshold: number;
        operator: 'gt' | 'lt' | 'eq' | 'ne' | 'gte' | 'lte';
        duration: number; // seconds
        metric: string;
    };
    actions: string[]; // webhook, email, slack, etc.
    metadata?: Record<string, any>;
}

export interface Dashboard {
    id: string;
    name: string;
    description: string;
    panels: DashboardPanel[];
    filters: Record<string, any>;
    timeRange: {
        start: number;
        end: number;
        refresh: number; // refresh interval in ms
    };
    metadata: Record<string, any>;
}

export interface DashboardPanel {
    id: string;
    title: string;
    type: 'line' | 'bar' | 'pie' | 'table' | 'stat' | 'gauge' | 'heatmap';
    query: string;
    position: { x: number; y: number; width: number; height: number };
    options: Record<string, any>;
}

export interface LogEntry {
    timestamp: number;
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    message: string;
    source: string;
    agentId?: string;
    roomId?: string;
    taskId?: string;
    correlationId?: string;
    fields: Record<string, any>;
    stackTrace?: string;
}

export interface TraceSpan {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    operationName: string;
    startTime: number;
    endTime: number;
    duration: number;
    tags: Record<string, string>;
    logs: Array<{
        timestamp: number;
        fields: Record<string, any>;
    }>;
    status: 'ok' | 'error' | 'timeout';
}

export interface PerformanceProfile {
    agentId: string;
    taskType: string;
    metrics: {
        executionTime: number;
        memoryUsage: number;
        cpuUsage: number;
        networkCalls: number;
        errorRate: number;
        throughput: number;
    };
    timestamp: number;
    samples: Array<{
        function: string;
        duration: number;
        calls: number;
        cpuTime: number;
        memoryDelta: number;
    }>;
}

/**
 * Observability Stack - Comprehensive Monitoring and Analytics
 * 
 * 💡 WHY: Provides complete visibility into Castle operations with metrics,
 * logs, traces, alerts, and performance analytics for operational excellence.
 * 
 * ⚙️ HOW: Implements Prometheus-style metrics, structured logging, distributed
 * tracing, alerting engine, and real-time dashboards with anomaly detection.
 */
export class ObservabilityStack {
    private runtime: IAgentRuntime;
    private memory: MemorySpine;
    private plugins: PluginMesh;
    
    private readonly metrics: Map<string, Metric[]> = new Map();
    private readonly alerts: Map<string, Alert> = new Map();
    private readonly dashboards: Map<string, Dashboard> = new Map();
    private readonly logs: LogEntry[] = [];
    private readonly traces: Map<string, TraceSpan[]> = new Map();
    private readonly profiles: Map<string, PerformanceProfile[]> = new Map();
    
    private readonly alertRules: Map<string, Alert['conditions']> = new Map();
    private readonly retentionPolicies = {
        metrics: 30 * 24 * 60 * 60 * 1000, // 30 days
        logs: 7 * 24 * 60 * 60 * 1000,     // 7 days
        traces: 3 * 24 * 60 * 60 * 1000,   // 3 days
        alerts: 90 * 24 * 60 * 60 * 1000   // 90 days
    };
    
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor(
        runtime: IAgentRuntime,
        memory: MemorySpine,
        plugins: PluginMesh
    ) {
        this.runtime = runtime;
        this.memory = memory;
        this.plugins = plugins;
        
        this.initializeDefaultDashboards();
        this.initializeAlertRules();
        this.startMonitoring();
    }

    /**
     * Record metric data point
     */
    recordMetric(metric: Omit<Metric, 'timestamp'>): void {
        const metricWithTimestamp: Metric = {
            ...metric,
            timestamp: Date.now()
        };
        
        const key = `${metric.name}:${JSON.stringify(metric.tags)}`;
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        
        this.metrics.get(key)!.push(metricWithTimestamp);
        
        // Check for alert conditions
        this.checkAlertConditions(metricWithTimestamp);
        
        // Clean up old metrics
        this.cleanupMetrics(key);
    }

    /**
     * Log structured message
     */
    log(entry: Omit<LogEntry, 'timestamp'>): void {
        const logEntry: LogEntry = {
            ...entry,
            timestamp: Date.now()
        };
        
        this.logs.push(logEntry);
        
        // Console output for immediate visibility
        const timestamp = new Date(logEntry.timestamp).toISOString();
        const fields = Object.entries(logEntry.fields)
            .map(([key, value]) => `${key}=${value}`)
            .join(' ');
        
        console.log(
            `[${timestamp}] ${logEntry.level.toUpperCase()} ${logEntry.source}: ${logEntry.message} ${fields}`
        );
        
        // Check for log-based alerts
        if (logEntry.level === 'error' || logEntry.level === 'fatal') {
            this.triggerLogAlert(logEntry);
        }
        
        // Clean up old logs
        this.cleanupLogs();
    }

    /**
     * Start distributed trace
     */
    startTrace(operationName: string, parentSpanId?: string): TraceSpan {
        const traceId = parentSpanId ? this.getTraceIdFromSpan(parentSpanId) : this.generateTraceId();
        const spanId = this.generateSpanId();
        
        const span: TraceSpan = {
            traceId,
            spanId,
            parentSpanId,
            operationName,
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            tags: {},
            logs: [],
            status: 'ok'
        };
        
        if (!this.traces.has(traceId)) {
            this.traces.set(traceId, []);
        }
        this.traces.get(traceId)!.push(span);
        
        return span;
    }

    /**
     * Finish distributed trace span
     */
    finishTrace(span: TraceSpan, status: TraceSpan['status'] = 'ok'): void {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = status;
        
        // Record trace metrics
        this.recordMetric({
            name: 'trace_duration',
            value: span.duration,
            type: 'histogram',
            unit: 'milliseconds',
            tags: {
                operation: span.operationName,
                status: span.status,
                traceId: span.traceId
            }
        });
        
        // Clean up old traces
        this.cleanupTraces();
    }

    /**
     * Record performance profile
     */
    recordProfile(profile: PerformanceProfile): void {
        const key = `${profile.agentId}:${profile.taskType}`;
        if (!this.profiles.has(key)) {
            this.profiles.set(key, []);
        }
        
        this.profiles.get(key)!.push(profile);
        
        // Record performance metrics
        this.recordMetric({
            name: 'task_execution_time',
            value: profile.metrics.executionTime,
            type: 'histogram',
            unit: 'milliseconds',
            tags: {
                agentId: profile.agentId,
                taskType: profile.taskType
            }
        });
        
        this.recordMetric({
            name: 'task_memory_usage',
            value: profile.metrics.memoryUsage,
            type: 'gauge',
            unit: 'bytes',
            tags: {
                agentId: profile.agentId,
                taskType: profile.taskType
            }
        });
        
        // Clean up old profiles
        this.cleanupProfiles(key);
    }

    /**
     * Create or update alert rule
     */
    createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'status'>): string {
        const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const fullAlert: Alert = {
            ...alert,
            id: alertId,
            timestamp: Date.now(),
            status: 'active'
        };
        
        this.alerts.set(alertId, fullAlert);
        this.alertRules.set(alert.name, alert.conditions);
        
        this.log({
            level: 'info',
            message: `Alert rule created: ${alert.name}`,
            source: 'observability',
            fields: { alertId, threshold: alert.conditions.threshold }
        });
        
        return alertId;
    }

    /**
     * Query metrics with time range and filters
     */
    queryMetrics(
        metricName: string,
        timeRange: { start: number; end: number },
        tags?: Record<string, string>
    ): Metric[] {
        const results: Metric[] = [];
        
        for (const [key, metricPoints] of this.metrics.entries()) {
            const [name] = key.split(':');
            if (name !== metricName) continue;
            
            // Parse tags from key
            const keyTags = JSON.parse(key.split(':', 2)[1] || '{}');
            
            // Filter by tags if provided
            if (tags) {
                const matchesFilter = Object.entries(tags).every(
                    ([tagKey, tagValue]) => keyTags[tagKey] === tagValue
                );
                if (!matchesFilter) continue;
            }
            
            // Filter by time range
            const filteredPoints = metricPoints.filter(
                point => point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
            );
            
            results.push(...filteredPoints);
        }
        
        return results.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Query logs with filters
     */
    queryLogs(
        filters: {
            level?: LogEntry['level'][];
            source?: string[];
            timeRange?: { start: number; end: number };
            message?: string;
            agentId?: string;
            roomId?: string;
        }
    ): LogEntry[] {
        return this.logs.filter(log => {
            if (filters.level && !filters.level.includes(log.level)) return false;
            if (filters.source && !filters.source.includes(log.source)) return false;
            if (filters.timeRange) {
                if (log.timestamp < filters.timeRange.start || log.timestamp > filters.timeRange.end) {
                    return false;
                }
            }
            if (filters.message && !log.message.toLowerCase().includes(filters.message.toLowerCase())) {
                return false;
            }
            if (filters.agentId && log.agentId !== filters.agentId) return false;
            if (filters.roomId && log.roomId !== filters.roomId) return false;
            
            return true;
        }).sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Get dashboard data
     */
    getDashboard(dashboardId: string): Dashboard | undefined {
        return this.dashboards.get(dashboardId);
    }

    /**
     * Create custom dashboard
     */
    createDashboard(dashboard: Omit<Dashboard, 'id'>): string {
        const dashboardId = `dashboard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.dashboards.set(dashboardId, {
            ...dashboard,
            id: dashboardId
        });
        
        return dashboardId;
    }

    /**
     * Get system health overview
     */
    getSystemHealth(): {
        overall: 'healthy' | 'degraded' | 'critical';
        components: Record<string, {
            status: 'up' | 'down' | 'degraded';
            metrics: Record<string, number>;
            lastCheck: number;
        }>;
        activeAlerts: Alert[];
        recentErrors: LogEntry[];
    } {
        const activeAlerts = Array.from(this.alerts.values())
            .filter(alert => alert.status === 'active');
        
        const recentErrors = this.logs
            .filter(log => log.level === 'error' || log.level === 'fatal')
            .slice(-10);
        
        const components = this.getComponentHealth();
        
        // Determine overall health
        let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
        const criticalAlerts = activeAlerts.filter(alert => alert.level === 'critical');
        const downComponents = Object.values(components).filter(comp => comp.status === 'down');
        
        if (criticalAlerts.length > 0 || downComponents.length > 0) {
            overall = 'critical';
        } else if (activeAlerts.length > 0 || recentErrors.length > 5) {
            overall = 'degraded';
        }
        
        return {
            overall,
            components,
            activeAlerts,
            recentErrors
        };
    }

    /**
     * Generate performance report
     */
    generatePerformanceReport(
        timeRange: { start: number; end: number }
    ): {
        summary: {
            totalTasks: number;
            avgExecutionTime: number;
            errorRate: number;
            throughput: number;
        };
        byAgent: Record<string, {
            tasks: number;
            avgTime: number;
            errors: number;
            performance: number;
        }>;
        bottlenecks: Array<{
            component: string;
            issue: string;
            impact: number;
            recommendation: string;
        }>;
    } {
        const taskMetrics = this.queryMetrics('task_execution_time', timeRange);
        const errorMetrics = this.queryMetrics('task_errors', timeRange);
        
        const summary = {
            totalTasks: taskMetrics.length,
            avgExecutionTime: taskMetrics.reduce((sum, m) => sum + m.value, 0) / taskMetrics.length || 0,
            errorRate: errorMetrics.reduce((sum, m) => sum + m.value, 0) / taskMetrics.length || 0,
            throughput: taskMetrics.length / ((timeRange.end - timeRange.start) / 1000) // tasks per second
        };
        
        const byAgent: Record<string, any> = {};
        const agentMetrics = new Map<string, { times: number[]; errors: number }>();
        
        for (const metric of taskMetrics) {
            const agentId = metric.tags.agentId || 'unknown';
            if (!agentMetrics.has(agentId)) {
                agentMetrics.set(agentId, { times: [], errors: 0 });
            }
            agentMetrics.get(agentId)!.times.push(metric.value);
        }
        
        for (const metric of errorMetrics) {
            const agentId = metric.tags.agentId || 'unknown';
            if (agentMetrics.has(agentId)) {
                agentMetrics.get(agentId)!.errors += metric.value;
            }
        }
        
        for (const [agentId, data] of agentMetrics) {
            const avgTime = data.times.reduce((sum, t) => sum + t, 0) / data.times.length || 0;
            byAgent[agentId] = {
                tasks: data.times.length,
                avgTime,
                errors: data.errors,
                performance: Math.max(0, 100 - (avgTime / 1000) - (data.errors * 10))
            };
        }
        
        const bottlenecks = this.identifyBottlenecks(summary, byAgent);
        
        return { summary, byAgent, bottlenecks };
    }

    // Private implementation methods

    private checkAlertConditions(metric: Metric): void {
        for (const [alertName, conditions] of this.alertRules.entries()) {
            if (conditions.metric !== metric.name) continue;
            
            const shouldAlert = this.evaluateCondition(metric.value, conditions);
            
            if (shouldAlert) {
                this.triggerAlert(alertName, metric);
            }
        }
    }

    private evaluateCondition(value: number, conditions: Alert['conditions']): boolean {
        switch (conditions.operator) {
            case 'gt': return value > conditions.threshold;
            case 'gte': return value >= conditions.threshold;
            case 'lt': return value < conditions.threshold;
            case 'lte': return value <= conditions.threshold;
            case 'eq': return value === conditions.threshold;
            case 'ne': return value !== conditions.threshold;
            default: return false;
        }
    }

    private triggerAlert(alertName: string, metric: Metric): void {
        const existingAlert = Array.from(this.alerts.values())
            .find(alert => alert.name === alertName && alert.status === 'active');
        
        if (existingAlert) return; // Don't duplicate active alerts
        
        const alertId = this.createAlert({
            name: alertName,
            level: 'warning',
            message: `Alert triggered: ${alertName} (${metric.name} = ${metric.value})`,
            source: 'observability',
            tags: metric.tags,
            conditions: this.alertRules.get(alertName)!,
            actions: ['log', 'webhook']
        });
        
        this.log({
            level: 'warn',
            message: `Alert triggered: ${alertName}`,
            source: 'observability',
            fields: { alertId, metricValue: metric.value }
        });
    }

    private triggerLogAlert(logEntry: LogEntry): void {
        const alertId = this.createAlert({
            name: `log_alert_${logEntry.level}`,
            level: logEntry.level === 'fatal' ? 'critical' : 'error',
            message: `${logEntry.level.toUpperCase()} log detected: ${logEntry.message}`,
            source: logEntry.source,
            tags: { level: logEntry.level, source: logEntry.source },
            conditions: {
                threshold: 1,
                operator: 'gte',
                duration: 0,
                metric: 'log_errors'
            },
            actions: ['log']
        });
    }

    private getComponentHealth(): Record<string, any> {
        const components: Record<string, any> = {};
        
        // Analyze recent metrics to determine component health
        const now = Date.now();
        const recentWindow = 5 * 60 * 1000; // 5 minutes
        
        const componentTypes = ['memory', 'plugins', 'agents', 'contracts'];
        
        for (const component of componentTypes) {
            const recentMetrics = this.queryMetrics(
                `${component}_health`,
                { start: now - recentWindow, end: now }
            );
            
            let status: 'up' | 'down' | 'degraded' = 'up';
            if (recentMetrics.length === 0) {
                status = 'down';
            } else {
                const avgHealth = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
                if (avgHealth < 0.5) status = 'down';
                else if (avgHealth < 0.8) status = 'degraded';
            }
            
            components[component] = {
                status,
                metrics: {
                    health: recentMetrics.length > 0 ? 
                        recentMetrics[recentMetrics.length - 1].value : 0
                },
                lastCheck: now
            };
        }
        
        return components;
    }

    private identifyBottlenecks(summary: any, byAgent: Record<string, any>): Array<any> {
        const bottlenecks: Array<any> = [];
        
        // High error rate bottleneck
        if (summary.errorRate > 0.05) {
            bottlenecks.push({
                component: 'system',
                issue: 'High error rate',
                impact: summary.errorRate * 100,
                recommendation: 'Investigate error patterns and root causes'
            });
        }
        
        // Slow execution bottleneck
        if (summary.avgExecutionTime > 5000) {
            bottlenecks.push({
                component: 'system',
                issue: 'Slow task execution',
                impact: summary.avgExecutionTime / 1000,
                recommendation: 'Optimize task processing or scale resources'
            });
        }
        
        // Agent-specific bottlenecks
        for (const [agentId, metrics] of Object.entries(byAgent)) {
            if (metrics.errors > 10) {
                bottlenecks.push({
                    component: agentId,
                    issue: 'High error count',
                    impact: metrics.errors,
                    recommendation: `Investigate ${agentId} error patterns`
                });
            }
            
            if (metrics.avgTime > 10000) {
                bottlenecks.push({
                    component: agentId,
                    issue: 'Slow performance',
                    impact: metrics.avgTime / 1000,
                    recommendation: `Optimize ${agentId} task processing`
                });
            }
        }
        
        return bottlenecks.sort((a, b) => b.impact - a.impact).slice(0, 5);
    }

    private cleanupMetrics(key: string): void {
        const metricPoints = this.metrics.get(key)!;
        const cutoff = Date.now() - this.retentionPolicies.metrics;
        
        const filtered = metricPoints.filter(point => point.timestamp > cutoff);
        this.metrics.set(key, filtered);
    }

    private cleanupLogs(): void {
        const cutoff = Date.now() - this.retentionPolicies.logs;
        const filtered = this.logs.filter(log => log.timestamp > cutoff);
        this.logs.splice(0, this.logs.length, ...filtered);
    }

    private cleanupTraces(): void {
        const cutoff = Date.now() - this.retentionPolicies.traces;
        for (const [traceId, spans] of this.traces.entries()) {
            const filtered = spans.filter(span => span.startTime > cutoff);
            if (filtered.length === 0) {
                this.traces.delete(traceId);
            } else {
                this.traces.set(traceId, filtered);
            }
        }
    }

    private cleanupProfiles(key: string): void {
        const profiles = this.profiles.get(key)!;
        const cutoff = Date.now() - this.retentionPolicies.metrics;
        
        const filtered = profiles.filter(profile => profile.timestamp > cutoff);
        this.profiles.set(key, filtered);
    }

    private generateTraceId(): string {
        return Math.random().toString(36).substr(2, 16);
    }

    private generateSpanId(): string {
        return Math.random().toString(36).substr(2, 8);
    }

    private getTraceIdFromSpan(spanId: string): string {
        for (const [traceId, spans] of this.traces.entries()) {
            if (spans.find(span => span.spanId === spanId)) {
                return traceId;
            }
        }
        return this.generateTraceId();
    }

    private initializeDefaultDashboards(): void {
        // System Overview Dashboard
        const systemDashboard: Dashboard = {
            id: 'system_overview',
            name: 'System Overview',
            description: 'High-level system health and performance metrics',
            panels: [
                {
                    id: 'task_throughput',
                    title: 'Task Throughput',
                    type: 'line',
                    query: 'task_execution_time',
                    position: { x: 0, y: 0, width: 6, height: 4 },
                    options: { unit: 'tasks/sec' }
                },
                {
                    id: 'error_rate',
                    title: 'Error Rate',
                    type: 'stat',
                    query: 'task_errors',
                    position: { x: 6, y: 0, width: 3, height: 4 },
                    options: { unit: '%' }
                },
                {
                    id: 'active_alerts',
                    title: 'Active Alerts',
                    type: 'table',
                    query: 'alerts',
                    position: { x: 9, y: 0, width: 3, height: 4 },
                    options: {}
                }
            ],
            filters: {},
            timeRange: {
                start: Date.now() - 24 * 60 * 60 * 1000, // 24 hours
                end: Date.now(),
                refresh: 30000 // 30 seconds
            },
            metadata: { builtin: true }
        };
        
        this.dashboards.set('system_overview', systemDashboard);
    }

    private initializeAlertRules(): void {
        // High error rate alert
        this.alertRules.set('high_error_rate', {
            threshold: 0.1, // 10% error rate
            operator: 'gt',
            duration: 300, // 5 minutes
            metric: 'task_errors'
        });
        
        // Slow execution alert
        this.alertRules.set('slow_execution', {
            threshold: 10000, // 10 seconds
            operator: 'gt',
            duration: 60, // 1 minute
            metric: 'task_execution_time'
        });
        
        // Memory usage alert
        this.alertRules.set('high_memory_usage', {
            threshold: 0.9, // 90% memory usage
            operator: 'gt',
            duration: 180, // 3 minutes
            metric: 'memory_usage'
        });
    }

    private startMonitoring(): void {
        // Start periodic monitoring
        this.monitoringInterval = setInterval(() => {
            this.collectSystemMetrics();
        }, 30000); // Every 30 seconds
    }

    private collectSystemMetrics(): void {
        // Collect basic system metrics
        this.recordMetric({
            name: 'memory_usage',
            value: Math.random() * 0.8, // Simulate 0-80% memory usage
            type: 'gauge',
            unit: 'ratio',
            tags: { component: 'system' }
        });
        
        this.recordMetric({
            name: 'cpu_usage',
            value: Math.random() * 70, // Simulate 0-70% CPU usage
            type: 'gauge',
            unit: 'percentage',
            tags: { component: 'system' }
        });
        
        this.recordMetric({
            name: 'active_connections',
            value: Math.floor(Math.random() * 100),
            type: 'gauge',
            unit: 'count',
            tags: { component: 'network' }
        });
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
}

export default ObservabilityStack; 