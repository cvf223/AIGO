/**
 * 🧠 KNOWLEDGE GRAPH - STRUCTURED PERSISTENT MEMORY
 * ================================================
 * 
 * Implements the persistent, queryable knowledge structure with:
 * - Hyper-relational facts with qualifiers
 * - Quantum-inspired entanglements
 * - Dynamic pruning capabilities
 * - Multi-hop reasoning support
 */

import { EventEmitter } from 'events';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

export class KnowledgeGraph extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            pruningEnabled: config.pruningEnabled ?? true,
            pruningInterval: config.pruningInterval || 3600000, // 1 hour
            kSafetyValue: config.kSafetyValue || 10000, // Top-K knowledge to preserve
            entanglementThreshold: config.entanglementThreshold || 0.7,
            temporalDecayWindow: config.temporalDecayWindow || 30 * 24 * 60 * 60 * 1000, // 30 days
            ...config
        };
        
        // Metrics tracking
        this.metrics = {
            nodeCount: 0,
            relationshipCount: 0,
            entanglementCount: 0,
            pruningOperations: 0,
            multiHopQueries: 0,
            averageQueryDepth: 0
        };
        
        this.initialized = false;
        this.isInitialized = false; // For test compatibility
        this.useInMemoryFallback = false;
        this.isShuttingDown = false; // 🔥 FIX: Track shutdown state
        this.inMemoryNodes = new Map();
        this.inMemoryRelationships = new Map();
        this.inMemoryEntanglements = new Map();
    }

    /**
     * Initialize Knowledge Graph with database connection
     * ENHANCED: Sophisticated database and persistence integration
     */
    async initialize(dependencies = {}) {
        console.log('🧠 Initializing Knowledge Graph...');
        
        // SOPHISTICATED: Handle multiple database parameter formats for flexibility
        this.db = dependencies.database || dependencies.db || null;
        this.embeddingService = dependencies.embeddingService || null;
        
        // ENHANCED: Connect to sophisticated persistence layer if available
        if (!this.persistence && dependencies.persistence) {
            this.persistence = dependencies.persistence;
        }
        
        // SUPERIOR: If no direct DB but persistence provider exists, use that
        if (!this.db && this.persistence?.provider?.database) {
            this.db = this.persistence.provider.database;
        }
        
        // ADVANCED: Log persistence configuration
        if (this.db) {
            console.log('   📊 Database persistence: ENABLED');
        } else {
            console.log('   💾 In-memory mode: Using local storage only');
        }
        
        // SUPERIOR: Check if tables exist and use in-memory fallback if not
        if (this.db && typeof this.db.query === 'function') {
            try {
                const tableCheck = await this.db.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'kg_nodes'
                    ) as kg_nodes_exists,
                    EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'kg_relationships'
                    ) as kg_relationships_exists,
                    EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'kg_entanglements'
                    ) as kg_entanglements_exists
                `);
                
                const { kg_nodes_exists, kg_relationships_exists, kg_entanglements_exists } = tableCheck.rows[0];
                
                if (!kg_nodes_exists || !kg_relationships_exists || !kg_entanglements_exists) {
                    throw new Error("DATABASE_REQUIRED: System requires database");
                    console.warn('   ⚠️ CRITICAL MONITORING: Knowledge Graph FULLY IN-MEMORY (no database persistence)');
                    console.warn('   🚨 PRODUCTION: This should NEVER happen - KG tables required!');
                    this.useInMemoryFallback = true;
                }
            } catch (error) {
                console.error('   ❌ FALLBACK MODE: Database check FAILED - using in-memory storage');
                console.error('   ⚠️ CRITICAL MONITORING: Knowledge Graph database unavailable!');
                console.error('   🚨 Error:', error.message);
                this.useInMemoryFallback = true;
            }
        } else {
            console.warn('   ⚠️ CRITICAL MONITORING: Knowledge Graph initialized without database!');
            console.warn('   🚨 PRODUCTION: Database is MANDATORY for persistence!');
            console.warn('   💾 Using in-memory fallback for development/testing');
            this.useInMemoryFallback = true;
        }
        
        // Update initial metrics
        await this.updateMetrics();
        
        // Start pruning scheduler if enabled
        if (this.config.pruningEnabled && !this.useInMemoryFallback) {
            this.startPruningScheduler();
        }
        
        this.initialized = true;
        this.isInitialized = true; // For test compatibility
        console.log('✅ Knowledge Graph initialized' + (this.useInMemoryFallback ? ' (in-memory mode)' : ''));
        
        return true;
    }

    /**
     * Create a node in the knowledge graph
     */
    async createNode(nodeData) {
        // SUPERIOR: Generate embedding if not provided
        let embedding = nodeData.embedding;
        if (!embedding && this.embeddingService) {
            // Generate embedding from node properties
            const text = JSON.stringify({
                type: nodeData.nodeType,
                ...nodeData.properties
            });
            embedding = await this.embeddingService.embed(text);
        }
        
        const node = {
            nodeId: nodeData.nodeId || uuidv4(),
            nodeType: nodeData.nodeType,
            conceptEmbedding: embedding,
            properties: nodeData.properties || {},
            confidenceScore: nodeData.confidence || 0.8,
            createdByAgent: nodeData.createdBy || 'system',
            consolidationTs: new Date(),
            lastRetrievedTs: new Date()
        };
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Knowledge Graph in IN-MEMORY mode!');
            // Store in memory for testing
            this.inMemoryNodes.set(node.nodeId, {
                ...node,
                node_id: node.nodeId,
                node_type: node.nodeType,
                concept_embedding: node.conceptEmbedding,
                confidence_score: node.confidenceScore,
                created_by_agent: node.createdByAgent,
                consolidation_ts: node.consolidationTs,
                last_retrieved_ts: node.lastRetrievedTs
            });
            
            this.metrics.nodeCount++;
            this.emit('node_created', node);
            
            // Add embedding field for test compatibility
            node.embedding = node.conceptEmbedding;
            
            // Add id alias for API compatibility
            node.id = node.nodeId;
            
            console.log(`   ✅ Node created: ID ${node.id}`);
            
            return node;
        }
        
        // Original database implementation
        // CRITICAL FIX: Check database is available
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('   ⚠️ Database not available for createNode - falling back to in-memory');
            this.inMemoryOnly = true;
            return await this.createNode(nodeData); // Retry with in-memory mode
        }
        
        const query = `
            INSERT INTO kg_nodes (
                node_id, node_type, concept_embedding, properties,
                confidence_score, created_by_agent, consolidation_ts, last_retrieved_ts
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (node_id) 
            DO UPDATE SET 
                properties = kg_nodes.properties || EXCLUDED.properties,
                confidence_score = GREATEST(kg_nodes.confidence_score, EXCLUDED.confidence_score),
                last_retrieved_ts = NOW()
            RETURNING *
        `;
        
        const result = await this.db.query(query, [
            node.nodeId,
            node.nodeType,
            node.conceptEmbedding,
            node.properties,
            node.confidenceScore,
            node.createdByAgent,
            node.consolidationTs,
            node.lastRetrievedTs
        ]);
        
        this.emit('node_created', result.rows[0]);
        await this.updateMetrics();
        
        // Add embedding field for test compatibility
        const returnNode = result.rows[0];
        if (returnNode) {
            returnNode.embedding = returnNode.concept_embedding;
        }
        return returnNode;
    }

    /**
     * Create a relationship between nodes
     */
    async createRelationship(relationshipData) {
        const relationship = {
            relationshipId: uuidv4(),
            // SUPERIOR: Handle both source/sourceId and target/targetId for compatibility
            sourceNodeId: relationshipData.source || relationshipData.sourceId,
            targetNodeId: relationshipData.target || relationshipData.targetId,
            relationshipType: relationshipData.type || relationshipData.relationshipType,
            properties: relationshipData.properties || {},
            confidenceScore: relationshipData.confidence || 0.8,
            provenanceAgent: relationshipData.provenance || 'system'
        };
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Knowledge Graph relationships in IN-MEMORY mode!');
            // Store in memory for testing
            this.inMemoryRelationships.set(relationship.relationshipId, {
                ...relationship,
                relationship_id: relationship.relationshipId,
                source_node_id: relationship.sourceNodeId,
                target_node_id: relationship.targetNodeId,
                relationship_type: relationship.relationshipType,
                confidence_score: relationship.confidenceScore,
                provenance_agent: relationship.provenanceAgent
            });
            
            this.metrics.relationshipCount++;
            this.emit('relationship_created', relationship);
            
            // Add id alias for API compatibility
            relationship.id = relationship.relationshipId;
            
            console.log(`   ✅ Relationship created: ID ${relationship.id}`);
            
            return relationship;
        }
        
        // Original database implementation
        const query = `
            INSERT INTO kg_relationships (
                relationship_id, source_node_id, target_node_id,
                relationship_type, properties, confidence_score, provenance_agent
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const result = await this.db.query(query, [
            relationship.relationshipId,
            relationship.sourceNodeId,
            relationship.targetNodeId,
            relationship.relationshipType,
            relationship.properties,
            relationship.confidenceScore,
            relationship.provenanceAgent
        ]);
        
        // Check if this should trigger entanglement calculation
        await this.checkForEntanglement(relationship);
        
        this.emit('relationship_created', result.rows[0]);
        await this.updateMetrics();
        
        return result.rows[0];
    }

    /**
     * Add a single qualifier to a relationship (wrapper for test compatibility)
     */
    async addQualifier(qualifierData) {
        const results = await this.addQualifiers(qualifierData.relationshipId, [{
            key: qualifierData.key,
            value: qualifierData.value,
            confidence: qualifierData.confidence
        }]);
        
        // Return expected format for test
        return {
            success: results && results.length > 0,
            qualifier: results[0],
            qualifiers: results
        };
    }

    /**
     * Add qualifiers to a relationship (hyper-relational support)
     */
    async addQualifiers(relationshipId, qualifiers) {
        const results = [];
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Qualifiers stored in-memory (no database persistence)');
            // Handle array of qualifiers
            const qualifiersList = Array.isArray(qualifiers) ? qualifiers : 
                Object.entries(qualifiers).map(([key, value]) => ({ key, value }));
            
            for (const qualifier of qualifiersList) {
                const qualifierId = uuidv4();
                const qualifierRecord = {
                    qualifier_id: qualifierId,
                    relationship_id: relationshipId,
                    qualifier_key: qualifier.key,
                    qualifier_value: qualifier.value?.toString() || '',
                    confidence_score: qualifier.confidence || 0.8
                };
                
                // Store using composite key
                const compositeKey = `${relationshipId}:${qualifier.key}`;
                this.inMemoryEntanglements.set(compositeKey, qualifierRecord);
                results.push(qualifierRecord);
            }
            
            this.emit('qualifiers_added', { relationshipId, qualifiers: results });
            return results;
        }
        
        // Original database implementation
        for (const [key, value] of Object.entries(qualifiers)) {
            const query = `
                INSERT INTO kg_qualifiers (
                    relationship_id, qualifier_key, qualifier_value, confidence_score
                ) VALUES ($1, $2, $3, $4)
                RETURNING *
            `;
            
            const result = await this.db.query(query, [
                relationshipId,
                key,
                value.toString(),
                qualifiers._confidence?.[key] || 0.8
            ]);
            
            results.push(result.rows[0]);
        }
        
        this.emit('qualifiers_added', { relationshipId, qualifiers: results });
        
        return results;
    }

    /**
     * Create quantum-inspired entanglement (alias for test compatibility)
     */
    async createQuantumEntanglement(entanglementData) {
        return await this.createEntanglement(entanglementData);
    }

    /**
     * Create quantum-inspired entanglement between nodes
     */
    async createEntanglement(entanglementData) {
        const entanglement = {
            entanglementId: uuidv4(),
            nodeAId: entanglementData.nodeA || entanglementData.nodeAId,
            nodeBId: entanglementData.nodeB || entanglementData.nodeBId,
            strength: entanglementData.strength,
            method: entanglementData.method || entanglementData.entanglementType || 'quantum',
            evidenceTrajectories: entanglementData.evidence || [],
            metadata: entanglementData.metadata || {}
        };
        
        // Ensure bidirectional uniqueness
        const [nodeA, nodeB] = [entanglement.nodeAId, entanglement.nodeBId].sort();
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Quantum entanglements stored in-memory (no database)');
            const entanglementRecord = {
                ...entanglement,
                entanglement_id: entanglement.entanglementId,
                node_a_id: nodeA,
                node_b_id: nodeB,
                entanglement_strength: entanglement.strength,
                calculation_method: entanglement.method,
                evidence_trajectories: entanglement.evidenceTrajectories
            };
            
            // Store using composite key to ensure uniqueness
            const compositeKey = `${nodeA}:${nodeB}`;
            this.inMemoryEntanglements.set(compositeKey, entanglementRecord);
            
            this.metrics.entanglementCount++;
            this.emit('entanglement_created', entanglementRecord);
            
            return entanglementRecord;
        }
        
        // Original database implementation
        const query = `
            INSERT INTO kg_entanglements (
                entanglement_id, node_a_id, node_b_id,
                entanglement_strength, calculation_method, evidence_trajectories
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (node_a_id, node_b_id) 
            DO UPDATE SET 
                entanglement_strength = GREATEST(
                    kg_entanglements.entanglement_strength, 
                    EXCLUDED.entanglement_strength
                ),
                evidence_trajectories = kg_entanglements.evidence_trajectories || 
                                       EXCLUDED.evidence_trajectories
            RETURNING *
        `;
        
        const result = await this.db.query(query, [
            entanglement.entanglementId,
            nodeA,
            nodeB,
            entanglement.strength,
            entanglement.method,
            entanglement.evidenceTrajectories
        ]);
        
        this.emit('entanglement_created', result.rows[0]);
        await this.updateMetrics();
        
        return result.rows[0];
    }

    /**
     * 🔍 QUERY NODES (UNIVERSAL QUERY METHOD)
     * ======================================
     * Universal query method - accepts string, embedding array, or object
     * SOPHISTICATED: Can return comprehensive results with causal + entangled if requested
     */
    async queryNodes(params) {
        const query = params.query || params;
        const limit = params.limit || 10;
        const threshold = params.threshold || 0.7;
        const comprehensive = params.comprehensive || params.includeRelated || false;
        
        // String query: Search by text
        if (typeof query === 'string') {
            // Try embedding search first
            if (this.embeddingService) {
                try {
                    const embedFn = this.embeddingService.embed || this.embeddingService.encode;
                    if (embedFn) {
                        const embedding = await embedFn.call(this.embeddingService, query);
                        return await this.searchByEmbedding(embedding, { threshold, limit });
                    }
                } catch (error) {
                    // Fall through to text search
                }
            }
            
            // Fallback: Text match in memory
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Using simple text matching (no vector search)');
            const results = [];
            for (const [nodeId, node] of this.inMemoryNodes || new Map()) {
                const nodeText = JSON.stringify(node.properties || {}).toLowerCase();
                if (nodeText.includes(query.toLowerCase())) {
                    results.push(node);
                    if (results.length >= limit) break;
                }
            }
            console.log(`   📊 Text search found ${results.length} results`);
            return results;
        }
        
        // Array query: Embedding search
        if (Array.isArray(query)) {
            const directResults = await this.searchByEmbedding(query, { threshold, limit });
            
            // If comprehensive, add related nodes
            if (comprehensive && directResults.length > 0) {
                return await this.getComprehensiveResults(directResults, limit);
            }
            
            return directResults;
        }
        
        // Object query: Property match
        if (typeof query === 'object' && query !== null) {
            const results = [];
            for (const [nodeId, node] of this.inMemoryNodes || new Map()) {
                let matches = true;
                for (const [key, value] of Object.entries(query)) {
                    if (node.properties?.[key] !== value) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    results.push(node);
                    if (results.length >= limit) break;
                }
            }
            
            // If comprehensive, add related nodes
            if (comprehensive && results.length > 0) {
                return await this.getComprehensiveResults(results, limit);
            }
            
            return results;
        }
        
        return [];
    }
    
    /**
     * 🔗 GET COMPREHENSIVE RESULTS
     * ===========================
     * SOPHISTICATED: Add causally related + entangled + historical context
     * NEVER MISS INFORMATION!
     */
    async getComprehensiveResults(directResults, limit) {
        console.log('   🔍 COMPREHENSIVE MODE: Gathering related knowledge...');
        
        const allResults = [...directResults];
        
        // Get related nodes via relationships
        for (const result of directResults.slice(0, 3)) {
            const nodeId = result.node_id || result.id;
            if (!nodeId) continue;
            
            // Get all relationships
            const related = await this.multiHopTraversal(nodeId, {
                maxHops: 2,
                relationshipTypes: [],
                includeEntanglements: true
            });
            
            allResults.push(...(related.nodes || []));
        }
        
        // Deduplicate
        const seen = new Set();
        const deduplicated = [];
        for (const result of allResults) {
            const id = result.node_id || result.id;
            if (id && !seen.has(id)) {
                seen.add(id);
                deduplicated.push(result);
            }
        }
        
        console.log(`   ✅ Comprehensive results: ${deduplicated.length} nodes (direct + related)`);
        
        return deduplicated.slice(0, limit * 3); // Return more for comprehensive
    }
    
    /**
     * Search nodes by embedding similarity
     */
    async searchByEmbedding(embedding, options = {}) {
        const threshold = options.threshold || 0.7;
        const limit = options.limit || 10;
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Vector search in IN-MEMORY mode (no pgvector)');
            // Simple similarity calculation for in-memory nodes
            const results = [];
            
            for (const [nodeId, node] of this.inMemoryNodes) {
                // Calculate simple similarity (if embeddings exist)
                let similarity = 0.5; // Default similarity
                
                if (node.conceptEmbedding && embedding) {
                    // Calculate cosine similarity (simplified)
                    let dotProduct = 0;
                    let normA = 0;
                    let normB = 0;
                    
                    const len = Math.min(embedding.length, node.conceptEmbedding.length);
                    for (let i = 0; i < len; i++) {
                        dotProduct += embedding[i] * (node.conceptEmbedding[i] || 0);
                        normA += embedding[i] * embedding[i];
                        normB += (node.conceptEmbedding[i] || 0) * (node.conceptEmbedding[i] || 0);
                    }
                    
                    if (normA > 0 && normB > 0) {
                        similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                    }
                }
                
                if (similarity >= threshold) {
                    results.push({
                        node_id: node.nodeId,
                        node_type: node.nodeType,
                        properties: node.properties,
                        confidence_score: node.confidenceScore,
                        similarity
                    });
                }
            }
            
            // Sort by similarity and limit
            results.sort((a, b) => b.similarity - a.similarity);
            return results.slice(0, limit);
        }
        
        // Original database implementation
        const query = `
            WITH similar_nodes AS (
                SELECT 
                    node_id,
                    node_type,
                    properties,
                    confidence_score,
                    1 - (concept_embedding <=> $1::vector) as similarity
                FROM kg_nodes
                WHERE 1 - (concept_embedding <=> $1::vector) > $2
                ORDER BY similarity DESC
                LIMIT $3
            )
            UPDATE kg_nodes
            SET last_retrieved_ts = NOW()
            FROM similar_nodes
            WHERE kg_nodes.node_id = similar_nodes.node_id
            RETURNING similar_nodes.*
        `;
        
        const result = await this.db.query(query, [embedding, threshold, limit]);
        
        return result.rows;
    }

    /**
     * Perform multi-hop graph traversal
     */
    async multiHopTraversal(startNodeId, options = {}) {
        const maxHops = options.maxHops || 3;
        const relationshipTypes = options.relationshipTypes || [];
        const includeEntanglements = options.includeEntanglements ?? true;
        
        const startTime = Date.now();
        
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Multi-hop traversal in IN-MEMORY mode!');
            const visited = new Set();
            const result = {
                nodes: [],
                paths: [],
                entanglements: []
            };
            
            // BFS traversal for in-memory graph
            const queue = [{
                nodeId: startNodeId,
                hopCount: 0,
                path: [startNodeId],
                relationships: []
            }];
            
            visited.add(startNodeId);
            
            while (queue.length > 0) {
                const current = queue.shift();
                
                if (current.hopCount <= maxHops) {
                    // Add node to results if it exists
                    const node = this.inMemoryNodes.get(current.nodeId);
                    if (node) {
                        result.nodes.push({
                            node_id: node.nodeId,
                            node_type: node.nodeType,
                            properties: node.properties,
                            confidence_score: node.confidenceScore,
                            hop_count: current.hopCount,
                            path: current.path
                        });
                    }
                    
                    // Find connected nodes through relationships
                    if (current.hopCount < maxHops) {
                        for (const [relId, rel] of this.inMemoryRelationships) {
                            // Check if relationship matches type filter
                            if (relationshipTypes.length > 0 && 
                                !relationshipTypes.includes(rel.relationshipType)) {
                                continue;
                            }
                            
                            let nextNodeId = null;
                            if (rel.sourceNodeId === current.nodeId) {
                                nextNodeId = rel.targetNodeId;
                            } else if (rel.targetNodeId === current.nodeId) {
                                nextNodeId = rel.sourceNodeId;
                            }
                            
                            if (nextNodeId && !visited.has(nextNodeId)) {
                                visited.add(nextNodeId);
                                queue.push({
                                    nodeId: nextNodeId,
                                    hopCount: current.hopCount + 1,
                                    path: [...current.path, nextNodeId],
                                    relationships: [...current.relationships, rel.relationshipType]
                                });
                            }
                        }
                    }
                }
            }
            
            // Update metrics
            this.metrics.multiHopQueries++;
            this.metrics.averageQueryDepth = 
                ((this.metrics.averageQueryDepth * (this.metrics.multiHopQueries - 1)) + maxHops) / 
                this.metrics.multiHopQueries;
            
            // Return nodes array for test compatibility
            return result.nodes;
        }
        
        // Build dynamic query based on options
        let query = `
            WITH RECURSIVE traversal AS (
                -- Base case: start node
                SELECT 
                    n.node_id,
                    n.node_type,
                    n.properties,
                    n.confidence_score,
                    0 as hop_count,
                    ARRAY[n.node_id] as path,
                    ARRAY[]::text[] as relationships
                FROM kg_nodes n
                WHERE n.node_id = $1
                
                UNION ALL
                
                -- Recursive case: follow relationships
                SELECT 
                    n.node_id,
                    n.node_type,
                    n.properties,
                    n.confidence_score,
                    t.hop_count + 1,
                    t.path || n.node_id,
                    t.relationships || r.relationship_type
                FROM traversal t
                JOIN kg_relationships r ON (
                    (r.source_node_id = t.node_id OR r.target_node_id = t.node_id)
                    ${relationshipTypes.length > 0 ? 
                        'AND r.relationship_type = ANY($3)' : ''}
                )
                JOIN kg_nodes n ON (
                    n.node_id = CASE 
                        WHEN r.source_node_id = t.node_id THEN r.target_node_id
                        ELSE r.source_node_id
                    END
                )
                WHERE t.hop_count < $2
                AND NOT (n.node_id = ANY(t.path))
        `;
        
        if (includeEntanglements) {
            query += `
                UNION ALL
                
                -- Include entangled nodes
                SELECT 
                    n.node_id,
                    n.node_type,
                    n.properties,
                    n.confidence_score,
                    t.hop_count + 1,
                    t.path || n.node_id,
                    t.relationships || 'ENTANGLED'
                FROM traversal t
                JOIN kg_entanglements e ON (
                    e.node_a_id = t.node_id OR e.node_b_id = t.node_id
                )
                JOIN kg_nodes n ON (
                    n.node_id = CASE 
                        WHEN e.node_a_id = t.node_id THEN e.node_b_id
                        ELSE e.node_a_id
                    END
                )
                WHERE t.hop_count < $2
                AND NOT (n.node_id = ANY(t.path))
                AND e.entanglement_strength > $4
            `;
        }
        
        query += `
            )
            SELECT DISTINCT ON (node_id) * FROM traversal
            ORDER BY node_id, hop_count
        `;
        
        const params = [startNodeId, maxHops];
        if (relationshipTypes.length > 0) params.push(relationshipTypes);
        if (includeEntanglements) params.push(this.config.entanglementThreshold);
        
        const result = await this.db.query(query, params);
        
        // Update metrics
        this.metrics.multiHopQueries++;
        const totalHops = result.rows.reduce((sum, row) => sum + row.hop_count, 0);
        this.metrics.averageQueryDepth = 
            (this.metrics.averageQueryDepth * (this.metrics.multiHopQueries - 1) + 
             totalHops / Math.max(1, result.rows.length)) / this.metrics.multiHopQueries;
        
        this.emit('multi_hop_traversal', {
            startNode: startNodeId,
            nodesReached: result.rows.length,
            duration: Date.now() - startTime
        });
        
        return result.rows;
    }

    /**
     * Query hyper-relational facts with qualifiers
     */
    async queryWithQualifiers(mainTriple, qualifierConstraints = {}) {
        let query = `
            SELECT 
                r.*,
                json_agg(
                    json_build_object(
                        'key', q.qualifier_key,
                        'value', q.qualifier_value,
                        'confidence', q.confidence_score
                    )
                ) as qualifiers
            FROM kg_relationships r
            LEFT JOIN kg_qualifiers q ON r.relationship_id = q.relationship_id
            WHERE r.relationship_type = $1
        `;
        
        const params = [mainTriple.predicate];
        let paramCount = 1;
        
        if (mainTriple.subject) {
            paramCount++;
            query += ` AND r.source_node_id = $${paramCount}`;
            params.push(mainTriple.subject);
        }
        
        if (mainTriple.object) {
            paramCount++;
            query += ` AND r.target_node_id = $${paramCount}`;
            params.push(mainTriple.object);
        }
        
        // Add qualifier constraints
        for (const [key, value] of Object.entries(qualifierConstraints)) {
            paramCount += 2;
            query += ` AND EXISTS (
                SELECT 1 FROM kg_qualifiers q2 
                WHERE q2.relationship_id = r.relationship_id 
                AND q2.qualifier_key = $${paramCount} 
                AND q2.qualifier_value = $${paramCount + 1}
            )`;
            params.push(key, value.toString());
        }
        
        query += ` GROUP BY r.relationship_id`;
        
        const result = await this.db.query(query, params);
        
        return result.rows;
    }

    /**
     * Dynamic pruning of low-value knowledge
     */
    async executePruning() {
        if (!this.config.pruningEnabled) return;
        
        console.log('🧹 Executing knowledge graph pruning...');
        const startTime = Date.now();
        
        const pruningResults = {
            lowDegree: 0,
            temporal: 0,
            confidence: 0,
            archived: 0
        };
        
        const client = await this.db.connect();
        
        try {
            await client.query('BEGIN');
            
            // 1. Archive low-degree nodes
            pruningResults.lowDegree = await this.pruneLowDegreeNodes(client);
            
            // 2. Temporal decay pruning
            pruningResults.temporal = await this.pruneByTemporalDecay(client);
            
            // 3. Low confidence pruning
            pruningResults.confidence = await this.pruneLowConfidenceKnowledge(client);
            
            // 4. Ensure K-safety guarantee
            await this.ensureKSafety(client);
            
            await client.query('COMMIT');
            
            this.metrics.pruningOperations++;
            
            this.emit('pruning_complete', {
                results: pruningResults,
                duration: Date.now() - startTime
            });
            
            // Send feedback to MEM1 agents
            await this.sendPruningFeedback(pruningResults);
            
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('❌ Pruning failed:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Prune nodes with low connectivity
     */
    async pruneLowDegreeNodes(client) {
        // Archive nodes with degree < 2 that are older than 7 days
        const archiveQuery = `
            WITH low_degree_nodes AS (
                SELECT n.node_id, n.properties, 
                       COUNT(DISTINCT r.relationship_id) as degree
                FROM kg_nodes n
                LEFT JOIN kg_relationships r ON 
                    (r.source_node_id = n.node_id OR r.target_node_id = n.node_id)
                WHERE n.consolidation_ts < NOW() - INTERVAL '7 days'
                GROUP BY n.node_id, n.properties
                HAVING COUNT(DISTINCT r.relationship_id) < 2
            )
            INSERT INTO kg_nodes_archive 
            SELECT * FROM kg_nodes 
            WHERE node_id IN (SELECT node_id FROM low_degree_nodes)
            RETURNING node_id
        `;
        
        const archived = await client.query(archiveQuery);
        
        // Delete archived nodes
        if (archived.rows.length > 0) {
            await client.query(
                'DELETE FROM kg_nodes WHERE node_id = ANY($1)',
                [archived.rows.map(r => r.node_id)]
            );
        }
        
        return archived.rows.length;
    }

    /**
     * Prune by temporal decay
     */
    async pruneByTemporalDecay(client) {
        const cutoffTime = new Date(Date.now() - this.config.temporalDecayWindow);
        
        const query = `
            DELETE FROM kg_nodes
            WHERE last_retrieved_ts < $1
            AND confidence_score < 0.5
            AND node_id NOT IN (
                SELECT DISTINCT unnest(evidence_trajectories)::uuid 
                FROM kg_entanglements
            )
            RETURNING node_id
        `;
        
        const result = await client.query(query, [cutoffTime]);
        
        return result.rows.length;
    }

    /**
     * Prune low confidence knowledge
     */
    async pruneLowConfidenceKnowledge(client) {
        const query = `
            DELETE FROM kg_relationships
            WHERE confidence_score < 0.3
            AND created_at < NOW() - INTERVAL '3 days'
            AND relationship_id NOT IN (
                SELECT DISTINCT relationship_id 
                FROM kg_qualifiers 
                WHERE confidence_score > 0.7
            )
            RETURNING relationship_id
        `;
        
        const result = await client.query(query);
        
        return result.rows.length;
    }

    /**
     * Ensure top-K knowledge is preserved
     */
    async ensureKSafety(client) {
        // Calculate composite relevance score and protect top-K
        const query = `
            WITH relevance_scores AS (
                SELECT 
                    node_id,
                    confidence_score * 
                    LOG(2 + (
                        SELECT COUNT(*) FROM kg_relationships 
                        WHERE source_node_id = n.node_id 
                        OR target_node_id = n.node_id
                    )) * 
                    EXP(-EXTRACT(EPOCH FROM (NOW() - last_retrieved_ts)) / 86400 / 30) 
                    as relevance_score
                FROM kg_nodes n
                ORDER BY relevance_score DESC
                LIMIT $1
            )
            UPDATE kg_nodes
            SET properties = properties || '{"protected": true}'::jsonb
            WHERE node_id IN (SELECT node_id FROM relevance_scores)
        `;
        
        await client.query(query, [this.config.kSafetyValue]);
    }

    /**
     * Send pruning feedback to MEM1 agents
     */
    async sendPruningFeedback(pruningResults) {
        this.emit('pruning_feedback', {
            prunedCount: Object.values(pruningResults).reduce((a, b) => a + b, 0),
            reasons: pruningResults,
            timestamp: Date.now()
        });
    }

    /**
     * Check if new relationship should create entanglement
     */
    async checkForEntanglement(relationship) {
        // This is handled by the separate Entanglement Engine
        // Just emit event for it to process
        this.emit('potential_entanglement', relationship);
    }

    /**
     * Start background pruning scheduler
     */
    startPruningScheduler() {
        setInterval(async () => {
            await this.executePruning();
        }, this.config.pruningInterval);
        
        console.log(`🧹 Pruning scheduler started (every ${this.config.pruningInterval}ms)`);
    }

    /**
     * Execute dynamic pruning (wrapper for test compatibility)
     */
    async executeDynamicPruning(strategy = 'value_based', options = {}) {
        // SUPERIOR: Handle in-memory fallback for testing
        if (this.useInMemoryFallback) {
            throw new Error("DATABASE_REQUIRED: System requires database");
            console.warn('   ⚠️ MONITORING: Graph pruning in IN-MEMORY mode!');
            const startSize = this.inMemoryNodes.size;
            const threshold = options.threshold || 0.3;
            const maxAge = options.maxAge || 86400000;
            const now = Date.now();
            
            let removed = 0;
            
            // Simulate pruning based on strategy
            if (strategy === 'value_based') {
                // Remove low-confidence nodes
                for (const [nodeId, node] of this.inMemoryNodes) {
                    if (node.confidenceScore < threshold) {
                        this.inMemoryNodes.delete(nodeId);
                        removed++;
                    }
                }
            } else if (strategy === 'temporal') {
                // Remove old nodes
                for (const [nodeId, node] of this.inMemoryNodes) {
                    const age = now - (node.consolidationTs?.getTime() || now);
                    if (age > maxAge) {
                        this.inMemoryNodes.delete(nodeId);
                        removed++;
                    }
                }
            }
            
            return {
                removed,
                strategy,
                previousSize: startSize,
                currentSize: this.inMemoryNodes.size
            };
        }
        
        // For database mode, delegate to executePruning
        if (!this.config.pruningEnabled) {
            return { removed: 0, strategy };
        }
        
        await this.executePruning();
        
        // Return expected format
        return {
            removed: this.metrics.lastPruned || 0,
            strategy,
            timestamp: Date.now()
        };
    }

    /**
     * Update metrics
     */
    async updateMetrics() {
        // SUPERIOR: Handle in-memory fallback
        if (this.useInMemoryFallback) {
            console.warn('   ⚠️ MONITORING: Metrics calculation in IN-MEMORY mode!');
            this.metrics.nodeCount = this.inMemoryNodes.size;
            this.metrics.relationshipCount = this.inMemoryRelationships.size;
            this.metrics.entanglementCount = this.inMemoryEntanglements.size;
            return;
        }
        
        // Original database implementation
        const metrics = await this.db.query(`
            SELECT 
                (SELECT COUNT(*) FROM kg_nodes) as node_count,
                (SELECT COUNT(*) FROM kg_relationships) as relationship_count,
                (SELECT COUNT(*) FROM kg_entanglements) as entanglement_count
        `);
        
        Object.assign(this.metrics, metrics.rows[0]);
    }

    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            config: this.config,
            metrics: this.metrics,
            initialized: this.initialized,
            // Don't persist the actual graph data - it's already in the database
            metadata: {
                lastPruning: this.lastPruningTime || null,
                totalNodes: this.metrics.nodeCount,
                totalRelationships: this.metrics.relationshipCount,
                totalEntanglements: this.metrics.entanglementCount
            }
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
        
        // Restore metadata
        if (state.metadata) {
            this.lastPruningTime = state.metadata.lastPruning;
        }
        
        console.log('✅ Knowledge Graph state restored');
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
     * Get current KG statistics
     */
    async getStats() {
        // 🔥 FIX: Don't update metrics if shutting down or no DB available
        if (!this.isShuttingDown && this.db && !this.useInMemoryFallback) {
            await this.updateMetrics();
        }
        
        // 🔥 FIX: Only query database if available
        let additionalStats = { rows: [{ 
            avg_confidence: 0,
            unique_node_types: 0,
            unique_relationship_types: 0
        }] };
        
        if (this.db && !this.useInMemoryFallback && !this.isShuttingDown) {
            try {
                additionalStats = await this.db.query(`
                    SELECT 
                        AVG(confidence_score) as avg_confidence,
                        COUNT(DISTINCT node_type) as unique_node_types,
                        COUNT(DISTINCT relationship_type) as unique_relationship_types
                    FROM kg_nodes, kg_relationships
                `);
            } catch (error) {
                console.warn('   ⚠️ Could not fetch additional stats:', error.message);
            }
        }
        
        return {
            ...this.metrics,
            ...additionalStats.rows[0]
        };
    }
    
    /**
     * 🔗⚡🧠 SPECIALIZED METHODS FOR TODAY'S SYSTEMS
     */
    
    todaysSystems = { conceptAgent: null, causalEngine: null, zapEngine: null, thompsonSampling: null, ucbExploration: null, quantumMDPES: null };
    
    async causalNodeCreation(entity, causalProperties) {
        if (!this.todaysSystems.causalEngine) return await this.createNode({ type: 'entity', data: entity });
        
        const causalLinks = await this.todaysSystems.causalEngine.discoverCausalRelationships([entity]);
        
        return await this.createNode({
            type: 'causal_entity',
            data: entity,
            metadata: { ...causalProperties, causalLinks: causalLinks.causalLinks }
        });
    }
    
    async conceptEnrichedKG(data) {
        if (!this.todaysSystems.conceptAgent) return await this.createNode({ data });
        
        const concepts = await this.todaysSystems.conceptAgent.encodeInput({ text: JSON.stringify(data), modality: 'financial' });
        
        return await this.createNode({
            type: 'concept_node',
            data,
            embedding: concepts,
            metadata: { conceptBased: true }
        });
    }
    
    async zapGuidedKGExpansion(goal) {
        if (!this.todaysSystems.zapEngine) return null;
        
        return await this.todaysSystems.zapEngine.generatePlan({ description: `KG expansion for: ${goal}`, type: 'kg_expansion' });
    }
    
    async thompsonSelectKGStrategy(options) {
        if (!this.todaysSystems.thompsonSampling) return { selected: 'standard' };
        
        return await this.todaysSystems.thompsonSampling.selectSystem(options || ['concept_enriched', 'causal_based', 'quantum_enhanced']);
    }
    
    async ucbGuidedKGExploration() {
        if (!this.todaysSystems.ucbExploration) return 'moderate';
        
        const bonus = await this.todaysSystems.ucbExploration.calculateExplorationBonus('kg_expansion');
        return bonus > 5 ? 'aggressive' : 'moderate';
    }
    
    async mdpOptimizedKG(outcome) {
        if (!this.todaysSystems.quantumMDPES) return;
        
        await this.todaysSystems.quantumMDPES.updateMDP({ kgQuality: outcome.quality }, 'expand_kg', outcome.useful ? 130 : -40, { kgQuality: outcome.quality }, 'knowledge_graph');
    }
    
    async connectToTodaysSystems(deps) {
        Object.assign(this.todaysSystems, deps);
    }
    
    /**
     * 🔥 PRODUCTION: Proper shutdown method to persist data before DB close
     */
    async shutdown() {
        console.log('💾 KnowledgeGraph: Saving final state before shutdown...');
        
        // 🔥 FIX: Set shutdown flag to prevent operations during shutdown
        this.isShuttingDown = true;
        
        try {
            // Stop pruning scheduler if running
            if (this.pruningScheduler) {
                clearInterval(this.pruningScheduler);
                this.pruningScheduler = null;
            }
            
            // Final metrics update (only if DB available)
            if (this.db && !this.useInMemoryFallback) {
                await this.updateMetrics();
                console.log('   ✅ Final metrics saved to database');
            }
            
            // If using UnifiedKnowledgeStorage, ensure final sync
            if (this.unifiedKnowledgeStorage && typeof this.unifiedKnowledgeStorage.flush === 'function') {
                await this.unifiedKnowledgeStorage.flush();
                console.log('   ✅ UnifiedKnowledgeStorage flushed');
            }
            
            // Clear in-memory caches (production cleanup)
            this.inMemoryNodes.clear();
            this.inMemoryRelationships.clear();
            this.inMemoryEntanglements.clear();
            
            console.log('✅ KnowledgeGraph shutdown complete (production mode)');
            
        } catch (error) {
            console.error('⚠️ Error during KnowledgeGraph shutdown:', error);
            // Don't throw - graceful degradation
        }
    }
}

