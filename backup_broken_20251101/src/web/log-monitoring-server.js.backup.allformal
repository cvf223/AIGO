/**
 * 🌐 LOG MONITORING WEB SERVER
 * ===========================
 * 
 * Provides the web interface for real-time log monitoring with WebSocket streaming.
 * Serves the frontend and handles all log-related API endpoints.
 */

import express from 'express';
import { createServer } from 'http';
import path from 'path';
import cors from 'cors';
import { logger, LoggingService } from '../services/LoggingService.js';
import { logStreamingServer } from '../services/LogStreamingServer.js';

export class LogMonitoringServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3001,
            host: config.host || 'localhost',
            enableCors: config.enableCors !== false,
            staticPath: config.staticPath || path.join(process.cwd(), 'web-gui', 'dist'),
            ...config
        };

        this.app = express();
        this.server = null;
        this.isRunning = false;

        this.setupMiddleware();
        this.setupRoutes();
        this.setupServer();
    }

    /**
     * 🔧 SETUP MIDDLEWARE
     */
    setupMiddleware() {
        // CORS support
        if (this.config.enableCors) {
            this.app.use(cors({
                origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:8080'],
                credentials: true
            }));
        }

        // JSON parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.debug('HTTP-REQUEST', `${req.method} ${req.path}`, {
                component: 'LogMonitoringServer',
                method: req.method,
                path: req.path,
                userAgent: req.get('User-Agent'),
                ip: req.ip
            });
            next();
        });

        // Error handling
        this.app.use((error, req, res, next) => {
            logger.error('HTTP-ERROR', `Server error: ${error.message}`, {
                component: 'LogMonitoringServer',
                error: error.message,
                stack: error.stack,
                path: req.path,
                method: req.method
            });

            res.status(500).json({
                error: 'Internal server error',
                message: error.message
            });
        });
    }

    /**
     * 🛣️ SETUP ROUTES
     */
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                logStreamingServer: logStreamingServer.getStatus(),
                loggingService: {
                    bufferSize: logger.logBuffer.length,
                    websocketClients: logger.websocketClients.size
                }
            });
        });

        // Log statistics
        this.app.get('/api/logs/statistics', (req, res) => {
            try {
                const stats = logger.getLogStatistics();
                res.json({
                    success: true,
                    data: stats
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting log statistics: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/statistics'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Recent logs
        this.app.get('/api/logs/recent', (req, res) => {
            try {
                const count = Math.min(parseInt(req.query.count) || 100, 1000);
                const recentLogs = logger.logBuffer.slice(-count);
                
                res.json({
                    success: true,
                    data: recentLogs.map(log => logger.formatLogForFrontend(log)),
                    total: recentLogs.length
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting recent logs: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/recent'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Filtered logs
        this.app.post('/api/logs/filter', (req, res) => {
            try {
                const filters = req.body.filters || {};
                const filteredLogs = logger.getFilteredLogs(filters);
                
                res.json({
                    success: true,
                    data: filteredLogs.map(log => logger.formatLogForFrontend(log)),
                    total: filteredLogs.length,
                    filters: filters
                });
            } catch (error) {
                logger.error('API-ERROR', `Error filtering logs: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/filter',
                    filters: req.body.filters
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Export logs
        this.app.post('/api/logs/export', (req, res) => {
            try {
                const options = req.body.options || {};
                const logs = options.useFilters ? 
                    logger.getFilteredLogs(options.filters) : 
                    logger.logBuffer;

                const exportData = {
                    timestamp: new Date().toISOString(),
                    totalLogs: logs.length,
                    logs: logs.map(log => logger.formatLogForExport(log))
                };

                if (options.format === 'csv') {
                    const csvData = logger.convertToCsv(exportData.logs);
                    res.set({
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename=syndicate-logs-${new Date().toISOString().split('T')[0]}.csv`
                    });
                    res.send(csvData);
                } else {
                    res.set({
                        'Content-Type': 'application/json',
                        'Content-Disposition': `attachment; filename=syndicate-logs-${new Date().toISOString().split('T')[0]}.json`
                    });
                    res.json(exportData);
                }

                logger.info('API-SUCCESS', `Exported ${logs.length} logs as ${options.format || 'json'}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/export',
                    exportCount: logs.length,
                    format: options.format || 'json'
                });

            } catch (error) {
                logger.error('API-ERROR', `Error exporting logs: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/export'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // WebSocket connection info
        this.app.get('/api/websocket/info', (req, res) => {
            res.json({
                success: true,
                data: {
                    url: `ws://${this.config.host}:8081`,
                    status: logStreamingServer.getStatus(),
                    supportedMessages: [
                        'setFilter',
                        'clearFilter', 
                        'requestLogs',
                        'exportLogs',
                        'searchLogs',
                        'getStatistics',
                        'ping'
                    ]
                }
            });
        });

        // System status
        this.app.get('/api/system/status', (req, res) => {
            res.json({
                success: true,
                data: {
                    server: {
                        port: this.config.port,
                        uptime: this.getUptime(),
                        isRunning: this.isRunning
                    },
                    logStreaming: logStreamingServer.getStatus(),
                    logging: {
                        bufferSize: logger.logBuffer.length,
                        maxBufferSize: logger.config.maxLogBufferSize,
                        retentionDays: logger.config.logRetentionDays,
                        enabledLevels: logger.config.logLevels
                    }
                }
            });
        });

        // ===== CONSTRUCTION-SPECIFIC ENDPOINTS =====
        
        // Construction systems overview
        this.app.get('/api/construction/systems', (req, res) => {
            try {
                // This endpoint will be populated by the construction GUI server
                // For now, return basic structure
                res.json({
                    success: true,
                    data: {
                        totalSystems: 60,
                        categories: [
                            'Core Orchestration',
                            'LLM Services',
                            'Memory Systems',
                            'Learning Systems',
                            'Quantum Engines',
                            'Formal Reasoning & Verification',
                            'Proactive Prevention',
                            'Construction Services',
                            'Enhancement Systems'
                        ]
                    }
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting construction systems: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/construction/systems'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Construction project logs
        this.app.get('/api/construction/projects/logs', (req, res) => {
            try {
                const projectLogs = logger.logBuffer.filter(log => 
                    log.details?.component?.includes('Construction') ||
                    log.details?.component?.includes('HOAI') ||
                    log.details?.component?.includes('Vision') ||
                    log.category?.includes('CONSTRUCTION')
                );

                res.json({
                    success: true,
                    data: projectLogs.map(log => logger.formatLogForFrontend(log)),
                    total: projectLogs.length
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting construction project logs: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/construction/projects/logs'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Construction plan processing events
        this.app.get('/api/construction/plans/events', (req, res) => {
            try {
                const planEvents = logger.logBuffer.filter(log =>
                    log.category === 'PLAN-ANALYSIS' ||
                    log.category === 'ERROR-DETECTION' ||
                    log.category === 'QUANTITY-EXTRACTION' ||
                    log.category === 'COMPLIANCE-CHECK'
                );

                res.json({
                    success: true,
                    data: planEvents.map(log => logger.formatLogForFrontend(log)),
                    total: planEvents.length
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting plan events: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/construction/plans/events'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Construction error escalations
        this.app.get('/api/construction/escalations', (req, res) => {
            try {
                const escalations = logger.logBuffer.filter(log =>
                    log.category === 'ESCALATION' ||
                    log.level === 'ERROR' ||
                    (log.details?.requiresHumanReview === true)
                );

                res.json({
                    success: true,
                    data: escalations.map(log => logger.formatLogForFrontend(log)),
                    total: escalations.length
                });
            } catch (error) {
                logger.error('API-ERROR', `Error getting escalations: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/construction/escalations'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Manual log creation (for testing)
        this.app.post('/api/logs/create', (req, res) => {
            try {
                const { level, category, message, details } = req.body;
                
                if (!level || !category || !message) {
                    return res.status(400).json({
                        success: false,
                        error: 'Missing required fields: level, category, message'
                    });
                }

                const logEntry = logger.log(level, category, message, details || {});
                
                res.json({
                    success: true,
                    data: logger.formatLogForFrontend(logEntry)
                });

            } catch (error) {
                logger.error('API-ERROR', `Error creating manual log: ${error.message}`, {
                    component: 'LogMonitoringServer',
                    endpoint: '/api/logs/create'
                });
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // Check if static files exist before serving them
        try {
            if (this.config.staticPath && require('fs').existsSync(path.join(this.config.staticPath, 'index.html'))) {
                this.app.use(express.static(this.config.staticPath));
                
                // Serve index.html for all unmatched routes (SPA support)
                this.app.get('*', (req, res) => {
                    res.sendFile(path.join(this.config.staticPath, 'index.html'));
                });
            } else {
                // Fallback: Simple HTML page for log monitoring
                this.app.get('*', (req, res) => {
                    // Only serve HTML for GET requests that accept HTML
                    if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api/')) {
                        res.send(this.generateSimpleLogViewerHTML());
                    } else {
                        res.status(404).json({ error: 'Not found' });
                    }
                });
            }
        } catch (error) {
            // Fallback: Simple HTML page for log monitoring
            this.app.get('*', (req, res) => {
                if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/api/')) {
                    res.send(this.generateSimpleLogViewerHTML());
                } else {
                    res.status(404).json({ error: 'Not found' });
                }
            });
        }
    }

    /**
     * 🚀 SETUP SERVER
     */
    setupServer() {
        this.server = createServer(this.app);
    }

    /**
     * 🎮 SERVER CONTROL
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.server.listen(this.config.port, this.config.host, (error) => {
                if (error) {
                    logger.error('SERVER-ERROR', `Failed to start log monitoring server: ${error.message}`, {
                        component: 'LogMonitoringServer',
                        port: this.config.port,
                        host: this.config.host
                    });
                    reject(error);
                } else {
                    this.isRunning = true;
                    this.startTime = Date.now();
                    
                    console.log(`🌐 [LOG-MONITOR] Server running on http://${this.config.host}:${this.config.port}`);
                    logger.success('SERVER-START', `Log monitoring server started on ${this.config.host}:${this.config.port}`, {
                        component: 'LogMonitoringServer',
                        port: this.config.port,
                        host: this.config.host,
                        staticPath: this.config.staticPath
                    });
                    
                    resolve();
                }
            });
        });
    }

    async stop() {
        return new Promise((resolve) => {
            if (this.server && this.isRunning) {
                this.server.close(() => {
                    this.isRunning = false;
                    logger.info('SERVER-STOP', 'Log monitoring server stopped', {
                        component: 'LogMonitoringServer'
                    });
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * 🛠️ UTILITY METHODS
     */
    getUptime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    generateSimpleLogViewerHTML() {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elite Arbitrage Syndicate - Live Logs</title>
    <style>
        body { 
            font-family: 'Courier New', monospace; 
            background: #1a1a1a; 
            color: #00ff00; 
            margin: 0; 
            padding: 20px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            color: #00ffff; 
        }
        .log-container { 
            height: 80vh; 
            overflow-y: auto; 
            border: 1px solid #333; 
            padding: 10px; 
            background: #000; 
        }
        .log-entry { 
            margin: 2px 0; 
            padding: 2px 5px;
        }
        .ERROR { color: #ff6b6b; background: rgba(255, 107, 107, 0.1); }
        .WARN { color: #ffd93d; background: rgba(255, 217, 61, 0.1); }
        .INFO { color: #6bcf7f; }
        .DEBUG { color: #888; }
        .SUCCESS { color: #51cf66; background: rgba(81, 207, 102, 0.1); }
        .controls {
            margin-bottom: 10px;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        button {
            background: #333;
            color: #00ffff;
            border: 1px solid #555;
            padding: 5px 10px;
            cursor: pointer;
        }
        button:hover { background: #555; }
        select, input {
            background: #333;
            color: #00ffff;
            border: 1px solid #555;
            padding: 5px;
        }
        .status {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #333;
            padding: 10px;
            border-radius: 5px;
            font-size: 12px;
        }
        .connected { color: #51cf66; }
        .disconnected { color: #ff6b6b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 ELITE ARBITRAGE SYNDICATE - LIVE SYSTEM LOGS</h1>
    </div>
    
    <div class="status" id="status">
        <div id="connectionStatus">🔴 Disconnected</div>
        <div id="logCount">Logs: 0</div>
    </div>
    
    <div class="controls">
        <button onclick="connect()">🔌 Connect</button>
        <button onclick="disconnect()">❌ Disconnect</button>
        <button onclick="clearLogs()">🗑️ Clear</button>
        <button onclick="exportLogs()">📤 Export</button>
        <select id="levelFilter" onchange="applyFilter()">
            <option value="">All Levels</option>
            <option value="ERROR">ERROR</option>
            <option value="WARN">WARN</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
            <option value="SUCCESS">SUCCESS</option>
        </select>
        <input type="text" id="searchInput" placeholder="Search logs..." onkeyup="searchLogs()">
        <label><input type="checkbox" id="autoScroll" checked> Auto-scroll</label>
    </div>
    
    <div class="log-container" id="logContainer"></div>
    
    <script>
        let ws = null;
        let logs = [];
        let filteredLogs = [];
        
        function connect() {
            if (ws) return;
            
            ws = new WebSocket('ws://localhost:8081');
            
            ws.onopen = () => {
                document.getElementById('connectionStatus').innerHTML = '🟢 Connected';
                document.getElementById('connectionStatus').className = 'connected';
                console.log('WebSocket connected');
            };
            
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleMessage(message);
            };
            
            ws.onclose = () => {
                document.getElementById('connectionStatus').innerHTML = '🔴 Disconnected';
                document.getElementById('connectionStatus').className = 'disconnected';
                ws = null;
                console.log('WebSocket disconnected');
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
        }
        
        function disconnect() {
            if (ws) {
                ws.close();
                ws = null;
            }
        }
        
        function handleMessage(message) {
            switch (message.type) {
                case 'log':
                    addLog(message.data);
                    break;
                case 'recentLogs':
                    logs = message.data;
                    applyFilter();
                    break;
                case 'welcome':
                    console.log('Welcome:', message);
                    break;
            }
        }
        
        function addLog(log) {
            logs.push(log);
            if (logs.length > 1000) {
                logs = logs.slice(-1000);
            }
            applyFilter();
        }
        
        function applyFilter() {
            const levelFilter = document.getElementById('levelFilter').value;
            const searchText = document.getElementById('searchInput').value.toLowerCase();
            
            filteredLogs = logs.filter(log => {
                if (levelFilter && log.level !== levelFilter) return false;
                if (searchText && !log.message.toLowerCase().includes(searchText)) return false;
                return true;
            });
            
            renderLogs();
        }
        
        function renderLogs() {
            const container = document.getElementById('logContainer');
            const shouldScroll = document.getElementById('autoScroll').checked && 
                                  container.scrollTop + container.clientHeight >= container.scrollHeight - 50;
            
            container.innerHTML = filteredLogs.map(log => 
                '<div class="log-entry ' + log.level + '">' +
                '[' + new Date(log.timestamp).toLocaleTimeString() + '] ' +
                (log.emoji || '') + ' [' + log.level + '] [' + log.category + '] ' +
                log.message +
                '</div>'
            ).join('');
            
            document.getElementById('logCount').innerHTML = 'Logs: ' + filteredLogs.length;
            
            if (shouldScroll) {
                container.scrollTop = container.scrollHeight;
            }
        }
        
        function clearLogs() {
            logs = [];
            filteredLogs = [];
            renderLogs();
        }
        
        function exportLogs() {
            const dataStr = JSON.stringify(filteredLogs, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'syndicate-logs-' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
        }
        
        function searchLogs() {
            applyFilter();
        }
        
        // Auto-connect on load
        connect();
        
        // Reconnect on window focus
        window.addEventListener('focus', () => {
            if (!ws || ws.readyState === WebSocket.CLOSED) {
                setTimeout(connect, 1000);
            }
        });
    </script>
</body>
</html>`;
    }
}

// Export singleton instance
export const logMonitoringServer = new LogMonitoringServer();
