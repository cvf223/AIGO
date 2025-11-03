-- ============================================================================
-- FIX MISSING DATABASE COLUMNS - PART 2
-- ============================================================================
-- BRUTAL TRUTH: Adding remaining tables with correct PostgreSQL syntax!

-- Add learning_sessions table for tracking learning performance
CREATE TABLE IF NOT EXISTS learning_sessions (
    id SERIAL PRIMARY KEY,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    strategy_name VARCHAR(100) NOT NULL,
    opportunities_generated INTEGER DEFAULT 0,
    opportunities_executed INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    total_profit_usd DECIMAL(20,2) DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    exploration_rate DECIMAL(5,2) DEFAULT 0,
    learning_rate DECIMAL(8,6) DEFAULT 0,
    performance_score DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    chain VARCHAR(20) DEFAULT 'arbitrum',
    agent_version VARCHAR(50) DEFAULT '1.0'
);

-- Create indexes with proper PostgreSQL syntax
CREATE INDEX IF NOT EXISTS idx_learning_sessions_start ON learning_sessions (session_start DESC);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_performance ON learning_sessions (performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_profit ON learning_sessions (total_profit_usd DESC);

-- Update current_price values with safe calculations
UPDATE current_pool_prices 
SET current_price = CASE 
    WHEN reserve0 > 0 AND reserve1 > 0 AND price_token0_usd > 0 AND price_token1_usd > 0 THEN 
        LEAST(10000, (reserve1::DECIMAL / GREATEST(reserve0::DECIMAL, 1)) * (price_token0_usd / price_token1_usd))
    ELSE 1.0
END
WHERE current_price IS NULL OR current_price = 0;

-- Update pools current_price as well
UPDATE pools 
SET current_price = 1.0
WHERE current_price IS NULL OR current_price = 0;

-- Show final data counts
SELECT 
    'pools' as table_name,
    COUNT(*) as record_count,
    COALESCE(SUM(liquidity), 0) as total_liquidity
FROM pools
UNION ALL
SELECT 
    'current_pool_prices' as table_name,
    COUNT(*) as record_count,
    COALESCE(SUM(liquidity_usd), 0) as total_liquidity
FROM current_pool_prices
UNION ALL
SELECT 
    'arbitrage_opportunities' as table_name,
    COUNT(*) as record_count,
    0 as total_liquidity
FROM arbitrage_opportunities
UNION ALL
SELECT 
    'learning_sessions' as table_name,
    COUNT(*) as record_count,
    0 as total_liquidity
FROM learning_sessions;

-- Verify current_price column has values
SELECT 
    pool_address,
    token0_symbol,
    token1_symbol,
    current_price,
    liquidity_usd
FROM current_pool_prices 
WHERE current_price IS NOT NULL
ORDER BY liquidity_usd DESC
LIMIT 5;

COMMIT; 