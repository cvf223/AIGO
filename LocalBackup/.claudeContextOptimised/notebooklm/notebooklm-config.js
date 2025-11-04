/**
 * NotebookLM Configuration
 * Central configuration for knowledge management integration
 */

export const notebookLMConfig = {
    // API Configuration
    api: {
        key: process.env.NOTEBOOKLM_API_KEY,
        endpoint: process.env.NOTEBOOKLM_ENDPOINT || 'https://notebooklm.google.com/api/v1',
        version: 'v1',
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000 // 1 second
    },
    
    // Organization Settings
    organization: {
        name: 'AIGO-Syndicate',
        workspace: 'construction-intelligence',
        defaultLanguage: 'en',
        timezone: 'UTC'
    },
    
    // Notebook Structure
    notebooks: {
        // Research notebooks
        research: {
            id: 'research-papers',
            name: 'Research Papers',
            description: 'Academic papers and research documents',
            categories: ['AI-ML', 'Construction', 'Innovation']
        },
        
        // System documentation
        documentation: {
            id: 'system-docs',
            name: 'System Documentation',
            description: 'Internal system documentation and guides',
            categories: ['Architecture', 'APIs', 'Guides']
        },
        
        // External resources
        external: {
            id: 'external-resources',
            name: 'External Resources',
            description: 'Third-party documentation and resources',
            categories: ['Industry', 'Standards', 'Vendors']
        },
        
        // Learning materials
        learning: {
            id: 'learning-materials',
            name: 'Learning Materials',
            description: 'Training and educational content',
            categories: ['Tutorials', 'Courses', 'Examples']
        },
        
        // Construction knowledge
        construction: {
            id: 'construction-knowledge',
            name: 'Construction Knowledge',
            description: 'Construction-specific knowledge base',
            categories: ['HOAI', 'BIM', 'Safety', 'Materials']
        },
        
        // ML architectures
        ml_systems: {
            id: 'ml-architectures',
            name: 'ML Architectures',
            description: 'Machine learning system designs',
            categories: ['Models', 'Algorithms', 'Implementations']
        }
    },
    
    // Document Processing
    processing: {
        // Supported formats
        supportedFormats: [
            'pdf', 'md', 'txt', 'html', 'docx', 
            'pptx', 'xlsx', 'json', 'xml'
        ],
        
        // Size limits
        maxFileSize: 50 * 1024 * 1024, // 50MB
        maxBatchSize: 100, // documents
        
        // Processing options
        extractImages: true,
        extractTables: true,
        extractCode: true,
        generateSummary: true,
        generateQuestions: true,
        
        // AI processing
        aiModel: 'advanced',
        confidenceThreshold: 0.7,
        maxSummaryLength: 500,
        keyInsightsCount: 5
    },
    
    // Integration Settings
    integration: {
        // Sync configuration
        autoSync: true,
        syncInterval: 3600000, // 1 hour in milliseconds
        syncOnStartup: true,
        syncBatchSize: 50,
        
        // Caching
        enableCache: true,
        cacheSize: 1000, // documents
        cacheTTL: 86400000, // 24 hours
        
        // Agent access
        agentAccess: {
            readPermission: ['all'],
            writePermission: ['documentation-specialist', 'master-orchestrator'],
            adminPermission: ['master-orchestrator']
        },
        
        // Webhooks
        webhooks: {
            onDocumentAdded: process.env.WEBHOOK_DOCUMENT_ADDED,
            onDocumentUpdated: process.env.WEBHOOK_DOCUMENT_UPDATED,
            onSyncComplete: process.env.WEBHOOK_SYNC_COMPLETE
        }
    },
    
    // Search Configuration
    search: {
        // Search defaults
        defaultLimit: 10,
        maxLimit: 100,
        minRelevance: 0.5,
        
        // Search enhancements
        enableFuzzySearch: true,
        enableSynonyms: true,
        enableStemming: true,
        
        // Ranking factors
        ranking: {
            relevance: 0.4,
            recency: 0.2,
            popularity: 0.2,
            authorityScore: 0.2
        }
    },
    
    // Knowledge Graph Integration
    knowledgeGraph: {
        enabled: true,
        updateOnIngestion: true,
        maxRelationshipDepth: 3,
        minRelationshipScore: 0.6,
        
        // Entity extraction
        entityExtraction: {
            enabled: true,
            types: ['Person', 'Organization', 'Technology', 'Concept', 'Method'],
            minConfidence: 0.8
        }
    },
    
    // Monitoring & Analytics
    monitoring: {
        // Metrics collection
        collectMetrics: true,
        metricsInterval: 300000, // 5 minutes
        
        // Tracked metrics
        metrics: [
            'document_count',
            'search_queries',
            'ingestion_rate',
            'error_rate',
            'storage_usage'
        ],
        
        // Alerts
        alerts: {
            errorRateThreshold: 0.05,
            storageThreshold: 0.9,
            ingestionFailureThreshold: 5
        }
    },
    
    // Security Settings
    security: {
        // Encryption
        encryptAtRest: true,
        encryptInTransit: true,
        
        // Access control
        requireAuthentication: true,
        sessionTimeout: 3600000, // 1 hour
        
        // Audit logging
        auditLogging: true,
        auditRetentionDays: 90,
        
        // Data privacy
        piiDetection: true,
        piiMasking: true,
        gdprCompliant: true
    },
    
    // Backup & Recovery
    backup: {
        enabled: true,
        schedule: '0 2 * * *', // 2 AM daily
        retentionDays: 30,
        incrementalBackup: true,
        backupLocation: process.env.BACKUP_LOCATION || 's3://backups/notebooklm'
    }
};

// Validation function
export function validateConfig(config) {
    const errors = [];
    
    // Check required environment variables
    if (!config.api.key) {
        errors.push('NOTEBOOKLM_API_KEY environment variable is required');
    }
    
    // Validate notebooks
    for (const [key, notebook] of Object.entries(config.notebooks)) {
        if (!notebook.id || !notebook.name) {
            errors.push(`Notebook ${key} is missing required fields`);
        }
    }
    
    // Validate processing settings
    if (config.processing.maxFileSize < 1024 * 1024) { // 1MB minimum
        errors.push('maxFileSize must be at least 1MB');
    }
    
    // Validate search settings
    if (config.search.minRelevance < 0 || config.search.minRelevance > 1) {
        errors.push('minRelevance must be between 0 and 1');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

// Export singleton instance
export default notebookLMConfig;
