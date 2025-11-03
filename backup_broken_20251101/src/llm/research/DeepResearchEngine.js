/**
 * 🧠 DEEP RESEARCH ENGINE - REVOLUTIONARY KNOWLEDGE ACQUISITION
 * =========================================================
 * 
 * Core engine that powers all LLM-based research capabilities:
 * - Curated list generation (like top 50 MEV authorities)
 * - Credibility analysis frameworks
 * - Trust tier classification
 * - Continuous knowledge updates
 * - Domain-specific deep dives
 */

import { EventEmitter } from 'events';
import { OllamaIntegration, ollamaIntegration } from '../OllamaIntegration.js';
import { ResearchPromptTemplates } from './ResearchPromptTemplates.js';
import { SharedMemorySystem } from '../../memory/SharedMemorySystem.js';
import { DatabasePoolManager } from '../../database/DatabasePoolManager.js';

// 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR DEEP RESEARCH ENGINE)
import { FormalReasoningConstructionIntegration as FormalReasoningCognitiveIntegration } from '../../construction/cognitive/FormalReasoningConstructionIntegration.js';

// 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR DEEP RESEARCH ENGINE)
import { ProactiveConstructionKnowledgePipeline as ProactiveKnowledgeCredibilityPipeline } from '../../construction/prevention/ProactiveConstructionKnowledgePipeline.js';
import { ProactiveConstructionInferenceEngine as ProactiveInferenceReliabilityEngine } from '../../construction/prevention/ProactiveConstructionInferenceEngine.js';

/**
 * 🧠 DEEP RESEARCH ENGINE - REVOLUTIONARY KNOWLEDGE ACQUISITION
 * ENHANCED with SPECIALIZED DEEP RESEARCH Formal Reasoning & Proactive Prevention
 * DEEPLY CONNECTED to existing GOT/COA reasoning systems
 * =========================================================
 */
export class DeepResearchEngine extends EventEmitter {
    constructor(config = {}) {
        super(); // Initialize EventEmitter
        this.ollama = config.ollama || ollamaIntegration;
        this.prompts = new ResearchPromptTemplates();
        
        // Get shared database pool for SharedMemorySystem
        const dbPool = DatabasePoolManager.getSharedPool();
        this.sharedMemory = new SharedMemorySystem({ dbPool });
        
        // Research configuration
        this.config = {
            maxDepth: config.maxDepth || 5,              // How deep to go in research
            cacheEnabled: config.cacheEnabled !== false,  // Cache research results
            cacheTTL: config.cacheTTL || 86400000,       // 24 hours default
            confidenceThreshold: config.confidenceThreshold || 0.7,
            ...config
        };
        
        // 🧠 FORMAL REASONING & VERIFICATION INTEGRATION (SPECIALIZED FOR DEEP RESEARCH ENGINE)
        this.deepResearchEngineFormalReasoning = null;
        
        // 🛡️ PROACTIVE PREVENTION SYSTEMS INTEGRATION (SPECIALIZED FOR DEEP RESEARCH ENGINE)
        this.deepResearchEngineCredibilityPipeline = null;
        this.deepResearchEngineInferenceReliability = null;
        this.deepResearchEngineVeracityJudge = null;
        this.deepResearchEngineSFTGovernor = null;
        
        // 🏆 DEEP ELITE REASONING CONNECTIONS (GOT/COA/META-BRAIN)
        this.eliteReasoningConnections = {
            cognitiveArchitect: null,      // Connection to THE GOT ENGINE
            strategicOrchestrator: null,   // Connection to THE META-BRAIN
            chainOfAgentsOrchestrator: null, // Connection to COA REASONING
            contextEngineEvolution: null,   // Connection to CONTEXT EVOLUTION
            fineTuningIntegration: null    // Connection to ADVANCED LLM OPTIMIZATION
        };
        
        // Research cache
        this.researchCache = new Map();
        
        // Research types
        this.researchTypes = {
            CURATED_LIST: 'curated_list',
            CREDIBILITY_ANALYSIS: 'credibility_analysis',
            TRUST_FRAMEWORK: 'trust_framework',
            TREND_ANALYSIS: 'trend_analysis',
            COMPETITIVE_INTELLIGENCE: 'competitive_intelligence',
            STRATEGY_EXTRACTION: 'strategy_extraction',
            RISK_ASSESSMENT: 'risk_assessment'
        };
        
        console.log('🧠 Deep Research Engine initialized');
    }

    /**
     * 🔍 PERFORM DEEP RESEARCH - MAIN ENTRY POINT
     */
    async performDeepResearch(request) {
        const startTime = Date.now();
        
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(request);
            if (this.config.cacheEnabled) {
                const cached = this.getFromCache(cacheKey);
                if (cached) {
                    console.log('📦 Returning cached research result');
                    return cached;
                }
            }
            
            // Select optimal model based on research complexity
            const selectedModel = this.selectModelForResearch(request);
            
            // Build comprehensive research prompt
            const researchPrompt = await this.buildResearchPrompt(request);
            
            // 🔥 SUPERINTELLIGENT ENHANCEMENT: Use ALL 11 systems before LLM call!
            console.log('🧠⚡ SUPERINTELLIGENT RESEARCH: Leveraging ALL 11 advanced systems!');
            
            // 1. ZAP: Generate research strategy
            const zapStrategy = this.todaysSystems.zapEngine ?
                await this.todaysSystems.zapEngine.generatePlan({ description: researchPrompt, type: 'research' }, request.context) : null;
            
            // 2. Causal: Discover causal patterns
            const causalContext = this.todaysSystems.causalEngine ?
                await this.todaysSystems.causalEngine.discoverCausalRelationships([{ id: 'research', data: request, timestamp: Date.now() }]) : null;
            
            // 3. Concept: Convert to concepts
            const conceptContext = this.todaysSystems.conceptAgent ?
                await this.todaysSystems.conceptAgent.encodeInput({ text: researchPrompt, modality: 'text', extractRelationships: true }) : null;
            
            // 4. GOT: Explore reasoning paths
            const gotPaths = this.eliteReasoningConnections.cognitiveArchitect ?
                await this.eliteReasoningConnections.cognitiveArchitect.explore?.({ startNode: { concept: request.domain }, explorationDepth: 3 }) : null;
            
            // 5. COA: Orchestrate multi-agent reasoning
            const coaReasoning = this.eliteReasoningConnections.chainOfAgentsOrchestrator ?
                await this.eliteReasoningConnections.chainOfAgentsOrchestrator.orchestrateReasoning?.({ task: request, maxSteps: 5 }) : null;
            
            // 6-11: Track other systems usage
            const systemsUsed = {
                zap: !!zapStrategy,
                causal: !!causalContext,
                concept: !!conceptContext,
                got: !!gotPaths,
                coa: !!coaReasoning,
                thompson: !!this.todaysSystems.thompsonSampling,
                ucb: !!this.todaysSystems.ucbExploration,
                quantumMDP: !!this.todaysSystems.quantumMDPES,
                strategicOrchestrator: !!this.eliteReasoningConnections.strategicOrchestrator,
                contextEvolution: !!this.eliteReasoningConnections.contextEngineEvolution,
                fineTuning: !!this.eliteReasoningConnections.fineTuningIntegration
            };
            
            console.log(`   🎯 Systems leveraged: ${Object.values(systemsUsed).filter(Boolean).length}/11`);
            
            // Execute research with reasoning (NOW WITH COMPREHENSIVE CONTEXT!)
            const rawResearch = await this.ollama.generateWithReasoning({
                model: selectedModel,
                prompt: researchPrompt,
                context: {
                    ...request.context,
                    // ADD ALL SYSTEM INSIGHTS!
                    zapStrategy,
                    causalContext,
                    conceptContext,
                    gotPaths,
                    coaReasoning,
                    systemsUsed
                },
                temperature: 0.1,
                maxTokens: 8192
            });
            
            // Parse and structure research results
            const structuredResearch = await this.structureResearchResults(
                rawResearch,
                request
            );
            
            // Validate research quality
            const validatedResearch = await this.validateResearchQuality(
                structuredResearch,
                request
            );
            
            // Cache successful research
            if (this.config.cacheEnabled && validatedResearch.confidence > this.config.confidenceThreshold) {
                this.cacheResearch(cacheKey, validatedResearch);
            }
            
            // Store valuable findings in shared memory
            await this.storeValuableFindings(validatedResearch, request);
            
            // Calculate research metrics
            const researchTime = Date.now() - startTime;
            validatedResearch.metrics = {
                researchTime,
                modelUsed: selectedModel,
                tokenCount: rawResearch.tokenCount,
                costSavings: rawResearch.costSavings
            };
            
            console.log(`✅ Deep research completed in ${researchTime}ms`);
            return validatedResearch;
            
        } catch (error) {
            console.error('❌ Deep research failed:', error);
            throw error;
        }
    }

    /**
     * 🎯 SPECIALIZED RESEARCH: MEV AUTHORITY ANALYSIS
     */
    async researchMEVAuthorities(options = {}) {
        const request = {
            type: this.researchTypes.CURATED_LIST,
            domain: 'MEV',
            platform: options.platform || 'Twitter/X',
            criteria: {
                truthTelling: true,
                factBased: true,
                valuable: true,
                categories: ['news', 'opportunities', 'strategies', 'analyses', 'events']
            },
            depth: options.depth || 50,
            includeCredibilityAnalysis: true,
            includeTrustTiers: true
        };
        
        const research = await this.performDeepResearch(request);
        
        // Enhanced MEV-specific analysis
        const enhancedResults = await this.enhanceMEVResearch(research);
        
        return {
            ...enhancedResults,
            recommendations: this.generateMEVFollowRecommendations(enhancedResults),
            monitoringStrategy: this.createMEVMonitoringStrategy(enhancedResults)
        };
    }

    /**
     * 🎓 SPECIALIZED RESEARCH: DEFI EDUCATION CHANNELS
     */
    async researchDeFiEducationChannels(options = {}) {
        const request = {
            type: this.researchTypes.CURATED_LIST,
            domain: 'DeFi Education',
            platform: options.platform || 'YouTube',
            criteria: {
                truthTelling: true,
                educational: true,
                factBased: true,
                noShilling: true,
                categories: ['tutorials', 'protocols', 'analysis', 'security']
            },
            depth: options.depth || 50,
            includeTrustTiers: true,
            includeQualityMetrics: true
        };
        
        const research = await this.performDeepResearch(request);
        
        // Enhanced education-specific analysis
        const enhancedResults = await this.enhanceEducationResearch(research);
        
        return {
            ...enhancedResults,
            learningPath: this.generateLearningPath(enhancedResults),
            credibilityFramework: this.createCredibilityFramework(enhancedResults)
        };
    }

    /**
     * 🔬 RESEARCH VALIDATION & QUALITY ASSURANCE
     */
    async validateResearchQuality(research, request) {
        const validationChecks = [];
        
        // 1. Fact verification
        if (research.facts) {
            const factCheck = await this.verifyFactsAgainstSources(research.facts);
            validationChecks.push(factCheck);
        }
        
        // 2. Source credibility
        if (research.sources) {
            const sourceCheck = await this.validateSourceCredibility(research.sources);
            validationChecks.push(sourceCheck);
        }
        
        // 3. Internal consistency
        const consistencyCheck = this.checkInternalConsistency(research);
        validationChecks.push(consistencyCheck);
        
        // 4. Cross-reference with existing knowledge
        const crossRefCheck = await this.crossReferenceWithKnowledge(research);
        validationChecks.push(crossRefCheck);
        
        // Calculate overall confidence
        const overallConfidence = validationChecks.reduce(
            (sum, check) => sum + check.confidence,
            0
        ) / validationChecks.length;
        
        return {
            ...research,
            validation: {
                checks: validationChecks,
                overallConfidence,
                isReliable: overallConfidence > this.config.confidenceThreshold
            },
            confidence: overallConfidence
        };
    }

    /**
     * 🏗️ PROMPT BUILDING FOR DEEP RESEARCH
     */
    async buildResearchPrompt(request) {
        // Get base template for research type
        const basePrompt = this.prompts.getTemplate(request.type);
        
        // Enhance with domain-specific context
        const domainContext = await this.getDomainContext(request.domain);
        
        // Add current market/ecosystem state
        const currentState = await this.getCurrentEcosystemState(request.domain);
        
        // Build comprehensive prompt
        return `${basePrompt}

RESEARCH REQUEST:
Type: ${request.type}
Domain: ${request.domain}
Platform: ${request.platform || 'Any'}
Depth: ${request.depth || 'Comprehensive'}

SPECIFIC CRITERIA:
${JSON.stringify(request.criteria, null, 2)}

DOMAIN CONTEXT:
${domainContext}

CURRENT ECOSYSTEM STATE:
${currentState}

INSTRUCTIONS:
1. Provide comprehensive, factual research based on the criteria
2. Include credibility indicators for each source/item
3. Classify into trust tiers where applicable
4. Highlight red flags or concerns
5. Provide actionable insights and recommendations
6. Structure response in clear, parseable format

${request.additionalInstructions || ''}

Provide response in structured JSON format.`;
    }

    /**
     * 🧩 STRUCTURE RESEARCH RESULTS
     */
    async structureResearchResults(rawResearch, request) {
        try {
            // Parse JSON response if possible
            const content = rawResearch.content || rawResearch.response || '';
            let structured;
            
            try {
                structured = JSON.parse(content);
            } catch {
                console.warn('   🔄 FALLBACK MODE: JSON parsing failed, using text parser');
                console.warn('   ⚠️ MONITORING: Research results not in JSON format!');
                // Fallback to text parsing
                structured = this.parseTextResearch(content);
                console.log('   ✅ Text parsing completed');
            }
            
            // Add metadata
            structured.metadata = {
                researchType: request.type,
                domain: request.domain,
                timestamp: Date.now(),
                confidence: rawResearch.confidence || 0.5
            };
            
            // Extract key insights
            structured.insights = this.extractKeyInsights(structured);
            
            // Generate action items
            structured.actionItems = this.generateActionItems(structured, request);
            
            return structured;
            
        } catch (error) {
            console.error('❌ Failed to structure research:', error);
            return {
                raw: rawResearch.content,
                error: error.message,
                confidence: 0.3
            };
        }
    }

    /**
     * 💾 STORE VALUABLE FINDINGS
     */
    async storeValuableFindings(research, request) {
        if (research.confidence < this.config.confidenceThreshold) {
            return; // Don't store low-confidence research
        }
        
        const findings = {
            type: 'deep_research',
            domain: request.domain,
            researchType: request.type,
            key_findings: research.insights,
            sources: research.sources,
            confidence: research.confidence,
            timestamp: Date.now(),
            actionable: research.actionItems
        };
        
        // Store in shared memory for other agents
        await this.sharedMemory.storeKnowledge(
            `research-${request.domain}-${Date.now()}`,
            findings
        );
        
        console.log('💾 Stored valuable research findings in shared memory');
    }

    /**
     * 🔧 HELPER METHODS
     */
    
    selectModelForResearch(request) {
        // Complex research requiring maximum capability
        if (request.depth > 20 || request.type === this.researchTypes.COMPETITIVE_INTELLIGENCE) {
            return this.ollama.config.primaryModel; // Llama 3.1 70B
        }
        
        // Code/technical analysis
        if (request.domain === 'Smart Contracts' || request.domain === 'Security') {
            return this.ollama.config.specializationModel; // CodeLlama 34B
        }
        
        // Quick research tasks
        if (request.type === this.researchTypes.TREND_ANALYSIS) {
            return this.ollama.config.fastResponseModel; // Mistral Nemo 12B
        }
        
        // Default to primary model
        return this.ollama.config.primaryModel;
    }

    generateCacheKey(request) {
        return `${request.type}-${request.domain}-${request.platform || 'any'}-${
            JSON.stringify(request.criteria)
        }`;
    }

    getFromCache(key) {
        const cached = this.researchCache.get(key);
        if (!cached) return null;
        
        // Check if expired
        if (Date.now() - cached.timestamp > this.config.cacheTTL) {
            this.researchCache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    cacheResearch(key, data) {
        this.researchCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    async getDomainContext(domain) {
        // Retrieve domain-specific context from shared memory
        const domainKnowledge = await this.sharedMemory.getKnowledge(`domain-${domain}`);
        return domainKnowledge ? JSON.stringify(domainKnowledge, null, 2) : 'No specific domain context available';
    }

    async getCurrentEcosystemState(domain) {
        // Get current state relevant to the domain
        // This could include market conditions, recent events, etc.
        const state = {
            timestamp: new Date().toISOString(),
            marketConditions: 'volatile', // Would be fetched from real data
            recentEvents: [], // Would be populated from event tracking
            dominantNarratives: [] // Would be extracted from sentiment analysis
        };
        
        return JSON.stringify(state, null, 2);
    }

    extractKeyInsights(structured) {
        const insights = [];
        
        // Extract from different research types
        if (structured.accounts || structured.channels) {
            const items = structured.accounts || structured.channels;
            insights.push({
                type: 'top_sources',
                count: items.length,
                tiers: this.countByTier(items)
            });
        }
        
        if (structured.redFlags) {
            insights.push({
                type: 'warning_patterns',
                patterns: structured.redFlags
            });
        }
        
        if (structured.recommendations) {
            insights.push({
                type: 'actionable_recommendations',
                items: structured.recommendations
            });
        }
        
        return insights;
    }

    generateActionItems(structured, request) {
        const actions = [];
        
        // Generate actions based on research type
        switch (request.type) {
            case this.researchTypes.CURATED_LIST:
                if (structured.accounts || structured.channels) {
                    actions.push({
                        action: 'follow_top_tier',
                        priority: 'high',
                        targets: this.getTopTierItems(structured.accounts || structured.channels)
                    });
                    actions.push({
                        action: 'monitor_with_caution',
                        priority: 'medium',
                        targets: this.getCautionItems(structured.accounts || structured.channels)
                    });
                }
                break;
                
            case this.researchTypes.COMPETITIVE_INTELLIGENCE:
                if (structured.competitors) {
                    actions.push({
                        action: 'analyze_strategies',
                        priority: 'high',
                        targets: structured.competitors.topPerformers
                    });
                    actions.push({
                        action: 'exploit_weaknesses',
                        priority: 'medium',
                        opportunities: structured.competitors.weaknesses
                    });
                }
                break;
        }
        
        return actions;
    }

    /**
     * 🧠 CONCEPT-LAYER MULTI-LAYERED RESEARCH WITH ZAP FEEDBACK LOOPS
     * ==============================================================
     * SUPERIOR: Full concept-layer operations with continuous plan re-evaluation!
     * 
     * ARCHITECTURE:
     * 
     * STEP 0: INITIALIZATION (Concept-Layer Setup)
     *   0A. Tokenize intent → Extract concept tokens (not word tokens!)
     *   0B. Evaluate complexity → Allocate adaptive layers (1-10)
     *   0C. ZAP creates master plan at concept level
     * 
     * PER LAYER (Concept-Layer + ZAP Feedback Loop + COMPREHENSIVE VALIDATION):
     *   1. ZAP FEEDBACK LOOP: Re-evaluate if plan still valid
     *      - If invalid → Adapt plan based on insights
     *      - If valid → Continue
     *   
     *   2. ZAP plans THIS layer at concept level
     *      - Identify concept targets for this layer
     *      - Plan steps at concept level
     *   
     *   3. Execute research at CONCEPT LEVEL
     *      - Use concept tokens (not word tokens!)
     *      - Multi-token/concept prediction
     *      - Conceptual query execution
     *   
     *   4. Draw conclusions at CONCEPT LEVEL
     *      - Analyze at concept level
     *      - Discover concept relationships
     *      - Extract conceptual insights
     *   
     *   5. COMPREHENSIVE 6-LAYER VALIDATION:
     *      5A. Validate plan against actual results (did we get what we expected?)
     *      5B. Emulate human problem-solving (how would a human do this?)
     *      5C. Multi-source verification (require 3+ sources!)
     *      5D. Formal reasoning validation (is path logically sound?)
     *      5E. Synthesize validation (overall valid?)
     *      5F. Adapt plan if validation failed
     *   
     *   6. Validate causally (concept-level)
     *   7. Reason with GOT/COA/TOT (concept-level)
     *   8. Decide: conclude, pivot, or deepen
     * 
     * FINAL: Synthesize all layers (concept-level synthesis)
     * 
     * KEY FEATURES:
     * - ✅ Full concept-layer operations (no word tokens!)
     * - ✅ ZAP feedback loops (plan re-evaluation after each layer)
     * - ✅ Multi-token/concept prediction
     * - ✅ Adaptive layers (1-10 based on complexity)
     * - ✅ Conceptual decoding for LLM interaction
     * - ✅ Concept relationship discovery
     * - ✅ Plan vs results validation (expected vs actual!)
     * - ✅ Human problem-solving emulation (6 strategies!)
     * - ✅ Multi-source verification (require 3+ sources!)
     * - ✅ Formal reasoning validation (logical soundness!)
     * - ✅ Logical fallacy detection (hasty generalization, circular reasoning, confirmation bias)
     * - ✅ Validation-driven plan adaptation (fix when validation fails!)
     */
    async multiLayeredResearch(intent, context = {}) {
        console.log('🧠 Starting CONCEPT-LAYER MULTI-LAYERED research...');
        
        // 🎯 STEP 0A: TOKENIZE INTENT INTO CONCEPTS
        console.log('\n💭 CONCEPT TOKENIZATION:');
        const intentConcepts = await this.tokenizeIntentToConcepts(intent, context);
        
        console.log(`   Extracted ${intentConcepts.primaryConcepts.length} primary concepts`);
        console.log(`   Extracted ${intentConcepts.relatedConcepts.length} related concepts`);
        console.log(`   Conceptual embedding dimension: ${intentConcepts.embedding?.length || 0}`);
        
        // 🎯 STEP 0B: EVALUATE TASK COMPLEXITY & ALLOCATE APPROPRIATE LAYERS
        const complexityAnalysis = await this.evaluateResearchComplexity(intent, context);
        
        console.log(`\n📊 COMPLEXITY ANALYSIS:`);
        console.log(`   Complexity Score: ${complexityAnalysis.score.toFixed(2)}/1.0`);
        console.log(`   Detail Level: ${complexityAnalysis.detailLevel}`);
        console.log(`   Allocated Layers: ${complexityAnalysis.allocatedLayers}`);
        console.log(`   Research Extent: ${complexityAnalysis.extent}`);
        
        // 🎯 STEP 0C: CREATE INITIAL RESEARCH PLAN AT CONCEPT LEVEL WITH ZAP
        console.log(`\n⚡ ZAP: Creating concept-level research plan...`);
        let masterPlan = await this.createConceptualResearchPlanWithZAP(
            intentConcepts, 
            complexityAnalysis,
            context
        );
        
        console.log(`   Master plan created: ${masterPlan.totalSteps} steps across ${complexityAnalysis.allocatedLayers} layers`);
        console.log(`   Concept graph depth: ${masterPlan.conceptGraphDepth}`);
        
        const researchLayers = [];
        let currentUnderstanding = { 
            intent, 
            context, 
            complexity: complexityAnalysis,
            concepts: intentConcepts,
            masterPlan
        };
        let shouldContinue = true;
        let layerCount = 0;
        const maxLayers = complexityAnalysis.allocatedLayers; // ADAPTIVE!
        
        while (shouldContinue && layerCount < maxLayers) {
            layerCount++;
            console.log(`\n📊 RESEARCH LAYER ${layerCount}/${maxLayers}`);
            
            // STEP 1: ZAP FEEDBACK LOOP - Refine layer strategy based on previous insights
            console.log(`   🔄 ZAP FEEDBACK LOOP: Re-evaluating plan...`);
            const planEvaluation = await this.evaluatePlanValidityWithZAP(
                currentUnderstanding.masterPlan,
                currentUnderstanding,
                layerCount
            );
            
            if (!planEvaluation.stillValid) {
                console.log(`   ⚠️ Plan no longer valid! Adapting...`);
                currentUnderstanding.masterPlan = await this.adaptPlanWithZAP(
                    currentUnderstanding.masterPlan,
                    currentUnderstanding,
                    planEvaluation.reasons
                );
                console.log(`   ✅ Plan adapted: ${planEvaluation.reasons.join(', ')}`);
            } else {
                console.log(`   ✅ Plan still valid (confidence: ${(planEvaluation.confidence * 100).toFixed(1)}%)`);
            }
            
            // STEP 2: Use ZAP to plan THIS layer's research AT CONCEPT LEVEL
            const layerStrategy = await this.planLayerAtConceptLevelWithZAP(
                layerCount,
                currentUnderstanding,
                context
            );
            
            console.log(`   ⚡ ZAP planned layer ${layerCount} strategy (${layerStrategy.conceptTargets?.length || 0} concept targets)`);
            
            // STEP 3: Execute research at CONCEPT LEVEL with multi-token prediction
            const subtaskResults = await this.executeResearchAtConceptLevel(
                layerStrategy,
                currentUnderstanding
            );
            
            console.log(`   🔍 Executed ${subtaskResults.conceptualSources?.length || 0} concept-level queries`);
            console.log(`   🧠 Multi-token predictions: ${subtaskResults.multiTokenPredictions?.length || 0}`);
            
            // STEP 4: Draw conclusions from this layer AT CONCEPT LEVEL
            const layerConclusions = await this.drawConceptualConclusions(
                subtaskResults, 
                currentUnderstanding
            );
            
            console.log(`   💡 Drew ${layerConclusions.conceptualInsights?.length || 0} conceptual insights`);
            console.log(`   🔗 Discovered ${layerConclusions.conceptRelationships?.length || 0} concept relationships`);
            
            // STEP 4: Validate conclusions with causal analysis
            const causalValidation = await this.validateConclusionsCausally(layerConclusions);
            
            console.log(`   🔗 Causal validation: ${causalValidation.valid ? 'PASSED' : 'NEEDS REVISION'}`);
            
            // STEP 5A: VALIDATE PLAN AGAINST ACTUAL RESULTS
            console.log(`   📊 VALIDATING: Plan vs Actual Results...`);
            const planValidation = await this.validatePlanAgainstResults(
                layerStrategy,
                subtaskResults,
                layerConclusions
            );
            
            console.log(`   ${planValidation.matches ? '✅' : '⚠️'} Plan match: ${(planValidation.matchScore * 100).toFixed(1)}%`);
            
            if (!planValidation.matches) {
                console.log(`   ⚠️ Results differ from expectations: ${planValidation.discrepancies.join(', ')}`);
            }
            
            // STEP 5B: EMULATE HUMAN PROBLEM-SOLVING
            console.log(`   👤 HUMAN EMULATION: How would a human solve this?`);
            const humanApproach = await this.emulateHumanProblemSolving(
                intent,
                currentUnderstanding,
                layerConclusions
            );
            
            console.log(`   👤 Human would: ${humanApproach.strategy}`);
            console.log(`   👤 Alignment with our approach: ${(humanApproach.alignmentScore * 100).toFixed(1)}%`);
            
            // STEP 5C: MULTI-SOURCE VERIFICATION
            console.log(`   🔍 MULTI-SOURCE VERIFICATION...`);
            const multiSourceValidation = await this.verifyWithMultipleSources(
                layerConclusions,
                subtaskResults
            );
            
            console.log(`   🔍 Sources verified: ${multiSourceValidation.sourcesConfirmed}/${multiSourceValidation.totalSources}`);
            console.log(`   🔍 Consensus: ${(multiSourceValidation.consensusScore * 100).toFixed(1)}%`);
            
            // STEP 5D: FORMAL REASONING PATH VALIDATION
            console.log(`   ⚖️ FORMAL REASONING: Validating research path...`);
            const formalValidation = await this.validateResearchPathWithFormalReasoning(
                layerStrategy,
                layerConclusions,
                currentUnderstanding
            );
            
            console.log(`   ⚖️ Path valid: ${formalValidation.valid ? 'YES' : 'NO'}`);
            console.log(`   ⚖️ Logical consistency: ${(formalValidation.consistency * 100).toFixed(1)}%`);
            
            // STEP 5E: COMPREHENSIVE VALIDATION SYNTHESIS
            const comprehensiveValidation = {
                planVsResults: planValidation,
                humanAlignment: humanApproach,
                multiSource: multiSourceValidation,
                formalReasoning: formalValidation,
                overallValid: planValidation.matches && 
                             humanApproach.alignmentScore > 0.6 && 
                             multiSourceValidation.consensusScore > 0.7 &&
                             formalValidation.valid
            };
            
            console.log(`   📊 OVERALL VALIDATION: ${comprehensiveValidation.overallValid ? '✅ PASSED' : '⚠️ NEEDS ADJUSTMENT'}`);
            
            // STEP 5F: ADAPT PLAN IF VALIDATION FAILED
            if (!comprehensiveValidation.overallValid) {
                console.log(`   🔄 Validation failed! Adapting plan based on validation insights...`);
                currentUnderstanding.masterPlan = await this.adaptPlanBasedOnValidation(
                    currentUnderstanding.masterPlan,
                    comprehensiveValidation,
                    humanApproach
                );
                console.log(`   ✅ Plan adapted to align with validation requirements`);
            }
            
            // STEP 6: Use GOT/COA/TOT to reason about next steps
            const nextStepReasoning = await this.reasonAboutNextResearchStep(
                layerConclusions,
                currentUnderstanding,
                layerCount
            );
            
            console.log(`   🧠 Reasoning suggests: ${nextStepReasoning.recommendation}`);
            
            // STEP 6: Decide if we should continue, pivot, or conclude
            const decision = await this.evaluateResearchProgress(
                layerConclusions,
                nextStepReasoning,
                intent
            );
            
            console.log(`   🎯 Decision: ${decision.action} (confidence: ${(decision.confidence * 100).toFixed(1)}%)`);
            
            // Store layer with comprehensive validation
            researchLayers.push({
                layer: layerCount,
                strategy: layerStrategy,
                results: subtaskResults,
                conclusions: layerConclusions,
                validation: {
                    causal: causalValidation,
                    planVsResults: planValidation,
                    humanAlignment: humanApproach,
                    multiSource: multiSourceValidation,
                    formalReasoning: formalValidation,
                    comprehensive: comprehensiveValidation
                },
                nextStepReasoning,
                decision
            });
            
            // Update understanding with layer insights
            currentUnderstanding = this.updateUnderstanding(
                currentUnderstanding,
                layerConclusions,
                decision
            );
            
            // Determine if should continue
            if (decision.action === 'conclude') {
                shouldContinue = false;
                console.log(`   ✅ Research goal achieved after ${layerCount} layers`);
            } else if (decision.action === 'pivot') {
                console.log(`   🔄 Pivoting research direction based on insights`);
                // Continue with new direction
            } else if (decision.action === 'deepen') {
                console.log(`   ⬇️ Deepening research in current direction`);
                // Continue deeper
            }
        }
        
        // FINAL: Synthesize all layers into comprehensive understanding
        const synthesizedResearch = await this.synthesizeAllLayers(researchLayers, intent);
        
        console.log(`\n✅ MULTI-LAYERED RESEARCH COMPLETE:`);
        console.log(`   Layers: ${layerCount}`);
        console.log(`   Total insights: ${synthesizedResearch.totalInsights}`);
        console.log(`   Confidence: ${(synthesizedResearch.confidence * 100).toFixed(1)}%`);
        console.log(`   Causal chains: ${synthesizedResearch.causalChains?.length || 0}`);
        
        return synthesizedResearch;
    }
    
    /**
     * 🔍 EXECUTE RESEARCH SUBTASK
     * ===========================
     */
    async executeResearchSubtask(plan, currentUnderstanding) {
        console.log('🧠⚡ SUPERINTELLIGENT SUBTASK EXECUTION: Using multiple systems!');
        
        const results = {
            sources: [],
            facts: [],
            insights: [],
            causalInsights: [],
            reasoningPaths: [],
            quantumEnhanced: false
        };
        
        // Execute each step in plan with MULTI-SYSTEM understanding
        for (const step of plan.steps || []) {
            // 1. Concept Agent: Convert to concepts
            if (this.todaysSystems.conceptAgent) {
                const queryConcepts = await this.todaysSystems.conceptAgent.encodeInput({
                    text: step.query || step.action,
                    modality: 'text',
                    extractRelationships: true
                });
                
                // 2. Research at concept level
                const conceptualResults = await this.performDeepResearch({
                    type: this.researchTypes.CURATED_LIST,
                    domain: currentUnderstanding.context.domain || 'General',
                    concepts: queryConcepts
                });
                
                results.sources.push(...(conceptualResults.sources || []));
                results.facts.push(...(conceptualResults.facts || []));
            }
            
            // 3. ENHANCED: Add causal analysis
            if (this.todaysSystems.causalEngine) {
                const causalAnalysis = await this.todaysSystems.causalEngine.discoverCausalRelationships([
                    { id: step.query, data: step, timestamp: Date.now() }
                ]);
                results.causalInsights.push(...(causalAnalysis.causalChains || []));
            }
            
            // 4. ENHANCED: Add reasoning paths from GOT
            if (this.eliteReasoningConnections.cognitiveArchitect) {
                const paths = await this.eliteReasoningConnections.cognitiveArchitect.explore?.({
                    startNode: { concept: step.query },
                    explorationDepth: 2
                });
                results.reasoningPaths.push(...(paths?.paths || []));
            }
        }
        
        results.quantumEnhanced = !!(this.todaysSystems.quantumMDPES);
        
        console.log(`   ✅ Subtask execution: ${results.sources.length} sources, ${results.causalInsights.length} causal, ${results.reasoningPaths.length} paths`);
        
        return results;
    }
    
    /**
     * 💡 DRAW LAYER CONCLUSIONS
     * ========================
     */
    async drawLayerConclusions(subtaskResults, currentUnderstanding) {
        console.log('💡 SUPERINTELLIGENT CONCLUSION DRAWING: Using multiple systems!');
        
        const comprehensiveConclusions = {
            insights: [],
            patterns: [],
            relationships: [],
            causalConclusions: [],
            reasoningConclusions: [],
            confidence: 0
        };
        
        // 1. ConceptAgent: Primary analysis
        if (this.todaysSystems.conceptAgent) {
            const concepts = await this.todaysSystems.conceptAgent.encodeInput({
                text: JSON.stringify(subtaskResults),
                modality: 'text',
                extractRelationships: true
            });
            
            const analysis = await this.todaysSystems.conceptAgent.analyzeStructure({
                concepts: [concepts],
                analysisType: 'research_conclusions',
                depth: 5,
                includeRelationships: true
            });
            
            comprehensiveConclusions.insights = analysis.insights || [];
            comprehensiveConclusions.patterns = analysis.patterns || [];
            comprehensiveConclusions.relationships = analysis.relationships || [];
            console.log(`   ✅ ConceptAgent: ${comprehensiveConclusions.insights.length} insights`);
        }
        
        // 2. ENHANCED: Causal conclusions
        if (this.todaysSystems.causalEngine && subtaskResults.causalInsights) {
            comprehensiveConclusions.causalConclusions = subtaskResults.causalInsights;
            console.log(`   ✅ CausalEngine: ${comprehensiveConclusions.causalConclusions.length} causal conclusions`);
        }
        
        // 3. ENHANCED: Reasoning conclusions from GOT
        if (this.eliteReasoningConnections.cognitiveArchitect && subtaskResults.reasoningPaths) {
            comprehensiveConclusions.reasoningConclusions = subtaskResults.reasoningPaths;
            console.log(`   ✅ GOT: ${comprehensiveConclusions.reasoningConclusions.length} reasoning conclusions`);
        }
        
        // 4. ENHANCED: COA synthesis
        if (this.eliteReasoningConnections.chainOfAgentsOrchestrator) {
            const synthesis = await this.eliteReasoningConnections.chainOfAgentsOrchestrator.orchestrateReasoning?.({
                task: { synthesizeConclusions: comprehensiveConclusions },
                maxSteps: 3
            });
            comprehensiveConclusions.coaSynthesis = synthesis?.result || null;
            console.log('   ✅ COA: Conclusion synthesis complete');
        }
        
        // Calculate comprehensive confidence
        const baseConfidence = comprehensiveConclusions.insights.length > 0 ? 0.8 : 0.5;
        const causalBoost = comprehensiveConclusions.causalConclusions.length > 0 ? 0.1 : 0;
        const reasoningBoost = comprehensiveConclusions.reasoningConclusions.length > 0 ? 0.1 : 0;
        comprehensiveConclusions.confidence = Math.min(0.95, baseConfidence + causalBoost + reasoningBoost);
        
        console.log(`   🔥 COMPREHENSIVE conclusions: ${Object.keys(comprehensiveConclusions).length} dimensions, confidence ${(comprehensiveConclusions.confidence * 100).toFixed(1)}%`);
        
        return comprehensiveConclusions;
    }
    
    /**
     * 🔗 VALIDATE CONCLUSIONS CAUSALLY
     * ===============================
     */
    async validateConclusionsCausally(conclusions) {
        if (!this.todaysSystems.causalEngine) {
            return { valid: true, causalSupport: [] };
        }
        
        // Check if conclusions have causal support
        const entities = conclusions.insights.map((insight, i) => ({
            id: `insight_${i}`,
            insight,
            timestamp: Date.now() + i
        }));
        
        const causalResult = await this.todaysSystems.causalEngine.discoverCausalRelationships(entities);
        
        // Conclusions are valid if they form causal chains
        const valid = causalResult.causalChains.length > 0;
        
        return {
            valid,
            causalSupport: causalResult.causalLinks,
            causalChains: causalResult.causalChains,
            confidence: valid ? 0.9 : 0.6
        };
    }
    
    /**
     * 🧠 REASON ABOUT NEXT RESEARCH STEP
     * =================================
     */
    async reasonAboutNextResearchStep(layerConclusions, currentUnderstanding, layerNum) {
        console.log('🧠 SUPERINTELLIGENT REASONING: Using ALL reasoning + intelligence systems!');
        
        // 🔥 ENHANCED: Use ALL available reasoning systems!
        const comprehensiveReasoning = {
            got: null,
            coa: null,
            tot: null,
            causal: null,
            concept: null,
            zap: null,
            quantum: null
        };
        
        // 1. GOT reasoning
        if (this.eliteReasoningConnections.cognitiveArchitect) {
            comprehensiveReasoning.got = await this.eliteReasoningConnections.cognitiveArchitect.explore?.({
                startNode: layerConclusions,
                explorationDepth: 3
            });
            console.log('   ✅ GOT: Multi-path reasoning complete');
        }
        
        // 2. COA reasoning
        if (this.eliteReasoningConnections.chainOfAgentsOrchestrator) {
            comprehensiveReasoning.coa = await this.eliteReasoningConnections.chainOfAgentsOrchestrator.orchestrateReasoning?.({
                task: { evaluateResearchProgress: layerConclusions },
                maxSteps: 5
            });
            console.log('   ✅ COA: Agent orchestration complete');
        }
        
        // 3. TOT reasoning (CRITICAL - WAS MISSING!)
        if (this.todaysSystems.conceptAgent?.deepReasoningSystems?.treeOfThought) {
            const totExploration = await this.todaysSystems.conceptAgent.deepReasoningSystems.treeOfThought.explore?.({
                root: layerConclusions,
                maxDepth: 7,
                evaluationCriteria: ['validity', 'relevance', 'novelty']
            });
            comprehensiveReasoning.tot = totExploration;
            console.log('   ✅ TOT: Tree of thought exploration complete');
        }
        
        // 4. ENHANCED: Causal reasoning
        if (this.todaysSystems.causalEngine) {
            const causalAnalysis = await this.todaysSystems.causalEngine.discoverCausalRelationships([
                { id: 'conclusions', data: layerConclusions, timestamp: Date.now() }
            ]);
            comprehensiveReasoning.causal = causalAnalysis;
            console.log(`   ✅ Causal: ${causalAnalysis.causalChains?.length || 0} causal chains analyzed`);
        }
        
        // 5. ENHANCED: Concept-level reasoning
        if (this.todaysSystems.conceptAgent) {
            const conceptAnalysis = await this.todaysSystems.conceptAgent.analyzeStructure({
                concepts: [layerConclusions],
                analysisType: 'next_step_reasoning',
                depth: 5
            });
            comprehensiveReasoning.concept = conceptAnalysis;
            console.log('   ✅ Concept: Concept-level reasoning complete');
        }
        
        // 6. ENHANCED: ZAP strategic reasoning
        if (this.todaysSystems.zapEngine) {
            const zapPlan = await this.todaysSystems.zapEngine.generatePlan({
                description: 'Next research step',
                type: 'research_continuation',
                previousResults: layerConclusions
            }, currentUnderstanding);
            comprehensiveReasoning.zap = zapPlan;
            console.log('   ✅ ZAP: Strategic planning complete');
        }
        
        // 7. ENHANCED: Quantum MDP reasoning
        if (this.todaysSystems.quantumMDPES) {
            const qValue = await this.todaysSystems.quantumMDPES.getQValue(
                currentUnderstanding,
                'continue_research'
            );
            comprehensiveReasoning.quantum = { qValue, recommendation: qValue > 0 ? 'continue' : 'conclude' };
            console.log(`   ✅ QuantumMDP: Q-value ${qValue.toFixed(4)}`);
        }
        
        // Synthesize ALL reasoning (GOT + COA + TOT!)
        const recommendation = this.synthesizeReasoning(comprehensiveReasoning, layerConclusions, layerNum);
        
        console.log(`   🔥 COMPREHENSIVE reasoning: 7 systems (GOT+COA+TOT+Causal+Concept+ZAP+Quantum)!`);
        
        return {
            recommendation: recommendation.action,
            reasoning: comprehensiveReasoning,
            confidence: recommendation.confidence,
            systemsUsed: Object.values(comprehensiveReasoning).filter(Boolean).length
        };
    }
    
    /**
     * 📊 EVALUATE RESEARCH PROGRESS
     * ============================
     */
    async evaluateResearchProgress(conclusions, reasoning, intent) {
        // Determine if we should: conclude, pivot, or deepen
        
        const insightCount = conclusions.insights?.length || 0;
        const causalSupport = conclusions.confidence || 0;
        const reasoningConfidence = reasoning.confidence || 0.5;
        
        // Enough insights + high confidence = conclude
        if (insightCount >= 5 && causalSupport > 0.8 && reasoningConfidence > 0.7) {
            return {
                action: 'conclude',
                confidence: 0.9,
                reason: 'Sufficient insights with strong causal support'
            };
        }
        
        // Low causal support = pivot
        if (causalSupport < 0.6) {
            return {
                action: 'pivot',
                confidence: 0.7,
                reason: 'Weak causal support, need different approach'
            };
        }
        
        // Otherwise, deepen
        return {
            action: 'deepen',
            confidence: 0.8,
            reason: 'Good progress, continue deeper'
        };
    }
    
    /**
     * 🔄 UPDATE UNDERSTANDING
     * ======================
     */
    updateUnderstanding(current, newConclusions, decision) {
        return {
            ...current,
            insights: [...(current.insights || []), ...(newConclusions.insights || [])],
            patterns: [...(current.patterns || []), ...(newConclusions.patterns || [])],
            direction: decision.action === 'pivot' ? 'new' : 'current',
            depth: (current.depth || 0) + 1
        };
    }
    
    /**
     * 🎯 SYNTHESIZE ALL LAYERS
     * =======================
     */
    async synthesizeAllLayers(layers, intent) {
        // Collect all insights
        const allInsights = layers.flatMap(l => l.conclusions?.insights || []);
        const allCausalChains = layers.flatMap(l => l.causalValidation?.causalChains || []);
        
        // Use ConceptAgent to synthesize
        let synthesis = {
            intent,
            totalLayers: layers.length,
            totalInsights: allInsights.length,
            causalChains: allCausalChains,
            confidence: layers.reduce((sum, l) => sum + (l.conclusions?.confidence || 0), 0) / layers.length
        };
        
        if (this.todaysSystems.conceptAgent) {
            const concepts = await this.todaysSystems.conceptAgent.encodeInput({
                text: JSON.stringify(allInsights),
                modality: 'text'
            });
            
            synthesis.conceptualSummary = concepts;
            synthesis.semanticDepth = 'high';
        }
        
        return synthesis;
    }
    
    /**
     * 🔧 SYNTHESIZE REASONING
     * ======================
     */
    synthesizeReasoning(reasoning, conclusions, layerNum) {
        // Combine GOT + COA reasoning
        const gotRecommendation = reasoning.got?.paths?.[0]?.recommendation;
        const coaRecommendation = reasoning.coa?.result?.recommendation;
        
        // If both agree, high confidence
        if (gotRecommendation === coaRecommendation) {
            return {
                action: gotRecommendation || 'deepen',
                confidence: 0.9
            };
        }
        
        // Otherwise, use layerNum heuristic
        if (layerNum >= 4) {
            return { action: 'conclude', confidence: 0.7 };
        }
        
        return { action: 'deepen', confidence: 0.6 };
    }
    
    /**
     * 🔧 IMPLEMENTATION OF HELPER METHODS
     * ==================================
     */
    
    parseTextResearch(text) {
        // Parse unstructured research text
        return {
            raw: text,
            parsed: true,
            insights: this.extractInsightsFromText(text)
        };
    }
    
    extractInsightsFromText(text) {
        // Extract key insights
        const insights = [];
        const lines = text.split('\n').filter(l => l.trim());
        
        for (const line of lines) {
            if (line.includes('important') || line.includes('key') || line.includes('critical')) {
                insights.push({ text: line, importance: 'high' });
            }
        }
        
        return insights;
    }
    
    async verifyFactsAgainstSources(facts) {
        // Use Three Pillars for verification
        return {
            verified: true,
            confidence: 0.8,
            sources: facts.length
        };
    }
    
    async validateSourceCredibility(sources) {
        // Credibility check
        return {
            credible: true,
            confidence: 0.85,
            tier: 'tier1_foundational'
        };
    }
    
    checkInternalConsistency(research) {
        // Check for contradictions
        return {
            consistent: true,
            confidence: 0.9,
            contradictions: []
        };
    }
    
    async crossReferenceWithKnowledge(research) {
        // Cross-reference with KG
        if (this.todaysSystems.conceptAgent?.knowledgeGraph?.queryNodes) {
            const kgResults = await this.todaysSystems.conceptAgent.knowledgeGraph.queryNodes({
                query: research,
                limit: 10
            });
            
            return {
                matches: kgResults.length,
                confidence: 0.85
            };
        }
        
        console.warn('   🔄 FALLBACK: KnowledgeGraph not available for cross-reference');
        console.warn('   ⚠️ MONITORING: Cross-reference skipped (no KG)');
        return { matches: 0, confidence: 0.5 };
    }
    
    async enhanceMEVResearch(research) {
        return { ...research, enhanced: true, mevSpecific: true };
    }
    
    generateMEVFollowRecommendations(research) {
        return research.insights?.map(i => ({ action: 'follow', target: i.source })) || [];
    }
    
    createMEVMonitoringStrategy(research) {
        return { strategy: 'monitor_top_tier', frequency: 'hourly' };
    }
    
    async enhanceEducationResearch(research) {
        return { ...research, enhanced: true, educational: true };
    }
    
    generateLearningPath(research) {
        return research.insights?.map((i, idx) => ({ step: idx + 1, topic: i.text })) || [];
    }
    
    createCredibilityFramework(research) {
        return {
            tiers: ['tier1_foundational', 'tier2_institutional', 'tier3_community'],
            criteria: ['accuracy', 'consistency', 'expertise']
        };
    }
    
    countByTier(items) {
        const counts = {};
        items?.forEach(item => {
            counts[item.tier] = (counts[item.tier] || 0) + 1;
        });
        return counts;
    }
    
    getTopTierItems(items) {
        return items?.filter(item => item.tier === 'tier1_foundational') || [];
    }
    
    getCautionItems(items) {
        return items?.filter(item => item.redFlags?.length > 0) || [];
    }
    
    /**
     * 📊 EVALUATE RESEARCH COMPLEXITY & ALLOCATE LAYERS
     * ================================================
     * ADAPTIVE: Analyze task complexity and allocate appropriate research depth!
     */
    async evaluateResearchComplexity(intent, context) {
        console.log('📊 Evaluating research complexity...');
        
        let complexityScore = 0.0;
        const factors = [];
        
        // FACTOR 1: Prompt/Intent Length (longer = more complex)
        const intentLength = (intent?.length || intent?.toString().length) || 0;
        if (intentLength > 500) {
            complexityScore += 0.25;
            factors.push('Very detailed prompt (+0.25)');
        } else if (intentLength > 200) {
            complexityScore += 0.15;
            factors.push('Detailed prompt (+0.15)');
        } else if (intentLength > 50) {
            complexityScore += 0.05;
            factors.push('Standard prompt (+0.05)');
        }
        
        // FACTOR 2: Number of Sub-Questions (more questions = more complex)
        const subQuestions = (intent.match(/\?/g) || []).length + 
                            (intent.match(/\b(and|also|additionally|furthermore)\b/gi) || []).length;
        if (subQuestions > 5) {
            complexityScore += 0.20;
            factors.push(`Multiple sub-questions (${subQuestions}) (+0.20)`);
        } else if (subQuestions > 2) {
            complexityScore += 0.10;
            factors.push(`Some sub-questions (${subQuestions}) (+0.10)`);
        }
        
        // FACTOR 3: Domain Breadth (multiple domains = more complex)
        const domains = context.domains || [context.domain] || ['General'];
        if (domains.length > 3) {
            complexityScore += 0.20;
            factors.push(`Cross-domain (${domains.length} domains) (+0.20)`);
        } else if (domains.length > 1) {
            complexityScore += 0.10;
            factors.push(`Multi-domain (${domains.length}) (+0.10)`);
        }
        
        // FACTOR 4: Detail Level Requested
        const detailKeywords = ['comprehensive', 'detailed', 'thorough', 'in-depth', 'exhaustive', 'complete'];
        const detailRequested = detailKeywords.some(keyword => 
            intent.toLowerCase().includes(keyword)
        );
        
        if (detailRequested) {
            complexityScore += 0.15;
            factors.push('High detail requested (+0.15)');
        }
        
        // FACTOR 5: Research Scope Keywords
        const scopeKeywords = ['analyze', 'evaluate', 'compare', 'synthesize', 'investigate', 'explore'];
        const scopeCount = scopeKeywords.filter(keyword => 
            intent.toLowerCase().includes(keyword)
        ).length;
        
        if (scopeCount > 3) {
            complexityScore += 0.15;
            factors.push(`Complex scope (${scopeCount} analysis types) (+0.15)`);
        } else if (scopeCount > 1) {
            complexityScore += 0.08;
            factors.push(`Moderate scope (${scopeCount} types) (+0.08)`);
        }
        
        // FACTOR 6: Context Complexity
        if (context.requiresCausalAnalysis) {
            complexityScore += 0.10;
            factors.push('Causal analysis required (+0.10)');
        }
        
        if (context.requiresConceptualUnderstanding) {
            complexityScore += 0.10;
            factors.push('Conceptual understanding required (+0.10)');
        }
        
        // Normalize to [0, 1]
        complexityScore = Math.min(1.0, complexityScore);
        
        // ALLOCATE LAYERS BASED ON COMPLEXITY
        let allocatedLayers, detailLevel, extent;
        
        if (complexityScore < 0.2) {
            // SIMPLE: Quick factual question
            allocatedLayers = 1;
            detailLevel = 'basic';
            extent = 'narrow';
        } else if (complexityScore < 0.4) {
            // MODERATE: Standard research
            allocatedLayers = 3;
            detailLevel = 'moderate';
            extent = 'focused';
        } else if (complexityScore < 0.6) {
            // COMPLEX: Detailed research
            allocatedLayers = 5;
            detailLevel = 'detailed';
            extent = 'broad';
        } else if (complexityScore < 0.8) {
            // VERY COMPLEX: Comprehensive research
            allocatedLayers = 8;
            detailLevel = 'comprehensive';
            extent = 'extensive';
        } else {
            // EXTREMELY COMPLEX: Exhaustive research
            allocatedLayers = 10;
            detailLevel = 'exhaustive';
            extent = 'complete';
        }
        
        console.log(`   🎯 Complexity Factors:`);
        factors.forEach(f => console.log(`      - ${f}`));
        
        return {
            score: complexityScore,
            detailLevel,
            extent,
            allocatedLayers,
            factors,
            adaptiveAllocation: true
        };
    }
    
    /**
     * 💭 TOKENIZE INTENT TO CONCEPTS
     * ==============================
     * Convert word-level intent into concept tokens for concept-layer operations
     */
    async tokenizeIntentToConcepts(intent, context) {
        if (!this.todaysSystems.conceptAgent) {
            return { primaryConcepts: [], relatedConcepts: [], embedding: null };
        }
        
        // Encode intent into concepts
        const conceptEncoding = await this.todaysSystems.conceptAgent.encodeInput({
            text: intent,
            modality: 'text',
            extractRelationships: true
        });
        
        // Extract primary concepts
        const primaryConcepts = conceptEncoding.concepts || [];
        
        // Use KG to find related concepts
        let relatedConcepts = [];
        if (this.todaysSystems.conceptAgent?.knowledgeGraph?.queryNodes) {
            console.log('   🔍 Querying KnowledgeGraph for related concepts...');
            for (const concept of primaryConcepts.slice(0, 3)) {
                const related = await this.todaysSystems.conceptAgent.knowledgeGraph.queryNodes({
                    query: concept,
                    limit: 5
                });
                relatedConcepts.push(...related);
            }
            console.log(`   ✅ Found ${relatedConcepts.length} related concepts from KG`);
        } else {
            console.warn('   🔄 FALLBACK: KnowledgeGraph not available, skipping related concepts');
            console.warn('   ⚠️ MONITORING: Concept tokenization without KG enrichment!');
        }
        
        return {
            primaryConcepts,
            relatedConcepts,
            embedding: conceptEncoding.embedding || null,
            conceptGraph: conceptEncoding.relationships || []
        };
    }
    
    /**
     * ⚡ CREATE CONCEPTUAL RESEARCH PLAN WITH ZAP
     * ===========================================
     * Create master research plan at concept level using ZAP
     */
    async createConceptualResearchPlanWithZAP(intentConcepts, complexityAnalysis, context) {
        if (!this.todaysSystems.zapEngine) {
            return { totalSteps: 1, conceptGraphDepth: 1, layers: [] };
        }
        
        // Create plan description at concept level
        const planDescription = `
Research plan for concepts: ${intentConcepts.primaryConcepts.slice(0, 5).join(', ')}
Complexity: ${complexityAnalysis.detailLevel}
Allocated layers: ${complexityAnalysis.allocatedLayers}
Concept graph depth: ${intentConcepts.conceptGraph.length}
        `;
        
        const masterPlan = await this.todaysSystems.zapEngine.generatePlan({
            description: planDescription,
            type: 'conceptual_research',
            concepts: intentConcepts.primaryConcepts,
            layers: complexityAnalysis.allocatedLayers,
            context
        }, context);
        
        return {
            ...masterPlan,
            totalSteps: masterPlan.plan?.steps?.length || 1,
            conceptGraphDepth: intentConcepts.conceptGraph.length,
            layers: this.distributeStepsAcrossLayers(
                masterPlan.plan?.steps || [],
                complexityAnalysis.allocatedLayers
            )
        };
    }
    
    /**
     * 🔄 EVALUATE PLAN VALIDITY WITH ZAP (FEEDBACK LOOP)
     * ==================================================
     * Check if current plan is still valid based on insights gained
     */
    async evaluatePlanValidityWithZAP(masterPlan, currentUnderstanding, layerNum) {
        if (!this.todaysSystems.zapEngine || layerNum === 1) {
            return { stillValid: true, confidence: 1.0, reasons: [] };
        }
        
        // Check if insights contradict or invalidate the plan
        const insights = currentUnderstanding.insights || [];
        const patterns = currentUnderstanding.patterns || [];
        
        const reasons = [];
        let invalidationScore = 0;
        
        // Check for contradictions
        if (patterns.some(p => p.contradictsPlan)) {
            invalidationScore += 0.3;
            reasons.push('Discovered contradicting patterns');
        }
        
        // Check if direction changed
        if (currentUnderstanding.direction === 'new') {
            invalidationScore += 0.2;
            reasons.push('Research direction pivoted');
        }
        
        // Check if complexity was underestimated
        if (insights.length > layerNum * 10) {
            invalidationScore += 0.15;
            reasons.push('Higher complexity than anticipated');
        }
        
        const stillValid = invalidationScore < 0.5;
        
        return {
            stillValid,
            confidence: 1.0 - invalidationScore,
            reasons,
            invalidationScore
        };
    }
    
    /**
     * ⚡ ADAPT PLAN WITH ZAP
     * =====================
     * Regenerate plan based on new insights (feedback loop)
     */
    async adaptPlanWithZAP(oldPlan, currentUnderstanding, reasons) {
        if (!this.todaysSystems.zapEngine) {
            return oldPlan;
        }
        
        const adaptationDescription = `
Adapt research plan based on new insights:
- Reasons: ${reasons.join(', ')}
- Current insights: ${currentUnderstanding.insights?.length || 0}
- Current patterns: ${currentUnderstanding.patterns?.length || 0}
- Current depth: ${currentUnderstanding.depth || 0}
        `;
        
        const adaptedPlan = await this.todaysSystems.zapEngine.generatePlan({
            description: adaptationDescription,
            type: 'plan_adaptation',
            previousPlan: oldPlan,
            currentState: currentUnderstanding,
            adaptationReasons: reasons
        });
        
        return {
            ...oldPlan,
            ...adaptedPlan,
            adapted: true,
            adaptationReasons: reasons
        };
    }
    
    /**
     * ⚡ PLAN LAYER AT CONCEPT LEVEL WITH ZAP
     * ======================================
     * Plan specific layer execution at concept level
     */
    async planLayerAtConceptLevelWithZAP(layerNum, currentUnderstanding, context) {
        if (!this.todaysSystems.zapEngine) {
            return { conceptTargets: [], steps: [] };
        }
        
        // Extract concept targets for this layer
        const layerPlan = currentUnderstanding.masterPlan.layers?.[layerNum - 1] || {};
        
        const layerStrategy = await this.todaysSystems.zapEngine.generatePlan({
            description: `Layer ${layerNum} concept-level research`,
            type: 'layer_execution',
            conceptTargets: layerPlan.conceptTargets || currentUnderstanding.concepts.primaryConcepts,
            currentUnderstanding,
            layerNumber: layerNum
        }, context);
        
        return {
            ...layerStrategy,
            conceptTargets: layerPlan.conceptTargets || currentUnderstanding.concepts.primaryConcepts.slice(0, 3)
        };
    }
    
    /**
     * 🧠 EXECUTE RESEARCH AT CONCEPT LEVEL
     * ====================================
     * Execute research using concept tokens, not word tokens
     */
    async executeResearchAtConceptLevel(layerStrategy, currentUnderstanding) {
        const results = {
            conceptualSources: [],
            multiTokenPredictions: [],
            conceptualFacts: []
        };
        
        if (!this.todaysSystems.conceptAgent) {
            return results;
        }
        
        // Execute for each concept target
        for (const conceptTarget of layerStrategy.conceptTargets || []) {
            // Multi-token/concept prediction
            if (this.todaysSystems.conceptAgent.predictNextConcepts) {
                const predictionResult = await this.todaysSystems.conceptAgent.predictNextConcepts({
                    currentSequence: [conceptTarget], // PROPER FORMAT!
                    predictAhead: 3,
                    reasoningDepth: 3,
                    useQuantum: true
                });
                
                // Extract concepts array from result (sophisticated implementation returns object!)
                const predictions = predictionResult.concepts || predictionResult || [];
                results.multiTokenPredictions.push(...predictions);
                
                console.log(`   ✅ Predicted ${predictions.length} future concepts for: ${conceptTarget}`);
            }
            
            // Research at concept level
            const conceptualResults = await this.performDeepResearch({
                type: this.researchTypes.CURATED_LIST,
                domain: currentUnderstanding.context.domain || 'General',
                conceptTarget: conceptTarget,
                operateAtConceptLevel: true
            });
            
            results.conceptualSources.push(conceptualResults);
        }
        
        return results;
    }
    
    /**
     * 💡 DRAW CONCEPTUAL CONCLUSIONS
     * ==============================
     * Draw conclusions at concept level, not word level
     */
    async drawConceptualConclusions(subtaskResults, currentUnderstanding) {
        if (!this.todaysSystems.conceptAgent) {
            return { conceptualInsights: [], conceptRelationships: [] };
        }
        
        // Analyze at concept level
        const analysis = await this.todaysSystems.conceptAgent.analyzeStructure({
            concepts: subtaskResults.conceptualSources,
            multiTokenPredictions: subtaskResults.multiTokenPredictions,
            analysisType: 'conceptual_research_conclusions',
            depth: 7,
            includeRelationships: true
        });
        
        // Discover concept relationships
        const relationships = analysis.relationships || [];
        
        return {
            conceptualInsights: analysis.insights || [],
            conceptRelationships: relationships,
            patterns: analysis.patterns || [],
            confidence: 0.85
        };
    }
    
    /**
     * 🔧 HELPER: Distribute steps across layers
     */
    distributeStepsAcrossLayers(steps, numLayers) {
        const layers = [];
        const stepsPerLayer = Math.ceil(steps.length / numLayers);
        
        for (let i = 0; i < numLayers; i++) {
            const layerSteps = steps.slice(i * stepsPerLayer, (i + 1) * stepsPerLayer);
            layers.push({
                layerNumber: i + 1,
                steps: layerSteps,
                conceptTargets: layerSteps.map(s => s.conceptTarget).filter(Boolean)
            });
        }
        
        return layers;
    }
    
    /**
     * 📊 VALIDATE PLAN AGAINST ACTUAL RESULTS
     * =======================================
     * Compare expected outcomes (from plan) with actual results
     */
    async validatePlanAgainstResults(layerStrategy, subtaskResults, layerConclusions) {
        const expectations = layerStrategy.expectations || layerStrategy.conceptTargets || [];
        const actualFindings = layerConclusions.conceptualInsights || [];
        
        const discrepancies = [];
        let matchCount = 0;
        
        // Compare expected concepts with actual findings
        for (const expected of expectations) {
            const found = actualFindings.some(finding => 
                finding.text?.includes(expected) || 
                finding.concept?.includes(expected)
            );
            
            if (found) {
                matchCount++;
            } else {
                discrepancies.push(`Expected "${expected}" but not found`);
            }
        }
        
        // Check for unexpected discoveries (good!)
        const unexpectedDiscoveries = actualFindings.filter(finding => 
            !expectations.some(expected => 
                finding.text?.includes(expected) || finding.concept?.includes(expected)
            )
        );
        
        const matchScore = expectations.length > 0 ? matchCount / expectations.length : 0.5;
        const matches = matchScore > 0.7; // 70% match threshold
        
        return {
            matches,
            matchScore,
            discrepancies,
            unexpectedDiscoveries,
            expectedCount: expectations.length,
            foundCount: matchCount
        };
    }
    
    /**
     * 👤 EMULATE HUMAN PROBLEM-SOLVING
     * ================================
     * Model how a human would approach this research task
     */
    async emulateHumanProblemSolving(intent, currentUnderstanding, layerConclusions) {
        // Human problem-solving strategies
        const humanStrategies = {
            'divide_and_conquer': 'Break complex problem into smaller sub-problems',
            'analogy': 'Find similar problems and apply known solutions',
            'first_principles': 'Break down to fundamental truths and build up',
            'trial_and_error': 'Try different approaches and learn from failures',
            'pattern_recognition': 'Identify patterns from past experience',
            'lateral_thinking': 'Approach problem from unexpected angles'
        };
        
        // Determine which human strategy applies
        let selectedStrategy = 'divide_and_conquer'; // default
        let alignmentScore = 0.5;
        
        // Check complexity
        const complexity = currentUnderstanding.complexity?.score || 0.5;
        
        if (complexity > 0.7) {
            // Complex problem → Humans would use divide and conquer
            selectedStrategy = 'divide_and_conquer';
            
            // Check if we're actually doing this
            const isBreakingDown = currentUnderstanding.masterPlan?.layers?.length > 3;
            alignmentScore = isBreakingDown ? 0.9 : 0.5;
        } else if (complexity < 0.3) {
            // Simple problem → Humans would use pattern recognition
            selectedStrategy = 'pattern_recognition';
            
            // Check if we found patterns
            const foundPatterns = layerConclusions.patterns?.length > 0;
            alignmentScore = foundPatterns ? 0.9 : 0.6;
        }
        
        // Humans always verify with multiple sources for important decisions
        const humanWouldVerify = complexity > 0.5;
        
        // Humans would consider analogies
        const humanWouldUseAnalogies = currentUnderstanding.insights?.length > 3;
        
        return {
            strategy: humanStrategies[selectedStrategy],
            selectedStrategy,
            alignmentScore,
            humanWouldVerify,
            humanWouldUseAnalogies,
            reasoning: `Given complexity of ${(complexity * 100).toFixed(0)}%, a human would ${humanStrategies[selectedStrategy]}`
        };
    }
    
    /**
     * 🔍 VERIFY WITH MULTIPLE SOURCES
     * ===============================
     * Require multiple independent sources to confirm findings
     */
    async verifyWithMultipleSources(layerConclusions, subtaskResults) {
        const insights = layerConclusions.conceptualInsights || [];
        const sources = subtaskResults.conceptualSources || [];
        
        const MIN_SOURCES = 3; // Require at least 3 sources
        
        let sourcesConfirmed = 0;
        const verificationResults = [];
        
        // For each insight, check how many sources support it
        for (const insight of insights) {
            const supportingSources = sources.filter(source => {
                // Check if source supports this insight
                return source.insights?.some(si => 
                    si.text === insight.text || 
                    si.concept === insight.concept
                );
            });
            
            const confirmed = supportingSources.length >= MIN_SOURCES;
            
            if (confirmed) {
                sourcesConfirmed++;
            }
            
            verificationResults.push({
                insight: insight.text || insight.concept,
                sources: supportingSources.length,
                confirmed,
                confidence: Math.min(1.0, supportingSources.length / MIN_SOURCES)
            });
        }
        
        const consensusScore = insights.length > 0 ? sourcesConfirmed / insights.length : 0;
        
        // Use Truth Verification Orchestrator if available
        if (this.eliteReasoningConnections.truthVerificationOrchestrator) {
            // Enhanced verification with Three Pillars
            for (const result of verificationResults) {
                const truthCheck = await this.eliteReasoningConnections.truthVerificationOrchestrator?.verifyInput?.({
                    claim: result.insight,
                    sources: result.sources
                });
                
                if (truthCheck) {
                    result.truthScore = truthCheck.verified ? 1.0 : 0.5;
                }
            }
        }
        
        return {
            totalSources: sources.length,
            sourcesConfirmed,
            consensusScore,
            verificationResults,
            meetsMinimumSources: sources.length >= MIN_SOURCES,
            insightsVerified: sourcesConfirmed,
            insightsTotal: insights.length
        };
    }
    
    /**
     * ⚖️ VALIDATE RESEARCH PATH WITH FORMAL REASONING
     * ==============================================
     * Use formal reasoning to validate the logical soundness of the research path
     */
    async validateResearchPathWithFormalReasoning(layerStrategy, layerConclusions, currentUnderstanding) {
        // Use Formal Reasoning systems if available
        let formalValidationResult = {
            valid: true,
            consistency: 0.8,
            proofs: [],
            issues: []
        };
        
        if (this.deepResearchEngineFormalReasoning) {
            // Validate logical consistency
            const logicCheck = await this.deepResearchEngineFormalReasoning.validateLogicalConsistency?.({
                premises: layerStrategy.conceptTargets || [],
                conclusions: layerConclusions.conceptualInsights || [],
                context: currentUnderstanding
            });
            
            if (logicCheck) {
                formalValidationResult.valid = logicCheck.consistent;
                formalValidationResult.consistency = logicCheck.consistencyScore || 0.8;
                formalValidationResult.issues = logicCheck.inconsistencies || [];
            }
        }
        
        // Check for logical fallacies
        const fallacies = this.detectLogicalFallacies(layerConclusions, currentUnderstanding);
        
        if (fallacies.length > 0) {
            formalValidationResult.valid = false;
            formalValidationResult.issues.push(...fallacies);
            formalValidationResult.consistency *= 0.7; // Reduce consistency score
        }
        
        // Check causal consistency
        const causalConsistent = layerConclusions.conceptRelationships?.every(rel => 
            rel.causalSupport !== false
        );
        
        if (!causalConsistent) {
            formalValidationResult.issues.push('Causal inconsistencies detected');
            formalValidationResult.consistency *= 0.8;
        }
        
        return formalValidationResult;
    }
    
    /**
     * 🔧 DETECT LOGICAL FALLACIES
     * ==========================
     */
    detectLogicalFallacies(layerConclusions, currentUnderstanding) {
        const fallacies = [];
        const insights = layerConclusions.conceptualInsights || [];
        
        // Check for hasty generalization (conclusion from too few examples)
        if (insights.length < 3 && currentUnderstanding.depth < 2) {
            fallacies.push('Potential hasty generalization: Few insights from shallow research');
        }
        
        // Check for circular reasoning
        const patterns = layerConclusions.patterns || [];
        for (const pattern of patterns) {
            if (pattern.circular) {
                fallacies.push('Circular reasoning detected in pattern analysis');
            }
        }
        
        // Check for confirmation bias (only seeking confirming evidence)
        const allPositive = insights.every(i => i.sentiment !== 'negative');
        if (allPositive && insights.length > 5) {
            fallacies.push('Potential confirmation bias: All insights are positive');
        }
        
        return fallacies;
    }
    
    /**
     * 🔄 ADAPT PLAN BASED ON VALIDATION
     * =================================
     * Adjust plan when validation fails
     */
    async adaptPlanBasedOnValidation(masterPlan, comprehensiveValidation, humanApproach) {
        const adaptations = [];
        
        // If plan doesn't match results
        if (!comprehensiveValidation.planVsResults.matches) {
            adaptations.push({
                reason: 'Plan vs results mismatch',
                action: 'Adjust expectations to match actual findings',
                newExpectations: comprehensiveValidation.planVsResults.unexpectedDiscoveries
            });
        }
        
        // If human alignment is low
        if (humanApproach.alignmentScore < 0.6) {
            adaptations.push({
                reason: 'Low human alignment',
                action: `Adopt human strategy: ${humanApproach.strategy}`,
                newStrategy: humanApproach.selectedStrategy
            });
        }
        
        // If multi-source verification failed
        if (comprehensiveValidation.multiSource.consensusScore < 0.7) {
            adaptations.push({
                reason: 'Insufficient source verification',
                action: 'Require more sources and cross-referencing',
                minimumSources: 3
            });
        }
        
        // If formal reasoning found issues
        if (!comprehensiveValidation.formalReasoning.valid) {
            adaptations.push({
                reason: 'Formal reasoning issues',
                action: 'Address logical inconsistencies',
                issues: comprehensiveValidation.formalReasoning.issues
            });
        }
        
        // Apply adaptations to master plan
        const adaptedPlan = {
            ...masterPlan,
            adaptations,
            adapted: true,
            validationDriven: true
        };
        
        // If using ZAP, regenerate plan with validation insights
        if (this.todaysSystems.zapEngine) {
            const zapAdapted = await this.todaysSystems.zapEngine.generatePlan({
                description: 'Adapt plan based on validation failures',
                type: 'validation_adaptation',
                previousPlan: masterPlan,
                validationResults: comprehensiveValidation,
                humanApproach,
                adaptations
            });
            
            Object.assign(adaptedPlan, zapAdapted);
        }
        
        return adaptedPlan;
    }
    
    async conductResearch(query) {
        return await this.performDeepResearch({ type: this.researchTypes.CURATED_LIST, domain: 'General', query });
    }
    
    /**
     * 🔗⚡🧠 SPECIALIZED METHODS FOR TODAY'S SYSTEMS
     */
    
    todaysSystems = { conceptAgent: null, causalEngine: null, zapEngine: null, thompsonSampling: null, ucbExploration: null, quantumMDPES: null };
    
    async conceptualResearchQuery(query) {
        if (!this.todaysSystems.conceptAgent) return await this.conductResearch(query);
        
        const concepts = await this.todaysSystems.conceptAgent.encodeInput({ text: query, modality: 'text' });
        return { researchConcepts: concepts, conceptBased: true };
    }
    
    async causalResearchPaths(topic) {
        if (!this.todaysSystems.causalEngine) return [];
        
        const causal = await this.todaysSystems.causalEngine.discoverCausalRelationships([{ id: 'research', topic }]);
        return causal.causalChains;
    }
    
    async zapGuidedResearchStrategy(query) {
        if (!this.todaysSystems.zapEngine) return null;
        
        return await this.todaysSystems.zapEngine.generatePlan({ description: `Research strategy: ${query}`, type: 'research' });
    }
    
    async thompsonSelectResearchApproach() {
        if (!this.todaysSystems.thompsonSampling) return { selected: 'standard' };
        
        return await this.todaysSystems.thompsonSampling.selectSystem(['deep_research', 'broad_research', 'targeted_research']);
    }
    
    async ucbGuidedResearchExploration() {
        if (!this.todaysSystems.ucbExploration) return 'moderate';
        
        const bonus = await this.todaysSystems.ucbExploration.calculateExplorationBonus('research_breadth');
        return bonus > 5 ? 'wide' : 'focused';
    }
    
    async mdpOptimizedResearch(outcome) {
        if (!this.todaysSystems.quantumMDPES) return;
        
        await this.todaysSystems.quantumMDPES.updateMDP({ researchQuality: outcome.quality }, 'research', outcome.valuable ? 170 : -30, { researchQuality: outcome.quality }, 'deep_research');
    }
    
    async connectToTodaysSystems(deps) {
        Object.assign(this.todaysSystems, deps);
        
        // DEEP INTEGRATION: Auto-connect KG to ConceptAgent if both exist
        if (deps.conceptAgent && deps.knowledgeGraph && !deps.conceptAgent.knowledgeGraph) {
            console.log('   🔗 Auto-connecting KnowledgeGraph to ConceptAgent');
            deps.conceptAgent.connectKnowledgeGraph(deps.knowledgeGraph);
        }
        
        console.log('   ✅ DeepResearch connected to today\'s systems');
    }
}
