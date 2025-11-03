# WebSocket Scaling Patterns Implementation

## Overview

This skill provides production-ready WebSocket scaling patterns for the AIGO-Syndicate construction intelligence system. It includes horizontal scaling with Redis, sticky sessions, message broadcasting optimization, and comprehensive connection management.

## Core Implementation

### Scalable WebSocket Server

```javascript
// websocket-scaling-server.js
import { createAdapter } from '@socket.io/redis-adapter';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import Redis from 'ioredis';
import { EventEmitter } from 'events';
import cluster from 'cluster';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { RateLimiter } from 'limiter';

export class ScalableWebSocketServer extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            port: config.port || 3001,
            
            // Redis configuration
            redis: {
                host: config.redis?.host || 'localhost',
                port: config.redis?.port || 6379,
                password: config.redis?.password,
                cluster: config.redis?.cluster || false
            },
            
            // Clustering
            workers: config.workers || os.cpus().length,
            enableClustering: config.enableClustering !== false,
            
            // Sticky sessions
            enableStickySessions: config.enableStickySessions !== false,
            sessionTimeout: config.sessionTimeout || 86400000, // 24 hours
            
            // Rate limiting
            rateLimit: {
                windowMs: config.rateLimit?.windowMs || 60000,
                maxRequests: config.rateLimit?.maxRequests || 100
            },
            
            // Performance
            maxConnectionsPerWorker: config.maxConnectionsPerWorker || 10000,
            pingInterval: config.pingInterval || 25000,
            pingTimeout: config.pingTimeout || 60000,
            
            // Message handling
            maxMessageSize: config.maxMessageSize || 1048576, // 1MB
            messageQueueSize: config.messageQueueSize || 100,
            
            ...config
        };
        
        this.io = null;
        this.httpServer = null;
        this.pubClient = null;
        this.subClient = null;
        this.connectionMap = new Map();
        this.roomMetrics = new Map();
        
        // Metrics
        this.metrics = {
            connections: 0,
            messages: 0,
            broadcasts: 0,
            errors: 0
        };
    }
    
    async initialize() {
        if (this.config.enableClustering && cluster.isMaster) {
            await this.initializeMaster();
        } else {
            await this.initializeWorker();
        }
    }
    
    async initializeMaster() {
        console.log(`Master ${process.pid} is running`);
        
        // Set up sticky session store
        if (this.config.enableStickySessions) {
            await this.setupStickySessionStore();
        }
        
        // Fork workers
        for (let i = 0; i < this.config.workers; i++) {
            const worker = cluster.fork();
            console.log(`Worker ${worker.process.pid} started`);
        }
        
        // Handle worker events
        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.log('Starting a new worker');
                cluster.fork();
            }
        });
        
        // Set up load balancer
        await this.setupLoadBalancer();
    }
    
    async initializeWorker() {
        try {
            // Create HTTP server
            this.httpServer = createServer();
            
            // Create Socket.IO server
            this.io = new SocketIOServer(this.httpServer, {
                cors: {
                    origin: this.config.corsOrigin || '*',
                    methods: ['GET', 'POST']
                },
                pingInterval: this.config.pingInterval,
                pingTimeout: this.config.pingTimeout,
                maxHttpBufferSize: this.config.maxMessageSize,
                transports: ['websocket', 'polling']
            });
            
            // Set up Redis adapter
            await this.setupRedisAdapter();
            
            // Set up middleware
            this.setupMiddleware();
            
            // Set up event handlers
            this.setupEventHandlers();
            
            // Start server
            await new Promise((resolve, reject) => {
                this.httpServer.listen(this.config.port, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`Worker ${process.pid} listening on port ${this.config.port}`);
            this.emit('worker_initialized', { pid: process.pid });
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async setupRedisAdapter() {
        // Create Redis clients
        if (this.config.redis.cluster) {
            // Redis cluster mode
            const nodes = this.config.redis.nodes || [
                { host: this.config.redis.host, port: this.config.redis.port }
            ];
            
            this.pubClient = new Redis.Cluster(nodes, {
                redisOptions: { password: this.config.redis.password }
            });
            
            this.subClient = this.pubClient.duplicate();
        } else {
            // Single Redis instance
            this.pubClient = new Redis({
                host: this.config.redis.host,
                port: this.config.redis.port,
                password: this.config.redis.password
            });
            
            this.subClient = this.pubClient.duplicate();
        }
        
        // Set up adapter
        this.io.adapter(createAdapter(this.pubClient, this.subClient));
        
        // Set up pub/sub for cross-server communication
        await this.setupPubSub();
    }
    
    async setupPubSub() {
        // Subscribe to global events
        this.subClient.subscribe('global:broadcast');
        this.subClient.subscribe('global:metrics');
        this.subClient.subscribe('global:room:join');
        this.subClient.subscribe('global:room:leave');
        
        this.subClient.on('message', (channel, message) => {
            try {
                const data = JSON.parse(message);
                this.handleGlobalMessage(channel, data);
            } catch (error) {
                this.handleError('pubsub_message', error);
            }
        });
    }
    
    handleGlobalMessage(channel, data) {
        switch (channel) {
            case 'global:broadcast':
                // Re-broadcast to local clients
                if (data.room) {
                    this.io.to(data.room).emit(data.event, data.payload);
                } else {
                    this.io.emit(data.event, data.payload);
                }
                break;
                
            case 'global:metrics':
                // Aggregate metrics
                this.aggregateMetrics(data);
                break;
                
            case 'global:room:join':
                // Update room metrics
                this.updateRoomMetrics(data.room, 1);
                break;
                
            case 'global:room:leave':
                // Update room metrics
                this.updateRoomMetrics(data.room, -1);
                break;
        }
    }
    
    setupMiddleware() {
        // Authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                
                if (!token && this.config.authRequired) {
                    return next(new Error('Authentication required'));
                }
                
                if (token) {
                    const decoded = jwt.verify(token, this.config.jwtSecret);
                    socket.userId = decoded.userId;
                    socket.permissions = decoded.permissions || [];
                }
                
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
        
        // Rate limiting middleware
        this.io.use((socket, next) => {
            const ip = socket.handshake.address;
            const key = `rate_limit:${ip}`;
            
            if (!this.rateLimiters) {
                this.rateLimiters = new Map();
            }
            
            if (!this.rateLimiters.has(key)) {
                this.rateLimiters.set(key, new RateLimiter(
                    this.config.rateLimit.maxRequests,
                    this.config.rateLimit.windowMs
                ));
            }
            
            const limiter = this.rateLimiters.get(key);
            
            limiter.removeTokens(1, (err, remaining) => {
                if (err || remaining < 0) {
                    next(new Error('Rate limit exceeded'));
                } else {
                    next();
                }
            });
        });
        
        // Connection limit middleware
        this.io.use((socket, next) => {
            if (this.connectionMap.size >= this.config.maxConnectionsPerWorker) {
                next(new Error('Connection limit exceeded'));
            } else {
                next();
            }
        });
    }
    
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
        
        // Handle worker metrics reporting
        if (this.config.enableClustering) {
            setInterval(() => {
                this.reportWorkerMetrics();
            }, 30000); // Every 30 seconds
        }
    }
    
    handleConnection(socket) {
        const connectionId = uuidv4();
        const connection = {
            id: connectionId,
            socketId: socket.id,
            userId: socket.userId,
            connectedAt: Date.now(),
            rooms: new Set(),
            messageCount: 0
        };
        
        this.connectionMap.set(socket.id, connection);
        this.metrics.connections++;
        
        console.log(`Client connected: ${socket.id} (worker: ${process.pid})`);
        
        // Set up socket event handlers
        this.setupSocketHandlers(socket);
        
        // Emit connection event
        this.emit('client_connected', {
            socketId: socket.id,
            userId: socket.userId,
            workerId: process.pid
        });
    }
    
    setupSocketHandlers(socket) {
        // Room management
        socket.on('join_room', async (roomId, callback) => {
            try {
                await this.handleJoinRoom(socket, roomId);
                callback({ success: true });
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        
        socket.on('leave_room', async (roomId, callback) => {
            try {
                await this.handleLeaveRoom(socket, roomId);
                callback({ success: true });
            } catch (error) {
                callback({ success: false, error: error.message });
            }
        });
        
        // Message handling
        socket.on('message', async (data) => {
            try {
                await this.handleMessage(socket, data);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        
        // Broadcast to room
        socket.on('broadcast_room', async (roomId, event, data) => {
            try {
                await this.handleRoomBroadcast(socket, roomId, event, data);
            } catch (error) {
                socket.emit('error', { message: error.message });
            }
        });
        
        // Disconnect handling
        socket.on('disconnect', (reason) => {
            this.handleDisconnection(socket, reason);
        });
        
        // Error handling
        socket.on('error', (error) => {
            this.handleSocketError(socket, error);
        });
    }
    
    async handleJoinRoom(socket, roomId) {
        const connection = this.connectionMap.get(socket.id);
        if (!connection) throw new Error('Connection not found');
        
        // Check room capacity
        const roomSize = await this.getRoomSize(roomId);
        const maxRoomSize = this.config.maxRoomSize || 1000;
        
        if (roomSize >= maxRoomSize) {
            throw new Error('Room is full');
        }
        
        // Join room
        await socket.join(roomId);
        connection.rooms.add(roomId);
        
        // Publish join event
        await this.pubClient.publish('global:room:join', JSON.stringify({
            room: roomId,
            socketId: socket.id,
            workerId: process.pid
        }));
        
        // Notify room members
        socket.to(roomId).emit('user_joined', {
            userId: socket.userId,
            roomId
        });
    }
    
    async handleLeaveRoom(socket, roomId) {
        const connection = this.connectionMap.get(socket.id);
        if (!connection) throw new Error('Connection not found');
        
        // Leave room
        await socket.leave(roomId);
        connection.rooms.delete(roomId);
        
        // Publish leave event
        await this.pubClient.publish('global:room:leave', JSON.stringify({
            room: roomId,
            socketId: socket.id,
            workerId: process.pid
        }));
        
        // Notify room members
        socket.to(roomId).emit('user_left', {
            userId: socket.userId,
            roomId
        });
    }
    
    async handleMessage(socket, data) {
        const connection = this.connectionMap.get(socket.id);
        if (!connection) return;
        
        // Update metrics
        connection.messageCount++;
        this.metrics.messages++;
        
        // Validate message size
        const messageSize = JSON.stringify(data).length;
        if (messageSize > this.config.maxMessageSize) {
            throw new Error('Message too large');
        }
        
        // Process message based on type
        if (data.type === 'broadcast') {
            await this.handleBroadcast(socket, data);
        } else if (data.type === 'direct') {
            await this.handleDirectMessage(socket, data);
        } else {
            // Custom message handling
            this.emit('custom_message', {
                socket,
                data,
                connection
            });
        }
    }
    
    async handleBroadcast(socket, data) {
        this.metrics.broadcasts++;
        
        // Check permissions
        if (!this.checkBroadcastPermission(socket, data)) {
            throw new Error('Broadcast permission denied');
        }
        
        // Optimize broadcast based on scope
        if (data.global) {
            // Global broadcast via Redis
            await this.pubClient.publish('global:broadcast', JSON.stringify({
                event: data.event || 'broadcast',
                payload: data.payload
            }));
        } else if (data.room) {
            // Room broadcast
            socket.to(data.room).emit(data.event || 'message', data.payload);
        } else {
            // Local broadcast
            socket.broadcast.emit(data.event || 'message', data.payload);
        }
    }
    
    async handleDirectMessage(socket, data) {
        const targetSocketId = await this.findSocketByUserId(data.targetUserId);
        
        if (targetSocketId) {
            this.io.to(targetSocketId).emit('direct_message', {
                from: socket.userId,
                message: data.message
            });
        } else {
            // Store for later delivery
            await this.storeOfflineMessage(data.targetUserId, {
                from: socket.userId,
                message: data.message,
                timestamp: Date.now()
            });
        }
    }
    
    async handleRoomBroadcast(socket, roomId, event, data) {
        const connection = this.connectionMap.get(socket.id);
        
        if (!connection || !connection.rooms.has(roomId)) {
            throw new Error('Not in room');
        }
        
        // Broadcast to room
        socket.to(roomId).emit(event, data);
        
        // Track room activity
        this.updateRoomActivity(roomId);
    }
    
    handleDisconnection(socket, reason) {
        const connection = this.connectionMap.get(socket.id);
        if (!connection) return;
        
        // Leave all rooms
        for (const roomId of connection.rooms) {
            this.pubClient.publish('global:room:leave', JSON.stringify({
                room: roomId,
                socketId: socket.id,
                workerId: process.pid
            }));
        }
        
        // Clean up
        this.connectionMap.delete(socket.id);
        this.metrics.connections--;
        
        console.log(`Client disconnected: ${socket.id} (reason: ${reason})`);
        
        this.emit('client_disconnected', {
            socketId: socket.id,
            userId: socket.userId,
            reason,
            workerId: process.pid
        });
    }
    
    handleSocketError(socket, error) {
        this.metrics.errors++;
        console.error(`Socket error for ${socket.id}:`, error);
        
        this.emit('socket_error', {
            socketId: socket.id,
            error,
            workerId: process.pid
        });
    }
    
    // Sticky Sessions
    
    async setupStickySessionStore() {
        this.sessionStore = new Redis({
            host: this.config.redis.host,
            port: this.config.redis.port,
            password: this.config.redis.password,
            keyPrefix: 'sticky_session:'
        });
    }
    
    async setupLoadBalancer() {
        const net = require('net');
        const farmhash = require('farmhash');
        
        const workers = Object.values(cluster.workers);
        let currentWorkerIndex = 0;
        
        const server = net.createServer({ pauseOnConnect: true }, async (connection) => {
            // Extract session ID from the connection
            const sessionId = await this.extractSessionId(connection);
            
            let worker;
            
            if (this.config.enableStickySessions && sessionId) {
                // Check if we have a sticky session
                const workerId = await this.sessionStore.get(sessionId);
                
                if (workerId && cluster.workers[workerId]) {
                    worker = cluster.workers[workerId];
                } else {
                    // Assign to worker based on hash
                    const hash = farmhash.hash32(sessionId);
                    const index = hash % workers.length;
                    worker = workers[index];
                    
                    // Store session mapping
                    await this.sessionStore.setex(
                        sessionId,
                        this.config.sessionTimeout / 1000,
                        worker.id
                    );
                }
            } else {
                // Round-robin for non-sticky connections
                worker = workers[currentWorkerIndex];
                currentWorkerIndex = (currentWorkerIndex + 1) % workers.length;
            }
            
            worker.send('sticky-session:connection', connection);
        });
        
        server.listen(this.config.port);
        console.log(`Load balancer listening on port ${this.config.port}`);
    }
    
    async extractSessionId(connection) {
        // Extract session ID from the initial HTTP request
        return new Promise((resolve) => {
            let data = '';
            
            connection.on('data', (chunk) => {
                data += chunk.toString();
                
                // Look for session cookie or custom header
                const cookieMatch = data.match(/Cookie:.*session_id=([^;]+)/);
                const headerMatch = data.match(/X-Session-ID: (.+)\r\n/);
                
                if (cookieMatch) {
                    resolve(cookieMatch[1]);
                } else if (headerMatch) {
                    resolve(headerMatch[1]);
                } else if (data.includes('\r\n\r\n')) {
                    // No session found
                    resolve(null);
                }
            });
            
            // Timeout after 1 second
            setTimeout(() => resolve(null), 1000);
        });
    }
    
    // Room Management
    
    async getRoomSize(roomId) {
        const sockets = await this.io.in(roomId).fetchSockets();
        return sockets.length;
    }
    
    updateRoomMetrics(roomId, delta) {
        const current = this.roomMetrics.get(roomId) || {
            connections: 0,
            lastActivity: Date.now()
        };
        
        current.connections += delta;
        current.lastActivity = Date.now();
        
        if (current.connections <= 0) {
            this.roomMetrics.delete(roomId);
        } else {
            this.roomMetrics.set(roomId, current);
        }
    }
    
    updateRoomActivity(roomId) {
        const metrics = this.roomMetrics.get(roomId);
        if (metrics) {
            metrics.lastActivity = Date.now();
        }
    }
    
    // Message Optimization
    
    checkBroadcastPermission(socket, data) {
        // Check if user has permission to broadcast
        if (data.global && !socket.permissions?.includes('global_broadcast')) {
            return false;
        }
        
        if (data.room && !socket.permissions?.includes('room_broadcast')) {
            return false;
        }
        
        return true;
    }
    
    async findSocketByUserId(userId) {
        // Try local connections first
        for (const [socketId, connection] of this.connectionMap) {
            if (connection.userId === userId) {
                return socketId;
            }
        }
        
        // Check other workers via Redis
        const key = `user_socket:${userId}`;
        return this.pubClient.get(key);
    }
    
    async storeOfflineMessage(userId, message) {
        const key = `offline_messages:${userId}`;
        await this.pubClient.rpush(key, JSON.stringify(message));
        await this.pubClient.expire(key, 86400); // 24 hours
    }
    
    // Metrics and Monitoring
    
    async reportWorkerMetrics() {
        const metrics = {
            workerId: process.pid,
            connections: this.connectionMap.size,
            rooms: this.roomMetrics.size,
            messages: this.metrics.messages,
            broadcasts: this.metrics.broadcasts,
            errors: this.metrics.errors,
            memory: process.memoryUsage(),
            timestamp: Date.now()
        };
        
        await this.pubClient.publish('global:metrics', JSON.stringify(metrics));
    }
    
    aggregateMetrics(workerMetrics) {
        if (!this.globalMetrics) {
            this.globalMetrics = new Map();
        }
        
        this.globalMetrics.set(workerMetrics.workerId, workerMetrics);
        
        // Calculate totals
        let totals = {
            connections: 0,
            rooms: 0,
            messages: 0,
            broadcasts: 0,
            errors: 0
        };
        
        for (const metrics of this.globalMetrics.values()) {
            totals.connections += metrics.connections;
            totals.rooms += metrics.rooms;
            totals.messages += metrics.messages;
            totals.broadcasts += metrics.broadcasts;
            totals.errors += metrics.errors;
        }
        
        this.emit('metrics_updated', totals);
    }
    
    getMetrics() {
        if (cluster.isMaster && this.globalMetrics) {
            return this.aggregateMetrics();
        } else {
            return {
                workerId: process.pid,
                connections: this.connectionMap.size,
                rooms: this.roomMetrics.size,
                ...this.metrics
            };
        }
    }
    
    // Graceful Shutdown
    
    async shutdown() {
        console.log(`Shutting down worker ${process.pid}`);
        
        // Notify all clients
        this.io.emit('server_shutdown', {
            message: 'Server is shutting down',
            reconnectDelay: 5000
        });
        
        // Close all connections gracefully
        for (const [socketId] of this.connectionMap) {
            this.io.sockets.sockets.get(socketId)?.disconnect(true);
        }
        
        // Close Redis connections
        if (this.pubClient) {
            await this.pubClient.quit();
        }
        if (this.subClient) {
            await this.subClient.quit();
        }
        
        // Close server
        if (this.io) {
            await new Promise((resolve) => {
                this.io.close(() => resolve());
            });
        }
        
        console.log(`Worker ${process.pid} shut down`);
    }
    
    handleError(context, error) {
        console.error(`WebSocket scaling error in ${context}:`, error);
        this.emit('error', { context, error });
    }
}

// Export factory function
export function createScalableWebSocketServer(config) {
    return new ScalableWebSocketServer(config);
}
```

### Client with Auto-Scaling Support

```javascript
// websocket-scaling-client.js
import { io } from 'socket.io-client';
import { EventEmitter } from 'events';

export class ScalableWebSocketClient extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            urls: config.urls || ['http://localhost:3001'],
            reconnection: config.reconnection !== false,
            reconnectionAttempts: config.reconnectionAttempts || 10,
            reconnectionDelay: config.reconnectionDelay || 1000,
            reconnectionDelayMax: config.reconnectionDelayMax || 5000,
            timeout: config.timeout || 20000,
            auth: config.auth || {},
            enableLoadBalancing: config.enableLoadBalancing !== false,
            ...config
        };
        
        this.socket = null;
        this.currentUrlIndex = 0;
        this.connected = false;
        this.rooms = new Set();
        this.messageQueue = [];
    }
    
    async connect() {
        try {
            const url = this.selectUrl();
            
            this.socket = io(url, {
                reconnection: this.config.reconnection,
                reconnectionAttempts: this.config.reconnectionAttempts,
                reconnectionDelay: this.config.reconnectionDelay,
                reconnectionDelayMax: this.config.reconnectionDelayMax,
                timeout: this.config.timeout,
                auth: this.config.auth,
                transports: ['websocket', 'polling']
            });
            
            this.setupEventHandlers();
            
            // Wait for connection
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Connection timeout'));
                }, this.config.timeout);
                
                this.socket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                
                this.socket.once('connect_error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
            
            this.connected = true;
            this.processMessageQueue();
            
        } catch (error) {
            // Try next URL if available
            if (this.config.enableLoadBalancing && this.config.urls.length > 1) {
                this.currentUrlIndex = (this.currentUrlIndex + 1) % this.config.urls.length;
                return this.connect();
            }
            
            throw error;
        }
    }
    
    selectUrl() {
        if (!this.config.enableLoadBalancing) {
            return this.config.urls[0];
        }
        
        // Simple round-robin selection
        const url = this.config.urls[this.currentUrlIndex];
        this.currentUrlIndex = (this.currentUrlIndex + 1) % this.config.urls.length;
        
        return url;
    }
    
    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.emit('connected', { id: this.socket.id });
            
            // Rejoin rooms after reconnection
            for (const room of this.rooms) {
                this.joinRoom(room);
            }
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            this.connected = false;
            this.emit('disconnected', { reason });
        });
        
        this.socket.on('error', (error) => {
            console.error('Socket error:', error);
            this.emit('error', error);
        });
        
        // Handle custom events
        this.socket.onAny((event, ...args) => {
            this.emit(event, ...args);
        });
        
        // Handle server shutdown
        this.socket.on('server_shutdown', (data) => {
            console.log('Server shutting down:', data.message);
            this.handleServerShutdown(data);
        });
    }
    
    joinRoom(roomId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('join_room', roomId, (response) => {
                if (response.success) {
                    this.rooms.add(roomId);
                    resolve(response);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }
    
    leaveRoom(roomId) {
        return new Promise((resolve, reject) => {
            this.socket.emit('leave_room', roomId, (response) => {
                if (response.success) {
                    this.rooms.delete(roomId);
                    resolve(response);
                } else {
                    reject(new Error(response.error));
                }
            });
        });
    }
    
    send(event, data) {
        if (!this.connected) {
            this.messageQueue.push({ event, data });
            return;
        }
        
        this.socket.emit(event, data);
    }
    
    broadcastToRoom(roomId, event, data) {
        this.socket.emit('broadcast_room', roomId, event, data);
    }
    
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.connected) {
            const { event, data } = this.messageQueue.shift();
            this.send(event, data);
        }
    }
    
    handleServerShutdown(data) {
        // Switch to another server if available
        if (this.config.urls.length > 1) {
            setTimeout(() => {
                this.socket.disconnect();
                this.connect().catch(console.error);
            }, data.reconnectDelay || 5000);
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.connected = false;
        }
    }
}
```

### Usage Example

```javascript
// scaling-usage.js
import { createScalableWebSocketServer } from './websocket-scaling-server.js';

async function main() {
    const server = createScalableWebSocketServer({
        port: 3001,
        workers: 4,
        redis: {
            host: 'localhost',
            port: 6379
        },
        enableStickySessions: true,
        maxConnectionsPerWorker: 10000
    });
    
    await server.initialize();
    
    // Monitor metrics
    server.on('metrics_updated', (metrics) => {
        console.log('Global metrics:', metrics);
    });
    
    // Handle errors
    server.on('error', ({ context, error }) => {
        console.error(`Error in ${context}:`, error);
    });
}

main();
```

### Construction Integration

```javascript
// construction-websocket-scaling.js
import { createScalableWebSocketServer } from './websocket-scaling-server.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionWebSocketService {
    constructor() {
        this.server = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.server = createScalableWebSocketServer({
            port: 3001,
            workers: 8, // For 896GB server
            redis: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
                password: process.env.REDIS_PASSWORD
            },
            enableStickySessions: true,
            maxConnectionsPerWorker: 5000,
            maxRoomSize: 500 // Per construction project
        });
        
        await this.server.initialize();
        await this.setupConstructionHandlers();
    }
    
    async setupConstructionHandlers() {
        // Custom message handler for construction updates
        this.server.on('custom_message', async ({ socket, data, connection }) => {
            switch (data.type) {
                case 'construction_update':
                    await this.handleConstructionUpdate(socket, data);
                    break;
                    
                case 'metric_subscription':
                    await this.handleMetricSubscription(socket, data);
                    break;
                    
                case 'document_stream':
                    await this.handleDocumentStream(socket, data);
                    break;
            }
        });
        
        // Handle worker-specific construction rooms
        this.server.on('client_connected', async ({ socketId, userId }) => {
            // Auto-join user to their project rooms
            const projects = await this.getUserProjects(userId);
            
            for (const project of projects) {
                const socket = this.server.io.sockets.sockets.get(socketId);
                if (socket) {
                    await socket.join(`project:${project.id}`);
                }
            }
        });
    }
    
    async handleConstructionUpdate(socket, data) {
        const { projectId, updateType, payload } = data;
        
        // Validate permissions
        if (!await this.validateProjectAccess(socket.userId, projectId)) {
            socket.emit('error', { message: 'Access denied' });
            return;
        }
        
        // Process update
        await this.processConstructionUpdate(projectId, updateType, payload);
        
        // Broadcast to project room
        socket.to(`project:${projectId}`).emit('construction_update', {
            projectId,
            updateType,
            payload,
            updatedBy: socket.userId,
            timestamp: Date.now()
        });
        
        // Send confirmation
        socket.emit('update_success', { projectId, updateType });
    }
    
    async handleMetricSubscription(socket, data) {
        const { projectId, metrics } = data;
        
        // Create subscription key
        const subKey = `metrics:${projectId}:${socket.id}`;
        
        // Set up interval for streaming metrics
        const interval = setInterval(async () => {
            try {
                const metricData = await this.getProjectMetrics(projectId, metrics);
                
                socket.emit('metrics_update', {
                    projectId,
                    metrics: metricData,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('Metric streaming error:', error);
            }
        }, 5000); // Every 5 seconds
        
        // Store interval for cleanup
        if (!this.metricSubscriptions) {
            this.metricSubscriptions = new Map();
        }
        this.metricSubscriptions.set(subKey, interval);
        
        // Clean up on disconnect
        socket.on('disconnect', () => {
            clearInterval(interval);
            this.metricSubscriptions.delete(subKey);
        });
    }
    
    async handleDocumentStream(socket, data) {
        const { documentId, chunkSize = 65536 } = data;
        
        // Stream large construction documents
        const document = await this.getDocument(documentId);
        const chunks = Math.ceil(document.size / chunkSize);
        
        for (let i = 0; i < chunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, document.size);
            const chunk = document.data.slice(start, end);
            
            socket.emit('document_chunk', {
                documentId,
                chunkIndex: i,
                totalChunks: chunks,
                data: chunk
            });
            
            // Throttle to prevent overwhelming the client
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        socket.emit('document_complete', { documentId });
    }
    
    async getUserProjects(userId) {
        const result = await this.dbPool.query(`
            SELECT p.id, p.name
            FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.user_id = $1 AND p.status = 'active'
        `, [userId]);
        
        return result.rows;
    }
    
    async validateProjectAccess(userId, projectId) {
        const result = await this.dbPool.query(`
            SELECT 1 FROM project_members
            WHERE user_id = $1 AND project_id = $2
        `, [userId, projectId]);
        
        return result.rows.length > 0;
    }
}
```

## Testing

```javascript
// scaling.test.js
import { describe, test, expect } from '@jest/globals';
import { createScalableWebSocketServer } from './websocket-scaling-server.js';
import { ScalableWebSocketClient } from './websocket-scaling-client.js';

describe('WebSocket Scaling', () => {
    let server;
    let clients = [];
    
    beforeAll(async () => {
        server = createScalableWebSocketServer({
            port: 3002,
            workers: 2,
            redis: { host: 'localhost' }
        });
        await server.initialize();
    });
    
    afterAll(async () => {
        for (const client of clients) {
            client.disconnect();
        }
        await server.shutdown();
    });
    
    test('should handle multiple client connections', async () => {
        const numClients = 10;
        
        for (let i = 0; i < numClients; i++) {
            const client = new ScalableWebSocketClient({
                urls: ['http://localhost:3002']
            });
            await client.connect();
            clients.push(client);
        }
        
        expect(clients).toHaveLength(numClients);
        expect(clients.every(c => c.connected)).toBe(true);
    });
    
    test('should broadcast messages across workers', async () => {
        const client1 = clients[0];
        const client2 = clients[1];
        
        const roomId = 'test-room';
        
        await client1.joinRoom(roomId);
        await client2.joinRoom(roomId);
        
        const messagePromise = new Promise((resolve) => {
            client2.on('test_event', (data) => {
                resolve(data);
            });
        });
        
        client1.broadcastToRoom(roomId, 'test_event', { 
            message: 'Hello from client 1' 
        });
        
        const received = await messagePromise;
        expect(received.message).toBe('Hello from client 1');
    });
});
```

This implementation provides comprehensive WebSocket scaling patterns with Redis-based horizontal scaling, sticky sessions, optimized message broadcasting, and robust connection management for the construction syndicate system.
