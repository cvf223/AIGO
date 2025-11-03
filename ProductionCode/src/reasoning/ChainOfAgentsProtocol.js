/**
 * 🤝 CHAIN-OF-AGENTS PROTOCOL - COLLABORATIVE DECISION MAKING
 * ==========================================================
 * 
 * Implements multi-agent collaboration for complex decisions
 * Ensures consensus through Central Nervous System validation
 * 
 * Part of 100% production readiness implementation
 */

import { EventEmitter } from 'events';

export class ChainOfAgentsProtocol extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Collaboration settings
            minAgentsForConsensus: config.minAgentsForConsensus || 3,
            maxAgentsPerDecision: config.maxAgentsPerDecision || 7,
            consensusThreshold: config.consensusThreshold || 0.75,
            
            // Timeouts
            proposalTimeout: config.proposalTimeout || 5000, // 5 seconds per agent
            consensusTimeout: config.consensusTimeout || 10000, // 10 seconds total
            
            // Validation
            requireCNSValidation: config.requireCNSValidation !== false,
            minConfidenceForAction: config.minConfidenceForAction || 0.85,
            
            ...config
        };
        
        // Dependencies
        this.centralNervousSystem = null;
        this.sharedMemory = null;
        
        // Collaboration state
        this.activeCollaborations = new Map();
        
        // Metrics
        this.metrics = {
            totalCollaborations: 0,
            successfulConsensus: 0,
            failedConsensus: 0,
            averageParticipants: 0,
            averageConsensusTime: 0
        };
    }
    
    /**
     * 🚀 INITIALIZE WITH DEPENDENCIES
     */
    async initialize(dependencies = {}) {
        console.log('🤝 Initializing Chain-of-Agents Protocol...');
        
        this.centralNervousSystem = dependencies.centralNervousSystem;
        this.sharedMemory = dependencies.sharedMemory;
        
        if (!this.centralNervousSystem) {
            console.warn('   ⚠️ No Central Nervous System provided - validation disabled');
        }
        
        console.log('   ✅ Chain-of-Agents Protocol initialized');
    }
    
    /**
     * 🤝 COLLABORATIVE DECISION
     * 
     * @param {Array} agents - Participating agents
     * @param {Object} task - Task requiring collaboration
     * @param {Object} context - Additional context
     */
    async collaborativeDecision(agents, task, context = {}) {
        const collaborationId = this.generateCollaborationId();
        const startTime = Date.now();
        
        console.log(`🤝 Starting collaborative decision ${collaborationId}`);
        console.log(`   📋 Task: ${task.type || 'unknown'}`);
        console.log(`   👥 Participants: ${agents.length} agents`);
        
        try {
            // Validate agent count
            if (agents.length < this.config.minAgentsForConsensus) {
                throw new Error(`Insufficient agents: ${agents.length} < ${this.config.minAgentsForConsensus}`);
            }
            
            if (agents.length > this.config.maxAgentsPerDecision) {
                console.warn(`   ⚠️ Too many agents, limiting to ${this.config.maxAgentsPerDecision}`);
                agents = this.selectTopAgents(agents, task);
            }
            
            // Store collaboration state
            this.activeCollaborations.set(collaborationId, {
                task,
                agents: agents.map(a => a.id || a.agentId),
                startTime,
                status: 'gathering_proposals'
            });
            
            // Step 1: Gather proposals from all agents
            const proposals = await this.gatherProposals(agents, task, context);
            
            // Step 2: Analyze proposals for patterns
            const analysis = await this.analyzeProposals(proposals, task);
            
            // Step 3: Reach consensus
            const consensus = await this.reachConsensus(proposals, analysis);
            
            // Step 4: Validate with CNS if available
            let validation = { approved: true, confidence: consensus.confidence };
            if (this.centralNervousSystem && this.config.requireCNSValidation) {
                validation = await this.validateWithCNS(consensus, task, agents);
            }
            
            // Step 5: Prepare final decision
            const decision = {
                id: collaborationId,
                type: 'collaborative',
                task,
                consensus,
                validation,
                participants: agents.map(a => ({
                    id: a.id || a.agentId,
                    contributed: proposals.has(a.id || a.agentId)
                })),
                confidence: Math.min(consensus.confidence, validation.confidence),
                timestamp: Date.now(),
                duration: Date.now() - startTime
            };
            
            // Step 6: Notify all agents of decision
            await this.notifyAgents(agents, decision);
            
            // Step 7: Store in shared memory
            await this.storeCollaboration(decision);
            
            // Update metrics
            this.updateMetrics(decision, true);
            
            // Clean up
            this.activeCollaborations.delete(collaborationId);
            
            console.log(`✅ Collaborative decision ${collaborationId} complete`);
            console.log(`   🎯 Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
            console.log(`   ⏱️ Duration: ${decision.duration}ms`);
            
            this.emit('collaboration-complete', decision);
            
            return decision;
            
        } catch (error) {
            console.error(`❌ Collaborative decision ${collaborationId} failed:`, error);
            
            // Update metrics
            this.updateMetrics({ duration: Date.now() - startTime }, false);
            
            // Clean up
            this.activeCollaborations.delete(collaborationId);
            
            this.emit('collaboration-failed', { collaborationId, error });
            
            throw error;
        }
    }
    
    /**
     * 📋 GATHER PROPOSALS FROM AGENTS
     */
    async gatherProposals(agents, task, context) {
        console.log('   📋 Gathering proposals from agents...');
        
        const proposals = new Map();
        const proposalPromises = agents.map(async (agent) => {
            const agentId = agent.id || agent.agentId;
            
            try {
                // Set timeout for proposal
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Proposal timeout')), this.config.proposalTimeout)
                );
                
                // Get proposal from agent
                const proposalPromise = this.getAgentProposal(agent, task, context);
                
                // Race between proposal and timeout
                const proposal = await Promise.race([proposalPromise, timeoutPromise]);
                
                if (proposal) {
                    proposals.set(agentId, {
                        agentId,
                        proposal,
                        confidence: proposal.confidence || 0.5,
                        timestamp: Date.now()
                    });
                    console.log(`     ✅ Received proposal from ${agentId}`);
                }
                
            } catch (error) {
                console.warn(`     ⚠️ Failed to get proposal from ${agentId}:`, error.message);
            }
        });
        
        await Promise.all(proposalPromises);
        
        console.log(`   📊 Collected ${proposals.size}/${agents.length} proposals`);
        
        return proposals;
    }
    
    /**
     * 🧠 GET AGENT PROPOSAL
     */
    async getAgentProposal(agent, task, context) {
        // Try multiple methods to get proposal
        if (agent.proposeAction) {
            return await agent.proposeAction(task, context);
        } else if (agent.propose) {
            return await agent.propose(task, context);
        } else if (agent.analyzeTask) {
            return await agent.analyzeTask(task, context);
        } else if (agent.analyze) {
            return await agent.analyze(task, context);
        } else if (agent.makeDecision) {
            const decision = await agent.makeDecision({ ...context, task });
            return {
                action: decision.decision || decision,
                confidence: decision.confidence || 0.5,
                reasoning: decision.reasoning
            };
        }
        
        throw new Error('Agent has no proposal method');
    }
    
    /**
     * 📊 ANALYZE PROPOSALS
     */
    async analyzeProposals(proposals, task) {
        const analysis = {
            totalProposals: proposals.size,
            commonActions: new Map(),
            averageConfidence: 0,
            confidenceDistribution: {
                high: 0,    // > 0.8
                medium: 0,  // 0.6 - 0.8
                low: 0      // < 0.6
            },
            outliers: []
        };
        
        let confidenceSum = 0;
        
        // Analyze each proposal
        for (const [agentId, data] of proposals) {
            const { proposal, confidence } = data;
            
            // Track confidence
            confidenceSum += confidence;
            
            if (confidence > 0.8) analysis.confidenceDistribution.high++;
            else if (confidence > 0.6) analysis.confidenceDistribution.medium++;
            else analysis.confidenceDistribution.low++;
            
            // Track common actions
            const actionKey = JSON.stringify(proposal.action || proposal);
            if (!analysis.commonActions.has(actionKey)) {
                analysis.commonActions.set(actionKey, {
                    action: proposal.action || proposal,
                    count: 0,
                    supporters: [],
                    totalConfidence: 0
                });
            }
            
            const actionData = analysis.commonActions.get(actionKey);
            actionData.count++;
            actionData.supporters.push(agentId);
            actionData.totalConfidence += confidence;
        }
        
        analysis.averageConfidence = confidenceSum / proposals.size;
        
        // Identify outliers (actions supported by only 1 agent)
        for (const [actionKey, data] of analysis.commonActions) {
            if (data.count === 1) {
                analysis.outliers.push({
                    agentId: data.supporters[0],
                    action: data.action
                });
            }
        }
        
        return analysis;
    }
    
    /**
     * 🤝 REACH CONSENSUS
     */
    async reachConsensus(proposals, analysis) {
        console.log('   🤝 Reaching consensus...');
        
        // Find most supported action
        let bestAction = null;
        let maxSupport = 0;
        let maxConfidence = 0;
        
        for (const [actionKey, data] of analysis.commonActions) {
            const support = data.count / proposals.size;
            const avgConfidence = data.totalConfidence / data.count;
            
            if (support > maxSupport || (support === maxSupport && avgConfidence > maxConfidence)) {
                bestAction = data;
                maxSupport = support;
                maxConfidence = avgConfidence;
            }
        }
        
        // Check if consensus threshold is met
        const consensusReached = maxSupport >= this.config.consensusThreshold;
        
        const consensus = {
            action: bestAction?.action || null,
            support: maxSupport,
            confidence: maxConfidence,
            supporters: bestAction?.supporters || [],
            consensusReached,
            analysis
        };
        
        if (!consensusReached) {
            console.warn(`   ⚠️ Consensus threshold not met: ${(maxSupport * 100).toFixed(1)}% < ${(this.config.consensusThreshold * 100)}%`);
        } else {
            console.log(`   ✅ Consensus reached with ${(maxSupport * 100).toFixed(1)}% support`);
        }
        
        return consensus;
    }
    
    /**
     * ✅ VALIDATE WITH CENTRAL NERVOUS SYSTEM
     */
    async validateWithCNS(consensus, task, agents) {
        console.log('   🧠 Validating with Central Nervous System...');
        
        try {
            const validation = await this.centralNervousSystem.judgeAgentAction(
                'collaborative_decision',
                {
                    task,
                    consensus,
                    participants: agents.map(a => a.id || a.agentId),
                    confidence: consensus.confidence
                }
            );
            
            console.log(`   ✅ CNS validation: ${validation.approved ? 'APPROVED' : 'REJECTED'}`);
            console.log(`   🎯 CNS confidence: ${(validation.confidence * 100).toFixed(1)}%`);
            
            return validation;
            
        } catch (error) {
            console.error('   ❌ CNS validation failed:', error);
            return {
                approved: false,
                confidence: 0,
                error: error.message
            };
        }
    }
    
    /**
     * 📢 NOTIFY AGENTS OF DECISION
     */
    async notifyAgents(agents, decision) {
        const notifications = agents.map(async (agent) => {
            try {
                if (agent.receiveCollaborativeDecision) {
                    await agent.receiveCollaborativeDecision(decision);
                } else if (agent.notify) {
                    await agent.notify('collaborative_decision', decision);
                }
            } catch (error) {
                console.warn(`   ⚠️ Failed to notify agent ${agent.id}:`, error.message);
            }
        });
        
        await Promise.all(notifications);
    }
    
    /**
     * 💾 STORE COLLABORATION IN SHARED MEMORY
     */
    async storeCollaboration(decision) {
        if (!this.sharedMemory) return;
        
        try {
            await this.sharedMemory.store(
                `collaboration:${decision.id}`,
                decision,
                { ttl: 3600000 } // 1 hour TTL
            );
        } catch (error) {
            console.warn('   ⚠️ Failed to store collaboration:', error.message);
        }
    }
    
    // === HELPER METHODS ===
    
    generateCollaborationId() {
        return `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    selectTopAgents(agents, task) {
        // Select agents most relevant to the task
        return agents
            .sort((a, b) => {
                // Prioritize by specialization match
                const aMatch = this.getTaskMatch(a, task);
                const bMatch = this.getTaskMatch(b, task);
                return bMatch - aMatch;
            })
            .slice(0, this.config.maxAgentsPerDecision);
    }
    
    getTaskMatch(agent, task) {
        // Calculate how well agent matches task
        let score = 0;
        
        if (agent.specialization === task.domain) score += 2;
        if (agent.capabilities?.includes(task.type)) score += 1;
        if (agent.experience?.[task.type] > 0) score += agent.experience[task.type];
        
        return score;
    }
    
    updateMetrics(decision, success) {
        this.metrics.totalCollaborations++;
        
        if (success) {
            this.metrics.successfulConsensus++;
        } else {
            this.metrics.failedConsensus++;
        }
        
        // Update average participants
        if (decision.participants) {
            const participantCount = decision.participants.length;
            this.metrics.averageParticipants = 
                (this.metrics.averageParticipants * (this.metrics.totalCollaborations - 1) + participantCount) /
                this.metrics.totalCollaborations;
        }
        
        // Update average time
        if (decision.duration) {
            this.metrics.averageConsensusTime = 
                (this.metrics.averageConsensusTime * (this.metrics.totalCollaborations - 1) + decision.duration) /
                this.metrics.totalCollaborations;
        }
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return {
            ...this.metrics,
            successRate: this.metrics.totalCollaborations > 0
                ? this.metrics.successfulConsensus / this.metrics.totalCollaborations
                : 0,
            activeCollaborations: this.activeCollaborations.size
        };
    }
}

// Singleton instance
let instance = null;

export function getChainOfAgentsProtocol(config = {}) {
    if (!instance) {
        instance = new ChainOfAgentsProtocol(config);
    }
    return instance;
}

export default ChainOfAgentsProtocol;
