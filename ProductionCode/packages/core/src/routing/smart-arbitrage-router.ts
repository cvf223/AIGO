/**
 * Smart Arbitrage Router
 * 
 * Advanced routing system that discovers:
 * - Multi-hop arbitrage opportunities
 * - Circular arbitrage paths
 * - Cross-DEX routing
 * - Flash loan optimization
 * - MEV extraction opportunities
 */

import { Pool, ArbitrageOpportunity, MultiHopRoute } from '../database/arbitrage-db';

interface Token {
    address: string;
    symbol: string;
    decimals: number;
    chain: string;
}

interface RouteStep {
    pool: Pool;
    tokenIn: Token;
    tokenOut: Token;
    amountIn: bigint;
    amountOut: bigint;
    priceImpact: number;
    gasEstimate: number;
}

interface ArbitrageRoute {
    id: string;
    steps: RouteStep[];
    totalGasEstimate: number;
    estimatedProfit: number;
    profitMargin: number;
    riskScore: number;
    liquidityUtilization: number;
    executionComplexity: 'simple' | 'medium' | 'complex';
    flashLoanRequired: boolean;
    crossChain: boolean;
    viabilityScore: number;
}

interface RouteConstraints {
    maxHops: number;
    minProfit: number;
    maxGasCost: number;
    maxLiquidityUtilization: number;
    allowCrossChain: boolean;
    preferredChains: string[];
    excludedTokens: string[];
    maxPriceImpact: number;
}

export class SmartArbitrageRouter {
    private pools: Map<string, Pool> = new Map();
    private tokenGraph: Map<string, Set<string>> = new Map(); // token -> connected tokens
    private poolsByPair: Map<string, Pool[]> = new Map(); // token pair -> pools
    
    // Cached calculations
    private routeCache: Map<string, ArbitrageRoute[]> = new Map();
    private priceCache: Map<string, number> = new Map();
    private liquidityCache: Map<string, number> = new Map();
    
    // Configuration
    private defaultConstraints: RouteConstraints = {
        maxHops: 4,
        minProfit: 100, // $100 minimum
        maxGasCost: 200, // $200 maximum gas
        maxLiquidityUtilization: 0.05, // 5% of pool liquidity
        allowCrossChain: true,
        preferredChains: ['arbitrum', 'base'],
        excludedTokens: [],
        maxPriceImpact: 0.03 // 3% maximum price impact
    };

    constructor(pools: Pool[]) {
        this.initializePools(pools);
        this.buildTokenGraph();
    }

    private initializePools(pools: Pool[]) {
        for (const pool of pools) {
            this.pools.set(pool.id, pool);
            
            // Create token pair key (sorted for consistency)
            const pairKey = this.createPairKey(pool.token0.symbol, pool.token1.symbol);
            
            if (!this.poolsByPair.has(pairKey)) {
                this.poolsByPair.set(pairKey, []);
            }
            this.poolsByPair.get(pairKey)!.push(pool);
        }
        
        console.log(`🔧 Initialized router with ${pools.length} pools and ${this.poolsByPair.size} token pairs`);
    }

    private buildTokenGraph() {
        // Build a graph of token connections for path finding
        for (const pool of this.pools.values()) {
            const token0 = pool.token0.symbol;
            const token1 = pool.token1.symbol;
            
            if (!this.tokenGraph.has(token0)) {
                this.tokenGraph.set(token0, new Set());
            }
            if (!this.tokenGraph.has(token1)) {
                this.tokenGraph.set(token1, new Set());
            }
            
            this.tokenGraph.get(token0)!.add(token1);
            this.tokenGraph.get(token1)!.add(token0);
        }
        
        console.log(`📊 Built token graph with ${this.tokenGraph.size} tokens`);
    }

    /**
     * Find all profitable arbitrage routes for a given token pair
     */
    async findArbitrageRoutes(
        tokenA: string, 
        tokenB: string, 
        amountIn: bigint,
        constraints: Partial<RouteConstraints> = {}
    ): Promise<ArbitrageRoute[]> {
        const finalConstraints = { ...this.defaultConstraints, ...constraints };
        const cacheKey = `${tokenA}-${tokenB}-${amountIn.toString()}-${JSON.stringify(finalConstraints)}`;
        
        // Check cache first
        const cached = this.routeCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const routes: ArbitrageRoute[] = [];
        
        // 1. Simple direct arbitrage (same pair, different pools)
        const directRoutes = await this.findDirectArbitrage(tokenA, tokenB, amountIn, finalConstraints);
        routes.push(...directRoutes);
        
        // 2. Multi-hop arbitrage (triangular, quadrilateral, etc.)
        const multiHopRoutes = await this.findMultiHopArbitrage(tokenA, tokenB, amountIn, finalConstraints);
        routes.push(...multiHopRoutes);
        
        // 3. Cross-chain arbitrage
        if (finalConstraints.allowCrossChain) {
            const crossChainRoutes = await this.findCrossChainArbitrage(tokenA, tokenB, amountIn, finalConstraints);
            routes.push(...crossChainRoutes);
        }
        
        // Sort by viability score and profit
        const sortedRoutes = routes
            .filter(route => route.estimatedProfit >= finalConstraints.minProfit)
            .sort((a, b) => b.viabilityScore - a.viabilityScore || b.estimatedProfit - a.estimatedProfit);
        
        // Cache results
        this.routeCache.set(cacheKey, sortedRoutes);
        
        return sortedRoutes;
    }

    private async findDirectArbitrage(
        tokenA: string, 
        tokenB: string, 
        amountIn: bigint,
        constraints: RouteConstraints
    ): Promise<ArbitrageRoute[]> {
        const routes: ArbitrageRoute[] = [];
        const pairKey = this.createPairKey(tokenA, tokenB);
        const pools = this.poolsByPair.get(pairKey) || [];
        
        if (pools.length < 2) return routes;
        
        // Check all pool combinations for arbitrage
        for (let i = 0; i < pools.length; i++) {
            for (let j = i + 1; j < pools.length; j++) {
                const poolA = pools[i];
                const poolB = pools[j];
                
                const route = await this.evaluateDirectArbitrage(poolA, poolB, tokenA, tokenB, amountIn, constraints);
                if (route) {
                    routes.push(route);
                }
            }
        }
        
        return routes;
    }

    private async evaluateDirectArbitrage(
        poolA: Pool,
        poolB: Pool,
        tokenA: string,
        tokenB: string,
        amountIn: bigint,
        constraints: RouteConstraints
    ): Promise<ArbitrageRoute | null> {
        try {
            // Calculate trade outputs for both directions
            const outputA = this.calculateSwapOutput(poolA, tokenA, tokenB, amountIn);
            const outputB = this.calculateSwapOutput(poolB, tokenB, tokenA, outputA);
            
            // Check if profitable
            const profit = Number(outputB - amountIn) / 1e18; // Assuming 18 decimals
            const gasEstimate = this.estimateGasCost([poolA, poolB]);
            const netProfit = profit - gasEstimate;
            
            if (netProfit < constraints.minProfit) {
                return null;
            }
            
            // Calculate price impact
            const priceImpactA = this.calculatePriceImpact(poolA, tokenA, amountIn);
            const priceImpactB = this.calculatePriceImpact(poolB, tokenB, outputA);
            const totalPriceImpact = priceImpactA + priceImpactB;
            
            if (totalPriceImpact > constraints.maxPriceImpact) {
                return null;
            }
            
            const steps: RouteStep[] = [
                {
                    pool: poolA,
                    tokenIn: { address: poolA.token0.address, symbol: tokenA, decimals: 18, chain: poolA.chain },
                    tokenOut: { address: poolA.token1.address, symbol: tokenB, decimals: 18, chain: poolA.chain },
                    amountIn,
                    amountOut: outputA,
                    priceImpact: priceImpactA,
                    gasEstimate: gasEstimate / 2
                },
                {
                    pool: poolB,
                    tokenIn: { address: poolB.token0.address, symbol: tokenB, decimals: 18, chain: poolB.chain },
                    tokenOut: { address: poolB.token1.address, symbol: tokenA, decimals: 18, chain: poolB.chain },
                    amountIn: outputA,
                    amountOut: outputB,
                    priceImpact: priceImpactB,
                    gasEstimate: gasEstimate / 2
                }
            ];
            
            const route: ArbitrageRoute = {
                id: `direct-${poolA.id}-${poolB.id}-${Date.now()}`,
                steps,
                totalGasEstimate: gasEstimate,
                estimatedProfit: netProfit,
                profitMargin: netProfit / (Number(amountIn) / 1e18),
                riskScore: this.calculateRiskScore(steps),
                liquidityUtilization: this.calculateLiquidityUtilization(steps),
                executionComplexity: 'simple',
                flashLoanRequired: true,
                crossChain: poolA.chain !== poolB.chain,
                viabilityScore: this.calculateViabilityScore(netProfit, gasEstimate, totalPriceImpact, steps.length)
            };
            
            return route;
            
        } catch (error) {
            console.error('Error evaluating direct arbitrage:', error);
            return null;
        }
    }

    private async findMultiHopArbitrage(
        startToken: string,
        endToken: string,
        amountIn: bigint,
        constraints: RouteConstraints
    ): Promise<ArbitrageRoute[]> {
        const routes: ArbitrageRoute[] = [];
        
        // Use BFS to find all possible paths
        const allPaths = this.findAllPaths(startToken, startToken, constraints.maxHops, new Set());
        
        for (const path of allPaths) {
            if (path.length < 3) continue; // Need at least triangular arbitrage
            
            const route = await this.evaluateMultiHopPath(path, amountIn, constraints);
            if (route) {
                routes.push(route);
            }
        }
        
        return routes;
    }

    private findAllPaths(
        currentToken: string,
        targetToken: string,
        maxHops: number,
        visited: Set<string>,
        currentPath: string[] = []
    ): string[][] {
        if (maxHops <= 0) return [];
        
        currentPath.push(currentToken);
        visited.add(currentToken);
        
        const paths: string[][] = [];
        
        // If we've made a complete cycle back to target
        if (currentPath.length > 2 && currentToken === targetToken) {
            paths.push([...currentPath]);
        }
        
        // Continue exploring if we haven't reached max hops
        if (currentPath.length < maxHops) {
            const connectedTokens = this.tokenGraph.get(currentToken) || new Set();
            
            for (const nextToken of connectedTokens) {
                if (!visited.has(nextToken) || (nextToken === targetToken && currentPath.length > 2)) {
                    const newVisited = new Set(visited);
                    if (nextToken !== targetToken) {
                        newVisited.add(nextToken);
                    }
                    
                    const subPaths = this.findAllPaths(nextToken, targetToken, maxHops - 1, newVisited, [...currentPath]);
                    paths.push(...subPaths);
                }
            }
        }
        
        return paths;
    }

    private async evaluateMultiHopPath(
        path: string[],
        amountIn: bigint,
        constraints: RouteConstraints
    ): Promise<ArbitrageRoute | null> {
        try {
            const steps: RouteStep[] = [];
            let currentAmount = amountIn;
            let totalGas = 0;
            let totalPriceImpact = 0;
            
            // Build route steps
            for (let i = 0; i < path.length - 1; i++) {
                const tokenIn = path[i];
                const tokenOut = path[i + 1];
                
                // Find best pool for this hop
                const bestPool = this.findBestPoolForPair(tokenIn, tokenOut, currentAmount);
                if (!bestPool) return null;
                
                const outputAmount = this.calculateSwapOutput(bestPool, tokenIn, tokenOut, currentAmount);
                const priceImpact = this.calculatePriceImpact(bestPool, tokenIn, currentAmount);
                const gasEstimate = this.estimateGasCost([bestPool]);
                
                totalPriceImpact += priceImpact;
                totalGas += gasEstimate;
                
                if (totalPriceImpact > constraints.maxPriceImpact) {
                    return null;
                }
                
                steps.push({
                    pool: bestPool,
                    tokenIn: { address: bestPool.token0.address, symbol: tokenIn, decimals: 18, chain: bestPool.chain },
                    tokenOut: { address: bestPool.token1.address, symbol: tokenOut, decimals: 18, chain: bestPool.chain },
                    amountIn: currentAmount,
                    amountOut: outputAmount,
                    priceImpact,
                    gasEstimate
                });
                
                currentAmount = outputAmount;
            }
            
            // Calculate profit
            const finalAmount = currentAmount;
            const profit = Number(finalAmount - amountIn) / 1e18;
            const netProfit = profit - totalGas;
            
            if (netProfit < constraints.minProfit) {
                return null;
            }
            
            const route: ArbitrageRoute = {
                id: `multihop-${path.join('-')}-${Date.now()}`,
                steps,
                totalGasEstimate: totalGas,
                estimatedProfit: netProfit,
                profitMargin: netProfit / (Number(amountIn) / 1e18),
                riskScore: this.calculateRiskScore(steps),
                liquidityUtilization: this.calculateLiquidityUtilization(steps),
                executionComplexity: steps.length > 3 ? 'complex' : 'medium',
                flashLoanRequired: true,
                crossChain: this.isCrossChain(steps),
                viabilityScore: this.calculateViabilityScore(netProfit, totalGas, totalPriceImpact, steps.length)
            };
            
            return route;
            
        } catch (error) {
            console.error('Error evaluating multi-hop path:', error);
            return null;
        }
    }

    private findBestPoolForPair(tokenA: string, tokenB: string, amountIn: bigint): Pool | null {
        const pairKey = this.createPairKey(tokenA, tokenB);
        const pools = this.poolsByPair.get(pairKey) || [];
        
        if (pools.length === 0) return null;
        
        // Find pool with best output for given input
        let bestPool: Pool | null = null;
        let bestOutput = 0n;
        
        for (const pool of pools) {
            try {
                const output = this.calculateSwapOutput(pool, tokenA, tokenB, amountIn);
                if (output > bestOutput) {
                    bestOutput = output;
                    bestPool = pool;
                }
            } catch (error) {
                // Skip pools with errors
                continue;
            }
        }
        
        return bestPool;
    }

    private async findCrossChainArbitrage(
        tokenA: string,
        tokenB: string,
        amountIn: bigint,
        constraints: RouteConstraints
    ): Promise<ArbitrageRoute[]> {
        // This would implement cross-chain arbitrage detection
        // For now, returning empty array as this requires bridge integration
        return [];
    }

    // Utility functions for calculations
    private calculateSwapOutput(pool: Pool, tokenIn: string, tokenOut: string, amountIn: bigint): bigint {
        // Simplified constant product formula (x * y = k)
        // In production, would need to handle different pool types (V2, V3, etc.)
        
        const isToken0In = pool.token0.symbol === tokenIn;
        const reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
        const reserveOut = isToken0In ? pool.reserve1 : pool.reserve0;
        
        // Add liquidity check
        if (reserveIn === 0 || reserveOut === 0) {
            throw new Error('Pool has no liquidity');
        }
        
        const amountInNum = Number(amountIn) / 1e18;
        const amountInWithFee = amountInNum * (1 - pool.fee / 1000000); // Apply fee
        
        const amountOut = (reserveOut * amountInWithFee) / (reserveIn + amountInWithFee);
        
        return BigInt(Math.floor(amountOut * 1e18));
    }

    private calculatePriceImpact(pool: Pool, tokenIn: string, amountIn: bigint): number {
        const isToken0In = pool.token0.symbol === tokenIn;
        const reserveIn = isToken0In ? pool.reserve0 : pool.reserve1;
        
        const amountInNum = Number(amountIn) / 1e18;
        return amountInNum / reserveIn; // Simple price impact calculation
    }

    private estimateGasCost(pools: Pool[]): number {
        // Estimate gas cost based on number of swaps and chains involved
        const baseGas = 150000; // Base gas for a swap
        const gasPerSwap = 80000; // Additional gas per swap
        
        const totalGas = baseGas + (pools.length - 1) * gasPerSwap;
        
        // Convert to USD (very rough estimate)
        const gasPrice = 20; // gwei
        const ethPrice = 3000; // USD
        
        return (totalGas * gasPrice * ethPrice) / 1e9;
    }

    private calculateRiskScore(steps: RouteStep[]): number {
        // Risk factors: complexity, price impact, cross-chain, liquidity
        let riskScore = 0;
        
        // Base risk increases with steps
        riskScore += steps.length * 1;
        
        // Price impact risk
        const totalPriceImpact = steps.reduce((sum, step) => sum + step.priceImpact, 0);
        riskScore += totalPriceImpact * 100;
        
        // Cross-chain risk
        if (this.isCrossChain(steps)) {
            riskScore += 3;
        }
        
        return Math.min(riskScore, 10); // Cap at 10
    }

    private calculateLiquidityUtilization(steps: RouteStep[]): number {
        // Calculate what percentage of pool liquidity we're using
        let maxUtilization = 0;
        
        for (const step of steps) {
            const amountInUSD = Number(step.amountIn) / 1e18; // Simplified
            const utilization = amountInUSD / step.pool.liquidityUSD;
            maxUtilization = Math.max(maxUtilization, utilization);
        }
        
        return maxUtilization;
    }

    private calculateViabilityScore(profit: number, gas: number, priceImpact: number, steps: number): number {
        // Composite score considering profit, costs, and risks
        const profitScore = Math.min(profit / 1000, 10); // Scale profit to 0-10
        const gasScore = Math.max(0, 10 - gas / 50); // Penalize high gas
        const impactScore = Math.max(0, 10 - priceImpact * 1000); // Penalize high impact
        const complexityScore = Math.max(0, 10 - steps * 2); // Penalize complexity
        
        return (profitScore + gasScore + impactScore + complexityScore) / 4;
    }

    private isCrossChain(steps: RouteStep[]): boolean {
        const chains = new Set(steps.map(step => step.pool.chain));
        return chains.size > 1;
    }

    private createPairKey(tokenA: string, tokenB: string): string {
        return [tokenA, tokenB].sort().join('/');
    }

    /**
     * Get the top N most profitable routes currently available
     */
    async getTopOpportunities(limit: number = 10): Promise<ArbitrageRoute[]> {
        const allRoutes: ArbitrageRoute[] = [];
        
        // Get some popular token pairs and find routes
        const popularPairs = ['ETH/USDC', 'ETH/USDT', 'WBTC/ETH', 'ARB/ETH'];
        const amount = BigInt('1000000000000000000'); // 1 ETH
        
        for (const pair of popularPairs) {
            const [tokenA, tokenB] = pair.split('/');
            const routes = await this.findArbitrageRoutes(tokenA, tokenB, amount);
            allRoutes.push(...routes);
        }
        
        return allRoutes
            .sort((a, b) => b.viabilityScore - a.viabilityScore)
            .slice(0, limit);
    }

    /**
     * Update pool data and refresh caches
     */
    updatePools(pools: Pool[]) {
        this.pools.clear();
        this.poolsByPair.clear();
        this.tokenGraph.clear();
        this.routeCache.clear();
        
        this.initializePools(pools);
        this.buildTokenGraph();
        
        console.log('🔄 Router updated with new pool data');
    }
} 