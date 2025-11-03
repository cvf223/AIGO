/**
 * 🥊 ELITE CONSTRUCTION SPARRING SERVICE - TOP 1% EXPERT IMPLEMENTATION
 * ===================================================================
 *
 * LIVE AGENT IMPROVEMENT SYSTEM for Construction Plan Analysis Excellence!
 * 
 * This is an ELITE high-intensity training service that conducts analysis
 * sparring sessions between construction agents. Uses the complete
 * KNOWLEDGE-BASED EVOLUTION SYSTEM with:
 * 
 * ✅ Battlefield evaluation with ALL agents competing on same plan analysis
 * ✅ Knowledge-based intelligent mutations for pattern recognition
 * ✅ Elite strategy pool integration for superior analysis
 * ✅ Live agent improvement for real-time accuracy enhancement
 * ✅ Judge-driven feedback loops for immediate performance gains
 * ✅ Accuracy-focused fitness optimization with construction-specific algorithms
 * 
 * ELITE TRUTH: Every sparring session makes our agents SMARTER at detecting errors,
 * extracting quantities, and generating high-quality solutions!
 * 
 * @author Elite Construction AI Syndicate
 * @version 2.0.0 - Construction Analysis Edition
 */

import { EventEmitter } from 'events';
import { AlphaGnomeEvolutionarySystem } from '../../learning/AlphaGnomeEvolutionarySystem.js';
import { ConstructionStateService } from './services/ConstructionStateService.js';
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

export class ConstructionSparringService extends EventEmitter {
    constructor(dependencies = {}) {
        super();
        
        // Extract essential dependencies
        this.constructionState = dependencies.constructionStateService || 
                                dependencies.blockReplaySystem || // Backward compatibility
                                new ConstructionStateService();
        
        // 🎯 ELITE EVOLUTIONARY SYSTEM CONNECTION
        this.evolutionarySystem = dependencies.alphaGnomeEvolution;
        if (!this.evolutionarySystem) {
            console.warn('⚠️ No AlphaGnomeEvolutionarySystem provided - will try to find via service registry');
        }
        
        // Factory for agent creation
        this.factory = dependencies.factory;
        if (!this.factory) {
            console.warn('⚠️ No factory provided. Agent creation will be unavailable.');
        }
        
        // World model for pattern prediction
        this.worldModel = dependencies.worldModel || 
                         dependencies.services?.worldModel;
        
        if (!this.worldModel) {
            console.warn('⚠️ No worldModel provided. Pattern prediction will be limited.');
        }
        
        // Database and persistence
        this.dbPool = dependencies.dbPool || dependencies.database;
        this.persistenceEngine = new EliteMemoryPersistenceEngine({
            namespace: 'construction_sparring'
        });
        
        // Reward engine for performance tracking
        this.rewardEngine = dependencies.rewardEngine || 
                           dependencies.services?.rewardPenaltyEngine;
        
        // 🏆 CONSTRUCTION SPARRING METRICS
        this.metrics = {
            sparringSessions: 0,
            competitorWins: 0,
            syndicateWins: 0,
            averageImprovement: 0,
            totalAccuracyGained: 0,
            
            // Construction-specific elite metrics
            errorDetectionImprovements: 0,
            quantityExtractionImprovements: 0,
            complianceCheckImprovements: 0,
            solutionQualityImprovements: 0,
            
            // Evolution metrics
            liveAgentImprovements: 0,
            judgeTriggeredSessions: 0,
            battlefieldEvolutionsPerformed: 0,
            knowledgeBasedMutationsApplied: 0,
            eliteStrategyPoolUpdates: 0,
            
            // Performance tracking
            bestErrorDetectionAccuracy: 0,
            bestQuantityAccuracy: 0,
            bestComplianceScore: 0,
            bestSolutionQuality: 0
        };
        
        // 🧠 LIVE AGENT IMPROVEMENT SYSTEM
        this.liveAgentTracker = new Map(); // Agent ID -> Performance History
        this.strategyCache = new Map(); // Strategy patterns for quick lookup
        this.solutionPatterns = new Map(); // Error type -> Solution patterns
        
        // Initialize subsystems
        this.initialize();
    }
    
    /**
     * 🚀 INITIALIZE SUBSYSTEMS
     */
    async initialize() {
        console.log('🚀 Initializing Construction Sparring Service...');
        
        await this.persistenceEngine.initialize();
        
        // Load historical sparring results
        await this.loadHistoricalResults();
        
        console.log('✅ Construction Sparring Service initialized');
    }
    
    /**
     * 🏟️ ELITE CONSTRUCTION ANALYSIS SPARRING SESSION
     * 
     * Conducts high-intensity analysis competitions between agents
     * to improve plan error detection, quantity extraction, and solution generation
     * 
     * @param {object} analysisChallenge - The construction analysis challenge
     * @param {object} competitorStrategy - The baseline strategy to compete against
     * @param {object} options - Sparring configuration options
     * @returns {Promise<object>} Sparring results with improvements
     */
    async runSparringSession(analysisChallenge, competitorStrategy, options = {}) {
        const startTime = Date.now();
        
        console.log('🏟️ ELITE CONSTRUCTION SPARRING SESSION INITIATED');
        console.log(`📐 Challenge: ${analysisChallenge.type} for ${analysisChallenge.planId}`);
        console.log(`🎯 Baseline Accuracy: ${competitorStrategy.accuracy?.toFixed(2) || 'Unknown'}%`);
        
        try {
            // 🎯 PHASE 1: ACCESS EVOLUTIONARY SYSTEM
            const evolutionSystem = await this._getEvolutionarySystem();
            if (!evolutionSystem) {
                throw new Error('Cannot run sparring without AlphaGnomeEvolutionarySystem');
            }
            
            // 🏆 PHASE 2: DETERMINE SPARRING INTENSITY
            const sparringParams = this.determineSparringIntensity(analysisChallenge, options);
            console.log(`🔥 Sparring Intensity: ${sparringParams.rounds} rounds - ${sparringParams.reason}`);
            
            // 🏗️ PHASE 3: LOAD CONSTRUCTION CONTEXT
            const constructionContext = await this._loadConstructionContext(analysisChallenge);
            
            // 🧬 PHASE 4: INJECT COMPETITOR STRATEGY
            await this._injectCompetitorStrategy(evolutionSystem, competitorStrategy, analysisChallenge);
            
            // ⚔️ PHASE 5: CONDUCT BATTLEFIELD EVALUATION
            const battleResults = await this._conductBattlefield(
                evolutionSystem,
                analysisChallenge,
                constructionContext,
                sparringParams
            );
            
            // 📊 PHASE 6: CALCULATE PERFORMANCE METRICS
            const performanceMetrics = this._calculatePerformanceMetrics(
                competitorStrategy,
                battleResults
            );
            
            // 🎯 PHASE 7: LIVE AGENT IMPROVEMENT
            if (options.enableLiveImprovement && performanceMetrics.improvement > 0) {
                await this._performLiveAgentImprovement(
                    battleResults.bestStrategy,
                    analysisChallenge,
                    performanceMetrics,
                    options.targetAgent
                );
            }
            
            // 📈 PHASE 8: UPDATE METRICS
            this._updateMetrics(performanceMetrics);
            
            // 💾 PHASE 9: PERSIST RESULTS
            await this._persistSparringResults(
                analysisChallenge,
                competitorStrategy,
                battleResults,
                performanceMetrics
            );
            
            // 🏅 PHASE 10: ISSUE REWARDS
            if (this.rewardEngine && performanceMetrics.improvement > 0) {
                await this._issuePerformanceReward(performanceMetrics);
            }
            
            return {
                success: true,
                challenge: analysisChallenge.type,
                planId: analysisChallenge.planId,
                baselineAccuracy: competitorStrategy.accuracy || 0,
                achievedAccuracy: battleResults.bestAccuracy,
                improvement: performanceMetrics.improvement,
                improvementPercent: performanceMetrics.improvementPercent,
                rounds: sparringParams.rounds,
                bestStrategy: battleResults.bestStrategy,
                solutions: battleResults.bestSolutions,
                duration: Date.now() - startTime,
                metrics: {
                    errorDetection: battleResults.errorDetectionScore,
                    quantityExtraction: battleResults.quantityScore,
                    compliance: battleResults.complianceScore,
                    solutionQuality: battleResults.solutionQuality
                }
            };
            
        } catch (error) {
            console.error('❌ Sparring session failed:', error);
            
            return {
                success: false,
                error: error.message,
                challenge: analysisChallenge.type,
                duration: Date.now() - startTime
            };
        }
    }
    
    /**
     * 🔥 DETERMINE SPARRING INTENSITY
     */
    determineSparringIntensity(analysisChallenge, options = {}) {
        let intensity = 'MEDIUM';
        let rounds = 5;
        let reason = 'Standard sparring session';
        
        // Factor 1: Challenge complexity
        if (analysisChallenge.complexity === 'high' || analysisChallenge.planCount > 20) {
            rounds += 5;
            intensity = 'HIGH';
            reason = 'Complex multi-plan analysis';
        }
        
        // Factor 2: Error criticality
        if (analysisChallenge.criticalErrors > 0) {
            rounds += 3;
            reason = 'Critical errors detected';
        }
        
        // Factor 3: Judge-triggered session
        if (options.judgeTriggered) {
            rounds = Math.max(rounds, 10);
            intensity = 'EXTREME';
            reason = 'Judge-triggered improvement session';
        }
        
        // Factor 4: Historical performance
        const historicalAccuracy = this._getHistoricalAccuracy(analysisChallenge.type);
        if (historicalAccuracy < 0.8) {
            rounds += 2;
            reason = 'Below target accuracy threshold';
        }
        
        return {
            intensity,
            rounds: Math.min(rounds, 20), // Cap at 20 rounds
            reason,
            factors: {
                complexity: analysisChallenge.complexity,
                criticalErrors: analysisChallenge.criticalErrors,
                judgeTriggered: options.judgeTriggered || false,
                historicalAccuracy
            }
        };
    }
    
    /**
     * 🏗️ LOAD CONSTRUCTION CONTEXT
     */
    async _loadConstructionContext(analysisChallenge) {
        const context = {
            projectId: analysisChallenge.projectId,
            planId: analysisChallenge.planId,
            planType: analysisChallenge.planType,
            hoaiPhase: analysisChallenge.hoaiPhase || 'LP6',
            
            // Load relevant patterns
            errorPatterns: await this._loadErrorPatterns(analysisChallenge.planType),
            quantityPatterns: await this._loadQuantityPatterns(analysisChallenge.planType),
            complianceRules: await this._loadComplianceRules(analysisChallenge.hoaiPhase),
            
            // Historical context
            previousAnalyses: await this._loadPreviousAnalyses(analysisChallenge.projectId),
            similarProjects: await this._loadSimilarProjects(analysisChallenge)
        };
        
        return context;
    }
    
    /**
     * 🧬 INJECT COMPETITOR STRATEGY INTO POPULATION
     */
    async _injectCompetitorStrategy(evolutionSystem, competitorStrategy, analysisChallenge) {
        const strategyGenotype = {
            id: `competitor-${analysisChallenge.planId}-${Date.now()}`,
            strategy: competitorStrategy,
            fitness: competitorStrategy.accuracy || 0.5,
            source: 'competitor_injection',
            challengeType: analysisChallenge.type,
            patterns: {
                errorDetection: competitorStrategy.errorPatterns || [],
                quantityExtraction: competitorStrategy.quantityMethods || [],
                compliance: competitorStrategy.complianceChecks || []
            }
        };
        
        // Inject into evolutionary population
        if (evolutionSystem.injectGenotype) {
            await evolutionSystem.injectGenotype(strategyGenotype);
        }
        
        console.log('🧬 Competitor strategy injected into population');
    }
    
    /**
     * ⚔️ CONDUCT BATTLEFIELD EVALUATION
     */
    async _conductBattlefield(evolutionSystem, challenge, context, params) {
        let bestResult = null;
        let totalMutations = 0;
        let eliteStrategies = 0;
        
        for (let round = 1; round <= params.rounds; round++) {
            console.log(`⚔️ Battle Round ${round}/${params.rounds}`);
            
            // Conduct evaluation
            const roundResult = await this._evaluateStrategies(
                evolutionSystem,
                challenge,
                context
            );
            
            // Track best result
            if (!bestResult || roundResult.topScore > bestResult.bestAccuracy) {
                bestResult = {
                    bestAccuracy: roundResult.topScore,
                    bestStrategy: roundResult.topStrategy,
                    bestSolutions: roundResult.topSolutions,
                    errorDetectionScore: roundResult.metrics.errorDetection,
                    quantityScore: roundResult.metrics.quantityExtraction,
                    complianceScore: roundResult.metrics.compliance,
                    solutionQuality: roundResult.metrics.solutionQuality,
                    round: round
                };
            }
            
            // Track evolution metrics
            totalMutations += roundResult.mutations || 0;
            eliteStrategies += roundResult.eliteCount || 0;
            
            // Evolve for next round (except last)
            if (round < params.rounds) {
                await evolutionSystem.evolve();
                this.metrics.battlefieldEvolutionsPerformed++;
            }
        }
        
        console.log(`🏆 Best accuracy: ${bestResult.bestAccuracy.toFixed(2)}% (Round ${bestResult.round})`);
        
        return {
            ...bestResult,
            totalMutations,
            eliteStrategies
        };
    }
    
    /**
     * 📊 EVALUATE STRATEGIES
     */
    async _evaluateStrategies(evolutionSystem, challenge, context) {
        const population = evolutionSystem.getPopulation ? 
                         await evolutionSystem.getPopulation() : 
                         [];
        
        const evaluations = [];
        
        for (const individual of population) {
            const evaluation = await this._evaluateIndividual(
                individual,
                challenge,
                context
            );
            evaluations.push(evaluation);
        }
        
        // Sort by fitness
        evaluations.sort((a, b) => b.score - a.score);
        
        // Get top performer
        const topPerformer = evaluations[0] || {
            score: 0,
            strategy: {},
            solutions: []
        };
        
        return {
            topScore: topPerformer.score,
            topStrategy: topPerformer.strategy,
            topSolutions: topPerformer.solutions,
            metrics: topPerformer.metrics || {},
            mutations: evolutionSystem.getLastMutationCount ? 
                      evolutionSystem.getLastMutationCount() : 0,
            eliteCount: evaluations.filter(e => e.score > 0.9).length
        };
    }
    
    /**
     * 🎯 EVALUATE INDIVIDUAL STRATEGY
     */
    async _evaluateIndividual(individual, challenge, context) {
        const metrics = {
            errorDetection: 0,
            quantityExtraction: 0,
            compliance: 0,
            solutionQuality: 0
        };
        
        // Evaluate error detection capability
        if (challenge.type === 'error_detection' || challenge.type === 'comprehensive') {
            metrics.errorDetection = await this._evaluateErrorDetection(
                individual.strategy,
                challenge,
                context
            );
        }
        
        // Evaluate quantity extraction
        if (challenge.type === 'quantity_extraction' || challenge.type === 'comprehensive') {
            metrics.quantityExtraction = await this._evaluateQuantityExtraction(
                individual.strategy,
                challenge,
                context
            );
        }
        
        // Evaluate compliance checking
        if (challenge.type === 'compliance' || challenge.type === 'comprehensive') {
            metrics.compliance = await this._evaluateCompliance(
                individual.strategy,
                challenge,
                context
            );
        }
        
        // Generate and evaluate solutions
        const solutions = await this._generateSolutions(
            individual.strategy,
            challenge,
            context
        );
        
        metrics.solutionQuality = this._evaluateSolutionQuality(solutions);
        
        // Calculate overall score
        const weights = {
            errorDetection: 0.3,
            quantityExtraction: 0.25,
            compliance: 0.25,
            solutionQuality: 0.2
        };
        
        const score = Object.entries(metrics).reduce((sum, [key, value]) => {
            return sum + (value * (weights[key] || 0.25));
        }, 0);
        
        return {
            individual,
            score,
            strategy: individual.strategy,
            solutions,
            metrics
        };
    }
    
    /**
     * 🔍 EVALUATE ERROR DETECTION
     */
    async _evaluateErrorDetection(strategy, challenge, context) {
        if (!challenge.testErrors || challenge.testErrors.length === 0) {
            return 0.5; // No test data
        }
        
        let correctDetections = 0;
        let falsePositives = 0;
        let falseNegatives = 0;
        
        for (const testError of challenge.testErrors) {
            const detected = await this._applyErrorDetectionStrategy(
                strategy,
                testError,
                context
            );
            
            if (detected && testError.isError) {
                correctDetections++;
            } else if (detected && !testError.isError) {
                falsePositives++;
            } else if (!detected && testError.isError) {
                falseNegatives++;
            }
        }
        
        // Calculate F1 score
        const precision = correctDetections / (correctDetections + falsePositives || 1);
        const recall = correctDetections / (correctDetections + falseNegatives || 1);
        const f1Score = 2 * (precision * recall) / (precision + recall || 1);
        
        return f1Score;
    }
    
    /**
     * 📊 EVALUATE QUANTITY EXTRACTION
     */
    async _evaluateQuantityExtraction(strategy, challenge, context) {
        if (!challenge.testQuantities || challenge.testQuantities.length === 0) {
            return 0.5;
        }
        
        let totalAccuracy = 0;
        
        for (const testQuantity of challenge.testQuantities) {
            const extracted = await this._applyQuantityStrategy(
                strategy,
                testQuantity,
                context
            );
            
            if (extracted && testQuantity.actual) {
                const accuracy = 1 - Math.abs(extracted - testQuantity.actual) / testQuantity.actual;
                totalAccuracy += Math.max(0, accuracy);
            }
        }
        
        return totalAccuracy / challenge.testQuantities.length;
    }
    
    /**
     * ✅ EVALUATE COMPLIANCE
     */
    async _evaluateCompliance(strategy, challenge, context) {
        if (!challenge.complianceTests || challenge.complianceTests.length === 0) {
            return 0.5;
        }
        
        let correctChecks = 0;
        
        for (const test of challenge.complianceTests) {
            const result = await this._applyComplianceStrategy(
                strategy,
                test,
                context
            );
            
            if (result.compliant === test.expectedCompliant) {
                correctChecks++;
            }
        }
        
        return correctChecks / challenge.complianceTests.length;
    }
    
    /**
     * 💡 GENERATE SOLUTIONS
     */
    async _generateSolutions(strategy, challenge, context) {
        const solutions = [];
        
        // Generate solutions for detected errors
        if (challenge.detectedErrors) {
            for (const error of challenge.detectedErrors) {
                const errorSolutions = await this._generateErrorSolutions(
                    strategy,
                    error,
                    context
                );
                solutions.push(...errorSolutions);
            }
        }
        
        return solutions;
    }
    
    /**
     * ⭐ EVALUATE SOLUTION QUALITY
     */
    _evaluateSolutionQuality(solutions) {
        if (!solutions || solutions.length === 0) {
            return 0;
        }
        
        let totalQuality = 0;
        
        for (const solution of solutions) {
            let quality = 0;
            
            // Feasibility score
            quality += (solution.feasibility || 0) * 0.3;
            
            // Cost-effectiveness
            quality += (solution.costEffectiveness || 0) * 0.2;
            
            // Compliance adherence
            quality += (solution.complianceScore || 0) * 0.3;
            
            // Innovation factor
            quality += (solution.innovation || 0) * 0.2;
            
            totalQuality += quality;
        }
        
        return totalQuality / solutions.length;
    }
    
    /**
     * 📊 CALCULATE PERFORMANCE METRICS
     */
    _calculatePerformanceMetrics(competitorStrategy, battleResults) {
        const baselineAccuracy = competitorStrategy.accuracy || 0;
        const achievedAccuracy = battleResults.bestAccuracy || 0;
        const improvement = achievedAccuracy - baselineAccuracy;
        const improvementPercent = baselineAccuracy > 0 ? 
                                  (improvement / baselineAccuracy) * 100 : 0;
        
        return {
            baselineAccuracy,
            achievedAccuracy,
            improvement,
            improvementPercent,
            errorDetectionImprovement: battleResults.errorDetectionScore - (competitorStrategy.errorDetection || 0),
            quantityImprovement: battleResults.quantityScore - (competitorStrategy.quantityAccuracy || 0),
            complianceImprovement: battleResults.complianceScore - (competitorStrategy.compliance || 0),
            solutionQualityImprovement: battleResults.solutionQuality - (competitorStrategy.solutionQuality || 0)
        };
    }
    
    /**
     * 🚀 PERFORM LIVE AGENT IMPROVEMENT
     */
    async _performLiveAgentImprovement(bestStrategy, challenge, metrics, targetAgent) {
        console.log('🚀 Performing live agent improvement...');
        console.log(`   📈 Improvement: ${metrics.improvementPercent.toFixed(2)}%`);
        
        try {
            // Get or create agent
            const agent = targetAgent || await this._getDefaultAgent(challenge.type);
            
            if (!agent) {
                console.warn('⚠️ No agent available for improvement');
                return;
            }
            
            // Update agent strategy
            const updatePayload = {
                strategy: bestStrategy,
                improvements: {
                    errorDetection: metrics.errorDetectionImprovement,
                    quantityExtraction: metrics.quantityImprovement,
                    compliance: metrics.complianceImprovement,
                    solutionQuality: metrics.solutionQualityImprovement
                },
                metadata: {
                    source: 'sparring_improvement',
                    challenge: challenge.type,
                    improvement: metrics.improvementPercent,
                    timestamp: Date.now()
                }
            };
            
            // Apply improvement
            if (agent.updateStrategy) {
                await agent.updateStrategy(updatePayload);
                console.log('✅ Agent strategy updated successfully');
            }
            
            // Track improvement
            this._trackAgentImprovement(agent.id || 'default', metrics);
            
            // Update metrics
            this.metrics.liveAgentImprovements++;
            
        } catch (error) {
            console.error('❌ Failed to perform live agent improvement:', error);
        }
    }
    
    /**
     * 📈 UPDATE METRICS
     */
    _updateMetrics(performanceMetrics) {
        this.metrics.sparringSessions++;
        
        if (performanceMetrics.improvement > 0) {
            this.metrics.syndicateWins++;
            this.metrics.totalAccuracyGained += performanceMetrics.improvement;
            
            // Update specific improvements
            if (performanceMetrics.errorDetectionImprovement > 0) {
                this.metrics.errorDetectionImprovements++;
                this.metrics.bestErrorDetectionAccuracy = Math.max(
                    this.metrics.bestErrorDetectionAccuracy,
                    performanceMetrics.achievedAccuracy
                );
            }
            
            if (performanceMetrics.quantityImprovement > 0) {
                this.metrics.quantityExtractionImprovements++;
                this.metrics.bestQuantityAccuracy = Math.max(
                    this.metrics.bestQuantityAccuracy,
                    performanceMetrics.achievedAccuracy
                );
            }
            
            if (performanceMetrics.complianceImprovement > 0) {
                this.metrics.complianceCheckImprovements++;
                this.metrics.bestComplianceScore = Math.max(
                    this.metrics.bestComplianceScore,
                    performanceMetrics.achievedAccuracy
                );
            }
            
            if (performanceMetrics.solutionQualityImprovement > 0) {
                this.metrics.solutionQualityImprovements++;
                this.metrics.bestSolutionQuality = Math.max(
                    this.metrics.bestSolutionQuality,
                    performanceMetrics.achievedAccuracy
                );
            }
        } else {
            this.metrics.competitorWins++;
        }
        
        // Update average improvement
        this.metrics.averageImprovement = 
            this.metrics.totalAccuracyGained / this.metrics.sparringSessions;
    }
    
    /**
     * 💾 PERSIST SPARRING RESULTS
     */
    async _persistSparringResults(challenge, competitorStrategy, battleResults, metrics) {
        const results = {
            sessionId: `sparring-${Date.now()}`,
            timestamp: new Date().toISOString(),
            challenge: {
                type: challenge.type,
                planId: challenge.planId,
                projectId: challenge.projectId,
                complexity: challenge.complexity
            },
            competitor: {
                accuracy: competitorStrategy.accuracy,
                strategy: competitorStrategy
            },
            results: {
                bestAccuracy: battleResults.bestAccuracy,
                bestStrategy: battleResults.bestStrategy,
                bestRound: battleResults.round,
                totalMutations: battleResults.totalMutations,
                eliteStrategies: battleResults.eliteStrategies
            },
            metrics: metrics,
            improvements: {
                overall: metrics.improvementPercent,
                errorDetection: metrics.errorDetectionImprovement,
                quantityExtraction: metrics.quantityImprovement,
                compliance: metrics.complianceImprovement,
                solutionQuality: metrics.solutionQualityImprovement
            }
        };
        
        // Store in persistence engine
        await this.persistenceEngine.storeMemory('sparring_results', results);
        
        // Store in database if available
        if (this.dbPool) {
            try {
                await this.dbPool.query(
                    `INSERT INTO construction_sparring_results 
                    (session_id, challenge_type, plan_id, project_id, 
                     baseline_accuracy, achieved_accuracy, improvement_percent,
                     best_strategy, metrics, created_at) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
                    [
                        results.sessionId,
                        challenge.type,
                        challenge.planId,
                        challenge.projectId,
                        competitorStrategy.accuracy,
                        battleResults.bestAccuracy,
                        metrics.improvementPercent,
                        JSON.stringify(battleResults.bestStrategy),
                        JSON.stringify(metrics)
                    ]
                );
            } catch (error) {
                console.error('Failed to persist to database:', error);
            }
        }
    }
    
    /**
     * 🏅 ISSUE PERFORMANCE REWARD
     */
    async _issuePerformanceReward(metrics) {
        if (!this.rewardEngine) return;
        
        try {
            await this.rewardEngine.applyReward('construction-sparring', {
                type: 'ANALYSIS_IMPROVEMENT',
                amount: Math.min(10.0, metrics.improvement * 10),
                reason: `Sparring session improved accuracy by ${metrics.improvementPercent.toFixed(2)}%`,
                proof: {
                    baselineAccuracy: metrics.baselineAccuracy,
                    achievedAccuracy: metrics.achievedAccuracy,
                    improvement: metrics.improvement
                }
            });
        } catch (error) {
            console.error('Failed to issue reward:', error);
        }
    }
    
    // Helper methods
    
    async _getEvolutionarySystem() {
        if (this.evolutionarySystem) {
            return this.evolutionarySystem;
        }
        
        // Try to find via factory
        if (this.factory?.serviceRegistry?.learning?.alphaGnome) {
            this.evolutionarySystem = this.factory.serviceRegistry.learning.alphaGnome;
            return this.evolutionarySystem;
        }
        
        return null;
    }
    
    _getHistoricalAccuracy(challengeType) {
        const key = `accuracy_${challengeType}`;
        return this.metrics[key] || 0.7; // Default 70% if no history
    }
    
    async _loadErrorPatterns(planType) {
        // Load common error patterns for this plan type
        return this.solutionPatterns.get(`errors_${planType}`) || [];
    }
    
    async _loadQuantityPatterns(planType) {
        // Load quantity extraction patterns
        return this.strategyCache.get(`quantities_${planType}`) || [];
    }
    
    async _loadComplianceRules(hoaiPhase) {
        // Load HOAI compliance rules for the phase
        const rules = await this._getHoaiPhaseRules(hoaiPhase);
        
        return {
            phase: hoaiPhase,
            rules
        };
    }
    
    async _getHoaiPhaseRules(hoaiPhase) {
        // Load rules from database if available
        if (this.dbPool) {
            try {
                const result = await this.dbPool.query(
                    'SELECT * FROM hoai_rules WHERE phase = $1',
                    [hoaiPhase]
                );
                
                if (result.rows && result.rows.length > 0) {
                    return result.rows;
                }
            } catch (error) {
                console.warn('Failed to load HOAI rules from database:', error);
            }
        }
        
        // Fallback to default rules
        const defaultRules = {
            'LP6': [
                { id: 'LP6.a', description: 'Aufstellen eines Vergabeterminplans', required: true },
                { id: 'LP6.b', description: 'Aufstellen von Leistungsbeschreibungen', required: true },
                { id: 'LP6.c', description: 'Ermitteln und Zusammenstellen von Mengen', required: true }
            ],
            'LP7': [
                { id: 'LP7.a', description: 'Einholen von Angeboten', required: true },
                { id: 'LP7.b', description: 'Prüfen und Werten der Angebote', required: true },
                { id: 'LP7.c', description: 'Führen eines Preisspiegels', required: true }
            ]
        };
        
        return defaultRules[hoaiPhase] || [];
    }
    
    async _loadPreviousAnalyses(projectId) {
        if (!this.dbPool) return [];
        
        try {
            const result = await this.dbPool.query(
                'SELECT * FROM plan_analyses WHERE project_id = $1 ORDER BY created_at DESC LIMIT 10',
                [projectId]
            );
            return result.rows || [];
        } catch (error) {
            return [];
        }
    }
    
    async _loadSimilarProjects(challenge) {
        // Connect to memory persistence for similar project retrieval
        const memoryPersistence = this.memoryPersistence || 
            new (await import('./memory/ConstructionMemoryPersistence.js')).ConstructionMemoryPersistence();
        
        // Search for similar projects based on challenge characteristics
        const searchCriteria = {
            projectType: challenge.projectType,
            scale: challenge.scale,
            complexity: challenge.complexity,
            errorTypes: challenge.errorTypes || [],
            phase: challenge.phase || 'LP6'
        };
        
        const similarProjects = await memoryPersistence.searchSimilarProjects(
            searchCriteria,
            { limit: 10 }
        );
        
        return similarProjects || [];
    }
    
    async _applyErrorDetectionStrategy(strategy, testError, context) {
        // Connect to actual ErrorDetectionEscalationService
        const errorDetector = this.errorDetection || 
            new (await import('./services/ErrorDetectionEscalationService.js')).ErrorDetectionEscalationService(this.config);
        
        // Use actual detection service with strategy
        const detection = await errorDetector.detectSpecificError(
            testError,
            strategy,
            context
        );
        
        // Apply strategy patterns if available
        if (strategy.errorPatterns) {
            const patternMatch = strategy.errorPatterns.some(pattern => 
                this._matchesErrorPattern(testError, pattern)
            );
            // Combine actual detection with pattern matching
            return detection.detected || patternMatch;
        }
        
        return detection.detected;
    }
    
    async _applyQuantityStrategy(strategy, testQuantity, context) {
        // Connect to actual QuantityTakeoffEngine
        const quantityEngine = this.quantityTakeoff || 
            new (await import('./services/QuantityTakeoffEngine.js')).QuantityTakeoffEngine(this.config);
        
        if (!strategy.quantityMethods) {
            strategy.quantityMethods = ['din277', 'volumeCalculation'];
        }
        
        // Extract using actual service
        const extractionResult = await quantityEngine.extractFromPlanSegment(
            testQuantity.planData || testQuantity,
            strategy.quantityMethods,
            context
        );
        
        // Return the extracted value
        return extractionResult.value || extractionResult.quantity || 0;
    }
    
    async _applyComplianceStrategy(strategy, test, context) {
        // Connect to actual HOAIComplianceService
        const complianceService = this.hoaiCompliance || 
            new (await import('./services/HOAIComplianceService.js')).HOAIComplianceService(this.config);
        
        // Check specific compliance using actual service
        const result = await complianceService.checkSpecificCompliance(
            test,
            strategy,
            context
        );
        
        return {
            compliant: result.compliant,
            score: result.score || 0,
            issues: result.issues || []
        };
    }
    
    async _generateErrorSolutions(strategy, error, context) {
        // Connect to actual ErrorDetectionEscalationService
        const solutionGenerator = this.errorDetection || 
            new (await import('./services/ErrorDetectionEscalationService.js')).ErrorDetectionEscalationService(this.config);
        
        // Generate actual solutions using the service
        const analysis = {
            errorType: error.type,
            severity: error.severity || 'MEDIUM',
            context: context || {}
        };
        
        const generatedSolutions = await solutionGenerator.generateMultipleSolutions(
            error,
            analysis,
            { strategy }
        );
        
        // Format solutions with additional metrics
        return generatedSolutions.map((sol, i) => ({
            id: sol.id || `solution_${i}`,
            errorId: error.id,
            description: sol.description,
            implementation: sol.implementation,
            feasibility: sol.confidence || 0.8,
            costEffectiveness: sol.costEfficiency || 0.7,
            complianceScore: sol.complianceChecks?.score || 0.9,
            innovation: sol.innovationScore || 
                (sol.strategy === 'quantum_superposition' ? 0.9 : 0.5),
            strategy: sol.strategy
        }));
    }
    
    _matchesErrorPattern(error, pattern) {
        // Pattern matching logic
        return error.type === pattern.type || 
               error.category === pattern.category;
    }
    
    async _getDefaultAgent(challengeType) {
        // Get or create specialized default agent for challenge type
        const agentId = `default_${challengeType}_agent`;
        
        // Check if agent exists in tracker
        if (this.liveAgentTracker.has(agentId)) {
            return agentId;
        }
        
        // Create new default agent configuration
        const defaultConfig = {
            errorDetection: challengeType === 'error' ? 0.95 : 0.8,
            quantityExtraction: challengeType === 'quantity' ? 0.95 : 0.8,
            compliance: challengeType === 'compliance' ? 0.95 : 0.8,
            solutionGeneration: challengeType === 'solution' ? 0.95 : 0.8
        };
        
        // Register the default agent
        this.liveAgentTracker.set(agentId, [{
            timestamp: Date.now(),
            improvement: 0,
            metrics: defaultConfig
        }]);
        
        return agentId;
    }
    
    _trackAgentImprovement(agentId, metrics) {
        const history = this.liveAgentTracker.get(agentId) || [];
        history.push({
            timestamp: Date.now(),
            improvement: metrics.improvementPercent,
            metrics: metrics
        });
        this.liveAgentTracker.set(agentId, history);
    }
    
    async loadHistoricalResults() {
        const results = await this.persistenceEngine.retrieveMemory('sparring_history');
        if (results) {
            // Update metrics from history
            this.metrics = { ...this.metrics, ...results.aggregateMetrics };
        }
    }
    
    /**
     * 📊 GET SPARRING METRICS
     */
    getSparringMetrics() {
        return {
            ...this.metrics,
            sessionCount: this.metrics.sparringSessions,
            winRate: this.metrics.sparringSessions > 0 ? 
                     this.metrics.syndicateWins / this.metrics.sparringSessions : 0,
            averageAccuracyGain: this.metrics.averageImprovement
        };
    }
    
    /**
     * 🔌 SHUTDOWN
     */
    async shutdown() {
        console.log('🔌 Shutting down Construction Sparring Service...');
        
        // Save final metrics
        await this.persistenceEngine.storeMemory('sparring_history', {
            aggregateMetrics: this.metrics,
            timestamp: Date.now()
        });
        
        await this.persistenceEngine.shutdown();
        
        console.log('✅ Construction Sparring Service shutdown complete');
    }
}

// Export the service
export default ConstructionSparringService;
