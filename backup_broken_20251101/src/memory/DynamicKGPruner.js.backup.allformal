/**
 * 🧹 DYNAMIC KNOWLEDGE GRAPH PRUNER
 * =================================
 * 
 * Implements sophisticated pruning strategies to maintain KG efficiency
 * while preserving valuable knowledge. Provides feedback to MEM1 for
 * continuous learning about what information is worth retaining.
 */

import { EventEmitter } from 'events';

export class DynamicKGPruner extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            knowledgeSafetyK: config.knowledgeSafetyK || 10000,
            pruningStrategies: config.pruningStrategies || [
                'LOW_DEGREE',
                'TEMPORAL_DECAY', 
                'CONFIDENCE_BASED',
                'K_GUARANTEE'
            ],
            temporalDecayWindow: config.temporalDecayWindow || 30 * 24 * 60 * 60 * 1000, // 30 days
            minConfidenceThreshold: config.minConfidenceThreshold || 0.3,
            lowDegreeThreshold: config.lowDegreeThreshold || 2,
            archiveBeforeDelete: config.archiveBeforeDelete ?? true,
            ...config
        };
        
        // Metrics
        this.metrics = {
            totalPruned: 0,
            totalArchived: 0,
            lastPruningTime: null,
            pruningsByStrategy: {
                LOW_DEGREE: 0,
                TEMPORAL_DECAY: 0,
                CONFIDENCE_BASED: 0,
                CONSOLIDATED: 0
            }
        };
        
        // 🔥 KG INTEGRATION - FULL SUPPORT!
        this.knowledgeGraph = null;
        this.unifiedKnowledgeStorage = null;
        this.enableKGRouting = false;
        this.eliteMemoryPersistence = null;
        
        this.initialized = false;
    }

    /**
     * Initialize the pruner with dependencies
     */
    async initialize(dependencies) {
        console.log('🧹 Initializing Dynamic KG Pruner...');
        
        this.knowledgeGraph = dependencies.knowledgeGraph;
        this.db = dependencies.database;
        this.archiveStorage = dependencies.s3 || dependencies.archiveStorage;
        
        // 🔥 KG INTEGRATION - CONNECT UNIFIED STORAGE!
        if (dependencies.unifiedKnowledgeStorage) {
            this.unifiedKnowledgeStorage = dependencies.unifiedKnowledgeStorage;
            this.enableKGRouting = true;
            console.log('   🔥 Connected to UnifiedKnowledgeStorage - KG routing ACTIVE!');
        }
        
        // Connect Elite Memory Persistence if available
        if (dependencies.eliteMemoryPersistence) {
            this.eliteMemoryPersistence = dependencies.eliteMemoryPersistence;
            // Enable KG routing by default
            if (this.eliteMemoryPersistence.config) {
                this.eliteMemoryPersistence.config.defaultStoreToKG = true;
                console.log('   🔥 Elite persistence KG routing ENABLED for DynamicKGPruner!');
            }
        }
        
        // Create archive table if needed
        await this.ensureArchiveTable();
        
        this.initialized = true;
        console.log('✅ Dynamic KG Pruner initialized');
        
        return true;
    }

    /**
     * Execute comprehensive pruning operation
     */
    async executePruning(options = {}) {
        const isEmergency = options.emergency || false;
        const startTime = Date.now();
        
        console.log(`🧹 Executing ${isEmergency ? 'EMERGENCY' : 'scheduled'} pruning...`);
        
        const results = {
            lowDegree: 0,
            temporal: 0,
            confidence: 0,
            consolidated: 0,
            archived: 0,
            protected: 0
        };
        
        // 🔥 DATABASE CHECK - Return empty results if no DB
        if (!this.db || typeof this.db.connect !== 'function') {
            console.warn('⚠️ Database not available for DynamicKGPruner - skipping pruning');
            return {
                totalPruned: 0,
                totalArchived: 0,
                duration: 0,
                error: 'Database not available'
            };
        }
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            // 1. Protect top-K knowledge first
            if (!isEmergency) {
                results.protected = await this.protectTopKKnowledge(client);
            }
            
            // 2. Execute pruning strategies
            for (const strategy of this.config.pruningStrategies) {
                switch (strategy) {
                    case 'LOW_DEGREE':
                        results.lowDegree = await this.pruneLowDegreeNodes(client, isEmergency);
                        break;
                    case 'TEMPORAL_DECAY':
                        results.temporal = await this.pruneByTemporalDecay(client, isEmergency);
                        break;
                    case 'CONFIDENCE_BASED':
                        results.confidence = await this.pruneLowConfidenceKnowledge(client, isEmergency);
                        break;
                    case 'CONSOLIDATED':
                        results.consolidated = await this.pruneConsolidatedEpisodic(client);
                        break;
                }
            }
            
            await client.query('COMMIT');
            
            // Update metrics
            this.updateMetrics(results);
            
            // Generate pruning report
            const report = await this.generatePruningReport(results, startTime);
            
            // Send feedback to MEM1
            await this.sendPruningFeedback(report);
            
            // 🔥 STORE PRUNING OPERATION TO KG!
            if (this.enableKGRouting) {
                await this.storePruningOperationToKG({
                    stats: report,
                    strategies: results,
                    totalPruned: report.totalPruned,
                    memoryImpact: report.memoryReclaimed || 0
                });
                
                // Store metadata for each pruned node (sample)
                const prunedExamples = await this.getPrunedExamples();
                for (const example of prunedExamples.slice(0, 5)) { // Store first 5 examples
                    await this.persistPrunedNodeMetadata(example);
                }
            }
            
            this.emit('pruning_complete', report);
            
            console.log(`✅ Pruning complete: ${report.totalPruned} items pruned, ${report.totalArchived} archived`);
            
            return report;
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Pruning failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Protect top-K most valuable knowledge
     */
    async protectTopKKnowledge(client) {
        // Calculate composite relevance score
        const query = `
            WITH relevance_scores AS (
                SELECT 
                    n.node_id,
                    n.node_type,
                    -- Composite score calculation
                    (
                        -- Confidence component
                        n.confidence_score * 0.3 +
                        -- Connectivity component (normalized degree centrality)
                        LEAST(
                            (SELECT COUNT(*) FROM kg_relationships 
                             WHERE source_node_id = n.node_id OR target_node_id = n.node_id) / 10.0,
                            1.0
                        ) * 0.3 +
                        -- Recency component (exponential decay)
                        EXP(-EXTRACT(EPOCH FROM (NOW() - n.last_retrieved_ts)) / (86400 * 30)) * 0.2 +
                        -- Entanglement bonus
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM kg_entanglements 
                                WHERE node_a_id = n.node_id OR node_b_id = n.node_id
                            ) THEN 0.2
                            ELSE 0
                        END
                    ) as relevance_score,
                    -- Individual components for analysis
                    n.confidence_score as confidence,
                    (SELECT COUNT(*) FROM kg_relationships 
                     WHERE source_node_id = n.node_id OR target_node_id = n.node_id) as degree,
                    EXTRACT(DAYS FROM (NOW() - n.last_retrieved_ts)) as days_since_access
                FROM kg_nodes n
                WHERE n.properties->>'protected' IS NULL OR n.properties->>'protected' = 'false'
            ),
            top_k AS (
                SELECT node_id, relevance_score
                FROM relevance_scores
                ORDER BY relevance_score DESC
                LIMIT $1
            )
            UPDATE kg_nodes
            SET properties = properties || '{"protected": true, "protection_score": ' || 
                            rs.relevance_score || '}'::jsonb
            FROM top_k tk
            JOIN relevance_scores rs ON rs.node_id = tk.node_id
            WHERE kg_nodes.node_id = tk.node_id
            RETURNING kg_nodes.node_id
        `;
        
        const result = await client.query(query, [this.config.knowledgeSafetyK]);
        
        console.log(`🛡️ Protected top ${result.rows.length} knowledge items`);
        
        return result.rows.length;
    }

    /**
     * Prune nodes with low connectivity
     */
    async pruneLowDegreeNodes(client, isEmergency = false) {
        const ageThreshold = isEmergency ? '1 day' : '7 days';
        const degreeThreshold = isEmergency ? 1 : this.config.lowDegreeThreshold;
        
        // First, archive if enabled
        let archived = 0;
        if (this.config.archiveBeforeDelete) {
            const archiveQuery = `
                WITH low_degree_nodes AS (
                    SELECT n.*, 
                           COUNT(DISTINCT r.relationship_id) as degree
                    FROM kg_nodes n
                    LEFT JOIN kg_relationships r ON 
                        (r.source_node_id = n.node_id OR r.target_node_id = n.node_id)
                    WHERE n.consolidation_ts < NOW() - INTERVAL '${ageThreshold}'
                    AND (n.properties->>'protected' IS NULL OR n.properties->>'protected' = 'false')
                    GROUP BY n.node_id
                    HAVING COUNT(DISTINCT r.relationship_id) < $1
                )
                INSERT INTO kg_nodes_archive 
                SELECT *, NOW() as archived_at, 'LOW_DEGREE' as archive_reason
                FROM low_degree_nodes
                ON CONFLICT (node_id) DO NOTHING
                RETURNING node_id
            `;
            
            const archiveResult = await client.query(archiveQuery, [degreeThreshold]);
            archived = archiveResult.rows.length;
        }
        
        // Delete low-degree nodes
        const deleteQuery = `
            WITH low_degree_nodes AS (
                SELECT n.node_id
                FROM kg_nodes n
                LEFT JOIN kg_relationships r ON 
                    (r.source_node_id = n.node_id OR r.target_node_id = n.node_id)
                WHERE n.consolidation_ts < NOW() - INTERVAL '${ageThreshold}'
                AND (n.properties->>'protected' IS NULL OR n.properties->>'protected' = 'false')
                GROUP BY n.node_id
                HAVING COUNT(DISTINCT r.relationship_id) < $1
            )
            DELETE FROM kg_nodes
            WHERE node_id IN (SELECT node_id FROM low_degree_nodes)
            RETURNING node_id
        `;
        
        const result = await client.query(deleteQuery, [degreeThreshold]);
        
        this.metrics.pruningsByStrategy.LOW_DEGREE += result.rows.length;
        
        return result.rows.length;
    }

    /**
     * Prune by temporal decay
     */
    async pruneByTemporalDecay(client, isEmergency = false) {
        const decayWindow = isEmergency ? 
            7 * 24 * 60 * 60 * 1000 : // 7 days for emergency
            this.config.temporalDecayWindow;
        
        const cutoffTime = new Date(Date.now() - decayWindow);
        
        const query = `
            DELETE FROM kg_nodes
            WHERE last_retrieved_ts < $1
            AND confidence_score < 0.5
            AND (properties->>'protected' IS NULL OR properties->>'protected' = 'false')
            AND node_id NOT IN (
                -- Don't delete nodes that are evidence for entanglements
                SELECT DISTINCT unnest(evidence_trajectories)::uuid 
                FROM kg_entanglements
                WHERE evidence_trajectories IS NOT NULL
            )
            RETURNING node_id, node_type, confidence_score
        `;
        
        const result = await client.query(query, [cutoffTime]);
        
        this.metrics.pruningsByStrategy.TEMPORAL_DECAY += result.rows.length;
        
        return result.rows.length;
    }

    /**
     * Prune low confidence knowledge
     */
    async pruneLowConfidenceKnowledge(client, isEmergency = false) {
        const confidenceThreshold = isEmergency ? 0.2 : this.config.minConfidenceThreshold;
        
        // Prune low-confidence relationships
        const relQuery = `
            DELETE FROM kg_relationships
            WHERE confidence_score < $1
            AND created_at < NOW() - INTERVAL '3 days'
            AND relationship_id NOT IN (
                -- Keep relationships with high-confidence qualifiers
                SELECT DISTINCT relationship_id 
                FROM kg_qualifiers 
                WHERE confidence_score > 0.7
            )
            RETURNING relationship_id, relationship_type
        `;
        
        const relResult = await client.query(relQuery, [confidenceThreshold]);
        
        // Prune orphaned qualifiers
        const qualQuery = `
            DELETE FROM kg_qualifiers
            WHERE relationship_id NOT IN (
                SELECT relationship_id FROM kg_relationships
            )
        `;
        
        await client.query(qualQuery);
        
        this.metrics.pruningsByStrategy.CONFIDENCE_BASED += relResult.rows.length;
        
        return relResult.rows.length;
    }

    /**
     * Consolidate and prune episodic knowledge
     */
    async pruneConsolidatedEpisodic(client) {
        // Find clusters of highly related episodic nodes
        const consolidationQuery = `
            WITH episodic_clusters AS (
                SELECT 
                    n1.node_id as representative_id,
                    array_agg(DISTINCT n2.node_id) as cluster_nodes,
                    COUNT(DISTINCT n2.node_id) as cluster_size,
                    AVG(n2.confidence_score) as avg_confidence
                FROM kg_nodes n1
                JOIN kg_relationships r ON 
                    (r.source_node_id = n1.node_id OR r.target_node_id = n1.node_id)
                JOIN kg_nodes n2 ON 
                    ((r.source_node_id = n2.node_id OR r.target_node_id = n2.node_id) 
                     AND n2.node_id != n1.node_id)
                WHERE n1.node_type = 'episode' 
                AND n2.node_type = 'episode'
                AND n1.consolidation_ts < NOW() - INTERVAL '14 days'
                GROUP BY n1.node_id
                HAVING COUNT(DISTINCT n2.node_id) > 5
            ),
            consolidated AS (
                -- Create consolidated concept nodes
                INSERT INTO kg_nodes (
                    node_id, node_type, properties, confidence_score, 
                    created_by_agent, concept_embedding
                )
                SELECT 
                    gen_random_uuid(),
                    'consolidated_concept',
                    jsonb_build_object(
                        'source_episodes', cluster_nodes,
                        'cluster_size', cluster_size,
                        'consolidation_date', NOW()
                    ),
                    avg_confidence,
                    'pruner',
                    -- Average embedding (simplified)
                    (SELECT concept_embedding FROM kg_nodes WHERE node_id = representative_id)
                FROM episodic_clusters
                RETURNING node_id, properties->>'source_episodes' as source_episodes
            )
            -- Create CONSOLIDATES relationships
            INSERT INTO kg_relationships (
                source_node_id, target_node_id, relationship_type, 
                properties, confidence_score
            )
            SELECT 
                c.node_id,
                unnest(c.source_episodes::uuid[]),
                'CONSOLIDATES',
                '{"auto_consolidated": true}'::jsonb,
                0.9
            FROM consolidated c
        `;
        
        await client.query(consolidationQuery);
        
        // Archive consolidated episodes
        const archiveQuery = `
            WITH consolidated_episodes AS (
                SELECT DISTINCT target_node_id as node_id
                FROM kg_relationships
                WHERE relationship_type = 'CONSOLIDATES'
                AND properties->>'auto_consolidated' = 'true'
            )
            INSERT INTO kg_nodes_archive
            SELECT n.*, NOW() as archived_at, 'CONSOLIDATED' as archive_reason
            FROM kg_nodes n
            JOIN consolidated_episodes ce ON n.node_id = ce.node_id
            ON CONFLICT (node_id) DO NOTHING
        `;
        
        const archiveResult = await client.query(archiveQuery);
        
        // Delete consolidated episodes
        const deleteQuery = `
            DELETE FROM kg_nodes
            WHERE node_id IN (
                SELECT DISTINCT target_node_id
                FROM kg_relationships
                WHERE relationship_type = 'CONSOLIDATES'
                AND properties->>'auto_consolidated' = 'true'
            )
            RETURNING node_id
        `;
        
        const deleteResult = await client.query(deleteQuery);
        
        this.metrics.pruningsByStrategy.CONSOLIDATED += deleteResult.rows.length;
        
        return deleteResult.rows.length;
    }

    /**
     * Generate pruning report
     */
    async generatePruningReport(results, startTime) {
        const duration = Date.now() - startTime;
        
        const report = {
            timestamp: new Date(),
            duration,
            totalPruned: Object.values(results).reduce((sum, val) => sum + val, 0) - results.protected,
            totalArchived: results.archived,
            totalProtected: results.protected,
            byStrategy: {
                lowDegree: results.lowDegree,
                temporal: results.temporal,
                confidence: results.confidence,
                consolidated: results.consolidated
            },
            kgStatsBefore: await this.getKGStats(),
            memorySaved: this.estimateMemorySaved(results)
        };
        
        // Get post-pruning stats
        report.kgStatsAfter = await this.getKGStats();
        
        // Store last pruning report
        this.lastPruningReport = report;
        
        return report;
    }

    /**
     * Send pruning feedback to MEM1
     */
    async sendPruningFeedback(report) {
        // Analyze what types of knowledge were pruned
        const feedback = {
            timestamp: report.timestamp,
            prunedCount: report.totalPruned,
            reasons: report.byStrategy,
            
            // Patterns to help MEM1 learn
            patterns: {
                lowConnectivity: report.byStrategy.lowDegree > 0,
                temporalIrrelevance: report.byStrategy.temporal > 0,
                lowConfidence: report.byStrategy.confidence > 0,
                consolidatable: report.byStrategy.consolidated > 0
            },
            
            // Specific examples for learning
            examples: await this.getPrunedExamples()
        };
        
        this.emit('pruning_feedback', feedback);
        
        // Also emit for Memory Coordinator
        this.emit('knowledge_pruned', feedback);
    }

    /**
     * Get examples of pruned knowledge for MEM1 learning
     */
    async getPrunedExamples() {
        // Return empty examples if no database
        if (!this.db || typeof this.db.query !== 'function') {
            return [];
        }
        
        // Query recent archive for examples
        const query = `
            SELECT 
                node_type,
                properties,
                confidence_score,
                archive_reason,
                EXTRACT(DAYS FROM (archived_at - consolidation_ts)) as age_when_pruned
            FROM kg_nodes_archive
            WHERE archived_at > NOW() - INTERVAL '1 hour'
            LIMIT 10
        `;
        
        try {
            const result = await this.db.query(query);
            
            return result.rows.map(row => ({
                type: row.node_type,
                reason: row.archive_reason,
                confidence: row.confidence_score,
                ageWhenPruned: row.age_when_pruned,
                characteristics: this.extractCharacteristics(row.properties)
            }));
        } catch (error) {
            console.warn('⚠️ Could not get pruned examples:', error.message);
            return [];
        }
    }

    /**
     * Extract characteristics from pruned knowledge
     */
    extractCharacteristics(properties) {
        return {
            hasSource: !!properties.source,
            hasDomain: !!properties.domain,
            complexity: Object.keys(properties).length,
            hasEvidence: !!properties.evidence || !!properties.supporting_facts
        };
    }

    /**
     * Ensure archive table exists
     */
    async ensureArchiveTable() {
        // 🔥 DATABASE CHECK - GRACEFUL DEGRADATION!
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database not available for DynamicKGPruner - archive table creation skipped');
            return;
        }
        
        const query = `
            CREATE TABLE IF NOT EXISTS kg_nodes_archive (
                node_id UUID PRIMARY KEY,
                node_type VARCHAR(50),
                concept_embedding FLOAT[],
                properties JSONB,
                confidence_score DECIMAL(3,2),
                consolidation_ts TIMESTAMPTZ,
                last_retrieved_ts TIMESTAMPTZ,
                created_by_agent VARCHAR(255),
                archived_at TIMESTAMPTZ DEFAULT NOW(),
                archive_reason VARCHAR(50)
            )
        `;
        
        try {
            await this.db.query(query);
        } catch (error) {
            console.warn('⚠️ Could not create archive table:', error.message);
            console.warn('   Continuing without archive functionality');
        }
    }

    /**
     * Get current KG statistics
     */
    async getKGStats() {
        // Return default stats if no database
        if (!this.db || typeof this.db.query !== 'function') {
            return {
                node_count: 0,
                relationship_count: 0,
                entanglement_count: 0,
                avg_node_confidence: 0,
                protected_count: 0
            };
        }
        
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM kg_nodes) as node_count,
                (SELECT COUNT(*) FROM kg_relationships) as relationship_count,
                (SELECT COUNT(*) FROM kg_entanglements) as entanglement_count,
                (SELECT AVG(confidence_score) FROM kg_nodes) as avg_node_confidence,
                (SELECT COUNT(*) FROM kg_nodes WHERE properties->>'protected' = 'true') as protected_count
        `;
        
        try {
            const result = await this.db.query(query);
            return result.rows[0];
        } catch (error) {
            console.warn('⚠️ Could not get KG stats:', error.message);
            return {
                node_count: 0,
                relationship_count: 0,
                entanglement_count: 0,
                avg_node_confidence: 0,
                protected_count: 0
            };
        }
    }

    /**
     * Estimate memory saved by pruning
     */
    estimateMemorySaved(results) {
        // Rough estimates
        const bytesPerNode = 1024;
        const bytesPerRelationship = 512;
        const bytesPerQualifier = 256;
        
        const nodesPruned = results.lowDegree + results.temporal;
        const relationshipsPruned = results.confidence;
        
        return {
            bytes: (nodesPruned * bytesPerNode) + (relationshipsPruned * bytesPerRelationship),
            megabytes: ((nodesPruned * bytesPerNode) + (relationshipsPruned * bytesPerRelationship)) / (1024 * 1024)
        };
    }

    /**
     * Update metrics
     */
    updateMetrics(results) {
        this.metrics.totalPruned += results.lowDegree + results.temporal + 
                                   results.confidence + results.consolidated;
        this.metrics.totalArchived += results.archived;
        this.metrics.lastPruningTime = new Date();
    }

    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            config: this.config,
            metrics: this.metrics,
            initialized: this.initialized,
            lastPruningReport: this.lastPruningReport || null
        };
        
        return state;
    }
    
    /**
     * Restore state from persistence
     */
    async setState(state) {
        if (!state) return;
        
        // Restore config
        if (state.config) {
            this.config = { ...this.config, ...state.config };
        }
        
        // Restore metrics
        if (state.metrics) {
            this.metrics = { ...this.metrics, ...state.metrics };
        }
        
        // Restore last pruning report
        if (state.lastPruningReport) {
            this.lastPruningReport = state.lastPruningReport;
        }
        
        console.log('✅ Dynamic KG Pruner state restored');
    }
    
    /**
     * Save state for persistence
     */
    async saveState() {
        return await this.getState();
    }
    
    /**
     * Load state from persistence
     */
    async loadState(state) {
        return await this.setState(state);
    }
    
    /**
     * Get pruner statistics
     */
    getStats() {
        return {
            metrics: this.metrics,
            config: {
                kSafetyValue: this.config.knowledgeSafetyK,
                strategies: this.config.pruningStrategies,
                temporalWindow: this.config.temporalDecayWindow / (24 * 60 * 60 * 1000) + ' days'
            }
        };
    }
    
    /**
     * 🔥 Store pruning operation to KG/UnifiedStorage
     */
    async storePruningOperationToKG(pruningData) {
        if (!this.enableKGRouting) return null;
        
        try {
            const operationData = {
                type: 'pruning_operation',
                timestamp: Date.now(),
                stats: pruningData.stats,
                strategies: pruningData.strategies,
                totalPruned: pruningData.totalPruned,
                memoryImpact: pruningData.memoryImpact
            };
            
            if (this.unifiedKnowledgeStorage) {
                // Use unified storage pipeline
                const result = await this.unifiedKnowledgeStorage.storeKnowledge(operationData, {
                    agentId: 'DynamicKGPruner',
                    type: 'pruning_operation',
                    confidence: 0.9
                });
                
                if (result.success) {
                    console.log(`   🔥 Pruning operation stored to KG: ${result.nodeId}`);
                }
                return result;
            } else if (this.knowledgeGraph) {
                // Direct KG storage
                const node = await this.knowledgeGraph.createNode({
                    nodeType: 'pruning_operation',
                    content: operationData,
                    metadata: {
                        source: 'DynamicKGPruner',
                        operation: 'pruning',
                        timestamp: Date.now()
                    }
                });
                console.log(`   🔥 Pruning operation stored directly to KG: ${node.nodeId}`);
                return node;
            }
        } catch (error) {
            console.error('❌ Failed to store pruning operation to KG:', error.message);
        }
        
        return null;
    }
    
    /**
     * 🔥 Store pruned node metadata for learning
     */
    async persistPrunedNodeMetadata(prunedNode, metadata = {}) {
        if (!this.eliteMemoryPersistence) return null;
        
        try {
            // Store with KG routing enabled
            const result = await this.eliteMemoryPersistence.storeMemory(
                `pruned_node_${prunedNode.nodeId}_${Date.now()}`,
                {
                    nodeId: prunedNode.nodeId,
                    nodeType: prunedNode.nodeType,
                    pruningReason: prunedNode.reason,
                    confidenceScore: prunedNode.confidence,
                    characteristics: prunedNode.characteristics,
                    engine: 'DynamicKGPruner',
                    timestamp: Date.now()
                },
                {
                    storeToKG: true, // 🔥 ENABLE KG ROUTING!
                    agentId: 'DynamicKGPruner',
                    confidence: 0.8,
                    ...metadata
                }
            );
            
            if (result.success) {
                console.log('   🔥 Pruned node metadata persisted with KG routing');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Failed to persist pruned node metadata:', error.message);
            return null;
        }
    }
}
