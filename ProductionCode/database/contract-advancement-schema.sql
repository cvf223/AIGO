-- 🧬 SMART CONTRACT ADVANCEMENT DATABASE SCHEMA
-- =============================================
-- 
-- Production PostgreSQL schema for tracking smart contract advancement,
-- benchmark analysis, evolution patterns, and competitive intelligence
-- 
-- This schema supports:
-- - Contract performance categorization and tracking
-- - Benchmark history and trend analysis
-- - Evolution pattern storage and prediction validation
-- - Competitive positioning and gap analysis
-- - Elite performer pattern recognition

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB for flexible data storage
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CORE CONTRACT PERFORMANCE TABLES
-- =============================================

-- Track contract performance categorization
CREATE TABLE contract_performance_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(42) NOT NULL,
    network VARCHAR(50) NOT NULL,
    performance_category VARCHAR(50) NOT NULL CHECK (performance_category IN ('elite', 'advanced', 'intermediate', 'beginner', 'needs_improvement')),
    transaction_count INTEGER NOT NULL,
    total_volume DECIMAL(30, 18) NOT NULL,
    success_rate DECIMAL(5, 4) NOT NULL,
    avg_profit DECIMAL(20, 8) NOT NULL,
    total_profit DECIMAL(30, 18) NOT NULL,
    gas_efficiency DECIMAL(5, 4) NOT NULL,
    execution_speed DECIMAL(5, 4) NOT NULL,
    mev_resistance DECIMAL(5, 4) NOT NULL,
    profit_efficiency DECIMAL(5, 4) NOT NULL,
    adaptability DECIMAL(5, 4) NOT NULL,
    percentile_rank DECIMAL(5, 4) NOT NULL,
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    block_number BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance queries
CREATE INDEX idx_contract_performance_address ON contract_performance_categories(contract_address);
CREATE INDEX idx_contract_performance_category ON contract_performance_categories(performance_category);
CREATE INDEX idx_contract_performance_network ON contract_performance_categories(network);
CREATE INDEX idx_contract_performance_timestamp ON contract_performance_categories(analysis_timestamp);
CREATE INDEX idx_contract_performance_percentile ON contract_performance_categories(percentile_rank);

-- =============================================
-- BENCHMARK TRACKING TABLES
-- =============================================

-- Agent benchmark history tracking
CREATE TABLE agent_benchmark_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) NOT NULL,
    timestamp BIGINT NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contract benchmark scores
    contract_benchmarks JSONB NOT NULL,
    
    -- Performance metrics
    performance_metrics JSONB NOT NULL,
    
    -- Benchmark positioning
    benchmark_position JSONB NOT NULL,
    
    -- Gap analysis
    top_performer_gap DECIMAL(5, 4) NOT NULL,
    improvement_areas JSONB NOT NULL,
    
    -- Trend data for predictions
    trend_data JSONB NOT NULL,
    
    -- Metadata
    timeframe VARCHAR(20) NOT NULL,
    networks JSONB NOT NULL,
    data_quality DECIMAL(5, 4) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for benchmark queries
CREATE INDEX idx_agent_benchmark_agent_id ON agent_benchmark_history(agent_id);
CREATE INDEX idx_agent_benchmark_timestamp ON agent_benchmark_history(timestamp);
CREATE INDEX idx_agent_benchmark_date ON agent_benchmark_history(analysis_date);
CREATE INDEX idx_agent_benchmark_gap ON agent_benchmark_history(top_performer_gap);

-- Elite benchmark targets (reference table)
CREATE TABLE elite_benchmark_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    benchmark_category VARCHAR(50) NOT NULL UNIQUE,
    target_score DECIMAL(5, 4) NOT NULL,
    description TEXT NOT NULL,
    category_description TEXT NOT NULL,
    measurement_method TEXT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default elite benchmarks
INSERT INTO elite_benchmark_targets (benchmark_category, target_score, description, category_description, measurement_method) VALUES
('gas_efficiency', 0.95, '95% gas optimization efficiency', 'Assembly usage, unchecked blocks, packed structs', 'Gas used vs theoretical minimum'),
('execution_speed', 0.92, '92% execution speed optimization', 'Block-level timing, cross-chain optimization', 'Execution time vs network average'),
('mev_resistance', 0.88, '88% MEV attack resistance', 'Commit-reveal schemes, private mempools', 'MEV encounters vs total transactions'),
('profit_efficiency', 0.85, '85% profit optimization', 'Risk-adjusted returns, capital utilization', 'Actual profit vs theoretical maximum'),
('adaptability', 0.80, '80% adaptation speed', 'Strategy adjustment, market response', 'Time to adapt vs market changes');

-- =============================================
-- CONTRACT EVOLUTION TRACKING
-- =============================================

-- Contract evolution history
CREATE TABLE contract_evolution_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(42) NOT NULL,
    network VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Performance categorization
    performance_category VARCHAR(50) NOT NULL,
    
    -- Evolution patterns
    evolution_pattern JSONB NOT NULL,
    
    -- Adaptation metrics
    adaptation_speed DECIMAL(5, 4) NOT NULL,
    benchmark_scores JSONB NOT NULL,
    
    -- Code pattern analysis
    code_patterns JSONB NOT NULL,
    optimization_techniques JSONB NOT NULL,
    mev_protection_methods JSONB NOT NULL,
    
    -- Evolution drivers
    evolution_drivers JSONB NOT NULL,
    market_conditions JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for evolution tracking
CREATE INDEX idx_contract_evolution_address ON contract_evolution_history(contract_address);
CREATE INDEX idx_contract_evolution_timestamp ON contract_evolution_history(timestamp);
CREATE INDEX idx_contract_evolution_category ON contract_evolution_history(performance_category);
CREATE INDEX idx_contract_evolution_network ON contract_evolution_history(network);

-- Emerging and depreciating techniques tracking
CREATE TABLE technique_evolution_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    technique_name VARCHAR(255) NOT NULL,
    technique_category VARCHAR(100) NOT NULL,
    evolution_status VARCHAR(50) NOT NULL CHECK (evolution_status IN ('emerging', 'stable', 'depreciating', 'obsolete')),
    adoption_rate DECIMAL(5, 4) NOT NULL,
    effectiveness_score DECIMAL(5, 4) NOT NULL,
    confidence_level DECIMAL(5, 4) NOT NULL,
    first_detected TIMESTAMP WITH TIME ZONE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trend_data JSONB NOT NULL,
    prediction_accuracy DECIMAL(5, 4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for technique tracking
CREATE INDEX idx_technique_evolution_name ON technique_evolution_tracking(technique_name);
CREATE INDEX idx_technique_evolution_status ON technique_evolution_tracking(evolution_status);
CREATE INDEX idx_technique_evolution_category ON technique_evolution_tracking(technique_category);
CREATE INDEX idx_technique_evolution_adoption ON technique_evolution_tracking(adoption_rate);

-- =============================================
-- LANDSCAPE PREDICTION TABLES
-- =============================================

-- Landscape predictions storage
CREATE TABLE landscape_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN ('short_term', 'medium_term', 'long_term')),
    prediction_category VARCHAR(100) NOT NULL,
    prediction_description TEXT NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    time_to_impact VARCHAR(50) NOT NULL,
    impact_magnitude DECIMAL(5, 4) NOT NULL,
    supporting_evidence JSONB NOT NULL,
    prediction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expected_validation_date TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_validation_date TIMESTAMP WITH TIME ZONE,
    prediction_accuracy DECIMAL(5, 4),
    validation_status VARCHAR(50) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'failed', 'partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for predictions
CREATE INDEX idx_landscape_predictions_type ON landscape_predictions(prediction_type);
CREATE INDEX idx_landscape_predictions_category ON landscape_predictions(prediction_category);
CREATE INDEX idx_landscape_predictions_confidence ON landscape_predictions(confidence_score);
CREATE INDEX idx_landscape_predictions_validation ON landscape_predictions(validation_status);

-- =============================================
-- COMPETITIVE INTELLIGENCE TABLES
-- =============================================

-- Top performer patterns
CREATE TABLE top_performer_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name VARCHAR(255) NOT NULL,
    pattern_category VARCHAR(100) NOT NULL,
    pattern_description TEXT NOT NULL,
    effectiveness_score DECIMAL(5, 4) NOT NULL,
    adoption_rate DECIMAL(5, 4) NOT NULL,
    complexity_level VARCHAR(50) NOT NULL CHECK (complexity_level IN ('low', 'medium', 'high', 'expert')),
    implementation_cost DECIMAL(5, 4) NOT NULL,
    time_to_implement VARCHAR(50) NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    success_rate DECIMAL(5, 4) NOT NULL,
    pattern_data JSONB NOT NULL,
    first_identified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for pattern analysis
CREATE INDEX idx_top_performer_patterns_category ON top_performer_patterns(pattern_category);
CREATE INDEX idx_top_performer_patterns_effectiveness ON top_performer_patterns(effectiveness_score);
CREATE INDEX idx_top_performer_patterns_adoption ON top_performer_patterns(adoption_rate);

-- Competitive gap analysis
CREATE TABLE competitive_gap_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) NOT NULL,
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Current positioning
    current_performance_level VARCHAR(50) NOT NULL,
    current_percentile DECIMAL(5, 4) NOT NULL,
    
    -- Gap analysis
    gap_to_elite DECIMAL(5, 4) NOT NULL,
    gap_breakdown JSONB NOT NULL,
    
    -- Improvement potential
    improvement_potential DECIMAL(5, 4) NOT NULL,
    improvement_areas JSONB NOT NULL,
    
    -- Timeline estimates
    timeline_to_elite VARCHAR(100) NOT NULL,
    required_investments JSONB NOT NULL,
    
    -- Competitive context
    competitor_analysis JSONB NOT NULL,
    market_positioning JSONB NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for gap analysis
CREATE INDEX idx_competitive_gap_agent_id ON competitive_gap_analysis(agent_id);
CREATE INDEX idx_competitive_gap_date ON competitive_gap_analysis(analysis_date);
CREATE INDEX idx_competitive_gap_percentile ON competitive_gap_analysis(current_percentile);

-- =============================================
-- RECOMMENDATION ENGINE TABLES
-- =============================================

-- Contract advancement recommendations
CREATE TABLE contract_advancement_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(255) NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('immediate', 'strategic', 'long_term', 'competitive_advantage')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    area VARCHAR(100) NOT NULL,
    recommendation TEXT NOT NULL,
    expected_impact TEXT NOT NULL,
    timeframe VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('low', 'medium', 'high', 'expert')),
    implementation_cost DECIMAL(10, 2),
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    success_probability DECIMAL(5, 4) NOT NULL,
    supporting_evidence JSONB NOT NULL,
    generated_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    implementation_status VARCHAR(50) DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    actual_impact DECIMAL(5, 4),
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recommendations
CREATE INDEX idx_contract_recommendations_agent_id ON contract_advancement_recommendations(agent_id);
CREATE INDEX idx_contract_recommendations_type ON contract_advancement_recommendations(recommendation_type);
CREATE INDEX idx_contract_recommendations_priority ON contract_advancement_recommendations(priority);
CREATE INDEX idx_contract_recommendations_status ON contract_advancement_recommendations(implementation_status);

-- =============================================
-- AUDIT AND MONITORING TABLES
-- =============================================

-- System audit log
CREATE TABLE contract_advancement_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    event_description TEXT NOT NULL,
    agent_id VARCHAR(255),
    contract_address VARCHAR(42),
    network VARCHAR(50),
    event_data JSONB NOT NULL,
    block_number BIGINT,
    transaction_hash VARCHAR(66),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit logging
CREATE INDEX idx_audit_log_event_type ON contract_advancement_audit_log(event_type);
CREATE INDEX idx_audit_log_timestamp ON contract_advancement_audit_log(timestamp);
CREATE INDEX idx_audit_log_agent_id ON contract_advancement_audit_log(agent_id);
CREATE INDEX idx_audit_log_severity ON contract_advancement_audit_log(severity);

-- Performance monitoring
CREATE TABLE contract_advancement_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 6) NOT NULL,
    metric_unit VARCHAR(50),
    agent_id VARCHAR(255),
    network VARCHAR(50),
    timeframe VARCHAR(20),
    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX idx_performance_metrics_name ON contract_advancement_performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_date ON contract_advancement_performance_metrics(measurement_date);
CREATE INDEX idx_performance_metrics_agent_id ON contract_advancement_performance_metrics(agent_id);

-- =============================================
-- VIEWS FOR ANALYSIS
-- =============================================

-- Top performers view
CREATE VIEW top_performers_view AS
SELECT 
    contract_address,
    network,
    performance_category,
    percentile_rank,
    total_profit,
    success_rate,
    gas_efficiency,
    execution_speed,
    mev_resistance,
    profit_efficiency,
    adaptability,
    analysis_timestamp
FROM contract_performance_categories
WHERE performance_category = 'elite'
ORDER BY percentile_rank DESC, total_profit DESC;

-- Benchmark trends view
CREATE VIEW benchmark_trends_view AS
SELECT 
    agent_id,
    DATE_TRUNC('day', analysis_date) as day,
    AVG(top_performer_gap) as avg_gap,
    AVG((benchmark_position->>'overall')::DECIMAL) as avg_overall_score,
    COUNT(*) as data_points
FROM agent_benchmark_history
GROUP BY agent_id, DATE_TRUNC('day', analysis_date)
ORDER BY agent_id, day;

-- Evolution patterns view
CREATE VIEW evolution_patterns_view AS
SELECT 
    contract_address,
    network,
    performance_category,
    adaptation_speed,
    (evolution_pattern->>'changes_count')::INTEGER as changes_count,
    (evolution_pattern->>'adaptation_frequency')::DECIMAL as adaptation_frequency,
    analysis_date
FROM contract_evolution_history
ORDER BY analysis_date DESC, adaptation_speed DESC;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_contract_performance_updated_at 
    BEFORE UPDATE ON contract_performance_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate benchmark percentiles
CREATE OR REPLACE FUNCTION calculate_benchmark_percentile(
    p_agent_id VARCHAR(255),
    p_benchmark_category VARCHAR(50)
) RETURNS DECIMAL AS $$
DECLARE
    agent_score DECIMAL;
    total_agents INTEGER;
    better_than_count INTEGER;
    percentile DECIMAL;
BEGIN
    -- Get agent's score for the category
    SELECT (contract_benchmarks->>p_benchmark_category)::DECIMAL INTO agent_score
    FROM agent_benchmark_history
    WHERE agent_id = p_agent_id
    ORDER BY timestamp DESC
    LIMIT 1;
    
    -- Count total agents
    SELECT COUNT(DISTINCT agent_id) INTO total_agents
    FROM agent_benchmark_history
    WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000;
    
    -- Count agents with better scores
    SELECT COUNT(DISTINCT agent_id) INTO better_than_count
    FROM agent_benchmark_history
    WHERE timestamp >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
    AND (contract_benchmarks->>p_benchmark_category)::DECIMAL > agent_score;
    
    -- Calculate percentile
    percentile := (total_agents - better_than_count)::DECIMAL / total_agents;
    
    RETURN percentile;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA INSERTS
-- =============================================

-- Insert sample audit log entry
INSERT INTO contract_advancement_audit_log (
    event_type, 
    event_description, 
    event_data, 
    severity
) VALUES (
    'schema_initialization',
    'Smart Contract Advancement database schema initialized',
    '{"version": "1.0", "tables_created": 12, "indexes_created": 25}',
    'info'
);

-- =============================================
-- GRANTS AND PERMISSIONS
-- =============================================

-- Grant permissions to application user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE contract_performance_categories IS 'Tracks contract performance categorization and metrics';
COMMENT ON TABLE agent_benchmark_history IS 'Historical benchmark data for agent performance tracking';
COMMENT ON TABLE elite_benchmark_targets IS 'Reference table for elite performance targets';
COMMENT ON TABLE contract_evolution_history IS 'Tracks how contracts evolve over time';
COMMENT ON TABLE technique_evolution_tracking IS 'Monitors emerging and depreciating techniques';
COMMENT ON TABLE landscape_predictions IS 'Stores landscape change predictions for validation';
COMMENT ON TABLE top_performer_patterns IS 'Identified patterns from top performing contracts';
COMMENT ON TABLE competitive_gap_analysis IS 'Analysis of competitive positioning and gaps';
COMMENT ON TABLE contract_advancement_recommendations IS 'Generated recommendations for contract improvement';
COMMENT ON TABLE contract_advancement_audit_log IS 'Audit trail for all system activities';
COMMENT ON TABLE contract_advancement_performance_metrics IS 'Performance monitoring metrics';

COMMENT ON VIEW top_performers_view IS 'View of elite performing contracts';
COMMENT ON VIEW benchmark_trends_view IS 'Trend analysis for benchmark data';
COMMENT ON VIEW evolution_patterns_view IS 'Pattern analysis for contract evolution'; 