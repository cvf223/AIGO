-- =============================================================================
-- ELITE AI ARBITRAGE SYNDICATE - MASTER DATABASE SCHEMA
-- =============================================================================
-- This file is the single source of truth for the syndicate's database schema.
-- It is designed to be idempotent, using "CREATE TABLE IF NOT EXISTS".
--
-- To initialize or update the database, run the `initialize-db.js` script.
-- =============================================================================

-- Table for Timeboost Prediction Agent's learned patterns
CREATE TABLE IF NOT EXISTS mev_patterns (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    pattern_type VARCHAR(50),
    pattern_data JSONB,
    success_rate REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing Timeboost auction results and performance
CREATE TABLE IF NOT EXISTS timeboost_auctions (
    id SERIAL PRIMARY KEY,
    round BIGINT NOT NULL,
    bid_amount NUMERIC,
    winning_bid NUMERIC,
    won BOOLEAN,
    participant VARCHAR(255),
    profit_earned NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tables for AI model and prediction storage
CREATE TABLE IF NOT EXISTS ai_models (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    model_data BYTEA,
    version INTEGER,
    accuracy REAL,
    last_trained TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_predictions (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    prediction_data JSONB,
    market_conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking builder bids on PBS chains
CREATE TABLE IF NOT EXISTS builder_bids (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    builder VARCHAR(255),
    bid_amount NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking basic block information
CREATE TABLE IF NOT EXISTS blocks (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    block_number BIGINT NOT NULL,
    builder VARCHAR(255),
    validator VARCHAR(255),
    contains_mev BOOLEAN,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking basic transaction information
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    success BOOLEAN,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for caching token prices
CREATE TABLE IF NOT EXISTS token_prices (
    id SERIAL PRIMARY KEY,
    token VARCHAR(50) NOT NULL,
    price NUMERIC NOT NULL,
    source VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing observed swap events
CREATE TABLE IF NOT EXISTS swaps (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50),
    block_number BIGINT,
    tx_hash VARCHAR(66),
    pool_address VARCHAR(42),
    amount_in NUMERIC,
    amount_out NUMERIC,
    amount_usd NUMERIC,
    price_impact REAL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing identified arbitrage opportunities
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id SERIAL PRIMARY KEY,
    profit_usd NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing discovered liquidity pools
CREATE TABLE IF NOT EXISTS pools (
    id SERIAL PRIMARY KEY,
    chain VARCHAR(50) NOT NULL,
    address VARCHAR(42) NOT NULL,
    pool_address VARCHAR(42), -- For compatibility with existing queries
    token0_reserve NUMERIC,
    token1_reserve NUMERIC,
    liquidity_usd NUMERIC,
    UNIQUE(chain, address)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mev_patterns_agent_id ON mev_patterns(agent_id);
CREATE INDEX IF NOT EXISTS idx_timeboost_auctions_participant ON timeboost_auctions(participant);
CREATE INDEX IF NOT EXISTS idx_token_prices_token ON token_prices(token);
CREATE INDEX IF NOT EXISTS idx_swaps_chain ON swaps(chain);
CREATE INDEX IF NOT EXISTS idx_pools_chain_address ON pools(chain, address);
