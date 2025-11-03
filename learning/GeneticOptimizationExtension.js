/**
 * 🧬 Genetic Optimization Extension
 * ================================
 * 
 * Extension methods for the AlphaGnomeEvolutionarySystem to support
 * improved learning from the JudgeService and optimization workflows.
 * 
 * This provides the linkage between the judgment system and the
 * evolutionary system, enabling guided evolution based on concrete
 * execution results and optimization suggestions.
 */

import { AlphaGnomeEvolutionarySystem } from './AlphaGnomeEvolutionarySystem.js';

/**
 * Extend AlphaGnomeEvolutionarySystem with advanced learning capabilities
 */
export function extendWithOptimizationCapabilities(evolutionSystem) {
    if (!evolutionSystem || !(evolutionSystem instanceof AlphaGnomeEvolutionarySystem)) {
        throw new Error('Invalid evolutionary system provided');
    }
    
    /**
     * Integrate an improved genotype from judgment optimization
     * 
     * @param {object} improvedGenotype - The improved genotype from sparring
     * @param {string} agentId - The agent ID that this genotype relates to
     * @param {string} source - The source of the improvement
     * @param {object} improvementDetails - Details about the improvement
     */
    evolutionSystem.integrateImprovedGenotype = async function(improvedGenotype, agentId, source, improvementDetails) {
        try {
            // 1. Validate the genotype structure
            if (!this._validateGenotype(improvedGenotype)) {
                console.error(`❌ Invalid genotype structure rejected for agent ${agentId}`);
                return false;
            }
            
            // 2. Get the agent's current genotype
            const currentGenotype = await this.getAgentGenotype(agentId);
            
            // 3. Check if the improvement is significant
            const improvementScore = this._calculateImprovementScore(
                currentGenotype, 
                improvedGenotype,
                improvementDetails
            );
            
            if (improvementScore < 0.1) {
                console.log(`ℹ️ Improvement score too low (${improvementScore.toFixed(2)}), not integrating genotype for ${agentId}`);
                return false;
            }
            
            // 4. Store the improved genotype for use in evolution
            await this.storeImprovedGenotype(improvedGenotype, agentId, source, improvementDetails);
            
            // 5. Optionally immediately apply the genotype to the agent
            if (improvementScore > 0.3) {
                await this.applyGenotypeToAgent(improvedGenotype, agentId);
                console.log(`🧬 Applied high-scoring improved genotype (${improvementScore.toFixed(2)}) directly to agent ${agentId}`);
            } else {
                // Schedule for consideration in next evolution cycle
                this._scheduleGenotypeForEvolution(improvedGenotype, agentId, improvementScore);
                console.log(`🧬 Scheduled improved genotype for next evolution cycle for agent ${agentId}`);
            }
            
            return true;
        } catch (error) {
            console.error(`❌ Error integrating improved genotype for agent ${agentId}:`, error);
            return false;
        }
    };
    
    /**
     * Integrate a learned genotype from failure recovery
     * 
     * @param {object} learnedGenotype - The alternative genotype that would avoid failure
     * @param {string} agentId - The agent ID that experienced the failure
     * @param {string} source - The source of the learning
     * @param {object} context - Context about the failure and learning
     */
    evolutionSystem.integrateLearnedGenotype = async function(learnedGenotype, agentId, source, context) {
        try {
            // 1. Store the learned genotype for future reference
            await this.storeLearnedGenotype(learnedGenotype, agentId, source, context);
            
            // 2. Create a "recovery case" in the evolutionary memory
            const recoveryCase = {
                failureType: context.failureCategory || context.context?.failureCategory || 'unknown_failure',
                originalTxHash: context.originalTxHash,
                chain: context.chain || context.context?.chain,
                recoveryGenotype: learnedGenotype,
                timestamp: new Date().toISOString()
            };
            
            // 3. Store in the recovery case database
            await this.storeRecoveryCase(recoveryCase, agentId);
            
            console.log(`🧬 Integrated learned genotype from failure recovery for agent ${agentId}`);
            return true;
        } catch (error) {
            console.error(`❌ Error integrating learned genotype for agent ${agentId}:`, error);
            return false;
        }
    };
    
    /**
     * Store an improved genotype for later use
     * 
     * @param {object} genotype - The improved genotype
     * @param {string} agentId - The agent ID
     * @param {string} source - The source of the improvement
     * @param {object} details - Improvement details
     */
    evolutionSystem.storeImprovedGenotype = async function(genotype, agentId, source, details) {
        if (!this.dbPool) {
            // Store in memory if no database
            this.improvedGenotypes = this.improvedGenotypes || new Map();
            this.improvedGenotypes.set(`${agentId}_${Date.now()}`, {
                genotype, agentId, source, details, timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS improved_genotypes (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    source VARCHAR(100) NOT NULL,
                    genotype JSONB NOT NULL,
                    details JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                INSERT INTO improved_genotypes (agent_id, source, genotype, details)
                VALUES ($1, $2, $3, $4)
            `, [
                agentId,
                source,
                JSON.stringify(genotype),
                JSON.stringify(details)
            ]);
        } finally {
            client.release();
        }
    };
    
    /**
     * Store a learned genotype from failure cases
     * 
     * @param {object} genotype - The learned genotype
     * @param {string} agentId - The agent ID
     * @param {string} source - The learning source
     * @param {object} context - Learning context
     */
    evolutionSystem.storeLearnedGenotype = async function(genotype, agentId, source, context) {
        if (!this.dbPool) {
            // Store in memory if no database
            this.learnedGenotypes = this.learnedGenotypes || new Map();
            this.learnedGenotypes.set(`${agentId}_${Date.now()}`, {
                genotype, agentId, source, context, timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS learned_genotypes (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    source VARCHAR(100) NOT NULL,
                    genotype JSONB NOT NULL,
                    context JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                INSERT INTO learned_genotypes (agent_id, source, genotype, context)
                VALUES ($1, $2, $3, $4)
            `, [
                agentId,
                source,
                JSON.stringify(genotype),
                JSON.stringify(context)
            ]);
        } finally {
            client.release();
        }
    };
    
    /**
     * Store a failure recovery case
     * 
     * @param {object} recoveryCase - The recovery case details
     * @param {string} agentId - The agent ID
     */
    evolutionSystem.storeRecoveryCase = async function(recoveryCase, agentId) {
        if (!this.dbPool) {
            // Store in memory if no database
            this.recoveryCases = this.recoveryCases || new Map();
            this.recoveryCases.set(`${recoveryCase.failureType}_${Date.now()}`, {
                ...recoveryCase,
                agentId,
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        // Store in database
        const client = await this.dbPool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS recovery_cases (
                    id SERIAL PRIMARY KEY,
                    agent_id VARCHAR(255) NOT NULL,
                    failure_type VARCHAR(100) NOT NULL,
                    tx_hash VARCHAR(66),
                    chain VARCHAR(50),
                    recovery_genotype JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await client.query(`
                INSERT INTO recovery_cases (agent_id, failure_type, tx_hash, chain, recovery_genotype)
                VALUES ($1, $2, $3, $4, $5)
            `, [
                agentId,
                recoveryCase.failureType,
                recoveryCase.originalTxHash || null,
                recoveryCase.chain || null,
                JSON.stringify(recoveryCase.recoveryGenotype)
            ]);
        } finally {
            client.release();
        }
    };
    
    /**
     * Get an agent's current genotype
     * 
     * @param {string} agentId - The agent ID
     * @returns {object} The agent's current genotype
     */
    evolutionSystem.getAgentGenotype = async function(agentId) {
        // Try to get from database first
        if (this.dbPool) {
            const client = await this.dbPool.connect();
            try {
                const result = await client.query(`
                    SELECT genotype FROM agent_genotypes 
                    WHERE agent_id = $1 
                    ORDER BY created_at DESC LIMIT 1
                `, [agentId]);
                
                if (result.rows.length > 0) {
                    return result.rows[0].genotype;
                }
            } catch (err) {
                console.warn(`Failed to retrieve genotype for ${agentId} from database:`, err.message);
            } finally {
                client.release();
            }
        }
        
        // Fall back to default genotype if not found
        return {
            gasMultiplier: 1.2,
            slippageTolerance: 0.005,
            priorityLevel: "MEDIUM",
            timeoutMs: 5000,
            minProfitThreshold: 50,
            maxGasPrice: "auto"
        };
    };
    
    /**
     * Apply a genotype directly to an agent
     * 
     * @param {object} genotype - The genotype to apply
     * @param {string} agentId - The target agent ID
     */
    evolutionSystem.applyGenotypeToAgent = async function(genotype, agentId) {
        // Store in the agent's genotype history
        if (this.dbPool) {
            const client = await this.dbPool.connect();
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS agent_genotypes (
                        id SERIAL PRIMARY KEY,
                        agent_id VARCHAR(255) NOT NULL,
                        genotype JSONB NOT NULL,
                        source VARCHAR(100) DEFAULT 'direct_application',
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `);
                
                await client.query(`
                    INSERT INTO agent_genotypes (agent_id, genotype, source)
                    VALUES ($1, $2, $3)
                `, [
                    agentId,
                    JSON.stringify(genotype),
                    'judgment_optimization'
                ]);
            } finally {
                client.release();
            }
        }
        
        // If we have the agent in memory, update it directly
        // (This depends on the specific agent implementation)
        try {
            // This is specific to how you've implemented agent storage
            const agentMap = this.getParentPopulation ? this.getParentPopulation() : null;
            
            if (agentMap && agentMap.has(agentId)) {
                const agent = agentMap.get(agentId);
                agent.genotype = { ...genotype };
                console.log(`✅ Applied genotype directly to agent ${agentId} in memory`);
            }
        } catch (err) {
            console.warn(`Could not apply genotype directly to agent ${agentId}:`, err.message);
        }
    };
    
    /**
     * Schedule a genotype for consideration in the next evolution cycle
     * 
     * @private
     * @param {object} genotype - The genotype to schedule
     * @param {string} agentId - The associated agent ID
     * @param {number} score - The improvement score
     */
    evolutionSystem._scheduleGenotypeForEvolution = function(genotype, agentId, score) {
        this.scheduledGenotypes = this.scheduledGenotypes || [];
        this.scheduledGenotypes.push({
            genotype,
            agentId,
            score,
            timestamp: Date.now()
        });
    };
    
    /**
     * Validate a genotype's structure
     * 
     * @private
     * @param {object} genotype - The genotype to validate
     * @returns {boolean} Whether the genotype is valid
     */
    evolutionSystem._validateGenotype = function(genotype) {
        // Basic validation - ensure it has required fields
        if (!genotype) return false;
        
        const requiredFields = ['gasMultiplier', 'slippageTolerance', 'priorityLevel'];
        return requiredFields.every(field => genotype[field] !== undefined);
    };
    
    /**
     * Calculate the improvement score between two genotypes
     * 
     * @private
     * @param {object} currentGenotype - The current genotype
     * @param {object} improvedGenotype - The improved genotype
     * @param {object} details - Improvement details
     * @returns {number} The improvement score (0-1)
     */
    evolutionSystem._calculateImprovementScore = function(currentGenotype, improvedGenotype, details) {
        // If we have explicit improvement details, use those
        if (details && typeof details.improvementPercent === 'number') {
            return Math.min(1.0, details.improvementPercent / 100);
        }
        
        // Otherwise, do a basic comparison of the genotypes
        let diffScore = 0;
        let totalFields = 0;
        
        // Compare all fields in both genotypes
        const allFields = new Set([
            ...Object.keys(currentGenotype || {}),
            ...Object.keys(improvedGenotype || {})
        ]);
        
        for (const field of allFields) {
            totalFields++;
            
            const currentValue = currentGenotype?.[field];
            const improvedValue = improvedGenotype?.[field];
            
            if (currentValue === improvedValue) continue;
            
            // Different values - count as a difference
            diffScore++;
        }
        
        // Return normalized difference score (0-1)
        return totalFields > 0 ? diffScore / totalFields : 0;
    };
    
    // Return the extended system
    return evolutionSystem;
}

