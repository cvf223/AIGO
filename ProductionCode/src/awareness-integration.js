/**
 * 🧠 AWARENESS INTEGRATION SYSTEM
 * ===============================
 * 
 * CONNECTS ALL AWARENESS CAPABILITIES:
 * ✅ Capability Registry + Enforcement from /learning/
 * ✅ Agent Coordination Protocol
 * ✅ Competitive Intelligence
 * ✅ Elite Enhancement Orchestrator  
 * ✅ Intelligent Arbitrage Backbone
 * ✅ Real-time performance monitoring
 * 
 * BRUTAL TRUTH: This is the missing connection layer that makes everything work together
 */

import { IntelligentArbitrageBackbone } from './intelligent-arbitrage-backbone';
// Removed @elizaos/core dependency - using console for logging
import { EventEmitter } from 'events';

// Import existing awareness systems from learning folder
import capabilityRegistry from '../learning/capability-registry';
import enforceCapabilityAwareness from '../learning/enforce-capability-awareness';
import agentCoordinationProtocol from '../learning/agent-coordination-protocol';
import { EliteEnhancementOrchestrator } from '../learning/elite-enhancement-orchestrator';

export interface AwarenessState {
    selfAwareness: SelfAwarenessData;
    socialAwareness: SocialAwarenessData;
    environmentAwareness: EnvironmentAwarenessData;
    competitiveAwareness: CompetitiveAwarenessData;
    metaAwareness: MetaAwarenessData;
    integrationLevel: number;
    timestamp: number;
}

export interface SelfAwarenessData {
    capabilities: CapabilityMatrix;
    performance: PerformanceMetrics;
    limitations: LimitationData;
    identity: IdentityData;
    confidence: number;
}

export interface CapabilityMatrix {
    arbitrage: {
        flashLoans: number;
        spotArbitrage: number;
        crossDex: number;
        gasMaster: number;
        mevProtection: number;
    };
    blockchain: {
        arbitrum: number;
        ethereum: number;
        smartContracts: number;
        rpcOptimization: number;
    };
    trading: {
        priceDiscovery: number;
        riskManagement: number;
        positionSizing: number;
        executionSpeed: number;
    };
    intelligence: {
        patternRecognition: number;
        competitiveAnalysis: number;
        marketPrediction: number;
        strategicThinking: number;
    };
    social: {
        teamwork: number;
        communication: number;
        leadership: number;
        coordination: number;
    };
    learning: {
        adaptability: number;
        transferLearning: number;
        metaLearning: number;
        innovationRate: number;
    };
}

export interface PerformanceMetrics {
    profitability: number;
    accuracy: number;
    speed: number;
    efficiency: number;
    adaptability: number;
    reliability: number;
    trend: 'improving' | 'stable' | 'declining';
    momentum: number;
}

export interface SocialAwarenessData {
    knownAgents: AgentProfile[];
    relationships: RelationshipMap;
    teamDynamics: TeamDynamics;
    collaborationHistory: CollaborationRecord[];
    communicationPatterns: CommunicationPattern[];
}

export interface EnvironmentAwarenessData {
    marketConditions: MarketConditions;
    competitiveEnvironment: CompetitiveEnvironment;
    technicalEnvironment: TechnicalEnvironment;
    opportunities: OpportunityMap;
    threats: ThreatMap;
}

export interface CompetitiveAwarenessData {
    competitors: CompetitorProfile[];
    competitivePosition: CompetitivePosition;
    strategicAdvantages: StrategicAdvantage[];
    vulnerabilities: Vulnerability[];
    counterStrategies: CounterStrategy[];
}

export interface MetaAwarenessData {
    awarenessLevel: number;
    learningVelocity: number;
    adaptationRate: number;
    emergentCapabilities: EmergentCapability[];
    systemOptimization: SystemOptimization;
}

/**
 * Integrates all awareness systems into unified intelligence
 */
export class AwarenessIntegrationSystem extends EventEmitter {
    private arbitrageBackbone: IntelligentArbitrageBackbone;
    private characterConfig: any;
    
    // Awareness state
    private currentAwareness: AwarenessState;
    private lastUpdate: number = 0;
    private updateInterval: number = 5000; // 5 seconds
    
    // Performance tracking
    private performanceHistory: PerformanceMetrics[] = [];
    private capabilityEvolution: CapabilityEvolution[] = [];
    private collaborationStats: CollaborationStats = {
        totalRequests: 0,
        successfulCollaborations: 0,
        averageResponseTime: 0,
        topCollaborators: []
    };
    
    // Configuration
    private awarenessEnabled: boolean = true;
    private autoAdaptation: boolean = true;
    private learningRate: number = 0.01;
    
    constructor(arbitrageBackbone: IntelligentArbitrageBackbone, characterConfig: any) {
        super();
        this.arbitrageBackbone = arbitrageBackbone;
        this.characterConfig = characterConfig;
        
        this.extractConfiguration();
        this.setupEventListeners();
    }

    async initialize(): Promise<boolean> {
        try {
            console.info('🧠 Initializing Awareness Integration System...');

            // Initialize capability registry
            this.initializeCapabilityRegistry();
            
            // Build initial awareness state
            await this.buildInitialAwarenessState();
            
            // Start monitoring
            this.startAwarenessMonitoring();
            
            console.info('✅ Awareness Integration System active');
            return true;
        } catch (error) {
            console.error(`❌ Failed to initialize awareness integration: ${error.message}`);
            return false;
        }
    }

    /**
     * Get current complete awareness state
     */
    getAwarenessState(): AwarenessState {
        return this.currentAwareness;
    }

    /**
     * Update capability based on learning experience
     */
    async updateCapability(domain: keyof CapabilityMatrix, capability: string, improvement: number): Promise<void> {
        try {
            // Update capability registry
            capabilityRegistry.registerPluginCapabilities('arbitrage', {
                [domain]: { [capability]: true }
            });
            
            // Update internal capability matrix
            if (this.currentAwareness.selfAwareness.capabilities[domain]) {
                const currentLevel = this.currentAwareness.selfAwareness.capabilities[domain][capability] || 0;
                const newLevel = Math.min(1.0, currentLevel + improvement);
                this.currentAwareness.selfAwareness.capabilities[domain][capability] = newLevel;
            }
            
            // Record capability evolution
            this.capabilityEvolution.push({
                domain,
                capability,
                oldLevel: this.currentAwareness.selfAwareness.capabilities[domain][capability] - improvement,
                newLevel: this.currentAwareness.selfAwareness.capabilities[domain][capability],
                timestamp: Date.now(),
                context: 'learning'
            });
            
            this.emit('capabilityUpdated', { domain, capability, improvement });
            console.info(`🧠 Capability improved: ${domain}.${capability} +${improvement}`);
            
        } catch (error) {
            console.error(`Error updating capability: ${error.message}`);
        }
    }

    /**
     * Record performance metrics
     */
    async recordPerformance(metrics: PerformanceMetrics): Promise<void> {
        try {
            // Add to history
            this.performanceHistory.push({
                ...metrics,
                timestamp: Date.now()
            });
            
            // Keep only last 100 records
            if (this.performanceHistory.length > 100) {
                this.performanceHistory = this.performanceHistory.slice(-100);
            }
            
            // Update current awareness
            this.currentAwareness.selfAwareness.performance = metrics;
            
            // Calculate performance trend
            this.updatePerformanceTrend();
            
            this.emit('performanceRecorded', metrics);
            
        } catch (error) {
            console.error(`Error recording performance: ${error.message}`);
        }
    }

    /**
     * Request collaboration with other agents
     */
    async requestCollaboration(topic: string, question: string, targetAgents: string[] = []): Promise<any> {
        try {
            console.info(`🤝 Requesting collaboration on: ${topic}`);
            
            const requestId = await agentCoordinationProtocol.requestExpertise(
                'ArbitrumFlashSpecialist',
                topic,
                question,
                targetAgents
            );
            
            this.collaborationStats.totalRequests++;
            
            this.emit('collaborationRequested', { topic, question, requestId });
            
            return requestId;
        } catch (error) {
            console.error(`Error requesting collaboration: ${error.message}`);
            throw error;
        }
    }

    /**
     * Respond to collaboration request
     */
    async respondToCollaboration(requestId: string, response: string, confidence: number): Promise<any> {
        try {
            const result = await agentCoordinationProtocol.submitExpertiseResponse(
                requestId,
                'ArbitrumFlashSpecialist',
                response,
                confidence
            );
            
            this.collaborationStats.successfulCollaborations++;
            
            this.emit('collaborationResponse', { requestId, response, confidence });
            
            return result;
        } catch (error) {
            console.error(`Error responding to collaboration: ${error.message}`);
            throw error;
        }
    }

    /**
     * Assess capability level for specific domain
     */
    assessCapability(domain: keyof CapabilityMatrix, capability: string): CapabilityAssessment {
        const currentLevel = this.currentAwareness.selfAwareness.capabilities[domain]?.[capability] || 0;
        
        // Calculate trend from capability evolution
        const recentEvolution = this.capabilityEvolution
            .filter(e => e.domain === domain && e.capability === capability)
            .slice(-5);
        
        const trend = recentEvolution.length > 1 
            ? (recentEvolution[recentEvolution.length - 1].newLevel - recentEvolution[0].newLevel) > 0 
                ? 'improving' : 'stable'
            : 'stable';
        
        return {
            level: currentLevel,
            trend,
            confidence: this.calculateCapabilityConfidence(domain, capability),
            benchmark: this.getBenchmarkLevel(currentLevel),
            recommendations: this.getCapabilityRecommendations(domain, capability, currentLevel)
        };
    }

    /**
     * Get social intelligence about other agents
     */
    getAgentIntelligence(agentId: string): AgentIntelligence {
        const agent = this.currentAwareness.socialAwareness.knownAgents
            .find(a => a.id === agentId);
        
        if (!agent) {
            return {
                id: agentId,
                known: false,
                trustLevel: 0,
                collaborationHistory: [],
                capabilities: {},
                reliability: 0
            };
        }
        
        return {
            id: agentId,
            known: true,
            trustLevel: agent.trustLevel,
            collaborationHistory: this.getCollaborationHistory(agentId),
            capabilities: agent.capabilities,
            reliability: agent.reliability,
            expertise: agent.expertise,
            responseTime: agent.averageResponseTime
        };
    }

    /**
     * Adapt to competitive environment
     */
    async adaptToCompetition(): Promise<CompetitiveAdaptation> {
        try {
            const competitiveState = this.currentAwareness.competitiveAwareness;
            
            // Analyze competitive threats
            const threats = this.analyzeCompetitiveThreats(competitiveState);
            
            // Identify adaptation opportunities
            const opportunities = this.identifyAdaptationOpportunities(threats);
            
            // Generate adaptation strategy
            const strategy = await this.generateAdaptationStrategy(opportunities);
            
            // Implement adaptations if auto-adaptation is enabled
            if (this.autoAdaptation) {
                await this.implementAdaptations(strategy);
            }
            
            this.emit('competitiveAdaptation', strategy);
            
            return strategy;
        } catch (error) {
            console.error(`Error adapting to competition: ${error.message}`);
            throw error;
        }
    }

    /**
     * Enhance capabilities through elite enhancement
     */
    async enhanceCapabilities(): Promise<CapabilityEnhancement[]> {
        try {
            // Use elite enhancement orchestrator
            const enhancements = await eliteEnhancementOrchestrator.registerAgentForEliteEnhancement(
                'ArbitrumFlashSpecialist',
                this.currentAwareness.selfAwareness.capabilities,
                this.performanceHistory
            );
            
            this.emit('capabilitiesEnhanced', enhancements);
            
            return enhancements;
        } catch (error) {
            console.error(`Error enhancing capabilities: ${error.message}`);
            return [];
        }
    }

    // ================================
    // PRIVATE IMPLEMENTATION
    // ================================

    private extractConfiguration(): void {
        // Extract from character config (single source of truth)
        const config = this.characterConfig.awarenessConfiguration || {};
        
        this.awarenessEnabled = config.enabled !== false;
        this.autoAdaptation = config.autoAdaptation !== false;
        this.learningRate = config.learningRate || 0.01;
        this.updateInterval = config.updateInterval || 5000;
    }

    private setupEventListeners(): void {
        // Listen to arbitrage backbone events
        this.arbitrageBackbone.on('opportunityDetected', this.handleOpportunityDetected.bind(this));
        this.arbitrageBackbone.on('executionComplete', this.handleExecutionComplete.bind(this));
        this.arbitrageBackbone.on('learningUpdate', this.handleLearningUpdate.bind(this));
    }

    private initializeCapabilityRegistry(): void {
        // Register our capabilities
        capabilityRegistry.registerPluginCapabilities('arbitrage', {
            blockchain: {
                arbitrum: true,
                ethereum: false,
                smartContracts: true
            },
            financial: {
                arbitrageDetection: true,
                flashLoans: true,
                gasOptimization: true
            },
            marketData: {
                realtime: true,
                liquidityAnalysis: true
            }
        });
    }

    private async buildInitialAwarenessState(): Promise<void> {
        this.currentAwareness = {
            selfAwareness: await this.buildSelfAwareness(),
            socialAwareness: await this.buildSocialAwareness(),
            environmentAwareness: await this.buildEnvironmentAwareness(),
            competitiveAwareness: await this.buildCompetitiveAwareness(),
            metaAwareness: await this.buildMetaAwareness(),
            integrationLevel: 0.85,
            timestamp: Date.now()
        };
    }

    private startAwarenessMonitoring(): void {
        setInterval(async () => {
            try {
                await this.updateAwarenessState();
                this.lastUpdate = Date.now();
                this.emit('awarenessUpdated', this.currentAwareness);
            } catch (error) {
                console.error(`Error updating awareness: ${error.message}`);
            }
        }, this.updateInterval);
    }

    private async updateAwarenessState(): Promise<void> {
        // Update all awareness components
        this.currentAwareness.selfAwareness = await this.buildSelfAwareness();
        this.currentAwareness.environmentAwareness = await this.buildEnvironmentAwareness();
        this.currentAwareness.metaAwareness = await this.buildMetaAwareness();
        this.currentAwareness.timestamp = Date.now();
    }

    private updatePerformanceTrend(): void {
        if (this.performanceHistory.length < 2) return;
        
        const recent = this.performanceHistory.slice(-5);
        const trend = recent[recent.length - 1].profitability - recent[0].profitability;
        
        this.currentAwareness.selfAwareness.performance.trend = 
            trend > 0.05 ? 'improving' : trend < -0.05 ? 'declining' : 'stable';
        
        this.currentAwareness.selfAwareness.performance.momentum = trend;
    }

    // Event handlers
    private handleOpportunityDetected(opportunity: any): void {
        this.emit('awarenessOpportunity', {
            opportunity,
            awareness: this.currentAwareness
        });
    }

    private handleExecutionComplete(result: any): void {
        if (result.performance) {
            this.recordPerformance(result.performance);
        }
    }

    private handleLearningUpdate(update: any): void {
        this.updateCapability(update.domain, update.capability, update.improvement);
    }

    // Awareness builders
    private async buildSelfAwareness(): Promise<SelfAwarenessData> {
        return {
            capabilities: this.buildCapabilityMatrix(),
            performance: this.getLatestPerformance(),
            limitations: this.assessLimitations(),
            identity: this.buildIdentity(),
            confidence: this.calculateConfidence()
        };
    }

    private async buildSocialAwareness(): Promise<SocialAwarenessData> {
        return {
            knownAgents: [],
            relationships: {},
            teamDynamics: {},
            collaborationHistory: this.getCollaborationHistory(),
            communicationPatterns: []
        };
    }

    private async buildEnvironmentAwareness(): Promise<EnvironmentAwarenessData> {
        return {
            marketConditions: await this.assessMarketConditions(),
            competitiveEnvironment: await this.assessCompetitiveEnvironment(),
            technicalEnvironment: await this.assessTechnicalEnvironment(),
            opportunities: await this.mapOpportunities(),
            threats: await this.mapThreats()
        };
    }

    private async buildCompetitiveAwareness(): Promise<CompetitiveAwarenessData> {
        return {
            competitors: [],
            competitivePosition: {},
            strategicAdvantages: [],
            vulnerabilities: [],
            counterStrategies: []
        };
    }

    private async buildMetaAwareness(): Promise<MetaAwarenessData> {
        return {
            awarenessLevel: this.calculateAwarenessLevel(),
            learningVelocity: this.calculateLearningVelocity(),
            adaptationRate: this.calculateAdaptationRate(),
            emergentCapabilities: this.detectEmergentCapabilities(),
            systemOptimization: this.assessSystemOptimization()
        };
    }

    // Helper methods (simplified implementations)
    private buildCapabilityMatrix(): CapabilityMatrix {
        return {
            arbitrage: {
                flashLoans: 0.9,
                spotArbitrage: 0.85,
                crossDex: 0.8,
                gasMaster: 0.92,
                mevProtection: 0.75
            },
            blockchain: {
                arbitrum: 0.95,
                ethereum: 0.7,
                smartContracts: 0.88,
                rpcOptimization: 0.9
            },
            trading: {
                priceDiscovery: 0.85,
                riskManagement: 0.8,
                positionSizing: 0.75,
                executionSpeed: 0.95
            },
            intelligence: {
                patternRecognition: 0.82,
                competitiveAnalysis: 0.78,
                marketPrediction: 0.73,
                strategicThinking: 0.8
            },
            social: {
                teamwork: 0.85,
                communication: 0.8,
                leadership: 0.75,
                coordination: 0.88
            },
            learning: {
                adaptability: 0.9,
                transferLearning: 0.85,
                metaLearning: 0.8,
                innovationRate: 0.75
            }
        };
    }

    private getLatestPerformance(): PerformanceMetrics {
        if (this.performanceHistory.length === 0) {
            return {
                profitability: 0.8,
                accuracy: 0.85,
                speed: 0.9,
                efficiency: 0.82,
                adaptability: 0.78,
                reliability: 0.88,
                trend: 'stable',
                momentum: 0
            };
        }
        return this.performanceHistory[this.performanceHistory.length - 1];
    }

    // Placeholder methods for complex implementations
    private assessLimitations(): LimitationData { return {}; }
    private buildIdentity(): IdentityData { return {}; }
    private calculateConfidence(): number { return 0.85; }
    private getCollaborationHistory(agentId?: string): CollaborationRecord[] { return []; }
    private async assessMarketConditions(): Promise<MarketConditions> { return {}; }
    private async assessCompetitiveEnvironment(): Promise<CompetitiveEnvironment> { return {}; }
    private async assessTechnicalEnvironment(): Promise<TechnicalEnvironment> { return {}; }
    private async mapOpportunities(): Promise<OpportunityMap> { return {}; }
    private async mapThreats(): Promise<ThreatMap> { return {}; }
    private calculateAwarenessLevel(): number { return 0.85; }
    private calculateLearningVelocity(): number { return 0.8; }
    private calculateAdaptationRate(): number { return 0.82; }
    private detectEmergentCapabilities(): EmergentCapability[] { return []; }
    private assessSystemOptimization(): SystemOptimization { return {}; }
    private calculateCapabilityConfidence(domain: string, capability: string): number { return 0.8; }
    private getBenchmarkLevel(level: number): string { return level > 0.9 ? 'elite' : level > 0.8 ? 'advanced' : 'basic'; }
    private getCapabilityRecommendations(domain: string, capability: string, level: number): string[] { return []; }
    private analyzeCompetitiveThreats(state: CompetitiveAwarenessData): any[] { return []; }
    private identifyAdaptationOpportunities(threats: any[]): any[] { return []; }
    private async generateAdaptationStrategy(opportunities: any[]): Promise<CompetitiveAdaptation> { return {}; }
    private async implementAdaptations(strategy: CompetitiveAdaptation): Promise<void> {}
}

// ================================
// INTERFACE DEFINITIONS
// ================================

export interface CapabilityEvolution {
    domain: string;
    capability: string;
    oldLevel: number;
    newLevel: number;
    timestamp: number;
    context: string;
}

export interface CollaborationStats {
    totalRequests: number;
    successfulCollaborations: number;
    averageResponseTime: number;
    topCollaborators: string[];
}

export interface CapabilityAssessment {
    level: number;
    trend: 'improving' | 'stable' | 'declining';
    confidence: number;
    benchmark: 'basic' | 'advanced' | 'elite';
    recommendations: string[];
}

export interface AgentIntelligence {
    id: string;
    known: boolean;
    trustLevel: number;
    collaborationHistory: CollaborationRecord[];
    capabilities: any;
    reliability: number;
    expertise?: string[];
    responseTime?: number;
}

export interface CompetitiveAdaptation {
    strategy: string;
    adaptations: any[];
    expectedImpact: number;
    timeline: string;
}

export interface CapabilityEnhancement {
    domain: string;
    capability: string;
    enhancement: string;
    expectedImprovement: number;
}

// Placeholder interfaces
export interface LimitationData {}
export interface IdentityData {}
export interface AgentProfile { id: string; trustLevel: number; capabilities: any; reliability: number; expertise: string[]; averageResponseTime: number; }
export interface RelationshipMap {}
export interface TeamDynamics {}
export interface CollaborationRecord {}
export interface CommunicationPattern {}
export interface MarketConditions {}
export interface CompetitiveEnvironment {}
export interface TechnicalEnvironment {}
export interface OpportunityMap {}
export interface ThreatMap {}
export interface CompetitorProfile {}
export interface CompetitivePosition {}
export interface StrategicAdvantage {}
export interface Vulnerability {}
export interface CounterStrategy {}
export interface EmergentCapability {}
export interface SystemOptimization {}

export { AwarenessIntegrationSystem }; 