/**
 * ⚡ ATTENTION CACHE SYSTEM - TOP 1% IMPLEMENTATION
 * ==================================================
 * 
 * High-performance caching for transformer attention computations
 * Optimized for 128GB cache with NVMe SSD backing
 * 
 * Features:
 * - Multi-level caching (RAM + NVMe)
 * - LRU eviction policy
 * - Similarity-based cache matching
 * - Compressed storage
 * - Async persistence
 */

import EventEmitter from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export class AttentionCache extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Cache configuration
            maxSize: config.maxSize || 128 * 1024 * 1024 * 1024, // 128GB
            ssdPath: config.ssdPath || '/mnt/nvme3/weights',
            
            // Cache levels
            l1Size: 32 * 1024 * 1024 * 1024, // 32GB hot cache
            l2Size: 64 * 1024 * 1024 * 1024, // 64GB warm cache  
            l3Size: 32 * 1024 * 1024 * 1024, // 32GB cold cache (SSD)
            
            // Eviction policy
            evictionPolicy: 'lru', // lru, lfu, adaptive
            evictionThreshold: 0.9, // Start eviction at 90% full
            
            // Similarity matching
            similarityThreshold: 0.98, // Use cached result if 98% similar
            useFuzzyMatching: true,
            
            // Compression
            compressionEnabled: true,
            compressionLevel: 6, // zlib compression level (1-9)
            
            // Persistence
            persistInterval: 300000, // Save to disk every 5 minutes
            asyncPersist: true,
            
            // Performance
            maxConcurrentReads: 32,
            maxConcurrentWrites: 16,
            
            ...config
        };
        
        // Cache storage
        this.l1Cache = new Map(); // Hot cache
        this.l2Cache = new Map(); // Warm cache
        this.l3Index = new Map(); // Cold cache index (actual data on SSD)
        
        // Metadata
        this.accessHistory = new Map(); // Track access patterns
        this.cacheStats = {
            hits: 0,
            misses: 0,
            partialHits: 0,
            evictions: 0,
            compressionRatio: 0,
            currentSize: 0,
            l1Size: 0,
            l2Size: 0,
            l3Size: 0
        };
        
        // Locks for concurrent access
        this.readLocks = new Set();
        this.writeLocks = new Set();
        
        this.persistTimer = null;
        this.initialized = false;
    }
    
    /**
     * 🚀 INITIALIZE CACHE SYSTEM
     */
    async initialize() {
        console.log('⚡ Initializing Attention Cache System...');
        
        try {
            // Create SSD cache directory
            await fs.mkdir(this.config.ssdPath, { recursive: true });
            
            // Load existing cache index from disk
            await this.loadCacheIndex();
            
            // Start persistence timer
            if (this.config.asyncPersist) {
                this.startPersistence();
            }
            
            // Setup eviction monitoring
            this.setupEvictionMonitoring();
            
            this.initialized = true;
            console.log('✅ Attention Cache initialized');
            console.log(`L1 Cache: ${this.formatBytes(this.config.l1Size)}`);
            console.log(`L2 Cache: ${this.formatBytes(this.config.l2Size)}`);
            console.log(`L3 Cache: ${this.formatBytes(this.config.l3Size)} (SSD)`);
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize attention cache:', error);
            throw error;
        }
    }
    
    /**
     * 🔍 GET CACHED ATTENTION
     */
    async get(key, options = {}) {
        const startTime = Date.now();
        
        // Generate cache key
        const cacheKey = this.generateCacheKey(key);
        
        // Check L1 cache (hot)
        if (this.l1Cache.has(cacheKey)) {
            this.updateAccessHistory(cacheKey, 'l1');
            this.cacheStats.hits++;
            
            const entry = this.l1Cache.get(cacheKey);
            return this.deserializeEntry(entry);
        }
        
        // Check L2 cache (warm)
        if (this.l2Cache.has(cacheKey)) {
            this.updateAccessHistory(cacheKey, 'l2');
            this.cacheStats.hits++;
            
            const entry = this.l2Cache.get(cacheKey);
            
            // Promote to L1 if frequently accessed
            if (this.shouldPromote(cacheKey, 'l2')) {
                await this.promoteEntry(cacheKey, entry, 'l2', 'l1');
            }
            
            return this.deserializeEntry(entry);
        }
        
        // Check L3 cache (cold, on SSD)
        if (this.l3Index.has(cacheKey)) {
            const entry = await this.loadFromSSD(cacheKey);
            
            if (entry) {
                this.updateAccessHistory(cacheKey, 'l3');
                this.cacheStats.hits++;
                
                // Promote to L2 if accessed
                if (this.shouldPromote(cacheKey, 'l3')) {
                    await this.promoteEntry(cacheKey, entry, 'l3', 'l2');
                }
                
                return this.deserializeEntry(entry);
            }
        }
        
        // Try fuzzy matching if enabled
        if (this.config.useFuzzyMatching && options.allowFuzzy !== false) {
            const similarEntry = await this.findSimilarEntry(key);
            
            if (similarEntry) {
                this.cacheStats.partialHits++;
                return similarEntry;
            }
        }
        
        // Cache miss
        this.cacheStats.misses++;
        return null;
    }
    
    /**
     * 💾 SET CACHED ATTENTION
     */
    async set(key, value, options = {}) {
        const startTime = Date.now();
        
        // Generate cache key
        const cacheKey = this.generateCacheKey(key);
        
        // Serialize and optionally compress
        const entry = await this.serializeEntry(value, options);
        const entrySize = this.calculateEntrySize(entry);
        
        // Check if we need to evict
        if (this.cacheStats.l1Size + entrySize > this.config.l1Size * this.config.evictionThreshold) {
            await this.evictEntries('l1', entrySize);
        }
        
        // Add to L1 cache
        this.l1Cache.set(cacheKey, entry);
        this.cacheStats.l1Size += entrySize;
        this.cacheStats.currentSize += entrySize;
        
        // Update access history
        this.updateAccessHistory(cacheKey, 'l1');
        
        // Async persist to SSD if configured
        if (options.persist || this.config.asyncPersist) {
            setImmediate(() => this.persistToSSD(cacheKey, entry));
        }
        
        return cacheKey;
    }
    
    /**
     * 🔄 FIND SIMILAR ENTRY
     */
    async findSimilarEntry(key) {
        const targetHash = this.hashKey(key);
        let bestMatch = null;
        let bestSimilarity = 0;
        
        // Search L1 cache
        for (const [cacheKey, entry] of this.l1Cache) {
            const similarity = this.calculateSimilarity(targetHash, cacheKey);
            
            if (similarity > this.config.similarityThreshold && similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = entry;
            }
        }
        
        // If good enough match found, return it
        if (bestMatch && bestSimilarity > this.config.similarityThreshold) {
            return this.deserializeEntry(bestMatch);
        }
        
        // Search L2 cache if needed
        if (!bestMatch || bestSimilarity < this.config.similarityThreshold) {
            for (const [cacheKey, entry] of this.l2Cache) {
                const similarity = this.calculateSimilarity(targetHash, cacheKey);
                
                if (similarity > this.config.similarityThreshold && similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    bestMatch = entry;
                }
            }
        }
        
        return bestMatch ? this.deserializeEntry(bestMatch) : null;
    }
    
    /**
     * 🚮 EVICT ENTRIES
     */
    async evictEntries(level, requiredSpace) {
        console.log(`🚮 Evicting entries from ${level} to free ${this.formatBytes(requiredSpace)}`);
        
        const cache = this.getCacheLevel(level);
        const entries = [];
        
        // Collect entries with access info
        for (const [key, entry] of cache) {
            const accessInfo = this.accessHistory.get(key) || { count: 0, lastAccess: 0 };
            entries.push({
                key,
                entry,
                size: this.calculateEntrySize(entry),
                score: this.calculateEvictionScore(accessInfo)
            });
        }
        
        // Sort by eviction score (lower score = evict first)
        entries.sort((a, b) => a.score - b.score);
        
        let freedSpace = 0;
        const toEvict = [];
        
        for (const item of entries) {
            if (freedSpace >= requiredSpace) break;
            
            toEvict.push(item);
            freedSpace += item.size;
        }
        
        // Perform evictions
        for (const item of toEvict) {
            cache.delete(item.key);
            this.cacheStats.evictions++;
            
            // Demote to next level if applicable
            if (level === 'l1') {
                await this.demoteEntry(item.key, item.entry, 'l1', 'l2');
            } else if (level === 'l2') {
                await this.demoteEntry(item.key, item.entry, 'l2', 'l3');
            }
        }
        
        // Update size stats
        this.updateSizeStats();
        
        console.log(`✅ Evicted ${toEvict.length} entries, freed ${this.formatBytes(freedSpace)}`);
    }
    
    /**
     * 📈 PROMOTE ENTRY TO HIGHER CACHE LEVEL
     */
    async promoteEntry(key, entry, fromLevel, toLevel) {
        const fromCache = this.getCacheLevel(fromLevel);
        const toCache = this.getCacheLevel(toLevel);
        const entrySize = this.calculateEntrySize(entry);
        
        // Check space in target level
        const toSizeKey = `${toLevel}Size`;
        const maxSize = this.config[toSizeKey];
        
        if (this.cacheStats[toSizeKey] + entrySize > maxSize * this.config.evictionThreshold) {
            await this.evictEntries(toLevel, entrySize);
        }
        
        // Move entry
        fromCache.delete(key);
        toCache.set(key, entry);
        
        // Update stats
        this.cacheStats[`${fromLevel}Size`] -= entrySize;
        this.cacheStats[toSizeKey] += entrySize;
    }
    
    /**
     * 📉 DEMOTE ENTRY TO LOWER CACHE LEVEL
     */
    async demoteEntry(key, entry, fromLevel, toLevel) {
        if (toLevel === 'l3') {
            // Save to SSD
            await this.persistToSSD(key, entry);
            this.l3Index.set(key, {
                size: this.calculateEntrySize(entry),
                timestamp: Date.now(),
                compressed: entry.compressed || false
            });
            this.cacheStats.l3Size += this.calculateEntrySize(entry);
        } else {
            const toCache = this.getCacheLevel(toLevel);
            toCache.set(key, entry);
            this.cacheStats[`${toLevel}Size`] += this.calculateEntrySize(entry);
        }
    }
    
    /**
     * 💾 PERSIST TO SSD
     */
    async persistToSSD(key, entry) {
        const filePath = path.join(this.config.ssdPath, `${key}.cache`);
        
        try {
            // Compress if not already compressed
            let data = entry.data;
            if (!entry.compressed && this.config.compressionEnabled) {
                data = await gzip(data, { level: this.config.compressionLevel });
            }
            
            // Write to SSD
            await fs.writeFile(filePath, data);
            
            // Update L3 index
            this.l3Index.set(key, {
                path: filePath,
                size: data.length,
                timestamp: Date.now(),
                compressed: true
            });
            
        } catch (error) {
            console.error(`Failed to persist cache entry ${key}:`, error);
        }
    }
    
    /**
     * 📂 LOAD FROM SSD
     */
    async loadFromSSD(key) {
        const indexEntry = this.l3Index.get(key);
        
        if (!indexEntry) return null;
        
        const filePath = indexEntry.path || path.join(this.config.ssdPath, `${key}.cache`);
        
        try {
            let data = await fs.readFile(filePath);
            
            // Decompress if needed
            if (indexEntry.compressed) {
                data = await gunzip(data);
            }
            
            return {
                data,
                compressed: false,
                timestamp: indexEntry.timestamp
            };
            
        } catch (error) {
            console.error(`Failed to load cache entry ${key}:`, error);
            this.l3Index.delete(key);
            return null;
        }
    }
    
    /**
     * 📊 CALCULATE EVICTION SCORE
     */
    calculateEvictionScore(accessInfo) {
        const now = Date.now();
        const recency = now - (accessInfo.lastAccess || 0);
        const frequency = accessInfo.count || 0;
        
        // LRU: prioritize recency
        if (this.config.evictionPolicy === 'lru') {
            return -recency; // More recent = higher score
        }
        
        // LFU: prioritize frequency
        if (this.config.evictionPolicy === 'lfu') {
            return frequency;
        }
        
        // Adaptive: combine recency and frequency
        const recencyScore = 1 / (1 + recency / 3600000); // Decay over hours
        const frequencyScore = Math.log(1 + frequency);
        
        return recencyScore * 0.7 + frequencyScore * 0.3;
    }
    
    /**
     * 🔄 SERIALIZE ENTRY
     */
    async serializeEntry(value, options) {
        let data = Buffer.from(JSON.stringify(value));
        let compressed = false;
        
        // Compress if enabled and beneficial
        if (this.config.compressionEnabled && data.length > 1024) {
            const compressedData = await gzip(data, { 
                level: options.compressionLevel || this.config.compressionLevel 
            });
            
            // Only use compression if it reduces size
            if (compressedData.length < data.length * 0.9) {
                data = compressedData;
                compressed = true;
                
                // Update compression ratio stat
                const ratio = compressedData.length / data.length;
                this.cacheStats.compressionRatio = 
                    (this.cacheStats.compressionRatio * 0.9 + ratio * 0.1);
            }
        }
        
        return {
            data,
            compressed,
            timestamp: Date.now(),
            metadata: options.metadata || {}
        };
    }
    
    /**
     * 🔄 DESERIALIZE ENTRY
     */
    async deserializeEntry(entry) {
        let data = entry.data;
        
        // Decompress if needed
        if (entry.compressed) {
            data = await gunzip(data);
        }
        
        return JSON.parse(data.toString());
    }
    
    /**
     * 📏 CALCULATE ENTRY SIZE
     */
    calculateEntrySize(entry) {
        if (!entry) return 0;
        
        let size = 0;
        
        if (entry.data) {
            size += entry.data.length;
        }
        
        // Add metadata overhead
        size += 256; // Estimated metadata size
        
        return size;
    }
    
    /**
     * 🔑 GENERATE CACHE KEY
     */
    generateCacheKey(input) {
        if (typeof input === 'string') {
            return input;
        }
        
        // Create hash for complex objects
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(input));
        return hash.digest('hex');
    }
    
    /**
     * 🔑 HASH KEY
     */
    hashKey(key) {
        const hash = crypto.createHash('sha256');
        hash.update(typeof key === 'string' ? key : JSON.stringify(key));
        return hash.digest();
    }
    
    /**
     * 📊 CALCULATE SIMILARITY
     */
    calculateSimilarity(hash1, hash2) {
        // Hamming distance based similarity
        let distance = 0;
        const len = Math.min(hash1.length, hash2.length);
        
        for (let i = 0; i < len; i++) {
            if (hash1[i] !== hash2[i]) {
                distance++;
            }
        }
        
        return 1 - (distance / len);
    }
    
    /**
     * 🔄 UPDATE ACCESS HISTORY
     */
    updateAccessHistory(key, level) {
        const history = this.accessHistory.get(key) || { count: 0, lastAccess: 0 };
        
        history.count++;
        history.lastAccess = Date.now();
        history.level = level;
        
        this.accessHistory.set(key, history);
    }
    
    /**
     * 📈 SHOULD PROMOTE
     */
    shouldPromote(key, currentLevel) {
        const history = this.accessHistory.get(key);
        
        if (!history) return false;
        
        // Promote if accessed frequently or recently
        const recentAccess = Date.now() - history.lastAccess < 60000; // Within 1 minute
        const frequentAccess = history.count > 5;
        
        return recentAccess || frequentAccess;
    }
    
    /**
     * 🗂️ GET CACHE LEVEL
     */
    getCacheLevel(level) {
        switch (level) {
            case 'l1':
                return this.l1Cache;
            case 'l2':
                return this.l2Cache;
            case 'l3':
                return this.l3Index;
            default:
                throw new Error(`Invalid cache level: ${level}`);
        }
    }
    
    /**
     * 📊 UPDATE SIZE STATS
     */
    updateSizeStats() {
        this.cacheStats.l1Size = this.calculateCacheSize(this.l1Cache);
        this.cacheStats.l2Size = this.calculateCacheSize(this.l2Cache);
        this.cacheStats.currentSize = this.cacheStats.l1Size + this.cacheStats.l2Size + this.cacheStats.l3Size;
    }
    
    /**
     * 📏 CALCULATE CACHE SIZE
     */
    calculateCacheSize(cache) {
        let size = 0;
        
        for (const entry of cache.values()) {
            size += this.calculateEntrySize(entry);
        }
        
        return size;
    }
    
    /**
     * 💾 LOAD CACHE INDEX
     */
    async loadCacheIndex() {
        const indexPath = path.join(this.config.ssdPath, 'cache.index');
        
        try {
            const indexData = await fs.readFile(indexPath, 'utf-8');
            const index = JSON.parse(indexData);
            
            // Restore L3 index
            for (const [key, entry] of Object.entries(index.l3)) {
                this.l3Index.set(key, entry);
            }
            
            this.cacheStats.l3Size = index.l3Size || 0;
            
            console.log(`📂 Loaded ${this.l3Index.size} L3 cache entries from disk`);
            
        } catch (error) {
            // Index doesn't exist yet, that's OK
            if (error.code !== 'ENOENT') {
                console.warn('Failed to load cache index:', error);
            }
        }
    }
    
    /**
     * 💾 SAVE CACHE INDEX
     */
    async saveCacheIndex() {
        const indexPath = path.join(this.config.ssdPath, 'cache.index');
        
        const index = {
            l3: Object.fromEntries(this.l3Index),
            l3Size: this.cacheStats.l3Size,
            timestamp: Date.now()
        };
        
        try {
            await fs.writeFile(indexPath, JSON.stringify(index));
        } catch (error) {
            console.error('Failed to save cache index:', error);
        }
    }
    
    /**
     * 🔄 START PERSISTENCE
     */
    startPersistence() {
        this.persistTimer = setInterval(async () => {
            await this.saveCacheIndex();
        }, this.config.persistInterval);
    }
    
    /**
     * 🎯 SETUP EVICTION MONITORING
     */
    setupEvictionMonitoring() {
        setInterval(() => {
            const l1Usage = this.cacheStats.l1Size / this.config.l1Size;
            const l2Usage = this.cacheStats.l2Size / this.config.l2Size;
            
            if (l1Usage > this.config.evictionThreshold) {
                setImmediate(() => this.evictEntries('l1', this.config.l1Size * 0.1));
            }
            
            if (l2Usage > this.config.evictionThreshold) {
                setImmediate(() => this.evictEntries('l2', this.config.l2Size * 0.1));
            }
        }, 10000); // Check every 10 seconds
    }
    
    // Helper methods
    
    formatBytes(bytes) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
    
    /**
     * 📊 GET STATISTICS
     */
    getStats() {
        const hitRate = this.cacheStats.hits / 
            (this.cacheStats.hits + this.cacheStats.misses) || 0;
        
        return {
            ...this.cacheStats,
            hitRate,
            l1Entries: this.l1Cache.size,
            l2Entries: this.l2Cache.size,
            l3Entries: this.l3Index.size,
            l1Usage: this.cacheStats.l1Size / this.config.l1Size,
            l2Usage: this.cacheStats.l2Size / this.config.l2Size,
            l3Usage: this.cacheStats.l3Size / this.config.l3Size
        };
    }
    
    /**
     * 🧹 CLEAR CACHE
     */
    async clear(level = 'all') {
        console.log(`🧹 Clearing cache level: ${level}`);
        
        if (level === 'all' || level === 'l1') {
            this.l1Cache.clear();
            this.cacheStats.l1Size = 0;
        }
        
        if (level === 'all' || level === 'l2') {
            this.l2Cache.clear();
            this.cacheStats.l2Size = 0;
        }
        
        if (level === 'all' || level === 'l3') {
            // Clear SSD files
            for (const [key, entry] of this.l3Index) {
                const filePath = entry.path || path.join(this.config.ssdPath, `${key}.cache`);
                
                try {
                    await fs.unlink(filePath);
                } catch (error) {
                    // File might not exist
                }
            }
            
            this.l3Index.clear();
            this.cacheStats.l3Size = 0;
        }
        
        if (level === 'all') {
            this.accessHistory.clear();
            this.cacheStats.hits = 0;
            this.cacheStats.misses = 0;
            this.cacheStats.partialHits = 0;
            this.cacheStats.evictions = 0;
        }
        
        this.updateSizeStats();
        await this.saveCacheIndex();
    }
    
    /**
     * 💾 SAVE
     */
    async save() {
        await this.saveCacheIndex();
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('🛑 Shutting down Attention Cache...');
        
        // Stop persistence timer
        if (this.persistTimer) {
            clearInterval(this.persistTimer);
        }
        
        // Save final state
        await this.saveCacheIndex();
        
        this.removeAllListeners();
        console.log('✅ Attention Cache shutdown complete');
    }
}
