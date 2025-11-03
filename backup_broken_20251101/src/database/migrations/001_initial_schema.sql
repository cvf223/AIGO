-- 🗄️ MIGRATION 001: Initial Construction Syndicate Schema
-- =========================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Core agent tables
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) UNIQUE NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    state JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agents_type ON agents(agent_type);
CREATE INDEX idx_agents_updated ON agents(updated_at DESC);

-- Agent performance tracking
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    performance_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    success BOOLEAN DEFAULT true,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_perf_agent ON agent_performance(agent_id);
CREATE INDEX idx_agent_perf_time ON agent_performance(timestamp DESC);
CREATE INDEX idx_agent_perf_success ON agent_performance(success);

-- Knowledge Graph - using node_id consistently
CREATE TABLE IF NOT EXISTS kg_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding_data BYTEA,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX idx_kg_nodes_updated ON kg_nodes(updated_at DESC);

-- Knowledge Graph Edges
CREATE TABLE IF NOT EXISTS kg_edges (
    edge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    edge_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    weight FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kg_edges_source ON kg_edges(source_id);
CREATE INDEX idx_kg_edges_target ON kg_edges(target_id);
CREATE INDEX idx_kg_edges_type ON kg_edges(edge_type);

-- Agent Action History
CREATE TABLE IF NOT EXISTS agent_action_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB,
    success BOOLEAN DEFAULT true,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_action_agent ON agent_action_history(agent_id);
CREATE INDEX idx_agent_action_time ON agent_action_history(timestamp DESC);
CREATE INDEX idx_agent_action_type ON agent_action_history(action_type);

-- Agent Activations (for quantum entanglement)
CREATE TABLE IF NOT EXISTS agent_activations (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    task_id UUID NOT NULL,
    activated_for_concept VARCHAR(255),
    activation_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT true,
    execution_time_ms INTEGER
);

CREATE INDEX idx_agent_act_agent ON agent_activations(agent_id);
CREATE INDEX idx_agent_act_task ON agent_activations(task_id);
CREATE INDEX idx_agent_act_time ON agent_activations(activation_time DESC);

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

CREATE INDEX idx_construction_hist_date ON construction_historical_data(date DESC);
CREATE INDEX idx_construction_hist_region ON construction_historical_data(region);

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

CREATE INDEX idx_construction_forecast_date ON construction_price_forecasts(forecast_date DESC);

-- System State Persistence
CREATE TABLE IF NOT EXISTS system_state (
    id SERIAL PRIMARY KEY,
    component_name VARCHAR(255) NOT NULL UNIQUE,
    state_data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO schema_migrations (version, name) VALUES (1, 'initial_schema')
ON CONFLICT (version) DO NOTHING;

SELECT 'Migration 001 completed successfully' as status;
