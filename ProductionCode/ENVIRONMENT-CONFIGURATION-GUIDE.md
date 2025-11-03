# Environment Configuration Guide

## ✅ Your Current .env Analysis

Based on your provided .env file, here's what needs attention:

### 🟢 Good Configuration
- Multiple RPC providers per chain (Alchemy, Infura, QuickNode)
- Flashbots relay key configured
- Database properly set up
- Telegram bot configured
- Multiple exchange API keys

### 🔴 Critical Issues to Fix

1. **OPENAI_API_KEY**
   - Current: `your_openai_api_key_here`
   - Action: Replace with actual OpenAI API key for AI features
   - Impact: AI prediction features won't work without this

2. **FLASHBOTS_RELAY_SIGNING_KEY**
   - Current: `your_flashbots_relay_signing_key`
   - Action: Generate proper signing key for MEV protection
   - Impact: No MEV protection without valid key

3. **ANTHROPIC_API_KEY**
   - Current: `your_anthropic_api_key`
   - Action: Add real key if using Claude for analysis
   - Impact: Limited AI capabilities

4. **Private Keys**
   - Current: Example keys (0x123...)
   - Action: NEVER commit real private keys
   - Best Practice: Use hardware wallet or key management service

### 🚨 CRITICAL ADDITIONS FOR BACKGROUND TASKS

```bash
# BACKGROUND TASK SYSTEM (CRITICAL!)
ENABLE_BACKGROUND_TASKS=true
BACKGROUND_TASK_SAVE_INTERVAL=60000  # 1 minute
BACKGROUND_TASK_SAVE_PATH=./data/tasks
MAX_CONCURRENT_TASKS=5
TASK_HISTORY_LENGTH=1000

# MORALIS STREAMS (CRITICAL!)
MORALIS_API_KEY=your_moralis_api_key
MORALIS_WEBHOOK_URL=https://your-domain.com/webhook
MORALIS_WEBHOOK_PORT=3333
MORALIS_STREAM_NETWORKS=arbitrum,base,polygon

# ATOMIC TASK SWITCHING
TASK_SWITCH_TIMEOUT_MS=2  # Max 2ms for switch
PRICE_IMPACT_THRESHOLD=0.005  # 0.5% triggers interrupt
OPPORTUNITY_RESPONSE_TIMEOUT_MS=100

# WEBHOOK SERVER REDUNDANCY
PRIMARY_WEBHOOK_URL=https://primary.your-domain.com/webhook
BACKUP_WEBHOOK_URL=https://backup.your-domain.com/webhook
FAILOVER_WEBHOOK_URL=https://failover.your-domain.com/webhook

# TASK STATE MANAGEMENT
REDIS_URL=redis://localhost:6379
REDIS_TASK_STATE_TTL=3600  # 1 hour
STATE_COMPRESSION_ENABLED=true
MAX_STATE_SIZE_MB=10
```

### 🟡 Optimizations Needed

1. **WebSocket Endpoints**
   - Add WSS endpoints for real-time monitoring:
   ```
   ALCHEMY_ARBITRUM_WSS=wss://arb-mainnet.g.alchemy.com/v2/YOUR_KEY
   INFURA_ARBITRUM_WSS=wss://arbitrum-mainnet.infura.io/ws/v3/YOUR_KEY
   QUICKNODE_ARBITRUM_WSS=wss://YOUR-ENDPOINT.arbitrum-mainnet.quiknode.pro/YOUR_KEY/
   ```

2. **Rate Limits Configuration**
   ```
   # Add these for better rate limit management
   ALCHEMY_RATE_LIMIT=300
   INFURA_RATE_LIMIT=100
   QUICKNODE_RATE_LIMIT=500
   MORALIS_RATE_LIMIT=25  # Requests per second
   ```

3. **Circuit Breaker Settings**
   ```
   # Add safety limits
   MAX_LOSS_PER_HOUR=100
   MAX_FAILED_TXS=10
   CIRCUIT_BREAKER_COOLDOWN=3600000
   ```

4. **Gas Optimization**
   ```
   # Add dynamic gas settings
   MAX_GAS_PRICE_GWEI=100
   GAS_PROFIT_RATIO=0.3
   PRIORITY_FEE_PERCENTILE=75
   ```

### 📋 Additional Required Variables

```bash
# Monitoring & Alerts
MONITORING_ENABLED=true
ALERT_WEBHOOK_URL=https://your-webhook.com
GRAFANA_API_KEY=your_grafana_key
DATADOG_API_KEY=your_datadog_key

# Performance Tuning
WORKER_THREADS=4
MAX_MEMORY_MB=4096
GC_INTERVAL_MS=30000
BACKGROUND_TASK_WORKER_THREADS=2

# Advanced Features
ENABLE_FORK_TESTING=true
FORK_BLOCK_DELAY=5
SIMULATION_GAS_LIMIT=30000000

# Competition Analysis
ETHERSCAN_API_KEY=your_key
ARBISCAN_API_KEY=your_key
POLYGONSCAN_API_KEY=your_key

# Backup RPCs
BACKUP_RPC_ARBITRUM=https://backup-arb.com
BACKUP_RPC_BASE=https://backup-base.com
BACKUP_RPC_POLYGON=https://backup-poly.com

# Background Task Specific Settings
ARBITRUM_GAS_MONITOR_INTERVAL=60000  # 1 minute
SEQUENCER_MONITOR_INTERVAL=300000    # 5 minutes
LIQUIDITY_MAPPING_INTERVAL=600000    # 10 minutes
PERFORMANCE_ANALYSIS_INTERVAL=3600000 # 1 hour
```

### 🔐 Security Best Practices

1. **Use .env.vault for production**
   ```bash
   npx dotenv-vault@latest new
   npx dotenv-vault@latest login
   npx dotenv-vault@latest push
   ```

2. **Rotate API keys monthly**
   ```javascript
   // Implement key rotation
   const keyRotation = {
     'ALCHEMY_KEY': 30 * 24 * 60 * 60 * 1000, // 30 days
     'INFURA_KEY': 30 * 24 * 60 * 60 * 1000,
     'MORALIS_KEY': 30 * 24 * 60 * 60 * 1000  // Critical!
   };
   ```

3. **Use different keys for dev/prod**
   - `.env.development`
   - `.env.production`
   - `.env.test`

### 🚀 Production Checklist

- [ ] Replace all placeholder API keys
- [ ] **Add Moralis API key and webhook URL**
- [ ] **Configure background task settings**
- [ ] Add WebSocket endpoints
- [ ] Configure rate limits
- [ ] Set up circuit breakers
- [ ] Add monitoring keys
- [ ] Configure backup RPCs
- [ ] **Set up Redis for task state**
- [ ] Set up key rotation
- [ ] Enable security features
- [ ] Test all connections
- [ ] **Test webhook server**
- [ ] Monitor API usage

### 📊 Recommended Service Tiers

1. **Alchemy**: Growth tier ($49/month)
   - 3M compute units
   - Advanced APIs
   - Priority support

2. **Infura**: Team tier ($225/month)
   - 5M requests/day
   - All networks
   - SLA guarantee

3. **QuickNode**: Launch tier ($299/month)
   - Unlimited requests
   - Global endpoints
   - Dedicated nodes

4. **Moralis**: Pro tier ($79/month) - CRITICAL!
   - 3,000 requests/second
   - Unlimited streams
   - Priority support
   - Historical data

5. **Redis Cloud**: Fixed tier ($60/month)
   - 5GB RAM
   - 100 connections
   - Persistence enabled

Total monthly cost: ~$700 for reliable infrastructure

### 🎯 Background Task Optimization Settings

```bash
# Agent-Specific Task Intervals
ARBITRUM_SPOTTER_TASKS=gas_monitor:60000,sequencer:300000,mev:120000
BASE_ANALYST_TASKS=fee_analysis:60000,liquidity:600000,op_stack:300000
POLYGON_SPECIALIST_TASKS=matic_gas:60000,block_time:300000,bridge:600000

# Learning Task Settings
PERFORMANCE_ANALYSIS_ENABLED=true
STRATEGY_EFFECTIVENESS_ENABLED=true
NEW_PATH_DISCOVERY_ENABLED=true
COLLECTIVE_LEARNING_INTERVAL=300000  # 5 minutes

# Task Priority Settings
CRITICAL_TASK_THRESHOLD=0.005  # 0.5% price impact
HIGH_PRIORITY_GAS_THRESHOLD=50  # Gwei
MEDIUM_PRIORITY_INTERVAL=300000
LOW_PRIORITY_INTERVAL=3600000
```

### ⚠️ Critical Webhook Setup

For Moralis Streams to work, you MUST have a publicly accessible webhook URL:

1. **Local Development**: Use ngrok
   ```bash
   ngrok http 3333
   # Copy the https URL to MORALIS_WEBHOOK_URL
   ```

2. **Production**: Use proper domain
   ```bash
   MORALIS_WEBHOOK_URL=https://arbitrage.yourdomain.com/webhook
   ```

3. **Redundancy**: Multiple endpoints
   ```bash
   PRIMARY_WEBHOOK=https://primary.yourdomain.com/webhook
   BACKUP_WEBHOOK=https://backup.yourdomain.com/webhook
   ```

### 🏆 The Golden Configuration

The perfect .env for top 5% performance includes:
1. Multiple API keys per provider (load balancing)
2. Moralis streams properly configured
3. Background task system enabled
4. Redis for state management
5. Proper webhook redundancy
6. Aggressive monitoring settings
7. Circuit breakers configured
8. All intervals optimized

Remember: **Background tasks + atomic switching = competitive edge!** 🚀 