-- =============================================================================
-- 🏗️ CONSTRUCTION CHAT SYSTEM - ELITE DATABASE SCHEMA
-- =============================================================================
-- 
-- Enhanced chat persistence with superintelligence tracking and performance metrics
-- Supports multi-instance chat sessions with Redis + PostgreSQL hybrid architecture

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- CHAT SESSIONS TABLE - Enhanced with superintelligence metadata
-- =============================================================================
CREATE TABLE IF NOT EXISTS elite_chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    user_id VARCHAR(255) DEFAULT 'construction_user',
    target_type VARCHAR(50) NOT NULL, -- 'agent', 'ollama', 'coordinator'
    target_id VARCHAR(255) NOT NULL,
    message_count INTEGER DEFAULT 0,
    
    -- Enhanced reasoning configuration
    reasoning_config JSONB DEFAULT '{
        "detailLevel": 5,
        "enableCoT": true,
        "enableCoA": false,
        "enableToT": false,
        "enableGoT": false,
        "enableZAP": false,
        "enableCreativity": false,
        "enableFormalVerification": false,
        "enableDeepResearch": false,
        "temperature": 0.7,
        "maxTokens": 2000
    }',
    
    -- NEW: Performance tracking
    performance_metrics JSONB DEFAULT '{
        "averageResponseTime": 0,
        "totalTokensUsed": 0,
        "superintelligenceActivations": 0,
        "accuracyScore": 0.0,
        "reasoningEfficiency": 0.0
    }',
    
    -- NEW: Quantum enhancement tracking
    quantum_enhancements JSONB DEFAULT '{
        "quantumBoost": 0,
        "entanglementLevel": 0,
        "superpositionStates": 0,
        "coherenceScore": 0.0
    }',
    
    -- NEW: Session organization
    session_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    session_priority INTEGER DEFAULT 1, -- 1=low, 5=critical
    session_cluster_id UUID, -- For AI-driven session grouping
    
    -- Standard metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- CHAT MESSAGES TABLE - Enhanced with superintelligence tracking
-- =============================================================================
CREATE TABLE IF NOT EXISTS elite_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES elite_chat_sessions(id) ON DELETE CASCADE,
    from_type VARCHAR(50) NOT NULL, -- 'user', 'agent', 'ollama', 'coordinator', 'system'
    from_id VARCHAR(255),
    message TEXT NOT NULL,
    
    -- NEW: Superintelligence tracking
    reasoning_applied JSONB DEFAULT '{
        "methods": [],
        "systems": [],
        "confidence": 0.0,
        "complexity": 0
    }',
    
    -- NEW: Performance metrics
    superintelligence_metrics JSONB DEFAULT '{
        "cotSteps": 0,
        "coaAgents": 0,
        "totPaths": 0,
        "gotNodes": 0,
        "zapActions": 0,
        "creativityBoost": 0.0,
        "formalVerification": false
    }',
    
    processing_time INTEGER DEFAULT 0, -- milliseconds
    tokens_used INTEGER DEFAULT 0,
    accuracy_score REAL DEFAULT 0.0, -- 0.0-1.0
    model_used VARCHAR(100),
    
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- =============================================================================
-- SESSION CLUSTERS TABLE - AI-driven session organization
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_session_clusters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_name VARCHAR(255) NOT NULL,
    cluster_description TEXT,
    ai_generated BOOLEAN DEFAULT true,
    cluster_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- REASONING PERFORMANCE TABLE - Track superintelligence effectiveness
-- =============================================================================
CREATE TABLE IF NOT EXISTS reasoning_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES elite_chat_sessions(id) ON DELETE CASCADE,
    message_id UUID REFERENCES elite_chat_messages(id) ON DELETE CASCADE,
    reasoning_method VARCHAR(50) NOT NULL, -- 'CoT', 'CoA', 'ToT', 'GoT', 'ZAP'
    
    performance_data JSONB NOT NULL DEFAULT '{
        "executionTime": 0,
        "confidence": 0.0,
        "accuracy": 0.0,
        "complexity": 0,
        "resourceUsage": 0,
        "quantumBoost": 0.0
    }',
    
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE INDICES FOR OPTIMAL QUERY SPEED
-- =============================================================================

-- Session indices
CREATE INDEX IF NOT EXISTS idx_elite_chat_sessions_last_active ON elite_chat_sessions(last_active DESC);
CREATE INDEX IF NOT EXISTS idx_elite_chat_sessions_user_id ON elite_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_elite_chat_sessions_target ON elite_chat_sessions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_elite_chat_sessions_cluster ON elite_chat_sessions(session_cluster_id);
CREATE INDEX IF NOT EXISTS idx_elite_chat_sessions_priority ON elite_chat_sessions(session_priority DESC);

-- Message indices  
CREATE INDEX IF NOT EXISTS idx_elite_chat_messages_session_id ON elite_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_elite_chat_messages_timestamp ON elite_chat_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_elite_chat_messages_from_type ON elite_chat_messages(from_type);
CREATE INDEX IF NOT EXISTS idx_elite_chat_messages_accuracy ON elite_chat_messages(accuracy_score DESC);

-- Performance indices
CREATE INDEX IF NOT EXISTS idx_reasoning_performance_session ON reasoning_performance(session_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_performance_method ON reasoning_performance(reasoning_method);
CREATE INDEX IF NOT EXISTS idx_reasoning_performance_success ON reasoning_performance(success);

-- =============================================================================
-- CHAT SESSION MANAGEMENT FUNCTIONS
-- =============================================================================

-- Function to update session last_active and message_count
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE elite_chat_sessions 
    SET 
        last_active = NOW(),
        message_count = (
            SELECT COUNT(*) 
            FROM elite_chat_messages 
            WHERE session_id = NEW.session_id
        )
    WHERE id = NEW.session_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update session activity
DROP TRIGGER IF EXISTS trigger_update_session_activity ON elite_chat_messages;
CREATE TRIGGER trigger_update_session_activity
    AFTER INSERT ON elite_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();

-- Function to create session cluster based on AI analysis
CREATE OR REPLACE FUNCTION create_session_cluster(
    cluster_name VARCHAR(255),
    description TEXT DEFAULT '',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
    cluster_id UUID;
BEGIN
    INSERT INTO chat_session_clusters (cluster_name, cluster_description, cluster_tags)
    VALUES (cluster_name, description, tags)
    RETURNING id INTO cluster_id;
    
    RETURN cluster_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- VIEWS FOR OPTIMIZED QUERIES
-- =============================================================================

-- Active sessions view with performance metrics
CREATE OR REPLACE VIEW active_chat_sessions AS
SELECT 
    s.*,
    COUNT(m.id) as actual_message_count,
    AVG(m.processing_time) as avg_processing_time,
    AVG(m.accuracy_score) as avg_accuracy,
    MAX(m.timestamp) as last_message_time,
    c.cluster_name
FROM elite_chat_sessions s
LEFT JOIN elite_chat_messages m ON s.id = m.session_id
LEFT JOIN chat_session_clusters c ON s.session_cluster_id = c.id
WHERE s.last_active > NOW() - INTERVAL '24 hours'
GROUP BY s.id, c.cluster_name
ORDER BY s.last_active DESC;

-- Superintelligence performance summary
CREATE OR REPLACE VIEW superintelligence_performance AS
SELECT 
    reasoning_method,
    COUNT(*) as total_uses,
    AVG((performance_data->>'confidence')::float) as avg_confidence,
    AVG((performance_data->>'accuracy')::float) as avg_accuracy,
    AVG((performance_data->>'executionTime')::int) as avg_execution_time,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*)::float as success_rate
FROM reasoning_performance
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY reasoning_method
ORDER BY success_rate DESC, avg_confidence DESC;

-- =============================================================================
-- INITIALIZATION DATA
-- =============================================================================

-- Create default cluster for general construction queries
INSERT INTO chat_session_clusters (cluster_name, cluster_description, cluster_tags)
VALUES 
    ('General Construction', 'General construction planning and analysis queries', ARRAY['construction', 'planning', 'general']),
    ('HOAI Compliance', 'HOAI LP6 & LP7 compliance and regulatory queries', ARRAY['hoai', 'compliance', 'regulation']),
    ('Technical Analysis', 'Technical construction and engineering queries', ARRAY['technical', 'engineering', 'analysis']),
    ('Cost Estimation', 'Cost estimation and budgeting queries', ARRAY['cost', 'budget', 'estimation']),
    ('Quality Control', 'Quality control and error detection queries', ARRAY['quality', 'errors', 'control'])
ON CONFLICT DO NOTHING;

COMMIT;
