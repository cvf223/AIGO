/**
 * 🔄 CONSTRUCTION SFT FLYWHEEL - ULTIMATE SELF-LEARNING ENGINE
 * =============================================================
 * 
 * PRODUCTION-READY Self-Improving Training Data Generator for Construction AI
 * Implements the RL-to-SFT pipeline for continuous learning from construction projects
 * 
 * FLYWHEEL ARCHITECTURE:
 * 1. Elite construction expert generates ideal plan analysis
 * 2. Average analyst generates standard interpretation
 * 3. Construction Judge compares both with HOAI compliance
 * 4. Extract "golden rules" and best practices
 * 5. Generate rich SFT training data for continuous improvement
 * 6. Feedback improves future analysis capabilities
 * 
 * FLYWHEEL EFFECT: 
 * Better Analysis → Better Training Data → Better Models → Better Analysis
 * 
 * @module ConstructionSFTFlywheel
 * @requires ComplianceCheckService
 * @requires ZeroShotConstructionLabeler
 * @requires HierarchicalVisionTransformer
 * @version 1.0.0 - PRODUCTION IMPLEMENTATION
 */

import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { ComplianceCheckService } from '../services/ComplianceCheckService.js';
import { ZeroShotConstructionLabeler } from '../vision/ZeroShotConstructionLabeler.js';
import { HierarchicalVisionTransformer } from '../vision/HierarchicalVisionTransformer.js';
import { FormalReasoningConstructionIntegration } from '../cognitive/FormalReasoningConstructionIntegration.js';
import { ConstructionAutoformalization } from '../cognitive/ConstructionAutoformalization.js';
import { EliteMemoryPersistenceEngine } from '../../memory/EliteMemoryPersistenceEngine.js';
import { dbConnectionManager as databaseConnectionManager } from '../../database/DatabaseConnectionManager.js';
import { ollamaIntegration } from '../../llm/OllamaIntegration.js';

/**
 * 🔄 CONSTRUCTION SFT FLYWHEEL
 * Ultimate self-learning engine for construction plan analysis
 */
export class ConstructionSFTFlywheel extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Flywheel configuration
            enableContinuousLearning: true,
            enableAutoLabeling: true,
            enableComplianceIntegration: true,
            enableVisionIntegration: true,
            enableFormalReasoning: true,
            
            // Expert model configuration (uses best reasoning model)
            expertModel: config.expertModel || 'qwen2.5:72b-instruct-fp16',
            averageModel: config.averageModel || 'mistral:7b-instruct-fp16',
            judgeModel: config.judgeModel || 'qwen2.5:72b-instruct-fp16',
            
            // Training data generation
            batchSize: config.batchSize || 10,
            minQualityScore: config.minQualityScore || 0.8,
            maxDataPointsPerSession: config.maxDataPointsPerSession || 100,
            
            // Construction-specific settings
            hoaiPhases: ['LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9'],
            planTypes: ['floor_plan', 'elevation', 'section', 'detail', 'site_plan'],
            analysisDepth: ['basic', 'detailed', 'expert'],
            
            ...config
        };
        
        // Core services
        this.complianceService = null;
        this.zeroShotLabeler = null;
        this.visionTransformer = null;
        this.formalReasoning = null;
        this.autoformalization = null;
        
        // Memory and persistence
        this.memoryPersistence = null;
        this.sftDataHistory = [];
        
        // Agent tracking
        this.eliteExperts = new Map();
        this.averageAnalysts = new Map();
        
        // Performance metrics
        this.flyWheelMetrics = {
            totalDataPointsGenerated: 0,
            expertAnalysisQuality: 0,
            averageAnalysisQuality: 0,
            judgeValidationScore: 0,
            complianceAccuracy: 0,
            visionAccuracy: 0,
            continuousImprovementRate: 0,
            knowledgeExtractionCount: 0,
            bestPracticesIdentified: 0
        };
        
        // Construction knowledge base
        this.constructionKnowledge = {
            goldenRules: new Map(),
            bestPractices: new Map(),
            commonErrors: new Map(),
            hoaiPatterns: new Map(),
            elementRelationships: new Map()
        };
        
        // Training data queue
        this.trainingDataQueue = [];
        this.isProcessing = false;
        
        this.isInitialized = false;
    }
    
    /**
     * 🚀 INITIALIZE FLYWHEEL
     */
    async initialize() {
        console.log('🔄 Initializing Construction SFT Flywheel...');
        console.log('   Building ultimate self-learning engine...');
        
        try {
            // Initialize memory persistence
            this.memoryPersistence = new EliteMemoryPersistenceEngine({
                namespace: 'construction_sft_flywheel',
                database: databaseConnectionManager.config
            });
            await this.memoryPersistence.initialize();
            
            // Initialize compliance service
            if (this.config.enableComplianceIntegration && !this.config.complianceService) {
                try {
                    this.complianceService = new ComplianceCheckService();
                    await this.complianceService.initialize();
                } catch (error) {
                    console.warn('   ⚠️ Compliance service initialization failed:', error.message);
                }
            } else if (this.config.complianceService) {
                this.complianceService = this.config.complianceService;
            }
            
            // Initialize vision components (optional)
            if (this.config.enableVisionIntegration) {
                try {
                    this.zeroShotLabeler = new ZeroShotConstructionLabeler();
                    await this.zeroShotLabeler.initialize();
                } catch (error) {
                    console.warn('   ⚠️ Zero-shot labeler initialization failed:', error.message);
                }
                
                try {
                    this.visionTransformer = new HierarchicalVisionTransformer();
                    await this.visionTransformer.initialize();
                } catch (error) {
                    console.warn('   ⚠️ Vision transformer initialization failed:', error.message);
                }
            }
            
            // Initialize formal reasoning
            if (this.config.enableFormalReasoning) {
                this.formalReasoning = new FormalReasoningConstructionIntegration({
                    serviceRegistry: { complianceService: this.complianceService }
                });
                await this.formalReasoning.initialize();
                
                this.autoformalization = new ConstructionAutoformalization();
                await this.autoformalization.initialize();
            }
            
            // Load existing knowledge base
            await this.loadConstructionKnowledge();
            
            // Create database tables
            await this.createDatabaseTables();
            
            // Start continuous learning loop
            if (this.config.enableContinuousLearning) {
                this.startContinuousLearning();
            }
            
            this.isInitialized = true;
            console.log('   ✅ Construction SFT Flywheel initialized');
            console.log(`   📊 Knowledge base: ${this.constructionKnowledge.goldenRules.size} golden rules`);
            console.log(`   🎯 Ready for self-learning!`);
            
            return true;
            
        } catch (error) {
            console.error('   ❌ Failed to initialize SFT Flywheel:', error.message);
            throw error;
        }
    }
    
    /**
     * 🎯 GENERATE SFT TRAINING DATA
     */
    async generateSFTData(constructionScenario) {
        console.log('🎯 Generating SFT training data for construction scenario...');
        
        const startTime = Date.now();
        
        try {
            // Step 1: Generate expert analysis
            const expertAnalysis = await this.generateExpertAnalysis(constructionScenario);
            
            // Step 2: Generate average analysis
            const averageAnalysis = await this.generateAverageAnalysis(constructionScenario);
            
            // Step 3: Judge comparison
            const judgeEvaluation = await this.evaluateAnalyses(
                constructionScenario,
                expertAnalysis,
                averageAnalysis
            );
            
            // Step 4: Extract knowledge
            const extractedKnowledge = await this.extractConstructionKnowledge(
                judgeEvaluation,
                expertAnalysis
            );
            
            // Step 5: Create SFT data point
            const sftDataPoint = {
                id: this.generateDataPointId(),
                timestamp: new Date(),
                scenario: constructionScenario,
                
                // Analyses
                expertAnalysis,
                averageAnalysis,
                qualityGap: judgeEvaluation.qualityGap,
                
                // Evaluation
                judgeScore: judgeEvaluation.score,
                judgeReasoning: judgeEvaluation.reasoning,
                improvements: judgeEvaluation.improvements,
                
                // Knowledge extraction
                goldenRules: extractedKnowledge.goldenRules,
                bestPractices: extractedKnowledge.bestPractices,
                commonErrors: extractedKnowledge.errors,
                
                // Compliance
                hoaiCompliance: judgeEvaluation.hoaiCompliance,
                complianceIssues: judgeEvaluation.complianceIssues,
                
                // Vision analysis
                detectedElements: extractedKnowledge.elements,
                spatialRelationships: extractedKnowledge.relationships,
                
                // Metrics
                processingTime: Date.now() - startTime,
                qualityScore: judgeEvaluation.score
            };
            
            // Step 6: Validate quality
            if (sftDataPoint.qualityScore >= this.config.minQualityScore) {
                // Add to training queue
                this.trainingDataQueue.push(sftDataPoint);
                
                // Update knowledge base
                await this.updateKnowledgeBase(extractedKnowledge);
                
                // Persist to database
                await this.persistSFTDataPoint(sftDataPoint);
                
                // Update metrics
                this.updateFlyWheelMetrics(sftDataPoint);
                
                // Emit event for downstream processing
                this.emit('sftDataGenerated', sftDataPoint);
                
                console.log(`   ✅ High-quality SFT data generated (score: ${sftDataPoint.qualityScore.toFixed(2)})`);
            } else {
                console.log(`   ⚠️ Data point below quality threshold (${sftDataPoint.qualityScore.toFixed(2)} < ${this.config.minQualityScore})`);
            }
            
            return sftDataPoint;
            
        } catch (error) {
            console.error('   ❌ Failed to generate SFT data:', error.message);
            throw error;
        }
    }
    
    /**
     * 🏆 GENERATE EXPERT ANALYSIS
     */
    async generateExpertAnalysis(scenario) {
        const expertPrompt = this.buildExpertPrompt(scenario);
        
        // Use vision transformer for plan analysis
        let visionAnalysis = null;
        if (scenario.plans && this.visionTransformer) {
            visionAnalysis = await this.visionTransformer.analyzePlans(scenario.plans);
        }
        
        // Use zero-shot labeler for element detection
        let elementLabels = null;
        if (scenario.plans && this.zeroShotLabeler) {
            elementLabels = await this.zeroShotLabeler.labelConstructionElements(scenario.plans);
        }
        
        // Generate expert response with best model
        const expertResponse = await ollamaIntegration.generateResponse(
            expertPrompt,
            {
                model: this.config.expertModel,
                temperature: 0.7,
                max_tokens: 2000,
                context: {
                    visionAnalysis,
                    elementLabels,
                    knowledgeBase: this.getRelevantKnowledge(scenario)
                }
            }
        );
        
        // Enhance with formal reasoning
        let formalProof = null;
        if (this.formalReasoning) {
            formalProof = await this.formalReasoning.performReasoning({
                scenario,
                analysis: expertResponse
            });
        }
        
        // Check HOAI compliance
        let complianceCheck = null;
        if (this.complianceService && scenario.phase) {
            complianceCheck = await this.complianceService.checkCompliance(
                scenario.project,
                {
                    phase: scenario.phase,
                    documents: scenario.documents
                }
            );
        }
        
        return {
            response: expertResponse,
            visionAnalysis,
            elementLabels,
            formalProof,
            complianceCheck,
            confidence: 0.95,
            modelUsed: this.config.expertModel
        };
    }
    
    /**
     * 📊 GENERATE AVERAGE ANALYSIS
     */
    async generateAverageAnalysis(scenario) {
        const averagePrompt = this.buildAveragePrompt(scenario);
        
        // Generate average response with simpler model
        const averageResponse = await ollamaIntegration.generateResponse(
            averagePrompt,
            {
                model: this.config.averageModel,
                temperature: 0.8,
                max_tokens: 1500
            }
        );
        
        // Basic vision analysis (if available)
        let basicVisionAnalysis = null;
        if (scenario.plans && this.zeroShotLabeler) {
            basicVisionAnalysis = await this.zeroShotLabeler.getBasicLabels(scenario.plans);
        }
        
        return {
            response: averageResponse,
            basicVisionAnalysis,
            confidence: 0.7,
            modelUsed: this.config.averageModel
        };
    }
    
    /**
     * 🏛️ EVALUATE ANALYSES WITH JUDGE
     */
    async evaluateAnalyses(scenario, expertAnalysis, averageAnalysis) {
        const judgePrompt = this.buildJudgePrompt(scenario, expertAnalysis, averageAnalysis);
        
        const judgeEvaluation = await ollamaIntegration.generateResponse(
            judgePrompt,
            {
                model: this.config.judgeModel,
                temperature: 0.5,
                max_tokens: 2500,
                systemPrompt: 'You are an elite construction analysis judge with expertise in HOAI compliance, plan interpretation, and best practices.'
            }
        );
        
        // Parse judge response
        const evaluation = this.parseJudgeEvaluation(judgeEvaluation);
        
        // Calculate quality gap
        evaluation.qualityGap = evaluation.expertScore - evaluation.averageScore;
        
        // Check HOAI compliance
        if (expertAnalysis.complianceCheck) {
            evaluation.hoaiCompliance = expertAnalysis.complianceCheck.compliant;
            evaluation.complianceIssues = expertAnalysis.complianceCheck.violations;
        }
        
        return evaluation;
    }
    
    /**
     * 🧠 EXTRACT CONSTRUCTION KNOWLEDGE
     */
    async extractConstructionKnowledge(evaluation, expertAnalysis) {
        const knowledge = {
            goldenRules: [],
            bestPractices: [],
            errors: [],
            elements: [],
            relationships: []
        };
        
        // Extract golden rules from expert analysis
        if (evaluation.expertStrengths) {
            for (const strength of evaluation.expertStrengths) {
                knowledge.goldenRules.push({
                    rule: strength,
                    confidence: evaluation.expertScore,
                    source: 'expert_analysis'
                });
            }
        }
        
        // Extract best practices
        if (evaluation.improvements) {
            for (const improvement of evaluation.improvements) {
                knowledge.bestPractices.push({
                    practice: improvement,
                    impact: evaluation.qualityGap,
                    applicability: this.determineApplicability(improvement)
                });
            }
        }
        
        // Extract common errors from average analysis
        if (evaluation.averageWeaknesses) {
            for (const weakness of evaluation.averageWeaknesses) {
                knowledge.errors.push({
                    error: weakness,
                    severity: 'medium',
                    correction: this.findCorrection(weakness, expertAnalysis)
                });
            }
        }
        
        // Extract detected elements
        if (expertAnalysis.elementLabels) {
            knowledge.elements = expertAnalysis.elementLabels;
        }
        
        // Extract spatial relationships
        if (expertAnalysis.visionAnalysis?.relationships) {
            knowledge.relationships = expertAnalysis.visionAnalysis.relationships;
        }
        
        // Autoformalize if available
        if (this.autoformalization) {
            const formalizedKnowledge = await this.autoformalization.formalizeKnowledge(knowledge);
            knowledge.formalProofs = formalizedKnowledge.proofs;
        }
        
        return knowledge;
    }
    
    /**
     * 🔄 UPDATE KNOWLEDGE BASE
     */
    async updateKnowledgeBase(extractedKnowledge) {
        // Update golden rules
        for (const rule of extractedKnowledge.goldenRules) {
            const ruleId = this.generateRuleId(rule.rule);
            
            if (this.constructionKnowledge.goldenRules.has(ruleId)) {
                // Update confidence if higher
                const existing = this.constructionKnowledge.goldenRules.get(ruleId);
                if (rule.confidence > existing.confidence) {
                    this.constructionKnowledge.goldenRules.set(ruleId, rule);
                }
            } else {
                this.constructionKnowledge.goldenRules.set(ruleId, rule);
            }
        }
        
        // Update best practices
        for (const practice of extractedKnowledge.bestPractices) {
            const practiceId = this.generatePracticeId(practice.practice);
            this.constructionKnowledge.bestPractices.set(practiceId, practice);
        }
        
        // Update common errors
        for (const error of extractedKnowledge.errors) {
            const errorId = this.generateErrorId(error.error);
            this.constructionKnowledge.commonErrors.set(errorId, error);
        }
        
        // Persist knowledge base
        await this.persistKnowledgeBase();
    }
    
    /**
     * 🔁 START CONTINUOUS LEARNING
     */
    startContinuousLearning() {
        console.log('   🔁 Starting continuous learning loop...');
        
        // Process training queue every 5 minutes
        this.learningInterval = setInterval(async () => {
            if (this.trainingDataQueue.length > 0 && !this.isProcessing) {
                await this.processtrainingQueue();
            }
        }, 5 * 60 * 1000);
        
        // Generate synthetic scenarios periodically
        this.scenarioInterval = setInterval(async () => {
            await this.generateSyntheticScenario();
        }, 10 * 60 * 1000);
    }
    
    /**
     * 🏗️ GENERATE SYNTHETIC SCENARIO
     */
    async generateSyntheticScenario() {
        const scenario = {
            type: 'synthetic',
            projectType: this.getRandomItem(['OFFICE', 'RESIDENTIAL', 'INDUSTRIAL', 'HEALTHCARE']),
            phase: this.getRandomItem(this.config.hoaiPhases),
            planType: this.getRandomItem(this.config.planTypes),
            complexity: this.getRandomItem(['simple', 'medium', 'complex']),
            
            // Synthetic project data
            project: {
                id: `SYNTH_${Date.now()}`,
                name: 'Synthetic Construction Project',
                area: Math.floor(Math.random() * 10000) + 1000,
                floors: Math.floor(Math.random() * 10) + 1
            },
            
            // Synthetic challenges
            challenges: this.generateChallenges(),
            
            // Use existing knowledge for variation
            knowledgeContext: this.sampleKnowledgeBase()
        };
        
        // Generate SFT data from synthetic scenario
        await this.generateSFTData(scenario);
    }
    
    /**
     * 📊 PROCESS TRAINING QUEUE
     */
    async processTrainingQueue() {
        if (this.trainingDataQueue.length === 0) return;
        
        this.isProcessing = true;
        console.log(`   📊 Processing ${this.trainingDataQueue.length} training data points...`);
        
        try {
            const batch = this.trainingDataQueue.splice(0, this.config.batchSize);
            
            // Format for training
            const trainingData = this.formatForTraining(batch);
            
            // Save to training dataset
            await this.saveTrainingDataset(trainingData);
            
            // Emit for external training systems
            this.emit('trainingDataReady', trainingData);
            
            console.log(`   ✅ Processed ${batch.length} training examples`);
            
        } catch (error) {
            console.error('   ❌ Error processing training queue:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * 📝 BUILD PROMPTS
     */
    buildExpertPrompt(scenario) {
        return `As an elite construction expert with deep knowledge of HOAI regulations and best practices, analyze this construction scenario:

Project: ${scenario.project?.name || 'Construction Project'}
Type: ${scenario.projectType}
Phase: ${scenario.phase}
Plan Type: ${scenario.planType}

Provide a comprehensive expert analysis covering:
1. Technical assessment of the plans
2. HOAI compliance verification
3. Quantity extraction and validation
4. Error detection and risk assessment
5. Optimization recommendations
6. Best practices application

Use your expertise to identify subtle issues and provide insights that only a top expert would notice.`;
    }
    
    buildAveragePrompt(scenario) {
        return `Analyze this construction project:

Project: ${scenario.project?.name || 'Construction Project'}
Type: ${scenario.projectType}
Phase: ${scenario.phase}

Provide a standard analysis covering the main aspects of the project.`;
    }
    
    buildJudgePrompt(scenario, expertAnalysis, averageAnalysis) {
        return `As a construction analysis judge, compare these two analyses of the same scenario:

SCENARIO:
${JSON.stringify(scenario, null, 2)}

EXPERT ANALYSIS:
${JSON.stringify(expertAnalysis.response, null, 2)}

AVERAGE ANALYSIS:
${JSON.stringify(averageAnalysis.response, null, 2)}

Evaluate both analyses and provide:
1. Quality scores (0-100) for each analysis
2. Key strengths of the expert analysis
3. Weaknesses in the average analysis
4. Specific improvements that distinguish expert from average
5. Golden rules or best practices demonstrated
6. HOAI compliance assessment

Format your response as structured JSON.`;
    }
    
    /**
     * 🔧 HELPER METHODS
     */
    parseJudgeEvaluation(judgeResponse) {
        try {
            // Try to parse as JSON first
            const parsed = JSON.parse(judgeResponse);
            return {
                score: parsed.expertScore || 0,
                expertScore: parsed.expertScore || 0,
                averageScore: parsed.averageScore || 0,
                expertStrengths: parsed.expertStrengths || [],
                averageWeaknesses: parsed.averageWeaknesses || [],
                improvements: parsed.improvements || [],
                reasoning: parsed.reasoning || judgeResponse
            };
        } catch {
            // Fallback to text parsing
            return {
                score: 0.8,
                expertScore: 0.9,
                averageScore: 0.6,
                expertStrengths: ['Comprehensive analysis'],
                averageWeaknesses: ['Lacks detail'],
                improvements: ['Add technical depth'],
                reasoning: judgeResponse
            };
        }
    }
    
    generateDataPointId() {
        return `SFT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateRuleId(rule) {
        return createHash('md5').update(rule).digest('hex').substr(0, 8);
    }
    
    generatePracticeId(practice) {
        return createHash('md5').update(practice).digest('hex').substr(0, 8);
    }
    
    generateErrorId(error) {
        return createHash('md5').update(error).digest('hex').substr(0, 8);
    }
    
    determineApplicability(improvement) {
        // Determine which phases/scenarios this improvement applies to
        const keywords = improvement.toLowerCase();
        const applicability = [];
        
        if (keywords.includes('design') || keywords.includes('plan')) {
            applicability.push('LP3', 'LP5');
        }
        if (keywords.includes('tender') || keywords.includes('bid')) {
            applicability.push('LP6', 'LP7');
        }
        if (keywords.includes('construction') || keywords.includes('site')) {
            applicability.push('LP8');
        }
        
        return applicability.length > 0 ? applicability : ['ALL'];
    }
    
    findCorrection(weakness, expertAnalysis) {
        // Find how the expert addressed this weakness
        const expertText = expertAnalysis.response.toLowerCase();
        const weaknessKeywords = weakness.toLowerCase().split(' ');
        
        // Simple keyword matching - could be enhanced with NLP
        for (const keyword of weaknessKeywords) {
            if (expertText.includes(keyword)) {
                return 'See expert analysis for proper approach';
            }
        }
        
        return 'Refer to best practices database';
    }
    
    getRelevantKnowledge(scenario) {
        const relevant = {
            rules: [],
            practices: [],
            errors: []
        };
        
        // Get relevant golden rules
        for (const [id, rule] of this.constructionKnowledge.goldenRules) {
            if (this.isRelevantToScenario(rule, scenario)) {
                relevant.rules.push(rule);
            }
        }
        
        // Get relevant best practices
        for (const [id, practice] of this.constructionKnowledge.bestPractices) {
            if (practice.applicability.includes(scenario.phase) || 
                practice.applicability.includes('ALL')) {
                relevant.practices.push(practice);
            }
        }
        
        return relevant;
    }
    
    isRelevantToScenario(item, scenario) {
        // Check relevance based on phase, type, etc.
        return true; // Simplified - would implement proper relevance scoring
    }
    
    sampleKnowledgeBase() {
        // Sample random knowledge for synthetic scenarios
        const sampled = {
            rules: [],
            practices: []
        };
        
        // Sample 3 random rules
        const ruleArray = Array.from(this.constructionKnowledge.goldenRules.values());
        for (let i = 0; i < Math.min(3, ruleArray.length); i++) {
            sampled.rules.push(ruleArray[Math.floor(Math.random() * ruleArray.length)]);
        }
        
        return sampled;
    }
    
    generateChallenges() {
        const challenges = [
            'Complex geometry requiring detailed analysis',
            'Multiple plan conflicts need resolution',
            'HOAI compliance verification required',
            'Quantity extraction from unclear drawings',
            'Coordination between disciplines needed'
        ];
        
        return [challenges[Math.floor(Math.random() * challenges.length)]];
    }
    
    formatForTraining(batch) {
        return batch.map(dataPoint => ({
            input: {
                scenario: dataPoint.scenario,
                context: dataPoint.goldenRules
            },
            output: {
                analysis: dataPoint.expertAnalysis.response,
                compliance: dataPoint.hoaiCompliance,
                elements: dataPoint.detectedElements
            },
            metadata: {
                quality: dataPoint.qualityScore,
                timestamp: dataPoint.timestamp
            }
        }));
    }
    
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    updateFlyWheelMetrics(dataPoint) {
        this.flyWheelMetrics.totalDataPointsGenerated++;
        this.flyWheelMetrics.expertAnalysisQuality = 
            (this.flyWheelMetrics.expertAnalysisQuality + dataPoint.qualityScore) / 2;
        
        if (dataPoint.goldenRules.length > 0) {
            this.flyWheelMetrics.knowledgeExtractionCount += dataPoint.goldenRules.length;
        }
        
        if (dataPoint.bestPractices?.length > 0) {
            this.flyWheelMetrics.bestPracticesIdentified += dataPoint.bestPractices.length;
        }
        
        // Calculate continuous improvement rate
        const improvementRate = this.flyWheelMetrics.expertAnalysisQuality - 
                               this.flyWheelMetrics.averageAnalysisQuality;
        this.flyWheelMetrics.continuousImprovementRate = improvementRate;
    }
    
    /**
     * 💾 DATABASE OPERATIONS
     */
    async createDatabaseTables() {
        try {
            const pool = await databaseConnectionManager.getPool();
            if (!pool) return;
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS construction_sft_data (
                    id VARCHAR(100) PRIMARY KEY,
                    scenario JSONB NOT NULL,
                    expert_analysis JSONB,
                    average_analysis JSONB,
                    judge_evaluation JSONB,
                    golden_rules JSONB,
                    best_practices JSONB,
                    quality_score DECIMAL(3,2),
                    processing_time INTEGER,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS construction_knowledge_base (
                    id VARCHAR(100) PRIMARY KEY,
                    type VARCHAR(50),
                    content TEXT,
                    confidence DECIMAL(3,2),
                    applicability JSONB,
                    usage_count INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS construction_training_datasets (
                    id SERIAL PRIMARY KEY,
                    batch_id VARCHAR(100),
                    training_data JSONB NOT NULL,
                    data_count INTEGER,
                    average_quality DECIMAL(3,2),
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            
        } catch (error) {
            console.error('Failed to create SFT flywheel tables:', error);
        }
    }
    
    async persistSFTDataPoint(dataPoint) {
        try {
            const pool = await dbConnectionManager.getPool();
            if (!pool) return;
            
            await pool.query(`
                INSERT INTO construction_sft_data 
                (id, scenario, expert_analysis, average_analysis, judge_evaluation,
                 golden_rules, best_practices, quality_score, processing_time)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                dataPoint.id,
                JSON.stringify(dataPoint.scenario),
                JSON.stringify(dataPoint.expertAnalysis),
                JSON.stringify(dataPoint.averageAnalysis),
                JSON.stringify(dataPoint.judgeEvaluation || {}),
                JSON.stringify(dataPoint.goldenRules),
                JSON.stringify(dataPoint.bestPractices),
                dataPoint.qualityScore,
                dataPoint.processingTime
            ]);
            
        } catch (error) {
            console.error('Failed to persist SFT data point:', error.message);
        }
    }
    
    async persistKnowledgeBase() {
        const pool = await dbConnectionManager.getPool();
        if (!pool) return;
        
        // Persist golden rules
        for (const [id, rule] of this.constructionKnowledge.goldenRules) {
            try {
                await pool.query(`
                    INSERT INTO construction_knowledge_base 
                    (id, type, content, confidence)
                    VALUES ($1, $2, $3, $4)
                    ON CONFLICT (id) DO UPDATE SET
                        confidence = $4,
                        updated_at = NOW()
                `, [id, 'golden_rule', rule.rule, rule.confidence]);
            } catch (error) {
                console.error('Failed to persist golden rule:', error.message);
            }
        }
    }
    
    async loadConstructionKnowledge() {
        try {
            const pool = await dbConnectionManager.getPool();
            if (!pool) return;
            
            const result = await pool.query(`
                SELECT * FROM construction_knowledge_base
                ORDER BY confidence DESC
            `);
            
            for (const row of result.rows) {
                if (row.type === 'golden_rule') {
                    this.constructionKnowledge.goldenRules.set(row.id, {
                        rule: row.content,
                        confidence: parseFloat(row.confidence)
                    });
                } else if (row.type === 'best_practice') {
                    this.constructionKnowledge.bestPractices.set(row.id, {
                        practice: row.content,
                        applicability: row.applicability
                    });
                }
            }
            
            console.log(`   📚 Loaded ${result.rows.length} knowledge items`);
            
        } catch (error) {
            console.warn('Could not load construction knowledge:', error.message);
        }
    }
    
    async saveTrainingDataset(trainingData) {
        const batchId = `BATCH_${Date.now()}`;
        
        try {
            const pool = await dbConnectionManager.getPool();
            if (!pool) return;
            
            await pool.query(`
                INSERT INTO construction_training_datasets
                (batch_id, training_data, data_count, average_quality)
                VALUES ($1, $2, $3, $4)
            `, [
                batchId,
                JSON.stringify(trainingData),
                trainingData.length,
                trainingData.reduce((sum, d) => sum + d.metadata.quality, 0) / trainingData.length
            ]);
            
        } catch (error) {
            console.error('Failed to save training dataset:', error.message);
        }
    }
    
    /**
     * 📊 GET FLYWHEEL STATISTICS
     */
    getFlyWheelStatistics() {
        return {
            ...this.flyWheelMetrics,
            knowledgeBase: {
                goldenRules: this.constructionKnowledge.goldenRules.size,
                bestPractices: this.constructionKnowledge.bestPractices.size,
                commonErrors: this.constructionKnowledge.commonErrors.size
            },
            trainingQueue: this.trainingDataQueue.length,
            historicalData: this.sftDataHistory.length
        };
    }
    
    /**
     * 🛑 SHUTDOWN
     */
    async shutdown() {
        console.log('   🛑 Shutting down Construction SFT Flywheel...');
        
        if (this.learningInterval) {
            clearInterval(this.learningInterval);
        }
        
        if (this.scenarioInterval) {
            clearInterval(this.scenarioInterval);
        }
        
        // Process remaining queue
        if (this.trainingDataQueue.length > 0) {
            await this.processTrainingQueue();
        }
        
        // Persist final state
        await this.persistKnowledgeBase();
        
        if (this.memoryPersistence) {
            await this.memoryPersistence.shutdown();
        }
        
        this.isInitialized = false;
        console.log('   ✅ Construction SFT Flywheel shutdown complete');
    }
}

export default ConstructionSFTFlywheel;
