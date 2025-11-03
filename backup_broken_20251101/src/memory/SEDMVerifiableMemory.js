/**
 * 🔬 SEDM VERIFIABLE MEMORY
 * =========================
 * 
 * Implements Scalable Self-Evolving Distributed Memory (SEDM) framework
 * for empirical verification of knowledge utility before persistence.
 * Only admits knowledge that demonstrably improves system performance.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class SEDMVerifiableMemory extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            utilityThreshold: config.utilityThreshold || 0.3,
            verificationEnabled: config.verificationEnabled ?? true,
            abTestSampleSize: config.abTestSampleSize || 100,
            utilityWeights: config.utilityWeights || {
                reward: 0.4,
                latency: 0.3,
                tokenCost: 0.3
            },
            maxVerificationTime: config.maxVerificationTime || 5000, // 5 seconds
            utilityDecayRate: config.utilityDecayRate || 0.95, // Per retrieval
            ...config
        };
        
        // State tracking
        this.verificationQueue = [];
        this.utilityScores = new Map(); // Track historical utility
        this.verificationCache = new Map(); // Cache recent verifications
        
        // Metrics
        this.metrics = {
            knowledgeVerified: 0,
            knowledgeAdmitted: 0,
            knowledgeRejected: 0,
            averageUtility: 0,
            verificationTime: 0
        };
        
        // 🔥 KG INTEGRATION - FULL SUPPORT!
        this.knowledgeGraph = null;
        this.unifiedKnowledgeStorage = null;
        this.enableKGRouting = false;
        this.eliteMemoryPersistence = null;
        
        this.initialized = false;
    }

    /**
     * Initialize SEDM with required dependencies
     */
    async initialize(dependencies) {
        console.log('🔬 Initializing SEDM Verifiable Memory...');
        
        this.knowledgeGraph = dependencies.knowledgeGraph;
        this.simulationEngine = dependencies.simulationEngine || dependencies.worldModel;
        this.db = dependencies.database;
        
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
                console.log('   🔥 Elite persistence KG routing ENABLED for SEDM!');
            }
        }
        
        // Load historical utility scores
        await this.loadUtilityHistory();
        
        // Start verification processor
        this.startVerificationProcessor();
        
        this.initialized = true;
        console.log('✅ SEDM Verifiable Memory initialized');
        
        return true;
    }

    /**
     * Verify knowledge utility through A/B testing
     */
    async verifyKnowledgeUtility(candidateKnowledge, context = {}) {
        const verificationId = uuidv4();
        const startTime = Date.now();
        
        console.log(`🔬 Verifying knowledge utility: ${candidateKnowledge.type || 'unknown'}`);
        
        try {
            // 1. Create Self-Contained Execution Context (SCEC)
            const scec = await this.createSCEC(candidateKnowledge, context);
            
            // 2. Run control simulation (without new knowledge)
            const controlResults = await this.runSimulation(scec, false);
            
            // 3. Run treatment simulation (with new knowledge)
            const treatmentResults = await this.runSimulation(scec, true);
            
            // 4. Calculate marginal utility
            const utilityGain = await this.calculateMarginalUtility(
                controlResults,
                treatmentResults
            );
            
            // 5. Make admission decision
            const decision = this.makeAdmissionDecision(utilityGain);
            
            // 6. Record verification results
            await this.recordVerification({
                verificationId,
                candidateKnowledge,
                controlResults,
                treatmentResults,
                utilityGain,
                decision,
                duration: Date.now() - startTime
            });
            
            // Update metrics
            this.updateMetrics(decision, utilityGain, Date.now() - startTime);
            
            this.emit('verification_complete', {
                verificationId,
                admitted: decision.admit,
                utility: utilityGain.composite,
                reason: decision.reason
            });
            
            // 🔥 STORE ADMITTED KNOWLEDGE TO KG!
            if (decision.admit && this.enableKGRouting) {
                await this.storeVerifiedKnowledgeToKG(candidateKnowledge, {
                    utilityScore: utilityGain.composite,
                    method: 'ab_test',
                    evidence: abTestResult,
                    verificationId
                });
            }
            
            return {
                admit: decision.admit,
                utility: utilityGain,
                verificationId
            };
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            
            // On error, use conservative default
            return {
                admit: false,
                utility: { composite: 0 },
                error: error.message
        };
    }
}

    /**
     * Create Self-Contained Execution Context
     */
    async createSCEC(candidateKnowledge, context) {
        // SCEC includes everything needed for deterministic replay
        const scec = {
            id: uuidv4(),
            timestamp: Date.now(),
            
            // The candidate knowledge
            knowledge: {
                type: candidateKnowledge.type,
                content: candidateKnowledge.content,
                embedding: candidateKnowledge.embedding,
                metadata: candidateKnowledge.metadata
            },
            
            // Task context
            task: {
                type: context.taskType || 'general_reasoning',
                goal: context.goal || 'optimize_decision',
                constraints: context.constraints || [],
                initialState: context.initialState || {}
            },
            
            // Agent context
            agent: {
                id: context.agentId || 'test_agent',
                capabilities: context.agentCapabilities || ['reasoning', 'planning'],
                currentState: context.agentState || {}
            },
            
            // Environment snapshot
            environment: {
                marketState: await this.getMarketSnapshot(),
                systemLoad: await this.getSystemLoad(),
                activeAgents: context.activeAgents || []
            },
            
            // Evaluation criteria
            evaluation: {
                metrics: ['task_success', 'execution_time', 'resource_usage'],
                successCriteria: context.successCriteria || {
                    task_success: true,
                    max_execution_time: 1000,
                    max_tokens: 1000
                }
            }
        };
        
        return scec;
    }

    /**
     * Run simulation with or without candidate knowledge
     */
    async runSimulation(scec, includeKnowledge) {
        const simulationId = `${scec.id}-${includeKnowledge ? 'treatment' : 'control'}`;
        
        // Prepare simulation environment
        const simEnv = {
            ...scec.environment,
            knowledgeAvailable: includeKnowledge ? [scec.knowledge] : [],
            deterministicSeed: this.hashToSeed(simulationId)
        };
        
        // Run simulation
        const results = await this.simulationEngine.simulate({
            task: scec.task,
            agent: scec.agent,
            environment: simEnv,
            maxSteps: 100,
            timeout: this.config.maxVerificationTime
        });
        
        // Extract key metrics
        return {
            success: results.taskCompleted,
            reward: results.totalReward || 0,
            steps: results.steps,
            executionTime: results.executionTime,
            tokensUsed: results.tokensUsed || 0,
            decisions: results.decisions || [],
            errors: results.errors || []
        };
    }

    /**
     * Calculate marginal utility of knowledge
     */
    async calculateMarginalUtility(controlResults, treatmentResults) {
        const utility = {
            reward: 0,
            latency: 0,
            tokenCost: 0,
            composite: 0
        };
        
        // 1. Reward improvement
        if (controlResults.reward !== 0) {
            utility.reward = (treatmentResults.reward - controlResults.reward) / 
                           Math.abs(controlResults.reward);
        } else {
            utility.reward = treatmentResults.reward > 0 ? 1 : 0;
        }
        
        // 2. Latency improvement (negative is better)
        if (controlResults.executionTime > 0) {
            utility.latency = (controlResults.executionTime - treatmentResults.executionTime) / 
                            controlResults.executionTime;
        }
        
        // 3. Token cost improvement (negative is better)
        if (controlResults.tokensUsed > 0) {
            utility.tokenCost = (controlResults.tokensUsed - treatmentResults.tokensUsed) / 
                              controlResults.tokensUsed;
        }
        
        // 4. Calculate weighted composite score
        utility.composite = 
            utility.reward * this.config.utilityWeights.reward +
            utility.latency * this.config.utilityWeights.latency +
            utility.tokenCost * this.config.utilityWeights.tokenCost;
        
        // 5. Add bonus for error reduction
        if (treatmentResults.errors.length < controlResults.errors.length) {
            utility.composite += 0.1;
        }
        
        // 6. Normalize to [0, 1]
        utility.composite = Math.max(0, Math.min(1, utility.composite));
        
        return utility;
    }

    /**
     * Make admission decision based on utility
     */
    makeAdmissionDecision(utilityGain) {
        const decision = {
            admit: false,
            reason: '',
            confidence: 0
        };
        
        // Primary criterion: exceeds utility threshold
        if (utilityGain.composite >= this.config.utilityThreshold) {
            decision.admit = true;
            decision.reason = 'exceeds_utility_threshold';
            decision.confidence = utilityGain.composite;
        }
        
        // Secondary criteria for special cases
        else if (utilityGain.reward > 0.5 && utilityGain.composite > 0.2) {
            decision.admit = true;
            decision.reason = 'high_reward_improvement';
            decision.confidence = utilityGain.reward * 0.8;
        }
        
        // Reject with specific reasons
        else if (utilityGain.composite < 0) {
            decision.reason = 'negative_utility';
        } else if (utilityGain.tokenCost < -0.3) {
            decision.reason = 'excessive_token_cost';
        } else {
            decision.reason = 'below_utility_threshold';
        }
        
        return decision;
    }

    /**
     * Self-scheduling memory controller
     */
    async scheduleRetrieval(nodeId) {
        // Get current utility score
        const utilityScore = this.utilityScores.get(nodeId) || 0.5;
        
        // Calculate retrieval priority
        const priority = await this.calculateRetrievalPriority(nodeId, utilityScore);
        
        // Update retrieval schedule
        await this.updateRetrievalSchedule(nodeId, priority);
        
        return priority;
    }

    /**
     * Calculate retrieval priority based on utility
     */
    async calculateRetrievalPriority(nodeId, baseUtility) {
        // Get contextual factors
        const factors = await this.getContextualFactors(nodeId);
        
        // Adjust utility based on factors
        let adjustedUtility = baseUtility;
        
        // Recency boost
        if (factors.daysSinceLastAccess < 1) {
            adjustedUtility *= 1.2;
        }
        
        // Relevance to current tasks
        if (factors.relevanceToActiveTasks > 0.7) {
            adjustedUtility *= 1.5;
        }
        
        // Cross-domain bonus
        if (factors.crossDomainConnections > 3) {
            adjustedUtility *= 1.3;
        }
        
        // Apply decay
        const decayFactor = Math.pow(this.config.utilityDecayRate, factors.retrievalCount);
        adjustedUtility *= decayFactor;
        
        return Math.max(0, Math.min(1, adjustedUtility));
    }

    /**
     * Cross-domain knowledge diffusion
     */
    async diffuseKnowledge(verifiedKnowledge) {
        console.log('🌊 Diffusing verified knowledge across domains...');
        
        // 1. Identify the source domain
        const sourceDomain = verifiedKnowledge.metadata?.domain || 'general';
        
        // 2. Abstract to general form
        const abstractedKnowledge = await this.abstractKnowledge(verifiedKnowledge);
        
        // 3. Identify target domains
        const targetDomains = await this.identifyTargetDomains(
            abstractedKnowledge,
            sourceDomain
        );
        
        // 4. Adapt for each domain
        const adaptations = [];
        for (const domain of targetDomains) {
            const adapted = await this.adaptKnowledgeForDomain(
                abstractedKnowledge,
                domain
            );
            
            if (adapted) {
                adaptations.push({
                    domain,
                    knowledge: adapted,
                    confidence: adapted.confidence || 0.7
                });
            }
        }
        
        // 5. Queue adaptations for verification
        for (const adaptation of adaptations) {
            this.verificationQueue.push({
                knowledge: adaptation.knowledge,
                context: {
                    sourceDomain,
                    targetDomain: adaptation.domain,
                    isDiffused: true
                }
            });
        }
        
        this.emit('knowledge_diffused', {
            source: verifiedKnowledge,
            adaptations: adaptations.length,
            domains: targetDomains
        });
        
        return adaptations;
    }

    /**
     * Abstract knowledge to general form
     */
    async abstractKnowledge(knowledge) {
        // Use LLM to extract general principles
        const abstracted = {
            type: 'abstracted_principle',
            content: knowledge.content,
            metadata: {
                ...knowledge.metadata,
                abstraction_level: 'general',
                source_type: knowledge.type
            }
        };
        
        // Extract key patterns
        if (knowledge.type === 'causal_relation') {
            abstracted.pattern = {
                structure: 'cause_effect',
                variables: this.extractVariables(knowledge.content)
            };
        } else if (knowledge.type === 'strategic_concept') {
            abstracted.pattern = {
                structure: 'condition_action_outcome',
                conditions: this.extractConditions(knowledge.content)
            };
        }
        
        return abstracted;
    }

    /**
     * Record verification results
     */
    async recordVerification(verification) {
        // Store in database if available
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database not available for SEDM verification recording');
            return;
        }
        
        const query = `
            INSERT INTO sedm_verifications (
                verification_id, knowledge_type, knowledge_content,
                control_reward, treatment_reward, utility_score,
                admitted, admission_reason, duration_ms, verified_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `;
        
        try {
            await this.db.query(query, [
            verification.verificationId,
            verification.candidateKnowledge.type,
            JSON.stringify(verification.candidateKnowledge.content),
            verification.controlResults.reward,
            verification.treatmentResults.reward,
            verification.utilityGain.composite,
            verification.decision.admit,
                verification.decision.reason,
                verification.duration
            ]);
            
            // Update utility scores
            if (verification.candidateKnowledge.nodeId) {
                this.utilityScores.set(
                    verification.candidateKnowledge.nodeId,
                    verification.utilityGain.composite
                );
            }
            
            // Cache verification result
            this.verificationCache.set(
                this.getKnowledgeHash(verification.candidateKnowledge),
                {
                    utility: verification.utilityGain.composite,
                    admitted: verification.decision.admit,
                    timestamp: Date.now()
                }
            );
            
        } catch (error) {
            console.warn('⚠️ Could not record verification to database:', error.message);
        }
    }

    /**
     * Load historical utility scores
     */
    async loadUtilityHistory() {
        // 🔥 DATABASE CHECK - GRACEFUL DEGRADATION!
        if (!this.db || typeof this.db.query !== 'function') {
            console.warn('⚠️ Database not available for SEDM utility history - using empty cache');
            return;
        }
        
        const query = `
            SELECT 
                knowledge_content,
                AVG(utility_score) as avg_utility,
                COUNT(*) as verification_count,
                SUM(CASE WHEN admitted THEN 1 ELSE 0 END) as admission_count
            FROM sedm_verifications
            WHERE verified_at > NOW() - INTERVAL '30 days'
            GROUP BY knowledge_content
            HAVING COUNT(*) > 2
        `;
        
        try {
            const result = await this.db.query(query);
        
            for (const row of result.rows) {
                const hash = this.hashContent(row.knowledge_content);
                this.utilityScores.set(hash, row.avg_utility);
            }
            
            console.log(`📊 Loaded ${result.rows.length} historical utility scores`);
        } catch (error) {
            console.warn('⚠️ Could not load utility history:', error.message);
            console.warn('   Continuing with empty utility cache');
        }
    }

    /**
     * Start background verification processor
     */
    startVerificationProcessor() {
        setInterval(async () => {
            while (this.verificationQueue.length > 0) {
                const item = this.verificationQueue.shift();
                
                try {
                    const result = await this.verifyKnowledgeUtility(
                        item.knowledge,
                        item.context
                    );
                    
                    if (result.admit) {
                        // Persist to knowledge graph
                        await this.persistVerifiedKnowledge(item.knowledge, result);
                        
                        // Trigger cross-domain diffusion
                        if (!item.context?.isDiffused) {
                            await this.diffuseKnowledge(item.knowledge);
                        }
                    }
                } catch (error) {
                    console.error('Verification processing error:', error);
                }
            }
        }, 1000); // Process every second
    }

    /**
     * Persist verified knowledge to KG
     */
    async persistVerifiedKnowledge(knowledge, verification) {
        const enrichedKnowledge = {
            ...knowledge,
            metadata: {
                ...knowledge.metadata,
                sedm_verified: true,
                utility_score: verification.utility.composite,
                verification_id: verification.verificationId,
                verified_at: new Date()
            }
        };
        
        // Add to knowledge graph with utility metadata
        if (knowledge.nodeId) {
            await this.knowledgeGraph.updateNode(knowledge.nodeId, {
                properties: enrichedKnowledge.metadata
            });
        } else {
            await this.knowledgeGraph.createNode({
                nodeType: knowledge.type,
                properties: enrichedKnowledge.metadata,
                confidence: Math.max(knowledge.confidence || 0.5, verification.utility.composite)
            });
        }
    }

    /**
     * Helper methods
     */
    async getMarketSnapshot() {
        // Get current market state for SCEC
        // This would integrate with your market data systems
        return {
            timestamp: Date.now(),
            volatility: Math.random() * 0.3,
            volume: Math.random() * 1000000,
            trend: Math.random() > 0.5 ? 'bullish' : 'bearish'
        };
    }

    async getSystemLoad() {
        return {
            activeAgents: Math.floor(Math.random() * 20),
            cpuUsage: Math.random() * 0.8,
            memoryUsage: Math.random() * 0.7
        };
    }

    hashToSeed(input) {
        // Convert hash to numeric seed for deterministic simulation
        const hash = require('crypto').createHash('sha256').update(input).digest();
        return parseInt(hash.toString('hex').substring(0, 8), 16);
    }

    getKnowledgeHash(knowledge) {
        const content = JSON.stringify({
            type: knowledge.type,
            content: knowledge.content
        });
        return this.hashContent(content);
    }

    hashContent(content) {
        return require('crypto').createHash('sha256').update(content).digest('hex');
    }

    extractVariables(content) {
        // Extract variable components from causal relations
        // Simplified - would use NLP in production
        return {
            cause: 'variable_a',
            effect: 'variable_b'
        };
    }

    extractConditions(content) {
        // Extract conditions from strategic concepts
        return {
            preconditions: [],
            postconditions: []
        };
    }

    async getContextualFactors(nodeId) {
        // Return default factors if no database
        if (!this.db || typeof this.db.query !== 'function') {
            return {
                recency: 1.0,
                connectivity: 0.5,
                frequency: 0.5
            };
        }
        
        // Query various factors that affect retrieval priority
        const query = `
            SELECT 
                EXTRACT(DAYS FROM (NOW() - n.last_retrieved_ts)) as days_since_access,
                (SELECT COUNT(*) FROM kg_relationships 
                 WHERE source_node_id = n.node_id OR target_node_id = n.node_id) as connections,
                n.properties->>'retrieval_count' as retrieval_count
            FROM kg_nodes n
            WHERE n.node_id = $1
        `;
        
        try {
            const result = await this.db.query(query, [nodeId]);
        
            return {
                daysSinceLastAccess: result.rows[0]?.days_since_access || 999,
                crossDomainConnections: result.rows[0]?.connections || 0,
                retrievalCount: parseInt(result.rows[0]?.retrieval_count || '0'),
                relevanceToActiveTasks: await this.calculateRealRelevance(nodeId)
            };
        } catch (error) {
            console.warn('⚠️ Could not get contextual factors:', error.message);
            // Return default values
            return {
                daysSinceLastAccess: 999,
                crossDomainConnections: 0,
                retrievalCount: 0,
                relevanceToActiveTasks: 0.5
            };
        }
    }

    async updateRetrievalSchedule(nodeId, priority) {
        // Update the node's retrieval priority in KG
        await this.knowledgeGraph.updateNode(nodeId, {
            properties: {
                sedm_retrieval_priority: priority,
                sedm_priority_updated: new Date()
            }
        });
    }

    async identifyTargetDomains(abstractedKnowledge, sourceDomain) {
        // Identify domains that could benefit from this knowledge
        const allDomains = ['trading', 'risk', 'portfolio', 'market_analysis', 'execution'];
        return allDomains.filter(d => d !== sourceDomain);
    }

    async adaptKnowledgeForDomain(knowledge, targetDomain) {
        // Adapt abstracted knowledge for specific domain
        // This would use domain-specific adaptation rules
        return {
            ...knowledge,
            metadata: {
                ...knowledge.metadata,
                adapted_for: targetDomain,
                adaptation_confidence: 0.7
            }
        };
    }

    /**
     * Update metrics
     */
    updateMetrics(decision, utilityGain, verificationTime) {
        this.metrics.knowledgeVerified++;
        
        if (decision.admit) {
            this.metrics.knowledgeAdmitted++;
        } else {
            this.metrics.knowledgeRejected++;
        }
        
        // Update average utility (running average)
        const n = this.metrics.knowledgeVerified;
        this.metrics.averageUtility = 
            (this.metrics.averageUtility * (n - 1) + utilityGain.composite) / n;
        
        // Update average verification time
        this.metrics.verificationTime = 
            (this.metrics.verificationTime * (n - 1) + verificationTime) / n;
        
        // Update last verification time
        this.lastVerificationTime = Date.now();
    }

    /**
     * Get current state for persistence
     */
    async getState() {
        const state = {
            config: this.config,
            metrics: this.metrics,
            initialized: this.initialized,
            // Serialize verification queue (limit size)
            verificationQueue: this.verificationQueue.slice(-100),
            // Serialize utility scores (limit size)
            utilityScores: [],
            // Serialize cache entries (limit size)
            verificationCache: [],
            lastVerificationTime: this.lastVerificationTime || null
        };
        
        // Serialize utility scores (top 1000)
        const utilityArray = Array.from(this.utilityScores.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 1000);
        state.utilityScores = utilityArray;
        
        // Serialize verification cache (recent 500)
        let cacheCount = 0;
        for (const [key, value] of this.verificationCache) {
            if (cacheCount >= 500) break;
            state.verificationCache.push({ key, value });
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
            this.metrics = { ...this.metrics, ...state.metrics };
        }
        
        // Restore verification queue
        if (state.verificationQueue) {
            this.verificationQueue = state.verificationQueue;
        }
        
        // Restore utility scores
        if (state.utilityScores) {
            this.utilityScores.clear();
            for (const [key, value] of state.utilityScores) {
                this.utilityScores.set(key, value);
            }
        }
        
        // Restore verification cache
        if (state.verificationCache) {
            this.verificationCache.clear();
            for (const { key, value } of state.verificationCache) {
                this.verificationCache.set(key, value);
            }
        }
        
        // Restore last verification time
        if (state.lastVerificationTime) {
            this.lastVerificationTime = state.lastVerificationTime;
        }
        
        console.log('✅ SEDM Verifiable Memory state restored');
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
     * Get SEDM statistics
     */
    getStats() {
        return {
            metrics: this.metrics,
            queueLength: this.verificationQueue.length,
            cacheSize: this.verificationCache.size,
            utilityScoresTracked: this.utilityScores.size,
            admissionRate: this.metrics.knowledgeVerified > 0 ? 
                this.metrics.knowledgeAdmitted / this.metrics.knowledgeVerified : 0
        };
    }
    
    async calculateRealRelevance(nodeId) {
        // Calculate REAL relevance based on active tasks and agent focus
        
        // Return default relevance if no database
        if (!this.db || typeof this.db.query !== 'function') {
            return 0.5;
        }
        
        try {
            // Get active tasks that might use this knowledge
            const activeTasks = await this.db.query(`
                SELECT t.task_id, t.task_type, t.priority,
                       similarity(t.description, n.properties->>'content') as content_similarity
                FROM active_tasks t, kg_nodes n
                WHERE n.node_id = $1
                AND t.status = 'active'
                AND t.created_at > NOW() - INTERVAL '1 hour'
                ORDER BY content_similarity DESC
                LIMIT 10
            `, [nodeId]);
            
            if (activeTasks.rows.length === 0) {
                return 0; // No active tasks = no relevance
            }
            
            // Calculate weighted relevance
            let totalRelevance = 0;
            let totalWeight = 0;
            
            for (const task of activeTasks.rows) {
                const similarity = parseFloat(task.content_similarity || '0');
                const priorityWeight = task.priority === 'high' ? 2.0 : 
                                     task.priority === 'medium' ? 1.5 : 1.0;
                
                totalRelevance += similarity * priorityWeight;
                totalWeight += priorityWeight;
            }
            
            // Check agent interest in this knowledge
            const agentInterest = await this.db.query(`
                SELECT COUNT(DISTINCT aa.agent_id) as interested_agents,
                       MAX(aa.interest_score) as max_interest
                FROM agent_activations aa
                JOIN agent_knowledge_interests aki ON aa.agent_id = aki.agent_id
                WHERE aki.knowledge_type = (
                    SELECT node_type FROM kg_nodes WHERE node_id = $1
                )
                AND aa.last_active > NOW() - INTERVAL '30 minutes'
            `, [nodeId]);
            
            const agentFactor = agentInterest.rows[0]?.interested_agents > 0 ? 
                              1 + (parseFloat(agentInterest.rows[0].max_interest || '0') * 0.2) : 1;
            
            // Calculate final relevance (0-1 scale)
            const relevance = totalWeight > 0 ? 
                            (totalRelevance / totalWeight) * agentFactor : 0;
            
            return Math.min(1, relevance);
            
        } catch (error) {
            console.error('Failed to calculate real relevance:', error);
            return 0; // Safe default
        }
    }
    
    calculateVolatilityFromConditions(conditions) {
        // Calculate real volatility from market conditions
        if (!conditions) return 0.15;
        
        // Use network congestion as volatility proxy
        const congestion = conditions.networkCongestion || 0.5;
        
        // High gas prices indicate high volatility
        const gasPrice = parseFloat(conditions.gasPrice || '50');
        const gasFactor = Math.min(1, gasPrice / 200); // Normalize to 0-1
        
        // Calculate volatility (0.05 to 0.50 range)
        const volatility = 0.05 + (congestion * 0.25) + (gasFactor * 0.20);
        
        return Math.min(0.5, volatility);
    }
    
    determineTrendFromConditions(conditions) {
        // Determine real trend from market conditions
        if (!conditions) return 'neutral';
        
        // Analyze multiple factors
        const factors = {
            tvlGrowing: conditions.totalValueLocked > (conditions.previousTVL || conditions.totalValueLocked * 0.95),
            highActivity: conditions.activeArbitrageContracts > 10,
            lowGas: parseFloat(conditions.gasPrice || '50') < 30,
            fastBlocks: conditions.avgBlockTime < 13
        };
        
        // Count bullish vs bearish signals
        const bullishSignals = Object.values(factors).filter(f => f).length;
        
        if (bullishSignals >= 3) return 'bullish';
        if (bullishSignals <= 1) return 'bearish';
        return 'neutral';
    }
    
    /**
     * 🔥 Store verified knowledge to KG/UnifiedStorage
     */
    async storeVerifiedKnowledgeToKG(knowledge, verification) {
        if (!this.enableKGRouting) return null;
        
        try {
            const verifiedData = {
                type: 'sedm_verified_knowledge',
                content: knowledge.content,
                utility: verification.utilityScore,
                verificationMethod: verification.method,
                empiricalEvidence: verification.evidence,
                timestamp: Date.now()
            };
            
            if (this.unifiedKnowledgeStorage) {
                // Use unified storage pipeline
                const result = await this.unifiedKnowledgeStorage.storeKnowledge(verifiedData, {
                    agentId: 'SEDMVerifiableMemory',
                    type: 'verified_knowledge',
                    confidence: verification.utilityScore
                });
                
                if (result.success) {
                    console.log(`   🔥 Verified knowledge stored to KG: ${result.nodeId}`);
                }
                return result;
            } else if (this.knowledgeGraph) {
                // Direct KG storage
                const node = await this.knowledgeGraph.createNode({
                    nodeType: 'sedm_verified',
                    content: verifiedData,
                    metadata: {
                        source: 'SEDMVerifiableMemory',
                        utility: verification.utilityScore,
                        verified: true
                    }
                });
                console.log(`   🔥 Verified knowledge stored directly to KG: ${node.nodeId}`);
                return node;
            }
        } catch (error) {
            console.error('❌ Failed to store verified knowledge to KG:', error.message);
        }
        
        return null;
    }
    
    /**
     * 🔥 Store utility measurement to persistence with KG routing
     */
    async persistUtilityMeasurement(measurement, metadata = {}) {
        if (!this.eliteMemoryPersistence) return null;
        
        try {
            // Store with KG routing enabled
            const result = await this.eliteMemoryPersistence.storeMemory(
                `sedm_utility_${Date.now()}`,
                {
                    ...measurement,
                    engine: 'SEDMVerifiableMemory',
                    timestamp: Date.now()
                },
                {
                    storeToKG: true, // 🔥 ENABLE KG ROUTING!
                    agentId: 'SEDMVerifiableMemory',
                    confidence: measurement.utilityScore || 0.5,
                    ...metadata
                }
            );
            
            if (result.success) {
                console.log('   🔥 Utility measurement persisted with KG routing');
            }
            
            return result;
        } catch (error) {
            console.error('❌ Failed to persist utility measurement:', error.message);
            return null;
        }
    }
    
    /**
     * 🔥 Set or update the simulation engine
     */
    setSimulationEngine(simulationEngine) {
        if (!simulationEngine) {
            console.warn('⚠️ No simulationEngine provided to SEDMVerifiableMemory');
            return;
        }
        
        this.simulationEngine = simulationEngine;
        
        // 🔥 KG INTEGRATION - CONNECT IF AVAILABLE!
        if (this.knowledgeGraph && simulationEngine.setKnowledgeGraph) {
            simulationEngine.setKnowledgeGraph(this.knowledgeGraph);
            console.log('   🔥 Connected KnowledgeGraph to SimulationEngine');
        }
        
        // Enable KG routing if available
        if (this.unifiedKnowledgeStorage && simulationEngine.setUnifiedStorage) {
            simulationEngine.setUnifiedStorage(this.unifiedKnowledgeStorage);
            console.log('   🔥 Connected UnifiedKnowledgeStorage to SimulationEngine');
        }
        
        // Store the update event
        if (this.eliteMemoryPersistence) {
            this.eliteMemoryPersistence.storeMemory(
                'sedm_simulation_engine_updated',
                {
                    engineType: simulationEngine.constructor?.name || 'Unknown',
                    timestamp: Date.now()
                },
                {
                    storeToKG: true,
                    agentId: 'SEDMVerifiableMemory',
                    confidence: 0.9
                }
            );
        }
        
        console.log('   ✅ Simulation engine updated in SEDM');
    }
}
