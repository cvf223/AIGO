/**
 * types.js
 * 
 * Type definitions for AlphaGo Elite arbitrage system
 * Using JSDoc comments for type documentation
 */

/**
 * @typedef {Object} AgentCapability
 * @property {string} name - Capability name
 * @property {number} proficiency - Proficiency level (0-1)
 * @property {string} category - Capability category
 * @property {string} [description] - Optional description
 */

/**
 * @typedef {Object} CapabilityAwarenessConfig
 * @property {boolean} forceAwareness - Force awareness mode
 * @property {boolean} disableFakeDataClaims - Disable fake data claims
 * @property {boolean} verboseLogging - Enable verbose logging
 */

/**
 * @typedef {Object} ExpertiseRequest
 * @property {string} id - Request ID
 * @property {string} requestingAgentId - Requesting agent ID
 * @property {string} topic - Topic of request
 * @property {string} question - Question being asked
 * @property {string[]} [targetAgentIds] - Target agent IDs
 * @property {number} timestamp - Request timestamp
 * @property {string} status - Request status
 * @property {ExpertiseResponse[]} responses - Responses received
 */

/**
 * @typedef {Object} ExpertiseResponse
 * @property {string} agentId - Responding agent ID
 * @property {string} response - Response text
 * @property {number} confidenceScore - Confidence score
 * @property {number} timestamp - Response timestamp
 */

/**
 * @typedef {Object} CollectiveKnowledgeEntry
 * @property {string} id - Entry ID
 * @property {string} source - Source agent ID
 * @property {string} sourceType - Source type ('agent', 'collective', etc.)
 * @property {string} category - Knowledge category
 * @property {any} content - Knowledge content
 * @property {number} confidence - Confidence level (0-1)
 * @property {number} successRate - Success rate (0-1)
 * @property {Date} timestamp - Creation timestamp
 * @property {string[]} applicability - Applicability scope
 */

/**
 * Strategy types for arbitrage agents
 * @typedef {'VelocityHunter' | 'ProfitMaximizer' | 'SafetyFirst' | 'LiquidityMaster' | 'GasOptimizer' | 'AdaptiveExplorer'} StrategyType
 */

/**
 * @typedef {Object} EliteAgentConfig
 * @property {string} agentId - Unique agent identifier
 * @property {string} name - Agent name
 * @property {StrategyType} strategyType - Strategy type
 * @property {AgentCapability[]} capabilities - Agent capabilities
 * @property {number} [learningRate] - Learning rate (default: 0.1)
 * @property {number} [explorationRate] - Exploration rate (default: 0.2)
 * @property {number} [riskTolerance] - Risk tolerance (default: 0.5)
 * @property {Object} [initialWeights] - Initial strategy weights
 */

/**
 * @typedef {Object} ArbitrageOpportunity
 * @property {string} id - Opportunity ID
 * @property {number} timestamp - Timestamp
 * @property {string} tokenPair - Token pair (e.g., 'WETH/USDC')
 * @property {string} poolA - Pool A identifier
 * @property {string} poolB - Pool B identifier
 * @property {number} priceA - Price in pool A
 * @property {number} priceB - Price in pool B
 * @property {number} spread - Price spread percentage
 * @property {number} estimatedProfit - Estimated profit
 * @property {number} gasEstimate - Gas cost estimate
 * @property {number} competition - Competition level (0-1)
 * @property {number} confidence - Opportunity confidence (0-1)
 * @property {number} liquidityA - Liquidity in pool A
 * @property {number} liquidityB - Liquidity in pool B
 * @property {string} dexA - DEX A identifier
 * @property {string} dexB - DEX B identifier
 */

/**
 * @typedef {Object} ExecutionResult
 * @property {boolean} success - Execution success status
 * @property {number} profit - Profit/loss amount
 * @property {number} gasUsed - Gas used
 * @property {number} executionTime - Execution time in milliseconds
 * @property {string} [txHash] - Transaction hash (if successful)
 * @property {string} [error] - Error message (if failed)
 */

/**
 * @typedef {Object} LearningExperience
 * @property {string} opportunityId - Opportunity ID
 * @property {string} tokenPair - Token pair
 * @property {string} state - State representation
 * @property {string} action - Action taken
 * @property {number} reward - Reward received
 * @property {string} nextState - Next state representation
 * @property {number} timestamp - Timestamp
 */

/**
 * @typedef {Object} StrategyWeights
 * @property {number} speed - Speed priority weight
 * @property {number} profit - Profit priority weight
 * @property {number} safety - Safety priority weight
 * @property {number} liquidity - Liquidity priority weight
 * @property {number} gas - Gas efficiency priority weight
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} totalTrades - Total number of trades
 * @property {number} successfulTrades - Number of successful trades
 * @property {number} totalProfit - Total profit earned
 * @property {number} averageProfit - Average profit per trade
 * @property {number} winRate - Win rate (0-1)
 */

/**
 * @typedef {Object} EliteAgent
 * @property {string} id - Agent ID
 * @property {string} name - Agent name
 * @property {StrategyType} strategyType - Strategy type
 * @property {Object} weights - Strategy weights
 * @property {AgentCapability[]} capabilities - Agent capabilities
 * @property {number} learningRate - Learning rate
 * @property {number} explorationRate - Exploration rate
 * @property {number} riskTolerance - Risk tolerance
 * @property {PerformanceMetrics} performance - Performance metrics
 * @property {LearningExperience[]} experiences - Learning experiences
 */

// Export an empty object to make this a proper ES module
export {}; 