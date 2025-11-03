-- This script defines the comprehensive database schema for the AI Flashloan Arbitrage Syndicate's World Model.
-- It is designed to be the single source of truth for all historical market data,
-- enabling deep pre-training and sophisticated market analysis.

-- ====================================================================================
-- 1. Market Regimes & Cycles
-- ====================================================================================
CREATE TABLE IF NOT EXISTS market_regimes (
    id SERIAL PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE,
    regime_name VARCHAR(100) NOT NULL, -- e.g., '2020-2022 Bull', '2022-2024 Bear'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================
-- 2. Daily Composite Indices
-- These tables store the high-level, feature-engineered indices that will be the
-- primary input for the main predictive World Model (RNN/LSTM).
-- ====================================================================================
CREATE TABLE IF NOT EXISTS daily_composite_indices (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL UNIQUE,
    market_regime_id INTEGER REFERENCES market_regimes(id),
    
    -- Composite Indices
    network_health_index REAL,
    holder_profitability_index REAL,
    leverage_risk_index REAL,
    narrative_momentum_index REAL,
    macro_risk_index REAL,
    
    -- Metadata
    data_completeness_score REAL, -- Percentage of raw factors available for this day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================================
-- 3. Raw Historical Data Tables (Granular Factors)
-- These tables are designed to store the raw, daily values for all 80+ factors.
-- ====================================================================================

-- On-Chain Network Fundamentals
CREATE TABLE IF NOT EXISTS on_chain_fundamentals (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    realized_cap BIGINT,
    mvrv_ratio REAL,
    nupl REAL,
    sopr REAL,
    active_addresses INTEGER,
    transaction_count INTEGER,
    transaction_volume_usd BIGINT,
    nvt_ratio REAL,
    exchange_net_flow_usd BIGINT,
    hash_rate REAL,
    mining_difficulty REAL,
    miner_outflows_usd BIGINT,
    miner_revenue_usd BIGINT,
    UNIQUE(timestamp, asset_symbol)
);

-- Market-Based Technical Indicators
CREATE TABLE IF NOT EXISTS technical_indicators (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    sma_50 REAL,
    sma_200 REAL,
    ema_12 REAL,
    ema_26 REAL,
    macd REAL,
    rsi REAL,
    bollinger_upper REAL,
    bollinger_lower REAL,
    on_balance_volume BIGINT,
    UNIQUE(timestamp, asset_symbol)
);

-- Derivatives Market Intelligence
CREATE TABLE IF NOT EXISTS derivatives_intelligence (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    open_interest_usd BIGINT,
    funding_rate REAL,
    long_liquidations_usd BIGINT,
    short_liquidations_usd BIGINT,
    put_call_ratio REAL,
    implied_volatility REAL,
    UNIQUE(timestamp, asset_symbol)
);

-- DeFi Ecosystem Health
CREATE TABLE IF NOT EXISTS defi_ecosystem_health (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    protocol_name VARCHAR(100) NOT NULL,
    chain_name VARCHAR(50),
    tvl_usd BIGINT,
    dex_volume_24h_usd BIGINT,
    protocol_revenue_24h_usd BIGINT,
    stablecoin_market_cap_usd BIGINT,
    utilization_rate REAL,
    UNIQUE(timestamp, protocol_name)
);

-- Project-Level Fundamental Attributes
CREATE TABLE IF NOT EXISTS project_fundamentals (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    asset_symbol VARCHAR(20) NOT NULL,
    circulating_supply BIGINT,
    total_supply BIGINT,
    fdv_usd BIGINT,
    active_developers INTEGER,
    github_commits INTEGER,
    community_size INTEGER, -- e.g., sum of Twitter followers, Discord members
    UNIQUE(timestamp, asset_symbol)
);

-- Market Sentiment & Narrative Analysis
CREATE TABLE IF NOT EXISTS market_sentiment (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    fear_greed_index INTEGER,
    social_volume INTEGER,
    weighted_sentiment REAL,
    google_trends_score INTEGER,
    dominant_narrative VARCHAR(100),
    UNIQUE(timestamp)
);

-- Macroeconomic & Cross-Asset Linkages
CREATE TABLE IF NOT EXISTS macroeconomic_data (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    fed_funds_rate REAL,
    cpi REAL,
    dxy REAL,
    sp500_close REAL,
    nasdaq_close REAL,
    vix_close REAL,
    gold_price_usd REAL,
    btc_etf_net_flow_usd BIGINT,
    UNIQUE(timestamp)
);

-- ====================================================================================
-- 4. World Model Memory (Syndicate's Own Conclusions)
-- This is the critical table for storing the syndicate's own, self-generated
-- insights, making the World Model a true, learning entity.
-- ====================================================================================
CREATE TABLE IF NOT EXISTS world_model_memory (
    id SERIAL PRIMARY KEY,
    insight_id VARCHAR(100) UNIQUE NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- e.g., 'Protocol', 'Token', 'Market_Event'
    entity_name VARCHAR(255) NOT NULL,
    conclusion TEXT NOT NULL, -- The LLM-generated conclusion
    supporting_evidence JSONB, -- Key data points that led to the conclusion
    confidence_score REAL,
    source_service VARCHAR(100), -- e.g., 'ProtocolViabilityPredictor'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_world_model_memory_entity ON world_model_memory(entity_type, entity_name);

-- ====================================================================================
-- 5. World Model Judgments (Historical Analysis)
-- Stores the LLM Judge's high-level analysis of historical market states,
-- creating a rich, qualitative training dataset for the World Model.
-- ====================================================================================
CREATE TABLE IF NOT EXISTS world_model_judgments (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL UNIQUE,
    market_regime_id INTEGER REFERENCES market_regimes(id),
    composite_indices JSONB NOT NULL,
    judgment_text TEXT NOT NULL, -- The LLM Judge's causal analysis
    causal_relationships JSONB, -- Structured causal links identified by the Judge
    predicted_outcome TEXT, -- NEW: The Judge's specific, falsifiable prediction
    actual_outcome TEXT, -- NEW: The ground truth outcome, filled in later
    verification_status VARCHAR(50) DEFAULT 'unverified', -- NEW: unverified, verified_correct, verified_incorrect
    confidence_score REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_world_model_judgments_timestamp ON world_model_judgments(timestamp);
