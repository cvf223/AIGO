-- 🏗️ CONSTRUCTION SYNDICATE DATABASE SCHEMA
-- ========================================
-- Production database schema for LP6 construction system
-- Handles materials, costs, specifications, and tracking

-- Create database (run as superuser)
-- CREATE DATABASE construction_syndicate;
-- \c construction_syndicate;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- MATERIALS AND SPECIFICATIONS
-- ==========================================

-- Material database with DIN/EN compliance
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    din_standard VARCHAR(50),
    en_standard VARCHAR(50),
    
    -- Physical properties
    density DECIMAL(10, 3), -- kg/m³
    thermal_conductivity DECIMAL(10, 4), -- W/(m·K)
    fire_rating VARCHAR(20),
    sound_insulation DECIMAL(5, 2), -- dB
    
    -- Environmental data
    embodied_carbon DECIMAL(10, 3), -- kg CO2/unit
    recyclable BOOLEAN DEFAULT false,
    epd_number VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT true
);

-- Material properties for different conditions
CREATE TABLE IF NOT EXISTS material_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    property_name VARCHAR(100),
    property_value DECIMAL(15, 6),
    unit VARCHAR(50),
    condition VARCHAR(255),
    temperature DECIMAL(5, 2), -- °C
    humidity DECIMAL(5, 2), -- %
    
    UNIQUE(material_id, property_name, condition)
);

-- Material suppliers and availability
CREATE TABLE IF NOT EXISTS material_suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    supplier_name VARCHAR(255),
    supplier_code VARCHAR(100),
    lead_time_days INTEGER,
    minimum_order_quantity DECIMAL(10, 2),
    unit VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- COST AND PRICING
-- ==========================================

-- Current market prices by region
CREATE TABLE IF NOT EXISTS current_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id),
    din276_code VARCHAR(10),
    region VARCHAR(100) NOT NULL,
    
    -- Pricing
    unit_price DECIMAL(12, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    material_cost DECIMAL(12, 2),
    labor_cost DECIMAL(12, 2),
    equipment_cost DECIMAL(12, 2),
    
    -- Metadata
    source VARCHAR(100), -- BKI, Baupreislexikon, STLB-Bau, etc.
    confidence DECIMAL(3, 2), -- 0.00 to 1.00
    valid_from DATE,
    valid_until DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_region_code (region, din276_code),
    INDEX idx_valid_date (valid_from, valid_until)
);

-- Historical price data for trends
CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES materials(id),
    din276_code VARCHAR(10),
    region VARCHAR(100),
    unit_price DECIMAL(12, 2),
    unit VARCHAR(50),
    recorded_date DATE,
    source VARCHAR(100),
    
    INDEX idx_history_date (recorded_date)
);

-- Market indices for adjustments
CREATE TABLE IF NOT EXISTS market_indices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50), -- construction, labor, materials, etc.
    region VARCHAR(100),
    index_value DECIMAL(6, 3), -- 1.000 = base
    date DATE,
    source VARCHAR(100),
    
    UNIQUE(type, region, date)
);

-- ==========================================
-- DIN 276 STRUCTURE
-- ==========================================

-- DIN 276 cost groups
CREATE TABLE IF NOT EXISTS din276_groups (
    code VARCHAR(10) PRIMARY KEY,
    parent_code VARCHAR(10),
    level INTEGER, -- 1, 2, 3, 4
    name_de VARCHAR(255),
    name_en VARCHAR(255),
    description TEXT,
    typical_unit VARCHAR(50),
    
    FOREIGN KEY (parent_code) REFERENCES din276_groups(code)
);

-- Element to DIN 276 mapping
CREATE TABLE IF NOT EXISTS element_din276_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    element_type VARCHAR(100),
    din276_primary VARCHAR(10) REFERENCES din276_groups(code),
    din276_secondary VARCHAR(10) REFERENCES din276_groups(code),
    confidence DECIMAL(3, 2),
    factors JSONB, -- Additional factors for mapping
    
    UNIQUE(element_type, din276_primary)
);

-- ==========================================
-- CONSTRUCTION ANALYSIS TRACKING
-- ==========================================

-- Project analysis results
CREATE TABLE IF NOT EXISTS construction_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_number VARCHAR(100) UNIQUE,
    project_name VARCHAR(255),
    client VARCHAR(255),
    location VARCHAR(255),
    region VARCHAR(100),
    building_type VARCHAR(100),
    floors INTEGER,
    gross_floor_area DECIMAL(10, 2),
    quality_level VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analyzed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending'
);

-- Analysis results per plan
CREATE TABLE IF NOT EXISTS plan_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES construction_projects(id),
    plan_name VARCHAR(255),
    plan_path TEXT,
    scale VARCHAR(20),
    
    -- Analysis metrics
    elements_detected INTEGER,
    elements_classified INTEGER,
    confidence_average DECIMAL(3, 2),
    processing_time_ms INTEGER,
    
    -- Tracking
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    analysis_version VARCHAR(50),
    
    INDEX idx_project_plan (project_id)
);

-- Detected elements with measurements
CREATE TABLE IF NOT EXISTS detected_elements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES plan_analysis_results(id),
    element_type VARCHAR(100),
    classification VARCHAR(100),
    confidence DECIMAL(3, 2),
    
    -- Measurements
    pixel_area INTEGER,
    real_area DECIMAL(12, 3), -- m²
    real_length DECIMAL(12, 3), -- m
    real_volume DECIMAL(12, 3), -- m³
    thickness DECIMAL(8, 3), -- mm
    
    -- Location on plan
    x_coordinate INTEGER,
    y_coordinate INTEGER,
    width INTEGER,
    height INTEGER,
    
    -- Tracking
    annotation_id VARCHAR(100),
    verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(100),
    verification_date TIMESTAMP,
    
    INDEX idx_element_type (element_type),
    INDEX idx_plan_elements (plan_id)
);

-- Measurement source tracking
CREATE TABLE IF NOT EXISTS measurement_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measurement_value DECIMAL(15, 3),
    unit VARCHAR(50),
    type VARCHAR(50),
    description TEXT,
    
    -- Source information
    source_type VARCHAR(50), -- plan_annotation, calculation, aggregation, etc.
    plan_ids TEXT[], -- Array of plan IDs
    annotation_ids TEXT[], -- Array of annotation IDs
    element_ids UUID[], -- Array of element IDs
    
    -- Calculation details
    calculation_method VARCHAR(100),
    pixel_area INTEGER,
    pixels_per_millimeter DECIMAL(10, 6),
    scale_factor DECIMAL(10, 6),
    calculation_steps JSONB,
    
    -- Validation
    confidence DECIMAL(3, 2),
    confidence_level VARCHAR(20),
    verified BOOLEAN DEFAULT false,
    verified_by VARCHAR(100),
    verification_date TIMESTAMP,
    
    -- Visual references
    plan_images JSONB,
    annotation_overlays JSONB,
    highlight_regions JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tracking_confidence (confidence),
    INDEX idx_tracking_verified (verified)
);

-- Aggregation tracking
CREATE TABLE IF NOT EXISTS aggregation_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_value DECIMAL(15, 3),
    unit VARCHAR(50),
    operation VARCHAR(50), -- sum, average, etc.
    
    -- Source measurements
    source_measurement_ids UUID[],
    formula TEXT,
    calculation_steps JSONB,
    adjustments JSONB,
    
    confidence DECIMAL(3, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- AUSSCHREIBUNG GENERATION
-- ==========================================

-- Generated tender positions
CREATE TABLE IF NOT EXISTS tender_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES construction_projects(id),
    position_number VARCHAR(50),
    din276_code VARCHAR(10),
    
    -- Texts
    short_text VARCHAR(500),
    long_text TEXT,
    specifications TEXT[],
    
    -- Quantities
    quantity DECIMAL(15, 3),
    unit VARCHAR(50),
    measurement_type VARCHAR(50),
    
    -- Source tracking
    source_plan_ids TEXT[],
    source_annotation_ids TEXT[],
    source_element_ids UUID[],
    tracking_id UUID REFERENCES measurement_tracking(id),
    
    -- Pricing
    unit_price DECIMAL(12, 2),
    total_price DECIMAL(15, 2),
    
    -- Metadata
    confidence DECIMAL(3, 2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_tender_project (project_id),
    INDEX idx_tender_din276 (din276_code)
);

-- ==========================================
-- QUALITY AND COMPLIANCE
-- ==========================================

-- HOAI LP6 compliance checklist
CREATE TABLE IF NOT EXISTS hoai_compliance_checklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES construction_projects(id),
    requirement VARCHAR(500),
    category VARCHAR(100),
    status VARCHAR(50), -- pending, completed, not_applicable
    checked_by VARCHAR(100),
    checked_date TIMESTAMP,
    notes TEXT,
    
    INDEX idx_compliance_project (project_id)
);

-- Manual corrections and overrides
CREATE TABLE IF NOT EXISTS manual_corrections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    measurement_id UUID REFERENCES measurement_tracking(id),
    original_value DECIMAL(15, 3),
    corrected_value DECIMAL(15, 3),
    reason TEXT,
    corrected_by VARCHAR(100),
    correction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    documentation JSONB
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_active ON materials(active);
CREATE INDEX IF NOT EXISTS idx_current_prices_material ON current_prices(material_id);
CREATE INDEX IF NOT EXISTS idx_detected_confidence ON detected_elements(confidence);
CREATE INDEX IF NOT EXISTS idx_plan_results_project ON plan_analysis_results(project_id);

-- ==========================================
-- INITIAL DATA LOAD
-- ==========================================

-- Insert DIN 276 main groups
INSERT INTO din276_groups (code, parent_code, level, name_de, name_en, typical_unit) VALUES
    ('100', NULL, 1, 'Grundstück', 'Plot', 'm²'),
    ('200', NULL, 1, 'Herrichten und Erschließen', 'Site preparation', 'm²'),
    ('300', NULL, 1, 'Bauwerk - Baukonstruktionen', 'Building construction', NULL),
    ('310', '300', 2, 'Baugrube / Erdbau', 'Excavation', 'm³'),
    ('320', '300', 2, 'Gründung, Unterbau', 'Foundation', 'm³'),
    ('330', '300', 2, 'Außenwände', 'External walls', 'm²'),
    ('340', '300', 2, 'Innenwände', 'Internal walls', 'm²'),
    ('350', '300', 2, 'Decken', 'Floors/ceilings', 'm²'),
    ('360', '300', 2, 'Dächer', 'Roofs', 'm²'),
    ('370', '300', 2, 'Baukonstruktive Einbauten', 'Built-in construction', 'Stk'),
    ('400', NULL, 1, 'Bauwerk - Technische Anlagen', 'Technical installations', NULL),
    ('410', '400', 2, 'Abwasser-, Wasser-, Gasanlagen', 'Plumbing', 'm'),
    ('420', '400', 2, 'Wärmeversorgungsanlagen', 'Heating', 'kW'),
    ('430', '400', 2, 'Raumlufttechnische Anlagen', 'Ventilation', 'm²'),
    ('440', '400', 2, 'Elektrische Anlagen', 'Electrical', 'm²'),
    ('500', NULL, 1, 'Außenanlagen', 'External works', 'm²'),
    ('600', NULL, 1, 'Ausstattung', 'Furnishing', 'Stk'),
    ('700', NULL, 1, 'Baunebenkosten', 'Additional costs', '%')
ON CONFLICT (code) DO NOTHING;

-- Insert common materials
INSERT INTO materials (material_code, name, category, din_standard, density, thermal_conductivity) VALUES
    ('C25/30', 'Beton C25/30', 'concrete', 'DIN EN 206', 2400, 2.1),
    ('C30/37', 'Beton C30/37', 'concrete', 'DIN EN 206', 2400, 2.1),
    ('KS-12', 'Kalksandstein 12DF', 'masonry', 'DIN V 106', 1800, 0.79),
    ('KS-20', 'Kalksandstein 20DF', 'masonry', 'DIN V 106', 2000, 0.99),
    ('MW-035', 'Mineralwolle 035', 'insulation', 'DIN EN 13162', 30, 0.035),
    ('MW-040', 'Mineralwolle 040', 'insulation', 'DIN EN 13162', 20, 0.040),
    ('GK-12.5', 'Gipskartonplatte 12,5mm', 'drywall', 'DIN EN 520', 900, 0.25),
    ('GK-15', 'Gipskartonplatte 15mm', 'drywall', 'DIN EN 520', 900, 0.25)
ON CONFLICT (material_code) DO NOTHING;

-- Insert regional factors for major German cities
INSERT INTO market_indices (type, region, index_value, date, source) VALUES
    ('construction', 'münchen', 1.25, CURRENT_DATE, 'BKI'),
    ('construction', 'frankfurt', 1.20, CURRENT_DATE, 'BKI'),
    ('construction', 'stuttgart', 1.15, CURRENT_DATE, 'BKI'),
    ('construction', 'hamburg', 1.15, CURRENT_DATE, 'BKI'),
    ('construction', 'düsseldorf', 1.10, CURRENT_DATE, 'BKI'),
    ('construction', 'köln', 1.10, CURRENT_DATE, 'BKI'),
    ('construction', 'berlin', 1.05, CURRENT_DATE, 'BKI'),
    ('construction', 'hannover', 1.00, CURRENT_DATE, 'BKI'),
    ('construction', 'leipzig', 0.90, CURRENT_DATE, 'BKI'),
    ('construction', 'dresden', 0.90, CURRENT_DATE, 'BKI')
ON CONFLICT (type, region, date) DO NOTHING;

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to relevant tables
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_current_prices_updated_at BEFORE UPDATE ON current_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate average confidence for a project
CREATE OR REPLACE FUNCTION calculate_project_confidence(p_project_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    avg_confidence DECIMAL;
BEGIN
    SELECT AVG(confidence) INTO avg_confidence
    FROM detected_elements de
    JOIN plan_analysis_results par ON de.plan_id = par.id
    WHERE par.project_id = p_project_id;
    
    RETURN COALESCE(avg_confidence, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get regional price with fallback
CREATE OR REPLACE FUNCTION get_regional_price(
    p_din276_code VARCHAR,
    p_region VARCHAR,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    unit_price DECIMAL,
    unit VARCHAR,
    confidence DECIMAL,
    source VARCHAR
) AS $$
BEGIN
    -- First try exact region and code
    RETURN QUERY
    SELECT cp.unit_price, cp.unit, cp.confidence, cp.source
    FROM current_prices cp
    WHERE cp.din276_code = p_din276_code
        AND cp.region = p_region
        AND p_date BETWEEN cp.valid_from AND cp.valid_until
    ORDER BY cp.last_updated DESC
    LIMIT 1;
    
    -- If no result, try default region
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT cp.unit_price, cp.unit, cp.confidence, cp.source
        FROM current_prices cp
        WHERE cp.din276_code = p_din276_code
            AND cp.region = 'default'
            AND p_date BETWEEN cp.valid_from AND cp.valid_until
        ORDER BY cp.last_updated DESC
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- PERMISSIONS
-- ==========================================

-- Create application user (adjust as needed)
-- CREATE USER construction_app WITH PASSWORD 'secure_password';
-- GRANT CONNECT ON DATABASE construction_syndicate TO construction_app;
-- GRANT USAGE ON SCHEMA public TO construction_app;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO construction_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO construction_app;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check database setup
/*
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
*/
