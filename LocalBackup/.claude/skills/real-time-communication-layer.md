# Real-Time Communication Layer Implementation

## Overview

This skill provides a complete, production-ready WebSocket communication implementation for the AIGO-Syndicate construction intelligence system. It includes authentication, message protocols, binary streaming, reconnection logic, and comprehensive error handling.

## Core Implementation

### WebSocket Server

```javascript
// real-time-communication-server.js
import { WebSocketServer } from 'ws';
import http from 'http';
import https from 'https';
import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import pino from 'pino';
import { RateLimiter } from 'limiter';

export class RealTimeCommunicationServer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            port: config.port || 3001,
            ssl: config.ssl || false,
            sslCert: config.sslCert,
            sslKey: config.sslKey,
            
            // Authentication
            jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
            authRequired: config.authRequired !== false,
            
            // Connection limits
            maxConnections: config.maxConnections || 10000,
            maxConnectionsPerIp: config.maxConnectionsPerIp || 100,
            
            // Message limits
            maxMessageSize: config.maxMessageSize || 1048576, // 1MB
            messageRateLimit: config.messageRateLimit || 100, // per minute
            
            // Heartbeat
            heartbeatInterval: config.heartbeatInterval || 30000,
            heartbeatTimeout: config.heartbeatTimeout || 60000,
            
            // Binary streaming
            binaryChunkSize: config.binaryChunkSize || 65536, // 64KB
            
            ...config
        };
        
        this.server = null;
        this.wss = null;
        this.clients = new Map();
        this.rooms = new Map();
        this.ipConnections = new Map();
        
        // Message handlers
        this.messageHandlers = new Map();
        this.binaryHandlers = new Map();
        
        // Metrics
        this.metrics = {
            totalConnections: 0,
            activeConnections: 0,
            messagesReceived: 0,
            messagesSent: 0,
            bytesReceived: 0,
            bytesSent: 0
        };
        
        // Logger
        this.logger = pino({
            level: config.logLevel || 'info',
            transport: {
                target: 'pino-pretty'
            }
        });
    }
    
    async initialize() {
        try {
            // Create HTTP/HTTPS server
            if (this.config.ssl) {
                this.server = https.createServer({
                    cert: this.config.sslCert,
                    key: this.config.sslKey
                });
            } else {
                this.server = http.createServer();
            }
            
            // Create WebSocket server
            this.wss = new WebSocketServer({
                server: this.server,
                maxPayload: this.config.maxMessageSize,
                verifyClient: this.verifyClient.bind(this)
            });
            
            // Set up WebSocket event handlers
            this.setupWebSocketHandlers();
            
            // Register default message handlers
            this.registerDefaultHandlers();
            
            // Start heartbeat system
            this.startHeartbeat();
            
            // Start server
            await new Promise((resolve, reject) => {
                this.server.listen(this.config.port, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            this.logger.info(`WebSocket server started on port ${this.config.port}`);
            this.emit('initialized', { port: this.config.port });
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    verifyClient(info, callback) {
        const ip = info.req.socket.remoteAddress;
        
        // Check IP connection limit
        const ipCount = this.ipConnections.get(ip) || 0;
        if (ipCount >= this.config.maxConnectionsPerIp) {
            callback(false, 429, 'Too many connections from this IP');
            return;
        }
        
        // Check total connection limit
        if (this.clients.size >= this.config.maxConnections) {
            callback(false, 503, 'Server at capacity');
            return;
        }
        
        // Verify authentication if required
        if (this.config.authRequired) {
            const token = this.extractToken(info.req);
            if (!token) {
                callback(false, 401, 'Authentication required');
                return;
            }
            
            try {
                const decoded = jwt.verify(token, this.config.jwtSecret);
                info.req.userId = decoded.userId;
                info.req.permissions = decoded.permissions || [];
            } catch (error) {
                callback(false, 401, 'Invalid token');
                return;
            }
        }
        
        callback(true);
    }
    
    extractToken(req) {
        const auth = req.headers.authorization;
        if (auth && auth.startsWith('Bearer ')) {
            return auth.substring(7);
        }
        
        // Check URL params
        const url = new URL(req.url, `http://${req.headers.host}`);
        return url.searchParams.get('token');
    }
    
    setupWebSocketHandlers() {
        this.wss.on('connection', (ws, request) => {
            this.handleConnection(ws, request);
        });
        
        this.wss.on('error', (error) => {
            this.handleError('server', error);
        });
    }
    
    handleConnection(ws, request) {
        const clientId = uuidv4();
        const ip = request.socket.remoteAddress;
        
        // Create client object
        const client = {
            id: clientId,
            ws,
            ip,
            userId: request.userId,
            permissions: request.permissions || [],
            connectedAt: Date.now(),
            lastHeartbeat: Date.now(),
            rooms: new Set(),
            rateLimiter: new RateLimiter(
                this.config.messageRateLimit, 
                'minute'
            ),
            binaryStreams: new Map(),
            metadata: {}
        };
        
        // Add to clients map
        this.clients.set(clientId, client);
        
        // Update IP connection count
        this.ipConnections.set(ip, (this.ipConnections.get(ip) || 0) + 1);
        
        // Update metrics
        this.metrics.totalConnections++;
        this.metrics.activeConnections++;
        
        // Set up client event handlers
        this.setupClientHandlers(client);
        
        // Send welcome message
        this.sendToClient(client, {
            type: 'welcome',
            clientId,
            timestamp: Date.now()
        });
        
        this.logger.info(`Client connected: ${clientId}`);
        this.emit('client_connected', { clientId, userId: client.userId });
    }
    
    setupClientHandlers(client) {
        const ws = client.ws;
        
        ws.on('message', async (data, isBinary) => {
            try {
                // Rate limiting
                const allowed = await new Promise((resolve) => 
                    client.rateLimiter.removeTokens(1, (err, remaining) => 
                        resolve(!err && remaining >= 0)
                    )
                );
                
                if (!allowed) {
                    this.sendError(client, 'Rate limit exceeded');
                    return;
                }
                
                // Update metrics
                this.metrics.messagesReceived++;
                this.metrics.bytesReceived += data.length;
                
                if (isBinary) {
                    await this.handleBinaryMessage(client, data);
                } else {
                    await this.handleTextMessage(client, data);
                }
                
            } catch (error) {
                this.handleClientError(client, 'message', error);
            }
        });
        
        ws.on('close', (code, reason) => {
            this.handleDisconnection(client, code, reason);
        });
        
        ws.on('error', (error) => {
            this.handleClientError(client, 'connection', error);
        });
        
        ws.on('pong', () => {
            client.lastHeartbeat = Date.now();
        });
    }
    
    async handleTextMessage(client, data) {
        let message;
        
        try {
            message = JSON.parse(data.toString());
        } catch (error) {
            this.sendError(client, 'Invalid JSON');
            return;
        }
        
        // Validate message structure
        if (!message.type) {
            this.sendError(client, 'Message type required');
            return;
        }
        
        // Check permissions
        if (!this.checkPermissions(client, message)) {
            this.sendError(client, 'Permission denied');
            return;
        }
        
        // Get handler
        const handler = this.messageHandlers.get(message.type);
        if (!handler) {
            this.sendError(client, `Unknown message type: ${message.type}`);
            return;
        }
        
        // Execute handler
        try {
            await handler(client, message);
        } catch (error) {
            this.handleClientError(client, `handler_${message.type}`, error);
        }
    }
    
    async handleBinaryMessage(client, data) {
        // Check for stream header
        if (data.length < 16) {
            this.sendError(client, 'Invalid binary message');
            return;
        }
        
        // Parse header (streamId, chunkIndex, totalChunks, chunkSize)
        const streamId = data.toString('hex', 0, 8);
        const chunkIndex = data.readUInt32BE(8);
        const totalChunks = data.readUInt32BE(12);
        const chunkData = data.slice(16);
        
        // Get or create stream
        let stream = client.binaryStreams.get(streamId);
        if (!stream) {
            stream = {
                id: streamId,
                chunks: new Array(totalChunks),
                receivedChunks: 0,
                totalSize: 0,
                startTime: Date.now()
            };
            client.binaryStreams.set(streamId, stream);
        }
        
        // Add chunk
        stream.chunks[chunkIndex] = chunkData;
        stream.receivedChunks++;
        stream.totalSize += chunkData.length;
        
        // Check if complete
        if (stream.receivedChunks === totalChunks) {
            // Combine chunks
            const completeData = Buffer.concat(stream.chunks);
            
            // Clean up
            client.binaryStreams.delete(streamId);
            
            // Process complete stream
            await this.processBinaryStream(client, streamId, completeData);
        } else {
            // Send progress update
            this.sendToClient(client, {
                type: 'stream_progress',
                streamId,
                progress: stream.receivedChunks / totalChunks
            });
        }
    }
    
    async processBinaryStream(client, streamId, data) {
        // Parse metadata from first 256 bytes
        const metadataLength = data.readUInt32BE(0);
        const metadata = JSON.parse(data.toString('utf8', 4, 4 + metadataLength));
        const payload = data.slice(4 + metadataLength);
        
        // Get handler
        const handler = this.binaryHandlers.get(metadata.type);
        if (!handler) {
            this.sendError(client, `Unknown binary type: ${metadata.type}`);
            return;
        }
        
        // Execute handler
        try {
            await handler(client, metadata, payload);
        } catch (error) {
            this.handleClientError(client, `binary_${metadata.type}`, error);
        }
    }
    
    // Message Sending
    
    sendToClient(client, message) {
        if (client.ws.readyState !== 1) return; // WebSocket.OPEN
        
        try {
            const data = JSON.stringify(message);
            client.ws.send(data);
            
            this.metrics.messagesSent++;
            this.metrics.bytesSent += data.length;
            
        } catch (error) {
            this.handleClientError(client, 'send', error);
        }
    }
    
    sendBinaryToClient(client, type, data, metadata = {}) {
        if (client.ws.readyState !== 1) return;
        
        const streamId = uuidv4().replace(/-/g, '').substring(0, 16);
        const chunks = this.splitIntoChunks(data, metadata, type);
        
        chunks.forEach((chunk, index) => {
            // Create header
            const header = Buffer.alloc(16);
            header.write(streamId, 0, 8, 'hex');
            header.writeUInt32BE(index, 8);
            header.writeUInt32BE(chunks.length, 12);
            
            // Send chunk
            const message = Buffer.concat([header, chunk]);
            client.ws.send(message, { binary: true });
            
            this.metrics.bytesSent += message.length;
        });
        
        return streamId;
    }
    
    splitIntoChunks(data, metadata, type) {
        // Add metadata
        const metadataObj = { ...metadata, type };
        const metadataStr = JSON.stringify(metadataObj);
        const metadataBuffer = Buffer.from(metadataStr);
        
        // Create payload with metadata length prefix
        const payload = Buffer.alloc(4 + metadataBuffer.length + data.length);
        payload.writeUInt32BE(metadataBuffer.length, 0);
        metadataBuffer.copy(payload, 4);
        data.copy(payload, 4 + metadataBuffer.length);
        
        // Split into chunks
        const chunks = [];
        const chunkSize = this.config.binaryChunkSize;
        
        for (let i = 0; i < payload.length; i += chunkSize) {
            chunks.push(payload.slice(i, i + chunkSize));
        }
        
        return chunks;
    }
    
    broadcast(message, filter = null) {
        for (const client of this.clients.values()) {
            if (filter && !filter(client)) continue;
            this.sendToClient(client, message);
        }
    }
    
    sendToRoom(roomId, message, excludeClient = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        
        for (const clientId of room) {
            if (clientId === excludeClient) continue;
            const client = this.clients.get(clientId);
            if (client) {
                this.sendToClient(client, message);
            }
        }
    }
    
    sendError(client, error) {
        this.sendToClient(client, {
            type: 'error',
            error: error.message || error,
            timestamp: Date.now()
        });
    }
    
    // Room Management
    
    joinRoom(client, roomId) {
        // Add client to room
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }
        this.rooms.get(roomId).add(client.id);
        
        // Add room to client
        client.rooms.add(roomId);
        
        // Notify room members
        this.sendToRoom(roomId, {
            type: 'room_joined',
            roomId,
            clientId: client.id,
            userId: client.userId
        }, client.id);
        
        this.logger.debug(`Client ${client.id} joined room ${roomId}`);
    }
    
    leaveRoom(client, roomId) {
        // Remove client from room
        const room = this.rooms.get(roomId);
        if (room) {
            room.delete(client.id);
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
        }
        
        // Remove room from client
        client.rooms.delete(roomId);
        
        // Notify room members
        this.sendToRoom(roomId, {
            type: 'room_left',
            roomId,
            clientId: client.id,
            userId: client.userId
        });
        
        this.logger.debug(`Client ${client.id} left room ${roomId}`);
    }
    
    // Default Message Handlers
    
    registerDefaultHandlers() {
        // Heartbeat
        this.registerHandler('ping', async (client, message) => {
            this.sendToClient(client, {
                type: 'pong',
                timestamp: Date.now()
            });
        });
        
        // Room management
        this.registerHandler('join_room', async (client, message) => {
            if (!message.roomId) {
                this.sendError(client, 'Room ID required');
                return;
            }
            
            this.joinRoom(client, message.roomId);
            
            this.sendToClient(client, {
                type: 'room_joined_success',
                roomId: message.roomId
            });
        });
        
        this.registerHandler('leave_room', async (client, message) => {
            if (!message.roomId) {
                this.sendError(client, 'Room ID required');
                return;
            }
            
            this.leaveRoom(client, message.roomId);
            
            this.sendToClient(client, {
                type: 'room_left_success',
                roomId: message.roomId
            });
        });
        
        // Broadcasting
        this.registerHandler('broadcast_room', async (client, message) => {
            if (!message.roomId || !client.rooms.has(message.roomId)) {
                this.sendError(client, 'Not in room');
                return;
            }
            
            this.sendToRoom(message.roomId, {
                type: 'room_message',
                roomId: message.roomId,
                senderId: client.id,
                data: message.data,
                timestamp: Date.now()
            }, client.id);
        });
    }
    
    // Handler Registration
    
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
        this.logger.debug(`Registered handler for message type: ${type}`);
    }
    
    registerBinaryHandler(type, handler) {
        this.binaryHandlers.set(type, handler);
        this.logger.debug(`Registered binary handler for type: ${type}`);
    }
    
    // Heartbeat System
    
    startHeartbeat() {
        setInterval(() => {
            const now = Date.now();
            const timeout = this.config.heartbeatTimeout;
            
            for (const [clientId, client] of this.clients) {
                if (now - client.lastHeartbeat > timeout) {
                    this.logger.warn(`Client ${clientId} heartbeat timeout`);
                    client.ws.terminate();
                } else {
                    client.ws.ping();
                }
            }
        }, this.config.heartbeatInterval);
    }
    
    // Permission Management
    
    checkPermissions(client, message) {
        // Check if message type requires permissions
        const requiredPermissions = this.getRequiredPermissions(message.type);
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }
        
        // Check if client has all required permissions
        return requiredPermissions.every(perm => 
            client.permissions.includes(perm)
        );
    }
    
    getRequiredPermissions(messageType) {
        // Define permission requirements
        const permissions = {
            'admin_broadcast': ['admin'],
            'system_update': ['admin', 'system'],
            'agent_control': ['agent_manager'],
            // Add more as needed
        };
        
        return permissions[messageType] || [];
    }
    
    // Disconnection Handling
    
    handleDisconnection(client, code, reason) {
        const clientId = client.id;
        
        // Remove from all rooms
        for (const roomId of client.rooms) {
            this.leaveRoom(client, roomId);
        }
        
        // Update IP connection count
        const ip = client.ip;
        const count = this.ipConnections.get(ip) || 0;
        if (count <= 1) {
            this.ipConnections.delete(ip);
        } else {
            this.ipConnections.set(ip, count - 1);
        }
        
        // Clean up binary streams
        client.binaryStreams.clear();
        
        // Remove from clients
        this.clients.delete(clientId);
        
        // Update metrics
        this.metrics.activeConnections--;
        
        this.logger.info(`Client disconnected: ${clientId} (code: ${code})`);
        this.emit('client_disconnected', { 
            clientId, 
            code, 
            reason: reason?.toString() 
        });
    }
    
    // Error Handling
    
    handleError(context, error) {
        this.logger.error({ context, error }, 'Server error');
        this.emit('error', { context, error });
    }
    
    handleClientError(client, context, error) {
        this.logger.error({ 
            clientId: client.id, 
            context, 
            error 
        }, 'Client error');
        
        this.sendError(client, 'Internal server error');
        
        // Disconnect client on critical errors
        if (context === 'connection' || error.critical) {
            client.ws.terminate();
        }
    }
    
    // Metrics and Monitoring
    
    getMetrics() {
        return {
            ...this.metrics,
            rooms: this.rooms.size,
            ipConnections: this.ipConnections.size,
            uptime: process.uptime()
        };
    }
    
    getClientInfo(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return null;
        
        return {
            id: client.id,
            userId: client.userId,
            ip: client.ip,
            connectedAt: client.connectedAt,
            lastHeartbeat: client.lastHeartbeat,
            rooms: Array.from(client.rooms),
            permissions: client.permissions
        };
    }
    
    // Graceful Shutdown
    
    async shutdown() {
        this.logger.info('Shutting down WebSocket server');
        
        // Notify all clients
        this.broadcast({
            type: 'server_shutdown',
            message: 'Server is shutting down',
            timestamp: Date.now()
        });
        
        // Close all connections
        for (const client of this.clients.values()) {
            client.ws.close(1001, 'Server shutdown');
        }
        
        // Close WebSocket server
        if (this.wss) {
            await new Promise((resolve) => {
                this.wss.close(() => resolve());
            });
        }
        
        // Close HTTP server
        if (this.server) {
            await new Promise((resolve) => {
                this.server.close(() => resolve());
            });
        }
        
        this.logger.info('WebSocket server shut down');
        this.emit('shutdown');
    }
}

// Export factory function
export function createCommunicationServer(config) {
    return new RealTimeCommunicationServer(config);
}
```

### Client Implementation

```javascript
// real-time-communication-client.js
import { EventEmitter } from 'events';
import WebSocket from 'ws';

export class RealTimeCommunicationClient extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            url: config.url || 'ws://localhost:3001',
            token: config.token,
            autoReconnect: config.autoReconnect !== false,
            reconnectInterval: config.reconnectInterval || 5000,
            maxReconnectAttempts: config.maxReconnectAttempts || 10,
            heartbeatInterval: config.heartbeatInterval || 30000,
            messageTimeout: config.messageTimeout || 30000,
            ...config
        };
        
        this.ws = null;
        this.clientId = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.messageCallbacks = new Map();
        this.rooms = new Set();
        this.sendQueue = [];
        this.binaryStreams = new Map();
    }
    
    async connect() {
        try {
            const url = this.buildUrl();
            
            this.ws = new WebSocket(url, {
                perMessageDeflate: true,
                maxPayload: 1048576
            });
            
            this.setupEventHandlers();
            
            // Wait for connection
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, 10000);
                
                this.once('connected', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                this.once('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
            
        } catch (error) {
            this.handleError('connection', error);
            throw error;
        }
    }
    
    buildUrl() {
        const url = new URL(this.config.url);
        if (this.config.token) {
            url.searchParams.set('token', this.config.token);
        }
        return url.toString();
    }
    
    setupEventHandlers() {
        this.ws.on('open', () => {
            this.connected = true;
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.processSendQueue();
        });
        
        this.ws.on('message', (data, isBinary) => {
            if (isBinary) {
                this.handleBinaryMessage(data);
            } else {
                this.handleTextMessage(data);
            }
        });
        
        this.ws.on('close', (code, reason) => {
            this.handleDisconnection(code, reason);
        });
        
        this.ws.on('error', (error) => {
            this.handleError('websocket', error);
        });
    }
    
    handleTextMessage(data) {
        try {
            const message = JSON.parse(data.toString());
            
            // Handle system messages
            switch (message.type) {
                case 'welcome':
                    this.clientId = message.clientId;
                    this.emit('connected', { clientId: this.clientId });
                    break;
                    
                case 'pong':
                    this.lastPong = Date.now();
                    break;
                    
                case 'error':
                    this.emit('error', new Error(message.error));
                    break;
                    
                default:
                    // Check for response callbacks
                    if (message.responseId) {
                        const callback = this.messageCallbacks.get(message.responseId);
                        if (callback) {
                            callback.resolve(message);
                            this.messageCallbacks.delete(message.responseId);
                        }
                    }
                    
                    // Emit message event
                    this.emit('message', message);
                    this.emit(message.type, message);
            }
            
        } catch (error) {
            this.handleError('message_parse', error);
        }
    }
    
    handleBinaryMessage(data) {
        // Parse header
        const streamId = data.toString('hex', 0, 8);
        const chunkIndex = data.readUInt32BE(8);
        const totalChunks = data.readUInt32BE(12);
        const chunkData = data.slice(16);
        
        // Get or create stream
        let stream = this.binaryStreams.get(streamId);
        if (!stream) {
            stream = {
                chunks: new Array(totalChunks),
                receivedChunks: 0
            };
            this.binaryStreams.set(streamId, stream);
        }
        
        // Add chunk
        stream.chunks[chunkIndex] = chunkData;
        stream.receivedChunks++;
        
        // Check if complete
        if (stream.receivedChunks === totalChunks) {
            const completeData = Buffer.concat(stream.chunks);
            this.binaryStreams.delete(streamId);
            
            // Parse and emit
            const metadataLength = completeData.readUInt32BE(0);
            const metadata = JSON.parse(
                completeData.toString('utf8', 4, 4 + metadataLength)
            );
            const payload = completeData.slice(4 + metadataLength);
            
            this.emit('binary_message', {
                type: metadata.type,
                metadata,
                data: payload
            });
        }
    }
    
    send(message) {
        if (!this.connected) {
            this.sendQueue.push(message);
            return Promise.resolve();
        }
        
        try {
            this.ws.send(JSON.stringify(message));
            return Promise.resolve();
        } catch (error) {
            this.handleError('send', error);
            return Promise.reject(error);
        }
    }
    
    async sendAndWait(message, timeout = null) {
        const responseId = Date.now().toString();
        message.responseId = responseId;
        
        const promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.messageCallbacks.delete(responseId);
                reject(new Error('Response timeout'));
            }, timeout || this.config.messageTimeout);
            
            this.messageCallbacks.set(responseId, {
                resolve: (response) => {
                    clearTimeout(timeoutId);
                    resolve(response);
                },
                reject
            });
        });
        
        await this.send(message);
        return promise;
    }
    
    sendBinary(type, data, metadata = {}) {
        if (!this.connected) return Promise.reject(new Error('Not connected'));
        
        const streamId = Date.now().toString(16).padStart(16, '0');
        const metadataObj = { ...metadata, type };
        const metadataStr = JSON.stringify(metadataObj);
        const metadataBuffer = Buffer.from(metadataStr);
        
        // Create payload
        const payload = Buffer.alloc(4 + metadataBuffer.length + data.length);
        payload.writeUInt32BE(metadataBuffer.length, 0);
        metadataBuffer.copy(payload, 4);
        data.copy(payload, 4 + metadataBuffer.length);
        
        // Split into chunks
        const chunkSize = 65536;
        const chunks = [];
        
        for (let i = 0; i < payload.length; i += chunkSize) {
            chunks.push(payload.slice(i, i + chunkSize));
        }
        
        // Send chunks
        chunks.forEach((chunk, index) => {
            const header = Buffer.alloc(16);
            header.write(streamId, 0, 8, 'hex');
            header.writeUInt32BE(index, 8);
            header.writeUInt32BE(chunks.length, 12);
            
            const message = Buffer.concat([header, chunk]);
            this.ws.send(message, { binary: true });
        });
        
        return Promise.resolve(streamId);
    }
    
    async joinRoom(roomId) {
        const response = await this.sendAndWait({
            type: 'join_room',
            roomId
        });
        
        if (response.type === 'room_joined_success') {
            this.rooms.add(roomId);
        }
        
        return response;
    }
    
    async leaveRoom(roomId) {
        const response = await this.sendAndWait({
            type: 'leave_room',
            roomId
        });
        
        if (response.type === 'room_left_success') {
            this.rooms.delete(roomId);
        }
        
        return response;
    }
    
    broadcastToRoom(roomId, data) {
        return this.send({
            type: 'broadcast_room',
            roomId,
            data
        });
    }
    
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.connected) {
                this.send({ type: 'ping' });
            }
        }, this.config.heartbeatInterval);
    }
    
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    
    processSendQueue() {
        while (this.sendQueue.length > 0 && this.connected) {
            const message = this.sendQueue.shift();
            this.send(message);
        }
    }
    
    handleDisconnection(code, reason) {
        this.connected = false;
        this.stopHeartbeat();
        
        this.emit('disconnected', { code, reason: reason?.toString() });
        
        // Fail pending callbacks
        for (const callback of this.messageCallbacks.values()) {
            callback.reject(new Error('Connection lost'));
        }
        this.messageCallbacks.clear();
        
        // Auto reconnect
        if (this.config.autoReconnect && 
            this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
        }
    }
    
    scheduleReconnect() {
        this.reconnectAttempts++;
        
        const delay = Math.min(
            this.config.reconnectInterval * this.reconnectAttempts,
            30000
        );
        
        this.emit('reconnecting', { 
            attempt: this.reconnectAttempts, 
            delay 
        });
        
        setTimeout(() => {
            this.connect().catch(() => {
                // Reconnect failed, will be retried
            });
        }, delay);
    }
    
    handleError(context, error) {
        this.emit('error', error);
    }
    
    disconnect() {
        this.config.autoReconnect = false;
        this.stopHeartbeat();
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
        }
    }
}

// Export factory function
export function createCommunicationClient(config) {
    return new RealTimeCommunicationClient(config);
}
```

### Usage Example

```javascript
// communication-usage.js
import { createCommunicationServer, createCommunicationClient } from './index.js';

// Server setup
async function setupServer() {
    const server = createCommunicationServer({
        port: 3001,
        jwtSecret: process.env.JWT_SECRET
    });
    
    await server.initialize();
    
    // Register custom handlers
    server.registerHandler('task_update', async (client, message) => {
        // Broadcast to task room
        server.sendToRoom(`task_${message.taskId}`, {
            type: 'task_updated',
            taskId: message.taskId,
            updates: message.updates,
            updatedBy: client.userId,
            timestamp: Date.now()
        });
    });
    
    server.registerBinaryHandler('file_upload', async (client, metadata, data) => {
        console.log(`Received file: ${metadata.filename}, size: ${data.length}`);
        // Process file...
    });
    
    return server;
}

// Client setup
async function setupClient() {
    const client = createCommunicationClient({
        url: 'ws://localhost:3001',
        token: 'your-jwt-token'
    });
    
    await client.connect();
    
    // Join a room
    await client.joinRoom('construction_project_123');
    
    // Send messages
    client.on('task_updated', (message) => {
        console.log('Task updated:', message);
    });
    
    // Send binary data
    const fileData = Buffer.from('file content');
    await client.sendBinary('file_upload', fileData, {
        filename: 'test.txt'
    });
    
    return client;
}
```

### Integration Example

```javascript
// construction-communication-integration.js
import { createCommunicationServer } from './real-time-communication-server.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionCommunicationService {
    constructor() {
        this.server = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.server = createCommunicationServer({
            port: 3001,
            maxConnections: 10000,
            authRequired: true
        });
        
        await this.server.initialize();
        await this.setupConstructionHandlers();
    }
    
    async setupConstructionHandlers() {
        // Project updates
        this.server.registerHandler('project_update', async (client, message) => {
            const { projectId, updates } = message;
            
            // Validate permissions
            const hasAccess = await this.checkProjectAccess(client.userId, projectId);
            if (!hasAccess) {
                this.server.sendError(client, 'Access denied');
                return;
            }
            
            // Update database
            await this.updateProject(projectId, updates);
            
            // Broadcast to project team
            this.server.sendToRoom(`project_${projectId}`, {
                type: 'project_updated',
                projectId,
                updates,
                updatedBy: client.userId,
                timestamp: Date.now()
            });
        });
        
        // Construction metrics streaming
        this.server.registerHandler('subscribe_metrics', async (client, message) => {
            const { projectId, metrics } = message;
            
            // Start streaming metrics
            const interval = setInterval(async () => {
                const data = await this.getProjectMetrics(projectId, metrics);
                
                this.server.sendToClient(client, {
                    type: 'metrics_update',
                    projectId,
                    data,
                    timestamp: Date.now()
                });
            }, 5000);
            
            // Store interval for cleanup
            client.metadata.metricsInterval = interval;
        });
        
        // Binary file handling for construction documents
        this.server.registerBinaryHandler('document_upload', async (client, metadata, data) => {
            const { projectId, documentType, filename } = metadata;
            
            // Save document
            const documentId = await this.saveDocument(projectId, documentType, filename, data);
            
            // Notify project team
            this.server.sendToRoom(`project_${projectId}`, {
                type: 'document_uploaded',
                projectId,
                documentId,
                documentType,
                filename,
                uploadedBy: client.userId,
                size: data.length,
                timestamp: Date.now()
            });
        });
    }
    
    async checkProjectAccess(userId, projectId) {
        const result = await this.dbPool.query(`
            SELECT 1 FROM project_members
            WHERE project_id = $1 AND user_id = $2
        `, [projectId, userId]);
        
        return result.rows.length > 0;
    }
    
    async updateProject(projectId, updates) {
        // Implementation for project updates
    }
    
    async getProjectMetrics(projectId, metrics) {
        // Implementation for fetching metrics
    }
}
```

This implementation provides a complete, production-ready WebSocket communication layer with authentication, binary streaming, room management, and comprehensive error handling.
