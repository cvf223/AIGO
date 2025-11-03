/**
 * 📊 CONSTRUCTION PLAN ANALYSIS INTEGRATION TESTS
 * ==============================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Plan analysis and annotation testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ConstructionGUIServer } from '../../src/web/construction-gui-server.js';
import { getUnifiedDatabase } from '../../src/database/UnifiedDatabaseConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Construction Plan Analysis Integration Tests', () => {
    let server;
    let app;
    let dbPool;
    let accessToken;
    let testPlanPath;
    
    const testUser = {
        username: 'analyst',
        email: 'analyst@test.com',
        password: 'AnalystPassword123!'
    };
    
    beforeAll(async () => {
        // Initialize server
        server = new ConstructionGUIServer({
            port: 0, // Random port
            enableWebSocket: false,
            uploadDir: path.join(__dirname, '../temp/uploads')
        });
        
        await server.initialize();
        await server.start();
        
        app = server.app;
        dbPool = await getUnifiedDatabase();
        
        // Create test upload directory
        await fs.mkdir(path.join(__dirname, '../temp/uploads'), { recursive: true });
        
        // Create test PDF file
        testPlanPath = path.join(__dirname, '../fixtures/test-plan.pdf');
        await fs.mkdir(path.dirname(testPlanPath), { recursive: true });
        
        // Create a simple PDF-like buffer (mock)
        const mockPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n');
        await fs.writeFile(testPlanPath, mockPdfContent);
        
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
        // Clean up
        await fs.rm(path.join(__dirname, '../temp'), { recursive: true, force: true });
        await fs.rm(path.join(__dirname, '../fixtures'), { recursive: true, force: true });
        
        await server.stop();
        await dbPool.end();
    });
    
    describe('POST /api/construction/upload-plan', () => {
        it('should upload a construction plan successfully', async () => {
            const response = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testPlanPath)
                .field('projectName', 'Test Project')
                .field('planType', 'floor_plan')
                .field('phase', 'LP 6')
                .field('description', 'Test floor plan for integration testing')
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                plan: {
                    filename: expect.stringContaining('test-plan'),
                    planType: 'floor_plan',
                    phase: 'LP 6'
                }
            });
            
            expect(response.body.plan.id).toBeDefined();
            expect(response.body.plan.projectId).toBeDefined();
        });
        
        it('should reject upload without authentication', async () => {
            await request(app)
                .post('/api/construction/upload-plan')
                .attach('plan', testPlanPath)
                .field('projectName', 'Test Project')
                .expect(401);
        });
        
        it('should reject upload without file', async () => {
            await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .field('projectName', 'Test Project')
                .expect(400);
        });
        
        it('should handle multiple plan uploads', async () => {
            const uploads = [];
            
            for (let i = 0; i < 3; i++) {
                const response = await request(app)
                    .post('/api/construction/upload-plan')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .attach('plan', testPlanPath)
                    .field('projectName', `Test Project ${i}`)
                    .field('planType', 'floor_plan')
                    .expect(200);
                
                uploads.push(response.body.plan);
            }
            
            expect(uploads).toHaveLength(3);
            expect(new Set(uploads.map(p => p.id)).size).toBe(3); // All unique IDs
        });
    });
    
    describe('POST /api/construction/analyze-plan', () => {
        let uploadedPlanId;
        
        beforeEach(async () => {
            // Upload a plan first
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testPlanPath)
                .field('projectName', 'Analysis Test Project')
                .field('planType', 'floor_plan')
                .field('phase', 'LP 6');
            
            uploadedPlanId = uploadResponse.body.plan.id;
        });
        
        it('should initiate plan analysis successfully', async () => {
            const response = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId: uploadedPlanId,
                    analysisType: 'comprehensive',
                    dinStandard: 'DIN 276',
                    hoaiPhase: 'LP 6',
                    options: {
                        extractMeasurements: true,
                        checkCompliance: true,
                        generateQuantities: true
                    }
                })
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                analysisId: expect.any(String),
                status: 'started'
            });
        });
        
        it('should reject analysis without valid plan ID', async () => {
            await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId: 'invalid-plan-id',
                    analysisType: 'comprehensive'
                })
                .expect(400);
        });
        
        it('should handle different analysis types', async () => {
            const analysisTypes = ['quick', 'comprehensive', 'compliance_only', 'measurements_only'];
            
            for (const type of analysisTypes) {
                const response = await request(app)
                    .post('/api/construction/analyze-plan')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({
                        planId: uploadedPlanId,
                        analysisType: type
                    })
                    .expect(200);
                
                expect(response.body.success).toBe(true);
            }
        });
    });
    
    describe('GET /api/construction/analysis/:analysisId/progress', () => {
        let analysisId;
        
        beforeEach(async () => {
            // Upload and start analysis
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testPlanPath)
                .field('projectName', 'Progress Test Project');
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId: uploadResponse.body.plan.id,
                    analysisType: 'comprehensive'
                });
            
            analysisId = analysisResponse.body.analysisId;
        });
        
        it('should return analysis progress', async () => {
            const response = await request(app)
                .get(`/api/construction/analysis/${analysisId}/progress`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                progress: {
                    status: expect.stringMatching(/pending|processing|completed/),
                    percentage: expect.any(Number),
                    currentStep: expect.any(String)
                }
            });
            
            expect(response.body.progress.percentage).toBeGreaterThanOrEqual(0);
            expect(response.body.progress.percentage).toBeLessThanOrEqual(100);
        });
        
        it('should return 404 for non-existent analysis', async () => {
            await request(app)
                .get('/api/construction/analysis/non-existent-id/progress')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });
    
    describe('GET /api/construction/analysis/:analysisId/results', () => {
        let analysisId;
        
        beforeEach(async () => {
            // Upload and complete analysis (mock)
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testPlanPath)
                .field('projectName', 'Results Test Project');
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId: uploadResponse.body.plan.id,
                    analysisType: 'comprehensive'
                });
            
            analysisId = analysisResponse.body.analysisId;
            
            // Mock complete the analysis
            await dbPool.query(
                'UPDATE plan_analyses SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE analysis_id = $2',
                ['completed', analysisId]
            );
        });
        
        it('should return analysis results when completed', async () => {
            const response = await request(app)
                .get(`/api/construction/analysis/${analysisId}/results`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                results: {
                    analysisId,
                    status: 'completed',
                    measurements: expect.any(Array),
                    materials: expect.any(Array),
                    compliance: expect.any(Array),
                    quantities: expect.any(Array)
                }
            });
        });
    });
    
    describe('POST /api/construction/annotate-plan', () => {
        let planId;
        let analysisId;
        
        beforeEach(async () => {
            // Upload and analyze plan
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testPlanPath)
                .field('projectName', 'Annotation Test Project');
            
            planId = uploadResponse.body.plan.id;
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId,
                    analysisType: 'comprehensive'
                });
            
            analysisId = analysisResponse.body.analysisId;
        });
        
        it('should generate annotated plan successfully', async () => {
            const response = await request(app)
                .post('/api/construction/annotate-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    analysisId,
                    planId,
                    template: 'detailed',
                    layers: {
                        measurements: true,
                        materials: true,
                        compliance: true,
                        reasoning: true,
                        errors: true
                    }
                })
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                annotatedPlanUrl: expect.any(String),
                downloadUrl: expect.any(String),
                stats: {
                    elementsAnnotated: expect.any(Number),
                    calculationsShown: expect.any(Number),
                    reasoningSteps: expect.any(Number)
                }
            });
        });
        
        it('should support different annotation templates', async () => {
            const templates = ['monitoring', 'investor', 'detailed'];
            
            for (const template of templates) {
                const response = await request(app)
                    .post('/api/construction/annotate-plan')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({
                        analysisId,
                        planId,
                        template
                    })
                    .expect(200);
                
                expect(response.body.success).toBe(true);
            }
        });
    });
    
    describe('GET /api/construction/projects', () => {
        beforeEach(async () => {
            // Create some test projects
            for (let i = 0; i < 3; i++) {
                await request(app)
                    .post('/api/construction/upload-plan')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .attach('plan', testPlanPath)
                    .field('projectName', `Project ${i}`)
                    .field('planType', 'floor_plan');
            }
        });
        
        it('should return user projects', async () => {
            const response = await request(app)
                .get('/api/construction/projects')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                projects: expect.any(Array)
            });
            
            expect(response.body.projects.length).toBeGreaterThan(0);
            
            response.body.projects.forEach(project => {
                expect(project).toMatchObject({
                    id: expect.any(Number),
                    name: expect.any(String),
                    status: expect.any(String),
                    planCount: expect.any(Number),
                    lastActivity: expect.any(String)
                });
            });
        });
    });
    
    describe('GET /api/construction/plans/status', () => {
        it('should return plan processing status summary', async () => {
            const response = await request(app)
                .get('/api/construction/plans/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                status: {
                    totalPlans: expect.any(Number),
                    pendingAnalysis: expect.any(Number),
                    inProgress: expect.any(Number),
                    completed: expect.any(Number),
                    failed: expect.any(Number)
                }
            });
        });
    });
});
