/**
 * 🧬 GENOME ANALYSIS SYSTEM
 * ========================
 * 
 * Analyzes the computational impact of genome size and provides insights
 * for optimal population and genome configuration.
 */

export class GenomeAnalysisSystem {
    constructor(config = {}) {
        this.config = {
            debug: config.debug || false,
            ...config
        };
    }
    
    /**
     * Analyze genome size and its computational consequences
     */
    analyzeGenomeSize(genotype) {
        if (!genotype) {
            console.warn('⚠️ No genotype provided for analysis');
            return this._getDefaultGenomeAnalysis();
        }
        
        let totalGenes = 0;
        let genesByCategory = {};
        let complexityScore = 0;
        
        // Count genes in each category
        for (const [category, genes] of Object.entries(genotype)) {
            const categoryGeneCount = Object.keys(genes).length;
            genesByCategory[category] = categoryGeneCount;
            totalGenes += categoryGeneCount;
            
            // Calculate complexity based on category
            complexityScore += this._calculateCategoryComplexity(category, categoryGeneCount);
        }
        
        // Calculate computational consequences
        const consequences = this._calculateComputationalConsequences(totalGenes, complexityScore);
        
        return {
            totalGenes,
            genesByCategory,
            complexityScore,
            consequences,
            recommendations: this._generateOptimizationRecommendations(totalGenes, complexityScore, consequences),
            resourceUsage: this._estimateResourceUsage(totalGenes, complexityScore),
            scalingAnalysis: this._analyzeScaling(totalGenes)
        };
    }
    
    /**
     * Calculate category complexity
     */
    _calculateCategoryComplexity(category, geneCount) {
        // Different categories have different computational complexity
        const complexityWeights = {
            strategy: 1.5,      // Strategy genes are most important and complex
            learning: 2.0,      // Learning genes require the most computation
            decision: 1.8,      // Decision genes are highly complex
            execution: 1.2      // Execution genes are moderately complex
        };
        
        const weight = complexityWeights[category] || 1.0;
        return geneCount * weight;
    }
    
    /**
     * Calculate computational consequences of genome size
     */
    _calculateComputationalConsequences(totalGenes, complexityScore) {
        const consequences = {
            // Evolution time consequences (milliseconds per generation)
            evolutionTime: {
                perGeneration: totalGenes * 0.1 + complexityScore * 0.05,
                perMutation: totalGenes * 0.01 + complexityScore * 0.005,
                perCrossover: totalGenes * 0.02 + complexityScore * 0.01,
                perEvaluation: totalGenes * 0.05 + complexityScore * 0.02
            },
            
            // Memory consequences (bytes)
            memory: {
                perIndividual: 200 + (totalGenes * 20) + (complexityScore * 10),
                perPopulation: function(populationSize) {
                    return this.perIndividual * populationSize;
                },
                heapPressure: totalGenes > 50 ? 'high' : totalGenes > 30 ? 'medium' : 'low'
            },
            
            // CPU consequences
            cpu: {
                utilizationPercentage: Math.min(100, (totalGenes * 0.5) + (complexityScore * 0.3)),
                coresRecommended: Math.ceil((totalGenes + complexityScore) / 20),
                parallelizationEfficiency: totalGenes > 40 ? 0.8 : totalGenes > 20 ? 0.9 : 0.95
            },
            
            // Storage consequences (for persistence)
            storage: {
                perGeneration: (totalGenes * 4) + (complexityScore * 2), // bytes
                databaseGrowthRate: totalGenes * 0.1, // MB per day
                indexingOverhead: totalGenes > 30 ? 'significant' : 'minimal'
            },
            
            // Network consequences (for distributed systems)
            network: {
                syncOverhead: totalGenes * 0.5, // bytes per sync
                bandwidth: complexityScore > 50 ? 'high' : 'medium',
                latencySensitivity: totalGenes > 40 ? 'high' : 'medium'
            }
        };
        
        return consequences;
    }
    
    /**
     * Generate optimization recommendations
     */
    _generateOptimizationRecommendations(totalGenes, complexityScore, consequences) {
        const recommendations = [];
        
        // Genome size recommendations
        if (totalGenes > 50) {
            recommendations.push({
                type: 'genome_size',
                priority: 'high',
                recommendation: 'Consider reducing genome size for better performance',
                details: `Current genome has ${totalGenes} genes. Optimal range is 20-40 genes.`,
                impact: 'Reduces evolution time by ~40% and memory usage by ~30%'
            });
        } else if (totalGenes < 15) {
            recommendations.push({
                type: 'genome_size',
                priority: 'medium',
                recommendation: 'Consider expanding genome for better strategy diversity',
                details: `Current genome has only ${totalGenes} genes. May limit strategy complexity.`,
                impact: 'Increases strategy diversity but requires more computational resources'
            });
        }
        
        // Population size recommendations
        if (consequences.memory.heapPressure === 'high') {
            recommendations.push({
                type: 'population_size',
                priority: 'high',
                recommendation: 'Reduce population size to manage memory pressure',
                details: `High memory pressure detected. Consider reducing population to 50-75 individuals.`,
                impact: 'Reduces memory usage significantly but may slow convergence'
            });
        }
        
        // CPU optimization recommendations
        if (consequences.cpu.utilizationPercentage > 80) {
            recommendations.push({
                type: 'cpu_optimization',
                priority: 'high',
                recommendation: 'Implement parallel processing or reduce complexity',
                details: `High CPU utilization (${consequences.cpu.utilizationPercentage.toFixed(1)}%). Consider using ${consequences.cpu.coresRecommended} cores.`,
                impact: 'Improves evolution speed and system responsiveness'
            });
        }
        
        // Memory optimization recommendations
        if (consequences.memory.perIndividual > 1000) {
            recommendations.push({
                type: 'memory_optimization',
                priority: 'medium',
                recommendation: 'Optimize gene representation to reduce memory usage',
                details: `Each individual uses ${consequences.memory.perIndividual} bytes. Consider gene compression.`,
                impact: 'Reduces memory footprint and enables larger populations'
            });
        }
        
        // Storage optimization recommendations
        if (consequences.storage.databaseGrowthRate > 10) {
            recommendations.push({
                type: 'storage_optimization',
                priority: 'medium',
                recommendation: 'Implement data archiving strategy',
                details: `Database growing at ${consequences.storage.databaseGrowthRate.toFixed(1)} MB/day. Consider archiving old generations.`,
                impact: 'Prevents database bloat and maintains performance'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Estimate detailed resource usage
     */
    _estimateResourceUsage(totalGenes, complexityScore) {
        const populationSizes = [50, 100, 200, 500];
        const usage = {};
        
        populationSizes.forEach(popSize => {
            const consequences = this._calculateComputationalConsequences(totalGenes, complexityScore);
            
            usage[`population_${popSize}`] = {
                // Memory usage
                memoryMB: (consequences.memory.perIndividual * popSize) / (1024 * 1024),
                memoryMBWithOverhead: (consequences.memory.perIndividual * popSize * 1.5) / (1024 * 1024),
                
                // CPU usage
                cpuCores: consequences.cpu.coresRecommended,
                cpuUtilization: Math.min(100, consequences.cpu.utilizationPercentage * (popSize / 100)),
                
                // Evolution time per generation (milliseconds)
                evolutionTimeMs: consequences.evolutionTime.perGeneration * (popSize / 100),
                
                // Storage per day (MB)
                storageMBPerDay: consequences.storage.databaseGrowthRate * (popSize / 100),
                
                // Network bandwidth (KB/s)
                networkKBps: (consequences.network.syncOverhead * popSize) / 1024,
                
                // Recommended maximum chains
                maxChains: Math.floor(8 / Math.max(1, Math.ceil(cpuCores / 2))),
                
                // Performance assessment
                performance: this._assessPerformance(popSize, totalGenes, complexityScore)
            };
        });
        
        return usage;
    }
    
    /**
     * Analyze scaling characteristics
     */
    _analyzeScaling(totalGenes) {
        const scaling = {
            // Algorithmic complexity
            timeComplexity: 'O(n * g * log(n))', // n=population, g=genes
            spaceComplexity: 'O(n * g)', // n=population, g=genes
            
            // Scaling factors
            populationScaling: {
                linear: 'Memory, Storage',
                logarithmic: 'Evolution convergence time',
                quadratic: 'Selection pressure effects'
            },
            
            geneScaling: {
                linear: 'Memory per individual, Mutation time',
                superlinear: 'Evaluation complexity, Crossover time',
                exponential: 'Search space size (theoretical)'
            },
            
            // Bottlenecks
            bottlenecks: this._identifyBottlenecks(totalGenes),
            
            // Optimal ranges
            optimalRanges: {
                genomeSize: { min: 15, max: 40, optimal: 25 },
                populationSize: { min: 50, max: 200, optimal: 100 },
                generations: { min: 100, max: 1000, optimal: 500 }
            },
            
            // Scaling strategies
            strategies: this._generateScalingStrategies(totalGenes)
        };
        
        return scaling;
    }
    
    /**
     * Identify performance bottlenecks
     */
    _identifyBottlenecks(totalGenes) {
        const bottlenecks = [];
        
        if (totalGenes > 40) {
            bottlenecks.push({
                type: 'genome_size',
                severity: 'high',
                description: 'Large genome size increases mutation and crossover time',
                solution: 'Consider gene pruning or hierarchical representation'
            });
        }
        
        if (totalGenes > 30) {
            bottlenecks.push({
                type: 'evaluation',
                severity: 'medium',
                description: 'Complex genomes require more sophisticated evaluation',
                solution: 'Implement parallel evaluation or approximation methods'
            });
        }
        
        return bottlenecks;
    }
    
    /**
     * Generate scaling strategies
     */
    _generateScalingStrategies(totalGenes) {
        const strategies = [];
        
        if (totalGenes > 35) {
            strategies.push({
                strategy: 'hierarchical_evolution',
                description: 'Evolve gene categories separately then combine',
                benefit: 'Reduces computational complexity by factor of 2-3'
            });
        }
        
        strategies.push({
            strategy: 'adaptive_population',
            description: 'Dynamically adjust population size based on convergence',
            benefit: 'Optimizes resource usage while maintaining diversity'
        });
        
        strategies.push({
            strategy: 'distributed_evolution',
            description: 'Distribute evolution across multiple cores/machines',
            benefit: 'Enables linear scaling with available resources'
        });
        
        return strategies;
    }
    
    /**
     * Assess performance for given configuration
     */
    _assessPerformance(populationSize, totalGenes, complexityScore) {
        const score = this._calculatePerformanceScore(populationSize, totalGenes, complexityScore);
        
        if (score > 80) return 'excellent';
        if (score > 60) return 'good';
        if (score > 40) return 'fair';
        if (score > 20) return 'poor';
        return 'unacceptable';
    }
    
    /**
     * Calculate performance score
     */
    _calculatePerformanceScore(populationSize, totalGenes, complexityScore) {
        // Optimal configuration gets 100 points
        let score = 100;
        
        // Penalize for excessive genome size
        if (totalGenes > 40) {
            score -= (totalGenes - 40) * 2;
        }
        
        // Penalize for excessive population size
        if (populationSize > 200) {
            score -= (populationSize - 200) * 0.1;
        }
        
        // Penalize for excessive complexity
        if (complexityScore > 80) {
            score -= (complexityScore - 80) * 0.5;
        }
        
        return Math.max(0, score);
    }
    
    /**
     * Get default genome analysis when no genotype is provided
     */
    _getDefaultGenomeAnalysis() {
        const defaultGenes = 25; // Typical genome size
        const defaultComplexity = 40;
        
        return {
            totalGenes: defaultGenes,
            genesByCategory: {
                strategy: 8,
                learning: 6,
                decision: 6,
                execution: 5
            },
            complexityScore: defaultComplexity,
            consequences: this._calculateComputationalConsequences(defaultGenes, defaultComplexity),
            recommendations: [],
            resourceUsage: this._estimateResourceUsage(defaultGenes, defaultComplexity),
            scalingAnalysis: this._analyzeScaling(defaultGenes)
        };
    }
}

export default GenomeAnalysisSystem;
