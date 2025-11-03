-- 🗄️ COMPLETE DATABASE SCHEMA FOR CONSTRUCTION SYNDICATE
-- =======================================================
-- Creates ALL tables needed by the system

-- Agent Performance Tracking
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_perf_agent ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_perf_time ON agent_performance(timestamp DESC);

-- Knowledge Graph Nodes (without vector - optional for now)
CREATE TABLE IF NOT EXISTS kg_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding_data BYTEA,  -- Stored as bytes instead of vector type
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON kg_nodes(node_type);

-- Knowledge Graph Edges
CREATE TABLE IF NOT EXISTS kg_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES kg_nodes(id),
    target_id UUID NOT NULL REFERENCES kg_nodes(id),
    edge_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON kg_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON kg_edges(target_id);

-- Agent Action History
CREATE TABLE IF NOT EXISTS agent_action_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_action_agent ON agent_action_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_action_time ON agent_action_history(timestamp DESC);

-- Construction Historical Data
CREATE TABLE IF NOT EXISTS construction_historical_data (
    id SERIAL PRIMARY KEY,
    date TIMESTAMPTZ NOT NULL,
    region VARCHAR(50) NOT NULL,
    material_indices JSONB NOT NULL DEFAULT '{}'::jsonb,
    labor_indices JSONB NOT NULL DEFAULT '{}'::jsonb,
    supply_chain_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    regulatory_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
    economic_indicators JSONB NOT NULL DEFAULT '{}'::jsonb,
    weather_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_construction_hist_date ON construction_historical_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_construction_hist_region ON construction_historical_data(region);

-- Construction Price Forecasts
CREATE TABLE IF NOT EXISTS construction_price_forecasts (
    id SERIAL PRIMARY KEY,
    forecast_date TIMESTAMPTZ NOT NULL,
    target_month INT NOT NULL,
    region VARCHAR(50) NOT NULL,
    forecast_data JSONB NOT NULL,
    confidence_score FLOAT NOT NULL,
    model_version VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_construction_forecast_date ON construction_price_forecasts(forecast_date DESC);

-- System State Persistence
CREATE TABLE IF NOT EXISTS system_state (
    id SERIAL PRIMARY KEY,
    component_name VARCHAR(255) NOT NULL UNIQUE,
    state_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: pgvector extension optional - using BYTEA for embeddings
-- To enable later: CREATE EXTENSION IF NOT EXISTS vector;

SELECT 'All tables created successfully' as status;

