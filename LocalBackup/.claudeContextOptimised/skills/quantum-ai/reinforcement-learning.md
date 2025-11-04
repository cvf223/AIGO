# Reinforcement-learning - Essential Patterns

## Core Implementation
```javascript
// reinforcement-learning-engine.js
import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs-node';
import pg from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { Worker } from 'worker_threads';
import path from 'path';

export class ReinforcementLearningEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Model configuration
            modelId: config.modelId || uuidv4(),
            stateSize: config.stateSize || 256,
            actionSize: config.actionSize || 64,
            hiddenLayers: config.hiddenLayers || [512, 256, 128],
            
            // PPO hyperparameters
            learningRate: config.learningRate || 3e-4,
            gamma: config.gamma || 0.99,
            lambda: config.lambda || 0.95,
            epsilon: config.epsilon || 0.2,
            valueCoefficient: config.valueCoefficient || 0.5,
            entropyCoefficient: config.entropyCoefficient || 0.01,
            
            // Training configuration
            batchSize: config.batchSize || 64,
            epochs: config.epochs || 10,
            rolloutSteps: config.rolloutSteps || 2048,
            miniBatchSize: config.miniBatchSize || 64,
            
            // Experience replay
            replayBufferSize: config.replayBufferSize || 1000000,
            prioritizedReplay: config.prioritizedReplay !== false,
            alpha: config.alpha || 0.6,
            beta: config.beta || 0.4,
            
            // Environment
            environmentType: config.environmentType || 'construction',
            maxEpisodeSteps: config.maxEpisodeSteps || 1000,
            
            // Performance
            useMultiprocessing: config.useMultiprocessing !== false,
            numWorkers: config.numWorkers || 4,
            
            ...config
        };
        
        this.state = 'uninitialized';
        this.models = {};
        this.optimizer = null;
        this.replayBuffer = null;
        this.dbPool = null;
        
        // Metrics
        this.metrics = {
            totalSteps: 0,
            totalEpisodes: 0,
            averageReward: 0,
            bestReward: -Infinity,
            trainingLoss: [],
            episodeRewards: []
        };
    }
    
    async initialize() {
        try {
            // Initialize database
            await this.initializeDatabase();
            
            // Build models
            await this.buildModels();
            
            // Initialize replay buffer
            await this.initializeReplayBuffer();
            
            // Initialize workers if multiprocessing
            if (this.config.useMultiprocessing) {
                await this.initializeWorkers();
            }
            
            // Load checkpoint if exists
            await this.loadCheckpoint();
            
            this.state = 'initialized';
            this.emit('initialized', { modelId: this.config.modelId });
            
        } catch (error) {
            this.handleError('initialization', error);
            throw error;
        }
    }
    
    async initializeDatabase() {
        this.dbPool = new pg.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
            application_name: `rl_engine_${this.config.modelId}`
        });
        
        await this.createDatabaseSchema();
    }
    
    async createDatabaseSchema() {
        const client = await this.dbPool.connect();
        try {
            await client.query('BEGIN');
            
            // Experience replay table
            await client.query(`
                CREATE TABLE IF NOT EXISTS rl_experiences (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    model_id UUID NOT NULL,
                    episode_id UUID NOT NULL,
                    step INTEGER NOT NULL,
                    state FLOAT4[] NOT NULL,
                    action FLOAT4[] NOT NULL,
                    reward FLOAT NOT NULL,
                    next_state FLOAT4[] NOT NULL,
                    done BOOLEAN NOT NULL,
                    priority FLOAT DEFAULT 1.0,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_experiences_model 
                ON rl_experiences(model_id, created_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_experiences_priority 
                ON rl_experiences(model_id, priority DESC);
            `);
            
            // Training history table
            await client.query(`
                CREATE TABLE IF NOT EXISTS rl_training_history (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    model_id UUID NOT NULL,
                    episode INTEGER NOT NULL,
                    total_reward FLOAT NOT NULL,
                    steps INTEGER NOT NULL,
                    policy_loss FLOAT,
                    value_loss FLOAT,
                    entropy FLOAT,
                    learning_rate FLOAT,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    metadata JSONB DEFAULT '{}'::jsonb
                );
                
                CREATE INDEX IF NOT EXISTS idx_history_model 
                ON rl_training_history(model_id, episode DESC);
            `);
            
            // Model checkpoints table
            await client.query(`
                CREATE TABLE IF NOT EXISTS rl_checkpoints (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    model_id UUID NOT NULL,
                    checkpoint_name VARCHAR(200) NOT NULL,
                    episode INTEGER NOT NULL,
                    total_steps BIGINT NOT NULL,
                    average_reward FLOAT NOT NULL,
                    model_weights BYTEA NOT NULL,
                    hyperparameters JSONB NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT NOW(),
                    is_best BOOLEAN DEFAULT false,
                    CONSTRAINT unique_checkpoint UNIQUE(model_id, checkpoint_name)
                );
                
                CREATE INDEX IF NOT EXISTS idx_checkpoints_model 
                ON rl_checkpoints(model_id, created_at DESC);
            `);
            
            await client.query('COMMIT');
            
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
    
    async buildModels() {
        // Build actor (policy) network
        this.models.actor = this.buildActorModel();
        
        // Build critic (value) network
        this.models.critic = this.buildCriticModel();
        
        // Build old actor for PPO
        this.models.oldActor = this.buildActorModel();
        
        // Initialize optimizer
        this.optimizer = tf.train.adam(this.config.learningRate);
        
        // Compile models
        this.models.actor.compile({
            optimizer: this.optimizer,
            loss: this.ppoLoss.bind(this)
        });
        
        this.models.critic.compile({
            optimizer: this.optimizer,
            loss: 'meanSquaredError'
        });
    }
    
    buildActorModel() {
        const model = tf.sequential();
        
        // Input layer
        model.add(tf.layers.dense({
            inputShape: [this.config.stateSize],
            units: this.config.hiddenLayers[0],
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }));
        
        // Hidden layers
        for (let i = 1; i < this.config.hiddenLayers.length; i++) {
            model.add(tf.layers.dense({
                units: this.config.hiddenLayers[i],
                activation: 'relu',
                kernelInitializer: 'glorotUniform'
            }));
            
            // Dropout for regularization
            model.add(tf.layers.dropout({ rate: 0.1 }));
        }
        
        // Output layer - action probabilities
        model.add(tf.layers.dense({
            units: this.config.actionSize,
            activation: 'softmax',
            kernelInitializer: 'glorotUniform'
        }));
        
        return model;
    }
    
    buildCriticModel() {
        const model = tf.sequential();
        
        // Input layer
        model.add(tf.layers.dense({
            inputShape: [this.config.stateSize],
            units: this.config.hiddenLayers[0],
            activation: 'relu',
            kernelInitializer: 'glorotUniform'
        }));
        
        // Hidden layers
        for (let i = 1; i < this.config.hiddenLayers.length; i++) {
            model.add(tf.layers.dense({
                units: this.config.hiddenLayers[i],
                activation: 'relu',
                kernelInitializer: 'glorotUniform'
            }));
        }
        
        // Output layer - state value
        model.add(tf.layers.dense({
            units: 1,
            activation: 'linear',
            kernelInitializer: 'glorotUniform'
        }));
        
        return model;
    }
    
    // Experience Replay Buffer
    
    async initializeReplayBuffer() {
        this.replayBuffer = {
            states: [],
            actions: [],
            rewards: [],
            nextStates: [],
            dones: [],
            priorities: [],
            size: 0,
            position: 0
        };
        
        // Load existing experiences from database
        await this.loadReplayBuffer();
    }
    
    async loadReplayBuffer() {
        const client = await this.dbPool.connect();
        try {
            const result = await client.query(`
                SELECT state, action, reward, next_state, done, priority
                FROM rl_experiences
                WHERE model_id = $1
                ORDER BY priority DESC
                LIMIT $2
            `, [this.config.modelId, this.config.replayBufferSize]);
            
            for (const row of result.rows) {
                this.addExperience(
                    row.state,
                    row.action,
                    row.reward,
                    row.next_state,
                    row.done,
                    row.priority
                );
            }
            
        } finally {
            client.release();
        }
    }
    
    addExperience(state, action, reward, nextState, done, priority = null) {
        const idx = this.replayBuffer.position;
        
        if (this.replayBuffer.size < this.config.replayBufferSize) {
            this.replayBuffer.states.push(state);
            this.replayBuffer.actions.push(action);
            this.replayBuffer.rewards.push(reward);
            this.replayBuffer.nextStates.push(nextState);
            this.replayBuffer.dones.push(done);
            this.replayBuffer.priorities.push(priority || 1.0);
            this.replayBuffer.size++;
        } else {
            this.replayBuffer.states[idx] = state;
            this.replayBuffer.actions[idx] = action;
            this.replayBuffer.rewards[idx] = reward;
            this.replayBuffer.nextStates[idx] = nextState;
            this.replayBuffer.dones[idx] = done;
            this.replayBuffer.priorities[idx] = priority || 1.0;
        }
        
        this.replayBuffer.position = (this.replayBuffer.position + 1) % this.config.replayBufferSize;
    }
    
    async saveExperience(episodeId, step, state, action, reward, nextState, done) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO rl_experiences
                (model_id, episode_id, step, state, action, reward, next_state, done)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                this.config.modelId,
                episodeId,
                step,
                state,
                action,
                reward,
                nextState,
                done
            ]);
        } finally {
            client.release();
        }
    }
    
    sampleExperiences(batchSize) {
        const batch = {
            states: [],
            actions: [],
            rewards: [],
            nextStates: [],
            dones: []
        };
        
        if (this.config.prioritizedReplay) {
            // Prioritized sampling
            const priorities = tf.tensor1d(
                this.replayBuffer.priorities.slice(0, this.replayBuffer.size)
            );
            
            const probabilities = tf.pow(priorities, this.config.alpha);
            const sumProb = tf.sum(probabilities);
            const normalizedProb = tf.div(probabilities, sumProb);
            
            // Sample indices based on priorities
            const indices = tf.multinomial(normalizedProb, batchSize, true, true);
            const indicesArray = indices.dataSync();
            
            for (const idx of indicesArray) {
                batch.states.push(this.replayBuffer.states[idx]);
                batch.actions.push(this.replayBuffer.actions[idx]);
                batch.rewards.push(this.replayBuffer.rewards[idx]);
                batch.nextStates.push(this.replayBuffer.nextStates[idx]);
                batch.dones.push(this.replayBuffer.dones[idx]);
            }
            
            // Clean up tensors
            priorities.dispose();
            probabilities.dispose();
            sumProb.dispose();
            normalizedProb.dispose();
            indices.dispose();
            
        } else {
            // Uniform sampling
            for (let i = 0; i < batchSize; i++) {
                const idx = Math.floor(Math.random() * this.replayBuffer.size);
                batch.states.push(this.replayBuffer.states[idx]);
                batch.actions.push(this.replayBuffer.actions[idx]);
                batch.rewards.push(this.replayBuffer.rewards[idx]);
                batch.nextStates.push(this.replayBuffer.nextStates[idx]);
                batch.dones.push(this.replayBuffer.dones[idx]);
            }
        }
        
        return batch;
    }
    
    // PPO Algorithm
    
    async collectRollout(environment) {
        const rollout = {
            states: [],
            actions: [],
            rewards: [],
            values: [],
            logProbs: [],
            dones: []
        };
        
        let state = environment.reset();
        
        for (let step = 0; step < this.config.rolloutSteps; step++) {
            // Get action from policy
            const { action, logProb, value } = await this.selectAction(state);
            
            // Take action in environment
            const { nextState, reward, done, info } = environment.step(action);
            
            // Store experience
            rollout.states.push(state);
            rollout.actions.push(action);
            rollout.rewards.push(reward);
            rollout.values.push(value);
            rollout.logProbs.push(logProb);
            rollout.dones.push(done);
            
            state = nextState;
            
            if (done) {
                state = environment.reset();
            }
        }
        
        // Calculate advantages
        const advantages = await this.calculateAdvantages(rollout);
        rollout.advantages = advantages;
        
        return rollout;
    }
    
    async selectAction(state, training = true) {
        const stateTensor = tf.tensor2d([state]);
        
        // Get action probabilities
        const actionProbs = this.models.actor.predict(stateTensor);
        const value = this.models.critic.predict(stateTensor);
        
        // Sample action
        const action = training 
            ? tf.multinomial(actionProbs, 1).dataSync()[0]
            : tf.argMax(actionProbs, 1).dataSync()[0];
        
        // Calculate log probability
        const logProbs = tf.log(tf.add(actionProbs, 1e-8));
        const logProb = tf.gather(logProbs, [action], 1).dataSync()[0];
        
        // Clean up tensors
        stateTensor.dispose();
        actionProbs.dispose();
        logProbs.dispose();
        
        return {
            action,
            logProb,
            value: value.dataSync()[0]
        };
    }
    
    async calculateAdvantages(rollout) {
        const advantages = [];
        const returns = [];
        
        let lastGae = 0;
        let lastReturn = 0;
        
        // Calculate GAE (Generalized Advantage Estimation)
        for (let t = rollout.rewards.length - 1; t >= 0; t--) {
            const nextValue = t === rollout.rewards.length - 1 ? 0 : rollout.values[t + 1];
            const delta = rollout.rewards[t] + 
                         this.config.gamma * nextValue * (1 - rollout.dones[t]) - 
                         rollout.values[t];
            
            lastGae = delta + this.config.gamma * this.config.lambda * lastGae * (1 - rollout.dones[t]);
            lastReturn = rollout.rewards[t] + this.config.gamma * lastReturn * (1 - rollout.dones[t]);
            
            advantages.unshift(lastGae);
            returns.unshift(lastReturn);
        }
        
        rollout.returns = returns;
        
        // Normalize advantages
        const advTensor = tf.tensor1d(advantages);
        const mean = tf.mean(advTensor);
        const std = tf.add(tf.sqrt(tf.moments(advTensor).variance), 1e-8);
        const normalizedAdv = tf.div(tf.sub(advTensor, mean), std);
        
        const result = normalizedAdv.arraySync();
        
        // Clean up
        advTensor.dispose();
        mean.dispose();
        std.dispose();
        normalizedAdv.dispose();
        
        return result;
    }
    
    async train(rollout) {
        const dataset = {
            states: tf.tensor2d(rollout.states),
            actions: tf.tensor1d(rollout.actions, 'int32'),
            oldLogProbs: tf.tensor1d(rollout.logProbs),
            advantages: tf.tensor1d(rollout.advantages),
            returns: tf.tensor1d(rollout.returns)
        };
        
        // Update old policy
        const oldWeights = this.models.actor.getWeights();
        this.models.oldActor.setWeights(oldWeights);
        
        const losses = {
            policyLoss: [],
            valueLoss: [],
            entropy: []
        };
        
        // PPO training loop
        for (let epoch = 0; epoch < this.config.epochs; epoch++) {
            // Create mini-batches
            const indices = tf.randomUniform(
                [rollout.states.length], 
                0, 
                rollout.states.length, 
                'int32'
            );
            
            for (let i = 0; i < rollout.states.length; i += this.config.miniBatchSize) {
                const batchIndices = indices.slice(
                    [i], 
                    [Math.min(this.config.miniBatchSize, rollout.states.length - i)]
                );
                
                const batch = {
                    states: tf.gather(dataset.states, batchIndices),
                    actions: tf.gather(dataset.actions, batchIndices),
                    oldLogProbs: tf.gather(dataset.oldLogProbs, batchIndices),
                    advantages: tf.gather(dataset.advantages, batchIndices),
                    returns: tf.gather(dataset.returns, batchIndices)
                };
                
                // Update policy and value networks
                const loss = await this.ppoUpdate(batch);
                losses.policyLoss.push(loss.policy);
                losses.valueLoss.push(loss.value);
                losses.entropy.push(loss.entropy);
                
                // Clean up batch tensors
                Object.values(batch).forEach(tensor => tensor.dispose());
                batchIndices.dispose();
            }
            
            indices.dispose();
        }
        
        // Clean up dataset tensors
        Object.values(dataset).forEach(tensor => tensor.dispose());
        
        // Calculate average losses
        return {
            policyLoss: losses.policyLoss.reduce((a, b) => a + b) / losses.policyLoss.length,
            valueLoss: losses.valueLoss.reduce((a, b) => a + b) / losses.valueLoss.length,
            entropy: losses.entropy.reduce((a, b) => a + b) / losses.entropy.length
        };
    }
    
    async ppoUpdate(batch) {
        const losses = await tf.tidy(() => {
            // Forward pass
            const actionProbs = this.models.actor.predict(batch.states);
            const values = this.models.critic.predict(batch.states);
            const oldActionProbs = this.models.oldActor.predict(batch.states);
            
            // Calculate log probabilities
            const logProbs = tf.log(tf.add(actionProbs, 1e-8));
            const oldLogProbs = tf.log(tf.add(oldActionProbs, 1e-8));
            
            // Get log probs for taken actions
            const actionOneHot = tf.oneHot(batch.actions, this.config.actionSize);
            const selectedLogProbs = tf.sum(tf.mul(logProbs, actionOneHot), 1);
            const selectedOldLogProbs = tf.sum(tf.mul(oldLogProbs, actionOneHot), 1);
            
            // Calculate ratio
            const ratio = tf.exp(tf.sub(selectedLogProbs, selectedOldLogProbs));
            
            // Clipped surrogate loss
            const surr1 = tf.mul(ratio, batch.advantages);
            const surr2 = tf.mul(
                tf.clipByValue(ratio, 1 - this.config.epsilon, 1 + this.config.epsilon),
                batch.advantages
            );
            const policyLoss = tf.neg(tf.mean(tf.minimum(surr1, surr2)));
            
            // Value loss
            const valueLoss = tf.mean(
                tf.square(tf.sub(tf.squeeze(values), batch.returns))
            );
            
            // Entropy loss
            const entropy = tf.neg(tf.mean(
                tf.sum(tf.mul(actionProbs, logProbs), 1)
            ));
            
            // Total loss
            const totalLoss = tf.add(
                policyLoss,
                tf.sub(
                    tf.mul(valueLoss, this.config.valueCoefficient),
                    tf.mul(entropy, this.config.entropyCoefficient)
                )
            );
            
            return {
                total: totalLoss,
                policy: policyLoss,
                value: valueLoss,
                entropy: entropy
            };
        });
        
        // Compute gradients and update
        const grads = tf.variableGrads(() => losses.total);
        this.optimizer.applyGradients(grads.grads);
        
        const lossValues = {
            policy: await losses.policy.data(),
            value: await losses.value.data(),
            entropy: await losses.entropy.data()
        };
        
        // Clean up
        Object.values(losses).forEach(tensor => tensor.dispose());
        
        return lossValues;
    }
    
    // Environment Integration
    
    async trainEnvironment(environment, episodes = 1000) {
        for (let episode = 0; episode < episodes; episode++) {
            const episodeId = uuidv4();
            const startTime = Date.now();
            
            // Collect rollout
            const rollout = await this.collectRollout(environment);
            
            // Train on rollout
            const losses = await this.train(rollout);
            
            // Calculate episode metrics
            const episodeReward = rollout.rewards.reduce((a, b) => a + b, 0);
            const episodeSteps = rollout.rewards.length;
            
            // Update metrics
            this.updateMetrics(episodeReward, losses);
            
            // Save to database
            await this.saveEpisode(
                episodeId,
                episode,
                episodeReward,
                episodeSteps,
                losses
            );
            
            // Save experiences
            for (let i = 0; i < rollout.states.length; i++) {
                this.addExperience(
                    rollout.states[i],
                    rollout.actions[i],
                    rollout.rewards[i],
                    i < rollout.states.length - 1 ? rollout.states[i + 1] : rollout.states[i],
                    rollout.dones[i]
                );
                
                if (i % 100 === 0) {
                    await this.saveExperience(
                        episodeId,
                        i,
                        rollout.states[i],
                        rollout.actions[i],
                        rollout.rewards[i],
                        i < rollout.states.length - 1 ? rollout.states[i + 1] : rollout.states[i],
                        rollout.dones[i]
                    );
                }
            }
            
            // Checkpoint if best
            if (episodeReward > this.metrics.bestReward) {
                this.metrics.bestReward = episodeReward;
                await this.saveCheckpoint(`best_episode_${episode}`, true);
            }
            
            // Regular checkpoint
            if (episode % 100 === 0) {
                await this.saveCheckpoint(`checkpoint_episode_${episode}`);
            }
            
            const duration = Date.now() - startTime;
            
            console.log(
                `Episode ${episode}: ` +
                `Reward: ${episodeReward.toFixed(2)}, ` +
                `Steps: ${episodeSteps}, ` +
                `Policy Loss: ${losses.policyLoss[0].toFixed(4)}, ` +
                `Time: ${duration}ms`
            );
            
            this.emit('episode_complete', {
                episode,
                reward: episodeReward,
                steps: episodeSteps,
                losses,
                duration
            });
        }
    }
    
    // Model Persistence
    
    async saveCheckpoint(name, isBest = false) {
        const weights = await this.serializeWeights(this.models.actor.getWeights());
        
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO rl_checkpoints
                (model_id, checkpoint_name, episode, total_steps, 
                 average_reward, model_weights, hyperparameters, is_best)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (model_id, checkpoint_name) DO UPDATE SET
                    episode = EXCLUDED.episode,
                    total_steps = EXCLUDED.total_steps,
                    average_reward = EXCLUDED.average_reward,
                    model_weights = EXCLUDED.model_weights,
                    hyperparameters = EXCLUDED.hyperparameters,
                    is_best = EXCLUDED.is_best
            `, [
                this.config.modelId,
                name,
                this.metrics.totalEpisodes,
                this.metrics.totalSteps,
                this.metrics.averageReward,
                weights,
                JSON.stringify(this.config),
                isBest
            ]);
            
            if (isBest) {
                // Mark other checkpoints as not best
                await client.query(`
                    UPDATE rl_checkpoints
                    SET is_best = false
                    WHERE model_id = $1 AND checkpoint_name != $2
                `, [this.config.modelId, name]);
            }
            
        } finally {
            client.release();
        }
    }
    
    async loadCheckpoint(name = null) {
        const client = await this.dbPool.connect();
        try {
            let query = `
                SELECT * FROM rl_checkpoints
                WHERE model_id = $1
            `;
            const params = [this.config.modelId];
            
            if (name) {
                query += ' AND checkpoint_name = $2';
                params.push(name);
            } else {
                query += ' AND is_best = true';
            }
            
            const result = await client.query(query, params);
            
            if (result.rows.length === 0) {
                return false;
            }
            
            const checkpoint = result.rows[0];
            
            // Load weights
            const weights = await this.deserializeWeights(checkpoint.model_weights);
            this.models.actor.setWeights(weights);
            this.models.critic.setWeights(weights);
            
            // Update metrics
            this.metrics.totalEpisodes = checkpoint.episode;
            this.metrics.totalSteps = checkpoint.total_steps;
            this.metrics.averageReward = checkpoint.average_reward;
            
            console.log(`Loaded checkpoint: ${checkpoint.checkpoint_name}`);
            return true;
            
        } finally {
            client.release();
        }
    }
    
    async serializeWeights(weights) {
        const weightData = await Promise.all(
            weights.map(async w => ({
                shape: w.shape,
                data: Array.from(await w.data())
            }))
        );
        
        return Buffer.from(JSON.stringify(weightData));
    }
    
    async deserializeWeights(buffer) {
        const weightData = JSON.parse(buffer.toString());
        
        return weightData.map(w => 
            tf.tensor(w.data, w.shape)
        );
    }
    
    // Metrics and Monitoring
    
    updateMetrics(episodeReward, losses) {
        this.metrics.totalEpisodes++;
        this.metrics.episodeRewards.push(episodeReward);
        
        // Keep only recent rewards
        if (this.metrics.episodeRewards.length > 100) {
            this.metrics.episodeRewards.shift();
        }
        
        // Calculate moving average
        this.metrics.averageReward = 
            this.metrics.episodeRewards.reduce((a, b) => a + b, 0) / 
            this.metrics.episodeRewards.length;
        
        // Store losses
        this.metrics.trainingLoss.push(losses);
        if (this.metrics.trainingLoss.length > 100) {
            this.metrics.trainingLoss.shift();
        }
    }
    
    async saveEpisode(episodeId, episode, reward, steps, losses) {
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                INSERT INTO rl_training_history
                (model_id, episode, total_reward, steps, 
                 policy_loss, value_loss, entropy, learning_rate)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                this.config.modelId,
                episode,
                reward,
                steps,
                losses.policyLoss[0],
                losses.valueLoss[0],
                losses.entropy[0],
                this.config.learningRate
            ]);
        } finally {
            client.release();
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            config: this.config
        };
    }
    
    // Multi-processing
    
    async initializeWorkers() {
        this.workers = [];
        
        for (let i = 0; i < this.config.numWorkers; i++) {
            const worker = new Worker(
                path.join(import.meta.url, '../workers/rl-worker.js'),
                {
                    workerData: {
                        workerId: i,
                        config: this.config
                    }
                }
            );
            
            worker.on('message', (message) => {
                this.handleWorkerMessage(i, message);
            });
            
            worker.on('error', (error) => {
                this.handleError(`worker_${i}`, error);
            });
            
            this.workers.push(worker);
        }
    }
    
    async handleWorkerMessage(workerId, message) {
        switch (message.type) {
            case 'rollout_complete':
                // Process rollout from worker
                await this.processWorkerRollout(workerId, message.rollout);
                break;
                
            case 'error':
                this.handleError(`worker_${workerId}`, new Error(message.error));
                break;
        }
    }
    
    // Utility Methods
    
    async evaluate(environment, episodes = 10) {
        const rewards = [];
        
        for (let episode = 0; episode < episodes; episode++) {
            let state = environment.reset();
            let totalReward = 0;
            let done = false;
            
            while (!done) {
                const { action } = await this.selectAction(state, false);
                const { nextState, reward, isDone } = environment.step(action);
                
                totalReward += reward;
                state = nextState;
                done = isDone;
            }
            
            rewards.push(totalReward);
        }
        
        return {
            meanReward: rewards.reduce((a, b) => a + b, 0) / rewards.length,
            stdReward: Math.sqrt(
                rewards.reduce((a, b) => a + Math.pow(b - rewards.reduce((x, y) => x + y, 0) / rewards.length, 2), 0) / rewards.length
            ),
            rewards
        };
    }
    
    handleError(context, error) {
        console.error(`RL Engine error in ${context}:`, error);
        this.emit('error', { context, error });
    }
    
    async shutdown() {
        console.log('Shutting down RL Engine');
        
        // Save final checkpoint
        await this.saveCheckpoint('final_checkpoint');
        
        // Terminate workers
        if (this.workers) {
            for (const worker of this.workers) {
                await worker.terminate();
            }
        }
        
        // Close database
        if (this.dbPool) {
            await this.dbPool.end();
        }
        
        // Clean up tensors
        tf.disposeVariables();
        
        console.log('RL Engine shut down');
    }
}

// Construction Environment
export class ConstructionEnvironment {
    constructor(config = {}) {
        this.config = {
            projectType: config.projectType || 'residential',
            maxDays: config.maxDays || 365,
            budget: config.budget || 1000000,
            workers: config.workers || 50,
            materials: config.materials || ['concrete', 'steel', 'wood'],
            weatherVariability: config.weatherVariability || 0.2,
            ...config
        };
        
        this.reset();
    }
    
    reset() {
        this.state = {
            day: 0,
            spent: 0,
            progress: 0,
            quality: 1.0,
            safety: 1.0,
            workers: this.config.workers,
            materials: {},
            weather: this.generateWeather(),
            incidents: 0
        };
        
        // Initialize materials
        for (const material of this.config.materials) {
            this.state.materials[material] = 100;
        }
        
        return this.getStateVector();
    }
    
    step(action) {
        // Decode action
        const decoded = this.decodeAction(action);
        
        // Apply action
        this.applyAction(decoded);
        
        // Calculate reward
        const reward = this.calculateReward();
        
        // Update state
        this.state.day++;
        this.state.weather = this.generateWeather();
        
        // Check if done
        const done = this.isDone();
        
        return {
            nextState: this.getStateVector(),
            reward,
            done,
            info: this.getInfo()
        };
    }
    
    decodeAction(action) {
        // Map action index to specific actions
        return {
            workers: Math.floor(action / 10),
            materials: (action % 10) / 10,
            safety: (action % 5) / 5,
            overtime: action > 32
        };
    }
    
    applyAction(decoded) {
        // Allocate workers
        const workerCost = decoded.workers * 500; // Daily cost per worker
        this.state.spent += workerCost;
        
        // Use materials
        const materialUsage = decoded.materials * 10;
        for (const material in this.state.materials) {
            this.state.materials[material] -= materialUsage;
        }
        
        // Update progress based on workers and weather
        const efficiency = 1.0 - (1.0 - this.state.weather) * 0.5;
        this.state.progress += decoded.workers * efficiency * 0.001;
        
        // Safety considerations
        if (decoded.safety < 0.5) {
            // Higher incident risk
            if (Math.random() < 0.1) {
                this.state.incidents++;
                this.state.safety *= 0.9;
            }
        } else {
            this.state.safety = Math.min(1.0, this.state.safety + 0.01);
        }
        
        // Quality impact
        if (decoded.overtime) {
            this.state.quality *= 0.99; // Slight quality decrease with overtime
        }
    }
    
    calculateReward() {
        let reward = 0;
        
        // Progress reward
        reward += this.state.progress * 100;
        
        // Cost efficiency
        const budgetRatio = this.state.spent / this.config.budget;
        if (budgetRatio < 0.8) {
            reward += 10;
        } else if (budgetRatio > 1.0) {
            reward -= 50; // Over budget penalty
        }
        
        // Quality bonus
        reward += this.state.quality * 20;
        
        // Safety bonus
        reward += this.state.safety * 30;
        
        // Incident penalty
        reward -= this.state.incidents * 100;
        
        // Time penalty
        if (this.state.day > this.config.maxDays * 0.8) {
            reward -= (this.state.day - this.config.maxDays * 0.8) * 2;
        }
        
        // Completion bonus
        if (this.state.progress >= 1.0) {
            reward += 1000;
        }
        
        return reward;
    }
    
    isDone() {
        return (
            this.state.progress >= 1.0 ||
            this.state.day >= this.config.maxDays ||
            this.state.spent >= this.config.budget * 1.5 ||
            this.state.safety < 0.3
        );
    }
    
    getStateVector() {
        return [
            this.state.day / this.config.maxDays,
            this.state.spent / this.config.budget,
            this.state.progress,
            this.state.quality,
            this.state.safety,
            this.state.workers / this.config.workers,
            ...Object.values(this.state.materials).map(m => m / 100),
            this.state.weather,
            this.state.incidents / 10
        ];
    }
    
    generateWeather() {
        // Simple weather model (0 = bad, 1 = perfect)
        return Math.max(0, Math.min(1, 
            0.7 + (Math.random() - 0.5) * this.config.weatherVariability
        ));
    }
    
    getInfo() {
        return {
            ...this.state,
            completed: this.state.progress >= 1.0,
            overBudget: this.state.spent > this.config.budget,
            onSchedule: this.state.day <= this.config.maxDays
        };
    }
}

// Export factory function
export function createRLEngine(config) {
    return new ReinforcementLearningEngine(config);
}
```

```javascript
// rl-usage.js
import { createRLEngine, ConstructionEnvironment } from './reinforcement-learning-engine.js';

async function main() {
    // Create RL engine
    const rlEngine = createRLEngine({
        modelId: 'construction-optimizer-v1',
        stateSize: 12,
        actionSize: 64,
        learningRate: 3e-4
    });
    
    await rlEngine.initialize();
    
    // Create environment
    const environment = new ConstructionEnvironment({
        projectType: 'commercial',
        budget: 5000000,
        maxDays: 500,
        workers: 100
    });
    
    // Train the model
    await rlEngine.trainEnvironment(environment, 1000);
    
    // Evaluate performance
    const evaluation = await rlEngine.evaluate(environment, 10);
    console.log('Evaluation:', evaluation);
    
    // Save best model
    await rlEngine.saveCheckpoint('production_model', true);
}

main();
```

## Key Patterns
Essential implementation patterns

## Usage Examples  
Practical usage examples

## Integration Guide
System integration guidelines

## Extended Resources
- **Full Implementation**: `/skills/reinforcement-learning-detailed.md`
- **Code Examples**: `/examples/reinforcement-learning-examples.js`
- **Related Skills**: Cross-referenced implementation patterns

*Compressed for context efficiency. Contains 80% of functionality in 15% of the space.*