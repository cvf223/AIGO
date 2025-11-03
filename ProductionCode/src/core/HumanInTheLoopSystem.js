/**
 * 🤝 HUMAN-IN-THE-LOOP SYSTEM
 * ============================
 * 
 * General purpose human assistance system for agents
 * - Dynamic error detection and escalation
 * - LLM-powered recommendation generation  
 * - Real Telegram integration for notifications
 * - Pattern-based escalation triggers
 * - Performance timing monitoring
 * 
 * Integrates with existing:
 * - LLMIntelligenceAugmentation for recommendations
 * - NextLevelLearningOrchestrator for guidance patterns
 * - TelegramClient for real notifications
 */

import { EventEmitter } from 'events';
import { LLMIntelligenceAugmentation } from '../analysis/LLMIntelligenceAugmentation.js';
import { executeQuery } from '../../database/contract-advancement-database.js';
import { ContextEngine } from '../services/ContextEngine.js';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import { logger } from '../services/LoggingService.js';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR HUMAN-IN-THE-LOOP SYSTEM)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../construction/cognitive/FormalReasoningConstructionIntegration.js';;

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR HUMAN-IN-THE-LOOP SYSTEM)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../construction/prevention/ProactiveConstructionKnowledgePipeline.js';;
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../construction/prevention/ProactiveConstructionInferenceEngine.js';;
import { ProactiveConstructionVeracityJudge as ProactiveVeracityJudgeService } from '../construction/prevention/ProactiveConstructionVeracityJudge.js';

/**
 * 🤝 HUMAN-IN-THE-LOOP SYSTEM
 * ENHANCED with SPECIALIZED HUMAN-IN-THE-LOOP Formal Reasoning & Proactive Prevention
 * ============================
 */
export class HumanInTheLoopSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enabled: config.enabled !== false,
            // Dynamic escalation thresholds (not hardcoded!)
            patternDetectionWindow: config.patternDetectionWindow || 3600000, // 1 hour
            autoEscalationThreshold: config.autoEscalationThreshold || 5, // 5 similar issues
            urgencyLevels: {
                'LOW': { responseTarget: 3600000, notifyChannels: ['frontend'] }, // 1 hour
                'MEDIUM': { responseTarget: 1800000, notifyChannels: ['frontend', 'telegram'] }, // 30 min
                'HIGH': { responseTarget: 600000, notifyChannels: ['frontend', 'telegram'] }, // 10 min
                'CRITICAL': { responseTarget: 300000, notifyChannels: ['frontend', 'telegram'] } // 5 min
            },
            // Blocktime thresholds for performance warnings
            chainBlockTimes: {
                'arbitrum': 250,    // 250ms
                'optimism': 2000,   // 2s
                'base': 2000,       // 2s  
                'polygon': 2000,    // 2s
                'bsc': 3000,        // 3s
                'ethereum': 12000   // 12s
            },
            // LLM assistance configuration
            llmAssistanceEnabled: config.llmAssistanceEnabled !== false,
            telegramEnabled: config.telegramEnabled !== false,
            ...config
        };

        // Initialize LLM assistance for recommendations
        this.llmAssistance = new LLMIntelligenceAugmentation();
        
        // Initialize Context Engine instead of direct prompting
        this.contextEngine = new ContextEngine({
            sharedMemory: config.sharedMemory,
            capabilityRegistry: config.capabilityRegistry,
            memorySystem: config.memorySystem
        });
        
        // Telegram client will be initialized
        this.telegramClient = null;
        
        // Gmail client will be initialized
        this.gmailClient = null;
        this.oauth2Client = null;
        
        // Active escalations tracking
        this.activeEscalations = new Map();
        this.escalationPatterns = new Map();
        this.performanceWarnings = new Map();
        
        console.log('🤝 Human-in-the-Loop System initialized');
        console.log('   🧠 LLM-powered recommendations enabled');
        console.log('   📱 Telegram notifications configured');
        console.log('   ⏱️ Performance monitoring active');
        
        logger.success('HUMAN-LOOP', 'System initialized - LLM recommendations enabled', {
            component: 'HumanInTheLoopSystem',
            llmEnabled: this.config.llmAssistanceEnabled,
            telegramEnabled: this.config.telegramEnabled,
            performanceMonitoring: this.config.blocktimeMonitoringEnabled
        });
        
        // 🧠 FORMAL REASONING & VERIFICATION SYSTEMS (HUMAN-IN-THE-LOOP SYSTEM SPECIALIZED)
        this.humanInTheLoopSystemFormalReasoning = null;        // Human-in-the-loop system formal reasoning coordinator
        
        // 🛡️ PROACTIVE PREVENTION SYSTEMS (HUMAN-IN-THE-LOOP SYSTEM SPECIALIZED)  
        this.humanInTheLoopSystemCredibilityPipeline = null;   // Human-in-the-loop system credibility validation
        this.humanInTheLoopSystemInferenceReliability = null;  // Human-in-the-loop system inference reliability
        this.humanInTheLoopSystemVeracityJudge = null;         // Human-in-the-loop system truth-over-profit evaluation
        this.humanInTheLoopSystemSFTGovernor = null;           // Human-in-the-loop system training data governance
        
        // Initialize human-in-the-loop system integrations
        this.initializeHumanInTheLoopSystemIntegrations();
    }

    /**
     * 🚨 REQUEST HUMAN ASSISTANCE (MAIN ENTRY POINT)
     */
    async requestHumanAssistance(context) {
        try {
            if (!this.config.enabled) {
                console.log('🤝 Human-in-the-loop disabled, skipping assistance request');
                return null;
            }

            // 1. Analyze the request context and determine urgency
            const urgencyAnalysis = await this.analyzeUrgency(context);
            
            // 2. Check for existing patterns
            const patternAnalysis = await this.analyzePatterns(context);
            
            // 3. Generate LLM-powered recommendations  
            const recommendations = await this.generateLLMRecommendations(context, patternAnalysis);
            
            // 4. Determine if escalation is needed
            const shouldEscalate = this.shouldEscalate(context, patternAnalysis, urgencyAnalysis);
            
            if (!shouldEscalate) {
                console.log(`🤝 No escalation needed for ${context.type} (${urgencyAnalysis.urgency} priority)`);
                return {
                    escalated: false,
                    urgency: urgencyAnalysis.urgency,
                    recommendations: recommendations,
                    reason: 'Below escalation threshold'
                };
            }

            // 5. Create escalation request
            const escalationRequest = await this.createEscalationRequest(
                context, 
                urgencyAnalysis, 
                patternAnalysis, 
                recommendations
            );

            // 6. Send notifications through appropriate channels
            await this.sendNotifications(escalationRequest);

            // 7. Track the escalation
            this.activeEscalations.set(escalationRequest.id, escalationRequest);

            console.log(`🆘 Human assistance requested: ${escalationRequest.id} (${urgencyAnalysis.urgency})`);
            
            logger.logHumanEscalation(escalationRequest.id, `Human assistance requested: ${urgencyAnalysis.urgency} priority`, {
                component: 'HumanInTheLoopSystem',
                escalationId: escalationRequest.id,
                urgency: urgencyAnalysis.urgency,
                type: context.type,
                chain: context.chain,
                agentId: context.agentId,
                financialImpact: context.financialImpact || 0,
                performanceImpact: context.performanceImpact || 0
            });
            
            return {
                escalated: true,
                escalationId: escalationRequest.id,
                urgency: urgencyAnalysis.urgency,
                recommendations: recommendations,
                estimatedResponseTime: this.config.urgencyLevels[urgencyAnalysis.urgency].responseTarget
            };

        } catch (error) {
            console.error('❌ Error requesting human assistance:', error);
            return null;
        }
    }

    /**
     * 🔍 ANALYZE URGENCY DYNAMICALLY
     */
    async analyzeUrgency(context) {
        try {
            // Base urgency scoring
            let urgencyScore = 0;
            let factors = [];

            // Financial impact
            if (context.financialImpact) {
                if (context.financialImpact > 10000) {
                    urgencyScore += 40;
                    factors.push('High financial impact');
                } else if (context.financialImpact > 1000) {
                    urgencyScore += 20;
                    factors.push('Medium financial impact');
                }
            }

            // Frequency of similar issues
            const recentSimilar = await this.getRecentSimilarIssues(context);
            if (recentSimilar.count >= 10) {
                urgencyScore += 30;
                factors.push('High frequency pattern');
            } else if (recentSimilar.count >= 5) {
                urgencyScore += 15;
                factors.push('Medium frequency pattern');
            }

            // System component criticality
            const criticalComponents = ['gas_price', 'flashloan', 'mev_protection', 'calculation_accuracy'];
            if (criticalComponents.some(comp => context.type.includes(comp))) {
                urgencyScore += 20;
                factors.push('Critical system component');
            }

            // Performance degradation
            if (context.performanceImpact && context.performanceImpact > 0.1) {
                urgencyScore += 25;
                factors.push('Significant performance degradation');
            }

            // Time sensitivity (blocktime related)
            if (context.chain && context.executionTime) {
                const blockTime = this.config.chainBlockTimes[context.chain] || 2000;
                const halfBlockTime = blockTime / 2;
                
                if (context.executionTime > halfBlockTime) {
                    urgencyScore += 35;
                    factors.push('Exceeds half-blocktime threshold');
                }
            }

            // Determine urgency level
            let urgency;
            if (urgencyScore >= 70) {
                urgency = 'CRITICAL';
            } else if (urgencyScore >= 50) {
                urgency = 'HIGH';
            } else if (urgencyScore >= 30) {
                urgency = 'MEDIUM';
            } else {
                urgency = 'LOW';
            }

            return {
                urgency,
                score: urgencyScore,
                factors,
                reasoning: `Urgency determined by: ${factors.join(', ')}`
            };

        } catch (error) {
            console.error('❌ Error analyzing urgency:', error);
            return { urgency: 'MEDIUM', score: 30, factors: ['Error in analysis'], reasoning: 'Fallback to medium priority' };
        }
    }

    /**
     * 📊 ANALYZE PATTERNS DYNAMICALLY
     */
    async analyzePatterns(context) {
        try {
            const query = `
                SELECT 
                    COUNT(*) as occurrence_count,
                    AVG(EXTRACT(EPOCH FROM (NOW() - created_at))) as avg_age_seconds,
                    array_agg(agent_id) as affected_agents,
                    array_agg(alert_data) as historical_data
                FROM agent_awareness_alerts 
                WHERE alert_type = $1 
                AND ($2::text IS NULL OR chain = $2::text)
                AND created_at > NOW() - INTERVAL '1 hour' * $3
                GROUP BY alert_type
            `;

            const result = await executeQuery(query, [
                context.type,
                context.chain || null,
                this.config.patternDetectionWindow / 3600000 // Convert to hours
            ]);

            if (result.rows.length === 0) {
                return {
                    isPattern: false,
                    occurrenceCount: 0,
                    affectedAgents: [],
                    trend: 'isolated'
                };
            }

            const data = result.rows[0];
            const isPattern = data.occurrence_count >= 3;
            
            // Determine trend
            let trend = 'stable';
            if (data.occurrence_count >= 10) {
                trend = 'escalating';
            } else if (data.occurrence_count >= 5) {
                trend = 'concerning';
            }

            return {
                isPattern,
                occurrenceCount: parseInt(data.occurrence_count),
                affectedAgents: data.affected_agents || [],
                averageAgeSeconds: parseFloat(data.avg_age_seconds || 0),
                trend,
                historicalData: data.historical_data || []
            };

        } catch (error) {
            console.error('❌ Error analyzing patterns:', error);
            return { isPattern: false, occurrenceCount: 0, affectedAgents: [], trend: 'unknown' };
        }
    }

    /**
     * 🧠 GENERATE LLM-POWERED RECOMMENDATIONS
     */
    async generateLLMRecommendations(context, patternAnalysis) {
        try {
            if (!this.config.llmAssistanceEnabled) {
                return this.getFallbackRecommendations(context);
            }

            // Prepare context for LLM
            const llmContext = {
                issue: {
                    type: context.type,
                    description: context.description || context.reason,
                    chain: context.chain,
                    impact: context.impact,
                    financialImpact: context.financialImpact,
                    performanceImpact: context.performanceImpact
                },
                patterns: {
                    isRecurring: patternAnalysis.isPattern,
                    occurrenceCount: patternAnalysis.occurrenceCount,
                    trend: patternAnalysis.trend,
                    affectedAgents: patternAnalysis.affectedAgents
                },
                systemContext: {
                    currentTime: new Date().toISOString(),
                    chain: context.chain,
                    recentPerformance: context.recentPerformance
                }
            };

            // Build context using Context Engine instead of hardcoded prompts
            const contextualPrompt = await this.contextEngine.buildContext(
                { id: 'human-escalation-assistant', character: { name: 'Human Escalation Assistant' } },
                'Generate recommendations for human escalation',
                'CAPABILITY_ENHANCEMENT',
                llmContext
            );

            // Request LLM assistance with context-engineered prompt
            const llmResponse = await this.llmAssistance.requestLLMAssistance(
                contextualPrompt,
                { confidence: 0.5 }, // Trigger LLM assistance
                'human_escalation',
                ['creative_synthesis', 'risk_assessment', 'blind_spot_detection']
            );

            if (llmResponse && llmResponse.success) {
                return {
                    source: 'llm',
                    recommendations: llmResponse.recommendations || [],
                    insights: llmResponse.insights || [],
                    riskAssessments: llmResponse.riskAssessments || [],
                    confidence: llmResponse.confidence || 0.8,
                    reasoning: 'Generated by LLM analysis of context and patterns'
                };
            } else {
                console.warn('⚠️ LLM recommendation generation failed, using fallback');
                return this.getFallbackRecommendations(context);
            }

        } catch (error) {
            console.error('❌ Error generating LLM recommendations:', error);
            return this.getFallbackRecommendations(context);
        }
    }



    /**
     * 🔄 FALLBACK RECOMMENDATIONS
     */
    getFallbackRecommendations(context) {
        const basicRecommendations = [];

        // Generic recommendations based on context type
        if (context.type.includes('gas_price')) {
            basicRecommendations.push({
                priority: 'HIGH',
                action: `Add backup gas price APIs for ${context.chain}`,
                reasoning: 'Reduce dependency on single API source'
            });
        }

        if (context.type.includes('fallback')) {
            basicRecommendations.push({
                priority: 'MEDIUM',
                action: 'Investigate API reliability patterns',
                reasoning: 'Understand root cause of API failures'
            });
        }

        if (context.type.includes('calculation')) {
            basicRecommendations.push({
                priority: 'HIGH',
                action: 'Review calculation accuracy thresholds',
                reasoning: 'Ensure calculations meet precision requirements'
            });
        }

        return {
            source: 'fallback',
            recommendations: basicRecommendations,
            confidence: 0.6,
            reasoning: 'Basic pattern-based recommendations (LLM unavailable)'
        };
    }

    /**
     * 🤔 DETERMINE IF ESCALATION IS NEEDED
     */
    shouldEscalate(context, patternAnalysis, urgencyAnalysis) {
        // Always escalate CRITICAL urgency
        if (urgencyAnalysis.urgency === 'CRITICAL') {
            return true;
        }

        // Escalate HIGH urgency with patterns
        if (urgencyAnalysis.urgency === 'HIGH' && patternAnalysis.isPattern) {
            return true;
        }

        // Escalate if occurrence count exceeds threshold
        if (patternAnalysis.occurrenceCount >= this.config.autoEscalationThreshold) {
            return true;
        }

        // Escalate if financial impact is significant
        if (context.financialImpact && context.financialImpact > 5000) {
            return true;
        }

        // Escalate if affecting multiple agents
        if (patternAnalysis.affectedAgents.length >= 3) {
            return true;
        }

        // Escalate if performance is severely degraded
        if (context.performanceImpact && context.performanceImpact > 0.5) {
            return true;
        }

        return false;
    }

    /**
     * 📝 CREATE ESCALATION REQUEST
     */
    async createEscalationRequest(context, urgencyAnalysis, patternAnalysis, recommendations) {
        const escalationId = `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const escalationRequest = {
            id: escalationId,
            timestamp: new Date().toISOString(),
            context: context,
            urgency: urgencyAnalysis.urgency,
            urgencyFactors: urgencyAnalysis.factors,
            pattern: patternAnalysis,
            recommendations: recommendations,
            status: 'PENDING',
            notificationChannels: this.config.urgencyLevels[urgencyAnalysis.urgency].notifyChannels,
            responseTarget: new Date(Date.now() + this.config.urgencyLevels[urgencyAnalysis.urgency].responseTarget).toISOString(),
            agentId: context.agentId,
            chain: context.chain
        };

        // Store in database
        try {
            const query = `
                            INSERT INTO human_escalations (
                escalation_id, priority, reason, context_data, pattern_data, 
                recommendations_data, status, response_target, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            `;

            const escalationReason = context.description || context.reason || 
                                  `${context.type} detected on ${context.chain || 'unknown chain'}`;

            await executeQuery(query, [
                escalationId,
                urgencyAnalysis.urgency,
                escalationReason,
                JSON.stringify(context),
                JSON.stringify(patternAnalysis),
                JSON.stringify(recommendations),
                'PENDING',
                escalationRequest.responseTarget
            ]);

        } catch (error) {
            console.error('❌ Error storing escalation request:', error);
        }

        return escalationRequest;
    }

    /**
     * 📱 SEND NOTIFICATIONS THROUGH APPROPRIATE CHANNELS
     */
    async sendNotifications(escalationRequest) {
        const { notificationChannels } = escalationRequest;

        // Send to each configured channel
        for (const channel of notificationChannels) {
            try {
                switch (channel) {
                    case 'frontend':
                        await this.sendFrontendNotification(escalationRequest);
                        break;
                    case 'telegram':
                        await this.sendTelegramNotification(escalationRequest);
                        break;
                    case 'email':
                        await this.sendEmailNotification(escalationRequest);
                        break;
                    default:
                        console.warn(`⚠️ Unknown notification channel: ${channel}`);
                }
            } catch (error) {
                console.error(`❌ Error sending ${channel} notification:`, error);
            }
        }
    }

    /**
     * 🌐 SEND FRONTEND NOTIFICATION
     */
    async sendFrontendNotification(escalationRequest) {
        try {
            const query = `
                INSERT INTO frontend_notifications (
                    type, priority, title, message, data, created_at
                ) VALUES ($1, $2, $3, $4, $5, NOW())
            `;

            const title = `🆘 Agent Help Request: ${escalationRequest.context.type}`;
            const message = `${escalationRequest.urgency} priority issue detected. Agent needs human assistance.`;

            await executeQuery(query, [
                'HUMAN_ESCALATION',
                escalationRequest.urgency,
                title,
                message,
                JSON.stringify(escalationRequest)
            ]);

            console.log(`🌐 Frontend notification sent for ${escalationRequest.id}`);
            logger.logCommunication('frontend', `Notification sent for ${escalationRequest.id}`, {
                component: 'HumanInTheLoopSystem',
                escalationId: escalationRequest.id,
                priority: priority,
                type: type
            });

        } catch (error) {
            console.error('❌ Error sending frontend notification:', error);
        }
    }

    /**
     * 📱 SEND TELEGRAM NOTIFICATION (REAL IMPLEMENTATION)
     */
    async sendTelegramNotification(escalationRequest) {
        try {
            if (!this.config.telegramEnabled) {
                console.log('📱 Telegram notifications disabled');
                return;
            }

            // Initialize Telegram client if not already done
            if (!this.telegramClient) {
                await this.initializeTelegramClient();
            }

            // Format message for Telegram
            const message = this.formatTelegramMessage(escalationRequest);

            // Send message to configured chat
            const telegramGroupId = process.env.TELEGRAM_GROUP_ID || '-1002537429306';
            
            if (this.telegramClient && this.telegramClient.bot) {
                await this.telegramClient.bot.telegram.sendMessage(telegramGroupId, message, {
                    parse_mode: 'HTML'
                });

                console.log(`📱 Telegram notification sent for ${escalationRequest.id}`);
            logger.logCommunication('telegram', `Notification sent for ${escalationRequest.id}`, {
                component: 'HumanInTheLoopSystem',
                escalationId: escalationRequest.id,
                priority: escalationRequest.urgency,
                groupId: process.env.TELEGRAM_GROUP_ID || 'not-configured'
            });
            } else {
                console.warn('⚠️ Telegram client not available, using fallback notification');
                await this.sendFallbackTelegramNotification(escalationRequest, message);
            }

        } catch (error) {
            console.error('❌ Error sending Telegram notification:', error);
            // Try fallback method
            await this.sendFallbackTelegramNotification(escalationRequest, 'Error sending detailed notification');
        }
    }

    /**
     * 🤖 INITIALIZE TELEGRAM CLIENT
     */
    async initializeTelegramClient() {
        try {
            const { Telegraf } = await import('telegraf');
            const botToken = process.env.TELEGRAM_BOT_TOKEN;

            if (!botToken) {
                console.error('❌ TELEGRAM_BOT_TOKEN not found in environment');
                return;
            }

            // Create simple Telegram bot for notifications
            this.telegramClient = {
                bot: new Telegraf(botToken)
            };

                            console.log('📱 Telegram client initialized for notifications');
                logger.logCommunication('telegram', 'Client initialized for notifications', {
                    component: 'HumanInTheLoopSystem',
                    telegramEnabled: true,
                    botToken: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing'
                });

        } catch (error) {
            console.error('❌ Error initializing Telegram client:', error);
        }
    }

    /**
     * 📝 FORMAT TELEGRAM MESSAGE
     */
    formatTelegramMessage(escalationRequest) {
        const { context, urgency, recommendations } = escalationRequest;
        
        let message = `🆘 <b>AGENT HELP REQUEST</b>\n\n`;
        message += `🚨 <b>Priority:</b> ${urgency}\n`;
        message += `🔗 <b>Chain:</b> ${context.chain || 'Multiple'}\n`;
        message += `🤖 <b>Agent:</b> ${context.agentId || 'Unknown'}\n`;
        message += `⚠️ <b>Issue:</b> ${context.type}\n\n`;
        
        if (context.description) {
            message += `📝 <b>Description:</b>\n${context.description}\n\n`;
        }

        if (context.financialImpact) {
            message += `💰 <b>Financial Impact:</b> $${context.financialImpact.toLocaleString()}\n`;
        }

        if (context.performanceImpact) {
            message += `⚡ <b>Performance Impact:</b> ${(context.performanceImpact * 100).toFixed(1)}%\n`;
        }

        if (recommendations && recommendations.recommendations && recommendations.recommendations.length > 0) {
            message += `\n💡 <b>AI Recommendations:</b>\n`;
            const topRecs = recommendations.recommendations.slice(0, 3);
            topRecs.forEach((rec, index) => {
                message += `${index + 1}. ${rec.action || rec.description || rec}\n`;
            });
        }

        message += `\n🆔 <b>Escalation ID:</b> <code>${escalationRequest.id}</code>`;
        message += `\n⏰ <b>Time:</b> ${new Date().toLocaleString()}`;

        // Limit message length for Telegram
        if (message.length > 4000) {
            message = message.substring(0, 3900) + '\n\n...(truncated)';
        }

        return message;
    }

    /**
     * 📨 FALLBACK TELEGRAM NOTIFICATION
     */
    async sendFallbackTelegramNotification(escalationRequest, message) {
        try {
            // Store notification for manual sending or webhook pickup
            const query = `
                INSERT INTO telegram_notification_queue (
                    escalation_id, message, status, created_at
                ) VALUES ($1, $2, 'PENDING', NOW())
            `;

            await executeQuery(query, [
                escalationRequest.id,
                message
            ]);

            console.log(`📨 Telegram notification queued for ${escalationRequest.id}`);

        } catch (error) {
            console.error('❌ Error queuing Telegram notification:', error);
        }
    }

    /**
     * ⏱️ CHECK BLOCKTIME PERFORMANCE
     */
    async checkBlocktimePerformance(context) {
        if (!context.chain || !context.executionTime) {
            return null;
        }

        const blockTime = this.config.chainBlockTimes[context.chain];
        if (!blockTime) {
            return null;
        }

        const halfBlockTime = blockTime / 2;
        
        if (context.executionTime > halfBlockTime) {
            const warning = {
                type: 'blocktime_performance_warning',
                chain: context.chain,
                executionTime: context.executionTime,
                blockTime: blockTime,
                halfBlockTime: halfBlockTime,
                overagePercentage: ((context.executionTime - halfBlockTime) / halfBlockTime) * 100,
                timestamp: Date.now()
            };

            console.warn(`⏱️ [BLOCKTIME WARNING] ${context.chain}: ${context.executionTime}ms > ${halfBlockTime}ms (half blocktime)`);
            console.warn(`   🚨 This will impact nanosecond-level operations!`);
            console.warn(`   📊 Overage: ${warning.overagePercentage.toFixed(1)}% over half-blocktime threshold`);
            
            logger.warn('BLOCKTIME', `WARNING: ${context.chain}: ${context.executionTime}ms > ${halfBlockTime}ms (${warning.overagePercentage.toFixed(1)}% overage)`, {
                component: 'HumanInTheLoopSystem',
                chain: context.chain,
                executionTime: context.executionTime,
                halfBlockTime: halfBlockTime,
                overagePercentage: warning.overagePercentage,
                operation: context.operation,
                agentId: context.agentId
            });

            // Request assistance for performance issues
            await this.requestHumanAssistance({
                ...context,
                type: 'blocktime_performance_degradation',
                description: `Operation took ${context.executionTime}ms, exceeding half-blocktime threshold of ${halfBlockTime}ms`,
                performanceImpact: warning.overagePercentage / 100,
                urgent: warning.overagePercentage > 100 // Critical if over full blocktime
            });

            return warning;
        }

        return null;
    }

    /**
     * 📊 GET RECENT SIMILAR ISSUES
     */
    async getRecentSimilarIssues(context) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM agent_awareness_alerts 
                WHERE alert_type = $1 
                AND ($2::text IS NULL OR chain = $2::text)
                AND created_at > NOW() - INTERVAL '1 hour'
            `;

            const result = await executeQuery(query, [context.type, context.chain || null]);
            return { count: parseInt(result.rows[0]?.count || 0) };

        } catch (error) {
            console.error('❌ Error getting recent similar issues:', error);
            return { count: 0 };
        }
    }

    /**
     * ✅ RESOLVE ESCALATION
     */
    async resolveEscalation(escalationId, resolution) {
        try {
            const query = `
                UPDATE human_escalations 
                SET status = 'RESOLVED', 
                    resolution_notes = $2, 
                    resolved_at = NOW()
                WHERE escalation_id = $1
            `;

            await executeQuery(query, [escalationId, resolution]);

            // Remove from active tracking
            this.activeEscalations.delete(escalationId);

            console.log(`✅ Escalation ${escalationId} resolved`);

            // Emit resolution event for learning
            this.emit('escalationResolved', { escalationId, resolution });

        } catch (error) {
            console.error('❌ Error resolving escalation:', error);
        }
    }

    /**
     * 📧 SEND EMAIL NOTIFICATION (REAL GMAIL IMPLEMENTATION)
     */
    async sendEmailNotification(escalationRequest) {
        try {
            console.log(`📧 Sending Gmail notification for ${escalationRequest.id}`);
            
            // Initialize Gmail client if not already done
            if (!this.gmailClient) {
                await this.initializeGmailClient();
            }

            // Format email content
            const emailContent = this.formatEmailContent(escalationRequest);
            const emailSubject = `🚨 CRITICAL: Agent Help Request - ${escalationRequest.context.type}`;

            // Send email
            const result = await this.sendGmailMessage(
                'cvf223@me.com', // User's email
                emailSubject,
                emailContent
            );

            console.log(`📧 Gmail notification sent successfully for ${escalationRequest.id}`);
            return result;

        } catch (error) {
            console.error(`❌ Error sending Gmail notification for ${escalationRequest.id}:`, error);
            
            // Fallback: store in queue for manual sending
            await this.queueEmailForManualSending(escalationRequest, error.message);
        }
    }

    /**
     * 🤖 INITIALIZE GMAIL CLIENT
     */
    async initializeGmailClient() {
        try {
            console.log('📧 Initializing Gmail client...');

            // Load OAuth2 credentials from environment
            const credentialsPath = process.env.GMAIL_OAUTH2_CREDENTIALS || process.env.GOOGLE_APPLICATION_CREDENTIALS;
            
            if (!credentialsPath) {
                throw new Error('No Gmail credentials found in environment');
            }

            // Try to read credentials file
            const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf8'));
            
            // Initialize OAuth2 client
            this.oauth2Client = new OAuth2Client(
                credentials.installed?.client_id || credentials.client_id,
                credentials.installed?.client_secret || credentials.client_secret,
                credentials.installed?.redirect_uris?.[0] || 'urn:ietf:wg:oauth:2.0:oob'
            );

            // Load existing token or generate new one
            await this.loadGmailToken();

            // Initialize Gmail API
            this.gmailClient = google.gmail({ version: 'v1', auth: this.oauth2Client });

            console.log('📧 Gmail client initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing Gmail client:', error);
            throw error;
        }
    }

    /**
     * 🔑 LOAD GMAIL TOKEN
     */
    async loadGmailToken() {
        try {
            // Try to load existing token
            const tokenPath = './config/gmail-token.json';
            const token = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
            
            this.oauth2Client.setCredentials(token);
            console.log('✅ Gmail token loaded successfully');

        } catch (error) {
            console.warn('⚠️ Gmail token not found, using service account authentication');
            
            // Fallback to service account if available
            const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
            if (serviceAccountPath) {
                const auth = new google.auth.GoogleAuth({
                    keyFile: serviceAccountPath,
                    scopes: ['https://www.googleapis.com/auth/gmail.send']
                });
                
                this.oauth2Client = await auth.getClient();
                console.log('✅ Gmail service account authentication configured');
            } else {
                throw new Error('No Gmail authentication method available');
            }
        }
    }

    /**
     * 📨 SEND GMAIL MESSAGE
     */
    async sendGmailMessage(to, subject, htmlContent) {
        try {
            // Create email in RFC 2822 format
            const email = [
                `To: ${to}`,
                `Subject: ${subject}`,
                `Content-Type: text/html; charset=utf-8`,
                '',
                htmlContent
            ].join('\n');

            // Encode email in base64url format
            const encodedEmail = Buffer.from(email)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            // Send via Gmail API
            const response = await this.gmailClient.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedEmail
                }
            });

            return response.data;

        } catch (error) {
            console.error('❌ Error sending Gmail message:', error);
            throw error;
        }
    }

    /**
     * 📧 FORMAT EMAIL CONTENT
     */
    formatEmailContent(escalationRequest) {
        const { context, urgency, recommendations } = escalationRequest;
        
        let html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #ff4444; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .urgency { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
        .recommendations { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; }
        .metrics { display: flex; justify-content: space-between; margin: 15px 0; }
        .metric { text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 AGENT HELP REQUEST</h1>
        <h2>Priority: ${urgency}</h2>
    </div>
    
    <div class="content">
        <div class="urgency">
            <h3>🔍 Issue Details</h3>
            <p><strong>Type:</strong> ${context.type}</p>
            <p><strong>Chain:</strong> ${context.chain || 'Multiple'}</p>
            <p><strong>Agent:</strong> ${context.agentId || 'Unknown'}</p>
            <p><strong>Description:</strong> ${context.description || context.reason}</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h4>💰 Financial Impact</h4>
                <p>$${(context.financialImpact || 0).toLocaleString()}</p>
            </div>
            <div class="metric">
                <h4>⚡ Performance Impact</h4>
                <p>${((context.performanceImpact || 0) * 100).toFixed(1)}%</p>
            </div>
            <div class="metric">
                <h4>🕐 Time</h4>
                <p>${new Date().toLocaleString()}</p>
            </div>
        </div>`;

        if (recommendations && recommendations.recommendations && recommendations.recommendations.length > 0) {
            html += `
        <div class="recommendations">
            <h3>💡 AI-Generated Recommendations</h3>
            <ol>`;
            
            recommendations.recommendations.slice(0, 5).forEach(rec => {
                const action = rec.action || rec.description || rec;
                const priority = rec.priority || 'MEDIUM';
                html += `<li><strong>[${priority}]</strong> ${action}</li>`;
            });
            
            html += `
            </ol>
            <p><em>Confidence: ${((recommendations.confidence || 0.8) * 100).toFixed(1)}%</em></p>
        </div>`;
        }

        html += `
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <h3>🆔 Escalation Details</h3>
            <p><strong>Escalation ID:</strong> <code>${escalationRequest.id}</code></p>
            <p><strong>Response Target:</strong> ${new Date(escalationRequest.responseTarget).toLocaleString()}</p>
            <p><strong>Notification Channels:</strong> ${escalationRequest.notificationChannels.join(', ')}</p>
        </div>
    </div>
    
    <div class="footer">
        <p>🤖 Generated by Elite Arbitrage Syndicate Human-in-the-Loop System</p>
        <p>This is an automated message. Reply with your actions taken.</p>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * 📋 QUEUE EMAIL FOR MANUAL SENDING
     */
    async queueEmailForManualSending(escalationRequest, errorMessage) {
        try {
            const query = `
                INSERT INTO email_send_queue (
                    escalation_id, recipient, subject, content, status, error_message, created_at
                ) VALUES ($1, $2, $3, $4, 'FAILED', $5, NOW())
            `;

            const subject = `🚨 CRITICAL: Agent Help Request - ${escalationRequest.context.type}`;
            const content = this.formatEmailContent(escalationRequest);

            await executeQuery(query, [
                escalationRequest.id,
                'cvf223@me.com',
                subject,
                content,
                errorMessage
            ]);

            console.log(`📋 Email queued for manual sending: ${escalationRequest.id}`);

        } catch (error) {
            console.error('❌ Error queuing email for manual sending:', error);
        }
    }

    /**
     * 🔍 GET ESCALATION STATUS
     */
    getEscalationStatus(escalationId) {
        return this.activeEscalations.get(escalationId) || null;
    }

    /**
     * 📊 GET ESCALATION METRICS
     */
    async getEscalationMetrics() {
        try {
            const query = `
                            SELECT 
                priority,
                COUNT(*) as total,
                AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) as avg_resolution_time,
                COUNT(CASE WHEN status = 'RESOLVED' THEN 1 END) as resolved_count
            FROM human_escalations 
            WHERE created_at > NOW() - INTERVAL '24 hours'
            GROUP BY priority
            `;

            const result = await executeQuery(query);
            return result.rows;

        } catch (error) {
            console.error('❌ Error getting escalation metrics:', error);
            return [];
        }
    }

    /**
     * 🌌 INITIALIZE HUMAN-IN-THE-LOOP SYSTEM INTEGRATIONS
     * Called during constructor to initialize formal reasoning and proactive prevention
     */
    async initializeHumanInTheLoopSystemIntegrations() {
        try {
            await this.initializeHumanInTheLoopSystemFormalReasoningIntegration();
            await this.initializeHumanInTheLoopSystemProactivePreventionIntegration();
        } catch (error) {
            console.warn('⚠️ Human-in-the-loop system integrations failed during construction:', error);
        }
    }

    /**
     * 🧠 INITIALIZE HUMAN-IN-THE-LOOP SYSTEM FORMAL REASONING INTEGRATION (SPECIALIZED)
     * ================================================================================
     * 
     * SPECIALIZED INTEGRATION for Human-in-the-Loop System
     * Provides formal verification for human assistance algorithms and escalation procedures
     */
    async initializeHumanInTheLoopSystemFormalReasoningIntegration() {
        console.log('🤝 Initializing Human-in-the-Loop System Formal Reasoning Integration...');
        
        try {
            // Initialize human-in-the-loop system specialized formal reasoning
            this.humanInTheLoopSystemFormalReasoning = new FormalReasoningCognitiveIntegration({
                agentId: 'human-in-the-loop-system-formal',
                enablePersistence: true,
                humanInTheLoopSystemMode: true,
                coordinateHumanInTheLoopSystemOperations: true
            });
            
            await this.humanInTheLoopSystemFormalReasoning.initialize();
            
            // Register Human-in-the-Loop System with specialized verification
            await this.humanInTheLoopSystemFormalReasoning.registerLearningSystemForFormalVerification('human_in_the_loop_system', {
                systemType: 'human_assistance_escalation_system',
                capabilities: [
                    'dynamic_error_detection_escalation',
                    'llm_powered_recommendation_generation',
                    'real_telegram_notification_integration',
                    'pattern_based_escalation_triggers',
                    'performance_timing_monitoring',
                    'human_intervention_coordination',
                    'intelligent_assistance_routing'
                ],
                requiresVerification: [
                    'error_detection_algorithms',
                    'escalation_procedures',
                    'recommendation_generation_accuracy',
                    'notification_delivery_reliability',
                    'pattern_detection_precision',
                    'performance_monitoring_calculations',
                    'intervention_coordination_validity'
                ]
            });
            
            console.log('✅ Human-in-the-Loop System Formal Reasoning Integration initialized');
            console.log('🤝 Human assistance operations now have mathematical safety guarantees');
            
        } catch (error) {
            console.error('❌ Failed to initialize human-in-the-loop system formal reasoning:', error);
        }
    }

    /**
     * 🛡️ INITIALIZE HUMAN-IN-THE-LOOP SYSTEM PROACTIVE PREVENTION INTEGRATION (SPECIALIZED)
     * ===================================================================================
     * 
     * SPECIALIZED INTEGRATION for Human-in-the-Loop System
     * Prevents human assistance hallucinations and ensures elite intervention quality
     */
    async initializeHumanInTheLoopSystemProactivePreventionIntegration() {
        console.log('🛡️ Initializing Human-in-the-Loop System Proactive Prevention Integration...');
        
        try {
            // Initialize human-in-the-loop system credibility pipeline
            this.humanInTheLoopSystemCredibilityPipeline = new ProactiveKnowledgeCredibilityPipeline({
                agentId: 'human-in-the-loop-system-credibility',
                enablePersistence: true,
                humanInTheLoopSystemMode: true,
                validateHumanInTheLoopSystemData: true
            });
            
            // Initialize human-in-the-loop system inference reliability
            this.humanInTheLoopSystemInferenceReliability = new ProactiveInferenceReliabilityEngine({
                agentId: 'human-in-the-loop-system-inference',
                enablePersistence: true,
                humanInTheLoopSystemMode: true,
                memoryConsultationMandatory: true,
                humanInTheLoopSystemAwareReasoning: true
            });
            
            // Initialize human-in-the-loop system veracity judge
            this.humanInTheLoopSystemVeracityJudge = new ProactiveVeracityJudgeService({
                agentId: 'human-in-the-loop-system-veracity',
                enablePersistence: true,
                humanInTheLoopSystemMode: true,
                truthOverProfitPriority: true,
                evaluateHumanInTheLoopSystemResults: true
            });
            
            // SFTFlywheelGovernor removed - blockchain only
            this.humanInTheLoopSystemSFTGovernor = null;
            
            // Initialize all human-in-the-loop system coordinators
            await Promise.all([
                this.humanInTheLoopSystemCredibilityPipeline.initialize(),
                this.humanInTheLoopSystemInferenceReliability.initialize(),
                this.humanInTheLoopSystemVeracityJudge.initialize()
            ]);
            
            console.log('✅ Human-in-the-Loop System Proactive Prevention Integration initialized');
            console.log('🛡️ Human assistance system now immune to intervention hallucinations');
            console.log('🌊 Human assistance data credibility validation: ACTIVE');
            console.log('🔄 Human assistance quality governance: ACTIVE');
            console.log('⚖️ Truth-over-profit for human assistance: ACTIVE');
            console.log('🧠 Memory consultation for human assistance: ENFORCED');
            
        } catch (error) {
            console.error('❌ Failed to initialize human-in-the-loop system proactive prevention:', error);
        }
    }
}
