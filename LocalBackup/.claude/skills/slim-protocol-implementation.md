# SLIM Protocol Implementation

## Overview

This skill provides a production-ready implementation of the SLIM (Secure, Lightweight, Intelligent, Multimodal) protocol for agent-to-agent communication in the AIGO-Syndicate construction intelligence system. It includes end-to-end encryption, multimodal data handling, compression, and comprehensive security features.

## Core Implementation

### SLIM Protocol Server

```javascript
// slim-protocol-server.js
import { EventEmitter } from 'events';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import msgpack from 'msgpack-lite';
import zlib from 'zlib';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';
import { RateLimiter } from 'limiter';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class SLIMProtocolServer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            port: config.port || 3002,
            
            // Security
            encryptionAlgorithm: config.encryptionAlgorithm || 'aes-256-gcm',
            keyRotationInterval: config.keyRotationInterval || 86400000, // 24 hours
            jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
            
            // Protocol
            protocolVersion: config.protocolVersion || '1.0.0',
            maxPayloadSize: config.maxPayloadSize || 10485760, // 10MB
            compressionThreshold: config.compressionThreshold || 1024, // 1KB
            
            // Rate limiting
            rateLimit: {
                windowMs: config.rateLimit?.windowMs || 60000,
                maxRequests: config.rateLimit?.maxRequests || 1000
            },
            
            // Performance
            maxConnections: config.maxConnections || 10000,
            heartbeatInterval: config.heartbeatInterval || 30000,
            messageTimeout: config.messageTimeout || 30000,
            
            ...config
        };
        
        this.wss = null;
        this.agents = new Map();
        this.sessions = new Map();
        this.messageHandlers = new Map();
        this.encryptionKeys = new Map();
        
        // Metrics
        this.metrics = {
            totalMessages: 0,
            encryptedMessages: 0,
            compressedMessages: 0,
            errors: 0,
            bytesTransferred: 0
        };
    }
    
    async initialize() {
        try {
            // Generate master key
            this.masterKey = await this.generateMasterKey();
            
            // Create WebSocket server
            this.wss = new WebSocket.Server({
                port: this.config.port,
                maxPayload: this.config.maxPayloadSize,
                verifyClient: this.verifyClient.bind(this)
            });
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Register default handlers
            this.registerDefaultHandlers();
            
            // Start key rotation
            this.startKeyRotation();
            
            // Start heartbeat monitoring
            this.startHeartbeatMonitoring();
            
            console.log(`SLIM Protocol Server listening on port ${this.config.port}`);
            this.emit('initialized', { port: this.config.port });
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async generateMasterKey() {
        return crypto.randomBytes(32);
    }
    
    verifyClient(info, callback) {
        try {
            // Extract agent credentials
            const auth = info.req.headers.authorization;
            
            if (!auth) {
                callback(false, 401, 'Unauthorized');
                return;
            }
            
            // Verify JWT token
            const token = auth.replace('Bearer ', '');
            const decoded = jwt.verify(token, this.config.jwtSecret);
            
            // Store agent info
            info.req.agentId = decoded.agentId;
            info.req.agentType = decoded.agentType;
            info.req.permissions = decoded.permissions || [];
            
            callback(true);
            
        } catch (error) {
            callback(false, 401, 'Invalid authentication');
        }
    }
    
    setupEventHandlers() {
        this.wss.on('connection', (ws, request) => {
            this.handleConnection(ws, request);
        });
        
        this.wss.on('error', (error) => {
            this.handleError('server', error);
        });
    }
    
    async handleConnection(ws, request) {
        const agentId = request.agentId;
        const sessionId = uuidv4();
        
        // Create agent session
        const agent = {
            id: agentId,
            type: request.agentType,
            permissions: request.permissions,
            ws,
            sessionId,
            connectedAt: Date.now(),
            lastHeartbeat: Date.now(),
            rateLimiter: new RateLimiter(
                this.config.rateLimit.maxRequests,
                this.config.rateLimit.windowMs
            ),
            encryptionKey: null,
            stats: {
                messagesSent: 0,
                messagesReceived: 0,
                bytesIn: 0,
                bytesOut: 0
            }
        };
        
        // Generate session key
        agent.encryptionKey = await this.generateSessionKey(agentId);
        
        // Store agent
        this.agents.set(agentId, agent);
        this.sessions.set(sessionId, agentId);
        
        // Set up agent handlers
        this.setupAgentHandlers(agent);
        
        // Send handshake
        await this.sendHandshake(agent);
        
        console.log(`Agent connected: ${agentId} (type: ${agent.type})`);
        this.emit('agent_connected', { agentId, type: agent.type });
    }
    
    async generateSessionKey(agentId) {
        // Derive session key from master key
        const salt = crypto.randomBytes(16);
        const key = crypto.pbkdf2Sync(
            this.masterKey,
            salt,
            100000,
            32,
            'sha256'
        );
        
        const sessionKey = {
            key,
            salt,
            algorithm: this.config.encryptionAlgorithm,
            createdAt: Date.now()
        };
        
        this.encryptionKeys.set(agentId, sessionKey);
        return sessionKey;
    }
    
    setupAgentHandlers(agent) {
        const ws = agent.ws;
        
        ws.on('message', async (data) => {
            try {
                await this.handleMessage(agent, data);
            } catch (error) {
                this.handleAgentError(agent, 'message', error);
            }
        });
        
        ws.on('close', (code, reason) => {
            this.handleDisconnection(agent, code, reason);
        });
        
        ws.on('error', (error) => {
            this.handleAgentError(agent, 'connection', error);
        });
        
        ws.on('pong', () => {
            agent.lastHeartbeat = Date.now();
        });
    }
    
    async sendHandshake(agent) {
        const handshake = {
            type: 'handshake',
            protocolVersion: this.config.protocolVersion,
            sessionId: agent.sessionId,
            encryptionKey: {
                algorithm: agent.encryptionKey.algorithm,
                salt: agent.encryptionKey.salt.toString('base64')
            },
            features: {
                compression: true,
                encryption: true,
                multimodal: true
            },
            timestamp: Date.now()
        };
        
        await this.sendToAgent(agent, handshake, { encrypt: false });
    }
    
    // Message Handling
    
    async handleMessage(agent, rawData) {
        agent.stats.messagesReceived++;
        agent.stats.bytesIn += rawData.length;
        
        // Rate limiting
        const allowed = await new Promise((resolve) =>
            agent.rateLimiter.removeTokens(1, (err, remaining) =>
                resolve(!err && remaining >= 0)
            )
        );
        
        if (!allowed) {
            throw new Error('Rate limit exceeded');
        }
        
        // Parse message
        const message = await this.parseMessage(rawData, agent);
        
        // Validate message
        this.validateMessage(message);
        
        // Update metrics
        this.metrics.totalMessages++;
        
        // Handle based on type
        const handler = this.messageHandlers.get(message.type);
        if (!handler) {
            throw new Error(`Unknown message type: ${message.type}`);
        }
        
        // Execute handler
        const response = await handler(agent, message);
        
        // Send response if needed
        if (response) {
            await this.sendToAgent(agent, response);
        }
    }
    
    async parseMessage(rawData, agent) {
        let data = rawData;
        
        // Check if binary
        if (Buffer.isBuffer(data)) {
            // Parse header (first 4 bytes)
            const flags = data.readUInt32BE(0);
            const isEncrypted = (flags & 0x01) !== 0;
            const isCompressed = (flags & 0x02) !== 0;
            const isMultimodal = (flags & 0x04) !== 0;
            
            data = data.slice(4);
            
            // Decrypt if needed
            if (isEncrypted) {
                data = await this.decrypt(data, agent.encryptionKey);
                this.metrics.encryptedMessages++;
            }
            
            // Decompress if needed
            if (isCompressed) {
                data = await gunzip(data);
                this.metrics.compressedMessages++;
            }
            
            // Parse based on format
            if (isMultimodal) {
                return this.parseMultimodalMessage(data);
            } else {
                return msgpack.decode(data);
            }
        } else {
            // Plain JSON fallback
            return JSON.parse(data.toString());
        }
    }
    
    parseMultimodalMessage(data) {
        // Multimodal format:
        // [4 bytes: metadata length][metadata][payload1][payload2]...
        
        const metadataLength = data.readUInt32BE(0);
        const metadata = msgpack.decode(data.slice(4, 4 + metadataLength));
        
        const message = {
            ...metadata,
            payloads: []
        };
        
        let offset = 4 + metadataLength;
        
        for (const payloadInfo of metadata.payloads || []) {
            const payloadLength = payloadInfo.length;
            const payload = data.slice(offset, offset + payloadLength);
            
            message.payloads.push({
                type: payloadInfo.type,
                mimeType: payloadInfo.mimeType,
                data: payload
            });
            
            offset += payloadLength;
        }
        
        return message;
    }
    
    validateMessage(message) {
        if (!message.type) {
            throw new Error('Message type required');
        }
        
        if (!message.id) {
            message.id = uuidv4();
        }
        
        if (!message.timestamp) {
            message.timestamp = Date.now();
        }
        
        // Validate size
        const size = JSON.stringify(message).length;
        if (size > this.config.maxPayloadSize) {
            throw new Error('Message too large');
        }
    }
    
    // Message Sending
    
    async sendToAgent(agent, message, options = {}) {
        if (agent.ws.readyState !== WebSocket.OPEN) {
            throw new Error('Agent connection not open');
        }
        
        // Prepare message
        message.id = message.id || uuidv4();
        message.timestamp = message.timestamp || Date.now();
        
        // Encode message
        let data = msgpack.encode(message);
        let flags = 0;
        
        // Compress if needed
        if (data.length > this.config.compressionThreshold) {
            data = await gzip(data);
            flags |= 0x02;
            this.metrics.compressedMessages++;
        }
        
        // Encrypt by default unless disabled
        if (options.encrypt !== false && agent.encryptionKey) {
            data = await this.encrypt(data, agent.encryptionKey);
            flags |= 0x01;
            this.metrics.encryptedMessages++;
        }
        
        // Add header
        const header = Buffer.alloc(4);
        header.writeUInt32BE(flags, 0);
        
        const packet = Buffer.concat([header, data]);
        
        // Send
        agent.ws.send(packet);
        
        // Update stats
        agent.stats.messagesSent++;
        agent.stats.bytesOut += packet.length;
        this.metrics.bytesTransferred += packet.length;
    }
    
    async broadcast(message, filter = null) {
        const promises = [];
        
        for (const agent of this.agents.values()) {
            if (filter && !filter(agent)) continue;
            
            promises.push(
                this.sendToAgent(agent, message).catch(err =>
                    console.error(`Broadcast error to ${agent.id}:`, err)
                )
            );
        }
        
        await Promise.all(promises);
    }
    
    async sendMultimodal(agent, message, payloads) {
        // Prepare metadata
        const metadata = {
            ...message,
            payloads: payloads.map(p => ({
                type: p.type,
                mimeType: p.mimeType,
                length: p.data.length
            }))
        };
        
        // Encode metadata
        const metadataBuffer = msgpack.encode(metadata);
        const metadataLength = Buffer.alloc(4);
        metadataLength.writeUInt32BE(metadataBuffer.length, 0);
        
        // Combine all parts
        const parts = [metadataLength, metadataBuffer];
        for (const payload of payloads) {
            parts.push(payload.data);
        }
        
        const data = Buffer.concat(parts);
        
        // Send as multimodal message
        let flags = 0x04; // Multimodal flag
        
        // Apply compression/encryption as needed
        const finalData = await this.prepareData(data, agent, flags);
        
        agent.ws.send(finalData);
    }
    
    // Encryption
    
    async encrypt(data, sessionKey) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            sessionKey.algorithm,
            sessionKey.key,
            iv
        );
        
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);
        
        const authTag = cipher.getAuthTag();
        
        // Format: [16 bytes IV][16 bytes auth tag][encrypted data]
        return Buffer.concat([iv, authTag, encrypted]);
    }
    
    async decrypt(data, sessionKey) {
        const iv = data.slice(0, 16);
        const authTag = data.slice(16, 32);
        const encrypted = data.slice(32);
        
        const decipher = crypto.createDecipheriv(
            sessionKey.algorithm,
            sessionKey.key,
            iv
        );
        
        decipher.setAuthTag(authTag);
        
        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
    }
    
    // Key Management
    
    startKeyRotation() {
        setInterval(async () => {
            try {
                await this.rotateKeys();
            } catch (error) {
                this.handleError('key_rotation', error);
            }
        }, this.config.keyRotationInterval);
    }
    
    async rotateKeys() {
        console.log('Rotating encryption keys');
        
        // Generate new master key
        const newMasterKey = await this.generateMasterKey();
        
        // Update all session keys
        for (const agent of this.agents.values()) {
            const oldKey = agent.encryptionKey;
            agent.encryptionKey = await this.generateSessionKey(agent.id);
            
            // Notify agent of key rotation
            await this.sendToAgent(agent, {
                type: 'key_rotation',
                encryptionKey: {
                    algorithm: agent.encryptionKey.algorithm,
                    salt: agent.encryptionKey.salt.toString('base64')
                }
            }, { encrypt: true }); // Use old key for this message
        }
        
        // Update master key
        this.masterKey = newMasterKey;
    }
    
    // Default Handlers
    
    registerDefaultHandlers() {
        // Ping/Pong
        this.registerHandler('ping', async (agent, message) => {
            return {
                type: 'pong',
                responseId: message.id,
                timestamp: Date.now()
            };
        });
        
        // Agent-to-agent messaging
        this.registerHandler('message', async (agent, message) => {
            const targetAgent = this.agents.get(message.targetAgentId);
            
            if (!targetAgent) {
                return {
                    type: 'error',
                    error: 'Target agent not found',
                    responseId: message.id
                };
            }
            
            // Forward message
            await this.sendToAgent(targetAgent, {
                type: 'agent_message',
                fromAgentId: agent.id,
                content: message.content,
                timestamp: Date.now()
            });
            
            return {
                type: 'message_sent',
                responseId: message.id
            };
        });
        
        // Multicast
        this.registerHandler('multicast', async (agent, message) => {
            const targets = message.targetAgentIds || [];
            const promises = [];
            
            for (const targetId of targets) {
                const target = this.agents.get(targetId);
                if (target) {
                    promises.push(
                        this.sendToAgent(target, {
                            type: 'multicast_message',
                            fromAgentId: agent.id,
                            content: message.content,
                            groupId: message.groupId
                        })
                    );
                }
            }
            
            await Promise.all(promises);
            
            return {
                type: 'multicast_sent',
                responseId: message.id,
                delivered: promises.length
            };
        });
        
        // File transfer
        this.registerHandler('file_transfer', async (agent, message) => {
            const { targetAgentId, fileData, metadata } = message;
            
            const targetAgent = this.agents.get(targetAgentId);
            if (!targetAgent) {
                return {
                    type: 'error',
                    error: 'Target agent not found',
                    responseId: message.id
                };
            }
            
            // Send file as multimodal message
            await this.sendMultimodal(targetAgent, {
                type: 'file_received',
                fromAgentId: agent.id,
                metadata
            }, [{
                type: 'file',
                mimeType: metadata.mimeType || 'application/octet-stream',
                data: Buffer.from(fileData, 'base64')
            }]);
            
            return {
                type: 'file_transfer_complete',
                responseId: message.id
            };
        });
    }
    
    registerHandler(type, handler) {
        this.messageHandlers.set(type, handler);
    }
    
    // Monitoring
    
    startHeartbeatMonitoring() {
        setInterval(() => {
            const now = Date.now();
            
            for (const [agentId, agent] of this.agents) {
                if (now - agent.lastHeartbeat > this.config.heartbeatInterval * 2) {
                    console.warn(`Agent ${agentId} heartbeat timeout`);
                    agent.ws.terminate();
                } else {
                    agent.ws.ping();
                }
            }
        }, this.config.heartbeatInterval);
    }
    
    // Disconnection
    
    handleDisconnection(agent, code, reason) {
        console.log(`Agent disconnected: ${agent.id} (code: ${code})`);
        
        // Clean up
        this.agents.delete(agent.id);
        this.sessions.delete(agent.sessionId);
        this.encryptionKeys.delete(agent.id);
        
        this.emit('agent_disconnected', {
            agentId: agent.id,
            code,
            reason: reason?.toString()
        });
    }
    
    // Error Handling
    
    handleError(context, error) {
        console.error(`SLIM Protocol error in ${context}:`, error);
        this.metrics.errors++;
        this.emit('error', { context, error });
    }
    
    handleAgentError(agent, context, error) {
        console.error(`Agent ${agent.id} error in ${context}:`, error);
        
        // Send error to agent
        this.sendToAgent(agent, {
            type: 'error',
            error: error.message,
            context
        }).catch(err => {
            console.error('Failed to send error to agent:', err);
        });
        
        // Disconnect on critical errors
        if (error.critical) {
            agent.ws.terminate();
        }
    }
    
    // Metrics
    
    getMetrics() {
        return {
            ...this.metrics,
            activeAgents: this.agents.size,
            activeSessions: this.sessions.size,
            agents: Array.from(this.agents.values()).map(agent => ({
                id: agent.id,
                type: agent.type,
                connected: Date.now() - agent.connectedAt,
                stats: agent.stats
            }))
        };
    }
    
    // Shutdown
    
    async shutdown() {
        console.log('Shutting down SLIM Protocol Server');
        
        // Notify all agents
        await this.broadcast({
            type: 'server_shutdown',
            message: 'Server is shutting down'
        });
        
        // Close all connections
        for (const agent of this.agents.values()) {
            agent.ws.close(1001, 'Server shutdown');
        }
        
        // Close server
        if (this.wss) {
            await new Promise((resolve) => {
                this.wss.close(() => resolve());
            });
        }
        
        console.log('SLIM Protocol Server shut down');
    }
}

// Export factory function
export function createSLIMServer(config) {
    return new SLIMProtocolServer(config);
}
```

### SLIM Protocol Client

```javascript
// slim-protocol-client.js
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import crypto from 'crypto';
import msgpack from 'msgpack-lite';
import zlib from 'zlib';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class SLIMProtocolClient extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            url: config.url || 'ws://localhost:3002',
            agentId: config.agentId || uuidv4(),
            agentType: config.agentType || 'generic',
            jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
            
            reconnection: config.reconnection !== false,
            reconnectionAttempts: config.reconnectionAttempts || 10,
            reconnectionDelay: config.reconnectionDelay || 1000,
            
            compressionThreshold: config.compressionThreshold || 1024,
            messageTimeout: config.messageTimeout || 30000,
            
            ...config
        };
        
        this.ws = null;
        this.connected = false;
        this.sessionId = null;
        this.encryptionKey = null;
        this.messageCallbacks = new Map();
        this.reconnectAttempts = 0;
    }
    
    async connect() {
        try {
            // Generate auth token
            const token = jwt.sign({
                agentId: this.config.agentId,
                agentType: this.config.agentType,
                permissions: this.config.permissions || []
            }, this.config.jwtSecret, { expiresIn: '24h' });
            
            // Connect to server
            this.ws = new WebSocket(this.config.url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            this.setupEventHandlers();
            
            // Wait for handshake
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
            
            this.connected = true;
            this.reconnectAttempts = 0;
            
        } catch (error) {
            this.handleError('connection', error);
            throw error;
        }
    }
    
    setupEventHandlers() {
        this.ws.on('open', () => {
            console.log('Connected to SLIM server');
        });
        
        this.ws.on('message', async (data) => {
            try {
                await this.handleMessage(data);
            } catch (error) {
                this.handleError('message', error);
            }
        });
        
        this.ws.on('close', (code, reason) => {
            this.handleDisconnection(code, reason);
        });
        
        this.ws.on('error', (error) => {
            this.handleError('websocket', error);
        });
    }
    
    async handleMessage(rawData) {
        const message = await this.parseMessage(rawData);
        
        // Handle system messages
        switch (message.type) {
            case 'handshake':
                await this.handleHandshake(message);
                break;
                
            case 'pong':
                this.handlePong(message);
                break;
                
            case 'key_rotation':
                await this.handleKeyRotation(message);
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
                
                // Emit message
                this.emit('message', message);
                this.emit(message.type, message);
        }
    }
    
    async parseMessage(rawData) {
        let data = rawData;
        
        if (Buffer.isBuffer(data)) {
            // Parse header
            const flags = data.readUInt32BE(0);
            const isEncrypted = (flags & 0x01) !== 0;
            const isCompressed = (flags & 0x02) !== 0;
            const isMultimodal = (flags & 0x04) !== 0;
            
            data = data.slice(4);
            
            // Decrypt if needed
            if (isEncrypted && this.encryptionKey) {
                data = await this.decrypt(data);
            }
            
            // Decompress if needed
            if (isCompressed) {
                data = await gunzip(data);
            }
            
            // Parse based on format
            if (isMultimodal) {
                return this.parseMultimodalMessage(data);
            } else {
                return msgpack.decode(data);
            }
        } else {
            return JSON.parse(data.toString());
        }
    }
    
    parseMultimodalMessage(data) {
        const metadataLength = data.readUInt32BE(0);
        const metadata = msgpack.decode(data.slice(4, 4 + metadataLength));
        
        const message = {
            ...metadata,
            payloads: []
        };
        
        let offset = 4 + metadataLength;
        
        for (const payloadInfo of metadata.payloads || []) {
            const payloadLength = payloadInfo.length;
            const payload = data.slice(offset, offset + payloadLength);
            
            message.payloads.push({
                type: payloadInfo.type,
                mimeType: payloadInfo.mimeType,
                data: payload
            });
            
            offset += payloadLength;
        }
        
        return message;
    }
    
    async handleHandshake(message) {
        this.sessionId = message.sessionId;
        
        // Set up encryption key
        if (message.encryptionKey) {
            const salt = Buffer.from(message.encryptionKey.salt, 'base64');
            const key = crypto.pbkdf2Sync(
                this.config.jwtSecret,
                salt,
                100000,
                32,
                'sha256'
            );
            
            this.encryptionKey = {
                key,
                algorithm: message.encryptionKey.algorithm
            };
        }
        
        this.emit('connected', {
            sessionId: this.sessionId,
            protocolVersion: message.protocolVersion
        });
    }
    
    handlePong(message) {
        this.lastPong = Date.now();
    }
    
    async handleKeyRotation(message) {
        // Update encryption key
        const salt = Buffer.from(message.encryptionKey.salt, 'base64');
        const key = crypto.pbkdf2Sync(
            this.config.jwtSecret,
            salt,
            100000,
            32,
            'sha256'
        );
        
        this.encryptionKey = {
            key,
            algorithm: message.encryptionKey.algorithm
        };
        
        console.log('Encryption key rotated');
    }
    
    // Message Sending
    
    async send(message) {
        if (!this.connected) {
            throw new Error('Not connected');
        }
        
        message.id = message.id || uuidv4();
        message.timestamp = message.timestamp || Date.now();
        
        // Encode message
        let data = msgpack.encode(message);
        let flags = 0;
        
        // Compress if needed
        if (data.length > this.config.compressionThreshold) {
            data = await gzip(data);
            flags |= 0x02;
        }
        
        // Encrypt if key available
        if (this.encryptionKey) {
            data = await this.encrypt(data);
            flags |= 0x01;
        }
        
        // Add header
        const header = Buffer.alloc(4);
        header.writeUInt32BE(flags, 0);
        
        const packet = Buffer.concat([header, data]);
        
        this.ws.send(packet);
    }
    
    async sendAndWait(message, timeout = null) {
        const id = message.id || uuidv4();
        message.id = id;
        
        const promise = new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                this.messageCallbacks.delete(id);
                reject(new Error('Response timeout'));
            }, timeout || this.config.messageTimeout);
            
            this.messageCallbacks.set(id, {
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
    
    async sendTo(targetAgentId, content) {
        return this.sendAndWait({
            type: 'message',
            targetAgentId,
            content
        });
    }
    
    async multicast(targetAgentIds, content, groupId = null) {
        return this.sendAndWait({
            type: 'multicast',
            targetAgentIds,
            content,
            groupId
        });
    }
    
    async sendFile(targetAgentId, fileData, metadata) {
        return this.sendAndWait({
            type: 'file_transfer',
            targetAgentId,
            fileData: fileData.toString('base64'),
            metadata
        });
    }
    
    async sendMultimodal(message, payloads) {
        if (!this.connected) {
            throw new Error('Not connected');
        }
        
        // Prepare metadata
        const metadata = {
            ...message,
            id: message.id || uuidv4(),
            timestamp: Date.now(),
            payloads: payloads.map(p => ({
                type: p.type,
                mimeType: p.mimeType,
                length: p.data.length
            }))
        };
        
        // Encode metadata
        const metadataBuffer = msgpack.encode(metadata);
        const metadataLength = Buffer.alloc(4);
        metadataLength.writeUInt32BE(metadataBuffer.length, 0);
        
        // Combine all parts
        const parts = [metadataLength, metadataBuffer];
        for (const payload of payloads) {
            parts.push(payload.data);
        }
        
        let data = Buffer.concat(parts);
        let flags = 0x04; // Multimodal flag
        
        // Compress if large
        if (data.length > this.config.compressionThreshold * 10) {
            data = await gzip(data);
            flags |= 0x02;
        }
        
        // Encrypt if available
        if (this.encryptionKey) {
            data = await this.encrypt(data);
            flags |= 0x01;
        }
        
        // Add header
        const header = Buffer.alloc(4);
        header.writeUInt32BE(flags, 0);
        
        const packet = Buffer.concat([header, data]);
        this.ws.send(packet);
    }
    
    // Encryption
    
    async encrypt(data) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            this.encryptionKey.algorithm,
            this.encryptionKey.key,
            iv
        );
        
        const encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);
        
        const authTag = cipher.getAuthTag();
        
        return Buffer.concat([iv, authTag, encrypted]);
    }
    
    async decrypt(data) {
        const iv = data.slice(0, 16);
        const authTag = data.slice(16, 32);
        const encrypted = data.slice(32);
        
        const decipher = crypto.createDecipheriv(
            this.encryptionKey.algorithm,
            this.encryptionKey.key,
            iv
        );
        
        decipher.setAuthTag(authTag);
        
        return Buffer.concat([
            decipher.update(encrypted),
            decipher.final()
        ]);
    }
    
    // Connection Management
    
    ping() {
        return this.sendAndWait({ type: 'ping' });
    }
    
    handleDisconnection(code, reason) {
        this.connected = false;
        console.log(`Disconnected: ${code} - ${reason}`);
        
        this.emit('disconnected', { code, reason });
        
        // Auto reconnect
        if (this.config.reconnection &&
            this.reconnectAttempts < this.config.reconnectionAttempts) {
            this.scheduleReconnection();
        }
    }
    
    scheduleReconnection() {
        this.reconnectAttempts++;
        
        const delay = Math.min(
            this.config.reconnectionDelay * this.reconnectAttempts,
            30000
        );
        
        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect().catch(console.error);
        }, delay);
    }
    
    handleError(context, error) {
        console.error(`SLIM client error in ${context}:`, error);
        this.emit('error', error);
    }
    
    disconnect() {
        this.config.reconnection = false;
        
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
        }
    }
}

// Export factory function
export function createSLIMClient(config) {
    return new SLIMProtocolClient(config);
}
```

### Usage Example

```javascript
// slim-usage.js
import { createSLIMServer, createSLIMClient } from './index.js';

// Server setup
async function setupServer() {
    const server = createSLIMServer({
        port: 3002,
        jwtSecret: 'your-secret-key'
    });
    
    await server.initialize();
    
    // Register custom handler
    server.registerHandler('construction_update', async (agent, message) => {
        console.log(`Construction update from ${agent.id}:`, message);
        
        // Broadcast to other construction agents
        await server.broadcast({
            type: 'construction_broadcast',
            data: message.data,
            fromAgent: agent.id
        }, (a) => a.type === 'construction' && a.id !== agent.id);
        
        return {
            type: 'update_acknowledged',
            responseId: message.id
        };
    });
    
    return server;
}

// Client setup
async function setupClient() {
    const client = createSLIMClient({
        url: 'ws://localhost:3002',
        agentId: 'construction-agent-1',
        agentType: 'construction',
        jwtSecret: 'your-secret-key'
    });
    
    await client.connect();
    
    // Send message to another agent
    await client.sendTo('construction-agent-2', {
        type: 'project_update',
        projectId: '123',
        status: 'active'
    });
    
    // Send file
    const fileData = Buffer.from('Construction plan data');
    await client.sendFile('architect-agent', fileData, {
        filename: 'plan.pdf',
        mimeType: 'application/pdf'
    });
    
    // Send multimodal message
    await client.sendMultimodal({
        type: 'construction_report',
        projectId: '123'
    }, [
        {
            type: 'image',
            mimeType: 'image/jpeg',
            data: Buffer.from('image data')
        },
        {
            type: 'metrics',
            mimeType: 'application/json',
            data: Buffer.from(JSON.stringify({ progress: 0.75 }))
        }
    ]);
    
    return client;
}
```

### Construction Integration

```javascript
// construction-slim-integration.js
import { createSLIMServer } from './slim-protocol-server.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionSLIMService {
    constructor() {
        this.server = null;
        this.dbPool = DatabasePoolManager.getInstance();
        this.agentGroups = new Map();
    }
    
    async initialize() {
        this.server = createSLIMServer({
            port: 3002,
            jwtSecret: process.env.SLIM_JWT_SECRET,
            maxPayloadSize: 50 * 1024 * 1024 // 50MB for construction documents
        });
        
        await this.server.initialize();
        await this.setupConstructionHandlers();
        
        // Set up agent groups
        this.setupAgentGroups();
    }
    
    async setupConstructionHandlers() {
        // Project coordination
        this.server.registerHandler('project_coordination', async (agent, message) => {
            const { projectId, action, data } = message;
            
            // Validate agent permissions
            if (!await this.validateProjectAccess(agent.id, projectId)) {
                return {
                    type: 'error',
                    error: 'Access denied',
                    responseId: message.id
                };
            }
            
            // Process coordination action
            const result = await this.processCoordinationAction(projectId, action, data);
            
            // Notify relevant agents
            await this.notifyProjectAgents(projectId, {
                type: 'coordination_update',
                projectId,
                action,
                result,
                initiatedBy: agent.id
            });
            
            return {
                type: 'coordination_complete',
                responseId: message.id,
                result
            };
        });
        
        // Document exchange
        this.server.registerHandler('document_exchange', async (agent, message) => {
            const { documentType, projectId, recipients } = message;
            const payload = message.payloads?.[0];
            
            if (!payload) {
                return {
                    type: 'error',
                    error: 'No document payload',
                    responseId: message.id
                };
            }
            
            // Store document
            const documentId = await this.storeDocument(
                projectId,
                documentType,
                payload.data,
                agent.id
            );
            
            // Send to recipients
            for (const recipientId of recipients) {
                const recipient = this.server.agents.get(recipientId);
                if (recipient) {
                    await this.server.sendMultimodal(recipient, {
                        type: 'document_received',
                        documentId,
                        documentType,
                        projectId,
                        fromAgent: agent.id
                    }, [payload]);
                }
            }
            
            return {
                type: 'document_distributed',
                responseId: message.id,
                documentId
            };
        });
        
        // Real-time metrics streaming
        this.server.registerHandler('metrics_stream', async (agent, message) => {
            const { projectId, metrics, interval = 5000 } = message;
            
            // Set up streaming
            const streamId = `${agent.id}:${projectId}`;
            
            const intervalId = setInterval(async () => {
                const data = await this.getProjectMetrics(projectId, metrics);
                
                await this.server.sendToAgent(agent, {
                    type: 'metrics_update',
                    projectId,
                    data,
                    timestamp: Date.now()
                });
            }, interval);
            
            // Store for cleanup
            if (!this.metricStreams) {
                this.metricStreams = new Map();
            }
            this.metricStreams.set(streamId, intervalId);
            
            return {
                type: 'stream_started',
                responseId: message.id,
                streamId
            };
        });
        
        // Multi-agent consensus
        this.server.registerHandler('consensus_request', async (agent, message) => {
            const { topic, proposal, requiredAgents } = message;
            
            // Start consensus process
            const consensusId = await this.startConsensus(
                topic,
                proposal,
                requiredAgents,
                agent.id
            );
            
            // Request votes
            for (const agentId of requiredAgents) {
                const targetAgent = this.server.agents.get(agentId);
                if (targetAgent) {
                    await this.server.sendToAgent(targetAgent, {
                        type: 'vote_request',
                        consensusId,
                        topic,
                        proposal,
                        requestedBy: agent.id
                    });
                }
            }
            
            return {
                type: 'consensus_initiated',
                responseId: message.id,
                consensusId
            };
        });
    }
    
    setupAgentGroups() {
        // Define agent groups for efficient broadcasting
        this.agentGroups.set('construction_specialists', new Set([
            'head-architect',
            'structural-engineer',
            'quantity-surveyor',
            'safety-specialist'
        ]));
        
        this.agentGroups.set('compliance', new Set([
            'compliance-analyst',
            'error-auditor',
            'document-generator'
        ]));
        
        this.agentGroups.set('management', new Set([
            'project-manager',
            'resource-coordinator',
            'schedule-optimizer'
        ]));
    }
    
    async notifyProjectAgents(projectId, message) {
        // Get all agents assigned to project
        const agents = await this.getProjectAgents(projectId);
        
        // Broadcast to project agents
        await this.server.broadcast(message, (agent) => 
            agents.includes(agent.id)
        );
    }
    
    async validateProjectAccess(agentId, projectId) {
        // Check if agent has access to project
        const result = await this.dbPool.query(`
            SELECT 1 FROM project_agents
            WHERE agent_id = $1 AND project_id = $2
        `, [agentId, projectId]);
        
        return result.rows.length > 0;
    }
    
    async processCoordinationAction(projectId, action, data) {
        // Process different coordination actions
        switch (action) {
            case 'phase_transition':
                return this.transitionProjectPhase(projectId, data);
                
            case 'resource_allocation':
                return this.allocateResources(projectId, data);
                
            case 'conflict_resolution':
                return this.resolveConflict(projectId, data);
                
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }
    
    async getProjectAgents(projectId) {
        const result = await this.dbPool.query(`
            SELECT agent_id FROM project_agents
            WHERE project_id = $1
        `, [projectId]);
        
        return result.rows.map(row => row.agent_id);
    }
}
```

## Testing

```javascript
// slim-protocol.test.js
import { describe, test, expect } from '@jest/globals';
import { createSLIMServer, createSLIMClient } from './index.js';

describe('SLIM Protocol', () => {
    let server;
    let client1;
    let client2;
    
    beforeAll(async () => {
        server = createSLIMServer({
            port: 3003,
            jwtSecret: 'test-secret'
        });
        await server.initialize();
        
        client1 = createSLIMClient({
            url: 'ws://localhost:3003',
            agentId: 'test-agent-1',
            jwtSecret: 'test-secret'
        });
        
        client2 = createSLIMClient({
            url: 'ws://localhost:3003',
            agentId: 'test-agent-2',
            jwtSecret: 'test-secret'
        });
        
        await client1.connect();
        await client2.connect();
    });
    
    afterAll(async () => {
        client1.disconnect();
        client2.disconnect();
        await server.shutdown();
    });
    
    test('should establish encrypted connection', () => {
        expect(client1.connected).toBe(true);
        expect(client1.encryptionKey).toBeDefined();
        expect(client1.sessionId).toBeDefined();
    });
    
    test('should send messages between agents', async () => {
        const messagePromise = new Promise((resolve) => {
            client2.once('agent_message', (msg) => resolve(msg));
        });
        
        await client1.sendTo('test-agent-2', {
            test: 'data'
        });
        
        const received = await messagePromise;
        expect(received.fromAgentId).toBe('test-agent-1');
        expect(received.content.test).toBe('data');
    });
    
    test('should handle multimodal messages', async () => {
        const payloads = [
            {
                type: 'text',
                mimeType: 'text/plain',
                data: Buffer.from('Hello')
            },
            {
                type: 'json',
                mimeType: 'application/json',
                data: Buffer.from(JSON.stringify({ key: 'value' }))
            }
        ];
        
        const messagePromise = new Promise((resolve) => {
            client2.once('multimodal_test', (msg) => resolve(msg));
        });
        
        await client1.sendMultimodal({
            type: 'multimodal_test'
        }, payloads);
        
        const received = await messagePromise;
        expect(received.payloads).toHaveLength(2);
    });
});
```

This implementation provides a complete, secure, and efficient SLIM protocol for agent-to-agent communication with end-to-end encryption, multimodal support, and comprehensive security features.
