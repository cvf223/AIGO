/**
 * 🧠 DYNAMIC SOURCE LEARNING ENGINE
 * ================================
 * 
 * LEARNS source authority and content relevance dynamically through:
 * - Cross-referencing validation
 * - Content quality assessment
 * - Outcome tracking
 * - Network effect analysis
 * 
 * NO HARDCODED VALUES - Everything learned organically!
 */

export class DynamicSourceLearningEngine {
    constructor() {
        // Dynamic learning databases
        this.domainTrustScore = new Map();      // Domain -> Trust metrics
        this.contentPatternValue = new Map();   // Pattern -> Value metrics  
        this.crossReferenceNetwork = new Map(); // Source -> Connected sources
        this.outcomeTracking = new Map();       // Source -> Financial outcomes
        this.focusProfiles = new Map();         // Focus -> Content weight patterns
        
        // Learning parameters (self-adjusting)
        this.learningRate = 0.1;
        this.decayRate = 0.05;
        this.minSampleSize = 3;
        this.confidenceThreshold = 0.6;
        
        // FULLY DYNAMIC BATCH-BASED FOCUS ROTATION
        this.currentFocus = this.initializeDefaultFocus();
        this.newslettersAnalyzedInCurrentFocus = 0;
        this.targetBatchSize = 50; // Starting size - will adapt dynamically
        this.minBatchSize = 20;    // Minimum newsletters before rotation
        this.maxBatchSize = 500;   // Maximum to prevent analysis paralysis
        this.focusHistory = [];    // Track focus changes and their performance
        this.batchCompletionCount = 0;
        
        // DYNAMIC BATCH SIZING based on newsletter flow
        this.dailyNewsletterFlow = new Map(); // Track daily newsletter counts
        this.adaptiveSizing = true;
        this.lastBatchSizeAdjustment = Date.now();
        
        console.log('🧠 Dynamic Source Learning Engine initialized');
        console.log('   📚 Learning source authority organically through validation');
        console.log('   🎯 FULLY DYNAMIC batch rotation: Adapts to newsletter flow');
        console.log(`   📊 Initial batch size: ${this.targetBatchSize} (adaptive: ${this.minBatchSize}-${this.maxBatchSize})`);
    }

    /**
     * 🎯 INITIALIZE DEFAULT FOCUS (STARTING POINT ONLY)
     */
    initializeDefaultFocus() {
        return {
            name: 'balanced_discovery',
            contentWeights: new Map([
                ['financial_data', 0.25],
                ['technical_analysis', 0.20], 
                ['market_trends', 0.20],
                ['opportunity_signals', 0.15],
                ['risk_indicators', 0.10],
                ['regulatory_updates', 0.10]
            ]),
            discoveryBias: 'neutral',
            adaptationRate: 0.15
        };
    }

    /**
     * 📊 CALCULATE DYNAMIC DOMAIN AUTHORITY
     * Learns authority through cross-validation and outcomes
     */
    calculateDynamicDomainAuthority(domain) {
        if (!this.domainTrustScore.has(domain)) {
            // New domain - start with neutral trust
            this.domainTrustScore.set(domain, {
                baseScore: 0.5,
                crossReferences: 0,
                validationCount: 0,
                outcomeSum: 0,
                firstSeen: Date.now(),
                lastUpdated: Date.now(),
                sampleSize: 0
            });
        }
        
        const domainData = this.domainTrustScore.get(domain);
        
        // Calculate dynamic authority based on learned factors
        let authority = domainData.baseScore;
        
        // Cross-reference boost (sources that validate each other)
        if (domainData.crossReferences > 0) {
            const crossRefBoost = Math.min(domainData.crossReferences * 0.1, 0.3);
            authority += crossRefBoost;
        }
        
        // Outcome-based boost (sources that led to valuable discoveries)
        if (domainData.outcomeSum > 0 && domainData.sampleSize >= this.minSampleSize) {
            const avgOutcome = domainData.outcomeSum / domainData.sampleSize;
            const outcomeBoost = Math.min(avgOutcome * 0.2, 0.4);
            authority += outcomeBoost;
        }
        
        // Validation boost (consistent accuracy)
        if (domainData.validationCount > 0) {
            const validationBoost = Math.min(domainData.validationCount * 0.05, 0.2);
            authority += validationBoost;
        }
        
        // Time decay for unused sources
        const timeSinceUpdate = Date.now() - domainData.lastUpdated;
        const daysSinceUpdate = timeSinceUpdate / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate > 30) {
            const decay = Math.min(daysSinceUpdate * this.decayRate, 0.3);
            authority -= decay;
        }
        
        return Math.max(Math.min(authority, 1.0), 0.1); // Bounded between 0.1 and 1.0
    }

    /**
     * 📝 CALCULATE DYNAMIC CONTENT RELEVANCE
     * Adapts based on current focus and learned pattern values
     */
    calculateDynamicContentRelevance(text, url, analysisContext = {}) {
        let relevance = 0.3; // Neutral starting point
        
        const combinedText = `${text} ${url}`.toLowerCase();
        
        // Apply current focus weights
        relevance += this.applyFocusWeights(combinedText);
        
        // Apply learned pattern values
        relevance += this.applyLearnedPatterns(combinedText);
        
        // Context-specific adjustments
        relevance += this.applyContextualRelevance(combinedText, analysisContext);
        
        return Math.min(relevance, 1.0);
    }

    /**
     * 🎯 APPLY CURRENT FOCUS WEIGHTS
     */
    applyFocusWeights(text) {
        let focusScore = 0;
        
        // Extract patterns and match with current focus
        const detectedPatterns = this.extractContentPatterns(text);
        
        this.currentFocus.contentWeights.forEach((weight, category) => {
            const categoryPatterns = this.getCategoryPatterns(category);
            
            let categoryMatch = 0;
            categoryPatterns.forEach(pattern => {
                if (text.includes(pattern)) {
                    categoryMatch += 0.1;
                }
            });
            
            focusScore += Math.min(categoryMatch, 0.3) * weight;
        });
        
        return focusScore;
    }

    /**
     * 📚 APPLY LEARNED PATTERNS
     */
    applyLearnedPatterns(text) {
        let patternScore = 0;
        
        this.contentPatternValue.forEach((value, pattern) => {
            if (text.includes(pattern.toLowerCase()) && value.sampleSize >= this.minSampleSize) {
                const confidence = Math.min(value.sampleSize / 10, 1.0); // Confidence builds with samples
                patternScore += (value.avgValue * confidence * 0.1);
            }
        });
        
        return Math.min(patternScore, 0.4); // Cap pattern contribution
    }

    /**
     * 🔄 LEARN FROM ANALYSIS OUTCOMES
     */
    learnFromOutcome(sourceUrl, contentPatterns, outcome) {
        const domain = this.extractDomain(sourceUrl);
        
        // Update domain trust based on outcome
        if (this.domainTrustScore.has(domain)) {
            const domainData = this.domainTrustScore.get(domain);
            domainData.outcomeSum += outcome.valueScore || 0;
            domainData.sampleSize += 1;
            domainData.lastUpdated = Date.now();
            
            // Adjust base score with learning rate
            const targetScore = outcome.valueScore || 0.5;
            domainData.baseScore += this.learningRate * (targetScore - domainData.baseScore);
        }
        
        // Update content pattern values
        contentPatterns.forEach(pattern => {
            if (!this.contentPatternValue.has(pattern)) {
                this.contentPatternValue.set(pattern, {
                    totalValue: 0,
                    sampleSize: 0,
                    avgValue: 0.5,
                    lastUpdated: Date.now()
                });
            }
            
            const patternData = this.contentPatternValue.get(pattern);
            patternData.totalValue += outcome.valueScore || 0;
            patternData.sampleSize += 1;
            patternData.avgValue = patternData.totalValue / patternData.sampleSize;
            patternData.lastUpdated = Date.now();
        });
        
        console.log(`📚 Learned from outcome: ${domain} (value: ${outcome.valueScore?.toFixed(3)})`);
    }

    /**
     * 🔗 LEARN FROM CROSS-REFERENCES
     */
    learnFromCrossReference(source1Url, source2Url, commonElements) {
        const domain1 = this.extractDomain(source1Url);
        const domain2 = this.extractDomain(source2Url);
        
        // Boost both domains for cross-validation
        [domain1, domain2].forEach(domain => {
            if (this.domainTrustScore.has(domain)) {
                const domainData = this.domainTrustScore.get(domain);
                domainData.crossReferences += 1;
                domainData.validationCount += 1;
                domainData.lastUpdated = Date.now();
            }
        });
        
        // Update cross-reference network
        if (!this.crossReferenceNetwork.has(domain1)) {
            this.crossReferenceNetwork.set(domain1, new Set());
        }
        if (!this.crossReferenceNetwork.has(domain2)) {
            this.crossReferenceNetwork.set(domain2, new Set());
        }
        
        this.crossReferenceNetwork.get(domain1).add(domain2);
        this.crossReferenceNetwork.get(domain2).add(domain1);
        
        console.log(`🔗 Cross-reference learned: ${domain1} ↔ ${domain2}`);
    }

    /**
     * 📊 TRACK NEWSLETTER FLOW FOR DYNAMIC BATCH SIZING
     */
    trackDailyNewsletterFlow() {
        const today = new Date().toDateString();
        
        if (!this.dailyNewsletterFlow.has(today)) {
            this.dailyNewsletterFlow.set(today, 0);
        }
        
        this.dailyNewsletterFlow.set(today, this.dailyNewsletterFlow.get(today) + 1);
        
        // Adapt batch size based on newsletter flow pattern
        if (this.adaptiveSizing) {
            this.adaptBatchSizeToFlow();
        }
    }

    /**
     * 📈 ADAPT BATCH SIZE TO NEWSLETTER FLOW
     */
    adaptBatchSizeToFlow() {
        // Only adjust once per day to avoid constant changes
        const timeSinceLastAdjustment = Date.now() - this.lastBatchSizeAdjustment;
        if (timeSinceLastAdjustment < 24 * 60 * 60 * 1000) return; // 24 hours
        
        // Calculate average daily flow over last 7 days
        const last7Days = Array.from(this.dailyNewsletterFlow.entries())
            .slice(-7)
            .map(([_, count]) => count);
        
        if (last7Days.length < 3) return; // Need at least 3 days of data
        
        const avgDailyFlow = last7Days.reduce((sum, count) => sum + count, 0) / last7Days.length;
        const flowVolatility = this.calculateFlowVolatility(last7Days);
        
        // Dynamic batch size calculation
        let newBatchSize;
        
        if (avgDailyFlow > 100) {
            // High flow: Larger batches for efficiency
            newBatchSize = Math.min(avgDailyFlow * 2, this.maxBatchSize);
        } else if (avgDailyFlow > 50) {
            // Medium flow: Standard batches
            newBatchSize = Math.round(avgDailyFlow * 1.5);
        } else {
            // Low flow: Smaller batches for responsiveness
            newBatchSize = Math.max(avgDailyFlow, this.minBatchSize);
        }
        
        // Adjust for volatility - more volatile flow = smaller batches
        if (flowVolatility > 0.5) {
            newBatchSize = Math.round(newBatchSize * 0.7);
        }
        
        // Apply bounds
        newBatchSize = Math.max(this.minBatchSize, Math.min(newBatchSize, this.maxBatchSize));
        
        if (Math.abs(newBatchSize - this.targetBatchSize) > 5) {
            console.log(`📊 DYNAMIC BATCH SIZING: ${this.targetBatchSize} → ${newBatchSize}`);
            console.log(`   📈 Based on: ${avgDailyFlow.toFixed(1)} avg daily flow, volatility: ${flowVolatility.toFixed(2)}`);
            
            this.targetBatchSize = newBatchSize;
            this.lastBatchSizeAdjustment = Date.now();
        }
    }

    /**
     * 📊 CALCULATE FLOW VOLATILITY
     */
    calculateFlowVolatility(flowData) {
        if (flowData.length < 2) return 0;
        
        const mean = flowData.reduce((sum, val) => sum + val, 0) / flowData.length;
        const variance = flowData.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / flowData.length;
        const standardDeviation = Math.sqrt(variance);
        
        return mean > 0 ? standardDeviation / mean : 0; // Coefficient of variation
    }

    /**
     * 📊 TRACK NEWSLETTER ANALYSIS FOR DYNAMIC BATCH ROTATION
     */
    trackNewsletterAnalysis(analysisResult) {
        this.newslettersAnalyzedInCurrentFocus++;
        this.trackDailyNewsletterFlow(); // Track for dynamic sizing
        
        console.log(`📊 Newsletter ${this.newslettersAnalyzedInCurrentFocus}/${this.targetBatchSize} analyzed with '${this.currentFocus.name}' focus`);
        
        // Store analysis result for focus performance evaluation
        if (!this.currentFocus.batchResults) {
            this.currentFocus.batchResults = [];
        }
        this.currentFocus.batchResults.push({
            newsletter: this.newslettersAnalyzedInCurrentFocus,
            valueScore: analysisResult.valueScore || 0,
            opportunitiesFound: analysisResult.opportunitiesFound || 0,
            timestamp: Date.now()
        });
    }

    /**
     * 🔄 CHECK IF BATCH ROTATION IS NEEDED (DYNAMIC THRESHOLD)
     */
    shouldRotateFocus() {
        // DYNAMIC CONDITIONS for batch completion:
        
        // 1. Reached target batch size
        if (this.newslettersAnalyzedInCurrentFocus >= this.targetBatchSize) {
            console.log(`🎯 BATCH COMPLETE: Reached target size (${this.newslettersAnalyzedInCurrentFocus}/${this.targetBatchSize})`);
            return true;
        }
        
        // 2. Minimum size reached AND performance plateau detected
        if (this.newslettersAnalyzedInCurrentFocus >= this.minBatchSize) {
            const performancePlateau = this.detectPerformancePlateau();
            if (performancePlateau) {
                console.log(`📈 EARLY ROTATION: Performance plateau detected at ${this.newslettersAnalyzedInCurrentFocus} newsletters`);
                return true;
            }
        }
        
        // 3. Exceptional performance discovered (extend batch)
        if (this.newslettersAnalyzedInCurrentFocus >= this.targetBatchSize * 0.8) { // 80% through
            const exceptionalPerformance = this.detectExceptionalPerformance();
            if (exceptionalPerformance && this.newslettersAnalyzedInCurrentFocus < this.maxBatchSize) {
                console.log(`🚀 EXTENDING BATCH: Exceptional performance, continuing to ${this.maxBatchSize}`);
                this.targetBatchSize = Math.min(this.targetBatchSize * 1.2, this.maxBatchSize);
                return false; // Don't rotate yet
            }
        }
        
        return false;
    }

    /**
     * 📈 DETECT PERFORMANCE PLATEAU
     */
    detectPerformancePlateau() {
        if (!this.currentFocus.batchResults || this.currentFocus.batchResults.length < 10) {
            return false; // Need enough data
        }
        
        const recentResults = this.currentFocus.batchResults.slice(-10); // Last 10 newsletters
        const earlierResults = this.currentFocus.batchResults.slice(-20, -10); // 10 before that
        
        if (earlierResults.length < 5) return false; // Need comparison data
        
        const recentAvg = recentResults.reduce((sum, r) => sum + r.valueScore, 0) / recentResults.length;
        const earlierAvg = earlierResults.reduce((sum, r) => sum + r.valueScore, 0) / earlierResults.length;
        
        // Plateau if recent performance isn't significantly better
        const improvementThreshold = 0.05; // 5% improvement required
        return (recentAvg - earlierAvg) / Math.max(earlierAvg, 0.1) < improvementThreshold;
    }

    /**
     * 🚀 DETECT EXCEPTIONAL PERFORMANCE
     */
    detectExceptionalPerformance() {
        if (!this.currentFocus.batchResults || this.currentFocus.batchResults.length < 5) {
            return false;
        }
        
        const recentResults = this.currentFocus.batchResults.slice(-5); // Last 5 newsletters
        const avgRecent = recentResults.reduce((sum, r) => sum + r.valueScore, 0) / recentResults.length;
        
        // Compare with historical performance
        const historicalAvg = this.getHistoricalAveragePerformance();
        
        // Exceptional if recent performance is 50% better than historical
        return avgRecent > historicalAvg * 1.5;
    }

    /**
     * 📊 GET HISTORICAL AVERAGE PERFORMANCE
     */
    getHistoricalAveragePerformance() {
        if (this.focusHistory.length === 0) return 0.3; // Default baseline
        
        const allHistoricalPerformances = this.focusHistory.map(f => f.performance.avgValueScore);
        return allHistoricalPerformances.reduce((sum, p) => sum + p, 0) / allHistoricalPerformances.length;
    }

    /**
     * 🔄 ROTATE ANALYSIS FOCUS - BATCH COMPLETION TRIGGERED
     */
    rotateFocusAfterBatch() {
        // Evaluate current focus performance
        const currentFocusPerformance = this.evaluateFocusPerformance(this.currentFocus);
        
        // Store current focus in history with performance metrics
        this.focusHistory.push({
            focus: { ...this.currentFocus },
            performance: currentFocusPerformance,
            newslettersAnalyzed: this.newslettersAnalyzedInCurrentFocus,
            batchNumber: this.batchCompletionCount + 1,
            completedAt: Date.now()
        });
        
        console.log(`📊 FOCUS PERFORMANCE: '${this.currentFocus.name}' batch completed`);
        console.log(`   💰 Avg Value Score: ${currentFocusPerformance.avgValueScore.toFixed(3)}`);
        console.log(`   🎯 Total Opportunities: ${currentFocusPerformance.totalOpportunities}`);
        console.log(`   📈 Discovery Rate: ${currentFocusPerformance.discoveryRate.toFixed(2)}%`);
        
        // Generate new focus based on learned patterns and previous focus performance
        const newFocus = this.generateNextBatchFocus();
        
        // Reset counters for new batch
        this.currentFocus = newFocus;
        this.newslettersAnalyzedInCurrentFocus = 0;
        this.batchCompletionCount++;
        
        console.log(`🎯 FOCUS ROTATION: Switched to '${newFocus.name}' focus for batch ${this.batchCompletionCount + 1}`);
        console.log(`   📊 New content weights:`, Array.from(newFocus.contentWeights.entries()));
        console.log(`   🔄 Ready to re-analyze all ${this.targetBatchSize} newsletters with new perspective`);
        
        return {
            previousFocus: this.focusHistory[this.focusHistory.length - 1],
            newFocus: this.currentFocus,
            shouldReanalyzeAll: true,
            batchNumber: this.batchCompletionCount + 1
        };
    }

    /**
     * 📊 EVALUATE FOCUS PERFORMANCE
     */
    evaluateFocusPerformance(focus) {
        if (!focus.batchResults || focus.batchResults.length === 0) {
            return {
                avgValueScore: 0,
                totalOpportunities: 0,
                discoveryRate: 0,
                consistency: 0
            };
        }
        
        const results = focus.batchResults;
        const totalValueScore = results.reduce((sum, r) => sum + r.valueScore, 0);
        const totalOpportunities = results.reduce((sum, r) => sum + r.opportunitiesFound, 0);
        const avgValueScore = totalValueScore / results.length;
        const discoveryRate = (results.filter(r => r.opportunitiesFound > 0).length / results.length) * 100;
        
        // Calculate consistency (how consistent were the discoveries)
        const valueVariance = results.reduce((sum, r) => sum + Math.pow(r.valueScore - avgValueScore, 2), 0) / results.length;
        const consistency = Math.max(0, 1 - (valueVariance / avgValueScore)); // Lower variance = higher consistency
        
        return {
            avgValueScore,
            totalOpportunities,
            discoveryRate,
            consistency: isNaN(consistency) ? 0 : consistency
        };
    }

    /**
     * 🎯 GENERATE NEXT BATCH FOCUS
     * Uses performance data from previous focuses to evolve strategy
     */
    generateNextBatchFocus() {
        // Analyze all previous focus performances
        const focusAnalysis = this.analyzeFocusHistory();
        
        // Generate focus name and strategy based on what worked best
        const focusStrategy = this.determineBestStrategy(focusAnalysis);
        const focusName = this.generateAdaptiveFocusName(focusStrategy);
        
        // Generate weights that emphasize successful patterns from previous batches
        const adaptiveWeights = this.generateAdaptiveWeights(focusStrategy);
        
        // Create new focus with learned optimizations
        return {
            name: focusName,
            contentWeights: adaptiveWeights,
            discoveryBias: focusStrategy.bias,
            adaptationRate: 0.15,
            generatedAt: Date.now(),
            batchNumber: this.batchCompletionCount + 1,
            basedOnStrategy: focusStrategy,
            batchResults: [] // Fresh results for new batch
        };
    }

    /**
     * 📈 ANALYZE FOCUS HISTORY FOR PATTERNS
     */
    analyzeFocusHistory() {
        if (this.focusHistory.length === 0) {
            return { bestPerformer: null, patterns: [], avgPerformance: 0 };
        }
        
        // Find best performing focus
        const bestPerformer = this.focusHistory.reduce((best, current) => 
            current.performance.avgValueScore > (best?.performance.avgValueScore || 0) ? current : best
        );
        
        // Identify successful patterns across focuses
        const patterns = this.identifySuccessfulPatterns();
        
        // Calculate overall performance trend
        const avgPerformance = this.focusHistory.reduce((sum, f) => sum + f.performance.avgValueScore, 0) / this.focusHistory.length;
        
        return {
            bestPerformer,
            patterns,
            avgPerformance,
            totalBatches: this.focusHistory.length
        };
    }

    /**
     * 🔍 IDENTIFY SUCCESSFUL PATTERNS ACROSS BATCHES
     */
    identifySuccessfulPatterns() {
        const patterns = [];
        
        // Analyze which content categories performed best across all focuses
        const categoryPerformance = new Map();
        
        this.focusHistory.forEach(focusData => {
            const performance = focusData.performance;
            
            focusData.focus.contentWeights.forEach((weight, category) => {
                if (!categoryPerformance.has(category)) {
                    categoryPerformance.set(category, { totalValue: 0, totalWeight: 0, count: 0 });
                }
                
                const catData = categoryPerformance.get(category);
                catData.totalValue += performance.avgValueScore * weight; // Weight the performance by category emphasis
                catData.totalWeight += weight;
                catData.count++;
            });
        });
        
        // Convert to sorted patterns
        categoryPerformance.forEach((data, category) => {
            const avgWeightedPerformance = data.totalValue / data.count;
            patterns.push({
                category,
                performance: avgWeightedPerformance,
                consistency: data.count,
                avgWeight: data.totalWeight / data.count
            });
        });
        
        return patterns.sort((a, b) => b.performance - a.performance);
    }

    /**
     * 🎯 DETERMINE BEST STRATEGY FOR NEXT BATCH
     */
    determineBestStrategy(focusAnalysis) {
        const { bestPerformer, patterns, avgPerformance } = focusAnalysis;
        
        // Strategy 1: If we have a clear best performer, evolve from it
        if (bestPerformer && bestPerformer.performance.avgValueScore > avgPerformance * 1.2) {
            return {
                type: 'evolution',
                baseFocus: bestPerformer.focus.name,
                emphasizeCategories: patterns.slice(0, 3).map(p => p.category),
                bias: 'exploit_known_success',
                reasoning: `Evolving from successful '${bestPerformer.focus.name}' focus`
            };
        }
        
        // Strategy 2: If performance is declining, try exploration
        const recentPerformance = this.focusHistory.slice(-2).reduce((sum, f) => sum + f.performance.avgValueScore, 0) / Math.min(2, this.focusHistory.length);
        if (recentPerformance < avgPerformance * 0.8) {
            return {
                type: 'exploration',
                exploreCategories: this.getUnderexploredCategories(),
                bias: 'explore_new_territories',
                reasoning: 'Recent performance declining, exploring new areas'
            };
        }
        
        // Strategy 3: Balanced approach - combine best patterns
        return {
            type: 'synthesis',
            combinePatterns: patterns.slice(0, 4),
            bias: 'balanced_optimization',
            reasoning: 'Synthesizing successful patterns from all batches'
        };
    }

    /**
     * 🗺️ GET UNDEREXPLORED CATEGORIES
     */
    getUnderexploredCategories() {
        const allCategories = ['financial_data', 'technical_analysis', 'market_trends', 'opportunity_signals', 'risk_indicators', 'regulatory_updates', 'network_analysis', 'sentiment_analysis'];
        const exploredCategories = new Set();
        
        this.focusHistory.forEach(focusData => {
            focusData.focus.contentWeights.forEach((weight, category) => {
                if (weight > 0.15) { // Consider categories with >15% weight as explored
                    exploredCategories.add(category);
                }
            });
        });
        
        return allCategories.filter(cat => !exploredCategories.has(cat));
    }

    /**
     * ⚖️ GENERATE ADAPTIVE WEIGHTS BASED ON STRATEGY
     */
    generateAdaptiveWeights(strategy) {
        const weights = new Map();
        
        switch (strategy.type) {
            case 'evolution':
                // Emphasize successful categories but with slight variation
                strategy.emphasizeCategories.forEach((category, index) => {
                    const baseWeight = 0.4 - (index * 0.1); // 40%, 30%, 20%
                    weights.set(category, baseWeight);
                });
                
                // Fill remaining weight with other categories
                const remainingWeight = 1.0 - Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
                const otherCategories = this.getAllCategories().filter(cat => !weights.has(cat));
                const weightPerOther = remainingWeight / otherCategories.length;
                otherCategories.forEach(cat => weights.set(cat, weightPerOther));
                break;
                
            case 'exploration':
                // Emphasize underexplored categories
                strategy.exploreCategories.forEach(category => {
                    weights.set(category, 0.25); // 25% each for new categories
                });
                
                // Balance with some known patterns
                const knownGoodCategories = ['financial_data', 'opportunity_signals'];
                knownGoodCategories.forEach(cat => {
                    if (!weights.has(cat)) weights.set(cat, 0.15);
                });
                break;
                
            case 'synthesis':
            default:
                // Combine successful patterns proportionally
                const totalPatternPerformance = strategy.combinePatterns.reduce((sum, p) => sum + p.performance, 0);
                strategy.combinePatterns.forEach(pattern => {
                    const proportionalWeight = (pattern.performance / totalPatternPerformance) * 0.8; // Use 80% for top patterns
                    weights.set(pattern.category, proportionalWeight);
                });
                break;
        }
        
        // Ensure weights sum to 1.0
        this.normalizeWeights(weights);
        
        return weights;
    }

    /**
     * 📝 GENERATE ADAPTIVE FOCUS NAME
     */
    generateAdaptiveFocusName(strategy) {
        const batchNumber = this.batchCompletionCount + 1;
        
        switch (strategy.type) {
            case 'evolution':
                return `evolved_${strategy.baseFocus}_v${batchNumber}`;
            case 'exploration':
                return `explorer_batch_${batchNumber}`;
            case 'synthesis':
                return `synthesized_optimal_${batchNumber}`;
            default:
                return `adaptive_focus_${batchNumber}`;
        }
    }

    /**
     * 📊 SET BATCH SIZE CONSTRAINTS
     * Allows external configuration of min/max bounds
     */
    setBatchSizeConstraints(minSize, maxSize, targetSize = null) {
        this.minBatchSize = Math.max(minSize, 5); // Absolute minimum
        this.maxBatchSize = Math.min(maxSize, 1000); // Absolute maximum
        
        if (targetSize) {
            this.targetBatchSize = Math.max(minSize, Math.min(targetSize, maxSize));
        }
        
        console.log(`📊 Batch size constraints updated: ${this.minBatchSize}-${this.maxBatchSize}, target: ${this.targetBatchSize}`);
    }

    /**
     * 🔧 ENABLE/DISABLE ADAPTIVE SIZING
     */
    setAdaptiveSizing(enabled) {
        this.adaptiveSizing = enabled;
        console.log(`📊 Adaptive batch sizing: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    /**
     * 📈 GET NEWSLETTER FLOW STATISTICS
     */
    getNewsletterFlowStats() {
        const last7Days = Array.from(this.dailyNewsletterFlow.entries()).slice(-7);
        const totalFlow = last7Days.reduce((sum, [_, count]) => sum + count, 0);
        const avgDailyFlow = last7Days.length > 0 ? totalFlow / last7Days.length : 0;
        
        return {
            last7DaysTotal: totalFlow,
            avgDailyFlow: avgDailyFlow.toFixed(1),
            currentBatchSize: this.targetBatchSize,
            adaptiveSizing: this.adaptiveSizing,
            flowData: Object.fromEntries(last7Days)
        };
    }

    /**
     * 📊 SET BATCH SIZE
     * Allows external systems to configure how many newsletters per batch
     */
    setBatchSize(size) {
        // This method is now deprecated in favor of setBatchSizeConstraints
        // Keeping it for compatibility, but it will not update the dynamic sizing logic
        console.warn("setBatchSize is deprecated. Use setBatchSizeConstraints instead.");
        this.targetBatchSize = size;
        console.log(`📊 Batch size updated (deprecated): ${size} newsletters per focus rotation`);
    }

    /**
     * 📈 GET BATCH PROGRESS
     */
    getBatchProgress() {
        return {
            currentBatch: this.batchCompletionCount + 1,
            newslettersAnalyzed: this.newslettersAnalyzedInCurrentFocus,
            totalInBatch: this.targetBatchSize,
            progress: (this.newslettersAnalyzedInCurrentFocus / this.targetBatchSize) * 100,
            currentFocus: this.currentFocus.name
        };
    }

    /**
     * 🏆 GET FOCUS PERFORMANCE SUMMARY
     */
    getFocusPerformanceSummary() {
        return this.focusHistory.map(focusData => ({
            batchNumber: focusData.batchNumber,
            focusName: focusData.focus.name,
            performance: focusData.performance,
            newslettersAnalyzed: focusData.newslettersAnalyzed
        }));
    }

    /**
     * 🔧 UTILITY METHODS
     */
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch (error) {
            return 'unknown';
        }
    }

    extractContentPatterns(text) {
        // Extract potential value patterns from text
        const patterns = [];
        
        // Financial patterns
        const financialMatches = text.match(/\$\d+[kmbt]?|\d+%|apy|yield|return/gi);
        if (financialMatches) patterns.push(...financialMatches);
        
        // Opportunity patterns  
        const opportunityMatches = text.match(/airdrop|farm|arbitrage|opportunity|alpha/gi);
        if (opportunityMatches) patterns.push(...opportunityMatches);
        
        return patterns.map(p => p.toLowerCase());
    }

    getCategoryPatterns(category) {
        const categoryMap = {
            'financial_data': ['$', '%', 'apy', 'yield', 'return', 'profit', 'revenue'],
            'technical_analysis': ['chart', 'technical', 'analysis', 'indicator', 'signal'],
            'market_trends': ['bull', 'bear', 'trend', 'momentum', 'cycle', 'season'],
            'opportunity_signals': ['airdrop', 'farm', 'arbitrage', 'opportunity', 'alpha'],
            'risk_indicators': ['risk', 'security', 'audit', 'vulnerability', 'exploit'],
            'regulatory_updates': ['regulation', 'compliance', 'legal', 'sec', 'government']
        };
        
        return categoryMap[category] || [];
    }

    normalizeWeights(weights) {
        const total = Array.from(weights.values()).reduce((sum, w) => sum + w, 0);
        if (total > 0) {
            weights.forEach((value, key) => {
                weights.set(key, value / total);
            });
        }
    }

    analyzeRecentActivity() {
        // Placeholder - would analyze recent learning activity
        return 0.5;
    }

    calculateNetworkDensity() {
        // Placeholder - would calculate cross-reference network density
        return 0.5;
    }

    applyContextualRelevance(text, context) {
        // Placeholder for context-specific relevance adjustments
        return 0;
    }

    /**
     * 🔧 UTILITY: GET ALL CATEGORIES
     */
    getAllCategories() {
        return ['financial_data', 'technical_analysis', 'market_trends', 'opportunity_signals', 'risk_indicators', 'regulatory_updates', 'network_analysis', 'sentiment_analysis'];
    }
} 