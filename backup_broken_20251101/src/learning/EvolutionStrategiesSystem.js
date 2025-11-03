/**
 * 🧬 EVOLUTION STRATEGIES SYSTEM - POPULATION-BASED OPTIMIZATION
 * ===========================================================
 * 
 * Implements Evolution Strategies (ES) for optimizing agent capabilities
 * Uses population-based search to evolve better construction analysis strategies
 * 
 * Key features:
 * - Natural Evolution Strategies (NES)
 * - CMA-ES (Covariance Matrix Adaptation)
 * - Multi-objective optimization
 * - Agent capability evolution
 * - Fitness based on analysis performance
 */

import { EventEmitter } from 'events';
import { Matrix } from 'ml-matrix';

// Helper: Generate random normal distribution (Box-Muller transform)
function randomNormal(mean = 0, stdDev = 1) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z0 * stdDev;
}

export class EvolutionStrategiesSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Population parameters
            populationSize: config.populationSize || 50,
            eliteSize: config.eliteSize || 10,
            offspringSize: config.offspringSize || 100,
            
            // Evolution parameters
            mutationStrength: config.mutationStrength || 0.1,
            learningRate: config.learningRate || 0.01,
            adaptationRate: config.adaptationRate || 0.05,
            
            // CMA-ES parameters
            useCMAES: config.useCMAES !== false,
            covarianceAdaptation: config.covarianceAdaptation || 0.1,
            evolutionPath: config.evolutionPath || 0.95,
            
            // Multi-objective optimization
            objectives: config.objectives || [
                'analysisAccuracy',
                'processingSpeed',
                'complianceRate',
                'errorDetection',
                'costEfficiency'
            ],
            
            // Agent genome configuration
            genomeSize: config.genomeSize || 100,
            genomeStructure: config.genomeStructure || {
                neuralWeights: 50,
                hyperparameters: 20,
                strategies: 15,
                thresholds: 15
            },
            
            // Construction-specific fitness
            fitnessWeights: config.fitnessWeights || {
                accuracy: 0.3,
                speed: 0.2,
                compliance: 0.25,
                errorRate: 0.15,
                cost: 0.1
            },
            
            // Convergence criteria
            maxGenerations: config.maxGenerations || 1000,
            targetFitness: config.targetFitness || 0.95,
            stagnationLimit: config.stagnationLimit || 50,
            
            ...config
        };
        
        // Population management
        this.population = [];
        this.generation = 0;
        this.bestIndividual = null;
        this.bestFitness = -Infinity;
        
        // CMA-ES state
        this.mean = null;
        this.covarianceMatrix = null;
        this.evolutionPaths = {
            sigma: null,
            c: null
        };
        this.stepSize = this.config.mutationStrength;
        
        // Performance tracking
        this.history = {
            fitness: [],
            diversity: [],
            improvements: []
        };
        
        this.metrics = {
            generationsEvolved: 0,
            totalEvaluations: 0,
            improvementRate: 0,
            populationDiversity: 0,
            convergenceSpeed: 0
        };
    }
    
    /**
     * 🚀 INITIALIZE EVOLUTION SYSTEM
     */
    async initialize() {
        console.log('🧬 Initializing Evolution Strategies System...');
        
        // Initialize population
        await this.initializePopulation();
        
        // Initialize CMA-ES if enabled
        if (this.config.useCMAES) {
            await this.initializeCMAES();
        }
        
        // Evaluate initial population
        await this.evaluatePopulation();
        
        console.log(`✅ ES System initialized with ${this.population.length} individuals`);
    }
    
    /**
     * 👥 INITIALIZE POPULATION
     */
    async initializePopulation() {
        console.log('   👥 Creating initial population...');
        
        for (let i = 0; i < this.config.populationSize; i++) {
            const individual = this.createIndividual();
            this.population.push(individual);
        }
        
        console.log(`   ✅ Created ${this.population.length} individuals`);
    }
    
    /**
     * 🧬 CREATE INDIVIDUAL
     */
    createIndividual() {
        const genome = new Float32Array(this.config.genomeSize);
        
        // Initialize with random values
        for (let i = 0; i < genome.length; i++) {
            genome[i] = this.randomGaussian(0, 1);
        }
        
        return {
            id: `ind_${this.generation}_${Math.random().toString(36).substr(2, 9)}`,
            genome: genome,
            fitness: null,
            objectives: {},
            age: 0,
            parents: [],
            metadata: {
                neuralArchitecture: this.decodeNeuralArchitecture(genome),
                hyperparameters: this.decodeHyperparameters(genome),
                strategies: this.decodeStrategies(genome)
            }
        };
    }
    
    /**
     * 🧮 INITIALIZE CMA-ES
     */
    async initializeCMAES() {
        console.log('   🧮 Initializing CMA-ES...');
        
        const n = this.config.genomeSize;
        
        // Initialize mean
        this.mean = new Float32Array(n);
        
        // Initialize covariance matrix (identity)
        this.covarianceMatrix = Matrix.eye(n, n);
        
        // Initialize evolution paths
        this.evolutionPaths = {
            sigma: new Float32Array(n),
            c: new Float32Array(n)
        };
        
        // CMA-ES constants
        this.cmaConstants = this.calculateCMAConstants(n);
        
        console.log('   ✅ CMA-ES initialized');
    }
    
    /**
     * 📊 CALCULATE CMA CONSTANTS
     */
    calculateCMAConstants(n) {
        const mueff = this.config.eliteSize;
        
        return {
            cc: 4 / (n + 4),
            cs: (mueff + 2) / (n + mueff + 3),
            c1: 2 / ((n + 1.3) ** 2 + mueff),
            cmu: Math.min(1 - this.c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) ** 2 + mueff)),
            damps: 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (n + 1)) - 1) + this.cs,
            chiN: Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n ** 2))
        };
    }
    
    /**
     * 🔄 EVOLVE GENERATION
     */
    async evolveGeneration() {
        console.log(`\n🔄 Evolving generation ${this.generation + 1}...`);
        
        // Sort population by fitness
        this.sortPopulation();
        
        // Update best individual
        this.updateBestIndividual();
        
        // Generate offspring
        const offspring = await this.generateOffspring();
        
        // Evaluate offspring
        await this.evaluateIndividuals(offspring);
        
        // Select next generation
        this.selectNextGeneration(offspring);
        
        // Update CMA-ES if enabled
        if (this.config.useCMAES) {
            await this.updateCMAES();
        }
        
        // Update metrics
        this.updateMetrics();
        
        // Increment generation
        this.generation++;
        
        console.log(`✅ Generation ${this.generation} complete. Best fitness: ${this.bestFitness.toFixed(4)}`);
        
        return {
            generation: this.generation,
            bestFitness: this.bestFitness,
            averageFitness: this.calculateAverageFitness(),
            diversity: this.calculateDiversity()
        };
    }
    
    /**
     * 👶 GENERATE OFFSPRING
     */
    async generateOffspring() {
        const offspring = [];
        
        if (this.config.useCMAES) {
            // CMA-ES offspring generation
            for (let i = 0; i < this.config.offspringSize; i++) {
                const child = await this.generateCMAESOffspring();
                offspring.push(child);
            }
        } else {
            // Standard ES offspring generation
            for (let i = 0; i < this.config.offspringSize; i++) {
                const parents = this.selectParents();
                const child = await this.crossoverAndMutate(parents);
                offspring.push(child);
            }
        }
        
        return offspring;
    }
    
    /**
     * 🧬 GENERATE CMA-ES OFFSPRING
     */
    async generateCMAESOffspring() {
        // Sample from multivariate normal distribution
        const z = new Float32Array(this.config.genomeSize);
        for (let i = 0; i < z.length; i++) {
            z[i] = this.randomGaussian(0, 1);
        }
        
        // Transform using covariance matrix
        const genome = this.transformByCovarianceMatrix(z);
        
        // Add to mean
        for (let i = 0; i < genome.length; i++) {
            genome[i] = this.mean[i] + this.stepSize * genome[i];
        }
        
        // Create individual
        const individual = {
            id: `ind_${this.generation}_${Math.random().toString(36).substr(2, 9)}`,
            genome: genome,
            fitness: null,
            objectives: {},
            age: 0,
            parents: ['cma-es'],
            z: z, // Store for CMA-ES update
            metadata: {
                neuralArchitecture: this.decodeNeuralArchitecture(genome),
                hyperparameters: this.decodeHyperparameters(genome),
                strategies: this.decodeStrategies(genome)
            }
        };
        
        return individual;
    }
    
    /**
     * 🔀 CROSSOVER AND MUTATE
     */
    async crossoverAndMutate(parents) {
        const [parent1, parent2] = parents;
        const genome = new Float32Array(this.config.genomeSize);
        
        // Crossover
        for (let i = 0; i < genome.length; i++) {
            // Uniform crossover
            if (Math.random() < 0.5) {
                genome[i] = parent1.genome[i];
            } else {
                genome[i] = parent2.genome[i];
            }
            
            // Mutation
            if (Math.random() < 0.1) {
                genome[i] += this.randomGaussian(0, this.config.mutationStrength);
            }
        }
        
        // Create offspring
        return {
            id: `ind_${this.generation}_${Math.random().toString(36).substr(2, 9)}`,
            genome: genome,
            fitness: null,
            objectives: {},
            age: 0,
            parents: [parent1.id, parent2.id],
            metadata: {
                neuralArchitecture: this.decodeNeuralArchitecture(genome),
                hyperparameters: this.decodeHyperparameters(genome),
                strategies: this.decodeStrategies(genome)
            }
        };
    }
    
    /**
     * 🎯 EVALUATE INDIVIDUALS
     */
    async evaluateIndividuals(individuals) {
        console.log(`   🎯 Evaluating ${individuals.length} individuals...`);
        
        const evaluationPromises = individuals.map(ind => this.evaluateFitness(ind));
        await Promise.all(evaluationPromises);
        
        this.metrics.totalEvaluations += individuals.length;
    }
    
    /**
     * 💪 EVALUATE FITNESS
     */
    async evaluateFitness(individual) {
        // Simulate construction analysis with individual's genome
        const performance = await this.simulateConstructionAnalysis(individual);
        
        // Calculate multi-objective fitness
        individual.objectives = {
            accuracy: performance.accuracy,
            speed: 1 / (performance.processingTime / 1000), // Convert to speed
            compliance: performance.complianceRate,
            errorRate: 1 - performance.errorRate, // Invert for maximization
            cost: 1 / (performance.cost + 1) // Invert and normalize
        };
        
        // Calculate weighted fitness
        individual.fitness = 0;
        for (const [objective, value] of Object.entries(individual.objectives)) {
            const weight = this.config.fitnessWeights[objective] || 0;
            individual.fitness += weight * value;
        }
        
        return individual.fitness;
    }
    
    /**
     * 🏗️ SIMULATE CONSTRUCTION ANALYSIS
     */
    async simulateConstructionAnalysis(individual) {
        // Decode agent configuration from genome
        const config = individual.metadata;
        
        // Simulate analysis performance
        const basePerformance = {
            accuracy: 0.7,
            processingTime: 1000,
            complianceRate: 0.8,
            errorRate: 0.1,
            cost: 1.0
        };
        
        // Apply genome-based modifications
        const performance = {
            accuracy: Math.min(0.99, basePerformance.accuracy + 
                     config.neuralArchitecture.depth * 0.02 +
                     config.hyperparameters.learningRate * 0.1),
            
            processingTime: Math.max(100, basePerformance.processingTime - 
                           config.strategies.parallelization * 100),
            
            complianceRate: Math.min(0.99, basePerformance.complianceRate + 
                           config.strategies.complianceWeight * 0.15),
            
            errorRate: Math.max(0.01, basePerformance.errorRate - 
                      config.neuralArchitecture.validationLayers * 0.02),
            
            cost: Math.max(0.1, basePerformance.cost - 
                 config.strategies.efficiency * 0.2)
        };
        
        // Add noise to simulate real-world variance
        for (const key in performance) {
            performance[key] += this.randomGaussian(0, 0.02);
            performance[key] = Math.max(0, Math.min(1, performance[key]));
        }
        
        return performance;
    }
    
    /**
     * 👆 UPDATE CMA-ES
     */
    async updateCMAES() {
        // Sort population by fitness
        const sorted = [...this.population].sort((a, b) => b.fitness - a.fitness);
        const elite = sorted.slice(0, this.config.eliteSize);
        
        // Calculate weighted mean
        const weights = this.calculateSelectionWeights(elite.length);
        const newMean = new Float32Array(this.config.genomeSize);
        
        for (let i = 0; i < elite.length; i++) {
            for (let j = 0; j < this.config.genomeSize; j++) {
                newMean[j] += weights[i] * elite[i].genome[j];
            }
        }
        
        // Update evolution paths
        this.updateEvolutionPaths(newMean);
        
        // Update covariance matrix
        this.updateCovarianceMatrix(elite, weights, newMean);
        
        // Update step size
        this.updateStepSize();
        
        // Set new mean
        this.mean = newMean;
    }
    
    /**
     * 📈 UPDATE EVOLUTION PATHS
     */
    updateEvolutionPaths(newMean) {
        const c = this.cmaConstants;
        
        // Update sigma evolution path
        for (let i = 0; i < this.evolutionPaths.sigma.length; i++) {
            this.evolutionPaths.sigma[i] = (1 - c.cs) * this.evolutionPaths.sigma[i] +
                Math.sqrt(c.cs * (2 - c.cs)) * (newMean[i] - this.mean[i]) / this.stepSize;
        }
        
        // Update c evolution path
        const hsig = this.calculateHsig();
        for (let i = 0; i < this.evolutionPaths.c.length; i++) {
            this.evolutionPaths.c[i] = (1 - c.cc) * this.evolutionPaths.c[i] +
                hsig * Math.sqrt(c.cc * (2 - c.cc)) * (newMean[i] - this.mean[i]) / this.stepSize;
        }
    }
    
    /**
     * 🎲 UPDATE COVARIANCE MATRIX
     */
    updateCovarianceMatrix(elite, weights, newMean) {
        const c = this.cmaConstants;
        const n = this.config.genomeSize;
        
        // Rank-one update
        const rankOne = Matrix.zeros(n, n);
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                rankOne.set(i, j, this.evolutionPaths.c[i] * this.evolutionPaths.c[j]);
            }
        }
        
        // Rank-mu update
        const rankMu = Matrix.zeros(n, n);
        for (let k = 0; k < elite.length; k++) {
            const diff = elite[k].genome.map((g, i) => g - this.mean[i]);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    rankMu.set(i, j, rankMu.get(i, j) + weights[k] * diff[i] * diff[j]);
                }
            }
        }
        
        // Update covariance matrix
        const oldC = this.covarianceMatrix;
        this.covarianceMatrix = oldC.mul(1 - c.c1 - c.cmu)
            .add(rankOne.mul(c.c1))
            .add(rankMu.mul(c.cmu / (this.stepSize ** 2)));
    }
    
    /**
     * 📏 UPDATE STEP SIZE
     */
    updateStepSize() {
        const c = this.cmaConstants;
        const psNorm = Math.sqrt(
            this.evolutionPaths.sigma.reduce((sum, x) => sum + x * x, 0)
        );
        
        this.stepSize *= Math.exp(
            (c.cs / c.damps) * (psNorm / c.chiN - 1)
        );
        
        // Bound step size
        this.stepSize = Math.max(1e-10, Math.min(1, this.stepSize));
    }
    
    /**
     * 🎯 SELECT PARENTS
     */
    selectParents() {
        // Tournament selection
        const tournamentSize = 3;
        const parents = [];
        
        for (let i = 0; i < 2; i++) {
            let best = null;
            
            for (let j = 0; j < tournamentSize; j++) {
                const candidate = this.population[
                    Math.floor(Math.random() * this.population.length)
                ];
                
                if (!best || candidate.fitness > best.fitness) {
                    best = candidate;
                }
            }
            
            parents.push(best);
        }
        
        return parents;
    }
    
    /**
     * 🏆 SELECT NEXT GENERATION
     */
    selectNextGeneration(offspring) {
        // Combine population and offspring
        const combined = [...this.population, ...offspring];
        
        // Sort by fitness
        combined.sort((a, b) => b.fitness - a.fitness);
        
        // Select top individuals
        this.population = combined.slice(0, this.config.populationSize);
        
        // Age individuals
        this.population.forEach(ind => ind.age++);
    }
    
    /**
     * 🧬 DECODE GENOME SECTIONS
     */
    
    decodeNeuralArchitecture(genome) {
        const start = 0;
        const size = this.config.genomeStructure.neuralWeights;
        const section = genome.slice(start, start + size);
        
        return {
            depth: Math.floor(Math.abs(section[0]) * 5 + 1),
            width: Math.floor(Math.abs(section[1]) * 100 + 10),
            activationFunction: this.selectActivation(section[2]),
            dropoutRate: Math.abs(section[3]) % 0.5,
            validationLayers: Math.floor(Math.abs(section[4]) * 3 + 1)
        };
    }
    
    decodeHyperparameters(genome) {
        const start = this.config.genomeStructure.neuralWeights;
        const size = this.config.genomeStructure.hyperparameters;
        const section = genome.slice(start, start + size);
        
        return {
            learningRate: Math.abs(section[0]) * 0.01,
            batchSize: Math.floor(Math.abs(section[1]) * 64 + 16),
            momentum: Math.abs(section[2]) % 1,
            weightDecay: Math.abs(section[3]) * 0.001,
            patience: Math.floor(Math.abs(section[4]) * 20 + 5)
        };
    }
    
    decodeStrategies(genome) {
        const start = this.config.genomeStructure.neuralWeights + 
                     this.config.genomeStructure.hyperparameters;
        const size = this.config.genomeStructure.strategies;
        const section = genome.slice(start, start + size);
        
        return {
            parallelization: Math.abs(section[0]) % 1,
            caching: Math.abs(section[1]) % 1,
            complianceWeight: Math.abs(section[2]) % 1,
            errorSensitivity: Math.abs(section[3]) % 1,
            efficiency: Math.abs(section[4]) % 1
        };
    }
    
    /**
     * 🚀 RUN EVOLUTION
     */
    async runEvolution(targetGenerations = null) {
        const maxGen = targetGenerations || this.config.maxGenerations;
        let stagnationCount = 0;
        let previousBest = this.bestFitness;
        
        console.log(`🚀 Starting evolution for ${maxGen} generations...`);
        
        while (this.generation < maxGen) {
            // Evolve one generation
            const result = await this.evolveGeneration();
            
            // Check for improvement
            if (this.bestFitness > previousBest) {
                stagnationCount = 0;
                previousBest = this.bestFitness;
            } else {
                stagnationCount++;
            }
            
            // Check convergence criteria
            if (this.bestFitness >= this.config.targetFitness) {
                console.log(`🎯 Target fitness ${this.config.targetFitness} reached!`);
                break;
            }
            
            if (stagnationCount >= this.config.stagnationLimit) {
                console.log(`⚠️ Evolution stagnated for ${stagnationCount} generations`);
                break;
            }
            
            // Progress update
            if (this.generation % 10 === 0) {
                console.log(`📊 Generation ${this.generation}: Best=${this.bestFitness.toFixed(4)}, Avg=${result.averageFitness.toFixed(4)}, Diversity=${result.diversity.toFixed(4)}`);
            }
        }
        
        console.log(`✅ Evolution completed after ${this.generation} generations`);
        console.log(`🏆 Best fitness achieved: ${this.bestFitness.toFixed(4)}`);
        
        return {
            generations: this.generation,
            bestIndividual: this.bestIndividual,
            bestFitness: this.bestFitness,
            finalPopulation: this.population,
            history: this.history
        };
    }
    
    /**
     * 📊 METRICS AND ANALYSIS
     */
    
    sortPopulation() {
        this.population.sort((a, b) => b.fitness - a.fitness);
    }
    
    updateBestIndividual() {
        if (this.population[0].fitness > this.bestFitness) {
            this.bestFitness = this.population[0].fitness;
            this.bestIndividual = JSON.parse(JSON.stringify(this.population[0]));
            this.history.improvements.push({
                generation: this.generation,
                fitness: this.bestFitness,
                individual: this.bestIndividual.id
            });
        }
    }
    
    calculateAverageFitness() {
        const sum = this.population.reduce((acc, ind) => acc + ind.fitness, 0);
        return sum / this.population.length;
    }
    
    calculateDiversity() {
        let diversity = 0;
        const n = this.population.length;
        
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                diversity += this.calculateGenomeDistance(
                    this.population[i].genome,
                    this.population[j].genome
                );
            }
        }
        
        return diversity / (n * (n - 1) / 2);
    }
    
    calculateGenomeDistance(genome1, genome2) {
        let distance = 0;
        
        for (let i = 0; i < genome1.length; i++) {
            distance += (genome1[i] - genome2[i]) ** 2;
        }
        
        return Math.sqrt(distance);
    }
    
    updateMetrics() {
        this.metrics.generationsEvolved = this.generation;
        
        const avgFitness = this.calculateAverageFitness();
        this.history.fitness.push({
            generation: this.generation,
            best: this.bestFitness,
            average: avgFitness,
            worst: this.population[this.population.length - 1].fitness
        });
        
        const diversity = this.calculateDiversity();
        this.history.diversity.push({
            generation: this.generation,
            value: diversity
        });
        
        this.metrics.populationDiversity = diversity;
        
        // Calculate improvement rate
        if (this.history.improvements.length > 1) {
            const recent = this.history.improvements.slice(-10);
            const improvements = recent.length - 1;
            const generations = recent[recent.length - 1].generation - recent[0].generation;
            this.metrics.improvementRate = improvements / generations;
        }
    }
    
    /**
     * 🧬 EXTRACT BEST AGENT CONFIG
     */
    extractBestAgentConfig() {
        if (!this.bestIndividual) return null;
        
        return {
            id: this.bestIndividual.id,
            fitness: this.bestIndividual.fitness,
            objectives: this.bestIndividual.objectives,
            neuralArchitecture: this.bestIndividual.metadata.neuralArchitecture,
            hyperparameters: this.bestIndividual.metadata.hyperparameters,
            strategies: this.bestIndividual.metadata.strategies,
            genome: Array.from(this.bestIndividual.genome)
        };
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    
    randomGaussian(mean = 0, std = 1) {
        // Box-Muller transform
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * std + mean;
    }
    
    transformByCovarianceMatrix(z) {
        // Simplified transformation (would use Cholesky decomposition in production)
        const result = new Float32Array(z.length);
        
        for (let i = 0; i < z.length; i++) {
            result[i] = z[i];
            for (let j = 0; j < i; j++) {
                result[i] += this.covarianceMatrix.get(i, j) * z[j] * 0.1;
            }
        }
        
        return result;
    }
    
    calculateSelectionWeights(mu) {
        const weights = new Float32Array(mu);
        
        for (let i = 0; i < mu; i++) {
            weights[i] = Math.log(mu + 0.5) - Math.log(i + 1);
        }
        
        // Normalize
        const sum = weights.reduce((a, b) => a + b);
        for (let i = 0; i < mu; i++) {
            weights[i] /= sum;
        }
        
        return weights;
    }
    
    calculateHsig() {
        const c = this.cmaConstants;
        const psNorm = Math.sqrt(
            this.evolutionPaths.sigma.reduce((sum, x) => sum + x * x, 0)
        );
        
        const threshold = (1.4 + 2 / (this.config.genomeSize + 1)) * c.chiN;
        return psNorm < threshold ? 1 : 0;
    }
    
    selectActivation(value) {
        const activations = ['relu', 'tanh', 'sigmoid', 'elu', 'selu'];
        const index = Math.floor(Math.abs(value) * activations.length) % activations.length;
        return activations[index];
    }
    
    /**
     * 💾 SAVE/LOAD POPULATION
     */
    
    savePopulation(filepath) {
        const data = {
            generation: this.generation,
            population: this.population,
            bestIndividual: this.bestIndividual,
            bestFitness: this.bestFitness,
            history: this.history,
            metrics: this.metrics,
            config: this.config,
            timestamp: Date.now()
        };
        
        console.log(`💾 Saved ES population to ${filepath}`);
        return data;
    }
    
    loadPopulation(data) {
        this.generation = data.generation;
        this.population = data.population;
        this.bestIndividual = data.bestIndividual;
        this.bestFitness = data.bestFitness;
        this.history = data.history;
        this.metrics = data.metrics;
        
        console.log(`📂 Loaded ES population from generation ${this.generation}`);
    }
    
    /**
     * 📊 GET METRICS
     */
    getMetrics() {
        return {
            ...this.metrics,
            currentGeneration: this.generation,
            bestFitness: this.bestFitness,
            populationSize: this.population.length,
            convergenceRate: this.calculateConvergenceRate()
        };
    }
    
    calculateConvergenceRate() {
        if (this.history.fitness.length < 10) return 0;
        
        const recent = this.history.fitness.slice(-10);
        const improvements = recent.filter((f, i) => 
            i > 0 && f.best > recent[i - 1].best
        ).length;
        
        return improvements / recent.length;
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('🛑 Shutting down Evolution Strategies System...');
        
        // Save final population
        this.savePopulation('es_population.json');
        
        this.removeAllListeners();
        console.log('✅ Evolution Strategies System shutdown complete');
    }
    
    /**
     * 📊 EVALUATE POPULATION
     */
    async evaluatePopulation() {
        await this.evaluateIndividuals(this.population);
    }
}

// Singleton instance
let instance = null;

export function getEvolutionStrategiesSystem(config = {}) {
    if (!instance) {
        instance = new EvolutionStrategiesSystem(config);
    }
    return instance;
}

export default EvolutionStrategiesSystem;
