-- 🏦 ARBITRAGE SYSTEM DATABASE SCHEMA
-- ================================
--
-- Complete database schema for the arbitrage system with:
-- - Agent state tracking
-- - Opportunity detection and analysis
-- - Execution history
-- - Agent thresholds and configurations
-- - Competitive intelligence tracking

-- 🧠 AGENT STATE TABLE
-- ===================
-- Stores agent memory and performance data
CREATE TABLE IF NOT EXISTS agent_state (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL UNIQUE,
    memory_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    alphago_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_state_agent_id ON agent_state(agent_id);

-- 💰 ARBITRAGE OPPORTUNITIES TABLE
-- ==============================
-- Stores detected arbitrage opportunities
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) NOT NULL UNIQUE,
    token_pair VARCHAR(100) NOT NULL,
    pool_a VARCHAR(100) NOT NULL,
    pool_b VARCHAR(100) NOT NULL,
    estimated_profit_usd NUMERIC(20, 6) NOT NULL,
    gas_estimate INTEGER NOT NULL,
    confidence NUMERIC(5, 4) NOT NULL,
    decision_score NUMERIC(5, 4) NOT NULL,
    should_execute BOOLEAN NOT NULL,
    chain VARCHAR(50) NOT NULL,
    detected_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_token_pair ON arbitrage_opportunities(token_pair);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_chain ON arbitrage_opportunities(chain);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_detected_at ON arbitrage_opportunities(detected_at);
CREATE INDEX IF NOT EXISTS idx_arbitrage_opportunities_profit ON arbitrage_opportunities(estimated_profit_usd DESC);

-- 📊 ARBITRAGE EXECUTIONS TABLE
-- ===========================
-- Stores execution history for arbitrage opportunities
CREATE TABLE IF NOT EXISTS arbitrage_executions (
    id SERIAL PRIMARY KEY,
    opportunity_id VARCHAR(100) NOT NULL,
    token_pair VARCHAR(100) NOT NULL,
    estimated_profit_usd NUMERIC(20, 6) NOT NULL,
    actual_profit_usd NUMERIC(20, 6),
    gas_used INTEGER,
    gas_price_gwei NUMERIC(20, 9),
    success BOOLEAN NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    transaction_hash VARCHAR(100),
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arbitrage_executions_opportunity_id ON arbitrage_executions(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_arbitrage_executions_success ON arbitrage_executions(success);
CREATE INDEX IF NOT EXISTS idx_arbitrage_executions_executed_at ON arbitrage_executions(executed_at);

-- 🎯 AGENT THRESHOLDS TABLE
-- =======================
-- Stores profit thresholds for different agent types
CREATE TABLE IF NOT EXISTS agent_thresholds (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL UNIQUE,
    min_profit_threshold NUMERIC(20, 6) NOT NULL,
    gas_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.15,
    max_slippage NUMERIC(5, 4) NOT NULL DEFAULT 0.005,
    confidence_threshold NUMERIC(5, 4) NOT NULL DEFAULT 0.65,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_thresholds_agent_id ON agent_thresholds(agent_id);

-- 🏆 COMPETITOR PERFORMANCE TABLE
-- ============================
-- Tracks competitor performance for competitive intelligence
CREATE TABLE IF NOT EXISTS competitor_performance (
    id SERIAL PRIMARY KEY,
    competitor_id VARCHAR(100) NOT NULL,
    avg_profit_usd NUMERIC(20, 6) NOT NULL,
    max_profit_usd NUMERIC(20, 6) NOT NULL,
    success_rate NUMERIC(5, 4) NOT NULL,
    execution_count INTEGER NOT NULL DEFAULT 0,
    last_profitable_execution TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitor_performance_competitor_id ON competitor_performance(competitor_id);
CREATE INDEX IF NOT EXISTS idx_competitor_performance_avg_profit ON competitor_performance(avg_profit_usd DESC);

-- 💧 FLASH LOAN EXECUTIONS TABLE
-- ===========================
-- Tracks flash loan executions for performance analysis
CREATE TABLE IF NOT EXISTS flash_loan_executions (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER REFERENCES arbitrage_executions(id),
    provider VARCHAR(50) NOT NULL,
    token_address VARCHAR(100) NOT NULL,
    amount_wei VARCHAR(100) NOT NULL,
    fee_wei VARCHAR(100) NOT NULL,
    gas_used INTEGER,
    success BOOLEAN NOT NULL,
    transaction_hash VARCHAR(100),
    executed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flash_loan_executions_provider ON flash_loan_executions(provider);
CREATE INDEX IF NOT EXISTS idx_flash_loan_executions_execution_id ON flash_loan_executions(execution_id);

-- 🔄 POOL PRICE HISTORY TABLE
-- =========================
-- Stores historical pool prices for analysis
CREATE TABLE IF NOT EXISTS pool_price_history (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(100) NOT NULL,
    token0_address VARCHAR(100) NOT NULL,
    token1_address VARCHAR(100) NOT NULL,
    price_0_1 NUMERIC(30, 18) NOT NULL,
    price_1_0 NUMERIC(30, 18) NOT NULL,
    liquidity_usd NUMERIC(30, 6),
    chain VARCHAR(50) NOT NULL,
    block_number BIGINT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pool_price_history_pool ON pool_price_history(pool_address);
CREATE INDEX IF NOT EXISTS idx_pool_price_history_timestamp ON pool_price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_pool_price_history_chain ON pool_price_history(chain);

-- 📝 AGENT LOGS TABLE
-- =================
-- Stores agent logs for debugging and analysis
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_log_level ON agent_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON agent_logs(created_at);

-- 🧪 DEFAULT AGENT THRESHOLDS
-- ========================
-- Insert default thresholds for different agent types
INSERT INTO agent_thresholds (agent_id, min_profit_threshold, gas_multiplier, max_slippage, confidence_threshold)
VALUES 
    ('ArbitrumFlashSpecialist', 50000, 1.15, 0.005, 0.65),
    ('BaseSpeedDemon', 10000, 1.25, 0.01, 0.60),
    ('PolygonMicroKing', 1000, 1.5, 0.02, 0.55)
ON CONFLICT (agent_id) DO NOTHING;

-- 📊 VIEWS
-- =======

-- View for agent performance metrics
CREATE OR REPLACE VIEW agent_performance_metrics AS
SELECT 
    a.agent_id,
    COUNT(e.id) AS total_executions,
    SUM(CASE WHEN e.success THEN 1 ELSE 0 END) AS successful_executions,
    CASE 
        WHEN COUNT(e.id) > 0 THEN 
            ROUND((SUM(CASE WHEN e.success THEN 1 ELSE 0 END)::NUMERIC / COUNT(e.id)::NUMERIC) * 100, 2)
        ELSE 0
    END AS success_rate,
    SUM(CASE WHEN e.success THEN e.actual_profit_usd ELSE 0 END) AS total_profit_usd,
    MAX(CASE WHEN e.success THEN e.actual_profit_usd ELSE 0 END) AS largest_profit_usd,
    AVG(CASE WHEN e.success THEN e.execution_time_ms ELSE NULL END) AS avg_execution_time_ms,
    AVG(CASE WHEN e.success THEN e.gas_used ELSE NULL END) AS avg_gas_used
FROM 
    agent_state a
LEFT JOIN 
    arbitrage_executions e ON e.opportunity_id IN (
        SELECT opportunity_id FROM arbitrage_opportunities 
        WHERE should_execute = TRUE
    )
GROUP BY 
    a.agent_id;

-- View for competitive analysis
CREATE OR REPLACE VIEW competitive_analysis AS
SELECT 
    DATE_TRUNC('day', e.executed_at) AS day,
    COUNT(DISTINCT e.id) AS total_opportunities,
    SUM(CASE WHEN e.success THEN 1 ELSE 0 END) AS successful_executions,
    ROUND(AVG(e.estimated_profit_usd), 2) AS avg_estimated_profit,
    ROUND(AVG(CASE WHEN e.success THEN e.actual_profit_usd ELSE NULL END), 2) AS avg_actual_profit,
    ROUND(AVG(e.execution_time_ms), 2) AS avg_execution_time_ms,
    COUNT(DISTINCT o.token_pair) AS unique_token_pairs
FROM 
    arbitrage_executions e
JOIN 
    arbitrage_opportunities o ON e.opportunity_id = o.opportunity_id
GROUP BY 
    DATE_TRUNC('day', e.executed_at)
ORDER BY 
    day DESC; 