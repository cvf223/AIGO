/**
 * 🎨 VLM ANNOTATION INTEGRATION TESTS
 * ===================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Visual annotation testing
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { ConstructionGUIServer } from '../../src/web/construction-gui-server.js';
import { getUnifiedDatabase } from '../../src/database/UnifiedDatabaseConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('VLM Annotation Integration Tests', () => {
    let server;
    let app;
    let dbPool;
    let accessToken;
    let testImagePath;
    
    const testUser = {
        username: 'annotator',
        email: 'annotator@test.com',
        password: 'AnnotatorPassword123!'
    };
    
    beforeAll(async () => {
        // Initialize server
        server = new ConstructionGUIServer({
            port: 0,
            enableWebSocket: false,
            uploadDir: path.join(__dirname, '../temp/uploads')
        });
        
        await server.initialize();
        await server.start();
        
        app = server.app;
        dbPool = await getUnifiedDatabase();
        
        // Create test directories
        await fs.mkdir(path.join(__dirname, '../temp/uploads/plans'), { recursive: true });
        await fs.mkdir(path.join(__dirname, '../temp/uploads/annotated'), { recursive: true });
        
        // Create test image
        testImagePath = path.join(__dirname, '../fixtures/test-plan.png');
        await fs.mkdir(path.dirname(testImagePath), { recursive: true });
        
        // Generate a test construction plan image
        const image = await sharp({
            create: {
                width: 1200,
                height: 800,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .composite([
            {
                input: Buffer.from(`
                    <svg width="1200" height="800">
                        <rect x="100" y="100" width="400" height="300" stroke="black" stroke-width="2" fill="none"/>
                        <rect x="500" y="100" width="200" height="300" stroke="black" stroke-width="2" fill="none"/>
                        <line x1="100" y1="250" x2="500" y2="250" stroke="black" stroke-width="1" stroke-dasharray="5,5"/>
                        <text x="300" y="90" font-size="16" font-family="Arial">Floor Plan - Level 1</text>
                        <text x="150" y="250" font-size="12" font-family="Arial">Room A: 40m²</text>
                        <text x="550" y="250" font-size="12" font-family="Arial">Room B: 20m²</text>
                    </svg>
                `),
                top: 0,
                left: 0
            }
        ])
        .png()
        .toFile(testImagePath);
        
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
        await fs.rm(path.join(__dirname, '../temp'), { recursive: true, force: true });
        await fs.rm(path.join(__dirname, '../fixtures'), { recursive: true, force: true });
        
        await server.stop();
        await dbPool.end();
    });
    
    describe('VLM Annotation Engine', () => {
        it('should initialize VLM annotation engine', async () => {
            expect(server.vlmAnnotationEngine).toBeDefined();
            expect(server.vlmAnnotationEngine.isInitialized).toBe(true);
        });
        
        it('should have correct annotation capabilities', async () => {
            const metrics = server.vlmAnnotationEngine.getMetrics();
            
            expect(metrics).toMatchObject({
                plansAnalyzed: expect.any(Number),
                annotationsGenerated: expect.any(Number),
                elementsDetected: expect.any(Number),
                quantitiesCalculated: expect.any(Number),
                successRate: expect.any(Number)
            });
        });
    });
    
    describe('Plan Analysis with VLM', () => {
        let planId;
        let analysisId;
        
        beforeEach(async () => {
            // Upload test plan image
            const formData = new FormData();
            const imageBuffer = await fs.readFile(testImagePath);
            
            // Create a mock PDF that contains the image
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testImagePath)
                .field('projectName', 'VLM Test Project')
                .field('planType', 'floor_plan')
                .field('phase', 'LP 6');
            
            planId = uploadResponse.body.plan.id;
            
            // Copy image to expected location
            const planImagePath = path.join(__dirname, '../temp/uploads/plans', planId + '.png');
            await fs.copyFile(testImagePath, planImagePath);
        });
        
        it('should analyze plan with VLM and extract elements', async () => {
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId,
                    analysisType: 'vlm_comprehensive',
                    options: {
                        useVisionModel: true,
                        extractStructural: true,
                        extractMeasurements: true,
                        extractMaterials: true
                    }
                })
                .expect(200);
            
            analysisId = analysisResponse.body.analysisId;
            
            // Wait for analysis to complete (mock)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check analysis results
            const resultsResponse = await request(app)
                .get(`/api/construction/analysis/${analysisId}/results`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(resultsResponse.body.results).toMatchObject({
                structural: expect.arrayContaining([
                    expect.objectContaining({
                        type: 'wall',
                        confidence: expect.any(Number)
                    })
                ]),
                measurements: expect.arrayContaining([
                    expect.objectContaining({
                        type: 'area',
                        value: expect.stringMatching(/\d+/),
                        unit: expect.any(String)
                    })
                ])
            });
        });
    });
    
    describe('Annotation Generation', () => {
        let planId;
        let analysisId;
        
        beforeEach(async () => {
            // Upload and analyze plan
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testImagePath)
                .field('projectName', 'Annotation Generation Test');
            
            planId = uploadResponse.body.plan.id;
            
            // Copy image to expected location
            const planImagePath = path.join(__dirname, '../temp/uploads/plans', planId + '.png');
            await fs.copyFile(testImagePath, planImagePath);
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId,
                    analysisType: 'comprehensive'
                });
            
            analysisId = analysisResponse.body.analysisId;
        });
        
        it('should generate annotated plan with all layers', async () => {
            const response = await request(app)
                .post('/api/construction/annotate-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    analysisId,
                    planId,
                    template: 'detailed',
                    layers: {
                        detections: true,
                        quantities: true,
                        reasoning: true,
                        thinking: true,
                        errors: true,
                        compliance: true,
                        planning: true,
                        conclusions: true,
                        legend: true
                    }
                })
                .expect(200);
            
            expect(response.body).toMatchObject({
                success: true,
                annotatedPlanUrl: expect.stringContaining('/annotated-plans/'),
                downloadUrl: expect.stringContaining('/download-annotated/'),
                stats: {
                    elementsAnnotated: expect.any(Number),
                    calculationsShown: expect.any(Number),
                    reasoningSteps: expect.any(Number),
                    errorsHighlighted: expect.any(Number)
                },
                annotations: expect.objectContaining({
                    detections: expect.any(Array),
                    quantities: expect.any(Array),
                    reasoning: expect.any(Array)
                })
            });
        });
        
        it('should generate investor-focused annotations', async () => {
            const response = await request(app)
                .post('/api/construction/annotate-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    analysisId,
                    planId,
                    template: 'investor',
                    layers: {
                        quantities: true,
                        compliance: true,
                        conclusions: true
                    }
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            
            // Verify investor template focuses on key metrics
            const annotations = response.body.annotations;
            expect(annotations.quantities).toBeDefined();
            expect(annotations.compliance).toBeDefined();
            expect(annotations.conclusions).toBeDefined();
            expect(annotations.thinking).toBeUndefined(); // Hidden for investors
        });
        
        it('should generate monitoring-focused annotations', async () => {
            const response = await request(app)
                .post('/api/construction/annotate-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    analysisId,
                    planId,
                    template: 'monitoring',
                    layers: {
                        detections: true,
                        errors: true,
                        reasoning: true,
                        thinking: true
                    }
                })
                .expect(200);
            
            expect(response.body.success).toBe(true);
            
            // Verify monitoring template includes debugging info
            const annotations = response.body.annotations;
            expect(annotations.reasoning).toBeDefined();
            expect(annotations.thinking).toBeDefined();
        });
    });
    
    describe('Annotation Download', () => {
        let planId;
        let analysisId;
        
        beforeEach(async () => {
            // Upload, analyze, and annotate plan
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testImagePath)
                .field('projectName', 'Download Test');
            
            planId = uploadResponse.body.plan.id;
            
            // Copy image
            const planImagePath = path.join(__dirname, '../temp/uploads/plans', planId + '.png');
            await fs.copyFile(testImagePath, planImagePath);
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ planId, analysisType: 'comprehensive' });
            
            analysisId = analysisResponse.body.analysisId;
            
            // Generate annotations
            await request(app)
                .post('/api/construction/annotate-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    analysisId,
                    planId,
                    template: 'detailed'
                });
        });
        
        it('should download annotated plan as PNG', async () => {
            const response = await request(app)
                .get(`/api/construction/analysis/${analysisId}/download-annotated/${planId}`)
                .query({ format: 'png' })
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            expect(response.headers['content-type']).toContain('image/png');
            expect(response.headers['content-disposition']).toContain('attachment');
            expect(response.headers['content-disposition']).toContain('.png');
            
            // Verify it's a valid PNG
            const imageInfo = await sharp(response.body).metadata();
            expect(imageInfo.format).toBe('png');
            expect(imageInfo.width).toBeGreaterThan(0);
            expect(imageInfo.height).toBeGreaterThan(0);
        });
        
        it('should include all annotation layers in download', async () => {
            const response = await request(app)
                .get(`/api/construction/analysis/${analysisId}/download-annotated/${planId}`)
                .query({ format: 'png', layers: 'all' })
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);
            
            // Save to temp file to inspect
            const tempPath = path.join(__dirname, '../temp/test-annotated.png');
            await fs.writeFile(tempPath, response.body);
            
            // Verify annotations were applied (file size should be larger)
            const originalSize = (await fs.stat(testImagePath)).size;
            const annotatedSize = (await fs.stat(tempPath)).size;
            
            expect(annotatedSize).toBeGreaterThan(originalSize);
        });
    });
    
    describe('Real-time Annotation Updates', () => {
        it('should update annotations based on analysis progress', async () => {
            // Upload plan
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testImagePath)
                .field('projectName', 'Real-time Test');
            
            const planId = uploadResponse.body.plan.id;
            
            // Start analysis
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    planId,
                    analysisType: 'progressive', // Gradual analysis
                    options: {
                        enableRealTimeUpdates: true
                    }
                });
            
            const analysisId = analysisResponse.body.analysisId;
            
            // Poll for updates
            let lastAnnotationCount = 0;
            let attempts = 0;
            
            while (attempts < 5) {
                const annotationResponse = await request(app)
                    .post('/api/construction/annotate-plan')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send({
                        analysisId,
                        planId,
                        template: 'monitoring'
                    });
                
                if (annotationResponse.body.success) {
                    const currentCount = annotationResponse.body.stats.elementsAnnotated || 0;
                    expect(currentCount).toBeGreaterThanOrEqual(lastAnnotationCount);
                    lastAnnotationCount = currentCount;
                }
                
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        });
    });
    
    describe('Annotation Templates', () => {
        let planId;
        let analysisId;
        
        beforeEach(async () => {
            const uploadResponse = await request(app)
                .post('/api/construction/upload-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .attach('plan', testImagePath)
                .field('projectName', 'Template Test');
            
            planId = uploadResponse.body.plan.id;
            
            const planImagePath = path.join(__dirname, '../temp/uploads/plans', planId + '.png');
            await fs.copyFile(testImagePath, planImagePath);
            
            const analysisResponse = await request(app)
                .post('/api/construction/analyze-plan')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ planId, analysisType: 'comprehensive' });
            
            analysisId = analysisResponse.body.analysisId;
        });
        
        it('should apply template-specific styling', async () => {
            const templates = ['monitoring', 'investor', 'detailed'];
            const results = {};
            
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
                
                results[template] = response.body;
            }
            
            // Verify different templates produce different results
            expect(results.monitoring.annotations).not.toEqual(results.investor.annotations);
            expect(results.investor.annotations).not.toEqual(results.detailed.annotations);
            
            // Monitoring should have more technical details
            expect(Object.keys(results.monitoring.annotations).length)
                .toBeGreaterThanOrEqual(Object.keys(results.investor.annotations).length);
            
            // Detailed should have the most information
            expect(Object.keys(results.detailed.annotations).length)
                .toBeGreaterThanOrEqual(Object.keys(results.monitoring.annotations).length);
        });
    });
});
