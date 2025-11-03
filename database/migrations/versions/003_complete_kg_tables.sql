-- ============================================================================
-- Migration: Complete Knowledge Graph Tables
-- Version: 003
-- Created: 2025-01-03
-- ============================================================================

-- UP
-- Create KG tables if they don't exist (in case they weren't in initial migration)

-- Core Knowledge Graph nodes
CREATE TABLE IF NOT EXISTS kg_nodes (
    node_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_type VARCHAR(50) NOT NULL,
    concept_embedding FLOAT[] NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    consolidation_ts TIMESTAMPTZ DEFAULT NOW(),
    last_retrieved_ts TIMESTAMPTZ DEFAULT NOW(),
    created_by_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_confidence ON kg_nodes(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_retrieved ON kg_nodes(last_retrieved_ts DESC);

-- Add foreign key if syndicate_agents exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'syndicate_agents') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'kg_nodes_created_by_agent_fkey'
        ) THEN
            ALTER TABLE kg_nodes 
            ADD CONSTRAINT kg_nodes_created_by_agent_fkey 
            FOREIGN KEY (created_by_agent) REFERENCES syndicate_agents(agent_id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Knowledge Graph relationships
CREATE TABLE IF NOT EXISTS kg_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_node_id UUID NOT NULL,
    target_node_id UUID NOT NULL,
    relationship_type VARCHAR(100) NOT NULL,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    provenance_agent VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (source_node_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    FOREIGN KEY (target_node_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kg_rel_source ON kg_relationships(source_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_rel_target ON kg_relationships(target_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_rel_type ON kg_relationships(relationship_type);

-- Quantum-inspired entanglements
CREATE TABLE IF NOT EXISTS kg_entanglements (
    entanglement_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    node_a_id UUID NOT NULL,
    node_b_id UUID NOT NULL,
    entanglement_strength DECIMAL(3,2) NOT NULL,
    calculation_method VARCHAR(50),
    evidence_trajectories UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (node_a_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    FOREIGN KEY (node_b_id) REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    UNIQUE(node_a_id, node_b_id)
);

CREATE INDEX IF NOT EXISTS idx_kg_entangle_strength ON kg_entanglements(entanglement_strength DESC);

-- Hyper-relational qualifiers
CREATE TABLE IF NOT EXISTS kg_qualifiers (
    qualifier_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_id UUID NOT NULL,
    qualifier_key VARCHAR(100) NOT NULL,
    qualifier_value TEXT NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.8,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (relationship_id) REFERENCES kg_relationships(relationship_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kg_qual_rel ON kg_qualifiers(relationship_id);
CREATE INDEX IF NOT EXISTS idx_kg_qual_key ON kg_qualifiers(qualifier_key);

-- DOWN
-- Drop all KG tables

DROP TABLE IF EXISTS kg_qualifiers CASCADE;
DROP TABLE IF EXISTS kg_entanglements CASCADE;
DROP TABLE IF EXISTS kg_relationships CASCADE;
DROP TABLE IF EXISTS kg_nodes CASCADE;
