/**
 * 🔐 AUTH SERVICE - JWT Authentication System
 * ==========================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - Production-grade authentication
 * with JWT tokens, secure session management, and role-based access
 * 
 * FEATURES:
 * - JWT token generation and validation
 * - Secure password hashing with bcrypt
 * - Role-based access control (RBAC)
 * - Token refresh mechanism
 * - Session management
 * - Audit logging
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class AuthService {
    constructor(config = {}) {
        this.config = {
            jwtSecret: config.jwtSecret || process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
            jwtExpiry: config.jwtExpiry || '24h',
            refreshExpiry: config.refreshExpiry || '7d',
            bcryptRounds: config.bcryptRounds || 12,
            sessionSecret: config.sessionSecret || process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
            adminApiKey: config.adminApiKey || process.env.ADMIN_API_KEY,
            ...config
        };
        
        this.dbPool = null;
        this.isInitialized = false;
        
        // Token blacklist for logout
        this.tokenBlacklist = new Set();
        
        // Active sessions
        this.activeSessions = new Map();
    }
    
    /**
     * 🚀 INITIALIZE
     */
    async initialize(dbPool) {
        console.log('🔐 Initializing Auth Service...');
        
        this.dbPool = dbPool;
        
        // Create auth tables if not exist
        await this.createAuthTables();
        
        // Create default admin user if not exists
        await this.createDefaultAdmin();
        
        this.isInitialized = true;
        console.log('✅ Auth Service initialized');
    }
    
    /**
     * 🗄️ CREATE AUTH TABLES
     */
    async createAuthTables() {
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                metadata JSONB DEFAULT '{}'::jsonb
            );
        `;
        
        const createSessionsTable = `
            CREATE TABLE IF NOT EXISTS sessions (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                token_hash VARCHAR(255) UNIQUE NOT NULL,
                refresh_token_hash VARCHAR(255) UNIQUE,
                ip_address VARCHAR(45),
                user_agent TEXT,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        const createAuditLogTable = `
            CREATE TABLE IF NOT EXISTS auth_audit_log (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                action VARCHAR(50) NOT NULL,
                ip_address VARCHAR(45),
                user_agent TEXT,
                success BOOLEAN DEFAULT true,
                error_message TEXT,
                metadata JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        const createApiKeysTable = `
            CREATE TABLE IF NOT EXISTS api_keys (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                key_hash VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                permissions JSONB DEFAULT '[]'::jsonb,
                last_used TIMESTAMP,
                expires_at TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        
        await this.dbPool.query(createUsersTable);
        await this.dbPool.query(createSessionsTable);
        await this.dbPool.query(createAuditLogTable);
        await this.dbPool.query(createApiKeysTable);
        
        // Create indexes
        await this.dbPool.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
        await this.dbPool.query('CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);');
        await this.dbPool.query('CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);');
        await this.dbPool.query('CREATE INDEX IF NOT EXISTS idx_audit_user ON auth_audit_log(user_id);');
    }
    
    /**
     * 👤 CREATE DEFAULT ADMIN
     */
    async createDefaultAdmin() {
        const adminExists = await this.dbPool.query(
            'SELECT id FROM users WHERE role = $1 LIMIT 1',
            ['admin']
        );
        
        if (adminExists.rows.length === 0) {
            const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!';
            const hashedPassword = await bcrypt.hash(defaultPassword, this.config.bcryptRounds);
            
            await this.dbPool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
                ['admin', 'admin@construction-syndicate.ai', hashedPassword, 'admin']
            );
            
            console.log('⚠️  Default admin user created. Please change password immediately!');
            console.log('    Username: admin');
            console.log('    Password: ChangeMe123!');
        }
    }
    
    /**
     * 🔑 REGISTER USER
     */
    async register(userData) {
        const { username, email, password, role = 'user' } = userData;
        
        try {
            // Validate input
            this.validateUserData(userData);
            
            // Check if user exists
            const existingUser = await this.dbPool.query(
                'SELECT id FROM users WHERE username = $1 OR email = $2',
                [username, email]
            );
            
            if (existingUser.rows.length > 0) {
                throw new Error('User already exists');
            }
            
            // Hash password
            const passwordHash = await bcrypt.hash(password, this.config.bcryptRounds);
            
            // Create user
            const result = await this.dbPool.query(
                'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
                [username, email, passwordHash, role]
            );
            
            const user = result.rows[0];
            
            // Log registration
            await this.auditLog(user.id, 'register', true);
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            };
            
        } catch (error) {
            await this.auditLog(null, 'register', false, { error: error.message, username });
            throw error;
        }
    }
    
    /**
     * 🔐 LOGIN
     */
    async login(credentials, req) {
        const { username, password } = credentials;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        try {
            // Find user
            const result = await this.dbPool.query(
                'SELECT id, username, email, password_hash, role, is_active FROM users WHERE username = $1 OR email = $1',
                [username]
            );
            
            if (result.rows.length === 0) {
                throw new Error('Invalid credentials');
            }
            
            const user = result.rows[0];
            
            // Check if user is active
            if (!user.is_active) {
                throw new Error('Account is disabled');
            }
            
            // Verify password
            const isValid = await bcrypt.compare(password, user.password_hash);
            if (!isValid) {
                await this.auditLog(user.id, 'login_failed', false, { reason: 'invalid_password' }, ipAddress, userAgent);
                throw new Error('Invalid credentials');
            }
            
            // Generate tokens
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            
            // Hash tokens for storage
            const tokenHash = this.hashToken(accessToken);
            const refreshTokenHash = this.hashToken(refreshToken);
            
            // Calculate expiry
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            
            // Store session
            await this.dbPool.query(
                'INSERT INTO sessions (user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at) VALUES ($1, $2, $3, $4, $5, $6)',
                [user.id, tokenHash, refreshTokenHash, ipAddress, userAgent, expiresAt]
            );
            
            // Update last login
            await this.dbPool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            // Audit log
            await this.auditLog(user.id, 'login', true, {}, ipAddress, userAgent);
            
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken,
                expiresIn: this.config.jwtExpiry
            };
            
        } catch (error) {
            await this.auditLog(null, 'login_failed', false, { error: error.message, username }, ipAddress, userAgent);
            throw error;
        }
    }
    
    /**
     * 🔄 REFRESH TOKEN
     */
    async refreshToken(refreshToken, req) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, this.config.jwtSecret);
            
            // Check if token is in database
            const tokenHash = this.hashToken(refreshToken);
            const sessionResult = await this.dbPool.query(
                'SELECT user_id FROM sessions WHERE refresh_token_hash = $1',
                [tokenHash]
            );
            
            if (sessionResult.rows.length === 0) {
                throw new Error('Invalid refresh token');
            }
            
            // Get user
            const userResult = await this.dbPool.query(
                'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );
            
            if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
                throw new Error('User not found or inactive');
            }
            
            const user = userResult.rows[0];
            
            // Generate new access token
            const newAccessToken = this.generateAccessToken(user);
            
            // Update session
            const newTokenHash = this.hashToken(newAccessToken);
            await this.dbPool.query(
                'UPDATE sessions SET token_hash = $1 WHERE refresh_token_hash = $2',
                [newTokenHash, tokenHash]
            );
            
            return {
                success: true,
                accessToken: newAccessToken,
                expiresIn: this.config.jwtExpiry
            };
            
        } catch (error) {
            throw new Error('Token refresh failed');
        }
    }
    
    /**
     * 🚪 LOGOUT
     */
    async logout(token, req) {
        try {
            const tokenHash = this.hashToken(token);
            
            // Remove session
            await this.dbPool.query(
                'DELETE FROM sessions WHERE token_hash = $1',
                [tokenHash]
            );
            
            // Add to blacklist
            this.tokenBlacklist.add(tokenHash);
            
            // Get user from token
            const decoded = jwt.verify(token, this.config.jwtSecret);
            
            // Audit log
            await this.auditLog(
                decoded.userId,
                'logout',
                true,
                {},
                req.ip,
                req.headers['user-agent']
            );
            
            return { success: true };
            
        } catch (error) {
            throw new Error('Logout failed');
        }
    }
    
    /**
     * ✅ VERIFY TOKEN
     */
    async verifyToken(token) {
        try {
            // Check blacklist
            const tokenHash = this.hashToken(token);
            if (this.tokenBlacklist.has(tokenHash)) {
                throw new Error('Token is blacklisted');
            }
            
            // Verify JWT
            const decoded = jwt.verify(token, this.config.jwtSecret);
            
            // Check session in database
            const sessionResult = await this.dbPool.query(
                'SELECT user_id, expires_at FROM sessions WHERE token_hash = $1',
                [tokenHash]
            );
            
            if (sessionResult.rows.length === 0) {
                throw new Error('Session not found');
            }
            
            const session = sessionResult.rows[0];
            
            // Check expiry
            if (new Date(session.expires_at) < new Date()) {
                throw new Error('Session expired');
            }
            
            // Get user
            const userResult = await this.dbPool.query(
                'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
                [decoded.userId]
            );
            
            if (userResult.rows.length === 0 || !userResult.rows[0].is_active) {
                throw new Error('User not found or inactive');
            }
            
            return {
                valid: true,
                user: userResult.rows[0]
            };
            
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
    
    /**
     * 🔑 GENERATE ACCESS TOKEN
     */
    generateAccessToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role
            },
            this.config.jwtSecret,
            {
                expiresIn: this.config.jwtExpiry
            }
        );
    }
    
    /**
     * 🔄 GENERATE REFRESH TOKEN
     */
    generateRefreshToken(user) {
        return jwt.sign(
            {
                userId: user.id,
                type: 'refresh'
            },
            this.config.jwtSecret,
            {
                expiresIn: this.config.refreshExpiry
            }
        );
    }
    
    /**
     * 🔒 HASH TOKEN
     */
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    
    /**
     * 📝 AUDIT LOG
     */
    async auditLog(userId, action, success, metadata = {}, ipAddress = null, userAgent = null) {
        try {
            await this.dbPool.query(
                'INSERT INTO auth_audit_log (user_id, action, success, metadata, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, action, success, JSON.stringify(metadata), ipAddress, userAgent]
            );
        } catch (error) {
            console.error('Failed to write audit log:', error);
        }
    }
    
    /**
     * ✔️ VALIDATE USER DATA
     */
    validateUserData(userData) {
        const { username, email, password } = userData;
        
        if (!username || username.length < 3) {
            throw new Error('Username must be at least 3 characters');
        }
        
        if (!email || !this.isValidEmail(email)) {
            throw new Error('Invalid email address');
        }
        
        if (!password || password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        
        // Check password complexity
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            throw new Error('Password must contain uppercase, lowercase, and numbers');
        }
    }
    
    /**
     * 📧 VALIDATE EMAIL
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * 🛡️ MIDDLEWARE
     */
    middleware(requiredRole = null) {
        return async (req, res, next) => {
            try {
                const token = this.extractToken(req);
                
                if (!token) {
                    return res.status(401).json({ error: 'No token provided' });
                }
                
                const verification = await this.verifyToken(token);
                
                if (!verification.valid) {
                    return res.status(401).json({ error: verification.error });
                }
                
                // Check role if required
                if (requiredRole && verification.user.role !== requiredRole) {
                    return res.status(403).json({ error: 'Insufficient permissions' });
                }
                
                // Attach user to request
                req.user = verification.user;
                next();
                
            } catch (error) {
                return res.status(401).json({ error: 'Authentication failed' });
            }
        };
    }
    
    /**
     * 🎫 EXTRACT TOKEN
     */
    extractToken(req) {
        // Check Authorization header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        
        // Check cookies
        if (req.cookies && req.cookies.accessToken) {
            return req.cookies.accessToken;
        }
        
        // Check query parameter (for WebSocket)
        if (req.query && req.query.token) {
            return req.query.token;
        }
        
        return null;
    }
    
    /**
     * 🗑️ CLEANUP EXPIRED SESSIONS
     */
    async cleanupExpiredSessions() {
        try {
            const result = await this.dbPool.query(
                'DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP'
            );
            
            if (result.rowCount > 0) {
                console.log(`🗑️ Cleaned up ${result.rowCount} expired sessions`);
            }
        } catch (error) {
            console.error('Failed to cleanup sessions:', error);
        }
    }
    
    /**
     * 📊 GET USER STATS
     */
    async getUserStats(userId) {
        const stats = await this.dbPool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE action = 'login' AND success = true) as successful_logins,
                COUNT(*) FILTER (WHERE action = 'login_failed') as failed_logins,
                MAX(created_at) FILTER (WHERE action = 'login' AND success = true) as last_login
            FROM auth_audit_log
            WHERE user_id = $1
        `, [userId]);
        
        return stats.rows[0];
    }
}

// Singleton instance
let authService = null;

/**
 * 🏭 GET AUTH SERVICE
 */
export function getAuthService(config = {}) {
    if (!authService) {
        authService = new AuthService(config);
    }
    return authService;
}

export default AuthService;
