// Re-export core types from the packages/core/src/types
export type { 
    IAgentRuntime, 
    Memory, 
    State, 
    Action, 
    Plugin, 
    HandlerCallback, 
    ActionExample 
} from '../packages/core/src/types';

// Import elizaLogger from the logger source file
export { elizaLogger } from '../packages/core/src/logger';

// Additional types for our codebase
export interface MarketConditions {
    volatility: number;
    volume: number;
    gasPrice: number;
    sentiment: string;
}

export interface CompetitorProfile {
    id: string;
    strategy: string;
    performance: number;
    lastSeen: number;
}

export interface PerformanceOptimization {
    strategy: string;
    target: number;
    currentValue: number;
}

export interface PerformanceMetrics {
    successRate: number;
    totalProfit: number;
    avgExecutionTime: number;
    gasEfficiency: number;
    timestamp?: number;
}

export interface OpportunityData {
    id: string;
    profit: number;
    gasPrice: number;
    timestamp: number;
    blockNumber: number;
}

export interface TradingSignal {
    signal: string;
    confidence: number;
    source: string;
    timestamp?: number;
}

export interface ArbitrageOpportunity {
    id: string;
    tokenA: string;
    tokenB: string;
    profit: number;
    gasPrice: number;
    timestamp: number;
}

export interface LearningMetrics {
    domainCoverage: Record<string, number>;
    expertiseLevel: number;
    learningRate: number;
    timestamp: number;
}

export interface KnowledgeGap {
    domain: string;
    topic: string;
    priority: number;
    estimatedTime: number;
}

export interface LearningGoal {
    id: string;
    domain: string;
    topic: string;
    targetExpertiseLevel: number;
    currentLevel: number;
    priority: 'high' | 'medium' | 'low';
    deadline?: number;
}

export interface ExpertiseAssessment {
    domain: string;
    level: number;
    confidence: number;
    timestamp: number;
}

export interface CompleteAwarenessState {
    selfAwareness: {
        capabilities: Record<string, Record<string, number>>;
        performance: PerformanceMetrics;
        identity: string;
    };
    marketAwareness: {
        conditions: MarketConditions;
        opportunities: ArbitrageOpportunity[];
        competitors: CompetitorProfile[];
    };
    strategicAwareness: {
        currentStrategy: string;
        optimizations: PerformanceOptimization[];
        adaptations: string[];
    };
} 