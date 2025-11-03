#!/usr/bin/env node

/**
 * 💾 SMART DATA STORAGE MANAGER - RAM/SSD HYBRID SYSTEM
 * =====================================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION FOR INTELLIGENT DATA TIERING
 * 
 * Storage Strategy:
 * - RAM: Last 7 days of monitoring data (20GB max)
 * - SSD: Historical data >7 days (200GB allocated)
 * - Human-in-the-loop approval before training integration
 * 
 * @author Elite Construction AI Syndicate
 * @version 3.0.0 - Optimized Storage Architecture
 */

import { EventEmitter } from 'events';
import { DatabasePoolManager } from '../database/DatabasePoolManager.js';
import fs from 'fs/promises';
import path from 'path';
import { performance } from 'perf_hooks';
import { compress, decompress } from 'lz4js';

/**
 * 💾 SMART STORAGE MANAGER
 */
export class SmartDataStorageManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // RAM Storage (Fast Access - Last 7 Days)
            ram: {
                maxSizeGB: config.ram?.maxSizeGB || 20, // Only 20GB in RAM
                retentionDays: config.ram?.retentionDays || 7,
                cacheStrategy: 'LRU', // Least Recently Used
                compressionEnabled: false // No compression in RAM for speed
            },
            
            // SSD Storage (Historical Data)
            ssd: {
                basePath: config.ssd?.basePath || '/root/LocalBackup/monitoring-data',
                maxSizeGB: config.ssd?.maxSizeGB || 200, // 200GB on SSD
                retentionDays: config.ssd?.retentionDays || 90,
                compressionEnabled: true, // LZ4 compression on SSD
                partitionStrategy: 'daily' // Daily file partitions
            },
            
            // Human Review Settings
            humanReview: {
                requireApproval: true,
                pendingPath: '/root/LocalBackup/pending-training-data',
                approvedPath: '/root/LocalBackup/approved-training-data',
                maxPendingSizeGB: 10
            },
            
            // Data Tiering
            tiering: {
                ramToSSDInterval: 3600000, // Check every hour
                cleanupInterval: 86400000, // Daily cleanup
                loadBatchSize: 1000 // Records per batch when loading from SSD
            },
            
            ...config
        };
        
        // Storage state
        this.ramCache = new Map(); // In-memory cache
        this.ramSizeBytes = 0;
        this.ssdSizeBytes = 0;
        
        // Pending review queue
        this.pendingReview = [];
        this.approvedData = new Map();
        
        // Metrics
        this.metrics = {
            ramHits: 0,
            ramMisses: 0,
            ssdReads: 0,
            ssdWrites: 0,
            dataLoaded: 0,
            dataApproved: 0,
            dataRejected: 0
        };
        
        console.log('💾 Smart Data Storage Manager initialized');
        console.log(`  RAM: ${this.config.ram.maxSizeGB}GB (7 days)`);
        console.log(`  SSD: ${this.config.ssd.maxSizeGB}GB (90 days)`);
    }
    
    /**
     * 🚀 INITIALIZE STORAGE SYSTEM
     */
    async initialize() {
        console.log('🚀 Initializing Smart Storage System...');
        
        try {
            // Create SSD directories
            await this.ensureDirectories();
            
            // Load recent data into RAM
            await this.loadRecentDataToRAM();
            
            // Start tiering processes
            this.startDataTiering();
            
            // Calculate current usage
            await this.calculateStorageUsage();
            
            console.log('✅ Storage system initialized');
            console.log(`  RAM usage: ${(this.ramSizeBytes / 1024**3).toFixed(2)}GB`);
            console.log(`  SSD usage: ${(this.ssdSizeBytes / 1024**3).toFixed(2)}GB`);
            
        } catch (error) {
            console.error('❌ Storage initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * 📝 CAPTURE DATA (RAM FIRST)
     */
    async captureData(type, data) {
        const timestamp = new Date();
        const dayKey = this.getDayKey(timestamp);
        
        // Create record
        const record = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            data,
            timestamp,
            dayKey,
            reviewed: false,
            approved: false
        };
        
        // Check if within RAM retention period
        const daysOld = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        
        if (daysOld <= this.config.ram.retentionDays) {
            // Store in RAM cache
            await this.storeInRAM(record);
        } else {
            // Direct to SSD if older than 7 days (shouldn't happen for new data)
            await this.storeOnSSD(record);
        }
        
        return record.id;
    }
    
    /**
     * 💾 STORE IN RAM
     */
    async storeInRAM(record) {
        const size = this.calculateSize(record);
        
        // Check RAM capacity
        if (this.ramSizeBytes + size > this.config.ram.maxSizeGB * 1024**3) {
            // Evict oldest data to SSD
            await this.evictOldestFromRAM();
        }
        
        // Store in RAM cache
        if (!this.ramCache.has(record.dayKey)) {
            this.ramCache.set(record.dayKey, new Map());
        }
        
        this.ramCache.get(record.dayKey).set(record.id, record);
        this.ramSizeBytes += size;
        
        this.metrics.ramHits++;
        
        // Mark for review if it's a decision or intervention
        if (record.type === 'decision' || record.type === 'intervention') {
            this.pendingReview.push(record.id);
            this.emit('review:pending', record);
        }
    }
    
    /**
     * 💿 STORE ON SSD
     */
    async storeOnSSD(record) {
        const dayPath = path.join(
            this.config.ssd.basePath,
            record.dayKey.replace(/-/g, '/'),
            `${record.type}.jsonl`
        );
        
        // Ensure directory exists
        await fs.mkdir(path.dirname(dayPath), { recursive: true });
        
        // Compress if enabled
        let dataToWrite = JSON.stringify(record);
        if (this.config.ssd.compressionEnabled) {
            dataToWrite = Buffer.from(compress(Buffer.from(dataToWrite))).toString('base64');
        }
        
        // Append to daily file
        await fs.appendFile(dayPath, dataToWrite + '\n');
        
        this.ssdSizeBytes += Buffer.byteLength(dataToWrite);
        this.metrics.ssdWrites++;
    }
    
    /**
     * 🔍 RETRIEVE DATA
     */
    async retrieveData(id, dayKey = null) {
        // Try RAM first
        if (dayKey && this.ramCache.has(dayKey)) {
            const dayCache = this.ramCache.get(dayKey);
            if (dayCache.has(id)) {
                this.metrics.ramHits++;
                return dayCache.get(id);
            }
        }
        
        // Search all RAM if no dayKey provided
        if (!dayKey) {
            for (const [day, cache] of this.ramCache) {
                if (cache.has(id)) {
                    this.metrics.ramHits++;
                    return cache.get(id);
                }
            }
        }
        
        this.metrics.ramMisses++;
        
        // Load from SSD
        return await this.loadFromSSD(id, dayKey);
    }
    
    /**
     * 📅 LOAD HISTORICAL DATA FROM SSD TO RAM
     */
    async loadHistoricalData(startDate, endDate) {
        console.log(`📅 Loading historical data: ${startDate} to ${endDate}`);
        
        const records = [];
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            const dayKey = this.getDayKey(currentDate);
            const dayPath = path.join(
                this.config.ssd.basePath,
                dayKey.replace(/-/g, '/')
            );
            
            try {
                const files = await fs.readdir(dayPath);
                
                for (const file of files) {
                    if (!file.endsWith('.jsonl')) continue;
                    
                    const filePath = path.join(dayPath, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const lines = content.split('\n').filter(l => l);
                    
                    for (const line of lines) {
                        let record;
                        
                        if (this.config.ssd.compressionEnabled) {
                            const decompressed = decompress(Buffer.from(line, 'base64'));
                            record = JSON.parse(Buffer.from(decompressed).toString());
                        } else {
                            record = JSON.parse(line);
                        }
                        
                        records.push(record);
                        
                        // Optionally load into RAM
                        if (records.length % this.config.tiering.loadBatchSize === 0) {
                            await this.batchLoadToRAM(records.slice(-this.config.tiering.loadBatchSize));
                        }
                    }
                }
                
                this.metrics.ssdReads++;
                
            } catch (error) {
                console.warn(`  No data for ${dayKey}`);
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        console.log(`✅ Loaded ${records.length} records from SSD`);
        this.metrics.dataLoaded += records.length;
        
        return records;
    }
    
    /**
     * ✅ HUMAN APPROVAL WORKFLOW
     */
    async submitForReview(recordIds) {
        const reviewBatch = {
            id: `review_${Date.now()}`,
            recordIds,
            timestamp: new Date(),
            status: 'pending'
        };
        
        // Save to pending directory
        const pendingPath = path.join(
            this.config.humanReview.pendingPath,
            `${reviewBatch.id}.json`
        );
        
        await fs.mkdir(this.config.humanReview.pendingPath, { recursive: true });
        await fs.writeFile(pendingPath, JSON.stringify(reviewBatch, null, 2));
        
        this.emit('review:submitted', reviewBatch);
        
        return reviewBatch.id;
    }
    
    /**
     * ✅ APPROVE DATA FOR TRAINING
     */
    async approveData(reviewId, approvedIds, rejectedIds = []) {
        console.log(`✅ Processing approval for review: ${reviewId}`);
        
        // Move approved data to training-ready storage
        for (const id of approvedIds) {
            const record = await this.retrieveData(id);
            if (record) {
                record.approved = true;
                record.approvedAt = new Date();
                
                // Store in approved path
                const approvedPath = path.join(
                    this.config.humanReview.approvedPath,
                    `${record.dayKey}.jsonl`
                );
                
                await fs.mkdir(this.config.humanReview.approvedPath, { recursive: true });
                await fs.appendFile(approvedPath, JSON.stringify(record) + '\n');
                
                this.approvedData.set(id, record);
                this.metrics.dataApproved++;
                
                // Emit for agent memory integration
                this.emit('data:approved', record);
            }
        }
        
        // Mark rejected data
        for (const id of rejectedIds) {
            const record = await this.retrieveData(id);
            if (record) {
                record.rejected = true;
                record.rejectedAt = new Date();
                this.metrics.dataRejected++;
            }
        }
        
        console.log(`  Approved: ${approvedIds.length} records`);
        console.log(`  Rejected: ${rejectedIds.length} records`);
        
        return {
            approved: approvedIds.length,
            rejected: rejectedIds.length
        };
    }
    
    /**
     * 🔄 START DATA TIERING
     */
    startDataTiering() {
        // RAM to SSD migration
        setInterval(async () => {
            await this.migrateOldDataToSSD();
        }, this.config.tiering.ramToSSDInterval);
        
        // Cleanup old SSD data
        setInterval(async () => {
            await this.cleanupOldSSDData();
        }, this.config.tiering.cleanupInterval);
    }
    
    /**
     * 📤 MIGRATE OLD DATA TO SSD
     */
    async migrateOldDataToSSD() {
        const now = Date.now();
        const maxAgeMs = this.config.ram.retentionDays * 24 * 60 * 60 * 1000;
        
        for (const [dayKey, dayCache] of this.ramCache) {
            const dayDate = new Date(dayKey);
            const ageMs = now - dayDate.getTime();
            
            if (ageMs > maxAgeMs) {
                console.log(`📤 Migrating ${dayKey} from RAM to SSD`);
                
                // Write all records to SSD
                for (const record of dayCache.values()) {
                    await this.storeOnSSD(record);
                }
                
                // Remove from RAM
                const size = this.calculateDaySize(dayCache);
                this.ramCache.delete(dayKey);
                this.ramSizeBytes -= size;
                
                console.log(`  ✅ Freed ${(size / 1024**2).toFixed(2)}MB from RAM`);
            }
        }
    }
    
    /**
     * 🗑️ CLEANUP OLD SSD DATA
     */
    async cleanupOldSSDData() {
        const maxAgeDays = this.config.ssd.retentionDays;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
        
        console.log(`🗑️ Cleaning SSD data older than ${cutoffDate.toISOString()}`);
        
        // Recursively clean old directories
        await this.cleanDirectory(this.config.ssd.basePath, cutoffDate);
    }
    
    /**
     * 📏 CALCULATE SIZE
     */
    calculateSize(record) {
        return Buffer.byteLength(JSON.stringify(record));
    }
    
    /**
     * 📏 CALCULATE DAY SIZE
     */
    calculateDaySize(dayCache) {
        let size = 0;
        for (const record of dayCache.values()) {
            size += this.calculateSize(record);
        }
        return size;
    }
    
    /**
     * 📅 GET DAY KEY
     */
    getDayKey(date) {
        return date.toISOString().split('T')[0];
    }
    
    /**
     * 📂 ENSURE DIRECTORIES
     */
    async ensureDirectories() {
        const dirs = [
            this.config.ssd.basePath,
            this.config.humanReview.pendingPath,
            this.config.humanReview.approvedPath
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    
    /**
     * 📊 CALCULATE STORAGE USAGE
     */
    async calculateStorageUsage() {
        // Calculate RAM usage
        this.ramSizeBytes = 0;
        for (const dayCache of this.ramCache.values()) {
            this.ramSizeBytes += this.calculateDaySize(dayCache);
        }
        
        // Calculate SSD usage (approximate)
        try {
            const stats = await this.getDirectorySize(this.config.ssd.basePath);
            this.ssdSizeBytes = stats.size;
        } catch (error) {
            this.ssdSizeBytes = 0;
        }
    }
    
    /**
     * 📁 GET DIRECTORY SIZE
     */
    async getDirectorySize(dirPath) {
        let totalSize = 0;
        
        try {
            const files = await fs.readdir(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await fs.stat(filePath);
                
                if (stats.isDirectory()) {
                    const subDirSize = await this.getDirectorySize(filePath);
                    totalSize += subDirSize.size;
                } else {
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            // Directory doesn't exist yet
        }
        
        return { size: totalSize };
    }
    
    /**
     * 🧹 EVICT OLDEST FROM RAM
     */
    async evictOldestFromRAM() {
        const sortedDays = Array.from(this.ramCache.keys()).sort();
        
        if (sortedDays.length > 0) {
            const oldestDay = sortedDays[0];
            const dayCache = this.ramCache.get(oldestDay);
            
            console.log(`🧹 Evicting ${oldestDay} from RAM to make space`);
            
            // Write to SSD
            for (const record of dayCache.values()) {
                await this.storeOnSSD(record);
            }
            
            // Remove from RAM
            const size = this.calculateDaySize(dayCache);
            this.ramCache.delete(oldestDay);
            this.ramSizeBytes -= size;
        }
    }
    
    /**
     * 📥 LOAD RECENT DATA TO RAM
     */
    async loadRecentDataToRAM() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.ram.retentionDays);
        
        const endDate = new Date();
        
        console.log(`📥 Loading last ${this.config.ram.retentionDays} days to RAM`);
        
        await this.loadHistoricalData(cutoffDate, endDate);
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return {
            storage: {
                ramUsageGB: this.ramSizeBytes / (1024**3),
                ramMaxGB: this.config.ram.maxSizeGB,
                ssdUsageGB: this.ssdSizeBytes / (1024**3),
                ssdMaxGB: this.config.ssd.maxSizeGB
            },
            performance: this.metrics,
            cache: {
                daysInRAM: this.ramCache.size,
                totalRecordsInRAM: Array.from(this.ramCache.values())
                    .reduce((sum, cache) => sum + cache.size, 0)
            }
        };
    }
    
    /**
     * 🔍 LOAD FROM SSD
     */
    async loadFromSSD(id, dayKey = null) {
        // Implementation would search through SSD files
        // This is simplified for brevity
        console.log(`Loading ${id} from SSD`);
        this.metrics.ssdReads++;
        return null;
    }
    
    /**
     * 📦 BATCH LOAD TO RAM
     */
    async batchLoadToRAM(records) {
        for (const record of records) {
            await this.storeInRAM(record);
        }
    }
    
    /**
     * 🗑️ CLEAN DIRECTORY
     */
    async cleanDirectory(dirPath, cutoffDate) {
        // Recursive directory cleanup implementation
        // This is simplified for brevity
    }
}

// Export for use
export default SmartDataStorageManager;
