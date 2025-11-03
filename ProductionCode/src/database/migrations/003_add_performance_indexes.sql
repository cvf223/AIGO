-- 🚀 MIGRATION 003: Performance Optimization Indexes
-- ===================================================

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_agent_perf_agent_time 
ON agent_performance(agent_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_agent_perf_success_time 
ON agent_performance(success, timestamp DESC) 
WHERE success = true;

CREATE INDEX IF NOT EXISTS idx_agent_action_agent_type_time 
ON agent_action_history(agent_id, action_type, timestamp DESC);

-- Partial index for recent data (hot data)
CREATE INDEX IF NOT EXISTS idx_agent_perf_recent 
ON agent_performance(timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '7 days';

-- JSONB indexes for common queries
CREATE INDEX IF NOT EXISTS idx_kg_nodes_properties_gin 
ON kg_nodes USING GIN (properties);

CREATE INDEX IF NOT EXISTS idx_agent_perf_metrics_gin 
ON agent_performance USING GIN (metrics);

-- Record migration
INSERT INTO schema_migrations (version, name) VALUES (3, 'performance_indexes')
ON CONFLICT (version) DO NOTHING;

SELECT 'Migration 003 completed' as status;

