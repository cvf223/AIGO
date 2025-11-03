# 🎯 Free Data Collection Strategy for Arbitrage Database

## 🎯 Strategic Goals

1. **Quality over Quantity**: Focus on high-liquidity, active pools
2. **Free Sources Only**: No paid APIs, maximize free tiers
3. **Speed & Efficiency**: Smart rate limiting and parallel processing
4. **Real-time Updates**: Live price tracking for arbitrage detection

## 📊 Data Sources (100% Free)

### 1. Public RPC Endpoints
```
Ethereum: https://eth.llamarpc.com, https://rpc.ankr.com/eth
Arbitrum: https://arb1.arbitrum.io/rpc, https://rpc.ankr.com/arbitrum
Base: https://mainnet.base.org, https://base.llamarpc.com
Polygon: https://polygon-rpc.com, https://rpc.ankr.com/polygon
Optimism: https://mainnet.optimism.io, https://rpc.ankr.com/optimism
```

### 2. DEX Subgraphs (Free)
```
Uniswap V3: https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3-*
Uniswap V2: https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2
SushiSwap: https://api.thegraph.com/subgraphs/name/sushiswap/exchange-*
PancakeSwap: https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-*
```

### 3. CoinGecko Free API
```
Token prices: https://api.coingecko.com/api/v3/simple/price
Rate limit: 10-50 calls/minute
```

### 4. Public Contract Calls
- Direct factory contract queries
- Pool contract state reads
- ERC20 token metadata

## 🏗️ Collection Architecture

### Phase 1: Bootstrap Core Data (Day 1)
1. **Top 500 tokens** by market cap from CoinGecko
2. **Factory contracts** for major DEXs
3. **Top 1000 pools** by TVL from subgraphs
4. **Essential metadata** (symbols, decimals, addresses)

### Phase 2: Real-time Price Engine (Day 2-3)
1. **Price feeds** for top 200 pools
2. **Gas price tracking** across chains
3. **Block number synchronization**
4. **Basic arbitrage detection**

### Phase 3: Expansion (Ongoing)
1. **Additional DEXs** (Curve, Balancer, etc.)
2. **More chains** (Avalanche, Fantom, etc.)
3. **Historical data** collection
4. **MEV opportunity detection**

## 🚀 Implementation Plan

### Smart Rate Limiting Strategy
```javascript
// Free RPC: 120 requests/minute per endpoint
// Subgraph: 1000 requests/hour
// CoinGecko: 50 requests/minute

const rateLimits = {
  rpc: { requests: 120, window: 60000 },      // 2 req/sec
  subgraph: { requests: 1000, window: 3600000 }, // 0.28 req/sec
  coingecko: { requests: 50, window: 60000 }  // 0.83 req/sec
};
```

### Data Collection Priority
1. **Ultra High Priority** (Every 5 seconds)
   - WETH/USDC, WETH/USDT pools on major DEXs
   - Gas prices across all chains

2. **High Priority** (Every 30 seconds)
   - Top 50 pools by volume
   - Major stablecoin pairs

3. **Medium Priority** (Every 5 minutes)
   - Top 500 pools by TVL
   - Cross-chain token prices

4. **Low Priority** (Every hour)
   - Long-tail pools
   - Historical data backfill

## 🎯 Specific Collection Targets

### Chains to Focus On
1. **Arbitrum** - Low gas, high volume
2. **Base** - Growing ecosystem, cheap
3. **Polygon** - Mature DeFi, low costs
4. **Ethereum** - Highest liquidity (selective)

### DEXs by Priority
1. **Uniswap V3** - Highest liquidity, all chains
2. **Uniswap V2** - High volume, proven
3. **SushiSwap** - Multi-chain presence
4. **PancakeSwap** - BSC ecosystem
5. **Camelot** - Arbitrum native
6. **Aerodrome** - Base ecosystem

### Token Pairs to Prioritize
```
Tier 1 (Every 5s): WETH/USDC, WETH/USDT, WBTC/WETH
Tier 2 (Every 30s): WETH/DAI, USDC/USDT, ARB/WETH
Tier 3 (Every 5m): All pairs with >$1M TVL
Tier 4 (Hourly): Long-tail pairs >$100k TVL
```

## 📈 Efficiency Optimizations

### 1. Batch Processing
```javascript
// Collect 50 pools per RPC call using multicall
// Group subgraph queries by timeframe
// Cache token metadata to avoid repeated calls
```

### 2. Smart Caching
```javascript
// Token metadata: Cache for 24 hours
// Pool reserves: Cache for 30 seconds
// Gas prices: Cache for 15 seconds
// Block numbers: Cache for 5 seconds
```

### 3. Parallel Processing
```javascript
// Multiple RPC endpoints per chain
// Concurrent subgraph queries
// Parallel chain monitoring
// Async database writes
```

### 4. Data Validation
```javascript
// Sanity checks on prices (no 1000x jumps)
// Liquidity validation (reserves > 0)
// Volume validation (not negative)
// Address format verification
```

## 🎛️ Configuration Strategy

### Environment Variables
```bash
# Free RPC Endpoints (rotate for rate limiting)
ETHEREUM_RPC_URLS=https://eth.llamarpc.com,https://rpc.ankr.com/eth
ARBITRUM_RPC_URLS=https://arb1.arbitrum.io/rpc,https://rpc.ankr.com/arbitrum
BASE_RPC_URLS=https://mainnet.base.org,https://base.llamarpc.com

# Data Collection Settings
COLLECTION_INTERVAL_FAST=5000    # 5 seconds for top pools
COLLECTION_INTERVAL_MEDIUM=30000 # 30 seconds for mid-tier
COLLECTION_INTERVAL_SLOW=300000  # 5 minutes for long-tail

# Database Settings
DB_BATCH_SIZE=100                # Batch writes for performance
DB_CLEANUP_HOURS=168            # Keep 1 week of price history
```

## 📊 Expected Data Volume

### Initial Bootstrap (Day 1)
- **~2,000 pools** across all chains
- **~500 tokens** with metadata
- **Database size**: ~50MB

### After 1 Week
- **~5,000 pools** with price history
- **~1M price points** collected
- **Database size**: ~200MB

### After 1 Month
- **~10,000 pools** monitored
- **~10M price points** collected
- **Database size**: ~1GB

## 🔥 Quick Start Implementation

### 1. Database Setup (PostgreSQL)

First, make sure your PostgreSQL database is set up and the environment variable is configured:

```bash
# Set your PostgreSQL connection string
export DATABASE_URL="postgresql://username:password@localhost:5432/arbitrage_db"

# Or add to your .env file:
echo "DATABASE_URL=postgresql://username:password@localhost:5432/arbitrage_db" >> .env
```

If you don't have a database yet, create one:
```sql
CREATE DATABASE arbitrage_db;
-- All tables will be created automatically by the bootstrap script
```

### 2. Install Dependencies and Run

```bash
# Install dependencies
pnpm install

# Bootstrap the database with initial data (run once)
node scripts/bootstrap-free-data.js

# Start real-time data collection
node scripts/start-free-collector.js

# Monitor with dashboard (in another terminal)
node scripts/data-collection-dashboard.js
```

### 3. Environment Variables (Optional)

```bash
# PostgreSQL connection
DATABASE_URL=postgresql://username:password@localhost:5432/arbitrage_db

# Collection intervals (milliseconds)
COLLECTION_INTERVAL_FAST=5000      # Top pools (5 seconds)
COLLECTION_INTERVAL_MEDIUM=30000   # Mid-tier pools (30 seconds)  
COLLECTION_INTERVAL_SLOW=300000    # Long-tail pools (5 minutes)

# Dashboard port
DASHBOARD_PORT=3000

# Database batch size for performance
DB_BATCH_SIZE=50

# For production
NODE_ENV=production
```

## 🎯 Success Metrics

### Week 1 Goals
- ✅ 1,000+ active pools tracked
- ✅ Real-time prices for top 100 pairs
- ✅ <5 second arbitrage detection
- ✅ Gas tracking across 4 chains

### Month 1 Goals
- ✅ 5,000+ pools with historical data
- ✅ Cross-chain arbitrage detection
- ✅ MEV opportunity identification
- ✅ 95%+ uptime with free sources

This strategy maximizes data quality while staying within free tier limits, ensuring sustainable and cost-effective operations. 