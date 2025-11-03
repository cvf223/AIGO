-- ============================================================================
-- Migration: Memory System Tables
-- Version: 002
-- Created: 2025-01-03
-- ============================================================================

-- UP
-- Additional tables for the advanced memory system

-- Memory system state persistence
CREATE TABLE IF NOT EXISTS memory_system_state (
    component_name VARCHAR(100) PRIMARY KEY,
    state_data JSONB NOT NULL,
    last_saved TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memory_state_component ON memory_system_state(component_name);
CREATE INDEX idx_memory_state_updated ON memory_system_state(updated_at DESC);

-- SEDM verification history
CREATE TABLE IF NOT EXISTS sedm_verifications (
    verification_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    knowledge_type VARCHAR(100),
    knowledge_content JSONB NOT NULL,
    control_reward DECIMAL(20,10),
    treatment_reward DECIMAL(20,10),
    utility_score DECIMAL(5,4),
    admitted BOOLEAN DEFAULT false,
    admission_reason VARCHAR(100),
    duration_ms INTEGER,
    verified_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sedm_admitted ON sedm_verifications(admitted);
CREATE INDEX idx_sedm_utility ON sedm_verifications(utility_score DESC);
CREATE INDEX idx_sedm_time ON sedm_verifications(verified_at DESC);

-- KG nodes archive table
CREATE TABLE IF NOT EXISTS kg_nodes_archive (
    node_id UUID PRIMARY KEY,
    node_type VARCHAR(50),
    concept_embedding FLOAT[],
    properties JSONB,
    confidence_score DECIMAL(3,2),
    consolidation_ts TIMESTAMPTZ,
    last_retrieved_ts TIMESTAMPTZ,
    created_by_agent VARCHAR(255),
    archived_at TIMESTAMPTZ DEFAULT NOW(),
    archive_reason VARCHAR(50)
);

CREATE INDEX idx_kg_archive_reason ON kg_nodes_archive(archive_reason);
CREATE INDEX idx_kg_archive_time ON kg_nodes_archive(archived_at DESC);

-- KG event tracking for temporal analysis
CREATE TABLE IF NOT EXISTS kg_node_events (
    id SERIAL PRIMARY KEY,
    node_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_time TIMESTAMPTZ DEFAULT NOW(),
    event_value DECIMAL(20,10),
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kg_events_node ON kg_node_events(node_id);
CREATE INDEX idx_kg_events_time ON kg_node_events(event_time DESC);
CREATE INDEX idx_kg_events_type ON kg_node_events(event_type);

-- Agent activation tracking for entanglement analysis
CREATE TABLE IF NOT EXISTS agent_activations (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255),
    activated_for_concept UUID,
    activation_time TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT false,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activations_agent ON agent_activations(agent_id);
CREATE INDEX idx_activations_task ON agent_activations(task_id);
CREATE INDEX idx_activations_time ON agent_activations(activation_time DESC);

-- Trajectory tracking for co-occurrence analysis
CREATE TABLE IF NOT EXISTS trajectories (
    trajectory_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    total_reward DECIMAL(20,10),
    path_nodes UUID[],
    start_ts TIMESTAMPTZ,
    end_ts TIMESTAMPTZ,
    agent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trajectories_reward ON trajectories(total_reward DESC);
CREATE INDEX idx_trajectories_time ON trajectories(created_at DESC);

-- Trajectory nodes mapping
CREATE TABLE IF NOT EXISTS trajectory_nodes (
    trajectory_id UUID NOT NULL,
    node_id UUID NOT NULL,
    position INTEGER NOT NULL,
    PRIMARY KEY (trajectory_id, node_id, position)
);

CREATE INDEX idx_trajectory_nodes_node ON trajectory_nodes(node_id);

-- System state table for memory backups
CREATE TABLE IF NOT EXISTS system_state (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent action history for reward tracking
CREATE TABLE IF NOT EXISTS agent_action_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100),
    reward DECIMAL(20,10),
    context JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_history_agent ON agent_action_history(agent_id);
CREATE INDEX idx_action_history_type ON agent_action_history(action_type);
CREATE INDEX idx_action_history_time ON agent_action_history(timestamp DESC);

-- Update timestamp trigger for memory_system_state
CREATE TRIGGER update_memory_system_state_updated_at 
BEFORE UPDATE ON memory_system_state
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DOWN
-- Drop all tables in reverse order

DROP TABLE IF EXISTS agent_action_history CASCADE;
DROP TABLE IF EXISTS system_state CASCADE;
DROP TABLE IF EXISTS trajectory_nodes CASCADE;
DROP TABLE IF EXISTS trajectories CASCADE;
DROP TABLE IF EXISTS agent_activations CASCADE;
DROP TABLE IF EXISTS kg_node_events CASCADE;
DROP TABLE IF EXISTS kg_nodes_archive CASCADE;
DROP TABLE IF EXISTS sedm_verifications CASCADE;
DROP TABLE IF EXISTS memory_system_state CASCADE;
