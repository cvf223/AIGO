import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { Task, TaskPriority, TaskStatus } from './HighPerformanceTaskManager';

export interface ExecutorMetrics {
    executionCount: number;
    averageExecutionTime: number;
    successRate: number;
    lastExecutionTime: number;
    peakExecutionTime: number;
    minExecutionTime: number;
}

export abstract class BaseTaskExecutor extends EventEmitter {
    protected metrics: ExecutorMetrics = {
        executionCount: 0,
        averageExecutionTime: 0,
        successRate: 0,
        lastExecutionTime: 0,
        peakExecutionTime: 0,
        minExecutionTime: Infinity
    };
    
    protected executionTimes: number[] = [];
    protected maxHistorySize = 1000;
    protected isOptimized = false;

    abstract execute(data: any): Promise<any>;
    
    protected updateMetrics(executionTime: number, success: boolean): void {
        this.metrics.executionCount++;
        this.metrics.lastExecutionTime = executionTime;
        
        if (executionTime > this.metrics.peakExecutionTime) {
            this.metrics.peakExecutionTime = executionTime;
        }
        
        if (executionTime < this.metrics.minExecutionTime) {
            this.metrics.minExecutionTime = executionTime;
        }
        
        this.executionTimes.push(executionTime);
        if (this.executionTimes.length > this.maxHistorySize) {
            this.executionTimes.shift();
        }
        
        this.metrics.averageExecutionTime = 
            this.executionTimes.reduce((a, b) => a + b, 0) / this.executionTimes.length;
        
        // Update success rate (simplified - you'd track this properly)
        this.metrics.successRate = success ? 
            (this.metrics.successRate * (this.metrics.executionCount - 1) + 1) / this.metrics.executionCount :
            (this.metrics.successRate * (this.metrics.executionCount - 1)) / this.metrics.executionCount;
    }

    public getMetrics(): ExecutorMetrics {
        return { ...this.metrics };
    }

    protected optimizeForSpeed(): void {
        if (this.isOptimized) return;
        
        // Reduce history size for faster calculations
        this.maxHistorySize = 500;
        this.executionTimes = this.executionTimes.slice(-500);
        this.isOptimized = true;
    }
}

/**
 * CRITICAL: Sub-50ms arbitrage detection executor
 * Optimized for maximum speed with minimal overhead
 */
export class ArbitrageDetectionExecutor extends BaseTaskExecutor {
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private readonly CACHE_TTL = 100; // 100ms cache TTL
    private readonly MIN_PROFIT_THRESHOLD = 0.01; // 1% minimum profit
    
    constructor() {
        super();
        this.optimizeForSpeed();
    }

    async execute(data: {
        tokenPair: string;
        exchanges: string[];
        currentPrices: Record<string, number>;
    }): Promise<{
        opportunity: boolean;
        profit: number;
        route: string[];
        executionTime: number;
    }> {
        const startTime = performance.now();
        
        try {
            // Ultra-fast price comparison using cached data
            const { tokenPair, exchanges, currentPrices } = data;
            
            let bestBuy = { exchange: '', price: Infinity };
            let bestSell = { exchange: '', price: 0 };
            
            // Optimized loop with minimal allocations
            for (let i = 0; i < exchanges.length; i++) {
                const exchange = exchanges[i];
                const price = currentPrices[exchange];
                
                if (price < bestBuy.price) {
                    bestBuy = { exchange, price };
                }
                if (price > bestSell.price) {
                    bestSell = { exchange, price };
                }
            }
            
            const profit = (bestSell.price - bestBuy.price) / bestBuy.price;
            const opportunity = profit > this.MIN_PROFIT_THRESHOLD;
            
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, true);
            
            // Emit critical opportunity immediately
            if (opportunity && profit > 0.05) { // 5% profit threshold
                this.emit('criticalOpportunity', {
                    tokenPair,
                    profit,
                    route: [bestBuy.exchange, bestSell.exchange],
                    timestamp: Date.now()
                });
            }
            
            return {
                opportunity,
                profit,
                route: opportunity ? [bestBuy.exchange, bestSell.exchange] : [],
                executionTime
            };
            
        } catch (error) {
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, false);
            throw error;
        }
    }
}

/**
 * HIGH: Market research executor with pause/resume capability
 * Optimized for background processing that can be interrupted
 */
export class MarketResearchExecutor extends BaseTaskExecutor {
    private isPaused = false;
    private pauseResolvers: (() => void)[] = [];
    private researchData: any[] = [];
    
    async execute(data: {
        markets: string[];
        analysisDepth: 'shallow' | 'deep';
        timeframe: string;
    }): Promise<{
        marketAnalysis: any[];
        trends: any[];
        executionTime: number;
    }> {
        const startTime = performance.now();
        
        try {
            const { markets, analysisDepth, timeframe } = data;
            const marketAnalysis: any[] = [];
            const trends: any[] = [];
            
            for (let i = 0; i < markets.length; i++) {
                // Check for pause requests
                if (this.isPaused) {
                    await this.waitForResume();
                }
                
                const market = markets[i];
                
                // Simulate market analysis (replace with real implementation)
                const analysis = await this.analyzeMarket(market, analysisDepth);
                marketAnalysis.push(analysis);
                
                // Extract trends
                const trend = this.extractTrend(analysis, timeframe);
                if (trend) {
                    trends.push(trend);
                }
                
                // Yield control periodically
                if (i % 10 === 0) {
                    await this.nextTick();
                }
            }
            
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, true);
            
            return { marketAnalysis, trends, executionTime };
            
        } catch (error) {
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, false);
            throw error;
        }
    }
    
    async pause(): Promise<void> {
        this.isPaused = true;
        this.emit('paused');
    }
    
    async resume(): Promise<void> {
        this.isPaused = false;
        // Resolve all waiting pause resolvers
        while (this.pauseResolvers.length > 0) {
            const resolver = this.pauseResolvers.shift()!;
            resolver();
        }
        this.emit('resumed');
    }
    
    private async waitForResume(): Promise<void> {
        return new Promise<void>(resolve => {
            this.pauseResolvers.push(resolve);
        });
    }
    
    private async analyzeMarket(market: string, depth: 'shallow' | 'deep'): Promise<any> {
        // Simulate analysis time based on depth
        const analysisTime = depth === 'shallow' ? 50 : 200;
        await this.sleep(analysisTime);
        
        return {
            market,
            volume: Math.random() * 1000000,
            volatility: Math.random() * 0.1,
            liquidity: Math.random() * 500000,
            timestamp: Date.now()
        };
    }
    
    private extractTrend(analysis: any, timeframe: string): any | null {
        // Simple trend extraction logic
        if (analysis.volatility > 0.05) {
            return {
                market: analysis.market,
                direction: analysis.volume > 500000 ? 'bullish' : 'bearish',
                strength: analysis.volatility,
                timeframe,
                timestamp: Date.now()
            };
        }
        return null;
    }
    
    private async nextTick(): Promise<void> {
        return new Promise(resolve => setImmediate(resolve));
    }
    
    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * MEDIUM: Competitive intelligence executor
 * Optimized for background data collection with minimal impact
 */
export class CompetitiveIntelligenceExecutor extends BaseTaskExecutor {
    private competitorData: Map<string, any> = new Map();
    private readonly UPDATE_INTERVAL = 5000; // 5 seconds
    
    async execute(data: {
        competitors: string[];
        metrics: string[];
        analysisType: 'performance' | 'strategy' | 'both';
    }): Promise<{
        competitorAnalysis: any[];
        benchmarks: any[];
        recommendations: string[];
        executionTime: number;
    }> {
        const startTime = performance.now();
        
        try {
            const { competitors, metrics, analysisType } = data;
            const competitorAnalysis: any[] = [];
            const benchmarks: any[] = [];
            const recommendations: string[] = [];
            
            for (const competitor of competitors) {
                const analysis = await this.analyzeCompetitor(competitor, metrics, analysisType);
                competitorAnalysis.push(analysis);
                
                // Generate benchmarks
                const benchmark = this.generateBenchmark(analysis);
                benchmarks.push(benchmark);
                
                // Cache for future use
                this.competitorData.set(competitor, analysis);
            }
            
            // Generate recommendations based on analysis
            const recs = this.generateRecommendations(competitorAnalysis);
            recommendations.push(...recs);
            
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, true);
            
            return { competitorAnalysis, benchmarks, recommendations, executionTime };
            
        } catch (error) {
            const executionTime = performance.now() - startTime;
            this.updateMetrics(executionTime, false);
            throw error;
        }
    }
    
    private async analyzeCompetitor(
        competitor: string, 
        metrics: string[], 
        analysisType: 'performance' | 'strategy' | 'both'
    ): Promise<any> {
        // Simulate competitive analysis
        await this.sleep(100);
        
        const baseAnalysis = {
            competitor,
            timestamp: Date.now(),
            metrics: {}
        };
        
        for (const metric of metrics) {
            baseAnalysis.metrics[metric] = Math.random() * 100;
        }
        
        if (analysisType === 'performance' || analysisType === 'both') {
            baseAnalysis.performance = {
                speed: Math.random() * 1000,
                accuracy: Math.random() * 100,
                profitability: Math.random() * 50
            };
        }
        
        if (analysisType === 'strategy' || analysisType === 'both') {
            baseAnalysis.strategy = {
                approach: ['aggressive', 'conservative', 'balanced'][Math.floor(Math.random() * 3)],
                riskLevel: Math.random() * 10,
                adaptability: Math.random() * 100
            };
        }
        
        return baseAnalysis;
    }
    
    private generateBenchmark(analysis: any): any {
        return {
            competitor: analysis.competitor,
            benchmarkScore: Object.values(analysis.metrics).reduce((a: number, b: number) => a + b, 0) / Object.keys(analysis.metrics).length,
            category: 'competitive_intelligence',
            timestamp: Date.now()
        };
    }
    
    private generateRecommendations(analyses: any[]): string[] {
        const recommendations: string[] = [];
        
        // Analyze top performers
        const topPerformer = analyses.reduce((best, current) => 
            current.performance?.profitability > best.performance?.profitability ? current : best
        );
        
        recommendations.push(`Consider adopting ${topPerformer.competitor}'s ${topPerformer.strategy?.approach} approach`);
        recommendations.push(`Benchmark against ${topPerformer.competitor}'s speed of ${topPerformer.performance?.speed}ms`);
        
        return recommendations;
    }
    
    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Factory for creating optimized task executors
 */
export class TaskExecutorFactory {
    private static executors: Map<string, BaseTaskExecutor> = new Map();
    
    static getExecutor(type: 'arbitrage' | 'research' | 'intelligence'): BaseTaskExecutor {
        if (!this.executors.has(type)) {
            switch (type) {
                case 'arbitrage':
                    this.executors.set(type, new ArbitrageDetectionExecutor());
                    break;
                case 'research':
                    this.executors.set(type, new MarketResearchExecutor());
                    break;
                case 'intelligence':
                    this.executors.set(type, new CompetitiveIntelligenceExecutor());
                    break;
                default:
                    throw new Error(`Unknown executor type: ${type}`);
            }
        }
        
        return this.executors.get(type)!;
    }
    
    static getAllExecutors(): BaseTaskExecutor[] {
        return Array.from(this.executors.values());
    }
    
    static getExecutorMetrics(): Record<string, ExecutorMetrics> {
        const metrics: Record<string, ExecutorMetrics> = {};
        
        for (const [type, executor] of this.executors.entries()) {
            metrics[type] = executor.getMetrics();
        }
        
        return metrics;
    }
} 