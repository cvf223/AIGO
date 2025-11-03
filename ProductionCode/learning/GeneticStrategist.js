/**
 * 🧠 Genetic Strategist - The Brain of Evolution
 * ===============================================
 *
 * This module replaces random chance with intelligent design in the evolutionary
 * process. It analyzes the genetic makeup of the best-performing agents ("elites")
 * and consults with the StrategicCognitiveOrchestrator to form a data-driven
 * hypothesis about which genetic modifications will lead to superior performance.
 */

export class GeneticStrategist {
    constructor(dependencies) {
        this.cognitiveOrchestrator = dependencies.cognitiveOrchestrator;
        this.contextEngine = dependencies.contextEngine; // Inject the ContextEngine
    }

    /**
     * Analyzes the elite agents and devises an intelligent mutation strategy.
     * @param {Array<object>} elites - The best-performing individuals from the last generation.
     * @returns {Promise<object>} A targeted mutation strategy.
     */
    async deviseMutationStrategy(elites) {
        // 1. Analyze the genetic commonalities and differences of the elites.
        const geneticAnalysis = this._analyzeEliteGenotypes(elites);

        // 2. Build a rich, context-aware prompt using the ContextEngine.
        const context = await this.contextEngine.buildContext({
            task: 'genetic_mutation_strategy',
            details: {
                geneticAnalysis,
                objective: "Devise a single, high-impact mutation to correct the most significant weakness without compromising strengths. Consider the trade-offs and provide a concise, expert-level justification.",
                outputFormat: {
                    geneToMutate: "string",
                    mutationDirection: "increase | decrease",
                    reasoning: "string"
                }
            }
        });

        // 3. Consult the "Meta-Brain" (StrategicCognitiveOrchestrator).
        const recommendation = await this.cognitiveOrchestrator.solve(context);

        // 4. Parse the LLM's recommendation into a concrete mutation plan.
        const mutationPlan = this._parseLLMRecommendation(recommendation);

        return mutationPlan;
    }

    /**
     * Performs a statistical analysis of elite genotypes to find performance drivers.
     * This is a production-grade implementation, replacing the previous placeholder.
     * @param {Array<object>} elites - The best-performing individuals.
     * @returns {object} A detailed analysis of the elite gene pool.
     */
    _analyzeEliteGenotypes(elites) {
        if (!elites || elites.length === 0) {
            return {
                strongestTraits: [],
                weakestTraits: [],
                correlations: {},
                geneAverages: {},
                geneVariance: {}
            };
        }

        const allGenes = {};
        elites.forEach(elite => {
            const flatGenotype = { ...elite.genotype.strategy, ...elite.genotype.execution, ...elite.genotype.decision };
            for (const [gene, value] of Object.entries(flatGenotype)) {
                if (!allGenes[gene]) {
                    allGenes[gene] = [];
                }
                allGenes[gene].push({ value, fitness: elite.fitness });
            }
        });

        const geneAverages = {};
        const geneVariance = {};
        const correlations = {};

        for (const [gene, values] of Object.entries(allGenes)) {
            const numericValues = values.map(v => v.value);
            const fitnessValues = values.map(v => v.fitness);

            // Calculate Averages and Variance
            const mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
            geneAverages[gene] = mean;
            geneVariance[gene] = numericValues.map(v => (v - mean) ** 2).reduce((a, b) => a + b, 0) / numericValues.length;

            // Calculate Pearson Correlation between gene value and fitness
            correlations[gene] = this._calculatePearsonCorrelation(numericValues, fitnessValues);
        }

        const sortedCorrelations = Object.entries(correlations).sort(([, a], [, b]) => b - a);
        
        return {
            strongestTraits: sortedCorrelations.slice(0, 3).map(([gene, corr]) => ({ gene, correlation: corr })),
            weakestTraits: sortedCorrelations.slice(-3).map(([gene, corr]) => ({ gene, correlation: corr })),
            correlations,
            geneAverages,
            geneVariance
        };
    }

    /**
     * Calculates the Pearson correlation coefficient between two arrays of numbers.
     * @param {Array<number>} x - The first array (gene values).
     * @param {Array<number>} y - The second array (fitness values).
     * @returns {number} The correlation coefficient.
     */
    _calculatePearsonCorrelation(x, y) {
        const n = x.length;
        if (n === 0) return 0;

        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
            numerator += (x[i] - meanX) * (y[i] - meanY);
            denomX += (x[i] - meanX) ** 2;
            denomY += (y[i] - meanY) ** 2;
        }

        if (denomX === 0 || denomY === 0) return 0;

        return numerator / (Math.sqrt(denomX) * Math.sqrt(denomY));
    }

    /**
     * Parses the unstructured text from the LLM into a structured plan.
     */
    _parseLLMRecommendation(recommendation) {
        try {
            // A robust implementation would have better error handling and validation.
            return JSON.parse(recommendation);
        } catch (error) {
            console.error("Failed to parse LLM recommendation:", error);
            // Fallback to a safe, default mutation.
            return {
                geneToMutate: 'riskTolerance',
                mutationDirection: 'decrease'
            };
        }
    }
}
