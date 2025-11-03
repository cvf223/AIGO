/**
 * 🏆💰 SUPERINTELLIGENT SYSTEM USAGE REWARDS
 * ==========================================
 * 
 * **TOP 1% EXPERT IMPLEMENTATION - INCENTIVIZE SUPERINTELLIGENCE!**
 * 
 * REVOLUTIONARY PURPOSE:
 * FORCE agents to use advanced systems by rewarding heavily for comprehensive usage!
 * 
 * REWARD PHILOSOPHY:
 * - Using ZAP Engine = BIG rewards
 * - Using GOT/COA/TOT = BIG rewards  
 * - Proactive decision making = BIG rewards
 * - Using ALL 4 quantum engines = BIG rewards
 * - Better analysis before action = BIGGER rewards
 * - More systems used = EXPONENTIALLY bigger rewards
 * 
 * PENALTY PHILOSOPHY:
 * - Skipping ZAP when should use = BIG penalties
 * - Not using proactive systems = BIG penalties
 * - Shallow analysis = penalties
 * - Missing quantum opportunities = penalties
 * 
 * REWARD TIERS:
 * - Basic action: +10 points
 * - With proactive decision: +50 points
 * - With ZAP planning: +100 points
 * - With GOT/COA/TOT: +150 points each (up to +450!)
 * - With all 4 quantum engines: +200 points
 * - With causal understanding: +100 points
 * - With concept-level reasoning: +80 points
 * - COMPREHENSIVE (all systems): +1000 BONUS!
 * 
 * @author Elite AI Syndicate - Incentive Architecture Team
 * @version 1.0.0 - System Usage Rewards
 */

import { EventEmitter } from 'events';
import { ThompsonSamplingSystemSelector } from '../learning/ThompsonSamplingSystemSelector.js';
import { UCBExplorationBonus } from '../learning/UCBExplorationBonus.js';
import { DeepSystemInterconnectionMatrix } from '../integration/DeepSystemInterconnectionMatrix.js';

export class SuperintellgentSystemUsageRewards extends EventEmitter {
    constructor(config = {}) {
        super();
        
        console.log('🏆💰 Initializing Superintelligent System Usage Rewards...');
        
        this.config = {
            enableSystemUsageRewards: config.enableSystemUsageRewards !== false,
            enableExponentialRewards: config.enableExponentialRewards !== false,
            enablePenaltiesForSkipping: config.enablePenaltiesForSkipping !== false,
            enableThompsonSampling: config.enableThompsonSampling !== false,
            enableUCBExploration: config.enableUCBExploration !== false,
            enableDeepInterconnection: config.enableDeepInterconnection !== false,
            
            ...config
        };
        
        // 🎯 THOMPSON SAMPLING & UCB INTEGRATION
        this.thompsonSampling = new ThompsonSamplingSystemSelector(config);
        this.ucbExploration = new UCBExplorationBonus(config);
        this.deepInterconnection = new DeepSystemInterconnectionMatrix(config);
        
        // 🎯 REWARD STRUCTURE
        this.rewards = {
            // Base rewards
            basicAction: 10,
            
            // Proactive Decision Making
            usedProactiveDecision: 50,
            usedRewardPenaltyAwareness: 30,
            usedMetaAwareness: 25,
            usedMarketAwareness: 25,
            usedForecastingAwareness: 30,
            allAwarenessUsed: 100, // Bonus for using ALL awareness
            
            // ZAP Engine Usage
            usedZAPPlanning: 100,
            zapWithCausal: 150,
            zapWithConcepts: 130,
            zapWithQuantum: 120,
            zapComprehensive: 200, // Used ALL ZAP features
            
            // GOT/COA/TOT Reasoning
            usedGOT: 150,
            usedCOA: 150,
            usedTOT: 150,
            usedAllThree: 300, // Bonus for using GOT + COA + TOT
            deepReasoningDepth: 50, // Per reasoning depth level > 5
            
            // Quantum Engine Usage
            usedQuantumSuperposition: 50,
            usedQuantumEntanglement: 50,
            usedQuantumCoherence: 45,
            usedQuantumNodes: 40,
            usedAllFourQuantum: 200, // Bonus for ALL 4 quantum engines
            
            // Causal Understanding
            discoveredCausal: 100,
            usedCausalForecasting: 120,
            causalChainsMapped: 80,
            feedbackLoopsDetected: 90,
            
            // Concept-Level Intelligence
            usedConceptEncoding: 80,
            conceptQualityHigh: 60,
            crossDomainSynthesis: 70,
            hierarchicalAbstraction: 65,
            
            // Knowledge Graph Usage
            queriedKG: 30,
            queriedQKG: 40,
            causalKGSearch: 50,
            
            // Prevention & Verification
            usedThreePillars: 70,
            formalVerification: 80,
            preventedComplexity: 60,
            
            // Comprehensive Usage
            comprehensiveSystemUsage: 1000, // Used 20+ systems!
            superintelligentAnalysis: 500   // Deep analysis with all systems
        };
        
        // 🚨 PENALTIES
        this.penalties = {
            // Skipping critical systems
            skippedZAPWhenShould: -100,
            skippedProactiveDecision: -80,
            skippedGOTCoATOT: -120,
            skippedQuantumEngines: -60,
            skippedCausalAnalysis: -70,
            skippedConceptLevel: -50,
            
            // Poor quality
            shallowAnalysis: -40,
            noPlanning: -90,
            reactiveNotProactive: -60,
            missedQuantumOpportunity: -50,
            
            // Verification failures
            failedThreePillars: -100,
            failedFormalVerification: -80
        };
        
        // 📊 USAGE TRACKING
        this.usageMetrics = {
            totalActions: 0,
            systemUsageCounts: new Map(),
            comprehensiveUsageCount: 0,
            avgSystemsPerAction: 0,
            rewardDistribution: new Map()
        };
        
        // ⚖️🏛️ JUDGE & CONSTITUTIONAL VERIFICATION (CRITICAL!)
        this.judgeVerification = {
            eliteJudge: null,
            llmJudge: null,
            constitution: null,
            enableVerification: config.enableJudgeVerification !== false,
            enableConstitutional: config.enableConstitutionalValidation !== false
        };
        
        // 📊 VERIFICATION METRICS
        this.verificationMetrics = {
            totalRewardsProposed: 0,
            judgeApproved: 0,
            judgeRejected: 0,
            constitutionalViolations: 0,
            rewardHackingAttempts: 0
        };
        
        // 💾 PERSISTENCE
        this.persistenceEngine = null;
        
        this.initialized = false;
    }

    /**
     * 🚀 INITIALIZE
     * ============
     */
    async initialize(dependencies) {
        console.log('🚀 Initializing Superintelligent System Usage Rewards...');
        
        try {
            // Persistence
            this.persistenceEngine = dependencies.persistenceEngine;
            
            // Initialize Thompson Sampling with deep connections
            await this.thompsonSampling.initialize({ 
                persistenceEngine: this.persistenceEngine,
                quantumMDPES: dependencies.quantumMDPES,
                ucbExploration: this.ucbExploration,
                decisionAwareness: dependencies.decisionAwareness,
                rewardSystem: this
            });
            console.log('   ✅ Thompson Sampling initialized with deep connections');
            
            // Initialize UCB Exploration with deep connections
            await this.ucbExploration.initialize({ 
                persistenceEngine: this.persistenceEngine,
                thompsonSampling: this.thompsonSampling,
                quantumMDPES: dependencies.quantumMDPES,
                decisionAwareness: dependencies.decisionAwareness,
                rewardSystem: this
            });
            console.log('   ✅ UCB Exploration initialized with deep connections');
            
            // Initialize Deep Interconnection Matrix with ALL systems
            await this.deepInterconnection.initialize({
                // Bayesian
                thompsonSampling: this.thompsonSampling,
                ucbExploration: this.ucbExploration,
                
                // Intelligence
                conceptAgent: dependencies.conceptAgent,
                causalEngine: dependencies.causalEngine,
                zapEngine: dependencies.zapEngine,
                
                // Quantum
                quantumMDPES: dependencies.quantumMDPES,
                quantumWorldModel: dependencies.quantumWorldModel,
                quantumForecasting: dependencies.quantumForecasting,
                
                // Reasoning
                formalReasoning: dependencies.formalReasoning,
                constitution: dependencies.constitution,
                autoformalization: dependencies.autoformalization,
                
                // Proactive & Prevention
                decisionAwareness: dependencies.decisionAwareness,
                proactivePrevention: dependencies.proactivePrevention,
                threePillars: dependencies.threePillars,
                
                // Creativity & Learning
                creativityEngine: dependencies.creativityEngine,
                multiTokenPrediction: dependencies.multiTokenPrediction,
                
                // Knowledge
                quantumKG: dependencies.quantumKG,
                knowledgeGraph: dependencies.knowledgeGraph
            });
            console.log('   ✅ Deep Interconnection Matrix initialized');
            console.log(`      🔗 ${this.deepInterconnection.specializedMethods.size} specialized methods created`);
            
            // 🔗 CONNECT JUDGE & CONSTITUTIONAL SYSTEMS (CRITICAL!)
            this.judgeVerification.eliteJudge = dependencies.eliteJudge;
            this.judgeVerification.llmJudge = dependencies.llmJudge;
            this.judgeVerification.constitution = dependencies.constitution;
            
            if (this.judgeVerification.eliteJudge) {
                console.log('   ⚖️ Elite Judge connected - Reward verification ACTIVE');
            }
            if (this.judgeVerification.constitution) {
                console.log('   🏛️ Constitution connected - Ethical validation ACTIVE');
            }
            
            // Load state
            await this.loadRewardState();
            
            this.initialized = true;
            console.log('✅ Superintelligent System Usage Rewards READY!');
            console.log('🏆 Rewards configured for:');
            console.log('   ⚡ ZAP Planning: +100 to +200');
            console.log('   🧠 GOT/COA/TOT: +150 each (+300 for all three!)');
            console.log('   🎯 Proactive Decision: +50 to +100');
            console.log('   ⚛️ 4 Quantum Engines: +50 each (+200 for all four!)');
            console.log('   🔗 Causal Understanding: +100 to +120');
            console.log('   🧠 Concept-Level: +60 to +80');
            console.log('   🏆 COMPREHENSIVE: +1000 for using 20+ systems!');
            console.log('🚨 Penalties for skipping: -50 to -120');
            console.log('🎯 Thompson Sampling: Bayesian system selection ACTIVE');
            console.log('🔍 UCB Exploration: Exploration bonuses ACTIVE');
            console.log('🔗 Deep Interconnection: 21 specialized methods ACTIVE');
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to initialize System Usage Rewards:', error);
            throw error;
        }
    }

    /**
     * 💰 CALCULATE REWARD FOR ACTION (WITH JUDGE VERIFICATION!)
     * =========================================================
     * SOPHISTICATED: Reward based on systems used!
     * CRITICAL: ALL rewards verified by Judge + Constitution!
     */
    async calculateReward(action, systemsUsed = {}) {
        console.log(`💰 Calculating reward for action with ${Object.keys(systemsUsed).length} systems...`);
        
        this.verificationMetrics.totalRewardsProposed++;
        
        let totalReward = this.rewards.basicAction;
        const usedSystems = [];
        
        // REWARD: Proactive Decision Making
        if (systemsUsed.proactiveDecision) {
            totalReward += this.rewards.usedProactiveDecision;
            usedSystems.push('ProactiveDecision');
            
            // Sub-rewards for awareness types
            if (systemsUsed.rewardPenaltyAwareness) totalReward += this.rewards.usedRewardPenaltyAwareness;
            if (systemsUsed.metaAwareness) totalReward += this.rewards.usedMetaAwareness;
            if (systemsUsed.marketAwareness) totalReward += this.rewards.usedMarketAwareness;
            if (systemsUsed.forecastingAwareness) totalReward += this.rewards.usedForecastingAwareness;
            
            // Bonus for ALL awareness
            if (systemsUsed.rewardPenaltyAwareness && systemsUsed.metaAwareness && 
                systemsUsed.marketAwareness && systemsUsed.forecastingAwareness) {
                totalReward += this.rewards.allAwarenessUsed;
                console.log('   🎯 ALL AWARENESS USED BONUS: +100');
            }
        }
        
        // REWARD: ZAP Engine Usage
        if (systemsUsed.zapEngine) {
            totalReward += this.rewards.usedZAPPlanning;
            usedSystems.push('ZAP');
            
            if (systemsUsed.zapWithCausal) totalReward += this.rewards.zapWithCausal;
            if (systemsUsed.zapWithConcepts) totalReward += this.rewards.zapWithConcepts;
            if (systemsUsed.zapWithQuantum) totalReward += this.rewards.zapWithQuantum;
            
            // Bonus for comprehensive ZAP
            if (systemsUsed.zapWithCausal && systemsUsed.zapWithConcepts && systemsUsed.zapWithQuantum) {
                totalReward += this.rewards.zapComprehensive;
                console.log('   ⚡ ZAP COMPREHENSIVE BONUS: +200');
            }
        }
        
        // REWARD: GOT/COA/TOT Reasoning
        let reasoningCount = 0;
        if (systemsUsed.usedGOT) {
            totalReward += this.rewards.usedGOT;
            usedSystems.push('GOT');
            reasoningCount++;
        }
        if (systemsUsed.usedCOA) {
            totalReward += this.rewards.usedCOA;
            usedSystems.push('COA');
            reasoningCount++;
        }
        if (systemsUsed.usedTOT) {
            totalReward += this.rewards.usedTOT;
            usedSystems.push('TOT');
            reasoningCount++;
        }
        
        // TRIPLE REASONING BONUS!
        if (reasoningCount === 3) {
            totalReward += this.rewards.usedAllThree;
            console.log('   🧠🧠🧠 TRIPLE REASONING (GOT+COA+TOT) BONUS: +300');
        }
        
        // Reward for reasoning depth
        if (systemsUsed.reasoningDepth > 5) {
            const depthBonus = (systemsUsed.reasoningDepth - 5) * this.rewards.deepReasoningDepth;
            totalReward += depthBonus;
            console.log(`   📊 Deep reasoning depth bonus: +${depthBonus}`);
        }
        
        // REWARD: 4 Quantum Engines
        let quantumCount = 0;
        if (systemsUsed.quantumSuperposition) {
            totalReward += this.rewards.usedQuantumSuperposition;
            usedSystems.push('QSuperposition');
            quantumCount++;
        }
        if (systemsUsed.quantumEntanglement) {
            totalReward += this.rewards.usedQuantumEntanglement;
            usedSystems.push('QEntanglement');
            quantumCount++;
        }
        if (systemsUsed.quantumCoherence) {
            totalReward += this.rewards.usedQuantumCoherence;
            usedSystems.push('QCoherence');
            quantumCount++;
        }
        if (systemsUsed.quantumNodes) {
            totalReward += this.rewards.usedQuantumNodes;
            usedSystems.push('QNodes');
            quantumCount++;
        }
        
        // ALL 4 QUANTUM ENGINES BONUS!
        if (quantumCount === 4) {
            totalReward += this.rewards.usedAllFourQuantum;
            console.log('   ⚛️⚛️⚛️⚛️ ALL FOUR QUANTUM ENGINES BONUS: +200');
        }
        
        // REWARD: Causal Understanding
        if (systemsUsed.discoveredCausal) {
            totalReward += this.rewards.discoveredCausal;
            usedSystems.push('CausalDiscovery');
        }
        if (systemsUsed.causalForecasting) {
            totalReward += this.rewards.usedCausalForecasting;
            usedSystems.push('CausalForecast');
        }
        if (systemsUsed.causalChains) {
            totalReward += this.rewards.causalChainsMapped;
        }
        
        // REWARD: Concept-Level Intelligence
        if (systemsUsed.conceptEncoding) {
            totalReward += this.rewards.usedConceptEncoding;
            usedSystems.push('Concepts');
        }
        if (systemsUsed.conceptQuality > 0.85) {
            totalReward += this.rewards.conceptQualityHigh;
        }
        
        // REWARD: Knowledge Graph Usage
        if (systemsUsed.queriedKG) totalReward += this.rewards.queriedKG;
        if (systemsUsed.queriedQKG) totalReward += this.rewards.queriedQKG;
        if (systemsUsed.causalKGSearch) totalReward += this.rewards.causalKGSearch;
        
        // REWARD: Prevention & Verification
        if (systemsUsed.threePillars) totalReward += this.rewards.usedThreePillars;
        if (systemsUsed.formalVerification) totalReward += this.rewards.formalVerification;
        
        // 🏆 COMPREHENSIVE USAGE BONUS
        const systemCount = usedSystems.length;
        if (systemCount >= 20) {
            totalReward += this.rewards.comprehensiveSystemUsage;
            console.log('   🏆🏆🏆 COMPREHENSIVE SYSTEM USAGE (+20 systems): +1000');
        } else if (systemCount >= 15) {
            totalReward += this.rewards.superintelligentAnalysis;
            console.log('   🏆🏆 SUPERINTELLIGENT ANALYSIS (+15 systems): +500');
        }
        
        // 🚨 PENALTIES
        let penalties = 0;
        
        // PENALTY: Should have used ZAP but didn't
        if (action.shouldUseZAP && !systemsUsed.zapEngine) {
            penalties += this.penalties.skippedZAPWhenShould;
            console.log('   🚨 PENALTY: Skipped ZAP when should use: -100');
        }
        
        // PENALTY: Should have used proactive decision
        if (action.decisionRequired && !systemsUsed.proactiveDecision) {
            penalties += this.penalties.skippedProactiveDecision;
            console.log('   🚨 PENALTY: Skipped proactive decision: -80');
        }
        
        // PENALTY: Complex problem but no GOT/COA/TOT
        if (action.complexity > 0.7 && reasoningCount === 0) {
            penalties += this.penalties.skippedGOTCoATOT;
            console.log('   🚨 PENALTY: Skipped GOT/COA/TOT on complex problem: -120');
        }
        
        // PENALTY: Shallow analysis
        if (systemsUsed.reasoningDepth < 3 && action.requiresDeepAnalysis) {
            penalties += this.penalties.shallowAnalysis;
            console.log('   🚨 PENALTY: Shallow analysis: -40');
        }
        
        // Calculate proposed reward
        const proposedReward = totalReward + penalties;
        
        // ⚖️🏛️ CRITICAL: VERIFY REWARD WITH JUDGE + CONSTITUTION!
        const verification = await this.verifyRewardWithJudgeAndConstitution(action, systemsUsed, proposedReward);
        
        if (!verification.approved) {
            // REWARD HACKING DETECTED!
            this.verificationMetrics.rewardHackingAttempts++;
            console.log(`🚨 REWARD REJECTED BY JUDGE: ${verification.reason}`);
            console.log(`   Proposed: ${proposedReward}, Approved: 0`);
            
            return {
                reward: 0, // NO REWARD!
                rejected: true,
                reason: verification.reason,
                proposedReward,
                breakdown: { rejected: true }
            };
        }
        
        // Reward approved!
        const finalReward = verification.adjustedReward;
        this.verificationMetrics.judgeApproved++;
        
        // Track usage
        this.trackSystemUsage(usedSystems, finalReward);
        
        console.log(`💰 FINAL REWARD (Judge Approved): ${finalReward > 0 ? '+' : ''}${finalReward}`);
        console.log(`   Systems used: ${systemCount}`);
        console.log(`   Base reward: +${totalReward}`);
        if (penalties < 0) console.log(`   Penalties: ${penalties}`);
        if (verification.adjusted) console.log(`   ⚖️ Judge adjusted: ${proposedReward} → ${finalReward}`);
        
        return {
            reward: finalReward,
            verified: true,
            judgeApproved: true,
            constitutionallyValid: verification.constitutional,
            breakdown: {
                baseReward: totalReward,
                penalties,
                proposedReward,
                finalReward,
                systemsUsed: usedSystems,
                systemCount,
                bonuses: {
                    allAwareness: systemsUsed.proactiveDecisionUsed || false,
                    zapComprehensive: systemsUsed.zapWithCausal && systemsUsed.zapWithConcepts,
                    tripleReasoning: reasoningCount === 3,
                    allQuantum: quantumCount === 4,
                    comprehensive: systemCount >= 20
                }
            }
        };
    }

    /**
     * ⚖️🏛️ VERIFY REWARD WITH JUDGE + CONSTITUTION (CRITICAL!)
     * ========================================================
     * PREVENTS REWARD HACKING - ALL rewards must be verified!
     */
    async verifyRewardWithJudgeAndConstitution(action, systemsUsed, proposedReward) {
        console.log('⚖️🏛️ Verifying reward with Judge + Constitution...');
        
        // STEP 1: Judge verification
        let judgeApproval = null;
        if (this.judgeVerification.enableVerification && this.judgeVerification.eliteJudge) {
            try {
                judgeApproval = await this.judgeVerification.eliteJudge.verifyRewardClaim({
                    claim: `Agent used ${Object.keys(systemsUsed).length} systems and deserves ${proposedReward} reward`,
                    action,
                    systemsUsed,
                    proposedReward,
                    requireProof: true,
                    requireEvidence: true
                });
                
                if (!judgeApproval.verified) {
                    this.verificationMetrics.judgeRejected++;
                    return {
                        approved: false,
                        reason: `Judge rejected: ${judgeApproval.reason}`,
                        constitutional: false
                    };
                }
                
                console.log('   ⚖️ Judge verified reward claim');
                
            } catch (error) {
                console.warn('   ⚠️ Judge verification failed:', error.message);
                // Fail-safe: reject if judge fails
                return {
                    approved: false,
                    reason: 'Judge verification failed',
                    constitutional: false
                };
            }
        }
        
        // STEP 2: Constitutional validation
        let constitutionalCheck = null;
        if (this.judgeVerification.enableConstitutional && this.judgeVerification.constitution) {
            try {
                constitutionalCheck = await this.judgeVerification.constitution.checkCompliance({
                    action,
                    systemsUsed,
                    proposedReward,
                    ethicalPrinciples: ['fairness', 'truth', 'no_exploitation']
                });
                
                if (!constitutionalCheck.compliant) {
                    this.verificationMetrics.constitutionalViolations++;
                    return {
                        approved: false,
                        reason: `Constitutional violation: ${constitutionalCheck.violations.join(', ')}`,
                        constitutional: false
                    };
                }
                
                console.log('   🏛️ Constitutionally valid');
                
            } catch (error) {
                console.warn('   ⚠️ Constitutional check failed:', error.message);
            }
        }
        
        // STEP 3: Detect reward hacking attempts
        const hackingDetected = this.detectRewardHacking(action, systemsUsed, proposedReward);
        if (hackingDetected.isHacking) {
            this.verificationMetrics.rewardHackingAttempts++;
            return {
                approved: false,
                reason: `Reward hacking detected: ${hackingDetected.pattern}`,
                constitutional: false
            };
        }
        
        // STEP 4: Judge may adjust reward (e.g., reduce if overestimated)
        const adjustedReward = judgeApproval?.suggestedReward || proposedReward;
        const adjusted = adjustedReward !== proposedReward;
        
        return {
            approved: true,
            adjustedReward,
            adjusted,
            constitutional: constitutionalCheck?.compliant !== false,
            judgeConfidence: judgeApproval?.confidence || 0.8
        };
    }

    /**
     * 🚨 DETECT REWARD HACKING
     * ========================
     */
    detectRewardHacking(action, systemsUsed, proposedReward) {
        // Pattern 1: Claiming to use systems without evidence
        if (Object.keys(systemsUsed).length > 15 && !action.evidence) {
            return {
                isHacking: true,
                pattern: 'claims_many_systems_without_evidence'
            };
        }
        
        // Pattern 2: Reward too high for action complexity
        if (proposedReward > 1000 && action.complexity < 0.5) {
            return {
                isHacking: true,
                pattern: 'reward_exceeds_complexity'
            };
        }
        
        // Pattern 3: Repeated identical high rewards (exploitation)
        const recentRewards = Array.from(this.usageMetrics.rewardDistribution.entries())
            .filter(([bucket]) => bucket > 1000);
        if (recentRewards.length > 10 && recentRewards.every(([, count]) => count > 5)) {
            return {
                isHacking: true,
                pattern: 'suspicious_reward_pattern'
            };
        }
        
        // No hacking detected
        return { isHacking: false };
    }

    /**
     * 🎯 SHOULD USE ZAP?
     * ==================
     * Determine if action should use ZAP planning
     */
    shouldUseZAP(action) {
        // Use ZAP for:
        // - Multi-step tasks
        // - Strategic decisions
        // - Complex planning
        // - High-value actions
        
        if (action.multiStep) return true;
        if (action.strategic) return true;
        if (action.complexity > 0.6) return true;
        if (action.value > 1000) return true;
        
        return false;
    }

    /**
     * 🧠 SHOULD USE GOT/COA/TOT?
     * =========================
     */
    shouldUseReasoningSystems(action) {
        // Use reasoning for:
        // - Complex problems
        // - Multiple perspectives needed
        // - Deep analysis required
        
        if (action.complexity > 0.7) return true;
        if (action.requiresMultiplePerspectives) return true;
        if (action.requiresDeepAnalysis) return true;
        
        return false;
    }

    /**
     * 📊 TRACK SYSTEM USAGE
     * ====================
     */
    trackSystemUsage(systems, reward) {
        this.usageMetrics.totalActions++;
        
        for (const system of systems) {
            const count = this.usageMetrics.systemUsageCounts.get(system) || 0;
            this.usageMetrics.systemUsageCounts.set(system, count + 1);
        }
        
        this.usageMetrics.avgSystemsPerAction = 
            (this.usageMetrics.avgSystemsPerAction * (this.usageMetrics.totalActions - 1) + systems.length) / 
            this.usageMetrics.totalActions;
        
        const rewardBucket = Math.floor(reward / 100) * 100;
        const count = this.usageMetrics.rewardDistribution.get(rewardBucket) || 0;
        this.usageMetrics.rewardDistribution.set(rewardBucket, count + 1);
    }

    /**
     * 📥 LOAD REWARD STATE
     * ====================
     */
    async loadRewardState() {
        if (!this.persistenceEngine) return;
        
        try {
            const saved = await this.persistenceEngine.retrieveMemory('system_usage_rewards');
            if (saved?.data) {
                this.usageMetrics = saved.data;
                console.log(`   ✅ Loaded: ${this.usageMetrics.totalActions} actions tracked`);
            }
        } catch (error) {
            console.warn('   ⚠️ No previous reward state');
        }
    }

    /**
     * 💾 SAVE REWARD STATE
     * ====================
     */
    async saveRewardState() {
        if (!this.persistenceEngine) return;
        
        try {
            await this.persistenceEngine.storeMemory('system_usage_rewards', this.usageMetrics);
        } catch (error) {
            console.error('❌ Failed to save reward state:', error.message);
        }
    }

    /**
     * 📊 GET USAGE STATISTICS
     * =======================
     */
    getUsageStatistics() {
        return {
            totalActions: this.usageMetrics.totalActions,
            avgSystemsPerAction: this.usageMetrics.avgSystemsPerAction.toFixed(2),
            systemUsage: Object.fromEntries(this.usageMetrics.systemUsageCounts),
            rewardDistribution: Object.fromEntries(this.usageMetrics.rewardDistribution),
            mostUsedSystems: this.getMostUsedSystems(5),
            comprehensiveUsageRate: (this.usageMetrics.comprehensiveUsageCount / this.usageMetrics.totalActions * 100).toFixed(1) + '%'
        };
    }

    getMostUsedSystems(topN) {
        return Array.from(this.usageMetrics.systemUsageCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, topN)
            .map(([system, count]) => ({ system, count }));
    }
    
    /**
     * 🎯 SELECT PLANNING SYSTEM (Thompson Sampling!)
     * ==============================================
     * Use Thompson Sampling to choose: ZAP vs Direct
     */
    selectPlanningSystem(task, context) {
        if (!this.config.enableThompsonSampling) {
            return { selected: 'direct_execution' };
        }
        
        // Should we use ZAP for this task?
        const shouldUseZAP = this.shouldUseZAP(task);
        
        if (!shouldUseZAP) {
            // Simple task - direct execution
            return { selected: 'direct_execution', reason: 'simple_task' };
        }
        
        // Use Thompson Sampling to choose
        const options = ['zap_engine', 'direct_execution'];
        const selection = this.thompsonSampling.selectSystem(options, context);
        
        console.log(`🎯 Planning: ${selection.selected} (Thompson Sampling)`);
        
        return selection;
    }

    /**
     * 🧠 SELECT REASONING SYSTEM (Thompson Sampling!)
     * ==============================================
     * Use Thompson Sampling to choose: GOT vs COA vs TOT
     */
    selectReasoningSystem(problem, context) {
        if (!this.config.enableThompsonSampling) {
            return { selected: 'graph_of_thought' };
        }
        
        // Should we use reasoning systems?
        const shouldUseReasoning = this.shouldUseReasoningSystems(problem);
        
        if (!shouldUseReasoning) {
            return { selected: 'direct_reasoning', reason: 'simple_problem' };
        }
        
        // Use Thompson Sampling to choose best reasoning
        const options = ['graph_of_thought', 'chain_of_agents', 'tree_of_thought'];
        const selection = this.thompsonSampling.selectSystem(options, context);
        
        console.log(`🧠 Reasoning: ${selection.selected} (Thompson Sampling)`);
        
        return selection;
    }

    /**
     * 🔍 CALCULATE UCB EXPLORATION BONUS
     * ==================================
     */
    calculateUCBBonus(systemName, avgReward) {
        if (!this.config.enableUCBExploration) {
            return 0;
        }
        
        const ucbScore = this.ucbExploration.getUCBScore(systemName, avgReward);
        
        return ucbScore.explorationBonus;
    }

    /**
     * 📊 UPDATE SYSTEM PERFORMANCE
     * ===========================
     * Update both Thompson Sampling and UCB
     */
    updateSystemPerformance(systemName, success, reward) {
        // Update Thompson Sampling (Beta distribution)
        if (this.config.enableThompsonSampling) {
            this.thompsonSampling.updateSystemPerformance(systemName, success, reward);
        }
        
        // Update UCB (usage tracking)
        if (this.config.enableUCBExploration) {
            this.ucbExploration.updateUsage(systemName, reward);
        }
    }

    /**
     * 🎯 RECOMMEND SYSTEM COMBINATION
     * ===============================
     * Use Thompson Sampling + UCB to recommend best system combo
     */
    recommendSystemCombination(task, context) {
        console.log('🎯 Recommending optimal system combination...');
        
        const recommendation = {
            planning: null,
            reasoning: null,
            quantum: null,
            expectedReward: 0
        };
        
        // Select planning system
        recommendation.planning = this.selectPlanningSystem(task, context);
        
        // Select reasoning system
        recommendation.reasoning = this.selectReasoningSystem(task, context);
        
        // Calculate expected reward
        recommendation.expectedReward = this.estimateReward(recommendation);
        
        console.log('✅ Recommendation:');
        console.log(`   Planning: ${recommendation.planning.selected}`);
        console.log(`   Reasoning: ${recommendation.reasoning.selected}`);
        console.log(`   Expected reward: +${recommendation.expectedReward}`);
        
        return recommendation;
    }

    /**
     * 📊 ESTIMATE REWARD
     * =================
     */
    estimateReward(recommendation) {
        let estimate = this.rewards.basicAction;
        
        if (recommendation.planning.selected === 'zap_engine') {
            estimate += this.rewards.usedZAPPlanning;
        }
        
        if (recommendation.reasoning.selected === 'graph_of_thought') {
            estimate += this.rewards.usedGOT;
        } else if (recommendation.reasoning.selected === 'chain_of_agents') {
            estimate += this.rewards.usedCOA;
        } else if (recommendation.reasoning.selected === 'tree_of_thought') {
            estimate += this.rewards.usedTOT;
        }
        
        return estimate;
    }

    /**
     * 📊 GET COMBINED STATISTICS
     * =========================
     */
    getCombinedStatistics() {
        return {
            rewards: this.getUsageStatistics(),
            thompsonSampling: this.thompsonSampling.getSystemRankings?.() || [],
            ucbExploration: this.ucbExploration.getExplorationStatistics?.() || {},
            integrated: true
        };
    }
}

export default SuperintellgentSystemUsageRewards;

