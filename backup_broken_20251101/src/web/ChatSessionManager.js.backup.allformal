/**
 * 💬 CHAT SESSION MANAGER
 * =====================
 * 
 * Sophisticated session management for LLM chat with:
 * - Persistent session storage with database backup
 * - Unlimited concurrent sessions with unique IDs
 * - Session restoration, cleanup, and manual management
 * - Advanced reasoning configuration persistence
 * - Real-time session synchronization
 * 
 * Part of the AIGO-Syndicate Construction Intelligence System
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { DatabasePoolManager } from '../database/DatabasePoolManager.js';

export class ChatSessionManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // Core configuration
        this.config = {
            maxConcurrentSessions: config.maxConcurrentSessions || 100,
            sessionTimeoutMinutes: config.sessionTimeoutMinutes || 60,
            maxMessagesPerSession: config.maxMessagesPerSession || 1000,
            persistenceEnabled: config.persistenceEnabled !== false,
            autoCleanupEnabled: config.autoCleanupEnabled !== false,
            cleanupIntervalMinutes: config.cleanupIntervalMinutes || 30,
            ...config
        };
        
        // Session storage
        this.activeSessions = new Map(); // sessionId -> SessionData
        this.sessionMetrics = new Map(); // sessionId -> SessionMetrics
        this.reasoningConfigs = new Map(); // sessionId -> ReasoningConfig
        
        // Database connection
        this.dbPool = null;
        this.dbInitialized = false;
        
        // Cleanup timer
        this.cleanupTimer = null;
        
        // Performance tracking
        this.metrics = {
            totalSessions: 0,
            activeSessions: 0,
            messagesProcessed: 0,
            averageSessionDuration: 0,
            sessionsByTarget: new Map(),
            reasoningMethodUsage: new Map()
        };
        
        console.log('💬 ChatSessionManager initialized with config:', {
            maxConcurrentSessions: this.config.maxConcurrentSessions,
            persistenceEnabled: this.config.persistenceEnabled,
            autoCleanupEnabled: this.config.autoCleanupEnabled
        });
    }
    
    /**
     * 🚀 INITIALIZE SESSION MANAGER
     */
    async initialize() {
        console.log('💬 Initializing Chat Session Manager...');
        
        try {
            // Initialize database connection
            if (this.config.persistenceEnabled) {
                await this.initializeDatabase();
            }
            
            // Load existing sessions from database
            if (this.dbInitialized) {
                await this.loadExistingSessions();
            }
            
            // Start cleanup timer
            if (this.config.autoCleanupEnabled) {
                this.startCleanupTimer();
            }
            
            console.log('✅ Chat Session Manager initialized successfully');
            console.log(`📊 Active sessions: ${this.activeSessions.size}`);
            
            // Emit initialization complete
            this.emit('initialized', {
                activeSessions: this.activeSessions.size,
                dbInitialized: this.dbInitialized
            });
            
        } catch (error) {
            console.error('❌ Chat Session Manager initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * 🗄️ INITIALIZE DATABASE CONNECTION
     */
    async initializeDatabase() {
        try {
            console.log('🗄️ Initializing database connection for chat sessions...');
            
            this.dbPool = DatabasePoolManager.getInstance().getPool();
            
            if (!this.dbPool) {
                console.warn('⚠️ Database pool not available - running in memory-only mode');
                return;
            }
            
            // Create chat tables
            await this.createChatTables();
            
            this.dbInitialized = true;
            console.log('✅ Database connection initialized for chat sessions');
            
        } catch (error) {
            console.error('❌ Database initialization failed for chat sessions:', error);
            console.warn('⚠️ Continuing in memory-only mode');
        }
    }
    
    /**
     * 📋 CREATE CHAT TABLES
     */
    async createChatTables() {
        const createTablesSQL = `
            -- Chat Sessions table
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id VARCHAR(255) UNIQUE NOT NULL,
                title TEXT,
                target_type VARCHAR(100),
                target_id VARCHAR(255),
                reasoning_config JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                metadata JSONB DEFAULT '{}'
            );
            
            -- Chat Messages table  
            CREATE TABLE IF NOT EXISTS chat_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id VARCHAR(255) NOT NULL,
                message_type VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
                content TEXT NOT NULL,
                reasoning_data JSONB DEFAULT '{}',
                target_type VARCHAR(100),
                target_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                processing_time_ms INTEGER,
                confidence_score FLOAT,
                metadata JSONB DEFAULT '{}',
                FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
            );
            
            -- Reasoning Configurations table
            CREATE TABLE IF NOT EXISTS reasoning_configs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id VARCHAR(255) NOT NULL,
                method VARCHAR(100) NOT NULL, -- 'CoT', 'ToT', 'GoT', 'CoA'
                config JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT true,
                FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
            );
            
            -- Agent Status Logs table
            CREATE TABLE IF NOT EXISTS agent_status_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agent_id VARCHAR(255) NOT NULL,
                status VARCHAR(100) NOT NULL,
                performance_metrics JSONB DEFAULT '{}',
                reasoning_state JSONB DEFAULT '{}',
                decision_context JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id VARCHAR(255),
                FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE SET NULL
            );
            
            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
            CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active, last_activity);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
            CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
            CREATE INDEX IF NOT EXISTS idx_reasoning_configs_session_id ON reasoning_configs(session_id);
            CREATE INDEX IF NOT EXISTS idx_agent_status_logs_agent_id ON agent_status_logs(agent_id);
            CREATE INDEX IF NOT EXISTS idx_agent_status_logs_created_at ON agent_status_logs(created_at);
        `;
        
        await this.dbPool.query(createTablesSQL);
        console.log('✅ Chat tables created successfully');
    }
    
    /**
     * 📥 LOAD EXISTING SESSIONS FROM DATABASE
     */
    async loadExistingSessions() {
        try {
            console.log('📥 Loading existing chat sessions from database...');
            
            const result = await this.dbPool.query(`
                SELECT 
                    session_id, title, target_type, target_id, 
                    reasoning_config, created_at, last_activity,
                    message_count, metadata
                FROM chat_sessions 
                WHERE is_active = true 
                AND last_activity > NOW() - INTERVAL '24 hours'
                ORDER BY last_activity DESC
            `);
            
            for (const row of result.rows) {
                const sessionData = {
                    sessionId: row.session_id,
                    title: row.title,
                    target: {
                        type: row.target_type,
                        id: row.target_id
                    },
                    reasoningConfig: row.reasoning_config || {},
                    createdAt: row.created_at,
                    lastActivity: row.last_activity,
                    messageCount: row.message_count,
                    metadata: row.metadata || {},
                    messages: []
                };
                
                // Load messages for this session
                const messagesResult = await this.dbPool.query(`
                    SELECT content, message_type, reasoning_data, created_at, confidence_score
                    FROM chat_messages 
                    WHERE session_id = $1 
                    ORDER BY created_at ASC
                `, [row.session_id]);
                
                sessionData.messages = messagesResult.rows.map(msg => ({
                    content: msg.content,
                    type: msg.message_type,
                    reasoningData: msg.reasoning_data || {},
                    timestamp: msg.created_at,
                    confidence: msg.confidence_score
                }));
                
                this.activeSessions.set(row.session_id, sessionData);
                this.reasoningConfigs.set(row.session_id, row.reasoning_config || {});
            }
            
            console.log(`✅ Loaded ${result.rows.length} existing chat sessions`);
            
        } catch (error) {
            console.error('❌ Failed to load existing sessions:', error);
        }
    }
    
    /**
     * 🆕 CREATE NEW CHAT SESSION
     */
    async createSession(options = {}) {
        const sessionId = options.sessionId || `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
        
        try {
            // Check session limits
            if (this.activeSessions.size >= this.config.maxConcurrentSessions) {
                throw new Error(`Maximum concurrent sessions limit reached (${this.config.maxConcurrentSessions})`);
            }
            
            const sessionData = {
                sessionId,
                title: options.title || `Chat Session ${new Date().toLocaleString()}`,
                target: options.target || { type: 'llm', id: 'primary' },
                reasoningConfig: options.reasoningConfig || this.getDefaultReasoningConfig(),
                createdAt: new Date(),
                lastActivity: new Date(),
                messageCount: 0,
                metadata: options.metadata || {},
                messages: []
            };
            
            // Store in memory
            this.activeSessions.set(sessionId, sessionData);
            this.reasoningConfigs.set(sessionId, sessionData.reasoningConfig);
            
            // Initialize session metrics
            this.sessionMetrics.set(sessionId, {
                startTime: Date.now(),
                messageCount: 0,
                totalProcessingTime: 0,
                averageResponseTime: 0,
                reasoningMethodsUsed: []
            });
            
            // Persist to database
            if (this.dbInitialized) {
                await this.dbPool.query(`
                    INSERT INTO chat_sessions 
                    (session_id, title, target_type, target_id, reasoning_config, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    sessionId,
                    sessionData.title,
                    sessionData.target.type,
                    sessionData.target.id,
                    JSON.stringify(sessionData.reasoningConfig),
                    JSON.stringify(sessionData.metadata)
                ]);
            }
            
            // Update metrics
            this.metrics.totalSessions++;
            this.metrics.activeSessions = this.activeSessions.size;
            
            // Track target usage
            const targetKey = `${sessionData.target.type}:${sessionData.target.id}`;
            this.metrics.sessionsByTarget.set(targetKey, 
                (this.metrics.sessionsByTarget.get(targetKey) || 0) + 1);
            
            console.log(`💬 Created new chat session: ${sessionId}`);
            console.log(`🎯 Target: ${sessionData.target.type}:${sessionData.target.id}`);
            
            // Emit session created event
            this.emit('sessionCreated', {
                sessionId,
                sessionData,
                activeSessions: this.activeSessions.size
            });
            
            return sessionData;
            
        } catch (error) {
            console.error(`❌ Failed to create chat session ${sessionId}:`, error);
            throw error;
        }
    }
    
    /**
     * 💬 ADD MESSAGE TO SESSION
     */
    async addMessage(sessionId, message, options = {}) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error(`Session ${sessionId} not found`);
            }
            
            // Check message limits
            if (session.messages.length >= this.config.maxMessagesPerSession) {
                throw new Error(`Maximum messages per session limit reached (${this.config.maxMessagesPerSession})`);
            }
            
            const messageData = {
                content: message.content,
                type: message.type || 'user',
                reasoningData: message.reasoningData || {},
                timestamp: new Date(),
                confidence: message.confidence,
                processingTime: message.processingTime,
                target: message.target || session.target
            };
            
            // Add to session
            session.messages.push(messageData);
            session.messageCount++;
            session.lastActivity = new Date();
            
            // Update session metrics
            const metrics = this.sessionMetrics.get(sessionId);
            if (metrics) {
                metrics.messageCount++;
                if (messageData.processingTime) {
                    metrics.totalProcessingTime += messageData.processingTime;
                    metrics.averageResponseTime = metrics.totalProcessingTime / metrics.messageCount;
                }
            }
            
            // Persist to database
            if (this.dbInitialized) {
                await this.dbPool.query(`
                    INSERT INTO chat_messages 
                    (session_id, content, message_type, reasoning_data, target_type, target_id, 
                     processing_time_ms, confidence_score, metadata)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    sessionId,
                    messageData.content,
                    messageData.type,
                    JSON.stringify(messageData.reasoningData),
                    messageData.target.type,
                    messageData.target.id,
                    messageData.processingTime,
                    messageData.confidence,
                    JSON.stringify(options.metadata || {})
                ]);
                
                // Update session activity
                await this.dbPool.query(`
                    UPDATE chat_sessions 
                    SET last_activity = CURRENT_TIMESTAMP, message_count = message_count + 1
                    WHERE session_id = $1
                `, [sessionId]);
            }
            
            // Update global metrics
            this.metrics.messagesProcessed++;
            
            // Emit message added event
            this.emit('messageAdded', {
                sessionId,
                messageData,
                sessionMessageCount: session.messages.length
            });
            
            console.log(`💬 Added message to session ${sessionId} (${session.messages.length} total messages)`);
            
            return messageData;
            
        } catch (error) {
            console.error(`❌ Failed to add message to session ${sessionId}:`, error);
            throw error;
        }
    }
    
    /**
     * 📖 GET SESSION HISTORY
     */
    getSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (!session) {
            console.warn(`Session ${sessionId} not found in active sessions`);
            return null;
        }
        
        return {
            ...session,
            metrics: this.sessionMetrics.get(sessionId)
        };
    }
    
    /**
     * 📝 UPDATE SESSION REASONING CONFIG
     */
    async updateReasoningConfig(sessionId, reasoningConfig) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                throw new Error(`Session ${sessionId} not found`);
            }
            
            // Update in memory
            session.reasoningConfig = { ...session.reasoningConfig, ...reasoningConfig };
            this.reasoningConfigs.set(sessionId, session.reasoningConfig);
            session.lastActivity = new Date();
            
            // Persist to database
            if (this.dbInitialized) {
                await this.dbPool.query(`
                    UPDATE chat_sessions 
                    SET reasoning_config = $1, updated_at = CURRENT_TIMESTAMP
                    WHERE session_id = $2
                `, [JSON.stringify(session.reasoningConfig), sessionId]);
            }
            
            // Emit config updated event
            this.emit('reasoningConfigUpdated', {
                sessionId,
                reasoningConfig: session.reasoningConfig
            });
            
            console.log(`🧠 Updated reasoning config for session ${sessionId}`);
            
            return session.reasoningConfig;
            
        } catch (error) {
            console.error(`❌ Failed to update reasoning config for session ${sessionId}:`, error);
            throw error;
        }
    }
    
    /**
     * 🗑️ DELETE SESSION
     */
    async deleteSession(sessionId) {
        try {
            const session = this.activeSessions.get(sessionId);
            if (!session) {
                console.warn(`Session ${sessionId} not found for deletion`);
                return false;
            }
            
            // Remove from memory
            this.activeSessions.delete(sessionId);
            this.reasoningConfigs.delete(sessionId);
            this.sessionMetrics.delete(sessionId);
            
            // Remove from database
            if (this.dbInitialized) {
                await this.dbPool.query(`
                    UPDATE chat_sessions 
                    SET is_active = false, updated_at = CURRENT_TIMESTAMP
                    WHERE session_id = $1
                `, [sessionId]);
            }
            
            // Update metrics
            this.metrics.activeSessions = this.activeSessions.size;
            
            // Emit session deleted event
            this.emit('sessionDeleted', {
                sessionId,
                activeSessions: this.activeSessions.size
            });
            
            console.log(`🗑️ Deleted session ${sessionId}`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Failed to delete session ${sessionId}:`, error);
            throw error;
        }
    }
    
    /**
     * 📊 GET ALL ACTIVE SESSIONS
     */
    getAllSessions() {
        const sessions = [];
        
        for (const [sessionId, sessionData] of this.activeSessions) {
            sessions.push({
                sessionId,
                title: sessionData.title,
                target: sessionData.target,
                createdAt: sessionData.createdAt,
                lastActivity: sessionData.lastActivity,
                messageCount: sessionData.messageCount,
                metrics: this.sessionMetrics.get(sessionId)
            });
        }
        
        return sessions.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    }
    
    /**
     * 🧹 CLEANUP EXPIRED SESSIONS
     */
    async cleanupExpiredSessions() {
        const expiredSessions = [];
        const now = Date.now();
        const timeoutMs = this.config.sessionTimeoutMinutes * 60 * 1000;
        
        for (const [sessionId, sessionData] of this.activeSessions) {
            const lastActivity = new Date(sessionData.lastActivity).getTime();
            if (now - lastActivity > timeoutMs) {
                expiredSessions.push(sessionId);
            }
        }
        
        console.log(`🧹 Cleaning up ${expiredSessions.length} expired sessions`);
        
        for (const sessionId of expiredSessions) {
            await this.deleteSession(sessionId);
        }
        
        return expiredSessions.length;
    }
    
    /**
     * ⏰ START CLEANUP TIMER
     */
    startCleanupTimer() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        const intervalMs = this.config.cleanupIntervalMinutes * 60 * 1000;
        
        this.cleanupTimer = setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
            } catch (error) {
                console.error('❌ Session cleanup failed:', error);
            }
        }, intervalMs);
        
        console.log(`⏰ Started session cleanup timer (${this.config.cleanupIntervalMinutes} minutes)`);
    }
    
    /**
     * 📈 GET SESSION METRICS
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeSessions: this.activeSessions.size,
            sessionsByTarget: Object.fromEntries(this.metrics.sessionsByTarget),
            reasoningMethodUsage: Object.fromEntries(this.metrics.reasoningMethodUsage)
        };
    }
    
    /**
     * ⚙️ GET DEFAULT REASONING CONFIG
     */
    getDefaultReasoningConfig() {
        return {
            method: 'CoT', // Chain of Thought
            temperature: 0.7,
            maxTokens: 2000,
            detailLevel: 'balanced',
            confidenceThreshold: 0.7,
            creativityLevel: 0.5,
            planningDepth: 3,
            enableDeepResearch: false,
            enableCreativity: true,
            enableFineTuning: false
        };
    }
    
    /**
     * 🔄 SHUTDOWN SESSION MANAGER
     */
    async shutdown() {
        console.log('🔄 Shutting down Chat Session Manager...');
        
        // Clear cleanup timer
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }
        
        // Save active sessions to database
        if (this.dbInitialized && this.activeSessions.size > 0) {
            console.log(`💾 Saving ${this.activeSessions.size} active sessions to database...`);
            // Sessions are already persisted via real-time updates
        }
        
        // Clear memory
        this.activeSessions.clear();
        this.sessionMetrics.clear();
        this.reasoningConfigs.clear();
        
        // Remove all listeners
        this.removeAllListeners();
        
        console.log('✅ Chat Session Manager shutdown complete');
    }
}

// Export singleton instance
let sessionManagerInstance = null;

export function getChatSessionManager(config) {
    if (!sessionManagerInstance) {
        sessionManagerInstance = new ChatSessionManager(config);
    }
    return sessionManagerInstance;
}

export default ChatSessionManager;
