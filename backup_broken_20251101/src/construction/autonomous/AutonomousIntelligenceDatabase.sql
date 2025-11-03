-- =========================================================
-- 🤖 AUTONOMOUS CONSTRUCTION INTELLIGENCE DATABASE SCHEMA
-- =========================================================
-- 
-- Tables for storing 24/7 autonomous learning and intelligence data
-- Created for Construction Syndicate's continuous learning system

-- 🏗️ CONSTRUCTION PROJECTS TABLE (for pattern learning)
CREATE TABLE IF NOT EXISTS construction_projects (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(255) UNIQUE NOT NULL,
    project_name VARCHAR(500) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    hoai_phase VARCHAR(50),
    project_data JSONB,
    methodologies JSONB,
    success_metrics JSONB,
    success_score DECIMAL(3,2) DEFAULT 0.0,
    completion_status VARCHAR(50) DEFAULT 'in_progress',
    budget_actual DECIMAL(15,2),
    budget_planned DECIMAL(15,2),
    timeline_actual INTEGER, -- days
    timeline_planned INTEGER, -- days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🧠 LEARNED CONSTRUCTION PATTERNS TABLE
CREATE TABLE IF NOT EXISTS learned_construction_patterns (
    id SERIAL PRIMARY KEY,
    pattern_type VARCHAR(100) NOT NULL,
    pattern_name VARCHAR(255),
    insights JSONB NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    learned_from_projects TEXT[], -- array of project IDs
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_validated TIMESTAMP,
    validation_status VARCHAR(50) DEFAULT 'active'
);

-- 🚨 CONSTRUCTION ERRORS TABLE (for error pattern learning)
CREATE TABLE IF NOT EXISTS construction_errors (
    id SERIAL PRIMARY KEY,
    error_id VARCHAR(255) UNIQUE NOT NULL,
    project_id VARCHAR(255),
    error_type VARCHAR(100) NOT NULL,
    error_category VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    description TEXT NOT NULL,
    context JSONB,
    resolution JSONB,
    prevention_strategy JSONB,
    project_phase VARCHAR(50),
    cost_impact DECIMAL(15,2),
    time_impact INTEGER, -- hours
    detected_by VARCHAR(100), -- agent or system that detected it
    resolved_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- 🛡️ ERROR PREVENTION KNOWLEDGE TABLE
CREATE TABLE IF NOT EXISTS error_prevention_knowledge (
    id SERIAL PRIMARY KEY,
    prevention_id VARCHAR(255) UNIQUE NOT NULL,
    error_patterns JSONB NOT NULL,
    prevention_strategies JSONB NOT NULL,
    early_warning_signs JSONB,
    confidence_score DECIMAL(3,2) DEFAULT 0.0,
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    times_applied INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    learned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💰 MATERIAL PRICES TABLE (for price monitoring)
CREATE TABLE IF NOT EXISTS material_prices (
    id SERIAL PRIMARY KEY,
    material VARCHAR(100) UNIQUE NOT NULL,
    material_category VARCHAR(100) NOT NULL,
    current_price DECIMAL(10,2) NOT NULL,
    previous_price DECIMAL(10,2),
    price_trend VARCHAR(20), -- increasing, decreasing, stable
    percentage_change DECIMAL(5,2),
    supply_status VARCHAR(50), -- available, limited, scarce
    supplier_info JSONB,
    quality_grade VARCHAR(50),
    region VARCHAR(100) DEFAULT 'germany',
    unit VARCHAR(20) DEFAULT 'per_unit',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    price_history JSONB -- array of historical prices
);

-- 📊 AGENT PERFORMANCE TABLE (for capability evolution)
CREATE TABLE IF NOT EXISTS agent_performance (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(255) NOT NULL,
    agent_type VARCHAR(100) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    task_id VARCHAR(255),
    success_rate DECIMAL(3,2) DEFAULT 0.0,
    avg_completion_time INTEGER, -- seconds
    error_count INTEGER DEFAULT 0,
    improvement_suggestions JSONB,
    performance_metrics JSONB,
    evaluation_period VARCHAR(50), -- daily, weekly, monthly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏗️ HOAI COMPLIANCE MONITORING TABLE
CREATE TABLE IF NOT EXISTS hoai_compliance_monitoring (
    id SERIAL PRIMARY KEY,
    regulation_id VARCHAR(255) UNIQUE NOT NULL,
    regulation_type VARCHAR(100) NOT NULL, -- building_code, safety, environmental
    regulation_text TEXT NOT NULL,
    compliance_requirements JSONB,
    affected_phases JSONB, -- which HOAI phases are affected
    effective_date DATE,
    last_updated DATE,
    compliance_difficulty VARCHAR(20), -- easy, moderate, difficult
    monitoring_frequency VARCHAR(50), -- daily, weekly, monthly
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_impact VARCHAR(20), -- low, medium, high
    automated_compliance_check BOOLEAN DEFAULT FALSE
);

-- 🧠 AUTONOMOUS TASK EXECUTION LOG
CREATE TABLE IF NOT EXISTS autonomous_task_log (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    execution_status VARCHAR(50) NOT NULL, -- running, completed, failed
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_seconds INTEGER,
    task_data JSONB,
    results JSONB,
    error_message TEXT,
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    learning_outcome JSONB,
    next_execution TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🤝 CROSS-AGENT COLLABORATION LOG
CREATE TABLE IF NOT EXISTS cross_agent_collaboration (
    id SERIAL PRIMARY KEY,
    collaboration_id VARCHAR(255) UNIQUE NOT NULL,
    participating_agents TEXT[] NOT NULL,
    collaboration_type VARCHAR(100) NOT NULL, -- knowledge_sharing, problem_solving, strategy_refinement
    topic VARCHAR(255) NOT NULL,
    knowledge_exchanged JSONB,
    insights_generated JSONB,
    collaboration_outcome VARCHAR(100), -- successful, partially_successful, failed
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    duration_minutes INTEGER,
    initiated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 CONSTRUCTION INDUSTRY INTELLIGENCE
CREATE TABLE IF NOT EXISTS construction_industry_intelligence (
    id SERIAL PRIMARY KEY,
    intelligence_id VARCHAR(255) UNIQUE NOT NULL,
    intelligence_type VARCHAR(100) NOT NULL, -- market_trend, regulation_change, technology_update
    source VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    key_insights JSONB,
    impact_assessment JSONB,
    relevance_score DECIMAL(3,2) DEFAULT 0.0,
    actionable_items JSONB,
    geographic_scope VARCHAR(100) DEFAULT 'germany',
    industry_sectors TEXT[],
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    applied_to_projects TEXT[] -- project IDs where this intelligence was applied
);

-- 📈 SYSTEM PERFORMANCE METRICS
CREATE TABLE IF NOT EXISTS system_performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(100) NOT NULL, -- memory, cpu, database, learning
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50),
    measurement_context JSONB,
    benchmark_value DECIMAL(15,4),
    performance_status VARCHAR(50), -- optimal, good, concerning, critical
    improvement_suggestions JSONB,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🔄 Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_construction_projects_success_score ON construction_projects(success_score DESC);
CREATE INDEX IF NOT EXISTS idx_construction_projects_created_at ON construction_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learned_patterns_confidence ON learned_construction_patterns(confidence_score DESC);
CREATE INDEX IF NOT EXISTS idx_construction_errors_severity ON construction_errors(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_material_prices_updated_at ON material_prices(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_performance_agent_id ON agent_performance(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_performance_task_type ON agent_performance(task_type);
CREATE INDEX IF NOT EXISTS idx_agent_performance_created_at ON agent_performance(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON system_performance_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_measured_at ON system_performance_metrics(measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_autonomous_task_log_task_type ON autonomous_task_log(task_type, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_industry_intelligence_relevance ON construction_industry_intelligence(relevance_score DESC);

-- 🎯 Sample data for testing (optional)
INSERT INTO material_prices (material, material_category, current_price, price_trend, supply_status, unit) VALUES
    ('concrete_c25', 'concrete', 85.50, 'stable', 'available', 'per_m3'),
    ('steel_rebar_16mm', 'steel', 1250.00, 'increasing', 'available', 'per_ton'),
    ('lumber_pine_50x200', 'lumber', 320.00, 'decreasing', 'available', 'per_m3'),
    ('insulation_mineral_wool', 'insulation', 12.50, 'stable', 'available', 'per_m2'),
    ('roofing_tiles_ceramic', 'roofing', 45.00, 'stable', 'available', 'per_m2')
ON CONFLICT (material) DO NOTHING;

-- 🧠 Sample learned patterns for testing
INSERT INTO learned_construction_patterns (pattern_type, pattern_name, insights, confidence_score) VALUES
    ('methodology_patterns', 'Early Foundation Inspection', '{"recommendation": "Perform foundation inspection within 48 hours of pour", "success_rate": 0.94, "cost_saving": "15%"}', 0.94),
    ('quality_control', 'Material Testing Frequency', '{"recommendation": "Test concrete samples every 50m3 for optimal quality assurance", "defect_reduction": "28%"}', 0.87)
ON CONFLICT DO NOTHING;

COMMIT;
