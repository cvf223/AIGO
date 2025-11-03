/**
 * Chain-specific evolution methods for AlphaGnomeEvolutionarySystem
 * 
 * This file contains methods to be added to the AlphaGnomeEvolutionarySystem class
 * to support chain-specific populations and evolution.
 */

/**
 * Evolve a specific chain population
 */
async evolveChainPopulation(chain) {
    if (!this.chainPopulations.has(chain)) {
        console.error(`❌ No population found for chain: ${chain}`);
        return null;
    }
    
    console.log(`🧬 Evolving population for chain: ${chain}...`);
    
    const population = this.chainPopulations.get(chain);
    const metrics = this.metrics.chainMetrics.get(chain);
    
    // Store current best fitness
    const previousBestFitness = metrics.bestFitness;
    
    // Selection
    const parents = this._selectParentsFromPopulation(population);
    
    // Crossover and mutation
    const offspring = [];
    
    for (let i = 0; i < parents.length; i += 2) {
        if (i + 1 < parents.length) {
            const childA = this._crossover(parents[i], parents[i + 1]);
            const childB = this._crossover(parents[i + 1], parents[i]);
            
            this._mutate(childA);
            this._mutate(childB);
            
            offspring.push(childA, childB);
        }
    }
    
    // Evaluation
    for (const individual of offspring) {
        // Use chain-specific market conditions for evaluation
        const marketConditions = this._getMarketConditions(chain);
        
        // Evaluate fitness with chain-specific conditions
        individual.fitness = await this._evaluateFitness(individual, { chain, marketConditions });
    }
    
    // Replacement
    this._replacePopulation(population, offspring);
    
    // Find best individual for this chain
    let bestIndividual = null;
    let bestFitness = -Infinity;
    
    for (const individual of population.values()) {
        if (individual.fitness > bestFitness) {
            bestFitness = individual.fitness;
            bestIndividual = individual;
        }
    }
    
    // Update chain-specific best individual
    if (bestIndividual) {
        this.chainBestIndividuals.set(chain, bestIndividual);
        metrics.bestFitness = bestFitness;
    }
    
    // Update metrics
    metrics.totalEvolutions++;
    
    if (bestFitness > previousBestFitness) {
        metrics.fitnessImprovements++;
    }
    
    // Calculate average fitness
    let totalFitness = 0;
    for (const individual of population.values()) {
        totalFitness += individual.fitness;
    }
    metrics.averageFitness = totalFitness / population.size;
    
    console.log(`✅ Chain ${chain} evolution complete: Best fitness: ${metrics.bestFitness.toFixed(4)}, Avg: ${metrics.averageFitness.toFixed(4)}`);
    
    return {
        chain,
        generation: metrics.totalEvolutions,
        bestFitness: metrics.bestFitness,
        averageFitness: metrics.averageFitness,
        improvement: metrics.bestFitness - previousBestFitness
    };
}

/**
 * Get best strategy for a specific chain
 */
getBestChainStrategy(chain) {
    if (!this.chainPopulations.has(chain)) {
        console.warn(`⚠️ No population found for chain: ${chain}, using default strategy`);
        return this.getBestStrategy();
    }
    
    const bestIndividual = this.chainBestIndividuals.get(chain);
    
    if (!bestIndividual) {
        console.warn(`⚠️ No best individual found for chain: ${chain}, using default strategy`);
        return this.getBestStrategy();
    }
    
    return this.applyGenotypeToAgent(`${chain}_best`, bestIndividual.genotype);
}

/**
 * Get market conditions for a specific chain
 */
_getMarketConditions(chain) {
    // Ensure chain is properly set
    if (!chain) {
        console.warn('⚠️ No chain specified, defaulting to ethereum');
        chain = 'ethereum';
    }
    // Get market data from AlphaFold if available
    let marketData = null;
    
    try {
        // Try to get chain-specific data from AlphaFold
        if (this.alphaFoldPredictor) {
            marketData = this.alphaFoldPredictor.getChainMarketData(chain);
        }
    } catch (error) {
        console.error(`Error getting market data for ${chain}:`, error);
    }
    
    // Chain-specific default conditions
    const defaultConditions = {
        ethereum: {
            volatility: 0.4,
            competition: 0.9,
            profitability: 0.3,
            gasPrice: 0.8,
            liquidityDepth: 0.7,
            trendDirection: 0,
            summary: 'high_competition'
        },
        arbitrum: {
            volatility: 0.5,
            competition: 0.7,
            profitability: 0.6,
            gasPrice: 0.4,
            liquidityDepth: 0.6,
            trendDirection: 0.2,
            summary: 'moderate_competition'
        },
        optimism: {
            volatility: 0.6,
            competition: 0.5,
            profitability: 0.7,
            gasPrice: 0.3,
            liquidityDepth: 0.5,
            trendDirection: 0.3,
            summary: 'profitable'
        },
        base: {
            volatility: 0.7,
            competition: 0.4,
            profitability: 0.8,
            gasPrice: 0.2,
            liquidityDepth: 0.4,
            trendDirection: 0.4,
            summary: 'highly_profitable'
        },
        polygon: {
            volatility: 0.6,
            competition: 0.6,
            profitability: 0.7,
            gasPrice: 0.1,
            liquidityDepth: 0.5,
            trendDirection: 0.3,
            summary: 'low_cost_profitable'
        },
        bsc: {
            volatility: 0.8,
            competition: 0.5,
            profitability: 0.8,
            gasPrice: 0.1,
            liquidityDepth: 0.4,
            trendDirection: 0.4,
            summary: 'high_volatility_profitable'
        }
    };
    
    // Get default conditions for this chain
    const chainDefaults = defaultConditions[chain] || defaultConditions.ethereum;
    
    // If we have market data, use it to set conditions
    if (marketData) {
        return {
            volatility: marketData.volatility || chainDefaults.volatility,
            competition: marketData.competition || chainDefaults.competition,
            profitability: marketData.profitability || chainDefaults.profitability,
            gasPrice: marketData.gasPrice || chainDefaults.gasPrice,
            liquidityDepth: marketData.liquidityDepth || chainDefaults.liquidityDepth,
            trendDirection: marketData.trendDirection || chainDefaults.trendDirection,
            summary: this._summarizeMarketConditions(marketData) || chainDefaults.summary
        };
    }
    
    return chainDefaults;
}

/**
 * Evolve all chain-specific populations
 */
async evolveAllChains() {
    if (!this.config.chainSpecificPopulations) {
        console.log('⚠️ Chain-specific populations not enabled');
        return null;
    }
    
    const results = {};
    
    for (const chain of this.chainPopulations.keys()) {
        const result = await this.evolveChainPopulation(chain);
        results[chain] = result;
    }
    
    return results;
}
