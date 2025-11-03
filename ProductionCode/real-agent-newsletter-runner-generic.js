#!/usr/bin/env node

/**
 * 🚀 REAL AGENT RUNNER - GENERIC SYSTEMS (NO HARDCODING!)
 * ========================================================
 * 
 * Starts an agent with ZERO hardcoded values - everything from config files
 * Uses ONLY variables for all configuration and content
 * 
 * NO HARDCODING - ALL VALUES FROM VARIABLES AND CONFIG FILES
 */

import { UltimateEliteAgentFactoryEnhanced } from './ultimate-elite-agent-factory-enhanced.js';
import { NewsletterAnalysisIntegration } from './src/tasks/NewsletterAnalysisIntegration.js';
import fs from 'fs';

class RealAgentGenericRunner {
    constructor(configPath = './newsletter-config.json') {
        this.config = this.loadConfig(configPath);
        this.factory = new UltimateEliteAgentFactoryEnhanced();
        this.agent = null;
        this.newsletterIntegration = null;
        this.isRunning = false;
        this.taskHistory = [];
    }

    /**
     * 📋 LOAD CONFIGURATION (NO HARDCODING!)
     */
    loadConfig(configPath) {
        try {
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            console.log(`📋 Configuration loaded from ${configPath}`);
            return config;
        } catch (error) {
            console.error(`❌ Failed to load config from ${configPath}:`, error.message);
            throw error;
        }
    }

    /**
     * 📰 LOAD NEWSLETTER CONTENT (NO HARDCODING!)
     */
    loadNewsletterContent(sourceName) {
        const source = this.config.newsletterSources[sourceName];
        if (!source) {
            throw new Error(`Newsletter source '${sourceName}' not found in config`);
        }

        try {
            const content = fs.readFileSync(source.contentFile, 'utf8');
            console.log(`📰 Newsletter content loaded from ${source.contentFile}`);
            return {
                content: content.trim(),
                source: source.name,
                url: source.url,
                type: source.type
            };
        } catch (error) {
            console.error(`❌ Failed to load newsletter content from ${source.contentFile}:`, error.message);
            throw error;
        }
    }

    /**
     * 🚀 START AGENT WITH GENERIC SYSTEMS
     */
    async startAgent() {
        const stepMessages = {
            1: 'Initializing factory...',
            2: 'Creating agent...',
            3: 'Starting agent...',
            4: 'Initializing generic analysis systems...',
            5: 'Connecting agent capabilities...',
            6: 'Starting real content analysis...'
        };

        console.log('🚀 STARTING AGENT WITH GENERIC ANALYSIS SYSTEMS');
        console.log('=' .repeat(60));
        
        let analysisResults = null;
        
        try {
            for (let step = 1; step <= 6; step++) {
                console.log(`\n📋 Step ${step}: ${stepMessages[step]}`);
                
                switch(step) {
                    case 1: await this.factory.initialize(); break;
                    case 2: await this.createAgentFromConfig(); break;
                    case 3: await this.agent.start(); break;
                    case 4: await this.initializeGenericSystems(); break;
                    case 5: this.connectAgentCapabilities(); break;
                    case 6: analysisResults = await this.startRealContentAnalysis(); break;
                }
                
                console.log(`✅ Step ${step} complete`);
            }
            
            return analysisResults;
            
        } catch (error) {
            console.error('❌ Agent startup failed:', error);
            throw error;
        }
    }

    /**
     * 🤖 CREATE AGENT FROM CONFIG
     */
    async createAgentFromConfig() {
        const characterFile = this.config.agentConfig.characterFile;
        this.agent = await this.factory.createAgentFromCharacter(characterFile);
        console.log(`✅ Agent created: ${this.agent.name}`);
    }

    /**
     * 🔧 INITIALIZE GENERIC SYSTEMS
     */
    async initializeGenericSystems() {
        const agentCapabilities = this.config.agentConfig.capabilities;
        const availableCapital = this.config.agentConfig.defaultCapital;
        
        this.newsletterIntegration = new NewsletterAnalysisIntegration(
            agentCapabilities,
            availableCapital
        );
        
        this.setupLearningIntegration();
        
        console.log(`🔧 Generic systems initialized with $${availableCapital} capital and ${Object.keys(agentCapabilities).length} capabilities`);
    }

    /**
     * 🔗 SETUP LEARNING INTEGRATION
     */
    setupLearningIntegration() {
        this.newsletterIntegration.on('analysisComplete', (report) => {
            this.handleAnalysisComplete(report);
        });
        
        if (this.agent.learning) {
            this.newsletterIntegration.on('analysisComplete', (report) => {
                if (this.agent.learning.mdp) {
                    this.agent.learning.mdp.updateState(this.agent.id, {
                        lastAnalysis: report.timestamp,
                        opportunitiesFound: report.totalOpportunities,
                        dailyPotential: report.totalDailyPotential,
                        rewardSignal: report.learningSignals.rewardSignal
                    });
                }
                
                if (this.agent.learning.a2c) {
                    this.agent.learning.a2c.distributeReward(this.agent.id, {
                        analysisReward: report.learningSignals.rewardSignal,
                        explorationBonus: report.learningSignals.explorationValue,
                        competitiveAdvantage: report.learningSignals.competitiveAdvantage
                    });
                }
            });
        }
        
        console.log('🔗 Learning integration setup complete');
    }

    /**
     * 🤖 CONNECT AGENT CAPABILITIES
     */
    connectAgentCapabilities() {
        this.agent.analyzeNewsletter = async (content, source = 'unknown') => {
            console.log(`📰 Agent starting newsletter analysis from ${source}...`);
            
            const startTime = Date.now();
            
            try {
                const report = await this.newsletterIntegration.analyzeNewsletterContent(
                    content,
                    source,
                    { timestamp: startTime, agentId: this.agent.id }
                );
                
                console.log(`📰 Agent completed newsletter analysis in ${report.processingTime}ms`);
                console.log(`   🎯 Found ${report.totalOpportunities} opportunities, ${report.viableOpportunities} viable`);
                console.log(`   💰 Daily potential: $${report.totalDailyPotential.toFixed(2)}`);
                
                this.taskHistory.push({
                    type: 'newsletter_analysis',
                    timestamp: startTime,
                    source,
                    report
                });
                
                return report;
                
            } catch (error) {
                console.error(`❌ Agent newsletter analysis failed:`, error);
                throw error;
            }
        };
        
        this.agent.updateCapabilities = (newCapabilities) => {
            this.newsletterIntegration.updateAgentCapabilities(newCapabilities);
            console.log(`🔄 Agent capabilities updated`);
        };
        
        this.agent.updateCapital = (newCapital) => {
            this.newsletterIntegration.updateAvailableCapital(newCapital);
            console.log(`💰 Agent capital updated: $${newCapital}`);
        };
        
        console.log('🤖 Agent capabilities connected');
    }

    /**
     * 📰 START REAL CONTENT ANALYSIS
     */
    async startRealContentAnalysis() {
        console.log('🔄 Starting real content analysis...');
        
        // Get newsletter sources from config
        const sourceNames = Object.keys(this.config.newsletterSources);
        
        const allResults = [];
        let totalDiscoveries = 0;
        let totalOpportunities = 0;
        let totalDailyPotential = 0;
        let viableOpportunities = 0;
        
        for (const sourceName of sourceNames) {
            const report = await this.analyzeNewsletterFromConfig(sourceName);
            allResults.push(report);
            
            totalDiscoveries += report.totalDiscoveries || 0;
            totalOpportunities += report.totalOpportunities || 0;
            totalDailyPotential += report.totalDailyPotential || 0;
            
            if (report.totalDailyPotential >= this.config.analysisConfig.legendaryThreshold) {
                viableOpportunities++;
            }
        }
        
        console.log('✅ Real content analysis complete');
        console.log('🎯 Agent systems tested with REAL production data');
        
        // Return aggregated results
        return {
            totalDiscoveries,
            totalOpportunities,
            totalDailyPotential,
            viableOpportunities,
            sources: allResults.length,
            reports: allResults,
            discoveries: allResults.flatMap(r => r.discoveries || []),
            opportunities: allResults.flatMap(r => r.opportunities || [])
        };
    }

    /**
     * 📊 ANALYZE NEWSLETTER FROM CONFIG
     */
    async analyzeNewsletterFromConfig(sourceName) {
        console.log(`\n📰 ANALYZING NEWSLETTER: ${sourceName.toUpperCase()}`);
        
        const newsletterData = this.loadNewsletterContent(sourceName);
        
        console.log(`📰 Source: ${newsletterData.source}`);
        console.log(`🔗 URL: ${newsletterData.url}`);
        console.log(`📄 Type: ${newsletterData.type}`);
        console.log('📰 Analyzing with generic systems...');
        
        const report = await this.agent.analyzeNewsletter(
            newsletterData.content, 
            newsletterData.source
        );
        
        console.log('\n📊 ANALYSIS COMPLETE');
        console.log(`✅ Found ${report.totalOpportunities} opportunities from REAL content`);
        console.log(`💰 Daily potential: $${report.totalDailyPotential.toFixed(2)}`);
        console.log(`🎯 Goal progress: ${(report.goalProgress * 100).toFixed(2)}% of ${this.config.analysisConfig.weeklyGoal}/week`);
        
        if (report.totalDailyPotential >= this.config.analysisConfig.legendaryThreshold) {
            console.log(`🏆 LEGENDARY PROMOTION TRIGGERED! ($${report.totalDailyPotential.toFixed(2)} ≥ $${this.config.analysisConfig.legendaryThreshold})`);
        }
        
        return report;
    }

    /**
     * 📊 SHOW STATUS
     */
    showStatus() {
        const stats = this.newsletterIntegration.getAnalysisStatistics();
        
        const statusConfig = this.config.loggingConfig;
        
        if (statusConfig.showDetailedMetrics) {
            console.log(`\n📊 AGENT STATUS:`);
            console.log(`   🤖 Agent: ${this.agent.name} (Running: ${this.isRunning})`);
            console.log(`   📰 Analyses: ${stats.totalAnalyses}`);
            console.log(`   💰 Avg Daily Potential: $${stats.averageDailyPotential.toFixed(2)}`);
            console.log(`   🏆 Legendary Promotions: ${stats.legendaryPromotions}`);
            console.log(`   💾 Memory Store: ${stats.memoryStoreSize} items`);
            console.log(`   ⏱️ Avg Processing: ${stats.averageProcessingTime.toFixed(0)}ms`);
            console.log(`   🛠️ Capabilities: ${stats.capabilitiesTracked}`);
            console.log(`   💵 Available Capital: $${stats.availableCapital}`);
        }
    }

    /**
     * 🔄 HANDLE ANALYSIS COMPLETE
     */
    handleAnalysisComplete(report) {
        const loggingConfig = this.config.loggingConfig;
        
        if (loggingConfig.logAnalysisResults) {
            console.log(`\n🎯 ANALYSIS COMPLETE: ${report.source}`);
            console.log(`   💰 Daily Potential: $${report.totalDailyPotential.toFixed(2)}`);
            console.log(`   🎯 Goal Progress: ${(report.goalProgress * 100).toFixed(2)}% of ${this.config.analysisConfig.weeklyGoal}/week`);
            console.log(`   📊 Learning Signal: ${report.learningSignals.rewardSignal.toFixed(2)}`);
            
            if (report.totalDailyPotential >= this.config.analysisConfig.legendaryThreshold) {
                console.log(`   🏆 LEGENDARY PROMOTION TRIGGERED!`);
            }
        }
    }

    /**
     * ⏹️ STOP AGENT
     */
    async stopAgent() {
        this.isRunning = false;
        if (this.agent) {
            await this.agent.stop();
        }
        console.log('⏹️ Agent stopped');
    }
}

/**
 * 🚀 RUN AGENT WITH CONFIG
 */
async function runAgent() {
    const configPath = process.argv[2] || './newsletter-config.json';
    const runner = new RealAgentGenericRunner(configPath);
    
    try {
        const analysisResults = await runner.startAgent();
        
        console.log('\n🎯 REAL AGENT ANALYSIS COMPLETE');
        console.log('✅ NO HARDCODED VALUES - ALL FROM CONFIG FILES');
        console.log(`🎯 Total Opportunities: ${analysisResults.totalOpportunities}`);
        console.log(`🎯 Viable Opportunities: ${analysisResults.viableOpportunities}`);
        console.log(`💰 Total Daily Potential: $${analysisResults.totalDailyPotential.toFixed(2)}`);
        console.log(`🎯 Goal Progress: ${(analysisResults.goalProgress * 100).toFixed(2)}% of ${runner.config.analysisConfig.weeklyGoal}/week`);
        
    } catch (error) {
        console.error('\n❌ Agent failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAgent();
}

export { RealAgentGenericRunner }; 