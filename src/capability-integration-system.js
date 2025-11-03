/**
 * 🛠️ CAPABILITY INTEGRATION SYSTEM
 * Complete integration of ALL capabilities from the codebase
 * 
 * FEATURES:
 * - Dynamic capability loading and integration
 * - User capability request handling
 * - Agent collaboration for missing capabilities
 * - Real-time capability expansion
 * - Performance tracking per capability
 */

import EventEmitter from 'events';

// Import all available capability modules
import * as socialMediaCapabilities from '../learning/socialMedia.js';
import * as marketDataCapabilities from '../learning/marketData.js';
import * as blockchainCapabilities from '../learning/blockchain.js';
import * as financialCapabilities from '../learning/financial.js';
import * as mediaCapabilities from '../learning/media.js';
import * as securityCapabilities from '../learning/security.js';
import * as defiCapabilities from '../learning/DeFi-Operations.js';
import * as agentCoreCapabilities from '../learning/agentCore.js';

export class CapabilityIntegrationSystem extends EventEmitter {
    constructor(agentId, characterConfig) {
        super();
        this.agentId = agentId;
        this.config = characterConfig;
        
        // All integrated capabilities
        this.capabilities = new Map();
        
        // Capability performance tracking
        this.capabilityMetrics = new Map();
        
        // User requests tracking
        this.userRequests = new Map();
        
        // Peer collaboration for capabilities
        this.peerCapabilities = new Map();
        
        // Capability categories with priority levels
        this.capabilityCategories = {
            // CRITICAL for arbitrage operations
            CRITICAL: [
                'blockchain.gasOptimization',
                'financial.profitCalculation',
                'blockchain.poolMonitoring',
                'financial.riskAssessment'
            ],
            
            // HIGH for market advantage
            HIGH: [
                'research.marketData',
                'research.priceAnalysis',
                'socialMedia.memeTrends',
                'blockchain.smartContractInteraction'
            ],
            
            // MEDIUM for enhanced operations
            MEDIUM: [
                'socialMedia.twitter',
                'socialMedia.telegram',
                'research.technicalAnalysis',
                'media.contentCreation'
            ],
            
            // LOW for additional features
            LOW: [
                'socialMedia.instagram',
                'socialMedia.scamDetection',
                'media.imageGeneration',
                'security.threatDetection'
            ]
        };
        
        console.log(`🛠️ Capability Integration System initializing for agent ${agentId}`);
        this.initializeAllCapabilities();
    }
    
    /**
     * 🚀 Initialize all available capabilities
     */
    async initializeAllCapabilities() {
        console.log(`📦 Loading all available capabilities...`);
        
        // Social Media Capabilities
        await this.loadCapabilityModule('socialMedia', socialMediaCapabilities, {
            twitter: 'Social media posting and analysis',
            telegram: 'Telegram messaging and channel monitoring',
            instagram: 'Instagram content and engagement',
            whatsapp: 'WhatsApp messaging capabilities',
            discordMonitoring: 'Discord server and channel monitoring',
            memeTrends: 'Meme trend analysis across platforms',
            contentAnalysis: 'Social media content crawling and analysis',
            scamDetection: 'False claims and scam detection',
            viralityStrategy: 'Monetization and virality strategy copying'
        });
        
        // Market Data & Research Capabilities
        await this.loadCapabilityModule('research', marketDataCapabilities, {
            marketData: 'Real-time market data collection',
            priceAnalysis: 'Price movement analysis and predictions',
            volumeAnalysis: 'Trading volume analysis',
            technicalAnalysis: 'Technical indicator analysis',
            marketSentiment: 'Market sentiment analysis',
            newsAnalysis: 'News impact analysis'
        });
        
        // Blockchain Capabilities
        await this.loadCapabilityModule('blockchain', blockchainCapabilities, {
            transactionAnalysis: 'Transaction analysis and monitoring',
            poolMonitoring: 'Liquidity pool monitoring',
            gasOptimization: 'Gas fee optimization',
            smartContractInteraction: 'Smart contract interaction',
            onChainAnalysis: 'On-chain data analysis',
            mevDetection: 'MEV opportunity detection'
        });
        
        // Financial Capabilities
        await this.loadCapabilityModule('financial', financialCapabilities, {
            portfolioAnalysis: 'Portfolio performance analysis',
            riskAssessment: 'Financial risk assessment',
            profitCalculation: 'Profit and loss calculations',
            hedgingStrategies: 'Hedging strategy implementation',
            liquidityManagement: 'Liquidity management',
            arbitrageCalculation: 'Arbitrage opportunity calculation'
        });
        
        // Media Capabilities
        await this.loadCapabilityModule('media', mediaCapabilities, {
            contentCreation: 'Content creation and editing',
            imageGeneration: 'AI image generation',
            videoProcessing: 'Video processing and editing',
            audioAnalysis: 'Audio analysis and processing'
        });
        
        // Security Capabilities
        await this.loadCapabilityModule('security', securityCapabilities, {
            threatDetection: 'Security threat detection',
            contractAuditing: 'Smart contract security auditing',
            phishingDetection: 'Phishing attempt detection',
            fraudPrevention: 'Fraud prevention measures'
        });
        
        // DeFi Operation Capabilities
        await this.loadCapabilityModule('defi', defiCapabilities, {
            yieldFarming: 'Yield farming optimization',
            liquidityProvision: 'Liquidity provision strategies',
            stakingOptimization: 'Staking reward optimization',
            governance: 'DAO governance participation'
        });
        
        // Agent Core Capabilities
        await this.loadCapabilityModule('core', agentCoreCapabilities, {
            coordination: 'Agent coordination and communication',
            taskManagement: 'Task management and prioritization',
            learningOptimization: 'Learning algorithm optimization',
            performanceMonitoring: 'Performance monitoring and reporting'
        });
        
        console.log(`✅ Loaded ${this.capabilities.size} total capabilities across all modules`);
        this.logCapabilitySummary();
    }
    
    /**
     * 📦 Load capability module with error handling and user requests
     */
    async loadCapabilityModule(category, moduleCapabilities, capabilityDescriptions) {
        const categoryMap = new Map();
        
        for (const [capabilityName, capabilityFunction] of Object.entries(moduleCapabilities)) {
            const fullCapabilityName = `${category}.${capabilityName}`;
            const description = capabilityDescriptions[capabilityName] || 'No description available';
            
            try {
                // Wrap capability with monitoring and user request system
                const wrappedCapability = this.wrapCapabilityWithMonitoring(
                    capabilityFunction,
                    fullCapabilityName,
                    description
                );
                
                categoryMap.set(capabilityName, {
                    function: wrappedCapability,
                    description: description,
                    category: category,
                    priority: this.getCapabilityPriority(fullCapabilityName),
                    status: 'loaded',
                    usageCount: 0,
                    successRate: 1.0,
                    lastUsed: null
                });
                
                console.log(`📋 Loaded capability: ${fullCapabilityName}`);
                
            } catch (error) {
                console.warn(`⚠️ Failed to load capability ${fullCapabilityName}: ${error.message}`);
                
                // Store failed capability for user request
                categoryMap.set(capabilityName, {
                    function: null,
                    description: description,
                    category: category,
                    priority: this.getCapabilityPriority(fullCapabilityName),
                    status: 'failed',
                    error: error.message,
                    usageCount: 0,
                    successRate: 0.0,
                    lastUsed: null
                });
            }
        }
        
        this.capabilities.set(category, categoryMap);
    }
    
    /**
     * 🔧 Wrap capability with monitoring and user request fallback
     */
    wrapCapabilityWithMonitoring(capabilityFunction, capabilityName, description) {
        return async (...args) => {
            const startTime = Date.now();
            
            try {
                // Execute the capability
                const result = await capabilityFunction(...args);
                
                // Track successful usage
                this.updateCapabilityUsage(capabilityName, {
                    success: true,
                    executionTime: Date.now() - startTime,
                    timestamp: Date.now()
                });
                
                return result;
                
            } catch (error) {
                // Track failed usage
                this.updateCapabilityUsage(capabilityName, {
                    success: false,
                    executionTime: Date.now() - startTime,
                    timestamp: Date.now(),
                    error: error.message
                });
                
                // Check if this is a capability not available error
                if (error.message.includes('not implemented') ||
                    error.message.includes('not available') ||
                    error.message.includes('Capability not available')) {
                    
                    // Request capability from user
                    await this.requestCapabilityFromUser(capabilityName, description, args, error.message);
                    
                    // Also try to get it from peer agents
                    await this.requestCapabilityFromPeers(capabilityName, description);
                    
                    // Return a placeholder response
                    return { error: 'Capability requested from user', requested: true };
                }
                
                throw error;
            }
        };
    }
    
    /**
     * 👤 Request capability implementation from user
     */
    async requestCapabilityFromUser(capabilityName, description, parameters, errorMessage) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const request = {
            id: requestId,
            capability: capabilityName,
            description: description,
            parameters: parameters,
            error: errorMessage,
            timestamp: Date.now(),
            status: 'pending',
            agentId: this.agentId,
            priority: this.getCapabilityPriority(capabilityName)
        };
        
        this.userRequests.set(requestId, request);
        
        // Emit event for UI/notification systems
        this.emit('capabilityRequested', request);
        
        // Try to notify user through available channels
        await this.notifyUserOfCapabilityRequest(request);
        
        console.log(`📋 Capability request created: ${requestId} for ${capabilityName}`);
        
        return requestId;
    }
    
    /**
     * 📢 Notify user of capability request through available channels
     */
    async notifyUserOfCapabilityRequest(request) {
        const urgency = request.priority === 'CRITICAL' ? '🚨 URGENT' : 
                       request.priority === 'HIGH' ? '⚡ HIGH PRIORITY' : 
                       request.priority === 'MEDIUM' ? '📋 MEDIUM PRIORITY' : '📝 LOW PRIORITY';
        
        const message = `
${urgency} - CAPABILITY REQUEST FROM AGENT ${this.agentId}

🛠️ Missing Capability: ${request.capability}
📝 Description: ${request.description}
❌ Error: ${request.error}
⏰ Requested: ${new Date(request.timestamp).toLocaleString()}

This capability is needed for optimal performance. Please implement or provide alternative.

Request ID: ${request.id}
        `.trim();
        
        // Try console notification
        console.log('\n' + '='.repeat(80));
        console.log(message);
        console.log('='.repeat(80) + '\n');
        
        // Try to use social media capabilities for notification
        try {
            const socialMediaCaps = this.capabilities.get('socialMedia');
            if (socialMediaCaps && socialMediaCaps.has('telegram')) {
                const telegramCap = socialMediaCaps.get('telegram');
                if (telegramCap.function) {
                    await telegramCap.function({
                        action: 'sendMessage',
                        message: message,
                        priority: request.priority
                    });
                }
            }
        } catch (error) {
            console.debug(`Could not notify via Telegram: ${error.message}`);
        }
    }
    
    /**
     * 🤝 Request capability from peer agents
     */
    async requestCapabilityFromPeers(capabilityName, description) {
        try {
            // Import agent coordination protocol
            const { requestExpertise } = await import('../learning/agent-coordination-protocol.js');
            
            const peerResponse = await requestExpertise({
                capability: capabilityName,
                description: description,
                requestingAgent: this.agentId,
                priority: this.getCapabilityPriority(capabilityName)
            });
            
            if (peerResponse && peerResponse.available) {
                this.peerCapabilities.set(capabilityName, peerResponse);
                console.log(`🤝 Peer capability available: ${capabilityName}`);
            }
            
        } catch (error) {
            console.error(`Failed to request capability from peers: ${error.message}`);
        }
    }
    
    /**
     * 📊 Get capability priority level
     */
    getCapabilityPriority(capabilityName) {
        for (const [priority, capabilities] of Object.entries(this.capabilityCategories)) {
            if (capabilities.includes(capabilityName)) {
                return priority;
            }
        }
        return 'LOW';
    }
    
    /**
     * 📈 Update capability usage metrics
     */
    updateCapabilityUsage(capabilityName, outcome) {
        if (!this.capabilityMetrics.has(capabilityName)) {
            this.capabilityMetrics.set(capabilityName, {
                totalCalls: 0,
                successfulCalls: 0,
                failedCalls: 0,
                totalExecutionTime: 0,
                averageExecutionTime: 0,
                lastUsed: null,
                successRate: 1.0
            });
        }
        
        const metrics = this.capabilityMetrics.get(capabilityName);
        
        metrics.totalCalls++;
        metrics.lastUsed = outcome.timestamp;
        metrics.totalExecutionTime += outcome.executionTime;
        metrics.averageExecutionTime = metrics.totalExecutionTime / metrics.totalCalls;
        
        if (outcome.success) {
            metrics.successfulCalls++;
        } else {
            metrics.failedCalls++;
        }
        
        metrics.successRate = metrics.successfulCalls / metrics.totalCalls;
        
        // Update capability status
        this.updateCapabilityStatus(capabilityName, metrics);
    }
    
    /**
     * 🔄 Update capability status based on metrics
     */
    updateCapabilityStatus(capabilityName, metrics) {
        const [category, name] = capabilityName.split('.');
        
        if (this.capabilities.has(category)) {
            const categoryMap = this.capabilities.get(category);
            if (categoryMap.has(name)) {
                const capability = categoryMap.get(name);
                capability.usageCount = metrics.totalCalls;
                capability.successRate = metrics.successRate;
                capability.lastUsed = metrics.lastUsed;
                capability.status = metrics.successRate > 0.8 ? 'healthy' : 
                                 metrics.successRate > 0.5 ? 'degraded' : 'failing';
            }
        }
    }
    
    /**
     * 🔍 Get specific capability
     */
    getCapability(category, capabilityName) {
        if (!this.capabilities.has(category)) {
            return null;
        }
        
        const categoryMap = this.capabilities.get(category);
        return categoryMap.get(capabilityName) || null;
    }
    
    /**
     * 📋 Get capabilities by priority
     */
    getCapabilitiesByPriority(priority) {
        const capabilities = [];
        
        for (const [category, categoryMap] of this.capabilities) {
            for (const [name, capabilityData] of categoryMap) {
                if (capabilityData.priority === priority) {
                    capabilities.push({
                        name: `${category}.${name}`,
                        ...capabilityData
                    });
                }
            }
        }
        
        return capabilities;
    }
    
    /**
     * 📊 Get capability summary
     */
    getCapabilitySummary() {
        const summary = {
            totalCapabilities: 0,
            loadedCapabilities: 0,
            failedCapabilities: 0,
            userRequests: this.userRequests.size,
            byCategory: {},
            byPriority: {
                CRITICAL: 0,
                HIGH: 0,
                MEDIUM: 0,
                LOW: 0
            },
            byStatus: {
                loaded: 0,
                failed: 0,
                requested: 0
            }
        };
        
        for (const [category, categoryMap] of this.capabilities) {
            summary.byCategory[category] = categoryMap.size;
            
            for (const [name, capabilityData] of categoryMap) {
                summary.totalCapabilities++;
                summary.byPriority[capabilityData.priority]++;
                summary.byStatus[capabilityData.status]++;
                
                if (capabilityData.status === 'loaded') {
                    summary.loadedCapabilities++;
                } else {
                    summary.failedCapabilities++;
                }
            }
        }
        
        return summary;
    }
    
    /**
     * 📝 Log capability summary
     */
    logCapabilitySummary() {
        const summary = this.getCapabilitySummary();
        
        console.log('\n🛠️ CAPABILITY INTEGRATION SUMMARY');
        console.log('================================');
        console.log(`📊 Total: ${summary.totalCapabilities} capabilities`);
        console.log(`✅ Loaded: ${summary.loadedCapabilities}`);
        console.log(`❌ Failed: ${summary.failedCapabilities}`);
        console.log(`📋 User Requests: ${summary.userRequests}`);
        console.log('\n📋 By Category:');
        for (const [category, count] of Object.entries(summary.byCategory)) {
            console.log(`   ${category}: ${count}`);
        }
        console.log('\n⚡ By Priority:');
        for (const [priority, count] of Object.entries(summary.byPriority)) {
            console.log(`   ${priority}: ${count}`);
        }
        console.log('================================\n');
    }
    
    /**
     * ⚡ Execute capability with full error handling
     */
    async executeCapability(category, capabilityName, ...args) {
        const capability = this.getCapability(category, capabilityName);
        
        if (!capability) {
            throw new Error(`Capability ${category}.${capabilityName} not found`);
        }
        
        if (!capability.function) {
            throw new Error(`Capability ${category}.${capabilityName} not implemented`);
        }
        
        try {
            return await capability.function(...args);
        } catch (error) {
            console.error(`❌ Capability execution failed: ${category}.${capabilityName} - ${error.message}`);
            throw error;
        }
    }
    
    /**
     * 🔄 Reload capability with new implementation
     */
    async reloadCapability(category, capabilityName, newImplementation) {
        if (!this.capabilities.has(category)) {
            throw new Error(`Category ${category} not found`);
        }
        
        const categoryMap = this.capabilities.get(category);
        
        if (!categoryMap.has(capabilityName)) {
            throw new Error(`Capability ${capabilityName} not found in category ${category}`);
        }
        
        const capability = categoryMap.get(capabilityName);
        const fullName = `${category}.${capabilityName}`;
        
        // Wrap new implementation with monitoring
        const wrappedCapability = this.wrapCapabilityWithMonitoring(
            newImplementation,
            fullName,
            capability.description
        );
        
        // Update capability
        capability.function = wrappedCapability;
        capability.status = 'loaded';
        capability.lastUsed = null;
        
        this.emit('capabilityReloaded', {
            capability: fullName,
            category: category,
            name: capabilityName
        });
        
        console.log(`🔄 Capability reloaded: ${fullName}`);
    }
}

export default CapabilityIntegrationSystem; 