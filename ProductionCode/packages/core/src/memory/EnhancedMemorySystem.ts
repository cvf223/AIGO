import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';
import type { UUID, Memory, IAgentRuntime } from '../types';

// Enhanced interfaces for the new memory system
export interface EnhancedMemory extends Memory {
    // Importance and scoring
    importanceScore: number;
    agentScores: Map<string, number>; // Agent-specific importance scores
    accessCount: number;
    lastAccessed: number;
    decayFactor: number;
    
    // Semantic and clustering
    embedding?: number[];
    semanticCluster?: string;
    topics: string[];
    entities: string[];
    
    // Metadata enhancements
    memoryType: 'conversation' | 'learning' | 'decision' | 'insight' | 'error' | 'success';
    confidenceLevel: number;
    sourceAgent: string;
    relatedMemories: UUID[];
    
    // Temporal information
    expiresAt?: number;
    lastConsolidated?: number;
    compressionLevel: number;
}

export interface MemoryIndex {
    byTopic: Map<string, UUID[]>;
    byEntity: Map<string, UUID[]>;
    byAgent: Map<string, UUID[]>;
    byImportance: UUID[]; // Sorted by importance score
    byRecency: UUID[]; // Sorted by creation time
    byAccess: UUID[]; // Sorted by access frequency
    semantic: Map<string, { embedding: number[], memoryIds: UUID[] }>;
}

export interface MemoryCache {
    memories: Map<UUID, EnhancedMemory>;
    indexes: Map<string, any>;
    lastUpdated: number;
    hitCount: number;
    missCount: number;
}

export interface SearchQuery {
    text?: string;
    topics?: string[];
    entities?: string[];
    agentId?: UUID;
    roomId?: UUID;
    memoryTypes?: string[];
    timeRange?: { start: number; end: number };
    importanceThreshold?: number;
    limit?: number;
    useSemanticSearch?: boolean;
    includeRelated?: boolean;
}

export interface SearchResult {
    memory: EnhancedMemory;
    relevanceScore: number;
    matchType: 'exact' | 'semantic' | 'topic' | 'entity' | 'temporal';
    explanation: string;
}

/**
 * 🧠 Enhanced Memory System - Complete Intelligence Layer
 * 
 * Features:
 * - Performance: Indexing, caching, compression, parallel processing
 * - Intelligence: Semantic clustering, importance scoring, auto-tagging, decay
 * - Search: Vector embeddings, full-text, temporal, cross-agent sharing
 */
export class EnhancedMemorySystem {
    private memoryCache: MemoryCache;
    private memoryIndex: MemoryIndex;
    private storageDir: string;
    private indexDir: string;
    private cacheDir: string;
    private eventEmitter: EventEmitter;
    
    // Configuration
    private readonly CACHE_SIZE_LIMIT = 10000;
    private readonly INDEX_UPDATE_INTERVAL = 30000; // 30 seconds
    private readonly COMPRESSION_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days
    private readonly DECAY_RATE = 0.95; // Daily decay rate
    private readonly SEMANTIC_SIMILARITY_THRESHOLD = 0.7;
    
    // Processing queues for parallel operations
    private indexingQueue: Promise<void>[] = [];
    private compressionQueue: Promise<void>[] = [];
    
    constructor(baseDir: string = './agent/data/memory') {
        this.storageDir = path.join(baseDir, 'enhanced');
        this.indexDir = path.join(baseDir, 'indexes');
        this.cacheDir = path.join(baseDir, 'cache');
        
        this.eventEmitter = new EventEmitter();
        
        // Initialize cache and indexes
        this.memoryCache = {
            memories: new Map(),
            indexes: new Map(),
            lastUpdated: 0,
            hitCount: 0,
            missCount: 0
        };
        
        this.memoryIndex = {
            byTopic: new Map(),
            byEntity: new Map(),
            byAgent: new Map(),
            byImportance: [],
            byRecency: [],
            byAccess: [],
            semantic: new Map()
        };
        
        this.initializeDirectories();
        this.loadIndexes();
        this.startBackgroundTasks();
    }

    /**
     * 🚀 Store enhanced memory with full intelligence
     */
    async storeMemory(memory: Partial<EnhancedMemory>, agentId: string): Promise<EnhancedMemory> {
        const enhancedMemory = await this.enhanceMemory(memory, agentId);
        
        // Store in multiple locations for reliability
        const storePromises = [
            this.storeToFile(enhancedMemory),
            this.updateCache(enhancedMemory),
            this.updateIndexes(enhancedMemory)
        ];
        
        await Promise.all(storePromises);
        
        // Trigger background processing
        this.queueIndexing(enhancedMemory);
        this.queueCompression(enhancedMemory);
        
        this.eventEmitter.emit('memoryStored', enhancedMemory);
        return enhancedMemory;
    }

    /**
     * 🔍 Advanced search with multiple strategies
     */
    async searchMemories(query: SearchQuery): Promise<SearchResult[]> {
        const startTime = Date.now();
        
        // Try cache first for common queries
        const cacheKey = this.generateCacheKey(query);
        const cached = this.memoryCache.indexes.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp) < 300000) { // 5 min cache
            this.memoryCache.hitCount++;
            return cached.results;
        }
        
        this.memoryCache.missCount++;
        
        // Parallel search strategies
        const searchPromises = [];
        
        if (query.text && query.useSemanticSearch) {
            searchPromises.push(this.semanticSearch(query.text, query.limit || 20));
        }
        
        if (query.text) {
            searchPromises.push(this.fullTextSearch(query.text, query.limit || 20));
        }
        
        if (query.topics?.length) {
            searchPromises.push(this.topicSearch(query.topics, query.limit || 20));
        }
        
        if (query.entities?.length) {
            searchPromises.push(this.entitySearch(query.entities, query.limit || 20));
        }
        
        if (query.timeRange) {
            searchPromises.push(this.temporalSearch(query.timeRange, query.limit || 20));
        }
        
        // Execute all searches in parallel
        const searchResults = await Promise.all(searchPromises);
        
        // Merge and rank results
        const mergedResults = this.mergeSearchResults(searchResults, query);
        
        // Apply filters
        const filteredResults = this.applyFilters(mergedResults, query);
        
        // Cache results
        this.memoryCache.indexes.set(cacheKey, {
            results: filteredResults,
            timestamp: Date.now()
        });
        
        console.log(`🔍 Search completed in ${Date.now() - startTime}ms, found ${filteredResults.length} results`);
        return filteredResults;
    }

    /**
     * 📊 Score memory importance for agent-specific needs
     */
    async scoreMemoryImportance(memoryId: UUID, agentId: string, score: number, reason: string): Promise<void> {
        const memory = await this.getMemory(memoryId);
        if (!memory) return;
        
        // Update agent-specific score
        memory.agentScores.set(agentId, score);
        
        // Recalculate overall importance
        const scores = Array.from(memory.agentScores.values());
        memory.importanceScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
        
        // Update access tracking
        memory.accessCount++;
        memory.lastAccessed = Date.now();
        
        // Store the updated memory
        await this.storeToFile(memory);
        await this.updateCache(memory);
        
        // Update importance index
        this.updateImportanceIndex();
        
        console.log(`📊 Memory ${memoryId.substring(0, 8)} scored ${score} by ${agentId}: ${reason}`);
        
        this.eventEmitter.emit('memoryScored', {
            memoryId,
            agentId,
            score,
            reason,
            newImportance: memory.importanceScore
        });
    }

    /**
     * 🏷️ Auto-tag memories with topics and entities
     */
    private async autoTagMemory(memory: EnhancedMemory): Promise<void> {
        const text = this.extractTextContent(memory);
        
        // Extract topics using keyword analysis
        const topics = await this.extractTopics(text);
        memory.topics = [...new Set([...memory.topics, ...topics])];
        
        // Extract entities (people, places, concepts)
        const entities = await this.extractEntities(text);
        memory.entities = [...new Set([...memory.entities, ...entities])];
        
        // Determine memory type based on content
        memory.memoryType = this.classifyMemoryType(text);
        
        // Calculate confidence level
        memory.confidenceLevel = this.calculateConfidence(memory);
    }

    /**
     * 🧮 Generate vector embeddings for semantic search
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        try {
            // In a real implementation, you'd use OpenAI embeddings or similar
            // For now, we'll create a simple hash-based embedding
            const hash = crypto.createHash('sha256').update(text).digest();
            const embedding = Array.from(hash).slice(0, 384).map(b => (b - 128) / 128);
            return embedding;
        } catch (error) {
            console.error('Error generating embedding:', error);
            return new Array(384).fill(0);
        }
    }

    /**
     * 🔗 Semantic clustering of related memories
     */
    private async clusterMemories(): Promise<void> {
        const memories = Array.from(this.memoryCache.memories.values());
        const clusters = new Map<string, UUID[]>();
        
        for (const memory of memories) {
            if (!memory.embedding) continue;
            
            let bestCluster = null;
            let bestSimilarity = 0;
            
            // Find most similar existing cluster
            for (const [clusterId, clusterMemories] of clusters) {
                const clusterEmbedding = await this.getClusterEmbedding(clusterMemories);
                const similarity = this.cosineSimilarity(memory.embedding, clusterEmbedding);
                
                if (similarity > bestSimilarity && similarity > this.SEMANTIC_SIMILARITY_THRESHOLD) {
                    bestSimilarity = similarity;
                    bestCluster = clusterId;
                }
            }
            
            if (bestCluster) {
                clusters.get(bestCluster)!.push(memory.id!);
                memory.semanticCluster = bestCluster;
            } else {
                // Create new cluster
                const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                clusters.set(clusterId, [memory.id!]);
                memory.semanticCluster = clusterId;
            }
        }
        
        console.log(`🔗 Clustered ${memories.length} memories into ${clusters.size} semantic groups`);
    }

    /**
     * ⏰ Apply memory decay to reduce importance over time
     */
    private async applyMemoryDecay(): Promise<void> {
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        for (const memory of this.memoryCache.memories.values()) {
            const daysSinceCreation = (now - (memory.createdAt || now)) / oneDayMs;
            const daysSinceAccess = (now - memory.lastAccessed) / oneDayMs;
            
            // Apply decay based on time and access patterns
            const timeFactor = Math.pow(this.DECAY_RATE, daysSinceCreation);
            const accessFactor = Math.pow(0.98, daysSinceAccess); // Slower decay for recently accessed
            
            memory.decayFactor = timeFactor * accessFactor;
            
            // Adjust importance score
            const originalImportance = memory.importanceScore / (memory.decayFactor || 1);
            memory.importanceScore = originalImportance * memory.decayFactor;
        }
        
        // Update importance index after decay
        this.updateImportanceIndex();
    }

    /**
     * 🗜️ Compress old memories to save space
     */
    private async compressMemory(memory: EnhancedMemory): Promise<void> {
        if (memory.compressionLevel > 0) return; // Already compressed
        
        const age = Date.now() - (memory.createdAt || Date.now());
        if (age < this.COMPRESSION_THRESHOLD) return; // Too recent
        
        // Compress content while preserving key information
        const originalContent = memory.content;
        const compressedContent = {
            summary: this.summarizeContent(originalContent),
            keyPoints: this.extractKeyPoints(originalContent),
            originalLength: JSON.stringify(originalContent).length
        };
        
        memory.content = compressedContent;
        memory.compressionLevel = 1;
        memory.lastConsolidated = Date.now();
        
        await this.storeToFile(memory);
        
        console.log(`🗜️ Compressed memory ${memory.id?.substring(0, 8)} (${compressedContent.originalLength} -> ${JSON.stringify(compressedContent).length} bytes)`);
    }

    /**
     * 🔍 Semantic search using vector embeddings
     */
    private async semanticSearch(query: string, limit: number): Promise<SearchResult[]> {
        const queryEmbedding = await this.generateEmbedding(query);
        const results: SearchResult[] = [];
        
        for (const memory of this.memoryCache.memories.values()) {
            if (!memory.embedding) continue;
            
            const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
            if (similarity > this.SEMANTIC_SIMILARITY_THRESHOLD) {
                results.push({
                    memory,
                    relevanceScore: similarity,
                    matchType: 'semantic',
                    explanation: `Semantic similarity: ${(similarity * 100).toFixed(1)}%`
                });
            }
        }
        
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    /**
     * 📝 Full-text search with ranking
     */
    private async fullTextSearch(query: string, limit: number): Promise<SearchResult[]> {
        const queryTerms = query.toLowerCase().split(/\s+/);
        const results: SearchResult[] = [];
        
        for (const memory of this.memoryCache.memories.values()) {
            const text = this.extractTextContent(memory).toLowerCase();
            let score = 0;
            let matches = 0;
            
            for (const term of queryTerms) {
                const termCount = (text.match(new RegExp(term, 'g')) || []).length;
                if (termCount > 0) {
                    matches++;
                    score += termCount * (term.length / query.length); // Weight by term length
                }
            }
            
            if (matches > 0) {
                const relevanceScore = (matches / queryTerms.length) * Math.min(score, 1);
                results.push({
                    memory,
                    relevanceScore,
                    matchType: 'exact',
                    explanation: `Text match: ${matches}/${queryTerms.length} terms`
                });
            }
        }
        
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    /**
     * 🏷️ Topic-based search
     */
    private async topicSearch(topics: string[], limit: number): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        
        for (const topic of topics) {
            const memoryIds = this.memoryIndex.byTopic.get(topic.toLowerCase()) || [];
            
            for (const memoryId of memoryIds) {
                const memory = this.memoryCache.memories.get(memoryId);
                if (!memory) continue;
                
                const topicMatches = memory.topics.filter(t => 
                    topics.some(qt => t.toLowerCase().includes(qt.toLowerCase()))
                ).length;
                
                const relevanceScore = topicMatches / topics.length;
                
                results.push({
                    memory,
                    relevanceScore,
                    matchType: 'topic',
                    explanation: `Topic match: ${topicMatches}/${topics.length} topics`
                });
            }
        }
        
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    /**
     * 🎯 Entity-based search
     */
    private async entitySearch(entities: string[], limit: number): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        
        for (const entity of entities) {
            const memoryIds = this.memoryIndex.byEntity.get(entity.toLowerCase()) || [];
            
            for (const memoryId of memoryIds) {
                const memory = this.memoryCache.memories.get(memoryId);
                if (!memory) continue;
                
                const entityMatches = memory.entities.filter(e => 
                    entities.some(qe => e.toLowerCase().includes(qe.toLowerCase()))
                ).length;
                
                const relevanceScore = entityMatches / entities.length;
                
                results.push({
                    memory,
                    relevanceScore,
                    matchType: 'entity',
                    explanation: `Entity match: ${entityMatches}/${entities.length} entities`
                });
            }
        }
        
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    /**
     * ⏰ Temporal search for time-based queries
     */
    private async temporalSearch(timeRange: { start: number; end: number }, limit: number): Promise<SearchResult[]> {
        const results: SearchResult[] = [];
        
        for (const memory of this.memoryCache.memories.values()) {
            const createdAt = memory.createdAt || 0;
            
            if (createdAt >= timeRange.start && createdAt <= timeRange.end) {
                // Score based on how recent within the range
                const rangeSize = timeRange.end - timeRange.start;
                const positionInRange = (createdAt - timeRange.start) / rangeSize;
                const relevanceScore = 0.5 + (positionInRange * 0.5); // 0.5 to 1.0
                
                results.push({
                    memory,
                    relevanceScore,
                    matchType: 'temporal',
                    explanation: `Time range match: ${new Date(createdAt).toISOString()}`
                });
            }
        }
        
        return results
            .sort((a, b) => b.relevanceScore - a.relevanceScore)
            .slice(0, limit);
    }

    // Helper methods for the enhanced memory system

    private async enhanceMemory(memory: Partial<EnhancedMemory>, agentId: string): Promise<EnhancedMemory> {
        const enhanced: EnhancedMemory = {
            id: memory.id || crypto.randomUUID() as UUID,
            roomId: memory.roomId!,
            userId: memory.userId || agentId as UUID,
            agentId: memory.agentId || agentId as UUID,
            content: memory.content || { text: '' },
            createdAt: memory.createdAt || Date.now(),
            
            // Enhanced fields
            importanceScore: memory.importanceScore || 0.5,
            agentScores: memory.agentScores || new Map(),
            accessCount: 0,
            lastAccessed: Date.now(),
            decayFactor: 1.0,
            
            topics: memory.topics || [],
            entities: memory.entities || [],
            memoryType: memory.memoryType || 'conversation',
            confidenceLevel: memory.confidenceLevel || 0.5,
            sourceAgent: agentId,
            relatedMemories: memory.relatedMemories || [],
            
            compressionLevel: 0
        };
        
        // Generate embedding and auto-tag
        const text = this.extractTextContent(enhanced);
        enhanced.embedding = await this.generateEmbedding(text);
        await this.autoTagMemory(enhanced);
        
        return enhanced;
    }

    private extractTextContent(memory: EnhancedMemory): string {
        if (typeof memory.content === 'string') return memory.content;
        if (memory.content.text) return memory.content.text;
        return JSON.stringify(memory.content);
    }

    private async extractTopics(text: string): Promise<string[]> {
        // Simple keyword extraction - in production use NLP libraries
        const keywords = text.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['the', 'and', 'but', 'for', 'are', 'with', 'this', 'that'].includes(word));
        
        return [...new Set(keywords)].slice(0, 10);
    }

    private async extractEntities(text: string): Promise<string[]> {
        // Simple entity extraction - in production use NER models
        const entities: string[] = [];
        
        // Extract capitalized words (potential proper nouns)
        const capitalizedWords = text.match(/\b[A-Z][a-z]+\b/g) || [];
        entities.push(...capitalizedWords);
        
        // Extract common crypto/finance entities
        const cryptoEntities = text.match(/\b(BTC|ETH|USDT|DeFi|NFT|DAO|DEX|CEX)\b/gi) || [];
        entities.push(...cryptoEntities);
        
        return [...new Set(entities)].slice(0, 20);
    }

    private classifyMemoryType(text: string): EnhancedMemory['memoryType'] {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('error') || lowerText.includes('failed')) return 'error';
        if (lowerText.includes('success') || lowerText.includes('completed')) return 'success';
        if (lowerText.includes('learn') || lowerText.includes('insight')) return 'learning';
        if (lowerText.includes('decision') || lowerText.includes('choose')) return 'decision';
        if (lowerText.includes('important') || lowerText.includes('key')) return 'insight';
        
        return 'conversation';
    }

    private calculateConfidence(memory: EnhancedMemory): number {
        let confidence = 0.5; // Base confidence
        
        // Higher confidence for longer, more detailed content
        const textLength = this.extractTextContent(memory).length;
        confidence += Math.min(textLength / 1000, 0.3);
        
        // Higher confidence for memories with more topics/entities
        confidence += Math.min((memory.topics.length + memory.entities.length) / 20, 0.2);
        
        return Math.min(confidence, 1.0);
    }

    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;
        
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private async getClusterEmbedding(memoryIds: UUID[]): Promise<number[]> {
        const embeddings: number[][] = [];
        
        for (const id of memoryIds) {
            const memory = this.memoryCache.memories.get(id);
            if (memory?.embedding) {
                embeddings.push(memory.embedding);
            }
        }
        
        if (embeddings.length === 0) return new Array(384).fill(0);
        
        // Calculate centroid
        const centroid = new Array(embeddings[0].length).fill(0);
        for (const embedding of embeddings) {
            for (let i = 0; i < embedding.length; i++) {
                centroid[i] += embedding[i];
            }
        }
        
        return centroid.map(val => val / embeddings.length);
    }

    private mergeSearchResults(searchResults: SearchResult[][], query: SearchQuery): SearchResult[] {
        const merged = new Map<UUID, SearchResult>();
        
        for (const results of searchResults) {
            for (const result of results) {
                const existing = merged.get(result.memory.id!);
                if (existing) {
                    // Combine scores and explanations
                    existing.relevanceScore = Math.max(existing.relevanceScore, result.relevanceScore);
                    existing.explanation += ` | ${result.explanation}`;
                } else {
                    merged.set(result.memory.id!, result);
                }
            }
        }
        
        return Array.from(merged.values())
            .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    private applyFilters(results: SearchResult[], query: SearchQuery): SearchResult[] {
        let filtered = results;
        
        if (query.agentId) {
            filtered = filtered.filter(r => r.memory.agentId === query.agentId);
        }
        
        if (query.roomId) {
            filtered = filtered.filter(r => r.memory.roomId === query.roomId);
        }
        
        if (query.memoryTypes?.length) {
            filtered = filtered.filter(r => query.memoryTypes!.includes(r.memory.memoryType));
        }
        
        if (query.importanceThreshold) {
            filtered = filtered.filter(r => r.memory.importanceScore >= query.importanceThreshold!);
        }
        
        return filtered.slice(0, query.limit || 50);
    }

    private generateCacheKey(query: SearchQuery): string {
        return crypto.createHash('md5')
            .update(JSON.stringify(query))
            .digest('hex');
    }

    private summarizeContent(content: any): string {
        const text = typeof content === 'string' ? content : JSON.stringify(content);
        // Simple summarization - in production use AI summarization
        return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }

    private extractKeyPoints(content: any): string[] {
        const text = typeof content === 'string' ? content : JSON.stringify(content);
        // Simple key point extraction
        return text.split(/[.!?]/)
            .filter(sentence => sentence.trim().length > 20)
            .slice(0, 5);
    }

    // Storage and indexing methods
    private async storeToFile(memory: EnhancedMemory): Promise<void> {
        const filePath = path.join(this.storageDir, `${memory.id}.json`);
        await fs.promises.writeFile(filePath, JSON.stringify(memory, null, 2));
    }

    private async updateCache(memory: EnhancedMemory): Promise<void> {
        this.memoryCache.memories.set(memory.id!, memory);
        
        // Limit cache size
        if (this.memoryCache.memories.size > this.CACHE_SIZE_LIMIT) {
            const oldestEntries = Array.from(this.memoryCache.memories.entries())
                .sort((a, b) => (a[1].lastAccessed || 0) - (b[1].lastAccessed || 0))
                .slice(0, this.CACHE_SIZE_LIMIT * 0.1); // Remove 10%
            
            for (const [id] of oldestEntries) {
                this.memoryCache.memories.delete(id);
            }
        }
    }

    private async updateIndexes(memory: EnhancedMemory): Promise<void> {
        // Update topic index
        for (const topic of memory.topics) {
            const existing = this.memoryIndex.byTopic.get(topic.toLowerCase()) || [];
            existing.push(memory.id!);
            this.memoryIndex.byTopic.set(topic.toLowerCase(), existing);
        }
        
        // Update entity index
        for (const entity of memory.entities) {
            const existing = this.memoryIndex.byEntity.get(entity.toLowerCase()) || [];
            existing.push(memory.id!);
            this.memoryIndex.byEntity.set(entity.toLowerCase(), existing);
        }
        
        // Update agent index
        const agentMemories = this.memoryIndex.byAgent.get(memory.sourceAgent) || [];
        agentMemories.push(memory.id!);
        this.memoryIndex.byAgent.set(memory.sourceAgent, agentMemories);
        
        // Update sorted indexes
        this.updateImportanceIndex();
        this.updateRecencyIndex();
        this.updateAccessIndex();
    }

    private updateImportanceIndex(): void {
        this.memoryIndex.byImportance = Array.from(this.memoryCache.memories.values())
            .sort((a, b) => b.importanceScore - a.importanceScore)
            .map(m => m.id!);
    }

    private updateRecencyIndex(): void {
        this.memoryIndex.byRecency = Array.from(this.memoryCache.memories.values())
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
            .map(m => m.id!);
    }

    private updateAccessIndex(): void {
        this.memoryIndex.byAccess = Array.from(this.memoryCache.memories.values())
            .sort((a, b) => b.accessCount - a.accessCount)
            .map(m => m.id!);
    }

    private async getMemory(memoryId: UUID): Promise<EnhancedMemory | null> {
        // Try cache first
        const cached = this.memoryCache.memories.get(memoryId);
        if (cached) return cached;
        
        // Load from file
        try {
            const filePath = path.join(this.storageDir, `${memoryId}.json`);
            const data = await fs.promises.readFile(filePath, 'utf8');
            const memory = JSON.parse(data) as EnhancedMemory;
            
            // Restore Map objects
            memory.agentScores = new Map(Object.entries(memory.agentScores || {}));
            
            // Update cache
            this.memoryCache.memories.set(memoryId, memory);
            return memory;
        } catch (error) {
            return null;
        }
    }

    // Background processing
    private queueIndexing(memory: EnhancedMemory): void {
        const indexingTask = this.performIndexing(memory);
        this.indexingQueue.push(indexingTask);
        
        // Limit queue size
        if (this.indexingQueue.length > 100) {
            this.indexingQueue = this.indexingQueue.slice(-50);
        }
    }

    private queueCompression(memory: EnhancedMemory): void {
        const compressionTask = this.compressMemory(memory);
        this.compressionQueue.push(compressionTask);
        
        // Limit queue size
        if (this.compressionQueue.length > 50) {
            this.compressionQueue = this.compressionQueue.slice(-25);
        }
    }

    private async performIndexing(memory: EnhancedMemory): Promise<void> {
        // Update semantic index
        if (memory.embedding && memory.semanticCluster) {
            const existing = this.memoryIndex.semantic.get(memory.semanticCluster) || {
                embedding: memory.embedding,
                memoryIds: []
            };
            existing.memoryIds.push(memory.id!);
            this.memoryIndex.semantic.set(memory.semanticCluster, existing);
        }
    }

    private initializeDirectories(): void {
        [this.storageDir, this.indexDir, this.cacheDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    private async loadIndexes(): Promise<void> {
        try {
            const indexPath = path.join(this.indexDir, 'memory-index.json');
            if (fs.existsSync(indexPath)) {
                const data = await fs.promises.readFile(indexPath, 'utf8');
                const savedIndex = JSON.parse(data);
                
                // Restore Map objects
                this.memoryIndex.byTopic = new Map(savedIndex.byTopic || []);
                this.memoryIndex.byEntity = new Map(savedIndex.byEntity || []);
                this.memoryIndex.byAgent = new Map(savedIndex.byAgent || []);
                this.memoryIndex.semantic = new Map(savedIndex.semantic || []);
                
                console.log('📚 Loaded memory indexes from disk');
            }
        } catch (error) {
            console.warn('Failed to load indexes:', error);
        }
    }

    private async saveIndexes(): Promise<void> {
        try {
            const indexPath = path.join(this.indexDir, 'memory-index.json');
            const indexData = {
                byTopic: Array.from(this.memoryIndex.byTopic.entries()),
                byEntity: Array.from(this.memoryIndex.byEntity.entries()),
                byAgent: Array.from(this.memoryIndex.byAgent.entries()),
                semantic: Array.from(this.memoryIndex.semantic.entries()),
                byImportance: this.memoryIndex.byImportance,
                byRecency: this.memoryIndex.byRecency,
                byAccess: this.memoryIndex.byAccess
            };
            
            await fs.promises.writeFile(indexPath, JSON.stringify(indexData, null, 2));
        } catch (error) {
            console.error('Failed to save indexes:', error);
        }
    }

    private startBackgroundTasks(): void {
        // Periodic index updates
        setInterval(() => {
            this.saveIndexes();
        }, this.INDEX_UPDATE_INTERVAL);
        
        // Periodic memory decay
        setInterval(() => {
            this.applyMemoryDecay();
        }, 60 * 60 * 1000); // Every hour
        
        // Periodic clustering
        setInterval(() => {
            this.clusterMemories();
        }, 6 * 60 * 60 * 1000); // Every 6 hours
        
        console.log('🔄 Started background memory processing tasks');
    }

    // Public API methods
    async getMemoryStats(): Promise<{
        totalMemories: number;
        cacheHitRate: number;
        averageImportance: number;
        topTopics: string[];
        topEntities: string[];
        compressionRatio: number;
    }> {
        const memories = Array.from(this.memoryCache.memories.values());
        const totalRequests = this.memoryCache.hitCount + this.memoryCache.missCount;
        const cacheHitRate = totalRequests > 0 ? this.memoryCache.hitCount / totalRequests : 0;
        
        const avgImportance = memories.reduce((sum, m) => sum + m.importanceScore, 0) / memories.length;
        
        const topicCounts = new Map<string, number>();
        const entityCounts = new Map<string, number>();
        
        for (const memory of memories) {
            for (const topic of memory.topics) {
                topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
            }
            for (const entity of memory.entities) {
                entityCounts.set(entity, (entityCounts.get(entity) || 0) + 1);
            }
        }
        
        const topTopics = Array.from(topicCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([topic]) => topic);
            
        const topEntities = Array.from(entityCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([entity]) => entity);
        
        const compressedCount = memories.filter(m => m.compressionLevel > 0).length;
        const compressionRatio = memories.length > 0 ? compressedCount / memories.length : 0;
        
        return {
            totalMemories: memories.length,
            cacheHitRate,
            averageImportance: avgImportance || 0,
            topTopics,
            topEntities,
            compressionRatio
        };
    }

    async cleanup(): Promise<void> {
        await this.saveIndexes();
        this.eventEmitter.removeAllListeners();
        console.log('🧹 Enhanced memory system cleaned up');
    }
}

export default EnhancedMemorySystem; 