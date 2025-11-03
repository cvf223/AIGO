/**
 * 🌐 LOG STREAMING WEBSOCKET SERVER
 * =================================
 * 
 * Provides real-time log streaming to the web frontend via WebSocket connections.
 * Handles client connections, filtering, and real-time log broadcasts.
 */

import { WebSocketServer } from 'ws';
import { logger } from './LoggingService.js';
import { EventEmitter } from 'events';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR LOG STREAMING SERVER)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR LOG STREAMING SERVER)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../construction/prevention/ProactiveConstructionInferenceEngine.js';;

/**
 * 🌐 LOG STREAMING WEBSOCKET SERVER
 * ENHANCED with SPECIALIZED LOG STREAMING Formal Reasoning & Proactive Prevention
 * =================================
 */
export class LogStreamingServer extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            port: config.port || 8081,
            host: config.host || 'localhost',
            maxConnections: config.maxConnections || 100,
            ...config
        };

        this.server = null;
        this.clients = new Map(); // WebSocket -> client info
        this.isRunning = false;
        
        this.setupServer();
    }

    /**
     * 🚀 SETUP WEBSOCKET SERVER
     */
    setupServer() {
        this.server = new WebSocketServer({
            port: this.config.port,
            host: this.config.host
        });

        this.server.on('connection', (ws, request) => {
            this.handleConnection(ws, request);
        });

        this.server.on('listening', () => {
            this.isRunning = true;
            const address = this.server.address();
            
            // 🔧 CRITICAL FIX: Handle EPIPE errors gracefully
            try {
                console.log(`🌐 [LOG-STREAM] WebSocket server listening on ${address.address}:${address.port}`);
                logger.success('LOG-STREAM', `WebSocket server started on ${address.address}:${address.port}`, {
                    component: 'LogStreamingServer',
                    port: address.port
                });
            } catch (error) {
                if (error.code === 'EPIPE') {
                    // Silent fail on broken pipe - stdout likely closed
                    return;
                }
                throw error;
            }
        });

        this.server.on('error', (error) => {
            // 🔧 CRITICAL FIX: Handle EPIPE and other errors gracefully
            if (error.code === 'EPIPE') {
                // Silent fail on broken pipe
                return;
            }
            
            try {
                console.error('🌐 [LOG-STREAM] Server error:', error);
                logger.error('LOG-STREAM', `WebSocket server error: ${error.message}`, {
                    component: 'LogStreamingServer',
                    error: error
                });
            } catch (logError) {
                // Silent fail if logging also fails
            }
        });
    }

    /**
     * 🤝 HANDLE CLIENT CONNECTIONS
     */
    handleConnection(ws, request) {
        // Check connection limit
        if (this.clients.size >= this.config.maxConnections) {
            ws.close(1013, 'Server overloaded');
            return;
        }

        const clientInfo = {
            id: this.generateClientId(),
            connectedAt: new Date(),
            lastPing: new Date(),
            filters: {},
            ip: request.socket.remoteAddress,
            userAgent: request.headers['user-agent'] || 'Unknown'
        };

        this.clients.set(ws, clientInfo);

        console.log(`🌐 [LOG-STREAM] Client connected: ${clientInfo.id} (${this.clients.size} total)`);
        logger.info('LOG-STREAM', `Client connected: ${clientInfo.id}`, {
            component: 'LogStreamingServer',
            clientId: clientInfo.id,
            totalClients: this.clients.size,
            clientIp: clientInfo.ip
        });

        // Setup client event handlers
        this.setupClientHandlers(ws, clientInfo);

        // Register with logging service
        logger.addWebSocketClient(ws);

        // Send welcome message
        this.sendToClient(ws, {
            type: 'welcome',
            clientId: clientInfo.id,
            serverInfo: {
                version: '1.0.0',
                features: ['filtering', 'search', 'export', 'real-time'],
                maxBufferSize: logger.config.maxLogBufferSize
            }
        });

        // Send current log statistics
        this.sendLogStatistics(ws);
    }

    /**
     * 🔧 SETUP CLIENT EVENT HANDLERS
     */
    setupClientHandlers(ws, clientInfo) {
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleClientMessage(ws, clientInfo, message);
            } catch (error) {
                logger.error('LOG-STREAM', `Invalid message from client ${clientInfo.id}`, {
                    component: 'LogStreamingServer',
                    clientId: clientInfo.id,
                    error: error.message
                });
                
                this.sendToClient(ws, {
                    type: 'error',
                    message: 'Invalid JSON message'
                });
            }
        });

        ws.on('pong', () => {
            clientInfo.lastPing = new Date();
        });

        ws.on('close', (code, reason) => {
            this.handleClientDisconnect(ws, clientInfo, code, reason);
        });

        ws.on('error', (error) => {
            console.error(`🌐 [LOG-STREAM] Client error ${clientInfo.id}:`, error);
            logger.error('LOG-STREAM', `Client error: ${clientInfo.id}`, {
                component: 'LogStreamingServer',
                clientId: clientInfo.id,
                error: error.message
            });
        });

        // Start ping interval for this client
        clientInfo.pingInterval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
                ws.ping();
            }
        }, 30000); // Ping every 30 seconds
    }

    /**
     * 📝 HANDLE CLIENT MESSAGES
     */
    handleClientMessage(ws, clientInfo, message) {
        logger.debug('LOG-STREAM', `Message from client ${clientInfo.id}: ${message.type}`, {
            component: 'LogStreamingServer',
            clientId: clientInfo.id,
            messageType: message.type
        });

        switch (message.type) {
            case 'setFilter':
                this.handleSetFilter(ws, clientInfo, message);
                break;

            case 'clearFilter':
                this.handleClearFilter(ws, clientInfo);
                break;

            case 'requestLogs':
                this.handleRequestLogs(ws, clientInfo, message);
                break;

            case 'exportLogs':
                this.handleExportLogs(ws, clientInfo, message);
                break;

            case 'searchLogs':
                this.handleSearchLogs(ws, clientInfo, message);
                break;

            case 'getStatistics':
                this.sendLogStatistics(ws);
                break;

            case 'ping':
                this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
                break;

            default:
                logger.warn('LOG-STREAM', `Unknown message type from client ${clientInfo.id}: ${message.type}`, {
                    component: 'LogStreamingServer',
                    clientId: clientInfo.id,
                    messageType: message.type
                });
                
                this.sendToClient(ws, {
                    type: 'error',
                    message: `Unknown message type: ${message.type}`
                });
        }
    }

    /**
     * 🔍 FILTER HANDLING
     */
    handleSetFilter(ws, clientInfo, message) {
        clientInfo.filters = message.filters || {};
        
        logger.info('LOG-STREAM', `Client ${clientInfo.id} set filters`, {
            component: 'LogStreamingServer',
            clientId: clientInfo.id,
            filters: clientInfo.filters
        });

        this.sendToClient(ws, {
            type: 'filterSet',
            filters: clientInfo.filters
        });

        // Send filtered logs immediately
        this.sendFilteredLogs(ws, clientInfo);
    }

    handleClearFilter(ws, clientInfo) {
        clientInfo.filters = {};
        
        logger.info('LOG-STREAM', `Client ${clientInfo.id} cleared filters`, {
            component: 'LogStreamingServer',
            clientId: clientInfo.id
        });

        this.sendToClient(ws, {
            type: 'filterCleared'
        });

        // Send recent unfiltered logs
        logger.sendRecentLogs(ws);
    }

    sendFilteredLogs(ws, clientInfo) {
        const filteredLogs = logger.getFilteredLogs(clientInfo.filters);
        
        this.sendToClient(ws, {
            type: 'filteredLogs',
            data: filteredLogs.map(log => logger.formatLogForFrontend(log)),
            count: filteredLogs.length
        });
    }

    /**
     * 📊 LOG REQUEST HANDLING
     */
    handleRequestLogs(ws, clientInfo, message) {
        const count = Math.min(message.count || 100, 1000); // Max 1000 logs
        const offset = message.offset || 0;
        
        const logs = logger.logBuffer.slice(-(count + offset), -offset || undefined);
        
        this.sendToClient(ws, {
            type: 'logsResponse',
            data: logs.map(log => logger.formatLogForFrontend(log)),
            count: logs.length,
            totalAvailable: logger.logBuffer.length
        });
    }

    /**
     * 📤 EXPORT HANDLING
     */
    handleExportLogs(ws, clientInfo, message) {
        try {
            const options = message.options || {};
            const logs = options.useFilters ? 
                logger.getFilteredLogs(clientInfo.filters) : 
                logger.logBuffer;

            const exportData = {
                timestamp: new Date().toISOString(),
                clientId: clientInfo.id,
                filters: options.useFilters ? clientInfo.filters : null,
                totalLogs: logs.length,
                logs: logs.map(log => logger.formatLogForExport(log))
            };

            this.sendToClient(ws, {
                type: 'exportData',
                format: options.format || 'json',
                filename: `syndicate-logs-${new Date().toISOString().split('T')[0]}.${options.format || 'json'}`,
                data: options.format === 'csv' ? logger.convertToCsv(exportData.logs) : exportData
            });

            logger.info('LOG-STREAM', `Client ${clientInfo.id} exported ${logs.length} logs`, {
                component: 'LogStreamingServer',
                clientId: clientInfo.id,
                exportCount: logs.length,
                format: options.format || 'json'
            });

        } catch (error) {
            logger.error('LOG-STREAM', `Export error for client ${clientInfo.id}`, {
                component: 'LogStreamingServer',
                clientId: clientInfo.id,
                error: error.message
            });

            this.sendToClient(ws, {
                type: 'error',
                message: 'Export failed'
            });
        }
    }

    /**
     * 🔍 SEARCH HANDLING
     */
    async handleSearchLogs(ws, clientInfo, message) {
        try {
            const query = message.query;
            const options = message.options || {};
            
            // For now, search in memory buffer
            // TODO: Implement database search for historical logs
            const searchResults = logger.logBuffer.filter(log => {
                const searchText = query.toLowerCase();
                const searchable = `${log.message} ${JSON.stringify(log.details)}`.toLowerCase();
                return searchable.includes(searchText);
            });

            this.sendToClient(ws, {
                type: 'searchResults',
                query: query,
                data: searchResults.map(log => logger.formatLogForFrontend(log)),
                count: searchResults.length
            });

            logger.info('LOG-STREAM', `Client ${clientInfo.id} searched: "${query}" (${searchResults.length} results)`, {
                component: 'LogStreamingServer',
                clientId: clientInfo.id,
                searchQuery: query,
                resultCount: searchResults.length
            });

        } catch (error) {
            logger.error('LOG-STREAM', `Search error for client ${clientInfo.id}`, {
                component: 'LogStreamingServer',
                clientId: clientInfo.id,
                error: error.message
            });

            this.sendToClient(ws, {
                type: 'error',
                message: 'Search failed'
            });
        }
    }

    /**
     * 📊 SEND LOG STATISTICS
     */
    sendLogStatistics(ws) {
        const stats = logger.getLogStatistics();
        
        this.sendToClient(ws, {
            type: 'statistics',
            data: {
                ...stats,
                connectedClients: this.clients.size,
                serverUptime: this.getUptime()
            }
        });
    }

    /**
     * 🔌 CLIENT DISCONNECT HANDLING
     */
    handleClientDisconnect(ws, clientInfo, code, reason) {
        // Clear ping interval
        if (clientInfo.pingInterval) {
            clearInterval(clientInfo.pingInterval);
        }

        // Remove from clients map
        this.clients.delete(ws);

        const disconnectReason = reason ? reason.toString() : 'Unknown';
        
        console.log(`🌐 [LOG-STREAM] Client disconnected: ${clientInfo.id} (${this.clients.size} remaining)`);
        logger.info('LOG-STREAM', `Client disconnected: ${clientInfo.id}`, {
            component: 'LogStreamingServer',
            clientId: clientInfo.id,
            disconnectCode: code,
            disconnectReason: disconnectReason,
            remainingClients: this.clients.size,
            sessionDuration: Date.now() - clientInfo.connectedAt.getTime()
        });
    }

    /**
     * 📤 UTILITY METHODS
     */
    sendToClient(ws, message) {
        if (ws.readyState === ws.OPEN) {
            try {
                ws.send(JSON.stringify(message));
            } catch (error) {
                console.error('🌐 [LOG-STREAM] Error sending to client:', error);
            }
        }
    }

    broadcastToAll(message) {
        const messageStr = JSON.stringify(message);
        
        this.clients.forEach((clientInfo, ws) => {
            if (ws.readyState === ws.OPEN) {
                try {
                    ws.send(messageStr);
                } catch (error) {
                    console.error(`🌐 [LOG-STREAM] Error broadcasting to client ${clientInfo.id}:`, error);
                }
            }
        });
    }

    generateClientId() {
        return `CLIENT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    }

    getUptime() {
        return Date.now() - (this.startTime || Date.now());
    }

    /**
     * 🔄 SERVER CONTROL
     */
    start() {
        if (!this.isRunning) {
            this.startTime = Date.now();
            // Server is set up in constructor
            logger.info('LOG-STREAM', 'Starting WebSocket server', {
                component: 'LogStreamingServer',
                port: this.config.port
            });
        }
    }

    stop() {
        if (this.server && this.isRunning) {
            this.server.close(() => {
                this.isRunning = false;
                logger.info('LOG-STREAM', 'WebSocket server stopped', {
                    component: 'LogStreamingServer'
                });
            });

            // Close all client connections
            this.clients.forEach((clientInfo, ws) => {
                ws.close(1001, 'Server shutting down');
            });
        }
    }

    /**
     * 📊 SERVER STATUS
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.config.port,
            connectedClients: this.clients.size,
            maxConnections: this.config.maxConnections,
            uptime: this.getUptime(),
            clients: Array.from(this.clients.values()).map(client => ({
                id: client.id,
                connectedAt: client.connectedAt,
                ip: client.ip,
                hasFilters: Object.keys(client.filters).length > 0
            }))
        };
    }
}

// Export singleton instance
export const logStreamingServer = new LogStreamingServer();
