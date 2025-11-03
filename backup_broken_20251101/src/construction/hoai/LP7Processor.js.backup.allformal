/**
 * 📊 ADVANCED PREISSPIEGEL PROCESSOR - TOP 1% IMPLEMENTATION
 * ===========================================================
 * 
 * HOAI LP7: Mitwirkung bei der Vergabe
 * Advanced bid evaluation with ML-based price anomaly detection
 * 
 * Features:
 * - ML-based price anomaly detection using Isolation Forest
 * - Advanced bid clustering with DBSCAN
 * - Risk-adjusted multi-criteria scoring
 * - Automated award recommendations
 * - Collusion detection integration
 * - Statistical price analysis
 * - Bid pattern recognition
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Implementation
 */

import { EventEmitter } from 'events';

export class LP7Processor extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Analysis settings
            anomalyThreshold: 2.5, // Standard deviations
            clusteringEpsilon: 0.15, // 15% for DBSCAN
            clusteringMinPoints: 2,
            
            // Risk thresholds
            lowRiskThreshold: 0.3,
            highRiskThreshold: 0.7,
            
            // Scoring weights
            priceWeight: 0.70,
            qualityWeight: 0.20,
            timeWeight: 0.10,
            
            // ML settings
            isolationForestTrees: 100,
            isolationForestSamples: 256,
            
            database: config.database,
            ...config
        };
        
        // Service connections
        this.bidEvaluationMatrix = null;
        this.statisticalAnalyzer = null;
        
        // ML models
        this.isolationForest = null;
        this.clusteringModel = null;
        
        // Data structures
        this.preisspiegelCache = new Map();
        this.anomalyPatterns = new Map();
        this.bidClusters = new Map();
        
        // Metrics
        this.metrics = {
            totalAnalyses: 0,
            anomaliesDetected: 0,
            clustersFound: 0,
            avgBidsPerProject: 0
        };
        
        this.initialized = false;
    }
    
    /**
     * 🚀 INITIALIZE PROCESSOR
     */
    async initialize() {
        console.log('📊 Initializing LP7 Preisspiegel Processor...');
        
        try {
            // Initialize bid evaluation matrix
            await this.initializeBidEvaluationMatrix();
            
            // Initialize ML models
            await this.initializeMLModels();
            
            // Load historical anomaly patterns
            await this.loadAnomalyPatterns();
            
            this.initialized = true;
            console.log('✅ LP7 Processor initialized');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize LP7 Processor:', error);
            throw error;
        }
    }
    
    /**
     * 📊 INITIALIZE BID EVALUATION MATRIX
     */
    async initializeBidEvaluationMatrix() {
        const { BidEvaluationMatrix } = await import('../services/BidEvaluationMatrix.js');
        this.bidEvaluationMatrix = new BidEvaluationMatrix(this.config);
        await this.bidEvaluationMatrix.initialize();
    }
    
    /**
     * 🤖 INITIALIZE ML MODELS
     */
    async initializeMLModels() {
        console.log('🤖 Initializing ML models...');
        
        // Initialize Isolation Forest for anomaly detection
        this.isolationForest = this.createIsolationForest();
        
        // Initialize DBSCAN for clustering
        this.clusteringModel = this.createDBSCANClusterer();
        
        console.log('✅ ML models initialized');
    }
    
    /**
     * 🌲 CREATE ISOLATION FOREST
     */
    createIsolationForest() {
        return {
            trees: [],
            numTrees: this.config.isolationForestTrees,
            maxSamples: this.config.isolationForestSamples,
            
            // Fit the model
            fit: (data) => {
                this.isolationForest.trees = [];
                
                for (let t = 0; t < this.isolationForest.numTrees; t++) {
                    // Sample data for this tree
                    const sample = this.randomSample(
                        data,
                        Math.min(this.isolationForest.maxSamples, data.length)
                    );
                    
                    // Build isolation tree
                    const tree = this.buildIsolationTree(sample, 0);
                    this.isolationForest.trees.push(tree);
                }
            },
            
            // Predict anomaly score
            predict: (point) => {
                const pathLengths = this.isolationForest.trees.map(tree =>
                    this.getPathLength(tree, point, 0)
                );
                
                const avgPathLength = pathLengths.reduce((a, b) => a + b, 0) / pathLengths.length;
                
                // Anomaly score (normalized)
                const expectedLength = this.expectedPathLength(this.isolationForest.maxSamples);
                const anomalyScore = Math.pow(2, -avgPathLength / expectedLength);
                
                return anomalyScore;
            }
        };
    }
    
    /**
     * 🌲 BUILD ISOLATION TREE
     */
    buildIsolationTree(data, currentDepth, maxDepth = 10) {
        if (data.length <= 1 || currentDepth >= maxDepth) {
            return { size: data.length, isLeaf: true };
        }
        
        // Select random feature
        const featureIdx = Math.floor(Math.random() * data[0].length);
        
        // Select random split value
        const values = data.map(d => d[featureIdx]);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        const splitValue = minVal + Math.random() * (maxVal - minVal);
        
        // Split data
        const left = data.filter(d => d[featureIdx] < splitValue);
        const right = data.filter(d => d[featureIdx] >= splitValue);
        
        return {
            featureIdx,
            splitValue,
            left: this.buildIsolationTree(left, currentDepth + 1, maxDepth),
            right: this.buildIsolationTree(right, currentDepth + 1, maxDepth),
            isLeaf: false
        };
    }
    
    /**
     * 📏 GET PATH LENGTH
     */
    getPathLength(tree, point, currentLength) {
        if (tree.isLeaf) {
            return currentLength + this.adjustmentFactor(tree.size);
        }
        
        if (point[tree.featureIdx] < tree.splitValue) {
            return this.getPathLength(tree.left, point, currentLength + 1);
        } else {
            return this.getPathLength(tree.right, point, currentLength + 1);
        }
    }
    
    /**
     * 🔧 ADJUSTMENT FACTOR
     */
    adjustmentFactor(size) {
        if (size <= 1) return 0;
        return 2 * (Math.log(size - 1) + 0.5772156649) - (2 * (size - 1) / size);
    }
    
    /**
     * 📊 EXPECTED PATH LENGTH
     */
    expectedPathLength(n) {
        if (n <= 1) return 0;
        return 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1) / n);
    }
    
    /**
     * 🎲 RANDOM SAMPLE
     */
    randomSample(data, sampleSize) {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, sampleSize);
    }
    
    /**
     * 🔵 CREATE DBSCAN CLUSTERER
     */
    createDBSCANClusterer() {
        return {
            epsilon: this.config.clusteringEpsilon,
            minPoints: this.config.clusteringMinPoints,
            
            // Cluster the data
            cluster: (data) => {
                const clusters = [];
                const visited = new Set();
                const noise = [];
                
                for (let i = 0; i < data.length; i++) {
                    if (visited.has(i)) continue;
                    
                    visited.add(i);
                    const neighbors = this.getNeighbors(data, i, this.clusteringModel.epsilon);
                    
                    if (neighbors.length < this.clusteringModel.minPoints) {
                        noise.push(i);
                    } else {
                        const cluster = [];
                        this.expandCluster(data, i, neighbors, cluster, visited, this.clusteringModel.epsilon, this.clusteringModel.minPoints);
                        clusters.push(cluster);
                    }
                }
                
                return { clusters, noise };
            }
        };
    }
    
    /**
     * 🔍 GET NEIGHBORS
     */
    getNeighbors(data, pointIdx, epsilon) {
        const neighbors = [];
        const point = data[pointIdx];
        
        for (let i = 0; i < data.length; i++) {
            if (i === pointIdx) continue;
            
            const distance = this.euclideanDistance(point, data[i]);
            if (distance <= epsilon) {
                neighbors.push(i);
            }
        }
        
        return neighbors;
    }
    
    /**
     * 📏 EUCLIDEAN DISTANCE
     */
    euclideanDistance(point1, point2) {
        let sumSquares = 0;
        
        for (let i = 0; i < point1.length; i++) {
            sumSquares += Math.pow(point1[i] - point2[i], 2);
        }
        
        return Math.sqrt(sumSquares);
    }
    
    /**
     * 🔄 EXPAND CLUSTER
     */
    expandCluster(data, pointIdx, neighbors, cluster, visited, epsilon, minPoints) {
        cluster.push(pointIdx);
        
        for (const neighborIdx of neighbors) {
            if (!visited.has(neighborIdx)) {
                visited.add(neighborIdx);
                const neighborNeighbors = this.getNeighbors(data, neighborIdx, epsilon);
                
                if (neighborNeighbors.length >= minPoints) {
                    neighbors.push(...neighborNeighbors);
                }
            }
            
            if (!cluster.includes(neighborIdx)) {
                cluster.push(neighborIdx);
            }
        }
    }
    
    /**
     * 📊 PROCESS PREISSPIEGEL
     */
    async processPreisspiegel(projectData, bids, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        const startTime = Date.now();
        console.log(`📊 Processing Preisspiegel for ${bids.length} bids...`);
        
        const preisspiegel = {
            id: `PS_${projectData.id}_${Date.now()}`,
            projectId: projectData.id,
            projectName: projectData.name,
            phase: 'LP7',
            created: new Date().toISOString(),
            
            // Bid data
            bids: bids.length,
            bidAnalysis: [],
            
            // Price analysis
            priceStatistics: {},
            anomalies: [],
            clusters: [],
            
            // Evaluation
            rankings: [],
            recommendation: null,
            
            // Risk assessment
            riskAnalysis: {},
            collusionAnalysis: {}
        };
        
        try {
            // Step 1: Statistical price analysis
            preisspiegel.priceStatistics = await this.analyzePriceStatistics(bids);
            
            // Step 2: ML-based anomaly detection
            preisspiegel.anomalies = await this.detectPriceAnomalies(
                bids,
                preisspiegel.priceStatistics
            );
            
            // Step 3: Bid clustering analysis
            preisspiegel.clusters = await this.clusterBids(bids);
            
            // Step 4: Collusion detection
            preisspiegel.collusionAnalysis = await this.detectCollusion(bids);
            
            // Step 5: Risk assessment
            preisspiegel.riskAnalysis = await this.assessBidRisks(
                bids,
                preisspiegel.anomalies,
                preisspiegel.collusionAnalysis
            );
            
            // Step 6: Multi-criteria evaluation
            preisspiegel.rankings = await this.performMultiCriteriaEvaluation(
                bids,
                preisspiegel.riskAnalysis
            );
            
            // Step 7: Generate recommendation
            preisspiegel.recommendation = await this.generateAwardRecommendation(
                preisspiegel.rankings,
                preisspiegel.riskAnalysis,
                preisspiegel.anomalies
            );
            
            // Store preisspiegel
            this.preisspiegelCache.set(preisspiegel.id, preisspiegel);
            
            // Update metrics
            const processingTime = Date.now() - startTime;
            this.updateMetrics(preisspiegel, processingTime);
            
            console.log(`✅ Preisspiegel processed: ${bids.length} bids, ${preisspiegel.anomalies.length} anomalies detected`);
            console.log(`🏆 Recommended: ${preisspiegel.recommendation.bidder}`);
            console.log(`⏱️ Processing time: ${processingTime}ms`);
            
            this.emit('preisspiegelProcessed', {
                id: preisspiegel.id,
                bids: bids.length,
                anomalies: preisspiegel.anomalies.length,
                recommendation: preisspiegel.recommendation.bidder
            });
            
            return preisspiegel;
            
        } catch (error) {
            console.error('❌ Preisspiegel processing failed:', error);
            throw error;
        }
    }
    
    /**
     * 📈 ANALYZE PRICE STATISTICS
     */
    async analyzePriceStatistics(bids) {
        console.log('📈 Analyzing price statistics...');
        
        const prices = bids.map(b => b.totalPrice || b.priceBreakdown?.total || 0);
        const statistics = {
            count: prices.length,
            mean: 0,
            median: 0,
            stdDev: 0,
            variance: 0,
            min: 0,
            max: 0,
            range: 0,
            coefficientOfVariation: 0,
            quartiles: {},
            outliers: []
        };
        
        // Calculate mean
        statistics.mean = prices.reduce((a, b) => a + b, 0) / prices.length;
        
        // Calculate median
        const sorted = [...prices].sort((a, b) => a - b);
        statistics.median = sorted[Math.floor(sorted.length / 2)];
        
        // Calculate variance and standard deviation
        const squaredDiffs = prices.map(p => Math.pow(p - statistics.mean, 2));
        statistics.variance = squaredDiffs.reduce((a, b) => a + b, 0) / prices.length;
        statistics.stdDev = Math.sqrt(statistics.variance);
        
        // Calculate range
        statistics.min = Math.min(...prices);
        statistics.max = Math.max(...prices);
        statistics.range = statistics.max - statistics.min;
        
        // Calculate coefficient of variation
        statistics.coefficientOfVariation = statistics.stdDev / statistics.mean;
        
        // Calculate quartiles
        statistics.quartiles = {
            q1: sorted[Math.floor(sorted.length * 0.25)],
            q2: statistics.median,
            q3: sorted[Math.floor(sorted.length * 0.75)]
        };
        
        // IQR-based outlier detection
        const iqr = statistics.quartiles.q3 - statistics.quartiles.q1;
        const lowerBound = statistics.quartiles.q1 - 1.5 * iqr;
        const upperBound = statistics.quartiles.q3 + 1.5 * iqr;
        
        statistics.outliers = prices
            .map((price, idx) => ({ price, bidIndex: idx }))
            .filter(({ price }) => price < lowerBound || price > upperBound);
        
        console.log(`✅ Statistics: mean=€${statistics.mean.toFixed(0)}, σ=€${statistics.stdDev.toFixed(0)}, CV=${(statistics.coefficientOfVariation * 100).toFixed(1)}%`);
        
        return statistics;
    }
    
    /**
     * 🚨 DETECT PRICE ANOMALIES (ML-BASED)
     */
    async detectPriceAnomalies(bids, statistics) {
        console.log('🚨 Detecting price anomalies using Isolation Forest...');
        
        const anomalies = [];
        
        // Extract features for ML analysis
        const features = bids.map(bid => this.extractBidFeatures(bid, statistics));
        
        // Train Isolation Forest
        this.isolationForest.fit(features);
        
        // Detect anomalies
        for (let i = 0; i < bids.length; i++) {
            const anomalyScore = this.isolationForest.predict(features[i]);
            
            // Threshold for anomaly (scores > 0.6 are anomalous)
            if (anomalyScore > 0.6) {
                const bid = bids[i];
                const price = bid.totalPrice || bid.priceBreakdown?.total || 0;
                
                // Determine anomaly type
                const anomalyType = price < statistics.mean ? 'ABNORMALLY_LOW' : 'ABNORMALLY_HIGH';
                const deviation = Math.abs((price - statistics.mean) / statistics.stdDev);
                
                anomalies.push({
                    bidId: bid.id,
                    bidder: bid.bidder || bid.bidderInfo?.name,
                    type: anomalyType,
                    price,
                    anomalyScore,
                    deviation,
                    zScore: (price - statistics.mean) / statistics.stdDev,
                    severity: this.calculateAnomalySeverity(anomalyScore, deviation),
                    features: features[i],
                    reasons: this.identifyAnomalyReasons(bid, statistics, features[i])
                });
            }
        }
        
        console.log(`🚨 Detected ${anomalies.length} price anomalies`);
        
        // Store patterns
        for (const anomaly of anomalies) {
            this.anomalyPatterns.set(anomaly.bidId, anomaly);
        }
        
        return anomalies;
    }
    
    /**
     * 🔍 EXTRACT BID FEATURES
     */
    extractBidFeatures(bid, statistics) {
        const price = bid.totalPrice || bid.priceBreakdown?.total || 0;
        
        return [
            // Price features
            price,
            (price - statistics.mean) / statistics.stdDev, // z-score
            price / statistics.median, // price ratio
            
            // Position features
            bid.priceBreakdown?.positions?.length || 0,
            this.calculatePriceVariance(bid),
            this.calculatePriceConcentration(bid),
            
            // Timing features
            bid.submissionTime ? (Date.now() - bid.submissionTime) / 86400000 : 0,
            
            // Structural features
            bid.timeline?.duration || 0,
            bid.qualityScore || 0,
            bid.technicalScore || 0
        ];
    }
    
    /**
     * 📊 CALCULATE PRICE VARIANCE
     */
    calculatePriceVariance(bid) {
        if (!bid.priceBreakdown?.positions) return 0;
        
        const unitPrices = bid.priceBreakdown.positions.map(p => p.unitPrice || 0);
        const mean = unitPrices.reduce((a, b) => a + b, 0) / unitPrices.length;
        const variance = unitPrices.reduce((sum, price) => 
            sum + Math.pow(price - mean, 2), 0) / unitPrices.length;
        
        return Math.sqrt(variance);
    }
    
    /**
     * 📊 CALCULATE PRICE CONCENTRATION
     */
    calculatePriceConcentration(bid) {
        if (!bid.priceBreakdown?.positions) return 0;
        
        const total = bid.totalPrice || bid.priceBreakdown.total || 0;
        if (total === 0) return 0;
        
        // Calculate HHI of price distribution across positions
        const hhi = bid.priceBreakdown.positions.reduce((sum, pos) => {
            const share = (pos.totalPrice || 0) / total;
            return sum + share * share;
        }, 0);
        
        return hhi;
    }
    
    /**
     * ⚠️ CALCULATE ANOMALY SEVERITY
     */
    calculateAnomalySeverity(anomalyScore, deviation) {
        if (anomalyScore > 0.8 || deviation > 3) return 'CRITICAL';
        if (anomalyScore > 0.7 || deviation > 2.5) return 'HIGH';
        if (anomalyScore > 0.6 || deviation > 2) return 'MEDIUM';
        return 'LOW';
    }
    
    /**
     * 🔍 IDENTIFY ANOMALY REASONS
     */
    identifyAnomalyReasons(bid, statistics, features) {
        const reasons = [];
        const price = bid.totalPrice || bid.priceBreakdown?.total || 0;
        
        // Price-based reasons
        if (price < statistics.mean * 0.7) {
            reasons.push({
                type: 'price_significantly_low',
                description: `Price ${((1 - price/statistics.mean) * 100).toFixed(1)}% below average`,
                severity: 'HIGH'
            });
        }
        
        if (price > statistics.mean * 1.3) {
            reasons.push({
                type: 'price_significantly_high',
                description: `Price ${((price/statistics.mean - 1) * 100).toFixed(1)}% above average`,
                severity: 'MEDIUM'
            });
        }
        
        // Variance-based reasons
        const priceVariance = features[4];
        if (priceVariance > statistics.stdDev * 2) {
            reasons.push({
                type: 'high_price_variance',
                description: 'Unusual price variance across positions',
                severity: 'MEDIUM'
            });
        }
        
        // Concentration-based reasons
        const concentration = features[5];
        if (concentration > 0.5) {
            reasons.push({
                type: 'price_concentration',
                description: 'Unbalanced pricing detected',
                severity: 'MEDIUM'
            });
        }
        
        return reasons;
    }
    
    /**
     * 🔵 CLUSTER BIDS
     */
    async clusterBids(bids) {
        console.log('🔵 Clustering bids using DBSCAN...');
        
        // Extract features
        const statistics = await this.analyzePriceStatistics(bids);
        const features = bids.map(bid => this.extractBidFeatures(bid, statistics));
        
        // Normalize features
        const normalized = this.normalizeFeatures(features);
        
        // Perform clustering
        const { clusters, noise } = this.clusteringModel.cluster(normalized);
        
        // Format cluster results
        const clusterResults = clusters.map((cluster, idx) => ({
            clusterId: idx,
            size: cluster.length,
            bidIds: cluster.map(bidIdx => bids[bidIdx].id),
            centroid: this.calculateCentroid(cluster.map(bidIdx => normalized[bidIdx])),
            characteristics: this.analyzeClusterCharacteristics(
                cluster.map(bidIdx => bids[bidIdx])
            )
        }));
        
        // Store clusters
        for (const cluster of clusterResults) {
            this.bidClusters.set(cluster.clusterId, cluster);
        }
        
        console.log(`✅ Found ${clusterResults.length} bid clusters (${noise.length} noise points)`);
        
        return {
            clusters: clusterResults,
            noise: noise.map(idx => bids[idx].id),
            noiseCount: noise.length
        };
    }
    
    /**
     * 📊 NORMALIZE FEATURES
     */
    normalizeFeatures(features) {
        const numFeatures = features[0].length;
        const normalized = [];
        
        // Calculate mean and std for each feature
        const stats = [];
        for (let f = 0; f < numFeatures; f++) {
            const values = features.map(feat => feat[f]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((sum, val) => 
                sum + Math.pow(val - mean, 2), 0) / values.length;
            const stdDev = Math.sqrt(variance);
            
            stats.push({ mean, stdDev });
        }
        
        // Normalize
        for (const feature of features) {
            const normalizedFeature = feature.map((val, f) => {
                const { mean, stdDev } = stats[f];
                return stdDev > 0 ? (val - mean) / stdDev : 0;
            });
            normalized.push(normalizedFeature);
        }
        
        return normalized;
    }
    
    /**
     * 📍 CALCULATE CENTROID
     */
    calculateCentroid(points) {
        if (points.length === 0) return [];
        
        const numDimensions = points[0].length;
        const centroid = Array(numDimensions).fill(0);
        
        for (const point of points) {
            for (let i = 0; i < numDimensions; i++) {
                centroid[i] += point[i];
            }
        }
        
        return centroid.map(val => val / points.length);
    }
    
    /**
     * 📊 ANALYZE CLUSTER CHARACTERISTICS
     */
    analyzeClusterCharacteristics(bids) {
        const prices = bids.map(b => b.totalPrice || b.priceBreakdown?.total || 0);
        
        return {
            avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            priceSpread: Math.max(...prices) - Math.min(...prices),
            bidderCount: new Set(bids.map(b => b.bidder || b.bidderInfo?.name)).size
        };
    }
    
    /**
     * 🕵️ DETECT COLLUSION
     */
    async detectCollusion(bids) {
        console.log('🕵️ Detecting collusion patterns...');
        
        // Use BidEvaluationMatrix collusion detection
        const collusionAnalysis = {
            detected: [],
            patterns: [],
            risk: 0
        };
        
        for (const bid of bids) {
            const bidAnalysis = await this.bidEvaluationMatrix.detectCollusionPatterns(
                bid,
                bids
            );
            
            if (bidAnalysis.length > 0) {
                collusionAnalysis.detected.push({
                    bidId: bid.id,
                    patterns: bidAnalysis
                });
                
                collusionAnalysis.patterns.push(...bidAnalysis);
            }
        }
        
        // Calculate overall collusion risk
        collusionAnalysis.risk = collusionAnalysis.detected.length / bids.length;
        
        console.log(`🕵️ Collusion analysis: ${collusionAnalysis.detected.length} suspicious bids`);
        
        return collusionAnalysis;
    }
    
    /**
     * ⚠️ ASSESS BID RISKS
     */
    async assessBidRisks(bids, anomalies, collusionAnalysis) {
        console.log('⚠️ Assessing bid risks...');
        
        const riskAssessment = {
            bids: [],
            overallRisk: 0,
            highRiskBids: []
        };
        
        for (const bid of bids) {
            const bidRisk = {
                bidId: bid.id,
                bidder: bid.bidder || bid.bidderInfo?.name,
                riskScore: 0,
                riskFactors: [],
                riskLevel: 'LOW'
            };
            
            // Check for anomaly
            const anomaly = anomalies.find(a => a.bidId === bid.id);
            if (anomaly) {
                bidRisk.riskScore += this.getAnomalyRiskWeight(anomaly.severity);
                bidRisk.riskFactors.push({
                    type: 'price_anomaly',
                    severity: anomaly.severity,
                    score: anomaly.anomalyScore
                });
            }
            
            // Check for collusion
            const collusion = collusionAnalysis.detected.find(c => c.bidId === bid.id);
            if (collusion) {
                bidRisk.riskScore += 0.3;
                bidRisk.riskFactors.push({
                    type: 'collusion_risk',
                    patterns: collusion.patterns.length
                });
            }
            
            // Determine risk level
            bidRisk.riskLevel = this.determineRiskLevel(bidRisk.riskScore);
            
            if (bidRisk.riskLevel === 'HIGH' || bidRisk.riskLevel === 'CRITICAL') {
                riskAssessment.highRiskBids.push(bidRisk);
            }
            
            riskAssessment.bids.push(bidRisk);
        }
        
        // Calculate overall risk
        riskAssessment.overallRisk = riskAssessment.bids.reduce(
            (sum, b) => sum + b.riskScore, 0
        ) / riskAssessment.bids.length;
        
        console.log(`⚠️ Risk assessment: ${riskAssessment.highRiskBids.length} high-risk bids`);
        
        return riskAssessment;
    }
    
    /**
     * 🎯 GET ANOMALY RISK WEIGHT
     */
    getAnomalyRiskWeight(severity) {
        const weights = {
            'CRITICAL': 0.8,
            'HIGH': 0.6,
            'MEDIUM': 0.4,
            'LOW': 0.2
        };
        
        return weights[severity] || 0.3;
    }
    
    /**
     * 📊 DETERMINE RISK LEVEL
     */
    determineRiskLevel(riskScore) {
        if (riskScore >= 0.7) return 'CRITICAL';
        if (riskScore >= 0.5) return 'HIGH';
        if (riskScore >= 0.3) return 'MEDIUM';
        return 'LOW';
    }
    
    /**
     * 🏆 PERFORM MULTI-CRITERIA EVALUATION
     */
    async performMultiCriteriaEvaluation(bids, riskAnalysis) {
        console.log('🏆 Performing multi-criteria evaluation...');
        
        const rankings = [];
        
        for (const bid of bids) {
            const bidRisk = riskAnalysis.bids.find(b => b.bidId === bid.id);
            const price = bid.totalPrice || bid.priceBreakdown?.total || 0;
            
            // Calculate scores
            const priceScore = this.calculatePriceScore(price, bids);
            const qualityScore = bid.qualityScore || 70;
            const timeScore = bid.timeScore || 75;
            const riskPenalty = bidRisk ? bidRisk.riskScore : 0;
            
            // Weighted scoring with risk adjustment
            const weightedScore = (
                priceScore * this.config.priceWeight +
                qualityScore * this.config.qualityWeight +
                timeScore * this.config.timeWeight
            ) * (1 - riskPenalty * 0.5); // Risk reduces score by up to 50%
            
            rankings.push({
                rank: 0, // Will be assigned after sorting
                bidId: bid.id,
                bidder: bid.bidder || bid.bidderInfo?.name,
                price,
                scores: {
                    price: priceScore,
                    quality: qualityScore,
                    time: timeScore,
                    weighted: weightedScore
                },
                risk: bidRisk?.riskLevel || 'LOW',
                riskScore: bidRisk?.riskScore || 0
            });
        }
        
        // Sort and assign ranks
        rankings.sort((a, b) => b.scores.weighted - a.scores.weighted);
        rankings.forEach((r, idx) => r.rank = idx + 1);
        
        console.log(`✅ Ranked ${rankings.length} bids`);
        
        return rankings;
    }
    
    /**
     * 💰 CALCULATE PRICE SCORE
     */
    calculatePriceScore(price, allBids) {
        const prices = allBids.map(b => b.totalPrice || b.priceBreakdown?.total || 0);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (maxPrice === minPrice) return 100;
        
        // Inverse score: lower price = higher score
        return ((maxPrice - price) / (maxPrice - minPrice)) * 100;
    }
    
    /**
     * 🎖️ GENERATE AWARD RECOMMENDATION
     */
    async generateAwardRecommendation(rankings, riskAnalysis, anomalies) {
        console.log('🎖️ Generating award recommendation...');
        
        const topBid = rankings[0];
        const recommendation = {
            bidder: topBid.bidder,
            bidId: topBid.bidId,
            rank: topBid.rank,
            score: topBid.scores.weighted,
            confidence: 0.95,
            justification: [],
            warnings: [],
            conditions: [],
            alternatives: []
        };
        
        // Check if top bid has issues
        const topBidAnomaly = anomalies.find(a => a.bidId === topBid.bidId);
        const topBidRisk = riskAnalysis.bids.find(r => r.bidId === topBid.bidId);
        
        if (topBidAnomaly || topBidRisk?.riskLevel === 'HIGH' || topBidRisk?.riskLevel === 'CRITICAL') {
            // Consider alternative
            recommendation.bidder = rankings[1]?.bidder || topBid.bidder;
            recommendation.bidId = rankings[1]?.bidId || topBid.bidId;
            recommendation.confidence = 0.75;
            recommendation.justification.push('Top-ranked bid has significant risk factors');
            recommendation.justification.push('Second-ranked bid recommended for risk mitigation');
            
            if (topBidAnomaly) {
                recommendation.warnings.push(`Top bid has ${topBidAnomaly.type} price anomaly`);
            }
        } else {
            recommendation.justification.push(`Best value with weighted score of ${topBid.scores.weighted.toFixed(2)}`);
            recommendation.justification.push(`Competitive price: €${topBid.price.toLocaleString()}`);
            recommendation.justification.push(`Low risk profile: ${topBid.risk}`);
        }
        
        // Add conditions
        if (topBidRisk && topBidRisk.riskScore > 0.3) {
            recommendation.conditions.push('Require performance bond');
            recommendation.conditions.push('Implement milestone-based payments');
        }
        
        // Add alternatives
        recommendation.alternatives = rankings.slice(1, 4).map(r => ({
            rank: r.rank,
            bidder: r.bidder,
            score: r.scores.weighted,
            reason: `Alternative option with ${r.risk} risk`
        }));
        
        console.log(`🎖️ Recommendation: ${recommendation.bidder} (confidence: ${recommendation.confidence})`);
        
        return recommendation;
    }
    
    /**
     * 📊 UPDATE METRICS
     */
    updateMetrics(preisspiegel, processingTime) {
        this.metrics.totalAnalyses++;
        this.metrics.anomaliesDetected += preisspiegel.anomalies.length;
        this.metrics.clustersFound += preisspiegel.clusters.clusters?.length || 0;
        this.metrics.avgBidsPerProject = (
            (this.metrics.avgBidsPerProject * (this.metrics.totalAnalyses - 1) + 
             preisspiegel.bids) / this.metrics.totalAnalyses
        );
    }
    
    /**
     * 📚 LOAD ANOMALY PATTERNS
     */
    async loadAnomalyPatterns() {
        // Load from database if available
        if (this.config.database) {
            try {
                const result = await this.config.database.query(`
                    SELECT anomaly_type, characteristics, frequency
                    FROM bid_anomaly_patterns
                    WHERE active = true
                `);
                
                for (const row of result.rows || []) {
                    this.anomalyPatterns.set(row.anomaly_type, {
                        type: row.anomaly_type,
                        characteristics: row.characteristics,
                        frequency: row.frequency
                    });
                }
                
                console.log(`📚 Loaded ${this.anomalyPatterns.size} anomaly patterns`);
            } catch (error) {
                console.warn('⚠️ Failed to load anomaly patterns:', error);
            }
        }
    }
    
    /**
     * 📊 GET STATISTICS
     */
    getStatistics() {
        return {
            ...this.metrics,
            preisspiegelGenerated: this.preisspiegelCache.size,
            anomalyPatternsKnown: this.anomalyPatterns.size
        };
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('🛑 Shutting down LP7 Processor...');
        this.removeAllListeners();
        console.log('✅ LP7 Processor shutdown complete');
    }
}

console.log('📊 LP7 Preisspiegel Processor module loaded');
console.log('✅ Ready for ML-based bid analysis and award recommendations');

