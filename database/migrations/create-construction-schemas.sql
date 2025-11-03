-- 🏗️ CONSTRUCTION SYNDICATE DATABASE SCHEMAS
-- ============================================
-- Creates all necessary tables for HOAI LP 6 & 7 operations

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONSTRUCTION PROJECTS
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    project_type VARCHAR(100), -- 'office', 'residential', 'industrial', etc.
    location VARCHAR(255),
    budget_estimate DECIMAL(15,2),
    
    -- HOAI Phase tracking
    current_hoai_phase VARCHAR(20) DEFAULT 'LP6',
    lp6_started_at TIMESTAMP,
    lp6_completed_at TIMESTAMP,
    lp7_started_at TIMESTAMP,
    lp7_completed_at TIMESTAMP,
    
    -- Project metadata
    bgf DECIMAL(10,2), -- Brutto-Grundfläche in m²
    ngf DECIMAL(10,2), -- Netto-Grundfläche in m²
    nuf DECIMAL(10,2), -- Nutzfläche in m²
    construction_class VARCHAR(50), -- Baukostenklasse
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'archived'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    
    CONSTRAINT valid_hoai_phase CHECK (current_hoai_phase IN ('LP1', 'LP2', 'LP3', 'LP4', 'LP5', 'LP6', 'LP7', 'LP8', 'LP9'))
);

CREATE INDEX idx_construction_projects_status ON construction_projects(status);
CREATE INDEX idx_construction_projects_phase ON construction_projects(current_hoai_phase);
CREATE INDEX idx_construction_projects_number ON construction_projects(project_number);

-- =====================================================
-- CONSTRUCTION PLANS
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    plan_number VARCHAR(100) NOT NULL,
    plan_title VARCHAR(255) NOT NULL,
    plan_type VARCHAR(50) NOT NULL, -- 'floor_plan', 'section', 'elevation', 'detail', 'site_plan'
    discipline VARCHAR(50), -- 'architecture', 'structural', 'mep', 'civil'
    
    -- Plan metadata
    scale VARCHAR(20), -- '1:100', '1:50', etc.
    drawing_date DATE,
    revision VARCHAR(20),
    sheet_size VARCHAR(10), -- 'A0', 'A1', 'A2', etc.
    
    -- Storage
    file_path TEXT,
    file_size_bytes BIGINT,
    file_format VARCHAR(20), -- 'pdf', 'dwg', 'dxf', 'png'
    thumbnail_path TEXT,
    
    -- Vision analysis results
    analyzed BOOLEAN DEFAULT FALSE,
    analysis_date TIMESTAMP,
    analysis_confidence DECIMAL(5,4),
    analysis_results JSONB,
    
    -- Cross-reference data
    grid_lines JSONB, -- Stored grid line data
    dimensions JSONB, -- Extracted dimensions
    annotations JSONB, -- Text annotations
    elements JSONB, -- Structural elements
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, plan_number)
);

CREATE INDEX idx_construction_plans_project ON construction_plans(project_id);
CREATE INDEX idx_construction_plans_type ON construction_plans(plan_type);
CREATE INDEX idx_construction_plans_analyzed ON construction_plans(analyzed);
CREATE INDEX idx_construction_plans_analysis_gin ON construction_plans USING GIN (analysis_results);

-- =====================================================
-- PLAN CROSS-REFERENCES
-- =====================================================

CREATE TABLE IF NOT EXISTS plan_cross_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    plan_a_id UUID NOT NULL REFERENCES construction_plans(id) ON DELETE CASCADE,
    plan_b_id UUID NOT NULL REFERENCES construction_plans(id) ON DELETE CASCADE,
    
    reference_type VARCHAR(50), -- 'grid_shared', 'dimension_reference', 'detail_reference'
    shared_elements JSONB,
    consistency_score DECIMAL(5,4),
    
    validated BOOLEAN DEFAULT FALSE,
    validation_date TIMESTAMP,
    conflicts_detected JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(plan_a_id, plan_b_id)
);

CREATE INDEX idx_cross_refs_project ON plan_cross_references(project_id);
CREATE INDEX idx_cross_refs_validated ON plan_cross_references(validated);

-- =====================================================
-- QUANTITIES & BOQ
-- =====================================================

CREATE TABLE IF NOT EXISTS extracted_quantities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES construction_plans(id) ON DELETE CASCADE,
    
    -- DIN 276 classification
    cost_group VARCHAR(10) NOT NULL, -- '300', '310', '320', etc.
    cost_group_description TEXT,
    
    -- Quantity data
    position_number VARCHAR(50),
    description TEXT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'm²', 'm³', 'm', 'Stk', 'psch'
    
    -- Extraction metadata
    extraction_method VARCHAR(50), -- 'vision_ai', 'manual', 'imported'
    confidence DECIMAL(5,4),
    source_location JSONB, -- Where in the plan this was found
    
    -- Validation
    validated BOOLEAN DEFAULT FALSE,
    validated_by VARCHAR(100),
    validated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quantities_project ON extracted_quantities(project_id);
CREATE INDEX idx_quantities_cost_group ON extracted_quantities(cost_group);
CREATE INDEX idx_quantities_validated ON extracted_quantities(validated);

-- =====================================================
-- BILL OF QUANTITIES (BOQ/LV)
-- =====================================================

CREATE TABLE IF NOT EXISTS bills_of_quantities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    boq_number VARCHAR(50) NOT NULL,
    boq_title VARCHAR(255),
    version VARCHAR(20) DEFAULT '1.0',
    
    -- BOQ metadata
    format VARCHAR(20) DEFAULT 'GAEB', -- 'GAEB', 'Excel', 'PDF'
    structure_standard VARCHAR(20) DEFAULT 'DIN_276', -- 'DIN_276', 'DIN_277'
    
    -- Content
    total_positions INTEGER DEFAULT 0,
    alternative_positions INTEGER DEFAULT 0,
    eventual_positions INTEGER DEFAULT 0,
    
    -- Document generation
    generated BOOLEAN DEFAULT FALSE,
    generated_at TIMESTAMP,
    file_path TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved', 'published'
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, boq_number)
);

CREATE INDEX idx_boq_project ON bills_of_quantities(project_id);
CREATE INDEX idx_boq_status ON bills_of_quantities(status);

-- =====================================================
-- BOQ POSITIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS boq_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    boq_id UUID NOT NULL REFERENCES bills_of_quantities(id) ON DELETE CASCADE,
    
    -- Position identification
    oz VARCHAR(50) NOT NULL, -- Ordnungszahl (position number)
    position_type VARCHAR(20) DEFAULT 'NORMAL', -- 'NORMAL', 'ALTERNATIVE', 'EVENTUAL'
    alternative_to VARCHAR(50), -- Reference to main position if alternative
    
    -- Position content
    short_text TEXT NOT NULL,
    long_text TEXT,
    specifications TEXT,
    
    -- Quantity and pricing
    quantity DECIMAL(15,4),
    unit VARCHAR(20),
    unit_price DECIMAL(12,4) DEFAULT 0, -- Filled by bidder
    total_price DECIMAL(15,4) DEFAULT 0, -- Calculated
    
    -- Classification
    din_276_group VARCHAR(10),
    trade VARCHAR(100), -- 'concrete', 'steel', 'hvac', etc.
    
    -- References
    source_quantity_ids JSONB, -- References to extracted_quantities
    plan_references JSONB, -- Which plans this relates to
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(boq_id, oz)
);

CREATE INDEX idx_boq_positions_boq ON boq_positions(boq_id);
CREATE INDEX idx_boq_positions_type ON boq_positions(position_type);
CREATE INDEX idx_boq_positions_din ON boq_positions(din_276_group);

-- =====================================================
-- TENDER DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS tender_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    document_type VARCHAR(50) NOT NULL, -- 'cover_letter', 'conditions', 'service_description', etc.
    document_title VARCHAR(255) NOT NULL,
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Content
    content_json JSONB,
    file_path TEXT,
    page_count INTEGER,
    
    -- Compliance
    vob_compliant BOOLEAN DEFAULT TRUE,
    hoai_compliant BOOLEAN DEFAULT TRUE,
    compliance_report JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft',
    generated_at TIMESTAMP,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tender_docs_project ON tender_documents(project_id);
CREATE INDEX idx_tender_docs_type ON tender_documents(document_type);
CREATE INDEX idx_tender_docs_status ON tender_documents(status);

-- =====================================================
-- CONTRACTOR BIDS
-- =====================================================

CREATE TABLE IF NOT EXISTS contractor_bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    -- Contractor information
    contractor_name VARCHAR(255) NOT NULL,
    contractor_id VARCHAR(100),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Bid metadata
    bid_number VARCHAR(50) NOT NULL,
    submission_date TIMESTAMP NOT NULL,
    submission_method VARCHAR(50), -- 'digital', 'physical', 'hybrid'
    
    -- Bid content
    total_price DECIMAL(15,4) NOT NULL,
    proposed_duration INTEGER, -- days
    warranty_period INTEGER, -- months
    
    -- Formal examination
    complete BOOLEAN DEFAULT FALSE,
    within_deadline BOOLEAN DEFAULT FALSE,
    has_required_docs BOOLEAN DEFAULT FALSE,
    formally_qualified BOOLEAN DEFAULT FALSE,
    disqualification_reasons JSONB,
    
    -- Evaluation
    evaluated BOOLEAN DEFAULT FALSE,
    evaluation_date TIMESTAMP,
    evaluation_id UUID,
    
    -- Documents
    bid_documents JSONB, -- Array of document paths
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(project_id, bid_number)
);

CREATE INDEX idx_bids_project ON contractor_bids(project_id);
CREATE INDEX idx_bids_qualified ON contractor_bids(formally_qualified);
CREATE INDEX idx_bids_evaluated ON contractor_bids(evaluated);

-- =====================================================
-- BID ITEMS (Detailed bid positions)
-- =====================================================

CREATE TABLE IF NOT EXISTS bid_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bid_id UUID NOT NULL REFERENCES contractor_bids(id) ON DELETE CASCADE,
    
    position_oz VARCHAR(50) NOT NULL,
    quantity DECIMAL(15,4),
    unit VARCHAR(20),
    unit_price DECIMAL(12,4) NOT NULL,
    total_price DECIMAL(15,4) NOT NULL,
    
    -- Verification
    arithmetic_correct BOOLEAN DEFAULT TRUE,
    arithmetic_errors JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bid_items_bid ON bid_items(bid_id);
CREATE INDEX idx_bid_items_oz ON bid_items(position_oz);

-- =====================================================
-- BID EVALUATIONS (Preisspiegel)
-- =====================================================

CREATE TABLE IF NOT EXISTS bid_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    evaluation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    evaluator VARCHAR(100),
    
    -- Evaluation criteria weights
    price_weight DECIMAL(4,3) DEFAULT 0.70,
    quality_weight DECIMAL(4,3) DEFAULT 0.20,
    time_weight DECIMAL(4,3) DEFAULT 0.10,
    
    -- Results
    total_bids_received INTEGER,
    qualified_bids INTEGER,
    disqualified_bids INTEGER,
    
    -- Price analysis
    average_price DECIMAL(15,4),
    median_price DECIMAL(15,4),
    min_price DECIMAL(15,4),
    max_price DECIMAL(15,4),
    
    -- Recommendation
    recommended_bidder_id UUID REFERENCES contractor_bids(id),
    recommendation_confidence DECIMAL(5,4),
    recommendation_justification TEXT,
    
    -- Analysis artifacts
    price_matrix JSONB,
    quality_scores JSONB,
    time_scores JSONB,
    suspicious_bids JSONB,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'review', 'approved'
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_evaluations_project ON bid_evaluations(project_id);
CREATE INDEX idx_evaluations_status ON bid_evaluations(status);

-- =====================================================
-- ERROR DETECTIONS & ESCALATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS error_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    -- Error details
    error_type VARCHAR(100) NOT NULL, -- 'dimension_conflict', 'annotation_missing', etc.
    severity VARCHAR(20) NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    category VARCHAR(50), -- 'DIMENSION', 'STRUCTURAL', 'ANNOTATION', etc.
    
    description TEXT NOT NULL,
    detection_confidence DECIMAL(5,4),
    
    -- Location
    affected_plans JSONB, -- Array of plan IDs
    location_data JSONB, -- Coordinates, grid references, etc.
    
    -- Detection metadata
    detected_by VARCHAR(100), -- Agent ID
    detected_at TIMESTAMP DEFAULT NOW(),
    detection_method VARCHAR(50), -- 'quantum_analysis', 'cross_reference', 'ai_vision'
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_method VARCHAR(100),
    
    -- Human escalation
    escalated BOOLEAN DEFAULT FALSE,
    escalation_ticket_id UUID,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_errors_project ON error_detections(project_id);
CREATE INDEX idx_errors_severity ON error_detections(severity);
CREATE INDEX idx_errors_resolved ON error_detections(resolved);
CREATE INDEX idx_errors_escalated ON error_detections(escalated);

-- =====================================================
-- HUMAN ESCALATION TICKETS
-- =====================================================

CREATE TABLE IF NOT EXISTS escalation_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    error_id UUID REFERENCES error_detections(id) ON DELETE SET NULL,
    
    -- Ticket information
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    
    -- Solution proposals
    proposed_solutions JSONB, -- Array of solution objects with rankings
    solution_count INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED'
    assigned_to VARCHAR(100),
    assigned_at TIMESTAMP,
    
    -- Resolution
    selected_solution JSONB,
    resolution_notes TEXT,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    
    -- Visual documentation
    visual_report_path TEXT,
    markup_images JSONB,
    
    -- Metrics
    response_time_minutes INTEGER,
    resolution_time_minutes INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tickets_project ON escalation_tickets(project_id);
CREATE INDEX idx_tickets_status ON escalation_tickets(status);
CREATE INDEX idx_tickets_priority ON escalation_tickets(priority);
CREATE INDEX idx_tickets_number ON escalation_tickets(ticket_number);

-- =====================================================
-- AGENT LEARNING & PERFORMANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL,
    project_id UUID REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    -- Performance metrics
    task_type VARCHAR(100), -- 'quantity_extraction', 'error_detection', etc.
    accuracy_rate DECIMAL(5,4),
    processing_time_ms INTEGER,
    confidence_score DECIMAL(5,4),
    
    -- Learning data
    successful_actions INTEGER DEFAULT 0,
    failed_actions INTEGER DEFAULT 0,
    learning_iteration INTEGER,
    
    -- Rewards/penalties
    total_reward DECIMAL(10,2),
    reward_breakdown JSONB,
    
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agent_perf_agent ON construction_agent_performance(agent_id);
CREATE INDEX idx_agent_perf_project ON construction_agent_performance(project_id);
CREATE INDEX idx_agent_perf_task ON construction_agent_performance(task_type);

-- =====================================================
-- HOAI COMPLIANCE RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS hoai_compliance_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    -- Check details
    hoai_phase VARCHAR(20) NOT NULL,
    requirement_id VARCHAR(100) NOT NULL,
    requirement_description TEXT,
    
    -- Compliance status
    compliant BOOLEAN NOT NULL,
    confidence DECIMAL(5,4),
    check_method VARCHAR(50), -- 'formal_verification', 'document_analysis'
    
    -- Violations
    violations JSONB, -- Array of violation objects
    recommendations JSONB, -- Array of recommendation objects
    
    -- Check metadata
    checked_by VARCHAR(100),
    checked_at TIMESTAMP DEFAULT NOW(),
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_compliance_project ON hoai_compliance_checks(project_id);
CREATE INDEX idx_compliance_phase ON hoai_compliance_checks(hoai_phase);
CREATE INDEX idx_compliance_status ON hoai_compliance_checks(compliant);

-- =====================================================
-- SYSTEM ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS construction_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES construction_projects(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(100) NOT NULL,
    actor VARCHAR(100) NOT NULL, -- Agent ID or human user
    actor_type VARCHAR(20), -- 'agent', 'human', 'system'
    
    action VARCHAR(100) NOT NULL,
    details JSONB,
    
    -- Affected entities
    affected_entities JSONB, -- Array of {type, id} objects
    
    -- Results
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_project ON construction_activity_log(project_id);
CREATE INDEX idx_activity_type ON construction_activity_log(activity_type);
CREATE INDEX idx_activity_actor ON construction_activity_log(actor);
CREATE INDEX idx_activity_timestamp ON construction_activity_log(timestamp DESC);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Project overview with plan count and status
CREATE OR REPLACE VIEW v_project_overview AS
SELECT 
    p.id,
    p.project_number,
    p.project_name,
    p.client_name,
    p.current_hoai_phase,
    p.status,
    COUNT(DISTINCT cp.id) as total_plans,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.analyzed = true) as analyzed_plans,
    COUNT(DISTINCT ed.id) as total_errors,
    COUNT(DISTINCT ed.id) FILTER (WHERE ed.resolved = false) as unresolved_errors,
    COUNT(DISTINCT et.id) FILTER (WHERE et.status = 'OPEN') as open_tickets,
    p.created_at
FROM construction_projects p
LEFT JOIN construction_plans cp ON p.id = cp.project_id
LEFT JOIN error_detections ed ON p.id = ed.project_id
LEFT JOIN escalation_tickets et ON p.id = et.project_id
GROUP BY p.id;

-- Bid evaluation summary
CREATE OR REPLACE VIEW v_bid_evaluation_summary AS
SELECT 
    be.id as evaluation_id,
    be.project_id,
    p.project_name,
    be.total_bids_received,
    be.qualified_bids,
    cb.contractor_name as recommended_contractor,
    cb.total_price as recommended_price,
    be.recommendation_confidence,
    be.status,
    be.evaluation_date
FROM bid_evaluations be
JOIN construction_projects p ON be.project_id = p.id
LEFT JOIN contractor_bids cb ON be.recommended_bidder_id = cb.id;

-- Active escalation tickets
CREATE OR REPLACE VIEW v_active_escalations AS
SELECT 
    et.id,
    et.ticket_number,
    et.title,
    et.priority,
    et.status,
    p.project_name,
    ed.error_type,
    ed.severity,
    et.solution_count,
    et.created_at,
    EXTRACT(EPOCH FROM (NOW() - et.created_at))/60 as age_minutes
FROM escalation_tickets et
JOIN construction_projects p ON et.project_id = p.id
LEFT JOIN error_detections ed ON et.error_id = ed.id
WHERE et.status IN ('OPEN', 'IN_REVIEW')
ORDER BY et.priority DESC, et.created_at ASC;

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_construction_projects_updated_at BEFORE UPDATE ON construction_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_construction_plans_updated_at BEFORE UPDATE ON construction_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extracted_quantities_updated_at BEFORE UPDATE ON extracted_quantities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bills_of_quantities_updated_at BEFORE UPDATE ON bills_of_quantities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_boq_positions_updated_at BEFORE UPDATE ON boq_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tender_documents_updated_at BEFORE UPDATE ON tender_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contractor_bids_updated_at BEFORE UPDATE ON contractor_bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bid_evaluations_updated_at BEFORE UPDATE ON bid_evaluations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escalation_tickets_updated_at BEFORE UPDATE ON escalation_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- Insert example HOAI LP 6 requirements
INSERT INTO hoai_compliance_checks (project_id, hoai_phase, requirement_id, requirement_description, compliant, confidence, checked_by) VALUES
(NULL, 'LP6', '§43_Abs1', 'Aufstellen eines Vergabeterminplans', true, 1.0, 'system');

COMMENT ON TABLE construction_projects IS 'Core construction project data with HOAI phase tracking';
COMMENT ON TABLE construction_plans IS 'Individual construction plan documents with vision analysis results';
COMMENT ON TABLE plan_cross_references IS 'Relationships and cross-references between plans';
COMMENT ON TABLE extracted_quantities IS 'Quantities extracted from plans using AI vision';
COMMENT ON TABLE bills_of_quantities IS 'Generated Leistungsverzeichnis (BOQ) documents';
COMMENT ON TABLE boq_positions IS 'Individual positions within a Bill of Quantities';
COMMENT ON TABLE tender_documents IS 'Generated Ausschreibung documents';
COMMENT ON TABLE contractor_bids IS 'Submitted bids from contractors';
COMMENT ON TABLE bid_items IS 'Detailed pricing for each BOQ position in a bid';
COMMENT ON TABLE bid_evaluations IS 'Preisspiegel and bid evaluation results';
COMMENT ON TABLE error_detections IS 'Detected errors and inconsistencies in plans';
COMMENT ON TABLE escalation_tickets IS 'Human-in-loop escalation tickets for complex issues';
COMMENT ON TABLE construction_agent_performance IS 'Agent learning and performance metrics';
COMMENT ON TABLE hoai_compliance_checks IS 'HOAI regulation compliance validation records';
COMMENT ON TABLE construction_activity_log IS 'Comprehensive system activity audit trail';

-- =====================================================
-- GRANT PERMISSIONS (adjust as needed for your setup)
-- =====================================================

-- Grant to application user (replace 'construction_app' with your user)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO construction_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO construction_app;

SELECT 'Construction Syndicate database schemas created successfully!' as status;

