/**
 * 🥊 ELITE ALPHAGNOME SPARRING SERVICE - TOP 1% EXPERT IMPLEMENTATION
 * ===================================================================
 *
 * LIVE AGENT IMPROVEMENT SYSTEM for Judge-Driven Evolution!
 * 
 * This is an ELITE high-intensity training service that conducts battlefield
 * sparring sessions against competitor transactions. Uses the complete
 * KNOWLEDGE-BASED EVOLUTION SYSTEM with:
 * 
 * ✅ Battlefield evaluation with ALL agents competing on same transaction
 * ✅ Knowledge-based intelligent mutations (NO RANDOM!)
 * ✅ Elite gene pool integration for superior breeding
 * ✅ Live agent improvement for real-time trading enhancement
 * ✅ Judge-driven feedback loops for immediate performance gains
 * ✅ Profit-focused fitness optimization with battle-tested algorithms
 * 
 * ELITE TRUTH: Every sparring session makes our agents SMARTER!
 */

import { AlphaGnomeEvolutionarySystem } from '../../learning/AlphaGnomeEvolutionarySystem.js';
// CONSTRUCTION SYNDICATE: Block replay not needed
// import { BlockReplaySystem } from '../training/BlockReplaySystem.js';

class AlphaGnomeSparringService {
    constructor(dependencies = {}) {
        // Extract essential dependencies or throw errors if missing
        if (!dependencies.blockReplaySystem) {
            throw new Error('AlphaGnomeSparringService requires a blockReplaySystem dependency');
        }
        
        this.blockReplay = dependencies.blockReplaySystem;
        
        // 🎯 ELITE EVOLUTIONARY SYSTEM CONNECTION
        this.evolutionarySystem = dependencies.alphaGnomeEvolution;
        if (!this.evolutionarySystem) {
            console.warn('⚠️ No AlphaGnomeEvolutionarySystem provided - will try to find via service registry');
        }
        
        // Optional factory dependency with logging
        this.factory = dependencies.factory;
        if (!this.factory) {
            console.warn('⚠️ No factory provided to AlphaGnomeSparringService. Agent creation will be unavailable.');
        }
        
        // Obtain worldModel either directly or from provided services
        if (dependencies.worldModel) {
            this.worldModel = dependencies.worldModel;
        } else if (dependencies.services && dependencies.services.worldModel) {
            this.worldModel = dependencies.services.worldModel;
            console.log('🧠 Using worldModel from services registry');
        } else {
            throw new Error('AlphaGnomeSparringService requires a worldModel dependency');
        }
        
        // Database connection for storing results
        this.dbPool = dependencies.dbPool;
        if (!this.dbPool) {
            console.warn('⚠️ No database connection provided to AlphaGnomeSparringService. Results will not be persisted.');
        }
        
        // Additional dependencies
        this.rewardEngine = dependencies.rewardPenaltyEngine || 
                          (dependencies.services ? dependencies.services.rewardPenaltyEngine : null);
        
        this.logger = dependencies.logger || console;
        
        // 🏆 ELITE SPARRING METRICS
        this.metrics = {
            sparringSessions: 0,
            competitorWins: 0,
            syndicateWins: 0,
            averageImprovement: 0,
            totalProfitGained: 0,
            // NEW ELITE METRICS
            liveAgentImprovements: 0,
            judgeTriggeredSessions: 0,
            battlefieldEvolutionsPerformed: 0,
            knowledgeBasedMutationsApplied: 0,
            eliteGenePoolUpdates: 0
        };
        
        // 🧠 LIVE AGENT IMPROVEMENT SYSTEM
        this.liveAgentTracker = new Map(); // Agent ID -> Performance History
        this.judgeIntegration = {
            enabled: true,
            improvementThreshold: 0.05, // 5% improvement triggers live update
            maxLiveUpdatesPerHour: 10,
            lastUpdateTime: 0
        };
        
        this.logger.log('🥊 ELITE AlphaGnomeSparringService initialized with live agent improvement');
    }
    
    /**
     * Check if the service has all required dependencies
     */
    checkDependencies() {
        return {
            blockReplay: !!this.blockReplay,
            worldModel: !!this.worldModel,
            factory: !!this.factory,
            database: !!this.dbPool,
            rewardEngine: !!this.rewardEngine
        };
    }
    
    /**
     * Initialize the service
     */
    async initialize() {
        // Create tables if needed
        if (this.dbPool) {
            try {
                const client = await this.dbPool.connect();
                try {
                    await client.query(`
                        CREATE TABLE IF NOT EXISTS sparring_sessions (
                            id SERIAL PRIMARY KEY,
                            tx_hash VARCHAR(66) NOT NULL,
                            chain VARCHAR(32) NOT NULL,
                            competitor_profit DECIMAL(20,8) NOT NULL,
                            syndicate_profit DECIMAL(20,8) NOT NULL,
                            improvement_pct DECIMAL(10,2),
                            winning_genotype JSONB,
                            simulation_params JSONB,
                            created_at TIMESTAMP DEFAULT NOW()
                        )
                    `);
                    this.logger.log('✅ AlphaGnomeSparringService database tables initialized');
                } finally {
                    client.release();
                }
            } catch (error) {
                this.logger.error('❌ Failed to initialize database tables:', error);
            }
        }
    }

    /**
     * 🏟️ ELITE BATTLEFIELD SPARRING SESSION - TOP 1% EXPERT IMPLEMENTATION
     * 
     * Uses the complete knowledge-based evolution system with battlefield evaluation,
     * intelligent mutations, and live agent improvement for enormous results!
     * 
     * @param {object} decodedTx - The output from MEVTransactionDecoder.
     * @param {object} competitorGenotype - The initial genotype mined from the transaction.
     * @param {object} options - Additional options for judge-driven sessions
     * @returns {Promise<object>} The result of the elite sparring session.
     */
    async runSparringSession(decodedTx, competitorGenotype, options = {}) {
        console.log(`🏟️ ELITE BATTLEFIELD SPARRING: ${decodedTx.txHash}`);
        console.log(`💰 Target: Outperform competitor's $${decodedTx.netProfitUSD.toFixed(2)} profit`);

        // 🎯 PHASE 1: GET ACCESS TO ELITE EVOLUTIONARY SYSTEM
        const evolutionSystem = await this._getEliteEvolutionarySystem();
        if (!evolutionSystem) {
            throw new Error('🚫 Cannot run elite sparring without access to AlphaGnomeEvolutionarySystem!');
        }

        // 🏆 PHASE 2: DETERMINE ELITE SPARRING INTENSITY
        const simulationParams = this.determineEliteSparringIntensity(decodedTx, options);
        console.log(`🔥 Elite intensity: ${simulationParams.battlefieldRounds} battlefield rounds, ${simulationParams.reason}`);

        // 🌍 PHASE 3: RECREATE PRECISE MARKET CONDITIONS
        const marketState = await this.blockReplay.recreateStateForBlock(decodedTx.chain, decodedTx.blockNumber);
        const marketForecast = await this.worldModel.predict(marketState);
        console.log('🧠 Elite market reconstruction complete with AI forecast');

        // 🏟️ PHASE 4: INJECT COMPETITOR DNA INTO POPULATION
        await this._injectCompetitorGenotypeIntoPopulation(evolutionSystem, competitorGenotype, decodedTx);

        // ⚔️ PHASE 5: CONDUCT ELITE BATTLEFIELD EVALUATION
        let bestBattlefieldResult = null;
        let totalMutationsApplied = 0;
        let eliteGenesDiscovered = 0;

        for (let round = 0; round < simulationParams.battlefieldRounds; round++) {
            console.log(`🏟️ Battlefield Round ${round + 1}/${simulationParams.battlefieldRounds}`);
            
            // Use the ELITE battlefield evaluation system!
            const battlefieldResult = await evolutionSystem.conductBattlefieldEvaluation(
                decodedTx, 
                marketState
            );
            
            // Track the best result across all rounds
            if (!bestBattlefieldResult || 
                battlefieldResult.elitePerformers.length > 0 && 
                battlefieldResult.elitePerformers[0].expectedProfit > (bestBattlefieldResult.bestProfit || 0)) {
                
                bestBattlefieldResult = {
                    ...battlefieldResult,
                    bestProfit: battlefieldResult.elitePerformers[0]?.expectedProfit || 0,
                    bestGenotype: battlefieldResult.elitePerformers[0]?.genotype,
                    round: round + 1
                };
            }
            
            // Track metrics
            totalMutationsApplied += evolutionSystem.metrics?.lastEvolutionMutations || 0;
            eliteGenesDiscovered += battlefieldResult.elitePerformers.length;
            
            // Evolve for next round (if not the last round)
            if (round < simulationParams.battlefieldRounds - 1) {
                await evolutionSystem.evolve();
                this.metrics.battlefieldEvolutionsPerformed++;
            }
        }
        
        // 📊 PHASE 6: CALCULATE ELITE PERFORMANCE METRICS
        const competitorProfit = decodedTx.netProfitUSD;
        const ourBestProfit = bestBattlefieldResult?.bestProfit || 0;
        const performanceDelta = ourBestProfit - competitorProfit;
        const improvementPercent = competitorProfit > 0 ? (performanceDelta / competitorProfit) * 100 : 0;

        console.log(`🏆 ELITE RESULTS: Competitor $${competitorProfit.toFixed(2)} vs Our Best $${ourBestProfit.toFixed(2)}`);
        console.log(`📈 Performance Delta: $${performanceDelta.toFixed(2)} (${improvementPercent.toFixed(2)}%)`);
        console.log(`🧬 Knowledge Applied: ${totalMutationsApplied} mutations, ${eliteGenesDiscovered} elite genes discovered`);
        
        // 🎯 PHASE 7: LIVE AGENT IMPROVEMENT (Judge Integration)
        if (options.judgeTriggered && performanceDelta > 0) {
            await this._performLiveAgentImprovement(
                bestBattlefieldResult.bestGenotype, 
                decodedTx, 
                improvementPercent,
                options.targetAgent
            );
            this.metrics.judgeTriggeredSessions++;
        }
        
        // 📊 PHASE 8: UPDATE ELITE METRICS
        this.metrics.sparringSessions++;
        this.metrics.knowledgeBasedMutationsApplied += totalMutationsApplied;
        this.metrics.eliteGenePoolUpdates += eliteGenesDiscovered;
        
        if (performanceDelta > 0) {
            this.metrics.syndicateWins++;
            this.metrics.totalProfitGained += performanceDelta;
            const prevAvgImprovement = this.metrics.averageImprovement;
            const sessionsCount = this.metrics.syndicateWins;
            this.metrics.averageImprovement = prevAvgImprovement + ((improvementPercent - prevAvgImprovement) / sessionsCount);
        } else {
            this.metrics.competitorWins++;
        }
        
        // 💾 PHASE 9: PERSIST ELITE RESULTS
        await this._persistEliteSparringResults(decodedTx, competitorProfit, ourBestProfit, 
                                              improvementPercent, bestBattlefieldResult, simulationParams);
        
        // 🏅 PHASE 10: ISSUE ELITE REWARDS
        if (this.rewardEngine && performanceDelta > 0) {
            await this._issueEliteEvolutionReward(decodedTx, performanceDelta, improvementPercent);
        }
        
        // 🔄 PHASE 11: AUTO-SUBMIT IMPROVEMENTS
        if (performanceDelta > 0 && bestBattlefieldResult.bestGenotype) {
            await this.submitImprovedGenotype(bestBattlefieldResult.bestGenotype, decodedTx, improvementPercent);
        }

        // 🎉 RETURN ELITE RESULTS
        return {
            competitorTx: decodedTx.txHash,
            chain: decodedTx.chain,
            competitorProfit,
            ourBestProfit,
            performanceDelta,
            improvementPercent,
            wasOutperformed: performanceDelta > 0,
            superiorGenotype: performanceDelta > 0 ? bestBattlefieldResult.bestGenotype : null,
            eliteMetrics: {
                battlefieldRounds: simulationParams.battlefieldRounds,
                totalMutationsApplied,
                eliteGenesDiscovered,
                bestRound: bestBattlefieldResult?.round || 0,
                eliteParticipants: bestBattlefieldResult?.competitionLevel || 0
            },
            simulationParams,
            metrics: { ...this.metrics }
        };
    }

    /**
     * 🎯 ELITE HELPER METHODS FOR BATTLEFIELD SPARRING
     */

    /**
     * Get access to the elite evolutionary system with all battlefield intelligence
     */
    async _getEliteEvolutionarySystem() {
        // Try direct reference first
        if (this.evolutionarySystem) {
            return this.evolutionarySystem;
        }
        
        // Try service registry paths
        const searchPaths = [
            () => this.factory?.serviceRegistry?.alphaGnomeEvolution,
            () => this.factory?.orchestrator?.serviceRegistry?.alphaGnomeEvolution,
            () => global.syndicate?.serviceRegistry?.alphaGnomeEvolution,
            () => global.evolutionSystem
        ];
        
        for (const getSystem of searchPaths) {
            try {
                const system = getSystem();
                if (system && system.conductBattlefieldEvaluation) {
                    console.log('🎯 Found elite evolutionary system with battlefield capabilities');
                    this.evolutionarySystem = system; // Cache for future use
                    return system;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.error('🚫 Cannot find AlphaGnomeEvolutionarySystem with battlefield evaluation');
        return null;
    }

    /**
     * Inject competitor genotype into the elite population for direct competition
     */
    async _injectCompetitorGenotypeIntoPopulation(evolutionSystem, competitorGenotype, decodedTx) {
        try {
            // Create a competitor individual with elite marking
            const competitorIndividual = {
                id: `competitor-${decodedTx.txHash}-${Date.now()}`,
                genotype: competitorGenotype,
                fitness: decodedTx.netProfitUSD,
                generation: evolutionSystem.currentGeneration || 0,
                source: 'competitor_injection',
                originalTxHash: decodedTx.txHash,
                isCompetitorDNA: true
            };
            
            // Add to population for direct competition
            if (evolutionSystem.population && Array.isArray(evolutionSystem.population)) {
                evolutionSystem.population.push(competitorIndividual);
            } else if (evolutionSystem.population && evolutionSystem.population.set) {
                evolutionSystem.population.set(competitorIndividual.id, competitorIndividual);
            }
            
            console.log(`🧬 Injected competitor DNA from ${decodedTx.txHash} into elite population`);
            console.log(`💰 Competitor baseline: $${decodedTx.netProfitUSD.toFixed(2)} profit`);
            
        } catch (error) {
            console.warn('⚠️ Failed to inject competitor genotype:', error.message);
        }
    }

    /**
     * Perform live agent improvement based on sparring results
     */
    async _performLiveAgentImprovement(superiorGenotype, decodedTx, improvementPercent, targetAgent) {
        try {
            console.log(`🚀 LIVE AGENT IMPROVEMENT: ${improvementPercent.toFixed(2)}% improvement detected`);
            
            // Check improvement threshold and rate limits
            if (improvementPercent < this.judgeIntegration.improvementThreshold * 100) {
                console.log(`📊 Improvement below threshold (${this.judgeIntegration.improvementThreshold * 100}%), skipping live update`);
                return false;
            }
            
            const now = Date.now();
            const hoursSinceLastUpdate = (now - this.judgeIntegration.lastUpdateTime) / (1000 * 60 * 60);
            
            if (hoursSinceLastUpdate < 1 && this.metrics.liveAgentImprovements >= this.judgeIntegration.maxLiveUpdatesPerHour) {
                console.log(`⏰ Rate limit reached (${this.judgeIntegration.maxLiveUpdatesPerHour}/hour), queuing improvement`);
                return false;
            }
            
            // Update agent performance tracking
            if (!this.liveAgentTracker.has(targetAgent)) {
                this.liveAgentTracker.set(targetAgent, {
                    improvements: [],
                    totalImprovement: 0,
                    lastUpdateTime: 0
                });
            }
            
            const agentHistory = this.liveAgentTracker.get(targetAgent);
            agentHistory.improvements.push({
                timestamp: now,
                improvementPercent,
                txHash: decodedTx.txHash,
                genotype: superiorGenotype
            });
            agentHistory.totalImprovement += improvementPercent;
            agentHistory.lastUpdateTime = now;
            
            // Apply live improvement to the agent (if we have access)
            if (this.factory && this.factory.getAgent) {
                try {
                    const agent = await this.factory.getAgent(targetAgent);
                    if (agent && agent.updateGenotype) {
                        await agent.updateGenotype(superiorGenotype, {
                            source: 'live_sparring_improvement',
                            improvement: improvementPercent,
                            txHash: decodedTx.txHash
                        });
                        console.log(`✅ Live genotype update applied to agent ${targetAgent}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to apply live update to agent ${targetAgent}:`, error.message);
                }
            }
            
            this.metrics.liveAgentImprovements++;
            this.judgeIntegration.lastUpdateTime = now;
            
            console.log(`🎯 Live agent improvement complete: ${targetAgent} enhanced by ${improvementPercent.toFixed(2)}%`);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to perform live agent improvement:', error);
            return false;
        }
    }

    /**
     * Enhanced elite sparring intensity calculation
     */
    determineEliteSparringIntensity(decodedTx, options = {}) {
        const { netProfitUSD, gasStrategy, path, chain } = decodedTx;
        
        // Base intensity calculation
        const profitScore = this._normalize(netProfitUSD, 50000); // Higher threshold for elite
        const priorityFeeGwei = parseFloat(gasStrategy?.priorityFeeGwei || 0);
        const gasAggressivenessScore = this._normalize(priorityFeeGwei, 100); // Higher threshold
        
        const pathComplexity = path?.length || 1;
        const strategicDexes = ['UniswapV3', 'Curve', 'Balancer', 'SushiSwap', '1inch'];
        const involvesStrategicDex = path?.some(p => strategicDexes.includes(p.dex)) || false;
        const pathScore = this._normalize(pathComplexity, 8) * (involvesStrategicDex ? 2.0 : 1.0);
        
        // Judge-triggered sessions get extra intensity
        const judgeBonus = options.judgeTriggered ? 0.5 : 0;
        
        // Elite intensity score calculation
        const intensityScore = (profitScore * 0.4) + (gasAggressivenessScore * 0.3) + 
                             (pathScore * 0.2) + (judgeBonus * 0.1);
        
        if (intensityScore > 0.9 || options.judgeTriggered) {
            return { 
                battlefieldRounds: 15, 
                reason: 'LEGENDARY Elite Opportunity (Judge-Triggered or Exceptional)' 
            };
        }
        if (intensityScore > 0.8) {
            return { 
                battlefieldRounds: 12, 
                reason: 'ELITE Competitor Opportunity' 
            };
        }
        if (intensityScore > 0.6) {
            return { 
                battlefieldRounds: 8, 
                reason: 'HIGH_VALUE Elite Competitor' 
            };
        }
        if (intensityScore > 0.4) {
            return { 
                battlefieldRounds: 5, 
                reason: 'SIGNIFICANT Elite Competition' 
            };
        }
        if (intensityScore > 0.2) {
            return { 
                battlefieldRounds: 3, 
                reason: 'STANDARD Elite Training' 
            };
        }
        return { 
            battlefieldRounds: 2, 
            reason: 'MINOR Elite Exercise' 
        };
    }

    /**
     * Persist elite sparring results with enhanced metadata
     */
    async _persistEliteSparringResults(decodedTx, competitorProfit, ourBestProfit, 
                                     improvementPercent, battlefieldResult, simulationParams) {
        if (!this.dbPool) return;
        
        try {
            const client = await this.dbPool.connect();
            try {
                // Enhanced results with elite metrics
                    await client.query(`
                        INSERT INTO sparring_sessions (
                            tx_hash, chain, competitor_profit, syndicate_profit,
                            improvement_pct, winning_genotype, simulation_params
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                    `, [
                        decodedTx.txHash,
                        decodedTx.chain,
                        competitorProfit,
                        ourBestProfit,
                        improvementPercent,
                    ourBestProfit > competitorProfit ? JSON.stringify(battlefieldResult?.bestGenotype) : null,
                    JSON.stringify({
                        ...simulationParams,
                        eliteMetrics: {
                            battlefieldRounds: simulationParams.battlefieldRounds,
                            eliteParticipants: battlefieldResult?.competitionLevel || 0,
                            bestRound: battlefieldResult?.round || 0
                        }
                    })
                ]);
                
                console.log(`💾 Elite sparring results persisted for ${decodedTx.txHash}`);
                } finally {
                    client.release();
                }
            } catch (error) {
            console.error('❌ Failed to persist elite sparring results:', error);
        }
    }

    /**
     * Issue elite evolution rewards with enhanced proof
     */
    async _issueEliteEvolutionReward(decodedTx, performanceDelta, improvementPercent) {
        try {
            await this.rewardEngine.applyReward('elite-evolution-system', {
                type: 'ELITE_LEARNING_BREAKTHROUGH',
                amount: Math.min(10.0, performanceDelta / 50), // Higher cap for elite
                reason: `Elite battlefield evolution outperformed competitor on ${decodedTx.chain} by ${improvementPercent.toFixed(2)}% using knowledge-based mutations`,
                    proof: {
                        txHash: decodedTx.txHash,
                        blockNumber: decodedTx.blockNumber,
                        valueImprovement: performanceDelta,
                    verificationMethod: 'elite_battlefield_evaluation',
                    eliteFeatures: [
                        'knowledge_based_mutations',
                        'battlefield_competition',
                        'profit_correlation_analysis',
                        'elite_gene_mixing'
                    ]
                }
            });
            
            console.log(`🏅 Elite evolution reward issued: $${(performanceDelta / 50).toFixed(2)}`);
            
            } catch (error) {
            console.error('❌ Failed to issue elite evolution reward:', error);
        }
    }

    /**
     * OLD METHOD - kept for backward compatibility but enhanced
     */
    determineSimulationIntensity(decodedTx) {
        const { netProfitUSD, gasStrategy, path, chain } = decodedTx;
        
        // Factor 1: Raw Profitability Score (0-1)
        const profitScore = this._normalize(netProfitUSD, 20000); // Normalize against a high profit of $20k

        // Factor 2: Gas Strategy Aggressiveness (0-1)
        // A high priority fee indicates a highly competitive, time-sensitive opportunity.
        const priorityFeeGwei = parseFloat(gasStrategy.priorityFeeGwei || 0);
        const gasAggressivenessScore = this._normalize(priorityFeeGwei, 50); // Normalize against a high 50 Gwei priority fee

        // Factor 3: Strategic Importance of the Path (0-1)
        // More complex paths or paths involving high-value DEXes are more important to study.
        const pathComplexity = path.length;
        const strategicDexes = ['UniswapV3', 'Curve', 'Balancer'];
        const involvesStrategicDex = path.some(p => strategicDexes.includes(p.dex));
        const pathScore = this._normalize(pathComplexity, 5) * (involvesStrategicDex ? 1.5 : 1);

        // --- Final Weighted Intensity Score ---
        const intensityScore = (profitScore * 0.5) + (gasAggressivenessScore * 0.3) + (pathScore * 0.2);

        if (intensityScore > 0.8) { 
            return { populationSize: 250, generations: 120, reason: 'ELITE Competitor Opportunity' };
        }
        if (intensityScore > 0.6) {
            return { populationSize: 150, generations: 80, reason: 'HIGH_VALUE Competitor Opportunity' };
        }
        if (intensityScore > 0.4) {
            return { populationSize: 100, generations: 50, reason: 'SIGNIFICANT Competitor Opportunity' };
        }
        if (intensityScore > 0.2) {
            return { populationSize: 50, generations: 30, reason: 'STANDARD Competitor Opportunity' };
        }
        return { populationSize: 30, generations: 20, reason: 'MINOR Competitor Opportunity' };
    }

    _normalize(value, max) {
        return Math.max(0, Math.min(1, value / max));
    }
    
    /**
     * Automatically submit improved genotypes to the evolutionary system
     * This ensures ALL gymnasium improvements are integrated, not just those from JudgeService
     * 
     * @param {Object} genotype - The superior genotype discovered during sparring
     * @param {Object} decodedTx - The transaction context that was analyzed
     * @param {number} improvementPercent - The percentage improvement over the competitor
     * @returns {Promise<boolean>} - Whether the submission was successful
     */
    async submitImprovedGenotype(genotype, decodedTx, improvementPercent) {
        try {
            // Get access to the AlphaGnomeEvolutionarySystem - try multiple paths
            let evolutionSystem = null;
            
            // First check if we have it through service registry (via factory)
            if (this.factory && this.factory.serviceRegistry && this.factory.serviceRegistry.alphaGnomeEvolution) {
                evolutionSystem = this.factory.serviceRegistry.alphaGnomeEvolution;
            }
            
            // If not found, try to get from orchestrator
            if (!evolutionSystem && this.factory && this.factory.orchestrator && 
                this.factory.orchestrator.serviceRegistry && 
                this.factory.orchestrator.serviceRegistry.alphaGnomeEvolution) {
                evolutionSystem = this.factory.orchestrator.serviceRegistry.alphaGnomeEvolution;
            }
            
            // If still not found, check if available globally
            if (!evolutionSystem && global.syndicate && global.syndicate.serviceRegistry && 
                global.syndicate.serviceRegistry.alphaGnomeEvolution) {
                evolutionSystem = global.syndicate.serviceRegistry.alphaGnomeEvolution;
            }
            
            // If we found the evolutionary system, submit the improvement
            if (evolutionSystem && evolutionSystem.integrateImprovedGenotype) {
                // Submit the improved genotype
                const improvementDetails = {
                    source: 'gymnasium_sparring',
                    txHash: decodedTx.txHash,
                    chain: decodedTx.chain,
                    improvementPercent,
                    originalProfit: decodedTx.netProfitUSD,
                    improvedProfit: decodedTx.netProfitUSD * (1 + improvementPercent/100),
                    timestamp: new Date().toISOString()
                };
                
                await evolutionSystem.integrateImprovedGenotype(
                    genotype,
                    'gymnasium-discovery', // Gymnasium as the agent ID
                    'sparring_session',
                    improvementDetails
                );
                
                this.logger.log(`🧬 Successfully submitted improved genotype to AlphaGnomeEvolutionarySystem from gymnasium`);
                return true;
            } else {
                this.logger.warn(`⚠️ Could not find AlphaGnomeEvolutionarySystem to submit improved genotype`);
                
                // Store for later retrieval if we can't submit now
                await this.storePendingGenotype(genotype, decodedTx, improvementPercent);
                return false;
            }
        } catch (error) {
            this.logger.error('❌ Failed to submit improved genotype to evolutionary system:', error);
            return false;
        }
    }
    
    /**
     * Store a pending genotype for later integration
     * This acts as a backup if direct submission fails
     */
    async storePendingGenotype(genotype, decodedTx, improvementPercent) {
        if (!this.dbPool) return;
        
        try {
            const client = await this.dbPool.connect();
            try {
                // Create table if not exists
                await client.query(`
                    CREATE TABLE IF NOT EXISTS pending_genotype_improvements (
                        id SERIAL PRIMARY KEY,
                        tx_hash VARCHAR(66) NOT NULL,
                        chain VARCHAR(32) NOT NULL,
                        genotype JSONB NOT NULL,
                        improvement_pct DECIMAL(10,2) NOT NULL,
                        processed BOOLEAN DEFAULT FALSE,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                `);
                
                // Store the pending genotype
                await client.query(`
                    INSERT INTO pending_genotype_improvements (
                        tx_hash, chain, genotype, improvement_pct
                    ) VALUES ($1, $2, $3, $4)
                `, [
                    decodedTx.txHash,
                    decodedTx.chain,
                    JSON.stringify(genotype),
                    improvementPercent
                ]);
                
                this.logger.log(`📝 Stored pending genotype improvement for later processing`);
            } finally {
                client.release();
            }
        } catch (error) {
            this.logger.error('❌ Failed to store pending genotype:', error);
        }
    }

    /**
     * 🎯 JUDGE-TRIGGERED ELITE SPARRING SESSION
     * 
     * Special method for the Judge to trigger immediate sparring sessions
     * when an agent needs live improvement based on poor performance
     * 
     * @param {string} agentId - The agent that needs improvement
     * @param {object} recentTransaction - Recent transaction the agent performed poorly on
     * @param {object} competitorGenotype - Superior competitor genotype to learn from
     * @param {object} options - Additional options for the sparring session
     * @returns {Promise<object>} The results of the judge-triggered sparring
     */
    async runJudgeTriggeredSparring(agentId, recentTransaction, competitorGenotype, options = {}) {
        console.log(`⚖️ JUDGE-TRIGGERED SPARRING: Improving agent ${agentId}`);
        console.log(`🎯 Target improvement for transaction: ${recentTransaction.txHash}`);
        
        try {
            // Mark this as a judge-triggered session for maximum intensity
            const judgeOptions = {
                ...options,
                judgeTriggered: true,
                targetAgent: agentId,
                urgency: options.urgency || 'high',
                maxBattlefieldRounds: 20 // Override for judge sessions
            };
            
            // Run the elite sparring session with judge priority
            const sparringResult = await this.runSparringSession(
                recentTransaction, 
                competitorGenotype, 
                judgeOptions
            );
            
            // Enhanced result for judge feedback
            const judgeResult = {
                ...sparringResult,
                judgeTriggered: true,
                targetAgent: agentId,
                liveImprovementApplied: sparringResult.eliteMetrics?.liveImprovementApplied || false,
                recommendedActions: this._generateJudgeRecommendations(sparringResult),
                agentPerformanceHistory: this.liveAgentTracker.get(agentId) || null
            };
            
            console.log(`⚖️ JUDGE SPARRING COMPLETE: ${sparringResult.improvementPercent.toFixed(2)}% improvement achieved`);
            
            return judgeResult;
            
        } catch (error) {
            console.error('❌ Judge-triggered sparring failed:', error);
            return {
                success: false,
                error: error.message,
                agentId,
                targetTransaction: recentTransaction.txHash
            };
        }
    }

    /**
     * Generate recommendations for the Judge based on sparring results
     */
    _generateJudgeRecommendations(sparringResult) {
        const recommendations = [];
        
        if (sparringResult.improvementPercent > 20) {
            recommendations.push({
                type: 'MAJOR_BREAKTHROUGH',
                priority: 'HIGH',
                action: 'Apply genotype immediately to all similar agents',
                reason: `Exceptional ${sparringResult.improvementPercent.toFixed(2)}% improvement detected`
            });
        } else if (sparringResult.improvementPercent > 10) {
            recommendations.push({
                type: 'SIGNIFICANT_IMPROVEMENT',
                priority: 'MEDIUM',
                action: 'Schedule gradual rollout to agent population',
                reason: `Strong ${sparringResult.improvementPercent.toFixed(2)}% improvement with low risk`
            });
        } else if (sparringResult.improvementPercent > 5) {
            recommendations.push({
                type: 'INCREMENTAL_IMPROVEMENT',
                priority: 'LOW',
                action: 'Monitor performance before wider application',
                reason: `Modest ${sparringResult.improvementPercent.toFixed(2)}% improvement requires validation`
            });
        } else {
            recommendations.push({
                type: 'INSUFFICIENT_IMPROVEMENT',
                priority: 'REVIEW',
                action: 'Analyze competitor strategy more deeply',
                reason: 'Limited improvement suggests need for different approach'
            });
        }
        
        // Performance-based recommendations
        if (sparringResult.eliteMetrics?.totalMutationsApplied > 50) {
            recommendations.push({
                type: 'HIGH_MUTATION_ACTIVITY',
                priority: 'INFO',
                action: 'Review mutation patterns for optimization',
                reason: 'High mutation activity indicates active learning'
            });
        }
        
        if (sparringResult.eliteMetrics?.eliteGenesDiscovered > 10) {
            recommendations.push({
                type: 'GENE_DISCOVERY',
                priority: 'MEDIUM',
                action: 'Propagate discovered elite genes to population',
                reason: 'Multiple elite genes discovered - propagation recommended'
            });
        }
        
        return recommendations;
    }

    /**
     * Get live agent performance metrics for judge evaluation
     */
    getLiveAgentMetrics(agentId) {
        const agentHistory = this.liveAgentTracker.get(agentId);
        if (!agentHistory) {
            return {
                agentId,
                hasHistory: false,
                totalImprovements: 0,
                averageImprovement: 0,
                lastUpdateTime: null
            };
        }
        
        const avgImprovement = agentHistory.improvements.length > 0 ? 
            agentHistory.improvements.reduce((sum, imp) => sum + imp.improvementPercent, 0) / 
            agentHistory.improvements.length : 0;
        
        return {
            agentId,
            hasHistory: true,
            totalImprovements: agentHistory.improvements.length,
            averageImprovement: avgImprovement,
            totalImprovement: agentHistory.totalImprovement,
            lastUpdateTime: agentHistory.lastUpdateTime,
            recentImprovements: agentHistory.improvements.slice(-5), // Last 5 improvements
            improvementTrend: this._calculateImprovementTrend(agentHistory.improvements)
        };
    }

    /**
     * Calculate improvement trend for agent performance analysis
     */
    _calculateImprovementTrend(improvements) {
        if (improvements.length < 3) return 'insufficient_data';
        
        const recent = improvements.slice(-3);
        const older = improvements.slice(-6, -3);
        
        if (older.length === 0) return 'insufficient_data';
        
        const recentAvg = recent.reduce((sum, imp) => sum + imp.improvementPercent, 0) / recent.length;
        const olderAvg = older.reduce((sum, imp) => sum + imp.improvementPercent, 0) / older.length;
        
        const trendChange = ((recentAvg - olderAvg) / olderAvg) * 100;
        
        if (trendChange > 20) return 'strongly_improving';
        if (trendChange > 5) return 'improving';
        if (trendChange > -5) return 'stable';
        if (trendChange > -20) return 'declining';
        return 'strongly_declining';
    }
}

export { AlphaGnomeSparringService };
