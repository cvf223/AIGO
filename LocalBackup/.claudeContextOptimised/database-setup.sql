-- Construction Syndicate Command System Database Setup

-- Create database (run this separately if needed)
-- CREATE DATABASE construction_syndicate;

-- Connect to construction_syndicate database before running the rest

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Command Analytics Tables
CREATE TABLE IF NOT EXISTS command_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    user_id VARCHAR(255),
    parameters JSONB,
    execution_id VARCHAR(255),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    execution_id VARCHAR(255),
    success BOOLEAN NOT NULL,
    duration_ms INTEGER,
    error TEXT,
    output_size INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(255) NOT NULL UNIQUE,
    command_sequence TEXT[],
    frequency INTEGER DEFAULT 1,
    average_duration_ms INTEGER,
    success_rate FLOAT,
    last_used TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS command_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    command VARCHAR(50) NOT NULL,
    execution_id VARCHAR(255),
    user_id VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow Tables
CREATE TABLE IF NOT EXISTS workflow_definitions (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    definition JSONB NOT NULL,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS workflow_executions (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id VARCHAR(255) REFERENCES workflow_definitions(id),
    parameters JSONB,
    state VARCHAR(50),
    current_step VARCHAR(255),
    results JSONB,
    error TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_command_usage_time ON command_usage(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_command_results_time ON command_results(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_state ON workflow_executions(state, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_feedback_command ON command_feedback(command, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON command_patterns(frequency DESC);

-- Initial data
INSERT INTO workflow_definitions (id, name, definition, created_by)
VALUES 
    ('newFeature', 'New Feature Development', '{"steps": []}', 'system'),
    ('hoaiCompliance', 'HOAI Compliance Check', '{"steps": []}', 'system'),
    ('emergencyHotfix', 'Emergency Hotfix', '{"steps": []}', 'system')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully!' as status;
