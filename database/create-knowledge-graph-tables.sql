-- 🧠 KNOWLEDGE GRAPH DATABASE SCHEMA
-- ==================================
-- Creates the required tables for database-backed knowledge graph persistence
-- This replaces the in-memory fallback mode with proper PostgreSQL storage

-- 🔍 Knowledge Graph Nodes Table
CREATE TABLE IF NOT EXISTS kg_nodes (
    node_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(255) NOT NULL,
    label VARCHAR(500) NOT NULL,
    properties JSONB DEFAULT '{}',
    embedding VECTOR(1536), -- For vector similarity search (OpenAI embeddings)
    confidence FLOAT DEFAULT 1.0,
    importance FLOAT DEFAULT 0.5,
    creation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'
);

-- 🔗 Knowledge Graph Relationships Table  
CREATE TABLE IF NOT EXISTS kg_relationships (
    relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_node_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    relationship_type VARCHAR(255) NOT NULL,
    properties JSONB DEFAULT '{}',
    strength FLOAT DEFAULT 1.0,
    confidence FLOAT DEFAULT 1.0,
    creation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- ⚛️ Quantum Entanglements Table
CREATE TABLE IF NOT EXISTS kg_entanglements (
    entanglement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    node_a_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    node_b_id UUID NOT NULL REFERENCES kg_nodes(node_id) ON DELETE CASCADE,
    entanglement_strength FLOAT NOT NULL DEFAULT 0.5,
    entanglement_type VARCHAR(255) DEFAULT 'quantum_correlation',
    coherence_level FLOAT DEFAULT 0.7,
    measurement_count INTEGER DEFAULT 0,
    creation_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_measured TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- 📊 Indexes for Performance Optimization
-- Node indexes
CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON kg_nodes(type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_label ON kg_nodes(label);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_importance ON kg_nodes(importance DESC);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_timestamp ON kg_nodes(creation_timestamp);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_properties ON kg_nodes USING GIN(properties);

-- Relationship indexes  
CREATE INDEX IF NOT EXISTS idx_kg_relationships_source ON kg_relationships(source_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_target ON kg_relationships(target_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_type ON kg_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_strength ON kg_relationships(strength DESC);

-- Entanglement indexes
CREATE INDEX IF NOT EXISTS idx_kg_entanglements_node_a ON kg_entanglements(node_a_id);
CREATE INDEX IF NOT EXISTS idx_kg_entanglements_node_b ON kg_entanglements(node_b_id);
CREATE INDEX IF NOT EXISTS idx_kg_entanglements_strength ON kg_entanglements(entanglement_strength DESC);
CREATE INDEX IF NOT EXISTS idx_kg_entanglements_type ON kg_entanglements(entanglement_type);

-- 🎯 Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_kg_nodes_type_importance ON kg_nodes(type, importance DESC);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_source_type ON kg_relationships(source_node_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_kg_entanglements_nodes_strength ON kg_entanglements(node_a_id, node_b_id, entanglement_strength DESC);

-- 🔍 Vector similarity index (requires pgvector extension)
-- Uncomment if pgvector is available:
-- CREATE INDEX IF NOT EXISTS idx_kg_nodes_embedding ON kg_nodes USING ivfflat (embedding vector_cosine_ops);

-- ✅ Verification: Ensure tables were created successfully
DO $$
BEGIN
    RAISE NOTICE '🧠 Knowledge Graph Database Schema Created Successfully!';
    RAISE NOTICE '   ✅ kg_nodes table: %', 
        (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_nodes'));
    RAISE NOTICE '   ✅ kg_relationships table: %', 
        (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_relationships'));  
    RAISE NOTICE '   ✅ kg_entanglements table: %', 
        (SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'kg_entanglements'));
    RAISE NOTICE '🎯 Knowledge Graph ready for production database-backed operation!';
END $$;
