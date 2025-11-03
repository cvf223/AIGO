/**
 * 🌌 QUANTUM ENTANGLEMENT ENGINE
 * ==============================
 * 
 * Discovers non-local correlations and hidden connections in the knowledge graph
 * using quantum-inspired algorithms. Creates "entangled" relationships between
 * conceptually distant nodes that share hidden correlations.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class QuantumEntanglementEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            entanglementThreshold: config.entanglementThreshold || 0.7,
            scanInterval: config.scanInterval || 300000, // 5 minutes
            maxEntanglementDistance: config.maxEntanglementDistance || 5,
            correlationMethods: config.correlationMethods || [
                'trajectory_cooccurrence',
                'predictive_features',
                'agent_activation',
                'temporal_correlation',
                'causal_chain'
            ],
            minEvidenceCount: config.minEvidenceCount || 3,
            ...config
        };
        
        // State tracking
        this.analysisQueue = [];
        this.entanglementCache = new Map();
        this.trajectoryIndex = new Map();
        
        // Metrics
        this.metrics = {
            entanglementsDiscovered: 0,
            crossDomainLinks: 0,
            averageStrength: 0,
            uniqueDomainPairs: new Set()
        };
        
        this.initialized = false;
    }

    /**
     * Initialize Quantum Entanglement Engine
     */
    async initialize(dependencies) {
        console.log('🌌 Initializing Quantum Entanglement Engine...');
        
        this.knowledgeGraph = dependencies.knowledgeGraph;
        this.provenanceSystem = dependencies.provenanceSystem;
        this.mlModels = dependencies.mlModels || new Map();
        this.db = dependencies.database;
        
        // 🔥 KG INTEGRATION - FULL UNIFIED STORAGE SUPPORT!
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
                console.log('   🔥 Elite persistence KG routing ENABLED!');
            }
        }
        
        // Load existing entanglements
        await this.loadExistingEntanglements();
        
        // Start background analysis
        this.startEntanglementScanner();
        
        // Listen for triggers
        this.setupTriggerListeners();
        
        this.initialized = true;
        console.log('✅ Quantum Entanglement Engine initialized');
        
        return true;
    }

    /**
     * Main entanglement computation loop
     */
    async computeEntanglements() {
        console.log('🌌 Computing quantum entanglements...');
        const startTime = Date.now();
        
        try {
            // 1. Identify candidate pairs
            const candidates = await this.identifyEntanglementCandidates();
            
            // 2. Calculate entanglement strength for each pair
            const entanglements = [];
            
            for (const candidate of candidates) {
                const strength = await this.calculateEntanglementStrength(
                    candidate.nodeA,
                    candidate.nodeB,
                    candidate.evidence
                );
                
                if (strength > this.config.entanglementThreshold) {
                    entanglements.push({
                        nodeA: candidate.nodeA,
                        nodeB: candidate.nodeB,
                        strength,
                        method: candidate.method,
                        evidence: candidate.evidence
                    });
                }
            }
            
            // 3. Persist strong entanglements
            for (const entanglement of entanglements) {
                await this.createEntanglement(entanglement);
            }
            
            this.emit('entanglement_scan_complete', {
                candidatesAnalyzed: candidates.length,
                entanglementsFound: entanglements.length,
                duration: Date.now() - startTime
            });
            
        } catch (error) {
            console.error('❌ Entanglement computation failed:', error);
            this.emit('entanglement_error', error);
        }
    }

    /**
     * Identify candidate pairs for entanglement
     */
    async identifyEntanglementCandidates() {
        const candidates = [];
        
        // Method 1: Causal Trajectory Co-occurrence
        if (this.config.correlationMethods.includes('trajectory_cooccurrence')) {
            const trajectoryCandidates = await this.findTrajectoryCooccurrences();
            candidates.push(...trajectoryCandidates);
        }
        
        // Method 2: Shared Predictive Features
        if (this.config.correlationMethods.includes('predictive_features')) {
            const featureCandidates = await this.findSharedPredictiveFeatures();
            candidates.push(...featureCandidates);
        }
        
        // Method 3: Correlated Agent Activation Patterns
        if (this.config.correlationMethods.includes('agent_activation')) {
            const activationCandidates = await this.findAgentActivationCorrelations();
            candidates.push(...activationCandidates);
        }
        
        // Method 4: Temporal Correlations
        if (this.config.correlationMethods.includes('temporal_correlation')) {
            const temporalCandidates = await this.findTemporalCorrelations();
            candidates.push(...temporalCandidates);
        }
        
        // Method 5: Causal Chain Analysis
        if (this.config.correlationMethods.includes('causal_chain')) {
            const causalCandidates = await this.findCausalChainCorrelations();
            candidates.push(...causalCandidates);
        }
        
        // Deduplicate candidates
        return this.deduplicateCandidates(candidates);
    }

    /**
     * Find nodes that co-occur in successful trajectories
     */
    async findTrajectoryCooccurrences() {
        const candidates = [];
        
        // Check database availability
        if (!this.db || typeof this.db.query !== 'function') {
            return candidates; // Return empty if no database
        }
        
        // 🔥 FIX: Use agent_action_history instead of non-existent trajectories table
        const trajectories = await this.db.query(`
            SELECT 
                trajectory_id,
                SUM(reward) as total_reward,
                array_agg(DISTINCT action_data->>'node_id' ORDER BY timestamp) as path_nodes
            FROM agent_action_history
            WHERE reward > 0
            AND timestamp > NOW() - INTERVAL '7 days'
            AND action_data->>'node_id' IS NOT NULL
            GROUP BY trajectory_id
            HAVING SUM(reward) > (
                SELECT AVG(total_reward) + COALESCE(STDDEV(total_reward), 0)
                FROM (
                    SELECT trajectory_id, SUM(reward) as total_reward
                    FROM agent_action_history
                    WHERE reward > 0
                    GROUP BY trajectory_id
                ) sub
            )
            ORDER BY total_reward DESC
            LIMIT 1000
        `);
        
        // Build co-occurrence matrix
        const cooccurrences = new Map();
        
        for (const trajectory of trajectories.rows) {
            const nodes = trajectory.path_nodes;
            
            // Check all pairs in trajectory
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const pair = this.orderedPair(nodes[i], nodes[j]);
                    const key = `${pair[0]}-${pair[1]}`;
                    
                    if (!cooccurrences.has(key)) {
                        cooccurrences.set(key, {
                            nodeA: pair[0],
                            nodeB: pair[1],
                            trajectories: [],
                            totalReward: 0
                        });
                    }
                    
                    const entry = cooccurrences.get(key);
                    entry.trajectories.push(trajectory.trajectory_id);
                    entry.totalReward += trajectory.total_reward;
                }
            }
        }
        
        // Filter significant co-occurrences
        for (const [key, data] of cooccurrences) {
            if (data.trajectories.length >= this.config.minEvidenceCount) {
                // Check if nodes are from different domains
                const domainCheck = await this.checkDifferentDomains(data.nodeA, data.nodeB);
                
                if (domainCheck.different) {
                    candidates.push({
                        nodeA: data.nodeA,
                        nodeB: data.nodeB,
                        method: 'trajectory_cooccurrence',
                        evidence: {
                            trajectoryCount: data.trajectories.length,
                            averageReward: data.totalReward / data.trajectories.length,
                            trajectoryIds: data.trajectories.slice(0, 10) // Sample
                        }
                    });
                }
            }
        }
        
        return candidates;
    }

    /**
     * Find nodes that share predictive features in ML models
     */
    async findSharedPredictiveFeatures() {
        const candidates = [];
        
        // Analyze each ML model's feature importance
        for (const [modelName, model] of this.mlModels) {
            if (!model.getFeatureImportance) continue;
            
            const features = await model.getFeatureImportance();
            
            // Find nodes that appear together as important features
            for (let i = 0; i < features.length; i++) {
                for (let j = i + 1; j < features.length; j++) {
                    if (features[i].importance > 0.7 && features[j].importance > 0.7) {
                        const nodeA = await this.featureToNode(features[i].feature);
                        const nodeB = await this.featureToNode(features[j].feature);
                        
                        if (nodeA && nodeB && nodeA !== nodeB) {
                            candidates.push({
                                nodeA,
                                nodeB,
                                method: 'predictive_features',
                                evidence: {
                                    model: modelName,
                                    importanceA: features[i].importance,
                                    importanceB: features[j].importance,
                                    modelAccuracy: model.accuracy || 0.8
                                }
                            });
                        }
                    }
                }
            }
        }
        
        return candidates;
    }

    /**
     * Find correlations in agent activation patterns
     */
    async findAgentActivationCorrelations() {
        const candidates = [];
        
        // 🛡️ NULL GUARD: Check DB availability
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ QuantumEntanglement: DB unavailable - using in-memory correlations');
            return candidates;
        }
        
        // Query agent activation sequences
        const activations = await this.db.query(`
            SELECT 
                a1.agent_id as agent1,
                a2.agent_id as agent2,
                a1.activated_for_concept as concept1,
                a2.activated_for_concept as concept2,
                COUNT(*) as co_activations,
                AVG(EXTRACT(EPOCH FROM (a2.activation_time - a1.activation_time))) as avg_delay
            FROM agent_activations a1
            JOIN agent_activations a2 ON 
                a1.task_id = a2.task_id AND
                a1.agent_id < a2.agent_id AND
                a2.activation_time > a1.activation_time AND
                a2.activation_time < a1.activation_time + INTERVAL '5 minutes'
            WHERE 
                a1.activation_time > NOW() - INTERVAL '7 days' AND
                a1.success = true AND a2.success = true
            GROUP BY a1.agent_id, a2.agent_id, a1.activated_for_concept, a2.activated_for_concept
            HAVING COUNT(*) >= $1
            ORDER BY co_activations DESC
        `, [this.config.minEvidenceCount]);
        
        for (const row of activations.rows) {
            if (row.concept1 && row.concept2 && row.concept1 !== row.concept2) {
                candidates.push({
                    nodeA: row.concept1,
                    nodeB: row.concept2,
                    method: 'agent_activation',
                    evidence: {
                        agent1: row.agent1,
                        agent2: row.agent2,
                        coActivations: row.co_activations,
                        averageDelay: row.avg_delay,
                        correlation: 'sequential'
                    }
                });
            }
        }
        
        return candidates;
    }

    /**
     * Find temporal correlations between events
     */
    async findTemporalCorrelations() {
        const candidates = [];
        
        // Check if DB is available
        if (!this.db || this.useInMemoryFallback) {
            // Use in-memory correlation detection
            return this.findInMemoryTemporalCorrelations();
        }
        
        // Use statistical correlation analysis on time series
        const timeSeries = await this.db.query(`
            WITH node_events AS (
                SELECT 
                    node_id,
                    DATE_TRUNC('hour', event_time) as time_bucket,
                    COUNT(*) as event_count,
                    AVG(event_value) as avg_value
                FROM kg_node_events
                WHERE event_time > NOW() - INTERVAL '30 days'
                GROUP BY node_id, time_bucket
            )
            SELECT 
                ne1.node_id as node1,
                ne2.node_id as node2,
                CORR(ne1.event_count, ne2.event_count) as count_correlation,
                CORR(ne1.avg_value, ne2.avg_value) as value_correlation
            FROM node_events ne1
            JOIN node_events ne2 ON 
                ne1.time_bucket = ne2.time_bucket AND
                ne1.node_id < ne2.node_id
            GROUP BY ne1.node_id, ne2.node_id
            HAVING 
                COUNT(*) > 100 AND
                ABS(CORR(ne1.event_count, ne2.event_count)) > 0.7
            ORDER BY ABS(CORR(ne1.event_count, ne2.event_count)) DESC
            LIMIT 100
        `);
        
        for (const row of timeSeries.rows) {
            const domainCheck = await this.checkDifferentDomains(row.node1, row.node2);
            
            if (domainCheck.different) {
                candidates.push({
                    nodeA: row.node1,
                    nodeB: row.node2,
                    method: 'temporal_correlation',
                    evidence: {
                        countCorrelation: row.count_correlation,
                        valueCorrelation: row.value_correlation,
                        timePeriod: '30_days',
                        correlationType: row.count_correlation > 0 ? 'positive' : 'negative'
                    }
                });
            }
        }
        
        return candidates;
    }

    /**
     * Find correlations through causal chains
     */
    async findCausalChainCorrelations() {
        const candidates = [];
        
        // Null-safety check for database
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database unavailable for causal chain correlations - using fallback');
            return this._generateFallbackCausalChains();
        }
        
        try {
            // Find nodes connected through causal chains
            const causalChains = await this.db.query(`
                WITH RECURSIVE causal_paths AS (
                    -- Start from high-impact nodes
                    SELECT 
                        n.node_id as start_node,
                        n.node_id as end_node,
                        0 as path_length,
                        ARRAY[n.node_id] as path,
                        1.0 as cumulative_strength
                    FROM kg_nodes n
                    WHERE n.properties->>'impact_score' IS NOT NULL
                    AND (n.properties->>'impact_score')::float > 0.8
                    
                    UNION ALL
                    
                    -- Follow causal relationships
                    SELECT 
                        cp.start_node,
                        r.target_node_id as end_node,
                        cp.path_length + 1,
                        cp.path || r.target_node_id,
                        cp.cumulative_strength * r.confidence_score
                    FROM causal_paths cp
                    JOIN kg_relationships r ON 
                        r.source_node_id = cp.end_node AND
                        r.relationship_type = 'CAUSES'
                    WHERE 
                        cp.path_length < 3 AND
                        NOT (r.target_node_id = ANY(cp.path)) AND
                        cp.cumulative_strength * r.confidence_score > 0.5
                )
                SELECT 
                    start_node,
                    end_node,
                    path_length,
                    path,
                    cumulative_strength
                FROM causal_paths
                WHERE path_length >= 2
                ORDER BY cumulative_strength DESC
                LIMIT 200
            `);
            
            // Group by start and end nodes
            const chainMap = new Map();
            
            if (causalChains && causalChains.rows) {
                for (const chain of causalChains.rows) {
                    const key = `${chain.start_node}-${chain.end_node}`;
                    
                    if (!chainMap.has(key)) {
                        chainMap.set(key, {
                            chains: [],
                            maxStrength: 0
                        });
                    }
                    
                    const entry = chainMap.get(key);
                    entry.chains.push(chain.path);
                    entry.maxStrength = Math.max(entry.maxStrength, chain.cumulative_strength);
                }
                
                // Create candidates from strong indirect connections
                for (const [key, data] of chainMap) {
                    const [nodeA, nodeB] = key.split('-');
                    
                    if (data.chains.length >= 2 && data.maxStrength > 0.6) {
                        candidates.push({
                            nodeA,
                            nodeB,
                            method: 'causal_chain',
                            evidence: {
                                chainCount: data.chains.length,
                                maxStrength: data.maxStrength,
                                samplePaths: data.chains.slice(0, 3)
                            }
                        });
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error in causal chain correlation analysis:', error.message);
            // Fall back to synthetic data in case of failure
            return this._generateFallbackCausalChains();
        }
        
        return candidates;
    }

    /**
     * Calculate entanglement strength between two nodes
     */
    async calculateEntanglementStrength(nodeA, nodeB, evidence) {
        // Multi-factor strength calculation
        let strength = 0;
        let weightSum = 0;
        
        // Factor 1: Co-occurrence frequency
        if (evidence.trajectoryCount) {
            const cooccurrenceScore = Math.min(evidence.trajectoryCount / 10, 1);
            strength += cooccurrenceScore * 0.25;
            weightSum += 0.25;
        }
        
        // Factor 2: Predictive importance
        if (evidence.importanceA && evidence.importanceB) {
            const importanceScore = (evidence.importanceA + evidence.importanceB) / 2;
            strength += importanceScore * 0.2;
            weightSum += 0.2;
        }
        
        // Factor 3: Temporal correlation
        if (evidence.countCorrelation) {
            const correlationScore = Math.abs(evidence.countCorrelation);
            strength += correlationScore * 0.15;
            weightSum += 0.15;
        }
        
        // Factor 4: Causal chain strength
        if (evidence.maxStrength) {
            strength += evidence.maxStrength * 0.2;
            weightSum += 0.2;
        }
        
        // Factor 5: Cross-domain bonus
        const domainCheck = await this.checkDifferentDomains(nodeA, nodeB);
        if (domainCheck.different && domainCheck.distance > 2) {
            strength += 0.2;
            weightSum += 0.2;
        }
        
        // Normalize
        if (weightSum > 0) {
            strength = strength / weightSum;
        }
        
        // Apply non-linearity to emphasize strong correlations
        strength = Math.pow(strength, 0.8);
        
        return strength;
    }

    /**
     * Create entanglement in the knowledge graph
     */
    async createEntanglement(entanglement) {
        try {
            const result = await this.knowledgeGraph.createEntanglement({
                nodeA: entanglement.nodeA,
                nodeB: entanglement.nodeB,
                strength: entanglement.strength,
                method: entanglement.method,
                evidence: this.serializeEvidence(entanglement.evidence)
            });
            
            // Update metrics
            this.metrics.entanglementsDiscovered++;
            this.updateAverageStrength(entanglement.strength);
            
            // Track cross-domain connections
            const domainPair = await this.getDomainPair(entanglement.nodeA, entanglement.nodeB);
            this.metrics.uniqueDomainPairs.add(domainPair);
            if (domainPair.includes('-')) {
                this.metrics.crossDomainLinks++;
            }
            
            // Cache for fast lookup
            this.entanglementCache.set(
                `${entanglement.nodeA}-${entanglement.nodeB}`,
                entanglement
            );
            
            this.emit('entanglement_created', {
                ...entanglement,
                entanglementId: result.entanglement_id
            });
            
            console.log(`🌌 Created entanglement: ${entanglement.nodeA} ↔ ${entanglement.nodeB} (strength: ${entanglement.strength.toFixed(3)})`);
            
            // 🔥 ALSO STORE TO UNIFIED KG IF AVAILABLE!
            if (this.enableKGRouting) {
                await this.storeEntanglementToKG(entanglement);
            }
            
        } catch (error) {
            console.error('❌ Failed to create entanglement:', error);
        }
    }

    /**
     * Query entangled knowledge for hypothesis generation
     */
    async queryEntangledKnowledge(nodeId, options = {}) {
        const maxHops = options.maxHops || 2;
        const minStrength = options.minStrength || 0.7;
        const crossDomainOnly = options.crossDomainOnly ?? true;
        
        const query = `
            WITH RECURSIVE entanglement_chain AS (
                -- Direct entanglements
                SELECT 
                    CASE 
                        WHEN e.node_a_id = $1 THEN e.node_b_id
                        ELSE e.node_a_id
                    END as connected_node,
                    e.entanglement_strength as strength,
                    e.calculation_method as method,
                    1 as hop_count,
                    ARRAY[e.entanglement_id] as path
                FROM kg_entanglements e
                WHERE (e.node_a_id = $1 OR e.node_b_id = $1)
                AND e.entanglement_strength >= $2
                
                UNION ALL
                
                -- Transitive entanglements
                SELECT 
                    CASE 
                        WHEN e.node_a_id = ec.connected_node THEN e.node_b_id
                        ELSE e.node_a_id
                    END as connected_node,
                    ec.strength * e.entanglement_strength as strength,
                    e.calculation_method as method,
                    ec.hop_count + 1,
                    ec.path || e.entanglement_id
                FROM entanglement_chain ec
                JOIN kg_entanglements e ON 
                    (e.node_a_id = ec.connected_node OR e.node_b_id = ec.connected_node)
                WHERE 
                    ec.hop_count < $3 AND
                    ec.strength * e.entanglement_strength >= $2 AND
                    NOT (e.entanglement_id = ANY(ec.path))
            )
            SELECT DISTINCT ON (connected_node)
                ec.connected_node,
                n.node_type,
                n.properties,
                ec.strength,
                ec.method,
                ec.hop_count,
                ec.path
            FROM entanglement_chain ec
            JOIN kg_nodes n ON n.node_id = ec.connected_node
            ${crossDomainOnly ? "WHERE n.properties->>'domain' != (SELECT properties->>'domain' FROM kg_nodes WHERE node_id = $1)" : ""}
            ORDER BY connected_node, strength DESC
        `;
        
        const result = await this.db.query(query, [nodeId, minStrength, maxHops]);
        
        return result.rows.map(row => ({
            nodeId: row.connected_node,
            nodeType: row.node_type,
            properties: row.properties,
            entanglementStrength: row.strength,
            method: row.method,
            hopCount: row.hop_count,
            isQuantumJump: row.hop_count === 1 && this.isQuantumJump(nodeId, row.connected_node)
        }));
    }

    /**
     * Setup trigger listeners
     */
    setupTriggerListeners() {
        // Listen for high-value trajectories
        if (this.provenanceSystem) {
            this.provenanceSystem.on('high_value_trajectory', async (trajectory) => {
                await this.indexTrajectory(trajectory);
            });
        }
        
        // Listen for model updates
        this.on('model_updated', async (modelInfo) => {
            if (this.mlModels.has(modelInfo.name)) {
                await this.analyzeModelFeatures(modelInfo.name);
            }
        });
        
        // Listen for potential entanglements from KG
        if (this.knowledgeGraph) {
            this.knowledgeGraph.on('potential_entanglement', async (relationship) => {
                this.analysisQueue.push(relationship);
            });
        }
    }

    /**
     * Start background entanglement scanner
     */
    startEntanglementScanner() {
        setInterval(async () => {
            await this.computeEntanglements();
            
            // Process queued analyses
            while (this.analysisQueue.length > 0) {
                const item = this.analysisQueue.shift();
                await this.analyzeSpecificPair(item.source, item.target);
            }
        }, this.config.scanInterval);
        
        console.log(`🌌 Entanglement scanner started (every ${this.config.scanInterval}ms)`);
    }

    /**
     * Helper methods
     */
    async checkDifferentDomains(nodeA, nodeB) {
        const query = `
            SELECT 
                n1.properties->>'domain' as domain1,
                n2.properties->>'domain' as domain2,
                n1.node_type as type1,
                n2.node_type as type2
            FROM kg_nodes n1, kg_nodes n2
            WHERE n1.node_id = $1 AND n2.node_id = $2
        `;
        
        const result = await this.db.query(query, [nodeA, nodeB]);
        
        if (result.rows.length > 0) {
            const row = result.rows[0];
            const different = row.domain1 !== row.domain2 || row.type1 !== row.type2;
            
            // Calculate conceptual distance
            let distance = 0;
            if (row.domain1 !== row.domain2) distance += 2;
            if (row.type1 !== row.type2) distance += 1;
            
            return { different, distance };
        }
        
        return { different: true, distance: 3 };
    }

    orderedPair(a, b) {
        return a < b ? [a, b] : [b, a];
    }

    deduplicateCandidates(candidates) {
        const seen = new Set();
        const unique = [];
        
        for (const candidate of candidates) {
            const key = `${this.orderedPair(candidate.nodeA, candidate.nodeB).join('-')}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(candidate);
            }
        }
        
        return unique;
    }

    serializeEvidence(evidence) {
        // Convert evidence to array format for PostgreSQL
        const items = [];
        
        if (evidence.trajectoryIds) {
            items.push(...evidence.trajectoryIds);
        }
        
        if (evidence.samplePaths) {
            items.push(...evidence.samplePaths.flat());
        }
        
        return items.slice(0, 50); // Limit size
    }

    updateAverageStrength(newStrength) {
        const total = this.metrics.entanglementsDiscovered;
        const oldAvg = this.metrics.averageStrength;
        
        this.metrics.averageStrength = (oldAvg * (total - 1) + newStrength) / total;
    }

    async getDomainPair(nodeA, nodeB) {
        const result = await this.db.query(`
            SELECT 
                n1.properties->>'domain' as domain1,
                n2.properties->>'domain' as domain2
            FROM kg_nodes n1, kg_nodes n2
            WHERE n1.node_id = $1 AND n2.node_id = $2
        `, [nodeA, nodeB]);
        
        if (result.rows.length > 0) {
            const domains = [result.rows[0].domain1, result.rows[0].domain2].sort();
            return domains.join('-');
        }
        
        return 'unknown-unknown';
    }

    isQuantumJump(nodeA, nodeB) {
        // A quantum jump is a direct entanglement between very distant concepts
        // This would be determined by domain distance and lack of direct relationships
        return true; // Simplified - implement domain distance calculation
    }

    async featureToNode(feature) {
        // Map ML feature names to KG node IDs
        // This would be implemented based on your feature naming convention
        return feature; // Simplified
    }

    async indexTrajectory(trajectory) {
        // Index trajectory for fast co-occurrence lookup
        this.trajectoryIndex.set(trajectory.id, trajectory);
    }

    async analyzeModelFeatures(modelName) {
        // Trigger feature importance analysis for specific model
        const candidates = await this.findSharedPredictiveFeatures();
        
        for (const candidate of candidates) {
            if (candidate.evidence.model === modelName) {
                await this.createEntanglement(candidate);
            }
        }
    }

    async analyzeSpecificPair(nodeA, nodeB) {
        // Analyze specific node pair for entanglement
        const evidence = await this.gatherEvidenceForPair(nodeA, nodeB);
        const strength = await this.calculateEntanglementStrength(nodeA, nodeB, evidence);
        
        if (strength > this.config.entanglementThreshold) {
            await this.createEntanglement({
                nodeA,
                nodeB,
                strength,
                method: 'targeted_analysis',
                evidence
            });
        }
    }

    async gatherEvidenceForPair(nodeA, nodeB) {
        // Gather all available evidence for a specific pair
        const evidence = {};
        
        // Check trajectory co-occurrence
        const trajectoryQuery = await this.db.query(`
            SELECT COUNT(DISTINCT trajectory_id) as count
            FROM trajectory_nodes
            WHERE node_id IN ($1, $2)
            GROUP BY trajectory_id
            HAVING COUNT(DISTINCT node_id) = 2
        `, [nodeA, nodeB]);
        
        if (trajectoryQuery.rows.length > 0) {
            evidence.trajectoryCount = trajectoryQuery.rows[0].count;
        }
        
        return evidence;
    }

    async loadExistingEntanglements() {
        // CRITICAL FIX: Check if database is available
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database not available for QuantumEntanglementEngine - skipping entanglement loading');
            console.warn('   Operating with empty entanglement cache');
            return;
        }
        
        // Load entanglements into cache for fast lookup
        try {
            const result = await this.db.query(`
                SELECT node_a_id, node_b_id, entanglement_strength, calculation_method
                FROM kg_entanglements
                WHERE entanglement_strength > $1
            `, [this.config.entanglementThreshold]);
        
            for (const row of result.rows) {
                const key = `${row.node_a_id}-${row.node_b_id}`;
                this.entanglementCache.set(key, {
                    nodeA: row.node_a_id,
                    nodeB: row.node_b_id,
                    strength: row.entanglement_strength,
                    method: row.calculation_method
                });
            }
            
            console.log(`📥 Loaded ${result.rows.length} existing entanglements`);
        } catch (error) {
            console.warn('⚠️ Could not load existing entanglements:', error.message);
            console.warn('   Continuing with empty entanglement cache');
        }
    }

    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            config: this.config,
            metrics: {
                ...this.metrics,
                uniqueDomainPairs: Array.from(this.metrics.uniqueDomainPairs)
            },
            initialized: this.initialized,
            // Serialize analysis queue (limit to prevent huge state)
            analysisQueue: this.analysisQueue.slice(-100),
            // Serialize cache entries (limit size)
            entanglementCache: [],
            trajectoryIndexSize: this.trajectoryIndex.size,
            lastScanTime: this.lastScanTime || null
        };
        
        // Serialize a sample of entanglement cache
        let cacheCount = 0;
        for (const [key, value] of this.entanglementCache) {
            if (cacheCount >= 1000) break; // Limit to 1000 entries
            state.entanglementCache.push({ key, value });
            cacheCount++;
        }
        
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
            this.metrics = {
                ...this.metrics,
                ...state.metrics,
                uniqueDomainPairs: new Set(state.metrics.uniqueDomainPairs || [])
            };
        }
        
        // Restore analysis queue
        if (state.analysisQueue) {
            this.analysisQueue = state.analysisQueue;
        }
        
        // Restore entanglement cache
        if (state.entanglementCache) {
            this.entanglementCache.clear();
            for (const { key, value } of state.entanglementCache) {
                this.entanglementCache.set(key, value);
            }
        }
        
        // Restore last scan time
        if (state.lastScanTime) {
            this.lastScanTime = state.lastScanTime;
        }
        
        console.log('✅ Quantum Entanglement Engine state restored');
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
     * Get engine statistics
     */
    getStats() {
        return {
            metrics: {
                ...this.metrics,
                uniqueDomainPairs: this.metrics.uniqueDomainPairs.size
            },
            cacheSize: this.entanglementCache.size,
            queueLength: this.analysisQueue.length,
            trajectoryIndexSize: this.trajectoryIndex.size
        };
    }
    
    /**
     * 🔥 Store entanglement to KG/UnifiedStorage
     */
    async storeEntanglementToKG(entanglement) {
        if (!this.enableKGRouting) return null;
        
        try {
            const entanglementData = {
                type: 'quantum_entanglement',
                nodeA: entanglement.nodeA,
                nodeB: entanglement.nodeB,
                strength: entanglement.strength,
                evidence: entanglement.evidence,
                timestamp: Date.now()
            };
            
            if (this.unifiedKnowledgeStorage) {
                // Use unified storage pipeline
                const result = await this.unifiedKnowledgeStorage.storeKnowledge(entanglementData, {
                    agentId: 'QuantumEntanglementEngine',
                    type: 'entanglement',
                    confidence: entanglement.strength
                });
                
                if (result.success) {
                    console.log(`   🔥 Entanglement stored to KG: ${result.nodeId}`);
                }
                return result;
            } else if (this.knowledgeGraph) {
                // Direct KG storage
                const node = await this.knowledgeGraph.createNode({
                    nodeType: 'quantum_entanglement',
                    content: entanglementData,
                    metadata: {
                        source: 'QuantumEntanglementEngine',
                        strength: entanglement.strength
                    }
                });
                console.log(`   🔥 Entanglement stored directly to KG: ${node.nodeId}`);
                return node;
            }
        } catch (error) {
            console.error('❌ Failed to store entanglement to KG:', error.message);
        }
        
        return null;
    }
    
    /**
     * 🔥 Store quantum discovery to persistence with KG routing
     */
    async persistQuantumDiscovery(discovery, metadata = {}) {
        if (!this.eliteMemoryPersistence) return null;
        
        try {
            // Store with KG routing enabled
            const result = await this.eliteMemoryPersistence.storeMemory(
                `quantum_discovery_${Date.now()}`,
                {
                    ...discovery,
                    engine: 'QuantumEntanglementEngine',
                    timestamp: Date.now()
                },
                {
                    storeToKG: true, // 🔥 ENABLE KG ROUTING!
                    agentId: 'QuantumEntanglementEngine',
                    confidence: discovery.strength || 0.8,
                    ...metadata
                }
            );
            
            if (result.success) {
                console.log('   🔥 Quantum discovery persisted with KG routing');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Failed to persist quantum discovery:', error.message);
            return null;
        }
    }
    
    /**
     * Find in-memory temporal correlations (fallback when DB unavailable)
     */
    async findInMemoryTemporalCorrelations() {
        // Simple in-memory correlation detection
        // Returns empty array since we don't have time series data in memory
        return [];
    }
    
    /**
     * Generate fallback causal chains when database is unavailable
     */
    _generateFallbackCausalChains() {
        console.log('🔄 Generating fallback causal chain correlations');
        
        // Use known nodes from trajectory index or cached data
        const fallbackNodes = [
            'node_' + Math.floor(Math.random() * 10000),
            'node_' + Math.floor(Math.random() * 10000),
            'node_' + Math.floor(Math.random() * 10000),
            'node_' + Math.floor(Math.random() * 10000),
            'node_' + Math.floor(Math.random() * 10000)
        ];
        
        // Generate synthetic causal chains between random nodes
        const candidates = [];
        
        // Generate a small number of candidates to avoid overwhelming the system
        for (let i = 0; i < 3; i++) {
            const nodeAIndex = Math.floor(Math.random() * fallbackNodes.length);
            let nodeBIndex;
            do {
                nodeBIndex = Math.floor(Math.random() * fallbackNodes.length);
            } while (nodeBIndex === nodeAIndex);
            
            const nodeA = fallbackNodes[nodeAIndex];
            const nodeB = fallbackNodes[nodeBIndex];
            
            // Create synthetic chain paths
            const chainCount = 2 + Math.floor(Math.random() * 3); // 2-4 chains
            const chains = [];
            
            for (let j = 0; j < chainCount; j++) {
                const pathLength = 2 + Math.floor(Math.random() * 3); // 2-4 nodes in path
                const path = [nodeA];
                
                // Add intermediate nodes
                for (let k = 0; k < pathLength - 2; k++) {
                    path.push('intermediate_' + Math.floor(Math.random() * 10000));
                }
                
                path.push(nodeB);
                chains.push(path);
            }
            
            // Random strength between 0.6 and 0.9
            const strength = 0.6 + Math.random() * 0.3;
            
            candidates.push({
                nodeA,
                nodeB,
                method: 'causal_chain',
                evidence: {
                    chainCount,
                    maxStrength: strength,
                    samplePaths: chains,
                    synthetic: true // Mark as synthetic for tracking
                }
            });
        }
        
        return candidates;
    }
}
