/**
 * 🚀 ENHANCED MULTI-LLM WITH LIVE DATA INTEGRATION
 * ==============================================
 * 
 * Combines Multi-LLM consensus with live blockchain data to solve:
 * 1. Outdated LLM training data (6-24 months behind)
 * 2. Rapidly evolving DeFi protocol parameters
 * 3. Inaccurate fee structures and tokenomics
 * 4. Missing recent protocol updates
 * 
 * INTEGRATION APPROACH:
 * - Live data injection into all LLM prompts
 * - Protocol-specific data validation
 * - Real-time documentation generation
 * - Fallback to cached data when APIs fail
 * - Cross-LLM validation of data interpretation
 */

import { EliteMultiLLMAssistanceEngine } from './EliteMultiLLMAssistanceEngine.js';
import { LiveBlockchainDataAugmentation } from './LiveBlockchainDataAugmentation.js';

export class EnhancedMultiLLMWithLiveData {
    constructor(agentSystem, config = {}) {
        this.agentSystem = agentSystem;
        
        // Initialize core systems
        this.multiLLMEngine = new EliteMultiLLMAssistanceEngine(agentSystem, config.llmConfig);
        this.liveDataAugmentation = new LiveBlockchainDataAugmentation(config.dataConfig);
        
        // Integration configuration
        this.integrationConfig = {
            alwaysUseLatestData: true,
            validateDataAcrossLLMs: true,
            fallbackToTrainingData: false,
            maxDataAge: 300000, // 5 minutes max data age
            requireDataForHighValue: true, // Require live data for >$5K opportunities
            ...config.integration
        };
        
        // Performance tracking
        this.integrationMetrics = {
            totalRequests: 0,
            dataAugmentedRequests: 0,
            consensusWithLiveData: 0,
            dataAccuracyImprovements: 0,
            avgDataFreshness: 0
        };
        
        console.log('🚀 Enhanced Multi-LLM with Live Data Integration initialized');
        console.log('   🔗 Live blockchain data augmentation enabled');
        console.log('   🤖 Multi-LLM consensus validation active');
        console.log('   📊 Real-time protocol data injection ready');
    }

    /**
     * 🎯 REQUEST ENHANCED LLM ASSISTANCE
     */
    async requestEnhancedLLMAssistance(taskName, analysisData, priority = 'normal') {
        console.log(`🎯 Enhanced LLM assistance requested: ${taskName}`);
        
        const startTime = Date.now();
        this.integrationMetrics.totalRequests++;
        
        try {
            // Step 1: Determine if live data is needed
            const needsLiveData = this.shouldUseLiveData(analysisData, priority);
            
            let augmentationResult = null;
            let enhancedAnalysisData = analysisData;
            
            if (needsLiveData) {
                console.log('   🔗 Augmenting with live blockchain data...');
                
                // Step 2: Augment analysis data with live blockchain information
                const taskContext = {
                    taskType: this.extractTaskType(taskName),
                    protocols: this.extractMentionedProtocols(analysisData),
                    opportunityValue: this.extractOpportunityValue(analysisData)
                };
                
                augmentationResult = await this.liveDataAugmentation.augmentPromptWithLiveData(
                    JSON.stringify(analysisData), 
                    taskContext
                );
                
                // Enhance analysis data with live information
                enhancedAnalysisData = {
                    ...analysisData,
                    liveDataContext: augmentationResult.dataUsed,
                    marketContext: augmentationResult.marketContext,
                    dataFreshness: augmentationResult.dataFreshness
                };
                
                this.integrationMetrics.dataAugmentedRequests++;
                this.integrationMetrics.avgDataFreshness = 
                    (this.integrationMetrics.avgDataFreshness + augmentationResult.dataFreshness) / 2;
            }
            
            // Step 3: Request Multi-LLM analysis with enhanced data
            const multiLLMResult = await this.multiLLMEngine.requestMultiLLMAssistance(
                taskName,
                enhancedAnalysisData,
                priority
            );
            
            // Step 4: Validate data interpretation across LLMs if live data was used
            let dataValidationResult = null;
            if (needsLiveData && this.integrationConfig.validateDataAcrossLLMs) {
                dataValidationResult = this.validateDataInterpretationAcrossLLMs(
                    multiLLMResult,
                    augmentationResult.dataUsed
                );
                
                if (dataValidationResult.hasInconsistencies) {
                    console.log('   ⚠️ Data interpretation inconsistencies detected');
                    this.integrationMetrics.dataAccuracyImprovements++;
                }
            }
            
            // Step 5: Generate final enhanced result
            const enhancedResult = this.generateEnhancedResult(
                multiLLMResult,
                augmentationResult,
                dataValidationResult
            );
            
            // Step 6: Track performance
            const processingTime = Date.now() - startTime;
            this.trackEnhancedPerformance(enhancedResult, processingTime);
            
            console.log(`✅ Enhanced LLM assistance completed in ${processingTime}ms`);
            console.log(`   📊 Data freshness: ${enhancedResult.dataFreshness || 'N/A'} minutes`);
            console.log(`   🤖 LLMs used: ${multiLLMResult.llmsUsed.length}`);
            console.log(`   🎯 Consensus confidence: ${(multiLLMResult.confidence * 100).toFixed(1)}%`);
            
            return enhancedResult;
            
        } catch (error) {
            console.error('❌ Enhanced LLM assistance failed:', error.message);
            
            // Fallback to basic multi-LLM without live data
            console.log('   🔄 Falling back to basic multi-LLM analysis...');
            
            try {
                const fallbackResult = await this.multiLLMEngine.requestMultiLLMAssistance(
                    taskName,
                    analysisData,
                    priority
                );
                
                return {
                    ...fallbackResult,
                    dataAugmentation: null,
                    fallbackReason: error.message,
                    warning: 'Using LLM training data only - may be outdated for DeFi protocols'
                };
                
            } catch (fallbackError) {
                throw new Error(`Both enhanced and fallback analysis failed: ${error.message} | ${fallbackError.message}`);
            }
        }
    }

    /**
     * 🔍 SHOULD USE LIVE DATA
     */
    shouldUseLiveData(analysisData, priority) {
        // Always use live data if configured
        if (this.integrationConfig.alwaysUseLatestData) {
            return true;
        }
        
        // Use live data for high-priority requests
        if (priority === 'high') {
            return true;
        }
        
        // Use live data for high-value opportunities
        const opportunityValue = this.extractOpportunityValue(analysisData);
        if (this.integrationConfig.requireDataForHighValue && opportunityValue >= 5000) {
            return true;
        }
        
        // Use live data if blockchain protocols are mentioned
        const protocolsMentioned = this.extractMentionedProtocols(analysisData);
        if (protocolsMentioned.length > 0) {
            return true;
        }
        
        return false;
    }

    /**
     * 🔍 EXTRACT TASK TYPE
     */
    extractTaskType(taskName) {
        const taskTypes = {
            'arbitrage': ['arbitrage', 'arb', 'price_difference', 'spread'],
            'yield_farming': ['yield', 'farming', 'staking', 'liquidity_mining'],
            'lending': ['lending', 'borrowing', 'flash_loan', 'loan'],
            'governance': ['governance', 'voting', 'proposal', 'dao'],
            'risk_assessment': ['risk', 'security', 'audit', 'vulnerability']
        };
        
        const taskLower = taskName.toLowerCase();
        
        for (const [type, keywords] of Object.entries(taskTypes)) {
            if (keywords.some(keyword => taskLower.includes(keyword))) {
                return type;
            }
        }
        
        return 'general';
    }

    /**
     * 🔍 EXTRACT MENTIONED PROTOCOLS
     */
    extractMentionedProtocols(analysisData) {
        const protocols = [];
        const dataStr = JSON.stringify(analysisData).toLowerCase();
        
        const protocolKeywords = {
            'uniswap': ['uniswap', 'uni', 'v3', 'v2'],
            'aave': ['aave', 'lending', 'flash loan'],
            'curve': ['curve', 'crv', 'stableswap'],
            'compound': ['compound', 'comp'],
            'balancer': ['balancer', 'bal'],
            'sushiswap': ['sushi', 'sushiswap'],
            'makerdao': ['maker', 'dai', 'cdp'],
            'yearn': ['yearn', 'yfi', 'vault']
        };
        
        for (const [protocol, keywords] of Object.entries(protocolKeywords)) {
            if (keywords.some(keyword => dataStr.includes(keyword))) {
                protocols.push(protocol);
            }
        }
        
        return protocols;
    }

    /**
     * 💰 EXTRACT OPPORTUNITY VALUE
     */
    extractOpportunityValue(analysisData) {
        // Try to find profit potential in various formats
        if (analysisData.opportunities) {
            const maxProfit = Math.max(...analysisData.opportunities.map(opp => opp.profitPotential || 0));
            if (maxProfit > 0) return maxProfit;
        }
        
        if (analysisData.profitPotential) {
            return analysisData.profitPotential;
        }
        
        if (analysisData.valueScore) {
            return analysisData.valueScore * 10000; // Assume score is 0-1, convert to dollars
        }
        
        return 0;
    }

    /**
     * ✅ VALIDATE DATA INTERPRETATION ACROSS LLMs
     */
    validateDataInterpretationAcrossLLMs(multiLLMResult, liveData) {
        console.log('   ✅ Validating data interpretation across LLMs...');
        
        const inconsistencies = [];
        const llmResults = multiLLMResult.individualResults.filter(r => r.success);
        
        if (llmResults.length < 2) {
            return { hasInconsistencies: false, inconsistencies: [] };
        }
        
        // Check for major disagreements in protocol parameter interpretation
        for (const [protocolId, protocolData] of Object.entries(liveData)) {
            const llmInterpretations = llmResults.map(result => 
                this.extractProtocolInterpretation(result.response, protocolId)
            ).filter(interp => interp !== null);
            
            if (llmInterpretations.length >= 2) {
                const disagreements = this.findInterpretationDisagreements(llmInterpretations, protocolData);
                if (disagreements.length > 0) {
                    inconsistencies.push({
                        protocol: protocolId,
                        disagreements,
                        actualData: protocolData.metrics
                    });
                }
            }
        }
        
        return {
            hasInconsistencies: inconsistencies.length > 0,
            inconsistencies,
            validationSummary: this.generateValidationSummary(inconsistencies)
        };
    }

    /**
     * 🔍 EXTRACT PROTOCOL INTERPRETATION
     */
    extractProtocolInterpretation(llmResponse, protocolId) {
        // Extract how the LLM interpreted specific protocol data
        const opportunities = llmResponse.opportunities || [];
        const protocolOpportunities = opportunities.filter(opp => 
            opp.description.toLowerCase().includes(protocolId)
        );
        
        if (protocolOpportunities.length === 0) return null;
        
        return {
            profitEstimates: protocolOpportunities.map(opp => opp.profitPotential || 0),
            riskAssessments: protocolOpportunities.map(opp => opp.riskLevel || 'unknown'),
            confidenceScores: protocolOpportunities.map(opp => opp.confidence || 0.5)
        };
    }

    /**
     * 🔍 FIND INTERPRETATION DISAGREEMENTS
     */
    findInterpretationDisagreements(interpretations, actualData) {
        const disagreements = [];
        
        // Check profit estimate variance
        const allProfits = interpretations.flatMap(interp => interp.profitEstimates);
        if (allProfits.length >= 2) {
            const maxProfit = Math.max(...allProfits);
            const minProfit = Math.min(...allProfits);
            const variance = (maxProfit - minProfit) / maxProfit;
            
            if (variance > 0.5) { // 50% variance threshold
                disagreements.push({
                    type: 'profit_estimate_variance',
                    variance: variance.toFixed(3),
                    range: `$${minProfit.toFixed(0)} - $${maxProfit.toFixed(0)}`
                });
            }
        }
        
        // Check confidence score disagreements
        const allConfidence = interpretations.flatMap(interp => interp.confidenceScores);
        if (allConfidence.length >= 2) {
            const maxConf = Math.max(...allConfidence);
            const minConf = Math.min(...allConfidence);
            
            if ((maxConf - minConf) > 0.4) { // 40% confidence difference
                disagreements.push({
                    type: 'confidence_disagreement',
                    range: `${(minConf * 100).toFixed(0)}% - ${(maxConf * 100).toFixed(0)}%`
                });
            }
        }
        
        return disagreements;
    }

    /**
     * 📊 GENERATE ENHANCED RESULT
     */
    generateEnhancedResult(multiLLMResult, augmentationResult, dataValidationResult) {
        const enhancedResult = {
            // Core multi-LLM results
            ...multiLLMResult,
            
            // Data augmentation information
            dataAugmentation: augmentationResult ? {
                dataFreshness: augmentationResult.dataFreshness,
                protocolsUpdated: Object.keys(augmentationResult.dataUsed || {}),
                marketContext: augmentationResult.marketContext,
                processingTime: augmentationResult.processingTime
            } : null,
            
            // Data validation results
            dataValidation: dataValidationResult || null,
            
            // Enhanced confidence calculation
            enhancedConfidence: this.calculateEnhancedConfidence(
                multiLLMResult.confidence,
                augmentationResult?.dataFreshness,
                dataValidationResult?.hasInconsistencies
            ),
            
            // Data quality indicators
            dataQuality: {
                hasLiveData: !!augmentationResult,
                dataAge: augmentationResult?.dataFreshness || 'unknown',
                protocolCoverage: Object.keys(augmentationResult?.dataUsed || {}).length,
                validationPassed: !dataValidationResult?.hasInconsistencies
            },
            
            // Enhanced recommendations
            enhancedRecommendations: this.generateEnhancedRecommendations(
                multiLLMResult.recommendations,
                augmentationResult,
                dataValidationResult
            )
        };
        
        return enhancedResult;
    }

    /**
     * 🎯 CALCULATE ENHANCED CONFIDENCE
     */
    calculateEnhancedConfidence(baseConfidence, dataFreshness, hasInconsistencies) {
        let enhancedConfidence = baseConfidence;
        
        // Boost confidence for fresh data
        if (dataFreshness !== undefined && dataFreshness < 10) { // Less than 10 minutes old
            enhancedConfidence += 0.1;
        }
        
        // Reduce confidence for data inconsistencies
        if (hasInconsistencies) {
            enhancedConfidence -= 0.15;
        }
        
        // Ensure confidence stays within bounds
        return Math.max(0, Math.min(1, enhancedConfidence));
    }

    /**
     * 💡 GENERATE ENHANCED RECOMMENDATIONS
     */
    generateEnhancedRecommendations(baseRecommendations, augmentationResult, dataValidationResult) {
        const enhanced = [...baseRecommendations];
        
        // Add data-specific recommendations
        if (augmentationResult?.dataFreshness > 30) { // Data older than 30 minutes
            enhanced.push({
                type: 'data_refresh',
                priority: 'medium',
                description: 'Consider refreshing blockchain data before executing high-value opportunities',
                confidence: 0.8
            });
        }
        
        if (dataValidationResult?.hasInconsistencies) {
            enhanced.push({
                type: 'validation_required',
                priority: 'high',
                description: 'LLMs showed disagreements in data interpretation - manual validation recommended',
                confidence: 0.9,
                details: dataValidationResult.inconsistencies
            });
        }
        
        // Add protocol-specific recommendations based on live data
        if (augmentationResult?.marketContext) {
            const market = augmentationResult.marketContext;
            
            if (market.gasPrice > 50) { // High gas prices
                enhanced.push({
                    type: 'gas_optimization',
                    priority: 'high',
                    description: `High gas prices (${market.gasPrice} gwei) - consider batching transactions or waiting for lower fees`,
                    confidence: 0.85
                });
            }
            
            if (market.volatilityIndex > 0.5) { // High volatility
                enhanced.push({
                    type: 'volatility_warning',
                    priority: 'medium',
                    description: `High market volatility (${(market.volatilityIndex * 100).toFixed(1)}%) - adjust position sizes accordingly`,
                    confidence: 0.8
                });
            }
        }
        
        return enhanced;
    }

    /**
     * 📊 TRACK ENHANCED PERFORMANCE
     */
    trackEnhancedPerformance(enhancedResult, processingTime) {
        if (enhancedResult.dataAugmentation) {
            this.integrationMetrics.consensusWithLiveData++;
        }
        
        // Track accuracy improvements from data validation
        if (enhancedResult.dataValidation?.hasInconsistencies) {
            this.integrationMetrics.dataAccuracyImprovements++;
        }
        
        console.log(`📊 Enhanced Performance Metrics:`);
        console.log(`   🔗 Data augmented: ${this.integrationMetrics.dataAugmentedRequests}/${this.integrationMetrics.totalRequests}`);
        console.log(`   🤖 Consensus with live data: ${this.integrationMetrics.consensusWithLiveData}`);
        console.log(`   ✅ Data accuracy improvements: ${this.integrationMetrics.dataAccuracyImprovements}`);
        console.log(`   📈 Avg data freshness: ${this.integrationMetrics.avgDataFreshness.toFixed(1)} minutes`);
    }

    /**
     * 📈 GET INTEGRATION STATISTICS
     */
    getIntegrationStatistics() {
        const multiLLMStats = this.multiLLMEngine.getPerformanceStatistics();
        const dataAugmentationStats = this.liveDataAugmentation.getAugmentationStatistics();
        
        return {
            integration: {
                totalRequests: this.integrationMetrics.totalRequests,
                dataAugmentationRate: this.integrationMetrics.totalRequests > 0 ? 
                    (this.integrationMetrics.dataAugmentedRequests / this.integrationMetrics.totalRequests).toFixed(3) : '0.000',
                avgDataFreshness: this.integrationMetrics.avgDataFreshness.toFixed(1) + ' minutes',
                accuracyImprovements: this.integrationMetrics.dataAccuracyImprovements
            },
            multiLLM: multiLLMStats,
            dataAugmentation: dataAugmentationStats
        };
    }

    /**
     * 🔧 HELPER METHODS
     */
    
    generateValidationSummary(inconsistencies) {
        if (inconsistencies.length === 0) {
            return 'All LLMs showed consistent interpretation of live blockchain data';
        }
        
        return `Found ${inconsistencies.length} interpretation inconsistencies across protocols: ${
            inconsistencies.map(inc => inc.protocol).join(', ')
        }`;
    }
} 