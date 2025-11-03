-- Create test tables for integration tests

-- Pretraining state table
CREATE TABLE IF NOT EXISTS pretraining_state (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metrics JSONB NOT NULL,
    chain_metrics JSONB NOT NULL
);

-- Learning state table
CREATE TABLE IF NOT EXISTS learning_state (
    id SERIAL PRIMARY KEY,
    system VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    state_data JSONB NOT NULL
);

-- Arbitrage opportunities table
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    route JSONB NOT NULL,
    expected_profit DECIMAL(20, 10) NOT NULL,
    expected_execution_time_ms INTEGER NOT NULL,
    gas_estimate DECIMAL(20, 10) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed BOOLEAN DEFAULT FALSE,
    execution_tx_hash VARCHAR(66),
    actual_profit DECIMAL(20, 10),
    execution_time_ms INTEGER,
    competitor_tx_hash VARCHAR(66),
    metadata JSONB
);

-- Agent rewards and penalties
CREATE TABLE IF NOT EXISTS agent_rewards_penalties (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(20, 10) NOT NULL,
    reason TEXT NOT NULL,
    opportunity_id INTEGER REFERENCES arbitrage_opportunities(id),
    blockchain_proof VARCHAR(66),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competitor analysis
CREATE TABLE IF NOT EXISTS competitor_analysis (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    competitor_address VARCHAR(66) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    sequencer_position INTEGER,
    priority_fee_gwei DECIMAL(20, 10),
    timeboost_detected BOOLEAN DEFAULT FALSE,
    enhancement_detected BOOLEAN DEFAULT FALSE,
    strategy_classification VARCHAR(50),
    profit_estimate DECIMAL(20, 10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Genome analysis
CREATE TABLE IF NOT EXISTS genome_analysis (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    population_id INTEGER NOT NULL,
    generation INTEGER NOT NULL,
    genome_size INTEGER NOT NULL,
    population_size INTEGER NOT NULL,
    average_fitness DECIMAL(20, 10) NOT NULL,
    best_fitness DECIMAL(20, 10) NOT NULL,
    resource_usage JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add test data
INSERT INTO arbitrage_opportunities (chain, type, route, expected_profit, expected_execution_time_ms, gas_estimate)
VALUES 
('ethereum', 'flashloan', '[{"dex": "uniswap", "tokenIn": "USDC", "tokenOut": "WETH"}, {"dex": "sushiswap", "tokenIn": "WETH", "tokenOut": "USDC"}]', 0.05, 120, 0.01),
('arbitrum', 'direct', '[{"dex": "camelot", "tokenIn": "USDC", "tokenOut": "WETH"}, {"dex": "sushiswap", "tokenIn": "WETH", "tokenOut": "USDC"}]', 0.03, 85, 0.008),
('optimism', 'multihop', '[{"dex": "uniswap", "tokenIn": "USDC", "tokenOut": "WETH"}, {"dex": "velodrome", "tokenIn": "WETH", "tokenOut": "OP"}, {"dex": "uniswap", "tokenIn": "OP", "tokenOut": "USDC"}]', 0.07, 150, 0.015)
ON CONFLICT DO NOTHING;
