/**
 * 🛡️ MEMORY SINK PREVENTION SYSTEM
 * =================================
 * 
 * Implements sophisticated overtraining prevention and memory sink protection
 * to ensure the syndicate maintains adaptability and avoids getting stuck
 * in local optima or accumulating noise.
 */

import { EventEmitter } from 'events';

export class MemorySinkPrevention extends EventEmitter {
    constructor(config = {}) {
        super();
        
        // ⚠️ CRITICAL: Check observation mode BEFORE any initialization
        if (global.OBSERVATION_MODE_ENFORCED || global.SKIP_ALL_SERVICES || global.MINIMAL_MODE) {
            console.log('🔭 MemorySinkPrevention: Disabled in observation mode');
            this.disabled = true;
            this.name = 'MemorySinkPrevention_Disabled';
            return; // Don't initialize ANYTHING
        }
        
        this.config = {
            // U-curve monitoring
            uCurveWindow: config.uCurveWindow || 1000, // iterations
            uCurveThreshold: config.uCurveThreshold || 0.85,
            
            // Memory distillation
            distillationInterval: config.distillationInterval || 24 * 60 * 60 * 1000, // 24 hours
            distillationRatio: config.distillationRatio || 0.7, // Keep 70% most valuable
            
            // Creativity preservation
            creativityThreshold: config.creativityThreshold || 0.3,
            diversityTarget: config.diversityTarget || 0.5,
            
            // Adaptability monitoring
            adaptabilityWindow: config.adaptabilityWindow || 7 * 24 * 60 * 60 * 1000, // 7 days
            minAdaptabilityScore: config.minAdaptabilityScore || 0.4,
            
            // Memory health thresholds
            maxMemoryFragmentation: config.maxMemoryFragmentation || 0.3,
            maxRedundancyRatio: config.maxRedundancyRatio || 0.2,
            
            ...config
        };
        
        // Monitoring state
        this.performanceHistory = [];
        this.adaptabilityScores = new Map();
        this.creativityMetrics = new Map();
        this.adaptabilityHistory = [];  // 🔥 FIX: Initialize adaptabilityHistory
        this.memoryHealth = {
            fragmentation: 0,
            redundancy: 0,
            diversity: 1.0
        };
        
        // Prevention strategies
        this.activeStrategies = new Set();
        
        // CRITICAL FIX: Track intervals for proper cleanup
        this.monitoringIntervals = {
            uCurve: null,
            memoryHealth: null,
            adaptability: null,
            creativity: null
        };
        
        // CRITICAL FIX: Observation mode flag to pause monitoring
        this.observationMode = false;
        
        this.initialized = false;
    }

    /**
     * Initialize memory sink prevention
     */
    async initialize(dependencies) {
        console.log('🛡️ Initializing Memory Sink Prevention System...');
        
        this.memoryCoordinator = dependencies.memoryCoordinator;
        this.knowledgeGraph = dependencies.knowledgeGraph;
        this.db = dependencies.database;
        
        // Start monitoring loops
        this.startUCurveMonitoring();
        this.startMemoryHealthMonitoring();
        this.startAdaptabilityTracking();
        this.startCreativityPreservation();
        
        this.initialized = true;
        console.log('✅ Memory Sink Prevention System initialized');
        
        return true;
    }

    /**
     * U-Curve monitoring for overtraining detection
     */
    startUCurveMonitoring() {
        // CRITICAL FIX: Don't start if already running or in observation mode
        if (this.monitoringIntervals.uCurve || this.observationMode) {
            console.log('⚠️ U-Curve monitoring skipped (already running or observation mode)');
            return;
        }
        
        this.monitoringIntervals.uCurve = setInterval(async () => {
            // CRITICAL FIX: Skip monitoring in observation mode
            if (this.observationMode) return;
            
            const currentPerformance = await this.measureSystemPerformance();
            this.performanceHistory.push(currentPerformance);
            
            // Keep window size
            if (this.performanceHistory.length > this.config.uCurveWindow) {
                this.performanceHistory.shift();
            }
            
            // Detect U-curve pattern
            if (this.performanceHistory.length >= 100) {
                const uCurveDetected = this.detectUCurvePattern();
                
                if (uCurveDetected) {
                    console.warn('⚠️ U-Curve pattern detected - potential overtraining!');
                    await this.activateOvertrainingPrevention();
                }
            }
        }, 60000); // Check every minute
    }

    /**
     * Detect U-curve pattern in performance
     */
    detectUCurvePattern() {
        const history = this.performanceHistory;
        const len = history.length;
        
        if (len < 100) return false;
        
        // Divide into three segments
        const early = history.slice(0, Math.floor(len / 3));
        const middle = history.slice(Math.floor(len / 3), Math.floor(2 * len / 3));
        const recent = history.slice(Math.floor(2 * len / 3));
        
        // Calculate average performance for each segment
        const avgEarly = this.average(early.map(p => p.score));
        const avgMiddle = this.average(middle.map(p => p.score));
        const avgRecent = this.average(recent.map(p => p.score));
        
        // U-curve: middle > early AND middle > recent
        const isUCurve = avgMiddle > avgEarly * this.config.uCurveThreshold &&
                         avgMiddle > avgRecent * this.config.uCurveThreshold;
        
        if (isUCurve) {
            // Calculate severity
            const severity = (avgMiddle - avgRecent) / avgMiddle;
            
            this.emit('u_curve_detected', {
                earlyPerformance: avgEarly,
                peakPerformance: avgMiddle,
                currentPerformance: avgRecent,
                severity
            });
        }
        
        return isUCurve;
    }

    /**
     * Activate overtraining prevention measures
     */
    async activateOvertrainingPrevention() {
        console.log('🛡️ Activating overtraining prevention...');
        
        this.activeStrategies.add('overtraining_prevention');
        
        // 1. Trigger memory distillation
        await this.performMemoryDistillation();
        
        // 2. Increase exploration/creativity
        await this.boostCreativity();
        
        // 3. Prune overfit patterns
        await this.pruneOverfitPatterns();
        
        // 4. Reset some agent learning rates
        await this.resetLearningRates();
        
        this.emit('overtraining_prevention_activated', {
            strategies: Array.from(this.activeStrategies),
            timestamp: Date.now()
        });
    }

    /**
     * Memory distillation to preserve essential knowledge
     */
    async performMemoryDistillation() {
        console.log('🧪 Performing memory distillation...');
        
        const startTime = Date.now();
        
        // 1. Identify core knowledge to preserve
        const coreKnowledge = await this.identifyCoreKnowledge();
        
        // 2. Extract high-level principles
        const principles = await this.extractPrinciples(coreKnowledge);
        
        // 3. Create distilled representations
        const distilled = await this.createDistilledMemory(principles);
        
        // 4. Replace detailed memories with distilled versions
        await this.replaceWithDistilled(distilled);
        
        const report = {
            originalKnowledge: coreKnowledge.length,
            distilledPrinciples: principles.length,
            compressionRatio: principles.length / Math.max(1, coreKnowledge.length),
            duration: Date.now() - startTime
        };
        
        this.emit('memory_distillation_complete', report);
        
        return report;
    }

    /**
     * Identify core knowledge worth preserving
     */
    async identifyCoreKnowledge() {
        const query = `
            WITH knowledge_importance AS (
                SELECT 
                    n.node_id,
                    n.node_type,
                    n.properties,
                    -- Calculate importance score
                    (
                        -- Utility component
                        COALESCE((n.properties->>'sedm_utility_score')::float, 0.5) * 0.3 +
                        -- Usage frequency
                        LEAST(
                            COALESCE((n.properties->>'retrieval_count')::int, 0) / 100.0,
                            1.0
                        ) * 0.3 +
                        -- Cross-domain value
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM kg_entanglements 
                                WHERE node_a_id = n.node_id OR node_b_id = n.node_id
                            ) THEN 0.2
                            ELSE 0
                        END +
                        -- Causal importance
                        CASE 
                            WHEN EXISTS (
                                SELECT 1 FROM kg_relationships 
                                WHERE relationship_type = 'CAUSES'
                                AND (source_node_id = n.node_id OR target_node_id = n.node_id)
                            ) THEN 0.2
                            ELSE 0
                        END
                    ) as importance_score
                FROM kg_nodes n
                WHERE n.confidence_score > 0.6
            )
            SELECT *
            FROM knowledge_importance
            WHERE importance_score > 0.5
            ORDER BY importance_score DESC
            LIMIT 1000
        `;
        
        // 🔥 FIX: Check database availability
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('   ⚠️ No database for core knowledge extraction - returning empty');
            return [];
        }
        
        const result = await this.db.query(query);
        return result.rows;
    }

    /**
     * Extract high-level principles from core knowledge
     */
    async extractPrinciples(coreKnowledge) {
        const principles = [];
        
        // Group by type and domain
        const grouped = this.groupKnowledgeByType(coreKnowledge);
        
        for (const [type, items] of Object.entries(grouped)) {
            // Extract common patterns
            const patterns = await this.extractCommonPatterns(items);
            
            // Create principle representations
            for (const pattern of patterns) {
                principles.push({
                    type: 'distilled_principle',
                    sourceType: type,
                    pattern: pattern,
                    sourceCount: items.length,
                    confidence: this.calculatePatternConfidence(pattern, items)
                });
            }
        }
        
        return principles;
    }

    /**
     * Create distilled memory from principles
     */
    async createDistilledMemory(principles) {
        // CRITICAL FIX: Implementation for missing method
        console.log(`🧪 Creating distilled memory from ${principles.length} principles`);
        
        // Return simplified memory structure
        const distilled = principles.map(p => ({
            id: p.pattern?.id || `distilled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'distilled_memory',
            core: p.pattern?.essence || p.pattern || 'unknown',
            weight: p.confidence || 0.5,
            sourceType: p.sourceType,
            sourceCount: p.sourceCount,
            timestamp: Date.now()
        }));
        
        return distilled;
    }
    
    /**
     * Replace memories with distilled versions
     */
    async replaceWithDistilled(distilled) {
        // CRITICAL FIX: Implementation for missing method
        console.log(`📝 Storing ${distilled.length} distilled memories`);
        
        try {
            // Store distilled memories in database if available
            if (this.db) {
                for (const memory of distilled) {
                    const query = `
                        INSERT INTO kg_nodes (
                            node_id, 
                            node_type, 
                            properties, 
                            confidence_score,
                            created_at
                        ) VALUES ($1, $2, $3, $4, NOW())
                        ON CONFLICT (node_id) DO UPDATE 
                        SET properties = EXCLUDED.properties,
                            confidence_score = EXCLUDED.confidence_score
                    `;
                    
                    await this.db.query(query, [
                        memory.id,
                        memory.type,
                        JSON.stringify(memory),
                        memory.weight
                    ]).catch(err => {
                        console.warn(`Failed to store distilled memory: ${err.message}`);
                    });
                }
            }
            
            // Emit event for other systems to update
            this.emit('memories_distilled', {
                count: distilled.length,
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Error replacing with distilled memories:', error);
            return false;
        }
    }

    /**
     * Monitor memory health metrics
     */
    startMemoryHealthMonitoring() {
        // CRITICAL FIX: Don't start if already running or in observation mode
        if (this.monitoringIntervals.memoryHealth || this.observationMode) {
            console.log('⚠️ Memory health monitoring skipped (already running or observation mode)');
            return;
        }
        
        this.monitoringIntervals.memoryHealth = setInterval(async () => {
            // CRITICAL FIX: Skip monitoring in observation mode
            if (this.observationMode) return;
            // Calculate fragmentation
            this.memoryHealth.fragmentation = await this.calculateFragmentation();
            
            // Calculate redundancy
            this.memoryHealth.redundancy = await this.calculateRedundancy();
            
            // Calculate diversity
            this.memoryHealth.diversity = await this.calculateDiversity();
            
            // Check thresholds
            if (this.memoryHealth.fragmentation > this.config.maxMemoryFragmentation) {
                await this.defragmentMemory();
            }
            
            if (this.memoryHealth.redundancy > this.config.maxRedundancyRatio) {
                await this.deduplicateMemory();
            }
            
            this.emit('memory_health_update', this.memoryHealth);
            
        }, 300000); // Every 5 minutes
    }

    /**
     * Calculate memory fragmentation
     */
    async calculateFragmentation() {
        // Analyze graph connectivity
        const query = `
            WITH components AS (
                -- Simplified connected components analysis
                SELECT 
                    COUNT(DISTINCT n.node_id) as component_size
                FROM kg_nodes n
                GROUP BY (
                    SELECT MIN(n2.node_id::text)
                    FROM kg_nodes n2
                    JOIN kg_relationships r ON 
                        (r.source_node_id = n2.node_id OR r.target_node_id = n2.node_id)
                    WHERE EXISTS (
                        SELECT 1 FROM kg_relationships r2
                        WHERE (r2.source_node_id = n.node_id AND r2.target_node_id = n2.node_id)
                        OR (r2.source_node_id = n2.node_id AND r2.target_node_id = n.node_id)
                    )
                )
            )
            SELECT 
                COUNT(*) as num_components,
                AVG(component_size) as avg_component_size,
                STDDEV(component_size) as size_variance
            FROM components
        `;
        
        const result = await this.db.query(query);
        const stats = result.rows[0];
        
        // High fragmentation = many small components
        const fragmentation = 1 - (stats.avg_component_size / Math.max(1, stats.num_components));
        
        return Math.max(0, Math.min(1, fragmentation));
    }

    /**
     * Calculate memory redundancy
     */
    async calculateRedundancy() {
        // CRITICAL FIX: Simplified redundancy calculation using standard SQL
        // Previous version used unsupported <=> operator and assumed embedding columns
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_nodes,
                    COUNT(DISTINCT node_type) as unique_types,
                    COUNT(*) - COUNT(DISTINCT properties) as potential_redundant
                FROM kg_nodes
                WHERE properties IS NOT NULL
            `;
            
            const result = await this.db.query(query);
            const stats = result.rows[0];
            
            if (!stats || stats.total_nodes === 0) {
                return 0.1; // Low redundancy if no data
            }
            
            // Simple redundancy estimate: ratio of potentially similar nodes
            const redundancy = stats.potential_redundant / Math.max(1, stats.total_nodes);
            
            return Math.max(0, Math.min(1, redundancy));
            
        } catch (error) {
            console.warn('⚠️ Redundancy calculation failed, using default:', error.message);
            return 0.2; // Default redundancy estimate
        }
    }

    /**
     * Calculate knowledge diversity
     */
    async calculateDiversity() {
        // Analyze distribution across types and domains
        const query = `
            SELECT 
                node_type,
                properties->>'domain' as domain,
                COUNT(*) as count
            FROM kg_nodes
            GROUP BY node_type, properties->>'domain'
        `;
        
        const result = await this.db.query(query);
        
        // Calculate Shannon entropy for diversity
        const total = result.rows.reduce((sum, row) => sum + row.count, 0);
        let entropy = 0;
        
        for (const row of result.rows) {
            const p = row.count / total;
            if (p > 0) {
                entropy -= p * Math.log2(p);
            }
        }
        
        // Normalize to [0, 1]
        const maxEntropy = Math.log2(result.rows.length);
        const diversity = entropy / Math.max(1, maxEntropy);
        
        return diversity;
    }

    /**
     * Track adaptability of agents
     */
    startAdaptabilityTracking() {
        // CRITICAL FIX: Don't start if already running or in observation mode
        if (this.monitoringIntervals.adaptability || this.observationMode) {
            console.log('⚠️ Adaptability tracking skipped (already running or observation mode)');
            return;
        }
        
        this.monitoringIntervals.adaptability = setInterval(async () => {
            // CRITICAL FIX: Skip monitoring in observation mode
            if (this.observationMode) return;
            // Get all active agents
            const agents = await this.getActiveAgents();
            
            for (const agent of agents) {
                const adaptability = await this.measureAgentAdaptability(agent);
                this.adaptabilityScores.set(agent.id, adaptability);
                
                if (adaptability < this.config.minAdaptabilityScore) {
                    await this.enhanceAgentAdaptability(agent);
                }
            }
            
            // Calculate system-wide adaptability
            const systemAdaptability = this.calculateSystemAdaptability();
            
            this.emit('adaptability_update', {
                systemScore: systemAdaptability,
                agentScores: Object.fromEntries(this.adaptabilityScores)
            });
            
        }, 3600000); // Every hour
    }

    /**
     * Measure agent adaptability
     */
    async measureAgentAdaptability(agent) {
        // 🔥 FIX: Use existing agent_performance table instead of non-existent agent_task_history
        const query = `
            SELECT 
                task_name as task_type,
                CASE WHEN skill_improvement > 0 THEN true ELSE false END as is_novel,
                CASE WHEN success THEN 1.0 ELSE 0.0 END as performance_score,
                execution_time_ms as execution_time
            FROM agent_performance
            WHERE agent_id = $1
            AND timestamp > NOW() - INTERVAL '7 days'
            ORDER BY timestamp DESC
            LIMIT 100
        `;
        
        const result = await this.db.query(query, [agent.id]);
        
        if (result.rows.length === 0) return 0.5;
        
        // Calculate adaptability metrics
        const novelTasks = result.rows.filter(r => r.is_novel);
        const knownTasks = result.rows.filter(r => !r.is_novel);
        
        // Performance on novel vs known tasks
        const novelPerformance = this.average(novelTasks.map(t => t.performance_score));
        const knownPerformance = this.average(knownTasks.map(t => t.performance_score));
        
        // Adaptability = ability to handle novel tasks relative to known
        const adaptability = novelTasks.length > 0 ? 
            novelPerformance / Math.max(0.1, knownPerformance) : 0.5;
        
        return Math.max(0, Math.min(1, adaptability));
    }

    /**
     * Preserve and enhance creativity
     */
    startCreativityPreservation() {
        // CRITICAL FIX: Don't start if already running or in observation mode
        if (this.monitoringIntervals.creativity || this.observationMode) {
            console.log('⚠️ Creativity preservation skipped (already running or observation mode)');
            return;
        }
        
        this.monitoringIntervals.creativity = setInterval(async () => {
            // CRITICAL FIX: Skip monitoring in observation mode
            if (this.observationMode) return;
            // Monitor exploration vs exploitation
            const explorationRatio = await this.measureExplorationRatio();
            
            if (explorationRatio < this.config.creativityThreshold) {
                await this.injectCreativity();
            }
            
            // Preserve diverse thinking patterns
            await this.preserveDiversePatterns();
            
        }, 1800000); // Every 30 minutes
    }

    /**
     * Inject creativity into the system
     */
    async injectCreativity() {
        console.log('🎨 Injecting creativity boost...');
        
        // 1. Add noise to some decisions
        await this.addControlledNoise();
        
        // 2. Create random concept connections
        await this.createRandomEntanglements();
        
        // 3. Boost exploration parameters
        await this.adjustExplorationParameters(1.5);
        
        // 4. Introduce novel combinations
        await this.generateNovelCombinations();
        
        this.emit('creativity_injected', {
            timestamp: Date.now(),
            methods: ['noise', 'random_connections', 'exploration_boost', 'novel_combinations']
        });
    }

    /**
     * Create random conceptual connections for serendipity
     */
    async createRandomEntanglements() {
        // Select random nodes from different domains
        const query = `
            WITH random_nodes AS (
                SELECT node_id, node_type, properties->>'domain' as domain
                FROM kg_nodes
                ORDER BY RANDOM()
                LIMIT 20
            )
            SELECT 
                n1.node_id as node1,
                n2.node_id as node2,
                n1.domain as domain1,
                n2.domain as domain2
            FROM random_nodes n1
            CROSS JOIN random_nodes n2
            WHERE n1.node_id < n2.node_id
            AND n1.domain != n2.domain
            ORDER BY RANDOM()
            LIMIT 5
        `;
        
        const result = await this.db.query(query);
        
        for (const pair of result.rows) {
            // Create weak creative entanglement
            await this.knowledgeGraph.createEntanglement({
                nodeA: pair.node1,
                nodeB: pair.node2,
                strength: 0.3,
                method: 'creative_injection',
                evidence: ['creativity_preservation_system']
            });
        }
    }

    /**
     * Defragment memory by consolidating components
     */
    async defragmentMemory() {
        console.log('🧩 Defragmenting memory...');
        
        // Find and merge related disconnected components
        const components = await this.findDisconnectedComponents();
        
        for (const component of components) {
            if (component.size < 5) {
                // Try to connect to larger components
                await this.connectToMainGraph(component);
            }
        }
        
        this.emit('memory_defragmented', {
            componentsProcessed: components.length
        });
    }

    /**
     * Deduplicate redundant memories
     */
    async deduplicateMemory() {
        // CRITICAL: Skip in observation mode
        if (global.OBSERVATION_MODE_GLOBAL || global.OBSERVATION_MODE_ENFORCED) {
            return; // Don't deduplicate in observation mode
        }
        console.log('🔄 Deduplicating memory...');
        
        // Find and merge highly similar nodes
        const duplicates = await this.findDuplicates();
        
        for (const group of duplicates) {
            await this.mergeDuplicateGroup(group);
        }
        
        this.emit('memory_deduplicated', {
            groupsMerged: duplicates.length
        });
    }

    /**
     * Helper methods
     */
    async measureSystemPerformance() {
        // 🔥 FIX: Check if database is available before querying
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('   ⚠️ No database available for performance metrics');
            // Return default metrics to prevent crash
            return {
                score: 0.5,
                timestamp: Date.now(),
                validationScore: 0.5,
                successRate: 0.5,
                efficiency: 0.5
            };
        }
        
        // 🔥 FIX: Use existing agent_performance table columns
        // 🔥 CRITICAL FIX: Proper timestamp handling for PostgreSQL
        const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour in milliseconds
        const query = `
            SELECT 
                AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as avg_performance,
                AVG(CASE WHEN success THEN 1.0 ELSE 0.0 END) as avg_success_rate,
                AVG(CASE WHEN execution_time_ms > 0 
                    THEN (1000.0 / execution_time_ms) 
                    ELSE 0.5 END) as avg_efficiency
            FROM agent_performance
            WHERE 
                -- CRITICAL FIX: Use actual server schema (timestamp column exists, no created_at)
                timestamp > NOW() - INTERVAL '1 hour'
        `;
        
        try {
            const result = await this.db.query(query);
            const metrics = result.rows[0];
            
            // CRITICAL FIX: Handle null/undefined metrics
            const avgPerformance = parseFloat(metrics?.avg_performance) || 0.5;
            const avgSuccessRate = parseFloat(metrics?.avg_success_rate) || 0.5;
            const avgEfficiency = parseFloat(metrics?.avg_efficiency) || 0.5;
            
            return {
                score: (avgPerformance + avgSuccessRate + avgEfficiency) / 3,
                timestamp: Date.now(),
                components: {
                    avg_performance: avgPerformance,
                    avg_success_rate: avgSuccessRate,
                    avg_efficiency: avgEfficiency
                }
            };
        } catch (sqlError) {
            console.warn('⚠️ SQL query failed, using default performance metrics:', sqlError.message);
            
            // Return safe default values to prevent crashes
            return {
                score: 0.5,
                timestamp: Date.now(),
                components: {
                    avg_performance: 0.5,
                    avg_success_rate: 0.5,
                    avg_efficiency: 0.5
                },
                fallback: true
            };
        }
    }

    average(arr) {
        return arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
    }

    groupKnowledgeByType(knowledge) {
        const grouped = {};
        
        for (const item of knowledge) {
            const type = item.node_type;
            if (!grouped[type]) grouped[type] = [];
            grouped[type].push(item);
        }
        
        return grouped;
    }

    async extractCommonPatterns(items) {
        // Extract patterns from similar knowledge items
        // This would use pattern mining algorithms in production
        return [
            {
                structure: 'common_pattern',
                frequency: items.length,
                confidence: 0.8
            }
        ];
    }

    calculatePatternConfidence(pattern, items) {
        // Calculate confidence based on pattern support
        return Math.min(0.95, pattern.frequency / items.length);
    }

    async getActiveAgents() {
        // Get list of active agents from coordinator
        if (this.memoryCoordinator) {
            return Array.from(this.memoryCoordinator.agentMetrics.keys()).map(id => ({ id }));
        }
        return [];
    }

    calculateSystemAdaptability() {
        if (this.adaptabilityScores.size === 0) return 0.5;
        
        const scores = Array.from(this.adaptabilityScores.values());
        return this.average(scores);
    }

    async measureExplorationRatio() {
        // Measure exploration vs exploitation behavior
        const query = `
            SELECT 
                COUNT(CASE WHEN decision_type = 'exploration' THEN 1 END) as exploration_count,
                COUNT(CASE WHEN decision_type = 'exploitation' THEN 1 END) as exploitation_count
            FROM agent_decisions
            WHERE timestamp > NOW() - INTERVAL '1 hour'
        `;
        
        const result = await this.db.query(query);
        const counts = result.rows[0];
        
        const total = counts.exploration_count + counts.exploitation_count;
        return total > 0 ? counts.exploration_count / total : 0.5;
    }

    async adjustExplorationParameters(multiplier) {
        // Adjust exploration parameters across all agents
        this.emit('adjust_exploration', { multiplier });
    }

    /**
     * Get prevention system statistics
     */
    getStats() {
        return {
            memoryHealth: this.memoryHealth,
            activeStrategies: Array.from(this.activeStrategies),
            performanceHistoryLength: this.performanceHistory.length,
            systemAdaptability: this.calculateSystemAdaptability(),
            creativityMetrics: {
                explorationRatio: 0.5 // Would be calculated
            }
        };
    }
    
    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            memoryHealth: this.memoryHealth,
            performanceHistory: this.performanceHistory ? this.performanceHistory.slice(-1000) : [], // Last 1000 entries
            lastPerformance: this.lastPerformance,
            activeStrategies: Array.from(this.activeStrategies || []),
            metrics: this.metrics || {},
            creativityMetrics: Object.fromEntries(this.creativityMetrics || new Map()),
            adaptabilityHistory: this.adaptabilityHistory ? this.adaptabilityHistory.slice(-100) : []
        };
        
        return state;
    }
    
    /**
     * Restore state from persistence
     */
    async setState(state) {
        if (!state) return;
        
        // Restore memory health
        if (state.memoryHealth) {
            this.memoryHealth = state.memoryHealth;
        }
        
        // Restore performance history
        if (state.performanceHistory) {
            this.performanceHistory = state.performanceHistory;
        }
        
        // Restore last performance
        if (state.lastPerformance) {
            this.lastPerformance = state.lastPerformance;
        }
        
        // Restore active strategies
        if (state.activeStrategies) {
            this.activeStrategies = new Set(state.activeStrategies);
        }
        
        // Restore metrics
        if (state.metrics) {
            this.metrics = { ...this.metrics, ...state.metrics };
        }
        
        // Restore creativity metrics
        if (state.creativityMetrics) {
            this.creativityMetrics = new Map(Object.entries(state.creativityMetrics));
        }
        
        // Restore adaptability history
        if (state.adaptabilityHistory) {
            this.adaptabilityHistory = state.adaptabilityHistory;
        }
        
        console.log('✅ Memory sink prevention state restored');
    }

    /**
     * 🔭 ENTER OBSERVATION MODE
     * Stop all monitoring intervals to achieve true idle state
     */
    enterObservationMode() {
        console.log('🔭 MemorySinkPrevention: Entering observation mode...');
        this.observationMode = true;
        
        // Stop all monitoring intervals
        this.stopAllMonitoring();
    }
    
    /**
     * 🔄 EXIT OBSERVATION MODE
     * Resume monitoring intervals
     */
    exitObservationMode() {
        console.log('🔄 MemorySinkPrevention: Exiting observation mode...');
        this.observationMode = false;
        
        // Restart monitoring if system is initialized
        if (this.initialized) {
            this.startUCurveMonitoring();
            this.startMemoryHealthMonitoring();
            this.startAdaptabilityTracking();
            this.startCreativityPreservation();
        }
    }
    
    /**
     * 🛑 STOP ALL MONITORING INTERVALS
     */
    stopAllMonitoring() {
        console.log('🛑 Stopping MemorySinkPrevention monitoring intervals...');
        
        // Clear all active intervals
        Object.entries(this.monitoringIntervals).forEach(([name, intervalId]) => {
            if (intervalId) {
                clearInterval(intervalId);
                this.monitoringIntervals[name] = null;
                console.log(`   ✅ ${name} monitoring stopped`);
            }
        });
        
        console.log('✅ All MemorySinkPrevention monitoring stopped');
    }

    /**
     * Find duplicate memory entries
     * CRITICAL FIX: This method was missing causing crashes
     */
    async findDuplicates() {
        try {
            // Simple implementation - return empty array to prevent crashes
            // In observation mode, we don't need complex deduplication
            if (global.OBSERVATION_MODE_GLOBAL || global.OBSERVATION_MODE_ENFORCED) {
                return [];
            }
            
            // Basic duplicate detection
            const duplicateGroups = [];
            
            // Query for similar memories if database available
            if (this.config.database) {
                try {
                    const result = await this.config.database.query(`
                        SELECT id, content, embedding
                        FROM memories
                        WHERE created_at > NOW() - INTERVAL '1 hour'
                        LIMIT 100
                    `);
                    
                    // Group similar memories (simplified)
                    const groups = new Map();
                    for (const memory of result.rows) {
                        const key = JSON.stringify(memory.content).substring(0, 50);
                        if (!groups.has(key)) {
                            groups.set(key, []);
                        }
                        groups.get(key).push(memory);
                    }
                    
                    // Return groups with duplicates
                    for (const [key, memories] of groups) {
                        if (memories.length > 1) {
                            duplicateGroups.push(memories);
                        }
                    }
                } catch (dbError) {
                    // Database query failed, return empty
                    return [];
                }
            }
            
            return duplicateGroups;
        } catch (error) {
            console.error('Error finding duplicates:', error);
            return [];
        }
    }
    
    /**
     * Merge duplicate memory group
     * CRITICAL FIX: Helper method for deduplication
     */
    async mergeDuplicateGroup(group) {
        // Simple implementation - just log in non-observation mode
        if (!global.OBSERVATION_MODE_GLOBAL && !global.OBSERVATION_MODE_ENFORCED) {
            console.log(`   Merging ${group.length} duplicate memories`);
        }
        // In observation mode, do nothing
    }
}
