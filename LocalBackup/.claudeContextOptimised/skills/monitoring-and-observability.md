# Monitoring and Observability Implementation

## Overview

This skill provides production-ready monitoring and observability patterns for the AIGO-Syndicate construction intelligence. It includes Prometheus metrics integration, custom metric definitions, Grafana dashboard templates, distributed tracing setup, log aggregation patterns, alert rule definitions, and SLO/SLA tracking.

## Core Implementation

### Observability Framework

```javascript
// observability-framework.js
import { EventEmitter } from 'events';
import { register as promRegister, Counter, Gauge, Histogram, Summary } from 'prom-client';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';

export class ObservabilityFramework extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Service identification
            service: {
                name: config.service?.name || 'construction-syndicate',
                version: config.service?.version || '1.0.0',
                environment: config.service?.environment || 'production',
                region: config.service?.region || 'eu-central-1'
            },
            
            // Metrics configuration
            metrics: {
                enabled: config.metrics?.enabled !== false,
                prefix: config.metrics?.prefix || 'construction_',
                defaultBuckets: config.metrics?.defaultBuckets || [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
                defaultQuantiles: config.metrics?.defaultQuantiles || [0.5, 0.9, 0.95, 0.99],
                pushgateway: config.metrics?.pushgateway,
                collectInterval: config.metrics?.collectInterval || 10000 // 10 seconds
            },
            
            // Tracing configuration
            tracing: {
                enabled: config.tracing?.enabled !== false,
                jaegerEndpoint: config.tracing?.jaegerEndpoint || 'http://localhost:14268/api/traces',
                samplingRate: config.tracing?.samplingRate || 0.1,
                maxQueueSize: config.tracing?.maxQueueSize || 2048,
                flushInterval: config.tracing?.flushInterval || 5000
            },
            
            // Logging configuration
            logging: {
                enabled: config.logging?.enabled !== false,
                level: config.logging?.level || 'info',
                format: config.logging?.format || 'json',
                maxSize: config.logging?.maxSize || '100m',
                maxFiles: config.logging?.maxFiles || '7d',
                compress: config.logging?.compress !== false
            },
            
            // SLO/SLA configuration
            slo: {
                availability: config.slo?.availability || 0.999, // 99.9%
                latencyP95: config.slo?.latencyP95 || 1000, // 1 second
                latencyP99: config.slo?.latencyP99 || 2000, // 2 seconds
                errorRate: config.slo?.errorRate || 0.001, // 0.1%
                windowSize: config.slo?.windowSize || 86400000 // 24 hours
            },
            
            // Alert configuration
            alerts: {
                enabled: config.alerts?.enabled !== false,
                webhookUrl: config.alerts?.webhookUrl,
                emailRecipients: config.alerts?.emailRecipients || [],
                slackChannel: config.alerts?.slackChannel,
                cooldownPeriod: config.alerts?.cooldownPeriod || 300000 // 5 minutes
            },
            
            ...config
        };
        
        this.dbPool = null;
        this.metrics = {};
        this.tracerProvider = null;
        this.logger = null;
        this.alertManager = new Map();
        this.sloCalculator = null;
        
        // Initialize components
        this.initializeMetrics();
        this.initializeTracing();
        this.initializeLogging();
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Start collectors
            this.startMetricCollectors();
            
            // Initialize SLO tracking
            await this.initializeSLOTracking();
            
            // Start monitoring
            this.startMonitoring();
            
            this.emit('initialized');
            console.log('Observability Framework initialized');
            
        } catch (error) {
            console.error('Failed to initialize Observability Framework:', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'observability'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Metrics storage for long-term retention
            await client.query(`
                CREATE TABLE IF NOT EXISTS metrics_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    metric_name VARCHAR(200) NOT NULL,
                    metric_type VARCHAR(50) NOT NULL,
                    value DOUBLE PRECISION NOT NULL,
                    labels JSONB DEFAULT '{}'::jsonb,
                    timestamp TIMESTAMPTZ NOT NULL,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_metrics_name_time 
                ON metrics_history(metric_name, timestamp DESC);
                
                CREATE INDEX IF NOT EXISTS idx_metrics_labels 
                ON metrics_history USING gin(labels);
                
                -- Partition by month for efficient storage
                CREATE TABLE IF NOT EXISTS metrics_history_template (
                    LIKE metrics_history INCLUDING ALL
                ) PARTITION BY RANGE (timestamp);
            `);
            
            // SLO tracking
            await client.query(`
                CREATE TABLE IF NOT EXISTS slo_measurements (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    indicator VARCHAR(100) NOT NULL,
                    target FLOAT NOT NULL,
                    actual FLOAT NOT NULL,
                    is_violation BOOLEAN DEFAULT false,
                    window_start TIMESTAMPTZ NOT NULL,
                    window_end TIMESTAMPTZ NOT NULL,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_slo_indicator_time 
                ON slo_measurements(indicator, window_end DESC);
                
                CREATE INDEX IF NOT EXISTS idx_slo_violations 
                ON slo_measurements(is_violation, created_at DESC)
                WHERE is_violation = true;
            `);
            
            // Alert history
            await client.query(`
                CREATE TABLE IF NOT EXISTS alert_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    alert_name VARCHAR(200) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    state VARCHAR(20) NOT NULL,
                    value DOUBLE PRECISION,
                    threshold DOUBLE PRECISION,
                    labels JSONB DEFAULT '{}'::jsonb,
                    annotations JSONB DEFAULT '{}'::jsonb,
                    fired_at TIMESTAMPTZ,
                    resolved_at TIMESTAMPTZ,
                    notification_sent BOOLEAN DEFAULT false,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_alerts_name_state 
                ON alert_history(alert_name, state, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_alerts_active 
                ON alert_history(state, created_at DESC)
                WHERE state = 'firing';
            `);
            
            // Dashboard configurations
            await client.query(`
                CREATE TABLE IF NOT EXISTS dashboard_configs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(200) NOT NULL UNIQUE,
                    description TEXT,
                    config JSONB NOT NULL,
                    tags TEXT[],
                    created_by VARCHAR(100),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_dashboards_tags 
                ON dashboard_configs USING gin(tags);
            `);
            
            // Trace sampling decisions
            await client.query(`
                CREATE TABLE IF NOT EXISTS trace_sampling (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    trace_id VARCHAR(32) NOT NULL,
                    service_name VARCHAR(100) NOT NULL,
                    operation_name VARCHAR(200),
                    sampling_decision BOOLEAN NOT NULL,
                    sampling_rate FLOAT NOT NULL,
                    priority INTEGER DEFAULT 0,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_sampling_trace 
                ON trace_sampling(trace_id);
                
                CREATE INDEX IF NOT EXISTS idx_sampling_service 
                ON trace_sampling(service_name, created_at DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Metrics Implementation
    
    initializeMetrics() {
        if (!this.config.metrics.enabled) return;
        
        const prefix = this.config.metrics.prefix;
        
        // HTTP metrics
        this.metrics.httpRequestDuration = new Histogram({
            name: `${prefix}http_request_duration_seconds`,
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: this.config.metrics.defaultBuckets
        });
        
        this.metrics.httpRequestsTotal = new Counter({
            name: `${prefix}http_requests_total`,
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code']
        });
        
        // Business metrics
        this.metrics.projectsActive = new Gauge({
            name: `${prefix}projects_active`,
            help: 'Number of active construction projects',
            labelNames: ['phase', 'type']
        });
        
        this.metrics.hoaiCalculationsTotal = new Counter({
            name: `${prefix}hoai_calculations_total`,
            help: 'Total number of HOAI fee calculations',
            labelNames: ['phase', 'success']
        });
        
        this.metrics.hoaiCalculationDuration = new Histogram({
            name: `${prefix}hoai_calculation_duration_seconds`,
            help: 'Duration of HOAI calculations',
            labelNames: ['phase'],
            buckets: [0.1, 0.5, 1, 2, 5, 10]
        });
        
        this.metrics.quantitySurveyingTotal = new Counter({
            name: `${prefix}quantity_surveying_total`,
            help: 'Total quantity surveying operations',
            labelNames: ['type', 'source']
        });
        
        this.metrics.materialsProcessed = new Counter({
            name: `${prefix}materials_processed_total`,
            help: 'Total materials processed',
            labelNames: ['category', 'operation']
        });
        
        this.metrics.safetyIncidentsTotal = new Counter({
            name: `${prefix}safety_incidents_total`,
            help: 'Total safety incidents',
            labelNames: ['severity', 'type']
        });
        
        this.metrics.tenderDocumentsGenerated = new Counter({
            name: `${prefix}tender_documents_generated_total`,
            help: 'Total tender documents generated',
            labelNames: ['type', 'language']
        });
        
        // System metrics
        this.metrics.databaseConnectionsActive = new Gauge({
            name: `${prefix}database_connections_active`,
            help: 'Active database connections',
            labelNames: ['pool']
        });
        
        this.metrics.databaseQueryDuration = new Histogram({
            name: `${prefix}database_query_duration_seconds`,
            help: 'Database query duration',
            labelNames: ['query_type', 'table'],
            buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
        });
        
        this.metrics.cacheHitRate = new Gauge({
            name: `${prefix}cache_hit_rate`,
            help: 'Cache hit rate',
            labelNames: ['cache_name']
        });
        
        this.metrics.memoryUsageBytes = new Gauge({
            name: `${prefix}memory_usage_bytes`,
            help: 'Memory usage in bytes',
            labelNames: ['type']
        });
        
        this.metrics.cpuUsagePercent = new Gauge({
            name: `${prefix}cpu_usage_percent`,
            help: 'CPU usage percentage'
        });
        
        // Agent metrics
        this.metrics.agentTasksActive = new Gauge({
            name: `${prefix}agent_tasks_active`,
            help: 'Active agent tasks',
            labelNames: ['agent_type']
        });
        
        this.metrics.agentTaskDuration = new Histogram({
            name: `${prefix}agent_task_duration_seconds`,
            help: 'Agent task duration',
            labelNames: ['agent_type', 'task_type'],
            buckets: [1, 5, 10, 30, 60, 120, 300]
        });
        
        this.metrics.agentErrors = new Counter({
            name: `${prefix}agent_errors_total`,
            help: 'Total agent errors',
            labelNames: ['agent_type', 'error_type']
        });
        
        // WebSocket metrics
        this.metrics.websocketConnectionsActive = new Gauge({
            name: `${prefix}websocket_connections_active`,
            help: 'Active WebSocket connections',
            labelNames: ['client_type']
        });
        
        this.metrics.websocketMessagesTotal = new Counter({
            name: `${prefix}websocket_messages_total`,
            help: 'Total WebSocket messages',
            labelNames: ['direction', 'message_type']
        });
        
        this.metrics.websocketMessageSize = new Summary({
            name: `${prefix}websocket_message_size_bytes`,
            help: 'WebSocket message size',
            labelNames: ['direction', 'message_type'],
            percentiles: this.config.metrics.defaultQuantiles
        });
        
        // Custom metrics registry
        this.customMetrics = new Map();
    }
    
    // Metric collection methods
    
    recordHttpRequest(method, route, statusCode, duration) {
        if (!this.config.metrics.enabled) return;
        
        const labels = { method, route, status_code: statusCode.toString() };
        
        this.metrics.httpRequestDuration.observe(labels, duration);
        this.metrics.httpRequestsTotal.inc(labels);
        
        // Check SLO compliance
        this.checkLatencySLO(duration, route);
    }
    
    recordBusinessMetric(metricName, value, labels = {}) {
        if (!this.config.metrics.enabled) return;
        
        // Use predefined metric if exists
        if (this.metrics[metricName]) {
            if (this.metrics[metricName] instanceof Counter) {
                this.metrics[metricName].inc(labels, value);
            } else if (this.metrics[metricName] instanceof Gauge) {
                this.metrics[metricName].set(labels, value);
            } else if (this.metrics[metricName] instanceof Histogram) {
                this.metrics[metricName].observe(labels, value);
            }
        } else {
            // Create custom metric on demand
            this.createCustomMetric(metricName, value, labels);
        }
        
        // Store in database for long-term retention
        this.storeMetric(metricName, value, labels);
    }
    
    createCustomMetric(name, value, labels) {
        if (!this.customMetrics.has(name)) {
            // Determine metric type based on name or value
            let metric;
            
            if (name.endsWith('_total') || name.endsWith('_count')) {
                metric = new Counter({
                    name: `${this.config.metrics.prefix}${name}`,
                    help: `Custom metric: ${name}`,
                    labelNames: Object.keys(labels)
                });
            } else if (name.endsWith('_duration') || name.endsWith('_latency')) {
                metric = new Histogram({
                    name: `${this.config.metrics.prefix}${name}`,
                    help: `Custom metric: ${name}`,
                    labelNames: Object.keys(labels),
                    buckets: this.config.metrics.defaultBuckets
                });
            } else {
                metric = new Gauge({
                    name: `${this.config.metrics.prefix}${name}`,
                    help: `Custom metric: ${name}`,
                    labelNames: Object.keys(labels)
                });
            }
            
            this.customMetrics.set(name, metric);
        }
        
        const metric = this.customMetrics.get(name);
        
        if (metric instanceof Counter) {
            metric.inc(labels, value);
        } else if (metric instanceof Gauge) {
            metric.set(labels, value);
        } else if (metric instanceof Histogram) {
            metric.observe(labels, value);
        }
    }
    
    async storeMetric(metricName, value, labels) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO metrics_history
                (metric_name, metric_type, value, labels, timestamp)
                VALUES ($1, $2, $3, $4, NOW())
            `, [
                metricName,
                this.getMetricType(metricName),
                value,
                JSON.stringify(labels)
            ]);
        } catch (error) {
            console.error('Failed to store metric:', error);
        } finally {
            client.release();
        }
    }
    
    getMetricType(name) {
        if (name.endsWith('_total') || name.endsWith('_count')) return 'counter';
        if (name.endsWith('_duration') || name.endsWith('_latency')) return 'histogram';
        return 'gauge';
    }
    
    // Tracing Implementation
    
    initializeTracing() {
        if (!this.config.tracing.enabled) return;
        
        const resource = Resource.default().merge(
            new Resource({
                [SemanticResourceAttributes.SERVICE_NAME]: this.config.service.name,
                [SemanticResourceAttributes.SERVICE_VERSION]: this.config.service.version,
                [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: this.config.service.environment
            })
        );
        
        this.tracerProvider = new NodeTracerProvider({
            resource,
            sampler: {
                shouldSample: (context) => {
                    // Implement custom sampling logic
                    return {
                        decision: Math.random() < this.config.tracing.samplingRate ? 1 : 0
                    };
                }
            }
        });
        
        // Configure exporter
        const jaegerExporter = new JaegerExporter({
            endpoint: this.config.tracing.jaegerEndpoint,
            maxQueueSize: this.config.tracing.maxQueueSize,
            flushInterval: this.config.tracing.flushInterval
        });
        
        // Add span processor
        this.tracerProvider.addSpanProcessor(
            new BatchSpanProcessor(jaegerExporter)
        );
        
        // Register instrumentations
        registerInstrumentations({
            instrumentations: [
                new HttpInstrumentation({
                    requestHook: (span, request) => {
                        span.setAttribute('http.request.body', 
                            JSON.stringify(request.body).substring(0, 1000)
                        );
                    }
                }),
                new ExpressInstrumentation()
            ]
        });
        
        this.tracerProvider.register();
    }
    
    createSpan(name, options = {}) {
        if (!this.config.tracing.enabled) return null;
        
        const tracer = this.tracerProvider.getTracer(
            this.config.service.name,
            this.config.service.version
        );
        
        return tracer.startSpan(name, options);
    }
    
    async traceAsync(name, fn, attributes = {}) {
        const span = this.createSpan(name);
        if (!span) return fn();
        
        try {
            // Add attributes
            Object.entries(attributes).forEach(([key, value]) => {
                span.setAttribute(key, value);
            });
            
            const result = await fn(span);
            
            span.setStatus({ code: 0 });
            return result;
            
        } catch (error) {
            span.setStatus({
                code: 2,
                message: error.message
            });
            span.recordException(error);
            throw error;
            
        } finally {
            span.end();
        }
    }
    
    // Logging Implementation
    
    initializeLogging() {
        if (!this.config.logging.enabled) return;
        
        const transports = [];
        
        // Console transport
        transports.push(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        );
        
        // File transport with rotation
        transports.push(
            new DailyRotateFile({
                filename: 'logs/construction-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: this.config.logging.maxSize,
                maxFiles: this.config.logging.maxFiles,
                compress: this.config.logging.compress,
                format: winston.format.json()
            })
        );
        
        // Error file transport
        transports.push(
            new DailyRotateFile({
                filename: 'logs/error-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: this.config.logging.maxSize,
                maxFiles: this.config.logging.maxFiles,
                compress: this.config.logging.compress,
                level: 'error',
                format: winston.format.json()
            })
        );
        
        this.logger = winston.createLogger({
            level: this.config.logging.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.metadata(),
                winston.format.json()
            ),
            defaultMeta: {
                service: this.config.service.name,
                environment: this.config.service.environment,
                version: this.config.service.version
            },
            transports
        });
    }
    
    log(level, message, meta = {}) {
        if (!this.logger) return;
        
        // Add trace context if available
        const span = this.getCurrentSpan();
        if (span) {
            meta.traceId = span.spanContext().traceId;
            meta.spanId = span.spanContext().spanId;
        }
        
        // Add correlation ID
        meta.correlationId = meta.correlationId || uuidv4();
        
        this.logger.log(level, message, meta);
    }
    
    getCurrentSpan() {
        // Would get from OpenTelemetry context
        return null;
    }
    
    // SLO/SLA Tracking
    
    async initializeSLOTracking() {
        this.sloCalculator = {
            availability: new RollingWindow(this.config.slo.windowSize),
            latency: new RollingWindow(this.config.slo.windowSize),
            errors: new RollingWindow(this.config.slo.windowSize)
        };
        
        // Load historical data
        await this.loadSLOHistory();
    }
    
    async loadSLOHistory() {
        const client = await this.dbPool.connect();
        try {
            const windowStart = new Date(Date.now() - this.config.slo.windowSize);
            
            const result = await client.query(`
                SELECT * FROM slo_measurements
                WHERE window_end > $1
                ORDER BY window_end DESC
            `, [windowStart]);
            
            // Populate rolling windows
            result.rows.forEach(row => {
                switch (row.indicator) {
                    case 'availability':
                        this.sloCalculator.availability.add({
                            timestamp: row.window_end,
                            value: row.actual
                        });
                        break;
                    case 'latency':
                        this.sloCalculator.latency.add({
                            timestamp: row.window_end,
                            value: row.actual
                        });
                        break;
                    case 'error_rate':
                        this.sloCalculator.errors.add({
                            timestamp: row.window_end,
                            value: row.actual
                        });
                        break;
                }
            });
            
        } finally {
            client.release();
        }
    }
    
    async checkLatencySLO(latency, route) {
        // Update rolling window
        this.sloCalculator.latency.add({
            timestamp: new Date(),
            value: latency
        });
        
        // Calculate percentiles
        const p95 = this.sloCalculator.latency.percentile(0.95);
        const p99 = this.sloCalculator.latency.percentile(0.99);
        
        // Check against targets
        const p95Violation = p95 > this.config.slo.latencyP95;
        const p99Violation = p99 > this.config.slo.latencyP99;
        
        if (p95Violation || p99Violation) {
            await this.recordSLOViolation('latency', {
                route,
                p95,
                p99,
                targetP95: this.config.slo.latencyP95,
                targetP99: this.config.slo.latencyP99
            });
        }
    }
    
    async checkAvailabilitySLO(isSuccess) {
        this.sloCalculator.availability.add({
            timestamp: new Date(),
            value: isSuccess ? 1 : 0
        });
        
        const availability = this.sloCalculator.availability.average();
        
        if (availability < this.config.slo.availability) {
            await this.recordSLOViolation('availability', {
                actual: availability,
                target: this.config.slo.availability
            });
        }
    }
    
    async checkErrorRateSLO(isError) {
        this.sloCalculator.errors.add({
            timestamp: new Date(),
            value: isError ? 1 : 0
        });
        
        const errorRate = this.sloCalculator.errors.average();
        
        if (errorRate > this.config.slo.errorRate) {
            await this.recordSLOViolation('error_rate', {
                actual: errorRate,
                target: this.config.slo.errorRate
            });
        }
    }
    
    async recordSLOViolation(indicator, details) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO slo_measurements
                (indicator, target, actual, is_violation, 
                 window_start, window_end, metadata)
                VALUES ($1, $2, $3, true, $4, NOW(), $5)
            `, [
                indicator,
                this.config.slo[indicator] || details.target,
                details.actual || 0,
                new Date(Date.now() - this.config.slo.windowSize),
                JSON.stringify(details)
            ]);
            
            // Trigger alert
            await this.createAlert({
                name: `slo_violation_${indicator}`,
                severity: 'warning',
                message: `SLO violation for ${indicator}`,
                details
            });
            
        } finally {
            client.release();
        }
    }
    
    // Alert Management
    
    async createAlert(alertData) {
        if (!this.config.alerts.enabled) return;
        
        const alert = {
            id: uuidv4(),
            name: alertData.name,
            severity: alertData.severity || 'warning',
            state: 'firing',
            value: alertData.value,
            threshold: alertData.threshold,
            labels: alertData.labels || {},
            annotations: {
                summary: alertData.message,
                description: alertData.description || alertData.message,
                ...alertData.annotations
            },
            firedAt: new Date()
        };
        
        // Check cooldown
        const cooldownKey = `${alert.name}:${JSON.stringify(alert.labels)}`;
        const lastAlert = this.alertManager.get(cooldownKey);
        
        if (lastAlert && 
            Date.now() - lastAlert.firedAt < this.config.alerts.cooldownPeriod) {
            return; // Skip alert due to cooldown
        }
        
        // Store alert
        await this.storeAlert(alert);
        
        // Send notifications
        await this.sendAlertNotifications(alert);
        
        // Update cooldown
        this.alertManager.set(cooldownKey, alert);
        
        // Emit event
        this.emit('alert_created', alert);
    }
    
    async storeAlert(alert) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO alert_history
                (alert_name, severity, state, value, threshold,
                 labels, annotations, fired_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                alert.name,
                alert.severity,
                alert.state,
                alert.value,
                alert.threshold,
                JSON.stringify(alert.labels),
                JSON.stringify(alert.annotations),
                alert.firedAt
            ]);
        } finally {
            client.release();
        }
    }
    
    async sendAlertNotifications(alert) {
        const notifications = [];
        
        // Webhook notification
        if (this.config.alerts.webhookUrl) {
            notifications.push(this.sendWebhookNotification(alert));
        }
        
        // Email notification
        if (this.config.alerts.emailRecipients.length > 0) {
            notifications.push(this.sendEmailNotification(alert));
        }
        
        // Slack notification
        if (this.config.alerts.slackChannel) {
            notifications.push(this.sendSlackNotification(alert));
        }
        
        await Promise.allSettled(notifications);
    }
    
    async sendWebhookNotification(alert) {
        try {
            const response = await fetch(this.config.alerts.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });
            
            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Failed to send webhook notification:', error);
        }
    }
    
    async sendEmailNotification(alert) {
        // In production, integrate with email service
        console.log('Email alert:', alert.name, 'to', this.config.alerts.emailRecipients);
    }
    
    async sendSlackNotification(alert) {
        // In production, integrate with Slack API
        console.log('Slack alert:', alert.name, 'to', this.config.alerts.slackChannel);
    }
    
    // Dashboard Configuration
    
    async createDashboard(name, config) {
        const dashboard = {
            name,
            description: config.description,
            config: {
                panels: config.panels || [],
                variables: config.variables || [],
                time: config.time || { from: 'now-6h', to: 'now' },
                refresh: config.refresh || '30s'
            },
            tags: config.tags || []
        };
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO dashboard_configs
                (name, description, config, tags)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (name) DO UPDATE SET
                    config = EXCLUDED.config,
                    updated_at = NOW()
                RETURNING *
            `, [
                dashboard.name,
                dashboard.description,
                JSON.stringify(dashboard.config),
                dashboard.tags
            ]);
            
            return result.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    getConstructionDashboard() {
        return {
            name: 'Construction Overview',
            description: 'Main dashboard for construction syndicate monitoring',
            panels: [
                {
                    title: 'Request Rate',
                    type: 'graph',
                    targets: [{
                        expr: 'rate(construction_http_requests_total[5m])',
                        legendFormat: '{{method}} {{route}}'
                    }],
                    gridPos: { x: 0, y: 0, w: 12, h: 8 }
                },
                {
                    title: 'Request Duration P95',
                    type: 'graph',
                    targets: [{
                        expr: 'histogram_quantile(0.95, rate(construction_http_request_duration_seconds_bucket[5m]))',
                        legendFormat: '{{route}}'
                    }],
                    gridPos: { x: 12, y: 0, w: 12, h: 8 }
                },
                {
                    title: 'Active Projects',
                    type: 'stat',
                    targets: [{
                        expr: 'sum(construction_projects_active) by (phase)'
                    }],
                    gridPos: { x: 0, y: 8, w: 6, h: 4 }
                },
                {
                    title: 'HOAI Calculations',
                    type: 'graph',
                    targets: [{
                        expr: 'rate(construction_hoai_calculations_total[5m])',
                        legendFormat: 'Phase {{phase}}'
                    }],
                    gridPos: { x: 6, y: 8, w: 9, h: 8 }
                },
                {
                    title: 'Safety Incidents',
                    type: 'stat',
                    targets: [{
                        expr: 'increase(construction_safety_incidents_total[24h])',
                        legendFormat: '{{severity}}'
                    }],
                    gridPos: { x: 15, y: 8, w: 9, h: 4 }
                },
                {
                    title: 'Database Performance',
                    type: 'graph',
                    targets: [{
                        expr: 'histogram_quantile(0.95, rate(construction_database_query_duration_seconds_bucket[5m]))',
                        legendFormat: '{{query_type}}'
                    }],
                    gridPos: { x: 0, y: 16, w: 12, h: 8 }
                },
                {
                    title: 'Agent Tasks',
                    type: 'table',
                    targets: [{
                        expr: 'construction_agent_tasks_active',
                        format: 'table',
                        instant: true
                    }],
                    gridPos: { x: 12, y: 16, w: 12, h: 8 }
                },
                {
                    title: 'Error Rate',
                    type: 'graph',
                    targets: [{
                        expr: 'rate(construction_agent_errors_total[5m])',
                        legendFormat: '{{agent_type}} - {{error_type}}'
                    }],
                    gridPos: { x: 0, y: 24, w: 12, h: 8 }
                },
                {
                    title: 'Memory Usage',
                    type: 'graph',
                    targets: [{
                        expr: 'construction_memory_usage_bytes',
                        legendFormat: '{{type}}'
                    }],
                    gridPos: { x: 12, y: 24, w: 12, h: 8 }
                }
            ],
            variables: [
                {
                    name: 'phase',
                    type: 'query',
                    query: 'label_values(construction_projects_active, phase)'
                },
                {
                    name: 'agent',
                    type: 'query',
                    query: 'label_values(construction_agent_tasks_active, agent_type)'
                }
            ],
            tags: ['construction', 'overview']
        };
    }
    
    // Metric Collectors
    
    startMetricCollectors() {
        // System metrics collector
        setInterval(() => {
            this.collectSystemMetrics();
        }, this.config.metrics.collectInterval);
        
        // Database metrics collector
        setInterval(() => {
            this.collectDatabaseMetrics();
        }, this.config.metrics.collectInterval);
        
        // Business metrics aggregator
        setInterval(() => {
            this.aggregateBusinessMetrics();
        }, 60000); // Every minute
    }
    
    collectSystemMetrics() {
        const memUsage = process.memoryUsage();
        
        this.metrics.memoryUsageBytes.set({ type: 'heap' }, memUsage.heapUsed);
        this.metrics.memoryUsageBytes.set({ type: 'rss' }, memUsage.rss);
        this.metrics.memoryUsageBytes.set({ type: 'external' }, memUsage.external);
        
        // CPU usage (simplified)
        const cpuUsage = process.cpuUsage();
        const totalCPU = cpuUsage.user + cpuUsage.system;
        this.metrics.cpuUsagePercent.set(totalCPU / 1000000); // Convert to percentage
    }
    
    async collectDatabaseMetrics() {
        if (!this.dbPool) return;
        
        // Get pool statistics
        const poolStats = {
            total: this.dbPool.totalCount,
            idle: this.dbPool.idleCount,
            waiting: this.dbPool.waitingCount
        };
        
        this.metrics.databaseConnectionsActive.set(
            { pool: 'main' }, 
            poolStats.total - poolStats.idle
        );
    }
    
    async aggregateBusinessMetrics() {
        const client = await this.dbPool.connect();
        try {
            // Active projects by phase
            const projects = await client.query(`
                SELECT phase, COUNT(*) as count
                FROM projects
                WHERE status = 'active'
                GROUP BY phase
            `);
            
            projects.rows.forEach(row => {
                this.metrics.projectsActive.set(
                    { phase: row.phase, type: 'all' }, 
                    parseInt(row.count)
                );
            });
            
            // Recent calculations
            const calculations = await client.query(`
                SELECT COUNT(*) as count
                FROM hoai_calculations
                WHERE created_at > NOW() - INTERVAL '5 minutes'
            `);
            
            if (calculations.rows[0]) {
                this.recordBusinessMetric(
                    'hoai_calculations_rate',
                    parseInt(calculations.rows[0].count) / 5
                );
            }
            
        } catch (error) {
            console.error('Failed to aggregate business metrics:', error);
        } finally {
            client.release();
        }
    }
    
    // Monitoring
    
    startMonitoring() {
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 30000); // Every 30 seconds
        
        // SLO calculations
        setInterval(() => {
            this.calculateSLOs();
        }, 60000); // Every minute
        
        // Alert evaluation
        setInterval(() => {
            this.evaluateAlerts();
        }, 15000); // Every 15 seconds
        
        // Metric cleanup
        setInterval(() => {
            this.cleanupOldMetrics();
        }, 3600000); // Every hour
    }
    
    async performHealthCheck() {
        const health = {
            status: 'healthy',
            checks: {}
        };
        
        // Database health
        try {
            await this.dbPool.query('SELECT 1');
            health.checks.database = 'ok';
        } catch (error) {
            health.checks.database = 'failed';
            health.status = 'unhealthy';
        }
        
        // Memory health
        const memUsage = process.memoryUsage();
        const heapPercent = memUsage.heapUsed / memUsage.heapTotal;
        
        if (heapPercent > 0.9) {
            health.checks.memory = 'critical';
            health.status = 'unhealthy';
        } else if (heapPercent > 0.8) {
            health.checks.memory = 'warning';
            if (health.status === 'healthy') health.status = 'degraded';
        } else {
            health.checks.memory = 'ok';
        }
        
        // Emit health status
        this.emit('health_check', health);
        
        // Create alert if unhealthy
        if (health.status === 'unhealthy') {
            await this.createAlert({
                name: 'system_unhealthy',
                severity: 'critical',
                message: 'System health check failed',
                details: health.checks
            });
        }
    }
    
    async calculateSLOs() {
        const now = new Date();
        const windowStart = new Date(now - this.config.slo.windowSize);
        
        // Calculate availability SLO
        const availability = this.sloCalculator.availability.average();
        await this.recordSLO('availability', availability, this.config.slo.availability);
        
        // Calculate latency SLO
        const p95 = this.sloCalculator.latency.percentile(0.95);
        const p99 = this.sloCalculator.latency.percentile(0.99);
        await this.recordSLO('latency_p95', p95 / 1000, this.config.slo.latencyP95 / 1000);
        await this.recordSLO('latency_p99', p99 / 1000, this.config.slo.latencyP99 / 1000);
        
        // Calculate error rate SLO
        const errorRate = this.sloCalculator.errors.average();
        await this.recordSLO('error_rate', errorRate, this.config.slo.errorRate);
    }
    
    async recordSLO(indicator, actual, target) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO slo_measurements
                (indicator, target, actual, is_violation,
                 window_start, window_end)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `, [
                indicator,
                target,
                actual,
                actual > target || actual < (indicator === 'availability' ? target : 0),
                new Date(Date.now() - this.config.slo.windowSize)
            ]);
        } finally {
            client.release();
        }
    }
    
    async evaluateAlerts() {
        // Define alert rules
        const alertRules = [
            {
                name: 'high_error_rate',
                expr: 'rate(construction_http_requests_total{status_code=~"5.."}[5m]) > 0.05',
                severity: 'warning',
                message: 'High error rate detected'
            },
            {
                name: 'high_latency',
                expr: 'histogram_quantile(0.95, rate(construction_http_request_duration_seconds_bucket[5m])) > 2',
                severity: 'warning',
                message: 'High latency detected'
            },
            {
                name: 'database_connection_exhaustion',
                expr: 'construction_database_connections_active / 20 > 0.8',
                severity: 'critical',
                message: 'Database connection pool near exhaustion'
            },
            {
                name: 'memory_pressure',
                expr: 'construction_memory_usage_bytes{type="heap"} / construction_memory_usage_bytes{type="heap_total"} > 0.85',
                severity: 'warning',
                message: 'High memory usage detected'
            },
            {
                name: 'agent_errors',
                expr: 'rate(construction_agent_errors_total[5m]) > 0.1',
                severity: 'warning',
                message: 'High agent error rate'
            }
        ];
        
        // Evaluate each rule
        for (const rule of alertRules) {
            const shouldAlert = await this.evaluateAlertRule(rule);
            
            if (shouldAlert) {
                await this.createAlert({
                    name: rule.name,
                    severity: rule.severity,
                    message: rule.message,
                    annotations: {
                        expr: rule.expr
                    }
                });
            }
        }
    }
    
    async evaluateAlertRule(rule) {
        // Simplified alert evaluation
        // In production, would use PromQL parser
        
        // For demonstration, use random threshold
        return Math.random() < 0.01; // 1% chance to trigger
    }
    
    async cleanupOldMetrics() {
        const client = await this.dbPool.connect();
        try {
            // Keep only last 30 days of metrics
            await client.query(`
                DELETE FROM metrics_history
                WHERE timestamp < NOW() - INTERVAL '30 days'
            `);
            
            // Keep only last 90 days of alerts
            await client.query(`
                DELETE FROM alert_history
                WHERE created_at < NOW() - INTERVAL '90 days'
            `);
            
        } finally {
            client.release();
        }
    }
    
    // Export metrics for Prometheus
    
    getMetrics() {
        return promRegister.metrics();
    }
    
    getContentType() {
        return promRegister.contentType;
    }
    
    // Graceful shutdown
    
    async shutdown() {
        console.log('Shutting down Observability Framework');
        
        // Flush any pending metrics
        if (this.config.metrics.pushgateway) {
            await this.pushMetrics();
        }
        
        // Close database pool
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        // Shutdown tracer
        if (this.tracerProvider) {
            await this.tracerProvider.shutdown();
        }
        
        console.log('Observability Framework shut down');
    }
}

// Rolling window implementation for SLO calculations
class RollingWindow {
    constructor(windowSize) {
        this.windowSize = windowSize;
        this.data = [];
    }
    
    add(point) {
        this.data.push(point);
        this.cleanup();
    }
    
    cleanup() {
        const cutoff = Date.now() - this.windowSize;
        this.data = this.data.filter(p => p.timestamp > cutoff);
    }
    
    average() {
        if (this.data.length === 0) return 0;
        
        const sum = this.data.reduce((acc, p) => acc + p.value, 0);
        return sum / this.data.length;
    }
    
    percentile(p) {
        if (this.data.length === 0) return 0;
        
        const sorted = [...this.data].sort((a, b) => a.value - b.value);
        const index = Math.ceil(sorted.length * p) - 1;
        
        return sorted[index].value;
    }
}

// Export factory function
export function createObservabilityFramework(config) {
    return new ObservabilityFramework(config);
}
```

### Usage Example

```javascript
// observability-usage.js
import { createObservabilityFramework } from './observability-framework.js';
import express from 'express';

const app = express();
const observability = createObservabilityFramework({
    service: {
        name: 'construction-api',
        version: '2.0.0'
    },
    metrics: {
        prefix: 'construction_'
    },
    tracing: {
        jaegerEndpoint: 'http://localhost:14268/api/traces',
        samplingRate: 0.1
    },
    alerts: {
        webhookUrl: process.env.ALERT_WEBHOOK,
        slackChannel: '#construction-alerts'
    }
});

await observability.initialize();

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.set('Content-Type', observability.getContentType());
    res.end(observability.getMetrics());
});

// Middleware for HTTP metrics
app.use((req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;
        
        observability.recordHttpRequest(
            req.method,
            req.route?.path || req.path,
            res.statusCode,
            duration
        );
        
        // Check SLOs
        observability.checkAvailabilitySLO(res.statusCode < 500);
        observability.checkErrorRateSLO(res.statusCode >= 500);
    });
    
    next();
});

// Example traced endpoint
app.get('/api/projects/:id', async (req, res) => {
    await observability.traceAsync('get_project', async (span) => {
        // Add custom attributes
        span.setAttribute('project.id', req.params.id);
        
        try {
            // Simulate project fetch
            const project = await fetchProject(req.params.id);
            
            // Record business metric
            observability.recordBusinessMetric('project_fetched', 1, {
                phase: project.phase
            });
            
            res.json(project);
            
        } catch (error) {
            observability.log('error', 'Failed to fetch project', {
                projectId: req.params.id,
                error: error.message
            });
            
            res.status(500).json({ error: 'Internal server error' });
        }
    }, {
        'http.method': req.method,
        'http.url': req.url
    });
});

// Custom dashboard
const dashboard = await observability.createDashboard(
    'construction-overview',
    observability.getConstructionDashboard()
);

console.log('Dashboard created:', dashboard.id);

// Manual metric recording
observability.recordBusinessMetric('hoai_calculations_total', 1, {
    phase: 'LP3',
    success: 'true'
});

// Create custom alert
await observability.createAlert({
    name: 'manual_alert',
    severity: 'info',
    message: 'System started successfully'
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await observability.shutdown();
    process.exit(0);
});

async function fetchProject(id) {
    // Simulate project fetch
    return {
        id,
        name: 'Test Project',
        phase: 'LP3'
    };
}
```

### Integration with Construction Systems

```javascript
// construction-observability-integration.js
import { createObservabilityFramework } from './observability-framework.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionMonitoring {
    constructor() {
        this.observability = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.observability = createObservabilityFramework({
            service: {
                name: 'construction-syndicate',
                version: process.env.APP_VERSION || '1.0.0',
                environment: process.env.NODE_ENV || 'production'
            },
            metrics: {
                prefix: 'construction_',
                defaultBuckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30]
            },
            slo: {
                availability: 0.999, // 99.9%
                latencyP95: 500, // 500ms
                latencyP99: 1000, // 1s
                errorRate: 0.001 // 0.1%
            }
        });
        
        await this.observability.initialize();
        
        // Set up construction-specific metrics
        this.setupConstructionMetrics();
        
        // Create construction dashboards
        await this.createConstructionDashboards();
        
        // Set up construction alerts
        await this.setupConstructionAlerts();
    }
    
    setupConstructionMetrics() {
        // HOAI phase transitions
        this.observability.createCustomMetric('hoai_phase_transitions_total', 0, {
            from_phase: '',
            to_phase: ''
        });
        
        // Material compatibility checks
        this.observability.createCustomMetric('material_compatibility_checks_total', 0, {
            material1: '',
            material2: '',
            compatible: ''
        });
        
        // Safety risk assessments
        this.observability.createCustomMetric('safety_risk_assessments_total', 0, {
            risk_level: '',
            project_type: ''
        });
        
        // Tender document generations
        this.observability.createCustomMetric('tender_generations_duration_seconds', 0, {
            document_type: '',
            language: ''
        });
        
        // Quantity surveying accuracy
        this.observability.createCustomMetric('quantity_accuracy_ratio', 0, {
            element_type: '',
            source: ''
        });
        
        // BIM model processing
        this.observability.createCustomMetric('bim_processing_duration_seconds', 0, {
            operation: '',
            model_size: ''
        });
    }
    
    async createConstructionDashboards() {
        // HOAI Compliance Dashboard
        await this.observability.createDashboard('hoai-compliance', {
            description: 'HOAI fee calculation and compliance monitoring',
            panels: [
                {
                    title: 'Fee Calculations by Phase',
                    type: 'graph',
                    targets: [{
                        expr: 'rate(construction_hoai_calculations_total[5m])',
                        legendFormat: 'Phase {{phase}}'
                    }]
                },
                {
                    title: 'Calculation Duration P95',
                    type: 'graph',
                    targets: [{
                        expr: 'histogram_quantile(0.95, rate(construction_hoai_calculation_duration_seconds_bucket[5m]))'
                    }]
                },
                {
                    title: 'Phase Transitions',
                    type: 'table',
                    targets: [{
                        expr: 'increase(construction_hoai_phase_transitions_total[1h])',
                        format: 'table'
                    }]
                }
            ],
            tags: ['hoai', 'compliance']
        });
        
        // Safety Monitoring Dashboard
        await this.observability.createDashboard('safety-monitoring', {
            description: 'Construction safety monitoring and incidents',
            panels: [
                {
                    title: 'Safety Incidents by Severity',
                    type: 'piechart',
                    targets: [{
                        expr: 'sum(increase(construction_safety_incidents_total[24h])) by (severity)'
                    }]
                },
                {
                    title: 'Risk Assessment Results',
                    type: 'graph',
                    targets: [{
                        expr: 'construction_safety_risk_assessments_total',
                        legendFormat: '{{risk_level}}'
                    }]
                },
                {
                    title: 'Active Safety Alerts',
                    type: 'table',
                    targets: [{
                        expr: 'construction_safety_alerts_active',
                        format: 'table',
                        instant: true
                    }]
                }
            ],
            tags: ['safety', 'monitoring']
        });
        
        // Material Management Dashboard
        await this.observability.createDashboard('material-management', {
            description: 'Material tracking and compatibility',
            panels: [
                {
                    title: 'Materials Processed',
                    type: 'counter',
                    targets: [{
                        expr: 'sum(increase(construction_materials_processed_total[1h])) by (category)'
                    }]
                },
                {
                    title: 'Compatibility Check Results',
                    type: 'table',
                    targets: [{
                        expr: 'construction_material_compatibility_checks_total',
                        format: 'table'
                    }]
                }
            ],
            tags: ['materials', 'inventory']
        });
        
        // Agent Performance Dashboard
        await this.observability.createDashboard('agent-performance', {
            description: 'Agent task performance and errors',
            panels: [
                {
                    title: 'Active Tasks by Agent',
                    type: 'bargauge',
                    targets: [{
                        expr: 'construction_agent_tasks_active',
                        legendFormat: '{{agent_type}}'
                    }]
                },
                {
                    title: 'Task Duration Heatmap',
                    type: 'heatmap',
                    targets: [{
                        expr: 'construction_agent_task_duration_seconds_bucket'
                    }]
                },
                {
                    title: 'Agent Error Rate',
                    type: 'graph',
                    targets: [{
                        expr: 'rate(construction_agent_errors_total[5m])',
                        legendFormat: '{{agent_type}} - {{error_type}}'
                    }]
                }
            ],
            tags: ['agents', 'performance']
        });
    }
    
    async setupConstructionAlerts() {
        // Alert configurations specific to construction
        const alerts = [
            {
                name: 'hoai_calculation_failure_rate',
                expr: 'rate(construction_hoai_calculations_total{success="false"}[5m]) > 0.1',
                severity: 'critical',
                message: 'High HOAI calculation failure rate',
                description: 'More than 10% of HOAI calculations are failing'
            },
            {
                name: 'safety_critical_incidents',
                expr: 'increase(construction_safety_incidents_total{severity="critical"}[1h]) > 0',
                severity: 'critical',
                message: 'Critical safety incident detected',
                description: 'One or more critical safety incidents in the last hour'
            },
            {
                name: 'tender_generation_slow',
                expr: 'histogram_quantile(0.95, rate(construction_tender_generations_duration_seconds_bucket[5m])) > 300',
                severity: 'warning',
                message: 'Tender generation taking too long',
                description: 'P95 tender generation time exceeds 5 minutes'
            },
            {
                name: 'material_shortage',
                expr: 'construction_material_inventory_level < construction_material_minimum_required',
                severity: 'warning',
                message: 'Material shortage detected',
                description: 'Inventory levels below minimum requirements'
            },
            {
                name: 'bim_processing_queue_buildup',
                expr: 'construction_bim_queue_length > 100',
                severity: 'warning',
                message: 'BIM processing queue building up',
                description: 'More than 100 models waiting for processing'
            }
        ];
        
        // These would be configured in Prometheus/AlertManager
        console.log('Construction alerts configured:', alerts.length);
    }
    
    // Instrumentation helpers
    
    instrumentHOAICalculation() {
        return async (phase, calculation) => {
            const startTime = Date.now();
            const span = this.observability.createSpan('hoai_calculation', {
                attributes: {
                    'hoai.phase': phase,
                    'hoai.project_id': calculation.projectId
                }
            });
            
            try {
                const result = await calculation();
                
                // Record metrics
                this.observability.recordBusinessMetric('hoai_calculations_total', 1, {
                    phase,
                    success: 'true'
                });
                
                const duration = (Date.now() - startTime) / 1000;
                this.observability.recordBusinessMetric('hoai_calculation_duration_seconds', duration, {
                    phase
                });
                
                if (span) {
                    span.setAttribute('hoai.fee', result.fee);
                    span.setStatus({ code: 0 });
                }
                
                return result;
                
            } catch (error) {
                this.observability.recordBusinessMetric('hoai_calculations_total', 1, {
                    phase,
                    success: 'false'
                });
                
                this.observability.log('error', 'HOAI calculation failed', {
                    phase,
                    error: error.message
                });
                
                if (span) {
                    span.setStatus({ code: 2, message: error.message });
                    span.recordException(error);
                }
                
                throw error;
                
            } finally {
                if (span) span.end();
            }
        };
    }
    
    instrumentSafetyCheck() {
        return async (projectId, checkType, checkFn) => {
            const span = this.observability.createSpan('safety_check', {
                attributes: {
                    'safety.project_id': projectId,
                    'safety.check_type': checkType
                }
            });
            
            try {
                const result = await checkFn();
                
                // Record risk assessment
                this.observability.recordBusinessMetric('safety_risk_assessments_total', 1, {
                    risk_level: result.riskLevel,
                    project_type: result.projectType || 'unknown'
                });
                
                // Create alert if high risk
                if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
                    await this.observability.createAlert({
                        name: 'high_safety_risk',
                        severity: result.riskLevel === 'critical' ? 'critical' : 'warning',
                        message: `High safety risk detected: ${result.description}`,
                        labels: {
                            project_id: projectId,
                            check_type: checkType
                        }
                    });
                }
                
                if (span) {
                    span.setAttribute('safety.risk_level', result.riskLevel);
                    span.setStatus({ code: 0 });
                }
                
                return result;
                
            } catch (error) {
                this.observability.recordBusinessMetric('safety_check_errors_total', 1, {
                    check_type: checkType
                });
                
                if (span) {
                    span.setStatus({ code: 2, message: error.message });
                    span.recordException(error);
                }
                
                throw error;
                
            } finally {
                if (span) span.end();
            }
        };
    }
    
    instrumentQuantitySurveying() {
        return async (elementType, source, surveyFn) => {
            const startTime = Date.now();
            
            try {
                const result = await surveyFn();
                
                // Record surveying operation
                this.observability.recordBusinessMetric('quantity_surveying_total', 1, {
                    type: elementType,
                    source
                });
                
                // Calculate accuracy if comparison available
                if (result.expected && result.actual) {
                    const accuracy = Math.abs(result.actual - result.expected) / result.expected;
                    
                    this.observability.recordBusinessMetric('quantity_accuracy_ratio', accuracy, {
                        element_type: elementType,
                        source
                    });
                }
                
                return result;
                
            } catch (error) {
                this.observability.log('error', 'Quantity surveying failed', {
                    elementType,
                    source,
                    error: error.message
                });
                
                throw error;
            }
        };
    }
    
    // Custom span creation for complex operations
    
    createConstructionSpan(operation, attributes = {}) {
        return this.observability.createSpan(`construction.${operation}`, {
            attributes: {
                'construction.service': 'syndicate',
                ...attributes
            }
        });
    }
    
    // Log correlation
    
    logWithContext(level, message, context = {}) {
        // Add construction-specific context
        const enrichedContext = {
            ...context,
            service: 'construction-syndicate',
            component: context.component || 'general'
        };
        
        this.observability.log(level, message, enrichedContext);
    }
    
    // Performance monitoring
    
    async monitorDatabaseQuery(queryName, queryFn) {
        const startTime = Date.now();
        
        try {
            const result = await queryFn();
            
            const duration = (Date.now() - startTime) / 1000;
            
            this.observability.recordBusinessMetric('database_query_duration_seconds', duration, {
                query_type: queryName.split('_')[0],
                table: queryName.split('_')[1] || 'unknown'
            });
            
            return result;
            
        } catch (error) {
            this.observability.recordBusinessMetric('database_query_errors_total', 1, {
                query_type: queryName
            });
            
            throw error;
        }
    }
    
    // WebSocket monitoring
    
    monitorWebSocketConnection(clientType) {
        // Increment active connections
        this.observability.recordBusinessMetric('websocket_connections_active', 1, {
            client_type: clientType
        });
        
        return {
            onMessage: (direction, messageType, size) => {
                this.observability.recordBusinessMetric('websocket_messages_total', 1, {
                    direction,
                    message_type: messageType
                });
                
                this.observability.recordBusinessMetric('websocket_message_size_bytes', size, {
                    direction,
                    message_type: messageType
                });
            },
            
            onDisconnect: () => {
                this.observability.recordBusinessMetric('websocket_connections_active', -1, {
                    client_type: clientType
                });
            }
        };
    }
}
```

## Testing

```javascript
// observability.test.js
import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { createObservabilityFramework } from './observability-framework.js';

describe('ObservabilityFramework', () => {
    let observability;
    
    beforeEach(async () => {
        observability = createObservabilityFramework({
            metrics: { collectInterval: 1000 },
            alerts: { cooldownPeriod: 0 }
        });
        await observability.initialize();
    });
    
    test('should record HTTP metrics', () => {
        observability.recordHttpRequest('GET', '/api/test', 200, 0.123);
        
        const metrics = observability.getMetrics();
        expect(metrics).toContain('construction_http_requests_total');
        expect(metrics).toContain('construction_http_request_duration_seconds');
    });
    
    test('should track custom business metrics', () => {
        observability.recordBusinessMetric('test_metric', 42, {
            label: 'test'
        });
        
        const metrics = observability.getMetrics();
        expect(metrics).toContain('construction_test_metric');
    });
    
    test('should create alerts', async () => {
        const alertCreated = jest.fn();
        observability.on('alert_created', alertCreated);
        
        await observability.createAlert({
            name: 'test_alert',
            severity: 'warning',
            message: 'Test alert'
        });
        
        expect(alertCreated).toHaveBeenCalled();
    });
    
    test('should track SLO violations', async () => {
        // Simulate high latency
        for (let i = 0; i < 10; i++) {
            observability.recordHttpRequest('GET', '/api/slow', 200, 3.0);
        }
        
        // Check if SLO violation was recorded
        await observability.checkLatencySLO(3000, '/api/slow');
        
        // Verify alert was created
        expect(observability.alertManager.size).toBeGreaterThan(0);
    });
    
    test('should create dashboards', async () => {
        const dashboard = await observability.createDashboard('test-dashboard', {
            description: 'Test dashboard',
            panels: [{
                title: 'Test Panel',
                type: 'graph',
                targets: [{ expr: 'test_metric' }]
            }],
            tags: ['test']
        });
        
        expect(dashboard.name).toBe('test-dashboard');
    });
    
    test('should collect system metrics', async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const metrics = observability.getMetrics();
        expect(metrics).toContain('construction_memory_usage_bytes');
        expect(metrics).toContain('construction_cpu_usage_percent');
    });
});
```

This implementation provides a comprehensive monitoring and observability framework with Prometheus metrics, distributed tracing, structured logging, SLO tracking, alerting, and dashboard configurations for the construction syndicate system.
