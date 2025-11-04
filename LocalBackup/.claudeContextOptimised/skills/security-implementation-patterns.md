# Security Implementation Patterns

## Overview

This skill provides production-ready security patterns for the AIGO-Syndicate construction intelligence. It includes authentication implementation, authorization with RBAC, input validation patterns, SQL injection prevention, XSS protection, rate limiting, and security scanning integration.

## Core Implementation

### Security Framework

```javascript
// security-framework.js
import { EventEmitter } from 'events';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';
import { RateLimiterPostgres } from 'rate-limiter-flexible';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import zxcvbn from 'zxcvbn';

export class SecurityFramework extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Authentication settings
            auth: {
                jwtSecret: config.auth?.jwtSecret || process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
                jwtExpiry: config.auth?.jwtExpiry || '24h',
                refreshExpiry: config.auth?.refreshExpiry || '7d',
                bcryptRounds: config.auth?.bcryptRounds || 12,
                sessionTimeout: config.auth?.sessionTimeout || 3600000, // 1 hour
                mfaRequired: config.auth?.mfaRequired || false
            },
            
            // Authorization settings
            rbac: {
                enabled: config.rbac?.enabled !== false,
                defaultRole: config.rbac?.defaultRole || 'user',
                superAdminRole: config.rbac?.superAdminRole || 'super_admin',
                cache: config.rbac?.cache !== false,
                cacheTTL: config.rbac?.cacheTTL || 300000 // 5 minutes
            },
            
            // Input validation settings
            validation: {
                maxStringLength: config.validation?.maxStringLength || 10000,
                maxArrayLength: config.validation?.maxArrayLength || 1000,
                maxNumberValue: config.validation?.maxNumberValue || Number.MAX_SAFE_INTEGER,
                allowedFileTypes: config.validation?.allowedFileTypes || ['pdf', 'png', 'jpg', 'doc', 'docx'],
                maxFileSize: config.validation?.maxFileSize || 10485760 // 10MB
            },
            
            // Rate limiting settings
            rateLimit: {
                enabled: config.rateLimit?.enabled !== false,
                points: config.rateLimit?.points || 100,
                duration: config.rateLimit?.duration || 900, // 15 minutes
                blockDuration: config.rateLimit?.blockDuration || 900,
                loginAttempts: config.rateLimit?.loginAttempts || 5,
                loginWindow: config.rateLimit?.loginWindow || 900
            },
            
            // Security headers
            headers: {
                hsts: config.headers?.hsts !== false,
                hstsMaxAge: config.headers?.hstsMaxAge || 31536000,
                csp: config.headers?.csp || "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
                frameOptions: config.headers?.frameOptions || 'DENY',
                contentTypeOptions: config.headers?.contentTypeOptions !== false,
                xssProtection: config.headers?.xssProtection !== false
            },
            
            // Encryption settings
            encryption: {
                algorithm: config.encryption?.algorithm || 'aes-256-gcm',
                keyDerivation: config.encryption?.keyDerivation || 'pbkdf2',
                iterations: config.encryption?.iterations || 100000,
                saltLength: config.encryption?.saltLength || 32,
                tagLength: config.encryption?.tagLength || 16
            },
            
            // Audit settings
            audit: {
                enabled: config.audit?.enabled !== false,
                sensitiveActions: config.audit?.sensitiveActions || [
                    'login', 'logout', 'password_change', 'permission_change',
                    'data_export', 'data_delete', 'admin_action'
                ],
                retention: config.audit?.retention || 2592000000 // 30 days
            },
            
            ...config
        };
        
        this.dbPool = null;
        this.rateLimiters = new Map();
        this.sessionStore = new Map();
        this.permissionCache = new Map();
        
        // Security metrics
        this.metrics = {
            authAttempts: 0,
            authFailures: 0,
            validationErrors: 0,
            rateLimitHits: 0,
            securityIncidents: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Initialize rate limiters
            await this.initializeRateLimiters();
            
            // Load security configurations
            await this.loadSecurityConfigs();
            
            // Start security monitoring
            this.startSecurityMonitoring();
            
            this.emit('initialized');
            console.log('Security Framework initialized');
            
        } catch (error) {
            console.error('Failed to initialize Security Framework:', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'security'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Users table with security fields
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    username VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    salt VARCHAR(255) NOT NULL,
                    mfa_secret VARCHAR(255),
                    mfa_enabled BOOLEAN DEFAULT false,
                    email_verified BOOLEAN DEFAULT false,
                    is_active BOOLEAN DEFAULT true,
                    is_locked BOOLEAN DEFAULT false,
                    failed_login_attempts INTEGER DEFAULT 0,
                    last_login_at TIMESTAMPTZ,
                    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_users_email 
                ON users(email) WHERE is_active = true;
                
                CREATE INDEX IF NOT EXISTS idx_users_username 
                ON users(username) WHERE is_active = true;
            `);
            
            // Roles table
            await client.query(`
                CREATE TABLE IF NOT EXISTS roles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
                    is_system BOOLEAN DEFAULT false,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_roles_name 
                ON roles(name);
                
                -- Insert default roles
                INSERT INTO roles (name, description, permissions, is_system)
                VALUES 
                    ('super_admin', 'Super Administrator', '["*"]'::jsonb, true),
                    ('admin', 'Administrator', '["read:*", "write:*", "delete:*"]'::jsonb, true),
                    ('manager', 'Project Manager', '["read:*", "write:projects", "write:tasks"]'::jsonb, true),
                    ('user', 'Regular User', '["read:own", "write:own"]'::jsonb, true),
                    ('guest', 'Guest User', '["read:public"]'::jsonb, true)
                ON CONFLICT (name) DO NOTHING;
            `);
            
            // User roles mapping
            await client.query(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
                    granted_by UUID REFERENCES users(id),
                    granted_at TIMESTAMPTZ DEFAULT NOW(),
                    expires_at TIMESTAMPTZ,
                    CONSTRAINT unique_user_role UNIQUE(user_id, role_id)
                );
                
                CREATE INDEX IF NOT EXISTS idx_user_roles_user 
                ON user_roles(user_id);
                
                CREATE INDEX IF NOT EXISTS idx_user_roles_role 
                ON user_roles(role_id);
            `);
            
            // Sessions table
            await client.query(`
                CREATE TABLE IF NOT EXISTS sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    token_hash VARCHAR(255) UNIQUE NOT NULL,
                    refresh_token_hash VARCHAR(255) UNIQUE,
                    ip_address INET,
                    user_agent TEXT,
                    expires_at TIMESTAMPTZ NOT NULL,
                    refresh_expires_at TIMESTAMPTZ,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    last_activity TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_sessions_token 
                ON sessions(token_hash) WHERE is_active = true;
                
                CREATE INDEX IF NOT EXISTS idx_sessions_user 
                ON sessions(user_id, is_active);
            `);
            
            // Audit log table
            await client.query(`
                CREATE TABLE IF NOT EXISTS audit_logs (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id),
                    action VARCHAR(100) NOT NULL,
                    resource_type VARCHAR(100),
                    resource_id VARCHAR(255),
                    ip_address INET,
                    user_agent TEXT,
                    request_method VARCHAR(10),
                    request_path TEXT,
                    request_body JSONB,
                    response_status INTEGER,
                    duration_ms INTEGER,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_audit_user_time 
                ON audit_logs(user_id, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_audit_action_time 
                ON audit_logs(action, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_audit_resource 
                ON audit_logs(resource_type, resource_id);
            `);
            
            // API keys table
            await client.query(`
                CREATE TABLE IF NOT EXISTS api_keys (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    name VARCHAR(255) NOT NULL,
                    key_hash VARCHAR(255) UNIQUE NOT NULL,
                    prefix VARCHAR(10) NOT NULL,
                    scopes JSONB DEFAULT '[]'::jsonb,
                    rate_limit INTEGER,
                    expires_at TIMESTAMPTZ,
                    last_used_at TIMESTAMPTZ,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_api_keys_hash 
                ON api_keys(key_hash) WHERE is_active = true;
                
                CREATE INDEX IF NOT EXISTS idx_api_keys_user 
                ON api_keys(user_id);
            `);
            
            // Security events table
            await client.query(`
                CREATE TABLE IF NOT EXISTS security_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    event_type VARCHAR(100) NOT NULL,
                    severity VARCHAR(20) NOT NULL,
                    user_id UUID REFERENCES users(id),
                    ip_address INET,
                    user_agent TEXT,
                    description TEXT,
                    details JSONB DEFAULT '{}'::jsonb,
                    resolved BOOLEAN DEFAULT false,
                    resolved_by UUID REFERENCES users(id),
                    resolved_at TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_security_events_type 
                ON security_events(event_type, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_security_events_user 
                ON security_events(user_id, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_security_events_unresolved 
                ON security_events(resolved, created_at DESC)
                WHERE resolved = false;
            `);
            
            // Encryption keys table
            await client.query(`
                CREATE TABLE IF NOT EXISTS encryption_keys (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    key_id VARCHAR(255) UNIQUE NOT NULL,
                    encrypted_key TEXT NOT NULL,
                    algorithm VARCHAR(50) NOT NULL,
                    purpose VARCHAR(100) NOT NULL,
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    rotated_at TIMESTAMPTZ,
                    expires_at TIMESTAMPTZ,
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_encryption_keys_active 
                ON encryption_keys(key_id) WHERE is_active = true;
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Authentication Implementation
    
    async createUser(userData) {
        this.validateUserData(userData);
        
        const salt = await bcrypt.genSalt(this.config.auth.bcryptRounds);
        const passwordHash = await bcrypt.hash(userData.password, salt);
        
        // Check password strength
        const passwordStrength = zxcvbn(userData.password);
        if (passwordStrength.score < 3) {
            throw new Error('Password is too weak. Please use a stronger password.');
        }
        
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Create user
            const userResult = await client.query(`
                INSERT INTO users 
                (username, email, password_hash, salt, metadata)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, username, email, created_at
            `, [
                userData.username.toLowerCase(),
                userData.email.toLowerCase(),
                passwordHash,
                salt,
                JSON.stringify(userData.metadata || {})
            ]);
            
            const user = userResult.rows[0];
            
            // Assign default role
            const roleResult = await client.query(`
                SELECT id FROM roles WHERE name = $1
            `, [this.config.rbac.defaultRole]);
            
            if (roleResult.rows[0]) {
                await client.query(`
                    INSERT INTO user_roles (user_id, role_id)
                    VALUES ($1, $2)
                `, [user.id, roleResult.rows[0].id]);
            }
            
            await client.query('COMMIT');
            
            // Audit log
            await this.auditLog({
                userId: user.id,
                action: 'user_created',
                resourceType: 'user',
                resourceId: user.id
            });
            
            this.emit('user_created', user);
            
            return user;
            
        } catch (error) {
            await client.query('ROLLBACK');
            
            if (error.code === '23505') {
                if (error.constraint === 'users_username_key') {
                    throw new Error('Username already exists');
                } else if (error.constraint === 'users_email_key') {
                    throw new Error('Email already exists');
                }
            }
            
            throw error;
        } finally {
            client.release();
        }
    }
    
    async authenticate(credentials) {
        this.metrics.authAttempts++;
        
        const { username, password, mfaCode } = credentials;
        
        // Rate limit check
        await this.checkLoginRateLimit(username);
        
        const client = await this.dbPool.connect();
        try {
            // Get user
            const userResult = await client.query(`
                SELECT id, username, email, password_hash, salt, 
                       mfa_secret, mfa_enabled, is_active, is_locked,
                       failed_login_attempts
                FROM users
                WHERE (username = $1 OR email = $1)
                  AND is_active = true
            `, [username.toLowerCase()]);
            
            if (userResult.rows.length === 0) {
                this.metrics.authFailures++;
                await this.recordFailedLogin(username);
                throw new Error('Invalid credentials');
            }
            
            const user = userResult.rows[0];
            
            // Check if account is locked
            if (user.is_locked) {
                await this.recordSecurityEvent('account_locked_login_attempt', 'warning', {
                    userId: user.id,
                    username: user.username
                });
                throw new Error('Account is locked. Please contact support.');
            }
            
            // Verify password
            const isValidPassword = await bcrypt.compare(
                password,
                user.password_hash
            );
            
            if (!isValidPassword) {
                this.metrics.authFailures++;
                await this.recordFailedLogin(user.id);
                
                // Increment failed attempts
                await client.query(`
                    UPDATE users 
                    SET failed_login_attempts = failed_login_attempts + 1
                    WHERE id = $1
                `, [user.id]);
                
                // Lock account after too many attempts
                if (user.failed_login_attempts + 1 >= this.config.rateLimit.loginAttempts) {
                    await client.query(`
                        UPDATE users 
                        SET is_locked = true
                        WHERE id = $1
                    `, [user.id]);
                    
                    await this.recordSecurityEvent('account_locked', 'high', {
                        userId: user.id,
                        reason: 'Too many failed login attempts'
                    });
                }
                
                throw new Error('Invalid credentials');
            }
            
            // Verify MFA if enabled
            if (user.mfa_enabled) {
                if (!mfaCode) {
                    return { requiresMFA: true, userId: user.id };
                }
                
                const isValidMFA = speakeasy.totp.verify({
                    secret: user.mfa_secret,
                    encoding: 'base32',
                    token: mfaCode,
                    window: 2
                });
                
                if (!isValidMFA) {
                    await this.recordFailedLogin(user.id);
                    throw new Error('Invalid MFA code');
                }
            }
            
            // Reset failed attempts
            await client.query(`
                UPDATE users 
                SET failed_login_attempts = 0,
                    last_login_at = NOW()
                WHERE id = $1
            `, [user.id]);
            
            // Create session
            const session = await this.createSession(user);
            
            // Audit log
            await this.auditLog({
                userId: user.id,
                action: 'login',
                metadata: { mfaUsed: user.mfa_enabled }
            });
            
            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token: session.token,
                refreshToken: session.refreshToken
            };
            
        } finally {
            client.release();
        }
    }
    
    async createSession(user) {
        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email
            },
            this.config.auth.jwtSecret,
            {
                expiresIn: this.config.auth.jwtExpiry,
                issuer: 'construction-syndicate',
                audience: 'construction-api'
            }
        );
        
        const refreshToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        
        const expiresAt = new Date(Date.now() + this.parseExpiry(this.config.auth.jwtExpiry));
        const refreshExpiresAt = new Date(Date.now() + this.parseExpiry(this.config.auth.refreshExpiry));
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO sessions 
                (user_id, token_hash, refresh_token_hash, 
                 expires_at, refresh_expires_at, ip_address, user_agent)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                user.id,
                tokenHash,
                refreshTokenHash,
                expiresAt,
                refreshExpiresAt,
                this.getClientIP(),
                this.getUserAgent()
            ]);
            
            // Store in memory for fast lookup
            this.sessionStore.set(tokenHash, {
                userId: user.id,
                expiresAt,
                permissions: await this.getUserPermissions(user.id)
            });
            
            return { token, refreshToken };
            
        } finally {
            client.release();
        }
    }
    
    async verifyToken(token) {
        try {
            // Verify JWT
            const decoded = jwt.verify(token, this.config.auth.jwtSecret, {
                issuer: 'construction-syndicate',
                audience: 'construction-api'
            });
            
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            
            // Check session store first
            const cachedSession = this.sessionStore.get(tokenHash);
            if (cachedSession) {
                if (new Date() > cachedSession.expiresAt) {
                    this.sessionStore.delete(tokenHash);
                    throw new Error('Token expired');
                }
                return cachedSession;
            }
            
            // Check database
            const client = await this.dbPool.connect();
            try {
                const result = await client.query(`
                    SELECT s.*, u.username, u.email, u.is_active, u.is_locked
                    FROM sessions s
                    JOIN users u ON s.user_id = u.id
                    WHERE s.token_hash = $1
                      AND s.is_active = true
                      AND s.expires_at > NOW()
                `, [tokenHash]);
                
                if (result.rows.length === 0) {
                    throw new Error('Invalid session');
                }
                
                const session = result.rows[0];
                
                if (!session.is_active || session.is_locked) {
                    throw new Error('Account is not active');
                }
                
                // Update last activity
                await client.query(`
                    UPDATE sessions 
                    SET last_activity = NOW()
                    WHERE id = $1
                `, [session.id]);
                
                // Cache session
                const sessionData = {
                    userId: session.user_id,
                    username: session.username,
                    email: session.email,
                    expiresAt: session.expires_at,
                    permissions: await this.getUserPermissions(session.user_id)
                };
                
                this.sessionStore.set(tokenHash, sessionData);
                
                return sessionData;
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new Error('Invalid token');
            }
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expired');
            }
            throw error;
        }
    }
    
    async logout(token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        
        // Remove from cache
        this.sessionStore.delete(tokenHash);
        
        // Invalidate in database
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                UPDATE sessions 
                SET is_active = false
                WHERE token_hash = $1
                RETURNING user_id
            `, [tokenHash]);
            
            if (result.rows[0]) {
                await this.auditLog({
                    userId: result.rows[0].user_id,
                    action: 'logout'
                });
            }
            
        } finally {
            client.release();
        }
    }
    
    // MFA Implementation
    
    async setupMFA(userId) {
        const secret = speakeasy.generateSecret({
            name: `Construction Syndicate (${userId})`,
            issuer: 'Construction Syndicate'
        });
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE users 
                SET mfa_secret = $1
                WHERE id = $2
            `, [secret.base32, userId]);
            
            // Generate QR code
            const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
            
            return {
                secret: secret.base32,
                qrCode: qrCodeUrl,
                manualEntry: secret.base32
            };
            
        } finally {
            client.release();
        }
    }
    
    async enableMFA(userId, verificationCode) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT mfa_secret FROM users WHERE id = $1
            `, [userId]);
            
            if (!result.rows[0] || !result.rows[0].mfa_secret) {
                throw new Error('MFA not set up');
            }
            
            // Verify the code
            const isValid = speakeasy.totp.verify({
                secret: result.rows[0].mfa_secret,
                encoding: 'base32',
                token: verificationCode,
                window: 2
            });
            
            if (!isValid) {
                throw new Error('Invalid verification code');
            }
            
            // Enable MFA
            await client.query(`
                UPDATE users 
                SET mfa_enabled = true
                WHERE id = $1
            `, [userId]);
            
            await this.auditLog({
                userId,
                action: 'mfa_enabled'
            });
            
            return { success: true };
            
        } finally {
            client.release();
        }
    }
    
    // Authorization Implementation
    
    async getUserPermissions(userId) {
        // Check cache
        const cacheKey = `permissions:${userId}`;
        const cached = this.permissionCache.get(cacheKey);
        
        if (cached && cached.expiry > Date.now()) {
            return cached.permissions;
        }
        
        const client = await this.dbPool.connect();
        try {
            // Get user roles
            const result = await client.query(`
                SELECT r.permissions
                FROM user_roles ur
                JOIN roles r ON ur.role_id = r.id
                WHERE ur.user_id = $1
                  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            `, [userId]);
            
            // Merge permissions from all roles
            const permissions = new Set();
            
            for (const row of result.rows) {
                const rolePerms = row.permissions || [];
                rolePerms.forEach(perm => permissions.add(perm));
            }
            
            const permArray = Array.from(permissions);
            
            // Cache permissions
            this.permissionCache.set(cacheKey, {
                permissions: permArray,
                expiry: Date.now() + this.config.rbac.cacheTTL
            });
            
            return permArray;
            
        } finally {
            client.release();
        }
    }
    
    async checkPermission(userId, requiredPermission) {
        const permissions = await this.getUserPermissions(userId);
        
        // Check for super admin
        if (permissions.includes('*')) {
            return true;
        }
        
        // Check exact match
        if (permissions.includes(requiredPermission)) {
            return true;
        }
        
        // Check wildcard permissions
        const permParts = requiredPermission.split(':');
        for (let i = permParts.length; i > 0; i--) {
            const wildcardPerm = permParts.slice(0, i - 1).concat('*').join(':');
            if (permissions.includes(wildcardPerm)) {
                return true;
            }
        }
        
        return false;
    }
    
    async assignRole(userId, roleName, grantedBy) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Get role
            const roleResult = await client.query(`
                SELECT id FROM roles WHERE name = $1
            `, [roleName]);
            
            if (roleResult.rows.length === 0) {
                throw new Error('Role not found');
            }
            
            const roleId = roleResult.rows[0].id;
            
            // Assign role
            await client.query(`
                INSERT INTO user_roles (user_id, role_id, granted_by)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, role_id) DO NOTHING
            `, [userId, roleId, grantedBy]);
            
            await client.query('COMMIT');
            
            // Clear permission cache
            this.permissionCache.delete(`permissions:${userId}`);
            
            await this.auditLog({
                userId: grantedBy,
                action: 'role_assigned',
                resourceType: 'user_role',
                resourceId: userId,
                metadata: { role: roleName }
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Input Validation
    
    validateInput(input, schema) {
        const errors = [];
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = input[field];
            
            // Required check
            if (rules.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Skip validation if not required and not provided
            if (!rules.required && (value === undefined || value === null)) {
                continue;
            }
            
            // Type validation
            if (rules.type) {
                if (!this.validateType(value, rules.type)) {
                    errors.push(`${field} must be of type ${rules.type}`);
                }
            }
            
            // String validation
            if (rules.type === 'string' && typeof value === 'string') {
                if (rules.minLength && value.length < rules.minLength) {
                    errors.push(`${field} must be at least ${rules.minLength} characters`);
                }
                
                if (rules.maxLength && value.length > rules.maxLength) {
                    errors.push(`${field} must not exceed ${rules.maxLength} characters`);
                }
                
                if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
                    errors.push(`${field} format is invalid`);
                }
                
                if (rules.enum && !rules.enum.includes(value)) {
                    errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
                }
            }
            
            // Number validation
            if (rules.type === 'number' && typeof value === 'number') {
                if (rules.min !== undefined && value < rules.min) {
                    errors.push(`${field} must be at least ${rules.min}`);
                }
                
                if (rules.max !== undefined && value > rules.max) {
                    errors.push(`${field} must not exceed ${rules.max}`);
                }
            }
            
            // Email validation
            if (rules.type === 'email' && !validator.isEmail(value)) {
                errors.push(`${field} must be a valid email address`);
            }
            
            // URL validation
            if (rules.type === 'url' && !validator.isURL(value)) {
                errors.push(`${field} must be a valid URL`);
            }
            
            // Custom validation
            if (rules.custom) {
                const customError = rules.custom(value, input);
                if (customError) {
                    errors.push(customError);
                }
            }
        }
        
        if (errors.length > 0) {
            this.metrics.validationErrors++;
            throw new ValidationError(errors);
        }
        
        return true;
    }
    
    validateType(value, type) {
        switch (type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return value !== null && typeof value === 'object' && !Array.isArray(value);
            case 'date':
                return value instanceof Date || !isNaN(Date.parse(value));
            default:
                return true;
        }
    }
    
    sanitizeInput(input) {
        if (typeof input === 'string') {
            // Remove null bytes
            input = input.replace(/\0/g, '');
            
            // Trim whitespace
            input = input.trim();
            
            // Sanitize HTML
            input = DOMPurify.sanitize(input, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: []
            });
            
            // Escape SQL special characters
            input = this.escapeSQLIdentifier(input);
        } else if (Array.isArray(input)) {
            input = input.map(item => this.sanitizeInput(item));
        } else if (input !== null && typeof input === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                sanitized[this.sanitizeInput(key)] = this.sanitizeInput(value);
            }
            input = sanitized;
        }
        
        return input;
    }
    
    escapeSQLIdentifier(identifier) {
        // Escape SQL identifiers
        return identifier.replace(/"/g, '""');
    }
    
    // SQL Injection Prevention
    
    createParameterizedQuery(query, params) {
        // Ensure all queries use parameterized statements
        // This is a helper to enforce best practices
        
        if (query.includes('${') || query.includes('`')) {
            throw new Error('Template literals not allowed in SQL queries');
        }
        
        // Check for common SQL injection patterns
        const dangerousPatterns = [
            /(\bUNION\b.*\bSELECT\b)/i,
            /(\bDROP\b.*\bTABLE\b)/i,
            /(\bINSERT\b.*\bINTO\b.*\bVALUES\b)/i,
            /(\bUPDATE\b.*\bSET\b)/i,
            /(\bDELETE\b.*\bFROM\b)/i,
            /(;|--|\/\*|\*\/)/
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(query)) {
                this.recordSecurityEvent('sql_injection_attempt', 'high', {
                    query,
                    pattern: pattern.toString()
                });
                throw new Error('Potentially dangerous SQL pattern detected');
            }
        }
        
        return { text: query, values: params };
    }
    
    // XSS Protection
    
    sanitizeHTML(html, options = {}) {
        const defaultOptions = {
            ALLOWED_TAGS: ['p', 'br', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                          'blockquote', 'a', 'ul', 'ol', 'li', 'b', 'i', 'strong', 'em',
                          'strike', 'code', 'pre', 'img'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
            ALLOWED_SCHEMES: ['http', 'https', 'mailto'],
            ALLOW_DATA_ATTR: false
        };
        
        const config = { ...defaultOptions, ...options };
        
        return DOMPurify.sanitize(html, config);
    }
    
    escapeHTML(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;'
        };
        
        return text.replace(/[&<>"'\/]/g, char => map[char]);
    }
    
    // Rate Limiting
    
    async initializeRateLimiters() {
        if (!this.config.rateLimit.enabled) return;
        
        // General API rate limiter
        this.rateLimiters.set('api', new RateLimiterPostgres({
            storeClient: this.dbPool,
            tableName: 'rate_limit_api',
            points: this.config.rateLimit.points,
            duration: this.config.rateLimit.duration,
            blockDuration: this.config.rateLimit.blockDuration
        }));
        
        // Login rate limiter
        this.rateLimiters.set('login', new RateLimiterPostgres({
            storeClient: this.dbPool,
            tableName: 'rate_limit_login',
            points: this.config.rateLimit.loginAttempts,
            duration: this.config.rateLimit.loginWindow,
            blockDuration: this.config.rateLimit.loginWindow
        }));
        
        // Create tables
        await this.createRateLimitTables();
    }
    
    async createRateLimitTables() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS rate_limit_api (
                    key VARCHAR(255) PRIMARY KEY,
                    points INTEGER DEFAULT 0,
                    expire BIGINT
                );
                
                CREATE TABLE IF NOT EXISTS rate_limit_login (
                    key VARCHAR(255) PRIMARY KEY,
                    points INTEGER DEFAULT 0,
                    expire BIGINT
                );
            `);
        } finally {
            client.release();
        }
    }
    
    async checkRateLimit(key, limiterName = 'api') {
        if (!this.config.rateLimit.enabled) return true;
        
        const limiter = this.rateLimiters.get(limiterName);
        if (!limiter) return true;
        
        try {
            await limiter.consume(key);
            return true;
        } catch (rateLimitError) {
            this.metrics.rateLimitHits++;
            
            if (rateLimitError instanceof Error) {
                throw rateLimitError;
            }
            
            const secs = Math.round(rateLimitError.msBeforeNext / 1000) || 1;
            throw new RateLimitError(`Too many requests. Try again in ${secs} seconds.`, {
                retryAfter: secs
            });
        }
    }
    
    async checkLoginRateLimit(identifier) {
        return this.checkRateLimit(identifier, 'login');
    }
    
    // Security Headers
    
    getSecurityHeaders() {
        const headers = {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': this.config.headers.frameOptions,
            'X-XSS-Protection': '1; mode=block',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Content-Security-Policy': this.config.headers.csp,
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
        };
        
        if (this.config.headers.hsts) {
            headers['Strict-Transport-Security'] = 
                `max-age=${this.config.headers.hstsMaxAge}; includeSubDomains; preload`;
        }
        
        return headers;
    }
    
    // Encryption
    
    async encrypt(data, purpose = 'general') {
        const key = await this.getEncryptionKey(purpose);
        
        const iv = crypto.randomBytes(16);
        const salt = crypto.randomBytes(this.config.encryption.saltLength);
        
        const derivedKey = crypto.pbkdf2Sync(
            key,
            salt,
            this.config.encryption.iterations,
            32,
            'sha256'
        );
        
        const cipher = crypto.createCipheriv(
            this.config.encryption.algorithm,
            derivedKey,
            iv
        );
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            salt: salt.toString('hex'),
            tag: tag.toString('hex'),
            algorithm: this.config.encryption.algorithm,
            purpose
        };
    }
    
    async decrypt(encryptedData, purpose = 'general') {
        const key = await this.getEncryptionKey(purpose);
        
        const iv = Buffer.from(encryptedData.iv, 'hex');
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const tag = Buffer.from(encryptedData.tag, 'hex');
        
        const derivedKey = crypto.pbkdf2Sync(
            key,
            salt,
            this.config.encryption.iterations,
            32,
            'sha256'
        );
        
        const decipher = crypto.createDecipheriv(
            encryptedData.algorithm || this.config.encryption.algorithm,
            derivedKey,
            iv
        );
        
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    }
    
    async getEncryptionKey(purpose) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT encrypted_key FROM encryption_keys
                WHERE purpose = $1 AND is_active = true
                ORDER BY created_at DESC
                LIMIT 1
            `, [purpose]);
            
            if (result.rows.length === 0) {
                // Generate new key
                return this.generateEncryptionKey(purpose);
            }
            
            // Decrypt master key
            // In production, use KMS or hardware security module
            const masterKey = process.env.MASTER_ENCRYPTION_KEY;
            if (!masterKey) {
                throw new Error('Master encryption key not configured');
            }
            
            const keyData = JSON.parse(result.rows[0].encrypted_key);
            const decipher = crypto.createDecipheriv(
                'aes-256-gcm',
                Buffer.from(masterKey, 'hex'),
                Buffer.from(keyData.iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(keyData.tag, 'hex'));
            
            let key = decipher.update(keyData.encrypted, 'hex', 'utf8');
            key += decipher.final('utf8');
            
            return key;
            
        } finally {
            client.release();
        }
    }
    
    async generateEncryptionKey(purpose) {
        const key = crypto.randomBytes(32).toString('hex');
        
        // Encrypt with master key
        const masterKey = process.env.MASTER_ENCRYPTION_KEY;
        if (!masterKey) {
            throw new Error('Master encryption key not configured');
        }
        
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(
            'aes-256-gcm',
            Buffer.from(masterKey, 'hex'),
            iv
        );
        
        let encrypted = cipher.update(key, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        const encryptedKey = {
            encrypted,
            iv: iv.toString('hex'),
            tag: tag.toString('hex')
        };
        
        // Store encrypted key
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO encryption_keys
                (key_id, encrypted_key, algorithm, purpose)
                VALUES ($1, $2, $3, $4)
            `, [
                `${purpose}_${Date.now()}`,
                JSON.stringify(encryptedKey),
                'aes-256-gcm',
                purpose
            ]);
        } finally {
            client.release();
        }
        
        return key;
    }
    
    // API Key Management
    
    async createAPIKey(userId, name, scopes = []) {
        const key = crypto.randomBytes(32).toString('hex');
        const prefix = key.substring(0, 8);
        const keyHash = crypto.createHash('sha256').update(key).digest('hex');
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO api_keys
                (user_id, name, key_hash, prefix, scopes)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, name, prefix, scopes, created_at
            `, [userId, name, keyHash, prefix, JSON.stringify(scopes)]);
            
            const apiKey = result.rows[0];
            
            await this.auditLog({
                userId,
                action: 'api_key_created',
                resourceType: 'api_key',
                resourceId: apiKey.id
            });
            
            return {
                ...apiKey,
                key: `${prefix}.${key}` // Only returned once
            };
            
        } finally {
            client.release();
        }
    }
    
    async verifyAPIKey(apiKey) {
        const [prefix, key] = apiKey.split('.');
        if (!prefix || !key) {
            throw new Error('Invalid API key format');
        }
        
        const keyHash = crypto.createHash('sha256').update(key).digest('hex');
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT ak.*, u.username, u.email, u.is_active
                FROM api_keys ak
                JOIN users u ON ak.user_id = u.id
                WHERE ak.key_hash = $1
                  AND ak.prefix = $2
                  AND ak.is_active = true
                  AND (ak.expires_at IS NULL OR ak.expires_at > NOW())
                  AND u.is_active = true
            `, [keyHash, prefix]);
            
            if (result.rows.length === 0) {
                throw new Error('Invalid API key');
            }
            
            const keyData = result.rows[0];
            
            // Update last used
            await client.query(`
                UPDATE api_keys
                SET last_used_at = NOW()
                WHERE id = $1
            `, [keyData.id]);
            
            // Check rate limit for API key
            if (keyData.rate_limit) {
                await this.checkRateLimit(`api_key:${keyData.id}`, 'api');
            }
            
            return {
                userId: keyData.user_id,
                username: keyData.username,
                email: keyData.email,
                scopes: keyData.scopes,
                keyId: keyData.id
            };
            
        } finally {
            client.release();
        }
    }
    
    // Audit Logging
    
    async auditLog(logData) {
        if (!this.config.audit.enabled) return;
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO audit_logs
                (user_id, action, resource_type, resource_id,
                 ip_address, user_agent, request_method, request_path,
                 request_body, response_status, duration_ms, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                logData.userId,
                logData.action,
                logData.resourceType,
                logData.resourceId,
                logData.ipAddress || this.getClientIP(),
                logData.userAgent || this.getUserAgent(),
                logData.requestMethod,
                logData.requestPath,
                logData.requestBody ? JSON.stringify(this.filterSensitiveData(logData.requestBody)) : null,
                logData.responseStatus,
                logData.duration,
                JSON.stringify(logData.metadata || {})
            ]);
        } catch (error) {
            console.error('Failed to write audit log:', error);
        } finally {
            client.release();
        }
    }
    
    filterSensitiveData(data) {
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'credit_card'];
        const filtered = { ...data };
        
        for (const field of sensitiveFields) {
            if (filtered[field]) {
                filtered[field] = '[REDACTED]';
            }
        }
        
        return filtered;
    }
    
    // Security Event Recording
    
    async recordSecurityEvent(eventType, severity, details) {
        this.metrics.securityIncidents++;
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO security_events
                (event_type, severity, user_id, ip_address,
                 user_agent, description, details)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                eventType,
                severity,
                details.userId,
                details.ipAddress || this.getClientIP(),
                details.userAgent || this.getUserAgent(),
                details.description || eventType,
                JSON.stringify(details)
            ]);
            
            // Alert on high severity events
            if (severity === 'critical' || severity === 'high') {
                this.emit('security_alert', {
                    eventType,
                    severity,
                    details
                });
            }
            
        } finally {
            client.release();
        }
    }
    
    async recordFailedLogin(identifier) {
        await this.recordSecurityEvent('failed_login', 'low', {
            identifier,
            description: 'Failed login attempt'
        });
    }
    
    // Helper Methods
    
    validateUserData(userData) {
        const schema = {
            username: {
                type: 'string',
                required: true,
                minLength: 3,
                maxLength: 30,
                pattern: '^[a-zA-Z0-9_-]+$'
            },
            email: {
                type: 'email',
                required: true
            },
            password: {
                type: 'string',
                required: true,
                minLength: 8,
                custom: (value) => {
                    const strength = zxcvbn(value);
                    if (strength.score < 3) {
                        return 'Password is too weak';
                    }
                }
            }
        };
        
        this.validateInput(userData, schema);
    }
    
    parseExpiry(expiry) {
        const units = {
            s: 1000,
            m: 60000,
            h: 3600000,
            d: 86400000
        };
        
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match) {
            return parseInt(expiry) || 3600000;
        }
        
        return parseInt(match[1]) * units[match[2]];
    }
    
    getClientIP() {
        // In production, get from request headers
        return '127.0.0.1';
    }
    
    getUserAgent() {
        // In production, get from request headers
        return 'Construction-Syndicate/1.0';
    }
    
    // Security Configurations
    
    async loadSecurityConfigs() {
        // Load additional security configurations from database
        // This could include IP whitelists, blacklists, etc.
    }
    
    // Monitoring
    
    startSecurityMonitoring() {
        // Clean up expired sessions
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 3600000); // Every hour
        
        // Clean up old audit logs
        setInterval(() => {
            this.cleanupOldAuditLogs();
        }, 86400000); // Daily
        
        // Monitor security metrics
        setInterval(() => {
            this.reportSecurityMetrics();
        }, 300000); // Every 5 minutes
    }
    
    async cleanupExpiredSessions() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE sessions
                SET is_active = false
                WHERE expires_at < NOW()
                  AND is_active = true
            `);
            
            // Clear from cache
            for (const [hash, session] of this.sessionStore) {
                if (new Date() > session.expiresAt) {
                    this.sessionStore.delete(hash);
                }
            }
            
        } finally {
            client.release();
        }
    }
    
    async cleanupOldAuditLogs() {
        if (!this.config.audit.retention) return;
        
        const client = await this.dbPool.connect();
        try {
            const cutoffDate = new Date(Date.now() - this.config.audit.retention);
            
            await client.query(`
                DELETE FROM audit_logs
                WHERE created_at < $1
            `, [cutoffDate]);
            
        } finally {
            client.release();
        }
    }
    
    reportSecurityMetrics() {
        this.emit('security_metrics', {
            ...this.metrics,
            activeSessions: this.sessionStore.size,
            timestamp: new Date()
        });
    }
    
    // Shutdown
    
    async shutdown() {
        console.log('Shutting down Security Framework');
        
        // Clear caches
        this.sessionStore.clear();
        this.permissionCache.clear();
        
        // Close database pool
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Security Framework shut down');
    }
}

// Custom Error Classes

class ValidationError extends Error {
    constructor(errors) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

class RateLimitError extends Error {
    constructor(message, details = {}) {
        super(message);
        this.name = 'RateLimitError';
        this.retryAfter = details.retryAfter;
    }
}

// Export factory function
export function createSecurityFramework(config) {
    return new SecurityFramework(config);
}

// Export middleware factory
export function createSecurityMiddleware(securityFramework) {
    return {
        authenticate: async (req, res, next) => {
            try {
                const token = req.headers.authorization?.replace('Bearer ', '');
                
                if (!token) {
                    return res.status(401).json({ error: 'No token provided' });
                }
                
                const session = await securityFramework.verifyToken(token);
                req.user = session;
                
                next();
            } catch (error) {
                res.status(401).json({ error: error.message });
            }
        },
        
        authorize: (requiredPermission) => {
            return async (req, res, next) => {
                try {
                    if (!req.user) {
                        return res.status(401).json({ error: 'Not authenticated' });
                    }
                    
                    const hasPermission = await securityFramework.checkPermission(
                        req.user.userId,
                        requiredPermission
                    );
                    
                    if (!hasPermission) {
                        return res.status(403).json({ error: 'Insufficient permissions' });
                    }
                    
                    next();
                } catch (error) {
                    res.status(500).json({ error: 'Authorization failed' });
                }
            };
        },
        
        rateLimit: (limiterName = 'api') => {
            return async (req, res, next) => {
                try {
                    const key = req.user?.userId || req.ip;
                    await securityFramework.checkRateLimit(key, limiterName);
                    next();
                } catch (error) {
                    if (error instanceof RateLimitError) {
                        res.set('Retry-After', error.retryAfter);
                        return res.status(429).json({ error: error.message });
                    }
                    res.status(500).json({ error: 'Rate limit check failed' });
                }
            };
        },
        
        validateInput: (schema) => {
            return (req, res, next) => {
                try {
                    securityFramework.validateInput(req.body, schema);
                    
                    // Sanitize input
                    req.body = securityFramework.sanitizeInput(req.body);
                    
                    next();
                } catch (error) {
                    if (error instanceof ValidationError) {
                        return res.status(400).json({ 
                            error: 'Validation failed',
                            errors: error.errors 
                        });
                    }
                    res.status(500).json({ error: 'Validation error' });
                }
            };
        },
        
        securityHeaders: (req, res, next) => {
            const headers = securityFramework.getSecurityHeaders();
            
            for (const [header, value] of Object.entries(headers)) {
                res.set(header, value);
            }
            
            next();
        },
        
        auditLog: (action) => {
            return async (req, res, next) => {
                const startTime = Date.now();
                
                // Capture original methods
                const originalSend = res.send;
                const originalJson = res.json;
                
                // Override response methods
                res.send = function(data) {
                    res.locals.responseBody = data;
                    return originalSend.call(this, data);
                };
                
                res.json = function(data) {
                    res.locals.responseBody = data;
                    return originalJson.call(this, data);
                };
                
                // Log after response
                res.on('finish', async () => {
                    await securityFramework.auditLog({
                        userId: req.user?.userId,
                        action: action || `${req.method} ${req.path}`,
                        resourceType: req.params.resourceType,
                        resourceId: req.params.id,
                        ipAddress: req.ip,
                        userAgent: req.headers['user-agent'],
                        requestMethod: req.method,
                        requestPath: req.path,
                        requestBody: req.body,
                        responseStatus: res.statusCode,
                        duration: Date.now() - startTime
                    });
                });
                
                next();
            };
        }
    };
}
```

### Usage Example

```javascript
// security-usage.js
import express from 'express';
import { createSecurityFramework, createSecurityMiddleware } from './security-framework.js';

const app = express();
app.use(express.json());

// Initialize security
const security = createSecurityFramework({
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        mfaRequired: true
    },
    rateLimit: {
        points: 100,
        duration: 900
    }
});

await security.initialize();

// Create middleware
const middleware = createSecurityMiddleware(security);

// Apply global security headers
app.use(middleware.securityHeaders);

// Apply global rate limiting
app.use(middleware.rateLimit());

// Authentication endpoints
app.post('/auth/register', 
    middleware.validateInput({
        username: { type: 'string', required: true, minLength: 3 },
        email: { type: 'email', required: true },
        password: { type: 'string', required: true, minLength: 8 }
    }),
    async (req, res) => {
        try {
            const user = await security.createUser(req.body);
            res.json({ user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

app.post('/auth/login',
    middleware.rateLimit('login'),
    middleware.validateInput({
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        mfaCode: { type: 'string' }
    }),
    async (req, res) => {
        try {
            const result = await security.authenticate(req.body);
            
            if (result.requiresMFA) {
                res.json({ requiresMFA: true });
            } else {
                res.json({
                    user: result.user,
                    token: result.token,
                    refreshToken: result.refreshToken
                });
            }
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
);

app.post('/auth/logout',
    middleware.authenticate,
    async (req, res) => {
        try {
            await security.logout(req.headers.authorization.replace('Bearer ', ''));
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// MFA endpoints
app.post('/auth/mfa/setup',
    middleware.authenticate,
    async (req, res) => {
        try {
            const mfaSetup = await security.setupMFA(req.user.userId);
            res.json(mfaSetup);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

app.post('/auth/mfa/enable',
    middleware.authenticate,
    middleware.validateInput({
        verificationCode: { type: 'string', required: true }
    }),
    async (req, res) => {
        try {
            const result = await security.enableMFA(
                req.user.userId,
                req.body.verificationCode
            );
            res.json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// Protected endpoints
app.get('/api/projects',
    middleware.authenticate,
    middleware.authorize('read:projects'),
    middleware.auditLog('list_projects'),
    async (req, res) => {
        res.json({ projects: [] });
    }
);

app.post('/api/projects',
    middleware.authenticate,
    middleware.authorize('write:projects'),
    middleware.validateInput({
        name: { type: 'string', required: true },
        description: { type: 'string' }
    }),
    middleware.auditLog('create_project'),
    async (req, res) => {
        res.json({ project: { id: '123', ...req.body } });
    }
);

// Admin endpoints
app.post('/admin/users/:userId/roles',
    middleware.authenticate,
    middleware.authorize('admin:roles'),
    middleware.validateInput({
        role: { type: 'string', required: true }
    }),
    async (req, res) => {
        try {
            await security.assignRole(
                req.params.userId,
                req.body.role,
                req.user.userId
            );
            res.json({ success: true });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// API key management
app.post('/api/keys',
    middleware.authenticate,
    middleware.validateInput({
        name: { type: 'string', required: true },
        scopes: { type: 'array' }
    }),
    async (req, res) => {
        try {
            const apiKey = await security.createAPIKey(
                req.user.userId,
                req.body.name,
                req.body.scopes
            );
            res.json(apiKey);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
);

// API key authentication
app.use('/api/v2', async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            return res.status(401).json({ error: 'API key required' });
        }
        
        const keyData = await security.verifyAPIKey(apiKey);
        req.user = keyData;
        
        next();
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await security.shutdown();
    process.exit(0);
});
```

### Integration with Construction Systems

```javascript
// construction-security-integration.js
import { createSecurityFramework } from './security-framework.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionSecurityService {
    constructor() {
        this.security = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.security = createSecurityFramework({
            auth: {
                jwtExpiry: '8h', // Construction shift duration
                mfaRequired: true // Required for sensitive operations
            },
            rbac: {
                defaultRole: 'construction_worker'
            },
            audit: {
                sensitiveActions: [
                    'hoai_calculation',
                    'safety_override',
                    'material_approval',
                    'tender_submission',
                    'quantity_modification'
                ]
            }
        });
        
        await this.security.initialize();
        
        // Create construction-specific roles
        await this.createConstructionRoles();
        
        // Set up construction-specific validations
        this.setupConstructionValidations();
    }
    
    async createConstructionRoles() {
        const roles = [
            {
                name: 'construction_worker',
                description: 'Basic construction site worker',
                permissions: [
                    'read:tasks',
                    'read:safety',
                    'report:incidents'
                ]
            },
            {
                name: 'site_supervisor',
                description: 'Construction site supervisor',
                permissions: [
                    'read:*',
                    'write:tasks',
                    'write:safety_reports',
                    'approve:work_permits'
                ]
            },
            {
                name: 'project_engineer',
                description: 'Project engineer',
                permissions: [
                    'read:*',
                    'write:*',
                    'calculate:quantities',
                    'generate:reports'
                ]
            },
            {
                name: 'quantity_surveyor',
                description: 'Quantity surveyor',
                permissions: [
                    'read:*',
                    'write:quantities',
                    'write:boq',
                    'approve:measurements'
                ]
            },
            {
                name: 'safety_officer',
                description: 'Safety officer',
                permissions: [
                    'read:*',
                    'write:safety',
                    'override:safety',
                    'issue:stop_work'
                ]
            },
            {
                name: 'contract_manager',
                description: 'Contract manager',
                permissions: [
                    'read:*',
                    'write:contracts',
                    'write:tenders',
                    'approve:payments'
                ]
            },
            {
                name: 'architect',
                description: 'Lead architect',
                permissions: [
                    'read:*',
                    'write:design',
                    'approve:changes',
                    'calculate:hoai'
                ]
            }
        ];
        
        const client = await this.dbPool.connect();
        try {
            for (const role of roles) {
                await client.query(`
                    INSERT INTO roles (name, description, permissions)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (name) DO UPDATE SET
                        description = EXCLUDED.description,
                        permissions = EXCLUDED.permissions
                `, [role.name, role.description, JSON.stringify(role.permissions)]);
            }
        } finally {
            client.release();
        }
    }
    
    setupConstructionValidations() {
        // HOAI fee calculation validation
        this.hoaiValidation = {
            projectId: { type: 'string', required: true },
            phase: { 
                type: 'string', 
                required: true,
                enum: ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9']
            },
            constructionCost: {
                type: 'number',
                required: true,
                min: 0,
                max: 1000000000 // 1 billion max
            },
            difficultyLevel: {
                type: 'string',
                enum: ['I', 'II', 'III', 'IV', 'V']
            }
        };
        
        // Material specification validation
        this.materialValidation = {
            materialCode: { type: 'string', required: true, pattern: '^[A-Z0-9-]+$' },
            quantity: { type: 'number', required: true, min: 0 },
            unit: { type: 'string', required: true },
            specifications: { type: 'object' }
        };
        
        // Safety report validation
        this.safetyValidation = {
            projectId: { type: 'string', required: true },
            incidentType: { 
                type: 'string', 
                required: true,
                enum: ['near_miss', 'minor_injury', 'major_injury', 'fatality']
            },
            description: { type: 'string', required: true, minLength: 10 },
            location: { type: 'object', required: true },
            witnesses: { type: 'array' }
        };
    }
    
    // Construction-specific authentication
    
    async authenticateWorker(credentials) {
        // Additional validation for construction workers
        if (credentials.siteCode) {
            const isValidSite = await this.validateSiteCode(credentials.siteCode);
            if (!isValidSite) {
                throw new Error('Invalid site code');
            }
        }
        
        const result = await this.security.authenticate(credentials);
        
        // Add construction context
        if (result.user) {
            result.user.currentSite = await this.getUserCurrentSite(result.user.id);
            result.user.certifications = await this.getUserCertifications(result.user.id);
        }
        
        return result;
    }
    
    async validateSiteCode(siteCode) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id FROM construction_sites
                WHERE site_code = $1 AND is_active = true
            `, [siteCode]);
            
            return result.rows.length > 0;
        } finally {
            client.release();
        }
    }
    
    async getUserCurrentSite(userId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT cs.* FROM construction_sites cs
                JOIN site_assignments sa ON cs.id = sa.site_id
                WHERE sa.user_id = $1 
                  AND sa.is_active = true
                  AND cs.is_active = true
            `, [userId]);
            
            return result.rows[0] || null;
        } finally {
            client.release();
        }
    }
    
    async getUserCertifications(userId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT certification_type, expires_at
                FROM user_certifications
                WHERE user_id = $1 
                  AND expires_at > NOW()
            `, [userId]);
            
            return result.rows;
        } finally {
            client.release();
        }
    }
    
    // Permission checks with construction context
    
    async checkConstructionPermission(userId, permission, context = {}) {
        // Basic permission check
        const hasPermission = await this.security.checkPermission(userId, permission);
        
        if (!hasPermission) {
            return false;
        }
        
        // Additional context-based checks
        if (context.projectId) {
            const hasProjectAccess = await this.checkProjectAccess(userId, context.projectId);
            if (!hasProjectAccess) {
                return false;
            }
        }
        
        if (context.siteId) {
            const hasSiteAccess = await this.checkSiteAccess(userId, context.siteId);
            if (!hasSiteAccess) {
                return false;
            }
        }
        
        // Safety-critical operations require additional verification
        if (permission.startsWith('override:safety')) {
            const hasSafetyCertification = await this.checkSafetyCertification(userId);
            if (!hasSafetyCertification) {
                return false;
            }
        }
        
        return true;
    }
    
    async checkProjectAccess(userId, projectId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id FROM project_team_members
                WHERE user_id = $1 
                  AND project_id = $2
                  AND is_active = true
            `, [userId, projectId]);
            
            return result.rows.length > 0;
        } finally {
            client.release();
        }
    }
    
    async checkSiteAccess(userId, siteId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id FROM site_assignments
                WHERE user_id = $1 
                  AND site_id = $2
                  AND is_active = true
            `, [userId, siteId]);
            
            return result.rows.length > 0;
        } finally {
            client.release();
        }
    }
    
    async checkSafetyCertification(userId) {
        const certifications = await this.getUserCertifications(userId);
        return certifications.some(cert => cert.certification_type === 'safety_officer');
    }
    
    // Data encryption for sensitive construction data
    
    async encryptHOAIData(hoaiData) {
        // HOAI calculations are sensitive business data
        return this.security.encrypt(hoaiData, 'hoai_calculations');
    }
    
    async decryptHOAIData(encryptedData) {
        return this.security.decrypt(encryptedData, 'hoai_calculations');
    }
    
    async encryptTenderData(tenderData) {
        // Tender submissions contain competitive information
        return this.security.encrypt(tenderData, 'tender_submissions');
    }
    
    async decryptTenderData(encryptedData) {
        return this.security.decrypt(encryptedData, 'tender_submissions');
    }
    
    // Construction-specific audit logging
    
    async auditHOAICalculation(userId, calculationData) {
        await this.security.auditLog({
            userId,
            action: 'hoai_calculation',
            resourceType: 'hoai_fee',
            resourceId: calculationData.projectId,
            metadata: {
                phase: calculationData.phase,
                calculatedFee: calculationData.fee,
                constructionCost: calculationData.constructionCost
            }
        });
    }
    
    async auditSafetyOverride(userId, overrideData) {
        await this.security.auditLog({
            userId,
            action: 'safety_override',
            resourceType: 'safety_protocol',
            resourceId: overrideData.protocolId,
            metadata: {
                reason: overrideData.reason,
                riskLevel: overrideData.riskLevel,
                approvedBy: overrideData.approvedBy
            }
        });
        
        // Also create security event for safety overrides
        await this.security.recordSecurityEvent('safety_override', 'high', {
            userId,
            description: `Safety protocol overridden: ${overrideData.reason}`,
            ...overrideData
        });
    }
    
    // Input validation for construction data
    
    validateHOAIInput(data) {
        return this.security.validateInput(data, this.hoaiValidation);
    }
    
    validateMaterialInput(data) {
        return this.security.validateInput(data, this.materialValidation);
    }
    
    validateSafetyInput(data) {
        return this.security.validateInput(data, this.safetyValidation);
    }
    
    // SQL injection prevention for complex construction queries
    
    createSafeBOQQuery(filters) {
        let query = 'SELECT * FROM boq_items WHERE project_id = $1';
        const params = [filters.projectId];
        let paramIndex = 2;
        
        if (filters.section) {
            query += ` AND section = $${paramIndex}`;
            params.push(filters.section);
            paramIndex++;
        }
        
        if (filters.costGroup) {
            query += ` AND cost_group = $${paramIndex}`;
            params.push(filters.costGroup);
            paramIndex++;
        }
        
        // Use the framework's query validation
        return this.security.createParameterizedQuery(query, params);
    }
    
    // Rate limiting for construction operations
    
    async checkQuantityCalculationLimit(userId) {
        // Quantity calculations are resource-intensive
        return this.security.checkRateLimit(`quantity:${userId}`, 'api');
    }
    
    async checkTenderGenerationLimit(userId) {
        // Tender generation has stricter limits
        const limiter = new RateLimiterPostgres({
            storeClient: this.dbPool,
            tableName: 'rate_limit_tender',
            points: 10, // 10 tender generations
            duration: 3600 // per hour
        });
        
        try {
            await limiter.consume(userId);
            return true;
        } catch (error) {
            throw new Error('Tender generation limit exceeded');
        }
    }
}
```

## Testing

```javascript
// security.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { createSecurityFramework } from './security-framework.js';

describe('SecurityFramework', () => {
    let security;
    
    beforeEach(async () => {
        security = createSecurityFramework({
            auth: { bcryptRounds: 4 }, // Lower for testing
            rateLimit: { enabled: false } // Disable for testing
        });
        await security.initialize();
    });
    
    describe('Authentication', () => {
        test('should create user', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'StrongP@ssw0rd123'
            };
            
            const user = await security.createUser(userData);
            
            expect(user.id).toBeDefined();
            expect(user.username).toBe('testuser');
            expect(user.email).toBe('test@example.com');
        });
        
        test('should authenticate user', async () => {
            const userData = {
                username: 'authtest',
                email: 'auth@example.com',
                password: 'StrongP@ssw0rd123'
            };
            
            await security.createUser(userData);
            
            const result = await security.authenticate({
                username: 'authtest',
                password: 'StrongP@ssw0rd123'
            });
            
            expect(result.token).toBeDefined();
            expect(result.user.username).toBe('authtest');
        });
        
        test('should verify token', async () => {
            const userData = {
                username: 'tokentest',
                email: 'token@example.com',
                password: 'StrongP@ssw0rd123'
            };
            
            await security.createUser(userData);
            const auth = await security.authenticate({
                username: 'tokentest',
                password: 'StrongP@ssw0rd123'
            });
            
            const session = await security.verifyToken(auth.token);
            
            expect(session.userId).toBeDefined();
            expect(session.username).toBe('tokentest');
        });
    });
    
    describe('Input Validation', () => {
        test('should validate required fields', () => {
            const schema = {
                name: { type: 'string', required: true }
            };
            
            expect(() => {
                security.validateInput({}, schema);
            }).toThrow('Validation failed');
        });
        
        test('should validate email format', () => {
            const schema = {
                email: { type: 'email', required: true }
            };
            
            expect(() => {
                security.validateInput({ email: 'invalid' }, schema);
            }).toThrow();
            
            expect(() => {
                security.validateInput({ email: 'valid@example.com' }, schema);
            }).not.toThrow();
        });
        
        test('should sanitize input', () => {
            const input = {
                name: '<script>alert("xss")</script>',
                description: '  test  '
            };
            
            const sanitized = security.sanitizeInput(input);
            
            expect(sanitized.name).not.toContain('<script>');
            expect(sanitized.description).toBe('test');
        });
    });
    
    describe('Encryption', () => {
        test('should encrypt and decrypt data', async () => {
            const data = { sensitive: 'information' };
            
            const encrypted = await security.encrypt(data);
            expect(encrypted.encrypted).toBeDefined();
            expect(encrypted.iv).toBeDefined();
            
            const decrypted = await security.decrypt(encrypted);
            expect(decrypted).toEqual(data);
        });
    });
    
    describe('Authorization', () => {
        test('should check permissions', async () => {
            // Create user and assign role
            const user = await security.createUser({
                username: 'permtest',
                email: 'perm@example.com',
                password: 'StrongP@ssw0rd123'
            });
            
            await security.assignRole(user.id, 'admin', user.id);
            
            const hasPermission = await security.checkPermission(
                user.id,
                'write:projects'
            );
            
            expect(hasPermission).toBe(true);
        });
    });
});
```

This implementation provides a comprehensive security framework with authentication, authorization, input validation, encryption, rate limiting, and audit logging for the construction syndicate system.
