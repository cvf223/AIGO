import { MemorySpine } from '../core/src/memory/MemorySpine';
import { PluginMesh } from '../core/src/plugins/PluginMesh';
export interface FailureSignal {
    agentId: string;
    domain: string;
    taskType: string;
    errorMessage: string;
    context: Record<string, unknown>;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    retryCount: number;
}
export interface ExpertProfile {
    name: string;
    domain: string;
    specialty: string[];
    reputation: number;
    sources: {
        twitter?: string;
        github?: string;
        blog?: string;
        papers?: string[];
    };
    keyInsights: string[];
    lastUpdated: Date;
}
export interface CaseStudy {
    title: string;
    source: string;
    domain: string;
    problem: string;
    solution: string;
    outcome: string;
    techniques: string[];
    relevanceScore: number;
    extractedAt: Date;
}
export interface LfoResult {
    success: boolean;
    expertsConsulted: ExpertProfile[];
    caseStudiesFound: CaseStudy[];
    distilledSteps: string[];
    confidenceScore: number;
    recommendedRetryStrategy: string;
    memoryRecordsCreated: number;
}
export declare class LfoRunner {
    private memory;
    private plugins;
    private expertCache;
    private lastCacheUpdate;
    private readonly cacheExpiryHours;
    constructor(memory: MemorySpine, plugins: PluginMesh);
    runLFO(signal: FailureSignal): Promise<LfoResult>;
    private selectExperts;
    private loadExpertProfiles;
    private parseExpertYaml;
    private getDefaultExperts;
    private searchCaseStudies;
    private generateSearchQueries;
    private extractCaseStudy;
    private calculateRelevanceScore;
    private distillLearnings;
    private heuristicDistillation;
    private storeKnowledge;
    private generateRetryStrategy;
    private calculateConfidence;
    static triggerLFO(memory: MemorySpine, plugins: PluginMesh, agentId: string, domain: string, taskType: string, error: Error, context?: Record<string, unknown>, retryCount?: number): Promise<LfoResult>;
}
export declare function runLFO(signal: FailureSignal): Promise<LfoResult>;
//# sourceMappingURL=LfoRunner.d.ts.map