-- ============================================================================
-- FIX MISSING DATABASE COLUMNS
-- ============================================================================
-- BRUTAL TRUTH: Adding the missing columns that the code expects!

-- Connect to the correct database
\\c arbitrum_flash_specialist;

-- Add missing current_price column to current_pool_prices table
ALTER TABLE current_pool_prices 
ADD COLUMN IF NOT EXISTS current_price DECIMAL(20,8);

-- Update the current_price column with calculated values
UPDATE current_pool_prices 
SET current_price = CASE 
    WHEN reserve0 > 0 AND reserve1 > 0 THEN 
        (reserve1::DECIMAL / reserve0::DECIMAL) * (price_token0_usd / COALESCE(NULLIF(price_token1_usd, 0), 1))
    ELSE 1.0
END
WHERE current_price IS NULL;

-- Add missing columns to pools table if they don't exist
ALTER TABLE pools 
ADD COLUMN IF NOT EXISTS current_price DECIMAL(20,8) DEFAULT 1.0;

-- Add arbitrage_opportunities table for tracking opportunities
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    pool_address_1 VARCHAR(42) NOT NULL,
    pool_address_2 VARCHAR(42) NOT NULL,
    token0_symbol VARCHAR(20) NOT NULL,
    token1_symbol VARCHAR(20) NOT NULL,
    price_delta_percentage DECIMAL(10,4) NOT NULL,
    potential_profit_usd DECIMAL(20,2) NOT NULL,
    block_number BIGINT NOT NULL,
    opportunity_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    dex_1 VARCHAR(50) NOT NULL,
    dex_2 VARCHAR(50) NOT NULL,
    chain VARCHAR(20) DEFAULT 'arbitrum',
    status VARCHAR(20) DEFAULT 'detected',
    
    -- Indexes for performance
    INDEX idx_arbitrage_opportunities_timestamp (opportunity_timestamp DESC),
    INDEX idx_arbitrage_opportunities_profit (potential_profit_usd DESC),
    INDEX idx_arbitrage_opportunities_block (block_number DESC)
);

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
    agent_version VARCHAR(50) DEFAULT '1.0',
    
    -- Indexes
    INDEX idx_learning_sessions_start (session_start DESC),
    INDEX idx_learning_sessions_performance (performance_score DESC),
    INDEX idx_learning_sessions_profit (total_profit_usd DESC)
);

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('pools', 'current_pool_prices', 'arbitrage_opportunities', 'learning_sessions')
ORDER BY table_name, ordinal_position;

-- Show current data counts
SELECT 
    'pools' as table_name,
    COUNT(*) as record_count,
    SUM(liquidity) as total_liquidity
FROM pools
UNION ALL
SELECT 
    'current_pool_prices' as table_name,
    COUNT(*) as record_count,
    SUM(liquidity_usd) as total_liquidity
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

COMMIT; 