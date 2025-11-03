-- MEV Competitor Analysis Database Schema
-- Stores competitor profiles, strategies, market insights, and success patterns

-- Table for tracking MEV competitor bots
CREATE TABLE IF NOT EXISTS mev_competitors (
    address VARCHAR(42) PRIMARY KEY,
    total_profit NUMERIC(78, 0) NOT NULL DEFAULT 0,
    total_volume NUMERIC(78, 0) NOT NULL DEFAULT 0,
    transaction_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
    avg_gas_used NUMERIC(78, 0) NOT NULL DEFAULT 0,
    preferred_dexs TEXT[] DEFAULT '{}',
    preferred_pairs TEXT[] DEFAULT '{}',
    strategies TEXT[] DEFAULT '{}',
    chains TEXT[] DEFAULT '{}',
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for competitor queries
CREATE INDEX idx_mev_competitors_profit ON mev_competitors(total_profit DESC);
CREATE INDEX idx_mev_competitors_success_rate ON mev_competitors(success_rate DESC);
CREATE INDEX idx_mev_competitors_chains ON mev_competitors USING GIN(chains);
CREATE INDEX idx_mev_competitors_updated ON mev_competitors(updated_at DESC);

-- Table for market insights by chain/dex/pair
CREATE TABLE IF NOT EXISTS market_insights (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    dex VARCHAR(100) NOT NULL,
    pair VARCHAR(100) NOT NULL,
    volume_24h NUMERIC(78, 0) NOT NULL DEFAULT 0,
    profitability DECIMAL(10, 6) NOT NULL DEFAULT 0,
    competition INTEGER NOT NULL DEFAULT 0,
    opportunities INTEGER NOT NULL DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for market insights
CREATE INDEX idx_market_insights_chain ON market_insights(chain);
CREATE INDEX idx_market_insights_timestamp ON market_insights(timestamp DESC);
CREATE INDEX idx_market_insights_opportunity ON market_insights(
    ((volume_24h::numeric / 1e18) * profitability / GREATEST(1, competition)) DESC
);

-- Table for MEV success patterns
CREATE TABLE IF NOT EXISTS mev_success_patterns (
    id SERIAL PRIMARY KEY,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_data JSONB NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for success patterns
CREATE INDEX idx_mev_patterns_type ON mev_success_patterns(pattern_type);
CREATE INDEX idx_mev_patterns_timestamp ON mev_success_patterns(timestamp DESC);

-- Table for arbitrage strategy tracking
CREATE TABLE IF NOT EXISTS arbitrage_strategies (
    id SERIAL PRIMARY KEY,
    strategy_key VARCHAR(500) UNIQUE NOT NULL,
    strategy_type VARCHAR(50) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    dex_path TEXT[] NOT NULL,
    token_path TEXT[] DEFAULT '{}',
    avg_profit NUMERIC(78, 0) NOT NULL DEFAULT 0,
    total_profit NUMERIC(78, 0) NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
    gas_efficiency INTEGER NOT NULL DEFAULT 0,
    frequency INTEGER NOT NULL DEFAULT 1,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for strategies
CREATE INDEX idx_arbitrage_strategies_chain ON arbitrage_strategies(chain);
CREATE INDEX idx_arbitrage_strategies_success ON arbitrage_strategies(success_rate DESC);
CREATE INDEX idx_arbitrage_strategies_profit ON arbitrage_strategies(avg_profit DESC);

-- Table for tracking DEX performance metrics
CREATE TABLE IF NOT EXISTS dex_performance (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    dex_address VARCHAR(42) NOT NULL,
    dex_name VARCHAR(100),
    volume_24h NUMERIC(78, 0) NOT NULL DEFAULT 0,
    arbitrage_volume_24h NUMERIC(78, 0) NOT NULL DEFAULT 0,
    arbitrage_count INTEGER NOT NULL DEFAULT 0,
    avg_slippage DECIMAL(10, 6) DEFAULT 0,
    liquidity_depth NUMERIC(78, 0) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(chain, dex_address, timestamp)
);

-- Indexes for DEX performance
CREATE INDEX idx_dex_performance_chain_dex ON dex_performance(chain, dex_address);
CREATE INDEX idx_dex_performance_volume ON dex_performance(arbitrage_volume_24h DESC);

-- Table for token pair analysis
CREATE TABLE IF NOT EXISTS token_pair_analysis (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    token0_address VARCHAR(42) NOT NULL,
    token1_address VARCHAR(42) NOT NULL,
    token0_symbol VARCHAR(20),
    token1_symbol VARCHAR(20),
    volume_24h NUMERIC(78, 0) NOT NULL DEFAULT 0,
    volatility DECIMAL(10, 6) DEFAULT 0,
    arbitrage_opportunities INTEGER NOT NULL DEFAULT 0,
    avg_profit_per_arb NUMERIC(78, 0) DEFAULT 0,
    liquidity_sources INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for token pairs
CREATE INDEX idx_token_pairs_chain ON token_pair_analysis(chain);
CREATE INDEX idx_token_pairs_volume ON token_pair_analysis(volume_24h DESC);
CREATE INDEX idx_token_pairs_opportunities ON token_pair_analysis(arbitrage_opportunities DESC);

-- Table for competitor transaction history
CREATE TABLE IF NOT EXISTS competitor_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    bot_address VARCHAR(42) NOT NULL,
    block_number BIGINT NOT NULL,
    dex_path TEXT[] NOT NULL,
    token_path TEXT[] NOT NULL,
    profit NUMERIC(78, 0) NOT NULL,
    gas_used BIGINT NOT NULL,
    gas_price NUMERIC(78, 0) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT true,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for competitor transactions
CREATE INDEX idx_competitor_tx_bot ON competitor_transactions(bot_address);
CREATE INDEX idx_competitor_tx_profit ON competitor_transactions(profit DESC);
CREATE INDEX idx_competitor_tx_timestamp ON competitor_transactions(timestamp DESC);

-- Table for real-time MEV opportunities
CREATE TABLE IF NOT EXISTS mev_opportunities (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) UNIQUE NOT NULL,
    chain VARCHAR(50) NOT NULL,
    opportunity_type VARCHAR(50) NOT NULL,
    dex_path TEXT[] NOT NULL,
    token_path TEXT[] NOT NULL,
    estimated_profit NUMERIC(78, 0) NOT NULL,
    gas_estimate BIGINT NOT NULL,
    competition_level INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    captured BOOLEAN DEFAULT false,
    captured_by VARCHAR(42),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for opportunities
CREATE INDEX idx_mev_opportunities_chain ON mev_opportunities(chain);
CREATE INDEX idx_mev_opportunities_profit ON mev_opportunities(estimated_profit DESC);
CREATE INDEX idx_mev_opportunities_active ON mev_opportunities(captured, expires_at) WHERE captured = false;

-- View for top performing strategies by chain
CREATE OR REPLACE VIEW top_strategies_by_chain AS
SELECT 
    chain,
    strategy_key,
    strategy_type,
    dex_path,
    avg_profit,
    success_rate,
    frequency,
    gas_efficiency
FROM arbitrage_strategies
WHERE success_rate > 0.5
ORDER BY chain, (avg_profit * success_rate) DESC;

-- View for market opportunity scores
CREATE OR REPLACE VIEW market_opportunity_scores AS
SELECT 
    chain,
    dex,
    pair,
    volume_24h,
    profitability,
    competition,
    opportunities,
    (volume_24h::numeric / 1e18 * profitability / GREATEST(1, competition)) as opportunity_score,
    timestamp
FROM market_insights
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY opportunity_score DESC;

-- Function to calculate competitor performance metrics
CREATE OR REPLACE FUNCTION calculate_competitor_metrics(p_address VARCHAR)
RETURNS TABLE (
    total_profit NUMERIC,
    avg_profit_per_tx NUMERIC,
    success_rate DECIMAL,
    preferred_chain VARCHAR,
    preferred_time_of_day INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(ct.profit), 0) as total_profit,
        COALESCE(AVG(ct.profit), 0) as avg_profit_per_tx,
        COALESCE(AVG(CASE WHEN ct.success THEN 1.0 ELSE 0.0 END), 0) as success_rate,
        MODE() WITHIN GROUP (ORDER BY ct.chain) as preferred_chain,
        MODE() WITHIN GROUP (ORDER BY EXTRACT(HOUR FROM ct.timestamp)) as preferred_time_of_day
    FROM competitor_transactions ct
    WHERE ct.bot_address = p_address
    AND ct.timestamp > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update competitor profiles when new transactions are added
CREATE OR REPLACE FUNCTION update_competitor_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Update or insert competitor profile
    INSERT INTO mev_competitors (
        address,
        total_profit,
        transaction_count,
        success_rate,
        avg_gas_used,
        chains,
        last_seen
    ) VALUES (
        NEW.bot_address,
        NEW.profit,
        1,
        CASE WHEN NEW.success THEN 1.0 ELSE 0.0 END,
        NEW.gas_used,
        ARRAY[NEW.chain],
        NEW.timestamp
    )
    ON CONFLICT (address) DO UPDATE SET
        total_profit = mev_competitors.total_profit + NEW.profit,
        transaction_count = mev_competitors.transaction_count + 1,
        success_rate = (
            mev_competitors.success_rate * mev_competitors.transaction_count + 
            CASE WHEN NEW.success THEN 1.0 ELSE 0.0 END
        ) / (mev_competitors.transaction_count + 1),
        avg_gas_used = (
            mev_competitors.avg_gas_used * mev_competitors.transaction_count + 
            NEW.gas_used
        ) / (mev_competitors.transaction_count + 1),
        chains = CASE 
            WHEN NEW.chain = ANY(mev_competitors.chains) THEN mev_competitors.chains
            ELSE array_append(mev_competitors.chains, NEW.chain)
        END,
        last_seen = GREATEST(mev_competitors.last_seen, NEW.timestamp),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_competitor_profile
AFTER INSERT ON competitor_transactions
FOR EACH ROW
EXECUTE FUNCTION update_competitor_profile(); 