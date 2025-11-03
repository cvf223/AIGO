/**
 * @file CurriculumManager.js
 * @description Manages the learning curriculum for the AI system
 * @author AI-Flash-Loan-Arbitrage-Syndicate
 */

/**
 * CurriculumManager controls the learning progression, gradually increasing difficulty
 * to ensure efficient and effective training of the AI system.
 */
export class CurriculumManager {
    /**
     * Creates a new CurriculumManager instance
     * @param {Object} config - Configuration options
     * @param {number} config.stageCount - Number of difficulty stages
     * @param {string} config.difficultyProgression - Progression type ('linear', 'exponential')
     * @param {Object} config.dbPool - PostgreSQL database pool for persistence
     * @param {boolean} config.debug - Enable debug logging
     */
    constructor(config = {}) {
        this.config = {
            stageCount: config.stageCount || 4,
            difficultyProgression: config.difficultyProgression || 'exponential',
            persistToDB: config.persistToDB !== false,
            debug: config.debug || false,
            ...config
        };
        
        this.dbPool = config.dbPool;
        
        // Default difficulty labels
        this.difficultyLabels = {
            0: 'beginner',
            1: 'easy',
            2: 'medium',
            3: 'hard',
            4: 'expert'
        };
        
        // Metrics for tracking curriculum progress
        this.metrics = {
            totalCurriculums: 0,
            totalStages: 0,
            totalOpportunities: 0,
            averageStagesPerCurriculum: 0,
            curriculumHistory: []
        };
    }

    /**
     * Initializes the manager by setting up required connections
     */
    async initialize() {
        if (this.config.debug) console.log('🔄 Initializing CurriculumManager...');
        
        // Create database tables if needed
        if (this.config.persistToDB && this.dbPool) {
            await this._ensureDatabaseTables();
        }
        
        // 🔗 ZAP ENGINE INTEGRATION
        this.zapEngine = null;
        this.zapGeneratedScenarios = [];
        
        if (this.config.debug) console.log('✅ CurriculumManager initialized');
    }
    
    /**
     * 🔗 CONNECT ZAP ENGINE
     * ====================
     * REVOLUTIONARY: ZAP generates superior training scenarios!
     */
    connectZAPEngine(zapEngine) {
        console.log('⚡ Connecting ZAP Engine to Curriculum Manager...');
        this.zapEngine = zapEngine;
        console.log('   ✅ ZAP will generate superior causal concept scenarios!');
    }
    
    /**
     * 📚 ADD TRAINING SCENARIO (from ZAP)
     * ==================================
     */
    async addTrainingScenario(scenario) {
        console.log(`📚 Adding ZAP-generated training scenario: ${scenario.type}`);
        
        this.zapGeneratedScenarios.push({
            ...scenario,
            addedAt: Date.now(),
            source: 'zap_engine'
        });
        
        // Store in database if available
        if (this.config.persistToDB && this.dbPool) {
            await this.dbPool.query(`
                INSERT INTO training_scenarios 
                (type, difficulty, task, correct_plan, outcome, systems_used, causal_depth, concept_quality, learning_value, source)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                scenario.type,
                scenario.difficulty,
                JSON.stringify(scenario.task),
                JSON.stringify(scenario.correctPlan),
                JSON.stringify(scenario.outcome),
                scenario.systemsUsed,
                scenario.causalDepth,
                scenario.conceptQuality,
                scenario.learningValue,
                'zap_engine'
            ]);
        }
        
        console.log(`   ✅ Scenario added (total ZAP scenarios: ${this.zapGeneratedScenarios.length})`);
    }
    
    /**
     * 🎯 REQUEST SCENARIO FROM ZAP
     * ===========================
     */
    async requestScenarioFromZAP(difficulty, topic) {
        if (!this.zapEngine) {
            console.warn('⚠️ ZAP Engine not connected!');
            return null;
        }
        
        console.log(`🎯 Requesting ZAP scenario: ${topic} (${difficulty})`);
        
        const scenario = await this.zapEngine.generateCurriculumScenario(difficulty, topic);
        
        await this.addTrainingScenario(scenario);
        
        return scenario;
    }

    /**
     * Creates a curriculum from a set of opportunities
     * @param {Array} opportunities - Arbitrage opportunities
     * @param {Object} options - Curriculum options
     * @param {string} options.name - Curriculum name
     * @param {Array} options.stages - Custom stage configuration
     * @returns {Object} Created curriculum
     */
    async createCurriculum(opportunities, options = {}) {
        const startTime = Date.now();
        
        if (this.config.debug) {
            console.log(`🔄 Creating curriculum from ${opportunities.length} opportunities...`);
        }
        
        const name = options.name || `Curriculum_${Date.now()}`;
        
        // Create curriculum based on options
        let curriculum;
        if (options.stages && Array.isArray(options.stages)) {
            curriculum = this._createCustomCurriculum(opportunities, options.stages, name);
        } else {
            curriculum = this._createDefaultCurriculum(opportunities, name);
        }
        
        // Add metadata
        curriculum.metadata = {
            createdAt: Date.now(),
            generationTimeMs: Date.now() - startTime,
            options: { ...options }
        };
        
        // Store curriculum in database if configured
        if (this.config.persistToDB && this.dbPool) {
            await this._storeCurriculum(curriculum);
        }
        
        // Update metrics
        this._updateMetrics(curriculum);
        
        if (this.config.debug) {
            console.log(`✅ Created curriculum "${name}" with ${curriculum.stages.length} stages`);
        }
        
        return curriculum;
    }

    /**
     * Creates a custom curriculum based on provided stage configuration
     * @param {Array} opportunities - Arbitrage opportunities
     * @param {Array} stages - Custom stage configuration
     * @param {string} name - Curriculum name
     * @returns {Object} Custom curriculum
     * @private
     */
    _createCustomCurriculum(opportunities, stages, name) {
        const curriculum = {
            name,
            totalOpportunities: opportunities.length,
            stages: []
        };
        
        // Create stages based on custom configuration
        for (const stage of stages) {
            // Filter opportunities based on stage difficulty
            const stageOpportunities = this._filterOpportunitiesByDifficulty(
                opportunities,
                stage.difficulty
            );
            
            // Limit to requested count if specified
            const limitedOpportunities = stage.count ? 
                stageOpportunities.slice(0, stage.count) : 
                stageOpportunities;
            
            curriculum.stages.push({
                name: stage.name,
                difficulty: stage.difficulty,
                opportunities: limitedOpportunities,
                count: limitedOpportunities.length,
                passThreshold: stage.passThreshold || 0.7,
                requiredSuccessRate: stage.requiredSuccessRate || 0.8
            });
        }
        
        return curriculum;
    }

    /**
     * Creates a default curriculum with progressive difficulty
     * @param {Array} opportunities - Arbitrage opportunities
     * @param {string} name - Curriculum name
     * @returns {Object} Default curriculum
     * @private
     */
    _createDefaultCurriculum(opportunities, name) {
        const curriculum = {
            name,
            totalOpportunities: opportunities.length,
            stages: []
        };
        
        // Sort opportunities by difficulty
        const sortedOpportunities = [...opportunities].sort(
            (a, b) => this._calculateDifficulty(a) - this._calculateDifficulty(b)
        );
        
        // Determine stage sizes based on progression type
        const stageSizes = this._calculateStageSizes(
            sortedOpportunities.length,
            this.config.stageCount,
            this.config.difficultyProgression
        );
        
        // Create stages
        let startIndex = 0;
        for (let i = 0; i < this.config.stageCount; i++) {
            const stageSize = stageSizes[i];
            const endIndex = Math.min(startIndex + stageSize, sortedOpportunities.length);
            const stageOpportunities = sortedOpportunities.slice(startIndex, endIndex);
            
            const difficulty = this._getDifficultyLabel(i, this.config.stageCount);
            
            curriculum.stages.push({
                name: `Stage ${i + 1}: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`,
                difficulty,
                opportunities: stageOpportunities,
                count: stageOpportunities.length,
                passThreshold: 0.7 + (i * 0.05),  // Increasing pass threshold
                requiredSuccessRate: 0.8 - (i * 0.05)  // Decreasing required success rate
            });
            
            startIndex = endIndex;
        }
        
        return curriculum;
    }

    /**
     * Calculates stage sizes based on progression type
     * @param {number} totalCount - Total number of opportunities
     * @param {number} stageCount - Number of stages
     * @param {string} progressionType - Progression type ('linear', 'exponential')
     * @returns {Array} Array of stage sizes
     * @private
     */
    _calculateStageSizes(totalCount, stageCount, progressionType) {
        const stageSizes = [];
        
        if (progressionType === 'exponential') {
            // Exponential progression: each stage is larger than the previous
            let totalWeight = 0;
            const weights = [];
            
            for (let i = 0; i < stageCount; i++) {
                const weight = Math.pow(1.5, i);
                weights.push(weight);
                totalWeight += weight;
            }
            
            for (let i = 0; i < stageCount; i++) {
                stageSizes.push(Math.round((weights[i] / totalWeight) * totalCount));
            }
        } else {
            // Linear progression: equal stage sizes
            const baseSize = Math.floor(totalCount / stageCount);
            const remainder = totalCount % stageCount;
            
            for (let i = 0; i < stageCount; i++) {
                stageSizes.push(baseSize + (i < remainder ? 1 : 0));
            }
        }
        
        return stageSizes;
    }

    /**
     * Filters opportunities by difficulty level
     * @param {Array} opportunities - Arbitrage opportunities
     * @param {string} difficulty - Difficulty level
     * @returns {Array} Filtered opportunities
     * @private
     */
    _filterOpportunitiesByDifficulty(opportunities, difficulty) {
        // Map difficulty labels to numeric ranges
        const difficultyRanges = {
            'beginner': [0, 0.2],
            'easy': [0.2, 0.4],
            'medium': [0.4, 0.6],
            'hard': [0.6, 0.8],
            'expert': [0.8, 1.0]
        };
        
        const range = difficultyRanges[difficulty] || [0, 1.0];
        
        // Filter opportunities by calculated difficulty
        return opportunities.filter(opportunity => {
            const difficultyScore = this._calculateDifficulty(opportunity);
            return difficultyScore >= range[0] && difficultyScore < range[1];
        });
    }

    /**
     * Calculates difficulty score for an opportunity
     * @param {Object} opportunity - Arbitrage opportunity
     * @returns {number} Difficulty score (0.0 to 1.0)
     * @private
     */
    _calculateDifficulty(opportunity) {
        // Calculate difficulty score based on various factors
        let score = 0;
        
        // Factor 1: Route complexity
        if (opportunity.complexity === 'simple') {
            score += 0.1;
        } else if (opportunity.complexity === 'medium') {
            score += 0.3;
        } else if (opportunity.complexity === 'complex') {
            score += 0.5;
        }
        
        // Factor 2: Slippage sensitivity
        score += opportunity.slippage * 5; // 0.001 -> 0.005, 0.05 -> 0.25
        
        // Factor 3: Gas optimization difficulty
        const gasMultiplier = Number(opportunity.gasPrice) / 1e9; // Convert to gwei
        score += Math.min(gasMultiplier / 100, 0.25); // Cap at 0.25
        
        // Factor 4: Path length
        if (opportunity.path && Array.isArray(opportunity.path)) {
            const pathLength = opportunity.path.length;
            score += Math.min((pathLength - 2) * 0.05, 0.2); // Cap at 0.2
        }
        
        // Factor 5: Alternative paths
        if (opportunity.alternativePaths && Array.isArray(opportunity.alternativePaths)) {
            score += Math.min(opportunity.alternativePaths.length * 0.05, 0.1); // Cap at 0.1
        }
        
        // Factor 6: Profit potential (inverse relationship - higher profit = lower difficulty)
        // This is intentionally designed to reward strategies that maximize profit
        if (opportunity.expectedProfitUsd !== undefined) {
            // Normalize profit to a 0-1 scale using a logarithmic scale
            // $1 profit = no reduction, $10 = 0.1 reduction, $100 = 0.2 reduction, $1000 = 0.3 reduction
            const profitValue = Number(opportunity.expectedProfitUsd);
            if (profitValue > 0) {
                const profitFactor = Math.min(Math.log10(profitValue) * 0.1, 0.3); // Cap at 0.3
                score = Math.max(score - profitFactor, 0.01); // Ensure score doesn't go below 0.01
            }
        }
        
        // Factor 7: Execution speed requirement (higher speed requirement = higher difficulty)
        if (opportunity.expectedExecutionTimeMs !== undefined) {
            const executionTime = Number(opportunity.expectedExecutionTimeMs);
            if (executionTime > 0) {
                // Lower times are more difficult: <10ms is very hard, >500ms is easier
                if (executionTime < 10) {
                    score += 0.25; // Very fast execution needed (sub 10ms)
                } else if (executionTime < 50) {
                    score += 0.15; // Fast execution needed (10-50ms)
                } else if (executionTime < 200) {
                    score += 0.05; // Moderate speed needed (50-200ms)
                }
                // No modifier for slower execution times
            }
        }
        
        // Factor 8: Competitive pressure (higher competition = higher difficulty)
        if (opportunity.competitionLevel !== undefined) {
            const competitionLevel = Number(opportunity.competitionLevel); // 0-1 scale
            if (competitionLevel >= 0 && competitionLevel <= 1) {
                score += competitionLevel * 0.2; // Up to 0.2 for highest competition
            }
        }
        
        // Final score with profit as primary goal
        // If profit is substantial (>$50), ensure difficulty isn't too high
        if (opportunity.expectedProfitUsd !== undefined) {
            const profitValue = Number(opportunity.expectedProfitUsd);
            if (profitValue >= 50 && score > 0.7) {
                // Cap difficulty at 0.7 for high-profit opportunities to ensure they're prioritized
                // This follows the requirement to prioritize profit over other factors
                score = 0.7;
            }
        }
        
        return Math.min(score, 0.99); // Cap at 0.99
    }

    /**
     * Gets difficulty label for a stage
     * @param {number} stageIndex - Stage index
     * @param {number} totalStages - Total number of stages
     * @returns {string} Difficulty label
     * @private
     */
    _getDifficultyLabel(stageIndex, totalStages) {
        if (stageIndex < totalStages * 0.25) {
            return 'beginner';
        } else if (stageIndex < totalStages * 0.5) {
            return 'easy';
        } else if (stageIndex < totalStages * 0.75) {
            return 'medium';
        } else if (stageIndex < totalStages * 0.9) {
            return 'hard';
        } else {
            return 'expert';
        }
    }

    /**
     * Ensures required database tables exist
     * @private
     */
    async _ensureDatabaseTables() {
        if (!this.dbPool) return;
        
        try {
            await this.dbPool.query(`
                CREATE TABLE IF NOT EXISTS training_curriculums (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    total_opportunities INTEGER NOT NULL,
                    stage_count INTEGER NOT NULL,
                    metadata JSONB,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                CREATE TABLE IF NOT EXISTS training_curriculum_stages (
                    id SERIAL PRIMARY KEY,
                    curriculum_id INTEGER NOT NULL REFERENCES training_curriculums(id) ON DELETE CASCADE,
                    stage_index INTEGER NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    difficulty VARCHAR(50) NOT NULL,
                    opportunity_count INTEGER NOT NULL,
                    pass_threshold DECIMAL(5,2) NOT NULL,
                    required_success_rate DECIMAL(5,2) NOT NULL,
                    opportunities JSONB,
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(curriculum_id, stage_index)
                );
                
                CREATE INDEX IF NOT EXISTS idx_training_curriculum_stages_curriculum_id ON training_curriculum_stages(curriculum_id);
            `);
            
            if (this.config.debug) console.log('✅ Database tables created or verified');
        } catch (error) {
            console.error('❌ Error ensuring database tables:', error);
        }
    }

    /**
     * Stores a curriculum in the database
     * @param {Object} curriculum - Curriculum to store
     * @private
     */
    async _storeCurriculum(curriculum) {
        if (!this.dbPool) return;
        
        try {
            // Start a transaction
            const client = await this.dbPool.connect();
            
            try {
                await client.query('BEGIN');
                
                // Insert curriculum
                const curriculumResult = await client.query(`
                    INSERT INTO training_curriculums
                    (name, total_opportunities, stage_count, metadata)
                    VALUES ($1, $2, $3, $4)
                    RETURNING id
                `, [
                    curriculum.name,
                    curriculum.totalOpportunities,
                    curriculum.stages.length,
                    JSON.stringify(curriculum.metadata || {})
                ]);
                
                const curriculumId = curriculumResult.rows[0].id;
                
                // Insert stages
                for (let i = 0; i < curriculum.stages.length; i++) {
                    const stage = curriculum.stages[i];
                    
                    await client.query(`
                        INSERT INTO training_curriculum_stages
                        (curriculum_id, stage_index, name, difficulty, opportunity_count, pass_threshold, required_success_rate, opportunities)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    `, [
                        curriculumId,
                        i,
                        stage.name,
                        stage.difficulty,
                        stage.count,
                        stage.passThreshold,
                        stage.requiredSuccessRate,
                        JSON.stringify(stage.opportunities)
                    ]);
                }
                
                await client.query('COMMIT');
                
                if (this.config.debug) {
                    console.log(`✅ Stored curriculum "${curriculum.name}" in database with ID ${curriculumId}`);
                }
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Error storing curriculum in database:', error);
        }
    }

    /**
     * Updates metrics with curriculum data
     * @param {Object} curriculum - Curriculum data
     * @private
     */
    _updateMetrics(curriculum) {
        this.metrics.totalCurriculums++;
        this.metrics.totalStages += curriculum.stages.length;
        this.metrics.totalOpportunities += curriculum.totalOpportunities;
        this.metrics.averageStagesPerCurriculum = this.metrics.totalStages / this.metrics.totalCurriculums;
        
        // Add to history
        this.metrics.curriculumHistory.push({
            name: curriculum.name,
            stageCount: curriculum.stages.length,
            opportunityCount: curriculum.totalOpportunities,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.metrics.curriculumHistory.length > 100) {
            this.metrics.curriculumHistory = this.metrics.curriculumHistory.slice(-100);
        }
    }

    /**
     * Gets all curriculums from the database
     * @returns {Array} All curriculums
     */
    async getAllCurriculums() {
        if (!this.dbPool) return [];
        
        try {
            const result = await this.dbPool.query(`
                SELECT id, name, total_opportunities, stage_count, metadata, created_at
                FROM training_curriculums
                ORDER BY created_at DESC
            `);
            
            return result.rows;
        } catch (error) {
            console.error('❌ Error getting curriculums from database:', error);
            return [];
        }
    }

    /**
     * Gets a curriculum from the database by ID
     * @param {number} id - Curriculum ID
     * @returns {Object} Curriculum with stages
     */
    async getCurriculum(id) {
        if (!this.dbPool) return null;
        
        try {
            // Get curriculum
            const curriculumResult = await this.dbPool.query(`
                SELECT id, name, total_opportunities, stage_count, metadata, created_at
                FROM training_curriculums
                WHERE id = $1
            `, [id]);
            
            if (curriculumResult.rows.length === 0) {
                return null;
            }
            
            const curriculum = curriculumResult.rows[0];
            
            // Get stages
            const stagesResult = await this.dbPool.query(`
                SELECT stage_index, name, difficulty, opportunity_count, pass_threshold, required_success_rate, opportunities
                FROM training_curriculum_stages
                WHERE curriculum_id = $1
                ORDER BY stage_index
            `, [id]);
            
            curriculum.stages = stagesResult.rows;
            
            return curriculum;
        } catch (error) {
            console.error('❌ Error getting curriculum from database:', error);
            return null;
        }
    }

    /**
     * Gets metrics about created curriculums
     * @returns {Object} Curriculum metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
}
