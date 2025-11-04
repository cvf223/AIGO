/**
 * NotebookLM Client
 * Main client for interacting with NotebookLM API
 */

import { EventEmitter } from 'events';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';
import { notebookLMConfig } from './notebooklm-config.js';

export class NotebookLMClient extends EventEmitter {
    constructor(config = notebookLMConfig) {
        super();
        this.config = config;
        this.api = this.createApiClient();
        this.cache = new Map();
        this.initialized = false;
    }
    
    /**
     * Create axios instance with configuration
     */
    createApiClient() {
        const client = axios.create({
            baseURL: this.config.api.endpoint,
            timeout: this.config.api.timeout,
            headers: {
                'Authorization': `Bearer ${this.config.api.key}`,
                'Content-Type': 'application/json',
                'X-API-Version': this.config.api.version
            }
        });
        
        // Add retry logic
        client.interceptors.response.use(
            response => response,
            async error => {
                const config = error.config;
                
                if (!config || !config.retry) {
                    config.retry = 0;
                }
                
                if (config.retry < this.config.api.retryAttempts) {
                    config.retry++;
                    
                    await this.delay(this.config.api.retryDelay * config.retry);
                    
                    return client(config);
                }
                
                return Promise.reject(error);
            }
        );
        
        return client;
    }
    
    /**
     * Initialize NotebookLM connection
     */
    async initialize() {
        try {
            // Verify API connection
            const response = await this.api.get('/health');
            
            if (response.data.status !== 'healthy') {
                throw new Error('NotebookLM service is not healthy');
            }
            
            // Initialize notebooks
            await this.initializeNotebooks();
            
            // Start sync if enabled
            if (this.config.integration.autoSync) {
                this.startAutoSync();
            }
            
            this.initialized = true;
            this.emit('initialized');
            
            console.log('✅ NotebookLM client initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize NotebookLM client:', error);
            throw error;
        }
    }
    
    /**
     * Initialize notebooks
     */
    async initializeNotebooks() {
        for (const [key, notebook] of Object.entries(this.config.notebooks)) {
            try {
                // Check if notebook exists
                await this.api.get(`/notebooks/${notebook.id}`);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    // Create notebook if it doesn't exist
                    await this.createNotebook(notebook);
                }
            }
        }
    }
    
    /**
     * Create a new notebook
     */
    async createNotebook(notebook) {
        const response = await this.api.post('/notebooks', {
            id: notebook.id,
            name: notebook.name,
            description: notebook.description,
            categories: notebook.categories,
            settings: {
                public: false,
                collaborative: true,
                aiProcessing: true
            }
        });
        
        this.emit('notebook:created', response.data);
        
        return response.data;
    }
    
    /**
     * Create a document
     */
    async createDocument(params) {
        const { content, metadata, notebookId } = params;
        
        // Validate parameters
        if (!content || !metadata || !notebookId) {
            throw new Error('Missing required parameters for document creation');
        }
        
        // Process content
        const processed = await this.processContent(content, metadata);
        
        // Create document
        const response = await this.api.post(`/notebooks/${notebookId}/documents`, {
            content: processed.content,
            metadata: {
                ...metadata,
                processed: processed.metadata,
                createdAt: new Date().toISOString(),
                version: 1
            }
        });
        
        const document = response.data;
        
        // Update cache
        if (this.config.integration.enableCache) {
            this.cache.set(document.id, document);
        }
        
        // Update knowledge graph
        if (this.config.knowledgeGraph.enabled) {
            await this.updateKnowledgeGraph(document);
        }
        
        this.emit('document:created', document);
        
        return document;
    }
    
    /**
     * Upload a file as a document
     */
    async uploadDocument(filePath, metadata, notebookId) {
        const fileContent = await fs.readFile(filePath);
        const fileName = path.basename(filePath);
        const fileType = path.extname(filePath).substring(1);
        
        // Check file type support
        if (!this.config.processing.supportedFormats.includes(fileType)) {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
        
        // Check file size
        const stats = await fs.stat(filePath);
        if (stats.size > this.config.processing.maxFileSize) {
            throw new Error(`File size exceeds limit: ${stats.size} bytes`);
        }
        
        // Create form data
        const formData = new FormData();
        formData.append('file', fileContent, fileName);
        formData.append('metadata', JSON.stringify(metadata));
        formData.append('notebookId', notebookId);
        
        // Upload file
        const response = await this.api.post('/documents/upload', formData, {
            headers: formData.getHeaders()
        });
        
        return response.data;
    }
    
    /**
     * Search for documents
     */
    async search(params) {
        const {
            query,
            notebooks = 'all',
            limit = this.config.search.defaultLimit,
            offset = 0,
            filters = {}
        } = params;
        
        // Build search request
        const searchRequest = {
            query,
            limit: Math.min(limit, this.config.search.maxLimit),
            offset,
            notebooks: notebooks === 'all' ? 
                Object.keys(this.config.notebooks) : 
                Array.isArray(notebooks) ? notebooks : [notebooks],
            filters: {
                ...filters,
                minRelevance: filters.minRelevance || this.config.search.minRelevance
            },
            options: {
                fuzzy: this.config.search.enableFuzzySearch,
                synonyms: this.config.search.enableSynonyms,
                stemming: this.config.search.enableStemming
            }
        };
        
        // Check cache first
        const cacheKey = JSON.stringify(searchRequest);
        if (this.config.integration.enableCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.integration.cacheTTL) {
                return cached.results;
            }
        }
        
        // Perform search
        const response = await this.api.post('/search', searchRequest);
        
        const results = {
            documents: response.data.results,
            total: response.data.total,
            facets: response.data.facets,
            suggestions: response.data.suggestions
        };
        
        // Cache results
        if (this.config.integration.enableCache) {
            this.cache.set(cacheKey, {
                results,
                timestamp: Date.now()
            });
        }
        
        this.emit('search:completed', {
            query,
            results: results.documents.length,
            total: results.total
        });
        
        return results;
    }
    
    /**
     * Get a specific document
     */
    async getDocument(documentId) {
        // Check cache
        if (this.config.integration.enableCache && this.cache.has(documentId)) {
            return this.cache.get(documentId);
        }
        
        // Fetch from API
        const response = await this.api.get(`/documents/${documentId}`);
        const document = response.data;
        
        // Update cache
        if (this.config.integration.enableCache) {
            this.cache.set(documentId, document);
        }
        
        return document;
    }
    
    /**
     * Update a document
     */
    async updateDocument(documentId, updates) {
        const response = await this.api.patch(`/documents/${documentId}`, {
            ...updates,
            updatedAt: new Date().toISOString(),
            version: updates.version ? updates.version + 1 : undefined
        });
        
        const document = response.data;
        
        // Update cache
        if (this.config.integration.enableCache) {
            this.cache.set(documentId, document);
        }
        
        this.emit('document:updated', document);
        
        return document;
    }
    
    /**
     * Delete a document
     */
    async deleteDocument(documentId) {
        await this.api.delete(`/documents/${documentId}`);
        
        // Remove from cache
        if (this.config.integration.enableCache) {
            this.cache.delete(documentId);
        }
        
        this.emit('document:deleted', documentId);
    }
    
    /**
     * Generate insights from a document
     */
    async generateInsights(documentId, options = {}) {
        const response = await this.api.post(`/documents/${documentId}/insights`, {
            focusAreas: options.focusAreas || ['summary', 'key-points', 'questions'],
            model: options.model || this.config.processing.aiModel,
            maxInsights: options.maxInsights || this.config.processing.keyInsightsCount
        });
        
        return response.data;
    }
    
    /**
     * Find related documents
     */
    async findRelated(documentId, options = {}) {
        const response = await this.api.get(`/documents/${documentId}/related`, {
            params: {
                limit: options.limit || 10,
                minSimilarity: options.minSimilarity || 0.7,
                includeFromOtherNotebooks: options.crossNotebook !== false
            }
        });
        
        return response.data.related;
    }
    
    /**
     * Consolidate multiple documents
     */
    async consolidate(documentIds, options = {}) {
        const response = await this.api.post('/documents/consolidate', {
            documentIds,
            format: options.format || 'markdown',
            structure: options.structure || 'hierarchical',
            includeTOC: options.includeTOC !== false,
            includeReferences: options.includeReferences !== false,
            summarize: options.summarize !== false
        });
        
        return response.data;
    }
    
    /**
     * Generate learning path
     */
    async generateLearningPath(params) {
        const { topic, targetAudience, materials, objectives } = params;
        
        const response = await this.api.post('/learning/generate-path', {
            topic,
            targetAudience,
            materials,
            objectives,
            options: {
                adaptive: true,
                includeAssessments: true,
                estimatedDuration: true
            }
        });
        
        return response.data.learningPath;
    }
    
    /**
     * Process content before storage
     */
    async processContent(content, metadata) {
        // Extract entities if enabled
        let entities = [];
        if (this.config.knowledgeGraph.entityExtraction.enabled) {
            entities = await this.extractEntities(content);
        }
        
        // Generate summary if needed
        let summary = metadata.summary;
        if (!summary && this.config.processing.generateSummary) {
            summary = await this.generateSummary(content);
        }
        
        // Extract code blocks if present
        const codeBlocks = this.config.processing.extractCode ? 
            this.extractCodeBlocks(content) : [];
        
        return {
            content,
            metadata: {
                entities,
                summary,
                codeBlocks,
                wordCount: this.countWords(content),
                readingTime: this.estimateReadingTime(content)
            }
        };
    }
    
    /**
     * Extract entities from content
     */
    async extractEntities(content) {
        // This would typically call an NLP service
        // For now, returning a placeholder
        return [
            { type: 'Technology', value: 'NotebookLM', confidence: 0.9 },
            { type: 'Concept', value: 'Knowledge Management', confidence: 0.85 }
        ];
    }
    
    /**
     * Generate summary
     */
    async generateSummary(content) {
        // This would typically call an AI summarization service
        // For now, returning a placeholder
        const words = content.split(' ');
        const summaryLength = Math.min(
            this.config.processing.maxSummaryLength,
            Math.floor(words.length * 0.1)
        );
        
        return words.slice(0, summaryLength).join(' ') + '...';
    }
    
    /**
     * Extract code blocks from content
     */
    extractCodeBlocks(content) {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks = [];
        let match;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            blocks.push({
                language: match[1] || 'plain',
                code: match[2].trim(),
                position: match.index
            });
        }
        
        return blocks;
    }
    
    /**
     * Update knowledge graph with document
     */
    async updateKnowledgeGraph(document) {
        // This would integrate with the knowledge graph service
        this.emit('knowledgeGraph:update', {
            documentId: document.id,
            entities: document.metadata.processed.entities,
            relationships: []
        });
    }
    
    /**
     * Start auto-sync process
     */
    startAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.syncInterval = setInterval(
            () => this.performSync(),
            this.config.integration.syncInterval
        );
        
        // Perform initial sync if configured
        if (this.config.integration.syncOnStartup) {
            this.performSync();
        }
    }
    
    /**
     * Perform synchronization
     */
    async performSync() {
        try {
            this.emit('sync:started');
            
            // Sync each notebook
            for (const notebook of Object.values(this.config.notebooks)) {
                await this.syncNotebook(notebook.id);
            }
            
            // Clear old cache entries
            this.cleanCache();
            
            this.emit('sync:completed');
            
        } catch (error) {
            this.emit('sync:error', error);
            console.error('Sync error:', error);
        }
    }
    
    /**
     * Sync a specific notebook
     */
    async syncNotebook(notebookId) {
        // This would implement actual sync logic
        // For now, just emit an event
        this.emit('notebook:synced', notebookId);
    }
    
    /**
     * Clean cache of old entries
     */
    cleanCache() {
        if (!this.config.integration.enableCache) return;
        
        const now = Date.now();
        const ttl = this.config.integration.cacheTTL;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp && now - value.timestamp > ttl) {
                this.cache.delete(key);
            }
        }
    }
    
    /**
     * Utility functions
     */
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }
    
    estimateReadingTime(text) {
        const wordsPerMinute = 200;
        const words = this.countWords(text);
        return Math.ceil(words / wordsPerMinute);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Shutdown client
     */
    async shutdown() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        this.cache.clear();
        this.initialized = false;
        
        this.emit('shutdown');
    }
}

// Export singleton instance
let clientInstance = null;

export function getNotebookLMClient() {
    if (!clientInstance) {
        clientInstance = new NotebookLMClient();
    }
    return clientInstance;
}

export default NotebookLMClient;
