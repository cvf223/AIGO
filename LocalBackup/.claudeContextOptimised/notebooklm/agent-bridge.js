/**
 * NotebookLM Agent Bridge
 * Connects agents with the NotebookLM knowledge management system
 */

import { EventEmitter } from 'events';
import { getNotebookLMClient } from './notebooklm-client.js';

export class NotebookLMAgentBridge extends EventEmitter {
    constructor(agentRegistry) {
        super();
        this.agentRegistry = agentRegistry;
        this.notebookLM = getNotebookLMClient();
        this.agentContextCache = new Map();
        this.usageMetrics = new Map();
    }
    
    /**
     * Initialize the bridge
     */
    async initialize() {
        // Ensure NotebookLM is initialized
        if (!this.notebookLM.initialized) {
            await this.notebookLM.initialize();
        }
        
        // Set up agent listeners
        this.setupAgentListeners();
        
        console.log('✅ NotebookLM Agent Bridge initialized');
    }
    
    /**
     * Set up listeners for agent events
     */
    setupAgentListeners() {
        // Listen for agent context requests
        this.agentRegistry.on('agent:contextRequest', async (event) => {
            const context = await this.provideContext(
                event.agentId,
                event.taskContext
            );
            event.callback(context);
        });
        
        // Listen for knowledge contributions
        this.agentRegistry.on('agent:knowledgeContribution', async (event) => {
            await this.receiveKnowledge(
                event.agentId,
                event.knowledge
            );
        });
    }
    
    /**
     * Provide context to an agent for a specific task
     */
    async provideContext(agentId, taskContext) {
        try {
            // Determine which notebooks to search
            const notebooks = this.selectNotebooks(agentId, taskContext);
            
            // Build search query
            const query = this.buildSearchQuery(taskContext);
            
            // Search for relevant knowledge
            const searchResults = await this.notebookLM.search({
                query,
                notebooks,
                limit: taskContext.maxResults || 20,
                filters: {
                    dateRange: taskContext.dateRange,
                    minRelevance: taskContext.minRelevance || 0.7,
                    categories: taskContext.categories
                }
            });
            
            // Process and format results
            const formattedContext = await this.formatContextForAgent(
                searchResults,
                agentId,
                taskContext
            );
            
            // Cache context for potential reuse
            this.cacheAgentContext(agentId, taskContext, formattedContext);
            
            // Track usage metrics
            this.trackUsage(agentId, 'context_retrieval', {
                documentsRetrieved: searchResults.documents.length,
                totalAvailable: searchResults.total
            });
            
            this.emit('context:provided', {
                agentId,
                taskContext,
                documentsProvided: searchResults.documents.length
            });
            
            return formattedContext;
            
        } catch (error) {
            console.error(`Error providing context to agent ${agentId}:`, error);
            throw error;
        }
    }
    
    /**
     * Select appropriate notebooks based on agent and task
     */
    selectNotebooks(agentId, taskContext) {
        const agent = this.agentRegistry.getAgent(agentId);
        
        // Map agent types to relevant notebooks
        const agentNotebookMap = {
            'construction-lead': ['construction', 'documentation', 'external'],
            'ml-engineer': ['ml_systems', 'research', 'learning'],
            'documentation-specialist': ['documentation', 'learning', 'external'],
            'quantum-architect': ['ml_systems', 'research'],
            'database-specialist': ['documentation', 'ml_systems'],
            'integration-developer': ['documentation', 'external'],
            'security-officer': ['documentation', 'external'],
            'master-orchestrator': 'all'
        };
        
        // Get default notebooks for agent
        let notebooks = agentNotebookMap[agent.type] || ['documentation'];
        
        // Override with task-specific notebooks if provided
        if (taskContext.notebooks) {
            notebooks = taskContext.notebooks;
        }
        
        // Add notebooks based on task keywords
        if (taskContext.keywords) {
            if (taskContext.keywords.some(k => k.toLowerCase().includes('hoai'))) {
                notebooks = [...new Set([...notebooks, 'construction'])];
            }
            if (taskContext.keywords.some(k => k.toLowerCase().includes('ml') || 
                                           k.toLowerCase().includes('ai'))) {
                notebooks = [...new Set([...notebooks, 'ml_systems', 'research'])];
            }
        }
        
        return notebooks;
    }
    
    /**
     * Build search query from task context
     */
    buildSearchQuery(taskContext) {
        const queryParts = [];
        
        // Add main description
        if (taskContext.description) {
            queryParts.push(taskContext.description);
        }
        
        // Add keywords
        if (taskContext.keywords && taskContext.keywords.length > 0) {
            queryParts.push(taskContext.keywords.join(' '));
        }
        
        // Add specific questions
        if (taskContext.questions && taskContext.questions.length > 0) {
            queryParts.push(taskContext.questions.join(' '));
        }
        
        // Add domain-specific terms
        if (taskContext.domain) {
            queryParts.push(`domain:${taskContext.domain}`);
        }
        
        return queryParts.join(' ');
    }
    
    /**
     * Format search results for agent consumption
     */
    async formatContextForAgent(searchResults, agentId, taskContext) {
        const agent = this.agentRegistry.getAgent(agentId);
        
        // Base structure
        const context = {
            summary: await this.generateContextSummary(searchResults),
            relevantDocuments: [],
            keyInsights: [],
            suggestedApproaches: [],
            references: [],
            relatedConcepts: [],
            metadata: {
                totalDocuments: searchResults.total,
                documentsProvided: searchResults.documents.length,
                searchQuery: taskContext.description,
                timestamp: new Date().toISOString()
            }
        };
        
        // Process each document
        for (const doc of searchResults.documents) {
            // Add to relevant documents
            context.relevantDocuments.push({
                id: doc.id,
                title: doc.metadata.title,
                summary: doc.metadata.summary,
                relevanceScore: doc.relevanceScore,
                source: doc.metadata.source,
                content: taskContext.includeFullContent ? doc.content : undefined,
                url: doc.metadata.url
            });
            
            // Extract key insights
            if (doc.metadata.processed && doc.metadata.processed.keyInsights) {
                context.keyInsights.push(...doc.metadata.processed.keyInsights);
            }
            
            // Add references
            context.references.push({
                title: doc.metadata.title,
                author: doc.metadata.source?.author,
                date: doc.metadata.source?.date,
                url: doc.metadata.url,
                type: doc.metadata.type
            });
            
            // Extract related concepts
            if (doc.metadata.processed && doc.metadata.processed.entities) {
                for (const entity of doc.metadata.processed.entities) {
                    if (entity.type === 'Concept' && entity.confidence > 0.7) {
                        context.relatedConcepts.push(entity.value);
                    }
                }
            }
        }
        
        // Deduplicate and limit insights
        context.keyInsights = [...new Set(context.keyInsights)].slice(0, 10);
        context.relatedConcepts = [...new Set(context.relatedConcepts)].slice(0, 15);
        
        // Generate suggested approaches based on agent type
        context.suggestedApproaches = await this.generateSuggestedApproaches(
            agent.type,
            taskContext,
            context.keyInsights
        );
        
        // Add agent-specific formatting
        return this.applyAgentSpecificFormatting(context, agent);
    }
    
    /**
     * Generate context summary
     */
    async generateContextSummary(searchResults) {
        if (searchResults.documents.length === 0) {
            return 'No relevant documents found for this query.';
        }
        
        const topDocs = searchResults.documents.slice(0, 3);
        const summaries = topDocs.map(doc => doc.metadata.summary).filter(Boolean);
        
        if (summaries.length === 0) {
            return `Found ${searchResults.total} relevant documents.`;
        }
        
        return `Based on ${searchResults.total} documents, the most relevant information includes: ${summaries.join(' Additionally, ')}`;
    }
    
    /**
     * Generate suggested approaches based on context
     */
    async generateSuggestedApproaches(agentType, taskContext, insights) {
        const approaches = [];
        
        // Agent-specific approach generation
        switch (agentType) {
            case 'construction-lead':
                if (taskContext.description.includes('HOAI')) {
                    approaches.push('Review HOAI phase requirements and compliance checklist');
                    approaches.push('Consider using the HOAI fee calculation framework');
                }
                break;
                
            case 'ml-engineer':
                if (insights.some(i => i.includes('transformer'))) {
                    approaches.push('Consider using pre-trained transformer models');
                    approaches.push('Evaluate attention mechanism optimizations');
                }
                break;
                
            case 'documentation-specialist':
                approaches.push('Create comprehensive documentation following the standard template');
                approaches.push('Include code examples and visual diagrams');
                approaches.push('Ensure investor-ready language and explanations');
                break;
        }
        
        // Add general approaches based on task type
        if (taskContext.type === 'implementation') {
            approaches.push('Start with a proof of concept');
            approaches.push('Follow test-driven development practices');
        }
        
        if (taskContext.type === 'analysis') {
            approaches.push('Begin with data collection and validation');
            approaches.push('Apply statistical analysis methods');
        }
        
        return approaches;
    }
    
    /**
     * Apply agent-specific formatting
     */
    applyAgentSpecificFormatting(context, agent) {
        // Add agent-specific fields based on type
        switch (agent.type) {
            case 'construction-lead':
                context.hoaiRelevance = this.assessHOAIRelevance(context);
                context.constructionStandards = this.extractStandards(context);
                break;
                
            case 'ml-engineer':
                context.algorithms = this.extractAlgorithms(context);
                context.modelSuggestions = this.suggestModels(context);
                break;
                
            case 'documentation-specialist':
                context.documentationGaps = this.identifyDocumentationGaps(context);
                context.templateSuggestions = this.suggestTemplates(context);
                break;
        }
        
        return context;
    }
    
    /**
     * Receive knowledge contribution from an agent
     */
    async receiveKnowledge(agentId, knowledge) {
        try {
            const agent = this.agentRegistry.getAgent(agentId);
            
            // Validate knowledge contribution
            const validation = await this.validateKnowledge(knowledge);
            if (!validation.valid) {
                throw new Error(`Invalid knowledge contribution: ${validation.errors.join(', ')}`);
            }
            
            // Determine target notebook
            const notebookId = this.selectTargetNotebook(knowledge, agent);
            
            // Check if this is an update or new document
            let document;
            if (knowledge.documentId) {
                // Update existing document
                document = await this.notebookLM.updateDocument(
                    knowledge.documentId,
                    {
                        content: knowledge.content,
                        metadata: {
                            ...knowledge.metadata,
                            lastUpdatedBy: agentId,
                            updateReason: knowledge.updateReason
                        }
                    }
                );
            } else {
                // Create new document
                document = await this.notebookLM.createDocument({
                    content: knowledge.content,
                    metadata: {
                        ...knowledge.metadata,
                        createdBy: agentId,
                        autoGenerated: true,
                        agentType: agent.type
                    },
                    notebookId
                });
            }
            
            // Track contribution
            this.trackUsage(agentId, 'knowledge_contribution', {
                documentId: document.id,
                action: knowledge.documentId ? 'update' : 'create'
            });
            
            this.emit('knowledge:received', {
                agentId,
                documentId: document.id,
                action: knowledge.documentId ? 'updated' : 'created'
            });
            
            return document;
            
        } catch (error) {
            console.error(`Error receiving knowledge from agent ${agentId}:`, error);
            throw error;
        }
    }
    
    /**
     * Validate knowledge contribution
     */
    async validateKnowledge(knowledge) {
        const errors = [];
        
        // Check required fields
        if (!knowledge.content || knowledge.content.trim().length === 0) {
            errors.push('Content is required');
        }
        
        if (!knowledge.metadata || !knowledge.metadata.title) {
            errors.push('Title is required in metadata');
        }
        
        if (!knowledge.type) {
            errors.push('Knowledge type is required');
        }
        
        // Check content quality
        if (knowledge.content && knowledge.content.length < 100) {
            errors.push('Content is too short (minimum 100 characters)');
        }
        
        // Validate metadata
        if (knowledge.metadata) {
            if (!knowledge.metadata.categories || knowledge.metadata.categories.length === 0) {
                errors.push('At least one category is required');
            }
            
            if (!knowledge.metadata.tags || knowledge.metadata.tags.length < 3) {
                errors.push('At least 3 tags are required');
            }
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Select target notebook for knowledge contribution
     */
    selectTargetNotebook(knowledge, agent) {
        // Check if notebook is explicitly specified
        if (knowledge.notebookId) {
            return knowledge.notebookId;
        }
        
        // Map knowledge types to notebooks
        const typeNotebookMap = {
            'documentation': 'system-docs',
            'research': 'research-papers',
            'learning': 'learning-materials',
            'external': 'external-resources',
            'construction': 'construction-knowledge',
            'ml': 'ml-architectures'
        };
        
        // Use type mapping
        if (typeNotebookMap[knowledge.type]) {
            return typeNotebookMap[knowledge.type];
        }
        
        // Default based on agent type
        const agentNotebookDefaults = {
            'documentation-specialist': 'system-docs',
            'construction-lead': 'construction-knowledge',
            'ml-engineer': 'ml-architectures'
        };
        
        return agentNotebookDefaults[agent.type] || 'system-docs';
    }
    
    /**
     * Cache agent context for reuse
     */
    cacheAgentContext(agentId, taskContext, context) {
        const cacheKey = `${agentId}:${JSON.stringify(taskContext)}`;
        
        this.agentContextCache.set(cacheKey, {
            context,
            timestamp: Date.now()
        });
        
        // Limit cache size
        if (this.agentContextCache.size > 100) {
            // Remove oldest entries
            const entries = Array.from(this.agentContextCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            for (let i = 0; i < 20; i++) {
                this.agentContextCache.delete(entries[i][0]);
            }
        }
    }
    
    /**
     * Track usage metrics
     */
    trackUsage(agentId, action, details) {
        if (!this.usageMetrics.has(agentId)) {
            this.usageMetrics.set(agentId, {
                contextRetrievals: 0,
                knowledgeContributions: 0,
                documentsCreated: 0,
                documentsUpdated: 0
            });
        }
        
        const metrics = this.usageMetrics.get(agentId);
        
        switch (action) {
            case 'context_retrieval':
                metrics.contextRetrievals++;
                break;
            case 'knowledge_contribution':
                metrics.knowledgeContributions++;
                if (details.action === 'create') {
                    metrics.documentsCreated++;
                } else if (details.action === 'update') {
                    metrics.documentsUpdated++;
                }
                break;
        }
        
        // Emit metrics event
        this.emit('metrics:updated', {
            agentId,
            metrics
        });
    }
    
    /**
     * Get usage metrics for an agent
     */
    getUsageMetrics(agentId) {
        return this.usageMetrics.get(agentId) || {
            contextRetrievals: 0,
            knowledgeContributions: 0,
            documentsCreated: 0,
            documentsUpdated: 0
        };
    }
    
    /**
     * Helper methods for agent-specific formatting
     */
    assessHOAIRelevance(context) {
        const hoaiKeywords = ['hoai', 'honorarordnung', 'lph', 'leistungsphase'];
        let relevance = 0;
        
        for (const doc of context.relevantDocuments) {
            const content = (doc.title + ' ' + doc.summary).toLowerCase();
            for (const keyword of hoaiKeywords) {
                if (content.includes(keyword)) {
                    relevance += doc.relevanceScore;
                    break;
                }
            }
        }
        
        return Math.min(relevance, 1.0);
    }
    
    extractStandards(context) {
        const standards = new Set();
        const standardPatterns = [/DIN\s+\d+/, /EN\s+\d+/, /ISO\s+\d+/, /VDI\s+\d+/];
        
        for (const doc of context.relevantDocuments) {
            const content = doc.title + ' ' + doc.summary;
            for (const pattern of standardPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    matches.forEach(match => standards.add(match));
                }
            }
        }
        
        return Array.from(standards);
    }
    
    extractAlgorithms(context) {
        const algorithms = new Set();
        const algoKeywords = ['transformer', 'lstm', 'cnn', 'rnn', 'bert', 'gpt', 
                              'attention', 'reinforcement learning', 'gan'];
        
        for (const insight of context.keyInsights) {
            const lower = insight.toLowerCase();
            for (const keyword of algoKeywords) {
                if (lower.includes(keyword)) {
                    algorithms.add(keyword);
                }
            }
        }
        
        return Array.from(algorithms);
    }
    
    suggestModels(context) {
        const suggestions = [];
        const algorithms = this.extractAlgorithms(context);
        
        if (algorithms.includes('transformer')) {
            suggestions.push('Consider using BERT or GPT variants');
        }
        
        if (algorithms.includes('reinforcement learning')) {
            suggestions.push('Evaluate PPO or SAC algorithms');
        }
        
        return suggestions;
    }
    
    identifyDocumentationGaps(context) {
        const requiredSections = [
            'overview', 'installation', 'usage', 'api-reference', 
            'examples', 'troubleshooting', 'configuration'
        ];
        
        const documentedSections = new Set();
        
        for (const doc of context.relevantDocuments) {
            const title = doc.title.toLowerCase();
            for (const section of requiredSections) {
                if (title.includes(section)) {
                    documentedSections.add(section);
                }
            }
        }
        
        return requiredSections.filter(s => !documentedSections.has(s));
    }
    
    suggestTemplates(context) {
        const gaps = this.identifyDocumentationGaps(context);
        const templates = [];
        
        if (gaps.includes('api-reference')) {
            templates.push('API Reference Template');
        }
        
        if (gaps.includes('troubleshooting')) {
            templates.push('Troubleshooting Guide Template');
        }
        
        if (context.relevantDocuments.length === 0) {
            templates.push('System Documentation Template');
        }
        
        return templates;
    }
    
    /**
     * Shutdown bridge
     */
    async shutdown() {
        this.agentContextCache.clear();
        this.usageMetrics.clear();
        this.emit('shutdown');
    }
}

export default NotebookLMAgentBridge;
