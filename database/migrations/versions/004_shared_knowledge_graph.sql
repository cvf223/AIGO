-- Migration: 004_shared_knowledge_graph
-- Description: Add tables for Shared Knowledge Graph and collaborative learning
-- Author: Elite Syndicate System
-- Date: 2025-10-04

-- UP Migration
-- ============

-- Shared knowledge graph nodes
CREATE TABLE IF NOT EXISTS shared_kg_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content JSONB NOT NULL,
    contributors UUID[] NOT NULL,
    consensus_score DECIMAL(3,2) CHECK (consensus_score >= 0 AND consensus_score <= 1),
    verification_level DECIMAL(3,2) CHECK (verification_level >= 0 AND verification_level <= 1),
    quantum_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_validated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    promoted_at TIMESTAMP WITH TIME ZONE,
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type VARCHAR(50) DEFAULT 'shared'
);

-- Personal to shared knowledge links
CREATE TABLE IF NOT EXISTS personal_to_shared_links (
    personal_node_id UUID NOT NULL,
    shared_node_id UUID NOT NULL REFERENCES shared_kg_nodes(id) ON DELETE CASCADE,
    agent_id UUID NOT NULL,
    link_type VARCHAR(50) NOT NULL DEFAULT 'promoted',
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (personal_node_id, shared_node_id, agent_id)
);

-- Collective insights from multiple agents
CREATE TABLE IF NOT EXISTS collective_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID,
    synthesis JSONB NOT NULL,
    contributing_agents UUID[] NOT NULL,
    consensus_method VARCHAR(50) DEFAULT 'weighted_consensus',
    diversity_score DECIMAL(3,2) CHECK (diversity_score >= 0 AND diversity_score <= 1),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Personal knowledge graphs for agents
CREATE TABLE IF NOT EXISTS personal_kg_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID NOT NULL,
    content JSONB NOT NULL,
    type VARCHAR(50) DEFAULT 'personal',
    trust_score DECIMAL(3,2) DEFAULT 0.5,
    accepted_from_shared UUID REFERENCES shared_kg_nodes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consensus rounds for collaborative agreement
CREATE TABLE IF NOT EXISTS consensus_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal JSONB NOT NULL,
    participants UUID[] NOT NULL,
    votes JSONB[],
    consensus_achieved BOOLEAN DEFAULT FALSE,
    support_ratio DECIMAL(3,2),
    avg_confidence DECIMAL(3,2),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    dissenting_agents UUID[]
);

-- Truth verification results cache
CREATE TABLE IF NOT EXISTS truth_verification_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    input_hash VARCHAR(64) NOT NULL UNIQUE,
    verification_result JSONB NOT NULL,
    credibility_score DECIMAL(3,2) CHECK (credibility_score >= 0 AND credibility_score <= 1),
    verification_layers JSONB,
    issues TEXT[],
    recommendation VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Task context cache
CREATE TABLE IF NOT EXISTS task_context_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_hash VARCHAR(64) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    context JSONB NOT NULL,
    concept_count INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0
);

-- Knowledge propagation log
CREATE TABLE IF NOT EXISTS knowledge_propagation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_node_id UUID REFERENCES shared_kg_nodes(id),
    from_agent_id UUID,
    to_agent_id UUID,
    accepted BOOLEAN DEFAULT FALSE,
    rejection_reason VARCHAR(255),
    propagated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_kg_nodes_contributors ON shared_kg_nodes USING GIN(contributors);
CREATE INDEX IF NOT EXISTS idx_shared_kg_nodes_created_at ON shared_kg_nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_kg_nodes_access_count ON shared_kg_nodes(access_count DESC);
CREATE INDEX IF NOT EXISTS idx_shared_kg_nodes_consensus_score ON shared_kg_nodes(consensus_score DESC);

CREATE INDEX IF NOT EXISTS idx_personal_to_shared_agent ON personal_to_shared_links(agent_id);
CREATE INDEX IF NOT EXISTS idx_personal_to_shared_shared_node ON personal_to_shared_links(shared_node_id);

CREATE INDEX IF NOT EXISTS idx_collective_insights_contributors ON collective_insights USING GIN(contributing_agents);
CREATE INDEX IF NOT EXISTS idx_collective_insights_created_at ON collective_insights(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_personal_kg_agent ON personal_kg_nodes(agent_id);
CREATE INDEX IF NOT EXISTS idx_personal_kg_shared_ref ON personal_kg_nodes(accepted_from_shared);

CREATE INDEX IF NOT EXISTS idx_consensus_rounds_participants ON consensus_rounds USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_consensus_rounds_achieved ON consensus_rounds(consensus_achieved);

CREATE INDEX IF NOT EXISTS idx_truth_cache_hash ON truth_verification_cache(input_hash);
CREATE INDEX IF NOT EXISTS idx_truth_cache_expires ON truth_verification_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_context_cache_hash ON task_context_cache(task_hash);
CREATE INDEX IF NOT EXISTS idx_context_cache_type ON task_context_cache(task_type);
CREATE INDEX IF NOT EXISTS idx_context_cache_expires ON task_context_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_propagation_log_shared ON knowledge_propagation_log(shared_node_id);
CREATE INDEX IF NOT EXISTS idx_propagation_log_to_agent ON knowledge_propagation_log(to_agent_id);

-- Create function for auto-updating last_validated
CREATE OR REPLACE FUNCTION update_last_validated()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_validated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating last_validated
CREATE TRIGGER update_shared_kg_last_validated
    BEFORE UPDATE ON shared_kg_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_last_validated();

-- Create function for auto-incrementing access_count
CREATE OR REPLACE FUNCTION increment_access_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shared_kg_nodes 
    SET access_count = access_count + 1
    WHERE id = NEW.shared_node_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-incrementing access_count on propagation
CREATE TRIGGER increment_access_on_propagation
    AFTER INSERT ON knowledge_propagation_log
    FOR EACH ROW
    WHEN (NEW.accepted = TRUE)
    EXECUTE FUNCTION increment_access_count();

-- DOWN Migration
-- ==============

DROP TRIGGER IF EXISTS increment_access_on_propagation ON knowledge_propagation_log;
DROP TRIGGER IF EXISTS update_shared_kg_last_validated ON shared_kg_nodes;
DROP FUNCTION IF EXISTS increment_access_count();
DROP FUNCTION IF EXISTS update_last_validated();

DROP TABLE IF EXISTS knowledge_propagation_log CASCADE;
DROP TABLE IF EXISTS task_context_cache CASCADE;
DROP TABLE IF EXISTS truth_verification_cache CASCADE;
DROP TABLE IF EXISTS consensus_rounds CASCADE;
DROP TABLE IF EXISTS personal_kg_nodes CASCADE;
DROP TABLE IF EXISTS collective_insights CASCADE;
DROP TABLE IF EXISTS personal_to_shared_links CASCADE;
DROP TABLE IF EXISTS shared_kg_nodes CASCADE;
