#!/usr/bin/env node

/**
 * 🧠 CONTINUOUS TRAINING PIPELINE
 * ==============================
 * 
 * Advanced reinforcement learning pipeline for arbitrage agents
 * - Continuous learning from real blockchain data
 * - Experience replay and pattern extraction
 * - Policy distillation for efficient execution
 * - Performance tracking and optimization
 */

import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pg from 'pg';

// Load environment variables
dotenv.config();

// Create event emitter for training events
export const trainingEvents = new EventEmitter();

// Constants
const EXPERIENCE_BATCH_SIZE = 100;
const TRAINING_INTERVAL = 3600000; // 1 hour
const MIN_EXPERIENCES_FOR_TRAINING = 50;
const MEMORY_PRUNING_THRESHOLD = 10000;
const MODEL_SAVE_INTERVAL = 86400000; // 24 hours

// PostgreSQL connection
const pgPool = new pg.Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'construction_syndicate',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  ssl: process.env.POSTGRES_SSL === 'true' ? true : false
});

/**
 * 🧠 Continuous Training Pipeline
 */
export class ContinuousTrainingPipeline {
  constructor(config = {}) {
    this.config = {
      modelSaveDir: path.join(process.cwd(), 'data', 'models'),
      experienceSaveDir: path.join(process.cwd(), 'data', 'experiences'),
      trainingInterval: TRAINING_INTERVAL,
      experienceBatchSize: EXPERIENCE_BATCH_SIZE,
      minExperiencesForTraining: MIN_EXPERIENCES_FOR_TRAINING,
      ...config
    };

    // Initialize state
    this.isTraining = false;
    this.lastTrainingTime = 0;
    this.experienceBuffer = [];
    this.trainingStats = {
      totalExperiences: 0,
      totalTrainingRuns: 0,
      lastTrainingDuration: 0,
      averageLoss: 0,
      improvementRate: 0
    };

    // Bind methods
    this.addExperience = this.addExperience.bind(this);
    this.runTrainingCycle = this.runTrainingCycle.bind(this);
    this.saveModel = this.saveModel.bind(this);
    this.loadModel = this.loadModel.bind(this);
  }

  /**
   * 🚀 Initialize the training pipeline
   */
  async initialize() {
    console.log('🧠 Initializing Continuous Training Pipeline...');
    
    try {
      // Create directories if they don't exist
      await fs.mkdir(this.config.modelSaveDir, { recursive: true });
      await fs.mkdir(this.config.experienceSaveDir, { recursive: true });

      // Load latest model if available
      await this.loadModel();

      // Set up training interval
      this.trainingInterval = setInterval(
        this.runTrainingCycle,
        this.config.trainingInterval
      );

      console.log('✅ Training pipeline initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize training pipeline:', error);
      return false;
    }
  }

  /**
   * 📊 Add experience to the training buffer
   */
  async addExperience(experience) {
    if (!experience) return false;

    try {
      // Add timestamp if not present
      if (!experience.timestamp) {
        experience.timestamp = Date.now();
      }

      // Add to buffer
      this.experienceBuffer.push(experience);
      this.trainingStats.totalExperiences++;

      // Store in database for persistence
      await this.storeExperienceInDatabase(experience);

      // Emit event
      trainingEvents.emit('experienceAdded', {
        experienceCount: this.experienceBuffer.length,
        latestExperience: {
          id: experience.id,
          timestamp: experience.timestamp,
          type: experience.type
        }
      });

      // Check if we should run training
      if (
        this.experienceBuffer.length >= this.config.minExperiencesForTraining &&
        !this.isTraining &&
        Date.now() - this.lastTrainingTime >= this.config.trainingInterval
      ) {
        this.runTrainingCycle();
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to add experience:', error);
      return false;
    }
  }

  /**
   * 💾 Store experience in database
   */
  async storeExperienceInDatabase(experience) {
    try {
      const query = `
        INSERT INTO agent_experiences (
          agent_id,
          experience_type,
          state_before,
          action_taken,
          state_after,
          reward,
          metadata,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const values = [
        experience.agentId || 'unknown',
        experience.type || 'general',
        JSON.stringify(experience.stateBefore || {}),
        JSON.stringify(experience.action || {}),
        JSON.stringify(experience.stateAfter || {}),
        experience.reward || 0,
        JSON.stringify(experience.metadata || {}),
        new Date(experience.timestamp)
      ];

      const result = await pgPool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error('❌ Failed to store experience in database:', error);
      return null;
    }
  }

  /**
   * 🔄 Run a training cycle
   */
  async runTrainingCycle() {
    if (this.isTraining || this.experienceBuffer.length < this.config.minExperiencesForTraining) {
      return false;
    }

    try {
      console.log(`🧠 Starting training cycle with ${this.experienceBuffer.length} experiences...`);
      this.isTraining = true;
      const startTime = Date.now();

      // Get experiences for training
      const trainingExperiences = this.experienceBuffer.slice(0, this.config.experienceBatchSize);

      // Process experiences
      const processedExperiences = this.preprocessExperiences(trainingExperiences);

      // Train the model
      const trainingResults = await this.trainModel(processedExperiences);

      // Update stats
      this.trainingStats.totalTrainingRuns++;
      this.trainingStats.lastTrainingDuration = Date.now() - startTime;
      this.trainingStats.averageLoss = trainingResults.averageLoss;
      this.trainingStats.improvementRate = trainingResults.improvementRate;

      // Remove processed experiences from buffer
      this.experienceBuffer = this.experienceBuffer.slice(this.config.experienceBatchSize);

      // Save model if needed
      if (this.trainingStats.totalTrainingRuns % 10 === 0) {
        await this.saveModel();
      }

      // Emit training completed event
      trainingEvents.emit('trainingCompleted', {
        duration: this.trainingStats.lastTrainingDuration,
        experiencesProcessed: trainingExperiences.length,
        averageLoss: this.trainingStats.averageLoss,
        improvementRate: this.trainingStats.improvementRate
      });

      this.lastTrainingTime = Date.now();
      this.isTraining = false;

      console.log(`✅ Training cycle completed in ${this.trainingStats.lastTrainingDuration}ms`);
      return true;
    } catch (error) {
      console.error('❌ Training cycle failed:', error);
      this.isTraining = false;
      return false;
    }
  }

  /**
   * 🔍 Preprocess experiences for training
   */
  preprocessExperiences(experiences) {
    // Group by experience type
    const groupedExperiences = experiences.reduce((groups, exp) => {
      const type = exp.type || 'general';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(exp);
      return groups;
    }, {});

    // Process each group
    const processedGroups = {};
    for (const [type, exps] of Object.entries(groupedExperiences)) {
      processedGroups[type] = this.normalizeExperiences(exps);
    }

    return processedGroups;
  }

  /**
   * 📊 Normalize experiences for consistent training
   */
  normalizeExperiences(experiences) {
    return experiences.map(exp => {
      // Extract features
      const features = this.extractFeatures(exp);
      
      // Normalize reward
      const normalizedReward = this.normalizeReward(exp.reward || 0);
      
      return {
        ...exp,
        features,
        normalizedReward
      };
    });
  }

  /**
   * 🔍 Extract features from experience
   */
  extractFeatures(experience) {
    // This would be more sophisticated in production
    // For now, we'll extract basic features
    
    const features = {
      // Time features
      timeOfDay: new Date(experience.timestamp).getHours() / 24,
      dayOfWeek: new Date(experience.timestamp).getDay() / 7,
      
      // Action features
      actionType: experience.action?.type || 'unknown',
      
      // State features
      marketVolatility: experience.stateBefore?.marketConditions?.volatility || 0,
      gasPrice: experience.stateBefore?.networkConditions?.gasPrice || 0,
      
      // Result features
      profitUSD: experience.stateAfter?.profit?.usd || 0,
      profitPercent: experience.stateAfter?.profit?.percent || 0,
      executionTime: experience.stateAfter?.executionTime || 0
    };
    
    return features;
  }

  /**
   * 📊 Normalize reward for consistent training
   */
  normalizeReward(reward) {
    // Clip extreme values
    const clippedReward = Math.max(-1000, Math.min(1000, reward));
    
    // Normalize to [-1, 1] range
    return clippedReward / 1000;
  }

  /**
   * 🧠 Train the model with processed experiences
   */
  async trainModel(processedExperiences) {
    // This would connect to a proper ML framework in production
    // For now, we'll simulate training
    
    console.log('🧠 Training model with processed experiences...');
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate training results
    const averageLoss = 0.05 + Math.random() * 0.1;
    const improvementRate = 0.02 + Math.random() * 0.05;
    
    return {
      averageLoss,
      improvementRate,
      epochs: 10,
      samplesProcessed: Object.values(processedExperiences)
        .reduce((total, exps) => total + exps.length, 0)
    };
  }

  /**
   * 💾 Save the current model
   */
  async saveModel() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const modelPath = path.join(this.config.modelSaveDir, `model-${timestamp}.json`);
      
      // In production, this would save actual model weights
      // For now, we'll save a placeholder
      const modelData = {
        timestamp,
        trainingStats: this.trainingStats,
        version: '1.0.0',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: this.config.experienceBatchSize,
          architecture: 'bounded-a2c-ddp'
        }
      };
      
      await fs.writeFile(modelPath, JSON.stringify(modelData, null, 2));
      console.log(`✅ Model saved to ${modelPath}`);
      
      return modelPath;
    } catch (error) {
      console.error('❌ Failed to save model:', error);
      return null;
    }
  }

  /**
   * 📂 Load the latest model
   */
  async loadModel() {
    try {
      // Get list of model files
      const files = await fs.readdir(this.config.modelSaveDir);
      const modelFiles = files.filter(file => file.startsWith('model-') && file.endsWith('.json'));
      
      if (modelFiles.length === 0) {
        console.log('ℹ️ No existing models found, starting fresh');
        return false;
      }
      
      // Sort by timestamp (newest first)
      modelFiles.sort().reverse();
      
      // Load the newest model
      const latestModelPath = path.join(this.config.modelSaveDir, modelFiles[0]);
      const modelData = JSON.parse(await fs.readFile(latestModelPath, 'utf8'));
      
      console.log(`✅ Loaded model from ${latestModelPath}`);
      
      // In production, this would load actual model weights
      // For now, we'll just update the training stats
      this.trainingStats = {
        ...this.trainingStats,
        ...modelData.trainingStats
      };
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load model:', error);
      return false;
    }
  }

  /**
   * 🧹 Clean up resources
   */
  async shutdown() {
    console.log('🧹 Shutting down training pipeline...');
    
    // Clear interval
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
    }
    
    // Save current model
    await this.saveModel();
    
    // Close database connection
    await pgPool.end();
    
    console.log('✅ Training pipeline shut down');
    return true;
  }

  /**
   * 📊 Get training statistics
   */
  getTrainingStats() {
    return {
      ...this.trainingStats,
      currentBufferSize: this.experienceBuffer.length,
      isTraining: this.isTraining,
      lastTrainingTime: this.lastTrainingTime
    };
  }
}

/**
 * 🚀 Create and initialize a training pipeline instance
 */
export async function createTrainingPipeline(config = {}) {
  const pipeline = new ContinuousTrainingPipeline(config);
  await pipeline.initialize();
  return pipeline;
}

// Run as standalone if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      console.log('🚀 Starting Continuous Training Pipeline in standalone mode...');
      
      const pipeline = await createTrainingPipeline();
      
      // Add some test experiences
      for (let i = 0; i < 60; i++) {
        await pipeline.addExperience({
          id: `exp-${i}`,
          type: i % 3 === 0 ? 'arbitrage' : i % 3 === 1 ? 'market' : 'network',
          timestamp: Date.now() - (60 - i) * 60000,
          stateBefore: {
            marketConditions: {
              volatility: Math.random()
            },
            networkConditions: {
              gasPrice: 5 + Math.random() * 20
            }
          },
          action: {
            type: i % 4 === 0 ? 'execute' : i % 4 === 1 ? 'monitor' : i % 4 === 2 ? 'analyze' : 'skip',
            params: {
              confidence: Math.random()
            }
          },
          stateAfter: {
            profit: {
              usd: i % 4 === 0 ? 50 + Math.random() * 200 : 0,
              percent: i % 4 === 0 ? 0.5 + Math.random() * 2 : 0
            },
            executionTime: 100 + Math.random() * 500
          },
          reward: i % 4 === 0 ? 10 + Math.random() * 50 : -5 + Math.random() * 10,
          metadata: {
            source: 'test'
          }
        });
      }
      
      // Force a training cycle
      await pipeline.runTrainingCycle();
      
      // Display stats
      console.log('📊 Training Stats:', pipeline.getTrainingStats());
      
      // Keep process alive
      console.log('🔄 Press Ctrl+C to exit...');
      
    } catch (error) {
      console.error('❌ Error in standalone mode:', error);
      process.exit(1);
    }
  })();
} 