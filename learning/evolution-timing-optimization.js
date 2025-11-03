/**
 * Evolution Timing Optimization for AlphaGnomeEvolutionarySystem
 * 
 * This module provides methods to optimize evolution timing to run within block timeframes
 * and measure computational performance of the evolutionary system.
 */

/**
 * Block-aware evolution timing system
 * 
 * This class optimizes evolution timing to run within block timeframes,
 * ensuring that evolution doesn't interfere with critical arbitrage operations.
 */
export class BlockAwareEvolutionTiming {
    constructor(config = {}) {
        this.config = {
            // Default block time in milliseconds
            ethereumBlockTime: config.ethereumBlockTime || 12000,
            arbitrumBlockTime: config.arbitrumBlockTime || 250,
            optimismBlockTime: config.optimismBlockTime || 2000,
            baseBlockTime: config.baseBlockTime || 2000,
            polygonBlockTime: config.polygonBlockTime || 2000,
            bscBlockTime: config.bscBlockTime || 3000,
            
            // Maximum evolution time as percentage of block time
            maxEvolutionTimePercentage: config.maxEvolutionTimePercentage || 0.3,
            
            // Performance tracking
            trackPerformance: config.trackPerformance !== false,
            performanceHistorySize: config.performanceHistorySize || 100,
            
            // Debug
            debug: config.debug || false
        };
        
        // Performance tracking
        this.performanceMetrics = {
            evolutionTimes: [],
            lastEvolutionTime: 0,
            averageEvolutionTime: 0,
            maxEvolutionTime: 0,
            totalEvolutions: 0,
            abortedEvolutions: 0,
            chainMetrics: new Map()
        };
        
        // Chain-specific metrics
        for (const chain of ['ethereum', 'arbitrum', 'optimism', 'base', 'polygon', 'bsc']) {
            this.performanceMetrics.chainMetrics.set(chain, {
                evolutionTimes: [],
                lastEvolutionTime: 0,
                averageEvolutionTime: 0,
                maxEvolutionTime: 0,
                totalEvolutions: 0,
                abortedEvolutions: 0
            });
        }
    }
    
    /**
     * Get maximum allowed evolution time for a chain
     */
    getMaxEvolutionTime(chain = 'ethereum') {
        // Get block time for this chain
        let blockTime;
        switch (chain) {
            case 'arbitrum':
                blockTime = this.config.arbitrumBlockTime;
                break;
            case 'optimism':
                blockTime = this.config.optimismBlockTime;
                break;
            case 'base':
                blockTime = this.config.baseBlockTime;
                break;
            case 'polygon':
                blockTime = this.config.polygonBlockTime;
                break;
            case 'bsc':
                blockTime = this.config.bscBlockTime;
                break;
            default:
                blockTime = this.config.ethereumBlockTime;
        }
        
        // Calculate maximum evolution time
        return blockTime * this.config.maxEvolutionTimePercentage;
    }
    
    /**
     * Start timing an evolution
     */
    startEvolutionTiming(chain = null) {
        const startTime = performance.now();
        
        return {
            startTime,
            chain
        };
    }
    
    /**
     * End timing an evolution and record metrics
     */
    endEvolutionTiming(timing) {
        const endTime = performance.now();
        const duration = endTime - timing.startTime;
        
        // Update global metrics
        this.performanceMetrics.evolutionTimes.push(duration);
        if (this.performanceMetrics.evolutionTimes.length > this.config.performanceHistorySize) {
            this.performanceMetrics.evolutionTimes.shift();
        }
        
        this.performanceMetrics.lastEvolutionTime = duration;
        this.performanceMetrics.totalEvolutions++;
        
        if (duration > this.performanceMetrics.maxEvolutionTime) {
            this.performanceMetrics.maxEvolutionTime = duration;
        }
        
        // Calculate average
        this.performanceMetrics.averageEvolutionTime = 
            this.performanceMetrics.evolutionTimes.reduce((sum, time) => sum + time, 0) / 
            this.performanceMetrics.evolutionTimes.length;
        
        // Update chain-specific metrics if chain is provided
        if (timing.chain) {
            const chainMetrics = this.performanceMetrics.chainMetrics.get(timing.chain);
            if (chainMetrics) {
                chainMetrics.evolutionTimes.push(duration);
                if (chainMetrics.evolutionTimes.length > this.config.performanceHistorySize) {
                    chainMetrics.evolutionTimes.shift();
                }
                
                chainMetrics.lastEvolutionTime = duration;
                chainMetrics.totalEvolutions++;
                
                if (duration > chainMetrics.maxEvolutionTime) {
                    chainMetrics.maxEvolutionTime = duration;
                }
                
                // Calculate average
                chainMetrics.averageEvolutionTime = 
                    chainMetrics.evolutionTimes.reduce((sum, time) => sum + time, 0) / 
                    chainMetrics.evolutionTimes.length;
            }
        }
        
        return {
            duration,
            withinLimit: timing.chain ? 
                duration <= this.getMaxEvolutionTime(timing.chain) : 
                true
        };
    }
    
    /**
     * Check if evolution should be aborted due to time constraints
     */
    shouldAbortEvolution(timing, chain = null) {
        const currentDuration = performance.now() - timing.startTime;
        const maxTime = chain ? this.getMaxEvolutionTime(chain) : Infinity;
        
        if (currentDuration > maxTime) {
            // Record aborted evolution
            this.performanceMetrics.abortedEvolutions++;
            
            if (chain) {
                const chainMetrics = this.performanceMetrics.chainMetrics.get(chain);
                if (chainMetrics) {
                    chainMetrics.abortedEvolutions++;
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Get performance report
     */
    getPerformanceReport() {
        const report = {
            global: {
                averageEvolutionTime: this.performanceMetrics.averageEvolutionTime,
                maxEvolutionTime: this.performanceMetrics.maxEvolutionTime,
                totalEvolutions: this.performanceMetrics.totalEvolutions,
                abortedEvolutions: this.performanceMetrics.abortedEvolutions,
                abortRate: this.performanceMetrics.totalEvolutions > 0 ? 
                    (this.performanceMetrics.abortedEvolutions / this.performanceMetrics.totalEvolutions) * 100 : 0
            },
            chains: {}
        };
        
        // Add chain-specific metrics
        for (const [chain, metrics] of this.performanceMetrics.chainMetrics.entries()) {
            report.chains[chain] = {
                averageEvolutionTime: metrics.averageEvolutionTime,
                maxEvolutionTime: metrics.maxEvolutionTime,
                totalEvolutions: metrics.totalEvolutions,
                abortedEvolutions: metrics.abortedEvolutions,
                abortRate: metrics.totalEvolutions > 0 ? 
                    (metrics.abortedEvolutions / metrics.totalEvolutions) * 100 : 0,
                blockTime: this.getBlockTime(chain),
                maxAllowedTime: this.getMaxEvolutionTime(chain)
            };
        }
        
        return report;
    }
    
    /**
     * Get block time for a chain
     */
    getBlockTime(chain) {
        switch (chain) {
            case 'arbitrum':
                return this.config.arbitrumBlockTime;
            case 'optimism':
                return this.config.optimismBlockTime;
            case 'base':
                return this.config.baseBlockTime;
            case 'polygon':
                return this.config.polygonBlockTime;
            case 'bsc':
                return this.config.bscBlockTime;
            default:
                return this.config.ethereumBlockTime;
        }
    }
    
    /**
     * Estimate computational requirements for evolution
     */
    estimateComputationalRequirements(populationSize, genomeSize) {
        // This is a simplified model based on typical genetic algorithm complexity
        // O(populationSize * genomeSize * log(populationSize))
        
        const baseComputationTime = 0.01; // base time in milliseconds
        const estimatedTime = baseComputationTime * populationSize * genomeSize * Math.log10(populationSize);
        
        // Estimate memory usage (very rough approximation)
        const bytesPerIndividual = 200 + (genomeSize * 20); // base + genes
        const estimatedMemoryBytes = populationSize * bytesPerIndividual;
        
        return {
            estimatedTimeMs: estimatedTime,
            estimatedMemoryMB: estimatedMemoryBytes / (1024 * 1024),
            populationSize,
            genomeSize,
            canRunWithinBlockTime: {
                ethereum: estimatedTime < this.getMaxEvolutionTime('ethereum'),
                arbitrum: estimatedTime < this.getMaxEvolutionTime('arbitrum'),
                optimism: estimatedTime < this.getMaxEvolutionTime('optimism'),
                base: estimatedTime < this.getMaxEvolutionTime('base')
            }
        };
    }
}

export default BlockAwareEvolutionTiming;
