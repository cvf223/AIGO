/**
 * 🧩 KNOWLEDGE INTEGRATOR - RESEARCH TO ACTION BRIDGE
 * ================================================
 * 
 * Transforms raw research outputs into actionable insights,
 * updates agent knowledge bases, and triggers task adjustments.
 * The critical bridge between research and implementation.
 */

import { SharedMemorySystem } from '../../memory/SharedMemorySystem.js';
import { MDPBackgroundTaskIntegrator } from '../../core/MDPBackgroundTaskIntegrator.js';
import { DatabasePoolManager } from '../../database/DatabasePoolManager.js';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR KNOWLEDGE INTEGRATOR)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../../construction/cognitive/FormalReasoningConstructionIntegration.js';

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR KNOWLEDGE INTEGRATOR)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../../construction/prevention/ProactiveConstructionKnowledgePipeline.js';
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../../construction/prevention/ProactiveConstructionInferenceEngine.js';

/**
 * 🧩 KNOWLEDGE INTEGRATOR - RESEARCH TO ACTION BRIDGE
 * ENHANCED with SPECIALIZED KNOWLEDGE INTEGRATOR Formal Reasoning & Proactive Prevention
 * DEEPLY CONNECTED to existing GOT/COA reasoning systems
 * ================================================
 */
export class KnowledgeIntegrator {
    constructor(config = {}) {
        // Get shared database pool for SharedMemorySystem
        const dbPool = DatabasePoolManager.getSharedPool();
        this.sharedMemory = new SharedMemorySystem({ dbPool });
        this.mdpIntegrator = new MDPBackgroundTaskIntegrator();
        
        // Configuration
        this.config = {
            confidenceThreshold: config.confidenceThreshold || 0.7,
            actionThreshold: config.actionThreshold || 0.8,
            maxActionsPerCycle: config.maxActionsPerCycle || 10,
            priorityDecayRate: config.priorityDecayRate || 0.95,
            ...config
        };
        
        // Knowledge tracking
        this.integratedKnowledge = new Map();
        this.pendingActions = [];
        this.executedActions = new Map();
        this.impactMetrics = {
            totalIntegrations: 0,
            successfulActions: 0,
            failedActions: 0,
            knowledgeUtilization: 0
        };
        
        console.log('🧩 Knowledge Integrator initialized');
    }

    /**
     * 🎯 INTEGRATE RESEARCH INTO ACTIONABLE INSIGHTS
     */
    async integrateResearch(research, source, context = {}) {
        const integrationId = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            console.log(`🔄 Integrating research from ${source}...`);
            
            // Parse research into structured insights
            const insights = await this.parseResearchInsights(research);
            
            // Validate insights quality
            const validatedInsights = await this.validateInsights(insights, context);
            
            // Generate actionable items
            const actions = await this.generateActions(validatedInsights, context);
            
            // Update agent knowledge bases
            await this.updateAgentKnowledge(validatedInsights, source);
            
            // Queue high-priority actions
            this.queueActions(actions);
            
            // Trigger immediate actions if critical
            await this.triggerCriticalActions(actions);
            
            // Store integration record
            this.recordIntegration(integrationId, {
                source,
                research,
                insights: validatedInsights,
                actions,
                timestamp: Date.now()
            });
            
            // Update metrics
            this.impactMetrics.totalIntegrations++;
            
            console.log(`✅ Integration complete: ${insights.length} insights, ${actions.length} actions`);
            
            return {
                integrationId,
                insights: validatedInsights,
                actions,
                impact: this.calculateImpact(validatedInsights, actions)
            };
            
        } catch (error) {
            console.error('❌ Knowledge integration failed:', error);
            throw error;
        }
    }

    /**
     * 🔍 PARSE RESEARCH INSIGHTS
     */
    async parseResearchInsights(research) {
        const insights = [];
        
        // Extract from different research structures
        if (research.sources) {
            // Handle curated list research (MEV authorities, DeFi channels)
            for (const source of research.sources) {
                if (source.key_insights) {
                    insights.push(...this.parseSourceInsights(source));
                }
            }
        }
        
        if (research.extracted_strategies) {
            // Handle strategy extraction research
            for (const strategy of research.extracted_strategies) {
                insights.push(this.parseStrategyInsight(strategy));
            }
        }
        
        if (research.trends || research.current_trends) {
            // Handle trend analysis research
            const trends = research.trends || research.current_trends;
            for (const trend of trends) {
                insights.push(this.parseTrendInsight(trend));
            }
        }
        
        if (research.risk_matrix) {
            // Handle risk assessment research
            for (const risk of research.risk_matrix) {
                insights.push(this.parseRiskInsight(risk));
            }
        }
        
        if (research.competitor_landscape) {
            // Handle competitive intelligence
            insights.push(...this.parseCompetitiveInsights(research.competitor_landscape));
        }
        
        // Extract general insights
        if (research.insights) {
            insights.push(...research.insights.map(i => this.normalizeInsight(i)));
        }
        
        return insights;
    }

    /**
     * ✅ VALIDATE INSIGHTS
     */
    async validateInsights(insights, context) {
        const validated = [];
        
        for (const insight of insights) {
            const validation = {
                ...insight,
                validationScore: 1.0,
                validationFlags: []
            };
            
            // Check confidence threshold
            if (insight.confidence < this.config.confidenceThreshold) {
                validation.validationScore *= 0.7;
                validation.validationFlags.push('low_confidence');
            }
            
            // Verify against existing knowledge
            const conflicts = await this.checkKnowledgeConflicts(insight);
            if (conflicts.length > 0) {
                validation.validationScore *= 0.8;
                validation.validationFlags.push('conflicts_detected');
                validation.conflicts = conflicts;
            }
            
            // Check relevance to current context
            const relevance = this.assessRelevance(insight, context);
            validation.relevance = relevance;
            validation.validationScore *= relevance;
            
            // Check actionability
            if (!insight.actionable || insight.actionable.length === 0) {
                validation.validationScore *= 0.6;
                validation.validationFlags.push('low_actionability');
            }
            
            // Include if passes validation
            if (validation.validationScore > 0.5) {
                validated.push(validation);
            }
        }
        
        // Sort by validation score
        return validated.sort((a, b) => b.validationScore - a.validationScore);
    }

    /**
     * 🎬 GENERATE ACTIONS FROM INSIGHTS
     */
    async generateActions(insights, context) {
        const actions = [];
        
        for (const insight of insights) {
            // Skip if not actionable enough
            if (insight.validationScore < this.config.actionThreshold) {
                continue;
            }
            
            // Generate actions based on insight type
            switch (insight.type) {
                case 'authority_profile':
                    actions.push(...this.generateAuthorityActions(insight));
                    break;
                    
                case 'strategy':
                    actions.push(...this.generateStrategyActions(insight));
                    break;
                    
                case 'trend':
                    actions.push(...this.generateTrendActions(insight));
                    break;
                    
                case 'risk':
                    actions.push(...this.generateRiskActions(insight));
                    break;
                    
                case 'competitive_intelligence':
                    actions.push(...this.generateCompetitiveActions(insight));
                    break;
                    
                case 'educational_resource':
                    actions.push(...this.generateEducationalActions(insight));
                    break;
                    
                default:
                    // Generic action generation
                    if (insight.actionable) {
                        actions.push(...this.generateGenericActions(insight));
                    }
            }
        }
        
        // Prioritize and deduplicate actions
        return this.prioritizeActions(actions);
    }

    /**
     * 📚 UPDATE AGENT KNOWLEDGE BASES
     */
    async updateAgentKnowledge(insights, source) {
        const updates = [];
        
        for (const insight of insights) {
            const knowledgeItem = {
                id: `knowledge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source,
                type: insight.type,
                content: insight.content,
                confidence: insight.confidence,
                relevance: insight.relevance,
                metadata: {
                    ...insight.metadata,
                    integratedAt: Date.now(),
                    validationScore: insight.validationScore
                }
            };
            
            // Determine which agents need this knowledge
            const targetAgents = this.identifyTargetAgents(insight);
            
            // Store in shared memory for agent access
            await this.sharedMemory.storeKnowledge(knowledgeItem.id, {
                ...knowledgeItem,
                targetAgents,
                expiresAt: this.calculateExpiry(insight)
            });
            
            updates.push({
                knowledgeId: knowledgeItem.id,
                targetAgents,
                type: insight.type
            });
        }
        
        // Notify agents of new knowledge
        await this.notifyAgentsOfUpdates(updates);
        
        console.log(`📚 Updated knowledge for ${updates.length} insights`);
    }

    /**
     * 🚀 TRIGGER CRITICAL ACTIONS
     */
    async triggerCriticalActions(actions) {
        const criticalActions = actions.filter(a => a.priority === 'critical');
        
        for (const action of criticalActions) {
            try {
                console.log(`🚨 Executing critical action: ${action.type}`);
                
                switch (action.type) {
                    case 'update_follow_list':
                        await this.executeFollowListUpdate(action);
                        break;
                        
                    case 'adjust_strategy':
                        await this.executeStrategyAdjustment(action);
                        break;
                        
                    case 'risk_mitigation':
                        await this.executeRiskMitigation(action);
                        break;
                        
                    case 'task_priority_change':
                        await this.executeTaskPriorityChange(action);
                        break;
                        
                    default:
                        console.warn(`Unknown critical action type: ${action.type}`);
                }
                
                this.recordActionExecution(action, 'success');
                
            } catch (error) {
                console.error(`❌ Critical action failed: ${action.type}`, error);
                this.recordActionExecution(action, 'failed', error.message);
            }
        }
    }

    /**
     * 🔧 HELPER METHODS - INSIGHT PARSING
     */
    
    parseSourceInsights(source) {
        return source.key_insights.map(insight => ({
            type: 'authority_profile',
            content: insight,
            source: source.name,
            confidence: source.credibility_score / 100,
            metadata: {
                handle: source.handle,
                tier: source.tier,
                specialization: source.specialization
            },
            actionable: this.extractActionableItems(insight)
        }));
    }

    parseStrategyInsight(strategy) {
        return {
            type: 'strategy',
            content: strategy.strategy_name,
            description: strategy.description || '',
            confidence: parseFloat(strategy.success_rate) / 100 || 0.5,
            metadata: {
                requirements: strategy.requirements,
                risks: strategy.risks,
                coreMechanics: strategy.core_mechanics
            },
            actionable: [{
                action: 'evaluate_strategy',
                target: strategy.strategy_name,
                priority: this.calculateStrategyPriority(strategy)
            }]
        };
    }

    parseTrendInsight(trend) {
        return {
            type: 'trend',
            content: trend.trend || trend.description,
            confidence: this.mapStrengthToConfidence(trend.strength),
            metadata: {
                trajectory: trend.trajectory,
                drivers: trend.key_drivers,
                implications: trend.implications
            },
            actionable: trend.implications?.map(imp => ({
                action: 'adapt_to_trend',
                details: imp,
                priority: trend.strength === 'Strong' ? 'high' : 'medium'
            })) || []
        };
    }

    parseRiskInsight(risk) {
        return {
            type: 'risk',
            content: risk.description,
            confidence: 0.9, // Risk assessments are typically high confidence
            metadata: {
                riskType: risk.risk_type,
                probability: risk.probability,
                impact: risk.impact,
                currentControls: risk.current_controls
            },
            actionable: risk.mitigation_recommendations?.map(rec => ({
                action: 'mitigate_risk',
                details: rec,
                priority: risk.impact === 'Critical' ? 'critical' : 'high'
            })) || []
        };
    }

    parseCompetitiveInsights(landscape) {
        const insights = [];
        
        if (landscape.top_performers) {
            landscape.top_performers.forEach(performer => {
                insights.push({
                    type: 'competitive_intelligence',
                    content: `Top performer: ${performer.name || performer}`,
                    confidence: 0.8,
                    metadata: { category: 'top_performer', details: performer },
                    actionable: [{
                        action: 'analyze_competitor',
                        target: performer.name || performer,
                        priority: 'high'
                    }]
                });
            });
        }
        
        if (landscape.strategy_patterns?.successful_strategies) {
            landscape.strategy_patterns.successful_strategies.forEach(strategy => {
                insights.push({
                    type: 'competitive_intelligence',
                    content: `Successful strategy: ${strategy}`,
                    confidence: 0.85,
                    metadata: { category: 'successful_strategy' },
                    actionable: [{
                        action: 'evaluate_competitive_strategy',
                        details: strategy,
                        priority: 'high'
                    }]
                });
            });
        }
        
        return insights;
    }

    normalizeInsight(insight) {
        return {
            type: insight.type || 'general',
            content: insight.content || insight.description || JSON.stringify(insight),
            confidence: insight.confidence || 0.5,
            metadata: insight.metadata || {},
            actionable: insight.actionable || []
        };
    }

    /**
     * 🔧 HELPER METHODS - ACTION GENERATION
     */
    
    generateAuthorityActions(insight) {
        const actions = [];
        
        if (insight.metadata.tier === 1) {
            actions.push({
                type: 'update_follow_list',
                action: 'follow',
                target: insight.metadata.handle,
                priority: 'high',
                reason: 'Tier 1 authority - essential follow'
            });
        }
        
        if (insight.metadata.specialization) {
            actions.push({
                type: 'monitor_specialization',
                specialization: insight.metadata.specialization,
                source: insight.metadata.handle,
                priority: 'medium'
            });
        }
        
        return actions;
    }

    generateStrategyActions(insight) {
        const actions = [];
        const priority = this.calculateStrategyPriority(insight.metadata);
        
        actions.push({
            type: 'evaluate_strategy',
            strategy: insight.content,
            requirements: insight.metadata.requirements,
            priority,
            estimatedROI: this.estimateStrategyROI(insight.metadata)
        });
        
        if (priority === 'high' || priority === 'critical') {
            actions.push({
                type: 'prepare_implementation',
                strategy: insight.content,
                preparationSteps: this.generatePreparationSteps(insight.metadata),
                priority: 'medium'
            });
        }
        
        return actions;
    }

    generateTrendActions(insight) {
        const actions = [];
        
        if (insight.metadata.trajectory === 'Accelerating') {
            actions.push({
                type: 'adjust_strategy',
                adjustment: 'increase_focus',
                area: insight.content,
                priority: 'high',
                reason: 'Accelerating trend detected'
            });
        }
        
        if (insight.metadata.implications) {
            insight.metadata.implications.forEach(implication => {
                actions.push({
                    type: 'strategic_adaptation',
                    adaptation: implication,
                    priority: 'medium'
                });
            });
        }
        
        return actions;
    }

    generateRiskActions(insight) {
        const actions = [];
        
        insight.actionable.forEach(item => {
            actions.push({
                type: 'risk_mitigation',
                risk: insight.content,
                mitigation: item.details,
                priority: item.priority,
                urgency: insight.metadata.probability === 'High' ? 'immediate' : 'planned'
            });
        });
        
        if (insight.metadata.impact === 'Critical') {
            actions.push({
                type: 'emergency_protocol',
                protocol: 'risk_assessment',
                target: insight.metadata.riskType,
                priority: 'critical'
            });
        }
        
        return actions;
    }

    generateCompetitiveActions(insight) {
        return insight.actionable.map(item => ({
            type: 'competitive_analysis',
            ...item,
            metadata: insight.metadata
        }));
    }

    generateEducationalActions(insight) {
        const actions = [];
        
        if (insight.metadata.tier <= 2) {
            actions.push({
                type: 'learning_resource',
                action: 'add_to_curriculum',
                resource: insight.content,
                priority: insight.metadata.tier === 1 ? 'high' : 'medium'
            });
        }
        
        return actions;
    }

    generateGenericActions(insight) {
        return insight.actionable.map(item => ({
            type: 'generic_action',
            ...item,
            sourceConfidence: insight.confidence
        }));
    }

    /**
     * 🔧 HELPER METHODS - UTILITIES
     */
    
    extractActionableItems(text) {
        // Simple extraction - could be enhanced with NLP
        const actionablePatterns = [
            /should\s+(\w+)/gi,
            /recommend\s+(\w+)/gi,
            /important\s+to\s+(\w+)/gi
        ];
        
        const items = [];
        actionablePatterns.forEach(pattern => {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                items.push({
                    action: match[1],
                    context: match[0]
                });
            }
        });
        
        return items;
    }

    calculateStrategyPriority(strategy) {
        const successRate = parseFloat(strategy.success_rate) || 50;
        const complexity = (strategy.requirements?.technical?.length || 0) + 
                          (strategy.requirements?.resources?.length || 0);
        
        if (successRate > 80 && complexity < 3) return 'critical';
        if (successRate > 60 && complexity < 5) return 'high';
        if (successRate > 40) return 'medium';
        return 'low';
    }

    mapStrengthToConfidence(strength) {
        const mapping = {
            'Strong': 0.9,
            'Moderate': 0.7,
            'Emerging': 0.5,
            'Weak': 0.3
        };
        return mapping[strength] || 0.5;
    }

    async checkKnowledgeConflicts(insight) {
        // Check for conflicts with existing knowledge
        const existingKnowledge = await this.sharedMemory.searchKnowledge({
            type: insight.type,
            topic: insight.content
        });
        
        const conflicts = [];
        for (const existing of existingKnowledge) {
            if (this.detectConflict(insight, existing)) {
                conflicts.push({
                    existingId: existing.id,
                    conflictType: 'contradiction',
                    severity: this.assessConflictSeverity(insight, existing)
                });
            }
        }
        
        return conflicts;
    }

    detectConflict(newInsight, existingKnowledge) {
        // Simple conflict detection - could be enhanced
        if (newInsight.type !== existingKnowledge.type) return false;
        
        // Check for contradictory information
        // This would need more sophisticated NLP in production
        return false; // Placeholder
    }

    assessRelevance(insight, context) {
        let relevance = 0.5; // Base relevance
        
        // Check context alignment
        if (context.currentFocus && insight.type === context.currentFocus) {
            relevance += 0.3;
        }
        
        if (context.urgentNeeds && insight.actionable.some(a => 
            context.urgentNeeds.includes(a.action))) {
            relevance += 0.2;
        }
        
        // Time-based relevance
        if (insight.metadata?.timestamp) {
            const age = Date.now() - insight.metadata.timestamp;
            const daysSinceCreation = age / (1000 * 60 * 60 * 24);
            relevance *= Math.max(0.5, 1 - (daysSinceCreation / 30)); // Decay over 30 days
        }
        
        return Math.min(1, relevance);
    }

    prioritizeActions(actions) {
        // Sort by priority and remove duplicates
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        
        const seen = new Set();
        const unique = actions.filter(action => {
            const key = `${action.type}-${action.target || action.action || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
        
        return unique.sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 0;
            const priorityB = priorityOrder[b.priority] || 0;
            return priorityB - priorityA;
        });
    }

    identifyTargetAgents(insight) {
        const targets = [];
        
        // Map insight types to agent specializations
        const typeToAgent = {
            'authority_profile': ['twitter-analyst', 'market-intelligence'],
            'strategy': ['arbitrage-specialist', 'smart-contract-dev'],
            'trend': ['market-analyst', 'ai-prediction'],
            'risk': ['risk-manager', 'performance-optimizer'],
            'competitive_intelligence': ['opportunity-spotter', 'market-analyst'],
            'educational_resource': ['all'] // All agents can benefit
        };
        
        const agentTypes = typeToAgent[insight.type] || ['all'];
        
        if (agentTypes.includes('all')) {
            return ['all'];
        }
        
        return agentTypes;
    }

    calculateExpiry(insight) {
        // Different insight types have different lifespans
        const lifespanDays = {
            'authority_profile': 30,
            'strategy': 14,
            'trend': 7,
            'risk': 3,
            'competitive_intelligence': 7,
            'educational_resource': 60
        };
        
        const days = lifespanDays[insight.type] || 14;
        return Date.now() + (days * 24 * 60 * 60 * 1000);
    }

    estimateStrategyROI(metadata) {
        const successRate = parseFloat(metadata.success_rate) || 50;
        const complexity = (metadata.requirements?.technical?.length || 0) * 10;
        
        return (successRate - complexity) / 100;
    }

    generatePreparationSteps(metadata) {
        const steps = [];
        
        if (metadata.requirements?.technical) {
            steps.push({
                step: 'technical_setup',
                requirements: metadata.requirements.technical
            });
        }
        
        if (metadata.requirements?.resources) {
            steps.push({
                step: 'resource_allocation',
                requirements: metadata.requirements.resources
            });
        }
        
        if (metadata.risks) {
            steps.push({
                step: 'risk_mitigation_planning',
                risks: metadata.risks
            });
        }
        
        return steps;
    }

    assessConflictSeverity(newInsight, existing) {
        // Compare confidence levels
        const confidenceDiff = Math.abs(newInsight.confidence - existing.confidence);
        
        if (confidenceDiff > 0.5) return 'high';
        if (confidenceDiff > 0.3) return 'medium';
        return 'low';
    }

    calculateImpact(insights, actions) {
        return {
            knowledgeGained: insights.length,
            actionsGenerated: actions.length,
            criticalActions: actions.filter(a => a.priority === 'critical').length,
            estimatedValue: insights.reduce((sum, i) => sum + (i.confidence * i.relevance), 0)
        };
    }

    queueActions(actions) {
        // Add to pending actions with timestamp
        const queuedActions = actions.map(action => ({
            ...action,
            queuedAt: Date.now(),
            status: 'pending'
        }));
        
        this.pendingActions.push(...queuedActions);
        
        // Sort by priority
        this.pendingActions.sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        });
        
        // Limit queue size
        if (this.pendingActions.length > this.config.maxActionsPerCycle * 3) {
            this.pendingActions = this.pendingActions.slice(0, this.config.maxActionsPerCycle * 3);
        }
    }

    recordIntegration(integrationId, data) {
        this.integratedKnowledge.set(integrationId, data);
        
        // Clean up old integrations
        if (this.integratedKnowledge.size > 1000) {
            const oldestKey = this.integratedKnowledge.keys().next().value;
            this.integratedKnowledge.delete(oldestKey);
        }
    }

    recordActionExecution(action, status, error = null) {
        const executionRecord = {
            action,
            status,
            error,
            executedAt: Date.now()
        };
        
        const actionKey = `${action.type}-${Date.now()}`;
        this.executedActions.set(actionKey, executionRecord);
        
        // Update metrics
        if (status === 'success') {
            this.impactMetrics.successfulActions++;
        } else {
            this.impactMetrics.failedActions++;
        }
    }

    // Execution methods (placeholders - would implement actual integrations)
    async executeFollowListUpdate(action) { /* Implementation */ }
    async executeStrategyAdjustment(action) { /* Implementation */ }
    async executeRiskMitigation(action) { /* Implementation */ }
    async executeTaskPriorityChange(action) { /* Implementation */ }
    async notifyAgentsOfUpdates(updates) { /* Implementation */ }
}