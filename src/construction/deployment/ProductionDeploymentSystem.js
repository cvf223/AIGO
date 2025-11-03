/**
 * 🚀 PRODUCTION DEPLOYMENT SYSTEM - SERVER INFRASTRUCTURE
 * ========================================================
 * 
 * MISSION: Deploy the construction analysis system to production server
 * 
 * KEY CAPABILITIES:
 * ✅ Express API server with authentication
 * ✅ WebSocket support for real-time updates
 * ✅ Rate limiting and security middleware
 * ✅ Monitoring and logging integration
 * ✅ Auto-scaling and load balancing ready
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Deployment
 */

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Import construction systems
import RealPixelAnalyzer from '../vision/RealPixelAnalyzer.js';
import PreciseMeasurementEngine from '../analysis/PreciseMeasurementEngine.js';
import ElementClassificationSystem from '../ml/ElementClassificationSystem.js';
import MaterialSpecificationDB from '../database/MaterialSpecificationDB.js';
import DIN276CostMapper from '../costing/DIN276CostMapper.js';
import STLBBauConnector from '../standards/STLBBauConnector.js';
import DynamicAusschreibungGenerator from '../documents/DynamicAusschreibungGenerator.js';
import LP6ComprehensiveGenerator from '../hoai/LP6ComprehensiveGenerator.js';
import HumanVerifiableReports from '../verification/HumanVerifiableReports.js';

export default class ProductionDeploymentSystem {
    constructor() {
        this.config = {
            server: {
                port: process.env.PORT || 3000,
                host: process.env.HOST || '0.0.0.0',
                environment: process.env.NODE_ENV || 'production',
                
                // SSL Configuration
                ssl: {
                    enabled: process.env.SSL_ENABLED === 'true',
                    certPath: process.env.SSL_CERT_PATH,
                    keyPath: process.env.SSL_KEY_PATH
                },
                
                // Cluster Configuration
                cluster: {
                    enabled: process.env.CLUSTER_ENABLED === 'true',
                    workers: parseInt(process.env.WORKER_COUNT) || 4
                }
            },
            
            // Security Configuration
            security: {
                jwtSecret: process.env.JWT_SECRET || 'construction-ai-secret-key-change-in-production',
                jwtExpiry: '24h',
                bcryptRounds: 10,
                
                // CORS settings
                cors: {
                    origin: process.env.CORS_ORIGIN || '*',
                    credentials: true,
                    methods: ['GET', 'POST', 'PUT', 'DELETE'],
                    allowedHeaders: ['Content-Type', 'Authorization']
                },
                
                // Rate limiting
                rateLimiting: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100, // limit each IP to 100 requests per windowMs
                    message: 'Too many requests from this IP, please try again later.',
                    
                    // Different limits for different endpoints
                    endpoints: {
                        '/api/analyze': { windowMs: 15 * 60 * 1000, max: 10 },
                        '/api/generate': { windowMs: 15 * 60 * 1000, max: 5 },
                        '/api/auth': { windowMs: 5 * 60 * 1000, max: 5 }
                    }
                }
            },
            
            // Storage Configuration
            storage: {
                uploadsDir: process.env.UPLOADS_DIR || './uploads',
                outputDir: process.env.OUTPUT_DIR || './output',
                maxFileSize: 100 * 1024 * 1024, // 100MB
                allowedMimeTypes: [
                    'image/png',
                    'image/jpeg',
                    'image/jpg',
                    'application/pdf'
                ]
            },
            
            // Monitoring Configuration
            monitoring: {
                logsDir: process.env.LOGS_DIR || './logs',
                metricsEnabled: process.env.METRICS_ENABLED === 'true',
                healthCheckPath: '/health',
                metricsPath: '/metrics',
                
                // Log levels
                logLevel: process.env.LOG_LEVEL || 'info',
                
                // Performance monitoring
                performanceTracking: {
                    enabled: true,
                    slowRequestThreshold: 5000 // ms
                }
            },
            
            // API Configuration
            api: {
                version: 'v1',
                prefix: '/api/v1',
                
                // Endpoints
                endpoints: {
                    // Authentication
                    auth: {
                        login: '/auth/login',
                        register: '/auth/register',
                        refresh: '/auth/refresh',
                        verify: '/auth/verify'
                    },
                    
                    // Analysis
                    analysis: {
                        upload: '/analyze/upload',
                        status: '/analyze/status/:jobId',
                        result: '/analyze/result/:jobId'
                    },
                    
                    // Generation
                    generation: {
                        ausschreibung: '/generate/ausschreibung',
                        lp6: '/generate/lp6',
                        verification: '/generate/verification'
                    },
                    
                    // Projects
                    projects: {
                        list: '/projects',
                        create: '/projects',
                        get: '/projects/:id',
                        update: '/projects/:id',
                        delete: '/projects/:id'
                    }
                }
            },
            
            // WebSocket Configuration
            websocket: {
                enabled: true,
                namespace: '/construction',
                
                // Events
                events: {
                    // Client -> Server
                    analyzeStart: 'analyze:start',
                    analyzeCancel: 'analyze:cancel',
                    subscribeProgress: 'progress:subscribe',
                    
                    // Server -> Client
                    analysisProgress: 'analysis:progress',
                    analysisComplete: 'analysis:complete',
                    analysisError: 'analysis:error',
                    queueUpdate: 'queue:update'
                }
            },
            
            // Queue Configuration
            queue: {
                maxConcurrentJobs: parseInt(process.env.MAX_CONCURRENT_JOBS) || 5,
                jobTimeout: 30 * 60 * 1000, // 30 minutes
                retryAttempts: 3,
                retryDelay: 5000 // ms
            }
        };
        
        // Initialize components
        this.app = null;
        this.server = null;
        this.io = null;
        this.logger = null;
        this.jobQueue = new Map();
        this.activeJobs = new Map();
        this.users = new Map(); // In production, use database
        
        // Initialize construction systems
        this.systems = {
            pixelAnalyzer: null,
            measurementEngine: null,
            classificationSystem: null,
            materialDB: null,
            costMapper: null,
            stlbConnector: null,
            ausschreibungGenerator: null,
            lp6Generator: null,
            verificationReports: null
        };
    }
    
    /**
     * 🚀 INITIALIZE DEPLOYMENT SYSTEM
     */
    async initialize() {
        console.log('🚀 INITIALIZING PRODUCTION DEPLOYMENT SYSTEM');
        console.log('===========================================');
        
        try {
            // Step 1: Setup logging
            await this.setupLogging();
            this.logger.info('Deployment system initializing...');
            
            // Step 2: Create required directories
            await this.createDirectories();
            
            // Step 3: Initialize construction systems
            await this.initializeConstructionSystems();
            
            // Step 4: Setup Express server
            await this.setupServer();
            
            // Step 5: Setup middleware
            await this.setupMiddleware();
            
            // Step 6: Setup routes
            await this.setupRoutes();
            
            // Step 7: Setup WebSocket
            if (this.config.websocket.enabled) {
                await this.setupWebSocket();
            }
            
            // Step 8: Setup error handling
            await this.setupErrorHandling();
            
            this.logger.info('✅ Deployment system initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
            throw error;
        }
    }
    
    /**
     * 🖥️ START PRODUCTION SERVER
     */
    async startServer() {
        return new Promise((resolve, reject) => {
            try {
                const { port, host } = this.config.server;
                
                this.server = this.app.listen(port, host, () => {
                    this.logger.info(`🌟 Production server running at http://${host}:${port}`);
                    this.logger.info(`📊 Environment: ${this.config.server.environment}`);
                    this.logger.info(`🔒 Authentication: Enabled`);
                    this.logger.info(`🌐 WebSocket: ${this.config.websocket.enabled ? 'Enabled' : 'Disabled'}`);
                    this.logger.info(`📈 Metrics: ${this.config.monitoring.metricsEnabled ? 'Enabled' : 'Disabled'}`);
                    
                    resolve(this.server);
                });
                
                // Graceful shutdown
                process.on('SIGTERM', () => this.gracefulShutdown());
                process.on('SIGINT', () => this.gracefulShutdown());
                
            } catch (error) {
                this.logger.error('Failed to start server:', error);
                reject(error);
            }
        });
    }
    
    /**
     * 📊 SETUP LOGGING
     */
    async setupLogging() {
        const logDir = this.config.monitoring.logsDir;
        await fs.mkdir(logDir, { recursive: true });
        
        // Configure Winston logger
        this.logger = winston.createLogger({
            level: this.config.monitoring.logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { service: 'construction-deployment' },
            transports: [
                // Console transport
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                }),
                
                // File transports
                new winston.transports.File({ 
                    filename: path.join(logDir, 'error.log'), 
                    level: 'error' 
                }),
                new winston.transports.File({ 
                    filename: path.join(logDir, 'combined.log') 
                }),
                
                // Rotating file transport for access logs
                new winston.transports.File({
                    filename: path.join(logDir, 'access.log'),
                    level: 'info',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.printf(info => 
                            `${info.timestamp} ${info.level}: ${info.message}`
                        )
                    )
                })
            ]
        });
        
        // Handle uncaught exceptions
        this.logger.exceptions.handle(
            new winston.transports.File({ 
                filename: path.join(logDir, 'exceptions.log') 
            })
        );
    }
    
    /**
     * 📁 CREATE REQUIRED DIRECTORIES
     */
    async createDirectories() {
        const dirs = [
            this.config.storage.uploadsDir,
            this.config.storage.outputDir,
            path.join(this.config.storage.outputDir, 'ausschreibung'),
            path.join(this.config.storage.outputDir, 'lp6'),
            path.join(this.config.storage.outputDir, 'verification'),
            this.config.monitoring.logsDir
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
        
        this.logger.info('Created required directories');
    }
    
    /**
     * 🏗️ INITIALIZE CONSTRUCTION SYSTEMS
     */
    async initializeConstructionSystems() {
        this.logger.info('Initializing construction analysis systems...');
        
        // Initialize all systems
        this.systems.pixelAnalyzer = new RealPixelAnalyzer();
        this.systems.measurementEngine = new PreciseMeasurementEngine();
        this.systems.classificationSystem = new ElementClassificationSystem();
        this.systems.materialDB = new MaterialSpecificationDB();
        this.systems.costMapper = new DIN276CostMapper();
        this.systems.stlbConnector = new STLBBauConnector();
        this.systems.ausschreibungGenerator = new DynamicAusschreibungGenerator();
        this.systems.lp6Generator = new LP6ComprehensiveGenerator();
        this.systems.verificationReports = new HumanVerifiableReports();
        
        // Initialize in parallel
        await Promise.all([
            this.systems.pixelAnalyzer.initialize(),
            this.systems.measurementEngine.initialize(),
            this.systems.classificationSystem.initialize(),
            this.systems.materialDB.initialize(),
            this.systems.costMapper.initialize(),
            this.systems.stlbConnector.initialize(),
            this.systems.ausschreibungGenerator.initialize(),
            this.systems.lp6Generator.initialize(),
            this.systems.verificationReports.initialize()
        ]);
        
        this.logger.info('✅ All construction systems initialized');
    }
    
    /**
     * 🖥️ SETUP EXPRESS SERVER
     */
    async setupServer() {
        this.app = express();
        this.server = createServer(this.app);
        
        // Trust proxy for accurate IP addresses
        this.app.set('trust proxy', true);
        
        // Disable X-Powered-By header
        this.app.disable('x-powered-by');
    }
    
    /**
     * 🛡️ SETUP MIDDLEWARE
     */
    async setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "blob:"],
                    connectSrc: ["'self'", "ws:", "wss:"]
                }
            }
        }));
        
        // CORS
        this.app.use(cors(this.config.security.cors));
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        
        // Request logging
        this.app.use((req, res, next) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                this.logger.info({
                    method: req.method,
                    url: req.url,
                    status: res.statusCode,
                    duration: duration,
                    ip: req.ip,
                    userAgent: req.get('user-agent')
                });
                
                // Track slow requests
                if (duration > this.config.monitoring.performanceTracking.slowRequestThreshold) {
                    this.logger.warn(`Slow request detected: ${req.method} ${req.url} took ${duration}ms`);
                }
            });
            
            next();
        });
        
        // Default rate limiting
        this.app.use(rateLimit(this.config.security.rateLimiting));
        
        // File upload configuration
        const storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const uploadDir = path.join(this.config.storage.uploadsDir, req.user?.id || 'anonymous');
                await fs.mkdir(uploadDir, { recursive: true });
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
            }
        });
        
        this.upload = multer({
            storage: storage,
            limits: {
                fileSize: this.config.storage.maxFileSize
            },
            fileFilter: (req, file, cb) => {
                if (this.config.storage.allowedMimeTypes.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type. Only PNG, JPEG, and PDF files are allowed.'));
                }
            }
        });
    }
    
    /**
     * 🛣️ SETUP ROUTES
     */
    async setupRoutes() {
        const router = express.Router();
        
        // Health check
        router.get(this.config.monitoring.healthCheckPath, (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                activeJobs: this.activeJobs.size,
                queuedJobs: this.jobQueue.size
            });
        });
        
        // Metrics endpoint
        if (this.config.monitoring.metricsEnabled) {
            router.get(this.config.monitoring.metricsPath, async (req, res) => {
                const metrics = await this.collectMetrics();
                res.json(metrics);
            });
        }
        
        // Authentication routes
        this.setupAuthRoutes(router);
        
        // Analysis routes
        this.setupAnalysisRoutes(router);
        
        // Generation routes
        this.setupGenerationRoutes(router);
        
        // Project routes
        this.setupProjectRoutes(router);
        
        // Apply API prefix
        this.app.use(this.config.api.prefix, router);
        
        // Static file serving for outputs
        this.app.use('/output', express.static(this.config.storage.outputDir));
        
        this.logger.info('Routes configured');
    }
    
    /**
     * 🔐 SETUP AUTHENTICATION ROUTES
     */
    setupAuthRoutes(router) {
        const authLimiter = rateLimit(this.config.security.rateLimiting.endpoints['/api/auth']);
        
        // Register
        router.post(this.config.api.endpoints.auth.register, authLimiter, async (req, res, next) => {
            try {
                const { email, password, organization } = req.body;
                
                // Validate input
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password required' });
                }
                
                // Check if user exists
                if (this.users.has(email)) {
                    return res.status(409).json({ error: 'User already exists' });
                }
                
                // Hash password
                const hashedPassword = await bcrypt.hash(password, this.config.security.bcryptRounds);
                
                // Create user
                const user = {
                    id: uuidv4(),
                    email,
                    password: hashedPassword,
                    organization,
                    createdAt: new Date().toISOString(),
                    apiKey: uuidv4()
                };
                
                this.users.set(email, user);
                
                // Generate JWT
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    this.config.security.jwtSecret,
                    { expiresIn: this.config.security.jwtExpiry }
                );
                
                res.json({
                    message: 'User registered successfully',
                    token,
                    apiKey: user.apiKey
                });
                
            } catch (error) {
                next(error);
            }
        });
        
        // Login
        router.post(this.config.api.endpoints.auth.login, authLimiter, async (req, res, next) => {
            try {
                const { email, password } = req.body;
                
                // Find user
                const user = this.users.get(email);
                if (!user) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                // Verify password
                const valid = await bcrypt.compare(password, user.password);
                if (!valid) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }
                
                // Generate JWT
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    this.config.security.jwtSecret,
                    { expiresIn: this.config.security.jwtExpiry }
                );
                
                res.json({
                    message: 'Login successful',
                    token,
                    apiKey: user.apiKey
                });
                
            } catch (error) {
                next(error);
            }
        });
        
        // Verify token
        router.get(this.config.api.endpoints.auth.verify, this.authenticateToken.bind(this), (req, res) => {
            res.json({
                valid: true,
                user: {
                    id: req.user.id,
                    email: req.user.email
                }
            });
        });
    }
    
    /**
     * 📊 SETUP ANALYSIS ROUTES
     */
    setupAnalysisRoutes(router) {
        const analyzeLimiter = rateLimit(this.config.security.rateLimiting.endpoints['/api/analyze']);
        
        // Upload and analyze
        router.post(
            this.config.api.endpoints.analysis.upload,
            this.authenticateToken.bind(this),
            analyzeLimiter,
            this.upload.single('plan'),
            async (req, res, next) => {
                try {
                    if (!req.file) {
                        return res.status(400).json({ error: 'No file uploaded' });
                    }
                    
                    const jobId = uuidv4();
                    const job = {
                        id: jobId,
                        userId: req.user.id,
                        file: req.file,
                        projectInfo: req.body.projectInfo ? JSON.parse(req.body.projectInfo) : {},
                        status: 'queued',
                        createdAt: new Date().toISOString(),
                        progress: 0
                    };
                    
                    // Add to queue
                    this.jobQueue.set(jobId, job);
                    
                    // Process job
                    this.processAnalysisJob(job);
                    
                    res.json({
                        message: 'Analysis started',
                        jobId: jobId,
                        status: 'queued'
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
        
        // Get job status
        router.get(
            this.config.api.endpoints.analysis.status,
            this.authenticateToken.bind(this),
            async (req, res, next) => {
                try {
                    const { jobId } = req.params;
                    
                    const job = this.jobQueue.get(jobId) || this.activeJobs.get(jobId);
                    
                    if (!job) {
                        return res.status(404).json({ error: 'Job not found' });
                    }
                    
                    if (job.userId !== req.user.id) {
                        return res.status(403).json({ error: 'Access denied' });
                    }
                    
                    res.json({
                        jobId: job.id,
                        status: job.status,
                        progress: job.progress,
                        createdAt: job.createdAt,
                        completedAt: job.completedAt,
                        error: job.error
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
        
        // Get job result
        router.get(
            this.config.api.endpoints.analysis.result,
            this.authenticateToken.bind(this),
            async (req, res, next) => {
                try {
                    const { jobId } = req.params;
                    
                    const job = this.activeJobs.get(jobId);
                    
                    if (!job) {
                        return res.status(404).json({ error: 'Job not found' });
                    }
                    
                    if (job.userId !== req.user.id) {
                        return res.status(403).json({ error: 'Access denied' });
                    }
                    
                    if (job.status !== 'completed') {
                        return res.status(400).json({ 
                            error: 'Job not completed',
                            status: job.status 
                        });
                    }
                    
                    res.json({
                        jobId: job.id,
                        status: 'completed',
                        results: job.results,
                        outputs: job.outputs
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
    }
    
    /**
     * 📄 SETUP GENERATION ROUTES
     */
    setupGenerationRoutes(router) {
        const generateLimiter = rateLimit(this.config.security.rateLimiting.endpoints['/api/generate']);
        
        // Generate Ausschreibung
        router.post(
            this.config.api.endpoints.generation.ausschreibung,
            this.authenticateToken.bind(this),
            generateLimiter,
            async (req, res, next) => {
                try {
                    const { jobId, projectInfo } = req.body;
                    
                    const analysisJob = this.activeJobs.get(jobId);
                    if (!analysisJob || analysisJob.status !== 'completed') {
                        return res.status(400).json({ error: 'Analysis not completed' });
                    }
                    
                    const generationJobId = uuidv4();
                    
                    // Start generation in background
                    this.generateAusschreibung(analysisJob, projectInfo, generationJobId);
                    
                    res.json({
                        message: 'Ausschreibung generation started',
                        jobId: generationJobId
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
        
        // Generate LP6
        router.post(
            this.config.api.endpoints.generation.lp6,
            this.authenticateToken.bind(this),
            generateLimiter,
            async (req, res, next) => {
                try {
                    const { planPaths, projectInfo } = req.body;
                    
                    if (!planPaths || !Array.isArray(planPaths)) {
                        return res.status(400).json({ error: 'Plan paths required' });
                    }
                    
                    const generationJobId = uuidv4();
                    
                    // Start generation in background
                    this.generateLP6(planPaths, projectInfo, generationJobId);
                    
                    res.json({
                        message: 'LP6 generation started',
                        jobId: generationJobId
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
        
        // Generate Verification Report
        router.post(
            this.config.api.endpoints.generation.verification,
            this.authenticateToken.bind(this),
            generateLimiter,
            async (req, res, next) => {
                try {
                    const { jobId, projectInfo } = req.body;
                    
                    const analysisJob = this.activeJobs.get(jobId);
                    if (!analysisJob || analysisJob.status !== 'completed') {
                        return res.status(400).json({ error: 'Analysis not completed' });
                    }
                    
                    const verificationJobId = uuidv4();
                    
                    // Start verification in background
                    this.generateVerificationReport(analysisJob, projectInfo, verificationJobId);
                    
                    res.json({
                        message: 'Verification report generation started',
                        jobId: verificationJobId
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
    }
    
    /**
     * 🏗️ SETUP PROJECT ROUTES
     */
    setupProjectRoutes(router) {
        // List projects
        router.get(
            this.config.api.endpoints.projects.list,
            this.authenticateToken.bind(this),
            async (req, res, next) => {
                try {
                    // In production, this would query a database
                    const projects = [];
                    
                    res.json({
                        projects: projects,
                        total: projects.length
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
        
        // Create project
        router.post(
            this.config.api.endpoints.projects.create,
            this.authenticateToken.bind(this),
            async (req, res, next) => {
                try {
                    const projectData = req.body;
                    
                    const project = {
                        id: uuidv4(),
                        ...projectData,
                        userId: req.user.id,
                        createdAt: new Date().toISOString()
                    };
                    
                    // In production, save to database
                    
                    res.json({
                        message: 'Project created',
                        project: project
                    });
                    
                } catch (error) {
                    next(error);
                }
            }
        );
    }
    
    /**
     * 🌐 SETUP WEBSOCKET
     */
    async setupWebSocket() {
        this.io = new SocketIOServer(this.server, {
            cors: this.config.security.cors,
            path: '/socket.io'
        });
        
        // Create namespace
        const namespace = this.io.of(this.config.websocket.namespace);
        
        // Authentication middleware
        namespace.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                
                if (!token) {
                    return next(new Error('Authentication required'));
                }
                
                const decoded = jwt.verify(token, this.config.security.jwtSecret);
                socket.userId = decoded.id;
                
                next();
                
            } catch (error) {
                next(new Error('Invalid token'));
            }
        });
        
        // Connection handler
        namespace.on('connection', (socket) => {
            this.logger.info(`WebSocket client connected: ${socket.id} (User: ${socket.userId})`);
            
            // Subscribe to job progress
            socket.on(this.config.websocket.events.subscribeProgress, (jobId) => {
                socket.join(`job:${jobId}`);
                this.logger.info(`Client ${socket.id} subscribed to job ${jobId}`);
            });
            
            // Handle disconnect
            socket.on('disconnect', () => {
                this.logger.info(`WebSocket client disconnected: ${socket.id}`);
            });
        });
        
        this.logger.info('WebSocket server configured');
    }
    
    /**
     * ❌ SETUP ERROR HANDLING
     */
    async setupErrorHandling() {
        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({
                error: 'Not found',
                path: req.url
            });
        });
        
        // Error handler
        this.app.use((err, req, res, next) => {
            this.logger.error({
                error: err.message,
                stack: err.stack,
                url: req.url,
                method: req.method,
                ip: req.ip
            });
            
            // Don't leak error details in production
            const isDev = this.config.server.environment === 'development';
            
            res.status(err.status || 500).json({
                error: err.message,
                ...(isDev && { stack: err.stack })
            });
        });
    }
    
    /**
     * 🔐 AUTHENTICATE TOKEN MIDDLEWARE
     */
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        jwt.verify(token, this.config.security.jwtSecret, (err, user) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid token' });
            }
            
            req.user = user;
            next();
        });
    }
    
    /**
     * 🔄 PROCESS ANALYSIS JOB
     */
    async processAnalysisJob(job) {
        try {
            // Check concurrent job limit
            if (this.activeJobs.size >= this.config.queue.maxConcurrentJobs) {
                this.logger.info(`Job ${job.id} queued - concurrent limit reached`);
                return;
            }
            
            // Move from queue to active
            this.jobQueue.delete(job.id);
            this.activeJobs.set(job.id, job);
            job.status = 'processing';
            job.startedAt = new Date().toISOString();
            
            // Emit progress update
            this.emitJobProgress(job.id, 0, 'Starting analysis...');
            
            // Analyze plan
            this.logger.info(`Starting analysis for job ${job.id}`);
            
            const analysisResults = await this.systems.pixelAnalyzer.analyzeConstructionPlan(
                job.file.path,
                {
                    onProgress: (progress) => {
                        job.progress = progress * 0.3; // 30% for pixel analysis
                        this.emitJobProgress(job.id, job.progress, 'Analyzing pixels...');
                    }
                }
            );
            
            // Classify elements
            this.emitJobProgress(job.id, 30, 'Classifying elements...');
            
            const classifications = await this.systems.classificationSystem.batchClassifyElements(
                analysisResults.elements.all,
                {
                    onProgress: (progress) => {
                        job.progress = 30 + (progress * 0.3); // 30% for classification
                        this.emitJobProgress(job.id, job.progress, 'Classifying elements...');
                    }
                }
            );
            
            // Calculate measurements
            this.emitJobProgress(job.id, 60, 'Calculating measurements...');
            
            const measurements = await this.systems.measurementEngine.batchCalculateMeasurements(
                classifications.classifications,
                analysisResults.scale,
                {
                    onProgress: (progress) => {
                        job.progress = 60 + (progress * 0.3); // 30% for measurements
                        this.emitJobProgress(job.id, job.progress, 'Calculating measurements...');
                    }
                }
            );
            
            // Generate output paths
            const outputDir = path.join(
                this.config.storage.outputDir,
                'analysis',
                job.id
            );
            await fs.mkdir(outputDir, { recursive: true });
            
            // Save results
            this.emitJobProgress(job.id, 90, 'Saving results...');
            
            const resultsPath = path.join(outputDir, 'analysis_results.json');
            await fs.writeFile(resultsPath, JSON.stringify({
                jobId: job.id,
                timestamp: new Date().toISOString(),
                file: {
                    name: job.file.originalname,
                    size: job.file.size,
                    mimetype: job.file.mimetype
                },
                scale: analysisResults.scale,
                summary: measurements.summary,
                elements: measurements.measurements
            }, null, 2));
            
            // Update job
            job.status = 'completed';
            job.completedAt = new Date().toISOString();
            job.progress = 100;
            job.results = {
                scale: analysisResults.scale,
                elementCount: measurements.measurements.length,
                summary: measurements.summary
            };
            job.outputs = {
                results: `/output/analysis/${job.id}/analysis_results.json`
            };
            
            this.emitJobProgress(job.id, 100, 'Analysis complete!');
            
            this.logger.info(`Analysis completed for job ${job.id}`);
            
            // Process next queued job
            this.processNextQueuedJob();
            
        } catch (error) {
            this.logger.error(`Analysis failed for job ${job.id}:`, error);
            
            job.status = 'failed';
            job.error = error.message;
            job.completedAt = new Date().toISOString();
            
            this.emitJobError(job.id, error.message);
            
            // Process next queued job
            this.processNextQueuedJob();
        }
    }
    
    /**
     * 📄 GENERATE AUSSCHREIBUNG
     */
    async generateAusschreibung(analysisJob, projectInfo, jobId) {
        try {
            const job = {
                id: jobId,
                type: 'ausschreibung',
                status: 'processing',
                progress: 0
            };
            
            this.activeJobs.set(jobId, job);
            
            this.emitJobProgress(jobId, 0, 'Starting Ausschreibung generation...');
            
            const result = await this.systems.ausschreibungGenerator.generateAusschreibung(
                analysisJob.file.path,
                projectInfo
            );
            
            job.status = 'completed';
            job.progress = 100;
            job.outputs = result.outputs;
            
            this.emitJobProgress(jobId, 100, 'Ausschreibung generation complete!');
            
        } catch (error) {
            this.logger.error(`Ausschreibung generation failed:`, error);
            this.emitJobError(jobId, error.message);
        }
    }
    
    /**
     * 📐 GENERATE LP6
     */
    async generateLP6(planPaths, projectInfo, jobId) {
        try {
            const job = {
                id: jobId,
                type: 'lp6',
                status: 'processing',
                progress: 0
            };
            
            this.activeJobs.set(jobId, job);
            
            this.emitJobProgress(jobId, 0, 'Starting LP6 generation...');
            
            const result = await this.systems.lp6Generator.generateLP6Deliverables(
                planPaths,
                projectInfo
            );
            
            job.status = 'completed';
            job.progress = 100;
            job.outputs = result.files;
            
            this.emitJobProgress(jobId, 100, 'LP6 generation complete!');
            
        } catch (error) {
            this.logger.error(`LP6 generation failed:`, error);
            this.emitJobError(jobId, error.message);
        }
    }
    
    /**
     * 🔍 GENERATE VERIFICATION REPORT
     */
    async generateVerificationReport(analysisJob, projectInfo, jobId) {
        try {
            const job = {
                id: jobId,
                type: 'verification',
                status: 'processing',
                progress: 0
            };
            
            this.activeJobs.set(jobId, job);
            
            this.emitJobProgress(jobId, 0, 'Starting verification report generation...');
            
            const result = await this.systems.verificationReports.generateVerificationReport(
                analysisJob.results,
                analysisJob.file.path,
                projectInfo
            );
            
            job.status = 'completed';
            job.progress = 100;
            job.outputs = result.outputs;
            
            this.emitJobProgress(jobId, 100, 'Verification report complete!');
            
        } catch (error) {
            this.logger.error(`Verification report generation failed:`, error);
            this.emitJobError(jobId, error.message);
        }
    }
    
    /**
     * 📊 EMIT JOB PROGRESS
     */
    emitJobProgress(jobId, progress, message) {
        if (this.io) {
            this.io.of(this.config.websocket.namespace)
                .to(`job:${jobId}`)
                .emit(this.config.websocket.events.analysisProgress, {
                    jobId,
                    progress,
                    message
                });
        }
    }
    
    /**
     * ❌ EMIT JOB ERROR
     */
    emitJobError(jobId, error) {
        if (this.io) {
            this.io.of(this.config.websocket.namespace)
                .to(`job:${jobId}`)
                .emit(this.config.websocket.events.analysisError, {
                    jobId,
                    error
                });
        }
    }
    
    /**
     * 🔄 PROCESS NEXT QUEUED JOB
     */
    processNextQueuedJob() {
        if (this.jobQueue.size > 0 && this.activeJobs.size < this.config.queue.maxConcurrentJobs) {
            const nextJob = this.jobQueue.values().next().value;
            if (nextJob) {
                this.processAnalysisJob(nextJob);
            }
        }
    }
    
    /**
     * 📊 COLLECT METRICS
     */
    async collectMetrics() {
        return {
            timestamp: new Date().toISOString(),
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            },
            jobs: {
                active: this.activeJobs.size,
                queued: this.jobQueue.size,
                total: this.activeJobs.size + this.jobQueue.size
            },
            users: {
                total: this.users.size
            }
        };
    }
    
    /**
     * 🛑 GRACEFUL SHUTDOWN
     */
    async gracefulShutdown() {
        this.logger.info('Shutting down gracefully...');
        
        // Stop accepting new connections
        if (this.server) {
            this.server.close(() => {
                this.logger.info('Server closed');
            });
        }
        
        // Close WebSocket connections
        if (this.io) {
            this.io.close(() => {
                this.logger.info('WebSocket server closed');
            });
        }
        
        // Wait for active jobs to complete (with timeout)
        const timeout = setTimeout(() => {
            this.logger.warn('Shutdown timeout - forcing exit');
            process.exit(0);
        }, 30000);
        
        while (this.activeJobs.size > 0) {
            this.logger.info(`Waiting for ${this.activeJobs.size} active jobs to complete...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        clearTimeout(timeout);
        
        this.logger.info('Graceful shutdown complete');
        process.exit(0);
    }
}

// Export for use
export { ProductionDeploymentSystem };
