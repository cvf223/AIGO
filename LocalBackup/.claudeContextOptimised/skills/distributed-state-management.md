# Distributed State Management Implementation

## Overview

This skill provides production-ready distributed state management for the AIGO-Syndicate construction intelligence system. It includes PostgreSQL state storage, optimistic locking, event sourcing, CQRS patterns, and comprehensive conflict resolution.

## Core Implementation

### Distributed State Manager

```javascript
// distributed-state-manager.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { diff, applyPatch } from 'rfc6902';

export class DistributedStateManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Database configuration
            connectionString: config.connectionString || process.env.DATABASE_URL,
            maxConnections: config.maxConnections || 50,
            
            // State configuration
            stateTimeout: config.stateTimeout || 300000, // 5 minutes
            conflictResolution: config.conflictResolution || 'last-write-wins',
            enableEventSourcing: config.enableEventSourcing !== false,
            enableCQRS: config.enableCQRS !== false,
            
            // Performance
            cacheEnabled: config.cacheEnabled !== false,
            cacheTTL: config.cacheTTL || 60000, // 1 minute
            batchSize: config.batchSize || 100,
            
            // Sync configuration
            syncInterval: config.syncInterval || 5000,
            maxRetries: config.maxRetries || 3,
            
            ...config
        };
        
        this.dbPool = null;
        this.stateCache = new Map();
        this.pendingWrites = new Map();
        this.eventStore = [];
        this.projections = new Map();
        this.locks = new Map();
        this.subscribers = new Map();
        
        // Metrics
        this.metrics = {
            reads: 0,
            writes: 0,
            conflicts: 0,
            cacheHits: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Create schemas
            await this.createSchemas();
            
            // Start sync process
            this.startSyncProcess();
            
            // Initialize CQRS if enabled
            if (this.config.enableCQRS) {
                await this.initializeCQRS();
            }
            
            this.emit('initialized');
            console.log('Distributed State Manager initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: this.config.connectionString,
            max: this.config.maxConnections,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            application_name: 'distributed_state_manager'
        });
        
        // Test connection
        const client = await this.dbPool.connect();
        try {
            await client.query('SELECT 1');
        } finally {
            client.release();
        }
    }
    
    async createSchemas() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // State storage table
            await client.query(`
                CREATE TABLE IF NOT EXISTS distributed_state (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    key VARCHAR(500) UNIQUE NOT NULL,
                    value JSONB NOT NULL,
                    version INTEGER NOT NULL DEFAULT 1,
                    checksum VARCHAR(64) NOT NULL,
                    locked_by UUID,
                    locked_until TIMESTAMPTZ,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_state_key ON distributed_state(key);
                CREATE INDEX IF NOT EXISTS idx_state_locked ON distributed_state(locked_by, locked_until);
            `);
            
            // Event store table (for event sourcing)
            await client.query(`
                CREATE TABLE IF NOT EXISTS state_events (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    aggregate_id VARCHAR(500) NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    event_data JSONB NOT NULL,
                    event_metadata JSONB DEFAULT '{}'::jsonb,
                    version INTEGER NOT NULL,
                    timestamp TIMESTAMPTZ DEFAULT NOW(),
                    actor_id VARCHAR(200)
                );
                
                CREATE INDEX IF NOT EXISTS idx_events_aggregate 
                ON state_events(aggregate_id, version);
                
                CREATE INDEX IF NOT EXISTS idx_events_timestamp 
                ON state_events(timestamp DESC);
            `);
            
            // Command store (for CQRS)
            await client.query(`
                CREATE TABLE IF NOT EXISTS state_commands (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    command_type VARCHAR(100) NOT NULL,
                    command_data JSONB NOT NULL,
                    status VARCHAR(50) NOT NULL DEFAULT 'pending',
                    result JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    processed_at TIMESTAMPTZ,
                    error TEXT
                );
                
                CREATE INDEX IF NOT EXISTS idx_commands_status 
                ON state_commands(status, created_at);
            `);
            
            // Projection tables (for CQRS read models)
            await client.query(`
                CREATE TABLE IF NOT EXISTS state_projections (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    projection_name VARCHAR(100) NOT NULL,
                    projection_key VARCHAR(500) NOT NULL,
                    projection_data JSONB NOT NULL,
                    last_event_version INTEGER NOT NULL DEFAULT 0,
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_projection UNIQUE(projection_name, projection_key)
                );
                
                CREATE INDEX IF NOT EXISTS idx_projections 
                ON state_projections(projection_name, projection_key);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // State Operations
    
    async get(key, options = {}) {
        this.metrics.reads++;
        
        try {
            // Check cache first
            if (this.config.cacheEnabled && !options.skipCache) {
                const cached = this.getCached(key);
                if (cached) {
                    this.metrics.cacheHits++;
                    return cached;
                }
            }
            
            // Read from database
            const client = await this.dbPool.connect();
            try {
                const result = await client.query(`
                    SELECT value, version, locked_by, locked_until, checksum
                    FROM distributed_state
                    WHERE key = $1
                `, [key]);
                
                if (result.rows.length === 0) {
                    return null;
                }
                
                const row = result.rows[0];
                
                // Check if locked
                if (row.locked_by && new Date(row.locked_until) > new Date()) {
                    if (options.waitForLock) {
                        return this.waitForLock(key, options.waitTimeout);
                    } else if (!options.ignoreLock) {
                        throw new Error(`State key ${key} is locked`);
                    }
                }
                
                // Verify checksum
                const calculatedChecksum = this.calculateChecksum(row.value);
                if (calculatedChecksum !== row.checksum) {
                    throw new Error(`Checksum mismatch for key ${key}`);
                }
                
                // Cache the value
                if (this.config.cacheEnabled) {
                    this.setCache(key, row.value, row.version);
                }
                
                return {
                    value: row.value,
                    version: row.version
                };
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            this.handleError('get', error);
            throw error;
        }
    }
    
    async set(key, value, options = {}) {
        this.metrics.writes++;
        
        try {
            // Apply optimistic locking if version provided
            if (options.version !== undefined) {
                return this.setWithVersion(key, value, options.version, options);
            }
            
            // Event sourcing
            if (this.config.enableEventSourcing) {
                await this.appendEvent(key, 'state_changed', {
                    oldValue: await this.get(key),
                    newValue: value
                }, options.actor);
            }
            
            // Standard set operation
            const client = await this.dbPool.connect();
            try {
                const checksum = this.calculateChecksum(value);
                
                const result = await client.query(`
                    INSERT INTO distributed_state (key, value, checksum, version)
                    VALUES ($1, $2, $3, 1)
                    ON CONFLICT (key) DO UPDATE SET
                        value = EXCLUDED.value,
                        checksum = EXCLUDED.checksum,
                        version = distributed_state.version + 1,
                        updated_at = NOW()
                    RETURNING version
                `, [key, JSON.stringify(value), checksum]);
                
                const version = result.rows[0].version;
                
                // Update cache
                if (this.config.cacheEnabled) {
                    this.setCache(key, value, version);
                }
                
                // Emit update event
                this.emit('state_updated', { key, value, version });
                
                // Update projections if CQRS enabled
                if (this.config.enableCQRS) {
                    await this.updateProjections(key, value);
                }
                
                return { success: true, version };
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            this.handleError('set', error);
            throw error;
        }
    }
    
    async setWithVersion(key, value, expectedVersion, options = {}) {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Get current state
            const current = await client.query(`
                SELECT version, value FROM distributed_state
                WHERE key = $1 FOR UPDATE
            `, [key]);
            
            if (current.rows.length === 0) {
                throw new Error(`Key ${key} not found`);
            }
            
            const currentVersion = current.rows[0].version;
            
            // Check version match
            if (currentVersion !== expectedVersion) {
                await client.query('ROLLBACK');
                
                // Handle conflict
                if (this.config.conflictResolution === 'merge') {
                    return this.mergeConflict(key, current.rows[0].value, value, options);
                } else if (this.config.conflictResolution === 'retry') {
                    return this.retryWithBackoff(
                        () => this.setWithVersion(key, value, currentVersion, options),
                        options.retries || this.config.maxRetries
                    );
                } else {
                    // last-write-wins or error
                    this.metrics.conflicts++;
                    throw new Error(`Version mismatch for key ${key}: expected ${expectedVersion}, got ${currentVersion}`);
                }
            }
            
            // Update state
            const checksum = this.calculateChecksum(value);
            const result = await client.query(`
                UPDATE distributed_state
                SET value = $1,
                    checksum = $2,
                    version = version + 1,
                    updated_at = NOW()
                WHERE key = $3
                RETURNING version
            `, [JSON.stringify(value), checksum, key]);
            
            await client.query('COMMIT');
            
            const newVersion = result.rows[0].version;
            
            // Update cache
            if (this.config.cacheEnabled) {
                this.setCache(key, value, newVersion);
            }
            
            return { success: true, version: newVersion };
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async delete(key) {
        try {
            // Event sourcing
            if (this.config.enableEventSourcing) {
                await this.appendEvent(key, 'state_deleted', {
                    deletedValue: await this.get(key)
                });
            }
            
            const client = await this.dbPool.connect();
            try {
                await client.query(`
                    DELETE FROM distributed_state
                    WHERE key = $1
                `, [key]);
                
                // Clear cache
                this.clearCache(key);
                
                // Emit delete event
                this.emit('state_deleted', { key });
                
                return { success: true };
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            this.handleError('delete', error);
            throw error;
        }
    }
    
    // Locking Operations
    
    async acquireLock(key, lockId = null, duration = 30000) {
        const actualLockId = lockId || uuidv4();
        const lockUntil = new Date(Date.now() + duration);
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                UPDATE distributed_state
                SET locked_by = $1,
                    locked_until = $2
                WHERE key = $3
                  AND (locked_until IS NULL OR locked_until < NOW())
                RETURNING key
            `, [actualLockId, lockUntil, key]);
            
            if (result.rows.length === 0) {
                return { success: false, lockId: null };
            }
            
            // Store lock info
            this.locks.set(actualLockId, {
                key,
                acquiredAt: Date.now(),
                duration
            });
            
            return { success: true, lockId: actualLockId };
            
        } finally {
            client.release();
        }
    }
    
    async releaseLock(lockId) {
        const lockInfo = this.locks.get(lockId);
        if (!lockInfo) {
            return { success: false };
        }
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE distributed_state
                SET locked_by = NULL,
                    locked_until = NULL
                WHERE key = $1 AND locked_by = $2
            `, [lockInfo.key, lockId]);
            
            this.locks.delete(lockId);
            
            return { success: true };
            
        } finally {
            client.release();
        }
    }
    
    async waitForLock(key, timeout = 30000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const state = await this.get(key, { ignoreLock: true });
            
            if (!state || !state.lockedUntil || new Date(state.lockedUntil) <= new Date()) {
                return state;
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`Timeout waiting for lock on key ${key}`);
    }
    
    // Event Sourcing
    
    async appendEvent(aggregateId, eventType, eventData, actorId = null) {
        if (!this.config.enableEventSourcing) return;
        
        const client = await this.dbPool.connect();
        try {
            // Get next version
            const versionResult = await client.query(`
                SELECT COALESCE(MAX(version), 0) + 1 as next_version
                FROM state_events
                WHERE aggregate_id = $1
            `, [aggregateId]);
            
            const version = versionResult.rows[0].next_version;
            
            // Insert event
            const event = await client.query(`
                INSERT INTO state_events 
                (aggregate_id, event_type, event_data, version, actor_id)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [aggregateId, eventType, JSON.stringify(eventData), version, actorId]);
            
            // Store in memory
            this.eventStore.push(event.rows[0]);
            
            // Emit event
            this.emit('event_appended', event.rows[0]);
            
            return event.rows[0];
            
        } finally {
            client.release();
        }
    }
    
    async getEvents(aggregateId, fromVersion = 0) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT * FROM state_events
                WHERE aggregate_id = $1 AND version > $2
                ORDER BY version ASC
            `, [aggregateId, fromVersion]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async replayEvents(aggregateId, handler) {
        const events = await this.getEvents(aggregateId);
        
        let state = {};
        
        for (const event of events) {
            state = await handler(state, event);
        }
        
        return state;
    }
    
    // CQRS Implementation
    
    async initializeCQRS() {
        // Register default command handlers
        this.registerCommandHandler('update_state', this.handleUpdateStateCommand.bind(this));
        this.registerCommandHandler('delete_state', this.handleDeleteStateCommand.bind(this));
        
        // Start command processor
        this.startCommandProcessor();
    }
    
    async executeCommand(commandType, commandData) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                INSERT INTO state_commands (command_type, command_data)
                VALUES ($1, $2)
                RETURNING id
            `, [commandType, JSON.stringify(commandData)]);
            
            const commandId = result.rows[0].id;
            
            // Emit command for immediate processing
            this.emit('command_created', { id: commandId, type: commandType, data: commandData });
            
            return commandId;
            
        } finally {
            client.release();
        }
    }
    
    registerCommandHandler(commandType, handler) {
        if (!this.commandHandlers) {
            this.commandHandlers = new Map();
        }
        this.commandHandlers.set(commandType, handler);
    }
    
    async handleUpdateStateCommand(command) {
        const { key, value } = command.command_data;
        return this.set(key, value);
    }
    
    async handleDeleteStateCommand(command) {
        const { key } = command.command_data;
        return this.delete(key);
    }
    
    startCommandProcessor() {
        setInterval(async () => {
            try {
                await this.processCommands();
            } catch (error) {
                this.handleError('command_processor', error);
            }
        }, 1000);
    }
    
    async processCommands() {
        const client = await this.dbPool.connect();
        try {
            // Get pending commands
            const commands = await client.query(`
                SELECT * FROM state_commands
                WHERE status = 'pending'
                ORDER BY created_at ASC
                LIMIT $1
            `, [this.config.batchSize]);
            
            for (const command of commands.rows) {
                await this.processCommand(command);
            }
            
        } finally {
            client.release();
        }
    }
    
    async processCommand(command) {
        const handler = this.commandHandlers?.get(command.command_type);
        
        if (!handler) {
            await this.updateCommandStatus(command.id, 'failed', null, `Unknown command type: ${command.command_type}`);
            return;
        }
        
        try {
            const result = await handler(command);
            await this.updateCommandStatus(command.id, 'completed', result);
        } catch (error) {
            await this.updateCommandStatus(command.id, 'failed', null, error.message);
        }
    }
    
    async updateCommandStatus(commandId, status, result = null, error = null) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE state_commands
                SET status = $1,
                    result = $2,
                    error = $3,
                    processed_at = NOW()
                WHERE id = $4
            `, [status, result ? JSON.stringify(result) : null, error, commandId]);
        } finally {
            client.release();
        }
    }
    
    // Projections
    
    async createProjection(projectionName, key, data) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO state_projections (projection_name, projection_key, projection_data)
                VALUES ($1, $2, $3)
                ON CONFLICT (projection_name, projection_key) DO UPDATE SET
                    projection_data = EXCLUDED.projection_data,
                    updated_at = NOW()
            `, [projectionName, key, JSON.stringify(data)]);
        } finally {
            client.release();
        }
    }
    
    async getProjection(projectionName, key) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT projection_data FROM state_projections
                WHERE projection_name = $1 AND projection_key = $2
            `, [projectionName, key]);
            
            return result.rows[0]?.projection_data;
            
        } finally {
            client.release();
        }
    }
    
    async updateProjections(key, value) {
        // Example: Update user summary projection
        if (key.startsWith('user:')) {
            const userId = key.split(':')[1];
            await this.createProjection('user_summary', userId, {
                id: userId,
                lastUpdate: new Date(),
                ...value
            });
        }
    }
    
    // Conflict Resolution
    
    async mergeConflict(key, currentValue, newValue, options = {}) {
        this.metrics.conflicts++;
        
        // Calculate patches
        const patches = diff(currentValue, newValue);
        
        // Apply custom merge strategy
        if (options.mergeStrategy) {
            return options.mergeStrategy(currentValue, newValue, patches);
        }
        
        // Default: apply non-conflicting patches
        try {
            const merged = JSON.parse(JSON.stringify(currentValue));
            applyPatch(merged, patches);
            
            return this.set(key, merged);
        } catch (error) {
            // If merge fails, use last-write-wins
            return this.set(key, newValue);
        }
    }
    
    // Sync Process
    
    startSyncProcess() {
        // Sync pending writes
        setInterval(async () => {
            try {
                await this.syncPendingWrites();
            } catch (error) {
                this.handleError('sync', error);
            }
        }, this.config.syncInterval);
        
        // Clean expired locks
        setInterval(async () => {
            try {
                await this.cleanExpiredLocks();
            } catch (error) {
                this.handleError('lock_cleanup', error);
            }
        }, 60000);
    }
    
    async syncPendingWrites() {
        if (this.pendingWrites.size === 0) return;
        
        const writes = Array.from(this.pendingWrites.entries());
        this.pendingWrites.clear();
        
        for (const [key, { value, options }] of writes) {
            try {
                await this.set(key, value, options);
            } catch (error) {
                // Re-add to pending if failed
                this.pendingWrites.set(key, { value, options });
            }
        }
    }
    
    async cleanExpiredLocks() {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE distributed_state
                SET locked_by = NULL,
                    locked_until = NULL
                WHERE locked_until < NOW()
            `);
        } finally {
            client.release();
        }
    }
    
    // Cache Management
    
    getCached(key) {
        const cached = this.stateCache.get(key);
        if (!cached) return null;
        
        if (Date.now() - cached.timestamp > this.config.cacheTTL) {
            this.stateCache.delete(key);
            return null;
        }
        
        return {
            value: cached.value,
            version: cached.version
        };
    }
    
    setCache(key, value, version) {
        this.stateCache.set(key, {
            value,
            version,
            timestamp: Date.now()
        });
    }
    
    clearCache(key = null) {
        if (key) {
            this.stateCache.delete(key);
        } else {
            this.stateCache.clear();
        }
    }
    
    // Utility Methods
    
    calculateChecksum(value) {
        const json = JSON.stringify(value);
        return crypto.createHash('sha256').update(json).digest('hex');
    }
    
    async retryWithBackoff(operation, maxRetries) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                const delay = Math.min(1000 * Math.pow(2, i), 10000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }
    
    // Subscription Management
    
    subscribe(pattern, callback) {
        const id = uuidv4();
        
        if (!this.subscribers.has(pattern)) {
            this.subscribers.set(pattern, new Map());
        }
        
        this.subscribers.get(pattern).set(id, callback);
        
        return {
            unsubscribe: () => {
                this.subscribers.get(pattern)?.delete(id);
            }
        };
    }
    
    notifySubscribers(key, event) {
        for (const [pattern, callbacks] of this.subscribers) {
            if (this.matchesPattern(key, pattern)) {
                for (const callback of callbacks.values()) {
                    callback(event);
                }
            }
        }
    }
    
    matchesPattern(key, pattern) {
        // Simple pattern matching (can be enhanced)
        if (pattern === '*') return true;
        if (pattern.endsWith('*')) {
            return key.startsWith(pattern.slice(0, -1));
        }
        return key === pattern;
    }
    
    // Metrics and Monitoring
    
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.stateCache.size,
            pendingWrites: this.pendingWrites.size,
            activeLocks: this.locks.size,
            cacheHitRate: this.metrics.reads > 0 
                ? this.metrics.cacheHits / this.metrics.reads 
                : 0
        };
    }
    
    // Error Handling
    
    handleError(context, error) {
        console.error(`Distributed State error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    // Shutdown
    
    async shutdown() {
        console.log('Shutting down Distributed State Manager');
        
        // Sync final writes
        await this.syncPendingWrites();
        
        // Release all locks
        for (const lockId of this.locks.keys()) {
            await this.releaseLock(lockId);
        }
        
        // Close database pool
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        this.emit('shutdown');
    }
}

// Export factory function
export function createStateManager(config) {
    return new DistributedStateManager(config);
}
```

### Usage Example

```javascript
// state-usage.js
import { createStateManager } from './distributed-state-manager.js';

async function main() {
    const stateManager = createStateManager({
        enableEventSourcing: true,
        enableCQRS: true,
        conflictResolution: 'merge'
    });
    
    await stateManager.initialize();
    
    // Basic operations
    await stateManager.set('project:123', {
        name: 'Construction Project',
        status: 'active',
        budget: 5000000
    });
    
    const state = await stateManager.get('project:123');
    console.log('Project state:', state);
    
    // Optimistic locking
    const { version } = await stateManager.get('project:123');
    await stateManager.set('project:123', 
        { ...state.value, status: 'completed' },
        { version }
    );
    
    // Distributed locking
    const lock = await stateManager.acquireLock('project:123');
    if (lock.success) {
        // Perform operations while holding lock
        await stateManager.set('project:123', { ...state.value, locked: true });
        await stateManager.releaseLock(lock.lockId);
    }
    
    // Event sourcing
    await stateManager.appendEvent('project:123', 'budget_updated', {
        oldBudget: 5000000,
        newBudget: 5500000,
        reason: 'Scope change'
    });
    
    // Replay events
    const projectState = await stateManager.replayEvents('project:123', 
        (state, event) => {
            if (event.event_type === 'budget_updated') {
                state.budget = event.event_data.newBudget;
            }
            return state;
        }
    );
    
    // CQRS commands
    const commandId = await stateManager.executeCommand('update_state', {
        key: 'project:123',
        value: { status: 'on-hold' }
    });
    
    // Subscriptions
    const subscription = stateManager.subscribe('project:*', (event) => {
        console.log('Project updated:', event);
    });
}

main();
```

### Construction Integration

```javascript
// construction-state-integration.js
import { createStateManager } from './distributed-state-manager.js';
import { DatabasePoolManager } from '../core/DatabasePoolManager.js';

export class ConstructionStateService {
    constructor() {
        this.stateManager = null;
        this.dbPool = DatabasePoolManager.getInstance();
    }
    
    async initialize() {
        this.stateManager = createStateManager({
            enableEventSourcing: true,
            enableCQRS: true,
            conflictResolution: 'custom',
            cacheEnabled: true,
            cacheTTL: 300000 // 5 minutes
        });
        
        await this.stateManager.initialize();
        await this.registerConstructionHandlers();
        await this.setupProjections();
    }
    
    async registerConstructionHandlers() {
        // Register custom merge strategy for construction data
        this.stateManager.config.mergeStrategy = this.constructionMergeStrategy.bind(this);
        
        // Register CQRS command handlers
        this.stateManager.registerCommandHandler('update_project', async (command) => {
            const { projectId, updates } = command.command_data;
            
            // Get current state
            const current = await this.stateManager.get(`project:${projectId}`);
            if (!current) throw new Error('Project not found');
            
            // Apply updates with validation
            const updated = await this.applyProjectUpdates(current.value, updates);
            
            // Store with event sourcing
            await this.stateManager.set(`project:${projectId}`, updated);
            
            // Create event
            await this.stateManager.appendEvent(`project:${projectId}`, 
                'project_updated',
                { updates, timestamp: Date.now() }
            );
            
            return { success: true, projectId };
        });
        
        // Register event handlers for projections
        this.stateManager.on('event_appended', async (event) => {
            await this.updateConstructionProjections(event);
        });
    }
    
    async setupProjections() {
        // Project summary projection
        this.stateManager.subscribe('project:*', async (event) => {
            if (event.key.startsWith('project:')) {
                const projectId = event.key.split(':')[1];
                await this.updateProjectSummary(projectId);
            }
        });
        
        // Cost tracking projection
        this.stateManager.subscribe('cost:*', async (event) => {
            if (event.key.startsWith('cost:')) {
                const projectId = event.key.split(':')[1];
                await this.updateCostProjection(projectId);
            }
        });
    }
    
    constructionMergeStrategy(current, incoming, patches) {
        // Custom merge logic for construction data
        const merged = JSON.parse(JSON.stringify(current));
        
        for (const patch of patches) {
            // Special handling for certain fields
            if (patch.path.includes('budget')) {
                // Don't allow budget to decrease without approval
                if (patch.op === 'replace' && patch.value < current.budget) {
                    continue; // Skip this patch
                }
            }
            
            if (patch.path.includes('status')) {
                // Validate status transitions
                if (!this.isValidStatusTransition(current.status, patch.value)) {
                    continue; // Skip invalid transition
                }
            }
            
            // Apply valid patches
            try {
                applyPatch(merged, [patch]);
            } catch (error) {
                console.warn('Failed to apply patch:', patch, error);
            }
        }
        
        return merged;
    }
    
    isValidStatusTransition(from, to) {
        const transitions = {
            'planning': ['active', 'cancelled'],
            'active': ['on-hold', 'completed', 'cancelled'],
            'on-hold': ['active', 'cancelled'],
            'completed': ['closed'],
            'cancelled': [],
            'closed': []
        };
        
        return transitions[from]?.includes(to) || false;
    }
    
    async applyProjectUpdates(current, updates) {
        const updated = { ...current, ...updates };
        
        // Validate updates
        if (updates.budget && updates.budget > current.budget * 1.5) {
            throw new Error('Budget increase exceeds 50% threshold');
        }
        
        if (updates.completionDate) {
            const date = new Date(updates.completionDate);
            if (date < new Date(current.startDate)) {
                throw new Error('Completion date cannot be before start date');
            }
        }
        
        updated.lastModified = new Date();
        updated.version = (current.version || 0) + 1;
        
        return updated;
    }
    
    async updateConstructionProjections(event) {
        switch (event.event_type) {
            case 'project_updated':
                await this.updateProjectMetrics(event.aggregate_id);
                break;
                
            case 'cost_recorded':
                await this.updateCostAnalytics(event.aggregate_id);
                break;
                
            case 'milestone_completed':
                await this.updateProgressTracking(event.aggregate_id);
                break;
        }
    }
    
    async updateProjectSummary(projectId) {
        const state = await this.stateManager.get(`project:${projectId}`);
        if (!state) return;
        
        const summary = {
            id: projectId,
            name: state.value.name,
            status: state.value.status,
            budget: state.value.budget,
            spent: await this.calculateSpent(projectId),
            progress: await this.calculateProgress(projectId),
            risks: await this.assessRisks(projectId),
            lastUpdate: new Date()
        };
        
        await this.stateManager.createProjection('project_summary', projectId, summary);
    }
    
    async getDistributedProjectState(projectId) {
        // Get from multiple sources
        const [mainState, costState, scheduleState] = await Promise.all([
            this.stateManager.get(`project:${projectId}`),
            this.stateManager.get(`cost:${projectId}`),
            this.stateManager.get(`schedule:${projectId}`)
        ]);
        
        // Get projections
        const summary = await this.stateManager.getProjection('project_summary', projectId);
        
        // Combine into comprehensive state
        return {
            project: mainState?.value,
            cost: costState?.value,
            schedule: scheduleState?.value,
            summary,
            version: mainState?.version
        };
    }
}
```

## Testing

```javascript
// state-manager.test.js
import { describe, test, expect, beforeEach } from '@jest/globals';
import { createStateManager } from './distributed-state-manager.js';

describe('DistributedStateManager', () => {
    let stateManager;
    
    beforeEach(async () => {
        stateManager = createStateManager({
            cacheEnabled: true,
            enableEventSourcing: true
        });
        await stateManager.initialize();
    });
    
    test('should handle basic CRUD operations', async () => {
        const key = 'test:1';
        const value = { data: 'test' };
        
        // Set
        await stateManager.set(key, value);
        
        // Get
        const result = await stateManager.get(key);
        expect(result.value).toEqual(value);
        expect(result.version).toBe(1);
        
        // Update
        await stateManager.set(key, { data: 'updated' });
        const updated = await stateManager.get(key);
        expect(updated.version).toBe(2);
        
        // Delete
        await stateManager.delete(key);
        const deleted = await stateManager.get(key);
        expect(deleted).toBeNull();
    });
    
    test('should handle optimistic locking', async () => {
        const key = 'test:lock';
        
        await stateManager.set(key, { value: 1 });
        const { version } = await stateManager.get(key);
        
        // Update with correct version
        await stateManager.set(key, { value: 2 }, { version });
        
        // Update with old version should fail
        await expect(
            stateManager.set(key, { value: 3 }, { version })
        ).rejects.toThrow('Version mismatch');
    });
    
    test('should handle distributed locking', async () => {
        const key = 'test:distributed';
        await stateManager.set(key, { locked: false });
        
        // Acquire lock
        const lock1 = await stateManager.acquireLock(key);
        expect(lock1.success).toBe(true);
        
        // Second lock should fail
        const lock2 = await stateManager.acquireLock(key);
        expect(lock2.success).toBe(false);
        
        // Release lock
        await stateManager.releaseLock(lock1.lockId);
        
        // Now lock should succeed
        const lock3 = await stateManager.acquireLock(key);
        expect(lock3.success).toBe(true);
    });
    
    test('should handle event sourcing', async () => {
        const aggregateId = 'test:events';
        
        // Append events
        await stateManager.appendEvent(aggregateId, 'created', { name: 'Test' });
        await stateManager.appendEvent(aggregateId, 'updated', { status: 'active' });
        
        // Replay events
        const state = await stateManager.replayEvents(aggregateId, (state, event) => {
            if (event.event_type === 'created') {
                return { ...state, ...event.event_data };
            }
            if (event.event_type === 'updated') {
                return { ...state, ...event.event_data };
            }
            return state;
        });
        
        expect(state).toEqual({ name: 'Test', status: 'active' });
    });
});
```

This implementation provides comprehensive distributed state management with optimistic locking, event sourcing, CQRS patterns, and robust conflict resolution for the construction syndicate system.
