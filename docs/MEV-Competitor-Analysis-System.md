# MEV Competitor Analysis System

## Overview

This document describes the complete MEV (Maximum Extractable Value) competitor analysis system designed to help agents learn from successful arbitrage bots and improve their trading strategies. The system pulls real-time data from multiple sources including Dune Analytics, blockchain explorers, and MEV-Boost relays to provide actionable insights.

## Architecture

### Core Components

1. **MEVCompetitorAnalysisTask** (`src/analysis/MEVCompetitorAnalysisTask.ts`)
   - Background task that collects data from multiple sources
   - Runs every 30 minutes by default
   - Analyzes competitor strategies and market opportunities
   - Stores insights in PostgreSQL database

2. **MEVCompetitorInsightService** (`src/services/MEVCompetitorInsightService.ts`)
   - Provides API for agents to access competitor insights
   - Offers strategy recommendations based on market conditions
   - Caches results for performance optimization
   - Tracks execution results for continuous learning

3. **MEVCompetitorAnalysisCapability** (`src/capabilities/MEVCompetitorAnalysisCapability.ts`)
   - Agent capability module for accessing MEV insights
   - Provides actions like analyzeMarketOpportunities, getStrategyRecommendations
   - Integrates with agent runtime and memory systems

4. **MEVCompetitorAnalysisBackgroundTask** (`src/tasks/MEVCompetitorAnalysisBackgroundTask.ts`)
   - Orchestrates the analysis process for agents
   - Generates actionable recommendations
   - Can run automatically or on-demand

## Data Sources

### 1. Dune Analytics
- **L2 Atomic Arbitrage Dashboard**: Cross-chain arbitrage volumes and trends
- **Arbitrum MEV Leaderboard**: Top performing bots by profit
- **MEV Searcher Economics**: Revenue breakdown and DAO capture rates
- **DEX Volume Analysis**: Trading pair and DEX performance metrics

### 2. Blockchain Data
- Real-time swap events from multiple chains (Arbitrum, Base, Polygon, Optimism)
- Transaction analysis to identify arbitrage patterns
- Gas usage and optimization strategies

### 3. MEV-Boost Relay Data
- Block builder performance metrics
- High-value MEV block analysis
- Competition level insights

### 4. Internal Database
- Historical arbitrage executions
- Strategy performance tracking
- Competitor profiles and patterns

## Database Schema

The system uses PostgreSQL with the following key tables:

- **mev_competitors**: Competitor bot profiles with performance metrics
- **market_insights**: Chain/DEX/pair opportunity analysis
- **arbitrage_strategies**: Successful strategy patterns and performance
- **competitor_transactions**: Detailed transaction history
- **mev_opportunities**: Real-time arbitrage opportunities
- **dex_performance**: DEX-specific metrics and liquidity data
- **token_pair_analysis**: Token pair volatility and opportunity scoring

## Key Features

### 1. Competitor Analysis
- Tracks top 100+ MEV bots across multiple chains
- Analyzes preferred DEX paths and token pairs
- Identifies winning gas optimization strategies
- Monitors success rates and profitability patterns

### 2. Market Opportunity Scoring
- Calculates opportunity scores based on:
  - 24h trading volume
  - Average profitability
  - Competition level
  - Number of opportunities
- Provides chain recommendations (highly-recommended, recommended, neutral, crowded)

### 3. Strategy Recommendations
- Risk-adjusted strategy selection (low, medium, high tolerance)
- Gas price optimization recommendations
- DEX path suggestions based on success rates
- Competition level assessment for each strategy

### 4. Real-Time Monitoring
- Active opportunity tracking with expiration times
- Urgent opportunity alerts (< 30 seconds)
- Competitor activity monitoring
- Market condition updates

### 5. Continuous Learning
- Tracks execution results for strategy improvement
- Updates success patterns based on new data
- Adapts recommendations based on market changes

## Usage Examples

### 1. Analyzing Market Opportunities
```typescript
const analysis = await capability.analyzeMarketOpportunities(runtime);
// Returns top 5 chains with opportunity scores and recommendations
```

### 2. Getting Strategy Recommendations
```typescript
const strategies = await capability.getStrategyRecommendations(
    runtime,
    'arbitrum',
    BigInt(1e18), // 1 ETH capital
    'medium' // risk tolerance
);
// Returns risk-adjusted strategies with gas optimization details
```

### 3. Learning from Competitors
```typescript
const insights = await capability.learnFromCompetitors(runtime, 'arbitrum');
// Returns top competitors, winning patterns, and key learnings
```

### 4. Checking Active Opportunities
```typescript
const opportunities = await capability.checkActiveOpportunities(
    runtime,
    'arbitrum',
    BigInt(1e16) // 0.01 ETH minimum profit
);
// Returns sorted opportunities with urgency indicators
```

## Key Insights from Screenshots

Based on the Dune Analytics data shown in the screenshots:

### Top Performing Chains (by volume)
1. **Base**: $6.35B volume, 13M transactions
2. **Arbitrum**: $4.21B volume, 2.8M transactions  
3. **Polygon**: $2.68B volume, 7.7M transactions
4. **Optimism**: $1.5B volume, 4M transactions

### Most Profitable DEXs
1. **Uniswap**: 37% of arbitrage volume
2. **PancakeSwap**: 16.8% of volume
3. **Camelot**: 14.4% of volume
4. **Others**: Balancer, Sushiswap, Fluid

### Key Success Patterns
- Top bots achieve 70%+ success rates
- Average gas usage: 150,000-300,000 units
- Best trading hours: Variable by chain
- Typical profit per trade: $50-500

### Competitive Landscape
- Top 10 bots control significant market share
- Daily profits range from $1k to $20k+ for top performers
- Stablecoin pairs dominate volume (50%+)
- ETH pairs represent 30% of opportunities

## Implementation Benefits

1. **Data-Driven Decision Making**: Agents make decisions based on real competitor performance data
2. **Risk Management**: Strategies are filtered by risk tolerance and success rates
3. **Gas Optimization**: Learn from successful bots' gas usage patterns
4. **Market Timing**: Identify optimal trading hours based on historical data
5. **Continuous Improvement**: System learns from both successes and failures

## Configuration

Required environment variables:
```bash
DUNE_API_KEY=your_dune_api_key
ETHERSCAN_API_KEY_ARBITRUM=your_key
ETHERSCAN_API_KEY_BASE=your_key
ETHERSCAN_API_KEY_POLYGON=your_key
ETHERSCAN_API_KEY_OPTIMISM=your_key
RPC_URL_ARBITRUM=your_rpc_url
RPC_URL_BASE=your_rpc_url
RPC_URL_POLYGON=your_rpc_url
RPC_URL_OPTIMISM=your_rpc_url
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Future Enhancements

1. **Machine Learning Integration**: Use TensorFlow/PyTorch for pattern recognition
2. **Sandwich Attack Detection**: Identify and learn from sandwich strategies
3. **Cross-Chain Arbitrage**: Expand to bridge-based arbitrage opportunities
4. **Social Sentiment Analysis**: Incorporate Twitter/Discord signals
5. **Smart Contract Analysis**: Decompile and analyze competitor contracts
6. **Real-Time Alerts**: WebSocket-based opportunity notifications
7. **Performance Backtesting**: Historical strategy validation

## Conclusion

This MEV competitor analysis system provides agents with comprehensive market intelligence to compete effectively in the arbitrage landscape. By learning from successful competitors and adapting to market conditions, agents can significantly improve their profitability and success rates.

The system's strength lies in its multi-source data aggregation, real-time analysis capabilities, and continuous learning mechanisms. As the MEV landscape evolves, this system ensures agents stay competitive by adapting their strategies based on proven success patterns. 