-- =====================================================
-- FIX DATABASE SCHEMA - AGENT PERFORMANCE TABLE
-- =====================================================
-- This migration ensures all required columns exist
-- and fixes schema mismatches that cause SQL errors
-- =====================================================

-- 1. Add missing timestamp columns to agent_performance table
ALTER TABLE agent_performance 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Add missing columns that various systems expect
ALTER TABLE agent_performance
ADD COLUMN IF NOT EXISTS task_type VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5,4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS response_time_ms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_count INTEGER DEFAULT 0;

-- 3. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_agent_performance_timestamps 
ON agent_performance(created_at DESC, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id_created 
ON agent_performance(agent_id, created_at DESC);

-- 4. Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_agent_performance_updated_at ON agent_performance;

CREATE TRIGGER update_agent_performance_updated_at 
BEFORE UPDATE ON agent_performance 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- 5. Ensure other commonly used tables have consistent schemas
-- Agent states table
CREATE TABLE IF NOT EXISTS agent_states (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    state_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System metrics table
CREATE TABLE IF NOT EXISTS system_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(20,6),
    metric_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evolution history table
CREATE TABLE IF NOT EXISTS evolution_history (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(255) NOT NULL,
    generation INTEGER DEFAULT 0,
    fitness DECIMAL(10,6),
    population_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add observation mode tracking table
CREATE TABLE IF NOT EXISTS system_observation_state (
    id SERIAL PRIMARY KEY,
    system_name VARCHAR(255) UNIQUE NOT NULL,
    in_observation_mode BOOLEAN DEFAULT true,
    last_activation TIMESTAMP,
    activation_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Clean up any duplicate or invalid entries
-- Remove duplicate entries keeping only the most recent
DELETE FROM agent_performance a
USING agent_performance b
WHERE a.id < b.id 
AND a.agent_id = b.agent_id 
AND a.created_at = b.created_at;

-- 8. Add system configuration table for global settings
CREATE TABLE IF NOT EXISTS system_configuration (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default observation mode configuration
INSERT INTO system_configuration (key, value, description)
VALUES ('observation_mode', '{"enabled": true, "log_threshold": 5, "auto_idle_minutes": 5}'::jsonb, 
        'Global observation mode settings')
ON CONFLICT (key) DO NOTHING;

-- 9. Grant appropriate permissions (adjust user as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 10. Vacuum and analyze for performance
VACUUM ANALYZE agent_performance;

-- Print completion message
DO $$
BEGIN
    RAISE NOTICE 'Database schema migration completed successfully!';
    RAISE NOTICE 'All missing columns have been added.';
    RAISE NOTICE 'Indexes and triggers have been created.';
    RAISE NOTICE 'System is ready for error-free operation.';
END
$$;
