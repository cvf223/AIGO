# Pretraining System for AI-Flash Loan Arbitrage Syndicate

This directory contains the implementation of the pretraining system for the AI-Flash Loan Arbitrage Syndicate. The system enables training the AI agents with synthetic data before deploying them with real funds.

## Components

### SyntheticDataGenerator

The `SyntheticDataGenerator` creates artificial but realistic arbitrage opportunities based on historical blockchain data. It generates variations with different parameters (slippage, gas prices, route complexity) to provide a diverse training dataset.

```javascript
// Example usage
const generator = new SyntheticDataGenerator({
  dbPool,
  debug: true
});
await generator.initialize();
const opportunities = await generator.generateFromBlocks(blocks);
```

### BlockReplaySystem

The `BlockReplaySystem` fetches and replays historical blockchain blocks to provide a realistic training environment. It supports all target chains and includes caching for efficient access.

```javascript
// Example usage
const replaySystem = new BlockReplaySystem({
  dbPool,
  debug: true
});
await replaySystem.initialize();
const blocks = await replaySystem.fetchHistoricalBlocks('arbitrum', 100);
```

### CurriculumManager

The `CurriculumManager` organizes training data into progressive difficulty levels, enabling systematic skill development from simple to complex arbitrage strategies.

```javascript
// Example usage
const curriculumManager = new CurriculumManager({
  dbPool,
  debug: true
});
await curriculumManager.initialize();
const curriculum = await curriculumManager.createCurriculum(opportunities);
```

### KyberSwapDynamicRouter

The `KyberSwapDynamicRouter` integrates with KyberSwap's dynamic trade routing to find optimal arbitrage paths across multiple DEXes, improving capital efficiency.

```javascript
// Example usage
const router = new KyberSwapDynamicRouter({
  dbPool,
  debug: true
});
await router.initialize();
const routes = await router.findOptimalRoutes({
  chain: 'arbitrum',
  tokenIn: '0x...',
  tokenOut: '0x...',
  amountIn: '1000000000000000000'
});
```

## Smart Contracts

### DynamicArbitrageExecutor

The `DynamicArbitrageExecutor` is a smart contract for executing multi-DEX arbitrage with flash loans. It supports various DEXes and includes safety features for production deployment.

## Integration with Existing System

The pretraining system integrates with the existing AI-Flash Loan Arbitrage Syndicate components:

1. The `SyntheticDataGenerator` creates opportunities that can be used by the `AlphaGnomeEvolutionarySystem` for training
2. The `BlockReplaySystem` provides historical data for the `AlphaFoldMarketStructurePredictor`
3. The `CurriculumManager` organizes training data for all learning systems
4. The `KyberSwapDynamicRouter` enhances the path finding capabilities of the arbitrage system

For detailed implementation information, see the [PRETRAINING_SETUP.md](../../PRETRAINING_SETUP.md) document.

