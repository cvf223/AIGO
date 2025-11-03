-- 003_add_missing_indexes.sql
-- Add performance indexes for frequently queried columns

-- Composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_learning_exp_agent_type ON learning_experiences(agent_id, experience_type);
CREATE INDEX IF NOT EXISTS idx_learning_exp_success_reward ON learning_experiences(success, reward DESC);

-- Indexes for time-range queries
CREATE INDEX IF NOT EXISTS idx_agents_created_updated ON agents(created_at, updated_at);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_accessed ON memory_nodes(last_accessed) WHERE last_accessed IS NOT NULL;

-- Indexes for filtering by status
CREATE INDEX IF NOT EXISTS idx_arb_status_discovered ON arbitrage_opportunities(status, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_construction_status_phase ON construction_projects(status, hoai_phase);

-- Partial indexes for active records only
CREATE INDEX IF NOT EXISTS idx_agents_active_type ON agents(agent_type) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_construction_active ON construction_projects(project_id, project_type) WHERE status = 'active';

-- Text search indexes for full-text search capabilities
CREATE INDEX IF NOT EXISTS idx_memory_nodes_content_trgm ON memory_nodes USING GIN (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_construction_name_trgm ON construction_projects USING GIN (project_name gin_trgm_ops);

-- Indexes for aggregation queries
CREATE INDEX IF NOT EXISTS idx_system_metrics_name_recorded ON system_metrics(metric_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_created ON system_logs(log_level, created_at DESC);

-- Expression indexes for common calculations
CREATE INDEX IF NOT EXISTS idx_memory_nodes_recency ON memory_nodes((EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - updated_at))));

-- Covering indexes for common queries (include frequently selected columns)
CREATE INDEX IF NOT EXISTS idx_agents_lookup ON agents(agent_id, agent_name, agent_type, is_active);
CREATE INDEX IF NOT EXISTS idx_memory_nodes_lookup ON memory_nodes(node_id, node_type, importance_score, updated_at);

-- Indexes for relationship graph traversal
CREATE INDEX IF NOT EXISTS idx_memory_rel_bidirectional ON memory_relationships(source_node_id, target_node_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_memory_rel_reverse ON memory_relationships(target_node_id, source_node_id, relationship_type);

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Performance indexes added successfully';
END $$;

