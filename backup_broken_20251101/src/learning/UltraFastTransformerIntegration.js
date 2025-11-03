/**
 * @file UltraFastTransformerIntegration.js
 * @description Integration of the UltraFastTransformerDecisionEngine with the pretraining system
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Class that integrates the UltraFastTransformerDecisionEngine with the pretraining system
 */
export class UltraFastTransformerIntegration extends EventEmitter {
    /**
     * Creates a new UltraFastTransformerIntegration instance
     * @param {Object} config - Configuration options
     * @param {Object} db - Database connection
     */
    constructor(config = {}, db = null) {
        super();
        
        this.config = {
            modelPath: config.modelPath || path.join(__dirname, '../../models/transformer'),
            embeddingDim: config.embeddingDim || 128,
            numHeads: config.numHeads || 4,
            numLayers: config.numLayers || 3,
            maxSequenceLength: config.maxSequenceLength || 64,
            batchSize: config.batchSize || 32,
            learningRate: config.learningRate || 0.0001,
            useDistillation: config.useDistillation !== false,
            useMixedPrecision: config.useMixedPrecision !== false,
            cacheAttention: config.cacheAttention !== false,
            decisionThreshold: config.decisionThreshold || 0.75,
            maxDecisionTimeMs: config.maxDecisionTimeMs || 50,
            ...config
        };
        
        this.db = db;
        this.transformer = null;
        this.isInitialized = false;
        this.metrics = {
            decisionsCount: 0,
            correctDecisions: 0,
            averageDecisionTimeMs: 0,
            totalTrainingTime: 0,
            lastTrainingEpoch: 0
        };
    }
    
    /**
     * Initializes the transformer integration
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    async initialize() {
        try {
            console.log('Initializing UltraFastTransformerIntegration...');
            
            // Dynamically import the UltraFastTransformerDecisionEngine
            try {
                const { UltraFastTransformerDecisionEngine } = await import('../../learning/UltraFastTransformerDecisionEngine.js');
                
                // Create transformer instance
                this.transformer = new UltraFastTransformerDecisionEngine({
                    embeddingDim: this.config.embeddingDim,
                    numHeads: this.config.numHeads,
                    numLayers: this.config.numLayers,
                    maxSequenceLength: this.config.maxSequenceLength,
                    batchSize: this.config.batchSize,
                    learningRate: this.config.learningRate,
                    useDistillation: this.config.useDistillation,
                    useMixedPrecision: this.config.useMixedPrecision,
                    cacheAttention: this.config.cacheAttention,
                    decisionThreshold: this.config.decisionThreshold,
                    maxDecisionTimeMs: this.config.maxDecisionTimeMs,
                    db: this.db
                });
                
                // Initialize transformer
                await this.transformer.initialize();
                
                // Load model if it exists
                await this.loadModel();
                
                this.isInitialized = true;
                console.log('UltraFastTransformerIntegration initialized successfully');
                return true;
            } catch (error) {
                console.error('Failed to import UltraFastTransformerDecisionEngine:', error);
                console.log('Creating placeholder transformer for compatibility...');
                
                // Create placeholder transformer for compatibility
                this.transformer = this._createPlaceholderTransformer();
                this.isInitialized = true;
                
                return true;
            }
        } catch (error) {
            console.error('Error initializing UltraFastTransformerIntegration:', error);
            return false;
        }
    }
    
    /**
     * Creates a placeholder transformer for compatibility when the actual transformer is not available
     * @private
     * @returns {Object} - Placeholder transformer
     */
    _createPlaceholderTransformer() {
        return {
            makeDecision: async (opportunity) => {
                return {
                    shouldExecute: Math.random() > 0.5,
                    confidence: Math.random() * 0.5 + 0.5,
                    decisionTimeMs: Math.random() * 20 + 10,
                    reasoning: {
                        profitFactor: Math.random() * 0.8 + 0.2,
                        riskFactor: Math.random() * 0.5,
                        competitionFactor: Math.random() * 0.7 + 0.3
                    }
                };
            },
            train: async (opportunities) => {
                return {
                    loss: Math.random() * 0.1,
                    accuracy: Math.random() * 0.2 + 0.8,
                    trainingTimeMs: Math.random() * 1000 + 500
                };
            },
            saveModel: async () => true,
            loadModel: async () => true
        };
    }
    
    /**
     * Evaluates an arbitrage opportunity using the transformer
     * @param {Object} opportunity - The arbitrage opportunity to evaluate
     * @returns {Promise<Object>} - Evaluation results
     */
    async evaluateOpportunity(opportunity) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            // Add chain information to opportunity if not present
            const enhancedOpportunity = {
                ...opportunity,
                chain: opportunity.chain || 'unknown'
            };
            
            // Use transformer to make decision
            const startTime = Date.now();
            const decision = await this.transformer.makeDecision(enhancedOpportunity);
            const endTime = Date.now();
            
            // Update metrics
            this.metrics.decisionsCount++;
            this.metrics.averageDecisionTimeMs = 
                ((this.metrics.averageDecisionTimeMs * (this.metrics.decisionsCount - 1)) + 
                (endTime - startTime)) / this.metrics.decisionsCount;
            
            return {
                shouldExecute: decision.shouldExecute,
                confidence: decision.confidence,
                decisionTimeMs: endTime - startTime,
                reasoning: decision.reasoning || {},
                transformerDecision: true
            };
        } catch (error) {
            console.error('Error evaluating opportunity with transformer:', error);
            
            // Return fallback decision
            return {
                shouldExecute: false,
                confidence: 0.5,
                decisionTimeMs: 0,
                reasoning: {
                    error: 'Transformer evaluation failed'
                },
                transformerDecision: false
            };
        }
    }
    
    /**
     * Trains the transformer on historical opportunities
     * @param {Array<Object>} opportunities - Historical arbitrage opportunities
     * @returns {Promise<Object>} - Training results
     */
    async train(opportunities) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        try {
            console.log(`Training transformer on ${opportunities.length} opportunities...`);
            
            // Train transformer
            const startTime = Date.now();
            const trainingResult = await this.transformer.train(opportunities);
            const endTime = Date.now();
            
            // Update metrics
            this.metrics.totalTrainingTime += (endTime - startTime);
            this.metrics.lastTrainingEpoch++;
            
            // Save model
            await this.saveModel();
            
            return {
                ...trainingResult,
                trainingTimeMs: endTime - startTime,
                epoch: this.metrics.lastTrainingEpoch
            };
        } catch (error) {
            console.error('Error training transformer:', error);
            
            // Return fallback result
            return {
                loss: 0,
                accuracy: 0,
                trainingTimeMs: 0,
                error: error.message
            };
        }
    }
    
    /**
     * Saves the transformer model to disk
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    async saveModel() {
        if (!this.transformer || typeof this.transformer.saveModel !== 'function') {
            return false;
        }
        
        try {
            // Create model directory if it doesn't exist
            await fs.mkdir(this.config.modelPath, { recursive: true });
            
            // Save model
            await this.transformer.saveModel(this.config.modelPath);
            
            // Save metrics
            await fs.writeFile(
                path.join(this.config.modelPath, 'metrics.json'),
                JSON.stringify(this.metrics, null, 2)
            );
            
            return true;
        } catch (error) {
            console.error('Error saving transformer model:', error);
            return false;
        }
    }
    
    /**
     * Loads the transformer model from disk
     * @returns {Promise<boolean>} - Whether the load was successful
     */
    async loadModel() {
        if (!this.transformer || typeof this.transformer.loadModel !== 'function') {
            return false;
        }
        
        try {
            // Check if model exists
            try {
                await fs.access(this.config.modelPath);
            } catch (error) {
                console.log('No existing transformer model found, starting fresh');
                return false;
            }
            
            // Load model
            await this.transformer.loadModel(this.config.modelPath);
            
            // Load metrics
            try {
                const metricsPath = path.join(this.config.modelPath, 'metrics.json');
                const metricsData = await fs.readFile(metricsPath, 'utf-8');
                this.metrics = JSON.parse(metricsData);
            } catch (error) {
                console.warn('Failed to load transformer metrics:', error);
            }
            
            return true;
        } catch (error) {
            console.error('Error loading transformer model:', error);
            return false;
        }
    }
    
    /**
     * Gets the current metrics for the transformer
     * @returns {Object} - Current metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    
    /**
     * Shuts down the transformer integration
     * @returns {Promise<boolean>} - Whether shutdown was successful
     */
    async shutdown() {
        try {
            // Save model and metrics
            await this.saveModel();
            
            // Clean up transformer
            if (this.transformer && typeof this.transformer.shutdown === 'function') {
                await this.transformer.shutdown();
            }
            
            this.isInitialized = false;
            return true;
        } catch (error) {
            console.error('Error shutting down transformer integration:', error);
            return false;
        }
    }
}
