-- 🔥 Create agent_performance table
-- =================================

CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    task_name VARCHAR(255),
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT FALSE,
    skill_improvement DECIMAL(10,4) DEFAULT 0,
    reward DECIMAL(20,10) DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    memory_usage BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_performance_agent ON agent_performance(agent_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_success ON agent_performance(success);
CREATE INDEX IF NOT EXISTS idx_agent_performance_timestamp ON agent_performance(timestamp DESC);

-- Verify table was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'agent_performance'
    ) THEN
        RAISE NOTICE '✅ agent_performance table created successfully!';
    ELSE
        RAISE EXCEPTION '❌ Failed to create agent_performance table';
    END IF;
END $$;
