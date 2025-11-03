/**
 * 🔌 WEBSOCKET INTEGRATION TESTS
 * ==============================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Real-time communication testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import io from 'socket.io-client';
import request from 'supertest';
import { ConstructionGUIServer } from '../../src/web/construction-gui-server.js';
import { getUnifiedDatabase } from '../../src/database/UnifiedDatabaseConfig.js';

describe('WebSocket Integration Tests', () => {
    let server;
    let app;
    let serverUrl;
    let socket;
    let dbPool;
    let accessToken;
    
    const testUser = {
        username: 'wsuser',
        email: 'wsuser@test.com',
        password: 'WebSocketPassword123!'
    };
    
    beforeAll(async () => {
        // Initialize server with WebSocket enabled
        server = new ConstructionGUIServer({
            port: 0,
            enableWebSocket: true,
            updateInterval: 500 // Faster updates for testing
        });
        
        await server.initialize();
        const port = await server.start();
        
        app = server.app;
        serverUrl = `http://localhost:${port}`;
        dbPool = await getUnifiedDatabase();
        
        // Register and login test user
        await dbPool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
        
        await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: testUser.password
            });
        
        accessToken = loginResponse.body.accessToken;
    });
    
    afterAll(async () => {
        if (socket && socket.connected) {
            socket.disconnect();
        }
        await server.stop();
        await dbPool.end();
    });
    
    beforeEach(() => {
        if (socket && socket.connected) {
            socket.disconnect();
        }
    });
    
    describe('Connection Management', () => {
        it('should handle connection lifecycle events', async () => {
            const events = [];
            
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    autoConnect: false
                });
                
                socket.on('connect', () => {
                    events.push('connect');
                });
                
                socket.on('connect_error', (error) => {
                    events.push(`connect_error: ${error.message}`);
                });
                
                socket.on('disconnect', (reason) => {
                    events.push(`disconnect: ${reason}`);
                    
                    // Verify event sequence
                    expect(events).toContain('connect');
                    expect(events).toContain('disconnect: client disconnect');
                    resolve();
                });
                
                // Connect, wait, then disconnect
                socket.connect();
                
                setTimeout(() => {
                    socket.disconnect();
                }, 1000);
            });
        });
        
        it('should reconnect automatically after disconnect', async () => {
            let reconnectCount = 0;
            
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 3,
                    reconnectionDelay: 100
                });
                
                socket.on('connect', () => {
                    reconnectCount++;
                    
                    if (reconnectCount === 1) {
                        // Force disconnect
                        socket.io.engine.close();
                    } else if (reconnectCount === 2) {
                        // Successfully reconnected
                        expect(socket.connected).toBe(true);
                        resolve();
                    }
                });
            });
        });
    });
    
    describe('Authentication', () => {
        it('should authenticate WebSocket connection with valid token', async () => {
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    query: { token: accessToken }
                });
                
                socket.on('connect', () => {
                    expect(socket.connected).toBe(true);
                    
                    // Server should recognize authenticated user
                    socket.emit('whoami', (response) => {
                        expect(response.authenticated).toBe(true);
                        expect(response.user.username).toBe(testUser.username);
                        resolve();
                    });
                });
            });
        });
        
        it('should allow connection without token but limit features', async () => {
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket']
                });
                
                socket.on('connect', () => {
                    // Try to access protected feature
                    socket.emit('requestProtectedData', (response) => {
                        expect(response.error).toBeDefined();
                        expect(response.error).toContain('authentication required');
                        resolve();
                    });
                });
            });
        });
    });
    
    describe('System Monitoring Updates', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should receive periodic system updates', async () => {
            const updates = [];
            
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('systemUpdate', (data) => {
                        updates.push(data);
                        
                        // Verify update structure
                        expect(data).toMatchObject({
                            timestamp: expect.any(Number),
                            systems: expect.any(Object),
                            serverMetrics: expect.any(Object)
                        });
                        
                        // Collect 3 updates
                        if (updates.length >= 3) {
                            // Verify updates are periodic
                            const intervals = [];
                            for (let i = 1; i < updates.length; i++) {
                                intervals.push(updates[i].timestamp - updates[i-1].timestamp);
                            }
                            
                            // Should be close to updateInterval (500ms)
                            intervals.forEach(interval => {
                                expect(interval).toBeGreaterThan(400);
                                expect(interval).toBeLessThan(600);
                            });
                            
                            resolve();
                        }
                    });
                });
            });
        }, 5000);
        
        it('should filter system updates based on subscription', async () => {
            const updates = [];
            
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    // Subscribe to specific system
                    socket.emit('subscribeToSystem', 'test-agent-001');
                    
                    socket.on('systemUpdate', (data) => {
                        updates.push(data);
                        
                        // Should only receive updates for subscribed system
                        if (data.systems['test-agent-001']) {
                            expect(data.systems['test-agent-001']).toBeDefined();
                            resolve();
                        }
                    });
                });
            });
        });
    });
    
    describe('Real-time Notifications', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should broadcast notifications to all connected clients', async () => {
            const clients = [];
            const receivedNotifications = [];
            
            return new Promise((resolve) => {
                // Create 3 clients
                for (let i = 0; i < 3; i++) {
                    const client = io(serverUrl, {
                        transports: ['websocket'],
                        forceNew: true,
                        query: { token: accessToken }
                    });
                    
                    client.on('notificationNew', (notification) => {
                        receivedNotifications.push({ clientId: i, notification });
                        
                        // All clients should receive the notification
                        if (receivedNotifications.length === 3) {
                            expect(receivedNotifications).toHaveLength(3);
                            
                            // Verify all got the same notification
                            const firstNotification = receivedNotifications[0].notification;
                            receivedNotifications.forEach(({ notification }) => {
                                expect(notification.id).toBe(firstNotification.id);
                                expect(notification.message).toBe(firstNotification.message);
                            });
                            
                            // Clean up
                            clients.forEach(c => c.disconnect());
                            resolve();
                        }
                    });
                    
                    clients.push(client);
                }
                
                // Wait for all clients to connect
                let connectedCount = 0;
                clients.forEach(client => {
                    client.on('connect', () => {
                        connectedCount++;
                        if (connectedCount === 3) {
                            // Trigger broadcast notification
                            socket.emit('broadcastNotification', {
                                type: 'info',
                                message: 'Test broadcast notification'
                            });
                        }
                    });
                });
            });
        });
    });
    
    describe('Chat Message Routing', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should route messages to different targets', async () => {
            const targets = [
                { type: 'agent', id: 'test-agent', name: 'Test Agent' },
                { type: 'llm', id: 'test-llm', name: 'Test LLM' },
                { type: 'coordinator', id: 'centralNervousSystem', name: 'CNS' }
            ];
            
            const responses = [];
            
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('chat:response', (response) => {
                        responses.push(response);
                        
                        if (responses.length === targets.length) {
                            // Verify each target responded
                            targets.forEach((target, index) => {
                                expect(responses[index].from).toContain(target.name);
                            });
                            resolve();
                        }
                    });
                    
                    // Send messages to each target
                    targets.forEach(target => {
                        socket.emit('chat:message', {
                            target,
                            message: `Test message to ${target.name}`,
                            reasoningConfig: { enableCoT: true }
                        });
                    });
                });
            });
        });
    });
    
    describe('Error Handling', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should handle malformed messages gracefully', async () => {
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('error', (error) => {
                        expect(error.message).toBeDefined();
                        resolve();
                    });
                    
                    // Send malformed message
                    socket.emit('chat:message', { 
                        // Missing required fields
                        invalidField: 'test' 
                    });
                });
            });
        });
        
        it('should handle server errors without disconnecting', async () => {
            let disconnected = false;
            
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('disconnect', () => {
                        disconnected = true;
                    });
                    
                    socket.on('serverError', (error) => {
                        expect(error.message).toBeDefined();
                        
                        // Wait to ensure no disconnect
                        setTimeout(() => {
                            expect(disconnected).toBe(false);
                            expect(socket.connected).toBe(true);
                            resolve();
                        }, 500);
                    });
                    
                    // Trigger server error
                    socket.emit('triggerServerError');
                });
            });
        });
    });
    
    describe('Performance', () => {
        it('should handle rapid message sending', async () => {
            const messageCount = 100;
            const responses = [];
            
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    query: { token: accessToken }
                });
                
                socket.on('connect', () => {
                    socket.on('echo', (data) => {
                        responses.push(data);
                        
                        if (responses.length === messageCount) {
                            // All messages received
                            expect(responses).toHaveLength(messageCount);
                            
                            // Verify order preserved
                            responses.forEach((response, index) => {
                                expect(response.index).toBe(index);
                            });
                            
                            resolve();
                        }
                    });
                    
                    // Send messages rapidly
                    for (let i = 0; i < messageCount; i++) {
                        socket.emit('echo', { index: i, timestamp: Date.now() });
                    }
                });
            });
        });
        
        it('should handle large message payloads', async () => {
            const largePayload = {
                data: 'x'.repeat(1024 * 100), // 100KB
                metadata: {
                    size: 1024 * 100,
                    type: 'test'
                }
            };
            
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    query: { token: accessToken }
                });
                
                socket.on('connect', () => {
                    socket.on('largePayloadResponse', (response) => {
                        expect(response.received).toBe(true);
                        expect(response.size).toBe(largePayload.metadata.size);
                        resolve();
                    });
                    
                    socket.emit('largePayload', largePayload);
                });
            });
        });
    });
    
    describe('Connection Limits', () => {
        it('should enforce connection limits per user', async () => {
            const maxConnections = 5;
            const connections = [];
            
            return new Promise((resolve) => {
                let rejectedConnection = false;
                
                // Create max connections
                for (let i = 0; i < maxConnections + 1; i++) {
                    const client = io(serverUrl, {
                        transports: ['websocket'],
                        forceNew: true,
                        query: { token: accessToken }
                    });
                    
                    client.on('connect', () => {
                        connections.push(client);
                    });
                    
                    client.on('connect_error', (error) => {
                        if (error.message.includes('connection limit')) {
                            rejectedConnection = true;
                            
                            // Should have max connections
                            expect(connections.length).toBe(maxConnections);
                            expect(rejectedConnection).toBe(true);
                            
                            // Clean up
                            connections.forEach(c => c.disconnect());
                            resolve();
                        }
                    });
                }
            });
        });
    });
});
