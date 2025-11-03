/**
 * 🏆 CONSTRUCTION COMPETITION SYSTEM - TOP 1% EXPERT IMPLEMENTATION
 * ==============================================================
 * 
 * Elite competition framework for construction agents to compete in:
 * - Plan error detection accuracy
 * - Quantity extraction precision  
 * - Solution quality generation
 * - HOAI compliance verification
 * 
 * Transforms arbitrage profit competitions into construction analysis excellence!
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import { ConstructionSparringService } from './ConstructionSparringService.js';
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

export class ConstructionCompetitionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            enableRankings: config.enableRankings !== false,
            enableTournaments: config.enableTournaments !== false,
            competitionFrequency: config.competitionFrequency || 3600000, // 1 hour
            minParticipants: config.minParticipants || 3,
            database: config.database,
            ...config
        };
        
        // Competition services
        this.sparringService = new ConstructionSparringService(config);
        
        // Competition state
        this.activeCompetitions = new Map();
        this.tournamentSchedule = [];
        this.leaderboards = {
            errorDetection: new Map(),
            quantityExtraction: new Map(),
            solutionQuality: new Map(),
            compliance: new Map(),
            overall: new Map()
        };
        
        // Agent registry
        this.registeredAgents = new Map();
        this.agentPerformance = new Map();
        
        // Persistence
        this.persistenceEngine = new EliteMemoryPersistenceEngine({
            namespace: 'construction_competitions',
            enableAutoSave: true
        });
        
        // Metrics
        this.metrics = {
            totalCompetitions: 0,
            totalTournaments: 0,
            totalMatches: 0,
            averageParticipants: 0,
            highestAccuracy: 0,
            bestAgent: null
        };
        
        this.initialize();
    }
    
    /**
     * 🚀 INITIALIZE SYSTEM
     */
    async initialize() {
        console.log('🚀 Initializing Construction Competition System...');
        
        await this.persistenceEngine.initialize();
        await this.sparringService.initialize();
        
        // Load historical data
        await this.loadCompetitionHistory();
        
        // Start competition scheduler
        if (this.config.enableTournaments) {
            this.startTournamentScheduler();
        }
        
        console.log('✅ Competition System initialized');
    }
    
    /**
     * 🏆 CREATE COMPETITION
     */
    async createCompetition(competitionConfig) {
        const competition = {
            id: `comp_${Date.now()}`,
            type: competitionConfig.type || 'comprehensive',
            name: competitionConfig.name || 'Construction Analysis Competition',
            challenge: competitionConfig.challenge,
            participants: [],
            status: 'open',
            created: Date.now(),
            startTime: null,
            endTime: null,
            results: null,
            config: competitionConfig
        };
        
        this.activeCompetitions.set(competition.id, competition);
        
        this.emit('competitionCreated', {
            competitionId: competition.id,
            type: competition.type,
            challenge: competition.challenge
        });
        
        return competition;
    }
    
    /**
     * 👥 REGISTER AGENT FOR COMPETITION
     */
    async registerAgent(agentId, agentInfo, competitionId = null) {
        const registration = {
            agentId,
            name: agentInfo.name || `Agent_${agentId}`,
            capabilities: agentInfo.capabilities || ['error_detection', 'quantity_extraction'],
            strategy: agentInfo.strategy || {},
            registered: Date.now(),
            competitions: competitionId ? [competitionId] : []
        };
        
        this.registeredAgents.set(agentId, registration);
        
        // Initialize performance tracking
        if (!this.agentPerformance.has(agentId)) {
            this.agentPerformance.set(agentId, {
                competitions: 0,
                wins: 0,
                totalAccuracy: 0,
                bestAccuracy: 0,
                specialties: {}
            });
        }
        
        // Add to specific competition if provided
        if (competitionId) {
            const competition = this.activeCompetitions.get(competitionId);
            if (competition && competition.status === 'open') {
                competition.participants.push(agentId);
            }
        }
        
        return registration;
    }
    
    /**
     * 🎯 RUN COMPETITION
     */
    async runCompetition(competitionId) {
        const competition = this.activeCompetitions.get(competitionId);
        
        if (!competition) {
            throw new Error(`Competition ${competitionId} not found`);
        }
        
        if (competition.participants.length < this.config.minParticipants) {
            throw new Error(`Not enough participants (${competition.participants.length}/${this.config.minParticipants})`);
        }
        
        console.log(`🎯 Starting competition: ${competition.name}`);
        console.log(`👥 Participants: ${competition.participants.length}`);
        
        competition.status = 'running';
        competition.startTime = Date.now();
        
        try {
            // Run competition based on type
            let results;
            
            switch (competition.type) {
                case 'error_detection':
                    results = await this.runErrorDetectionCompetition(competition);
                    break;
                    
                case 'quantity_extraction':
                    results = await this.runQuantityCompetition(competition);
                    break;
                    
                case 'solution_generation':
                    results = await this.runSolutionCompetition(competition);
                    break;
                    
                case 'compliance':
                    results = await this.runComplianceCompetition(competition);
                    break;
                    
                case 'comprehensive':
                default:
                    results = await this.runComprehensiveCompetition(competition);
                    break;
            }
            
            // Update competition
            competition.status = 'completed';
            competition.endTime = Date.now();
            competition.results = results;
            
            // Update metrics and rankings
            await this.updateRankings(competition, results);
            await this.updateAgentPerformance(results);
            
            // Persist results
            await this.persistCompetitionResults(competition);
            
            this.metrics.totalCompetitions++;
            
            this.emit('competitionCompleted', {
                competitionId: competition.id,
                type: competition.type,
                winner: results.rankings[0],
                participants: competition.participants.length,
                duration: competition.endTime - competition.startTime
            });
            
            return results;
            
        } catch (error) {
            competition.status = 'failed';
            competition.error = error.message;
            
            this.emit('competitionFailed', {
                competitionId: competition.id,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * 🔍 RUN ERROR DETECTION COMPETITION
     */
    async runErrorDetectionCompetition(competition) {
        const challenge = competition.challenge;
        const results = {
            type: 'error_detection',
            participants: [],
            rankings: [],
            bestScore: 0,
            averageScore: 0
        };
        
        // Test each participant
        for (const agentId of competition.participants) {
            const agent = this.registeredAgents.get(agentId);
            if (!agent) continue;
            
            const agentResult = await this.testErrorDetection(
                agentId,
                agent.strategy,
                challenge
            );
            
            results.participants.push({
                agentId,
                score: agentResult.accuracy,
                metrics: agentResult.metrics,
                errors: agentResult.errors
            });
        }
        
        // Rank participants
        results.participants.sort((a, b) => b.score - a.score);
        results.rankings = results.participants.map(p => ({
            agentId: p.agentId,
            score: p.score,
            rank: 0 // Will be set below
        }));
        
        // Assign ranks
        results.rankings.forEach((r, i) => {
            r.rank = i + 1;
        });
        
        // Calculate summary stats
        if (results.participants.length > 0) {
            results.bestScore = results.participants[0].score;
            results.averageScore = results.participants.reduce((sum, p) => 
                sum + p.score, 0) / results.participants.length;
        }
        
        return results;
    }
    
    /**
     * 📊 RUN QUANTITY EXTRACTION COMPETITION
     */
    async runQuantityCompetition(competition) {
        const challenge = competition.challenge;
        const results = {
            type: 'quantity_extraction',
            participants: [],
            rankings: [],
            bestAccuracy: 0,
            averageAccuracy: 0
        };
        
        for (const agentId of competition.participants) {
            const agent = this.registeredAgents.get(agentId);
            if (!agent) continue;
            
            const agentResult = await this.testQuantityExtraction(
                agentId,
                agent.strategy,
                challenge
            );
            
            results.participants.push({
                agentId,
                accuracy: agentResult.accuracy,
                avgDeviation: agentResult.avgDeviation,
                quantities: agentResult.quantities
            });
        }
        
        // Rank by accuracy
        results.participants.sort((a, b) => b.accuracy - a.accuracy);
        results.rankings = results.participants.map((p, i) => ({
            agentId: p.agentId,
            score: p.accuracy,
            rank: i + 1
        }));
        
        // Summary stats
        if (results.participants.length > 0) {
            results.bestAccuracy = results.participants[0].accuracy;
            results.averageAccuracy = results.participants.reduce((sum, p) => 
                sum + p.accuracy, 0) / results.participants.length;
        }
        
        return results;
    }
    
    /**
     * 💡 RUN SOLUTION GENERATION COMPETITION
     */
    async runSolutionCompetition(competition) {
        const challenge = competition.challenge;
        const results = {
            type: 'solution_generation',
            participants: [],
            rankings: [],
            bestQuality: 0,
            averageQuality: 0
        };
        
        for (const agentId of competition.participants) {
            const agent = this.registeredAgents.get(agentId);
            if (!agent) continue;
            
            const agentResult = await this.testSolutionGeneration(
                agentId,
                agent.strategy,
                challenge
            );
            
            results.participants.push({
                agentId,
                quality: agentResult.quality,
                solutions: agentResult.solutions,
                metrics: agentResult.metrics
            });
        }
        
        // Rank by solution quality
        results.participants.sort((a, b) => b.quality - a.quality);
        results.rankings = results.participants.map((p, i) => ({
            agentId: p.agentId,
            score: p.quality,
            rank: i + 1
        }));
        
        // Summary stats
        if (results.participants.length > 0) {
            results.bestQuality = results.participants[0].quality;
            results.averageQuality = results.participants.reduce((sum, p) => 
                sum + p.quality, 0) / results.participants.length;
        }
        
        return results;
    }
    
    /**
     * ✅ RUN COMPLIANCE COMPETITION
     */
    async runComplianceCompetition(competition) {
        const challenge = competition.challenge;
        const results = {
            type: 'compliance',
            participants: [],
            rankings: [],
            bestScore: 0,
            averageScore: 0
        };
        
        for (const agentId of competition.participants) {
            const agent = this.registeredAgents.get(agentId);
            if (!agent) continue;
            
            const agentResult = await this.testCompliance(
                agentId,
                agent.strategy,
                challenge
            );
            
            results.participants.push({
                agentId,
                score: agentResult.score,
                violations: agentResult.violations,
                coverage: agentResult.coverage
            });
        }
        
        // Rank by compliance score
        results.participants.sort((a, b) => b.score - a.score);
        results.rankings = results.participants.map((p, i) => ({
            agentId: p.agentId,
            score: p.score,
            rank: i + 1
        }));
        
        // Summary stats
        if (results.participants.length > 0) {
            results.bestScore = results.participants[0].score;
            results.averageScore = results.participants.reduce((sum, p) => 
                sum + p.score, 0) / results.participants.length;
        }
        
        return results;
    }
    
    /**
     * 🎯 RUN COMPREHENSIVE COMPETITION
     */
    async runComprehensiveCompetition(competition) {
        const challenge = competition.challenge;
        const results = {
            type: 'comprehensive',
            participants: [],
            rankings: [],
            bestOverall: 0,
            categoryWinners: {}
        };
        
        for (const agentId of competition.participants) {
            const agent = this.registeredAgents.get(agentId);
            if (!agent) continue;
            
            // Run sparring session for comprehensive evaluation
            const sparringResult = await this.sparringService.runSparringSession(
                challenge,
                agent.strategy,
                {
                    enableLiveImprovement: false,
                    competitionMode: true
                }
            );
            
            const overallScore = this.calculateOverallScore(sparringResult.metrics);
            
            results.participants.push({
                agentId,
                overallScore,
                metrics: sparringResult.metrics,
                improvements: sparringResult.improvements || {}
            });
        }
        
        // Rank by overall score
        results.participants.sort((a, b) => b.overallScore - a.overallScore);
        results.rankings = results.participants.map((p, i) => ({
            agentId: p.agentId,
            score: p.overallScore,
            rank: i + 1
        }));
        
        // Determine category winners
        results.categoryWinners = {
            errorDetection: this.findCategoryWinner(results.participants, 'errorDetection'),
            quantityExtraction: this.findCategoryWinner(results.participants, 'quantityExtraction'),
            compliance: this.findCategoryWinner(results.participants, 'compliance'),
            solutionQuality: this.findCategoryWinner(results.participants, 'solutionQuality')
        };
        
        // Summary stats
        if (results.participants.length > 0) {
            results.bestOverall = results.participants[0].overallScore;
        }
        
        return results;
    }
    
    /**
     * 🏅 UPDATE RANKINGS
     */
    async updateRankings(competition, results) {
        const competitionType = competition.type;
        const leaderboard = this.leaderboards[competitionType] || this.leaderboards.overall;
        
        for (const ranking of results.rankings) {
            const currentScore = leaderboard.get(ranking.agentId) || 0;
            const newScore = (currentScore * 0.9) + (ranking.score * 0.1); // EMA
            leaderboard.set(ranking.agentId, newScore);
        }
        
        // Update overall leaderboard
        if (competitionType !== 'overall') {
            for (const participant of results.participants) {
                const overallScore = this.leaderboards.overall.get(participant.agentId) || 0;
                const contributionWeight = 0.25; // Each category contributes equally
                const newOverall = overallScore + (participant.score || participant.overallScore || 0) * contributionWeight;
                this.leaderboards.overall.set(participant.agentId, newOverall);
            }
        }
        
        this.emit('rankingsUpdated', {
            competitionType,
            topAgents: this.getTopAgents(5)
        });
    }
    
    /**
     * 📊 UPDATE AGENT PERFORMANCE
     */
    async updateAgentPerformance(results) {
        for (const participant of results.participants) {
            const performance = this.agentPerformance.get(participant.agentId);
            if (!performance) continue;
            
            performance.competitions++;
            
            // Check if winner
            if (results.rankings[0]?.agentId === participant.agentId) {
                performance.wins++;
            }
            
            // Update accuracy tracking
            const score = participant.score || participant.overallScore || participant.accuracy || 0;
            performance.totalAccuracy += score;
            performance.bestAccuracy = Math.max(performance.bestAccuracy, score);
            
            // Track specialties
            if (results.type && results.type !== 'comprehensive') {
                if (!performance.specialties[results.type]) {
                    performance.specialties[results.type] = {
                        competitions: 0,
                        totalScore: 0,
                        bestScore: 0
                    };
                }
                
                const specialty = performance.specialties[results.type];
                specialty.competitions++;
                specialty.totalScore += score;
                specialty.bestScore = Math.max(specialty.bestScore, score);
            }
        }
        
        // Update global best
        const bestAgent = this.findBestAgent();
        if (bestAgent) {
            this.metrics.bestAgent = bestAgent.agentId;
            this.metrics.highestAccuracy = bestAgent.accuracy;
        }
    }
    
    /**
     * 🏆 CREATE TOURNAMENT
     */
    async createTournament(tournamentConfig) {
        const tournament = {
            id: `tournament_${Date.now()}`,
            name: tournamentConfig.name || 'Construction Excellence Tournament',
            type: tournamentConfig.type || 'elimination',
            rounds: [],
            participants: tournamentConfig.participants || [],
            status: 'scheduled',
            startTime: tournamentConfig.startTime || Date.now() + 3600000,
            config: tournamentConfig
        };
        
        this.tournamentSchedule.push(tournament);
        
        this.emit('tournamentScheduled', {
            tournamentId: tournament.id,
            name: tournament.name,
            startTime: tournament.startTime,
            participants: tournament.participants.length
        });
        
        return tournament;
    }
    
    // Test methods for specific capabilities
    
    async testErrorDetection(agentId, strategy, challenge) {
        // Connect to actual ErrorDetectionEscalationService
        const errorDetector = this.errorDetection || 
            new (await import('./services/ErrorDetectionEscalationService.js')).ErrorDetectionEscalationService(this.config);
        
        const testErrors = challenge.testErrors || [];
        const testPlans = challenge.testPlans || [];
        let correct = 0;
        let falsePositives = 0;
        let falseNegatives = 0;
        
        // Use actual error detection service
        const detectionResults = await errorDetector.detectErrors(
            testPlans,
            strategy.crossReferenceDepth || 3
        );
        
        // Compare with expected errors
        for (const testCase of testErrors) {
            const detected = detectionResults.errors.some(e => 
                e.type === testCase.type && 
                e.location === testCase.location
            );
            
            if (detected && testCase.isError) correct++;
            else if (detected && !testCase.isError) falsePositives++;
            else if (!detected && testCase.isError) falseNegatives++;
        }
        
        const precision = correct / (correct + falsePositives || 1);
        const recall = correct / (correct + falseNegatives || 1);
        const accuracy = 2 * (precision * recall) / (precision + recall || 1);
        
        return {
            accuracy,
            metrics: { precision, recall, f1Score: accuracy },
            errors: { correct, falsePositives, falseNegatives },
            detectionResults: detectionResults.errors
        };
    }
    
    async testQuantityExtraction(agentId, strategy, challenge) {
        // Connect to actual QuantityTakeoffEngine
        const quantityEngine = this.quantityTakeoff || 
            new (await import('./services/QuantityTakeoffEngine.js')).QuantityTakeoffEngine(this.config);
        
        const testQuantities = challenge.testQuantities || [];
        const testPlans = challenge.testPlans || [];
        let totalDeviation = 0;
        let correctCount = 0;
        
        // Use actual quantity extraction service
        const extractionResults = await quantityEngine.extractQuantitiesFromPlans(
            testPlans,
            { strategy, projectId: challenge.projectId }
        );
        
        // Compare extracted quantities with expected values
        const quantities = testQuantities.map(test => {
            // Find the extracted value for this element
            let extracted = 0;
            if (test.type === 'area' && extractionResults.areas[test.element]) {
                extracted = extractionResults.areas[test.element].value;
            } else if (test.type === 'volume' && extractionResults.volumes[test.element]) {
                extracted = extractionResults.volumes[test.element].value;
            } else if (test.type === 'count' && extractionResults.counts[test.element]) {
                extracted = extractionResults.counts[test.element];
            } else if (test.type === 'length' && extractionResults.lengths[test.element]) {
                extracted = extractionResults.lengths[test.element].value;
            }
            
            const deviation = test.actual > 0 ? Math.abs(extracted - test.actual) / test.actual : 0;
            totalDeviation += deviation;
            
            if (deviation < 0.1) correctCount++;
            
            return {
                element: test.element,
                type: test.type,
                actual: test.actual,
                extracted: extracted,
                deviation: deviation
            };
        });
        
        const accuracy = testQuantities.length > 0 ? correctCount / testQuantities.length : 0;
        const avgDeviation = testQuantities.length > 0 ? totalDeviation / testQuantities.length : 0;
        
        return { 
            accuracy, 
            avgDeviation, 
            quantities,
            extractionResults
        };
    }
    
    async testSolutionGeneration(agentId, strategy, challenge) {
        // Connect to actual ErrorDetectionEscalationService
        const solutionGenerator = this.errorDetection || 
            new (await import('./services/ErrorDetectionEscalationService.js')).ErrorDetectionEscalationService(this.config);
        
        // Connect to formal reasoning for evaluation
        const formalReasoning = this.formalReasoning || 
            new (await import('../formalization/FormalReasoningCognitiveIntegration.js')).FormalReasoningCognitiveIntegration({
                domain: 'construction'
            });
        
        const errors = challenge.errors || [];
        const solutions = [];
        let totalQuality = 0;
        
        // Generate actual solutions using the service
        for (const error of errors) {
            const analysis = {
                errorType: error.type,
                severity: error.severity || 'MEDIUM',
                context: challenge.context || {}
            };
            
            // Generate multiple solutions using actual service
            const generatedSolutions = await solutionGenerator.generateMultipleSolutions(
                error,
                analysis,
                { strategy, agentContext: { agentId } }
            );
            
            // Evaluate each solution with formal reasoning
            for (const solution of generatedSolutions) {
                const evaluation = await this.evaluateSolution(
                    solution,
                    error,
                    challenge.constraints || {},
                    formalReasoning
                );
                
                const quality = evaluation.score;
                totalQuality += quality;
                
                solutions.push({
                    errorId: error.id,
                    ...solution,
                    quality,
                    evaluation
                });
            }
        }
        
        const avgQuality = solutions.length > 0 ? totalQuality / solutions.length : 0;
        
        return {
            quality: avgQuality,
            solutions,
            metrics: {
                solutionCount: solutions.length,
                avgFeasibility: solutions.reduce((s, sol) => s + (sol.feasibility || 0), 0) / (solutions.length || 1),
                avgCompliance: solutions.reduce((s, sol) => s + (sol.compliance || 0), 0) / (solutions.length || 1),
                avgInnovation: solutions.reduce((s, sol) => s + (sol.innovationScore || 0), 0) / (solutions.length || 1)
            }
        };
    }
    
    async evaluateSolution(solution, error, constraints, formalReasoning) {
        // Evaluate solution quality using formal reasoning
        const evaluation = {
            feasibility: 0,
            compliance: 0,
            cost: 0,
            innovation: 0,
            score: 0
        };
        
        // Check feasibility
        if (solution.implementation) {
            evaluation.feasibility = solution.confidence || 0.8;
        }
        
        // Check compliance
        if (solution.complianceChecks) {
            evaluation.compliance = solution.complianceChecks.score || 0.9;
        }
        
        // Estimate cost
        evaluation.cost = solution.estimatedCost || 5000;
        
        // Check innovation
        if (solution.strategy === 'quantum_superposition' || 
            solution.strategy === 'collective_intelligence') {
            evaluation.innovation = 0.8;
        } else {
            evaluation.innovation = 0.5;
        }
        
        // Calculate weighted score
        evaluation.score = (
            evaluation.feasibility * 0.3 +
            evaluation.compliance * 0.4 +
            evaluation.innovation * 0.2 +
            (10000 - evaluation.cost) / 10000 * 0.1
        );
        
        return evaluation;
    }
    
    async testCompliance(agentId, strategy, challenge) {
        // Connect to actual HOAIComplianceService
        const complianceService = this.hoaiCompliance || 
            new (await import('./services/HOAIComplianceService.js')).HOAIComplianceService(this.config);
        
        const complianceTests = challenge.complianceTests || [];
        const phase = challenge.phase || 'LP6';
        const documents = challenge.documents || {};
        let passed = 0;
        let violations = [];
        
        // Validate phase compliance using actual service
        const complianceResults = await complianceService.validatePhase(
            phase,
            documents,
            strategy
        );
        
        // Check each specific test
        for (const test of complianceTests) {
            let compliant = false;
            
            // Check if this specific rule passed
            if (test.rule) {
                const ruleResult = complianceResults.requirements.find(
                    r => r.id === test.rule || r.criterion === test.rule
                );
                compliant = ruleResult ? ruleResult.passed : false;
            } else {
                // General compliance check
                compliant = complianceResults.compliant;
            }
            
            if (compliant) {
                passed++;
            } else {
                violations.push({
                    rule: test.rule,
                    severity: test.severity || 'medium',
                    details: complianceResults.issues.find(i => 
                        i.requirement === test.rule || i.criterion === test.rule
                    )
                });
            }
        }
        
        const score = complianceTests.length > 0 ? 
            passed / complianceTests.length : 
            complianceResults.overallScore;
        const coverage = complianceTests.length / (challenge.totalRules || complianceTests.length);
        
        return { 
            score, 
            violations, 
            coverage,
            complianceResults 
        };
    }
    
    // Helper methods
    
    calculateOverallScore(metrics) {
        const weights = {
            errorDetection: 0.3,
            quantityExtraction: 0.25,
            compliance: 0.25,
            solutionQuality: 0.2
        };
        
        return Object.entries(metrics).reduce((score, [key, value]) => {
            return score + (value * (weights[key] || 0));
        }, 0);
    }
    
    findCategoryWinner(participants, category) {
        let winner = null;
        let bestScore = -1;
        
        for (const participant of participants) {
            const score = participant.metrics?.[category] || 0;
            if (score > bestScore) {
                bestScore = score;
                winner = participant.agentId;
            }
        }
        
        return { agentId: winner, score: bestScore };
    }
    
    getTopAgents(count = 10) {
        const sorted = Array.from(this.leaderboards.overall.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, count);
        
        return sorted.map(([agentId, score], index) => ({
            rank: index + 1,
            agentId,
            score,
            performance: this.agentPerformance.get(agentId)
        }));
    }
    
    findBestAgent() {
        let bestAgent = null;
        let bestAvgAccuracy = 0;
        
        for (const [agentId, performance] of this.agentPerformance) {
            if (performance.competitions > 0) {
                const avgAccuracy = performance.totalAccuracy / performance.competitions;
                if (avgAccuracy > bestAvgAccuracy) {
                    bestAvgAccuracy = avgAccuracy;
                    bestAgent = { agentId, accuracy: avgAccuracy, performance };
                }
            }
        }
        
        return bestAgent;
    }
    
    async persistCompetitionResults(competition) {
        await this.persistenceEngine.storeMemory(
            `competition_${competition.id}`,
            competition
        );
        
        // Update aggregate metrics
        this.metrics.totalMatches += competition.participants.length * (competition.participants.length - 1) / 2;
        this.metrics.averageParticipants = 
            (this.metrics.averageParticipants * (this.metrics.totalCompetitions - 1) + 
             competition.participants.length) / this.metrics.totalCompetitions;
    }
    
    async loadCompetitionHistory() {
        const history = await this.persistenceEngine.retrieveMemory('competition_history');
        if (history) {
            this.metrics = { ...this.metrics, ...history.metrics };
            
            // Restore leaderboards
            if (history.leaderboards) {
                Object.entries(history.leaderboards).forEach(([type, data]) => {
                    this.leaderboards[type] = new Map(data);
                });
            }
        }
    }
    
    startTournamentScheduler() {
        setInterval(() => {
            const now = Date.now();
            
            for (const tournament of this.tournamentSchedule) {
                if (tournament.status === 'scheduled' && tournament.startTime <= now) {
                    this.runTournament(tournament.id).catch(error => {
                        console.error('Tournament failed:', error);
                    });
                }
            }
        }, 60000); // Check every minute
    }
    
    async runTournament(tournamentId) {
        const tournament = this.tournamentSchedule.find(t => t.id === tournamentId);
        if (!tournament) return;
        
        tournament.status = 'running';
        this.metrics.totalTournaments++;
        
        console.log(`🏆 Running tournament: ${tournament.name}`);
        console.log(`👥 Participants: ${tournament.participants.length}`);
        
        this.emit('tournamentStarted', {
            tournamentId: tournament.id,
            name: tournament.name,
            participants: tournament.participants.length
        });
        
        try {
            // Run elimination rounds
            let currentParticipants = [...tournament.participants];
            let roundNumber = 1;
            
            while (currentParticipants.length > 1) {
                console.log(`🎯 Round ${roundNumber}: ${currentParticipants.length} participants`);
                
                const roundResults = await this.runEliminationRound(
                    tournament,
                    currentParticipants,
                    roundNumber
                );
                
                tournament.rounds.push(roundResults);
                
                // Advance winners to next round
                currentParticipants = roundResults.winners;
                roundNumber++;
                
                this.emit('tournamentRoundCompleted', {
                    tournamentId: tournament.id,
                    round: roundNumber - 1,
                    winnersCount: currentParticipants.length
                });
            }
            
            // Tournament complete
            tournament.status = 'completed';
            tournament.winner = currentParticipants[0];
            tournament.completedAt = Date.now();
            
            console.log(`🏆 Tournament winner: ${tournament.winner}`);
            
            // Update agent performance
            const winnerPerformance = this.agentPerformance.get(tournament.winner);
            if (winnerPerformance) {
                winnerPerformance.wins++;
                winnerPerformance.tournaments = (winnerPerformance.tournaments || 0) + 1;
            }
            
            // Persist tournament results
            await this.persistenceEngine.storeMemory(
                `tournament_${tournament.id}`,
                tournament
            );
            
            this.emit('tournamentCompleted', {
                tournamentId: tournament.id,
                winner: tournament.winner,
                rounds: tournament.rounds.length,
                participants: tournament.participants.length
            });
            
            return tournament;
            
        } catch (error) {
            console.error('Tournament failed:', error);
            tournament.status = 'failed';
            tournament.error = error.message;
            
            this.emit('tournamentFailed', {
                tournamentId: tournament.id,
                error: error.message
            });
            
            throw error;
        }
    }
    
    /**
     * 🎯 RUN ELIMINATION ROUND
     */
    async runEliminationRound(tournament, participants, roundNumber) {
        const roundResults = {
            roundNumber,
            matches: [],
            winners: [],
            eliminated: []
        };
        
        // Pair participants for matches
        const pairs = [];
        for (let i = 0; i < participants.length; i += 2) {
            if (i + 1 < participants.length) {
                pairs.push([participants[i], participants[i + 1]]);
            } else {
                // Bye - participant advances automatically
                roundResults.winners.push(participants[i]);
                roundResults.matches.push({
                    participant1: participants[i],
                    participant2: null,
                    winner: participants[i],
                    type: 'bye'
                });
            }
        }
        
        // Run all matches in parallel
        const matchPromises = pairs.map(([p1, p2]) => 
            this.runTournamentMatch(p1, p2, tournament.config.challenge)
        );
        
        const matchResults = await Promise.all(matchPromises);
        
        // Process match results
        for (const matchResult of matchResults) {
            roundResults.matches.push(matchResult);
            roundResults.winners.push(matchResult.winner);
            roundResults.eliminated.push(matchResult.loser);
            
            this.emit('tournamentMatchCompleted', {
                tournamentId: tournament.id,
                round: roundNumber,
                winner: matchResult.winner,
                loser: matchResult.loser,
                score: matchResult.score
            });
        }
        
        return roundResults;
    }
    
    /**
     * ⚔️ RUN TOURNAMENT MATCH
     */
    async runTournamentMatch(agentId1, agentId2, challenge) {
        const agent1 = this.registeredAgents.get(agentId1);
        const agent2 = this.registeredAgents.get(agentId2);
        
        if (!agent1 || !agent2) {
            throw new Error('Invalid participants for match');
        }
        
        console.log(`⚔️ Match: ${agent1.name} vs ${agent2.name}`);
        
        // Run comprehensive competition for both agents
        const result1 = await this.sparringService.runSparringSession(
            challenge,
            agent1.strategy,
            { enableLiveImprovement: false, competitionMode: true }
        );
        
        const result2 = await this.sparringService.runSparringSession(
            challenge,
            agent2.strategy,
            { enableLiveImprovement: false, competitionMode: true }
        );
        
        // Calculate scores
        const score1 = this.calculateOverallScore(result1.metrics);
        const score2 = this.calculateOverallScore(result2.metrics);
        
        // Determine winner
        const winner = score1 > score2 ? agentId1 : agentId2;
        const loser = score1 > score2 ? agentId2 : agentId1;
        
        console.log(`✅ Winner: ${winner === agentId1 ? agent1.name : agent2.name} (${Math.max(score1, score2).toFixed(3)})`);
        
        return {
            participant1: agentId1,
            participant2: agentId2,
            score1,
            score2,
            winner,
            loser,
            type: 'elimination',
            details: {
                result1: result1.metrics,
                result2: result2.metrics
            }
        };
    }
    
    /**
     * 📊 GET COMPETITION STATS
     */
    getCompetitionStats() {
        return {
            ...this.metrics,
            activeCompetitions: this.activeCompetitions.size,
            registeredAgents: this.registeredAgents.size,
            leaderboards: {
                overall: this.getTopAgents(10),
                errorDetection: this.getTopAgents(5),
                quantityExtraction: this.getTopAgents(5),
                compliance: this.getTopAgents(5),
                solutionQuality: this.getTopAgents(5)
            }
        };
    }
    
    /**
     * 🔌 SHUTDOWN
     */
    async shutdown() {
        console.log('🔌 Shutting down Competition System...');
        
        // Save state
        await this.persistenceEngine.storeMemory('competition_history', {
            metrics: this.metrics,
            leaderboards: Object.fromEntries(
                Object.entries(this.leaderboards).map(([type, board]) => 
                    [type, Array.from(board.entries())]
                )
            )
        });
        
        await this.sparringService.shutdown();
        await this.persistenceEngine.shutdown();
        
        this.removeAllListeners();
        console.log('✅ Competition System shutdown complete');
    }
}

export default ConstructionCompetitionSystem;
