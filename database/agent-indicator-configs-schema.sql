-- 🧬 AGENT INDICATOR CONFIGURATIONS SCHEMA
-- ========================================
-- Database schema for storing agent-specific modular key indicators
-- Supports genetic trait-based customization and performance evolution

-- Main table for agent indicator configurations
CREATE TABLE IF NOT EXISTS agent_indicator_configs (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    character_name VARCHAR(255) NOT NULL,
    base_set VARCHAR(100) NOT NULL,
    indicators TEXT NOT NULL, -- JSON array of regex patterns as strings
    task_specific TEXT NOT NULL, -- JSON object with task-specific indicator sets
    genetic_traits TEXT NOT NULL, -- JSON object with extracted genetic traits
    evolution_history TEXT NOT NULL, -- JSON array of evolution events
    performance_metrics TEXT NOT NULL, -- JSON object with performance tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast agent lookups
CREATE INDEX IF NOT EXISTS idx_agent_indicator_configs_agent_id 
ON agent_indicator_configs(agent_id);

-- Index for character-based queries
CREATE INDEX IF NOT EXISTS idx_agent_indicator_configs_character_name 
ON agent_indicator_configs(character_name);

-- Index for base set analysis
CREATE INDEX IF NOT EXISTS idx_agent_indicator_configs_base_set 
ON agent_indicator_configs(base_set);

-- Table for tracking indicator performance across agents
CREATE TABLE IF NOT EXISTS indicator_performance_tracking (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    indicator_pattern TEXT NOT NULL,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0.0000,
    confidence DECIMAL(5,4) DEFAULT 0.0000,
    context TEXT, -- JSON object with context data
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for agent performance lookups
CREATE INDEX IF NOT EXISTS idx_indicator_performance_agent_id 
ON indicator_performance_tracking(agent_id);

-- Index for pattern analysis
CREATE INDEX IF NOT EXISTS idx_indicator_performance_pattern 
ON indicator_performance_tracking(indicator_pattern);

-- Index for success rate analysis
CREATE INDEX IF NOT EXISTS idx_indicator_performance_success_rate 
ON indicator_performance_tracking(success_rate DESC);

-- Table for evolution events and improvements
CREATE TABLE IF NOT EXISTS indicator_evolution_events (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    evolution_type VARCHAR(100) NOT NULL, -- 'performance_based', 'genetic_mutation', 'competitive_learning'
    before_count INTEGER NOT NULL,
    after_count INTEGER NOT NULL,
    new_indicators TEXT, -- JSON array of new indicator patterns
    removed_indicators TEXT, -- JSON array of removed indicator patterns
    performance_improvement DECIMAL(8,4) DEFAULT 0.0000,
    reason TEXT,
    context TEXT, -- JSON object with evolution context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for agent evolution history
CREATE INDEX IF NOT EXISTS idx_indicator_evolution_agent_id 
ON indicator_evolution_events(agent_id);

-- Index for evolution type analysis
CREATE INDEX IF NOT EXISTS idx_indicator_evolution_type 
ON indicator_evolution_events(evolution_type);

-- Index for performance tracking
CREATE INDEX IF NOT EXISTS idx_indicator_evolution_improvement 
ON indicator_evolution_events(performance_improvement DESC);

-- Table for genetic trait inheritance and mutation
CREATE TABLE IF NOT EXISTS agent_genetic_traits (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL UNIQUE,
    personality VARCHAR(100) NOT NULL,
    risk_tolerance VARCHAR(50) NOT NULL,
    strategic_focus TEXT NOT NULL, -- JSON array of focus areas
    chain_specialization TEXT NOT NULL, -- JSON array of preferred chains
    specializations TEXT NOT NULL, -- JSON array of capabilities
    inheritance_history TEXT, -- JSON array of parent traits
    mutation_history TEXT, -- JSON array of mutations
    fitness_score DECIMAL(8,4) DEFAULT 0.0000,
    generation INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for genetic analysis
CREATE INDEX IF NOT EXISTS idx_agent_genetic_traits_agent_id 
ON agent_genetic_traits(agent_id);

-- Index for personality-based queries
CREATE INDEX IF NOT EXISTS idx_agent_genetic_traits_personality 
ON agent_genetic_traits(personality);

-- Index for fitness scoring
CREATE INDEX IF NOT EXISTS idx_agent_genetic_traits_fitness 
ON agent_genetic_traits(fitness_score DESC);

-- Index for generation tracking
CREATE INDEX IF NOT EXISTS idx_agent_genetic_traits_generation 
ON agent_genetic_traits(generation);

-- Update function for tracking changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_agent_indicator_configs_updated_at 
    BEFORE UPDATE ON agent_indicator_configs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_indicator_performance_tracking_updated_at 
    BEFORE UPDATE ON indicator_performance_tracking 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_genetic_traits_updated_at 
    BEFORE UPDATE ON agent_genetic_traits 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE agent_indicator_configs IS 'Stores agent-specific modular key indicator configurations with genetic trait customization';
COMMENT ON TABLE indicator_performance_tracking IS 'Tracks performance of individual indicators across agents for evolution';
COMMENT ON TABLE indicator_evolution_events IS 'Records evolution events and improvements in agent indicator sets';
COMMENT ON TABLE agent_genetic_traits IS 'Manages genetic traits for agent personalities and strategic preferences';

COMMENT ON COLUMN agent_indicator_configs.indicators IS 'JSON array of regex patterns converted to strings for storage';
COMMENT ON COLUMN agent_indicator_configs.task_specific IS 'JSON object with task-specific indicator sets (arbitrage, mev, learning, research)';
COMMENT ON COLUMN agent_indicator_configs.genetic_traits IS 'JSON object with personality, risk tolerance, strategic focus, etc.';
COMMENT ON COLUMN agent_indicator_configs.evolution_history IS 'JSON array of evolution events with timestamps and reasons';
COMMENT ON COLUMN agent_indicator_configs.performance_metrics IS 'JSON object with usage stats, success rates, evolution cycles';
