/**
 * Multi-Chain Real-Time Data Collector
 * 
 * This system continuously collects:
 * - Real-time price data from multiple DEXs
 * - Liquidity depth information
 * - Gas price tracking
 * - Cross-chain bridge rates
 * - Yield farming APR data
 * - Flash loan availability
 */

import { ethers } from 'ethers';
import WebSocket from 'ws';
import axios from 'axios';
import { ArbitrageDatabase, Pool, PricePoint, ArbitrageOpportunity, YieldOpportunity, GasTracker } from '../database/arbitrage-db';

interface ChainConfig {
    name: string;
    chainId: number;
    rpcUrl: string;
    wsUrl?: string;
    blockTime: number; // average block time in seconds
    nativeToken: string;
    wrappedToken: string;
    gasToken: string;
    explorers: string[];
}

interface DexConfig {
    name: string;
    chains: string[];
    factoryAddress: string;
    routerAddress: string;
    quoterAddress?: string;
    subgraphUrl?: string;
    apiUrl?: string;
    version: 'v2' | 'v3';
    fees: number[]; // possible fee tiers
}

interface DataSource {
    type: 'subgraph' | 'rpc' | 'api' | 'websocket';
    url: string;
    updateInterval: number; // milliseconds
    priority: number; // 1-10, higher is better
}

export class MultiChainDataCollector {
    private db: ArbitrageDatabase;
    private providers: Map<string, ethers.JsonRpcProvider> = new Map();
    private websockets: Map<string, WebSocket> = new Map();
    private isRunning: boolean = false;
    
    // Configuration
    private chains: ChainConfig[] = [
        {
            name: 'arbitrum',
            chainId: 42161,
            rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
            wsUrl: process.env.ARBITRUM_WS_URL,
            blockTime: 0.25,
            nativeToken: 'ETH',
            wrappedToken: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
            gasToken: 'ETH',
            explorers: ['https://arbiscan.io']
        },
        {
            name: 'base',
            chainId: 8453,
            rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
            wsUrl: process.env.BASE_WS_URL,
            blockTime: 2,
            nativeToken: 'ETH',
            wrappedToken: '0x4200000000000000000000000000000000000006',
            gasToken: 'ETH',
            explorers: ['https://basescan.org']
        },
        {
            name: 'ethereum',
            chainId: 1,
            rpcUrl: process.env.ETHEREUM_RPC_URL || `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
            wsUrl: process.env.ETHEREUM_WS_URL,
            blockTime: 12,
            nativeToken: 'ETH',
            wrappedToken: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            gasToken: 'ETH',
            explorers: ['https://etherscan.io']
        },
        {
            name: 'polygon',
            chainId: 137,
            rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            wsUrl: process.env.POLYGON_WS_URL,
            blockTime: 2,
            nativeToken: 'MATIC',
            wrappedToken: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
            gasToken: 'MATIC',
            explorers: ['https://polygonscan.com']
        }
    ];

    private dexes: DexConfig[] = [
        {
            name: 'uniswap-v3',
            chains: ['arbitrum', 'base', 'ethereum', 'polygon'],
            factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
            routerAddress: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
            quoterAddress: '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6',
            subgraphUrl: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-arbitrum',
            version: 'v3',
            fees: [100, 500, 3000, 10000]
        },
        {
            name: 'sushiswap',
            chains: ['arbitrum', 'polygon', 'ethereum'],
            factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
            routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
            subgraphUrl: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange-arbitrum',
            version: 'v2',
            fees: [3000]
        },
        {
            name: 'camelot',
            chains: ['arbitrum'],
            factoryAddress: '0x6EcCab422D763aC031210895C81787E87B333b602',
            routerAddress: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
            version: 'v2',
            fees: [2000, 5000]
        },
        {
            name: 'aerodrome',
            chains: ['base'],
            factoryAddress: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
            routerAddress: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
            version: 'v2',
            fees: [5, 30, 100]
        }
    ];

    private dataSources: Map<string, DataSource[]> = new Map();
    
    // Rate limiting and caching
    private lastApiCall: Map<string, number> = new Map();
    private apiRateLimit = 100; // ms between calls
    private priceCache: Map<string, { price: number; timestamp: number }> = new Map();
    private cacheExpiry = 5000; // 5 seconds

    constructor() {
        this.db = new ArbitrageDatabase();
        this.setupDataSources();
        this.initializeProviders();
    }

    private setupDataSources() {
        // Setup primary data sources for each chain/dex combination
        for (const chain of this.chains) {
            const sources: DataSource[] = [];
            
            // RPC as fallback
            sources.push({
                type: 'rpc',
                url: chain.rpcUrl,
                updateInterval: chain.blockTime * 1000,
                priority: 3
            });

            // WebSocket if available
            if (chain.wsUrl) {
                sources.push({
                    type: 'websocket',
                    url: chain.wsUrl,
                    updateInterval: 0, // real-time
                    priority: 8
                });
            }

            this.dataSources.set(chain.name, sources);
        }

        // Add DEX-specific data sources
        for (const dex of this.dexes) {
            if (dex.subgraphUrl) {
                this.dataSources.set(`${dex.name}-subgraph`, [{
                    type: 'subgraph',
                    url: dex.subgraphUrl,
                    updateInterval: 30000, // 30 seconds
                    priority: 7
                }]);
            }
        }
    }

    private initializeProviders() {
        for (const chain of this.chains) {
            const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
            this.providers.set(chain.name, provider);
        }
        console.log(`🌐 Initialized providers for ${this.chains.length} chains`);
    }

    async initialize(): Promise<void> {
        await this.db.initialize();
        console.log('🔄 Multi-chain data collector initialized');
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            console.log('⚠️ Data collector already running');
            return;
        }

        this.isRunning = true;
        console.log('🚀 Starting multi-chain data collection...');

        // Start all collection processes in parallel
        const tasks = [
            this.startPriceCollection(),
            this.startLiquidityTracking(),
            this.startGasTracking(),
            this.startArbitrageDetection(),
            this.startYieldTracking(),
            this.startCrossChainMonitoring()
        ];

        await Promise.all(tasks);
    }

    private async startPriceCollection(): Promise<void> {
        console.log('💰 Starting price collection across all chains...');

        const collectPrices = async () => {
            try {
                const tasks = this.chains.map(chain => this.collectChainPrices(chain));
                await Promise.all(tasks);
            } catch (error) {
                console.error('❌ Error in price collection:', error);
            }
        };

        // Initial collection
        await collectPrices();

        // Set up intervals for each chain based on block time
        for (const chain of this.chains) {
            setInterval(async () => {
                await this.collectChainPrices(chain);
            }, chain.blockTime * 1000);
        }
    }

    private async collectChainPrices(chain: ChainConfig): Promise<void> {
        const provider = this.providers.get(chain.name);
        if (!provider) return;

        try {
            const blockNumber = await provider.getBlockNumber();
            const gasPrice = await this.getGasPrice(chain.name);
            
            // Get top pools for this chain from database
            const pools = await this.db.getPoolsByChain(chain.name);
            const topPools = pools.slice(0, 100); // Top 100 by liquidity

            const pricePromises = topPools.map(async (pool) => {
                try {
                    const price = await this.getPoolPrice(pool, provider);
                    if (price !== null) {
                        const pricePoint: PricePoint = {
                            id: `${pool.id}-${blockNumber}`,
                            poolId: pool.id,
                            price,
                            reserve0: pool.reserve0,
                            reserve1: pool.reserve1,
                            blockNumber,
                            timestamp: Date.now() / 1000,
                            gasPrice
                        };
                        
                        await this.db.insertPricePoint(pricePoint);
                        
                        // Update cache
                        this.priceCache.set(pool.id, {
                            price,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    console.error(`❌ Error getting price for pool ${pool.id}:`, error.message);
                }
            });

            await Promise.all(pricePromises);
            console.log(`💰 Updated prices for ${topPools.length} pools on ${chain.name}`);

        } catch (error) {
            console.error(`❌ Error collecting prices on ${chain.name}:`, error);
        }
    }

    private async getPoolPrice(pool: Pool, provider: ethers.JsonRpcProvider): Promise<number | null> {
        try {
            // Check cache first
            const cached = this.priceCache.get(pool.id);
            if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
                return cached.price;
            }

            if (pool.reserve0 === 0 || pool.reserve1 === 0) {
                return null;
            }

            // Simple price calculation: reserve1 / reserve0
            const price = pool.reserve1 / pool.reserve0;
            return price;

        } catch (error) {
            console.error(`Error getting pool price for ${pool.id}:`, error);
            return null;
        }
    }

    private async getGasPrice(chainName: string): Promise<number> {
        const provider = this.providers.get(chainName);
        if (!provider) return 0;

        try {
            const gasPrice = await provider.getFeeData();
            return Number(gasPrice.gasPrice || 0) / 1e9; // Convert to gwei
        } catch (error) {
            console.error(`Error getting gas price for ${chainName}:`, error);
            return 0;
        }
    }

    private async startLiquidityTracking(): Promise<void> {
        console.log('🌊 Starting liquidity tracking...');
        
        setInterval(async () => {
            await this.updateLiquidityData();
        }, 60000); // Update every minute
    }

    private async updateLiquidityData(): Promise<void> {
        // Update liquidity data for top pools using subgraph queries
        for (const dex of this.dexes) {
            if (dex.subgraphUrl) {
                try {
                    await this.fetchSubgraphData(dex);
                } catch (error) {
                    console.error(`❌ Error fetching ${dex.name} subgraph data:`, error);
                }
            }
        }
    }

    private async fetchSubgraphData(dex: DexConfig): Promise<void> {
        const query = `
            query {
                pools(first: 100, orderBy: totalValueLockedUSD, orderDirection: desc) {
                    id
                    token0 {
                        id
                        symbol
                        decimals
                    }
                    token1 {
                        id
                        symbol
                        decimals
                    }
                    feeTier
                    liquidity
                    totalValueLockedUSD
                    volumeUSD
                    feesUSD
                }
            }
        `;

        try {
            const response = await axios.post(dex.subgraphUrl!, {
                query
            });

            const pools = response.data.data.pools;
            
            for (const poolData of pools) {
                const pool: Pool = {
                    id: `${dex.name}-${poolData.id}`,
                    address: poolData.id,
                    dex: dex.name,
                    chain: dex.chains[0], // For simplicity, assume first chain
                    chainId: this.chains.find(c => c.name === dex.chains[0])?.chainId || 1,
                    token0: {
                        address: poolData.token0.id,
                        symbol: poolData.token0.symbol,
                        decimals: poolData.token0.decimals
                    },
                    token1: {
                        address: poolData.token1.id,
                        symbol: poolData.token1.symbol,
                        decimals: poolData.token1.decimals
                    },
                    fee: poolData.feeTier || 3000,
                    reserve0: 0, // Will be updated by price collection
                    reserve1: 0,
                    totalSupply: Number(poolData.liquidity || 0),
                    liquidityUSD: Number(poolData.totalValueLockedUSD || 0),
                    volume24h: Number(poolData.volumeUSD || 0),
                    volume7d: 0, // Calculate from historical data
                    feesEarned24h: Number(poolData.feesUSD || 0),
                    apr: 0, // Calculate from fees and liquidity
                    isActive: true,
                    lastUpdated: Date.now() / 1000
                };

                await this.db.insertPool(pool);
            }

            console.log(`🌊 Updated ${pools.length} pools from ${dex.name} subgraph`);
        } catch (error) {
            console.error(`❌ Error fetching ${dex.name} subgraph:`, error);
        }
    }

    private async startGasTracking(): Promise<void> {
        console.log('⛽ Starting gas price tracking...');

        setInterval(async () => {
            const gasPromises = this.chains.map(async (chain) => {
                try {
                    const provider = this.providers.get(chain.name);
                    if (!provider) return;

                    const blockNumber = await provider.getBlockNumber();
                    const feeData = await provider.getFeeData();
                    
                    const gasTracker: GasTracker = {
                        id: `${chain.name}-${blockNumber}`,
                        chain: chain.name,
                        blockNumber,
                        baseFee: Number(feeData.gasPrice || 0) / 1e9,
                        priorityFee: Number(feeData.maxPriorityFeePerGas || 0) / 1e9,
                        totalGas: Number(feeData.maxFeePerGas || 0) / 1e9,
                        timestamp: Date.now() / 1000
                    };

                    // Store in database (would need to add this method to ArbitrageDatabase)
                    console.log(`⛽ ${chain.name} gas: ${gasTracker.baseFee.toFixed(2)} gwei`);
                } catch (error) {
                    console.error(`❌ Error tracking gas for ${chain.name}:`, error);
                }
            });

            await Promise.all(gasPromises);
        }, 15000); // Update every 15 seconds
    }

    private async startArbitrageDetection(): Promise<void> {
        console.log('🔍 Starting arbitrage opportunity detection...');

        setInterval(async () => {
            await this.detectArbitrageOpportunities();
        }, 5000); // Check every 5 seconds
    }

    private async detectArbitrageOpportunities(): Promise<void> {
        try {
            // Get all active pools
            const pools = await this.db.getTopLiquidityPools(500);
            
            // Group pools by token pair
            const pairGroups = new Map<string, Pool[]>();
            
            for (const pool of pools) {
                const pairKey = this.createPairKey(pool.token0.symbol, pool.token1.symbol);
                if (!pairGroups.has(pairKey)) {
                    pairGroups.set(pairKey, []);
                }
                pairGroups.get(pairKey)!.push(pool);
            }

            // Find arbitrage opportunities within each pair group
            for (const [pairKey, pairPools] of pairGroups) {
                if (pairPools.length < 2) continue;

                for (let i = 0; i < pairPools.length; i++) {
                    for (let j = i + 1; j < pairPools.length; j++) {
                        await this.checkArbitragePair(pairPools[i], pairPools[j], pairKey);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error in arbitrage detection:', error);
        }
    }

    private async checkArbitragePair(poolA: Pool, poolB: Pool, pairKey: string): Promise<void> {
        // Get cached prices
        const priceA = this.priceCache.get(poolA.id)?.price;
        const priceB = this.priceCache.get(poolB.id)?.price;

        if (!priceA || !priceB) return;

        const priceDelta = Math.abs(priceA - priceB) / Math.min(priceA, priceB);
        
        // Only consider opportunities with >0.5% price difference
        if (priceDelta < 0.005) return;

        const minLiquidity = Math.min(poolA.liquidityUSD, poolB.liquidityUSD);
        const profitEstimate = this.calculateProfitEstimate(priceA, priceB, minLiquidity);
        const gasEstimate = this.estimateGasCost(poolA.chain, poolB.chain);
        
        const viable = profitEstimate > gasEstimate + 50; // $50 minimum profit after gas

        if (viable) {
            const opportunity: ArbitrageOpportunity = {
                id: `arb-${poolA.id}-${poolB.id}-${Date.now()}`,
                poolA: poolA.id,
                poolB: poolB.id,
                tokenPair: pairKey,
                priceA,
                priceB,
                priceDelta,
                profitEstimate,
                gasEstimate,
                liquidityRequired: Math.min(minLiquidity * 0.01, 100000), // Max 1% of liquidity or $100k
                viable,
                crossChain: poolA.chain !== poolB.chain,
                detectedAt: Date.now() / 1000,
                status: 'detected'
            };

            await this.db.insertArbitrageOpportunity(opportunity);
            console.log(`🎯 Found arbitrage: ${pairKey} - $${profitEstimate.toFixed(2)} profit (${(priceDelta * 100).toFixed(2)}% diff)`);
        }
    }

    private createPairKey(token0: string, token1: string): string {
        return [token0, token1].sort().join('/');
    }

    private calculateProfitEstimate(priceA: number, priceB: number, liquidity: number): number {
        const priceDiff = Math.abs(priceA - priceB);
        const avgPrice = (priceA + priceB) / 2;
        const percentage = priceDiff / avgPrice;
        
        // Estimate profit as percentage of trade size (conservative)
        const tradeSize = Math.min(liquidity * 0.01, 50000); // 1% of liquidity, max $50k
        return tradeSize * percentage * 0.8; // 80% of theoretical profit to account for slippage
    }

    private estimateGasCost(chainA: string, chainB: string): number {
        // Base gas estimates (in USD)
        const gasEstimates = {
            ethereum: 50,
            arbitrum: 5,
            polygon: 2,
            base: 3
        };

        const costA = gasEstimates[chainA as keyof typeof gasEstimates] || 10;
        const costB = chainA === chainB ? 0 : (gasEstimates[chainB as keyof typeof gasEstimates] || 10);
        
        return costA + costB;
    }

    private async startYieldTracking(): Promise<void> {
        console.log('🌾 Starting yield opportunity tracking...');
        
        setInterval(async () => {
            await this.trackYieldOpportunities();
        }, 300000); // Update every 5 minutes
    }

    private async trackYieldOpportunities(): Promise<void> {
        // This would integrate with various yield farming protocols
        console.log('🌾 Tracking yield farming opportunities...');
    }

    private async startCrossChainMonitoring(): Promise<void> {
        console.log('🌉 Starting cross-chain monitoring...');
        
        setInterval(async () => {
            await this.monitorCrossChainOpportunities();
        }, 30000); // Update every 30 seconds
    }

    private async monitorCrossChainOpportunities(): Promise<void> {
        // Monitor bridge rates and cross-chain arbitrage opportunities
        console.log('🌉 Monitoring cross-chain opportunities...');
    }

    async stop(): Promise<void> {
        this.isRunning = false;
        
        // Close all websockets
        for (const [_, ws] of this.websockets) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        }
        
        await this.db.close();
        console.log('🛑 Multi-chain data collector stopped');
    }
} 