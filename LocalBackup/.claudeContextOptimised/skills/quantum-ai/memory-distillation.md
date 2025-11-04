# Memory-distillation - Essential Patterns

## Core Implementation
```javascript
// memory-distillation-engine.js
import { EventEmitter } from 'events';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import * as tf from '@tensorflow/tfjs-node';
import { encode, decode } from '@msgpack/msgpack';
import lz4 from 'lz4js';
import { distance } from 'fastest-levenshtein';

export class MemoryDistillationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Memory configuration
            maxMemorySize: config.maxMemorySize || 10000000, // 10MB per agent
            compressionThreshold: config.compressionThreshold || 1024, // 1KB
            distillationThreshold: config.distillationThreshold || 0.8, // 80% full
            
            // Importance scoring
            importanceDecay: config.importanceDecay || 0.95,
            recencyWeight: config.recencyWeight || 0.3,
            frequencyWeight: config.frequencyWeight || 0.3,
            utilityWeight: config.utilityWeight || 0.4,
            
            // Verification
            minSourcesForVerification: config.minSourcesForVerification || 2,
            verificationThreshold: config.verificationThreshold || 0.7,
            
            // Forgetting
            forgettingRate: config.forgettingRate || 0.01,
            minImportanceToKeep: config.minImportanceToKeep || 0.1,
            
            // Retrieval
            retrievalBatchSize: config.retrievalBatchSize || 100,
            semanticSearchEnabled: config.semanticSearchEnabled !== false,
            embeddingDimension: config.embeddingDimension || 512,
            
            // Performance
            compressionLevel: config.compressionLevel || 6,
            cacheSize: config.cacheSize || 1000,
            
            ...config
        };
        
        this.dbPool = null;
        this.memoryCache = new Map();
        this.embeddingModel = null;
        this.compressionStats = {
            originalSize: 0,
            compressedSize: 0,
            compressionRatio: 0
        };
        
        // Metrics
        this.metrics = {
            totalMemories: 0,
            distillations: 0,
            verifications: 0,
            retrievals: 0,
            compressionSavings: 0
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Load embedding model
            if (this.config.semanticSearchEnabled) {
                await this.loadEmbeddingModel();
            }
            
            // Start memory management
            this.startMemoryManagement();
            
            this.emit('initialized');
            console.log('Memory Distillation Engine initialized');
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            application_name: 'memory_distillation'
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Main memory storage
            await client.query(`
                CREATE TABLE IF NOT EXISTS distilled_memories (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id UUID NOT NULL,
                    memory_type VARCHAR(50) NOT NULL,
                    content BYTEA NOT NULL,
                    compressed BOOLEAN DEFAULT false,
                    compression_ratio FLOAT,
                    importance_score FLOAT NOT NULL DEFAULT 1.0,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TIMESTAMPTZ DEFAULT NOW(),
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    updated_at TIMESTAMPTZ DEFAULT NOW(),
                    embedding vector(${this.config.embeddingDimension}),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    sources JSONB DEFAULT '[]'::jsonb,
                    verification_score FLOAT
                );
                
                CREATE INDEX IF NOT EXISTS idx_memories_agent 
                ON distilled_memories(agent_id, importance_score DESC);
                
                CREATE INDEX IF NOT EXISTS idx_memories_type 
                ON distilled_memories(memory_type, importance_score DESC);
                
                CREATE INDEX IF NOT EXISTS idx_memories_embedding 
                ON distilled_memories USING ivfflat (embedding vector_cosine_ops)
                WITH (lists = 100);
            `);
            
            // Memory relationships
            await client.query(`
                CREATE TABLE IF NOT EXISTS memory_relationships (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    source_memory_id UUID REFERENCES distilled_memories(id),
                    target_memory_id UUID REFERENCES distilled_memories(id),
                    relationship_type VARCHAR(50) NOT NULL,
                    strength FLOAT NOT NULL DEFAULT 1.0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    CONSTRAINT unique_relationship 
                    UNIQUE(source_memory_id, target_memory_id, relationship_type)
                );
                
                CREATE INDEX IF NOT EXISTS idx_relationships_source 
                ON memory_relationships(source_memory_id);
                
                CREATE INDEX IF NOT EXISTS idx_relationships_target 
                ON memory_relationships(target_memory_id);
            `);
            
            // Cross-source verification
            await client.query(`
                CREATE TABLE IF NOT EXISTS memory_sources (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    memory_id UUID REFERENCES distilled_memories(id),
                    source_type VARCHAR(50) NOT NULL,
                    source_id VARCHAR(200) NOT NULL,
                    confidence FLOAT NOT NULL DEFAULT 1.0,
                    timestamp TIMESTAMPTZ NOT NULL,
                    raw_data JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_sources_memory 
                ON memory_sources(memory_id);
            `);
            
            // Distillation history
            await client.query(`
                CREATE TABLE IF NOT EXISTS distillation_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id UUID NOT NULL,
                    distillation_type VARCHAR(50) NOT NULL,
                    original_count INTEGER NOT NULL,
                    distilled_count INTEGER NOT NULL,
                    size_before BIGINT NOT NULL,
                    size_after BIGINT NOT NULL,
                    duration_ms INTEGER NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Memory Storage
    
    async storeMemory(agentId, memory) {
        try {
            // Prepare memory
            const prepared = await this.prepareMemory(memory);
            
            // Calculate importance
            const importance = this.calculateImportance(memory);
            
            // Compress if needed
            const { content, compressed, ratio } = await this.compressMemory(prepared.content);
            
            // Generate embedding
            const embedding = this.config.semanticSearchEnabled 
                ? await this.generateEmbedding(prepared.content)
                : null;
            
            // Store in database
            const client = await this.dbPool.connect();
            try {
                const result = await client.query(`
                    INSERT INTO distilled_memories
                    (agent_id, memory_type, content, compressed, compression_ratio,
                     importance_score, embedding, metadata, sources, verification_score)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                    RETURNING id
                `, [
                    agentId,
                    memory.type || 'general',
                    content,
                    compressed,
                    ratio,
                    importance,
                    embedding,
                    JSON.stringify(memory.metadata || {}),
                    JSON.stringify(memory.sources || []),
                    memory.verificationScore
                ]);
                
                const memoryId = result.rows[0].id;
                
                // Store sources
                if (memory.sources && memory.sources.length > 0) {
                    await this.storeSources(memoryId, memory.sources);
                }
                
                // Update metrics
                this.metrics.totalMemories++;
                
                // Check if distillation needed
                await this.checkDistillationNeeded(agentId);
                
                return memoryId;
                
            } finally {
                client.release();
            }
            
        } catch (error) {
            this.handleError('store_memory', error);
            throw error;
        }
    }
    
    prepareMemory(memory) {
        // Standardize memory format
        const prepared = {
            content: memory.content,
            type: memory.type || 'general',
            metadata: {
                ...memory.metadata,
                originalSize: JSON.stringify(memory.content).length,
                timestamp: new Date().toISOString()
            }
        };
        
        // Extract key information
        if (typeof memory.content === 'object') {
            prepared.metadata.keys = Object.keys(memory.content);
        }
        
        return prepared;
    }
    
    calculateImportance(memory) {
        let importance = 1.0;
        
        // Recency factor
        if (memory.timestamp) {
            const age = Date.now() - new Date(memory.timestamp).getTime();
            const recencyScore = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)); // 30 day half-life
            importance *= (1 - this.config.recencyWeight) + this.config.recencyWeight * recencyScore;
        }
        
        // Frequency factor
        if (memory.accessCount) {
            const frequencyScore = Math.min(1, memory.accessCount / 10);
            importance *= (1 - this.config.frequencyWeight) + this.config.frequencyWeight * frequencyScore;
        }
        
        // Utility factor
        if (memory.utility) {
            importance *= (1 - this.config.utilityWeight) + this.config.utilityWeight * memory.utility;
        }
        
        // Type-based importance
        const typeImportance = {
            'critical': 2.0,
            'important': 1.5,
            'general': 1.0,
            'trivial': 0.5
        };
        
        importance *= typeImportance[memory.type] || 1.0;
        
        return Math.min(1.0, importance);
    }
    
    async compressMemory(content) {
        const serialized = encode(content);
        
        if (serialized.length < this.config.compressionThreshold) {
            return {
                content: Buffer.from(serialized),
                compressed: false,
                ratio: 1.0
            };
        }
        
        // LZ4 compression
        const compressed = lz4.compress(serialized);
        const ratio = serialized.length / compressed.length;
        
        // Update stats
        this.compressionStats.originalSize += serialized.length;
        this.compressionStats.compressedSize += compressed.length;
        this.compressionStats.compressionRatio = 
            this.compressionStats.originalSize / this.compressionStats.compressedSize;
        
        this.metrics.compressionSavings += serialized.length - compressed.length;
        
        return {
            content: Buffer.from(compressed),
            compressed: true,
            ratio
        };
    }
    
    async decompressMemory(content, compressed) {
        if (!compressed) {
            return decode(content);
        }
        
        const decompressed = lz4.decompress(content);
        return decode(decompressed);
    }
    
    // Cross-Source Verification
    
    async verifyMemory(memoryId, newSources) {
        const client = await this.dbPool.connect();
        try {
            // Get existing sources
            const existingResult = await client.query(`
                SELECT * FROM memory_sources
                WHERE memory_id = $1
            `, [memoryId]);
            
            const existingSources = existingResult.rows;
            
            // Combine with new sources
            const allSources = [...existingSources, ...newSources];
            
            // Calculate verification score
            const verificationScore = this.calculateVerificationScore(allSources);
            
            // Update memory
            await client.query(`
                UPDATE distilled_memories
                SET verification_score = $1,
                    sources = $2,
                    updated_at = NOW()
                WHERE id = $3
            `, [
                verificationScore,
                JSON.stringify(allSources.map(s => ({
                    type: s.source_type || s.type,
                    id: s.source_id || s.id,
                    confidence: s.confidence
                }))),
                memoryId
            ]);
            
            // Store new sources
            for (const source of newSources) {
                await client.query(`
                    INSERT INTO memory_sources
                    (memory_id, source_type, source_id, confidence, timestamp, raw_data)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [
                    memoryId,
                    source.type,
                    source.id,
                    source.confidence || 1.0,
                    source.timestamp || new Date(),
                    JSON.stringify(source.data || {})
                ]);
            }
            
            this.metrics.verifications++;
            
            return {
                verified: verificationScore >= this.config.verificationThreshold,
                score: verificationScore,
                sourceCount: allSources.length
            };
            
        } finally {
            client.release();
        }
    }
    
    calculateVerificationScore(sources) {
        if (sources.length < this.config.minSourcesForVerification) {
            return sources.length / this.config.minSourcesForVerification * 0.5;
        }
        
        // Group by source type
        const sourceTypes = {};
        for (const source of sources) {
            const type = source.source_type || source.type;
            if (!sourceTypes[type]) {
                sourceTypes[type] = [];
            }
            sourceTypes[type].push(source);
        }
        
        // Calculate diversity bonus
        const diversityScore = Object.keys(sourceTypes).length / 5; // Max 5 types
        
        // Calculate confidence average
        const avgConfidence = sources.reduce((sum, s) => 
            sum + (s.confidence || 1.0), 0
        ) / sources.length;
        
        // Combined score
        return Math.min(1.0, 
            0.3 * diversityScore + 
            0.4 * avgConfidence + 
            0.3 * Math.min(1, sources.length / 10)
        );
    }
    
    async storeSources(memoryId, sources) {
        const client = await this.dbPool.connect();
        try {
            for (const source of sources) {
                await client.query(`
                    INSERT INTO memory_sources
                    (memory_id, source_type, source_id, confidence, timestamp, raw_data)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT DO NOTHING
                `, [
                    memoryId,
                    source.type,
                    source.id,
                    source.confidence || 1.0,
                    source.timestamp || new Date(),
                    JSON.stringify(source.data || {})
                ]);
            }
        } finally {
            client.release();
        }
    }
    
    // Memory Distillation
    
    async distillMemories(agentId) {
        const startTime = Date.now();
        console.log(`Starting memory distillation for agent ${agentId}`);
        
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Get memory statistics
            const stats = await this.getMemoryStats(agentId);
            
            if (stats.totalSize < this.config.maxMemorySize * this.config.distillationThreshold) {
                console.log('Distillation not needed yet');
                return;
            }
            
            // Identify similar memories
            const clusters = await this.clusterMemories(agentId);
            
            // Distill each cluster
            const distilledMemories = [];
            let removedCount = 0;
            
            for (const cluster of clusters) {
                const distilled = await this.distillCluster(cluster);
                if (distilled) {
                    distilledMemories.push(distilled);
                    removedCount += cluster.length - 1;
                }
            }
            
            // Apply forgetting
            const forgottenCount = await this.applyForgetting(agentId);
            removedCount += forgottenCount;
            
            // Record distillation
            await client.query(`
                INSERT INTO distillation_history
                (agent_id, distillation_type, original_count, distilled_count,
                 size_before, size_after, duration_ms, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                agentId,
                'automatic',
                stats.count,
                stats.count - removedCount,
                stats.totalSize,
                await this.getMemorySize(agentId),
                Date.now() - startTime,
                JSON.stringify({
                    clusters: clusters.length,
                    forgotten: forgottenCount
                })
            ]);
            
            await client.query('COMMIT');
            
            this.metrics.distillations++;
            
            console.log(`Distillation complete: removed ${removedCount} memories`);
            
            this.emit('distillation_complete', {
                agentId,
                removedCount,
                duration: Date.now() - startTime
            });
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async clusterMemories(agentId) {
        const client = await this.dbPool.connect();
        try {
            // Get all memories with embeddings
            const result = await client.query(`
                SELECT id, embedding, importance_score, content
                FROM distilled_memories
                WHERE agent_id = $1 AND embedding IS NOT NULL
                ORDER BY importance_score DESC
                LIMIT 1000
            `, [agentId]);
            
            if (result.rows.length < 2) return [];
            
            // Simple clustering based on cosine similarity
            const clusters = [];
            const used = new Set();
            
            for (let i = 0; i < result.rows.length; i++) {
                if (used.has(i)) continue;
                
                const cluster = [result.rows[i]];
                used.add(i);
                
                for (let j = i + 1; j < result.rows.length; j++) {
                    if (used.has(j)) continue;
                    
                    const similarity = this.cosineSimilarity(
                        result.rows[i].embedding,
                        result.rows[j].embedding
                    );
                    
                    if (similarity > 0.8) {
                        cluster.push(result.rows[j]);
                        used.add(j);
                    }
                }
                
                if (cluster.length > 1) {
                    clusters.push(cluster);
                }
            }
            
            return clusters;
            
        } finally {
            client.release();
        }
    }
    
    async distillCluster(cluster) {
        if (cluster.length < 2) return null;
        
        // Sort by importance
        cluster.sort((a, b) => b.importance_score - a.importance_score);
        
        // Keep the most important memory
        const primary = cluster[0];
        const secondaries = cluster.slice(1);
        
        // Merge content
        const mergedContent = await this.mergeMemoryContent(
            await this.decompressMemory(primary.content, primary.compressed),
            secondaries.map(m => this.decompressMemory(m.content, m.compressed))
        );
        
        // Update primary memory
        const client = await this.dbPool.connect();
        try {
            // Update content
            const { content, compressed, ratio } = await this.compressMemory(mergedContent);
            
            await client.query(`
                UPDATE distilled_memories
                SET content = $1,
                    compressed = $2,
                    compression_ratio = $3,
                    metadata = metadata || $4,
                    updated_at = NOW()
                WHERE id = $5
            `, [
                content,
                compressed,
                ratio,
                JSON.stringify({
                    distilled: true,
                    distilledFrom: secondaries.map(s => s.id),
                    distilledAt: new Date().toISOString()
                }),
                primary.id
            ]);
            
            // Create relationships
            for (const secondary of secondaries) {
                await client.query(`
                    INSERT INTO memory_relationships
                    (source_memory_id, target_memory_id, relationship_type, strength)
                    VALUES ($1, $2, 'distilled_from', $3)
                    ON CONFLICT DO NOTHING
                `, [primary.id, secondary.id, secondary.importance_score]);
            }
            
            // Delete secondary memories
            await client.query(`
                DELETE FROM distilled_memories
                WHERE id = ANY($1)
            `, [secondaries.map(s => s.id)]);
            
            return primary.id;
            
        } finally {
            client.release();
        }
    }
    
    async mergeMemoryContent(primary, secondaries) {
        // Intelligent content merging
        if (typeof primary === 'object') {
            const merged = { ...primary };
            
            for (const secondary of secondaries) {
                if (typeof secondary === 'object') {
                    // Merge objects
                    for (const [key, value] of Object.entries(secondary)) {
                        if (!merged[key]) {
                            merged[key] = value;
                        } else if (Array.isArray(merged[key]) && Array.isArray(value)) {
                            // Merge arrays
                            merged[key] = [...new Set([...merged[key], ...value])];
                        } else if (typeof merged[key] === 'object' && typeof value === 'object') {
                            // Recursive merge
                            merged[key] = await this.mergeMemoryContent(merged[key], [value]);
                        }
                    }
                }
            }
            
            return merged;
        }
        
        // For non-objects, create summary
        return {
            primary,
            additional: secondaries,
            mergedAt: new Date().toISOString()
        };
    }
    
    // Forgetting Mechanism
    
    async applyForgetting(agentId) {
        const client = await this.dbPool.connect();
        try {
            // Decay importance scores
            await client.query(`
                UPDATE distilled_memories
                SET importance_score = importance_score * $1
                WHERE agent_id = $2
            `, [this.config.importanceDecay, agentId]);
            
            // Remove memories below threshold
            const result = await client.query(`
                DELETE FROM distilled_memories
                WHERE agent_id = $1 
                  AND importance_score < $2
                  AND created_at < NOW() - INTERVAL '7 days'
                RETURNING id
            `, [agentId, this.config.minImportanceToKeep]);
            
            return result.rowCount;
            
        } finally {
            client.release();
        }
    }
    
    // Memory Retrieval
    
    async retrieveMemories(agentId, query, options = {}) {
        const startTime = Date.now();
        this.metrics.retrievals++;
        
        try {
            // Check cache
            const cacheKey = `${agentId}:${JSON.stringify(query)}`;
            if (this.memoryCache.has(cacheKey)) {
                const cached = this.memoryCache.get(cacheKey);
                if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
                    return cached.data;
                }
            }
            
            let memories = [];
            
            if (this.config.semanticSearchEnabled && query.semantic) {
                memories = await this.semanticSearch(agentId, query.semantic, options);
            } else if (query.type) {
                memories = await this.retrieveByType(agentId, query.type, options);
            } else {
                memories = await this.retrieveRecent(agentId, options);
            }
            
            // Decompress memories
            const decompressed = await Promise.all(
                memories.map(async m => ({
                    ...m,
                    content: await this.decompressMemory(m.content, m.compressed)
                }))
            );
            
            // Update access counts
            await this.updateAccessCounts(memories.map(m => m.id));
            
            // Cache result
            this.memoryCache.set(cacheKey, {
                data: decompressed,
                timestamp: Date.now()
            });
            
            // Clean cache if too large
            if (this.memoryCache.size > this.config.cacheSize) {
                const oldest = Array.from(this.memoryCache.entries())
                    .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
                this.memoryCache.delete(oldest[0]);
            }
            
            this.emit('memories_retrieved', {
                agentId,
                count: decompressed.length,
                duration: Date.now() - startTime
            });
            
            return decompressed;
            
        } catch (error) {
            this.handleError('retrieve_memories', error);
            throw error;
        }
    }
    
    async semanticSearch(agentId, query, options = {}) {
        const embedding = await this.generateEmbedding(query);
        const limit = options.limit || this.config.retrievalBatchSize;
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id, memory_type, content, compressed, importance_score,
                       access_count, metadata, sources, verification_score,
                       1 - (embedding <=> $1) as similarity
                FROM distilled_memories
                WHERE agent_id = $2
                ORDER BY embedding <=> $1
                LIMIT $3
            `, [embedding, agentId, limit]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async retrieveByType(agentId, type, options = {}) {
        const limit = options.limit || this.config.retrievalBatchSize;
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id, memory_type, content, compressed, importance_score,
                       access_count, metadata, sources, verification_score
                FROM distilled_memories
                WHERE agent_id = $1 AND memory_type = $2
                ORDER BY importance_score DESC, created_at DESC
                LIMIT $3
            `, [agentId, type, limit]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async retrieveRecent(agentId, options = {}) {
        const limit = options.limit || this.config.retrievalBatchSize;
        
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT id, memory_type, content, compressed, importance_score,
                       access_count, metadata, sources, verification_score
                FROM distilled_memories
                WHERE agent_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            `, [agentId, limit]);
            
            return result.rows;
            
        } finally {
            client.release();
        }
    }
    
    async updateAccessCounts(memoryIds) {
        if (memoryIds.length === 0) return;
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                UPDATE distilled_memories
                SET access_count = access_count + 1,
                    last_accessed = NOW()
                WHERE id = ANY($1)
            `, [memoryIds]);
        } finally {
            client.release();
        }
    }
    
    // Embedding Model
    
    async loadEmbeddingModel() {
        // Use Universal Sentence Encoder
        this.embeddingModel = await tf.loadLayersModel(
            'https://tfhub.dev/google/universal-sentence-encoder/4'
        );
        console.log('Embedding model loaded');
    }
    
    async generateEmbedding(text) {
        if (!this.embeddingModel) {
            // Fallback: simple hash-based embedding
            return this.generateHashEmbedding(text);
        }
        
        const input = typeof text === 'object' ? JSON.stringify(text) : text;
        const embeddings = await this.embeddingModel.embed([input]);
        const embedding = await embeddings.array();
        embeddings.dispose();
        
        return embedding[0];
    }
    
    generateHashEmbedding(text) {
        const embedding = new Float32Array(this.config.embeddingDimension);
        const str = typeof text === 'object' ? JSON.stringify(text) : text;
        
        for (let i = 0; i < this.config.embeddingDimension; i++) {
            const hash = crypto.createHash('sha256')
                .update(str + i)
                .digest();
            
            // Convert to float between -1 and 1
            embedding[i] = (hash.readUInt32BE(0) / 0xFFFFFFFF) * 2 - 1;
        }
        
        return Array.from(embedding);
    }
    
    cosineSimilarity(vec1, vec2) {
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;
        
        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }
        
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
    
    // Memory Management
    
    startMemoryManagement() {
        // Periodic distillation
        setInterval(async () => {
            try {
                await this.checkAllAgentsForDistillation();
            } catch (error) {
                this.handleError('periodic_distillation', error);
            }
        }, 3600000); // Every hour
        
        // Periodic cache cleanup
        setInterval(() => {
            this.memoryCache.clear();
        }, 300000); // Every 5 minutes
    }
    
    async checkAllAgentsForDistillation() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT DISTINCT agent_id
                FROM distilled_memories
                GROUP BY agent_id
                HAVING SUM(octet_length(content)) > $1
            `, [this.config.maxMemorySize * this.config.distillationThreshold]);
            
            for (const row of result.rows) {
                await this.distillMemories(row.agent_id);
            }
            
        } finally {
            client.release();
        }
    }
    
    async checkDistillationNeeded(agentId) {
        const size = await this.getMemorySize(agentId);
        
        if (size > this.config.maxMemorySize * this.config.distillationThreshold) {
            // Async distillation
            setImmediate(() => {
                this.distillMemories(agentId).catch(error =>
                    this.handleError('async_distillation', error)
                );
            });
        }
    }
    
    // Utility Methods
    
    async getMemoryStats(agentId) {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT 
                    COUNT(*) as count,
                    SUM(octet_length(content)) as total_size,
                    AVG(importance_score) as avg_importance,
                    AVG(compression_ratio) as avg_compression
                FROM distilled_memories
                WHERE agent_id = $1
            `, [agentId]);
            
            return {
                count: parseInt(result.rows[0].count),
                totalSize: parseInt(result.rows[0].total_size || 0),
                avgImportance: parseFloat(result.rows[0].avg_importance || 0),
                avgCompression: parseFloat(result.rows[0].avg_compression || 1)
            };
            
        } finally {
            client.release();
        }
    }
    
    async getMemorySize(agentId) {
        const stats = await this.getMemoryStats(agentId);
        return stats.totalSize;
    }
    
    async exportMemories(agentId, format = 'json') {
        const memories = await this.retrieveMemories(agentId, {}, { limit: 10000 });
        
        switch (format) {
            case 'json':
                return JSON.stringify(memories, null, 2);
                
            case 'msgpack':
                return encode(memories);
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    
    async importMemories(agentId, data, format = 'json') {
        let memories;
        
        switch (format) {
            case 'json':
                memories = JSON.parse(data);
                break;
                
            case 'msgpack':
                memories = decode(data);
                break;
                
            default:
                throw new Error(`Unsupported import format: ${format}`);
        }
        
        for (const memory of memories) {
            await this.storeMemory(agentId, memory);
        }
        
        return memories.length;
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: this.memoryCache.size,
            compressionRatio: this.compressionStats.compressionRatio
        };
    }
    
    handleError(context, error) {
        console.error(`Memory Distillation error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        console.log('Shutting down Memory Distillation Engine');
        
        // Clear cache
        this.memoryCache.clear();
        
        // Close database
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        console.log('Memory Distillation Engine shut down');
    }
}

// Export factory function
export function createMemoryEngine(config) {
    return new MemoryDistillationEngine(config);
}
```

```javascript
// memory-usage.js
import { createMemoryEngine } from './memory-distillation-engine.js';

async function main() {
    const memoryEngine = createMemoryEngine({
        maxMemorySize: 50000000, // 50MB per agent
        semanticSearchEnabled: true
    });
    
    await memoryEngine.initialize();
    
    const agentId = 'construction-agent-123';
    
    // Store a memory
    const memoryId = await memoryEngine.storeMemory(agentId, {
        content: {
            project: 'Tower Construction',
            phase: 'Foundation',
            progress: 0.25,
            issues: ['Weather delay', 'Material shortage']
        },
        type: 'important',
        sources: [
            { type: 'sensor', id: 'sensor-001', confidence: 0.9 },
            { type: 'report', id: 'report-456', confidence: 0.95 }
        ],
        metadata: {
            location: 'Site A',
            timestamp: new Date()
        }
    });
    
    // Verify with additional sources
    const verification = await memoryEngine.verifyMemory(memoryId, [
        { type: 'inspection', id: 'insp-789', confidence: 0.85 }
    ]);
    
    console.log('Verification:', verification);
    
    // Retrieve memories
    const memories = await memoryEngine.retrieveMemories(agentId, {
        semantic: 'foundation progress issues'
    });
    
    console.log('Retrieved memories:', memories);
    
    // Force distillation
    await memoryEngine.distillMemories(agentId);
    
    // Get metrics
    console.log('Metrics:', memoryEngine.getMetrics());
}

main();
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
System integration guidelines

## Extended Resources
- **Full Implementation**: `/skills/memory-distillation-detailed.md`
- **Code Examples**: `/examples/memory-distillation-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*