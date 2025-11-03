/**
 * Integration of BlockAwareEvolutionTiming with AlphaGnomeEvolutionarySystem
 * 
 * This file contains methods to integrate the BlockAwareEvolutionTiming system
 * with the AlphaGnomeEvolutionarySystem to optimize evolution timing.
 */

import { BlockAwareEvolutionTiming } from './evolution-timing-optimization.js';

/**
 * Integrate timing optimization with AlphaGnomeEvolutionarySystem
 * 
 * @param {AlphaGnomeEvolutionarySystem} alphaGnome - The AlphaGnome system to integrate with
 * @param {Object} config - Configuration for timing optimization
 * @returns {BlockAwareEvolutionTiming} - The timing system instance
 */
export function integrateTimingOptimization(alphaGnome, config = {}) {
    // Create timing system
    const timingSystem = new BlockAwareEvolutionTiming(config);
    
    // Store timing system in AlphaGnome
    alphaGnome.timingSystem = timingSystem;
    
    // Enhance evolve method with timing
    const originalEvolve = alphaGnome.evolve;
    
    alphaGnome.evolve = async function(chain = null) {
        // Start timing
        const timing = timingSystem.startEvolutionTiming(chain);
        
        try {
            // Call original evolve method
            const result = await originalEvolve.call(this);
            
            // End timing
            const timingResult = timingSystem.endEvolutionTiming(timing);
            
            // Add timing information to result
            result.timing = {
                durationMs: timingResult.duration,
                withinLimit: timingResult.withinLimit
            };
            
            return result;
        } catch (error) {
            // End timing even if there's an error
            timingSystem.endEvolutionTiming(timing);
            throw error;
        }
    };
    
    // Enhance _evolveChainPopulations method with timing
    if (alphaGnome._evolveChainPopulations) {
        const originalEvolveChainPopulations = alphaGnome._evolveChainPopulations;
        
        alphaGnome._evolveChainPopulations = async function() {
            const results = {};
            
            // For each chain, evolve with timing
            for (const chain of this.chainPopulations.keys()) {
                // Start timing for this chain
                const timing = timingSystem.startEvolutionTiming(chain);
                
                try {
                    // Get chain-specific population
                    const population = this.chainPopulations.get(chain);
                    if (!population || population.size === 0) continue;
                    
                    // Get chain-specific metrics
                    const metrics = this.metrics.chainMetrics.get(chain) || {
                        totalEvolutions: 0,
                        successfulMutations: 0,
                        fitnessImprovements: 0,
                        convergenceRate: 0,
                        diversityIndex: 1.0,
                        bestFitness: -Infinity,
                        averageFitness: 0
                    };
                    
                    // Store current best fitness
                    const previousBestFitness = metrics.bestFitness;
                    
                    // Selection - use tournament selection
                    const parents = [];
                    const tournamentSize = Math.min(this.config.tournamentSize, population.size);
                    const selectionCount = Math.floor(population.size * 0.5);
                    
                    for (let i = 0; i < selectionCount; i++) {
                        // Check if we should abort due to time constraints
                        if (timingSystem.shouldAbortEvolution(timing, chain)) {
                            console.log(`⚠️ Aborting evolution for ${chain} due to time constraints`);
                            results[chain] = { 
                                aborted: true,
                                reason: 'time_constraint',
                                timing: {
                                    durationMs: performance.now() - timing.startTime,
                                    maxAllowedMs: timingSystem.getMaxEvolutionTime(chain)
                                }
                            };
                            break;
                        }
                        
                        // Continue with selection
                        const tournament = [];
                        
                        // Select random individuals for tournament
                        const individuals = Array.from(population.values());
                        for (let j = 0; j < tournamentSize; j++) {
                            const randomIndex = Math.floor(Math.random() * individuals.length);
                            tournament.push(individuals[randomIndex]);
                        }
                        
                        // Select best individual from tournament
                        tournament.sort((a, b) => b.fitness - a.fitness);
                        parents.push(tournament[0]);
                    }
                    
                    // If we aborted during selection, continue to next chain
                    if (results[chain] && results[chain].aborted) {
                        continue;
                    }
                    
                    // Crossover and mutation
                    const offspring = [];
                    
                    for (let i = 0; i < parents.length; i += 2) {
                        // Check if we should abort due to time constraints
                        if (timingSystem.shouldAbortEvolution(timing, chain)) {
                            console.log(`⚠️ Aborting evolution for ${chain} due to time constraints`);
                            results[chain] = { 
                                aborted: true,
                                reason: 'time_constraint',
                                timing: {
                                    durationMs: performance.now() - timing.startTime,
                                    maxAllowedMs: timingSystem.getMaxEvolutionTime(chain)
                                }
                            };
                            break;
                        }
                        
                        if (i + 1 < parents.length) {
                            // Continue with crossover and mutation
                            // ... (rest of the crossover and mutation code)
                            
                            // Create two offspring from two parents
                            const parentA = parents[i];
                            const parentB = parents[i + 1];
                            
                            // Simple uniform crossover
                            const childA = {
                                id: `${chain}_${uuidv4()}`,
                                chain,
                                genotype: {},
                                fitness: 0,
                                age: 0,
                                mutations: [],
                                crossovers: [{
                                    generation: this.currentGeneration,
                                    parents: [parentA.id, parentB.id]
                                }],
                                rewards: [],
                                penalties: [],
                                createdAt: Date.now()
                            };
                            
                            const childB = {
                                id: `${chain}_${uuidv4()}`,
                                chain,
                                genotype: {},
                                fitness: 0,
                                age: 0,
                                mutations: [],
                                crossovers: [{
                                    generation: this.currentGeneration,
                                    parents: [parentB.id, parentA.id]
                                }],
                                rewards: [],
                                penalties: [],
                                createdAt: Date.now()
                            };
                            
                            // Deep copy genotype structure
                            childA.genotype = JSON.parse(JSON.stringify(parentA.genotype));
                            childB.genotype = JSON.parse(JSON.stringify(parentB.genotype));
                            
                            // Apply crossover
                            for (const category in parentA.genotype) {
                                for (const gene in parentA.genotype[category]) {
                                    // 50% chance to inherit from each parent
                                    if (Math.random() < 0.5) {
                                        childA.genotype[category][gene] = parentB.genotype[category][gene];
                                        childB.genotype[category][gene] = parentA.genotype[category][gene];
                                    }
                                }
                            }
                            
                            // Apply mutation
                            this._mutate(childA);
                            this._mutate(childB);
                            
                            offspring.push(childA, childB);
                        }
                    }
                    
                    // If we aborted during crossover, continue to next chain
                    if (results[chain] && results[chain].aborted) {
                        continue;
                    }
                    
                    // Evaluation - use chain-specific market conditions
                    const marketConditions = this._getMarketConditions(chain);
                    
                    for (const individual of offspring) {
                        // Check if we should abort due to time constraints
                        if (timingSystem.shouldAbortEvolution(timing, chain)) {
                            console.log(`⚠️ Aborting evolution for ${chain} due to time constraints`);
                            results[chain] = { 
                                aborted: true,
                                reason: 'time_constraint',
                                timing: {
                                    durationMs: performance.now() - timing.startTime,
                                    maxAllowedMs: timingSystem.getMaxEvolutionTime(chain)
                                }
                            };
                            break;
                        }
                        
                        // Evaluate fitness with chain-specific conditions
                        individual.fitness = await this._evaluateFitness(individual, { chain, marketConditions });
                    }
                    
                    // If we aborted during evaluation, continue to next chain
                    if (results[chain] && results[chain].aborted) {
                        continue;
                    }
                    
                    // Replacement - use elitism
                    const eliteCount = Math.min(this.config.eliteCount, population.size);
                    const elites = Array.from(population.values())
                        .sort((a, b) => b.fitness - a.fitness)
                        .slice(0, eliteCount);
                    
                    // Clear population
                    population.clear();
                    
                    // Add elites back to population
                    for (const elite of elites) {
                        elite.age++;
                        population.set(elite.id, elite);
                    }
                    
                    // Add offspring to population
                    for (const child of offspring) {
                        if (population.size < this.config.populationSize) {
                            population.set(child.id, child);
                        }
                    }
                    
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
                    
                    // Update chain metrics
                    this.metrics.chainMetrics.set(chain, metrics);
                    
                    // End timing
                    const timingResult = timingSystem.endEvolutionTiming(timing);
                    
                    // Store result
                    results[chain] = {
                        generation: metrics.totalEvolutions,
                        bestFitness: metrics.bestFitness,
                        averageFitness: metrics.averageFitness,
                        improvement: metrics.bestFitness - previousBestFitness,
                        timing: {
                            durationMs: timingResult.duration,
                            withinLimit: timingResult.withinLimit,
                            maxAllowedMs: timingSystem.getMaxEvolutionTime(chain)
                        }
                    };
                    
                    console.log(`✅ Chain ${chain} evolution complete: Best fitness: ${metrics.bestFitness.toFixed(4)}, Avg: ${metrics.averageFitness.toFixed(4)}, Time: ${timingResult.duration.toFixed(2)}ms`);
                } catch (error) {
                    console.error(`❌ Error evolving chain ${chain}:`, error);
                    
                    // End timing even if there's an error
                    const timingResult = timingSystem.endEvolutionTiming(timing);
                    
                    results[chain] = { 
                        error: error.message,
                        timing: {
                            durationMs: timingResult.duration,
                            withinLimit: timingResult.withinLimit,
                            maxAllowedMs: timingSystem.getMaxEvolutionTime(chain)
                        }
                    };
                }
            }
            
            return results;
        };
    }
    
    // Add method to get performance report
    alphaGnome.getEvolutionPerformanceReport = function() {
        return timingSystem.getPerformanceReport();
    };
    
    // Add method to estimate computational requirements
    alphaGnome.estimateEvolutionComputationalRequirements = function() {
        // Estimate genome size
        let genomeSize = 0;
        if (this.population.size > 0) {
            const individual = Array.from(this.population.values())[0];
            if (individual && individual.genotype) {
                // Count number of genes
                for (const category in individual.genotype) {
                    genomeSize += Object.keys(individual.genotype[category]).length;
                }
            }
        }
        
        // Default genome size if we couldn't determine it
        if (genomeSize === 0) {
            genomeSize = 20; // Typical genome size
        }
        
        return timingSystem.estimateComputationalRequirements(
            this.config.populationSize,
            genomeSize
        );
    };
    
    return timingSystem;
}

export default integrateTimingOptimization;
