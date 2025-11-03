-- 🏆 ELITE CONTRACT DEVELOPER DATABASE SCHEMA
-- ==============================================
-- 
-- Comprehensive database schema for competitor analysis,
-- research task management, and contract generation tracking
-- 
-- Designed for PostgreSQL with full integration to existing

-- Competitor transactions analysis table
CREATE TABLE IF NOT EXISTS competitor_transactions (
    id SERIAL PRIMARY KEY,
    tx_hash VARCHAR(66) UNIQUE NOT NULL,
    timestamp BIGINT NOT NULL,
    block_number BIGINT,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42),
    gas_used BIGINT,
    gas_price BIGINT,
    priority_fee BIGINT,
    profit_usd DECIMAL(18,8),
    profit_percentage DECIMAL(8,4),
    token_pair VARCHAR(50),
    dex_platforms TEXT[],
    execution_time_ms BIGINT,
    success BOOLEAN,
    strategy_pattern VARCHAR(50),
    mev_protection BOOLEAN,
    slippage_percent DECIMAL(5,4),
    contract_efficiency_score DECIMAL(5,4),
    threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    learning_value DECIMAL(5,4),
    analyzed_at TIMESTAMP DEFAULT NOW(),
    
    -- Competitive intelligence fields
    key_takeaways TEXT,
    improvement_opportunities TEXT,
    competitive_advantage TEXT,
    patterns_identified TEXT[],
    risk_factors TEXT[],
    
    -- Screenshot/data source tracking
    data_source VARCHAR(50) DEFAULT 'screenshot',
    raw_data TEXT,
    extraction_confidence DECIMAL(5,4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Research tasks queue and management
CREATE TABLE IF NOT EXISTS research_tasks (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'gas_efficiency', 'profit_optimization', 'execution_speed', 
        'security_enhancement', 'competition_analysis', 'mev_protection'
    )),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority_score DECIMAL(5,4) NOT NULL DEFAULT 0.5,
    target_improvement_percent DECIMAL(5,2) NOT NULL,
    current_baseline DECIMAL(18,8),
    competitor_benchmark DECIMAL(18,8),
    
    -- Task status and progress
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    progress_percent DECIMAL(5,2) DEFAULT 0,
    
    -- Research findings
    findings TEXT,
    implementation_plan TEXT,
    estimated_impact TEXT,
    completion_criteria TEXT,
    actual_improvement_percent DECIMAL(5,2),
    
    -- Timestamps
    assigned_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    deadline TIMESTAMP,
    
    -- Reward calculation
    rl_reward_base DECIMAL(8,4),
    rl_reward_bonus DECIMAL(8,4),
    rl_reward_total DECIMAL(8,4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Contract generations tracking
CREATE TABLE IF NOT EXISTS contract_generations (
    id SERIAL PRIMARY KEY,
    contract_type VARCHAR(50) NOT NULL,
    version VARCHAR(20) NOT NULL,
    source_code TEXT NOT NULL,
    
    -- Optimization levels
    gas_optimization_level DECIMAL(5,4) DEFAULT 0,
    profit_optimization_level DECIMAL(5,4) DEFAULT 0,
    speed_optimization_level DECIMAL(5,4) DEFAULT 0,
    security_score DECIMAL(5,4) DEFAULT 0,
    
    -- Competitive analysis
    competitive_advantage TEXT,
    improvements_implemented TEXT[],
    benchmark_comparison TEXT,
    beats_competitors_by_percent DECIMAL(5,2),
    
    -- Testing and deployment
    test_results TEXT,
    gas_usage_estimate BIGINT,
    profit_projection DECIMAL(18,8),
    deployment_ready BOOLEAN DEFAULT FALSE,
    deployed_address VARCHAR(42),
    deployment_network VARCHAR(20),
    
    -- Performance tracking
    actual_gas_usage BIGINT,
    actual_profit_generated DECIMAL(18,8),
    success_rate DECIMAL(5,4),
    
    generated_at TIMESTAMP DEFAULT NOW(),
    deployed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Competitive intelligence database
CREATE TABLE IF NOT EXISTS competitive_intelligence (
    id SERIAL PRIMARY KEY,
    competitor_address VARCHAR(42) NOT NULL,
    competitor_name VARCHAR(100),
    
    -- Threat assessment
    threat_level VARCHAR(20) CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
    threat_score DECIMAL(5,4),
    
    -- Performance metrics
    success_rate DECIMAL(5,4),
    average_profit DECIMAL(18,8),
    total_profit DECIMAL(18,8),
    transaction_count INTEGER DEFAULT 0,
    gas_efficiency DECIMAL(5,4),
    average_execution_speed_ms BIGINT,
    
    -- Strategy analysis
    primary_strategies TEXT[],
    secondary_strategies TEXT[],
    unique_patterns TEXT[],
    
    -- Competitive positioning
    strengths TEXT[],
    weaknesses_identified TEXT[],
    advantages_over_us TEXT[],
    areas_we_beat_them TEXT[],
    
    -- Learning opportunities
    learning_opportunities TEXT[],
    recommended_responses TEXT[],
    counter_strategies TEXT[],
    
    -- Time tracking
    first_observed TIMESTAMP,
    last_analyzed TIMESTAMP DEFAULT NOW(),
    analysis_frequency_hours INTEGER DEFAULT 24,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Pattern recognition and learning
CREATE TABLE IF NOT EXISTS arbitrage_patterns (
    id SERIAL PRIMARY KEY,
    pattern_name VARCHAR(100) NOT NULL,
    pattern_type VARCHAR(50) CHECK (pattern_type IN (
        'mev_strategy', 'gas_optimization', 'profit_maximization', 
        'speed_optimization', 'security_enhancement', 'multi_dex'
    )),
    description TEXT,
    
    -- Pattern characteristics
    success_indicators TEXT[],
    risk_factors TEXT[],
    implementation_complexity VARCHAR(20) CHECK (implementation_complexity IN ('low', 'medium', 'high')),
    
    -- Performance metrics
    profit_potential DECIMAL(5,4),
    gas_efficiency DECIMAL(5,4),
    execution_speed_impact DECIMAL(5,4),
    security_impact DECIMAL(5,4),
    
    -- Usage and effectiveness
    frequency_observed INTEGER DEFAULT 1,
    effectiveness_score DECIMAL(5,4),
    competitive_usage DECIMAL(5,4),
    
    -- Implementation tracking
    our_implementation_status VARCHAR(20) DEFAULT 'not_implemented' CHECK (our_implementation_status IN (
        'not_implemented', 'researching', 'implementing', 'testing', 'deployed', 'failed'
    )),
    implementation_priority VARCHAR(20) DEFAULT 'medium' CHECK (implementation_priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Discovery and observation
    discovered_by VARCHAR(50),
    discovered_at TIMESTAMP DEFAULT NOW(),
    last_observed TIMESTAMP DEFAULT NOW(),
    observation_count INTEGER DEFAULT 1,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Background task execution tracking
CREATE TABLE IF NOT EXISTS background_task_executions (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    
    -- Execution details
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    duration_ms BIGINT,
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout')),
    
    -- Results
    transactions_analyzed INTEGER DEFAULT 0,
    patterns_found INTEGER DEFAULT 0,
    threats_identified INTEGER DEFAULT 0,
    improvements_discovered INTEGER DEFAULT 0,
    
    -- Performance metrics
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INTEGER,
    
    -- Error tracking
    error_message TEXT,
    error_stack TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance metrics aggregation
CREATE TABLE IF NOT EXISTS agent_performance_metrics (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    metric_date DATE DEFAULT CURRENT_DATE,
    
    -- Research performance
    research_tasks_completed INTEGER DEFAULT 0,
    average_improvement_achieved DECIMAL(5,2),
    total_improvements_implemented INTEGER DEFAULT 0,
    
    -- Competitive analysis
    competitors_analyzed INTEGER DEFAULT 0,
    threats_identified INTEGER DEFAULT 0,
    learning_opportunities_found INTEGER DEFAULT 0,
    
    -- Contract generation
    contracts_generated INTEGER DEFAULT 0,
    contracts_deployed INTEGER DEFAULT 0,
    average_gas_optimization DECIMAL(5,4),
    average_profit_improvement DECIMAL(5,4),
    
    -- Success rates
    research_success_rate DECIMAL(5,4),
    contract_deployment_success_rate DECIMAL(5,4),
    competitive_advantage_rate DECIMAL(5,4),
    
    -- Financial impact
    estimated_profit_increase DECIMAL(18,8),
    estimated_gas_savings DECIMAL(18,8),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(agent_id, metric_date)
);

-- RL learning experiences for Elite Contract Developer
CREATE TABLE IF NOT EXISTS elite_rl_experiences (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(50) NOT NULL,
    
    -- Experience details
    experience_type VARCHAR(50) CHECK (experience_type IN (
        'research_completion', 'contract_generation', 'competitor_analysis', 
        'threat_response', 'pattern_discovery', 'optimization_success'
    )),
    
    -- State representation
    state_category VARCHAR(50),
    state_data JSONB,
    
    -- Action taken
    action_type VARCHAR(50),
    action_data JSONB,
    
    -- Reward calculation
    base_reward DECIMAL(8,4),
    improvement_bonus DECIMAL(8,4),
    competitive_bonus DECIMAL(8,4),
    speed_bonus DECIMAL(8,4),
    total_reward DECIMAL(8,4),
    
    -- Outcome
    success BOOLEAN,
    improvement_percent DECIMAL(5,2),
    execution_time_ms BIGINT,
    
    -- Learning value
    confidence DECIMAL(5,4),
    learning_value DECIMAL(5,4),
    should_share_with_collective BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_competitor_transactions_timestamp ON competitor_transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_competitor_transactions_profit ON competitor_transactions(profit_usd DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_transactions_threat_level ON competitor_transactions(threat_level);
CREATE INDEX IF NOT EXISTS idx_competitor_transactions_patterns ON competitor_transactions USING GIN(patterns_identified);

CREATE INDEX IF NOT EXISTS idx_research_tasks_category ON research_tasks(category);
CREATE INDEX IF NOT EXISTS idx_research_tasks_status ON research_tasks(status);
CREATE INDEX IF NOT EXISTS idx_research_tasks_priority ON research_tasks(priority_score DESC);

CREATE INDEX IF NOT EXISTS idx_competitive_intelligence_threat ON competitive_intelligence(threat_level);
CREATE INDEX IF NOT EXISTS idx_competitive_intelligence_performance ON competitive_intelligence(success_rate DESC, average_profit DESC);

CREATE INDEX IF NOT EXISTS idx_arbitrage_patterns_type ON arbitrage_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_arbitrage_patterns_effectiveness ON arbitrage_patterns(effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_arbitrage_patterns_implementation ON arbitrage_patterns(our_implementation_status);

CREATE INDEX IF NOT EXISTS idx_background_tasks_agent_task ON background_task_executions(agent_id, task_id);
CREATE INDEX IF NOT EXISTS idx_background_tasks_status ON background_task_executions(status);
CREATE INDEX IF NOT EXISTS idx_background_tasks_completed ON background_task_executions(completed_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_competitor_transactions_updated_at BEFORE UPDATE
    ON competitor_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_research_tasks_updated_at BEFORE UPDATE
    ON research_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitive_intelligence_updated_at BEFORE UPDATE
    ON competitive_intelligence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arbitrage_patterns_updated_at BEFORE UPDATE
    ON arbitrage_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_performance_metrics_updated_at BEFORE UPDATE
    ON agent_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for easy data analysis
CREATE OR REPLACE VIEW competitor_threat_analysis AS
SELECT 
    ci.competitor_address,
    ci.threat_level,
    ci.success_rate,
    ci.average_profit,
    ci.gas_efficiency,
    COUNT(ct.id) as recent_transactions,
    AVG(ct.profit_usd) as recent_avg_profit,
    MAX(ct.timestamp) as last_transaction
FROM competitive_intelligence ci
LEFT JOIN competitor_transactions ct ON ct.from_address = ci.competitor_address
    AND ct.timestamp > EXTRACT(EPOCH FROM (NOW() - INTERVAL '7 days')) * 1000
GROUP BY ci.competitor_address, ci.threat_level, ci.success_rate, ci.average_profit, ci.gas_efficiency;

CREATE OR REPLACE VIEW research_queue_summary AS
SELECT 
    category,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    AVG(target_improvement_percent) as avg_target_improvement,
    AVG(actual_improvement_percent) as avg_actual_improvement
FROM research_tasks
GROUP BY category;

CREATE OR REPLACE VIEW top_performing_patterns AS
SELECT 
    pattern_name,
    pattern_type,
    effectiveness_score,
    frequency_observed,
    profit_potential,
    our_implementation_status,
    implementation_priority
FROM arbitrage_patterns
WHERE effectiveness_score > 0.7
ORDER BY effectiveness_score DESC, frequency_observed DESC;

-- Insert initial data for system setup
INSERT INTO research_tasks (category, title, description, target_improvement_percent, priority_score, completion_criteria) VALUES
('gas_efficiency', 'Initial Gas Optimization Baseline', 'Establish baseline gas efficiency metrics from competitor analysis', 10.0, 0.8, 'Achieve 10% reduction in average gas usage compared to current baseline'),
('profit_optimization', 'Profit Margin Enhancement Research', 'Research competitor profit strategies for enhancement opportunities', 15.0, 0.9, 'Identify and implement strategies for 15% profit margin improvement'),
('execution_speed', 'Speed Optimization Initiative', 'Analyze competitor execution speeds and optimize our performance', 20.0, 0.85, 'Achieve sub-100ms execution time consistently'),
('security_enhancement', 'MEV Protection Implementation', 'Research and implement advanced MEV protection strategies', 25.0, 0.95, 'Implement BloXroute integration and reduce failed transactions by 25%'),
('competition_analysis', 'Competitive Landscape Mapping', 'Comprehensive analysis of top arbitrage competitors', 30.0, 0.7, 'Complete analysis of top 50 competitors with threat assessment'),
('mev_protection', 'Advanced MEV Protection Suite', 'Develop comprehensive MEV protection capabilities', 35.0, 1.0, 'Deploy MEV protection with 35% improvement in transaction success rate');

-- Success message
SELECT 'Elite Contract Developer database schema initialized successfully!' as status; 