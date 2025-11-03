/**
 * 📊 REAL-TIME LOGGING SERVICE
 * ===========================
 * 
 * Provides centralized logging with WebSocket streaming for the web frontend.
 * Captures all system operations, errors, and agent activities in real-time.
 * 
 * Features:
 * - Real-time WebSocket streaming to frontend
 * - Structured logging with levels and categories
 * - Advanced filtering and search capabilities
 * - Database persistence for historical analysis
 * - Auto-cleanup of old logs
 */

import { EventEmitter } from 'events';
import { executeQuery } from '../../database/contract-advancement-database.js';
import WebSocket from 'ws';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR LOGGING SERVICE)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR LOGGING SERVICE)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../construction/prevention/ProactiveConstructionInferenceEngine.js';;

/**
 * 📊 REAL-TIME LOGGING SERVICE
 * ENHANCED with SPECIALIZED LOGGING Formal Reasoning & Proactive Prevention
 * ===========================
 */
export class LoggingService extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            maxLogBufferSize: config.maxLogBufferSize || 10000,
            logRetentionDays: config.logRetentionDays || 30,
            enableDatabaseLogging: config.enableDatabaseLogging !== false,
            enableWebSocketStreaming: config.enableWebSocketStreaming !== false,
            logLevels: config.logLevels || ['ERROR', 'WARN', 'INFO', 'DEBUG', 'SUCCESS'],
            ...config
        };

        this.logBuffer = [];
        this.websocketClients = new Set();
        this.filters = new Map();
        this.databaseAvailable = false;
        
        this.setupDatabaseSchema();
        this.startCleanupScheduler();
        
        console.log('📊 [LOGGING] Real-time logging service initialized');
    }

    /**
     * 🗄️ SETUP DATABASE SCHEMA
     */
    async setupDatabaseSchema() {
        if (!this.config.enableDatabaseLogging) return;

        try {
            // First try to initialize the database connection
            await this.initializeDatabaseConnection();
            
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS system_logs (
                    id SERIAL PRIMARY KEY,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    level VARCHAR(10) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    component VARCHAR(100),
                    agent_id VARCHAR(255),
                    chain VARCHAR(50),
                    operation VARCHAR(100),
                    message TEXT NOT NULL,
                    details JSONB DEFAULT '{}',
                    stack_trace TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);
                CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
                CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
                CREATE INDEX IF NOT EXISTS idx_system_logs_component ON system_logs(component);
                CREATE INDEX IF NOT EXISTS idx_system_logs_agent ON system_logs(agent_id);
                CREATE INDEX IF NOT EXISTS idx_system_logs_chain ON system_logs(chain);
            `;
            
            await executeQuery(createTableQuery);
            this.databaseAvailable = true;
            console.log('📊 [LOGGING] Database schema initialized successfully');
        } catch (error) {
            this.databaseAvailable = false;
            console.warn('📊 [LOGGING] Database not available - operating in memory-only mode:', error.message);
            // Disable database logging since it's not available
            this.config.enableDatabaseLogging = false;
        }
    }

    /**
     * 🔌 INITIALIZE DATABASE CONNECTION 
     */
    async initializeDatabaseConnection() {
        try {
            // Try to import and initialize the database
            const { initializeDatabase } = await import('../../database/contract-advancement-database.js');
            await initializeDatabase();
            console.log('📊 [LOGGING] Database connection initialized');
        } catch (error) {
            throw new Error(`Database initialization failed: ${error.message}`);
        }
    }

    /**
     * 📝 CORE LOGGING METHOD
     */
    log(level, category, message, details = {}) {
        const logEntry = {
            id: this.generateLogId(),
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            category: category.toUpperCase(),
            component: details.component || null,
            agentId: details.agentId || null,
            chain: details.chain || null,
            operation: details.operation || null,
            message: message,
            details: details,
            stackTrace: details.error?.stack || null
        };

        // Add to buffer
        this.addToBuffer(logEntry);

        // Stream to WebSocket clients
        this.streamToClients(logEntry);

        // Persist to database
        this.persistToDatabase(logEntry);

        // Emit event for other listeners
        this.emit('log', logEntry);

        return logEntry;
    }

    /**
     * 🎯 CONVENIENT LOGGING METHODS
     */
    error(category, message, details = {}) {
        return this.log('ERROR', category, message, { ...details, emoji: '🔴' });
    }

    warn(category, message, details = {}) {
        return this.log('WARN', category, message, { ...details, emoji: '🟡' });
    }

    info(category, message, details = {}) {
        return this.log('INFO', category, message, { ...details, emoji: '🔵' });
    }

    debug(category, message, details = {}) {
        return this.log('DEBUG', category, message, { ...details, emoji: '⚫' });
    }

    success(category, message, details = {}) {
        return this.log('SUCCESS', category, message, { ...details, emoji: '🟢' });
    }

    /**
     * 🏷️ SPECIFIC CATEGORY LOGGERS
     */
    logAgentOperation(agentId, operation, message, details = {}) {
        return this.info('AGENT-OPS', message, {
            agentId,
            operation,
            component: 'AgentOperations',
            ...details
        });
    }

    logBlockchainInteraction(chain, operation, message, details = {}) {
        return this.info('BLOCKCHAIN', message, {
            chain,
            operation,
            component: 'BlockchainInteraction',
            ...details
        });
    }

    logCommunication(type, message, details = {}) {
        return this.info('COMMUNICATION', message, {
            operation: type,
            component: 'CommunicationSystem',
            ...details
        });
    }

    logDatabase(operation, message, details = {}) {
        return this.info('DATABASE', message, {
            operation,
            component: 'DatabaseOperations',
            ...details
        });
    }

    logLLMInteraction(operation, message, details = {}) {
        return this.info('LLM', message, {
            operation,
            component: 'LLMIntegration',
            ...details
        });
    }

    logPerformance(metric, message, details = {}) {
        return this.info('PERFORMANCE', message, {
            operation: metric,
            component: 'PerformanceMonitoring',
            ...details
        });
    }

    logHumanEscalation(escalationId, message, details = {}) {
        return this.info('ESCALATION', message, {
            escalationId,
            component: 'HumanInTheLoop',
            ...details
        });
    }

    logCapabilityCreation(requestId, message, details = {}) {
        return this.info('CAPABILITY', message, {
            requestId,
            component: 'CapabilityCreation',
            ...details
        });
    }

    /**
     * 📊 WEBSOCKET STREAMING
     */
    addWebSocketClient(ws) {
        this.websocketClients.add(ws);
        
        ws.on('close', () => {
            this.websocketClients.delete(ws);
        });

        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                this.handleClientMessage(ws, message);
            } catch (error) {
                console.error('📊 [LOGGING] Invalid WebSocket message:', error);
            }
        });

        // Send recent logs to new client
        this.sendRecentLogs(ws);
        console.log(`📊 [LOGGING] WebSocket client connected (${this.websocketClients.size} total)`);
    }

    streamToClients(logEntry) {
        if (!this.config.enableWebSocketStreaming) return;

        const message = JSON.stringify({
            type: 'log',
            data: this.formatLogForFrontend(logEntry)
        });

        this.websocketClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                } catch (error) {
                    console.error('📊 [LOGGING] Error streaming to client:', error);
                    this.websocketClients.delete(client);
                }
            }
        });
    }

    handleClientMessage(ws, message) {
        switch (message.type) {
            case 'setFilter':
                this.setClientFilter(ws, message.filters);
                break;
            case 'exportLogs':
                this.exportLogs(ws, message.options);
                break;
            case 'searchLogs':
                this.searchLogs(ws, message.query);
                break;
            default:
                console.warn('📊 [LOGGING] Unknown client message type:', message.type);
        }
    }

    /**
     * 🔍 FILTERING AND SEARCH
     */
    setClientFilter(ws, filters) {
        this.filters.set(ws, filters);
        
        // Send filtered recent logs
        const filteredLogs = this.getFilteredLogs(filters);
        ws.send(JSON.stringify({
            type: 'filteredLogs',
            data: filteredLogs.map(log => this.formatLogForFrontend(log))
        }));
    }

    getFilteredLogs(filters = {}) {
        return this.logBuffer.filter(log => {
            // Level filter
            if (filters.levels && !filters.levels.includes(log.level)) {
                return false;
            }

            // Category filter
            if (filters.categories && !filters.categories.includes(log.category)) {
                return false;
            }

            // Component filter
            if (filters.components && log.component && !filters.components.includes(log.component)) {
                return false;
            }

            // Agent filter
            if (filters.agents && log.agentId && !filters.agents.includes(log.agentId)) {
                return false;
            }

            // Chain filter
            if (filters.chains && log.chain && !filters.chains.includes(log.chain)) {
                return false;
            }

            // Time range filter
            if (filters.timeRange) {
                const logTime = new Date(log.timestamp).getTime();
                const now = Date.now();
                const timeLimit = now - (filters.timeRange * 60 * 1000); // minutes to ms
                if (logTime < timeLimit) {
                    return false;
                }
            }

            // Text search
            if (filters.search) {
                const searchText = filters.search.toLowerCase();
                const searchable = `${log.message} ${JSON.stringify(log.details)}`.toLowerCase();
                if (!searchable.includes(searchText)) {
                    return false;
                }
            }

            return true;
        });
    }

    async searchLogs(ws, query) {
        try {
            const searchQuery = `
                SELECT * FROM system_logs 
                WHERE message ILIKE $1 OR details::text ILIKE $1
                ORDER BY timestamp DESC 
                LIMIT 1000
            `;
            
            const result = await executeQuery(searchQuery, [`%${query}%`]);
            
            ws.send(JSON.stringify({
                type: 'searchResults',
                data: result.rows.map(log => this.formatLogForFrontend(log))
            }));
        } catch (error) {
            console.error('📊 [LOGGING] Search error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Search failed'
            }));
        }
    }

    /**
     * 📤 EXPORT FUNCTIONALITY
     */
    async exportLogs(ws, options = {}) {
        try {
            const logs = options.filtered ? 
                this.getFilteredLogs(options.filters) : 
                this.logBuffer;

            const exportData = {
                timestamp: new Date().toISOString(),
                totalLogs: logs.length,
                logs: logs.map(log => this.formatLogForExport(log))
            };

            ws.send(JSON.stringify({
                type: 'exportData',
                format: options.format || 'json',
                data: options.format === 'csv' ? this.convertToCsv(exportData.logs) : exportData
            }));
        } catch (error) {
            console.error('📊 [LOGGING] Export error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Export failed'
            }));
        }
    }

    /**
     * 🗄️ DATABASE PERSISTENCE
     */
    async persistToDatabase(logEntry) {
        if (!this.config.enableDatabaseLogging || !this.databaseAvailable) return;

        try {
            const query = `
                INSERT INTO system_logs (
                    timestamp, level, category, component, agent_id, chain, 
                    operation, message, details, stack_trace
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

            await executeQuery(query, [
                logEntry.timestamp,
                logEntry.level,
                logEntry.category,
                logEntry.component,
                logEntry.agentId,
                logEntry.chain,
                logEntry.operation,
                logEntry.message,
                JSON.stringify(logEntry.details),
                logEntry.stackTrace
            ]);
        } catch (error) {
            // If we get a database error, disable database logging
            this.databaseAvailable = false;
            this.config.enableDatabaseLogging = false;
            console.warn('📊 [LOGGING] Database persistence failed - switching to memory-only mode:', error.message);
        }
    }

    /**
     * 🧹 UTILITY METHODS
     */
    addToBuffer(logEntry) {
        this.logBuffer.push(logEntry);
        
        // Maintain buffer size
        if (this.logBuffer.length > this.config.maxLogBufferSize) {
            this.logBuffer = this.logBuffer.slice(-this.config.maxLogBufferSize);
        }
    }

    generateLogId() {
        return `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    formatLogForFrontend(logEntry) {
        return {
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            level: logEntry.level,
            category: logEntry.category,
            component: logEntry.component,
            agentId: logEntry.agentId,
            chain: logEntry.chain,
            operation: logEntry.operation,
            message: logEntry.message,
            emoji: logEntry.details?.emoji || this.getLevelEmoji(logEntry.level),
            details: logEntry.details
        };
    }

    formatLogForExport(logEntry) {
        return {
            timestamp: logEntry.timestamp,
            level: logEntry.level,
            category: logEntry.category,
            component: logEntry.component || '',
            agentId: logEntry.agentId || '',
            chain: logEntry.chain || '',
            operation: logEntry.operation || '',
            message: logEntry.message,
            details: JSON.stringify(logEntry.details)
        };
    }

    getLevelEmoji(level) {
        const emojis = {
            'ERROR': '🔴',
            'WARN': '🟡',
            'INFO': '🔵',
            'DEBUG': '⚫',
            'SUCCESS': '🟢'
        };
        return emojis[level] || '📊';
    }

    convertToCsv(logs) {
        if (logs.length === 0) return '';

        const headers = Object.keys(logs[0]);
        const csvContent = [
            headers.join(','),
            ...logs.map(log => 
                headers.map(header => 
                    `"${String(log[header]).replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');

        return csvContent;
    }

    sendRecentLogs(ws, count = 100) {
        const recentLogs = this.logBuffer.slice(-count);
        ws.send(JSON.stringify({
            type: 'recentLogs',
            data: recentLogs.map(log => this.formatLogForFrontend(log))
        }));
    }

    startCleanupScheduler() {
        // Clean up old logs every 24 hours
        setInterval(async () => {
            await this.cleanupOldLogs();
        }, 24 * 60 * 60 * 1000);
    }

    async cleanupOldLogs() {
        if (!this.config.enableDatabaseLogging || !this.databaseAvailable) return;

        try {
            const cleanupQuery = `
                DELETE FROM system_logs 
                WHERE timestamp < NOW() - INTERVAL '${this.config.logRetentionDays} days'
            `;
            
            const result = await executeQuery(cleanupQuery);
            console.log(`📊 [LOGGING] Cleaned up ${result.rowCount} old log entries`);
        } catch (error) {
            console.warn('📊 [LOGGING] Cleanup error - database may not be available:', error.message);
        }
    }

    /**
     * 📊 STATISTICS AND METRICS
     */
    getLogStatistics() {
        const stats = {
            totalLogs: this.logBuffer.length,
            byLevel: {},
            byCategory: {},
            byComponent: {},
            lastHour: 0
        };

        const oneHourAgo = Date.now() - (60 * 60 * 1000);

        this.logBuffer.forEach(log => {
            // By level
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
            
            // By category
            stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
            
            // By component
            if (log.component) {
                stats.byComponent[log.component] = (stats.byComponent[log.component] || 0) + 1;
            }
            
            // Last hour
            if (new Date(log.timestamp).getTime() > oneHourAgo) {
                stats.lastHour++;
            }
        });

        return stats;
    }
}

// Global logger instance
export const logger = new LoggingService();

// Export convenience methods
export const {
    log, error, warn, info, debug, success,
    logAgentOperation, logBlockchainInteraction, logCommunication,
    logDatabase, logLLMInteraction, logPerformance,
    logHumanEscalation, logCapabilityCreation
} = logger;
