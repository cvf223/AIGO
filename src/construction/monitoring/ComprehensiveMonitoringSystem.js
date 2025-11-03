/**
 * 📊 COMPREHENSIVE MONITORING SYSTEM - Production Monitoring & Logging
 * ===================================================================
 * 
 * TODO 14: Implement comprehensive monitoring, logging, and error tracking
 * Real-time metrics, alerting, and complete audit trail
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Monitoring
 */

import { EventEmitter } from 'events';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export default class ComprehensiveMonitoringSystem extends EventEmitter {
    constructor() {
        super();
        
        this.config = {
            systemName: 'COMPREHENSIVE_MONITORING_SYSTEM',
            
            // Logging configuration
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                directory: process.env.LOGS_DIR || './logs',
                maxFileSize: 10 * 1024 * 1024, // 10MB
                maxFiles: 30, // 30 days
                format: 'json'
            },
            
            // Metrics collection
            metrics: {
                enabled: true,
                collectionInterval: 10000, // 10 seconds
                retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
                
                tracked: {
                    systemMetrics: true,
                    apiMetrics: true,
                    processingMetrics: true,
                    errorMetrics: true,
                    businessMetrics: true
                }
            },
            
            // Alerting
            alerting: {
                enabled: true,
                channels: ['log', 'event'],
                thresholds: {
                    errorRate: 0.05, // 5%
                    responseTime: 5000, // ms
                    memoryUsage: 0.90, // 90%
                    cpuUsage: 0.85, // 85%
                    queueSize: 50
                }
            },
            
            // Error tracking
            errorTracking: {
                captureStackTraces: true,
                groupSimilarErrors: true,
                maxErrorsStored: 1000,
                errorCategories: [
                    'analysis_error',
                    'classification_error',
                    'measurement_error',
                    'database_error',
                    'document_generation_error',
                    'api_error'
                ]
            }
        };
        
        // State
        this.logger = null;
        this.metricsData = {
            system: [],
            api: [],
            processing: [],
            errors: [],
            business: []
        };
        
        this.errorRegistry = new Map();
        this.alertsTriggered = [];
    }
    
    /**
     * 🚀 INITIALIZE MONITORING SYSTEM
     */
    async initialize() {
        console.log('📊 Initializing Comprehensive Monitoring System...');
        
        // Create log directory
        await fs.mkdir(this.config.logging.directory, { recursive: true });
        
        // Setup Winston logger
        await this.setupLogger();
        
        // Start metrics collection
        if (this.config.metrics.enabled) {
            this.startMetricsCollection();
        }
        
        // Setup error handlers
        this.setupGlobalErrorHandlers();
        
        this.logger.info('Monitoring system initialized', {
            config: this.config,
            environment: process.env.NODE_ENV
        });
        
        console.log('   ✅ Monitoring system active');
        
        return true;
    }
    
    /**
     * 📝 SETUP WINSTON LOGGER
     */
    async setupLogger() {
        this.logger = winston.createLogger({
            level: this.config.logging.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: {
                service: 'construction-ai',
                hostname: os.hostname(),
                pid: process.pid
            },
            transports: [
                // Console
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                
                // Combined log
                new winston.transports.File({
                    filename: path.join(this.config.logging.directory, 'combined.log'),
                    maxsize: this.config.logging.maxFileSize,
                    maxFiles: this.config.logging.maxFiles
                }),
                
                // Error log
                new winston.transports.File({
                    filename: path.join(this.config.logging.directory, 'error.log'),
                    level: 'error',
                    maxsize: this.config.logging.maxFileSize,
                    maxFiles: this.config.logging.maxFiles
                }),
                
                // Analysis-specific log
                new winston.transports.File({
                    filename: path.join(this.config.logging.directory, 'analysis.log'),
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(info => 
                            `${info.timestamp} [${info.level}]: ${info.message}`
                        )
                    )
                })
            ]
        });
    }
    
    /**
     * 📊 START METRICS COLLECTION
     */
    startMetricsCollection() {
        setInterval(() => {
            this.collectMetrics();
        }, this.config.metrics.collectionInterval);
    }
    
    /**
     * 📈 COLLECT METRICS
     */
    async collectMetrics() {
        const timestamp = Date.now();
        
        // System metrics
        if (this.config.metrics.tracked.systemMetrics) {
            const systemMetrics = {
                timestamp,
                cpu: process.cpuUsage(),
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                platform: {
                    loadAverage: os.loadavg(),
                    freeMemory: os.freemem(),
                    totalMemory: os.totalmem()
                }
            };
            
            this.metricsData.system.push(systemMetrics);
            
            // Check thresholds
            const memoryPercent = systemMetrics.memory.heapUsed / systemMetrics.memory.heapTotal;
            if (memoryPercent > this.config.alerting.thresholds.memoryUsage) {
                this.triggerAlert('high_memory_usage', {
                    current: memoryPercent,
                    threshold: this.config.alerting.thresholds.memoryUsage
                });
            }
        }
        
        // Cleanup old metrics
        this.cleanupOldMetrics();
    }
    
    /**
     * 🚨 TRIGGER ALERT
     */
    triggerAlert(alertType, data) {
        const alert = {
            id: `alert_${Date.now()}`,
            type: alertType,
            timestamp: new Date().toISOString(),
            severity: this.getAlertSeverity(alertType),
            data,
            acknowledged: false
        };
        
        this.alertsTriggered.push(alert);
        
        this.logger.warn('Alert triggered', alert);
        this.emit('alert', alert);
        
        // Keep only recent alerts
        if (this.alertsTriggered.length > 100) {
            this.alertsTriggered.shift();
        }
    }
    
    /**
     * ❌ LOG ERROR
     */
    logError(error, context = {}) {
        const errorEntry = {
            id: `error_${Date.now()}`,
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            category: this.categorizeError(error, context)
        };
        
        // Store error
        const errorKey = this.getErrorKey(error);
        if (!this.errorRegistry.has(errorKey)) {
            this.errorRegistry.set(errorKey, {
                firstOccurrence: errorEntry.timestamp,
                count: 0,
                examples: []
            });
        }
        
        const errorGroup = this.errorRegistry.get(errorKey);
        errorGroup.count++;
        if (errorGroup.examples.length < 5) {
            errorGroup.examples.push(errorEntry);
        }
        
        // Log to Winston
        this.logger.error(error.message, {
            error: errorEntry,
            count: errorGroup.count
        });
        
        // Add to metrics
        this.metricsData.errors.push(errorEntry);
    }
    
    /**
     * 📊 LOG BUSINESS METRIC
     */
    logBusinessMetric(metric, value, metadata = {}) {
        const entry = {
            timestamp: Date.now(),
            metric,
            value,
            metadata
        };
        
        this.metricsData.business.push(entry);
        
        this.logger.info('Business metric', entry);
    }
    
    /**
     * 🔍 GET MONITORING DASHBOARD DATA
     */
    getMonitoringDashboard() {
        const recentSystem = this.metricsData.system.slice(-10);
        const recentErrors = this.metricsData.errors.slice(-50);
        
        return {
            systemHealth: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                averageLoad: os.loadavg()
            },
            
            errorSummary: {
                recentErrors: recentErrors.length,
                errorsByCategory: this.groupErrorsByCategory(recentErrors),
                topErrors: this.getTopErrors(5)
            },
            
            performance: {
                cacheHitRate: this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses || 1),
                averageResponseTime: this.calculateAverageResponseTime(),
                slowOperations: this.metrics.processingTimes.filter(
                    t => t.duration > this.config.monitoring.logSlowOperations
                ).length
            },
            
            alerts: {
                active: this.alertsTriggered.filter(a => !a.acknowledged),
                total: this.alertsTriggered.length
            },
            
            business: {
                plansProcessed: this.metricsData.business.filter(m => m.metric === 'plan_processed').length,
                documentsGenerated: this.metricsData.business.filter(m => m.metric === 'document_generated').length,
                averageProcessingTime: this.calculateAverageBusinessMetric('processing_time')
            }
        };
    }
    
    // Helper methods
    
    setupGlobalErrorHandlers() {
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception', {
                error: error.message,
                stack: error.stack
            });
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection', {
                reason,
                promise
            });
        });
    }
    
    categorizeError(error, context) {
        if (context.phase === 'analysis') return 'analysis_error';
        if (context.phase === 'classification') return 'classification_error';
        if (context.phase === 'measurement') return 'measurement_error';
        if (error.message.includes('database')) return 'database_error';
        if (error.message.includes('document')) return 'document_generation_error';
        return 'unknown_error';
    }
    
    getErrorKey(error) {
        return `${error.name}_${error.message.substring(0, 50)}`;
    }
    
    getAlertSeverity(alertType) {
        const severities = {
            high_memory_usage: 'warning',
            high_error_rate: 'critical',
            slow_response: 'warning',
            queue_full: 'warning'
        };
        return severities[alertType] || 'info';
    }
    
    cleanupOldMetrics() {
        const cutoff = Date.now() - this.config.metrics.retentionPeriod;
        
        for (const [key, metrics] of Object.entries(this.metricsData)) {
            this.metricsData[key] = metrics.filter(m => m.timestamp > cutoff);
        }
    }
    
    groupErrorsByCategory(errors) {
        return errors.reduce((acc, error) => {
            acc[error.category] = (acc[error.category] || 0) + 1;
            return acc;
        }, {});
    }
    
    getTopErrors(count) {
        return Array.from(this.errorRegistry.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, count)
            .map(([key, data]) => ({
                error: key,
                count: data.count,
                firstSeen: data.firstOccurrence
            }));
    }
    
    calculateAverageResponseTime() {
        const recent = this.metrics.processingTimes.slice(-100);
        return recent.length > 0
            ? recent.reduce((sum, t) => sum + t.duration, 0) / recent.length
            : 0;
    }
    
    calculateAverageBusinessMetric(metric) {
        const values = this.metricsData.business
            .filter(m => m.metric === metric)
            .map(m => m.value);
        
        return values.length > 0
            ? values.reduce((sum, v) => sum + v, 0) / values.length
            : 0;
    }
}

