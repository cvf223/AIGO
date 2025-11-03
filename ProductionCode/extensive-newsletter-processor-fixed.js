#!/usr/bin/env node

/**
 * 🚀 EXTENSIVE NEWSLETTER PROCESSOR - FIXED
 * ==========================================
 * 
 * FIXES:
 * 1. REUSES SAME AGENT INSTANCE (no more restarts!)
 * 2. SEMANTIC FINANCIAL OPPORTUNITY DETECTION
 * 3. CONTINUOUS LEARNING BETWEEN NEWSLETTERS
 * 4. PROPER MEMORY CONTINUITY
 */

import { RealAgentGenericRunner } from './real-agent-newsletter-runner-generic.js';
import fs from 'fs/promises';
import path from 'path';

class ExtensiveNewsletterProcessorFixed {
    constructor() {
        this.processedCount = 0;
        this.discoveryLog = [];
        this.errorLog = [];
        this.startTime = Date.now();
        this.isRunning = false;
        
        // SINGLE AGENT INSTANCE - NO MORE RESTARTS!
        this.runner = null;
        this.agent = null;
        this.isAgentInitialized = false;
        
        // Extensive logging configuration
        this.logLevel = 'VERBOSE';
        this.logToFile = true;
        this.logFilePath = './logs/extensive-newsletter-processing-fixed.log';
        
        // Semantic financial patterns (BRUTAL TRUTH: Keywords were too narrow!)
        this.financialPatterns = {
            massivePriceMovements: [
                /ripped hard/gi, /exploded/gi, /rocketed/gi, /surged/gi, /pumped/gi,
                /massive gains/gi, /record-breaking/gi, /all-time high/gi, /ATH/gi
            ],
            liquidityEvents: [
                /\$[\d,]+[BMK]\s*(raised|in|funding|volume)/gi,
                /\$[\d,]+[BMK]\s*in\s*\d+\s*(minutes|hours|days)/gi,
                /raised \$[\d,]+[BMK]/gi, /volume.*\$[\d,]+[BMK]/gi
            ],
            marketOpportunities: [
                /altcoin season/gi, /bull market/gi, /market cycle/gi, /breakout/gi,
                /momentum/gi, /rally/gi, /trend/gi, /cycle/gi, /season/gi
            ],
            yieldOpportunities: [
                /returns/gi, /yield/gi, /APY/gi, /staking/gi, /farming/gi,
                /rewards/gi, /passive income/gi, /earn/gi
            ],
            arbitrageSignals: [
                /price difference/gi, /spread/gi, /arbitrage/gi, /MEV/gi,
                /cross-exchange/gi, /low-cap/gi, /memecoin/gi
            ],
            institutionalFlow: [
                /ETF/gi, /institutional/gi, /adoption/gi, /treasury/gi,
                /corporate/gi, /pension fund/gi, /endowment/gi
            ],
            freeMoneyEvents: [
                /airdrop/gi, /free/gi, /giveaway/gi, /claim/gi, /distribution/gi,
                /snapshot/gi, /bonus/gi, /reward/gi
            ]
        };
        
        this.setupSignalHandlers();
    }

    /**
     * 📝 EXTENSIVE LOGGING WITH FINANCIAL CONTEXT
     */
    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            processedCount: this.processedCount,
            runtime: Date.now() - this.startTime,
            agentMemoryState: this.isAgentInitialized ? 'PERSISTENT' : 'NOT_INITIALIZED'
        };
        
        const levelColors = {
            'ERROR': '\x1b[31m',   
            'WARN': '\x1b[33m',    
            'INFO': '\x1b[36m',    
            'DEBUG': '\x1b[35m',   
            'VERBOSE': '\x1b[90m', 
            'SUCCESS': '\x1b[32m',
            'FINANCIAL': '\x1b[93m' // Bright yellow for financial opportunities
        };
        
        const color = levelColors[level] || '';
        const reset = '\x1b[0m';
        
        console.log(`${color}[${timestamp}] ${level}: ${message}${reset}`);
        if (data) {
            console.log(`${color}   Data:`, JSON.stringify(data, null, 2), reset);
        }
        
        if (this.logToFile) {
            await this.writeToLogFile(logEntry);
        }
    }

    /**
     * 📁 WRITE TO LOG FILE
     */
    async writeToLogFile(logEntry) {
        try {
            const logDir = path.dirname(this.logFilePath);
            await fs.mkdir(logDir, { recursive: true });
            
            const logLine = JSON.stringify(logEntry) + '\n';
            await fs.appendFile(this.logFilePath, logLine);
        } catch (error) {
            console.error('Failed to write to log file:', error);
        }
    }

    /**
     * 💰 SEMANTIC FINANCIAL OPPORTUNITY DETECTION
     */
    detectFinancialOpportunities(content) {
        const opportunities = {
            massivePriceMovements: [],
            liquidityEvents: [],
            marketOpportunities: [],
            yieldOpportunities: [],
            arbitrageSignals: [],
            institutionalFlow: [],
            freeMoneyEvents: []
        };

        // Extract all financial patterns
        for (const [category, patterns] of Object.entries(this.financialPatterns)) {
            for (const pattern of patterns) {
                const matches = [...content.matchAll(pattern)];
                if (matches.length > 0) {
                    opportunities[category].push(...matches.map(match => ({
                        text: match[0],
                        context: this.extractContext(content, match.index, 100),
                        position: match.index
                    })));
                }
            }
        }

        return opportunities;
    }

    /**
     * 📄 EXTRACT CONTEXT AROUND MATCH
     */
    extractContext(content, position, contextLength = 100) {
        const start = Math.max(0, position - contextLength);
        const end = Math.min(content.length, position + contextLength);
        return content.substring(start, end).trim();
    }

    /**
     * 🚀 INITIALIZE AGENT ONCE (NO MORE RESTARTS!)
     */
    async initializeAgentOnce() {
        if (this.isAgentInitialized) {
            await this.log('INFO', '🤖 Agent already initialized - REUSING instance');
            return;
        }

        await this.log('INFO', '🚀 INITIALIZING AGENT (ONE TIME ONLY)...');
        
        try {
            this.runner = new RealAgentGenericRunner('./newsletter-config.json');
            
            // Initialize once and reuse
            await this.log('DEBUG', 'Setting up agent factory and systems...');
            await this.runner.factory.initialize();
            await this.runner.createAgentFromConfig();
            await this.runner.agent.start();
            await this.runner.initializeGenericSystems();
            this.runner.connectAgentCapabilities();
            
            this.agent = this.runner.agent;
            this.isAgentInitialized = true;
            
            await this.log('SUCCESS', '✅ AGENT INITIALIZED - Ready for continuous analysis');
            await this.log('INFO', `🧠 Agent: ${this.agent.name} - Memory system active`);
            
        } catch (error) {
            await this.log('ERROR', '❌ Agent initialization failed', { error: error.message });
            throw error;
        }
    }

    /**
     * 🔄 SETUP SIGNAL HANDLERS
     */
    setupSignalHandlers() {
        const gracefulShutdown = async (signal) => {
            await this.log('INFO', `Received ${signal}. Starting graceful shutdown...`);
            this.isRunning = false;
            
            await this.generateFinalReport();
            
            if (this.runner) {
                await this.runner.stopAgent();
            }
            
            await this.log('SUCCESS', 'Graceful shutdown complete');
            process.exit(0);
        };
        
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    }

    /**
     * 📊 GENERATE FINAL REPORT
     */
    async generateFinalReport() {
        const runtime = Date.now() - this.startTime;
        const runtimeHours = (runtime / (1000 * 60 * 60)).toFixed(2);
        
        const financialOpportunitiesFound = this.discoveryLog.reduce((total, log) => 
            total + (log.financialOpportunities ? Object.values(log.financialOpportunities).flat().length : 0), 0);
        
        const report = {
            summary: {
                totalProcessed: this.processedCount,
                totalRuntime: `${runtimeHours} hours`,
                totalDiscoveries: this.discoveryLog.length,
                totalErrors: this.errorLog.length,
                financialOpportunitiesFound,
                processingRate: (this.processedCount / (runtime / 1000 / 60)).toFixed(2) + ' newsletters/min',
                agentMemoryPersistence: this.isAgentInitialized ? 'MAINTAINED' : 'LOST'
            },
            discoveries: this.discoveryLog,
            errors: this.errorLog,
            generatedAt: new Date().toISOString()
        };
        
        await this.log('SUCCESS', '📊 FINAL PROCESSING REPORT', report.summary);
        
        try {
            const reportPath = `./logs/newsletter-processing-report-fixed-${Date.now()}.json`;
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            await this.log('INFO', `Detailed report saved to: ${reportPath}`);
        } catch (error) {
            await this.log('ERROR', 'Failed to save report', { error: error.message });
        }
    }

    /**
     * 📰 GENERATE ENHANCED NEWSLETTER VARIATIONS WITH FINANCIAL FOCUS
     */
    async generateNewsletterVariations() {
        const baseNewsletter = await fs.readFile('./newsletter-content.txt', 'utf8');
        
        const variations = [
            { name: 'Original_MilkRoad', content: baseNewsletter },
            
            {
                name: 'Massive_Liquidity_Event',
                content: baseNewsletter + '\n\n🚀 BREAKING: $2.5B liquidity injection into DeFi protocols. Uniswap V4 pools showing 300% volume spike. Cross-chain arbitrage opportunities opening up with 15-25% spreads between Ethereum and Arbitrum.'
            },
            
            {
                name: 'Institutional_Treasury_Wave', 
                content: baseNewsletter + '\n\n🏛️ INSTITUTIONAL SURGE: Tesla adds $5B Bitcoin, Apple treasury considering crypto allocation. Pension funds targeting 10% crypto exposure. ETF inflows hit $1.2B daily average this week.'
            },
            
            {
                name: 'DeFi_Yield_Explosion',
                content: baseNewsletter + '\n\n💰 YIELD FARMING GOLD RUSH: New Curve wars yielding 85% APY on stablecoin pools. Convex boost multipliers at all-time highs. Real yield protocols offering sustainable 35-45% returns backed by fee revenue.'
            },
            
            {
                name: 'MEV_Arbitrage_Signals',
                content: baseNewsletter + '\n\n⚡ MEV OPPORTUNITY ALERT: Cross-DEX arbitrage windows opening 15-20 times per hour. Flashloan opportunities in range $100K-$2M per transaction. New MEV protection creating guaranteed profit windows for sophisticated traders.'
            },
            
            {
                name: 'Airdrop_Season_Alpha',
                content: baseNewsletter + '\n\n🎁 AIRDROP ALPHA: LayerZero snapshot confirmed for $3B token distribution. Zk-Sync interactions farming for potential $50K+ allocations. New protocols launching with retroactive rewards for early LPs.'
            }
        ];
        
        return variations;
    }

    /**
     * 🚀 START EXTENSIVE PROCESSING
     */
    async startExtensiveProcessing() {
        await this.log('SUCCESS', '🚀 STARTING EXTENSIVE NEWSLETTER PROCESSING (FIXED VERSION)');
        await this.log('INFO', 'Initializing agent ONCE for continuous analysis...');
        
        // Initialize agent ONCE
        await this.initializeAgentOnce();
        
        this.isRunning = true;
        
        try {
            const newsletters = await this.generateNewsletterVariations();
            await this.log('INFO', `Generated ${newsletters.length} newsletter variations with enhanced financial focus`);
            
            let cycleCount = 0;
            
            while (this.isRunning) {
                cycleCount++;
                await this.log('INFO', `🔄 STARTING PROCESSING CYCLE ${cycleCount} (Agent memory preserved)`);
                
                for (const newsletter of newsletters) {
                    if (!this.isRunning) break;
                    
                    await this.processNewsletterVariationFixed(newsletter, cycleCount);
                    
                    // Brief pause between newsletters
                    await this.sleep(2000);
                }
                
                await this.log('SUCCESS', `✅ COMPLETED PROCESSING CYCLE ${cycleCount}`);
                await this.logProgressStats();
                
                // Longer pause between cycles
                await this.sleep(5000);
            }
            
        } catch (error) {
            await this.log('ERROR', 'Critical error in processing loop', { error: error.message });
            this.errorLog.push({
                timestamp: Date.now(),
                type: 'CRITICAL_ERROR',
                error: error.message,
                stack: error.stack
            });
        }
    }

    /**
     * 📰 PROCESS NEWSLETTER VARIATION (REUSING SAME AGENT!)
     */
    async processNewsletterVariationFixed(newsletter, cycleCount) {
        const startTime = Date.now();
        
        await this.log('INFO', `📰 PROCESSING: ${newsletter.name} (Cycle ${cycleCount}) - REUSING agent instance`);
        
        try {
            // Pre-analyze for financial opportunities using semantic patterns
            await this.log('FINANCIAL', '💰 Pre-scanning for financial opportunities...');
            const financialOpportunities = this.detectFinancialOpportunities(newsletter.content);
            
            const opportunityCount = Object.values(financialOpportunities).flat().length;
            await this.log('FINANCIAL', `💰 FINANCIAL PRE-SCAN COMPLETE: ${opportunityCount} opportunities detected`, {
                massivePriceMovements: financialOpportunities.massivePriceMovements.length,
                liquidityEvents: financialOpportunities.liquidityEvents.length,
                marketOpportunities: financialOpportunities.marketOpportunities.length,
                yieldOpportunities: financialOpportunities.yieldOpportunities.length,
                arbitrageSignals: financialOpportunities.arbitrageSignals.length,
                institutionalFlow: financialOpportunities.institutionalFlow.length,
                freeMoneyEvents: financialOpportunities.freeMoneyEvents.length
            });
            
            // Use EXISTING agent (no restart!)
            await this.log('DEBUG', '🤖 Using existing agent for analysis (NO RESTART)...');
            const result = await this.agent.analyzeNewsletter(newsletter.content, newsletter.name);
            
            this.processedCount++;
            const processingTime = Date.now() - startTime;
            
            await this.log('SUCCESS', `✅ PROCESSED: ${newsletter.name}`, {
                processingTime: `${processingTime}ms`,
                discoveries: result?.totalDiscoveries || 0,
                opportunities: result?.totalOpportunities || 0,
                viableOpportunities: result?.viableOpportunities || 0,
                dailyPotential: result?.totalDailyPotential || 0,
                preScannedFinancialOps: opportunityCount
            });
            
            // Enhanced discovery logging with financial context
            if (result?.discoveries || opportunityCount > 0) {
                this.discoveryLog.push({
                    newsletter: newsletter.name,
                    cycle: cycleCount,
                    timestamp: Date.now(),
                    discoveries: result.discoveries,
                    opportunities: result.opportunities,
                    financialOpportunities,
                    processingTime,
                    agentMemoryState: 'PERSISTENT'
                });
                
                await this.log('VERBOSE', `📊 Enhanced discovery logged with ${opportunityCount} financial opportunities`);
            }
            
        } catch (error) {
            await this.log('ERROR', `❌ FAILED: ${newsletter.name}`, { 
                error: error.message,
                cycle: cycleCount,
                agentState: this.isAgentInitialized ? 'INITIALIZED' : 'NOT_INITIALIZED'
            });
            
            this.errorLog.push({
                newsletter: newsletter.name,
                cycle: cycleCount,
                timestamp: Date.now(),
                error: error.message,
                stack: error.stack,
                agentMemoryState: this.isAgentInitialized ? 'PERSISTENT' : 'LOST'
            });
        }
    }

    /**
     * 📊 LOG PROGRESS STATISTICS
     */
    async logProgressStats() {
        const runtime = Date.now() - this.startTime;
        const runtimeMinutes = (runtime / (1000 * 60)).toFixed(1);
        const processingRate = this.processedCount / (runtime / 1000 / 60);
        
        const financialOpportunitiesFound = this.discoveryLog.reduce((total, log) => 
            total + (log.financialOpportunities ? Object.values(log.financialOpportunities).flat().length : 0), 0);
        
        await this.log('INFO', '📊 PROGRESS STATISTICS (FIXED VERSION)', {
            processed: this.processedCount,
            runtime: `${runtimeMinutes} minutes`,
            rate: `${processingRate.toFixed(2)} newsletters/min`,
            discoveries: this.discoveryLog.length,
            errors: this.errorLog.length,
            errorRate: `${(this.errorLog.length / Math.max(this.processedCount, 1) * 100).toFixed(1)}%`,
            financialOpportunitiesFound,
            agentMemoryState: this.isAgentInitialized ? 'PERSISTENT - NO RESTARTS' : 'BROKEN'
        });
    }

    /**
     * 😴 SLEEP UTILITY
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
    const processor = new ExtensiveNewsletterProcessorFixed();
    
    console.log('🚀 EXTENSIVE NEWSLETTER PROCESSOR STARTING (FIXED VERSION)...');
    console.log('🔧 FIXES: No agent restarts, semantic financial detection, memory continuity');
    console.log('📋 Press Ctrl+C to stop processing and generate final report');
    console.log('=' .repeat(80));
    
    await processor.startExtensiveProcessing();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { ExtensiveNewsletterProcessorFixed }; 