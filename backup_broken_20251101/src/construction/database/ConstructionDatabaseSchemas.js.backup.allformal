/**
 * 🗄️🏗️ CONSTRUCTION DATABASE SCHEMAS - TOP 1% EXPERT IMPLEMENTATION
 * ==================================================================
 * 
 * Comprehensive database schemas for all construction syndicate data including
 * projects, plans, errors, quantities, compliance, and learning patterns.
 * 
 * SCHEMA CATEGORIES:
 * - Project Management (projects, phases, teams)
 * - Plan Analysis (plans, sheets, elements, cross_references)
 * - Error Detection (errors, solutions, escalations, resolutions)
 * - Quantity Management (quantities, materials, calculations)
 * - HOAI Compliance (compliance_checks, requirements, validations)
 * - Learning & Patterns (error_patterns, solution_patterns, agent_learning)
 * - Human Interaction (escalation_tickets, human_feedback, preferences)
 * - Performance Metrics (agent_performance, system_metrics, accuracy_tracking)
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0 - Production Database Design
 */

/**
 * 🗄️ CONSTRUCTION DATABASE SCHEMAS
 */
export class ConstructionDatabaseSchemas {
    /**
     * 📋 PROJECT MANAGEMENT SCHEMAS
     */
    static PROJECT_SCHEMAS = {
        // Main projects table
        construction_projects: `
            CREATE TABLE IF NOT EXISTS construction_projects (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(500) NOT NULL,
                description TEXT,
                client_name VARCHAR(500),
                project_type VARCHAR(100), -- residential, commercial, industrial, etc.
                total_area_sqm DECIMAL(10,2),
                estimated_cost DECIMAL(15,2),
                currency VARCHAR(3) DEFAULT 'EUR',
                start_date DATE,
                end_date DATE,
                current_phase VARCHAR(10), -- LP1-LP9
                status VARCHAR(50) DEFAULT 'active', -- active, completed, on_hold, cancelled
                location JSONB, -- {address, city, state, country, coordinates}
                metadata JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_projects_status ON construction_projects(status);
            CREATE INDEX IF NOT EXISTS idx_projects_phase ON construction_projects(current_phase);
            CREATE INDEX IF NOT EXISTS idx_projects_dates ON construction_projects(start_date, end_date);
        `,
        
        // Project phases tracking
        project_phases: `
            CREATE TABLE IF NOT EXISTS project_phases (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                phase VARCHAR(10) NOT NULL, -- LP1-LP9
                phase_name VARCHAR(100),
                start_date DATE,
                end_date DATE,
                completion_percentage DECIMAL(5,2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                responsible_team VARCHAR(200),
                deliverables JSONB, -- [{name, status, file_path}]
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(project_id, phase)
            );
            CREATE INDEX IF NOT EXISTS idx_phases_project ON project_phases(project_id);
            CREATE INDEX IF NOT EXISTS idx_phases_status ON project_phases(status);
        `,
        
        // Project team members
        project_teams: `
            CREATE TABLE IF NOT EXISTS project_teams (
                id SERIAL PRIMARY KEY,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                agent_id VARCHAR(100) NOT NULL,
                agent_type VARCHAR(100), -- architect, quantity_surveyor, error_detector, etc.
                specialization VARCHAR(200),
                role VARCHAR(100),
                responsibilities TEXT[],
                performance_score DECIMAL(3,2) DEFAULT 0,
                active BOOLEAN DEFAULT true,
                joined_at TIMESTAMPTZ DEFAULT NOW(),
                left_at TIMESTAMPTZ
            );
            CREATE INDEX IF NOT EXISTS idx_teams_project ON project_teams(project_id);
            CREATE INDEX IF NOT EXISTS idx_teams_agent ON project_teams(agent_id);
        `
    };
    
    /**
     * 📐 PLAN ANALYSIS SCHEMAS
     */
    static PLAN_SCHEMAS = {
        // Construction plans
        construction_plans: `
            CREATE TABLE IF NOT EXISTS construction_plans (
                id SERIAL PRIMARY KEY,
                plan_id VARCHAR(100) UNIQUE NOT NULL,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                plan_type VARCHAR(100), -- floor_plan, elevation, section, detail, etc.
                plan_name VARCHAR(500),
                file_path TEXT,
                file_hash VARCHAR(64), -- SHA-256 hash for integrity
                scale VARCHAR(20), -- 1:50, 1:100, etc.
                revision VARCHAR(20),
                discipline VARCHAR(100), -- architectural, structural, mep, etc.
                drawing_number VARCHAR(100),
                sheet_size VARCHAR(10), -- A0, A1, A2, etc.
                created_by VARCHAR(200),
                created_date DATE,
                uploaded_at TIMESTAMPTZ DEFAULT NOW(),
                analyzed_at TIMESTAMPTZ,
                analysis_status VARCHAR(50) DEFAULT 'pending',
                vision_features JSONB, -- Extracted visual features
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_plans_project ON construction_plans(project_id);
            CREATE INDEX IF NOT EXISTS idx_plans_type ON construction_plans(plan_type);
            CREATE INDEX IF NOT EXISTS idx_plans_status ON construction_plans(analysis_status);
        `,
        
        // Plan elements detected
        plan_elements: `
            CREATE TABLE IF NOT EXISTS plan_elements (
                id SERIAL PRIMARY KEY,
                element_id VARCHAR(100) UNIQUE NOT NULL,
                plan_id VARCHAR(100) REFERENCES construction_plans(plan_id) ON DELETE CASCADE,
                element_type VARCHAR(100), -- wall, door, window, column, etc.
                element_name VARCHAR(200),
                geometry JSONB, -- Coordinates, dimensions, shape
                material VARCHAR(200),
                properties JSONB, -- Additional properties
                confidence_score DECIMAL(3,2),
                bounding_box JSONB, -- {x, y, width, height}
                detected_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_elements_plan ON plan_elements(plan_id);
            CREATE INDEX IF NOT EXISTS idx_elements_type ON plan_elements(element_type);
        `,
        
        // Cross-references between plans
        plan_cross_references: `
            CREATE TABLE IF NOT EXISTS plan_cross_references (
                id SERIAL PRIMARY KEY,
                source_plan_id VARCHAR(100) REFERENCES construction_plans(plan_id) ON DELETE CASCADE,
                target_plan_id VARCHAR(100) REFERENCES construction_plans(plan_id) ON DELETE CASCADE,
                reference_type VARCHAR(100), -- detail_callout, section_marker, elevation_marker, etc.
                source_location JSONB, -- {x, y} on source plan
                target_location JSONB, -- {x, y} on target plan
                reference_text VARCHAR(200),
                validated BOOLEAN DEFAULT false,
                confidence_score DECIMAL(3,2),
                detected_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(source_plan_id, target_plan_id, reference_type, source_location)
            );
            CREATE INDEX IF NOT EXISTS idx_xref_source ON plan_cross_references(source_plan_id);
            CREATE INDEX IF NOT EXISTS idx_xref_target ON plan_cross_references(target_plan_id);
        `
    };
    
    /**
     * 🚨 ERROR DETECTION SCHEMAS
     */
    static ERROR_SCHEMAS = {
        // Detected errors
        construction_errors: `
            CREATE TABLE IF NOT EXISTS construction_errors (
                id SERIAL PRIMARY KEY,
                error_id VARCHAR(100) UNIQUE NOT NULL,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                error_type VARCHAR(100), -- dimension_conflict, missing_detail, quantity_mismatch, etc.
                severity VARCHAR(20), -- critical, high, medium, low, info
                category VARCHAR(100),
                description TEXT,
                location JSONB, -- {plan_id, coordinates, element_ids}
                detected_by VARCHAR(100), -- agent_id
                detection_confidence DECIMAL(3,2),
                impact_assessment JSONB, -- {cost, schedule, quality, safety}
                related_elements TEXT[], -- element_ids
                status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, escalated, ignored
                detected_at TIMESTAMPTZ DEFAULT NOW(),
                resolved_at TIMESTAMPTZ,
                resolution_time_hours DECIMAL(10,2),
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_errors_project ON construction_errors(project_id);
            CREATE INDEX IF NOT EXISTS idx_errors_type ON construction_errors(error_type);
            CREATE INDEX IF NOT EXISTS idx_errors_severity ON construction_errors(severity);
            CREATE INDEX IF NOT EXISTS idx_errors_status ON construction_errors(status);
            CREATE INDEX IF NOT EXISTS idx_errors_detected ON construction_errors(detected_at);
        `,
        
        // Error solutions
        error_solutions: `
            CREATE TABLE IF NOT EXISTS error_solutions (
                id SERIAL PRIMARY KEY,
                solution_id VARCHAR(100) UNIQUE NOT NULL,
                error_id VARCHAR(100) REFERENCES construction_errors(error_id) ON DELETE CASCADE,
                solution_type VARCHAR(100), -- logical, creative, historical, regulatory, etc.
                strategy VARCHAR(100),
                description TEXT,
                implementation_steps JSONB, -- [{action, description}]
                estimated_time_hours DECIMAL(10,2),
                estimated_cost DECIMAL(15,2),
                confidence_score DECIMAL(3,2),
                feasibility_score DECIMAL(3,2),
                risk_score DECIMAL(3,2),
                pros TEXT[],
                cons TEXT[],
                generated_by VARCHAR(100), -- agent_id or 'human'
                selected BOOLEAN DEFAULT false,
                success_probability DECIMAL(3,2),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_solutions_error ON error_solutions(error_id);
            CREATE INDEX IF NOT EXISTS idx_solutions_selected ON error_solutions(selected);
            CREATE INDEX IF NOT EXISTS idx_solutions_confidence ON error_solutions(confidence_score DESC);
        `,
        
        // Error patterns for learning
        error_patterns: `
            CREATE TABLE IF NOT EXISTS error_patterns (
                id SERIAL PRIMARY KEY,
                pattern_id VARCHAR(100) UNIQUE NOT NULL,
                pattern_name VARCHAR(200),
                error_type VARCHAR(100),
                pattern_signature JSONB, -- Pattern matching criteria
                occurrence_count INTEGER DEFAULT 1,
                first_seen TIMESTAMPTZ DEFAULT NOW(),
                last_seen TIMESTAMPTZ DEFAULT NOW(),
                average_resolution_time DECIMAL(10,2),
                successful_solution_types TEXT[],
                tags TEXT[],
                active BOOLEAN DEFAULT true
            );
            CREATE INDEX IF NOT EXISTS idx_patterns_type ON error_patterns(error_type);
            CREATE INDEX IF NOT EXISTS idx_patterns_count ON error_patterns(occurrence_count DESC);
        `
    };
    
    /**
     * 📊 QUANTITY MANAGEMENT SCHEMAS
     */
    static QUANTITY_SCHEMAS = {
        // Extracted quantities
        construction_quantities: `
            CREATE TABLE IF NOT EXISTS construction_quantities (
                id SERIAL PRIMARY KEY,
                quantity_id VARCHAR(100) UNIQUE NOT NULL,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                element_type VARCHAR(100),
                material VARCHAR(200),
                description TEXT,
                quantity DECIMAL(15,3),
                unit VARCHAR(20), -- m, m², m³, kg, pcs, etc.
                source_plans TEXT[], -- plan_ids
                calculation_method VARCHAR(100),
                confidence_score DECIMAL(3,2),
                verified BOOLEAN DEFAULT false,
                verification_method VARCHAR(100),
                extracted_by VARCHAR(100), -- agent_id
                extracted_at TIMESTAMPTZ DEFAULT NOW(),
                verified_at TIMESTAMPTZ,
                cost_per_unit DECIMAL(15,2),
                total_cost DECIMAL(15,2),
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_quantities_project ON construction_quantities(project_id);
            CREATE INDEX IF NOT EXISTS idx_quantities_element ON construction_quantities(element_type);
            CREATE INDEX IF NOT EXISTS idx_quantities_material ON construction_quantities(material);
        `,
        
        // Quantity calculations audit trail
        quantity_calculations: `
            CREATE TABLE IF NOT EXISTS quantity_calculations (
                id SERIAL PRIMARY KEY,
                calculation_id VARCHAR(100) UNIQUE NOT NULL,
                quantity_id VARCHAR(100) REFERENCES construction_quantities(quantity_id) ON DELETE CASCADE,
                calculation_type VARCHAR(100),
                formula TEXT,
                input_values JSONB,
                intermediate_results JSONB,
                final_result DECIMAL(15,3),
                unit VARCHAR(20),
                calculation_steps JSONB,
                performed_by VARCHAR(100),
                performed_at TIMESTAMPTZ DEFAULT NOW(),
                verification_status VARCHAR(50) DEFAULT 'pending'
            );
            CREATE INDEX IF NOT EXISTS idx_calculations_quantity ON quantity_calculations(quantity_id);
        `,
        
        // Bill of Quantities
        bill_of_quantities: `
            CREATE TABLE IF NOT EXISTS bill_of_quantities (
                id SERIAL PRIMARY KEY,
                boq_id VARCHAR(100) UNIQUE NOT NULL,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                phase VARCHAR(10), -- HOAI phase
                version INTEGER DEFAULT 1,
                status VARCHAR(50) DEFAULT 'draft',
                total_items INTEGER,
                subtotal DECIMAL(15,2),
                tax_rate DECIMAL(5,2),
                tax_amount DECIMAL(15,2),
                total_amount DECIMAL(15,2),
                currency VARCHAR(3) DEFAULT 'EUR',
                created_by VARCHAR(100),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                approved_by VARCHAR(100),
                approved_at TIMESTAMPTZ,
                exported_formats TEXT[], -- PDF, GAEB, Excel, etc.
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_boq_project ON bill_of_quantities(project_id);
            CREATE INDEX IF NOT EXISTS idx_boq_status ON bill_of_quantities(status);
        `
    };
    
    /**
     * ✅ COMPLIANCE SCHEMAS
     */
    static COMPLIANCE_SCHEMAS = {
        // HOAI compliance checks
        hoai_compliance_checks: `
            CREATE TABLE IF NOT EXISTS hoai_compliance_checks (
                id SERIAL PRIMARY KEY,
                check_id VARCHAR(100) UNIQUE NOT NULL,
                project_id VARCHAR(100) REFERENCES construction_projects(project_id) ON DELETE CASCADE,
                phase VARCHAR(10), -- LP1-LP9
                requirement_type VARCHAR(200),
                requirement_description TEXT,
                check_result VARCHAR(50), -- passed, failed, warning, not_applicable
                compliance_score DECIMAL(3,2),
                issues_found JSONB, -- [{type, description, severity}]
                recommendations TEXT[],
                checked_by VARCHAR(100),
                checked_at TIMESTAMPTZ DEFAULT NOW(),
                evidence_documents TEXT[],
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_compliance_project ON hoai_compliance_checks(project_id);
            CREATE INDEX IF NOT EXISTS idx_compliance_phase ON hoai_compliance_checks(phase);
            CREATE INDEX IF NOT EXISTS idx_compliance_result ON hoai_compliance_checks(check_result);
        `,
        
        // Regulatory requirements tracking
        regulatory_requirements: `
            CREATE TABLE IF NOT EXISTS regulatory_requirements (
                id SERIAL PRIMARY KEY,
                requirement_id VARCHAR(100) UNIQUE NOT NULL,
                regulation VARCHAR(100), -- HOAI, DIN, VOB, etc.
                section VARCHAR(100),
                phase VARCHAR(10),
                requirement_text TEXT,
                category VARCHAR(100),
                mandatory BOOLEAN DEFAULT true,
                validation_rules JSONB,
                active BOOLEAN DEFAULT true,
                effective_date DATE,
                expiry_date DATE
            );
            CREATE INDEX IF NOT EXISTS idx_requirements_regulation ON regulatory_requirements(regulation);
            CREATE INDEX IF NOT EXISTS idx_requirements_phase ON regulatory_requirements(phase);
        `
    };
    
    /**
     * 👤 HUMAN INTERACTION SCHEMAS
     */
    static HUMAN_SCHEMAS = {
        // Escalation tickets
        escalation_tickets: `
            CREATE TABLE IF NOT EXISTS escalation_tickets (
                id SERIAL PRIMARY KEY,
                ticket_id VARCHAR(100) UNIQUE NOT NULL,
                escalation_id VARCHAR(100) UNIQUE NOT NULL,
                error_id VARCHAR(100) REFERENCES construction_errors(error_id) ON DELETE CASCADE,
                priority INTEGER, -- 1-5, 1 being highest
                title VARCHAR(500),
                description TEXT,
                severity VARCHAR(20),
                proposed_solutions JSONB, -- Array of solution objects
                status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, cancelled
                assigned_to VARCHAR(200), -- human expert
                notification_channels TEXT[], -- web, email, telegram
                created_at TIMESTAMPTZ DEFAULT NOW(),
                acknowledged_at TIMESTAMPTZ,
                resolved_at TIMESTAMPTZ,
                response_deadline TIMESTAMPTZ,
                response_time_minutes INTEGER,
                resolution_notes TEXT,
                selected_solution_id VARCHAR(100),
                custom_solution JSONB,
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_tickets_status ON escalation_tickets(status);
            CREATE INDEX IF NOT EXISTS idx_tickets_priority ON escalation_tickets(priority);
            CREATE INDEX IF NOT EXISTS idx_tickets_deadline ON escalation_tickets(response_deadline);
        `,
        
        // Human feedback and preferences
        human_feedback: `
            CREATE TABLE IF NOT EXISTS human_feedback (
                id SERIAL PRIMARY KEY,
                feedback_id VARCHAR(100) UNIQUE NOT NULL,
                ticket_id VARCHAR(100) REFERENCES escalation_tickets(ticket_id) ON DELETE CASCADE,
                error_type VARCHAR(100),
                selected_solution_type VARCHAR(100),
                solution_effectiveness VARCHAR(50), -- very_effective, effective, neutral, ineffective
                time_to_implement DECIMAL(10,2),
                actual_cost DECIMAL(15,2),
                feedback_text TEXT,
                lessons_learned TEXT,
                prefer_solution_types TEXT[],
                avoid_solution_types TEXT[],
                provided_by VARCHAR(200),
                provided_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_feedback_ticket ON human_feedback(ticket_id);
            CREATE INDEX IF NOT EXISTS idx_feedback_effectiveness ON human_feedback(solution_effectiveness);
        `
    };
    
    /**
     * 🎓 LEARNING SCHEMAS
     */
    static LEARNING_SCHEMAS = {
        // Agent learning progress
        agent_learning_progress: `
            CREATE TABLE IF NOT EXISTS agent_learning_progress (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(100) NOT NULL,
                learning_domain VARCHAR(100), -- error_detection, quantity_extraction, compliance, etc.
                metric_name VARCHAR(100),
                metric_value DECIMAL(10,4),
                improvement_rate DECIMAL(10,4),
                training_iterations INTEGER DEFAULT 0,
                last_training TIMESTAMPTZ,
                performance_trend VARCHAR(20), -- improving, stable, declining
                recorded_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_learning_agent ON agent_learning_progress(agent_id);
            CREATE INDEX IF NOT EXISTS idx_learning_domain ON agent_learning_progress(learning_domain);
            CREATE INDEX IF NOT EXISTS idx_learning_time ON agent_learning_progress(recorded_at DESC);
        `,
        
        // Solution pattern success rates
        solution_patterns: `
            CREATE TABLE IF NOT EXISTS solution_patterns (
                id SERIAL PRIMARY KEY,
                pattern_id VARCHAR(100) UNIQUE NOT NULL,
                error_type VARCHAR(100),
                solution_type VARCHAR(100),
                context_signature JSONB,
                usage_count INTEGER DEFAULT 0,
                success_count INTEGER DEFAULT 0,
                success_rate DECIMAL(3,2),
                average_confidence DECIMAL(3,2),
                average_implementation_time DECIMAL(10,2),
                tags TEXT[],
                created_at TIMESTAMPTZ DEFAULT NOW(),
                last_used TIMESTAMPTZ
            );
            CREATE INDEX IF NOT EXISTS idx_solution_patterns_error ON solution_patterns(error_type);
            CREATE INDEX IF NOT EXISTS idx_solution_patterns_success ON solution_patterns(success_rate DESC);
        `
    };
    
    /**
     * 📈 METRICS SCHEMAS
     */
    static METRICS_SCHEMAS = {
        // System performance metrics
        system_performance_metrics: `
            CREATE TABLE IF NOT EXISTS system_performance_metrics (
                id SERIAL PRIMARY KEY,
                metric_type VARCHAR(100), -- error_detection, quantity_accuracy, compliance_rate, etc.
                metric_value DECIMAL(10,4),
                project_id VARCHAR(100),
                agent_id VARCHAR(100),
                time_period VARCHAR(20), -- hourly, daily, weekly, monthly
                recorded_at TIMESTAMPTZ DEFAULT NOW(),
                metadata JSONB
            );
            CREATE INDEX IF NOT EXISTS idx_metrics_type ON system_performance_metrics(metric_type);
            CREATE INDEX IF NOT EXISTS idx_metrics_time ON system_performance_metrics(recorded_at DESC);
            CREATE INDEX IF NOT EXISTS idx_metrics_project ON system_performance_metrics(project_id);
        `,
        
        // Agent performance tracking
        agent_performance: `
            CREATE TABLE IF NOT EXISTS agent_performance (
                id SERIAL PRIMARY KEY,
                agent_id VARCHAR(100) NOT NULL,
                project_id VARCHAR(100),
                task_type VARCHAR(100),
                tasks_completed INTEGER DEFAULT 0,
                tasks_failed INTEGER DEFAULT 0,
                average_confidence DECIMAL(3,2),
                average_time_seconds DECIMAL(10,2),
                accuracy_rate DECIMAL(3,2),
                escalation_rate DECIMAL(3,2),
                collaboration_score DECIMAL(3,2),
                period_start TIMESTAMPTZ,
                period_end TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_agent_perf_agent ON agent_performance(agent_id);
            CREATE INDEX IF NOT EXISTS idx_agent_perf_project ON agent_performance(project_id);
            CREATE INDEX IF NOT EXISTS idx_agent_perf_period ON agent_performance(period_start, period_end);
        `
    };
    
    /**
     * 🏗️ CREATE ALL SCHEMAS
     */
    static async createAllSchemas(db) {
        console.log('🏗️ Creating all construction database schemas...');
        
        const allSchemas = [
            ...Object.values(this.PROJECT_SCHEMAS),
            ...Object.values(this.PLAN_SCHEMAS),
            ...Object.values(this.ERROR_SCHEMAS),
            ...Object.values(this.QUANTITY_SCHEMAS),
            ...Object.values(this.COMPLIANCE_SCHEMAS),
            ...Object.values(this.HUMAN_SCHEMAS),
            ...Object.values(this.LEARNING_SCHEMAS),
            ...Object.values(this.METRICS_SCHEMAS)
        ];
        
        try {
            for (const schema of allSchemas) {
                await db.query(schema);
            }
            
            console.log('✅ All construction database schemas created successfully');
            return { success: true, schemasCreated: allSchemas.length };
            
        } catch (error) {
            console.error('❌ Failed to create database schemas:', error);
            throw error;
        }
    }
    
    /**
     * 🔍 VERIFY SCHEMAS
     */
    static async verifySchemas(db) {
        console.log('🔍 Verifying construction database schemas...');
        
        const tables = [
            'construction_projects', 'project_phases', 'project_teams',
            'construction_plans', 'plan_elements', 'plan_cross_references',
            'construction_errors', 'error_solutions', 'error_patterns',
            'construction_quantities', 'quantity_calculations', 'bill_of_quantities',
            'hoai_compliance_checks', 'regulatory_requirements',
            'escalation_tickets', 'human_feedback',
            'agent_learning_progress', 'solution_patterns',
            'system_performance_metrics', 'agent_performance'
        ];
        
        const missing = [];
        
        try {
            for (const table of tables) {
                const result = await db.query(`
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = $1
                    );
                `, [table]);
                
                if (!result.rows[0].exists) {
                    missing.push(table);
                }
            }
            
            if (missing.length > 0) {
                console.warn(`⚠️ Missing tables: ${missing.join(', ')}`);
                return { verified: false, missing };
            }
            
            console.log('✅ All construction database schemas verified');
            return { verified: true, missing: [] };
            
        } catch (error) {
            console.error('❌ Failed to verify schemas:', error);
            throw error;
        }
    }
    
    /**
     * 📊 GET SCHEMA STATISTICS
     */
    static async getSchemaStatistics(db) {
        console.log('📊 Getting construction database statistics...');
        
        const stats = {};
        
        const tables = [
            { name: 'construction_projects', key: 'projects' },
            { name: 'construction_plans', key: 'plans' },
            { name: 'construction_errors', key: 'errors' },
            { name: 'construction_quantities', key: 'quantities' },
            { name: 'escalation_tickets', key: 'escalations' },
            { name: 'agent_learning_progress', key: 'learning_records' }
        ];
        
        try {
            for (const { name, key } of tables) {
                const result = await db.query(`SELECT COUNT(*) FROM ${name};`);
                stats[key] = parseInt(result.rows[0].count);
            }
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get schema statistics:', error);
            return {};
        }
    }
}

// Export
export default ConstructionDatabaseSchemas;
