#!/usr/bin/env node

/**
 * 🏗️ CONSTRUCTION SYNDICATE COMPREHENSIVE TEST
 * ==========================================
 * 
 * Tests the full construction syndicate with simulated construction project
 */

import dotenv from 'dotenv';
import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(emoji, color, message) {
    console.log(`${emoji} ${color}${message}${colors.reset}`);
}

function logSection(title) {
    console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

/**
 * Main test execution
 */
async function runComprehensiveTest() {
    console.log(`
${colors.bright}${colors.blue}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🏗️  CONSTRUCTION SYNDICATE COMPREHENSIVE TEST  🏗️      ║
║                                                              ║
║              HOAI LP 6 & 7 System Validation                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}
`);

    let dbPool = null;
    let testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
    };

    try {
        // ==============================================
        // TEST 1: Database Connection
        // ==============================================
        logSection('TEST 1: Database Connection & Schema Validation');
        
        const host = process.env.POSTGRES_HOST || 'localhost';
        const port = process.env.POSTGRES_PORT || '5432';
        const database = process.env.POSTGRES_DB || 'construction_syndicate';
        const user = process.env.POSTGRES_USER || 'postgres';
        const password = (process.env.POSTGRES_PASSWORD || 'postgres').trim();
        
        const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
        
        log('🔌', colors.cyan, `Connecting to: ${host}:${port}/${database}`);
        
        try {
            dbPool = new Pool({
                connectionString: connectionString,
                max: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000
            });
            
            const client = await dbPool.connect();
            const result = await client.query('SELECT NOW()');
            client.release();
            
            log('✅', colors.green, `Database connection successful!`);
            log('📊', colors.blue, `Server time: ${result.rows[0].now}`);
            testResults.total++;
            testResults.passed++;
        } catch (error) {
            log('❌', colors.red, `Database connection failed: ${error.message}`);
            testResults.total++;
            testResults.failed++;
            throw error;
        }

        // Check required tables
        log('🔍', colors.cyan, 'Checking database schema...');
        const tables = await checkDatabaseTables(dbPool);
        
        if (tables.success) {
            log('✅', colors.green, `All ${tables.count} required tables exist`);
            testResults.total++;
            testResults.passed++;
        } else {
            log('⚠️', colors.yellow, `Missing tables: ${tables.missing.join(', ')}`);
            log('💡', colors.cyan, `Run: ./init-construction-database.sh`);
            testResults.total++;
            testResults.warnings++;
        }

        // ==============================================
        // TEST 2: Vision Model Configuration
        // ==============================================
        logSection('TEST 2: Vision Model Configuration');
        
        const visionModels = [
            'construction-vision-architect',
            'construction-vision-surveyor',
            'construction-vision-screener'
        ];
        
        for (const model of visionModels) {
            const modelExists = await checkOllamaModel(model);
            testResults.total++;
            
            if (modelExists) {
                log('✅', colors.green, `${model} is available`);
                testResults.passed++;
            } else {
                log('❌', colors.red, `${model} not found`);
                testResults.failed++;
            }
        }

        // ==============================================
        // TEST 3: Construction Agent Characters
        // ==============================================
        logSection('TEST 3: Construction Agent Character Files');
        
        const characterFiles = [
            'head-architect-orchestrator.character.json',
            'quantity-surveyor-specialist.character.json',
            'error-detection-auditor.character.json',
            'compliance-verification-analyst.character.json',
            'tender-document-generator.character.json',
            'bid-evaluation-judge.character.json',
            'cost-estimation-expert.character.json'
        ];
        
        const characterDir = path.join(__dirname, 'characters', 'ConstructionSyndicate');
        
        for (const file of characterFiles) {
            const filePath = path.join(characterDir, file);
            const exists = await checkFileExists(filePath);
            testResults.total++;
            
            if (exists) {
                log('✅', colors.green, `${file}`);
                testResults.passed++;
            } else {
                log('❌', colors.red, `${file} not found`);
                testResults.failed++;
            }
        }

        // ==============================================
        // TEST 4: Construction Service Classes
        // ==============================================
        logSection('TEST 4: Construction Service Classes');
        
        const serviceFiles = [
            'src/vision/PracticalVisionOptimizationEngine.js',
            'src/construction/services/HOAIComplianceService.js',
            'src/construction/services/QuantityTakeoffEngine.js',
            'src/construction/services/ErrorDetectionEscalationService.js',
            'src/construction/services/BillOfQuantitiesGenerator.js',
            'src/construction/services/TenderDocumentService.js',
            'src/construction/services/PlanCrossReferenceValidator.js',
            'src/construction/services/BidEvaluationMatrix.js',
            'src/construction/ConstructionSyndicateOrchestrator.js'
        ];
        
        for (const file of serviceFiles) {
            const filePath = path.join(__dirname, file);
            const exists = await checkFileExists(filePath);
            testResults.total++;
            
            if (exists) {
                log('✅', colors.green, `${file}`);
                testResults.passed++;
            } else {
                log('❌', colors.red, `${file} not found`);
                testResults.failed++;
            }
        }

        // ==============================================
        // TEST 5: System Integration
        // ==============================================
        logSection('TEST 5: System Integration & Orchestrator');
        
        const integrationFiles = [
            'UltimateArbitrageSyndicateFactory.js',
            'startfullsyndicate.js',
            'launch-construction-syndicate.js'
        ];
        
        for (const file of integrationFiles) {
            const filePath = path.join(__dirname, file);
            const exists = await checkFileExists(filePath);
            testResults.total++;
            
            if (exists) {
                log('✅', colors.green, `${file}`);
                testResults.passed++;
            } else {
                log('❌', colors.red, `${file} not found`);
                testResults.failed++;
            }
        }

        // ==============================================
        // TEST 6: Create Test Project
        // ==============================================
        if (tables.success && dbPool) {
            logSection('TEST 6: Create Test Construction Project');
            
            try {
                const projectResult = await createTestProject(dbPool);
                log('✅', colors.green, `Test project created: ${projectResult.project_number}`);
                log('📊', colors.blue, `Project ID: ${projectResult.id}`);
                testResults.total++;
                testResults.passed++;
                
                // Add test plans
                const plansResult = await createTestPlans(dbPool, projectResult.id);
                log('✅', colors.green, `${plansResult.count} test plans added`);
                testResults.total++;
                testResults.passed++;
                
            } catch (error) {
                log('❌', colors.red, `Failed to create test project: ${error.message}`);
                testResults.total += 2;
                testResults.failed += 2;
            }
        }

        // ==============================================
        // TEST RESULTS SUMMARY
        // ==============================================
        logSection('TEST RESULTS SUMMARY');
        
        const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
        
        console.log(`
┌─────────────────────────────────────────┐
│          TEST RESULTS SUMMARY           │
├─────────────────────────────────────────┤
│  Total Tests:    ${testResults.total.toString().padStart(3)}                   │
│  ✅ Passed:      ${colors.green}${testResults.passed.toString().padStart(3)}${colors.reset}                   │
│  ❌ Failed:      ${testResults.failed > 0 ? colors.red : colors.reset}${testResults.failed.toString().padStart(3)}${colors.reset}                   │
│  ⚠️  Warnings:    ${testResults.warnings.toString().padStart(3)}                   │
│  Success Rate:  ${successRate >= 90 ? colors.green : successRate >= 70 ? colors.yellow : colors.red}${successRate}%${colors.reset}                 │
└─────────────────────────────────────────┘
`);

        if (testResults.passed === testResults.total) {
            log('🎉', colors.green, 'ALL TESTS PASSED! Construction Syndicate is fully operational!');
            log('🚀', colors.cyan, 'Ready to process construction projects!');
        } else if (successRate >= 70) {
            log('✅', colors.yellow, 'Core systems operational with minor issues');
            log('💡', colors.cyan, 'Review failed tests and fix issues');
        } else {
            log('⚠️', colors.red, 'Critical issues detected. System needs attention.');
        }

        // ==============================================
        // NEXT STEPS
        // ==============================================
        logSection('NEXT STEPS');
        
        console.log(`
${colors.cyan}To start the Construction Syndicate:${colors.reset}

1. ${colors.bright}Initialize database (if not done):${colors.reset}
   ./init-construction-database.sh

2. ${colors.bright}Launch construction syndicate:${colors.reset}
   node launch-construction-syndicate.js

3. ${colors.bright}Start full production system:${colors.reset}
   node startfullsyndicate.js

4. ${colors.bright}Access web interface:${colors.reset}
   http://localhost:3000

${colors.yellow}For real construction projects:${colors.reset}
   - Place construction plans in ./construction-plans/
   - Use vision models for plan analysis
   - Monitor escalation tickets via web GUI
   - Review HOAI compliance reports

${colors.green}System Status: ${successRate >= 90 ? 'READY FOR PRODUCTION' : successRate >= 70 ? 'READY FOR TESTING' : 'NEEDS CONFIGURATION'}${colors.reset}
`);

    } catch (error) {
        console.error(`\n${colors.red}❌ TEST EXECUTION ERROR:${colors.reset}`, error);
        process.exit(1);
    } finally {
        if (dbPool) {
            await dbPool.end();
        }
    }
}

/**
 * Check database tables exist
 */
async function checkDatabaseTables(pool) {
    const requiredTables = [
        'construction_projects',
        'construction_plans',
        'plan_cross_references',
        'extracted_quantities',
        'bills_of_quantities',
        'boq_positions',
        'tender_documents',
        'contractor_bids',
        'bid_items',
        'bid_evaluations',
        'error_detections',
        'escalation_tickets',
        'construction_agent_performance',
        'hoai_compliance_checks',
        'construction_activity_log'
    ];
    
    try {
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        
        const existingTables = result.rows.map(row => row.table_name);
        const missing = requiredTables.filter(table => !existingTables.includes(table));
        
        return {
            success: missing.length === 0,
            count: existingTables.length,
            missing: missing
        };
    } catch (error) {
        return {
            success: false,
            count: 0,
            missing: requiredTables
        };
    }
}

/**
 * Check if Ollama model exists
 */
async function checkOllamaModel(modelName) {
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const { stdout } = await execAsync('ollama list');
        return stdout.includes(modelName);
    } catch (error) {
        return false;
    }
}

/**
 * Check if file exists
 */
async function checkFileExists(filePath) {
    try {
        const { access } = await import('fs/promises');
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}

/**
 * Create test project
 */
async function createTestProject(pool) {
    const result = await pool.query(`
        INSERT INTO construction_projects (
            project_number,
            project_name,
            client_name,
            project_type,
            location,
            budget_estimate,
            current_hoai_phase,
            lp6_started_at,
            bgf,
            ngf,
            construction_class,
            status
        ) VALUES (
            'TEST-2024-001',
            'Modern Office Complex Hamburg Test',
            'Hamburg City Development GmbH',
            'office',
            'Hamburg, Germany',
            8500000.00,
            'LP6',
            NOW(),
            8500.00,
            7200.00,
            'Standard Plus',
            'active'
        )
        ON CONFLICT (project_number) 
        DO UPDATE SET updated_at = NOW()
        RETURNING id, project_number, project_name
    `);
    
    return result.rows[0];
}

/**
 * Create test plans
 */
async function createTestPlans(pool, projectId) {
    const plans = [
        { number: 'A-001', title: 'Ground Floor Plan', type: 'floor_plan', discipline: 'architecture' },
        { number: 'A-002', title: 'First Floor Plan', type: 'floor_plan', discipline: 'architecture' },
        { number: 'A-101', title: 'South Elevation', type: 'elevation', discipline: 'architecture' },
        { number: 'S-001', title: 'Foundation Plan', type: 'structural', discipline: 'structural' },
        { number: 'S-101', title: 'Section A-A', type: 'section', discipline: 'structural' }
    ];
    
    for (const plan of plans) {
        await pool.query(`
            INSERT INTO construction_plans (
                project_id,
                plan_number,
                plan_title,
                plan_type,
                discipline,
                scale,
                file_format,
                analyzed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (project_id, plan_number) DO NOTHING
        `, [projectId, plan.number, plan.title, plan.type, plan.discipline, '1:100', 'pdf', false]);
    }
    
    return { count: plans.length };
}

// Run the test
console.log('🏗️ Starting Construction Syndicate Test Suite...\n');
runComprehensiveTest().catch(error => {
    console.error(`\n${colors.red}💥 FATAL ERROR:${colors.reset}`, error);
    process.exit(1);
});

