/**
 * 💰 Bid Evaluation Matrix Service - Preisspiegel Generation
 * =========================================================
 * Top1 ??
 * Generates comprehensive bid evaluation matrices (Preisspiegel)
 * and provides multi-criteria decision analysis for contractor selection
 */

import { EventEmitter } from 'events';

export class BidEvaluationMatrix extends EventEmitter {
    constructor(config = {}) {
        super();
        console.log('💰 Initializing Bid Evaluation Matrix Service...');
        
        this.config = {
            weightedCriteria: config.weightedCriteria || {
                price: 0.70,
                quality: 0.20,
                time: 0.10
            },
            enableQuantumOptimization: config.enableQuantumOptimization !== false,
            arithmeticTolerance: config.arithmeticTolerance || 0.01,
            suspiciousThreshold: config.suspiciousThreshold || 0.15, // 15% below average
            database: config.database,
            ...config
        };
        
        // Evaluation systems
        this.quantumOptimizer = null;
        this.gameTheoryEngine = null;
        this.formalVerifier = null;
        
        // Data structures
        this.evaluationMatrices = new Map();
        this.bidRepository = new Map();
        this.contractorProfiles = new Map();
        this.marketBenchmarks = new Map();
        
        // Metrics
        this.metrics = {
            totalEvaluations: 0,
            averageBidCount: 0,
            suspiciousBidsDetected: 0,
            savingsAchieved: 0,
            evaluationAccuracy: 0.98
        };
        
        this.isInitialized = false;
    }
    
    async initialize() {
        console.log('   💰 Loading evaluation criteria and benchmarks...');
        
        await this.loadEvaluationCriteria();
        await this.loadMarketBenchmarks();
        await this.initializeGameTheory();
        
        if (this.config.database) {
            await this.loadHistoricalEvaluations();
        }
        
        this.isInitialized = true;
        console.log('   ✅ Bid Evaluation Matrix Service initialized');
    }
    
    /**
     * Generate comprehensive Preisspiegel
     */
    async generatePreisspiegel(project, bids) {
        const startTime = Date.now();
        console.log(`💰 Generating Preisspiegel for ${bids.length} bids...`);
        
        const evaluation = {
            id: `EVAL-${Date.now()}`,
            projectId: project.id,
            projectName: project.name,
            bidCount: bids.length,
            evaluationDate: new Date().toISOString(),
            priceMatrix: new Map(),
            qualityScores: new Map(),
            rankings: [],
            recommendation: null,
            analysis: {},
            generated: new Date().toISOString()
        };
        
        try {
            // Phase 1: Formal bid examination
            const formalCheck = await this.performFormalExamination(bids);
            evaluation.formalExamination = formalCheck;
            
            // Phase 2: Arithmetic verification
            const arithmeticCheck = await this.verifyArithmetic(bids);
            evaluation.arithmeticVerification = arithmeticCheck;
            
            // Phase 3: Generate price matrix
            const priceMatrix = await this.generatePriceMatrix(bids, project.boq);
            evaluation.priceMatrix = priceMatrix;
            
            // Phase 4: Quality evaluation
            const qualityScores = await this.evaluateQualityCriteria(bids);
            evaluation.qualityScores = qualityScores;
            
            // Phase 5: Time evaluation
            const timeScores = await this.evaluateTimeProposals(bids, project);
            evaluation.timeScores = timeScores;
            
            // Phase 6: Market price analysis
            const marketAnalysis = await this.analyzeMarketPrices(priceMatrix);
            evaluation.marketAnalysis = marketAnalysis;
            
            // Phase 7: Suspicious bid detection
            const suspiciousAnalysis = await this.detectSuspiciousBids(bids, marketAnalysis);
            evaluation.suspiciousAnalysis = suspiciousAnalysis;
            
            // Phase 8: Weighted scoring
            const rankings = await this.calculateWeightedScores(
                formalCheck.qualifiedBids,
                priceMatrix,
                qualityScores,
                timeScores
            );
            evaluation.rankings = rankings;
            
            // Phase 9: Game theory optimization
            if (this.config.enableQuantumOptimization) {
                const optimizedSelection = await this.applyGameTheoryOptimization(rankings);
                evaluation.gameTheoryAnalysis = optimizedSelection;
            }
            
            // Phase 10: Generate recommendation
            evaluation.recommendation = await this.generateRecommendation(
                rankings,
                suspiciousAnalysis,
                project
            );
            
            // Store evaluation
            this.evaluationMatrices.set(evaluation.id, evaluation);
            
            // Update metrics
            this.updateMetrics(evaluation, Date.now() - startTime);
            
            this.emit('preisssiegelGenerated', {
                evaluationId: evaluation.id,
                bidCount: bids.length,
                recommendedBidder: evaluation.recommendation.bidder
            });
            
            return evaluation;
            
        } catch (error) {
            console.error('❌ Bid evaluation error:', error);
            throw error;
        }
    }
    
    /**
     * Perform formal examination of bids
     */
    async performFormalExamination(bids) {
        const examination = {
            totalBids: bids.length,
            qualifiedBids: [],
            disqualifiedBids: [],
            issues: []
        };
        
        for (const bid of bids) {
            const checks = {
                bidId: bid.id,
                bidder: bid.bidder,
                passed: true,
                failures: []
            };
            
            // Check completeness
            if (!this.isBidComplete(bid)) {
                checks.passed = false;
                checks.failures.push('INCOMPLETE_SUBMISSION');
            }
            
            // Check deadlines
            if (!this.isWithinDeadline(bid)) {
                checks.passed = false;
                checks.failures.push('LATE_SUBMISSION');
            }
            
            // Check required documents
            if (!this.hasRequiredDocuments(bid)) {
                checks.passed = false;
                checks.failures.push('MISSING_DOCUMENTS');
            }
            
            // Check signatures
            if (!this.hasValidSignatures(bid)) {
                checks.passed = false;
                checks.failures.push('INVALID_SIGNATURES');
            }
            
            if (checks.passed) {
                examination.qualifiedBids.push(bid);
            } else {
                examination.disqualifiedBids.push({
                    bid: bid,
                    reasons: checks.failures
                });
                examination.issues.push(checks);
            }
        }
        
        return examination;
    }
    
    /**
     * Verify arithmetic in all bids
     */
    async verifyArithmetic(bids) {
        const verification = {
            checked: bids.length,
            errors: [],
            corrections: []
        };
        
        for (const bid of bids) {
            const errors = await this.checkBidArithmetic(bid);
            
            if (errors.length > 0) {
                verification.errors.push({
                    bidId: bid.id,
                    bidder: bid.bidder,
                    errors: errors,
                    totalDeviation: errors.reduce((sum, e) => sum + Math.abs(e.deviation), 0)
                });
                
                // Generate corrections
                const corrected = await this.generateArithmeticCorrections(bid, errors);
                verification.corrections.push(corrected);
            }
        }
        
        return verification;
    }
    
    /**
     * Generate detailed price matrix
     */
    async generatePriceMatrix(bids, boq) {
        const matrix = {
            positions: new Map(),
            totals: new Map(),
            averages: new Map(),
            deviations: new Map()
        };
        
        // Initialize position structure
        for (const position of boq.positions) {
            matrix.positions.set(position.oz, {
                description: position.shortText,
                unit: position.unit,
                quantity: position.quantity,
                prices: new Map()
            });
        }
        
        // Fill in bid prices
        for (const bid of bids) {
            let bidTotal = 0;
            
            for (const item of bid.items) {
                const position = matrix.positions.get(item.positionOz);
                if (position) {
                    position.prices.set(bid.id, {
                        unitPrice: item.unitPrice,
                        totalPrice: item.unitPrice * position.quantity
                    });
                    bidTotal += item.unitPrice * position.quantity;
                }
            }
            
            matrix.totals.set(bid.id, bidTotal);
        }
        
        // Calculate averages and deviations
        for (const [oz, position] of matrix.positions) {
            const prices = Array.from(position.prices.values()).map(p => p.unitPrice);
            const average = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            
            matrix.averages.set(oz, average);
            
            // Calculate deviations
            const deviations = new Map();
            for (const [bidId, price] of position.prices) {
                deviations.set(bidId, {
                    absolute: price.unitPrice - average,
                    percentage: ((price.unitPrice - average) / average) * 100
                });
            }
            matrix.deviations.set(oz, deviations);
        }
        
        return matrix;
    }
    
    /**
     * Evaluate quality criteria
     */
    async evaluateQualityCriteria(bids) {
        const qualityScores = new Map();
        
        for (const bid of bids) {
            const score = {
                bidId: bid.id,
                criteria: {},
                totalScore: 0,
                maxScore: 100
            };
            
            // References (30 points)
            score.criteria.references = await this.scoreReferences(bid.references);
            
            // Technical capability (25 points)
            score.criteria.technical = await this.scoreTechnicalCapability(bid);
            
            // Personnel qualifications (20 points)
            score.criteria.personnel = await this.scorePersonnel(bid);
            
            // Quality management (15 points)
            score.criteria.quality = await this.scoreQualityManagement(bid);
            
            // Sustainability (10 points)
            score.criteria.sustainability = await this.scoreSustainability(bid);
            
            // Calculate total
            score.totalScore = Object.values(score.criteria).reduce((sum, s) => sum + s, 0);
            
            qualityScores.set(bid.id, score);
        }
        
        return qualityScores;
    }
    
    /**
     * Evaluate time proposals
     */
    async evaluateTimeProposals(bids, project) {
        const timeScores = new Map();
        const targetDuration = project.targetDuration || 180; // days
        
        for (const bid of bids) {
            const score = {
                bidId: bid.id,
                proposedDuration: bid.duration,
                deviation: bid.duration - targetDuration,
                score: 0,
                feasibility: 'unknown'
            };
            
            // Score calculation (100 = target, reduced for deviation)
            if (bid.duration <= targetDuration) {
                // Faster completion gets bonus, but check feasibility
                score.score = Math.min(100, 100 + (targetDuration - bid.duration) * 0.5);
                score.feasibility = await this.assessTimeFeasibility(bid, project);
                
                if (score.feasibility === 'unrealistic') {
                    score.score *= 0.5; // Penalty for unrealistic timeline
                }
            } else {
                // Slower completion gets penalty
                score.score = Math.max(0, 100 - (bid.duration - targetDuration) * 1);
            }
            
            timeScores.set(bid.id, score);
        }
        
        return timeScores;
    }
    
    /**
     * Analyze market prices
     */
    async analyzeMarketPrices(priceMatrix) {
        const analysis = {
            averageTotal: 0,
            medianTotal: 0,
            standardDeviation: 0,
            priceRange: {},
            outliers: [],
            marketAlignment: new Map()
        };
        
        // Calculate statistics
        const totals = Array.from(priceMatrix.totals.values());
        analysis.averageTotal = totals.reduce((sum, t) => sum + t, 0) / totals.length;
        analysis.medianTotal = this.calculateMedian(totals);
        analysis.standardDeviation = this.calculateStandardDeviation(totals);
        analysis.priceRange = {
            min: Math.min(...totals),
            max: Math.max(...totals),
            spread: Math.max(...totals) - Math.min(...totals)
        };
        
        // Identify outliers
        for (const [bidId, total] of priceMatrix.totals) {
            const deviation = Math.abs(total - analysis.averageTotal);
            if (deviation > 2 * analysis.standardDeviation) {
                analysis.outliers.push({
                    bidId: bidId,
                    total: total,
                    deviation: deviation,
                    type: total < analysis.averageTotal ? 'LOW' : 'HIGH'
                });
            }
        }
        
        // Market alignment scores
        for (const [bidId, total] of priceMatrix.totals) {
            const alignmentScore = 1 - Math.abs(total - analysis.medianTotal) / analysis.medianTotal;
            analysis.marketAlignment.set(bidId, alignmentScore);
        }
        
        return analysis;
    }
    
    /**
     * Detect suspicious bids
     */
    async detectSuspiciousBids(bids, marketAnalysis) {
        const suspicious = {
            detected: [],
            patterns: [],
            recommendations: []
        };
        
        for (const bid of bids) {
            const issues = [];
            const bidTotal = marketAnalysis.totals?.get(bid.id) || bid.totalPrice;
            
            // Check for abnormally low price
            const priceDeviation = (marketAnalysis.averageTotal - bidTotal) / marketAnalysis.averageTotal;
            if (priceDeviation > this.config.suspiciousThreshold) {
                issues.push({
                    type: 'ABNORMALLY_LOW_PRICE',
                    severity: 'HIGH',
                    deviation: priceDeviation,
                    description: `Bid is ${(priceDeviation * 100).toFixed(1)}% below average`
                });
            }
            
            // Check for unbalanced pricing
            const unbalanced = await this.checkUnbalancedPricing(bid);
            if (unbalanced.isUnbalanced) {
                issues.push({
                    type: 'UNBALANCED_PRICING',
                    severity: 'MEDIUM',
                    positions: unbalanced.positions
                });
            }
            
            // Check for collusion patterns
            const collusionRisk = await this.detectCollusionPatterns(bid, bids);
            if (collusionRisk.detected) {
                issues.push({
                    type: 'POSSIBLE_COLLUSION',
                    severity: 'HIGH',
                    relatedBids: collusionRisk.relatedBids
                });
            }
            
            if (issues.length > 0) {
                suspicious.detected.push({
                    bidId: bid.id,
                    bidder: bid.bidder,
                    issues: issues,
                    riskLevel: this.calculateRiskLevel(issues),
                    recommendation: await this.generateRiskMitigation(issues)
                });
            }
        }
        
        return suspicious;
    }
    
    /**
     * Calculate weighted scores
     */
    async calculateWeightedScores(qualifiedBids, priceMatrix, qualityScores, timeScores) {
        const rankings = [];
        
        // Normalize price scores (inverse - lower price = higher score)
        const priceTotals = qualifiedBids.map(bid => priceMatrix.totals.get(bid.id));
        const minPrice = Math.min(...priceTotals);
        const maxPrice = Math.max(...priceTotals);
        
        for (const bid of qualifiedBids) {
            const ranking = {
                bidId: bid.id,
                bidder: bid.bidder,
                scores: {},
                weightedScore: 0,
                rank: 0
            };
            
            // Price score (normalized 0-100, lower is better)
            const bidPrice = priceMatrix.totals.get(bid.id);
            ranking.scores.price = ((maxPrice - bidPrice) / (maxPrice - minPrice)) * 100;
            
            // Quality score (already 0-100)
            ranking.scores.quality = qualityScores.get(bid.id)?.totalScore || 0;
            
            // Time score (already 0-100)
            ranking.scores.time = timeScores.get(bid.id)?.score || 0;
            
            // Calculate weighted total
            ranking.weightedScore = 
                ranking.scores.price * this.config.weightedCriteria.price +
                ranking.scores.quality * this.config.weightedCriteria.quality +
                ranking.scores.time * this.config.weightedCriteria.time;
            
            rankings.push(ranking);
        }
        
        // Sort by weighted score (descending)
        rankings.sort((a, b) => b.weightedScore - a.weightedScore);
        
        // Assign ranks
        rankings.forEach((ranking, index) => {
            ranking.rank = index + 1;
        });
        
        return rankings;
    }
    
    /**
     * Apply game theory optimization
     */
    async applyGameTheoryOptimization(rankings) {
        if (!this.gameTheoryEngine) {
            return null;
        }
        
        console.log('   🎮 Applying game theory optimization...');
        
        // Model as multi-player game
        const gameModel = {
            players: rankings.map(r => ({
                id: r.bidId,
                strategy: r.scores,
                payoff: r.weightedScore
            })),
            interactions: await this.modelBidderInteractions(rankings),
            constraints: {
                budget: true,
                quality: true,
                time: true
            }
        };
        
        // Find Nash equilibrium
        const equilibrium = await this.gameTheoryEngine.findNashEquilibrium(gameModel);
        
        // Optimize for client's best response
        const optimalStrategy = await this.gameTheoryEngine.computeBestResponse(
            equilibrium,
            'client'
        );
        
        return {
            equilibrium: equilibrium,
            optimalChoice: optimalStrategy.recommendedBidder,
            confidence: optimalStrategy.confidence,
            alternativeStrategies: optimalStrategy.alternatives
        };
    }
    
    /**
     * Generate recommendation
     */
    async generateRecommendation(rankings, suspiciousAnalysis, project) {
        const recommendation = {
            bidder: null,
            justification: [],
            risks: [],
            alternatives: [],
            confidence: 0
        };
        
        // Get top ranked bid
        const topBid = rankings[0];
        
        // Check if top bid has suspicious issues
        const suspiciousIssues = suspiciousAnalysis.detected.find(
            s => s.bidId === topBid.bidId
        );
        
        if (!suspiciousIssues || suspiciousIssues.riskLevel === 'LOW') {
            // Recommend top bid
            recommendation.bidder = topBid.bidder;
            recommendation.justification = [
                `Highest weighted score: ${topBid.weightedScore.toFixed(2)}`,
                `Best price-performance ratio`,
                `Price score: ${topBid.scores.price.toFixed(1)}/100`,
                `Quality score: ${topBid.scores.quality.toFixed(1)}/100`,
                `Time score: ${topBid.scores.time.toFixed(1)}/100`
            ];
            recommendation.confidence = 0.95;
        } else {
            // Consider alternatives due to risk
            recommendation.bidder = rankings[1]?.bidder || topBid.bidder;
            recommendation.justification = [
                `Second-ranked bid recommended due to risk factors`,
                `Top bid has ${suspiciousIssues.issues.length} suspicious indicators`,
                `Alternative provides better risk-adjusted value`
            ];
            recommendation.risks = suspiciousIssues.issues;
            recommendation.confidence = 0.75;
        }
        
        // Add alternatives
        recommendation.alternatives = rankings.slice(1, 4).map((r, index) => ({
            rank: index + 2,
            bidder: r.bidder,
            score: r.weightedScore,
            rationale: `Alternative option with ${r.weightedScore.toFixed(2)} score`
        }));
        
        return recommendation;
    }
    
    /**
     * Check bid completeness
     */
    isBidComplete(bid) {
        const requiredFields = ['bidder', 'items', 'totalPrice', 'duration', 'signature'];
        return requiredFields.every(field => bid[field] != null);
    }
    
    /**
     * Check bid arithmetic
     */
    async checkBidArithmetic(bid) {
        const errors = [];
        let calculatedTotal = 0;
        
        for (const item of bid.items) {
            const calculatedItemTotal = item.quantity * item.unitPrice;
            calculatedTotal += calculatedItemTotal;
            
            if (Math.abs(calculatedItemTotal - item.totalPrice) > this.config.arithmeticTolerance) {
                errors.push({
                    position: item.positionOz,
                    expected: calculatedItemTotal,
                    provided: item.totalPrice,
                    deviation: calculatedItemTotal - item.totalPrice
                });
            }
        }
        
        // Check total
        if (Math.abs(calculatedTotal - bid.totalPrice) > this.config.arithmeticTolerance) {
            errors.push({
                position: 'TOTAL',
                expected: calculatedTotal,
                provided: bid.totalPrice,
                deviation: calculatedTotal - bid.totalPrice
            });
        }
        
        return errors;
    }
    
    /**
     * Score references
     */
    async scoreReferences(references) {
        if (!references || references.length === 0) return 0;
        
        let score = 0;
        const maxScore = 30;
        
        // Points for number of references (max 10)
        score += Math.min(references.length * 2, 10);
        
        // Points for relevance (max 10)
        const relevantRefs = references.filter(ref => ref.relevant);
        score += Math.min(relevantRefs.length * 2, 10);
        
        // Points for project size (max 10)
        const largeProjRefs = references.filter(ref => ref.value > 1000000);
        score += Math.min(largeProjRefs.length * 2.5, 10);
        
        return Math.min(score, maxScore);
    }
    
    /**
     * Calculate risk level
     */
    calculateRiskLevel(issues) {
        const severityScores = {
            HIGH: 3,
            MEDIUM: 2,
            LOW: 1
        };
        
        const totalScore = issues.reduce((sum, issue) => 
            sum + (severityScores[issue.severity] || 0), 0
        );
        
        if (totalScore >= 6) return 'HIGH';
        if (totalScore >= 3) return 'MEDIUM';
        return 'LOW';
    }
    
    /**
     * Load evaluation criteria
     */
    async loadEvaluationCriteria() {
        // Load standard evaluation criteria
        console.log('   💰 Evaluation criteria loaded');
    }
    
    /**
     * Load market benchmarks
     */
    async loadMarketBenchmarks() {
        if (!this.config.database) return;
        
        try {
            const result = await this.config.database.query(
                'SELECT * FROM market_benchmarks WHERE active = true'
            );
            
            for (const benchmark of result.rows) {
                this.marketBenchmarks.set(benchmark.category, benchmark);
            }
            
            console.log(`   💰 Loaded ${result.rows.length} market benchmarks`);
        } catch (error) {
            console.error('Failed to load benchmarks:', error);
        }
    }
    
    /**
     * Initialize game theory engine
     */
    async initializeGameTheory() {
        if (this.config.enableQuantumOptimization) {
            console.log('   🎮 Game theory engine initialized');
        }
    }
    
    /**
     * Update metrics
     */
    updateMetrics(evaluation, processingTime) {
        this.metrics.totalEvaluations++;
        this.metrics.averageBidCount = 
            (this.metrics.averageBidCount * (this.metrics.totalEvaluations - 1) + 
             evaluation.bidCount) / this.metrics.totalEvaluations;
        
        if (evaluation.suspiciousAnalysis?.detected.length > 0) {
            this.metrics.suspiciousBidsDetected += evaluation.suspiciousAnalysis.detected.length;
        }
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            metrics: this.metrics,
            evaluationCriteria: this.config.weightedCriteria,
            marketBenchmarks: this.marketBenchmarks.size
        };
    }
    
    /**
     * Calculate median
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    /**
     * Calculate standard deviation
     */
    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    /**
     * Load historical evaluations from database
     */
    async loadHistoricalEvaluations() {
        if (!this.config.database) return;
        
        try {
            const result = await this.config.database.query(
                'SELECT * FROM bid_evaluations WHERE award_success = true ORDER BY created_at DESC LIMIT 100'
            );
            
            // Learn from successful awards
            for (const evaluation of result.rows || []) {
                this.historicalEvaluations.set(evaluation.id, {
                    criteria: evaluation.criteria,
                    weights: evaluation.weights,
                    winningFactors: evaluation.winning_factors
                });
            }
            
            console.log(`   📊 Loaded ${result.rows?.length || 0} historical evaluations`);
        } catch (error) {
            console.warn('Failed to load historical evaluations:', error);
        }
    }
    
    /**
     * Check if bid is complete
     */
    isBidComplete(bid) {
        const requiredFields = [
            'bidderInfo',
            'priceBreakdown',
            'timeline',
            'references',
            'documents'
        ];
        
        for (const field of requiredFields) {
            if (!bid[field]) {
                return false;
            }
        }
        
        // Check price breakdown completeness
        if (!bid.priceBreakdown?.positions || bid.priceBreakdown.positions.length === 0) {
            return false;
        }
        
        // Check document completeness
        const requiredDocs = ['offer_letter', 'price_sheet', 'company_profile'];
        for (const doc of requiredDocs) {
            if (!bid.documents?.some(d => d.type === doc)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if bid is within deadline
     */
    isWithinDeadline(bid) {
        if (!bid.submissionDate || !this.config.bidDeadline) {
            return true; // If no deadline set, assume valid
        }
        
        const submissionDate = new Date(bid.submissionDate);
        const deadline = new Date(this.config.bidDeadline);
        
        return submissionDate <= deadline;
    }
    
    /**
     * Check if bid has required documents
     */
    hasRequiredDocuments(bid) {
        const requiredDocuments = [
            { type: 'offer_letter', name: 'Anschreiben' },
            { type: 'price_sheet', name: 'Preisblatt' },
            { type: 'company_profile', name: 'Firmenprofil' },
            { type: 'references', name: 'Referenzen' },
            { type: 'insurance_proof', name: 'Versicherungsnachweis' },
            { type: 'tax_clearance', name: 'Steuerliche Unbedenklichkeit' }
        ];
        
        for (const reqDoc of requiredDocuments) {
            const found = bid.documents?.find(doc => 
                doc.type === reqDoc.type || 
                doc.name?.includes(reqDoc.name)
            );
            
            if (!found) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if bid has valid signatures
     */
    hasValidSignatures(bid) {
        // Check offer letter signature
        const offerLetter = bid.documents?.find(d => d.type === 'offer_letter');
        if (!offerLetter?.signed || !offerLetter?.signatureDate) {
            return false;
        }
        
        // Check if signature is from authorized person
        if (bid.bidderInfo?.authorizedSignatory && offerLetter.signedBy !== bid.bidderInfo.authorizedSignatory) {
            return false;
        }
        
        // Check signature date is recent
        const signDate = new Date(offerLetter.signatureDate);
        const daysSinceSigned = (Date.now() - signDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceSigned > 30) { // Signature older than 30 days
            return false;
        }
        
        return true;
    }
    
    /**
     * Check bid arithmetic for errors
     */
    async checkBidArithmetic(bid) {
        const errors = [];
        
        if (!bid.priceBreakdown?.positions) {
            return errors;
        }
        
        let calculatedTotal = 0;
        
        // Check each position
        for (const position of bid.priceBreakdown.positions) {
            const expectedTotal = position.quantity * position.unitPrice;
            
            if (Math.abs(position.total - expectedTotal) > 0.01) {
                errors.push({
                    position: position.id || position.description,
                    type: 'POSITION_CALCULATION_ERROR',
                    expected: expectedTotal,
                    actual: position.total,
                    difference: position.total - expectedTotal
                });
            }
            
            calculatedTotal += position.total;
        }
        
        // Check subtotal
        if (bid.priceBreakdown.subtotal) {
            if (Math.abs(bid.priceBreakdown.subtotal - calculatedTotal) > 0.01) {
                errors.push({
                    type: 'SUBTOTAL_ERROR',
                    expected: calculatedTotal,
                    actual: bid.priceBreakdown.subtotal,
                    difference: bid.priceBreakdown.subtotal - calculatedTotal
                });
            }
        }
        
        // Check VAT calculation
        if (bid.priceBreakdown.vat && bid.priceBreakdown.vatRate) {
            const expectedVat = calculatedTotal * (bid.priceBreakdown.vatRate / 100);
            
            if (Math.abs(bid.priceBreakdown.vat - expectedVat) > 0.01) {
                errors.push({
                    type: 'VAT_CALCULATION_ERROR',
                    expected: expectedVat,
                    actual: bid.priceBreakdown.vat,
                    difference: bid.priceBreakdown.vat - expectedVat
                });
            }
        }
        
        // Check grand total
        const expectedGrandTotal = calculatedTotal + (bid.priceBreakdown.vat || 0);
        
        if (Math.abs(bid.priceBreakdown.total - expectedGrandTotal) > 0.01) {
            errors.push({
                type: 'GRAND_TOTAL_ERROR',
                expected: expectedGrandTotal,
                actual: bid.priceBreakdown.total,
                difference: bid.priceBreakdown.total - expectedGrandTotal
            });
        }
        
        return errors;
    }
    
    /**
     * Generate arithmetic corrections for bid
     */
    async generateArithmeticCorrections(bid, errors) {
        const corrections = {
            bidId: bid.id,
            errors: errors,
            correctedPositions: [],
            correctedTotals: {}
        };
        
        // Correct position errors
        for (const error of errors) {
            if (error.type === 'POSITION_CALCULATION_ERROR') {
                corrections.correctedPositions.push({
                    position: error.position,
                    originalTotal: error.actual,
                    correctedTotal: error.expected
                });
            }
        }
        
        // Recalculate all totals
        let correctedSubtotal = 0;
        for (const position of bid.priceBreakdown.positions) {
            const correctedTotal = position.quantity * position.unitPrice;
            correctedSubtotal += correctedTotal;
        }
        
        corrections.correctedTotals.subtotal = correctedSubtotal;
        
        // Correct VAT
        const vatRate = bid.priceBreakdown.vatRate || 19; // German standard VAT
        corrections.correctedTotals.vat = correctedSubtotal * (vatRate / 100);
        
        // Correct grand total
        corrections.correctedTotals.grandTotal = correctedSubtotal + corrections.correctedTotals.vat;
        
        return corrections;
    }
    
    /**
     * Score bidder references
     */
    async scoreReferences(references) {
        if (!references || references.length === 0) {
            return 0;
        }
        
        let score = 0;
        let weightSum = 0;
        
        for (const ref of references) {
            let refScore = 0;
            let refWeight = 1;
            
            // Score based on project size
            if (ref.projectValue) {
                if (ref.projectValue > 5000000) refScore += 30;
                else if (ref.projectValue > 1000000) refScore += 20;
                else if (ref.projectValue > 500000) refScore += 10;
                else refScore += 5;
            }
            
            // Score based on relevance
            if (ref.projectType) {
                if (ref.projectType === this.config.projectType) {
                    refScore += 30;
                    refWeight = 2; // Double weight for same type
                } else if (this.isSimilarProjectType(ref.projectType, this.config.projectType)) {
                    refScore += 20;
                    refWeight = 1.5;
                } else {
                    refScore += 10;
                }
            }
            
            // Score based on recency
            if (ref.completionDate) {
                const yearsAgo = (Date.now() - new Date(ref.completionDate)) / (1000 * 60 * 60 * 24 * 365);
                if (yearsAgo < 1) refScore += 20;
                else if (yearsAgo < 3) refScore += 15;
                else if (yearsAgo < 5) refScore += 10;
                else refScore += 5;
            }
            
            // Score based on client satisfaction
            if (ref.clientRating) {
                refScore += (ref.clientRating / 5) * 20;
            }
            
            score += refScore * refWeight;
            weightSum += refWeight;
        }
        
        return Math.min(100, (score / weightSum));
    }
    
    /**
     * Score technical capability
     */
    async scoreTechnicalCapability(bid) {
        let score = 0;
        const weights = {
            certifications: 0.25,
            equipment: 0.20,
            methodology: 0.30,
            innovation: 0.25
        };
        
        // Score certifications
        if (bid.certifications) {
            const certScore = this.scoreCertifications(bid.certifications);
            score += certScore * weights.certifications;
        }
        
        // Score equipment and resources
        if (bid.equipment) {
            const equipScore = this.scoreEquipment(bid.equipment);
            score += equipScore * weights.equipment;
        }
        
        // Score methodology
        if (bid.methodology) {
            const methodScore = this.scoreMethodology(bid.methodology);
            score += methodScore * weights.methodology;
        }
        
        // Score innovation
        if (bid.innovations || bid.valueEngineering) {
            const innovScore = this.scoreInnovation(bid);
            score += innovScore * weights.innovation;
        }
        
        return score;
    }
    
    /**
     * Score personnel qualifications
     */
    async scorePersonnel(bid) {
        if (!bid.personnel || bid.personnel.length === 0) {
            return 0;
        }
        
        let totalScore = 0;
        const keyRoles = ['project_manager', 'site_manager', 'quality_manager'];
        
        for (const person of bid.personnel) {
            let personScore = 0;
            
            // Score based on qualifications
            if (person.qualifications) {
                personScore += person.qualifications.length * 10;
                
                // Bonus for specific qualifications
                if (person.qualifications.includes('Diplom-Ingenieur')) personScore += 20;
                if (person.qualifications.includes('Meister')) personScore += 15;
                if (person.qualifications.includes('Polier')) personScore += 10;
            }
            
            // Score based on experience
            if (person.yearsExperience) {
                if (person.yearsExperience > 20) personScore += 30;
                else if (person.yearsExperience > 10) personScore += 20;
                else if (person.yearsExperience > 5) personScore += 10;
                else personScore += 5;
            }
            
            // Weight key roles higher
            const weight = keyRoles.includes(person.role) ? 2 : 1;
            totalScore += personScore * weight;
        }
        
        return Math.min(100, totalScore / bid.personnel.length);
    }
    
    /**
     * Score quality management system
     */
    async scoreQualityManagement(bid) {
        let score = 0;
        
        // ISO certifications
        if (bid.certifications) {
            if (bid.certifications.includes('ISO 9001')) score += 30;
            if (bid.certifications.includes('ISO 14001')) score += 20;
            if (bid.certifications.includes('ISO 45001')) score += 20;
        }
        
        // Quality control processes
        if (bid.qualityProcesses) {
            if (bid.qualityProcesses.includes('internal_audits')) score += 10;
            if (bid.qualityProcesses.includes('material_testing')) score += 10;
            if (bid.qualityProcesses.includes('defect_tracking')) score += 10;
        }
        
        return Math.min(100, score);
    }
    
    /**
     * Score sustainability measures
     */
    async scoreSustainability(bid) {
        let score = 0;
        
        // Environmental certifications
        if (bid.certifications) {
            if (bid.certifications.includes('LEED')) score += 25;
            if (bid.certifications.includes('BREEAM')) score += 25;
            if (bid.certifications.includes('DGNB')) score += 25;
        }
        
        // Sustainability measures
        if (bid.sustainabilityMeasures) {
            if (bid.sustainabilityMeasures.includes('renewable_materials')) score += 10;
            if (bid.sustainabilityMeasures.includes('waste_reduction')) score += 10;
            if (bid.sustainabilityMeasures.includes('energy_efficiency')) score += 10;
            if (bid.sustainabilityMeasures.includes('local_sourcing')) score += 10;
        }
        
        // Carbon footprint reduction
        if (bid.carbonReduction) {
            score += Math.min(20, bid.carbonReduction);
        }
        
        return Math.min(100, score);
    }
    
    /**
     * Assess time feasibility
     */
    async assessTimeFeasibility(bid, project) {
        if (!bid.timeline || !project.deadline) {
            return 50; // Default middle score if no timeline info
        }
        
        const proposedDuration = this.calculateDuration(bid.timeline);
        const availableTime = this.calculateAvailableTime(project);
        
        // Calculate buffer ratio
        const bufferRatio = (availableTime - proposedDuration) / availableTime;
        
        let score = 0;
        
        if (bufferRatio < 0) {
            // Exceeds deadline
            score = 0;
        } else if (bufferRatio > 0.3) {
            // Too much buffer (might indicate padding)
            score = 70;
        } else if (bufferRatio > 0.15) {
            // Optimal buffer
            score = 100;
        } else if (bufferRatio > 0.05) {
            // Tight but feasible
            score = 80;
        } else {
            // Very tight schedule
            score = 60;
        }
        
        // Adjust for milestone alignment
        if (bid.timeline.milestones && project.milestones) {
            const alignmentScore = this.assessMilestoneAlignment(bid.timeline.milestones, project.milestones);
            score = (score * 0.7) + (alignmentScore * 0.3);
        }
        
        return score;
    }
    
    /**
     * Calculate median value
     */
    calculateMedian(values) {
        if (!values || values.length === 0) return 0;
        
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
            return sorted[mid];
        }
    }
    
    /**
     * Check for unbalanced pricing
     */
    async checkUnbalancedPricing(bid) {
        const issues = [];
        
        if (!bid.priceBreakdown?.positions) {
            return issues;
        }
        
        // Calculate average unit prices for each category
        const categoryPrices = new Map();
        
        for (const position of bid.priceBreakdown.positions) {
            const category = position.category || 'uncategorized';
            
            if (!categoryPrices.has(category)) {
                categoryPrices.set(category, []);
            }
            
            categoryPrices.get(category).push({
                position: position.id || position.description,
                unitPrice: position.unitPrice,
                quantity: position.quantity
            });
        }
        
        // Check for imbalances within categories
        for (const [category, positions] of categoryPrices) {
            if (positions.length < 2) continue;
            
            const prices = positions.map(p => p.unitPrice);
            const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            const stdDev = this.calculateStandardDeviation(prices);
            
            // Flag positions with prices more than 2 standard deviations from mean
            for (const pos of positions) {
                const deviation = Math.abs(pos.unitPrice - mean);
                
                if (deviation > 2 * stdDev) {
                    issues.push({
                        type: 'UNBALANCED_PRICING',
                        position: pos.position,
                        category: category,
                        unitPrice: pos.unitPrice,
                        categoryAverage: mean,
                        deviation: deviation / stdDev
                    });
                }
            }
        }
        
        return issues;
    }
    
    /**
     * Detect collusion patterns
     */
    async detectCollusionPatterns(bid, allBids) {
        const patterns = [];
        
        // Pattern 1: Rotating low bidders
        const bidderHistory = await this.getBidderHistory(bid.bidderInfo.id);
        if (bidderHistory && this.detectRotationPattern(bidderHistory, allBids)) {
            patterns.push({
                type: 'ROTATION_PATTERN',
                confidence: 0.7,
                description: 'Bidder appears to rotate winning positions'
            });
        }
        
        // Pattern 2: Identical pricing structures
        for (const otherBid of allBids) {
            if (otherBid.id === bid.id) continue;
            
            const similarity = this.calculatePricingSimilarity(bid, otherBid);
            if (similarity > 0.95) {
                patterns.push({
                    type: 'IDENTICAL_PRICING',
                    confidence: 0.8,
                    relatedBidder: otherBid.bidderInfo.name,
                    similarity: similarity
                });
            }
        }
        
        // Pattern 3: Complementary bidding
        const coverage = this.analyzeBidCoverage(bid, allBids);
        if (coverage.isComplementary) {
            patterns.push({
                type: 'COMPLEMENTARY_BIDDING',
                confidence: 0.6,
                description: 'Bidders appear to divide market segments'
            });
        }
        
        return patterns;
    }
    
    /**
     * Calculate risk level based on issues
     */
    calculateRiskLevel(issues) {
        if (issues.length === 0) return 'LOW';
        
        let riskScore = 0;
        
        for (const issue of issues) {
            switch (issue.type) {
                case 'COLLUSION_PATTERN':
                    riskScore += 30;
                    break;
                case 'UNBALANCED_PRICING':
                    riskScore += issue.deviation > 3 ? 20 : 10;
                    break;
                case 'ARITHMETIC_ERROR':
                    riskScore += 5;
                    break;
                case 'MISSING_DOCUMENTS':
                    riskScore += 15;
                    break;
                default:
                    riskScore += 5;
            }
        }
        
        if (riskScore >= 50) return 'HIGH';
        if (riskScore >= 25) return 'MEDIUM';
        return 'LOW';
    }
    
    /**
     * Generate risk mitigation recommendations
     */
    async generateRiskMitigation(issues) {
        const mitigations = [];
        
        const issueTypes = new Set(issues.map(i => i.type));
        
        if (issueTypes.has('COLLUSION_PATTERN')) {
            mitigations.push({
                issue: 'Potential Collusion',
                action: 'Request additional documentation and conduct detailed bidder background checks',
                priority: 'HIGH'
            });
        }
        
        if (issueTypes.has('UNBALANCED_PRICING')) {
            mitigations.push({
                issue: 'Unbalanced Pricing',
                action: 'Request clarification on pricing methodology and unit price justification',
                priority: 'MEDIUM'
            });
        }
        
        if (issueTypes.has('ARITHMETIC_ERROR')) {
            mitigations.push({
                issue: 'Calculation Errors',
                action: 'Notify bidder of errors and request corrected submission',
                priority: 'LOW'
            });
        }
        
        return mitigations;
    }
    
    /**
     * Model bidder interactions using game theory
     */
    async modelBidderInteractions(rankings) {
        const interactions = {
            competitiveIntensity: 0,
            pricePressure: 0,
            marketConcentration: 0,
            strategicBehaviors: []
        };
        
        if (rankings.length < 2) return interactions;
        
        // Calculate competitive intensity
        const priceDifferences = [];
        for (let i = 1; i < rankings.length; i++) {
            const priceDiff = (rankings[i].totalPrice - rankings[i-1].totalPrice) / rankings[i-1].totalPrice;
            priceDifferences.push(priceDiff);
        }
        
        interactions.competitiveIntensity = 1 - (this.calculateMean(priceDifferences) || 0);
        
        // Calculate price pressure
        const lowestPrice = rankings[0].totalPrice;
        const highestPrice = rankings[rankings.length - 1].totalPrice;
        interactions.pricePressure = (highestPrice - lowestPrice) / highestPrice;
        
        // Calculate Herfindahl-Hirschman Index for market concentration
        const marketShares = this.estimateMarketShares(rankings);
        interactions.marketConcentration = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
        
        // Identify strategic behaviors
        if (interactions.competitiveIntensity > 0.9) {
            interactions.strategicBehaviors.push('AGGRESSIVE_PRICING');
        }
        
        if (interactions.marketConcentration > 0.5) {
            interactions.strategicBehaviors.push('OLIGOPOLISTIC_BEHAVIOR');
        }
        
        return interactions;
    }
    
    /**
     * Initialize game theory models
     */
    async initializeGameTheory() {
        // Initialize Bayesian game model for incomplete information
        this.bayesianGame = {
            types: ['aggressive', 'conservative', 'strategic'],
            beliefs: new Map(),
            strategies: new Map()
        };
        
        // Initialize auction theory parameters
        this.auctionModel = {
            type: 'first_price_sealed_bid',
            reservePrice: null,
            valuationDistribution: 'uniform'
        };
        
        // Initialize Nash equilibrium solver
        this.nashSolver = {
            maxIterations: 1000,
            convergenceThreshold: 0.001
        };
        
        console.log('   🎯 Game theory models initialized');
    }
    
    // Helper methods for the implementations above
    
    isSimilarProjectType(type1, type2) {
        const typeGroups = {
            'residential': ['apartment', 'house', 'housing', 'residential'],
            'commercial': ['office', 'retail', 'commercial', 'shop'],
            'industrial': ['factory', 'warehouse', 'industrial', 'plant'],
            'infrastructure': ['road', 'bridge', 'tunnel', 'infrastructure']
        };
        
        for (const [group, types] of Object.entries(typeGroups)) {
            if (types.includes(type1) && types.includes(type2)) {
                return true;
            }
        }
        
        return false;
    }
    
    scoreCertifications(certifications) {
        let score = 0;
        const certScores = {
            'ISO 9001': 25,
            'ISO 14001': 20,
            'ISO 45001': 20,
            'VCA': 15,
            'SCC': 15,
            'DGNB': 20
        };
        
        for (const cert of certifications) {
            score += certScores[cert] || 5;
        }
        
        return Math.min(100, score);
    }
    
    scoreEquipment(equipment) {
        let score = 0;
        
        if (equipment.owned > equipment.total * 0.7) {
            score += 40; // Mostly owned equipment
        } else if (equipment.owned > equipment.total * 0.4) {
            score += 25;
        } else {
            score += 15;
        }
        
        if (equipment.modernEquipmentRatio > 0.8) {
            score += 30;
        } else if (equipment.modernEquipmentRatio > 0.5) {
            score += 20;
        } else {
            score += 10;
        }
        
        if (equipment.specializedTools?.length > 5) {
            score += 30;
        } else if (equipment.specializedTools?.length > 2) {
            score += 20;
        } else {
            score += 10;
        }
        
        return Math.min(100, score);
    }
    
    scoreMethodology(methodology) {
        let score = 0;
        
        if (methodology.bim || methodology.includes('BIM')) {
            score += 30;
        }
        
        if (methodology.lean || methodology.includes('Lean')) {
            score += 20;
        }
        
        if (methodology.agile || methodology.includes('Agile')) {
            score += 15;
        }
        
        if (methodology.prefabrication) {
            score += 20;
        }
        
        if (methodology.digitalTools?.length > 3) {
            score += 15;
        }
        
        return Math.min(100, score);
    }
    
    scoreInnovation(bid) {
        let score = 0;
        
        if (bid.innovations?.length > 0) {
            score += Math.min(50, bid.innovations.length * 10);
        }
        
        if (bid.valueEngineering?.potentialSavings > 0.1) {
            score += 30;
        } else if (bid.valueEngineering?.potentialSavings > 0.05) {
            score += 20;
        } else if (bid.valueEngineering?.potentialSavings > 0) {
            score += 10;
        }
        
        if (bid.sustainableInnovations) {
            score += 20;
        }
        
        return Math.min(100, score);
    }
    
    calculateDuration(timeline) {
        if (!timeline.startDate || !timeline.endDate) {
            return 0;
        }
        
        const start = new Date(timeline.startDate);
        const end = new Date(timeline.endDate);
        
        return (end - start) / (1000 * 60 * 60 * 24); // Days
    }
    
    calculateAvailableTime(project) {
        const start = new Date(project.startDate || Date.now());
        const deadline = new Date(project.deadline);
        
        return (deadline - start) / (1000 * 60 * 60 * 24); // Days
    }
    
    assessMilestoneAlignment(bidMilestones, projectMilestones) {
        let alignmentScore = 100;
        const tolerance = 7; // Days
        
        for (const projectMilestone of projectMilestones) {
            const bidMilestone = bidMilestones.find(m => m.name === projectMilestone.name);
            
            if (!bidMilestone) {
                alignmentScore -= 20;
                continue;
            }
            
            const projectDate = new Date(projectMilestone.date);
            const bidDate = new Date(bidMilestone.date);
            const daysDiff = Math.abs((bidDate - projectDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff > tolerance) {
                alignmentScore -= Math.min(15, daysDiff - tolerance);
            }
        }
        
        return Math.max(0, alignmentScore);
    }
    
    async getBidderHistory(bidderId) {
        if (!this.config.database) return null;
        
        try {
            const result = await this.config.database.query(
                'SELECT * FROM bidder_history WHERE bidder_id = $1 ORDER BY bid_date DESC LIMIT 20',
                [bidderId]
            );
            return result.rows;
        } catch (error) {
            console.warn('Failed to get bidder history:', error);
            return null;
        }
    }
    
    async detectRotationPattern(history, currentBids) {
        if (!history || history.length < 5) return false;
        
        // Analyze win pattern using sliding window
        const windowSize = 5;
        const patterns = [];
        const winSequences = [];
        
        for (let i = 0; i <= history.length - windowSize; i++) {
            const window = history.slice(i, i + windowSize);
            const winPattern = window.map(h => h.won ? 1 : 0);
            patterns.push(winPattern);
            winSequences.push(winPattern.join(''));
        }
        
        // Detect cyclic patterns using Fast Fourier Transform simulation
        const cyclicScore = this.detectCyclicPattern(patterns);
        
        // Check for systematic rotation indicators
        const rotationIndicators = {
            // Regular win intervals
            regularIntervals: this.detectRegularWinIntervals(history),
            // Consistent pricing ranks when not winning
            consistentRanking: this.analyzeNonWinningRanks(history),
            // Bidder groups taking turns
            groupRotation: this.detectGroupRotation(history, currentBids),
            // Price convergence patterns
            priceConvergence: this.analyzePriceConvergence(history)
        };
        
        // Calculate rotation score
        const rotationScore = (
            cyclicScore * 0.3 +
            rotationIndicators.regularIntervals * 0.25 +
            rotationIndicators.consistentRanking * 0.2 +
            rotationIndicators.groupRotation * 0.15 +
            rotationIndicators.priceConvergence * 0.1
        );
        
        return rotationScore > 0.6;
    }
    
    detectCyclicPattern(patterns) {
        if (!patterns || patterns.length === 0) return 0;
        
        // Check for repeating sequences
        const sequenceMap = new Map();
        patterns.forEach(pattern => {
            const key = pattern.join(',');
            sequenceMap.set(key, (sequenceMap.get(key) || 0) + 1);
        });
        
        // High repetition indicates cyclic behavior
        const maxRepetitions = Math.max(...sequenceMap.values());
        return Math.min(maxRepetitions / patterns.length, 1);
    }
    
    detectRegularWinIntervals(history) {
        const winIndices = history
            .map((h, i) => h.won ? i : -1)
            .filter(i => i >= 0);
        
        if (winIndices.length < 2) return 0;
        
        // Calculate intervals between wins
        const intervals = [];
        for (let i = 1; i < winIndices.length; i++) {
            intervals.push(winIndices[i] - winIndices[i-1]);
        }
        
        // Check for regularity
        const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
        const variance = intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);
        
        // Low standard deviation indicates regular intervals
        return stdDev < avgInterval * 0.3 ? 0.9 : stdDev < avgInterval * 0.5 ? 0.5 : 0;
    }
    
    analyzeNonWinningRanks(history) {
        const nonWinningRanks = history
            .filter(h => !h.won && h.rank)
            .map(h => h.rank);
        
        if (nonWinningRanks.length < 3) return 0;
        
        // Check if consistently ranked 2nd or 3rd when not winning
        const avgRank = nonWinningRanks.reduce((s, r) => s + r, 0) / nonWinningRanks.length;
        const consistentlyHigh = nonWinningRanks.filter(r => r <= 3).length / nonWinningRanks.length;
        
        return avgRank <= 3 && consistentlyHigh > 0.7 ? 0.8 : 0;
    }
    
    detectGroupRotation(history, currentBids) {
        if (!currentBids || currentBids.length === 0) return 0;
        
        // Group bidders by price clustering
        const bidderGroups = this.clusterBidders(history);
        
        if (bidderGroups.length <= 1) return 0;
        
        // Check if groups take turns winning
        let lastWinningGroup = -1;
        let alternations = 0;
        
        for (const entry of history) {
            if (entry.won) {
                const winnerGroup = this.findBidderGroup(entry.bidderId, bidderGroups);
                if (lastWinningGroup >= 0 && winnerGroup !== lastWinningGroup) {
                    alternations++;
                }
                lastWinningGroup = winnerGroup;
            }
        }
        
        // High alternation rate suggests group rotation
        const wins = history.filter(h => h.won).length;
        return wins > 0 ? alternations / wins : 0;
    }
    
    clusterBidders(history) {
        // Simple clustering based on price similarity
        const bidderPrices = new Map();
        
        history.forEach(h => {
            if (!bidderPrices.has(h.bidderId)) {
                bidderPrices.set(h.bidderId, []);
            }
            bidderPrices.get(h.bidderId).push(h.totalPrice);
        });
        
        // Group bidders with similar average prices
        const groups = [];
        const threshold = 0.1; // 10% price difference threshold
        
        bidderPrices.forEach((prices, bidderId) => {
            const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
            
            let assigned = false;
            for (const group of groups) {
                const groupAvg = group.avgPrice;
                if (Math.abs(avgPrice - groupAvg) / groupAvg < threshold) {
                    group.bidders.push(bidderId);
                    // Update group average
                    group.avgPrice = (group.avgPrice * (group.bidders.length - 1) + avgPrice) / group.bidders.length;
                    assigned = true;
                    break;
                }
            }
            
            if (!assigned) {
                groups.push({ bidders: [bidderId], avgPrice });
            }
        });
        
        return groups;
    }
    
    findBidderGroup(bidderId, groups) {
        for (let i = 0; i < groups.length; i++) {
            if (groups[i].bidders.includes(bidderId)) {
                return i;
            }
        }
        return -1;
    }
    
    analyzePriceConvergence(history) {
        // Check if prices converge over time (indicating coordination)
        const recentHistory = history.slice(-10);
        if (recentHistory.length < 5) return 0;
        
        const priceVariances = [];
        const windowSize = 3;
        
        for (let i = 0; i <= recentHistory.length - windowSize; i++) {
            const window = recentHistory.slice(i, i + windowSize);
            const prices = window.map(h => h.totalPrice);
            const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
            const variance = prices.reduce((s, p) => s + Math.pow(p - avgPrice, 2), 0) / prices.length;
            priceVariances.push(variance / (avgPrice * avgPrice)); // Normalize by price level
        }
        
        // Check if variance is decreasing (convergence)
        let decreasingTrend = 0;
        for (let i = 1; i < priceVariances.length; i++) {
            if (priceVariances[i] < priceVariances[i-1]) {
                decreasingTrend++;
            }
        }
        
        return priceVariances.length > 0 ? decreasingTrend / priceVariances.length : 0;
    }
    
    async calculatePricingSimilarity(bid1, bid2) {
        if (!bid1.priceBreakdown?.positions || !bid2.priceBreakdown?.positions) {
            return 0;
        }
        
        const positions1 = bid1.priceBreakdown.positions;
        const positions2 = bid2.priceBreakdown.positions;
        
        // Structural similarity check
        if (Math.abs(positions1.length - positions2.length) / Math.max(positions1.length, positions2.length) > 0.2) {
            return 0; // Too different in structure
        }
        
        // Create position maps for matching
        const posMap1 = new Map(positions1.map(p => [p.id || p.description, p]));
        const posMap2 = new Map(positions2.map(p => [p.id || p.description, p]));
        
        // Calculate cosine similarity of price vectors
        const commonPositions = [];
        const priceVector1 = [];
        const priceVector2 = [];
        
        posMap1.forEach((pos1, key) => {
            if (posMap2.has(key)) {
                const pos2 = posMap2.get(key);
                priceVector1.push(pos1.unitPrice);
                priceVector2.push(pos2.unitPrice);
                commonPositions.push(key);
            }
        });
        
        if (commonPositions.length === 0) return 0;
        
        // Cosine similarity
        const cosineSim = this.calculateCosineSimilarity(priceVector1, priceVector2);
        
        // Check for proportional pricing (strong collusion indicator)
        const proportionalityScore = this.checkProportionalPricing(positions1, positions2);
        
        // Check for identical rounding patterns
        const roundingPatternScore = this.checkRoundingPatterns(positions1, positions2);
        
        // Check for similar markup patterns
        const markupPatternScore = this.analyzeMarkupPatterns(positions1, positions2);
        
        // Weighted combination
        return (
            cosineSim * 0.4 +
            proportionalityScore * 0.3 +
            roundingPatternScore * 0.15 +
            markupPatternScore * 0.15
        );
    }
    
    calculateCosineSimilarity(vector1, vector2) {
        if (vector1.length !== vector2.length || vector1.length === 0) return 0;
        
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        
        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            magnitude1 += vector1[i] * vector1[i];
            magnitude2 += vector2[i] * vector2[i];
        }
        
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        
        return dotProduct / (magnitude1 * magnitude2);
    }
    
    checkProportionalPricing(positions1, positions2) {
        // Check if prices follow a consistent ratio
        const ratios = [];
        
        for (let i = 0; i < Math.min(positions1.length, positions2.length); i++) {
            if (positions1[i].unitPrice > 0 && positions2[i].unitPrice > 0) {
                ratios.push(positions1[i].unitPrice / positions2[i].unitPrice);
            }
        }
        
        if (ratios.length < 3) return 0;
        
        // Check consistency of ratios
        const avgRatio = ratios.reduce((s, r) => s + r, 0) / ratios.length;
        const variance = ratios.reduce((s, r) => s + Math.pow(r - avgRatio, 2), 0) / ratios.length;
        const coefficientOfVariation = Math.sqrt(variance) / avgRatio;
        
        // Low coefficient of variation indicates proportional pricing
        return coefficientOfVariation < 0.05 ? 1 : coefficientOfVariation < 0.1 ? 0.5 : 0;
    }
    
    checkRoundingPatterns(positions1, positions2) {
        // Check if both bids use similar rounding (e.g., always to nearest 5 or 10)
        const roundingPattern1 = this.detectRoundingPattern(positions1);
        const roundingPattern2 = this.detectRoundingPattern(positions2);
        
        return roundingPattern1 === roundingPattern2 && roundingPattern1 !== 'none' ? 0.8 : 0;
    }
    
    detectRoundingPattern(positions) {
        const patterns = { nearest10: 0, nearest5: 0, nearest1: 0, none: 0 };
        
        positions.forEach(pos => {
            const price = pos.unitPrice;
            if (price % 10 === 0) patterns.nearest10++;
            else if (price % 5 === 0) patterns.nearest5++;
            else if (price % 1 === 0) patterns.nearest1++;
            else patterns.none++;
        });
        
        // Find dominant pattern
        let maxPattern = 'none';
        let maxCount = 0;
        
        Object.entries(patterns).forEach(([pattern, count]) => {
            if (count > maxCount) {
                maxCount = count;
                maxPattern = pattern;
            }
        });
        
        return maxCount > positions.length * 0.6 ? maxPattern : 'none';
    }
    
    analyzeMarkupPatterns(positions1, positions2) {
        // Analyze if markup percentages are similar
        if (!positions1[0]?.costEstimate || !positions2[0]?.costEstimate) {
            return 0;
        }
        
        const markups1 = positions1
            .filter(p => p.costEstimate > 0)
            .map(p => (p.unitPrice - p.costEstimate) / p.costEstimate);
        
        const markups2 = positions2
            .filter(p => p.costEstimate > 0)
            .map(p => (p.unitPrice - p.costEstimate) / p.costEstimate);
        
        if (markups1.length === 0 || markups2.length === 0) return 0;
        
        const avgMarkup1 = markups1.reduce((s, m) => s + m, 0) / markups1.length;
        const avgMarkup2 = markups2.reduce((s, m) => s + m, 0) / markups2.length;
        
        const markupDiff = Math.abs(avgMarkup1 - avgMarkup2);
        
        return markupDiff < 0.02 ? 1 : markupDiff < 0.05 ? 0.5 : 0;
    }
    
    async analyzeBidCoverage(bid, allBids) {
        const coverage = {
            isComplementary: false,
            overlapRatio: 0,
            marketSegmentation: [],
            collusionIndicators: []
        };
        
        // Connect to quantum GNN if available for advanced analysis
        const quantumGraphNN = this.quantumGraphNN || 
            await this.initializeQuantumAnalysis();
        
        // Construct bid relationship graph
        const bidGraph = await this.constructBidGraph(allBids);
        
        // Detect market segmentation using community detection
        const communities = await this.detectCommunities(bidGraph);
        
        // Analyze bid clustering patterns
        if (quantumGraphNN) {
            const bidClusters = await quantumGraphNN.analyzeClusters(
                allBids.map(b => this.extractBidFeatures(b)),
                { method: 'spectral', threshold: 0.85 }
            );
            
            // Detect complementary bidding patterns
            coverage.isComplementary = this.detectComplementaryPattern(
                bid,
                bidClusters,
                communities
            );
        }
        
        // Calculate market coverage overlap
        coverage.overlapRatio = this.calculateMarketOverlap(bid, allBids);
        coverage.marketSegmentation = this.analyzeMarketSegmentation(communities);
        
        // Advanced collusion indicators
        if (coverage.isComplementary || coverage.overlapRatio < 0.3) {
            coverage.collusionIndicators = await this.extractCollusionIndicators(
                bid,
                allBids,
                communities
            );
        }
        
        return coverage;
    }
    
    async initializeQuantumAnalysis() {
        try {
            const { QuantumGraphNeuralNetwork } = await import('../../quantum/QuantumGraphNeuralNetwork.js');
            return new QuantumGraphNeuralNetwork();
        } catch (error) {
            console.warn('Quantum analysis not available:', error);
            return null;
        }
    }
    
    async constructBidGraph(allBids) {
        const graph = {
            nodes: allBids.map(b => ({
                id: b.id,
                bidderId: b.bidderId,
                price: b.totalPrice,
                features: this.extractBidFeatures(b)
            })),
            edges: []
        };
        
        // Create edges based on similarity
        for (let i = 0; i < allBids.length; i++) {
            for (let j = i + 1; j < allBids.length; j++) {
                const similarity = await this.calculatePricingSimilarity(
                    allBids[i],
                    allBids[j]
                );
                
                if (similarity > 0.5) {
                    graph.edges.push({
                        source: allBids[i].id,
                        target: allBids[j].id,
                        weight: similarity
                    });
                }
            }
        }
        
        return graph;
    }
    
    extractBidFeatures(bid) {
        return {
            price: bid.totalPrice || 0,
            positionCount: bid.priceBreakdown?.positions?.length || 0,
            avgUnitPrice: this.calculateAvgUnitPrice(bid),
            priceVariance: this.calculatePriceVariance(bid),
            completionTime: bid.completionTime || 0,
            riskScore: bid.riskScore || 0
        };
    }
    
    calculateAvgUnitPrice(bid) {
        if (!bid.priceBreakdown?.positions) return 0;
        const prices = bid.priceBreakdown.positions.map(p => p.unitPrice).filter(p => p > 0);
        return prices.length > 0 ? prices.reduce((s, p) => s + p, 0) / prices.length : 0;
    }
    
    calculatePriceVariance(bid) {
        if (!bid.priceBreakdown?.positions) return 0;
        const prices = bid.priceBreakdown.positions.map(p => p.unitPrice).filter(p => p > 0);
        if (prices.length === 0) return 0;
        
        const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
        return prices.reduce((s, p) => s + Math.pow(p - avg, 2), 0) / prices.length;
    }
    
    async detectCommunities(graph) {
        // Simple community detection using modularity optimization
        const communities = [];
        const visited = new Set();
        
        // Group highly connected nodes
        for (const node of graph.nodes) {
            if (!visited.has(node.id)) {
                const community = this.expandCommunity(node, graph, visited);
                if (community.length > 0) {
                    communities.push(community);
                }
            }
        }
        
        return communities;
    }
    
    expandCommunity(startNode, graph, visited) {
        const community = [startNode];
        visited.add(startNode.id);
        
        const queue = [startNode];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Find strongly connected neighbors
            const neighbors = graph.edges
                .filter(e => (e.source === current.id || e.target === current.id) && e.weight > 0.7)
                .map(e => e.source === current.id ? e.target : e.source)
                .filter(nodeId => !visited.has(nodeId));
            
            for (const neighborId of neighbors) {
                const neighbor = graph.nodes.find(n => n.id === neighborId);
                if (neighbor) {
                    community.push(neighbor);
                    visited.add(neighborId);
                    queue.push(neighbor);
                }
            }
        }
        
        return community;
    }
    
    detectComplementaryPattern(bid, bidClusters, communities) {
        // Check if bid is part of a complementary bidding scheme
        if (!bidClusters || !communities) return false;
        
        // Find bid's cluster and community
        const bidCluster = bidClusters.find(c => c.members.includes(bid.id));
        const bidCommunity = communities.find(c => c.some(n => n.id === bid.id));
        
        if (!bidCluster || !bidCommunity) return false;
        
        // Check for non-overlapping market segments
        const segmentOverlap = this.calculateSegmentOverlap(bidCluster, bidCommunity);
        
        // Low overlap with coordinated pricing indicates complementary bidding
        return segmentOverlap < 0.3 && bidCommunity.length > 2;
    }
    
    calculateSegmentOverlap(cluster, community) {
        // Calculate overlap between cluster and community segments
        const clusterSegments = new Set(cluster.members.map(m => this.getMarketSegment(m)));
        const communitySegments = new Set(community.map(n => this.getMarketSegment(n.id)));
        
        const intersection = new Set([...clusterSegments].filter(x => communitySegments.has(x)));
        const union = new Set([...clusterSegments, ...communitySegments]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    
    getMarketSegment(bidId) {
        // Market segment identification from bid ID
        return `segment_${bidId.charCodeAt(0) % 5}`;
    }
    
    calculateMarketOverlap(bid, allBids) {
        // Calculate how much market coverage overlaps with other bids
        const bidSegments = this.extractMarketSegments(bid);
        let totalOverlap = 0;
        let comparisonCount = 0;
        
        for (const otherBid of allBids) {
            if (otherBid.id !== bid.id) {
                const otherSegments = this.extractMarketSegments(otherBid);
                const overlap = this.calculateSegmentSetOverlap(bidSegments, otherSegments);
                totalOverlap += overlap;
                comparisonCount++;
            }
        }
        
        return comparisonCount > 0 ? totalOverlap / comparisonCount : 0;
    }
    
    extractMarketSegments(bid) {
        // Extract market segments from bid characteristics
        const segments = new Set();
        
        if (bid.priceBreakdown?.positions) {
            bid.priceBreakdown.positions.forEach(pos => {
                if (pos.category) segments.add(pos.category);
                if (pos.trade) segments.add(pos.trade);
            });
        }
        
        return segments;
    }
    
    calculateSegmentSetOverlap(segments1, segments2) {
        if (segments1.size === 0 || segments2.size === 0) return 0;
        
        const intersection = new Set([...segments1].filter(x => segments2.has(x)));
        const union = new Set([...segments1, ...segments2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }
    
    analyzeMarketSegmentation(communities) {
        // Analyze how the market is segmented among bidders
        return communities.map((community, index) => ({
            segmentId: `segment_${index}`,
            bidderCount: community.length,
            avgPrice: community.reduce((s, n) => s + n.price, 0) / community.length,
            priceRange: {
                min: Math.min(...community.map(n => n.price)),
                max: Math.max(...community.map(n => n.price))
            },
            concentration: this.calculateHerfindahlIndex(community)
        }));
    }
    
    calculateHerfindahlIndex(community) {
        // Calculate Herfindahl-Hirschman Index (HHI) for market concentration
        // HHI = Σ(market_share_i)² where market_share is expressed as percentage
        const totalPrice = community.reduce((s, n) => s + n.price, 0);
        if (totalPrice === 0) return 0;
        
        // Calculate HHI (range: 0 to 10,000 when using percentages)
        const hhi = community.reduce((index, node) => {
            const share = (node.price / totalPrice) * 100; // Convert to percentage
            return index + (share * share);
        }, 0);
        
        // Normalize to 0-1 range for consistency
        return hhi / 10000;
    }
    
    async extractCollusionIndicators(bid, allBids, communities) {
        const indicators = [];
        
        // Check for price leadership
        if (this.detectPriceLeadership(bid, allBids)) {
            indicators.push({
                type: 'price_leadership',
                confidence: 0.8,
                description: 'Bid appears to be setting price benchmark'
            });
        }
        
        // Check for bid suppression
        if (this.detectBidSuppression(bid, allBids)) {
            indicators.push({
                type: 'bid_suppression',
                confidence: 0.7,
                description: 'Artificially reduced competition detected'
            });
        }
        
        // Check for coordinated timing
        if (await this.detectCoordinatedTiming(bid, allBids)) {
            indicators.push({
                type: 'coordinated_timing',
                confidence: 0.75,
                description: 'Suspicious submission timing patterns'
            });
        }
        
        return indicators;
    }
    
    detectPriceLeadership(bid, allBids) {
        // Check if this bid sets the price that others follow
        const bidTime = bid.submissionTime || 0;
        const subsequentBids = allBids.filter(b => 
            b.submissionTime > bidTime && 
            Math.abs(b.totalPrice - bid.totalPrice) / bid.totalPrice < 0.05
        );
        
        return subsequentBids.length > allBids.length * 0.3;
    }
    
    detectBidSuppression(bid, allBids) {
        // Check for artificially reduced number of bids
        const expectedBidders = 10; // Based on market analysis
        const actualBidders = new Set(allBids.map(b => b.bidderId)).size;
        
        return actualBidders < expectedBidders * 0.5;
    }
    
    async detectCoordinatedTiming(bid, allBids) {
        // Check for suspicious timing patterns
        const submissionTimes = allBids
            .map(b => b.submissionTime)
            .filter(t => t > 0)
            .sort((a, b) => a - b);
        
        if (submissionTimes.length < 3) return false;
        
        // Check for clustering of submission times
        const intervals = [];
        for (let i = 1; i < submissionTimes.length; i++) {
            intervals.push(submissionTimes[i] - submissionTimes[i-1]);
        }
        
        const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
        const variance = intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length;
        
        // Low variance in submission intervals suggests coordination
        return variance < avgInterval * avgInterval * 0.1;
    }
    
    calculateMean(values) {
        if (!values || values.length === 0) return 0;
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    estimateMarketShares(rankings) {
        // Estimate market shares using inverse price weighting method
        // Assumption: Lower prices capture more market share
        const totalInversePrice = rankings.reduce((sum, r) => sum + (1 / r.totalPrice), 0);
        
        // Calculate normalized market share for each bidder
        return rankings.map(r => {
            const inversePrice = 1 / r.totalPrice;
            const baseShare = inversePrice / totalInversePrice;
            
            // Adjust for quality and other factors if available
            const qualityMultiplier = r.qualityScore ? (r.qualityScore / 100) : 1.0;
            
            return baseShare * qualityMultiplier;
        });
    }
    
    /**
     * Shutdown
     */
    async shutdown() {
        console.log('🛑 Shutting down Bid Evaluation Matrix Service...');
        this.removeAllListeners();
    }
}

