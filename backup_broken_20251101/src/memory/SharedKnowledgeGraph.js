/**
 * 🌐 SHARED KNOWLEDGE GRAPH
 * =========================
 * Collaborative knowledge architecture with personal-collective bridge.
 * Enables agents to share verified insights while maintaining personal autonomy.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeGraph } from './KnowledgeGraph.js';

export class SharedKnowledgeGraph extends KnowledgeGraph {
    constructor(dependencies = {}) {
        super(dependencies);
        
        // ENHANCED: Store dependencies for initialization
        this.dependencies = dependencies;
        
        // Personal knowledge graphs for each agent
        this.personalGraphs = new Map(); // Agent ID → Personal KG
        
        // Collaborative systems
        this.consensusEngine = new ConsensusEngine();
        this.collaborativeMemory = new Map(); // Store collaborative memories
        this.knowledgeBridge = null; // Will be initialized after personal KGs
        
        // Quantum entanglement for knowledge coherence
        this.quantumEntanglement = dependencies.quantumEngine;
        
        // Truth verification
        this.truthVerifier = dependencies.truthVerifier;
        
        // Configuration
        this.config = {
            ...this.config,
            consensusThreshold: 0.66,
            minContributors: 2,
            promotionThreshold: 0.8,
            diversityBonus: 0.1,
            coherenceRequirement: 0.7,
            propagationDelay: 100, // ms
            conflictResolutionStrategy: 'weighted_consensus'
        };
        
        // Metrics
        this.sharedMetrics = {
            totalSharedNodes: 0,
            totalContributions: 0,
            consensusAchieved: 0,
            conflictsResolved: 0,
            collectiveInsights: 0,
            knowledgePropagations: 0
        };
    }

    /**
     * Initialize shared knowledge graph with bridge
     * ENHANCED: Passes dependencies to parent for sophisticated initialization
     */
    async initialize() {
        // SOPHISTICATED: Pass stored dependencies to parent initialize
        await super.initialize(this.dependencies);
        
        console.log('🌐 Initializing Shared Knowledge Graph...');
        
        // Initialize knowledge bridge
        this.knowledgeBridge = new KnowledgeBridge(this, this.personalGraphs);
        
        // Set up consensus engine
        await this.consensusEngine.initialize();
        
        console.log('✅ Shared Knowledge Graph initialized');
    }

    /**
     * Create or get personal knowledge graph for agent
     */
    async getPersonalGraph(agentId) {
        if (!this.personalGraphs.has(agentId)) {
            console.log(`   🆕 Creating personal KG for agent: ${agentId}`);
            const personalKG = new PersonalKnowledgeGraph({
                agentId,
                db: this.db,
                embeddingService: this.embeddingService,
                sharedKG: this
            });
            
            await personalKG.initialize();
            this.personalGraphs.set(agentId, personalKG);
            console.log(`   ✅ Personal KG created and initialized for: ${agentId}`);
        } else {
            console.log(`   ♻️ Reusing existing personal KG for: ${agentId}`);
        }
        
        return this.personalGraphs.get(agentId);
    }
    
    /**
     * 🎯 CREATE PERSONAL KG (Alias for getPersonalGraph for API compatibility)
     * ========================================================================
     * DEEP INTEGRATION: Connects to existing getPersonalGraph() implementation
     */
    async createPersonalKG(agentId) {
        console.log(`🌐 SharedKG: Creating personal knowledge graph for agent ${agentId}...`);
        
        // Use sophisticated existing implementation
        const personalKG = await this.getPersonalGraph(agentId);
        
        console.log(`   ✅ Personal KG ready for agent: ${agentId}`);
        console.log(`   📊 Total personal KGs: ${this.personalGraphs.size}`);
        
        return personalKG;
    }

    /**
     * Promote personal knowledge to shared with consensus
     */
    async promoteToShared(personalNode, agentId, consensus) {
        // Validate consensus threshold
        if (consensus.score < this.config.consensusThreshold) {
            return { 
                success: false, 
                reason: 'Insufficient consensus',
                requiredScore: this.config.consensusThreshold,
                actualScore: consensus.score
            };
        }
        
        // Verify the knowledge before sharing
        const verification = await this.truthVerifier?.verifyConceptInput(
            personalNode,
            { source: `agent_${agentId}` }
        );
        
        if (verification && !verification.verified) {
            return {
                success: false,
                reason: 'Failed truth verification',
                verification
            };
        }
        
        // Check quantum coherence if available
        let quantumSignature = null;
        if (this.quantumEntanglement) {
            const coherence = await this.quantumEntanglement.assessCoherence(personalNode);
            if (coherence.score < this.config.coherenceRequirement) {
                return {
                    success: false,
                    reason: 'Insufficient quantum coherence',
                    coherence: coherence.score
                };
            }
            quantumSignature = await this.quantumEntanglement.sign(personalNode);
        }
        
        // Create shared node with full attribution
        const sharedNode = await this.createSharedNode({
            ...personalNode,
            id: uuidv4(),
            contributors: [agentId],
            consensusScore: consensus.score,
            verificationLevel: verification?.credibility || 1.0,
            quantumSignature,
            promotedAt: Date.now(),
            accessCount: 0,
            lastValidated: Date.now()
        });
        
        // Create bidirectional links
        await this.linkPersonalToShared(personalNode, sharedNode, agentId);
        
        // Propagate to all agents
        await this.propagateSharedKnowledge(sharedNode);
        
        // Update metrics
        this.sharedMetrics.totalContributions++;
        this.sharedMetrics.consensusAchieved++;
        
        // Emit event
        this.emit('knowledge_shared', {
            agentId,
            sharedNode,
            consensus
        });
        
        return { 
            success: true, 
            sharedNodeId: sharedNode.id,
            propagatedTo: this.personalGraphs.size - 1 // Exclude contributor
        };
    }

    /**
     * Create a shared knowledge node
     */
    async createSharedNode(nodeData) {
        const sharedNode = {
            ...nodeData,
            type: 'shared',
            sharedAt: Date.now()
        };
        
        // Store in database if available
        if (this.db) {
            await this.db.query(`
                INSERT INTO shared_kg_nodes 
                (id, content, contributors, consensus_score, verification_level, quantum_signature, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `, [
                sharedNode.id,
                JSON.stringify(sharedNode),
                sharedNode.contributors,
                sharedNode.consensusScore,
                sharedNode.verificationLevel,
                sharedNode.quantumSignature,
                new Date()
            ]);
        }
        
        // Store in base KG as well
        await super.createNode(sharedNode);
        
        this.sharedMetrics.totalSharedNodes++;
        
        return sharedNode;
    }

    /**
     * Link personal node to shared node
     */
    async linkPersonalToShared(personalNode, sharedNode, agentId) {
        const link = {
            personalNodeId: personalNode.id,
            sharedNodeId: sharedNode.id,
            agentId,
            linkType: 'promoted',
            confidence: sharedNode.consensusScore,
            createdAt: Date.now()
        };
        
        // Store link in database
        if (this.db) {
            await this.db.query(`
                INSERT INTO personal_to_shared_links 
                (personal_node_id, shared_node_id, agent_id, link_type, confidence, created_at)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                link.personalNodeId,
                link.sharedNodeId,
                link.agentId,
                link.linkType,
                link.confidence,
                new Date()
            ]);
        }
        
        // Create relationship in KG
        await this.createRelationship({
            source: personalNode.id,
            target: sharedNode.id,
            type: 'promoted_to_shared',
            properties: link
        });
        
        return link;
    }

    /**
     * Propagate shared knowledge to all agents
     */
    async propagateSharedKnowledge(sharedNode) {
        const propagations = [];
        
        for (const [agentId, personalKG] of this.personalGraphs) {
            // Skip the contributor
            if (sharedNode.contributors.includes(agentId)) continue;
            
            // Propagate with slight delay to prevent overload
            propagations.push(
                this.propagateToAgent(sharedNode, agentId, personalKG)
            );
            
            await new Promise(resolve => setTimeout(resolve, this.config.propagationDelay));
        }
        
        const results = await Promise.allSettled(propagations);
        this.sharedMetrics.knowledgePropagations += results.filter(r => r.status === 'fulfilled').length;
        
        return results;
    }

    /**
     * Propagate knowledge to specific agent
     */
    async propagateToAgent(sharedNode, agentId, personalKG) {
        try {
            // Agent can accept or reject based on their criteria
            const accepted = await personalKG.evaluateSharedKnowledge(sharedNode);
            
            if (accepted) {
                // Create reference in personal KG
                await personalKG.createSharedReference(sharedNode);
                
                // Update access count
                await this.incrementAccessCount(sharedNode.id);
                
                return { agentId, accepted: true };
            }
            
            return { agentId, accepted: false };
        } catch (error) {
            console.error(`Failed to propagate to agent ${agentId}:`, error);
            return { agentId, error: error.message };
        }
    }

    /**
     * 🔧 GENERATE EMBEDDING (DEEP INTEGRATION with embeddingService)
     * ==============================================================
     * Sophisticated embedding generation using embeddingService
     */
    async generateEmbedding(content) {
        if (!this.embeddingService) {
            console.warn('   🔄 FALLBACK: EmbeddingService not available, using simple hash');
            console.warn('   ⚠️ MONITORING: SharedKG generating embeddings without embeddingService!');
            
            // Fallback: Simple hash-based embedding
            const text = typeof content === 'string' ? content : JSON.stringify(content);
            const embedding = new Float32Array(768);
            for (let i = 0; i < text.length; i++) {
                embedding[i % 768] += text.charCodeAt(i) / 255;
            }
            return embedding;
        }
        
        const text = typeof content === 'string' ? content : 
                    content?.content || content?.text || JSON.stringify(content);
        
        // Use embeddingService (supports both embed() and encode())
        const embedFn = this.embeddingService.embed || this.embeddingService.encode;
        if (embedFn) {
            return await embedFn.call(this.embeddingService, text);
        }
        
        // Ultimate fallback
        console.warn('   🔄 FALLBACK: EmbeddingService has no embed/encode method!');
        return new Float32Array(768).fill(0.5);
    }
    
    /**
     * Query shared knowledge with consensus
     */
    async querySharedKnowledge(query, options = {}) {
        const embedding = query.embedding || await this.generateEmbedding(query.content || query);
        
        const results = await super.searchByEmbedding(
            embedding,
            {
                ...options,
                filter: { type: 'shared' }
            }
        );
        
        // Enhance results with consensus data
        for (const result of results) {
            result.consensusData = await this.getConsensusData(result.id);
            result.contributors = await this.getContributors(result.id);
        }
        
        return results;
    }

    /**
     * Store collective insight from multiple agents
     */
    async storeCollectiveInsight(synthesis) {
        const insight = {
            id: uuidv4(),
            type: 'collective_insight',
            synthesis: synthesis.content,
            contributingAgents: synthesis.contributors,
            consensusMethod: synthesis.method || this.config.conflictResolutionStrategy,
            diversityScore: await this.calculateDiversityScore(synthesis),
            confidence: synthesis.confidence,
            createdAt: Date.now()
        };
        
        // Store in database
        if (this.db) {
            await this.db.query(`
                INSERT INTO collective_insights 
                (id, concept_id, synthesis, contributing_agents, consensus_method, diversity_score, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                insight.id,
                synthesis.conceptId,
                JSON.stringify(insight.synthesis),
                insight.contributingAgents,
                insight.consensusMethod,
                insight.diversityScore,
                new Date()
            ]);
        }
        
        // Create as shared node
        const sharedNode = await this.createSharedNode({
            ...insight,
            contributors: synthesis.contributors,
            consensusScore: synthesis.confidence,
            verificationLevel: 1.0 // Collective insights are pre-verified
        });
        
        this.sharedMetrics.collectiveInsights++;
        
        // Emit event
        this.emit('collective_insight_created', {
            insight: sharedNode,
            contributors: synthesis.contributors
        });
        
        return sharedNode;
    }

    /**
     * Resolve conflicts between different agent knowledge
     */
    async resolveKnowledgeConflict(conflictingNodes, strategy = null) {
        const resolutionStrategy = strategy || this.config.conflictResolutionStrategy;
        
        let resolution;
        switch (resolutionStrategy) {
            case 'weighted_consensus':
                resolution = await this.weightedConsensusResolution(conflictingNodes);
                break;
            
            case 'quantum_coherence':
                resolution = await this.quantumCoherenceResolution(conflictingNodes);
                break;
            
            case 'formal_proof':
                resolution = await this.formalProofResolution(conflictingNodes);
                break;
            
            case 'majority_vote':
                resolution = await this.majorityVoteResolution(conflictingNodes);
                break;
            
            default:
                resolution = await this.defaultResolution(conflictingNodes);
        }
        
        this.sharedMetrics.conflictsResolved++;
        
        return resolution;
    }

    /**
     * Calculate diversity score for synthesis
     */
    async calculateDiversityScore(synthesis) {
        if (!synthesis.contributors || synthesis.contributors.length < 2) {
            return 0;
        }
        
        let diversityScore = 0;
        
        // Agent diversity
        const uniqueAgents = new Set(synthesis.contributors).size;
        diversityScore += (uniqueAgents / synthesis.contributors.length) * 0.3;
        
        // Perspective diversity (if available)
        if (synthesis.perspectives) {
            const uniquePerspectives = new Set(synthesis.perspectives).size;
            diversityScore += (uniquePerspectives / synthesis.perspectives.length) * 0.3;
        }
        
        // Knowledge domain diversity
        if (synthesis.domains) {
            const uniqueDomains = new Set(synthesis.domains).size;
            diversityScore += Math.min(1, uniqueDomains / 3) * 0.2;
        }
        
        // Temporal diversity (different time contexts)
        if (synthesis.timestamps) {
            const timeRange = Math.max(...synthesis.timestamps) - Math.min(...synthesis.timestamps);
            const hoursDiversity = Math.min(1, timeRange / (24 * 3600 * 1000)); // Up to 24 hours
            diversityScore += hoursDiversity * 0.2;
        }
        
        return Math.min(1, diversityScore + this.config.diversityBonus);
    }

    /**
     * Weighted consensus resolution for conflicts
     */
    async weightedConsensusResolution(conflictingNodes) {
        const weights = await Promise.all(
            conflictingNodes.map(async node => ({
                node,
                weight: await this.calculateNodeWeight(node)
            }))
        );
        
        // Sort by weight
        weights.sort((a, b) => b.weight - a.weight);
        
        // Create consensus node
        const consensusNode = {
            ...weights[0].node, // Start with highest weight
            type: 'consensus_resolution',
            conflictResolution: {
                method: 'weighted_consensus',
                conflictingNodes: conflictingNodes.map(n => n.id),
                weights: weights.map(w => ({ nodeId: w.node.id, weight: w.weight })),
                timestamp: Date.now()
            }
        };
        
        return await this.createSharedNode(consensusNode);
    }

    /**
     * Calculate weight for a node in consensus
     */
    async calculateNodeWeight(node) {
        let weight = 0;
        
        // Verification level
        weight += (node.verificationLevel || 0.5) * 0.3;
        
        // Consensus score
        weight += (node.consensusScore || 0.5) * 0.2;
        
        // Number of contributors
        const contributors = node.contributors?.length || 1;
        weight += Math.min(1, contributors / 5) * 0.2;
        
        // Access frequency
        const accessCount = node.accessCount || 0;
        weight += Math.min(1, accessCount / 100) * 0.15;
        
        // Recency
        const age = Date.now() - (node.createdAt || 0);
        const recency = Math.exp(-age / (7 * 24 * 3600 * 1000)); // Decay over 7 days
        weight += recency * 0.15;
        
        return weight;
    }

    /**
     * Increment access count for shared node
     */
    async incrementAccessCount(nodeId) {
        if (this.db) {
            await this.db.query(`
                UPDATE shared_kg_nodes 
                SET access_count = access_count + 1
                WHERE id = $1
            `, [nodeId]);
        }
        
        // Update in-memory if cached
        const node = await this.getNode(nodeId);
        if (node) {
            node.accessCount = (node.accessCount || 0) + 1;
        }
    }

    /**
     * Get consensus data for a node
     */
    async getConsensusData(nodeId) {
        if (!this.db) return null;
        
        const result = await this.db.query(`
            SELECT consensus_score, verification_level, contributors, access_count
            FROM shared_kg_nodes
            WHERE id = $1
        `, [nodeId]);
        
        return result.rows[0] || null;
    }

    /**
     * Get contributors for a node
     */
    async getContributors(nodeId) {
        if (!this.db) return [];
        
        const result = await this.db.query(`
            SELECT DISTINCT agent_id
            FROM personal_to_shared_links
            WHERE shared_node_id = $1
        `, [nodeId]);
        
        return result.rows.map(r => r.agent_id);
    }

    /**
     * Get metrics
     */
    getMetrics() {
        return {
            ...super.getMetrics(),
            shared: this.sharedMetrics,
            personalGraphs: this.personalGraphs.size,
            consensusEngine: this.consensusEngine?.getMetrics()
        };
    }

    /**
     * Get state for persistence
     */
    getState() {
        return {
            ...super.getState(),
            sharedMetrics: this.sharedMetrics,
            config: this.config
        };
    }

    /**
     * Restore state from persistence
     */
    setState(state) {
        super.setState(state);
        if (state.sharedMetrics) {
            Object.assign(this.sharedMetrics, state.sharedMetrics);
        }
        if (state.config) {
            Object.assign(this.config, state.config);
        }
    }
}

/**
 * Personal Knowledge Graph for individual agents
 */
class PersonalKnowledgeGraph extends KnowledgeGraph {
    constructor(dependencies) {
        super(dependencies);
        this.agentId = dependencies.agentId;
        this.sharedKG = dependencies.sharedKG;
        
        // Personal preferences
        this.preferences = {
            acceptanceThreshold: 0.7,
            trustDecay: 0.95, // Trust decay factor over time
            maxPersonalNodes: 10000
        };
    }

    /**
     * Evaluate if shared knowledge should be accepted
     */
    async evaluateSharedKnowledge(sharedNode) {
        // Check relevance to agent's current context
        const relevance = await this.assessRelevance(sharedNode);
        
        // Check trust in contributors
        const trust = await this.assessTrust(sharedNode.contributors);
        
        // Check consistency with existing knowledge
        const consistency = await this.checkConsistency(sharedNode);
        
        const score = (relevance * 0.4) + (trust * 0.3) + (consistency * 0.3);
        
        return score >= this.preferences.acceptanceThreshold;
    }

    /**
     * Create reference to shared knowledge
     */
    async createSharedReference(sharedNode) {
        const reference = {
            id: uuidv4(),
            type: 'shared_reference',
            sharedNodeId: sharedNode.id,
            agentId: this.agentId,
            acceptedAt: Date.now(),
            trustScore: sharedNode.consensusScore
        };
        
        return await this.createNode(reference);
    }

    /**
     * Query insights specific to this agent
     */
    async queryInsights(concept) {
        return await this.searchByEmbedding(
            concept.embedding || await this.generateEmbedding(concept),
            {
                filter: { agentId: this.agentId }
            }
        );
    }

    async assessRelevance(node) {
        // Simplified relevance assessment
        return 0.8; // Placeholder
    }

    async assessTrust(contributors) {
        // Simplified trust assessment
        return 0.85; // Placeholder
    }

    async checkConsistency(node) {
        // Simplified consistency check
        return 0.9; // Placeholder
    }
}

/**
 * Knowledge Bridge between personal and shared graphs
 */
class KnowledgeBridge {
    constructor(sharedKG, personalKGs) {
        this.sharedKG = sharedKG;
        this.personalKGs = personalKGs;
        this.synthesisEngine = new KnowledgeSynthesisEngine();
    }

    /**
     * Synthesize collective insight from personal knowledge
     */
    async synthesizeCollectiveInsight(concept, contributingAgents) {
        // Gather personal insights
        const personalInsights = await Promise.all(
            contributingAgents.map(async agent => {
                const personalKG = await this.sharedKG.getPersonalGraph(agent.id);
                return await personalKG.queryInsights(concept);
            })
        );
        
        // Calculate agent expertise weights
        const weights = await this.calculateAgentExpertise(contributingAgents, concept);
        
        // Synthesize into collective understanding
        const synthesis = await this.synthesisEngine.synthesize({
            insights: personalInsights,
            weights,
            conflictResolution: 'weighted_consensus',
            preserveDiversity: true
        });
        
        // Store in shared KG with full attribution
        return await this.sharedKG.storeCollectiveInsight({
            ...synthesis,
            conceptId: concept.id,
            contributors: contributingAgents.map(a => a.id)
        });
    }

    /**
     * Calculate agent expertise for weighted synthesis
     */
    async calculateAgentExpertise(agents, concept) {
        const weights = {};
        
        for (const agent of agents) {
            // Factors: domain expertise, historical accuracy, contribution count
            let weight = 0.5; // Base weight
            
            // Domain expertise (simplified)
            if (agent.domains?.includes(concept.domain)) {
                weight += 0.2;
            }
            
            // Historical accuracy (if available)
            if (agent.accuracy) {
                weight += agent.accuracy * 0.2;
            }
            
            // Contribution count (up to 10% bonus)
            const contributions = agent.contributions || 0;
            weight += Math.min(0.1, contributions / 100);
            
            weights[agent.id] = weight;
        }
        
        return weights;
    }
}

/**
 * Consensus Engine for collaborative agreement
 */
class ConsensusEngine {
    constructor() {
        this.consensusRounds = [];
        this.metrics = {
            totalRounds: 0,
            successfulConsensus: 0,
            failedConsensus: 0,
            avgRoundsToConsensus: 0
        };
    }

    async initialize() {
        console.log('✅ Consensus Engine initialized');
    }

    /**
     * Achieve consensus among agents
     */
    async achieveConsensus(proposal, participants) {
        const round = {
            id: uuidv4(),
            proposal,
            participants: participants.map(p => p.id),
            votes: [],
            startTime: Date.now()
        };
        
        this.consensusRounds.push(round);
        this.metrics.totalRounds++;
        
        // Collect votes
        const votes = await Promise.all(
            participants.map(p => this.collectVote(p, proposal))
        );
        
        round.votes = votes;
        
        // Calculate consensus
        const consensus = this.calculateConsensus(votes);
        
        round.endTime = Date.now();
        round.consensus = consensus;
        
        if (consensus.achieved) {
            this.metrics.successfulConsensus++;
        } else {
            this.metrics.failedConsensus++;
        }
        
        return consensus;
    }

    /**
     * Collect vote from participant
     */
    async collectVote(participant, proposal) {
        // Simplified voting logic
        return {
            participantId: participant.id,
            support: Math.random() > 0.3, // Placeholder
            confidence: Math.random() * 0.5 + 0.5,
            reasoning: 'Evaluation based on agent criteria'
        };
    }

    /**
     * Calculate consensus from votes
     */
    calculateConsensus(votes) {
        const supporting = votes.filter(v => v.support);
        const supportRatio = supporting.length / votes.length;
        
        const avgConfidence = votes.reduce((sum, v) => sum + v.confidence, 0) / votes.length;
        
        return {
            achieved: supportRatio >= 0.66,
            score: supportRatio * avgConfidence,
            supportRatio,
            avgConfidence,
            dissenting: votes.filter(v => !v.support).map(v => v.participantId)
        };
    }

    getMetrics() {
        return this.metrics;
    }
}

/**
 * Knowledge Synthesis Engine
 */
class KnowledgeSynthesisEngine {
    /**
     * Synthesize multiple insights into collective understanding
     */
    async synthesize(options) {
        const { insights, weights, conflictResolution, preserveDiversity } = options;
        
        // Flatten and deduplicate insights
        const allInsights = insights.flat();
        const uniqueInsights = this.deduplicateInsights(allInsights);
        
        // Apply weights
        const weightedInsights = this.applyWeights(uniqueInsights, weights);
        
        // Resolve conflicts
        const resolved = await this.resolveConflicts(weightedInsights, conflictResolution);
        
        // Preserve diversity if requested
        const final = preserveDiversity ? 
            this.preserveDiverseViewpoints(resolved) : 
            resolved;
        
        return {
            content: final,
            confidence: this.calculateSynthesisConfidence(final, weights),
            method: conflictResolution,
            insightCount: uniqueInsights.length
        };
    }

    deduplicateInsights(insights) {
        const unique = new Map();
        for (const insight of insights) {
            const key = JSON.stringify(insight.content || insight);
            if (!unique.has(key)) {
                unique.set(key, insight);
            }
        }
        return Array.from(unique.values());
    }

    applyWeights(insights, weights) {
        return insights.map(insight => ({
            ...insight,
            weight: weights[insight.agentId] || 0.5
        }));
    }

    async resolveConflicts(insights, strategy) {
        // Simplified conflict resolution
        return insights.sort((a, b) => b.weight - a.weight);
    }

    preserveDiverseViewpoints(insights) {
        // Keep top insights but ensure diversity
        const diverse = [];
        const seen = new Set();
        
        for (const insight of insights) {
            const category = insight.category || 'default';
            if (!seen.has(category)) {
                diverse.push(insight);
                seen.add(category);
            }
        }
        
        return diverse;
    }

    calculateSynthesisConfidence(synthesis, weights) {
        const avgWeight = Object.values(weights).reduce((a, b) => a + b, 0) / Object.keys(weights).length;
        return Math.min(1, avgWeight * 1.2); // Boost for multiple confirmations
    }
}

export default SharedKnowledgeGraph;
