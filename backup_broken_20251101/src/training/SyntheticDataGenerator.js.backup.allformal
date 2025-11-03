/**
 * @file SyntheticDataGenerator.js
 * @description Generates synthetic arbitrage opportunities for training the AI system
 * @author AI-Flash-Loan-Arbitrage-Syndicate
 */

import { ethers } from 'ethers';
import { ArbitragePathFinder } from '../core/ArbitragePathFinder.js';
import { PoolAnalyzer } from '../analysis/PoolAnalyzer.js';
import { MultiRPCProviderManager } from '../services/MultiRPCProviderManager.js';

/**
 * SyntheticDataGenerator creates artificial but realistic arbitrage opportunities
 * based on historical blockchain data to train the AI system before deploying with real funds.
 */
export class SyntheticDataGenerator {
    /**
     * Creates a new SyntheticDataGenerator instance
     * @param {Object} config - Configuration options
     * @param {number} config.variationCount - Number of variations to generate per opportunity
     * @param {Array<number>} config.slippageVariations - Different slippage values to simulate
     * @param {Array<number>} config.gasMultipliers - Gas price multipliers to simulate
     * @param {Array<string>} config.routeComplexities - Route complexity levels ('simple', 'medium', 'complex')
     * @param {Object} config.dbPool - PostgreSQL database pool for persistence
     * @param {boolean} config.debug - Enable debug logging
     */
    constructor(config = {}) {
        this.config = {
            variationCount: config.variationCount || 5,
            slippageVariations: config.slippageVariations || [0.001, 0.005, 0.01, 0.02, 0.05],
            gasMultipliers: config.gasMultipliers || [0.8, 1.0, 1.2, 1.5, 2.0],
            routeComplexities: config.routeComplexities || ['simple', 'medium', 'complex'],
            persistToDB: config.persistToDB !== false,
            debug: config.debug || false,
            ...config
        };
        
        this.dbPool = config.dbPool;
        this.poolAnalyzer = new PoolAnalyzer({ dbPool: this.dbPool, debug: this.config.debug });
        this.pathFinder = new ArbitragePathFinder({ dbPool: this.dbPool, debug: this.config.debug });
        this.providerManager = new MultiRPCProviderManager({ debug: this.config.debug });
        
        // Token mappings for alternative path generation
        this.commonTokens = {
            // Ethereum mainnet
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDC -> USDT
            '0xdAC17F958D2ee523a2206206994597C13D831ec7': '0x6B175474E89094C44Da98b954EedeAC495271d0F', // USDT -> DAI
            '0x6B175474E89094C44Da98b954EedeAC495271d0F': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // DAI -> USDC
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WETH -> WBTC
            '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',  // WBTC -> WETH
            
            // Arbitrum
            '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDC -> USDT (Arbitrum)
            '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // USDT -> DAI (Arbitrum)
            '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // DAI -> USDC (Arbitrum)
            '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1': '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // WETH -> WBTC (Arbitrum)
            '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // WBTC -> WETH (Arbitrum)
            
            // Optimism
            '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDC -> USDT (Optimism)
            '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // USDT -> DAI (Optimism)
            '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // DAI -> USDC (Optimism)
            '0x4200000000000000000000000000000000000006': '0x68f180fcCe6836688e9084f035309E29Bf0A2095', // WETH -> WBTC (Optimism)
            '0x68f180fcCe6836688e9084f035309E29Bf0A2095': '0x4200000000000000000000000000000000000006', // WBTC -> WETH (Optimism)
            
            // Base
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913': '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDC -> USDT (Base)
            '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA': '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb', // USDT -> DAI (Base)
            '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // DAI -> USDC (Base)
            '0x4200000000000000000000000000000000000006': '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b', // WETH -> WBTC (Base)
            '0x236aa50979D5f3De3Bd1Eeb40E81137F22ab794b': '0x4200000000000000000000000000000000000006', // WBTC -> WETH (Base)
            
            // Polygon
            '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDC -> USDT (Polygon)
            '0xc2132D05D31c914a87C6611C10748AEb04B58e8F': '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // USDT -> DAI (Polygon)
            '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // DAI -> USDC (Polygon)
            '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270': '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', // WMATIC -> WBTC (Polygon)
            '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // WBTC -> WMATIC (Polygon)
            
            // BSC
            '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d': '0x55d398326f99059fF775485246999027B3197955', // USDC -> USDT (BSC)
            '0x55d398326f99059fF775485246999027B3197955': '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3', // USDT -> DAI (BSC)
            '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3': '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // DAI -> USDC (BSC)
            '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c': '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // WBNB -> BTCB (BSC)
            '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BTCB -> WBNB (BSC)
        };
        
        // Initialize metrics tracking
        this.metrics = {
            generatedOpportunities: 0,
            successfulSimulations: 0,
            failedSimulations: 0,
            averageProfitability: 0,
            totalGenerationTimeMs: 0,
            lastGenerationBatch: null
        };
    }

    /**
     * Initializes the generator by setting up required connections
     */
    async initialize() {
        if (this.config.debug) console.log('🔄 Initializing SyntheticDataGenerator...');
        
        // Initialize provider manager
        await this.providerManager.initialize();
        
        // Create database tables if needed
        if (this.config.persistToDB && this.dbPool) {
            await this._ensureDatabaseTables();
        }
        
        if (this.config.debug) console.log('✅ SyntheticDataGenerator initialized');
    }

    /**
     * Generates synthetic arbitrage opportunities from historical blocks
     * @param {Array} blocks - Array of historical blocks with transactions
     * @param {Object} options - Generation options
     * @returns {Array} Generated arbitrage opportunities
     */
    async generateFromBlocks(blocks, options = {}) {
        const startTime = Date.now();
        const opportunities = [];
        
        if (this.config.debug) console.log(`🔄 Generating opportunities from ${blocks.length} blocks...`);
        
        for (const block of blocks) {
            try {
                // Extract pool states from this block
                const poolStates = await this._extractPoolStates(block);
                
                if (poolStates.length === 0) {
                    if (this.config.debug) console.log(`⚠️ No pool states extracted from block ${block.number} on ${block.chain}`);
                    continue;
                }
                
                // Find potential arbitrage paths
                const paths = await this.pathFinder.findArbitragePaths(poolStates, {
                    chain: block.chain,
                    blockNumber: block.number
                });
                
                if (paths.length === 0) {
                    if (this.config.debug) console.log(`⚠️ No arbitrage paths found in block ${block.number} on ${block.chain}`);
                    continue;
                }
                
                // Generate variations for each path
                for (const path of paths) {
                    const variations = this._generateVariations(path, block);
                    opportunities.push(...variations);
                    
                    // Update metrics
                    this.metrics.generatedOpportunities += variations.length;
                }
            } catch (error) {
                console.error(`❌ Error generating opportunities for block ${block.number} on ${block.chain}:`, error);
            }
        }
        
        // Store generated opportunities if configured
        if (this.config.persistToDB && this.dbPool && opportunities.length > 0) {
            await this._storeOpportunities(opportunities);
        }
        
        // Update metrics
        this.metrics.totalGenerationTimeMs += (Date.now() - startTime);
        this.metrics.lastGenerationBatch = {
            timestamp: Date.now(),
            count: opportunities.length,
            blockCount: blocks.length
        };
        
        if (this.config.debug) console.log(`✅ Generated ${opportunities.length} synthetic opportunities`);
        
        return opportunities;
    }

    /**
     * Extracts pool states from transactions in a block
     * @param {Object} block - Block data with transactions
     * @returns {Array} Pool states extracted from the block
     * @private
     */
    async _extractPoolStates(block) {
        const poolStates = [];
        
        // Extract swap events from transactions
        const swapEvents = await this._extractSwapEvents(block);
        
        // Get unique pool addresses from swap events
        const poolAddresses = [...new Set(swapEvents.map(event => event.poolAddress))];
        
        // Get pool states for each address
        for (const poolAddress of poolAddresses) {
            try {
                const poolState = await this.poolAnalyzer.getPoolState(
                    poolAddress,
                    block.chain,
                    block.number
                );
                
                if (poolState) {
                    poolStates.push(poolState);
                }
            } catch (error) {
                if (this.config.debug) {
                    console.error(`❌ Error getting pool state for ${poolAddress} on ${block.chain}:`, error);
                }
            }
        }
        
        return poolStates;
    }

    /**
     * Extracts swap events from transactions in a block
     * @param {Object} block - Block data with transactions
     * @returns {Array} Swap events extracted from transactions
     * @private
     */
    async _extractSwapEvents(block) {
        const swapEvents = [];
        
        // Get provider for this chain
        const provider = this.providerManager.getProvider(block.chain);
        if (!provider) {
            console.error(`❌ No provider available for chain: ${block.chain}`);
            return swapEvents;
        }
        
        // Process each transaction in the block
        for (const tx of block.transactions) {
            try {
                // Skip transactions without 'to' address (contract deployments)
                if (!tx.to) continue;
                
                // Get transaction receipt
                const receipt = await provider.getTransactionReceipt(tx.hash);
                if (!receipt) continue;
                
                // Process logs in the receipt
                for (const log of receipt.logs) {
                    // Check if this is a swap event
                    if (this._isSwapEvent(log)) {
                        swapEvents.push({
                            poolAddress: log.address,
                            transactionHash: tx.hash,
                            logIndex: log.logIndex,
                            blockNumber: block.number,
                            chain: block.chain
                        });
                    }
                }
            } catch (error) {
                if (this.config.debug) {
                    console.error(`❌ Error processing transaction ${tx.hash}:`, error);
                }
            }
        }
        
        return swapEvents;
    }

    /**
     * Checks if a log entry is a swap event
     * @param {Object} log - Log entry from transaction receipt
     * @returns {boolean} True if the log is a swap event
     * @private
     */
    _isSwapEvent(log) {
        // Common swap event signatures
        const swapEventSignatures = [
            // Uniswap V2 Swap
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
            // Uniswap V3 Swap
            '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
            // SushiSwap Swap
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
            // PancakeSwap Swap
            '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
            // Balancer Swap
            '0x908fb5ee8f16c6bc9bc3690973819f32a4d4b10188134543c88706e0e1d43378',
            // Curve Exchange
            '0xd013ca23e77a65003c2c659c5442c00c805371b7fc1ebd4c206c41d1536bd90b'
        ];
        
        // Check if the log's first topic matches any swap event signature
        return log.topics && log.topics.length > 0 && swapEventSignatures.includes(log.topics[0]);
    }

    /**
     * Generates variations of an arbitrage path with different parameters
     * @param {Object} path - Base arbitrage path
     * @param {Object} block - Block data
     * @returns {Array} Variations of the arbitrage path
     * @private
     */
    _generateVariations(path, block) {
        const variations = [];
        
        // Generate variations with different parameters
        for (const slippage of this.config.slippageVariations) {
            for (const gasMultiplier of this.config.gasMultipliers) {
                for (const complexity of this.config.routeComplexities) {
                    // Create variation
                    const variation = {
                        ...path,
                        chain: block.chain,
                        blockNumber: block.number,
                        timestamp: block.timestamp,
                        slippage,
                        gasPrice: this._calculateGasPrice(block, gasMultiplier),
                        complexity,
                        synthetic: true,
                        generatedAt: Date.now()
                    };
                    
                    // Add additional paths for complex routes
                    if (complexity === 'medium' || complexity === 'complex') {
                        variation.alternativePaths = this._generateAlternativePaths(path, complexity);
                    }
                    
                    variations.push(variation);
                }
            }
        }
        
        return variations;
    }

    /**
     * Calculates gas price based on block data and multiplier
     * @param {Object} block - Block data
     * @param {number} multiplier - Gas price multiplier
     * @returns {string} Calculated gas price
     * @private
     */
    _calculateGasPrice(block, multiplier) {
        // Use base fee if available, otherwise use average gas price
        const basePrice = block.baseFeePerGas ? 
            BigInt(block.baseFeePerGas) : 
            block.gasPrice ? 
                BigInt(block.gasPrice) : 
                BigInt('20000000000'); // Default 20 gwei
        
        // Apply multiplier
        return (basePrice * BigInt(Math.floor(multiplier * 100)) / BigInt(100)).toString();
    }

    /**
     * Generates alternative paths for complex routes
     * @param {Object} basePath - Base arbitrage path
     * @param {string} complexity - Route complexity ('medium' or 'complex')
     * @returns {Array} Alternative paths
     * @private
     */
    _generateAlternativePaths(basePath, complexity) {
        const alternativePaths = [];
        
        if (complexity === 'medium') {
            // Add one alternative path with a different intermediate token
            alternativePaths.push(this._createAlternativePath(basePath, 1));
        } else if (complexity === 'complex') {
            // Add multiple alternative paths with different intermediate tokens
            alternativePaths.push(this._createAlternativePath(basePath, 1));
            alternativePaths.push(this._createAlternativePath(basePath, 2));
        }
        
        return alternativePaths;
    }

    /**
     * Creates an alternative path by modifying the base path
     * @param {Object} basePath - Base arbitrage path
     * @param {number} complexity - Complexity level (1 or 2)
     * @returns {Object} Alternative path
     * @private
     */
    _createAlternativePath(basePath, complexity) {
        // Create a deep copy of the base path
        const alternativePath = JSON.parse(JSON.stringify(basePath));
        
        // Modify path based on complexity
        if (complexity === 1) {
            // Change intermediate token
            if (alternativePath.path && alternativePath.path.length > 2) {
                const intermediateTokenIndex = Math.floor(alternativePath.path.length / 2);
                const currentToken = alternativePath.path[intermediateTokenIndex].tokenAddress;
                alternativePath.path[intermediateTokenIndex].tokenAddress = this._getAlternativeToken(currentToken);
            }
        } else if (complexity === 2) {
            // Add additional hop
            if (alternativePath.path && alternativePath.path.length > 1) {
                const insertIndex = Math.floor(alternativePath.path.length / 2);
                const newToken = this._getAlternativeToken(alternativePath.path[insertIndex - 1].tokenAddress);
                
                alternativePath.path.splice(insertIndex, 0, {
                    tokenAddress: newToken,
                    poolAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
                    dex: this._getRandomDex(alternativePath.chain)
                });
            }
        }
        
        return alternativePath;
    }

    /**
     * Gets an alternative token for path variation
     * @param {string} currentToken - Current token address
     * @returns {string} Alternative token address
     * @private
     */
    _getAlternativeToken(currentToken) {
        // Check if we have a mapping for this token
        if (this.commonTokens[currentToken]) {
            return this.commonTokens[currentToken];
        }
        
        // Generate a random token address if no mapping exists
        return `0x${Math.random().toString(16).substring(2, 42)}`;
    }

    /**
     * Gets a random DEX name for the specified chain
     * @param {string} chain - Blockchain name
     * @returns {string} Random DEX name
     * @private
     */
    _getRandomDex(chain) {
        const dexesByChain = {
            ethereum: [
                'uniswap_v3', 'uniswap_v2', 'sushiswap', 'curve', 'balancer', 
                'pancakeswap', '1inch', 'shibaswap', 'kyberswap', 'dodo'
            ],
            arbitrum: [
                'uniswap_v3', 'sushiswap', 'camelot', 'ramses', 'trader_joe',
                'balancer', 'curve', 'pancakeswap', 'kyberswap', 'dodo', 
                'gmx', '1inch', 'swapr', 'saddle'
            ],
            optimism: [
                'uniswap_v3', 'velodrome', 'curve', 'sushiswap', 'kyberswap',
                'synthetix', 'clipper', 'beethoven_x', '1inch', 'zipswap',
                'rubicon', 'woofi', 'slingshot'
            ],
            base: [
                'uniswap_v3', 'baseswap', 'aerodrome', 'curve', 'balancer',
                'pancakeswap', 'sushiswap', 'kyberswap', 'dodo', 'woofi',
                'alienbase', 'horizon', 'maverick'
            ],
            polygon: [
                'uniswap_v3', 'quickswap', 'sushiswap', 'balancer', 'curve',
                'kyberswap', 'dodo', 'uniswap_v2', 'meshswap', 'dfyn',
                'cometh', 'polycat', 'gravity', 'wault'
            ],
            bsc: [
                'pancakeswap', 'thena', 'biswap', 'sushiswap', 'babyswap',
                'apeswap', 'mdex', 'kyberswap', 'ellipsis', '1inch', 
                'bakeryswap', 'dodo', 'woofi', 'mcdex', 'unifi',
                'pancakeswap_v1', 'burgerswap', 'jetswap', 'autoshark'
            ]
        };
        
        // Normalize chain name to lowercase and handle chain aliases
        const normalizedChain = chain.toLowerCase();
        const chainKey = normalizedChain === 'binance_smart_chain' ? 'bsc' : normalizedChain;
        
        // Get DEXes for chain or fall back to Ethereum if chain not supported
        const dexes = dexesByChain[chainKey] || dexesByChain.ethereum;
        return dexes[Math.floor(Math.random() * dexes.length)];
    }

    /**
     * Ensures required database tables exist
     * @private
     */
    async _ensureDatabaseTables() {
        if (!this.dbPool) return;
        
        try {
            await this.dbPool.query(`
                CREATE TABLE IF NOT EXISTS synthetic_arbitrage_opportunities (
                    id SERIAL PRIMARY KEY,
                    chain VARCHAR(50) NOT NULL,
                    block_number BIGINT NOT NULL,
                    timestamp BIGINT NOT NULL,
                    path JSONB NOT NULL,
                    slippage DECIMAL(10, 6) NOT NULL,
                    gas_price VARCHAR(100) NOT NULL,
                    complexity VARCHAR(20) NOT NULL,
                    alternative_paths JSONB,
                    expected_profit_usd DECIMAL(20, 8),
                    generated_at BIGINT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_synthetic_opportunities_chain ON synthetic_arbitrage_opportunities(chain);
                CREATE INDEX IF NOT EXISTS idx_synthetic_opportunities_complexity ON synthetic_arbitrage_opportunities(complexity);
            `);
            
            if (this.config.debug) console.log('✅ Database tables created or verified');
        } catch (error) {
            console.error('❌ Error ensuring database tables:', error);
        }
    }

    /**
     * Stores generated opportunities in the database
     * @param {Array} opportunities - Generated arbitrage opportunities
     * @private
     */
    async _storeOpportunities(opportunities) {
        if (!this.dbPool) return;
        
        try {
            // Prepare batch insert
            const values = opportunities.map(opp => ({
                chain: opp.chain,
                block_number: opp.blockNumber,
                timestamp: opp.timestamp,
                path: JSON.stringify(opp.path),
                slippage: opp.slippage,
                gas_price: opp.gasPrice,
                complexity: opp.complexity,
                alternative_paths: opp.alternativePaths ? JSON.stringify(opp.alternativePaths) : null,
                expected_profit_usd: opp.expectedProfitUsd || null,
                generated_at: opp.generatedAt
            }));
            
            // Insert in batches to avoid query size limits
            const batchSize = 100;
            for (let i = 0; i < values.length; i += batchSize) {
                const batch = values.slice(i, i + batchSize);
                
                // Build query
                const placeholders = batch.map((_, idx) => 
                    `($${idx * 10 + 1}, $${idx * 10 + 2}, $${idx * 10 + 3}, $${idx * 10 + 4}, $${idx * 10 + 5}, $${idx * 10 + 6}, $${idx * 10 + 7}, $${idx * 10 + 8}, $${idx * 10 + 9}, $${idx * 10 + 10})`
                ).join(', ');
                
                const params = batch.flatMap(v => [
                    v.chain, v.block_number, v.timestamp, v.path, 
                    v.slippage, v.gas_price, v.complexity, v.alternative_paths,
                    v.expected_profit_usd, v.generated_at
                ]);
                
                await this.dbPool.query(`
                    INSERT INTO synthetic_arbitrage_opportunities
                    (chain, block_number, timestamp, path, slippage, gas_price, complexity, alternative_paths, expected_profit_usd, generated_at)
                    VALUES ${placeholders}
                `, params);
            }
            
            if (this.config.debug) console.log(`✅ Stored ${opportunities.length} opportunities in database`);
        } catch (error) {
            console.error('❌ Error storing opportunities in database:', error);
        }
    }

    /**
     * Gets metrics about generated opportunities
     * @returns {Object} Generation metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            averageGenerationTimePerBlock: this.metrics.totalGenerationTimeMs / 
                (this.metrics.lastGenerationBatch?.blockCount || 1)
        };
    }
}
