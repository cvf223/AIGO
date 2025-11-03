/**
 * 🔐 AUTHENTICATION INTEGRATION TESTS
 * ===================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Comprehensive auth testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { ConstructionGUIServer } from '../../src/web/construction-gui-server.js';
import { getUnifiedDatabase } from '../../src/database/UnifiedDatabaseConfig.js';

describe('Authentication Integration Tests', () => {
    let server;
    let app;
    let dbPool;
    let testUser;
    
    beforeAll(async () => {
        // Initialize server
        server = new ConstructionGUIServer({
            port: 0, // Random port
            enableWebSocket: false // Disable WebSocket for tests
        });
        
        await server.initialize();
        await server.start();
        
        app = server.app;
        dbPool = await getUnifiedDatabase();
        
        // Clean up test data
        await dbPool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
    });
    
    afterAll(async () => {
        await server.stop();
        await dbPool.end();
    });
    
    beforeEach(async () => {
        // Clean up between tests
        await dbPool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.com']);
        
        testUser = {
            username: 'testuser',
            email: 'testuser@test.com',
            password: 'TestPassword123!'
        };
    });
    
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                user: {
                    username: testUser.username,
                    email: testUser.email,
                    role: 'user'
                }
            });
            
            expect(response.body.user.id).toBeDefined();
            expect(response.body.user.password_hash).toBeUndefined();
        });
        
        it('should reject duplicate username', async () => {
            // Register first user
            await request(app)
                .post('/api/auth/register')
                .send(testUser)
                .expect(200);
            
            // Try to register with same username
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'different@test.com'
                })
                .expect(400);
            
            expect(response.body).toMatchObject({
                success: false,
                error: expect.stringContaining('exists')
            });
        });
        
        it('should reject invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    email: 'invalid-email'
                })
                .expect(400);
            
            expect(response.body).toMatchObject({
                success: false,
                error: expect.stringContaining('email')
            });
        });
        
        it('should reject weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    password: 'weak'
                })
                .expect(400);
            
            expect(response.body).toMatchObject({
                success: false,
                error: expect.stringContaining('password')
            });
        });
    });
    
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Register user before login tests
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
        });
        
        it('should login successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                })
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                user: {
                    username: testUser.username,
                    email: testUser.email,
                    role: 'user'
                }
            });
            
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.refreshToken).toBeDefined();
            expect(response.body.expiresIn).toBeDefined();
            
            // Check cookie was set
            const cookies = response.headers['set-cookie'];
            expect(cookies).toBeDefined();
            expect(cookies[0]).toContain('accessToken');
        });
        
        it('should login with email instead of username', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testUser.email,
                    password: testUser.password
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
        });
        
        it('should reject incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testUser.username,
                    password: 'WrongPassword123!'
                })
                .expect(401);
            
            expect(response.body).toMatchObject({
                success: false,
                error: expect.stringContaining('Invalid')
            });
        });
        
        it('should reject non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'AnyPassword123!'
                })
                .expect(401);
            
            expect(response.body).toMatchObject({
                success: false,
                error: expect.stringContaining('Invalid')
            });
        });
    });
    
    describe('GET /api/auth/me', () => {
        let accessToken;
        
        beforeEach(async () => {
            // Register and login user
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
        
        it('should return current user with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                user: {
                    username: testUser.username,
                    email: testUser.email,
                    role: 'user'
                }
            });
            
            expect(response.body.stats).toBeDefined();
        });
        
        it('should reject request without token', async () => {
            await request(app)
                .get('/api/auth/me')
                .expect(401);
        });
        
        it('should reject request with invalid token', async () => {
            await request(app)
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);
        });
    });
    
    describe('POST /api/auth/logout', () => {
        let accessToken;
        
        beforeEach(async () => {
            // Register and login user
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
        
        it('should logout successfully', async () => {
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true
            });
            
            // Token should be invalidated
            await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(401);
        });
    });
    
    describe('POST /api/auth/refresh', () => {
        let refreshToken;
        
        beforeEach(async () => {
            // Register and login user
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });
            
            refreshToken = loginResponse.body.refreshToken;
        });
        
        it('should refresh access token successfully', async () => {
            const response = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken })
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true
            });
            
            expect(response.body.accessToken).toBeDefined();
            expect(response.body.expiresIn).toBeDefined();
            
            // New token should work
            await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${response.body.accessToken}`)
                .expect(200);
        });
        
        it('should reject invalid refresh token', async () => {
            await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid-refresh-token' })
                .expect(401);
        });
    });
    
    describe('Protected Routes', () => {
        let adminToken;
        let userToken;
        
        beforeEach(async () => {
            // Create admin user
            const adminUser = {
                username: 'admin',
                email: 'admin@test.com',
                password: 'AdminPassword123!',
                role: 'admin'
            };
            
            // Manually insert admin user
            const hashedPassword = await server.authService.hashPassword(adminUser.password);
            await dbPool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                [adminUser.username, adminUser.email, hashedPassword, adminUser.role]
            );
            
            // Login as admin
            const adminLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    username: adminUser.username,
                    password: adminUser.password
                });
            
            adminToken = adminLogin.body.accessToken;
            
            // Register regular user
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            // Login as regular user
            const userLogin = await request(app)
                .post('/api/auth/login')
                .send({
                    username: testUser.username,
                    password: testUser.password
                });
            
            userToken = userLogin.body.accessToken;
        });
        
        it('should allow admin access to admin routes', async () => {
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${adminToken}`)
                .expect(200);
            
            expect(response.body.success).toBe(true);
            expect(response.body.users).toBeDefined();
            expect(Array.isArray(response.body.users)).toBe(true);
        });
        
        it('should deny regular user access to admin routes', async () => {
            await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`)
                .expect(403);
        });
    });
});
