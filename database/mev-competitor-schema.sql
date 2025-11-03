-- 🔍 MEV COMPETITOR ANALYSIS SCHEMA
-- =================================

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS mev_analysis;

-- Atomic arbitrage transactions
CREATE TABLE IF NOT EXISTS atomic_arbitrages (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(20) NOT NULL,
    block_number BIGINT NOT NULL,
    block_time TIMESTAMP NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    mev_bot VARCHAR(42) NOT NULL,
    contract_address VARCHAR(42),
    
    -- Profit metrics
    gross_profit_usd DECIMAL(20, 2),
    gas_cost_usd DECIMAL(20, 2),
    net_profit_usd DECIMAL(20, 2),
    
    -- Transaction details
    gas_used BIGINT,
    gas_price BIGINT,
    transaction_index INTEGER,
    
    -- Swap details
    swap_count INTEGER,
    path_length INTEGER,
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE(chain, transaction_hash),
    INDEX idx_block_number (chain, block_number),
    INDEX idx_mev_bot (mev_bot),
    INDEX idx_profit (net_profit_usd DESC),
    INDEX idx_time (block_time DESC)
);

-- Arbitrage paths
CREATE TABLE IF NOT EXISTS arbitrage_paths (
    id SERIAL PRIMARY KEY,
    arbitrage_id INTEGER REFERENCES atomic_arbitrages(id),
    step_number INTEGER NOT NULL,
    pool_address VARCHAR(42) NOT NULL,
    pool_name VARCHAR(100),
    pool_type VARCHAR(10), -- V2, V3, etc
    token_in VARCHAR(42),
    token_out VARCHAR(42),
    amount_in DECIMAL(78, 0),
    amount_out DECIMAL(78, 0),
    
    INDEX idx_arbitrage (arbitrage_id),
    INDEX idx_pool (pool_address)
);

-- MEV bot profiles
CREATE TABLE IF NOT EXISTS mev_bots (
    bot_address VARCHAR(42) PRIMARY KEY,
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    total_transactions INTEGER DEFAULT 0,
    total_profit_usd DECIMAL(20, 2) DEFAULT 0,
    avg_profit_per_tx DECIMAL(20, 2),
    preferred_chains TEXT[], -- Array of chains
    preferred_strategies TEXT[], -- Array of strategies
    
    -- Contract analysis
    uses_smart_contract BOOLEAN DEFAULT FALSE,
    contract_addresses TEXT[], -- Array of contracts used
    gas_optimization_score DECIMAL(5, 2), -- 0-100
    
    -- MEV protection
    uses_flashbots BOOLEAN DEFAULT FALSE,
    uses_private_mempool BOOLEAN DEFAULT FALSE,
    mev_protection_techniques TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Smart contract analysis
CREATE TABLE IF NOT EXISTS analyzed_contracts (
    contract_address VARCHAR(42) PRIMARY KEY,
    chain VARCHAR(20) NOT NULL,
    code_size INTEGER,
    
    -- Gas optimizations
    uses_assembly BOOLEAN DEFAULT FALSE,
    uses_efficient_storage BOOLEAN DEFAULT FALSE,
    supports_batch_operations BOOLEAN DEFAULT FALSE,
    gas_optimizations TEXT[],
    avg_gas_used BIGINT,
    gas_efficiency_percentile DECIMAL(5, 2), -- 0-100
    
    -- Analysis results
    optimization_techniques TEXT[],
    vulnerabilities TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEV strategies
CREATE TABLE IF NOT EXISTS mev_strategies (
    id SERIAL PRIMARY KEY,
    strategy_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    total_profit_usd DECIMAL(20, 2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    avg_profit_per_tx DECIMAL(20, 2),
    success_rate DECIMAL(5, 2), -- percentage
    
    -- Performance metrics
    avg_gas_used BIGINT,
    avg_execution_time_ms INTEGER,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MEV competitor analysis results
CREATE TABLE IF NOT EXISTS mev_competitor_analysis (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(20) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Aggregate metrics
    total_bots_found INTEGER,
    total_profit_usd DECIMAL(20, 2),
    avg_profit_per_bot DECIMAL(20, 2),
    top_bot_profit DECIMAL(20, 2),
    
    -- Analysis data (JSONB for flexibility)
    top_strategies JSONB,
    gas_optimizations JSONB,
    execution_patterns JSONB,
    mev_techniques JSONB,
    
    -- Configuration
    min_profit_threshold DECIMAL(20, 2),
    blocks_analyzed INTEGER,
    
    UNIQUE(chain, timeframe, analysis_timestamp::date)
);

-- MEV analysis memories for learning system
CREATE TABLE IF NOT EXISTS mev_analysis_memories (
    memory_id VARCHAR(100) PRIMARY KEY,
    chain VARCHAR(20) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    
    -- Metrics
    metrics JSONB NOT NULL,
    
    -- Learning data
    top_strategies JSONB,
    gas_optimizations JSONB,
    mev_techniques JSONB,
    execution_patterns JSONB,
    contract_comparison JSONB,
    recommendations JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_created (created_at DESC)
);

-- Our contract performance (for comparison)
CREATE TABLE IF NOT EXISTS our_contract_performance (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(42) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    
    -- Performance metrics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) GENERATED ALWAYS AS 
        (CASE WHEN total_executions > 0 
         THEN (successful_executions::DECIMAL / total_executions * 100) 
         ELSE 0 END) STORED,
    
    -- Profit metrics
    total_profit_usd DECIMAL(20, 2) DEFAULT 0,
    avg_profit_usd DECIMAL(20, 2),
    max_profit_usd DECIMAL(20, 2),
    
    -- Gas metrics
    avg_gas_used BIGINT,
    min_gas_used BIGINT,
    max_gas_used BIGINT,
    
    -- Features
    batch_operations BOOLEAN DEFAULT FALSE,
    mev_protection_enabled BOOLEAN DEFAULT FALSE,
    techniques JSONB, -- Array of techniques used
    
    is_active BOOLEAN DEFAULT TRUE,
    last_execution TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(contract_address, chain)
);

-- Token prices for profit calculation
CREATE TABLE IF NOT EXISTS token_prices (
    id SERIAL PRIMARY KEY,
    token_address VARCHAR(42) NOT NULL,
    chain VARCHAR(20) NOT NULL,
    block_number BIGINT NOT NULL,
    price_usd DECIMAL(20, 8) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_address, chain, block_number),
    INDEX idx_lookup (token_address, block_number DESC)
);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_atomic_arbitrages_updated_at 
    BEFORE UPDATE ON atomic_arbitrages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mev_bots_updated_at 
    BEFORE UPDATE ON mev_bots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analyzed_contracts_updated_at 
    BEFORE UPDATE ON analyzed_contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mev_strategies_updated_at 
    BEFORE UPDATE ON mev_strategies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_our_contract_performance_updated_at 
    BEFORE UPDATE ON our_contract_performance 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analysis
CREATE OR REPLACE VIEW top_mev_bots AS
SELECT 
    bot_address,
    total_profit_usd,
    total_transactions,
    avg_profit_per_tx,
    gas_optimization_score,
    array_length(mev_protection_techniques, 1) as mev_techniques_count,
    last_seen
FROM mev_bots
WHERE total_profit_usd > 0
ORDER BY total_profit_usd DESC
LIMIT 100;

CREATE OR REPLACE VIEW recent_high_profit_arbitrages AS
SELECT 
    aa.*,
    mb.gas_optimization_score,
    mb.mev_protection_techniques
FROM atomic_arbitrages aa
LEFT JOIN mev_bots mb ON mb.bot_address = aa.mev_bot
WHERE aa.net_profit_usd > 1000
    AND aa.block_time > NOW() - INTERVAL '7 days'
ORDER BY aa.net_profit_usd DESC;

-- Sample data for testing (remove in production)
-- INSERT INTO our_contract_performance (contract_address, chain, total_executions, successful_executions, avg_gas_used, avg_profit_usd)
-- VALUES ('0x1234567890123456789012345678901234567890', 'base', 100, 85, 180000, 250.50); 