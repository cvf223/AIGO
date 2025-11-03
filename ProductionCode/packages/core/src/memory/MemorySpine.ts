import { EventEmitter } from 'events';
import type { UUID, Memory, IAgentRuntime } from '../types';

export interface SemanticQuery {
    text: string;
    embedding?: number[];
    roomId?: UUID;
    agentId?: UUID;
    timeRange?: {
        start?: number;
        end?: number;
    };
    similarityThreshold?: number;
}

export interface MemoryEvent {
    type: 'store' | 'recall' | 'evict' | 'embed';
    memoryId?: UUID;
    roomId: UUID;
    agentId: UUID;
    content?: any;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface MemoryRecord extends Memory {
    relevanceScore?: number;
    recencyWeight?: number;
    accessCount?: number;
    lastAccessed?: number;
}

export interface VectorStore {
    search(embedding: number[], options: {
        threshold?: number;
        limit?: number;
        roomId?: UUID;
        agentId?: UUID;
    }): Promise<MemoryRecord[]>;
    
    store(memory: Memory, embedding: number[]): Promise<void>;
    
    remove(memoryId: UUID): Promise<void>;
}

export interface ShortTermCache {
    get(key: string): Promise<any>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    flush(): Promise<void>;
}

export interface TypedEventEmitter<T> extends EventEmitter {
    emit(event: string, data: T): boolean;
    on(event: string, listener: (data: T) => void): this;
}

/**
 * Memory Spine - Unified memory architecture for the Castle
 * 
 * 💡 WHY: Single entry-point prevents context skew, enables global eviction policy,
 * and provides hybrid search capabilities across all memory types.
 * 
 * ⚙️ HOW: Combines vector store (long-term), Redis cache (short-term), 
 * and event bus (real-time) with intelligent retrieval algorithms.
 */
export class MemorySpine {
    private runtime: IAgentRuntime;
    private longTerm: VectorStore;
    private shortTerm: ShortTermCache;
    private eventBus: TypedEventEmitter<MemoryEvent>;
    
    // Memory management settings
    private readonly DEFAULT_RECALL_LIMIT = 20;
    private readonly DEFAULT_SIMILARITY_THRESHOLD = 0.7;
    private readonly SHORT_TERM_TTL = 3600; // 1 hour
    private readonly RECENCY_DECAY_FACTOR = 0.95;

    constructor(
        runtime: IAgentRuntime,
        longTerm: VectorStore,
        shortTerm: ShortTermCache,
        eventBus?: TypedEventEmitter<MemoryEvent>
    ) {
        this.runtime = runtime;
        this.longTerm = longTerm;
        this.shortTerm = shortTerm;
        this.eventBus = eventBus || new EventEmitter() as TypedEventEmitter<MemoryEvent>;
        
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.eventBus.on('store', this.handleStoreEvent.bind(this));
        this.eventBus.on('recall', this.handleRecallEvent.bind(this));
        this.eventBus.on('evict', this.handleEvictEvent.bind(this));
    }

    /**
     * Write memory event with intelligent routing
     */
    async write(event: MemoryEvent): Promise<void> {
        try {
            const timestamp = Date.now();
            const enrichedEvent = { ...event, timestamp };

            // add logic here – persist to long-term if significant
            if (this.isSignificantMemory(event)) {
                await this.persistToLongTerm(enrichedEvent);
            }

            // add logic here – cache in short-term for quick access
            await this.cacheInShortTerm(enrichedEvent);

            // add logic here – broadcast to event bus for real-time processing
            this.eventBus.emit('store', enrichedEvent);

            // add logic here – schedule TTL cleanup
            await this.scheduleTTLCleanup(enrichedEvent);

        } catch (error) {
            console.error('MemorySpine write error:', error);
            throw error;
        }
    }

    /**
     * Hybrid semantic + recency recall with BM25 fallback
     */
    async recall(query: SemanticQuery, k = this.DEFAULT_RECALL_LIMIT): Promise<MemoryRecord[]> {
        try {
            // add logic here – try short-term cache first
            const cacheKey = this.generateCacheKey(query);
            const cached = await this.shortTerm.get(cacheKey);
            if (cached) {
                this.eventBus.emit('recall', { 
                    type: 'recall', 
                    roomId: query.roomId!, 
                    agentId: query.agentId!,
                    timestamp: Date.now(),
                    metadata: { source: 'cache', query: query.text }
                });
                return cached;
            }

            // add logic here – perform hybrid search (vector + BM25)
            const vectorResults = await this.performVectorSearch(query, k);
            const textResults = await this.performTextSearch(query, k);
            
            // add logic here – merge and rank results with recency weighting
            const mergedResults = await this.mergeAndRankResults(
                vectorResults, 
                textResults, 
                query
            );

            // add logic here – cache results for future queries
            await this.shortTerm.set(cacheKey, mergedResults, this.SHORT_TERM_TTL);

            this.eventBus.emit('recall', {
                type: 'recall',
                roomId: query.roomId!,
                agentId: query.agentId!,
                timestamp: Date.now(),
                metadata: { 
                    source: 'hybrid_search',
                    query: query.text,
                    resultCount: mergedResults.length 
                }
            });

            return mergedResults;

        } catch (error) {
            console.error('MemorySpine recall error:', error);
            throw error;
        }
    }

    /**
     * Get memory by ID with caching
     */
    async getMemoryById(id: UUID): Promise<MemoryRecord | null> {
        // add logic here – check cache first, then long-term storage
        const cacheKey = `memory:${id}`;
        let memory = await this.shortTerm.get(cacheKey);
        
        if (!memory) {
            memory = await this.runtime.messageManager.getMemoryById(id);
            if (memory) {
                await this.shortTerm.set(cacheKey, memory, this.SHORT_TERM_TTL);
            }
        }
        
        return memory as MemoryRecord || null;
    }

    /**
     * Remove memory from all stores
     */
    async removeMemory(memoryId: UUID, tableName = 'messages'): Promise<void> {
        // add logic here – remove from all storage layers
        await this.longTerm.remove(memoryId);
        await this.shortTerm.delete(`memory:${memoryId}`);
        await this.runtime.messageManager.removeMemory(memoryId);
        
        this.eventBus.emit('evict', {
            type: 'evict',
            memoryId,
            roomId: '' as UUID, // Will be filled by handler
            agentId: this.runtime.agentId,
            timestamp: Date.now()
        });
    }

    /**
     * Batch operations for efficiency
     */
    async batchWrite(events: MemoryEvent[]): Promise<void> {
        // add logic here – batch process for better performance
        const promises = events.map(event => this.write(event));
        await Promise.all(promises);
    }

    async batchRecall(queries: SemanticQuery[]): Promise<MemoryRecord[][]> {
        // add logic here – parallel query processing
        const promises = queries.map(query => this.recall(query));
        return Promise.all(promises);
    }

    /**
     * Memory health and analytics
     */
    async getMemoryStats(): Promise<{
        longTermCount: number;
        shortTermCount: number;
        cacheHitRate: number;
        averageRelevanceScore: number;
    }> {
        // add logic here – collect analytics across all memory stores
        return {
            longTermCount: 0, // Implement actual counting
            shortTermCount: 0,
            cacheHitRate: 0.0,
            averageRelevanceScore: 0.0
        };
    }

    // Private helper methods

    private isSignificantMemory(event: MemoryEvent): boolean {
        // add logic here – determine if memory should persist long-term
        // Consider factors: user importance, content uniqueness, interaction frequency
        return true; // Placeholder - implement significance scoring
    }

    private async persistToLongTerm(event: MemoryEvent): Promise<void> {
        // add logic here – store in vector database with embedding
        if (event.content) {
            const memory = event.content as Memory;
            const embedding = memory.embedding || await this.generateEmbedding(memory.content.text);
            await this.longTerm.store(memory, embedding);
        }
    }

    private async cacheInShortTerm(event: MemoryEvent): Promise<void> {
        // add logic here – cache in Redis with appropriate TTL
        if (event.memoryId) {
            const cacheKey = `memory:${event.memoryId}`;
            await this.shortTerm.set(cacheKey, event.content, this.SHORT_TERM_TTL);
        }
    }

    private async scheduleTTLCleanup(event: MemoryEvent): Promise<void> {
        // add logic here – schedule automatic cleanup based on memory importance
        // Less important memories get shorter TTL
    }

    private generateCacheKey(query: SemanticQuery): string {
        // add logic here – create deterministic cache key from query parameters
        const keyParts = [
            query.text,
            query.roomId,
            query.agentId,
            query.similarityThreshold
        ];
        return `query:${keyParts.join(':')}`;
    }

    private async performVectorSearch(query: SemanticQuery, k: number): Promise<MemoryRecord[]> {
        // add logic here – vector similarity search
        const embedding = query.embedding || await this.generateEmbedding(query.text);
        return this.longTerm.search(embedding, {
            threshold: query.similarityThreshold || this.DEFAULT_SIMILARITY_THRESHOLD,
            limit: k,
            roomId: query.roomId,
            agentId: query.agentId
        });
    }

    private async performTextSearch(query: SemanticQuery, k: number): Promise<MemoryRecord[]> {
        // add logic here – BM25 text search as fallback
        // Use existing memory manager search capabilities
        const memories = await this.runtime.messageManager.getMemories({
            roomId: query.roomId!,
            count: k
        });
        return memories as MemoryRecord[];
    }

    private async mergeAndRankResults(
        vectorResults: MemoryRecord[],
        textResults: MemoryRecord[],
        query: SemanticQuery
    ): Promise<MemoryRecord[]> {
        // add logic here – combine results with weighted scoring
        const combined = [...vectorResults, ...textResults];
        const unique = this.deduplicateResults(combined);
        
        // Apply recency weighting and relevance scoring
        return unique
            .map(result => this.applyRecencyWeighting(result))
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
            .slice(0, this.DEFAULT_RECALL_LIMIT);
    }

    private deduplicateResults(results: MemoryRecord[]): MemoryRecord[] {
        const seen = new Set<string>();
        return results.filter(result => {
            const key = result.id || result.content.text;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    private applyRecencyWeighting(result: MemoryRecord): MemoryRecord {
        // add logic here – apply exponential decay based on timestamp
        const now = Date.now();
        const age = now - (result.createdAt || now);
        const recencyWeight = Math.pow(this.RECENCY_DECAY_FACTOR, age / (1000 * 60 * 60 * 24)); // Daily decay
        
        result.recencyWeight = recencyWeight;
        result.relevanceScore = (result.similarity || 0) * recencyWeight;
        
        return result;
    }

    private async generateEmbedding(text: string): Promise<number[]> {
        // add logic here – generate embedding using runtime's embedding service
        // Delegate to existing embedding generation
        const response = await this.runtime.databaseAdapter.getCachedEmbeddings({
            query_table_name: 'messages',
            query_threshold: 0.8,
            query_input: text,
            query_field_name: 'content',
            query_field_sub_name: 'text',
            query_match_count: 1
        });
        
        return response[0]?.embedding || [];
    }

    // Event handlers
    private async handleStoreEvent(event: MemoryEvent): Promise<void> {
        // add logic here – process store events for analytics and triggers
    }

    private async handleRecallEvent(event: MemoryEvent): Promise<void> {
        // add logic here – track access patterns for optimization
    }

    private async handleEvictEvent(event: MemoryEvent): Promise<void> {
        // add logic here – clean up related caches and indexes
    }
}

export default MemorySpine; 