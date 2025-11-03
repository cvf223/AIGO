-- 🔥 FIX: Create missing tables that are causing errors
-- =====================================================

-- 1. Create agent_action_history table (missing for QuantumEntanglementEngine)
CREATE TABLE IF NOT EXISTS agent_action_history (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_data JSONB,
    reward DECIMAL(20, 10) DEFAULT 0,
    trajectory_id VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_action_history_agent ON agent_action_history(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_trajectory ON agent_action_history(trajectory_id);
CREATE INDEX IF NOT EXISTS idx_action_history_reward ON agent_action_history(reward DESC);

-- 2. Create kg_nodes table (missing for MemorySinkPrevention)
CREATE TABLE IF NOT EXISTS kg_nodes (
    id SERIAL PRIMARY KEY,
    node_id VARCHAR(255) UNIQUE NOT NULL,
    node_type VARCHAR(100),
    content TEXT,
    embedding FLOAT8[],
    concept_embedding FLOAT8[],  -- Required by MemorySinkPrevention
    properties JSONB,
    metadata JSONB,
    importance_score DECIMAL(5,4) DEFAULT 0.5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_importance ON kg_nodes(importance_score DESC);

-- 3. Create kg_relationships table (for graph structure)
CREATE TABLE IF NOT EXISTS kg_relationships (
    id SERIAL PRIMARY KEY,
    source_id VARCHAR(255) NOT NULL,
    target_id VARCHAR(255) NOT NULL,
    relationship_type VARCHAR(100),
    strength DECIMAL(5,4) DEFAULT 0.5,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_id, target_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_kg_relationships_source ON kg_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_kg_relationships_target ON kg_relationships(target_id);

-- 4. Add missing 'success' column to agent_performance table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_performance' 
        AND column_name = 'success'
    ) THEN
        ALTER TABLE agent_performance ADD COLUMN success BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 5. Add missing 'skill_improvement' column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'agent_performance' 
        AND column_name = 'skill_improvement'
    ) THEN
        ALTER TABLE agent_performance ADD COLUMN skill_improvement DECIMAL(10,4) DEFAULT 0;
    END IF;
END $$;

-- 6. Create memory_checkpoints table for persistence
CREATE TABLE IF NOT EXISTS memory_checkpoints (
    id SERIAL PRIMARY KEY,
    checkpoint_id VARCHAR(255) UNIQUE NOT NULL,
    system_name VARCHAR(255) NOT NULL,
    state_data JSONB NOT NULL,
    data_size INTEGER,
    checkpoint_type VARCHAR(50), -- 'hourly', 'breakthrough', 'shutdown'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_checkpoints_system ON memory_checkpoints(system_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_checkpoints_type ON memory_checkpoints(checkpoint_type);

-- 7. Create knowledge_persistence table
CREATE TABLE IF NOT EXISTS knowledge_persistence (
    id SERIAL PRIMARY KEY,
    knowledge_id VARCHAR(255) UNIQUE NOT NULL,
    knowledge_type VARCHAR(100),
    content JSONB NOT NULL,
    source_system VARCHAR(255),
    validation_score DECIMAL(5,4),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_knowledge_persistence_type ON knowledge_persistence(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_persistence_source ON knowledge_persistence(source_system);

-- 8. Create system_health_logs table for monitoring
CREATE TABLE IF NOT EXISTS system_health_logs (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(255) NOT NULL,
    health_status VARCHAR(50),
    memory_usage BIGINT,
    error_count INTEGER DEFAULT 0,
    performance_metrics JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_logs_system ON system_health_logs(system_name, timestamp DESC);

-- 9. Grant permissions (adjust user as needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO CURRENT_USER;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO CURRENT_USER;

-- 10. Verify all tables exist
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'agent_action_history',
        'kg_nodes', 
        'kg_relationships',
        'memory_checkpoints',
        'knowledge_persistence',
        'system_health_logs'
    ];
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tbl
        ) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE 'Missing tables: %', missing_tables;
    ELSE
        RAISE NOTICE '✅ All required tables exist!';
    END IF;
END $$;
