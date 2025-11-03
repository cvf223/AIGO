/**
 * 🤝 INTER-AGENT COLLABORATION SYSTEM
 * ===================================
 *
 * REVOLUTIONARY FEATURE: Agents share tasks, learn from each other,
 * and dynamically adapt their weights based on collective intelligence!
 *
 * This is the breakthrough that transforms individual agents into
 * a COLLECTIVE INTELLIGENCE SYSTEM for competitive advantage.
 */
/**
 * 🧠 INTER-AGENT COLLABORATION MANAGER
 * =====================================
 *
 * Manages all inter-agent communication, task sharing, and collective learning.
 * This is where the magic happens - agents become smarter together!
 */
export class InterAgentCollaborationManager {
    constructor() {
        this.agents = new Map();
        this.activeTaskRequests = new Map();
        this.taskResponses = new Map();
        this.weightAdaptations = [];
        this.eventQueue = [];
        this.collaborationHistory = new Map();
        console.log('🤝 Inter-Agent Collaboration System initialized');
        this.startEventProcessor();
    }
    /**
     * 📝 REGISTER AGENT
     * =================
     * Register an agent with their capabilities and specializations
     */
    async registerAgent(capabilities) {
        this.agents.set(capabilities.agentId, capabilities);
        console.log(`✅ Agent registered: ${capabilities.agentName}`);
        console.log(`   Specializations: ${capabilities.specializations.join(', ')}`);
        console.log(`   Top capabilities: ${this.getTopCapabilities(capabilities.capabilities)}`);
        // Broadcast agent registration to other agents
        await this.broadcastEvent({
            eventId: `reg_${Date.now()}`,
            type: 'knowledge_share',
            sourceAgentId: capabilities.agentId,
            data: { type: 'agent_registration', capabilities },
            timestamp: new Date(),
            priority: 5
        });
    }
    /**
     * 📋 REQUEST TASK ASSISTANCE
     * ==========================
     * Agent requests help from other agents for a specific task
     */
    async requestTaskAssistance(taskRequest) {
        console.log(`📋 Task assistance requested by ${taskRequest.requestingAgentId}`);
        console.log(`   Task: ${taskRequest.description}`);
        console.log(`   Required capabilities: ${taskRequest.requiredCapabilities.join(', ')}`);
        this.activeTaskRequests.set(taskRequest.taskId, taskRequest);
        // Find suitable agents based on capabilities
        const suitableAgents = this.findSuitableAgents(taskRequest);
        console.log(`   Found ${suitableAgents.length} suitable agents`);
        // Send task request to suitable agents
        const responses = [];
        for (const agent of suitableAgents) {
            const response = await this.sendTaskRequest(agent, taskRequest);
            if (response) {
                responses.push(response);
            }
        }
        this.taskResponses.set(taskRequest.taskId, responses);
        // Trigger weight adaptation based on responses
        await this.analyzeTaskResponses(taskRequest, responses);
        return responses;
    }
    /**
     * 🎯 FIND SUITABLE AGENTS
     * =======================
     * Find agents best suited for a specific task based on capabilities
     */
    findSuitableAgents(taskRequest) {
        const suitable = [];
        for (const [agentId, agent] of this.agents) {
            // Skip the requesting agent
            if (agentId === taskRequest.requestingAgentId)
                continue;
            // Calculate suitability score
            let score = 0;
            let capabilityMatches = 0;
            for (const requiredCap of taskRequest.requiredCapabilities) {
                if (agent.capabilities[requiredCap]) {
                    score += agent.capabilities[requiredCap];
                    capabilityMatches++;
                }
            }
            // Bonus for having all required capabilities
            if (capabilityMatches === taskRequest.requiredCapabilities.length) {
                score *= 1.5;
            }
            // Factor in current load (prefer less busy agents)
            score *= (100 - agent.currentLoad) / 100;
            // Factor in success rate
            score *= agent.successRate / 100;
            // Factor in response time (prefer faster agents)
            score *= Math.max(0.1, 1 - (agent.responseTime / 10000));
            if (score > 30) { // Minimum threshold
                suitable.push({ agent, score });
            }
        }
        // Sort by score (highest first) and return top agents
        return suitable
            .sort((a, b) => b.score - a.score)
            .slice(0, 5) // Top 5 agents
            .map(item => item.agent);
    }
    /**
     * 📤 SEND TASK REQUEST
     * ===================
     * Send task request to a specific agent and get response
     */
    async sendTaskRequest(agent, taskRequest) {
        try {
            // Simulate agent evaluation of task
            const confidence = this.calculateTaskConfidence(agent, taskRequest);
            const estimatedTime = this.estimateTaskTime(agent, taskRequest);
            const riskAssessment = this.assessTaskRisk(agent, taskRequest);
            if (confidence < 40) {
                return null; // Agent declines task
            }
            const response = {
                taskId: taskRequest.taskId,
                respondingAgentId: agent.agentId,
                canHandle: true,
                confidence,
                estimatedTime,
                proposedApproach: this.generateProposedApproach(agent, taskRequest),
                requiredResources: this.identifyRequiredResources(agent, taskRequest),
                riskAssessment
            };
            console.log(`   ✅ ${agent.agentName} responded: ${confidence}% confidence, ${estimatedTime}ms estimated`);
            return response;
        }
        catch (error) {
            console.error(`   ❌ Error getting response from ${agent.agentName}:`, error);
            return null;
        }
    }
    /**
     * 🧠 DYNAMIC WEIGHT ADAPTATION
     * ============================
     * The EVOLUTION feature! Agents adapt their weights based on learning
     */
    async adaptAgentWeights(agentId, learningData) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return [];
        const adaptations = [];
        // Analyze learning data and adapt weights
        if (learningData.taskSuccess) {
            // Increase weights for capabilities that led to success
            for (const capability of learningData.usedCapabilities) {
                const oldWeight = agent.capabilities[capability] || 0;
                const learningRate = parseFloat(process.env.WEIGHT_LEARNING_RATE || '0.1');
                const newWeight = Math.min(100, oldWeight + (learningRate * 10));
                if (Math.abs(newWeight - oldWeight) > parseFloat(process.env.WEIGHT_ADAPTATION_THRESHOLD || '0.05')) {
                    agent.capabilities[capability] = newWeight;
                    const adaptation = {
                        agentId,
                        capability,
                        oldWeight,
                        newWeight,
                        reason: `Task success improved ${capability} confidence`,
                        evidence: learningData,
                        timestamp: new Date(),
                        learningSource: 'self'
                    };
                    adaptations.push(adaptation);
                    this.weightAdaptations.push(adaptation);
                    console.log(`🧠 ${agent.agentName} adapted ${capability}: ${oldWeight.toFixed(1)} → ${newWeight.toFixed(1)}`);
                }
            }
        }
        // Learn from other agents' successes
        await this.learnFromPeerSuccesses(agentId, learningData);
        return adaptations;
    }
    /**
     * 👥 LEARN FROM PEER SUCCESSES
     * ============================
     * Agents learn from other agents' successful strategies and adapt accordingly
     */
    async learnFromPeerSuccesses(agentId, learningData) {
        const agent = this.agents.get(agentId);
        if (!agent)
            return;
        // Find similar successful tasks by other agents
        const similarSuccesses = this.findSimilarSuccessfulTasks(learningData);
        for (const success of similarSuccesses) {
            const peerAgent = this.agents.get(success.agentId);
            if (!peerAgent || peerAgent.agentId === agentId)
                continue;
            // Adapt weights based on peer's successful capabilities
            for (const [capability, peerWeight] of Object.entries(peerAgent.capabilities)) {
                const currentWeight = agent.capabilities[capability] || 0;
                // If peer has significantly higher weight and success, learn from them
                if (peerWeight > currentWeight + 10) {
                    const learningRate = parseFloat(process.env.WEIGHT_LEARNING_RATE || '0.1');
                    const adaptationAmount = (peerWeight - currentWeight) * learningRate * 0.5; // 50% of peer learning
                    const newWeight = Math.min(100, currentWeight + adaptationAmount);
                    if (Math.abs(newWeight - currentWeight) > parseFloat(process.env.WEIGHT_ADAPTATION_THRESHOLD || '0.05')) {
                        agent.capabilities[capability] = newWeight;
                        const adaptation = {
                            agentId,
                            capability,
                            oldWeight: currentWeight,
                            newWeight,
                            reason: `Learned from ${peerAgent.agentName}'s success in ${capability}`,
                            evidence: { peerSuccess: success, peerWeight },
                            timestamp: new Date(),
                            learningSource: 'peer'
                        };
                        this.weightAdaptations.push(adaptation);
                        console.log(`👥 ${agent.agentName} learned from ${peerAgent.agentName}: ${capability} ${currentWeight.toFixed(1)} → ${newWeight.toFixed(1)}`);
                    }
                }
            }
        }
    }
    /**
     * 🌐 COLLECTIVE INTELLIGENCE ANALYSIS
     * ===================================
     * Analyze collective performance and identify system-wide improvements
     */
    async performCollectiveIntelligenceAnalysis() {
        console.log('🌐 Performing collective intelligence analysis...');
        const analysis = {
            totalAgents: this.agents.size,
            averageCapabilities: this.calculateAverageCapabilities(),
            topPerformers: this.identifyTopPerformers(),
            learningTrends: this.analyzeLearningTrends(),
            collaborationEfficiency: this.calculateCollaborationEfficiency(),
            systemRecommendations: []
        };
        // Generate system-wide recommendations
        analysis.systemRecommendations = this.generateSystemRecommendations(analysis);
        console.log(`   📊 Average system capability: ${analysis.averageCapabilities.overall.toFixed(1)}%`);
        console.log(`   🏆 Top performer: ${analysis.topPerformers[0]?.agentName || 'None'}`);
        console.log(`   📈 Learning adaptations: ${this.weightAdaptations.length}`);
        console.log(`   🤝 Collaboration efficiency: ${analysis.collaborationEfficiency.toFixed(1)}%`);
        return analysis;
    }
    /**
     * 📡 EVENT PROCESSING SYSTEM
     * ==========================
     * Process collaboration events in real-time
     */
    startEventProcessor() {
        setInterval(() => {
            this.processEventQueue();
        }, 1000); // Process events every second
    }
    async processEventQueue() {
        if (this.eventQueue.length === 0)
            return;
        // Sort events by priority (highest first)
        this.eventQueue.sort((a, b) => b.priority - a.priority);
        const event = this.eventQueue.shift();
        if (!event)
            return;
        try {
            await this.processEvent(event);
        }
        catch (error) {
            console.error('❌ Error processing collaboration event:', error);
        }
    }
    async processEvent(event) {
        switch (event.type) {
            case 'task_request':
                await this.handleTaskRequestEvent(event);
                break;
            case 'task_response':
                await this.handleTaskResponseEvent(event);
                break;
            case 'weight_adaptation':
                await this.handleWeightAdaptationEvent(event);
                break;
            case 'knowledge_share':
                await this.handleKnowledgeShareEvent(event);
                break;
            case 'help_request':
                await this.handleHelpRequestEvent(event);
                break;
        }
    }
    /**
     * 📊 COLLABORATION ANALYTICS
     * ==========================
     * Generate comprehensive collaboration statistics and insights
     */
    async getCollaborationAnalytics() {
        return {
            totalAgents: this.agents.size,
            activeTaskRequests: this.activeTaskRequests.size,
            completedTasks: this.taskResponses.size,
            weightAdaptations: this.weightAdaptations.length,
            averageResponseTime: this.calculateAverageResponseTime(),
            collaborationSuccess: this.calculateCollaborationSuccessRate(),
            topCollaborators: this.identifyTopCollaborators(),
            learningVelocity: this.calculateLearningVelocity(),
            systemEvolution: this.trackSystemEvolution()
        };
    }
    /**
     * 🔄 BROADCAST EVENT
     * ==================
     * Send event to all agents or specific target
     */
    async broadcastEvent(event) {
        this.eventQueue.push(event);
        // Store event in collaboration history
        const sourceHistory = this.collaborationHistory.get(event.sourceAgentId) || [];
        sourceHistory.push(event);
        this.collaborationHistory.set(event.sourceAgentId, sourceHistory);
    }
    // Helper Methods
    getTopCapabilities(capabilities) {
        return Object.entries(capabilities)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([cap, weight]) => `${cap}(${weight.toFixed(1)}%)`)
            .join(', ');
    }
    calculateTaskConfidence(agent, task) {
        let confidence = 0;
        let totalRequired = 0;
        for (const capability of task.requiredCapabilities) {
            const agentCapability = agent.capabilities[capability] || 0;
            confidence += agentCapability;
            totalRequired += 100; // Max possible
        }
        const baseConfidence = totalRequired > 0 ? (confidence / totalRequired) * 100 : 0;
        // Adjust based on agent's success rate and current load
        return Math.min(100, baseConfidence * (agent.successRate / 100) * ((100 - agent.currentLoad) / 100));
    }
    estimateTaskTime(agent, task) {
        const baseTime = task.estimatedDuration;
        const complexityMultiplier = task.complexity / 5; // Normalize complexity
        const capabilityMultiplier = this.calculateTaskConfidence(agent, task) / 100;
        return Math.round(baseTime * complexityMultiplier * (2 - capabilityMultiplier));
    }
    assessTaskRisk(agent, task) {
        const capabilityRisk = 100 - this.calculateTaskConfidence(agent, task);
        const complexityRisk = task.complexity * 10;
        const loadRisk = agent.currentLoad;
        return Math.min(100, (capabilityRisk + complexityRisk + loadRisk) / 3);
    }
    generateProposedApproach(agent, task) {
        const topCapabilities = Object.entries(agent.capabilities)
            .filter(([cap]) => task.requiredCapabilities.includes(cap))
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([cap]) => cap);
        return `Leverage ${topCapabilities.join(' and ')} specialization with ${task.complexity > 7 ? 'careful' : 'efficient'} execution approach`;
    }
    identifyRequiredResources(agent, task) {
        const resources = ['computational_power'];
        if (task.complexity > 7)
            resources.push('extended_processing_time');
        if (task.requiredCapabilities.includes('blockchain_analysis'))
            resources.push('rpc_access');
        if (task.requiredCapabilities.includes('market_research'))
            resources.push('data_feeds');
        return resources;
    }
    findSimilarSuccessfulTasks(learningData) {
        // Mock implementation - in real system, this would query historical data
        return [
            { agentId: 'agent_2', taskType: learningData.taskType, success: true, capabilities: ['arbitrage_detection', 'gas_optimization'] },
            { agentId: 'agent_3', taskType: learningData.taskType, success: true, capabilities: ['market_analysis', 'risk_assessment'] }
        ];
    }
    calculateAverageCapabilities() {
        const allCapabilities = {};
        for (const agent of this.agents.values()) {
            for (const [cap, weight] of Object.entries(agent.capabilities)) {
                if (!allCapabilities[cap])
                    allCapabilities[cap] = [];
                allCapabilities[cap].push(weight);
            }
        }
        const averages = {};
        let totalAverage = 0;
        let capCount = 0;
        for (const [cap, weights] of Object.entries(allCapabilities)) {
            const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
            averages[cap] = avg;
            totalAverage += avg;
            capCount++;
        }
        return {
            ...averages,
            overall: capCount > 0 ? totalAverage / capCount : 0
        };
    }
    identifyTopPerformers() {
        return Array.from(this.agents.values())
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 3);
    }
    analyzeLearningTrends() {
        const recentAdaptations = this.weightAdaptations
            .filter(a => Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000) // Last 24 hours
            .length;
        return {
            recentAdaptations,
            learningVelocity: recentAdaptations / 24, // adaptations per hour
            topLearningCapabilities: this.getTopLearningCapabilities()
        };
    }
    getTopLearningCapabilities() {
        const capabilityChanges = {};
        for (const adaptation of this.weightAdaptations) {
            capabilityChanges[adaptation.capability] = (capabilityChanges[adaptation.capability] || 0) + 1;
        }
        return Object.entries(capabilityChanges)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([cap]) => cap);
    }
    calculateCollaborationEfficiency() {
        const totalRequests = this.activeTaskRequests.size + this.taskResponses.size;
        const successfulCollaborations = Array.from(this.taskResponses.values())
            .filter(responses => responses.some(r => r.confidence > 70))
            .length;
        return totalRequests > 0 ? (successfulCollaborations / totalRequests) * 100 : 0;
    }
    generateSystemRecommendations(analysis) {
        const recommendations = [];
        if (analysis.averageCapabilities.overall < 70) {
            recommendations.push('Consider additional training for underperforming capabilities');
        }
        if (analysis.collaborationEfficiency < 80) {
            recommendations.push('Improve task routing algorithms for better agent matching');
        }
        if (this.weightAdaptations.length < this.agents.size * 5) {
            recommendations.push('Increase learning opportunities to accelerate capability development');
        }
        return recommendations;
    }
    calculateAverageResponseTime() {
        const responseTimes = Array.from(this.agents.values()).map(a => a.responseTime);
        return responseTimes.length > 0 ? responseTimes.reduce((sum, rt) => sum + rt, 0) / responseTimes.length : 0;
    }
    calculateCollaborationSuccessRate() {
        return this.calculateCollaborationEfficiency(); // Same calculation for now
    }
    identifyTopCollaborators() {
        const collaborationCounts = {};
        for (const responses of this.taskResponses.values()) {
            for (const response of responses) {
                collaborationCounts[response.respondingAgentId] = (collaborationCounts[response.respondingAgentId] || 0) + 1;
            }
        }
        return Object.entries(collaborationCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([agentId, count]) => ({ agentId, collaborationCount: count }));
    }
    calculateLearningVelocity() {
        const recentAdaptations = this.weightAdaptations
            .filter(a => Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000)
            .length;
        return recentAdaptations / Math.max(1, this.agents.size); // adaptations per agent per day
    }
    trackSystemEvolution() {
        return {
            totalAdaptations: this.weightAdaptations.length,
            averageWeightChange: this.calculateAverageWeightChange(),
            evolutionTrend: this.calculateEvolutionTrend()
        };
    }
    calculateAverageWeightChange() {
        if (this.weightAdaptations.length === 0)
            return 0;
        const totalChange = this.weightAdaptations
            .reduce((sum, adaptation) => sum + Math.abs(adaptation.newWeight - adaptation.oldWeight), 0);
        return totalChange / this.weightAdaptations.length;
    }
    calculateEvolutionTrend() {
        const recentAdaptations = this.weightAdaptations
            .filter(a => Date.now() - a.timestamp.getTime() < 24 * 60 * 60 * 1000);
        if (recentAdaptations.length === 0)
            return 'stable';
        const positiveChanges = recentAdaptations
            .filter(a => a.newWeight > a.oldWeight)
            .length;
        const ratio = positiveChanges / recentAdaptations.length;
        if (ratio > 0.7)
            return 'rapidly_improving';
        if (ratio > 0.5)
            return 'improving';
        if (ratio > 0.3)
            return 'mixed';
        return 'declining';
    }
    // Event handlers
    async handleTaskRequestEvent(event) {
        console.log(`📋 Processing task request event from ${event.sourceAgentId}`);
    }
    async handleTaskResponseEvent(event) {
        console.log(`📤 Processing task response event from ${event.sourceAgentId}`);
    }
    async handleWeightAdaptationEvent(event) {
        console.log(`🧠 Processing weight adaptation event from ${event.sourceAgentId}`);
    }
    async handleKnowledgeShareEvent(event) {
        console.log(`🔄 Processing knowledge share event from ${event.sourceAgentId}`);
    }
    async handleHelpRequestEvent(event) {
        console.log(`🆘 Processing help request event from ${event.sourceAgentId}`);
    }
    async analyzeTaskResponses(taskRequest, responses) {
        // Analyze responses and trigger learning adaptations
        for (const response of responses) {
            if (response.confidence > 80) {
                // High confidence response - learn from this agent's capabilities
                await this.adaptAgentWeights(response.respondingAgentId, {
                    taskSuccess: true,
                    usedCapabilities: taskRequest.requiredCapabilities,
                    taskType: taskRequest.taskType,
                    confidence: response.confidence
                });
            }
        }
    }
}
// Export singleton instance
export const collaborationManager = new InterAgentCollaborationManager();
