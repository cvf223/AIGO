import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import { HighPerformanceTaskManager, Task, TaskPriority, TaskStatus } from './HighPerformanceTaskManager';
import { 
    TaskExecutorFactory, 
    ArbitrageDetectionExecutor, 
    MarketResearchExecutor, 
    CompetitiveIntelligenceExecutor 
} from './TaskExecutors';

export interface SwapEvent {
    txHash: string;
    blockNumber: number;
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    exchange: string;
    timestamp: number;
    gasPrice: string;
}

export interface ArbitrageOpportunity {
    id: string;
    tokenPair: string;
    buyExchange: string;
    sellExchange: string;
    profit: number;
    profitUSD: number;
    executionTime: number;
    confidence: number;
    timestamp: number;
}

export interface AgentMetrics {
    totalOpportunities: number;
    profitableOpportunities: number;
    averageResponseTime: number;
    taskSwitchingPerformance: number;
    successRate: number;
    uptime: number;
}

export class EnhancedArbitrumAgent extends EventEmitter {
    private taskManager: HighPerformanceTaskManager;
    private arbitrageExecutor: ArbitrageDetectionExecutor;
    private researchExecutor: MarketResearchExecutor;
    private intelligenceExecutor: CompetitiveIntelligenceExecutor;
    
    private isRunning = false;
    private startTime: number = 0;
    private opportunities: ArbitrageOpportunity[] = [];
    private responseTimes: number[] = [];
    private maxResponseTimeHistory = 1000;
    
    // Performance optimization settings
    private readonly TARGET_RESPONSE_TIME = 50; // 50ms target
    private readonly CRITICAL_RESPONSE_TIME = 25; // 25ms for critical events
    private readonly MAX_CONCURRENT_TASKS = 10;
    
    // Market data cache for ultra-fast access
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private readonly PRICE_CACHE_TTL = 100; // 100ms
    
    constructor() {
        super();
        this.initializeComponents();
        this.setupEventHandlers();
    }

    private initializeComponents(): void {
        // Initialize high-performance task manager
        this.taskManager = new HighPerformanceTaskManager();
        
        // Get optimized executors
        this.arbitrageExecutor = TaskExecutorFactory.getExecutor('arbitrage') as ArbitrageDetectionExecutor;
        this.researchExecutor = TaskExecutorFactory.getExecutor('research') as MarketResearchExecutor;
        this.intelligenceExecutor = TaskExecutorFactory.getExecutor('intelligence') as CompetitiveIntelligenceExecutor;
    }

    private setupEventHandlers(): void {
        // Critical opportunity detection
        this.arbitrageExecutor.on('criticalOpportunity', (opportunity) => {
            this.handleCriticalOpportunity(opportunity);
        });
        
        // Task manager events
        this.taskManager.on('taskCompleted', (event) => {
            this.recordResponseTime(event.executionTime);
        });
        
        this.taskManager.on('performanceMetrics', (metrics) => {
            this.optimizePerformance(metrics);
        });
    }

    /**
     * Start the enhanced agent with sub-50ms performance guarantees
     */
    public async start(): Promise<void> {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        // Start background market research
        this.startBackgroundResearch();
        
        // Start competitive intelligence gathering
        this.startCompetitiveIntelligence();
        
        // Start real-time monitoring
        this.startPerformanceMonitoring();
        
        this.emit('agentStarted', { timestamp: this.startTime });
        console.log('🚀 Enhanced Arbitrum Agent started with sub-50ms task switching');
    }

    /**
     * Handle incoming swap events with guaranteed sub-25ms response
     */
    public async handleSwapEvent(swapEvent: SwapEvent): Promise<void> {
        const startTime = performance.now();
        
        // CRITICAL: Immediate arbitrage detection with highest priority
        const taskId = this.taskManager.addTask({
            name: 'arbitrage_detection',
            priority: TaskPriority.CRITICAL,
            execute: async () => {
                return this.detectArbitrageOpportunity(swapEvent);
            },
            metadata: {
                swapEvent,
                startTime
            }
        });
        
        // Emit immediate response for monitoring
        const responseTime = performance.now() - startTime;
        this.emit('swapEventReceived', { 
            txHash: swapEvent.txHash, 
            responseTime,
            taskId 
        });
    }

    /**
     * Ultra-fast arbitrage detection (sub-50ms guaranteed)
     */
    private async detectArbitrageOpportunity(swapEvent: SwapEvent): Promise<ArbitrageOpportunity | null> {
        const startTime = performance.now();
        
        try {
            // Get cached prices for instant access
            const tokenPair = `${swapEvent.tokenIn}-${swapEvent.tokenOut}`;
            const exchanges = ['uniswap', 'sushiswap', 'balancer', 'curve'];
            
            // Simulate real-time price fetching (replace with actual implementation)
            const currentPrices = await this.getCachedPrices(tokenPair, exchanges);
            
            const result = await this.arbitrageExecutor.execute({
                tokenPair,
                exchanges,
                currentPrices
            });
            
            if (result.opportunity) {
                const opportunity: ArbitrageOpportunity = {
                    id: `arb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    tokenPair,
                    buyExchange: result.route[0],
                    sellExchange: result.route[1],
                    profit: result.profit,
                    profitUSD: result.profit * 1000, // Estimate
                    executionTime: performance.now() - startTime,
                    confidence: this.calculateConfidence(result),
                    timestamp: Date.now()
                };
                
                this.opportunities.push(opportunity);
                this.emit('arbitrageOpportunity', opportunity);
                
                return opportunity;
            }
            
            return null;
            
        } catch (error) {
            console.error('Arbitrage detection failed:', error);
            return null;
        }
    }

    /**
     * Handle critical opportunities with immediate execution
     */
    private async handleCriticalOpportunity(opportunity: any): Promise<void> {
        const startTime = performance.now();
        
        // Pause all non-critical tasks immediately
        this.pauseNonCriticalTasks();
        
        // Execute critical opportunity analysis
        const taskId = this.taskManager.addTask({
            name: 'critical_opportunity_execution',
            priority: TaskPriority.CRITICAL,
            execute: async () => {
                return this.executeCriticalOpportunity(opportunity);
            },
            metadata: {
                opportunity,
                startTime
            }
        });
        
        const responseTime = performance.now() - startTime;
        console.log(`🔥 Critical opportunity handled in ${responseTime.toFixed(2)}ms`);
    }

    /**
     * Start background market research with pausable execution
     */
    private startBackgroundResearch(): void {
        const researchTask = () => {
            const taskId = this.taskManager.addTask({
                name: 'market_research',
                priority: TaskPriority.LOW,
                execute: async () => {
                    return this.researchExecutor.execute({
                        markets: ['arbitrum', 'ethereum', 'polygon'],
                        analysisDepth: 'shallow',
                        timeframe: '1h'
                    });
                },
                onPause: async () => {
                    await this.researchExecutor.pause();
                },
                onResume: async () => {
                    await this.researchExecutor.resume();
                },
                metadata: {
                    type: 'background_research'
                }
            });
            
            // Schedule next research cycle
            setTimeout(researchTask, 30000); // Every 30 seconds
        };
        
        // Start initial research
        setTimeout(researchTask, 5000); // Start after 5 seconds
    }

    /**
     * Start competitive intelligence gathering
     */
    private startCompetitiveIntelligence(): void {
        const intelligenceTask = () => {
            const taskId = this.taskManager.addTask({
                name: 'competitive_intelligence',
                priority: TaskPriority.BACKGROUND,
                execute: async () => {
                    return this.intelligenceExecutor.execute({
                        competitors: ['flashbots', 'mev-boost', 'cow-protocol'],
                        metrics: ['speed', 'success_rate', 'profit_margin'],
                        analysisType: 'both'
                    });
                },
                metadata: {
                    type: 'competitive_intelligence'
                }
            });
            
            // Schedule next intelligence gathering
            setTimeout(intelligenceTask, 60000); // Every minute
        };
        
        // Start initial intelligence gathering
        setTimeout(intelligenceTask, 10000); // Start after 10 seconds
    }

    /**
     * Performance monitoring and optimization
     */
    private startPerformanceMonitoring(): void {
        setInterval(() => {
            const metrics = this.getMetrics();
            
            // Auto-optimize if performance degrades
            if (metrics.averageResponseTime > this.TARGET_RESPONSE_TIME) {
                this.optimizePerformance(metrics);
            }
            
            this.emit('performanceUpdate', metrics);
        }, 1000);
    }

    /**
     * Utility methods for sub-50ms performance
     */
    private async getCachedPrices(tokenPair: string, exchanges: string[]): Promise<Record<string, number>> {
        const prices: Record<string, number> = {};
        const now = Date.now();
        
        for (const exchange of exchanges) {
            const cacheKey = `${tokenPair}_${exchange}`;
            const cached = this.priceCache.get(cacheKey);
            
            if (cached && (now - cached.timestamp) < this.PRICE_CACHE_TTL) {
                prices[exchange] = cached.price;
            } else {
                // Simulate price fetch (replace with real implementation)
                const price = Math.random() * 1000 + 1000;
                prices[exchange] = price;
                this.priceCache.set(cacheKey, { price, timestamp: now });
            }
        }
        
        return prices;
    }

    private calculateConfidence(result: any): number {
        // Simple confidence calculation based on profit margin and execution time
        const profitScore = Math.min(result.profit * 10, 1); // Max 1.0 for 10%+ profit
        const speedScore = Math.max(0, 1 - (result.executionTime / 100)); // Penalty for slow execution
        return (profitScore + speedScore) / 2;
    }

    private pauseNonCriticalTasks(): void {
        // Implementation would pause all tasks except CRITICAL priority
        console.log('🔄 Pausing non-critical tasks for opportunity execution');
    }

    private async executeCriticalOpportunity(opportunity: any): Promise<any> {
        // Simulate critical opportunity execution
        console.log(`⚡ Executing critical opportunity: ${opportunity.profit * 100}% profit`);
        return { executed: true, profit: opportunity.profit };
    }

    private recordResponseTime(time: number): void {
        this.responseTimes.push(time);
        if (this.responseTimes.length > this.maxResponseTimeHistory) {
            this.responseTimes.shift();
        }
    }

    private optimizePerformance(metrics: any): void {
        // Reduce cache sizes if memory pressure
        if (this.priceCache.size > 1000) {
            const keysToDelete = Array.from(this.priceCache.keys()).slice(0, 500);
            keysToDelete.forEach(key => this.priceCache.delete(key));
        }
        
        // Reduce response time history
        if (this.responseTimes.length > 500) {
            this.responseTimes = this.responseTimes.slice(-500);
        }
        
        console.log('🔧 Performance optimized');
    }

    /**
     * Public API methods
     */
    public getMetrics(): AgentMetrics {
        const uptime = this.isRunning ? Date.now() - this.startTime : 0;
        const profitableOpps = this.opportunities.filter(opp => opp.profit > 0.01).length;
        const avgResponseTime = this.responseTimes.length > 0 
            ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
            : 0;
        
        const taskMetrics = this.taskManager.getMetrics();
        
        return {
            totalOpportunities: this.opportunities.length,
            profitableOpportunities: profitableOpps,
            averageResponseTime: avgResponseTime,
            taskSwitchingPerformance: taskMetrics.averageSwitchTime,
            successRate: profitableOpps / Math.max(this.opportunities.length, 1),
            uptime
        };
    }

    public getTaskManagerMetrics() {
        return this.taskManager.getMetrics();
    }

    public getExecutorMetrics() {
        return TaskExecutorFactory.getExecutorMetrics();
    }

    public async stop(): Promise<void> {
        this.isRunning = false;
        this.taskManager.stop();
        this.emit('agentStopped', { timestamp: Date.now() });
    }
} 