import { EventEmitter } from 'events';
import { GenericNewsletterAnalysis } from '../analysis/GenericNewsletterAnalysis.js';
import { GenericConclusionEngine } from '../analysis/GenericConclusionEngine.js';
import { GenericMemoryRatingSystem } from '../memory/GenericMemoryRatingSystem.js';

/**
 * 🔗 NEWSLETTER ANALYSIS INTEGRATION
 * =================================
 * 
 * Orchestrates the complete analysis pipeline:
 * 1. Newsletter → DISCOVERIES (GenericNewsletterAnalysis)
 * 2. Discoveries → OPPORTUNITIES (GenericConclusionEngine) 
 * 3. Opportunities → MEMORIES (GenericMemoryRatingSystem)
 * 4. Integration with background tasks and learning systems
 * 
 * ENGINEERING PRECISION:
 * - DISCOVERIES: Raw data findings from newsletter analysis
 * - OPPORTUNITIES: Actionable profit potential identified from discoveries
 * - STRATEGIES: Execution plans (future enhancement)
 */

export class NewsletterAnalysisIntegration extends EventEmitter {
    constructor(capabilities = [], availableCapital = 1000) {
        super();
        
        this.capabilities = capabilities || [];
        this.availableCapital = availableCapital || 1000;
        
        // Initialize analysis engines
        this.newsletterAnalysis = new GenericNewsletterAnalysis();
        this.conclusionEngine = new GenericConclusionEngine(capabilities, availableCapital);
        this.memoryRating = new GenericMemoryRatingSystem(capabilities, availableCapital);
        
        // Analysis statistics
        this.analysisStats = {
            totalAnalyses: 0,
            totalDiscoveries: 0,
            totalOpportunities: 0,
            totalMemories: 0,
            averageProcessingTime: 0,
            averageDailyPotential: 0,
            legendaryPromotions: 0
        };
        
        console.log('🔗 Newsletter Analysis Integration initialized');
        console.log(`   💰 Available capital: $${availableCapital}`);
        console.log(`   🛠️ Capabilities: ${capabilities.length} defined`);
    }

    /**
     * 🎯 SETUP EVENT HANDLERS
     */
    setupEventHandlers() {
        // Newsletter analysis complete → Conclusion generation
        this.newsletterAnalyzer.on('analysisComplete', (analysis) => {
            this.processNewsletterAnalysis(analysis);
        });
        
        // Memory rating complete → Store and categorize
        this.memoryRating.on('memoryRated', (rating) => {
            this.handleMemoryRating(rating);
        });
        
        // Conclusion generated → Memory promotion check
        this.conclusionEngine.on('conclusionGenerated', (conclusion) => {
            this.handleConclusionGenerated(conclusion);
        });
    }

    /**
     * 🚀 ANALYZE NEWSLETTER CONTENT
     * Complete pipeline: Content → Discoveries → Opportunities → Memories
     */
    async analyzeNewsletterContent(content, source, metadata = {}) {
        const startTime = Date.now();
        
        try {
            console.log('🚀 Starting complete newsletter analysis from ' + source + '...');
            
            // Step 1: Extract discoveries from content
            console.log('📰 Step 1: Extracting all data types...');
            const discoveries = await this.newsletterAnalysis.analyzeNewsletterContent(content, source, metadata);
            console.log('📰 Newsletter analysis complete: ' + Object.keys(discoveries).length + ' data types extracted');
            
            // Step 2: Generate opportunities from discoveries  
            console.log('🧠 Step 2: Generating opportunities from discoveries...');
            const conclusion = await this.generateProgressiveConclusions(discoveries, metadata);
            
            // Step 3: Rate and store memories
            console.log('💾 Step 3: Rating and storing memories...');
            const memories = await this.rateAndStoreMemories(conclusion, source, metadata);
            
            // Step 4: Generate final report
            const report = this.generateAnalysisReport(discoveries, conclusion, memories, startTime);
            
            // Update statistics
            this.updateAnalysisStatistics(report);
            
            return report;
            
        } catch (error) {
            console.error('❌ Newsletter analysis failed:', error);
            throw error;
        }
    }

    /**
     * 🧠 GENERATE PROGRESSIVE OPPORTUNITIES FROM DISCOVERIES
     */
    async generateProgressiveConclusions(discoveries, metadata = {}) {
        console.log('🧠 Generating progressive opportunities...');
        
        // Stage 1: Quick scan for immediate opportunities
        console.log('   ⏱️ Stage 1: Quick scan analysis...');
        const stage1 = this.conclusionEngine.generateConclusion(discoveries, 'stage1', metadata);
        
        // Rate and store stage 1 memory
        await this.rateAndStoreStageMemory(stage1, 'stage1');
        
        // Stage 2: Focused analysis for deeper opportunities
        console.log('   ⏱️ Stage 2: Focused analysis...');
        const stage2 = this.conclusionEngine.generateConclusion(discoveries, 'stage2', metadata);
        
        // Rate and store stage 2 memory
        await this.rateAndStoreStageMemory(stage2, 'stage2');
        
        // Stage 3: Comprehensive analysis combining all opportunities
        console.log('   ⏱️ Stage 3: Comprehensive synthesis...');
        const comprehensive = this.conclusionEngine.generateConclusion(discoveries, 'comprehensive', metadata);
        
        // Rate and store comprehensive memory
        await this.rateAndStoreStageMemory(comprehensive, 'comprehensive');
        
        // Return the most comprehensive conclusion
        return {
            ...comprehensive,
            progressiveStages: {
                stage1,
                stage2,
                comprehensive
            }
        };
    }

    /**
     * 💾 RATE AND STORE STAGE MEMORY
     */
    async rateAndStoreStageMemory(stageResult, stageName) {
        const memoryId = `conclusion_${stageName}_${Date.now()}`;
        
        console.log(`📊 Rating memory importance: ${memoryId}`);
        const rating = this.memoryRating.rateMemoryImportance(stageResult.conclusionText, {
            source: 'newsletter_analysis',
            stage: stageName,
            viableOpportunities: stageResult.viableOpportunities,
            totalDailyPotential: stageResult.totalDailyPotential,
            dataQuality: stageResult.dataQuality
        });
        
        console.log(`📊 Memory rated: ${rating.importance} (score: ${rating.totalScore.toFixed(2)})`);
        console.log(`💾 Memory rated: ${memoryId} → ${rating.importance}`);
        
        // Store memory with rating
        const memory = {
            id: memoryId,
            content: stageResult.conclusionText,
            importance: rating.importance,
            score: rating.totalScore,
            metadata: {
                ...stageResult.metadata,
                stage: stageName,
                rating: rating
            },
            timestamp: Date.now()
        };
        
        // Store in memory system (simulated for now)
        console.log(`💾 Stored ${stageName} memory: ${rating.importance} (score: ${rating.totalScore.toFixed(2)})`);
        
        return memory;
    }

    /**
     * 💾 RATE AND STORE MEMORIES
     */
    async rateAndStoreMemories(conclusion, source, metadata = {}) {
        const memories = [];
        
        // Rate main conclusion
        if (conclusion.conclusionText) {
            const memory = await this.rateAndStoreStageMemory(conclusion, 'final');
            memories.push(memory);
        }
        
        // Rate progressive stages if available
        if (conclusion.progressiveStages) {
            for (const [stageName, stageResult] of Object.entries(conclusion.progressiveStages)) {
                const memory = await this.rateAndStoreStageMemory(stageResult, stageName);
                memories.push(memory);
            }
        }
        
        return memories;
    }

    /**
     * 📊 GENERATE ANALYSIS REPORT
     */
    generateAnalysisReport(discoveries, conclusion, memories, startTime) {
        const processingTime = Date.now() - startTime;
        
        const report = {
            // Core metrics
            totalDiscoveries: Object.keys(discoveries).length,
            totalOpportunities: conclusion.totalOpportunities || 0,
            viableOpportunities: conclusion.viableOpportunities || 0,
            totalDailyPotential: conclusion.totalDailyPotential || 0,
            weeklyPotential: (conclusion.totalDailyPotential || 0) * 7,
            
            // Quality metrics
            averageConfidence: conclusion.averageConfidence || 0,
            averageDoability: conclusion.averageDoability || 0,
            dataQuality: conclusion.dataQuality || 0,
            
            // Performance metrics
            processingTime,
            
            // Memory metrics
            topMemories: memories.sort((a, b) => b.score - a.score).slice(0, 5),
            memoryCount: memories.length,
            
            // Goal progress
            goalProgress: this.calculateGoalProgress(conclusion.totalDailyPotential || 0),
            
            // Next actions
            nextActions: this.generateNextActions(conclusion, discoveries),
            
            // Raw data
            discoveries,
            conclusion,
            memories
        };
        
        return report;
    }

    /**
     * 🎯 CALCULATE GOAL PROGRESS
     */
    calculateGoalProgress(dailyPotential) {
        const weeklyPotential = dailyPotential * 7;
        const weeklyGoal = 14000; // $14k/week goal from config
        return weeklyPotential / weeklyGoal;
    }

    /**
     * 🎯 GENERATE NEXT ACTIONS
     */
    generateNextActions(conclusion, discoveries) {
        const actions = [];
        
        if (conclusion.viableOpportunities === 0) {
            actions.push('Investigate additional data sources');
            actions.push('Refine discovery analysis criteria');
            actions.push('Expand keyword detection patterns');
        } else {
            actions.push(`Validate ${conclusion.viableOpportunities} identified opportunities`);
            actions.push('Develop execution strategies for top opportunities');
            actions.push('Monitor market conditions for timing');
        }
        
        // Add specific actions based on discoveries
        const numericalFindings = discoveries.numericalFindings || [];
        if (numericalFindings.length > 0) {
            actions.push('Deep dive into numerical pattern analysis');
        }
        
        return actions;
    }

    /**
     * 📊 UPDATE ANALYSIS STATISTICS
     */
    updateAnalysisStatistics(report) {
        this.analysisStats.totalAnalyses++;
        this.analysisStats.totalDiscoveries += report.totalDiscoveries;
        this.analysisStats.totalOpportunities += report.totalOpportunities;
        this.analysisStats.totalMemories += report.memoryCount;
        
        // Update averages
        this.analysisStats.averageProcessingTime = 
            (this.analysisStats.averageProcessingTime + report.processingTime) / 2;
        
        this.analysisStats.averageDailyPotential = 
            (this.analysisStats.averageDailyPotential + report.totalDailyPotential) / 2;
        
        // Check for legendary promotions
        if (report.totalDailyPotential >= 100) { // $100/day threshold
            this.analysisStats.legendaryPromotions++;
        }
    }

    /**
     * 📊 GET ANALYSIS STATISTICS
     */
    getAnalysisStatistics() {
        return {
            ...this.analysisStats,
            memoryStoreSize: this.analysisStats.totalMemories,
            capabilitiesTracked: this.capabilities.length,
            availableCapital: this.availableCapital
        };
    }

    /**
     * 🔄 UPDATE AGENT CAPABILITIES
     */
    updateAgentCapabilities(newCapabilities) {
        this.agentCapabilities = { ...this.agentCapabilities, ...newCapabilities };
        this.conclusionEngine.capabilities = this.agentCapabilities;
        
        console.log(`🔄 Updated agent capabilities: ${Object.keys(this.agentCapabilities).length} total`);
    }

    /**
     * 💰 UPDATE AVAILABLE CAPITAL
     */
    updateAvailableCapital(newCapital) {
        this.availableCapital = newCapital;
        this.conclusionEngine.availableCapital = newCapital;
        
        console.log(`💰 Updated available capital: $${newCapital}`);
    }

    // Event handlers
    processNewsletterAnalysis(analysis) {
        console.log(`📰 Newsletter analysis complete: ${analysis.dataTypes.size} data types extracted`);
    }

    handleMemoryRating(rating) {
        console.log(`💾 Memory rated: ${rating.memoryId} → ${rating.importance}`);
    }

    handleConclusionGenerated(conclusion) {
        console.log(`🧠 Conclusion generated: Stage ${conclusion.stage}, confidence ${(conclusion.confidence * 100).toFixed(0)}%`);
    }
}

export default NewsletterAnalysisIntegration; 