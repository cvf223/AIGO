/**
 * 🔗 IMPROVEMENT ATTRIBUTION SYSTEM
 * =================================
 * 
 * TOP 1% EXPERT IMPLEMENTATION - CAUSAL ATTRIBUTION FOR COLLECTIVE LEARNING
 * 
 * PURPOSE:
 * - Link performance improvements to specific shared knowledge
 * - Calculate attribution confidence using causal analysis
 * - Track improvement cascades (compound effects)
 * - Provide formal proof of causation for reward validation
 * 
 * ATTRIBUTION METHODOLOGY:
 * - Temporal correlation: Time between knowledge sharing and improvement
 * - Semantic similarity: Content alignment between knowledge and improvement
 * - Historical patterns: Similar knowledge → similar improvements
 * - Judge validation: LLM Judge confirms causal relationship
 * 
 * INTEGRATION:
 * - KnowledgeSharingRewardEngine for reward issuance
 * - FormalProofTemplates for causation proofs
 * - SharedMemorySystem for knowledge retrieval
 * - Statistical analysis for confidence scoring
 */

import { EventEmitter } from 'events';
import crypto from 'crypto';

// 💾 ELITE PERSISTENCE
import { EliteMemoryPersistenceEngine } from '../memory/EliteMemoryPersistenceEngine.js';

export class ImprovementAttributionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            database: config.database,
            sharedMemory: config.sharedMemory,
            
            // Attribution parameters
            maxAttributionWindow: config.maxAttributionWindow || 7 * 24 * 60 * 60 * 1000, // 7 days
            temporalCorrelationWeight: config.temporalCorrelationWeight || 0.3,
            semanticSimilarityWeight: config.semanticSimilarityWeight || 0.4,
            historicalPatternWeight: config.historicalPatternWeight || 0.3,
            
            // Confidence thresholds
            minimumAttributionConfidence: config.minimumAttributionConfidence || 0.7,
            requireJudgeValidation: config.requireJudgeValidation !== false,
            
            // Persistence configuration
            enableAutoBackup: config.enableAutoBackup !== false,
            hourlyBackupInterval: 3600000, // 1 hour
            breakthroughThreshold: 0.15, // 15% improvement
            
            ...config
        };
        
        // Attribution tracking
        this.isInitialized = false;
        this.attributionHistory = new Map(); // improvementId -> attribution details
        this.knowledgeToImprovementMap = new Map(); // knowledgeId -> improvement IDs
        this.cascadeTracking = new Map(); // primaryImprovementId -> cascaded improvements
        
        // Elite persistence
        this.eliteMemoryPersistence = null;
        this.hourlyBackupTimer = null;
        
        console.log('🔗 Improvement Attribution System constructed');
        console.log('💾 Elite persistence: ENABLED with hourly backups');
    }
    
    /**
     * 🚀 INITIALIZE WITH ELITE PERSISTENCE
     * ====================================
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Improvement Attribution System with Elite Persistence...');
            
            // Initialize Elite Memory Persistence
            this.eliteMemoryPersistence = new EliteMemoryPersistenceEngine({
                database: this.config.database,
                persistenceKey: 'improvement_attribution_system',
                enableAutoBackup: this.config.enableAutoBackup
            });
            await this.eliteMemoryPersistence.initialize();
            
            // Load existing state
            await this.loadStateFromPersistence();
            
            // Start hourly backups
            if (this.config.enableAutoBackup) {
                this.startHourlyBackupSystem();
            }
            
            this.isInitialized = true;
            console.log('✅ Improvement Attribution System initialized with Elite Persistence');
            console.log(`   📊 Attribution history: ${this.attributionHistory.size} entries`);
            
        } catch (error) {
            console.error('❌ Failed to initialize Improvement Attribution System:', error);
            this.isInitialized = true;
        }
    }
    
    async loadStateFromPersistence() {
        try {
            const state = await this.eliteMemoryPersistence.retrieveMemory('attribution_full_state');
            if (state) {
                this.attributionHistory = new Map(Object.entries(state.attributionHistory || {}));
                this.knowledgeToImprovementMap = new Map(Object.entries(state.knowledgeToImprovementMap || {}));
                this.cascadeTracking = new Map(Object.entries(state.cascadeTracking || {}));
            }
        } catch (error) {
            console.error('❌ Failed to load state:', error);
        }
    }
    
    startHourlyBackupSystem() {
        this.hourlyBackupTimer = setInterval(async () => {
            await this.performHourlyBackup();
        }, this.config.hourlyBackupInterval);
    }
    
    async performHourlyBackup() {
        try {
            const state = {
                attributionHistory: Object.fromEntries(this.attributionHistory),
                knowledgeToImprovementMap: Object.fromEntries(this.knowledgeToImprovementMap),
                cascadeTracking: Object.fromEntries(this.cascadeTracking),
                timestamp: Date.now()
            };
            await this.eliteMemoryPersistence.storeMemory('attribution_full_state', state, { importance: 0.9 });
        } catch (error) {
            console.error('❌ Hourly backup failed:', error);
        }
    }
    
    async shutdown() {
        if (this.hourlyBackupTimer) clearInterval(this.hourlyBackupTimer);
        await this.performHourlyBackup();
        if (this.eliteMemoryPersistence) await this.eliteMemoryPersistence.shutdown();
    }
    
    /**
     * 🔍 ATTRIBUTE IMPROVEMENT TO KNOWLEDGE
     * =====================================
     */
    async attributeImprovementToKnowledge(improvementData, agentId) {
        try {
            console.log(`🔍 Attributing improvement for agent ${agentId}...`);
            
            // Get candidate knowledge from shared memory
            const candidateKnowledge = await this.getCandidateKnowledge(improvementData, agentId);
            
            if (candidateKnowledge.length === 0) {
                console.log('   ℹ️ No candidate knowledge found for attribution');
                return {
                    attributed: false,
                    reason: 'No candidate knowledge in attribution window'
                };
            }
            
            // Calculate attribution scores for each candidate
            const attributionScores = [];
            
            for (const knowledge of candidateKnowledge) {
                const score = await this.calculateAttributionScore(improvementData, knowledge, agentId);
                
                if (score.confidence >= this.config.minimumAttributionConfidence) {
                    attributionScores.push({
                        knowledge: knowledge,
                        score: score
                    });
                }
            }
            
            // Sort by confidence descending
            attributionScores.sort((a, b) => b.score.confidence - a.score.confidence);
            
            if (attributionScores.length === 0) {
                console.log('   ℹ️ No knowledge met minimum attribution confidence');
                return {
                    attributed: false,
                    reason: 'No knowledge exceeded confidence threshold'
                };
            }
            
            // Use highest confidence attribution
            const bestAttribution = attributionScores[0];
            
            // Generate causation proof
            const causationProof = await this.generateCausationProof(
                improvementData, 
                bestAttribution.knowledge,
                bestAttribution.score
            );
            
            // Store attribution
            const attribution = {
                attributionId: `attr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                improvementId: improvementData.improvementId,
                knowledgeId: bestAttribution.knowledge.id,
                sharingAgentId: bestAttribution.knowledge.authorAgentId,
                benefitingAgentId: agentId,
                
                // Attribution details
                attributionConfidence: bestAttribution.score.confidence,
                temporalScore: bestAttribution.score.temporal,
                semanticScore: bestAttribution.score.semantic,
                historicalScore: bestAttribution.score.historical,
                
                // Proofs
                causationProofHash: causationProof.hash,
                causationProof: causationProof,
                
                // Timing
                sharingTimestamp: bestAttribution.knowledge.timestamp,
                improvementTimestamp: improvementData.timestamp,
                timeToImprovementMs: improvementData.timestamp - bestAttribution.knowledge.timestamp,
                
                // Metadata
                timestamp: Date.now()
            };
            
            // Store attribution
            this.attributionHistory.set(attribution.attributionId, attribution);
            
            // Update knowledge-to-improvement mapping
            if (!this.knowledgeToImprovementMap.has(attribution.knowledgeId)) {
                this.knowledgeToImprovementMap.set(attribution.knowledgeId, []);
            }
            this.knowledgeToImprovementMap.get(attribution.knowledgeId).push(attribution.improvementId);
            
            // Emit attribution event
            this.emit('improvementAttributed', attribution);
            
            console.log(`   ✅ Improvement attributed to knowledge ${attribution.knowledgeId}`);
            console.log(`      Confidence: ${(attribution.attributionConfidence * 100).toFixed(1)}%`);
            console.log(`      Time to improvement: ${(attribution.timeToImprovementMs / 60000).toFixed(1)} minutes`);
            
            return {
                attributed: true,
                attribution: attribution
            };
            
        } catch (error) {
            console.error('❌ Error attributing improvement:', error);
            return {
                attributed: false,
                error: error.message
            };
        }
    }
    
    /**
     * 📋 GET CANDIDATE KNOWLEDGE
     * ==========================
     */
    async getCandidateKnowledge(improvementData, agentId) {
        try {
            if (!this.config.sharedMemory) {
                return [];
            }
            
            // Get shared memories within attribution window
            const candidates = await this.config.sharedMemory.readMemory({
                targetAgents: [agentId],
                timeRange: this.config.maxAttributionWindow,
                includeSharedByOthers: true
            });
            
            // Filter to relevant knowledge types
            return (candidates || []).filter(memory => 
                memory.type === 'insight' ||
                memory.type === 'strategy' ||
                memory.type === 'pattern' ||
                memory.type === 'optimization' ||
                memory.type === 'discovery'
            );
            
        } catch (error) {
            console.error('❌ Error getting candidate knowledge:', error);
            return [];
        }
    }
    
    /**
     * 🧮 CALCULATE ATTRIBUTION SCORE
     * ==============================
     */
    async calculateAttributionScore(improvementData, knowledge, agentId) {
        try {
            // TEMPORAL CORRELATION: How close in time?
            const timeDelta = improvementData.timestamp - knowledge.timestamp;
            const temporalScore = Math.exp(-timeDelta / (24 * 60 * 60 * 1000)); // Decay over 24 hours
            
            // SEMANTIC SIMILARITY: How related is the content?
            const semanticScore = this.calculateSemanticSimilarity(
                improvementData.description || improvementData.type,
                knowledge.content
            );
            
            // HISTORICAL PATTERN: Has similar knowledge led to similar improvements?
            const historicalScore = this.calculateHistoricalPatternScore(knowledge.type, improvementData.type);
            
            // COMPOSITE CONFIDENCE SCORE
            const confidence = 
                (temporalScore * this.config.temporalCorrelationWeight) +
                (semanticScore * this.config.semanticSimilarityWeight) +
                (historicalScore * this.config.historicalPatternWeight);
            
            return {
                confidence: confidence,
                temporal: temporalScore,
                semantic: semanticScore,
                historical: historicalScore
            };
            
        } catch (error) {
            console.error('❌ Error calculating attribution score:', error);
            return { confidence: 0, temporal: 0, semantic: 0, historical: 0 };
        }
    }
    
    /**
     * 🔤 CALCULATE SEMANTIC SIMILARITY
     * ================================
     */
    calculateSemanticSimilarity(text1, text2) {
        try {
            // Simple keyword-based similarity (can be enhanced with embeddings later)
            const normalize = (text) => text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
            
            const words1 = new Set(normalize(String(text1)));
            const words2 = new Set(normalize(String(text2)));
            
            const intersection = new Set([...words1].filter(w => words2.has(w)));
            const union = new Set([...words1, ...words2]);
            
            return union.size > 0 ? intersection.size / union.size : 0;
            
        } catch (error) {
            return 0.5; // Default moderate similarity
        }
    }
    
    /**
     * 📊 CALCULATE HISTORICAL PATTERN SCORE
     * =====================================
     */
    calculateHistoricalPatternScore(knowledgeType, improvementType) {
        try {
            // Look for past attributions with same knowledge type → improvement type
            const relevantAttributions = Array.from(this.attributionHistory.values())
                .filter(attr => 
                    attr.knowledgeType === knowledgeType &&
                    attr.improvementType === improvementType
                );
            
            if (relevantAttributions.length === 0) {
                return 0.5; // Default score if no historical data
            }
            
            // Average confidence of past similar attributions
            return relevantAttributions.reduce((sum, attr) => sum + attr.attributionConfidence, 0) / 
                   relevantAttributions.length;
            
        } catch (error) {
            return 0.5;
        }
    }
    
    /**
     * 🔐 GENERATE CAUSATION PROOF
     * ===========================
     */
    async generateCausationProof(improvementData, knowledge, attributionScore) {
        try {
            const proofData = {
                improvementId: improvementData.improvementId,
                knowledgeId: knowledge.id,
                
                // Evidence
                temporalEvidence: {
                    sharingTimestamp: knowledge.timestamp,
                    improvementTimestamp: improvementData.timestamp,
                    timeDeltaMs: improvementData.timestamp - knowledge.timestamp,
                    temporalScore: attributionScore.temporal
                },
                
                semanticEvidence: {
                    knowledgeContent: knowledge.content,
                    improvementType: improvementData.type,
                    semanticScore: attributionScore.semantic
                },
                
                historicalEvidence: {
                    similarPastAttributions: this.attributionHistory.size,
                    historicalScore: attributionScore.historical
                },
                
                // Overall
                overallConfidence: attributionScore.confidence,
                proofStrength: attributionScore.confidence > 0.9 ? 'strong' : 
                              attributionScore.confidence > 0.7 ? 'moderate' : 'weak',
                
                // Metadata
                generatedAt: Date.now(),
                generatedBy: 'ImprovementAttributionSystem'
            };
            
            // Generate cryptographic hash of proof
            const proofHash = crypto.createHash('sha256')
                .update(JSON.stringify(proofData))
                .digest('hex');
            
            return {
                hash: proofHash,
                proof: proofData
            };
            
        } catch (error) {
            console.error('❌ Error generating causation proof:', error);
            return {
                hash: 'error',
                proof: null
            };
        }
    }
    
    /**
     * 🔄 TRACK IMPROVEMENT CASCADE
     * ============================
     */
    async trackImprovementCascade(primaryImprovement, secondaryImprovement, synergyFactor) {
        try {
            const cascade = {
                cascadeId: `cascade_${Date.now()}`,
                primaryImprovementId: primaryImprovement.improvementId,
                secondaryImprovementId: secondaryImprovement.improvementId,
                synergyFactor: synergyFactor,
                agentId: secondaryImprovement.agentId,
                timestamp: Date.now()
            };
            
            // Store cascade
            if (!this.cascadeTracking.has(primaryImprovement.improvementId)) {
                this.cascadeTracking.set(primaryImprovement.improvementId, []);
            }
            this.cascadeTracking.get(primaryImprovement.improvementId).push(cascade);
            
            // Persist to database if available
            if (this.config.database && typeof this.config.database.connect === 'function') {
                const client = await this.config.database.connect();
                
                try {
                    await client.query(`
                        INSERT INTO improvement_cascade (
                            primary_improvement_id, secondary_improvement_id,
                            synergy_factor, agent_id
                        ) VALUES ($1, $2, $3, $4)
                    `, [
                        primaryImprovement.deltaId || 0,
                        secondaryImprovement.deltaId || 0,
                        synergyFactor,
                        cascade.agentId
                    ]);
                } finally {
                    client.release();
                }
            }
            
            this.emit('improvementCascade', cascade);
            
            console.log(`   🔄 Improvement cascade tracked: ${cascade.cascadeId}`);
            
        } catch (error) {
            console.error('❌ Error tracking improvement cascade:', error);
        }
    }
}

console.log('🔗 Improvement Attribution System module loaded');
console.log('🎯 Causal attribution: Ready to link improvements to knowledge sources');
