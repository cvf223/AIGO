/**
 * 🧬 COMPETITOR-GUIDED MUTATION SYSTEM
 * ==================================
 * 
 * Uses competitor analysis data and benchmarks to guide genetic mutations
 * toward successful strategies observed in the market.
 */

export class CompetitorGuidedMutation {
    constructor(config = {}) {
        this.config = {
            debug: config.debug || false,
            competitorInfluenceWeight: config.competitorInfluenceWeight || 0.4,
            benchmarkInfluenceWeight: config.benchmarkInfluenceWeight || 0.3,
            marketInfluenceWeight: config.marketInfluenceWeight || 0.3,
            ...config
        };
        
        // Store competitor data and benchmarks
        this.competitorProfiles = new Map();
        this.benchmarks = new Map();
        this.successfulStrategies = new Map();
        this.competitorBehaviorPatterns = new Map();
    }
    
    /**
     * Update competitor data for mutation guidance
     */
    updateCompetitorData(competitorAnalysis, chain) {
        console.log(`🔄 Updating competitor data for ${chain} mutations...`);
        
        // Store competitor profiles
        if (competitorAnalysis.competitorProfiles) {
            for (const [address, profile] of Object.entries(competitorAnalysis.competitorProfiles)) {
                this.competitorProfiles.set(`${address}_${chain}`, profile);
            }
        }
        
        // Store benchmarks
        if (competitorAnalysis.benchmarks) {
            this.benchmarks.set(chain, competitorAnalysis.benchmarks);
        }
        
        // Extract successful strategies
        this._extractSuccessfulStrategies(competitorAnalysis, chain);
        
        // Analyze behavior patterns
        this._analyzeBehaviorPatterns(competitorAnalysis, chain);
        
        console.log(`✅ Updated competitor data: ${this.competitorProfiles.size} profiles, ${this.successfulStrategies.size} strategies`);
    }
    
    /**
     * Generate competitor-guided mutation
     */
    generateCompetitorGuidedMutation(individual, category, gene, chain, marketConditions) {
        const mutations = [];
        
        // Get competitor benchmarks for this chain
        const chainBenchmarks = this.benchmarks.get(chain);
        if (!chainBenchmarks) {
            console.log(`⚠️ No benchmarks available for ${chain}, using standard mutation`);
            return this._generateStandardMutation(individual, category, gene);
        }
        
        // Get successful strategies
        const successfulStrategies = this.successfulStrategies.get(chain) || [];
        
        // Generate different types of competitor-guided mutations
        
        // 1. Benchmark-guided mutation
        const benchmarkMutation = this._generateBenchmarkGuidedMutation(
            individual, category, gene, chainBenchmarks
        );
        if (benchmarkMutation) {
            mutations.push({
                ...benchmarkMutation,
                type: 'benchmark_guided',
                confidence: 0.8
            });
        }
        
        // 2. Strategy-mimicking mutation
        const strategyMutation = this._generateStrategyMimickingMutation(
            individual, category, gene, successfulStrategies
        );
        if (strategyMutation) {
            mutations.push({
                ...strategyMutation,
                type: 'strategy_mimicking',
                confidence: 0.7
            });
        }
        
        // 3. Competitive advantage mutation
        const competitiveMutation = this._generateCompetitiveAdvantageMutation(
            individual, category, gene, chainBenchmarks, marketConditions
        );
        if (competitiveMutation) {
            mutations.push({
                ...competitiveMutation,
                type: 'competitive_advantage',
                confidence: 0.9
            });
        }
        
        // 4. Pattern-based mutation
        const patternMutation = this._generatePatternBasedMutation(
            individual, category, gene, chain
        );
        if (patternMutation) {
            mutations.push({
                ...patternMutation,
                type: 'pattern_based',
                confidence: 0.6
            });
        }
        
        // Select best mutation based on confidence and context
        if (mutations.length === 0) {
            return this._generateStandardMutation(individual, category, gene);
        }
        
        // Sort by confidence and select best
        mutations.sort((a, b) => b.confidence - a.confidence);
        const selectedMutation = mutations[0];
        
        if (this.config.debug) {
            console.log(`🎯 Selected ${selectedMutation.type} mutation for ${category}.${gene} with confidence ${selectedMutation.confidence}`);
        }
        
        return selectedMutation;
    }
    
    /**
     * Generate benchmark-guided mutation
     */
    _generateBenchmarkGuidedMutation(individual, category, gene, benchmarks) {
        const currentValue = individual.genotype[category]?.[gene];
        if (currentValue === undefined) return null;
        
        // Map genes to benchmark metrics
        const geneToMetric = {
            // Strategy genes
            gasEfficiencyFactor: 'priorityFees.efficiency',
            opportunityThreshold: 'profitability.threshold',
            riskTolerance: 'risk.tolerance',
            timeoutThresholdMs: 'execution.speed',
            
            // Decision genes
            competitiveAggressiveness: 'competition.aggression',
            confidenceThreshold: 'decision.confidence',
            
            // Execution genes
            gasOptimization: 'gas.optimization',
            speedPriority: 'execution.priority',
            retryTolerance: 'execution.resilience'
        };
        
        const metricPath = geneToMetric[gene];
        if (!metricPath) return null;
        
        // Get benchmark value
        const benchmarkValue = this._getNestedValue(benchmarks, metricPath);
        if (benchmarkValue === undefined) return null;
        
        // Calculate target value based on benchmark
        let targetValue;
        
        if (gene.includes('threshold') || gene.includes('tolerance')) {
            // For thresholds, move toward benchmark with some variation
            targetValue = benchmarkValue + (Math.random() - 0.5) * 0.1;
        } else if (gene.includes('efficiency') || gene.includes('optimization')) {
            // For efficiency metrics, aim slightly above benchmark
            targetValue = Math.min(1.0, benchmarkValue * 1.1 + Math.random() * 0.1);
        } else {
            // General case: move toward benchmark
            targetValue = benchmarkValue + (Math.random() - 0.5) * 0.2;
        }
        
        // Ensure value is in valid range
        targetValue = Math.max(0, Math.min(1, targetValue));
        
        return {
            newValue: targetValue,
            reasoning: `Adjusted toward benchmark value ${benchmarkValue.toFixed(3)} for competitive advantage`,
            benchmarkValue,
            improvement: Math.abs(targetValue - currentValue)
        };
    }
    
    /**
     * Generate strategy-mimicking mutation
     */
    _generateStrategyMimickingMutation(individual, category, gene, strategies) {
        if (strategies.length === 0) return null;
        
        const currentValue = individual.genotype[category]?.[gene];
        if (currentValue === undefined) return null;
        
        // Find successful strategies that affect this gene
        const relevantStrategies = strategies.filter(strategy => 
            strategy.geneMappings && strategy.geneMappings[`${category}.${gene}`]
        );
        
        if (relevantStrategies.length === 0) return null;
        
        // Select best performing strategy
        relevantStrategies.sort((a, b) => b.performance - a.performance);
        const bestStrategy = relevantStrategies[0];
        
        const targetValue = bestStrategy.geneMappings[`${category}.${gene}`];
        
        // Add some variation to avoid exact copying
        const variationFactor = 0.1;
        const finalValue = targetValue + (Math.random() - 0.5) * variationFactor;
        
        return {
            newValue: Math.max(0, Math.min(1, finalValue)),
            reasoning: `Mimicking successful strategy "${bestStrategy.name}" with ${bestStrategy.performance.toFixed(3)} performance`,
            strategyName: bestStrategy.name,
            originalValue: targetValue
        };
    }
    
    /**
     * Generate competitive advantage mutation
     */
    _generateCompetitiveAdvantageMutation(individual, category, gene, benchmarks, marketConditions) {
        const currentValue = individual.genotype[category]?.[gene];
        if (currentValue === undefined) return null;
        
        // Analyze competitive gaps
        const gaps = this._identifyCompetitiveGaps(category, gene, benchmarks);
        if (gaps.length === 0) return null;
        
        // Find the most exploitable gap
        gaps.sort((a, b) => b.exploitability - a.exploitability);
        const bestGap = gaps[0];
        
        // Calculate target value to exploit the gap
        let targetValue = bestGap.targetValue;
        
        // Adjust based on market conditions
        if (marketConditions) {
            targetValue = this._adjustForMarketConditions(targetValue, category, gene, marketConditions);
        }
        
        return {
            newValue: Math.max(0, Math.min(1, targetValue)),
            reasoning: `Exploiting competitive gap: ${bestGap.description}`,
            gap: bestGap,
            marketAdjustment: marketConditions ? 'applied' : 'none'
        };
    }
    
    /**
     * Generate pattern-based mutation
     */
    _generatePatternBasedMutation(individual, category, gene, chain) {
        const patterns = this.competitorBehaviorPatterns.get(chain);
        if (!patterns || !patterns[category]) return null;
        
        const categoryPatterns = patterns[category];
        const genePattern = categoryPatterns[gene];
        
        if (!genePattern) return null;
        
        // Use pattern to guide mutation
        const currentValue = individual.genotype[category]?.[gene];
        if (currentValue === undefined) return null;
        
        // Calculate target based on successful pattern
        let targetValue;
        
        if (genePattern.trend === 'increasing') {
            targetValue = Math.min(1.0, currentValue + genePattern.avgIncrease);
        } else if (genePattern.trend === 'decreasing') {
            targetValue = Math.max(0.0, currentValue - genePattern.avgDecrease);
        } else {
            // Oscillating or stable - move toward optimal value
            targetValue = genePattern.optimalValue + (Math.random() - 0.5) * genePattern.variance;
        }
        
        return {
            newValue: Math.max(0, Math.min(1, targetValue)),
            reasoning: `Following ${genePattern.trend} pattern observed in successful competitors`,
            pattern: genePattern
        };
    }
    
    /**
     * Extract successful strategies from competitor analysis
     */
    _extractSuccessfulStrategies(competitorAnalysis, chain) {
        const strategies = [];
        
        // Extract from competitor profiles
        if (competitorAnalysis.competitorProfiles) {
            for (const [address, profile] of Object.entries(competitorAnalysis.competitorProfiles)) {
                if (profile.performance && profile.performance > 0.7) { // High performance threshold
                    strategies.push({
                        name: `competitor_${address.slice(0, 8)}_strategy`,
                        performance: profile.performance,
                        geneMappings: this._profileToGeneMappings(profile),
                        source: 'competitor_analysis'
                    });
                }
            }
        }
        
        // Extract from benchmark data
        if (competitorAnalysis.benchmarks) {
            strategies.push({
                name: 'benchmark_optimal_strategy',
                performance: 0.8, // Benchmark performance
                geneMappings: this._benchmarkToGeneMappings(competitorAnalysis.benchmarks),
                source: 'benchmark_analysis'
            });
        }
        
        this.successfulStrategies.set(chain, strategies);
    }
    
    /**
     * Analyze behavior patterns
     */
    _analyzeBehaviorPatterns(competitorAnalysis, chain) {
        const patterns = {
            strategy: {},
            learning: {},
            decision: {},
            execution: {}
        };
        
        // Analyze competitor behavior patterns
        if (competitorAnalysis.competitorProfiles) {
            for (const profile of Object.values(competitorAnalysis.competitorProfiles)) {
                this._updatePatternsFromProfile(patterns, profile);
            }
        }
        
        // Store patterns
        this.competitorBehaviorPatterns.set(chain, patterns);
    }
    
    /**
     * Convert competitor profile to gene mappings
     */
    _profileToGeneMappings(profile) {
        const mappings = {};
        
        // Map profile characteristics to genes
        if (profile.gasOptimization !== undefined) {
            mappings['strategy.gasEfficiencyFactor'] = profile.gasOptimization;
            mappings['execution.gasOptimization'] = profile.gasOptimization;
        }
        
        if (profile.aggressiveness !== undefined) {
            mappings['decision.competitiveAggressiveness'] = profile.aggressiveness;
        }
        
        if (profile.riskTolerance !== undefined) {
            mappings['strategy.riskTolerance'] = profile.riskTolerance;
        }
        
        if (profile.speedPriority !== undefined) {
            mappings['execution.speedPriority'] = profile.speedPriority;
        }
        
        return mappings;
    }
    
    /**
     * Convert benchmark data to gene mappings
     */
    _benchmarkToGeneMappings(benchmarks) {
        const mappings = {};
        
        // Map benchmark metrics to genes
        if (benchmarks.gasEfficiency !== undefined) {
            mappings['strategy.gasEfficiencyFactor'] = benchmarks.gasEfficiency;
            mappings['execution.gasOptimization'] = benchmarks.gasEfficiency;
        }
        
        if (benchmarks.competitiveness !== undefined) {
            mappings['decision.competitiveAggressiveness'] = benchmarks.competitiveness;
        }
        
        if (benchmarks.profitability !== undefined) {
            mappings['strategy.opportunityThreshold'] = 1 - benchmarks.profitability; // Inverse relationship
        }
        
        return mappings;
    }
    
    /**
     * Identify competitive gaps
     */
    _identifyCompetitiveGaps(category, gene, benchmarks) {
        const gaps = [];
        
        // Analyze where competitors are weak
        const geneMetrics = this._getGeneMetrics(category, gene, benchmarks);
        
        if (geneMetrics) {
            // Find underutilized strategies
            if (geneMetrics.variance > 0.3) {
                gaps.push({
                    description: 'High variance in competitor strategies',
                    targetValue: geneMetrics.optimal,
                    exploitability: 0.8,
                    type: 'variance_exploitation'
                });
            }
            
            // Find performance gaps
            if (geneMetrics.performanceGap > 0.2) {
                gaps.push({
                    description: 'Performance gap in competitor strategies',
                    targetValue: geneMetrics.topPerformer,
                    exploitability: 0.9,
                    type: 'performance_gap'
                });
            }
        }
        
        return gaps;
    }
    
    /**
     * Adjust mutation for market conditions
     */
    _adjustForMarketConditions(targetValue, category, gene, marketConditions) {
        let adjustedValue = targetValue;
        
        // Adjust based on market volatility
        if (marketConditions.volatility > 0.7 && gene.includes('risk')) {
            adjustedValue *= 1.2; // Increase risk tolerance in volatile markets
        }
        
        // Adjust based on competition
        if (marketConditions.competition > 0.8 && gene.includes('aggressive')) {
            adjustedValue *= 1.3; // Increase aggressiveness in competitive markets
        }
        
        // Adjust based on gas prices
        if (marketConditions.gasPrice > 0.7 && gene.includes('gas')) {
            adjustedValue *= 1.4; // Increase gas optimization in high gas environments
        }
        
        return Math.max(0, Math.min(1, adjustedValue));
    }
    
    /**
     * Generate standard mutation as fallback
     */
    _generateStandardMutation(individual, category, gene) {
        const currentValue = individual.genotype[category]?.[gene];
        if (currentValue === undefined) return null;
        
        // Simple gaussian mutation
        const change = this._gaussianRandom(0, 0.1);
        const newValue = Math.max(0, Math.min(1, currentValue + change));
        
        return {
            newValue,
            reasoning: 'Standard gaussian mutation (no competitor data available)',
            type: 'standard'
        };
    }
    
    // Helper methods
    
    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    _updatePatternsFromProfile(patterns, profile) {
        // Implementation would analyze profile and update patterns
        // This is simplified for brevity
    }
    
    _getGeneMetrics(category, gene, benchmarks) {
        // Implementation would extract relevant metrics for the gene
        // This is simplified for brevity
        return null;
    }
    
    _gaussianRandom(mean = 0, stdDev = 1) {
        // Box-Muller transform
        const u1 = 1 - Math.random();
        const u2 = 1 - Math.random();
        const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        return z0 * stdDev + mean;
    }
}

export default CompetitorGuidedMutation;
