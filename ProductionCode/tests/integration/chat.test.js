/**
 * 💬 CHAT INTEGRATION TESTS
 * =========================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - WebSocket chat testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import io from 'socket.io-client';
import request from 'supertest';
import { ConstructionGUIServer } from '../../src/web/construction-gui-server.js';
import { getUnifiedDatabase } from '../../src/database/UnifiedDatabaseConfig.js';

describe('Chat Integration Tests', () => {
    let server;
    let app;
    let serverUrl;
    let socket;
    let dbPool;
    let accessToken;
    
    const testUser = {
        username: 'chatuser',
        email: 'chatuser@test.com',
        password: 'ChatPassword123!'
    };
    
    beforeAll(async () => {
        // Initialize server
        server = new ConstructionGUIServer({
            port: 0, // Random port
            enableWebSocket: true
        });
        
        await server.initialize();
        const port = await server.start();
        
        app = server.app;
        serverUrl = `http://localhost:${port}`;
        dbPool = await getUnifiedDatabase();
        
        // Clean up and register test user
        await dbPool.query('DELETE FROM users WHERE email = $1', [testUser.email]);
        
        await request(app)
            .post('/api/auth/register')
            .send(testUser);
        
        // Login to get token
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
    
    beforeEach(async () => {
        // Disconnect socket if connected
        if (socket && socket.connected) {
            socket.disconnect();
        }
    });
    
    describe('WebSocket Connection', () => {
        it('should connect successfully without authentication', async () => {
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket']
                });
                
                socket.on('connect', () => {
                    expect(socket.connected).toBe(true);
                    resolve();
                });
            });
        });
        
        it('should connect with authentication token', async () => {
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    query: {
                        token: accessToken
                    }
                });
                
                socket.on('connect', () => {
                    expect(socket.connected).toBe(true);
                    
                    socket.on('authenticated', (data) => {
                        expect(data.user).toBeDefined();
                        expect(data.user.username).toBe(testUser.username);
                        resolve();
                    });
                });
            });
        });
        
        it('should receive system updates', async () => {
            return new Promise((resolve) => {
                socket = io(serverUrl, {
                    transports: ['websocket']
                });
                
                socket.on('connect', () => {
                    socket.on('systemUpdate', (data) => {
                        expect(data).toBeDefined();
                        expect(data.timestamp).toBeDefined();
                        resolve();
                    });
                });
            });
        }, 10000); // Increase timeout for system updates
    });
    
    describe('Chat Messages', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should send chat message to coordinator', async () => {
            return new Promise((resolve) => {
                const message = {
                    target: {
                        type: 'coordinator',
                        id: 'centralNervousSystem',
                        name: 'Central Nervous System'
                    },
                    message: 'Test message to coordinator',
                    reasoningConfig: {
                        enableCoT: true,
                        detailLevel: 5
                    }
                };
                
                socket.on('connect', () => {
                    // Listen for response
                    socket.on('chat:response', (response) => {
                        expect(response.from).toBe('Central Nervous System');
                        expect(response.response).toBeDefined();
                        expect(response.timestamp).toBeDefined();
                        resolve();
                    });
                    
                    // Send message
                    socket.emit('chat:message', message, (ack) => {
                        expect(ack.success).toBe(true);
                        expect(ack.messageId).toBeDefined();
                    });
                });
            });
        });
        
        it('should receive streaming response', async () => {
            return new Promise((resolve) => {
                const message = {
                    target: {
                        type: 'llm',
                        id: 'deepseek-v3',
                        name: 'Primary LLM'
                    },
                    message: 'Explain construction planning',
                    reasoningConfig: {
                        enableCoT: true,
                        temperature: 0.7
                    }
                };
                
                let chunks = [];
                
                socket.on('connect', () => {
                    // Listen for streaming chunks
                    socket.on('chat:streaming', (data) => {
                        expect(data.streamId).toBeDefined();
                        expect(data.chunk).toBeDefined();
                        chunks.push(data.chunk);
                    });
                    
                    // Listen for final response
                    socket.on('chat:response', (response) => {
                        expect(response.response).toBeDefined();
                        expect(chunks.length).toBeGreaterThan(0);
                        expect(chunks.join('')).toContain(response.response.substring(0, 10));
                        resolve();
                    });
                    
                    // Send message
                    socket.emit('chat:message', message);
                });
            });
        });
        
        it('should handle chat errors gracefully', async () => {
            return new Promise((resolve) => {
                const message = {
                    target: {
                        type: 'invalid',
                        id: 'nonexistent'
                    },
                    message: 'Test error handling'
                };
                
                socket.on('connect', () => {
                    socket.on('chatError', (error) => {
                        expect(error.error).toBeDefined();
                        expect(error.timestamp).toBeDefined();
                        resolve();
                    });
                    
                    socket.emit('chat:message', message);
                });
            });
        });
    });
    
    describe('System Subscriptions', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should subscribe to specific system updates', async () => {
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.emit('subscribeToSystem', 'agent-001');
                    
                    socket.on('systemUpdate', (data) => {
                        if (data.systemId === 'agent-001') {
                            expect(data.metrics).toBeDefined();
                            resolve();
                        }
                    });
                });
            });
        }, 10000);
        
        it('should unsubscribe from system updates', async () => {
            return new Promise((resolve) => {
                let receivedAfterUnsubscribe = false;
                
                socket.on('connect', () => {
                    socket.emit('subscribeToSystem', 'agent-002');
                    
                    setTimeout(() => {
                        socket.emit('unsubscribeFromSystem', 'agent-002');
                        
                        socket.on('systemUpdate', (data) => {
                            if (data.systemId === 'agent-002') {
                                receivedAfterUnsubscribe = true;
                            }
                        });
                        
                        setTimeout(() => {
                            expect(receivedAfterUnsubscribe).toBe(false);
                            resolve();
                        }, 2000);
                    }, 1000);
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
        
        it('should receive escalation notifications', async () => {
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('escalation', (data) => {
                        expect(data.id).toBeDefined();
                        expect(data.type).toBeDefined();
                        expect(data.severity).toBeDefined();
                        expect(data.message).toBeDefined();
                        expect(data.requiresAction).toBeDefined();
                        resolve();
                    });
                    
                    // Trigger test escalation
                    socket.emit('triggerTestEscalation');
                });
            });
        });
        
        it('should receive new notifications', async () => {
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('notificationNew', (data) => {
                        expect(data.id).toBeDefined();
                        expect(data.type).toBeDefined();
                        expect(data.message).toBeDefined();
                        expect(data.timestamp).toBeDefined();
                        resolve();
                    });
                    
                    // Trigger test notification
                    socket.emit('triggerTestNotification');
                });
            });
        });
    });
    
    describe('Plan Presentation', () => {
        beforeEach(() => {
            socket = io(serverUrl, {
                transports: ['websocket'],
                query: { token: accessToken }
            });
        });
        
        it('should receive plan presentation updates', async () => {
            return new Promise((resolve) => {
                socket.on('connect', () => {
                    socket.on('planPresentation', (data) => {
                        expect(data.planId).toBeDefined();
                        expect(data.step).toBeDefined();
                        expect(data.content).toBeDefined();
                        
                        if (data.step === 'complete') {
                            expect(data.summary).toBeDefined();
                            resolve();
                        }
                    });
                    
                    // Request plan presentation
                    socket.emit('requestPlanPresentation', {
                        planId: 'test-plan-001',
                        presentationType: 'investor'
                    });
                });
            });
        });
    });
    
    describe('Multiple Clients', () => {
        let socket2;
        
        afterEach(() => {
            if (socket2 && socket2.connected) {
                socket2.disconnect();
            }
        });
        
        it('should handle multiple concurrent connections', async () => {
            return new Promise((resolve) => {
                let connectedClients = 0;
                
                socket = io(serverUrl, {
                    transports: ['websocket'],
                    query: { token: accessToken }
                });
                
                socket2 = io(serverUrl, {
                    transports: ['websocket'],
                    forceNew: true
                });
                
                socket.on('connect', () => {
                    connectedClients++;
                    if (connectedClients === 2) {
                        expect(socket.connected).toBe(true);
                        expect(socket2.connected).toBe(true);
                        expect(socket.id).not.toBe(socket2.id);
                        resolve();
                    }
                });
                
                socket2.on('connect', () => {
                    connectedClients++;
                    if (connectedClients === 2) {
                        expect(socket.connected).toBe(true);
                        expect(socket2.connected).toBe(true);
                        expect(socket.id).not.toBe(socket2.id);
                        resolve();
                    }
                });
            });
        });
        
        it('should broadcast messages to all clients', async () => {
            return new Promise((resolve) => {
                let receivedCount = 0;
                
                socket = io(serverUrl, {
                    transports: ['websocket']
                });
                
                socket2 = io(serverUrl, {
                    transports: ['websocket'],
                    forceNew: true
                });
                
                const checkComplete = () => {
                    receivedCount++;
                    if (receivedCount === 2) {
                        resolve();
                    }
                };
                
                socket.on('broadcast', (data) => {
                    expect(data.message).toBe('Test broadcast');
                    checkComplete();
                });
                
                socket2.on('broadcast', (data) => {
                    expect(data.message).toBe('Test broadcast');
                    checkComplete();
                });
                
                // Wait for both to connect
                let connected = 0;
                socket.on('connect', () => {
                    connected++;
                    if (connected === 2) {
                        // Trigger broadcast
                        socket.emit('broadcastTest', { message: 'Test broadcast' });
                    }
                });
                
                socket2.on('connect', () => {
                    connected++;
                    if (connected === 2) {
                        // Trigger broadcast
                        socket.emit('broadcastTest', { message: 'Test broadcast' });
                    }
                });
            });
        });
    });
});
