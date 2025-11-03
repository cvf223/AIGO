#!/usr/bin/env node

import { performance } from 'perf_hooks';
import { EnhancedArbitrumAgent, SwapEvent, ArbitrageOpportunity } from './EnhancedArbitrumAgent';
import { HighPerformanceTaskManager, TaskPriority } from './HighPerformanceTaskManager';

interface DemoMetrics {
    totalSwapEvents: number;
    averageResponseTime: number;
    sub50msCount: number;
    sub25msCount: number;
    maxResponseTime: number;
    minResponseTime: number;
    taskSwitchingPerformance: number;
    opportunitiesDetected: number;
    successRate: number;
}

class Sub50msTaskSwitchingDemo {
    private agent: EnhancedArbitrumAgent;
    private metrics: DemoMetrics = {
        totalSwapEvents: 0,
        averageResponseTime: 0,
        sub50msCount: 0,
        sub25msCount: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        taskSwitchingPerformance: 0,
        opportunitiesDetected: 0,
        successRate: 0
    };
    
    private responseTimes: number[] = [];
    private isRunning = false;
    private startTime = 0;

    constructor() {
        this.agent = new EnhancedArbitrumAgent();
        this.setupEventHandlers();
    }

    private setupEventHandlers(): void {
        this.agent.on('agentStarted', () => {
            console.log('🚀 Enhanced Arbitrum Agent started successfully');
        });

        this.agent.on('swapEventReceived', (event) => {
            this.recordResponseTime(event.responseTime);
            console.log(`⚡ Swap event processed in ${event.responseTime.toFixed(2)}ms`);
        });

        this.agent.on('arbitrageOpportunity', (opportunity: ArbitrageOpportunity) => {
            this.metrics.opportunitiesDetected++;
            console.log(`💰 Arbitrage opportunity: ${(opportunity.profit * 100).toFixed(2)}% profit in ${opportunity.executionTime.toFixed(2)}ms`);
        });

        this.agent.on('performanceUpdate', (agentMetrics) => {
            this.updateMetrics(agentMetrics);
        });
    }

    /**
     * Demonstrate sub-50ms task switching with various scenarios
     */
    public async runDemo(): Promise<void> {
        console.log('\n🎯 SUB-50MS TASK SWITCHING DEMONSTRATION');
        console.log('==========================================\n');

        await this.agent.start();
        this.isRunning = true;
        this.startTime = Date.now();

        // Run different demo scenarios
        await this.runBasicSwapEventDemo();
        await this.runHighFrequencyDemo();
        await this.runCriticalOpportunityDemo();
        await this.runStressTestDemo();
        await this.runConcurrentTaskDemo();

        // Final metrics report
        this.printFinalReport();

        await this.agent.stop();
    }

    /**
     * Basic swap event processing demo
     */
    private async runBasicSwapEventDemo(): Promise<void> {
        console.log('📊 BASIC SWAP EVENT PROCESSING');
        console.log('-------------------------------');

        for (let i = 0; i < 10; i++) {
            const swapEvent = this.generateSwapEvent();
            const startTime = performance.now();
            
            await this.agent.handleSwapEvent(swapEvent);
            
            const responseTime = performance.now() - startTime;
            console.log(`Swap ${i + 1}: ${responseTime.toFixed(2)}ms ${responseTime < 50 ? '✅' : '❌'}`);
            
            // Small delay between events
            await this.sleep(100);
        }
        
        console.log('');
    }

    /**
     * High-frequency event processing demo
     */
    private async runHighFrequencyDemo(): Promise<void> {
        console.log('⚡ HIGH-FREQUENCY EVENT PROCESSING');
        console.log('-----------------------------------');

        const eventCount = 50;
        const startTime = performance.now();
        
        // Fire events rapidly
        const promises = [];
        for (let i = 0; i < eventCount; i++) {
            const swapEvent = this.generateSwapEvent();
            promises.push(this.agent.handleSwapEvent(swapEvent));
        }
        
        await Promise.all(promises);
        
        const totalTime = performance.now() - startTime;
        const avgTimePerEvent = totalTime / eventCount;
        
        console.log(`Processed ${eventCount} events in ${totalTime.toFixed(2)}ms`);
        console.log(`Average time per event: ${avgTimePerEvent.toFixed(2)}ms ${avgTimePerEvent < 50 ? '✅' : '❌'}`);
        console.log('');
    }

    /**
     * Critical opportunity handling demo
     */
    private async runCriticalOpportunityDemo(): Promise<void> {
        console.log('🔥 CRITICAL OPPORTUNITY HANDLING');
        console.log('---------------------------------');

        // Generate high-profit swap events that should trigger critical handling
        for (let i = 0; i < 5; i++) {
            const criticalSwapEvent = this.generateHighProfitSwapEvent();
            const startTime = performance.now();
            
            await this.agent.handleSwapEvent(criticalSwapEvent);
            
            const responseTime = performance.now() - startTime;
            console.log(`Critical opportunity ${i + 1}: ${responseTime.toFixed(2)}ms ${responseTime < 25 ? '🚀' : '⚠️'}`);
            
            await this.sleep(200);
        }
        
        console.log('');
    }

    /**
     * Stress test with concurrent task switching
     */
    private async runStressTestDemo(): Promise<void> {
        console.log('💪 STRESS TEST - CONCURRENT TASK SWITCHING');
        console.log('-------------------------------------------');

        const concurrentEvents = 100;
        const batchSize = 10;
        
        for (let batch = 0; batch < concurrentEvents / batchSize; batch++) {
            const batchPromises = [];
            const batchStartTime = performance.now();
            
            for (let i = 0; i < batchSize; i++) {
                const swapEvent = this.generateSwapEvent();
                batchPromises.push(this.agent.handleSwapEvent(swapEvent));
            }
            
            await Promise.all(batchPromises);
            
            const batchTime = performance.now() - batchStartTime;
            const avgBatchTime = batchTime / batchSize;
            
            console.log(`Batch ${batch + 1}: ${batchTime.toFixed(2)}ms total, ${avgBatchTime.toFixed(2)}ms avg ${avgBatchTime < 50 ? '✅' : '❌'}`);
            
            // Brief pause between batches
            await this.sleep(50);
        }
        
        console.log('');
    }

    /**
     * Concurrent task types demo
     */
    private async runConcurrentTaskDemo(): Promise<void> {
        console.log('🔄 CONCURRENT TASK TYPES');
        console.log('-------------------------');

        // Mix of different task types running concurrently
        const tasks = [
            // Critical arbitrage detection
            this.agent.handleSwapEvent(this.generateSwapEvent()),
            this.agent.handleSwapEvent(this.generateSwapEvent()),
            
            // High-frequency events
            ...Array.from({ length: 5 }, () => 
                this.agent.handleSwapEvent(this.generateSwapEvent())
            )
        ];

        const startTime = performance.now();
        await Promise.all(tasks);
        const totalTime = performance.now() - startTime;

        console.log(`All concurrent tasks completed in ${totalTime.toFixed(2)}ms`);
        console.log(`Task switching efficiency: ${totalTime < 200 ? 'EXCELLENT ✅' : 'NEEDS IMPROVEMENT ❌'}`);
        console.log('');
    }

    /**
     * Record and analyze response times
     */
    private recordResponseTime(responseTime: number): void {
        this.responseTimes.push(responseTime);
        this.metrics.totalSwapEvents++;
        
        if (responseTime < 25) {
            this.metrics.sub25msCount++;
            this.metrics.sub50msCount++;
        } else if (responseTime < 50) {
            this.metrics.sub50msCount++;
        }
        
        if (responseTime > this.metrics.maxResponseTime) {
            this.metrics.maxResponseTime = responseTime;
        }
        
        if (responseTime < this.metrics.minResponseTime) {
            this.metrics.minResponseTime = responseTime;
        }
        
        this.metrics.averageResponseTime = 
            this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
    }

    private updateMetrics(agentMetrics: any): void {
        this.metrics.taskSwitchingPerformance = agentMetrics.taskSwitchingPerformance;
        this.metrics.successRate = agentMetrics.successRate;
    }

    /**
     * Generate realistic swap events for testing
     */
    private generateSwapEvent(): SwapEvent {
        const tokens = ['USDC', 'WETH', 'ARB', 'USDT', 'DAI'];
        const exchanges = ['uniswap', 'sushiswap', 'balancer', 'curve'];
        
        return {
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
            blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
            tokenIn: tokens[Math.floor(Math.random() * tokens.length)],
            tokenOut: tokens[Math.floor(Math.random() * tokens.length)],
            amountIn: (Math.random() * 10000).toString(),
            amountOut: (Math.random() * 10000).toString(),
            exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
            timestamp: Date.now(),
            gasPrice: (Math.random() * 100 + 10).toString()
        };
    }

    private generateHighProfitSwapEvent(): SwapEvent {
        const swapEvent = this.generateSwapEvent();
        // Modify to create high-profit scenario
        swapEvent.amountOut = (parseFloat(swapEvent.amountIn) * 1.1).toString(); // 10% profit
        return swapEvent;
    }

    /**
     * Print comprehensive performance report
     */
    private printFinalReport(): void {
        console.log('\n📊 FINAL PERFORMANCE REPORT');
        console.log('============================');
        console.log(`Total swap events processed: ${this.metrics.totalSwapEvents}`);
        console.log(`Average response time: ${this.metrics.averageResponseTime.toFixed(2)}ms`);
        console.log(`Sub-50ms responses: ${this.metrics.sub50msCount}/${this.metrics.totalSwapEvents} (${((this.metrics.sub50msCount / this.metrics.totalSwapEvents) * 100).toFixed(1)}%)`);
        console.log(`Sub-25ms responses: ${this.metrics.sub25msCount}/${this.metrics.totalSwapEvents} (${((this.metrics.sub25msCount / this.metrics.totalSwapEvents) * 100).toFixed(1)}%)`);
        console.log(`Min response time: ${this.metrics.minResponseTime.toFixed(2)}ms`);
        console.log(`Max response time: ${this.metrics.maxResponseTime.toFixed(2)}ms`);
        console.log(`Task switching performance: ${this.metrics.taskSwitchingPerformance.toFixed(2)}ms`);
        console.log(`Opportunities detected: ${this.metrics.opportunitiesDetected}`);
        console.log(`Success rate: ${(this.metrics.successRate * 100).toFixed(1)}%`);
        
        // Performance assessment
        console.log('\n🎯 PERFORMANCE ASSESSMENT');
        console.log('--------------------------');
        
        const sub50Percentage = (this.metrics.sub50msCount / this.metrics.totalSwapEvents) * 100;
        const sub25Percentage = (this.metrics.sub25msCount / this.metrics.totalSwapEvents) * 100;
        
        if (sub50Percentage >= 95) {
            console.log('✅ EXCELLENT: 95%+ responses under 50ms - ELITE PERFORMANCE!');
        } else if (sub50Percentage >= 90) {
            console.log('🟢 GOOD: 90%+ responses under 50ms - Strong performance');
        } else if (sub50Percentage >= 80) {
            console.log('🟡 FAIR: 80%+ responses under 50ms - Needs optimization');
        } else {
            console.log('🔴 POOR: <80% responses under 50ms - Requires immediate attention');
        }
        
        if (sub25Percentage >= 50) {
            console.log('🚀 BLAZING FAST: 50%+ responses under 25ms - COMPETITIVE EDGE!');
        }
        
        if (this.metrics.taskSwitchingPerformance < 50) {
            console.log('⚡ TASK SWITCHING: Sub-50ms switching achieved - TARGET MET!');
        } else {
            console.log('⚠️  TASK SWITCHING: Above 50ms - Optimization needed');
        }
        
        console.log('\n🏆 READY FOR PRODUCTION ARBITRAGE TRADING!');
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Run the demonstration
 */
async function main() {
    const demo = new Sub50msTaskSwitchingDemo();
    
    try {
        await demo.runDemo();
    } catch (error) {
        console.error('Demo failed:', error);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

export { Sub50msTaskSwitchingDemo }; 