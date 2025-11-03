/**
 * 🧠 PREMIUM NEWSLETTER INTELLIGENCE PROCESSOR
 * Advanced AI-curated newsletter analysis for competitive advantage
 * Processes 20+ specialized blockchain intelligence sources
 */

import { PREMIUM_DATA_SOURCES } from './PremiumDataSourcesConfig.js';
import { EnhancedNewsletterAnalyzer } from './EnhancedNewsletterAnalyzer.js';
import { TransactionTrackingService } from './TransactionTrackingService.js';
import { DatabaseManager } from '../database/DatabaseManager.js';

export class PremiumNewsletterProcessor {
  constructor() {
    this.subscriptionCount = PREMIUM_DATA_SOURCES.NEWSLETTER_CONFIG.total_subscriptions;
    this.baseAnalyzer = new EnhancedNewsletterAnalyzer();
    this.trackingService = new TransactionTrackingService();
    this.dbManager = new DatabaseManager();
    this.isProcessing = false;
    this.processingStats = {
      newsletters_processed: 0,
      opportunities_found: 0,
      protocols_discovered: 0,
      alerts_generated: 0
    };
    
    // AI-curated content categories with enhanced intelligence extraction
    this.intelligenceCategories = {
      ARBITRAGE_OPPORTUNITIES: {
        keywords: ['arbitrage', 'spread', 'price difference', 'cross-chain', 'dex', 'swap'],
        priority: 'CRITICAL',
        action: 'IMMEDIATE_VALIDATION'
      },
      NEW_PROTOCOLS: {
        keywords: ['launch', 'new protocol', 'deployment', 'mainnet', 'testnet', 'v2', 'v3'],
        priority: 'HIGH',
        action: 'INVESTIGATE_CONTRACTS'
      },
      YIELD_FARMING: {
        keywords: ['yield', 'farming', 'liquidity mining', 'rewards', 'staking', 'apy', 'apr'],
        priority: 'HIGH',
        action: 'CALCULATE_PROFITABILITY'
      },
      GOVERNANCE_CHANGES: {
        keywords: ['governance', 'proposal', 'vote', 'parameter', 'upgrade', 'migration'],
        priority: 'MEDIUM',
        action: 'MONITOR_EXECUTION'
      },
      TECHNICAL_UPGRADES: {
        keywords: ['upgrade', 'hard fork', 'improvement', 'optimization', 'gas', 'scaling'],
        priority: 'MEDIUM',
        action: 'ASSESS_IMPACT'
      },
      MARKET_MOVEMENTS: {
        keywords: ['whale', 'large transfer', 'institutional', 'fund', 'etf', 'adoption'],
        priority: 'HIGH',
        action: 'TREND_ANALYSIS'
      },
      SECURITY_INCIDENTS: {
        keywords: ['hack', 'exploit', 'vulnerability', 'security', 'audit', 'bug bounty'],
        priority: 'CRITICAL',
        action: 'RISK_ASSESSMENT'
      },
      REGULATORY_UPDATES: {
        keywords: ['regulation', 'compliance', 'sec', 'cftc', 'license', 'legal'],
        priority: 'MEDIUM',
        action: 'COMPLIANCE_CHECK'
      }
    };

    // Enhanced pattern recognition for AI-curated content
    this.advancedPatterns = {
      profit_indicators: [
        /profit(?:ability)?\s*:\s*(\d+(?:\.\d+)?)\s*%/gi,
        /returns?\s*(?:of|:)\s*(\d+(?:\.\d+)?)\s*%/gi,
        /yield(?:ing)?\s*(\d+(?:\.\d+)?)\s*%/gi,
        /apy\s*(?:of|:)?\s*(\d+(?:\.\d+)?)\s*%/gi
      ],
      risk_indicators: [
        /risk\s*(?:level|score)?\s*:\s*(\w+)/gi,
        /(?:high|medium|low)\s*risk/gi,
        /(?:safe|dangerous|risky|secure)/gi
      ],
      timeframe_indicators: [
        /(?:within|in)\s*(\d+)\s*(hour|day|week|month)s?/gi,
        /(\d+)\s*(?:hr|h|day|d|week|w|month|m)\s*opportunity/gi
      ],
      chain_mentions: [
        /(?:arbitrum|arb)\s+(?:one|nova)?/gi,
        /(?:base|base\s+chain)/gi,
        /(?:polygon|matic)/gi,
        /(?:ethereum|eth)\s+(?:mainnet|l1)?/gi,
        /(?:optimism|op)/gi,
        /(?:avalanche|avax)/gi
      ]
    };
  }

  async startPremiumProcessing() {
    if (this.isProcessing) {
      console.log('🧠 Premium newsletter processing already active');
      return;
    }

    console.log(`🚀 Starting premium newsletter processing for ${this.subscriptionCount} AI-curated sources...`);
    this.isProcessing = true;

    // Start continuous processing
    this.processingInterval = setInterval(async () => {
      try {
        await this.processAllNewsletters();
      } catch (error) {
        console.error('❌ Error in premium newsletter processing:', error.message);
      }
    }, PREMIUM_DATA_SOURCES.NEWSLETTER_CONFIG.processing_mode === 'REAL_TIME' ? 60000 : 300000);

    // Initial processing
    await this.processAllNewsletters();
    
    console.log('✅ Premium newsletter processing active');
  }

  async processAllNewsletters() {
    console.log('📧 Processing premium newsletters...');
    
    try {
      // Get latest emails from AI-curated sources
      const emails = await this.baseAnalyzer.fetchLatestEmails();
      
      if (!emails || emails.length === 0) {
        console.log('📭 No new newsletters to process');
        return;
      }

      console.log(`📬 Processing ${emails.length} new newsletters`);
      
      for (const email of emails) {
        await this.processPremiumNewsletter(email);
        this.processingStats.newsletters_processed++;
      }

      // Generate intelligence summary
      await this.generateIntelligenceSummary();
      
    } catch (error) {
      console.error('❌ Error processing newsletters:', error.message);
    }
  }

  async processPremiumNewsletter(email) {
    try {
      console.log(`🔍 Analyzing: ${email.subject || 'Untitled'}`);
      
      // Enhanced content extraction for AI-curated sources
      const content = this.extractNewsletterContent(email);
      
      // Multi-layer intelligence analysis
      const intelligence = await this.extractAdvancedIntelligence(content, email);
      
      // Category-specific processing
      for (const category of intelligence.categories) {
        await this.processCategoryIntelligence(category, intelligence, email);
      }
      
      // Store processed intelligence
      await this.storeNewsletterIntelligence(email, intelligence);
      
      console.log(`✅ Processed: ${intelligence.opportunities.length} opportunities, ${intelligence.protocols.length} protocols`);
      
    } catch (error) {
      console.error(`❌ Error processing newsletter ${email.subject}:`, error.message);
    }
  }

  extractNewsletterContent(email) {
    // Enhanced content extraction for various newsletter formats
    let content = '';
    
    if (email.html) {
      // Remove HTML tags but preserve structure
      content = email.html
        .replace(/<style[^>]*>.*?<\/style>/gsi, '')
        .replace(/<script[^>]*>.*?<\/script>/gsi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (email.text) {
      content = email.text;
    }

    return content;
  }

  async extractAdvancedIntelligence(content, email) {
    const intelligence = {
      timestamp: new Date().toISOString(),
      source: email.from || 'unknown',
      subject: email.subject || '',
      categories: [],
      opportunities: [],
      protocols: [],
      risks: [],
      insights: [],
      chain_focus: [],
      confidence_score: 0
    };

    // Category classification
    intelligence.categories = this.classifyNewsletterCategories(content);
    
    // Extract opportunities
    intelligence.opportunities = await this.extractOpportunities(content);
    this.processingStats.opportunities_found += intelligence.opportunities.length;
    
    // Extract protocol mentions
    intelligence.protocols = await this.extractProtocolMentions(content);
    this.processingStats.protocols_discovered += intelligence.protocols.length;
    
    // Extract risk assessments
    intelligence.risks = this.extractRiskIndicators(content);
    
    // Extract chain-specific information
    intelligence.chain_focus = this.extractChainFocus(content);
    
    // Generate key insights
    intelligence.insights = await this.generateKeyInsights(content, intelligence);
    
    // Calculate confidence score
    intelligence.confidence_score = this.calculateConfidenceScore(intelligence);
    
    return intelligence;
  }

  classifyNewsletterCategories(content) {
    const categories = [];
    
    for (const [categoryName, config] of Object.entries(this.intelligenceCategories)) {
      const relevanceScore = this.calculateCategoryRelevance(content, config.keywords);
      
      if (relevanceScore > 0.3) { // 30% relevance threshold
        categories.push({
          name: categoryName,
          priority: config.priority,
          action: config.action,
          relevance_score: relevanceScore
        });
      }
    }
    
    return categories.sort((a, b) => b.relevance_score - a.relevance_score);
  }

  calculateCategoryRelevance(content, keywords) {
    let matches = 0;
    let totalWords = content.split(/\s+/).length;
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const keywordMatches = (content.match(regex) || []).length;
      matches += keywordMatches;
    }
    
    return Math.min(matches / (totalWords * 0.01), 1.0); // Normalize to 0-1
  }

  async extractOpportunities(content) {
    const opportunities = [];
    
    // Profit-based opportunities
    for (const pattern of this.advancedPatterns.profit_indicators) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const profitPercent = parseFloat(match[1]);
        if (profitPercent > 5) { // 5%+ profit threshold
          opportunities.push({
            type: 'PROFIT_OPPORTUNITY',
            profit_percent: profitPercent,
            context: this.extractContext(content, match.index),
            confidence: this.assessOpportunityConfidence(profitPercent, content, match.index)
          });
        }
      }
    }
    
    // Arbitrage-specific opportunities
    const arbitragePatterns = [
      /arbitrage.*?(\d+(?:\.\d+)?)\s*%/gi,
      /spread.*?(\d+(?:\.\d+)?)\s*%/gi,
      /price\s+difference.*?(\d+(?:\.\d+)?)\s*%/gi
    ];
    
    for (const pattern of arbitragePatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const spreadPercent = parseFloat(match[1]);
        opportunities.push({
          type: 'ARBITRAGE_OPPORTUNITY',
          spread_percent: spreadPercent,
          context: this.extractContext(content, match.index),
          priority: spreadPercent > 2 ? 'HIGH' : 'MEDIUM'
        });
      }
    }
    
    return opportunities;
  }

  async extractProtocolMentions(content) {
    const protocols = [];
    
    // Enhanced protocol detection patterns
    const protocolPatterns = [
      /(?:new|launching|deployed)\s+(?:protocol|dex|defi)\s+([A-Za-z0-9]+)/gi,
      /([A-Za-z0-9]+)\s+(?:protocol|dex)\s+(?:launch|live|deployed)/gi,
      /introducing\s+([A-Za-z0-9]+)/gi,
      /([A-Za-z0-9]+)\s+v[0-9]+(?:\.[0-9]+)?\s+(?:release|launch)/gi
    ];
    
    for (const pattern of protocolPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const protocolName = match[1];
        if (protocolName && protocolName.length > 2) {
          protocols.push({
            name: protocolName,
            context: this.extractContext(content, match.index),
            status: this.determineProtocolStatus(content, match.index),
            chains: this.extractProtocolChains(content, match.index)
          });
        }
      }
    }
    
    return protocols;
  }

  extractRiskIndicators(content) {
    const risks = [];
    
    for (const pattern of this.advancedPatterns.risk_indicators) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        risks.push({
          type: 'RISK_MENTION',
          level: this.normalizeRiskLevel(match[1] || match[0]),
          context: this.extractContext(content, match.index)
        });
      }
    }
    
    return risks;
  }

  extractChainFocus(content) {
    const chains = [];
    
    for (const pattern of this.advancedPatterns.chain_mentions) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const chainName = this.normalizeChainName(match[0]);
        if (!chains.includes(chainName)) {
          chains.push(chainName);
        }
      }
    }
    
    return chains;
  }

  async generateKeyInsights(content, intelligence) {
    const insights = [];
    
    // Generate insights based on extracted data
    if (intelligence.opportunities.length > 0) {
      const avgProfit = intelligence.opportunities
        .filter(op => op.profit_percent)
        .reduce((sum, op) => sum + op.profit_percent, 0) / intelligence.opportunities.length;
      
      if (avgProfit > 10) {
        insights.push({
          type: 'HIGH_PROFIT_POTENTIAL',
          message: `Newsletter mentions opportunities with average ${avgProfit.toFixed(1)}% profit potential`,
          priority: 'HIGH'
        });
      }
    }
    
    if (intelligence.protocols.length > 0) {
      insights.push({
        type: 'NEW_PROTOCOLS_DETECTED',
        message: `${intelligence.protocols.length} new protocols mentioned: ${intelligence.protocols.map(p => p.name).join(', ')}`,
        priority: 'MEDIUM'
      });
    }
    
    if (intelligence.chain_focus.includes('arbitrum') || intelligence.chain_focus.includes('base')) {
      insights.push({
        type: 'TARGET_CHAIN_FOCUS',
        message: `Newsletter focuses on our target chains: ${intelligence.chain_focus.join(', ')}`,
        priority: 'HIGH'
      });
    }
    
    return insights;
  }

  async processCategoryIntelligence(category, intelligence, email) {
    console.log(`🎯 Processing ${category.name} intelligence (${category.priority} priority)`);
    
    try {
      switch (category.action) {
        case 'IMMEDIATE_VALIDATION':
          await this.triggerImmediateValidation(intelligence, email);
          break;
          
        case 'INVESTIGATE_CONTRACTS':
          await this.triggerContractInvestigation(intelligence, email);
          break;
          
        case 'CALCULATE_PROFITABILITY':
          await this.triggerProfitabilityAnalysis(intelligence, email);
          break;
          
        case 'MONITOR_EXECUTION':
          await this.setupGovernanceMonitoring(intelligence, email);
          break;
          
        case 'ASSESS_IMPACT':
          await this.assessTechnicalImpact(intelligence, email);
          break;
          
        case 'TREND_ANALYSIS':
          await this.performTrendAnalysis(intelligence, email);
          break;
          
        case 'RISK_ASSESSMENT':
          await this.performRiskAssessment(intelligence, email);
          break;
          
        case 'COMPLIANCE_CHECK':
          await this.performComplianceCheck(intelligence, email);
          break;
      }
    } catch (error) {
      console.error(`❌ Error processing ${category.name}:`, error.message);
    }
  }

  async triggerImmediateValidation(intelligence, email) {
    // Trigger immediate validation for arbitrage opportunities
    for (const opportunity of intelligence.opportunities) {
      if (opportunity.type === 'ARBITRAGE_OPPORTUNITY' && opportunity.spread_percent > 1) {
        
        await this.alertAgentsToOpportunity({
          type: 'NEWSLETTER_ARBITRAGE_ALERT',
          source: 'premium_newsletter',
          spread_percent: opportunity.spread_percent,
          context: opportunity.context,
          newsletter_source: email.from,
          timestamp: new Date().toISOString(),
          priority: 'IMMEDIATE'
        });
        
        this.processingStats.alerts_generated++;
      }
    }
  }

  async triggerContractInvestigation(intelligence, email) {
    // Alert EliteContractDeveloper about new protocols
    for (const protocol of intelligence.protocols) {
      await this.alertContractDeveloper({
        type: 'NEW_PROTOCOL_INVESTIGATION',
        protocol_name: protocol.name,
        status: protocol.status,
        chains: protocol.chains,
        context: protocol.context,
        newsletter_source: email.from,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Utility methods
  extractContext(content, matchIndex, contextLength = 200) {
    const start = Math.max(0, matchIndex - contextLength / 2);
    const end = Math.min(content.length, matchIndex + contextLength / 2);
    return content.substring(start, end).trim();
  }

  assessOpportunityConfidence(profitPercent, content, matchIndex) {
    let confidence = 0.5; // Base confidence
    
    // Higher profits get higher confidence
    if (profitPercent > 20) confidence += 0.3;
    else if (profitPercent > 10) confidence += 0.2;
    else if (profitPercent > 5) confidence += 0.1;
    
    // Check for risk indicators nearby
    const context = this.extractContext(content, matchIndex);
    if (context.includes('risk') || context.includes('volatile')) {
      confidence -= 0.2;
    }
    
    // Check for validation indicators
    if (context.includes('verified') || context.includes('confirmed')) {
      confidence += 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  normalizeChainName(chainMention) {
    const chainMapping = {
      'arbitrum': 'arbitrum',
      'arb': 'arbitrum', 
      'base': 'base',
      'base chain': 'base',
      'polygon': 'polygon',
      'matic': 'polygon',
      'ethereum': 'ethereum',
      'eth': 'ethereum'
    };
    
    return chainMapping[chainMention.toLowerCase()] || chainMention.toLowerCase();
  }

  normalizeRiskLevel(riskText) {
    const riskMapping = {
      'high': 'HIGH',
      'medium': 'MEDIUM', 
      'low': 'LOW',
      'dangerous': 'HIGH',
      'risky': 'HIGH',
      'safe': 'LOW',
      'secure': 'LOW'
    };
    
    return riskMapping[riskText.toLowerCase()] || 'MEDIUM';
  }

  calculateConfidenceScore(intelligence) {
    let score = 0.5; // Base score
    
    // More opportunities increase confidence
    score += Math.min(intelligence.opportunities.length * 0.1, 0.3);
    
    // Protocol mentions add credibility
    score += Math.min(intelligence.protocols.length * 0.05, 0.2);
    
    // Target chain focus increases relevance
    if (intelligence.chain_focus.includes('arbitrum') || intelligence.chain_focus.includes('base')) {
      score += 0.2;
    }
    
    // High-priority categories increase confidence
    const highPriorityCount = intelligence.categories.filter(c => c.priority === 'CRITICAL' || c.priority === 'HIGH').length;
    score += Math.min(highPriorityCount * 0.1, 0.2);
    
    return Math.max(0, Math.min(1, score));
  }

  async generateIntelligenceSummary() {
    const summary = {
      timestamp: new Date().toISOString(),
      processing_stats: { ...this.processingStats },
      top_opportunities: await this.getTopOpportunities(),
      trending_protocols: await this.getTrendingProtocols(),
      risk_alerts: await this.getRiskAlerts(),
      chain_activity: await this.getChainActivity()
    };
    
    console.log('📊 INTELLIGENCE SUMMARY:', summary);
    
    // Store summary for agents
    await this.storeIntelligenceSummary(summary);
    
    return summary;
  }

  // Utility methods for protocol analysis
  determineProtocolStatus(content, matchIndex) {
    // Determine protocol status from surrounding context
    const context = this.extractContext(content, matchIndex);
    if (context.includes('launch') || context.includes('live')) return 'LAUNCHED';
    if (context.includes('beta') || context.includes('testnet')) return 'BETA';
    if (context.includes('coming') || context.includes('soon')) return 'UPCOMING';
    return 'UNKNOWN';
  }

  extractProtocolChains(content, matchIndex) {
    // Extract which chains a protocol is on
    const context = this.extractContext(content, matchIndex);
    const chains = [];
    
    if (context.includes('arbitrum')) chains.push('arbitrum');
    if (context.includes('base')) chains.push('base');
    if (context.includes('polygon')) chains.push('polygon');
    if (context.includes('ethereum')) chains.push('ethereum');
    
    return chains;
  }

  // Placeholder methods for unimplemented functionality
  async getTopOpportunities() { return []; }
  async getTrendingProtocols() { return []; }
  async getRiskAlerts() { return []; }
  async getChainActivity() { return {}; }
  async storeIntelligenceSummary(summary) { return; }
  async alertContractDeveloper(alert) { console.log('🔔 Contract developer alert:', alert.type); }
  
  // Database operations
  async storeNewsletterIntelligence(email, intelligence) {
    try {
      await this.dbManager.storeNewsletterIntelligence({
        source: intelligence.source,
        subject: intelligence.subject,
        timestamp: intelligence.timestamp,
        categories: intelligence.categories,
        opportunities: intelligence.opportunities,
        protocols: intelligence.protocols,
        risks: intelligence.risks,
        insights: intelligence.insights,
        chain_focus: intelligence.chain_focus,
        confidence_score: intelligence.confidence_score
      });
    } catch (error) {
      console.error('❌ Error storing newsletter intelligence:', error.message);
    }
  }

  async alertAgentsToOpportunity(alert) {
    try {
      await this.dbManager.storeAlert(alert);
      console.log(`🚨 ALERT GENERATED: ${alert.type}`);
    } catch (error) {
      console.error('❌ Error generating alert:', error.message);
    }
  }

  // Public API
  getProcessingStats() {
    return {
      ...this.processingStats,
      is_processing: this.isProcessing,
      subscription_count: this.subscriptionCount
    };
  }

  async stopProcessing() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.isProcessing = false;
    console.log('✅ Premium newsletter processing stopped');
  }
}

export default PremiumNewsletterProcessor; 