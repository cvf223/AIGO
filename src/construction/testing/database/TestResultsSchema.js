/**
 * 🗄️ TEST RESULTS DATABASE SCHEMA
 * =================================
 * 
 * Database tables for storing test execution results and real plan analyses
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

export const TestResultsSchema = {
    /**
     * 🧪 CREATE ALL TABLES
     */
    async createAllTables(dbPool) {
        console.log('🗄️ Creating test results database tables...');
        
        const client = await dbPool.connect();
        
        try {
            // Test executions table
            await client.query(`
                CREATE TABLE IF NOT EXISTS test_executions (
                    id SERIAL PRIMARY KEY,
                    test_suite VARCHAR(100),
                    mode VARCHAR(20), -- 'synthetic' | 'real' | 'mixed'
                    total_tests INTEGER,
                    passed INTEGER,
                    failed INTEGER,
                    duration_ms INTEGER,
                    results JSONB,
                    executed_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_test_executions_suite 
                ON test_executions(test_suite, executed_at DESC);
            `);
            console.log('   ✅ test_executions table created');
            
            // Real plan analyses table
            await client.query(`
                CREATE TABLE IF NOT EXISTS real_plan_analyses (
                    id SERIAL PRIMARY KEY,
                    analysis_id VARCHAR(200) UNIQUE,
                    project_id VARCHAR(100),
                    plan_id VARCHAR(200),
                    pdf_path TEXT,
                    analysis_type VARCHAR(50), -- 'vision' | 'quantity' | 'error' | 'compliance' | 'complete'
                    results JSONB,
                    duration_ms INTEGER,
                    accuracy DECIMAL,
                    analyzed_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_real_plan_analyses_project
                ON real_plan_analyses(project_id, analyzed_at DESC);
                
                CREATE INDEX IF NOT EXISTS idx_real_plan_analyses_type
                ON real_plan_analyses(analysis_type, analyzed_at DESC);
            `);
            console.log('   ✅ real_plan_analyses table created');
            
            // LP6 generated documents table
            await client.query(`
                CREATE TABLE IF NOT EXISTS lp6_generated_documents (
                    id SERIAL PRIMARY KEY,
                    project_id VARCHAR(100),
                    analysis_id VARCHAR(200),
                    document_type VARCHAR(50), -- 'leistungsverzeichnis' | 'massenermittlung'
                    content JSONB,
                    format VARCHAR(20), -- 'GAEB' | 'JSON' | 'PDF'
                    total_items INTEGER,
                    total_cost DECIMAL,
                    generated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_lp6_documents_project
                ON lp6_generated_documents(project_id, generated_at DESC);
            `);
            console.log('   ✅ lp6_generated_documents table created');
            
            // Uploaded plans table
            await client.query(`
                CREATE TABLE IF NOT EXISTS uploaded_plans (
                    id SERIAL PRIMARY KEY,
                    plan_id VARCHAR(200) UNIQUE,
                    filename VARCHAR(500),
                    filepath TEXT,
                    project_id VARCHAR(100),
                    plan_type VARCHAR(50),
                    floor VARCHAR(50),
                    scale VARCHAR(20),
                    revision VARCHAR(10),
                    plan_date DATE,
                    metadata JSONB,
                    file_size BIGINT,
                    uploaded_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_uploaded_plans_project
                ON uploaded_plans(project_id, uploaded_at DESC);
            `);
            console.log('   ✅ uploaded_plans table created');
            
            // Annotated plans table
            await client.query(`
                CREATE TABLE IF NOT EXISTS annotated_plans (
                    id SERIAL PRIMARY KEY,
                    plan_id VARCHAR(200),
                    analysis_id VARCHAR(200),
                    template VARCHAR(50), -- 'monitoring' | 'investor' | 'detailed'
                    annotation_layers JSONB,
                    annotated_image_path TEXT,
                    export_formats JSONB,
                    annotation_stats JSONB,
                    created_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_annotated_plans_analysis
                ON annotated_plans(analysis_id, created_at DESC);
            `);
            console.log('   ✅ annotated_plans table created');
            
            client.release();
            
            console.log('✅ All test result tables created successfully');
            
        } catch (error) {
            client.release();
            console.error('❌ Table creation failed:', error);
            throw error;
        }
    },
    
    /**
     * 📊 GET TABLE STATUS
     */
    async getTableStatus(dbPool) {
        const client = await dbPool.connect();
        
        try {
            const tables = ['test_executions', 'real_plan_analyses', 'lp6_generated_documents', 'uploaded_plans', 'annotated_plans'];
            const status = {};
            
            for (const table of tables) {
                const result = await client.query(`
                    SELECT COUNT(*) as count FROM ${table}
                `);
                status[table] = {
                    exists: true,
                    rowCount: parseInt(result.rows[0].count)
                };
            }
            
            client.release();
            
            return status;
            
        } catch (error) {
            client.release();
            return null;
        }
    }
};

export default TestResultsSchema;

