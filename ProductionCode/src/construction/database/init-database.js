#!/usr/bin/env node

/**
 * 🗄️ DATABASE INITIALIZATION SCRIPT
 * =================================
 * 
 * Sets up PostgreSQL database for Construction Syndicate LP6 system
 * Creates all tables, indexes, and loads initial data
 * 
 * Usage: node init-database.js
 * 
 * @author Elite Construction AI Syndicate
 * @version 1.0.0
 */

import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'construction_syndicate',
    user: process.env.DB_USER || 'construction_user',
    password: process.env.DB_PASSWORD || 'construction_password'
};

console.log('🗄️ CONSTRUCTION SYNDICATE DATABASE INITIALIZATION');
console.log('================================================');
console.log(`Host: ${config.host}:${config.port}`);
console.log(`Database: ${config.database}`);
console.log(`User: ${config.user}`);
console.log('');

async function initializeDatabase() {
    let adminPool;
    let pool;
    
    try {
        // Step 1: Create database if it doesn't exist
        console.log('📋 Step 1: Checking database existence...');
        
        // Connect to postgres database first
        adminPool = new Pool({
            ...config,
            database: 'postgres'
        });
        
        // Check if database exists
        const dbCheckResult = await adminPool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [config.database]
        );
        
        if (dbCheckResult.rows.length === 0) {
            console.log(`   Creating database '${config.database}'...`);
            await adminPool.query(`CREATE DATABASE ${config.database}`);
            console.log('   ✅ Database created');
        } else {
            console.log('   ✅ Database already exists');
        }
        
        await adminPool.end();
        
        // Step 2: Connect to our database
        console.log('\n📋 Step 2: Connecting to construction database...');
        pool = new Pool(config);
        
        // Test connection
        await pool.query('SELECT NOW()');
        console.log('   ✅ Connected successfully');
        
        // Step 3: Run setup SQL script
        console.log('\n📋 Step 3: Running database setup script...');
        
        const sqlPath = path.join(__dirname, 'setup-construction-db.sql');
        const sqlContent = await fs.readFile(sqlPath, 'utf8');
        
        // Split SQL into individual statements (simple approach)
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));
        
        let created = 0;
        let skipped = 0;
        
        for (const statement of statements) {
            try {
                // Skip comments and CREATE DATABASE statements
                if (statement.includes('CREATE DATABASE') || 
                    statement.includes('\\c construction_syndicate')) {
                    continue;
                }
                
                await pool.query(statement + ';');
                created++;
                
                // Log important creates
                if (statement.includes('CREATE TABLE')) {
                    const tableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
                    if (tableName) {
                        console.log(`   ✅ Table: ${tableName}`);
                    }
                } else if (statement.includes('CREATE INDEX')) {
                    const indexName = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/)?.[1];
                    if (indexName) {
                        console.log(`   ✅ Index: ${indexName}`);
                    }
                }
            } catch (error) {
                if (error.message.includes('already exists')) {
                    skipped++;
                } else {
                    console.error(`   ❌ Error in statement: ${error.message}`);
                    console.error(`      Statement: ${statement.substring(0, 100)}...`);
                }
            }
        }
        
        console.log(`\n   Summary: ${created} objects created, ${skipped} already existed`);
        
        // Step 4: Verify setup
        console.log('\n📋 Step 4: Verifying database setup...');
        
        // Check tables
        const tablesResult = await pool.query(`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        `);
        
        console.log(`   ✅ Tables created: ${tablesResult.rows.length}`);
        
        const importantTables = [
            'materials',
            'current_prices',
            'din276_groups',
            'construction_projects',
            'detected_elements',
            'measurement_tracking',
            'tender_positions'
        ];
        
        for (const table of importantTables) {
            const exists = tablesResult.rows.some(r => r.tablename === table);
            console.log(`      ${exists ? '✅' : '❌'} ${table}`);
        }
        
        // Check indexes
        const indexResult = await pool.query(`
            SELECT COUNT(*) as count 
            FROM pg_indexes 
            WHERE schemaname = 'public'
        `);
        
        console.log(`   ✅ Indexes created: ${indexResult.rows[0].count}`);
        
        // Check initial data
        const din276Result = await pool.query('SELECT COUNT(*) as count FROM din276_groups');
        const materialsResult = await pool.query('SELECT COUNT(*) as count FROM materials');
        const indicesResult = await pool.query('SELECT COUNT(*) as count FROM market_indices');
        
        console.log(`   ✅ Initial data loaded:`);
        console.log(`      DIN 276 groups: ${din276Result.rows[0].count}`);
        console.log(`      Materials: ${materialsResult.rows[0].count}`);
        console.log(`      Market indices: ${indicesResult.rows[0].count}`);
        
        // Step 5: Create application user
        console.log('\n📋 Step 5: Setting up application user...');
        
        try {
            // Check if user exists
            const userResult = await pool.query(
                "SELECT 1 FROM pg_user WHERE usename = $1",
                ['construction_app']
            );
            
            if (userResult.rows.length === 0) {
                // Create user
                await pool.query("CREATE USER construction_app WITH PASSWORD 'secure_password_change_me'");
                console.log('   ✅ User created: construction_app');
            } else {
                console.log('   ✅ User already exists: construction_app');
            }
            
            // Grant permissions
            await pool.query('GRANT CONNECT ON DATABASE ' + config.database + ' TO construction_app');
            await pool.query('GRANT USAGE ON SCHEMA public TO construction_app');
            await pool.query('GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO construction_app');
            await pool.query('GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO construction_app');
            console.log('   ✅ Permissions granted');
            
        } catch (error) {
            console.warn('   ⚠️ Could not create application user:', error.message);
            console.log('      (This may require superuser privileges)');
        }
        
        // Step 6: Test functions
        console.log('\n📋 Step 6: Testing database functions...');
        
        try {
            // Test regional price function
            const priceResult = await pool.query(
                "SELECT * FROM get_regional_price('330', 'münchen')"
            );
            console.log('   ✅ get_regional_price function works');
            
            // Test update trigger
            await pool.query(
                "UPDATE materials SET name = name WHERE material_code = 'C25/30'"
            );
            console.log('   ✅ Update triggers work');
            
        } catch (error) {
            console.warn('   ⚠️ Function test failed:', error.message);
        }
        
        // Success!
        console.log('\n' + '='.repeat(50));
        console.log('✅ DATABASE INITIALIZATION COMPLETE!');
        console.log('='.repeat(50));
        console.log('\nConnection details for your application:');
        console.log(`  Host: ${config.host}`);
        console.log(`  Port: ${config.port}`);
        console.log(`  Database: ${config.database}`);
        console.log(`  User: construction_app`);
        console.log(`  Password: [Set in environment variable]`);
        console.log('\nEnvironment variables to set:');
        console.log(`  export DB_HOST="${config.host}"`);
        console.log(`  export DB_PORT="${config.port}"`);
        console.log(`  export DB_NAME="${config.database}"`);
        console.log(`  export DB_USER="construction_app"`);
        console.log(`  export DB_PASSWORD="your_secure_password"`);
        
    } catch (error) {
        console.error('\n❌ DATABASE INITIALIZATION FAILED');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n⚠️ Could not connect to PostgreSQL');
            console.error('Make sure PostgreSQL is running and accessible at:');
            console.error(`  ${config.host}:${config.port}`);
            console.error('\nOn macOS: brew services start postgresql');
            console.error('On Linux: sudo systemctl start postgresql');
        } else if (error.code === '28P01') {
            console.error('\n⚠️ Authentication failed');
            console.error('Check your database credentials');
        }
        
        process.exit(1);
        
    } finally {
        if (pool) {
            await pool.end();
        }
    }
}

// Load sample data (optional)
async function loadSampleData(pool) {
    console.log('\n📋 Loading sample data...');
    
    try {
        // Insert sample materials with current prices
        const sampleMaterials = [
            {
                code: 'CONCRETE_C30',
                name: 'Beton C30/37 mit Bewehrung',
                din: 'DIN EN 206',
                density: 2400,
                price: 450,
                unit: 'm³'
            },
            {
                code: 'WALL_KS20',
                name: 'Kalksandstein KS 20-2,0',
                din: 'DIN V 106',
                density: 2000,
                price: 120,
                unit: 'm²'
            },
            {
                code: 'INSULATION_MW040',
                name: 'Mineralwolle WLG 040',
                din: 'DIN EN 13162',
                density: 30,
                price: 25,
                unit: 'm²'
            }
        ];
        
        for (const material of sampleMaterials) {
            // Insert material
            const materialResult = await pool.query(
                `INSERT INTO materials (material_code, name, din_standard, density) 
                 VALUES ($1, $2, $3, $4) 
                 ON CONFLICT (material_code) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id`,
                [material.code, material.name, material.din, material.density]
            );
            
            const materialId = materialResult.rows[0].id;
            
            // Insert price for multiple regions
            const regions = ['münchen', 'berlin', 'hamburg', 'default'];
            
            for (const region of regions) {
                const regionalFactor = region === 'münchen' ? 1.25 :
                                     region === 'berlin' ? 1.05 :
                                     region === 'hamburg' ? 1.15 : 1.0;
                
                await pool.query(
                    `INSERT INTO current_prices 
                     (material_id, region, unit_price, unit, material_cost, labor_cost, source, confidence, valid_from, valid_until)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year')
                     ON CONFLICT DO NOTHING`,
                    [
                        materialId,
                        region,
                        material.price * regionalFactor,
                        material.unit,
                        material.price * regionalFactor * 0.55,
                        material.price * regionalFactor * 0.45,
                        'Sample Data',
                        0.75
                    ]
                );
            }
        }
        
        console.log('   ✅ Sample materials and prices loaded');
        
        // Insert sample project
        const projectResult = await pool.query(
            `INSERT INTO construction_projects 
             (project_number, project_name, client, location, region, building_type, floors, gross_floor_area, quality_level)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (project_number) DO NOTHING
             RETURNING id`,
            [
                'FB-2024-001',
                'Mehrfamilienhaus Friedberger Landstraße',
                'Bethmanns am Park GmbH',
                'Frankfurt am Main',
                'frankfurt',
                'Mehrfamilienhaus',
                7,
                5420.5,
                'standard'
            ]
        );
        
        if (projectResult.rows.length > 0) {
            console.log('   ✅ Sample project created');
        }
        
    } catch (error) {
        console.warn('   ⚠️ Could not load sample data:', error.message);
    }
}

// Run initialization
initializeDatabase().catch(console.error);
