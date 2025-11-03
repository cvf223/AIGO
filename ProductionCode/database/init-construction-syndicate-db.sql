-- 🗄️ CONSTRUCTION SYNDICATE DATABASE INITIALIZATION
-- ==================================================
-- 
-- Creates AIGO_Construction_Syndicate database with all required tables
-- 
-- Usage: psql -U postgres -f database/init-construction-syndicate-db.sql

-- Create database (if not exists)
SELECT 'CREATE DATABASE "AIGO_Construction_Syndicate"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'AIGO_Construction_Syndicate')\gexec

-- Connect to the database
\c AIGO_Construction_Syndicate

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- DECISION ESCALATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS decision_escalations (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255) UNIQUE NOT NULL,
    agent_id VARCHAR(255) NOT NULL,
    decision_data JSONB NOT NULL,
    judgment_data JSONB NOT NULL,
    confidence NUMERIC(5,3) NOT NULL,
    threshold NUMERIC(5,3) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_review',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution JSONB
);

CREATE INDEX IF NOT EXISTS idx_escalations_status ON decision_escalations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_agent ON decision_escalations(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escalations_confidence ON decision_escalations(confidence);

-- ============================================
-- CONSTRUCTION PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS construction_projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    project_name VARCHAR(500) NOT NULL,
    phase VARCHAR(50) NOT NULL, -- 'LP6' or 'LP7'
    project_data JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    results JSONB
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON construction_projects(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON construction_projects(phase);

-- ============================================
-- CONSTRUCTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS construction_plans (
    id SERIAL PRIMARY KEY,
    plan_id VARCHAR(255) UNIQUE NOT NULL,
    project_id VARCHAR(255) REFERENCES construction_projects(project_id),
    plan_path VARCHAR(1000) NOT NULL,
    plan_type VARCHAR(100) NOT NULL, -- 'floor_plan', 'elevation', 'section', 'detail'
    analysis_result JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_project ON construction_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_plans_type ON construction_plans(plan_type);

-- ============================================
-- ERROR ESCALATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS error_escalations (
    id SERIAL PRIMARY KEY,
    escalation_id VARCHAR(255) UNIQUE NOT NULL,
    project_id VARCHAR(255) REFERENCES construction_projects(project_id),
    error_data JSONB NOT NULL,
    proposed_solutions JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending_human_review',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution JSONB
);

CREATE INDEX IF NOT EXISTS idx_error_escalations_status ON error_escalations(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_escalations_priority ON error_escalations(priority, created_at DESC);

-- ============================================
-- KNOWLEDGE GRAPH NODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_graph_nodes (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(255) UNIQUE NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL,
    embedding_json JSONB, -- Embeddings stored as JSONB (pgvector not required)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON knowledge_graph_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_created ON knowledge_graph_nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_properties ON knowledge_graph_nodes USING GIN(properties);

-- ============================================
-- KNOWLEDGE GRAPH EDGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
    id SERIAL PRIMARY KEY,
    edge_id VARCHAR(255) UNIQUE NOT NULL,
    source_node_id VARCHAR(255) NOT NULL,
    target_node_id VARCHAR(255) NOT NULL,
    edge_type VARCHAR(100) NOT NULL,
    properties JSONB,
    weight NUMERIC(5,3) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_edges_source ON knowledge_graph_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_target ON knowledge_graph_edges(target_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_type ON knowledge_graph_edges(edge_type);

-- ============================================
-- QUANTUM MEMORY STATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quantum_memory_states (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    state_type VARCHAR(100) NOT NULL,
    quantum_data JSONB NOT NULL,
    memory_importance_score NUMERIC(5,3) DEFAULT 0.5,
    access_frequency INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quantum_memory_agent ON quantum_memory_states(agent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_quantum_memory_importance ON quantum_memory_states(memory_importance_score DESC);

-- ============================================
-- ADAPTIVE META MEMORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS adaptive_meta_memory (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    memory_type VARCHAR(100) NOT NULL,
    memory_data JSONB NOT NULL,
    evolution_score NUMERIC(5,3) DEFAULT 0.5,
    compression_ratio NUMERIC(5,3) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meta_memory_agent ON adaptive_meta_memory(agent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_meta_memory_evolution ON adaptive_meta_memory(evolution_score DESC);

-- ============================================
-- LLM PERFORMANCE METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS llm_performance_metrics (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    quantization VARCHAR(50) NOT NULL,
    accuracy NUMERIC(5,3),
    latency_ms INTEGER,
    memory_usage_gb NUMERIC(8,2),
    tokens_generated INTEGER,
    success BOOLEAN NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_llm_perf_model ON llm_performance_metrics(model_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_llm_perf_task ON llm_performance_metrics(task_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_llm_perf_quant ON llm_performance_metrics(quantization, timestamp DESC);

-- ============================================
-- SYSTEM METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    metric_value NUMERIC(12,4) NOT NULL,
    metric_unit VARCHAR(50),
    metadata JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_metrics_time ON system_metrics(timestamp DESC);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
    'Database initialized successfully' as status,
    COUNT(*) as tables_created
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';

