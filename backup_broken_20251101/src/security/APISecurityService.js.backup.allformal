/**
 * 🔒 API SECURITY SERVICE - COMPREHENSIVE ENDPOINT PROTECTION
 * =========================================================
 * 
 * Provides security hardening for all API endpoints including:
 * - Authentication & Authorization
 * - Rate limiting
 * - Request validation
 * - SQL injection prevention
 * - XSS protection
 * - CORS configuration
 * - Audit logging
 */

import { EventEmitter } from 'events';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import validator from 'validator';

export class APISecurityService extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // JWT Configuration
            jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
            jwtExpiry: config.jwtExpiry || '24h',
            refreshTokenExpiry: config.refreshTokenExpiry || '7d',
            
            // Rate Limiting
            rateLimitPoints: config.rateLimitPoints || 100,
            rateLimitDuration: config.rateLimitDuration || 60, // seconds
            rateLimitBlockDuration: config.rateLimitBlockDuration || 600, // 10 minutes
            
            // Security Headers
            enableHelmet: config.enableHelmet !== false,
            enableCORS: config.enableCORS !== false,
            corsOrigins: config.corsOrigins || process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3002'],
            
            // Request Validation
            maxRequestSize: config.maxRequestSize || '10mb',
            parameterLimit: config.parameterLimit || 1000,
            
            // Audit Configuration
            auditLogPath: config.auditLogPath || './logs/security-audit.log',
            sensitiveFields: config.sensitiveFields || ['password', 'token', 'secret', 'key', 'authorization'],
            
            // API Key Management
            apiKeyLength: config.apiKeyLength || 64,
            apiKeyRotationDays: config.apiKeyRotationDays || 30,
            
            // Session Configuration
            sessionTimeout: config.sessionTimeout || 3600000, // 1 hour
            maxConcurrentSessions: config.maxConcurrentSessions || 5,
            
            ...config
        };
        
        // Security components
        this.rateLimiters = new Map();
        this.sessions = new Map();
        this.apiKeys = new Map();
        this.blacklistedTokens = new Set();
        
        // Audit log
        this.auditLog = [];
        
        // Metrics
        this.metrics = {
            totalRequests: 0,
            blockedRequests: 0,
            authFailures: 0,
            injectionAttempts: 0,
            rateLimitHits: 0
        };
    }
    
    /**
     * 🚀 INITIALIZE SECURITY SERVICE
     */
    async initialize() {
        console.log('🔒 Initializing API Security Service...');
        
        // Initialize rate limiters
        this.initializeRateLimiters();
        
        // Load API keys
        await this.loadAPIKeys();
        
        // Set up audit logging
        this.setupAuditLogging();
        
        // Schedule API key rotation
        this.scheduleAPIKeyRotation();
        
        console.log('✅ API Security Service initialized');
    }
    
    /**
     * 🚦 INITIALIZE RATE LIMITERS
     */
    initializeRateLimiters() {
        // Global rate limiter
        this.rateLimiters.set('global', new RateLimiterMemory({
            points: this.config.rateLimitPoints,
            duration: this.config.rateLimitDuration,
            blockDuration: this.config.rateLimitBlockDuration
        }));
        
        // Endpoint-specific rate limiters
        const endpointLimits = {
            '/api/auth/login': { points: 5, duration: 300 }, // 5 attempts per 5 minutes
            '/api/plans/upload': { points: 10, duration: 3600 }, // 10 uploads per hour
            '/api/analysis/execute': { points: 20, duration: 3600 }, // 20 analyses per hour
            '/api/llm/chat': { points: 50, duration: 300 } // 50 messages per 5 minutes
        };
        
        for (const [endpoint, limits] of Object.entries(endpointLimits)) {
            this.rateLimiters.set(endpoint, new RateLimiterMemory(limits));
        }
        
        console.log('   ✅ Rate limiters initialized');
    }
    
    /**
     * 🛡️ MIDDLEWARE: AUTHENTICATE REQUEST
     */
    authenticate() {
        return async (req, res, next) => {
            try {
                // Check for JWT token
                const token = this.extractToken(req);
                
                if (!token) {
                    // Check for API key
                    const apiKey = req.headers['x-api-key'];
                    if (apiKey) {
                        const keyData = await this.validateAPIKey(apiKey);
                        if (keyData) {
                            req.auth = { type: 'apiKey', data: keyData };
                            return next();
                        }
                    }
                    
                    return res.status(401).json({ error: 'Authentication required' });
                }
                
                // Verify JWT
                try {
                    const decoded = jwt.verify(token, this.config.jwtSecret);
                    
                    // Check if token is blacklisted
                    if (this.blacklistedTokens.has(token)) {
                        throw new Error('Token revoked');
                    }
                    
                    // Check session
                    const session = this.sessions.get(decoded.sessionId);
                    if (!session || session.expiresAt < Date.now()) {
                        throw new Error('Session expired');
                    }
                    
                    req.auth = { type: 'jwt', user: decoded, session };
                    next();
                    
                } catch (jwtError) {
                    this.metrics.authFailures++;
                    this.auditAuthFailure(req, jwtError.message);
                    return res.status(401).json({ error: 'Invalid token' });
                }
                
            } catch (error) {
                console.error('Authentication error:', error);
                res.status(500).json({ error: 'Authentication failed' });
            }
        };
    }
    
    /**
     * 🛡️ MIDDLEWARE: AUTHORIZE REQUEST
     */
    authorize(requiredRoles = []) {
        return (req, res, next) => {
            if (!req.auth) {
                return res.status(401).json({ error: 'Not authenticated' });
            }
            
            const userRoles = req.auth.user?.roles || req.auth.data?.roles || [];
            
            // Check if user has required roles
            const hasRequiredRole = requiredRoles.length === 0 || 
                requiredRoles.some(role => userRoles.includes(role));
            
            if (!hasRequiredRole) {
                this.auditAuthorizationFailure(req, requiredRoles);
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            next();
        };
    }
    
    /**
     * 🚦 MIDDLEWARE: RATE LIMITING
     */
    rateLimit(customLimiter = null) {
        return async (req, res, next) => {
            try {
                const key = this.getRateLimitKey(req);
                const endpoint = req.path;
                
                // Use endpoint-specific limiter if available
                const limiter = customLimiter || 
                               this.rateLimiters.get(endpoint) || 
                               this.rateLimiters.get('global');
                
                await limiter.consume(key);
                
                next();
                
            } catch (rateLimitError) {
                this.metrics.rateLimitHits++;
                this.auditRateLimitHit(req);
                
                res.status(429).json({
                    error: 'Too many requests',
                    retryAfter: Math.ceil(rateLimitError.msBeforeNext / 1000)
                });
            }
        };
    }
    
    /**
     * 🛡️ MIDDLEWARE: VALIDATE REQUEST
     */
    validateRequest() {
        return (req, res, next) => {
            try {
                // Check for SQL injection attempts
                if (this.detectSQLInjection(req)) {
                    this.metrics.injectionAttempts++;
                    this.auditInjectionAttempt(req, 'SQL');
                    return res.status(400).json({ error: 'Invalid request' });
                }
                
                // Check for XSS attempts
                if (this.detectXSS(req)) {
                    this.metrics.injectionAttempts++;
                    this.auditInjectionAttempt(req, 'XSS');
                    return res.status(400).json({ error: 'Invalid request' });
                }
                
                // Validate request parameters
                if (!this.validateParameters(req)) {
                    return res.status(400).json({ error: 'Invalid parameters' });
                }
                
                // Sanitize inputs
                this.sanitizeRequest(req);
                
                next();
                
            } catch (error) {
                console.error('Request validation error:', error);
                res.status(500).json({ error: 'Validation failed' });
            }
        };
    }
    
    /**
     * 🔍 DETECT SQL INJECTION
     */
    detectSQLInjection(req) {
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER)\b)/gi,
            /(--|\||;|\/\*|\*\/|xp_|sp_|'|")/g,
            /(\bOR\b\s*\d+\s*=\s*\d+)/gi,
            /(\bAND\b\s*\d+\s*=\s*\d+)/gi
        ];
        
        const checkValue = (value) => {
            if (typeof value !== 'string') return false;
            return sqlPatterns.some(pattern => pattern.test(value));
        };
        
        // Check all request data
        const allData = {
            ...req.query,
            ...req.body,
            ...req.params
        };
        
        for (const value of Object.values(allData)) {
            if (checkValue(value)) return true;
            if (typeof value === 'object') {
                for (const subValue of Object.values(value)) {
                    if (checkValue(subValue)) return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * 🔍 DETECT XSS
     */
    detectXSS(req) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<img[^>]+src[\\s]*=[\\s]*["\']javascript:/gi
        ];
        
        const checkValue = (value) => {
            if (typeof value !== 'string') return false;
            return xssPatterns.some(pattern => pattern.test(value));
        };
        
        // Check all request data
        const allData = {
            ...req.query,
            ...req.body,
            ...req.params
        };
        
        for (const value of Object.values(allData)) {
            if (checkValue(value)) return true;
            if (typeof value === 'object') {
                for (const subValue of Object.values(value)) {
                    if (checkValue(subValue)) return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * ✅ VALIDATE PARAMETERS
     */
    validateParameters(req) {
        // Check parameter count
        const paramCount = Object.keys(req.query).length + 
                          Object.keys(req.body).length + 
                          Object.keys(req.params).length;
        
        if (paramCount > this.config.parameterLimit) {
            return false;
        }
        
        // Validate specific endpoints
        const validators = {
            '/api/auth/login': this.validateLoginParams,
            '/api/plans/upload': this.validateUploadParams,
            '/api/analysis/execute': this.validateAnalysisParams
        };
        
        const validator = validators[req.path];
        if (validator) {
            return validator.call(this, req);
        }
        
        return true;
    }
    
    /**
     * 🧹 SANITIZE REQUEST
     */
    sanitizeRequest(req) {
        const sanitize = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                if (typeof value === 'string') {
                    // Remove null bytes
                    obj[key] = value.replace(/\0/g, '');
                    
                    // Escape HTML entities
                    obj[key] = validator.escape(obj[key]);
                    
                    // Trim whitespace
                    obj[key] = obj[key].trim();
                } else if (typeof value === 'object' && value !== null) {
                    sanitize(value);
                }
            }
        };
        
        if (req.body) sanitize(req.body);
        if (req.query) sanitize(req.query);
        if (req.params) sanitize(req.params);
    }
    
    /**
     * 🔑 GENERATE JWT TOKEN
     */
    generateToken(user, sessionId) {
        const payload = {
            userId: user.id,
            email: user.email,
            roles: user.roles || [],
            sessionId,
            iat: Date.now()
        };
        
        const token = jwt.sign(payload, this.config.jwtSecret, {
            expiresIn: this.config.jwtExpiry
        });
        
        const refreshToken = jwt.sign(
            { ...payload, type: 'refresh' },
            this.config.jwtSecret,
            { expiresIn: this.config.refreshTokenExpiry }
        );
        
        return { token, refreshToken };
    }
    
    /**
     * 🔑 CREATE SESSION
     */
    createSession(user) {
        // Check concurrent sessions
        const userSessions = Array.from(this.sessions.values())
            .filter(s => s.userId === user.id);
        
        if (userSessions.length >= this.config.maxConcurrentSessions) {
            // Remove oldest session
            const oldest = userSessions.sort((a, b) => a.createdAt - b.createdAt)[0];
            this.sessions.delete(oldest.id);
        }
        
        const sessionId = crypto.randomBytes(32).toString('hex');
        const session = {
            id: sessionId,
            userId: user.id,
            createdAt: Date.now(),
            expiresAt: Date.now() + this.config.sessionTimeout,
            lastActivity: Date.now()
        };
        
        this.sessions.set(sessionId, session);
        
        return sessionId;
    }
    
    /**
     * 🔑 GENERATE API KEY
     */
    generateAPIKey(metadata = {}) {
        const key = crypto.randomBytes(this.config.apiKeyLength).toString('hex');
        const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
        
        const keyData = {
            id: crypto.randomBytes(16).toString('hex'),
            hashedKey,
            metadata,
            createdAt: Date.now(),
            expiresAt: Date.now() + (this.config.apiKeyRotationDays * 24 * 60 * 60 * 1000),
            lastUsed: null,
            usageCount: 0
        };
        
        this.apiKeys.set(hashedKey, keyData);
        
        // Audit API key creation
        this.auditAPIKeyCreation(keyData);
        
        return key; // Return unhashed key only once
    }
    
    /**
     * ✅ VALIDATE API KEY
     */
    async validateAPIKey(key) {
        const hashedKey = crypto.createHash('sha256').update(key).digest('hex');
        const keyData = this.apiKeys.get(hashedKey);
        
        if (!keyData) {
            return null;
        }
        
        // Check expiration
        if (keyData.expiresAt < Date.now()) {
            this.apiKeys.delete(hashedKey);
            return null;
        }
        
        // Update usage
        keyData.lastUsed = Date.now();
        keyData.usageCount++;
        
        return keyData;
    }
    
    /**
     * 🔄 SCHEDULE API KEY ROTATION
     */
    scheduleAPIKeyRotation() {
        setInterval(() => {
            const now = Date.now();
            const rotationThreshold = now - (this.config.apiKeyRotationDays * 24 * 60 * 60 * 1000);
            
            for (const [hash, keyData] of this.apiKeys) {
                if (keyData.createdAt < rotationThreshold) {
                    this.auditAPIKeyRotation(keyData);
                    this.apiKeys.delete(hash);
                    this.emit('api-key-rotated', keyData);
                }
            }
        }, 24 * 60 * 60 * 1000); // Daily check
    }
    
    /**
     * 🛡️ SECURITY HEADERS
     */
    securityHeaders() {
        return (req, res, next) => {
            // HSTS
            res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            
            // XSS Protection
            res.setHeader('X-XSS-Protection', '1; mode=block');
            
            // Content Type Options
            res.setHeader('X-Content-Type-Options', 'nosniff');
            
            // Frame Options
            res.setHeader('X-Frame-Options', 'DENY');
            
            // CSP
            res.setHeader('Content-Security-Policy', 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self' ws: wss:;"
            );
            
            // Referrer Policy
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            
            // Permissions Policy
            res.setHeader('Permissions-Policy', 
                'geolocation=(), microphone=(), camera=(), payment=()'
            );
            
            next();
        };
    }
    
    /**
     * 🌐 CORS CONFIGURATION
     */
    corsConfig() {
        return {
            origin: (origin, callback) => {
                if (!origin || this.config.corsOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
            exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
            maxAge: 86400 // 24 hours
        };
    }
    
    /**
     * 📝 AUDIT LOGGING
     */
    setupAuditLogging() {
        // In production, write to file or database
        this.auditLogger = {
            log: (entry) => {
                this.auditLog.push(entry);
                
                // Keep last 10000 entries in memory
                if (this.auditLog.length > 10000) {
                    this.auditLog.shift();
                }
                
                // Emit for external logging
                this.emit('audit-log', entry);
            }
        };
    }
    
    auditRequest(req, action, result) {
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            result,
            user: req.auth?.user?.userId || req.auth?.data?.id || 'anonymous',
            ip: req.ip,
            method: req.method,
            path: req.path,
            userAgent: req.headers['user-agent']
        };
        
        // Remove sensitive data
        const sanitizedBody = this.removeSensitiveData(req.body);
        if (Object.keys(sanitizedBody).length > 0) {
            entry.body = sanitizedBody;
        }
        
        this.auditLogger.log(entry);
    }
    
    removeSensitiveData(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const cleaned = { ...obj };
        
        for (const field of this.config.sensitiveFields) {
            delete cleaned[field];
        }
        
        return cleaned;
    }
    
    auditAuthFailure(req, reason) {
        this.auditRequest(req, 'auth_failure', { reason });
    }
    
    auditAuthorizationFailure(req, requiredRoles) {
        this.auditRequest(req, 'authorization_failure', { requiredRoles });
    }
    
    auditRateLimitHit(req) {
        this.auditRequest(req, 'rate_limit_hit', {});
    }
    
    auditInjectionAttempt(req, type) {
        this.auditRequest(req, 'injection_attempt', { type });
    }
    
    auditAPIKeyCreation(keyData) {
        this.auditLogger.log({
            timestamp: new Date().toISOString(),
            action: 'api_key_created',
            keyId: keyData.id,
            metadata: keyData.metadata
        });
    }
    
    auditAPIKeyRotation(keyData) {
        this.auditLogger.log({
            timestamp: new Date().toISOString(),
            action: 'api_key_rotated',
            keyId: keyData.id,
            usageCount: keyData.usageCount,
            lastUsed: keyData.lastUsed
        });
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    extractToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        return req.cookies?.token || req.query.token;
    }
    
    getRateLimitKey(req) {
        if (req.auth?.user?.userId) {
            return `user_${req.auth.user.userId}`;
        }
        
        if (req.auth?.data?.id) {
            return `api_${req.auth.data.id}`;
        }
        
        return `ip_${req.ip}`;
    }
    
    validateLoginParams(req) {
        const { email, password } = req.body;
        
        if (!email || !validator.isEmail(email)) {
            return false;
        }
        
        if (!password || password.length < 8) {
            return false;
        }
        
        return true;
    }
    
    validateUploadParams(req) {
        // File upload validation handled by multer
        return true;
    }
    
    validateAnalysisParams(req) {
        const { planId, analysisType } = req.body;
        
        if (!planId || !validator.isUUID(planId)) {
            return false;
        }
        
        const validTypes = ['LP6', 'LP7', 'full', 'quick'];
        if (!analysisType || !validTypes.includes(analysisType)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 💾 SAVE/LOAD API KEYS
     */
    
    async saveAPIKeys() {
        // In production, save to database
        const keys = Array.from(this.apiKeys.entries()).map(([hash, data]) => ({
            hash,
            ...data
        }));
        
        // Would save to database
        console.log(`💾 Saved ${keys.length} API keys`);
    }
    
    async loadAPIKeys() {
        // In production, load from database
        console.log('   📂 Loading API keys...');
        // Implementation would restore keys
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeSessions: this.sessions.size,
            activeAPIKeys: this.apiKeys.size,
            blacklistedTokens: this.blacklistedTokens.size,
            recentAuditLogs: this.auditLog.length
        };
    }
    
    /**
     * 🔒 REVOKE TOKEN
     */
    revokeToken(token) {
        this.blacklistedTokens.add(token);
        this.auditLogger.log({
            timestamp: new Date().toISOString(),
            action: 'token_revoked',
            token: token.substring(0, 10) + '...'
        });
    }
    
    /**
     * 🧹 CLEANUP EXPIRED SESSIONS
     */
    cleanupSessions() {
        const now = Date.now();
        
        for (const [id, session] of this.sessions) {
            if (session.expiresAt < now) {
                this.sessions.delete(id);
            }
        }
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('🛑 Shutting down API Security Service...');
        
        // Save API keys
        await this.saveAPIKeys();
        
        // Clear intervals
        // (Would clear any scheduled tasks)
        
        this.removeAllListeners();
        console.log('✅ API Security Service shutdown complete');
    }
}

// Singleton instance
let instance = null;

export function getAPISecurityService(config = {}) {
    if (!instance) {
        instance = new APISecurityService(config);
    }
    return instance;
}

export default APISecurityService;
