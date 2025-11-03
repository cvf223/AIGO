
-- Fix missing agent_activations table
CREATE TABLE IF NOT EXISTS agent_activations (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    activation_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activation_type VARCHAR(100),
    context JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent_activations_agent_id 
ON agent_activations(agent_id);

CREATE INDEX IF NOT EXISTS idx_agent_activations_time 
ON agent_activations(activation_time DESC);
