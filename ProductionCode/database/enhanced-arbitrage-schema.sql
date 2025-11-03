-- ============================================================================
-- ENHANCED ARBITRAGE DATABASE SCHEMA
-- ============================================================================
-- Adds all missing tables for production-ready arbitrage system

-- Agent MDP States Table
CREATE TABLE IF NOT EXISTS agent_mdp_states (
    agent_id VARCHAR(100) PRIMARY KEY,
    state_data JSONB DEFAULT '{}',
    skill_levels JSONB DEFAULT '{}',
    experience_points INTEGER DEFAULT 0,
    completed_tasks JSONB DEFAULT '[]',
    performance_metrics JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool Volatility Tracking
CREATE TABLE IF NOT EXISTS pool_volatility (
    pool_address VARCHAR(42) PRIMARY KEY,
    standard_deviation DECIMAL(20,8),
    percentile_range DECIMAL(20,8),
    max_drawdown DECIMAL(20,8),
    sharpe_ratio DECIMAL(20,8),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (pool_address) REFERENCES pools(address) ON DELETE CASCADE
);

-- Enhanced Gas Tracking with Network Congestion
CREATE TABLE IF NOT EXISTS enhanced_gas_tracker (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(20) NOT NULL,
    block_number BIGINT NOT NULL,
    base_fee DECIMAL(20,0),
    priority_fee DECIMAL(20,0),
    total_gas DECIMAL(20,0),
    network_congestion_score DECIMAL(5,2),
    congestion_multiplier DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real Exchange Quotes for Validation
CREATE TABLE IF NOT EXISTS exchange_quotes (
    id SERIAL PRIMARY KEY,
    exchange_name VARCHAR(50) NOT NULL,
    token_in_address VARCHAR(42) NOT NULL,
    token_out_address VARCHAR(42) NOT NULL,
    amount_in DECIMAL(30,0) NOT NULL,
    amount_out DECIMAL(30,0) NOT NULL,
    quote_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    response_time_ms INTEGER,
    is_valid BOOLEAN DEFAULT true,
    chain VARCHAR(20) DEFAULT 'arbitrum'
);

-- Competitor Route Analysis
CREATE TABLE IF NOT EXISTS competitor_routes (
    id SERIAL PRIMARY KEY,
    route_hash VARCHAR(64) UNIQUE NOT NULL,
    token_start VARCHAR(42) NOT NULL,
    token_end VARCHAR(42) NOT NULL,
    route_path JSONB NOT NULL,
    observed_profit DECIMAL(20,8),
    gas_used INTEGER,
    competitor_address VARCHAR(42),
    transaction_hash VARCHAR(66),
    block_number BIGINT,
    profit_usd DECIMAL(20,2),
    is_profitable BOOLEAN DEFAULT false,
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Multi-hop Route Cache
CREATE TABLE IF NOT EXISTS multi_hop_routes (
    id SERIAL PRIMARY KEY,
    route_hash VARCHAR(64) UNIQUE NOT NULL,
    start_token VARCHAR(42) NOT NULL,
    end_token VARCHAR(42) NOT NULL,
    hop_count INTEGER NOT NULL,
    route_data JSONB NOT NULL,
    estimated_gas INTEGER,
    last_profit_check DECIMAL(20,8),
    success_rate DECIMAL(5,2) DEFAULT 0,
    average_profit DECIMAL(20,8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Pool Configuration
ALTER TABLE pools ADD COLUMN IF NOT EXISTS dex_type VARCHAR(20) DEFAULT 'AMM_V2';
ALTER TABLE pools ADD COLUMN IF NOT EXISTS router_address VARCHAR(42);
ALTER TABLE pools ADD COLUMN IF NOT EXISTS factory_address VARCHAR(42);
ALTER TABLE pools ADD COLUMN IF NOT EXISTS pool_version VARCHAR(10) DEFAULT 'v2';

-- Network Conditions Tracking
CREATE TABLE IF NOT EXISTS network_conditions (
    id SERIAL PRIMARY KEY,
    chain_id INTEGER NOT NULL,
    block_number BIGINT NOT NULL,
    gas_price DECIMAL(20,0),
    base_fee DECIMAL(20,0),
    priority_fee DECIMAL(20,0),
    network_congestion DECIMAL(5,2),
    eth_price DECIMAL(20,2),
    block_time_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Performance Tracking
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    execution_time_ms INTEGER,
    success BOOLEAN,
    reward_earned DECIMAL(20,8),
    skill_improvement DECIMAL(5,2),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Arbitrage Opportunities
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) UNIQUE NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL,
    token_pair VARCHAR(20) NOT NULL,
    buy_pool_address VARCHAR(42) NOT NULL,
    sell_pool_address VARCHAR(42) NOT NULL,
    profit_percent DECIMAL(10,4),
    estimated_profit_usd DECIMAL(20,2),
    gas_estimate INTEGER,
    route_data JSONB,
    confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'detected',
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,
    actual_profit_usd DECIMAL(20,2)
);

-- Syndicate Agent Registry
CREATE TABLE IF NOT EXISTS syndicate_agents (
    agent_id VARCHAR(100) PRIMARY KEY,
    agent_type VARCHAR(50) NOT NULL,
    character_file VARCHAR(200),
    chain_assignment VARCHAR(20),
    specialization JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Agent MDP States
CREATE INDEX IF NOT EXISTS idx_agent_mdp_states_last_updated ON agent_mdp_states(last_updated DESC);

-- Pool Volatility
CREATE INDEX IF NOT EXISTS idx_pool_volatility_timestamp ON pool_volatility(timestamp DESC);

-- Enhanced Gas Tracker
CREATE INDEX IF NOT EXISTS idx_enhanced_gas_tracker_chain_block ON enhanced_gas_tracker(chain, block_number DESC);
CREATE INDEX IF NOT EXISTS idx_enhanced_gas_tracker_timestamp ON enhanced_gas_tracker(timestamp DESC);

-- Exchange Quotes
CREATE INDEX IF NOT EXISTS idx_exchange_quotes_timestamp ON exchange_quotes(quote_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_quotes_exchange_tokens ON exchange_quotes(exchange_name, token_in_address, token_out_address);

-- Competitor Routes
CREATE INDEX IF NOT EXISTS idx_competitor_routes_profitable ON competitor_routes(is_profitable, observed_profit DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_routes_tokens ON competitor_routes(token_start, token_end);

-- Multi-hop Routes
CREATE INDEX IF NOT EXISTS idx_multi_hop_routes_tokens_hops ON multi_hop_routes(start_token, end_token, hop_count);
CREATE INDEX IF NOT EXISTS idx_multi_hop_routes_profit ON multi_hop_routes(average_profit DESC);

-- Network Conditions
CREATE INDEX IF NOT EXISTS idx_network_conditions_chain_timestamp ON network_conditions(chain_id, timestamp DESC);

-- Agent Performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_timestamp ON agent_performance(agent_id, timestamp DESC);

-- Arbitrage Opportunities
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_detected_at ON arbitrage_opportunities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_profit ON arbitrage_opportunities(profit_percent DESC);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_status ON arbitrage_opportunities(status);

-- Syndicate Agents
CREATE INDEX IF NOT EXISTS idx_syndicate_agents_type_active ON syndicate_agents(agent_type, is_active);
CREATE INDEX IF NOT EXISTS idx_syndicate_agents_chain ON syndicate_agents(chain_assignment);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================================================

-- Update pool volatility when price history is inserted
CREATE OR REPLACE FUNCTION update_pool_volatility()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple volatility calculation trigger
    INSERT INTO pool_volatility (pool_address, timestamp)
    VALUES (NEW.pool_address, NOW())
    ON CONFLICT (pool_address) DO UPDATE SET
        timestamp = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_pool_volatility ON pool_price_history;
CREATE TRIGGER trigger_update_pool_volatility
    AFTER INSERT ON pool_price_history
    FOR EACH ROW
    EXECUTE FUNCTION update_pool_volatility();

-- ============================================================================
-- INITIAL DATA FOR TESTING
-- ============================================================================

-- MEV Competitor Analysis Tables (CRITICAL FOR DUNE ANALYTICS STYLE ANALYSIS)
CREATE TABLE IF NOT EXISTS mev_competitors (
    id SERIAL PRIMARY KEY,
    bot_address VARCHAR(42) UNIQUE NOT NULL,
    chain_id INTEGER NOT NULL,
    first_seen_block BIGINT,
    last_active_block BIGINT,
    total_transactions INTEGER DEFAULT 0,
    total_volume_usd DECIMAL(20,2) DEFAULT 0,
    total_profit_usd DECIMAL(20,2) DEFAULT 0,
    average_gas_price DECIMAL(20,0),
    success_rate DECIMAL(5,2),
    preferred_dexs JSONB DEFAULT '[]',
    preferred_token_pairs JSONB DEFAULT '[]',
    strategy_patterns JSONB DEFAULT '[]',
    competitive_rank INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mev_analysis_sessions (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    chains_analyzed INTEGER,
    bots_discovered INTEGER,
    strategies_identified INTEGER,
    routes_analyzed INTEGER,
    insights JSONB DEFAULT '[]',
    analysis_duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS competitor_strategies (
    id SERIAL PRIMARY KEY,
    strategy_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    complexity INTEGER,
    average_profit DECIMAL(20,8),
    risk_level INTEGER,
    market_conditions JSONB DEFAULT '[]',
    execution_time_ms INTEGER,
    gas_efficiency DECIMAL(10,4),
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for MEV analysis performance
CREATE INDEX IF NOT EXISTS idx_mev_competitors_chain_rank ON mev_competitors(chain_id, competitive_rank);
CREATE INDEX IF NOT EXISTS idx_mev_competitors_profit ON mev_competitors(total_profit_usd DESC);
CREATE INDEX IF NOT EXISTS idx_mev_analysis_sessions_timestamp ON mev_analysis_sessions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_strategies_profit ON competitor_strategies(average_profit DESC);

-- Insert sample agents (INCLUDING MEV ANALYST!)
INSERT INTO syndicate_agents (agent_id, agent_type, character_file, chain_assignment, specialization)
VALUES 
('executor-001', 'executor', 'executor.character.json', 'arbitrum', '{"focus": "execution", "speed": "ultra_fast"}'),
('ai-prediction-001', 'ai-prediction', 'ai-prediction.character.json', 'multi-chain', '{"focus": "prediction", "accuracy": "high"}'),
('arbitrum-spotter-001', 'opportunity-spotter', 'arbitrum-spotter.character.json', 'arbitrum', '{"focus": "arbitrum", "strategy": "aggressive"}'),
('analyst-001', 'analyst', 'analyst.character.json', 'multi-chain', '{"focus": "research", "depth": "comprehensive"}'),
('developer-001', 'developer', 'developer.character.json', 'multi-chain', '{"focus": "optimization", "innovation": "high"}'),
('mev-analyst-001', 'mev-analyst', 'mev-analyst.character.json', 'multi-chain', '{"focus": "competitor_analysis", "specialization": "dune_analytics"}') 