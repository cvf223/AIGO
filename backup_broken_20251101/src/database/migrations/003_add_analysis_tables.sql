-- 003_add_analysis_tables.sql
-- Construction plan analysis and annotation tables
-- Version: 1.0.0
-- Date: October 2025

-- ===== CONSTRUCTION PROJECTS TABLE =====
CREATE TABLE IF NOT EXISTS construction_projects (
    id SERIAL PRIMARY KEY,
    project_id UUID DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'planning',
    project_type VARCHAR(100),
    location JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== CONSTRUCTION PLANS TABLE =====
CREATE TABLE IF NOT EXISTS construction_plans (
    id SERIAL PRIMARY KEY,
    plan_id UUID DEFAULT uuid_generate_v4(),
    project_id INTEGER REFERENCES construction_projects(id) ON DELETE CASCADE,
    uploaded_by INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    plan_type VARCHAR(100), -- floor_plan, elevation, section, detail
    phase VARCHAR(50), -- LP 1-9 (HOAI phases)
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PLAN ANALYSIS TABLE =====
CREATE TABLE IF NOT EXISTS plan_analyses (
    id SERIAL PRIMARY KEY,
    analysis_id UUID DEFAULT uuid_generate_v4(),
    plan_id INTEGER REFERENCES construction_plans(id) ON DELETE CASCADE,
    initiated_by INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending',
    analysis_type VARCHAR(100) NOT NULL,
    din_standard VARCHAR(50), -- DIN 276, etc.
    hoai_phase VARCHAR(10), -- LP 1-9
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time_ms INTEGER,
    results JSONB DEFAULT '{}'::jsonb,
    errors JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ===== ANALYSIS RESULTS TABLE =====
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES plan_analyses(id) ON DELETE CASCADE,
    result_type VARCHAR(100) NOT NULL, -- measurements, materials, compliance, errors
    confidence DECIMAL(5, 4),
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== ANNOTATIONS TABLE =====
CREATE TABLE IF NOT EXISTS plan_annotations (
    id SERIAL PRIMARY KEY,
    annotation_id UUID DEFAULT uuid_generate_v4(),
    plan_id INTEGER REFERENCES construction_plans(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES plan_analyses(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    annotation_type VARCHAR(100) NOT NULL,
    layer VARCHAR(50), -- measurements, materials, reasoning, etc.
    position JSONB NOT NULL, -- {x, y, width, height}
    content JSONB NOT NULL,
    style JSONB DEFAULT '{}'::jsonb,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== ANNOTATED PLANS TABLE =====
CREATE TABLE IF NOT EXISTS annotated_plans (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES construction_plans(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES plan_analyses(id) ON DELETE CASCADE,
    template VARCHAR(50) NOT NULL, -- monitoring, investor, detailed
    layers JSONB NOT NULL, -- which layers are included
    file_path TEXT NOT NULL,
    format VARCHAR(20), -- png, pdf, svg
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ===== COMPLIANCE CHECKS TABLE =====
CREATE TABLE IF NOT EXISTS compliance_checks (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES plan_analyses(id) ON DELETE CASCADE,
    standard VARCHAR(100) NOT NULL, -- DIN 276, HOAI, etc.
    check_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- compliant, non_compliant, warning
    severity VARCHAR(20), -- critical, high, medium, low
    description TEXT,
    recommendation TEXT,
    position JSONB, -- location on plan
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== QUANTITY TAKEOFFS TABLE =====
CREATE TABLE IF NOT EXISTS quantity_takeoffs (
    id SERIAL PRIMARY KEY,
    analysis_id INTEGER REFERENCES plan_analyses(id) ON DELETE CASCADE,
    element_type VARCHAR(100) NOT NULL,
    din_code VARCHAR(20), -- DIN 276 code
    description TEXT,
    quantity DECIMAL(20, 4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_price DECIMAL(20, 2),
    total_price DECIMAL(20, 2),
    confidence DECIMAL(5, 4),
    position JSONB, -- location on plan
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===== PLAN APPROVAL WORKFLOW =====
CREATE TABLE IF NOT EXISTS plan_approvals (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES construction_plans(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES plan_analyses(id),
    reviewer_id INTEGER REFERENCES users(id),
    status VARCHAR(50) NOT NULL, -- pending, approved, rejected, revision_requested
    comments TEXT,
    edits JSONB DEFAULT '[]'::jsonb,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- ===== VLM ANALYSIS CACHE =====
CREATE TABLE IF NOT EXISTS vlm_analysis_cache (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES construction_plans(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    model_version VARCHAR(50),
    input_hash VARCHAR(64) NOT NULL, -- SHA-256 of input
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(plan_id, model_name, input_hash)
);

-- ===== INDEXES =====
CREATE INDEX idx_construction_projects_owner ON construction_projects(owner_id);
CREATE INDEX idx_construction_projects_status ON construction_projects(status);
CREATE INDEX idx_construction_plans_project ON construction_plans(project_id);
CREATE INDEX idx_construction_plans_uploaded_by ON construction_plans(uploaded_by);
CREATE INDEX idx_plan_analyses_plan ON plan_analyses(plan_id);
CREATE INDEX idx_plan_analyses_status ON plan_analyses(status);
CREATE INDEX idx_plan_analyses_completed ON plan_analyses(completed_at DESC);
CREATE INDEX idx_analysis_results_analysis ON analysis_results(analysis_id);
CREATE INDEX idx_plan_annotations_plan ON plan_annotations(plan_id);
CREATE INDEX idx_plan_annotations_analysis ON plan_annotations(analysis_id);
CREATE INDEX idx_annotated_plans_plan ON annotated_plans(plan_id);
CREATE INDEX idx_annotated_plans_analysis ON annotated_plans(analysis_id);
CREATE INDEX idx_compliance_checks_analysis ON compliance_checks(analysis_id);
CREATE INDEX idx_compliance_checks_status ON compliance_checks(status);
CREATE INDEX idx_quantity_takeoffs_analysis ON quantity_takeoffs(analysis_id);
CREATE INDEX idx_plan_approvals_plan ON plan_approvals(plan_id);
CREATE INDEX idx_plan_approvals_status ON plan_approvals(status);
CREATE INDEX idx_vlm_cache_expires ON vlm_analysis_cache(expires_at) WHERE expires_at IS NOT NULL;

-- ===== TRIGGERS =====
-- Add update triggers for tables with updated_at
CREATE TRIGGER update_construction_projects_updated_at BEFORE UPDATE ON construction_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plan_annotations_updated_at BEFORE UPDATE ON plan_annotations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== FUNCTIONS =====
-- Function to calculate total project cost
CREATE OR REPLACE FUNCTION calculate_project_cost(p_analysis_id INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL(20, 2);
BEGIN
    SELECT COALESCE(SUM(total_price), 0)
    INTO total_cost
    FROM quantity_takeoffs
    WHERE analysis_id = p_analysis_id;
    
    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to get compliance summary
CREATE OR REPLACE FUNCTION get_compliance_summary(p_analysis_id INTEGER)
RETURNS TABLE(
    total_checks INTEGER,
    compliant_count INTEGER,
    non_compliant_count INTEGER,
    warning_count INTEGER,
    compliance_rate DECIMAL(5, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_checks,
        COUNT(*) FILTER (WHERE status = 'compliant')::INTEGER as compliant_count,
        COUNT(*) FILTER (WHERE status = 'non_compliant')::INTEGER as non_compliant_count,
        COUNT(*) FILTER (WHERE status = 'warning')::INTEGER as warning_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE status = 'compliant')::DECIMAL / COUNT(*)::DECIMAL * 100)
            ELSE 0
        END as compliance_rate
    FROM compliance_checks
    WHERE analysis_id = p_analysis_id;
END;
$$ LANGUAGE plpgsql;
