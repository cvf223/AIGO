#!/usr/bin/env node

/**
 * 🚀 EXTENSIVE NEWSLETTER PROCESSOR
 * =================================
 * 
 * Processes multiple newsletters with extensive logging until interrupted.
 * Designed for thorough testing and discovery analysis.
 */

import { RealAgentGenericRunner } from './real-agent-newsletter-runner-generic.js';
import fs from 'fs/promises';
import path from 'path';

class ExtensiveNewsletterProcessor {
    constructor() {
        this.runner = new RealAgentGenericRunner('./newsletter-config.json');
        this.processedCount = 0;
        this.discoveryLog = [];
        this.errorLog = [];
        this.startTime = Date.now();
        this.isRunning = false;
        
        // Extensive logging configuration
        this.logLevel = 'VERBOSE'; // VERBOSE, DEBUG, INFO
        this.logToFile = true;
        this.logFilePath = './logs/extensive-newsletter-processing.log';
        
        this.setupSignalHandlers();
    }

    /**
     * 📝 EXTENSIVE LOGGING
     */
    async log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data,
            processedCount: this.processedCount,
            runtime: Date.now() - this.startTime
        };
        
        // Console logging with colors
        const levelColors = {
            'ERROR': '\x1b[31m',   // Red
            'WARN': '\x1b[33m',    // Yellow  
            'INFO': '\x1b[36m',    // Cyan
            'DEBUG': '\x1b[35m',   // Magenta
            'VERBOSE': '\x1b[90m', // Gray
            'SUCCESS': '\x1b[32m'  // Green
        };
        
        const color = levelColors[level] || '';
        const reset = '\x1b[0m';
        
        console.log(`${color}[${timestamp}] ${level}: ${message}${reset}`);
        if (data) {
            console.log(`${color}   Data:`, JSON.stringify(data, null, 2), reset);
        }
        
        // File logging
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
     * 🔄 SETUP SIGNAL HANDLERS
     */
    setupSignalHandlers() {
        const gracefulShutdown = async (signal) => {
            await this.log('INFO', `Received ${signal}. Starting graceful shutdown...`);
            this.isRunning = false;
            
            await this.generateFinalReport();
            
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
        
        const report = {
            summary: {
                totalProcessed: this.processedCount,
                totalRuntime: `${runtimeHours} hours`,
                totalDiscoveries: this.discoveryLog.length,
                totalErrors: this.errorLog.length,
                processingRate: (this.processedCount / (runtime / 1000 / 60)).toFixed(2) + ' newsletters/min'
            },
            discoveries: this.discoveryLog,
            errors: this.errorLog,
            generatedAt: new Date().toISOString()
        };
        
        await this.log('SUCCESS', 'FINAL PROCESSING REPORT', report.summary);
        
        // Save detailed report to file
        try {
            const reportPath = `./logs/newsletter-processing-report-${Date.now()}.json`;
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            await this.log('INFO', `Detailed report saved to: ${reportPath}`);
        } catch (error) {
            await this.log('ERROR', 'Failed to save report', { error: error.message });
        }
    }

    /**
     * 📰 GENERATE NEWSLETTER CONTENT VARIATIONS
     */
    async generateNewsletterVariations() {
        const baseNewsletter = await fs.readFile('./newsletter-content.txt', 'utf8');
        
        // Create variations for testing
        const variations = [
            // Original
            { name: 'Original_MilkRoad', content: baseNewsletter },
            
            // Price focused variations
            {
                name: 'High_Value_Crypto_News',
                content: baseNewsletter + '\n\n🚀 BREAKING: Bitcoin hits $150,000, Ethereum reaches $8,000. Major institutions allocating $50B to crypto portfolios.'
            },
            
            // DeFi focused variations
            {
                name: 'DeFi_Opportunities',
                content: baseNewsletter + '\n\n💰 NEW DeFi PROTOCOL: YieldMax offering 45% APY on stablecoin deposits. TVL already at $2.5B in first week.'
            },
            
            // Arbitrage focused variations
            {
                name: 'Arbitrage_Signals',
                content: baseNewsletter + '\n\n⚡ ARBITRAGE ALERT: 15% price difference between Binance and Coinbase for $ARB token. $500M daily volume opportunity.'
            },
            
            // Technical analysis variations
            {
                name: 'Technical_Analysis',
                content: baseNewsletter + '\n\n📊 TECHNICAL BREAKOUT: Multiple coins showing bullish patterns. Expected 200-300% gains in next 30 days based on on-chain metrics.'
            },
            
            // Regulatory variations
            {
                name: 'Regulatory_Updates',
                content: baseNewsletter + '\n\n🏛️ REGULATORY NEWS: New crypto-friendly legislation passed. Institutional adoption expected to increase 10x over next quarter.'
            }
        ];
        
        return variations;
    }

    /**
     * 🚀 START EXTENSIVE PROCESSING
     */
    async startExtensiveProcessing() {
        await this.log('SUCCESS', '🚀 STARTING EXTENSIVE NEWSLETTER PROCESSING');
        await this.log('INFO', 'Configuration loaded, generating newsletter variations...');
        
        this.isRunning = true;
        
        try {
            // Generate newsletter variations
            const newsletters = await this.generateNewsletterVariations();
            await this.log('INFO', `Generated ${newsletters.length} newsletter variations for testing`);
            
            let cycleCount = 0;
            
            while (this.isRunning) {
                cycleCount++;
                await this.log('INFO', `🔄 STARTING PROCESSING CYCLE ${cycleCount}`);
                
                for (const newsletter of newsletters) {
                    if (!this.isRunning) break;
                    
                    await this.processNewsletterVariation(newsletter, cycleCount);
                    
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
     * 📰 PROCESS NEWSLETTER VARIATION
     */
    async processNewsletterVariation(newsletter, cycleCount) {
        const startTime = Date.now();
        
        await this.log('INFO', `📰 PROCESSING: ${newsletter.name} (Cycle ${cycleCount})`);
        
        try {
            // Write newsletter content to temp file
            const tempFilePath = `./newsletter-content-temp-${Date.now()}.txt`;
            await fs.writeFile(tempFilePath, newsletter.content);
            
            // Update config to use temp file
            const config = JSON.parse(await fs.readFile('./newsletter-config.json', 'utf8'));
            config.newsletterSources.milkRoad.contentFile = tempFilePath;
            
            await fs.writeFile('./newsletter-config-temp.json', JSON.stringify(config, null, 2));
            
            // Process with extensive logging
            const runner = new RealAgentGenericRunner('./newsletter-config-temp.json');
            
            await this.log('DEBUG', 'Initializing agent systems...');
            const result = await runner.startAgent();
            
            this.processedCount++;
            const processingTime = Date.now() - startTime;
            
            await this.log('SUCCESS', `✅ PROCESSED: ${newsletter.name}`, {
                processingTime: `${processingTime}ms`,
                discoveries: result?.totalDiscoveries || 0,
                opportunities: result?.totalOpportunities || 0,
                viableOpportunities: result?.viableOpportunities || 0,
                dailyPotential: result?.totalDailyPotential || 0
            });
            
            // Log discoveries
            if (result?.discoveries) {
                this.discoveryLog.push({
                    newsletter: newsletter.name,
                    cycle: cycleCount,
                    timestamp: Date.now(),
                    discoveries: result.discoveries,
                    opportunities: result.opportunities,
                    processingTime
                });
                
                await this.log('VERBOSE', 'Discovery details logged');
            }
            
            // Cleanup temp files
            await fs.unlink(tempFilePath).catch(() => {});
            await fs.unlink('./newsletter-config-temp.json').catch(() => {});
            
        } catch (error) {
            await this.log('ERROR', `❌ FAILED: ${newsletter.name}`, { 
                error: error.message,
                cycle: cycleCount
            });
            
            this.errorLog.push({
                newsletter: newsletter.name,
                cycle: cycleCount,
                timestamp: Date.now(),
                error: error.message,
                stack: error.stack
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
        
        await this.log('INFO', '📊 PROGRESS STATISTICS', {
            processed: this.processedCount,
            runtime: `${runtimeMinutes} minutes`,
            rate: `${processingRate.toFixed(2)} newsletters/min`,
            discoveries: this.discoveryLog.length,
            errors: this.errorLog.length,
            errorRate: `${(this.errorLog.length / Math.max(this.processedCount, 1) * 100).toFixed(1)}%`
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
    const processor = new ExtensiveNewsletterProcessor();
    
    console.log('🚀 EXTENSIVE NEWSLETTER PROCESSOR STARTING...');
    console.log('📋 Press Ctrl+C to stop processing and generate final report');
    console.log('=' .repeat(60));
    
    await processor.startExtensiveProcessing();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export { ExtensiveNewsletterProcessor }; 